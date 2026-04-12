# Cheatsheet: Generics Basics

## Generic Functions

```typescript
// Basic syntax
function identity<T>(arg: T): T { return arg; }

// Inference (preferred):
const s = identity("hello"); // T = string

// Explicit (when necessary):
const arr = createArray<string>(); // T = string
```

---

## Multiple Type Parameters

```typescript
function pair<T, U>(a: T, b: U): [T, U] { return [a, b]; }
function map<T, U>(arr: T[], fn: (item: T) => U): U[] { ... }

const p = pair("Max", 30); // [string, number]
```

---

## Arrow Functions with Generics

```typescript
const identity = <T>(arg: T): T => arg;

// In .tsx files (React): Trailing comma or extends
const identity = <T,>(arg: T): T => arg;
const identity = <T extends unknown>(arg: T): T => arg;
```

---

## Generic Interfaces

```typescript
interface Box<T> {
  content: T;
  label: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Usage:
const box: Box<string> = { content: "Hi", label: "text" };
```

---

## Generic Type Aliases

```typescript
type Nullable<T> = T | null;
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
```

---

## Array<T> = T[]

```typescript
// Identical:
const a: number[] = [1, 2, 3];
const b: Array<number> = [1, 2, 3];
```

---

## Constraints (extends)

```typescript
// Minimum requirement:
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// With interface:
function printId<T extends HasId>(entity: T): void {
  console.log(entity.id); // Guaranteed by constraint
}

// Multiple constraints:
function save<T extends HasId & Serializable>(entity: T): void { ... }
```

---

## keyof Constraint

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const name = getProperty(user, "name"); // Precise type!
// getProperty(user, "invalid");         // Error!
```

---

## Default Type Parameters

```typescript
interface Container<T = string> { value: T; }

const a: Container = { value: "Hi" };          // T = string (default)
const b: Container<number> = { value: 42 };    // T = number

// Default + constraint:
interface Repo<T extends { id: number } = { id: number; name: string }> { ... }

// Order: defaults at the end!
interface Cache<K, V = string> { ... } // OK
// interface Cache<K = string, V> { ... } // Error!
```

---

## Naming Conventions

| Name | Meaning | Example |
|------|---------|---------|
| `T` | Type | `Array<T>`, `Box<T>` |
| `U` | Second type | `map<T, U>` |
| `K` | Key | `Record<K, V>`, `keyof T` |
| `V` | Value | `Map<K, V>` |
| `E` | Element/Error | `Result<T, E>` |
| `R` | Return | Return type |

---

## Common Patterns

```typescript
// API response
interface ApiResponse<T> { data: T; status: number; }

// Result type
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

// Event emitter
interface Emitter<TEvents extends Record<string, unknown>> {
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
}

// Repository
interface Repository<T extends { id: number }> {
  findById(id: number): T | null;
  save(entity: T): void;
}
```

---

## Rules of Thumb

| Rule | Explanation |
|------|-------------|
| Use T at least twice | Otherwise T is redundant (unknown suffices) |
| Prefer inference | Only explicit when necessary (no argument for T) |
| Keep constraints minimal | Only restrict what the function actually NEEDS |
| Defaults for libraries | Simple usage + flexibility when needed |

---

## Standard Library: Everything Generic

```typescript
Array<T>       // number[], string[]
Promise<T>     // Promise<string>, Promise<User>
Map<K, V>      // Map<string, number>
Set<T>         // Set<number>
Record<K, V>   // Record<string, unknown>
Partial<T>     // Partial<User>
Required<T>    // Required<Config>
Pick<T, K>     // Pick<User, "name" | "email">
Omit<T, K>     // Omit<User, "password">
```