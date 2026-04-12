/**
 * Lektion 13 — Fehlkonzeption-Exercises: Generics Basics
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
    id: "13-generics-like-any",
    title: "Generics are the same as any",
    code: `function withAny(x: any): any { return x; }
function withGeneric<T>(x: T): T { return x; }

const a = withAny("hallo");     // any
const b = withGeneric("hallo"); // string`,
    commonBelief: "Generics and any are interchangeable — both accept any type.",
    reality:
      "Generics PRESERVE the type: withGeneric('hallo') returns string. " +
      "any LOSES the type: withAny('hallo') returns any. " +
      "Generics connect input and output — any separates them.",
    concept: "Generics vs. any / Type Preservation",
    difficulty: 1,
  },

  {
    id: "13-t-is-fixed-type",
    title: "T is a concrete type named 'T'",
    code: `function identity<T>(arg: T): T {
  return arg;
}
// T is NOT a type named T — it is a placeholder!`,
    commonBelief: "T is a special built-in type in TypeScript.",
    reality:
      "T is a PARAMETER — a placeholder that is replaced at call time. " +
      "T, U, MyType, TData — all are valid names for type parameters. " +
      "T is just a convention (T for Type). You could also write " +
      "<Potato>(arg: Potato): Potato.",
    concept: "Type Parameter / Placeholder",
    difficulty: 1,
  },

  {
    id: "13-inference-always-works",
    title: "TypeScript can always infer T",
    code: `function createArray<T>(): T[] {
  return [];
}
// const arr = createArray(); // Error! T unknown
const arr = createArray<string>(); // Must be explicit`,
    commonBelief: "TypeScript always infers T automatically — you never need to specify T.",
    reality:
      "Inference only works when T appears in the parameters. " +
      "When T only appears in the return type (like with createArray), " +
      "TypeScript has no information to infer from. " +
      "Then you must specify T explicitly: createArray<string>().",
    concept: "Type Inference / Limits",
    difficulty: 2,
  },

  {
    id: "13-constraint-is-exact",
    title: "T extends X means T is exactly X",
    code: `function printId<T extends { id: number }>(entity: T): void {
  console.log(entity.id);
}
// T is not { id: number } — T is the FULL type of the argument!
printId({ id: 1, name: "Max", email: "max@test.de" });
// T = { id: number; name: string; email: string }`,
    commonBelief: "extends restricts T to exactly the constraint type.",
    reality:
      "extends is a MINIMUM REQUIREMENT, not an exact restriction. " +
      "T retains the FULL type of the argument — with all additional " +
      "properties. The constraint only guarantees that certain properties " +
      "are present. T can have MORE.",
    concept: "Constraints / Minimum Requirement vs. Exact Type",
    difficulty: 3,
  },

  {
    id: "13-keyof-returns-values",
    title: "keyof returns the values of an object",
    code: `const user = { name: "Max", age: 30 };
type UserKeys = keyof typeof user;
// "name" | "age" — the KEYS, not "Max" | 30!`,
    commonBelief: "keyof typeof user yields 'Max' | 30 — the values.",
    reality:
      "keyof returns the KEYS (property names) as a union, " +
      "not the values. keyof typeof user = 'name' | 'age'. " +
      "For the values you would need typeof user[keyof typeof user] " +
      "(= string | number in this example).",
    concept: "keyof / Keys vs. Values",
    difficulty: 2,
  },

  {
    id: "13-single-t-useful",
    title: "Every type parameter is useful",
    code: `// BAD: T only appears once
function log<T>(value: T): void {
  console.log(value);
}
// Better: function log(value: unknown): void`,
    commonBelief: "More generics = better code. Every <T> makes the function more flexible.",
    reality:
      "A type parameter that only appears ONCE connects nothing. " +
      "It could be replaced by unknown without any loss of information. " +
      "Generics are useful when they establish a RELATIONSHIP — " +
      "e.g., between input and output. Use them at least twice!",
    concept: "Unnecessary Type Parameters / Anti-Pattern",
    difficulty: 2,
  },

  {
    id: "13-default-overrides-explicit",
    title: "Default type cannot be overridden",
    code: `interface Box<T = string> { content: T; }

const a: Box = { content: "hallo" };          // T = string (default)
const b: Box<number> = { content: 42 };        // T = number (overridden!)`,
    commonBelief: "If T has a default, T is always that default type.",
    reality:
      "Defaults are only FALLBACKS — they apply when nothing is specified. " +
      "Box<number> overrides the default completely. " +
      "The default only kicks in when T is omitted: Box = Box<string>.",
    concept: "Default Type Parameter / Fallback vs. Fixed",
    difficulty: 2,
  },

  {
    id: "13-runtime-type-parameter",
    title: "Type parameters exist at runtime",
    code: `function create<T>(): T {
  // Can T be accessed here?
  // console.log(T); // Error! T does not exist at runtime
  return {} as T; // Must cast — T is "gone"
}`,
    commonBelief: "You can access T inside the function and create objects of type T.",
    reality:
      "Type parameters only exist at COMPILE TIME — they are completely " +
      "removed by type erasure. In the generated JavaScript there is no T. " +
      "You cannot create an instance of T, call typeof T, or " +
      "use T as a value. For that you need constructor parameters.",
    concept: "Type Erasure / Compile Time vs. Runtime",
    difficulty: 3,
  },
];