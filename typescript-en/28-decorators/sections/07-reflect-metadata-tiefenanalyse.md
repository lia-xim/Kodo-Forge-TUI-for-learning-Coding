# Section 7: Reflect Metadata — Deep Analysis

> Estimated reading time: **10 minutes**
>
> Previous section: [06 - Practice: Angular and NestJS](./06-praxis-angular-nestjs.md)
> Next section: — (End of Lesson 28)

---

## What you'll learn here

- Why Angular's Dependency Injection **is not magic** — and how `emitDecoratorMetadata` explains the trick
- What the three automatically generated metadata keys `design:type`, `design:paramtypes`, and `design:returntype` mean
- How to **write, read, and delete** your own metadata using the Reflect API
- Why `emitDecoratorMetadata` is experimental and what the **Stage 3 alternative** brings

---

## Story: The Magic Behind @Injectable()
<!-- section:summary -->
You know it from your Angular project: you write `@Injectable()` above a service, declare `HttpClient` in the constructor — and Angular automatically delivers the right instance. But how does Angular know **what** to inject?

<!-- depth:standard -->
You know it from your Angular project: you write `@Injectable()` above a service, declare `HttpClient` in the constructor — and Angular automatically delivers the right instance. But how does Angular know **what** to inject?

```typescript
@Injectable()
class UserService {
  constructor(private http: HttpClient) {}
  // How does Angular know: "http needs an HttpClient instance"?
}
```

The obvious answer would be: Angular reads the source code. But that's not true — the TypeScript compiler removes all type annotations before runtime (Type Erasure, Section 1 of Lesson 2). At runtime there is no `HttpClient` anymore, only JavaScript.

> **Feature Origin Story: A Problem TypeScript Wanted to Solve Itself**
>
> In 2015, the Angular team and the TypeScript team worked closely together.
> Angular 2 was supposed to support Dependency Injection via constructor types —
> but TypeScript's Type Erasure made that impossible. The solution: TypeScript
> gets an **optional feature** that stores type information as JavaScript
> metadata before erasing it.
>
> The result was `emitDecoratorMetadata: true` in `tsconfig.json` — an
> experimental flag that instructs TypeScript not to simply erase type
> information, but to preserve it as runtime metadata.
> At the same time, there was no native browser standard for this, so the
> `reflect-metadata` polyfill was created — a library that implements a planned
> (but never finalized) Reflect extension of the web standard.
>
> Angular has been using this mechanism since 2016. NestJS followed shortly
> after. Both frameworks still depend on this experimental feature today.

The answer to the puzzle: TypeScript emits the type information as metadata **before** erasing it — and Angular reads it back at runtime.

---

<!-- /depth -->
## Setup: What You Need
<!-- section:summary -->
For this to work, two things are required:

<!-- depth:standard -->
For this to work, two things are required:

```typescript
// tsconfig.json — both options MUST be active:
{
  "compilerOptions": {
    "experimentalDecorators": true,   // Enable decorators (Sections 1-4)
    "emitDecoratorMetadata": true     // Emit type info as metadata
  }
}

// Application entry point (main.ts or similar):
import "reflect-metadata";  // Polyfill MUST be imported FIRST!
// npm install reflect-metadata

// Angular imports the polyfill automatically in polyfills.ts
// NestJS imports it in main.ts
// Custom projects: import at the very top of the main file
```

Without `reflect-metadata`, `Reflect.getMetadata(...)` would not exist — the polyfill provides the API.

---

<!-- /depth -->
## The Three Automatically Generated Metadata Keys
<!-- section:summary -->
When `emitDecoratorMetadata: true` is active, TypeScript automatically emits up to three metadata entries for **every decorated class or method**...

<!-- depth:standard -->
When `emitDecoratorMetadata: true` is active, TypeScript automatically emits up to three metadata entries for **every decorated class or method**:

```
"design:type"        The type of the property or parameter itself
"design:paramtypes"  Array of all constructor parameter types (as classes)
"design:returntype"  The return type of a decorated method
```

**Important:** These metadata entries are ONLY emitted when at least one decorator is present on the class, method, or property. No decorator — no emit.

---

<!-- /depth -->
## How Angular DI Uses the Mechanism
<!-- section:summary -->
Now the Angular magic becomes explainable. Let's look at what TypeScript actually compiles to in JavaScript:

<!-- depth:standard -->
Now the Angular magic becomes explainable. Let's look at what TypeScript actually compiles to in JavaScript:

