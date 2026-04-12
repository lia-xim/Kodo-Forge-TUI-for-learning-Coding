# Section 4: Output Configuration

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Module Resolution](./03-module-resolution.md)
> Next section: [05 - Advanced Flags](./05-advanced-flags.md)

---

## What you'll learn here

- How `target` and `module` work together and when each setting is appropriate
- What `outDir`, `declarationDir`, and `sourceMap` do
- The difference between `declaration`, `declarationMap`, and `emitDeclarationOnly`
- Why `lib` matters and how it complements `target`

---

## `target` — Which JavaScript should come out?
<!-- section:summary -->
`target` determines which JavaScript version TypeScript compiles to.

<!-- depth:standard -->
`target` determines which JavaScript version TypeScript compiles to.
It affects **two things**: which syntax gets downleveled
and which built-in types are available.

```typescript annotated
{
  "compilerOptions": {
    "target": "ES2022"
    // ^ Generates JavaScript that is ES2022-compatible
    // Options: ES3, ES5, ES6/ES2015, ES2016...ES2023, ESNext
  }
}
```

What happens with different targets?

```typescript annotated
// TypeScript source:
class User {
  #name: string; // Private Class Field (ES2022)
  constructor(name: string) { this.#name = name; }
}

// Target ES2022: Stays as-is
class User {
  #name;
  constructor(name) { this.#name = name; }
}

// Target ES2015: Gets downleveled
var __classPrivateFieldSet = /* WeakMap-based emulation */;
class User {
  constructor(name) { __classPrivateFieldSet(this, _name, name); }
}
// ^ SIGNIFICANTLY more code — because WeakMap emulates the private field

// Target ES5: Classes become functions
var User = /** @class */ (function () {
  function User(name) { /* ... */ }
  return User;
}());
```

> 📖 **Background: Why are there so many target options?**
>
> Every JavaScript feature was introduced in a specific ECMAScript release.
> Optional chaining (`?.`) came in ES2020, private fields
> (`#`) in ES2022, `Array.prototype.at()` in ES2022. TypeScript needs
> to know which features the target environment natively supports — everything
> else gets downleveled.
>
> In practice: If you're developing for modern browsers or Node.js 18+,
> `ES2022` is a safe choice. For libraries
> that need to run in older environments, `ES2017` or
> `ES2015` may be necessary.

