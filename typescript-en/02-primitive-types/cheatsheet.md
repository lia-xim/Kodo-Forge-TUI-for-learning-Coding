# Cheatsheet: Primitive Types in TypeScript

Quick reference for Lesson 02.

---

## All primitive types

| Type | Example | Description |
|---|---|---|
| `string` | `"hello"`, `` `world` `` | Text, always Unicode (UTF-16) |
| `number` | `42`, `3.14`, `NaN`, `Infinity` | 64-bit IEEE 754 floating point |
| `boolean` | `true`, `false` | Truth value |
| `null` | `null` | "Intentionally no value" |
| `undefined` | `undefined` | "Value not yet set" |
| `symbol` | `Symbol("id")` | Guaranteed unique value |
| `bigint` | `42n`, `BigInt(42)` | Arbitrarily large integers |
| `void` | — | No meaningful return value |
| `never` | — | Can never occur |

---

## Type Hierarchy

```
                    unknown  (Top Type)
                   /   |   \
             string  number  boolean  symbol  bigint  null  undefined
                   \   |   /
                    never    (Bottom Type)

  any ← ausserhalb der Hierarchie, bricht alle Regeln
```

| Direction | Valid? | Example |
|---|---|---|
| primitive → unknown | Yes | `let u: unknown = "hallo"` |
| unknown → primitive | No (check first!) | `let s: string = u` — Error! |
| never → primitive | Yes (never reachable) | `let s: string = gibNever()` |
| primitive → never | No | `let n: never = 42` — Error! |
| any → anything | Yes (unsafe!) | `let s: string = einAny` |
| anything → any | Yes | `let a: any = "hallo"` |

---

## any vs unknown

| | `any` | `unknown` |
|---|---|---|
| Anything assignable to this type? | Yes | Yes |
| Assignable to other types? | Yes (unsafe!) | No (check first) |
| Access properties? | Yes (unsafe!) | No (check first) |
| Call methods? | Yes (unsafe!) | No (check first) |
| Contagious? | Yes! | No |
| Recommended? | **No** | **Yes** |

**Type Narrowing with unknown:**
```typescript
function sicher(wert: unknown): void {
  if (typeof wert === "string") {
    wert.toUpperCase();  // OK — TypeScript weiss: string
  }
  if (typeof wert === "number") {
    wert.toFixed(2);     // OK — TypeScript weiss: number
  }
}
```

---

## null vs undefined

| | `undefined` | `null` |
|---|---|---|
| Meaning | "Was never set" | "Deliberately cleared" |
| typeof | `"undefined"` | `"object"` (Bug!) |
| In JSON | Gets removed | Stays as `null` |
| Default for | Uninitialized variables | Must be set explicitly |

**Optional parameters:**
```typescript
function a(x?: string) {}        // x kann weggelassen werden
function b(x: string | undefined) {}  // x MUSS uebergeben werden (auch als undefined)
function c(x: string | null) {}       // x MUSS uebergeben werden (auch als null)
```

**Nullish operators:**
```typescript
wert ?? "default"     // "default" nur bei null/undefined
wert || "default"     // "default" bei ALLEN falsy-Werten (0, "", false, ...)
obj?.prop             // undefined wenn obj null/undefined
obj?.methode?.()      // Aufrufe nur wenn definiert
wert ??= "default"    // Setze nur wenn null/undefined
```

---

## void vs never

| | `void` | `never` |
|---|---|---|
| Meaning | "No meaningful return value" | "NEVER returns" |
| Function returns? | Yes (with undefined) | No (throw/infinite loop) |
| Example | `console.log()` | `throw new Error()` |

```typescript
function log(msg: string): void { console.log(msg); }
function fail(msg: string): never { throw new Error(msg); }
```

---

## Common Type Errors

| Error | Problem | Solution |
|---|---|---|
| `let x: String = "a"` | Wrapper object instead of primitive | `let x: string = "a"` |
| `JSON.parse(s)` as `any` | No type safety | `JSON.parse(s)` as `unknown` + check |
| `0.1 + 0.2 === 0.3` | Floating-point precision | Epsilon comparison or integer arithmetic (cents) |
| `x!.prop` | Non-null Assertion | Prefer `if (x) { x.prop }` |
| `port \|\| 3000` | 0 becomes 3000 | `port ?? 3000` |
| `number` for large IDs | Precision loss > 2^53 | Use `bigint` |
| `1n + 2` | Mixing bigint/number | `1n + BigInt(2)` or `Number(1n) + 2` |

---

## Type Widening — let vs const

```typescript
const name = "Max";     // Typ: "Max"    (Literal Type)
let name2 = "Max";      // Typ: string   (breiter Typ)

const zahl = 42;        // Typ: 42       (Literal Type)
let zahl2 = 42;         // Typ: number   (breiter Typ)
```

| Declaration | Inferred type | Reason |
|---|---|---|
| `const x = "hallo"` | `"hallo"` | const never changes |
| `let x = "hallo"` | `string` | let could change |
| `const obj = { a: 1 }` | `{ a: number }` | Properties are mutable |
| `const obj = { a: 1 } as const` | `{ readonly a: 1 }` | as const freezes everything |

**as const — three effects:**
1. All properties become `readonly`
2. All values become Literal Types
3. Arrays become readonly Tuples

```typescript
// Union Type aus Array ableiten:
const STATUS = ["aktiv", "inaktiv", "gesperrt"] as const;
type Status = typeof STATUS[number];  // "aktiv" | "inaktiv" | "gesperrt"
```

---

## Type Erasure — Compile Time vs Runtime

```
Compilezeit (tsc)              Laufzeit (JS)
─────────────────              ─────────────
string, number, boolean  →     typeof === "string", "number", "boolean"
interfaces, types        →     ENTFERNT (existieren nicht!)
void, never              →     ENTFERNT
Union Types (A | B)      →     ENTFERNT
```

**Remember:** TypeScript types exist ONLY at compile time.
At runtime, only plain JavaScript remains.

---

## Practical Decisions

| Scenario | Type | Why |
|---|---|---|
| Monetary amounts | `number` in cents | Avoids floating point |
| Large IDs (> 2^53) | `bigint` or `string` | number loses precision |
| No return value | `void` | Function with side effects |
| Value possibly missing | `T \| undefined` | Forces a check |
| Value intentionally empty | `T \| null` | Explicit intent |
| External data | `unknown` + Type Guard | Never `any`! |

---

## Lowercase vs Uppercase

```
CORRECT          WRONG
───────          ──────
string           String
number           Number
boolean          Boolean
symbol           Symbol (as a type)
bigint           BigInt (as a type)
```

**Remember:** Always use lowercase for types. The uppercase variants
are JavaScript wrapper objects and almost never what you want.