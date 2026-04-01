# TypeScript Phase 3: L21-L23 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 3 high-quality TypeScript lessons (L21 Classes & OOP, L22 Advanced Generics, L23 Recursive Types) matching L02 reference quality.

**Architecture:** Each lesson is a self-contained directory under `typescript/` with ~30 files: 6 markdown sections, 6 examples, 6 exercises, 6 solutions, quiz-data, pretest-data, misconceptions, completion-problems, debugging-data, parsons-data, tracing-data, transfer-data, hints.json, cheatsheet.md, README.md, quiz.ts. All content in German, code in English.

**Tech Stack:** TypeScript 5.7+, no external dependencies. All files are `.ts` or `.md`.

**Quality Rules (STRICT):**
- Every section: 280-320 lines, "Was du hier lernst", 1+ Hintergrundgeschichte, 1+ Self-Explanation, 1+ Denkfrage, 1+ Experiment, 1+ annotierter Code-Block, 1+ Framework-Bezug, "Was du gelernt hast" + Kernkonzept, Pausenpunkt
- Quiz: 15 questions, correct-index distribution 4/4/4/3 (indices 0,1,2,3), elaboratedFeedback for each
- Pretest: 3 questions per section, correct-index distribution varied
- Reference: `typescript/02-primitive-types/` is the quality benchmark

---

## File Structure Overview

Each lesson creates these files:

```
typescript/XX-lesson-name/
├── README.md                  # Lesson overview with section table
├── quiz.ts                    # Standalone quiz runner (imports quiz-data)
├── quiz-data.ts               # 15 quiz questions
├── pretest-data.ts            # 3 questions per section (~18 questions)
├── misconceptions.ts          # 8 misconceptions
├── completion-problems.ts     # 6 problems (rising difficulty)
├── debugging-data.ts          # 5 challenges
├── parsons-data.ts            # 3-4 problems with distractors
├── tracing-data.ts            # 4 exercises
├── transfer-data.ts           # 2-3 tasks in NEW context
├── hints.json                 # Progressive hints for all exercises
├── cheatsheet.md              # Compact reference
├── sections/
│   ├── 01-*.md                # Section 1 (~300 lines)
│   ├── 02-*.md                # Section 2 (~300 lines)
│   ├── 03-*.md                # Section 3 (~300 lines)
│   ├── 04-*.md                # Section 4 (~300 lines)
│   ├── 05-*.md                # Section 5 (~300 lines)
│   └── 06-*.md                # Section 6 (~300 lines)
├── examples/
│   ├── 01-*.ts through 06-*.ts
├── exercises/
│   ├── 01-*.ts through 06-*.ts
└── solutions/
    ├── 01-*.ts through 06-*.ts
```

---

## Task 1: L21 — Classes & OOP in TypeScript

**Directory:** `typescript/21-classes-und-oop/`

### Section Plan

| # | Dateiname | Titel | Kernkonzepte | Geschichte/Bezug |
|---|-----------|-------|-------------|-----------------|
| 01 | `01-klassen-grundlagen.md` | Klassen-Grundlagen | class, constructor, Felder, Methoden, this | Geschichte: Warum TS Klassen hinzufuegte (ES2015 + Typen). Angular: @Component-Klassen als taegliches Werkzeug |
| 02 | `02-access-modifiers.md` | Access Modifiers | public, private, protected, readonly, #private (ES2022) | Geschichte: Java's Einfluss auf TS Access Modifiers vs JS #private. Angular: private services in Components |
| 03 | `03-vererbung-und-abstract.md` | Vererbung & Abstract Classes | extends, super, abstract, Method Overriding | Geschichte: "Favor composition over inheritance" (GoF 1994). Angular: AbstractControl als Paradebeispiel |
| 04 | `04-interfaces-implementieren.md` | Interfaces implementieren | implements, mehrere Interfaces, structural typing | Denkfrage: Warum prueft TS implements strukturell? React: Vergleich mit Props-Interfaces |
| 05 | `05-static-und-patterns.md` | Static Members & Patterns | static, Singleton, Factory, Parameter Properties | Geschichte: Warum Singleton kontrovers ist. Angular: providedIn:'root' als Singleton-Alternative |
| 06 | `06-klassen-in-der-praxis.md` | Klassen in der Praxis | Wann Klassen vs Functions, Komposition, Mixins | Transfer: Wann Klassen sinnvoll sind vs funktionale Patterns. React: Warum React von Classes zu Hooks wechselte |

### Files to Create

