# Projekt-Uebersicht: Multi-Kurs Lernplattform

> Letzte Aktualisierung: 2026-03-31

---

## 1. Vision und Philosophie

### Was ist das?

Eine vollstaendig eigenstaendige, Terminal-basierte Lernplattform (TUI — Text User Interface) fuer vier zusammenhaengende Technologien: **TypeScript**, **Angular**, **React** und **Next.js**. Kein Browser, keine Web-App, kein Cloud-Service — alles laeuft lokal im Terminal, mit Fullscreen-UI, Smooth Scrolling, Syntax-Highlighting und wissenschaftlich fundierter Didaktik.

Die Plattform wurde als **persoenliches Deep-Learning-Werkzeug** konzipiert: Ein professioneller Entwickler (Angular beruflich, React/Next.js privat) will nicht oberflaechliche Tutorials, sondern echte Meisterschaft aufbauen — systematisch, in kleinen Haeppchen, wissenschaftlich fundiert.

### Warum Terminal? Warum keine Web-App?

Die Entscheidung fuer ein Terminal-UI ist bewusst und aus mehreren Gruenden gefallen:

1. **Keine Ablenkungen:** Ein Browser hat Tabs, Benachrichtigungen, Lesezeichen. Das Terminal hat genau eines: den Inhalt. Forschung zum Multitasking (Ophir, Nass & Wagner 2009) zeigt, dass bereits die *Moeglichkeit* von Ablenkung die Lernleistung reduziert — selbst wenn man nicht abgelenkt wird.

2. **Arbeitsumgebung = Lernumgebung:** Der Lernende arbeitet taeglich im Terminal (VS Code Integrated Terminal, CLI-Tools, Git). Lernen in der gleichen Umgebung foerdert den Transfer (Godden & Baddeley 1975: Context-Dependent Memory). Die Tastenbelegungen aehneln vim/less, die Navigation ist vertraut.

3. **Sofort startbar:** `cd platform && npm start` — kein Server, kein Build, kein Login. Die Einstiegshuerde ist null. Dies ist entscheidend fuer Microlearning-Sessions von 10 Minuten: Wenn der Start 30 Sekunden dauert, verliert man 5% der Session an Overhead.

4. **Volle Kontrolle:** Das Terminal bietet Alternate Screen Buffers, ANSI-Escape-Codes fuer Farben und Positionierung, Raw Mode Input fuer Einzeltasten-Erkennung, und Mouse-Events. Die Plattform nutzt all das fuer eine reichhaltige UI — ohne eine einzige externe Dependency.

5. **Portabilitaet:** Funktioniert ueberall wo Node.js laeuft. Keine Datenbank, kein Docker, kein Account.

### Warum 0 externe Runtime-Dependencies?

Das Projekt hat **keine** Runtime-Dependencies — nur drei Dev-Dependencies:

```json
{
  "devDependencies": {
    "tsx": "^4.x",         // TypeScript-Executor (ts-node Alternative)
    "typescript": "^5.7",  // TypeScript-Compiler
    "@types/node": "^22.x" // Node.js Type-Definitionen
  }
}
```

Die Gruende:

1. **Langlebigkeit:** Externe Dependencies werden deprecated, aendern APIs, bekommen Breaking Changes. Dieses Projekt soll jahrelang funktionieren ohne `npm update`-Reparaturen.

2. **Verstaendnis:** Jede Zeile Code ist selbst geschrieben. Der Markdown-Renderer (1.074 Zeilen), der Diagram-Renderer (978 Zeilen), das Syntax-Highlighting, die ANSI-Farbverwaltung — alles eigener Code. Das ist selbst ein Lernprojekt.

3. **Startzeit:** Keine `node_modules`-Aufloesungskette beim Start. Das TUI ist in unter einer Sekunde bereit.

4. **Sicherheit:** Keine Supply-Chain-Attacks moeglich. Keine `npm audit`-Warnungen. Kein `event-stream`-Vorfall.

### Designprinzipien

| Prinzip | Umsetzung |
|---------|-----------|
| **Wissenschaftlich fundiert** | 7+ Lerntheorien mit Originalstudien (siehe `docs/03-DIDACTIC-FOUNDATIONS.md`) |
| **Microlearning** | Jede Sektion ~10 Minuten, jederzeit pausierbar |
| **Adaptive Tiefe** | Pre-Tests bestimmen ob Anfaenger- oder Fortgeschrittenen-Erklaerungen |
| **Autonomie** | Lernender waehlt Tiefe, Reihenfolge, Tempo — kein Zwang |
| **0 Dependencies** | Nur Node.js Built-ins, tsx, typescript |
| **Modular** | 39 TypeScript-Module statt Monolith |
| **Deutsch** | Alle Erklaerungen auf Deutsch, Code-Beispiele auf Englisch |

