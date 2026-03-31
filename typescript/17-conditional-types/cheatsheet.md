# Cheatsheet: Conditional Types

## Grundsyntax

```typescript
T extends U ? TrueType : FalseType
```

## infer — Typ-Extraktion

```typescript
T extends Promise<infer U> ? U : T          // Promise entpacken
T extends (...args: any[]) => infer R ? R : never  // Return Type
T extends (infer U)[] ? U : T               // Array-Element
T extends [infer F, ...infer R] ? F : never // Tuple erstes Element
```

## Distribution

```typescript
// Distributiv (Default bei nacktem Typparameter):
type ToArray<T> = T extends any ? T[] : never;
ToArray<string | number>  // string[] | number[]

// Nicht-distributiv ([T] Tuple-Wrapping):
type ToArrayND<T> = [T] extends [any] ? T[] : never;
ToArrayND<string | number>  // (string | number)[]

// never bei Distribution = never (leerer Union)
```

## Rekursion

```typescript
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
```

## Eingebaute Conditional Types

```typescript
ReturnType<T>    // = T extends (...args: any[]) => infer R ? R : never
Parameters<T>    // = T extends (...args: infer P) => any ? P : never
Awaited<T>       // Rekursives Promise-Unwrapping
Extract<T, U>    // = T extends U ? T : never (behalten)
Exclude<T, U>    // = T extends U ? never : T (entfernen)
NonNullable<T>   // = T extends null | undefined ? never : T
```

## Eselsbruecken

| Konzept | Merksatz |
|---------|---------|
| Conditional Type | "Ternary fuer Typen: extends statt > oder ==." |
| infer | "Platzhalter den TypeScript aus dem Pattern fuellt." |
| Distribution | "Nackter T + Union = einzeln ausgewertet." |
| [T] | "Tuple-Wrapping = Distribution aus." |
| never + Distribution | "Leerer Union = kein Member = never Ergebnis." |
| Rekursion | "Sich selbst aufrufen bis Terminierungsbedingung." |