**Step-by-step process for this task:**

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p typescript/21-classes-und-oop/{sections,examples,exercises,solutions}
```

- [ ] **Step 2: Write README.md**

Create `typescript/21-classes-und-oop/README.md` following L02 format:
- Title: "Lektion 21: Classes & OOP in TypeScript"
- Voraussetzung: Lektion 20 abgeschlossen
- Kernfrage: "Wann sind Klassen das richtige Werkzeug — und wann nicht?"
- 6 Sektionen mit Titeln, Dauer, Lernzielen
- Empfohlener Lernweg, Exercises-Abschnitt

- [ ] **Step 3: Write Section 01 — Klassen-Grundlagen (~300 lines)**

Pflicht-Elemente:
- "Was du hier lernst": class-Syntax, constructor, Felder mit Typen, Methoden, this-Kontext
- Hintergrundgeschichte: ES2015 brachte class-Syntax, TypeScript ergaenzt Typ-Annotationen. Vor ES2015: Prototype-basierte OOP.
- Self-Explanation: "Erklaere dir selbst: Warum ist `class Foo { name: string }` in TypeScript ein Fehler ohne Initialisierung (strictPropertyInitialization)? Was schuetzt TypeScript hier?"
- Denkfrage: "Was ist der Unterschied zwischen einem Interface und einer Klasse? Beide beschreiben eine Form..."
- Experiment: "Erstelle eine Klasse ohne constructor und beobachte was passiert"
- Annotierter Code-Block: Klasse mit constructor, Felder, Methoden — Annotationen erklaeren jeden Teil
- Framework-Bezug: "In Angular sind Components Klassen mit @Component-Decorator. Jedes `@Injectable()` Service ist eine Klasse."
- "Was du gelernt hast" + Kernkonzept + Pausenpunkt

- [ ] **Step 4: Write Section 02 — Access Modifiers (~300 lines)**

Pflicht-Elemente:
- "Was du hier lernst": public/private/protected/readonly, #private (ES2022), Unterschied TS private vs JS #private
- Hintergrundgeschichte: Java-Einfluss auf TypeScript vs JavaScript's "#private" (Stage 3 Proposal, jetzt Standard). Warum BEIDE existieren.
- Self-Explanation: "Erklaere dir selbst: Warum ist `private` in TypeScript NICHT das gleiche wie `#private`? Was passiert zur Laufzeit?"
- Denkfrage: "Wenn TypeScript-Typen zur Laufzeit verschwinden (Type Erasure, L02), was bedeutet das fuer `private`?"
- Experiment: "Markiere ein Feld als private und greife trotzdem via (obj as any).feld darauf zu"
- Annotierter Code-Block: Klasse mit allen Access Modifiers
- Framework-Bezug: "In Angular-Services nutzt du private fuer interne Logik: `private http = inject(HttpClient)`"
- Kernkonzept: "TS private = Compilezeit-Schutz, JS #private = Laufzeit-Schutz"

- [ ] **Step 5: Write Section 03 — Vererbung & Abstract (~300 lines)**

Pflicht-Elemente:
- "Was du hier lernst": extends, super(), abstract classes, abstract methods, Method Overriding
- Hintergrundgeschichte: "Favor composition over inheritance" — Gang of Four 1994. Warum Vererbung trotzdem wichtig ist.
- Self-Explanation: "Erklaere dir selbst: Warum kann man `abstract class` nicht instanziieren? Was waere das Problem?"
- Denkfrage: "Angular's `AbstractControl` ist abstract — FormControl, FormGroup, FormArray erben davon. Warum ist abstract hier die richtige Wahl?"
- Experiment: "Erstelle eine abstract class mit einer abstract method und vergiss sie in der Subklasse zu implementieren"
- Annotierter Code-Block: Vererbungshierarchie mit abstract + override
- Framework-Bezug: "Angular: AbstractControl → FormControl/FormGroup/FormArray. React: Frueher React.Component (class-based)"
- Kernkonzept: "Abstract classes definieren Vertraege die Subklassen erfuellen MUESSEN"

- [ ] **Step 6: Write Section 04 — Interfaces implementieren (~300 lines)**

Pflicht-Elemente:
- "Was du hier lernst": implements, mehrere Interfaces, structural vs nominal typing bei implements, Klasse als Interface
- Hintergrundgeschichte: Structural typing — TypeScript prueft Form, nicht Namen. "If it walks like a duck..." Warum implements trotzdem wichtig ist (explizite Intention).
- Self-Explanation: "Erklaere dir selbst: Wenn TypeScript strukturell prueft, warum braucht man dann ueberhaupt `implements`?"
- Denkfrage: "Kann eine Klasse gleichzeitig extends und implements nutzen? Wann wuerde man beides kombinieren?"
- Experiment: "Entferne implements von einer Klasse die ein Interface erfuellt — kompiliert es immer noch?"
- Annotierter Code-Block: Klasse die mehrere Interfaces implementiert
- Framework-Bezug: "React: Interface fuer Props, Klasse implementiert es nicht explizit (strukturell). Angular: OnInit, OnDestroy als Interfaces die Components implementieren."
- Kernkonzept: "implements = expliziter Vertrag, strukturelle Kompatibilitaet = impliziter Vertrag"

- [ ] **Step 7: Write Section 05 — Static Members & Patterns (~300 lines)**

Pflicht-Elemente:
- "Was du hier lernst": static fields/methods, Singleton-Pattern, Factory-Pattern, Parameter Properties (public/private im constructor)
- Hintergrundgeschichte: Singleton-Pattern (GoF 1995) und warum es kontrovers ist (globaler State, Test-Probleme). DI als Alternative.
- Self-Explanation: "Erklaere dir selbst: Warum ist `constructor(private name: string)` eine Kurzschreibweise? Was macht TypeScript daraus?"
- Denkfrage: "Angular nutzt providedIn:'root' statt Singleton-Pattern. Warum ist DI besser als manuelles Singleton?"
- Experiment: "Schreibe eine Factory-Methode mit static und vergleiche sie mit einem normalen constructor"
- Annotierter Code-Block: Parameter Properties, Static Factory
- Framework-Bezug: "Angular: Services mit providedIn:'root' SIND Singletons — aber durch DI verwaltet, nicht durch das Pattern selbst"
- Kernkonzept: "Parameter Properties sparen Boilerplate, static gehoert zur Klasse nicht zur Instanz"

