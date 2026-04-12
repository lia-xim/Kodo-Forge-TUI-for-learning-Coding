# Section 1: Package.json exports and types Field

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Generating Declaration Files Correctly](./02-declaration-files-generieren.md)

---

## What you'll learn here

- Why the `exports` field in package.json **replaces the entrypoint standard**
- How to use **Conditional Exports** to deliver different builds for different environments
- What the `types` field means and where TypeScript looks for **.d.ts files**
- How **Module Resolution** works for consumers of your library

---

## Background: The Entrypoint Chaos

> **Origin Story: From main to exports — 10 Years of Evolution**
>
> In the early days of npm (2011-2015) there was exactly one field that determined
> what an `import` or `require` returns: `"main": "./index.js"`.
> That was simple — but it could only define ONE entrypoint.
>
> Then bundlers arrived (Webpack, Rollup) and invented their own fields:
> `"module"` for ES Modules, `"browser"` for browser builds.
> TypeScript invented `"types"` and `"typings"` for .d.ts files.
> Every tool read different fields — a nightmare for library authors.
>
> Node.js 12.7 (2019) introduced `"exports"`: a standardized,
> extensible system that covers ALL use cases. Today,
> `exports` is the recommended way — and TypeScript 4.7+ understands it.

Imagine you're the publisher of a technical book. The package.json is
your book's spine — it tells libraries (tools) and readers (consumers)
exactly what to expect: What chapters are there? What language
is available? For which reading device (browser, Node.js) is the book
intended? An unclear spine means nobody finds the book.
A poorly configured package.json means nobody can correctly import your
library.

As a library author, the package.json is your **interface to the world**.
It determines what consumers can import, which files they get,
and how TypeScript finds the types.

---

## The exports Field

```typescript annotated
// package.json — Modern setup with exports
{
  "name": "my-utils",
  "version": "1.0.0",
  "type": "module",
  // ^ Important: Defines that .js files are treated as ES Modules

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // ^ MUST come first! TypeScript reads top to bottom
      "import": "./dist/index.js",
      // ^ For: import { x } from "my-utils"
      "require": "./dist/index.cjs"
      // ^ For: const { x } = require("my-utils")
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
      // ^ For: import { helper } from "my-utils/utils"
    }
  }
}
// ^ "exports" defines EXACTLY what is importable
// ^ Everything not listed in exports is NOT importable
// ^ This is a security feature: internal files stay private
```

> 🧠 **Explain to yourself:** Why must "types" come BEFORE "import" and "require"? What happens if the order is wrong?
> **Key points:** TypeScript and Node.js read the exports object top to bottom | The first matching condition wins | If "import" comes before "types": TypeScript finds no types | "types" is TypeScript-specific — Node.js ignores it

---

## Legacy Fields vs. exports

For maximum compatibility you often need both:

```typescript annotated
// package.json — Complete configuration
{
  "name": "my-utils",
  "version": "1.0.0",
  "type": "module",

  // === MODERN: exports (Node.js 12.7+, TypeScript 4.7+) ===
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },

  // === LEGACY: For older tools that don't understand exports ===
  "main": "./dist/index.cjs",
  // ^ Fallback for require() in old Node.js
  "module": "./dist/index.js",
  // ^ Fallback for bundlers (Webpack 4, older Rollup)
  "types": "./dist/index.d.ts"
  // ^ Fallback for TypeScript < 4.7 and tools that ignore exports
}
// ^ Modern tools use "exports"
// ^ Older tools fall back to main/module/types
// ^ The order of fields in the file doesn't matter
```

> 💭 **Think about it:** If both `exports.".".types` and the
> top-level `types` field are set — which one does TypeScript use?
>
> **Answer:** TypeScript 4.7+ with `moduleResolution: "node16"` or
> `"bundler"` uses `exports`. TypeScript with `moduleResolution: "node"`
> (legacy) uses the top-level `types` field. Set both for
> maximum compatibility.

---

## Subpath Exports: Multiple Entrypoints

```typescript annotated
// package.json — Library with multiple entrypoints
{
  "name": "@company/design-system",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    // ^ import { Button } from "@company/design-system"

    "./components": {
      "types": "./dist/components/index.d.ts",
      "import": "./dist/components/index.js"
    },
    // ^ import { Button } from "@company/design-system/components"

    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "import": "./dist/hooks/index.js"
    },
    // ^ import { useTheme } from "@company/design-system/hooks"

    "./styles": "./dist/styles/index.css",
    // ^ import "@company/design-system/styles"

    "./package.json": "./package.json"
    // ^ Enables: import pkg from "@company/design-system/package.json"
    // ^ Useful for version checking
  }
}
```

