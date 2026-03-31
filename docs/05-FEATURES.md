# Feature-Dokumentation: Alle 25 Features im Detail

> Letzte Aktualisierung: 2026-03-31

---

Fuer jedes Feature: Datei(en) und Zeilenanzahl, Tastenbelegungen, ASCII-Darstellung im TUI, technische Funktionsweise, wissenschaftliche Grundlage, bekannte Limitationen.

---

## 1. Kursauswahl (Platform Screen)

**Datei:** `tui-platform.ts` (590 Zeilen)
**Taste:** Erster Screen beim Start, [Esc] aus Hauptmenue
**Lerntheorie:** Self-Determination Theory (Autonomie — Lernender waehlt Kurs)

**Wie es im TUI aussieht:**
```
 ┌─────────────────────────────── TypeScript Deep Learning ──────────────────────────────────┐
 │                                                                                           │
 │  ┌── TS ──────────────────────────┐  ┌── NG ──────────────────────────┐                   │
 │  │ TypeScript Deep Learning       │  │ Angular Mastery         [LOCK] │                   │
 │  │ Von den Basics bis zur         │  │ Component Architecture,        │                   │
 │  │ Type-Level-Programmierung      │  │ Signals, RxJS, DI und mehr     │                   │
 │  │                                │  │                                │                   │
 │  │ ██████████░░░░░░  50%          │  │ ░░░░░░░░░░░░░░░░   0%          │                   │
 │  │ 20/40 Lektionen               │  │ 0/40 Lektionen                 │                   │
 │  │ 120 Sektionen · 68h           │  │ Voraussetzung: TS Phase 2      │                   │
 │  └────────────────────────────────┘  └────────────────────────────────┘                   │
 │                                                                                           │
 │  ┌── RE ──────────────────────────┐  ┌── NX ──────────────────────────┐                   │
 │  │ React mit TypeScript    [LOCK] │  │ Next.js Production      [LOCK] │                   │
 │  │ Hooks, Patterns,               │  │ App Router, Server             │                   │
 │  │ Performance — alles typsicher  │  │ Components, Deployment         │                   │
 │  │                                │  │                                │                   │
 │  │ ░░░░░░░░░░░░░░░░   0%          │  │ ░░░░░░░░░░░░░░░░   0%          │                   │
 │  │ 0/40 Lektionen                 │  │ 0/20 Module                    │                   │
 │  │ Voraussetzung: TS Phase 2      │  │ Voraussetzung: React Phase 2   │                   │
 │  └────────────────────────────────┘  └────────────────────────────────┘                   │
 │                                                                                           │
 ├───────────────────────────────────────────────────────────────────────────────────────────┤
 │ ↑↓ Waehlen  Enter Oeffnen  ? Hilfe  Q Beenden                                           │
 └───────────────────────────────────────────────────────────────────────────────────────────┘
```

**Technische Details:**
- 3 Layout-Modi: 2x2 Bento-Grid (>=100 Spalten), 1-Spalte vertikal (80-99), Ultra-Kompakt (<80)
- Statistiken werden **dynamisch von der Festplatte** berechnet: Sektionen, Stunden, Exercises werden gezaehlt, nicht aus platform.json gelesen
- Lock-System: Kurse mit `prerequisite` und `prerequisiteMinPhase` zeigen [LOCK] an
- Override: Bei Auswahl eines gesperrten Kurses kommt Bestaetigung "Trotzdem oeffnen?"
- Kurs-Icons (TS, NG, RE, NX) als farbige 2-Zeichen-Badges

**Bekannte Limitationen:**
- Ultra-Kompakt-Modus (<80 Spalten) zeigt weniger Details
- Statistiken-Berechnung kann bei sehr vielen Dateien eine halbe Sekunde dauern

---

## 2. Smooth Scrolling (Section Reader)

**Datei:** `tui-section-reader.ts` (584 Zeilen)
**Tasten:** Arrow Up/Down (Zeile), Space/PageDown (halbe Seite), PageUp (halbe Seite zurueck), Home (Anfang), End (Ende)
**Lerntheorie:** Cognitive Load Theory (kontinuierlicher Lesefluss statt Seitenumbrueche)

