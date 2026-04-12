# Section 5: Practice — Extending Express and React

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Declaration Files (.d.ts)](./04-declaration-files.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- How to type **Express middleware** in a type-safe way (extending Request, Response)
- How to extend **React types** (JSX IntrinsicElements, Theme, Refs)
- A complete example: **Authentication middleware** with Declaration Merging
- Common mistakes and **debugging tips** for augmentations

---

## Background: Why frameworks need Declaration Merging

> **Feature Origin Story: Express and the req problem**
>
> Express.js (2010, TJ Holowaychuk) has an elegant middleware concept:
> each middleware can modify the request object before it is passed to the
> next middleware. `passport.js` adds `req.user`,
> `express-session` adds `req.session`, `body-parser`
> adds `req.body`.
>
> The problem: TypeScript's Request type knows nothing about these
> extensions. `@types/express` defines a base Request interface —
> but every app uses different middleware. The solution: each app extends
> the Request type with Declaration Merging for exactly the middleware it
> uses.
>
> This is a prime example of Declaration Merging in practice:
> a base type + project-specific extensions.

---

## Practice 1: Express Authentication Middleware

```typescript annotated
// === types/express.d.ts ===
// Step 1: Extend the Express Request

import type { User } from "../models/user";

declare module "express-serve-static-core" {
  // ^ IMPORTANT: "express-serve-static-core", NOT "express"!
  //   Express re-exports Request from this internal module.

  interface Request {
    user?: User;
    // ^ Optional: only set after successful authentication
    isAuthenticated: boolean;
    // ^ Always present — set by auth middleware
    requestId: string;
    // ^ Unique request ID for logging/tracing
  }
}

// === middleware/auth.ts ===
// Step 2: The middleware that extends the request

import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    req.isAuthenticated = false;
    // ^ TypeScript knows isAuthenticated thanks to our augmentation!
    return next();
  }

  const user = verifyToken(token);
  if (user) {
    req.user = user;
    // ^ TypeScript knows req.user as User | undefined
    req.isAuthenticated = true;
  } else {
    req.isAuthenticated = false;
  }
  next();
}

// === routes/profile.ts ===
// Step 3: Type-safe usage

import { Router } from "express";
const router = Router();

router.get("/profile", (req, res) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // TypeScript narrows: req.user is now User (not undefined)!
  res.json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
  // ^ Full type safety — no (req as any).user needed!
});
```

> 🧠 **Explain to yourself:** Why is the module name
> `"express-serve-static-core"` and not simply `"express"`?
> How do you find the correct name?
>
> **Key points:** Express re-exports Request from an internal module |
> In node_modules/@types/express/index.d.ts it says: import * from "express-serve-static-core" |
> You must extend the SOURCE module, not the re-exporting one |
> Tip: Look for the interface in the package's .d.ts file

---

## Practice 2: React Custom Theme Types

```typescript annotated
// === types/theme.d.ts ===
// Extend React + styled-components Theme

import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      error: string;
      success: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }
}

// Now in code:
// const Button = styled.button`
//   color: ${props => props.theme.colors.primary};
//   padding: ${props => props.theme.spacing.md};
// `;
// ^ theme.colors.primary is type-safe — autocomplete shows all colors!
// ^ Typos like theme.colors.primay → compile error!
```

> 💭 **Think about it:** What is the advantage of typed theme values
> over plain strings? CSS values are always strings anyway?
>
> **Answer:** 1. Autocomplete: the IDE shows all available colors/spacings.
> 2. Typo protection: `theme.colors.primay` → compile error.
> 3. Refactoring: rename a color → all usages are highlighted.
> 4. Documentation: the type IS the theme documentation.

---

## Practice 3: JSX IntrinsicElements for Web Components

```typescript annotated
// === types/web-components.d.ts ===
// Make custom Web Components type-safe in React/JSX

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      // Custom Web Components:
      "app-header": {
        title: string;
        "show-logo"?: boolean;
        onNavigate?: (event: CustomEvent<string>) => void;
      };
      "data-table": {
        data: Array<Record<string, unknown>>;
        columns: string[];
        sortable?: boolean;
        onSort?: (event: CustomEvent<{ column: string; direction: "asc" | "desc" }>) => void;
      };
      "icon-button": {
        icon: string;
        label: string;
        variant?: "primary" | "secondary" | "ghost";
        disabled?: boolean;
        onClick?: () => void;
      };
    }
  }
}

