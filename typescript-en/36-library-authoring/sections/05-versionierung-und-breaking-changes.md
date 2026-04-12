# Section 5: Versioning and Breaking Changes in Types

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Generic Library Patterns](./04-generische-library-patterns.md)
> Next section: [06 - Practice: Custom Utility Library and npm publish](./06-praxis-utility-library.md)

---

## What you'll learn here

- Why **type changes** can be breaking changes just as much as code changes
- What the **Semantic Versioning (SemVer) rules** for types are
- Which seemingly harmless changes **break consumer code**
- How to design **non-breaking type extensions**

---

## Background: Types Are Part of the API

> **Origin Story: The Ember.js SemVer-for-Types RFC**
>
> In 2021, the Ember.js team published a groundbreaking RFC:
> "Semantic Versioning for TypeScript Types". It was the first to formally
> define what a "breaking change" means for types. The reason:
> Ember had repeatedly released "minor" updates that changed type
> definitions — and broke consumers' builds in the process.
>
> The insight: When you publish a TypeScript library, the types are
> just as much part of the public API as the functions.
> A type change that causes consumer code to stop compiling
> is a breaking change — even if nothing changes at runtime.
>
> Before this RFC, many libraries had an implicit rule: "Runtime
> changes follow SemVer, type changes are kind of irrelevant." The
> RFC made it clear: NO. A consumer whose build breaks is just as
> affected as someone whose application crashes at runtime. Sometimes
> even more so — a type error in CI can block a deployment pipeline
> even though nothing would ever have gone wrong at runtime.

The consequence: type design must be built for extensibility from the
start. Whatever interface you export now is your contract forever —
until the next major version.

The rule is simple: **If your type update breaks a consumer's build,
it is a breaking change and requires a major version.**

---

## What Is a Breaking Change in Types?

```typescript annotated
// === BREAKING: Narrowing a type (return/output) ===

// v1.0.0:
export function getUser(): { id: string; name: string; email: string };

// v1.1.0 — BREAKING! email removed:
export function getUser(): { id: string; name: string };
// ^ Consumers using user.email → COMPILE ERROR
// ^ This requires a MAJOR bump: v2.0.0

// === BREAKING: Widening a type (parameter/input) ===
// (sounds paradoxical, but...)

// v1.0.0:
export function formatDate(date: Date): string;

// v1.1.0 — BREAKING! Parameter becomes a union:
export function formatDate(date: Date | string): string;
// ^ NOT breaking for callers (Date still works)
// ^ BUT breaking for type guards using 'typeof date === "object"'
// ^ And for generic wrappers: T extends Date → fails for string
```

> 🧠 **Explain to yourself:** Why is adding an optional property to a return type NOT a breaking change, but removing one is?
> **Key points:** Adding = consumers can use it or ignore it | Removing = consumers who use it break | Same logic as REST APIs: new fields OK, removed fields = breaking

---

## The SemVer Rules for Types

| Change | SemVer | Why |
|--------|:------:|-----|
| New optional property in return type | Minor | Consumers can ignore it |
| Remove property from return type | **Major** | Consumers using it break |
| New optional parameter | Minor | Existing calls continue to work |
| Narrowing a parameter type | **Major** | Existing calls may break |
| Adding a new export | Minor | Breaks nothing |
| Removing an export | **Major** | Imports break |
| Making a required property optional | **Major** | Consumers relying on non-null break |
| Tightening a generic constraint | **Major** | Existing instantiations may break |
| Raising the minimum TypeScript version | **Major** | Consumers on older TS break |

```typescript annotated
// Example: Optional → Required (BREAKING)
// v1.0.0:
export interface Config {
  host: string;
  port?: number;   // optional
}

// v2.0.0 — MAJOR! port becomes required:
export interface Config {
  host: string;
  port: number;    // required!
}
// ^ All consumers creating Config without port → ERROR
// ^ { host: "localhost" } was valid before, now it isn't
```

> 💭 **Think about it:** Is changing a return type from `string` to
> `string | null` a breaking change?
>
> **Answer:** YES — and this is one of the most common hidden breaking
> changes. Consumers writing `const len = getTitle().length` will get
> an error with strictNullChecks: "Object is possibly null."
> The value was never null before — now it can be.

---

## Defensive Type Strategies

Here's how to design types you can extend later without breaking anything:

