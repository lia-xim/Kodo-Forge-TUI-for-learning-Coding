# Sektion 6: Generische APIs designen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Fortgeschrittene Constraints](./05-fortgeschrittene-constraints.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Die **Rule of Two**: Wann ein Typparameter sinnvoll ist und wann nicht
- **Overloads vs Generics**: Wann welches Werkzeug das richtige ist
- Wie TypeScript's **Inference-Heuristiken** funktionieren und wie man sie lenkt
- **Default-Typparameter** und ihre Interaktion mit Inference
- Praktische Prinzipien fuer **ergonomische** generische APIs

---

## "Generics sind ein Werkzeug, kein Ziel"

Der haeufigste Fehler bei fortgeschrittenen TypeScript-Entwicklern: Zu
viele Generics. Man hat das maechtige Werkzeug und will es ueberall
einsetzen. Aber Generics die keine Beziehung herstellen, fuegen nur
Komplexitaet hinzu.

```typescript annotated
// ANTI-PATTERN: T kommt nur einmal vor
function logValue<T>(value: T): void {
  console.log(value);
}
// ^^^ T wird nur als Parameter verwendet, nie im Rueckgabetyp.
//     Es korreliert nichts — T traegt keine Information.
//     Identisch mit: function logValue(value: unknown): void

// GUT: T kommt zweimal vor (Input → Output)
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
// ^^^ T verbindet den Array-Element-Typ mit dem Rueckgabetyp.
//     DAS ist der Sinn von Generics: Beziehungen herstellen.

// GUT: T kommt zweimal vor (mehrere Parameter)
function merge<T>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}
// ^^^ T verbindet target und source — source muss zu target passen.
```

---

> 📖 **Hintergrund: "Generics sind ein Werkzeug, kein Ziel"**
>
> Dieser Satz stammt aus der offiziellen TypeScript-Dokumentation. Das
> TypeScript-Team hat beobachtet, dass Entwickler nach dem Lernen von
> Generics dazu neigen, sie ueberall einzusetzen — selbst wo sie keinen
> Mehrwert bringen.
>
> Die Regel ist einfach: Ein Typparameter muss mindestens **zwei Mal**
> vorkommen um nuetzlich zu sein. Einmal im Input und einmal im Output
> (oder in zwei verschiedenen Parametern). Kommt er nur einmal vor,
> kann er durch `unknown` oder einen konkreten Typ ersetzt werden.
>
> Das nennt man die **"Rule of Two"**. Sie ist der einfachste Test um
> zu entscheiden ob ein Generic sinnvoll ist.

---

## Overloads vs Generics

Wann sollte man Function Overloads verwenden und wann Generics?

```typescript annotated
// OVERLOADS: Feste Menge diskreter Input-Output-Beziehungen
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): string | number {
  if (typeof input === "string") return parseInt(input, 10);
  return String(input);
}
// ^^^ Zwei diskrete Faelle: string→number und number→string.
//     Das ist ein MAPPING, kein parametrisches Verhaeltnis.

// GENERICS: Parametrische Beziehung — der Output-Typ HAENGT vom Input AB
function identity<T>(value: T): T {
  return value;
}
// ^^^ Fuer JEDEN Typ T gilt: Input und Output haben den gleichen Typ.
//     Das ist eine allgemeine Regel, nicht ein diskretes Mapping.

// FALSCH: Generic wo Overload besser waere
function badParse<T extends string | number>(input: T): T extends string ? number : string {
  // Kompliziert, schwer zu lesen, und die Implementation
  // braucht Type Assertions...
  return (typeof input === "string" ? parseInt(input as string, 10) : String(input)) as any;
}
// ^^^ Die Generic-Version ist SCHLECHTER: schwerer zu lesen,
//     braucht Type Assertions, und bietet keinen Vorteil.
```

| Kriterium | Overloads | Generics |
|---|---|---|
| Endliche Faelle | Ja (2-5 Overloads) | Nein |
| Parametrische Beziehung | Nein | Ja |
| Implementation | Einfacher | Kann komplex sein |
| Erweiterbarkeit | Neue Overload hinzufuegen | Neue Typen automatisch |
| Error Messages | Klar | Manchmal kryptisch |

---

> 🧠 **Erklaere dir selbst:** Wann ist ein Function-Overload besser als ein
> Generic? Denke an ein konkretes Beispiel aus deinem Code.
>
> **Kernpunkte:** Overload = "wenn A, dann B; wenn C, dann D" (diskret) |
> Generic = "fuer alle T gilt: f(T) → T" (parametrisch) |
> Overloads fuer Event-Handler (click → MouseEvent, keydown → KeyboardEvent) |
> Generics fuer Container (Array<T>.map → Array<U>)

---

## Inference lenken