**Wie es im TUI aussieht:**
```
 TypeScript > L02 > S1: Das Typsystem im Ueberblick                      ⏱ 5:23  │
 ──────────────────────────────────────────────────────────────────────────────────┤
                                                                                  │
 ## Das mentale Modell: Compilezeit vs Laufzeit                                   │
                                                                                  │
 Bevor wir einen einzigen Typ anschauen, muessen wir das wichtigste              │
 Konzept in TypeScript verstehen. Es ist so fundamental, dass alles               █  ← Scrollbar
 andere darauf aufbaut:                                                           █
                                                                                  │
 > TypeScript-Typen existieren NUR zur Compilezeit. Zur Laufzeit                  │
 > sind sie komplett weg.                                                         │
                                                                                  │
 Das nennt man Type Erasure (Typ-Loeschung). Wenn der TypeScript-                 │
 Compiler deinen Code in JavaScript umwandelt, werden alle                        │
 Typ-Annotationen entfernt.                                                       │
                                                                                  │
 ┌──────────────────────────────────────────────────────────────────────┐          │
 │ // DAS schreibst du (TypeScript):                                   │          │
 │ function addiere(a: number, b: number): number {                    │          │
 │   return a + b;                                                     │          │
 │ }                                                                   │          │
 └──────────────────────────────────────────────────────────────────────┘          │
 ──────────────────────────────────────────────────────────────────────────────────┤
 Zeile 18/180 · 10% | ~8 Min  ↑↓ Scrollen  [L]esen  [A]nnotationen  [V]S Code   │
 └────────────────────────────────────────────────────────────────────────────────┘
```

**Technische Details:**
- Scrollbar rechts: `computeScrollbar()` in `tui-render.ts` berechnet Thumb-Groesse und -Position proportional
- Scroll-Offset wird pro Sektion in `currentScreen.scrollOffset` gespeichert
- `clampScrollOffset()` verhindert Uebers-Ende-hinaus-Scrollen
- Footer zeigt: Zeilennummer, Prozent, geschaetzte Restlesezeit
- Self-Explanation-Prompts loesen automatische Pause aus (separater Screen-Typ "selfexplain")

**Bekannte Limitationen:**
- Kein horizontales Scrollen — sehr lange Code-Zeilen werden abgeschnitten
- Mausrad-Scrolling sendet immer genau 3 Zeilen (OS-abhaengig)

---

## 3. Text-to-Speech (Vorlesen)

**Datei:** `tui-tts.ts` (176 Zeilen)
**Taste:** [L] im Section Reader (Toggle)
**Lerntheorie:** Multimedia Learning (Mayer 2009 — Modality-Prinzip: auditiver + visueller Kanal gleichzeitig)

**Technische Details:**
- Nutzt Windows PowerShell `System.Speech.Synthesis.SpeechSynthesizer`
- Deutsche Stimme: "Microsoft Katja Desktop" (falls installiert, sonst System-Default)
- Liest ab aktueller Scroll-Position absatzweise vor
- Jeder Absatz wird als separater TTS-Aufruf gestartet (damit er bei Navigation stoppbar ist)
- `ttsProcess` in `tui-state.ts` speichert den aktiven PowerShell-Prozess
- `stopTTS()` killt den Prozess sauber (process.kill)
- Automatischer Stop bei: Navigation zu anderem Screen, Schliessen des TUI, Ctrl+C

**Bekannte Limitationen:**
- Nur Windows (PowerShell Speech Synthesizer)
- Code-Bloecke werden mitgelesen (klingt seltsam)
- Kein Sync zwischen gelesener Stelle und Scroll-Position

---

## 4. Continue Where You Left Off

**Datei:** `tui-main-menu.ts` (400 Zeilen), `tui-state.ts`
**Taste:** Enter im Resume-Banner
**Lerntheorie:** Self-Determination Theory (Autonomie — nahtloses Weitermachen reduziert Einstiegshuerde)

**Wie es im TUI aussieht:**
```
 TypeScript Deep Learning — Hauptmenue                                   ⏱ 0:12  │
 ──────────────────────────────────────────────────────────────────────────────────┤
                                                                                  │
 ┌─ Weitermachen ──────────────────────────────────────────────────────────────┐   │
 │  L05 Objects & Interfaces > Sektion 3: Readonly Properties                 │   │
 │  Zeile 42 · 23%   [Enter] um fortzufahren                                  │   │
 └─────────────────────────────────────────────────────────────────────────────┘   │
                                                                                  │
   Empfohlen: L06 Functions (naechste Lektion)                                    │
                                                                                  │
 ──────────────────────────────────────────────────────────────────────────────────┤
```

