# Section 6: Type Widening and Literal Types

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - never, void, symbol, bigint](./05-never-void-symbol-bigint.md)
> Next section: [Back to overview](../README.md) -- Continue with Examples, Exercises, Quiz

---

## What you'll learn here

- How TypeScript decides whether a type is **narrow** (Literal) or **wide** (general)
- Why `const` and `let` lead to **different types**
- How `as const` works and why it's so powerful

---

## What is Type Widening?

When TypeScript automatically **infers** (recognizes) the type of a variable,
it makes a decision: should the type be **narrow** (specific) or
**wide** (general)?

This decision depends on whether the value **can change**.

```typescript
// const kann sich NICHT aendern -> TypeScript waehlt den ENGSTEN Typ
const name = "Max";    // Typ: "Max" (nicht string!)
const alter = 25;      // Typ: 25 (nicht number!)
const aktiv = true;    // Typ: true (nicht boolean!)

// let KANN sich aendern -> TypeScript waehlt den BREITEREN Typ
let name2 = "Max";     // Typ: string (weil es spaeter "Anna" sein koennte)
let alter2 = 25;       // Typ: number (weil es spaeter 30 sein koennte)
let aktiv2 = true;     // Typ: boolean (weil es spaeter false sein koennte)
```

### The Analogy: Labeling Boxes

Imagine you're labeling boxes:
- **`const`** is like a **sealed** box: you know exactly what's inside,
  so you write "Red Apple" on it (Literal Type).
- **`let`** is like an **open** box: the contents could change,
  so you just write "Fruit" on it (wide type).

> 📖 **Background: Why did TypeScript make this design decision?**
>
> Earlier versions of TypeScript (before 2.1) had no widening concept —
> `const x = "hallo"` resulted in `string`, just like `let`. This changed
> with TypeScript 2.1 (December 2016), when **Literal Type Widening**
> was introduced.
>
> The logic behind it: if a value cannot change (`const`),
> why should TypeScript widen the type? The narrowest possible
> type gives you the **most safety**. And if a value can change
> (`let`), a Literal Type would be obstructive — you couldn't assign
> anything else to the variable.
>
> This is an example of TypeScript's philosophy: **safety where
> possible, flexibility where needed.**

---

## What are Literal Types?

A **Literal Type** is a type that is restricted to a **specific value**.
`"Max"` is not simply a `string` — it is
the type that allows ONLY the value `"Max"`.

```typescript
// Literal Types fuer alle Primitives:
type Name = "Max";              // String Literal Type
type Antwort = 42;              // Number Literal Type
type Ja = true;                 // Boolean Literal Type

// Literal Types sind SUBTYPEN ihrer breiteren Typen:
//   "Max" ist ein Subtyp von string
//   42 ist ein Subtyp von number
//   true ist ein Subtyp von boolean
```

### Why are Literal Types important?

Because they form the foundation for **Union Types** and therefore for a
large part of TypeScript's power:

```typescript
// Union aus Literal Types — wie ein Enum, aber flexibler:
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type StatusCode = 200 | 201 | 400 | 404 | 500;
type Feature = "darkMode" | "newUI" | "betaSearch";

// TypeScript prueft: nur diese exakten Werte sind erlaubt!
function sendRequest(method: HttpMethod, url: string): void { }
sendRequest("GET", "/api/users");    // OK
// sendRequest("PATCH", "/api/users"); // Error! "PATCH" ist nicht in HttpMethod
```

> ⚡ **Practical tip:** In Angular and React you'll see Literal Types constantly:
>
> ```typescript
> // Angular: ChangeDetectionStrategy ist intern ein Union
> type ChangeDetection = "Default" | "OnPush";
>
> // React: Props mit eingeschraenkten Werten
> type ButtonVariant = "primary" | "secondary" | "danger";
> type Size = "sm" | "md" | "lg";
>
> interface ButtonProps {
>   variant: ButtonVariant;
>   size?: Size;
> }
> ```

---

## Type Widening in Action: The Object Trap

Here lies the biggest surprise: **object properties are ALWAYS
widened**, even with `const`:

```typescript
const config = {
  method: "GET",     // Typ: string (nicht "GET"!)
  url: "/api/users", // Typ: string (nicht "/api/users"!)
};
```

> 💭 **Think about it:** Why does TypeScript widen the properties of a
> `const` object, even though it keeps the Literal Type for `const x = "GET"`?
>
> **Answer:** Because `const` only protects the **variable**, not the
> **contents**. `const config = {...}` means: the variable `config`
> cannot be reassigned. But `config.method = "POST"` is
> allowed! The properties of an object are mutable, so
> TypeScript widens them.
>
> ```typescript
> const config = { method: "GET" };
> config.method = "POST";  // Erlaubt! config ist const, aber Properties nicht
>
> const name = "Max";
> // name = "Anna";        // Error! const schuetzt den Wert direkt
> ```

