# Sektion 4: in/out Modifier (TS 4.7)

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Varianz verstehen](./03-varianz-verstehen.md)
> Naechste Sektion: [05 - Fortgeschrittene Constraints](./05-fortgeschrittene-constraints.md)

---

## Was du hier lernst

- Die `out`-Annotation fuer **Kovarianz** und `in` fuer **Kontravarianz**
- Wann und warum man `in out` fuer **Invarianz** verwendet
- Wie die Modifier **Performance** verbessern (keine strukturelle Varianzberechnung)
- Die Beziehung zu C#'s `in`/`out` und warum TypeScript sie uebernommen hat

---

## Das Problem: Implizite Varianz

In Sektion 3 hast du gelernt, dass Varianz davon abhaengt, WO ein
Typparameter verwendet wird. TypeScript berechnet das automatisch:

```typescript annotated
interface Producer<T> {
  get(): T;          // T in Output → kovariant
}

interface Consumer<T> {
  accept(item: T): void;  // T in Input → kontravariant
}

interface MutableBox<T> {
  get(): T;            // Output → kovariant
  set(value: T): void; // Input → kontravariant
  // ^^^ Zusammen: invariant
}
// TypeScript berechnet die Varianz STRUKTURELL:
// Es schaut sich jeden Member an und prueft wo T vorkommt.
```

Das funktioniert, hat aber zwei Nachteile:

1. **Performance:** Bei komplexen Typen mit vielen Members ist die
   strukturelle Berechnung teuer. TypeScript muss JEDEN Member pruefen.
2. **Klarheit:** Man sieht dem Interface nicht an, welche Varianz es hat.
   Man muss den gesamten Typ analysieren.

---

> 📖 **Hintergrund: Von C# zu TypeScript**
>
> C# 4.0 (April 2010) fuehrte `in`/`out`-Modifier fuer generische
> Interfaces und Delegates ein. Anders Hejlsberg — der sowohl C# als auch
> TypeScript designte — uebernahm die Idee 12 Jahre spaeter fuer
> TypeScript 4.7 (Mai 2022).
>
> In C# war die Motivation klar: `IEnumerable<out T>` (kovariant) vs
> `IComparer<in T>` (kontravariant). Die Modifier machten Code sicherer
> und die Absicht klarer. In TypeScript kam ein weiterer Vorteil hinzu:
> Performance. Da TypeScript's Typsystem strukturell ist (nicht nominal
> wie C#), muss die Varianz normalerweise fuer jeden Vergleich neu
> berechnet werden. Mit expliziten Modifiern entfaellt das.
>
> Das TypeScript 4.7 Release Blog nannte die Modifier "optional variance
> annotations" — optional, weil TypeScript die Varianz auch ohne sie
> berechnen kann. Aber mit ihnen geht es schneller und klarer.

---

## Die Syntax: `out` fuer Kovarianz

```typescript annotated
// OHNE Modifier (funktioniert, aber implizit):
interface ProducerOld<T> {
  get(): T;
}

// MIT Modifier (explizit und geprueft):
interface Producer<out T> {
  get(): T;
}
// ^^^ "out T" sagt: T kommt nur in OUTPUT-Position vor.
//     TypeScript PRUEFT das! Wenn du T in Input-Position verwendest:

interface BadProducer<out T> {
  get(): T;
  set(value: T): void; // ERROR! T in Input-Position verletzt "out"
}
// ^^^ TypeScript gibt einen Fehler:
//     "Type 'T' is not assignable to type 'T'.
//      Variance annotations must match the variance
//      of the type parameter."
```

Der `out`-Modifier deklariert: "Dieser Typparameter wird nur
**herausgegeben**. Der Typ ist kovariant in T."

---

## Die Syntax: `in` fuer Kontravarianz

