# Section 5: Incremental Compilation

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Measuring and Optimizing Compile Time](./04-compile-zeit-messen-und-optimieren.md)
> Next section: [06 - Practice: Monorepo Performance and CI Optimization](./06-praxis-monorepo-performance.md)

---

## What you'll learn here

- How **incremental compilation** works and what the `tsBuildInfo` file stores
- When and why you need **Project References**
- How `composite` and `references` relate to each other
- How to optimally structure a **multi-package project**

---

## Background: Why incremental?

> **Origin Story: The Angular Monorepo Problem**
>
> In the early days of Angular (2016-2018), large enterprise teams
> faced a massive problem: every small change in a monorepo triggered
> a FULL recompilation of all packages. A monorepo with
> 50 libraries and 200,000 lines of code took 3-5 minutes to compile —
> for every single change. The CI pipeline took 20+ minutes.
>
> TypeScript 3.0 (2018) introduced Project References, and TypeScript 3.4
> (2019) brought incremental builds. Together, these features reduced
> recompilation time in such monorepos to 5-15 seconds. That was
> a game changer for large teams.
>
> Google itself benefited greatly: the Angular team at Google
> works with one of the largest TypeScript monorepos in the world. Without
> incremental compilation, development velocity would have dropped
> dramatically. The internal tooling infrastructure (called
> "ts_library" in the Bazel build system) was the predecessor to what
> is today known as Project References.

The basic idea is simple: why recompile everything when only
one file has changed? Incremental compilation remembers what
has changed since the last build and only compiles what's necessary.

> 🏗️ **Analogy: Incremental Build and Git**
>
> Incremental compilation works similarly to Git commits. A
> commit doesn't re-save the entire repository — it only saves the
> **diff** (the differences) from the previous commit.
>
> The `.tsbuildinfo` file is like a commit log: it knows what
> state each file was in and what has changed since the last build.
> During an incremental build, the compiler compares the current
> hashes with the stored hashes — exactly like `git status` compares
> the working copy with the last commit.

> 🧠 **Explain it to yourself:** What happens when you delete the `.tsbuildinfo` file?
> Does the compiler really have to rebuild everything?
>
> **Key points:** Yes, without `.tsbuildinfo` the compiler does a full build |
> This is the "worst case" and takes just as long as without `incremental: true` |
> Therefore: NEVER delete `.tsbuildinfo` during normal operation |
> Exception: With suspicious compiler errors, `--clean` + full build
> can help clear corrupted caches

---

## Enabling Incremental Build

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    // ^ Enables incremental build
    "tsBuildInfoFile": "./.tsbuildinfo"
    // ^ Where build info is stored (optional, default: next to outDir)
  }
}

// What happens:
// 1. First build: Full compilation + .tsbuildinfo is created
// 2. Second build: Only changed files + dependencies are recompiled
// 3. Speedup: 50-90% faster than a full build
```

The `.tsbuildinfo` file is a JSON file that stores the following:

```typescript annotated
// Simplified structure of .tsbuildinfo:
{
  "program": {
    "fileInfos": {
      "src/user.ts": {
        "version": "abc123",      // Hash of file contents
        "signature": "def456"     // Hash of the public API (.d.ts)
        // ^ If the content changes but the signature stays the same,
        // ^ dependents do NOT need to be recompiled!
      }
    },
    "semanticDiagnosticsPerFile": [
      // ^ Stored errors per file — don't need to be recalculated
    ]
  }
}
// ^ The file is often 1-5 MB in size. Add it to .gitignore!
```

> 🧠 **Explain it to yourself:** Why does tsBuildInfo store both the "version" hash and the "signature" hash? Why isn't one enough?
> **Key points:** Version = file content changed | Signature = public API changed | A change in a function body changes version but not signature | Dependent files only need to be re-checked when the signature changes | This saves an enormous amount of work

---

## Project References

Incremental build alone isn't enough for large projects. You
need **Project References** to split your project into independent
units:

```typescript annotated
// Monorepo structure:
// packages/
//   ├── shared/         ← Shared types and utilities
//   │   └── tsconfig.json
//   ├── api/            ← Backend
//   │   └── tsconfig.json
//   └── web/            ← Frontend
//       └── tsconfig.json
// tsconfig.json          ← Root config

// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    // ^ REQUIRED for referenced projects
    // ^ Enforces: declaration: true + all files in include
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}

// packages/web/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../shared" }
    // ^ "web" depends on "shared"
    // ^ tsc builds shared FIRST, then web
    // ^ Change in web → only web is rebuilt (shared stays)
  ],
  "include": ["src/**/*"]
}
```

> 💭 **Think about it:** What happens if you forget `composite: true` but
> still use `references`?
>
> **Answer:** TypeScript reports an error: "Referenced project must
> have setting 'composite': true." Without `composite`, the compiler
> cannot guarantee that .d.ts files exist — and Project
> References rely on referenced projects providing their
> .d.ts files instead of checking source code directly.

> 💭 **Think about it:** What's the difference between `composite: true` and
> `incremental: true`? Do you need both?
>
> **Answer:** `incremental: true` enables the `.tsbuildinfo` cache for
> a single project. `composite: true` is stricter — it enforces
> `declaration: true` and structures the project as a standalone
> compilation unit. Every `composite` project is automatically incremental,
> but not every incremental project is `composite`. For a monorepo
> with Project References you need `composite`. For a single project
> `incremental` is sufficient.

---

## Build Mode: tsc --build

With Project References you use `tsc --build` (or `tsc -b`)
instead of the normal `tsc`:

```typescript annotated
// Root tsconfig.json
{
  "files": [],
  // ^ No own files — only references
  "references": [
    { "path": "packages/shared" },
    { "path": "packages/api" },
    { "path": "packages/web" }
  ]
}