TypeScript's Type Inference ist maechtig — aber fragil. Gute API-Designer
wissen, wie man die Inference in die richtige Richtung lenkt:

```typescript annotated
// Problem: Inference-Konflikt
function createPair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

const pair1 = createPair("hello", "world"); // OK: T = string
const pair2 = createPair("hello", 42);
// ^^^ ERROR! "hello" und 42 haben verschiedene Typen.
//     TypeScript kann T nicht gleichzeitig string UND number inferieren.

// Loesung 1: Zwei Typparameter
function createPair2<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const pair3 = createPair2("hello", 42); // OK: A = string, B = number

// Loesung 2: Inference nur an EINER Stelle
function createArrayOf<T>(item: T, count: number): T[] {
  return Array(count).fill(item);
}
// ^^^ T wird nur aus `item` inferiert — keine Konflikte.
//     `count` hat seinen eigenen Typ (number), unabhaengig von T.
```

---

## Default-Typparameter und Inference

Defaults interagieren mit Inference nach einer klaren Prioritaet:

```typescript annotated
// Prioritaet: Explizit > Inference > Default

function createBox<T = string>(value?: T): { value: T | undefined } {
  return { value };
}

// 1. EXPLIZIT: Hoechste Prioritaet
const box1 = createBox<number>(42);     // T = number (explizit)
const box2 = createBox<number>();        // T = number (explizit, kein Argument)

// 2. INFERENCE: Wenn aus Argumenten ableitbar
const box3 = createBox(42);             // T = number (inferiert aus 42)
const box4 = createBox("hello");        // T = string (inferiert)

// 3. DEFAULT: Wenn keine Inference moeglich
const box5 = createBox();              // T = string (Default!)
// ^^^ Kein Argument, kein expliziter Typ → Default greift.

// Conflict: Explicit vs Argument
// const box6 = createBox<number>("hello"); // ERROR: string != number
// ^^^ Explizit hat Vorrang — TypeScript prueft ob das Argument passt.
```

---

> 🤔 **Denkfrage:** Du designst eine HTTP-Client-Funktion. Welches Design
> ist besser und warum?
>
> ```typescript
> // Design A: Ein Typparameter fuer alles
> function fetch<T>(url: string, options?: RequestInit): Promise<T>;
>
> // Design B: T aus dem Schema ableiten
> function fetch<T>(url: string, schema: Schema<T>): Promise<T>;
>
> // Design C: Overloads fuer bekannte Endpoints
> function fetch(url: "/users"): Promise<User[]>;
> function fetch(url: "/posts"): Promise<Post[]>;
> ```
>
> Analyse: Design A ist unsicher (`T` wird nie geprueft — es ist ein Cast).
> Design B ist am sichersten (Schema validiert T zur Laufzeit).
> Design C ist am praezisesten fuer bekannte Endpoints.

---

> 🔬 **Experiment:** Schreibe eine `pipe()`-Funktion mit Generics, die
> bis zu 3 Transformationen verkettet:
>
> ```typescript
> function pipe<A, B>(value: A, fn1: (a: A) => B): B;
> function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
> function pipe<A, B, C, D>(
>   value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D
> ): D;
>
> // Teste:
> const result = pipe(
>   "42",
>   s => parseInt(s, 10),  // string → number
>   n => n * 2,             // number → number
>   n => `Result: ${n}`     // number → string
> );
> // result sollte "Result: 84" sein
> ```
>
> Beachte: Hier sind Overloads UND Generics kombiniert! Die Overloads
> geben die Anzahl der Schritte vor, die Generics die Typen.

---

## Praktische Design-Prinzipien

Hier sind die wichtigsten Regeln fuer gutes Generic-API-Design:

```typescript annotated
// PRINZIP 1: Rule of Two
// Typparameter muss mind. 2x vorkommen
function good<T>(arr: T[]): T { return arr[0]; }     // T: 2x ✓
function bad<T>(x: T): void { console.log(x); }       // T: 1x ✗

// PRINZIP 2: Weniger Typparameter = besser
// Maximal 3 Typparameter fuer oeffentliche APIs
function ok<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
function tooMuch<A, B, C, D, E>(a: A, b: B, c: C): D { /* ... */ }
// ^^^ 5 Typparameter — kaum jemand versteht die Signatur.

// PRINZIP 3: Inference wo moeglich
// Nutzer sollen keine Typparameter angeben MUESSEN
function wrap<T>(value: T): { value: T } { return { value }; }
wrap(42); // T = number, automatisch inferiert ✓
// wrap<number>(42); // Moeglich, aber unnoetig

// PRINZIP 4: Gute Defaults
function createState<T = unknown>(initial?: T): State<T> { /* ... */ }
// ^^^ `unknown` ist ein sicherer Default (besser als `any`!)

// PRINZIP 5: Constraints so eng wie noetig, so weit wie moeglich
function getId<T extends { id: number }>(item: T): number { return item.id; }
// ^^^ Nur `id` wird gebraucht — nicht das gesamte Entity-Interface.
//     Je enger der Constraint, desto mehr Typen passen.
```

