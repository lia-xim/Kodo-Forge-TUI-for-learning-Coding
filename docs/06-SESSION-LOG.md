# Session-Log: Was wurde wann gemacht

> Letzte Aktualisierung: 2026-03-31

---

## Session 1 (2026-03-31) — Initiale Erstellung + Massive Erweiterung

Diese Session war eine Marathon-Session in der das gesamte Projekt von Null aufgebaut wurde. Das umfasste: Projektstruktur, 20 Lektionen, 39 Plattform-Module, 25 Features, 4 Curricula, Qualitaets-Audits und Dokumentation.

### Phase 1: Projektaufbau

**Entscheidung:** Terminal-UI statt Web-App.
**Warum:** Der Lernende arbeitet taeglich im Terminal. Keine Ablenkungen, sofort startbar, 0 Dependencies.

1. TypeScript-Lernprojekt initialisiert (package.json mit 0 Runtime-Dependencies, tsconfig.json mit strict)
2. LEARN-Zyklus konzipiert: **L**esen, **E**rkunden, **A**nwenden, **R**eflektieren, **N**achschlagen — jeder Buchstabe ist eine Aktivitaet mit zugehoeriger Datei
3. Quiz-Runner und Type-Test Utilities erstellt (`quiz-runner.ts`, `type-test.ts`)
4. CURRICULUM.md mit 40-Lektionen-Plan erstellt — 4 Phasen: Foundations → Type System Core → Advanced → Mastery

**Was funktioniert hat:** Die LEARN-Struktur hat sich bewaehrt — jede Lektion hat konsistente Datei-Typen.
**Was nicht funktioniert hat:** Der erste Entwurf hatte nur 3 Phasen — Phase 2 war zu gross und wurde spaeter in 2+3 geteilt.

### Phase 2: Erste 5 Lektionen (L01-L05)

**Entscheidung:** Parallele Agent-Erstellung mit Review.
**Warum:** Geschwindigkeit — 5 Lektionen parallel statt sequenziell.

5. 5 parallele Agenten erstellten L01-L05 (Setup, Primitives, Inference, Arrays, Objects)
6. 5 Review-Agenten prueften und verbesserten jede Lektion — jeder Agent liest die gesamte Lektion und gibt Verbesserungsvorschlaege
7. 5 Restructure-Agenten teilten die monolithischen READMEs in ~10-Min-Sektionen auf (Cognitive Load Theory)
8. 5 Enhancement-Agenten fuegten hinzu: Mermaid-Diagramme, Predict-Output-Aufgaben, Error-Reading-Uebungen, Rubber-Duck-Prompts

**Was funktioniert hat:** L02 (Primitive Types) wurde zum Qualitaets-Massstab — sehr gut gelungen.
**Was nicht funktioniert hat:** Einige Agents folgten der Struktur nicht exakt, mussten manuell nachgebessert werden.

### Phase 3: Tool-Infrastruktur

**Entscheidung:** Alle Tools selbst bauen statt Libraries verwenden.
**Warum:** 0-Dependency-Philosophie, Lerneffekt, volle Kontrolle.

9. Spaced Repetition Runner (`review-runner.ts`, 603 Zeilen) — SM-2-aehnlich, Intervalle 1→2→4→8→16→30 Tage
10. Rustlings-Stil Watch-Runner (`watch-runner.ts`, 825 Zeilen) — ~40 deutsche Fehlermeldungen
11. Hint-System (`hint.ts`, 388 Zeilen) + Playground-Links (`playground-link.ts`, 255 Zeilen)
12. Fullscreen TUI mit Alternate Screen Buffer — der groesste Einzelschritt, ~7.128 Zeilen initial als Monolith
13. Markdown-Renderer mit Syntax-Highlighting (`markdown-renderer.ts`, 1.074 Zeilen) — parst Markdown, Headings, Bold, Italic, Code-Bloecke, Tabellen, Listen, Blockquotes
14. Diagram-Renderer (`diagram-renderer.ts`, 978 Zeilen) — Mermaid-Flowcharts als Box-Drawing im Terminal
15. Visual Utilities (`visual-utils.ts`, 425 Zeilen) — Sparklines, Braille-Charts, farbige Boxen

**Was funktioniert hat:** Der Markdown-Renderer ist ueberraschend gut geworden — Syntax-Highlighting im Terminal sieht professionell aus.
**Was nicht funktioniert hat:** Der Diagram-Renderer kann nur einfache Flowcharts, keine Sequenz- oder Klassen-Diagramme.

### Phase 4: Wissenschaftlich fundierte Features

**Entscheidung:** Deep-Research zu Lerntheorien vor der Implementierung.
**Warum:** Kein "ich glaube das funktioniert" — sondern "die Studie von X zeigt dass Y mit Effektstaerke Z".

