/**
 * Lesson 20 — Pre-Test Questions: Review Challenge Phase 2
 */
export interface PretestQuestion { sectionIndex: number; question: string; options: string[]; correct: number; briefExplanation: string; }

export const pretestQuestions: PretestQuestion[] = [
  { sectionIndex: 1, question: "What are the three pillars of the TypeScript type system? (Phase 2)", options: ["Strings, Numbers, Booleans", "Type Narrowing, Generics, Type-Level Programming", "Classes, Interfaces, Enums", "I don't know"], correct: 1, briefExplanation: "Narrowing (L11-12), Generics (L13-15), Type-Level (L16-18) are the three pillars." },
  { sectionIndex: 1, question: "What do Mapped Types + Conditional Types combine?", options: ["Nothing", "Selective property transformation: change some, keep others", "Runtime checks", "I don't know"], correct: 1, briefExplanation: "Conditional in Mapped Type enables per-property decisions." },
  { sectionIndex: 1, question: "What do Template Literals + Mapped Types combine?", options: ["Strings", "Automatic getter/setter/event name generation", "Errors", "I don't know"], correct: 1, briefExplanation: "Template Literal in Key Remapping generates new key names from properties." },
  { sectionIndex: 2, question: "Can you implement DeepPartial<T>?", options: ["Yes, definitely", "I think so", "Unsure", "I don't know"], correct: 0, briefExplanation: "DeepPartial requires recursion + function guard + Mapped Type with ?." },
  { sectionIndex: 2, question: "Can you use infer to extract types?", options: ["Yes, definitely", "I think so", "Unsure", "I don't know"], correct: 0, briefExplanation: "infer in extends pattern extracts type parts: Promise<infer U>, (...args) => infer R." },
  { sectionIndex: 2, question: "Can you write Module Augmentation?", options: ["Yes, definitely", "I think so", "Unsure", "I don't know"], correct: 0, briefExplanation: "declare module + Interface Merging + export {} for augmentation." },
  { sectionIndex: 2, question: "Do you understand distributive Conditional Types?", options: ["Yes", "Partially", "No", "I don't know"], correct: 0, briefExplanation: "Bare type parameter + Union = distribution over each member." },
  { sectionIndex: 2, question: "Can you use Key Remapping with Template Literals?", options: ["No", "Partially", "Yes", "I don't know"], correct: 2, briefExplanation: "as `get${Capitalize<K>}` in Mapped Type for key transformation." },
  { sectionIndex: 2, question: "Can you write Declaration Files?", options: ["No", "Partially", "Yes", "I don't know"], correct: 2, briefExplanation: "declare module, declare const, .d.ts for external types." },
  { sectionIndex: 3, question: "What comes first in Phase 3?", options: ["React", "Classes & OOP", "Decorators", "I don't know"], correct: 1, briefExplanation: "L21 covers Classes, Access Modifiers, Abstract Classes and Generic Classes." },
  { sectionIndex: 3, question: "What are Decorators used for?", options: ["Styling", "I don't know", "Type Guards", "Metaprogramming: extending classes/methods at runtime"], correct: 3, briefExplanation: "Decorators modify classes, methods and properties — e.g. for logging, validation, DI." },
  { sectionIndex: 3, question: "Which frameworks are covered in Phase 3?", options: ["jQuery", "I don't know", "Vue, Svelte", "Angular, React, Next.js"], correct: 3, briefExplanation: "Angular (work), React/Next.js (private) — matching your profile." },
  { sectionIndex: 2, question: "Can you explain Extract and Exclude?", options: ["No", "Partially", "Yes", "I don't know"], correct: 2, briefExplanation: "Extract keeps, Exclude removes Union members. Both are distributive." },
  { sectionIndex: 2, question: "Can you write Recursive Types?", options: ["No", "Partially", "Yes", "I don't know"], correct: 2, briefExplanation: "Flatten<T>, DeepAwaited<T>, DeepReadonly<T> — type references itself." },
  { sectionIndex: 2, question: "Do you understand the difference between import and import type?", options: ["I don't know", "Partially", "No", "Yes"], correct: 3, briefExplanation: "import type is removed at compile time. import remains in JS." },
];