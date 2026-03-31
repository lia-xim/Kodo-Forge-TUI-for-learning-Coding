# Didaktische Grundlagen: Wissenschaftliche Studien

> Letzte Aktualisierung: 2026-03-31

---

## Ueberblick

Das Projekt basiert auf **12 Saeulen der Lernforschung**. Jede implementierte Funktion laesst sich auf eine oder mehrere wissenschaftliche Studien zurueckfuehren. Dieses Dokument beschreibt jede Theorie ausfuehrlich: Originalstudien, Kernaussagen, konkrete Umsetzung im Projekt mit Dateinamen und Beispielen, und Verbesserungspotential.

Die ersten 7 Theorien sind **aktiv implementiert**. Die weiteren 5 Theorien sind **geplant** und werden in zukuenftigen Sessions umgesetzt.

---

## Aktiv implementierte Theorien (7)

---

### 1. Cognitive Load Theory (CLT)

**Begruender:** John Sweller
**Originalstudien:**
- Sweller, J. (1988). "Cognitive load during problem solving: Effects on learning." *Cognitive Science*, 12(2), 257-285.
- Sweller, J. (1994). "Cognitive load theory, learning difficulty, and instructional design." *Learning and Instruction*, 4(4), 295-312.
- Sweller, J., Ayres, P., & Kalyuga, S. (2011). *Cognitive Load Theory*. Springer.
- Chandler, P., & Sweller, J. (1991). "Cognitive load theory and the format of instruction." *Cognition and Instruction*, 8(4), 293-332.
- Sweller, J., & Cooper, G. A. (1985). "The use of worked examples as a substitute for problem solving in learning algebra." *Cognition and Instruction*, 2(1), 59-89.
- Renkl, A., Atkinson, R. K., & Maier, U. H. (2002). "From studying examples to solving problems: Faded examples bridge the gap." *Interactive Environments*, 10, 15-37.

**Vollstaendige Beschreibung:**

