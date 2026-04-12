# Section 4: Measuring and Optimizing Compile Time

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Writing Performant Types](./03-performante-typen-schreiben.md)
> Next section: [05 - Incremental Compilation](./05-inkrementelle-kompilierung.md)

---

## What you'll learn here

- How to see compile time **in numbers** with `--extendedDiagnostics`
- How `--generateTrace` delivers a **detailed per-file analysis**
- How to use the **Chrome DevTools Profiler** for TypeScript traces
- Concrete steps to identify and fix the **slowest files**

---

## Background: Measure, don't guess

> **Origin Story: --generateTrace**
>
> Until TypeScript 4.1 (2020), compiler performance was a mystery.
> Developers knew their builds were slow, but not WHY.
> The TypeScript team itself used an internal tracing tool that was never
> made public. After years of community requests, `--generateTrace`
> was introduced in TypeScript 4.1 — it gives you the same information
> the TypeScript team uses internally for optimization.
>
> Ryan Cavanaugh (TypeScript Lead) said: "We should have done this much
> earlier. Most performance bugs reported to us are things developers
> could have found themselves — if they'd had the tools."
>
> The inspiration came from the Chrome DevTools Performance Tab. The TypeScript
> team saw how effective visual traces were for JavaScript performance
> and decided: "If it works for JS, why not for the type checker?" The result
> is a trace format that can be loaded directly into Chrome DevTools and Perfetto.

The first rule of optimization: **Measure, don't guess.** You might
think a particular file is slow — but the problem is often elsewhere.
TypeScript gives you the tools to find out.

> 🏗️ **Analogy: Doctor's Diagnosis and Compiler Profiling**
>
> Imagine going to the doctor with a headache. A bad doctor immediately
> prescribes painkillers (like a developer who blindly turns on `skipLibCheck`).
> A good doctor measures first: blood pressure, blood work, ECG.
>
> `--extendedDiagnostics` is like a blood pressure monitor — a quick
> overview. `--generateTrace` is the MRI — detailed, but more involved.
> Diagnose first, then treat. Similarly, you should measure where time
> is going before you optimize.

---

## Step 1: --extendedDiagnostics

The simplest starting point. Add `--extendedDiagnostics` to your
tsc call:

```typescript annotated
// Terminal command:
// npx tsc --extendedDiagnostics
//
// Output (example):
//
// Files:              342
// Lines:              98,234
// ^ Total codebase size
//
// Parse time:         0.82s
// ^ Scanner + Parser (rarely the problem)
// Bind time:          0.34s
// ^ Binder (almost never the problem)
// Check time:         12.45s
// ^ <<< THE CHECKER — almost always where the problem lies
// Emit time:          1.23s
// ^ Emitter (sometimes optimizable with skipLibCheck)
//
// Total time:         14.84s
//
// Memory used:        412,345K
// ^ Memory usage — above 1GB you have a problem
```

The most important numbers:

