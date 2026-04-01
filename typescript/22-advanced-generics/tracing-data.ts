/**
 * Lektion 22 — Tracing-Exercises: Advanced Generics
 *
 * Themen:
 *  - Varianz-Checks und Subtyp-Beziehungen
 *  - Distributive Conditional Types
 *  - Generic Inference und Defaults
 *  - Constraint-Aufloesung
 *
 * Schwierigkeit steigend: 2 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: Distributive Conditional Types ─────────────────────────
  {
    id: "22-distributive-conditionals",
    title: "Distributive Conditional Types — Verteilung ueber Unions",
    description:
      "Verfolge wie TypeScript Conditional Types ueber Union-Typen verteilt " +
      "und wann Distribution verhindert wird.",
    code: [
      "type IsString<T> = T extends string ? 'yes' : 'no';",
      "",
      "type A = IsString<string>;",
      "type B = IsString<number>;",
      "type C = IsString<string | number>;",
      "type D = IsString<never>;",
      "",
      "type IsStringStrict<T> = [T] extends [string] ? 'yes' : 'no';",
      "type E = IsStringStrict<string | number>;",
    ],
    steps: [
      {
        lineIndex: 2,
        question: "Was ist Typ A?",
        expectedAnswer: "'yes'",
        explanation: "string extends string ist true, also 'yes'.",
      },
      {
        lineIndex: 3,
        question: "Was ist Typ B?",
        expectedAnswer: "'no'",
        explanation: "number extends string ist false, also 'no'.",
      },
      {
        lineIndex: 4,
        question: "Was ist Typ C? (Achtung: Distribution!)",
        expectedAnswer: "'yes' | 'no'",
        explanation:
          "T ist ein nackter Typparameter. Distribution: " +
          "IsString<string> | IsString<number> = 'yes' | 'no'.",
      },
      {
        lineIndex: 5,
        question: "Was ist Typ D? (never ist ein leerer Union)",
        expectedAnswer: "never",
        explanation:
          "never ist der leere Union — Distribution ueber 0 Members ergibt never. " +
          "Der Conditional wird nie ausgewertet.",
      },
      {
        lineIndex: 8,
        question: "Was ist Typ E? (Mit Tuple-Wrapping)",
        expectedAnswer: "'no'",
        explanation:
          "[T] ist gewrappt — keine Distribution. " +
          "[string | number] extends [string] ist false, also 'no'.",
      },
    ],
    difficulty: 3,
    concept: "Distributive Conditional Types und Tuple-Wrapping",
  },

  // ─── Exercise 2: Generic Inference und Defaults ─────────────────────────
  {
    id: "22-inference-defaults",
    title: "Generic Inference vs Default-Typparameter",
    description:
      "Verfolge wie TypeScript entscheidet ob ein Typparameter inferiert " +
      "oder der Default verwendet wird.",
    code: [
      "function wrap<T = string>(value: T): { wrapped: T } {",
      "  return { wrapped: value };",
      "}",
      "",
      "const a = wrap('hello');",
      "const b = wrap(42);",
      "const c = wrap(true);",
      "const d = wrap<number>('hello');",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Was ist der Typ von a.wrapped?",
        expectedAnswer: "string",
        explanation:
          "TypeScript inferiert T = string aus dem Argument 'hello'. " +
          "Inference hat Vorrang vor dem Default.",
      },
      {
        lineIndex: 5,
        question: "Was ist der Typ von b.wrapped?",
        expectedAnswer: "number",
        explanation:
          "T wird als number inferiert — der Default string wird ignoriert.",
      },
      {
        lineIndex: 6,
        question: "Was ist der Typ von c.wrapped?",
        expectedAnswer: "boolean",
        explanation:
          "T wird als boolean inferiert — auch hier wird der Default ignoriert.",
      },
      {
        lineIndex: 7,
        question: "Kompiliert Zeile d? Warum (nicht)?",
        expectedAnswer: "Compile-Error: string ist kein number",
        explanation:
          "T wurde explizit als number angegeben, aber 'hello' ist ein string. " +
          "Explicit > Inference > Default.",
      },
    ],
    difficulty: 2,
    concept: "Inference-Prioritaet: Explicit > Inference > Default",
  },

  // ─── Exercise 3: Varianz in der Praxis ──────────────────────────────────
  {
    id: "22-variance-practice",
    title: "Varianz — Welche Zuweisungen sind erlaubt?",
    description:
      "Pruefe fuer jede Zuweisung ob sie typsicher ist, " +
      "basierend auf Kovarianz und Kontravarianz.",
    code: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "interface Producer<out T> { get(): T; }",
      "interface Consumer<in T> { accept(item: T): void; }",
      "",
      "declare const catProd: Producer<Cat>;",
      "declare const animalProd: Producer<Animal>;",
      "declare const catCons: Consumer<Cat>;",
      "declare const animalCons: Consumer<Animal>;",
      "",
      "const a: Producer<Animal> = catProd;",
      "const b: Consumer<Cat> = animalCons;",
      "// const c: Producer<Cat> = animalProd;",
      "// const d: Consumer<Animal> = catCons;",
    ],
    steps: [
      {
        lineIndex: 11,
        question: "Ist Zeile a erlaubt? (Producer<Animal> = catProd)",
        expectedAnswer: "Ja — Kovarianz: Producer<Cat> extends Producer<Animal>",
        explanation:
          "Producer ist kovariant (out T). Cat extends Animal, " +
          "also Producer<Cat> extends Producer<Animal>. Erlaubt!",
      },
      {
        lineIndex: 12,
        question: "Ist Zeile b erlaubt? (Consumer<Cat> = animalCons)",
        expectedAnswer: "Ja — Kontravarianz: Consumer<Animal> extends Consumer<Cat>",
        explanation:
          "Consumer ist kontravariant (in T). Die Subtyprichtung kehrt sich um: " +
          "Consumer<Animal> extends Consumer<Cat>. Erlaubt!",
      },
      {
        lineIndex: 13,
        question: "Warum ist Zeile c (auskommentiert) ein Fehler?",
        expectedAnswer: "Producer<Animal> extends Producer<Cat> ist falsch (falsche Richtung)",
        explanation:
          "Bei Kovarianz bleibt die Richtung: Cat < Animal, also Producer<Cat> < Producer<Animal>. " +
          "Die Zuweisung Producer<Cat> = Producer<Animal> geht in die falsche Richtung.",
      },
      {
        lineIndex: 14,
        question: "Warum ist Zeile d (auskommentiert) ein Fehler?",
        expectedAnswer: "Consumer<Cat> extends Consumer<Animal> ist falsch (falsche Richtung)",
        explanation:
          "Bei Kontravarianz kehrt sich die Richtung um: Consumer<Animal> < Consumer<Cat>. " +
          "Consumer<Animal> = Consumer<Cat> geht in die falsche Richtung.",
      },
    ],
    difficulty: 3,
    concept: "Kovarianz und Kontravarianz in der Praxis",
  },

  // ─── Exercise 4: Constraint-Aufloesung ──────────────────────────────────
  {
    id: "22-constraint-resolution",
    title: "Constraint-Aufloesung und Intersection",
    description:
      "Verfolge wie TypeScript Constraints auflöst und " +
      "welche Typen akzeptiert werden.",
    code: [
      "interface HasId { id: number; }",
      "interface HasName { name: string; }",
      "interface HasEmail { email: string; }",
      "",
      "function process<T extends HasId & HasName>(item: T): string {",
      "  return `${item.id}: ${item.name}`;",
      "}",
      "",
      "const a = process({ id: 1, name: 'Max' });",
      "const b = process({ id: 2, name: 'Anna', email: 'anna@test.de' });",
      "// const c = process({ id: 3 });",
      "// const d = process({ name: 'Tom' });",
    ],
    steps: [
      {
        lineIndex: 8,
        question: "Kompiliert Zeile a? Was ist der Typ von a?",
        expectedAnswer: "Ja, string — hat id UND name",
        explanation:
          "Das Objekt hat beide Properties (id und name). " +
          "T wird als { id: number; name: string } inferiert.",
      },
      {
        lineIndex: 9,
        question: "Kompiliert Zeile b? Ist email ein Problem?",
        expectedAnswer: "Ja — extra Properties sind erlaubt bei generischen Constraints",
        explanation:
          "T extends HasId & HasName verlangt mindestens id und name. " +
          "Zusaetzliche Properties (email) sind erlaubt. T wird als " +
          "{ id: number; name: string; email: string } inferiert.",
      },
      {
        lineIndex: 10,
        question: "Warum ist Zeile c ein Fehler?",
        expectedAnswer: "Property 'name' fehlt — Constraint nicht erfuellt",
        explanation:
          "Der Intersection-Constraint verlangt ALLE Properties von HasId UND HasName. " +
          "Ohne name ist der Constraint nicht erfuellt.",
      },
      {
        lineIndex: 11,
        question: "Warum ist Zeile d ein Fehler?",
        expectedAnswer: "Property 'id' fehlt — Constraint nicht erfuellt",
        explanation:
          "Gleiche Logik: HasId verlangt id, HasName verlangt name. " +
          "Beide muessen vorhanden sein.",
      },
    ],
    difficulty: 2,
    concept: "Intersection-Constraints und Typ-Inferenz",
  },
];
