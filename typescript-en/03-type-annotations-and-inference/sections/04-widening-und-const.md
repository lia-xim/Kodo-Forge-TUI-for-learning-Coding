# Section 4: Widening and const

**Estimated reading time:** ~10 minutes

## What you'll learn here

- What **widening** is and why TypeScript does it
- Why `let` and `const` produce different types — and why object properties still widen despite `const`
- How `as const` works and when to use it
- Practical patterns with `as const` for enum replacement and configurations

---

## Think about it — questions for this section

1. **Why do object properties widen despite `const` — what is the fundamental argument?**
2. **What THREE things does `as const` do simultaneously?**

---

## What is Widening?

**Widening** is TypeScript's decision to **expand** a literal type to its base type. It happens automatically and is one of the most common surprises for TypeScript developers.

### The analogy: labeling a box

Imagine you're packing an apple into a box:

- **`const`** = You stick a label on the box: "Contents: 1 Granny Smith apple". The box is sealed — no one can swap out the contents.
- **`let`** = You stick a label on the box: "Contents: fruit". The box is open — someone could replace the apple with a pear. So the label has to be broader.

That's exactly what TypeScript does:

```typescript
const greeting = "Hallo";    // Type: "Hallo"     (Literal Type -- sealed box)
let   greeting2 = "Hallo";   // Type: string       (Widened Type -- open box)

const count = 42;             // Type: 42           (Literal Type)
let   count2 = 42;            // Type: number       (Widened Type)

const done = true;            // Type: true         (Literal Type)
let   done2 = true;           // Type: boolean      (Widened Type)
```

### The logic behind it

TypeScript thinks ahead:

- `const` can **never** receive another value. So the type can be as narrow as possible — the exact literal value.
- `let` **can** receive a different value later. If `let x = 42` had the type `42`, then `x = 43` would be an error. That would be impractical. So TS widens to `number`.

---

## Why this matters

Widening determines what you can assign later — and whether your type is accepted as an argument:

```typescript
let status = "loading";       // Type: string  --  not "loading"!
status = "fertig";            // Allowed (it's a string)
status = "irgendwas";         // Also allowed -- maybe not what you wanted!

// Solution: Explicit annotation with union type
let status2: "loading" | "success" | "error" = "loading";
status2 = "irgendwas";       // ERROR! Exactly what we want.
```

Even more critical with function calls:

```typescript
type Direction = "north" | "south" | "east" | "west";
function move(dir: Direction) { /* ... */ }

const dir1 = "north";   // Type: "north"  -->  move(dir1) works
let dir2 = "north";     // Type: string   -->  move(dir2) ERROR!

// Because: string is not Direction -- "any string" doesn't fit
// into a union of four concrete values
```

---

## Widening with objects — the biggest surprise

```typescript
const config = {
  host: "localhost",   // Type: string  (not "localhost"!)
  port: 3000,          // Type: number  (not 3000!)
};
```

Wait — `config` is `const`! Why are the properties still widened?

> **Think about it:** Why does `const obj = { x: 10 }` give the type `{ x: number }` and not `{ x: 10 }`?

**Answer:** `const` only protects the **variable itself** from reassignment. You can't write `config = somethingElse`. But you **can** change the properties:

```typescript
config.host = "production.server.com";  // Allowed!
config.port = 8080;                      // Allowed!
```

Because the properties are mutable, TypeScript must use the broad type. `config.port` could be `8080` later — so the type can't be `3000`.

### The solution: `as const`

```typescript
const config = {
  host: "localhost",
  port: 3000,
} as const;

// config.host is now: "localhost"  (Literal Type)
// config.port is now: 3000         (Literal Type)
// AND: Everything is readonly!

config.host = "other";  // ERROR: Cannot assign to 'host' because it is a read-only property
```

`as const` does three things simultaneously:

1. **Literal types** instead of base types for all values
2. **readonly** for all properties (recursively, including nested objects)
3. **Tuple instead of array** for arrays: `[1, 2, 3]` becomes `readonly [1, 2, 3]` instead of `number[]`

---

## `as const` in practice

### Pattern 1: Enum replacement

```typescript annotated
const ROLES = ["admin", "user", "guest"] as const;
// ^ as const: readonly ["admin", "user", "guest"] instead of string[]
type Role = (typeof ROLES)[number];
// ^ Result: "admin" | "user" | "guest" (union of literal types)

ROLES.includes(userInput as Role);
// ^ Runtime check is possible -- ROLES is a real array
ROLES.forEach(role => /* ... */);
// ^ Iterable at runtime AND type-safe at compile time
```

> 🧠 **Explain to yourself:** Why does TypeScript widen the properties of a `const` object, even though it keeps the literal type for `const x = "GET"`? What exactly does `const` protect — the variable or the contents?
> **Key points:** const only protects the binding (variable) | Properties remain mutable | as const protects the contents | Therefore: object properties are widened

