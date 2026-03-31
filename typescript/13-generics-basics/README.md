# Lektion 13: Generics Basics

> **Voraussetzung:** Lektion 09 (Enums & Literal Types) abgeschlossen, Interfaces und Type Aliases bekannt.
> **Ziel:** Generische Funktionen, Interfaces, Constraints und Default-Typen sicher beherrschen — und verstehen warum Generics das Herzstuck von TypeScript sind.
> **Kernfrage dieser Lektion:** Wie schreibst du Code der mit JEDEM Typ funktioniert, ohne Typsicherheit zu verlieren?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Warum Generics](./sections/01-warum-generics.md) | ~10 Min | Das Problem: Code-Duplikation vs any, die Loesung: Typparameter \<T\> |
| 02 | [Generische Funktionen](./sections/02-generische-funktionen.md) | ~10 Min | function identity\<T\>(arg: T): T, Inference bei Funktionsaufrufen |
| 03 | [Generische Interfaces und Types](./sections/03-generische-interfaces-und-types.md) | ~10 Min | Generic Interfaces, Generic Type Aliases, Array\<T\> als Beispiel |
| 04 | [Constraints](./sections/04-constraints.md) | ~10 Min | extends Keyword, keyof Constraint, mehrere Constraints |
| 05 | [Default-Typparameter](./sections/05-default-typparameter.md) | ~10 Min | Default Types \<T = string\>, wann sinnvoll, Patterns |
| 06 | [Generics in der Praxis](./sections/06-generics-in-der-praxis.md) | ~10 Min | React useState\<T\>, Angular HttpClient\<T\>, Promise\<T\>, Map\<K,V\> |

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
13-generics-basics/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-warum-generics.md
│   ├── 02-generische-funktionen.md
│   ├── 03-generische-interfaces-und-types.md
│   ├── 04-constraints.md
│   ├── 05-default-typparameter.md
│   └── 06-generics-in-der-praxis.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-warum-generics.ts
│   ├── 02-generische-funktionen.ts
│   ├── 03-generische-interfaces.ts
│   ├── 04-constraints.ts
│   ├── 05-default-typparameter.ts
│   └── 06-generics-praxis.ts
├── exercises/                <-- Uebungen mit TODOs
│   ├── 01-erste-generische-funktion.ts
│   ├── 02-generische-interfaces.ts
│   ├── 03-constraints.ts
│   ├── 04-default-typparameter.ts
│   ├── 05-utility-funktionen.ts
│   └── 06-praxis-integration.ts
├── solutions/                <-- Loesungen zu den Uebungen
│   ├── 01-erste-generische-funktion.ts
│   ├── 02-generische-interfaces.ts
│   ├── 03-constraints.ts
│   ├── 04-default-typparameter.ts
│   ├── 05-utility-funktionen.ts
│   └── 06-praxis-integration.ts
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
├── quiz-data.ts              <-- Quiz-Fragen (15 + Elaborated Feedback)
├── pretest-data.ts           <-- Pre-Test (18 Fragen, 3 pro Sektion)
├── misconceptions.ts         <-- 8 haeufige Fehlvorstellungen
├── completion-problems.ts    <-- 6 Lueckentexte
├── debugging-data.ts         <-- 5 Debugging-Challenges
├── parsons-data.ts           <-- 4 Parson's Problems
├── tracing-data.ts           <-- 4 Code-Tracing-Uebungen
├── transfer-data.ts          <-- 3 Transfer-Aufgaben
├── hints.json                <-- Gestufte Hilfe fuer Exercises
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Generics loesen das Duplikation-vs-any-Dilemma**: Eine Funktion,
   jeder Typ, volle Typsicherheit. Kein Copy-Paste, kein any.

2. **T ist ein Platzhalter, kein Typ**: Typparameter werden beim Aufruf
   durch konkrete Typen ersetzt — wie Wert-Parameter bei Funktionen.

3. **Inference ist maechtig**: TypeScript erkennt T meistens automatisch
   aus den Argumenten. Nur bei fehlenden Argumenten explizit angeben.

4. **Generische Interfaces sind Schablonen**: Box\<string\> und
   Box\<number\> sind verschiedene Typen aus derselben Vorlage.

5. **Array\<T\> = T[]**: Du nutzt Generics schon laenger als du denkst.
   Arrays, Promises, Maps — alles generisch.

6. **Constraints mit extends**: T extends { length: number } garantiert
   dass T mindestens .length hat — ohne den vollen Typ zu verlieren.

7. **keyof ist der Schluessel**: K extends keyof T + T[K] ergibt
   typsichere Property-Zugriffe mit praezisen Rueckgabetypen.

8. **Defaults fuer API-Design**: \<T = string\> macht das einfache
   Szenario einfach und das komplexe weiterhin moeglich.

9. **T mindestens 2x verwenden**: Ein Typparameter der nur einmal
   vorkommt ist nutzlos — er koennte unknown sein.

10. **Generics sind das Herzstuck**: React useState, Angular HttpClient,
    Promise, Map, Array — alles basiert auf Generics. Sie zu verstehen
    ist keine Option, sondern die Voraussetzung.

</details>

---

> **Starte hier:** [Sektion 01 - Warum Generics](./sections/01-warum-generics.md)
>
> **Naechste Lektion:** 14 — Advanced Generics —
> Conditional Types, infer, Mapped Types und die maechtigsten Patterns.
