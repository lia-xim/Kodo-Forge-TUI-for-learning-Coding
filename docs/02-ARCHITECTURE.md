# Architektur: Technischer Aufbau

> Letzte Aktualisierung: 2026-03-31

---

## 1. Architektur-Ueberblick

Die Plattform besteht aus **39 TypeScript-Modulen** in `platform/src/` mit insgesamt **15.385 Codezeilen**. Keine externe Runtime-Dependency — nur Node.js Built-ins (fs, path, child_process, url, readline).

Die Module sind in vier Kategorien organisiert:

```
platform/src/
├── tui.ts                     <- Entry-Point
├── tui-*.ts (19 Module)       <- TUI: Screens, Input, State, Rendering
├── *-engine.ts (10 Module)    <- Didaktik-Engines
├── markdown-renderer.ts  }
│   diagram-renderer.ts   }    <- Rendering-Module (3)
│   visual-utils.ts       }
└── Sonstige (7 Module)        <- Watch-Runner, Hints, Config, Themes, etc.
```

---

## 2. Alle 39 Module im Detail

### 2.1 Entry-Point

| Modul | Zeilen | Exports | Imports von | Verantwortung |
|-------|-------:|---------|-------------|---------------|
| `tui.ts` | 143 | — (Entry) | tui-render, tui-state, adaptive-engine, tui-input, tui-utils, tui-platform, tui-redraw | Startet die Applikation, registriert Event-Listener (stdin, resize, SIGINT, uncaughtException), ruft `main()` auf, Cleanup bei Exit |

**Wichtige Details:**
- Registriert `process.on("exit", cleanup)` — stellt sicher dass der Alternate Screen Buffer *immer* verlassen wird
- Registriert `process.on("uncaughtException")` — auch bei Crash wird cleanup ausgefuehrt
- Ruft `loadPlatformConfig()` auf um `platform.json` zu laden
- Ruft `discoverLessons()` auf um die Lektionsverzeichnisse des aktiven Kurses zu finden
- Aktiviert Alternate Screen Buffer, Raw Mode, Mouse Tracking
- Delegiert an `renderPlatformScreen()` fuer den ersten Screen

### 2.2 TUI-Module (19 Module, ~5.700 Zeilen)

