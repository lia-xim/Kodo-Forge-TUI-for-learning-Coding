# Section 4: Declaration Files (.d.ts)

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Global Augmentation](./03-global-augmentation.md)
> Next section: [05 - Practice: Extending Express and React](./05-praxis-express-react.md)

---

## What you'll learn here

- What `.d.ts` files are and when you need to **write them yourself**
- How to automatically **generate** `.d.ts` files with `tsc --declaration`
- The syntax for `declare function`, `declare class`, `declare const`
- How DefinitelyTyped and `@types/*` packages work

---

## Background: Types for JavaScript Code

> **Feature Origin Story: DefinitelyTyped**
>
> In 2012, when TypeScript was released, there were thousands of JavaScript
> libraries without types. Boris Yankov started the DefinitelyTyped repository
> on GitHub — a community collection of `.d.ts` files for popular JavaScript
> packages.
>
> Today, DefinitelyTyped is one of the largest open-source projects:
> Over 8,000 type definitions, maintained by thousands of volunteers.
> When you run `npm install @types/express`, you're installing a
> `.d.ts` file from this repository.
>
> The idea was revolutionary: types can exist and be distributed
> **independently** from the code. This enabled TypeScript's adoption
> without requiring existing JavaScript libraries to be rewritten.
> Today, more and more packages ship their own types —
> but DefinitelyTyped remains indispensable.

---

## What is a .d.ts file?

```typescript annotated
// math-lib.d.ts — ONLY type declarations, NO code!

// declare = "This value exists at runtime, I'm only describing the type"
declare function add(a: number, b: number): number;
// ^ No function body! Just the signature.

declare function subtract(a: number, b: number): number;

declare const PI: number;
// ^ Value exists somewhere in the JavaScript — only the type here

declare class Calculator {
  constructor(precision: number);
  calculate(expression: string): number;
  readonly history: string[];
  // ^ Properties and methods without implementation
}

// Interface and type don't need 'declare' — they're always purely declarative:
interface MathResult {
  value: number;
  precision: number;
  formatted: string;
}

type Operation = "add" | "subtract" | "multiply" | "divide";
```

> 🧠 **Explain to yourself:** Why do `interface` and `type` not need the
> `declare` keyword, but `function`, `class`, and `const` do?
>
> **Key points:** interface and type exist ONLY in the type system — they
> never have a runtime representation | function, class, const also exist
> at runtime → declare says: "Trust me, the implementation comes from
> somewhere else" | declare = "I'm describing what EXISTS"

---

## Generating .d.ts automatically
<!-- section:summary -->
TypeScript can automatically generate `.d.ts` files from your code:

<!-- depth:standard -->
TypeScript can automatically generate `.d.ts` files from your code:

```typescript annotated
// tsconfig.json:
{
  "compilerOptions": {
    "declaration": true,
    // ^ Generates .d.ts alongside each .js file
    "declarationDir": "./dist/types",
    // ^ Output folder for .d.ts files
    "emitDeclarationOnly": true
    // ^ Generate ONLY .d.ts, no JavaScript (useful with bundlers)
  }
}

// Input: src/utils.ts
export function formatCurrency(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

export interface CurrencyConfig {
  locale: string;
  currency: string;
  decimals: number;
}

// Generated output: dist/types/utils.d.ts
// export declare function formatCurrency(cents: number): string;
// export interface CurrencyConfig {
//   locale: string;
//   currency: string;
//   decimals: number;
// }
// ^ The compiler extracts ONLY the type information.
//   The implementation (function body) is gone.
```

> 💭 **Think about it:** Why do we generate `.d.ts` files? Can't other
> projects just use the `.ts` files directly?
>
> **Answer:** 1. Performance: `.d.ts` is faster to parse than `.ts`
> (no code analysis needed). 2. Libraries: npm packages ship `.js`
> + `.d.ts`, not `.ts` (source code stays private). 3. JavaScript
> compatibility: `.d.ts` describes existing JS code.

---

<!-- /depth -->
## Writing your own .d.ts for JavaScript libraries
<!-- section:summary -->
Sometimes there's no `@types/*` package. Then you have to do it yourself:

<!-- depth:standard -->
Sometimes there's no `@types/*` package. Then you have to do it yourself:

