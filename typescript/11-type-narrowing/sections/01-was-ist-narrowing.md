# Sektion 1: Was ist Narrowing?

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - typeof Guards](./02-typeof-guards.md)

---

## Was du hier lernst

- Was Type Narrowing ist und warum TypeScript es braucht
- Wie **Control Flow Analysis** funktioniert — TypeScript "liest" deinen Code
- Der fundamentale Zusammenhang zwischen Narrowing und Union Types
- Warum Narrowing die wichtigste Faehigkeit in Phase 2 ist

---

## Das Problem: Union Types sind nutzlos — ohne Narrowing

In Phase 1 hast du Union Types kennengelernt: `string | number`, `User | null`,
`"success" | "error"`. Aber stell dir vor, du hast eine Variable vom Typ
`string | number` — was kannst du damit machen?

```typescript
function verarbeite(wert: string | number) {
  // wert.toUpperCase();   // Error! number hat kein toUpperCase
  // wert.toFixed(2);       // Error! string hat kein toFixed
  // wert + 1;              // Error! Operator '+' auf string | number unklar
}
```

**Nichts.** Du kannst weder String-Methoden noch Number-Methoden aufrufen.
TypeScript muss sich auf den "schlimmsten Fall" vorbereiten — und der
schlimmste Fall ist, dass der Wert der andere Typ sein koennte.

> 💭 **Denkfrage:** Warum laesst TypeScript dich nicht einfach `toUpperCase()`
> aufrufen? Zur Laufzeit koennte es doch ein String sein?
>
> **Antwort:** TypeScript garantiert Typsicherheit zur Compilezeit. Wenn der
> Wert zur Laufzeit eine Zahl ist, wuerde `toUpperCase()` einen Crash
> verursachen. TypeScript verhindert diesen Crash, indem es dir erst
> BEWEISEN laesst, dass es ein String ist.

---

## Die Loesung: Type Narrowing

Type Narrowing ist der Prozess, bei dem TypeScript den Typ einer Variable
**innerhalb eines bestimmten Code-Blocks verengt**. Du schreibst einen Check,
und TypeScript versteht die Konsequenz:

```typescript annotated
function verarbeite(wert: string | number) {
  // Hier ist wert: string | number

  if (typeof wert === "string") {
    // ^ TypeScript erkennt: wert ist JETZT string
    console.log(wert.toUpperCase());
    // ^ toUpperCase() ist erlaubt, weil wert hier string ist
  } else {
    // ^ TypeScript schlussfolgert: wert muss number sein
    console.log(wert.toFixed(2));
    // ^ toFixed() ist erlaubt, weil wert hier number ist
  }
}
```

Das ist kein Zauber — TypeScript **analysiert den Kontrollfluss** deines
Codes und zieht logische Schlussfolgerungen. Das nennt man **Control Flow
Analysis** (CFA).

> 📖 **Hintergrund: Die Geburt von Control Flow Analysis**
>
> TypeScript hatte nicht immer CFA. Vor TypeScript 2.0 (2016) musste man
> Typen manuell casten. Anders Hejlsberg (TypeScript-Erfinder) fuehrte CFA
> in TypeScript 2.0 ein — inspiriert von Forschung zu "Flow-Sensitive
> Typing" aus den 1990er Jahren. Die Idee: Der Compiler sollte so schlau
> sein wie ein menschlicher Entwickler, der denselben Code liest.
>
> Facebook's Flow (ein Konkurrent von TypeScript) hatte eine aehnliche
> Analyse, aber TypeScript's Implementierung wurde zum Industriestandard.
> Heute haben auch Kotlin, Dart und sogar Java (Pattern Matching seit
> Java 16) aehnliche Mechanismen uebernommen.

---

## Wie Control Flow Analysis funktioniert

TypeScript baut beim Kompilieren einen **Kontrollflussgraphen** auf — eine
Karte aller moeglichen Wege, die dein Code nehmen kann. An jedem Punkt
weiss TypeScript genau, welche Typen eine Variable haben kann:

