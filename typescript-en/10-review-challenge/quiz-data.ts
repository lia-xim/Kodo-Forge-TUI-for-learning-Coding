/**
 * Lesson 10 — Quiz Data: Review Challenge — Phase 1
 *
 * 20 MIXED questions from ALL lessons (L01-L09).
 * Intentionally NOT sorted by topic — as in real practice
 * you have to identify which concept is being asked about.
 *
 * Exports only the questions (without calling runQuiz),
 * so that the review runner can import them.
 */

import type { QuizQuestion } from "../tools/quiz-runner.ts";

export const lessonId = "10";
export const lessonTitle = "Review Challenge — Phase 1";

export const questions: QuizQuestion[] = [
  // ─── Question 1: Structural Typing (L05) ───────────────────────────────────
  {
    question: "What does this code output?",
    code: `interface HasLength { length: number; }
function logLength(item: HasLength): void {
  console.log(item.length);
}
logLength("Hello");
logLength([1, 2, 3]);
logLength({ length: 42, extra: true });`,
    options: [
      "5, 3, 42 — Structural Typing: everything with 'length: number' fits",
      "Error: string is not a HasLength",
      "Error: { length: 42, extra: true } has an Excess Property",
      "5, 3, Error on the third line",
    ],
    correct: 0,
    explanation:
      "Structural Typing in action! 'string' has length: number, arrays have length: number, " +
      "and the object is passed via a variable (not a literal), so no Excess Property Check. " +
      "TypeScript only checks: 'Does the argument have length: number?' — Yes, for all three.",
    elaboratedFeedback:
      "This is a core principle of TypeScript (L05): The SHAPE decides, not the NAME. " +
      "string, Array, and the object all have a 'length' property of type number. " +
      "The Excess Property Check (extra: true) does NOT apply, because the object is passed " +
      "to a function via a variable — not assigned as a fresh literal.",
  },

  // ─── Question 2: as const (L09) ────────────────────────────────────────────
  {
    question: "What is the type of 'method'?",
    code: `const config = {
  url: "/api/users",
  method: "GET",
} as const;
type Method = typeof config.method;`,
    options: [
      "string",
      '"GET" | "POST" | "PUT" | "DELETE"',
      "Readonly<string>",
      '"GET"',
    ],
    correct: 3,
    explanation:
      "With 'as const', every value becomes a Literal Type. config.method is no longer 'string', " +
      "but exactly the Literal Type '\"GET\"'. That is the whole point of as const: maximum precision.",
    elaboratedFeedback:
      "Without 'as const', config.method would be: string (Type Widening, L03). " +
      "With 'as const', the entire object becomes 'deep readonly' and all values are " +
      "frozen to their Literal Types. This is extremely useful for configurations, " +
      "routing tables, and anywhere you want to derive precise types from runtime values (L09).",
  },

  // ─── Question 3: Function Overloads (L06) ──────────────────────────────────
  {
    question: "What is the return type of result?",
    code: `function parse(input: string): number;
function parse(input: string[]): number[];
function parse(input: string | string[]): number | number[] {
  if (Array.isArray(input)) return input.map(Number);
  return Number(input);
}

const result = parse("42");`,
    options: [
      "number | number[]",
      "number",
      "string",
      "unknown",
    ],
    correct: 1,
    explanation:
      "With overloads, the CALL SIGNATURE decides, not the implementation. " +
      "parse(\"42\") matches the first overload (string → number), so result is: number.",
    elaboratedFeedback:
      "Function Overloads (L06) give you more precise return types than a union. " +
      "Without overloads, the type would be number | number[] — you would have to narrow yourself. " +
      "With overloads, TypeScript already knows the exact output type from the input type. " +
      "The implementation signature (the third one) is INVISIBLE to callers.",
  },

  // ─── Question 4: never (L02, L09) ──────────────────────────────────────────
  {
    question: "What happens when you add a new type to Shape but forget the case?",
    code: `type Circle = { kind: "circle"; radius: number };
type Rect = { kind: "rect"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };

type Shape = Circle | Rect | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    default: {
      const _: never = shape;
      return _;
    }
  }
}`,
    options: [
      "Runtime error: Triangle has no area calculation",
      "No error — the default case catches everything",
      "Compile error: Type 'Triangle' is not assignable to type 'never'",
      "TypeScript ignores Triangle because it is not used",
    ],
    correct: 2,
    explanation:
      "This is the exhaustive check! In the default case, shape has type Triangle " +
      "(because circle and rect have already been handled). Triangle is NOT never, " +
      "so the compiler reports an error. That's exactly what we want!",
    elaboratedFeedback:
      "The never trick (L09) is one of the most powerful patterns in TypeScript. " +
      "When you cover all cases of a Discriminated Union (L07), 'never' is left over in the default — " +
      "nothing can reach it. But if you forget a case, the value in the default still has " +
      "a concrete type that does not match 'never'. This forces the compiler to require you to handle every case.",
  },

  // ─── Question 5: Type Inference (L03) ──────────────────────────────────────
  {
    question: "Where should you write an explicit type annotation?",
    code: `// A:
const name = "Max";

// B:
function getUser() {
  return { id: 1, name: "Max" };
}

// C:
function processData(data) {
  return data.length;
}

// D:
const numbers = [1, 2, 3];`,
    options: [
      "For C — parameters without annotation are implicitly 'any'",
      "For A and D — variables should always be annotated",
      "For all — explicit is always better",
      "For none — TypeScript can infer everything",
    ],
    correct: 0,
    explanation:
      "Function parameters cannot be inferred (in strict mode) — " +
      "'data' becomes 'any'. For A and D, TypeScript infers correctly (string and number[] respectively). " +
      "For B, the return type is inferred.",
    elaboratedFeedback:
      "The golden rule (L03): Annotate parameters and public APIs. " +
      "Let TypeScript infer the rest. C is the only case where an annotation " +
      "is NECESSARY, because parameters in isolated functions cannot be inferred. " +
      "For A, B, and D, inference does good work.",
  },

  // ─── Question 6: Union + Narrowing (L07) ───────────────────────────────────
  {
    question: "Which line produces a compile error?",
    code: `function process(x: string | number | boolean) {
  // Line A:
  console.log(x.toString());

  // Line B:
  if (typeof x === "string") {
    console.log(x.toUpperCase());
  }

  // Line C:
  console.log(x.toUpperCase());

  // Line D:
  if (typeof x === "number") {
    console.log(x.toFixed(2));
  }
}`,
    options: [
      "Line A — toString() does not exist on all types",
      "Line B — toUpperCase() does not exist on number",
      "Line C — x is still string | number | boolean here, toUpperCase() does not work",
      "Line D — toFixed() does not exist on boolean",
    ],
    correct: 2,
    explanation:
      "Line C! After the if-block of Line B, x is the full union type again " +
      "(string | number | boolean). toUpperCase() only exists on string. " +
      "Line A is OK because toString() exists on all three types.",
    elaboratedFeedback:
      "Narrowing (L07) only takes effect INSIDE the if-block. After that, TypeScript 'forgets' " +
      "the restriction and x has its full type again. Line A works, " +
      "because toString() exists on string, number, AND boolean — TypeScript finds the " +
      "method on all members of the union. But toUpperCase() only exists on string.",
  },

  // ─── Question 7: Readonly (L05) ────────────────────────────────────────────
  {
    question: "Which assignment does NOT compile?",
    code: `interface Config {
  readonly host: string;
  readonly port: number;
  readonly db: {
    name: string;
    pool: number;
  };
}

const cfg: Config = { host: "localhost", port: 5432, db: { name: "app", pool: 10 } };

// A:
cfg.db.name = "test";

// B:
cfg.host = "remote";

// C:
cfg.db.pool = 20;

// D:
cfg.db = { name: "other", pool: 5 };`,
    options: [
      "Only B — host is readonly",
      "A, B, C, and D — everything is readonly",
      "None — readonly is not enforced at runtime",
      "B and D — host and the db reference are readonly, but db.name and db.pool are not",
    ],
    correct: 3,
    explanation:
      "readonly is SHALLOW! cfg.host and cfg.db are readonly (Lines B and D fail). " +
      "But cfg.db.name and cfg.db.pool are NOT readonly — the properties inside db " +
      "have no readonly. Lines A and C compile!",
    elaboratedFeedback:
      "A classic misconception (L05): readonly only protects the direct property, " +
      "not nested objects. cfg.db = ... changes the reference (readonly!). " +
      "But cfg.db.name changes a property INSIDE the referenced object — " +
      "this is allowed because 'name' in db has no readonly. For deep readonly " +
      "you need Readonly<Config> recursively or a DeepReadonly utility.",
  },

  // ─── Question 8: Intersection (L07) ────────────────────────────────────────
  {
    question: "What is the type of 'result'?",
    code: `interface HasName { name: string; }
interface HasAge { age: number; }
interface HasEmail { email: string; }

type Person = HasName & HasAge;
type ContactablePerson = Person & HasEmail;

const result: ContactablePerson = {
  name: "Max",
  age: 30,
  email: "max@test.de"
};`,
    options: [
      "{ name: string } — only the first interface counts",
      "{ name: string; age: number; email: string } — all properties combined",
      "HasName | HasAge | HasEmail — a union of the interfaces",
      "Error: you cannot intersect more than 2 types",
    ],
    correct: 1,
    explanation:
      "Intersection (&) combines all properties. Person has name + age, " +
      "ContactablePerson has name + age + email. The object must have ALL of them.",
    elaboratedFeedback:
      "Intersection Types (L07) are the opposite of unions. Union (|) means " +
      "'one of', Intersection (&) means 'all combined'. You can intersect any number " +
      "of types. This is great for composition: Instead of a large " +
      "interface hierarchy, you build small building blocks (HasId, HasTimestamps, HasName) " +
      "and combine them with &.",
  },

  // ─── Question 9: Tuple Types (L04) ─────────────────────────────────────────
  {
    question: "What is the difference between these two types?",
    code: `type A = number[];
type B = [number, number, number];

const a: A = [1, 2, 3, 4, 5];
const b: B = [1, 2, 3];`,
    options: [
      "No difference — both are number arrays",
      "A is an array of arbitrary length, B is a tuple with exactly 3 elements",
      "A allows only numbers, B also allows strings",
      "B is a readonly array, A is not",
    ],
    correct: 1,
    explanation:
      "A (number[]) is an array with any number of numbers. B ([number, number, number]) " +
      "is a tuple — exactly 3 elements, all numbers. const b: B = [1, 2] would be an error!",
    elaboratedFeedback:
      "Tuples (L04) are a powerful concept that is often overlooked. They are " +
      "not simply 'arrays with a fixed length' — they can have different types at " +
      "different positions: [string, number, boolean]. This makes them perfect " +
      "for return values like [data, error] or [value, setValue].",
  },

  // ─── Question 10: Declaration Merging (L08) ────────────────────────────────
  {
    question: "What happens here?",
    code: `interface Config {
  host: string;
}

interface Config {
  port: number;
}

const cfg: Config = { host: "localhost", port: 3000 };`,
    options: [
      "Error: Config is declared twice",
      "Only the second definition counts (port: number)",
      "Declaration Merging: Config has host AND port",
      "Error: interface cannot be mixed with type",
    ],
    correct: 2,
    explanation:
      "Declaration Merging! Interfaces with the same name are automatically merged. " +
      "Config ends up with both host and port. This is unique to interfaces — " +
      "with 'type' you would get a 'Duplicate identifier' error.",
    elaboratedFeedback:
      "Declaration Merging (L08) is the most important difference between interface and type. " +
      "Libraries use it so you can extend their types without changing the source code. " +
      "Express, React, and many others use this pattern. " +
      "Rule: Use interface when you need or want Declaration Merging.",
  },

  // ─── Question 11: void vs never (L06) ──────────────────────────────────────
  {
    question: "Which function has the return type 'never'?",
    code: `// A:
function logMessage(msg: string): void {
  console.log(msg);
}

// B:
function throwError(msg: string): never {
  throw new Error(msg);
}

// C:
function emptyReturn(): void {
  return;
}

// D:
function infiniteLoop(): never {
  while (true) { /* ... */ }
}`,
    options: [
      "Only B — throw produces never",
      "A, B, C, and D — all return nothing",
      "None — never is only assigned manually",
      "B and D — functions that NEVER return normally",
    ],
    correct: 3,
    explanation:
      "void = function returns, but gives back no meaningful value. " +
      "never = function NEVER returns (throw or infinite loop). " +
      "B (throw) and D (while true) both never return normally.",
    elaboratedFeedback:
      "The difference between void and never (L06) is subtle but important. " +
      "void says 'ignore the return value'. never says 'this point in the code " +
      "cannot be reached'. never is the Bottom Type — it is a subtype " +
      "of EVERYTHING, but nothing (except never itself) is a subtype of never. " +
      "This makes it perfect for exhaustive checks.",
  },

  // ─── Question 12: Discriminated Union (L07) ────────────────────────────────
  {
    question: "What does a Discriminated Union require?",
    options: [
      "A shared property name with Literal Types + a switch/if",
      "At least 3 members in the union",
      "The keyword 'discriminated' before the union",
      "Generics and Type Guards",
    ],
    correct: 0,
    explanation:
      "A Discriminated Union requires: 1) A shared property (e.g. 'kind', 'type', 'status'), " +
      "2) Literal Types as values (e.g. 'circle' | 'rect'), 3) Narrowing via switch/if. " +
      "No special keyword needed — it is a pattern, not a language feature.",
    elaboratedFeedback:
      "Discriminated Unions (L07) are THE pattern for state modeling in TypeScript. " +
      "The three ingredients: A shared discriminator (same property name in all " +
      "union members), Literal Types as values of this discriminator, and narrowing " +
      "in the code (switch or if). TypeScript recognizes the pattern automatically and narrows " +
      "the type in each branch.",
  },

  // ─── Question 13: Excess Property Check (L05) ──────────────────────────────
  {
    question: "Which call produces a compile error?",
    code: `interface Point { x: number; y: number; }

// A:
const a: Point = { x: 1, y: 2, z: 3 };

// B:
const temp = { x: 1, y: 2, z: 3 };
const b: Point = temp;

// C:
function fn(p: Point) { return p; }
fn({ x: 1, y: 2, z: 3 });

// D:
const data = { x: 1, y: 2, z: 3 };
fn(data);`,
    options: [
      "A and C — Excess Property Check applies to fresh Object Literals",
      "Only A and B — TypeScript checks variable assignments more strictly",
      "All four — z does not exist in Point",
      "None — Structural Typing allows extra properties",
    ],
    correct: 0,
    explanation:
      "A (direct literal at assignment) and C (direct literal at function call) " +
      "produce errors due to Excess Property Checking. B and D use variables — " +
      "there only Structural Typing applies, and extra properties are OK.",
    elaboratedFeedback:
      "The Excess Property Check (L05) is an exception to Structural Typing. " +
      "It only applies to 'fresh' Object Literals — that is, when you write an object directly " +
      "at a location where a type is expected. Once the object is stored in a " +
      "variable, it is no longer 'fresh' and the check does not apply. " +
      "This is intentional: fresh literals are likely typos, variables are not.",
  },

  // ─── Question 14: Readonly Arrays (L04) ────────────────────────────────────
  {
    question: "What happens with this code?",
    code: `function sum(numbers: readonly number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

const mutable = [1, 2, 3];
const immutable: readonly number[] = [4, 5, 6];

sum(mutable);
sum(immutable);`,
    options: [
      "Error: mutable (number[]) is not compatible with readonly number[]",
      "Error: readonly arrays cannot be passed to functions",
      "Both calls compile — number[] is compatible with readonly number[]",
      "Error for both — reduce() does not work on readonly arrays",
    ],
    correct: 2,
    explanation:
      "number[] is a SUBTYPE of readonly number[]. A mutable array has all the methods " +
      "of a readonly array (and more). The assignment is safe. The other way around would " +
      "be an error: assigning readonly number[] to number[].",
    elaboratedFeedback:
      "Compatibility (L04): mutable → readonly is OK (you are giving up rights). " +
      "readonly → mutable is NOT OK (you would be gaining rights you should not " +
      "have). It is like a library book: you can treat your own " +
      "book like a library book (read-only), but not the other way around.",
  },

  // ─── Question 15: any vs unknown (L02) ─────────────────────────────────────
  {
    question: "Which line produces a compile error?",
    code: `// A:
const a: any = "hello";
console.log(a.toUpperCase());

// B:
const b: unknown = "hello";
console.log(b.toUpperCase());

// C:
const c: unknown = "hello";
if (typeof c === "string") {
  console.log(c.toUpperCase());
}

// D:
const d: any = 42;
d.nonExistentMethod();`,
    options: [
      "A and D — any disables ALL checks",
      "Only B — unknown requires narrowing before use",
      "B and C — unknown does not allow any operations",
      "None — all compile",
    ],
    correct: 1,
    explanation:
      "Only B! unknown requires a type check (narrowing) before you can use properties " +
      "or methods. C is OK because typeof is used. " +
      "A and D compile because any disables ALL checks — even for nonsense like " +
      "d.nonExistentMethod().",
    elaboratedFeedback:
      "any vs unknown (L02): any says 'I know everything' (disables the compiler). " +
      "unknown says 'I know nothing' (enables the compiler maximally). " +
      "unknown is type-safe: you MUST first check what you have. any is dangerous: " +
      "you can do anything, even nonsense. Rule: ALWAYS use unknown instead of any " +
      "for values whose type you do not know.",
  },

  // ─── Question 16: Type Alias vs Interface (L08) ────────────────────────────
  {
    question: "Which statement is correct?",
    options: [
      "type can do everything interface can, plus more — always use type",
      "interface can do everything type can, plus more — always use interface",
      "type is better for Unions/Intersections/Mapped, interface for objects with extends/merging",
      "There is no functional difference — it is purely a matter of taste",
    ],
    correct: 2,
    explanation:
      "Both have strengths: type can do Unions, Intersections, Tuples, Mapped Types. " +
      "interface can do Declaration Merging, extends (with better error messages), and " +
      "is idiomatic for object shapes. The right choice depends on the use case.",
    elaboratedFeedback:
      "The rule of thumb (L08): Interface for object shapes that could be extended " +
      "(API types, library types, class implementations). Type for everything else: " +
      "Unions, Tuples, computed types, function types. In practice: most " +
      "teams choose a convention (all interface OR all type for objects) " +
      "and stick to it.",
  },

  // ─── Question 17: Index Signatures (L05) ───────────────────────────────────
  {
    question: "Why does this code not compile?",
    code: `interface Dictionary {
  name: string;
  [key: string]: number;
}`,
    options: [
      "name (string) is not compatible with the Index Signature (number)",
      "Index Signatures and fixed properties cannot be mixed",
      "The type of [key: string] must be 'any'",
      "A semicolon is missing",
    ],
    correct: 0,
    explanation:
      "When an Index Signature [key: string]: number exists, ALL properties " +
      "(including fixed ones like 'name') must be compatible with the index type. name: string is not " +
      "compatible with number. Solution: [key: string]: string | number.",
    elaboratedFeedback:
      "Index Signatures (L05) are more powerful than they look — and have pitfalls. " +
      "The rule: The Index Signature type must be a supertype of all fixed properties. " +
      "When you say [key: string]: number, you promise 'EVERY string key yields number'. " +
      "But name yields string — contradiction! Solution: [key: string]: string | number.",
  },

  // ─── Question 18: strict mode (L01) ────────────────────────────────────────
  {
    question: "What does 'strict: true' in tsconfig.json NOT activate?",
    options: [
      "strictNullChecks — null/undefined are separate types",
      "noImplicitAny — parameters without a type become 'any' errors",
      "strictFunctionTypes — stricter function type compatibility",
      "noUnusedLocals — warning for unused variables",
    ],
    correct: 3,
    explanation:
      "noUnusedLocals is NOT part of strict mode. strict activates: " +
      "strictNullChecks, noImplicitAny, strictFunctionTypes, strictBindCallApply, " +
      "strictPropertyInitialization, noImplicitThis, alwaysStrict, useUnknownInCatchVariables. " +
      "noUnusedLocals must be activated separately.",
    elaboratedFeedback:
      "strict: true (L01) is an umbrella flag that activates several strict options. " +
      "It is the most important setting in tsconfig.json. noUnusedLocals and " +
      "noUnusedParameters are useful but do not belong to strict — they are " +
      "separate code quality options. Always use strict: true!",
  },

  // ─── Question 19: Optional Chaining + Nullish (L02, L05) ───────────────────
  {
    question: "What is the type of 'result'?",
    code: `interface User {
  name: string;
  address?: {
    city: string;
    zip?: string;
  };
}

const user: User = { name: "Max" };
const result = user.address?.city;`,
    options: [
      "string",
      "string | undefined",
      "string | null",
      "string | null | undefined",
    ],
    correct: 1,
    explanation:
      "user.address is optional (can be undefined). Optional Chaining (?.) returns " +
      "undefined when address does not exist. So result is: string | undefined.",
    elaboratedFeedback:
      "Optional Chaining (?.) and optional properties (?) work together (L05). " +
      "If address is undefined, ?. immediately returns undefined without accessing .city. " +
      "If address exists, .city is read normally (string). " +
      "Together: string | undefined. Not null — Optional Chaining always returns " +
      "undefined, never null.",
  },

  // ─── Question 20: Interplay of all concepts ────────────────────────────────
  {
    question: "Which pattern is the BEST solution for this problem?",
    code: `// You need to model different API responses:
// - Success with data
// - Loading state
// - Error with code and message
// - No result (404)

// Requirement: Invalid states must be excluded at compile time.`,
    options: [
      "An interface with optional fields: data?, error?, loading?, notFound?",
      "Four separate interfaces without a shared field",
      "Discriminated Union with status field: 'success' | 'loading' | 'error' | 'not_found'",
      "A boolean-flags object: { isLoading: boolean; isError: boolean; isNotFound: boolean }",
    ],
    correct: 2,
    explanation:
      "Discriminated Union! A shared status field with Literal Types ensures " +
      "that only valid combinations are possible. Optional fields or flags allow " +
      "invalid states (e.g. loading AND error at the same time).",
    elaboratedFeedback:
      "This question tests your integrated understanding from L07 + L09 + L05. " +
      "The Discriminated Union is ALWAYS the best choice when you need to model different states. " +
      "Why? 1) Each state has ONLY the fields it needs. " +
      "2) TypeScript narrows automatically in switch. 3) Exhaustive checks catch " +
      "forgotten states. 4) Invalid combinations are impossible. " +
      "This is THE pattern you should take away from Phase 1.",
  },

  // ─── Additional Formats ─────────────────────────────────────────────────────

  // --- Question 21: Short-Answer — Structural Typing ---
  {
    type: "short-answer",
    question: "What is the type system principle where the SHAPE decides, not the NAME? (L05)",
    expectedAnswer: "Structural Typing",
    acceptableAnswers: ["Structural Typing", "structural typing", "Structural"],
    explanation:
      "TypeScript uses Structural Typing (Duck Typing): If an object has the right " +
      "shape (the expected properties with compatible types), then it fits — " +
      "regardless of what the type is called or where it was declared.",
  },

  // --- Question 22: Short-Answer — readonly depth ---
  {
    type: "short-answer",
    question: "Is `readonly` in TypeScript shallow or deep?",
    expectedAnswer: "shallow",
    acceptableAnswers: ["shallow", "Shallow"],
    explanation:
      "readonly is SHALLOW — it only protects the direct property, not nested objects. " +
      "cfg.db is readonly (reference protected), but cfg.db.name can still be changed. " +
      "For deep readonly, recursive Utility Types are needed.",
  },

  // --- Question 23: Short-Answer — never usage ---
  {
    type: "short-answer",
    question: "Which type is expected in the default case of a fully handled Discriminated Union?",
    expectedAnswer: "never",
    acceptableAnswers: ["never"],
    explanation:
      "When all cases of a Discriminated Union are handled, the type 'never' is left in the default block — " +
      "no value can reach this point. " +
      "const _: never = shape enforces completeness at compile time.",
  },

  // --- Question 24: Predict-Output — Optional Chaining ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code: "interface User {\n  name: string;\n  address?: { city: string };\n}\nconst u: User = { name: 'Max' };\nconsole.log(u.address?.city ?? 'unknown');",
    expectedAnswer: "unknown",
    acceptableAnswers: ["unknown", "'unknown'", "\"unknown\""],
    explanation:
      "u.address is undefined (not set). Optional Chaining (?.) returns undefined. " +
      "The Nullish Coalescing Operator (??) replaces undefined with 'unknown'. " +
      "Both operators work together for safe access to optional properties.",
  },

  // --- Question 25: Predict-Output — Excess Property Check ---
  {
    type: "predict-output",
    question: "Does this code compile without errors? Answer with 'yes' or 'no'.",
    code: "interface Point { x: number; y: number; }\nconst temp = { x: 1, y: 2, z: 3 };\nconst p: Point = temp;",
    expectedAnswer: "yes",
    acceptableAnswers: ["yes", "Yes"],
    explanation:
      "The Excess Property Check only applies to fresh Object Literals. " +
      "Here the object is first assigned to a variable (temp) and then passed. " +
      "Structural Typing allows extra properties — z exists but does not cause issues.",
  },

  // --- Question 26: Explain-Why — unknown vs any ---
  {
    type: "explain-why",
    question: "Why should you use `unknown` instead of `any` for values of unknown type? (L02)",
    modelAnswer:
      "unknown enforces a type check (narrowing) before you can use properties or methods. " +
      "any disables the compiler completely — even for nonsensical operations like " +
      "d.nonExistentMethod(). unknown is type-safe: you MUST first check what you have. " +
      "any is like turning off the compiler — errors only become visible at runtime.",
    keyPoints: [
      "unknown enforces narrowing before use",
      "any disables all compiler checks",
      "unknown for type-safe processing of unknown values",
    ],
  },
];