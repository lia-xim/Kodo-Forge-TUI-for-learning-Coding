/**
 * Lesson 10 -- Pre-Test Questions: Review Challenge — Phase 1
 *
 * 10 questions covering ALL Phase 1 knowledge.
 * One question per lesson (L01-L09) + one integration question.
 *
 * These questions should be asked BEFORE working through the challenges,
 * to assess the current knowledge level.
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
  // ═══ L01: Setup ═══════════════════════════════════════════════════════════
  {
    sectionIndex: 1,
    question:
      "What happens when you start a TypeScript project WITHOUT 'strict: true'?",
    options: [
      "TypeScript does not work — strict is required",
      "Many error types go undetected (null access, implicit any, etc.)",
      "There is no difference at runtime",
      "Only execution speed is slower",
    ],
    correct: 1,
    briefExplanation:
      "Without strict: true, TypeScript overlooks many potential errors. " +
      "Parameters without a type silently become 'any', null/undefined are " +
      "not checked, and much more. Always use strict: true!",
  },

  // ═══ L02: Primitive Types ═════════════════════════════════════════════════
  {
    sectionIndex: 2,
    question: "What is the difference between 'any' and 'unknown'?",
    code: `const a: any = getData();
a.whatever(); // ???

const b: unknown = getData();
b.whatever(); // ???`,
    options: [
      "No difference — both accept everything",
      "any disables the compiler, unknown enforces narrowing before use",
      "unknown is faster than any",
      "any only exists in JavaScript, unknown only in TypeScript",
    ],
    correct: 1,
    briefExplanation:
      "any = compiler looks away (a.whatever() compiles). " +
      "unknown = compiler enforces a check (b.whatever() is an error). " +
      "unknown is the type-safe alternative to any.",
  },

  // ═══ L03: Annotations & Inference ═════════════════════════════════════════
  {
    sectionIndex: 3,
    question: "When should you NOT write an explicit type annotation?",
    code: `// A: const name: string = "Max";
// B: function greet(name): string { return "Hi " + name; }
// C: const nums: number[] = [1, 2, 3];
// D: function getUser(): User { return { ... }; }`,
    options: [
      "A and C — TypeScript correctly infers the type on initialization",
      "B — parameters are always inferred",
      "D — return types are unnecessary",
      "Nowhere — always annotating is best practice",
    ],
    correct: 0,
    briefExplanation:
      "For A (const name = 'Max') and C (const nums = [1, 2, 3]) TypeScript " +
      "infers the correct type. The annotation is redundant. B NEEDS an annotation " +
      "(parameters), D is best practice for public APIs.",
  },

  // ═══ L04: Arrays & Tuples ═════════════════════════════════════════════════
  {
    sectionIndex: 4,
    question: "What is the type of 'entry'?",
    code: `const data: [string, number, boolean] = ["Max", 30, true];
const entry = data[1];`,
    options: [
      "string | number | boolean",
      "number",
      "any",
      "unknown",
    ],
    correct: 1,
    briefExplanation:
      "With tuples, TypeScript knows the type at each position. data[1] is " +
      "the second element: number. With a regular array (string | number | boolean)[] " +
      "the access would yield string | number | boolean.",
  },

  // ═══ L05: Objects & Interfaces ════════════════════════════════════════════
  {
    sectionIndex: 5,
    question:
      "Why does the assignment compile through a variable, but not as a literal?",
    code: `interface Point { x: number; y: number; }

// Error:
const p1: Point = { x: 1, y: 2, z: 3 };

// No error:
const temp = { x: 1, y: 2, z: 3 };
const p2: Point = temp;`,
    options: [
      "Excess Property Check only applies to fresh object literals, not variables",
      "p2 is trimmed to Point at runtime",
      "const variables disable the check",
      "temp has type 'any'",
    ],
    correct: 0,
    briefExplanation:
      "The Excess Property Check is a special mechanism that ONLY applies to " +
      "directly written object literals. For variables, only Structural Typing applies: " +
      "'Does temp have x and y? Yes → it fits.'",
  },

  // ═══ L06: Functions ═══════════════════════════════════════════════════════
  {
    sectionIndex: 6,
    question: "What is the advantage of Function Overloads over Union Types?",
    code: `// Without overload:
function parseA(input: string | string[]): number | number[] { ... }

// With overload:
function parseB(input: string): number;
function parseB(input: string[]): number[];
function parseB(input: string | string[]): number | number[] { ... }

const result = parseB("42"); // What type does result have?`,
    options: [
      "Overloads give more precise return types: result is 'number', not 'number | number[]'",
      "Overloads are faster at runtime",
      "Overloads allow more parameter types",
      "No advantage — it is just syntactic sugar",
    ],
    correct: 0,
    briefExplanation:
      "The main advantage: TypeScript picks the matching overload based on the " +
      "arguments and returns the EXACT return type. Without overloads, " +
      "the caller would have to narrow manually.",
  },

  // ═══ L07: Union & Intersection ════════════════════════════════════════════
  {
    sectionIndex: 7,
    question:
      "What happens when two interfaces with the same property but different types are intersected?",
    code: `interface A { value: string; }
interface B { value: number; }
type C = A & B;

const c: C = { value: ??? };`,
    options: [
      "Compile error at the definition of C",
      "value becomes type string | number",
      "value becomes type string & number = never — no value possible",
      "value becomes type any",
    ],
    correct: 2,
    briefExplanation:
      "Intersection combines: value must be string AND number. " +
      "string & number = never. The type C exists, but no value can satisfy it. " +
      "The error only appears when creating an object.",
  },

  // ═══ L08: Type Aliases vs Interfaces ══════════════════════════════════════
  {
    sectionIndex: 8,
    question: "Which feature is EXCLUSIVE to 'interface'?",
    options: [
      "Optional Properties",
      "Readonly Properties",
      "Declaration Merging (reopening and extending the same interface)",
      "Extending other types",
    ],
    correct: 2,
    briefExplanation:
      "Declaration Merging is unique to interfaces. You can declare the same " +
      "interface multiple times and the properties are merged together. " +
      "With 'type' you get a 'Duplicate identifier' error.",
  },

  // ═══ L09: Enums & Literal Types ══════════════════════════════════════════
  {
    sectionIndex: 9,
    question: "What does 'as const' do to this object?",
    code: `const config = {
  api: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;`,
    options: [
      "Nothing — objects are already const through 'const'",
      "Makes the object immutable at runtime (like Object.freeze)",
      "Converts the object to a string",
      "Makes all properties readonly and all values Literal Types",
    ],
    correct: 3,
    briefExplanation:
      "as const makes the entire object 'deep readonly' and converts all " +
      "values to Literal Types: api becomes '\"https://api.example.com\"' instead of string, " +
      "timeout becomes '5000' instead of number, etc. It is a COMPILE-TIME feature.",
  },

  // ═══ Integration ══════════════════════════════════════════════════════════
  {
    sectionIndex: 10,
    question:
      "Which combination of concepts models an API response MOST SAFELY?",
    options: [
      "An interface with optional fields (data?, error?, loading?)",
      "any + runtime checks",
      "Generics (not covered until Phase 2)",
      "Discriminated Union + Literal Types + Exhaustive Switch",
    ],
    correct: 3,
    briefExplanation:
      "Discriminated Unions with Literal Types and exhaustive switches ensure " +
      "that 1) only valid states exist, 2) each state carries the right data, " +
      "and 3) all cases are handled. " +
      "This is the most powerful pattern from Phase 1.",
  },
];