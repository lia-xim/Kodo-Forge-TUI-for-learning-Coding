# Section 4: Declaration Files for Legacy Code

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Enabling Strict Mode Incrementally](./03-strict-mode-stufenweise.md)
> Next section: [05 - Common Migration Problems and Solutions](./05-typische-migrationsprobleme.md)

---

## What you'll learn here

- When and why you need to write **.d.ts files** for existing code
- How to **create declaration files for untyped libraries**
- The difference between **ambient** and **module** declarations
- How to **type global variables** and **Window extensions**

---

## Background: Why .d.ts for Legacy Code?

> **Origin Story: DefinitelyTyped — The World's Largest Type Library**
>
> When TypeScript became popular, most npm packages had no type
> definitions. The community founded DefinitelyTyped — a GitHub
> repository with .d.ts files for thousands of libraries. Today
> DefinitelyTyped has over 8,000 packages and is the largest type
> repository in the world (installable as @types/packagename).
>
> But what about YOUR legacy code? Internal libraries, old jQuery
> plugins, proprietary APIs? There are no @types packages for those —
> you have to write the .d.ts files yourself. And that's exactly what
> you'll learn here.

In a migration you'll encounter three categories of untyped code:

1. **npm packages without types** → install @types or write a .d.ts
2. **Internal JavaScript libraries** → place a .d.ts next to the .js file
3. **Global variables** (window.config, legacy SDKs) → ambient declarations

---

## .d.ts for Internal JavaScript Modules

If you have a JavaScript file you don't (yet) want to migrate,
you can place a .d.ts file next to it:

```typescript annotated
// src/legacy/analytics.js — existing JavaScript
// (Hundreds of lines of legacy code, migration too costly)

// src/legacy/analytics.d.ts — type declaration
// ^ SAME name, different extension → TypeScript finds it automatically

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void;
// ^ Declares the function WITHOUT an implementation
// ^ TypeScript uses this type for all imports

export function trackPageView(url: string): void;

export interface AnalyticsConfig {
  trackingId: string;
  debug?: boolean;
  samplingRate?: number;
}

export function init(config: AnalyticsConfig): void;
// ^ Every import of './legacy/analytics' now has full types
// ^ Autocomplete works, errors are caught
```

> 🧠 **Explain to yourself:** Why is a .d.ts file enough — doesn't TypeScript check whether the JavaScript file actually matches the declarations?
> **Key points:** .d.ts is a "promise" to the compiler | TypeScript trusts the .d.ts blindly | No check whether .js and .d.ts match | It's YOUR responsibility | It's like an API contract — the server must honor it

---

## Ambient Declarations for Global Variables

Legacy code often uses global variables that aren't imported:

```typescript annotated
// Problem: Legacy code sets global variables
// <script src="config.js"></script>
// config.js: window.APP_CONFIG = { apiUrl: '...', version: '2.1' };

// In TypeScript: "Property 'APP_CONFIG' does not exist on type 'Window'"
// Solution: Ambient Declaration

// src/types/globals.d.ts
declare global {
  interface Window {
    APP_CONFIG: {
      apiUrl: string;
      version: string;
      debug?: boolean;
    };
    // ^ Extends the Window interface with APP_CONFIG
    // ^ Declaration Merging: the existing Window interface is augmented

    analytics: {
      track(event: string, data?: Record<string, unknown>): void;
    };
    // ^ Another global variable (e.g. Google Analytics)
  }

  // Global variables without 'window.':
  var __DEV__: boolean;
  // ^ declare var for variables available directly (without window.)
  // ^ Typical for build tools (webpack DefinePlugin, Vite define)
}

export {};
// ^ IMPORTANT: This line makes the file a module
// ^ Without export {} 'declare global' is not allowed in a module file
```

> 💭 **Think about it:** Why do you need `export {}` at the end of the file?
> TypeScript distinguishes between a "Script" (global scope) and a "Module"
> (own scope). What happens without export {}?
>
> **Answer:** Without export {} the file is a "Script" — everything in it
> lands in the global scope. However, `declare global {}` only works
> in module files (with at least one import/export). `export {}`
> is the shortest way to make a file a module.

---

## .d.ts for Untyped npm Packages