```typescript annotated
// Example: An old JavaScript library "legacy-charts"
// that has no types and no @types package exists.

// types/legacy-charts.d.ts:
declare module "legacy-charts" {
  // ^ Module declaration for the package name

  export interface ChartOptions {
    type: "bar" | "line" | "pie";
    width: number;
    height: number;
    data: DataPoint[];
    colors?: string[];
  }

  export interface DataPoint {
    label: string;
    value: number;
  }

  export class Chart {
    constructor(element: HTMLElement, options: ChartOptions);
    render(): void;
    update(data: DataPoint[]): void;
    destroy(): void;
  }

  // Default export:
  export default function createChart(
    selector: string,
    options: ChartOptions
  ): Chart;
}

// Now in code:
// import createChart, { Chart, ChartOptions } from "legacy-charts";
// const chart = createChart("#chart", { type: "bar", width: 800, ... });
// ^ Fully type-safe!
```

<!-- depth:vollstaendig -->
> **Experiment:** Look inside `node_modules/@types/` in one of your projects.
> Open e.g. `@types/node/index.d.ts` or `@types/express/index.d.ts`.
> You'll see:
>
> ```
> @types/node/index.d.ts        → approx. 100 lines (re-exports)
> @types/node/fs.d.ts           → approx. 3000 lines (File System types)
> @types/node/http.d.ts         → approx. 1500 lines (HTTP types)
> ```
>
> These files are the type "skeleton" for Node.js — they describe
> what exists without a single line of implementation.

---

<!-- /depth -->
## Wildcards and non-JS modules
<!-- section:summary -->
For file types that aren't JavaScript:

<!-- depth:standard -->
For file types that aren't JavaScript:

```typescript annotated
// types/assets.d.ts

// Images:
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import type { FC, SVGAttributes } from "react";
  const SVGComponent: FC<SVGAttributes<SVGElement>>;
  export default SVGComponent;
}

// CSS Modules:
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

// JSON files (if not using resolveJsonModule):
declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

// Now in code:
// import logo from "./logo.png";         // string (URL)
// import Icon from "./icon.svg";         // React Component
// import styles from "./app.module.css"; // { [className]: string }
```

> ⚡ **In your Angular project** you rarely need `.d.ts` files for
> assets, because Angular CLI handles that. But for your own libraries:
>
> ```typescript
> // projects/shared-lib/src/public-api.d.ts
> // Angular libraries (ng-packagr) generate .d.ts automatically
> // with the 'declaration' flag in tsconfig.lib.json.
> //
> // When you create an Angular library:
> // ng generate library shared-lib
> // → tsconfig.lib.json has "declaration": true
> // → ng build shared-lib generates .d.ts in dist/
> ```
>
> In Next.js:
>
> ```typescript
> // next-env.d.ts — generated automatically:
> /// <reference types="next" />
> /// <reference types="next/image-types/global" />
> // ^ Triple-slash directives: reference type packages
> ```

---

<!-- /depth -->
## tsconfig.json: Including type files

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./types", "./node_modules/@types"],
    // ^ Where TypeScript looks for .d.ts files (default: only node_modules/@types)
    "types": ["node", "jest"],
    // ^ Which @types packages are automatically included
    //   CAUTION: If "types" is set, ONLY these are included!
    //   Without "types", ALL @types packages are included.
  },
  "include": [
    "src/**/*.ts",
    "types/**/*.d.ts"
    // ^ Custom .d.ts files must be within the include path
  ]
}
```

---

## What you've learned

- `.d.ts` files contain ONLY type declarations — no executable code
- `declare` means: "This value exists at runtime, I'm only describing the type"
- `tsc --declaration` generates `.d.ts` automatically from TypeScript code
- **DefinitelyTyped** (`@types/*`) provides community types for JavaScript libraries
- **Wildcard modules** (`*.png`, `*.css`) type non-JavaScript imports

> 🧠 **Explain to yourself:** What's the difference between
> `declare function add(a: number, b: number): number` in a `.d.ts`
> and `function add(a: number, b: number): number` in a `.ts`?
>
> **Key points:** `.d.ts` = declaration only, no implementation |
> `.ts` = declaration + implementation | declare = "exists elsewhere" |
> In `.d.ts` everything is implicitly declare — the keyword is optional

**Core concept to remember:** `.d.ts` files are TypeScript's bridge
to the JavaScript world. They describe what exists without implementing
it — like an architectural blueprint without the building.

---

> **Pause point** -- You understand declaration files.
> In the final section we combine everything in practice.
>
> Continue with: [Section 05: Practice: Extending Express and React](./05-praxis-express-react.md)