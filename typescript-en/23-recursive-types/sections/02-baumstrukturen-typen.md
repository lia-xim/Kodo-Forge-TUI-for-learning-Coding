# Section 2: Typing Tree Structures

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - What are recursive types?](./01-was-sind-rekursive-typen.md)
> Next section: [03 - Deep Operations](./03-deep-operationen.md)

---

## What you'll learn here

- How to model **JSON as a recursive type** — arguably the most important recursive type
- How **DOM trees** and **AST structures** are typed recursively
- Why **nested menus and configurations** are naturally recursive
- The difference between **direct** and **indirect** recursion

---

## JSON: The Ubiquitous Recursive Type
<!-- section:summary -->
If there's one recursive type in your career you should truly

<!-- depth:standard -->
If there's one recursive type in your career you should truly
internalize, it's the **JSON type**. You use JSON every day —
and its structure is intrinsically recursive.

<!-- depth:vollstaendig -->
> **Background: Douglas Crockford's JSON Specification (2001)**
>
> Douglas Crockford "discovered" JSON in the early 2000s as a
> subset of JavaScript literals. The official specification
> (RFC 7159, later RFC 8259) defines JSON values recursively:
>
> ```
> value = string | number | boolean | null | array | object
> array = [ value, value, ... ]      ← contains value (recursion!)
> object = { string: value, ... }    ← contains value (recursion!)
> ```
>
> JSON is therefore **recursive by definition** — a JSON value can
> contain other JSON values, which in turn contain JSON values,
> arbitrarily deep. The base cases are the primitive types:
> `string`, `number`, `boolean`, `null`.

---

<!-- /depth -->
## The JSON Type in TypeScript
<!-- section:summary -->
Here's how you model the entire JSON specification as a TypeScript type:

<!-- depth:standard -->
Here's how you model the entire JSON specification as a TypeScript type:

```typescript annotated
type JsonPrimitive = string | number | boolean | null;
// ^ The four JSON primitives — these are the BASE CASES

type JsonArray = JsonValue[];
// ^ A JSON array contains JSON values — RECURSION via JsonValue

type JsonObject = { [key: string]: JsonValue };
// ^ A JSON object has string keys with JSON values — RECURSION

type JsonValue = JsonPrimitive | JsonArray | JsonObject;
// ^ The union of all possible JSON values
// ^ JsonArray and JsonObject refer back to JsonValue
// ^ This is INDIRECT RECURSION: JsonValue → JsonArray → JsonValue
```

This is **indirect recursion**: `JsonValue` doesn't directly reference
itself, but goes through `JsonArray` and `JsonObject`,
which in turn reference `JsonValue`. TypeScript understands this.

---

<!-- /depth -->
## Explain It to Yourself: Why Is the JSON Type Complete?
<!-- section:summary -->
The answer: JSON knows exactly **six** value types — String, Number,

<!-- depth:standard -->
> **Explain it to yourself:**
>
> Why does `type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }`
> truly cover **all** possible JSON documents?
>
> Think about the JSON specification: what value types exist, and how
> does the type definition represent them?
>
> *Take 30 seconds to think.*

The answer: JSON knows exactly **six** value types — String, Number,
Boolean, Null, Array, and Object. Our type maps exactly these six.
The Array and Object are defined recursively (contain JsonValue),
the four primitives are the leaves/base cases.

---

<!-- /depth -->
## JSON Type in Practice: Why Not `any`?
<!-- section:summary -->
You might be wondering: "Why not just use `any` for JSON?"

<!-- depth:standard -->
You might be wondering: "Why not just use `any` for JSON?"
Here's why:

