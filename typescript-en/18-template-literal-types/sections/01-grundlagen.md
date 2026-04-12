# Section 1: Template Literal Types — Fundamentals

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start of lesson)
> Next section: [02 - String Utility Types](./02-utility-types.md)

---

## What you'll learn here

- How Template Literal Types lift JavaScript template literal syntax to the **type level**
- Why this feature was called a **game changer** when it arrived in TypeScript 4.1 (November 2020)
- How union types inside template literals expand into a **Cartesian product**
- Where the critical difference between runtime strings and type-level strings lies

---

## The backstory: TypeScript 4.1 and a new way of thinking

In November 2020, TypeScript 4.1 was released. The release notes contained an unremarkably titled entry: "Template Literal Types". Within days, the TypeScript community exploded — discussions on Twitter and GitHub were filled with exclamations like "This is impossible!" and "How does this even work?"

The reason: developers realized you could now describe **string patterns as types**. Not just "this value is a string" — but "this value is a string that starts with `on`, followed by an uppercase letter, followed by any characters". That kind of precision hadn't been possible before.

What was behind it? The TypeScript team, led by Anders Hejlsberg, had been working for a while on the idea of extending Conditional Types (introduced in TS 2.8). The key breakthrough was the realization: if you lift template literals from JavaScript to the type level, you gain a complete string-processing system — **at compile time**, not at runtime.

This means: the compiler can check whether a string has the right format without ever comparing a single character at runtime. It works only with the **type of the string** — and that changes everything.

---

## The core principle: types instead of values

You know template literals from JavaScript:

```javascript
const name = "World";
const greeting = `Hello, ${name}!`; // Runtime: "Hello, World!"
```

Template Literal Types look almost identical — but they operate on **types**, not values:

```typescript annotated
type Greeting = `Hello, ${string}!`;
//   ^^^^^^^^^                        // A type, not a value
//             ^^^^^^^^^^^^^^^^       // Template literal syntax with `
//                      ^^^^^^^^      // ${string} = any string type

const a: Greeting = "Hello, World!";  // OK — matches the pattern
const b: Greeting = "Hello, Max!";    // OK — matches the pattern
const c: Greeting = "Hello, !";       // OK — empty string is also a string
const d: Greeting = "Hi, World!";     // ERROR! Does not start with "Hello, "
const e: Greeting = "Hello, World";   // ERROR! Does not end with "!"
```

The type `Greeting` describes **infinitely many possible strings** — anything that starts with `"Hello, "` and ends with `"!"`. TypeScript checks at compile time whether a value satisfies this pattern.

> **Explain to yourself:** What is the difference between `type Greeting = string` and `type Greeting = \`Hello, ${string}!\``? What can TypeScript check in the second case that isn't possible in the first?
>
> **Key points:** `string` accepts any arbitrary string — no pattern can be enforced. The template literal describes an exact format. TypeScript checks the beginning and end of the string. You lose flexibility, but gain precision.

---

## Union types and the Cartesian product

This is where it gets really interesting. What happens when you put a **union** inside the template instead of `string`?

```typescript
type Prefix = "get" | "set";
type Name = "Name" | "Age";

type Methods = `${Prefix}${Name}`;
```

TypeScript expands this **automatically** into all possible combinations:

```
"get" x "Name" = "getName"
"get" x "Age"  = "getAge"
"set" x "Name" = "setName"
"set" x "Age"  = "setAge"
```

The result is `"getName" | "getAge" | "setName" | "setAge"` — the **Cartesian product** of the two unions.

In mathematics, the Cartesian product A × B is the set of all ordered pairs (a, b). TypeScript does the same with strings: it combines every value from the left union with every value from the right.