If `@types/packagename` doesn't exist:

```typescript annotated
// Step 1: Check whether @types exists
// npm info @types/your-package → not found

// Step 2: Create a minimal .d.ts
// src/types/your-package.d.ts

declare module "legacy-chart-lib" {
  // ^ Module name must EXACTLY match the import path

  export interface ChartOptions {
    width: number;
    height: number;
    data: number[];
    color?: string;
  }

  export class Chart {
    constructor(element: HTMLElement, options: ChartOptions);
    render(): void;
    update(data: number[]): void;
    destroy(): void;
  }

  export default function createChart(
    element: HTMLElement,
    options: ChartOptions
  ): Chart;
}

// Now this works:
// import createChart from "legacy-chart-lib";
// const chart = createChart(el, { width: 800, height: 600, data: [1,2,3] });
// ^ Full types, autocomplete, error checking
```

For a quick start — if you just want the compiler to stop complaining:

```typescript annotated
// src/types/quick-fix.d.ts — "quick fix" for many untyped packages

declare module "legacy-lib-1";
// ^ Everything from this module is 'any'
// ^ No type error, but also no type protection

declare module "legacy-lib-2";
declare module "old-utils";
// ^ One line per package — the minimum

// BETTER: Refine incrementally
declare module "legacy-lib-1" {
  export function doSomething(input: string): string;
  // ^ Only type the functions you ACTUALLY use
  // ^ Leave the rest for now
}
```

> ⚡ **Framework connection (React):** In React projects you often need
> .d.ts files for CSS modules, images, and other non-JS imports:
>
> ```typescript
> // src/types/assets.d.ts
> declare module "*.css" {
>   const classes: { [key: string]: string };
>   export default classes;
> }
> declare module "*.svg" {
>   const content: string;
>   export default content;
> }
> declare module "*.png" {
>   const content: string;
>   export default content;
> }
> ```
>
> Without these declarations, CSS imports would produce errors.

---

## Quality Levels for .d.ts

You don't need to write perfect types right away. There are levels:

```typescript annotated
// Level 1: "Exists" (minimum)
declare module "analytics-sdk";
// ^ Everything is any — no protection, but no error

// Level 2: "Basic structure" (good enough for everyday use)
declare module "analytics-sdk" {
  export function init(key: string): void;
  export function track(event: string, props?: object): void;
}
// ^ The most important functions are typed

// Level 3: "Complete" (production-level)
declare module "analytics-sdk" {
  export interface TrackingEvent {
    name: string;
    properties?: Record<string, string | number | boolean>;
    timestamp?: Date;
  }
  export function init(config: { key: string; debug?: boolean }): void;
  export function track(event: TrackingEvent): Promise<void>;
  export function identify(userId: string, traits?: Record<string, unknown>): void;
  export function page(name: string, properties?: Record<string, unknown>): void;
}
// ^ Full types — autocomplete, error detection, documentation
```

> 🧪 **Experiment:** Create a minimal .d.ts for a module:
>
> ```typescript
> // 1. Create src/types/test-module.d.ts:
> declare module "test-module" {
>   export function greet(name: string): string;
> }
>
> // 2. Use it in a .ts file:
> import { greet } from "test-module";
> const msg = greet("TypeScript"); // Type: string
> const fail = greet(42);          // ERROR: number is not string
>
> // 3. Observe: TypeScript checks the type even though "test-module" doesn't exist!
> ```
>
> .d.ts files are promises — TypeScript trusts them blindly.

---

## What you've learned

- **.d.ts files** placed next to .js files give legacy code types without migration
- **Ambient declarations** (`declare global`) type global variables and Window extensions
- **Module declarations** (`declare module`) type untyped npm packages
- There are **three quality levels**: minimum (everything any), basic structure, complete
- `export {}` makes a file a **module** — required for `declare global`

**Core concept to remember:** .d.ts files are contracts between your TypeScript code and untyped code. They describe what exists without implementing it. Start with the minimum and refine incrementally — each level gives more safety.

---

> **Pause point** — Good moment for a break. You now know how to give
> untyped code its types.
>
> Continue with: [Section 05: Common Migration Problems and Solutions](./05-typische-migrationsprobleme.md)