/**
 * Lesson 22 — Tracing Exercises: Advanced Generics
 *
 * Topics:
 *  - Variance checks and subtype relationships
 *  - Distributive Conditional Types
 *  - Generic Inference and Defaults
 *  - Constraint resolution
 *
 * Difficulty increasing: 2 → 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: Distributive Conditional Types ─────────────────────────
  {
    id: "22-distributive-conditionals",
    title: "Distributive Conditional Types — Distribution over Unions",
    description:
      "Trace how TypeScript distributes Conditional Types over union types " +
      "and when distribution is prevented.",
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
        question: "What is type A?",
        expectedAnswer: "'yes'",
        explanation: "string extends string is true, so 'yes'.",
      },
      {
        lineIndex: 3,
        question: "What is type B?",
        expectedAnswer: "'no'",
        explanation: "number extends string is false, so 'no'.",
      },
      {
        lineIndex: 4,
        question: "What is type C? (Note: Distribution!)",
        expectedAnswer: "'yes' | 'no'",
        explanation:
          "T is a bare type parameter. Distribution: " +
          "IsString<string> | IsString<number> = 'yes' | 'no'.",
      },
      {
        lineIndex: 5,
        question: "What is type D? (never is an empty union)",
        expectedAnswer: "never",
        explanation:
          "never is the empty union — distribution over 0 members yields never. " +
          "The conditional is never evaluated.",
      },
      {
        lineIndex: 8,
        question: "What is type E? (With tuple wrapping)",
        expectedAnswer: "'no'",
        explanation:
          "[T] is wrapped — no distribution. " +
          "[string | number] extends [string] is false, so 'no'.",
      },
    ],
    difficulty: 3,
    concept: "Distributive Conditional Types and Tuple Wrapping",
  },

  // ─── Exercise 2: Generic Inference and Defaults ─────────────────────────
  {
    id: "22-inference-defaults",
    title: "Generic Inference vs Default Type Parameters",
    description:
      "Trace how TypeScript decides whether a type parameter is inferred " +
      "or the default is used.",
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
        question: "What is the type of a.wrapped?",
        expectedAnswer: "string",
        explanation:
          "TypeScript infers T = string from the argument 'hello'. " +
          "Inference takes precedence over the default.",
      },
      {
        lineIndex: 5,
        question: "What is the type of b.wrapped?",
        expectedAnswer: "number",
        explanation:
          "T is inferred as number — the default string is ignored.",
      },
      {
        lineIndex: 6,
        question: "What is the type of c.wrapped?",
        expectedAnswer: "boolean",
        explanation:
          "T is inferred as boolean — the default is also ignored here.",
      },
      {
        lineIndex: 7,
        question: "Does line d compile? Why (not)?",
        expectedAnswer: "Compile error: string is not a number",
        explanation:
          "T was explicitly specified as number, but 'hello' is a string. " +
          "Explicit > Inference > Default.",
      },
    ],
    difficulty: 2,
    concept: "Inference Priority: Explicit > Inference > Default",
  },

  // ─── Exercise 3: Variance in Practice ───────────────────────────────────
  {
    id: "22-variance-practice",
    title: "Variance — Which Assignments Are Allowed?",
    description:
      "Check for each assignment whether it is type-safe, " +
      "based on covariance and contravariance.",
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
        question: "Is line a allowed? (Producer<Animal> = catProd)",
        expectedAnswer: "Yes — Covariance: Producer<Cat> extends Producer<Animal>",
        explanation:
          "Producer is covariant (out T). Cat extends Animal, " +
          "so Producer<Cat> extends Producer<Animal>. Allowed!",
      },
      {
        lineIndex: 12,
        question: "Is line b allowed? (Consumer<Cat> = animalCons)",
        expectedAnswer: "Yes — Contravariance: Consumer<Animal> extends Consumer<Cat>",
        explanation:
          "Consumer is contravariant (in T). The subtype direction is reversed: " +
          "Consumer<Animal> extends Consumer<Cat>. Allowed!",
      },
      {
        lineIndex: 13,
        question: "Why is line c (commented out) an error?",
        expectedAnswer: "Producer<Animal> extends Producer<Cat> is false (wrong direction)",
        explanation:
          "With covariance the direction is preserved: Cat < Animal, so Producer<Cat> < Producer<Animal>. " +
          "The assignment Producer<Cat> = Producer<Animal> goes in the wrong direction.",
      },
      {
        lineIndex: 14,
        question: "Why is line d (commented out) an error?",
        expectedAnswer: "Consumer<Cat> extends Consumer<Animal> is false (wrong direction)",
        explanation:
          "With contravariance the direction is reversed: Consumer<Animal> < Consumer<Cat>. " +
          "Consumer<Animal> = Consumer<Cat> goes in the wrong direction.",
      },
    ],
    difficulty: 3,
    concept: "Covariance and Contravariance in Practice",
  },

  // ─── Exercise 4: Constraint Resolution ──────────────────────────────────
  {
    id: "22-constraint-resolution",
    title: "Constraint Resolution and Intersection",
    description:
      "Trace how TypeScript resolves constraints and " +
      "which types are accepted.",
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
        question: "Does line a compile? What is the type of a?",
        expectedAnswer: "Yes, string — has id AND name",
        explanation:
          "The object has both properties (id and name). " +
          "T is inferred as { id: number; name: string }.",
      },
      {
        lineIndex: 9,
        question: "Does line b compile? Is email a problem?",
        expectedAnswer: "Yes — extra properties are allowed with generic constraints",
        explanation:
          "T extends HasId & HasName requires at least id and name. " +
          "Additional properties (email) are allowed. T is inferred as " +
          "{ id: number; name: string; email: string }.",
      },
      {
        lineIndex: 10,
        question: "Why is line c an error?",
        expectedAnswer: "Property 'name' is missing — constraint not satisfied",
        explanation:
          "The intersection constraint requires ALL properties from HasId AND HasName. " +
          "Without name the constraint is not satisfied.",
      },
      {
        lineIndex: 11,
        question: "Why is line d an error?",
        expectedAnswer: "Property 'id' is missing — constraint not satisfied",
        explanation:
          "Same logic: HasId requires id, HasName requires name. " +
          "Both must be present.",
      },
    ],
    difficulty: 2,
    concept: "Intersection Constraints and Type Inference",
  },
];