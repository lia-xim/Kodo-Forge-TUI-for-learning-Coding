/**
 * Lesson 16 — Pre-Test Questions: Mapped Types
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
  // ═══ Section 1: Fundamentals ══════════════════════════════════════════════
  { sectionIndex: 1, question: "What does `{ [K in keyof T]?: T[K] }` produce?", options: ["A Readonly type", "Partial<T> — all properties optional", "A new type with no properties", "I don't know"], correct: 1, briefExplanation: "The ? makes every property optional — just like Partial<T>." },
  { sectionIndex: 1, question: "What does `-?` do in a Mapped Type?", options: ["Adds optional", "Removes optional — makes properties required", "Removes the property", "I don't know"], correct: 1, briefExplanation: "-? removes the optional modifier — that's how Required<T> works." },
  { sectionIndex: 1, question: "What are homomorphic Mapped Types?", options: ["Recursive Mapped Types", "Mapped Types that use keyof T and preserve original modifiers", "Mapped Types with Conditionals", "I don't know"], correct: 1, briefExplanation: "Homomorphic = structure-preserving. keyof T as source preserves readonly and optional." },

  // ═══ Section 2: Key Remapping ═════════════════════════════════════════════
  { sectionIndex: 2, question: "What does the `as` clause do in Mapped Types?", options: ["Type Assertion", "Key Remapping — rename or filter keys", "Type Guard", "I don't know"], correct: 1, briefExplanation: "as enables Key Remapping: rename, generate, or filter keys." },
  { sectionIndex: 2, question: "What happens when Key Remapping results in `never`?", options: ["The key is removed", "The type becomes never", "Compile error", "I don't know"], correct: 0, briefExplanation: "never in Key Remapping = key is removed from the result type." },
  { sectionIndex: 2, question: "How do you generate getter method names with Mapped Types?", options: ["With Template Literal Types: `get${Capitalize<K>}`", "With string concatenation", "Not possible", "I don't know"], correct: 0, briefExplanation: "Template Literal Types in Key Remapping generate dynamic names." },

  // ═══ Section 3: Custom Utility Types ══════════════════════════════════════
  { sectionIndex: 3, question: "How do you build Mutable<T> (the opposite of Readonly)?", options: ["With -readonly: { -readonly [K in keyof T]: T[K] }", "With +readonly", "Not possible", "I don't know"], correct: 0, briefExplanation: "-readonly removes the readonly modifier from all properties." },
  { sectionIndex: 3, question: "What does DeepPartial do differently than Partial?", options: ["Applies recursively to nested objects", "Nothing", "Removes properties", "I don't know"], correct: 0, briefExplanation: "DeepPartial checks whether T[K] is an object and then applies itself recursively." },
  { sectionIndex: 3, question: "What is PartialBy<T, K>?", options: ["Partial for all keys", "Removes the keys", "Makes only the specified keys optional, the rest remain required", "I don't know"], correct: 2, briefExplanation: "PartialBy = Omit<T, K> & Partial<Pick<T, K>> — selective optional." },

  // ═══ Section 4: Conditional Mapped Types ══════════════════════════════════
  { sectionIndex: 4, question: "What does `[K in keyof T]: T[K] extends number ? string : T[K]` do?", options: ["Everything becomes string", "Removes number properties", "Only number properties become string, the rest stays", "I don't know"], correct: 2, briefExplanation: "The Conditional Type checks PER property: if number, then string, otherwise unchanged." },
  { sectionIndex: 4, question: "What is OmitByType<T, U>?", options: ["Removes keys named U", "Makes U properties optional", "Removes all properties whose value type is U", "I don't know"], correct: 2, briefExplanation: "OmitByType filters by value type instead of key name — using never in Key Remapping." },
  { sectionIndex: 4, question: "How do you check whether a property is optional?", options: ["T[K] === undefined", "K extends optional", "`undefined extends T[K]` or `{} extends Pick<T, K>`", "I don't know"], correct: 2, briefExplanation: "undefined extends T[K] is true for optional properties because they implicitly include undefined." },

  // ═══ Section 5: Practical Patterns ═══════════════════════════════════════
  { sectionIndex: 5, question: "What is the most common practical pattern for Mapped Types?", options: ["Array transformation", "I don't know", "Recursive types", "Form types: FormErrors<T>, FormTouched<T>, FormDirty<T>"], correct: 3, briefExplanation: "Forms always need companion types — Mapped Types derive them automatically." },
  { sectionIndex: 5, question: "What does CreateDTO<T extends Entity> = Omit<T, keyof Entity> do?", options: ["Copies Entity", "I don't know", "Adds Entity fields", "Removes auto-generated fields (id, timestamps) for POST requests"], correct: 3, briefExplanation: "Omit<T, keyof Entity> removes the server-generated fields for create operations." },
  { sectionIndex: 5, question: "How do you generate change events from a type?", options: ["Define manually", "I don't know", "Not possible", "With EventMap<T> that uses Template Literal Keys for {K}Changed"], correct: 3, briefExplanation: "Template Literal Keys in Key Remapping automatically generate event names from property names." },
];