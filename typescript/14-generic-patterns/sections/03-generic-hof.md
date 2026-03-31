# Sektion 3: Generic Higher-Order Functions

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Generic Collections](./02-generic-collections.md)
> Naechste Sektion: [04 - Advanced Constraints](./04-generic-constraints-advanced.md)

---

## Was du hier lernst

- Was Higher-Order Functions (HOFs) mit Generics noch maechtiger macht
- `pipe()` — Funktionen typsicher verketten
- `compose()` — die Ausfuehrungsreihenfolge umdrehen
- Generisches map/filter/reduce fuer eigene Strukturen
- Currying und Partial Application mit Generics

---

## Higher-Order Functions: Die Kurzversion

Eine Higher-Order Function (HOF) ist eine Funktion, die eine andere Funktion
als Argument nimmt ODER eine Funktion zurueckgibt. Du kennst das von
`Array.map()`, `Array.filter()`, `Array.reduce()`.

Mit Generics werden eigene HOFs vollstaendig typsicher — der Compiler
verfolgt den Typ durch JEDE Verschachtelungsebene.

---

## pipe() — Werte durch Funktionsketten leiten

`pipe()` nimmt einen Wert und leitet ihn durch eine Reihe von Funktionen.
Der Output jeder Funktion wird zum Input der naechsten.

```typescript annotated
// Einfache Version mit 2 Funktionen:
function pipe2<A, B>(value: A, fn1: (a: A) => B): B {
  return fn1(value);
}

function pipe3<A, B, C>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C
): C {
  return fn2(fn1(value));
}
```

### Pipe mit Overloads fuer variable Laengen

In der Praxis braucht man mehr als 2 Schritte:

```typescript annotated
function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
function pipe<A, B, C, D>(
  v: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D
): D;
function pipe<A, B, C, D, E>(
  v: A, f1: (a: A) => B, f2: (b: B) => C,
  f3: (c: C) => D, f4: (d: D) => E
): E;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((v, fn) => fn(v), value);
}

// Jeder Schritt ist typgeprueft:
const result = pipe(
  "  Hello World  ",
  (s) => s.trim(),               // string -> string
  (s) => s.split(" "),            // string -> string[]
  (arr) => arr.length,            // string[] -> number
  (n) => `${n} Woerter`           // number -> string
);
// ^ Typ: string — "2 Woerter"
```

> 🧠 **Erklaere dir selbst:** Warum braucht man Overloads statt eines
> einzigen generischen Typs? Kann TypeScript die Laenge einer Rest-Parameter-
> Liste fuer Typ-Inferenz nutzen?
> **Kernpunkte:** Jeder Schritt hat einen ANDEREN Typ | TypeScript kann nicht beliebig viele Typparameter aus Rest-Parametern ableiten | Overloads sind der Workaround fuer variabel viele Typuebergaenge

---

## compose() — Umgekehrte Reihenfolge

`compose()` ist das mathematische Gegenstueck zu `pipe()`. Die Funktionen
werden von rechts nach links angewendet: `compose(f, g)(x)` = `f(g(x))`.

```typescript annotated
function compose<A, B>(f1: (a: A) => B): (a: A) => B;
function compose<A, B, C>(
  f2: (b: B) => C,
  f1: (a: A) => B
): (a: A) => C;
function compose<A, B, C, D>(
  f3: (c: C) => D,
  f2: (b: B) => C,
  f1: (a: A) => B
): (a: A) => D;
function compose(...fns: Function[]): Function {
  return (value: unknown) =>
    fns.reduceRight((v, fn) => fn(v), value);
}

// Wiederverwendbare Pipeline erstellen:
const processName = compose(
  (s: string) => s.toUpperCase(),     // Schritt 2
  (s: string) => s.trim()             // Schritt 1
);

console.log(processName("  alice  ")); // "ALICE"
```

> **Pipe vs Compose:** `pipe` liest sich wie ein Datenstrom (oben nach unten).
> `compose` liest sich mathematisch (innen nach aussen). Beide sind funktional
> gleichwertig — waehle was in deinem Kontext lesbarer ist.

---

## Generisches map/filter fuer eigene Strukturen

`map` und `filter` sind nicht auf Arrays beschraenkt. Du kannst sie fuer
JEDE Datenstruktur implementieren:

```typescript annotated
// Result-Typ: Entweder Erfolg oder Fehler
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// map fuer Result — transformiert den Erfolgsfall
function mapResult<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result; // Fehlerfall unveraendert durchreichen
}

const parsed: Result<string> = { ok: true, value: "42" };
const asNumber = mapResult(parsed, parseInt);
// ^ Typ: Result<number, Error>
```

### flatMap fuer verkettete Operationen

```typescript annotated
function flatMap<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) return fn(result.value);
  return result;
}

function parseAge(input: string): Result<number> {
  const n = parseInt(input);
  if (isNaN(n)) return { ok: false, error: new Error("Keine Zahl") };
  if (n < 0 || n > 150) return { ok: false, error: new Error("Ungueltiges Alter") };
  return { ok: true, value: n };
}

const ageResult = flatMap(
  { ok: true, value: "25" } as Result<string>,
  parseAge
);
// ^ Typ: Result<number, Error>
```

---

## Currying mit Generics

Currying verwandelt eine Funktion mit mehreren Parametern in verschachtelte
Funktionen mit je einem Parameter:

```typescript annotated
function curry<A, B, C>(
  fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

const multiply = (a: number, b: number) => a * b;
const curriedMultiply = curry(multiply);
// ^ Typ: (a: number) => (b: number) => number

const double = curriedMultiply(2);
// ^ Typ: (b: number) => number

console.log(double(5));  // 10
console.log(double(21)); // 42
```

Praktischer Einsatz — konfigurierbare Formatter:

```typescript annotated
const formatWith = curry(
  (prefix: string, value: string) => `[${prefix}] ${value}`
);

const logError = formatWith("ERROR");
const logInfo = formatWith("INFO");

console.log(logError("Disk full"));  // "[ERROR] Disk full"
console.log(logInfo("Server up"));   // "[INFO] Server up"
```

---

## Zusammenfassung

| HOF | Zweck | Generics-Rolle |
|-----|-------|----------------|
| pipe() | Wert durch Kette leiten | Verbindet Output -> Input Typen |
| compose() | Pipeline erstellen | Umgekehrte Typverkettung |
| mapResult() | Erfolgsfall transformieren | T -> U im Result-Kontext |
| flatMap() | Verkettete Operationen | Result\<T\> -> Result\<U\> |
| curry() | Partial Application | A, B, C separat typisiert |

---

> **Pause moeglich!** Du hast die funktionalen Generic-Patterns gemeistert.
> Weiter geht es mit Advanced Constraints.
>
> Naechste Sektion: [04 - Advanced Constraints](./04-generic-constraints-advanced.md)