**Technische Details:**
- `progress.lastLesson`, `progress.lastSection`, `progress.lastScrollOffset` werden bei jedem Sektionswechsel gespeichert
- Resume-Banner erscheint nur wenn es eine letzte Position gibt
- Enter springt direkt zur letzten Position inkl. Scroll-Offset

---

## 5. VS Code Integration

**Datei:** `tui-utils.ts` (482 Zeilen)
**Taste:** [V] im Lesson-Menue (oeffnet Exercise-Ordner), [V] im Section Reader (oeffnet aktuelle .md Datei)
**Lerntheorie:** Cognitive Load Theory (Extraneous Load reduzieren — kein manuelles Dateien-Suchen)

**Technische Details:**
- Nutzt `child_process.exec("code " + path)` — Fire-and-forget
- Bei [E] Exercises oeffnet automatisch VS Code mit dem Exercise-Ordner
- Pfade werden korrekt escaped fuer Windows (Leerzeichen, Umlaute)

---

## 6. Volltextsuche

**Datei:** `tui-search.ts` (132 Zeilen)
**Taste:** [/] im Hauptmenue
**Lerntheorie:** Self-Determination Theory (Autonomie — Lernender sucht was ihn interessiert)

**Wie es im TUI aussieht:**
```
 Suche: generic constr█                                                          │
 ──────────────────────────────────────────────────────────────────────────────────┤
                                                                                  │
   L13 S4: Constraints (Einschraenkungen)                                         │
   > ...extends { length: number } als Constraint...                              │
                                                                                  │
   L13 S6: Generics in der Praxis                                                │
   > ...Constraints sind der Schluessel zu sicheren generischen...                │
                                                                                  │
   L22 S2: Advanced Generic Constraints                                           │
   > ...multiple constraints mit Intersection Types...                            │
                                                                                  │
 ──────────────────────────────────────────────────────────────────────────────────┤
 ↑↓ Ergebnis waehlen  Enter Oeffnen  Esc Zurueck                                 │
 └────────────────────────────────────────────────────────────────────────────────┘
```

**Technische Details:**
- Live-Suche mit Debounce (150ms) — jeder Tastendruck loest Suche aus, aber erst nach 150ms Ruhe
- Durchsucht alle `sections/*.md` Dateien des aktiven Kurses
- Zeigt Kontext-Zeile mit dem Suchbegriff
- Enter springt zur Sektion und scrollt zur Fundstelle
- Case-insensitive Suche

**Bekannte Limitationen:**
- Sucht nur in Sektionen, nicht in Quiz/Exercises/etc.
- Keine Regex-Unterstuetzung
- Kein Highlighting des Suchbegriffs im Section Reader

---

## 7. Lesezeichen

**Datei:** `tui-bookmarks.ts` (81 Zeilen)
**Tasten:** [M] setzen (im Section Reader), [B] anzeigen (im Hauptmenue), [X] loeschen (in Lesezeichen-Liste)
**Lerntheorie:** Self-Determination Theory (Autonomie)

**Technische Details:**
- Speichert: lessonIndex, sectionIndex, scrollOffset, note (optional), created (ISO-Datum)
- Persistiert in `progress.bookmarks[]` in der Progress-Datei
- Enter in der Lesezeichen-Liste springt zur gespeicherten Position inkl. Scroll-Offset

---

## 8. History

**Datei:** `tui-history.ts` (91 Zeilen)
**Taste:** [H] im Hauptmenue
**Lerntheorie:** —

**Technische Details:**
- Ring-Buffer der letzten 20 besuchten Stellen (MAX_HISTORY = 20)
- Deduplizierung: Gleicher Screen-Typ mit gleichen Identifikations-Parametern wird nicht doppelt gespeichert
- Gespeichert in `tui-state.ts: navigationHistory[]`
- Deep-Copy via `JSON.parse(JSON.stringify(screen))` — verhindert Referenz-Probleme

---

## 9. Shortcut-Hilfe Overlay

