# Cheatsheet: Conditional Types

## Basic Syntax

```typescript
T extends U ? TrueType : FalseType
```

## infer — Type Extraction

```typescript
T extends Promise<infer U> ? U : T          // Unwrap Promise
T extends (...args: any[]) => infer R ? R : never  // Return Type
T extends (infer U)[] ? U : T               // Array element
T extends [infer F, ...infer R] ? F : never // First tuple element
```

## Distribution

```typescript
// Distributive (default with naked type parameter):
type ToArray<T> = T extends any ? T[] : never;
ToArray<string | number>  // string[] | number[]

// Non-distributive ([T] tuple wrapping):
type ToArrayND<T> = [T] extends [any] ? T[] : never;
ToArrayND<string | number>  // (string | number)[]

// never in distribution = never (empty union)
```

## Recursion

```typescript
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
```

## Built-in Conditional Types

```typescript
ReturnType<T>    // = T extends (...args: any[]) => infer R ? R : never
Parameters<T>    // = T extends (...args: infer P) => any ? P : never
Awaited<T>       // Recursive Promise unwrapping
Extract<T, U>    // = T extends U ? T : never (keep)
Exclude<T, U>    // = T extends U ? never : T (remove)
NonNullable<T>   // = T extends null | undefined ? never : T
```

## Memory Aids

| Concept | Mnemonic |
|---------|---------|
| Conditional Type | "Ternary for types: extends instead of > or ==." |
| infer | "A placeholder TypeScript fills from the pattern." |
| Distribution | "Naked T + union = evaluated individually." |
| [T] | "Tuple wrapping = distribution off." |
| never + Distribution | "Empty union = no member = never result." |
| Recursion | "Call itself until termination condition." |