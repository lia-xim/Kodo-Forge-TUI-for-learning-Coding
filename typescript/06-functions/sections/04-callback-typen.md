# Sektion 4: Callback-Typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Function Overloads](./03-function-overloads.md)
> Naechste Sektion: [05 - Der this-Parameter](./05-this-parameter.md)

---

## Was du hier lernst

- Wie man **Callbacks typsicher** macht — der richtige Weg
- Die besondere Bedeutung von **void-Callbacks** und warum sie Werte zurueckgeben duerfen
- Den Unterschied zwischen **Callback Type Aliases** und **Inline-Typen**
- Wie man mit **generischen Callbacks** arbeitet

---

## Callbacks: Funktionen als Argumente

Callbacks sind Funktionen, die als Argument an andere Funktionen
uebergeben werden. Sie sind eines der haeufigsten Patterns in
JavaScript/TypeScript:

```typescript annotated
// Array.map erwartet einen Callback: (element, index, array) => neuerWert
const names = ["Max", "Anna", "Bob"];
const lengths = names.map((name) => name.length);
//                         ^^^^    ^^^^^^^^^^^
//                         Param   Callback-Body
// lengths: number[] — TypeScript inferiert das aus dem Callback-Return
```

### Callbacks explizit typisieren

```typescript annotated
type TransformFn = (value: string, index: number) => string;
//                  ^^^^^^^^^^^^^  ^^^^^^^^^^^^      ^^^^^^
//                  Erster Param   Zweiter Param     Return

function transformAll(items: string[], fn: TransformFn): string[] {
//                                     ^^^^^^^^^^^^^^
//                                     Callback-Parameter mit benanntem Typ
  return items.map((item, i) => fn(item, i));
}

const shouted = transformAll(["hallo", "welt"], (s) => s.toUpperCase());
// ["HALLO", "WELT"]

const numbered = transformAll(["a", "b"], (s, i) => `${i}: ${s}`);
// ["0: a", "1: b"]
```

---

## Die void-Callback-Regel

Dies ist eine der **ueberraschendsten** Regeln in TypeScript:

> **Ein Callback mit Return-Typ `void` darf trotzdem einen Wert
> zurueckgeben. Der Wert wird einfach ignoriert.**

```typescript annotated
type VoidCallback = (value: string) => void;
//                                     ^^^^ void = "Rueckgabewert egal"

const callbacks: VoidCallback[] = [];

// ALLE diese sind gueltig:
callbacks.push((s) => { console.log(s); });           // gibt undefined zurueck
callbacks.push((s) => { return s.length; });          // gibt number zurueck — OK!
callbacks.push((s) => s.toUpperCase());               // gibt string zurueck — OK!
```

### Warum ist das so?

Das erklaert ein reales Problem:

```typescript annotated
const numbers: number[] = [];

// forEach erwartet: (value) => void
// push gibt: number zurueck (die neue Array-Laenge)
[1, 2, 3].forEach(n => numbers.push(n));
//                      ^^^^^^^^^^^
//                      push() gibt number zurueck — aber forEach erwartet void
//                      Funktioniert trotzdem! Weil void-Callbacks Werte
//                      zurueckgeben duerfen.
```

Wenn void-Callbacks keine Werte zurueckgeben duerften, waere dieses
alltaegliche Pattern ein Compiler-Fehler. TypeScript ist hier
**absichtlich tolerant**.

> 📖 **Hintergrund: Substitutability Principle**
>
> Das Verhalten basiert auf dem **Liskov Substitution Principle** (LSP):
> Eine Funktion die "mehr" kann (einen Wert zurueckgibt) sollte
> ueberall verwendbar sein, wo eine Funktion erwartet wird, die "weniger"
> kann (keinen Wert zurueckgibt). Eine Funktion `() => number` IST
> eine Funktion `() => void` — sie tut einfach mehr als versprochen.
>
> Barbara Liskov formulierte dieses Prinzip 1987 — es ist eines der
> SOLID-Prinzipien und fundamental fuer objektorientiertes Design.

