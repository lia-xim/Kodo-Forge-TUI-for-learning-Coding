# Cheatsheet: Primitive Types in TypeScript

Schnellreferenz fuer Lektion 02.

---

## Alle primitiven Typen

| Typ | Beispiel | Beschreibung |
|---|---|---|
| `string` | `"hallo"`, `` `welt` `` | Text, immer Unicode (UTF-16) |
| `number` | `42`, `3.14`, `NaN`, `Infinity` | 64-bit IEEE 754 Gleitkomma |
| `boolean` | `true`, `false` | Wahrheitswert |
| `null` | `null` | "Bewusst kein Wert" |
| `undefined` | `undefined` | "Noch kein Wert gesetzt" |
| `symbol` | `Symbol("id")` | Garantiert eindeutiger Wert |
| `bigint` | `42n`, `BigInt(42)` | Beliebig grosse ganze Zahlen |
| `void` | — | Kein sinnvoller Rueckgabewert |
| `never` | — | Kann nie auftreten |

---

## Typ-Hierarchie

```
                    unknown  (Top Type)
                   /   |   \
             string  number  boolean  symbol  bigint  null  undefined
                   \   |   /
                    never    (Bottom Type)

  any ← ausserhalb der Hierarchie, bricht alle Regeln
```

| Richtung | Gueltig? | Beispiel |
|---|---|---|
| primitiv → unknown | Ja | `let u: unknown = "hallo"` |
| unknown → primitiv | Nein (erst pruefen!) | `let s: string = u` — Error! |
| never → primitiv | Ja (nie erreichbar) | `let s: string = gibNever()` |
| primitiv → never | Nein | `let n: never = 42` — Error! |
| any → alles | Ja (unsicher!) | `let s: string = einAny` |
| alles → any | Ja | `let a: any = "hallo"` |

---

## any vs unknown

| | `any` | `unknown` |
|---|---|---|
| Alles zuweisbar an diesen Typ? | Ja | Ja |
| Diesen Typ an andere zuweisen? | Ja (unsicher!) | Nein (erst pruefen) |
| Properties aufrufen? | Ja (unsicher!) | Nein (erst pruefen) |
| Methoden aufrufen? | Ja (unsicher!) | Nein (erst pruefen) |
| Ansteckend? | Ja! | Nein |
| Empfohlen? | **Nein** | **Ja** |

**Type Narrowing mit unknown:**
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
| Bedeutung | "Wurde nie gesetzt" | "Bewusst geleert" |
| typeof | `"undefined"` | `"object"` (Bug!) |
| In JSON | Wird entfernt | Bleibt als `null` |
| Default fuer | Nicht initialisierte Variablen | Muss explizit gesetzt werden |

**Optionale Parameter:**
```typescript
function a(x?: string) {}        // x kann weggelassen werden
function b(x: string | undefined) {}  // x MUSS uebergeben werden (auch als undefined)
function c(x: string | null) {}       // x MUSS uebergeben werden (auch als null)
```

**Nullish Operatoren:**
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
| Bedeutung | "Kein sinnvoller Rueckgabewert" | "Kehrt NIE zurueck" |
| Funktion kehrt zurueck? | Ja (mit undefined) | Nein (throw/Endlosschleife) |
| Beispiel | `console.log()` | `throw new Error()` |

```typescript
function log(msg: string): void { console.log(msg); }
function fail(msg: string): never { throw new Error(msg); }
```

---

## Haeufige Typ-Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| `let x: String = "a"` | Wrapper-Objekt statt Primitiv | `let x: string = "a"` |
| `JSON.parse(s)` als `any` | Kein Typschutz | `JSON.parse(s)` als `unknown` + pruefen |
| `0.1 + 0.2 === 0.3` | Gleitkomma-Praezision | Epsilon-Vergleich oder Ganzzahl-Arithmetik (Cent) |
| `x!.prop` | Non-null Assertion | Lieber `if (x) { x.prop }` |
| `port \|\| 3000` | 0 wird zu 3000 | `port ?? 3000` |
| `number` fuer grosse IDs | Praezisionsverlust > 2^53 | `bigint` verwenden |
| `1n + 2` | bigint/number mischen | `1n + BigInt(2)` oder `Number(1n) + 2` |

---

## Type Widening — let vs const

```typescript
const name = "Max";     // Typ: "Max"    (Literal Type)
let name2 = "Max";      // Typ: string   (breiter Typ)

const zahl = 42;        // Typ: 42       (Literal Type)
let zahl2 = 42;         // Typ: number   (breiter Typ)
```

| Deklaration | Inferierter Typ | Grund |
|---|---|---|
| `const x = "hallo"` | `"hallo"` | const aendert sich nie |
| `let x = "hallo"` | `string` | let koennte sich aendern |
| `const obj = { a: 1 }` | `{ a: number }` | Properties sind veraenderbar |
| `const obj = { a: 1 } as const` | `{ readonly a: 1 }` | as const fixiert alles |

**as const — drei Effekte:**
1. Alle Properties werden `readonly`
2. Alle Werte werden Literal Types
3. Arrays werden readonly Tuples

```typescript
// Union Type aus Array ableiten:
const STATUS = ["aktiv", "inaktiv", "gesperrt"] as const;
type Status = typeof STATUS[number];  // "aktiv" | "inaktiv" | "gesperrt"
```

---

## Type Erasure — Compilezeit vs Laufzeit

```
Compilezeit (tsc)              Laufzeit (JS)
─────────────────              ─────────────
string, number, boolean  →     typeof === "string", "number", "boolean"
interfaces, types        →     ENTFERNT (existieren nicht!)
void, never              →     ENTFERNT
Union Types (A | B)      →     ENTFERNT
```

**Merke:** TypeScript-Typen existieren NUR zur Compilezeit.
Zur Laufzeit bleibt normales JavaScript uebrig.

---

## Praxis-Entscheidungen

| Szenario | Typ | Warum |
|---|---|---|
| Geldbetraege | `number` in Cent | Vermeidet Gleitkomma |
| Grosse IDs (> 2^53) | `bigint` oder `string` | number verliert Praezision |
| Kein Rueckgabewert | `void` | Funktion mit Side Effects |
| Wert fehlt evtl. | `T \| undefined` | Zwingt zur Pruefung |
| Wert bewusst leer | `T \| null` | Explizite Absicht |
| Externe Daten | `unknown` + Type Guard | Niemals `any`! |

---

## Klein vs Gross

```
RICHTIG          FALSCH
───────          ──────
string           String
number           Number
boolean          Boolean
symbol           Symbol (als Typ)
bigint           BigInt (als Typ)
```

**Merke:** Immer Kleinbuchstaben fuer Typen. Die Grossbuchstaben-Varianten
sind JavaScript Wrapper-Objekte und fast nie gewollt.
