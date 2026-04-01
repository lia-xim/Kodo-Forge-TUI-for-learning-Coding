# Cheatsheet: Advanced Generics in TypeScript

Schnellreferenz fuer Lektion 22.

---

## Varianz-Tabelle

| Varianz | Richtung | Modifier | Beispiel | Regel |
|---|---|---|---|---|
| **Kovariant** | Subtyp bleibt | `out T` | `Producer<Cat> extends Producer<Animal>` | T nur in Output-Position |
| **Kontravariant** | Subtyp kehrt um | `in T` | `Consumer<Animal> extends Consumer<Cat>` | T nur in Input-Position |
| **Invariant** | Keine Richtung | `in out T` | `MutableBox<Cat> !== MutableBox<Animal>` | T in beiden Positionen |
| **Bivariant** | Beide Richtungen | — | Method-Params (ohne strict) | Legacy, unsicher |

---

## Varianz-Positionen

| Position | Varianz | Beispiel |
|---|---|---|
| Rueckgabetyp | Output (kovariant) | `get(): T` |
| Parameter | Input (kontravariant) | `set(value: T): void` |
| Property (readonly) | Output (kovariant) | `readonly value: T` |
| Property (mutable) | Input + Output (invariant) | `value: T` |
| Callback-Parameter | Input (kontravariant) | `fn: (item: T) => void` |
| Callback-Return | Output (kovariant) | `fn: () => T` |

---

## in/out Modifier Syntax (TS 4.7+)

```typescript
// Kovariant — T nur herausgeben
interface Producer<out T> {
  get(): T;           // OK: Output-Position
  // set(v: T): void; // Error: Input-Position!
}

// Kontravariant — T nur hineinnehmen
interface Consumer<in T> {
  accept(item: T): void;  // OK: Input-Position
  // get(): T;             // Error: Output-Position!
}

// Invariant — beides
interface MutableBox<in out T> {
  get(): T;
  set(value: T): void;
}
```

---

## Higher-Kinded Types Emulation

```typescript
// Interface-Map als Lookup-Table
interface URItoKind<A> {
  Array: Array<A>;
  Promise: Promise<A>;
  Set: Set<A>;
}

type URIS = keyof URItoKind<any>;
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// Verwendung:
type X = Kind<"Array", string>;   // string[]
type Y = Kind<"Promise", number>; // Promise<number>
```

---

## Constraint-Patterns

```typescript
// Intersection-Constraint (UND)
function f<T extends HasId & Serializable>(item: T): void { }

// Recursive/F-bounded Constraint
interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}

// Conditional Constraint (indirekt)
type ValidatorFor<T> = T extends string ? StringValidator
                     : T extends number ? NumberValidator
                     : never;
```

---

## Distributive Conditional Types

```typescript
// Distributiv (Standard):
type IsString<T> = T extends string ? true : false;
IsString<string | number>  // true | false (verteilt!)

// Non-distributiv (Tuple-Wrapping):
type IsStringStrict<T> = [T] extends [string] ? true : false;
IsStringStrict<string | number>  // false (nicht verteilt)

// never wird zu never (leerer Union):
IsString<never>  // never
```

---

## API-Design-Regeln

| Regel | Beschreibung |
|---|---|
| **Rule of Two** | Typparameter mind. 2x verwenden (Input ↔ Output) |
| **Overloads vs Generic** | Diskrete Mappings → Overloads, parametrisch → Generic |
| **Default > any** | `<T = unknown>` statt `<T = any>` |
| **Inference lenken** | Inference-Kandidat dort platzieren wo TS ihn sieht |
| **Weniger ist mehr** | Weniger Typparameter = lesbarer |

---

## Haeufige Anti-Patterns

```typescript
// Anti-Pattern: T nur einmal (kein Mehrwert)
function bad<T>(x: T): void { }
function good(x: unknown): void { }

// Anti-Pattern: Zu viele Typparameter
function bad<A, B, C, D>(a: A, b: B, c: C): D { }
// Besser: Overloads oder weniger Parameter

// Anti-Pattern: Generic mit sofortigem Cast
function bad<T>(x: unknown): T { return x as T; }
// Kein Type Safety — nur eine Illusion
```

---

## Wichtige Begriffe

| Begriff | Bedeutung |
|---|---|
| **Type Constructor** | Generischer Typ der ein Argument braucht (`Array<T>`, `Promise<T>`) |
| **Higher-Kinded Type** | Typ ueber Type Constructors — nativ nicht in TS |
| **F-bounded Polymorphism** | `T extends F<T>` — Typ referenziert sich selbst im Constraint |
| **Naked Type Parameter** | Typparameter ohne Wrapping in Conditional Types |
| **Variance Position** | Wo T in einem Interface steht (Input/Output) |

---

> **Lektion 22 abgeschlossen!**
> Naechste Lektion: [23 - Recursive Types](../23-recursive-types/README.md)
