# Cheatsheet: Functions

## Funktionstypen -- Schnellreferenz

```typescript
// Function Declaration
function add(a: number, b: number): number { return a + b; }

// Arrow Function
const add = (a: number, b: number): number => a + b;

// Function Type Expression
type MathOp = (a: number, b: number) => number;

// Optionaler Parameter
function greet(name: string, greeting?: string): string { ... }

// Default-Parameter (macht ? ueberfluessig)
function greet(name: string, greeting: string = "Hallo"): string { ... }

// Rest-Parameter
function sum(...numbers: number[]): number { ... }

// Destructuring-Parameter (Typ NACH dem Pattern!)
function f({ name, age }: { name: string; age: number }): void { ... }
```

---

## void vs undefined

| Kontext | void | undefined |
|---------|------|-----------|
| Bedeutung | Rueckgabewert irrelevant | Konkreter Wert undefined |
| Bei Deklaration | **Streng** (kein return erlaubt) | return undefined; noetig |
| Bei Callback-Typ | **Tolerant** (darf Wert zurueckgeben) | -- |
| Zuweisung | void !== undefined | undefined ist konkreter Typ |

---

## Function Overloads

```typescript
// Spezifische Overloads ZUERST
function format(x: string): string;    // Overload 1
function format(x: number): string;    // Overload 2
function format(x: string | number): string {  // Implementation (unsichtbar)
  return String(x);
}
```

**Regeln:**
1. Implementation Signature ist fuer Aufrufer **unsichtbar**
2. Implementation muss **alle** Overloads abdecken
3. Spezifische Overloads **zuerst**, breite zuletzt
4. Nur verwenden wenn Return-Typ vom Argument-**Wert** abhaengt

---

## Callbacks

```typescript
// Callback-Typ
type Callback = (value: string) => void;

// Generischer Callback
type Mapper<T, U> = (item: T, index: number) => U;

// void-Callback: Darf Werte zurueckgeben!
type VoidCb = () => void;
const fn: VoidCb = () => 42;  // OK!
```

---

## this-Parameter

```typescript
// this-Parameter (verschwindet im JS — Type Erasure)
function greet(this: { name: string }): string {
  return this.name;
}
greet.call({ name: "Max" });

// Arrow Function: Erbt this lexikalisch
class Timer {
  seconds = 0;
  start() {
    setInterval(() => { this.seconds++; }, 1000);
  }
}
```

---

## Type Guards & Assertion Functions

```typescript
// Type Guard: boolean + if-Verzweigung
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Assertion Function: wirft bei Misserfolg
function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("Not a string");
}

// Verwendung:
if (isString(x)) { x.toUpperCase(); }       // Type Guard
assertString(x); x.toUpperCase();             // Assertion Function
```

---

## Currying

```typescript
function createFormatter(locale: string): (amount: number) => string {
  return (amount) => new Intl.NumberFormat(locale).format(amount);
}
const fmt = createFormatter("de-DE");
fmt(1234.56); // "1.234,56"
```

---

## Entscheidungshilfe: Wann was?

| Situation | Empfehlung |
|-----------|------------|
| Return-Typ variiert je nach Input | **Overloads** |
| Gleicher Return-Typ fuer alle Inputs | **Union Types** |
| Viele optionale Parameter | **Options-Objekt-Pattern** |
| Callback mit this-Zugriff | **Arrow Function** |
| Methode auf Prototype | **Regulaere Methode** |
| Benutzerdefiniertes Narrowing | **Type Guard** |
| Garantie oder throw | **Assertion Function** |
| Konfiguration + Ausfuehrung trennen | **Currying** |
