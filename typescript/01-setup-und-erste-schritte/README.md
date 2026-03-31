# Lektion 01: Setup & Erste Schritte

> Geschaetzte Gesamtzeit: ~50 Minuten (in 5 Sektionen a ~10 Min)
>
> Du kannst nach jeder Sektion pausieren. Jede Sektion funktioniert als eigenstaendige Lerneinheit.

---

## Sektionen

1. **[Was ist TypeScript?](sections/01-was-ist-typescript.md)** -- Die Geschichte, das Problem, die Loesung
   - Warum Anders Hejlsberg TypeScript gebaut hat
   - Die Google-Microsoft-Zusammenarbeit (AtScript)
   - Superset-Beziehung zu JavaScript
   - Angular vs. React/Next.js: Unterschiedliche Nutzung

2. **[Der Compiler](sections/02-der-compiler.md)** -- Wie TypeScript zu JavaScript wird
   - Die drei Phasen: Parsing, Type Checking, Emit
   - Warum Type Checking und Emit getrennt sind
   - Type Erasure: Typen verschwinden spurlos
   - Was NICHT verschwindet (enum, class, Decorators)

3. **[tsconfig verstehen](sections/03-tsconfig-verstehen.md)** -- Das Herz jedes TS-Projekts
   - Die wichtigsten Compiler-Optionen erklaert
   - Warum `strict: true` nicht verhandelbar ist
   - allowJs/checkJs: Migrations-Strategie
   - Source Maps und Declaration Files

4. **[Tools & Ausfuehrung](sections/04-tools-und-ausfuehrung.md)** -- tsc, tsx, ts-node im Vergleich
   - `tsc`: Der offizielle Compiler
   - `tsx`: Schnelle Ausfuehrung ohne Type Checking
   - Der ideale Workflow: beides kombinieren
   - Vergleichstabelle aller Werkzeuge

5. **[Praxis & Grenzen](sections/05-praxis-und-grenzen.md)** -- Type Checking vs. Laufzeitverhalten
   - TypeScript aendert NICHT das Laufzeitverhalten
   - Wo TypeScript schuetzt -- und wo nicht
   - Runtime-Validierung mit zod
   - Compile-Zeit vs. Laufzeit: Das mentale Modell

---

## Uebungen & Quiz

Nachdem du alle Sektionen durchgearbeitet hast:

```bash
# Beispiele ausfuehren
tsx examples/01-hello-typescript.ts
tsx examples/02-type-erasure.ts
tsx examples/03-compiler-errors.ts
tsx examples/04-source-maps-und-output.ts

# Uebungen bearbeiten
code exercises/01-erste-schritte.ts
code exercises/02-tsconfig-verstehen.ts
code exercises/03-compiler-output-vorhersagen.ts
code exercises/04-fehler-finden-und-fixen.ts
code exercises/05-predict-the-output.ts
code exercises/06-fehlermeldungen-lesen.ts

# Quiz starten
tsx quiz.ts
```

## Referenz

- [Cheatsheet](cheatsheet.md) -- Kompakte Uebersicht aller Konzepte dieser Lektion

---

## Naechste Lektion

**Lektion 02: Primitive Typen & Grundlagen** -- `../02-primitive-types/`
