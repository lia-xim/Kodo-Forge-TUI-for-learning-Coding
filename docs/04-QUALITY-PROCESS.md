# Qualitaetssicherung: Prozesse und Erkenntnisse

> Letzte Aktualisierung: 2026-03-31

---

## 1. Wie wird Qualitaet sichergestellt?

### 1.1 Deep Audits pro Lektion

Fuer jede Lektion wird ein Audit-Agent gestartet der **ALLE** Dateien der Lektion liest (~30-36 Dateien) und systematisch prueft:

**Faktische Korrektheit:**
- TypeScript-Version stimmt (TS 5.7+, TS 5.5 Inferred Type Predicates beruecksichtigt)
- Compiler-Verhalten korrekt beschrieben (z.B. `strictNullChecks` Verhalten)
- Code-Beispiele wuerden mit `tsc --strict` kompilieren
- ECMA-Stage-Nummern und TC39-Status aktuell

**Quiz-Qualitaet:**
- `correct`-Index stimmt mit der tatsaechlich richtigen Option ueberein (manuell geprueft!)
- Antwort-Indizes gleichmaessig verteilt (nicht alle `correct: 1`!)
- `elaboratedFeedback.whyCorrect` erklaert tatsaechlich warum die Antwort richtig ist
- `elaboratedFeedback.commonMistake` nennt einen plausiblen haeufigen Fehler
- Distraktoren sind plausibel (nicht offensichtlich falsch)

**Didaktische Elemente:**
- [ ] Jede Sektion hat "Was du hier lernst" (3-4 Bullet Points)
- [ ] Mindestens 1 Hintergrundgeschichte oder Origin Story
- [ ] Mindestens 1 Self-Explanation Prompt (Erklaere dir selbst:)
- [ ] Mindestens 1 Denkfrage (Denkfrage:)
- [ ] Mindestens 1 Experiment-Box (Experiment:)
- [ ] Mindestens 1 annotierter Code-Block
- [ ] Mindestens 1 Framework-Bezug (Angular/React)
- [ ] "Was du gelernt hast" + Kernkonzept am Ende
- [ ] Pausenpunkt + Link zur naechsten Sektion

**Konsistenz:**
- Gleiche Struktur wie Referenz-Lektion L02 (die qualitativ beste)
- Sektionen haben konsistente Laenge (200-350 Zeilen, ~10 Min Lesezeit)
- Exercises bauen aufeinander auf
- Examples sind nummeriert und thematisch passend

### 1.2 Audit-Prozess (Schritt fuer Schritt)

```
Schritt 1: ALLE Dateien der Lektion lesen
    ├── sections/*.md (jede Sektion einzeln)
    ├── quiz-data.ts (alle 15 Fragen)
    ├── pretest-data.ts (alle Fragen)
    ├── misconceptions.ts (alle 8 Misconceptions)
    ├── completion-problems.ts
    ├── debugging-data.ts
    ├── parsons-data.ts
    ├── tracing-data.ts
    ├── transfer-data.ts
    ├── exercises/*.ts
    ├── solutions/*.ts
    ├── examples/*.ts
    ├── hints.json
    └── cheatsheet.md

Schritt 2: Faktische Korrektheit pruefen
    ├── Jedes Code-Beispiel: Wuerde es mit tsc --strict kompilieren?
    ├── Jede Typ-Aussage: Stimmt sie fuer TS 5.7+?
    ├── Jeder Verweis auf Compiler-Verhalten: Korrekt?
    └── Jeder historische Fakt: Stimmt die Versionsnummer/das Jahr?

Schritt 3: Quiz-Bias pruefen
    ├── correct-Indizes zaehlen (0, 1, 2, 3)
    ├── Erwartete Verteilung: ~4/4/4/3 bei 15 Fragen
    └── WARNUNG wenn >60% der Antworten den gleichen Index haben

Schritt 4: Didaktische Checkliste pruefen
    ├── Pro Sektion: Alle 9 Pflicht-Elemente vorhanden?
    ├── Pro Lektion: Alle Dateien vollstaendig?
    └── Vergleich mit L02 (Referenz-Qualitaet)

Schritt 5: Fixes anwenden
    ├── Fehlende Elemente hinzufuegen
    ├── Falsche Fakten korrigieren
    ├── Quiz-Indizes umordnen
    └── Sektionen anreichern falls noetig

Schritt 6: Ergebnis dokumentieren
    └── In docs/04-QUALITY-PROCESS.md eintragen
```

---

