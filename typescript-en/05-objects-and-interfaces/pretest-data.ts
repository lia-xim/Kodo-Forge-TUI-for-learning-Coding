/**
 * Lesson 05 -- Pre-Test Questions: Objects & Interfaces
 *
 * 3 questions per section, asked BEFORE reading the section.
 * Goal: activate prior knowledge, spark curiosity, uncover misconceptions.
 *
 * Sections:
 *   1 — Object Type Basics
 *   2 — Interfaces & Declaration
 *   3 — Structural Typing
 *   4 — Excess Property Checking
 *   5 — Readonly & Optional
 *   6 — Index Signatures
 *   7 — Intersection & Utility Types
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
  // ═══════════════════════════════════════════════════════════════
  // Section 1: Object Type Basics
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 1,
    question: "What type does TypeScript infer for this variable?",
    code: `const user = { name: "Alice", age: 30 };`,
    options: [
      "any",
      "object",
      "{ name: string; age: number }",
      '{ name: "Alice"; age: 30 }',
    ],
    correct: 2,
    briefExplanation:
      "TypeScript infers an object type with widened types: " +
      "{ name: string; age: number }. Literal types only appear with 'as const'.",
  },

  {
    sectionIndex: 1,
    question: "What happens when you omit a property?",
    code: `type User = { name: string; age: number };
const u: User = { name: "Alice" };`,
    options: [
      "Compiles — missing properties become undefined",
      "Compile error — 'age' is missing",
      "Compiles with a warning",
      "Runtime error",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript enforces that ALL non-optional properties are present. " +
      "For optional properties, use '?' syntax: age?: number.",
  },

  {
    sectionIndex: 1,
    question: "What is the type of 'obj' here?",
    code: `function process(obj: { x: number; y: number }) {
  return obj.x + obj.y;
}`,
    options: [
      "You must define an interface — inline object types are not allowed",
      "The parameter only accepts objects with EXACTLY x and y",
      "The parameter accepts objects with AT LEAST x and y",
      "The parameter has the type 'any'",
    ],
    correct: 2,
    briefExplanation:
      "Structural Typing: Any object with at least x: number and y: number " +
      "fits — extra properties are allowed (with one exception you will learn later).",
  },

  // ═══════════════════════════════════════════════════════════════
  // Section 2: Interfaces & Declaration
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 2,
    question: "What happens with this code?",
    code: `interface Config {
  host: string;
}
interface Config {
  port: number;
}
const c: Config = ???`,
    options: [
      "Compile error — 'Config' is declared twice",
      "Only the second declaration counts — Config only has 'port'",
      "Both are merged — Config has 'host' AND 'port'",
      "The first declaration wins — Config only has 'host'",
    ],
    correct: 2,
    briefExplanation:
      "Declaration Merging! Interfaces can be declared multiple times — " +
      "the properties are merged. With 'type' this would be an error.",
  },

  {
    sectionIndex: 2,
    question: "What properties does the interface 'Child' have?",
    code: `interface Parent { x: number; y: string; }
interface Child extends Parent { z: boolean; }`,
    options: [
      "Only z: boolean",
      "x: number and z: boolean",
      "x: number, y: string and z: boolean",
      "Error: interfaces cannot be extended",
    ],
    correct: 2,
    briefExplanation:
      "'extends' inherits ALL properties from the parent. " +
      "Child has everything from Parent plus its own definitions.",
  },

  {
    sectionIndex: 2,
    question: "Which feature does 'type' have that 'interface' does NOT have?",
    options: [
      "Optional Properties",
      "Union Types (type A = string | number)",
      "Readonly Properties",
      "Nested objects",
    ],
    correct: 1,
    briefExplanation:
      "Union Types can only be defined with 'type'. " +
      "Interfaces are restricted to object structures.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Section 3: Structural Typing
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 3,
    question: "Does this code compile?",
    code: `interface Euro { betrag: number; }
interface Dollar { betrag: number; }
const preis: Euro = { betrag: 100 };
const kosten: Dollar = preis;`,
    options: [
      "Error — Euro and Dollar are different interfaces",
      "Compiles — TypeScript only checks the structure, not the name",
      "Error — different interfaces are never compatible",
      "Compiles, but with a warning",
    ],
    correct: 1,
    briefExplanation:
      "Structural Typing! Euro and Dollar have the same structure " +
      "{ betrag: number }, so they are compatible — regardless of the name.",
  },

  {
    sectionIndex: 3,
    question: "What is the 'Width Subtyping' rule?",
    code: `interface A { x: number; }
interface B { x: number; y: string; }
const b: B = { x: 1, y: "hi" };
const a: A = b; // Erlaubt?`,
    options: [
      "No — B has extra properties that A doesn't know about",
      "Yes — B has AT LEAST everything A needs (and more is OK)",
      "Only with a type assertion",
      "No — A and B must be identical",
    ],
    correct: 1,
    briefExplanation:
      "Width Subtyping: A type with MORE properties is a subtype of a " +
      "type with fewer properties. B has everything from A plus y — so B fits A.",
  },

  {
    sectionIndex: 3,
    question:
      "Why did TypeScript choose Structural over Nominal Typing?",
    options: [
      "Because Structural Typing compiles faster",
      "Because JavaScript is dynamically typed and code often works without class relationships",
      "Because all modern languages use Structural Typing",
      "Because Nominal Typing cannot be implemented in TypeScript",
    ],
    correct: 1,
    briefExplanation:
      "JavaScript code constantly uses ad-hoc objects without classes. " +
      "Structural Typing fits this reality — it checks 'what do you have?' " +
      "instead of 'where do you come from?'.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Section 4: Excess Property Checking
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 4,
    question: "Which assignment causes an error?",
    code: `interface HasName { name: string; }

// A:
const data = { name: "Max", age: 30 };
const a: HasName = data;

// B:
const b: HasName = { name: "Max", age: 30 };`,
    options: [
      "Only B — a fresh object literal has the extra property 'age'",
      "Only A — the variable has the extra property 'age'",
      "Both — 'age' is not in HasName",
      "Neither — extra properties are always allowed",
    ],
    correct: 0,
    briefExplanation:
      "The Excess Property Check only triggers for fresh object literals! " +
      "In A, the assignment goes through a variable — no check.",
  },

  {
    sectionIndex: 4,
    question:
      "Why did TypeScript introduce the Excess Property Check?",
    options: [
      "To catch typos in object literals (most common source of errors)",
      "For performance reasons — fewer properties are faster",
      "Because Structural Typing is too unsafe",
      "Because JavaScript forbids extra properties",
    ],
    correct: 0,
    briefExplanation:
      "Introduced in TypeScript 1.6: The maintainers observed that " +
      "typos in object literals were one of the most common sources of errors.",
  },

  {
    sectionIndex: 4,
    question: "Which of these approaches does NOT bypass the Excess Property Check?",
    options: [
      "Assignment through an intermediate variable",
      "Type Assertion: { ... } as MyType",
      "Direct assignment of a fresh object literal",
      "Index Signature: [key: string]: unknown",
    ],
    correct: 2,
    briefExplanation:
      "Direct assignment of a fresh object literal is precisely the case " +
      "where the Excess Property Check is active.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Section 5: Readonly & Optional
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 5,
    question: "What happens with this code?",
    code: `interface User {
  readonly address: { city: string; };
}
const u: User = { address: { city: "Berlin" } };
u.address.city = "Hamburg";`,
    options: [
      "No error — readonly is shallow, only the reference 'address' is protected",
      "Compile error — address is readonly, so everything beneath it is too",
      "Runtime error — the object is frozen",
      "Compile error at 'city', because it would need to be 'readonly' too",
    ],
    correct: 0,
    briefExplanation:
      "readonly is SHALLOW! It only protects the top level. " +
      "'u.address = ...' would be an error, but 'u.address.city = ...' is allowed.",
  },

  {
    sectionIndex: 5,
    question: "What is the difference between these two properties?",
    code: `interface A { x?: number; }
interface B { x: number | undefined; }`,
    options: [
      "In A, x can be completely absent; in B, x must be present (value may be undefined)",
      "No difference — both are identical",
      "In B, x is always undefined",
      "In A, x is always present but optional",
    ],
    correct: 0,
    briefExplanation:
      "{} is valid for A (x may be absent), but NOT for B " +
      "(x must be present, even if the value is undefined).",
  },

  {
    sectionIndex: 5,
    question:
      "What do you need for deep-readonly on a nested object?",
    options: [
      "Simply set 'readonly' on the top level",
      "Call Object.freeze()",
      "'as const' on the object",
      "A recursive utility type like DeepReadonly<T>",
    ],
    correct: 3,
    briefExplanation:
      "For true deep immutability in the type system, you need a " +
      "recursive type. 'as const' works too, but only for literal values.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Section 6: Index Signatures
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 6,
    question: "What is the problem with this interface?",
    code: `interface Config {
  name: string;
  port: number;
  [key: string]: string;
}`,
    options: [
      "'port: number' conflicts with the index signature '[key: string]: string'",
      "Index Signatures cannot be combined with fixed properties",
      "The key type 'string' is not allowed",
      "There is no problem",
    ],
    correct: 0,
    briefExplanation:
      "All fixed properties must match the type of the index signature. " +
      "'port: number' conflicts with '[key: string]: string'. " +
      "Solution: [key: string]: string | number.",
  },

  {
    sectionIndex: 6,
    question: "What does Record<string, number> describe?",
    options: [
      "An array of numbers",
      "A type with exactly one property",
      "A tuple [string, number]",
      "An object with arbitrary string keys and number values",
    ],
    correct: 3,
    briefExplanation:
      "Record<K, V> creates a type with keys of type K and values of type V. " +
      "Record<string, number> is { [key: string]: number }.",
  },

  {
    sectionIndex: 6,
    question:
      "What type does 'val' have when accessing an object with an index signature?",
    code: `interface Dict { [key: string]: number; }
const d: Dict = { a: 1, b: 2 };
const val = d["xyz"];`,
    options: [
      "number",
      "number | undefined",
      "unknown",
      "any",
    ],
    correct: 0,
    briefExplanation:
      "Without 'noUncheckedIndexedAccess', TypeScript returns the value type: " +
      "number. WITH the option it would be number | undefined (safer!).",
  },

  // ═══════════════════════════════════════════════════════════════
  // Section 7: Intersection & Utility Types
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 7,
    question: "What does the type 'A & B' describe?",
    code: `type A = { x: number; y: number };
type B = { y: number; z: number };
type C = A & B;`,
    options: [
      "{ y: number } — only the shared properties",
      "{ x: number; z: number } — only the different properties",
      "Error — A and B have the same property 'y'",
      "{ x: number; y: number; z: number } — ALL properties from A AND B",
    ],
    correct: 3,
    briefExplanation:
      "Intersection (&) means: ALL properties from BOTH types. " +
      "This is a union of requirements, not the common intersection.",
  },

  {
    sectionIndex: 7,
    question: "What happens with a property conflict in an intersection?",
    code: `type A = { value: string };
type B = { value: number };
type C = A & B;`,
    options: [
      "Compile error — conflict is detected",
      "string | number — union of both types",
      "string — the first type wins",
      "never — string & number is impossible",
    ],
    correct: 3,
    briefExplanation:
      "string & number results in never — there is no value that is simultaneously " +
      "string AND number. No compile error, but C is unusable.",
  },

  {
    sectionIndex: 7,
    question: "What does Partial<Pick<User, 'name' | 'email'>> describe?",
    code: `interface User { id: string; name: string; email: string; }`,
    options: [
      "{ id?: string; name?: string; email?: string }",
      "{ id: string; name?: string; email?: string }",
      "{ name: string; email: string }",
      "{ name?: string; email?: string }",
    ],
    correct: 3,
    briefExplanation:
      "First Pick: only name and email. Then Partial: both optional. " +
      "Result: { name?: string; email?: string }.",
  },
];