> **Background:** Many TypeScript experts and the Angular team itself prefer `as const` arrays over enums. The reason: enums generate runtime code (a JavaScript object), whereas `as const` is **zero-cost** — it only exists in the type system and is completely removed during compilation. Additionally, enums are nominally typed (a `Role.Admin` from module A is not equal to one from module B), whereas literal types are structural.

### Pattern 2: Configuration objects

```typescript
const API_CONFIG = {
  baseUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  endpoints: {
    users: "/users",
    posts: "/posts",
  },
} as const;

// Now you can extract precise types:
type Endpoint = (typeof API_CONFIG.endpoints)[keyof typeof API_CONFIG.endpoints];
// Result: "/users" | "/posts"
```

### Pattern 3: Mapping objects

```typescript
const STATUS_LABELS = {
  pending: "Ausstehend",
  active: "Aktiv",
  archived: "Archiviert",
} as const;

type StatusKey = keyof typeof STATUS_LABELS;
// "pending" | "active" | "archived"

type StatusLabel = (typeof STATUS_LABELS)[StatusKey];
// "Ausstehend" | "Aktiv" | "Archiviert"
```

---

## Widening rules — complete overview

| Declaration | Value | Inferred type | Explanation |
|-------------|-------|---------------|-------------|
| `const x =` | `"hello"` | `"hello"` | const primitive = Literal |
| `let x =` | `"hello"` | `string` | let = Widened |
| `const x =` | `{ a: 1 }` | `{ a: number }` | Object properties = Widened |
| `const x =` | `{ a: 1 } as const` | `{ readonly a: 1 }` | as const = Literal + Readonly |
| `const x =` | `[1, 2]` | `number[]` | Array = Widened |
| `const x =` | `[1, 2] as const` | `readonly [1, 2]` | as const = Tuple + Readonly |
| `function f()` | `return "x"` | `string` | Return = Widened |

> **Deeper knowledge:** There's a subtle case where widening does **not** occur: when a generic type parameter is directly inferred from a `const` argument. With `identity("hello")`, TS infers `T = "hello"` (literal), not `T = string`. This is because generic parameters are treated as "observations", not "assignments" — and observations can be narrow.

---

## Common widening trap: function arguments

```typescript
type Theme = "light" | "dark";

function setTheme(theme: Theme) { /* ... */ }

// This works:
setTheme("light");  // "light" is a literal  -->  fits in Theme

// This does NOT work:
let selectedTheme = "light";  // Type: string (widened!)
setTheme(selectedTheme);       // ERROR: string is not Theme

// Three solutions:
// 1. Use const
const selectedTheme1 = "light";  // Type: "light"  -->  OK

// 2. Annotate explicitly
let selectedTheme2: Theme = "light";  // Type: Theme  -->  OK

// 3. as const on the value
let selectedTheme3 = "light" as const;  // Type: "light"  -->  OK
```

> **Practical tip:** In Angular templates, you'll often encounter this problem with `@Input()` properties:
> ```typescript
> // Component expects Theme
> @Input() theme: Theme = "light";
>
> // Template: This works automatically, because Angular knows the type
> // <app-widget [theme]="'dark'">
> ```

---

## Experiment box: observing widening live

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Step 1: Object properties are always widened -- even with const!
> const obj = { x: 10 };
> // Hover over 'obj.x' -- why is it 'number' and not '10'?
>
> // Step 2: as const prevents widening
> const objConst = { x: 10 } as const;
> // Hover over 'objConst.x' -- what changes?
>
> // Step 3: Try an assignment
> obj.x = 20;         // Allowed?
> // objConst.x = 20; // Allowed?
>
> // Step 4: Arrays with and without as const
> const arr = [1, 2, 3];
> const arrConst = [1, 2, 3] as const;
> // Hover -- what's the difference?
>
> // Bonus: Derive union types from arrays
> type ArrElement = (typeof arrConst)[number];
> // What is ArrElement? What would it be without as const?
> ```
>
> Explain in one sentence: Why does `const` NOT protect object properties from widening?

---

## Rubber duck prompt

A colleague asks: "I wrote `const config = { port: 3000 }`, but when I pass `config.port` to a function that expects `3000`, I get an error. Why?"

Explain in 3 sentences:
1. What widening does with objects
2. Why `const` doesn't protect object properties
3. How `as const` solves the problem

---

## What you've learned

- **Widening** expands literal types to base types for `let` variables and object properties
- `const` on primitives gives literal types; on objects it does **not** (because properties are mutable)
- **`as const`** makes everything literal, readonly, and converts arrays to tuples
- Practical patterns: **enum replacement**, **configuration objects**, **mapping types**
- The widening trap with function arguments and how to avoid it

---

**Pause point.** When you're ready, continue with [Section 5: Contextual Typing and Control Flow](./05-contextual-typing.md) — where you'll discover TypeScript's most powerful inference capabilities.