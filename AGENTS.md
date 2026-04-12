# AGENTS.md — Projekt-Kontext fuer Codex

## Projekt

Multi-Kurs-Lernplattform im Terminal (TUI) fuer TypeScript, Angular, React, Next.js.
Projektverzeichnis: `C:\Users\matth\Documents\Learning\`

**Philosophie:** Wissenschaftlich fundiertes Deep Learning mit 12 Lerntheorien, adaptiver Tiefe und 0 externen Runtime-Dependencies. Alles im Terminal, keine Web-App. **Lese-und-Denk-Flow** statt Aufgaben-Marathon — der Lernende bleibt im TUI und wird nie rausgerissen.

## Struktur

```
Learning/
├── platform/               <- TUI + Engines (Entry: platform/src/tui.ts)
│   ├── src/                <- 39 Module, 15.385 Zeilen
│   │   ├── tui.ts          <- Entry-Point
│   │   ├── tui-types.ts    <- Alle Interfaces (Screen ist Discriminated Union mit 20+ Varianten)
│   │   ├── tui-state.ts    <- Globaler State (1.001 Zeilen, importiert NICHTS von Screen-Modulen!)
│   │   ├── tui-render.ts   <- ANSI-Farben, Box-Drawing, flushScreen (ein write pro Frame)
│   │   ├── tui-input.ts    <- Raw-Mode Input-Parsing, Dispatch an Screen-Module
│   │   ├── tui-*.ts        <- 14 weitere Screen-Module (Platform, Main, Lesson, Section, Quiz, etc.)
│   │   ├── *-engine.ts     <- 10 Didaktik-Engines (Adaptive, Pretest, Interleave, Scaffolding, etc.)
│   │   ├── markdown-renderer.ts <- Markdown → Terminal (1.074 Zeilen, Syntax-Highlighting)
│   │   ├── diagram-renderer.ts  <- Mermaid → Box-Drawing (978 Zeilen)
│   │   └── ...
│   ├── state/              <- Runtime-State (progress-*.json, review-*.json, adaptive-state.json)
│   └── platform.json       <- Kurs-Registry (4 Kurse, Lock-System, Voraussetzungsketten)
│
├── typescript/              <- TypeScript-Kurs (20/40 Lektionen, Phase 1+2 fertig, ~935 Dateien)
├── angular/                 <- Angular-Kurs (nur CURRICULUM.md, 0 Lektionen)
├── react/                   <- React-Kurs (nur CURRICULUM.md, 0 Lektionen)
├── nextjs/                  <- Next.js-Kurs (nur CURRICULUM.md, 0 Lektionen)
├── docs/                    <- Ausfuehrliche Dokumentation (12 Dateien)
└── AGENTS.md                <- Diese Datei
```

## Ausfuehren

```bash
cd platform && npm start       # TUI starten (Haupteingang)
cd platform && npm run review  # Spaced Repetition
cd platform && npm run watch   # Watch-Runner (Rustlings-Stil)
```

## Regeln

### Sprache und Code
- **Alle Erklaerungen auf Deutsch**, Code auf Englisch
- **0 externe Runtime-Dependencies** (nur tsx, typescript, @types/node als devDeps)
- **TypeScript 5.7+** — TS 5.5 Inferred Type Predicates beachten! (`filter(x => x !== null)` gibt jetzt `T[]` statt `(T | null)[]`)

### Architektur
- **Circular Dependencies:** `tui-state.ts` importiert NICHTS von Screen-Modulen (tui-platform.ts, tui-main-menu.ts, etc.). Nur umgekehrt.
- **Flicker-free Rendering:** Ein einziger `process.stdout.write()` pro Frame. Gesamter Screen als String zusammenbauen.
- **Screen-State:** `Screen` ist eine Discriminated Union in `tui-types.ts` mit 20+ Varianten. Jede Variante enthaelt genau den State der fuer diesen Screen benoetigt wird.

### Didaktik und Qualitaet
- **Jede Sektion ~10 Min Lesezeit** (280-320 Zeilen)
- **Qualitaets-Checkliste** in `docs/04-QUALITY-PROCESS.md` STRIKT beachten bei neuen Lektionen!
- **Quiz-Format-Mix** (15+ Fragen pro Lektion, NICHT nur Multiple Choice!):
  - 6-8 Multiple Choice (correct-Indizes 4/4/4/3, Antwortlaengen gleichmaessig!)
  - 3-4 Kurzantwort/Lueckentext (Lernender tippt Antwort, z.B. "Welcher Typ? ___")
  - 2-3 Predict-the-Output (Code zeigen, Lernender tippt erwartete Ausgabe)
  - 1-2 Erklaere-warum (freie Texteingabe, dann Musterantwort zum Vergleich)
- **KEINE exercises/*.ts, solutions/*.ts, examples/*.ts** fuer neue Lektionen! Alles inline in Markdown oder TUI-interaktiv.
- **Experiment-Boxen:** Code INLINE zeigen und erklaeren, NICHT auf externe Dateien verweisen ("Oeffne examples/..." ist VERBOTEN fuer neue Inhalte).
- **Referenz-Lektion:** `typescript/02-primitive-types/` — dies ist der Qualitaets-Massstab
- **Maximal 3 neue Lektionen pro Agent-Run** — mehr fuehrt zu Qualitaets-Regression!
- **Nach jeder Session:** `docs/06-SESSION-LOG.md` aktualisieren

## Der Lernende

- Professioneller Entwickler (Angular beruflich, React/Next.js privat)
- Deutschsprachig
- Will echte Meisterschaft, kein oberflaechliches Tutorial
- Lernt in 10-Min-Haeppchen
- **Theoretischer Lerner** — liest lieber ausfuehrlich, denkt mit, bleibt im TUI-Flow
- **KEIN Wechsel zu IDE/Editor!** Externe Dateien oeffnen reisst aus dem Lernfluss
- **Quizzes sind das effektivste Format** — regen zum Nachdenken an, Kern des Systems!
- **Eigenverantwortlich:** Wenn er tiefer eintauchen will, entscheidet er das selbst. Nicht alles muss als Uebung aufbereitet werden.
- **Framework-Bezuege einbauen!** ("In deinem Angular-Projekt..." / "In React...")

## Didaktik

Basiert auf 12 Lerntheorien (7 implementiert, 5 geplant):

| # | Theorie | Hauptimplementierung |
|---|---------|---------------------|
| 1 | Cognitive Load Theory (Sweller 1988) | 10-Min-Sektionen, Code-Annotationen neben Code, Faded Examples |
| 2 | Testing Effect (Roediger 2011) | Quiz, Review-Runner, Pre-Tests, Warm-Up |
| 3 | Desirable Difficulties (Bjork 1994) | Interleaved Practice, Misconceptions, Transfer Tasks |
| 4 | Self-Explanation (Chi 1989) | Self-Explanation Prompts mit Auto-Pause im TUI |
| 5 | Expertise Reversal (Kalyuga 2003) | Pre-Test → adaptive Tiefe, Scaffolding-Level |
| 6 | Self-Determination Theory (Deci 2000) | Autonomie, Mastery-Levels, Framework-Bezuege |
| 7 | Metacognition (Dunning-Kruger) | Confidence-Prompts 1-4, 3-Phasen-Flow |

Details: `docs/03-DIDACTIC-FOUNDATIONS.md`

## Qualitaet

### Kern-Flow (PFLICHT — hier steckt 90% der Arbeit)

**Jede Sektion MUSS haben:**
1. "Was du hier lernst" (3-4 Bullet Points)
2. Mind. 1 Hintergrundgeschichte oder Origin Story
3. Mind. 1 Self-Explanation Prompt (Erklaere dir selbst:)
4. Mind. 1 Denkfrage (Denkfrage:)
5. Mind. 1 Experiment-Box — Code INLINE zeigen, NICHT auf externe Dateien verweisen!
6. Mind. 1 annotierter Code-Block (```typescript annotated)
7. Mind. 1 Framework-Bezug (Angular/React)
8. "Was du gelernt hast" + Kernkonzept am Ende
9. Pausenpunkt + Link zur naechsten Sektion

