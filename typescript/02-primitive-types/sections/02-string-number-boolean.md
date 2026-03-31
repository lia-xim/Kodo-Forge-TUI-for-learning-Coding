# Sektion 2: string, number, boolean — die drei Basics

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Das Typsystem im Ueberblick](./01-das-typsystem-ueberblick.md)
> Naechste Sektion: [03 - null und undefined](./03-null-und-undefined.md)

---

## Was du hier lernst

- Warum **Kleinbuchstaben** (`string`) und nicht Grossbuchstaben (`String`)
- Die Tuecken von `number` (IEEE 754, Gleitkomma, NaN)
- Wie Template Literal Types die Typ-Ebene fuer `string` revolutionieren

---

## string

```typescript
let name: string = "Matthias";
let greeting: string = `Hallo, ${name}!`;   // Template Literal
let empty: string = '';
```

Strings in TypeScript sind immer **Unicode (UTF-16)**, genau wie in JavaScript.
Das bedeutet: Jeder Character braucht 2 Bytes, und Emoji oder seltene Zeichen
brauchen **Surrogate Pairs** (2 Code Units fuer ein Zeichen).

```typescript
"a".length;     // 1
"😀".length;    // 2 (!)  — ein Emoji besteht aus 2 UTF-16 Code Units
[..."😀"].length; // 1    — Spread-Operator kennt Unicode korrekt
```

### Template Literal Types — Strings auf der Typ-Ebene

Template Literals (mit Backticks) sind besonders maechtig in TypeScript,
weil sie zu **Template Literal Types** werden koennen. Das ist eine
Faehigkeit, die TypeScript 4.1 (November 2020) eingefuehrt hat und die
in keiner anderen Mainstream-Sprache existiert:

```typescript
// Einfache Template Literal Types:
type EventName = `on${string}`;          // "onClick", "onHover", ...
type CssUnit = `${number}px` | `${number}rem` | `${number}%`;
type ApiRoute = `/api/${string}`;

// TypeScript prueft das zur Compilezeit!
function on(eventName: `on${string}`, handler: () => void): void { }
on("onClick", () => {});    // OK
// on("click", () => {});   // Error! Muss mit "on" anfangen
```

> ⚡ **Praxis-Tipp:** Template Literal Types sind in Angular und React
> ueberraschend nuetzlich:
>
> ```typescript
> // Angular: Route-Parameter typisieren
> type RouteParam = `:${string}`;  // ":id", ":userId", ...
>
> // React: CSS-in-JS Werte einschraenken
> type Spacing = `${number}px` | `${number}rem`;
> function Box({ padding }: { padding: Spacing }) { /* ... */ }
> ```

---

## number

```typescript
let ganzzahl: number = 42;
let dezimal: number = 3.14;
let hex: number = 0xff;
let binaer: number = 0b1010;
let oktal: number = 0o777;
let negativ: number = -100;
let unendlich: number = Infinity;
let keineZahl: number = NaN;       // Ja, NaN ist vom Typ number!
```

**Wichtig:** `number` ist immer ein **64-bit IEEE 754 Gleitkommazahl**.
JavaScript kennt keinen Unterschied zwischen Integer und Float — alles
ist `number`. Das hat Konsequenzen:

```typescript
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);   // false!
```

> 📖 **Hintergrund: Warum 0.1 + 0.2 !== 0.3**
>
> Das ist **kein JavaScript-Bug** — es ist IEEE 754, der gleiche Standard
> den C, Java, Python, Go und praktisch jede moderne Sprache nutzen.
>
> Das Problem: Dezimalzahlen wie 0.1 und 0.2 lassen sich im Binaersystem
> nicht exakt darstellen — genau wie 1/3 im Dezimalsystem endlos wird
> (0.333...). Der Computer speichert die naechstmoegliche Approximation,
> und die Summe zweier Approximationen hat eine kleine Abweichung.
>
> Dieses Problem existiert seit den 1960ern und wurde von William Kahan
> formalisiert, der dafuer 1989 den Turing Award erhielt. Es betrifft
> **jede Sprache** die IEEE 754 verwendet — nicht nur JavaScript.
>
> **Loesung fuer Geldbetraege:**
> ```typescript
> // FALSCH: Gleitkomma-Probleme!
> const preis: number = 19.99;
> const menge: number = 3;
> console.log(preis * menge);  // 59.96999999999999 — nicht 59.97!
>
> // RICHTIG: Arbeite in Cent (ganzzahlig)
> const preisCent: number = 1999;  // 19.99 EUR in Cent
> const summe = preisCent * menge; // 5997 — exakt!
> const anzeige = (summe / 100).toFixed(2);  // "59.97"
> ```

