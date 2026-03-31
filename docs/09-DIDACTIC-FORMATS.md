# Didaktische Formate: Alle Uebungstypen im Detail

> Letzte Aktualisierung: 2026-03-31

---

## Ueberblick

Die Plattform implementiert **12 Uebungsformate** und hat **8 weitere geplant**. Jedes Format basiert auf mindestens einer wissenschaftlichen Studie und hat eine spezifische Rolle im Lernprozess.

---

## Implementierte Formate (12)

---

### Format 1: Sektionen lesen

**Beschreibung:** Markdown-Sektionen mit Theorie, Code-Beispielen, Diagrammen, Analogien und didaktischen Elementen (Self-Explanation, Denkfragen, Experimente, Hintergrundgeschichten).

**Wissenschaftliche Grundlage:** Cognitive Load Theory (Sweller 1988) — 10-Min-Sektionen begrenzen intrinsic load. Multimedia Learning (Mayer 2009) — Text + Code + Diagramme.

**Technische Implementierung:**
- Dateien: `sections/*.md` in jeder Lektion (5-7 Dateien, je 280-320 Zeilen)
- Rendering: `markdown-renderer.ts` (1.074 Zeilen) → ANSI-Terminal-Ausgabe
- Anzeige: `tui-section-reader.ts` (584 Zeilen) mit Smooth Scrolling

**Beispiel aus L02 S1 (`typescript/02-primitive-types/sections/01-das-typsystem-ueberblick.md`):**
```markdown
## Das mentale Modell: Compilezeit vs Laufzeit

> TypeScript-Typen existieren NUR zur Compilezeit. Zur Laufzeit sind
> sie komplett weg.

Das nennt man **Type Erasure** (Typ-Loeschung)...

> Erklaere dir selbst: Warum kann TypeScript nicht garantieren, welchen Typ
> `JSON.parse()` zurueckgibt?
```

**Wie es im TUI aussieht:**
```
 TypeScript > L02 > S1: Das Typsystem                    ⏱ 5:23  │
 ─────────────────────────────────────────────────────────────────┤
                                                                  █
 ## Das mentale Modell: Compilezeit vs Laufzeit                   █
                                                                  │
 > TypeScript-Typen existieren NUR zur Compilezeit.               │
 > Zur Laufzeit sind sie komplett weg.                            │
                                                                  │
 ─────────────────────────────────────────────────────────────────┤
 Zeile 18/180 · 10% | ~8 Min                                     │
```

**Einsatz:** Jede Lektion, jede Sektion.

---

### Format 2: Pre-Tests

**Beschreibung:** 3 Multiple-Choice-Fragen VOR einer neuen Sektion. Testen Vorwissen und empfehlen Lesetiefe.

**Wissenschaftliche Grundlage:** Pretesting Effect (Richland, Kornell & Kao 2009) — selbst falsche Antworten auf Pre-Test-Fragen verbessern das spaetere Lernen um ~10%, weil der Abrufversuch das Gehirn "vorbereitet".

**Technische Implementierung:**
- Dateien: `pretest-data.ts` pro Lektion (exportiert Array von PretestQuestion)
- Engine: `pretest-engine.ts` (430 Zeilen) — loadPretestQuestions(), calculateDepth()
- Interface: `PretestQuestion { question, options, correct, explanation, sectionIndex, concept? }`
- Anzeige: `tui-quiz.ts` (Screen-Typ "pretest")

**Beispiel aus einer pretest-data.ts:**
```typescript
export const pretestQuestions: PretestQuestion[] = [
  {
    question: "Was passiert mit TypeScript-Typen zur Laufzeit?",
    options: [
      "Sie werden zu JavaScript-Klassen",
      "Sie werden als Kommentare beibehalten",
      "Sie werden komplett entfernt (Type Erasure)",
      "Sie werden in eine separate .types Datei geschrieben"
    ],
    correct: 2,
    explanation: "TypeScript-Typen existieren nur zur Compilezeit...",
    sectionIndex: 0,
    concept: "type-erasure"
  },
  // ...
];
```

**Einsatz:** Automatisch beim Oeffnen einer neuen Sektion angeboten (ueberspringbar).

---

### Format 3: Exercises (Watch-Runner)

