# Sektion 5: Fortgeschrittene Constraints

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - in/out Modifier](./04-in-out-modifier.md)
> Naechste Sektion: [06 - Generische APIs designen](./06-generische-apis-designen.md)

---

## Was du hier lernst

- **Intersection-Constraints** (`T extends A & B`) — mehrere Anforderungen gleichzeitig
- **Recursive Constraints** (`T extends Comparable<T>`) — das F-bounded Polymorphism Pattern
- **Distributives Verhalten** bei Conditional Types und wie man es kontrolliert
- Wie man **Constraints kombiniert** fuer maximale Typsicherheit

---

## Intersection-Constraints: Mehrere Anforderungen

In Lektion 13 hast du einfache Constraints gelernt: `T extends HasId`.
Aber was wenn T mehrere Interfaces gleichzeitig erfuellen muss?

```typescript annotated
interface HasId { id: number; }
interface HasName { name: string; }
interface Serializable { serialize(): string; }

// Einfacher Constraint — eine Anforderung:
function getIdSimple<T extends HasId>(item: T): number {
  return item.id;
}

// Intersection-Constraint — MEHRERE Anforderungen:
function processEntity<T extends HasId & HasName & Serializable>(item: T): string {
  console.log(`Processing ${item.name} (ID: ${item.id})`);
  return item.serialize();
}
// ^^^ T muss ALLE drei Interfaces erfuellen:
//     id: number UND name: string UND serialize(): string

// Verwendung:
const user = {
  id: 1,
  name: "Max",
  serialize() { return JSON.stringify({ id: this.id, name: this.name }); }
};
processEntity(user); // OK — hat alle drei Properties

// processEntity({ id: 1 });
// ^^^ ERROR: name und serialize fehlen!
```

> 📖 **Hintergrund: Warum `&` statt separate Constraints?**
>
> In Java schreibt man `<T extends A & B>` — gleiche Syntax. Aber in Java
> sind das separate Bounds, nicht eine Intersection. TypeScript nutzt den
> gleichen `&`-Operator wie bei normalen Intersection-Types. Das ist
> konsistent: `T extends A & B` ist dasselbe wie "T muss ein Subtyp der
> Intersection von A und B sein".
>
> Der Vorteil gegenueber separaten Constraints: Man kann beliebig viele
> Interfaces kombinieren, Partial<> einmischen, und sogar Conditional
> Types innerhalb des Constraints verwenden.

---

## Extra Properties sind erlaubt

Ein oft uebersehener Aspekt: Bei generischen Constraints sind extra
Properties kein Problem (anders als bei direkter Objekt-Zuweisung):

```typescript annotated
interface HasId { id: number; }
interface HasName { name: string; }

function greet<T extends HasId & HasName>(entity: T): string {
  return `Hello ${entity.name} (#${entity.id})`;
}

// Extra Properties sind OK:
const fullUser = { id: 1, name: "Max", email: "max@test.de", age: 30 };
greet(fullUser);
// ^^^ T wird als { id: number; name: string; email: string; age: number }
//     inferiert. Extra Properties sind bei Generics erlaubt!
//     (Anders als bei direkter Zuweisung an ein Interface.)

// Der Constraint sagt nur: "mind. id und name".
// Alles darueber hinaus ist OK.
```

---

## Recursive Constraints: F-bounded Polymorphism

Eine der maechtigsten Constraint-Techniken: Der Typparameter referenziert
sich **selbst** im Constraint.

```typescript annotated
// Das Comparable-Pattern (bekannt aus Java):
interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}
// ^^^ T extends Comparable<T> — T muss sich SELBST vergleichen koennen!
//     Das stellt sicher: Aepfel vergleichen sich nur mit Aepfeln,
//     nicht mit Birnen.

class Temperature implements Comparable<Temperature> {
  constructor(public celsius: number) {}

  compareTo(other: Temperature): number {
    return this.celsius - other.celsius;
  }
}

