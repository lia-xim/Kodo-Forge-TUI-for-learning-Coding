# Section 6: Practice — Monorepo Performance and CI Optimization

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Incremental Compilation](./05-inkrementelle-kompilierung.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How to structure an **Angular/React monorepo** for optimal compile performance
- How to speed up **CI pipelines** with TypeScript builds
- Which **build tools** (Nx, Turborepo) build on top of Project References
- A complete **performance audit** on a real-world example

---

## Background: Monorepos in Practice

> **Origin Story: Google's Monorepo**
>
> Google has a single repository with over 2 billion lines of code.
> The reason this works is a massively parallelized build system
> (Bazel). The TypeScript ecosystem has created a similar concept for JavaScript/
> TypeScript monorepos with Nx (developed by former Angular
> team members).
>
> The core idea: don't rebuild everything, only what has changed
> — and cache that across machines. In practice this means:
> if a colleague already built the same code, you download the result
> from the cache instead of compiling it yourself.

Monorepos are the standard in enterprise Angular projects and are
becoming increasingly popular in React projects. The challenge: how do you manage
20+ packages without every build taking minutes?

---

## Monorepo Structure for Performance

The optimal structure has **three layers**:

```
  monorepo/
  ├── packages/
  │   ├── types/              ← Layer 1: Shared Types (no logic)
  │   │   └── tsconfig.json   ← composite: true, fastest to build
  │   │
  │   ├── utils/              ← Layer 2: Shared Utilities
  │   │   └── tsconfig.json   ← references: [types]
  │   │
  │   ├── api-client/         ← Layer 2: API Layer
  │   │   └── tsconfig.json   ← references: [types, utils]
  │   │
  │   ├── web-app/            ← Layer 3: Apps (dependent on layers 1+2)
  │   │   └── tsconfig.json   ← references: [types, utils, api-client]
  │   │
  │   └── admin-app/          ← Layer 3: Additional App
  │       └── tsconfig.json   ← references: [types, utils, api-client]
  │
  └── tsconfig.json           ← Root: references to all packages
```

```typescript annotated
// packages/types/tsconfig.json — Layer 1
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    // ^ declarationMap enables "Go to Definition" into the .ts source
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
  // ^ No "references" — types has no dependencies
}

// packages/web-app/tsconfig.json — Layer 3
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "strict": true
  },
  "references": [
    { "path": "../types" },
    { "path": "../utils" },
    { "path": "../api-client" }
    // ^ Explicit dependencies — the compiler knows the build order
  ],
  "include": ["src/**/*"]
}
```

> 🧠 **Explain it to yourself:** Why should "types" contain no logic, only interfaces and type aliases? What would be the problem if types also had functions?
> **Key points:** Pure types have type erasure → no JavaScript output | A change to a types signature triggers a rebuild of all dependents | The smaller types is, the less frequent rebuilds are | Separate logic into utils → type change ≠ logic change

---

## Optimizing the CI Pipeline

```typescript annotated
// .github/workflows/ci.yml (GitHub Actions example)
//
// BAD: Check everything on every push
// steps:
//   - run: npx tsc --noEmit          ← Checks EVERYTHING, even unchanged files
//   - run: npm test                   ← Tests EVERYTHING
//
// GOOD: Only check what's affected
// steps:
//   - run: npx tsc --build --noEmit  ← Incremental, uses tsBuildInfo
//   - run: npx nx affected --target=test  ← Only test affected packages

// Cache strategy for CI:
// 1. Cache .tsbuildinfo files (GitHub Actions Cache)
// 2. Cache node_modules (npm ci is slow)
// 3. Use Nx Remote Cache (optional)
```

Concrete GitHub Actions configuration:

```typescript annotated
// .github/workflows/ci.yml
// name: TypeScript CI
// on: [push, pull_request]
// jobs:
//   typecheck:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with:
//           node-version: 20
//           cache: 'npm'
//       
//       - name: Cache tsBuildInfo
//         uses: actions/cache@v4
//         with:
//           path: |
//             **/.tsbuildinfo
//             **/dist/**/*.d.ts
//           key: tsbuild-${{ hashFiles('**/tsconfig.json') }}-${{ github.sha }}
//           restore-keys: tsbuild-${{ hashFiles('**/tsconfig.json') }}-
//           # ^ Caches the build artifacts between CI runs
//           # ^ Cache is only invalidated when tsconfig changes
//
//       - run: npm ci
//       - run: npx tsc --build --noEmit
//         # ^ Uses the cached .tsbuildinfo
//         # ^ First run: 45s. Subsequent runs: 5-10s.
```

> 💭 **Think about it:** Why do we cache both `.tsbuildinfo` AND `dist/**/*.d.ts`?
> Why isn't `.tsbuildinfo` alone sufficient?
>
> **Answer:** The `.tsbuildinfo` references the .d.ts files as
> "signatures". If the .d.ts files are missing but .tsbuildinfo exists, the
> compiler must rebuild everything because the signatures cannot be
> verified. Caching both together is essential.

---

## Build Tools: Nx and Turborepo

For monorepos with 5+ packages, a build tool is worthwhile:

```typescript annotated
// Nx (recommended for Angular monorepos)
// npx nx affected --target=build
// ^ Builds only packages affected by the change
// ^ Uses a dependency graph that Nx creates automatically
// ^ Remote Cache: results are shared across the team

// Turborepo (recommended for React/Next.js monorepos)
// npx turbo build
// ^ Similar concept, different implementation
// ^ Cache is also remote-capable (Vercel Remote Cache)

// Comparison:
// Nx:        Deep Angular integration, more features, larger setup
// Turborepo: Simpler, faster, better for "straightforward" monorepos
// ^ Both use TypeScript Project References under the hood
```

> ⚡ **Framework Reference (Angular + React):** If you work with Angular
> professionally, Nx is the standard choice — it was built by the former Angular
> team and has first-class Angular support (Schematics,
> Generators, etc.). For your personal React projects, Turborepo is
> often the simpler choice — less configuration, faster onboarding.

---

## Performance Audit: A Real-World Example

Imagine you have an Angular monorepo with the following problem:
"Full build takes 90 seconds, watch-mode rebuild takes 25 seconds."

Here's how you proceed:

```typescript annotated
// Step 1: Measure the baseline
// npx tsc --build --extendedDiagnostics
//
// Result:
// Check time: 72s (80% of total time)
// Files: 1,247
// Memory: 890MB

// Step 2: Low-Hanging Fruits
// a) skipLibCheck: true → Check time: 58s (saved 14s!)
// b) isolatedModules: true → Enables esbuild transpilation
// c) incremental: true → Rebuild: 8s instead of 25s

// Step 3: Analyze the trace
// npx tsc --generateTrace ./trace
// → Slowest file: shared/types/api-responses.ts (8.4s)
// → Cause: Huge union with 120 API response types

// Step 4: Split up the union
// BEFORE: type ApiResponse = UserResponse | PostResponse | ... (120 variants)
// AFTER:  Mapped type with lookup (Section 3)
// → Check time for this file: 1.2s (instead of 8.4s)

// Step 5: Introduce Project References
// shared/, api/, web/ as separate projects
// → Rebuild after change in web/: 3s instead of 8s

// Result:
// Full Build: 90s → 38s
// Watch Rebuild: 25s → 3-5s
// CI with Cache: 90s → 8s
```

> 🧪 **Experiment:** Run a mini audit on your own project:
>
> ```bash
> # 1. Baseline
> npx tsc --noEmit --extendedDiagnostics 2>&1 | grep -E "Check time|Total time|Memory"
>
> # 2. With skipLibCheck
> npx tsc --noEmit --extendedDiagnostics --skipLibCheck 2>&1 | grep -E "Check time|Total time|Memory"
>
> # 3. Calculate the difference
> # Check time difference = time spent checking .d.ts files
> ```
>
> Note the numbers. In the next lesson (L35: Migration Strategies)
> you'll see how this performance analysis also helps during migrations.

---

## Summary: The Performance Workflow

```
  1. Measure       → --extendedDiagnostics, --generateTrace
  2. Quick Wins    → skipLibCheck, isolatedModules, incremental
  3. Structure     → Project References for monorepos
  4. Optimize      → Refactor the slowest types (interface instead of &, split unions)
  5. Cache         → .tsbuildinfo in CI, Nx/Turborepo Remote Cache
  6. Repeat        → Define a performance budget, measure regularly
```

---

## What you've learned

- A monorepo ideally has **three layers**: Types, Utilities, Apps
- **CI caching** of `.tsbuildinfo` + `.d.ts` saves 80%+ of CI build time
- **Nx** is ideal for Angular monorepos, **Turborepo** for React/Next.js
- A **performance audit** always follows: Measure → Quick Wins → Structure → Optimize
- The combination of all techniques can reduce builds from **90s to under 10s**

**Core concept to remember:** TypeScript performance is not a mystery — it's a measurable, optimizable problem. With the right tools (--generateTrace), the right settings (skipLibCheck, incremental), and the right structure (Project References), you can compile even large codebases in seconds rather than minutes.

---

> **End of lesson.** You now have a deep understanding of how the
> TypeScript compiler works and how to keep it fast.
>
> Continue with: **L35 — Migration Strategies**