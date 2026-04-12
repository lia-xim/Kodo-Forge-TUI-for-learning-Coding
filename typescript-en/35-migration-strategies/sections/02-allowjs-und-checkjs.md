# Section 2: allowJs and checkJs Strategy

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Migration Paths Overview](./01-migrationspfade-im-ueberblick.md)
> Next section: [03 - Enabling Strict Mode Incrementally](./03-strict-mode-stufenweise.md)

---

## What you'll learn here

- How `allowJs` and `checkJs` form the **bridge** between JavaScript and TypeScript
- How **JSDoc annotations** make JavaScript files type-safe WITHOUT renaming them
- How `@ts-check` and `@ts-nocheck` give fine-grained control
- A concrete **migration workflow** with allowJs as the first step

---

## Background: The Bridge Between Worlds

> **Origin Story: Why allowJs exists**
>
> In TypeScript's early history (2012–2014), there was a hard either-or
> choice: a file was either TypeScript (.ts) or JavaScript (.js). There
> was no coexistence. This made migration an all-or-nothing endeavor —
> the exact opposite of TypeScript's philosophy of gradual adoption.
>
> allowJs was introduced in TypeScript 1.8 (2016). It allows .js files
> in the same project as .ts files. checkJs (TypeScript 2.3, 2017) went
> even further: it checks JavaScript files for type errors — using
> JSDoc comments and type inference. Together, these features enabled
> the gradual migration that is standard practice today.

allowJs and checkJs are the tools that make gradual migration possible
in the first place. They let you USE TypeScript types before renaming
a single file.

---

## Step 1: Enable allowJs

```typescript annotated
// tsconfig.json — Minimal configuration for a mixed project
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    // ^ Allows .js files in the TypeScript project
    // ^ .ts files can import .js files
    // ^ .js files can import .ts files
    "outDir": "./dist",
    "strict": false
    // ^ IMPORTANT: enable strict later!
    // ^ During migration: get it compiling first, then tighten up
  },
  "include": ["src/**/*"]
  // ^ Includes BOTH: .ts and .js files
}
```

What changes with allowJs?

- .js files are **included** by the compiler (previously ignored)
- Imports between .js and .ts work **bidirectionally**
- TypeScript infers types in .js files as best it can
- .js files are NOT checked for type errors (you need checkJs for that)

> 💭 **Think about it:** If allowJs is active and you write `import { helper } from './utils.js'`
> in a .ts file — what type does `helper` have?
>
> **Answer:** TypeScript tries to infer the type. If utils.js has
> `export function helper(x) { return x + 1; }`, TS infers:
> `helper: (x: any) => any`. Without type annotations, everything is `any`.
> With JSDoc it gets better (next section).

---

## Step 2: Enable checkJs

checkJs goes one step further — it checks JavaScript files for type errors:

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
    // ^ NOW checks .js files for type errors!
    // ^ Without annotations: type inference (often "any")
    // ^ With JSDoc: real type checking
  }
}
```

The problem: checkJs immediately finds hundreds of "errors" in existing
JavaScript. The solution: `@ts-nocheck` for files you don't want to migrate yet:

```typescript annotated
// @ts-nocheck
// ^ First line of the file — disables checkJs for this file
// ^ Use this as a "not migrated yet" marker

// Conversely: enable @ts-check in individual .js files
// (without global checkJs: true)

// @ts-check
// ^ Enables type checking ONLY for this file
// ^ Useful when you don't want to enable checkJs globally yet
// ^ Good for the "file by file" approach

// And for individual lines:
// @ts-ignore
// ^ Ignores the error on the NEXT line
// @ts-expect-error
// ^ Better than @ts-ignore: errors if the line has NO error
// ^ Automatically becomes obsolete when the error is fixed
```

> 🧠 **Explain it to yourself:** What is the difference between `@ts-ignore` and `@ts-expect-error`? Why is `@ts-expect-error` better for migrations?
> **Key points:** @ts-ignore always suppresses | @ts-expect-error EXPECTS an error | When the error is fixed: @ts-ignore stays silent, @ts-expect-error speaks up | @ts-expect-error cleans itself up

---

## JSDoc: Types in JavaScript

JSDoc annotations give JavaScript files real types — without renaming the file:

```typescript annotated
// utils.js — with JSDoc types

/**
 * @param {string} name - The user's name
 * @param {number} age - The age
 * @returns {{ name: string, age: number, isAdult: boolean }}
 */
function createUser(name, age) {
  // ^ TypeScript now knows the types of ALL parameters
  // ^ Autocomplete works, errors are caught
  return { name, age, isAdult: age >= 18 };
}

