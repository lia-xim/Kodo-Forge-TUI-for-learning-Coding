# Cheatsheet: Declaration Merging

Quick reference for Lesson 27.

---

## Interface Merging

```typescript
// Interfaces with the same name are automatically merged:
interface User { id: string; name: string; }
interface User { email: string; }
// Result: User has id, name, email

// RULES:
// ✅ Adding new properties → OK
// ❌ Same properties with different types → Compile Error
// ⚠️ Method overloads: Later declaration takes precedence
```

---

## Module Augmentation

```typescript
// Extending a third-party npm package:
import type { Request } from "express";  // Makes file a module

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; name: string };
    requestId: string;
  }
}

// IMPORTANT:
// 1. Exact module name (not "express" but "express-serve-static-core"!)
// 2. File must be a module (import/export present)
// 3. Only EXTEND, do not override
```

---

## Global Augmentation

```typescript
export {};  // Makes file a module!

declare global {
  interface Window {
    analytics: AnalyticsAPI;
    __APP_CONFIG__: AppConfig;
  }

  var DEBUG_MODE: boolean;  // var, not let/const!

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      PORT?: string;
    }
  }
}
```

---

## Declaration Files (.d.ts)

```typescript
// Type declarations only, no implementation:
declare function add(a: number, b: number): number;
declare const PI: number;
declare class Calculator {
  constructor(precision: number);
  calculate(expr: string): number;
}

// interface and type do not need 'declare':
interface MathResult { value: number; formatted: string; }
```

---

## Wildcard Module Declarations

```typescript
// Typing assets:
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
```

---

## Namespace Merging (Function + Properties)

```typescript
function jQuery(selector: string): HTMLElement[] { /* ... */ }
namespace jQuery {
  export function ajax(url: string): Promise<unknown> { /* ... */ }
  export const version = "3.7.1";
}
// jQuery("div") + jQuery.ajax("/api") + jQuery.version
```

---

## tsconfig.json Settings

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist/types",
    "typeRoots": ["./types", "./node_modules/@types"]
  },
  "include": ["src/**/*.ts", "types/**/*.d.ts"]
}
```

---

## Common Errors and Solutions

| Error | Cause | Solution |
|---|---|---|
| Augmentation has no effect | .d.ts not in tsconfig include | `"include": ["types/**/*.d.ts"]` |
| Wrong module name | e.g. "express" instead of "express-serve-static-core" | Check node_modules/@types |
| declare global ignored | File is not a module | Add `export {}` |
| let/const in declare global | Block-scoped, not global | Use `var` instead |
| Property type conflict | Same property, different types | Use same type or find workaround |

---

## When to Use Which Approach?

| Situation | Approach |
|---|---|
| Extending Express req.user | Module Augmentation |
| Typing React Theme | Module Augmentation |
| Adding window.analytics | Global Augmentation |
| Making process.env type-safe | Global Augmentation |
| Typing an old JS library | Custom .d.ts file |
| Typing PNG/CSS imports | Wildcard Module Declaration |
| Publishing your own library | `declaration: true` in tsconfig |

---

## Debugging Checklist

1. ☐ Is the .d.ts included in `tsconfig.json` `include`?
2. ☐ Does the file have an `import` or `export` (is it a module)?
3. ☐ Does the module name match EXACTLY (check node_modules)?
4. ☐ Restarted the IDE/TypeScript server?
5. ☐ Is the correct tsconfig being used (app vs. spec vs. root)?