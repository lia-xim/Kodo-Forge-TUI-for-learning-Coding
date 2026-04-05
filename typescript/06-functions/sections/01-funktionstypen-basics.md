# Sektion 1: Funktionstypen Basics

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Optionale und Default-Parameter](./02-optionale-und-default-parameter.md)

---

## Was du hier lernst

- Wie man **Parameter-Typen** und **Return-Typen** in TypeScript annotiert
- Den Unterschied zwischen **Function Declarations**, **Function Expressions** und **Arrow Functions**
- Warum `void` als Return-Typ etwas anderes bedeutet als `undefined`
- Wie **Function Type Expressions** als eigenstaendige Typen funktionieren

---

## Funktionen als Vertraege

Funktionen sind das Herzstueck jeder Anwendung. In JavaScript sind sie
extrem flexibel — vielleicht zu flexibel. TypeScript macht aus dieser
Flexibilitaet einen **praezisen Vertrag**:

```typescript annotated
function addiere(a: number, b: number): number {
//                ^^^^^^^^^  ^^^^^^^^^   ^^^^^^
//                Param 1    Param 2     Return-Typ
  return a + b;
}
```

Dieser Vertrag sagt: "Gib mir zwei Zahlen, und ich gebe dir eine Zahl zurueck."
TypeScript prueft das auf **beiden Seiten** — sowohl beim Aufrufer als
auch in der Implementation.

```typescript
addiere(1, 2);        // OK
addiere("1", "2");    // Error! string ist nicht number
addiere(1);           // Error! Erwartet 2 Argumente, erhalten: 1
addiere(1, 2, 3);     // Error! Erwartet 2 Argumente, erhalten: 3
```

> 💭 **Denkfrage:** In JavaScript wuerde `addiere(1)` und `addiere(1, 2, 3)` beide
> funktionieren (das zweite Argument waere `undefined`, das dritte wuerde ignoriert).
> Warum ist TypeScript hier strenger?
>
> **Antwort:** Weil fast immer ein Bug vorliegt, wenn die Anzahl der Argumente
> nicht stimmt. JavaScript's Toleranz ist historisch bedingt — TypeScript
> faengt diese Fehler ab, bevor sie in der Produktion auftreten.

---

## Drei Arten, Funktionen zu schreiben

### 1. Function Declaration

```typescript annotated
function multiply(a: number, b: number): number {
//       ^^^^^^^^ Name ist Teil der Deklaration
  return a * b;
}
// Wird "gehoisted" — kann vor der Deklaration aufgerufen werden
```

### 2. Function Expression

```typescript annotated
const multiply = function(a: number, b: number): number {
//    ^^^^^^^^   ^^^^^^^^ Variable erhaelt eine anonyme Funktion
  return a * b;
};
// KEIN Hoisting — muss vor dem Aufruf deklariert sein
```

### 3. Arrow Function

```typescript annotated
const multiply = (a: number, b: number): number => {
//                                        ^^^^^^ Return-Typ steht VOR dem Pfeil
  return a * b;
};

// Kurzform bei einem Ausdruck — implizites return:
const double = (n: number): number => n * 2;
//                                    ^^^^^ Wert wird direkt zurueckgegeben
```

> 📖 **Hintergrund: Warum Arrow Functions?**
>
> Arrow Functions wurden in ES2015 eingefuehrt. Der Hauptgrund war nicht
> die kuerzere Syntax, sondern das **lexikalische `this`**: Arrow Functions
> erben `this` von ihrem umgebenden Kontext, statt es selbst zu binden.
> Das loest eines der aeltesten und verwirrendsten Probleme in JavaScript.
> Wir kommen in Sektion 5 ausfuehrlich darauf zurueck.
>
> Fun Fact: Der Pfeil `=>` kommt aus der Lambda-Kalkuel-Notation (1930er,
> Alonzo Church). In Haskell schreibt man `\x -> x + 1`, in ML `fn x => x + 1`.
> JavaScript hat sich fuer `=>` entschieden — wie C# vor ihm.

