/**
 * Lesson 21 — Quiz Data: Classes & OOP
 *
 * Exports only the questions (without calling runQuiz),
 * so the review runner can import them.
 *
 * correct-index distribution: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "21";
export const lessonTitle = "Classes & OOP";

export const questions: QuizQuestion[] = [
  // --- Question 1: Class Basics (correct: 0) ---
  {
    question: "What happens to TypeScript classes at runtime?",
    options: [
      "The class remains as a JS constructor function, but type annotations are removed",
      "The entire class is removed — Type Erasure applies here just as it does with interfaces",
      "The class is converted to an interface — the compiler transforms it automatically",
      "TypeScript adds runtime checks for fields to guarantee type safety",
    ],
    correct: 0,
    explanation:
      "Classes exist at runtime as JavaScript constructor functions " +
      "(unlike interfaces, which disappear completely). " +
      "But all TypeScript-specific additions (type annotations, " +
      "access modifiers like 'private') are removed.",
    elaboratedFeedback: {
      whyCorrect:
        "Classes are JavaScript features that also exist at runtime. " +
        "TypeScript only removes the type annotations and modifiers — " +
        "the class itself remains as a constructor function.",
      commonMistake:
        "Many confuse classes with interfaces. Interfaces disappear " +
        "completely (Type Erasure), classes do not. That's why " +
        "'instanceof' only works with classes.",
    },
  },

  // --- Question 2: strictPropertyInitialization (correct: 1) ---
  {
    question: "Which code produces a compile error with 'strict: true'?",
    options: [
      "class A { name: string = 'default'; }",
      "class A { name: string; }",
      "class A { name?: string; }",
      "class A { name: string; constructor(n: string) { this.name = n; } }",
    ],
    correct: 1,
    explanation:
      "With strictPropertyInitialization, every field must either have a " +
      "default value, be optional (?), or be assigned in the constructor. " +
      "'class A { name: string; }' has none of these.",
    code: "class A {\n  name: string;\n  // TS2564: Property 'name' has no initializer\n}",
    elaboratedFeedback: {
      whyCorrect:
        "'name: string' without initialization means: at runtime 'name' would be " +
        "undefined, but TypeScript thinks it's a string. " +
        "strictPropertyInitialization prevents this lie.",
      commonMistake:
        "Many forget that '?' (optional) solves the problem — " +
        "'name?: string' makes the type 'string | undefined', " +
        "which is honest towards the type system.",
    },
  },

  // --- Question 3: private vs #private (correct: 2) ---
  {
    question: "Which statement about 'private' in TypeScript is CORRECT?",
    options: [
      "private is enforced at runtime and prevents any access",
      "private and #private are identical, only the syntax differs",
      "private is removed at compilation — access is possible with 'as any'",
      "private also exists in pure JavaScript since ES6",
    ],
    correct: 2,
    explanation:
      "TypeScript's 'private' is a compile-time feature (Type Erasure). " +
      "At runtime, the field is a completely normal property. " +
      "Only JavaScript's '#private' (ES2022) provides true runtime protection.",
    elaboratedFeedback: {
      whyCorrect:
        "Type Erasure means: ALL TypeScript-specific features are removed " +
        "during compilation. 'private' is TypeScript-only, so it disappears. " +
        "In the generated JS code, the field is publicly accessible.",
      commonMistake:
        "Java/C# developers expect 'private' to protect at runtime. " +
        "In TypeScript it's a 'gentleman's agreement' — the compiler warns, " +
        "but the JS code has no protection.",
    },
  },

  // --- Question 4: super() call (correct: 0) ---
  {
    question: "Where must 'super()' be placed in the constructor of a subclass?",
    options: [
      "As the FIRST statement, before any access to 'this'",
      "At the end of the constructor, after all subclass fields are initialized",
      "Anywhere in the constructor, TypeScript validates the position itself",
      "super() is only needed for abstract classes, optional for concrete classes",
    ],
    correct: 0,
    explanation:
      "super() must be the FIRST statement in the constructor. " +
      "Before super(), 'this' is not yet initialized — " +
      "any access to 'this' would cause an error. " +
      "This is a JavaScript rule, not just TypeScript.",
    elaboratedFeedback: {
      whyCorrect:
        "The parent class must be initialized first so that the " +
        "subclass can access 'this'. Only super() creates " +
        "the instance — before that, 'this' does not yet exist.",
      commonMistake:
        "Some think you can do local computations before super() " +
        "and pass the result to super(). That's possible as long as you " +
        "don't access 'this'. But super() must still come before the " +
        "first 'this' access.",
    },
  },

  // --- Question 5: abstract class (correct: 3) ---
  {
    question: "Which statement about abstract classes is FALSE?",
    options: [
      "Abstract classes cannot be instantiated",
      "Abstract classes can have concrete methods (with a body)",
      "Abstract methods must be implemented by subclasses",
      "Abstract classes cannot have fields with default values",
    ],
    correct: 3,
    explanation:
      "FALSE: Abstract classes CAN have fields with default values! " +
      "They can contain both abstract methods (without a body) and " +
      "concrete methods and fields (with a body/values). " +
      "That makes them powerful: shared code + enforced implementation.",
    elaboratedFeedback: {
      whyCorrect:
        "Abstract classes are a mix of interface (abstract methods) " +
        "and concrete class (fields, methods with a body). " +
        "Only instantiation is forbidden.",
      commonMistake:
        "Many think abstract = 'purely abstract' (like Java interfaces before Java 8). " +
        "But abstract classes CAN contain concrete code — " +
        "that's their main advantage over interfaces.",
    },
  },

  // --- Question 6: implements vs extends (correct: 1) ---
  {
    question: "What is the main difference between 'implements' and 'extends'?",
    options: [
      "implements inherits code, extends only types",
      "implements inherits NO code (only a contract), extends inherits code",
      "implements can only be used with interfaces, extends only with classes",
      "There is no difference, both are interchangeable",
    ],
    correct: 1,
    explanation:
      "implements takes on NO code — it's only a compile-time contract " +
      "that ensures the class has all required members. " +
      "extends, on the other hand, inherits all fields and methods from the parent class.",
    elaboratedFeedback: {
      whyCorrect:
        "'implements' says: 'I promise to have this structure.' " +
        "'extends' says: 'I inherit everything from this class and can extend it.' " +
        "The code difference is significant: with implements, you have to write everything yourself.",
      commonMistake:
        "Option C is partially correct (implements CAN be used with interfaces), " +
        "but incomplete: implements can also be used with classes! " +
        "And extends can also be used with abstract classes.",
    },
  },

  // --- Question 7: Structural Typing (correct: 2) ---
  {
    question: "What is the result of this code?",
    options: [
      "Compile error: plainObj does not have the type Dog",
      "Compile error: plainObj is not an instanceof Dog",
      "Compiles and outputs 'Wuff!' — Structural Typing",
      "Runtime error: plainObj has no bark method, the call fails at runtime",
    ],
    correct: 2,
    code:
      "class Dog { name = 'Rex'; bark() { return 'Wuff!'; } }\n" +
      "function feed(dog: Dog) { console.log(dog.bark()); }\n" +
      "const plainObj = { name: 'Bello', bark: () => 'Wuff!' };\n" +
      "feed(plainObj);",
    explanation:
      "TypeScript uses Structural Typing: plainObj has the same structure " +
      "as Dog (name: string, bark(): string), so it fits. " +
      "No 'new Dog()' is needed — the structure is sufficient.",
    elaboratedFeedback: {
      whyCorrect:
        "Structural Typing (Duck Typing): 'If it quacks like a duck and " +
        "looks like a duck, it is a duck.' plainObj has name + bark() " +
        "— that's all the Dog type requires.",
      commonMistake:
        "Java/C# developers expect Nominal Typing: there, plainObj would need to " +
        "explicitly have 'implements Dog'. In TypeScript, the structure is sufficient.",
    },
  },

  // --- Question 8: Parameter Properties (correct: 0) ---
  {
    question: "What does 'constructor(private name: string)' do in TypeScript?",
    options: [
      "Declares a private field 'name', takes the parameter and assigns this.name = name",
      "Creates only a private parameter for the constructor, but no class field",
      "This is a syntax error, private cannot be in the constructor and must be declared beforehand",
      "Creates a public field 'name' with restricted private access only from outside",
    ],
    correct: 0,
    explanation:
      "Parameter Properties are a TypeScript shorthand: " +
      "a modifier (public/private/protected/readonly) before a " +
      "constructor parameter automatically creates a class field " +
      "and assigns the parameter value.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript's Parameter Properties do three things in one step: " +
        "1) field declaration, 2) constructor parameter, 3) this.name = name. " +
        "This saves significant boilerplate code.",
      commonMistake:
        "Some think the parameter only exists IN the constructor (like a " +
        "normal parameter). The modifier makes the difference: WITH modifier " +
        "a field is created, WITHOUT modifier it's just a parameter.",
    },
  },

  // --- Question 9: Singleton Pattern (correct: 3) ---
  {
    question: "Why is the Singleton pattern controversial?",
    options: [
      "Because it cannot be correctly implemented in TypeScript",
      "Because it creates too many instances",
      "Because TypeScript does not support private constructors",
      "Because it creates global state and makes unit tests difficult",
    ],
    correct: 3,
    explanation:
      "Singletons are global state with a fancy name. " +
      "Problems: unit tests cannot reset the state, " +
      "hidden dependencies arise, and concurrency becomes difficult. " +
      "That's why Angular uses DI (providedIn: 'root') instead of singletons.",
    elaboratedFeedback: {
      whyCorrect:
        "Global state is the core problem: all tests share the one " +
        "instance, dependencies are not explicit, and parallel " +
        "tests can interfere with each other.",
      commonMistake:
        "Many think Singleton is ALWAYS bad. In some cases " +
        "(database connection pool, configuration) it's useful — " +
        "but better managed by DI than by the class itself.",
    },
  },

  // --- Question 10: override keyword (correct: 2) ---
  {
    question: "What happens with this code with 'noImplicitOverride: true'?",
    options: [
      "Compiles without error, since noImplicitOverride only emits a warning",
      "Runtime error when calling render() because the method was not correctly overridden",
      "Compile error: 'render' must be marked with 'override'",
      "Compile error: 'rendr' does not exist in the parent class and cannot be overridden",
    ],
    correct: 2,
    code:
      "class Base { render(): void { console.log('Base'); } }\n" +
      "class Child extends Base {\n  render(): void { console.log('Child'); }\n}",
    explanation:
      "With noImplicitOverride, every method that overrides a parent method " +
      "must explicitly carry 'override'. Without 'override render()', " +
      "TypeScript emits an error. This prevents accidental overriding.",
    elaboratedFeedback: {
      whyCorrect:
        "'noImplicitOverride' enforces explicitness: whoever overrides a method " +
        "must do so consciously and write 'override'. This also prevents typos " +
        "(e.g., 'rendr' instead of 'render').",
      commonMistake:
        "Without noImplicitOverride, the code would compile. Many don't know the " +
        "tsconfig option and miss the safety it provides.",
    },
  },

  // --- Question 11: this-Binding (correct: 1) ---
  {
    question: "Why does a class method lose its this context when used as a callback?",
    options: [
      "Because TypeScript removes the this context at compile time",
      "Because in JavaScript 'this' depends on the call context, not the definition",
      "Because callbacks are always executed in a new scope",
      "Because arrow functions override 'this'",
    ],
    correct: 1,
    code:
      "class Timer {\n" +
      "  seconds = 0;\n" +
      "  tick() { this.seconds++; }\n" +
      "}\n" +
      "const t = new Timer();\n" +
      "const fn = t.tick;\n" +
      "fn(); // FEHLER: this ist undefined",
    explanation:
      "In JavaScript, 'this' is determined dynamically at the CALL. " +
      "'t.tick()' sets this=t, but 'const fn = t.tick; fn()' has no " +
      "object before the dot — so this is undefined (strict mode). " +
      "Solution: arrow functions or bind().",
    elaboratedFeedback: {
      whyCorrect:
        "JavaScript's 'this' is not bound to the class, but to the " +
        "call context. 'obj.method()' → this=obj. 'const fn = obj.method; fn()' " +
        "→ this=undefined. This is a fundamental principle of JavaScript.",
      commonMistake:
        "Many expect 'this' to be automatically bound to the class instance " +
        "(as in Java). In JavaScript, you have to take care of this: " +
        "arrow functions, bind(), or arrow wrappers.",
    },
  },

  // --- Question 12: Class as Type (correct: 0) ---
  {
    question: "What is the difference between 'Animal' and 'typeof Animal'?",
    options: [
      "'Animal' is the instance type, 'typeof Animal' is the constructor type",
      "No difference, both describe the same type",
      "'Animal' is the constructor type, 'typeof Animal' is the instance type",
      "'typeof Animal' is the string 'function' at runtime",
    ],
    correct: 0,
    explanation:
      "'Animal' as a type describes an INSTANCE of the class (has the fields and methods). " +
      "'typeof Animal' describes the CLASS ITSELF (the constructor that can be called with 'new'). " +
      "This is important for factory functions.",
    elaboratedFeedback: {
      whyCorrect:
        "In TypeScript, classes have two 'faces': the instance type (describes " +
        "what 'new' returns) and the constructor type (describes the class itself). " +
        "'typeof Animal' is the latter.",
      commonMistake:
        "Option D describes the JAVASCRIPT typeof operator, not the " +
        "TYPESCRIPT typeof type operator. In the type context, 'typeof' " +
        "extracts the TypeScript type of a variable.",
    },
  },

  // --- Question 13: Composition vs Inheritance (correct: 3) ---
  {
    question: "Why does the Gang of Four recommend 'Composition over Inheritance'?",
    options: [
      "Because inheritance doesn't work in JavaScript",
      "Because composition is faster than inheritance",
      "Because TypeScript does not support multiple inheritance",
      "Because inheritance creates tight coupling and composition is more flexible",
    ],
    correct: 3,
    explanation:
      "Inheritance creates tight coupling: changes to the parent class " +
      "can break all subclasses. Composition is more flexible — " +
      "capabilities are injected as separate objects and can " +
      "be swapped out independently.",
    elaboratedFeedback: {
      whyCorrect:
        "The GoF recognized in 1994: inheritance hierarchies quickly become rigid. " +
        "Composition allows behavior to be changed at runtime, " +
        "different combinations to be formed, and dependencies to be tested.",
      commonMistake:
        "TypeScript actually doesn't support multiple inheritance (Option C), " +
        "but that is not the REASON for the GoF recommendation. Even in languages " +
        "WITH multiple inheritance (C++, Python), the principle applies.",
    },
  },

  // --- Question 14: Mixins (correct: 1) ---
  {
    question: "What is a TypeScript Mixin?",
    options: [
      "A special TypeScript keyword for multiple inheritance",
      "A function that takes a class and returns an extended class",
      "An interface that is implemented by multiple classes",
      "A plugin system for the TypeScript compiler",
    ],
    correct: 1,
    explanation:
      "Mixins in TypeScript are functions of the form: " +
      "'function WithX<T extends Constructor>(Base: T) { return class extends Base { ... } }'. " +
      "They take a class and return an extended class — " +
      "enabling 'multiple inheritance' without the extends restriction.",
    code:
      "type Constructor<T = {}> = new (...args: any[]) => T;\n" +
      "function WithTimestamp<T extends Constructor>(Base: T) {\n" +
      "  return class extends Base {\n" +
      "    createdAt = new Date();\n" +
      "  };\n" +
      "}",
    elaboratedFeedback: {
      whyCorrect:
        "Mixins are a pattern, not a language feature. The function 'extends' " +
        "an arbitrary base class dynamically. Multiple mixins can " +
        "be chained: WithLogging(WithTimestamp(User)).",
      commonMistake:
        "Many confuse mixins with interfaces. Interfaces only define structure, " +
        "mixins deliver real code. Mixins are the solution for " +
        "'I want to inherit code from multiple sources'.",
    },
  },

  // --- Question 15: protected (correct: 2) ---
  {
    question: "From where can a 'protected' field be accessed?",
    options: [
      "Only within the class that defines the field",
      "From anywhere (protected is the same as public)",
      "Within the class and in all subclasses, but not from outside",
      "Only in subclasses, not in the class itself",
    ],
    correct: 2,
    explanation:
      "protected allows access within the defining class AND in all " +
      "subclasses (extends). From outside (instance access) it is forbidden. " +
      "This is identical to the behavior in Java and C#.",
    elaboratedFeedback: {
      whyCorrect:
        "protected is the 'family modifier': the class itself and its " +
        "'children' (subclasses) have access. External users do not. " +
        "Typical use case: providing methods for subclasses.",
      commonMistake:
        "Some confuse private and protected. private = ONLY the class itself. " +
        "protected = the class + subclasses. From outside, both are inaccessible.",
    },
  },

  // ─── New question formats (Short-Answer, Predict-Output, Explain-Why) ──────

  // --- Question 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which TypeScript keyword makes a class non-instantiable " +
      "and forces subclasses to implement certain methods?",
    expectedAnswer: "abstract",
    acceptableAnswers: ["abstract", "Abstract", "ABSTRACT"],
    explanation:
      "The 'abstract' keyword before a class prevents direct instantiation " +
      "with 'new'. Abstract methods (without a body) must be implemented by every concrete " +
      "subclass — similar to an interface, but with the ability to also contain concrete code.",
  },

  // --- Question 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "What is the name of the TypeScript shorthand where a modifier (public/private/protected/readonly) " +
      "before a constructor parameter automatically creates a class field?",
    expectedAnswer: "Parameter Properties",
    acceptableAnswers: [
      "Parameter Properties", "Parameter Property", "parameter properties",
      "parameter property", "Constructor Parameter Properties",
    ],
    explanation:
      "Parameter Properties do three things at once: " +
      "field declaration, constructor parameter, and assignment. " +
      "'constructor(private name: string)' is identical to: " +
      "field 'private name: string' + 'this.name = name' in the constructor.",
  },

  // --- Question 18: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Which type system principle allows passing a simple object literal " +
      "to a function that expects a class type?",
    expectedAnswer: "Structural Typing",
    acceptableAnswers: [
      "Structural Typing", "structural typing",
      "Duck Typing", "duck typing",
    ],
    explanation:
      "TypeScript uses Structural Typing: if an object has the same structure " +
      "as a class (same fields and methods), it is compatible — " +
      "regardless of whether it was created with 'new'.",
  },

  // --- Question 19: Predict-Output ---
  {
    type: "predict-output",
    question: "What does this code output?",
    code:
      "class Counter {\n" +
      "  count = 0;\n" +
      "  increment = () => { this.count++; };\n" +
      "}\n" +
      "const c = new Counter();\n" +
      "const fn = c.increment;\n" +
      "fn();\n" +
      "fn();\n" +
      "console.log(c.count);",
    expectedAnswer: "2",
    acceptableAnswers: ["2"],
    explanation:
      "Since 'increment' is defined as an arrow function, 'this' is lexically " +
      "bound — it always points to the Counter instance. Unlike with " +
      "normal methods, the this context is not lost when extracting. " +
      "Two calls to fn() increment count to 2.",
  },

  // --- Question 20: Predict-Output ---
  {
    type: "predict-output",
    question: "Does this code compile with 'strict: true'?",
    code:
      "class Animal {\n" +
      "  name: string;\n" +
      "  sound: string;\n" +
      "  constructor(name: string) {\n" +
      "    this.name = name;\n" +
      "  }\n" +
      "}",
    expectedAnswer: "No",
    acceptableAnswers: [
      "No", "no", "Error", "Compile Error", "Compile-Error",
      "TS2564", "No, Error",
    ],
    explanation:
      "With strictPropertyInitialization (part of strict: true), EVERY field " +
      "must be initialized. 'sound' has neither a default value nor is it " +
      "assigned in the constructor, and is also not optional (?) — " +
      "so TypeScript reports TS2564.",
  },

  // --- Question 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Why do many TypeScript experts recommend using arrow functions instead of " +
      "normal methods in classes when the method is passed as a callback? " +
      "What is the disadvantage?",
    modelAnswer:
      "Arrow functions bind 'this' lexically to the class instance, " +
      "so the context is preserved even when extracted. " +
      "The disadvantage: arrow properties are created per instance " +
      "(not on the prototype), which consumes more memory with many instances " +
      "and cannot be overridden.",
    keyPoints: [
      "Lexical this binding",
      "No context loss with callbacks",
      "Per instance instead of on prototype",
      "More memory consumption",
    ],
  },
];