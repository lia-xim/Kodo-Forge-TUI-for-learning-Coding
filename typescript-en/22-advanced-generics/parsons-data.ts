/**
 * Lesson 22 — Parson's Problems: Advanced Generics
 *
 * 4 problems for ordering lines of code.
 * Concepts: Variance, HKT Emulation, Constraints, API Design
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Covariant Producer with out ──────────────────────────
  {
    id: "L22-P1",
    title: "Covariant Producer with Variance Test",
    description:
      "Arrange the lines so that a covariant producer is created " +
      "and covariance is tested.",
    correctOrder: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "interface Producer<out T> {",
      "  produce(): T;",
      "}",
      "declare const catProducer: Producer<Cat>;",
      "const animalProducer: Producer<Animal> = catProducer;",
      "console.log(animalProducer.produce().name);",
    ],
    distractors: [
      "interface Producer<in T> {",
      "const catProducer: Producer<Animal> = animalProducer;",
    ],
    hint:
      "`out T` declares covariance: Producer<Cat> is a subtype of Producer<Animal>. " +
      "`in T` would be contravariance — the wrong direction for a producer.",
    concept: "covariance-out",
    difficulty: 2,
  },

  // ─── Problem 2: HKT Emulation with Interface Map ──────────────────────
  {
    id: "L22-P2",
    title: "Higher-Kinded Type Emulation",
    description:
      "Arrange the lines to build a simple HKT emulation using an interface map. " +
      "The child interface maps string URIs to generic types.",
    correctOrder: [
      "interface URItoKind<A> {",
      "  Array: Array<A>;",
      "  Set: Set<A>;",
      "}",
      "type URIS = keyof URItoKind<any>;",
      "type Kind<URI extends URIS, A> = URItoKind<A>[URI];",
      "type Result = Kind<'Array', string>;",
      "// Result = string[]",
    ],
    distractors: [
      "type Kind<URI, A> = URI<A>;",
      "type URIS = URItoKind<any>;",
    ],
    hint:
      "The interface is the lookup map. `Kind<URI, A>` indexes the map " +
      "with the URI string and returns the concrete type.",
    concept: "hkt-emulation",
    difficulty: 3,
  },

  // ─── Problem 3: F-bounded Polymorphism ────────────────────────────────
  {
    id: "L22-P3",
    title: "Comparable with F-bounded Polymorphism",
    description:
      "Arrange the lines for a Comparable pattern where objects can only " +
      "be compared to instances of their own type.",
    correctOrder: [
      "interface Comparable<T extends Comparable<T>> {",
      "  compareTo(other: T): number;",
      "}",
      "class Weight implements Comparable<Weight> {",
      "  constructor(public kg: number) {}",
      "  compareTo(other: Weight): number {",
      "    return this.kg - other.kg;",
      "  }",
      "}",
    ],
    distractors: [
      "interface Comparable<T> {",
      "class Weight implements Comparable<number> {",
    ],
    hint:
      "F-bounded: T's constraint references the interface itself. " +
      "The class implements Comparable with itself as the type parameter.",
    concept: "f-bounded-polymorphism",
    difficulty: 3,
  },

  // ─── Problem 4: Generic Pipe Function ─────────────────────────────────
  {
    id: "L22-P4",
    title: "Type-safe Pipe with Generics",
    description:
      "Arrange the lines for a pipe function that chains two transformations " +
      "in a type-safe manner. The types must match at each transition.",
    correctOrder: [
      "function pipe<A, B, C>(",
      "  value: A,",
      "  fn1: (a: A) => B,",
      "  fn2: (b: B) => C",
      "): C {",
      "  return fn2(fn1(value));",
      "}",
      "const result = pipe('42', parseInt, n => n * 2);",
      "// result: number",
    ],
    distractors: [
      "  fn1: (a: A) => A,",
      "  return fn1(fn2(value));",
    ],
    hint:
      "The types chain together: A → B → C. fn1 takes A and returns B, " +
      "fn2 takes B and returns C. The order is fn2(fn1(value)).",
    concept: "generic-pipe-api",
    difficulty: 2,
  },
];