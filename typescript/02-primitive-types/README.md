# Lektion 02: Primitive Types in TypeScript

> **Voraussetzung:** Lektion 01 (Setup) abgeschlossen, `tsc` und `tsx` funktionieren.
> **Ziel:** Alle primitiven Typen in TypeScript verstehen und sicher anwenden.
> **Kernfrage dieser Lektion:** Was passiert mit TypeScript-Typen zur Laufzeit — und
> warum ist diese Frage so wichtig?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Das Typsystem im Ueberblick](./sections/01-das-typsystem-ueberblick.md) | ~10 Min | Type Erasure, Typhierarchie, Compilezeit vs Laufzeit |
| 02 | [string, number, boolean](./sections/02-string-number-boolean.md) | ~10 Min | Die drei Basics mit IEEE 754, NaN, Template Literal Types |
| 03 | [null und undefined](./sections/03-null-und-undefined.md) | ~10 Min | Billion Dollar Mistake, strictNullChecks, ?? vs \|\| |
| 04 | [any vs unknown](./sections/04-any-vs-unknown.md) | ~10 Min | Die kritischste Entscheidung: Typsystem an vs aus |
| 05 | [never, void, symbol, bigint](./sections/05-never-void-symbol-bigint.md) | ~10 Min | Die Spezialisten: Exhaustive Checks, einzigartige Keys, grosse Zahlen |
| 06 | [Type Widening](./sections/06-type-widening.md) | ~10 Min | let vs const, Literal Types, as const |

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
02-primitive-types/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-das-typsystem-ueberblick.md
│   ├── 02-string-number-boolean.md
│   ├── 03-null-und-undefined.md
│   ├── 04-any-vs-unknown.md
│   ├── 05-never-void-symbol-bigint.md
│   └── 06-type-widening.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-string-number-boolean.ts
│   ├── 02-null-und-undefined.ts
│   ├── 03-any-vs-unknown.ts
│   ├── 04-never-und-void.ts
│   ├── 05-symbol-und-bigint.ts
│   └── 06-type-widening-und-literal-types.ts
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

1. **Type Erasure**: TypeScript-Typen existieren NUR zur Compilezeit.
   Zur Laufzeit ist alles JavaScript.

2. **Immer Kleinbuchstaben**: `string`, nicht `String`. Die
   Grossbuchstaben-Varianten sind Wrapper-Objekte.

3. **`strict: true` ist Pflicht**: Ohne `strictNullChecks` ist das halbe
   Typsystem wertlos.

4. **`unknown` > `any`**: Immer `unknown` bevorzugen. `any` deaktiviert
   das Typsystem und ist ansteckend.

5. **`null` vs `undefined`**: `undefined` = "nicht gesetzt",
   `null` = "bewusst leer". Sei konsistent.

6. **`never` ist der Bottom Type**: Besonders fuer exhaustive Checks
   in switch-Statements nuetzlich.

7. **`void` ist nicht `undefined`**: `void` = "kein sinnvoller
   Rueckgabewert", `undefined` = konkreter Wert.

8. **Type Widening**: `const` ergibt Literal Types, `let` ergibt
   breitere Typen. Kein Zufall, sondern Design.

9. **Literal Types sind Subtypen**: `"GET"` ist ein Subtyp von `string`.
   Grundlage fuer Union Types.

10. **Die Typhierarchie**: `unknown` (Top) > primitive Typen >
    `never` (Bottom). `any` bricht die Regeln.

</details>

---

> **Starte hier:** [Sektion 01 - Das Typsystem im Ueberblick](./sections/01-das-typsystem-ueberblick.md)
>
> **Naechste Lektion:** 03 - Type Annotations und Type Inference —
> Wann muss man Typen angeben und wann erkennt TypeScript sie selbst?
