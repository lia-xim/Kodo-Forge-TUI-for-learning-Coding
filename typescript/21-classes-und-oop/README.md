# Lektion 21: Classes & OOP in TypeScript

> **Voraussetzung:** Lektion 02 (Primitive Types / Type Erasure), Lektion 13-14 (Generics).
> **Ziel:** Klassen, Vererbung, Abstract Classes, Interfaces und OOP-Patterns in TypeScript
> meistern — und wissen, wann man Klassen vs. Funktionen verwendet.
> **Kernfrage dieser Lektion:** Was bleibt von TypeScript-Klassen zur Laufzeit uebrig —
> und was verschwindet?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Klassen-Grundlagen](./sections/01-klassen-grundlagen.md) | ~10 Min | class-Syntax, Constructor, Felder, Methoden, this-Kontext, Structural Typing |
| 02 | [Access Modifiers](./sections/02-access-modifiers.md) | ~10 Min | public, private, protected, readonly, #private (ES2022), Getter/Setter |
| 03 | [Vererbung und Abstract Classes](./sections/03-vererbung-und-abstract.md) | ~10 Min | extends, super(), abstract, override, Method Overriding |
| 04 | [Interfaces implementieren](./sections/04-interfaces-implementieren.md) | ~10 Min | implements, Structural vs Nominal Typing, generische Interfaces |
| 05 | [Static Members und Patterns](./sections/05-static-und-patterns.md) | ~10 Min | static, Parameter Properties, Singleton, Factory, Constructor Types |
| 06 | [Klassen in der Praxis](./sections/06-klassen-in-der-praxis.md) | ~10 Min | Klasse vs Funktion, Composition, Mixins, this-Binding-Loesungen |

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
21-classes-und-oop/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-klassen-grundlagen.md
│   ├── 02-access-modifiers.md
│   ├── 03-vererbung-und-abstract.md
│   ├── 04-interfaces-implementieren.md
│   ├── 05-static-und-patterns.md
│   └── 06-klassen-in-der-praxis.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-klassen-grundlagen.ts
│   ├── 02-access-modifiers.ts
│   ├── 03-vererbung-abstract.ts
│   ├── 04-implements-interfaces.ts
│   ├── 05-static-factory.ts
│   └── 06-komposition-vs-vererbung.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-vehicle-hierarchy.ts
│   ├── 02-access-control.ts
│   ├── 03-interface-implementierung.ts
│   ├── 04-static-registry.ts
│   ├── 05-mixin-pattern.ts
│   └── 06-refactoring-challenge.ts
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 Quiz-Fragen
├── pretest-data.ts           <-- 18 Pre-Test-Fragen
├── misconceptions.ts         <-- 8 Fehlkonzeptionen
├── completion-problems.ts    <-- 6 Completion-Problems
├── debugging-data.ts         <-- 5 Debugging-Challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 Tracing-Exercises
├── transfer-data.ts          <-- 3 Transfer-Tasks
├── hints.json                <-- Progressive Hints fuer alle Exercises
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Exercises

| # | Exercise | Konzept | Schwierigkeit |
|---|---|---|---|
| 01 | Vehicle Hierarchy | Vererbung, extends, super, override | Mittel |
| 02 | Access Control | private, #private, readonly, Getter/Setter | Mittel |
| 03 | Interface-Implementierung | implements, Generics, Structural Typing | Mittel |
| 04 | Static Registry | static, Factory-Pattern, private Constructor | Mittel-Schwer |
| 05 | Mixin Pattern | Mixins, Constructor Type, Composition | Schwer |
| 06 | Refactoring Challenge | Composition over Inheritance, Strategy | Schwer |

---

> **Starte hier:** [Sektion 01 - Klassen-Grundlagen](./sections/01-klassen-grundlagen.md)
>
> **Naechste Lektion:** 22 - Advanced Generics —
> Generics vertiefen: Constraints, Conditional Types mit Generics, infer.