- [ ] **Step 8: Write Section 06 — Klassen in der Praxis (~300 lines)**

Pflicht-Elemente:
- "Was du hier lernst": Wann Klassen vs Funktionen, Komposition vs Vererbung, Mixins, this-Binding-Probleme
- Hintergrundgeschichte: React's Wechsel von Class Components zu Hooks (React 16.8, 2019). Warum? this-Binding, Code-Reuse, Komplexitaet.
- Self-Explanation: "Erklaere dir selbst: Warum verliert eine Methode ihren this-Kontext wenn sie als Callback uebergeben wird? Was sind die Loesungen?"
- Denkfrage: "Wann wuerdest du eine Klasse schreiben und wann eine einfache Funktion? Gibt es eine Faustregel?"
- Experiment: "Extrahiere eine Methode als Callback und beobachte den this-Fehler. Fixe ihn mit Arrow Function im Feld."
- Annotierter Code-Block: Komposition vs Vererbung Vergleich
- Framework-Bezug: "React: Von Classes zu Hooks. Angular: Klassen bleiben zentral (Components, Services, Directives). Unterschiedliche Philosophien."
- Kernkonzept: "Klassen sind ein Werkzeug, kein Selbstzweck. Nutze das einfachste Werkzeug das zum Problem passt."

- [ ] **Step 9: Write 6 Examples**

Create `typescript/21-classes-und-oop/examples/`:
- `01-klassen-grundlagen.ts` — Einfache Klasse mit constructor, Felder, Methoden
- `02-access-modifiers.ts` — public/private/protected/#private Vergleich
- `03-vererbung-abstract.ts` — Vererbungskette mit abstract class
- `04-implements-interfaces.ts` — Klasse implementiert mehrere Interfaces
- `05-static-factory.ts` — Static members, Parameter Properties, Factory Pattern
- `06-komposition-vs-vererbung.ts` — Komposition mit Delegation vs extends

Jedes Example: Lauffaehig mit `npx tsx`, kommentiert, demonstriert Kernkonzept.

- [ ] **Step 10: Write 6 Exercises + Solutions**

Create `typescript/21-classes-und-oop/exercises/` und `solutions/`:
- `01-vehicle-hierarchy.ts` — Erstelle eine Vehicle-Klassenhierarchie mit Car, Truck (extends, abstract)
- `02-access-control.ts` — BankAccount mit private balance, public deposit/withdraw, protected audit
- `03-interface-implementierung.ts` — Serializable + Comparable Interfaces implementieren
- `04-static-registry.ts` — Registry-Pattern mit static Map und Factory-Methode
- `05-mixin-pattern.ts` — Timestamped + Serializable Mixins kombinieren
- `06-refactoring-challenge.ts` — Class-basierter Code zu funktionalem Code refactoren

Jedes Exercise: `// TODO:` Marker, steigende Schwierigkeit. Solutions mit Erklaerungen.

- [ ] **Step 11: Write quiz-data.ts (15 questions)**

Themen: Klassen-Syntax, Access Modifiers, Vererbung, abstract, implements, static, Parameter Properties, this-Binding, structural typing bei Klassen, #private vs private, readonly in Klassen, override keyword, Mixins, Komposition, Klassen vs Funktionen.

**correct-Index-Verteilung:** 0:4, 1:4, 2:4, 3:3
Jede Frage mit `elaboratedFeedback: { whyCorrect, commonMistake }`.

- [ ] **Step 12: Write pretest-data.ts (18 questions, 3 pro Sektion)**

3 Fragen pro Sektion, correct-Indizes gemischt. Format: PretestQuestion mit sectionIndex, question, options, correct, briefExplanation.

- [ ] **Step 13: Write misconceptions.ts (8 misconceptions)**

Themen:
1. "private verhindert Zugriff zur Laufzeit" (Nein — Type Erasure, nur Compilezeit)
2. "abstract classes koennen keine konkreten Methoden haben" (Doch!)
3. "implements prueft ob die Klasse das Interface erfuellt" (Ja, aber auch ohne implements geht strukturell)
4. "Vererbung ist immer besser als Komposition" (Nein — GoF)
5. "static Methoden koennen auf this zugreifen" (this bezieht sich auf die Klasse, nicht Instanz)
6. "#private und private sind dasselbe" (Nein — Laufzeit vs Compilezeit)
7. "Arrow Functions in Klassen-Feldern sind immer besser als Methoden" (Nein — Memory pro Instanz)
8. "Klassen sind Referenztypen, Interfaces sind Wertetypen" (Nein — JS hat keine Wertetypen)

- [ ] **Step 14: Write completion-problems.ts (6 problems)**

6 Lueckentext-Aufgaben mit steigender Schwierigkeit. Von einfacher Klassen-Syntax bis hin zu abstract + implements Kombination.

- [ ] **Step 15: Write debugging-data.ts (5 challenges)**

5 Challenges: this-Binding verloren als Callback, private vs #private Verwechslung, super() vergessen, abstract nicht implementiert, readonly-Verletzung.

- [ ] **Step 16: Write parsons-data.ts (4 problems)**

4 Code-Ordnungs-Aufgaben: Abstract class hierarchy, Interface implementation, Factory pattern, Mixin.
Je 1-2 Distraktoren.

- [ ] **Step 17: Write tracing-data.ts (4 exercises)**

4 Trace-Aufgaben: Vererbungskette constructor-Reihenfolge, Access Modifier Zugriff, static vs instance, this-Binding.

