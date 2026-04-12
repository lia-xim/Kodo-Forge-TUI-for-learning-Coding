/**
 * Lesson 03 — Pre-Test Questions: Type Annotations & Inference
 *
 * 3 questions per section, asked BEFORE reading.
 * Goal: 'Prime' the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section the question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: Explicit Annotations vs Inference ────────────────────────

  {
    sectionIndex: 1,
    question:
      "Does every variable in TypeScript need a type annotation?",
    code: "let name = 'Max';\nlet alter: number = 30;",
    options: [
      "Yes, otherwise everything is `any`",
      "No, TypeScript can often infer types on its own",
      "Only for functions, not for variables",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript has type inference: it derives the type from context. " +
      "`let name = 'Max'` is automatically recognized as `string`. " +
      "Explicit annotations are redundant here.",
  },
  {
    sectionIndex: 1,
    question:
      "Where do type annotations ALWAYS need to appear because TypeScript " +
      "cannot infer the type?",
    code: "function greet(name) {\n  return `Hallo ${name}`;\n}",
    options: [
      "For variables with an initial value",
      "For function parameters",
      "For `const` declarations",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Function parameters almost always need an annotation, because TS " +
      "doesn't know what the function will be called with. Without an annotation " +
      "the parameter is implicitly `any` (error in strict mode).",
  },
  {
    sectionIndex: 1,
    question:
      "When you write `const x: string = 'hello'` — " +
      "is the annotation `: string` necessary?",
    options: [
      "Yes, without the annotation x would be `any`",
      "No, TypeScript infers the type from the value",
      "Yes, it's required with `const`",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "The annotation is redundant. TypeScript automatically infers the type from `'hello'`. " +
      "With `const`, even the literal type " +
      '`"hello"` is inferred, which is more precise than `string`.',
  },

  // ─── Section 2: Widening (const vs let, Objects) ────────────────────────

  {
    sectionIndex: 2,
    question:
      "What is the type of `config.method` in this code?",
    code: 'const config = { method: "GET" };',
    options: [
      "`string` — the wide type",
      '`"GET"` — the exact value',
      '`"GET" | "POST"` — a union',
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Although `config` is const, properties are mutable " +
      '(you could write `config.method = "POST"`). Therefore ' +
      'TypeScript widens the type to `string`, not `"GET"`. ' +
      "This is called property widening.",
  },
  {
    sectionIndex: 2,
    question:
      "What keyword can prevent TypeScript from automatically widening types?",
    code: 'const status = "active" as ???;',
    options: [
      "`as const`",
      "`as literal`",
      "`as strict`",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "`as const` prevents widening entirely. All values retain " +
      "their literal type, arrays become readonly tuples, and " +
      "object properties become readonly.",
  },
  {
    sectionIndex: 2,
    question:
      "What is the type of an empty array `const items = []`?",
    options: [
      "`never[]` — empty array",
      "`unknown[]` — unknown content",
      "`any[]` — TypeScript doesn't know",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "An empty array without an annotation is inferred as `any[]`. " +
      "This is one of the few cases where inference is uncertain. " +
      "Therefore: always annotate empty arrays!",
  },

  // ─── Section 3: Contextual Typing & Control Flow ────────────────────────

  {
    sectionIndex: 3,
    question:
      "Why does `n` not need a type annotation here?",
    code: "const nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);",
    options: [
      "TypeScript infers the type from the array element",
      "Arrow functions always have type `any`",
      "Callback parameters are always `number`",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Contextual typing: TypeScript knows the type of `nums` (`number[]`) " +
      "and therefore knows that the .map() callback receives a `number`.",
  },
  {
    sectionIndex: 3,
    question:
      "If you store a callback in a variable first and then pass it — " +
      "does contextual typing still work?",
    code: 'const handler = (e) => console.log(e);\ndocument.addEventListener("click", handler);',
    options: [
      "Yes, TypeScript tracks the flow",
      "Only if the handler is defined as `const`",
      "No, the context is lost — `e` becomes `any`",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Contextual typing only works with DIRECT passing as an argument. " +
      "If the callback is stored in a variable first, " +
      "TypeScript has no context at the point of definition.",
  },
  {
    sectionIndex: 3,
    question:
      "What is the type of `value` inside the if block?",
    code: 'function f(value: string | number) {\n  if (typeof value === "string") {\n    // Here: what type?\n  }\n}',
    options: [
      "`string | number` — unchanged",
      "I don't know",
      "`any` — it becomes indeterminate inside conditions",
      "`string` — TypeScript narrows the type",
    ],
    correct: 3,
    briefExplanation:
      "Control flow analysis: TypeScript tracks the code flow and " +
      "narrows the type. After the typeof check, TS knows " +
      "that `value` is a `string`.",
  },

  // ─── Section 4: satisfies & Best Practices ──────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Is there a way to validate a value against a type " +
      "WITHOUT losing the inferred type?",
    code: "type Colors = Record<string, string>;\nconst theme: Colors = { primary: '#f00' };\n// theme.primary is now `string`, not `'#f00'`",
    options: [
      "No, annotation always overrides inference",
      "I don't know",
      "Yes, with `as const`",
      "Yes, with the `satisfies` operator",
    ],
    correct: 3,
    briefExplanation:
      "`satisfies` validates against the type but retains the specific " +
      "inference. `theme.primary` would then be `'#f00'` instead of `string`.",
  },
  {
    sectionIndex: 4,
    question:
      "Why does `Object.keys({ a: 1, b: 2 })` return type `string[]` " +
      "instead of `('a' | 'b')[]`?",
    options: [
      "That is a bug in TypeScript",
      "I don't know",
      "Because Object.keys() always returns strings",
      "Because objects could have more keys at runtime",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript is intentionally conservative. Through inheritance or " +
      "dynamic assignment, an object could have more keys than the type " +
      "describes. `('a' | 'b')[]` would be technically unsound.",
  },
  {
    sectionIndex: 4,
    question:
      "When should you explicitly annotate the return type of a function?",
    code: "export function parse(input: string) {\n  // complex logic with many return paths\n}",
    options: [
      "Always — inference is unreliable",
      "Never — inference is always correct",
      "For exported or complex functions",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "For exported and complex functions, an explicit return type is best practice. " +
      "It documents intent, provides better errors, and prevents accidental type changes.",
  },
];