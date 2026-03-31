# Sektion 3: Tuples — Grundlagen

> **Geschaetzte Lesezeit:** ~10 Minuten
>
> **Was du hier lernst:**
> - Was ein Tuple wirklich ist — und was es nicht ist
> - Named/Labeled Tuples fuer bessere Lesbarkeit
> - Optionale Tuple-Elemente und Rest-Elemente
> - Wie sich der `.length`-Typ zwischen Arrays und Tuples unterscheidet
> - Warum React `useState` als Tuple zurueckgibt (und nicht als Object)

---

## Was ist ein Tuple?

Ein Tuple ist ein Array mit **fester Laenge** und **definiertem Typ pro
Position**.

```typescript
// Tuple: genau 2 Elemente, string an Position 0, number an Position 1
let person: [string, number] = ["Alice", 30];

// Zugriff — TypeScript kennt den Typ jeder Position!
const name: string = person[0];    // string
const alter: number = person[1];   // number

// FEHLER: Zu viele / zu wenige Elemente
// let falsch1: [string, number] = ["Alice"];            // Fehler!
// let falsch2: [string, number] = ["Alice", 30, true];  // Fehler!
```

> **Hintergrund: Tuples in anderen Sprachen.** In Python sind Tuples ein
> eigener Datentyp, der **immutable** ist — einmal erstellt, kannst du sie
> nicht aendern. In TypeScript ist ein Tuple **kein eigener Datentyp**.
> Es ist ein ganz normales JavaScript-Array, dem TypeScript auf Typ-Ebene
> eine feste Struktur aufzwingt. Das bedeutet: Ein TypeScript-Tuple ist
> standardmaessig **mutable** (du kannst Elemente ueberschreiben), es sei
> denn, du machst es explizit `readonly`. Das ueberrascht Entwickler, die
> von Python kommen.

### Das fundamentale Prinzip

Ein Tuple ist **kein Array mit eingeschraenkter Laenge**. Es ist konzeptuell
etwas voellig anderes: Ein Tuple ist eine **positional typisierte Struktur** —
aehnlich wie ein Object, aber mit numerischen Indizes statt benannten Keys.

```typescript
// Tuple und Object druecken aehnliche Dinge aus:
type PersonTuple = [string, number, boolean];  // [name, alter, aktiv]
type PersonObject = { name: string; alter: number; aktiv: boolean };

// Der Unterschied: Tuple-Elemente haben keine semantischen Namen (nur Positionen).
```

### Tuple vs Array — der entscheidende Unterschied

```typescript
const arr: string[] = ["Alice", "30"];
//    arr[0] ist string
//    arr[1] ist string
//    arr[99] ist string  (kein Fehler, nur undefined zur Laufzeit)

const tup: [string, number] = ["Alice", 30];
//    tup[0] ist string
//    tup[1] ist number
//    tup[2]  // Fehler! Tuple type has no element at index '2'
```

**Der `.length`-Typ ist auch anders:**

```typescript
const arr: string[] = ["a", "b"];
const tup: [string, number] = ["a", 1];

type ArrLen = typeof arr.length;  // number  (kann beliebig sein)
type TupLen = typeof tup.length;  // 2       (Literal-Typ!)
```

> **Tieferes Wissen:** Dass `.length` bei Tuples ein Literal-Typ ist, hat
> praktische Konsequenzen. TypeScript kann damit statisch ueberpruefen, ob
> du auf einen gueltigen Index zugreifst. Bei Arrays ist `.length` nur
> `number` — TypeScript weiss nicht, wie viele Elemente tatsaechlich
> vorhanden sind.

---

## Named / Labeled Tuples

Ab TypeScript 4.0 koennen Tuple-Elemente benannt werden. Das verbessert
die Lesbarkeit und die IDE-Unterstuetzung enorm:

```typescript
// Ohne Labels — was ist was?
type Punkt = [number, number];

// Mit Labels — viel klarer!
type PunktBenannt = [x: number, y: number];

// Noch ein Beispiel:
type HTTPAntwort = [status: number, body: string, headers: Record<string, string>];
```

Die Labels haben **keinen Einfluss auf den Typ** — sie sind rein
dokumentarisch. Aber sie erscheinen in Fehlermeldungen und IDE-Tooltips:

```typescript
function getUser(): [id: number, name: string, active: boolean] {
  return [1, "Alice", true];
}

const [id, name, active] = getUser();
//     ^-- IDE zeigt: id: number
//          ^-- IDE zeigt: name: string
//                  ^-- IDE zeigt: active: boolean
```

> **Experiment-Box:** Schreibe in deiner IDE:
> ```typescript
> function getUser(): [id: number, name: string] {
>   return [1, "Alice"];
> }
> const result = getUser();
> ```
> Hovere ueber `result` — siehst du die Labels `id` und `name` im Tooltip?
> Jetzt entferne die Labels aus der Signatur und hovere erneut. Beachte den
> Unterschied in der IDE-Anzeige: ohne Labels siehst du nur `[number, string]`.

**Wichtige Einschraenkung:** Wenn ein Tuple Labels hat, muessen **alle**
Elemente Labels haben oder keines. Mischen ist nicht erlaubt:

```typescript
// type Falsch = [name: string, number]; // FEHLER: Entweder alle oder keines!
type Richtig = [name: string, age: number];
```

> **Praxis-Tipp:** Verwende Named Tuples grosszuegig — sie kosten nichts
> (Labels werden bei der Kompilierung entfernt) und machen Fehlermeldungen
> deutlich verstaendlicher. Besonders bei Funktionen, die Tuples
> zurueckgeben, sind Labels Gold wert.

