# Sektion 5: Der this-Parameter

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Callback-Typen](./04-callback-typen.md)
> Naechste Sektion: [06 - Funktions-Patterns](./06-funktions-patterns.md)

---

## Was du hier lernst

- Warum `this` in JavaScript **so verwirrend** ist und wie TypeScript hilft
- Wie man den **this-Parameter** in Funktionen deklariert
- Den Unterschied zwischen **Arrow Functions** und **regulaeren Funktionen** bei `this`
- Wie `noImplicitThis` und `ThisParameterType` funktionieren

---

## Das this-Problem in JavaScript

`this` ist vermutlich das **meistmissverstandene Konzept** in JavaScript.
Der Wert von `this` haengt davon ab, **wie** eine Funktion aufgerufen wird —
nicht wo sie definiert ist:

```typescript
const person = {
  name: "Max",
  greet() {
    console.log(`Hallo, ich bin ${this.name}`);
  },
};

person.greet();          // "Hallo, ich bin Max" — OK

const greet = person.greet;
greet();                 // "Hallo, ich bin undefined" — this ist verloren!
```

> 📖 **Hintergrund: Warum ist this so verwirrend?**
>
> In den meisten objektorientierten Sprachen (Java, C#, Python) ist `this`/`self`
> immer das Objekt, auf dem die Methode definiert ist. JavaScript wurde
> jedoch 1995 in 10 Tagen von Brendan Eich erstellt, und er entschied sich
> fuer **dynamisches `this`**: Der Wert wird zur **Aufrufzeit** bestimmt,
> nicht zur Definitionszeit. Das machte JavaScript flexibler (man kann
> Methoden zwischen Objekten teilen), fuehrte aber zu zahllosen Bugs.
>
> ES2015 Arrow Functions loesten das Problem teilweise, weil sie `this`
> **lexikalisch** binden (vom umgebenden Scope erben). TypeScript geht
> noch weiter und erlaubt es, `this` als **Typ** zu deklarieren.

---

## Der this-Parameter in TypeScript

TypeScript erlaubt einen speziellen **ersten Parameter** namens `this`,
der den Typ von `this` innerhalb der Funktion festlegt:

```typescript annotated
interface User {
  name: string;
  age: number;
}

function greetUser(this: User): string {
//                 ^^^^^^^^^^ this-Parameter: NUR fuer TypeScript
//                             Verschwindet im kompilierten JavaScript!
  return `Hallo, ich bin ${this.name} und ${this.age} Jahre alt.`;
}

// Aufruf: this muss ein User sein
const max: User = { name: "Max", age: 30 };
greetUser.call(max);  // "Hallo, ich bin Max und 30 Jahre alt."

// FALSCH: Direkter Aufruf ohne richtiges this
// greetUser();
// Error! Der this-Kontext vom Typ void kann nicht dem Typ User zugewiesen werden
```

### Type Erasure bei this

```typescript
// TypeScript:
function greetUser(this: User): string {
  return `${this.name}`;
}

// Kompiliertes JavaScript — this-Parameter ist WEG:
function greetUser() {
  return `${this.name}`;
}
```

Der `this`-Parameter ist ein reines Compilezeit-Feature — er wird
bei der Kompilierung entfernt (Type Erasure, wie in Lektion 02 gelernt).

---

## this in Methoden-Typen

```typescript annotated
interface Calculator {
  value: number;
  add(this: Calculator, n: number): Calculator;
//    ^^^^^^^^^^^^^^^^^ this-Typ wird explizit festgelegt
  multiply(this: Calculator, n: number): Calculator;
  result(this: Calculator): number;
}

const calc: Calculator = {
  value: 0,
  add(n) {
    return { ...this, value: this.value + n };
//               ^^^^ TypeScript weiss: this ist Calculator
  },
  multiply(n) {
    return { ...this, value: this.value * n };
  },
  result() {
    return this.value;
  },
};

// Method Chaining funktioniert typsicher:
const result = calc.add(5).multiply(3).result();
// 15
```

---

## noImplicitThis

Die Compiler-Option `noImplicitThis` (Teil von `strict: true`) erzwingt,
dass `this` in Funktionen einen bekannten Typ hat:

```typescript
// OHNE noImplicitThis: this ist 'any' — keine Typenpruefung
function getName() {
  return this.name;  // Kein Fehler, aber unsicher!
}

// MIT noImplicitThis: TypeScript verlangt einen this-Typ
function getName() {
  return this.name;
//       ^^^^ Error! 'this' hat implizit den Typ 'any'
}

// Loesung: this-Parameter deklarieren
function getName(this: { name: string }) {
  return this.name;  // OK — TypeScript weiss den Typ
}
```

> 💭 **Denkfrage:** Warum ist `noImplicitThis` Teil von `strict: true`?
> Welche Probleme verhindert es?
>
> **Antwort:** Ohne `noImplicitThis` koennte man auf beliebige Properties
> von `this` zugreifen — `this.wasAuchImmer` waere immer `any`. Das
> unterwandert das Typsystem komplett. Die Option zwingt dich, den
> this-Kontext explizit zu deklarieren, genau wie `strictNullChecks`
> dich zwingt, null-Checks zu schreiben.

---

## Arrow Functions und this

Arrow Functions haben **kein eigenes `this`** — sie erben `this` vom
umgebenden Scope. Deshalb kann man bei Arrow Functions keinen
`this`-Parameter deklarieren:

```typescript annotated
class Timer {
  seconds = 0;

  // PROBLEM: regulaere Funktion verliert this
  startBroken() {
    setInterval(function () {
      this.seconds++;
//    ^^^^ Error! this ist undefined (oder window im Browser)
    }, 1000);
  }

  // LOESUNG: Arrow Function erbt this vom Class-Scope
  start() {
    setInterval(() => {
      this.seconds++;
//    ^^^^ OK! Arrow Function erbt this von der Timer-Instanz
    }, 1000);
  }
}
```

### Wann regulaere Funktion, wann Arrow?

| Situation | Empfehlung | Grund |
|---|---|---|
| Methode in einer Klasse | Regulaere Methode | Wird auf dem Prototype definiert |
| Callback mit `this`-Zugriff | Arrow Function | Erbt `this` lexikalisch |
| Event-Handler in der Klasse | Arrow Function (als Property) | Behaelt `this`-Binding |
| Standalone-Funktion | Arrow Function | Kuerzere Syntax, kein this-Problem |

```typescript
class Button {
  label = "Click me";

  // Arrow als Class Property: this ist immer die Button-Instanz
  onClick = () => {
    console.log(this.label);  // Immer "Click me"
  };

  // Regulaere Methode: this haengt vom Aufrufkontext ab
  onHover() {
    console.log(this.label);  // Nur OK wenn korrekt aufgerufen
  }
}
```

> 🔍 **Tieferes Wissen: Performance-Unterschied**
>
> Arrow Functions als Class Properties werden fuer **jede Instanz** neu
> erstellt (im Konstruktor). Regulaere Methoden leben auf dem
> **Prototype** und werden geteilt. Bei vielen Instanzen kann das
> einen Unterschied machen. In der Praxis: Bei wenigen Instanzen
> (z.B. Angular Components) ist es egal. Bei Tausenden (z.B. in
> einer Game-Engine) sollte man Prototype-Methoden bevorzugen und
> `this` mit `.bind()` sichern.

---

## ThisParameterType und OmitThisParameter

TypeScript bietet Utility-Typen fuer `this`:

```typescript annotated
function greet(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}!`;
}