### NaN — die irrefuehrende "Zahl"

```typescript
typeof NaN;            // "number"  — NaN IST vom Typ number!
NaN === NaN;           // false     — NaN ist der EINZIGE Wert, der sich selbst ungleich ist!
Number.isNaN(NaN);     // true      — die sichere Pruefung
isNaN("hallo");        // true      — ACHTUNG: die globale Funktion konvertiert!
Number.isNaN("hallo"); // false     — Number.isNaN konvertiert NICHT
```

> 📖 **Hintergrund: Warum ist NaN !== NaN?**
>
> Auch das kommt aus IEEE 754. Die Idee: NaN entsteht aus undefinierten
> Operationen wie `0/0` oder `Math.sqrt(-1)`. Da verschiedene undefinierte
> Operationen verschiedene "Nicht-Zahlen" erzeugen, waere es falsch zu
> sagen, sie seien "gleich". `NaN` bedeutet "irgendein undefiniertes
> Ergebnis" — und zwei verschiedene undefinierte Ergebnisse sind nicht
> notwendig identisch.
>
> In der Praxis ist das ein haeufiger Bug-Verursacher:
> ```typescript
> const result = someCalculation();
> if (result === NaN) { /* WIRD NIE AUSGEFUEHRT! */ }
> if (Number.isNaN(result)) { /* Richtig! */ }
> ```

### Sichere Ganzzahl-Grenze

`Number.MAX_SAFE_INTEGER` ist `9007199254740991` (2^53 - 1).
Ueber diesem Wert verliert `number` an Praezision:

```typescript
console.log(9007199254740991 + 1);  // 9007199254740992 — korrekt
console.log(9007199254740991 + 2);  // 9007199254740992 — FALSCH! Praezisionsverlust!
```

Fuer groessere Zahlen gibt es `bigint` (Sektion 5).

---

## boolean

```typescript
let aktiv: boolean = true;
let fertig: boolean = false;
```

Boolean ist der einfachste Typ: nur `true` oder `false`. Aber Vorsicht
mit **truthy/falsy** Werten in JavaScript:

```typescript
// Diese Werte sind alle "falsy":
// false, 0, -0, 0n, "", null, undefined, NaN

// TypeScript hilft hier: wenn du boolean erwartest,
// musst du auch boolean liefern:
function setActive(active: boolean) { /* ... */ }
setActive(1);       // Error! number ist nicht boolean
setActive(!!1);     // OK, explizite Konvertierung zu true
```

> 🔍 **Tieferes Wissen: Boolean und Narrowing**
>
> Boolean spielt eine besondere Rolle beim **Control Flow Narrowing**.
> TypeScript analysiert `if`-Bedingungen und engt Typen ein:
>
> ```typescript
> function process(value: string | null) {
>   if (value) {           // truthy check
>     value.toUpperCase(); // TypeScript weiss: string (nicht null)
>   }
>   // ABER ACHTUNG: Leerer String "" ist auch falsy!
>   // Das heisst: "" wird hier wie null behandelt
> }
>
> // Sicherer:
> function process2(value: string | null) {
>   if (value !== null) {       // expliziter null-check
>     value.toUpperCase();      // OK — auch "" funktioniert
>   }
> }
> ```

---

## Warum Kleinbuchstaben? string vs String

Das ist eine der **haeufigsten Verwirrungen** bei TypeScript-Anfaengern:

```typescript
// RICHTIG: primitive Typen mit Kleinbuchstaben
let a: string = "hallo";
let b: number = 42;
let c: boolean = true;

// FALSCH: Wrapper-Objekte (niemals verwenden!)
let x: String = "hallo";   // Das ist ein Objekt, kein Primitiv!
let y: Number = 42;
let z: Boolean = true;
```

`String`, `Number`, `Boolean` (gross) sind **Wrapper-Objekte** aus
JavaScript. Sie existieren aus historischen Gruenden.

