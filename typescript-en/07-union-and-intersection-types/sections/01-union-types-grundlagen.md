# Section 1: Union Types — Fundamentals

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Type Guards and Narrowing](./02-type-guards-und-narrowing.md)

---

## What you'll learn here

- What the `|` operator means and how Union Types work
- How to form Union Types from **primitives** and **literal values**
- When **Literal Unions** are better than **Enums**
- The set theory behind Union Types

---

## The concept: "Either ... or"

In previous lessons you've seen variables with exactly one type: `string`, `number`, `boolean`. But what if a value can take on **multiple types**?

```typescript
// Without Union Types — this is too restrictive:
function formatId(id: string): string {
  return `ID: ${id}`;
}
formatId("abc-123");  // OK
// formatId(42);       // Error! number is not string
```

The solution: **Union Types** with the `|` operator:

```typescript annotated
function formatId(id: string | number): string {
//                    ^^^^^^^^^^^^^^^^
//                    Union Type: id can be string OR number
  return `ID: ${id}`;
}

formatId("abc-123");  // OK — string
formatId(42);          // OK — number
// formatId(true);     // Error! boolean is not string | number
```

> 📖 **Background: Union Types in set theory**
>
> The name "Union" comes from set theory. The **union** of two sets A and B
> contains all elements that are in A **or** in B (or in both). In TypeScript:
>
> - `string` is the set of all possible string values
> - `number` is the set of all possible number values
> - `string | number` is the union of both sets
>
> This also explains why TypeScript only allows operations on a Union Type
> that apply to **all** members — because the value could come from any
> of the participating sets.

### Only shared operations allowed

This is the **most important rule** with Union Types: without a check,
TypeScript only allows operations that apply to **all** members of the union:

```typescript annotated
function process(value: string | number) {
  // Shared methods — OK:
  value.toString();    // both string and number have toString()
  value.valueOf();     // both string and number have valueOf()

  // string ONLY — ERROR:
  // value.toUpperCase();  // Error! number has no toUpperCase
  // ^ Property 'toUpperCase' does not exist on type 'string | number'

  // number ONLY — ERROR:
  // value.toFixed(2);     // Error! string has no toFixed
}
```

> 💭 **Think question:** Why does TypeScript allow `value.toString()` but
> not `value.toUpperCase()`, even though the value COULD be a string at runtime?
>
> **Answer:** TypeScript thinks statically (at compile time). It doesn't know
> what concrete value `value` will hold. It has to assume that `value` could
> be ANY of the union members. Only operations that apply to ALL of them are
> safe. To use type-specific operations, you need **Type Narrowing** (Section 2).

---

## Literal Unions — Types for concrete values

Union Types become especially powerful with **Literal Types**. Instead of
general types like `string`, you can use concrete values as types:

```typescript annotated
// Literal Union: only these three values are allowed
type Direction = "north" | "south" | "east" | "west";
//               ^^^^^^^   ^^^^^^^   ^^^^^^   ^^^^^^
//               Each string literal is its own type

let heading: Direction = "north";  // OK
heading = "south";                  // OK
// heading = "up";                  // Error! "up" is not in Direction
```

This works with all literal types — not just strings:

```typescript
// Number literal union
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
const roll: DiceValue = 4;   // OK
// const invalid: DiceValue = 7; // Error!

// Boolean literal (rare, but possible)
type Bit = 0 | 1;
const on: Bit = 1;

// Mixed literal union
type StatusCode = 200 | 301 | 404 | 500 | "unknown";
```

### Why Literal Unions are so valuable

Literal Unions give you **IDE autocompletion** and **compile-time safety**:

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function sendRequest(method: HttpMethod, url: string): void {
  console.log(`${method} ${url}`);
}

sendRequest("GET", "/api/users");   // OK — IDE shows all 5 options
sendRequest("POST", "/api/users");  // OK
// sendRequest("DELET", "/api/users"); // Error! Typo caught immediately
```

> 🧠 **Explain to yourself:** Why does TypeScript catch the typo
> "DELET" in the last line? What happens internally?
> **Key points:** `"DELET"` is not a member of the Union Type `HttpMethod` |
> TypeScript checks the exact string value | Literal types are subtypes of string

---

## Union Types vs Enum — When to use which?

In many languages (Java, C#) you'd reach for an enum. TypeScript has `enum`
too, but Literal Unions are often the better choice:

```typescript
// ─── Option 1: enum ───────────────────────────────
enum DirectionEnum {
  North = "NORTH",
  South = "SOUTH",
  East = "EAST",
  West = "WEST",
}
// Generates runtime code! (a JavaScript object)

