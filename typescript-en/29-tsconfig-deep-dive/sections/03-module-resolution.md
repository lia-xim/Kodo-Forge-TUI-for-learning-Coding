# Section 3: Module Resolution

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - The Strict Mode Family](./02-strict-mode-familie.md)
> Next section: [04 - Output Configuration](./04-output-konfiguration.md)

---

## What you'll learn here

- What `moduleResolution` actually controls and which strategies exist
- Why `bundler` is the right choice for most modern projects
- How `paths` and `baseUrl` enable path aliases
- The difference between `node`, `node16`/`nodenext`, and `bundler`

---

## The puzzle of module resolution
<!-- section:summary -->
When you write `import { User } from './types'`, something

<!-- depth:standard -->
When you write `import { User } from './types'`, something
remarkable happens: TypeScript has to figure out which **file**
is behind `'./types'`. Is it `types.ts`? `types/index.ts`?
`types.d.ts`? `types.js` with a `.d.ts` alongside it?

The answer depends on `moduleResolution` — and this flag
is the most common source of "Cannot find module" errors.

```typescript annotated
{
  "compilerOptions": {
    "moduleResolution": "bundler"
    // ^ How TypeScript resolves import paths
    // Options: "node", "node16", "nodenext", "bundler", "classic"
  }
}
```

> 📖 **Background: The history of module resolution**
>
> JavaScript originally had no module system. Node.js introduced
> CommonJS in 2009 (`require()`), browsers got ES Modules
> in 2015 (`import/export`). The problem: both systems resolve
> paths differently. Node.js searches in `node_modules`, automatically
> appends `.js`, checks `index.js` in folders. ES Modules
> in the browser, by contrast, require complete paths with extensions.
>
> TypeScript had to support BOTH worlds — and for each
> world there is its own resolution strategy. That's why
> this flag is so confusing: it's not TypeScript's
> fault, but the legacy of two incompatible module systems.

---

<!-- /depth -->
## The resolution strategies
<!-- section:summary -->
### `"node"` — The legacy system

<!-- depth:standard -->
### `"node"` — The legacy system

Emulates Node.js' CommonJS resolution. Searches for:
1. Exact file (with `.ts`, `.tsx`, `.d.ts`, `.js`)
2. Folder with `index.ts` / `index.js`
3. `node_modules` (ascending through all parent directories)

```typescript annotated
import { User } from './types';
// TypeScript searches (in this order):
// 1. ./types.ts
// 2. ./types.tsx
// 3. ./types.d.ts
// 4. ./types/index.ts
// 5. ./types/index.tsx
// 6. ./types/index.d.ts

import express from 'express';
// TypeScript searches:
// 1. node_modules/express/package.json → "types" or "typings" field
// 2. node_modules/express/index.d.ts
// 3. node_modules/@types/express/index.d.ts
// ^ The @types directory is TypeScript-specific!
```

**Problem:** `"node"` doesn't understand `exports` fields in package.json,
no conditional exports, and emulates a system designed for CommonJS.
For modern projects it is outdated.

### `"node16"` / `"nodenext"` — For real Node.js projects

Emulates Node.js' native ESM resolution. The most important difference:

```typescript annotated
// WITH moduleResolution: "node16" / "nodenext":
import { User } from './types.js';
// ^ The .js extension is REQUIRED!
// TypeScript finds types.ts, compiles it to types.js
// The extension in the import must match the OUTPUT format

// WITHOUT extension:
import { User } from './types';
// ^ Error! Relative import paths need explicit file extensions
```

**Why `.js` instead of `.ts`?** Because TypeScript compiles to output.
The import must correspond to the file that exists **after** compilation.
Node.js only sees JavaScript — and JavaScript files
end with `.js`. This is the "write .js, mean .ts" principle.

> 💭 **Think about it:** Why does `nodenext` enforce the `.js` extension,
> even though you're importing a `.ts` file? Isn't that confusing?
>
> **Answer:** TypeScript follows the "emit fidelity" principle — the import
> in the TypeScript code must work EXACTLY the same way in the JavaScript output.
> Since TypeScript does NOT rewrite import paths, the path
> must already point to the output file in the source. Confusing, but
> logically consistent.

### `"bundler"` — For Webpack, Vite, esbuild, etc.

The newest and for most modern projects the best option
(since TypeScript 5.0). It combines the best of both worlds:

```typescript annotated
// WITH moduleResolution: "bundler":
import { User } from './types';
// ^ OK! No extension needed — the bundler resolves that

import express from 'express';
// ^ OK! Reads "exports" from package.json

import { helper } from '#utils/helper';
// ^ OK! Package-internal imports (imports field in package.json)
```

**Why `bundler`?** Because Webpack, Vite, esbuild and other bundlers
have their own module resolution. TypeScript doesn't need to find
the file — only the types. The bundler finds the file.

| Feature | `node` | `node16`/`nodenext` | `bundler` |
|---------|--------|---------------------|-----------|
| .js extension required | No | Yes | No |
| package.json `exports` | No | Yes | Yes |
| Path aliases (paths) | Yes | Yes | Yes |
| `imports` field | No | Yes | Yes |
| Recommended for | Legacy | Node.js | Bundler/Frameworks |