> ⚡ **Framework reference (Angular):** Angular libraries have used Subpath Exports
> extensively since Angular 14. When you import `@angular/common`, Angular uses
> the exports field to define `@angular/common`, `@angular/common/http`,
> and `@angular/common/testing` as separate entrypoints.
> This enables tree-shaking: if you only import `@angular/common/http`,
> the rest of `@angular/common` is not included in your bundle.
>
> In your own Angular workspace you can use the same pattern.
> When you create a shared library with `ng generate library my-lib`,
> you can create secondary entrypoints:
>
> ```typescript
> // libs/my-lib/package.json — Main entrypoint
> { "exports": { ".": { "types": "./index.d.ts", "default": "./index.js" } } }
>
> // libs/my-lib/testing/package.json — Secondary entrypoint
> { "exports": { ".": { "types": "./index.d.ts", "default": "./index.js" } } }
>
> // Consumers:
> import { MyService } from 'my-lib';            // Production
> import { MockMyService } from 'my-lib/testing'; // Tests only
> ```
>
> Test helpers will NEVER end up in the production bundle this way — they are physically
> separated and only loaded when explicitly imported.

---

## Wildcard Exports

For libraries with many files:

```typescript annotated
// package.json
{
  "exports": {
    ".": "./dist/index.js",
    "./*": "./dist/*.js"
    // ^ Wildcard: import { x } from "my-lib/helpers" → ./dist/helpers.js
    // ^ CAUTION: Exposes ALL files in dist/ — including internal ones!
  }
}

// Better: Explicit exports
{
  "exports": {
    ".": "./dist/index.js",
    "./helpers": "./dist/helpers.js",
    "./validators": "./dist/validators.js"
    // ^ Only these 3 paths are importable
    // ^ Everything else: "Module not found"
  }
}
// ^ Explicit exports are safer — no accidental exposures
// ^ Wildcard exports are fine for internal monorepo packages
```

---

## Module Resolution in TypeScript

How does TypeScript find the types of your library? It depends on
`moduleResolution`:

```typescript annotated
// tsconfig.json of your library's CONSUMER
{
  "compilerOptions": {
    "moduleResolution": "bundler"
    // ^ Recommended for projects with a bundler (Vite, webpack, esbuild)
    // ^ Understands: exports, imports, #private-imports
    // ^ Understands: .ts extensions in imports (not just .js)

    // "moduleResolution": "node16"
    // ^ Recommended for pure Node.js (without bundler)
    // ^ Understands: exports, requires .js extension in relative imports

    // "moduleResolution": "node"
    // ^ LEGACY — does NOT understand exports!
    // ^ Looks for: main → types → index.d.ts
    // ^ Avoid in new projects
  }
}

// What TypeScript does with "import { x } from 'my-lib'":
// 1. Finds node_modules/my-lib/package.json
// 2. Reads "exports".".".types → "./dist/index.d.ts"
// 3. Uses the types from that file
// ^ If no "types" in exports: looks for .d.ts next to the .js file
```

> 🧪 **Experiment:** Create a minimal package.json and observe
> how TypeScript finds the types:
>
> ```json
> {
>   "name": "test-pkg",
>   "exports": {
>     ".": {
>       "types": "./types/index.d.ts",
>       "import": "./dist/index.js"
>     }
>   }
> }
> ```
>
> Create `types/index.d.ts` with `export function greet(name: string): string;`
> and import `test-pkg` in a project. Observe: TypeScript finds
> the types via the exports field.

---

## What you've learned

- The **exports field** in package.json defines what is importable (and what isn't)
- **"types" must come BEFORE "import"/"require"** — TypeScript reads top to bottom
- Keep **legacy fields** (main, module, types) for compatibility with older tools
- **Subpath Exports** enable multiple entrypoints (`"./hooks"`, `"./components"`)
- **moduleResolution: "bundler"** or **"node16"** is required to understand exports
- **Wildcard Exports** are convenient but risky — explicit exports are safer
- **Angular Secondary Entrypoints** use the same principle: `@angular/common/http` is its own Subpath Export

**Core concept to remember:** The package.json is the contract between your library and the world. The exports field is the modern standard — it defines precisely what is importable, enables dual CJS/ESM, and guides TypeScript to the correct .d.ts files. Always put "types" FIRST. Think like a publisher: what should the reader be able to see — and what should stay behind the scenes?

---

> **Break point** -- Good moment for a break. You now understand
> how libraries define their entrypoints.
>
> Continue with: [Section 02: Generating Declaration Files Correctly](./02-declaration-files-generieren.md)