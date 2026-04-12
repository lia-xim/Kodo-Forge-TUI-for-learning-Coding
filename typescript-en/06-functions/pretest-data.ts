/**
 * Lesson 06 — Pre-Test Questions: Functions
 *
 * 3 questions per section (6 sections = 18 questions).
 * Asked BEFORE reading to prime the brain.
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══ Section 1: Function Type Basics ════════════════════════════════════
  {
    sectionIndex: 1,
    question:
      "What happens when you call a TypeScript function with too few arguments?",
    code: "function add(a: number, b: number): number { return a + b; }\nadd(1);",
    options: [
      "b automatically becomes undefined",
      "Compile error: Expected 2 arguments",
      "The function returns NaN",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript is stricter than JavaScript: The number of arguments " +
      "must match exactly. In JS, b would be undefined; in TS, it's an error.",
  },
  {
    sectionIndex: 1,
    question: "What does `void` mean as a function's return type?",
    options: [
      "The function returns undefined",
      "The function returns nothing",
      "The return value is irrelevant",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "void means 'the return value is irrelevant' — not the same as undefined. " +
      "This becomes especially important with callbacks.",
  },
  {
    sectionIndex: 1,
    question: "Do you have to specify the return type for recursive functions?",
    options: [
      "No, TypeScript infers it automatically",
      "Yes, it is required",
      "Only for nested recursion",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Recursive functions create a circular reference: The return type " +
      "depends on the return value, which contains the function call itself.",
  },

  // ═══ Section 2: Optional and Default Parameters ══════════════════════════
  {
    sectionIndex: 2,
    question:
      "Can you use `x?: string` and `x: string = 'default'` at the same time?",
    options: [
      "Yes, it combines the best of both worlds",
      "No, TypeScript forbids the combination",
      "Only with rest parameters",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "A default value automatically makes the parameter optional — " +
      "the ? is redundant. TypeScript forbids the combination.",
  },
  {
    sectionIndex: 2,
    question:
      "Can an optional parameter come BEFORE a required parameter?",
    options: [
      "Yes, the order doesn't matter",
      "No, optional parameters must come at the end",
      "Only with arrow functions",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Optional parameters must come AFTER required parameters. " +
      "JavaScript arguments are position-based — otherwise you'd have to " +
      "pass undefined as a placeholder.",
  },
  {
    sectionIndex: 2,
    question: "How do you type destructuring in function parameters?",
    code: "function f({ name, age }) { ... }",
    options: [
      "function f({ name: string, age: number })",
      "function f({ name, age }: { name: string; age: number })",
      "function f(name: string, age: number)",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "The type comes AFTER the entire destructuring pattern. " +
      "{ name: string } would be a RENAME, not a type.",
  },

  // ═══ Section 3: Function Overloads ══════════════════════════════════════
  {
    sectionIndex: 3,
    question:
      "How many implementations does an overloaded function have in TypeScript?",
    options: [
      "Exactly one — the implementation signature",
      "One per overload signature",
      "At least two",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Unlike Java/C#, TypeScript has only ONE implementation. " +
      "The overload signatures are pure compile-time information.",
  },
  {
    sectionIndex: 3,
    question: "When should you use overloads instead of union types?",
    options: [
      "When the return type depends on the argument value",
      "Always — overloads are more precise",
      "Only with more than 3 parameters",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Overloads are only useful when the return type depends on the argument value. " +
      "When the return type is the same, union types are better.",
  },
  {
    sectionIndex: 3,
    question: "In what order does TypeScript check overloads?",
    options: [
      "Top to bottom — first match wins",
      "Randomly",
      "Bottom to top",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript checks top to bottom. That's why specific " +
      "overloads must come BEFORE broader ones.",
  },

  // ═══ Section 4: Callback Types ═══════════════════════════════════════════
  {
    sectionIndex: 4,
    question:
      "Can a callback with return type void return a value?",
    code: "type Cb = () => void;\nconst fn: Cb = () => 42;",
    options: [
      "Yes, void callbacks may return values",
      "No, void means 'no return'",
      "Only undefined",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Void callbacks are lenient — they may return values. " +
      "This is based on the substitutability principle.",
  },
  {
    sectionIndex: 4,
    question:
      "Why is void lenient with callbacks but strict with function declarations?",
    options: [
      "With declarations, YOU control the type; with callbacks, someone ELSE defines the interface",
      "No difference — void is always lenient",
      "It depends on strict mode",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "With declarations, YOU say void and mean it. With callbacks, the " +
      "interface says 'I don't care about the return value' — hence lenient.",
  },
  {
    sectionIndex: 4,
    question: "What is a generic callback type?",
    code: "type Mapper<T, U> = (item: T) => U;",
    options: [
      "A callback that can only be called with generics",
      "A callback that accepts any type",
      "A callback whose input and output types are flexible",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Generic callback types like Mapper<T, U> are flexible and " +
      "reusable. T and U are inferred at the call site.",
  },

  // ═══ Section 5: The this Parameter ══════════════════════════════════════
  {
    sectionIndex: 5,
    question: "What happens to the this parameter in compiled JavaScript?",
    code: "function greet(this: { name: string }) { return this.name; }",
    options: [
      "It becomes the first parameter",
      "It becomes a comment",
      "It disappears completely (type erasure)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "The this parameter disappears during compilation (type erasure). " +
      "It only serves compile-time checking.",
  },
  {
    sectionIndex: 5,
    question: "Why is this in JavaScript so confusing?",
    options: [
      "this is always undefined",
      "this only exists in classes",
      "this is determined dynamically at call time, not at definition time",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "In JavaScript, this is determined at CALL TIME. " +
      "Arrow functions solve this problem through lexical this.",
  },
  {
    sectionIndex: 5,
    question: "Why do arrow functions solve the this problem?",
    options: [
      "They automatically bind this with .bind()",
      "I don't know",
      "They always run in strict mode",
      "They have no own this — it is inherited from the surrounding scope",
    ],
    correct: 3,
    briefExplanation:
      "Arrow functions have NO own this. They inherit this " +
      "lexically from the surrounding scope — like a closure.",
  },

  // ═══ Section 6: Function Patterns ════════════════════════════════════════
  {
    sectionIndex: 6,
    question: "What is a type guard?",
    options: [
      "A decorator that checks types",
      "I don't know",
      "A compiler plugin",
      "A function with return type 'value is Type' for custom narrowing",
    ],
    correct: 3,
    briefExplanation:
      "A type guard is a function with 'value is Type' as its return type. " +
      "It extends TypeScript's automatic narrowing.",
  },
  {
    sectionIndex: 6,
    question:
      "What is the difference between a type guard and an assertion function?",
    options: [
      "No difference",
      "I don't know",
      "Type guard is faster",
      "Type guard: boolean + if-branch. Assertion function: throws on failure",
    ],
    correct: 3,
    briefExplanation:
      "Type guard = boolean (if/else). Assertion function = throws on failure, " +
      "afterward the type is guaranteed. Different control-flow strategies.",
  },
  {
    sectionIndex: 6,
    question: "What does currying do?",
    code: "function add(a: number): (b: number) => number { return (b) => a + b; }",
    options: [
      "It adds two numbers",
      "I don't know",
      "It is an array pattern",
      "It transforms a function into a chain of functions each taking one parameter",
    ],
    correct: 3,
    briefExplanation:
      "Currying separates configuration and execution: add(5) returns a " +
      "function that computes 5 + b. TypeScript infers all intermediate types.",
  },
];