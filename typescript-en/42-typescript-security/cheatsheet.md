# Cheatsheet: TypeScript Security

> Lesson 42 — Compact reference for everyday use

---

## The Core Truth

> TypeScript is a **correctness tool**, not a security tool.
> TypeScript checks compile-time structure. Real attacks happen at **runtime**.

---

## 8 Red Flags in Code Review

| Pattern | Problem | Fix |
|--------|---------|-----|
| `data as User` (external data) | No runtime check | `parseUser(data)` with type guard |
| `value!` without explanation | Crash when null | Explicit if-check |
| `JSON.parse(raw) as T` | Throws + no struct check | try-catch + type guard |
| `Object.assign({}, a, userInput)` | Prototype Pollution | Whitelist + `Object.create(null)` |
| `param: any` in signatures | any spreads | `unknown` + narrowing |
| URL params without validation | Invalid IDs, injection | Regex check + branded type |
| `eval(str)` / `new Function(str)` | Arbitrary code execution | Write a parser |
| `element.innerHTML = userInput` | XSS | `{{ }}` template or DomSanitizer |

---

## Type Guards — The Security Foundation

```typescript
// Type signature of a validator
type Validator<T> = (value: unknown) => value is T;

// Minimal type guard
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string'    &&
    typeof v['name'] === 'string'  &&
    typeof v['email'] === 'string' &&
    (v['email'] as string).includes('@')
  );
}

// Usage: no 'as' cast needed
const raw = await fetch('/api/user').then(r => r.json());
if (!isUser(raw)) throw new ValidationError('Invalid API response');
// From here: raw is User — TypeScript knows it, you've proven it
```

---

## Parse, don't validate

```typescript
// ❌ VALIDATE approach: knowledge separated from the object
function isValid(v: unknown): boolean { /* ... */ }
if (isValid(data)) {
  const user = data as User;  // as-cast still needed!
}

// ✅ PARSE approach: result is T or error
function parseUser(v: unknown): User {
  if (!isUser(v)) throw new ParseError('Invalid user', v);
  return v;  // No 'as' — isUser proved it
}

// ✅ EVEN BETTER: Result pattern (L25)
function safeParseUser(v: unknown): Result<User, ParseError> {
  if (!isUser(v)) return err(new ParseError('Invalid user', v));
  return ok(v);
}
```

---

## Parse at the boundary

```
┌─────────────────────────────────────────────────┐
│  OUTSIDE (unsafe)                               │
│  API, localStorage, URL parameters, FormData    │
│                    │                            │
│              PARSE HERE                         │
│         (once, at the system boundary)          │
│                    │                            │
│  INSIDE (safe)                                  │
│  All types are proven — no re-validation        │
│  needed                                         │
└─────────────────────────────────────────────────┘
```

**Rule:** Validate once, at system entry. After that, the type holds.

---

## Preventing Prototype Pollution

```typescript
// ❌ DANGEROUS
Object.assign({}, defaults, userInput);

// ✅ SAFE: Object.create(null) + whitelist
const ALLOWED_KEYS = ['theme', 'language'] as const;
const safe = Object.create(null) as Record<string, unknown>;
for (const key of ALLOWED_KEYS) {
  if (key in (userInput as object)) {
    safe[key] = (userInput as Record<string, unknown>)[key];
  }
}
```

---

## Using JSON.parse Safely

```typescript
// ❌ DANGEROUS
const config = JSON.parse(localStorage.getItem('config') || '{}') as AppConfig;

// ✅ SAFE
function loadConfig(): AppConfig {
  const raw = localStorage.getItem('config');
  if (!raw) return defaultConfig;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaultConfig;  // Corrupted JSON — fallback
  }
  return isAppConfig(parsed) ? parsed : defaultConfig;
}
```

---

## Minimum ESLint Configuration

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-return": "error"
}
```

---

## Angular: Using DomSanitizer Correctly

```typescript
// ❌ NEVER with user input
this.sanitizer.bypassSecurityTrustHtml(userInput);

// ✅ Sanitize first for HTML content
const safe = this.sanitizer.sanitize(SecurityContext.HTML, userContent);

// ✅ Bypass only for your own, controlled content
this.sanitizer.bypassSecurityTrustHtml(myOwnRenderer.render(markdown));

// ✅ Best option: use Angular template binding
// {{ userContent }}  → automatically escaped, no XSS possible
```

---

## Memory Anchors

| Concept | Mnemonic |
|---------|----------|
| Type Erasure | "TypeScript types are ink that disappears after printing" |
| Type Guards | "Prove, then trust — not the other way around" |
| Parse, don't validate | "Transformation instead of boolean" |
| Prototype Pollution | "Object.create(null) has no prototype — no target" |
| Parse at the boundary | "Check once, then trust" |
| `as` without check | "A promise without proof" |