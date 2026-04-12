# Section 3: Declaration Files — Types for the JavaScript World

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - CommonJS Interop](./02-commonjs-interop.md)
> Next section: [04 - Module Augmentation](./04-module-augmentation.md)

---

## What you'll learn here

- What `.d.ts` files are, why they exist, and how TypeScript uses them
- How **DefinitelyTyped** and `@types/*` packages supply the JavaScript world with types
- How to write your own declaration files when a library has no types
- What the `declare` keyword means and when you need "ambient declarations"

---

## Background story: When TypeScript met an untyped world

When TypeScript was released in 2012, a massive JavaScript ecosystem already existed: jQuery, Lodash, Moment.js, Express — thousands of libraries, all without types. The problem: TypeScript couldn't understand these libraries.

`import express from 'express'` and then `app.get('/', ...)` — TypeScript had no idea what `app` was, what methods it had, or what parameters they expected. It fell back to `any`. That was unacceptable.

The solution was elegant: **Declaration Files** (`.d.ts`). A `.d.ts` file describes the **shape** of a JavaScript library without its implementation. It's TypeScript's equivalent of a C/C++ header file — types only, no logic.

Boris Yankov had an idea in 2012: he founded **DefinitelyTyped** (github.com/DefinitelyTyped/DefinitelyTyped), a GitHub repository where the community maintains types for JavaScript libraries. Today, DefinitelyTyped has **over 8,000 packages** with type definitions contributed by a worldwide community. It's one of the largest open-source repositories in the world — with over 100 million npm downloads per week.

The `@types/` namespace on npm is the publicly accessible channel: `npm install @types/lodash` installs the community-maintained types for lodash.

---

## What is a .d.ts file?

A `.d.ts` file contains **only type information** — no executable code. TypeScript reads it to understand what shapes, methods, and types a JavaScript module has. It is never compiled or executed.

```typescript annotated
// math.d.ts — describes math.js (which contains the implementation)
export declare function add(a: number, b: number): number;
// ^ "declare" says: "This function exists in JavaScript, I'm only describing it"
//   There is no implementation here — math.js provides it.

export declare function multiply(a: number, b: number): number;
// ^ Same idea: TypeScript checks calls against this signature,
//   but the actual code runs in math.js

export declare const PI: number;
// ^ Constant: exists in JavaScript, TypeScript knows the type

export interface MathResult {
  value: number;
  operation: string;
}
// ^ Interfaces don't need "declare" — they are pure type constructs
//   and only exist at compile time anyway (type erasure)
```

When you have `math.js` and `math.d.ts` together, here's what happens:
- **TypeScript** reads `math.d.ts` for type-checking
- **Node.js / Browser** executes `math.js`
- `math.d.ts` itself is never executed — it is pure type documentation

---

## @types and DefinitelyTyped in practice

```typescript annotated
// Step 1: Install the library
// npm install lodash
// -> Installs JavaScript code without types

// Step 2: Install types
// npm install --save-dev @types/lodash
// -> Installs node_modules/@types/lodash/index.d.ts

// Step 3: Immediately type-safe
import _ from 'lodash';
const chunks = _.chunk([1, 2, 3, 4], 2);
//                                       ^ TypeScript knows: returns T[][]
//             ^ _.chunk is typed: (array: T[], size?: number) => T[][]
```

TypeScript finds `@types` packages automatically — without any additional configuration. The compiler looks in `node_modules/@types/` and loads all definitions it finds.

> **How do you check whether a library has types?**
> 1. Look in `node_modules/library-name/` for `.d.ts` files (built-in types)
> 2. Look in `node_modules/@types/library-name/` (DefinitelyTyped)
> 3. Check the library's `package.json` for a "types" or "typings" field
> 4. Search on npmjs.com — libraries with types have a blue "TS" badge
>    or a `DT` badge (DefinitelyTyped)

---

## Writing your own declaration files

What do you do when a library has no types and no `@types` package exists? You write your own `.d.ts` file.

```typescript annotated
// types/my-legacy-lib.d.ts

declare module 'my-legacy-lib' {
// ^ "declare module" creates a type definition for an npm module
//   TypeScript matches this string against the import path

  export function doSomething(input: string): Promise<Result>;
  // ^ Describe all exports of the library here

  export function initialize(config: LibConfig): void;

  export interface Result {
    success: boolean;
    data: unknown;
    // ^ "unknown" is more honest than "any" — signals: the type is unknown to us
    //   Callers must validate before using data
    timestamp: number;
  }

  export interface LibConfig {
    apiKey: string;
    timeout?: number;
    retries?: number;
  }
}
```