---

## Der Framework-Bezug

> ⚛️ **React:** `useQuery<TData, TError>` aus React Query nutzt zwei
> Default-Typparameter: `TData = unknown` und `TError = unknown`. Die
> meisten Nutzer muessen nur TData angeben — TError bleibt beim Default.
> Das ist gutes API-Design: Inference fuer den Hauptfall, Defaults fuer
> den Rest.
>
> 🅰️ **Angular:** `inject<T>(token: ProviderToken<T>): T` inferiert T
> aus dem Token-Typ. Man schreibt `inject(UserService)`, nicht
> `inject<UserService>(UserService)`. Die Inference-Stelle ist klar:
> Ein Parameter, ein Typparameter, perfekte Korrelation.

---

## Anti-Patterns zusammengefasst

```typescript annotated
// ❌ ANTI-PATTERN 1: T nur einmal (Rule of Two verletzt)
function log<T>(x: T): void { }
// → Besser: function log(x: unknown): void { }

// ❌ ANTI-PATTERN 2: Generic mit sofortigem Cast
function unsafeParse<T>(json: string): T {
  return JSON.parse(json) as T; // KEIN Type Safety!
}
// → Besser: Schema-basierte Validation (Zod, io-ts)

// ❌ ANTI-PATTERN 3: Zu viele Typparameter
function transform<A, B, C, D, E>(input: A, f1: (a: A) => B, ...): E { }
// → Besser: Aufteilen in kleinere Funktionen

// ❌ ANTI-PATTERN 4: any als Default
function createStore<T = any>(): Store<T> { }
// → Besser: <T = unknown> — sicher!

// ❌ ANTI-PATTERN 5: Generic wo Union reicht
function format<T extends string | number>(value: T): string { }
// → Besser: function format(value: string | number): string { }
//   (T wird nur einmal verwendet)
```

---

## Checkliste fuer Generic-APIs

Bevor du eine generische Funktion oder einen generischen Typ
veroeffentlichst, pruefe:

1. **Rule of Two:** Kommt jeder Typparameter mindestens 2x vor?
2. **Inference:** Kann TypeScript die Typparameter automatisch ableiten?
3. **Defaults:** Gibt es sinnvolle Default-Typparameter?
4. **Constraints:** Sind sie eng genug fuer Safety, weit genug fuer
   Flexibilitaet?
5. **Varianz:** Sind `in`/`out`-Modifier gesetzt (bei Interfaces)?
6. **Overloads:** Waeren Overloads klarer als ein Generic?
7. **Dokumentation:** Ist die Signatur ohne Doku verstaendlich?

---

## Was du gelernt hast

- Die **Rule of Two**: Ein Typparameter muss mindestens 2x vorkommen
  (Input ↔ Output). Sonst `unknown` oder Union verwenden.
- **Overloads vs Generics**: Overloads fuer diskrete Mappings (wenn A dann B),
  Generics fuer parametrische Beziehungen (fuer alle T).
- **Inference** hat Prioritaet: Explizit > Inference > Default.
  Gute APIs brauchen selten explizite Typparameter.
- **Default-Typparameter** mit `unknown` (nie `any`!) als Fallback.
- **Anti-Patterns**: T nur 1x, sofortiger Cast, zu viele Parameter,
  Generic wo Union reicht.

> **Kernkonzept:** Generics sind maechtig, aber Maecht kommt mit
> Verantwortung. Das beste Generic ist das, das der Nutzer nie sieht
> — weil TypeScript alles automatisch inferiert. "Generics sind ein
> Werkzeug, kein Ziel."

---

## Lektion 22 abgeschlossen!

Du hast die fortgeschrittenen Aspekte von Generics gemeistert:

1. **Grenzen einfacher Generics** und die Motivation fuer Advanced
2. **Higher-Order Types** mit dem URI-to-Kind-Pattern
3. **Varianz** — Kovarianz, Kontravarianz, Invarianz
4. **in/out-Modifier** fuer explizite Varianz-Annotationen
5. **Fortgeschrittene Constraints** — Intersection, Recursive, Conditional
6. **API-Design** — Rule of Two, Overloads vs Generics, Inference

> **Naechste Schritte:**
> - Loese die Exercises in `exercises/`
> - Teste dein Wissen mit dem Quiz: `npx tsx quiz.ts`
> - Nutze das Cheatsheet als Schnellreferenz
>
> **Naechste Lektion:** [23 - Recursive Types](../../23-recursive-types/README.md) —
> Typen die sich selbst referenzieren: JSON, Tree-Strukturen und tiefe
> Verschachtelung.
