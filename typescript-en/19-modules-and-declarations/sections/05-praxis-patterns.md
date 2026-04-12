# Section 5: Practical Patterns — Everything Together in Real Projects

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Module Augmentation](./04-module-augmentation.md)

---

## What You'll Learn Here

- How to **meaningfully organize types** in a real project — which file belongs where
- What **Triple-Slash Directives** are, why they exist, and when you still need them today
- **Declaration Merging for plugin systems** — how large libraries like Vue.js and VSCode use this
- The most common module errors and their solutions — with a deep understanding of why they occur

---

## Background Story: How TypeScript Organizes Its Own Types

TypeScript is open source and you can look inside `node_modules/typescript/lib/` to see
how the TypeScript team organizes its own types. You'll find files like
`lib.dom.d.ts` (over 18,000 lines), `lib.es2015.promise.d.ts`,
`lib.es2022.array.d.ts` — each describing one part of the JavaScript standard library.

What you won't see: a single, monolithic file. Instead, the opposite —
dozens of small, thematically focused `.d.ts` files assembled together
via Triple-Slash Directives.

```typescript
// lib.es2022.d.ts (simplified, real TypeScript library):
/// <reference lib="es2021" />
/// <reference lib="es2022.array" />
/// <reference lib="es2022.error" />
/// <reference lib="es2022.intl" />
/// <reference lib="es2022.object" />
/// <reference lib="es2022.string" />
```

This is the only legitimate modern use case for Triple-Slash Directives:
**assembling type libraries**. For application code, there are better approaches.

---

## Triple-Slash Directives — History and Modern Usage

Triple-Slash Directives (`/// <reference ... />`) were the original solution
for linking `.d.ts` files — before `tsconfig.json` existed (prior to TypeScript 1.5).
Today they are mostly outdated, but you'll encounter them in older code.

```typescript annotated
/// <reference types="node" />
// ^ Loads @types/node — equivalent to "node" in tsconfig.json "types" array.
//   TODAY: Prefer tsconfig.json instead. But sometimes necessary in .d.ts files
//   when the file is used standalone (without tsconfig context).

/// <reference path="./custom-types.d.ts" />
// ^ References a specific .d.ts file by path.
//   TODAY: Use tsconfig.json "include" or "files". Outdated for app code.

/// <reference lib="es2022" />
// ^ Loads a TypeScript built-in library.
//   MODERN USE CASE: In .d.ts files for libraries that require a specific
//   ES version without modifying tsconfig.
```

> **When do you still need Triple-Slash Directives?**
> Almost never — unless you're writing a `.d.ts` file for a library
> that must work standalone without `tsconfig.json`.
> For application code: always prefer `tsconfig.json`.

---

## Pattern 1: Type Organization in Real Projects

A consistent system for types saves hours of searching:

```
src/
  types/
    env.d.ts          # process.env and window.* extensions (Global Augmentation)
    global.d.ts       # Ambient Declarations for script-loaded libraries
    express.d.ts      # Module Augmentation for Express (or other framework)
    api.ts            # API response types (real TypeScript interfaces, no declare)
    user.ts           # Domain types: User, UserRole, UserConfig
    ui.ts             # UI-related types: ButtonVariant, ThemeColor

  features/
    auth/
      auth.service.ts
      auth.types.ts   # Feature-specific types — DIRECTLY alongside the feature
```

> **Rules of thumb:**
> - `.d.ts` (with declare) belongs in `types/` — only Ambient Declarations and Augmentations
> - Real TypeScript interfaces and types (`interface X {}`, `type X = ...`) belong
>   in `.ts` files — they can be exported and imported like normal code
> - Feature-specific types belong with the feature, not in a global `types/` folder
> - Global augmentations (Window, ProcessEnv) belong centrally in `types/`

---

## Pattern 2: Declaration Merging for Plugin Systems

This is one of the most powerful TypeScript patterns used by large projects.
The idea: a base library defines an extensible interface. Plugins
extend it via augmentation. Everything stays type-safe.

```typescript annotated
// base-framework.ts — the core library

export interface PluginOptions {
  name: string;
  version: string;
}
// ^ Base options that EVERY plugin has

export interface AppConfig {
  plugins: PluginOptions[];
}
// ^ Base config — extended by plugins

export function createApp(config: AppConfig) {
  // Implementation...
}
```

```typescript annotated
// plugin-auth.ts — a plugin extends the config

import './base-framework';
// ^ Makes this file a module (required for Module Augmentation)

declare module './base-framework' {
// ^ Augments the base framework — Interface Merging!

  interface AppConfig {
    auth: {
      provider: 'oauth2' | 'jwt' | 'session';
      secret: string;
      tokenExpiry?: number;
    };
    // ^ Auth plugin adds auth property to AppConfig
  }
}
```

```typescript annotated
// plugin-database.ts — second plugin

import './base-framework';

declare module './base-framework' {
  interface AppConfig {
    database: {
      url: string;
      poolSize?: number;
      ssl?: boolean;
    };
    // ^ Database plugin adds database property
  }
}
```

```typescript annotated
// main.ts — everything together

import { createApp } from './base-framework';
import './plugin-auth';
import './plugin-database';
// ^ These imports activate the augmentations

createApp({
  plugins: [{ name: 'auth', version: '1.0' }],
  auth: {
    provider: 'jwt',
    secret: process.env.JWT_SECRET!
    // ^ TypeScript checks: provider must be 'oauth2' | 'jwt' | 'session'
  },
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: 10
    // ^ database is type-safe via plugin-database augmentation
  }
});
```

