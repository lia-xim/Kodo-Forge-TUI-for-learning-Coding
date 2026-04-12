# Section 1: ES Modules — The Modern Module System

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start of lesson)
> Next section: [02 - CommonJS Interop](./02-commonjs-interop.md)

---

## What you'll learn here

- Why the JavaScript ecosystem was stuck in **module chaos** for years and how ES Modules solved it
- The difference between **Named Exports** and **Default Exports** — and why Named Exports are almost always better
- How **`import type`** works and why it improves your bundle output
- How **Barrel Files** (index.ts) simplify imports and when they become an anti-pattern

---

## Background story: The great JavaScript module chaos

In 2009, JavaScript was a toy. There was no official module system.
If you wanted to split code across multiple files, you stacked `<script>` tags
and hoped for global variables. This led to inevitable collisions:
`window.utils` from file A would be overwritten by `window.utils` from file B.

When Node.js appeared in 2009, Ryan Dahl solved the problem pragmatically: **CommonJS**.
The idea was simple — each file has its own scope, you export
explicitly with `module.exports` and import with `require()`. It worked.
But `require()` is **synchronous**, which is catastrophic in the browser (blocks the main thread).

So the community invented alternatives: **AMD** (Asynchronous Module Definition),
**UMD** (Universal Module Definition), **SystemJS**. Bundlers like
RequireJS, Browserify, and Webpack emerged. The ecosystem fragmented — a library
might support AMD but not CommonJS, or vice versa.

In 2015, TC39 (the JavaScript standards committee) solved the problem definitively with
**ES Modules** in ES2015 (ES6). This was the first native module syntax in JavaScript.
Browser support arrived in 2017 (Chrome 61, Firefox 60, Safari 10.1). The specification
is statically analyzable — this enables tree-shaking, circular dependency detection,
and better tooling support than ever before.

TypeScript has supported ES Modules from the beginning — and is today the recommended
module system for all new projects.

---

## Named Exports — The recommended approach

Named Exports are explicit. The name used at export must also be used at import
(or deliberately renamed with `as`). This makes refactoring safe
and enables auto-imports in editors and IDEs.

```typescript annotated
// math.ts
export function add(a: number, b: number): number {
// ^ "export" makes this function public — visible to other modules
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export const PI = 3.14159;
// ^ Constants can be exported directly as well

export interface MathResult {
// ^ Interfaces can be exported too — but note: they disappear
//   after compilation (type erasure). Only the JavaScript runtime behavior remains.
  value: number;
  operation: string;
}
```

```typescript annotated
// app.ts
import { add, multiply, PI } from './math';
// ^ Named import: curly braces, name must match exactly

import { add as addition } from './math';
// ^ Alias: when the name collides with something or you want to rename it

import * as math from './math';
// ^ Namespace import: all exports as an object — math.add(), math.PI
math.add(1, 2);
```

---

## Default Exports — For classes and main exports

Default Exports are intended for the "main export" of a file. A file
can only have one Default Export. The name at import is freely chosen.

```typescript annotated
// logger.ts
export default class Logger {
// ^ "export default" — there is exactly one default export per file
  log(msg: string) {
    console.log(`[LOG] ${msg}`);
  }
}
```

```typescript annotated
// app.ts
import Logger from './logger';
// ^ No curly braces — the name is freely chosen

import MyLogger from './logger';
// ^ Also valid! That's exactly the problem: inconsistent names
//   make refactoring and code navigation harder in a team
```

> **Best Practice — Prefer Named Exports:**
> Default Exports look convenient at first, but lead to problems:
> - Auto-import doesn't reliably find the right name
> - In a team, everyone names the import differently (`Logger`, `MyLogger`, `AppLogger`)
> - When you rename the file, nobody needs to update import names —
>   which causes the code to become inconsistent and hard to understand
>
> The Angular Style Guide and the TypeScript team itself recommend Named Exports
> for almost all cases. Default Exports make sense only where a
> convention requires them (React components, Next.js pages, etc.).

---

## Type-Only Imports — Cleaner bundle output

TypeScript 3.8 introduced `import type`. TypeScript 4.5 extended it with
inline syntax. The reason: sometimes you only need an import for
type annotations — never as a value at runtime.

```typescript annotated
// Regular import — stays in the compiled JavaScript
import { UserService } from './services';
// ^ This import is executed. Module code runs. Side effects possible.

// Type-only import — gets COMPLETELY removed
import type { User, UserConfig } from './types';
// ^ TypeScript deletes this line during compilation. No runtime cost.
//   Perfect when you only need the type for parameter or return type annotations.

// Inline type import (TS 4.5) — mix of both
import { UserService, type User } from './services';
// ^ UserService is imported (value), User is removed (type only)
//   This is the most modern and explicit variant
```

> **When to use `import type`?**
> Whenever you need an import only for type annotations and the value
> is never referenced at runtime. This has several benefits:
> - **No unintended side effects**: module is not executed
> - **Better tree-shaking support** for bundlers like Vite and esbuild
> - **Clear communication**: anyone reading the code immediately sees "this is just a type"

