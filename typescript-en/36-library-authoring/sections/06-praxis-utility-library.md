# Section 6: Practice — Building Your Own Utility Library and npm publish

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Versioning and Breaking Changes for Types](./05-versionierung-und-breaking-changes.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How to build a **complete utility library** from scratch
- The full workflow: **Init → Code → Build → Test → Publish**
- How to test your library locally with **npm pack** before publishing
- Best practices for **README**, **package.json**, and **CI**

---

## Background: Why build your own library?

> **Origin Story: How date-fns was born**
>
> date-fns started as an internal utility module at a Ukrainian
> startup. The developer Sasha Koss kept copying the same
> date functions into different projects. Instead of continuing
> to copy them, he extracted them into an npm package. Today date-fns
> has over 30 million weekly downloads.
>
> The lesson: every library starts as code you need in two or more
> projects. "Don't repeat yourself" applies not just within
> a single project — it applies across projects.

In the previous sections you learned all the building blocks. Now
we put them together into a real library.

---

## Step 1: Initialize the project

```typescript annotated
// Terminal:
// mkdir my-ts-utils && cd my-ts-utils

// npm init — with sensible defaults:
// npm init -y

// Manually adjust package.json:
{
  "name": "@your-scope/ts-utils",
  // ^ Scoped package: @scope/name — prevents name conflicts
  "version": "0.1.0",
  // ^ 0.x.y = "Pre-release" — you're not promising stability yet
  "description": "Type-safe utility functions",
  "type": "module",

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "files": ["dist", "src"],
  // ^ Only these folders are included in the npm package
  // ^ src for declaration maps ("Go to Definition")

  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "prepublishOnly": "npm run build && npm run test"
    // ^ Runs automatically before every npm publish: build + tests
  },

  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0"
  },

  "peerDependencies": {
    "typescript": ">=5.0"
    // ^ Your library requires TypeScript 5.0+
  },

  "license": "MIT"
}
```

> 🧠 **Explain it to yourself:** Why version 0.1.0 and not 1.0.0? What does a 0.x version signal?
> **Key points:** 0.x = "development phase" | API can change at any time | Consumers know: no stability guarantee | 1.0.0 is a promise: "The API is stable" | Only bump to 1.0.0 after real-world use

---

## Step 2: Write the library code

```typescript annotated
// src/index.ts — Public API (re-exports)
export { pipe } from "./pipe.js";
export { groupBy } from "./collections.js";
export { debounce, throttle } from "./timing.js";
export type { PipeFn, GroupByResult } from "./types.js";
// ^ Only explicitly exported things are part of the public API
// ^ Internal modules (not exported) remain private

// src/pipe.ts — Example: type-safe pipe function
type PipeFn<In, Out> = (input: In) => Out;

export function pipe<A, B>(
  value: A,
  fn1: PipeFn<A, B>
): B;
export function pipe<A, B, C>(
  value: A,
  fn1: PipeFn<A, B>,
  fn2: PipeFn<B, C>
): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: PipeFn<A, B>,
  fn2: PipeFn<B, C>,
  fn3: PipeFn<C, D>
): D;
export function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}
// ^ Overloads for 1–3 functions — type-safe
// ^ Implementation with reduce — simple but effective

// src/collections.ts — Example: type-safe groupBy
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}
// ^ Generic return type: Record<K, T[]>
// ^ K is inferred from keyFn — no manual annotation needed
```

> ⚡ **Framework connection (Angular + React):** Utility libraries like this
> are framework-agnostic — they work in Angular, React, Node.js,
> everywhere. If you use Angular professionally and React privately, a
> shared utility library is the perfect use case. Type-safe
> `pipe`, `groupBy`, `debounce` are useful in EVERY framework.

---

## Step 3: Configure the build

```typescript annotated
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  // ^ A single entry point

  format: ["cjs", "esm"],
  // ^ Dual package: CJS + ESM

  dts: true,
  // ^ Automatically generate .d.ts + .d.cts

  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  // ^ Libraries should NOT be minified
  // ^ Minification is the consumer bundler's responsibility
  // ^ Unminified code is debuggable

  outDir: "dist"
});

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    // ^ Libraries MUST use strict mode
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

---

## Step 4: Test locally with npm pack

Before publishing — test the library locally:

```typescript annotated
// Terminal inside the library:
// npm pack
// ^ Produces: your-scope-ts-utils-0.1.0.tgz
// ^ This is EXACTLY what npm publish would upload

// Terminal inside a test project:
// npm install ../my-ts-utils/your-scope-ts-utils-0.1.0.tgz
// ^ Installs the library from the .tgz file

// test-project/src/test.ts:
import { pipe, groupBy } from "@your-scope/ts-utils";

const result = pipe(
  [1, 2, 3, 4, 5],
  (nums) => nums.filter(n => n > 2),
  (nums) => nums.map(n => n * 10)
);
// ^ Does it compile? Are the types correct? Does autocomplete work?

const grouped = groupBy(
  [{ name: "Max", team: "A" }, { name: "Anna", team: "B" }],
  (user) => user.team
);
// ^ Type: Record<string, { name: string; team: string }[]>
// ^ Does autocomplete work for grouped["A"]?
```

> 💭 **Think about it:** Why use `npm pack` + local installation instead of
> just importing the files directly?
>
> **Answer:** `npm pack` simulates EXACTLY what would end up on npm. It
> checks: are all files in "files" included? Is package.json correct?
> Do the exports work? Direct imports from source code do NOT test
> the published package structure — they bypass all packaging issues.

---

## Step 5: Publish

```typescript annotated
// Before publishing: checklist
// ✅ npm run build — compiles without errors?
// ✅ npm run test — all tests green?
// ✅ npm pack — .tgz created, all files included?
// ✅ Local test — imports work, types correct?
// ✅ README.md — installation, usage, API documented?
// ✅ CHANGELOG.md — changes documented?
// ✅ .npmignore or "files" — only necessary files in the package?

// Publish:
// npm login                    ← One-time (npmjs.com account)
// npm publish --access public  ← For scoped packages (@scope/name)

// Bump version:
// npm version patch   ← 0.1.0 → 0.1.1 (bugfix)
// npm version minor   ← 0.1.0 → 0.2.0 (feature)
// npm version major   ← 0.1.0 → 1.0.0 (breaking change)
// npm publish
```

> 🧪 **Experiment:** Run the entire workflow — without actually publishing:
>
> ```bash
> mkdir my-test-lib && cd my-test-lib
> npm init -y
> npm install -D tsup typescript
>
> # Create src/index.ts:
> # export function hello(name: string): string { return `Hello ${name}`; }
>
> # Create tsup.config.ts (as above)
>
> npx tsup
> npm pack --dry-run   # Shows what would be in the package, without packing
> npm pack             # Creates the .tgz file
>
> # In another folder:
> # npm install ../my-test-lib/my-test-lib-1.0.0.tgz
> # import { hello } from "my-test-lib"
> ```
>
> The entire workflow — without npm publish.

---

## CI/CD for libraries

```typescript annotated
// .github/workflows/publish.yml
// name: Publish
// on:
//   push:
//     tags: ["v*"]  ← Trigger on version tags (v1.0.0, v1.1.0)
//
// jobs:
//   publish:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with:
//           node-version: 20
//           registry-url: "https://registry.npmjs.org"
//       - run: npm ci
//       - run: npm run build
//       - run: npm test
//       - run: npm publish --access public
//         env:
//           NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
//
// Workflow:
// 1. npm version minor    ← Bumps package.json, creates git tag
// 2. git push --tags      ← Pushes the tag
// 3. CI builds, tests, and publishes automatically
```

---

## What you've learned

- The complete workflow: **Init → Code → Build → Test → Pack → Publish**
- `npm pack` simulates **npm publish** locally — always test first
- **tsup** generates CJS + ESM + .d.ts in one step
- Libraries should **NOT be minified** — that's the consumer bundler's job
- **CI/CD** with GitHub Actions automates publishing on version tags

**Core concept to remember:** Publishing a library is no mystery — it's a reproducible workflow. tsup for the build, npm pack for local testing, npm publish for the world. The hard part isn't the tooling, it's the design: good types, stable API, clear documentation.

---

> **End of lesson.** You now have all the tools to build and publish
> professional TypeScript libraries.
>
> Continue with: **L37** (next lesson in the curriculum)