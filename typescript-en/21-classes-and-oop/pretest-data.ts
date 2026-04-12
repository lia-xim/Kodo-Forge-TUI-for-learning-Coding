/**
 * Lesson 21 — Pre-Test Questions: Classes & OOP
 *
 * 3 questions per section (6 sections = 18 questions).
 * Goal: "Prime" the brain for the upcoming explanation.
 */

export interface PretestQuestion {
  /** Which section the question refers to (1-based) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Brief explanation (only becomes relevant AFTER the section) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Section 1: Class Basics ──────────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "What happens when you declare a class with a field 'name: string', " +
      "but have NO constructor and assign nothing?",
    code: "class User {\n  name: string;\n}",
    options: [
      "No problem, name is automatically an empty string",
      "Compile error: Property has no initializer",
      "name is undefined at runtime, but TypeScript doesn't warn",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "With strictPropertyInitialization (part of strict: true), TypeScript reports " +
      "an error: Every field must either have a default value, be optional " +
      "(?), or be assigned in the constructor.",
  },
  {
    sectionIndex: 1,
    question:
      "Do TypeScript classes exist at runtime, or do they disappear like interfaces?",
    options: [
      "They disappear completely (type erasure)",
      "They remain as JavaScript constructor functions",
      "Only abstract classes disappear",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "Classes are preserved as JavaScript constructor functions. " +
      "Only TypeScript-specific additions (type annotations, " +
      "access modifiers) are removed. That's why 'instanceof' works.",
  },
  {
    sectionIndex: 1,
    question:
      "What do you think: Can a plain object (no 'new MyClass()') be used as " +
      "a class instance?",
    code:
      "class Point { x: number = 0; y: number = 0; }\n" +
      "function print(p: Point) { console.log(p.x); }\n" +
      "print({ x: 1, y: 2 }); // Does this work?",
    options: [
      "No, it must be 'new Point()'",
      "Yes, due to structural typing — the same structure is enough",
      "Only with a cast (as Point)",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript uses structural typing: If an object has the same " +
      "structure as the class, it fits. No 'new' needed, " +
      "no 'implements' needed.",
  },

  // ─── Section 2: Access Modifiers ────────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Can you access a 'private' field at runtime, " +
      "e.g. with '(obj as any).field'?",
    options: [
      "No, private is also protected at runtime",
      "Yes, because private is only a compile-time feature (type erasure)",
      "Only for public fields",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript's 'private' only exists at compile time. " +
      "At runtime, the field is a normal JS property. " +
      "With 'as any' you bypass the type system.",
  },
  {
    sectionIndex: 2,
    question:
      "JavaScript has had its own private feature since ES2022: #private. " +
      "How does it differ from TypeScript's private?",
    code:
      "class A { private ts = 1; }\n" +
      "class B { #js = 1; }",
    options: [
      "No difference, both are private at runtime",
      "#private remains private at runtime, private (TS) is removed",
      "private (TS) is stronger than #private (JS)",
      "I don't know",
    ],
    correct: 1,
    briefExplanation:
      "#private (ES2022) is true runtime encapsulation — not even " +
      "accessible with 'as any'. TypeScript's 'private' is removed " +
      "during compilation.",
  },
  {
    sectionIndex: 2,
    question:
      "Which modifier allows access in subclasses, but not from outside?",
    options: [
      "protected",
      "private",
      "readonly",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "'protected' allows access in the class itself and in subclasses, " +
      "but not from outside. 'private' only allows access within the class itself.",
  },

  // ─── Section 3: Inheritance and Abstract Classes ─────────────────────────

  {
    sectionIndex: 3,
    question:
      "Can an abstract class also have concrete methods (with a body)?",
    options: [
      "Yes, an abstract class can have both abstract AND concrete methods",
      "No, all methods must be abstract",
      "Only static methods can be concrete",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "Abstract classes can have both abstract (without body, must " +
      "be implemented) and concrete (with body, are inherited) " +
      "methods. That's their advantage over interfaces.",
  },
  {
    sectionIndex: 3,
    question:
      "What happens when you call 'new AbstractClass()'?",
    options: [
      "Compile error — abstract classes cannot be instantiated",
      "It works — an abstract class is a normal class",
      "Runtime error — it is only thrown at runtime",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript prevents the instantiation of abstract classes " +
      "at compile time. Only subclasses that implement all abstract methods " +
      "can be instantiated.",
  },
  {
    sectionIndex: 3,
    question:
      "TypeScript 4.3 introduced the 'override' keyword. " +
      "What happens with 'override rendr()' when the parent class has 'render()'?",
    options: [
      "Compile error — 'rendr' does not exist in the parent class",
      "Compiles — override is just a hint",
      "Runtime error when called",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "'override' checks whether the method actually exists in the parent class. " +
      "With a typo (rendr instead of render), TypeScript immediately reports an error.",
  },

  // ─── Section 4: Implementing Interfaces ──────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Does a class inherit code when it uses an interface with 'implements'?",
    options: [
      "Yes, implements is like extends",
      "Only static methods are inherited",
      "No, implements inherits no code — only the contract",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "'implements' inherits NO code. It is only a compile-time promise: " +
      "'I have all the members of the interface.' You must write the code yourself.",
  },
  {
    sectionIndex: 4,
    question:
      "Can a class implement multiple interfaces at the same time?",
    options: [
      "No, only one interface per class",
      "Only with extends, not with implements",
      "Yes, separated by commas: implements A, B, C",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Yes! A class can implement any number of interfaces " +
      "(implements A, B, C). Unlike extends (only ONE parent class).",
  },
  {
    sectionIndex: 4,
    question:
      "Do you even need to write 'implements' when TypeScript " +
      "uses structural typing?",
    options: [
      "Yes, without implements the code won't compile",
      "It is required in strict mode",
      "No, but it provides earlier error messages and better documentation",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "Structural typing makes 'implements' technically optional. " +
      "But 'implements' provides earlier error messages (when writing " +
      "the class, not only when using it), better IDE support " +
      "and documentation of intent.",
  },

  // ─── Section 5: Static Members and Patterns ────────────────────────────

  {
    sectionIndex: 5,
    question:
      "What does 'this' refer to in a static method?",
    options: [
      "To the current instance",
      "this is not available in static methods",
      "To the class itself (not an instance)",
      "I don't know",
    ],
    correct: 2,
    briefExplanation:
      "In static methods, 'this' refers to the CLASS, not to " +
      "an instance. This makes sense: static members belong to the class, " +
      "not to individual instances.",
  },
  {
    sectionIndex: 5,
    question:
      "What does 'constructor(public name: string)' do in TypeScript?",
    options: [
      "Just a parameter — no field is created",
      "I don't know",
      "Is a syntax error",
      "Automatically creates a field 'name' and assigns the value",
    ],
    correct: 3,
    briefExplanation:
      "Parameter properties: A modifier (public/private/protected/readonly) " +
      "before a constructor parameter automatically declares a field " +
      "and assigns the value. Saves three lines of code.",
  },
  {
    sectionIndex: 5,
    question:
      "Why does the singleton pattern have a private constructor?",
    options: [
      "To prevent 'new' from being called from outside",
      "Because private constructors are faster",
      "To block the constructor for subclasses",
      "I don't know",
    ],
    correct: 0,
    briefExplanation:
      "A private constructor prevents 'new MyClass()' from outside. " +
      "Only the class itself (via static getInstance()) can create instances " +
      "— this ensures that only ONE instance exists.",
  },

  // ─── Section 6: Classes in Practice ──────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Why did React switch from class components to hooks?",
    options: [
      "Because classes in JavaScript are too slow",
      "I don't know",
      "Because TypeScript doesn't support class components",
      "Because of this-binding issues, poor code organization, and difficult code reuse",
    ],
    correct: 3,
    briefExplanation:
      "React identified three problems: 1) this-binding confusion, " +
      "2) related logic spread across lifecycle methods, " +
      "3) code sharing via HOCs was cumbersome. Hooks solve all three.",
  },
  {
    sectionIndex: 6,
    question:
      "Why does 'const fn = obj.method; fn()' lose the this context?",
    code: "class T { x = 1; show() { console.log(this.x); } }\n" +
          "const t = new T();\nconst fn = t.show;\nfn(); // ???",
    options: [
      "Because fn is a copy of the function, not a reference",
      "I don't know",
      "Because class methods cannot be stored in variables",
      "Because JavaScript determines 'this' based on the call context",
    ],
    correct: 3,
    briefExplanation:
      "JavaScript determines 'this' dynamically at the time of the call. " +
      "'obj.method()' → this=obj. 'fn()' → this=undefined (strict mode). " +
      "The method has no fixed bound 'this'.",
  },
  {
    sectionIndex: 6,
    question:
      "What is the advantage of composition over inheritance?",
    options: [
      "Composition is faster at runtime",
      "I don't know",
      "Composition only works in TypeScript, not in JavaScript",
      "Composition allows flexible combination of capabilities without tight coupling",
    ],
    correct: 3,
    briefExplanation:
      "Composition ('has-a') is more flexible than inheritance ('is-a'): " +
      "Capabilities can be independently combined, swapped, and " +
      "tested. No rigid inheritance hierarchy.",
  },
];