> **You already know this pattern:** Vue.js, Vuex, and Pinia use exactly this.
> Angular's HttpClient types, Express middleware types — all are based on
> Declaration Merging. It's not a niche feature; it's the core of
> the TypeScript type ecosystem.

---

> **Experiment:** Copy the following into the TypeScript Playground to see
> Declaration Merging live:
>
> ```typescript
> // Base interface
> interface AppContext {
>   userId: string;
> }
>
> // "Plugin 1" extends it:
> interface AppContext {
>   theme: 'light' | 'dark';
> }
>
> // "Plugin 2" extends it further:
> interface AppContext {
>   locale: string;
> }
>
> // Result: TypeScript merges all three!
> const ctx: AppContext = {
>   userId: "123",
>   theme: "dark",
>   locale: "de-DE"
>   // ^ All three properties are required — all three interfaces were merged
> };
>
> // Try: leave out one property. TypeScript immediately shows the error.
> // This is Interface Merging in its purest form.
> ```

---

## The Most Common Module Errors — Understanding Instead of Googling

```typescript annotated
// ERROR 1: "Cannot find module 'x' or its corresponding type declarations"
import something from 'untyped-lib';
// Cause: Library has neither built-in types nor an @types package
// Solution A: npm install @types/untyped-lib (check if it exists)
// Solution B: Write your own .d.ts: declare module 'untyped-lib' { ... }
// Solution C (quick and dirty):
// In tsconfig.json: "noImplicitAny": false (not recommended!)
```

```typescript annotated
// ERROR 2: "Augmentation of module 'x' not working" or types not recognized
// Common cause: the augmenting file is not a module

// WRONG — no export/import => it's a "Script", not an augmentation!
declare module 'express' {
  interface Request { user?: User }
}

// CORRECT — export {} makes it a module
import 'express'; // or any other import
declare module 'express' {
  interface Request { user?: User }
}
```

```typescript annotated
// ERROR 3: "Declaration file for module 'x' not found"
// Cause: Library has .js but no .d.ts, and no @types
// Solution: Create minimal .d.ts
// types/x.d.ts:
declare module 'x' {
  const x: any;
  export default x;
}
// This is minimal — better: write proper types
```

```typescript annotated
// ERROR 4: Re-exporting types with isolatedModules
// ERROR: "Re-exporting a type when '--isolatedModules' is set"
export { MyType } from './types';

// CORRECT with isolatedModules: true
export type { MyType } from './types';
// ^ TypeScript must know: is MyType a value or a type?
//   With isolatedModules it cannot inspect other files.
//   "export type" explicitly says: it's only a type.
```

---

**In your Angular project:**
The "Cannot find module" error comes up especially when upgrading Angular versions.
Angular 17+ uses `@angular/core` internally with new types. If your library types are
outdated, these steps help:

```typescript annotated
// tsconfig.json — diagnostic settings

{
  "compilerOptions": {
    "traceResolution": true,
    // ^ TypeScript logs how it resolves each import.
    //   Helpful for understanding WHY a module isn't found.
    //   Only enable temporarily — generates a lot of output!

    "diagnostics": true,
    // ^ Shows internal TypeScript diagnostics (compile time, memory, etc.)
    //   For performance diagnostics in large projects.

    "verbatimModuleSyntax": true
    // ^ Enforces that import syntax exactly matches the output.
    //   "import type" must be used for types — always.
    //   Recommended for modern TypeScript projects (TS 5.0+).
  }
}
```

---

> **Explain it to yourself:** In this lesson you've encountered three kinds of `.d.ts` files:
> (1) auto-generated for libraries, (2) custom ones for untyped libraries,
> (3) augmentation files for existing types. What is the fundamental
> difference between these three uses? When do you create each variant?
>
> **Key points:**
> - Auto-generated: you don't create these — `tsc --declaration` or `ng-packagr` does it
> - Custom for untyped libraries: when `@types/x` doesn't exist — describes external shape
> - Augmentation: when you add your own properties to existing types — extends known shape
> - Difference: new description vs. extension. Augmentation cannot remove or change the original.

---

> **Think about it:** Declaration Merging is an "opt-in" feature of TypeScript.
> Other type systems (Haskell, Rust, Flow) don't allow it or severely restrict it.
> Why might that be? What are the risks of Interface Merging for large codebases?
> When can augmentation lead to subtle bugs?

---

## What You've Learned

- **Type organization:** `.d.ts` for Ambient Declarations and Augmentations, `.ts` for real exportable types, feature types alongside the feature
- **Triple-Slash Directives** (`/// <reference ... />`) are outdated for application code — use tsconfig.json
- **Declaration Merging for plugin systems** enables extensible, type-safe architectures without changing source code
- **The most common errors** (Cannot find module, Augmentation not working, re-export errors) have clear causes and solutions
- **`verbatimModuleSyntax: true`** (TS 5.0+) is the modern recommendation for a clean separation of type and value imports

**Core concept:** The TypeScript module system is not just syntax — it's a complete type infrastructure system. Declaration files, augmentation, and module resolution together make it possible to type the entire JavaScript ecosystem without changing a single line of JavaScript.

---

> **Pause point — End of lesson**
>
> You've understood Modules & Declarations in full depth: from the history of
> module chaos through ES Modules and CommonJS interop to Declaration Files,
> Augmentation, and Plugin Patterns. This is the foundation for navigating
> TypeScript confidently in real projects — Angular, Node.js, library development.
>
> Next lesson: [20 - Review Challenge Phase 2](../../20-review-challenge-phase-2/README.md)