## 2. Die Qualitaets-Regression (das groesste Problem)

### 2.1 Was passiert ist

Wenn viele Lektionen in einer Session schnell erstellt werden, sinkt die Qualitaet der spaeteren Lektionen systematisch. Das wurde am 2026-03-31 erkannt, als die Qualitaet von L02 (Referenz) mit L16 (neueste) verglichen wurde.

### 2.2 Vergleichstabelle L02 vs L16

| Merkmal | L02 (Primitive Types) | L16 (Mapped Types) | Differenz |
|---------|:---------------------:|:-------------------:|:---------:|
| Sektions-Laenge (Durchschnitt) | ~312 Zeilen | ~153 Zeilen | -51% |
| Hintergrundgeschichten pro Sektion | 1-2 | 0 | -100% |
| Self-Explanation Prompts pro Sektion | 2-3 | 0-1 | -75% |
| Denkfragen pro Sektion | 1-2 | 0 | -100% |
| Experiment-Boxen pro Sektion | 1-2 | 0 | -100% |
| Framework-Bezuege pro Sektion | 1-2 | 0 | -100% |
| Annotierte Code-Bloecke | Ja | Nein | -100% |
| Quiz correct-Index-Verteilung | 4/4/4/3 | 0/15/0/0 (alle 1!) | Extreme Bias |
| Gesamtbewertung | A | C+ | Deutlicher Abfall |

### 2.3 Qualitaets-Verlauf aller Lektionen

| Lektion | Thema | Bewertung | Hauptproblem |
|---------|-------|:---------:|-------------|
| L01 | Setup & Erste Schritte | A- | Minor: Exercise-Antworten-Bias |
| L02 | Primitive Types | A | **Referenz** — alle Elemente vorhanden |
| L03 | Type Annotations & Inference | A- | Fast gleichwertig mit L02 |
| L04 | Arrays & Tuples | A- | Gute Qualitaet |
| L05 | Objects & Interfaces | A- | Gute Qualitaet, minor DeepReadonly-Fix |
| L06 | Functions | A- | Leichter Abfall bei Quiz-Bias |
| L07 | Union & Intersection Types | B+ | Weniger Geschichten, Quiz-Bias |
| L08 | Type Aliases vs Interfaces | B+ | Kuerzere Sektionen |
| L09 | Enums & Literal Types | B+ | Kuerzere Sektionen |
| L10 | Review Challenge | B+ | Spezielles Format (Review) |
| L11 | Type Narrowing | A- | Gut (wurde frueher erstellt) |
| L12 | Discriminated Unions | B+ | Quiz-Bias, weniger Tiefe |
| L13 | Generics Basics | B+ | Ab Sektion 4 trockener |
| L14 | Generic Patterns | B | Weniger didaktische Elemente |
| L15 | Utility Types | B | Deutlich weniger Tiefe → nachtraeglich angereichert |
| L16 | Mapped Types | C+ → B | Starker Abfall, NULL didaktische Elemente → massiv angereichert |
| L17 | Conditional Types | B | Aehnlich L16 vor Fix |
| L18 | Template Literal Types | B | Aehnlich L16 vor Fix |
| L19 | Modules & Declarations | B- | Trockenstes Thema, wenig Geschichten |
| L20 | Review Challenge Phase 2 | B | Spezielles Format |

### 2.4 Symptome der Regression im Detail

1. **Weniger Hintergrundgeschichten:** L02 erzaehlt die Geschichte von Anders Hejlsberg und Type Erasure. L16 hat NULL Geschichten — nur trockene Erklaerungen.

2. **Fehlende Self-Explanation Prompts:** L02 hat 2-3 pro Sektion. L16 hatte 0.

3. **Keine Experiment-Boxen:** L02 hat "Oeffne die REPL und probiere..." in jeder Sektion. L16 hatte keine.

4. **Keine Framework-Bezuege:** L02 verbindet jedes Konzept mit Angular/React. L16 erwaehnnt kein Framework.

5. **Kuerzere Sektionen:** L02 Sektionen sind ~312 Zeilen (reichhaltig). L16 Sektionen waren ~153 Zeilen (komprimiert, ohne Tiefe).

6. **Quiz-Antwort-Bias:** In L06-L16 hatten 93% aller Fragen `correct: 1` (immer Option B). Der Lernende koennte den Bias bemerken und immer B waehlen.

### 2.5 Ursache