You need to tell TypeScript where this file lives. This is done via tsconfig.json:

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",
      // ^ Default: load all @types packages
      "./types"
      // ^ Additionally: load custom .d.ts files from the types/ folder
    ]
  },
  "include": ["src/**/*", "types/**/*"]
  // ^ The types/ folder must be in "include" for TypeScript to find it
}
```

---

## The `declare` keyword — Ambient Declarations

`declare` is the keyword for "ambient declarations" — declarations for code that exists outside of TypeScript.

```typescript annotated
// global.d.ts — Ambient declarations for global variables

declare const API_URL: string;
// ^ A global variable coming from a <script> tag or Webpack DefinePlugin.
//   No "export" — it's globally available. TypeScript "trusts" you here.

declare const __DEV__: boolean;
// ^ Typical in bundler configs: Webpack defines __DEV__ at build time.
//   Without this declaration: "Cannot find name '__DEV__'" error

declare function gtag(command: string, ...args: unknown[]): void;
// ^ Google Analytics gtag() is global — loaded via <script>.
//   TypeScript now knows the type and checks calls.

declare class MyGlobalLib {
// ^ Sometimes legacy systems load classes globally via <script> tags.
  static init(config: { apiKey: string }): void;
  static track(event: string): void;
}
```

> **Important distinction:**
> - `declare const x: string` — Ambient declaration: x exists somewhere, TypeScript "takes your word for it"
> - `const x: string = "hello"` — real declaration with implementation
>
> With ambient declarations, the responsibility lies with you: TypeScript does
> not verify whether the value actually exists. If your bundler doesn't
> define `__DEV__`, you'll get a runtime error — TypeScript cannot catch that.

---

> **Experiment:** Open the TypeScript Playground and try the following:
>
> ```typescript
> // Simulate a library without types
> // Write a declare module to describe its "shape":
>
> declare module 'my-untyped-lib' {
>   export function greet(name: string): string;
>   export const VERSION: string;
> }
>
> // Now you can import it (this works as a simulation in the Playground):
> // Note: The Playground cannot load real npm modules,
> // but it understands the declare module syntax.
>
> // Try: What happens when you write greet(42)?
> // TypeScript should show an error — even though the function "doesn't exist".
> // This shows: .d.ts files are real type-checking!
> ```
>
> Now change `greet(name: string)` to `greet(name: unknown)`.
> What changes? Which calls are now accepted?

---

**In your Angular project:**
When you publish an Angular library (using `ng-packagr`), the build process automatically generates `.d.ts` files. That's why other projects can use your library in a type-safe way, even though they only receive the compiled `.js` files.

```typescript annotated
// Auto-generated .d.ts for your Angular service (after ng-packagr build):
import * as i0 from '@angular/core';

export declare class UserService {
  // ^ "declare class" — Angular has this class in .js, TypeScript reads .d.ts
  private http;
  getUser(id: string): import("rxjs").Observable<User>;
  // ^ The return type is fully typed — consumers of the library
  //   get full IDE support without having the source code
  static ɵprov: i0.ɵɵInjectableDeclaration<UserService>;
}

export declare interface User {
  id: string;
  name: string;
  email: string;
}
```

---

> **Explain to yourself:** You find a JavaScript library without types.
> You have three options: (1) `declare module 'lib' { export const x: any }`,
> (2) write a detailed `.d.ts` file, (3) use `@ts-ignore` everywhere you use
> the library. What are the consequences of each option for your team?
>
> **Key points:**
> - Option 1 (any): Fast, but any-contamination — errors won't be caught
> - Option 2 (.d.ts): One-time effort, lasting benefit — the right solution
> - Option 3 (ts-ignore): The worst option — doesn't suppress specific errors, but all errors on that line
> - The time investment for option 2 pays off from the second consumer of the library onward

---

> **Think about it:** DefinitelyTyped is a community project. What happens when
> someone contributes incorrect types for a library? Can you still trust TypeScript
> when you install `@types/lodash`? What is the fundamental
> limitation of `.d.ts` files?

---

## What you've learned

- **`.d.ts` files** describe the shape of a JavaScript library — types only, no implementation
- **`@types/*` packages** (DefinitelyTyped) deliver community-maintained types for over 8,000 JavaScript libraries
- **`declare module 'x'`** enables custom types for libraries without an `@types` package
- **Ambient declarations** (`declare const`, `declare function`) describe global values that exist outside of TypeScript
- **`typeRoots`** in tsconfig.json controls where TypeScript looks for `.d.ts` files

**Core concept:** `.d.ts` files are the bridge between the JavaScript world and the TypeScript type system. They are a matter of trust — TypeScript does not verify whether the described shape actually exists. The responsibility lies with you or the community.

---

> **Pause point** — Good moment to stop. You now understand why
> TypeScript can work with JavaScript libraries even though they have no types.
> DefinitelyTyped is one of the largest community projects in the web world —
> and now you know how it works.
>
> Continue with: [Section 04 — Module Augmentation](./04-module-augmentation.md)