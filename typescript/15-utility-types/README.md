# Lektion 15: Utility Types

> **Voraussetzung:** Lektion 13-14 (Generics) abgeschlossen.
> **Ziel:** TypeScripts eingebaute Utility Types sicher beherrschen, eigene bauen und gezielt kombinieren.
> **Kernfrage dieser Lektion:** Wie transformiere ich bestehende Typen, statt sie manuell neu zu schreiben?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Partial, Required, Readonly](./sections/01-partial-required-readonly.md) | ~10 Min | Die drei "Modifier"-Utility-Types, wann welchen |
| 02 | [Pick, Omit, Record](./sections/02-pick-omit-record.md) | ~10 Min | Objekt-Transformation, Record\<K,V\> als Dictionary, StrictOmit |
| 03 | [Extract, Exclude, NonNullable](./sections/03-extract-exclude-nonnullable.md) | ~10 Min | Union-Type-Manipulation, Filterung von Typen |
| 04 | [ReturnType, Parameters, Awaited](./sections/04-returntype-parameters-awaited.md) | ~10 Min | Funktions-bezogene Utility Types, Awaited\<Promise\<T\>\> |
| 05 | [Eigene Utility Types](./sections/05-eigene-utility-types.md) | ~10 Min | DeepPartial, DeepReadonly, Mutable, RequiredKeys bauen |
| 06 | [Utility Types kombinieren](./sections/06-utility-types-kombinieren.md) | ~10 Min | Composition: Pick + Partial, Omit + Required, Patterns fuer Forms/APIs |

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
15-utility-types/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-partial-required-readonly.md
│   ├── 02-pick-omit-record.md
│   ├── 03-extract-exclude-nonnullable.md
│   ├── 04-returntype-parameters-awaited.md
│   ├── 05-eigene-utility-types.md
│   └── 06-utility-types-kombinieren.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-partial-required-readonly.ts
│   ├── 02-pick-omit-record.ts
│   ├── 03-extract-exclude-nonnullable.ts
│   ├── 04-returntype-parameters-awaited.ts
│   ├── 05-eigene-utility-types.ts
│   └── 06-utility-types-kombinieren.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-partial-required-readonly.ts
│   ├── 02-pick-omit-record.ts
│   ├── 03-extract-exclude-nonnullable.ts
│   ├── 04-returntype-parameters-awaited.ts
│   ├── 05-eigene-utility-types.ts
│   └── 06-utility-types-kombinieren.ts
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz-Fragen + Elaborated Feedback
├── pretest-data.ts           <-- Pre-Test pro Sektion
├── misconceptions.ts         <-- Fehlkonzeptionen
├── completion-problems.ts    <-- Code-Luecken
├── debugging-data.ts         <-- Debugging-Challenges
├── parsons-data.ts           <-- Parsons Problems
├── tracing-data.ts           <-- Code-Tracing
├── transfer-data.ts          <-- Transfer-Aufgaben
├── hints.json                <-- Gestufte Hinweise
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Utility Types transformieren bestehende Typen**: Statt Typen manuell
   zu duplizieren, leitest du neue Typen aus existierenden ab.

2. **Partial\<T\> macht alle Properties optional**: Ideal fuer Update-Operationen
   wo nur geaenderte Felder gesendet werden.

3. **Required\<T\> ist das Gegenteil von Partial**: Macht alle optionalen
   Properties zu Pflichtfeldern — nützlich fuer validierte Daten.

4. **Readonly\<T\> schuetzt vor Mutation**: Aber nur shallow — fuer tiefe
   Unveraenderlichkeit braucht man DeepReadonly.

5. **Pick und Omit selektieren Properties**: Pick waehlt aus, Omit schliesst
   aus. Omit ist NICHT typsicher — es akzeptiert beliebige Strings.

6. **Record\<K,V\> ersetzt Index Signatures**: Typsicherer als
   `{ [key: string]: V }` und erzwingt bestimmte Keys.

7. **Extract und Exclude filtern Union Types**: Extract behaelt Mitglieder,
   Exclude entfernt sie. Beide nutzen Conditional Types intern.

8. **ReturnType und Parameters extrahieren Funktions-Signaturen**:
   Unverzichtbar wenn du den Typ einer Funktion nutzen willst,
   ohne ihn separat zu definieren.

9. **Awaited\<T\> entpackt Promises rekursiv**: Seit TypeScript 4.5 — kein
   manuelles `T extends Promise<infer U>` mehr noetig.

10. **Composition ist der Schluessel**: Die wahre Kraft liegt im Kombinieren:
    `Pick<T, K> & Partial<Omit<T, K>>` — bestimmte Felder required,
    Rest optional. Das ist das Pattern fuer Forms und APIs.

</details>

---

> **Starte hier:** [Sektion 01 - Partial, Required, Readonly](./sections/01-partial-required-readonly.md)
>
> **Naechste Lektion:** 16 — Mapped Types & Conditional Types —
> Wie du das Type-System als vollstaendige Programmiersprache nutzt.
