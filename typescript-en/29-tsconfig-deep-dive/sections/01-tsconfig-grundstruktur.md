# Section 1: tsconfig Basic Structure

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - The Strict Mode Family](./02-strict-mode-familie.md)

---

## What you'll learn here

- How `tsconfig.json` is structured and what top-level fields it has
- Why `extends` is the most important property for team projects
- How `references` enables Project References and monorepo builds
- The difference between `include`, `exclude`, and `files`

---

## The Control Center of Your TypeScript Project
<!-- section:summary -->
Every TypeScript project has a `tsconfig.json`. It's not just

<!-- depth:standard -->
Every TypeScript project has a `tsconfig.json`. It's not just
a configuration file — it's the **contract between you and the
compiler**. Here you define: which files get compiled?
How strictly does the compiler check? What JavaScript comes out at the end?

And yet: most developers copy their tsconfig from Stack Overflow
and never touch it again. That's like buying a car
and never adjusting the mirrors.

```typescript annotated
// The basic structure of a tsconfig.json
{
  "compilerOptions": {
  // ^ The heart of it all — all compiler flags live here
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  // ^ Which files get compiled (glob patterns)
  "exclude": ["node_modules", "dist"],
  // ^ Which files do NOT get compiled
  "extends": "./tsconfig.base.json",
  // ^ Inherit configuration from another file
  "references": [{ "path": "./packages/core" }]
  // ^ Project References for monorepos
}
```

> 📖 **Background: Why JSON and not YAML or TOML?**
>
> When Anders Hejlsberg and the TypeScript team designed the configuration
> in 2012, they chose JSON — even though JSON doesn't support comments.
> The reason: JSON was the only format every JavaScript developer
> could read immediately without new tools. The solution for missing
> comments? TypeScript accepts JSONC (JSON with Comments) in
> tsconfig files. You can use `//` and `/* */` — this has worked
> since TypeScript 1.0. Many developers don't know this and therefore
> avoid comments in their tsconfig. Don't do that — document your
> decisions with comments!

---

<!-- /depth -->
## The Top-Level Fields in Detail
<!-- section:summary -->
### `compilerOptions` — The Heart of It

<!-- depth:standard -->
### `compilerOptions` — The Heart of It

Over 100 flags live here, controlling the behavior of the compiler.
We'll work through them group by group in the following sections.
For now: `compilerOptions` is an object, and every key inside it
is a compiler flag.

### `include` and `exclude` — What Gets Compiled?

```typescript annotated
{
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  // ^ Glob patterns: ** = any number of directories, * = any filename
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
  // ^ Exceptions from include — don't compile tests
}
```

The order of evaluation is:
1. `files` (explicit file list) — highest priority
2. `include` (glob patterns) — constrained by `exclude`
3. `exclude` removes files from `include`, but NOT from `files`

> 💭 **Think about it:** If you list a file in `files` AND it
> appears in `exclude` — will it be compiled or not?
>
> **Answer:** It will be compiled. `files` has absolute priority.
> `exclude` only filters `include`, never `files`. This is a
> common stumbling block in debugging scenarios.

### `files` — Explicit File List

```json
{
  "files": ["src/index.ts", "src/globals.d.ts"]
}
```

`files` is rarely used — it lists individual files instead of
patterns. Useful for small projects or when you need exact control.
In practice, `include` dominates.

---

<!-- /depth -->
## `extends` — Inheriting Configuration
<!-- section:summary -->
Imagine you have a team with 5 frontend projects. All of them

<!-- depth:standard -->
Imagine you have a team with 5 frontend projects. All of them
should share the same ground rules: strict, ES2022, ModuleResolution
NodeNext. Without `extends` you'd have to duplicate these options in every
tsconfig.

```typescript annotated
// tsconfig.base.json — The shared foundation
{
  "compilerOptions": {
    "strict": true,
    // ^ Ground rule: always strict
    "target": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// tsconfig.json in the project — inherits and extends
{
  "extends": "./tsconfig.base.json",
  // ^ All compilerOptions from base.json are carried over
  "compilerOptions": {
    "outDir": "./dist",
    // ^ Project-specific addition — merged with base
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Important:** `compilerOptions` are **merged** (combined).
But `include`, `exclude`, and `files` are **completely overwritten**.
If you set `include` in the child file, the parent file's
`include` is ignored — not extended.

> 🧠 **Explain it to yourself:** Why are `compilerOptions` merged,
> but `include` overwritten? What would the problem be if `include`
> were also merged?
> **Key points:** Merge for options = shared base + local adjustments |
> Merge for include = uncontrollable file sets | child project only knows
> its own files | Overwrite = full control

### `extends` with npm Packages

Since TypeScript 5.0 you can inherit from npm packages. This has spawned
an entire ecosystem of shared configurations:

```json
{
  "extends": "@tsconfig/node20/tsconfig.json"
}
```

Popular base configurations:
- `@tsconfig/node20` — optimized for Node.js 20
- `@tsconfig/strictest` — maximum strictness
- `@tsconfig/recommended` — conservative standard

> ⚡ **Practical tip:** In your Angular project you're probably using
> the tsconfig generated by Angular CLI, which internally inherits from an
> Angular base. Look at your `tsconfig.json` — it likely says
> `"extends": "./tsconfig.base.json"`. The Angular CLI splits
> the configuration into `tsconfig.app.json`, `tsconfig.spec.json`,
> and a shared `tsconfig.json`.

---

<!-- /depth -->
## `references` — Project References
<!-- section:summary -->
Project References are TypeScript's answer to monorepos. They

<!-- depth:standard -->
Project References are TypeScript's answer to monorepos. They
allow you to split a large project into smaller "sub-projects"
that can be compiled and cached independently.

```typescript annotated
// Root tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    // ^ Each package is a standalone TypeScript project
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ],
  "files": []
  // ^ Root compiles NOTHING itself — only the references
}

// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    // ^ REQUIRED for referenced projects!
    "declaration": true,
    // ^ Generates .d.ts files for consumers
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### Why `composite: true`?

The `composite` flag is **required** for every referenced project.
It activates three things:
1. **Incremental builds** — only changed files are recompiled
2. **.tsbuildinfo** — a cache file for the build state
3. **declaration: true** is enforced — so other projects can see the types

> 📖 **Background: The Origin of Project References**
>
> Before TypeScript 3.0 (2018) there were no Project References. Large
> monorepos like the TypeScript project itself had a problem:
> a single `tsc` call had to compile ALL files, even if only one had
> changed. For the TypeScript codebase itself this took over 30 seconds.
> Project References reduced that to under 5 seconds for incremental builds.
> The TypeScript team built the feature literally for themselves — and it
> became the standard for monorepos.

### `tsc --build` (or `tsc -b`)

With Project References the build command changes:

```bash
# Without Project References:
tsc

# With Project References:
tsc --build        # or tsc -b
tsc --build --watch  # Watch mode with references
```

`tsc --build` understands the dependencies between projects and
compiles them in the correct order. If `api` depends on `core`,
`core` is built first.

> 🔬 **Experiment:** Create in your head (or on paper) a
> monorepo structure with three packages: `shared`, `frontend`, `backend`.
> Both `frontend` and `backend` depend on `shared`. Sketch out
> the three `tsconfig.json` files — what fields does each one need?
>
> ```
> monorepo/
>   packages/
>     shared/tsconfig.json    → composite: true, declaration: true
>     frontend/tsconfig.json  → references: [{ path: "../shared" }]
>     backend/tsconfig.json   → references: [{ path: "../shared" }]
>   tsconfig.json             → references: all three packages
> ```

---

<!-- /depth -->
## Common Mistakes with tsconfig
<!-- section:summary -->
Without `include`, TypeScript compiles **all** `.ts` files in the directory

<!-- depth:standard -->
### 1. Forgetting `include`

Without `include`, TypeScript compiles **all** `.ts` files in the directory
and all subdirectories — including `node_modules`!

### 2. `extends` overwrites `include`

```json
// base.json
{ "include": ["src"] }

// tsconfig.json
{ "extends": "./base.json", "compilerOptions": { "strict": true } }
// include from base.json IS INHERITED (because it's not overwritten)

// BUT:
{ "extends": "./base.json", "include": ["lib"] }
// include from base.json is COMPLETELY IGNORED — only "lib" applies
```

### 3. Relative Paths in `extends`

Paths in `extends` are resolved relative to the file that contains `extends`
— not relative to the working directory. This is logical,
but a source of errors in deeply nested monorepos.

> ⚡ **Practical tip:** In React projects with Vite or Next.js
> you'll often find a `tsconfig.json` and a `tsconfig.node.json`.
> The latter is for the build configuration (vite.config.ts, next.config.ts).
> The separation exists because the build process needs different compiler flags
> than the application code (e.g. `module: "CommonJS"` vs `"ESNext"`).

---

<!-- /depth -->
## What you've learned

- `tsconfig.json` has five top-level fields: `compilerOptions`, `include`, `exclude`, `files`, `extends` (plus `references`)
- `extends` merges `compilerOptions`, but overwrites `include`/`exclude`/`files`
- `references` with `composite: true` enables incremental monorepo builds
- `files` takes priority over `exclude`

> 🧠 **Explain it to yourself:** Why does a referenced project need
> both `composite: true` and `declaration: true`? What would
> happen if one were missing?
> **Key points:** composite enables incremental builds and .tsbuildinfo |
> declaration generates .d.ts for consumers | without composite no tsc --build |
> without declaration no type information for referencing projects

**Core concept to remember:** The tsconfig is not a "set and forget" — it's
an actively maintained contract. `extends` for consistency, `references`
for scalability, and `include` for precision.

---

> **Pause point** -- Good moment for a break. You now understand
> the basic structure. Starting from Section 2 we'll dive into the individual
> compiler flags.
>
> Continue with: [Section 02: The Strict Mode Family](./02-strict-mode-familie.md)