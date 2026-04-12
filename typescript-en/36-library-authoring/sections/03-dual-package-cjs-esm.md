# Section 3: Dual Package (CJS + ESM)

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Generating Declaration Files Correctly](./02-declaration-files-generieren.md)
> Next section: [04 - Generic Library Patterns](./04-generische-library-patterns.md)

---

## What you'll learn here

- Why you need to ship **both CommonJS and ES Modules**
- What the **Dual Package Hazard** is and how to avoid it
- How to generate both formats using **tsup** or **esbuild**
- The correct **package.json configuration** for dual packages

---

## Background: Why two formats?

> **Origin Story: The CJS/ESM Transition**
>
> JavaScript has a divided past: Node.js has used CommonJS
> (`require`/`module.exports`) since 2009, while browsers have used
> ES Modules (`import`/`export`) since ES2015. Until 2020, CJS was the
> de-facto standard for npm packages. Since 2022, the ecosystem has been
> moving massively toward ESM — but the transition is taking years.
>
> The problem for library authors: your consumers use BOTH formats.
> Angular projects use ESM. Older Node.js scripts use CJS. Build tools
> like Jest use CJS or ESM depending on configuration. If your library
> only ships one format, you're excluding the other half.

Think of the dual package like an international travel adapter. You
travel with your devices to England, Japan, and the US — and every
country has different outlets. Your adapter has ALL plug types built in.
That's exactly how your library must "bring along" ALL module formats so
it just works in any environment. The consumer plugs in and it works —
no configuration required.

The reality in 2024+: you need to ship both formats. This is called a
"dual package" — a package that supports both CJS and ESM.

---

## The Anatomy of a Dual Package

```typescript annotated
// dist/
//   index.js       ← ESM (import/export)
//   index.cjs      ← CJS (require/module.exports)
//   index.d.ts     ← Types for ESM
//   index.d.cts    ← Types for CJS
//
// File extensions matter:
// .js + "type": "module" → ESM
// .cjs → ALWAYS CommonJS (regardless of what "type" says)
// .mjs → ALWAYS ES Module (regardless of what "type" says)
// .d.ts → Types for .js
// .d.cts → Types for .cjs
// .d.mts → Types for .mjs

// package.json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  // ^ Default interpretation for .js files = ESM

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // ^ Types for ESM consumers
      "import": "./dist/index.js",
      // ^ ESM: import { x } from "my-lib"
      "require": {
        "types": "./dist/index.d.cts",
        // ^ Types for CJS consumers
        "default": "./dist/index.cjs"
        // ^ CJS: const { x } = require("my-lib")
      }
    }
  },

  // Legacy fallbacks:
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

> 🧠 **Explain it to yourself:** Why does CJS need its own .d.cts files? Why aren't the regular .d.ts files enough?
> **Key points:** .d.ts and .d.cts can have different default exports | ESM has named + default exports | CJS has module.exports (= default) | The type signatures can differ | TypeScript 4.7+ distinguishes based on the extension

---

## The Dual Package Hazard

The biggest risk with dual packages:

```typescript annotated
// The problem: CJS and ESM load DIFFERENT module instances!

// Imagine: my-lib has an internal cache
// src/index.ts:
const cache = new Map<string, unknown>();
export function setCache(key: string, value: unknown) {
  cache.set(key, value);
}
export function getCache(key: string) {
  return cache.get(key);
}

// If a project loads BOTH formats:
// File A (ESM): import { setCache } from "my-lib";
//               setCache("key", "value");
//
// File B (CJS): const { getCache } = require("my-lib");
//               getCache("key");  // → undefined!
//
// ^ ESM and CJS load DIFFERENT instances of my-lib
// ^ Each instance has its own cache
// ^ setCache in ESM → getCache in CJS finds nothing
```

**Solutions:**

```typescript annotated
// Solution 1: Stateless library (recommended)
// No internal state → no hazard
export function formatDate(date: Date): string {
  return date.toISOString();
}
// ^ Pure functions without side effects → safe for dual package

// Solution 2: CJS wrapper (re-exports ESM)
// dist/index.cjs:
// module.exports = require("./index.js");
// ^ Both formats use the same ESM instance
// ^ BUT: only works in newer Node.js versions

