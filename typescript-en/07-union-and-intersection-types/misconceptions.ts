/**
 * Lesson 07 — Misconception Exercises: Union & Intersection Types
 *
 * 8 misconceptions around Union/Intersection, Narrowing,
 * Discriminated Unions, and type compatibility.
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
    id: "07-union-all-methods",
    title: "Union provides access to all methods",
    code: `function format(value: string | number): string {
  return value.toUpperCase(); // Allowed?
}`,
    commonBelief:
      "string | number allows both string methods and number methods.",
    reality:
      "With unions, only SHARED operations are allowed. toUpperCase() " +
      "only exists on string, not on number. You must narrow first " +
      "with typeof. Unions UNITE the values, but NARROW the methods.",
    concept: "Union / shared operations",
    difficulty: 1,
  },

  {
    id: "07-intersection-means-either",
    title: "Intersection means 'either or'",
    code: `type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const p: Person = { name: "Max" }; // Is this enough?`,
    commonBelief:
      "Person is Named OR Aged — you only need one of the two.",
    reality:
      "Intersection (&) means AND, not OR. A Person value must have " +
      "BOTH name and age. { name: 'Max' } is missing age " +
      "and is a compile error. Union (|) would be 'or'.",
    concept: "Intersection / value set",
    difficulty: 1,
  },

  {
    id: "07-typeof-null",
    title: "typeof null is 'null'",
    code: `function process(x: string | null) {
  if (typeof x === "object") {
    // x is now string? Or null?
    console.log(x.toUpperCase());
  }
}`,
    commonBelief:
      "typeof null is 'null', so typeof x === 'object' would only match objects.",
    reality:
      "typeof null === 'object' — this is a notorious JavaScript bug " +
      "from 1995! After typeof x === 'object', x can still be null. " +
      "TypeScript narrows string | null to null (since null has typeof 'object'). " +
      "For null checks: if (x !== null) or if (x).",
    concept: "typeof null / JavaScript quirk",
    difficulty: 3,
  },

  {
    id: "07-exhaustive-without-never",
    title: "Switch without exhaustive check is safe",
    code: `type Shape = { type: 'circle'; r: number } | { type: 'rect'; w: number; h: number };

function area(shape: Shape): number {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'rect': return shape.w * shape.h;
  }
}
// Later: type Shape = ... | { type: 'triangle'; base: number; height: number };`,
    commonBelief:
      "The switch handles all cases — that's sufficient for safety.",
    reality:
      "Without an exhaustive check (default: const _: never = shape), " +
      "TypeScript does NOT notice when a new union member is added. " +
      "The function would silently return undefined. " +
      "The never trick is the safety net.",
    concept: "Exhaustive check / never",
    difficulty: 3,
  },

  {
    id: "07-intersection-conflict-silent",
    title: "Intersection conflicts are reported",
    code: `type A = { name: string; id: number };
type B = { name: number; email: string };
type AB = A & B;

// What is the type of AB.name?`,
    commonBelief:
      "TypeScript reports an error because name is string in A and number in B.",
    reality:
      "Intersection conflicts produce NO error! AB.name becomes " +
      "string & number = never. The object is theoretically valid, " +
      "but no value can ever satisfy name. With extends, " +
      "TypeScript would report the conflict as an error — one reason to prefer extends.",
    concept: "Intersection conflicts / never",
    difficulty: 4,
  },

  {
    id: "07-narrowing-reassignment",
    title: "Narrowing persists after reassignment",
    code: `function process(x: string | number) {
  if (typeof x === "string") {
    // x is string
    x = 42; // Reassignment
    console.log(x.toUpperCase()); // Does this still work?
  }
}`,
    commonBelief:
      "Once narrowed, x remains a string throughout the entire if block.",
    reality:
      "TypeScript tracks reassignments! After x = 42, x is number again. " +
      "x.toUpperCase() is an error. TypeScript's control flow analysis " +
      "is extremely precise — it tracks every assignment path.",
    concept: "Control flow analysis / reassignment",
    difficulty: 3,
  },

  {
    id: "07-discriminated-any-property",
    title: "Any shared property is a discriminator",
    code: `type A = { label: string; value: number };
type B = { label: string; data: string[] };
type AB = A | B;

function process(item: AB) {
  if (item.label === "test") {
    // Is item now A or B?
  }
}`,
    commonBelief:
      "label is a shared property, so you can narrow on it. " +
      "item.label === 'test' narrows the type.",
    reality:
      "A discriminator requires LITERAL TYPES that uniquely identify one member. " +
      "label is string in both types — 'test' can appear in BOTH. " +
      "No narrowing possible. For a discriminator " +
      "you need: { type: 'a' } | { type: 'b' } with different literals.",
    concept: "Discriminated unions / discriminator requirements",
    difficulty: 3,
  },

  {
    id: "07-union-property-access",
    title: "Optional properties in union members are accessible",
    code: `type Success = { status: 'ok'; data: string };
type Error = { status: 'error'; message: string };
type Result = Success | Error;

function handle(result: Result) {
  console.log(result.data); // Does this work?
}`,
    commonBelief:
      "result.data should be accessible — it exists in one of the union members.",
    reality:
      "data only exists in Success, not in Error. Without narrowing " +
      "TypeScript only allows shared properties — here only 'status'. " +
      "Only after if (result.status === 'ok') is result.data accessible. " +
      "This is the core of discriminated unions.",
    concept: "Union property access / narrowing",
    difficulty: 2,
  },
];