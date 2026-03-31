# Lektion 05: Objects & Interfaces

## Worum es geht

In den bisherigen Lektionen hast du mit primitiven Typen, Arrays und Tuples gearbeitet.
Aber echte Programme bestehen aus **Objekten** -- Benutzer, Produkte, Bestellungen,
Konfigurationen. In dieser Lektion lernst du, wie TypeScript Objektstrukturen typisiert,
und triffst auf eines der wichtigsten Konzepte der gesamten Sprache: **Structural Typing**.

**Was du am Ende dieser Lektion kannst:**

- Objekttypen inline und als Interface definieren
- Verstehen, WARUM TypeScript structural statt nominal typisiert
- Excess Property Checking erkennen und bewusst einsetzen
- `readonly`, `optional` und Index Signatures sicher anwenden
- Intersection Types und die wichtigsten Utility Types nutzen
- Praxis-Patterns fuer Angular und React anwenden

---

## Sektionen (~10 Minuten pro Sektion)

Die Lektion ist in 7 Haeppchen aufgeteilt. Bearbeite sie in Reihenfolge --
jede Sektion baut auf der vorherigen auf. Du kannst nach jeder Sektion pausieren.

| # | Sektion | Thema | Dauer |
|---|---------|-------|-------|
| 01 | [Objekt-Typen Basics](sections/01-objekt-typen-basics.md) | Object Type Literals, verschachtelte Objekte, erste Interfaces | ~10 Min |
| 02 | [Interfaces & Deklaration](sections/02-interfaces-deklaration.md) | Interface-Syntax, `extends`, Declaration Merging, Interface vs Type | ~10 Min |
| 03 | [Structural Typing](sections/03-structural-typing.md) | Duck Typing, Width Subtyping, die Designentscheidung hinter TS | ~12 Min |
| 04 | [Excess Property Checking](sections/04-excess-property-checking.md) | Die grosse Falle, "fresh" Object Literals, Umgehungswege | ~10 Min |
| 05 | [Readonly & Optional](sections/05-readonly-und-optional.md) | `readonly` (shallow!), `optional`, Destructuring mit Typen | ~10 Min |
| 06 | [Index Signatures](sections/06-index-signatures.md) | Dynamische Keys, Record<K,V>, gemischte Patterns | ~10 Min |
| 07 | [Intersection & Utility Types](sections/07-intersection-und-utility-types.md) | `&`-Operator, Partial, Pick, Omit, Praxis-Patterns | ~12 Min |

---

## Nach den Sektionen

1. Fuehre die **Examples** aus: `npx tsx examples/01-object-types.ts`
2. Bearbeite die **Exercises** -- die TODOs leiten dich
3. Mach das **Quiz**: `npx tsx quiz.ts`
4. Nutze die **Cheatsheet** als Referenz: [cheatsheet.md](cheatsheet.md)

---

## Schnellnavigation

```
05-objects-und-interfaces/
  README.md                     <-- Du bist hier
  sections/
    01-objekt-typen-basics.md
    02-interfaces-deklaration.md
    03-structural-typing.md
    04-excess-property-checking.md
    05-readonly-und-optional.md
    06-index-signatures.md
    07-intersection-und-utility-types.md
  examples/
  exercises/
  solutions/
  quiz.ts
  cheatsheet.md
```

---

**Naechste Lektion:** [Lektion 06 -- Functions](../06-functions/)
