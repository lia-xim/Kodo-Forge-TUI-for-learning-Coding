/**
 * Lesson 21 — Tracing Exercises: Classes & OOP
 *
 * 4 exercises for tracing:
 *  - Inheritance and Polymorphism
 *  - this context in various situations
 *  - Static vs Instance Members
 *  - Abstract Classes and Method Dispatch
 *
 * Difficulty increasing: 1 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: Inheritance and Polymorphism ───────────────────────────
  {
    id: "21-inheritance-polymorphism",
    title: "Inheritance — Which method gets called?",
    description:
      "Trace which version of a method gets called " +
      "when different classes override the same method.",
    code: [
      "class Animal {",
      "  speak(): string { return 'Silence'; }",
      "}",
      "class Dog extends Animal {",
      "  override speak(): string { return 'Woof!'; }",
      "}",
      "class Cat extends Animal {",
      "  override speak(): string { return 'Meow!'; }",
      "}",
      "",
      "const animals: Animal[] = [new Dog(), new Cat(), new Animal()];",
      "const sounds = animals.map(a => a.speak());",
      "console.log(sounds);",
    ],
    steps: [
      {
        lineIndex: 10,
        question:
          "What types do the elements in the array have?",
        expectedAnswer: "Dog, Cat, Animal (all typed as Animal[])",
        variables: { "animals": "[Dog, Cat, Animal]" },
        explanation:
          "The array is typed as Animal[], but the elements are " +
          "instances of different subclasses. TypeScript allows this " +
          "because of inheritance — Dog IS-A Animal.",
      },
      {
        lineIndex: 11,
        question:
          "Which speak() version is called for animals[0] (Dog)?",
        expectedAnswer: "Dog.speak() → 'Woof!'",
        variables: { "animals[0].speak()": "Woof!" },
        explanation:
          "Polymorphism: Although the array is typed as Animal[], " +
          "JavaScript calls the OVERRIDDEN version of speak(). " +
          "Dog has override speak(), so Dog.speak() is executed.",
      },
      {
        lineIndex: 11,
        question:
          "What is the value of 'sounds' after the map() operation?",
        expectedAnswer: "['Woof!', 'Meow!', 'Silence']",
        variables: { "sounds": "['Woof!', 'Meow!', 'Silence']" },
        explanation:
          "Each element calls ITS version of speak(): " +
          "Dog → 'Woof!', Cat → 'Meow!', Animal → 'Silence'. " +
          "That is polymorphism in action — one common interface, " +
          "different implementations.",
      },
    ],
    concept: "polymorphism",
    difficulty: 1,
  },

  // ─── Exercise 2: this Context ───────────────────────────────────────────
  {
    id: "21-this-context",
    title: "The this Context — when does it get lost?",
    description:
      "Trace the value of 'this' in various call scenarios.",
    code: [
      "class Greeter {",
      "  name: string = 'World';",
      "",
      "  greet(): string {",
      "    return `Hello, ${this.name}!`;",
      "  }",
      "",
      "  greetArrow = (): string => {",
      "    return `Hello, ${this.name}!`;",
      "  };",
      "}",
      "",
      "const g = new Greeter();",
      "const normalFn = g.greet;",
      "const arrowFn = g.greetArrow;",
      "",
      "// g.greet();     → ???",
      "// normalFn();    → ???",
      "// arrowFn();     → ???",
    ],
    steps: [
      {
        lineIndex: 16,
        question:
          "What does g.greet() return?",
        expectedAnswer: "Hello, World!",
        variables: { "this": "Greeter instance", "this.name": "World" },
        explanation:
          "g.greet() calls the method with g as this. " +
          "this.name is 'World', so: 'Hello, World!'.",
      },
      {
        lineIndex: 17,
        question:
          "What happens with normalFn()? (const normalFn = g.greet)",
        expectedAnswer: "TypeError: Cannot read properties of undefined (reading 'name')",
        variables: { "this": "undefined (strict mode)" },
        explanation:
          "normalFn() calls the function WITHOUT object context. " +
          "In strict mode, 'this' is undefined. " +
          "'undefined.name' throws a TypeError. " +
          "This is the classic this-binding problem.",
      },
      {
        lineIndex: 18,
        question:
          "What does arrowFn() return?",
        expectedAnswer: "Hello, World!",
        variables: { "this": "Greeter instance (lexical binding)" },
        explanation:
          "Arrow functions as class fields capture 'this' lexically. " +
          "No matter how arrowFn is called — this is ALWAYS the Greeter instance. " +
          "That's why arrowFn() works correctly.",
      },
    ],
    concept: "this-binding",
    difficulty: 2,
  },

  // ─── Exercise 3: Static vs Instance ────────────────────────────────────
  {
    id: "21-static-vs-instance",
    title: "Static vs Instance — Separate Worlds",
    description:
      "Trace the difference between static and instance fields.",
    code: [
      "class Counter {",
      "  static total: number = 0;",
      "  count: number = 0;",
      "",
      "  increment(): void {",
      "    this.count++;",
      "    Counter.total++;",
      "  }",
      "}",
      "",
      "const a = new Counter();",
      "const b = new Counter();",
      "a.increment();",
      "a.increment();",
      "b.increment();",
      "",
      "console.log(a.count);        // ???",
      "console.log(b.count);        // ???",
      "console.log(Counter.total);  // ???",
    ],
    steps: [
      {
        lineIndex: 12,
        question:
          "After a.increment() and a.increment(): What values do a.count and Counter.total have?",
        expectedAnswer: "a.count = 2, Counter.total = 2",
        variables: { "a.count": "2", "b.count": "0", "Counter.total": "2" },
        explanation:
          "Each increment() call increases the instance field (this.count) " +
          "and the static field (Counter.total). a was incremented 2 times.",
      },
      {
        lineIndex: 14,
        question:
          "After b.increment(): What are a.count, b.count, Counter.total?",
        expectedAnswer: "a.count = 2, b.count = 1, Counter.total = 3",
        variables: { "a.count": "2", "b.count": "1", "Counter.total": "3" },
        explanation:
          "b has its OWN count field (starts at 0, now 1). " +
          "Counter.total is SHARED between all instances — " +
          "it counts all increment() calls in total (2+1=3).",
      },
      {
        lineIndex: 16,
        question:
          "Why is a.count != b.count but Counter.total = 3?",
        expectedAnswer: "Instance fields are per instance, static fields are global",
        variables: { "a.count": "2", "b.count": "1", "Counter.total": "3" },
        explanation:
          "This is the core of static vs instance: " +
          "Instance fields (this.count) belong to the instance — each has its own copy. " +
          "Static fields (Counter.total) belong to the CLASS — " +
          "there is only one copy, shared by all.",
      },
    ],
    concept: "static-vs-instance",
    difficulty: 2,
  },

  // ─── Exercise 4: Abstract + Polymorphism + super ────────────────────────
  {
    id: "21-abstract-polymorphism",
    title: "Abstract Class — Method Dispatch and super",
    description:
      "Trace the control flow through an abstract class " +
      "with Template Method Pattern and super calls.",
    code: [
      "abstract class Processor {",
      "  process(data: string): string {",
      "    const prepared = this.prepare(data);",
      "    const result = this.transform(prepared);",
      "    return `[DONE] ${result}`;",
      "  }",
      "  protected prepare(data: string): string {",
      "    return data.trim();",
      "  }",
      "  abstract transform(data: string): string;",
      "}",
      "",
      "class UpperProcessor extends Processor {",
      "  override transform(data: string): string {",
      "    return data.toUpperCase();",
      "  }",
      "  override prepare(data: string): string {",
      "    return super.prepare(data) + '!';",
      "  }",
      "}",
      "",
      "const p = new UpperProcessor();",
      "console.log(p.process('  hello  '));",
    ],
    steps: [
      {
        lineIndex: 22,
        question:
          "When p.process('  hello  ') is called — which class has process()?",
        expectedAnswer: "Processor (inherited, not overridden)",
        variables: { "data": "  hello  " },
        explanation:
          "UpperProcessor has not overridden process(), so " +
          "Processor.process() is executed. But INSIDE process() " +
          "this.prepare() and this.transform() are called — " +
          "and 'this' is UpperProcessor!",
      },
      {
        lineIndex: 2,
        question:
          "What does this.prepare('  hello  ') return? (Which version?)",
        expectedAnswer: "'hello!' (UpperProcessor.prepare: trim + '!')",
        variables: { "prepared": "hello!" },
        explanation:
          "UpperProcessor overrides prepare(). It calls super.prepare() " +
          "(the trim) and appends '!'. " +
          "Result: '  hello  '.trim() + '!' = 'hello!'.",
      },
      {
        lineIndex: 3,
        question:
          "What does this.transform('hello!') return?",
        expectedAnswer: "'HELLO!'",
        variables: { "result": "HELLO!" },
        explanation:
          "transform() is abstract in Processor and overridden in " +
          "UpperProcessor: data.toUpperCase(). 'hello!'.toUpperCase() = 'HELLO!'.",
      },
      {
        lineIndex: 4,
        question:
          "What is the final result of p.process('  hello  ')?",
        expectedAnswer: "[DONE] HELLO!",
        variables: { "return": "[DONE] HELLO!" },
        explanation:
          "process() assembles everything: prepare → transform → format. " +
          "Although process() is defined in Processor, it uses the " +
          "OVERRIDDEN versions from UpperProcessor. " +
          "That is the Template Method Pattern in action.",
      },
    ],
    concept: "abstract-template-method",
    difficulty: 4,
  },
];