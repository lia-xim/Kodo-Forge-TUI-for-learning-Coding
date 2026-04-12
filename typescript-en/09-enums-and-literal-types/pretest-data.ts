/**
 * Lesson 09 — Pre-Test Questions: Enums & Literal Types
 *
 * 3 questions per section (6 sections = 18 questions).
 * correct-index distribution: 5×0, 4×1, 5×2, 4×3
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
  // ═══ Section 1: Literal Types ═══════════════════════════════════════════

  // Q1 → correct:0 (Correct first)
  { sectionIndex: 1, question: "What is the type of `const x = 'hello'`?", options: ["'hello'", "string", "any", "I don't know"], correct: 0, briefExplanation: "const infers the literal type 'hello' — the most precise possible type." },

  // Q2 → correct:1 (unchanged)
  { sectionIndex: 1, question: "What does `as const` do?", options: ["Only readonly", "readonly + Literal Types + Tuple", "Converts to const", "I don't know"], correct: 1, briefExplanation: "as const has three effects: readonly, Literal Types, and Tuple instead of Array." },

  // Q3 → correct:2 (Correct at position 2)
  { sectionIndex: 1, question: "Why does `let x = 'hello'` have type string and not 'hello'?", options: ["Bug", "Strings are always string", "let can be reassigned later — wider type needed", "I don't know"], correct: 2, briefExplanation: "let can be reassigned. TypeScript widens to the general type." },

  // ═══ Section 2: Numeric Enums ════════════════════════════════════════════

  // Q4 → correct:0
  { sectionIndex: 2, question: "Do enums generate JavaScript code?", options: ["Yes — enums are the only TS construct with runtime code", "No, Type Erasure", "Only String Enums", "I don't know"], correct: 0, briefExplanation: "Enums are the big exception to Type Erasure — they generate real JS objects." },

  // Q5 → correct:1
  { sectionIndex: 2, question: "What is Reverse Mapping in numeric enums?", options: ["Reverse values", "From numeric value back to name: Color[0] = 'Red'", "Sort enum", "I don't know"], correct: 1, briefExplanation: "Numeric enums have double entries: Name→Value AND Value→Name." },

  // Q6 → correct:2
  { sectionIndex: 2, question: "Can you assign Direction = 42 with enum Direction { Up, Down }?", options: ["No, error", "Only with as", "Yes — any number is allowed with numeric enums", "I don't know"], correct: 2, briefExplanation: "Known soundness hole: Numeric enums accept any number." },

  // ═══ Section 3: String Enums ════════════════════════════════════════════

  // Q7 → correct:0
  { sectionIndex: 3, question: "Do String Enums have Reverse Mapping?", options: ["No — only one-directional entries (Name→Value)", "Yes", "Only with as const", "I don't know"], correct: 0, briefExplanation: "String Enums have NO Reverse Mapping. Object.keys only returns the names." },

  // Q8 → correct:1
  { sectionIndex: 3, question: "Can you assign a string directly to a String Enum?", code: "enum Status { Active = 'ACTIVE' }\nconst s: Status = 'ACTIVE';", options: ["Yes, the value matches", "No — String Enums are nominally typed", "Only with as", "I don't know"], correct: 1, briefExplanation: "String Enums are nominal — only enum members (Status.Active) are assignable." },

  // Q9 → correct:2
  { sectionIndex: 3, question: "Do String Enum members need explicit values?", options: ["No, auto-increment", "Only the first", "Yes — String Enums have no auto-increment", "I don't know"], correct: 2, briefExplanation: "String Enums require an explicit string value for EVERY member." },

  // ═══ Section 4: Enums vs Union Literals ═════════════════════════════════

  // Q10 → correct:0
  { sectionIndex: 4, question: "What is the main advantage of Union Literals over Enums?", options: ["No runtime code (Type Erasure, Tree-Shakeable)", "Faster", "More members", "I don't know"], correct: 0, briefExplanation: "Union Literals disappear completely at compile time — zero bytes of JavaScript." },

  // Q11 → correct:1
  { sectionIndex: 4, question: "What is the main advantage of Enums over Union Literals?", options: ["More type-safe", "Runtime object for iteration and Reverse Mapping", "Faster", "I don't know"], correct: 1, briefExplanation: "Enums have a runtime object — you can iterate over all values." },

  // Q12 → correct:2
  { sectionIndex: 4, question: "What is the best alternative to Enums using as const?", code: "const Direction = { Up: 'UP', Down: 'DOWN' } as const;\ntype Direction = typeof Direction[keyof typeof Direction];", options: ["Union Literal Type", "Class with static properties", "as const object with same-named Type", "I don't know"], correct: 2, briefExplanation: "as const object + same-named Type = runtime object + Literal Union." },

  // ═══ Section 5: Template Literal Types ══════════════════════════════════

  // Q13 → correct:0
  { sectionIndex: 5, question: "What does `${A}-${B}` do at the type level when A and B are Unions?", options: ["Cartesian product of all combinations", "Concatenation", "Addition of members", "I don't know"], correct: 0, briefExplanation: "Every A variant is combined with every B variant — cartesian product." },

  // Q14 → correct:3
  { sectionIndex: 5, question: "What is the difference between Capitalize and Uppercase?", options: ["No difference", "Uppercase is deprecated", "No semantic difference, just naming", "Capitalize: first letter uppercase. Uppercase: EVERYTHING uppercase."], correct: 3, briefExplanation: "Capitalize<'hello'> = 'Hello'. Uppercase<'hello'> = 'HELLO'." },

  // Q15 → correct:2
  { sectionIndex: 5, question: "What does `on${string}` describe?", options: ["Only 'on'", "Any string starting with 'on'", "Any string", "I don't know"], correct: 1, briefExplanation: "${string} is a wildcard — accepts any string suffixes." },

  // ═══ Section 6: Patterns and Alternatives ═══════════════════════════════

  // Q16 → correct:3
  { sectionIndex: 6, question: "What is the main problem with const enum?", options: ["Too much code", "No string values", "Too few runtime objects", "Incompatible with isolatedModules (Vite, esbuild, Next.js)"], correct: 3, briefExplanation: "isolatedModules compiles individual files — cross-file const enum doesn't work." },

  // Q17 → correct:3
  { sectionIndex: 6, question: "What is a Branded Type?", code: "type EUR = number & { __brand: 'EUR' };", options: ["A type with a logo", "A class feature", "An alias mechanism", "An intersection trick for semantic type safety"], correct: 3, briefExplanation: "Branded Types prevent confusion between semantically different values." },

  // Q18 → correct:3
  { sectionIndex: 6, question: "Does the __brand property exist at runtime?", options: ["Yes", "Only in debug mode", "Only as WeakRef", "No — pure compile-time mechanism"], correct: 3, briefExplanation: "__brand is a type-level trick. At runtime the value is a normal number/string." },
];