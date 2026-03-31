# Lektion 14: Generic Patterns

> **Voraussetzung:** Lektion 13 (Generics Basics) abgeschlossen.
> **Ziel:** Fortgeschrittene Generic-Muster sicher beherrschen — von Factory Functions ueber typsichere Collections bis zu realen Architektur-Patterns.
> **Kernfrage dieser Lektion:** Wie nutze ich Generics, um wiederverwendbare, typsichere Abstraktionen zu bauen, die in echten Projekten funktionieren?
> **Gesamtdauer:** ~50 Minuten (5 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **fuenf Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Generic Factories](./sections/01-generic-factories.md) | ~10 Min | Factory Functions, createInstance\<T\>, Builder Pattern |
| 02 | [Generic Collections](./sections/02-generic-collections.md) | ~10 Min | Stack\<T\>, Queue\<T\>, LinkedList\<T\>, typsichere Container |
| 03 | [Generic Higher-Order Functions](./sections/03-generic-hof.md) | ~10 Min | pipe(), compose(), generische map/filter/reduce |
| 04 | [Advanced Constraints](./sections/04-generic-constraints-advanced.md) | ~10 Min | Conditional Constraints, Recursive Constraints, const Type Parameters |
| 05 | [Real-World Generics](./sections/05-real-world-generics.md) | ~10 Min | API Client\<T\>, Repository Pattern, Event Emitter, DI Container |

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
14-generic-patterns/
+-- README.md                 <-- Du bist hier (Uebersicht + Navigation)
+-- sections/
|   +-- 01-generic-factories.md
|   +-- 02-generic-collections.md
|   +-- 03-generic-hof.md
|   +-- 04-generic-constraints-advanced.md
|   +-- 05-real-world-generics.md
+-- examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
|   +-- 01-generic-factories.ts
|   +-- 02-generic-collections.ts
|   +-- 03-generic-hof.ts
|   +-- 04-advanced-constraints.ts
|   +-- 05-real-world-generics.ts
+-- exercises/                <-- Uebungen mit TODOs
+-- solutions/                <-- Loesungen zu den Uebungen
+-- quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
+-- cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Generic Factories zentralisieren Objekterstellung**: `createInstance<T>`
   trennt Erstellung von Verwendung — der Aufrufer bestimmt den Typ.

2. **Das Builder Pattern profitiert enorm von Generics**: Fluent APIs mit
   `Builder<T>` geben bei jedem `.set()` den korrekten, erweiterten Typ zurueck.

3. **Typsichere Collections verhindern Laufzeitfehler**: `Stack<T>` und
   `Queue<T>` garantieren, dass nur der richtige Typ rein- und rausgeht.

4. **pipe() und compose() sind das Herzstueck funktionaler Programmierung**:
   Mit Generics pruefen sie die Typen zwischen jedem Schritt der Kette.

5. **Conditional Constraints ermoeglichen kontextabhaengige Typen**:
   `T extends string ? X : Y` auf Constraint-Ebene ist maechtiger als
   einfache `extends`-Checks.

6. **Recursive Constraints beschreiben baumartige Strukturen**: Typen
   wie `TreeNode<T>` oder `DeepPartial<T>` referenzieren sich selbst.

7. **const Type Parameters (TS 5.0) erzwingen Literal-Inferenz**:
   `<const T>` verhindert Widening ohne dass der Aufrufer `as const` schreiben muss.

8. **Der Repository-Pattern mit Generics ist DAS Backend-Pattern**:
   `Repository<T>` definiert CRUD einmal, typisiert fuer jede Entity.

9. **Typsichere Event Emitter verhindern falsche Event-Daten**:
   `EventEmitter<Events>` validiert Event-Namen UND Payload-Typen.

10. **DI Container mit Generics sind die Basis moderner Frameworks**:
    `Container.resolve<T>()` liefert den korrekten Typ ohne Casts.

</details>

---

> **Starte hier:** [Sektion 01 - Generic Factories](./sections/01-generic-factories.md)
>
> **Naechste Lektion:** 15 — Utility Types Deep Dive —
> Wie du mit Pick, Omit, Record und eigenen Utility Types arbeitest.
