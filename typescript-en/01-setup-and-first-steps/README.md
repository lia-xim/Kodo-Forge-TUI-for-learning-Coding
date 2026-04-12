# Lesson 01: Setup & First Steps

> Estimated total time: ~50 minutes (in 5 sections of ~10 min each)
>
> You can pause after each section. Each section works as a standalone learning unit.

---

## Sections

1. **[What is TypeScript?](sections/01-was-ist-typescript.md)** -- The history, the problem, the solution
   - Why Anders Hejlsberg built TypeScript
   - The Google-Microsoft collaboration (AtScript)
   - Superset relationship to JavaScript
   - Angular vs. React/Next.js: Different usage

2. **[The Compiler](sections/02-der-compiler.md)** -- How TypeScript becomes JavaScript
   - The three phases: Parsing, Type Checking, Emit
   - Why Type Checking and Emit are separate
   - Type Erasure: types disappear without a trace
   - What does NOT disappear (enum, class, Decorators)

3. **[Understanding tsconfig](sections/03-tsconfig-verstehen.md)** -- The heart of every TS project
   - The most important compiler options explained
   - Why `strict: true` is non-negotiable
   - allowJs/checkJs: Migration strategy
   - Source Maps and Declaration Files

4. **[Tools & Execution](sections/04-tools-und-ausfuehrung.md)** -- tsc, tsx, ts-node compared
   - `tsc`: The official compiler
   - `tsx`: Fast execution without Type Checking
   - The ideal workflow: combining both
   - Comparison table of all tools

5. **[Practice & Limits](sections/05-praxis-und-grenzen.md)** -- Type Checking vs. runtime behavior
   - TypeScript does NOT change runtime behavior
   - Where TypeScript protects you -- and where it doesn't
   - Runtime validation with zod
   - Compile time vs. runtime: The mental model

---

## Exercises & Quiz

After you've worked through all sections:

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

## Reference

- [Cheatsheet](cheatsheet.md) -- Compact overview of all concepts in this lesson

---

## Next Lesson

**Lesson 02: Primitive Types & Fundamentals** -- `../02-primitive-types/`