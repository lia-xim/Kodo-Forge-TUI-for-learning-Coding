/**
 * Lesson 22 — Pre-Test Questions: Advanced Generics
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: "Prime" the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section this question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: Generics Recap & Limits ────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Which of these tasks can NOT be solved with a simple generic `<T>`?",
    options: [
      "Write an array wrapper: `wrap<T>(x: T): T[]`",
      "Write a container type that works with Array<T>, Map<K,V>, and Set<T>",
      "Write an identity type: `type Id<T> = T`",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "A generic container over different container types (Array, Map, Set) " +
      "requires Higher-Order Types — simple generics are not enough.",
  },
  {
    sectionIndex: 1,
    question:
      "What happens when you write `type Apply<F, A> = F<A>` in TypeScript?",
    code: "type Apply<F, A> = F<A>;",
    options: [
      "It works — F is called with A",
      "Compile error — F is not a generic type",
      "It only works with interfaces",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript does not support Higher-Kinded Types. A type parameter " +
      "cannot itself accept type parameters.",
  },
  {
    sectionIndex: 1,
    question:
      "Why did Anders Hejlsberg design TypeScript's generics the way they are?",
    options: [
      "Because of JavaScript compatibility and zero runtime cost",
      "Because Haskell-style generics are too hard to learn",
      "Because of performance problems with complex generics",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript was meant to be a superset of JavaScript — without runtime overhead. " +
      "Generics with type erasure fit perfectly with that goal.",
  },

  // ─── Section 2: Higher-Order Types ──────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "What is a 'Type Constructor'?",
    options: [
      "A class with a constructor",
      "A type that itself has a type parameter (like Array<T> or Promise<T>)",
      "A function that creates types at runtime",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "A Type Constructor is a generic type like `Array<T>`. " +
      "It only becomes a concrete type when you supply T: `Array<string>`.",
  },
  {
    sectionIndex: 2,
    question:
      "How does `Promise<T>` differ from `string` as a type?",
    options: [
      "Not at all — both are types",
      "`Promise<T>` is a Type Constructor (needs an argument), `string` is a concrete type",
      "`Promise<T>` only exists at runtime",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "`string` is immediately usable. `Promise` alone is not a complete type — " +
      "it needs an argument like `Promise<string>`. That makes it a Type Constructor.",
  },
  {
    sectionIndex: 2,
    question:
      "What is the 'URI-to-Kind' pattern?",
    options: [
      "A method for parsing URLs",
      "A pattern for emulating Higher-Kinded Types using interface maps",
      "A naming convention for TypeScript files",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "The URI-to-Kind pattern uses an interface as a lookup map: " +
      "string keys are mapped to concrete generic types.",
  },

  // ─── Section 3: Understanding Variance ──────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "If `Cat extends Animal`, is `Array<Cat>` a subtype of `Array<Animal>`?",
    options: [
      "Yes — because Cat is a subtype of Animal",
      "Only for readonly arrays",
      "No — because arrays can also be written to",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Arrays are invariant: you can both read AND write elements. " +
      "Only ReadonlyArray<Cat> would be a subtype of ReadonlyArray<Animal> (covariant).",
  },
  {
    sectionIndex: 3,
    question:
      "What does 'contravariance' mean for function parameters?",
    code: "type Handler<T> = (item: T) => void;",
    options: [
      "Handler<Cat> is a subtype of Handler<Animal>",
      "Handler<Cat> and Handler<Animal> are identical",
      "Handler<Animal> is a subtype of Handler<Cat>",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Contravariance reverses the subtype direction: `Handler<Animal>` is a " +
      "subtype of `Handler<Cat>`, because whoever can handle Animal can also handle Cat.",
  },
  {
    sectionIndex: 3,
    question:
      "Java's array covariance (`String[]` is a subtype of `Object[]`) was a design mistake. Why?",
    options: [
      "Because you could write `Object[] arr = new String[1]; arr[0] = 42;` — runtime crash",
      "Because arrays in Java are immutable",
      "Because it brought no performance benefits",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Covariant mutable arrays allow unsafe write operations to slip past the compiler. " +
      "This leads to ArrayStoreExceptions at runtime.",
  },

  // ─── Section 4: in/out Modifiers ────────────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "What does `interface Producer<out T>` mean?",
    options: [
      "T is only used in output position (covariant)",
      "T is only used in input position (contravariant)",
      "T is optional",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`out T` declares covariance: T appears only in output position (return values). " +
      "TypeScript checks that T is not used in input position.",
  },
  {
    sectionIndex: 4,
    question:
      "In which TypeScript version were the `in`/`out` modifiers introduced?",
    options: [
      "TypeScript 4.0",
      "I don't know",
      "TypeScript 5.0",
      "TypeScript 4.7",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript 4.7 (May 2022) introduced the `in`/`out` modifiers, " +
      "inspired by C#'s variance annotations.",
  },
  {
    sectionIndex: 4,
    question:
      "Can a type parameter be both `in` AND `out` at the same time?",
    options: [
      "Yes — `<in out T>` is valid syntax for invariant types",
      "No — that would be a contradiction",
      "Only for classes, not interfaces",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`<in out T>` is valid and declares invariance: T is used in both " +
      "input and output position.",
  },

  // ─── Section 5: Advanced Constraints ────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "What does `T extends A & B` mean in TypeScript?",
    options: [
      "T must be a subtype of A OR B",
      "I don't know",
      "T is a union of A and B",
      "T must be a subtype of A AND B (have all properties of both types)",
    ],
    correct: 3,
    briefExplanation:
      "Intersection constraints require T to have all properties of " +
      "A AND B — like an AND contract.",
  },
  {
    sectionIndex: 5,
    question:
      "What happens with `SomeType<string | number>` when SomeType is a Conditional Type?",
    code: "type SomeType<T> = T extends string ? 'str' : 'other';",
    options: [
      "The result is `'str' | 'other'` (distribution over the union)",
      "The result is `'other'` (union is not a string)",
      "Compile error",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Distributive Conditional Types distribute over unions: " +
      "`SomeType<string | number>` = `SomeType<string> | SomeType<number>` = `'str' | 'other'`.",
  },
  {
    sectionIndex: 5,
    question:
      "What is F-bounded Polymorphism?",
    code: "interface Comparable<T extends Comparable<T>> { compareTo(other: T): number; }",
    options: [
      "Another name for generics",
      "A pattern that only exists in functional languages",
      "A pattern where the type parameter references itself in the constraint",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "F-bounded Polymorphism: T references itself in the constraint. " +
      "Ensures that types are only comparable with themselves.",
  },

  // ─── Section 6: Designing Generic APIs ──────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "When is a type parameter redundant (anti-pattern)?",
    options: [
      "When it appears more than once",
      "I don't know",
      "When it has a default value",
      "When it appears only once and establishes no relationship",
    ],
    correct: 3,
    briefExplanation:
      "A type parameter that appears only once correlates nothing. " +
      "It can be replaced by `unknown`. This is the 'Rule of Two'.",
  },
  {
    sectionIndex: 6,
    question:
      "What is better for a parse function: `parse<T>(input: string): T` or overloads?",
    options: [
      "The generic — because it is more flexible",
      "I don't know",
      "Both are equivalent",
      "Overloads — because the input-output relationship is discrete and finite",
    ],
    correct: 3,
    briefExplanation:
      "Overloads are better when the relationship between input and output " +
      "is a finite set of concrete cases, not parametric.",
  },
  {
    sectionIndex: 6,
    question:
      "What happens when TypeScript cannot infer a type parameter and no default exists?",
    options: [
      "Compile error",
      "TypeScript infers `any`",
      "TypeScript infers `unknown`",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Without an inference candidate and without a default, TypeScript falls back to `unknown` " +
      "(previously `{}`, since TS 5.x mostly `unknown`).",
  },
];