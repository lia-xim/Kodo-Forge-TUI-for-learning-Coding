# Section 4: Module Augmentation — Extending Existing Types

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Declaration Files](./03-declaration-files.md)
> Next section: [05 - Practical Patterns](./05-praxis-patterns.md)

---

## What you'll learn here

- How **Module Augmentation** (`declare module`) extends existing library types without modifying the library
- Why **Global Augmentation** (`declare global`) is necessary and how to extend `Window`, `ProcessEnv`, and other global types
- The mechanism behind augmentation: **Interface Merging** in TypeScript
- Why the `export {}` trick works and when you need it

---

## Background Story: The Express Problem — and the Elegant Solution

Imagine this: you're building an Express.js API with TypeScript. You have an
authentication middleware that writes the current user to the request object:

```javascript
// auth-middleware.js (simplified)
app.use((req, res, next) => {
  req.user = await getUserFromToken(req.headers.authorization);
  next();
});
```

In your route handlers you want to use `req.user`. But TypeScript doesn't
know about it:

```typescript
app.get('/profile', (req, res) => {
  console.log(req.user.name);
  //               ^^^^ Error! Property 'user' does not exist on type 'Request'
});
```

The naive solution would be `(req as any).user` — but that throws away all
type safety. The elegant solution: **Module Augmentation**.

You can tell TypeScript: "The `Request` interface from Express has an additional
property that I've added." Without changing the Express source code,
without a fork, without patching `@types/express`.

That's **Module Augmentation** — and it's one of the most powerful mechanisms
in TypeScript.

---

## Interface Merging — The Mechanism Behind Everything

TypeScript has a special rule: **interfaces with the same name are merged**.

```typescript annotated
interface User {
  name: string;
}

interface User {
  email: string;
}

// TypeScript merges both into:
// interface User { name: string; email: string; }

const user: User = {
  name: "Max",
  email: "max@example.com"
  // ^ Both properties are required — TypeScript merged the interfaces!
};
```

This might sound undesirable, but it's **the core** of the entire
augmentation system. When you augment a module, you use exactly this
mechanism: you define an interface with the same name as one in the library — TypeScript merges them.

---

## Module Augmentation — Extending Express

```typescript annotated
// src/types/express.d.ts

import 'express';
// ^ IMPORTANT: This import makes the file an ES module.
//   Without it, the file would be a "script" — and declare module would
//   create a completely new module instead of extending the existing one.

declare module 'express' {
// ^ "I am extending the 'express' module" — must exactly match the import string!

  interface Request {
  // ^ Interface Merging: TypeScript merges this with the real Request interface
    user?: {
      id: string;
      role: 'admin' | 'user' | 'guest';
      email: string;
    };
    // ^ Optional (?) because no user exists on public routes

    requestId: string;
    // ^ Every request gets a unique ID (set by your middleware)

    startTime: number;
    // ^ For performance logging: when did the request start?
  }
}
```

```typescript annotated
// In your route handlers, req is now fully typed:
app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { id, role, email } = req.user;
  // ^ TypeScript knows: user has id, role, email. No any!

  const duration = Date.now() - req.startTime;
  // ^ startTime is typed too. Autocomplete works!

  res.json({ id, role, email, requestDuration: duration });
});
```

---

## Global Augmentation — Extending Global Types

Sometimes you need to extend **global** types — `Window`, `NodeJS.ProcessEnv`,
or even introduce new global interfaces.

```typescript annotated
// src/types/env.d.ts

declare global {
// ^ "declare global" extends the global scope — no module name needed

  interface Window {
  // ^ Extending the global Window interface
    gtag: (command: string, targetId: string, config?: object) => void;
    // ^ Google Analytics is loaded via <script> — globally available
    __APP_VERSION__: string;
    // ^ Injected by your build tool (Vite define, Webpack DefinePlugin)
  }

  namespace NodeJS {
  // ^ Node.js-specific types (available when @types/node is installed)
    interface ProcessEnv {
    // ^ Make process.env type-safe
      NODE_ENV: 'development' | 'production' | 'test';
      // ^ Not string — only these three values are valid!
      DATABASE_URL: string;
      // ^ Required field — no "| undefined" = TypeScript assumes it always exists
      API_KEY: string;
      PORT?: string;
      // ^ Optional: not always set
    }
  }
}

export {};
// ^ CRITICAL: This line makes the file an ES module.
//   Without it, the file is a "script" and "declare global" is not allowed
//   in a script context — it must be a module to augment globally.
```

