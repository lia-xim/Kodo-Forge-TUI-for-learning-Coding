# Lektion 11: Type Narrowing

> **Voraussetzung:** Phase 1 (Lektionen 01-10) abgeschlossen. Du kennst Union Types,
> Interfaces, Literal Types und die Grundlagen des Typsystems.
> **Ziel:** TypeScript's Type Narrowing vollstaendig verstehen und sicher anwenden —
> vom einfachen typeof-Check bis zu Custom Type Guards und Exhaustive Checks.
> **Kernfrage dieser Lektion:** Wie "beweist" du dem TypeScript-Compiler, welchen
> konkreten Typ ein Wert hat — und warum ist das die wichtigste Faehigkeit in Phase 2?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Willkommen in Phase 2: Type System Core

Diese Lektion ist die **erste Lektion von Phase 2**. In Phase 1 hast du die
Grundlagen gelernt — jetzt geht es ans Eingemachte. Type Narrowing ist das
Herzstu eck von TypeScript: Es ist der Mechanismus, durch den das Typsystem
**nuetzlich** wird, nicht nur dekorativ.

Ohne Narrowing waeren Union Types wie `string | number` nutzlos — du koenntest
nichts Sinnvolles damit machen. Narrowing ist der Beweis, den du dem Compiler
lieferst, damit er dir vertraut.

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Was ist Narrowing?](./sections/01-was-ist-narrowing.md) | ~10 Min | Grundkonzept, Control Flow Analysis, warum TS Narrowing braucht |
| 02 | [typeof Guards](./sections/02-typeof-guards.md) | ~10 Min | typeof-Operator, was er narrowt, Fallstricke (typeof null) |
| 03 | [instanceof und in](./sections/03-instanceof-und-in.md) | ~10 Min | instanceof fuer Klassen, in-Operator fuer Properties |
| 04 | [Equality und Truthiness](./sections/04-equality-und-truthiness.md) | ~10 Min | ===, !==, ==, !=, Truthiness Narrowing, Nullish Narrowing |
| 05 | [Type Predicates](./sections/05-type-predicates.md) | ~10 Min | Custom Type Guards (is), Assertion Functions, TS 5.5 Inferred Predicates |
| 06 | [Exhaustive Checks](./sections/06-exhaustive-checks.md) | ~10 Min | never als Sicherheitsnetz, exhaustive switch/if, assertNever |

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
11-type-narrowing/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-was-ist-narrowing.md
│   ├── 02-typeof-guards.md
│   ├── 03-instanceof-und-in.md
│   ├── 04-equality-und-truthiness.md
│   ├── 05-type-predicates.md
│   └── 06-exhaustive-checks.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-narrowing-basics.ts
│   ├── 02-typeof-guards.ts
│   ├── 03-instanceof-und-in.ts
│   ├── 04-equality-und-truthiness.ts
│   ├── 05-type-predicates.ts
│   └── 06-exhaustive-checks.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-narrowing-basics.ts
│   ├── 02-typeof-guards.ts
│   ├── 03-instanceof-und-in.ts
│   ├── 04-equality-und-truthiness.ts
│   ├── 05-type-predicates.ts
│   └── 06-exhaustive-checks.ts
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz-data.ts              <-- 15 Fragen + elaboratedFeedback
├── quiz.ts                   <-- Quiz starten (npx tsx quiz.ts)
├── pretest-data.ts           <-- Pre-Test (3 Fragen pro Sektion)
├── misconceptions.ts         <-- 8 haeufige Fehlkonzeptionen
├── completion-problems.ts    <-- 6 Luecken-Uebungen
├── debugging-data.ts         <-- 5 Debugging Challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 Code-Tracing Exercises
├── transfer-data.ts          <-- 3 Transfer Tasks
├── hints.json                <-- Progressive Hints
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Control Flow Analysis**: TypeScript analysiert deinen Code-Fluss und
   verengt Typen automatisch nach Checks — das ist Type Narrowing.

2. **typeof ist dein Grundwerkzeug**: `typeof x === "string"` narrowt x
   zu string. Aber Vorsicht: `typeof null === "object"` ist ein Fallstrick.

3. **instanceof fuer Klassen**: `x instanceof Date` funktioniert nur mit
   Klassen (Laufzeit-Konstrukten), nicht mit Interfaces oder Type Aliases.

4. **in-Operator fuer Properties**: `"name" in obj` narrowt auf Typen die
   eine `name`-Property haben — ideal fuer Discriminated Unions.

5. **Equality narrowt beide Seiten**: `if (a === b)` narrowt BEIDE Variablen
   auf den gemeinsamen Typ.

6. **Truthiness eliminiert null/undefined**: `if (x)` schliesst null,
   undefined, 0, "" und false aus — Vorsicht bei 0 und ""!

7. **Custom Type Guards**: `function isString(x: unknown): x is string`
   gibt dir volle Kontrolle ueber das Narrowing.

8. **TS 5.5 Inferred Type Predicates**: `arr.filter(x => x !== null)` narrowt
   jetzt automatisch den Array-Typ — kein manueller Type Guard mehr noetig.

9. **assertNever fuer Exhaustive Checks**: Der never-Typ stellt sicher, dass
   alle Faelle eines Union Types behandelt werden.

10. **Narrowing ist kumulativ**: Jeder Check verengt den Typ weiter. TypeScript
    vergisst nichts — es baut auf vorherigen Checks auf.

</details>

---

> **Starte hier:** [Sektion 01 - Was ist Narrowing?](./sections/01-was-ist-narrowing.md)
>
> **Naechste Lektion:** 12 - Generics — Wie schreibst du Funktionen und Typen,
> die mit JEDEM Typ funktionieren, ohne die Typsicherheit zu verlieren?