> 💭 **Think about it:** If `target: "ES5"` downlevels all code to ES5
> — why shouldn't you always choose ES5
> for maximum compatibility?
>
> **Answer:** Size and performance. Downleveled code
> is larger (e.g. async/await → generator emulation) and
> slower (e.g. WeakMap instead of native #private). Use modern
> features when the target environment supports them!

---

<!-- /depth -->
## `lib` — Which built-in APIs are available?
<!-- section:summary -->
`target` determines the syntax, `lib` determines the **APIs**. These

<!-- depth:standard -->
`target` determines the syntax, `lib` determines the **APIs**. These
are two different things:

```typescript annotated
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
    // ^ Which type definitions TypeScript should load
    // ES2022: Promise, Map, Set, Array.at(), Object.hasOwn()...
    // DOM: document, window, HTMLElement, fetch...
    // DOM.Iterable: NodeList is iterable (for...of)
  }
}
```

Without `lib`, TypeScript loads a default based on `target`.
But: if you set `lib` explicitly, the default is COMPLETELY
overridden. If you forget `"DOM"`, TypeScript won't know about
`document` or `window`.

```typescript annotated
// With lib: ["ES2022"] (WITHOUT DOM):
document.getElementById("app");
// ^ Error! Cannot find name 'document'
// DOM APIs are not loaded!

// With lib: ["ES2022", "DOM"]:
document.getElementById("app");
// ^ OK! DOM types are loaded
```

> 🧠 **Explain to yourself:** Why are `target` and `lib` separate
> flags? When would you set `lib` explicitly instead of using the default?
> **Key points:** target = syntax transformation, lib = available APIs |
> Node.js doesn't need DOM | Worker threads need WebWorker instead of DOM |
> Libraries can restrict lib to prevent browser-specific APIs

---

<!-- /depth -->
## `module` — The output module format
<!-- section:summary -->
Not to be confused with `moduleResolution`! `module` determines

<!-- depth:standard -->
Not to be confused with `moduleResolution`! `module` determines
which **format** the generated import/export statements use:

```typescript annotated
// TypeScript source (always ESM syntax):
import { User } from './types';
export function getUser(): User { /* ... */ }

// module: "ESNext" / "ES2022":
import { User } from './types';
export function getUser() { /* ... */ }
// ^ Stays ESM — for bundlers and browsers

// module: "CommonJS":
const types_1 = require("./types");
exports.getUser = function getUser() { /* ... */ };
// ^ Becomes CommonJS — for older Node.js

// module: "NodeNext":
// Depends on file extension:
// .mts → ESM, .cts → CommonJS, .ts → package.json "type"
```

| Value | Format | Recommended for |
|-------|--------|----------------|
| `ESNext` | ES Modules | Bundlers (Webpack, Vite, esbuild) |
| `ES2022` | ES Modules (with top-level await) | Bundlers with TLA support |
| `CommonJS` | require/exports | Legacy Node.js |
| `Node16`/`NodeNext` | ESM or CJS (depending on file) | Modern Node.js projects |
| `Preserve` | Unchanged (TS 5.4+) | Bundler workflows |

> 🔬 **Experiment:** Look at these mappings and think about
> which combination fits which scenario:
>
> ```
> Scenario A: Angular app (Angular CLI with Webpack)
>   → module: "ES2022", moduleResolution: "bundler"
>
> Scenario B: Node.js CLI tool (no bundler, run directly)
>   → module: "NodeNext", moduleResolution: "nodenext"
>
> Scenario C: npm library (should work everywhere)
>   → module: "ESNext" + module: "CommonJS" (dual build!)
>
> Scenario D: React app with Vite
>   → module: "ESNext", moduleResolution: "bundler"
> ```

---

<!-- /depth -->
## `outDir` and `declarationDir`
<!-- section:summary -->
Without `declarationDir`, `.d.ts` files end up alongside the `.js` files

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "outDir": "./dist",
    // ^ All generated .js files go here
    "declarationDir": "./types",
    // ^ All .d.ts files go separately here
    "rootDir": "./src"
    // ^ Directory structure is preserved starting from here
  }
}
// Result:
// src/utils/format.ts → dist/utils/format.js
//                      → types/utils/format.d.ts
```

Without `declarationDir`, `.d.ts` files end up alongside the `.js` files
in `outDir`. The separation is useful for library authors who want
to distribute types separately.

---

<!-- /depth -->
## `declaration` and related flags
<!-- section:summary -->
### `declaration` — Generate `.d.ts` files

<!-- depth:standard -->
### `declaration` — Generate `.d.ts` files

```typescript annotated
{
  "compilerOptions": {
    "declaration": true
    // ^ Generates .d.ts files next to each .js file
    // REQUIRED for libraries and project references
  }
}
```

A `.d.ts` file contains only type information — no
JavaScript code. That's exactly what other projects or
npm package consumers need.

### `declarationMap` — Source maps for types

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

Generates `.d.ts.map` files. This enables "Go to Definition"
in the IDE: instead of landing in the `.d.ts` file, you jump
directly to the **original TypeScript source**. Extremely useful in
monorepos!

### `emitDeclarationOnly` — Only types, no JavaScript

```json
{
  "compilerOptions": {
    "emitDeclarationOnly": true,
    "declaration": true
  }
}
```

TypeScript generates ONLY `.d.ts` files, NO JavaScript. This makes
sense when another tool (esbuild, swc, Babel) handles the
JavaScript transformation and TypeScript is only responsible for
type checking.

> ⚡ **Practical tip:** In your Angular project, the
> Angular CLI handles compilation with esbuild (since Angular 17). The
> tsconfig in Angular projects often has `"declaration": false`, because
> Angular apps don't export `.d.ts` files — they are
> end products, not libraries. In React projects with Vite it's
> the same: Vite uses esbuild for transpilation and TypeScript
> only for type checking.

---

<!-- /depth -->
## `sourceMap` — Enabling debugging
<!-- section:summary -->
Source maps connect the generated JavaScript code with the

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "sourceMap": true,
    // ^ Generates .js.map files for browser/Node.js debugging
    "inlineSourceMap": false,
    // ^ Alternative: embed source map directly in the .js file
    "inlineSources": false
    // ^ Embed original source in the source map (larger, but self-contained)
  }
}
```

Source maps connect the generated JavaScript code with the
original TypeScript. When an error occurs at line 42 of `format.js`,
the debugger shows line 15 of `format.ts` — the place
you actually wrote.

> 💭 **Think about it:** Should you ship source maps in production?
> What are the pros and cons?
>
> **Answer:** It depends. Pros: better error tracking
> (Sentry, Bugsnag can display original lines). Cons:
> source maps expose your source code. Solution: send source maps
> only to error tracking services, don't ship them publicly.
> Many build tools support "hidden source maps"
> that aren't referenced in the code.

---

<!-- /depth -->
## `noEmit` — Only check, generate nothing
<!-- section:summary -->
TypeScript checks the code but generates NO files. This is

<!-- depth:standard -->
```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

TypeScript checks the code but generates NO files. This is
the mode when another tool (Vite, esbuild, swc, Babel) handles
transpilation. TypeScript is demoted to a pure type checker —
which is the ideal state for many modern build pipelines.

> ⚡ **Practical tip:** In many Next.js projects you'll find
> `"noEmit": true` in the tsconfig. Next.js uses SWC or Babel
> for transpilation — TypeScript only checks the types.
> The `next build` command calls `tsc --noEmit` as part of the
> build pipeline.

---

<!-- /depth -->
## What you've learned

- `target` determines the JavaScript version (syntax transformation)
- `lib` determines the available APIs (independent of target)
- `module` determines the module format (ESM, CJS, NodeNext)
- `declaration` generates `.d.ts` files — required for libraries
- `noEmit` makes TypeScript a pure type checker (for Vite/esbuild workflows)

> 🧠 **Explain to yourself:** When a bundler like Vite handles
> transpilation, why do you still need `target` and `module` in the tsconfig?
> **Key points:** TypeScript still checks types | target determines
> which APIs TypeScript considers "known" | lib controls available
> type definitions | noEmit uses target/lib for type checking, not
> for output

**Core concept to remember:** `target` + `lib` = what TypeScript knows.
`module` = what TypeScript generates. `noEmit` = TypeScript generates nothing,
but still knows everything.

---

> **Pause point** — Output configuration mastered. Now come
> the advanced flags.
>
> Continue with: [Section 05: Advanced Flags](./05-advanced-flags.md)