This leads to a common problem:

```typescript
function fetchData(method: "GET" | "POST", url: string): void { /* ... */ }

const config = {
  method: "GET",
  url: "/api/users",
};

// fetchData(config.method, config.url);
// Error! Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'
```

### Three Solutions

**Solution 1: `as const` on the property**

```typescript
const config = {
  method: "GET" as const,  // Typ: "GET" (Literal Type)
  url: "/api/users",
};
fetchData(config.method, config.url);  // OK!
```

**Solution 2: `as const` on the entire object**

```typescript
const config = {
  method: "GET",
  url: "/api/users",
} as const;
// Typ: { readonly method: "GET"; readonly url: "/api/users" }
fetchData(config.method, config.url);  // OK!
```

**Solution 3: Explicit type annotation**

```typescript
const config: { method: "GET" | "POST"; url: string } = {
  method: "GET",
  url: "/api/users",
};
fetchData(config.method, config.url);  // OK!
```

> 🔍 **Deeper knowledge: satisfies — the most elegant solution (since TS 4.9)**
>
> ```typescript
> const config = {
>   method: "GET",
>   url: "/api/users",
> } satisfies { method: "GET" | "POST"; url: string };
>
> // config.method ist "GET" (Literal Type!) — nicht "GET" | "POST"
> fetchData(config.method, config.url);  // OK!
> ```
>
> `satisfies` checks whether the value matches the type, but **retains the
> narrowest inferred type**. That's the best of both worlds:
> type safety AND Literal Types. More on this in Lesson 03.

---

## as const — the Literal Type Enforcer

`as const` has **three effects** simultaneously:

1. All properties become **`readonly`**
2. All values become **Literal Types**
3. Arrays become **readonly Tuples**

```typescript
// Ohne as const:
const farben = ["rot", "gruen", "blau"];
// Typ: string[] — TypeScript denkt, das Array koennte sich aendern

// Mit as const:
const farben2 = ["rot", "gruen", "blau"] as const;
// Typ: readonly ["rot", "gruen", "blau"] — exakte Werte, unveraenderbar
```

### The Most Powerful Pattern: Deriving a Union Type from an Array

```typescript annotated
const STATUS = ["aktiv", "inaktiv", "gesperrt"] as const;
// ^ as const: Array becomes a readonly Tuple with Literal Types
type Status = typeof STATUS[number];
// ^ typeof: extracts the type of the runtime value
// ^ [number]: Indexed Access -- returns the Union of all element types
// ^ Result: "aktiv" | "inaktiv" | "gesperrt"
```

> 🧠 **Explain to yourself:** Why does `typeof STATUS[number]` result in the type `"aktiv" | "inaktiv" | "gesperrt"` and not simply `string`? What would happen if you left out `as const`?
> **Key points:** as const prevents widening to string[] | typeof extracts the Tuple type | [number] accesses all numeric indices | Without as const: string (widened)

> 📖 **Background: typeof STATUS[number] — how does it work?**
>
> This is an **Indexed Access Type**:
> - `typeof STATUS` gives the type of the array: `readonly ["aktiv", "inaktiv", "gesperrt"]`
> - `[number]` is an index access with the type `number` — this means
>   "all elements reachable with a numeric index"
> - The result is the Union of all element types: `"aktiv" | "inaktiv" | "gesperrt"`
>
> This pattern replaces `enum` entirely in many teams, because it
> **creates no runtime object** (unlike `enum`) while still being
> type-safe.

> ⚡ **Practical tip: as const in Angular/React**
>
> ```typescript
> // Angular: Route-Konfiguration typsicher
> const ROUTES = [
>   { path: 'home', component: HomeComponent },
>   { path: 'about', component: AboutComponent },
>   { path: 'contact', component: ContactComponent },
> ] as const;
> type RoutePath = typeof ROUTES[number]['path'];
> // Typ: "home" | "about" | "contact"
>
> // React: Action Types fuer Reducer
> const ACTIONS = ["increment", "decrement", "reset"] as const;
> type ActionType = typeof ACTIONS[number];
> // Typ: "increment" | "decrement" | "reset"
> ```

---

## Summary: Type Widening Rules

