/**
 * Lesson 21 — Debugging Challenges: Classes & OOP
 *
 * 5 challenges covering typical class bugs in TypeScript.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: super() forgotten ───────────────────────────────────
  {
    id: "L21-D1",
    title: "super() forgotten in Constructor",
    buggyCode: [
      "class Animal {",
      "  constructor(public name: string) {}",
      "}",
      "",
      "class Dog extends Animal {",
      "  constructor(name: string, public breed: string) {",
      "    this.breed = breed;",
      "  }",
      "}",
    ].join("\n"),
    errorMessage: "'super' must be called before accessing 'this' in the constructor of a derived class.",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "super() is missing — must be the FIRST statement in the subclass constructor",
      "this.breed must not be set in the constructor",
      "Dog must use 'implements' instead of 'extends'",
      "The constructor does not need a breed parameter",
    ],
    correctOption: 0,
    hints: [
      "Subclass constructors must initialize the parent class. How?",
      "super() calls the parent constructor and MUST come before any 'this' access.",
      "Add 'super(name);' as the first line in the Dog constructor.",
    ],
    fixedCode: [
      "class Animal {",
      "  constructor(public name: string) {}",
      "}",
      "",
      "class Dog extends Animal {",
      "  constructor(name: string, public breed: string) {",
      "    super(name);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "In a subclass, super() must be called as the FIRST statement in the constructor " +
      "— before any access to 'this'. Without super(), 'this' is not yet initialized. " +
      "With parameter properties (public breed), the assignment happens automatically " +
      "AFTER super(), so it is enough to add super(name).",
    concept: "super-aufruf",
    difficulty: 1,
  },

  // ─── Challenge 2: this context lost ───────────────────────────────────
  {
    id: "L21-D2",
    title: "this context lost when passed as callback",
    buggyCode: [
      "class Timer {",
      "  seconds: number = 0;",
      "",
      "  tick(): void {",
      "    this.seconds++;",
      "    console.log(this.seconds);",
      "  }",
      "",
      "  start(): void {",
      "    setInterval(this.tick, 1000);",
      "  }",
      "}",
      "",
      "const timer = new Timer();",
      "timer.start(); // Error: Cannot read properties of undefined",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "runtime-error",
    bugLine: 10,
    options: [
      "setInterval cannot execute class methods",
      "this.tick loses its this context — 'this' is undefined inside the callback",
      "seconds must be static for setInterval",
      "Timer must extend EventEmitter",
    ],
    correctOption: 1,
    hints: [
      "What happens to 'this' when you pass a method as a callback?",
      "'const fn = obj.method; fn()' — which 'this' does fn() have?",
      "Solution: arrow function (this.tick = () => {...}) or setInterval(() => this.tick(), 1000).",
    ],
    fixedCode: [
      "class Timer {",
      "  seconds: number = 0;",
      "",
      "  tick = (): void => {",
      "    this.seconds++;",
      "    console.log(this.seconds);",
      "  };",
      "",
      "  start(): void {",
      "    setInterval(this.tick, 1000);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "In JavaScript, 'this' depends on the call context. " +
      "'setInterval(this.tick, 1000)' stores the FUNCTION tick, " +
      "but not the context (the Timer object). When setInterval " +
      "calls tick(), 'this' is undefined (strict mode). " +
      "Solution: arrow function as a class field (tick = () => {...}) " +
      "binds 'this' lexically to the instance.",
    concept: "this-binding",
    difficulty: 2,
  },

  // ─── Challenge 3: private bypassed at runtime ──────────────────────
  {
    id: "L21-D3",
    title: "private does not protect at runtime",
    buggyCode: [
      "class SecureVault {",
      "  private secret: string;",
      "",
      "  constructor(secret: string) {",
      "    this.secret = secret;",
      "  }",
      "",
      "  verify(attempt: string): boolean {",
      "    return attempt === this.secret;",
      "  }",
      "}",
      "",
      "const vault = new SecureVault('my-password');",
      "",
      "// 'Secure' — really?",
      "const stolen = (vault as any).secret;",
      "console.log(stolen); // 'my-password'",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 2,
    options: [
      "TypeScript's 'private' is removed at runtime — 'as any' bypasses the protection",
      "The constructor initializes the field incorrectly",
      "'as any' is a syntax error",
      "private fields cannot be compared with strings",
    ],
    correctOption: 0,
    hints: [
      "What happens to TypeScript's 'private' after compilation? (Type Erasure)",
      "In the generated JavaScript there is no 'private' — the field is a normal property.",
      "For true runtime protection, use '#secret' (ES2022 Private Fields).",
    ],
    fixedCode: [
      "class SecureVault {",
      "  #secret: string;",
      "",
      "  constructor(secret: string) {",
      "    this.#secret = secret;",
      "  }",
      "",
      "  verify(attempt: string): boolean {",
      "    return attempt === this.#secret;",
      "  }",
      "}",
      "",
      "const vault = new SecureVault('my-password');",
      "// (vault as any).#secret; // Syntax error — true encapsulation!",
    ].join("\n"),
    explanation:
      "TypeScript's 'private' is a compile-time feature — at runtime " +
      "it is erased (Type Erasure). With 'as any' anyone can access it. " +
      "For true runtime protection, JavaScript's '#private' " +
      "(ES2022) must be used. '#secret' is not accessible even with " +
      "'as any' and does not appear in Object.keys().",
    concept: "private-vs-hash-private",
    difficulty: 2,
  },

  // ─── Challenge 4: abstract method not implemented ─────────────────────
  {
    id: "L21-D4",
    title: "Abstract method not implemented",
    buggyCode: [
      "abstract class Validator {",
      "  abstract validate(value: unknown): boolean;",
      "  abstract getErrorMessage(): string;",
      "",
      "  check(value: unknown): string | null {",
      "    if (this.validate(value)) return null;",
      "    return this.getErrorMessage();",
      "  }",
      "}",
      "",
      "class EmailValidator extends Validator {",
      "  validate(value: unknown): boolean {",
      "    return typeof value === 'string' && value.includes('@');",
      "  }",
      "  // getErrorMessage() is missing!",
      "}",
    ].join("\n"),
    errorMessage:
      "Non-abstract class 'EmailValidator' does not implement inherited abstract member 'getErrorMessage' from class 'Validator'.",
    bugType: "type-error",
    bugLine: 11,
    options: [
      "EmailValidator must implement getErrorMessage() — it is abstract",
      "validate() must be marked with 'override'",
      "abstract classes cannot have concrete methods",
      "extends does not work with abstract classes",
    ],
    correctOption: 0,
    hints: [
      "Count the abstract methods in Validator. Are all of them implemented in EmailValidator?",
      "getErrorMessage() is abstract — subclasses MUST implement it.",
      "Add 'getErrorMessage(): string { return \"Invalid email\"; }'.",
    ],
    fixedCode: [
      "abstract class Validator {",
      "  abstract validate(value: unknown): boolean;",
      "  abstract getErrorMessage(): string;",
      "",
      "  check(value: unknown): string | null {",
      "    if (this.validate(value)) return null;",
      "    return this.getErrorMessage();",
      "  }",
      "}",
      "",
      "class EmailValidator extends Validator {",
      "  validate(value: unknown): boolean {",
      "    return typeof value === 'string' && value.includes('@');",
      "  }",
      "",
      "  getErrorMessage(): string {",
      "    return 'Invalid email address';",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "When a class inherits from an abstract class, it MUST implement all " +
      "abstract methods. EmailValidator only implements validate(), " +
      "but not getErrorMessage(). TypeScript reports the error at compile time " +
      "— at runtime it would be an undefined method call when check() " +
      "invokes getErrorMessage().",
    concept: "abstract-implementierung",
    difficulty: 2,
  },

  // ─── Challenge 5: Override typo without override keyword ────────────────
  {
    id: "L21-D5",
    title: "Method not overridden due to typo",
    buggyCode: [
      "class Logger {",
      "  log(message: string): void {",
      "    console.log(`[LOG] ${message}`);",
      "  }",
      "}",
      "",
      "class TimestampLogger extends Logger {",
      "  // Should override log(), but has a typo!",
      "  logg(message: string): void {",
      "    const time = new Date().toISOString();",
      "    console.log(`[${time}] ${message}`);",
      "  }",
      "}",
      "",
      "const logger = new TimestampLogger();",
      "logger.log('Test'); // [LOG] Test — NOT with timestamp!",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "logg() is a typo — log() is not overridden",
      "TimestampLogger must use 'implements Logger'",
      "super.log() must be called",
      "console.log cannot be used with template strings",
    ],
    correctOption: 0,
    hints: [
      "Compare the method name in Logger and TimestampLogger carefully.",
      "'logg' != 'log' — the method was not overridden, a new one was defined instead.",
      "With 'override', TypeScript would catch the typo: 'override logg()' → Error.",
    ],
    fixedCode: [
      "class Logger {",
      "  log(message: string): void {",
      "    console.log(`[LOG] ${message}`);",
      "  }",
      "}",
      "",
      "class TimestampLogger extends Logger {",
      "  override log(message: string): void {",
      "    const time = new Date().toISOString();",
      "    console.log(`[${time}] ${message}`);",
      "  }",
      "}",
      "",
      "const logger = new TimestampLogger();",
      "logger.log('Test'); // [2024-01-15T...] Test — with timestamp!",
    ].join("\n"),
    explanation:
      "'logg' instead of 'log' — a classic typo. Without 'override', " +
      "TypeScript simply creates a new method 'logg()' and log() remains " +
      "the parent version. With 'override log()' (or noImplicitOverride: true) " +
      "TypeScript would check whether the method exists in the parent class — " +
      "and report the typo immediately.",
    concept: "override-keyword",
    difficulty: 3,
  },
];