# Sektion 3: Function Overloads

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Optionale und Default-Parameter](./02-optionale-und-default-parameter.md)
> Naechste Sektion: [04 - Callback-Typen](./04-callback-typen.md)

---

## Was du hier lernst

- Was **Function Overloads** in TypeScript sind und wie sie sich von Java/C# unterscheiden
- Den Unterschied zwischen **Overload-Signaturen** und der **Implementation Signature**
- Wann Overloads **sinnvoll** sind und wann man sie besser vermeidet
- Wie TypeScript die **richtige Overload-Signatur** auswaehlt

---

## Das Problem: Eine Funktion, mehrere Formen

Stell dir vor, du schreibst eine `createElement`-Funktion:

```typescript
// Diese Funktion soll verschiedene Elemente erstellen:
createElement("img")     // → HTMLImageElement
createElement("input")   // → HTMLInputElement
createElement("div")     // → HTMLDivElement
```

**Das Problem:** Der Return-Typ haengt vom Wert des Arguments ab.
Mit einem einfachen Union-Typ geht das nicht praezise:

```typescript
// Unpraezise: Return ist IMMER der breite Union
function createElement(tag: "img" | "input" | "div"):
  HTMLImageElement | HTMLInputElement | HTMLDivElement {
  // ...
}

const img = createElement("img");
// Typ: HTMLImageElement | HTMLInputElement | HTMLDivElement
// Wir WISSEN aber, dass es ein HTMLImageElement sein muss!
```

Hier kommen **Overloads** ins Spiel.

---

## Overloads: Syntax und Struktur

```typescript annotated
// ─── Overload-Signaturen (fuer den Aufrufer sichtbar) ─────────────────
function createElement(tag: "img"): HTMLImageElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: "div"): HTMLDivElement;
// ─── Implementation Signature (NUR intern sichtbar) ───────────────────
function createElement(tag: string): HTMLElement {
//                     ^^^^^^^^^^^ Muss ALLE Overloads abdecken
  return document.createElement(tag);
}

const img = createElement("img");
//    ^^^ Typ: HTMLImageElement — praezise!

const input = createElement("input");
//    ^^^^^ Typ: HTMLInputElement — praezise!
```

> 📖 **Hintergrund: Overloads in TypeScript vs. Java/C#**
>
> In Java oder C# hat jede Overload eine **eigene Implementation**.
> In TypeScript gibt es **eine einzige Implementation** — die Overload-
> Signaturen sind reine Compilezeit-Informationen (Type Erasure!).
> Zur Laufzeit existiert nur eine Funktion. Das bedeutet: Du musst
> in der Implementation **selbst** unterscheiden, welcher Fall vorliegt.
>
> Das ist eine direkte Konsequenz des Grundprinzips aus Lektion 02:
> TypeScript-Typen existieren NUR zur Compilezeit.

---

## Die Regeln der Overloads

### Regel 1: Die Implementation Signature ist fuer Aufrufer unsichtbar

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
//                     ^^^^^^^^^^^^^^^^ Implementation Signature
  return String(value);
}

format("hallo");  // OK — passt auf Overload 1
format(42);       // OK — passt auf Overload 2
format(true);     // Error! Kein Overload passt
//                   Obwohl boolean zu (string | number) kompatibel waere
//                   im Implementationstyp — die Aufrufer sehen NUR die Overloads!
```

### Regel 2: Die Implementation muss ALLE Overloads abdecken

```typescript
function double(x: string): string;
function double(x: number): number;
// Implementation muss sowohl string als auch number handlen:
function double(x: string | number): string | number {
  if (typeof x === "string") {
    return x + x;        // String-Duplikation
  }
  return x * 2;           // Zahlen-Verdopplung
}

double("ha");  // Typ: string → "haha"
double(21);    // Typ: number → 42
```

### Regel 3: Overloads werden von oben nach unten geprueft

```typescript annotated
function process(value: string): string;
function process(value: string | number): number;
//                      ^^^^^^^^^^^^^^^^ Breiter als Overload 1
function process(value: string | number): string | number {
  if (typeof value === "string") return value.toUpperCase();
  return value * 2;
}

const a = process("hello");
//    ^ Typ: string — Overload 1 matcht zuerst

