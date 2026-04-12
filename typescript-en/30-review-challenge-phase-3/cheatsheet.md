# Cheatsheet: Phase 3 Review (L21-L29)

## Classes & OOP (L21)
```typescript
class User {
  #secret: string;           // ES2022 private (runtime protection)
  private internal: string;  // TypeScript private (compile-time only)
  protected shared: string;  // Visible in subclasses
  public open: string;       // Visible everywhere
  constructor(s: string) { this.#secret = s; /* ... */ }
}
abstract class Shape { abstract area(): number; }
```

## Advanced Generics & Variance (L22)
```typescript
interface Producer<out T>  { get(): T; }           // Covariant: Dog → Animal
interface Consumer<in T>   { set(val: T): void; }  // Contravariant: Animal → Dog
interface Box<in out T>    { get(): T; set(v: T): void; } // Invariant
```

## Recursive Types (L23)
```typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
```

## Branded / Nominal Types (L24)
```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
function createUserId(id: string): UserId { return id as UserId; }
// "Parse, Don't Validate" — assign brand after validation
```

## Type-safe Error Handling (L25)
```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
function parseEmail(s: string): Result<Email, ValidationError> {
  if (!s.includes('@')) return { ok: false, error: { kind: 'validation', message: '...' } };
  return { ok: true, value: s as Email };
}
```

## Advanced Patterns (L26)
```typescript
// Phantom Types for State Machines:
class Document<State> { constructor(public title: string) {} }
function publish(doc: Document<Review>): Document<Published> { /* ... */ }
// publish(draftDoc) → compile error!
```

## Declaration Merging & Module Augmentation (L27)
```typescript
declare module 'express' {
  interface Request { user?: AuthUser; }
}
declare global { namespace NodeJS { interface ProcessEnv { API_KEY: string; } } }
export {};  // make file a module
```

## Decorators (L28)
```typescript
// Legacy (Angular): @Component({ selector: 'app-root' })
// Stage 3 (TC39): function log(target: any, ctx: ClassMethodDecoratorContext) { }
```

## tsconfig Deep Dive (L29)
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "moduleResolution": "bundler",
  "verbatimModuleSyntax": true,
  "noEmit": true
}
```
- `strict` = 11 flags | `noEmit` = type-check only | `bundler` = for Webpack/Vite

## Phase 3 Guiding Principle
**"Make Illegal States Unrepresentable"**
- Branded Types: prevent mix-ups
- Result Pattern: make errors visible
- Phantom Types: enforce state transitions
- Recursive Types: protect nested data
- tsconfig: enable maximum strictness