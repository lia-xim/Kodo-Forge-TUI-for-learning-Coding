# Sektion 4: Pattern Matching mit Conditional Types und infer

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - String-Parsing auf Type-Level](./03-string-parsing-auf-type-level.md)
> Naechste Sektion: [05 - Recursive Type Challenges](./05-recursive-type-challenges.md)

---

## Was du hier lernst

- Wie **Pattern Matching** auf Type-Level funktioniert — tiefes Verstaendnis von `infer`
- **Mehrfaches `infer`** in einem einzigen Conditional Type
- **`infer` mit Constraints**: `infer X extends string` (seit TypeScript 4.7)
- Fortgeschrittene Patterns: Type Unpacking, Function Decomposition, Promise Unwrapping

---

## Pattern Matching: Die Kernidee

In Sprachen wie Rust oder Haskell ist Pattern Matching ein zentrales
Feature: Du beschreibst die **Form** eines Werts, und die Sprache
zerlegt ihn fuer dich. TypeScript hat dasselbe auf Type-Level:

```typescript annotated
// Pattern Matching auf einen Funktionstyp:
type DecomposeFunction<T> =
  T extends (first: infer A, ...rest: infer B) => infer R
    // ^ Pattern: "Etwas das aussieht wie eine Funktion"
    // ^ infer A: erster Parameter
    // ^ infer B: restliche Parameter als Tuple
    // ^ infer R: Rueckgabetyp
    ? { firstParam: A; restParams: B; returnType: R }
    : never;

type D = DecomposeFunction<(name: string, age: number, active: boolean) => void>;
// ^ { firstParam: string; restParams: [age: number, active: boolean]; returnType: void }
```

