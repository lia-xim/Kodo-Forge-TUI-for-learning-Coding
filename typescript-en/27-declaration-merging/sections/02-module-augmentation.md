# Section 2: Module Augmentation

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Interface Merging Basics](./01-interface-merging-basics.md)
> Next section: [03 - Global Augmentation](./03-global-augmentation.md)

---

## What you'll learn here

- How to use `declare module` to extend types from **third-party packages**
- The syntax and rules of **Module Augmentation**
- The difference between **augmentation** (extending) and **overriding**
- Typical use cases: extending Express, React, Vue

---

## Background: The Plugin Problem

> **Feature Origin Story: Module Augmentation**
>
> TypeScript 1.8 (February 2016) introduced Module Augmentation.
> The occasion: libraries like Express had a plugin system where
> middleware adds new properties to the `Request` object (e.g.
> `req.user` after authentication). But Express's type definition
> knew nothing about these extensions.
>
> Developers faced a dilemma: either `(req as any).user`
> (unsafe) or redefining the entire Request type (impractical).
> Module Augmentation solved this elegantly: you declare the extension
> in its own file, and TypeScript automatically merges it with
> the original type definition.
>
> Today, Module Augmentation is the standard way to extend third-party types
> — in Express, React, Vue, Prisma, and many others.

---

## The Syntax: `declare module`

```typescript annotated
// types/express-extension.d.ts

// IMPORTANT: 'declare module' with the EXACT module name:
declare module "express-serve-static-core" {
  // ^ The module name must EXACTLY match the npm package name or the internal
  //   module path. For Express, it's the internal name.

  interface Request {
    // ^ Interface Merging! Extends the existing Request interface.
    user?: {
      id: string;
      name: string;
      role: "admin" | "user";
    };
    sessionId?: string;
    requestTime: number;
  }
}

// Now in your Express code:
// app.get("/profile", (req, res) => {
//   if (req.user) {
//     res.json({ name: req.user.name }); // Type-safe!
//   }
// });
```

> 🧠 **Explain to yourself:** Why is `declare module` placed in a `.d.ts`
> file rather than a regular `.ts` file? What would happen
> if you used it in a `.ts` file?
>
> **Key points:** `.d.ts` is a type declaration file — types only, no code |
> In regular `.ts` files `declare module` works too, BUT: the file
> must be a "module" (at least one import/export) | Without import/export
> TypeScript would treat the file as a "Script" (global) |
> `.d.ts` is the convention for type extensions

---

## Important Rules
<!-- section:summary -->
### Rule 1: The file must be a module

<!-- depth:standard -->
### Rule 1: The file must be a module

```typescript annotated
// WRONG — file is a "Script" (no import/export):
declare module "express" {
  interface Request {
    user?: { id: string };
  }
}
// ^ This works sometimes, but is fragile.
//   TypeScript treats the file as a global declaration.

// CORRECT — file is a module (has at least one import or export):
import type { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}
// ^ The import makes the file a module.
//   Alternative: export {} at the end of the file.
```

### Rule 2: You can only EXTEND, not override

```typescript annotated
// You can ADD new properties:
declare module "express-serve-static-core" {
  interface Request {
    customProp: string; // NEW — gets added
  }
}

// You CANNOT CHANGE the type of an existing property:
// declare module "express-serve-static-core" {
//   interface Request {
//     body: MyCustomType; // ERROR if body is already defined differently!
//   }
// }
```

### Rule 3: The module name must match exactly

```typescript annotated
// Express exports Request from "express-serve-static-core", NOT "express":
declare module "express-serve-static-core" { // CORRECT
  interface Request { user?: User; }
}

// declare module "express" { // WRONG — incorrect internal module name
//   interface Request { user?: User; }
// }
// ^ This would create a NEW interface instead of extending the existing one!
```

> 💭 **Think about it:** How do you find the correct module name for an
> augmentation? What happens if you use the wrong name?
>
> **Answer:** 1. Look in the package's `.d.ts` files (node_modules/@types/...).
> 2. Search for `declare module "..."` or the export path.
> 3. Wrong name → no merging, but a new, separate module instead.
> TypeScript gives no error — your extension simply exists
> in the wrong namespace and has no effect.

