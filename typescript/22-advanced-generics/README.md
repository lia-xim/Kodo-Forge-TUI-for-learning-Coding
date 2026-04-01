# Lektion 22: Advanced Generics

> **Voraussetzung:** Lektion 13 (Generics Basics), Lektion 14 (Generic Patterns), Lektion 17 (Conditional Types) abgeschlossen.
> **Ziel:** Generics auf fortgeschrittenem Niveau meistern — Higher-Order Types, Varianz, in/out-Modifier und API-Design.
> **Kernfrage dieser Lektion:** Wie designt man generische Typen, die nicht nur flexibel, sondern auch typsicher und wartbar sind?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Generics Recap & Grenzen](./sections/01-generics-recap-und-grenzen.md) | ~10 Min | Wo L13/L14 aufhoerten, Grenzen einfacher Generics, Motivation fuer Advanced |
| 02 | [Higher-Order Types](./sections/02-higher-order-types.md) | ~10 Min | Typen die Typen als Parameter nehmen, Generic ueber Generic, HKT-Emulation |
| 03 | [Varianz verstehen](./sections/03-varianz-verstehen.md) | ~10 Min | Kovarianz, Kontravarianz, Invarianz, Bivarianz — und warum das wichtig ist |
| 04 | [in/out Modifier](./sections/04-in-out-modifier.md) | ~10 Min | Explizite Varianz-Annotationen (TS 4.7), Performance-Vorteile |
| 05 | [Fortgeschrittene Constraints](./sections/05-fortgeschrittene-constraints.md) | ~10 Min | Intersection-Constraints, Recursive Constraints, distributives Verhalten |
| 06 | [Generische APIs designen](./sections/06-generische-apis-designen.md) | ~10 Min | API-Design-Prinzipien, Overloads vs Generics, Inference-Heuristiken |

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
22-advanced-generics/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-generics-recap-und-grenzen.md
│   ├── 02-higher-order-types.md
│   ├── 03-varianz-verstehen.md
│   ├── 04-in-out-modifier.md
│   ├── 05-fortgeschrittene-constraints.md
│   └── 06-generische-apis-designen.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-generics-grenzen.ts
│   ├── 02-higher-order-types.ts
│   ├── 03-varianz-demo.ts
│   ├── 04-in-out-modifier.ts
│   ├── 05-advanced-constraints.ts
│   └── 06-api-design.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-generic-container.ts
│   ├── 02-hkt-emulation.ts
│   ├── 03-varianz-pruefung.ts
│   ├── 04-variance-annotationen.ts
│   ├── 05-multi-constraint.ts
│   └── 06-api-redesign.ts
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 Quiz-Fragen
├── pretest-data.ts           <-- 18 Pre-Test-Fragen (3 pro Sektion)
├── misconceptions.ts         <-- 8 haeufige Fehlvorstellungen
├── completion-problems.ts    <-- 6 Lueckentext-Aufgaben
├── debugging-data.ts         <-- 5 Debugging-Challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 Code-Tracing-Uebungen
├── transfer-data.ts          <-- 3 Transfer-Tasks
├── hints.json                <-- Progressive Hinweise fuer alle Uebungen
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Einfache Generics reichen oft nicht:** Sobald du Typen brauchst, die
   selbst generisch sind (wie "irgendein Container"), stossen einfache
   Typparameter an ihre Grenzen.

2. **Higher-Order Types** emulieren Higher-Kinded Types: TypeScript hat
   kein natives HKT, aber mit Interface-Maps und Conditional Types kann
   man das Muster nachbilden.

3. **Kovarianz** (out-Position): Wenn `Cat extends Animal`, dann
   `Producer<Cat> extends Producer<Animal>`. Die Subtyprichtung bleibt.

4. **Kontravarianz** (in-Position): Wenn `Cat extends Animal`, dann
   `Consumer<Animal> extends Consumer<Cat>`. Die Subtyprichtung kehrt sich um.

5. **Invarianz** bedeutet: Weder Kovarianz noch Kontravarianz. Ein
   `Array<Cat>` ist KEIN `Array<Animal>` wenn du schreiben kannst.

6. **`in`/`out`-Modifier (TS 4.7)** machen Varianz explizit: `out T` fuer
   Kovarianz, `in T` fuer Kontravarianz. Sie verbessern auch Performance.

7. **Intersection-Constraints** (`T extends A & B`) sind maechtig: Du
   kannst mehrere Anforderungen in einem Constraint kombinieren.

8. **Distributive Conditional Types** verteilen sich ueber Unions — aber
   nur wenn T ein "nackter" Typparameter ist. `[T] extends [U]` verhindert das.

9. **Generics sind ein Werkzeug, kein Ziel:** Manchmal sind Overloads oder
   einfache Unions die bessere Wahl. Weniger abstrakt = lesbarer.

10. **Inference ist fragil:** TypeScript kann nur inferieren was es sehen
    kann. Gute API-Designer lenken die Inference bewusst.

</details>

---

> **Starte hier:** [Sektion 01 - Generics Recap & Grenzen](./sections/01-generics-recap-und-grenzen.md)
>
> **Naechste Lektion:** 23 - Recursive Types —
> Typen die sich selbst referenzieren: JSON, Tree-Strukturen und tiefe Verschachtelung.