```typescript annotated
// Now type-safe everywhere:
const db = process.env.DATABASE_URL;
//                      ^^^^^^^^^^^^ string (not string | undefined!)
//                      Because we declared it as a required field.
//                      CAUTION: TypeScript trusts you — if DATABASE_URL
//                      is missing, you get a runtime error, not a TS error.

window.__APP_VERSION__;
// ^ string — TypeScript knows about the global variable.
//   Without augmentation: "Property '__APP_VERSION__' does not exist on type 'Window'"
```

---

> **Experiment:** Open the TypeScript Playground and test the `export {}` trick:
>
> ```typescript
> // Variant 1: Without export {} — the file is a "script"
> declare global {
>   interface Window {
>     myProp: string;
>   }
> }
> // Paste this code into the Playground. You'll see an error:
> // "Augmentations for the global scope can only be directly nested in
> //  external modules or ambient module declarations."
>
> // Variant 2: With export {} — the file becomes a module
> export {};
> declare global {
>   interface Window {
>     myProp: string;
>   }
> }
> // Now it works! window.myProp is typed.
> ```
>
> Why does a single empty line make the difference? Because TypeScript
> treats a file as a "module" when it has at least one `import` or
> `export`. `export {}` is the minimal "trick" to achieve this.

---

## Namespace Augmentation

Besides interfaces, namespaces can also be extended. This is rare,
but sometimes necessary for libraries that use namespaces:

```typescript annotated
// For libraries that export their own namespace
declare namespace MyLibrary {
// ^ Namespace extension without "declare module" — directly in the global scope

  interface Config {
    theme: 'light' | 'dark';
    // ^ Adding a new property to the Config interface
    locale: string;
  }
}

// More common: extending existing namespaces via declare module
declare module 'some-library' {
  namespace Internal {
    interface Options {
      timeout: number;
    }
  }
}
```

---

**In your Angular project:**
Angular uses augmentation internally for its Dependency Injection mechanism.
But you'll need augmentation too — for example when you want to type your own
interfaces for HTTP interceptors or router guards:

```typescript annotated
// src/types/angular-router.d.ts — Extending Angular Router state

import '@angular/router';

declare module '@angular/router' {
  interface Data {
  // ^ Extending the Route Data interface — used in RouterModule
    breadcrumb?: string;
    // ^ Now routes can have a breadcrumb property in "data"
    requiredRole?: 'admin' | 'user';
    // ^ Type-safe: only these roles are allowed
    title?: string;
    // ^ For dynamic page titles (alternative to Angular's TitleStrategy)
  }
}
```

```typescript annotated
// In your router-config.ts:
const routes: Routes = [
  {
    path: 'admin',
    data: {
      breadcrumb: 'Administration',
      requiredRole: 'admin'
      //             ^^^^^^^ TypeScript checks: must be 'admin' | 'user'!
    },
    component: AdminComponent
  }
];
```

---

> **Explain to yourself:** Why does Module Augmentation work? What is the
> mechanism TypeScript uses when you write `declare module 'express'` in one
> file and `import express from 'express'` in another file?
> How does TypeScript "know" that they belong together?
>
> **Key points:**
> - Interface Merging: interfaces with the same name are combined
> - TypeScript collects all `.d.ts` files and all `declare module` blocks
> - When type-checking, TypeScript merges all definitions for 'express' together
> - The order of files doesn't matter — TypeScript sees everything in the project

---

> **Think about it:** Module Augmentation is powerful, but it has a weakness:
> it's "global" to your project. When you augment `Request.user`,
> it applies everywhere — even in parts of the code that shouldn't know about `user`.
> How could you solve this problem? Is there an alternative to augmentation?

---

## What you've learned

- **Module Augmentation** (`declare module 'x'`) extends existing library types through Interface Merging
- **Global Augmentation** (`declare global`) extends the global scope — `Window`, `ProcessEnv`, etc.
- **`export {}`** makes a file an ES module — without it, `declare global` doesn't work
- **Interface Merging** is the mechanism: TypeScript combines interfaces with the same name
- The augmenting file must be an ES module (must have at least one `import` or `export`)

**Core concept:** Augmentation is "peaceful" extension — you don't change a library, you supplement TypeScript's picture of it. This is the Open/Closed Principle at the type level: open for extension, closed for modification.

---

> **Pause point** — Module Augmentation is one of those TypeScript features
> that many developers go years without knowing — and then wonder how they
> ever worked without it. You now know how Express, Angular,
> and other libraries can be extended internally.
>
> Continue with: [Section 05 — Practical Patterns and Triple-Slash Directives](./05-praxis-patterns.md)