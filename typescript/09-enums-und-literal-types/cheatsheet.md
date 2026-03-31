# Cheatsheet: Enums & Literal Types

## Literal Types

```typescript
const x = "hello";   // Typ: "hello" (Literal)
let y = "hello";     // Typ: string  (Widening!)

// Literal-Typ erzwingen bei let:
let z = "hello" as const;        // Typ: "hello"
let w: "hello" | "bye" = "hello"; // Explizite Annotation
```

---

## as const — Dreifach-Effekt

```typescript
const arr = ["GET", "POST"] as const;
// (1) readonly  (2) Literal Types  (3) Tuple
// Typ: readonly ["GET", "POST"]

const obj = { method: "GET" } as const;
// obj.method hat Typ "GET" (nicht string)
```

---

## Union aus as const ableiten

```typescript
// Array:
const METHODS = ["GET", "POST", "PUT"] as const;
type Method = typeof METHODS[number]; // "GET" | "POST" | "PUT"

// Object:
const Status = { Active: "ACTIVE", Inactive: "INACTIVE" } as const;
type Status = typeof Status[keyof typeof Status]; // "ACTIVE" | "INACTIVE"
```

---

## Enums

```typescript
// Numerisches Enum (Auto-Increment)
enum Direction { Up, Down, Left, Right } // 0, 1, 2, 3
Direction[0]; // "Up" (Reverse Mapping!)

// String Enum (explizite Werte)
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }
// KEIN Reverse Mapping, NOMINAL typisiert

// const enum (inline, NICHT mit isolatedModules kompatibel!)
const enum Color { Red = "RED" }
```

---

## Vergleich: Enum vs Union vs as const

| Feature | Enum | Union Literal | as const Object |
|---------|------|---------------|-----------------|
| Laufzeit-Code | Ja | Nein | Ja (Objekt) |
| Tree-Shakeable | Nein | Ja | Teilweise |
| Iteration | Ja | Nein | Ja |
| Reverse Mapping | Nur numerisch | Nein | Manuell |
| isolatedModules | Ja (nicht const) | Ja | Ja |
| Nominal | String Enum | Nein | Nein |

---

## Template Literal Types

```typescript
type Size = "sm" | "md" | "lg";
type Color = "red" | "blue";

type Token = `${Size}-${Color}`;
// 6 Kombinationen (3 x 2): "sm-red" | "sm-blue" | ...

// String-Manipulation:
Capitalize<"hello">  // "Hello"
Uppercase<"hello">   // "HELLO"
Lowercase<"HELLO">   // "hello"
Uncapitalize<"Hello"> // "hello"
```

---

## Branded Types

```typescript
type EUR = number & { __brand: "EUR" };
type USD = number & { __brand: "USD" };

function eur(amount: number): EUR { return amount as EUR; }

const a = eur(9.99);
const b = eur(1.90);
// eur(9.99) + eur(1.90) → Braucht Cast zu number erst!
```

---

## Empfehlung

| Situation | Empfehlung |
|-----------|------------|
| Feste Werte ohne Laufzeit-Bedarf | **Union Literal** |
| Laufzeit-Zugriff + Literal Types | **as const Object** |
| Nominale Typisierung | **String Enum** |
| Bitwise Flags | **Numerisches Enum** |
| Semantische Unterscheidung | **Branded Types** |
| Generierte String-Patterns | **Template Literal Types** |
