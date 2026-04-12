/**
 * Lesson 04 -- Completion Problems: Arrays & Tuples
 *
 * Fill-in-the-blank exercises with increasing difficulty.
 * The learner must replace the placeholders (___) with correct code.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Basics — annotating array types ───────────────────────────────────
  {
    id: "04-cp-01",
    title: "Correctly annotating array types",
    description:
      "Complete the type annotations so the code compiles. " +
      "Use the shorter syntax (T[]) where possible.",
    template: `// 1. An array of strings
const names: ___(1)___ = ["Alice", "Bob", "Charlie"];

// 2. An array of arrays (2D array)
const matrix: ___(2)___ = [[1, 2], [3, 4], [5, 6]];

// 3. A readonly array of numbers
const PRIMES: ___(3)___ = [2, 3, 5, 7, 11];

// PRIMES.push(13); // Should be a compile error!`,
    solution: `const names: string[] = ["Alice", "Bob", "Charlie"];

const matrix: number[][] = [[1, 2], [3, 4], [5, 6]];

const PRIMES: readonly number[] = [2, 3, 5, 7, 11];`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "string[]",
        hint: "Which type describes an array of strings?",
      },
      {
        placeholder: "___(2)___",
        answer: "number[][]",
        hint: "An array of arrays of numbers — nested square brackets.",
      },
      {
        placeholder: "___(3)___",
        answer: "readonly number[]",
        hint: "Which keyword prevents mutation at compile time?",
      },
    ],
    concept: "Array type syntax and readonly",
  },

  // ─── 2: Defining tuple types ───────────────────────────────────────────────
  {
    id: "04-cp-02",
    title: "Tuple types for fixed structures",
    description:
      "Define the tuple types that match the given values.",
    template: `// 1. A pair of name and age
type PersonInfo = ___(1)___;
const alice: PersonInfo = ["Alice", 30];

// 2. An RGB color value (three numbers)
type RGB = ___(2)___;
const red: RGB = [255, 0, 0];

// 3. A tuple with an optional third element
type Coordinate = ___(3)___;
const flat: Coordinate = [10, 20];
const spatial: Coordinate = [10, 20, 30];`,
    solution: `type PersonInfo = [string, number];
const alice: PersonInfo = ["Alice", 30];

type RGB = [number, number, number];
const red: RGB = [255, 0, 0];

type Coordinate = [number, number, number?];
const flat: Coordinate = [10, 20];
const spatial: Coordinate = [10, 20, 30];`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "[string, number]",
        hint: "Position 0 is a name (string), position 1 an age (number).",
      },
      {
        placeholder: "___(2)___",
        answer: "[number, number, number]",
        hint: "Three numbers for R, G, and B — each position has the type number.",
      },
      {
        placeholder: "___(3)___",
        answer: "[number, number, number?]",
        hint: "The third position is optional — use the '?' syntax.",
      },
    ],
    concept: "Tuple definition and optional elements",
  },

  // ─── 3: Type predicate for filter() ───────────────────────────────────────
  {
    id: "04-cp-03",
    title: "Type-safe filter() with type predicate",
    description:
      "Complete the filter() call so TypeScript narrows the type correctly. " +
      "Without a type predicate, the type remains too broad.",
    template: `interface User {
  name: string;
  email: string | null;
}

const users: User[] = [
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: null },
  { name: "Charlie", email: "charlie@example.com" },
];

// Only users with email — but type-safe!
type UserWithEmail = ___(1)___;

const usersWithEmail: UserWithEmail[] = users.filter(
  (user): ___(2)___ => ___(3)___
);

// This should now work without errors:
usersWithEmail.forEach(u => console.log(u.email.toUpperCase()));`,
    solution: `type UserWithEmail = User & { email: string };

const usersWithEmail: UserWithEmail[] = users.filter(
  (user): user is UserWithEmail => user.email !== null
);`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "User & { email: string }",
        hint: "Intersection: A User where email is guaranteed to be string (not null).",
      },
      {
        placeholder: "___(2)___",
        answer: "user is UserWithEmail",
        hint: "Type predicate syntax: 'parameter is TypeName'",
      },
      {
        placeholder: "___(3)___",
        answer: "user.email !== null",
        hint: "The condition that checks whether email is present.",
      },
    ],
    concept: "Type predicates with filter() and intersection types",
  },

  // ─── 4: Combining as const and satisfies ──────────────────────────────────
  {
    id: "04-cp-04",
    title: "Combining 'as const' and 'satisfies'",
    description:
      "Use 'as const' for literal types and 'satisfies' for validation. " +
      "The goal: narrow types AND compile-time checking.",
    template: `// Define a type for allowed HTTP methods
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Create a readonly tuple with validation
const ALLOWED_METHODS = ___(1)___;
// Should have the type readonly ["GET", "POST"] (not readonly HttpMethod[])
// AND only compiles if all values are valid HttpMethod

// Use the type to derive a union
type AllowedMethod = ___(2)___;
// Should be "GET" | "POST" (not string and not HttpMethod)

// Create a type-safe lookup function
function isAllowed(method: string): method is AllowedMethod {
  return ___(3)___.includes(method as AllowedMethod);
}`,
    solution: `const ALLOWED_METHODS = ["GET", "POST"] as const satisfies readonly HttpMethod[];

type AllowedMethod = (typeof ALLOWED_METHODS)[number];

function isAllowed(method: string): method is AllowedMethod {
  return (ALLOWED_METHODS as readonly string[]).includes(method);
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: '["GET", "POST"] as const satisfies readonly HttpMethod[]',
        hint: "'as const' for literal types, 'satisfies' for validation.",
      },
      {
        placeholder: "___(2)___",
        answer: "(typeof ALLOWED_METHODS)[number]",
        hint: "Indexed access: typeof for the value, [number] for the union of elements.",
      },
      {
        placeholder: "___(3)___",
        answer: "(ALLOWED_METHODS as readonly string[])",
        hint: "includes() on readonly tuples needs a small type assertion.",
      },
    ],
    concept: "as const + satisfies + typeof + indexed access",
  },

  // ─── 5: Variadic tuple types ───────────────────────────────────────────────
  {
    id: "04-cp-05",
    title: "Variadic tuple types for flexible functions",
    description:
      "Implement a type-safe 'prepend' function that prepends an element " +
      "to a tuple. The length and types must be preserved.",
    template: `// A function that prepends an element
function prepend<T, ___(1)___>(
  element: T,
  tuple: [...Rest]
): ___(2)___ {
  return [element, ...tuple];
}

// Tests — these must all compile:
const r1 = prepend("hello", [1, true]);
// Expected type: [string, number, boolean]

const r2 = prepend(0, ["a", "b"]);
// Expected type: [number, string, string]

const r3 = prepend(true, []);
// Expected type: ___(3)___`,
    solution: `function prepend<T, Rest extends unknown[]>(
  element: T,
  tuple: [...Rest]
): [T, ...Rest] {
  return [element, ...tuple];
}

const r1 = prepend("hello", [1, true]);
const r2 = prepend(0, ["a", "b"]);
const r3 = prepend(true, []);
// Type of r3: [boolean]`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "Rest extends unknown[]",
        hint: "A generic type parameter that represents any tuple.",
      },
      {
        placeholder: "___(2)___",
        answer: "[T, ...Rest]",
        hint: "The new element T at the front, followed by the rest of the original tuple.",
      },
      {
        placeholder: "___(3)___",
        answer: "[boolean]",
        hint: "true with an empty rest yields a tuple with one element.",
      },
    ],
    concept: "Variadic tuple types and generic constraints",
  },

  // ─── 6: Readonly safety for function parameters ───────────────────────────
  {
    id: "04-cp-06",
    title: "Readonly-correct function signatures",
    description:
      "Fix the function signatures so they accept both mutable and " +
      "readonly arrays and correctly prevent mutation.",
    template: `// Problem: This function does not accept readonly arrays!
// function getFirst(arr: string[]): string | undefined {
//   return arr[0];
// }
// const ro: readonly string[] = ["a", "b"];
// getFirst(ro); // Error!

// Solution: Fix the signature
function getFirst(arr: ___(1)___): string | undefined {
  return arr[0];
}

// This function SHOULD modify the array — the caller needs to know this
function addItem(arr: ___(2)___, item: string): void {
  arr.push(item);
}

// This function returns a sorted copy without modifying the original
function sortedCopy(arr: ___(3)___): string[] {
  return [...arr].sort();
}

// All three should work with readonly and mutable arrays:
const mutable: string[] = ["c", "a", "b"];
const immutable: readonly string[] = ["x", "y", "z"];

getFirst(mutable);    // OK
getFirst(immutable);  // OK
addItem(mutable, "d"); // OK
// addItem(immutable, "d"); // Should be an error!
sortedCopy(mutable);  // OK
sortedCopy(immutable); // OK`,
    solution: `function getFirst(arr: readonly string[]): string | undefined {
  return arr[0];
}

function addItem(arr: string[], item: string): void {
  arr.push(item);
}

function sortedCopy(arr: readonly string[]): string[] {
  return [...arr].sort();
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "readonly string[]",
        hint: "readonly accepts both mutable and readonly arrays.",
      },
      {
        placeholder: "___(2)___",
        answer: "string[]",
        hint: "Here it MUST be mutable, since push() is called.",
      },
      {
        placeholder: "___(3)___",
        answer: "readonly string[]",
        hint: "The function does not mutate — so readonly for maximum compatibility.",
      },
    ],
    concept: "readonly for function parameters — when mutable, when readonly",
  },
];