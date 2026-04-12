# Cheatsheet: Phase 2 Review (L11-L19)

## Type Narrowing (L11-L12)
```typescript
// typeof, instanceof, in, Discriminated Unions
type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };
function area(s: Shape) {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;  // TypeScript knows r
    case 'rect': return s.w * s.h;             // TypeScript knows w, h
  }
}
```

## Generics (L13-L15)
```typescript
function identity<T>(x: T): T { return x; }
function getLength<T extends { length: number }>(x: T): number { return x.length; }
type Partial<T> = { [K in keyof T]?: T[K] };  // Utility Type
```

## Mapped Types (L16)
```typescript
{ [K in keyof T]: T[K] }                          // Copy
{ [K in keyof T]?: T[K] }                         // Partial
{ -readonly [K in keyof T]: T[K] }                 // Mutable
{ [K in keyof T as `get${Capitalize<K>}`]: () => T[K] }  // Key Remapping
{ [K in keyof T as T[K] extends string ? K : never]: T[K] }  // Filtering
```

## Conditional Types (L17)
```typescript
T extends U ? X : Y                    // Ternary for types
T extends Promise<infer U> ? U : T     // infer extracts
T extends any ? T[] : never            // Distributive
[T] extends [any] ? T[] : never        // Non-distributive
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;  // Recursive
```

## Template Literal Types (L18)
```typescript
type Getter = `get${Capitalize<string & K>}`;
type Split<S, D> = S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
type ExtractParams<T> = T extends `${string}:${infer P}` ? P : never;
```

## Modules & Declarations (L19)
```typescript
import type { User } from './types';           // Type-only
declare module 'express' { interface Request { user?: User } }  // Augmentation
declare global { namespace NodeJS { interface ProcessEnv { ... } } }
export {};  // Makes file a module
```

## The Triumvirate: Mapped + Conditional + Template Literal
```typescript
type EventMap<T> = {
  [K in keyof T & string as `${K}Changed`]:    // Template Literal (L18)
    T[K] extends object                         // Conditional (L17)
      ? { prev: T[K]; next: T[K] }
      : T[K];
};  // All in one Mapped Type (L16)
```