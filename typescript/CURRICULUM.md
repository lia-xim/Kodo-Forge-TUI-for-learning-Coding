# TypeScript Deep Learning — Curriculum

> Ziel: Echte TypeScript-Meisterschaft aufbauen — vom ersten Typ bis zur Type-Level-Programmierung.

## Didaktischer Ansatz

Jede Lektion folgt dem **LEARN-Zyklus**:

```
  L — Lesen & Verstehen    →  README.md mit Theorie, Diagrammen, Analogien
  E — Erkunden              →  examples/*.ts — lauffähige Beispiele zum Experimentieren
  A — Anwenden              →  exercises/*.ts — Aufgaben mit steigender Schwierigkeit
  R — Reflektieren          →  quiz.ts — interaktives Quiz im Terminal
  N — Nachschlagen          →  cheatsheet.md — kompakte Referenz für später
```

**So arbeitest du mit jeder Lektion:**
1. Lies die README.md durch — nimm dir Zeit, denke über die "Denkfrage"-Boxen nach
2. Führe die Beispiele aus: `npx tsx examples/01-dateiname.ts`
3. Bearbeite die Exercises — die TODOs leiten dich, der Compiler prüft dich
4. Mach das Quiz: `npx tsx quiz.ts`
5. Check die Cheatsheet als Referenz

**Wichtige Regeln:**
- Schau dir Lösungen ERST an, nachdem du die Exercise selbst probiert hast
- Wenn du steckst: 10 Minuten selbst probieren, dann Lösung anschauen
- Verändere die Examples! Experimentiere! Brich Sachen kaputt!

---

## Phase 1: Foundations (Lektion 01–10)

Das Fundament. Hier lernst du die Sprache TypeScript selbst kennen — ohne Framework, nur du und der Compiler.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 01 | Setup & Erste Schritte | Compiler, tsconfig, Ausführung | TS-Projekte aufsetzen und Code ausführen |
| 02 | Primitive Types | string, number, boolean, etc. | Alle Basistypen korrekt einsetzen |
| 03 | Type Annotations & Inference | Wann annotieren, wann infern lassen | Bewusste Entscheidungen über Typannotationen treffen |
| 04 | Arrays & Tuples | Array<T>, readonly, Tupel | Typsichere Collections verwenden |
| 05 | Objects & Interfaces | Interfaces, optional/readonly Props | Komplexe Objektstrukturen modellieren |
| 06 | Functions | Parameter-/Rückgabetypen, Overloads | Typsichere Funktionen schreiben |
| 07 | Union & Intersection Types | \| und & Operatoren | Flexible und präzise Typen kombinieren |
| 08 | Type Aliases vs Interfaces | Wann was verwenden | Die richtige Abstraktion wählen |
| 09 | Enums & Literal Types | const enum, string literals, as const | Wertebereiche exakt einschränken |
| 10 | Review Challenge | Alle Phase-1-Konzepte | Alles aus Phase 1 frei anwenden |

## Phase 2: Type System Core (Lektion 11–20)

Das Herzstück von TypeScript. Hier wird's mächtig — und hier trennt sich Wissen von Meisterschaft.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 11 | Type Narrowing | typeof, instanceof, in, is | Typen sicher eingrenzen |
| 12 | Discriminated Unions | Tagged unions, exhaustive checks | Komplexe Zustände modellieren |
| 13 | Generics Basics | Typparameter, Constraints | Wiederverwendbare typsichere Funktionen schreiben |
| 14 | Generic Patterns | Factories, Collections, Builder | Generics in der Praxis anwenden |
| 15 | Utility Types | Partial, Required, Pick, Omit, etc. | Built-in Utility Types meistern |
| 16 | Mapped Types | Typen transformieren | Eigene Utility Types bauen |
| 17 | Conditional Types | extends, infer | Typen dynamisch berechnen |
| 18 | Template Literal Types | String-Manipulation auf Type-Level | String-basierte APIs typsicher machen |
| 19 | Modules & Declarations | import/export, .d.ts, @types | Module-System verstehen und nutzen |
| 20 | Review Challenge | Alle Phase-2-Konzepte | Das Type System frei nutzen |