```typescript annotated
// Strategy 1: Opaque types for extensibility
// BAD: Direct interface (hard to extend)
export interface UserId {
  value: string;
}

// GOOD: Branded type (internally extensible)
export type UserId = string & { readonly __brand: unique symbol };
// ^ You can change the internal validation without breaking the API
// ^ Consumers only see: UserId (a string with a brand)

// Strategy 2: Options objects instead of fixed parameters
// BAD: Fixed parameters (breaking when new required fields are added)
export function send(to: string, subject: string, body: string): void;

// GOOD: Options object (extensible)
export interface SendOptions {
  to: string;
  subject: string;
  body: string;
  // Add later: cc?: string — not a breaking change!
}
export function send(options: SendOptions): void;

// Strategy 3: Keeping union types open
// BAD: Fixed union (every new variant breaks exhaustive checks)
export type Status = "active" | "inactive";

// GOOD: String subtype (extensible)
export type Status = "active" | "inactive" | (string & {});
// ^ (string & {}) allows arbitrary strings but still shows autocomplete for known values
// ^ New status values don't break exhaustive switch statements
```

> ⚡ **Framework reference (Angular):** Angular uses this strategy with
> its configuration types. For example `provideRouter()`: The options
> object has dozens of optional properties. Each new Angular version
> adds properties — this is never a breaking change because they're
> optional. Consumers who don't use the new properties won't notice.
>
> Also check out Angular's `HttpContextToken`: It uses a branded type
> (`InjectionToken<T>`) to guarantee type safety without breaking the
> interface. New tokens can be added without changing existing ones.
> You could use the same pattern in your own Angular library when
> building extensible configurations.
>
> In React component libraries, the options object pattern is also
> standard: `<Button variant="primary" size="md" />` — the props interface
> gets new optional properties with every minor version. No breaking
> changes, no major migrations.

---

## TypeScript Version as a Breaking Change

Raising the minimum TypeScript version is a breaking change:

```typescript annotated
// v1.0.0: Works with TypeScript 4.5+
// You use: Conditional types, mapped types, etc.

// v2.0.0: Requires TypeScript 5.0+
// You use: const type parameters, satisfies, etc.
// ^ Consumers on TypeScript 4.9 break!

// Recommendation:
// - Specify in package.json:
{
  "engines": {
    "node": ">=18"
  },
  "peerDependencies": {
    "typescript": ">=5.0"
    // ^ Makes the minimum version explicit
  }
}

// - Document in README:
// "This library requires TypeScript 5.0 or later."

// - TS version bump = major version of your library
```

> 🧪 **Experiment:** Check whether a type change is breaking:
>
> ```typescript
> // Version 1:
> interface ConfigV1 { host: string; port: number; }
> export function createServer(config: ConfigV1): void;
>
> // Version 2 — is this breaking?
> interface ConfigV2 { host: string; port: number; ssl?: boolean; }
> export function createServer(config: ConfigV2): void;
>
> // Test: Would code written against V1 compile with V2?
> const config: ConfigV1 = { host: "localhost", port: 3000 };
> createServer(config); // Compiles with V2? → YES! (ssl is optional)
> // → NOT breaking → Minor version
> ```
>
> Always run the thought experiment: "Does existing
> consumer code still compile?"

---

## Changelog for Types

```typescript annotated
// CHANGELOG.md — Best practice:
//
// ## 2.0.0 (Breaking Changes)
//
// ### Type Changes
// - **BREAKING**: `getUser()` returns `User | null` instead of `User`
//   - Migration: Add null-check before accessing properties
//   - Reason: Align with API that can return 404
//
// - **BREAKING**: Minimum TypeScript version raised to 5.0
//   - Migration: Update TypeScript in your project
//
// ## 1.2.0 (Features)
//
// ### Type Changes
// - Added optional `timeout` property to `RequestOptions`
// - Added new export `createBatchClient`
// - Generic `Client<T>` now infers T from constructor argument
//
// ^ Document type changes explicitly in the changelog
// ^ Mark "BREAKING" prominently
// ^ Provide migration instructions
```

---

## What you've learned

- **Type changes** are breaking changes just as much as code changes — the Ember.js RFC formalized this
- **Removing** properties = Major, **adding** properties (optional) = Minor
- Making **optional properties required** is always a breaking change — even when it seems logical
- **`string | null` as a return type** where `string` stood before is a hidden breaking change
- **Options objects** instead of fixed parameters are more extensible
- **Raising the TypeScript version** is a breaking change — communicate it via peerDependencies
- The **changelog** should document type changes explicitly — include migration guides
- The thought experiment: "Does existing consumer code still compile?" — if no, it's Major

**Core concept to remember:** Your types are a contract with your consumers. Every change that breaks existing consumer code requires a major version — regardless of whether anything changes at runtime. Design types to be extensible from the start: options objects, optional properties, branded types. The best type change is one nobody notices — because existing code simply keeps working.

---

> **Pause point** -- A good moment for a break. You now understand
> why versioning matters so much when it comes to types.
>
> Continue with: [Section 06: Practice — Custom Utility Library and npm publish](./06-praxis-utility-library.md)