| # | Modul | Zeilen | Exportierte Funktionen | Importiert von | Verantwortung |
|---|-------|-------:|------------------------|----------------|---------------|
| 1 | `tui-types.ts` | 269 | PlatformCourse, PlatformConfig, CourseProgressSummary, LessonInfo, SectionInfo, Bookmark, SectionProgress, MasteryLevel, Misconception, CompletionProblem, Screen (Discriminated Union mit 20+ Varianten), SearchResult, ProgressData, ParsedKey | markdown-renderer, pretest-engine, interleave-engine | Alle Interfaces und Type-Definitionen. Screen ist eine Discriminated Union die JEDEN moeglichen Zustand des TUI abbildet. |
| 2 | `tui-state.ts` | 1.001 | W(), H(), currentScreen, lessons, progress, platformConfig, 40+ Setter/Getter, discoverLessons(), loadProgress(), saveProgress(), calculateMastery(), getBreadcrumb(), formatSessionTime(), pushHistory(), shortcutsForScreen | tui-types, markdown-renderer, adaptive-engine | Globaler State der Applikation. Enthaelt ALLE globalen Variablen, Pfad-Konstanten, Session-Timer, Navigation History, TTS-State, Adaptive State. IMPORTIERT NICHTS von Screen-Modulen (verhindert Circular Dependencies). |
| 3 | `tui-render.ts` | 267 | c (ANSI-Farben), ENTER_ALT_SCREEN, LEAVE_ALT_SCREEN, HIDE_CURSOR, SHOW_CURSOR, flushScreen(), renderHeader(), renderFooter(), progressBar(), boxTop/Bottom/Sep(), bLine(), bEmpty(), computeScrollbar(), wordWrap(), getContentHeight(), clampScrollOffset(), visLen(), truncate(), padR(), center() | tui-state, markdown-renderer | Alle Rendering-Utilities: ANSI-Escape-Codes, Box-Drawing-Zeichen, Scrollbar-Berechnung, Layout-Hilfsfunktionen, flicker-free Screen-Output. |
| 4 | `tui-input.ts` | 222 | parseKey(), handleInput() | tui-state, tui-render, alle Screen-Module | Verarbeitet Raw-Mode-Input: Pfeiltasten, Page Up/Down, Home/End, Mouse Scroll, Ctrl+C. Dispatcht an das richtige Screen-Modul basierend auf `currentScreen.type`. |
| 5 | `tui-platform.ts` | 590 | renderPlatformScreen(), handlePlatformInput() | tui-state, tui-render, tui-utils, tui-types | Kursauswahl-Screen mit responsivem Bento-Grid. 3 Layout-Modi: 2x2 Grid (>=100 Spalten), 1-Spalte (80-99), Ultra-Kompakt (<80). Lock-System fuer Kurse mit Voraussetzungen (mit Override-Moeglichkeit). Dynamische Statistiken von der Festplatte. |
| 6 | `tui-main-menu.ts` | 400 | renderMainMenu(), handleMainMenuInput() | tui-state, tui-render, tui-utils | Hauptmenue mit scrollbarer Lektionsliste. Resume-Banner ("Weitermachen bei L05 S3"). Empfehlung basierend auf Fortschritt. Zugang zu Review, Interleaved, Kompetenz-Dashboard, Suche, Lesezeichen. |
| 7 | `tui-lesson-menu.ts` | 424 | renderLessonMenu(), handleLessonMenuInput() | tui-state, tui-render, tui-utils | Lektionsmenue: Liste aller Sektionen mit Fortschrittsstatus. Zugang zu Exercises, Quiz, Hints, Cheatsheet, Misconceptions, Completion Problems. Pre-Test-Angebot vor jeder Sektion. |
| 8 | `tui-section-reader.ts` | 584 | renderSectionReader(), handleSectionReaderInput() | tui-state, tui-render, markdown-renderer, tui-tts | Markdown-Reader mit Smooth Scrolling. Erkennt Self-Explanation-Prompts und pausiert automatisch. Zeigt Scrollbar, Lesezeit, Scroll-Prozent im Footer. Integriert TTS (Text-to-Speech). |
| 9 | `tui-quiz.ts` | 481 | renderWarmup(), renderPretest(), renderQuiz(), renderInterleaved(), handleQuizInput() | tui-state, tui-render, pretest-engine, interleave-engine | Vereinheitlichtes Quiz-Modul fuer 4 Varianten: Warmup, Pre-Test, Standard-Quiz, Interleaved Review. Alle mit 3-Phasen-Flow: Frage → Confidence ("Wie sicher bist du?") → Feedback. |
| 10 | `tui-exercises.ts` | 310 | renderExerciseMenu(), handleExerciseMenuInput() | tui-state, tui-render, tui-utils | Exercise-Menue mit 4 Stufen: [1] Worked Examples, [2] Completion Problems, [3] Full Exercises, [4] Misconceptions. Startet Watch-Runner als Child-Process. Oeffnet VS Code automatisch. |
| 11 | `tui-challenges.ts` | 256 | renderMisconceptions(), renderCompletion(), handleChallengesInput() | tui-state, tui-render | Misconception-Challenges: Zeigt Code + "Was glaubst du passiert?" + Aufloesung. Completion Problems: Lueckentext mit Hinweisen, stufenweise Schwierigkeit. |
| 12 | `tui-search.ts` | 132 | renderSearchScreen(), handleSearchInput() | tui-state, tui-render | Volltextsuche ueber alle Sektionen. Live-Suche mit Debounce (150ms). Zeigt Kontext-Zeilen. Enter springt zur gefundenen Sektion an der richtigen Scroll-Position. |
| 13 | `tui-bookmarks.ts` | 81 | renderBookmarks(), handleBookmarksInput() | tui-state, tui-render | Lesezeichen-Verwaltung: Setzen (M), Anzeigen (B), Loeschen (X). Speichert Lektion, Sektion, Scroll-Offset, Datum. |
| 14 | `tui-stats.ts` | 180 | renderStatsScreen(), handleStatsInput() | tui-state, tui-render, visual-utils | Kompetenz-Dashboard mit beschreibendem Feedback. Sparklines fuer 7-Tage-Aktivitaet. Mastery-Level pro Lektion. Empfehlungen. |
| 15 | `tui-help.ts` | 73 | renderHelpOverlay(), handleHelpInput() | tui-state, tui-render | Kontextabhaengiges Hilfe-Overlay. Zeigt alle Tastenbelegungen des aktuellen Screens. Wird mit [?] oder [F1] ausgeloest. |
| 16 | `tui-history.ts` | 91 | renderHistory(), handleHistoryInput() | tui-state, tui-render | Navigations-History: Ring-Buffer der letzten 20 besuchten Stellen. Deduplizierung (gleicher Screen wird nicht doppelt gespeichert). |
| 17 | `tui-tts.ts` | 176 | startTTS(), stopTTS(), toggleTTS() | tui-state | Text-to-Speech mit Windows PowerShell Speech Synthesizer. Liest ab aktueller Scroll-Position. Absatzweise. Deutsche Stimme (Microsoft Katja). Toggle mit [L]. |
| 18 | `tui-utils.ts` | 482 | cleanup(), exitTui(), loadPlatformConfig(), openInVSCode(), startWatchRunner(), openMermaidInBrowser(), getCourseProgressSummary() | tui-state, tui-render, tui-types | Utility-Funktionen: Child-Process-Management, VS Code Integration, Mermaid-Browser-Anzeige, Plattform-Config-Laden, dynamische Kurs-Statistiken. |
| 19 | `tui-redraw.ts` | 122 | redraw() | tui-state, tui-render, alle Screen-Module | Terminal-Resize-Handler. Lauscht auf SIGWINCH, aktualisiert W/H, rendert den aktuellen Screen neu. Switch-Case ueber alle Screen-Typen. |