Die Regression hat eine klare Ursache: Wenn ein Agent 5-10 Lektionen in einer Sitzung erstellt, sinkt die Qualitaet der spaeteren Lektionen weil:
- Der Kontext-Fenster voll ist und fruehe Qualitaets-Beispiele "vergessen" werden
- Zeit-Druck (implizit oder explizit) fuehrt zu kuerzeren Sektionen
- Die didaktische Checkliste wird nicht bei jeder Sektion aktiv geprueft

### 2.6 Gegenmassnahmen

1. **Qualitaets-Checkliste als PFLICHT:** Jede neue Sektion wird gegen die Checkliste geprueft bevor sie als fertig gilt
2. **Referenz-Lektion L02 als Template:** Jeder Agent bekommt L02 als Qualitaets-Referenz
3. **Nachtraegliche Audits:** Alle bestehenden Lektionen werden auditiert und angereichert
4. **Maximal 3 neue Lektionen pro Agent-Run:** Qualitaet > Quantitaet

---

## 3. Durchgefuehrte Fixes (vollstaendige Liste)

### 3.1 Quiz-Bias Fix (2026-03-31)

**Problem:** In L06-L16 hatten 93% aller Fragen `correct: 1` (immer die zweite Option war richtig).

**Umfang:** 165 Fragen in 11 Dateien umgeordnet.