---

## Optionale Tuple-Elemente

Tuple-Elemente koennen mit `?` optional gemacht werden:

```typescript
type FlexiblerPunkt = [x: number, y: number, z?: number];

const punkt2D: FlexiblerPunkt = [10, 20];        // ok
const punkt3D: FlexiblerPunkt = [10, 20, 30];    // ok
// const falsch: FlexiblerPunkt = [10];           // Fehler! y fehlt
```

**Wichtig:** Optionale Elemente muessen **am Ende** stehen — genau wie
optionale Funktionsparameter:

```typescript
// type Falsch = [a?: string, b: number]; // Fehler!
```

**Was passiert mit `.length`?** Bei optionalen Elementen wird der
Length-Typ zu einer Union:

```typescript
type FlexPunkt = [number, number, number?];
type FlexLen = FlexPunkt["length"]; // 2 | 3
```

---

## Rest-Elemente in Tuples

Mit `...` koennen Tuples eine variable Anzahl von Elementen am Ende haben:

```typescript
// Erster Wert ist string, danach beliebig viele numbers
type StringUndZahlen = [string, ...number[]];

const a: StringUndZahlen = ["summe", 1, 2, 3];        // ok
const b: StringUndZahlen = ["leer"];                   // ok (0 Zahlen)
const c: StringUndZahlen = ["mix", 1, 2, 3, 4, 5];   // ok
```

**Ab TypeScript 4.2:** Rest-Elemente koennen auch **in der Mitte** stehen:

```typescript
type Sandwich = [string, ...number[], string];

const s: Sandwich = ["start", 1, 2, 3, "end"];  // ok
```

> **Hintergrund:** Diese Faehigkeit war ein grosser Fortschritt. Vorher
> konnten Rest-Elemente nur am Ende stehen. Die Erweiterung auf mittlere
> Positionen ermoeglichte es, Patterns wie "ein Header, beliebige Daten,
> ein Footer" auf Typ-Ebene auszudruecken.

### Spread-Operator mit Tuple-Typen

```typescript
type Head = [string, number];
type Tail = [boolean, string];

// Spread kombiniert Tuples:
type Combined = [...Head, ...Tail];
// Ergebnis: [string, number, boolean, string]

// Praktisch bei Funktionsparametern:
function logAll(...args: [string, number, ...boolean[]]): void {
  const [name, count, ...flags] = args;
  console.log(name, count, flags);
}

logAll("test", 5, true, false, true);
```

---

> **Denkfrage:** Wenn du ein Tuple `[string, ...number[], boolean]` hast —
> wie kann TypeScript die letzte Position als `boolean` erkennen, wenn die
> Mitte beliebig lang ist?
>
> **Antwort:** TypeScript prueft von **beiden Enden** gleichzeitig. Es weiss:
> Position 0 ist `string`, die letzte Position ist `boolean`, und alles
> dazwischen muss `number` sein. Das ist aehnlich wie bei einem Regex mit
> Anfangs- und End-Anker: `^string, ...numbers, boolean$`.

## Warum useState ein Tuple zurueckgibt

> **Hintergrund: Eine Design-Entscheidung, die ein Pattern definiert hat.**
>
> React's `useState` haette ein Object zurueckgeben koennen:
> ```typescript
> // Hypothetisch: useState mit Object-Rueckgabe
> const { value: count, setValue: setCount } = useState(0);
> ```
>
> Das Team entschied sich bewusst fuer ein Tuple:
> ```typescript
> // Tatsaechlich: useState mit Tuple-Rueckgabe
> const [count, setCount] = useState(0);
> ```
>
> **Warum?** Wegen der **freien Benennung beim Destructuring**. Bei einem
> Object haettest du immer `value` und `setValue` (oder muestest mit
> Aliasing arbeiten). Bei einem Tuple waehlst du die Namen frei:
> ```typescript
> const [count, setCount] = useState(0);
> const [name, setName] = useState("");
> const [isOpen, setIsOpen] = useState(false);
> ```
>
> Dieses Pattern hat sich so bewaehrt, dass es inzwischen als Standard-
> Convention gilt: **Wenn eine Funktion genau zwei zusammengehoerige Werte
> zurueckgibt (einen Wert und eine Aktion darauf), verwende ein Tuple.**
> Angular's `signal()` ging einen anderen Weg (ein Objekt mit `.set()`-
> Methode), weil Signals mehr als nur get/set koennen.

---

## Was du gelernt hast

- Ein Tuple ist eine **positional typisierte Struktur** mit fixer Laenge
  und Typ pro Position
- TypeScript-Tuples sind **kein eigener Datentyp** — zur Laufzeit sind sie
  normale Arrays
- Anders als Python-Tuples sind sie **standardmaessig mutable**
- Named Tuples verbessern IDE-Support und Fehlermeldungen, haben aber keinen
  Einfluss auf den Typ
- Optionale Elemente muessen am Ende stehen, aendern den `.length`-Typ zu
  einer Union
- Rest-Elemente erlauben variable Laenge auch in Tuples (auch in der Mitte
  ab TS 4.2)
- Das Tuple-Rueckgabe-Pattern (wie bei `useState`) ermoeglicht freie
  Benennung beim Destructuring

**Pausenpunkt:** In der naechsten Sektion geht es um fortgeschrittene Tuple-
Features: Variadic Tuples, `as const`, und `satisfies`.

---

[<-- Vorherige Sektion: Readonly Arrays](02-readonly-arrays.md) | [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Fortgeschrittene Tuples -->](04-fortgeschrittene-tuples.md)
