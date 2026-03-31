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

## Aktueller Stand (2026-03-31)

- **TypeScript:** 20 von 40 Lektionen fertig (Phase 1+2 komplett, ~935 Dateien)
- **Angular/React/Next.js:** Nur Curricula, keine Lektionen
- **TUI:** 39 Module, 15.385 Zeilen, 25 Features, modularisiert
- **Plattform:** 4 Kurse registriert, Lock-System, dynamische Statistiken

## Was als naechstes zu tun ist (Prioritaetsreihenfolge)

### 1. TypeScript Phase 3 erstellen (L21-L30)

Lektionen:
- L21: Classes & OOP in TypeScript
- L22: Advanced Generics (Higher-order types, Variance)
- L23: Recursive Types (Selbstreferenzierende Typen)
- L24: Branded/Nominal Types (Type-safe IDs, Opaque types)
- L25: Type-safe Error Handling (Result<T,E>, exhaustive errors)
- L26: Advanced Patterns (Builder, State Machine, Phantom Types)
- L27: Declaration Merging (Module augmentation, global)
- L28: Decorators (Legacy & Stage 3)
- L29: tsconfig Deep Dive (Alle compiler flags)
- L30: Review Challenge Phase 3

**KRITISCH: Qualitaets-Checkliste STRIKT beachten!**

Jede Sektion MUSS haben (siehe `docs/04-QUALITY-PROCESS.md` fuer Details und Beispiele):
- [ ] "Was du hier lernst" (3-4 konkrete Bullet Points mit Lernzielen)
- [ ] Mindestens 1 Hintergrundgeschichte oder Feature Origin Story
- [ ] Mindestens 1 Self-Explanation Prompt ("Erklaere dir selbst: ..." mit Kernpunkten)
- [ ] Mindestens 1 Denkfrage ("Denkfrage: ..." mit Nachdenk-Pause)
- [ ] Mindestens 1 Experiment-Box ("Experiment: ..." mit konkreter Anweisung)
- [ ] Mindestens 1 annotierter Code-Block (```typescript annotated)
- [ ] Mindestens 1 Framework-Bezug ("In deinem Angular-Projekt..." / "In React...")
- [ ] "Was du gelernt hast" + Kernkonzept am Ende
- [ ] Pausenpunkt + Link zur naechsten Sektion

Jede Lektion MUSS haben:
- [ ] 5-7 Sektionen (je ~10 Min, 280-320 Zeilen)
- [ ] 5-6 Examples (lauffaehige .ts Dateien)
- [ ] 5-6 Exercises (mit // TODO: Markern)
- [ ] Solutions (mit ausfuehrlichen Erklaerungen)
- [ ] 15 Quiz-Fragen: correct-Indizes gleichmaessig verteilen! (4x Index 0, 4x Index 1, 4x Index 2, 3x Index 3) — NICHT alle correct: 1!
- [ ] elaboratedFeedback fuer JEDE Quiz-Frage (whyCorrect + commonMistake)
- [ ] pretest-data.ts (3 Fragen pro Sektion)
- [ ] misconceptions.ts (8 Misconceptions)
- [ ] completion-problems.ts (6 Aufgaben, steigende Schwierigkeit)
- [ ] debugging-data.ts (5 Challenges)
- [ ] parsons-data.ts (3-4 Problems mit 1-2 Distraktoren)
- [ ] tracing-data.ts (4 Exercises)
- [ ] transfer-data.ts (2-3 Tasks in NEUEM Kontext)
- [ ] hints.json (progressive Hints fuer alle Exercises)
- [ ] cheatsheet.md

**Referenz:** Lies `typescript/02-primitive-types/sections/01-das-typsystem-ueberblick.md` als Qualitaets-Massstab. Deine Sektionen muessen MINDESTENS so gut sein.

### 2. Adaptives Tiefensystem implementieren

Design in `docs/10-ADAPTIVE-SYSTEM.md`. Kernidee:
- Markdown-Marker: `<!-- section:summary -->`, `<!-- depth:standard -->`, `<!-- depth:vollstaendig -->`
- `filterByDepth()` Funktion in `markdown-renderer.ts`
- Pre-Test auf Lektionsebene statt Sektionsebene (effizienter)
- Integration in `tui-section-reader.ts`

### 3. Abwechslungsformate einbauen

8 neue Formate (Details in `docs/09-DIDACTIC-FORMATS.md`):
- POE-Bloecke (Predict-Observe-Explain) — in Sektions-Markdown
- Kontrastive Paare — in Sektions-Markdown
- Feature Origin Stories — in Sektions-Markdown
- Finde-den-Bug inline — in Sektions-Markdown
- "In deinem Projekt"-Bezuege — in Sektions-Markdown
- "Callback to Earlier"-Vernetzung — in Sektions-Markdown
- Mehr Mermaid-Diagramme — in Sektions-Markdown
- Aha-Moment-Demonstrationen — in Sektions-Markdown

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
- **Nach jeder Session:** docs/06-SESSION-LOG.md aktualisieren!

## Bekannte Probleme und Warnungen

1. **Qualitaets-Regression:** Ab L13 sinkt die Qualitaet. IMMER gegen L02 als Referenz pruefen.
2. **Quiz-Bias:** correct-Indizes MUESSEN gleichmaessig verteilt sein (4/4/4/3 bei 15 Fragen). In L06-L16 waren 93% aller Antworten `correct: 1` — das wurde gefixt, aber bei neuen Lektionen darauf achten!
3. **Pretest-Bias:** Gleiche Bias-Gefahr bei pretest-data.ts — noch nicht systematisch geprueft.
4. **TS 5.5 Inferred Type Predicates:** `arr.filter(x => x !== null)` gibt seit TS 5.5 `T[]` statt `(T | null)[]` zurueck. Das betrifft viele Erklaerungen und Uebungen.
5. **Sektionen-Laenge:** Sektionen MUESSEN 280-320 Zeilen haben, nicht 150. Kuerzere Sektionen = weniger Tiefe = Qualitaetsregression.
6. **Circular Dependencies:** `tui-state.ts` darf NICHTS von Screen-Modulen importieren! Nur umgekehrt.

---