// ThisParameterType extrahiert den this-Typ:
type GreetThis = ThisParameterType<typeof greet>;
//   ^^^^^^^^^  { name: string }

// OmitThisParameter entfernt this und gibt die "reine" Signatur:
type GreetFn = OmitThisParameter<typeof greet>;
//   ^^^^^^^  (greeting: string) => string
```

> 🧠 **Erklaere dir selbst:** Warum hat TypeScript einen `this`-Parameter, der zur Laufzeit verschwindet? Was waere die Alternative, und warum waere sie schlechter?
> **Kernpunkte:** this-Typ ist Compilezeit-Pruefung | Alternative: any fuer this (unsicher) | Oder: kein this-Check (Laufzeit-Fehler) | TypeScript faengt this-Fehler VOR der Ausfuehrung ab

---

## Was du gelernt hast

- Der `this`-Parameter ist ein **Compilezeit-Feature** das zur Laufzeit verschwindet (Type Erasure)
- **Arrow Functions** erben `this` lexikalisch — regulaere Funktionen binden `this` dynamisch
- `noImplicitThis` (Teil von `strict`) erzwingt einen expliziten this-Typ
- `ThisParameterType<T>` und `OmitThisParameter<T>` sind Utility-Typen fuer this-Manipulation
- Arrow Functions als **Class Properties** sichern `this`, kosten aber Performance bei vielen Instanzen

> **Experiment:** Oeffne `examples/01-funktionstypen-basics.ts` und
> versuche, eine Methode mit `this`-Parameter zu schreiben. Rufe
> sie mit `.call()` auf und beobachte, wie TypeScript den this-Typ prueft.

**Kernkonzept zum Merken:** `this` ist in JavaScript dynamisch, aber TypeScript kann es zur Compilezeit pruefen. Arrow Functions loesen das Problem elegant — der `this`-Parameter ist fuer die Faelle, wo du es explizit kontrollieren musst.

---

> **Pausenpunkt** — Das `this`-Thema ist beruechtigterweise verwirrend.
> Keine Sorge wenn du es nochmal lesen musst.
>
> Weiter geht es mit: [Sektion 06: Funktions-Patterns](./06-funktions-patterns.md)