class Weight implements Comparable<Weight> {
  constructor(public kg: number) {}

  compareTo(other: Weight): number {
    return this.kg - other.kg;
  }
}

// Typsichere sort-Funktion:
function sortItems<T extends Comparable<T>>(items: T[]): T[] {
  return [...items].sort((a, b) => a.compareTo(b));
}

const temps = sortItems([new Temperature(30), new Temperature(20)]);
// ^^^ OK — Temperature vergleicht sich mit Temperature.

// sortItems([new Temperature(30), new Weight(70)]);
// ^^^ ERROR! Temperature[] und Weight[] mischen geht nicht.
```

> 🧠 **Erklaere dir selbst:** Warum verteilt sich `T extends U ? X : Y`
> ueber Union-Typen wenn T ein "nackter" Typparameter ist? Was passiert
> bei `IsString<string | number>`?
>
> **Kernpunkte:** Nackter Typparameter = T ohne Wrapping (nicht [T]) |
> TypeScript verteilt: `IsString<string | number>` wird zu
> `IsString<string> | IsString<number>` | Jedes Union-Member wird einzeln
> geprueft | Das nennt man "Distributive Conditional Types"

---

## Distributive Conditional Types: Kontrolle

Du kennst Conditional Types aus Lektion 17. Hier die fortgeschrittene
Version: Distribution kontrollieren.

```typescript annotated
// DISTRIBUTIV (Standard): T verteilt sich ueber den Union
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;           // "yes"
type B = IsString<number>;           // "no"
type C = IsString<string | number>;  // "yes" | "no" — Distribution!
// ^^^ TypeScript macht: IsString<string> | IsString<number>
//     = "yes" | "no"

type D = IsString<never>;            // never — leerer Union!
// ^^^ never ist der leere Union. Distribution ueber 0 Members = never.

// NON-DISTRIBUTIV: Wrapping mit Tuple verhindert Distribution
type IsStringStrict<T> = [T] extends [string] ? "yes" : "no";

type E = IsStringStrict<string>;          // "yes"
type F = IsStringStrict<string | number>; // "no" — KEINE Distribution!
// ^^^ [string | number] extends [string] → false
//     Der Union wird als GANZES geprueft.

type G = IsStringStrict<never>;           // "yes"!
// ^^^ [never] extends [string] → true (never extends alles)
//     Ueberraschend! Ohne Distribution wird never normal geprueft.
```

---

> 🤔 **Denkfrage:** Was passiert mit `SomeType<string | number>` wenn
> SomeType einen Conditional Type enthaelt?
>
> ```typescript
> type Wrap<T> = T extends string ? { text: T } : { value: T };
> type Result = Wrap<string | number>;
> ```
>
> Antwort: Distribution! Result = `{ text: string } | { value: number }`.
> Jedes Union-Member wird einzeln verarbeitet.

---

## Bedingte Constraints mit Conditional Types

Man kann Constraints auch dynamisch machen — basierend auf dem Typ:

```typescript annotated
// Validator-Typ der sich an den Feld-Typ anpasst:
interface StringValidator { minLength: number; pattern: RegExp; }
interface NumberValidator { min: number; max: number; }

type ValidatorFor<T> = T extends string ? StringValidator
                     : T extends number ? NumberValidator
                     : never;
// ^^^ Conditional Type als "Constraint-Dispatch":
//     String → StringValidator, Number → NumberValidator

// Typsichere validate-Funktion:
function validate<T extends string | number>(
  value: T,
  validator: ValidatorFor<T>
): boolean {
  // TypeScript weiss: wenn T string ist, ist validator ein StringValidator
  return true; // (vereinfacht)
}

