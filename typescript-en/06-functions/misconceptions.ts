/**
 * Lesson 06 — Misconception Exercises: Functions
 *
 * 8 misconceptions around function types, overloads, callbacks,
 * this, type guards, and more. Code that "obviously looks correct"
 * but is subtly wrong.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: void Callbacks May Return Values ──────────────────────────────
  {
    id: "06-void-callback-return",
    title: "void Callbacks Cannot Return Values",
    code: `type Logger = (msg: string) => void;

const logAndCount: Logger = (msg) => {
  console.log(msg);
  return msg.length; // Allowed or error?
};`,
    commonBelief:
      "A function with return type `void` cannot return a value. " +
      "`return msg.length` should be a compile error.",
    reality:
      "For callback types (type Logger = ... => void), void is TOLERANT. " +
      "The function may return a value — it is simply ignored. " +
      "This is intentional so that e.g. `forEach(n => arr.push(n))` works " +
      "(push returns number). Only for DIRECT function declarations is void strict.",
    concept: "void Callback Tolerance / Substitutability Principle",
    difficulty: 3,
  },

  // ─── 2: Optional and Default Together ────────────────────────────────
  {
    id: "06-optional-plus-default",
    title: "Using Optional and Default Together",
    code: `function createUser(name: string, role?: string = "user") {
  return { name, role };
}`,
    commonBelief:
      "`role?: string = 'user'` combines the best of both worlds: " +
      "the parameter is optional AND has a default value.",
    reality:
      "TypeScript forbids this combination. A default value makes the " +
      "parameter AUTOMATICALLY optional — the `?` is redundant and contradictory. " +
      "Correct: `role: string = 'user'` (without `?`). The default replaces undefined automatically.",
    concept: "Default Parameters / Optional Parameters",
    difficulty: 1,
  },

  // ─── 3: Overload Implementation Is Callable ───────────────────────────
  {
    id: "06-overload-implementation-callable",
    title: "The Implementation Signature Is Visible to Callers",
    code: `function format(x: string): string;
function format(x: number): string;
function format(x: string | number): string {
  return String(x);
}

format(true); // Should this work?`,
    commonBelief:
      "The implementation accepts `string | number`, so " +
      "`boolean` might also fit if the union is extended. At least " +
      "`string | number` should work as an argument.",
    reality:
      "The implementation signature is INVISIBLE to callers. " +
      "Only the overload signatures are callable. `format(true)` fails " +
      "because no overload accepts boolean. Even `format(x as string | number)` " +
      "would fail — the caller only sees the individual overloads.",
    concept: "Function Overloads / Implementation Signature",
    difficulty: 3,
  },

  // ─── 4: Arrow Function Has Its Own this ──────────────────────────────
  {
    id: "06-arrow-has-own-this",
    title: "Arrow Functions Bind this Like Regular Functions",
    code: `class Timer {
  seconds = 0;

  start() {
    setInterval(function() {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
}

new Timer().start(); // What happens?`,
    commonBelief:
      "`this.seconds` references the Timer instance because the function " +
      "is defined inside the start method. The 'this' is inherited.",
    reality:
      "Regular functions bind this DYNAMICALLY — when called by " +
      "setInterval, this is no longer the Timer instance (instead window " +
      "or undefined in strict mode). Arrow functions solve this problem " +
      "because they inherit this LEXICALLY from the surrounding scope: " +
      "`setInterval(() => { this.seconds++; }, 1000)`.",
    concept: "this Binding / Arrow vs Function",
    difficulty: 2,
  },

  // ─── 5: Type Guard Verifies Correctness ───────────────────────────────
  {
    id: "06-type-guard-verified",
    title: "TypeScript Verifies Whether a Type Guard Is Correctly Implemented",
    code: `function isNumber(value: unknown): value is number {
  return true; // Always true — regardless of input
}

const x: unknown = "hello";
if (isNumber(x)) {
  console.log(x.toFixed(2)); // Runtime error!
}`,
    commonBelief:
      "TypeScript ensures that a type guard is correct. " +
      "`return true` should be an error because not every value is a number.",
    reality:
      "TypeScript does NOT check whether a type guard is correctly implemented! " +
      "It is a contract: 'If true, then value is of this type.' " +
      "TypeScript trusts you blindly. `return true` compiles — but " +
      "at runtime x is still a string. Type guards are powerful, " +
      "but also dangerous when incorrectly implemented.",
    concept: "Type Guards / Compiler Trust",
    difficulty: 4,
  },

  // ─── 6: Destructuring Type Syntax ─────────────────────────────────────
  {
    id: "06-destructuring-type-syntax",
    title: "Correctly Typing Destructuring Parameters",
    code: `// "I type each parameter individually:"
function greet({ name: string, age: number }) {
  console.log(name, age);
}`,
    commonBelief:
      "`{ name: string, age: number }` gives name the type string and " +
      "age the type number — like regular parameters.",
    reality:
      "In destructuring syntax, `name: string` means a RENAMING: " +
      "the property 'name' is renamed to a variable called 'string'! " +
      "Correct is: `{ name, age }: { name: string; age: number }`. " +
      "The type comes AFTER the entire destructuring pattern.",
    concept: "Destructuring / Parameter Typing",
    difficulty: 2,
  },

  // ─── 7: Assertion Function Without throw ──────────────────────────────
  {
    id: "06-assertion-no-throw",
    title: "Assertion Functions Do Not Need to Throw",
    code: `function assertPositive(n: number): asserts n is number {
  if (n < 0) {
    console.log("Warning: Negative number!");
    // No throw — just a warning
  }
}

const value: number = -5;
assertPositive(value);
// TypeScript thinks: value is guaranteed to be a number`,
    commonBelief:
      "An assertion function does not necessarily need to throw an error. " +
      "A console.log as a warning is sufficient.",
    reality:
      "An assertion function MUST throw when the condition fails " +
      "(throw). If it returns normally, TypeScript assumes the assertion " +
      "was successful. Without throw for negative numbers the " +
      "function guarantees nothing — the contract with the compiler is broken. " +
      "TypeScript unfortunately does not check this statically.",
    concept: "Assertion Functions / Contract with the Compiler",
    difficulty: 4,
  },

  // ─── 8: Overloads Instead of Union ────────────────────────────────────
  {
    id: "06-overloads-instead-of-union",
    title: "Overloads Are Always Better Than Union Types",
    code: `// "I use overloads for maximum precision:"
function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]): number {
  return x.length;
}`,
    commonBelief:
      "Overloads are more precise than union types and should be preferred. " +
      "Two overloads are better than one union parameter.",
    reality:
      "The TypeScript team explicitly recommends: 'Prefer parameters with " +
      "union types instead of overloads when possible.' Here BOTH " +
      "overloads have the same return type (number) — a union suffices: " +
      "`function len(x: string | unknown[]): number`. Overloads are only " +
      "useful when the return type depends on the argument value.",
    concept: "Function Overloads / Union Types / Best Practice",
    difficulty: 3,
  },
];