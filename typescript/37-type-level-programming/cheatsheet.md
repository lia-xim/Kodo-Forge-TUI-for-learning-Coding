# Cheatsheet: Type-Level Programming

Schnellreferenz fuer Lektion 37.

---

## Die drei Saeulen

```
1. Conditional Types  = if/else     → T extends U ? A : B
2. Rekursion          = Schleifen   → type F<T> = ... F<Next> ...
3. Mapped Types       = map()       → { [K in keyof T]: ... }
```

---

## Tuple-Length-Trick (Arithmetik)

```typescript
// Tuple mit N Elementen bauen:
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N ? Acc : BuildTuple<N, [...Acc, unknown]>;

// Addition:
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];

// Subtraktion:
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer R] ? R["length"] : never;

// Fixierte Array-Laenge:
type NTuple<T, N extends number, Acc extends T[] = []> =
  Acc["length"] extends N ? Acc : NTuple<T, N, [...Acc, T]>;
// NTuple<number, 3> = [number, number, number]
```

---

## String-Parsing

```typescript
// Split:
type Split<S extends string, D extends string> =
  S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];

// Replace (erstes Vorkommen):
type Replace<S extends string, From extends string, To extends string> =
  S extends `${infer B}${From}${infer A}` ? `${B}${To}${A}` : S;

// Trim:
type TrimLeft<S extends string> =
  S extends ` ${infer R}` ? TrimLeft<R> : S;

// URL-Parameter extrahieren:
type ExtractParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : P extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};
```

---

## Pattern Matching (infer)

```typescript
// Funktions-Zerlegung:
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
type ParamsOf<T> = T extends (...args: infer P) => any ? P : never;

// Tuple-Operationen:
type First<T extends unknown[]> = T extends [infer F, ...any[]] ? F : never;
type Last<T extends unknown[]> = T extends [...any[], infer L] ? L : never;
type Tail<T extends unknown[]> = T extends [any, ...infer R] ? R : [];

// infer mit Constraint (TS 4.7+):
type StringKeys<T> = keyof T extends infer K extends string ? K : never;
```

---

## Rekursive Typen

```typescript
// DeepReadonly:
type DeepReadonly<T> =
  T extends Function ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// DeepFlatten:
type DeepFlatten<T extends unknown[]> =
  T extends [infer F, ...infer R]
    ? F extends unknown[] ? [...DeepFlatten<F>, ...DeepFlatten<R>]
    : [F, ...DeepFlatten<R>]
    : [];

// PathOf (alle Pfade als Union):
type PathOf<T, Pre extends string = ""> =
  T extends object
    ? { [K in keyof T & string]: `${Pre}${K}` | PathOf<T[K], `${Pre}${K}.`> }[keyof T & string]
    : never;
```

---

## UnionToIntersection

```typescript
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
// A | B → A & B (nutzt kontravariante Parameter-Position)
```

---

## Tail-Call-Optimierung

```typescript
// SCHLECHT (nicht tail-recursive):
type ReverseNaive<T extends unknown[]> =
  T extends [infer F, ...infer R] ? [...ReverseNaive<R>, F] : [];

// GUT (tail-recursive mit Accumulator):
type Reverse<T extends unknown[], Acc extends unknown[] = []> =
  T extends [infer F, ...infer R] ? Reverse<R, [F, ...Acc]> : Acc;
```

---

## Wann Type-Level Programming?

| Situation | Empfehlung |
|---|---|
| Router-Parameter aus URL-Strings | Ja — hoher ROI |
| Query Builder mit Schema-Typen | Ja — verhindert echte Bugs |
| Config-Pfade (get(obj, "a.b.c")) | Ja — Autocomplete + Sicherheit |
| Library-APIs | Ja — Nutzer profitieren |
| Business-Logik | Nein — zu komplex, zu fragil |
| "Weil es cool ist" | Nein — KISS |

---

## Grenzen

| Grenze | Wert |
|---|---|
| Rekursionstiefe (tail-recursive) | ~1000 |
| Rekursionstiefe (nicht tail-recursive) | ~50 |
| Union-Mitglieder | ~100.000 |
| Fehlermeldung bei zu tiefer Rekursion | "Type instantiation is excessively deep" |