validate("hello", { minLength: 3, pattern: /^[a-z]+$/ }); // OK
validate(42, { min: 0, max: 100 }); // OK
// validate("hello", { min: 0, max: 100 }); // ERROR — falscher Validator!
```

---

> 🔬 **Experiment:** Kombiniere Intersection-Constraints mit Conditional
> Types:
>
> ```typescript
> interface HasId { id: number; }
> interface HasVersion { version: number; }
>
> // Nur versionierte Entities sollen serialize() brauchen:
> type RequiredMethods<T> = T extends HasVersion
>   ? { serialize(): string; validate(): boolean }
>   : { validate(): boolean };
>
> function process<T extends HasId>(
>   entity: T & RequiredMethods<T>
> ): void {
>   // entity hat id (von HasId) UND die passenden Methoden
> }
> ```
>
> Das ist maechtig: Die Anforderungen aendern sich basierend auf dem Typ!

---

## Distributive Behavior unterdruecken

Manchmal will man Distribution explizit **verhindern**. Hier sind die
drei Methoden:

```typescript annotated
type IsNullable<T> = T extends null | undefined ? true : false;

// Problem: Distribution bei Union
type A = IsNullable<string | null>; // true | false = boolean (nicht hilfreich!)

// Loesung 1: Tuple-Wrapping
type IsNullableStrict<T> = [T] extends [null | undefined] ? true : false;
type B = IsNullableStrict<string | null>; // false

// Loesung 2: Umgekehrte Richtung pruefen
type ContainsNull<T> = null extends T ? true : false;
type C = ContainsNull<string | null>; // true!
// ^^^ null extends (string | null) ist true!
//     Kein nackter Typparameter → keine Distribution.

// Loesung 3: Extract fuer gezielte Pruefung
type HasNull<T> = Extract<T, null> extends never ? false : true;
type D = HasNull<string | null>; // true
type E = HasNull<string>;        // false
```

---

## Der Framework-Bezug

> 🅰️ **Angular:** Angular's Reactive Forms nutzen fortgeschrittene
> Constraints: `FormControl<T extends AbstractControl>` stellt sicher,
> dass nur gueltige Control-Typen verwendet werden. Die neue Typed Forms
> API (Angular 14+) nutzt rekursive Typen und Intersection-Constraints
> um die gesamte Form-Struktur typsicher zu machen.
>
> ⚛️ **React:** React's `ComponentProps<T extends keyof JSX.IntrinsicElements | ComponentType>`
> ist ein Constraint der sowohl HTML-Elemente als auch React-Komponenten
> akzeptiert. Der Union im Constraint (`|`) erlaubt verschiedene
> Element-Kategorien.

---

## Was du gelernt hast

- **Intersection-Constraints** (`T extends A & B`) verlangen, dass T alle
  Properties beider Interfaces hat — wie ein UND-Vertrag
- **Extra Properties** sind bei generischen Constraints erlaubt (T kann
  mehr haben als der Constraint verlangt)
- **F-bounded Polymorphism** (`T extends Comparable<T>`) stellt sicher,
  dass ein Typ sich nur mit Instanzen des eigenen Typs vergleichen kann
- **Distributive Conditional Types** verteilen sich ueber Unions — aber
  nur bei nackten Typparametern. `[T] extends [U]` verhindert Distribution.
- Distribution kontrolliert man mit: Tuple-Wrapping, umgekehrter Pruefung,
  oder `Extract<T, U>`

> **Kernkonzept:** Fortgeschrittene Constraints geben dir Praezisionskontrolle:
> Intersection fuer "UND", Recursive fuer "Self-Referenz", Conditional fuer
> "bedingte Anforderungen". Distribution ist maechtig aber muss kontrolliert werden.

---

> ⏸️ **Pausenpunkt:** Letzte inhaltliche Pause vor der finalen Sektion.
> In Sektion 6 bringen wir alles zusammen: Wie designt man generische
> APIs die typsicher, ergonomisch und wartbar sind?
>
> **Weiter:** [Sektion 06 - Generische APIs designen →](./06-generische-apis-designen.md)
