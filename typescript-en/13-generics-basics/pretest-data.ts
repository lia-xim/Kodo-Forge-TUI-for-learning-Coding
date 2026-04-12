/**
 * Lesson 13 — Pre-Test Questions: Generics Basics
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
  // ═══ Section 1: Why Generics ════════════════════════════════════════════
  { sectionIndex: 1, question: "What is the core problem that generics solve?", options: ["Performance", "Code duplication across different types WITHOUT losing type safety", "Memory usage", "I don't know"], correct: 1, briefExplanation: "Generics avoid duplication (one function per type) and any (type safety gone)." },
  { sectionIndex: 1, question: "What does <T> mean on a function?", options: ["T is a concrete type", "T is a type parameter — a placeholder", "T is always string", "I don't know"], correct: 1, briefExplanation: "T is a placeholder that gets replaced with the concrete type at the call site." },
  { sectionIndex: 1, question: "Why is any a poor solution for generic code?", options: ["any is slow", "any disables the TypeScript compiler — no error detection", "any doesn't exist", "I don't know"], correct: 1, briefExplanation: "any allows EVERYTHING — TypeScript can no longer detect any errors." },

  // ═══ Section 2: Generic Functions ══════════════════════════════════════
  { sectionIndex: 2, question: "What is the type of result in `const result = identity(42)`?", code: "function identity<T>(arg: T): T { return arg; }", options: ["any", "number", "string", "I don't know"], correct: 1, briefExplanation: "TypeScript infers T = number from the argument 42." },
  { sectionIndex: 2, question: "When must the type parameter be specified explicitly?", options: ["Always", "When T cannot be inferred from the arguments", "Never — inference always works", "I don't know"], correct: 1, briefExplanation: "When T only appears in the return type (not in parameters), it must be specified explicitly." },
  { sectionIndex: 2, question: "How do you write an arrow function with generics?", options: ["const f = <T>(arg: T): T => arg", "<T> => (arg: T): T", "(T) => arg: T", "I don't know"], correct: 0, briefExplanation: "The type parameter goes before the parameter list: <T>(arg: T): T => arg." },

  // ═══ Section 3: Generic Interfaces and Types ════════════════════════════
  { sectionIndex: 3, question: "What is the difference between Box<string> and Box<number>?", code: "interface Box<T> { content: T; label: string; }", options: ["content has different types — string and number respectively", "No difference", "label has different types", "I don't know"], correct: 0, briefExplanation: "T gets substituted: Box<string> has content: string, Box<number> has content: number." },
  { sectionIndex: 3, question: "Are number[] and Array<number> the same type?", options: ["Yes — number[] is syntactic sugar for Array<number>", "No, they are different types", "Only in strict mode", "I don't know"], correct: 0, briefExplanation: "number[] and Array<number> are exactly the same type — just different syntax." },
  { sectionIndex: 3, question: "Can a generic interface have multiple type parameters?", options: ["Yes — e.g. Map<K, V> has two", "No, only one", "Only on classes", "I don't know"], correct: 0, briefExplanation: "Any number of type parameters is possible: Map<K, V>, Record<K, V>, etc." },

  // ═══ Section 4: Constraints ═════════════════════════════════════════════
  { sectionIndex: 4, question: "What does `T extends { length: number }` do?", options: ["T must have at least a length property of type number", "T becomes number", "T is always string", "I don't know"], correct: 0, briefExplanation: "extends on a type parameter is a constraint — a minimum requirement for T." },
  { sectionIndex: 4, question: "What does `K extends keyof T` mean?", options: ["K is any arbitrary string", "K extends T", "K must be a valid key of type T", "I don't know"], correct: 2, briefExplanation: "keyof T produces the union of all keys. K must be one of them." },
  { sectionIndex: 4, question: "How do you combine two constraints?", options: ["T extends A, B", "T extends A extends B", "T extends A & B", "I don't know"], correct: 2, briefExplanation: "Intersection type &: T extends A & B means T must satisfy BOTH." },

  // ═══ Section 5: Default Type Parameters ════════════════════════════════
  { sectionIndex: 5, question: "What does `<T = string>` do on a type parameter?", options: ["T is always string", "T can only be string", "If T is not specified, the default is string", "I don't know"], correct: 2, briefExplanation: "The default is used when T is not provided at the call/usage site." },
  { sectionIndex: 5, question: "May type parameters with a default appear BEFORE those without?", code: "interface Cache<K = string, V> { ... }", options: ["Yes", "Only on type aliases", "No — defaults must come last", "I don't know"], correct: 2, briefExplanation: "Same rule as function parameters: required before optional." },
  { sectionIndex: 5, question: "Must the default type satisfy the constraint?", code: "interface Box<T extends object = string> { ... }", options: ["No, defaults ignore constraints", "I don't know", "Constraints and defaults are independent", "Yes — string does not satisfy object, so this is an error"], correct: 3, briefExplanation: "The default type MUST satisfy the constraint. string extends object is false." },

  // ═══ Section 6: Generics in Practice ════════════════════════════════════
  { sectionIndex: 6, question: "Why must you specify the type explicitly in `useState<User | null>(null)`?", options: ["React convention", "I don't know", "You don't have to", "Without it T = null — too narrow for later setUser calls"], correct: 3, briefExplanation: "Without <User | null>, T = null. Calling setUser({name: 'Max'}) would fail." },
  { sectionIndex: 6, question: "What is Promise<string>?", options: ["A string that is a Promise", "I don't know", "A generic string", "A Promise that resolves to a string"], correct: 3, briefExplanation: "Promise<T> carries the type of the resolved value. Promise<string> → await yields string." },
  { sectionIndex: 6, question: "What do K and V stand for in Map<K, V>?", options: ["Class and Variable", "I don't know", "Constant and Void", "Key and Value — the key type and value type"], correct: 3, briefExplanation: "K = Key (key type), V = Value (value type). Map<string, number> → string keys, number values." },
];