/** @type {import('./types').Config} */
const config = loadConfig();
// ^ Imports a TypeScript type into JavaScript!
// ^ config now has the full Config type with autocomplete

/** @typedef {{ id: string, email: string }} User */
// ^ Defines a reusable type in JavaScript
// ^ Can be referenced with @type {User}

/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => boolean} predicate
 * @returns {T | undefined}
 */
function find(items, predicate) {
  // ^ Even generics work with JSDoc!
  return items.find(predicate);
}
```

> ⚡ **Framework connection (React):** JSDoc is especially useful for
> React projects that still use JavaScript. You can define prop types
> with JSDoc:
>
> ```javascript
> /**
>  * @param {{ name: string, onSave: (name: string) => void }} props
>  */
> function UserCard({ name, onSave }) {
>   return <div onClick={() => onSave(name)}>{name}</div>;
> }
> ```
>
> The IDE shows autocomplete for props, TypeScript checks usage —
> all without renaming the file from .jsx to .tsx.

---

## The Migration Workflow

Here's what gradual migration with allowJs looks like in practice:

```typescript annotated
// Phase 1: Setup (Day 1)
// tsconfig.json: allowJs: true, checkJs: false, strict: false
// → All .js files are in the project, but not checked

// Phase 2: New files in .ts (from Day 2 onward)
// Rule: every NEW file is created as .ts
// → The TS portion grows naturally with each new file

// Phase 3: Migrate leaf files (Weeks 2–4)
// src/types.js → src/types.ts (define interfaces)
// src/utils.js → src/utils.ts (type utility functions)
// ^ Leaf files have no dependencies → safest migration

// Phase 4: checkJs for individual files (Weeks 4–8)
// File by file: add @ts-check, fix errors
// Or: checkJs: true + @ts-nocheck in files not yet migrated

// Phase 5: Rename files (Weeks 8–12)
// .js → .ts rename (JSDoc → real type annotations)
// Remove JSDoc, use TypeScript syntax
// ^ This is the easiest step — the types already exist

// Phase 6: Strict Mode (Week 12+)
// → Next section!
```

> 🧪 **Experiment:** Create a file `test.js` with the following content and
> observe the behavior with different settings:
>
> ```javascript
> // @ts-check
> function add(a, b) {
>   return a + b;
> }
> const result = add("hello", 42);
> // Question: Does TypeScript catch an error here?
> // Answer: NO — without @param annotations, a and b are "any"
>
> // Now with JSDoc:
> /** @param {number} a @param {number} b */
> function addTyped(a, b) {
>   return a + b;
> }
> const result2 = addTyped("hello", 42);
> // NOW TypeScript reports: "hello" is not a number!
> ```
>
> Notice: Without JSDoc types, @ts-check is toothless. The combination of
> @ts-check + JSDoc gives you real type checking in JavaScript.

---

## Common Pitfalls

```typescript annotated
// Pitfall 1: require() instead of import
// allowJs supports require(), but type inference is weaker:
const fs = require("fs");
// ^ Type: any (no type information!)

import * as fs from "fs";
// ^ Type: typeof import("fs") — full type information
// Solution: switch imports to ES module syntax early

// Pitfall 2: module.exports vs export
// module.exports = { helper };
// ^ TypeScript infers the export type, but not always correctly
// Solution: annotate the exports object with JSDoc or switch to export early

// Pitfall 3: Dynamic properties
// const obj = {};
// obj.name = "test";  // ← ERROR with checkJs!
// ^ TypeScript's type for {} has no 'name' property
// Solution: /** @type {{ name?: string }} */ or const obj = { name: "" };
```

---

## What you've learned

- `allowJs: true` allows **mixed projects** (.js + .ts side by side)
- `checkJs: true` **checks JavaScript files** for type errors
- **JSDoc annotations** give JavaScript real types (params, returns, generics)
- `@ts-check` and `@ts-nocheck` give **per-file control**
- `@ts-expect-error` is better than `@ts-ignore` because it **cleans itself up**
- The workflow: allowJs → new files in .ts → migrate leaves → rename

**Core concept to remember:** allowJs and checkJs are the bridge between JavaScript and TypeScript. You don't have to migrate everything at once — JSDoc + @ts-check give you 80% of the TypeScript benefit in JavaScript files, without renaming them.

---

> **Pause point** — Good moment for a break. You now know how to gradually
> integrate JavaScript files into a TypeScript project.
>
> Continue with: [Section 03: Enabling Strict Mode Incrementally](./03-strict-mode-stufenweise.md)