# Sektion 4: Fortgeschrittene Tuples

> **Geschaetzte Lesezeit:** ~12 Minuten
>
> **Was du hier lernst:**
> - Variadic Tuple Types — generische Spreads in Tuples
> - Warum `Promise.all` dank Variadic Tuples korrekte Typen hat
> - `as const` tief verstanden: die drei Effekte auf einmal
> - `satisfies` + `as const`: das Beste aus beiden Welten
> - Wie du Union-Typen aus Arrays ableitest (Single Source of Truth)

---

## Variadic Tuple Types

Ab TypeScript 4.0 gibt es **Variadic Tuple Types** — generische Spreads in
Tuple-Positionen. Das klingt abstrakt, ist aber eines der maechtigsten
Features fuer Bibliotheks-Autoren und fortgeschrittene Typisierung.

### Das Grundprinzip

Ein normaler Generics-Parameter `T` steht fuer **einen** Typ. Bei Variadic
Tuples kann `T` fuer **ein ganzes Tuple** stehen — also mehrere Typen in
Reihenfolge:

```typescript annotated
type Prepend<T, Tuple extends readonly unknown[]> = [T, ...Tuple];
// ^ T: ein einzelner Typ  ^ Tuple: ein GANZES Tuple (mehrere Typen)
// ^ ...Tuple: Spread -- entpackt das Tuple an dieser Position

type A = Prepend<number, [string, boolean]>;
// ^ Ergebnis: [number, string, boolean] -- number wird vorne angefuegt

type B = Prepend<string, []>;
// ^ Ergebnis: [string] -- leeres Tuple + string = [string]
```

**Die Analogie:** Stell dir Variadic Tuples wie Textbausteine vor. Du hast
einzelne Formular-Abschnitte (Tuples), und Variadic Tuples erlauben dir,
diese Abschnitte **generisch zusammenzustecken** — ohne vorher zu wissen,
wie lang jeder Abschnitt ist.

### Warum ist das wichtig? — Reale Anwendungen

**1. Typisierung von `concat`-aehnlichen Funktionen:**

```typescript
function concat<A extends readonly unknown[], B extends readonly unknown[]>(
  a: [...A],
  b: [...B]
): [...A, ...B] {
  return [...a, ...b] as [...A, ...B];
}

const result = concat([1, "hello"] as const, [true, 42] as const);
// Typ: readonly [1, "hello", true, 42]
```

Ohne Variadic Tuples muesste man fuer jede Kombination von Laengen eine
eigene Ueberladung schreiben. Mit ihnen funktioniert es generisch fuer
**beliebige** Tuple-Laengen.

**2. So typisiert TypeScript intern `Promise.all`:**

```typescript annotated
function all<T extends readonly unknown[]>(
// ^ T ist ein Variadic Tuple -- steht fuer beliebig viele Typen
  values: [...T]
// ^ ...T entpackt das Tuple in die Parameterliste
): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
// ^ Mapped Type ueber Tuple: entpackt jeden Promise-Typ einzeln

const [user, posts] = await Promise.all([
  fetchUser(),
// ^ Promise<User> -- Position 0 im Tuple
  fetchPosts(),
// ^ Promise<Post[]> -- Position 1 im Tuple
]);
// ^ user: User, posts: Post[] -- Typen bleiben positionsgenau erhalten!
```

> 🧠 **Erklaere dir selbst:** Warum brauchte `Promise.all` vor TypeScript 4.0 ueber 10 Ueberladungen? Was aendert sich mit Variadic Tuple Types?
> **Kernpunkte:** Vorher: eine Ueberladung pro Argumentanzahl (1-10) | Jetzt: eine generische Signatur mit ...T | T steht fuer ein ganzes Tuple | Funktioniert fuer beliebig viele Argumente

> **Tieferes Wissen:** Vor TypeScript 4.0 hatte `Promise.all` ueber
> **10 Ueberladungen** in der Typdefinition — eine fuer 1 Argument, eine
> fuer 2, eine fuer 3, und so weiter bis 10. Variadic Tuple Types haben das
> auf **eine einzige** generische Signatur reduziert. Das gleiche gilt fuer
> `Function.prototype.bind` und viele RxJS-Operatoren wie `combineLatest`.

**3. Partial Application / Tail-Typ:**

```typescript
type Tail<T extends readonly unknown[]> =
  T extends [unknown, ...infer Rest] ? Rest : [];

type TailResult = Tail<[string, number, boolean]>;
// Ergebnis: [number, boolean]
```

> **Praxis-Tipp:** Du musst Variadic Tuples nicht taeglich schreiben.
> Aber du solltest verstehen, **warum** `Promise.all` und `combineLatest`
> (RxJS in Angular) korrekte Typen haben. Die Antwort ist immer: Variadic
> Tuple Types arbeiten im Hintergrund.

