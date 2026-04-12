# Section 6: Security Checklist and Code Review

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Parse, don't validate](./05-parse-dont-validate.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- A **practical PR review checklist** with 8 concrete red flags
- Which **ESLint rules** automatically prevent the worst patterns
- When Angular's `DomSanitizer.bypassSecurityTrust*()` is justified —
  and when it signals a security problem
- How to spread security knowledge within your team without being annoying

---

## Background: Code Review as a Security Gate

In 2014, the Heartbleed bug was disclosed — one of the most severe security
vulnerabilities in the history of the internet. A simple buffer overflow in
OpenSSL that had been sitting in the code for two years. The code had been
reviewed by experts. Yet the bug remained invisible.

Robin Seggelmann, the developer who introduced the bug, later said:
"I forgot to validate the length." No malicious intent, just a
forgotten check.

What would have helped? A clear checklist. Not "check whether the code
looks correct", but concrete questions: "Is the length validated here?
Is this input validated?" Code reviews without a checklist are ineffective —
reviewers look for the wrong things or look in the wrong places.

This section gives you exactly that: **8 concrete questions** you can ask
on every TypeScript PR.

---

## The 8 Red Flags in Code Review

```typescript annotated
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 1: 'as' for external data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: as without prior validation
const user = await fetch('/api/user').then(r => r.json()) as User;
// Why dangerous: The API could return any arbitrary object.
// 'as' tells the compiler "trust me" — the compiler does. Blindly.

// ✅ FIX: Use a type guard
const raw = await fetch('/api/user').then(r => r.json());
const user = parseUser(raw);  // Throw ParseError if invalid
// Or with result pattern:
const result = safeParseUser(raw);
if (!result.ok) throw new Error(`Invalid API response: ${result.error.message}`);
const user = result.value;    // Here: safe, TypeScript knows it

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 2: Non-null assertion without explanation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: ! without comment or check
const element = document.getElementById('app')!;
// Why dangerous: If 'app' doesn't exist → TypeError at runtime.
// The ! shifts the error from compile-time (visible) to runtime (invisible).

// ✅ FIX: Explicit check with explanatory error
const element = document.getElementById('app');
if (!element) {
  throw new Error('App container not found — was index.html loaded correctly?');
}
// Now: element is HTMLElement — TypeScript knows it through narrowing, no !

// Exception: @ViewChild in Angular is OK with ! when the lifecycle is correct:
// @ViewChild('myRef') myRef!: ElementRef;  // Used in ngAfterViewInit

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 3: JSON.parse without validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: JSON.parse directly with cast
const config = JSON.parse(localStorage.getItem('config') || '{}') as AppConfig;
// Two problems: (1) JSON.parse can throw on invalid JSON
//               (2) as AppConfig is unproven — someone could have edited localStorage

// ✅ FIX: try-catch + type check + fallback
function loadConfig(): AppConfig {
  const raw = localStorage.getItem('config');
  if (!raw) return defaultConfig;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('Corrupted config in localStorage');
    return defaultConfig;
  }
  return isAppConfig(parsed) ? parsed : defaultConfig;
  // isAppConfig is a type guard — checks structure and types
}
```

---

