# Lektion 12: Discriminated Unions

> **Voraussetzung:** Lektion 11 (Type Narrowing) abgeschlossen, Union Types und Literal Types bekannt.
> **Ziel:** Discriminated Unions verstehen, anwenden und als zentrales Modellierungswerkzeug nutzen.
> **Kernfrage dieser Lektion:** Wie modelliere ich komplexe Zustaende so, dass unmoegliche Zustaende vom Compiler verhindert werden?
> **Gesamtdauer:** ~50 Minuten (5 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **fuenf Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Tagged Unions](./sections/01-tagged-unions.md) | ~10 Min | Was sind Discriminated Unions? Das Tag-Property, String Literal als Diskriminator |
| 02 | [Pattern Matching](./sections/02-pattern-matching.md) | ~10 Min | switch/case mit Exhaustive Check, if/else Ketten, Narrowing durch Diskriminator |
| 03 | [Algebraische Datentypen](./sections/03-algebraische-datentypen.md) | ~10 Min | ADTs in TypeScript, Option/Result Typen, Hintergrund: Haskell/Rust |
| 04 | [Zustandsmodellierung](./sections/04-zustandsmodellierung.md) | ~10 Min | State Machines als Typen, React State, Angular State, Loading/Error/Success |
| 05 | [Praxis-Patterns](./sections/05-praxis-patterns.md) | ~10 Min | API Responses, Action Types (Redux/NgRx), Event Systems, Error-Hierarchien |

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
12-discriminated-unions/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-tagged-unions.md
│   ├── 02-pattern-matching.md
│   ├── 03-algebraische-datentypen.md
│   ├── 04-zustandsmodellierung.md
│   └── 05-praxis-patterns.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-tagged-unions.ts
│   ├── 02-pattern-matching.ts
│   ├── 03-option-result.ts
│   ├── 04-state-modeling.ts
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

1. **Drei Zutaten:** Tag-Property mit Literal Type + Union Type + Narrowing
   = Discriminated Union.

2. **Der Diskriminator** muss ein String, Number oder Boolean Literal sein.
   Best Practice: String Literals verwenden.

3. **switch/case ist der natuerliche Partner:** Jeder case-Branch narrowt
   den Typ automatisch. Zusammen mit dem Exhaustive Check unschlagbar.

4. **assertNever im default-Branch** deckt fehlende Faelle zur Compile-Zeit
   auf. Unverzichtbar in grossen Codebasen.

5. **Discriminated Unions sind Sum Types** aus der funktionalen
   Programmierung (Haskell, ML, Rust). TypeScript braucht keine neue
   Syntax dafuer.

6. **Option\<T\> und Result\<T, E\>** sind die zwei wichtigsten ADT-Patterns.
   Sie ersetzen null und try/catch typsicher.

7. **"Make impossible states impossible."** Discriminated Unions statt
   Booleans eliminieren unmoegliche Zustaende.

8. **AsyncState\<T\>** (Loading/Error/Success) ist das Standard-Pattern
   fuer async Daten — framework-agnostisch.

9. **Action Types** in Redux/NgRx sind Discriminated Unions mit dem
   Diskriminator `type`. Jede Action hat eine eigene Payload.

10. **Extract und Exclude** extrahieren oder schliessen einzelne
    Varianten aus einer Discriminated Union aus.

</details>

---

> **Starte hier:** [Sektion 01 - Tagged Unions](./sections/01-tagged-unions.md)
>
> **Naechste Lektion:** 13 — (wird noch definiert)