```typescript annotated
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ // 4 possible values
type ApiPath = "/users" | "/products";
//             ^^^^^^^^^^^^^^^^^^^^^^^^^ // 2 possible values

type Endpoint = `${HttpMethod} ${ApiPath}`;
//  4 methods × 2 paths = 8 possible strings
//  "GET /users" | "GET /products" | "POST /users" | "POST /products" | ...
//  | "PUT /users" | "PUT /products" | "DELETE /users" | "DELETE /products"

function callApi(endpoint: Endpoint) {
  // endpoint can ONLY be one of the 8 valid values
  // Checked at compile time — no runtime overhead!
  console.log(`Calling: ${endpoint}`);
}

callApi("GET /users");       // OK
callApi("DELETE /products"); // OK
callApi("FETCH /users");     // ERROR! "FETCH" is not a valid method
callApi("GET /comments");    // ERROR! "/comments" is not a valid path
```

> **Think about it:** If you combine 3 unions with 5, 4, and 3 elements respectively, how many types does the result contain? And at what size might that become a problem?
>
> **Answer:** 5 × 4 × 3 = 60 combinations — still manageable. With very large unions (e.g. all CSS properties × all CSS units × all possible numbers), the compiler can slow down or even abort with "Type instantiation is excessively deep". This is one of the real limits of this feature — more on that in Section 5.

---

## String patterns as constraints

Sometimes you don't want to enumerate all possible values, but simply enforce a **format**. For this, you use primitive types like `string` or `number` inside the template:

```typescript annotated
type CssProperty = `${string}-${string}`;
//                  ^^^^^^^^   ^^^^^^^^
//                  |          |
//                  |          Suffix: any string
//                  Prefix: any string
//                          There MUST be a hyphen in between

function setCssProperty(prop: CssProperty, value: string): void {
  document.documentElement.style.setProperty(`--${prop}`, value);
}

setCssProperty("background-color", "red");  // OK
setCssProperty("font-size", "16px");        // OK
setCssProperty("border-radius", "8px");     // OK
// setCssProperty("color", "red");          // ERROR! No hyphen
// setCssProperty("-", "red");              // ERROR! Empty parts allowed? Note: string ALSO includes empty strings!
```

> **Watch out — pitfall:** `${string}` means **any string**, including the empty string `""`. This means `"-"` would actually be allowed by the type `CssProperty` (prefix = `""`, suffix = `""`). If you truly want to enforce non-empty parts, you need to be more clever — e.g. with `${string}${string}-${string}` or with Conditional Types. This is one of the limitations we'll look at more closely in Section 5.

---

> **Experiment:** Try the following in the TypeScript Playground (typescriptlang.org/play):
>
> ```typescript
> type Color = "red" | "green" | "blue";
> type Size = "small" | "medium" | "large";
>
> type ButtonVariant = `${Color}-${Size}`;
>
> // Hover over ButtonVariant — how many variants are there?
> const btn: ButtonVariant = "red-small";     // OK
> const btn2: ButtonVariant = "green-large";  // OK
> const btn3: ButtonVariant = "yellow-small"; // Error?
> ```
>
> Then change `Color` to a union with 4 elements and `Size` to one with 4 elements. What changes about the number of possible values? How does the compiler behave with very large unions?

---

## The difference from runtime strings

An important point: Template Literal Types — like all TypeScript types — exist **only at compile time**. At runtime, they are perfectly ordinary strings, with no trace of the pattern:

```typescript annotated
// Compile time: TypeScript checks the pattern
type ApiRoute = `/${string}`;

function fetchData(route: ApiRoute) {
  // Runtime: 'route' is just a string — the pattern is gone
  return fetch(route); // JavaScript knows nothing about the type ApiRoute
}

fetchData("/users");    // OK — TypeScript checked, then forgot the type
fetchData("/products"); // OK

// But:
// fetchData("users");  // TypeScript error — BEFORE the code runs
//                       // At runtime, it would actually work!
```

This is the fundamental mental model: TypeScript checks, JavaScript executes. The type `ApiRoute` is a promise to the compiler — not a protection at runtime.

