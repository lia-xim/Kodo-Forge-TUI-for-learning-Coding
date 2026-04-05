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

- **TypeScript:** **40 von 40 Lektionen fertig** (alle 4 Phasen komplett)
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

### KRITISCH: L17, L18, L19 komplett neu schreiben

Diese 3 Lektionen haben eine schwere Qualitaets-Regression. Audit-Ergebnis: Note C.
- Sektionen nur **83-127 Zeilen** statt Ziel 280-320
- Fast **alle didaktischen Elemente fehlen** (kein Geschichte, kein Self-Explanation, kein Denkfrage, kein Experiment, kein annotierter Code, kein Framework-Bezug, kein "Was du gelernt hast")
- Sektionen lesen sich wie Referenzkarten/Cheatsheets, nicht wie Lernsektionen

**Vorgehen:** Max. 3 Lektionen pro Agent-Run. Jede Sektion MUSS 280-320 Zeilen haben. Qualitaets-Checkliste unten beachten.

**L17: Conditional Types** (`typescript/17-conditional-types/sections/`)
**L18: Template Literal Types** (`typescript/18-template-literal-types/sections/`)
**L19: Modules & Declarations** (`typescript/19-modules-und-declarations/sections/`)

### HOCH: L12, L13, L14 aufwerten

Audit-Ergebnis: B bis B-. Hauptprobleme:
- **L12 Discriminated Unions:** Kein Experiment, kein Framework-Bezug, kein "Was du gelernt hast" (nur Tabelle), keine Denkfrage
- **L13 Generics Basics:** S01 fehlen Geschichte, Experiment, Framework, Denkfrage, "Was du gelernt hast"
- **L14 Generic Patterns:** Keine Geschichten, keine Experimente, keine Framework-Bezuege, keine Denkfragen

Ansatz: Sektionen ergaenzen (nicht komplett neu schreiben). Fehlende Elemente hinzufuegen.

### HOCH: L35-L39 Sektionen verlaengern

Audit-Ergebnis: A- bis B. Alle didaktischen Elemente vorhanden, aber Sektionen zu kurz:
- L35: 237-258 Zeilen
- L36: 266-273 Zeilen
- L37: 226-245 Zeilen (deutlich unter Ziel)
- L38: 238-275 Zeilen
- L39: 214-232 Zeilen (kuerzeste im ganzen Kurs!)

### MITTEL: L01-L09 extern→inline Experiment-Referenzen

Mehrere fruehe Lektionen haben Experiment-Boxen die auf `examples/`-Dateien verweisen.
Das widerspricht der neuen Philosophie (Code inline, kein Datei-Wechsel).
Betroffen: L02, L03, L06, L07, L09 (und teils L05, L11, L12, L13, L15, L16, L25)

### NIEDRIG: Angular-Kurs starten

Wenn TypeScript-Qualitaets-Fixes abgeschlossen: Angular-Kurs beginnen (40 Lektionen).
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

1. **L17/L18/L19 kritisch:** Sektionen 83-127 Zeilen, alle didaktischen Elemente fehlen. Komplett-Rewrite noetig!
2. **L12-L14 lueckenhaft:** Mehrere fehlende Qualitaetselemente (Experimente, Framework, Denkfragen, "Was du gelernt hast")
3. **L35-L39 zu kurz:** 214-258 Zeilen statt 280-320 Ziel. Sektionen ausbauen.
4. **Quiz-Bias (Index):** correct-Indizes MUESSEN gleichmaessig verteilt sein (4/4/4/3).
5. **Quiz-Bias (Laenge):** Die laengste/komplexeste Antwort darf NICHT systematisch die richtige sein.
6. **Pretest-Bias:** Gleiche Bias-Gefahr bei pretest-data.ts — noch nicht systematisch geprueft.
7. **TS 5.5 Inferred Type Predicates:** `arr.filter(x => x !== null)` gibt seit TS 5.5 `T[]` statt `(T | null)[]` zurueck.
8. **Circular Dependencies:** `tui-state.ts` darf NICHTS von Screen-Modulen importieren! Nur umgekehrt.

---
