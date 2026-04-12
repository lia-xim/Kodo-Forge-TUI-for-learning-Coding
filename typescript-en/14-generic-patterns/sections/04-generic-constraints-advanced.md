# Section 4: Advanced Generic Constraints

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Generic Higher-Order Functions](./03-generic-hof.md)
> Next section: [05 - Real-World Generics](./05-real-world-generics.md)

---

## What you'll learn here

- Conditional Constraints: restricting types based on conditions
- Recursive Constraints: types that reference themselves
- `const` Type Parameters (TS 5.0): enforcing literal inference without `as const`
- Mapped Constraints: linking keys and values to each other

---

## Background: Ryan Cavanaugh and the Conditional Types Moment

It was 2018, TypeScript 2.8. Ryan Cavanaugh, then Engineering Lead of the
TypeScript team, announced something in a GitHub issue that immediately caught
the community's attention: Conditional Types. The reaction was a mix of
excitement and alarm — the type system was suddenly Turing-complete.

With Conditional Types (`T extends string ? X : Y`), types could for the first time
make CONDITIONAL decisions. This enabled Utility Types like `ReturnType<T>`,
`Parameters<T>`, `Awaited<T>` — all made possible only through Conditional Types.
The entire TypeScript standard library was rewritten in the months that followed
to take advantage of this feature.

This section shows you how to use the same technique in your own abstractions.

---

## Conditional Constraints

In lesson 13 you learned simple constraints: `T extends string`.
Now we combine constraints with **Conditional Types** — the return type
depends on the input type:

```typescript annotated
type ProcessResult<T> = T extends string ? string : number;

function processValue<T extends string | number>(
  value: T
): ProcessResult<T> {
  if (typeof value === "string") {
    return value.toUpperCase() as ProcessResult<T>;
  }
  return (value * 2) as ProcessResult<T>;
}

const s = processValue("hello"); // Type: string
const n = processValue(42);       // Type: number
```

### Conditional Required Fields

```typescript annotated
type WithTimestamps<T, HasTS extends boolean> =
  HasTS extends true
    ? T & { createdAt: Date; updatedAt: Date }
    : T;

function createRecord<T extends object, H extends boolean>(
  data: T,
  addTimestamps: H
): WithTimestamps<T, H> {
  if (addTimestamps) {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WithTimestamps<T, H>;
  }
  return data as WithTimestamps<T, H>;
}

const withTs = createRecord({ name: "Alice" }, true);
// ^ Type: { name: string } & { createdAt: Date; updatedAt: Date }
console.log(withTs.createdAt); // OK

const withoutTs = createRecord({ name: "Bob" }, false);
// ^ Type: { name: string }
// withoutTs.createdAt; // Error! Property does not exist
```

> 🧠 **Explain it to yourself:** Why do you need `as WithTimestamps<T, H>`
> in the function body? Can't TypeScript infer that automatically?
> **Key points:** TypeScript cannot narrow Conditional Types through control flow | if(addTimestamps) does NOT tell the compiler that H = true | The cast bridges this limitation

> 💭 **Think about it:** Conditional Types can be distributive: when `T` is a
> union, the Conditional Type is applied to EVERY member of the union.
> `ProcessResult<string | number>` therefore yields `string | number`. What would
> be the result of `ProcessResult<string | boolean>`? Think it through first,
> then try it in the TypeScript Playground.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> type IsArray<T> = T extends any[] ? true : false;
>
> type A = IsArray<string[]>;    // What is the type?
> type B = IsArray<number>;      // What is the type?
> type C = IsArray<string | string[]>; // Surprise: what happens here?
>
> // Bonus: How can you extract the element type of an array?
> type ElementType<T> = T extends (infer U)[] ? U : never;
> type D = ElementType<string[]>;  // string
> type E = ElementType<number[]>;  // number
> type F = ElementType<string>;    // never
> ```
> The `infer` keyword is the bridge between Conditional Types and
> type extraction. You'll explore it more deeply in L15 (Utility Types).

---

## Recursive Constraints

Some data structures reference themselves. The classic example:
trees.

```typescript annotated
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function findInTree<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): T | undefined {
  if (predicate(node.value)) return node.value;

  for (const child of node.children) {
    const found = findInTree(child, predicate);
    if (found !== undefined) return found;
  }
  return undefined;
}

const fileTree: TreeNode<string> = {
  value: "/",
  children: [
    {
      value: "/src",
      children: [
        { value: "/src/index.ts", children: [] },
        { value: "/src/utils.ts", children: [] },
      ],
    },
    { value: "/package.json", children: [] },
  ],
};

const found = findInTree(fileTree, v => v.includes("utils"));
// ^ Type: string | undefined
```

### DeepPartial — Recursive Utility Type

A frequently needed utility type that makes all properties optional at every level:

```typescript annotated
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Config {
  server: {
    host: string;
    port: number;
    ssl: { enabled: boolean; cert: string };
  };
  database: { url: string; poolSize: number };
}

