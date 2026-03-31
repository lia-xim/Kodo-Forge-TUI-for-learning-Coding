# Cheatsheet: Arrays & Tuples

> Schnellreferenz fuer Lektion 04. Zum Nachschlagen, nicht zum ersten Lernen.

---

## Array-Syntax im Vergleich

| Schreibweise         | Beispiel                    | Wann verwenden?                       |
|----------------------|-----------------------------|---------------------------------------|
| `T[]`                | `string[]`                  | Standard fuer einfache Typen          |
| `Array<T>`           | `Array<string>`             | Bei komplexen Union-Typen             |
| `readonly T[]`       | `readonly number[]`         | Unveraenderbare Arrays                |
| `ReadonlyArray<T>`   | `ReadonlyArray<number>`     | Alternative Readonly-Syntax           |

### Wann `Array<T>` statt `T[]`?

```typescript
// MEHRDEUTIG — ist das string ODER number[]?
let a: string | number[];

// KLAR — Array von string | number
let b: Array<string | number>;

// AUCH KLAR — mit Klammern
let c: (string | number)[];
```

### Array\<T\> ist ein generischer Typ

```typescript
// Array<T> ist in lib.es5.d.ts definiert:
interface Array<T> {
  length: number;
  push(...items: T[]): number;
  map<U>(fn: (value: T) => U): U[];
  filter(fn: (value: T) => boolean): T[];
  find(fn: (value: T) => boolean): T | undefined;
  // ...
}
// string[] === Array<string> — exakt derselbe Typ!
```

---

## Tuple-Syntax Referenz

| Konzept              | Syntax                                  | Beispiel                              |
|----------------------|-----------------------------------------|---------------------------------------|
| Basis-Tuple          | `[T1, T2, ...]`                         | `[string, number]`                    |
| Named Tuple          | `[label: T, ...]`                       | `[name: string, age: number]`         |
| Optional             | `[T1, T2?]`                             | `[string, number?]`                   |
| Rest-Ende            | `[T1, ...T2[]]`                         | `[string, ...number[]]`              |
| Rest-Mitte           | `[T1, ...T2[], T3]`                     | `[string, ...number[], boolean]`     |
| Readonly             | `readonly [T1, T2]`                     | `readonly [string, number]`           |
| Spread               | `[...Tuple1, ...Tuple2]`                | `[...Head, ...Tail]`                  |
| as const             | `[...] as const`                        | `[1, "hi"] as const`                  |

---

## Fundamentale Unterschiede: Array vs Tuple

```
  Eigenschaft       Array                Tuple
  ─────────────     ─────                ─────
  Laenge            variabel             fix (Compile-Zeit)
  Element-Typen     alle gleich/Union    pro Position definiert
  .length Typ       number               Literal (z.B. 3)
  Inferenz          Standard             NIE automatisch
  Index-Zugriff     immer gleicher Typ   positionsabhaengig
```

---

## Kovarianz bei Arrays

```typescript
// string ist Subtyp von string | number
// => string[] ist Subtyp von (string | number)[]  (Kovarianz)
const a: string[] = ["x"];
const b: (string | number)[] = a;  // OK
b.push(42);     // OK — aber a enthaelt jetzt auch 42!
// UNSOUND! readonly loest das Problem.
```

---

## Readonly: Erlaubte vs. Blockierte Methoden

### Erlaubt (lesen / neues Array erzeugen)

```
length    [index]    includes()    indexOf()
find()    findIndex()    filter()    map()
forEach()    some()    every()    reduce()
slice()    concat()    join()    flat()
flatMap()    entries()    keys()    values()
```

### Blockiert (mutieren)

```
push()    pop()    shift()    unshift()
sort()    reverse()    splice()    fill()
copyWithin()    [index] = value
```

---

## Haeufige Patterns

### useState-Style Rueckgabe

```typescript
function useCounter(init: number): [count: number, inc: () => void] {
  let count = init;
  return [count, () => { count++; }];
}
const [count, increment] = useCounter(0);
```

### Error-Handling (Go-Style)

```typescript
type Result<T> = [data: T, error: null] | [data: null, error: Error];

function parse(json: string): Result<unknown> {
  try { return [JSON.parse(json), null]; }
  catch (e) { return [null, e as Error]; }
}
```

### Union aus as const ableiten

```typescript
const ROLLEN = ["admin", "user", "gast"] as const;
type Rolle = (typeof ROLLEN)[number];
// => "admin" | "user" | "gast"
```

### as const + satisfies (TS 5.0+)

```typescript
interface Config { port: number; host: string }
const config = { port: 8080, host: "localhost" } as const satisfies Config;
// config.port ist Typ 8080 (Literal!) UND typgeprueft
```

### Spread fuer Funktionsargumente