---

<!-- /depth -->
## In Practice: Extending React Types

```typescript annotated
// Making CSS Custom Properties type-safe in React:
import "react";

declare module "react" {
  interface CSSProperties {
    // Custom CSS Properties (CSS Variables):
    "--primary-color"?: string;
    "--spacing"?: string;
    "--font-size"?: string;
    // ^ Without augmentation: CSSProperties only accepts known CSS properties.
    //   With augmentation: Custom properties are type-safe!
  }
}

// Usage in JSX:
// <div style={{ "--primary-color": "#ff0000", "--spacing": "8px" }} />
// ^ Now type-safe! Without augmentation this would be a compile error.
```

> **Experiment:** Look in `node_modules/@types/react/index.d.ts`
> (or `node_modules/react/index.d.ts` for newer React versions).
> Search for `interface CSSProperties`. You'll see:
>
> ```typescript
> interface CSSProperties extends CSS.Properties<string | number> {
>   // Extensions might already be here
> }
> ```
>
> Every augmentation you write will be merged with this interface.
> This is the mechanism behind styled-components, emotion, and
> other CSS-in-JS libraries.

---

## Augmentation for Your Own Modules
<!-- section:summary -->
Module Augmentation also works with your own modules:

<!-- depth:standard -->
Module Augmentation also works with your own modules:

```typescript annotated
// === math-utils.ts ===
export function add(a: number, b: number): number {
  return a + b;
}

// === math-extensions.ts ===
// Extend math-utils with new exports:
declare module "./math-utils" {
  // ^ Relative path — refers to the local module
  export function multiply(a: number, b: number): number;
}

// BUT: You must add the implementation YOURSELF!
// Augmentation only declares the TYPE, not the CODE.
// In practice, this is rarely used for your own modules.
```

> ⚡ **In your Angular project** Module Augmentation is useful for:
>
> ```typescript
> // 1. Environment types:
> declare module "src/environments/environment" {
>   interface Environment {
>     analyticsKey: string;
>     featureFlags: Record<string, boolean>;
>   }
> }
>
> // 2. Material Theme extensions:
> declare module "@angular/material/core" {
>   interface ThemePalette {
>     custom: string; // Custom palette color
>   }
> }
>
> // 3. HttpContext tokens:
> // Angular's HttpContext can be extended type-safely with augmentation.
> ```

---

<!-- /depth -->
## Augmentation vs. Wrapper vs. Fork
<!-- section:summary -->
| Approach | When to use? | Drawbacks |

<!-- depth:standard -->
| Approach | When to use? | Drawbacks |
|---|---|---|
| **Augmentation** | Adding new properties/methods | Interface extension only, no override |
| **Wrapper type** | Transforming existing types | Additional abstraction layer |
| **Fork the .d.ts** | Fundamental type changes | Must be maintained manually on updates |
| **Patch-package** | Runtime changes to the package | Fragile, can break on updates |

---

<!-- /depth -->
## What you've learned

- `declare module "packagename"` extends the types of a third-party module
- The file must be a **module** (at least one import or export)
- You can **add** properties but not **change** the type of existing properties
- The **module name** must match exactly — otherwise a new module is created
- Module Augmentation is the standard for Express, React, Vue extensions

> 🧠 **Explain to yourself:** What is the difference between
> Interface Merging (Section 1) and Module Augmentation?
>
> **Key points:** Interface Merging = two declarations in the SAME module |
> Module Augmentation = extending a FOREIGN module |
> Module Augmentation uses Interface Merging INSIDE declare module |
> Augmentation = "I open the foreign module and add something to it"

**Core concept to remember:** Module Augmentation is "Interface Merging
across module boundaries". You open a foreign module with
`declare module` and use Interface Merging to extend it.

---

> **Pause point** — You can now extend foreign modules.
> Next topic: Global Augmentation — for when it's not about modules.
>
> Continue with: [Section 03: Global Augmentation](./03-global-augmentation.md)