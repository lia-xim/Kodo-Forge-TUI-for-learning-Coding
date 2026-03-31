# Cheatsheet: Type Annotations & Type Inference

## Annotation Syntax -- Schnellreferenz

```typescript
// Variable
let x: string = "hello";

// Funktion
function fn(a: number, b: string): boolean { ... }

// Arrow Function
const fn = (a: number): string => a.toString();

// Objekt-Destructuring
function fn({ name, age }: { name: string; age: number }): void { ... }

// Array-Destructuring
const [a, b]: [string, number] = ["hello", 42];

// Array
let items: string[] = [];
let items: Array<string> = [];

// Tuple
let pair: [string, number] = ["hello", 42];

// Union
let id: string | number = "abc";

// Literal
let dir: "north" | "south" = "north";

// Generic
function fn<T>(x: T): T { return x; }
```

---

## Entscheidungstabelle: Wann Annotieren?

| Situation | Annotieren? | Grund |
|-----------|:-----------:|-------|
| Funktionsparameter | JA | TS kann Parameter nicht infern |
| Exportierte Return-Types | JA | Stabile API, bessere Fehlermeldungen |
| Lokale Variable mit Wert | NEIN | Inference ist korrekt |
| Lokale Variable ohne Wert | JA | Sonst wird es `any` |
| Callback-Parameter | NEIN | Contextual Typing |
| Leere Arrays `[]` | JA | Wird sonst `any[]` |
| `const` Primitive | NEIN | Literal-Typ wird korrekt infert |
| Objekt-Property-Typ | KOMMT DRAUF AN | Nur wenn Widening problematisch |
| Generic-Aufruf `fn<T>(x)` | NEIN | T wird aus `x` infert |
| Separater Callback | JA | Kein Contextual Typing |
| API-Response / JSON.parse | JA | TS kennt den Laufzeit-Typ nicht |
| Komplexe Return-Typen (5+ Unions) | JA | Dokumentation + Fehlerprävention |

---

## Widening-Regeln

| Deklaration | Wert | Inferierter Typ | Erklaerung |
|-------------|------|-----------------|------------|
| `const x =` | `"hello"` | `"hello"` | const Primitive = Literal |
| `let x =` | `"hello"` | `string` | let = Widened |
| `const x =` | `42` | `42` | const Primitive = Literal |
| `let x =` | `42` | `number` | let = Widened |
| `const x =` | `true` | `true` | const Primitive = Literal |
| `let x =` | `true` | `boolean` | let = Widened |
| `const obj =` | `{ a: 1 }` | `{ a: number }` | Object Properties = Widened |
| `const arr =` | `[1, 2]` | `number[]` | Array = Widened |
| `function()` | `return "x"` | `string` | Return = Widened |

---

## `as const` -- Auswirkungen

| Ohne `as const` | Mit `as const` |
|------------------|----------------|
| `"hello"` --> `string` (bei let) | `"hello"` --> `"hello"` |
| `[1, 2, 3]` --> `number[]` | `[1, 2, 3]` --> `readonly [1, 2, 3]` |
| `{ a: 1 }` --> `{ a: number }` | `{ a: 1 }` --> `{ readonly a: 1 }` |
| Properties sind aenderbar | Properties sind `readonly` |
| Array hat variable Laenge | Array ist Tuple (feste Laenge) |
| Kein Union-Typ ableitbar | Union mit `(typeof X)[number]` moeglich |

### Typischer `as const` Use Case:

```typescript
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number];
// Ergebnis: "admin" | "user" | "guest"
```

---

## satisfies vs Annotation vs Inference

| Werkzeug | Validiert? | Praezise Typen? | Nutze wenn... |
|----------|:----------:|:---------------:|---------------|
| `: Typ` (Annotation) | Ja | Nein (auf Annotation-Typ erweitert) | Typ einschraenken (z.B. let-Variable) |
| `satisfies Typ` | Ja | Ja (inferierte Typen bleiben) | Config-Objekte, Konfigurationskonstanten |
| Nichts (Inference) | Nein | Ja | Lokale Variablen mit klarem Wert |
| `as const satisfies Typ` | Ja | Ja + Literal + Readonly | Enum-Ersatz, Route-Definitionen |