> 📖 **Hintergrund: Warum gibt es Wrapper-Objekte ueberhaupt?**
>
> Als Brendan Eich 1995 JavaScript in 10 Tagen entwarf, uebernahm er
> eine Idee aus Java: Primitive brauchen manchmal Methoden (z.B.
> `"hallo".toUpperCase()`). Da Primitive keine Objekte sind, erstellt
> JavaScript **temporaere Wrapper-Objekte** im Hintergrund:
>
> ```typescript
> "hallo".toUpperCase();
> // Was JavaScript intern macht:
> // 1. new String("hallo") erstellen
> // 2. .toUpperCase() aufrufen
> // 3. Wrapper-Objekt sofort verwerfen
> ```
>
> Diese Wrapper-Objekte (`String`, `Number`, `Boolean`) kann man auch
> explizit mit `new` erstellen — aber das sollte man **niemals** tun:
>
> ```typescript
> "hallo" === new String("hallo");  // false! Primitiv !== Objekt
> typeof "hallo";                    // "string"
> typeof new String("hallo");        // "object" (!)
> ```

**Die Regel ist einfach und absolut:**

> **Immer Kleinbuchstaben verwenden: `string`, `number`, `boolean`.**
> Die Grossbuchstaben-Varianten (`String`, `Number`, `Boolean`) sind
> Wrapper-Objekte und fuehren zu subtilen Bugs.

Die TypeScript-eigene ESLint-Konfiguration warnt automatisch vor der
Verwendung von Wrapper-Typen. Wenn du `@typescript-eslint` verwendest
(was du solltest), ist das die Regel `@typescript-eslint/ban-types`.

---

## Praxis-Szenarien: Welchen Basis-Typ wann?

| Szenario | Typ | Warum |
|---|---|---|
| Geldbetraege | `number` **in Cent** | 1999 statt 19.99 — vermeidet Gleitkomma |
| Benutzereingaben | `string` (immer!) | Eingaben sind immer Strings, parsen erst nach Validierung |
| Feature Flags | `boolean` | Einfach und klar: an/aus |
| Enum-artige Werte | String Literal Union | `"admin" \| "user" \| "guest"` statt `enum` |
| CSS-Werte | Template Literal Type | `` `${number}px` `` fuer typsichere CSS-Werte |
| Kleine Zahlen (Alter, Index) | `number` | Keine Praezisionsprobleme unter 2^53 |

> ⚡ **Praxis-Tipp: Geld in Angular/React-Projekten**
>
> In jedem professionellen Projekt wirst du irgendwann mit Geldbetraegen
> arbeiten. Die wichtigste Regel:
>
> ```typescript
> // In deinem Angular-Service oder React-Hook:
> interface Preis {
>   betragInCent: number;  // 1999 fuer 19.99 EUR
>   waehrung: "EUR" | "USD" | "CHF";
> }
>
> // Nur zur ANZEIGE formatieren:
> function formatPreis(preis: Preis): string {
>   return new Intl.NumberFormat("de-DE", {
>     style: "currency",
>     currency: preis.waehrung,
>   }).format(preis.betragInCent / 100);
> }
> // formatPreis({ betragInCent: 1999, waehrung: "EUR" }) => "19,99 EUR"
> ```

---

## Was du gelernt hast

- Immer **Kleinbuchstaben**: `string`, `number`, `boolean` — nie die Wrapper-Objekte
- `number` ist IEEE 754: **0.1 + 0.2 !== 0.3** ist kein Bug, sondern Physik des Binaersystems
- `NaN` ist vom Typ `number` und ist **sich selbst ungleich** — nutze `Number.isNaN()`
- Template Literal Types ermoeglichen Typ-Pruefung auf **String-Muster**
- Geldbetraege immer in **Cent** rechnen, nie als Dezimalzahlen

**Kernkonzept zum Merken:** `number` hat eine sichere Grenze bei 2^53 - 1. Alles darueber verliert Praezision. Geld immer in der kleinsten Einheit (Cent) speichern.

> **Experiment:** Oeffne `examples/01-string-number-boolean.ts` und
> versuche folgendes:
> 1. Aendere `const name = "Max"` zu `let name = "Max"` — hovere in deiner
>    IDE ueber `name` und beobachte wie sich der Typ aendert (von `"Max"` zu `string`).
> 2. Schreibe `const preis: Number = 19.99` (Grossbuchstabe!) — was sagt der Compiler?
> 3. Tippe `console.log(0.1 + 0.2 === 0.3)` und fuehre es aus. Ueberrascht?

---

> **Pausenpunkt** -- Die drei wichtigsten Typen sitzen. Ab hier kommen
> die spezielleren Typen, die TypeScript von JavaScript unterscheiden.
>
> Weiter geht es mit: [Sektion 03: null und undefined](./03-null-und-undefined.md)
