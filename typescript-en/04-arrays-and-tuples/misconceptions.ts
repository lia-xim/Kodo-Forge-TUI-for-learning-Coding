/**
 * Lektion 04 -- Fehlkonzeptionen: Arrays & Tuples
 *
 * Code-Snippets die "offensichtlich richtig" aussehen, aber subtil falsch sind.
 * Jede Misconception deckt einen haeufigen Denkfehler auf.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number; // 1 = leicht zu erkennen, 5 = sehr subtil
}

export const misconceptions: Misconception[] = [
  // ─── 1: readonly verhindert push() zur Laufzeit ────────────────────────────
  {
    id: "04-mc-01",
    title: "readonly prevents mutation at runtime",
    code: `const names: readonly string[] = ["Alice", "Bob"];

// Somewhere later in the code...
(names as string[]).push("Charlie");

console.log(names); // What is printed?`,
    commonBelief:
      "'readonly' also protects the array at runtime. The push() call " +
      "should throw an error or be silently ignored.",
    reality:
      "Type Erasure! 'readonly' only exists in the type system and is " +
      "completely removed during compilation. At runtime it is a normal " +
      "JavaScript array. The type assertion 'as string[]' bypasses the compile-time check, " +
      "and push() works perfectly. Output: ['Alice', 'Bob', 'Charlie']. " +
      "readonly is a compile-time contract, not a runtime guarantee.",
    concept: "Type Erasure / readonly is compile-time only",
    difficulty: 2,
  },

  // ─── 2: const inferiert ein Tuple ──────────────────────────────────────────
  {
    id: "04-mc-02",
    title: "const automatically creates a Tuple",
    code: `const point = [10, 20];

// Expected: point is [number, number]
// So this should be an error:
point.push(30);`,
    commonBelief:
      "'const' makes the variable immutable, so TypeScript should " +
      "infer a Tuple [number, number] and prohibit push().",
    reality:
      "TypeScript infers number[], NOT [number, number]. The reason: " +
      "'const' only protects the variable binding (you cannot reassign 'point'), " +
      "but the CONTENTS of the array remain mutable. Since push() is possible, " +
      "a tuple type would be wrong — it would block common operations. " +
      "For a tuple you need an explicit annotation or 'as const'.",
    concept: "const only protects the binding, not the contents",
    difficulty: 2,
  },

  // ─── 3: filter mit komplexen Bedingungen verengt NICHT ─────────────────────
  {
    id: "04-mc-03",
    title: "filter() with complex conditions does not narrow automatically",
    code: `const items: (string | null)[] = ["a", null, "", null, "hello"];
const cleaned = items.filter(x => x !== null && x.length > 0);

// Expected: cleaned is string[]
// But what does TypeScript say?
const first: string = cleaned[0]; // Error?`,
    commonBelief:
      "TypeScript recognizes the combined condition '!== null && .length > 0' " +
      "in the filter callback and concludes that the result is string[].",
    reality:
      "From TypeScript 5.5 onwards, filter() automatically recognizes simple type guards " +
      "(e.g. `x => x !== null`). BUT with more complex conditions like " +
      "`x => x !== null && x.length > 0` the automatic inference does NOT kick in " +
      "— the result remains (string | null)[]. The solution: " +
      "items.filter((x): x is string => x !== null && x.length > 0) — the " +
      "explicit type predicate 'x is string' tells TypeScript that the " +
      "function acts as a type guard.",
    concept: "Type Predicates / Inferred Type Predicates Limits",
    difficulty: 3,
  },

  // ─── 4: Spread bewahrt den Tuple-Typ ──────────────────────────────────────
  {
    id: "04-mc-04",
    title: "Spread preserves the Tuple type",
    code: `const original: [string, number] = ["hello", 42];
const copy = [...original];

// Expected: copy is [string, number]
function greet(name: string, age: number) {}
greet(...copy); // Does this work?`,
    commonBelief:
      "The spread operator copies the tuple, so 'copy' should also " +
      "have the type [string, number] and work as a spread argument.",
    reality:
      "Spreading a tuple LOSES the tuple type! TypeScript infers " +
      "(string | number)[] for 'copy'. This means: greet(...copy) fails, " +
      "because TypeScript no longer knows that position 0 is a string " +
      "and position 1 is a number. Solution: " +
      "const copy = [...original] as [string, number]; or better yet: " +
      "work directly with the original.",
    concept: "Spread operator loses tuple information",
    difficulty: 3,
  },

  // ─── 5: Kovarianz ist sicher ───────────────────────────────────────────────
  {
    id: "04-mc-05",
    title: "Assigning a narrow array to a wide array is safe",
    code: `const admins: ("admin" | "mod")[] = ["admin", "mod"];
const users: string[] = admins; // Compiles!

users.push("hacker"); // No compile error!

// What is now in admins?
console.log(admins); // ["admin", "mod", "hacker"]
// But admins has the type ("admin" | "mod")[]...`,
    commonBelief:
      "If TypeScript allows the assignment, it is safe. " +
      "admins can only contain 'admin' or 'mod'.",
    reality:
      "This is a covariance problem and a well-known unsoundness in " +
      "TypeScript! After the assignment, 'admins' and 'users' point to " +
      "THE SAME array. Through 'users' you can push arbitrary strings which " +
      "then also appear in 'admins' — even though the type prohibits it. " +
      "TypeScript allows this out of pragmatism (too much code would break). " +
      "Solution: readonly arrays prevent mutation through both references.",
    concept: "Array covariance is unsound with mutable arrays",
    difficulty: 4,
  },

  // ─── 6: as const macht deep-immutable ──────────────────────────────────────
  {
    id: "04-mc-06",
    title: "'as const' makes arrays immutable at runtime",
    code: `const config = {
  ports: [3000, 3001, 3002],
  host: "localhost",
} as const;

// TypeScript says: readonly [3000, 3001, 3002]
// So the array is frozen, right?

// At runtime:
(config.ports as number[]).push(9999); // What happens?`,
    commonBelief:
      "'as const' freezes the object and all nested arrays, " +
      "similar to Object.freeze() with deep-freeze semantics.",
    reality:
      "'as const' is PURELY a type system feature. It creates readonly types " +
      "and literal types at compile time, but has NO effect at runtime. " +
      "The type assertion 'as number[]' bypasses the compile-time check, and push() " +
      "works. For true runtime immutability you need " +
      "Object.freeze() (shallow) or a library like Immer.",
    concept: "as const is compile-time only, not runtime",
    difficulty: 3,
  },

  // ─── 7: Array-Index-Zugriff ist immer sicher ──────────────────────────────
  {
    id: "04-mc-07",
    title: "Array index access always returns the element type",
    code: `const names: string[] = ["Alice", "Bob"];
const third = names[2]; // Type: string

// TypeScript says: third is string
// But what is the actual value?
console.log(third.toUpperCase()); // Runtime: ???`,
    commonBelief:
      "TypeScript guarantees that names[2] is a string. " +
      "If the type says 'string', I can safely call .toUpperCase().",
    reality:
      "Without 'noUncheckedIndexedAccess: true', TypeScript ALWAYS returns " +
      "the element type for array index access (here: string), even when the " +
      "index is out of bounds. names[2] is actually undefined, and .toUpperCase() " +
      "throws a runtime error. With noUncheckedIndexedAccess the type would be " +
      "'string | undefined', and TypeScript would force you to check.",
    concept: "noUncheckedIndexedAccess / Out-of-bounds access",
    difficulty: 2,
  },

  // ─── 8: Tuple-Destructuring bewahrt Literal-Typen ─────────────────────────
  {
    id: "04-mc-08",
    title: "Destructuring preserves the types from 'as const'",
    code: `const CONFIG = ["localhost", 3000] as const;
// Type: readonly ["localhost", 3000]

const [host, port] = CONFIG;
// Expected: host is "localhost", port is 3000

let mutableHost = host;
// What is the type of mutableHost?`,
    commonBelief:
      "Destructuring transfers the literal types. 'mutableHost' should " +
      'have the type "localhost", since CONFIG is "as const".',
    reality:
      "Destructuring does indeed preserve the literal types: " +
      "'host' has the type \"localhost\" and 'port' has the type 3000. " +
      "BUT: 'let mutableHost = host' causes widening! Since mutableHost " +
      "is declared with 'let', TypeScript widens the type to 'string'. " +
      "Literal types are only preserved with 'const'. " +
      "This is not specific to 'as const', but general widening behavior.",
    concept: "let-widening with literal types",
    difficulty: 4,
  },
];