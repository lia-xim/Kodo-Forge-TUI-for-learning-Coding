# Uebergabe-Prompt fuer die naechste Session

Kopiere diesen Text als ersten Prompt in die naechste Claude-Session:

---

Ich arbeite an einer Multi-Kurs-Lernplattform im Terminal (TUI). Das Projekt liegt in `C:\Users\matth\Documents\Learning\`. Lies bitte zuerst diese Dateien um den Kontext zu verstehen:

**Pflicht-Lektuere (in dieser Reihenfolge):**
1. `CLAUDE.md` — Kurzkontext und Regeln
2. `docs/01-PROJECT-OVERVIEW.md` — Was das Projekt ist, alle Kurse, Metriken
3. `docs/02-ARCHITECTURE.md` — 39 Module, Datenfluss, State-Management
4. `docs/04-QUALITY-PROCESS.md` — Qualitaets-Checkliste (PFLICHT bei neuen Lektionen!)

**Bei Bedarf zusaetzlich:**
5. `docs/03-DIDACTIC-FOUNDATIONS.md` — 12 Lerntheorien mit Studien
6. `docs/05-FEATURES.md` — Alle 25 Features im Detail
7. `docs/08-CURRICULUM-PLANS.md` — Alle Kurs-Curricula
8. `docs/09-DIDACTIC-FORMATS.md` — Alle Uebungsformate
9. `docs/10-ADAPTIVE-SYSTEM.md` — Geplantes adaptives Tiefensystem
10. `docs/11-FRAMEWORK-DIDACTICS.md` — Framework-spezifische Lernmethoden

**Technische Referenz:**
11. `platform/platform.json` — Kurs-Registry
12. `typescript/CURRICULUM.md` — TypeScript-Lernpfad
13. `typescript/02-primitive-types/` — Referenz-Lektion (beste Qualitaet, als Vorlage verwenden!)

## Aktueller Stand (2026-04-05)

- **TypeScript:** 25 von 40 Lektionen fertig (Phase 1-2 komplett + L21-L25, ~935+ Dateien)
- **Angular/React/Next.js:** Nur Curricula, keine Lektionen
- **TUI:** 39 Module, 15.385 Zeilen, 25 Features, modularisiert
- **Plattform:** 4 Kurse registriert, Lock-System, dynamische Statistiken

## Lern-Philosophie (WICHTIG — vor allem anderen lesen!)

Der Lernende ist ein **theoretischer Lerner** der viel in kurzer Zeit aufnehmen will. Er bleibt im TUI und wird nie rausgerissen. Das bedeutet:

- **Kern = Lesen + Quizzes.** Reichhaltige Sektionen und starke Quiz-Fragen sind das Hauptprodukt.
- **Kein Wechsel zu IDE/Editor.** Code-Beispiele gehoeren inline in die Sektionen, NICHT als separate Dateien.
- **Keine Aufgaben-Pflicht.** Optionale Formate (Misconceptions, Completion, Debugging etc.) nur erstellen wenn sie fuer das Thema echten Mehrwert bringen — nicht als Checkliste abarbeiten.
- **Eigenverantwortlich.** Der Lernende entscheidet selbst wann er tiefer eintauchen will.
- **80% der Arbeit** in grossartige Sektionen und Quizzes investieren.

## Was als naechstes zu tun ist (Prioritaetsreihenfolge)

### 1. TypeScript Phase 3 fertigstellen (L26-L30)

Lektionen:
- L26: Advanced Patterns (Builder, State Machine, Phantom Types)
- L27: Declaration Merging (Module augmentation, global)
- L28: Decorators (Legacy & Stage 3)
- L29: tsconfig Deep Dive (Alle compiler flags)
- L30: Review Challenge Phase 3

**Qualitaets-Checkliste — Kern-Flow (PFLICHT):**

Jede Sektion MUSS haben (siehe `docs/04-QUALITY-PROCESS.md` fuer Details und Beispiele):
- [ ] "Was du hier lernst" (3-4 konkrete Bullet Points mit Lernzielen)
- [ ] Mindestens 1 Hintergrundgeschichte oder Feature Origin Story
- [ ] Mindestens 1 Self-Explanation Prompt ("Erklaere dir selbst: ..." mit Kernpunkten)
- [ ] Mindestens 1 Denkfrage ("Denkfrage: ..." mit Nachdenk-Pause)
- [ ] Mindestens 1 Experiment-Box — Code INLINE zeigen, NICHT auf externe Dateien verweisen!
- [ ] Mindestens 1 annotierter Code-Block (```typescript annotated)
- [ ] Mindestens 1 Framework-Bezug ("In deinem Angular-Projekt..." / "In React...")
- [ ] "Was du gelernt hast" + Kernkonzept am Ende
- [ ] Pausenpunkt + Link zur naechsten Sektion