16. Deep-Research zu 7 Lerntheorien (CLT, Testing Effect, Desirable Difficulties, Self-Explanation, Expertise Reversal, SDT, Metacognition)
17. 12 wissenschaftliche Features implementiert (Pre-Tests, Self-Explanation-Pause, Misconceptions, Metacognitive Prompts, etc.)
18. Didaktik-Engines: Pretest (430Z), Adaptive (505Z), Interleave (491Z), Scaffolding (460Z), Tracing (468Z), Parsons (346Z), Debugging (409Z), Transfer (251Z)
19. Content-Daten fuer alle 5 Lektionen: pretest-data.ts, misconceptions.ts, completion-problems.ts, debugging-data.ts, parsons-data.ts, tracing-data.ts, transfer-data.ts

**Was funktioniert hat:** Die Self-Explanation-Auto-Pause ist ein Highlight — der Lernende wird zum Nachdenken "gezwungen" (auf gute Weise).
**Was nicht funktioniert hat:** Die Adaptive Engine ist technisch fertig, aber die Markdown-Marker fuer Content-Filterung fehlen noch.

### Phase 5: TUI-Erweiterungen

20. Smooth Scrolling + Mouse Scroll (Alternate Scroll Mode — Mausrad sendet Arrow Keys)
21. Continue Where You Left Off (lastLesson, lastSection, lastScrollOffset in Progress)
22. VS Code Integration (code-Befehl als Fire-and-forget Child-Process)
23. Volltextsuche (Debounce 150ms, durchsucht alle Sektionen), Lesezeichen (M/B/X), History (Ring-Buffer 20)
24. Metacognitive Prompts: 3-Phasen-Flow (Frage → Confidence → Feedback) fuer alle Quiz-Varianten
25. Session-Timer (im Header) + Tages-Zusammenfassung (beim Beenden)
26. [?] Shortcut-Hilfe (kontextabhaengig pro Screen), Breadcrumbs (im Header)
27. Text-to-Speech (Windows PowerShell Speech Synthesizer, Deutsche Stimme "Microsoft Katja")
28. Responsives Bento-Grid fuer Kursauswahl (3 Layout-Modi je nach Terminal-Breite)

### Phase 6: Multi-Kurs-Plattform

**Entscheidung:** 4 Kurse als eigenstaendige Verzeichnisse mit zentraler Platform.
**Warum:** Skalierbarkeit — jeder Kurs kann unabhaengig wachsen, die Plattform verbindet sie.

29. Kursverzeichnisse erstellt (angular/, react/, nextjs/)
30. CURRICULUM.md fuer alle 4 Kurse (TS 40L, Angular 40L, React 40L, Next.js 20M)
31. platform.json mit Kurs-Registry, Voraussetzungsketten (TS → Angular/React → Next.js), Lock-System
32. Kursauswahl-Screen im TUI mit dynamischen Statistiken

### Phase 7: Lektionen 06-20

33. L06-L10 erstellt (Functions, Unions, Aliases, Enums, Review) — Phase 1 komplett (10/10)
34. L11-L15 erstellt (Narrowing, Discriminated Unions, Generics, Generic Patterns, Utility Types)
35. L16-L20 erstellt (Mapped Types, Conditional Types, Template Literals, Modules, Review Phase 2)

**Was nicht funktioniert hat:** Ab L13 sank die Qualitaet messbar — die Qualitaets-Regression (siehe `docs/04-QUALITY-PROCESS.md`). Ursache: Zu viele Lektionen in einer Sitzung.

### Phase 8: Qualitaetssicherung

**Entscheidung:** Systematische Audits statt stichprobenartig.
**Warum:** Die Qualitaets-Regression zeigte, dass unbemerkter Qualitaetsverlust das groesste Risiko ist.

36. Deep Audit aller 5 Original-Lektionen (L01-L05) — 22 Fixes (TS-Versionen, Fehler in Quiz/Pretest/Misconceptions)
37. TS 5.5 Inferred Type Predicates: 22 Stellen ueber 5 Lektionen korrigiert — `filter(x => x !== null)` gibt jetzt `T[]` statt `(T | null)[]`
38. Quality Audit L06-L16: Regression erkannt (L16 hatte C+ Bewertung, NULL didaktische Elemente)
39. Quiz-Bias Fix: 165 Fragen in 11 Dateien umgeordnet — vorher 93% `correct: 1`, nachher 4/4/4/3 Verteilung
40. L13 Sektionen 04-06: 12 didaktische Elemente hinzugefuegt (Denkfragen, Experimente, Praxis-Bezuege)
41. L15 + L16 massiv angereichert: Hintergrundgeschichten, Analogien, Experimente, Framework-Bezuege, Self-Explanation-Prompts

