# Cheatsheet: Phase 1 — Komplettreferenz

## L01: Setup

```typescript
// tsconfig.json — IMMER strict: true
{ "compilerOptions": { "strict": true, "target": "ES2022", "module": "NodeNext" } }
```

---

## L02: Primitive Types

| Typ | Beschreibung |
|-----|-------------|
| `string`, `number`, `boolean` | Primitive Typen |
| `null`, `undefined` | Abwesenheit von Werten |
| `any` | Deaktiviert Compiler (VERMEIDEN!) |
| `unknown` | Typsicher — erzwingt Check vor Nutzung |
| `never` | Leerer Typ — kein Wert moeglich |
| `void` | Kein sinnvoller Rueckgabewert |

**Type Erasure:** Alle Typen verschwinden zur Laufzeit!

---

## L03: Annotations & Inference

```typescript
const x = "hello";        // Typ: "hello" (Literal — const)
let y = "hello";          // Typ: string  (Widening — let)
const obj = { a: 1 };     // obj.a: number (Property Widening)
const obj2 = { a: 1 } as const;  // obj2.a: 1 (Literal behalten)
```

**Wann annotieren?** Parameter: JA. Exportierte Returns: JA. Lokale Variablen: NEIN.

---

## L04: Arrays & Tuples

```typescript
const arr: string[] = ["a", "b"];         // Array
const tuple: [string, number] = ["a", 1]; // Tuple (feste Laenge + Typen)
const ro: readonly string[] = ["a"];      // Readonly Array
```

---

## L05: Objects & Interfaces

```typescript
interface User { name: string; age?: number; readonly id: string; }
// Structural Typing: Form entscheidet, nicht Name
// Excess Property Check: Nur bei frischen Literalen
```

---

## L06: Functions

```typescript
// Overloads (spezifisch zuerst!)
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number { return x; }

// Type Guard
function isString(v: unknown): v is string { return typeof v === "string"; }

// Assertion Function
function assert(v: unknown): asserts v is string { if (typeof v !== "string") throw Error(); }

// void: Callback-Typ tolerant, Deklaration streng
```

---

## L07: Union & Intersection

```typescript
type A = string | number;           // Union: entweder oder
type B = { x: string } & { y: number }; // Intersection: alles gleichzeitig

// Discriminated Union + Exhaustive Check
type Shape = { type: "circle"; r: number } | { type: "rect"; w: number; h: number };
switch (shape.type) {
  case "circle": /* shape.r */ break;
  case "rect": /* shape.w, shape.h */ break;
  default: const _: never = shape; // Sicherheitsnetz!
}
```

---

## L08: Type Aliases vs Interfaces

| | `type` | `interface` |
|--|--------|-------------|
| Union/Mapped/Conditional | Ja | Nein |
| Declaration Merging | Nein | Ja |
| extends-Performance | — | Schneller |

**Regel:** Union → type. Objekt-Form → beides OK. Konsistenz > perfekte Wahl.

---

## L09: Enums & Literal Types

```typescript
// as const Object (moderne Enum-Alternative)
const Status = { Active: "ACTIVE", Inactive: "INACTIVE" } as const;
type Status = typeof Status[keyof typeof Status]; // "ACTIVE" | "INACTIVE"

// Template Literal Types
type Event = `on${Capitalize<"click" | "scroll">}`; // "onClick" | "onScroll"

// Branded Types
type EUR = number & { __brand: "EUR" };
function eur(n: number): EUR { return n as EUR; }
```

---

## Haeufigste Fehler

1. `typeof null === "object"` — JavaScript-Bug seit 1995
2. `readonly` ist shallow — verschachtelte Objekte nicht geschuetzt
3. Excess Property Check nur bei frischen Literalen
4. `any` statt `unknown` — deaktiviert den Compiler
5. Overloads in falscher Reihenfolge — spezifisch zuerst!
6. Intersection-Konflikte erzeugen stilles `never`
7. Numerische Enums akzeptieren jede Zahl (Soundness-Loch)
8. `const enum` nicht kompatibel mit isolatedModules