### Schnell-Entscheidung:

```
Brauchst du Validierung?  --Nein-->  Lass TS infern
        |Ja
Brauchst du spezifische Typen?  --Nein-->  Annotation (: Typ)
        |Ja
Brauchst du Literal + Readonly?  --Nein-->  satisfies Typ
        |Ja
        as const satisfies Typ
```

---

## Control Flow Narrowing

| Check | Vorher | Nachher |
|-------|--------|---------|
| `typeof x === "string"` | `string \| number` | `string` |
| `x instanceof Date` | `Date \| string` | `Date` |
| `if (x)` | `string \| null` | `string` (Achtung: 0 und "" auch weg!) |
| `x !== null` | `string \| null` | `string` |
| `"key" in x` | `A \| B` | Typ mit "key" |
| `x.kind === "circle"` | `Circle \| Rect` | `Circle` (Discriminated Union) |
| Type Predicate | `unknown` | Definierter Typ |

---

## Inference-Regeln

### 1. Variable Initialization
TS infert den Typ aus dem Initialwert.
```typescript
let x = 5;        // number
const y = "hi";   // "hi"
```

### 2. Return Type Inference
TS bildet die Union aller Return-Pfade.
```typescript
function f(x: boolean) {
  if (x) return "yes";
  return 42;
}
// Return: "yes" | 42
```

### 3. Best Common Type
Bei Arrays sucht TS den engsten gemeinsamen Typ.
```typescript
const arr = [1, "hello", null];
// (string | number | null)[]
```

### 4. Contextual Typing
Der Kontext bestimmt den Typ von Callback-Parametern.
```typescript
[1,2,3].map(n => n * 2);
//           ^-- n: number (aus Array-Typ)
```

### 5. Generic Inference
Typ-Parameter werden aus Argumenten infert.
```typescript
function id<T>(x: T): T { return x; }
id("hello");  // T = string
```

### 6. Control Flow Analysis
TS verengt Typen basierend auf Bedingungen.
```typescript
function f(x: string | null) {
  if (x !== null) {
    x.toUpperCase();  // x: string
  }
}
```

---

## Wo Inference versagt

| Situation | Inferierter Typ | Problem | Loesung |
|-----------|----------------|---------|---------|
| `const x = []` | `any[]` | Kein Element-Typ bekannt | `const x: string[] = []` |
| `Object.keys(obj)` | `string[]` | Nicht die konkreten Keys | `(Object.keys(obj) as (keyof typeof obj)[])` |
| `JSON.parse(...)` | `any` | Laufzeit-Typ unbekannt | Annotation oder Runtime-Validierung |
| Separater Callback | Parameter sind `any` | Kein Contextual Typing | Parameter annotieren |
| `fetch().json()` | `any` | API-Typ unbekannt | Return-Typ annotieren |

---

## Eselsbruecken

- **Parameter** = Tuer ins Haus --> immer beschriften (annotieren)
- **Lokale Variable** = Moebel im Haus --> TS sieht sie direkt
- **Return Type** = Paket nach draussen --> beschriften wenn exportiert
- **Leeres Array** = leere Schachtel --> Etikett drauf (Typ angeben)
- **Callback in .map()** = TS kennt den Inhalt --> nicht beschriften
- **`as const`** = "Bitte nicht anfassen!" --> alles wird readonly + literal
- **`satisfies`** = "Entspricht dem Bauplan, aber behaelt die Details"
- **Control Flow** = TS liest mit --> nach if/typeof weiss es mehr als vorher

---

## Goldene Regeln (zum Auswendiglernen)

1. **Annotate at boundaries, infer inside**
2. **Leere Arrays, JSON, API-Responses: immer annotieren**
3. **Callback-Parameter NICHT annotieren (Contextual Typing)**
4. **satisfies fuer Konfigurationsobjekte mit Schema**
5. **as const wenn Literal-Typen oder Readonly gebraucht werden**
6. **as const satisfies fuer maximale Praezision + Validierung**
7. **Exhaustiveness Checking mit never im default-Branch**
8. **Type Predicates fuer eigene Type Guards**
