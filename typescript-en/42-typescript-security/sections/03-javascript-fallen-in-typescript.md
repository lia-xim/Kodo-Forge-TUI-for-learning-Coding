# Section 3: JavaScript Pitfalls in TypeScript

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Dangerous TypeScript Patterns](./02-gefaehrliche-typescript-muster.md)
> Next section: [04 - Runtime Validation as Protection](./04-runtime-validierung-als-schutz.md)

---

## What you'll learn here

- Six JavaScript security pitfalls that TypeScript **completely ignores**
- What Prototype Pollution is and why it's so dangerous
- What XSS, ReDoS, and insecure deserialization look like in TypeScript code
- How Angular's security APIs (DomSanitizer, XSRF) close these gaps

---

## Background: JavaScript is 30 years old

JavaScript was written in 1995 by Brendan Eich in **10 days**. Some of those
decisions made sense at the time, some were mistakes, and many have security
implications that weren't fully understood until decades later.

TypeScript is a superset of JavaScript — meaning: **every valid JavaScript
code is also valid TypeScript code**. TypeScript adds the type system on top,
but the JavaScript semantics underneath remain unchanged.

If JavaScript has a security vulnerability, TypeScript has it too.
The type system is not a protective wall against the past.

---

## Pitfall 1: Prototype Pollution

Prototype Pollution is one of the most dangerous JavaScript vulnerabilities,
and TypeScript is completely blind to it.

```typescript annotated
// BACKGROUND: JavaScript's prototype chain
// Every object inherits from Object.prototype
// { }.toString === Object.prototype.toString

// THE PITFALL: JSON.parse with malicious data
const userInput = '{"__proto__": {"isAdmin": true}}';
const parsed = JSON.parse(userInput);

// IMPORTANT: Object.assign({}, parsed) is SAFE in modern engines!
// __proto__ is copied as an OWN property, not as a prototype.
const config = Object.assign({}, parsed);
console.log(config.__proto__);  // { isAdmin: true } — own property!
console.log({}.isAdmin);        // undefined — NO pollution!

// The REAL dangers are:

// Danger 1: Deep-merge functions (lodash < 4.17.21, CVE-2019-10744)
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): void {
  for (const key in source) {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key] as Record<string, unknown>,
                source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
}

// The poisoned payload:
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
const defaults = {};
deepMerge(defaults, payload);
// defaults.__proto__.isAdmin = true → Object.prototype.isAdmin = true!
console.log({}.isAdmin);  // true — EVERY object is now "admin"!
```

> **Important:** `Object.assign({}, obj)` and spread `{...obj}` are safe in
> modern JavaScript engines — they copy `__proto__` as an own property, but
> do NOT change the prototype.
>
> The REAL dangers are:
> 1. **Deep-merge functions** that recursively traverse `__proto__`
>    (affected: lodash < 4.17.21, many custom utilities)
> 2. **Manual copy loops** without `hasOwnProperty` checks
> 3. **Directly manipulating `Object.prototype`** (e.g. in tests)
>
> **Protection:** Check `Object.hasOwn(obj, key)` instead of `key in obj`,
> and NEVER use `JSON.parse` results without validation.

```typescript annotated
// SAFE: Property copy with __proto__ filter
function safeMerge(userConfig: unknown): Record<string, unknown> {
  if (typeof userConfig !== "object" || userConfig === null) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(userConfig)) {
    // Explicitly exclude critical keys
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    result[key] = (userConfig as Record<string, unknown>)[key];
  }
  return result;
}

// Even better: runtime validation with Zod (see Section 02)
import { z } from "zod";
const ConfigSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  fontSize: z.number().min(8).max(72).default(16),
});

const safeConfig = ConfigSchema.parse(JSON.parse(userInput));
// Throws if __proto__ or other unexpected keys are present
```

**Real CVEs caused by Prototype Pollution:**
- `lodash` CVE-2019-10744: `_.merge()` poisoned `Object.prototype`
- `jquery` CVE-2019-11358: `$.extend()` was vulnerable
- **TypeScript-typed versions were NOT protected** — the type system
  does NOT guard against runtime pollution

---

## Pitfall 2: eval() and the Function() constructor

