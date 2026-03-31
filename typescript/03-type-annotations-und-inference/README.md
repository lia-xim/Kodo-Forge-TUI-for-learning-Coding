# Lektion 03: Type Annotations & Type Inference

## Lernziele

Nach dieser Lektion verstehst du:
- **Warum** TypeScript Inference hat und was ohne sie passieren wuerde
- Wann du explizit Typen angeben solltest und wann nicht -- und **warum** die Antwort so ist
- Wie der Inference-Algorithmus **tatsaechlich funktioniert** (Best Common Type, Contextual Typing, Control Flow Analysis)
- Was **Widening** ist und warum `let` und `const` verschiedene Typen produzieren
- Wie `as const` und der **satisfies-Operator** Inference praezise steuern
- Wo Inference **versagt** und warum -- und wie du diese Faelle erkennst
- Das Prinzip **"Annotate at boundaries, infer inside"** und warum es die beste Strategie ist

---

## Sektionen (~10 Min pro Sektion)

Diese Lektion ist in sieben Sektionen aufgeteilt. Jede Sektion ist ein eigenstaendiges Lern-Haeppchen, das du in etwa 10 Minuten durcharbeiten kannst. Bearbeite sie der Reihe nach -- jede Sektion baut auf der vorherigen auf.

| # | Sektion | Was du lernst | Dauer |
|---|---------|---------------|:-----:|
| 1 | [Warum Inference existiert](./sections/01-warum-inference-existiert.md) | Das Kernproblem, Hindley-Milner, die Design-Philosophie von TypeScript | ~10 Min |
| 2 | [Explizite Annotationen](./sections/02-explizite-annotationen.md) | Annotations-Syntax, Entscheidungsbaum, warum Ueber-Annotieren schadet | ~10 Min |
| 3 | [Wie Inference funktioniert](./sections/03-wie-inference-funktioniert.md) | Die 6 Inference-Regeln: Initialization, Best Common Type, Return Types, Contextual Typing, Generics, Control Flow | ~12 Min |
| 4 | [Widening und const](./sections/04-widening-und-const.md) | `let` vs `const`, Objekt-Widening, `as const`, Enum-Ersatz-Patterns | ~10 Min |
| 5 | [Contextual Typing und Control Flow](./sections/05-contextual-typing.md) | Rueckwaerts-Inference, Narrowing-Guards, Discriminated Unions, CFA-Grenzen | ~12 Min |
| 6 | [Der satisfies-Operator](./sections/06-satisfies-operator.md) | Die Geschichte hinter satisfies, Sicherheit + Praezision, `as const satisfies` | ~10 Min |
| 7 | [Wo Inference versagt](./sections/07-wo-inference-versagt.md) | 6 systematische Schwachstellen, Object.keys()-Design, Goldene Regeln | ~10 Min |

**Gesamtdauer Theorie:** ~75 Minuten

---

## Das Leitprinzip dieser Lektion

```
  +---------------------------------------------------------+
  |  AUSSEN: Annotieren                                     |
  |                                                         |
  |  - Funktionsparameter                                   |
  |  - Exportierte Return-Types                             |
  |  - API-Responses / JSON.parse                           |
  |  - Leere Arrays                                         |
  |  - Variablen ohne Initialwert                           |
  |                                                         |
  |  +---------------------------------------------------+  |
  |  |  INNEN: Inferieren lassen                         |  |
  |  |                                                   |  |
  |  |  - Lokale Variablen mit Wert                      |  |
  |  |  - Callback-Parameter (Contextual Typing)         |  |
  |  |  - Zwischenergebnisse                             |  |
  |  |  - const-Werte                                    |  |
  |  +---------------------------------------------------+  |
  |                                                         |
  |  SPEZIAL: satisfies / as const                          |
  |  - Config-Objekte: satisfies                            |
  |  - Enum-Ersatz: as const                                |
  |  - Maximale Praezision: as const satisfies              |
  +---------------------------------------------------------+
```

---

## Praxis-Material

Nachdem du die Sektionen durchgearbeitet hast:

### Examples (zum Experimentieren)

| Datei | Thema |
|-------|-------|
| `examples/01-explizite-annotationen.ts` | Alle Annotations-Syntax-Varianten |
| `examples/02-type-inference.ts` | Inference in Aktion -- hovere ueber Variablen! |
| `examples/03-widening-und-const.ts` | Widening, `let` vs `const`, `as const`, `satisfies` |
| `examples/04-contextual-typing.ts` | Contextual Typing bei Callbacks und mehr |
| `examples/05-control-flow-analysis.ts` | Control Flow Narrowing und Inference |
| `examples/06-satisfies-deep-dive.ts` | `satisfies` vs Annotation vs Inference |

### Exercises (zum Selbermachen)

| Datei | Aufgabe |
|-------|---------|
| `exercises/01-annotieren-oder-infern.ts` | 15 Szenarien: Annotation noetig oder nicht? |
| `exercises/02-inference-vorhersagen.ts` | 15 Typ-Vorhersagen mit Type-Level-Tests |
| `exercises/03-satisfies-und-control-flow.ts` | satisfies anwenden, Control Flow nutzen |
| `exercises/04-predict-the-type.ts` | 12 ueberraschende Inference-Faelle vorhersagen |
| `exercises/05-fehlermeldungen-lesen.ts` | 6 Inference-Fehlermeldungen richtig interpretieren |

Loesungen liegen in `solutions/`.

### Quiz

```bash
npx tsx 03-type-annotations-und-inference/quiz.ts
```

### Referenz

Das [Cheatsheet](./cheatsheet.md) fasst alle Regeln auf einer Seite zusammen.

---

## So arbeitest du diese Lektion durch

1. Lies die **Sektionen 1-7** der Reihe nach (mit Pausen dazwischen)
2. Oeffne die **Examples** und experimentiere (hovere ueber Variablen!)
3. Mache die **Exercises** selbststaendig
4. Vergleiche mit den **Solutions**
5. Absolviere das **Quiz**: `npx tsx 03-type-annotations-und-inference/quiz.ts`
6. Behalte das **Cheatsheet** als Referenz
