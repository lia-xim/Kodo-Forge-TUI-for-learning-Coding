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
8. `docs/09-DIDACTIC-FORMATS.md` — Alle Uebungsformate inkl. neues Quiz-Format-System

**Technische Referenz:**
9. `platform/platform.json` — Kurs-Registry
10. `typescript/CURRICULUM.md` — TypeScript-Lernpfad
11. `typescript/02-primitive-types/` — Referenz-Lektion (beste Qualitaet, als Vorlage verwenden!)

## Aktueller Stand (2026-04-05)

- **TypeScript:** **44 von 44 Lektionen fertig** — Phase 5 ergaenzt (Session 5)
- **Qualitaets-Fixes:** L17/L18/L19 komplett neu geschrieben (A), L12/L13/L14 enhanced (A), L35-L39 expandiert (A), L01-L27 extern→inline Experimente, Quiz-Bias L09/L14/L18/L31 gefixt, technische Fehler in L28/L29/L32/L37 behoben
- **Angular/React/Next.js:** Nur Curricula, keine Lektionen
- **TUI:** 39 Module, ~15.000+ Zeilen, 25 Features, modularisiert
- **Plattform:** 4 Kurse registriert, Lock-System, dynamische Statistiken
- **Quiz-System:** 4 Fragetypen (MC, short-answer, predict-output, explain-why) vollstaendig im TUI integriert

## Lern-Philosophie (WICHTIG — vor allem anderen lesen!)

Der Lernende ist ein **theoretischer Lerner** der viel in kurzer Zeit aufnehmen will. Er bleibt im TUI und wird nie rausgerissen. Das bedeutet:

- **Kern = Lesen + Quizzes.** Reichhaltige Sektionen und starke Quiz-Fragen sind das Hauptprodukt.
- **Kein Wechsel zu IDE/Editor.** Code-Beispiele gehoeren inline in die Sektionen, NICHT als separate Dateien.
- **Keine Aufgaben-Pflicht.** Optionale Formate (Misconceptions, Completion, Debugging etc.) nur erstellen wenn sie fuer das Thema echten Mehrwert bringen.
- **Eigenverantwortlich.** Der Lernende entscheidet selbst wann er tiefer eintauchen will.
- **80% der Arbeit** in grossartige Sektionen und Quizzes investieren.

## Was als naechstes zu tun ist (Prioritaetsreihenfolge)

### ERLEDIGT in Session 4 (2026-04-05)

- ✅ L17/L18/L19 komplett neu geschrieben (83-127 → 280-370 Zeilen, alle didaktischen Elemente)
- ✅ L12/L13/L14 aufgewertet (Experimente, Framework, Denkfragen, "Was gelernt hast")
- ✅ L35-L39 auf 280-320+ Zeilen expandiert
- ✅ L02/L03/L06/L07/L09/L11/L15/L25/L27 extern→inline Experimente
- ✅ L01/L04/L05/L08 fehlende Elemente ergaenzt, L32 Analogien
- ✅ Quiz-Bias: L09/L14/L18/L31 gefixt, L08 elaboratedFeedback inline migriert
- ✅ Technische Korrekturen: L28/L29/L32/L37
- ✅ Cross-lesson back-references: L08/L21/L26/L33/L40

### ERLEDIGT in Session 5 (2026-04-05)

- ✅ L22/S07: `NoInfer<T>` + `infer T extends X`
- ✅ L28/S07: `reflect-metadata` & Angular DI Internals
- ✅ L31/S07: `using` keyword & Explicit Resource Management
- ✅ L41: TypeScript 5.x Features (alle TS 5.0-5.7 Neuerungen)
- ✅ L42: TypeScript Security (gefaehrliche Muster, Parse-dont-validate)
- ✅ L43: TypeScript mit RxJS (Observable-Typen, Angular-Patterns)
- ✅ L44: Design Patterns Erweitert (GoF, SOLID, Repository, Strategy)

### OFFEN: Strukturelle Ergaenzungen (Entscheidung noetig)

**1. `using` keyword (TS 5.2 — Explicit Resource Management)**
- Fehlt komplett im Kurs
- Besonders relevant fuer Angular HTTP-Client-Management
- Empfehlung: Neue Sektion in L31 (Async TypeScript)

**2. `NoInfer<T>` (TS 5.4)**
- Fehlt komplett
- Empfehlung: Neue Sektion in L22 (Advanced Generics)

**3. `reflect-metadata` in L28 (Decorators)**
- Kritisch fuer Angular Dependency Injection
- Fehlt im Decorators-Kapitel

**4. Curriculum-Redundanzen (Diskussion noetig)**
- L07/S02+S03: Lehrt Type Guards und Discriminated Unions vor L11/L12 (leichter Vorgriff)
- L09/S05: Template Literals vor L18 (leichter Vorgriff)
- L05/S07: Utility Types vor Mapped Types in L16 (Reihenfolge-Problem?)

### NIEDRIG: Angular-Kurs starten

Curriculum in `angular/CURRICULUM.md`. Lernende kennt Angular beruflich — hoeheres Startniveau.

## Qualitaets-Checkliste (PFLICHT fuer neue/ueberarbeitete Sektionen)

### Jede Sektion MUSS haben:
- [ ] "Was du hier lernst" (3-4 konkrete Bullet Points mit Lernzielen)
- [ ] Mindestens 1 Hintergrundgeschichte oder Feature Origin Story
- [ ] Mindestens 1 Self-Explanation Prompt ("Erklaere dir selbst: ..." mit Kernpunkten)
- [ ] Mindestens 1 Denkfrage ("Denkfrage: ..." mit Nachdenk-Pause)
- [ ] Mindestens 1 Experiment-Box — Code **INLINE** zeigen, NICHT auf externe Dateien verweisen!
- [ ] Mindestens 1 annotierter Code-Block (```typescript annotated)
- [ ] Mindestens 1 Framework-Bezug ("In deinem Angular-Projekt..." / "In React...")
- [ ] "Was du gelernt hast" + Kernkonzept am Ende (Bullets, kein Tabellen-Ersatz!)
- [ ] Pausenpunkt + Link zur naechsten Sektion
- [ ] **Sektionslaenge: 280-320 Zeilen** (Kernregel!)

### Jede Lektion MUSS haben:
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

**Referenz:** `typescript/02-primitive-types/sections/01-das-typsystem-ueberblick.md` als Qualitaets-Massstab.
Deine Sektionen muessen MINDESTENS so reichhaltig sein (aber mit inline Code statt Datei-Verweisen).

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

1. **Quiz-Bias (Laenge):** Die laengste/komplexeste Antwort darf NICHT systematisch die richtige sein. (Quiz-Index-Bias wurde in Session 4 gefixt, Laengen-Bias noch nicht systematisch geprueft)
2. **TS 5.5 Inferred Type Predicates:** `arr.filter(x => x !== null)` gibt seit TS 5.5 `T[]` statt `(T | null)[]` zurueck.
3. **Circular Dependencies:** `tui-state.ts` darf NICHTS von Screen-Modulen importieren! Nur umgekehrt.
4. **Fehlende TS 5.x Features:** `using` (TS 5.2), `NoInfer<T>` (TS 5.4) noch nicht im Kurs.
5. **`reflect-metadata`** fehlt in L28 — wichtig fuer Angular DI-Verstaendnis.

---