**Betroffene Dateien:**
| Datei | Fragen | Vorher (Index-Verteilung) | Nachher |
|-------|-------:|---------------------------|---------|
| `typescript/06-functions/quiz-data.ts` | 15 | 0:0, 1:14, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/07-union-und-intersection-types/quiz-data.ts` | 15 | 0:0, 1:14, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/08-type-aliases-vs-interfaces/quiz-data.ts` | 15 | 0:1, 1:13, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/09-enums-und-literal-types/quiz-data.ts` | 15 | 0:0, 1:14, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/11-type-narrowing/quiz-data.ts` | 15 | 0:1, 1:13, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/12-discriminated-unions/quiz-data.ts` | 15 | 0:0, 1:14, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/13-generics-basics/quiz-data.ts` | 15 | 0:1, 1:13, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/14-generic-patterns/quiz-data.ts` | 15 | 0:0, 1:14, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/15-utility-types/quiz-data.ts` | 15 | 0:0, 1:15, 2:0, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/16-mapped-types/quiz-data.ts` | 15 | 0:0, 1:15, 2:0, 3:0 | 0:4, 1:4, 2:4, 3:3 |
| `typescript/10-review-challenge/quiz-data.ts` | 15 | 0:1, 1:13, 2:1, 3:0 | 0:4, 1:4, 2:4, 3:3 |

**Methode:** Fuer jede Frage: richtige Antwort-Option an eine neue Position verschieben, `correct`-Index anpassen, pruefen dass `elaboratedFeedback.whyCorrect` noch zur richtigen Option passt.

### 3.2 TS 5.5 Inferred Type Predicates Fix (2026-03-31)

**Problem:** Seit TypeScript 5.5 (Juni 2024) inferiert der Compiler automatisch Type Predicates in bestimmten Faellen. Der Code `arr.filter(x => x !== null)` gibt jetzt `T[]` statt `(T | null)[]` zurueck. Mehrere Lektionen enthielten veraltete Informationen.

**Betroffene Stellen (22 Fixes ueber 5 Lektionen):**

| Lektion | Datei | Fix |
|---------|-------|-----|
| L02 | quiz-data.ts, Frage 7 | "filter gibt (string \| null)[]" → "filter gibt seit TS 5.5 string[]" |
| L02 | misconceptions.ts, #4 | Altes filter-Verhalten als deprecated markiert |
| L03 | sections/02-wann-annotieren.md | Hinweis auf TS 5.5 Verhalten hinzugefuegt |
| L03 | pretest-data.ts, Frage 2 | Antwort aktualisiert |
| L03 | tracing-data.ts, #2 | Expected output aktualisiert |
| L04 | quiz-data.ts, Frage 11 | filter-Ergebnis-Typ korrigiert |
| L04 | sections/03-readonly-arrays.md | Hinweis hinzugefuegt |
| L04 | misconceptions.ts, #3 | Aktualisiert |
| ... | (weitere 14 Stellen) | Analoges Muster |

### 3.3 L15 + L16 Anreicherung (2026-03-31)

**Problem:** L15 (Utility Types) und L16 (Mapped Types) hatten deutlich weniger didaktische Elemente als L02.

**L15 Fixes (5 Sektionen):**
| Sektion | Hinzugefuegt |
|---------|-------------|
| 01 | Hintergrundgeschichte: Wie Utility Types in TS 2.1 entstanden, Self-Explanation, Angular FormBuilder-Bezug |
| 02 | Denkfrage zu Readonly vs ReadonlyArray, Experiment-Box |
| 03 | Framework-Bezug: React's ComponentProps<typeof Button>, Analogie |
| 04 | Origin Story: Warum Omit erst in TS 3.5 kam, Self-Explanation |
| 05 | Transfer-Bezug: Wie Utility Types in realen Projekten kombiniert werden |

**L16 Fixes (5 Sektionen):**
| Sektion | Hinzugefuegt |
|---------|-------------|
| 01 | Hintergrundgeschichte: Mapped Types als "Type-Level for-Schleife", Analogie (Stempelmaschine), Self-Explanation, Angular FormGroup-Bezug |
| 02 | Denkfrage, Experiment-Box, React Partial<State>-Bezug |
| 03 | Origin Story: Key Remapping mit `as` (TS 4.1), Self-Explanation |
| 04 | Framework-Bezug: Angular Signal-Store readonly mapping |
| 05 | Ausfuehrlicheres Praxis-Beispiel mit mehreren Patterns |

### 3.4 L13 Sektionen 04-06 Anreicherung (2026-03-31)

**Problem:** L13 (Generics Basics) wurde ab Sektion 4 trockener.

**Fixes (12 didaktische Elemente hinzugefuegt):**
| Sektion | Element | Beschreibung |
|---------|---------|-------------|
| 04 (Constraints) | Denkfrage | "Was passiert ohne extends-Constraint?" |
| 04 | Experiment | "Entferne den Constraint und beobachte die Fehlermeldung" |
| 04 | Tieferes Wissen | Vergleich TS Constraints vs Java Bounds |
| 05 (Default-Typparameter) | Hintergrundgeschichte | "Wie Default-Parameter in TS 2.3 eingefuehrt wurden" |
| 05 | Self-Explanation | "Warum ist Map<string, T> nicht das gleiche wie Map<string, unknown>?" |
| 05 | Framework-Bezug | "Angular's EventEmitter<T = void> nutzt genau dieses Pattern" |
| 06 (Praxis) | Denkfrage | "Wann sind Generics Overkill?" |
| 06 | Experiment | "Schreibe eine generische pipe()-Funktion" |
| 06 | Transfer | "Wie wuerde ein generischer HTTP-Service in Angular aussehen?" |
| 06 | Self-Explanation | "Warum braucht man Generics fuer einen typsicheren EventBus?" |
| 06 | Praxis-Bezug | "In deinem Angular-Projekt: Wo koenntest du Generics einsetzen?" |
| 06 | Annotierter Code-Block | HTTP-Service mit Generic Response-Type |

### 3.5 Sonstige Audit-Fixes (2026-03-31)

| Lektion | Datei | Problem | Fix |
|---------|-------|---------|-----|
| L01 | exercises/02-*.ts | Alle Antworten waren "b" | Antworten gemischt (a/b/c/d) |
| L01 | exercises/04-*.ts | Assert-Inkonsistenz | Assertions vereinheitlicht |
| L01 | quiz-data.ts | ES3 Target (ungueltig in TS 5.x) | ES3 → ES5 |
| L02 | sections/01-*.md | Mermaid-Diagramm Pfeilrichtung | Pfeil korrigiert |
| L02 | quiz-data.ts | useUnknownInCatchVariables Versionsnummer | 4.0 → 4.4 |
| L05 | quiz-data.ts | DeepReadonly fehlender Function-Check | Function-Check hinzugefuegt |
| L05 | sections/03-*.md | noUncheckedSideEffectImports falsche TS-Version | Version korrigiert |

---

## 4. Qualitaets-Checkliste (ausfuehrlich mit Beispielen)

### 4.1 Pro Sektion

#### "Was du hier lernst" (3-4 Bullet Points)

**Gutes Beispiel (L02 S1):**
```markdown
## Was du hier lernst

- Warum TypeScript-Typen zur Laufzeit **komplett verschwinden** (Type Erasure)
- Wie die **Typhierarchie** aufgebaut ist und warum das wichtig ist
- Den Unterschied zwischen **Compilezeit** und **Laufzeit** als fundamentales Denkmodell
```

**Schlechtes Beispiel:**
```markdown
## Was du hier lernst