```typescript annotated
// eval() executes arbitrary code — TypeScript does not check the content
function calculateFormula(expression: string): number {
  // DANGEROUS: eval() with user input
  return eval(expression);
  // ^ TypeScript: return type is any — no warning!
  // If expression = "process.exit(0)": app is terminated
  // If expression = "require('fs').unlinkSync('/etc/passwd')": filesystem access
}

// The Function() constructor is equally dangerous:
function createFunction(code: string): () => void {
  return new Function(code) as () => void;
  // ^ Identical to eval() in terms of security risks
  // TypeScript sees: return type is Function → cast to () => void → OK
}

// SAFE: Parse expressions instead of evaluating them
// For mathematical formulas: write your own parser or
// use a safe library like math.js (which does NOT use eval())
function calculateSafeFormula(expression: string): number {
  // Only allowed characters: digits, operators, brackets
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    throw new Error(`Invalid formula: ${expression}`);
  }
  // Still somewhat problematic — better: a proper parser
  // But significantly safer than direct eval()
  return Function(`"use strict"; return (${expression})`)() as number;
}
```

---

## Pitfall 3: JSON.parse without validation

`JSON.parse` is one of the most commonly used functions in JavaScript/TypeScript —
and one of the most dangerous when the result is not validated.

```typescript annotated
// JSON.parse returns 'any' — that's not a coincidence
// TypeScript knows: what JSON contains is unknown at compile time

// DANGEROUS: Direct use without checking
function loadSettings(): UserSettings {
  const raw = localStorage.getItem('settings') ?? '{}';
  return JSON.parse(raw) as UserSettings;
  // ^ What if someone manually edited localStorage?
  // What if another script corrupted it?
  // What if JSON.parse throws? (invalid JSON syntax)
  // as-cast provides no answers — TypeScript stays silent
}

// BACKGROUND: JSON.parse can also return non-objects
JSON.parse('42')         // → 42 (number)
JSON.parse('"hello"')    // → "hello" (string)
JSON.parse('null')       // → null
JSON.parse('[1,2,3]')    // → [1, 2, 3] (Array)
// all of these have the TypeScript type 'any'

// SAFE: try-catch + validation
function loadSettingsSafe(): UserSettings {
  const raw = localStorage.getItem('settings');
  if (!raw) return defaultSettings;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // JSON.parse throws on invalid JSON — do NOT ignore this!
    console.warn('Corrupted settings in localStorage, using defaults');
    return defaultSettings;
  }

  // Now: parsed is unknown → forces validation
  return validateSettings(parsed) ?? defaultSettings;
}
```

---

## Pitfall 4: XSS via template literals and innerHTML

Cross-Site Scripting (XSS) is the most common web security vulnerability.
TypeScript doesn't help here — that's Angular's job.

```typescript annotated
// DANGEROUS: innerHTML with user data
@Component({
  selector: 'app-comment',
  template: `<div #commentBox></div>`
})
export class CommentComponent {
  @ViewChild('commentBox') box!: ElementRef;

  showComment(text: string): void {
    // DANGEROUS: innerHTML with uncontrolled text
    this.box.nativeElement.innerHTML = `<p>${text}</p>`;
    // ^ If text = '<script>stealPasswords()</script>':
    // XSS attack! TypeScript type of text is 'string' — all fine for the compiler
    // But the browser executes the script
  }

  // SAFE: Angular's DomSanitizer
  constructor(private sanitizer: DomSanitizer) {}

  showCommentSafe(text: string): void {
    const safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, text);
    if (safeHtml !== null) {
      this.box.nativeElement.innerHTML = safeHtml;
      // DomSanitizer removes dangerous HTML elements/attributes
    }
  }

  // EVEN BETTER: Use Angular's template binding
  // {{ text }} in templates is automatically escaped — NO XSS possible
  // [innerHTML]="text" triggers Angular's sanitizer automatically
  // bypassSecurityTrustHtml() is NOT the solution — it disables the protection!
}
```

**Why Angular's template syntax is secure:**

Angular's `{{ expression }}` in templates automatically performs HTML escaping.
`<script>` becomes `&lt;script&gt;`. That's the reason Angular templates are
XSS-safe by default — not because TypeScript prevents it, but because the
Angular renderer does.

---

## Pitfall 5: ReDoS — Regular Expression Denial of Service

```typescript annotated
// ReDoS: Malicious strings can cause exponentially long execution times
// TypeScript type of RegExp input is 'string' — no protection