### 2.3 Didaktik-Engines (10 Module, ~4.878 Zeilen)

| # | Engine | Datei | Zeilen | Exportierte Typen/Funktionen | Verantwortung |
|---|--------|-------|-------:|------------------------------|---------------|
| 1 | Quiz-Runner | `quiz-runner.ts` | 199 | runQuiz(), QuizQuestion | Standalone-Quiz im Terminal (wird auch direkt per `npx tsx quiz.ts` aufgerufen). Farben, Score-Berechnung, elaboriertes Feedback. |
| 2 | Review-Runner | `review-runner.ts` | 603 | runReview(), ReviewItem, ReviewData | Spaced Repetition System. SM-2-aehnliche Intervallberechnung (1→2→4→8→16→30 Tage). Laedt faellige Fragen aus allen abgeschlossenen Lektionen. Persistiert in `state/review-*.json`. |
| 3 | Pretest-Engine | `pretest-engine.ts` | 430 | loadPretestQuestions(), calculateDepth(), getWarmupQuestions(), PretestQuestion, PretestResult | Laedt Pre-Test-Fragen aus Lektionsverzeichnissen. Berechnet empfohlene Tiefe (kurz/standard/vollstaendig). Generiert Warm-Up-Fragen aus abgeschlossenen Lektionen. |
| 4 | Adaptive-Engine | `adaptive-engine.ts` | 505 | loadAdaptiveState(), saveAdaptiveState(), getRecommendations(), getScaffoldingLevel(), updateConceptScore(), AdaptiveState, ContentDepth, Recommendation | Verwaltet adaptiven Lernzustand: Tiefe pro Sektion, Performance pro Konzept, Hint-Level pro Exercise, Scaffolding-Level. Schwellenwerte: <30% → Level 3 (Worked Example), <50% → Level 2 (starke Hints), <70% → Level 1 (leichte Hints), >=70% → Level 0 (kein Scaffolding). |
| 5 | Interleave-Engine | `interleave-engine.ts` | 491 | getInterleavedItems(), isInterleaveReviewDue(), InterleavedItem, InterleaveChallenge, ConceptTag | Generiert gemischte Review-Challenges aus mehreren Lektionen. Filtert nach abgeschlossenen Lektionen. Zeitbasierte Pruefung ob Review faellig. 20 Templates in `interleave-data.ts`. |
| 6 | Interleave-Data | `interleave-data.ts` | 538 | challengeTemplates, ChallengeTemplate | 20 vordefinierte Challenge-Templates fuer Interleaved Practice. Typen: predict-output, fix-error, complete-code, explain. Jedes Template hat Konzept-Tags, Code, Antwort, Erklaerung. |
| 7 | Scaffolding-Engine | `scaffolding-engine.ts` | 460 | calculateScaffoldingLevel(), getScaffoldingHints(), ScaffoldingLevel | Berechnet Scaffolding-Level basierend auf Performance. Passt Hint-Level dynamisch an: steigt bei Fehlern, sinkt bei Erfolgen. Mindestens 2 Antworten bevor Anpassung. |
| 8 | Tracing-Engine | `tracing-engine.ts` | 468 | loadTracingExercises(), TracingExercise | Laedt Code-Tracing-Exercises aus Lektionsverzeichnissen. Format: Code-Block + "Was gibt dieses Programm aus?" + Schritt-fuer-Schritt-Aufloesung. |
| 9 | Parsons-Engine | `parsons-engine.ts` | 346 | loadParsonsProblems(), ParsonsProblem | Laedt Parson's Problems: Codezeilen muessen in die richtige Reihenfolge gebracht werden. Enthaelt Distraktoren (falsche Zeilen). |
| 10 | Debugging-Engine | `debugging-engine.ts` | 409 | loadDebuggingChallenges(), DebuggingChallenge | Laedt Debugging-Challenges: Code mit Bug + Fehlerbeschreibung. Lernender muss Bug finden und Fix beschreiben. |
| 11 | Transfer-Engine | `transfer-engine.ts` | 251 | loadTransferTasks(), TransferTask | Laedt Transfer Tasks: Bekanntes Konzept in neuem Kontext anwenden. Bewusst ANDERS als Exercises — neues Szenario, nicht nur mehr vom Gleichen. |

### 2.4 Rendering-Module (3 Module, ~2.477 Zeilen)