Die Cognitive Load Theory besagt, dass das menschliche Arbeitsgedaechtnis in seiner Kapazitaet stark begrenzt ist — es kann nur etwa 4 Informations-Elemente gleichzeitig verarbeiten (Miller's 7 +/- 2 wurde spaeter auf 4 +/- 1 korrigiert durch Cowan 2001). Wenn Lernmaterial diese Kapazitaet uebersteigt, kommt es zu **kognitiver Ueberlastung**: Der Lernende versteht nichts mehr, auch wenn er sich noch so anstrengt.

Sweller unterscheidet drei Typen kognitiver Last:

1. **Intrinsic Load** (inhaltliche Komplexitaet): Ergibt sich aus der Schwierigkeit des Materials selbst und der Anzahl interagierender Elemente. Kann nicht eliminiert, aber durch **Sequenzierung** reduziert werden — erst einfache, dann komplexe Konzepte.

2. **Extraneous Load** (ueberflüssige Last durch schlechtes Design): Entsteht durch schlechte Praesentationsform. Klassisches Beispiel: Split-Attention Effect — wenn Code und Erklaerung an verschiedenen Stellen stehen und der Lernende staendig zwischen beiden hin- und herspringen muss. Diese Last ist **eliminierbar** und sollte es auch sein.

3. **Germane Load** (produktive Verarbeitungslast): Die kognitive Anstrengung, die zum tatsaechlichen Lernen fuehrt — Schemakonstruktion und -automatisierung. Diese Last sollte **maximiert** werden, solange die Gesamtlast unter der Kapazitaetsgrenze bleibt.

**Konkrete Umsetzung im Projekt:**

| Prinzip | Implementierung | Datei/Ort |
|---------|----------------|-----------|
| **10-Minuten-Sektionen** | Jede Sektion hat ~200-300 Zeilen, Lesezeit ~10 Min. Begrenzt intrinsic load pro Einheit. | Alle `sections/*.md` (z.B. `typescript/02-primitive-types/sections/01-das-typsystem-ueberblick.md`) |
| **Code-Annotationen NEBEN dem Code** | Annotierte Code-Bloecke (```typescript annotated) zeigen Erklaerungen rechts neben dem Code statt darunter. Anti-Split-Attention. | `markdown-renderer.ts` (Zeilen die `annotated`-Bloecke parsen), Toggle mit [A] im Section Reader |
| **Worked Examples** | Jede Lektion hat `examples/` mit lauffaehigen, kommentierten Beispielen. Lernender sieht zuerst ein geloestes Problem. | `examples/*.ts` in jeder Lektion |
| **Faded Worked Examples** | Progression: Worked Example → Completion Problem (Luecken) → Full Exercise. | `completion-problems.ts` pro Lektion, gesteuert in `tui-exercises.ts` (4-Stufen-Menue) |
| **Sequenzierung** | Phase 1 (einfach) → Phase 2 (mittel) → Phase 3 (fortgeschritten) → Phase 4 (Meisterschaft). Innerhalb jeder Lektion: Sektionen bauen aufeinander auf. | `CURRICULUM.md` Struktur, Lektionsnummerierung |
| **Pausenpunkte** | Jede Sektion endet mit "Pause hier" + Link zur naechsten. | Alle `sections/*.md`, letzter Absatz |

**Konkretes Beispiel aus L02 Sektion 1:**

> Der Lernende sieht zuerst eine Analogie ("TypeScript ist wie ein gruendlicher Lektor"), dann ein einfaches Codebeispiel (nur 5 Zeilen), dann die Erklaerung *warum* es so funktioniert. Nicht alles auf einmal, sondern schrittweise. Die Lesezeit-Angabe ("10 Minuten") signalisiert dem Lernenden, dass die Menge ueberschaubar ist.

**Verbesserungspotential:**
- **Adaptive Segmentierung:** Fortgeschrittene koennten groessere Sektionen bekommen (weniger intrinsic load durch Vorwissen). Aktuell sind alle Sektionen gleich lang.
- **Visuelle Komplexitaets-Indikatoren:** Jede Sektion koennte einen "Komplexitaets-Score" anzeigen, damit der Lernende weiss, ob er frisch und konzentriert sein sollte.

---

### 2. Spaced Repetition & Testing Effect

**Begruender:** Henry L. Roediger III, Jeffrey D. Karpicke
**Originalstudien:**
- Roediger, H. L., & Butler, A. C. (2011). "The critical role of retrieval practice in long-term retention." *Trends in Cognitive Sciences*, 15(1), 20-27.
- Karpicke, J. D. (2012). "Retrieval-based learning: Active retrieval promotes meaningful learning." *Current Directions in Psychological Science*, 21(3), 157-163.
- Ebbinghaus, H. (1885). *Ueber das Gedaechtnis*. (Die Urform — die Vergessenskurve)
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). "Distributed practice in verbal recall tasks: A review and quantitative synthesis." *Psychological Bulletin*, 132(3), 354-380.
- Richland, L. E., Kornell, N., & Kao, L. S. (2009). "The pretesting effect: Do unsuccessful retrieval attempts enhance learning?" *Journal of Experimental Psychology: Applied*, 15(3), 243-257.

**Vollstaendige Beschreibung:**

Der Testing Effect (auch Retrieval Practice Effect) ist eines der robustesten Ergebnisse der Lernforschung: **Testen IST Lernen** — nicht nur Pruefung. Jeder Versuch, Information aktiv aus dem Gedaechtnis abzurufen (auch wenn er scheitert!), staerkt die Gedaechtnisspur staerker als erneutes Lesen des Materials.

Roediger & Butler (2011) zeigten, dass Studierende die nach dem Lesen getestet wurden, nach einer Woche **50% mehr** erinnerten als Studierende die das Material ein zweites Mal gelesen hatten. Der Effekt ist besonders stark bei **elaboriertem Feedback** — wenn nach der Antwort nicht nur "richtig/falsch" steht, sondern eine Erklaerung *warum*.

Der **Pretesting Effect** (Richland, Kornell & Kao 2009) geht noch weiter: Selbst *falsche* Antworten auf Fragen *vor* dem Lernen verbessern das spaetere Lernen. Der Abrufversuch "bereitet" das Gehirn darauf vor, die Information aufzunehmen.

Spaced Repetition kombiniert den Testing Effect mit dem **Spacing Effect** (Cepeda et al. 2006): Wiederholung in steigenden Intervallen maximiert das Langzeitbehalten. Das optimale Intervall haengt von der gewuenschten Behaltenszeit ab — fuer langfristiges Wissen sind Intervalle von Tagen bis Wochen optimal.

**Konkrete Umsetzung im Projekt:**

| Prinzip | Implementierung | Datei/Ort |
|---------|----------------|-----------|
| **Quiz nach jeder Lektion** | 15 Fragen mit elaboriertem Feedback (whyCorrect + commonMistake) | `quiz-data.ts` pro Lektion, `tui-quiz.ts` |
| **Spaced Repetition System** | SM-2-aehnliche Intervallberechnung: 1→2→4→8→16→30 Tage | `review-runner.ts` (603 Zeilen), persistiert in `state/review-*.json` |
| **Pre-Test VOR Sektionen** | 3 Fragen pro Sektion bevor der Lernende liest | `pretest-data.ts` pro Lektion, `pretest-engine.ts` (430 Zeilen), `tui-quiz.ts` |
| **Warm-Up beim Start** | 3 zufaellige Fragen aus abgeschlossenen Lektionen | `pretest-engine.ts: getWarmupQuestions()`, `tui-quiz.ts` |
| **Elaboriertes Feedback** | Jede Quiz-Frage hat `elaboratedFeedback: { whyCorrect, commonMistake }` | `quiz-data.ts` pro Lektion |

**Konkretes Beispiel (Quiz-Frage aus L02):**

```typescript
{
  question: "Was ist der Typ von JSON.parse('{\"n\":1}')?",
  options: ["object", "unknown", "any", "Record<string, number>"],
  correct: 2,  // "any"
  elaboratedFeedback: {
    whyCorrect: "JSON.parse() gibt immer 'any' zurueck, weil TypeScript zur Compilezeit nicht wissen kann, was der JSON-String enthaelt.",
    commonMistake: "Viele denken es waere 'unknown', aber JSON.parse ist eine alte API die vor TypeScript 4.x designed wurde."
  }
}
```

**Verbesserungspotential:**
- **Adaptive Intervalle:** Aktuell sind die Intervalle fix (1→2→4→8→16→30). Ein echtes SM-2 wuerde den Ease-Factor pro Frage individuell anpassen.
- **Pretesting auf Lektionsebene:** Aktuell sind Pre-Tests pro Sektion. Ein einzelner Pre-Test pro Lektion (mit Fragen aus allen Sektionen) koennte effizienter sein.

---

### 3. Desirable Difficulties

**Begruender:** Robert A. Bjork, Elizabeth L. Bjork
**Originalstudien:**
- Bjork, R. A. (1994). "Memory and metamemory considerations in the training of human beings." In J. Metcalfe & A. Shimamura (Eds.), *Metacognition: Knowing about knowing*, 185-205. MIT Press.
- Bjork, E. L., & Bjork, R. A. (2011). "Making things hard on yourself, but in a good way." In M. A. Gernsbacher et al. (Eds.), *Psychology and the real world*, 56-64.
- Rohrer, D., & Taylor, K. (2007). "The shuffling of mathematics problems improves learning." *Instructional Science*, 35, 481-498. (Ergebnis: +43% bei Interleaved vs. Blocked Practice)
- Slamecka, N. J., & Graf, P. (1978). "The generation effect: Delineation of a phenomenon." *Journal of Experimental Psychology: Human Learning and Memory*, 4(6), 592-604.

**Vollstaendige Beschreibung:**

Bjork's "Desirable Difficulties" ist ein kontraintuitives Prinzip: Lernen das sich **schwierig und muehsam** anfuehlt, fuehrt oft zu *besserem* Langzeitlernen als Lernen das sich "leicht" anfuehlt. Das Gefuehl von Leichtigkeit waehrend des Lernens ist truegerisch — es korreliert nicht mit tatsaechlichem Behalten.

Vier Formen "wuenschenswerter Schwierigkeiten":

1. **Spacing** (statt Massing): Verteilt ueben statt am Stueck. Fuehlt sich schwerer an, ist aber effektiver.
2. **Interleaving** (statt Blocking): Verschiedene Themen mischen statt eines nach dem anderen. Rohrer & Taylor (2007) zeigten +43% Lerneffekt.
3. **Generation** (statt Lesen): Antworten selbst generieren statt vorgegebene lesen. Der Abruf-Aufwand staerkt die Spur.
4. **Variation** (statt Repetition): Gleiche Konzepte in verschiedenen Kontexten ueben.

**WICHTIG:** Nicht jede Schwierigkeit ist "wuenschenswert". Schlechtes Materialdesign, verwirrende Erklaerungen oder zu schwere Aufgaben sind NICHT wuenschenswerte Schwierigkeiten — sie erhoehen nur den Extraneous Load (siehe CLT).

**Konkrete Umsetzung im Projekt:**

| Prinzip | Implementierung | Datei/Ort |
|---------|----------------|-----------|
| **Interleaved Practice** | Gemischte Review-Challenges aus mehreren Lektionen | `interleave-engine.ts` (491 Zeilen), `interleave-data.ts` (538 Zeilen, 20 Templates), Zugang im TUI: [I] im Hauptmenue |
| **Generation Effect** | Predict-the-Output-Aufgaben: Lernender muss Ergebnis vorhersagen | In `tracing-data.ts` pro Lektion, `tracing-engine.ts` (468 Zeilen) |
| **Misconception Challenges** | Ueberzeugungen aktiv in Frage stellen — "Was glaubst du passiert?" | `misconceptions.ts` pro Lektion (8 Misconceptions), `tui-challenges.ts` |
| **Transfer Tasks** | Bekanntes Konzept in NEUEM Kontext anwenden | `transfer-data.ts` pro Lektion, `transfer-engine.ts` (251 Zeilen) |

**Konkretes Beispiel (Interleaved Review):**

In der Interleaved Review bekommt der Lernende nach 3+ abgeschlossenen Lektionen Aufgaben die Konzepte aus *verschiedenen* Lektionen mischen. Zum Beispiel eine Aufgabe die gleichzeitig Union Types (L07) und Generics (L13) erfordert — der Lernende muss nicht nur das Konzept abrufen, sondern auch entscheiden *welches* Konzept relevant ist.

**Verbesserungspotential:**
- **Kontextuelle Interleaving:** Aktuell werden zufaellige Konzepte gemischt. Besser waere "gezielte Verwechslungsgefahr" — Konzepte mischen die oft verwechselt werden (z.B. `interface` vs. `type`, `any` vs. `unknown`).
- **Spacing-Hinweise:** Das TUI koennte anzeigen "Du hast Generics seit 5 Tagen nicht geuebt — ideal fuer Spacing!"

---

### 4. Self-Explanation Effect

**Begruender:** Michelene T. H. Chi, Alexander Renkl
**Originalstudien:**
- Chi, M. T. H., Bassok, M., Lewis, M. W., Reimann, P., & Glaser, R. (1989). "Self-explanations: How students study and use examples in learning to solve problems." *Cognitive Science*, 13, 145-182.
- Renkl, A. (1997). "Learning from worked-out examples: A study on individual differences." *Cognitive Science*, 21(1), 1-29.

**Vollstaendige Beschreibung:**

Chi et al. (1989) entdeckten einen dramatischen Unterschied zwischen "guten" und "schlechten" Lernenden: Die guten Lernenden erklaerten sich *selbst* warum ein Schritt in einem Worked Example funktioniert. Sie sagten Dinge wie "Aha, das liegt daran, dass..." oder "Warte, das widerspricht dem, was ich dachte...". Die schlechten Lernenden lasen passiv.

Der Effekt ist enorm: Self-Explainers loesten **2x so viele Transfer-Probleme** wie Nicht-Self-Explainers. Renkl (1997) bestaetigte: Erfolgreiches Lernen aus Beispielen korreliert stark mit der Haeufigkeit von Self-Explanations.

Entscheidend: Self-Explanation muss **aktiv** sein, nicht passiv. Einfach "Ich hab's verstanden" sagen reicht nicht — der Lernende muss die Erklaerung in eigenen Worten formulieren.

**Konkrete Umsetzung im Projekt:**

| Prinzip | Implementierung | Datei/Ort |
|---------|----------------|-----------|
| **Self-Explanation Prompts** | Markierungen mit dem Emoji "Erklaere dir selbst:" nach wichtigen Code-Beispielen | In jeder `sections/*.md`, erkannt durch `markdown-renderer.ts` |
| **Automatische Pause** | Das TUI pausiert automatisch wenn ein Self-Explanation-Prompt im Viewport erscheint | `tui-section-reader.ts`, `tui-state.ts: sectionSelfExplainPrompts[]` |
| **Kernpunkte** | Optional: "Kernpunkte" zum Vergleich mit der eigenen Erklaerung | In den Markdown-Dateien nach dem Prompt |
| **Typing-Mode** | Optional: Textfeld zum Eintippen der eigenen Erklaerung | `tui-types.ts: Screen "selfexplain"`, `tui-section-reader.ts` |

**Konkretes Beispiel aus L02 Sektion 1:**

```markdown
> Erklaere dir selbst: Warum kann TypeScript nicht garantieren, welchen Typ
> `JSON.parse()` zurueckgibt? Was muesste passieren, damit TypeScript das koennte?
> **Kernpunkte:** JSON kommt von aussen (API, Datei) | Inhalt erst zur Laufzeit
> bekannt | TypeScript arbeitet nur zur Compile-Zeit | Loesung: Runtime-Validierung
```

Im TUI wird bei dieser Stelle automatisch pausiert. Der Lernende sieht die Frage, denkt nach, und drueckt dann Enter um die Kernpunkte zu sehen. Optional kann er seine Erklaerung eintippen und mit den Kernpunkten vergleichen.

**Verbesserungspotential:**
- **Qualitaetsmessung:** Aktuell wird nicht gemessen *ob* der Lernende tatsaechlich nachdenkt oder nur Enter drueckt. Ein Timer ("Du hast nur 2 Sekunden nachgedacht — nimm dir mehr Zeit") waere sinnvoll.
- **Spaced Self-Explanation:** In spaeteren Lektionen koennten Self-Explanation-Prompts auf fruehere Konzepte verweisen ("Erklaere dir selbst, wie Type Erasure aus L02 hier relevant ist").

---

### 5. Expertise Reversal Effect

**Begruender:** Slava Kalyuga
**Originalstudien:**
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). "The expertise reversal effect." *Educational Psychologist*, 38(1), 23-31.
- Kalyuga, S. (2007). "Expertise reversal effect and its implications for learner-tailored instruction." *Educational Psychology Review*, 19(4), 509-539.

**Vollstaendige Beschreibung:**

Der Expertise Reversal Effect ist eine Erweiterung der Cognitive Load Theory: Detaillierte Erklaerungen und Worked Examples die Anfaengern **helfen**, **schaden** Fortgeschrittenen aktiv. Der Grund: Fortgeschrittene haben bereits Schemata im Langzeitgedaechtnis. Wenn sie redundante Informationen lesen muessen, entsteht unnoetige kognitive Last durch die Integration der neuen (redundanten) Information mit dem bestehenden Schema.

Praktisch: Ein Anfaenger braucht die ausfuehrliche Erklaerung "Ein Array ist wie eine Liste von Elementen...". Ein Fortgeschrittener, der taeglich mit Arrays arbeitet, wird durch diese Erklaerung *verlangsamt* — er muss die redundante Information verarbeiten, was kognitive Ressourcen verbraucht die er fuer neue Konzepte braucht.

Die Loesung: **Adaptive Instruktion** — Inhalt an das Vorwissensniveau anpassen.

**Konkrete Umsetzung im Projekt:**

| Prinzip | Implementierung | Datei/Ort |
|---------|----------------|-----------|
| **Adaptive Tiefe** | Pre-Test → empfohlene Tiefe (kurz/standard/vollstaendig) | `pretest-engine.ts: calculateDepth()`, `adaptive-engine.ts: ContentDepth` |
| **Tiefe jederzeit wechselbar** | [K]urz, [N]ormal, [V]ollstaendig im Section Reader | `tui-section-reader.ts` |
| **Scaffolding-Level** | Performance-basiert: <30% → viel Hilfe, >=70% → keine Hilfe | `adaptive-engine.ts: SCAFFOLDING_THRESHOLDS`, `scaffolding-engine.ts` |
| **Hint-Level-Anpassung** | Steigt bei Fehlern, sinkt bei Erfolgen, pro Exercise | `adaptive-engine.ts: hintLevels`, `scaffolding-engine.ts` |

**Geplante Erweiterung (noch nicht implementiert):**

Das adaptive Tiefensystem mit Markdown-Markern:
```markdown
<!-- section:summary -->
Kurze Zusammenfassung fuer Fortgeschrittene (2-3 Saetze).

<!-- depth:standard -->
Standarderklaerung mit Beispielen (der Normalfall).

<!-- depth:vollstaendig -->
Ausfuehrliche Erklaerung mit Hintergrundgeschichte, Analogie, mehreren Beispielen.
```

Eine `filterByDepth()`-Funktion in `markdown-renderer.ts` wuerde basierend auf dem Pre-Test-Ergebnis nur die relevanten Abschnitte anzeigen. Siehe `docs/10-ADAPTIVE-SYSTEM.md` fuer das vollstaendige Design.

**Verbesserungspotential:**
- **Markdown-Marker implementieren:** Das Design ist fertig, aber noch nicht implementiert.
- **Granularere Tiefe:** Statt drei Stufen koennte ein Slider (1-10) feiner abstimmen.
- **Vorwissen aus anderen Quellen:** Angular-Erfahrung koennte das Pre-Test-Ergebnis fuer bestimmte TypeScript-Konzepte (z.B. Decorators) beeinflussen.

---

### 6. Self-Determination Theory (SDT)

**Begruender:** Edward L. Deci, Richard M. Ryan
**Originalstudien:**
- Deci, E. L., & Ryan, R. M. (2000). "The 'what' and 'why' of goal pursuits: Human needs and the self-determination of behavior." *Psychological Inquiry*, 11(4), 227-268.
- Ryan, R. M., & Deci, E. L. (2000). "Intrinsic and extrinsic motivations: Classic definitions and new directions." *Contemporary Educational Psychology*, 25(1), 54-67.

**Vollstaendige Beschreibung:**

Deci und Ryan identifizierten drei psychologische Grundbeduerfnisse die fuer intrinsische Motivation notwendig sind:

1. **Autonomie** (Autonomy): Das Gefuehl, selbst zu entscheiden was, wann und wie man lernt. Nicht kontrolliert zu werden.
2. **Kompetenz** (Competence): Das Gefuehl, faehig zu sein und Fortschritt zu machen. Sichtbare Verbesserung.
3. **Verbundenheit** (Relatedness): Das Gefuehl, dass das Gelernte relevant ist und mit der eigenen Welt verbunden.

Wenn eines dieser Beduerfnisse frustriert wird, sinkt die intrinsische Motivation. Wenn alle drei erfuellt sind, lernt der Mensch aus eigenem Antrieb — ohne Belohnungen, Punkte oder Badges.

**Konkrete Umsetzung im Projekt:**

| Beduerfnis | Implementierung | Datei/Ort |
|------------|----------------|-----------|
| **Autonomie** | Tiefe waehlbar (kurz/standard/vollstaendig), Sektionen ueberspringbar, Pre-Tests optional, Reihenfolge frei | Verschiedene Screen-Module, kein Zwang implementiert |
| **Autonomie** | Kein Lock-Zwang: Kurse mit Voraussetzungen koennen per Override trotzdem geoeffnet werden | `tui-platform.ts: confirmUnlock` |
| **Kompetenz** | Mastery-Levels (Newcomer→Familiar→Proficient→Expert) pro Lektion | `tui-state.ts: calculateMastery()` |
| **Kompetenz** | Fortschrittsbalken in Kursauswahl und Hauptmenue | `tui-render.ts: progressBar()` |
| **Kompetenz** | "Was du gelernt hast" am Ende jeder Sektion | Alle `sections/*.md` |
| **Kompetenz** | Kompetenz-Dashboard mit Sparklines und Empfehlungen | `tui-stats.ts` (180 Zeilen) |
| **Verbundenheit** | Framework-Bezuege ("In deinem Angular-Projekt...") | In jeder Sektion mindestens 1x |
| **Verbundenheit** | Transfer Tasks mit realen Szenarien | `transfer-data.ts` pro Lektion |
| **Verbundenheit** | Der Lernende sieht sich selbst als "Angular-Entwickler der TypeScript meistert", nicht als anonymer Student | Tonfall in allen Texten |

**Konkretes Beispiel (Kompetenz):**

Im Hauptmenue sieht der Lernende:
```
  L02  Primitive Types          ██████████████░░  87%  Proficient
  L03  Type Annotations         ████████████████  100% Expert
  L04  Arrays & Tuples          ████████░░░░░░░░  50%  Familiar
```

Das Mastery-Level wird berechnet aus: Sektionen gelesen + Exercises geloest + Quiz-Score. Der Lernende sieht sofort wo er stark ist und wo noch Luecken sind.

**Verbesserungspotential:**
- **Keine Gamification:** Bewusst keine Punkte, Streaks, Badges — aber evtl. wuerde ein dezenter "7-Tage-in-Folge"-Hinweis motivieren ohne manipulativ zu sein.
- **Mehr Verbundenheit:** Aktuell sind die Framework-Bezuege generisch. Spezifischer waere: "Dieses Pattern siehst du in Angular 17's @if — hier ist der Commit der es eingefuehrt hat."

---

### 7. Metacognition & Calibration

**Begruender:** Kruger & Dunning (Dunning-Kruger-Effekt), Kang
**Originalstudien:**
- Kruger, J., & Dunning, D. (1999). "Unskilled and unaware of it: How difficulties in recognizing one's own incompetence lead to inflated self-assessments." *Journal of Personality and Social Psychology*, 77(6), 1121-1134.
- Kang, S. H. K., McDermott, K. B., & Roediger, H. L. III (2007). "Test format and corrective feedback modify the effect of testing on long-term retention." *European Journal of Cognitive Psychology*, 19(4-5), 528-558.
- Butler, A. C., Fazio, L. K., & Marsh, E. J. (2011). "The hypercorrection effect is not a stable phenomenon." *Psychonomic Bulletin & Review*, 18(5), 1098-1105. (Hypercorrection Effect: Sicher-aber-falsch wird besonders gut korrigiert)

**Vollstaendige Beschreibung:**

Der Dunning-Kruger-Effekt zeigt, dass Lernende auf niedrigem Kompetenzlevel ihr Wissen systematisch *ueberschaetzen*. Sie wissen nicht, was sie nicht wissen. Umgekehrt *unterschaetzen* Experten oft ihr Wissen.

**Metacognitive Prompts** ("Wie sicher bist du?") vor Antworten verbessern die **Kalibrierung** — die Uebereinstimmung zwischen Selbsteinschaetzung und tatsaechlichem Wissen. Der **Hypercorrection Effect** (Butler et al. 2011) zeigt, dass Fehler die mit hoher Konfidenz gemacht werden ("Ich war 100% sicher!") besonders gut korrigiert werden — *weil* die Ueberraschung so gross ist.

**Konkrete Umsetzung im Projekt:**

| Prinzip | Implementierung | Datei/Ort |
|---------|----------------|-----------|
| **3-Phasen-Flow** | Frage → Confidence (1-4) → Feedback mit Kalibrierungskommentar | `tui-quiz.ts`, Screen-Varianten "warmup", "pretest", "interleaved" mit `phase: "question" \| "confidence" \| "feedback"` |
| **Confidence-Skala** | [1] Geraten, [2] Unsicher, [3] Ziemlich sicher, [4] Absolut sicher | `tui-quiz.ts` |
| **Kalibrierungskommentare** | "Du warst sehr sicher und richtig — super!" / "Du warst sehr sicher aber falsch — dieses Thema vertiefen!" | `tui-quiz.ts` |
| **Hypercorrection-Nutzung** | Bei Confidence 4 + falsch: Besondere Hervorhebung + Wiederholungs-Empfehlung | `tui-quiz.ts`, `adaptive-engine.ts` |

**Konkretes Beispiel im TUI:**

```
  Frage 3/15: Was passiert wenn du `const x: string = 5` schreibst?

  (a) Runtime Error
  (b) Compile Error: Type 'number' is not assignable to type 'string'
  (c) x wird automatisch zu "5" konvertiert
  (d) TypeScript ignoriert den Typ

  Wie sicher bist du?  [1] Geraten  [2] Unsicher  [3] Sicher  [4] Absolut sicher

  > Du drueckst [4]...

  FALSCH! Die richtige Antwort ist (b).
  Du warst ABSOLUT SICHER aber falsch — genau dieses Thema solltest du vertiefen!
  TypeScript konvertiert NIEMALS Werte. Es prueft nur zur Compilezeit.
```

**Verbesserungspotential:**
- **Kalibrierungs-Tracking:** Ueber Zeit tracken wie gut die Selbsteinschaetzung des Lernenden ist und visualisieren (z.B. "Deine Kalibrierung hat sich von 40% auf 72% verbessert").
- **Gezielte Wiederholung:** Konzepte bei denen Confidence hoch war + Antwort falsch gezielt in die Spaced Repetition Queue mit hoeherem Gewicht einfuegen.

---

## Geplante Theorien (5)

---

### 8. Variation Theory (GEPLANT)

**Begruender:** Ference Marton
**Originalstudie:**
- Marton, F. (2014). *Necessary Conditions of Learning*. Routledge.
- Marton, F., & Booth, S. (1997). *Learning and Awareness*. Lawrence Erlbaum Associates.

**Vollstaendige Beschreibung:**

Marton's Variation Theory besagt: Um ein Konzept wirklich zu verstehen, muss der Lernende erleben, was **variiert** und was **konstant** bleibt. Wenn du immer nur ein Beispiel siehst, kannst du nicht unterscheiden welche Aspekte wesentlich sind und welche zufaellig.

Vier Muster der Variation:
1. **Kontrast:** Zwei Dinge nebeneinander zeigen die sich unterscheiden → macht den Unterschied sichtbar
2. **Generalisierung:** Viele verschiedene Beispiele des gleichen Konzepts → zeigt was konstant bleibt
3. **Separation:** Einen Aspekt variieren, den Rest konstant halten → isoliert den kritischen Aspekt
4. **Fusion:** Mehrere Aspekte gleichzeitig variieren → zeigt Zusammenspiel

**Geplante Umsetzung:**

Kontrastive Paare in Sektionen:
```markdown
> **Kontrastpaar: interface vs type**
>
> ```typescript
> // Variante A: interface
> interface User { name: string; age: number }
> interface User { email: string }  // OK! Declaration Merging
>
> // Variante B: type
> type User = { name: string; age: number }
> type User = { email: string }     // ERROR! Duplicate identifier
> ```
>
> **Was ist gleich?** Beide definieren die Struktur eines Objekts.
> **Was ist anders?** Nur interface erlaubt Declaration Merging.
> **Warum ist das wichtig?** Weil Library-Autoren interfaces verwenden muessen
> damit Nutzer die Typen erweitern koennen.
```

---

### 9. ICAP Framework (GEPLANT)

**Begruender:** Michelene T. H. Chi, Ruth Wylie
**Originalstudie:**
- Chi, M. T. H., & Wylie, R. (2014). "The ICAP Framework: Linking Cognitive Engagement to Active Learning Outcomes." *Educational Psychologist*, 49(4), 219-243.

**Vollstaendige Beschreibung:**

ICAP klassifiziert Lernaktivitaeten in vier Stufen, wobei hoehere Stufen zu besserem Lernen fuehren:

1. **Passive:** Zuhoeren, Lesen — niedrigstes Engagement
2. **Active:** Markieren, Unterstreichen, Notizen kopieren — besser als passiv, aber noch oberflaechlich
3. **Constructive:** Self-Explanation, Zusammenfassungen in eigenen Worten, Concept Maps — der Lernende erzeugt etwas Neues
4. **Interactive:** Peer-Diskussion, Debatte, gemeinsames Problemloesen — das hoechste Engagement

Die Hierarchie ist: **Interactive > Constructive > Active > Passive**

**Geplante Umsetzung:**

| ICAP-Stufe | Aktuelle Umsetzung | Geplante Verbesserung |
|------------|--------------------|-----------------------|
| Passive | Sektionen lesen | Weniger passives Lesen, mehr eingebettete Aufgaben |
| Active | Code-Annotationen togglen, Experiments durchfuehren | Mehr Experiment-Boxen in jeder Sektion |
| Constructive | Self-Explanation-Prompts, Transfer Tasks | Concept-Map-Aufgaben, "Erklaere X einem Kollegen" |
| Interactive | (noch nicht implementiert) | Rubber-Duck-Prompts ("Erklaere dem Rubber Duck warum...") |

---

### 10. Multimedia Learning (GEPLANT)

**Begruender:** Richard E. Mayer
**Originalstudie:**
- Mayer, R. E. (2009). *Multimedia Learning* (2nd ed.). Cambridge University Press.
- Mayer, R. E., & Moreno, R. (2003). "Nine ways to reduce cognitive load in multimedia learning." *Educational Psychologist*, 38(1), 43-52.

**Vollstaendige Beschreibung:**

Mayer's Cognitive Theory of Multimedia Learning basiert auf drei Annahmen:
1. **Dual Channel:** Menschen verarbeiten visuelle und auditive Information in getrennten Kanaelen
2. **Limited Capacity:** Jeder Kanal hat begrenzte Kapazitaet
3. **Active Processing:** Lernen erfordert aktive Selektion, Organisation und Integration

Daraus ergeben sich 12 Prinzipien, die wichtigsten:

- **Multimedia-Prinzip:** Text + Bild besser als nur Text
- **Contiguity-Prinzip:** Text neben dem Bild platzieren, nicht getrennt (Anti-Split-Attention)
- **Modality-Prinzip:** Gesprochener Text + Bild besser als geschriebener Text + Bild (bei animierten Darstellungen)
- **Redundancy-Prinzip:** Nicht gleichzeitig geschriebenen UND gesprochenen Text zeigen
- **Signaling-Prinzip:** Wichtiges hervorheben (Bold, Farbe, Groesse)

**Aktuelle Umsetzung (teilweise):**

- **Contiguity:** Code-Annotationen NEBEN dem Code (`markdown-renderer.ts` — annotierte Code-Bloecke)
- **Signaling:** Emojis als Signale (Self-Explanation, Denkfrage, Experiment, etc.)
- **TTS als Modality:** Text-to-Speech (`tui-tts.ts`) — aber aktuell nur Vorlesen, nicht synchronisiert

**Geplante Verbesserung:**
- Mehr Mermaid-Diagramme in Sektionen (Multimedia-Prinzip)
- Synchronisiertes TTS: Waehrend vorgelesen wird, wird die aktuelle Zeile hervorgehoben

---

### 11. Storytelling in CS Education (GEPLANT)

**Begruender:** Mark Guzdial
**Originalstudie:**
- Guzdial, M. (2015). *Learner-Centered Design of Computing Education*. Morgan & Claypool.
- Caspersen, M. E., & Bennedsen, J. (2007). "Instructional design of a programming course." *Proceedings of ICER '07*, 111-122.

**Vollstaendige Beschreibung:**

Guzdial argumentiert, dass **Narratives** in der CS-Education drastisch unterbewertet sind. Menschen erinnern sich an Geschichten 6-7x besser als an Fakten (Bruner 1986). In der Programmier-Ausbildung bedeutet das: Nicht "Generics ermoeglicht parametrisierten Polymorphismus", sondern "1998 hatte das Java-Team ein Problem: Container konnten nur Object speichern. Jeder Cast war eine Zeitbombe..."

Feature Origin Stories — die Geschichte *warum* ein Feature eingefuehrt wurde, *welches Problem* es loeste, *wer* es vorgeschlagen hat — verankern technisches Wissen in einem narrativen Rahmen.

**Aktuelle Umsetzung (teilweise):**

Einige Sektionen haben bereits Hintergrundgeschichten:

```markdown
> Anders Hejlsberg (Erfinder von TypeScript, aber auch von C# und Turbo Pascal)
> traf 2012 eine bewusste Designentscheidung: TypeScript sollte ein Superset
> von JavaScript sein, kein komplett neues Typsystem mit Laufzeit-Overhead.
```
(Aus `typescript/02-primitive-types/sections/01-das-typsystem-ueberblick.md`)

**Problem:** Nicht alle Sektionen haben Geschichten. Die Qualitaetsregression (siehe `docs/04-QUALITY-PROCESS.md`) zeigte, dass spaetere Lektionen (L13+) weniger Geschichten hatten.

**Geplante Verbesserung:**
- Jede Sektion bekommt mindestens eine "Feature Origin Story"
- POE-Bloecke (Predict-Observe-Explain) mit narrativem Rahmen
- "Was wuerde passieren wenn TypeScript dieses Feature NICHT haette?" — kontrafaktische Narrative

---

### 12. Predict-Observe-Explain (POE) (GEPLANT)

**Begruender:** Richard T. White, Richard F. Gunstone
**Originalstudie:**
- White, R. T., & Gunstone, R. F. (1992). *Probing Understanding*. Falmer Press.

**Vollstaendige Beschreibung:**

POE ist eine dreistufige Lernstrategie:

1. **Predict:** Der Lernende sagt vorher, was passieren wird ("Was gibt dieser Code aus?")
2. **Observe:** Der Lernende fuehrt den Code aus und beobachtet das tatsaechliche Ergebnis
3. **Explain:** Wenn Vorhersage und Beobachtung sich unterscheiden, muss der Lernende den Unterschied erklaeren

Der Lerneffekt entsteht aus der **kognitiven Dissonanz** zwischen Erwartung und Realitaet. Das ist der "Aha-Moment" — und er ist neuronal messbar (erhoehte Aktivitaet im Hippocampus beim Ueberraschungsmoment).

**Geplante Umsetzung:**

POE-Bloecke in Sektionen:
```markdown
> **Predict-Observe-Explain**
>
> ```typescript
> const arr = [1, "two", true];
> const filtered = arr.filter(x => typeof x === "number");
> ```
>
> **Predict:** Was ist der Typ von `filtered`?
> (a) number[]
> (b) (string | number | boolean)[]
> (c) (number | boolean)[]
>
> **Observe:** Fuehre es aus: `npx tsx examples/poe-filter.ts`
>
> **Explain:** Warum ist der Typ (a) und nicht (b)?
> Hinweis: TS 5.5 Inferred Type Predicates...
```

---

## Zusammenfassung: Theorien und ihre Implementierung

| # | Theorie | Status | Hauptimplementierung |
|---|---------|--------|---------------------|
| 1 | Cognitive Load Theory | Implementiert | 10-Min-Sektionen, Code-Annotationen, Faded Examples |
| 2 | Testing Effect / Spaced Repetition | Implementiert | Quiz, Review-Runner, Pre-Tests, Warm-Up |
| 3 | Desirable Difficulties | Implementiert | Interleaved Practice, Misconceptions, Transfer Tasks |
| 4 | Self-Explanation Effect | Implementiert | Self-Explanation Prompts mit Auto-Pause |
| 5 | Expertise Reversal Effect | Teilweise | Pre-Test → Tiefe, Scaffolding. Markdown-Marker geplant |
| 6 | Self-Determination Theory | Implementiert | Autonomie, Mastery-Levels, Framework-Bezuege |
| 7 | Metacognition / Calibration | Implementiert | Confidence-Prompts, 3-Phasen-Flow, Kalibrierung |
| 8 | Variation Theory | Geplant | Kontrastive Paare |
| 9 | ICAP Framework | Teilweise | Constructive (Self-Explanation), Interactive fehlt |
| 10 | Multimedia Learning | Teilweise | Annotationen, TTS. Mehr Diagramme geplant |
| 11 | Storytelling in CS Ed. | Teilweise | Einige Geschichten. Systematisch geplant |
| 12 | Predict-Observe-Explain | Geplant | POE-Bloecke in Sektionen |
