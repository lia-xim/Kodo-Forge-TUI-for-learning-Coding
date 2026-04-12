# Section 5: Advanced Flags

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Output Configuration](./04-output-konfiguration.md)
> Next section: [06 - Practice: Monorepo and Framework Configs](./06-praxis-configs.md)

---

## What you'll learn here

- What `skipLibCheck` actually does and why almost every project enables it
- Why `isolatedModules` and `verbatimModuleSyntax` are mandatory for modern toolchains
- What `esModuleInterop` solves and why it historically became necessary
- Other useful flags that are often overlooked

---

## `skipLibCheck` — The Pragmatic Compromise
<!-- section:summary -->
Sounds dangerous — why would you skip type checking?

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "skipLibCheck": true
    // ^ Skips type checking of .d.ts files
    // This affects: node_modules/@types/*, your own .d.ts, generated .d.ts
  }
}
```

Sounds dangerous — why would you skip type checking?
The answer: **Your code is still fully checked.** `skipLibCheck`
only skips checking the `.d.ts` files themselves — not checking
your code AGAINST those `.d.ts` files.

> 📖 **Background: Why skipLibCheck exists**
>
> In practice, many npm packages have faulty or incompatible
> type definitions. Package A defines a type, package B expects
> a slightly different version of the same type. Without `skipLibCheck`
> you get errors in `node_modules/` that you can't fix.
>
> The problem was compounded by `@types/node`: different
> versions of `@types/node` define `Buffer`, `Stream`, etc.
> differently. When two packages expect different `@types/node` versions,
> the definitions collide. `skipLibCheck` ignores
> these conflicts — and your own code is still checked correctly.
> Since TypeScript 2.0 (2016) it has therefore become a de-facto
> standard in most projects.

> 💭 **Think about it:** If `skipLibCheck: true` is the standard —
> why isn't it simply the default?
>
> **Answer:** Because there's a trade-off. Without `skipLibCheck`
> TypeScript catches errors in YOUR OWN `.d.ts` files (e.g.
> when you're writing a library). Library authors should use
> `skipLibCheck: false` to ensure their
> type definitions are correct.

---

<!-- /depth -->
## `isolatedModules` — Single-File Compatibility
<!-- section:summary -->
This flag is **mandatory** for all projects that don't use `tsc` as

<!-- depth:standard -->
This flag is **mandatory** for all projects that don't use `tsc` as
transpiler (i.e.: Babel, esbuild, swc, Vite, SWC).

```typescript annotated
{
  "compilerOptions": {
    "isolatedModules": true
    // ^ Every file must be transpilable in isolation
    // MANDATORY for: esbuild, swc, Babel, Vite
  }
}
```

Why? Because `tsc` knows the ENTIRE project context, but tools like
esbuild transpile each file individually. But some TypeScript features
need context from other files:

```typescript annotated
// THESE features do NOT work with isolatedModules:

// 1. const enum (needs the value from another file)
const enum Color { Red, Green, Blue }
// ^ Error with isolatedModules! The value is substituted at compile time
// — but esbuild doesn't know it

// 2. Re-exporting types without the "type" keyword
export { User } from './types';
// ^ If User is only a type: Error! esbuild doesn't know
// whether User is a value or a type. Fix:
export type { User } from './types';
// ^ Now esbuild knows: this can be deleted

// 3. Files without import/export (scripts instead of modules)
const x = 42;
// ^ Error! File has no import/export — it's a script
// Fix: add export {} at the end
```

> 🧠 **Explain it to yourself:** Why is `const enum` incompatible with
> `isolatedModules`? Think about the difference between
> `tsc` (knows all files) and `esbuild` (one file at a time).
> **Key points:** const enum is replaced inline | esbuild sees only
> one file | The enum's value lives in a DIFFERENT file |
> esbuild can't look up the value | Regular enums generate
> an object and continue to work

---

<!-- /depth -->
## `verbatimModuleSyntax` — The Successor to isolatedModules
<!-- section:summary -->
Since TypeScript 5.0 there is a new flag that replaces `isolatedModules`

<!-- depth:standard -->
Since TypeScript 5.0 there is a new flag that replaces `isolatedModules`
and two other flags:

```typescript annotated
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
    // ^ Replaces: isolatedModules + preserveValueImports + importsNotUsedAsValues
    // Rule: What you import with "import type" gets deleted.
    //       What you import with "import" stays in the output.
  }
}
```

The rule is simple:
- `import type { X }` → removed entirely
- `import { X }` → stays in the JavaScript output
- If X is only a type and you write `import { X }` → Error!

```typescript annotated
// WITH verbatimModuleSyntax:

import type { User } from './types';
// ^ OK — removed because of "import type"

import { formatDate } from './utils';
// ^ OK — stays in output because of "import"

import { UserRole } from './types';
// ^ Error! UserRole is only a type — use "import type"!
// Fix:
import type { UserRole } from './types';
```

> 📖 **Background: The "import elision" problem**
>
> Before `verbatimModuleSyntax`, TypeScript had a feature called
> "import elision": if an import contained only types, it was
> automatically removed. That sounds useful, but was a problem:
>
> ```typescript
> import { SomeModule } from './module';
> // Is SomeModule used as a value or as a type?
> // If only as a type: TypeScript removes the import.
> // But: What if the module has side effects?
> //   (e.g. global registrations, polyfills)
> // Then removing it is a BUG!
> ```
>
> `verbatimModuleSyntax` solves this: you say EXPLICITLY what is a type
> (`import type`) and what is a value (`import`). No more guessing
> — full control.

---

<!-- /depth -->
## `esModuleInterop` — The CommonJS/ESM Bridge
<!-- section:summary -->
### `allowSyntheticDefaultImports`

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "esModuleInterop": true
    // ^ Enables default imports from CommonJS modules
  }
}
```

