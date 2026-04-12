/**
 * Lesson 12 — Misconception Exercises: Discriminated Unions
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
  {
    id: "12-string-discriminator-required",
    title: "Only strings work as discriminators",
    code: `type Success = { ok: true; data: string };
type Failure = { ok: false; error: string };
type Result = Success | Failure;

function handle(r: Result) {
  if (r.ok) { console.log(r.data); } // Works!
}`,
    commonBelief: "Only string literals can serve as discriminators.",
    reality:
      "Boolean and number literals also work as discriminators. " +
      "TypeScript narrows on `r.ok === true` just as well as on `r.kind === 'text'`. " +
      "Boolean discriminators are even naturally usable with if/else.",
    concept: "Discriminator Types",
    difficulty: 1,
  },

  {
    id: "12-destructuring-narrowing",
    title: "Destructuring works with narrowing",
    code: `type Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };

function area(shape: Shape) {
  const { kind } = shape;
  if (kind === "circle") {
    console.log(shape.radius); // Error! shape is still Shape
  }
}`,
    commonBelief: "If I destructure kind and check it, shape is automatically narrowed.",
    reality:
      "Destructuring breaks the connection to the original object. " +
      "TypeScript cannot trace back that the separate variable 'kind' " +
      "belongs to the object 'shape'. Solution: Check `shape.kind` directly.",
    concept: "Destructuring / Narrowing",
    difficulty: 3,
  },

  {
    id: "12-any-string-as-discriminator",
    title: "'type: string' works as a discriminator",
    code: `type A = { type: string; data: number };
type B = { type: string; items: string[] };
type Union = A | B;

function handle(u: Union) {
  if (u.type === "a") {
    // u is still Union — no narrowing!
  }
}`,
    commonBelief: "If I use type: string and check the value, TypeScript narrows.",
    reality:
      "The discriminator must be a LITERAL type ('a', not string). " +
      "With `type: string`, all string values are valid in both variants — " +
      "TypeScript cannot determine which variant is present. " +
      "Solution: `type: 'a'` and `type: 'b'` as literal types.",
    concept: "Literal Type as Discriminator",
    difficulty: 2,
  },

  {
    id: "12-exhaustive-check-always-needed",
    title: "assertNever is always required for exhaustive checks",
    code: `type Light = { color: "red" } | { color: "green" } | { color: "yellow" };

// Even without assertNever:
function action(light: Light): string {
  switch (light.color) {
    case "red": return "Stop";
    case "green": return "Go";
    case "yellow": return "Caution";
    // No default needed — TS knows all cases are covered
  }
}`,
    commonBelief: "You always need assertNever for exhaustive checks.",
    reality:
      "When a function has a return type, TypeScript automatically detects " +
      "whether all paths return a value. assertNever is useful when working " +
      "WITHOUT a return type, or when you want the error message to show " +
      "the missing type. Both approaches are valid.",
    concept: "Exhaustive Check / Return Type",
    difficulty: 2,
  },

  {
    id: "12-discriminated-unions-runtime-overhead",
    title: "Discriminated unions create runtime overhead",
    code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number };

// Compiled JavaScript:
// No difference from normal JavaScript code!`,
    commonBelief: "Discriminated unions generate additional JavaScript code.",
    reality:
      "Discriminated unions are a pure type feature — they generate " +
      "NO additional runtime code. The tag property is a normal " +
      "JavaScript property that exists anyway. The type information " +
      "disappears during compilation (type erasure). " +
      "Only the objects and switch statements remain.",
    concept: "Type Erasure / Zero-Cost Abstraction",
    difficulty: 2,
  },

  {
    id: "12-option-replaces-null",
    title: "Option<T> makes null/undefined completely obsolete",
    code: `type Option<T> = { tag: "some"; value: T } | { tag: "none" };

// In practice: TypeScript has built-in null checks
function find(id: string): User | undefined {
  // Works well with strictNullChecks too!
}`,
    commonBelief: "You should always use Option<T> instead of T | null.",
    reality:
      "Option<T> is a learning concept and useful for complex workflows. " +
      "For simple cases, T | null or T | undefined with strictNullChecks " +
      "is perfectly sufficient. TypeScript has built-in null narrowing. " +
      "Option<T> pays off for chaining (map/flatMap) or when you " +
      "consistently use the result pattern.",
    concept: "Option<T> / Pragmatism",
    difficulty: 3,
  },

  {
    id: "12-instanceof-is-better",
    title: "instanceof is better than discriminated unions",
    code: `// OOP approach:
class Circle { constructor(public radius: number) {} }
class Rect { constructor(public w: number, public h: number) {} }

function area(shape: Circle | Rect): number {
  if (shape instanceof Circle) return Math.PI * shape.radius ** 2;
  return shape.w * shape.h;
}

// DU approach: Also works with plain objects and JSON!`,
    commonBelief: "instanceof with classes is cleaner than discriminated unions.",
    reality:
      "instanceof only works with classes — not with plain objects, " +
      "JSON data, or API responses. Discriminated unions work with " +
      "ANY object. JSON.parse does not return an instanceof-compatible object. " +
      "In practice, you work with plain objects far more often " +
      "than with classes.",
    concept: "DU vs instanceof / Plain Objects",
    difficulty: 3,
  },

  {
    id: "12-switch-only-pattern",
    title: "Discriminated unions only work with switch",
    code: `type Result = { ok: true; data: string } | { ok: false; error: string };

// if/else works just as well:
function handle(r: Result) {
  if (r.ok) {
    console.log(r.data);   // TypeScript narrows!
  } else {
    console.log(r.error);  // Here too!
  }
}`,
    commonBelief: "You must always use switch/case to narrow discriminated unions.",
    reality:
      "if/else, early return, and ternary operators all work " +
      "with discriminated unions. TypeScript narrows everywhere the " +
      "discriminator is checked. switch/case is particularly clear " +
      "with many variants — but not required.",
    concept: "Narrowing Methods",
    difficulty: 1,
  },
];