**Beschreibung:** TypeScript-Dateien mit `// TODO:`-Markern. Der Watch-Runner beobachtet Aenderungen und gibt sofort Feedback (Type-Check + Runtime-Check).

**Wissenschaftliche Grundlage:** Active Learning — Lernen durch Tun ist effektiver als passives Lesen. Immediate Feedback — sofortige Rueckmeldung verbessert Lernen (Hattie & Timperley 2007, Effektstaerke d=0.73).

**Technische Implementierung:**
- Dateien: `exercises/*.ts` pro Lektion (5-6 Dateien)
- Engine: `watch-runner.ts` (825 Zeilen) — fs.watch(), tsc --noEmit, npx tsx
- Loesungen: `solutions/*.ts` pro Lektion
- Hints: `hints.json` pro Lektion

**Beispiel einer Exercise-Datei:**
```typescript
// exercises/02-type-annotations.ts

// TODO 1: Annotiere die Variable mit dem korrekten Typ
const username = "admin";

// TODO 2: Diese Funktion soll nur Strings akzeptieren.
// Fuege den Parametertyp hinzu.
function greet(name) {
  return `Hello, ${name}!`;
}

// TODO 3: Was ist der Rueckgabetyp dieser Funktion?
// Annotiere ihn explizit.
function add(a: number, b: number) {
  return a + b;
}
```

**Einsatz:** [E] > [3] im Lesson-Menue.

---

### Format 4: Completion Problems (Faded Worked Examples)

**Beschreibung:** Code mit Luecken (Platzhaltern), die der Lernende ausfuellen muss. Stufenweise schwieriger: Anfangs nur eine Luecke, spaeter mehrere.

**Wissenschaftliche Grundlage:** Faded Worked Examples (Renkl, Atkinson & Maier 2002) — Progression von vollstaendigem Beispiel ueber teilweises Beispiel (Luecken) zu eigenstaendigem Loesen. Reduziert Cognitive Load im Vergleich zu sofortigem eigenstaendigem Problemloesen.

**Technische Implementierung:**
- Dateien: `completion-problems.ts` pro Lektion (6 Aufgaben)
- Interface: `CompletionProblem { id, title, description, template, solution, blanks: { placeholder, answer, hint }[], concept }`
- Anzeige: `tui-challenges.ts` (Screen-Typ "completion")

**Beispiel:**
```typescript
{
  id: "cp-01",
  title: "Type Guard Funktion",
  template: `function isString(value: ___BLANK1___): value is ___BLANK2___ {
  return typeof value === "___BLANK3___";
}`,
  blanks: [
    { placeholder: "___BLANK1___", answer: "unknown", hint: "Der sicherste Typ fuer unbekannte Werte" },
    { placeholder: "___BLANK2___", answer: "string", hint: "Welchen Typ garantiert die Funktion?" },
    { placeholder: "___BLANK3___", answer: "string", hint: "typeof gibt einen String zurueck" }
  ],
  concept: "type-guards"
}
```

**Wie es im TUI aussieht:**
```
 Completion Problem 1/6: Type Guard Funktion

 function isString(value: ________): value is ________ {
   return typeof value === "________";
 }

 Luecke 1/3: _______
 Hint: Der sicherste Typ fuer unbekannte Werte

 > Deine Antwort: unknown█
```

**Einsatz:** [E] > [2] im Lesson-Menue.

---

### Format 5: Quizzes mit Elaborated Feedback

**Beschreibung:** 15 Multiple-Choice-Fragen pro Lektion mit ausfuehrlichem Feedback (whyCorrect + commonMistake) und Metacognitive Prompts (Confidence 1-4).

**Wissenschaftliche Grundlage:** Testing Effect (Roediger & Butler 2011) — Testen IST Lernen. Elaborated Feedback (Bangert-Drowns et al. 1991) — Feedback mit Erklaerung ist 2x effektiver als nur "richtig/falsch".

**Technische Implementierung:**
- Dateien: `quiz-data.ts` pro Lektion (15 Fragen)
- Engine: `quiz-runner.ts` (199 Zeilen) fuer Standalone, `tui-quiz.ts` (481 Zeilen) fuer TUI
- correct-Indizes: MUESSEN gleichmaessig verteilt sein (4/4/4/3)

