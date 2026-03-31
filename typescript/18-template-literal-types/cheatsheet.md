# Cheatsheet: Template Literal Types

## Grundsyntax
```typescript
type Greeting = `Hello, ${string}!`;
type Endpoint = `${HttpMethod} ${Path}`;  // Kartesisches Produkt
```

## String Utility Types
```typescript
Uppercase<"hello">    // "HELLO"
Lowercase<"HELLO">    // "hello"
Capitalize<"hello">   // "Hello"
Uncapitalize<"Hello"> // "hello"
```

## Pattern Matching mit infer
```typescript
type GetPrefix<T> = T extends `${infer P}_${string}` ? P : never;
type GetDomain<T> = T extends `${string}@${infer D}` ? D : never;
```

## Rekursive String-Manipulation
```typescript
type Split<S, D> = S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
type ReplaceAll<S, F, T> = S extends `${infer H}${F}${infer R}` ? ReplaceAll<`${H}${T}${R}`, F, T> : S;
type TrimLeft<S> = S extends ` ${infer R}` ? TrimLeft<R> : S;
```

## Event-Namen generieren
```typescript
type EventMap<T> = {
  [K in keyof T & string as `${K}Changed`]: { prev: T[K]; next: T[K] };
};
type OnHandlers<T> = {
  [K in keyof T & string as `on${Capitalize<K>}`]: (data: T[K]) => void;
};
```

## Route-Parameter extrahieren
```typescript
type ExtractParams<T> =
  T extends `${string}:${infer P}/${infer Rest}` ? P | ExtractParams<Rest> :
  T extends `${string}:${infer P}` ? P : never;
```

## Eselsbruecken
| Konzept | Merksatz |
|---------|---------|
| Capitalize | "Nur der ERSTE Buchstabe. Nicht alles!" |
| Union-Expansion | "Kartesisches Produkt: n x m Kombinationen." |
| string & K | "keyof kann number/symbol — Template braucht string." |
| infer in Strings | "Wie Regex-Gruppen, aber auf Type-Level." |
