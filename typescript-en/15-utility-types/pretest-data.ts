/**
 * Lesson 15 — Pre-Test Questions: Utility Types
 *
 * 3 questions per section (6 sections = 18 questions).
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
  // ═══ Section 1: Partial, Required, Readonly ════════════════════════════
  { sectionIndex: 1, question: "What does Partial<T> do?", options: ["Removes all properties", "Makes all properties optional", "Makes everything readonly", "I don't know"], correct: 1, briefExplanation: "Partial<T> adds ? to every property — all become optional." },
  { sectionIndex: 1, question: "What is the opposite of Partial?", options: ["Readonly", "Required", "Pick", "I don't know"], correct: 1, briefExplanation: "Required<T> removes ? from all properties — all become required fields." },
  { sectionIndex: 1, question: "Is Readonly<T> deep or shallow?", options: ["Deep", "Shallow — first level only", "Both depending on configuration", "I don't know"], correct: 1, briefExplanation: "Readonly is shallow — nested properties remain mutable." },

  // ═══ Section 2: Pick, Omit, Record ═════════════════════════════════════
  { sectionIndex: 2, question: "What does Pick<User, 'name' | 'email'> do?", options: ["Removes name and email", "Keeps only name and email", "Makes name and email optional", "I don't know"], correct: 1, briefExplanation: "Pick<T, K> creates a new type with ONLY the specified properties." },
  { sectionIndex: 2, question: "Does Omit detect typos in keys?", code: "type X = Omit<User, 'nmae'>; // typo", options: ["Yes, compile error", "No — Omit accepts any string", "Only in strict mode", "I don't know"], correct: 1, briefExplanation: "Omit is NOT type-safe with keys — any string is allowed." },
  { sectionIndex: 2, question: "What is Record<'a' | 'b', number>?", options: ["Object with keys a and b, values number", "Union 'a' | 'b'", "Array with 2 elements", "I don't know"], correct: 0, briefExplanation: "Record<K, V> creates an object type with K as keys and V as values." },

  // ═══ Section 3: Extract, Exclude, NonNullable ══════════════════════════
  { sectionIndex: 3, question: "What does Exclude<'a' | 'b' | 'c', 'a'> do?", options: ["'b' | 'c'", "'a'", "'a' | 'b' | 'c'", "I don't know"], correct: 0, briefExplanation: "Exclude removes 'a' from the union — 'b' | 'c' remains." },
  { sectionIndex: 3, question: "What is the difference between Extract and Exclude?", options: ["Extract keeps, Exclude removes matching members", "No difference", "Extract for objects, Exclude for unions", "I don't know"], correct: 0, briefExplanation: "Extract keeps assignable members, Exclude removes them." },
  { sectionIndex: 3, question: "What does NonNullable remove?", options: ["Only null", "Only undefined", "null AND undefined", "I don't know"], correct: 2, briefExplanation: "NonNullable<T> = Exclude<T, null | undefined> — removes both." },

  // ═══ Section 4: ReturnType, Parameters, Awaited ════════════════════════
  { sectionIndex: 4, question: "What does ReturnType<typeof fn> return when fn is async?", options: ["Promise<...>", "The unwrapped type", "void", "I don't know"], correct: 0, briefExplanation: "ReturnType returns Promise<...> for async functions. For the inner type, add Awaited." },
  { sectionIndex: 4, question: "Why do you need typeof in ReturnType<typeof myFunc>?", options: ["ReturnType expects a type, typeof extracts it from the value", "It's optional", "typeof makes it faster", "I don't know"], correct: 0, briefExplanation: "myFunc is a value. ReturnType expects a type. typeof is the bridge." },
  { sectionIndex: 4, question: "What does Awaited<Promise<Promise<string>>> produce?", options: ["Promise<string>", "Error", "string", "I don't know"], correct: 2, briefExplanation: "Awaited unwraps Promises recursively — all levels, not just one." },

  // ═══ Section 5: Custom Utility Types ════════════════════════════════════
  { sectionIndex: 5, question: "Why is Partial<T> not recursive (deep)?", options: ["Bug in TypeScript", "TypeScript can't do recursion", "Deliberate design decision — too many edge cases", "I don't know"], correct: 2, briefExplanation: "Too many edge cases (Arrays, Maps, Dates). Developers build their own deep variant." },
  { sectionIndex: 5, question: "What does -readonly do in a mapped type?", options: ["Adds readonly", "Syntax error", "Removes readonly", "I don't know"], correct: 2, briefExplanation: "- removes the modifier. -readonly removes readonly, -? removes optional." },
  { sectionIndex: 5, question: "What is the pattern for custom utility types?", options: ["Generics only", "I don't know", "Conditional types only", "Mapped Type + Conditional Type + Recursion"], correct: 3, briefExplanation: "Mapped Type iterates over keys, Conditional Type checks conditions, Recursion goes deep." },

  // ═══ Section 6: Combining Utility Types ═══════════════════════════════════
  { sectionIndex: 6, question: "What is Pick<T,K> & Partial<Omit<T,K>>?", options: ["Everything optional", "I don't know", "Everything required", "K stays required, rest optional"], correct: 3, briefExplanation: "Pick keeps K as in the original, Partial<Omit> makes the rest optional. THE update pattern." },
  { sectionIndex: 6, question: "What use case is Omit<T, ServerKeys> ideal for?", options: ["Delete operations", "I don't know", "Read operations", "Create input types (omitting server-generated fields)"], correct: 3, briefExplanation: "In create operations the server sets id, createdAt etc. — these don't belong in the input." },
  { sectionIndex: 6, question: "What is Record<keyof T, string> in a form context?", options: ["An array of strings", "I don't know", "A type assertion", "A string value for every field of T (e.g. error map)"], correct: 3, briefExplanation: "Record<keyof T, string> creates a string for every field — ideal for error messages." },
];