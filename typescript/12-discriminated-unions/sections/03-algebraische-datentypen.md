# Sektion 3: Algebraische Datentypen

> Geschaetzte Lesezeit: **12 Minuten**
>
> Vorherige Sektion: [02 - Pattern Matching](./02-pattern-matching.md)
> Naechste Sektion: [04 - Option und Result Pattern](./04-option-und-result-pattern.md)

---

## Was du hier lernst

- Was **Algebraische Datentypen (ADTs)** sind und warum sie wichtig sind
- Wie TypeScript ADTs aus Haskell und Rust uebernimmt
- **Sum Types** (ODER) vs. **Product Types** (UND)
- Die historischen Wurzeln in der Typentheorie
- Warum TypeScript dafuer keine neue Syntax braucht

---

## Hintergrund: Woher kommt das?

Discriminated Unions sind kein TypeScript-Erfindung. Sie kommen aus der
**funktionalen Programmierung** und sind dort seit den 1970er Jahren
ein Grundpfeiler der Typentheorie.

### Die Ideenlinie

```
ML (1973)          →  Haskell (1990)     →  Rust (2010)      →  TypeScript (2016)
"datatype"             "data"                "enum"               Discriminated Unions
```

**ML** (Meta Language) fuehrte 1973 algebraische Datentypen ein.
**Haskell** perfektionierte sie mit Pattern Matching.
**Rust** machte sie mainstream-tauglich mit `enum` und `match`.
**TypeScript** brachte sie in die JavaScript-Welt — nicht als
neues Sprachfeature, sondern als clevere Nutzung bestehender Features
(Union Types + Literal Types + Control Flow Analysis).

> **Das Besondere an TypeScript:** Keine neue Syntax noetig! ADTs
> entstehen durch die Kombination von Features, die du schon kennst.

---

## Sum Types und Product Types

In der Typentheorie gibt es zwei grundlegende Kompositionsarten:

### Product Types (UND)

Ein Product Type kombiniert Werte mit UND — **alle** Felder sind
gleichzeitig vorhanden:

```typescript annotated
// Product Type: x UND y UND z — alle gleichzeitig
type Point3D = { x: number; y: number; z: number };
// Moegliche Werte = number × number × number (Multiplikation)
```

Der Name "Product" kommt daher, dass die Anzahl moeglicher Werte
das **Produkt** der einzelnen Typen ist.

#### Warum "Produkt"? Die Kardinalitaets-Mathematik

Betrachten wir die moeglichen Werte eines Product Types mathematisch:

```typescript
type Bool = true | false;                    // 2 moegliche Werte
type TriState = "low" | "medium" | "high";   // 3 moegliche Werte
```

Kombiniert zu einem Product Type:

```typescript
type Config = { flag: Bool; level: TriState };
// Moegliche Werte: 2 × 3 = 6
// (true,low), (true,medium), (true,high), (false,low), (false,medium), (false,high)
```

Die Kardinalitaet ist das **Produkt** der Einzeltypen: `|A × B| = |A| × |B|`.

> **Analogie 1 — Meal-Combo:** Ein Menu hat Vorspeise UND Hauptgericht UND Dessert.
> Bei 3 Vorspeisen, 5 Hauptgerichten und 4 Desserts gibt es
> `3 × 5 × 4 = 60` Combos. Die Kombination multipliziert die Wahlmoeglichkeiten.

#### Produkt-Typen im Alltag

Jedes Interface in TypeScript ist ein Product Type:

```typescript
interface User { id: number; name: string; isActive: boolean; }
// Gesamt: |number| × |string| × 2
```

> **Denkpause (30 Sek.):** Wie viele Werte hat `{a: boolean; b: boolean}`?
>
> **Loesung:** 2 × 2 = 4: `{a:T,b:T}`, `{a:T,b:F}`, `{a:F,b:T}`, `{a:F,b:F}`

---

### Sum Types (ODER)

Ein Sum Type kombiniert Varianten mit ODER — **genau eine** ist aktiv:

```typescript annotated
// Sum Type: Circle ODER Rectangle ODER Triangle — genau eins
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };
// Moegliche Werte = Circle + Rectangle + Triangle (Addition)
```

Der Name "Sum" kommt daher, dass die Anzahl moeglicher Werte
die **Summe** der Varianten ist.

#### Warum "Summe"? Die Kardinalitaets-Mathematik

Bei einem Sum Type waehlst du **eine** Variante — nicht mehrere:

```typescript
type EmailStatus = "sent" | "draft" | "failed";
// Kardinalitaet: 1 + 1 + 1 = 3 — niemals zwei gleichzeitig
```

Mit zusaetzlichen Daten:

```typescript annotated
type LoginState =
  | { status: "loggedOut" }                  // 1 Moeglichkeit
  | { status: "loggedIn"; user: User }       // |User| Moeglichkeiten
  | { status: "error"; message: string };    // |string| Moeglichkeiten
// Gesamt: 1 + |User| + |string| = Addition!
```

Die Kardinalitaet ist die **Summe**: `|A + B| = |A| + |B|`.

> **Analogie 2 — Restaurant-Menü:** Du darfst dir **genau ein** Gericht
> aussuchen — entweder Suppe ODER Salat ODER Pasta. Bei 3 Suppen,
> 4 Salaten, 5 Pastas: `3 + 4 + 5 = 12` Wahlmoeglichkeiten.