**Datei:** `tui-help.ts` (73 Zeilen)
**Taste:** [?] oder [F1] in jedem Screen
**Lerntheorie:** Cognitive Load Theory (Extraneous Load reduzieren — Lernender muss Shortcuts nicht auswendig wissen)

**Wie es im TUI aussieht:**
```
 ┌── Tastenbelegungen (Section Reader) ──┐
 │                                       │
 │  ↑ / ↓       Scrollen                 │
 │  Space/PgDn  Halbe Seite              │
 │  Home/End    Anfang/Ende              │
 │  L           Text vorlesen (TTS)      │
 │  A           Annotationen toggle      │
 │  V           In VS Code oeffnen       │
 │  D           Diagramm im Browser      │
 │  M           Lesezeichen setzen       │
 │  ← / Esc     Zurueck                  │
 │  ? / F1      Diese Hilfe              │
 │  Ctrl+C      Beenden                  │
 │                                       │
 └───────────────────────────────────────┘
```

**Technische Details:**
- Kontextabhaengig: `shortcutsForScreen[currentScreen.type]` in `tui-state.ts`
- Screen-Typ "help" speichert `previousScreen` — nach Schliessen wird exakt zum vorherigen Screen zurueckgekehrt
- Jeder Screen hat eine eigene Shortcut-Liste definiert

---

## 10. Breadcrumbs

**Datei:** `tui-state.ts` (getBreadcrumb-Funktion)
**Lerntheorie:** Cognitive Load Theory (Orientation — wo bin ich?)

**Beispiele:**
```
Main                                    ← Im Hauptmenue
Main > L02 Primitive Types              ← Im Lektionsmenue
Main > L02 > S3: null und undefined     ← Im Section Reader
```

---

## 11. Session-Timer + Tages-Zusammenfassung

**Datei:** `tui-state.ts` (SESSION_START, formatSessionTime, sessionStats), `tui-utils.ts`
**Lerntheorie:** Metacognition (Bewusstsein ueber Lernzeit)

**Wie es im TUI aussieht (Timer im Header):**
```
 TypeScript > L02 > S1: Das Typsystem                                    ⏱ 14:23
```

**Beim Beenden (Tages-Zusammenfassung):**
```
 ┌─ Session-Zusammenfassung ─────────────────┐
 │  Dauer:            14:23                  │
 │  Sektionen gelesen: 3                     │
 │  Exercises geloest: 2                     │
 │  Quiz-Fragen:       15                    │
 │  Weitermachen bei:  L05 S3 (23%)          │
 └───────────────────────────────────────────┘
```

---

## 12. Metacognitive Prompts

**Datei:** `tui-quiz.ts` (481 Zeilen)
**Lerntheorie:** Metacognition & Calibration (Kruger & Dunning 1999, Kang 2007)

**Wie der 3-Phasen-Flow aussieht:**
```
Phase 1 — FRAGE:
 Frage 3/15: Was ist der Typ von `typeof null`?
 (a) "null"     (b) "undefined"     (c) "object"     (d) "none"

Phase 2 — CONFIDENCE:
 Wie sicher bist du?
 [1] Geraten    [2] Unsicher    [3] Ziemlich sicher    [4] Absolut sicher
 > Lernender drueckt [3]

Phase 3 — FEEDBACK:
 RICHTIG! (c) "object"
 Du warst ziemlich sicher und hattest recht — gute Kalibrierung!
 typeof null gibt "object" zurueck — ein beruehter Bug aus den fruehen
 JavaScript-Tagen (1995), der nie gefixt wurde weil zu viel Code davon
 abhaengt.
```

**Technische Details:**
- `phase: "question" | "confidence" | "feedback"` im Screen-State
- Confidence wird als `confidence: number` (1-4) gespeichert
- Wird verwendet in: Warmup, Pretest, Standard-Quiz, Interleaved Review
- Kalibrierungskommentare je nach Kombination (sicher+richtig, sicher+falsch, unsicher+richtig, unsicher+falsch)

---

## 13. Mastery-Levels

**Datei:** `tui-state.ts` (calculateMastery)
**Lerntheorie:** Self-Determination Theory (Kompetenz)

**Levels und Berechnung:**
```
Newcomer    (0-24%)   ← Gerade begonnen
Familiar    (25-49%)  ← Sektionen gelesen, erste Exercises
Proficient  (50-74%)  ← Meiste Sektionen + Quiz gemacht
Expert      (75-100%) ← Alles abgeschlossen, Quiz >80%
```

