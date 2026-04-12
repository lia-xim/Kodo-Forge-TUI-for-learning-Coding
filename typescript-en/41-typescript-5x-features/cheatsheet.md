# Cheatsheet: TypeScript 5.x Features

Compact reference — all important features organized by version.

---

## TypeScript 5.0 (March 2023)

### Decorators (ECMAScript Standard)
```typescript
// Old: experimentalDecorators (proprietary)
// New: TC39 Stage 3 Decorators (standard)
function log(target: any, context: ClassMethodDecoratorContext) {
  return function(this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return target.call(this, ...args);
  };
}

class Service {
  @log
  doWork() { return 42; }
}
```

### moduleResolution: "bundler"
```json
// tsconfig.json — for Vite, esbuild, webpack 5:
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext"
  }
}
// Allows: import './utils'     (no .js/.ts extension needed)
// Respects: package.json "exports" and "imports" fields
```

### verbatimModuleSyntax
```typescript
// tsconfig.json: "verbatimModuleSyntax": true

// ERROR — Component is only used as a type:
import { Component } from '@angular/core';
// ^ Error: "Component" is a type and must use "import type"

// CORRECT:
import type { Component } from '@angular/core';
// ^ Completely removed from output — no runtime import

// CORRECT (mixed):
import { Injectable, type Component } from '@angular/core';
// ^ Injectable stays, Component is treated as type only
```

### const Type Parameters
```typescript
// Before TS 5.0:
function first<T>(arr: T[]): T { return arr[0]; }
first(['a', 'b']); // T = string, not 'a' | 'b'

// With const:
function first<const T extends readonly unknown[]>(arr: T): T[0] {
  return arr[0];
}
first(['a', 'b'] as const); // T = readonly ['a', 'b'], result: 'a'
```

---

## TypeScript 5.1 (June 2023)

### Decoupled Return Types for Getter/Setter
```typescript
// Before TS 5.1: getter and setter had to share the same type
// From TS 5.1: setter type can be a supertype of the getter type

class Input {
  private _value = "";

  get value(): string { return this._value; }    // returns string
  set value(v: string | number) {                // accepts string | number
    this._value = String(v);
  }
}

const i = new Input();
i.value = 42;    // OK! Setter accepts number
i.value;         // string — getter returns string
```

### undefined as Valid Return Type for void Functions
```typescript
// Functions returning undefined are now assignable to void-returning type:
type VoidFn = () => void;
const fn: VoidFn = (): undefined => undefined; // was an error before
```

---

## TypeScript 5.2 (August 2023)

### using — Explicit Resource Management
```typescript
// Implement Symbol.dispose:
class DatabaseConnection implements Disposable {
  [Symbol.dispose]() {
    console.log("Connection closed");
  }
  query(sql: string) { /* ... */ }
}

function getResults() {
  using conn = new DatabaseConnection();
  // ^ Symbol.dispose() is ALWAYS called at the end of the block
  return conn.query("SELECT * FROM users");
} // <-- here: conn[Symbol.dispose]() automatically

// For async:
class AsyncConn implements AsyncDisposable {
  async [Symbol.asyncDispose]() {
    await this.close();
  }
}
async function run() {
  await using conn = new AsyncConn();
  // ^ waits for Symbol.asyncDispose()
}
```

### using with Tuple Return for Multiple Resources
```typescript
// Before: try/finally for each resource
// After:
function useResources() {
  using db = openDB();
  using cache = openCache();
  // both are automatically closed at the end of the block
}
```

---

## TypeScript 5.3 (November 2023)

### Import Attributes
```typescript
// Type-safe JSON imports:
import data from "./config.json" with { type: "json" };
//                                ^^^^^^^^^^^^^^^^^^^^
//                                Attribute prevents wrong interpretation

// CSS Modules (with appropriate tooling):
import styles from "./Button.module.css" with { type: "css" };
```

### `resolution-mode` in type Imports
```typescript
// Explicitly control whether require() or import() is used for resolution:
import type { SomeType } from "some-module" with { "resolution-mode": "require" };
```

---

