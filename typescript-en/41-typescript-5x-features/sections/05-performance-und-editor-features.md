# Section 5: Performance and Editor Features

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Array and Control Flow Improvements](./04-array-und-controlflow-improvements.md)
> Next section: [06 - The Upgrade Path and the Future of TypeScript](./06-upgrade-pfad-und-zukunft.md)

---

## What you'll learn here

- Why TypeScript performance is critical in large projects (100k+ LOC)
- What `isolatedDeclarations` (TS 5.5) means and when to enable it
- How to diagnose performance bottlenecks in your editor using `tsserver.log`
- How the Angular Language Service uses TypeScript internally for template type-checking

---

## The Problem: TypeScript Gets Slow

Imagine working in an Angular project with 200 components, 50 services, and 30,000 lines
of TypeScript. Every time you save a file, you wait 3–4 seconds before autocomplete appears.
The red squiggles show up with a delay. Refactoring hangs.

This isn't a hypothetical scenario. It's everyday reality in large enterprise projects
without careful TypeScript configuration.

> **The Story: VS Code as a Benchmark**
>
> The TypeScript team at Microsoft has an unusual approach to performance:
> they use **VS Code itself** as their primary performance benchmark. VS Code is
> written in TypeScript — over 1,000 files, millions of lines. If a new TypeScript
> version makes VS Code slower, it doesn't ship.
>
> This "eat your own dog food" mentality has led to continuous performance improvements
> since TS 4.x. In TS 5.x, compile times for large projects were reduced by 10–50% —
> not through algorithmic miracles, but through careful profiling work on real codebases.
>
> The TypeScript team regularly publishes "Performance Improvements" posts on the
> official blog with concrete measurements. That's rare in the language world.

---

## `--skipLibCheck`: The Double-Edged Sword

The first and most well-known performance option is `skipLibCheck`:

```typescript annotated
// tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true
    // ^ TypeScript does NOT check .d.ts files in node_modules
    // This saves a lot of time — but at a price
  }
}
```

**Why it's fast:** TypeScript normally checks all `.d.ts` files from your dependencies
(e.g. `node_modules/@angular/core/index.d.ts`). In large projects with many packages,
that's thousands of files. `skipLibCheck` skips all of those checks.

**When it makes sense:**
- You're using well-maintained libraries (Angular, React) with correct types
- Conflicts between different type-definition versions are bothering you
- CI build time is critical

**When it's dangerous:**
- Your own `.d.ts` files won't be checked either
- Errors in type definitions from your dependencies stay invisible
- If you're using a library version with broken types, you won't notice

> 💭 **Think about it:** `skipLibCheck` is set to `true` by default in many project
> templates — including Angular. Why might that be a deliberate decision by the Angular
> team, rather than just negligence?
>
> **Answer:** Angular projects often have hundreds of npm packages. The Angular types
> themselves are thoroughly tested by the Angular team. `skipLibCheck: true` is pragmatic:
> it prevents external library conflicts (e.g. between different RxJS versions) from
> blocking your own project. The Angular team trusts that their own type definitions
> are correct — and saves users compile time.

---

## `isolatedDeclarations`: The Parallelization Revolution (TS 5.5)

This was the biggest performance feature in TypeScript 5.5.

**The problem before:** TypeScript is single-threaded. In large projects, the compiler
had to perform all type inference sequentially before it could generate `.d.ts` files.
Tools like esbuild or `swc` could transpile quickly, but couldn't generate type declarations.

```typescript annotated
// WITHOUT isolatedDeclarations:
export const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
// ^ TypeScript must infer the type: { apiUrl: string; timeout: number }
// This requires the entire type inference pipeline

// WITH isolatedDeclarations (TS 5.5):
// You must annotate the return type EXPLICITLY:
export const config: { apiUrl: string; timeout: number } = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
// ^ Now ANY tool (esbuild, swc, babel) can generate the .d.ts
// without starting the full TypeScript compiler!
```

**What `isolatedDeclarations: true` does:**

It enforces that all exported symbols have explicit type annotations.
This allows each file to be processed **independently** — no global type inference
pass required.

```typescript annotated
// tsconfig.json:
{
  "compilerOptions": {
    "isolatedDeclarations": true,
    // ^ Every file must be typeable on its own
    // TypeScript errors if an exported variable has no explicit type
    // and the type isn't trivially inferable
    "declaration": true
    // ^ Combined with isolatedDeclarations: .d.ts can be generated in parallel
  }
}
```

**When to enable:**
- You're building a **library** (npm package), not an app
- You're using a build tool like Vite, esbuild, or Turbopack
- Your project has many independent modules that should be compiled in parallel