```
function demo(x: string | number | null) {
  // x: string | number | null
  |
  if (x === null) {
    // x: null
    return;
  }
  // x: string | number  <-- null wurde eliminiert!
  |
  if (typeof x === "string") {
    // x: string
  } else {
    // x: number
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `x` nach dem `if (x === null) { return; }`
> Block nicht mehr `null`? Wie kann TypeScript das wissen?
>
> **Kernpunkte:** Der return-Befehl beendet die Funktion | Wenn x null
> waere, waere die Funktion schon beendet | Also muss x im weiteren
> Verlauf NICHT null sein | Das ist "Narrowing by Elimination"

### Die drei Grundprinzipien

1. **Narrowing ist lokal**: Der verengte Typ gilt nur innerhalb des Blocks,
   wo der Check stattfindet — nicht danach.

2. **Narrowing ist kumulativ**: Mehrere Checks hintereinander verengen den
   Typ immer weiter.

3. **Narrowing ist eliminativ**: Jeder Check entfernt Moeglichkeiten aus
   dem Union Type, bis ein konkreter Typ uebrig bleibt.

```typescript annotated
function demo(x: string | number | boolean | null) {
  // x: string | number | boolean | null

  if (x === null) return;
  // x: string | number | boolean  (null eliminiert)

  if (typeof x === "boolean") return;
  // x: string | number  (boolean eliminiert)

  if (typeof x === "string") {
    // x: string  (number eliminiert)
    console.log(x.toUpperCase());
  } else {
    // x: number  (string eliminiert)
    console.log(x.toFixed(2));
  }
}
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> function demo(x: string | number | boolean | null) {
>   if (x === null) return;
>   // x: string | number | boolean (null eliminiert)
>
>   if (typeof x === "boolean") return;
>   // x: string | number (boolean eliminiert)
>
>   if (typeof x === "string") {
>     console.log(x.toUpperCase()); // x: string
>   } else {
>     console.log(x.toFixed(2)); // x: number
>   }
> }
> ```
> Kommentiere einzelne if-Checks aus und hovere ueber `x`. Jeder fehlende Check macht den Typ breiter.

---

## Narrowing-Mechanismen: Ein Ueberblick

TypeScript kennt viele Wege zum Narrowing. In den naechsten Sektionen
gehen wir jeden einzeln durch:

| Mechanismus | Beispiel | Sektion |
|---|---|---|
| `typeof` Guards | `typeof x === "string"` | 02 |
| `instanceof` | `x instanceof Date` | 03 |
| `in` Operator | `"name" in obj` | 03 |
| Equality Checks | `x === null`, `x !== undefined` | 04 |
| Truthiness | `if (x)`, `if (!x)` | 04 |
| Type Predicates | `function isString(x): x is string` | 05 |
| Assertion Functions | `function assert(x): asserts x is string` | 05 |
| Exhaustive Checks | `const _: never = x` | 06 |

**Wichtig:** Narrowing ist nicht nur fuer `if`-Statements. Es funktioniert
auch mit `switch`, ternary Operatoren (`? :`), `while`-Schleifen und
logischen Operatoren (`&&`, `||`, `??`).

---

## Narrowing vs. Type Assertions (as)

Es gibt einen wichtigen Unterschied zwischen Narrowing und Type Assertions:

```typescript
function gefaehrlich(wert: unknown) {
  // Type Assertion — DU sagst dem Compiler "vertrau mir"
  const s = wert as string;
  // Wenn wert eine Zahl ist, crasht das zur Laufzeit!
  console.log(s.toUpperCase());
}

function sicher(wert: unknown) {
  // Type Narrowing — DU beweist es dem Compiler
  if (typeof wert === "string") {
    console.log(wert.toUpperCase());
    // Hier ist es GARANTIERT ein String
  }
}
```

**Narrowing ist ein Beweis. Assertion ist ein Versprechen.**
Beweise sind sicher. Versprechen koennen gebrochen werden.

> 🔍 **Tieferes Wissen: Warum existieren Type Assertions dann ueberhaupt?**
>
> Type Assertions (`as`) sind ein Escape Hatch fuer Situationen, wo du
> mehr ueber den Code weisst als der Compiler. Zum Beispiel nach einer
> Laufzeit-Validierung durch eine externe Bibliothek wie `zod`, oder
> bei DOM-Elementen: `document.getElementById("app") as HTMLDivElement`.
> Die Regel: Wenn du `as` schreibst, hast du die Pflicht, sicherzustellen
> dass der Cast korrekt ist. Im Zweifel: Narrowing verwenden.

---

## Was du gelernt hast

- Type Narrowing verengt den Typ einer Variable innerhalb eines Code-Blocks
- Control Flow Analysis ist der Mechanismus, mit dem TypeScript deinen Code-Fluss analysiert
- Narrowing ist **eliminativ** (entfernt Moeglichkeiten), **kumulativ** (baut auf) und **lokal** (gilt im Block)
- Narrowing ist sicherer als Type Assertions (`as`), weil es ein Beweis ist, kein Versprechen

> 🧠 **Erklaere dir selbst:** Warum ist Narrowing sicherer als `as`?
> Was koennte passieren, wenn du `wert as string` schreibst, aber
> `wert` zur Laufzeit eine Zahl ist?
> **Kernpunkte:** as ueberzeugt nur den Compiler, nicht die Laufzeit |
> Falsches as fuehrt zu Laufzeit-Crashes | Narrowing prueft zur Laufzeit |
> Narrowing kann nie falsch sein

**Kernkonzept zum Merken:** Narrowing ist die Bruecke zwischen dem
allgemeinen Typ (Union) und dem konkreten Typ (string, number, etc.).
Ohne diese Bruecke sind Union Types wie verschlossene Tueren.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du hast das fundamentale
> Konzept verstanden. Ab jetzt lernst du die konkreten Werkzeuge.
>
> Weiter geht es mit: [Sektion 02: typeof Guards](./02-typeof-guards.md)
