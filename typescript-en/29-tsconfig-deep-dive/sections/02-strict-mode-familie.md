# Section 2: The Strict Mode Family

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - tsconfig Basic Structure](./01-tsconfig-grundstruktur.md)
> Next section: [03 - Module Resolution](./03-module-resolution.md)

---

## What you'll learn here

- What `strict: true` actually enables (it's 8 individual flags!)
- Why `strictNullChecks` is the single most important flag
- How `strictFunctionTypes` enforces variance (reference to L22!)
- Which strict flags are often overlooked

---

## The `strict` Flag: A Bundle, Not a Single Flag
<!-- section:summary -->
When you set `"strict": true`, you're not enabling a single

<!-- depth:standard -->
When you set `"strict": true`, you're not enabling a single
behavior — you're enabling **8 individual flags at once**. It's
like an "turn everything on" switch for type safety.

```typescript annotated
{
  "compilerOptions": {
    "strict": true
    // ^ Enables ALL of the following 8 flags at once:
    // strictNullChecks, strictFunctionTypes, strictBindCallApply,
    // strictPropertyInitialization, noImplicitAny, noImplicitThis,
    // alwaysStrict, useUnknownInCatchVariables (since TS 4.0)
    //
    // NOT included (must be set explicitly):
    // exactOptionalPropertyTypes, noImplicitOverride,
    // strictBuiltinIteratorReturn
  }
}
```

> 📖 **Background: Why a bundle instead of individual flags?**
>
> When TypeScript 2.3 (2017) introduced `strict` mode, the team
> faced a dilemma: new strict checks needed to be addable without
> breaking existing code. The solution: `strict` is a meta-flag.
> With each TypeScript release, new checks can be bundled under it.
> Anyone using `strict: true` automatically gets the latest safety
> checks — without needing to know every individual flag.
>
> But this also means: **a TypeScript update can break your code**
> if a new strict flag finds errors that weren't checked before.
> This is intentional — it's the price of maximum safety.

---

<!-- /depth -->
## The 8 Flags in Detail
<!-- section:summary -->
### 1. `strictNullChecks` — The Most Important Flag

<!-- depth:standard -->
### 1. `strictNullChecks` — The Most Important Flag

Without `strictNullChecks`, every type is automatically also `null`
and `undefined`. This means TypeScript does NOT check whether a value
exists before you use it.

```typescript annotated
// WITHOUT strictNullChecks:
function getLength(s: string): number {
  return s.length;
  // ^ NO error! Even though s could be null
}
getLength(null); // Compiles! Runtime: TypeError: Cannot read property 'length' of null

// WITH strictNullChecks:
function getLength(s: string): number {
  return s.length; // OK — string is GUARANTEED not null
}
getLength(null);
// ^ Error! Argument of type 'null' is not assignable to parameter of type 'string'
```

Tony Hoare, the inventor of the null reference, called it his
"Billion Dollar Mistake". `strictNullChecks` is TypeScript's answer
to that — it makes `null` and `undefined` explicit types that you
must handle consciously.

> 💭 **Think about it:** Why isn't `strictNullChecks` simply the
> default in TypeScript? Why does it need to be enabled?
>
> **Answer:** Backwards compatibility. When TypeScript was introduced,
> millions of lines of JavaScript code had no null checks.
> A mandatory check would have made migration impossible. That's why
> it's opt-in (via strict or individually).

### 2. `strictFunctionTypes` — Enforcing Variance

This flag disables **bivariant** treatment of function types and
instead enforces correct contravariance for parameters.
Remember L22 (Advanced Generics)? That's where you learned about
covariance and contravariance.

**What does this mean in practice?** Without `strictFunctionTypes`,
TypeScript treats function parameters *bivariantly* — both subtypes
and supertypes are accepted. This sounds flexible, but allows
unsafe code.

```typescript annotated
type Handler = (event: MouseEvent) => void;

// SAFE — also allowed with strictFunctionTypes:
const handler: Handler = (event: Event) => {};
// ^ OK! Event is a supertype of MouseEvent.
// The function accepts any Event — MouseEvent is an Event,
// so it will handle a MouseEvent just fine.
// This is correct contravariance: parameters may be more general.

// FORBIDDEN with strictFunctionTypes:
type ClickHandler = (event: UIEvent) => void;
const clickHandler: Handler = (event: UIEvent) => {
// ^ Error! Type '(event: UIEvent) => void' is not assignable to type 'Handler'
// UIEvent is a supertype of MouseEvent — the function might internally
// expect UIEvent-only properties that MouseEvent does NOT have.
// Wait: MouseEvent IS a UIEvent, so it has all UIEvent properties.
// The real issue: MouseEvent has e.g. clientX/clientY, UIEvent doesn't —
// the caller passes a MouseEvent, but the function only sees UIEvent.
  console.log(event.detail); // UIEvent.detail — no error, but clientX is missing!
};

// The truly forbidden pattern (covariant parameter — wrong direction):
type AnimalHandler = (animal: Animal) => void;
const dogHandler: AnimalHandler = (dog: Dog) => {
// ^ Error! Dog is a SUBTYPE of Animal — this is covariant, not contravariant.
// The caller might pass a Cat — dog.bark() would crash!
  dog.bark(); // What if "animal" is actually a Cat?
};
```

> 🧠 **Explain to yourself:** Why is a function that expects `Animal`
> safe as a handler for `Dog` — but a function that only expects `Dog`
> is NOT safe as a handler for `Animal`?
> Think about the caller: what do they pass in?
> **Key points:** Contravariant = more general type is safe (every Dog is an Animal) |
> Covariant = more specific type is UNSAFE (not every Animal is a Dog) |
> strictFunctionTypes forbids the unsafe direction | Method syntax
> remains bivariant (backwards compatibility)

### 3. `noImplicitAny` — No Hidden any

Without this flag, TypeScript is allowed to infer types as `any` when
it can't figure out the type. With the flag, the type must be
specified explicitly.

```typescript annotated
// WITHOUT noImplicitAny:
function add(a, b) {
// ^ a and b are implicitly "any" — no error
  return a + b;
}

// WITH noImplicitAny:
function add(a, b) {
// ^ Error! Parameter 'a' implicitly has an 'any' type
  return a + b;
}
// Fix:
function add(a: number, b: number): number {
  return a + b;
}
```

### 4. `strictPropertyInitialization` — Class Properties

Enforces that every class property is either initialized in the
constructor or marked as optional.

```typescript annotated
class User {
  name: string;
  // ^ Error! Property 'name' has no initializer and is not definitely assigned
  age?: number;
  // ^ OK — optional (undefined allowed)

  constructor(name: string) {
    this.name = name;
    // ^ Now OK — initialized in the constructor
  }
}
```

You know this from L21 (Classes & OOP). The `!` operator
(Definite Assignment Assertion) bypasses the check:
`name!: string;` — but only use it when you KNOW that the
property will be set elsewhere (e.g. by a framework like Angular).

> ⚡ **Practical tip:** In Angular components you'll often see `@Input()`
> properties with the `!` operator:
> ```typescript
> @Input() title!: string;
> ```
> Angular sets the property after construction — TypeScript can't
> know this. The `!` operator says: "Trust me, Angular
> takes care of it." From Angular 16 with `required: true` there's
> a better alternative:
> ```typescript
> title = input.required<string>();
> ```

### 5. `useUnknownInCatchVariables` — Safe Catch Blocks

Since TypeScript 4.4, this flag can change the type of `catch`
variables from `any` to `unknown`:

```typescript annotated
try {
  riskyOperation();
} catch (error) {
  // WITHOUT useUnknownInCatchVariables:
  // error is "any" — you can do anything with it (unsafe!)
  console.log(error.message); // No error, but what if error isn't an Error?

  // WITH useUnknownInCatchVariables:
  // error is "unknown" — you MUST check first
  if (error instanceof Error) {
    console.log(error.message); // Now safe!
  }
}
```

This fits perfectly with L25 (Type-safe Error Handling) — there you
learned why `throw` can throw arbitrary values, not just `Error`.

### 6-8: The Remaining Flags

**Included in the `strict` bundle (6-8):**

| Flag | Effect |
|------|---------|
| `strictBindCallApply` | Checks types for `.bind()`, `.call()`, `.apply()` |
| `noImplicitThis` | Forbids implicit `any` for `this` |
| `alwaysStrict` | Adds `"use strict"` to every output file |

**Not in the `strict` bundle — must be set explicitly:**

| Flag | Effect |
|------|---------|
| `exactOptionalPropertyTypes` | `age?: number` does NOT allow `age: undefined` — only omission |
| `noImplicitOverride` | Makes `override` keyword mandatory for method overrides in classes |
| `strictBuiltinIteratorReturn` | Checks iterator return types (from TS 5.6) |

> 🔬 **Experiment:** Here's a code snippet. Think about which
> strict flags would catch each error:
>
> ```typescript
> // Case 1:
> function greet(name) { console.log("Hello " + name); }
> // → noImplicitAny (parameter without type)
>
> // Case 2:
> class Dog { name: string; }
> // → strictPropertyInitialization (not set in constructor)
>
> // Case 3:
> function len(s: string | null) { return s.length; }
> // → strictNullChecks (s could be null)
>
> // Case 4:
> try { throw "oops"; } catch(e) { console.log(e.message); }
> // → useUnknownInCatchVariables (e is unknown, not any)
> ```

---

<!-- /depth -->
## Overriding Strict Flags Individually
<!-- section:summary -->
You can set `strict: true` and then disable individual flags again.

<!-- depth:standard -->
You can set `strict: true` and then disable individual flags again.
This is useful during migrations:

```typescript annotated
{
  "compilerOptions": {
    "strict": true,
    // ^ Everything on...
    "strictPropertyInitialization": false
    // ^ ...except this one flag (because of legacy code)
  }
}
```

**Recommendation:** ALWAYS start with `strict: true`. Only disable individual
flags temporarily during a migration. Every disabled flag is a
potential source of bugs.

> ⚡ **Practical tip:** In React projects with `create-react-app` or
> Vite, `strict: true` is the default. In older Angular projects
> (before Angular 12), `strict` was not the default — check your
> existing projects! Since Angular 12, `ng new` generates a
> tsconfig with `strict: true`.

---

<!-- /depth -->
## What you've learned

- `strict: true` enables 8 individual flags at once
- `strictNullChecks` is the single most important flag — it makes null/undefined into explicit types
- `strictFunctionTypes` disables bivariant function parameters and enforces correct contravariance (reference to variance from L22)
- `useUnknownInCatchVariables` makes catch variables safe (reference to Error Handling from L25)
- `exactOptionalPropertyTypes`, `noImplicitOverride`, `strictBuiltinIteratorReturn` are NOT in `strict: true` — they must be set explicitly
- You can set `strict: true` and temporarily disable individual flags

> 🧠 **Explain to yourself:** A colleague says: "I set
> `strict: false` because TypeScript reports too many errors otherwise."
> Why is this a fallacy? What would the consequences be?
> **Key points:** The errors exist — strict just makes them visible |
> Without strict: runtime crashes instead of compile errors | "Seeing
> fewer errors" is not "having fewer errors" | strict = early
> error detection

**Core concept to remember:** `strict: true` is not a "nice to have" — it's
the foundation of professional TypeScript development. Every flag
it contains has a concrete safety benefit.

---

> **Pause point** -- You now know the strict family. Next,
> we'll look at how TypeScript finds modules.
>
> Continue with: [Section 03: Module Resolution](./03-module-resolution.md)