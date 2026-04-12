# Section 3: Global Augmentation

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Module Augmentation](./02-module-augmentation.md)
> Next section: [04 - Declaration Files (.d.ts)](./04-declaration-files.md)

---

## What you'll learn here

- How to extend the **global scope** with `declare global`
- The difference between **Module Augmentation** and **Global Augmentation**
- When to extend `globalThis`, `Window`, `NodeJS.ProcessEnv`
- The dangers and **best practices** of global augmentations

---

## Background: The global scope in TypeScript

> **Feature Origin Story: Global Types**
>
> In JavaScript there is the global scope — `window` in the browser,
> `globalThis` everywhere. Historically the global scope was the
> primary communication channel between scripts (before ES Modules).
>
> TypeScript models this in its "lib" files: `lib.dom.d.ts`
> defines `Window`, `Document`, `HTMLElement` etc. `lib.es2023.d.ts`
> defines `Array.prototype.findLast` etc.
>
> But what if you need your own global variables? What if a
> library adds global types? In legacy code, global variables are
> ubiquitous. Module Augmentation doesn't help here —
> because `window` is not a module. The solution: `declare global`.

---

## The syntax: `declare global`

```typescript annotated
// IMPORTANT: declare global only works in module files!
// (Files with at least one import or export)

export {}; // Makes this file a module

declare global {
  // Everything here is added to the global scope:

  interface Window {
    __INITIAL_STATE__: Record<string, unknown>;
    dataLayer: Array<Record<string, unknown>>;
    // ^ Google Tag Manager's dataLayer — now type-safe!
  }

  // Global variable (without Window):
  var DEBUG_MODE: boolean;
  // ^ 'var' (not let/const!) for global variables
  //   'var' is the correct syntax for global declarations

  // Global function:
  function __DEV_LOG__(msg: string): void;
}

// Now available everywhere:
// window.__INITIAL_STATE__  → type-safe
// DEBUG_MODE                → type-safe
// __DEV_LOG__("test")       → type-safe
```

> 🧠 **Explain to yourself:** Why must you use `var` instead of `let` or `const`
> for global variables in `declare global`?
>
> **Key points:** `var` in global scope → becomes `window.varName` |
> `let` and `const` are block-scoped — they do NOT become global |
> In `declare global` you declare what exists on the global object |
> `var` is the only correct syntax for this

---

## Module Augmentation vs. Global Augmentation

```typescript annotated
// MODULE AUGMENTATION — extends a specific npm package:
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
    // ^ Only available in the context of Express requests
  }
}

// GLOBAL AUGMENTATION — extends the global scope:
declare global {
  interface Window {
    analytics: AnalyticsAPI;
    // ^ Available everywhere in browser code
  }
}

// When to use which?
// Module Augmentation: type belongs to a PACKAGE (express, react, vue)
// Global Augmentation: type belongs to the GLOBAL scope (window, process, globalThis)
```

> 💭 **Think about it:** Why should you use global augmentations sparingly?
> What is the risk?
>
> **Answer:** Global types "pollute" the entire namespace.
> Every file in the project sees them. If two libraries declare the same
> global variable, there are conflicts. Module Augmentation is always
> preferable — Global Augmentation only when it really
> involves global values (window, process.env, etc.).

---

## Practice: Making NodeJS.ProcessEnv type-safe
<!-- section:summary -->
A very common use case in Node.js/Angular/Next.js projects:

<!-- depth:standard -->
A very common use case in Node.js/Angular/Next.js projects:

```typescript annotated
// types/env.d.ts
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Required fields:
      NODE_ENV: "development" | "staging" | "production";
      DATABASE_URL: string;
      JWT_SECRET: string;

      // Optional fields:
      PORT?: string;
      LOG_LEVEL?: "debug" | "info" | "warn" | "error";
      REDIS_URL?: string;
    }
  }
}

// Now in your code:
const dbUrl = process.env.DATABASE_URL;
// ^ Type: string (not string | undefined!)
// TypeScript knows: DATABASE_URL is declared as a required field.

const port = process.env.PORT ?? "3000";
// ^ Type: string — optional, but with fallback

// process.env.TYPO_VAR
// ^ Compile error! TYPO_VAR does not exist in ProcessEnv.
// This prevents typos in environment variable names!
```