---

## Return-Typ: Explizit oder inferiert?

TypeScript **inferiert** den Return-Typ automatisch:

```typescript
function greet(name: string) {
//                           ^ kein Return-Typ angegeben
  return `Hallo, ${name}!`;
}
// TypeScript inferiert: (name: string) => string
```

**Wann sollte man den Return-Typ explizit angeben?**

| Situation | Empfehlung | Grund |
|---|---|---|
| Private Hilfsfunktion | Inferieren lassen | Weniger Boilerplate |
| Oeffentliche API / exportierte Funktion | Explizit angeben | Dokumentation + Vertragssicherheit |
| Komplexe Funktion mit vielen Pfaden | Explizit angeben | Verhindert versehentliche Typ-Aenderungen |
| Rekursive Funktion | **Muss** explizit sein | TypeScript kann den Typ nicht inferieren |

```typescript
// Rekursive Funktion: Return-Typ ist PFLICHT
function fakultaet(n: number): number {
//                            ^^^^^^^^ MUSS angegeben werden!
  if (n <= 1) return 1;
  return n * fakultaet(n - 1);
}
```

> 🧠 **Erklaere dir selbst:** Warum kann TypeScript den Return-Typ einer rekursiven Funktion nicht inferieren? Was muesste der Compiler tun, und warum fuehrt das zu einem Zirkelproblem?
> **Kernpunkte:** Typ der Funktion haengt vom Rueckgabewert ab | Rueckgabewert enthaelt Aufruf der Funktion selbst | Compiler braeuchte den Typ den er gerade bestimmen will | Zirkulaere Abhaengigkeit

---

## void — "Kein sinnvoller Rueckgabewert"

```typescript
function logMessage(msg: string): void {
  console.log(msg);
  // Kein return noetig — oder: return;
  // NICHT: return undefined;  <-- das waere Typ 'undefined', nicht 'void'
}
```

**Der kritische Unterschied:**

```typescript annotated
// void: "Der Rueckgabewert ist irrelevant"
function doSomething(): void { /* ... */ }

// undefined: "Gibt den konkreten Wert undefined zurueck"
function getNothing(): undefined { return undefined; }

// void kann NICHT an undefined zugewiesen werden:
const result: undefined = doSomething();
//    ^^^^^^ Error! void ist nicht undefined
```

> 🔍 **Tieferes Wissen: Warum diese Unterscheidung?**
>
> `void` als Return-Typ hat eine spezielle Bedeutung bei Callbacks.
> Eine Funktion vom Typ `() => void` **darf** trotzdem einen Wert
> zurueckgeben — der Wert wird nur ignoriert. Das ist absichtlich so,
> damit z.B. `arr.forEach(item => arr.push(item))` funktioniert:
> `push` gibt `number` zurueck, aber `forEach` erwartet `() => void`.
> Wir vertiefen das in Sektion 4.

---

## Function Type Expressions

Funktionen sind **First-Class Citizens** in JavaScript — sie sind Werte.
Und wie jeder Wert brauchen sie einen Typ:

```typescript annotated
// Function Type Expression: (Parameter) => Return
type MathOperation = (a: number, b: number) => number;
//                    ^^^^^^^^^^^^^^^^^^^^^^    ^^^^^^
//                    Parameter-Liste            Return-Typ

const add: MathOperation = (a, b) => a + b;
//   ^^^   ^^^^^^^^^^^^^
//   Variable hat den Typ  TypeScript kennt a und b automatisch als number

const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
```

**Wichtig:** Die Parameternamen im Typ muessen **nicht** mit der
Implementation uebereinstimmen:

```typescript
type Formatter = (input: string) => string;

// "text" statt "input" — voellig OK:
const shout: Formatter = (text) => text.toUpperCase();
```