```typescript annotated
// Kontravariant: T kommt nur in INPUT-Position vor.
interface Consumer<in T> {
  accept(item: T): void;   // OK: T in Parameter (Input)
  process(item: T): boolean; // OK: T in Parameter (Input)
}

// Was NICHT geht:
interface BadConsumer<in T> {
  accept(item: T): void;
  get(): T;  // ERROR! T in Output-Position verletzt "in"
}
// ^^^ "in T" sagt: T wird nur KONSUMIERT, nie PRODUZIERT.
```

---

## Invarianz: `in out` zusammen

```typescript annotated
// Invariant: T wird gelesen UND geschrieben.
interface MutableBox<in out T> {
  get(): T;             // Output
  set(value: T): void;  // Input
}
// ^^^ "in out T" sagt explizit: Dieser Typ ist invariant.
//     MutableBox<Cat> ist NICHT zuweisbar an MutableBox<Animal>.

// Was passiert wenn wir "out" bei MutableBox verwenden?
interface WrongBox<out T> {
  get(): T;
  set(value: T): void; // ERROR! T in Input-Position.
}
// ^^^ TypeScript erzwingt die Annotation!
```

> 🧠 **Erklaere dir selbst:** Warum ist `interface Producer<out T>` kovariant?
> Denke daran wo T steht: `get(): T`. T ist der Rueckgabetyp — Output-Position.
> Ein Producer<Cat> gibt Katzen heraus. Ueberall wo ein Tier erwartet wird,
> ist eine Katze akzeptabel. Also: Producer<Cat> extends Producer<Animal>.
>
> **Kernpunkte:** `out` = Output = Rueckgabetyp | Kovarianz = Subtyprichtung
> bleibt | Producer<Cat> "passt" in Producer<Animal> weil Katze ein Tier ist

---

> 🤔 **Denkfrage:** Kann ein Typparameter gleichzeitig `in` und `out` sein?
> Was wuerde das bedeuten?
>
> Ja! `<in out T>` ist gueltige Syntax und deklariert Invarianz.
> Es bedeutet: T wird sowohl gelesen als auch geschrieben. Keine
> Subtyp-Beziehung in keine Richtung.

---

## Performance-Vorteile

Die Modifier sind nicht nur fuer Klarheit — sie verbessern die
Compile-Performance:

```typescript annotated
// OHNE Modifier:
interface BigInterface<T> {
  method1(): T;
  method2(): T;
  method3(callback: (item: T) => void): void;
  method4(): { nested: T };
  method5(arr: T[]): T;
  // ... 20 weitere Members
}
// ^^^ TypeScript muss JEDEN Member pruefen um die Varianz zu berechnen.
//     Bei 20+ Members und verschachtelten Typen ist das teuer.

// MIT Modifier:
interface BigInterface<in out T> {
  method1(): T;
  method2(): T;
  method3(callback: (item: T) => void): void;
  method4(): { nested: T };
  method5(arr: T[]): T;
  // ... 20 weitere Members
}
// ^^^ TypeScript liest die Annotation: "invariant". Fertig.
//     Keine strukturelle Analyse noetig.
//     Bei grossen Projekten: messbare Compile-Zeit-Verbesserungen.
```

---

> 🔬 **Experiment:** Fuege `out` zu einem Interface hinzu das T sowohl
> liest als auch schreibt. Was passiert?
>
> ```typescript
> interface StateContainer<out T> {
>   getState(): T;
>   setState(newState: T): void; // Was sagt TypeScript?
> }
> ```
>
> TypeScript gibt einen Fehler: T in `setState` steht in Input-Position,
> aber `out` erlaubt nur Output. Loesung: Entweder `in out T` oder
> `setState` entfernen.

---

## Praxisbeispiel: ReadonlyArray vs Array

