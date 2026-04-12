# Section 6: Practice — Monorepo and Framework Configs

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Advanced Flags](./05-fortgeschrittene-flags.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How a production-ready Angular tsconfig is structured
- How React/Next.js projects structure their tsconfig
- How a monorepo is built with Project References and extends
- Which flags are optimal for which framework setup

---

## The Angular Configuration in Detail
<!-- section:summary -->
Angular projects typically have **three** tsconfig files.

<!-- depth:standard -->
Angular projects typically have **three** tsconfig files.
This is no coincidence — it reflects the three different contexts
in which TypeScript code runs:

```typescript annotated
// 1. tsconfig.json — The base (inherited by the others)
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    // ^ Base for all paths
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    // ^ Since Angular 12, strict is the default
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    // ^ Angular apps don't export types
    "downlevelIteration": true,
    "experimentalDecorators": true,
    // ^ Legacy decorators — Angular (still) needs them
    "moduleResolution": "node",
    // ^ Older projects. Newer ones: "bundler"
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"]
  }
}
```

> 📖 **Background: Why does Angular need `experimentalDecorators`?**
>
> Angular has used decorators (`@Component`, `@Injectable`, `@Input`)
> since its creation in 2016. At the time, there was no standard —
> only the experimental TypeScript decorator proposal (Stage 1).
> In 2023, decorators were standardized (Stage 3, TC39), but the
> new standard decorators have a DIFFERENT semantics than the
> experimental ones. Angular must therefore keep `experimentalDecorators: true`
> until the framework migrates to the new decorator API.
> This is planned for Angular 19+.
>
> You encountered decorators in L28 — there you saw the
> difference between legacy and Stage 3 decorators.

```typescript annotated
// 2. tsconfig.app.json — For application code
{
  "extends": "./tsconfig.json",
  // ^ Inherits all compilerOptions from the base
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
    // ^ NO global types (e.g., no @types/jasmine)
    // Prevents test types from being visible in production code
  },
  "files": ["src/main.ts"],
  // ^ Only the entry point — the rest is found through imports
  "include": ["src/**/*.d.ts"]
  // ^ Plus all declaration files in the src folder
}

// 3. tsconfig.spec.json — For tests
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
    // ^ Jasmine types (describe, it, expect) are only available here
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
  // ^ Only test files and declarations
}
```

> 💭 **Think about it:** Why does Angular split the tsconfig into app and spec?
> Why not a single file for everything?
>
> **Answer:** Isolation. Without separation, `describe()`, `it()`,
> `expect()` would be available in production code — you could
> accidentally use test code in the app. The `types` option
> controls which global types are visible. In the app: no
> test types. In tests: Jasmine types are allowed.

---

<!-- /depth -->
## The React/Next.js Configuration
<!-- section:summary -->
React projects are simpler — usually a single tsconfig:

<!-- depth:standard -->
React projects are simpler — usually a single tsconfig:

```typescript annotated
// React with Vite — tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    // ^ Standard — ignore node_modules conflicts

    /* Bundler mode */
    "moduleResolution": "bundler",
    // ^ Vite handles file resolution
    "allowImportingTsExtensions": true,
    // ^ .ts extensions allowed in imports (Vite understands them)
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    // ^ Vite/esbuild transpiles — TypeScript only checks

    /* JSX */
    "jsx": "react-jsx",
    // ^ React 17+ JSX transform — no "import React" needed

    /* Strict */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

> 🧠 **Explain it to yourself:** Why does the React tsconfig have
> `noEmit: true`, but the Angular tsconfig doesn't? What makes the
> difference in the build pipeline?
> **Key points:** React/Vite: esbuild transpiles, tsc only checks |
> Angular: The Angular CLI (esbuild since v17) controls compilation,
> but uses TypeScript differently | noEmit = no JS output from tsc |
> Angular CLI needs TypeScript output for the template compiler

### Next.js Configuration

```typescript annotated
// Next.js — tsconfig.json (generated by next init)
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    // ^ JavaScript files are also checked (for migration!)
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    // ^ SWC transpiles — TypeScript only checks
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    // ^ Do NOT transform JSX — Next.js/SWC handles that
    "incremental": true,
    // ^ Faster builds — .tsbuildinfo is cached
    "paths": {
      "@/*": ["./src/*"]
      // ^ Next.js reads paths directly from the tsconfig!
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

> ⚡ **Practical tip:** Next.js is one of the few frameworks that
> reads `paths` directly from the tsconfig — without any additional
> bundler configuration. In Vite, by contrast, you need the
> `vite-tsconfig-paths` plugin or manual `resolve.alias` entries.

---

<!-- /depth -->
## The Monorepo Setup
<!-- section:summary -->
A monorepo with Project References combines everything you learned in

<!-- depth:standard -->
A monorepo with Project References combines everything you learned in
this lesson:

```typescript annotated
// Root: tsconfig.json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ],
  "files": []
  // ^ Root compiles NOTHING itself
}

// packages/shared/tsconfig.json — The shared base library
{
  "extends": "../../tsconfig.base.json",
  // ^ Shared options from the root base
  "compilerOptions": {
    "composite": true,
    // ^ REQUIRED for referenced projects
    "declaration": true,
    "declarationMap": true,
    // ^ Go-to-Definition jumps to the source, not the .d.ts
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// packages/api/tsconfig.json — Backend (Node.js)
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    // ^ Real Node.js ESM — .js extensions in imports
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }
    // ^ API depends on shared
  ],
  "include": ["src"]
}

// packages/web/tsconfig.json — Frontend (React/Vite)
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    // ^ Vite handles module resolution
    "jsx": "react-jsx",
    "noEmit": true
    // ^ Vite transpiles — no tsc output
  },
  "references": [
    { "path": "../shared" }
    // ^ Web also depends on shared
  ],
  "include": ["src"]
}
```

> 🔬 **Experiment:** Analyze the monorepo structure above and
> answer these questions for yourself:
>
> 1. Why does `api` have `moduleResolution: "nodenext"`, but `web`
>    has `"bundler"`? (Answer: api runs directly in Node.js,
>    web is bundled by Vite)
>
> 2. Why does `web` have `noEmit: true`, but `api` and `shared` don't?
>    (Answer: web uses Vite for transpilation, api and shared
>    use tsc for output)
>
> 3. What happens when you add a new type in `shared`
>    and run `tsc --build`?
>    (Answer: Only shared is recompiled. api and web receive
>    the new .d.ts files and are only recompiled
>    if they use the new type)

---

<!-- /depth -->
## The "golden tsconfig" for new projects
<!-- section:summary -->
Based on everything you've learned, here is the recommended

<!-- depth:standard -->
Based on everything you've learned, here is the recommended
base configuration for a new TypeScript project in 2025:

```typescript annotated
// tsconfig.base.json — The golden base
{
  "compilerOptions": {
    // Safety
    "strict": true,
    // ^ All 11 strict flags enabled
    "noUncheckedIndexedAccess": true,
    // ^ Array/object access by index returns T | undefined
    "noImplicitOverride": true,
    // ^ override keyword required with inheritance
    "forceConsistentCasingInFileNames": true,
    // ^ Prevents issues on case-insensitive file systems (macOS/Windows)

    // Modern standards
    "target": "ES2022",
    "lib": ["ES2023"],
    // ^ Latest APIs (Array.findLast, etc.)
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Interop
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,

    // Modern toolchain
    "verbatimModuleSyntax": true,
    // ^ Replaces isolatedModules + explicit import type control
    "noEmit": true
    // ^ If a bundler handles transpilation
  }
}
```

> 📖 **Background: `noUncheckedIndexedAccess` — The underrated flag**
>
> This flag is NOT part of `strict`, but deserves to be:
>
> ```typescript
> const arr = [1, 2, 3];
> const x = arr[5];
> // WITHOUT noUncheckedIndexedAccess: x is number (WRONG!)
> // WITH noUncheckedIndexedAccess: x is number | undefined (CORRECT!)
> ```
>
> It was introduced in TypeScript 4.1 (2020), but was never added to `strict`
> — probably because it would break too much existing code.
> Even so: it prevents an entire class of runtime errors
> (array out of bounds).

---

<!-- /depth -->
## Summary: Framework Recommendations

| Flag | Angular | React/Vite | Next.js | Node.js | Library |
|------|---------|------------|---------|---------|---------|
| `strict` | true | true | true | true | true |
| `target` | ES2022 | ES2020 | ES2017 | ES2022 | ES2020 |
| `module` | ES2022 | ESNext | ESNext | NodeNext | ESNext+CJS |
| `moduleResolution` | bundler | bundler | bundler | nodenext | bundler |
| `noEmit` | no | yes | yes | no | no |
| `declaration` | no | no | no | no | yes |
| `jsx` | — | react-jsx | preserve | — | react-jsx |
| `skipLibCheck` | yes | yes | yes | yes | no |
| `isolatedModules` | yes | yes | yes | yes | yes |
| `experimentalDecorators` | yes | no | no | no | no |

---

## What you learned

- Angular splits the tsconfig into base, app, and spec (test isolation)
- React/Vite uses `noEmit` + `bundler` (TypeScript only checks, Vite builds)
- Next.js reads `paths` directly from the tsconfig (special case)
- Monorepos use `composite`, `references`, and `extends` together
- `noUncheckedIndexedAccess` belongs in every professional tsconfig

> 🧠 **Explain it to yourself:** What is the fundamental architectural
> difference between "TypeScript as a compiler" (Angular) and
> "TypeScript as a type checker" (React/Vite/Next.js)?
> **Key points:** As a compiler: tsc generates JS output | As a type checker:
> tsc only checks (noEmit) | Bundler/esbuild/SWC handle transpilation |
> The trend is toward "TypeScript as a type checker" |
> Advantage: faster builds (esbuild >> tsc for transpilation)

**Core concept to remember:** There is no universally "correct" tsconfig.
But there is one that's right for YOUR project — and it depends on
three questions: (1) What is the target environment? (2) Which bundler?
(3) Library or application?

---

> **Lesson complete!** You now know every important
> compiler flag and understand why it exists. The tsconfig is
> no longer a mystery — it's a tool you configure deliberately.
>
> Continue with: [Lesson 30: Review Challenge Phase 3](../30-review-challenge-phase-3/sections/01-phase-3-ueberblick.md)