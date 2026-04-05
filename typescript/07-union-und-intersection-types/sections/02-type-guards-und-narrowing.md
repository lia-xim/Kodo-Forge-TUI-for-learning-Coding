# Sektion 2: Type Guards und Narrowing

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Union Types Grundlagen](./01-union-types-grundlagen.md)
> Naechste Sektion: [03 - Discriminated Unions](./03-discriminated-unions.md)

---

## Was du hier lernst

- Wie TypeScript **automatisch den Typ verengt** (Control Flow Analysis)
- Die fuenf Narrowing-Techniken: `typeof`, `instanceof`, `in`, Truthiness, Assignment
- Warum TS 5.5 **Inferred Type Predicates** ein Gamechanger fuer `.filter()` ist
- Wie du **eigene Type Guards** schreibst (`value is Type`)

---

## Das Problem: Union Types sind zu breit

In Sektion 1 hast du gesehen: Bei einem `string | number`-Wert erlaubt
TypeScript nur gemeinsame Operationen. Aber du willst ja oft
typ-spezifische Dinge tun. Die Loesung: **Narrowing**.

```typescript annotated
function padLeft(value: string | number, padding: number): string {
  // VORHER: value ist string | number
  if (typeof value === "string") {
    // NACHHER: value ist string (TypeScript hat "verengt")
    return value.padStart(padding);
    //     ^^^^^ TypeScript weiss: das ist ein string
  }
  // NACHHER: value ist number (string wurde ausgeschlossen)
  return String(value).padStart(padding);
  //            ^^^^^ TypeScript weiss: das ist eine number
}
```

TypeScript's **Control Flow Analysis** verfolgt den Typ durch jeden
Zweig deines Codes. Das ist keine Magie — es ist ein ausgefeilter
Algorithmus, der `if`, `switch`, `return`, `throw` und mehr versteht.

---

## Technik 1: typeof Guard

Der einfachste und haeufigste Guard. Funktioniert fuer **primitive Typen**:

```typescript annotated
function stringify(value: string | number | boolean): string {
  if (typeof value === "string") {
    // value: string
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    // value: number
    return value.toFixed(2);
  }
  // value: boolean (einzige verbleibende Option)
  return value ? "ja" : "nein";
}
```

**typeof gibt zurueck:** `"string"`, `"number"`, `"boolean"`, `"symbol"`,
`"bigint"`, `"undefined"`, `"function"`, `"object"`

> 💭 **Denkfrage:** Warum reicht `typeof` nicht aus, um zwischen `null`
> und einem Objekt zu unterscheiden?
>
> **Antwort:** Weil `typeof null === "object"` (der historische Bug aus
> Lektion 02). Deshalb brauchst du fuer `null` einen expliziten
> Vergleich: `value === null`.

---

## Technik 2: instanceof Guard

Fuer **Klassen-Instanzen** (nicht fuer Interfaces — die existieren
nicht zur Laufzeit!):

```typescript annotated
class Dog {
  bark() { return "Wuff!"; }
}
class Cat {
  meow() { return "Miau!"; }
}

function makeSound(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    // animal: Dog
    return animal.bark();
  }
  // animal: Cat
  return animal.meow();
}
```

> **Wichtig:** `instanceof` funktioniert NUR mit Klassen (die zur
> Laufzeit existieren). Fuer Interfaces und Type Aliases brauchst du
> andere Techniken (siehe `in`-Guard und benutzerdefinierte Guards).

---

## Technik 3: in Guard

Der `in`-Operator prueft, ob ein **Property existiert**. Besonders
nuetzlich fuer Objekte ohne gemeinsame Klasse:

```typescript annotated
interface Fish {
  swim: () => void;
}
interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird): void {
  if ("swim" in animal) {
    // animal: Fish
    animal.swim();
  } else {
    // animal: Bird
    animal.fly();
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum kann TypeScript aus
> `"swim" in animal` schliessen, dass `animal` ein `Fish` ist?
> **Kernpunkte:** Nur Fish hat `swim` | TypeScript kennt die Interfaces |
> Wenn `swim` existiert, MUSS es Fish sein | Bird hat kein `swim`

---

## Technik 4: Truthiness Narrowing

TypeScript versteht, dass `null`, `undefined`, `0`, `""`, `NaN` und
`false` als **falsy** gelten:

```typescript annotated
function printLength(text: string | null | undefined): void {
  if (text) {
    // text: string (null und undefined sind falsy, also eliminiert)
    console.log(text.length);
  } else {
    // text: string | null | undefined
    // ACHTUNG: Auch ein leerer String "" landet hier!
    console.log("Kein Text");
  }
}
```

> **Warnung:** Truthiness Narrowing eliminiert auch gueltige Werte
> wie `0`, `""` und `false`. Fuer Zahlen und Booleans ist
> `!== null && !== undefined` oft sicherer:

```typescript
function getLength(value: string | null): number {
  // FALSCH: "" (leerer String) wird als "kein Wert" behandelt
  // if (value) { return value.length; }

  // RICHTIG: Nur null wird ausgeschlossen
  if (value !== null) {
    return value.length;  // value: string (inkl. "")
  }
  return 0;
}
```

---

## Technik 5: Assignment Narrowing

TypeScript verengt den Typ auch bei **Zuweisungen**:

```typescript annotated
let value: string | number;

value = "hallo";
// value: string — TypeScript weiss was zugewiesen wurde
console.log(value.toUpperCase());  // OK

value = 42;
// value: number — nach der neuen Zuweisung
console.log(value.toFixed(2));     // OK
```

---

## Type Predicates: Eigene Type Guards

Manchmal brauchst du eine **Funktion**, die als Guard dient. Dafuer
gibt es Type Predicates mit `is`:

```typescript annotated
interface User {
  name: string;
  email: string;
}

// Type Predicate: "value is User"
function isUser(value: unknown): value is User {
//                                ^^^^^^^^^^^^
//                                "Wenn diese Funktion true zurueckgibt,
//                                 dann ist value ein User"
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  );
}

// Nutzung:
function greet(input: unknown): string {
  if (isUser(input)) {
    // input: User — TypeScript vertraut dem Type Predicate
    return `Hallo, ${input.name}!`;
  }
  return "Unbekannter Besucher";
}
```

---

## TS 5.5: Inferred Type Predicates — der Gamechanger

Vor TypeScript 5.5 gab es ein **aergerlliches Problem** mit `.filter()`:

```typescript
// VOR TS 5.5: filter() verliert die Typ-Information
const mixed: (string | null)[] = ["hallo", null, "welt", null];

// Das Ergebnis sollte string[] sein, aber...
const strings = mixed.filter(x => x !== null);
// Typ von strings: (string | null)[]  -- FALSCH! null ist doch rausgefiltert!
```

Du musstest einen expliziten Type Predicate schreiben:

```typescript
// WORKAROUND vor TS 5.5:
const strings = mixed.filter((x): x is string => x !== null);
```

**Ab TypeScript 5.5** erkennt der Compiler automatisch, dass die
Filter-Funktion ein Type Predicate ist:

```typescript annotated
// AB TS 5.5: TypeScript inferiert den Type Predicate automatisch!
const mixed: (string | null)[] = ["hallo", null, "welt", null];

const strings = mixed.filter(x => x !== null);
// Typ von strings: string[]  -- KORREKT! TS 5.5+ erkennt das
//
// TypeScript inferiert intern: (x): x is string => x !== null
// Das nennt man "Inferred Type Predicates"
```

> 📖 **Hintergrund: Wie Inferred Type Predicates funktionieren**
>
> TypeScript 5.5 (Mai 2024) fuehrte ein neues Feature ein: Wenn eine
> Funktion mit einem einzelnen Parameter einen Boolean zurueckgibt
> UND der Compiler erkennen kann, dass der Return-Wert den Typ des
> Parameters einschraenkt, wird automatisch ein Type Predicate inferiert.
>
> Die Regeln dafuer:
> 1. Kein expliziter Return-Typ und kein explizites Type Predicate
> 2. Ein einzelner `return`-Ausdruck (kein implizites `return undefined`)
> 3. Der Parameter wird nicht mutiert
> 4. Die Funktion gibt einen Boolean zurueck, der den Parameter-Typ narrowt
>
> Das funktioniert auch in Array-Methoden wie `.filter()`, `.find()`,
> `.some()` und `.every()`.

```typescript
// Weitere Beispiele fuer Inferred Type Predicates (TS 5.5+):
const numbers = [1, 2, undefined, 4, undefined];

