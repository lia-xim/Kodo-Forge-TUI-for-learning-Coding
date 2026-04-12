# Cheatsheet: Utility Types

## Modifier Types

```typescript
// Partial — all properties optional
Partial<{ name: string; age: number }>
// { name?: string; age?: number }

// Required — all properties required
Required<{ name?: string; age?: number }>
// { name: string; age: number }

// Readonly — all properties readonly (SHALLOW!)
Readonly<{ name: string; age: number }>
// { readonly name: string; readonly age: number }
```

---

## Object Transformation

```typescript
// Pick — select properties
Pick<User, "id" | "name">
// { id: number; name: string }

// Omit — exclude properties (NOT type-safe!)
Omit<User, "password">
// { id: number; name: string; email: string }

// StrictOmit — type-safe alternative
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// Record — type-safe dictionary
Record<"admin" | "user", string[]>
// { admin: string[]; user: string[] }
```

---

## Union Manipulation

```typescript
// Exclude — remove members
Exclude<"a" | "b" | "c", "a">      // "b" | "c"

// Extract — keep members
Extract<"a" | "b" | "c", "a" | "b"> // "a" | "b"

// NonNullable — remove null and undefined
NonNullable<string | null | undefined> // string
```

---

## Function Types

```typescript
function myFunc(a: string, b: number): boolean { ... }

ReturnType<typeof myFunc>      // boolean
Parameters<typeof myFunc>      // [a: string, b: number]
Parameters<typeof myFunc>[0]   // string (first parameter)

// Async functions:
async function fetchData() { return { x: 1 }; }

ReturnType<typeof fetchData>          // Promise<{ x: number }>
Awaited<ReturnType<typeof fetchData>> // { x: number }

// Classes:
ConstructorParameters<typeof MyClass> // constructor parameters
InstanceType<typeof MyClass>          // instance type
```

---

## Custom Utility Types

```typescript
// DeepPartial — recursively optional
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

// DeepReadonly — recursively readonly
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

// Mutable — remove readonly
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// DeepRequired — recursively required
type DeepRequired<T> = T extends (infer U)[]
  ? DeepRequired<U>[]
  : T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;
```

---

## Composition Patterns

```typescript
// PartialExcept — K required, rest optional
type PartialExcept<T, K extends keyof T> =
  Pick<T, K> & Partial<Omit<T, K>>;

// RequireKeys — make K required
type RequireKeys<T, K extends keyof T> =
  Omit<T, K> & Required<Pick<T, K>>;

// Create input — without server-generated fields
type CreateInput = Omit<Entity, "id" | "createdAt" | "updatedAt">;

// Update input — id required, rest optional
type UpdateInput = Pick<Entity, "id"> & Partial<Omit<Entity, "id">>;

// Form state — all optional + error map
type FormState = Partial<FormFields>;
type FormErrors = Partial<Record<keyof FormFields, string>>;

// View model — specific fields, readonly
type ViewModel = Readonly<Pick<Entity, "id" | "name" | "status">>;
```

---

## Modifier Syntax

```typescript
// + adds modifier (default):
{ [P in keyof T]+?: T[P] }    // add optional
{ +readonly [P in keyof T]: T[P] }  // add readonly

// - removes modifier:
{ [P in keyof T]-?: T[P] }    // remove optional (= Required)
{ -readonly [P in keyof T]: T[P] }  // remove readonly (= Mutable)
```

---

## Quick Reference

| Utility Type | Effect | Typical Use |
|---|---|---|
| `Partial<T>` | All props optional | Update/patch operations |
| `Required<T>` | All props required | Validated data, resolved defaults |
| `Readonly<T>` | All props readonly (shallow!) | Immutable params, state |
| `Pick<T, K>` | Select K | API responses, view models |
| `Omit<T, K>` | Remove K (NOT type-safe!) | Create input |
| `Record<K, V>` | Dictionary with K keys | Lookup tables, config maps |
| `Exclude<T, U>` | Remove union members | Type filtering |
| `Extract<T, U>` | Keep union members | Type selection |
| `NonNullable<T>` | Remove null/undefined | Guaranteed values |
| `ReturnType<T>` | Extract return type | Type inference |
| `Parameters<T>` | Parameter tuple | Wrapper functions |
| `Awaited<T>` | Unwrap promise | Async type extraction |