function mergeConfig(base: Config, overrides: DeepPartial<Config>): Config {
  return JSON.parse(JSON.stringify({ ...base, ...overrides }));
}

// Changing just a single nested field:
mergeConfig(defaultConfig, {
  server: { ssl: { enabled: true } }
  // host, port, cert, database — all optional!
});
```

> **How to read recursive types?** Start with the outermost type.
> `DeepPartial<Config>` makes the first level optional. For every property
> that is an `object`, `DeepPartial` is applied AGAIN — infinitely deep.

> 📖 **Background: Recursive Types and the Compiler Depth Limit**
>
> TypeScript allows recursive types, but has a built-in safeguard:
> if recursion goes too deep (typically > 50 levels), the compiler aborts with
> "Type instantiation is excessively deep". This is not a bug — it prevents
> infinite loops in the type system. In practice, real data is rarely deeper
> than 5–10 levels. `DeepPartial<Config>` is completely safe.

> ⚡ **Angular connection:** In Angular projects with complex configuration objects
> (e.g. chart libraries, editor configs) you'll frequently need `DeepPartial<T>`.
> Instead of `Partial<ChartConfig>` (only one level optional),
> `DeepPartial<ChartConfig>` gives you the freedom to override only what you
> want to change — no matter how deeply nested it is.

---

## const Type Parameters (TypeScript 5.0)

One of the most useful features since TS 5.0: `const` before a type parameter
enforces literal inference — without the caller needing to write `as const`.

### The Problem without const

```typescript annotated
function getRoutes<T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes1 = getRoutes(["home", "about", "contact"]);
// ^ Type: string[] — the concrete values are LOST!
```

### The Solution: const before the Type Parameter

```typescript annotated
function getRoutes<const T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes2 = getRoutes(["home", "about", "contact"]);
// ^ Type: readonly ["home", "about", "contact"] — EXACT!
```

`const T` tells the compiler: "Infer the most precise type — as if
the caller had written `as const`."

### Practical Example

```typescript annotated
function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
  contact: "/contact",
});
// ^ Type: { readonly home: "/"; readonly about: "/about"; readonly contact: "/contact" }

type RouteName = keyof typeof routes;
// ^ "home" | "about" | "contact" — not string!
```

### When to use const Type Parameters?

| Situation | const needed? |
|-----------|---------------|
| You need Literal Types in the return value | Yes |
| You're building a config/definition API | Yes |
| You're processing the value generically (identity) | No |
| Primitive values (string, number) | Not needed — already literal |

> ⚡ **React connection:** In React projects with routing (React Router, TanStack
> Router) you'll see patterns similar to `defineRoutes`. TanStack Router uses
> exactly this feature: route definitions are inferred as Literal Types, so
> `<Link to="/about">` is checked at compile time.
> With `const T`, the caller doesn't need to write `as const`.

---

## Mapped Constraints: Linking Keys and Values

When key and value must match each other, you need a type map:

```typescript annotated
type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string; code: number };
  resize: { width: number; height: number };
};

function on<K extends keyof EventMap>(
  event: K,
  handler: (data: EventMap[K]) => void
): void {
  // Registration...
}

on("click", (data) => {
  console.log(data.x, data.y);
  // data has type { x: number; y: number } — automatically!
});

on("keydown", (data) => {
  console.log(data.key);
  // data has type { key: string; code: number }
});
```

> **Why does this work?** When TypeScript infers `K` as `"click"`,
> `EventMap[K]` resolves to `EventMap["click"]` = `{ x: number; y: number }`.
> Key and handler are therefore ALWAYS consistent.

> ⚡ **Angular connection:** The Mapped Constraint pattern underlies Angular's
> `Output` system and the new Signal system. When you write
> `@Output() userSelected = new EventEmitter<User>()`,
> `EventEmitter<T>` is exactly this pattern: the event name is implicitly
> defined by the property, the payload type by the generic `<T>`.
> With Signals you'll see `signal<User[]>([])` — the same pattern again.

---

## What you've learned

- Conditional Constraints (`T extends string ? X : Y`) make the return type dependent on the input
- Recursive types like `DeepPartial<T>` traverse nested structures of arbitrary depth
- `const T` in TS 5.0 enforces literal inference without `as const` at the call site
- Mapped Constraints link key and value types — a misspelled event name is a compile error

**Core concept:** Advanced constraints are no longer just restrictions
— they are descriptions of relationships between types. When key and payload
are linked together, no typo can go unnoticed anymore.
That is the difference between a simple type system and a type system
that understands your architecture.

---

> **Pause point** — Advanced Constraints significantly expand your repertoire.
> Now comes the practical test: real-world architecture patterns.
>
> Continue with: [Section 05 — Real-World Generics](./05-real-world-generics.md)