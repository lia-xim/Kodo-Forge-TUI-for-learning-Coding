# Lektion 08: Type Aliases vs Interfaces

> **Voraussetzung:** Lektionen 01-07 abgeschlossen, insbesondere Grundlagen zu
> Typen, Union Types, und Objekt-Typen.
> **Ziel:** Die Unterschiede zwischen `type` und `interface` verstehen und eine
> fundierte Entscheidung treffen, wann welches Konstrukt das richtige ist.
> **Kernfrage dieser Lektion:** Wann verwende ich `type`, wann `interface` — und
> warum ist die Antwort nicht so einfach wie "nimm immer interface"?
> **Gesamtdauer:** ~50 Minuten (5 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **fuenf Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Type Aliases Deep Dive](./sections/01-type-aliases-deep-dive.md) | ~10 Min | type Keyword, Primitive Aliases, Union/Intersection, Mapped Types |
| 02 | [Interfaces Deep Dive](./sections/02-interfaces-deep-dive.md) | ~10 Min | Declaration Merging, extends-Ketten, implements, Reopening |
| 03 | [Der grosse Vergleich](./sections/03-der-grosse-vergleich.md) | ~10 Min | Tabelle aller Unterschiede, Performance (extends vs &) |
| 04 | [Entscheidungsmatrix](./sections/04-entscheidungsmatrix.md) | ~10 Min | Flowchart: Wann type, wann interface? Klare Regeln |
| 05 | [Patterns und Best Practices](./sections/05-patterns-und-best-practices.md) | ~10 Min | Angular vs React Konventionen, Team-Standards |

---

## Empfohlener Lernweg

```
Sektionen 01-05 lesen (je ~10 Min, Pausen dazwischen moeglich)
        |
        v
Examples in examples/ durcharbeiten und experimentieren
        |
        v
Exercises in exercises/ loesen (TODO-Aufgaben)
        |
        v
Quiz mit "npx tsx quiz.ts" testen
        |
        v
Loesungen in solutions/ vergleichen
        |
        v
Cheatsheet (cheatsheet.md) als Schnellreferenz behalten
```

---

## Dateistruktur

```
08-type-aliases-vs-interfaces/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-type-aliases-deep-dive.md
│   ├── 02-interfaces-deep-dive.md
│   ├── 03-der-grosse-vergleich.md
│   ├── 04-entscheidungsmatrix.md
│   └── 05-patterns-und-best-practices.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-type-alias-grundlagen.ts
│   ├── 02-interface-grundlagen.ts
│   ├── 03-unterschiede-in-aktion.ts
│   ├── 04-mapped-und-utility-types.ts
│   └── 05-praxis-patterns.ts
├── exercises/                <-- Uebungen mit TODOs
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Type Aliases sind vielseitiger**: `type` kann Unions, Intersections,
   Primitive Aliases, Tuples, Mapped Types und Conditional Types ausdruecken.
   `interface` kann das nicht.

2. **Interfaces sind erweiterbar**: Nur `interface` unterstuetzt Declaration
   Merging — dasselbe Interface kann mehrfach deklariert werden und wird
   automatisch zusammengefuegt.

3. **extends ist schneller als &**: Interfaces mit `extends` werden vom
   Compiler besser gecacht als Intersection Types mit `&`. Bei grossen
   Projekten kann das die Compile-Zeit beeinflussen.

4. **interface fuer Objekte, type fuer alles andere**: Die einfachste
   Faustregel, die in 90% der Faelle richtig ist.

5. **Declaration Merging ist gewollt**: Bibliotheken wie Express oder
   Mongoose nutzen Declaration Merging gezielt, damit Nutzer die Typen
   erweitern koennen.

6. **implements funktioniert mit beiden**: Klassen koennen sowohl
   Interfaces als auch Type Aliases implementieren (solange es ein
   Objekttyp ist).

7. **Union Types sind type-exklusiv**: `type Result = Success | Error`
   ist mit `interface` nicht moeglich. Das ist der haeufigste Grund,
   `type` zu waehlen.

8. **Mapped Types sind type-exklusiv**: `type Readonly<T> = { readonly [K in keyof T]: T[K] }`
   geht nur mit `type`, nicht mit `interface`.

9. **Angular bevorzugt Interfaces**: Das Angular-Team empfiehlt
   `interface` fuer DTOs und Service-Contracts.

10. **React bevorzugt Types**: Die React-Community und das offizielle
    React-Team nutzen ueberwiegend `type` fuer Props und State.

</details>

---

> **Starte hier:** [Sektion 01 - Type Aliases Deep Dive](./sections/01-type-aliases-deep-dive.md)
>
> **Naechste Lektion:** 09 — Union Types und Discriminated Unions —
> Wie du mit Union Types maechtiges Pattern Matching in TypeScript
> ausdrueckst.
