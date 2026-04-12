/**
 * Lesson 08 — Quiz Data: Type Aliases vs Interfaces
 *
 * 15 questions on type vs interface, Declaration Merging,
 * extends vs &, decision matrix, patterns.
 *
 * correct-index distribution: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "08";
export const lessonTitle = "Type Aliases vs Interfaces";

export const questions: QuizQuestion[] = [
  {
    question: "Does `type UserID = string` create a new type?",
    options: [
      "Yes — UserID is its own type, independent of string",
      "No — it's just an alias (nickname) for string",
      "Yes, but only in strict mode",
      "Only when UserID is exported",
    ],
    correct: 1,
    explanation:
      "A Type Alias does NOT create a new type — it just gives an existing " +
      "type a name. UserID IS string. Wherever string is expected, " +
      "UserID can be used and vice versa.",
    elaboratedFeedback: {
      whyCorrect:
        "Type Aliases are nicknames — they don't create a structurally new type. " +
        "UserID and string are identical.",
      commonMistake:
        "Many expect nominal typing like in Java. TypeScript is structurally " +
        "typed — the alias doesn't change the type.",
    },
  },

  {
    question: "What can `type` do that `interface` CANNOT?",
    options: [
      "Union Types, Mapped Types, Conditional Types, Tuple Types",
      "Describe object types",
      "Define methods",
      "Be implemented by classes",
    ],
    correct: 0,
    explanation:
      "type is the all-purpose tool: It can do Unions, Intersections, " +
      "Mapped Types, Conditional Types and Tuples — everything interfaces " +
      "cannot. Interfaces are specialized for object shapes.",
    elaboratedFeedback: {
      whyCorrect:
        "type is the all-purpose tool. Union, Mapped, Conditional and Tuple Types " +
        "only work with type.",
      commonMistake:
        "Some think interface can do everything type can. For non-object types, " +
        "type is required.",
    },
  },

  {
    question: "What is Declaration Merging?",
    code: "interface User { name: string; }\ninterface User { email: string; }\n// User now has name AND email",
    options: [
      "An error — you cannot declare an interface twice",
      "The second declaration overwrites the first",
      "Both declarations are merged into one interface",
      "Only the common properties remain",
    ],
    correct: 2,
    explanation:
      "Declaration Merging is a feature of interfaces: Multiple " +
      "declarations with the same name are automatically merged. " +
      "Type Aliases CANNOT do this — a duplicate type declaration is an error.",
    elaboratedFeedback: {
      whyCorrect:
        "Interfaces with the same name are merged. All properties from " +
        "both declarations form one interface.",
      commonMistake:
        "Coming from other languages, you'd expect an error for duplicate declarations.",
    },
  },

  {
    question: "When is Declaration Merging useful?",
    options: [
      "Never — it's a design flaw",
      "When extending library types (e.g. Window, Express.Request)",
      "Only for legacy code",
      "Only in .d.ts files",
    ],
    correct: 1,
    explanation:
      "Declaration Merging allows you to extend library interfaces " +
      "without changing the source code. For example, you can extend Window " +
      "with custom properties or Express.Request with custom fields.",
    elaboratedFeedback: {
      whyCorrect:
        "Declaration Merging extends library types without changing their source code — " +
        "Module Augmentation.",
      commonMistake:
        "Many think it's just a mistake when you declare an interface twice.",
    },
  },

  {
    question: "What is the difference between `extends` and `&`?",
    code: "interface B extends A { extra: string; }\ntype B = A & { extra: string; }",
    options: [
      "extends is faster for the compiler and reports conflicts as errors",
      "No difference — they are interchangeable",
      "& is faster",
      "extends only works with classes",
    ],
    correct: 0,
    explanation:
      "extends is more efficient for the compiler (is cached) and reports " +
      "property conflicts directly as errors. & silently creates never-properties " +
      "on conflicts. For object inheritance, extends is better.",
    elaboratedFeedback: {
      whyCorrect:
        "extends is cached and reports conflicts. & is more flexible but creates " +
        "silent never-properties.",
      commonMistake:
        "Many consider extends and & identical. The compiler treats them differently.",
    },
  },

  {
    question: "What happens with a property conflict using `extends`?",
    code: "interface A { x: string; }\ninterface B extends A { x: number; }",
    options: [
      "x becomes string & number = never",
      "x becomes string | number",
      "Compile-Error: Types of property 'x' are incompatible",
      "The second declaration wins",
    ],
    correct: 2,
    explanation:
      "extends reports conflicts DIRECTLY as a compile error. This is an " +
      "advantage over &, which silently creates never-properties. " +
      "extends protects you from accidental incompatibilities.",
    elaboratedFeedback: {
      whyCorrect:
        "extends immediately raises an alarm on incompatible properties. That's safer " +
        "than the silent never from &.",
      commonMistake:
        "Some expect extends to overwrite the property. It enforces compatibility.",
    },
  },

  {
    question: "Can an interface describe a union type?",
    options: [
      "Yes: interface StringOrNumber { ... }",
      "No — interfaces can only describe object shapes",
      "Yes, with the | operator inside the interface",
      "Only in combination with type",
    ],
    correct: 1,
    explanation:
      "Interfaces are specialized for object shapes. They cannot describe " +
      "Union Types, Tuple Types or Primitive Aliases. " +
      "For that you need `type`.",
    elaboratedFeedback: {
      whyCorrect:
        "Interfaces are specialized for object shapes. For everything else you need type.",
      commonMistake:
        "Some try to simulate Union Types with interfaces. That doesn't work.",
    },
  },

  {
    question: "What happens with a property conflict using `&`?",
    code: "type A = { x: string };\ntype B = { x: number };\ntype AB = A & B; // x is ???",
    options: [
      "x becomes string & number = never (no error, but unusable)",
      "Compile-Error",
      "x becomes string | number",
      "x becomes string (first wins)",
    ],
    correct: 0,
    explanation:
      "Intersection conflicts produce NO error! The property becomes " +
      "string & number = never — technically valid but no value can " +
      "ever be assigned. That's a silent bug.",
    elaboratedFeedback: {
      whyCorrect:
        "Intersection conflicts never produce an error — only a never-property. " +
        "Silent and dangerous.",
      commonMistake:
        "Almost everyone expects a compile error. The silent never is a common bug.",
    },
  },

  {
    question: "Which statement about `implements` is correct?",
    code: "interface Printable { print(): void; }\nclass Report implements Printable { ... }",
    options: [
      "implements generates runtime code",
      "Only interfaces can be implemented, not types",
      "implements is a compile-time check that the class satisfies the interface shape",
      "implements automatically inherits the methods",
    ],
    correct: 2,
    explanation:
      "implements is a pure compile-time check: TypeScript verifies whether " +
      "the class has all the properties and methods of the interface. " +
      "It inherits nothing — the class must implement everything itself. " +
      "By the way: type aliases can also be used with implements.",
    elaboratedFeedback: {
      whyCorrect:
        "implements is purely a compile-time check. It generates no code and inherits nothing.",
      commonMistake:
        "Many think implements inherits methods like extends does with classes.",
    },
  },

  {
    question: "Can an interface describe a function?",
    code: "interface Formatter {\n  (input: string): string;\n}",
    options: [
      "No — interfaces are only for objects",
      "Yes — with the call-signature syntax",
      "Only with extends from Function",
      "Only in .d.ts declaration files",
    ],
    correct: 1,
    explanation:
      "Interfaces can have call signatures: interface Formatter { (input: string): string; }. " +
      "This describes a callable function. In practice, " +
      "type Formatter = (input: string) => string is more common.",
    elaboratedFeedback: {
      whyCorrect:
        "Interfaces can have call signatures. In practice, the type syntax is more common.",
      commonMistake:
        "Some think only type can describe functions. Interfaces can too.",
    },
  },

  {
    question: "When does the Angular Style Guide recommend interfaces?",
    options: [
      "For service contracts, DTOs and everything that describes object shapes",
      "Never — Angular prefers type",
      "Only for Dependency Injection",
      "Only for Components",
    ],
    correct: 0,
    explanation:
      "Angular prefers interfaces for most object types: " +
      "service contracts, DTOs, Component inputs. Declaration Merging " +
      "is useful for the extensible Angular ecosystem types.",
    elaboratedFeedback: {
      whyCorrect:
        "Angular prefers interfaces for object types because of Declaration Merging and extends.",
      commonMistake:
        "Some think Angular requires interfaces. It's a recommendation, not mandatory.",
    },
  },

  {
    question: "When does the React community prefer `type`?",
    options: [
      "Never — React prefers interface",
      "Only for hooks",
      "Only for Styled Components",
      "For Props (often unions), State, and generally because type is more flexible",
    ],
    correct: 3,
    explanation:
      "The React community prefers type: Props are often unions, " +
      "discriminated unions for state, and type is more flexible for " +
      "the functional programming style React promotes.",
    elaboratedFeedback: {
      whyCorrect:
        "React uses many functional patterns: union props, discriminated states — " +
        "type fits better.",
      commonMistake:
        "Some think you must use type in React. Interface works for props too.",
    },
  },

  {
    question: "What are the three rules of thumb for type vs interface?",
    options: [
      "Always type, never interface",
      "Always interface, only type for primitives",
      "There are no clear rules",
      "Union/Mapped/Conditional → type, object shapes → interface (or type), consistency in the team",
    ],
    correct: 3,
    explanation:
      "1) If you need Union/Mapped/Conditional Types → type. " +
      "2) If you're describing an object shape → interface (or type — both OK). " +
      "3) Be consistent in the team — the choice is less important than uniformity.",
    elaboratedFeedback: {
      whyCorrect:
        "The three rules cover 95% of cases. Consistency is the most important thing.",
      commonMistake:
        "Many look for the 'perfect' rule. In reality, team consistency is more important.",
    },
  },

  {
    question: "What can `interface` do that `type` CANNOT?",
    options: [
      "Define union types",
      "Describe function types",
      "Declaration Merging — declare an interface multiple times and merge them",
      "Be used in generics",
    ],
    correct: 2,
    explanation:
      "Declaration Merging is the only feature that only interfaces have. " +
      "A duplicate type declaration is an error. Interfaces can be " +
      "extended without changing the original declaration.",
    elaboratedFeedback: {
      whyCorrect:
        "Declaration Merging is the unique selling point of interfaces. " +
        "Type Aliases cannot do this.",
      commonMistake:
        "Some confuse Declaration Merging with Intersection. They are different mechanisms.",
    },
  },

  {
    question: "Which tool enforces team-wide type/interface consistency?",
    options: [
      "TypeScript Compiler",
      "Prettier",
      "tsconfig.json",
      "ESLint with @typescript-eslint/consistent-type-definitions",
    ],
    correct: 3,
    explanation:
      "The ESLint rule @typescript-eslint/consistent-type-definitions can " +
      "enforce whether the team always uses type or always interface for object types. " +
      "Consistency is more important than the 'correct' choice.",
    elaboratedFeedback: {
      whyCorrect:
        "ESLint enforces team-wide consistency. The compiler has no opinion on " +
        "type vs interface.",
      commonMistake:
        "Some think tsconfig.json can enforce type vs interface. That only works through linting.",
    },
  },

  // ─── Additional Formats ──────────────────────────────────────────────────────

  // --- Question 16: Short-Answer — Declaration Merging ---
  {
    type: "short-answer",
    question: "Which keyword supports Declaration Merging — type or interface?",
    expectedAnswer: "interface",
    acceptableAnswers: ["interface", "Interface", "interfaces"],
    explanation:
      "Only interfaces support Declaration Merging. Multiple declarations with " +
      "the same name are automatically merged. With type, a duplicate declaration " +
      "would produce a 'Duplicate identifier' error.",
  },

  // --- Question 17: Short-Answer — Property Conflict with & ---
  {
    type: "short-answer",
    question: "What will the type of `x` be in `type AB = { x: string } & { x: number }`?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "string & number", "string & number = never"],
    explanation:
      "With intersection conflicts, the property becomes string & number = never. " +
      "This produces no compile error, but makes the property unusable — " +
      "no value is simultaneously string AND number. A silent bug!",
  },

  // --- Question 18: Short-Answer — ESLint Rule ---
  {
    type: "short-answer",
    question: "What is the name of the ESLint rule that enforces type vs interface consistency?",
    expectedAnswer: "consistent-type-definitions",
    acceptableAnswers: [
      "consistent-type-definitions",
      "@typescript-eslint/consistent-type-definitions",
      "typescript-eslint/consistent-type-definitions",
    ],
    explanation:
      "The rule @typescript-eslint/consistent-type-definitions enforces whether " +
      "the team always uses type or always interface for object types.",
  },

  // --- Question 19: Predict-Output — Declaration Merging ---
  {
    type: "predict-output",
    question: "Does this code compile without errors? Answer with 'yes' or 'no'.",
    code: "interface Settings {\n  theme: string;\n}\ninterface Settings {\n  lang: string;\n}\nconst s: Settings = { theme: 'dark', lang: 'de' };",
    expectedAnswer: "yes",
    acceptableAnswers: ["yes", "Yes"],
    explanation:
      "Declaration Merging combines both interface declarations. " +
      "Settings ends up with both theme and lang. The object satisfies " +
      "both properties — no error.",
  },

  // --- Question 20: Predict-Output — extends Conflict ---
  {
    type: "predict-output",
    question: "Does this code compile without errors? Answer with 'yes' or 'no'.",
    code: "interface Base {\n  id: string;\n}\ninterface Extended extends Base {\n  id: number;\n}",
    expectedAnswer: "no",
    acceptableAnswers: ["no", "No"],
    explanation:
      "extends reports property conflicts directly as a compile error: " +
      "'Types of property id are incompatible'. id is string in Base, " +
      "but Extended wants number — that's incompatible. " +
      "With & id would silently become never.",
  },

  // --- Question 21: Explain-Why — type vs interface ---
  {
    type: "explain-why",
    question: "Why is consistency in the team often more important than the 'correct' choice between type and interface?",
    modelAnswer:
      "For most object types, type and interface are functionally equivalent. " +
      "Differences (Declaration Merging, compiler performance) only affect edge cases. " +
      "Inconsistent style in the team creates unnecessary cognitive load during code review " +
      "and makes the code non-uniform. A clear team convention (whichever one) " +
      "reduces discussions and improves readability.",
    keyPoints: [
      "Functionally equivalent for most object types",
      "Consistency reduces cognitive load",
      "Team convention more important than technical nuances",
    ],
  },
];