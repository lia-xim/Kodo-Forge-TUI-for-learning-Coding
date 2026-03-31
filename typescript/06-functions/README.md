# Lektion 06: Functions in TypeScript

> **Voraussetzung:** Lektion 05 (Objects und Interfaces) abgeschlossen.
> **Ziel:** Funktionen in TypeScript vollstaendig verstehen — von einfachen
> Typisierungen ueber Overloads bis hin zu fortgeschrittenen Patterns.
> **Kernfrage dieser Lektion:** Wie beschreibt man das Verhalten einer Funktion
> praezise auf Typ-Ebene — und warum ist das der Schluessel zu sicherem Code?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Funktionstypen Basics](./sections/01-funktionstypen-basics.md) | ~10 Min | Parameter-Typen, Return-Typen, Arrow Functions, `void` |
| 02 | [Optionale und Default-Parameter](./sections/02-optionale-und-default-parameter.md) | ~10 Min | `?`-Parameter, Default-Werte, Rest-Parameter, Destructuring |
| 03 | [Function Overloads](./sections/03-function-overloads.md) | ~10 Min | Overload-Signaturen, Implementation Signature, Wann Overloads sinnvoll sind |
| 04 | [Callback-Typen](./sections/04-callback-typen.md) | ~10 Min | Callback-Typisierung, `void`-Callbacks, Generische Callbacks |
| 05 | [Der this-Parameter](./sections/05-this-parameter.md) | ~10 Min | `this`-Typ in Funktionen, `ThisParameterType`, Methoden-Binding |
| 06 | [Funktions-Patterns](./sections/06-funktions-patterns.md) | ~10 Min | Type Guards, Assertion Functions, Constructor Signatures, Factories |

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
06-functions/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-funktionstypen-basics.md
│   ├── 02-optionale-und-default-parameter.md
│   ├── 03-function-overloads.md
│   ├── 04-callback-typen.md
│   ├── 05-this-parameter.md
│   └── 06-funktions-patterns.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-funktionstypen-basics.ts
│   ├── 02-optionale-und-default-parameter.ts
│   ├── 03-function-overloads.ts
│   ├── 04-callback-typen.ts
│   └── 05-funktions-patterns.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-parameter-und-return-typen.ts
│   ├── 02-overloads-und-callbacks.ts
│   ├── 03-type-guards-und-assertions.ts
│   ├── 04-praxis-szenarien.ts
│   └── 05-predict-the-output.ts
├── solutions/                <-- Loesungen zu den Uebungen
│   ├── 01-parameter-und-return-typen.ts
│   ├── 02-overloads-und-callbacks.ts
│   ├── 03-type-guards-und-assertions.ts
│   ├── 04-praxis-szenarien.ts
│   └── 05-predict-the-output.ts
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz-Fragen
├── pretest-data.ts           <-- Vorab-Fragen pro Sektion
├── misconceptions.ts         <-- Haeufige Fehlkonzeptionen
├── completion-problems.ts    <-- Luecken-Uebungen
├── debugging-data.ts         <-- Debugging Challenges
├── parsons-data.ts           <-- Parsons Problems
├── tracing-data.ts           <-- Code-Tracing Exercises
├── transfer-data.ts          <-- Transfer Tasks
├── hints.json                <-- Progressive Hints
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Funktionstypen sind Vertraege**: Parameter-Typen und Return-Typ
   definieren einen Vertrag, den jeder Aufrufer einhalten muss.

2. **Return-Typ inferieren lassen — mit Ausnahmen**: TypeScript inferiert
   den Return-Typ oft korrekt. Bei oeffentlichen APIs explizit angeben.

3. **Optionale Parameter kommen zuletzt**: `?`-Parameter muessen nach
   allen Pflicht-Parametern stehen. Default-Werte machen `?` ueberfluessig.

4. **Rest-Parameter sind typsichere varargs**: `...args: number[]` statt
   dem unsicheren `arguments`-Objekt verwenden.

5. **Overloads sind ein Praezisions-Werkzeug**: Sie beschreiben mehrere
   Aufruf-Varianten — die Implementation muss ALLE abdecken.

6. **void-Callbacks duerfen Werte zurueckgeben**: Das erklaert warum
   `arr.forEach(v => arr.push(v))` funktioniert.

7. **this hat in TypeScript einen Typ**: Der `this`-Parameter (an erster
   Stelle) wird zur Compilezeit geprueft und verschwindet im JavaScript.

8. **Type Guards sind benutzerdefinierte Typ-Einschraenkungen**: Mit
   `value is Type` kann man eigene Narrowing-Funktionen schreiben.

9. **Assertion Functions sagen "oder wirf!"**: `asserts value is Type`
   bedeutet: "Nach diesem Aufruf ist der Typ garantiert — oder es gab einen Error."

10. **Function Types sind First-Class**: Funktionen sind Werte mit Typen.
    `type Fn = (x: number) => string` ist ein vollwertiger Typ.

</details>

---

> **Starte hier:** [Sektion 01 - Funktionstypen Basics](./sections/01-funktionstypen-basics.md)
>
> **Naechste Lektion:** 07 - Union und Intersection Types —
> Wie man Typen kombiniert und damit maechtige Muster erzeugt.