**Beispiel:**
```typescript
{
  question: "Was gibt typeof null zurueck?",
  options: ['"null"', '"undefined"', '"object"', '"none"'],
  correct: 2,
  elaboratedFeedback: {
    whyCorrect: "typeof null === 'object' ist ein beruehter Bug aus 1995...",
    commonMistake: "Viele erwarten 'null', aber typeof hat diesen Sonderfall."
  }
}
```

**Einsatz:** Quiz am Ende jeder Lektion, Spaced Repetition Review.

---

### Format 6: Misconception Challenges

**Beschreibung:** 8 haeufige Fehlkonzeptionen pro Lektion. Code + "Was glaubst du passiert?" + Aufloesung mit Erklaerung.

**Wissenschaftliche Grundlage:** Conceptual Change Theory (Posner et al. 1982) — Fehlkonzeptionen muessen aktiv konfrontiert werden. Nur "die richtige Erklaerung geben" aendert tief verankerte Fehlvorstellungen nicht.

**Technische Implementierung:**
- Dateien: `misconceptions.ts` pro Lektion (8 Misconceptions)
- Interface: `Misconception { id, title, code, commonBelief, reality, concept, difficulty }`
- Anzeige: `tui-challenges.ts` (Screen-Typ "misconceptions")

**Beispiel:**
```typescript
{
  id: "m-01",
  title: "typeof null",
  code: `const x = null;\nconsole.log(typeof x);`,
  commonBelief: "typeof null gibt 'null' zurueck",
  reality: "typeof null gibt 'object' zurueck — ein Bug seit 1995, der nie gefixt wurde",
  concept: "typeof-operator",
  difficulty: 2
}
```

**Wie es im TUI aussieht:**
```
 Misconception 1/8: typeof null

 const x = null;
 console.log(typeof x);

 Was glaubst du: Was gibt typeof x zurueck?
 (a) "null"     (b) "object"     (c) "undefined"

 > Lernender waehlt (a)...

 UEBERRASCHUNG! Die Antwort ist (b) "object".
 typeof null gibt "object" zurueck — ein beruehter Bug aus 1995...
```

**Einsatz:** [E] > [4] im Lesson-Menue.

---

### Format 7: Debugging Challenges

**Beschreibung:** Code mit einem Bug + Fehlerbeschreibung. Lernender muss den Bug finden und beschreiben wie er zu fixen ist.

**Wissenschaftliche Grundlage:** Debugging as Learning (Adams 2014) — Debugging trainiert systematisches Denken und Code-Verstaendnis. Bug-Suche erfordert ein tiefes mentales Modell des Codes.

**Technische Implementierung:**
- Dateien: `debugging-data.ts` pro Lektion (5 Challenges)
- Engine: `debugging-engine.ts` (409 Zeilen)
- Interface: `DebuggingChallenge { code, errorDescription, bugLocation, fix, explanation }`

**Einsatz:** Im Lesson-Menue, nach Exercises.

---

### Format 8: Code Tracing

**Beschreibung:** Code-Block + "Was gibt dieses Programm aus?" Lernender muss den Code mental durchgehen und die Ausgabe vorhersagen.

**Wissenschaftliche Grundlage:** Mental Simulation (Lister et al. 2004) — Code Tracing (mental durchgehen) ist eine Grundfaehigkeit die vielen Programmierern fehlt. Lister zeigte, dass Studierende die nicht Code tracen koennen, auch nicht Code schreiben koennen.

**Technische Implementierung:**
- Dateien: `tracing-data.ts` pro Lektion (4 Exercises)
- Engine: `tracing-engine.ts` (468 Zeilen)
- Interface: `TracingExercise { code, expectedOutput, stepByStep, concept }`

**Beispiel:**
```typescript
{
  code: `type Flatten<T> = T extends Array<infer U> ? U : T;
