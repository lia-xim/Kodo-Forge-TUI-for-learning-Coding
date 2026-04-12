# Section 2: Modern Modules — verbatimModuleSyntax, bundler Resolution, Import Attributes

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The TypeScript 5.x Era](./01-die-typescript-5x-aera.md)
> Next section: [03 - Inferred Type Predicates](./03-inferred-type-predicates.md)

---

## What you'll learn here

- Why `verbatimModuleSyntax` is the **biggest module system update** in TypeScript history
- How `moduleResolution: "bundler"` solves the years-long problem with `node`/`node16`
- What **Import Attributes** (`with { type: 'json' }`) are and why they're becoming important
- How Angular 17+ directly benefits from these features and what you should adjust in your projects

---

## The problem that existed for years

Imagine: you have a TypeScript project with a bundler like Vite or webpack.
You import a function:

```typescript
import { createUser } from './user-factory';
```

No problem, right? Wrong. There was a subtle but serious issue.

TypeScript allowed you to import a **type** exactly like a **value**:

```typescript
import { UserInterface } from './types';  // TypeScript interface — not a JavaScript value!
import { createUser } from './user-factory';  // Real runtime function
```

Both look identical. But `UserInterface` doesn't exist at runtime — it's a
TypeScript type that disappears after compilation (type erasure). So what happens?

**What TypeScript used to do:** It silently compiled the type import away. This worked
most of the time. But bundlers like ESBuild, SWC, and Vite work **file by file** — they
don't analyze the entire project. They see `import { UserInterface } from './types'`
and ask: "Should I load this file?" They don't know whether it's a type or a
value!

This led to:
- **Circular dependencies** being triggered unexpectedly
- **Empty modules** still being executed (side effects!)
- **Build errors** with certain bundler configurations
- **Poor tree-shaking performance** because bundlers couldn't calculate dependencies correctly

> 📖 **Background: Why is this a bundler problem?**
>
> Classic TypeScript compilation (`tsc`) analyzes the **entire** program and
> therefore knows which imports are types. It can silently remove them.
>
> Modern bundlers (Vite, ESBuild, SWC) compile each file **in isolation** — they
> transpile TypeScript to JavaScript without understanding the entire type system.
> This is much faster (Vite: "instant HMR"). But that's precisely why they need
> explicit hints: "This import is just a type, ignore it during bundling."
>
> That's the core of the problem. And `verbatimModuleSyntax` solves it.

---

## verbatimModuleSyntax: The solution (TypeScript 5.0)

`verbatimModuleSyntax: true` in your `tsconfig.json` activates a simple but
powerful rule:

> **If you import a type, you must write `import type`.
> TypeScript ENFORCES this — as a compile error.**

```typescript annotated
// With verbatimModuleSyntax: true in tsconfig.json

// --- CORRECT ---
import type { User } from './types';
// ^ "import type" says: This import disappears completely at runtime.
// No bundler problem. No side effect. Clear intent.

import { createUser } from './user-factory';
// ^ Normal value import: Stays at runtime.
// createUser() is a real function.

// --- ERROR (Compile error!) ---
// import { User } from './types';
// ^ TypeScript knows: User is an interface (not a runtime value).
// With verbatimModuleSyntax: true this is an ERROR.
// Error message: "User" only refers to a type, but is being used as a value here.

// --- GOOD: Mixed import ---
import { createUser, type User } from './user-factory';
// ^ Inline "type" modifier: createUser is a value import,
//   User is a type import in the same statement.
// TypeScript only removes the "type User" part at runtime.
```

**Why is this revolutionary?** Because your code now **self-documents** which
imports have runtime significance and which don't. Every bundler, every build tool,
every person reading your code immediately knows:

- `import type { ... }` → "This import disappears. No side effect."
- `import { ... }` → "This import is real. It loads a module at runtime."

> 🧠 **Explain to yourself:** What would happen if you have a module with side effects
> (e.g. `import './setup-globals'`) and accidentally mark it as a type import?
>
> **Key points:** `import type` deletes the import completely | Side effects would
> not be executed | That would be a runtime bug | That's why side-effect imports
> can't be marked as `import type` — TypeScript would throw an error

