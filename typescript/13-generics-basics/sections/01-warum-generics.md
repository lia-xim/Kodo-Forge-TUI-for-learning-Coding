# Sektion 1: Warum Generics?

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Generische Funktionen](./02-generische-funktionen.md)

---

## Was du hier lernst

- Warum Code-Duplikation und `any` beide schlechte Loesungen sind
- Wie Typparameter `<T>` das Problem elegant loesen
- Warum Generics das **Herzstuck** von TypeScript sind
- Die Grundidee: "Typen als Parameter"

---

## Das Problem: Drei schlechte Wege

Stell dir vor, du schreibst eine Funktion, die das erste Element eines Arrays
zurueckgibt. Klingt trivial — aber TypeScript macht es zur Herausforderung.

### Weg 1: Eine Funktion pro Typ (Code-Duplikation)

```typescript annotated
function firstString(arr: string[]): string | undefined {
  return arr[0];
}

function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}

function firstBoolean(arr: boolean[]): boolean | undefined {
  return arr[0];
}
// ^ Drei identische Funktionen — nur der Typ ist anders!
```

Das funktioniert, aber es skaliert nicht. Fuer jeden neuen Typ brauchst du
eine neue Funktion. Und die Logik ist **identisch** — nur der Typ aendert
sich. Das ist die Definition von Code-Duplikation.

### Weg 2: `any` (Typsicherheit weg)

```typescript annotated
function firstAny(arr: any[]): any {
  return arr[0];
}

const result = firstAny(["hallo", "welt"]);
// result ist `any` — TypeScript weiss NICHTS mehr!

result.toUpperCase(); // Kein Fehler — aber was wenn das Array Zahlen hatte?
result.foo.bar.baz;   // Auch kein Fehler — any erlaubt ALLES
```

Das loest die Duplikation, aber **zerstoert die Typsicherheit**. Der
Rueckgabetyp ist `any` — du koenntest genauso gut JavaScript schreiben.
TypeScript kann dich vor nichts mehr schuetzen.

### Weg 3: `unknown` (Sicher, aber unbrauchbar)

```typescript annotated
function firstUnknown(arr: unknown[]): unknown {
  return arr[0];
}

const result = firstUnknown(["hallo", "welt"]);
// result ist `unknown` — sicher, aber unbrauchbar ohne Type Guard

// result.toUpperCase(); // Error! Property 'toUpperCase' does not exist on 'unknown'

if (typeof result === "string") {
  result.toUpperCase(); // Jetzt OK — aber muehsam!
}
```

`unknown` ist typsicher, aber du musst den Typ manuell zurueckgewinnen.
Bei **jedem Aufruf**. Das ist besser als `any`, aber immer noch nicht gut.

---

## Die Loesung: Typparameter

> **Generics lassen dich Typen als Parameter uebergeben.**
> Statt den Typ festzulegen, sagst du: "Der Aufrufer entscheidet."

```typescript annotated
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
// ^ T ist ein Typparameter — ein Platzhalter fuer einen echten Typ

const a = first(["hallo", "welt"]);
// ^ a ist string | undefined — TypeScript weiss es!

const b = first([1, 2, 3]);
// ^ b ist number | undefined — automatisch korrekt

const c = first([true, false]);
// ^ c ist boolean | undefined — alles typsicher
```

**Eine Funktion. Jeder Typ. Volle Typsicherheit.**

Das `<T>` nach dem Funktionsnamen ist die Deklaration eines **Typparameters**.
`T` ist ein Platzhalter — wie ein Parameter fuer Werte, aber fuer Typen.
Wenn du die Funktion aufrufst, wird `T` durch den konkreten Typ ersetzt.

---

## Die Analogie: Wert-Parameter vs. Typ-Parameter

Denk an normale Funktionen:

```typescript annotated
// Wert-Parameter: "Ich sage dir WELCHEN Wert spaeter"
function add(a: number, b: number): number {
  return a + b;
}
add(3, 5); // a=3, b=5 — Werte kommen beim Aufruf

// Typ-Parameter: "Ich sage dir WELCHEN Typ spaeter"
function identity<T>(value: T): T {
  return value;
}
identity<string>("hallo"); // T=string — Typ kommt beim Aufruf
identity<number>(42);      // T=number — Typ kommt beim Aufruf
```

| Konzept | Wert-Parameter | Typ-Parameter |
|---------|---------------|---------------|
| Deklaration | `(a: number)` | `<T>` |
| Verwendung | `add(5)` | `identity<string>(...)` |
| Platzhalter | `a` | `T` |
| Wird ersetzt durch | Konkreter Wert | Konkreter Typ |

---

## Die Namenskonvention

Typparameter sind per Konvention **einzelne Grossbuchstaben**:

| Name | Bedeutung | Typischer Einsatz |
|------|-----------|-------------------|
| `T` | **T**ype | Allgemeiner Typparameter |
| `U` | Zweiter Typ | Wenn T schon vergeben |
| `K` | **K**ey | Schluessel eines Objekts |
| `V` | **V**alue | Wert eines Objekts |
| `E` | **E**lement | Element einer Collection |
| `R` | **R**eturn | Rueckgabetyp |

Das ist nur Konvention — `T` koennte auch `MyType` heissen. Aber
einzelne Buchstaben sind Standard und jeder TypeScript-Entwickler
erkennt sie sofort.

---

## Warum Generics das Herzstuck sind

Generics sind nicht optional. Sie sind **ueberall** in TypeScript:

```typescript annotated
// Arrays sind generisch:
const numbers: Array<number> = [1, 2, 3];
// ^ Array<number> ist die generische Schreibweise fuer number[]

// Promises sind generisch:
const promise: Promise<string> = fetch("/api").then(r => r.text());
// ^ Promise<string> — der aufgeloeste Wert ist ein string

// Map ist generisch:
const cache: Map<string, number> = new Map();
// ^ Map<K, V> — Schluessel: string, Wert: number

// Set ist generisch:
const ids: Set<number> = new Set([1, 2, 3]);
// ^ Set<T> — nur Zahlen erlaubt
```

Ohne Generics koennten diese Datenstrukturen keine Typsicherheit bieten.
`Array`, `Promise`, `Map`, `Set` — alles generisch. React's `useState`,
Angular's `HttpClient`, jede Bibliothek nutzt Generics extensiv.

> **Generics zu verstehen ist nicht optional — es ist die Voraussetzung
> fuer alles Weitere in TypeScript.**

---

## Zusammenfassung

| Ansatz | Problem |
|--------|---------|
| Eine Funktion pro Typ | Code-Duplikation, skaliert nicht |
| `any` | Typsicherheit komplett weg |
| `unknown` | Typsicher, aber unbrauchbar ohne Casts |
| **Generics `<T>`** | **Eine Funktion, jeder Typ, volle Sicherheit** |

---

> 🧠 **Erklaere dir selbst:** Warum ist `any` gefaehrlicher als `unknown`?
> Und warum loesen Generics BEIDE Probleme gleichzeitig?
> **Kernpunkte:** any deaktiviert den Compiler | unknown erzwingt Pruefungen | Generics bewahren den Typ durch die gesamte Funktion

---

> **Pausenpunkt** — Gut? Dann weiter zu [Sektion 02: Generische Funktionen](./02-generische-funktionen.md)
