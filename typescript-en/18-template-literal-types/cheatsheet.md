# Cheatsheet: Template Literal Types

## Basic Syntax
```typescript
type Greeting = `Hello, ${string}!`;
type Endpoint = `${HttpMethod} ${Path}`;  // Cartesian product
```

## String Utility Types
```typescript
Uppercase<"hello">    // "HELLO"
Lowercase<"HELLO">    // "hello"
Capitalize<"hello">   // "Hello"
Uncapitalize<"Hello"> // "hello"
```

## Pattern Matching with infer
```typescript
type GetPrefix<T> = T extends `${infer P}_${string}` ? P : never;
type GetDomain<T> = T extends `${string}@${infer D}` ? D : never;
```

## Recursive String Manipulation
```typescript
type Split<S, D> = S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
type ReplaceAll<S, F, T> = S extends `${infer H}${F}${infer R}` ? ReplaceAll<`${H}${T}${R}`, F, T> : S;
type TrimLeft<S> = S extends ` ${infer R}` ? TrimLeft<R> : S;
```

## Generating Event Names
```typescript
type EventMap<T> = {
  [K in keyof T & string as `${K}Changed`]: { prev: T[K]; next: T[K] };
};
type OnHandlers<T> = {
  [K in keyof T & string as `on${Capitalize<K>}`]: (data: T[K]) => void;
};
```

## Extracting Route Parameters
```typescript
type ExtractParams<T> =
  T extends `${string}:${infer P}/${infer Rest}` ? P | ExtractParams<Rest> :
  T extends `${string}:${infer P}` ? P : never;
```

## Memory Aids
| Concept | Mnemonic |
|---------|---------|
| Capitalize | "Only the FIRST letter. Not everything!" |
| Union expansion | "Cartesian product: n x m combinations." |
| string & K | "keyof can be number/symbol — Template requires string." |
| infer in strings | "Like regex groups, but at the type level." |