---

## `as const` — was es wirklich tut

`as const` ist kein "Trick" — es ist eine fundamentale **Type Assertion**,
die **drei Dinge gleichzeitig** bewirkt:

```
  as const bewirkt:
  ┌─────────────────────────────────────────────────────────────────┐
  │ 1. Widening wird verhindert:  "hello" statt string             │
  │                                42 statt number                 │
  │                                true statt boolean              │
  │                                                                │
  │ 2. Arrays werden zu readonly Tuples:  [1, 2] -> readonly [1, 2]│
  │                                                                │
  │ 3. Objekte werden tief readonly:  alle Properties readonly     │
  └─────────────────────────────────────────────────────────────────┘
```

```typescript
// Ohne as const:
const farben = ["rot", "gruen", "blau"];
// Typ: string[]

// Mit as const:
const farbenKonst = ["rot", "gruen", "blau"] as const;
// Typ: readonly ["rot", "gruen", "blau"]
//      Jeder Wert ist ein String-Literal!

// Ohne as const:
const config = [true, "production", 8080];
// Typ: (string | number | boolean)[]

// Mit as const:
const configKonst = [true, "production", 8080] as const;
// Typ: readonly [true, "production", 8080]
//      true (nicht boolean), "production" (nicht string), 8080 (nicht number)
```

> **Hintergrund: Warum existiert `as const`?** Das Problem, das es loest,
> heisst **Type Widening**. Wenn du `const x = "hello"` schreibst, inferiert
> TypeScript den Typ `"hello"` (Literal). Aber bei `const arr = ["hello"]`
> inferiert TypeScript `string[]` — der Literal-Typ geht verloren, weil
> TypeScript annimmt, du koenntest spaeter `arr.push("world")` aufrufen.
> `as const` sagt: "Nein, ich werde nichts aendern. Behalte die Literal-Typen."

> **Experiment-Box:** Vergleiche diese drei Varianten in deiner IDE:
> ```typescript
> // Variante 1: let ohne as const
> let a = ["rot", "blau"];
> // Variante 2: const ohne as const
> const b = ["rot", "blau"];
> // Variante 3: const mit as const
> const c = ["rot", "blau"] as const;
> ```
> Hovere ueber `a`, `b` und `c`. Du wirst sehen:
> - `a` ist `string[]` (let = mutable Variable, mutable Array)
> - `b` ist `string[]` (const = immutable Bindung, aber Array ist trotzdem mutable!)
> - `c` ist `readonly ["rot", "blau"]` (const + as const = alles eingefroren)
>
> **Wichtige Erkenntnis:** `const` schuetzt nur die **Variable** (Bindung),
> nicht den **Inhalt** des Arrays. `as const` schuetzt den Inhalt.

---

## Das wichtigste Pattern: Union-Typen aus Arrays ableiten

Dieses Pattern wirst du in fast jedem professionellen TypeScript-Projekt
finden:

```typescript
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
// Typ: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
```

**Wie funktioniert das Schritt fuer Schritt?**

```
  1. typeof HTTP_METHODS
     -> readonly ["GET", "POST", "PUT", "DELETE", "PATCH"]

  2. (typeof HTTP_METHODS)[number]
     -> Zugriff mit beliebigem numerischen Index
     -> Union aller moeglichen Werte
     -> "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
```

**Warum nicht einfach ein Union-Typ?** Weil du mit dem Array auch **zur
Laufzeit** arbeiten kannst, waehrend ein `type`-Alias nur zur Compile-Zeit
existiert:

```typescript
// Single Source of Truth: Array UND Typ aus einer Quelle
const ROLLEN = ["admin", "user", "moderator"] as const;
type Rolle = (typeof ROLLEN)[number];

// Laufzeit-Validierung (z.B. fuer API-Input):
function isValidRole(input: string): input is Rolle {
  return (ROLLEN as readonly string[]).includes(input);
}

// In Angular: fuer Dropdown-Optionen
// <select>
//   @for (rolle of ROLLEN; track rolle) {
//     <option [value]="rolle">{{ rolle }}</option>
//   }
// </select>

// OHNE as const muesste man die Werte doppelt pflegen:
type Rolle2 = "admin" | "user" | "moderator";       // hier...
const ROLLEN2 = ["admin", "user", "moderator"];      // ...und hier (Duplikation!)
```

> **Praxis-Tipp:** Dieses Pattern ist die **Standardloesung** fuer
> Enumerationen in modernem TypeScript. Viele Teams bevorzugen es gegenueber
> `enum`, weil es keine Laufzeit-Artefakte erzeugt und gleichzeitig sowohl
> Typ als auch Laufzeitwerte liefert.

---

## `satisfies` + `as const` — das Beste aus beiden Welten (TS 4.9+)