- [ ] **Step 18: Write transfer-data.ts (3 tasks)**

3 Transfer-Aufgaben in NEUEM Kontext:
1. "Modelliere ein Plugin-System mit abstract class und Factory" (Neuer Kontext: Build-Tool)
2. "Refactore eine Vererbungshierarchie zu Komposition" (Neuer Kontext: Game-Engine)
3. "Typsicherer Event-Emitter mit Klassen und Generics" (Neuer Kontext: UI-Framework)

- [ ] **Step 19: Write hints.json**

Progressive Hints (3-4 Stufen) fuer alle 6 Exercises. Erster Hint = Denkrichtung, letzter Hint = fast die Loesung.

- [ ] **Step 20: Write cheatsheet.md**

Kompakte Referenz: class Syntax, Access Modifiers Tabelle, abstract, implements, static, Parameter Properties, #private vs private, override, this-Binding Loesungen.

- [ ] **Step 21: Write quiz.ts**

Standalone quiz runner (3 Zeilen, importiert quiz-data und tools/quiz-runner).

- [ ] **Step 22: Quality Audit L21**

Pruefe JEDE Sektion gegen Qualitaets-Checkliste:
- [ ] Alle 9 Pflicht-Elemente pro Sektion vorhanden?
- [ ] Sektionen 280-320 Zeilen?
- [ ] Quiz correct-Index: 4/4/4/3?
- [ ] Alle Code-Beispiele kompilierbar mit tsc --strict?
- [ ] Framework-Bezuege in jeder Sektion?
- [ ] Vergleich mit L02 Qualitaet?

- [ ] **Step 23: Commit L21**

```bash
git add typescript/21-classes-und-oop/
git commit -m "feat: add L21 Classes & OOP in TypeScript (Phase 3)"
```

---

## Task 2: L22 — Advanced Generics

**Directory:** `typescript/22-advanced-generics/`

### Section Plan

| # | Dateiname | Titel | Kernkonzepte | Geschichte/Bezug |
|---|-----------|-------|-------------|-----------------|
| 01 | `01-generics-recap-und-grenzen.md` | Generics Recap & Grenzen | Wiederholung L13/L14, Motivation fuer Advanced | Geschichte: Generics in TS 2.0 vs heutiger Stand. Angular: Generic Services als Ausgangspunkt |
| 02 | `02-higher-order-types.md` | Higher-Order Type Functions | Typen die Typen transformieren, Generic über Generic | Geschichte: Haskell's Higher-Kinded Types als Inspiration. React: ComponentPropsWithRef<T> |
| 03 | `03-varianz-verstehen.md` | Varianz verstehen | Kovarianz, Kontravarianz, Invarianz, Bivarianz | Geschichte: Warum Java's Array-Kovarianz ein Designfehler war. Angular: strictFunctionTypes |
| 04 | `04-in-out-modifier.md` | in/out Variance Modifier (TS 4.7) | Explizite Varianz-Annotation, Performance | Geschichte: Wie TS 4.7 explizite Varianz einfuehrte (2022). React: Vergleich mit C# in/out |
| 05 | `05-fortgeschrittene-constraints.md` | Fortgeschrittene Constraints | Mehrfach-Constraints, Conditional + Generic, distributive Generics | Denkfrage: Warum `T extends A & B` statt `T extends A, T extends B`? Angular: FormBuilder-Typen |
| 06 | `06-generische-apis-designen.md` | Generische APIs designen | Best Practices, Overload vs Generic, Inference-Tricks | Transfer: API-Design-Prinzipien. React: Generische Hook-Patterns (useQuery<T>) |

