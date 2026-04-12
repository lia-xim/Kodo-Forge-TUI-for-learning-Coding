# Section 2: CommonJS Interop and Module Resolution

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - ES Modules](./01-es-modules.md)
> Next section: [03 - Declaration Files](./03-declaration-files.md)

---

## What you'll learn here

- Why the JavaScript ecosystem has **two incompatible module systems** at the same time — and why that won't change anytime soon
- What `esModuleInterop` in tsconfig.json actually does — and what TypeScript generates behind the scenes
- How **Module Resolution** works: how TypeScript decides which file an `import` refers to
- Why `"moduleResolution": "bundler"` is the right choice for most projects today

---

## Background: Why do two module systems even exist?

The problem begins in 2009. Node.js was released and immediately needed
a module system — browsers didn't have one yet, and ES Modules didn't exist.
Ryan Dahl and the Node.js community chose **CommonJS** (CJS):

```javascript
// CommonJS — synchronous require()
const fs = require('fs');
const express = require('express');
module.exports = { myFunction };
```

This was pragmatic and worked well for server-side code. Synchronous loading
is unproblematic on the filesystem. Over seven years, hundreds of thousands of
npm packages were written in CommonJS.

Then in 2015 came the **ES Module standard** (ES2015). Finally an official,
statically analyzable module syntax — but asynchronous, and natively available
in browsers. The problem: the npm ecosystem was already enormous and built
entirely on CommonJS.

Since then, we've been living in a mixed system:
- **npm packages:** Mostly CommonJS (older ones), increasingly ESM (newer ones), sometimes both
- **Browser code:** ESM (via bundlers like Vite or Webpack)
- **Node.js:** Supports both since v12 — but with strict rules

TypeScript has to manage this chaos. That's the reason for `esModuleInterop`,
`allowSyntheticDefaultImports`, and the various `moduleResolution` strategies.

---

## The concrete problem: importing CJS modules into ESM code

```typescript annotated
// lodash is a CommonJS package:
// It exports with: module.exports = { chunk, map, filter, ... }
// It has NO "default export" in the ESM sense

// Without esModuleInterop: true
import * as _ from 'lodash';  // Works — _ is the module.exports object
import _ from 'lodash';       // ERROR! "Module has no default export"
// ^ TypeScript knows: lodash has no ESM default, so no default import allowed

// With esModuleInterop: true
import _ from 'lodash';       // Works now!
// ^ TypeScript generates helper code that wraps CJS module.exports as "default"
```

What TypeScript generates behind the scenes with `esModuleInterop: true`:

```typescript annotated
// You write:
import _ from 'lodash';

// TypeScript generates (simplified):
const _1 = require('lodash');
const _ = _1.__esModule ? _1 : { default: _1 };
// ^ If lodash were an ESM module (has __esModule flag), take it directly.
//   Otherwise: wrap it as { default: module } — so the default import works.
// This is the "synthetic default import"
```

---

## tsconfig.json — The important module options

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    // ^ What TypeScript OUTPUTS. ESNext = modern ES Module format.
    //   Other options: "CommonJS" (for Node.js without a bundler), "Node16"

    "moduleResolution": "bundler",
    // ^ How TypeScript RESOLVES IMPORTS — which file does 'lodash' refer to?
    //   "bundler" = like Vite/Webpack do it. Recommended for browser projects.

    "esModuleInterop": true,
    // ^ Enables the compatibility layer for CJS default imports.
    //   Always set to true unless you have specific reasons not to.

    "allowSyntheticDefaultImports": true,
    // ^ Type-check only (no runtime code). Implied by esModuleInterop.
    //   On its own: TypeScript won't complain about default imports from CJS,
    //   but generates no compatibility code.

    "resolveJsonModule": true,
    // ^ import data from './config.json' — enables importing JSON files

    "isolatedModules": true
    // ^ Each file must be compilable on its own (without knowing other files).
    //   Required for Vite, esbuild, and other single-file transpilers.
    //   Consequence: type re-exports need explicit "export type"
  }
}
```

---

## Module Resolution — How TypeScript resolves imports

When you write `import { add } from './math'`, TypeScript needs to know
which file is meant. This is **Module Resolution**. There are several
strategies that differ in their "intelligence".

```
import { add } from './math'

Strategy "node" (classic):
  1. Look for ./math.ts
  2. Look for ./math.tsx
  3. Look for ./math.d.ts
  4. Look for ./math/index.ts
  5. Look for ./math/index.d.ts

Strategy "bundler" (modern, recommended):
  1. Like "node16" but without requiring the .js extension
  2. Reads package.json "exports" field
  3. Reads package.json "types" field
  4. Supports "paths" mapping in tsconfig
```

The key difference: with `node16` you must specify the file extension
in imports for ESM output:

```typescript annotated
// With moduleResolution: "node16" (strict)
import { add } from './math.js';
// ^ You must write .js, even though the file is named math.ts!
//   Confusing? Yes — but it matches actual Node.js ESM behavior

