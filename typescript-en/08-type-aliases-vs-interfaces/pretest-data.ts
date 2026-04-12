/**
 * Lesson 08 — Pre-Test Questions: Type Aliases vs Interfaces
 *
 * 3 questions per section (5 sections = 15 questions).
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
  // ═══ Section 1: Type Aliases Deep Dive ══════════════════════════════════
  { sectionIndex: 1, question: "Does `type UserID = string` create a new, independent type?", options: ["Yes", "No — just an alias/nickname", "Only in strict mode", "I don't know"], correct: 1, briefExplanation: "Type aliases don't create a new type. UserID IS string — just with a different name." },
  { sectionIndex: 1, question: "Can type aliases describe union types?", options: ["No, only interfaces", "Yes — type A = B | C", "Only with a workaround", "I don't know"], correct: 1, briefExplanation: "Union types are a core feature of type. Interfaces cannot do this." },
  { sectionIndex: 1, question: "What are mapped types?", code: "type Readonly<T> = { readonly [K in keyof T]: T[K] };", options: ["A pattern for for-loops", "Types that iterate over properties and transform them", "An interface feature", "I don't know"], correct: 1, briefExplanation: "Mapped types transform properties — e.g. making them all readonly or optional. Only possible with type." },

  // ═══ Section 2: Interfaces Deep Dive ════════════════════════════════════
  { sectionIndex: 2, question: "What happens when you declare an interface twice?", options: ["Error — duplicate declaration", "Declaration merging — both are merged together", "The second one overwrites the first", "I don't know"], correct: 1, briefExplanation: "Declaration merging combines properties from all interface declarations with the same name." },
  { sectionIndex: 2, question: "What does `implements` do for a class?", options: ["Checks whether the class satisfies the interface shape (compile time)", "Inherits methods from the interface", "Generates runtime code", "I don't know"], correct: 0, briefExplanation: "implements inherits nothing — it is a pure compile-time check. The class must implement everything itself." },
  { sectionIndex: 2, question: "Can an interface extend another?", code: "interface Admin extends User { ... }", options: ["Yes, with extends — Admin inherits all properties from User", "No, extends is only for classes", "Only with intersection", "I don't know"], correct: 0, briefExplanation: "Interfaces can extend other interfaces with extends. All properties are inherited." },

  // ═══ Section 3: The Big Comparison ════════════════════════════════════════
  { sectionIndex: 3, question: "What can type do that interface CANNOT?", options: ["Union types, mapped types, conditional types, tuples", "Describe objects", "Define methods", "I don't know"], correct: 0, briefExplanation: "type is the all-purpose tool for everything beyond object shapes." },
  { sectionIndex: 3, question: "What can interface do that type CANNOT?", options: ["Declaration merging", "Describe functions", "Use generics", "I don't know"], correct: 0, briefExplanation: "Declaration merging is the unique selling point of interfaces." },
  { sectionIndex: 3, question: "What is faster for the compiler: extends or &?", options: ["No difference", "& — simpler evaluation", "extends — is cached and reports conflicts early", "I don't know"], correct: 2, briefExplanation: "extends is more efficient (cached) and reports conflicts as errors instead of silent never properties." },

  // ═══ Section 4: Decision Matrix ══════════════════════════════════════════
  { sectionIndex: 4, question: "What is the most important rule when choosing type vs interface?", options: ["Always use type", "Always use interface", "Team consistency — the choice matters less than uniformity", "I don't know"], correct: 2, briefExplanation: "Consistency is more important than the 'perfect' choice. ESLint can enforce this." },
  { sectionIndex: 4, question: "When MUST you use type?", options: ["For objects", "Always", "For union types, mapped types, conditional types", "I don't know"], correct: 2, briefExplanation: "These type constructs are only possible with type." },
  { sectionIndex: 4, question: "When MUST you use interface?", options: ["For all object types", "Never — type can do everything", "For declaration merging (e.g. library augmentation)", "I don't know"], correct: 2, briefExplanation: "Declaration merging only works with interface. For library augmentation it is mandatory." },

  // ═══ Section 5: Patterns and Best Practices ══════════════════════════════
  { sectionIndex: 5, question: "What does the Angular Style Guide prefer?", options: ["Always type", "I don't know", "Never interfaces", "interface for object types (services, DTOs)"], correct: 3, briefExplanation: "Angular prefers interfaces for most object types — because of DI and extends." },
  { sectionIndex: 5, question: "What does the React community prefer?", options: ["interface for everything", "I don't know", "No preference", "type — because of unions and functional style"], correct: 3, briefExplanation: "React uses many unions and functional patterns — type fits better." },
  { sectionIndex: 5, question: "Which tool enforces team-wide consistency?", options: ["TypeScript compiler", "I don't know", "Prettier", "ESLint with consistent-type-definitions"], correct: 3, briefExplanation: "ESLint can enforce whether type or interface is always used for object types." },
];