### Files to Create

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p typescript/22-advanced-generics/{sections,examples,exercises,solutions}
```

- [ ] **Step 2: Write README.md**

Title: "Lektion 22: Advanced Generics — Higher-Order Types & Varianz"
Voraussetzung: L13 (Generics Basics) + L14 (Generic Patterns) abgeschlossen
Kernfrage: "Wie designt man generische APIs die sowohl flexibel als auch typsicher sind?"

- [ ] **Step 3: Write Section 01 — Generics Recap & Grenzen (~300 lines)**

- "Was du hier lernst": Wo L13/L14 aufhoerten, Grenzen einfacher Generics, Motivation fuer Advanced
- Hintergrundgeschichte: Generics in TS 2.0 (2016) — Anders Hejlsberg's Vision von "expressive types without runtime cost"
- Self-Explanation: "Erklaere dir selbst: Warum reicht `<T>` allein nicht aus wenn du einen Typ brauchst der selbst generisch ist?"
- Experiment: "Versuche einen generischen Container-Typ zu schreiben der mit Array<T>, Map<K,V>, und Set<T> funktioniert"
- Framework-Bezug: "Angular: `HttpClient.get<T>()` — einfacher Generic. Aber was wenn du einen Service schreiben willst der mit JEDEM HTTP-Wrapper funktioniert?"
- Annotierter Code-Block: Grenzen von einfachen Generics demonstrieren

- [ ] **Step 4: Write Section 02 — Higher-Order Types (~300 lines)**

- "Was du hier lernst": Typen die Typen als Parameter nehmen, Generic über Generic, Emulation von HKTs
- Hintergrundgeschichte: Haskell's Higher-Kinded Types und warum TypeScript sie (noch) nicht nativ hat
- Self-Explanation: "Erklaere dir selbst: Was bedeutet es wenn ein Typ SELBST einen Typparameter hat? Wie ist `Promise<T>` anders als `string`?"
- Denkfrage: "Warum kann man in TypeScript nicht `type Apply<F, A> = F<A>` schreiben?"
- Experiment: "Baue einen generischen Wrapper-Typ der sowohl mit Array als auch Promise funktioniert"
- Framework-Bezug: "React: `ComponentPropsWithRef<T>` extrahiert Props inklusive Ref-Typ aus einer Component"
- Annotierter Code-Block: HKT-Emulation mit Interface + Generic

- [ ] **Step 5: Write Section 03 — Varianz verstehen (~300 lines)**

- "Was du hier lernst": Kovarianz (Subtyp → Supertyp), Kontravarianz (Supertyp → Subtyp), Invarianz, Bivarianz
- Hintergrundgeschichte: Java's Array-Kovarianz war ein Designfehler — `String[]` ist Subtyp von `Object[]`, aber `arr[0] = 42` crasht zur Laufzeit. TypeScript lernte daraus.
- Self-Explanation: "Erklaere dir selbst: Warum ist ein `Array<Cat>` KEIN `Array<Animal>` wenn man schreiben kann? (Hinweis: Was passiert wenn jemand einen Dog reinschreibt?)"
- Denkfrage: "Function-Parameter sind kontravarinat. Was bedeutet das konkret?"
- Experiment: "Erstelle eine Funktion die `(a: Animal) => void` erwartet und uebergib eine Funktion die `(c: Cat) => void` nimmt"
- Framework-Bezug: "Angular: strictFunctionTypes (tsconfig) erzwingt korrekte Kontravarianz bei Callback-Typen"
- Annotierter Code-Block: Ko-/Kontravarianz mit Tier-Hierarchie

- [ ] **Step 6: Write Section 04 — in/out Modifier (~300 lines)**

- "Was du hier lernst": `in` (Kontravarianz), `out` (Kovarianz) Modifier seit TS 4.7, Performance-Vorteile
- Hintergrundgeschichte: TS 4.7 (Mai 2022) — explizite Varianz-Annotation. Inspiriert von C#'s `in`/`out` (seit C# 4.0, 2010). Loest Performance-Problem bei tiefen Typ-Hierarchien.
- Self-Explanation: "Erklaere dir selbst: Warum ist `interface Producer<out T>` kovarinat? Was sagt `out` ueber die Verwendung von T aus?"
- Denkfrage: "Kann ein Typparameter gleichzeitig `in` und `out` sein?"
- Experiment: "Fuege `out` zu einem Interface hinzu das T sowohl liest als auch schreibt — was sagt der Compiler?"
- Framework-Bezug: "React: ReadonlyArray<T> ist natuerlich kovarinat (`out T`). WritableSignal<T> in Angular waere invariant."
- Annotierter Code-Block: Producer<out T> vs Consumer<in T> vs ReadWrite<T> (invariant)

- [ ] **Step 7: Write Section 05 — Fortgeschrittene Constraints (~300 lines)**

- "Was du hier lernst": Intersection-Constraints (`T extends A & B`), Recursive Constraints, Conditional Generics, distributive Behavior
- Hintergrundgeschichte: Warum `T extends A & B` statt separate Constraints — TypeScript's Typ-Constraint-System vs Java's `<T extends A & B>`
- Self-Explanation: "Erklaere dir selbst: Warum verteilt sich `T extends U ? X : Y` ueber Union-Typen wenn T ein nackter Typparameter ist?"
- Denkfrage: "Was passiert mit `SomeType<string | number>` wenn SomeType einen Conditional Type enthaelt?"
- Experiment: "Schreibe einen Constraint der sicherstellt dass T sowohl serialisierbar als auch vergleichbar ist"
- Framework-Bezug: "Angular: FormBuilder constraints — `FormControl<T extends AbstractControl>`"
- Annotierter Code-Block: Multi-Constraint mit distributive Conditional

- [ ] **Step 8: Write Section 06 — Generische APIs designen (~300 lines)**

- "Was du hier lernst": API-Design-Prinzipien, Overloads vs Generics, Inference-Heuristiken, "Don't overgenericize"
- Hintergrundgeschichte: "Generics sind ein Werkzeug, kein Ziel" — Wann Generics die Loesung verkomplizieren
- Self-Explanation: "Erklaere dir selbst: Wann ist ein Function-Overload besser als ein Generic? Nenne ein Beispiel."
- Denkfrage: "TypeScript's Inference-Algorithmus arbeitet links-nach-rechts. Wie beeinflusst das dein API-Design?"
- Experiment: "Schreibe eine pipe()-Funktion mit Generics die bis zu 5 Transformationen verkettet"
- Framework-Bezug: "React: `useQuery<TData, TError>` — warum Default-Typparameter das API einfacher machen. Angular: `inject<T>(token)`"
- Annotierter Code-Block: Gutes vs schlechtes Generic-API-Design

- [ ] **Step 9: Write 6 Examples**

- `01-generics-grenzen.ts` — Wo einfache Generics nicht reichen
- `02-higher-order-types.ts` — HKT-Emulation mit Interfaces
- `03-varianz-demo.ts` — Ko-/Kontravarianz mit Tier-Hierarchie
- `04-in-out-modifier.ts` — Explizite Varianz-Annotation
- `05-advanced-constraints.ts` — Multi-Constraints und distributive Behavior
- `06-api-design.ts` — Gutes Generic-API-Design mit Inference-Tricks

- [ ] **Step 10: Write 6 Exercises + Solutions**

- `01-generic-container.ts` — Generischen Container-Typ schreiben
- `02-hkt-emulation.ts` — Higher-Kinded-Type Pattern implementieren
- `03-varianz-pruefung.ts` — Varianz-Probleme identifizieren und fixen
- `04-variance-annotationen.ts` — in/out Modifier korrekt einsetzen
- `05-multi-constraint.ts` — Typ mit mehreren Constraints designen
- `06-api-redesign.ts` — Schlecht generisches API zu gutem refactoren

- [ ] **Step 11: Write quiz-data.ts (15 questions)**

Themen: Higher-order types, Kovarianz, Kontravarianz, Invarianz, in/out, distributive behavior, Constraint-Syntax, Generic inference, API design, Overloads vs Generics, Default-Typparameter bei Generics, Varianz bei Arrays/Funktionen, Bivarianz-Hack.

**correct-Index-Verteilung:** 0:4, 1:4, 2:4, 3:3

- [ ] **Step 12: Write pretest-data.ts (18 questions)**

3 Fragen pro Sektion, correct-Indizes gemischt.

- [ ] **Step 13: Write misconceptions.ts (8 misconceptions)**

1. "Array<Cat> ist immer ein Subtyp von Array<Animal>" (Nein — Invarianz wegen Schreibzugriff)
2. "Kovarianz bedeutet dass der Typ groesser wird" (Nein — Subtyp-Richtung)
3. "in/out Modifier aendern das Verhalten" (Nein — nur Annotation, Compiler prueft)
4. "Generics sind immer besser als Union Types" (Nein — manchmal ist Union einfacher)
5. "T extends A | B bedeutet T muss A ODER B sein" (Nein — T muss Subtyp von A | B sein)
6. "Distributive Conditional Types verteilen sich immer" (Nein — nur bei nackten Typparametern)
7. "Function-Parameter sind kovarinat" (Nein — kontravarinat unter strictFunctionTypes)
8. "Generic Default-Parameter werden immer benutzt" (Nein — Inference hat Vorrang)

- [ ] **Step 14: Write completion-problems.ts (6 problems)**

- [ ] **Step 15: Write debugging-data.ts (5 challenges)**

- [ ] **Step 16: Write parsons-data.ts (4 problems)**

- [ ] **Step 17: Write tracing-data.ts (4 exercises)**

- [ ] **Step 18: Write transfer-data.ts (3 tasks)**

1. "Type-safe Event System mit kovarianten Listenern" (Kontext: Game Engine Events)
2. "Generischer Data-Validator mit Constraints" (Kontext: Form-Validation Library)
3. "Varianzsichere Collection-API" (Kontext: Immutable.js-aehnliche Library)

- [ ] **Step 19: Write hints.json, cheatsheet.md, quiz.ts**

- [ ] **Step 20: Quality Audit L22**

Gleiche Checkliste wie L21 Step 22.

- [ ] **Step 21: Commit L22**

```bash
git add typescript/22-advanced-generics/
git commit -m "feat: add L22 Advanced Generics (Phase 3)"
```

---

## Task 3: L23 — Recursive Types

**Directory:** `typescript/23-recursive-types/`

### Section Plan

| # | Dateiname | Titel | Kernkonzepte | Geschichte/Bezug |
|---|-----------|-------|-------------|-----------------|
| 01 | `01-was-sind-rekursive-typen.md` | Was sind rekursive Typen? | Selbstreferenz, Motivation, einfache Beispiele | Geschichte: Rekursion in der Informatik — von Fibonacci bis Baumstrukturen. Angular: Rekursive Komponenten (Tree-View) |
| 02 | `02-baumstrukturen-typen.md` | Baumstrukturen typen | JSON-Typ, DOM-Baum, AST, verschachtelte Menues | Geschichte: JSON als rekursiver Typ — Douglas Crockford's Spezifikation. React: Virtual DOM als rekursiver Typ |
| 03 | `03-deep-operationen.md` | Deep-Operationen | DeepPartial, DeepReadonly, DeepRequired, DeepMutable | Geschichte: Warum TS kein eingebautes DeepPartial hat. Angular: DeepReadonly fuer Immutable State |
| 04 | `04-rekursive-conditional-types.md` | Rekursive Conditional Types | Flatten, Paths, PathValue, UnionToIntersection | Geschichte: TS 4.1 (2020) erlaubte erstmals rekursive Conditional Types. React: Path-basierte Form-Typen |
| 05 | `05-grenzen-und-performance.md` | Grenzen & Performance | Rekursionslimits, Type-Level-Iteration, Tail Recursion | Geschichte: TS hat Rekursionslimit von ~50 Ebenen — warum? Angular/React: Wann rekursive Typen zu teuer werden |
| 06 | `06-praxis-patterns.md` | Praxis-Patterns | Reale Anwendungsfaelle, Library-Typen, Best Practices | Transfer: Wo rekursive Typen im echten Code auftauchen. Framework-Bezuege: Zod, React Hook Form, Angular FormGroup |

### Files to Create

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p typescript/23-recursive-types/{sections,examples,exercises,solutions}
```