> 📖 **Hintergrund: infer als Pattern-Variable**
>
> Das Keyword `infer` wurde in TypeScript 2.8 eingefuehrt (2018),
> zusammen mit Conditional Types. Es war inspiriert von Pattern
> Matching in ML-Sprachen (OCaml, F#) — wo du Werte mit Patterns
> "destrukturierst". In TypeScript's Fall ist `infer` eine
> **Typ-Variable die zur Compilezeit gebunden wird**. Der Compiler
> versucht den Typ so zu "matchen" dass die infer-Variablen
> konsistent belegt werden. Das ist im Grunde **Unifikation** —
> derselbe Algorithmus den auch Prolog und Haskell's Typchecker
> verwenden.

---

## Mehrfaches infer: Komplexe Destrukturierung

Du kannst beliebig viele `infer`-Variablen in einem Pattern verwenden:

```typescript annotated
// Zerlege ein Promise<Result<T, E>> in seine Teile:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type UnwrapPromiseResult<T> =
  T extends Promise<infer Inner>           // Ist es ein Promise?
    ? Inner extends Result<infer V, infer E>  // Enthaelt es ein Result?
      ? { value: V; error: E }              // Beide extrahiert!
      : { value: Inner; error: never }      // Promise ohne Result
    : never;

type A = UnwrapPromiseResult<Promise<Result<string, Error>>>;
// ^ { value: string; error: Error }

type B = UnwrapPromiseResult<Promise<number>>;
// ^ { value: number; error: never }
```

### infer mit Constraints (TypeScript 4.7+)

Seit TS 4.7 kannst du `infer`-Variablen einschraenken:

```typescript annotated
// Extrahiere nur string-Keys aus einem Objekt:
type StringKeyOf<T> =
  keyof T extends infer K extends string
    // ^ K wird inferiert UND muss string sein
    ? K
    : never;

type Keys = StringKeyOf<{ name: string; age: number; 0: boolean }>;
// ^ "name" | "age" (0 ist number, wird ausgeschlossen)

// Extrahiere den Event-Typ aus einem Handler:
type EventType<Handler> =
  Handler extends (event: infer E extends Event) => void
    // ^ E muss ein Event sein
    ? E
    : never;

type Click = EventType<(event: MouseEvent) => void>;
// ^ MouseEvent
type NotAnEvent = EventType<(x: string) => void>;
// ^ never (string extends Event ist false)
```

> 🧠 **Erklaere dir selbst:** Was ist der Vorteil von
> `infer K extends string` gegenueber `infer K` gefolgt von
> `K extends string ? K : never`? Gibt es einen semantischen
> Unterschied?
> **Kernpunkte:** Kein semantischer Unterschied, aber kuerzerer Code |
> Der Constraint wird direkt bei der Inferenz geprueft | Bessere
> Fehlermeldungen vom Compiler | Weniger verschachtelte Conditional Types

---

## Fortgeschrittene Patterns

### Pattern 1: Rekursives Unwrapping

```typescript annotated
// Entpacke beliebig tief verschachtelte Promises:
type DeepAwaited<T> =
  T extends Promise<infer Inner>  // Ist es ein Promise?
    ? DeepAwaited<Inner>          // Ja → rekursiv weitermachen
    : T;                           // Nein → Basis-Typ gefunden

type D1 = DeepAwaited<Promise<Promise<Promise<string>>>>;
// ^ string (drei Schichten entfernt)

// Das ist im Grunde was Awaited<T> macht (seit TS 4.5):
type D2 = Awaited<Promise<Promise<string>>>;
// ^ string
```

### Pattern 2: Tuple-Operationen

```typescript annotated
// Erstes und letztes Element eines Tuples:
type First<T extends unknown[]> =
  T extends [infer F, ...unknown[]] ? F : never;

type Last<T extends unknown[]> =
  T extends [...unknown[], infer L] ? L : never;

// Tuple ohne erstes Element (Tail):
type Tail<T extends unknown[]> =
  T extends [unknown, ...infer Rest] ? Rest : [];

// Tuple ohne letztes Element (Init):
type Init<T extends unknown[]> =
  T extends [...infer Rest, unknown] ? Rest : [];

type F = First<[1, 2, 3]>;   // 1
type L = Last<[1, 2, 3]>;    // 3
type T = Tail<[1, 2, 3]>;    // [2, 3]
type I = Init<[1, 2, 3]>;    // [1, 2]
```

### Pattern 3: Objekt-Transformation

```typescript annotated
// Extrahiere alle Methoden eines Objekts:
type MethodsOf<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
  // ^ Key Remapping (as): Behalte nur Keys deren Wert eine Funktion ist
};

interface UserService {
  name: string;
  getUser(id: number): Promise<User>;
  deleteUser(id: number): Promise<void>;
  readonly version: number;
}

type Methods = MethodsOf<UserService>;
// ^ { getUser(id: number): Promise<User>; deleteUser(id: number): Promise<void> }
```

> ⚡ **Framework-Bezug:** Angular's `inject()` nutzt intern
> Pattern Matching um den Typ aus dem `InjectionToken<T>` zu
> extrahieren: `inject(HttpClient)` gibt `HttpClient` zurueck
> weil der Compiler den Typ aus dem Class-Constructor-Parameter
> inferiert. React's `useContext` macht dasselbe mit dem
> `Context<T>`-Typ. Beide nutzen `infer` unter der Haube.

> 💭 **Denkfrage:** Warum ist Pattern Matching auf Type-Level
> maechtigerals einfache Typ-Constraints (`T extends SomeType`)?
> Was kann Pattern Matching, was Constraints nicht koennen?
>
> **Antwort:** Constraints pruefen nur ob ein Typ "passt". Pattern
> Matching kann den Typ **zerlegen** und Teile extrahieren. Der
> Unterschied ist wie `instanceof` (prueft) vs Destructuring
> (prueft und extrahiert). `infer` ist das Destructuring des
> Typsystems.

---

## Experiment: Event-System mit Pattern Matching

Baue ein typsicheres Event-System das Event-Namen zu Payloads mappt:

```typescript
// Event-Map definiert welche Events welche Daten tragen:
interface EventMap {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "item:added": { itemId: string; quantity: number };
}

// Extrahiere den Namespace aus einem Event-Namen:
type EventNamespace<E extends string> =
  E extends `${infer NS}:${string}` ? NS : never;

type NS = EventNamespace<"user:login">;  // "user"

// Alle Events eines Namespaces:
type EventsOf<NS extends string, Map = EventMap> = {
  [K in keyof Map as K extends `${NS}:${string}` ? K : never]: Map[K];
};

type UserEvents = EventsOf<"user">;
// ^ { "user:login": {...}; "user:logout": {...} }

// Experiment: Baue einen emit()-Typ der den Payload basierend auf
// dem Event-Namen erzwingt:
// function emit<E extends keyof EventMap>(event: E, payload: EventMap[E]): void;
// emit("user:login", { userId: "123", timestamp: Date.now() }); // OK
// emit("user:login", { itemId: "x" }); // FEHLER!
```

---

## Was du gelernt hast

- **Pattern Matching** mit `infer` ist das TypeScript-Aequivalent zu Destructuring auf Type-Level
- **Mehrfaches `infer`** erlaubt komplexe Zerlegung in einem einzigen Conditional Type
- **`infer` mit Constraints** (TS 4.7+) kombiniert Inferenz und Typeinschraenkung
- Fortgeschrittene Patterns: Rekursives Unwrapping, Tuple-Operationen, Objekt-Transformation
- Pattern Matching ist die Grundlage fuer typsichere APIs in Angular und React

> 🧠 **Erklaere dir selbst:** Vergleiche Pattern Matching in JavaScript
> (Destructuring: `const { a, b } = obj`) mit Pattern Matching in
> TypeScript's Typsystem (`T extends { a: infer A, b: infer B }`).
> Was sind die Gemeinsamkeiten, was die Unterschiede?
> **Kernpunkte:** Beide "zerlegen" eine Struktur | JS-Destructuring
> zur Laufzeit, TS-Pattern-Matching zur Compilezeit | JS kann nur
> eine Ebene, TS kann rekursiv matchen | JS hat Defaults, TS hat
> den else-Branch (`: never`)

**Kernkonzept zum Merken:** `infer` ist das maechtigste einzelne Keyword im Typsystem. Es verwandelt Conditional Types von "pruefe ob" zu "pruefe und extrahiere" — das ist der Unterschied zwischen `instanceof` und Destructuring.

---

> **Pausenpunkt** — Pattern Matching ist verstanden. Jetzt
> kombinieren wir alles zu rekursiven Type Challenges.
>
> Weiter geht es mit: [Sektion 05: Recursive Type Challenges](./05-recursive-type-challenges.md)
