# Lektion 07: Union & Intersection Types

> **Voraussetzung:** Lektionen 01-06 abgeschlossen, insbesondere Lektion 02
> (Primitive Types, Typhierarchie, never) und Lektion 05 (Objects und Interfaces).
> **Ziel:** Union und Intersection Types sicher anwenden — von Grundlagen bis
> zu fortgeschrittenen Patterns wie State Machines und Result Types.
> **Kernfrage dieser Lektion:** Wann modellierst du "entweder A oder B" (Union)
> und wann "sowohl A als auch B" (Intersection) — und wie arbeiten beide zusammen?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Union Types Grundlagen](./sections/01-union-types-grundlagen.md) | ~10 Min | \| Operator, Union aus Primitives, Literal Unions, Union vs Enum |
| 02 | [Type Guards und Narrowing](./sections/02-type-guards-und-narrowing.md) | ~10 Min | typeof, instanceof, in, Truthiness, Assignment Narrowing, TS 5.5 Inferred Type Predicates |
| 03 | [Discriminated Unions](./sections/03-discriminated-unions.md) | ~10 Min | Tag-Property, exhaustive switch, never-Check, ADTs |
| 04 | [Intersection Types](./sections/04-intersection-types.md) | ~10 Min | & Operator, Object-Kombination, Konflikte (→ never), extends vs & |
| 05 | [Union vs Intersection](./sections/05-union-vs-intersection.md) | ~10 Min | Wann was? Entscheidungsmatrix, Verteilungsgesetz |
| 06 | [Praxis-Patterns](./sections/06-praxis-patterns.md) | ~10 Min | State Machines, Error Handling, API Responses, Event Systems |

---

## Empfohlener Lernweg

```
Sektionen 01-06 lesen (je ~10 Min, Pausen dazwischen moeglich)
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
07-union-und-intersection-types/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-union-types-grundlagen.md
│   ├── 02-type-guards-und-narrowing.md
│   ├── 03-discriminated-unions.md
│   ├── 04-intersection-types.md
│   ├── 05-union-vs-intersection.md
│   └── 06-praxis-patterns.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-union-types.ts
│   ├── 02-type-guards.ts
│   ├── 03-discriminated-unions.ts
│   ├── 04-intersection-types.ts
│   ├── 05-union-vs-intersection.ts
│   └── 06-praxis-patterns.ts
├── exercises/                <-- Uebungen mit TODOs
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz-Fragen
├── pretest-data.ts           <-- Pre-Test-Fragen
├── misconceptions.ts         <-- Fehlkonzeption-Exercises
├── completion-problems.ts    <-- Faded Worked Examples
├── debugging-data.ts         <-- Debugging Challenges
├── parsons-data.ts           <-- Parson's Problems
├── tracing-data.ts           <-- Tracing Exercises
├── transfer-data.ts          <-- Transfer Tasks
├── hints.json                <-- Schrittweise Hinweise
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Union Types (`|`)** = "Entweder A oder B" — die Werte-Menge wird groesser.

2. **Intersection Types (`&`)** = "Sowohl A als auch B" — die Werte-Menge
   wird kleiner, aber jeder Wert hat MEHR Properties.

3. **Narrowing** verengt Union Types zurueck: typeof, instanceof, in,
   truthiness, assignment — und eigene Type Predicates.

4. **TS 5.5 Inferred Type Predicates**: `.filter(x => x !== null)` gibt
   automatisch den richtigen Typ — kein manuelles Type Predicate noetig.

5. **Discriminated Unions** mit einem Tag-Property und Exhaustive Check
   sind das maechtigste Pattern fuer Zustaende und Varianten.

6. **assertNever** gibt Compile-Zeit- UND Laufzeit-Schutz. Neue Union-
   Mitglieder erzeugen automatisch Compile-Fehler.

7. **Konflikte** bei `&` fuehren zu `never` (still!), bei `extends`
   zu Compile-Fehlern. extends ist strenger.

8. **Literal Unions** sind meist besser als Enums: kein Laufzeit-Code,
   zusammensetzbar, vollstaendige Type Erasure.

9. **Verteilungsgesetz**: `(A | B) & C = (A & C) | (B & C)`.
   Union und Intersection verhalten sich wie + und * in der Algebra.

10. **Union + Intersection zusammen** ermoeglichen fortgeschrittene
    Patterns: State Machines, Result Types, Event Systems, Command Pattern.

</details>

---

> **Starte hier:** [Sektion 01 - Union Types Grundlagen](./sections/01-union-types-grundlagen.md)
>
> **Naechste Lektion:** 08 - Type Aliases und Mapped Types —
> Wie du eigene Typen definierst und bestehende Typen transformierst.