| # | Modul | Zeilen | Exportierte Funktionen | Verantwortung |
|---|-------|-------:|------------------------|---------------|
| 1 | `markdown-renderer.ts` | 1.074 | renderMarkdown(), stripAnsi(), SelfExplanationPrompt | Vollstaendiger Markdown-zu-Terminal-Renderer. Unterstuetzt: Headings, Bold, Italic, Code-Bloecke mit Syntax-Highlighting, Annotierte Code-Bloecke (Erklaerungen neben dem Code), Tabellen, Blockquotes, Listen, Links, Mermaid-Bloecke, Self-Explanation-Erkennung (sucht nach "Erklaere dir selbst"), Lesezeit-Berechnung. |
| 2 | `diagram-renderer.ts` | 978 | renderMermaidDiagram(), renderFlowchart() | Rendert einfache Mermaid-Flowcharts als Box-Drawing-Art im Terminal. Parsed Mermaid-Syntax, berechnet Layouts, zeichnet Boxen und Pfeile mit Unicode-Box-Drawing-Zeichen. [D] oeffnet volles Diagramm im Browser. |
| 3 | `visual-utils.ts` | 425 | sparkline(), brailleChart(), horizontalBar(), colorBox(), miniTable() | Visuelle Hilfsfunktionen: Sparklines fuer 7-Tage-Aktivitaet, Braille-Charts fuer kompakte Datenvisualisierung, farbige Fortschrittsbalken, Info-Boxen mit Rahmen. |

### 2.5 Sonstige Module (7 Module, ~2.330 Zeilen)

| # | Modul | Zeilen | Verantwortung |
|---|-------|-------:|---------------|
| 1 | `watch-runner.ts` | 825 | Rustlings-Stil File-Watcher: Beobachtet Exercise-Dateien auf Aenderungen, fuehrt Type-Check + Runtime-Check aus, zeigt naechsten Fehler mit deutscher Erklaerung (~40 uebersetzte TypeScript-Fehlercodes). |
| 2 | `hint.ts` | 388 | Progressive Hints: Laedt hints.json, zeigt Hints stufenweise ([N] = naechster Hint). CLI-Tool UND TUI-Integration. |
| 3 | `playground-link.ts` | 255 | Generiert TypeScript Playground Links: Komprimiert Code, oeffnet playground im Browser. |
| 4 | `config.ts` | 217 | User-Config laden/speichern (config.json). Einstellungen: Theme, Sprache, TTS-Stimme. |
| 5 | `themes.ts` | 239 | 3 Farbthemen: dark (Standard), light, solarized. 24-bit RGB-Farben. |
| 6 | `interleave-data.ts` | 538 | (Bereits bei Engines aufgefuehrt — 20 Challenge-Templates) |
| 7 | `quiz-runner.ts` | 199 | (Bereits bei Engines aufgefuehrt — Standalone-Quiz) |

---

## 3. Datenfluss-Diagramm

### Vom Start bis zur Anzeige

```
npm start
    |
    v
tui.ts (Entry-Point)
    |
    ├── cleanup-Handler registrieren (exit, SIGINT, uncaughtException)
    ├── loadPlatformConfig()        → platform.json laden
    │       tui-utils.ts                → platformConfig in tui-state.ts setzen
    ├── discoverLessons()           → Lektionsverzeichnisse scannen
    │       tui-state.ts                → lessons[] in tui-state.ts setzen
    ├── loadProgress()              → state/progress-*.json laden
    │       tui-state.ts                → progress in tui-state.ts setzen
    ├── loadAdaptiveState()         → state/adaptive-state.json laden
    │       adaptive-engine.ts          → adaptiveState in tui-state.ts setzen
    |
    ├── Alternate Screen Buffer aktivieren
    ├── Raw Mode aktivieren (stdin)
    ├── Mouse Tracking aktivieren
    ├── stdin.on("data", handleInput)  → Tastatureingaben an tui-input.ts
    ├── process.on("SIGWINCH", redraw) → Terminal-Resize an tui-redraw.ts
    |
    └── renderPlatformScreen()      → Erster Screen: Kursauswahl
            tui-platform.ts             → Bento-Grid mit 4 Kursen
```

### Input-Verarbeitungskette