**Berechnung:** Gewichteter Durchschnitt aus:
- Sektionen gelesen (40% Gewicht)
- Exercises geloest (30% Gewicht)
- Quiz-Score (30% Gewicht)

---

## 14. Code-Annotationen Toggle

**Datei:** `markdown-renderer.ts` (1.074 Zeilen)
**Taste:** [A] im Section Reader
**Lerntheorie:** Cognitive Load Theory (Anti-Split-Attention — Erklaerung neben dem Code, Chandler & Sweller 1991)

**Wie es im TUI aussieht:**
```
Annotationen EIN:
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ function getLength<T extends { length: number }>(  // T muss .length   │
 │   arg: T                                           // haben            │
 │ ): number {                                        //                  │
 │   return arg.length;                               // Sicher! TS weiss │
 │ }                                                  // T hat .length    │
 └──────────────────────────────────────────────────────────────────────────┘

Annotationen AUS:
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ function getLength<T extends { length: number }>(                       │
 │   arg: T                                                                │
 │ ): number {                                                             │
 │   return arg.length;                                                    │
 │ }                                                                       │
 └──────────────────────────────────────────────────────────────────────────┘
```

**Technische Details:**
- Erkannt durch ```typescript annotated Code-Block-Marker in Markdown
- Kommentare am Ende jeder Zeile (// ...) werden als Annotationen extrahiert
- Toggle rendert die gesamte Sektion neu (re-render mit/ohne Annotationen)

---

## 15. Mermaid-Diagramme

**Datei:** `diagram-renderer.ts` (978 Zeilen), `markdown-renderer.ts`
**Taste:** [D] im Section Reader (oeffnet im Browser)
**Lerntheorie:** Multimedia Learning (Mayer 2009 — Multimedia-Prinzip: Text + Bild)

**Wie es im TUI aussieht:**
```
 ┌───────────┐     ┌───────────────┐     ┌──────────┐
 │ TypeScript│────>│   Compiler    │────>│JavaScript│
 │   (.ts)   │     │  (tsc/tsx)    │     │  (.js)   │
 └───────────┘     └───────────────┘     └──────────┘
                          │
                          v
                   ┌──────────────┐
                   │  Type Errors │
                   │  (if any)    │
                   └──────────────┘
```

**Technische Details:**
- `diagram-renderer.ts` parsed eine Teilmenge der Mermaid-Syntax (Flowcharts)
- Berechnet Box-Groessen, Verbindungslinien, Pfeilkoepfe
- Unicode Box-Drawing-Zeichen fuer Rahmen
- [D] erstellt eine temporaere HTML-Datei mit Mermaid.js CDN und oeffnet sie im Browser

---

## 16. Spaced Repetition

**Datei:** `review-runner.ts` (603 Zeilen)
**Taste:** [R] im Hauptmenue, oder `npm run review`
**Lerntheorie:** Spacing Effect (Cepeda 2006), Testing Effect (Roediger 2011)

**Intervall-System:**
```
Richtig beantwortet:  1 → 2 → 4 → 8 → 16 → 30 Tage
Falsch beantwortet:   Zurueck auf 1 Tag
```

**Technische Details:**
- SM-2-aehnlicher Algorithmus mit Ease-Factor pro Frage
- Persistiert in `state/review-{courseId}.json`
- Laedt faellige Fragen aus allen abgeschlossenen Lektionen
- Kann als Standalone-CLI (`npm run review`) oder im TUI ([R]) gestartet werden

---

## 17. Watch-Runner (Rustlings-Stil)

**Datei:** `watch-runner.ts` (825 Zeilen)
**Taste:** [E] > [3] im Lesson-Menue (Full Exercises), oder `npm run watch`
**Lerntheorie:** Active Learning, Immediate Feedback

**Wie es aussieht:**
```
 Beobachte: exercises/01-grundlagen.ts
 ──────────────────────────────────────
 FEHLER in Zeile 12:

   Type 'string' is not assignable to type 'number'.

   Auf Deutsch: Du versuchst einen String zuzuweisen wo eine Zahl
   erwartet wird. Pruefe den Typ deiner Variable.

 Naechster Schritt: Aendere Zeile 12 und speichere die Datei.