---

## 2. Die vier Kurse im Detail

### 2.1 TypeScript Deep Learning

**Status:** Aktiv — 20 von 40 Lektionen fertig (Phase 1 + 2 komplett)

**Umfang:**
- 40 geplante Lektionen in 4 Phasen
- 20 fertige Lektionen mit je 5-7 Sektionen, ~30-36 Dateien pro Lektion
- ~935 Dateien insgesamt (Sektionen, Beispiele, Exercises, Quiz, Pretest, Misconceptions, etc.)
- 20 Quiz-Dateien mit je 15 Fragen = 300 Quiz-Fragen
- 20 Pretest-Dateien, 20 Misconception-Dateien, 20 Completion-Problem-Dateien
- Geschaetzte Lernzeit: ~68 Stunden (212 Sektionen a 10 Min + Uebungen)

**Zielgruppe:** Entwickler die TypeScript beruflich nutzen und vom "Anwender" zum "Versteher" werden wollen. Kennt die Basics, will aber verstehen *warum* Dinge so funktionieren.

**Voraussetzungen:** JavaScript-Grundkenntnisse, Erfahrung mit einer IDE/einem Editor.

**Was der Kurs abdeckt:**
- **Phase 1 (L01-L10):** Fundament — Setup, Primitives, Inference, Arrays, Objects, Functions, Unions, Aliases, Enums, Review
- **Phase 2 (L11-L20):** Type System Core — Narrowing, Discriminated Unions, Generics, Generic Patterns, Utility Types, Mapped Types, Conditional Types, Template Literals, Modules, Review
- **Phase 3 (L21-L30):** Advanced — Classes, Advanced Generics, Recursive Types, Branded Types, Error Handling, Patterns, Declaration Merging, Decorators, tsconfig, Review
- **Phase 4 (L31-L40):** Mastery — Async, APIs, Testing, Performance, Migration, Library Authoring, Type-Level Programming, Compiler API, Best Practices, Capstone