- **Check time**: Should be below 70% of total time. Above that: complex types
- **Memory used**: Under 500MB is normal. Over 1GB: too many type instantiations
- **Files**: Check whether node_modules are being checked (they shouldn't be!)

> 🧠 **Explain to yourself:** What does it mean when "Emit time" is
> unexpectedly high (e.g. 30% of total time)? What could cause this?
>
> **Key points:** Emit time is code generation (TS → JS) | High
> emit time indicates many files or complex transformation rules |
> Common cause: source maps are being generated (`"sourceMap": true`) |
> `declaration: true` also increases emit time because .d.ts files are written |
> For pure type checking use `--noEmit` — then emit time disappears entirely

> 🧠 **Explain to yourself:** If "Parse time" is 0.8s and "Check time" is 12s, what percentage of total time does parsing account for? What does that tell you about optimization approaches?
> **Key points:** Parsing is ~5% of total time | Even making parsing 50% faster: saves 0.4s | Checker 10% faster: saves 1.2s | Always focus on the largest share

---

## Step 2: --generateTrace

For detailed analysis:

```typescript annotated
// Terminal command:
// npx tsc --generateTrace ./trace-output
//
// Creates in the ./trace-output folder:
// ├── trace.json        ← Chrome DevTools trace
// ├── types.json        ← All type instantiations
// └── legend.json       ← Legend for the trace file
//
// Opening trace.json:
// 1. Open Chrome
// 2. Navigate to chrome://tracing
// 3. Load trace.json (drag & drop)
// ^ You see a timeline with all compiler phases
// ^ Every file, every type, every instantiation is visible
```

In the Chrome trace view you see:

- **Wide bars** = slow operations (those are the ones to optimize)
- **Deep nesting** = recursive type resolutions
- **Repeated identical operations** = missing caching opportunities

> 💭 **Think about it:** If you see in the Chrome trace that the same file
> appears multiple times as "checkSourceFile" — what does that mean?
>
> **Answer:** Normally every file is only checked once. If it appears
> multiple times, that's a strong indicator of a problem:
> Either `incremental: true` wasn't configured correctly, or
> the file is being checked by multiple independent compiler instances
> (e.g. in a monorepo without Project References). In rare cases
> it can also be caused by corrupted IDE caches — restarting the
> TypeScript server will help then.

> 💭 **Think about it:** Why does TypeScript use the Chrome trace format instead
> of its own format?
>
> **Answer:** The Chrome Trace Format (also "Trace Event Format") is an
> industry standard. Chrome DevTools, Perfetto, and many other tools
> can read it. The TypeScript team didn't need to build their own visualization
> tool — they simply use the existing infrastructure.

---

## Step 3: Finding the slowest files

With the trace you can find "hotspots". But there's also a
faster way:

```typescript annotated
// Terminal command for the top 10 slowest files:
// npx tsc --generateTrace ./trace && node -e "
//   const trace = require('./trace/trace.json');
//   const checks = trace
//     .filter(e => e.name === 'checkSourceFile')
//     .map(e => ({ file: e.args.path, ms: (e.dur / 1000).toFixed(0) }))
//     .sort((a, b) => b.ms - a.ms)
//     .slice(0, 10);
//   console.table(checks);
// "
//
// Output (example):
// ┌─────────┬─────────────────────────────────┬────────┐
// │ (index) │ file                            │ ms     │
// ├─────────┼─────────────────────────────────┼────────┤
// │ 0       │ src/api/complex-types.ts        │ '3421' │
// │ 1       │ src/forms/all-forms.ts          │ '2108' │
// │ 2       │ src/store/root-state.ts         │ '1876' │
// └─────────┴─────────────────────────────────┴────────┘
// ^ These 3 files cause 50% of check time!
```

> ⚡ **Framework note (Angular):** In Angular projects the
> slowest files are often the generated `.ngtypecheck.ts` files
> (Template Type Checking). You see them in the trace as `ngtypecheck`
> entries. When a component is particularly slow, it often has
> a complex template with many *ngFor, *ngIf, and pipe calls.
> Angular 16+ with Signals and the new Control Flow (`@if`, `@for`)
> is significantly faster here than the directive syntax.

> ⚡ **Framework note (Next.js):** Next.js has used the
> SWC transpiler instead of Babel since version 13. SWC is written in Rust and
> transpiles TypeScript 20x faster than Babel. BUT: SWC performs
> NO type checking. That's why Next.js runs `tsc --noEmit` in parallel
> during the build process. In development mode, type checking is often
> disabled entirely or only runs in the background. This also explains
> why in Next.js you sometimes only see type errors when you
> run `tsc --noEmit` manually.

---

## Step 4: skipLibCheck and isolatedModules

Two tsconfig options that help immediately:

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,
    // ^ Skips type checking of .d.ts files
    // ^ Saves 10-30% compile time in projects with many @types/*
    // ^ RECOMMENDED: Almost all large projects use this
    // ^ Downside: Errors in .d.ts files won't be caught (extremely rare)

    "isolatedModules": true
    // ^ Each file is treated as an independent module
    // ^ Enables restrictions that allow faster transpilers
    // ^ Required for: esbuild, swc, Babel (they can't do cross-file checking)
    // ^ RECOMMENDED: Should be enabled in all modern projects
  }
}
```

The combination of these two options can save 20-40% compile time,
without changing a single type.

> 🧪 **Experiment:** Run the following in your project:
>
> ```bash
> # Measure baseline:
> time npx tsc --noEmit --extendedDiagnostics
>
> # With skipLibCheck:
> time npx tsc --noEmit --extendedDiagnostics --skipLibCheck
>
> # Compare "Check time" in both outputs
> # The difference = time spent on .d.ts checking
> ```
>
> In projects with many dependencies (Angular alone has ~20 @types packages)
> skipLibCheck can save 5-10 seconds.

> 🧪 **Bonus experiment: Analyzing memory usage**
>
> Besides time, memory consumption is also an important indicator:
>
> ```bash
> # Enable memory profiler:
> node --max-old-space-size=4096 node_modules/typescript/lib/tsc.js \
>   --extendedDiagnostics --noEmit
>
> # Or with Node.js profiling:
> node --inspect-brk node_modules/typescript/lib/tsc.js --noEmit
> # Then open chrome://inspect and start Memory Profiler
> ```
>
> When the TypeScript compiler uses more than 1GB of RAM, that's a
> sure sign of too many type instantiations. Typical causes:
> auto-generated GraphQL types, large OpenAPI client generations,
> or DeepReadonly/DeepPartial on deeply nested structures.

---

## Step 5: tsc --noEmit for fast feedback

For day-to-day development: separate type checking from code generation:

```typescript annotated
// ONLY type checking (no JavaScript generated):
// npx tsc --noEmit
// ^ Skips the emitter phase entirely
// ^ Ideal for CI: "Are the types correct?"

