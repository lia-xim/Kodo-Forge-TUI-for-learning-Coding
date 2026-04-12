/**
 * Lesson 02 — Misconception Exercises: Primitive Types
 *
 * Code that looks "obviously correct" but is subtly wrong.
 * The learner must find the bug.
 */

export interface Misconception {
  id: string;
  title: string;
  /** The "obviously correct" code */
  code: string;
  /** What most people think */
  commonBelief: string;
  /** What actually happens */
  reality: string;
  /** Which concept is being tested */
  concept: string;
  /** Difficulty 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: typeof null ─────────────────────────────────────────────────────
  {
    id: "02-typeof-null",
    title: "typeof null returns 'null'",
    code: `function isNull(value: unknown): boolean {
  return typeof value === "null";
}

console.log(isNull(null));      // ???
console.log(isNull(undefined)); // ???`,
    commonBelief:
      "`typeof null` returns `\"null\"`, so you can use it to " +
      "check for null.",
    reality:
      "`typeof null` returns `\"object\"` — a notorious bug from " +
      "JavaScript 1.0 (1995) that was never fixed. " +
      "The function therefore always returns `false`, even for `null`! " +
      "The correct approach is `value === null` (strict equality).",
    concept: "null / typeof Bug",
    difficulty: 2,
  },

  // ─── 2: NaN equality ───────────────────────────────────────────────────
  {
    id: "02-nan-equality",
    title: "NaN equals NaN",
    code: `function isInvalid(value: number): boolean {
  return value === NaN;
}

const result = parseInt("hello");
console.log(isInvalid(result)); // ???`,
    commonBelief:
      "`NaN === NaN` is `true`, so you can check for invalid numbers " +
      "using `=== NaN`.",
    reality:
      "`NaN === NaN` is `false`! NaN is the only value in JavaScript " +
      "that is NOT equal to itself. The function always returns `false`. " +
      "Correct: `Number.isNaN(value)` or `isNaN(value)`. " +
      "Alternatively: `value !== value` is only `true` for NaN.",
    concept: "number / NaN Quirk",
    difficulty: 2,
  },

  // ─── 3: any and unknown interchangeable ─────────────────────────────────
  {
    id: "02-any-unknown-interchangeable",
    title: "any and unknown are interchangeable",
    code: `function processValue(value: unknown) {
  // "unknown is like any, but more modern"
  console.log(value.toUpperCase());
  console.log(value.length);
  console.log(value + 1);
}`,
    commonBelief:
      "`unknown` and `any` are both the 'accepts everything' type " +
      "and can be used interchangeably.",
    reality:
      "This code does NOT compile! `unknown` does allow any " +
      "assignment (just like `any`), but you can do NOTHING with an " +
      "`unknown` value without checking first. " +
      "No property access, no methods, no operations. " +
      "You must do type narrowing first (e.g. `typeof value === 'string'`). " +
      "That is the crucial safety advantage.",
    concept: "any vs unknown / Type Safety",
    difficulty: 2,
  },

  // ─── 4: String wrapper ──────────────────────────────────────────────────
  {
    id: "02-string-wrapper",
    title: "String and string are the same",
    code: `function greet(name: String) {
  return \`Hello, \${name}!\`;
}

const username: string = "Max";
greet(username); // Does this work?`,
    commonBelief:
      "`String` (uppercase) and `string` (lowercase) are " +
      "interchangeable in TypeScript — capitalization doesn't matter.",
    reality:
      "The code works by coincidence, but `String` (uppercase) is a " +
      "JavaScript wrapper object, not the primitive type. " +
      "The reverse does NOT work: `let x: string = new String('hello')` " +
      "produces an error. TypeScript warns: " +
      "'Don't use String as a type, use string instead'. " +
      "Rule of thumb: ALWAYS use lowercase.",
    concept: "Primitive vs. Wrapper Objects",
    difficulty: 1,
  },

  // ─── 5: void is undefined ──────────────────────────────────────────────
  {
    id: "02-void-is-undefined",
    title: "void and undefined are the same",
    code: `function logMessage(msg: string): void {
  console.log(msg);
}

// "void returns undefined, so I can use it like this:"
const result: undefined = logMessage("Hello");`,
    commonBelief:
      "`void` and `undefined` are the same — a void function " +
      "returns `undefined`, so the type is `undefined`.",
    reality:
      "This code does NOT compile! `void` and `undefined` are different " +
      "types. `void` means 'the return value should be ignored', " +
      "not 'returns undefined'. At runtime, a void function does actually " +
      "return `undefined`, but TypeScript treats the types differently. " +
      "You cannot assign `void` to `undefined`.",
    concept: "void vs undefined",
    difficulty: 3,
  },

  // ─── 6: Falsy check for 0 ──────────────────────────────────────────────
  {
    id: "02-falsy-zero",
    title: "|| as default for numbers",
    code: `interface ServerConfig {
  port: number;
  timeout: number;
}

function startServer(config: Partial<ServerConfig>) {
  const port = config.port || 3000;
  const timeout = config.timeout || 5000;
  console.log(\`Port: \${port}, Timeout: \${timeout}\`);
}

// Port 0 is a valid port (OS selects a free port):
startServer({ port: 0, timeout: 0 });
// Expected: Port: 0, Timeout: 0`,
    commonBelief:
      "`config.port || 3000` only returns 3000 when `port` is " +
      "`undefined` or `null` — making it a perfect default value.",
    reality:
      "`||` checks for ALL falsy values: `0`, `''`, `false`, `null`, " +
      "`undefined`, `NaN`. Since `0` is falsy, `0 || 3000` returns " +
      "`3000` — even though `0` is a valid port! " +
      "Correct: `config.port ?? 3000` (Nullish Coalescing). " +
      "`??` only checks for `null` and `undefined`.",
    concept: "Nullish Coalescing (??) vs. Logical OR (||)",
    difficulty: 2,
  },

  // ─── 7: never is void ──────────────────────────────────────────────────
  {
    id: "02-never-is-void",
    title: "never and void are interchangeable",
    code: `function handleError(message: string): void {
  throw new Error(message);
}

function process(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    console.log(value.toFixed(2));
  } else {
    // value is never here — all cases are covered
    handleError(\`Unexpected type: \${value}\`);
  }
}`,
    commonBelief:
      "The function `handleError` is correctly typed as `void` " +
      "because it doesn't return anything meaningful.",
    reality:
      "`handleError` should return `never`, not `void`. " +
      "A function that ALWAYS throws an error never returns. " +
      "The difference matters for Control Flow Analysis: " +
      "with `void`, TypeScript thinks code after the call could continue. " +
      "With `never`, TypeScript knows the path ends there — " +
      "improving type narrowing.",
    concept: "never vs void / Control Flow",
    difficulty: 4,
  },

  // ─── 8: Type widening for const objects ─────────────────────────────────
  {
    id: "02-const-object-widening",
    title: "const objects have literal types",
    code: `type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction) {
  console.log(\`Moving \${direction}\`);
}

const config = {
  startDirection: "north",
  speed: 10,
};

move(config.startDirection);`,
    commonBelief:
      "Since `config` is declared with `const`, " +
      '`config.startDirection` retains the literal type `"north"` — ' +
      "just like `const x = 'north'`.",
    reality:
      "The code produces a compiler error! `const` only protects " +
      "the variable itself from reassignment, not its properties. " +
      "You could write `config.startDirection = 'banana'`. " +
      "Therefore `startDirection` is widened to `string`, " +
      "and `string` does not match `Direction`. " +
      'Solution: `as const` or explicit annotation: `startDirection: "north" as const`.',
    concept: "Type Widening / const vs. as const",
    difficulty: 3,
  },
];