- [ ] **Step 2: Write README.md**

Title: "Lektion 23: Recursive Types — Selbstreferenzierende Typen"
Voraussetzung: L17 (Conditional Types) abgeschlossen
Kernfrage: "Wie typisiert man Datenstrukturen die beliebig tief verschachtelt sein koennen?"

- [ ] **Step 3: Write Section 01 — Was sind rekursive Typen? (~300 lines)**

- "Was du hier lernst": Selbstreferenzierende Typ-Definitionen, einfache Beispiele (LinkedList, Tree), Rekursion vs Iteration auf Type-Level
- Hintergrundgeschichte: Rekursion in der Informatik — Alonzo Church's Lambda-Kalkuel (1930er), Fibonacci-Definition. Rekursive Datenstrukturen als Grundlage von CS.
- Self-Explanation: "Erklaere dir selbst: Warum ist `type List<T> = { value: T; next: List<T> | null }` ein rekursiver Typ? Was ist die Abbruchbedingung?"
- Denkfrage: "Was passiert wenn du die Abbruchbedingung (| null) weglässt?"
- Experiment: "Definiere einen LinkedList-Typ und erstelle eine verschachtelte Instanz mit 3 Elementen"
- Framework-Bezug: "Angular: Tree-View-Komponenten haben rekursive Templates. React: Rekursive Component-Rendering fuer Menues, Kommentare."
- Annotierter Code-Block: LinkedList und Tree Typ-Definition