// ─── Option 2: Literal Union ──────────────────────
type DirectionUnion = "NORTH" | "SOUTH" | "EAST" | "WEST";
// Generates NO runtime code! (type erasure)
```

| Criterion | `enum` | Literal Union |
|---|---|---|
| Runtime code | Yes (JS object) | No (type erasure) |
| Can iterate? | Yes (`Object.values`) | Only with helper array |
| Tree-shaking | Problematic | No problem |
| Autocompletion | Yes | Yes |
| Refactoring | Good (symbol-based) | Good (find & replace) |
| Composable | No | Yes (union of unions) |

The decisive advantage of Literal Unions: **composability**:

```typescript annotated
type ReadMethod = "GET" | "HEAD" | "OPTIONS";
type WriteMethod = "POST" | "PUT" | "PATCH" | "DELETE";
type HttpMethod = ReadMethod | WriteMethod;
// ^ Union of unions! Result: all 7 methods
// This isn't possible with enum as easily
```

> 📖 **Background: Why enum is controversial in TypeScript**
>
> TypeScript's `enum` is one of the few features that **generates runtime code**
> (a violation of type erasure). This leads to problems:
>
> 1. **Bundle size**: enum objects are not removed by tree-shaking
> 2. **const enum**: Was the solution, but was marked as a "pitfall" in the
>    TypeScript docs (isolatedModules issue)
> 3. **Numeric enums**: Have reverse mapping (`Direction[0] === "North"`),
>    which can be confusing
>
> The TypeScript team itself now recommends Literal Unions for most cases.
> Enums make sense when you actually need a runtime object (e.g. for
> iteration or as a lookup table).

> ⚡ **Practical tip:** In Angular and React the convention is clear:
>
> ```typescript
> // Angular: Literal Unions for route guards, pipes, etc.
> type CanActivateResult = boolean | UrlTree | Observable<boolean | UrlTree>;
>
> // React: Literal Unions for props
> type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
> ```

---

## Deriving Union Types with as const

An elegant technique: deriving Union Types from an **array**:

```typescript annotated
const ROLES = ["admin", "editor", "viewer"] as const;
//                                          ^^^^^^^^
//    as const: readonly tuple with literal types

type Role = typeof ROLES[number];
//          ^^^^^^^^^^^^^^^^^^^^
//    Result: "admin" | "editor" | "viewer"
//    typeof ROLES = readonly ["admin", "editor", "viewer"]
//    ROLES[number] = "admin" | "editor" | "viewer"

// Advantage: you have both the array (runtime) and the type (compile time)
function isValidRole(input: string): input is Role {
  return (ROLES as readonly string[]).includes(input);
}
```

> **Experiment:** Try this in the TypeScript Playground:
> ```typescript
> const ROLES = ["admin", "editor", "viewer"] as const;
> type Role = typeof ROLES[number];
> // ^ Hover: "admin" | "editor" | "viewer"
>
> // Now remove "as const":
> const ROLES2 = ["admin", "editor", "viewer"];
> type Role2 = typeof ROLES2[number];
> // ^ Hover: string — too broad! Why?
> ```
> What happens to the type `Role2` without `as const`? Why does
> TypeScript infer `string` instead of the concrete values?

---

## Union Types and the type hierarchy

Where do Union Types fit in the hierarchy you learned about in Lesson 02?

```
                    unknown  (Top Type)
                   /   |   \
             string  number  boolean ...
                \     |     /
           string | number | boolean    <── Union Type: the union
                   \  |  /
                    never   (Bottom Type)
```

A Union Type sits **between** its members and `unknown`.
It is **wider** than any individual member, but **narrower** than `unknown`:

```typescript
// Upward assignment: member → union (always OK)
const x: string | number = "hello";  // string → string | number: OK

// Downward assignment: union → member (ERROR without narrowing)
const s: string | number = "hello";
// const y: string = s;  // Error! string | number → string: NO
```

> 🧠 **Explain to yourself:** Why can you assign `string` to
> `string | number`, but not the other way around?
> **Key points:** string is a subset of string | number |
> upward assignment (specific → general) is safe |
> downward requires a check (the value might be a number)

---

## What you've learned

- The `|` operator creates Union Types: a value can have **one of several** types
- Without Type Narrowing, only **shared operations** are allowed
- **Literal Unions** (`"GET" | "POST"`) give you autocompletion and compile-time safety
- Literal Unions are usually **better than Enums** (no runtime code, composable)
- Deriving Union Types from arrays with `as const` is an elegant technique

**Key concept to remember:** A Union Type is the **union set** of all participating types. TypeScript only permits operations that apply to ALL members — everything else requires Type Narrowing.

> **Experiment:** Try this in the TypeScript Playground:
> ```typescript
> type TrafficLight = "red" | "yellow" | "green";
>
> let signal: TrafficLight = "red";   // OK
> signal = "green";                    // OK
> signal = "blue";                     // What happens here?
>
> // Bonus question: what does this union of unions produce?
> type ReadMethod = "GET" | "HEAD";
> type WriteMethod = "POST" | "PUT" | "DELETE";
> type HttpMethod = ReadMethod | WriteMethod;
> // Hover over HttpMethod — how many members does it have?
> ```
> What error message does TypeScript show for `"blue"`? And why is
> composing unions so practical?

---

> **Pause point** — You now understand the fundamentals of Union Types.
> In the next section you'll learn how to use **Type Guards** to determine
> the concrete type of a union value.
>
> Continue with: [Section 02: Type Guards and Narrowing](./02-type-guards-und-narrowing.md)