# Lektion 04: Arrays & Tuples

> **Lernziel:** Du verstehst den fundamentalen Unterschied zwischen Arrays und Tuples
> auf Typ-System-Ebene, kannst beide korrekt und sicher typisieren, kennst die
> Typsicherheits-Luecken und weisst, wie du sie vermeidest. Du verstehst Kovarianz,
> `as const`, Variadic Tuples und die Verbindung zu Generics.

---

## Aufbau dieser Lektion

Diese Lektion ist in **6 Sektionen** aufgeteilt, die jeweils in ~10 Minuten
durchgearbeitet werden koennen. Du kannst nach jeder Sektion pausieren und
spaeter weitermachen.

| # | Sektion | Lesezeit | Was du lernst |
|---|---------|----------|---------------|
| 1 | [Array-Grundlagen](sections/01-array-grundlagen.md) | ~10 Min | Mentales Modell, `T[]` vs `Array<T>`, Inferenz, Generics-Verbindung |
| 2 | [Readonly Arrays](sections/02-readonly-arrays.md) | ~10 Min | Mutation verhindern, `readonly`, Compile-Zeit vs Laufzeit |
| 3 | [Tuples Grundlagen](sections/03-tuples-grundlagen.md) | ~10 Min | Positional typisiert, Named Tuples, optionale/Rest-Elemente |
| 4 | [Fortgeschrittene Tuples](sections/04-fortgeschrittene-tuples.md) | ~12 Min | Variadic Tuples, `as const`, `satisfies`, Union-Ableitung |
| 5 | [Kovarianz und Sicherheit](sections/05-kovarianz-und-sicherheit.md) | ~12 Min | Kovarianz, Typsicherheits-Luecken, `noUncheckedIndexedAccess` |
| 6 | [Praxis-Patterns](sections/06-praxis-patterns.md) | ~12 Min | 7 Patterns, 6 Stolperfallen, Entscheidungshilfe |

**Gesamte Lesezeit:** ~65 Minuten

---

## Schnelluebersicht: Was diese Lektion abdeckt

```
  Arrays                          Tuples
  ┌─────────────────────┐         ┌─────────────────────────┐
  │ string[]             │         │ [string, number]        │
  │ Array<T>             │         │ Named Tuples            │
  │ readonly T[]         │         │ Optionale Elemente      │
  │ Inferenz             │         │ Rest-Elemente           │
  │ Kovarianz            │         │ Variadic Tuples         │
  │ Typsicherheits-      │         │ as const                │
  │   luecken            │         │ satisfies + as const    │
  └─────────────────────┘         └─────────────────────────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │  Praxis-Patterns    │
                    │  Stolperfallen      │
                    │  noUncheckedIndex   │
                    │  Entscheidungshilfe │
                    └─────────────────────┘
```

---

## Die Kern-Analogie

- **Array** = **Einkaufsliste** — beliebig viele Eintraege, alle vom selben Typ
- **Tuple** = **Formular** — feste Anzahl Felder, jedes mit einem bestimmten Typ

---

## Kernkonzepte zum Merken

1. **TypeScript inferiert nie Tuples** — du musst annotieren oder `as const` verwenden
2. **`readonly` bei Array-Parametern** ist fast immer die richtige Wahl
3. **Kovarianz bei mutablen Arrays** ist unsound — `readonly` macht es sicher
4. **`as const`** verhindert Widening und macht Arrays zu readonly Tuples
5. **`noUncheckedIndexedAccess`** sollte in jedem Projekt aktiv sein
6. **`Array<T>` ist Generics** — du benutzt Generics bereits seit Lektion 1

---

## Lernmaterial

| Material | Beschreibung |
|----------|-------------|
| `sections/` | Die 6 Lernabschnitte (oben verlinkt) |
| `examples/` | 5 ausfuehrbare Beispieldateien |
| `exercises/` | 3 Uebungsdateien mit steigender Schwierigkeit |
| `solutions/` | Loesungen zu den Uebungen |
| `quiz.ts` | 15 Fragen von Grundlagen bis Tiefenverstaendnis (`npx tsx quiz.ts`) |
| `cheatsheet.md` | Schnellreferenz zum Nachschlagen |

---

## Empfohlener Lernpfad

```
  Sektionen 1-6 durcharbeiten (mit Pausen)
       │
       ▼
  examples/ durchspielen (IDE-Hover nutzen!)
       │
       ▼
  exercises/ loesen
       │
       ▼
  quiz.ts machen (npx tsx quiz.ts)
       │
       ▼
  cheatsheet.md als Referenz speichern
```

> **Tipp:** Arbeite mit deiner IDE — hover ueber Variablen, um die inferierten
> Typen zu sehen. Das ist beim Lernen von Arrays und Tuples besonders hilfreich!