- [ ] **Step 4: Write Section 02 — Baumstrukturen typen (~300 lines)**

- "Was du hier lernst": JSON als rekursiver Typ, DOM-Baum-Typisierung, AST-Typen, verschachtelte Menue-Strukturen
- Hintergrundgeschichte: Douglas Crockford's JSON-Spezifikation (2001) — JSON ist rekursiv definiert: Ein Value kann ein Object enthalten, das Values enthaelt...
- Self-Explanation: "Erklaere dir selbst: Warum ist `type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }` ein vollstaendiger JSON-Typ?"
- Experiment: "Schreibe den JSON-Typ und teste ihn mit einem tief verschachtelten Objekt"
- Framework-Bezug: "React: Virtual DOM (`ReactNode`) ist rekursiv — ein Element kann Children enthalten die Elements sind"
- Annotierter Code-Block: JSON-Typ + DOM-Node-Typ

- [ ] **Step 5: Write Section 03 — Deep-Operationen (~300 lines)**

- "Was du hier lernst": DeepPartial<T>, DeepReadonly<T>, DeepRequired<T>, DeepMutable<T>
- Hintergrundgeschichte: Warum TypeScript kein eingebautes `DeepPartial` hat — Designentscheidung gegen unbegrenzte Rekursion in Utility Types. Libraries wie ts-essentials fuellen die Luecke.
- Self-Explanation: "Erklaere dir selbst: Wie funktioniert DeepReadonly? Warum braucht man `T[K] extends object ? DeepReadonly<T[K]> : T[K]`?"
- Denkfrage: "Was passiert mit Arrays in DeepReadonly? Soll `string[]` zu `readonly string[]` werden?"
- Experiment: "Implementiere DeepPartial und teste es mit einem 3-fach verschachtelten Objekt"
- Framework-Bezug: "Angular: Immutable State mit DeepReadonly — NgRx Store-State soll nicht mutiert werden. React: Immer produziert DeepReadonly-aehnliche Typen."
- Annotierter Code-Block: DeepPartial + DeepReadonly Implementation

- [ ] **Step 6: Write Section 04 — Rekursive Conditional Types (~300 lines)**

- "Was du hier lernst": Flatten (verschachtelte Arrays/Objekte flachklopfen), Paths/PathValue (typsichere Pfad-Zugriffe), Rekursive String-Manipulation
- Hintergrundgeschichte: TS 4.1 (November 2020) — Template Literal Types + rekursive Conditional Types. Vorher waren rekursive Typen stark eingeschraenkt.
- Self-Explanation: "Erklaere dir selbst: Wie berechnet `Paths<{a: {b: {c: string}}}` den Typ `'a' | 'a.b' | 'a.b.c'`?"
- Denkfrage: "Warum ist FlatArray aus lib.es2019 nicht einfach `T extends (infer U)[] ? FlatArray<U> : T`?"
- Experiment: "Implementiere einen Flatten-Typ der verschachtelte Arrays bis Tiefe 3 flach macht"
- Framework-Bezug: "React Hook Form: `Path<FormValues>` nutzt exakt dieses Pattern fuer typsichere `register('address.street')`"
- Annotierter Code-Block: Paths + PathValue Implementation

- [ ] **Step 7: Write Section 05 — Grenzen & Performance (~300 lines)**

- "Was du hier lernst": TS Rekursionslimit (~50 Ebenen), Type-Level-Iteration Tricks, Tail Recursion Optimization (TS 4.5), --generateTrace
- Hintergrundgeschichte: Warum TypeScript ein Rekursionslimit hat — Stack-basierte Typ-Auswertung, Compiler-Performance. TS 4.5 (2021) fuehrte Tail Recursion Optimization fuer Conditional Types ein.
- Self-Explanation: "Erklaere dir selbst: Warum kann `DeepPartial<ExtremelyDeep>` den Compiler zum Absturz bringen? Was ist das Limit?"
- Denkfrage: "Wie koennte man einen Countdown-Typ bauen der von N bis 0 zaehlt? (Hinweis: Tuple-Laenge als Zaehler)"
- Experiment: "Erstelle einen rekursiven Typ und erhoehe die Verschachtelungstiefe bis der Compiler abbricht"
- Framework-Bezug: "Angular/React: Wann du rekursive Typen NICHT verwenden solltest — Compile-Zeit verdoppeln fuer minimalen Nutzen"
- Annotierter Code-Block: Tail-recursive vs non-tail-recursive Type