**Jede Lektion MUSS haben:**
- **Reichhaltige Sektionen** — DAS ist das Hauptprodukt. Tiefe Erklaerungen, Geschichten, Analogien, inline Code. Qualitaet > Quantitaet der Dateien.
- **15+ Quiz-Fragen im Format-Mix** (siehe Quiz-Format-Mix oben):
  - 6-8 Multiple Choice mit elaboratedFeedback, Antwortlaengen gleichmaessig
  - 3-4 Kurzantwort (type: "short-answer") — Generation Effect
  - 2-3 Predict-the-Output (type: "predict-output") — Code Comprehension
  - 1-2 Erklaere-warum (type: "explain-why") — Self-Explanation Effect
- **pretest-data.ts** — Pre-Test fuer adaptive Tiefe
- **cheatsheet.md** — Kompakte Referenz

### Vertiefung (OPTIONAL — nur erstellen wenn didaktisch sinnvoll)

Diese Formate existieren im TUI und koennen erstellt werden, sind aber KEIN Pflichtprogramm. Der Lernende entscheidet selbst ob er sie nutzt.

- Misconceptions (8) — gut wenn das Thema typische Fehlvorstellungen hat
- Completion Problems (6) — gut fuer Syntax-lastige Themen
- Debugging Challenges (5) — gut fuer fehleranfaellige Konzepte
- Parson's Problems (3-4) — gut fuer Reihenfolge-kritische Patterns
- Code-Tracing (4) — gut fuer Ausfuehrungs-Logik
- Transfer Tasks (2-3) — gut fuer Konzept-Transfer

