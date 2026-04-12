# Section 5: Common Migration Problems and Solutions

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Declaration Files for Legacy Code](./04-declaration-files-fuer-legacy.md)
> Next section: [06 - Practice: Angular and React Migration](./06-praxis-framework-migration.md)

---

## What you'll learn here

- The **10 most common errors** in JS→TS migrations and how to solve them
- Why **dynamic property access** is the single biggest problem
- How to resolve **CommonJS/ESM conflicts**
- Strategies for **this-binding** and **class migration**

---

## Background: Why do migrations fail?

> **Origin Story: The failed migration**
>
> A mid-sized company started migrating a 300-file React app from JavaScript
> to TypeScript in 2020. After 3 months, the project was cancelled. The
> reason: they enabled `strict: true` on day 1 and had 4,000+ errors.
> Instead of proceeding incrementally, they tried to fix all errors at once —
> and collapsed under the weight.
>
> The lesson: migrations don't fail because of TypeScript. They fail because
> of overly aggressive settings, poor prioritization, and the attempt to
> make everything perfect all at once.

Most migration problems fall into a few categories. Once you know
them, you can solve them systematically.

---

## Problem 1: Dynamic Property Access

The most common problem — JavaScript allows dynamic properties,
TypeScript does not:

```typescript annotated
// JavaScript (works):
const obj = {};
obj.name = "Max";           // Property is created dynamically
obj["email"] = "a@b.com";   // Bracket notation likewise
obj[someKey] = someValue;    // Dynamic key

// TypeScript (error):
const obj = {};
obj.name = "Max";
// ^ ERROR: Property 'name' does not exist on type '{}'

// Fix 1: Define type upfront
const obj: { name?: string; email?: string } = {};
obj.name = "Max";  // OK

// Fix 2: Record for dynamic keys
const obj: Record<string, string> = {};
obj.name = "Max";  // OK
obj[someKey] = someValue;  // OK

// Fix 3: Index Signature
interface DynamicObj {
  [key: string]: unknown;
  name?: string;  // Known properties explicitly
}
```

> 🧠 **Explain it to yourself:** Why is `Record<string, any>` a worse solution than `Record<string, unknown>`? What do you lose with `any`?
> **Key points:** any disables type-checking entirely | unknown forces a check before use | Record<string, any> is like having no TypeScript | Record<string, unknown> is safe + flexible

---

## Problem 2: CommonJS vs. ES Modules

JavaScript projects often mix CommonJS and ES Module syntax:

```typescript annotated
// CommonJS (Node.js standard until recently):
const express = require("express");
module.exports = { router };
module.exports.handler = function() {};

// TypeScript migration:
import express from "express";
// ^ ERROR: Module has no default export
// Fix: esModuleInterop: true in tsconfig.json

import * as express from "express";
// ^ Alternative without esModuleInterop

// module.exports → export
export { router };
export function handler() {}

// Trickier case: module.exports = function()
// module.exports = function createApp() { ... }
// → export default function createApp() { ... }
// CAUTION: Default exports change the import syntax!
```

```typescript annotated
// tsconfig.json for mixed projects:
{
  "compilerOptions": {
    "esModuleInterop": true,
    // ^ Allows: import express from "express"
    // ^ Instead of: import * as express from "express"
    // ^ Generates __importDefault helper

    "allowSyntheticDefaultImports": true,
    // ^ Allows default imports from modules without a default export
    // ^ Type-level only — does not change the generated code

    "moduleResolution": "bundler"
    // ^ Modern: understands the package.json "exports" field
    // ^ Recommended for projects with a bundler (Vite, webpack, esbuild)
  }
}
```

> 💭 **Think about it:** Why didn't TypeScript have `esModuleInterop` enabled
> by default from the start? Why is it an option you have to turn on?
>
> **Answer:** Backwards compatibility. Older TypeScript projects already used
> `import * as`. esModuleInterop changes the generated code — that would break
> existing projects. That's why it's opt-in. New projects should ALWAYS enable it.

---

## Problem 3: this-Binding

JavaScript's `this` is notoriously flexible — TypeScript makes it strict:

```typescript annotated
// JavaScript — this is dynamic:
class EventHandler {
  constructor() {
    this.name = "Handler";
  }
  handle() {
    console.log(this.name);  // What is 'this'? Depends...
  }
}

const handler = new EventHandler();
button.addEventListener("click", handler.handle);
// ^ 'this' is NOT handler, but the button element!
// ^ In JavaScript: silent bug. In TypeScript with noImplicitThis: ERROR

// Fix 1: Arrow Function (no own this)
class EventHandler {
  name = "Handler";
  handle = () => {
    // ^ Arrow function binds this to the instance
    console.log(this.name);  // this is always EventHandler
  };
}

// Fix 2: bind() in the constructor
class EventHandler {
  name = "Handler";
  constructor() {
    this.handle = this.handle.bind(this);
    // ^ Explicit binding — TypeScript understands this
  }
  handle() {
    console.log(this.name);
  }
}
```