---

## moduleResolution: "bundler" — The right model for modern tools

Alongside `verbatimModuleSyntax`, TypeScript 5.0 introduced a second important feature:
the `moduleResolution: "bundler"` strategy.

### The old problem

TypeScript historically had two main strategies:
- `"node"` — Node.js CommonJS style (`require()`, `.js` optional)
- `"node16"` / `"nodenext"` — Node.js ESM style (`.js` extension REQUIRED)

But: bundlers like Vite, webpack, ESBuild work **differently**. They:
1. Allow imports without file extensions (`./utils` instead of `./utils.js`)
2. Support path aliases (`@/components/Button`)
3. Allow `exports` in `package.json` for sub-path exports
4. Have their own mechanisms for `index.ts` resolution

With `"node16"` you got compile errors when importing the way the bundler expected.
With `"node"` newer features were missing. Both were unsatisfying.

```typescript annotated
// With moduleResolution: "bundler" (TypeScript 5.0+)

// ALL of this now works without errors:
import { Button } from '@/components/Button';
// ^ Path alias: TypeScript knows @ as src/

import { utils } from './utils';
// ^ No file extension: Bundler resolves to .ts/.tsx -- correct!

import { deepEqual } from 'lodash-es/isEqual';
// ^ Sub-path import in node_modules -- bundler compatible

// exports field in package.json is correctly respected:
// "exports": { "./Button": "./dist/Button.js" }
import { Button } from 'ui-library/Button';
// ^ TypeScript looks into "exports", exactly like the bundler
```

> ⚡ **Practical tip for your Angular project:** Angular 17+ uses `moduleResolution: "bundler"`
> by default in new projects. If you have an older Angular project,
> you might still find `"node"` or `"node16"` in the `tsconfig.json`.
>
> Upgrade check:
> ```bash
> cat tsconfig.json | grep moduleResolution
> ```
> If you see `"node"` and use Vite/webpack as your bundler, `"bundler"` is the
> more correct choice. Angular CLI migrations (`ng update`) handle this automatically.

---

## Experiment box: Experience verbatimModuleSyntax live

No editor needed — read the code and think along:

```typescript
// File: types.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export type AdminLevel = 'read' | 'write' | 'admin';
```

```typescript
// File: service.ts (with verbatimModuleSyntax: true)

// WRONG — will produce a compile error:
// import { UserProfile, AdminLevel } from './types';
// Error: 'UserProfile' only refers to a type

// CORRECT — explicit type imports:
import type { UserProfile, AdminLevel } from './types';

// Now you can use the types:
function createProfile(name: string, email: string): UserProfile {
  return { id: crypto.randomUUID(), name, email };
}

function isAdmin(user: UserProfile, level: AdminLevel): boolean {
  // Runtime logic here
  return true;
}
```

```typescript
// What the bundler (e.g. ESBuild) makes of this:
// The "import type" line disappears COMPLETELY:

// import type { UserProfile, AdminLevel } from './types';
// ^^^ This line does NOT exist after compilation.

// function createProfile(name, email) { ... }   ← stays
// function isAdmin(user, level) { ... }          ← stays
```

This is exactly the behavior modern bundlers need. They no longer have to
guess — they only see real runtime imports.

---

## Import Attributes: JSON and more (TypeScript 5.3)

TypeScript 5.3 introduced **Import Attributes** — a TC39 proposal that has since been
implemented in several JavaScript engines:

```typescript annotated
// Import Attributes syntax (TypeScript 5.3+)
import data from './config.json' with { type: 'json' };
// ^ "with" keyword is the attribute block
// ^ type: 'json' tells the JavaScript runtime/bundler:
//   "Interpret this file as JSON, not as JavaScript"

// Why does this matter?
// Without the attribute, a malicious attacker could replace your JSON file
// with a JavaScript file that gets executed on import.
// This is called a "module confusion attack".
// Import Attributes make imports more precise and secure.

// Other attribute types (future-oriented):
// import sheet from './styles.css' with { type: 'css' };
// import worker from './worker.js' with { type: 'javascript-module' };
```