### ACHTUNG: void bei direkter Return-Annotation

```typescript annotated
// Bei DIREKTER Funktionsdeklaration ist void STRENG:
function doSomething(): void {
  return 42;
//^^^^^^ Error! Typ 'number' kann 'void' nicht zugewiesen werden
}

// Nur bei CALLBACKS ist void TOLERANT:
type Callback = () => void;
const fn: Callback = () => 42;  // OK! Callback-void ist tolerant
```

> 💭 **Denkfrage:** Warum unterscheidet TypeScript zwischen "void bei
> Funktionsdeklaration" (streng) und "void bei Callback-Typ" (tolerant)?
>
> **Antwort:** Bei einer Funktionsdeklaration kontrollierst DU den
> Return-Typ — wenn du void sagst, meinst du es auch. Bei einem
> Callback-Typ definiert jemand ANDERES die Schnittstelle und sagt
> nur "der Rueckgabewert ist mir egal". Diese zwei Situationen haben
> unterschiedliche Intentionen.

---

## Callback mit mehreren Signaturen

Manchmal braucht ein Callback verschiedene Formen:

```typescript annotated
type EventHandler =
  | ((event: MouseEvent) => void)
  | ((event: KeyboardEvent) => void);
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//  Union von Callback-Typen

// ABER: Das ist fast nie nuetzlich, weil man die Funktion
// dann mit KEINEM der beiden Event-Typen aufrufen kann.
// Besser: Generics oder Overloads.
```

---

## Generische Callbacks

Fuer flexible, wiederverwendbare Callbacks:

```typescript annotated
// Generischer Callback: Typ wird beim Aufruf bestimmt
type Mapper<T, U> = (item: T, index: number) => U;
//          ^^^^    ^^^^^^^^  ^^^^^^^^^^^^     ^
//          Generics Parameter Index-Info       Return-Generik

function mapArray<T, U>(items: T[], mapper: Mapper<T, U>): U[] {
//                ^^^^                       ^^^^^^^^^^^
//                Generische Parameter        Callback mit Generics
  return items.map((item, index) => mapper(item, index));
}

// TypeScript inferiert T und U aus den Argumenten:
const lengths = mapArray(["hallo", "welt"], (s) => s.length);
//    ^^^^^^^ number[]
// T = string (inferiert aus dem Array)
// U = number (inferiert aus dem Callback-Return)

const doubled = mapArray([1, 2, 3], (n) => n * 2);
//    ^^^^^^^ number[]
// T = number, U = number
```

### Callback mit Constraints

```typescript annotated
type Comparable<T> = (a: T, b: T) => number;

function sortBy<T>(items: T[], compare: Comparable<T>): T[] {
  return [...items].sort(compare);
//       ^^^^^^^^^^^ Kopie erstellen, Original nicht veraendern
}

const sorted = sortBy(
  [{ name: "Charlie" }, { name: "Anna" }, { name: "Bob" }],
  (a, b) => a.name.localeCompare(b.name)
);
// [{ name: "Anna" }, { name: "Bob" }, { name: "Charlie" }]
```

---

## Haeufige Callback-Patterns

### 1. Error-First Callbacks (Node.js-Style)

```typescript annotated
type NodeCallback<T> = (error: Error | null, data?: T) => void;
//                      ^^^^^^^^^^^^^^^^        ^^^^
//                      Erster Param = Error    Zweiter = Daten (optional)

function readFile(path: string, callback: NodeCallback<string>): void {
  // Simuliert asynchrones Lesen
  try {
    const content = "Dateiinhalt...";
    callback(null, content);     // Erfolg: error = null, data = content
  } catch (e) {
    callback(e as Error);        // Fehler: error = Error, data = undefined
  }
}
```

### 2. Event-Listener Pattern

