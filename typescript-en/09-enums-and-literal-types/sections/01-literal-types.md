# Section 1: Literal Types

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Numeric Enums](./02-numerische-enums.md)

---

## What you'll learn here

- Why TypeScript distinguishes between `string` and `"GET"`
- How **const** automatically creates Literal Types (and **let** does not)
- Why `as const` is the most powerful assertion in TypeScript
- Boolean Literal Types and their role in overloads

---

## Literal Types: The Most Precise Type

In Lesson 02 you learned that `const x = "hello"` has the type `"hello"`,
not `string`. That was Type Widening. Now we go deeper.

> **A Literal Type is a type that represents exactly ONE value.**
> `"GET"` is not just a string — it is the type that ONLY accepts
> the value `"GET"`.

```typescript annotated
// Literal Type: Only THIS one value is allowed
const method: "GET" = "GET";
// ^ Type is "GET" — not string

// Wider type: Any string is allowed
let method2: string = "GET";
// ^ Type is string — "POST", "DELETE", anything goes
```

### The Three Kinds of Literal Types

TypeScript knows three categories:

```typescript annotated
// 1. String Literal Types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
// ^ Only these four values are valid

// 2. Number Literal Types
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
// ^ Only integer dice values

// 3. Boolean Literal Types
type True = true;
type False = false;
// ^ boolean is actually true | false
```

> 🧠 **Explain to yourself:** If `boolean` is actually `true | false` —
> what does that mean for the type hierarchy? Is `true` a subtype of `boolean`?
> **Key points:** Yes, true is a subtype of boolean | boolean = true | false is a union | Every Literal Type is a subtype of its wider type

---

## const vs let: Automatic Literal Types

TypeScript decides based on the declaration whether to infer a Literal Type
or a wider type:

```typescript annotated
const name = "Max";
// ^ Type: "Max" — const can never change, so TS knows the exact value

let name2 = "Max";
// ^ Type: string — let could change, so the wider type

const age = 30;
// ^ Type: 30

let age2 = 30;
// ^ Type: number

const active = true;
// ^ Type: true

let active2 = true;
// ^ Type: boolean
```

### Why does this matter?

Because functions often expect **specific Literal Types**:

```typescript annotated
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}

const dir1 = "north";
// ^ Type: "north" — matches Direction
move(dir1);  // OK

let dir2 = "north";
// ^ Type: string — does NOT match Direction
// move(dir2);  // Error! string is not Direction
```

> 📖 **Background: Why this design?**
>
> Anders Hejlsberg explained the design like this: When you write `const x = "hello"`,
> you signal to the compiler: "This value never changes."
> So TypeScript can choose the most precise type. With `let` you signal:
> "This value COULD change" — and TypeScript chooses the widest type that is
> still safe.
>
> This is no accident, but a fundamental design principle: **precision
> with safety, breadth with flexibility.**

---

## as const: The Most Powerful Assertion

What happens with objects? Even with `const`, properties are inferred broadly:

```typescript annotated
const config = {
  method: "GET",
  url: "/api/users",
  retries: 3,
};
// ^ Type: { method: string; url: string; retries: number }
// NOT: { method: "GET"; url: "/api/users"; retries: 3 }
```

Why? Because `const` only protects the **variable**, not the **properties**.
You could write `config.method = "POST"`. TypeScript therefore has to
assume `string`.

**The solution: `as const`**

```typescript annotated
const config = {
  method: "GET",
  url: "/api/users",
  retries: 3,
} as const;
// ^ Type: { readonly method: "GET"; readonly url: "/api/users"; readonly retries: 3 }
```

`as const` does **three things at once**:

1. **All properties become `readonly`** — no modification possible
2. **All values become Literal Types** — `"GET"` instead of string
3. **Arrays become readonly Tuples** — `readonly ["a", "b"]` instead of `string[]`

```typescript annotated
// Without as const:
const methods = ["GET", "POST", "PUT"];
// ^ Type: string[]

// With as const:
const methods2 = ["GET", "POST", "PUT"] as const;
// ^ Type: readonly ["GET", "POST", "PUT"]

// Deriving a Union Type from an as const Array:
type Method = typeof methods2[number];
// ^ Type: "GET" | "POST" | "PUT"
```