type A = Flatten<string[]>;
type B = Flatten<number>;
// Was sind A und B?`,
  expectedOutput: "A = string, B = number",
  stepByStep: [
    "Flatten<string[]>: string[] extends Array<infer U>? Ja! U = string. Ergebnis: string",
    "Flatten<number>: number extends Array<infer U>? Nein! Ergebnis: number"
  ],
  concept: "conditional-types"
}
```

**Einsatz:** Im Lesson-Menue.

---

### Format 9: Parson's Problems

**Beschreibung:** Codezeilen die in die richtige Reihenfolge gebracht werden muessen. Enthaelt 1-2 Distraktoren (falsche Zeilen die nicht gebraucht werden).

**Wissenschaftliche Grundlage:** Ericson et al. (2017) — Parson's Problems reduzieren kognitive Last im Vergleich zu vollstaendigem Code-Schreiben, weil der Lernende sich auf die *Struktur* konzentrieren kann statt auf Syntax.

**Technische Implementierung:**
- Dateien: `parsons-data.ts` pro Lektion (3-4 Problems)
- Engine: `parsons-engine.ts` (346 Zeilen)
- Interface: `ParsonsProblem { description, correctOrder: string[], distractors: string[] }`

**Einsatz:** Im Lesson-Menue.

---

### Format 10: Transfer Tasks

**Beschreibung:** Bekanntes Konzept in einem NEUEN Kontext anwenden. Bewusst ANDERS als Exercises — neues Szenario, nicht nur mehr vom Gleichen.

**Wissenschaftliche Grundlage:** Transfer Learning (Barnett & Ceci 2002) — "Near Transfer" (aehnlicher Kontext) ist leicht. "Far Transfer" (neuer Kontext) ist schwer, aber das eigentliche Ziel des Lernens.

**Technische Implementierung:**
- Dateien: `transfer-data.ts` pro Lektion (2-3 Tasks)
- Engine: `transfer-engine.ts` (251 Zeilen)
- Interface: `TransferTask { scenario, concepts, challenge, hints, exampleSolution }`

**Beispiel:**
```typescript
{
  scenario: "Du baust eine CLI-App die Konfigurationsdateien liest. Die Konfiguration kann JSON, YAML oder TOML sein.",
  concepts: ["discriminated-unions", "type-narrowing"],
  challenge: "Definiere einen Discriminated Union Type fuer die drei Formate und schreibe eine parseConfig()-Funktion mit exhaustive Check.",
  hints: ["Nutze ein 'format'-Feld als Discriminant", "switch + never fuer Exhaustive Check"],
  exampleSolution: "..."
}
```

**Einsatz:** Im Lesson-Menue, als letzte/schwerste Uebung.

---

### Format 11: Spaced Repetition Review

**Beschreibung:** Faellige Quiz-Fragen aus abgeschlossenen Lektionen. Intervalle steigen bei richtigen Antworten (1→2→4→8→16→30 Tage), fallen bei falschen zurueck auf 1.

**Wissenschaftliche Grundlage:** Spacing Effect (Cepeda et al. 2006) — Verteiltes Ueben ist nachweislich effektiver als Massing (alles am Stueck). SM-2-Algorithmus (Wozniak 1998).

**Technische Implementierung:**
- Engine: `review-runner.ts` (603 Zeilen)
- Persistierung: `state/review-{courseId}.json`
- Zugang: [R] im Hauptmenue oder `npm run review`

**Einsatz:** Automatisch empfohlen wenn faellige Reviews vorhanden sind.

---

### Format 12: Interleaved Reviews

**Beschreibung:** Gemischte Aufgaben aus verschiedenen Lektionen. 20 Templates mit 4 Aufgabentypen (predict-output, fix-error, complete-code, explain).

**Wissenschaftliche Grundlage:** Interleaving (Rohrer & Taylor 2007) — +43% Lerneffekt gegenueber Blocked Practice. Der Effekt entsteht, weil der Lernende nicht nur das Konzept abrufen muss, sondern auch *entscheiden* muss welches Konzept relevant ist.

**Technische Implementierung:**
- Engine: `interleave-engine.ts` (491 Zeilen)
- Templates: `interleave-data.ts` (538 Zeilen, 20 Templates)
- Zugang: [I] im Hauptmenue (nach 3+ abgeschlossenen Lektionen)

**Einsatz:** Empfohlen nach 3+ abgeschlossenen Lektionen, max alle 3 Tage.

---

## Geplante Formate (8)

---

### Format 13: POE-Bloecke (Predict-Observe-Explain) — GEPLANT

**Beschreibung:** Dreistufig: (1) Vorhersage machen, (2) Code ausfuehren, (3) Unterschied erklaeren. Eingebettet in Sektions-Markdown.

**Wissenschaftliche Grundlage:** White & Gunstone (1992) *Probing Understanding*. Die kognitive Dissonanz zwischen Erwartung und Realitaet erzeugt starke Lernmomente.

**Geplante Implementierung:**
Markdown-Syntax:
```markdown
> **Predict-Observe-Explain**
>
> ```typescript
> const arr = [1, "two", true];
> const filtered = arr.filter(x => typeof x === "number");
> ```
>
> **Predict:** Was ist der Typ von `filtered`? (a) number[] (b) (string|number|boolean)[]
> **Observe:** Fuehre aus: `npx tsx examples/poe-01.ts`
> **Explain:** Warum hat TypeScript hier den Typ richtig erkannt?
```

---

### Format 14: Kontrastive Paare — GEPLANT

**Beschreibung:** Zwei aehnliche Code-Beispiele nebeneinander die sich in einem kritischen Aspekt unterscheiden.

**Wissenschaftliche Grundlage:** Variation Theory (Marton 2014) — Um ein Konzept zu verstehen, muss man sehen was variiert und was konstant bleibt.

**Geplante Implementierung:**
```markdown
> **Kontrastpaar: type vs interface**
> ```typescript
> // A: interface
> interface User { name: string }
> interface User { age: number }     // OK — Declaration Merging!
>
> // B: type
> type User2 = { name: string }
> type User2 = { age: number }       // ERROR — Duplicate identifier!
> ```
> **Gleich:** Beide definieren Objektstrukturen.
> **Unterschiedlich:** Nur interface erlaubt Declaration Merging.
```

---

### Format 15: Feature Origin Stories — GEPLANT

**Beschreibung:** Die Geschichte *warum* ein TypeScript-Feature eingefuehrt wurde, *welches Problem* es loeste, *wer* es vorgeschlagen hat.

**Wissenschaftliche Grundlage:** Guzdial (2015) *Learner-Centered Design* — Narratives werden 6-7x besser erinnert als Fakten (Bruner 1986).

**Geplantes Beispiel:**
```markdown
> **Origin Story: Der `satisfies`-Operator (TS 4.9)**
>
> November 2022. Daniel Rosenwasser, der Lead des TypeScript-Teams,
> merged PR #46827. Es loest ein Problem das die Community seit 2017
> geplagt hat: Wie prueft man einen Typ OHNE die Inference zu verlieren?
> ...
```

---

### Format 16: Finde-den-Bug inline — GEPLANT

**Beschreibung:** Code-Block in einer Sektion mit einem versteckten Bug. Lernender soll ihn finden bevor die Aufloesung kommt.

---

### Format 17: "In deinem Projekt"-Bezuege — GEPLANT

**Beschreibung:** Explizite Verbindungen zu Angular/React-Code den der Lernende taeglich schreibt.

---

### Format 18: "Callback to Earlier"-Vernetzung — GEPLANT

**Beschreibung:** Verweise auf fruehere Lektionen ("Erinnerst du dich an Type Erasure aus L02? Hier siehst du warum das fuer Generics relevant ist...").

**Wissenschaftliche Grundlage:** Bjork (2011) — Vernetzung ueber Themen hinweg staerkt das Langzeitgedaechtnis und foerdert Transfer.

---

### Format 19: Aha-Moment-Demonstrationen — GEPLANT

**Beschreibung:** Code der *ueberraschend* funktioniert oder *ueberraschend* nicht funktioniert. Nutzt den Hypercorrection Effect.

**Wissenschaftliche Grundlage:** Kang et al. (2007) — Ueberraschungsmomente erzeugen starke Gedaechtnisspuren, besonders wenn der Lernende vorher sicher war, die Antwort zu kennen.

---

### Format 20: Framework-Rosetta-Stone — GEPLANT

**Beschreibung:** Gleiches Problem in Angular, React und Next.js geloest. Vergleichs-Challenge.

**Geplantes Beispiel:**
```
Aufgabe: Zeige eine Liste von Nutzern mit Lade-Indikator.

Angular:  @Component + Signal + HttpClient + @for
React:    useState + useEffect + .map() + Conditional
Next.js:  Server Component + Suspense + loading.tsx
```