| Declaration | Inferred Type | Why |
|---|---|---|
| `const x = "hallo"` | `"hallo"` | const + primitive = Literal Type |
| `let x = "hallo"` | `string` | let could change = wide type |
| `const obj = { a: 1 }` | `{ a: number }` | Object properties are mutable! |
| `const obj = { a: 1 } as const` | `{ readonly a: 1 }` | as const locks everything |
| `const arr = [1, 2, 3]` | `number[]` | Array elements are mutable |
| `const arr = [1, 2, 3] as const` | `readonly [1, 2, 3]` | as const creates a readonly Tuple |

> 🔍 **Deeper knowledge: When does TypeScript NOT widen?**
>
> There are places where TypeScript deliberately does **not** widen:
>
> ```typescript
> // 1. Bei expliziten Literal-Type-Annotationen:
> let x: "hallo" = "hallo";  // Typ bleibt "hallo", obwohl let
>
> // 2. Bei readonly Properties:
> interface Config {
>   readonly method: "GET";
> }
> const c: Config = { method: "GET" };  // method bleibt "GET"
>
> // 3. Bei Template Literal Types:
> type Greeting = `Hallo ${string}`;  // Bleibt eng
>
> // 4. Bei return-Werten in bestimmten Kontexten:
> function getMethod() { return "GET" as const; }
> const m = getMethod();  // Typ: "GET"
> ```

---

## What you've learned

- **Type Widening**: `const` + primitive = Literal Type, `let` = wide type
- **The object trap**: Properties are always widened, even for `const` objects
- **as const**: Makes everything `readonly` + Literal + Tuple — three effects simultaneously
- **Union from array**: `typeof ARRAY[number]` derives Union Types from `as const` arrays
- **satisfies**: Checks the type without losing the inferred type (since TS 4.9)

**Core Concept to remember:** Widening is TypeScript's compromise between safety and flexibility. `const` gives you safety (Literal Types), `let` gives you flexibility (wide types), and `as const` gives you safety for objects and arrays.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // as const: Vor und nach dem Hinzufuegen vergleichen
> const config = {
>   method: "GET",
>   retries: 3,
> };
> // Hover ueber config.method: Typ ist "string" (breit)
>
> const configConst = {
>   method: "GET",
>   retries: 3,
> } as const;
> // Hover ueber configConst.method: Typ ist "GET" (Literal!)
>
> // Array: mit und ohne as const
> const farben = ["rot", "gruen", "blau"] as const;
> type Farbe = typeof farben[number]; // "rot" | "gruen" | "blau"
>
> const farbenBreit = ["rot", "gruen", "blau"];
> type FarbeBreit = typeof farbenBreit[number]; // string — viel zu weit!
>
> // satisfies: Typ pruefen ohne Literal Types zu verlieren
> const obj = { x: 10, y: 20 } satisfies { x: number; y: number };
> // Hover ueber obj.x: ist es number oder 10?
> ```
> Hover over `config.method` vs. `configConst.method` — do you see the
> difference between `string` and the Literal Type `"GET"`?
> Remove `as const` from `farben` and see what `Farbe` becomes.
> With `satisfies`: is `obj.x` of type `number` or `10`?

---

## The Big Picture: All Primitive Types

```
  Compilezeit (tsc)              Laufzeit (JS Engine)
  ─────────────────              ────────────────────
  string, number, boolean        typeof === "string", "number", "boolean"
  null, undefined                null, undefined (gleich)
  symbol, bigint                 typeof === "symbol", "bigint"
  void, never                    existieren NICHT
  any, unknown                   existieren NICHT
  Literal Types ("GET", 42)      existieren NICHT
  Union Types (A | B)            existieren NICHT

  TypeScript = Compilezeit-Sicherheit + JavaScript-Laufzeit
```

---

## Next Steps

You've completed all six sections. Now let's consolidate the knowledge:

1. **Start the Quiz** — test your understanding with the 15+ questions from this lesson
2. **Open the Cheatsheet** — a compact reference of all Primitive Types at a glance
3. **Next Lesson**: L03 — Objects, Interfaces and Type Aliases
4. **Compare solutions** in `solutions/`
5. **Keep the Cheatsheet** (`cheatsheet.md`) as a quick reference

### Reflection Questions

Answer these questions for yourself to check your understanding:

1. Why can't TypeScript guarantee that `JSON.parse()` returns a
   specific type?
2. Why is `const x = "hallo"` of type `"hallo"` and not `string`?
3. What would happen if `any` didn't exist?
4. Why is `0.1 + 0.2 !== 0.3` not a TypeScript bug?
5. In what situation would you use `bigint` instead of `number`?

---

> **End of Lesson** -- You now have a deep understanding of all
> primitive types in TypeScript. The next lesson builds on this.
>
> **Next Lesson:** [03 - Type Annotations and Type Inference](../../03-type-annotations-inference/README.md)