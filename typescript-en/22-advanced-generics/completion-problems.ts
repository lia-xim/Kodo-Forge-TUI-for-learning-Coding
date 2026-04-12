/**
 * Lesson 22 — Completion Problems: Advanced Generics
 *
 * Code templates with strategic gaps (______).
 * The learner fills in the gaps — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code with ______ as placeholder for gaps */
  template: string;
  /** Solution with filled gaps */
  solution: string;
  /** Which gap has which answer */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Related concept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Covariant Producer (easy) ──────────────────────────────────
  {
    id: "22-cp-producer",
    title: "Covariant Producer with out Modifier",
    description:
      "Complete the interface with the correct variance modifier. " +
      "The producer only outputs T (output position).",
    template: `interface Producer<______ T> {
  get(): ______;
  peek(): ______;
}

// Test: Should be covariant
declare const catProducer: Producer<Cat>;
const animalProducer: Producer<______> = catProducer; // OK`,
    solution: `interface Producer<out T> {
  get(): T;
  peek(): T;
}

// Test: Should be covariant
declare const catProducer: Producer<Cat>;
const animalProducer: Producer<Animal> = catProducer; // OK`,
    blanks: [
      {
        placeholder: "______",
        answer: "out",
        hint: "Which modifier declares covariance (output position)?",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "What does the get() method return? The type parameter.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Same return type as get().",
      },
      {
        placeholder: "______",
        answer: "Animal",
        hint: "Covariance: Producer<Cat> is a subtype of Producer<___>",
      },
    ],
    concept: "Covariance with out Modifier",
  },

  // ─── 2: Contravariant Consumer ───────────────────────────────────────
  {
    id: "22-cp-consumer",
    title: "Contravariant Consumer with in Modifier",
    description:
      "Complete the Consumer interface. The consumer only accepts T " +
      "(input position). Contravariance reverses the subtype direction.",
    template: `interface Consumer<______ T> {
  accept(item: ______): void;
  process(item: ______): boolean;
}

// Test: Contravariance — direction reversed!
declare const animalConsumer: Consumer<Animal>;
const catConsumer: Consumer<______> = animalConsumer; // OK`,
    solution: `interface Consumer<in T> {
  accept(item: T): void;
  process(item: T): boolean;
}

// Test: Contravariance — direction reversed!
declare const animalConsumer: Consumer<Animal>;
const catConsumer: Consumer<Cat> = animalConsumer; // OK`,
    blanks: [
      {
        placeholder: "______",
        answer: "in",
        hint: "Which modifier declares contravariance (input position)?",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "The parameter type of the accept method.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Same parameter type as accept().",
      },
      {
        placeholder: "______",
        answer: "Cat",
        hint: "Contravariance: Consumer<Animal> is a subtype of Consumer<___>",
      },
    ],
    concept: "Contravariance with in Modifier",
  },

  // ─── 3: Intersection Constraint ────────────────────────────────────────
  {
    id: "22-cp-intersection-constraint",
    title: "Intersection Constraint for Multiple Requirements",
    description:
      "Write a function that accepts a type that is both " +
      "serializable and loggable. Use an intersection constraint.",
    template: `interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

function processItem<T extends ______ ______ ______>(item: T): string {
  item.______();
  return item.______();
}`,
    solution: `interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

function processItem<T extends Serializable & Loggable>(item: T): string {
  item.log();
  return item.serialize();
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "Serializable",
        hint: "First interface in the constraint.",
      },
      {
        placeholder: "______",
        answer: "&",
        hint: "Which operator combines types into an intersection?",
      },
      {
        placeholder: "______",
        answer: "Loggable",
        hint: "Second interface in the constraint.",
      },
      {
        placeholder: "______",
        answer: "log",
        hint: "Which method comes from the Loggable interface?",
      },
      {
        placeholder: "______",
        answer: "serialize",
        hint: "Which method returns a string?",
      },
    ],
    concept: "Intersection Constraints",
  },

  // ─── 4: Non-Distributive Conditional ───────────────────────────────────
  {
    id: "22-cp-non-distributive",
    title: "Preventing Distribution with Tuple Wrapping",
    description:
      "Write a conditional type that does NOT distribute over unions. " +
      "Use the tuple-wrapping pattern.",
    template: `// Distributive (default):
type IsString<T> = T extends string ? true : false;
type D = IsString<string | number>; // true | false

// Non-distributive:
type IsStringStrict<T> = ______<______> extends ______<string> ? true : false;
type ND = IsStringStrict<string | number>; // ______`,
    solution: `// Distributive (default):
type IsString<T> = T extends string ? true : false;
type D = IsString<string | number>; // true | false

// Non-distributive:
type IsStringStrict<T> = [T] extends [string] ? true : false;
type ND = IsStringStrict<string | number>; // false`,
    blanks: [
      {
        placeholder: "______",
        answer: "[T]",
        hint: "How do you wrap T to prevent distribution?",
      },
      {
        placeholder: "______",
        answer: "[T]",
        hint: "Both sides must be wrapped the same way.",
      },
      {
        placeholder: "______",
        answer: "[string]",
        hint: "The comparison type must also be wrapped.",
      },
      {
        placeholder: "______",
        answer: "false",
        hint: "string | number is NOT a subtype of string, so...",
      },
    ],
    concept: "Non-distributive Conditional Types",
  },

  // ─── 5: F-bounded Polymorphism ─────────────────────────────────────────
  {
    id: "22-cp-f-bounded",
    title: "F-bounded Polymorphism (Self-Referencing Constraint)",
    description:
      "Implement a Comparable interface where a type can only " +
      "be compared to instances of its own type.",
    template: `interface Comparable<T extends ______<______>> {
  compareTo(other: ______): number;
}

class Temperature implements Comparable<______> {
  constructor(public celsius: number) {}

  compareTo(other: ______): number {
    return this.celsius - other.celsius;
  }
}`,
    solution: `interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}

class Temperature implements Comparable<Temperature> {
  constructor(public celsius: number) {}

  compareTo(other: Temperature): number {
    return this.celsius - other.celsius;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "Comparable",
        hint: "The constraint references the interface itself.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Recursive reference: Comparable takes T as a parameter.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "The parameter of compareTo is the type parameter.",
      },
      {
        placeholder: "______",
        answer: "Temperature",
        hint: "Which concrete type is substituted for T?",
      },
      {
        placeholder: "______",
        answer: "Temperature",
        hint: "compareTo compares with another instance of the same type.",
      },
    ],
    concept: "F-bounded Polymorphism",
  },

  // ─── 6: Generic API Design — Rule of Two ──────────────────────────
  {
    id: "22-cp-rule-of-two",
    title: "Rule of Two — Type Parameter Correlation",
    description:
      "Refactor the unnecessary generics. Only type parameters that appear at least " +
      "twice (input-output correlation) are useful.",
    template: `// Anti-Pattern: T used only once
function logValue<T>(value: T): void {
  console.log(value);
}

// Better: replace T with ______
function logValueFixed(value: ______): void {
  console.log(value);
}

// Good generic: T appears 2x (Input → Output)
function firstElement<T>(arr: ______[]): ______ | undefined {
  return arr[0];
}`,
    solution: `// Anti-Pattern: T used only once
function logValue<T>(value: T): void {
  console.log(value);
}

// Better: replace T with unknown
function logValueFixed(value: unknown): void {
  console.log(value);
}

// Good generic: T appears 2x (Input → Output)
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Which type accepts everything but is safe (not any)?",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "The array element type — same as the return type.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Same type as the array elements — that is the correlation.",
      },
    ],
    concept: "Rule of Two for Meaningful Type Parameters",
  },
];