- [ ] **Step 8: Write Section 06 — Praxis-Patterns (~300 lines)**

- "Was du hier lernst": Reale Anwendungsfaelle (Config-Objekte, Router-Typen, Form-Typen), Library-Typen (Zod, Prisma), Best Practices
- Hintergrundgeschichte: Zod's rekursive Schema-Definition — `z.lazy()` fuer zirkulaere Typen. Warum lazy evaluation noetig ist.
- Self-Explanation: "Erklaere dir selbst: Warum braucht Zod `z.lazy()` fuer rekursive Schemas statt einfacher Rekursion?"
- Denkfrage: "Wo ziehst du die Grenze? Wann ist ein rekursiver Typ zu clever und ein einfacherer Ansatz besser?"
- Experiment: "Schreibe einen typsicheren deep-get(obj, 'a.b.c') mit rekursiven Typen"
- Framework-Bezug: "React Hook Form: `useForm<FormValues>()` mit Path<T> fuer register(). Angular: Reactive Forms FormGroup verschachtelt."
- Annotierter Code-Block: Typsicherer deep-get/deep-set

- [ ] **Step 9: Write 6 Examples**

- `01-linked-list-tree.ts` — LinkedList und Tree Typen
- `02-json-typ.ts` — Vollstaendiger JSON-Typ + Validierung
- `03-deep-operations.ts` — DeepPartial, DeepReadonly, DeepMutable
- `04-paths-and-values.ts` — Paths<T>, PathValue<T, P>
- `05-recursion-limits.ts` — Rekursionslimit demonstrieren + Workarounds
- `06-praxis-deep-get.ts` — Typsicherer deep-get mit rekursiven Typen

- [ ] **Step 10: Write 6 Exercises + Solutions**

- `01-linked-list.ts` — LinkedList<T> mit append, find, map implementieren
- `02-json-validator.ts` — isJsonValue() Type Guard fuer den JSON-Typ
- `03-deep-partial.ts` — DeepPartial<T> implementieren (auch fuer Arrays)
- `04-flatten-type.ts` — FlatArray-Typ bis Tiefe N implementieren
- `05-type-safe-paths.ts` — Paths<T> und PathValue<T, P> implementieren
- `06-recursive-tree-ops.ts` — map/filter/reduce fuer einen Tree<T>

- [ ] **Step 11: Write quiz-data.ts (15 questions)**

**correct-Index-Verteilung:** 0:4, 1:4, 2:4, 3:3

- [ ] **Step 12: Write pretest-data.ts (18 questions)**

- [ ] **Step 13: Write misconceptions.ts (8 misconceptions)**

1. "Rekursive Typen verursachen Endlosschleifen" (Nein — TS hat Rekursionslimit + lazy evaluation)
2. "DeepPartial macht auch Methoden optional" (Kommt drauf an — Function-Check noetig)
3. "JSON.parse() gibt JsonValue zurueck" (Nein — any, man muss selbst validieren)
4. "Rekursive Typen sind immer langsam" (Nein — flache Rekursion ist schnell, nur tiefe ist teuer)
5. "type X = X | null ist ein rekursiver Typ" (Nein — das ist zirkulaer und ein Fehler)
6. "FlatArray<T, Infinity> gibt es" (Nein — TS FlatArray hat endliche Tiefe, number als Zaehler)
7. "Tail Recursion Optimization macht alles schnell" (Nein — nur bestimmte Conditional Type Patterns)
8. "Paths<T> erfasst auch Array-Indizes" (Kommt auf Implementation an — muss explizit behandelt werden)

- [ ] **Step 14-19: Write remaining data files**

completion-problems.ts (6), debugging-data.ts (5), parsons-data.ts (4), tracing-data.ts (4), transfer-data.ts (3), hints.json, cheatsheet.md, quiz.ts.

Transfer Tasks:
1. "Typsicherer JSON-Config-Loader fuer ein CLI-Tool" (Neuer Kontext: DevOps)
2. "Rekursiver Diff-Typ der Unterschiede zwischen zwei Objekten findet" (Neuer Kontext: State-Management)
3. "Verschachteltes Routing-System mit typsicheren Pfaden" (Neuer Kontext: Custom Router)

- [ ] **Step 20: Quality Audit L23**

- [ ] **Step 21: Commit L23**

```bash
git add typescript/23-recursive-types/
git commit -m "feat: add L23 Recursive Types (Phase 3)"
```

---

## Task 4: Final Quality Verification & Session Log

- [ ] **Step 1: Cross-lesson consistency check**

Pruefen:
- Alle 3 README.md folgen gleichem Format
- Alle quiz-data.ts haben correct-Index 4/4/4/3
- Keine doppelten Konzepte zwischen L21/L22/L23
- Imports korrekt (relative Pfade zu ../tools/)
- Alle Sections haben Vorherige/Naechste Sektion Links

- [ ] **Step 2: Update docs/06-SESSION-LOG.md**

Neuen Session-Eintrag hinzufuegen mit:
- Session-Datum
- Erstellte Lektionen (L21, L22, L23)
- Qualitaets-Metriken
- Bekannte Issues

- [ ] **Step 3: Final commit**

```bash
git add docs/06-SESSION-LOG.md
git commit -m "docs: update session log with L21-L23"
```