```

**Technische Details:**
- `fs.watch()` beobachtet Exercise-Dateien auf Aenderungen
- Bei Aenderung: `child_process.execSync("npx tsc --noEmit --strict " + file)` fuer Type-Check
- Dann: `child_process.execSync("npx tsx " + file)` fuer Runtime-Check
- ~40 TypeScript-Fehlercodes mit deutschen Erklaerungen uebersetzt
- Laeuft als separater Prozess (TUI verlasst Alternate Screen Buffer)

---

## 18. Progressive Hints

**Datei:** `hint.ts` (388 Zeilen), `tui-exercises.ts` (310 Zeilen)
**Taste:** [H] im Lesson-Menue
**Lerntheorie:** Scaffolding (Vygotsky's Zone of Proximal Development), Desirable Difficulties

**Wie es im TUI aussieht:**
```
 ┌─ Exercises ─────────────┐  ┌─ Hints ──────────────────────────────────┐
 │                         │  │                                          │
 │ > 01-grundlagen.ts      │  │  Hint 1/3:                               │
 │   02-constraints.ts     │  │  Denke an den `extends`-Constraint.      │
 │   03-inference.ts       │  │  Was muss T koennen?                     │
 │   04-advanced.ts        │  │                                          │
 │                         │  │  [N] Naechster Hint                      │
 │                         │  │                                          │
 └─────────────────────────┘  └──────────────────────────────────────────┘
```

**Technische Details:**
- Daten in `hints.json` pro Lektion (JSON: Exercise-Name → Task → Hint-Array)
- Stufenweise Offenbarung: [N] zeigt naechsten Hint, [P] vorherigen
- Adaptiv: `scaffolding-engine.ts` passt Hint-Level basierend auf Performance an
- Erster Hint ist ein allgemeiner Denkanstoiss, letzter Hint ist fast die Loesung

---

## 19. Warm-Up

**Datei:** `tui-quiz.ts`, `pretest-engine.ts: getWarmupQuestions()`
**Taste:** Wird beim Start automatisch angeboten (ueberspringbar)
**Lerntheorie:** Retrieval Practice (Testing Effect — Roediger 2011)

**Technische Details:**
- 3 zufaellige Fragen aus abgeschlossenen Lektionen
- Nur einmal pro Session (warmupShownThisSession in tui-state.ts)
- Ueberspringbar (Enter oder Esc)
- Nutzt den gleichen 3-Phasen-Flow wie regulaere Quizzes

---

## 20. Pre-Test

**Datei:** `tui-quiz.ts`, `pretest-engine.ts` (430 Zeilen)
**Taste:** Automatisch beim Oeffnen einer neuen Sektion angeboten
**Lerntheorie:** Pretesting Effect (Richland, Kornell & Kao 2009), Expertise Reversal (Kalyuga 2003)

**Wie es im TUI aussieht:**
```
 Pre-Test: L13 > S4: Constraints

 Frage 1/3: Was passiert wenn du einen Typparameter ohne Constraint verwendest?

 (a) TypeScript inferiert den engsten moeglichen Typ
 (b) T wird als `any` behandelt
 (c) T wird als `unknown` behandelt — keine Operations erlaubt
 (d) Es gibt einen Compile Error

 Wie sicher bist du? [1] [2] [3] [4]
```

**Nach dem Pre-Test:**
```
 Ergebnis: 2/3 richtig

 Empfohlene Tiefe: STANDARD
 Du kennst die Grundlagen, aber es gibt Details die sich lohnen.

 [Enter] Sektion mit Standard-Tiefe lesen
 [K] Kurz-Version (nur Zusammenfassung)
 [V] Vollstaendige Version (mit allen Details)
