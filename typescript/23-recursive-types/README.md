# Lektion 23: Recursive Types in TypeScript

> **Voraussetzung:** Lektionen 13-18 (Generics, Utility Types, Mapped Types, Conditional Types, Template Literals) und L21-L22 (Classes, Advanced Generics).
> **Ziel:** Rekursive Typen verstehen und sicher anwenden — von LinkedList ueber DeepPartial bis zu typsicheren Pfaden.
> **Kernfrage dieser Lektion:** Wie modelliert man Datenstrukturen mit beliebiger Verschachtelungstiefe, und wo sind die Grenzen?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Was sind rekursive Typen?](./sections/01-was-sind-rekursive-typen.md) | ~10 Min | Selbstreferenz, LinkedList, Tree, Abbruchbedingungen |
| 02 | [Baumstrukturen typen](./sections/02-baumstrukturen-typen.md) | ~10 Min | JSON-Typ, DOM, ASTs, verschachtelte Menues |
| 03 | [Deep-Operationen](./sections/03-deep-operationen.md) | ~10 Min | DeepPartial, DeepReadonly, DeepRequired, Array-Handling |
| 04 | [Rekursive Conditional Types](./sections/04-rekursive-conditional-types.md) | ~10 Min | Flatten, Paths, PathValue, String-Manipulation |
| 05 | [Grenzen und Performance](./sections/05-grenzen-und-performance.md) | ~10 Min | Rekursionslimit, Tail Recursion, Tuple-Arithmetik |
| 06 | [Praxis-Patterns](./sections/06-praxis-patterns.md) | ~10 Min | Zod, Prisma, deep-get, Router-Typen |

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
23-recursive-types/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-was-sind-rekursive-typen.md
│   ├── 02-baumstrukturen-typen.md
│   ├── 03-deep-operationen.md
│   ├── 04-rekursive-conditional-types.md
│   ├── 05-grenzen-und-performance.md
│   └── 06-praxis-patterns.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-linked-list-tree.ts
│   ├── 02-json-typ.ts
│   ├── 03-deep-operations.ts
│   ├── 04-paths-and-values.ts
│   ├── 05-recursion-limits.ts
│   └── 06-praxis-deep-get.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-linked-list.ts
│   ├── 02-json-validator.ts
│   ├── 03-deep-partial.ts
│   ├── 04-flatten-type.ts
│   ├── 05-type-safe-paths.ts
│   └── 06-recursive-tree-ops.ts
├── solutions/                <-- Loesungen zu den Uebungen
│   ├── 01-linked-list.ts
│   ├── 02-json-validator.ts
│   ├── 03-deep-partial.ts
│   ├── 04-flatten-type.ts
│   ├── 05-type-safe-paths.ts
│   └── 06-recursive-tree-ops.ts
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 Fragen mit elaboriertem Feedback
├── pretest-data.ts           <-- 18 Pre-Test-Fragen (3 pro Sektion)
├── misconceptions.ts         <-- 8 haeufige Fehlkonzeptionen
├── completion-problems.ts    <-- 6 Lueckentext-Aufgaben
├── debugging-data.ts         <-- 5 Debugging-Challenges
├── parsons-data.ts           <-- 4 Code-Ordnungs-Probleme
├── tracing-data.ts           <-- 4 Code-Tracing-Uebungen
├── transfer-data.ts          <-- 3 Transfer-Aufgaben
├── hints.json                <-- Progressive Hinweise fuer Exercises
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Rekursive Typen** referenzieren sich selbst in ihrer Definition
   und brauchen eine Abbruchbedingung (| null, [], never).

2. **JSON ist per Definition rekursiv** — der wichtigste rekursive
   Typ den du taeglich verwendest.

3. **DeepPartial/DeepReadonly** kombinieren Mapped Types mit
   Rekursion. Arrays brauchen Sonderbehandlung.

4. **Paths\<T\>** berechnet alle Punkt-getrennten Pfade eines Objekts.
   React Hook Form nutzt exakt dieses Pattern.

5. **PathValue\<T, P\>** ermittelt den Typ des Wertes an einem Pfad.
   Template Literal Types + Rekursion machen das moeglich.

6. **Rekursionslimit** ist ~50 Ebenen (Standard) oder ~1000 (mit
   Tail Recursion Optimization seit TS 4.5).

7. **Tail Recursion** greift wenn der rekursive Aufruf in
   Tail-Position steht (letzter Ausdruck im Conditional-Zweig).

8. **Tuple-Laenge** ist der einzige Weg fuer Type-Level-Arithmetik.

9. **Distributive Conditional Types + Rekursion** fuehrt zu
   exponentiellem Wachstum. Mapped Types sind linear.

10. **Die Faustregel:** Rekursive Typen fuer natuerlich rekursive
    Daten (JSON, Baeume). Nicht fuer alles was man auf Type-Level
    "berechnen koennte".

</details>

---

> **Starte hier:** [Sektion 01 - Was sind rekursive Typen?](./sections/01-was-sind-rekursive-typen.md)
>
> **Naechste Lektion:** 24 - Type-Level Programming —
> String-Parser, State Machines und vollstaendige Programme auf Type-Level.
