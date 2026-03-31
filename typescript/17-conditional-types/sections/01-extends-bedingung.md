# Sektion 1: Die extends-Bedingung

> Geschaetzte Lesezeit: **10 Minuten**
>
> Naechste Sektion: [02 - Infer-Keyword](./02-infer-keyword.md)

---

## Was du hier lernst

- Die Grundsyntax: `T extends U ? X : Y`
- Verschachtelte Conditional Types
- Unterschied zu Runtime-Checks (typeof, instanceof)
- Wann Conditional Types sinnvoll sind

---

## Die Grundidee

Conditional Types sind **Ternary-Operatoren fuer Typen**:

```typescript
// Runtime:  value > 0 ? "positiv" : "nicht positiv"
// Type-Level: T extends string ? "text" : "other"
```

Die Syntax: `T extends U ? TrueType : FalseType`

- Wenn T ein Subtyp von U ist → TrueType
- Sonst → FalseType

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;    // true
type B = IsString<number>;    // false
type C = IsString<"hello">;   // true (Literal extends string)
```

---

## Verschachtelte Conditionals

Du kannst Conditionals verschachteln — wie verschachtelte Ternaries:

```typescript
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type A = TypeName<string>;     // "string"
type B = TypeName<42>;         // "number"
type C = TypeName<() => void>; // "function"
type D = TypeName<{ x: 1 }>;  // "object"
```

> **Wie eine Kette von if-else** — TypeScript prueft von oben nach unten und nimmt den ersten Treffer.

---

## extends auf Type-Level vs Runtime

**Wichtig:** Conditional Types existieren NUR zur Compile-Zeit.
Sie erzeugen keinen Runtime-Code!

```typescript
// Type-Level (Conditional Type):
type Result<T> = T extends string ? string : number;

// Das kann man NICHT in einer Funktion direkt nutzen:
function process<T>(v: T): Result<T> {
  if (typeof v === "string") {
    return v.toUpperCase(); // Error! TypeScript kann Result<T> nicht narrowen
  }
  return 0; // Error!
}
```

> **TypeScript kann Conditional Types nicht durch Control Flow narrowen.**
> Das ist eine bekannte Einschraenkung. Die Loesung: Overloads oder Casts.

---

## Wann Conditional Types einsetzen?

| Situation | Loesung |
|-----------|---------|
| Rueckgabetyp abhaengig vom Eingabetyp | Conditional Type |
| Typ aus einem anderen Typ extrahieren | infer (naechste Sektion) |
| Verschiedene API-Typen pro Parameter | Conditional + Overloads |
| Typ-Filter auf Unions | Distributive Conditionals |

---

## Pausenpunkt

**Kernerkenntnisse:**
- `T extends U ? X : Y` — Ternary fuer Typen
- Verschachtelte Conditionals fuer Multi-Branch-Logik
- Rein statisch — kein Runtime-Code, kein Control Flow Narrowing

> **Weiter:** [Sektion 02 - Infer-Keyword](./02-infer-keyword.md)