// Terminal:
// npx tsc --build               ← Builds everything (incrementally)
// npx tsc --build --clean       ← Deletes all build artifacts
// npx tsc --build --force       ← Forces a full build
// npx tsc --build --watch       ← Watch mode with incremental build
//
// What --build does differently from normal tsc:
// 1. Builds projects in the correct order (dependency graph)
// 2. Skips projects that haven't changed
// 3. Uses .tsbuildinfo for each sub-project
```

The advantage becomes dramatic with large monorepos:

```
Without Project References:
  Change in shared/utils.ts → recompile EVERYTHING (45s)

With Project References:
  Change in shared/utils.ts → rebuild shared (3s) + rebuild web (5s) = 8s
  Change in web/page.ts    → only web rebuilt (5s)
  Change in api/route.ts   → only api rebuilt (4s)
```

> ⚡ **Framework reference (Angular):** Angular's CLI uses Project References
> under the hood. When you run `ng build` in an Angular monorepo with
> multiple libraries, Angular builds the libraries in the
> correct order and caches the results. The `angular.json`
> configuration maps to Project References. Nx extends this with
> a distributed cache across machines.

> ⚡ **Framework reference (React/Vite):** Vite has supported Project References
> since version 4 automatically. When your `tsconfig.json` contains `references`,
> Vite detects the dependencies and builds packages in the correct
> order. Combined with Vite's fast HMR (Hot Module Replacement),
> this produces a development experience where changes in a
> library are immediately reflected in the browser — without the entire project
> needing to be rebuilt.

---

## When do you need what?

| Situation | Solution | Speedup |
|-----------|---------|:-------:|
| Single project, < 100 files | Nothing — tsc is fast enough | — |
| Single project, 100-500 files | `incremental: true` | 50-80% |
| Monorepo, 2-5 packages | Project References | 60-90% |
| Large monorepo, 10+ packages | Project References + Nx/Turborepo | 80-95% |

> 🧪 **Experiment:** Test the effect of `incremental: true` in any
> project:
>
> ```bash
> # Without incremental (full build):
> rm -f .tsbuildinfo
> time npx tsc --noEmit
>
> # First build with incremental (creates .tsbuildinfo):
> time npx tsc --noEmit --incremental
>
> # Second build with incremental (uses .tsbuildinfo):
> time npx tsc --noEmit --incremental
>
> # The second build should be 50-90% faster!
> ```
>
> Then make a small change to a file and build again —
> only the changed file and its dependents will be checked.

---

## Common Mistakes with Project References

```typescript annotated
// Mistake 1: Circular References
// packages/a references packages/b references packages/a
// → ERROR: "Project references may not form a circular graph"
// Solution: Extract shared code into a third package

// Mistake 2: Missing include when using composite
// {
//   "compilerOptions": { "composite": true },
//   // "include" is missing!
// }
// → TypeScript doesn't know which files belong to the project
// Solution: Always specify "include": ["src/**/*"]

// Mistake 3: Committing .tsbuildinfo to Git
// The file is machine-specific and can cause merge conflicts
// Solution: Add to .gitignore
// .gitignore:
// *.tsbuildinfo

// Mistake 4: Forgetting outDir with composite
// Without outDir, .d.ts files end up next to .ts files
// → Messy and causes problems with include
// Solution: Always set "outDir": "./dist"
```

> 🧠 **Explain it to yourself:** Why is it problematic if `.tsbuildinfo`
> gets committed to Git? What happens with merge conflicts?
>
> **Key points:** The file contains machine-specific paths and hashes |
> Two developers on different operating systems have different
> path separators (`\` vs `/`) | A merge conflict in `.tsbuildinfo` is
> hard to resolve manually | The solution is simple: the next build
> recreates it | Therefore ALWAYS add it to `.gitignore`

> 🧪 **Bonus experiment: Watch mode with incremental build**
>
> `--watch` mode combined with `incremental` is particularly effective:
>
> ```bash
> # Start watch mode:
> npx tsc --build --watch
>
> # Now change a file and save it:
> # You'll see in the terminal:
> # "File change detected. Starting incremental compilation..."
> # "Found 0 errors. Watching for file changes."
> #
> # The time between "change detected" and "Found 0 errors" is
> # the incremental build time — usually 100-500ms instead of 10-30s
> ```
>
> In watch mode the compiler process stays active and keeps the
> type checker in memory. This is even faster than individual
> `tsc --build` calls, because the cache doesn't need to be loaded from
> disk each time.

---

## What you've learned

- **Incremental build** (`incremental: true`) stores build info in `.tsbuildinfo`
- The `.tsbuildinfo` stores **version hashes** and **signature hashes** per file
- **Project References** split a monorepo into independently compilable units
- `composite: true` is **required** for referenced projects
- `tsc --build` builds projects in the correct order and skips unchanged ones

**Core concept to remember:** Incremental build is like a cache for the compiler. Project References are like microservices for your type system — each package is a standalone compilation unit with its own .tsbuildinfo. Together they reduce build times in monorepos by 80-95%.

---

> **Break point** -- Good moment for a break. You now understand
> how TypeScript efficiently compiles large projects.
>
> Continue with: [Section 06: Practice — Monorepo Performance and CI Optimization](./06-praxis-monorepo-performance.md)