### Interface vs. Type fuer Funktionen

```typescript
// Mit type (haeufiger fuer Funktionstypen):
type Comparator = (a: number, b: number) => number;

// Mit Interface (seltener, aber moeglich):
interface ComparatorInterface {
  (a: number, b: number): number;
}

// Beide sind funktional identisch!
```

> 💭 **Denkfrage:** Wann wuerde man ein Interface statt eines Type-Alias
> fuer eine Funktion verwenden?
>
> **Antwort:** Wenn die Funktion zusaetzliche Properties haben soll —
> z.B. `Formatter.defaultLocale = "de"`. Interfaces erlauben Declaration
> Merging, Type-Aliases nicht. In der Praxis reicht meist `type`.

---

## Annotated Code: Funktion als Parameter

```typescript annotated
function applyTwice(fn: (x: number) => number, value: number): number {
//                  ^^  ^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^          ^^^^^^
//                  Name  Funktionstyp inline    zweiter Param  Return
  return fn(fn(value));
//       ^^ ^^^^^^^^^ Erste Anwendung, dann zweite
}

const result = applyTwice(x => x * 2, 5);
// Schritt 1: fn(5) = 10
// Schritt 2: fn(10) = 20
console.log(result); // 20
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> function addiere(a: number, b: number): string {
>   return a + b;
> }
> ```
>
> TypeScript meldet sofort: *"Type 'number' is not assignable to type 'string'."*
> Aendere jetzt den Funktionskoerper, damit er passt: `return String(a + b);`
> Beobachte, wie der Vertrag auf **beiden Seiten** durchgesetzt wird — sowohl
> die Implementation als auch alle Aufrufer muessen sich anpassen.

---

**In deinem Angular-Projekt:** Angular nutzt Function Type Expressions ueberall.
Ein `EventEmitter<T>` nimmt Callbacks entgegen, die exakt diesem Muster folgen:

```typescript
// Angular EventEmitter mit typisiertem Callback
import { EventEmitter } from '@angular/core';

export class ButtonComponent {
  clicked = new EventEmitter<{ x: number; y: number }>();

  // Der Handler im Parent muss die Function Type Expression erfullen:
  // (event: { x: number; y: number }) => void
  onParentClick(event: { x: number; y: number }): void {
    console.log(`Klick bei ${event.x}, ${event.y}`);
  }
}
```

Auch RxJS-Operatoren wie `map` und `filter` sind Function Type Expressions:
`map((user: User) => user.name)` — TypeScript inferiert den Output-Typ `string`
automatisch aus dem Return-Typ des Callbacks.

---

## Was du gelernt hast

- Funktionen in TypeScript haben **typisierte Parameter** und **typisierte Rueckgabewerte**
- Es gibt drei Schreibweisen: Declaration, Expression, Arrow Function
- `void` bedeutet "Rueckgabewert ist irrelevant" — nicht dasselbe wie `undefined`
- **Function Type Expressions** (`type Fn = (x: T) => U`) machen Funktionen zu vollwertigen Typen
- Return-Typen werden meist inferiert, sollten aber bei oeffentlichen APIs explizit sein

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen `void` und `undefined` als Return-Typ? Wann wuerdest du welchen verwenden?
> **Kernpunkte:** void = Rueckgabewert irrelevant, Callback-Kompatibilitaet | undefined = konkreter Wert | void bei Side-Effect-Funktionen | undefined wenn der Aufrufer den Wert braucht

**Kernkonzept zum Merken:** Eine Funktion in TypeScript ist ein Vertrag. Parameter-Typen und Return-Typ definieren, was hereinkommt und was herauskommt. TypeScript prueft beide Seiten.

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du hast die Grundlagen
> der Funktionstypisierung verstanden. Ab jetzt bauen wir darauf auf.
>
> Weiter geht es mit: [Sektion 02: Optionale und Default-Parameter](./02-optionale-und-default-parameter.md)