- Mapped Types
- Key Remapping
```
→ Zu vage, nicht konkret genug, keine Lernziele formuliert.

#### Hintergrundgeschichte

**Gutes Beispiel (L02 S1):**
```markdown
> Anders Hejlsberg (Erfinder von TypeScript, aber auch von C# und Turbo Pascal)
> traf 2012 eine bewusste Designentscheidung: TypeScript sollte ein Superset
> von JavaScript sein, kein komplett neues Typsystem mit Laufzeit-Overhead.
> Der Grund? Adoption.
```

**Schlechtes Beispiel:** Keine Geschichte. Nur "Mapped Types transformieren Typen."

#### Self-Explanation Prompt

**Gutes Beispiel (L02 S1):**
```markdown
> Erklaere dir selbst: Warum kann TypeScript nicht garantieren, welchen Typ
> `JSON.parse()` zurueckgibt? Was muesste passieren, damit TypeScript das koennte?
> **Kernpunkte:** JSON kommt von aussen | Inhalt erst zur Laufzeit bekannt |
> TypeScript arbeitet nur zur Compile-Zeit | Loesung: Runtime-Validierung
```

**Schlechtes Beispiel:**
```markdown
> Erklaere dir selbst: Was sind Mapped Types?
```
→ Zu einfach, keine kognitive Herausforderung. Bessere Version: "Erklaere dir selbst warum `{[K in keyof T]: ...}` ein NEUEN Typ erzeugt, nicht den Original-Typ mutiert."

#### Experiment-Box

**Gutes Beispiel (L13 S4):**
```markdown
> Experiment: Oeffne `examples/04-constraints.ts` und entferne den
> `extends { length: number }`-Constraint. Was sagt TypeScript dir?
> Beobachte die Fehlermeldung genau — sie erklaert praezise warum
> der Zugriff auf `.length` unsicher waere.
```

**Schlechtes Beispiel:** Kein Experiment vorhanden.

#### Framework-Bezug

**Gutes Beispiel:**
```markdown
> **In deinem Angular-Projekt:** Angular's `FormBuilder.group()` nutzt
> `Partial<T>` intern — wenn du eine FormGroup erstellst, musst du nicht
> alle Felder angeben. Das ist der gleiche Utility Type den du gerade
> kennengelernt hast.
```

**Schlechtes Beispiel:** Kein Framework-Bezug in der gesamten Sektion.

### 4.2 Pro Lektion

| Element | Menge | Pruefpunkte |
|---------|:-----:|-------------|
| Quiz-Fragen | 15 | correct-Indizes: 4/4/4/3, elaboratedFeedback fuer jede Frage, Distraktoren plausibel |
| Misconceptions | 8 | Realistisch (nicht offensichtlich), ueberraschend, concept-Tag vorhanden |
| Completion Problems | 6 | Steigende Schwierigkeit, blanks haben sinnvolle Hinweise |
| Debugging Challenges | 5 | Bug ist nicht trivial, Fehlerbeschreibung ist realistisch |
| Parson's Problems | 3-4 | 1-2 Distraktoren pro Problem, Loesung ist eindeutig |
| Code-Tracing Exercises | 4 | Schritt-fuer-Schritt-Aufloesung, erwartete Ausgabe korrekt |
| Transfer Tasks | 2-3 | NEUER Kontext (nicht nur mehr Uebungen!), realistisches Szenario |
| hints.json | Alle Exercises | Progressive Hints (3-4 Stufen), nicht die Loesung im ersten Hint |
| cheatsheet.md | 1 | Kompakt, referenzierbar, alle Kernkonzepte |

### 4.3 Pretest-Bias (bekanntes Problem, noch nicht gefixt)

Das gleiche Bias-Problem wie bei den Quiz-Fragen existiert moeglicherweise auch bei den Pretest-Fragen. Noch nicht systematisch geprueft.

**TODO:** Pretest correct-Index-Verteilung fuer alle 20 Lektionen pruefen und ggf. fixen.

---

## 5. Qualitaetsmetriken und -ziele

| Metrik | Aktuell | Ziel |
|--------|:-------:|:----:|
| Lektionen mit Bewertung A/A- | 6 von 20 (30%) | 80% |
| Lektionen mit Bewertung B oder schlechter | 14 von 20 (70%) | <20% |
| Quiz-Bias-freie Lektionen | 20 von 20 (100%, gefixt) | 100% |
| Sektionen mit allen 9 Pflichtelementen | ~60% | 100% |
| Durchschnittliche Sektions-Laenge | ~220 Zeilen | 280-320 Zeilen |