// TS inferiert: (x): x is number => ...
const defined = numbers.filter(x => x !== undefined);
// Typ: number[] -- korrekt!

// Auch bei komplexeren Filtern:
interface User { name: string; age: number }
interface Admin extends User { role: "admin" }

const users: (User | Admin)[] = [/* ... */];
const admins = users.filter(u => "role" in u);
// Typ: Admin[] -- TS 5.5+ erkennt den in-Guard!
```

> ⚡ **Praxis-Tipp:** Pruefe deine `tsconfig.json`: Wenn du TS 5.5+
> verwendest, kannst du viele explizite Type Predicates bei `.filter()`
> entfernen. Weniger Code, gleiche Sicherheit.

---

## Narrowing mit switch

Besonders elegant fuer Union Types mit vielen Mitgliedern:

```typescript annotated
type Shape = "circle" | "square" | "triangle";

function getDescription(shape: Shape): string {
  switch (shape) {
    case "circle":
      // shape: "circle"
      return "Ein runder Kreis";
    case "square":
      // shape: "square"
      return "Ein eckiges Quadrat";
    case "triangle":
      // shape: "triangle"
      return "Ein spitzes Dreieck";
  }
}
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> type Shape = "circle" | "square" | "triangle";
>
> function getDescription(shape: Shape): string {
>   switch (shape) {
>     case "circle":   return "Ein runder Kreis";
>     case "square":   return "Ein eckiges Quadrat";
>     case "triangle": return "Ein spitzes Dreieck";
>   }
> }
>
> // Fuege jetzt "pentagon" zum Typ hinzu:
> // type Shape = "circle" | "square" | "triangle" | "pentagon";
> // Was passiert? TypeScript weiss, dass getDescription()
> // fuer "pentagon" keinen Rueckgabewert hat.
> ```
> Welchen Fehler zeigt TypeScript nach dem Hinzufuegen von `"pentagon"`?
> Wie wuerde ein `default`-Zweig mit `const _x: never = shape` helfen?

---

## Was du gelernt hast

- TypeScript **verengt** Union Types automatisch durch Control Flow Analysis
- **typeof** fuer Primitives, **instanceof** fuer Klassen, **in** fuer Properties
- **Truthiness** Narrowing hat Fallen bei `0`, `""` und `false`
- **Type Predicates** (`value is Type`) fuer benutzerdefinierte Guards
- **TS 5.5 Inferred Type Predicates**: `.filter(x => x !== null)` gibt jetzt automatisch den korrekten Typ zurueck

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `typeof x === "object"` und `x instanceof Object`? In welchen
> Faellen geben sie unterschiedliche Ergebnisse?
> **Kernpunkte:** typeof null === "object" | instanceof prueft die Prototype-Chain |
> typeof ist sicherer fuer Primitives | instanceof funktioniert nicht cross-realm

**Kernkonzept zum Merken:** Type Narrowing ist das Gegenstueck zu Union Types. Union Types machen Typen **breiter** (mehr Moeglichkeiten), Narrowing macht sie **enger** (weniger Moeglichkeiten). Zusammen bilden sie ein maechtigss System.

---

> **Pausenpunkt** -- Du kennst jetzt alle grundlegenden Narrowing-Techniken.
> In der naechsten Sektion lernst du **Discriminated Unions** — das
> maechtigste Pattern fuer Union Types.
>
> Weiter geht es mit: [Sektion 03: Discriminated Unions](./03-discriminated-unions.md)
