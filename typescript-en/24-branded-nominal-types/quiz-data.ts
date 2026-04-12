// quiz-data.ts — L24: Branded/Nominal Types
// Quiz with 15 questions, correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export interface MCQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number; // 0-based index of the correct answer
  explanation: string;
  elaboratedFeedback: {
    whyCorrect: string;
    commonMistake: string;
  };
}

export const quizData: (MCQuizQuestion | QuizQuestion)[] = [
  // correct: 0 (Question 1, 2, 3, 4)
  {
    id: 1,
    question: "What is the main problem with `type UserId = string` in TypeScript?",
    options: [
      "It provides no type safety — `UserId` and `string` are structurally identical",
      "It causes runtime overhead through additional object allocation at runtime",
      "TypeScript does not allow type aliases for primitive types like string or number",
      "It only works with `strict: true` in tsconfig.json and is otherwise invalid"
    ],
    correct: 0,
    explanation: "Type aliases are just renaming, not a new type. TypeScript checks structure — and `UserId = string` is structurally identical to `string`.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript's Structural Typing means: two types are compatible when they have the same structure. `type UserId = string` does not create a new type — it just renames `string`. Any `string` can thus be used as `UserId`.",
      commonMistake: "Many think type aliases create Nominal Typing like in Java. But TypeScript checks structure, not names. `type UserId = string` is helpful for documentation, but offers no type safety."
    }
  },
  {
    id: 2,
    question: "How is a branded type defined in TypeScript?",
    options: [
      "`type UserId = string & { readonly __brand: 'UserId' }`",
      "`type UserId = class UserId extends String {}` with class inheritance",
      "`type UserId = Nominal<string, 'UserId'>` with built-in Nominal keyword",
      "`type UserId = string implements 'UserId'` with interface implementation"
    ],
    correct: 0,
    explanation: "Branded types use intersection with a unique property. The `readonly __brand` property makes the types structurally distinct.",
    elaboratedFeedback: {
      whyCorrect: "The intersection operator `&` combines types. `string & { readonly __brand: 'UserId' }` creates a type that has both `string` properties and the `__brand` property. A normal `string` has no `__brand` → compile error on confusion.",
      commonMistake: "TypeScript has no built-in `Nominal<>` or `Opaque<>`. The brand technique with `& { readonly __brand: ... }` is the standard workaround for Nominal Typing."
    }
  },
  {
    id: 3,
    question: "What is a Smart Constructor?",
    options: [
      "A function that validates raw input and then assigns a branded type",
      "A TypeScript decorator that modifies class constructors",
      "A TypeScript 5.0 feature for type-safe factory methods",
      "A design pattern that only works with classes, not with type aliases"
    ],
    correct: 0,
    explanation: "Smart Constructors centralize `as` casts and can include validation. They are the only allowed place where `as Brand` is used.",
    elaboratedFeedback: {
      whyCorrect: "A Smart Constructor combines validation and type assignment: `function createEmail(raw: string): Email { validate(raw); return raw as Email; }`. The `as` cast is safe here because it happens after validation — and it is centralized, not scattered throughout the code.",
      commonMistake: "Smart Constructor is not a TypeScript keyword or feature, but a design pattern. It is a naming convention and an architectural decision."
    }
  },
  {
    id: 4,
    question: "Why does `UserId = string & { __brand: 'UserId' }` have zero runtime overhead?",
    options: [
      "The `__brand` property is only a compile-time construct and is removed after type erasure",
      "TypeScript internally optimizes branded types to primitive JavaScript types without additional overhead",
      "The `__brand` property is declared as `readonly` and therefore not stored in memory",
      "JavaScript was modified so that brand properties are automatically ignored by the interpreter"
    ],
    correct: 0,
    explanation: "All TypeScript type information (including brand properties) is removed during compilation (Type Erasure). A `UserId` value is a normal JavaScript string at runtime.",
    elaboratedFeedback: {
      whyCorrect: "Type Erasure (Lesson 02) means: TypeScript types only exist at compile time. `const id: UserId = createUserId('user-123')` compiles to `const id = 'user-123'`. The `__brand` property never exists at runtime.",
      commonMistake: "Some think the `__brand` property is stored as a real JavaScript object property. That is wrong — it is a purely type-theoretical construct, known only to the TypeScript compiler."
    }
  },

  // correct: 1 (Question 5, 6, 7, 8)
  {
    id: 5,
    question: "What is the difference between Structural Typing and Nominal Typing?",
    options: [
      "Structural Typing checks names, Nominal Typing checks structure",
      "Structural Typing checks structure (fields/methods), Nominal Typing checks names",
      "Structural Typing is only possible in JavaScript, Nominal Typing in TypeScript",
      "There is no practical difference — both check types at compile time"
    ],
    correct: 1,
    explanation: "TypeScript uses Structural Typing: types are compatible when their structure matches. Java/C# use Nominal Typing: types must be explicitly declared.",
    elaboratedFeedback: {
      whyCorrect: "In TypeScript: if type A has all properties of type B, A is compatible with B — regardless of what the types are called. That is Structural Typing. In Java: `class UserId` and `class OrderId` are different types, even if both only contain `String` — that is Nominal Typing.",
      commonMistake: "A common confusion: 'Structural' does NOT mean 'more flexible' or 'weaker'. Structural Typing can be very strict. It only means: the check is based on the shape (fields, methods), not the name."
    }
  },
  {
    id: 6,
    question: "Which TypeScript version has built-in Nominal Typing?",
    options: [
      "TypeScript 5.0 with the new `nominal` keyword for nominal types",
      "None — TypeScript has no built-in Nominal Typing; branded types are a workaround",
      "TypeScript 4.9 with the `satisfies` operator that acts as a Nominal Type Guard",
      "TypeScript 5.3 with the `opaque type` feature adopted from Flow"
    ],
    correct: 1,
    explanation: "TypeScript has no native Nominal Typing to this day. The brand technique is a community workaround that simulates Nominal Typing in the Structural Type System.",
    elaboratedFeedback: {
      whyCorrect: "Nominal Typing was discussed multiple times in TypeScript GitHub issues (e.g. #202), but never built in. The main reason: compatibility with JavaScript and the existing Structural Typing system. Branded types are the standardized workaround solution.",
      commonMistake: "The `satisfies` operator (TS 4.9) has nothing to do with Nominal Typing — it checks whether an expression matches a type without 'widening' the type. The `opaque type` feature does not exist."
    }
  },
  {
    id: 7,
    question: "Given: `type Meter = number & { __brand: 'Meter' }; type Second = number & { __brand: 'Second' }`. Which operation will TypeScript reject?",
    options: [
      "Using a `Meter` value as a template literal: `` `${distance} m` ``",
      "Passing a `Meter` value to a function that expects `Second`",
      "Adding a `Meter` value with `+` to a `number`",
      "Formatting a `Meter` value with `.toFixed(2)`"
    ],
    correct: 1,
    explanation: "TypeScript rejects different brands: `Meter.__brand` is `'Meter'`, `Second.__brand` is `'Second'`. The literals are different → compile error.",
    elaboratedFeedback: {
      whyCorrect: "Branded Types behave arithmetically and string-wise like the base types (number/string). Template literals, arithmetic, and string methods all work. But: different brands are not compatible — `Meter` to a `Second` function → COMPILE-ERROR.",
      commonMistake: "One might think that brands block all operations. No: only type assignability is restricted. Arithmetic (+ - * /) and string operations work as normal."
    }
  },
  {
    id: 8,
    question: "What does `type Newtype<A, Brand> = A & { readonly [phantom]: Brand }` do where `phantom: unique symbol`?",
    options: [
      "It creates a wrapper type that places a JavaScript Proxy around the value at runtime",
      "It creates a type that is structurally distinct from all other Newtypes, because `unique symbol` as a property key is unique",
      "It adds a hidden `phantom` property to the value at runtime that is not enumerable",
      "It is syntactic sugar for `class Newtype<A, Brand> extends A {}` with generic inheritance"
    ],
    correct: 1,
    explanation: "`unique symbol` creates a type that is unique for each `declare const` declaration. As a computed property key, it makes the brand property inaccessible to external modules.",
    elaboratedFeedback: {
      whyCorrect: "In TypeScript, `declare const x: unique symbol` is an ambient declaration — not a runtime value. Each `unique symbol` declaration creates its own type. As a `[phantom]: Brand` computed key, the property is invisible to external modules (they don't know the symbol), providing maximum encapsulation.",
      commonMistake: "Many think symbols create runtime overhead. No: `declare const` with `unique symbol` only exists at compile time (Type Erasure!). At runtime, the value is again a normal string/number."
    }
  },

  // correct: 2 (Question 9, 10, 11, 12)
  {
    id: 9,
    question: "Which of the following statements about `type UserId = string & { __brand: 'UserId' }` is correct?",
    options: [
      "A `UserId` value CANNOT be used as `string` (strict isolation)",
      "A normal `string` value CAN be passed as `UserId`",
      "A `UserId` value CAN be used as `string`, but a `string` CANNOT be used as `UserId`",
      "Both directions (`string → UserId` and `UserId → string`) are allowed"
    ],
    correct: 2,
    explanation: "`UserId` is a subtype of `string` (it has all string properties + more). Subtypes can be used wherever supertypes are expected — but not vice versa.",
    elaboratedFeedback: {
      whyCorrect: "Subtype relationship: `UserId = string & { __brand: 'UserId' }` has more than `string` alone. Therefore `UserId` is a subtype of `string` → can be used wherever `string` is expected (upcasting). But `string` has no `__brand` → cannot be used as `UserId` (downcasting forbidden).",
      commonMistake: "Brands do not fully isolate from the base. A `UserId` can be passed as `string` — that is intentional design (template literals, API calls, etc. should continue to work)."
    }
  },
  {
    id: 10,
    question: "What are `Brand Hierarchies` with branded types?",
    options: [
      "Inheritance chains of brand classes like `class VerifiedEmail extends Email`",
      "TypeScript interfaces that define brands in a sequence",
      "Intersection types like `VerifiedEmail = Email & { __verified: true }` where one brand is a subtype of another",
      "An external library that implements Nominal Typing for TypeScript"
    ],
    correct: 2,
    explanation: "Brand hierarchies use intersection: `VerifiedEmail = Email & { __verified: true }` is a subtype of `Email`. Wherever `Email` is expected, `VerifiedEmail` works.",
    elaboratedFeedback: {
      whyCorrect: "If `VerifiedEmail = Email & { __verified: true }`, then `VerifiedEmail` has all properties of `Email` plus `__verified`. Therefore `VerifiedEmail` is a subtype of `Email` — it can be used anywhere as `Email`. The reverse is not true: an ordinary `Email` is missing `__verified`.",
      commonMistake: "Brand hierarchies have nothing to do with class inheritance. They are type-level subtype relationships through intersection — compile-time only, no runtime code."
    }
  },
  {
    id: 11,
    question: "Why should monetary amounts be modeled as cents (integer) instead of euros (decimal)?",
    options: [
      "Because TypeScript does not support decimal numbers as Branded Types",
      "Because cents as a `number` brand are simpler to define than decimal numbers",
      "Because JavaScript stores decimal numbers with floating-point errors (0.1 + 0.2 ≠ 0.3)",
      "Because cents are more international and no currency conversion is needed"
    ],
    correct: 2,
    explanation: "JavaScript uses IEEE 754 floating-point for all numbers. `0.1 + 0.2` yields `0.30000000000000004`. Integer cents do not have this problem.",
    elaboratedFeedback: {
      whyCorrect: "Floating-point arithmetic is inherently imprecise for decimal numbers in JavaScript. `0.1 + 0.2 === 0.3` is `false` in JavaScript! Monetary amounts must be exact → integer cents. `1999` cents = `19.99€` — no rounding errors.",
      commonMistake: "Many developers ignore floating-point errors and calculate directly with euro amounts. This seemingly works for simple cases, but leads to cent rounding errors with taxes, discounts, and totals."
    }
  },
  {
    id: 12,
    question: "What is the recommended architectural strategy for Branded Types in Angular/React projects?",
    options: [
      "Use brands everywhere — in every component, every service, every hook",
      "Use brands only in tests, use plain strings/numbers in production code",
      "Assign brands at the edge of the application (services/mappers); work internally with branded types",
      "Brands completely replace validation logic — no further error handling needed"
    ],
    correct: 2,
    explanation: "Anti-Corruption Layer principle: validate external data (API) at the entry point and assign brand. Internal business logic works only with typed brands.",
    elaboratedFeedback: {
      whyCorrect: "The Anti-Corruption Layer (ACL) is the right architectural pattern: convert external data (HTTP responses, route parameters) at the edge (string → UserId via createUserId()). Services/repositories receive and return branded types. Components work with already-typed entities.",
      commonMistake: "Using brands everywhere (including template literals, local variables) leads to over-engineering with constant `as` casts. The goal is: more type safety at system boundaries, not more casts within the business logic."
    }
  },

  // correct: 3 (Question 13, 14, 15)
  {
    id: 13,
    question: "What kind of pattern is `type Id<E extends string> = string & { readonly __idType: E }`?",
    options: [
      "A recursive type that recursively expands E and references itself",
      "A mapped type that transforms all string literals in E into separate ID types",
      "A generic utility function for ID conversion between different systems",
      "A generic branded type that allows ID types to be distinguished by type parameter"
    ],
    correct: 3,
    explanation: "`Id<E>` generates different ID types per parameter. `Id<'User'>` and `Id<'Order'>` have `__idType: 'User'` and `'Order'` respectively — structurally distinct, therefore not compatible.",
    elaboratedFeedback: {
      whyCorrect: "The generic `Id<E extends string>` type creates its own type for each parameter value. `Id<'User'>` has `{ __idType: 'User' }`, `Id<'Order'>` has `{ __idType: 'Order' }`. These literal types are different → TypeScript recognizes them as incompatible. More elegant than writing separate branded types for each entity.",
      commonMistake: "One might think generic types are harder to understand than concrete ones. On the contrary: `Id<'User'>` is self-documenting — the name contains the entity. And the repository interface `Repository<T, TId>` becomes much cleaner with this pattern."
    }
  },
  {
    id: 14,
    question: "When should you NOT use Branded Types?",
    options: [
      "For API keys and session tokens — these are too security-critical for simple brands",
      "For database entities — brands don't fit the Repository Pattern and complicate queries",
      "For currency amounts — decimal numbers cannot be modeled as Branded Types",
      "For local calculations with 2-3 variables — the complexity overhead is not worth it"
    ],
    correct: 3,
    explanation: "YAGNI: Brands add complexity. For local calculations (2-3 variables, clearly named) the abstraction is not worth it — no confusions happen there.",
    elaboratedFeedback: {
      whyCorrect: "Brands are most valuable when: (1) types can be confused, (2) the value propagates through APIs, (3) security criticality exists. For local calculations (e.g. `const width = 800; const height = 600; const area = width * height`) `Width` and `Height` as brands would be over-engineering — nobody confuses them in 5 lines.",
      commonMistake: "Many developers brand everything with the motto 'more type safety = better'. But brands also mean: more `as` casts, more boilerplate, steeper learning curve. The costs must be justified by the benefits."
    }
  },
  {
    id: 15,
    question: "Which statement about the Mars Climate Orbiter accident (1999) and TypeScript brands is correct?",
    options: [
      "Brands would have prevented the bug, because Mars mission software is written in TypeScript",
      "Brands would not have prevented the bug — unit errors only arise from incorrect constants",
      "Brands would have prevented the bug through compatibility checking at runtime",
      "Brands would have caught the bug at compile time, because `Pound_Force_Seconds` ≠ `Newton_Seconds`"
    ],
    correct: 3,
    explanation: "With `type PoundForceSeconds = number & { __unit: 'PoundForceSeconds' }`, TypeScript would have produced a compile-time error when `Newton_Seconds` was passed.",
    elaboratedFeedback: {
      whyCorrect: "The problem: one team calculated thrust in pound-force·seconds, the other expected Newton·seconds. With branded types: `function applyThrust(thrust: NewtonSeconds): void`. Passing `PoundForceSeconds` → COMPILE-ERROR. The bug would have been visible in the editor, not in Mars orbit.",
      commonMistake: "Of course, the NASA mission was not written in TypeScript. But the principle — typing units — is directly applicable to TypeScript. This shows: Branded Types solve a class of real engineering problems, not just academic ones."
    }
  },

  // ─── New question formats (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the design pattern where a function validates raw input " +
      "and then assigns a branded type (e.g. createEmail)?",
    expectedAnswer: "Smart Constructor",
    acceptableAnswers: [
      "Smart Constructor", "smart constructor", "Smart-Constructor",
      "SmartConstructor", "Smart Constructor Pattern",
    ],
    explanation:
      "A Smart Constructor centralizes the 'as' cast in a single place. " +
      "It validates the input and returns the Branded Type on success. " +
      "This ensures the cast only happens after validation.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which type system model does TypeScript use: Structural Typing or Nominal Typing?",
    expectedAnswer: "Structural Typing",
    acceptableAnswers: [
      "Structural Typing", "structural typing", "Structure-based Typing",
      "structure-based typing", "Structural", "structural",
    ],
    explanation:
      "TypeScript uses Structural Typing: two types are compatible when " +
      "their structure matches, regardless of name. Branded Types " +
      "are a workaround to simulate Nominal-Typing-like behavior.",
  },

  // --- Question 18: Predict-Output ---
  {
    type: "predict-output",
    question: "Does this code compile?",
    code:
      "type Brand<T, B> = T & { readonly __brand: B };\n" +
      "type EUR = Brand<number, 'EUR'>;\n" +
      "type USD = Brand<number, 'USD'>;\n" +
      "const price: EUR = 10 as EUR;\n" +
      "const converted: USD = price;",
    expectedAnswer: "No",
    acceptableAnswers: [
      "No", "no", "Error", "Compile Error", "Compile-Error",
    ],
    explanation:
      "EUR and USD are incompatible Branded Types. EUR has __brand: 'EUR', " +
      "USD has __brand: 'USD'. The string literals are different, " +
      "so the assignment is a compile error.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Does this code compile?",
    code:
      "type UserId = string & { readonly __brand: 'UserId' };\n" +
      "function greet(name: string): void { console.log('Hi ' + name); }\n" +
      "const id = 'user-42' as UserId;\n" +
      "greet(id);",
    expectedAnswer: "Yes",
    acceptableAnswers: ["Yes", "yes", "True", "true", "Compiles"],
    explanation:
      "UserId is a subtype of string (it has all string properties plus __brand). " +
      "Subtypes can be used wherever supertypes are expected. " +
      "A UserId value can therefore be passed as string — but not vice versa.",
  },

  // --- Question 20: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the architectural principle where external data is validated " +
      "at the edge of the application and converted into branded types?",
    expectedAnswer: "Anti-Corruption Layer",
    acceptableAnswers: [
      "Anti-Corruption Layer", "anti-corruption layer", "ACL",
      "Anti Corruption Layer", "Anticorruption Layer",
    ],
    explanation:
      "The Anti-Corruption Layer principle states: external data (API responses, " +
      "route parameters) is validated at the entry point and converted into branded types. " +
      "Internally, the business logic works only with typed brands.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why are Branded Types necessary even though TypeScript has a structural " +
      "type system? Explain using a concrete example " +
      "(e.g. UserId vs. OrderId) what problem they solve.",
    modelAnswer:
      "In TypeScript's Structural Typing, 'type UserId = string' and " +
      "'type OrderId = string' are identical — a UserId can accidentally " +
      "be used as an OrderId without a compile error. Branded Types add " +
      "an invisible __brand property that makes the types structurally " +
      "distinct. This way the compiler detects confusions at compile time.",
    keyPoints: [
      "Structural Typing makes type aliases interchangeable",
      "Brands create structural distinctness",
      "Confusions are detected at compile time",
      "Zero runtime overhead through Type Erasure",
    ],
  },
];