```
stdin (Raw Mode)
    |
    v
tui-input.ts: parseKey(data)
    |
    ├── Erkennt: Pfeiltasten, Enter, Escape, Page Up/Down,
    │           Home/End, Buchstaben, Zahlen, Ctrl+C, Mouse Scroll
    |
    v
tui-input.ts: handleInput(key)
    |
    ├── switch(currentScreen.type)
    │       "platform"    → tui-platform.ts:    handlePlatformInput()
    │       "main"        → tui-main-menu.ts:   handleMainMenuInput()
    │       "lesson"      → tui-lesson-menu.ts: handleLessonMenuInput()
    │       "section"     → tui-section-reader.ts: handleSectionReaderInput()
    │       "warmup"      → tui-quiz.ts:        handleQuizInput()
    │       "pretest"     → tui-quiz.ts:        handleQuizInput()
    │       "interleaved" → tui-quiz.ts:        handleQuizInput()
    │       "search"      → tui-search.ts:      handleSearchInput()
    │       "bookmarks"   → tui-bookmarks.ts:   handleBookmarksInput()
    │       "hints"       → tui-exercises.ts:   handleExerciseMenuInput()
    │       "help"        → tui-help.ts:        handleHelpInput()
    │       "history"     → tui-history.ts:     handleHistoryInput()
    │       "misconceptions" → tui-challenges.ts: handleChallengesInput()
    │       "completion"  → tui-challenges.ts:  handleChallengesInput()
    │       ...
    |
    v
Screen-Handler aktualisiert currentScreen in tui-state.ts
    |
    v
Screen-Handler ruft eigene render*()-Funktion auf
    |
    v
render*() baut String-Array (Zeilen) auf
    |
    ├── renderHeader() fuer Header-Zeile
    ├── Content-Zeilen (abhaengig vom Screen)
    ├── renderFooter() fuer Shortcut-Zeile
    |
    v
tui-render.ts: flushScreen(lines)
    |
    ├── CURSOR_HOME (\x1b[H] — Cursor an Position 0,0)
    ├── Fuer jede Zeile: Zeile + \x1b[K (Rest der Zeile loeschen)
    ├── Alles als EIN String zusammenbauen
    |
    v
process.stdout.write(buffer)   ← Ein einziger write-Aufruf pro Frame
```

### Section-Reader Rendering-Pipeline

```
Markdown-Datei (z.B. typescript/02-primitive-types/sections/01-das-typsystem.md)
    |
    v
fs.readFileSync(filePath, "utf-8")
    |
    v
markdown-renderer.ts: renderMarkdown(rawMarkdown, width)
    |
    ├── Zeile fuer Zeile parsen:
    │   ├── # Heading      → ANSI Bold + Farbe + Unterstrich
    │   ├── **bold**       → ANSI Bold
    │   ├── *italic*       → ANSI Italic
    │   ├── `inline code`  → ANSI Inverse/Background
    │   ├── ```typescript  → Syntax-Highlighting (Keywords, Strings, Kommentare)
    │   ├── ```typescript annotated → Code + Annotationen nebeneinander
    │   ├── > Blockquote   → Linker Rand + Farbe
    │   ├── - Liste        → Bullet-Punkt + Einrueckung
    │   ├── | Tabelle      → Box-Drawing-Tabelle
    │   ├── ```mermaid     → diagram-renderer.ts → Box-Drawing-Art
    │   └── "Erklaere dir selbst" → SelfExplanationPrompt erkennen
    |
    ├── Lesezeit berechnen (~200 Woerter/Minute)
    ├── Self-Explanation-Positionen merken (Zeilennummer)
    |
    v
sectionRenderedLines[] in tui-state.ts gespeichert
    |
    v
tui-section-reader.ts: renderSectionReader()
    |
    ├── Header: "L02 > S1: Das Typsystem"
    ├── Content: sectionRenderedLines[scrollOffset .. scrollOffset+viewportHeight]
    ├── Scrollbar: computeScrollbar() → "track"/"thumb" pro Zeile
    ├── Footer: "Zeile 42/180 · 23% | ↑↓ Scrollen  [L]esen  [V]S Code  [?]Hilfe"
    |
    v