// DANGEROUS: Catastrophic backtracking through nested quantifiers
const EMAIL_REGEX = /^([a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
// ^ The pattern (a+)* is exploitable

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
  // ^ With email = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@':
  // The regex engine takes exponentially long — Node.js blocks!
  // TypeScript type: string → boolean — no hint of the problem
}

// SAFE: Simpler regex or timeout protection
// For email validation: use the npm package 'validator' or
// simple heuristic instead of complex regex:
function emailLooksValid(email: string): boolean {
  // Simple check without backtracking risk:
  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex === email.length - 1) return false;
  const domain = email.slice(atIndex + 1);
  return domain.includes('.') && domain.length >= 4;
}
```

---

## Pitfall 6: Insecure Deserialization

```typescript annotated
// localStorage and sessionStorage return string | null
// That's correct — but the null case is often ignored

// DANGEROUS: Multiple assumptions when accessing storage
function loadToken(): string {
  return localStorage.getItem('authToken')!;
  // ^ Non-null assertion without checking
  // If no token exists: null — but we promised: string
  // When used as an Authorization header: "Authorization: Bearer null" (as a string!)
}

// EVEN MORE DANGEROUS: State-dependent deserialization
function loadUserStatus(): AdminStatus {
  const raw = sessionStorage.getItem('userStatus');
  const status = JSON.parse(raw ?? '{}');
  return status;
  // ^ What if raw = '{"isAdmin": true}'?
  // Who wrote that? When? Is it still current?
  // Server-side state should NOT live in client storage!
  // TypeScript sees: return type AdminStatus — agreed. But completely wrong.
}

// SAFE: Always authorize from the server, not from client storage
function isAdministrator(): Observable<boolean> {
  // Not: read from localStorage
  // Instead: verify with the server on every relevant request
  return this.authService.checkPermissions(['admin']);
  // The server always has the final say — client storage is insecure
}
```

---

> 🧠 **Explain to yourself:** Angular has built-in XSRF protection.
> How does it work, and why can't TypeScript replace it?
>
> **Key points:** XSRF (Cross-Site Request Forgery) is a runtime attack |
> Angular's HttpClient automatically sends an XSRF token in the header |
> The token proves to the server: this request comes from the real app |
> TypeScript only checks types — it has no knowledge of HTTP headers or browser
> security models | Framework security features don't replace TypeScript
> and vice versa

---

> 💭 **Think about it:** Prototype Pollution sounds abstract. Can you imagine
> how it could cause damage in a real Angular app?
>
> **Answer:** Imagine: your app has an `isAdmin` check:
> `if (user.isAdmin) { ... }`. Through Prototype Pollution, an attacker sets
> `Object.prototype.isAdmin = true`. Now **every** object in your app has
> `isAdmin: true` — all user objects, all config objects, all guards.
> The Angular route guard asks `user.isAdmin` and gets `true` — even
> for ordinary users. TypeScript never reported a single error the whole time.

---

## What you've learned

- **Prototype Pollution** poisons `Object.prototype` and affects all
  objects in the app — TypeScript doesn't see it
- **`eval()` and `Function()`** execute arbitrary code; TypeScript
  doesn't check the content of string arguments
- **`JSON.parse`** returns `any` and can throw — both must be handled
- **XSS** is a DOM problem; Angular's template binding and `DomSanitizer`
  protect against it, not TypeScript
- **ReDoS** can block Node.js; complex regex with user input
  is a hidden risk
- **Client storage** is insecure for security-relevant state
  information; the server must remain the authority

**Core concept to remember:** TypeScript is a compile-time tool.
Prototype Pollution, XSS, ReDoS, and injection attacks are runtime
phenomena. These worlds don't overlap — that's why security must
be considered at both levels.

---

> **Pause point** — You've learned about the JavaScript pitfalls that
> TypeScript remains blind to. That's not a failure of TypeScript —
> it was never designed for that.
>
> Continue with: [Section 04: Runtime Validation as Protection](./04-runtime-validierung-als-schutz.md)