// Code generation with a fast transpiler:
// npx esbuild src/index.ts --bundle --outdir=dist
// ^ esbuild transpiles TypeScript → JavaScript in milliseconds
// ^ BUT: esbuild checks NO types! (isolatedModules mode)

// Combined workflow:
// 1. esbuild for fast transpilation (development)
// 2. tsc --noEmit in CI for type checking
// ^ Best of both worlds: fast dev + safe types
```

> ⚡ **Framework note (React):** Vite (the standard bundler for React)
> uses exactly this approach: esbuild transpiles TypeScript at lightning speed
> (no type checking!), and `tsc --noEmit` runs separately in the background
> or CI. Next.js does the same with SWC as transpiler. The result:
> hot reload in milliseconds instead of seconds.

---

## Checklist: Optimizing compile time

Before optimizing individual types, check these low-hanging fruits:

1. **skipLibCheck: true** — immediately 10-30% faster
2. **isolatedModules: true** — enables fast transpilers
3. **No accidental includes** — check `include` and `exclude` in tsconfig
4. **Don't check node_modules** — `"exclude": ["node_modules"]`
5. **Incremental Build** — `"incremental": true` (next section!)
6. **Project References** — for monorepos (next section!)

Only once these basics are in place is it worth optimizing the most
expensive types (Section 3).

> 🧠 **Explain to yourself:** Why should you regularly check `include` and `exclude`?
> What can go wrong?
>
> **Key points:** A wrong `include: ["**/*"]` can pull in test files,
> build artifacts, and node_modules | This dramatically increases the file count
> and extends both parse AND check time |
> Best practice: specify explicit paths like `include: ["src/**/*.ts"]` |
> The `exclude` list should always contain: `node_modules`, `dist`,
> `coverage`, `**/*.spec.ts` (when tests are checked separately)

---

## What you've learned

- `--extendedDiagnostics` shows you **where time is going** (check time vs. parse time)
- `--generateTrace` generates a **detailed trace file** for Chrome DevTools
- **skipLibCheck** and **isolatedModules** immediately save 20-40% compile time
- Separate **type checking** (tsc --noEmit) from **transpilation** (esbuild/swc) for fast dev
- The slowest **3-5 files** often cause 50%+ of compile time

**Core concept to remember:** Measure, don't guess. `--extendedDiagnostics` for the overview, `--generateTrace` for the details. And the cheapest optimizations (skipLibCheck, isolatedModules) first — before you change a single line of type code.

---

> **Break point** -- Good moment for a break. You now have the
> tools to find performance problems.
>
> Continue with: [Section 05: Incremental Compilation](./05-inkrementelle-kompilierung.md)