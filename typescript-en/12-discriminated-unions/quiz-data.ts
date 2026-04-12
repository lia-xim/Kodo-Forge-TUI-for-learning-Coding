import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "12";
export const lessonTitle = "Discriminated Unions";

export const questions: QuizQuestion[] = [
  // --- Question 1: Basics ---
  {
    question: "What are the three ingredients of a Discriminated Union?",
    options: [
      "Interface, extends, implements",
      "Tag property with Literal Type, Union Type, Narrowing",
      "class, abstract, instanceof",
      "enum, switch, default",
    ],
    correct: 1,
    explanation:
      "A Discriminated Union requires: (1) a shared tag property with " +
      "different literal values per variant, (2) a Union Type, " +
      "and (3) narrowing by checking the discriminator.",
  },

  // --- Question 2: Discriminator Type ---
  {
    question: "Which value is NOT valid as a discriminator?",
    options: [
      '"circle" (String Literal)',
      "200 (Number Literal)",
      "true (Boolean Literal)",
      'string (general type)',
    ],
    correct: 3,
    explanation:
      "The discriminator must be a LITERAL type — a single, " +
      "concrete value. 'string' is too broad: TypeScript cannot " +
      "distinguish between variants with it. String/Number/Boolean " +
      "Literals all work.",
  },

  // --- Question 3: Narrowing ---
  {
    question: "What happens in the else-branch after `if (msg.kind === 'text')`?",
    code: 'type Message = { kind: "text"; content: string } | { kind: "image"; url: string };\nif (msg.kind === "text") { ... } else { ... }',
    options: [
      'msg has type { kind: "image"; url: string }',
      "msg has type Message",
      "msg has type never",
      "msg has type unknown",
    ],
    correct: 0,
    explanation:
      "TypeScript eliminates the 'text' variant in the else-branch. " +
      "Since only 'image' remains, msg is automatically the ImageMessage type. " +
      "That is narrowing by elimination — the same principle as in L11.",
  },

  // --- Question 4: assertNever ---
  {
    question: "When does assertNever(shape) in the default-branch show a compile error?",
    options: [
      "Always — assertNever always throws an error",
      "When ALL cases in the switch are handled",
      "When NOT all cases are handled",
      "Only with string discriminators",
    ],
    correct: 2,
    explanation:
      "assertNever expects the type 'never'. When all cases are handled, " +
      "the value in the default-branch is truly 'never' — no error. " +
      "If a case is missing, the value still has a concrete type and is " +
      "NOT assignable to 'never' — compile error!",
    code: "function assertNever(value: never): never {\n  throw new Error(`Unbehandelt: ${value}`);\n}",
  },

  // --- Question 5: Exhaustive Check ---
  {
    question: "What happens when you add a new type to the union and use assertNever?",
    options: [
      "Nothing — the new type is ignored",
      "Runtime error on the next call",
      "Compile error at every location with assertNever where the new type is not handled",
      "TypeScript automatically adds a case-branch",
    ],
    correct: 2,
    explanation:
      "That is the strength of the exhaustive check: Every switch with assertNever " +
      "in the default shows a compile error when a new type is not handled. " +
      "The compiler guides you to ALL locations that need to be updated.",
  },

  // --- Question 6: Option<T> ---
  {
    question: "What is the advantage of Option<T> over T | null?",
    options: [
      "Option<T> enforces checking both cases through the discriminator",
      "Option<T> is faster at runtime",
      "Option<T> uses less memory",
      "Option<T> works with generics, T | null does not",
    ],
    correct: 0,
    explanation:
      "Option<T> with the tag 'some'/'none' enforces an explicit check: " +
      "You cannot access value without first checking the tag. " +
      "With T | null you can forget the null check — the compiler only warns " +
      "with strictNullChecks.",
    code: 'type Option<T> = { tag: "some"; value: T } | { tag: "none" };',
  },

  // --- Question 7: Result<T, E> ---
  {
    question: "What is the main advantage of Result<T, E> over try/catch?",
    options: [
      "Result is faster",
      "The error type E is part of the function signature",
      "Result can be async",
      "try/catch does not work with Discriminated Unions",
    ],
    correct: 1,
    explanation:
      "With try/catch the error type is 'unknown' — the signature does not reveal " +
      "which errors can occur. With Result<T, E> the error type E is " +
      "explicit in the signature — the caller KNOWS what can go wrong " +
      "and MUST handle it.",
    code: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };",
  },

  // --- Question 8: Sum Type vs Product Type ---
  {
    question: "What is a Sum Type in TypeScript?",
    options: [
      "A Discriminated Union (OR-combination)",
      "An interface with many properties",
      "A tuple with fixed length",
      "A generic class",
    ],
    correct: 0,
    explanation:
      "Sum Type = OR-combination: Exactly ONE variant is active. " +
      "Product Type = AND-combination: ALL properties simultaneously. " +
      "An interface is a Product Type. A Discriminated Union is " +
      "a Sum Type. Together they form Algebraic Data Types (ADTs).",
  },

  // --- Question 9: Impossible States ---
  {
    question: 'What does "Make impossible states impossible" mean?',
    options: [
      "Make all variables readonly",
      "Model states so that invalid combinations are prevented by the type system",
      "Catch every error with try/catch",
      "Validate all inputs",
    ],
    correct: 1,
    explanation:
      "Instead of { isLoading: boolean; data: T | null; error: string | null } " +
      "(16 combinations, most of them invalid) one uses a " +
      "Discriminated Union with exactly the valid states. " +
      "The compiler then prevents nonsensical combinations.",
  },

  // --- Question 10: AsyncState ---
  {
    question: "How many valid states does AsyncState<T> have as a Discriminated Union?",
    code: 'type AsyncState<T> =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "error"; error: string }\n  | { status: "success"; data: T };',
    options: [
      "2 (loading/success)",
      "3 (loading/error/success)",
      "4 (idle/loading/error/success)",
      "Infinitely many",
    ],
    correct: 2,
    explanation:
      "Exactly 4 states — all meaningful. For comparison: A flat " +
      "structure with { isLoading: boolean; isError: boolean; data: T | null; " +
      "error: string | null } has 2^4 = 16 combinations, of which " +
      "most are invalid.",
  },

  // --- Question 11: Destructuring and Narrowing ---
  {
    question: "What happens when narrowing after destructuring the discriminator?",
    code: 'const { kind } = shape;\nif (kind === "circle") {\n  // shape.radius? \n}',
    options: [
      "shape is correctly narrowed to Circle",
      "Compile error at destructuring",
      "kind has type never",
      "TypeScript loses the connection — shape remains Shape",
    ],
    correct: 3,
    explanation:
      "With destructuring, the connection between the variable " +
      "'kind' and the original object 'shape' is lost. TypeScript cannot " +
      "narrow shape even when kind is checked. " +
      "Solution: Check shape.kind directly instead of destructuring.",
  },

  // --- Question 12: Redux Actions ---
  {
    question: "What is the discriminator in Redux/NgRx Action Types?",
    options: [
      'The property "action"',
      'The property "kind"',
      'The property "payload"',
      'The property "type"',
    ],
    correct: 3,
    explanation:
      "Redux/NgRx conventionally use 'type' as the discriminator " +
      "for actions. Every action has a unique type string " +
      "(e.g. 'ADD_TODO', 'SET_FILTER'). The payload is the " +
      "variant-specific data part.",
    code: 'type Action = { type: "INCREMENT" } | { type: "ADD"; payload: { amount: number } };',
  },

  // --- Question 13: Extract Utility ---
  {
    question: "What does Extract<Shape, { kind: 'circle' }> produce?",
    code: 'type Shape = { kind: "circle"; radius: number } | { kind: "rectangle"; width: number; height: number };',
    options: [
      "Shape (unchanged)",
      '{ kind: "circle"; radius: number }',
      '{ kind: "rectangle"; width: number; height: number }',
      "never",
    ],
    correct: 1,
    explanation:
      "Extract<T, U> pulls from a Union T all members that are " +
      "assignable to U. Extract<Shape, { kind: 'circle' }> " +
      "extracts the Circle variant. The opposite is " +
      "Exclude<Shape, { kind: 'circle' }> — that returns Rectangle.",
  },

  // --- Question 14: Tag Property Name ---
  {
    question: "What should the tag property be named?",
    options: [
      'It MUST be called "type"',
      'It MUST be called "kind"',
      "The name is freely choosable — consistency is important",
      'It MUST be called "__tag"',
    ],
    correct: 2,
    explanation:
      "TypeScript does not prescribe any specific name. Common " +
      "conventions are 'type', 'kind', 'tag', 'status'. What matters " +
      "is consistency within the project. Redux uses 'type', " +
      "many libraries use 'kind'.",
  },

  // --- Question 15: Origin ---
  {
    question: "Which programming tradition do Discriminated Unions originate from?",
    options: [
      "Functional programming (Haskell, ML, Rust)",
      "Procedural programming (C, Pascal)",
      "Object-oriented programming (Java, C#)",
      "Logic programming (Prolog)",
    ],
    correct: 0,
    explanation:
      "Discriminated Unions (Sum Types / Algebraic Data Types) come " +
      "from ML (1973) and were perfected in Haskell. Rust made them " +
      "mainstream. TypeScript needs no new syntax — " +
      "Union Types + Literal Types + Control Flow Analysis are enough.",
  },

  // ─── Additional Question Formats ────────────────────────────────────────────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question: "What is the shared property with literal values called that distinguishes the variants of a Discriminated Union?",
    expectedAnswer: "Discriminator",
    acceptableAnswers: ["Discriminator", "Tag", "Tag property", "Discriminant"],
    explanation:
      "The shared property is called the discriminator (or tag). " +
      "It must have a literal type (e.g. 'circle', 'rectangle'), " +
      "so that TypeScript can distinguish and narrow the variants.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question: "Which utility type is used to extract a specific variant from a Discriminated Union?",
    expectedAnswer: "Extract",
    acceptableAnswers: ["Extract", "Extract<T, U>"],
    explanation:
      "Extract<Union, { kind: 'circle' }> pulls out exactly the variant " +
      "that matches the pattern. The opposite is Exclude, which " +
      "removes the matching variants.",
  },

  // --- Question 18: Short-Answer ---
  {
    type: "short-answer",
    question: "What is the principle called of modeling states such that invalid combinations are not possible in the first place?",
    expectedAnswer: "Make impossible states impossible",
    acceptableAnswers: ["Make impossible states impossible", "impossible states impossible", "Impossible States"],
    explanation:
      "The principle 'Make impossible states impossible' means: " +
      "Instead of combining boolean flags (isLoading + isError + data) " +
      "one models only the valid states as a Discriminated Union. " +
      "The compiler then prevents nonsensical combinations.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number };\n\nfunction area(s: Shape): string {\n  switch (s.kind) {\n    case 'circle': return 'Kreis';\n    case 'rect': return 'Rechteck';\n  }\n}\n\nconsole.log(area({ kind: 'circle', r: 5 }));",
    expectedAnswer: "Kreis",
    acceptableAnswers: ["Kreis", "'Kreis'", "\"Kreis\""],
    explanation:
      "s.kind is 'circle', so the first case-branch is executed " +
      "and 'Kreis' is returned. TypeScript automatically narrows s in the case-branch " +
      "to the matching variant.",
  },

  // --- Question 20: Predict-Output ---
  {
    type: "predict-output",
    question: "How many valid state combinations does this flat structure have? Enter the number.",
    code: "interface FlatState {\n  isLoading: boolean;  // true/false\n  isError: boolean;    // true/false\n  data: string | null; // string oder null\n}\n// Wie viele Kombinationen von isLoading × isError × data gibt es?",
    expectedAnswer: "8",
    acceptableAnswers: ["8", "2*2*2=8", "2^3"],
    explanation:
      "2 (isLoading) × 2 (isError) × 2 (data: string or null) = 8 combinations. " +
      "Most of them are nonsensical (e.g. isLoading=true AND isError=true AND data='hi'). " +
      "A Discriminated Union would only allow the 3-4 meaningful states.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question: "Why is the connection between discriminator and object lost when the discriminator is destructured? And what is the solution?",
    modelAnswer:
      "With const { kind } = shape, kind becomes an independent variable. " +
      "TypeScript can no longer trace the separate variable kind back to the original object shape. " +
      "A check on kind therefore narrows ONLY kind, not shape. " +
      "The solution: Check shape.kind directly instead of destructuring.",
    keyPoints: [
      "Destructuring separates the variable from the object",
      "TypeScript cannot trace the connection back",
      "Solution: Check shape.kind directly",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Additional explanations for each question: Why the correct answer
// is correct and which misconception occurs most frequently.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "The three ingredients are indispensable: Without a tag property no narrowing, " +
      "without a union no case distinction, without narrowing no access to " +
      "variant-specific properties.",
    commonMistake:
      "Many think of class/extends/instanceof. That is OOP polymorphism — " +
      "not the same as Discriminated Unions.",
  },
  1: {
    whyCorrect:
      "TypeScript needs CONCRETE values to distinguish variants. " +
      "'string' is too broad — TS cannot know which variant is meant.",
    commonMistake:
      "Some use 'type: string' and wonder why narrowing does not work. " +
      "The discriminator must be literal.",
  },
  2: {
    whyCorrect:
      "Control Flow Analysis eliminates the 'text' variant in the else-branch. " +
      "What remains is automatically the remaining type.",
    commonMistake:
      "Many expect msg to still be Message in the else-branch. " +
      "TypeScript is more precise — it narrows to the remaining variants.",
  },
  3: {
    whyCorrect:
      "assertNever expects 'never'. If a case is missing, the value " +
      "in the default still has a concrete type — not 'never'. " +
      "Hence the compile error.",
    commonMistake:
      "Some think assertNever ALWAYS shows an error. It only shows " +
      "an error when not all cases are handled.",
  },
  4: {
    whyCorrect:
      "The exhaustive check is a safety net for the entire codebase. " +
      "Every switch with assertNever is checked by the compiler when the union is extended.",
    commonMistake:
      "Many believe you would have to manually search all switch locations. " +
      "assertNever does this automatically — the compiler finds them all.",
  },
  5: {
    whyCorrect:
      "Option<T> with discriminator enforces the check. " +
      "You MUST check the tag before accessing value.",
    commonMistake:
      "Some consider Option superfluous because T | null exists. " +
      "The difference: Option enforces the check structurally.",
  },
  6: {
    whyCorrect:
      "The error type in the signature makes error handling a first-class concept. " +
      "The caller sees WHICH errors can occur.",
    commonMistake:
      "Many think try/catch is sufficient. But the error type in catch " +
      "is 'unknown' — you don't know what went wrong.",
  },
  7: {
    whyCorrect:
      "Sum Type = OR: Exactly one variant is active. " +
      "Product Type = AND: All properties are present simultaneously. " +
      "The names come from the cardinality of possible values.",
    commonMistake:
      "Sum and Product are confused. Mnemonic: " +
      "Union = Addition (Sum), Interface = Multiplication (Product).",
  },
  8: {
    whyCorrect:
      "Discriminated Unions eliminate nonsensical state combinations. " +
      "The type REPRESENTS only valid states.",
    commonMistake:
      "Some confuse input validation with type safety. " +
      "Validation is runtime, Discriminated Unions are compile-time.",
  },
  9: {
    whyCorrect:
      "4 explicit variants instead of 16 implicit combinations. " +
      "Each variant has exactly the properties that make sense.",
    commonMistake:
      "Some only count loading/error/success and forget 'idle'. " +
      "The initial state before the first load is important.",
  },
  10: {
    whyCorrect:
      "Destructuring separates the value from the object. TypeScript cannot " +
      "trace the separate variable back to the object.",
    commonMistake:
      "Many destructure out of habit and then wonder why narrowing does not work.",
  },
  11: {
    whyCorrect:
      "'type' is the convention in Redux/NgRx — every action has " +
      "a unique type string as discriminator.",
    commonMistake:
      "Some confuse 'type' (discriminator) with 'payload' (data). " +
      "payload is the variant-specific part, not the discriminator.",
  },
  12: {
    whyCorrect:
      "Extract<T, U> filters the Union T to members that match U. " +
      "Here: Only the variant with kind='circle' remains.",
    commonMistake:
      "Extract is confused with Exclude. " +
      "Extract = keep what matches, Exclude = remove what matches.",
  },
  13: {
    whyCorrect:
      "TypeScript does not prescribe any name. Consistency within the project " +
      "is more important than the specific name.",
    commonMistake:
      "Some believe only 'type' works as a discriminator. " +
      "Any name works — as long as the values are Literal Types.",
  },
  14: {
    whyCorrect:
      "ML (1973) introduced algebraic data types. Haskell, Rust " +
      "and TypeScript adopted the concept.",
    commonMistake:
      "Some confuse Discriminated Unions with OOP inheritance. " +
      "Both solve similar problems, but with completely different approaches.",
  },
};