// With moduleResolution: "bundler" (modern)
import { add } from './math';
// ^ No extension needed. Bundlers (Vite, Webpack) find the file themselves.
//   This is the behavior you know from Angular and React.
```

---

> **Experiment:** Open a TypeScript project (or try it in the TypeScript
> Playground) with `isolatedModules: false`:
>
> ```typescript
> // Create two types and test the difference
> interface Config { debug: boolean; }
> const config = { debug: true };
>
> // Variant 1: Export of a class (value)
> export class MyService {}
>
> // Variant 2: Export of an interface (type only)
> export interface MyInterface {}
>
> // What happens when you enable isolatedModules: true?
> // MyInterface export must become "export type { MyInterface }" —
> // because with isolatedModules TypeScript doesn't know whether MyInterface is a type
> // or a value without reading other files.
> ```
>
> That's exactly the problem `isolatedModules: true` is designed to solve:
> Any transpiler (Vite, Babel, esbuild) can compile a file without context.

---

## Module formats at a glance

| Format | Syntax | When | Characteristic |
|--------|--------|------|---------------|
| **CommonJS** | `require()` / `module.exports` | Node.js legacy, npm packages | Synchronous, dynamic |
| **ESM** | `import` / `export` | Browser, modern Node.js, Vite/Webpack | Static, async |
| **UMD** | Wrapper around CJS+AMD | Library packages (lodash, jQuery) | Runs everywhere |
| **AMD** | `define()` / `require()` | Obsolete (RequireJS era) | Asynchronous, browser |

> **Why is UMD worth knowing?** Many older npm packages (lodash, moment, jquery)
> ship UMD bundles. UMD is a wrapper that simultaneously supports CJS, AMD, and global
> script usage. That's why `lodash` works both with `require('lodash')`
> in Node.js and with a `<script>` tag in the browser.
> For new libraries, UMD is no longer recommended — ESM with a CJS fallback is the standard.

---

**In your Angular project:**
Angular projects using Vite or the Angular CLI use `"moduleResolution": "bundler"`.
This explains why you can write `import { Component } from '@angular/core'`
in Angular code without an extension — the bundler knows to look in
`node_modules/@angular/core/index.js`.

When you create a library in Angular (e.g. for a design system), you need to
set the `package.json` "exports" field correctly — otherwise TypeScript with
`node16` resolution can't find the `.d.ts` files.

```typescript annotated
// package.json of your Angular library (simplified)
{
  "name": "@my-company/ui-kit",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // ^ TypeScript finds the type declarations here
      "esm2022": "./dist/esm2022/index.js",
      // ^ Angular CLI uses this entry for modern builds
      "default": "./dist/fesm2022/index.js"
    }
  }
}
```

---

> **Explain it to yourself:** Why does `esModuleInterop: true` solve the problem with
> `import _ from 'lodash'`? What is the difference between `esModuleInterop`
> and `allowSyntheticDefaultImports`?
>
> **Key points:**
> - `esModuleInterop` generates runtime helper code (wrapper function)
> - `allowSyntheticDefaultImports` is type-level only — no runtime code, no protection
> - Both together: TypeScript won't complain (allowSynthetic) AND the generated code works (esModuleInterop)
> - Almost always you want `esModuleInterop: true` — `allowSyntheticDefaultImports` alone is dangerous

---

> **Think about it:** Node.js has supported both CommonJS and ES Modules since v12.
> But you can't simply import ESM into a CJS module or vice versa.
> Why is that? What is the fundamental difference between `require()`
> (synchronous) and `import` (asynchronous) that creates this incompatibility?

---

## What you've learned

- **CommonJS** (require/module.exports) and **ES Modules** (import/export) are two incompatible systems that coexist simultaneously
- **`esModuleInterop: true`** generates runtime helper code so that CJS packages work with ESM default import syntax
- **Module Resolution** determines how TypeScript resolves an import path to an actual file
- **`"moduleResolution": "bundler"`** is the modern standard for Vite, Webpack, and Angular projects
- **`isolatedModules: true`** enforces that each file can be compiled on its own — essential for Vite and esbuild

**Core concept:** `esModuleInterop` is not a cosmetic setting — it changes the generated JavaScript code. Understand what it does before enabling it blindly. In new projects: always `true`.

---

## Quick reference: tsconfig module settings

| Setting | Recommended value | Explanation |
|---------|------------------|-------------|
| `module` | `"ESNext"` | Output format: modern ES Module |
| `moduleResolution` | `"bundler"` | For Vite/Webpack/Angular CLI |
| `esModuleInterop` | `true` | CJS default import support with runtime code |
| `allowSyntheticDefaultImports` | `true` | Implied by esModuleInterop |
| `isolatedModules` | `true` | Required for Vite, esbuild, Babel |
| `resolveJsonModule` | `true` | Enable importing JSON files |
| `verbatimModuleSyntax` | `true` | Modern counterpart to isolatedModules (TS 5.0+) |

> **Rule of thumb for new projects:** Use the tsconfig template from your framework
> (Angular CLI, create-vite) — the defaults are already optimally configured.
> Understand the settings, but don't reinvent the wheel.

---

> **Pause point** — The module system is complex because it grew organically over time.
> You now understand the "why", not just the "how".
>
> Continue with: [Section 03 — Declaration Files and @types](./03-declaration-files.md)