**When to skip:**
- In normal Angular/React applications (no library build)
- If you see explicit annotations as extra overhead (but they're good practice!)

> 🧠 **Explain it to yourself:** Why might `isolatedDeclarations` paradoxically improve
> **code quality**, even though it's a performance optimization?
>
> **Key points:** Enforces explicit types on exports | Makes API boundaries visible |
> Prevents "type leakage" of implementation details | Better readability of public APIs |
> Similar effect to always typing public methods in Java

---

## LSP Improvements in TypeScript 5.x

The **Language Server Protocol (LSP)** is the interface between your editor
(VS Code, WebStorm, Neovim) and the TypeScript compiler. Every time you type,
save a file, or hover over a variable, your editor communicates with the `tsserver`
process via LSP.

TypeScript 5.x brought several LSP improvements:

**Faster Go-to-Definition:** Jumping to a type definition was slow for re-exported
types. TS 5.x optimizes the lookup algorithm — especially noticeable in large monorepos.

**Better Inlay Hints Caching:** Inlay hints (the gray type annotations VS Code displays)
are now cached and only recalculated when needed.

**Faster Completion After Dot Notation:** Suggestions after `obj.` now appear faster
because the narrowing algorithm was optimized.

---

## `tsserver.log`: The Performance Doctor

When your editor is slow, you can diagnose the TypeScript Language Server:

```typescript annotated
// In VS Code settings.json:
{
  "typescript.tsserver.log": "verbose"
  // ^ Enables detailed logging of tsserver
  // Then: Command Palette → "TypeScript: Open TS Server log"
  // You'll see which operations take how long
}
```

In the log you'll see entries like:

```
[13:42:01.231] getCompletions: took 342ms
[13:42:01.574] getDefinitionAndBoundSpan: took 1.2s
[13:42:02.801] getSemanticDiagnostics: took 2.8s
```

If `getSemanticDiagnostics` takes more than 1 second, you have a problem.
Possible causes:
- Too many `any` casts that TypeScript can't optimize at runtime
- Complex conditional types with many levels of nesting
- Missing `paths` configuration leading to long import lookups

---

## Angular Language Service: TypeScript in the Template

> ⚡ **Framework reference: Angular**
>
> The **Angular Language Service** is a plugin for the TypeScript Language Server.
> It extends tsserver with understanding of Angular templates (`.html` files).
>
> ```typescript
> // When you write in an Angular template:
> // <button [disabled]="isLoading">{{ userName }}</button>
> //
> // The Angular LS checks:
> // - Does 'isLoading' exist in the component class?
> // - Is 'isLoading' assignable to boolean? (for [disabled])
> // - Does 'userName' exist as a property or getter?
> // - What type does 'userName' have? (for safe interpolation)
> ```
>
> In TS 5.x, the performance of the Angular Language Service improved measurably
> thanks to the improved LSP foundations. In large Angular projects (50+ components),
> template completion used to be sluggish — with TS 5.5+ and Angular 17+ it's
> noticeably faster.
>
> You can configure this yourself:
>
> ```json
> // tsconfig.json (Angular):
> {
>   "angularCompilerOptions": {
>     "strictTemplates": true,
>     // ^ Enables full type-checking in templates
>     // Requires the Angular LS and costs some performance —
>     // but catches real bugs!
>     "strictInputAccessModifiers": true
>     // ^ Checks whether Input properties are readonly (TS 5.x pattern)
>   }
> }
> ```

---

## Experiment Box: Measuring Performance

```typescript
// Measure your TypeScript build time:
// $ time npx tsc --noEmit
// real    0m4.231s   <- without optimizations
//
// With --skipLibCheck:
// $ time npx tsc --noEmit --skipLibCheck
// real    0m1.847s   <- 56% faster!
//
// With --incremental:
// $ time npx tsc --noEmit --incremental
// real    0m0.412s   <- 90% faster (after the first run)
//
// tsconfig.json for fast development:
{
  "compilerOptions": {
    "skipLibCheck": true,      // don't check external .d.ts files
    "incremental": true,       // use build cache
    "tsBuildInfoFile": ".tsbuildinfo",  // cache file
    "noEmit": true             // type-check only, don't compile
  }
}
//
// IMPORTANT: add .tsbuildinfo to .gitignore!
// It's a machine-specific cache file.
```

---

```typescript annotated
// tsconfig.json with performance flags annotated:
{
  "compilerOptions": {
    // --- Basic settings ---
    "target": "ES2022",
    // ^ What the browser/Node should execute

    "module": "ESNext",
    // ^ ESM modules (not CommonJS)

    // --- Performance flags ---
    "skipLibCheck": true,
    // ^ node_modules/*.d.ts files are NOT checked
    // Saves 40-60% build time in large projects

    "incremental": true,
    // ^ TypeScript caches the compile state
    // Only changed files are rechecked

    "tsBuildInfoFile": "./.tsbuildinfo",
    // ^ Path for the incremental cache

    // --- Correctness ---
    "strict": true,
    // ^ Enables all strict checks (always enable!)

    "noUncheckedIndexedAccess": true,
    // ^ arr[0] has type T | undefined, not T
    // Slightly annoying, but prevents real bugs

    // --- Library-build-specific ---
    "declaration": true,
    // ^ Generates .d.ts files
    "isolatedDeclarations": true
    // ^ Libraries only: enforces explicit export types
    // Enables parallel .d.ts generation by other tools
  }
}
```

---

## What You've Learned

- `skipLibCheck: true` saves a lot of build time, but skips checking library types
- `isolatedDeclarations` (TS 5.5) enforces explicit export types and enables parallel compilation
- `incremental: true` caches the build state and makes repeated checks drastically faster
- `tsserver.log` exposes performance bottlenecks in your editor
- The Angular Language Service is built on top of the TypeScript LSP and benefits directly from TS 5.x improvements

**Core concept:** TypeScript performance is not a property of the compiler — it's a
property of your `tsconfig.json`. With the right flags, the same codebase can compile
10x faster.

> 🧠 **Explain it to yourself:** You have a large Angular project (150 components, 80
> services). Developers are complaining about sluggish autocomplete. Which three
> tsconfig options would you adjust first, and why?
>
> **Key points:** skipLibCheck for faster .d.ts processing | incremental for
> caching between saves | strictTemplates possibly set to false for faster
> template feedback | tsserver.log to identify the bottleneck

---

> **Pause point** — A good moment for a short break. You've explored the performance
> side of TypeScript — the side that's often missing from tutorials but is decisive
> in real-world projects.
>
> Continue with: [Section 06: The Upgrade Path and the Future of TypeScript](./06-upgrade-pfad-und-zukunft.md)