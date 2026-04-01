# Cheatsheet: Recursive Types in TypeScript

Schnellreferenz fuer Lektion 23.

---

## Grundlagen

| Konzept | Beschreibung |
|---------|-------------|
| Rekursiver Typ | Ein Typ der sich selbst referenziert |
| Abbruchbedingung | `\| null`, `[]`, `never` — beendet die Rekursion |
| Lazy Evaluation | TypeScript entfaltet Typen erst bei Bedarf |
| Direkte Rekursion | `type X = { child: X \| null }` |
| Indirekte Rekursion | `type A = B[]; type B = { items: A }` |

---

## Grundlegende rekursive Typen

```typescript
// LinkedList
type LinkedList<T> = { value: T; next: LinkedList<T> | null };

// Baum
type TreeNode<T> = { value: T; children: TreeNode<T>[] };

// Binaerer Suchbaum
type BST<T> = { value: T; left: BST<T> | null; right: BST<T> | null };

// JSON
type JsonValue =
  | string | number | boolean | null
  | JsonValue[]
  | { [key: string]: JsonValue };
```

---

## Deep-Operationen

```typescript
// DeepPartial (mit Array-Handling)
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

// DeepMutable (entfernt readonly)
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends readonly (infer U)[]
    ? DeepMutable<U>[]
    : T[K] extends object ? DeepMutable<T[K]> : T[K];
};
```

---

## Rekursive Conditional Types

```typescript
// Flatten (alle Ebenen)
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

// Flatten mit Tiefenlimit
type MinusOne<N extends number> = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];
type FlatN<T, D extends number> =
  D extends 0 ? T
  : T extends readonly (infer U)[] ? FlatN<U, MinusOne<D>>
  : T;

// Paths (alle Punkt-getrennten Pfade)
type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

// PathValue (Wert-Typ an einem Pfad)
type PathValue<T, P extends string> =
  P extends `${infer H}.${infer R}`
    ? H extends keyof T ? PathValue<T[H], R> : never
    : P extends keyof T ? T[P] : never;

// Split (String an Trennzeichen aufteilen)
type Split<S extends string, D extends string> =
  S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
```

---

## Type-Level Arithmetik

```typescript
// Tuple aus N Elementen
type BuildTuple<N extends number, T extends unknown[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, unknown]>;

// Addition
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];

// Subtraktion
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer R] ? R["length"] : never;
```

---

## Rekursionslimits

| Situation | Limit |
|-----------|-------|
| Standard-Rekursion | ~50 Ebenen |
| Tail Recursion (TS 4.5+) | ~1000 Ebenen |
| Union-Mitglieder | Tausende (abhaengig von Breite) |
| Compile-Flag | Keines — Limit ist hart codiert |

**Tail Position = rekursiver Aufruf ist das LETZTE im Conditional-Zweig:**
```typescript
// ✅ Tail Position:
type Good<T> = T extends X ? Good<...> : Result;

// ❌ NICHT Tail Position:
type Bad<T> = T extends X ? [Good<...>][0] : Result;
```

---

## Fehlermeldungen

| Fehlermeldung | Ursache |
|--------------|---------|
| "Type alias circularly references itself" | Direkte Zirkularitaet (`type X = X \| Y`) |
| "Type instantiation is excessively deep" | Rekursionslimit (~50) erreicht |
| "Type produces a union type that is too complex" | Zu viele Union-Mitglieder (breite Objekte) |

---

## Typsicherer deep-get

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

## Entscheidungshilfe

| Anwendung | Rekursiver Typ? |
|-----------|----------------|
| JSON-Daten | ✅ Ja |
| Baeume, Menues | ✅ Ja |
| DeepPartial/DeepReadonly | ✅ Ja |
| Paths<T> auf eigenen Typen | ✅ Meist ja |
| Type-Level Arithmetik | ⚠️ Nur in Libraries |
| Paths auf riesigen Typen | ❌ Compile-Zeit-Risiko |
| Rekursive String-Parser | ❌ Besser zur Laufzeit |