// Now in JSX:
// <app-header title="Dashboard" show-logo />
// ^ Type-safe! 'title' is required, 'show-logo' optional.
// <app-header />  // COMPILE ERROR: 'title' is missing!
// <data-table data={users} columns={["name", "email"]} sortable />
```

> **Experiment:** If you have an Angular project with Custom Elements,
> try this pattern in a React sub-project. The reverse
> direction also works:
>
> ```typescript
> // Angular: Custom Elements Schema
> // In Angular you need CUSTOM_ELEMENTS_SCHEMA in the Module.
> // Typing is done via Interface Augmentation:
>
> declare module "@angular/core" {
>   // Angular-specific Web Component typing
>   // is handled via Schemas, not via JSX.IntrinsicElements.
>   // But the principle — Declaration Merging — is the same.
> }
> ```

---

## Debugging: When augmentation doesn't work
<!-- section:summary -->
The most common problems and solutions:

<!-- depth:standard -->
The most common problems and solutions:

```typescript annotated
// Problem 1: Augmentation is ignored
// Cause: The .d.ts file is not included in tsconfig.json
// Solution:
// {
//   "include": ["src/**/*.ts", "types/**/*.d.ts"]
//   //                          ^^^^^^^^^^^^^^^^ Is this missing?
// }

// Problem 2: Wrong module name
// Cause: "express" instead of "express-serve-static-core"
// Debugging: open node_modules/@types/express/index.d.ts
//            and search for the interface

// Problem 3: File is not a module
// Cause: No import/export in the .d.ts file
// Solution:
export {}; // Add at the beginning or end of the file

// Problem 4: TypeScript cache
// Solution: Restart the IDE or:
// rm -rf node_modules/.cache
// npx tsc --build --clean

// Problem 5: Multiple tsconfig files
// Cause: Augmentation is in tsconfig.json but not in tsconfig.app.json
// Solution: Check all relevant tsconfig files
```

> ⚡ **In your Angular project** the most common augmentation problems are:
>
> ```
> 1. tsconfig.app.json vs tsconfig.json — Angular CLI uses tsconfig.app.json!
>    → types/**/*.d.ts must be in tsconfig.app.json, not just tsconfig.json
>
> 2. Angular Strict Mode — strictTemplates can conflict with augmentations
>    → Check whether the extended types are compatible with Angular's template compiler
>
> 3. nx/monorepo — each project has its own tsconfig
>    → Augmentation must be included in EVERY affected project
> ```

---

<!-- /depth -->
## Summary: Declaration Merging in Practice

| Use Case | Approach | File |
|---|---|---|
| Express req.user | Module Augmentation | types/express.d.ts |
| React Theme | Module Augmentation | types/styled.d.ts |
| Web Components in JSX | Module Augmentation | types/web-components.d.ts |
| process.env | Global Augmentation | types/env.d.ts |
| window.analytics | Global Augmentation | types/window.d.ts |
| Custom JS library | Declaration File | types/legacy-lib.d.ts |
| NPM package without types | Declaration File | types/untyped-pkg.d.ts |

---

## What you've learned

- **Express middleware** is typed with Module Augmentation on `"express-serve-static-core"`
- **React themes** and **JSX elements** are extended with Module Augmentation on `"react"` and `"styled-components"`
- The **correct module name** is critical — always look it up in the package's `.d.ts` file
- **Debugging**: check tsconfig.json, don't forget `export {}`, clear the IDE cache

> 🧠 **Explain to yourself:** Why is Declaration Merging better than
> `(req as any).user` for Express middleware?
>
> **Key points:** as any disables type safety entirely |
> Typos go undetected | No autocomplete |
> Augmentation gives full type safety + autocomplete |
> Augmentation is self-documenting — the type shows what the middleware does

**Core concept to remember:** Declaration Merging is the bridge between
TypeScript's static type system and JavaScript's dynamic nature.
It lets you describe the **reality** of your code — even when
the library types did not anticipate it.

---

> **End of lesson** — You have mastered Declaration Merging — from
> interface basics all the way to Express and React extensions.
>
> Up next: [Lesson 28: Decorators](../../28-decorators/sections/01-decorator-basics.md)