**In your Angular project:** When you type Angular router paths, this is exactly this pattern. Angular itself only knows strings at runtime — but TypeScript can ensure at development time that all router links have the correct format.

```typescript
// Angular Router — type-safe paths
type AppRoute = `/users/${number}` | "/users" | "/dashboard" | "/settings";

@Component({...})
export class NavComponent {
  navigateTo(route: AppRoute): void {
    this.router.navigate([route]);
    // Only valid routes allowed — typos are reported immediately!
  }
}
```

---

## Summary: Template Literal Types at a glance

Before we move on — a table of the basic building blocks we've seen:

| Syntax | Meaning | Example |
|---|---|---|
| `` `Hello, ${string}!` `` | String with any middle part | `"Hello, World!"`, `"Hello, Max!"` |
| `` `${A}${B}` `` with unions | Cartesian product | `"getUser"`, `"setUser"`, ... |
| `` `/${string}` `` | String must start with `/` | URL paths |
| `` `${number}px` `` | Number followed by `px` | `"16px"`, `"100px"` |
| `` `${A} ${B}` `` | Two parts with a space | `"GET /users"` |

These are the basic building blocks. In the next sections, two more will join them: **string utilities** (Uppercase, Capitalize, etc.) and **infer** for string parsing.

---

## One last look: template literals and Conditional Types

Template Literal Types can also be used as **constraints in Conditional Types**. This connects two powerful features into one:

```typescript annotated
type IsGetterName<T extends string> =
  T extends `get${string}` ? true : false;
//           ^^^^^^^^^^^
//           T must start with "get", followed by anything

type A = IsGetterName<"getName">;   // true
type B = IsGetterName<"setName">;   // false
type C = IsGetterName<"getValue">;  // true
type D = IsGetterName<"get">;       // true — even "get" alone starts with "get"

// Useful for filtering only certain keys from an interface:
type OnlyGetters<T> = {
  [K in keyof T as IsGetterName<K & string> extends true ? K : never]: T[K];
};

interface ApiClient {
  getName(): string;
  setName(v: string): void;
  getAge(): number;
  setAge(v: number): void;
}

type Getters = OnlyGetters<ApiClient>;
// {
//   getName: () => string;
//   getAge:  () => number;
// }
// setName and setAge are filtered out!
```

Here you can see how the concepts from the last few lessons come together: Mapped Types (L16), Conditional Types (L17), and Template Literal Types work in concert. This is the point where the TypeScript type system unfolds its full expressive power.

---

## What you've learned

- Template Literal Types lift the template literal syntax from JavaScript to the **type level** — they describe string patterns, not values
- Unions inside template literals are expanded **distributively**: `"get" | "set"` × `"Name" | "Age"` yields 4 combinations (Cartesian product)
- `${string}` as a placeholder enforces a **format** without having to enumerate all values — but beware: `string` also includes empty strings
- Template Literal Types can be used as constraints in Conditional Types — this connects the concepts from L16, L17, and L18
- Like all TypeScript types, Template Literal Types exist only at **compile time** — at runtime they are ordinary JavaScript strings

> **Explain to yourself:** You saw `type Endpoint = \`${HttpMethod} ${ApiPath}\``. Why does TypeScript expand this into a union, instead of keeping a single type with two "slots"? What is the advantage of this expansion?
>
> **Key points:** TypeScript works internally with sets of concrete values | Union types are the fundamental model | Expansion enables exact checking | The compiler can directly compare each value without parsing a string at runtime

**Core concept to remember:** Template Literal Types are not a runtime feature — they are a compiler feature. You describe an allowed string format to the TypeScript compiler, and it checks all usages of that type statically. That is the difference between "it might work" and "it is guaranteed to work".

---

> **Pause point** — The core principle is in place. Take a moment to work through the Cartesian product with an example of your own. Which three unions in your current project could you meaningfully combine?
>
> Continue with: [Section 02: String Utility Types](./02-utility-types.md)