```

---

## 21. Interleaved Review

**Datei:** `tui-quiz.ts`, `interleave-engine.ts` (491 Zeilen), `interleave-data.ts` (538 Zeilen, 20 Templates)
**Taste:** [I] im Hauptmenue
**Lerntheorie:** Interleaving (Rohrer & Taylor 2007 — +43% vs. Blocked Practice)

**Technische Details:**
- 20 vordefinierte Challenge-Templates die Konzepte aus mehreren Lektionen mischen
- Typen: predict-output, fix-error, complete-code, explain
- Erscheint nur nach 3+ abgeschlossenen Lektionen
- Zeitbasierte Pruefung: `isInterleaveReviewDue()` — nicht oefter als alle 3 Tage
- Filtert nach tatsaechlich abgeschlossenen Lektionen

---

## 22. Kompetenz-Dashboard

**Datei:** `tui-stats.ts` (180 Zeilen)
**Taste:** [K] im Hauptmenue
**Lerntheorie:** Metacognition, Self-Determination Theory (Kompetenz)

**Wie es im TUI aussieht:**
```
 Kompetenz-Dashboard                                                     ⏱ 8:45
 ─────────────────────────────────────────────────────────────────────────────────
 Staerken:
   Du kannst Primitive Types sicher einsetzen und Typ-Hierarchien erklaeren.
   Du verstehst Type Inference und weisst wann explizite Annotationen noetig sind.

 In Arbeit:
   Generics Basics — 3 Sektionen noch offen.

 Empfohlen:
   L14 Generic Patterns starten (baut auf L13 auf).

 7-Tage-Aktivitaet: ▄▂▅▇▃▆▁

 Mastery pro Lektion:
   L01 ████████████████ Expert       L06 ████████████░░░░ Proficient
   L02 ████████████████ Expert       L07 ████████░░░░░░░░ Familiar
   L03 ████████████████ Expert       L08 ████████░░░░░░░░ Familiar
   L04 ██████████████░░ Proficient   ...
```

**Technische Details:**
- Beschreibendes Feedback statt nur Zahlen ("Du kannst X" statt "Score: 87%")
- Sparklines (`visual-utils.ts: sparkline()`) fuer 7-Tage-Aktivitaet
- Empfehlungen basierend auf naechster unvollstaendiger Lektion
- Mastery-Level-Farben: Expert=gruen, Proficient=gelb, Familiar=cyan, Newcomer=grau

---

## 23. Farbthemen

**Datei:** `config.ts` (217 Zeilen), `themes.ts` (239 Zeilen)
**Lerntheorie:** Self-Determination Theory (Autonomie)

**3 Themes:**
- **dark** (Standard): Dunkler Hintergrund, helle Schrift, ANSI-Standardfarben
- **light**: Heller Hintergrund, dunkle Schrift
- **solarized**: Solarized-Farbpalette mit 24-bit RGB-Farben

**Technische Details:**
- Theme wird in `config.json` gespeichert
- 24-bit RGB-Farben via `\x1b[38;2;R;G;Bm` Escape-Codes
- Noch kein Theme-Switching im TUI — nur ueber Config-Datei aenderbar

---

## 24. Exercise-Menue (4 Stufen)

**Datei:** `tui-exercises.ts` (310 Zeilen)
**Taste:** [E] im Lesson-Menue
**Lerntheorie:** Faded Worked Examples (Renkl, Atkinson & Maier 2002)

**Wie es im TUI aussieht:**
```
 L13 Generics Basics — Exercises

 [1]  Worked Examples         Kommentierte Beispiele durchlesen
 [2]  Completion Problems     Luecken im Code fuellen (6 Aufgaben)
 [3]  Full Exercises          Eigenstaendig loesen mit Watch-Runner
 [4]  Misconceptions          Fehlkonzeptionen entlarven (8 Challenges)
```

**Progression:** Worked Example → Completion Problem (Luecken) → Full Exercise → Misconception (die haerteste Stufe). Diese Progression ist die "Faded Worked Examples"-Methode von Renkl (2002).

---

## 25. Dynamische Statistiken

**Datei:** `tui-utils.ts` (getCourseProgressSummary)
**Lerntheorie:** Metacognition (Selbsteinschaetzung — akkurate Zahlen statt Schaetzungen)

**Technische Details:**
- `getCourseProgressSummary()` zaehlt Dateien auf der Festplatte statt statische Werte aus `platform.json` zu nehmen
- Gezaehlt werden: `sections/*.md` (Sektionen), `exercises/*.ts` (Exercises), Lesezeit (Sektionen * 10 Min + Exercises * 15 Min)
- Ergebnis wird in `courseProgressCache` gecacht (nicht bei jedem Render neu berechnen)
- Aktualisiert beim Kurswechsel und beim Oeffnen der Kursauswahl