```typescript annotated
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 4: Object.assign with unknown sources
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: Blindly merging with foreign data
const merged = Object.assign({}, defaults, userInput);
// Prototype pollution! If userInput = { __proto__: { isAdmin: true } }
// Object.prototype gets poisoned — all objects get isAdmin: true

// ✅ FIX: Object.create(null) + whitelist
const ALLOWED_KEYS = ['language', 'theme', 'fontSize'] as const;
const safe = Object.create(null) as Record<string, unknown>;
for (const key of ALLOWED_KEYS) {
  if (key in (userInput as object)) {
    safe[key] = (userInput as Record<string, unknown>)[key];
  }
}
// Object.create(null) has NO prototype — __proto__ attacks have no target

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 5: any in function signatures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: any as parameter or return type
function process(data: any): any {
  return data.result.value;
  // Typo? Structural problem? TypeScript says nothing.
}

// ✅ FIX: unknown + narrowing OR generics
function processSafely(data: unknown): string {
  if (typeof data !== 'object' || data === null) throw new TypeError('Not an object');
  const v = data as Record<string, unknown>;
  if (typeof v['result'] !== 'object' || v['result'] === null) throw new TypeError('result missing');
  const result = v['result'] as Record<string, unknown>;
  if (typeof result['value'] !== 'string') throw new TypeError('value: expected string');
  return result['value'];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 6: Direct URL parameters without validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: URL parameters used directly in logic
const id = route.snapshot.paramMap.get('id')!;
// id is string | null — the ! assertion is dangerous
// And even if not null: is it a valid ID?

// ✅ FIX: Validation + type-safe ID types
const rawId = route.snapshot.paramMap.get('id');
if (!rawId || !/^[a-z0-9-]{1,64}$/.test(rawId)) {
  this.router.navigate(['/404']);
  return;
}
const userId = rawId as UserId;  // as is OK: regex has proven the format

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 7: eval() or new Function()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: Code execution from strings
const result = eval(userInput);
const fn = new Function('data', userInput);

// ✅ FIX: Alternatives without eval
// Mathematical expressions: write a parser or use a safe library
// JSON: JSON.parse (not eval!)
// Templates: template engines that don't use eval (e.g. Mustache)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RED FLAG 8: innerHTML with user data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: Directly setting HTML
this.box.nativeElement.innerHTML = userContent;

// ✅ FIX: Angular template binding or DomSanitizer
// In templates: {{ userContent }} is automatically escaped
// For HTML content: DomSanitizer.sanitize(SecurityContext.HTML, content)
```

---

## ESLint Rules as an Automatic Safety Net

Not all red flags can be caught in code review — the reviewer is
tired, distracted, doesn't see every line. ESLint can help block the
most obvious patterns automatically:

```typescript annotated
// .eslintrc.json — these rules recommended for TypeScript projects:
{
  "rules": {
    // Prevents explicit 'any' in types and parameters:
    "@typescript-eslint/no-explicit-any": "error",
    // Allows exceptions when the developer REALLY needs it (e.g. library types)

    // Prevents ! non-null assertions:
    "@typescript-eslint/no-non-null-assertion": "warn",
    // "warn" instead of "error" because @ViewChild! in Angular is legitimate

    // Prevents unsafe assignments from any:
    "@typescript-eslint/no-unsafe-assignment": "error",
    // const x: User = apiData  // Error if apiData is 'any'

    // Prevents unsafe member access on any:
    "@typescript-eslint/no-unsafe-member-access": "error",
    // data.user  // Error if data is 'any'

    // Prevents unsafe returns of any:
    "@typescript-eslint/no-unsafe-return": "error",

    // Prevents type assertions that break fundamental rules:
    "@typescript-eslint/no-unsafe-type-assertion": "warn"
    // 42 as string  // Error — that is never safe
  }
}
```

**What ESLint cannot replace:** ESLint checks syntax and patterns, not semantics.
`parseUser(data)` looks just as good to ESLint as `data as User` if the
types align. Logical review remains necessary.

---

## Angular Context: DomSanitizer — When Bypass Is Justified

Angular has a built-in protection mechanism against XSS: the `DomSanitizer`
cleans dangerous HTML content. Sometimes it is necessary to bypass this
protection — but that is a decision with consequences:

```typescript annotated
@Component({ /* ... */ })
export class RichTextComponent {
  constructor(private sanitizer: DomSanitizer) {}

  // ❌ ALMOST NEVER CORRECT: bypassSecurityTrust... with user data
  unsafeHTML(userContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(userContent);
    // ^ Completely disables Angular's XSS protection!
    // If userContent contains user input: XSS vulnerability
    // Angular even prints a console warning when this is used
  }

  // ✅ CORRECT USAGE: sanitize() not bypass*()
  safeHTML(userContent: string): SafeHtml {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, userContent);
    // ^ sanitize() removes dangerous tags/attributes
    // <script> → removed, on* attributes → removed
    // Normal <b>, <i>, <p> is preserved
    return this.sanitizer.bypassSecurityTrustHtml(sanitized ?? '');
    // ^ bypass*() after sanitize() is OK — the content is now clean
  }

  // ✅ LEGITIMATE BYPASS: Your own trusted content (not user input)
  markdownRendered(markdownOutput: string): SafeHtml {
    // markdownOutput comes from our own Markdown renderer
    // The renderer produces only safe HTML — no user-input HTML
    return this.sanitizer.bypassSecurityTrustHtml(markdownOutput);
    // ^ bypass is legitimate here: we trust OUR OWN renderer
  }
}
```