flushScreen(lines)
```

---

## 4. State-Management im Detail

### Globale Variablen in tui-state.ts

Das State-Management ist bewusst einfach gehalten: Globale Variablen mit Setter-Funktionen. Kein Redux, kein Store-Pattern — die Einfachheit ist beabsichtigt fuer eine Single-Process-TUI-Applikation.

| Variable | Typ | Beschreibung | Persistiert? |
|----------|-----|-------------|:------------:|
| `currentScreen` | `Screen` (Discriminated Union) | Aktueller Screen-Zustand (20+ Varianten) | Nein |
| `lessons` | `LessonInfo[]` | Alle Lektionen des aktiven Kurses | Nein (bei Start entdeckt) |
| `progress` | `ProgressData` | Fortschritt: Sektionen, Exercises, Quizzes, Bookmarks | Ja (`state/progress-*.json`) |
| `platformConfig` | `PlatformConfig` | Kurs-Registry aus platform.json | Ja (`platform.json`) |
| `adaptiveState` | `AdaptiveState` | Tiefe, Konzept-Scores, Hint-Levels | Ja (`state/adaptive-state.json`) |
| `_W`, `_H` | `number` | Terminal-Breite und -Hoehe | Nein (bei Resize aktualisiert) |
| `isInAltScreen` | `boolean` | Ob wir im Alternate Screen Buffer sind | Nein |
| `sectionRenderedLines` | `string[]` | Gerenderte Zeilen der aktuellen Sektion | Nein |
| `sectionSelfExplainPrompts` | `SelfExplanationPrompt[]` | Self-Explanation-Positionen | Nein |
| `sectionSelfExplainTriggered` | `Set<number>` | Bereits gezeigte Self-Explanation-Prompts | Nein |
| `sectionRawMarkdown` | `string` | Roh-Markdown fuer TTS-Extraktion | Nein |
| `ttsProcess` | `ChildProcess \| null` | Aktiver TTS-Prozess | Nein |
| `ttsActive`, `ttsParagraphs`, `ttsCurrentParagraph` | various | TTS-Zustand | Nein |
| `cheatsheetRenderedLines` | `string[]` | Gerenderte Cheatsheet-Zeilen | Nein |
| `courseInfoRenderedLines` | `string[]` | Gerenderte Kurs-Info-Zeilen | Nein |
| `searchDebounceTimer` | `Timer \| null` | Debounce fuer Volltextsuche | Nein |
| `pretestsTaken` | `Set<string>` | Welche Pre-Tests diese Session durchgefuehrt | Nein |
| `warmupShownThisSession` | `boolean` | Ob Warm-Up schon gezeigt wurde | Nein |
| `SESSION_START` | `number` | Zeitstempel des Session-Starts | Nein |
| `sessionStats` | `{sectionsRead, exercisesSolved, ...}` | Session-Statistiken | Nein |
| `navigationHistory` | `Screen[]` | Ring-Buffer (max 20) besuchter Stellen | Nein |
| `shortcutsForScreen` | `Record<string, ...>` | Tastenbelegungen pro Screen-Typ | Nein (statisch) |
| `courseProgressCache` | `Map<string, CourseProgressSummary>` | Cache fuer Kurs-Statistiken | Nein |

### Pfad-Konstanten und dynamische Pfade

```typescript
// Statische Pfade (einmal berechnet)
PLATFORM_ROOT  = path.resolve(import.meta.dirname, "..")     // platform/
COURSES_ROOT   = path.resolve(PLATFORM_ROOT, "..")            // Learning/
PLATFORM_FILE  = path.join(PLATFORM_ROOT, "platform.json")    // platform/platform.json
STATE_DIR      = path.join(PLATFORM_ROOT, "state")            // platform/state/

// Dynamische Pfade (aendern sich bei Kurswechsel)
PROJECT_ROOT   = path.join(COURSES_ROOT, "typescript")         // Learning/typescript/
TOOLS_DIR      = path.join(PROJECT_ROOT, "tools")              // Learning/typescript/tools/
PROGRESS_FILE  = path.join(STATE_DIR, "progress-typescript.json")
REVIEW_DATA_FILE = path.join(STATE_DIR, "review-typescript.json")
ACTIVE_COURSE_ID = "typescript"
```

Bei Kurswechsel werden die dynamischen Pfade ueber `updateDerivedPaths()` neu berechnet.

### Persistierung

Drei Dateien werden persistiert:

**1. `state/progress-{courseId}.json`** (Fortschritt pro Kurs)
```json
{
  "sections": {
    "02-01": "completed",
    "02-02": { "status": "in_progress", "scrollPercent": 45, "firstOpened": "2026-03-31T..." }
  },
  "exercises": {
    "02": { "solved": 3, "total": 6 }
  },
  "quizzes": {
    "02": { "score": 12, "total": 15, "date": "2026-03-31T..." }
  },
  "lastLesson": 2,
  "lastSection": 3,
  "lastScrollOffset": 42,
  "lastScreen": "section",
  "bookmarks": [
    { "lessonIndex": 1, "sectionIndex": 2, "scrollOffset": 50, "created": "2026-03-31T..." }
  ]
}
```

**2. `state/review-{courseId}.json`** (Spaced Repetition Daten)
```json
{
  "items": [
    {
      "lessonIndex": 1,
      "questionIndex": 3,
      "interval": 4,
      "nextReview": "2026-04-04T...",
      "easeFactor": 2.5,
      "repetitions": 2
    }
  ]
}
```

**3. `state/adaptive-state.json`** (Adaptiver Lernzustand)
```json
{
  "sectionDepths": {
    "2-0": "standard",
    "2-1": "kurz"
  },
  "conceptScores": {
    "type-erasure": { "correct": 3, "total": 4, "lastSeen": "2026-03-31T..." }
  },
  "hintLevels": {
    "2-0-1": 2
  }
}
```

---

## 5. Rendering-Pipeline im Detail

### Flicker-free Rendering

Das TUI rendert **flicker-free** durch eine einfache Technik: Der gesamte Screen-Inhalt wird als ein einzelner String zusammengebaut und mit einem einzigen `process.stdout.write()` ausgegeben.

```typescript
// tui-render.ts: flushScreen()
export function flushScreen(lines: string[]): void {
  const buffer: string[] = [];
  buffer.push(CURSOR_HOME);           // \x1b[H — Cursor an 0,0

  const h = H();                       // Terminal-Hoehe
  for (let i = 0; i < h; i++) {
    if (i < lines.length) {
      buffer.push(lines[i] + "\x1b[K"); // Zeile + Rest der Zeile loeschen
    } else {
      buffer.push("\x1b[K");            // Leere Zeile (Rest loeschen)
    }
    if (i < h - 1) {
      buffer.push("\n");
    }
  }

  process.stdout.write(buffer.join("")); // EIN write-Aufruf
}
```

**Warum ein einziger write-Aufruf?** Mehrere `write()`-Aufrufe koennen dazu fuehren, dass das Terminal zwischen den Aufrufen rendert — das erzeugt Flicker. Ein einzelner `write()` mit dem gesamten Buffer stellt sicher, dass das Terminal den Frame atomar darstellt.

### Alternate Screen Buffer

```
Normal-Modus              Alternate Screen Buffer
┌─────────────────┐       ┌─────────────────┐
│ $ npm start     │  ──>  │ ┌─────────────┐ │
│                 │       │ │ TypeScript   │ │
│                 │       │ │ Deep Learn.  │ │
│                 │       │ │ L02 > S1     │ │
│                 │       │ └─────────────┘ │
└─────────────────┘       └─────────────────┘
                     <──
                          Original bleibt erhalten!