```typescript annotated
// BAD: any loses all type safety
function parseConfig(json: string): any {
  return JSON.parse(json);
  // ^ JSON.parse returns 'any' — everything allowed, nothing checked
}

const config = parseConfig('{"port": 8080}');
config.potr;  // No error! Typo goes undetected
// ^ 'any' allows EVERY access — even wrong ones

// BETTER: JsonValue enforces JSON-compatible structures
function parseJsonSafe(json: string): JsonValue {
  return JSON.parse(json) as JsonValue;
  // ^ We cast to JsonValue — not perfect, but better than any
}

// IDEAL: Validation + concrete type
function parsePort(json: string): { port: number } {
  const parsed: JsonValue = JSON.parse(json) as JsonValue;
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    // ^ Narrowing: we check that it's a JsonObject
    const port = parsed["port"];
    if (typeof port === "number") {
      return { port };
    }
  }
  throw new Error("Invalid configuration");
}
```

---

<!-- /depth -->
## DOM Trees: Recursion in the Browser
<!-- section:summary -->
The DOM (Document Object Model) is a prime example of a

<!-- depth:standard -->
The DOM (Document Object Model) is a prime example of a
recursive tree structure. Each element can contain child elements,
which in turn have child elements:

```typescript annotated
// Simplified DOM node type
type DomNode = TextNode | ElementNode;

type TextNode = {
  type: "text";
  content: string;
  // ^ Leaf node: has no children (base case)
};

type ElementNode = {
  type: "element";
  tag: string;
  attributes: Record<string, string>;
  children: DomNode[];
  // ^ RECURSION: children are DomNode again
};

// Example: <div class="app"><p>Hello <b>World</b></p></div>
const dom: DomNode = {
  type: "element",
  tag: "div",
  attributes: { class: "app" },
  children: [
    {
      type: "element",
      tag: "p",
      children: [
        { type: "text", content: "Hello " },
        // ^ TextNode — base case
        {
          type: "element",
          tag: "b",
          attributes: {},
          children: [
            { type: "text", content: "World" },
            // ^ TextNode — base case
          ],
        },
      ],
      attributes: {},
    },
  ],
};
```

This is a **Discriminated Union** (`type: "text" | "element"`)
combined with recursion — an extremely common pattern.

---

<!-- /depth -->
## AST Types: Code That Describes Code
<!-- section:summary -->
Compilers and linters work internally with **Abstract Syntax Trees** (ASTs).

<!-- depth:standard -->
Compilers and linters work internally with **Abstract Syntax Trees** (ASTs).
These are also recursive:

```typescript annotated
// Simplified expression AST (how TypeScript works internally)
type Expression =
  | NumberLiteral
  | StringLiteral
  | BinaryExpression
  | CallExpression;

type NumberLiteral = {
  kind: "NumberLiteral";
  value: number;
  // ^ Leaf: no sub-expressions
};

type StringLiteral = {
  kind: "StringLiteral";
  value: string;
  // ^ Leaf: no sub-expressions
};

type BinaryExpression = {
  kind: "BinaryExpression";
  left: Expression;
  // ^ RECURSION: left operand is an expression again
  right: Expression;
  // ^ RECURSION: right operand is an expression again
  operator: "+" | "-" | "*" | "/";
};

type CallExpression = {
  kind: "CallExpression";
  callee: Expression;
  // ^ RECURSION: the called function is an expression
  arguments: Expression[];
  // ^ RECURSION: the arguments are expressions
};

// Example AST for: add(1, 2 * 3)
const ast: Expression = {
  kind: "CallExpression",
  callee: { kind: "StringLiteral", value: "add" },
  arguments: [
    { kind: "NumberLiteral", value: 1 },
    {
      kind: "BinaryExpression",
      left: { kind: "NumberLiteral", value: 2 },
      right: { kind: "NumberLiteral", value: 3 },
      operator: "*",
    },
  ],
};
```

<!-- depth:vollstaendig -->
> **Think about it:**
>
> How would you write an `evaluate` function that evaluates an
> `Expression` AST? It would need to be **recursive** —
> just like the type itself. Why do these fit together so naturally?

---

<!-- /depth -->
## Nested Menus and Configurations
<!-- section:summary -->
In everyday work you encounter recursive types most often with **navigation