Without `esModuleInterop`:
```typescript
// CommonJS module: module.exports = function express() {}
import * as express from 'express';  // Works
import express from 'express';       // ERROR!
```

With `esModuleInterop`:
```typescript
import express from 'express';  // Now OK!
// TypeScript adds helper functions that emulate the default export
```

> 💭 **Think about it:** Why does `esModuleInterop` exist at all?
> Why doesn't `import express from 'express'` just work?
>
> **Answer:** CommonJS has no `default` export concept. `module.exports`
> is the entire module. ESM has `export default`. The two systems are
> fundamentally incompatible. `esModuleInterop` inserts a
> compatibility layer that wraps CommonJS modules so that
> default imports work. It's a hack — but a
> necessary one.

### `allowSyntheticDefaultImports`

Related to `esModuleInterop`, but weaker: it allows the
SYNTAX `import express from 'express'`, but does NOT add helper functions.
Useful when the bundler handles the compatibility.

---

<!-- /depth -->
## `resolveJsonModule` — Importing JSON

```typescript annotated
{
  "compilerOptions": {
    "resolveJsonModule": true
    // ^ Enables importing .json files
  }
}

// Now possible:
import config from './config.json';
// config has the correct type! e.g.:
// { port: number; host: string; debug: boolean }
// TypeScript infers the type from the JSON content
```

> ⚡ **Practical tip:** In your Angular project, `resolveJsonModule`
> is often not active. In React/Next.js it's the standard. If you want
> to import a JSON file in Angular, you need to explicitly enable it
> OR write a `.d.ts` file:
> ```typescript
> declare module '*.json' {
>   const value: any;
>   export default value;
> }
> ```
> Better to use `resolveJsonModule: true` — then you get real
> types instead of `any`.

---

## `incremental` — Faster Builds
<!-- section:summary -->
TypeScript generates a `.tsbuildinfo` file that stores the build state

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "incremental": true
    // ^ Stores build information in .tsbuildinfo
    // Next build: only changed files are checked
  }
}
```

TypeScript generates a `.tsbuildinfo` file that stores the build state.
On the next build, only changed files are recompiled. In large
projects this can reduce build time from
30 seconds to 3 seconds.

**Note:** `composite: true` (for Project References) enables
`incremental` automatically. You only need it explicitly for
standalone projects without Project References.

---

<!-- /depth -->
## `jsx` — React Support

```typescript annotated
{
  "compilerOptions": {
    "jsx": "react-jsx"
    // ^ Options:
    // "react" — transform: React.createElement() (Legacy)
    // "react-jsx" — transform: _jsx() from react/jsx-runtime (React 17+)
    // "react-jsxdev" — like react-jsx with debug info
    // "preserve" — don't transform JSX (bundler handles it)
    // "react-native" — keep JSX (for React Native)
  }
}
```

> ⚡ **Practical tip:** In React projects with the new JSX transform
> (React 17+) you need `"jsx": "react-jsx"`. The big advantage:
> you no longer need to write `import React from 'react'` in every file.
> In Next.js this is the default. In Angular you don't need
> this flag at all — Angular doesn't use JSX.

---

## `allowImportingTsExtensions` — TS Extensions in Imports
<!-- section:summary -->
This flag is for projects where another tool (Deno,

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    // ^ Allows: import { x } from './module.ts'
    // BUT: Only together with noEmit or emitDeclarationOnly!
    "noEmit": true
  }
}
```

This flag is for projects where another tool (Deno,
Bun, Vite) understands `.ts` extensions. TypeScript then allows
imports with a `.ts` extension — which is normally forbidden because
the output would be `.js` files and the import path wouldn't match.

> 🔬 **Experiment:** Match the following flags to their scenarios:
>
> | Flag | Scenario |
> |------|----------|
> | `skipLibCheck: true` | Ignore conflicts in node_modules/.d.ts |
> | `isolatedModules: true` | esbuild/swc as transpiler |
> | `verbatimModuleSyntax: true` | Explicit control over import/import type |
> | `esModuleInterop: true` | Default import from CommonJS modules |
> | `resolveJsonModule: true` | Import JSON files with real types |
> | `incremental: true` | Faster builds through caching |
>
> Which of these flags would you enable in a new project ALL at once?
> (Answer: All of them — they're de-facto standard.)

---

<!-- /depth -->
## What you've learned

- `skipLibCheck` skips `.d.ts` checking — your code is still checked
- `isolatedModules` / `verbatimModuleSyntax` are mandatory for esbuild/swc/Vite
- `esModuleInterop` enables default imports from CommonJS modules
- `incremental` speeds up builds through caching in `.tsbuildinfo`
- `verbatimModuleSyntax` replaces three older flags and makes import/type explicit

> 🧠 **Explain it to yourself:** Why does `isolatedModules` forbid
> `const enum`? What is the fundamental difference
> between `tsc` and esbuild when processing enum values?
> **Key points:** const enum = inline replacement at compile time |
> tsc knows ALL files (can read values from other files) |
> esbuild/swc process ONE file (don't know values from other files) |
> Regular enums generate runtime objects and still work

**Core concept to remember:** Modern TypeScript projects often use TypeScript
only as a type checker (`noEmit`), while esbuild/swc handle the
transpilation. `isolatedModules` and `verbatimModuleSyntax`
ensure that your code is compatible with this architecture.

---

> **Pause point** -- The most important flags are now covered. In
> the final section we'll bring everything together.
>
> Continue with: [Section 06: Practice: Monorepo and Framework Configs](./06-praxis-configs.md)