Jede Lektion MUSS haben:
- [ ] 5-7 Sektionen (je ~10 Min, 280-320 Zeilen) — **DAS ist das Hauptprodukt!**
- [ ] 15+ Quiz-Fragen im **Format-Mix** (NICHT nur Multiple Choice!):
  - 6-8 Multiple Choice (correct-Indizes gleichmaessig, Antwortlaengen gleichmaessig!)
  - 3-4 Kurzantwort (`type: "short-answer"`) — Lernender tippt Antwort
  - 2-3 Predict-the-Output (`type: "predict-output"`) — Code zeigen, Ausgabe vorhersagen
  - 1-2 Erklaere-warum (`type: "explain-why"`) — offene Reflexion, Musterantwort
- [ ] elaboratedFeedback fuer JEDE Frage (whyCorrect + commonMistake)
- [ ] pretest-data.ts (3 Fragen pro Sektion)
- [ ] cheatsheet.md

**NICHT erstellen:**
- ~~exercises/*.ts~~ — Code inline in Sektionen
- ~~solutions/*.ts~~ — nicht noetig
- ~~examples/*.ts~~ — Code inline in Sektionen
- ~~hints.json~~ — nicht noetig

**Optional (nur wenn didaktisch sinnvoll fuer das spezifische Thema):**
- misconceptions.ts, completion-problems.ts, debugging-data.ts, parsons-data.ts, tracing-data.ts, transfer-data.ts

**Referenz:** Lies `typescript/02-primitive-types/sections/01-das-typsystem-ueberblick.md` als Qualitaets-Massstab. Deine Sektionen muessen MINDESTENS so reichhaltig sein (aber mit inline Code statt Datei-Verweisen).

### 2. Adaptives Tiefensystem implementieren

Design in `docs/10-ADAPTIVE-SYSTEM.md`. Kernidee:
- Markdown-Marker: `<!-- section:summary -->`, `<!-- depth:standard -->`, `<!-- depth:vollstaendig -->`
- `filterByDepth()` Funktion in `markdown-renderer.ts`
- Pre-Test auf Lektionsebene statt Sektionsebene (effizienter)
- Integration in `tui-section-reader.ts`

### 3. Abwechslungsformate in Sektionen einbauen

Formate die direkt in die Sektions-Markdown eingebettet werden (Details in `docs/09-DIDACTIC-FORMATS.md`):
- POE-Bloecke (Predict-Observe-Explain)
- Kontrastive Paare
- Feature Origin Stories
- Finde-den-Bug inline
- "In deinem Projekt"-Bezuege
- "Callback to Earlier"-Vernetzung
- Mehr Mermaid-Diagramme
- Aha-Moment-Demonstrationen

### 4. Nach TypeScript Phase 3+4: Framework-Kurse starten

Angular (40L), React (40L), Next.js (20M). Curricula in den jeweiligen Ordnern.

## Wichtige Regeln

- **Alle Texte auf Deutsch, Code auf Englisch**
- **0 externe Runtime-Dependencies** (nur tsx, typescript, @types/node als devDeps)
- **TypeScript 5.7+** — TS 5.5 Inferred Type Predicates beruecksichtigen!
- **Jede Sektion ~10 Min Lesezeit** (280-320 Zeilen)
- **Der Lernende nutzt Angular beruflich, React/Next.js privat** — Framework-Bezuege einbauen!
- **Qualitaet > Quantitaet** — lieber 2 exzellente Lektionen als 5 duenne
- **Maximal 3 neue Lektionen pro Agent-Run** — mehr fuehrt zu Qualitaets-Regression!
- **80% der Arbeit in Sektionen + Quizzes** — nicht in optionale Formate die keiner nutzt
- **Nach jeder Session:** docs/06-SESSION-LOG.md aktualisieren!

## Bekannte Probleme und Warnungen

1. **Qualitaets-Regression:** Ab L13 sinkt die Qualitaet. IMMER gegen L02 als Referenz pruefen.
2. **Quiz-Bias (Index):** correct-Indizes MUESSEN gleichmaessig verteilt sein (4/4/4/3). In L06-L16 waren 93% aller Antworten `correct: 1` — gefixt, aber bei neuen Lektionen darauf achten!
3. **Quiz-Bias (Laenge):** Die laengste/komplexeste Antwort darf NICHT systematisch die richtige sein. Antwortlaengen gleichmaessig verteilen!
4. **Pretest-Bias:** Gleiche Bias-Gefahr bei pretest-data.ts — noch nicht systematisch geprueft.
5. **TS 5.5 Inferred Type Predicates:** `arr.filter(x => x !== null)` gibt seit TS 5.5 `T[]` statt `(T | null)[]` zurueck.
6. **Sektionen-Laenge:** Sektionen MUESSEN 280-320 Zeilen haben, nicht 150. Kuerzere Sektionen = weniger Tiefe = Qualitaetsregression.
7. **Circular Dependencies:** `tui-state.ts` darf NICHTS von Screen-Modulen importieren! Nur umgekehrt.

---