### Das Problem mit `as const` allein

```typescript
const config = {
  port: 8080,
  host: "localhost",
  modes: ["dev", "prod"],
} as const;
// Kein Fehler wenn du z.B. 'prot' statt 'port' schreibst — es gibt keinen Zieltyp!
```

`as const` gibt dir praezise Literal-Typen, aber **keine Validierung** gegen
ein erwartetes Schema. Du koenntest Tippfehler in den Keys haben und es
faellt niemandem auf.

### Die Loesung: `satisfies` prueft, `as const` behaelt Literale

```typescript
interface AppConfig {
  port: number;
  host: string;
  modes: readonly string[];
}

const checkedConfig = {
  port: 8080,
  host: "localhost",
  modes: ["dev", "prod"],
} as const satisfies AppConfig;

// checkedConfig.port hat Typ 8080 (nicht number!) — UND ist typgeprueft!
// checkedConfig.modes hat Typ readonly ["dev", "prod"] — UND erfuellt AppConfig!
```

> **Denkfrage:**
> ```typescript
> const pair = [1, "hello"] as const;
> type PairType = typeof pair;
> ```
> Was ist `PairType`? Ist es `readonly [number, string]` oder
> `readonly [1, "hello"]`?
>
> **Antwort:** Es ist `readonly [1, "hello"]` — `as const` inferiert die
> **Literal-Typen**, nicht die erweiterten Typen. Position 0 ist exakt `1`
> (nicht `number`) und Position 1 ist exakt `"hello"` (nicht `string`).

> **Rubber-Duck-Prompt:** Erklaere einer anderen Person:
>
> 1. Was ist der Unterschied zwischen `as const` allein und
>    `as const satisfies Type`?
> 2. Warum reicht `satisfies` allein nicht, um Literal-Typen zu behalten?
> 3. In welcher Situation wuerdest du `as const satisfies` in einem
>    realen Projekt verwenden? (Tipp: Denke an Konfigurationsdateien
>    oder Route-Definitionen.)
>
> Wenn du Punkt 2 nicht beantworten kannst, lies den Abschnitt ueber
> Type Widening nochmal.

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen `as const` allein und `as const satisfies Type`? Warum reicht `satisfies` allein nicht, um Literal-Typen zu behalten?
> **Kernpunkte:** as const allein: Literal-Typen + readonly, aber keine Validierung | satisfies allein: Validierung, aber Widening moeglich | Kombination: Literal-Typen + Validierung | Reihenfolge: erst einfrieren, dann pruefen

### Reihenfolge beachten

```typescript
// RICHTIG: as const satisfies Type
const a = { x: 1 } as const satisfies { x: number };

// FALSCH: satisfies as const — geht nicht!
// const b = { x: 1 } satisfies { x: number } as const;  // Syntax-Fehler
```

Die Reihenfolge ist `as const satisfies Type` — erst Literal-Typen
erzwingen, dann gegen den Zieltyp pruefen.

---

## Zusammenspiel: `as const` + `typeof` + Indexed Access

Dieses Dreierteam ist ein Grundbaustein professioneller TypeScript-
Architekturen:

```typescript
// Schritt 1: Definition mit as const
const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// Schritt 2: Typ aus den Werten ableiten
type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
// Typ: 200 | 404 | 500

// Schritt 3: Typ aus den Keys ableiten
type StatusName = keyof typeof STATUS_CODES;
// Typ: "OK" | "NOT_FOUND" | "SERVER_ERROR"
```

```
  as const            typeof              [keyof typeof X]
  --------            ------              ----------------
  Literal-Typen       Typ extrahieren     Werte als Union
  behalten            aus Laufzeitwert    extrahieren
```

---

## Was du gelernt hast

- Variadic Tuple Types erlauben generische Spreads in Tuples — sie sind der
  Grund, warum `Promise.all` und RxJS `combineLatest` korrekte Typen haben
- `as const` hat drei Effekte: verhindert Widening, macht Arrays zu readonly
  Tuples, macht Objekte tief readonly
- `(typeof ARR)[number]` leitet einen Union-Typ aus einem `as const` Array
  ab — das Standardpattern fuer Enumerationen
- `satisfies` + `as const` kombiniert Literal-Typen mit Schema-Validierung
- Diese Patterns vermeiden Duplikation zwischen Laufzeit- und Typ-Ebene

**Pausenpunkt:** Die naechste Sektion behandelt Kovarianz — ein Konzept,
das erklaert, warum manche Array-Zuweisungen funktionieren und andere nicht,
und wo TypeScript bewusst unsound ist.

---

[<-- Vorherige Sektion: Tuples Grundlagen](03-tuples-grundlagen.md) | [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Kovarianz und Sicherheit -->](05-kovarianz-und-sicherheit.md)