> **Analogie 3 — Ampel:** Eine Ampel zeigt **genau eine** Farbe:
> Rot ODER Gelb ODER Gruen. Der Zustand ist ein Sum Type mit drei Varianten.

#### Warum hat TypeScript keine nativen Sum Types?

TypeScript hat kein `enum`-Pattern Matching wie Rust. Stattdessen
**simuliert** es Sum Types durch drei bestehende Features:

```
Union Types (|)    +    Literal Types    +    Control Flow Analysis
  "Eins davon"           "Welches?"           "Compiler prueft alle"
```

Kein neues Keyword noetig — aber Exhaustiveness-Checks erfordern den `never`-Trick.

---

### Experiment: Kardinalitaet selbst berechnen

```typescript
// 1. Product: {a: bool; b: bool; c: bool} → 2 × 2 × 2 = 8
// 2. Sum: {kind:"a"} | {kind:"b"} | {kind:"c"} → 1 + 1 + 1 = 3
// 3. Kombiniert: {type:"simple"} | {type:"flag"; v: boolean} → 1 + 2 = 3
```

> **Probier es aus:** Erstelle `{kind: "x"; v: 1|2|3}`. Kardinalitaet? `1 × 3 = 3`.

---

### Selbst-Erklaerung: Product vs. Sum

**Versuche laut zu erklaeren:** Warum heisst ein Interface "Product Type"
und eine Discriminated Union "Sum Type"?

**Kernpunkte:**
- Product = Multiplikation: `|{a:A; b:B}| = |A| × |B|`
- Sum = Addition: `|A | B| = |A| + |B|`
- Beides = **Algebraische** Datentypen (Algebra = + und ×)

> **Analogie 4 — Lego:** Product Types = fertiges Modell, **alle** Teile
> gleichzeitig. Sum Types = Auswahlbox, du spielst mit **einem** Set.

---

## Historischer Exkurs: Von ML bis TypeScript

### ML (1973) — Die Geburt

Robin Milner entwickelte ML in Edinburgh. Das `datatype`-Keyword war
der erste algebraische Datentyp in einer Programmiersprache:

```ml
(* ML, 1973 — datatype + Pattern Matching *)
datatype shape = Circle of real | Rectangle of real * real;
fun area (Circle r) = Math.pi * r * r
  | area (Rectangle (w, h)) = w * h;
```

ML bewies: Datenvarianten + exhaustiver Check = typsichere Verarbeitung.

### Rust (2010) — ADTs fuer die Systemprogrammierung

Rusts `enum` ist weit maechtiger als C-Enums:

```rust
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
}
fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
    }
}
```

Rust zwingt zum exhaustiven `match` — sonst kein Kompilieren.

### TypeScript (2016) — ADTs ohne neue Syntax

```typescript annotated
type Shape =                                    // Discriminated Union
  | { kind: "circle"; radius: number }          // Variante 1
  | { kind: "rectangle"; width: number; height: number }; // Variante 2

function area(shape: Shape): number {
  switch (shape.kind) {                         // Discriminant
    case "circle": return Math.PI * shape.radius ** 2;   // Narrowing aktiv
    case "rectangle": return shape.width * shape.height; // Narrowing aktiv
  }
}
```

**Alle vier Sprachen, dasselbe Konzept.** Andere Syntax, gleiche Idee.

---

## ADTs in Frameworks die du kennst

### Angular: NgRx Actions

NgRx Actions sind Discriminated Unions:

```typescript
type Action =
  | { type: "[User] Load" }
  | { type: "[User] Load Success"; user: User }
  | { type: "[User] Load Failure"; error: string };
```

Der `type`-String ist der Discriminant — im Reducer per `switch` getrennt.

### React: useReducer Actions

```typescript
type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET"; value: number };
```

> **Erkenntnis:** Du hast ADTs schon benutzt — du wusstest es nur nicht.

---

## Was du gelernt hast

- **Algebraische Datentypen (ADTs)** kommen aus ML (1973) und durchziehen Haskell, Rust und TypeScript
- **Product Types** (Interfaces): UND-Kombination, Kardinalitaet = Produkt der Einzeltypen
- **Sum Types** (Discriminated Unions): ODER-Kombination, Kardinalitaet = Summe der Varianten
- TypeScript simuliert Sum Types durch Union Types + Literal Types + Control Flow Analysis
- **ADTs sind ueberall:** NgRx Actions, React Reducer, Rust Enums, Haskell data declarations

**Kernkonzept:** Sum Types machen das Unmoegliche unrepresentierbar — TypeScript druckt dieses uralte Konzept aus der Typentheorie ohne neue Syntax aus.

---

## Selbst-Erklaerung vor dem Weitergehen

**Nimm dir 2 Minuten.** Beantworte aus dem Gedaechtnis:

> *"Was ist der Unterschied zwischen Sum Type und Product Type?
> Erklaere es anhand der Kardinalitaet mit je einem TypeScript-Beispiel.
> Warum nennt man sie 'algebraisch'?"*

Wenn das klar ist — weiter zu Sektion 4.

---

> **Pausenpunkt:** Du verstehst jetzt die theoretischen Grundlagen von ADTs.
> In der naechsten Sektion wenden wir das auf zwei der praktischsten
> Patterns an: Option (Some/None) und Result (Ok/Err).
>
> Weiter: [Sektion 04 - Option und Result Pattern](./04-option-und-result-pattern.md)