const b = process(42);
//    ^ Typ: number — Overload 1 passt nicht, Overload 2 matcht
```

> 💭 **Denkfrage:** Was passiert, wenn du die Reihenfolge der Overloads
> vertauschst — also den breiteren zuerst hinschreibst?
>
> **Antwort:** Dann wuerde `process("hello")` auf den breiten Overload
> matchen und den Typ `number` bekommen — was falsch waere! Deshalb:
> **Spezifische Overloads zuerst, breite zuletzt.**

---

## Wann Overloads — und wann nicht?

### Verwende Overloads wenn:

Der Return-Typ **vom Wert des Arguments** abhaengt:

```typescript
// GUT: Return-Typ variiert je nach Argument
function parse(input: string): object;
function parse(input: string, asArray: true): unknown[];
function parse(input: string, asArray?: boolean): object | unknown[] {
  const result = JSON.parse(input);
  if (asArray) return Array.isArray(result) ? result : [result];
  return result;
}
```

### Vermeide Overloads wenn:

Ein einfacher **Union-Typ** oder **Generics** das gleiche Ergebnis liefern:

```typescript
// SCHLECHT: Overloads wo Union reichen wuerde
function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]): number {
  return x.length;
}

// BESSER: Einfacher Union-Typ
function len(x: string | unknown[]): number {
  return x.length;
}
```

> 🔍 **Tieferes Wissen: Die TypeScript-Team-Empfehlung**
>
> Das TypeScript-Team empfiehlt explizit:
> *"Always prefer parameters with union types instead of overloads
> when possible."* (TypeScript Handbook)
>
> Der Grund: Overloads erhoehen die Komplexitaet, und der Compiler
> kann bei Union-Typen besser Type Narrowing durchfuehren. Overloads
> sind ein Praezisions-Werkzeug fuer die Faelle, wo Unions nicht
> ausreichen — nicht der Standard-Ansatz.

---

## Praxisbeispiel: Event-Handler

```typescript annotated
// Overloads: Verschiedene Events → verschiedene Event-Objekte
function addEventListener(
  event: "click",
  handler: (e: MouseEvent) => void
): void;
function addEventListener(
  event: "keydown",
  handler: (e: KeyboardEvent) => void
): void;
function addEventListener(
  event: "submit",
  handler: (e: SubmitEvent) => void
): void;
function addEventListener(
  event: string,
  handler: (e: Event) => void
): void {
  // Implementation: Event-Listener registrieren
  document.addEventListener(event, handler as EventListener);
}

// TypeScript weiss den genauen Event-Typ:
addEventListener("click", (e) => {
//                          ^ Typ: MouseEvent — praezise!
  console.log(e.clientX, e.clientY);
});

addEventListener("keydown", (e) => {
//                            ^ Typ: KeyboardEvent — praezise!
  console.log(e.key);
});
```

> 🧠 **Erklaere dir selbst:** Warum braucht man fuer diesen Event-Handler Overloads statt eines einfachen Union-Typs? Was waere das Problem mit `event: "click" | "keydown" | "submit", handler: (e: MouseEvent | KeyboardEvent | SubmitEvent) => void`?
> **Kernpunkte:** Union verliert die Verbindung zwischen Event-Name und Event-Typ | "click" koennte mit KeyboardEvent-Handler aufgerufen werden | Overloads verknuepfen: "click" → MouseEvent, "keydown" → KeyboardEvent | Typsicherheit auf Korrelation

---

## Was du gelernt hast

- **Overload-Signaturen** definieren die moeglichen Aufruf-Formen (fuer den Aufrufer sichtbar)
- Die **Implementation Signature** muss alle Overloads abdecken (fuer den Aufrufer unsichtbar)
- TypeScript prueft Overloads **von oben nach unten** — spezifische zuerst
- Overloads sind nur sinnvoll, wenn der **Return-Typ vom Argument-Wert** abhaengt
- Bei gleichem Return-Typ sind **Union-Typen besser** als Overloads

> **Experiment:** Oeffne `examples/03-function-overloads.ts` und fuege
> einen neuen Overload fuer `createElement("canvas")` hinzu, der
> `HTMLCanvasElement` zurueckgibt. Wo genau musst du die Signatur
> einfuegen und warum?

**Kernkonzept zum Merken:** Overloads verknuepfen Input und Output praeziser als Union-Typen. Aber: Nur verwenden, wenn ein Union nicht reicht.

---

> **Pausenpunkt** — Overloads sind ein fortgeschrittenes Werkzeug.
> Wenn du sie verstanden hast, bist du auf einem guten Weg.
>
> Weiter geht es mit: [Sektion 04: Callback-Typen](./04-callback-typen.md)