```typescript annotated
// TypeScript understands Import Attributes and checks them:
import config from './app-config.json' with { type: 'json' };
// TypeScript infers the type of config as { ... } based on the JSON file!
// This was previously only possible with "resolveJsonModule: true",
// but was unsafe because no attribute signaled the "json" intent.

// Practical example in an Angular service:
import translations from './i18n/en.json' with { type: 'json' };
//                                               ^ Bundler knows: load as JSON

type TranslationKeys = keyof typeof translations;
// TranslationKeys is now the precise union of all JSON keys!
// "greeting" | "farewell" | ... -- full autocomplete
```

> 💭 **Think about it:** What's the difference between these two imports?
> ```typescript
> import data from './data.json';                      // Old
> import data from './data.json' with { type: 'json' }; // New
> ```
>
> **Answer:** Semantically the difference is minimal in stable environments.
> But Import Attributes are a **security mechanism for the future**.
> Browsers and Deno can use the attribute to ensure the file is really
> treated as JSON (and not as executable JavaScript). For bundlers
> it's already a hint for optimized loading today. Long-term,
> attributes will become the standard for all non-JS imports.

---

## The interplay: The perfect combination

These three features are not independent — they solve interconnected problems:

```
verbatimModuleSyntax: true
├── Enforces "import type" for type imports
├── Makes build tools safer (no more guessing)
└── Self-documenting code

moduleResolution: "bundler"
├── Correct resolution for Vite/webpack/ESBuild
├── Path aliases work without hacks
└── package.json exports are respected

Import Attributes (with { type: ... })
├── Precise semantics for non-JS imports
├── Security against module confusion
└── Future-proof standard
```

**Recommended tsconfig.json for an Angular 17+ or Vite-React project:**

```typescript annotated
// tsconfig.json (TypeScript 5.x, Vite/webpack project)
{
  "compilerOptions": {
    "target": "ES2022",
    // ^ Output format: Modern JavaScript

    "module": "ESNext",
    // ^ Module system of the output: ESM

    "moduleResolution": "bundler",
    // ^ TypeScript 5.0+: Correct resolution for bundler environments
    // NOT "node" or "node16" for bundler projects!

    "verbatimModuleSyntax": true,
    // ^ TypeScript 5.0+: Enforces explicit import type for types
    // Makes your project bundler-friendly

    "strict": true,
    // ^ All strict checks enabled -- ALWAYS!

    "skipLibCheck": true,
    // ^ Don't check .d.ts files in node_modules
    // Necessary because some libraries have incompatible d.ts files

    "allowImportingTsExtensions": true,
    // ^ Optional: Allows "import x from './foo.ts'" (Vite style)
    // Only possible when no JS is emitted (bundler handles that)

    "isolatedModules": true
    // ^ TypeScript checks whether each file can be compiled in isolation
    // Required for fast single-file transpilers like ESBuild
  }
}
```

> 🧠 **Explain to yourself:** Why does it make sense to enable `verbatimModuleSyntax` and
> `isolatedModules` together? What do they have in common?
>
> **Key points:** Both serve single-file transpilers | `isolatedModules` checks
> whether files can be compiled individually | `verbatimModuleSyntax` makes type imports
> explicit | Together: no bundler needs to understand the entire TypeScript type system anymore |
> Angular compiles templates with its own compiler (ngcc/esbuild) --
> both flags help enormously there

---

## What you've learned

- `verbatimModuleSyntax: true` enforces `import type` for type imports and makes
  build tools safer through explicit import semantics
- `moduleResolution: "bundler"` solves the years-long problem with incorrect module
  resolution strategies for Vite, webpack, and ESBuild
- Import Attributes (`with { type: 'json' }`) are the TC39 standard for safe,
  precise non-JS imports — Angular and React already use this
- All three features work together and form the foundation of modern TypeScript projects

**Core concept to remember:** `verbatimModuleSyntax` is not optional when working with
modern bundlers — it's the correct way to write type imports.
An `import type` is a statement: "This only exists for the compiler."
That's good, honest code.

> **Pause point** — The module system is modernized. Now comes the most exciting
> new feature from the entire TypeScript 5.x cycle.
>
> Continue with: [Section 03: Inferred Type Predicates](./03-inferred-type-predicates.md)