---

## Problem 4: Implicit any-Arrays

```typescript annotated
// JavaScript pattern that causes problems in TypeScript:
const items = [];
// ^ Type: any[] (implicitly any!)
items.push("hello");
items.push(42);
// ^ Mixed array — normal in JS, problematic in TS

// Fix 1: Annotate the type
const items: string[] = [];
items.push("hello");  // OK
items.push(42);        // ERROR!

// Fix 2: Union type when mixed is intentional
const items: (string | number)[] = [];
items.push("hello");  // OK
items.push(42);        // OK

// Fix 3: Initialize immediately (inference)
const items = ["hello", "world"];
// ^ Type: string[] (inferred from content)
```

---

## Problem 5: Loosely Typed Functions

```typescript annotated
// JavaScript: functions accept anything
function process(callback) {
  callback({ data: "test" });
}

// TypeScript with noImplicitAny: ERROR
// Fix: Define callback type
function process(callback: (result: { data: string }) => void) {
  callback({ data: "test" });
}

// Or with a generic callback:
function process<T>(callback: (result: T) => void, data: T) {
  callback(data);
}
```

> ⚡ **Framework reference (Angular):** In Angular projects, loosely typed
> callbacks are especially problematic with event handlers:
>
> ```typescript
> // BEFORE (JavaScript style):
> onUserSelect(event) {  // event is 'any'
>   this.selectedUser = event.detail;
> }
>
> // AFTER (TypeScript):
> onUserSelect(event: CustomEvent<User>) {
>   this.selectedUser = event.detail;  // Type: User
> }
> ```

---

## Problems 6–10: Further Common Issues

```typescript annotated
// Problem 6: JSON.parse() returns 'any'
const data = JSON.parse(jsonString);
// ^ Type: any — TypeScript cannot statically analyse JSON
// Fix: Type assertion or validation
const data = JSON.parse(jsonString) as Config;       // Unsafe but quick
const data = configSchema.parse(JSON.parse(jsonString)); // Safe with zod

// Problem 7: Object.keys() returns string[]
const obj: Config = { host: "localhost", port: 3000 };
Object.keys(obj).forEach(key => {
  console.log(obj[key]);
  // ^ ERROR: Element implicitly has an 'any' type
  // ^ Object.keys() returns string[], not (keyof Config)[]
});
// Fix: Explicit cast
(Object.keys(obj) as (keyof Config)[]).forEach(key => {
  console.log(obj[key]);  // OK
});

// Problem 8: Third-party events (e.g. Socket.io)
// socket.on("message", (data) => { ... })
// ^ data is 'any' — a typical source of untyped data
// Fix: Define an event map

// Problem 9: Mutable objects from configuration
// const config = require("./config.json");
// Fix: import config from "./config.json" + resolveJsonModule: true

// Problem 10: Global augmentation
// jQuery, Lodash as global variables
// Fix: declare global (see Section 4)
```

> 🧪 **Experiment:** Test the Object.keys problem:
>
> ```typescript
> interface User { name: string; age: number; }
> const user: User = { name: "Max", age: 30 };
>
> // Why does Object.keys(user) return string[] instead of ("name" | "age")[]?
> Object.keys(user).forEach(key => {
>   // Try: user[key] — what happens?
>   // Try: user[key as keyof User] — what happens?
> });
>
> // Answer: TypeScript is conservative. A User object COULD
> // have additional properties (structural type system!).
> // That's why string[] is technically correct, even if it's annoying.
> ```
>
> This is not a bug — it's a deliberate design decision.

---

## What you've learned

- **Dynamic properties** are the #1 problem — solve them with Record or Index Signatures
- **CommonJS/ESM conflicts** are resolved with `esModuleInterop` and `moduleResolution: bundler`
- **this-binding** in classes is fixed with arrow functions or bind()
- **JSON.parse and Object.keys** return `any`/`string[]` — by deliberate design
- Migrations fail because of **overly aggressive settings**, not because of TypeScript

**Core concept to remember:** Most migration problems fall into 5–6 categories. Once you know these patterns, you'll solve 80% of errors mechanically. The remaining 20% require thinking about the data structure — and that is precisely the value of TypeScript.

---

> **Pause point** — Good moment for a break. You now know the most
> common stumbling blocks.
>
> Continue with: [Section 06: Practice — Angular and React Migration](./06-praxis-framework-migration.md)