> 🧠 **Explain to yourself:** Why do you need `typeof methods2[number]` instead of
> just `methods2[number]`? What is the difference between the value `methods2`
> and the type `typeof methods2`?
> **Key points:** methods2 is a runtime value | typeof extracts the compile-time type | [number] accesses all index positions | Result is a union of the elements

> 💭 **Think question:** What happens when you apply `as const` to a nested
> object — does `readonly` also apply to inner objects?
>
> **Answer:** Yes! `as const` works **recursively** (deep readonly). Every level
> becomes readonly and retains Literal Types. This is the difference from
> `Object.freeze()`, which only freezes the first level (shallow freeze).

---

## Boolean Literal Types and Overloads

An advanced pattern: functions whose return type depends on the
boolean parameter:

```typescript annotated
// Without overloads: return type is always string | string[]
function getUser(id: number, asArray: boolean): string | string[] {
  return asArray ? [String(id)] : String(id);
}

// With Boolean Literal Overloads: More precise!
function getUserV2(id: number, asArray: true): string[];
function getUserV2(id: number, asArray: false): string;
function getUserV2(id: number, asArray: boolean): string | string[] {
  return asArray ? [String(id)] : String(id);
}

const single = getUserV2(1, false);
// ^ Type: string — not string | string[]!
const multi = getUserV2(1, true);
// ^ Type: string[] — precise!
```

> 🔍 **Deeper Knowledge: Literal Type Widening with Function Parameters**
>
> When you pass a Literal Type as a parameter, TypeScript retains
> the Literal Type — but only if the function expects it:
>
> ```typescript
> function log(msg: string) { console.log(msg); }
> log("hello");  // 'hello' is widened to string
>
> function logLiteral(msg: "hello" | "world") { console.log(msg); }
> logLiteral("hello");  // 'hello' stays 'hello'
> ```
>
> This is a special case of Type Widening: Literal Types are only
> widened when the target type is broader.

---

## What you learned

- **Literal Types** represent exactly one value: `"GET"`, `42`, `true`
- **const** automatically creates Literal Types for primitives, **let** creates wide types
- **as const** fixes everything: readonly, Literal Types, Tuples — also recursively
- **Boolean Literal Types** enable precise overloads
- With `typeof arr[number]` you derive Union Types from `as const` arrays

> 🧠 **Explain to yourself:** What are the three effects of `as const` and why
> do you need all three?
> **Key points:** readonly prevents modification | Literal Types preserve precision | Tuples fix length and position | Together they create a fully type-safe constant

**Core concept to remember:** Literal Types are the foundation for almost everything in TypeScript — Union Types, Discriminated Unions, Template Literal Types, and Exhaustive Checks all build on them.

> ⚡ **In your Angular project:**
>
> ```typescript
> // Component Input with Literal Types — more precise than string:
> @Component({ selector: 'app-button', template: '...' })
> export class ButtonComponent {
>   @Input() variant: "primary" | "secondary" | "danger" = "primary";
>   @Input() size: "sm" | "md" | "lg" = "md";
> }
>
> // Route configuration with as const:
> const ROUTES = [
>   { path: "dashboard", title: "Dashboard" },
>   { path: "settings",  title: "Settings" },
>   { path: "profile",   title: "Profile" },
> ] as const;
>
> type AppPath = typeof ROUTES[number]["path"];
> // ^ "dashboard" | "settings" | "profile"
> // Typos in RouterLink are detected immediately!
> ```
>
> In React the same principle applies to props:
> `<Button variant="primary">` instead of `<Button variant="anything">`.
> Literal Types make props self-documenting.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // With as const: Everything is fixed
> const config = {
>   apiUrl: "https://api.example.com",
>   retries: 3,
>   method: "GET",
> } as const;
> // Hover over config.method — what is the type?
>
> // Without as const: Properties are inferred broadly
> const config2 = {
>   apiUrl: "https://api.example.com",
>   retries: 3,
>   method: "GET",
> };
> // Hover over config2.method — what is the type now?
>
> // Derive Union Type from as const:
> const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
> type HttpMethod = typeof METHODS[number];
> // Hover over HttpMethod — what does it result in?
> ```
> Explain the difference between `config.method` (with `as const`)
> and `config2.method` (without). Why is `"GET"` more precise than `string`?

---

> **Pause point** — Good moment for a break. You have understood the foundation
> for everything else in this lesson.
>
> Continue with: [Section 02: Numeric Enums](./02-numerische-enums.md)