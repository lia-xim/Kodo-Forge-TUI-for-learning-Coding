/**
 * Lesson 15 — Misconception Exercises: Utility Types
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
    id: "15-readonly-deep",
    title: "Readonly<T> protects nested objects",
    code: `interface User {
  name: string;
  address: { city: string };
}
const u: Readonly<User> = { name: "Max", address: { city: "Berlin" } };
u.address.city = "Munich"; // Error?`,
    commonBelief: "Readonly<T> makes EVERYTHING readonly — including nested properties.",
    reality:
      "Readonly<T> is SHALLOW. Only the first level is protected. " +
      "u.address.city = 'Munich' works because address.city " +
      "is NOT readonly — only the reference u.address is protected. " +
      "For deep readonly you need DeepReadonly.",
    concept: "Readonly / shallow vs deep",
    difficulty: 2,
  },

  {
    id: "15-omit-typesafe",
    title: "Omit catches typos",
    code: `interface User { id: number; name: string; email: string; }
type WithoutEmail = Omit<User, "emali">; // Typo!`,
    commonBelief: "Omit<User, 'emali'> should give a compile error — 'emali' doesn't exist.",
    reality:
      "Omit<T, K> accepts K extends string | number | symbol — " +
      "NOT K extends keyof T. Arbitrary strings are allowed. " +
      "'emali' is not found, so nothing is removed — " +
      "WithoutEmail is identical to User. " +
      "Solution: type StrictOmit<T, K extends keyof T> = Omit<T, K>.",
    concept: "Omit / type safety of keys",
    difficulty: 3,
  },

  {
    id: "15-partial-removes-types",
    title: "Partial removes the type information",
    code: `interface User { name: string; age: number; }
type PUser = Partial<User>;
const u: PUser = { name: "Max" };
// What type does u.name have?`,
    commonBelief: "u.name is string — the ? doesn't change the actual type.",
    reality:
      "Partial makes properties optional: name?: string. " +
      "That means name has the type string | undefined! " +
      "Even when name is set, TypeScript must account for the possibility " +
      "of undefined. You need a narrowing check " +
      "or NonNullable to safely access string.",
    concept: "Partial / optional = T | undefined",
    difficulty: 2,
  },

  {
    id: "15-extract-objects",
    title: "Extract/Exclude work on object properties",
    code: `interface User { id: number; name: string; email: string; }
type WithoutId = Exclude<User, "id">; // ???`,
    commonBelief: "Exclude<User, 'id'> removes the id property from the User interface.",
    reality:
      "Exclude works on UNION MEMBERS, not on object properties! " +
      "Exclude<User, 'id'> checks whether User is assignable to the type 'id' — " +
      "an object is not a string, so User remains unchanged. " +
      "For property removal: Omit<User, 'id'>. " +
      "Exclude is for union types: Exclude<'a' | 'b' | 'c', 'a'>.",
    concept: "Extract/Exclude vs Pick/Omit",
    difficulty: 3,
  },

  {
    id: "15-returntype-async",
    title: "ReturnType gives the unwrapped type for async functions",
    code: `async function fetchUser() { return { name: "Max" }; }
type User = ReturnType<typeof fetchUser>;
// User = { name: string } ?`,
    commonBelief: "ReturnType<typeof fetchUser> is { name: string }.",
    reality:
      "ReturnType gives the ACTUAL return type — for async " +
      "functions that is Promise<{ name: string }>, NOT { name: string }. " +
      "For the unwrapped type: Awaited<ReturnType<typeof fetchUser>>. " +
      "This is one of the most common misunderstandings with async.",
    concept: "ReturnType / async / Awaited",
    difficulty: 3,
  },

  {
    id: "15-record-flexible",
    title: "Record<string, T> and Record<K, T> are the same",
    code: `type A = Record<string, number>;
type B = Record<"x" | "y" | "z", number>;
// Same effect?`,
    commonBelief: "Record<string, T> and Record<'x'|'y'|'z', T> are similar enough.",
    reality:
      "Record<string, T> allows ARBITRARY string keys — " +
      "there is no compile-time check of which keys exist. " +
      "Record<'x'|'y'|'z', T> enforces EXACTLY these three keys — " +
      "missing or extra keys are compile errors. " +
      "The difference is like any vs a specific type.",
    concept: "Record / open vs closed keys",
    difficulty: 2,
  },

  {
    id: "15-required-partial-cancel",
    title: "Required<Partial<T>> always returns T",
    code: `interface User {
  name: string;
  bio?: string;
}
type A = Required<Partial<User>>;
type B = Partial<Required<User>>;
// A === B === User?`,
    commonBelief: "Required and Partial always cancel each other out.",
    reality:
      "Required<Partial<User>> first makes everything optional, then everything required. " +
      "Result: { name: string; bio: string } — bio is now REQUIRED! " +
      "Partial<Required<User>> first makes everything required, then everything optional. " +
      "Result: { name?: string; bio?: string } — name is now OPTIONAL! " +
      "The order is NOT irrelevant — it produces DIFFERENT types!",
    concept: "Composition order / Partial + Required",
    difficulty: 4,
  },

  {
    id: "15-pick-preserves-optional",
    title: "Pick makes properties always required",
    code: `interface User {
  name: string;
  bio?: string;
  avatar?: string;
}
type Picked = Pick<User, "name" | "bio">;
// bio is now required?`,
    commonBelief: "Pick creates a new type — all properties are required.",
    reality:
      "Pick PRESERVES the original modifier! If bio was optional in User " +
      "(bio?: string), it is also optional in Pick<User, 'name' | 'bio'>. " +
      "Pick changes neither optional nor readonly — it only selects. " +
      "For required after Pick: Required<Pick<User, 'name' | 'bio'>>.",
    concept: "Pick / modifier preservation",
    difficulty: 3,
  },
];