## TypeScript 5.4 (March 2024)

### NoInfer<T> Utility Type
```typescript
// Problem: T is inferred from all parameters — sometimes unwanted:
function setDefault<T>(values: T[], defaultValue: T): T[] {
  return values.length ? values : [defaultValue];
}
setDefault(['a', 'b'], 42); // No error! T = string | number

// Solution with NoInfer:
function setDefault<T>(values: T[], defaultValue: NoInfer<T>): T[] {
  return values.length ? values : [defaultValue];
}
setDefault(['a', 'b'], 42); // ERROR! T = string, 42 is not a string
```

### Preserved Narrowing in Closures
```typescript
// TS 5.4 improves narrowing persistence in closures:
function process(value: string | null) {
  if (!value) return;

  // Now correctly recognized that value is not null:
  const handler = () => {
    console.log(value.toUpperCase()); // OK in TS 5.4+
  };
  handler();
}
```

---

## TypeScript 5.5 (June 2024)

### Inferred Type Predicates
```typescript
// Before TS 5.5 — manual type predicate:
const result = arr.filter((x): x is string => x !== null);

// From TS 5.5 — automatically inferred:
const result = arr.filter(x => x !== null);
// result: string[] instead of (string | null)[]

// Also works with custom guards:
function isActive(user: User | null): boolean {
  return user !== null && user.active;
}
// TypeScript infers: (user: User | null) => user is User (when possible)
```

### isolatedDeclarations
```json
// tsconfig.json for libraries:
{
  "compilerOptions": {
    "isolatedDeclarations": true,
    "declaration": true
  }
}
```
```typescript
// Error with isolatedDeclarations:
export const config = { timeout: 5000 }; // Error! Type not explicit

// Correct:
export const config: { timeout: number } = { timeout: 5000 };

// Benefit: esbuild/swc can generate .d.ts without tsc — parallel and fast
```

### Regular Expression Syntax Checking
```typescript
// TS 5.5 validates RegExp syntax:
const valid = /^[a-z]+$/i;      // OK
const broken = /[invalid/;      // Error: Unterminated character class
```

---

## TypeScript 5.6 (September 2024)

### Disjunctive Well-Formedness Checks
```typescript
// TS 5.6 warns on always-true/always-false conditions:
const str = "hello";
if (str !== "hello" || str !== "world") {
  // ^ Warning: This condition is always true
}
```

### Iterator Helper Methods
```typescript
// Types for the new JavaScript Iterator Helper API:
function* range(start: number, end: number) {
  for (let i = start; i < end; i++) yield i;
}
// .map(), .filter(), .take() etc. are correctly typed
const doubled = range(1, 10).map(x => x * 2).take(5);
```

---

## TypeScript 5.7 (November 2024)

### Checks for Never-Initialized Variables
```typescript
// TS 5.7 detects variables that are never assigned:
function process(condition: boolean) {
  let result: string;

  if (condition) {
    result = "yes";
  }
  // No else! result could be uninitialized
  return result; // Error in TS 5.7
}
```

### Path Rewriting for Relative Imports
```typescript
// tsconfig.json:
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
    // ^ Rewrites .ts extensions in imports to .js
    // Important for native ESM without a bundler
  }
}
// import { foo } from './utils.ts'  becomes  import { foo } from './utils.js'
```

---

## Quick Reference: tsconfig for Modern Projects

### Angular Project (2025)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "incremental": true,
    "experimentalDecorators": false,
    "useDefineForClassFields": true
  }
}
```

### React/Vite Project (2025)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

### npm Library (2025)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "declaration": true,
    "isolatedDeclarations": true,
    "noEmit": false
  }
}
```

---

## Version Management Quick Reference

| Range | Meaning | Recommendation |
|-------|---------|----------------|
| `"5.7.0"` | Exactly this version | Maximum safety |
| `"~5.7.0"` | 5.7.x (patches only) | **Recommended for projects** |
| `"^5.0.0"` | 5.x.x (all minors) | Risky — behavioral changes |
| `"latest"` | Always newest | Never in production |
| `"next"` | Nightly build | Testing/reporting only |