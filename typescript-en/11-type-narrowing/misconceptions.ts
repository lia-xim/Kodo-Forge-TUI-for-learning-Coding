/**
 * Lesson 11 — Misconception Exercises: Type Narrowing
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
  // ─── 1: typeof null Narrowing ──────────────────────────────────────────
  {
    id: "11-typeof-null-narrowing",
    title: "typeof === 'object' excludes null",
    code: `function processObject(value: object | string | null) {
  if (typeof value === "object") {
    // "value is now safely an object"
    console.log(Object.keys(value));
  }
}

processObject(null); // ???`,
    commonBelief:
      "After typeof === 'object', null is excluded because null " +
      "is not an object.",
    reality:
      "typeof null returns 'object'! After the check, value is " +
      "of type object | null. Object.keys(null) throws a TypeError. " +
      "Solution: Also check value !== null.",
    concept: "typeof null Bug / Narrowing",
    difficulty: 2,
  },

  // ─── 2: instanceof with Interfaces ─────────────────────────────────────
  {
    id: "11-instanceof-interface",
    title: "instanceof works with interfaces",
    code: `interface Animal {
  name: string;
  sound: string;
}

function isAnimal(value: unknown): boolean {
  return value instanceof Animal; // ???
}`,
    commonBelief:
      "instanceof can be used with interfaces just like with classes.",
    reality:
      "This code does NOT compile! Interfaces only exist at " +
      "compile time (Type Erasure). At runtime there is no " +
      "Animal object. Solution: in-operator or custom type guard.",
    concept: "instanceof / Type Erasure",
    difficulty: 2,
  },

  // ─── 3: Truthiness narrows too much ───────────────────────────────────
  {
    id: "11-truthiness-too-much",
    title: "if (x) is sufficient for null checks",
    code: `function formatValue(value: number | null): string {
  if (value) {
    return \`Value: \${value}\`;
  }
  return "No value";
}

console.log(formatValue(0));    // ???
console.log(formatValue(null)); // "No value"
console.log(formatValue(42));   // "Value: 42"`,
    commonBelief:
      "if (value) checks whether value is not null, so 0 is " +
      "a valid value that passes the check.",
    reality:
      "0 is falsy! formatValue(0) returns 'No value' instead of 'Value: 0'. " +
      "Truthiness checks exclude 0, '', false, and NaN. " +
      "Solution: if (value !== null) or value ?? 'No value'.",
    concept: "Truthiness Narrowing / Falsy values",
    difficulty: 2,
  },

  // ─── 4: Type Guard without runtime check ──────────────────────────────
  {
    id: "11-bad-type-guard",
    title: "Type guards are checked by the compiler",
    code: `interface Admin {
  role: "admin";
  permissions: string[];
}

function isAdmin(user: unknown): user is Admin {
  return true; // "Should be fine"
}

function deleteUser(user: unknown) {
  if (isAdmin(user)) {
    console.log(user.permissions.join(", "));
  }
}

deleteUser({ name: "Max" }); // ???`,
    commonBelief:
      "TypeScript checks whether the type guard is correctly implemented. " +
      "If the logic is wrong, there will be a compile error.",
    reality:
      "TypeScript trusts type guards BLINDLY! If isAdmin always " +
      "returns true, every value is treated as Admin. " +
      "user.permissions is undefined, .join() crashes at runtime. " +
      "Type guards are like 'as' — YOU are responsible.",
    concept: "Type Predicates / Trust principle",
    difficulty: 3,
  },

  // ─── 5: Narrowing across function boundaries ──────────────────────────
  {
    id: "11-narrowing-across-functions",
    title: "Narrowing works across function calls",
    code: `function isNotNull(value: unknown): boolean {
  return value !== null;
}

function process(value: string | null) {
  if (isNotNull(value)) {
    // "value is now string"
    console.log(value.toUpperCase()); // ???
  }
}`,
    commonBelief:
      "If isNotNull returns true, TypeScript knows that value " +
      "is not null, so value is a string in the if block.",
    reality:
      "TypeScript does NOT narrow across regular function calls! " +
      "isNotNull returns boolean — TypeScript does not know " +
      "WHICH check the function performs. value remains string | null. " +
      "Solution: Type guard with 'is': (value: unknown): value is string.",
    concept: "Narrowing boundaries / Type Predicates",
    difficulty: 3,
  },

  // ─── 6: Narrowing in Callbacks ────────────────────────────────────────
  {
    id: "11-narrowing-in-callbacks",
    title: "Narrowing survives callbacks",
    code: `function processLater(value: string | null) {
  if (value !== null) {
    // value: string — safe!
    setTimeout(() => {
      // "value is still string"
      console.log(value.toUpperCase());
    }, 1000);
  }
}`,
    commonBelief:
      "value could change before the callback is executed, " +
      "so the narrowing is invalid.",
    reality:
      "Surprise: This actually works! TypeScript recognizes that " +
      "value is a const parameter (not reassignable). " +
      "In the closure, value is captured as a string. " +
      "BUT: With let variables it would be different — TypeScript does NOT " +
      "narrow let variables in closures, because they could change.",
    concept: "Narrowing in Closures / const vs let",
    difficulty: 4,
  },

  // ─── 7: Exhaustive check forgotten ────────────────────────────────────
  {
    id: "11-missing-exhaustive",
    title: "switch without default is exhaustive",
    code: `type Color = "red" | "green" | "blue";

function toHex(color: Color): string {
  switch (color) {
    case "red":   return "#ff0000";
    case "green": return "#00ff00";
    case "blue":  return "#0000ff";
  }
  // No default needed — all cases covered
}

// Later: type Color = "red" | "green" | "blue" | "yellow";
// toHex("yellow"); // ???`,
    commonBelief:
      "TypeScript automatically recognizes that all cases are covered. " +
      "If a new value is added, there will be an error.",
    reality:
      "Without assertNever in the default, TypeScript gives NO guaranteed " +
      "error in the switch for a new value. The function could " +
      "implicitly return undefined (with noImplicitReturns there is " +
      "a warning, but no error IN the switch). " +
      "assertNever is the safe pattern.",
    concept: "Exhaustive Checks / assertNever",
    difficulty: 3,
  },

  // ─── 8: filter with null before TS 5.5 ───────────────────────────────
  {
    id: "11-filter-before-5-5",
    title: "filter removes null from the type (before TS 5.5)",
    code: `// Before TS 5.5:
const items: (string | null)[] = ["a", null, "b"];
const clean = items.filter(x => x !== null);
// "clean is now string[]"
clean.map(s => s.toUpperCase()); // ???`,
    commonBelief:
      "filter(x => x !== null) removes null from the type, so " +
      "the result is string[].",
    reality:
      "Before TypeScript 5.5, the type of clean was STILL " +
      "(string | null)[]. filter() did not change the type automatically. " +
      "You had to write .filter((x): x is string => x !== null). " +
      "From TS 5.5 onwards it works automatically (Inferred Type Predicates).",
    concept: "TS 5.5 Inferred Type Predicates / filter",
    difficulty: 3,
  },
];