```typescript annotated
// What you write:
@Injectable()
class UserService {
  constructor(
    private http: HttpClient,   // ← TypeScript remembers: HttpClient
    private logger: LogService  // ← TypeScript remembers: LogService
  ) {}
}

// What TypeScript generates as JavaScript output (simplified):
UserService = __decorate(
  [
    Injectable(),
    // ↓ THIS is what emitDecoratorMetadata emits automatically:
    __metadata("design:paramtypes", [HttpClient, LogService])
  ],
  UserService
);
// The constructor types are stored as class references!
// HttpClient and LogService exist at runtime as classes → no erasure

// Angular's DI then reads it like this:
const paramTypes = Reflect.getMetadata("design:paramtypes", UserService);
// → [HttpClient, LogService]

// Angular now has the tokens and can inject:
const httpInstance = injector.get(HttpClient);
const loggerInstance = injector.get(LogService);
new UserService(httpInstance, loggerInstance);
// ← THAT is the "magic" — in reality: a metadata lookup
```

> 🧠 **Explain to yourself:** Why does this mechanism only work with
> classes as parameter types, not with interfaces or primitive types?
>
> **Key points:** Classes exist at runtime as objects (no erasure) |
> Interfaces are completely erased (Type Erasure) — `design:paramtypes`
> could not store the type | Primitives like `string` or `number`
> would be stored as built-in constructors, not as tokens |
> That's why Angular's DI needs `@Inject(TOKEN)` for non-class tokens

---

<!-- /depth -->
## Experiment Box: Writing and Reading Custom Metadata
<!-- section:summary -->
The interesting thing about the Reflect API is that you can define your own metadata keys — independent of the `design:*` keys that TypeScript sets automatically...

<!-- depth:standard -->
The interesting thing about the Reflect API is that you can define your own metadata keys — independent of the `design:*` keys that TypeScript sets automatically.

```typescript
import "reflect-metadata";

// --- Custom metadata key for permissions ---
const PERMISSION_KEY = Symbol("permission");  // Symbol prevents key conflicts

function RequiresPermission(permission: string) {
  return function (target: any, methodName: string): void {
    Reflect.defineMetadata(PERMISSION_KEY, permission, target, methodName);
    // ← Writes: "This method requires permission X"
  };
}

function getRequiredPermission(instance: any, methodName: string): string | undefined {
  return Reflect.getMetadata(PERMISSION_KEY, Object.getPrototypeOf(instance), methodName);
  // ← Reads the metadata at runtime
}

// Usage:
class AdminController {
  @RequiresPermission("admin:read")
  getUsers(): void { /* ... */ }

  @RequiresPermission("admin:write")
  deleteUser(id: string): void { /* ... */ }

  listPublic(): void { /* no permission required */ }
}

// Example: Check before calling
function callWithAuth(instance: any, method: string, userRole: string): void {
  const required = getRequiredPermission(instance, method);
  if (required && userRole !== required) {
    throw new Error(`No permission: ${required} required`);
  }
  (instance as any)[method]();
}

const ctrl = new AdminController();
callWithAuth(ctrl, "getUsers", "admin:read");   // OK
callWithAuth(ctrl, "deleteUser", "user");        // throws Error
callWithAuth(ctrl, "listPublic", "guest");       // OK (no PERMISSION_KEY)
```

This pattern is exactly what NestJS's `@Roles()` decorator does internally — you've now rebuilt it from scratch.

> 💭 **Think about it:** Why does Angular read `design:paramtypes` on the **class itself**
> (`Reflect.getMetadata(..., UserService)`) and not on the prototype?
>
> **Answer:** On the class directly you get the **constructor parameters**.
> On the prototype you get the parameters of individual methods. Angular
> needs the constructor dependencies for DI — hence no `.prototype`.

---

> ⚡ **In your Angular project** you encounter the Reflect API indirectly all
> the time. Every time Angular instantiates a service, it reads `design:paramtypes`
> and resolves the dependencies. That's what makes Dependency Injection so
> powerful: it doesn't need to know the classes — the classes describe themselves
> through metadata.
>
> ```typescript
> // Angular's InjectionToken is the answer to the interface problem:
> const API_URL = new InjectionToken<string>('API_URL');
>
> @Injectable()
> class DataService {
>   constructor(
>     private http: HttpClient,        // ← Class: design:paramtypes stores HttpClient
>     @Inject(API_URL) private url: string  // ← no class type: @Inject provides the token manually
>   ) {}
> }
> // Without @Inject, Angular wouldn't know which token to use for 'string'
> ```