---

> **Experiment:** Copy the following into the TypeScript Playground (typescriptlang.org):
>
> ```typescript
> // Define two "modules" as types
> interface User { name: string; age: number; }
> function getUser(): User { return { name: "Max", age: 30 }; }
>
> // Variant 1: Regular import style
> const user1: User = getUser();
>
> // Variant 2: What would "type-only" mean here?
> // Look at the compiled JavaScript output in the Playground.
> // Click the ".JS" tab at the top right.
> // What do you see? The interface definition is gone!
> // That's type erasure in action — exactly what import type simulates.
> ```
>
> Now change `interface User` to `class User { name = ""; age = 0; }`.
> Look at the JS output. What changes? Classes are preserved,
> interfaces disappear — that's why TypeScript distinguishes between
> value imports and type imports.

---

## Re-exports and Barrel Files

A **Barrel File** (almost always named `index.ts`) bundles the exports of a
directory. Instead of `import { add } from './lib/math'` and
`import { Logger } from './lib/logger'` you simply write
`import { add, Logger } from './lib'`.

```typescript annotated
// lib/index.ts — the barrel file
export { add, multiply, PI } from './math';
// ^ Re-export of named exports — add and multiply come from math.ts

export { default as Logger } from './logger';
// ^ Re-export of a default export as a named export — now it's always called Logger

export type { MathResult } from './math';
// ^ Re-export of the type only (type-only). In JS output: completely removed.

export * from './utils';
// ^ Re-export all named exports from utils.ts (caution: no default!)
```

> **Barrel Files and tree-shaking — the hidden trade-off:**
> Barrel files sound elegant, but can sabotage tree-shaking.
> When a bundler sees `import { add } from './lib'` and the barrel file
> has many re-exports, it may need to analyze the entire barrel —
> which with side-effect imports can lead to unexpected code in the bundle.
> Modern bundlers (Vite, esbuild) are smart enough, but always check
> your bundle analysis when size matters.

---

**In your Angular project:**
Angular uses barrel files extensively. Look at the `public-api.ts` in an
Angular library — that's a barrel file that defines which types and
classes are visible externally. When you create a new service or directive,
you add the export there.

```typescript annotated
// my-lib/src/public-api.ts — Angular library barrel
export * from './lib/my-lib.module';
// ^ The entire module is exported

export * from './lib/services/user.service';
// ^ UserService is now importable from outside

export type { User, UserConfig } from './lib/models/user.model';
// ^ Types are exported, but as type-only — no runtime overhead
```

---

> **Explain it to yourself:** What is the difference between `import { X } from './module'`
> and `import type { X } from './module'`? When does the second variant make a
> functional difference and when is it just documentation?
>
> **Key points:**
> - With `import type`, TypeScript removes the line completely during compilation
> - The difference is functional with `isolatedModules: true` (Vite, esbuild)
>   — there, TS must know whether an import is a type without analyzing other files
> - With regular tsc builds it's more about documentation and preventing side effects
> - Practical difference: module code (initialization, side effects) does not run

---

> **Think about it:** Angular and React have different conventions:
> Angular components are named exports, React components are usually default exports.
> Which variant helps more with refactoring and why? What happens when you
> move a React component from `UserCard.tsx` to a file `ProfileCard.tsx`?

---

## What you've learned

- **Named Exports** are explicit and refactoring-safe. Prefer them over Default Exports in almost all cases
- **`import type`** removes imports during compilation — perfect for pure type references and `isolatedModules` compatibility
- **Barrel Files** (index.ts) simplify imports but can affect tree-shaking
- **Namespace imports** (`import * as math`) collect all exports as an object — convenient but rarely necessary
- **Side-effect imports** (`import './polyfills'`) execute module code without importing values

**Core concept:** ES Modules are static — all imports and exports are known at compile time. That's why tree-shaking, IDE auto-imports, and `import type` are possible at all.

---

## Quick reference: Import variants at a glance

| Syntax | Name | When to use |
|--------|------|-------------|
| `import { add } from './math'` | Named import | Standard — always prefer |
| `import { add as addition } from './math'` | Named import with alias | On name collision |
| `import * as math from './math'` | Namespace import | When many exports are used together |
| `import Logger from './logger'` | Default import | Convention-driven (React components, etc.) |
| `import './polyfills'` | Side-effect import | Polyfills, CSS, initialization |
| `import type { User } from './types'` | Type-only import | Types only, no runtime code |
| `import { Service, type User } from './x'` | Inline type import | Mix of value and type (TS 4.5+) |

---

> **Pause point** — Take a moment. You've understood the building blocks of the
> modern JavaScript module system: how exports work,
> why named exports are called named exports, and what `import type` actually does.
>
> Continue with: [Section 02 — CommonJS Interop and Module Resolution](./02-commonjs-interop.md)