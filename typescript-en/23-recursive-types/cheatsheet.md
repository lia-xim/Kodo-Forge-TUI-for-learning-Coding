# Cheatsheet: Recursive Types in TypeScript

Quick reference for Lesson 23.

---

## Basics

| Concept | Description |
|---------|-------------|
| Recursive type | A type that references itself |
| Base case | `\| null`, `[]`, `never` — terminates the recursion |
| Lazy evaluation | TypeScript expands types only when needed |
| Direct recursion | `type X = { child: X \| null }` |
| Indirect recursion | `type A = B[]; type B = { items: A }` |

---

## Basic Recursive Types

```typescript
// LinkedList
type LinkedList<T> = { value: T; next: LinkedList<T> | null };

// Tree
type TreeNode<T> = { value: T; children: TreeNode<T>[] };

// Binary Search Tree
type BST<T> = { value: T; left: BST<T> | null; right: BST<T> | null };

// JSON
type JsonValue =
  | string | number | boolean | null
  | JsonValue[]
  | { [key: string]: JsonValue };
```

---

## Deep Operations

```typescript
// DeepPartial (with array handling)
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// DeepReadonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// DeepRequired
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends (infer U)[] | undefined
    ? DeepRequired<U>[]
    : T[K] extends object | undefined
      ? DeepRequired<NonNullable<T[K]>>
      : NonNullable<T[K]>;
};

// DeepMutable (removes readonly)
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends readonly (infer U)[]
    ? DeepMutable<U>[]
    : T[K] extends object ? DeepMutable<T[K]> : T[K];
};
```

---

## Recursive Conditional Types

```typescript
// Flatten (all levels)
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

// Flatten with depth limit
type MinusOne<N extends number> = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];
type FlatN<T, D extends number> =
  D extends 0 ? T
  : T extends readonly (infer U)[] ? FlatN<U, MinusOne<D>>
  : T;

// Paths (all dot-separated paths)
type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

// PathValue (value type at a path)
type PathValue<T, P extends string> =
  P extends `${infer H}.${infer R}`
    ? H extends keyof T ? PathValue<T[H], R> : never
    : P extends keyof T ? T[P] : never;

// Split (split string at delimiter)
type Split<S extends string, D extends string> =
  S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
```

---

## Type-Level Arithmetic

```typescript
// Tuple of N elements
type BuildTuple<N extends number, T extends unknown[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, unknown]>;

// Addition
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];

// Subtraction
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer R] ? R["length"] : never;
```

---

## Recursion Limits

| Situation | Limit |
|-----------|-------|
| Standard recursion | ~50 levels |
| Tail recursion (TS 4.5+) | ~1000 levels |
| Union members | Thousands (depends on breadth) |
| Compile flag | None — limit is hard-coded |

**Tail position = recursive call is the LAST thing in the conditional branch:**
```typescript
// ✅ Tail position:
type Good<T> = T extends X ? Good<...> : Result;

// ❌ NOT tail position:
type Bad<T> = T extends X ? [Good<...>][0] : Result;
```

---

## Error Messages

| Error message | Cause |
|--------------|-------|
| "Type alias circularly references itself" | Direct circularity (`type X = X \| Y`) |
| "Type instantiation is excessively deep" | Recursion limit (~50) reached |
| "Type produces a union type that is too complex" | Too many union members (wide objects) |

---

## Type-Safe deep-get

```typescript
function get<T extends object, P extends Paths<T> & string>(
  obj: T, path: P
): PathValue<T, P> {
  return path.split(".").reduce(
    (acc, key) => (acc as any)[key], obj as any
  ) as PathValue<T, P>;
}
```

---

## Decision Guide

| Use case | Recursive type? |
|----------|----------------|
| JSON data | ✅ Yes |
| Trees, menus | ✅ Yes |
| DeepPartial/DeepReadonly | ✅ Yes |
| Paths<T> on custom types | ✅ Usually yes |
| Type-level arithmetic | ⚠️ Only in libraries |
| Paths on huge types | ❌ Compile-time risk |
| Recursive string parsers | ❌ Better at runtime |