<!-- depth:vollstaendig -->
> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Step 1: Without augmentation — process.env is largely unknown
> const dbUrl1 = process.env.DATABASE_URL;
> // Type: string | undefined — no different from any other variable
>
> // Step 2: Add Global Augmentation
> export {}; // Makes this file a module
>
> declare global {
>   namespace NodeJS {
>     interface ProcessEnv {
>       NODE_ENV: "development" | "production";
>       DATABASE_URL: string;    // Required field — no undefined!
>       API_KEY?: string;        // Optional
>     }
>   }
> }
>
> // Step 3: Now process.env is type-safe
> const dbUrl2 = process.env.DATABASE_URL;
> // Type: string (not string | undefined — required field!)
>
> const apiKey = process.env.API_KEY ?? "default";
> // Type: string — optional, but secured with fallback
>
> // Compile error:
> // const typo = process.env.DATBASE_URL; // ← Typo → caught immediately!
> ```
>
> Note: In a real project this block would live in its own file
> (e.g. `types/env.d.ts`) — the augmentation then takes effect project-wide.
> In the Playground you can write everything in one file, because `export {}`
> makes the file a module and `declare global` then takes effect.

---

<!-- /depth -->
## Extending Array.prototype
<!-- section:summary -->
Another common use case: extending built-in types with methods:

<!-- depth:standard -->
Another common use case: extending built-in types with methods:

```typescript annotated
// Caution: prototype extension is controversial!
// Shown here only as a demonstration of Global Augmentation.

export {};

declare global {
  interface Array<T> {
    // New method on all arrays:
    unique(): T[];
    // ^ Removes duplicates (like [...new Set(arr)])
  }
}

// Implementation (must ACTUALLY exist!):
Array.prototype.unique = function <T>(this: T[]): T[] {
  return [...new Set(this)];
};

// Usage:
const numbers = [1, 2, 2, 3, 3, 3];
const uniqueNumbers = numbers.unique(); // [1, 2, 3]
// ^ TypeScript knows unique() and returns T[]
```

> ⚡ **In your Angular project** Global Augmentation is useful for:
>
> ```typescript
> // 1. Making environment variables type-safe:
> declare global {
>   namespace NodeJS {
>     interface ProcessEnv {
>       NG_APP_API_URL: string;
>       NG_APP_ANALYTICS_KEY?: string;
>     }
>   }
> }
>
> // 2. Window properties for SSR hydration:
> declare global {
>   interface Window {
>     __SERVER_STATE__: AppState;
>     // ^ Angular Universal / SSR passes state via window
>   }
> }
> ```
>
> In React/Next.js:
>
> ```typescript
> // next-env.d.ts — Next.js Environment:
> declare global {
>   namespace NodeJS {
>     interface ProcessEnv {
>       NEXT_PUBLIC_API_URL: string;
>       NEXT_PUBLIC_GA_ID?: string;
>     }
>   }
> }
> ```

---

<!-- /depth -->
## Best practices for global augmentations
<!-- section:summary -->
| In its own `.d.ts` file | Separation of code and type extension |

<!-- depth:standard -->
| Rule | Reason |
|---|---|
| In its own `.d.ts` file | Separation of code and type extension |
| Don't forget `export {}` | Makes the file a module |
| Minimal properties | Less global pollution |
| Document WHY | Not obvious where the type comes from |
| Include in `tsconfig.json` | `include: ["types/**/*.d.ts"]` |
| No prototype extension | Fragile, can collide with libraries |

---

<!-- /depth -->
## What you've learned

- `declare global { }` extends the global scope (window, globalThis, process)
- Only available in **module files** (at least one import/export)
- Global variables must be declared with `var` (not let/const)
- **Making ProcessEnv type-safe** is one of the most useful use cases
- Use global augmentations sparingly — Module Augmentation is always preferable

> 🧠 **Explain to yourself:** Why must a file with `declare global`
> be a module? What would happen if it were a script?
>
> **Key points:** In a script, declarations are already global |
> `declare global` in a script would be redundant |
> TypeScript distinguishes scripts (everything global) and modules (isolated) |
> `declare global` = "Breaking out of my isolated module into the global scope"

**Core concept to remember:** `declare global` is an "escape hatch" out of
the module system into the global scope. Use it sparingly and deliberately —
prefer Module Augmentation wherever possible.

---

> **Pause point** — You can now extend the global scope.
> Next topic: Declaration Files (.d.ts) — writing your own type files.
>
> Continue with: [Section 04: Declaration Files (.d.ts)](./04-declaration-files.md)