### Phase 9: Architektur-Refactoring

**Entscheidung:** TUI modularisieren.
**Warum:** 7.128 Zeilen in einer Datei sind unwartbar. Circular Dependencies vermeiden.

42. TUI modularisiert: 7.128-Zeilen-Monolith → 19 Module. Regel: `tui-state.ts` importiert NICHTS von Screen-Modulen.
43. React-Ink-Experiment entfernt — ein anderer Agent hatte versucht, das TUI mit React Ink nachzubauen, war aber nur 15% fertig und hatte Architekturprobleme. Entscheidung: Original beibehalten.
44. Dynamische Statistiken: Kursauswahl zaehlt Dateien von der Festplatte statt statische Werte aus platform.json.

### Phase 10: Analysen fuer naechste Schritte

45. Didaktische Abwechslungsanalyse: 8 neue Formate identifiziert (POE-Bloecke, Kontrastive Paare, Feature Origin Stories, Finde-den-Bug inline, "In deinem Projekt"-Bezuege, "Callback to Earlier"-Vernetzung, mehr Mermaid-Diagramme, Aha-Moment-Demonstrationen)
46. Adaptives Tiefensystem designed: Markdown-Marker → filterByDepth() → Pre-Test auf Lektionsebene
47. Framework-spezifische Didaktik analysiert: Marble Diagrams (RxJS), DI-Baum-Tracer (Angular), Re-Render-Simulator (React), Caching-Schichten-Simulator (Next.js)

---

## Was noch aussteht

### Hohe Prioritaet

- [ ] TypeScript Phase 3 (L21-L30): Classes & OOP, Advanced Generics, Recursive Types, Branded/Nominal Types, Type-safe Error Handling, Advanced Patterns, Declaration Merging, Decorators, tsconfig Deep Dive, Review Challenge
- [ ] TypeScript Phase 4 (L31-L40): Async, APIs, Testing, Performance, Migration, Library Authoring, Type-Level Programming, Compiler API, Best Practices, Capstone
- [ ] Adaptives Tiefensystem implementieren: Markdown-Marker (`<!-- section:summary -->`, `<!-- depth:standard -->`, `<!-- depth:vollstaendig -->`) + `filterByDepth()` in `markdown-renderer.ts`
- [ ] Abwechslungsformate einbauen: POE-Bloecke, Kontrastpaare, Feature Origin Stories, "Callback to Earlier"
- [ ] Pretest correct-Index Diversifizierung (gleiche Bias wie bei Quiz — noch nicht geprueft/gefixt)

### Mittlere Prioritaet

- [ ] Angular-Kurs Lektionen erstellen (40 Lektionen, Curriculum fertig)
- [ ] React-Kurs Lektionen erstellen (40 Lektionen, Curriculum fertig)
- [ ] Next.js-Kurs Module erstellen (20 Module, Curriculum fertig)
- [ ] Framework-spezifische Didaktik-Engines (Marble Diagrams, DI-Tracer, Re-Render-Simulator)
- [ ] Qualitaets-Audits fuer L17-L20 (noch nicht auditiert)

### Niedrige Prioritaet

- [ ] Farbthemen-Switching im TUI (aktuell nur ueber config.json)
- [ ] Config-Screen (Settings)
- [ ] Progress-Export als Markdown
- [ ] Kalibrierungs-Tracking ueber Sessions hinweg
- [ ] Horizontales Scrollen fuer lange Code-Zeilen

---

## Entscheidungsprotokoll

| Entscheidung | Alternativen | Warum diese Wahl | Ergebnis |
|-------------|-------------|-------------------|---------|
| Terminal statt Web | Electron, Browser | Keine Ablenkungen, 0 Deps, Arbeitsumgebung | Sehr gut |
| 0 Dependencies | chalk, ink, blessed | Langlebigkeit, Startzeit, Sicherheit | Sehr gut |
| Eigener Markdown-Renderer | marked, remark | 0 Deps, volle Kontrolle ueber ANSI | Gut (1.074Z, aber funktioniert) |
| Monolith → 19 Module | Behalten als Monolith | Wartbarkeit, Circular Deps | Notwendig |
| SM-2-aehnlich statt echtes SM-2 | Anki-Algorithmus, Leitner | Einfacher, guter Kompromiss | OK (verbesserbar) |
| Parallel-Agent-Erstellung | Sequenziell | Geschwindigkeit | Gut (aber Qualitaetsrisiko) |
| React-Ink verwerfen | Ink-basiertes TUI | Nur 15% fertig, Architekturprobleme | Richtige Entscheidung |
| 10-Min-Sektionen | 20-Min, 5-Min | CLT-Forschung, Microlearning-Ansatz | Bewaehrt |
