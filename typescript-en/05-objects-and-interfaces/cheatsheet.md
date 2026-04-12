# Cheatsheet: Objects & Interfaces

## Object Type Literal

```typescript
let user: { name: string; age: number } = { name: "Max", age: 30 };
```

## Interface

```typescript
interface User {
  name: string;
  age: number;
  email?: string;           // Optional
  readonly id: number;      // Immutable
}
```

## Extending Interfaces

```typescript
// Single
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// Multiple
interface Trackable { id: string; }
interface TrackedDog extends Animal, Trackable { breed: string; }
```

## Index Signatures

```typescript
// Dynamic keys
interface Dict {
  [key: string]: number;
}

// With fixed properties (fixed type must be compatible!)
interface Config {
  name: string;
  [key: string]: string;   // All values must be string
}

// Record as alternative
type Dict = Record<string, number>;
type StatusMap = Record<"active" | "closed", boolean>;
```

## Structural Typing — Rules

```
1. TypeScript checks STRUCTURE, not NAMES
2. An object is compatible if it has AT LEAST all required properties
3. EXTRA properties are allowed on variable assignment
4. FRESH object literals trigger the Excess Property Check
```

## Excess Property Checking

```typescript
interface A { x: number; }

// ERROR -- fresh object literal
const a: A = { x: 1, y: 2 };         // y is not allowed

// OK -- via variable
const temp = { x: 1, y: 2 };
const b: A = temp;                     // No excess check

// OK -- type assertion
const c: A = { x: 1, y: 2 } as A;    // Bypass

// OK -- index signature
interface B { x: number; [k: string]: unknown; }
const d: B = { x: 1, y: 2 };          // Allowed via index sig
```

## Readonly

```typescript
// Property-level
interface Point {
  readonly x: number;
  readonly y: number;
}

// Utility type (shallow!)
type FrozenUser = Readonly<User>;

// CAUTION: readonly is SHALLOW!
interface Outer {
  readonly inner: { value: number };
}
const o: Outer = { inner: { value: 1 } };
// o.inner = ...;         // Error
o.inner.value = 99;       // NO error! Nested is still mutable!
```

## Optional vs. Undefined

```typescript
interface A { x?: number; }           // x may be absent
interface B { x: number | undefined; } // x must be present, value can be undefined

const a: A = {};                       // OK
const b: B = { x: undefined };         // OK, but {} would be an ERROR
```

## Destructuring with Types

```typescript
// Into variables
const { name, age }: { name: string; age: number } = obj;

// In function parameters
function greet({ name, age }: { name: string; age: number }): void { ... }
```

## Interface vs Type Alias

```
Interface:                    Type Alias:
- Object structures           - Unions (A | B)
- API contracts               - Intersections (A & B)
- Declaration merging         - Mapped/Conditional Types
- extends syntax              - Primitive aliases
                              - Tuples
```

## Declaration Merging

```typescript
// Only with interface!
interface Window {
  myCustomProp: string;
}
// Extends the global Window interface
```

## Nested Objects

```typescript
interface Address {
  street: string;
  city: string;
}

interface User {
  name: string;
  address: Address;           // Nested
  contacts: {                 // Inline nested
    phone?: string;
    email: string;
  };
}
```

## Intersection Types (&)

```typescript
// Combining types: result must have ALL properties
type A = { x: number };
type B = { y: string };
type C = A & B;   // { x: number; y: string }

// Compatible properties are narrowed:
type D = { value: string | number };
type E = { value: number };
type F = D & E;   // { value: number }

// Incompatible properties become never:
type G = { x: number };
type H = { x: string };
type I = G & H;   // { x: never } -- cannot be instantiated!

// In practice: composition pattern
type Identifiable = { id: string };
type Timestamped = { createdAt: Date; updatedAt: Date };
type User = Identifiable & Timestamped & { name: string; email: string };
```

## Utility Types for Objects

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Partial<T> -- all properties optional
type UpdateDto = Partial<User>;
// { id?: string; name?: string; email?: string; password?: string }

// Required<T> -- all properties mandatory
type StrictUser = Required<User>;

// Pick<T, K> -- only specific properties
type PublicUser = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit<T, K> -- remove specific properties
type CreateDto = Omit<User, "id">;
// { name: string; email: string; password: string }

// Combination: Pick + Partial
type PatchDto = Partial<Pick<User, "name" | "email">>;
// { name?: string; email?: string }
```

## Discriminated Unions (Preview)

```typescript
// Objects with a shared 'type' property:
interface SuccessResult { success: true; data: string; }
interface ErrorResult { success: false; error: string; }
type Result = SuccessResult | ErrorResult;

function handle(r: Result) {
  if (r.success) {
    r.data;   // TS knows: SuccessResult
  } else {
    r.error;  // TS knows: ErrorResult
  }
}
```

## Useful Patterns

```typescript
// Enforce empty object
type EmptyObject = Record<string, never>;

// At least one property
type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

// Make optional fields required
type Required<T> = { [K in keyof T]-?: T[K] };

// API response wrapper
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Config with defaults
const DEFAULTS: Readonly<Config> = { /* ... */ };
function createConfig(overrides: Partial<Config>): Config {
  return { ...DEFAULTS, ...overrides };
}

// Readonly array (not just the reference!)
interface SafeList {
  readonly items: readonly string[];  // Both reference AND contents are readonly
}
```