```typescript
function log(msg: string, level: number): void { /* ... */ }
const args: [string, number] = ["Fehler", 3];
log(...args);
```

### Tuple-Elemente tauschen

```typescript
function swap<A, B>(t: [A, B]): [B, A] {
  return [t[1], t[0]];
}
```

### Type Predicate mit filter()

```typescript
const mixed: (string | number)[] = ["a", 1, "b"];
// FALSCH: const strs = mixed.filter(x => typeof x === "string"); // (string | number)[]
// RICHTIG:
const strs = mixed.filter((x): x is string => typeof x === "string"); // string[]
```

### Typsicherer Event-Emitter

```typescript
interface Events {
  click: [x: number, y: number];
  logout: [];
}
function emit<K extends keyof Events>(e: K, ...args: Events[K]): void { }
emit("click", 100, 200);
emit("logout");
```

---

## Variadic Tuple Types

```typescript
// Prepend
type Prepend<E, T extends unknown[]> = [E, ...T];
type R1 = Prepend<number, [string]>; // [number, string]

// Append
type Append<T extends unknown[], E> = [...T, E];
type R2 = Append<[string], number>; // [string, number]

// Concat
type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
type R3 = Concat<[string], [number]>; // [string, number]

// Head / Tail
type Head<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

// TupleToUnion
type TupleToUnion<T extends readonly unknown[]> = T[number];

// Length (Literal!)
type Length<T extends readonly unknown[]> = T["length"];
```

---

## noUncheckedIndexedAccess

```typescript
// tsconfig.json: "noUncheckedIndexedAccess": true

const arr: string[] = ["a"];
const val = arr[0]; // string | undefined  (nicht mehr string!)

// Tuple-Positionen sind NICHT betroffen:
const tup: [string, number] = ["a", 1];
const first = tup[0]; // string (kein | undefined!)
```

---

## Gotchas (Stolperfallen)

### 1. Array wird inferiert, nicht Tuple

```typescript
const p = [10, 20];        // number[] — KEIN Tuple!
const p2: [number, number] = [10, 20];  // Tuple
const p3 = [10, 20] as const;           // readonly [10, 20]
```

### 2. push auf mutable Tuples erlaubt

```typescript
const pair: [string, number] = ["a", 1];
pair.push(2);     // Kein Fehler!  pair ist jetzt ["a", 1, 2]
// Loesung: readonly verwenden
```

### 3. Spread verliert Tuple-Typ

```typescript
const tup: [string, number] = ["hi", 1];
const arr = [...tup]; // (string | number)[] — Tuple verloren!
```

### 4. readonly -> mutable geht nicht

```typescript
const ro: readonly string[] = ["a"];
// const rw: string[] = ro;  // FEHLER
const rw: string[] = [...ro]; // OK (Kopie)
```

### 5. Object.freeze ist shallow

```typescript
const arr = Object.freeze([{ name: "Alice" }]);
arr[0].name = "Bob"; // Kein Fehler — Objekte drin sind mutable!
```

### 6. Optionale Elemente nur am Ende

```typescript
type Ok   = [string, number?];       // ok
// type Err = [string?, number];      // FEHLER
```

### 7. Leere Arrays werden zu any[]

```typescript
const arr = [];           // any[] — schlecht!
const arr2: string[] = []; // string[] — gut!
```

### 8. filter() verengt nicht automatisch

```typescript
const arr: (string | null)[] = ["a", null];
const wrong = arr.filter(x => x !== null);     // (string | null)[] — NULL ist noch drin!
const right = arr.filter((x): x is string => x !== null); // string[]
```

### 9. Kovarianz-Mutation

```typescript
const strs: string[] = ["a"];
const wider: (string | number)[] = strs; // OK (Kovarianz)
wider.push(42);  // OK — aber strs hat jetzt eine Zahl!
// Loesung: readonly in Funktionsparametern
```

---

## Entscheidungsbaum

```
Brauchst du eine Sammlung von Werten?
  |
  +-- Alle gleichen Typs, variable Laenge?
  |     -> Array (string[], number[])
  |     |
  |     +-- Soll nicht veraendert werden?
  |           -> readonly string[]
  |
  +-- Feste Laenge, verschiedene Typen pro Position?
  |     -> Tuple ([string, number])
  |     |
  |     +-- Mehr als 3-4 Felder?
  |     |     -> Besser ein Object verwenden!
  |     |
  |     +-- Soll nicht veraendert werden?
  |     |     -> readonly [string, number]
  |     |
  |     +-- Brauchst du Literal-Typen?
  |           -> as const
  |
  +-- Feste Werte als Union-Typ?
  |     -> as const + indexed access
  |     -> ["a", "b", "c"] as const
  |     -> (typeof x)[number]
  |
  +-- Brauchst du Typ-Pruefung UND Literal-Typen?
        -> as const satisfies InterfaceName
```