> ⚡ **Practical tip:** Your Angular project probably has
> `"moduleResolution": "node"` or nothing at all (the default depends on
> `module`). Since Angular 17 the Angular team recommends
> `"moduleResolution": "bundler"` together with `"module": "ESNext"`.
> In React/Next.js projects, `bundler` has been the default since Next.js 14.

---

<!-- /depth -->
## `paths` and `baseUrl` — Path aliases
<!-- section:summary -->
Long import paths like `../../../shared/utils/format` are unreadable.

<!-- depth:standard -->
Long import paths like `../../../shared/utils/format` are unreadable.
`paths` solves that:

```typescript annotated
{
  "compilerOptions": {
    "baseUrl": ".",
    // ^ Base directory for non-relative imports
    "paths": {
      "@shared/*": ["src/shared/*"],
      // ^ Import: @shared/utils → src/shared/utils
      "@components/*": ["src/components/*"],
      // ^ Import: @components/Button → src/components/Button
      "@/*": ["src/*"]
      // ^ Catch-all: @/anything → src/anything
    }
  }
}
```

**Important:** `paths` only resolves the TypeScript side. The bundler
needs its own configuration! In Webpack you need
`resolve.alias`, in Vite `resolve.alias`, in Next.js the
tsconfig is enough (Next reads paths automatically).

> 🧠 **Explain to yourself:** Why do you have to configure path aliases both in
> the tsconfig (paths) and in the bundler? Why isn't the tsconfig enough?
> **Key points:** TypeScript and bundler are separate systems |
> TypeScript checks types, bundler builds bundle | TypeScript does NOT rewrite
> import paths | Bundler needs to know where files are located |
> Exception: Next.js reads tsconfig.paths directly

### `baseUrl` alone (without paths)

```json
{
  "compilerOptions": {
    "baseUrl": "./src"
  }
}
```

With `baseUrl`, non-relative imports are resolved from the specified
directory:

```typescript
// Instead of:
import { format } from '../../../utils/format';
// You can write:
import { format } from 'utils/format';
```

**Caution:** This can lead to conflicts with `node_modules` packages!
If you have a `utils` module in node_modules AND a `utils` folder
under `baseUrl`, `baseUrl` wins. That is confusing.

> 🔬 **Experiment:** Imagine you have this project structure:
>
> ```
> src/
>   utils/
>     format.ts    ← your file
>   index.ts       ← import { format } from 'utils/format'
> node_modules/
>   utils/         ← npm package!
>     index.js
> ```
>
> With `baseUrl: "./src"`, `'utils/format'` imports your local
> file. WITHOUT `baseUrl` it imports the npm package. That's why
> `paths` with an explicit prefix (`@/`) is safer than `baseUrl` alone.

---

<!-- /depth -->
## `rootDir` and `rootDirs`
<!-- section:summary -->
### `rootDir` — The source directory

<!-- depth:standard -->
### `rootDir` — The source directory

```typescript annotated
{
  "compilerOptions": {
    "rootDir": "./src",
    // ^ TypeScript preserves the directory structure FROM this point on
    "outDir": "./dist"
    // ^ Output directory
  }
}
// src/utils/format.ts → dist/utils/format.js
// src/index.ts → dist/index.js
// NOT: dist/src/utils/format.js (that would happen without rootDir)
```

### `rootDirs` — Virtual directories

A rarely used but powerful feature. It merges multiple
directories as if they were one:

```json
{
  "compilerOptions": {
    "rootDirs": ["src", "generated"]
  }
}
```

Files in `generated/api-types.ts` can then be imported as if
they were in `src/`. Useful for code generators
(OpenAPI, GraphQL, Protobuf).

> ⚡ **Practical tip:** In React projects with `react-scripts` or
> Vite, `rootDir` is set automatically. In Angular projects
> the CLI sets `rootDir` to `./` or `./src`. If you get
> "File is not under rootDir" after a refactoring, check whether a
> file is outside the rootDir (e.g. a `shared/` folder
> at the root level).

---

<!-- /depth -->
## What you've learned

- `moduleResolution` determines how TypeScript resolves import paths
- `"bundler"` is the best choice for modern projects with Webpack/Vite/esbuild
- `"nodenext"` enforces `.js` extensions in imports — correct for native Node.js ESM
- `paths` creates path aliases, but also requires bundler configuration
- `rootDir` controls the directory structure in the output

> 🧠 **Explain to yourself:** What is the fundamental difference
> between `"node"`, `"nodenext"`, and `"bundler"` for module
> resolution? Which scenarios is each suited for?
> **Key points:** node = legacy CommonJS | nodenext = real Node.js ESM
> with mandatory .js | bundler = modern tooling without mandatory extensions |
> bundler needs no file resolution, only type resolution

**Key concept to remember:** Module resolution is the most common reason
for "Cannot find module" errors. Know your build tool, choose the
right strategy — and half of your TypeScript problems
will disappear.

---

> **Pause point** -- Module resolution is digested. Next topic:
> What comes out at the end?
>
> Continue with: [Section 04: Output Configuration](./04-output-konfiguration.md)