<!-- depth:standard -->
In everyday work you encounter recursive types most often with **navigation
menus** and **configurations**:

```typescript annotated
// Menu with arbitrarily deep nesting
type MenuItem = {
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
  // ^ RECURSION: sub-menus are MenuItems again
  // ^ Optional (?) is the base case
};

const navigation: MenuItem[] = [
  {
    label: "Products",
    children: [
      {
        label: "Software",
        children: [
          { label: "IDE", href: "/products/ide" },
          { label: "CLI Tools", href: "/products/cli" },
          // ^ Leaves: no children
        ],
      },
      { label: "Hardware", href: "/products/hardware" },
    ],
  },
  { label: "About Us", href: "/about" },
  // ^ Leaf: no children
];
```

---

<!-- /depth -->
## Experiment: Testing the JSON Type

> **Experiment:**
>
> Define the `JsonValue` type and test it:
>
> ```typescript
> type JsonValue =
>   | string | number | boolean | null
>   | JsonValue[]
>   | { [key: string]: JsonValue };
>
> // Test 1: Simple values
> const a: JsonValue = "hello";
> const b: JsonValue = 42;
> const c: JsonValue = true;
> const d: JsonValue = null;
>
> // Test 2: Nested
> const config: JsonValue = {
>   database: {
>     host: "localhost",
>     port: 5432,
>     options: {
>       ssl: true,
>       pool: { min: 2, max: 10 },
>     },
>   },
>   features: ["auth", "logging", ["nested", "array"]],
> };
>
> // Test 3: What gets REJECTED?
> // const bad: JsonValue = new Date();        // Error!
> // const bad2: JsonValue = undefined;        // Error!
> // const bad3: JsonValue = () => {};         // Error!
> // const bad4: JsonValue = { fn: () => {} }; // Error!
> ```
>
> Observe: `Date`, `undefined`, and functions are **not JSON**.
> The type correctly rejects them!

---

## Framework Connection: Virtual DOM and Recursive Rendering

> **In React** the Virtual DOM (`ReactNode`) is a recursive type:
>
> ```typescript
> // Simplified from @types/react
> type ReactNode =
>   | string
>   | number
>   | boolean
>   | null
>   | undefined
>   | ReactElement
>   | ReactNode[];  // ← Recursion!
>
> // ReactElement in turn contains children: ReactNode
> interface ReactElement {
>   type: string | ComponentType;
>   props: { children?: ReactNode; [key: string]: unknown };
> }
> ```
>
> This is structurally identical to our JSON type! Primitives
> (string, number) are leaves, arrays and elements with children
> are the recursive nodes.
>
> **In Angular** you find the same structure in template ASTs:
>
> ```typescript
> // Angular Compiler AST (simplified)
> interface TmplAstElement {
>   name: string;
>   attributes: TmplAstAttribute[];
>   children: TmplAstNode[];  // ← Recursion!
> }
> type TmplAstNode = TmplAstElement | TmplAstText | TmplAstBoundText;
> ```

---

## Summary

### What you learned

You've seen how recursive types model **real data structures**:

- **JSON** is the most important recursive type — primitives as base cases
- **DOM trees** use Discriminated Unions + recursion (TextNode vs ElementNode)
- **ASTs** (Abstract Syntax Trees) model code as recursive types
- **Menus and configurations** are the most common recursive structures in daily work
- **Indirect recursion** (A → B → A) is just as valid as direct self-reference

> **Core concept:** Recursive types describe data structures with
> **arbitrary depth** — JSON, DOM, ASTs, menus. Primitives
> (string, number, null) are always the leaves/base cases,
> containers (arrays, objects with children) are the recursive nodes.

---

> **Pause point** — You can now type real tree structures.
> In the next section we'll build **deep operations** — recursive
> utility types like DeepPartial, DeepReadonly, and DeepRequired.
>
> Continue: [Section 03 - Deep Operations](./03-deep-operationen.md)