// Solution 3: ESM-only (the future)
// If your target audience allows it: ship only ESM
// "type": "module", no "require" in exports
// ^ More and more libraries are taking this route (e.g. chalk, got, p-queue)
```

> 💭 **Think about it:** If more and more libraries are shipping ESM-only,
> why not just do the same? What keeps CJS alive?
>
> **Answer:** Jest (in many configurations), older Webpack setups,
> AWS Lambda (default runtime), and legacy Node.js projects need CJS.
> As long as your consumers need CJS, you need to ship it.

---

## Build Setup with tsup

tsup is the recommended tool for dual packages:

```typescript annotated
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  // ^ Entry point(s) of your library

  format: ["cjs", "esm"],
  // ^ Generates both .cjs and .js (ESM)

  dts: true,
  // ^ Generates .d.ts and .d.cts automatically!
  // ^ tsup uses tsc internally for declaration generation

  splitting: false,
  // ^ No code splitting for libraries (one bundle per format)

  sourcemap: true,
  // ^ Source maps for debugging

  clean: true,
  // ^ Deletes dist/ before the build

  outDir: "dist"
});

// Build command: npx tsup
// Result in dist/:
//   index.js      ← ESM
//   index.cjs     ← CJS
//   index.d.ts    ← Types (ESM)
//   index.d.cts   ← Types (CJS)
```

> ⚡ **Framework connection (React):** When building a React component
> library, you use tsup with additional JSX configuration:
>
> ```typescript
> // tsup.config.ts for React library
> export default defineConfig({
>   entry: ["src/index.tsx"],
>   format: ["cjs", "esm"],
>   dts: true,
>   external: ["react", "react-dom"],
>   // ^ React as peerDependency — do NOT bundle it!
>   jsx: "react-jsx",
>   // ^ JSX transform without explicit React import
> });
> ```
>
> React, ReactDOM, and other peerDependencies must be marked as `external`
> so they are not included in the bundle.
> The reason: every React app already has React installed. If your library
> **bundles** React, React ends up in the app TWICE — two different
> instances, and hooks break with "Invalid hook call" because they're
> accessing different React contexts. `external` prevents this.
>
> The same applies to Angular: `@angular/core`, `@angular/common`, etc.
> are peerDependencies and must be marked as external.

---

## Alternative: ESM-Only

If your target audience allows it (modern browsers, Node.js 18+):

```typescript annotated
// package.json — ESM-only (the simplest option)
{
  "name": "modern-lib",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
  // ^ No "require", no .cjs, no dual package hazard
  // ^ Simpler, safer, less configuration
}

// tsup.config.ts — ESM only
// export default defineConfig({
//   entry: ["src/index.ts"],
//   format: ["esm"],  // ← ESM only!
//   dts: true,
// });
```

> 🧪 **Experiment:** Create a minimal dual package:
>
> ```bash
> mkdir my-lib && cd my-lib && npm init -y
> npm install -D tsup typescript
>
> # src/index.ts:
> # export function greet(name: string): string { return `Hi ${name}`; }
>
> # tsup.config.ts:
> # import { defineConfig } from "tsup";
> # export default defineConfig({ entry: ["src/index.ts"], format: ["cjs", "esm"], dts: true });
>
> npx tsup
> ls dist/  # → index.js, index.cjs, index.d.ts, index.d.cts
> ```
>
> Check the files: index.js has `export`, index.cjs has `module.exports`.

---

## What you've learned

- **Dual packages** ship CJS (.cjs) and ESM (.js) in the same npm package
- The **dual package hazard** occurs when CJS and ESM load different instances — stateless libraries are safe
- **tsup** is the recommended tool — generates both formats + .d.ts automatically
- **ESM-only** is the simplest option when the target audience allows it
- **peerDependencies** (React, Angular) must be marked as `external`, otherwise you get duplicate instances
- **.cjs and .d.cts** are the file extensions for CommonJS — don't confuse them with .js/.d.ts
- The analogy: a dual package is like a travel adapter — all plugs included, every environment works

**Core concept to remember:** The JavaScript ecosystem is transitioning from CJS to ESM. As a library author you need to serve both worlds — but not forever. Dual package with tsup is the pragmatic path. ESM-only is the future. And: external frameworks like React and Angular belong as peerDependencies — NOT in the bundle.

---

> **Pause point** -- Good moment for a break. You now understand
> the challenges of CJS/ESM coexistence.
>
> Continue with: [Section 04: Generic Library Patterns](./04-generische-library-patterns.md)