/**
 * Lektion 05 — Quiz-Daten: Objects & Interfaces
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from "../tools/quiz-runner.ts";

export const lessonId = "05";
export const lessonTitle = "Objects & Interfaces";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Interface vs Type ---
  {
    question:
      "Which feature does 'interface' have that 'type' does NOT have?",
    options: [
      "Optional Properties (?)",
      "Readonly Properties",
      "Declaration Merging (reopening and extending an interface)",
      "Nested objects",
    ],
    correct: 2,
    explanation:
      "Declaration Merging is unique to interfaces. You can declare the same interface " +
      "multiple times and the properties are merged together. With 'type' that is not " +
      "possible — you get a 'Duplicate identifier' error.",
  },

  // --- Frage 2: Excess Property Checking ---
  {
    question: "What happens with this code?",
    code: `interface Config { host: string; port: number; }
const config: Config = { host: "localhost", port: 3000, debug: true };`,
    options: [
      "Compiles without error — extra properties are always allowed in TypeScript",
      "Compile error: 'debug' is an excess property on a fresh object literal",
      "Runtime error: 'debug' is discarded at runtime",
      "Compiles, but with a warning",
    ],
    correct: 1,
    explanation:
      "For fresh object literals (assigned directly) TypeScript performs an Excess " +
      "Property Check. 'debug' does not exist in Config, so there is an error. " +
      "Assigning through an intermediate variable would work!",
  },

  // --- Frage 3: Structural Typing ---
  {
    question: "What does TypeScript output for this code?",
    code: `interface A { x: number; }
interface B { x: number; y: number; }
const b: B = { x: 1, y: 2 };
const a: A = b;`,
    options: [
      "Error: B is not the same type as A",
      "Error: b has an extra property 'y'",
      "Compiles without error",
      "Error: A and B are different interfaces",
    ],
    correct: 2,
    explanation:
      "Structural Typing! B has everything A needs (x: number), plus more. " +
      "Since the assignment goes through a variable (b), NO Excess Property Check applies. " +
      "TypeScript only asks: 'Does b have at least x: number?' — Yes!",
  },

  // --- Frage 4: Readonly Verhalten ---
  {
    question: "What happens with this code?",
    code: `interface User {
  readonly address: { city: string; };
}
const u: User = { address: { city: "Berlin" } };
u.address.city = "Hamburg";`,
    options: [
      "Compile error: address is readonly, so city is too",
      "No error: readonly is shallow — only the 'address' reference is protected",
      "Runtime error: the object is frozen",
      "Compile error: city must also be 'readonly'",
    ],
    correct: 1,
    explanation:
      "readonly in TypeScript is SHALLOW! It only protects the top level. " +
      "'u.address = ...' would be an error (the reference is readonly), but " +
      "'u.address.city = ...' modifies the nested object — that is allowed.",
  },

  // --- Frage 5: Index Signatures ---
  {
    question: "What is the problem with this interface?",
    code: `interface Config {
  name: string;
  port: number;
  [key: string]: string;
}`,
    options: [
      "Index signatures cannot be combined with fixed properties",
      "'port: number' is not compatible with the index signature '[key: string]: string'",
      "The key type 'string' is not allowed",
      "There is no problem — the code compiles",
    ],
    correct: 1,
    explanation:
      "All fixed properties must match the type of the index signature. " +
      "'port: number' contradicts '[key: string]: string'. " +
      "Solution: '[key: string]: string | number' — then both properties fit.",
  },

  // --- Frage 6: Extending Interfaces ---
  {
    question: "What properties does interface 'C' have?",
    code: `interface A { x: number; }
interface B { y: string; }
interface C extends A, B { z: boolean; }`,
    options: [
      "Only z: boolean",
      "x: number and z: boolean",
      "x: number, y: string and z: boolean",
      "Error: an interface cannot extend two interfaces",
    ],
    correct: 2,
    explanation:
      "TypeScript supports multiple inheritance for interfaces! " +
      "C inherits x from A, y from B, and defines z itself. " +
      "The result: { x: number; y: string; z: boolean }.",
  },

  // --- Frage 7: Structural Typing Falle ---
  {
    question: "Does this code compile?",
    code: `interface Euro { betrag: number; }
interface Dollar { betrag: number; }
const preis: Euro = { betrag: 100 };
const kosten: Dollar = preis;`,
    options: [
      "Error: Euro and Dollar are different types",
      "Compiles: Structural Typing only checks the structure, not the name",
      "Error: assignment between different interfaces is forbidden",
      "Compiles, but with a warning about possible confusion",
    ],
    correct: 1,
    explanation:
      "TypeScript uses Structural Typing — the NAME of the interface does not matter! " +
      "Euro and Dollar have the same structure { betrag: number }, so they are " +
      "compatible. This is a known weakness — 'Branded Types' (Lesson 24) provide a solution.",
  },

  // --- Frage 8: Optional Property ---
  {
    question: "What is the difference between these two properties?",
    code: `interface A { x?: number; }
interface B { x: number | undefined; }`,
    options: [
      "No difference — both are identical",
      "In A, x can be missing; in B, x must be present (value may be undefined)",
      "In A, x is always undefined; in B it can be number or undefined",
      "B allows null, A does not",
    ],
    correct: 1,
    explanation:
      "x?: number means: the property may be completely absent OR have the value undefined. " +
      "x: number | undefined means: the property MUST be present, but the value may be " +
      "undefined. So: {} is valid for A, but NOT for B!",
  },

  // --- Frage 9: Record Utility Type ---
  {
    question: "What does this type describe?",
    code: `type Status = "active" | "paused" | "deleted";
type StatusCount = Record<Status, number>;`,
    options: [
      "An object with a single property called 'Status'",
      "An object with exactly three properties: active, paused, deleted — all of type number",
      "An array of Status strings",
      "An object with arbitrarily many string keys and number values",
    ],
    correct: 1,
    explanation:
      "Record<K, V> creates a type with keys of type K and values of type V. " +
      "With union keys ALL keys must be present. " +
      "StatusCount = { active: number; paused: number; deleted: number }.",
  },

  // --- Frage 10: Excess Property Check umgehen ---
  {
    question: "Which of the following methods does NOT bypass the Excess Property Check?",
    code: `interface User { name: string; }`,
    options: [
      "const data = { name: 'Max', age: 30 }; const u: User = data;",
      "const u: User = { name: 'Max', age: 30 } as User;",
      "const u: User = { name: 'Max', age: 30 };",
      "interface FlexUser extends User { [key: string]: unknown; } const u: FlexUser = { name: 'Max', age: 30 };",
    ],
    correct: 2,
    explanation:
      "Option C assigns a fresh object literal directly — this triggers the " +
      "Excess Property Check and 'age' is flagged as an error. " +
      "Options A (variable), B (type assertion) and D (index signature) bypass the check.",
  },

  // --- Frage 11: Intersection Types ---
  {
    question: "What does the type 'A & B' describe?",
    code: `type A = { x: number; y: number };
type B = { y: number; z: number };
type C = A & B;`,
    options: [
      "{ x: number } — only the properties that are ONLY in A",
      "{ y: number } — only the COMMON properties",
      "{ x: number; y: number; z: number } — ALL properties from A AND B",
      "Error: A and B share the property 'y'",
    ],
    correct: 2,
    explanation:
      "Intersection (&) means: an object must have ALL properties from BOTH types. " +
      "This is NOT an 'intersection of properties', but a UNION of requirements. " +
      "The name 'Intersection' refers to the value set: fewer objects satisfy " +
      "both conditions simultaneously, so the set of valid values is smaller.",
  },

  // --- Frage 12: Intersection-Konflikt ---
  {
    question: "What is the type of 'value' in the resulting type?",
    code: `type A = { value: string | number };
type B = { value: number | boolean };
type C = A & B;
// C["value"] = ???`,
    options: [
      "string | number | boolean — union of all types",
      "number — only the common type",
      "never — intersection of incompatible types",
      "string | number — the type from A is retained",
    ],
    correct: 1,
    explanation:
      "With intersections, properties with the same name are also intersected: " +
      "(string | number) & (number | boolean) = number. " +
      "Only 'number' is contained in BOTH unions. " +
      "It is like a Venn diagram: only the overlap remains.",
  },

  // --- Frage 13: Partial und Pick ---
  {
    question: "What does this type describe?",
    code: `interface User { id: string; name: string; email: string; }
type T = Partial<Pick<User, "name" | "email">>;`,
    options: [
      "{ id?: string; name?: string; email?: string }",
      "{ name?: string; email?: string }",
      "{ name: string; email: string }",
      "{ id: string; name?: string; email?: string }",
    ],
    correct: 1,
    explanation:
      "First Pick: Pick<User, 'name' | 'email'> = { name: string; email: string }. " +
      "Then Partial: Partial<...> makes all properties optional. " +
      "Result: { name?: string; email?: string }. " +
      "The order is: select first, then make optional.",
  },

  // --- Frage 14: Structural Typing -- der Ueberraschungseffekt ---
  {
    question: "Does this code compile?",
    code: `interface Empty {}
const a: Empty = { x: 1, y: 2 };
const b: Empty = 42;
const c: Empty = "hello";
const d: Empty = [1, 2, 3];`,
    options: [
      "Everything compiles — an empty interface accepts anything (except null/undefined)",
      "Only 'a' compiles — objects fit, primitives do not",
      "Nothing compiles — object literals have excess properties",
      "Only 'a' fails due to Excess Property Check, the rest compiles",
    ],
    correct: 3,
    explanation:
      "Surprise! 'a' fails the Excess Property Check (fresh object literal " +
      "with x and y, which Empty does not know about). But b, c, d all compile, because numbers, " +
      "strings and arrays satisfy the empty interface — they have no MISSING properties. " +
      "An empty interface requires nothing, so almost everything meets the requirement.",
  },

  // --- Frage 15: Readonly-Array vs Readonly-Property ---
  {
    question: "Which line causes a compile error?",
    code: `interface TodoList {
  readonly items: string[];
}
const list: TodoList = { items: ["Einkaufen"] };

list.items.push("Kochen");       // Line A
list.items[0] = "Sport";          // Line B
list.items = ["Neu"];              // Line C`,
    options: [
      "All three lines — readonly protects everything",
      "Only Line C — readonly only protects the reference, not the contents",
      "Line A and C — push modifies the array, = changes the reference",
      "None — readonly has no effect at runtime",
    ],
    correct: 1,
    explanation:
      "readonly on 'items' only protects the reference (Line C: assigning a new array). " +
      "But push() (Line A) and index assignment (Line B) modify the CONTENTS of the array, " +
      "not the reference — that is allowed! " +
      "For true protection you need: readonly items: readonly string[]",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Neue Formate: Short-Answer, Predict-Output, Explain-Why
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 16: Short-Answer — Declaration Merging ---
  {
    type: "short-answer",
    question:
      "What is the feature called where you can declare an interface multiple times " +
      "and TypeScript merges all declarations together?",
    expectedAnswer: "Declaration Merging",
    acceptableAnswers: ["Declaration Merging", "declaration merging", "DeclarationMerging", "Merging", "merging"],
    explanation:
      "Declaration Merging is unique to interfaces. You can declare the same interface " +
      "multiple times and all properties are merged together. This is essential " +
      "for library authors: you can extend Window, ProcessEnv or Express-Request " +
      "without modifying the source code. With 'type' you get a 'Duplicate identifier' error.",
  },

  // --- Frage 17: Short-Answer — Intersection-Ergebnis ---
  {
    type: "short-answer",
    question:
      "What is the result of (string | number) & (number | boolean)? " +
      "(Give the resulting type)",
    expectedAnswer: "number",
    acceptableAnswers: ["number"],
    explanation:
      "When intersecting unions, only the common type remains: " +
      "only 'number' is contained in BOTH unions. string and boolean are excluded. " +
      "It is like a Venn diagram — only the overlap remains.",
  },

  // --- Frage 18: Short-Answer — Optional Property ---
  {
    type: "short-answer",
    question:
      "Is the empty object {} valid for the type { x?: number }? (Yes or No)",
    expectedAnswer: "Yes",
    acceptableAnswers: ["Yes", "yes", "Ja", "ja", "true"],
    explanation:
      "x?: number means: the property x may be completely ABSENT or have the value undefined. " +
      "Therefore {} is valid — x is simply missing. With x: number | undefined, {} would NOT be valid, " +
      "because the property x MUST be present (the value may be undefined, but the key must exist).",
  },

  // --- Frage 19: Predict-Output — Structural Typing ---
  {
    type: "predict-output",
    question: "Does this code compile without errors? (Yes or No)",
    code: `interface Euro { betrag: number; }\ninterface Dollar { betrag: number; }\n\nconst preis: Euro = { betrag: 100 };\nconst kosten: Dollar = preis;`,
    expectedAnswer: "Yes",
    acceptableAnswers: ["Yes", "yes", "Ja", "ja"],
    explanation:
      "TypeScript uses Structural Typing — the NAME of the interface does not matter. " +
      "Euro and Dollar have exactly the same structure { betrag: number }, so they are " +
      "compatible. This is a known weakness for domain modeling. " +
      "'Branded Types' provide a solution (e.g. type Euro = number & { __brand: 'Euro' }).",
  },

  // --- Frage 20: Predict-Output — Excess Property Check ---
  {
    type: "predict-output",
    question: "Does this code compile without errors? (Yes or No)",
    code: `interface User { name: string; }\nconst data = { name: "Max", age: 30 };\nconst user: User = data;`,
    expectedAnswer: "Yes",
    acceptableAnswers: ["Yes", "yes", "Ja", "ja"],
    explanation:
      "Yes! The Excess Property Check only applies to fresh object literals " +
      "(assigned directly). Here data is first stored in an intermediate variable " +
      "and then assigned — no fresh literal anymore. Structural Typing only asks: " +
      "'Does data have a name: string?' — Yes. The extra property 'age' is ignored.",
  },

  // --- Frage 21: Explain-Why — Structural vs Nominal Typing ---
  {
    type: "explain-why",
    question:
      "Why did TypeScript choose Structural Typing, " +
      "even though Nominal Typing (as in Java/C#) would prevent mix-ups like Euro/Dollar?",
    modelAnswer:
      "TypeScript was designed as a superset of JavaScript and had to be compatible with the existing " +
      "JS ecosystem. JavaScript has no declared types — objects are used according to their shape ('Duck Typing'). " +
      "Structural Typing reflects this behavior in the type system. It allows compatibility between " +
      "independently developed libraries without shared base interfaces. Nominal Typing would break many " +
      "common JS patterns and make migrating from JS to TS significantly harder.",
    keyPoints: [
      "JavaScript uses Duck Typing — Structural Typing reflects that",
      "Compatibility with the existing JS ecosystem",
      "Independent libraries can have compatible types",
      "Nominal Typing would break JS migration and many patterns",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Elaboriertes Feedback — tiefere Erklaerungen pro Frage
// ═══════════════════════════════════════════════════════════════════════════════

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  // Frage 1: Interface vs Type
  0: {
    whyCorrect:
      "Declaration Merging allows you to declare an interface multiple times — " +
      "all declarations are merged together. This is indispensable for " +
      "library authors: you can extend Window, ProcessEnv or Express-Request " +
      "without modifying the source code. 'type' cannot do this.",
    commonMistake:
      "Optional (?) and readonly are NOT interface-exclusive — both " +
      "also work with type. The only real practical difference: " +
      "Declaration Merging and the 'extends' syntax.",
  },

  // Frage 2: Excess Property Checking
  1: {
    whyCorrect:
      "TypeScript performs an Excess Property Check only on 'fresh' " +
      "object literals — that is, when { ... } is assigned directly to a type. " +
      "'debug: true' does not exist in Config, hence the error. " +
      "Introduced in TS 1.6 to catch typos in configuration objects.",
    commonMistake:
      "Option A ('always allowed') confuses Structural Typing with the " +
      "Excess Property Check. Structural Typing allows extra properties, " +
      "but the Excess Check is an ADDITIONAL check on fresh literals.",
  },

  // Frage 3: Structural Typing
  2: {
    whyCorrect:
      "Structural Typing checks the SHAPE, not the name. B has everything " +
      "A requires (x: number), plus y: string. Since b is assigned via a variable " +
      "(no fresh literal), no Excess Property Check applies either. " +
      "TypeScript only asks: 'Does b have an x: number?' — Yes!",
    commonMistake:
      "In nominally typed languages (Java, C#) this would be an error — " +
      "A and B are different types. TypeScript ignores the name " +
      "and only checks the structure. This is the fundamental design philosophy.",
  },

  // Frage 4: Readonly Verhalten
  3: {
    whyCorrect:
      "'readonly address' only protects the REFERENCE — you cannot set address to " +
      "a new object. But the properties OF THE OBJECT (city, zip) " +
      "are not readonly. readonly is always only one level deep. " +
      "This is consistent with Object.freeze() in JavaScript, which is also shallow.",
    commonMistake:
      "The intuition 'readonly = immutable' is too strong. " +
      "readonly means 'this specific assignment is forbidden', " +
      "not 'everything below is frozen'. For deep-readonly you need " +
      "a recursive utility type or 'as const'.",
  },

  // Frage 5: Index Signatures
  4: {
    whyCorrect:
      "An index signature [key: string]: string states: EVERY string key " +
      "returns a string. 'port' is a string key, so it should return string " +
      "— but port is declared as number. Contradiction! " +
      "All fixed properties must be compatible with the index signature type.",
    commonMistake:
      "'name: string' matches the index signature (string to string), so " +
      "many miss the conflict with 'port: number'. The solution: " +
      "[key: string]: string | number — then both fixed properties fit.",
  },

  // Frage 6: Extending Interfaces
  5: {
    whyCorrect:
      "TypeScript allows multiple inheritance for interfaces: 'extends A, B'. " +
      "C inherits ALL properties from A (x: number) and B (y: string) and adds " +
      "z: boolean. With conflicts (same property with different type) " +
      "there is a compile error.",
    commonMistake:
      "In Java or C# a class can only inherit from one parent. " +
      "For interfaces it is different — they only describe the shape, " +
      "there is no implementation, so there is no diamond problem.",
  },

  // Frage 7: Structural Typing Falle
  6: {
    whyCorrect:
      "Euro and Dollar have exactly the same structure: { betrag: number }. " +
      "In a Structural Typing system they are therefore IDENTICAL. " +
      "TypeScript does not check the interface name — only the properties. " +
      "This is a known weakness for domain modeling.",
    commonMistake:
      "Most developers expect nominal behavior: 'Euro is not " +
      "Dollar'. For type safety with currencies you need Branded Types: " +
      "type Euro = number & { __brand: 'Euro' }.",
  },

  // Frage 8: Optional Property
  7: {
    whyCorrect:
      "'x?: number' means: the property x may be ABSENT from the object. " +
      "{} is valid for A. 'x: number | undefined' means: the property " +
      "x MUST be present, but the value may be undefined. " +
      "{ x: undefined } is valid for B, but {} is NOT.",
    commonMistake:
      "'Optional just means: the value can be undefined' — that is " +
      "an oversimplification. The key difference is EXISTENCE vs. VALUE. " +
      "In practice this matters for 'in'-checks and Object.keys().",
  },

  // Frage 9: Record Utility Type
  8: {
    whyCorrect:
      "Record<K, V> creates a property of type V for EVERY key in K. " +
      "With a union like 'active' | 'paused' | 'deleted' exactly " +
      "3 properties are created — and ALL must be present. " +
      "It is like a complete table: every status needs a counter.",
    commonMistake:
      "Record<string, number> (with string instead of union) would allow arbitrarily many " +
      "keys. But Record with a STRING LITERAL UNION enforces " +
      "completeness — missing keys are an error.",
  },

  // Frage 10: Excess Property Check umgehen
  9: {
    whyCorrect:
      "Option C is a fresh object literal assigned directly — exactly the " +
      "case where the Excess Property Check kicks in. 'age' is not defined in User, " +
      "so it is an error. The other options bypass the check: " +
      "variable (A), type assertion (B), index signature (D).",
    commonMistake:
      "Type assertion (as User) disables the Excess Check — that is " +
      "more powerful than it seems. It should be used sparingly, " +
      "because it hides potential typos.",
  },

  // Frage 11: Intersection Types
  10: {
    whyCorrect:
      "Intersection (&) means: a value must satisfy ALL requirements from " +
      "BOTH types simultaneously. A requires x and y, B requires " +
      "y and z — so C must have all three. The name 'Intersection' " +
      "refers to the VALUE set (smaller), not the properties (larger).",
    commonMistake:
      "Confusing it with 'intersection of properties' (only y) is " +
      "the most common mistake. Think of it this way: '&' means 'AND' — you must " +
      "satisfy A AND B, so you need MORE properties, not fewer.",
  },

  // Frage 12: Intersection-Konflikt
  11: {
    whyCorrect:
      "With intersections, same-named properties are also intersected. " +
      "(string | number) & (number | boolean) = number. Only number is in " +
      "BOTH unions. It is like a Venn diagram: " +
      "string and boolean are excluded, only the overlapping area remains.",
    commonMistake:
      "Union of all types (Option A) confuses intersection with union. " +
      "'never' (Option C) would result if the types had NO " +
      "common type at all (e.g. string & number).",
  },

  // Frage 13: Partial und Pick
  12: {
    whyCorrect:
      "Evaluation proceeds from inside out: First Pick — selects " +
      "name and email from User. Then Partial — makes both optional. " +
      "id is NEVER included, because Pick did not select it. " +
      "Order matters: Partial<Pick<...>> != Pick<Partial<...>>.",
    commonMistake:
      "Option A (all properties optional) forgets that Pick acts first " +
      "and removes id. Option D (id: string) assumes id is somehow " +
      "retained. Pick is exclusive — what is not named does not exist.",
  },

  // Frage 14: Structural Typing — der Ueberraschungseffekt
  13: {
    whyCorrect:
      "Empty interface {} requires NO properties. Almost everything satisfies " +
      "'no requirement': 42 has no missing properties, 'hello' either. " +
      "BUT: fresh object literals with extra properties trigger the " +
      "Excess Property Check — so 'a' fails. " +
      "null and undefined fail under strictNullChecks.",
    commonMistake:
      "Option A ('everything compiles') forgets the Excess Property Check on a. " +
      "Option B ('only objects') underestimates Structural Typing — even " +
      "primitives have properties (length, toString, etc.).",
  },

  // Frage 15: Readonly-Array vs Readonly-Property
  14: {
    whyCorrect:
      "'readonly items: string[]' protects the property assignment " +
      "(list.items = [...] is forbidden), but NOT the array contents. " +
      "push() and index assignment operate on the array INSIDE the " +
      "property — the reference does not change. " +
      "For full protection: 'readonly items: readonly string[]'.",
    commonMistake:
      "'Everything is protected' (Option A) thinks too simply. 'readonly' on " +
      "a property is like a sign on a door: it prevents the door from being " +
      "replaced with another one, but does not stop someone from " +
      "rearranging the room behind it.",
  },
};