---

<!-- /depth -->
## Limitations and Warnings
<!-- section:summary -->
`emitDecoratorMetadata` has been "experimental" for years — and for good reason. There are important limitations:

<!-- depth:standard -->
`emitDecoratorMetadata` has been "experimental" for years — and for good reason. There are important limitations:

```typescript
// LIMITATION 1: Interfaces are erased — no metadata emit
interface ApiConfig { url: string; }

@Injectable()
class ConfigService {
  constructor(private config: ApiConfig) {}
  // design:paramtypes stores: Object (not ApiConfig!)
  // Interface type is not present at runtime → falls back to Object
}

// LIMITATION 2: Union types become Object
@Injectable()
class Broken {
  constructor(private val: string | number) {}
  // design:paramtypes: Object — union type cannot serve as a token
}

// LIMITATION 3: Optional types lose their information
@Injectable()
class Partial {
  constructor(private opt?: HttpClient) {}
  // design:paramtypes: HttpClient — the question mark disappears
  // Angular sees no difference from a required parameter
}
```

### Stage 3 Decorators and the New Metadata API

The Stage 3 decorators (Section 5 of this lesson) have no `emitDecoratorMetadata` support — this is a deliberate decision by the TC39 committee. Instead, there is a **separate TC39 proposal** for Decorator Metadata:

```typescript
// Stage 3 Decorator Metadata (TC39 Proposal — still experimental):
function Injectable(value: unknown, context: ClassDecoratorContext): void {
  context.metadata["injectable"] = true;
  // ← context.metadata is an object defined by the spec
  // NO Reflect.defineMetadata — a standalone API
}

// Access via Symbol.metadata:
const meta = UserService[Symbol.metadata];
console.log(meta?.["injectable"]); // true

// NO automatic design:paramtypes emitting!
// Frameworks must determine parameter types another way
// (e.g. explicit token lists or code generation)
```

**What this means for you:** Angular has already announced a long-term
migration to Stage 3 decorators. Until then, `emitDecoratorMetadata`
remains the standard in the Angular ecosystem. NestJS is planning similar
migrations. If you're building new custom decorator infrastructure today,
keep the design flexible enough to switch between both APIs later.

> 🧠 **Explain to yourself:** Why did the TC39 committee decide NOT to include
> automatic `design:paramtypes` metadata in the Stage 3 spec?
>
> **Key points:** Type Erasure is a core principle of TypeScript |
> Automatic emitting tightly couples TypeScript types to the runtime |
> This violates the Separation of Concerns (type system vs. runtime behavior) |
> Explicit tokens (like Angular's `InjectionToken`) are more transparent and
> safer | The new API gives frameworks more control over what and how

---

<!-- /depth -->
## What You've Learned

- **`emitDecoratorMetadata: true`** instructs TypeScript not to erase type information, but to emit it as JavaScript metadata before execution
- **`reflect-metadata`** is a polyfill that provides the `Reflect.defineMetadata / getMetadata` API — without it, the API does not exist
- TypeScript automatically emits **three keys**: `design:type` (property type), `design:paramtypes` (constructor/method parameters), `design:returntype` (return type)
- **Angular's DI** reads `design:paramtypes` to know which classes to inject into the constructor — no magic, pure metadata lookup
- Custom metadata with `Reflect.defineMetadata / getMetadata` allows the same pattern for your own infrastructure (guards, permissions, validation)
- **Limitations:** Interfaces, union types, and optional types lose precision when transferred into metadata
- **Stage 3 decorators** bring a new, standalone metadata API via `context.metadata` and `Symbol.metadata` — without automatic `design:*` emitting

**Core concept to remember:** `emitDecoratorMetadata` is the bridge between
TypeScript's compile-time types and the runtime. It's not a feature you use
directly day-to-day — but it explains why Angular's DI works and why interfaces
cannot be DI tokens. Anyone who understands this foundation can debug Angular
DI errors in seconds instead of hours.

---

> **Pause point** — This was the last section of Lesson 28.
> You've worked through decorators from the fundamentals all the way to the
> internal metadata infrastructure. Let the concepts sink in before moving on.
>
> **Lesson 28 complete.** Continue with Lesson 29.