**The rule of thumb:** `bypassSecurityTrust*()` is legitimate when the content
is **controlled by you** (your own renderer, static strings, server-side
sanitized HTML). It is **never** legitimate with uncontrolled user input.

---

## Experiment Box: Applying the Checklist Yourself

Here is a real code snippet — find all the red flags:

```typescript
// Task: How many problems do you see?

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private http: HttpClient, private router: Router) {}

  async updateProfile(formData: any): Promise<void> {
    const userId = localStorage.getItem('userId')!;
    const response = await this.http.put(
      `/api/users/${userId}/profile`,
      Object.assign({}, this.defaultProfile, formData)
    ).toPromise() as any;

    if (response.success) {
      const updatedUser = JSON.parse(response.userData) as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  private defaultProfile = {
    theme: 'light',
    language: 'de',
  };
}
```

Count the problems before reading on:

```
Answer — problems found (at least 6):

1. formData: any          → should be unknown, then validate
2. localStorage.getItem()! → Non-null assertion, userId could be null
3. userId directly in URL  → not validated (format, SQL injection)
4. Object.assign with formData → Prototype pollution if formData is external
5. .toPromise() as any    → loss of all type information
6. JSON.parse without try-catch → throws on invalid JSON (crash)
7. JSON.parse as User     → unvalidated cast after parsing
8. response.success as truth check → untyped (response is any)
```

No single problem is catastrophic — combined, they create a function
that can fail in multiple ways without any error message.

---

> 💭 **Think about it:** If your team wanted to introduce a no-`any` rule,
> what would be the biggest pushback? What argument would you hear —
> and how would you counter it?
>
> **Answer:** "It makes the code more complicated" — true in the short term.
> But: `any` is technical debt that charges interest. Every `any` today
> is an unnoticed runtime exception tomorrow. The learning curve for
> `unknown` + type guards is a matter of a week. The time saved because
> production bugs don't occur is months. Show concrete examples from
> your own codebase where `any` led to real bugs — that is more
> convincing than abstract arguments.

---

> 🧠 **Explain it to yourself:** What is the difference between ESLint rules
> and code review for security? What can ESLint do that review cannot —
> and vice versa?
>
> **Key points:** ESLint: consistent, automatic, cheap, checks syntax
> patterns | Review: understands semantics, sees context, finds logical errors |
> ESLint doesn't get tired, review does | ESLint can't check whether
> parseUser() is correctly implemented | Both together: best coverage |
> ESLint as first net, review as second

---

## What you've learned

- The **8 red flags** in TypeScript code review: `as` for external data,
  `!` without a check, `JSON.parse` without validation, blind `Object.assign`,
  `any` in signatures, unvalidated URL parameters, `eval()`, and `innerHTML`
- **ESLint rules** automate the simplest checks: `no-explicit-any`,
  `no-non-null-assertion`, `no-unsafe-assignment` are the minimum standard
- **`DomSanitizer.bypassSecurityTrust*()`** is legitimate for your own,
  trusted content — never for uncontrolled user input
- **Checklists** beat "looking carefully" in code review — concrete questions
  find more than vague oversight

**Core concept to remember:** Security in code review doesn't mean finding
bugs — that's the compiler's job. It means **recognizing patterns** that
deliberately circumvent the type system. Every `as`, `!`, `any` is a
conscious decision. Ask: "Was that an _informed_ decision?"

---

> **Pause point** — You have completed the full lesson.
> You can now identify TypeScript security risks, build defensive
> validation layers, apply the parse principle, and conduct structured
> code reviews. This is the toolkit of a security-conscious
> TypeScript developer.
>
> That was Lesson 42 — TypeScript Security.