```typescript
type EventListener<T> = (event: T) => void;
type Unsubscribe = () => void;

function on<T>(eventName: string, listener: EventListener<T>): Unsubscribe {
  // Listener registrieren...
  return () => {
    // Listener entfernen...
  };
}

const unsub = on<MouseEvent>("click", (e) => {
  console.log(e.clientX, e.clientY);
});

// Spaeter: Listener entfernen
unsub();
```

### 3. Middleware Pattern (Express-Style)

```typescript
type Middleware = (
  req: { url: string; method: string },
  res: { send: (body: string) => void },
  next: () => void,
) => void;

const logger: Middleware = (req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // Naechste Middleware aufrufen
};
```

> 🧠 **Erklaere dir selbst:** Warum gibt `forEach` den Return-Typ `void` fuer seinen Callback an, obwohl `.map()` den Return-Typ nutzt? Was waere das Problem, wenn forEach den Return-Typ beachten wuerde?
> **Kernpunkte:** forEach ignoriert den Rueckgabewert absichtlich | map braucht ihn zum Bauen des neuen Arrays | Wuerde forEach den Return beachten, koennte man `push` nicht als Callback nutzen | void = "mir egal was du zurueckgibst"

---

## Was du gelernt hast

- Callbacks werden mit **Function Type Expressions** typisiert: `(param: T) => U`
- **void-Callbacks** duerfen Werte zurueckgeben — der Wert wird ignoriert (Substitutability)
- Bei **direkten Funktionsdeklarationen** ist void **streng** — nur bei Callback-Typen tolerant
- **Generische Callbacks** (`Mapper<T, U>`) machen Callback-Typen wiederverwendbar
- Die haeufigstenPatterns: Error-First, Event-Listener, Middleware

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> type Predicate<T> = (item: T) => boolean;
>
> function filterArray<T>(items: T[], predicate: Predicate<T>): T[] {
>   return items.filter(predicate);
> }
>
> // Teste es:
> const zahlen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
> const gerade = filterArray(zahlen, n => n % 2 === 0);
> console.log(gerade);  // [2, 4, 6, 8, 10]
>
> // Was ist der Typ von 'gerade'? Warum inferiert TypeScript number[]
> // und nicht (number | undefined)[] ?
> ```
>
> TypeScript inferiert `T = number` aus dem ersten Argument und weiss
> daher, dass `filterArray` ein `number[]` zurueckgibt. Der `Predicate<T>`-Typ
> traegt keine Informationen ueber den Return-Typ — nur ueber den Input.

**In deinem Angular-Projekt:** RxJS-Operatoren sind komplett aus generischen
Callbacks aufgebaut. Jedes Mal wenn du `pipe()` verwendest, arbeitest du mit
denselben Mustern:

```typescript
import { map, filter } from 'rxjs/operators';

// map() ist intern ein generischer Callback-Typ: Mapper<T, U>
this.users$.pipe(
  filter((user: User) => user.active),   // Predicate<User>
  map((user: User) => user.name),        // Mapper<User, string>
).subscribe((name: string) => {          // VoidCallback mit string
  console.log(name);
});

// TypeScript inferiert den gesamten Typ-Fluss:
// Observable<User> → filter → Observable<User> → map → Observable<string>
```

In React siehst du dasselbe bei `Array.prototype`-Methoden auf State:
`users.filter(u => u.active).map(u => u.name)` — alle Typen fliessen durch.

**Kernkonzept zum Merken:** void in Callbacks bedeutet "der Rueckgabewert ist mir egal" — nicht "es darf kein Rueckgabewert existieren".

---

> **Pausenpunkt** — Callbacks sind das Brot und Butter von JavaScript.
> Als Naechstes: Der `this`-Parameter — eines der verwirrendsten Themen.
>
> Weiter geht es mit: [Sektion 05: Der this-Parameter](./05-this-parameter.md)
