// quiz-data.ts — L28: Decorators (Legacy & Stage 3)
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 questions
// MC correct-index distribution: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "28";
export const lessonTitle = "Decorators";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- correct: 0 ---
  {
    question: "What is a decorator in TypeScript?",
    options: [
      "A function that transforms or annotates a class, method, or property",
      "A special TypeScript type that only exists at compile time and has no effect on code",
      "A CSS-like styling system for TypeScript classes that adds metadata",
      "A build tool that converts TypeScript to JavaScript while processing annotations",
    ],
    correct: 0,
    explanation:
      "A decorator is a regular function placed with @name before a declaration. " +
      "It can change behavior, add metadata, or completely replace the value.",
    elaboratedFeedback: {
      whyCorrect: "Decorators are syntactic sugar for higher-order functions. @log above a method is the same as log(method) — just more readable and declarative.",
      commonMistake: "Some think decorators are a TypeScript-only feature. Stage 3 decorators are a TC39 proposal — they are coming to JavaScript itself."
    }
  },

  {
    question: "What is the difference between @Decorator and @Decorator()?",
    options: [
      "@Decorator applies the function directly, @Decorator() calls a factory that returns the decorator",
      "@Decorator is for classes, @Decorator() is for methods and properties",
      "@Decorator() is the legacy syntax, @Decorator is the new Stage 3 syntax",
      "There is no difference — both are identical and interchangeable",
    ],
    correct: 0,
    explanation:
      "@Decorator = the function itself is used as the decorator. " +
      "@Decorator() = a factory function is called that returns the actual decorator. " +
      "Parentheses = decorator factory with parameters.",
    elaboratedFeedback: {
      whyCorrect: "@Sealed → Sealed is the decorator. @Component({...}) → Component({...}) returns the decorator. The difference: fn vs fn() — the function itself vs. a call.",
      commonMistake: "Many forget the parentheses with decorator factories and write @Component instead of @Component({...}). This leads to cryptic errors."
    }
  },

  {
    question: "In what order are stacked decorators applied?",
    options: [
      "Bottom-up: the one closest to the code is applied first",
      "Top-down: the topmost is applied first and then continues downward",
      "Sorted alphabetically by decorator name and then applied",
      "Randomly — the order is not guaranteed and may vary",
    ],
    correct: 0,
    explanation:
      "Decorators are applied bottom-up: @First @Second class X → Second is " +
      "applied first, then First. For factories: evaluation is top-down, application is bottom-up.",
    elaboratedFeedback: {
      whyCorrect: "Think of it like function composition: First(Second(class)). The innermost function (Second, closest to the code) is applied first.",
      commonMistake: "The dual rule for factories is confusing: factory evaluation (top-down) vs. decorator application (bottom-up). Evaluation collects the decorators, application applies them."
    }
  },

  {
    question: "Why can parameter decorators NOT change the parameter value?",
    options: [
      "Parameter decorators run BEFORE the function call — the value does not exist yet",
      "TypeScript generally prohibits value changes in decorators and blocks them at compile time",
      "Parameter decorators only exist in Stage 3 and were not supported in legacy",
      "Parameters are immutable in JavaScript and cannot be influenced by decorators",
    ],
    correct: 0,
    explanation:
      "Parameter decorators are executed at class definition, not at function call time. " +
      "They can only store metadata ABOUT the parameter — " +
      "the value is not determined until the call.",
    elaboratedFeedback: {
      whyCorrect: "Parameter decorators run once at class definition. The parameter value only exists at method call time. Therefore: only store metadata (position, name, token), no value access.",
      commonMistake: "Some expect @Param('id') to extract the value. No — the decorator MARKS the parameter. The framework (NestJS) later reads the mark and injects the value."
    }
  },

  // --- correct: 1 ---
  {
    question: "What does emitDecoratorMetadata in tsconfig.json do?",
    options: [
      "It activates Stage 3 decorators and disables the legacy variant",
      "It emits type information as runtime metadata (Reflect.metadata)",
      "It generates .d.ts files for decorators used in distribution",
      "It disables type erasure for decorated classes and preserves all types at runtime",
    ],
    correct: 1,
    explanation:
      "emitDecoratorMetadata generates Reflect.metadata() calls that store type information " +
      "(constructor parameter types, property types) as runtime values. " +
      "Angular's DI uses this to know which services need to be injected.",
    elaboratedFeedback: {
      whyCorrect: "emitDecoratorMetadata is an exception to type erasure: TypeScript generates code that stores type information as runtime values. __metadata('design:paramtypes', [HttpClient, Logger]) — Angular reads that.",
      commonMistake: "Some think emitDecoratorMetadata preserves ALL types. No — only class-based types. Interfaces become Object (since they don't exist at runtime)."
    }
  },

  {
    question: "Which feature does Stage 3 have that legacy decorators do NOT?",
    options: [
      "Parameter decorators that exist in legacy but are missing in Stage 3",
      "Auto-accessor ('accessor' keyword) and context.addInitializer()",
      "Method decorators that are newly added in Stage 3",
      "Class decorators with parameters that are only available in Stage 3 syntax",
    ],
    correct: 1,
    explanation:
      "Stage 3 introduces 'accessor' (auto getter/setter) and context.addInitializer() " +
      "(initialization code without constructor wrapping). Legacy has parameter " +
      "decorators and emitDecoratorMetadata — which Stage 3 does not.",
    elaboratedFeedback: {
      whyCorrect: "'accessor name: string' automatically creates get/set. Accessor decorators can then customize get/set. addInitializer() registers code that runs at instantiation. Neither existed in legacy.",
      commonMistake: "Some think Stage 3 is a superset of legacy. No — Stage 3 has features legacy does not (accessor, addInitializer), but also missing features (parameter decorators, emitDecoratorMetadata)."
    }
  },

  {
    question: "What does Angular's @Component() decorator store?",
    options: [
      "The compiled JavaScript code of the component that is executed at runtime",
      "Metadata (selector, template, styles) that the Angular compiler reads",
      "A reference to the DOM elements of the component created during rendering",
      "The change detection strategy as a runtime flag controlling rendering behavior",
    ],
    correct: 1,
    explanation:
      "@Component() is a decorator factory that attaches metadata to the class. " +
      "The Angular compiler (ngc) reads this metadata and generates " +
      "rendering code, change detection code, and DI setup.",
    elaboratedFeedback: {
      whyCorrect: "@Component({ selector: 'app-root', template: '...' }) stores this configuration as metadata. The Angular compiler transforms the class based on this metadata into optimized code.",
      commonMistake: "Some think @Component() directly generates DOM elements. No — it only stores metadata. The actual code generation happens through the Angular compiler, not the decorator itself."
    }
  },

  {
    question: "Which legacy method decorator parameter contains the method itself?",
    options: [
      "target (first parameter) which contains the class itself",
      "descriptor.value (in the third parameter)",
      "propertyKey (second parameter) which contains the method name",
      "this (implicit) which is available inside the decorator function",
    ],
    correct: 1,
    explanation:
      "Legacy: target = prototype, propertyKey = method name, descriptor.value = the method. " +
      "You change descriptor.value to wrap the method. Stage 3: target IS the method.",
    elaboratedFeedback: {
      whyCorrect: "PropertyDescriptor has: value (the method), writable, enumerable, configurable. You store descriptor.value in a variable, replace it with a wrapper function, and call the original inside it.",
      commonMistake: "Many confuse target (prototype) with the method. In legacy, target is the class prototype — NOT the method! The method is stored in descriptor.value."
    }
  },

  // --- correct: 2 ---
  {
    question: "What is Angular's recommended alternative to @Input() from Angular 17.1+?",
    options: [
      "@Prop() from Vue which provides the same functionality for Angular",
      "this.inputs.get('name') — manual access to component inputs",
      "input<string>() — signal-based inputs (Stage 3 compatible)",
      "constructor(private name: string) with DI that automatically injects the input",
    ],
    correct: 2,
    explanation:
      "Angular 17.1+ recommends input<T>() as a signal-based alternative to @Input(). " +
      "Benefits: no decorator needed, Stage 3 compatible, reactive (signal).",
    elaboratedFeedback: {
      whyCorrect: "name = input<string>('') replaces @Input() name = ''. input() returns a signal (reactive), requires no decorator, and is compatible with Stage 3 decorators.",
      commonMistake: "Some think @Input() is deprecated. It still works, but input() is the recommended future. Migration is optional but recommended."
    }
  },

  {
    question: "What is Aspect-Oriented Programming (AOP)?",
    options: [
      "A programming paradigm for asynchronous code",
      "The separation of business logic and UI code",
      "Declaratively attaching cross-cutting concerns (logging, caching, auth) to arbitrary methods",
      "A design pattern for microservices",
    ],
    correct: 2,
    explanation:
      "AOP separates cross-cutting concerns (logging, security, caching) from core code. " +
      "Decorators implement AOP: @log, @cache, @retry can be attached to any method " +
      "without changing the method code.",
    elaboratedFeedback: {
      whyCorrect: "Logging is a typical cross-cutting concern: every method might need logging, but logging has nothing to do with business logic. A @log decorator separates the two cleanly.",
      commonMistake: "Some confuse AOP with OOP. AOP complements OOP — it solves the problem of code scattered across many classes (logging in every method, auth in every controller)."
    }
  },

  {
    question: "Why are there NO parameter decorators in Stage 3?",
    options: [
      "JavaScript does not support function parameters and only allows fixed argument lists",
      "Parameter decorators were replaced by proxy objects that fulfill the same function",
      "TC39 decided: too complex, alternatives like inject() are simpler",
      "Stage 3 only supports class decorators and no other decorator types",
    ],
    correct: 2,
    explanation:
      "TC39 decided not to include parameter decorators in Stage 3 due to complexity " +
      "and limited utility (can only store metadata). " +
      "Alternatives like Angular's inject() solve the DI problem without parameter decorators.",
    elaboratedFeedback: {
      whyCorrect: "Parameter decorators cannot change the value — only store metadata. emitDecoratorMetadata (needed for DI) couples the type system to the runtime — controversial. inject() is a simpler, more universal solution.",
      commonMistake: "Some think Angular won't work without parameter decorators. Angular's inject() function already fully replaces constructor DI — no parameter decorator needed."
    }
  },

  {
    question: "Which tsconfig flag activates legacy decorators?",
    options: [
      "decorators: true which activates the new Stage 3 syntax for all projects",
      "useDecorators: 'legacy' which explicitly selects the legacy variant",
      "experimentalDecorators: true",
      "enableDecorators: true which activates all decorator features without restrictions",
    ],
    correct: 2,
    explanation:
      "'experimentalDecorators: true' activates legacy decorators. Without this flag " +
      "and with target >= ES2022, Stage 3 decorators are active. Angular/NestJS set " +
      "experimentalDecorators to true by default.",
    elaboratedFeedback: {
      whyCorrect: "The flag is called 'experimental' because legacy decorators never advanced past Stage 2. Stage 3 is the official standard — legacy remains 'experimental'.",
      commonMistake: "Some set experimentalDecorators to true for new projects. For new projects without Angular/NestJS: Stage 3 (no flag needed) is the better choice."
    }
  },

  // --- correct: 3 ---
  {
    question: "What is an anti-pattern when using decorators?",
    options: [
      "Using decorators for logging and caching that have no side effects",
      "Using decorator factories with parameters that enable configuration",
      "Stacking multiple decorators on a method that are executed in sequence",
      "Implementing business logic or global state in decorators",
    ],
    correct: 3,
    explanation:
      "Decorators should be short, declarative, and side-effect-free. Business logic " +
      "belongs in services, global state in state management. Decorators are for " +
      "cross-cutting concerns: logging, caching, auth, validation.",
    elaboratedFeedback: {
      whyCorrect: "A decorator with 200 lines of business logic is hard to test, debug, and understand. Decorators should do one thing: wrap, annotate, or validate. Everything else belongs in separate modules.",
      commonMistake: "Some pack complex transformations into decorators because it looks 'elegant'. This leads to hidden logic that is hard to follow — the opposite of elegance."
    }
  },

  {
    question: "How does Angular's dependency injection work internally?",
    options: [
      "Angular analyzes the source code at runtime with eval() to extract the types",
      "Angular uses template metadata for DI and reads the types from HTML code",
      "Angular reads parameter names from JavaScript code and maps them to services",
      "emitDecoratorMetadata provides constructor parameter types, Angular's DI reads them",
    ],
    correct: 3,
    explanation:
      "emitDecoratorMetadata generates Reflect.metadata('design:paramtypes', [...]) — " +
      "Angular reads this metadata and knows which services need to be injected. " +
      "For primitive types or tokens, @Inject() is required.",
    elaboratedFeedback: {
      whyCorrect: "constructor(private http: HttpClient) → emitDecoratorMetadata → Reflect.metadata('design:paramtypes', [HttpClient]). Angular's injector reads that and provides the HttpClient instance. Elegant but tied to an experimental feature.",
      commonMistake: "Some think Angular parses TypeScript source code. No — at runtime there is no TypeScript code. The type information is stored as JavaScript values by emitDecoratorMetadata."
    }
  },

  {
    question: "What is NestJS's SetMetadata() helper?",
    options: [
      "A type utility for generic metadata used in various contexts",
      "An ORM feature for database metadata that is automatically persisted",
      "An internal compiler mechanism that generates metadata at build time",
      "A decorator helper that attaches metadata to classes/methods for guards and interceptors",
    ],
    correct: 3,
    explanation:
      "SetMetadata('key', value) creates a decorator that stores metadata. " +
      "Guards and interceptors read the metadata with Reflector.get(). " +
      "This is the foundation for @Roles(), @Public(), and similar custom decorators.",
    elaboratedFeedback: {
      whyCorrect: "const Roles = (...roles: string[]) => SetMetadata('roles', roles). Then: @Roles('admin'). In the guard: reflector.get('roles', handler). This is how NestJS separates declaration (decorator) from enforcement (guard).",
      commonMistake: "Some write the guard logic directly into the decorator. Better: decorator only sets metadata, guard reads and checks. Separation of concerns."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Which tsconfig flag activates legacy decorators in TypeScript?",
    expectedAnswer: "experimentalDecorators",
    acceptableAnswers: ["experimentalDecorators", "experimentalDecorators: true", "\"experimentalDecorators\": true"],
    explanation:
      "'experimentalDecorators: true' activates the legacy decorator specification. " +
      "Without this flag, Stage 3 decorators are active from TypeScript 5.0 onward.",
  },

  {
    type: "short-answer",
    question: "In what order are stacked decorators applied? (top-down or bottom-up)",
    expectedAnswer: "bottom-up",
    acceptableAnswers: ["bottom-up", "bottom up", "from bottom to top"],
    explanation:
      "Decorators are applied bottom-up: the one closest to the code is executed first. " +
      "With @A @B class X: B is applied first, then A. " +
      "Like function composition: A(B(X)).",
  },

  {
    type: "short-answer",
    question: "What is Angular's new alternative to @Input() from Angular 17.1+?",
    expectedAnswer: "input()",
    acceptableAnswers: ["input()", "input", "input<T>()"],
    explanation:
      "input<T>() returns a signal and requires no decorator. " +
      "It is Stage 3 compatible and the recommended future for Angular inputs.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 questions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "In what order do the logs appear?",
    code:
      "function A(c: Function) { console.log('A applied'); }\n" +
      "function B(c: Function) { console.log('B applied'); }\n\n" +
      "@A\n@B\nclass MyClass {}",
    expectedAnswer: "B applied, A applied",
    acceptableAnswers: [
      "B applied, A applied",
      "B applied\nA applied",
      "B, A",
    ],
    explanation:
      "Bottom-up order: @B is closer to the code → is applied first. " +
      "Then @A. Output: 'B applied', then 'A applied'.",
  },

  {
    type: "predict-output",
    question: "What does this code output when calc.add(2, 3) is called?",
    code:
      "function Log(t: any, k: string, d: PropertyDescriptor) {\n" +
      "  const orig = d.value;\n" +
      "  d.value = function(...args: any[]) {\n" +
      "    console.log(`${k} called`);\n" +
      "    return orig.apply(this, args);\n" +
      "  };\n" +
      "  return d;\n" +
      "}\n\n" +
      "class Calc {\n" +
      "  @Log add(a: number, b: number) { return a + b; }\n" +
      "}\n\n" +
      "new Calc().add(2, 3);",
    expectedAnswer: "add called",
    acceptableAnswers: ["add called", "'add called'", "\"add called\""],
    explanation:
      "The @Log decorator wraps add() with a function that logs 'add called' " +
      "before the original method is invoked. The method returns 5, " +
      "but only the log is printed.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 question)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Why is emitDecoratorMetadata an 'exception' to TypeScript's type erasure, " +
      "and why is that controversial?",
    modelAnswer:
      "TypeScript's core principle is type erasure: all types are removed at compile time. " +
      "emitDecoratorMetadata breaks this principle — it generates runtime code (Reflect.metadata) " +
      "that stores type information as values. This is controversial because: 1. It couples the " +
      "type system to the runtime. 2. Interfaces become 'Object' (since they don't exist at runtime). " +
      "3. It only works with classes, not type aliases. 4. It depends on an experimental polyfill " +
      "(reflect-metadata). Stage 3 deliberately chose not to include it.",
    keyPoints: [
      "Type erasure: types disappear at compile time — emitDecoratorMetadata is the exception",
      "Generates Reflect.metadata() — stores types as runtime VALUES",
      "Interfaces become Object (do not exist at runtime)",
      "Controversial: couples type system to runtime, depends on reflect-metadata polyfill",
    ],
  },
];