## Phase 3: Advanced TypeScript (Lektion 21–30)

Fortgeschrittene Techniken, die dich von "kann TypeScript" zu "beherrscht TypeScript" bringen.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 21 | Classes & OOP in TS | Access modifiers, abstract, implements | Typsichere Klassenhierarchien designen |
| 22 | Advanced Generics | Higher-order types, Variance | Komplexe generische Abstraktionen bauen |
| 23 | Recursive Types | Selbstreferenzierende Typen | Baumstrukturen und deep-Operationen typen |
| 24 | Branded/Nominal Types | Type-safe IDs, Opaque types | Verwechslung gleichförmiger Typen verhindern |
| 25 | Type-safe Error Handling | Result<T,E>, exhaustive errors | Fehler als Typen modellieren |
| 26 | Advanced Patterns | Builder, State Machine, Phantom | Design Patterns mit dem Type System |
| 27 | Declaration Merging | Module augmentation, global | Drittanbieter-Typen erweitern |
| 28 | Decorators | Legacy & Stage 3 Decorators | Metaprogrammierung mit Typsicherheit |
| 29 | tsconfig Deep Dive | Alle compiler flags | Projekte optimal konfigurieren |
| 30 | Review Challenge | Alle Phase-3-Konzepte | Fortgeschrittene TS-Techniken anwenden |

## Phase 4: Real-World Mastery (Lektion 31–40)

Vom Wissen zur Anwendung. Hier wird TypeScript zur Superkraft im echten Code.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 31 | Async TypeScript | Promises, async/await, Typen | Asynchronen Code typsicher schreiben |
| 32 | Type-safe APIs | REST/GraphQL Typen | API-Schichten end-to-end typen |
| 33 | Testing TypeScript | Vitest/Jest Typen, Mocking | TypeScript-Code effektiv testen |
| 34 | Performance & Compiler | Type instantiation limits | Compiler-Performance verstehen |
| 35 | Migration Strategies | JS→TS, strict Mode | Bestehenden Code sicher migrieren |
| 36 | Library Authoring | Package-Typen, .d.ts | Eigene typsichere Libraries schreiben |
| 37 | Type-Level Programming | Computing with types | Auf Type-Level "programmieren" |
| 38 | Compiler API | ts.createProgram, AST | Den Compiler als Tool nutzen |
| 39 | Best Practices & Anti-Patterns | any vs unknown, Overengineering | Häufige Fehler vermeiden |
| 40 | Capstone Project | Alles zusammen | Ein komplettes Projekt eigenständig umsetzen |

---

## Phase 5: TypeScript Mastery Plus (Lektion 41–44)

Vertiefungen und moderne Erweiterungen. Hier kommen die Themen, die aus einem guten TypeScript-Entwickler einen exzellenten machen.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 41 | TypeScript 5.x Features | TS 5.0–5.7, Inferred Predicates, verbatimModuleSyntax | Alle modernen TS-Features gezielt einsetzen |
| 42 | TypeScript Security | Gefaehrliche Muster, Parse-dont-validate, JS-Fallen | TypeScript-Code sicher und defensiv schreiben |
| 43 | TypeScript mit RxJS | Observable-Typen, Operator-Typen, Angular-Patterns | RxJS-Pipelines vollstaendig typsicher designen |
| 44 | Design Patterns Erweitert | GoF-Patterns, SOLID, Repository, Strategy | 15+ Design Patterns typsicher implementieren |

---

## Danach: Framework-Phasen

Nach Abschluss aller 44 Lektionen folgen die Framework-spezifischen Vertiefungen:

- **Angular mit TypeScript** — Decorators, DI, RxJS-Typen, Template-Typsicherheit, Signals
- **React mit TypeScript** — JSX-Typen, Hooks-Typen, Component Patterns, Context
- **Next.js mit TypeScript** — Server Components, API Routes, getServerSideProps Typen