**NICHT erstellen:**
- exercises/*.ts, solutions/*.ts, examples/*.ts, hints.json — Code gehoert inline in die Sektionen

**Faustregel fuer Agenten:** Investiere 80% der Zeit in grossartige Sektionen und Quizzes. Die optionalen Formate nur hinzufuegen wenn sie echten Mehrwert bieten, nicht als Pflichtprogramm abarbeiten.

Details: `docs/04-QUALITY-PROCESS.md`

## Bekannte Probleme

1. **Qualitaets-Regression:** Ab L13 sinkt die Qualitaet. IMMER gegen L02 als Referenz pruefen.
2. **Pretest-Bias:** correct-Index-Verteilung in pretest-data.ts noch nicht geprueft/gefixt.
3. **L17-L20 nicht auditiert:** Moegliche Qualitaetsprobleme wie bei L15/L16.
4. **Markdown-Tiefenmarker:** Designed aber nicht implementiert (siehe `docs/10-ADAPTIVE-SYSTEM.md`).

## Naechste Schritte (Prioritaet)

1. TypeScript Phase 3 (L21-L30) — mit STRIKTER Qualitaetskontrolle
2. Adaptives Tiefensystem (Markdown-Marker + filterByDepth)
3. Abwechslungsformate (POE, Kontrastpaare, Origin Stories)
4. TypeScript Phase 4 (L31-L40)
5. Framework-Kurse (Angular, React, Next.js)

## Dokumentation (docs/)

| Datei | Inhalt |
|-------|--------|
| `01-PROJECT-OVERVIEW.md` | Vision, alle Kurse, Metriken, Vergleich mit Plattformen |
| `02-ARCHITECTURE.md` | Alle 39 Module, Datenfluss, State, Rendering-Pipeline |
| `03-DIDACTIC-FOUNDATIONS.md` | 12 Lerntheorien mit Originalstudien und Umsetzung |
| `04-QUALITY-PROCESS.md` | Audits, Fixes, Checklisten, Regression-Analyse |
| `05-FEATURES.md` | Alle 25 Features mit Tasten, ASCII-UI, Technik |
| `06-SESSION-LOG.md` | Chronologisches Log aller Aenderungen |
| `07-NEXT-SESSION-PROMPT.md` | Copy-Paste-Prompt fuer naechste Session |
| `08-CURRICULUM-PLANS.md` | Alle 140 Lektionen aller 4 Kurse |
| `09-DIDACTIC-FORMATS.md` | 12 implementierte + 8 geplante Uebungsformate |
| `10-ADAPTIVE-SYSTEM.md` | Markdown-Marker, filterByDepth, UX-Flow |
| `11-FRAMEWORK-DIDACTICS.md` | 15 framework-spezifische Lernformate |