**Einzigartiges Merkmal:** Jede Lektion hat nicht nur Text und Uebungen, sondern 12 verschiedene Uebungsformate (Quiz, Pre-Test, Completion Problems, Misconceptions, Code Tracing, Parson's Problems, Debugging, Transfer Tasks, etc.) — alle wissenschaftlich fundiert.

### 2.2 Angular Mastery

**Status:** Geplant — Curriculum fertig, 0 Lektionen erstellt

**Umfang:**
- 40 geplante Lektionen in 4 Phasen
- 212 geplante Sektionen
- Geschaetzte Lernzeit: ~68 Stunden

**Zielgruppe:** Der Lernende nutzt Angular beruflich. Dieser Kurs ist kein "Angular lernen"-Kurs, sondern ein "Angular *verstehen*"-Kurs. Nicht Rezepte, sondern Architektur und Design-Entscheidungen.

**Voraussetzungen:** TypeScript Phase 1-2 abgeschlossen (Lektion 20). Das Lock-System der Plattform erzwingt dies, mit Override-Moeglichkeit.

**Besonderheiten:**
- Erklaert das **Warum** hinter Angular-Designentscheidungen
- Vergleiche zu React wo sie das Verstaendnis vertiefen
- Abdeckung von Angular 17/18/19 Features (Signals, @if/@for/@switch, Standalone Components)
- Spezielle Didaktik-Formate: Marble Diagrams fuer RxJS, DI-Baum-Tracer, Change-Detection-Simulator

### 2.3 React mit TypeScript

**Status:** Geplant — Curriculum fertig, 0 Lektionen erstellt

**Umfang:**
- 40 geplante Lektionen in 4 Phasen (R01-R40)
- 200 geplante Sektionen
- Geschaetzte Lernzeit: ~140 Stunden (umfangreicher wegen Ecosystem-Abdeckung)

**Zielgruppe:** Angular-Entwickler der React als zweites mentales Modell aufbaut. Kein Anfaenger-Kurs — der Lernende kennt Component-basierte Architektur, aber muss das React-Paradigma ("UI = f(state)") verinnerlichen.

**Voraussetzungen:** TypeScript Phase 1-2 abgeschlossen.

**Besonderheiten:**
- Explizite Angular-Vergleiche ("In Angular machst du X, in React stattdessen Y — und hier ist *warum*")
- Unidirektionaler Datenfluss und Immutability als zentrale Konzepte
- JSX als JavaScript-Ausdruecke (nicht als Template)
- Spezielle Didaktik-Formate: Re-Render-Simulator, Mutation-Detective, useEffect-Synchronisationsanalyse

### 2.4 Next.js Production

**Status:** Geplant — Curriculum fertig, 0 Lektionen erstellt

**Umfang:**
- 20 geplante Module in 4 Phasen (N01-N20) — kompakter als die anderen Kurse
- 100 geplante Sektionen
- Geschaetzte Lernzeit: ~60 Stunden

**Zielgruppe:** React-Entwickler der Full-Stack-Faehigkeiten mit dem App Router aufbauen will.

**Voraussetzungen:** React Phase 1-2 abgeschlossen (Lektion R20).

**Besonderheiten:**
- Server Components als Paradigmenwechsel (eigene Lektion)
- Caching als komplexestes Thema (eigene Lektion mit 4 Caching-Schichten)
- Deployment auf verschiedenen Plattformen (Vercel, Docker, Self-hosted)
- Spezielle Didaktik-Formate: Server/Client-Grenze-Visualisierung, Caching-Schichten-Simulator

---

## 3. Roadmap und Zeitplaene

### Kurzfristig (naechste 2-3 Sessions)

| Prioritaet | Aufgabe | Geschaetzter Aufwand |
|:-----------:|---------|:--------------------:|
| 1 | TypeScript Phase 3 (L21-L30) | ~3 Sessions |
| 2 | Adaptives Tiefensystem implementieren | ~1 Session |
| 3 | Abwechslungsformate einbauen (POE, Kontrastpaare, etc.) | ~1 Session |

### Mittelfristig (nach TypeScript-Kurs)

| Prioritaet | Aufgabe | Geschaetzter Aufwand |
|:-----------:|---------|:--------------------:|
| 4 | TypeScript Phase 4 (L31-L40) | ~3 Sessions |
| 5 | Angular-Kurs Lektionen erstellen (40 Lektionen) | ~8-10 Sessions |
| 6 | React-Kurs Lektionen erstellen (40 Lektionen) | ~8-10 Sessions |

### Langfristig

| Prioritaet | Aufgabe | Geschaetzter Aufwand |
|:-----------:|---------|:--------------------:|
| 7 | Next.js-Kurs Module erstellen (20 Module) | ~4-5 Sessions |
| 8 | Framework-spezifische Didaktik-Engines | ~2-3 Sessions |
| 9 | Config-Screen, Theme-Switching, Progress-Export | ~1 Session |

### Gesamtumfang-Schaetzung

| Metrik | Aktuell | Geplant (alle 4 Kurse) |
|--------|:-------:|:----------------------:|
| Lektionen | 20 | 140 |
| Sektionen | ~120 | ~724 |
| Quiz-Fragen | ~300 | ~2.100 |
| Exercises | ~120 | ~840 |
| Misconceptions | ~160 | ~1.120 |
| Completion Problems | ~120 | ~840 |
| Debugging Challenges | ~100 | ~700 |
| Code-Tracing Exercises | ~80 | ~560 |
| Parson's Problems | ~70 | ~490 |
| Transfer Tasks | ~50 | ~350 |
| Dateien gesamt | ~935 | ~6.500+ |
| Plattform-Code (platform/src/) | 15.385 Zeilen | ~18.000+ Zeilen |

---

## 4. Metriken und Zahlen (aktueller Stand)

### Plattform (platform/src/)

| Metrik | Wert |
|--------|-----:|
| TypeScript-Module | 39 |
| Gesamte Codezeilen | 15.385 |
| TUI-Module (tui-*.ts) | 19 |
| Didaktik-Engines | 10 |
| Rendering-Module | 3 |
| Sonstige Module | 7 |
| Groesstes Modul | markdown-renderer.ts (1.074 Zeilen) |
| Kleinstes Modul | tui-help.ts (73 Zeilen) |

### TypeScript-Kurs (typescript/)

| Metrik | Wert |
|--------|-----:|
| Erstellte Lektionen | 20 von 40 |
| Dateien gesamt | ~935 |
| Sektionen (Markdown) | ~120 |
| Quiz-Fragen | ~300 (15 pro Lektion) |
| Pretest-Fragen | ~360 (3 pro Sektion, ~6 Sektionen) |
| Misconceptions | ~160 (8 pro Lektion) |
| Completion Problems | ~120 (6 pro Lektion) |
| Debugging Challenges | ~100 (5 pro Lektion) |
| Parson's Problems | ~70 (3-4 pro Lektion) |
| Code-Tracing Exercises | ~80 (4 pro Lektion) |
| Transfer Tasks | ~50 (2-3 pro Lektion) |

### Verzeichnisstruktur

```
C:\Users\matth\Documents\Learning\
├── platform/                  <- Lernplattform (TUI + Engines)
│   ├── package.json           <- 0 Runtime-Dependencies
│   ├── tsconfig.json
│   ├── platform.json          <- Kurs-Registry (4 Kurse)
│   ├── src/                   <- 39 TypeScript-Module (15.385 Zeilen)
│   │   ├── tui.ts             <- Entry-Point (143 Zeilen)
│   │   ├── tui-types.ts       <- Alle Interfaces (269 Zeilen)
│   │   ├── tui-state.ts       <- Globaler State (1.001 Zeilen)
│   │   ├── tui-render.ts      <- ANSI-Farben, Box-Drawing, flushScreen (267 Zeilen)
│   │   ├── tui-input.ts       <- Tastatur-/Maus-Input-Verarbeitung (222 Zeilen)
│   │   ├── tui-platform.ts    <- Kursauswahl-Screen (590 Zeilen)
│   │   ├── tui-main-menu.ts   <- Hauptmenue mit Lektionsliste (400 Zeilen)
│   │   ├── tui-lesson-menu.ts <- Lektionsmenue (424 Zeilen)
│   │   ├── tui-section-reader.ts <- Markdown-Reader (584 Zeilen)
│   │   ├── tui-quiz.ts        <- Quiz/Pretest/Warmup/Interleaved (481 Zeilen)
│   │   ├── tui-exercises.ts   <- Exercise-Menue (310 Zeilen)
│   │   ├── tui-challenges.ts  <- Misconceptions/Completion (256 Zeilen)
│   │   ├── tui-search.ts      <- Volltextsuche (132 Zeilen)
│   │   ├── tui-bookmarks.ts   <- Lesezeichen (81 Zeilen)
│   │   ├── tui-stats.ts       <- Kompetenz-Dashboard (180 Zeilen)
│   │   ├── tui-help.ts        <- Shortcut-Hilfe Overlay (73 Zeilen)
│   │   ├── tui-history.ts     <- Navigations-History (91 Zeilen)
│   │   ├── tui-tts.ts         <- Text-to-Speech (176 Zeilen)
│   │   ├── tui-utils.ts       <- Child-Process, VS Code, Config (482 Zeilen)
│   │   ├── tui-redraw.ts      <- Terminal-Resize Handler (122 Zeilen)
│   │   ├── markdown-renderer.ts  <- Markdown → Terminal (1.074 Zeilen)
│   │   ├── diagram-renderer.ts   <- Mermaid → Box-Drawing (978 Zeilen)
│   │   ├── visual-utils.ts       <- Sparklines, Charts (425 Zeilen)
│   │   ├── adaptive-engine.ts    <- Adaptive Tiefe/Scaffolding (505 Zeilen)
│   │   ├── pretest-engine.ts     <- Pre-Test Engine (430 Zeilen)
│   │   ├── interleave-engine.ts  <- Interleaved Review (491 Zeilen)
│   │   ├── interleave-data.ts    <- 20 Challenge-Templates (538 Zeilen)
│   │   ├── scaffolding-engine.ts <- Hint-Level-Steuerung (460 Zeilen)
│   │   ├── tracing-engine.ts     <- Code-Tracing (468 Zeilen)
│   │   ├── parsons-engine.ts     <- Parson's Problems (346 Zeilen)
│   │   ├── debugging-engine.ts   <- Debugging Challenges (409 Zeilen)
│   │   ├── transfer-engine.ts    <- Transfer Tasks (251 Zeilen)
│   │   ├── review-runner.ts      <- Spaced Repetition (603 Zeilen)
│   │   ├── watch-runner.ts       <- Rustlings-Stil Watcher (825 Zeilen)
│   │   ├── quiz-runner.ts        <- Quiz-Ausfuehrung (199 Zeilen)
│   │   ├── hint.ts               <- Progressive Hints (388 Zeilen)
│   │   ├── playground-link.ts    <- TS Playground Links (255 Zeilen)
│   │   ├── config.ts             <- User-Config (217 Zeilen)
│   │   └── themes.ts             <- 3 Farbthemen (239 Zeilen)
│   └── state/                 <- Runtime-State (Progress, Reviews, Config)
│       ├── progress-typescript.json
│       ├── review-typescript.json
│       └── adaptive-state.json
│
├── typescript/                <- TypeScript-Kurs (20/40 Lektionen)
│   ├── CURRICULUM.md          <- 40-Lektionen-Lehrplan
│   ├── tools/                 <- Kurs-spezifisch (type-test.ts, quiz-runner.ts)
│   ├── 01-setup-und-erste-schritte/
│   ├── 02-primitive-types/
│   │   ├── README.md
│   │   ├── sections/          <- 6 Markdown-Sektionen
│   │   ├── examples/          <- Lauffaehige .ts Dateien
│   │   ├── exercises/         <- TODOs zum Loesen
│   │   ├── solutions/         <- Loesungen mit Erklaerungen
│   │   ├── quiz-data.ts       <- 15 Quiz-Fragen
│   │   ├── pretest-data.ts    <- Pre-Test-Fragen
│   │   ├── misconceptions.ts  <- 8 Fehlkonzeptionen
│   │   ├── completion-problems.ts
│   │   ├── debugging-data.ts
│   │   ├── parsons-data.ts
│   │   ├── tracing-data.ts
│   │   ├── transfer-data.ts
│   │   ├── hints.json
│   │   └── cheatsheet.md
│   ├── ...
│   └── 20-review-challenge-phase-2/
│
├── angular/                   <- Angular-Kurs (Curriculum fertig, 0 Lektionen)
│   └── CURRICULUM.md
├── react/                     <- React-Kurs (Curriculum fertig, 0 Lektionen)
│   └── CURRICULUM.md
├── nextjs/                    <- Next.js-Kurs (Curriculum fertig, 0 Lektionen)
│   └── CURRICULUM.md
│
├── docs/                      <- Diese Dokumentation (12 Dateien)
└── CLAUDE.md                  <- Projekt-Kontext fuer Claude Code
```

---

## 5. Vergleich mit anderen Lernplattformen

### Execute Program (Gary Bernhardt)

| Merkmal | Execute Program | Dieses Projekt |
|---------|:--------------:|:--------------:|
| Umgebung | Web-Browser | Terminal (TUI) |
| Sprachen | TypeScript, SQL, JS, Regex | TypeScript, Angular, React, Next.js |
| Didaktik | Spaced Repetition, Code-Ausfuehrung | 7+ Lerntheorien, 12 Uebungsformate |
| Adaptivitaet | Fixe Lektion + Review | Pre-Test → adaptive Tiefe |
| Uebungsformate | Fill-in-the-blank, Code-Ausfuehrung | 12 Formate (inkl. Tracing, Parsons, Transfer) |
| Kosten | Abo-Modell ($39/Monat) | Kostenlos (eigenes Projekt) |
| Personalisierung | Keine | Tiefe, Tempo, Reihenfolge waehlbar |
| Offline | Nein | Ja (alles lokal) |

**Was dieses Projekt anders macht:** Execute Program ist exzellent fuer Spaced Repetition, aber hat genau *ein* Uebungsformat. Dieses Projekt bietet 12 verschiedene Formate, jedes wissenschaftlich fundiert. Ausserdem adaptive Tiefe: Wer schon etwas weiss, bekommt kompaktere Erklaerungen (Expertise Reversal Effect).

### Total TypeScript (Matt Pocock)

| Merkmal | Total TypeScript | Dieses Projekt |
|---------|:----------------:|:--------------:|
| Format | Video + Exercises | Text + 12 Formate |
| Sprache | Englisch | Deutsch |
| Umgebung | Web-Browser + VS Code | Terminal (TUI) |
| Didaktik | Aufgaben-basiert | Theorie-fundiert mit Lernforschung |
| Uebungsformate | Type Challenges | 12 Formate |
| Review | Kein Spaced Repetition | SM-2-aehnliches System |
| Metacognition | Keine | Confidence-Prompts, Kalibrierung |

**Was dieses Projekt anders macht:** Total TypeScript hat brillante Exercises, aber ist rein aufgabenbasiert. Es fehlt die wissenschaftliche Fundierung: kein Pre-Test, keine Self-Explanation-Prompts, kein Spaced Repetition, keine Metacognitive Prompts. Dieses Projekt integriert all das.

### Exercism

| Merkmal | Exercism | Dieses Projekt |
|---------|:--------:|:--------------:|
| Umgebung | Web + CLI | Terminal (TUI) |
| Fokus | Viele Sprachen, Community | 4 Technologien, personalisiert |
| Didaktik | Practice-based | Theorie + Practice, wissenschaftlich |
| Community | Mentoring, Diskussion | Solo-Lernen |
| Erklaerungen | Minimal | Tiefgruendig mit Geschichten |
| Framework-Bezug | Keiner | Angular/React-Vergleiche in jeder Sektion |

**Was dieses Projekt anders macht:** Exercism ist grossartig fuer Practice, aber erklaert wenig *warum* etwas so funktioniert. Dieses Projekt erzaehlt Hintergrundgeschichten (z.B. "Warum hat Anders Hejlsberg Type Erasure gewaehlt?"), gibt Framework-Bezuege ("In deinem Angular-Projekt nutzt du das bei..."), und hat Denkfragen die zum Nachdenken zwingen statt nur zum Tippen.

### Zusammenfassung der Alleinstellungsmerkmale

1. **12 wissenschaftlich fundierte Uebungsformate** statt nur einem
2. **Adaptive Tiefe** basierend auf Pre-Tests (Expertise Reversal Effect)
3. **Metacognitive Prompts** ("Wie sicher bist du?") fuer bessere Selbsteinschaetzung
4. **Self-Explanation-Prompts** mit automatischer Pause im TUI
5. **Hintergrundgeschichten** fuer jedes Feature (warum wurde es so designed?)
6. **Framework-Bezuege** in jeder Sektion (Angular/React)
7. **Spaced Repetition** mit SM-2-aehnlichen Intervallen
8. **Interleaved Practice** mit gemischten Challenges aus mehreren Lektionen
9. **0 Dependencies** — laeuft ueberall, ewig
10. **Deutsch** — keine Uebersetzungs-Overhead beim Lernen

---

## 6. Ausfuehren

```bash
# TUI starten (Haupteingang)
cd platform && npm start

# Spaced Repetition Review starten
cd platform && npm run review

# Watch-Runner fuer Exercises (Rustlings-Stil)
cd platform && npm run watch

# Einzelne Lektion direkt oeffnen
cd typescript/02-primitive-types && npx tsx quiz.ts
```

---

## 7. Der Lernende

- **Beruf:** Professioneller Softwareentwickler
- **Primaeres Framework:** Angular (beruflich, taeglich)
- **Sekundaeres Framework:** React/Next.js (private Projekte)
- **Sprache:** Deutschsprachig (alle Erklaerungen auf Deutsch, Code auf Englisch)
- **Lernstil:** Will echte, tiefe Meisterschaft — kein oberflaechliches Tutorial, kein "Copy-Paste-and-pray"
- **Zeitbudget:** Lernt in ~10-Minuten-Haeppchen mit Pausen dazwischen (Microlearning)
- **TypeScript-Level:** Nutzt TypeScript taeglich, kennt die Basics, will aber verstehen *warum* Generics so funktionieren, *warum* Mapped Types so powerful sind, *wie* der Compiler intern arbeitet

---

## 8. Verwandte Dokumentation

| Datei | Inhalt |
|-------|--------|
| `docs/02-ARCHITECTURE.md` | Technischer Aufbau: Alle 39 Module, Datenfluss, State, Rendering |
| `docs/03-DIDACTIC-FOUNDATIONS.md` | Wissenschaftliche Grundlagen: 12 Lerntheorien mit Studien |
| `docs/04-QUALITY-PROCESS.md` | Qualitaetssicherung: Audits, Fixes, Checklisten |
| `docs/05-FEATURES.md` | Alle 25 Features mit Tastenbelegungen und Technik |
| `docs/06-SESSION-LOG.md` | Was wurde wann gemacht |
| `docs/07-NEXT-SESSION-PROMPT.md` | Uebergabe-Prompt fuer die naechste Session |
| `docs/08-CURRICULUM-PLANS.md` | Alle Kurs-Curricula im Detail |
| `docs/09-DIDACTIC-FORMATS.md` | Alle Uebungsformate im Detail |
| `docs/10-ADAPTIVE-SYSTEM.md` | Geplantes adaptives Tiefensystem |
| `docs/11-FRAMEWORK-DIDACTICS.md` | Framework-spezifische Lernmethoden |
| `CLAUDE.md` | Kontext fuer Claude Code |
