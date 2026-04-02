# Lektion 25: Type-safe Error Handling

> **Voraussetzung:** L12 (Discriminated Unions) + L24 (Branded Types)
> **Ziel:** Fehler als Typen modellieren statt als Exceptions — fuer compile-time sichere Fehlerbehandlung.
> **Kernfrage dieser Lektion:** Wie modelliert man Fehler als Typen statt als Exceptions?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Das Exception-Problem](./sections/01-das-exception-problem.md) | ~10 Min | Warum throw unsichtbare Abhaengigkeiten erzeugt, erwartete vs unerwartete Fehler |
| 02 | [Das Result-Pattern](./sections/02-das-result-pattern.md) | ~10 Min | Result<T,E> als Discriminated Union, ok/err Helfer, mapResult |
| 03 | [Option/Maybe Pattern](./sections/03-option-maybe-pattern.md) | ~10 Min | T \| null als Option, fromNullable, mapMaybe, getOrElse |
| 04 | [Exhaustive Error Handling](./sections/04-exhaustive-error-handling.md) | ~10 Min | assertNever, satisfies Record, Switch-Exhaustivitaet |
| 05 | [Error-Typen Patterns](./sections/05-error-typen-patterns.md) | ~10 Min | Union-Typen fuer Fehler, Fehler-Hierarchien, Error-Konvertierung |
| 06 | [Error Handling Praxis](./sections/06-error-handling-praxis.md) | ~10 Min | Angular/React Integration, fetch-Wrapper, wann throw vs Result |

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
25-type-safe-error-handling/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-das-exception-problem.md
│   ├── 02-das-result-pattern.md
│   ├── 03-option-maybe-pattern.md
│   ├── 04-exhaustive-error-handling.md
│   ├── 05-error-typen-patterns.md
│   └── 06-error-handling-praxis.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-exception-problem.ts
│   ├── 02-result-pattern.ts
│   ├── 03-option-maybe.ts
│   ├── 04-exhaustive.ts
│   └── 05-error-types.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-result-implementieren.ts
│   ├── 02-exhaustive-handling.ts
│   ├── 03-option-chaining.ts
│   ├── 04-error-conversion.ts
│   └── 05-fetch-wrapper.ts
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- 15 Quiz-Fragen mit elaboriertem Feedback
├── pretest-data.ts           <-- Pre-Test (18 Fragen, 3 pro Sektion)
├── misconceptions.ts         <-- 8 haeufige Fehlkonzepte
├── completion-problems.ts    <-- 6 Lueckentexte
├── debugging-data.ts         <-- 5 Debugging Challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 Code-Tracing Exercises
├── transfer-data.ts          <-- 3 Transfer Tasks
├── hints.json                <-- Progressive Hints fuer Exercises
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **throw luegt im Typsystem**: `function parseUser(): User` verspricht
   immer ein User. Wenn sie wirft, haelt sie das Versprechen nicht.

2. **Result<T, E> macht Fehler sichtbar**: Der Rueckgabetyp ZWINGT
   den Caller zur Fehlerbehandlung — Compile-Time statt Runtime.

3. **Discriminant ok: true/false**: Der Schluessel zu TypeScript-Narrowing.
   `as const` oder Helper-Funktionen fuer Literal-Typen verwenden.

4. **Option vs Result**: null = normales Fehlen (findUser).
   Result = Fehler mit Details (createUser).

5. **assertNever erzwingt Exhaustivitaet**: Im default-Branch:
   Wenn ein Union-Case fehlt, gibt es einen Compile-Error.

6. **satisfies Record<K, V>**: Prueft Vollstaendigkeit UND
   behaelt spezifische Literal-Typen.

7. **Error-Konvertierung zwischen Schichten**: DB-Fehler → Domain-Fehler
   → HTTP-Fehler. Jede Schicht spricht ihre eigene Sprache.

8. **throw bleibt fuer Bugs**: Invariant-Verletzungen, fehlende Env-Vars,
   unrecoverable States — dafuer ist throw richtig.

9. **mapResult/flatMapResult**: Funktionale Komposition statt
   verschachtelte if-Bloecke.

10. **strictNullChecks = eingebautes Option-System**: Mit strict: true
    erzwingt TypeScript bereits explizite null-Behandlung.

</details>

---

> **Starte hier:** [Sektion 01 - Das Exception-Problem](./sections/01-das-exception-problem.md)
>
> **Naechste Lektion:** 26 — Noch nicht verfuegbar
