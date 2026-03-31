# Cheatsheet: Objects & Interfaces

## Object Type Literal

```typescript
let user: { name: string; age: number } = { name: "Max", age: 30 };
```

## Interface

```typescript
interface User {
  name: string;
  age: number;
  email?: string;           // Optional
  readonly id: number;      // Nicht aenderbar
}
```

## Extending Interfaces

```typescript
// Einfach
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// Mehrfach
interface Trackable { id: string; }
interface TrackedDog extends Animal, Trackable { breed: string; }
```

## Index Signatures

```typescript
// Dynamische Keys
interface Dict {
  [key: string]: number;
}

// Mit festen Properties (fester Typ muss kompatibel sein!)
interface Config {
  name: string;
  [key: string]: string;   // Alle Werte muessen string sein
}

// Record als Alternative
type Dict = Record<string, number>;
type StatusMap = Record<"active" | "closed", boolean>;
```

## Structural Typing -- Regeln

```
1. TypeScript prueft STRUKTUR, nicht NAMEN
2. Ein Objekt ist kompatibel, wenn es MINDESTENS alle benoetigten Properties hat
3. EXTRA Properties sind bei Variablen-Zuweisung erlaubt
4. Bei FRISCHEN Object Literals greift der Excess Property Check
```

## Excess Property Checking

```typescript
interface A { x: number; }

// FEHLER -- frisches Object Literal
const a: A = { x: 1, y: 2 };         // y ist nicht erlaubt

// OK -- ueber Variable
const temp = { x: 1, y: 2 };
const b: A = temp;                     // Kein Excess Check

// OK -- Type Assertion
const c: A = { x: 1, y: 2 } as A;    // Bypass

// OK -- Index Signature
interface B { x: number; [k: string]: unknown; }
const d: B = { x: 1, y: 2 };          // Erlaubt durch Index Sig
```

## Readonly

```typescript
// Property-Level
interface Point {
  readonly x: number;
  readonly y: number;
}

// Utility Type (shallow!)
type FrozenUser = Readonly<User>;

// ACHTUNG: readonly ist SHALLOW!
interface Outer {
  readonly inner: { value: number };
}
const o: Outer = { inner: { value: 1 } };
// o.inner = ...;         // Fehler
o.inner.value = 99;       // KEIN Fehler! Verschachtelt ist mutable!
```

## Optional vs. Undefined

```typescript
interface A { x?: number; }           // x kann fehlen
interface B { x: number | undefined; } // x muss da sein, Wert kann undefined sein

const a: A = {};                       // OK
const b: B = { x: undefined };         // OK, aber {} waere FEHLER
```

## Destructuring mit Typen

```typescript
// In Variablen
const { name, age }: { name: string; age: number } = obj;

// In Funktionsparametern
function greet({ name, age }: { name: string; age: number }): void { ... }
```

## Interface vs Type Alias

```
Interface:                    Type Alias:
- Objektstrukturen            - Unions (A | B)
- API-Vertraege               - Intersections (A & B)
- Declaration Merging          - Mapped/Conditional Types
- extends Syntax               - Primitiv-Aliases
                              - Tuples
```

## Declaration Merging

```typescript
// Nur mit interface!
interface Window {
  myCustomProp: string;
}
// Erweitert das globale Window-Interface
```

## Verschachtelte Objekte

```typescript
interface Address {
  street: string;
  city: string;
}

interface User {
  name: string;
  address: Address;           // Verschachtelt
  contacts: {                 // Inline verschachtelt
    phone?: string;
    email: string;
  };
}
```

## Intersection Types (&)

```typescript
// Typen kombinieren: Ergebnis muss ALLE Properties haben
type A = { x: number };
type B = { y: string };
type C = A & B;   // { x: number; y: string }

// Kompatible Properties werden verengt:
type D = { value: string | number };
type E = { value: number };
type F = D & E;   // { value: number }

// Inkompatible Properties werden never:
type G = { x: number };
type H = { x: string };
type I = G & H;   // { x: never } -- nicht erstellbar!

// Praxis: Composition Pattern
type Identifiable = { id: string };
type Timestamped = { createdAt: Date; updatedAt: Date };
type User = Identifiable & Timestamped & { name: string; email: string };
```

## Utility Types fuer Objekte

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Partial<T> -- alle Properties optional
type UpdateDto = Partial<User>;
// { id?: string; name?: string; email?: string; password?: string }

// Required<T> -- alle Properties pflicht
type StrictUser = Required<User>;

// Pick<T, K> -- nur bestimmte Properties
type PublicUser = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit<T, K> -- bestimmte Properties entfernen
type CreateDto = Omit<User, "id">;
// { name: string; email: string; password: string }

// Kombination: Pick + Partial
type PatchDto = Partial<Pick<User, "name" | "email">>;
// { name?: string; email?: string }
```

## Discriminated Unions (Vorschau)

```typescript
// Objekte mit gemeinsamer 'type'-Property:
interface SuccessResult { success: true; data: string; }
interface ErrorResult { success: false; error: string; }
type Result = SuccessResult | ErrorResult;

function handle(r: Result) {
  if (r.success) {
    r.data;   // TS kennt: SuccessResult
  } else {
    r.error;  // TS kennt: ErrorResult
  }
}
```

## Nuetzliche Patterns

```typescript
// Leeres Objekt erzwingen
type EmptyObject = Record<string, never>;

// Mindestens eine Property
type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

// Optionale Felder required machen
type Required<T> = { [K in keyof T]-?: T[K] };

// API Response Wrapper
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Config mit Defaults
const DEFAULTS: Readonly<Config> = { /* ... */ };
function createConfig(overrides: Partial<Config>): Config {
  return { ...DEFAULTS, ...overrides };
}

// Readonly Array (nicht nur Referenz!)
interface SafeList {
  readonly items: readonly string[];  // Referenz UND Inhalt readonly
}
```
