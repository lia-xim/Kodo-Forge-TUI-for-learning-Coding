// pretest-data.ts — L28: Decorators (Legacy & Stage 3)
// 18 questions (3 per section)

export interface PretestQuestion {
  sectionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const pretestData: PretestQuestion[] = [
  // ─── Section 1: Decorator Basics ─────────────────────────────────────

  {
    sectionId: 1,
    question: "What is a TypeScript decorator?",
    options: [
      "A special CSS property",
      "A function that precedes a declaration with @ and transforms it",
      "A TypeScript compiler plugin",
      "I don't know",
    ],
    correct: 1,
    explanation: "Decorators are functions that transform or annotate classes, methods, or properties.",
  },
  {
    sectionId: 1,
    question: "Are there different decorator standards in TypeScript?",
    options: [
      "No, there is only one standard",
      "Yes, Legacy (experimentalDecorators) and Stage 3 (from TS 5.0)",
      "Yes, but only Stage 3 works",
      "I don't know",
    ],
    correct: 1,
    explanation: "Legacy (experimentalDecorators) is used by Angular/NestJS. Stage 3 is the upcoming TC39 standard.",
  },
  {
    sectionId: 1,
    question: "Which framework uses decorators most heavily?",
    options: [
      "React — @Component for all components",
      "Angular — @Component, @Injectable, @Input etc.",
      "Vue — @Setup for the Composition API",
      "I don't know",
    ],
    correct: 1,
    explanation: "Angular is fundamentally built on decorators: @Component, @Injectable, @Input, @Output, @ViewChild, etc.",
  },

  // ─── Section 2: Class Decorators ────────────────────────────────────────

  {
    sectionId: 2,
    question: "What does a class decorator receive as its parameter?",
    options: [
      "An instance of the class",
      "The constructor of the class",
      "The TypeScript compiler",
      "I don't know",
    ],
    correct: 1,
    explanation: "Class decorators receive the constructor — they can transform, seal, or extend the class.",
  },
  {
    sectionId: 2,
    question: "What is a decorator factory?",
    options: [
      "A factory that creates classes",
      "A function that returns a decorator — enables parameters",
      "A design pattern for factories",
      "I don't know",
    ],
    correct: 1,
    explanation: "@Component({...}) — Component() is the factory, the return value is the decorator.",
  },
  {
    sectionId: 2,
    question: "In what order are @A @B class X decorators applied?",
    options: [
      "B first, then A (bottom-up)",
      "A first, then B (top-down)",
      "Simultaneously",
      "I don't know",
    ],
    correct: 0,
    explanation: "Bottom-up: B (closer to the code) is applied first, then A.",
  },

  // ─── Section 3: Method and Property Decorators ──────────────────────────

  {
    sectionId: 3,
    question: "What are method decorators particularly well-suited for?",
    options: [
      "Cross-cutting concerns like logging, caching, and retry",
      "Database access",
      "Defining classes",
      "I don't know",
    ],
    correct: 0,
    explanation: "Method decorators wrap methods — ideal for concerns that cut across the codebase.",
  },
  {
    sectionId: 3,
    question: "What does a legacy method decorator receive as its third parameter?",
    options: [
      "A PropertyDescriptor with the method in 'value'",
      "The return value of the method",
      "The class as a whole",
      "I don't know",
    ],
    correct: 0,
    explanation: "PropertyDescriptor has value (the method), writable, enumerable, configurable.",
  },
  {
    sectionId: 3,
    question: "What is the difference between method and property decorators?",
    options: [
      "Method decorators receive a PropertyDescriptor, property decorators do not",
      "No difference — both work the same way",
      "Property decorators can only be applied to classes",
      "I don't know",
    ],
    correct: 0,
    explanation: "Method decorators receive the descriptor (can wrap), property decorators do not (must use Object.defineProperty).",
  },

  // ─── Section 4: Parameter Decorators ────────────────────────────────────

  {
    sectionId: 4,
    question: "Can parameter decorators change the parameter value?",
    options: [
      "No, they can only store metadata",
      "Yes, like all decorators",
      "Only in Stage 3",
      "I don't know",
    ],
    correct: 0,
    explanation: "Parameter decorators run at class definition time, not at call time. They only store metadata.",
  },
  {
    sectionId: 4,
    question: "What does emitDecoratorMetadata do?",
    options: [
      "It generates .d.ts files",
      "It enables Stage 3 decorators",
      "It emits type information as runtime metadata for DI",
      "I don't know",
    ],
    correct: 2,
    explanation: "emitDecoratorMetadata generates Reflect.metadata() calls that store type information as values.",
  },
  {
    sectionId: 4,
    question: "When do you need @Inject() in Angular?",
    options: [
      "Always — for every constructor parameter",
      "Never — Angular recognizes all types automatically",
      "When the type is ambiguous (primitive types or InjectionTokens)",
      "I don't know",
    ],
    correct: 2,
    explanation: "@Inject() is only needed when emitDecoratorMetadata cannot infer the type (e.g. string, InjectionToken).",
  },

  // ─── Section 5: Stage 3 vs Legacy ──────────────────────────────────────

  {
    sectionId: 5,
    question: "What is the main difference of the Stage 3 API compared to Legacy?",
    options: [
      "Stage 3 is slower",
      "Stage 3 only works in Node.js",
      "Stage 3 has 2 parameters (target, context) instead of 3 and a structured context object",
      "I don't know",
    ],
    correct: 2,
    explanation: "Stage 3: target + context (structured). Legacy: target + propertyKey + descriptor (3 separate values).",
  },
  {
    sectionId: 5,
    question: "What is the 'accessor' keyword in Stage 3 decorators?",
    options: [
      "An alias for 'get'",
      "I don't know",
      "A new access modifier like private",
      "Automatically creates getter/setter for a property — enables accessor decorators",
    ],
    correct: 3,
    explanation: "'accessor name: string' creates auto-get/set. Accessor decorators can then customize get/set.",
  },
  {
    sectionId: 5,
    question: "Does Stage 3 have parameter decorators?",
    options: [
      "Yes, an improved version",
      "I don't know",
      "Only for constructor parameters",
      "No, TC39 removed them from the specification",
    ],
    correct: 3,
    explanation: "Stage 3 has no parameter decorators. Alternatives: inject() function, tokens, explicit metadata.",
  },

  // ─── Section 6: Practice (Angular/NestJS) ─────────────────────────────────

  {
    sectionId: 6,
    question: "What is the recommended pattern for custom NestJS decorators?",
    options: [
      "Implement business logic directly in the decorator",
      "I don't know",
      "Manage global state in the decorator",
      "Set metadata with SetMetadata() and read it in guards/interceptors",
    ],
    correct: 3,
    explanation: "Decorator = set metadata. Guard = read and check metadata. Separation of concerns.",
  },
  {
    sectionId: 6,
    question: "Why are decorators less common in React than in Angular?",
    options: [
      "React does not technically support decorators",
      "I don't know",
      "React has its own decorator system",
      "React is function-based → hooks are more natural than class decorators",
    ],
    correct: 3,
    explanation: "React uses functional components + hooks. Decorators fit classes (Angular), hooks fit functions (React).",
  },
  {
    sectionId: 6,
    question: "What should a decorator NOT contain?",
    options: [
      "Logging and caching",
      "Validation and metadata",
      "Complex business logic and global state",
      "I don't know",
    ],
    correct: 2,
    explanation: "Decorators should be short and declarative. Business logic belongs in services, global state in state management.",
  },
];