```typescript annotated
// ReadonlyArray ist NATUERLICH kovariant:
// Es gibt nur Lese-Methoden — T steht nur in Output-Position.
interface ReadonlyArray<out T> {
  readonly length: number;
  [index: number]: T;          // Nur lesen
  map<U>(fn: (item: T) => U): U[];
  filter(fn: (item: T) => boolean): T[];
  // Kein push(), kein splice() — kein Input!
}

// Array waere INVARIANT (lesen + schreiben):
interface MutableArray<in out T> {
  [index: number]: T;
  push(item: T): number;       // Input
  pop(): T | undefined;         // Output
  map<U>(fn: (item: T) => U): U[];  // Output
}

// TypeScript's eingebautes Array<T> hat KEINEN Modifier —
// es ist implizit invariant, aber TypeScript erlaubt kovariante
// Zuweisungen (die beruehmte "Unsicherheit").
```

---

## Wann Modifier verwenden?

| Situation | Empfehlung |
|---|---|
| Library/API | Immer Modifier verwenden — Klarheit und Performance |
| Interner Code | Optional, aber hilfreich bei komplexen Typen |
| Bestehender Code | Nachruesten wenn moeglich — verbessert Compile-Zeit |
| Readonly-Typen | `out T` — sie sind natuerlich kovariant |
| Mutable-Typen | `in out T` — explizit invariant |
| Handler/Callbacks | `in T` — sie konsumieren T |

---

## Der Framework-Bezug

> 🅰️ **Angular:** `ReadonlyArray<T>` ist natuerlich kovariant (`out T`).
> Angular's `WritableSignal<T>` (Angular 16+) waere invariant — man liest
> UND schreibt den Signal-Wert. Ein `WritableSignal<Cat>` kann nicht
> einem `WritableSignal<Animal>` zugewiesen werden. Dagegen waere ein
> `Signal<T>` (readonly) kovariant: `Signal<Cat>` ist ein `Signal<Animal>`.
>
> ⚛️ **React:** `Dispatch<SetStateAction<T>>` aus `useState` ist
> kontravariant in T — es nimmt T entgegen (Input). `T` selbst im
> State ist invariant (lesen + schreiben). Das erklaert warum
> `useState<Animal>` nicht direkt mit `useState<Cat>` kompatibel ist.

---

## Zusammenfassung der Modifier-Syntax

```typescript
// Kovariant: nur Output
interface Producer<out T> { get(): T; }

// Kontravariant: nur Input
interface Consumer<in T> { accept(item: T): void; }

// Invariant: beides
interface Box<in out T> { get(): T; set(value: T): void; }

// Mehrere Typparameter:
interface Transform<in A, out B> { run(input: A): B; }
// ^^^ A ist kontravariant (Input), B ist kovariant (Output).
//     Transform<Animal, Cat> extends Transform<Cat, Animal>!
```

---

## Was du gelernt hast

- **`out T`** deklariert Kovarianz — T steht nur in Output-Position.
  TypeScript prueft und erzwingt das.
- **`in T`** deklariert Kontravarianz — T steht nur in Input-Position.
- **`in out T`** deklariert Invarianz — T in beiden Positionen.
- Die Modifier verbessern **Performance** (keine strukturelle Berechnung)
  und **Klarheit** (Varianz ist sofort sichtbar).
- Inspiriert von **C# 4.0** (2010), eingefuehrt in **TypeScript 4.7** (2022).
- Verschiedene Typparameter koennen verschiedene Modifier haben:
  `<in A, out B>`.

> **Kernkonzept:** `in`/`out`-Modifier sind Varianz-ANNOTATIONEN, keine
> Verhaltensaenderungen. TypeScript berechnet Varianz sowieso — die
> Modifier machen die Absicht explizit und beschleunigen den Compiler.

---

> ⏸️ **Pausenpunkt:** Guter Zeitpunkt fuer eine kurze Pause.
> In der naechsten Sektion geht es um **fortgeschrittene Constraints**:
> Intersection-Constraints, rekursive Constraints und distributives
> Verhalten bei Conditional Types.
>
> **Weiter:** [Sektion 05 - Fortgeschrittene Constraints →](./05-fortgeschrittene-constraints.md)