```

- `\x1b[?1049h` — Alternate Screen Buffer aktivieren
- `\x1b[?1049l` — Alternate Screen Buffer verlassen
- Das Original-Terminal bleibt komplett erhalten (Scrollback-History, etc.)
- cleanup() stellt IMMER sicher, dass wir den Buffer verlassen

### Mouse Tracking

```
\x1b[?1000h  — Maus-Events aktivieren (Button-Presses)
\x1b[?1006h  — SGR-Maus-Format (erweitert, fuer >223 Spalten)
\x1b[?1007h  — Alternate Scroll Mode (Mausrad → Arrow Keys)
```

Das `?1007h` ist besonders clever: Statt komplexe Mausrad-Events zu parsen, sendet das Terminal bei Mausrad-Scrollen einfach Arrow-Up/Arrow-Down-Events. Die bestehende Pfeiltasten-Logik funktioniert dadurch automatisch auch fuer Mausrad-Scrolling.

---

## 6. Child-Process-Architektur

### Watch-Runner

```
tui-exercises.ts: startWatchRunner(lessonDir)
    |
    v
child_process.spawn("npx", ["tsx", "watch-runner.ts", lessonDir])
    |
    ├── stdout → Terminal (uebernimmt den Screen)
    ├── stderr → Terminal
    ├── Ctrl+C → Watch-Runner beendet sich
    |
    v
Watch-Runner beendet → TUI rendert sich neu
```

Der Watch-Runner laeuft als **separater Prozess** (nicht Child von TUI). Das TUI verlasst den Alternate Screen Buffer, startet den Watch-Runner, und kehrt nach dessen Beendigung zurueck.

### Text-to-Speech

```
tui-tts.ts: startTTS(text)
    |
    v
child_process.spawn("powershell", [
  "-Command",
  "Add-Type -AssemblyName System.Speech; " +
  "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; " +
  "$synth.SelectVoice('Microsoft Katja Desktop'); " +
  "$synth.Speak('...')"
])
    |
    ├── Laeuft im Hintergrund
    ├── ttsProcess in tui-state.ts gespeichert
    ├── stopTTS() → process.kill()
    ├── Automatischer Stop bei Navigation
    |
    v
Absatzweise Vorlesung, naechster Absatz bei Beendigung
```

### VS Code Integration

```
tui-utils.ts: openInVSCode(path)
    |
    v
child_process.exec("code " + path)
    |
    └── Fire-and-forget (kein Warten auf VS Code)
```

### Mermaid im Browser

```
tui-utils.ts: openMermaidInBrowser(mermaidCode)
    |
    ├── Erstellt temp HTML-Datei mit Mermaid.js CDN
    ├── child_process.exec("start " + tempFile)  // Windows
    |
    └── Browser oeffnet sich mit dem Diagramm
```

---

## 7. Dateiformate und Schemata

### platform.json (Kurs-Registry)

```typescript
interface PlatformConfig {
  courses: {
    id: string;                      // "typescript" | "angular" | "react" | "nextjs"
    name: string;                    // Anzeigename
    description: string;             // Kurze Beschreibung
    directory: string;               // Verzeichnisname relativ zu COURSES_ROOT
    color: string;                   // ANSI-Farbname fuer das TUI
    icon: string;                    // 2 Zeichen (z.B. "TS", "NG", "RE", "NX")
    totalLessons: number;            // Geplante Gesamtzahl
    totalSections?: number;          // Geschaetzte Sektionen
    estimatedHours?: number;         // Geschaetzte Stunden
    exerciseTypes?: number;          // Anzahl Uebungsformate
    topics?: string[];               // Schlagwoerter
    prerequisite: string | null;     // Kurs-ID oder null
    prerequisiteDescription?: string;
    prerequisiteMinPhase?: number | null;
    status: "active" | "planned" | "coming_soon";
    recommendNext: string | null;    // Empfohlener naechster Kurs
  }[];
  activeCourse: string;              // Zuletzt aktiver Kurs
  lastAccessed: Record<string, string>; // ISO-Datum pro Kurs
}
```

### Kurs-Struktur (pro Lektion ~30-36 Dateien)

```
XX-thema/
├── README.md                  <- Navigations-Hub
├── sections/                  <- 5-7 Markdown-Sektionen (je ~10 Min)
│   ├── 01-thema.md            <- Format: # Sektion 1: Titel
│   ├── 02-thema.md            <-   > Lesezeit, Prev/Next-Links
│   └── ...                    <-   ## Was du hier lernst
│                              <-   (Inhalt mit Self-Explanation, Denkfragen, etc.)
├── examples/                  <- 5-6 lauffaehige .ts Dateien
├── exercises/                 <- 5-6 Exercise-Dateien mit // TODO: Kommentaren
├── solutions/                 <- Loesungen mit ausfuehrlichen Erklaerungen
├── quiz-data.ts               <- 15 Fragen + elaboratedFeedback
├── quiz.ts                    <- Quiz-Runner Einstiegspunkt
├── pretest-data.ts            <- 3 Fragen pro Sektion
├── misconceptions.ts          <- 8 haeufige Fehlkonzeptionen
├── completion-problems.ts     <- 6 Luecken-Uebungen (Faded Worked Examples)
├── debugging-data.ts          <- 5 Debugging Challenges
├── parsons-data.ts            <- 3-4 Parson's Problems
├── tracing-data.ts            <- 4 Code-Tracing Exercises
├── transfer-data.ts           <- 2-3 Transfer Tasks (neuer Kontext)
├── hints.json                 <- Progressive Hints fuer alle Exercises
└── cheatsheet.md              <- Kompakte Referenz
```

### Screen (Discriminated Union — 20+ Varianten)

Die `Screen`-Type-Definition in `tui-types.ts` ist eine Discriminated Union mit dem Discriminant `type`. Jede Variante enthaelt genau den State der fuer diesen Screen benoetigt wird:

```typescript
// Beispiele (vereinfacht):
| { type: "platform"; selectedIndex: number; scrollOffset: number }
| { type: "main"; selectedIndex: number }
| { type: "section"; lessonIndex: number; sectionIndex: number; scrollOffset: number; totalLines: number }
| { type: "warmup"; questions: ...; currentIndex: number; phase: "question" | "confidence" | "feedback" }
| { type: "pretest"; lessonIndex: number; sectionIndex: number; recommendedDepth: "kurz" | "standard" | "vollstaendig" }
| { type: "selfexplain"; prompt: SelfExplanationPrompt; showKeyPoints: boolean; typingMode: boolean }
| { type: "help"; previousScreen: Screen }  // Rekursiv!
// ... 15+ weitere Varianten
```

Die `help`-Variante ist bemerkenswert: Sie speichert den `previousScreen` als verschachtelten `Screen`-Wert, sodass nach dem Schliessen der Hilfe exakt der vorherige Screen wiederhergestellt wird.

---

## 8. Circular-Dependency-Vermeidung

Die Modularisierung von 7.128 Zeilen in 19 Module erfordert sorgfaeltige Dependency-Planung:

**Regel:** `tui-state.ts` importiert NICHTS von Screen-Modulen. Nur umgekehrt.

```
                    tui-types.ts (reine Typen, keine Imports aus tui-*)
                         ↑
                    tui-state.ts (importiert nur tui-types + Engines)
                    ↗    ↑    ↖
          tui-render.ts  |     adaptive-engine.ts
          ↗    ↑         |         ↑
    tui-platform.ts      |     pretest-engine.ts
    tui-main-menu.ts     |     interleave-engine.ts
    tui-lesson-menu.ts   |
    tui-section-reader.ts|
    tui-quiz.ts          |
    ...                  |
                    tui-input.ts (importiert ALLE Screen-Module)
                         ↑
                      tui.ts (Entry-Point)
```

`tui-input.ts` ist der zentrale Dispatcher und importiert daher alle Screen-Module. `tui-redraw.ts` importiert ebenfalls alle Screen-Module (fuer Resize-Redraw).
