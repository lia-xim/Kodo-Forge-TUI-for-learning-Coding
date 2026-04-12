The translated file:

```typescript
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
    title: "readonly Prevents Mutation at Runtime",
    code: `const names: readonly string[] = ["Alice", "Bob"];

// Irgendwo spaeter im Code...
(names as string[]).push("Charlie");

console.log(names); // Was wird ausgegeben?`,
    commonBelief:
      "readonly protects the array at runtime as well. The push() call " +
      "should either throw an error or be silently ignored.",
    reality:
      "Type Erasure! 'readonly' only exists in the type system and is " +
      "completely removed during compilation. At runtime, it is a normal " +
      "JavaScript array. The type assertion 'as string[]' bypasses the " +
      "compile-time check, and push() works without issue. " +
      "Output: ['Alice', 'Bob', 'Charlie']. " +
      "readonly is a compile-time contract, not a runtime guarantee.",
    concept: "Type Erasure / readonly is compile-time only",
    difficulty: 2,
  },

  // ─── 2: const inferiert ein Tuple ──────────────────────────────────────────
  {
    id: "04-mc-02",
    title: "const Automatically Creates a Tuple",
    code: `const point = [10, 20];

// Erwartung: point ist [number, number]
// Also sollte das ein Fehler sein:
point.push(30);`,
    commonBelief:
      "'const' makes the variable immutable, so TypeScript should " +
      "infer a tuple [number, number] and disallow push().",
    reality:
      "TypeScript infers number[], NOT [number, number]. The reason: " +
      "'const' only protects the variable binding (you cannot reassign " +
      "'point'), but the CONTENTS of the array remain mutable. Since push() " +
      "is possible, a tuple type would be wrong — it would block common " +
      "operations. For a tuple, you need an explicit annotation or 'as const'.",
    concept: "const only protects the binding, not the content",
    difficulty: 2,
  },

  // ─── 3: filter mit komplexen Bedingungen verengt NICHT ─────────────────────
  {
    id: "04-mc-03",
    title: "filter() with Complex Conditions Does Not Narrow Automatically",
    code: `const items: (string | null)[] = ["a", null, "", null, "hello"];
const cleaned = items.filter(x => x !== null && x.length > 0);

// Erwartung: cleaned ist string[]
// Aber was sagt TypeScript?
const first: string = cleaned[0]; // Fehler?`,
    commonBelief:
      "TypeScript recognizes the combined condition '!== null && .length > 0' " +
      "in the filter callback and concludes that the result is string[].",
    reality:
      "From TypeScript 5.5, filter() automatically recognizes simple type guards " +
      "(e.g., `x => x !== null`). BUT with more complex conditions like " +
      "`x => x !== null && x.length > 0`, automatic inference does NOT kick in " +
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
    title: "Spread Preserves the Tuple Type",
    code: `const original: [string, number] = ["hello", 42];
const copy = [...original];

// Erwartung: copy ist [string, number]
function greet(name: string, age: number) {}
greet(...copy); // Funktioniert das?`,
    commonBelief:
      "The spread operator copies the tuple, so 'copy' should also " +
      "have the type [string, number] and work as a spread argument.",
    reality:
      "Spreading a tuple LOSES the tuple type! TypeScript infers " +
      "(string | number)[] for 'copy'. This means: greet(...copy) fails " +
      "because TypeScript no longer knows that position 0 is a string " +
      "and position 1 is a number. Solution: " +
      "const copy = [...original] as [string, number]; or better yet: " +
      "work directly with the original.",
    concept: "Spread Operator Loses Tuple Information",
    difficulty: 3,
  },

  // ─── 5: Kovarianz ist sicher ───────────────────────────────────────────────
  {
    id: "04-mc-05",
    title: "Assigning a Narrow Array to a Wider Array is Safe",
    code: `const admins: ("admin" | "mod")[] = ["admin", "mod"];
const users: string[] = admins; // Kompiliert!

users.push("hacker"); // Kein Compile-Fehler!

// Was steht jetzt in admins?
console.log(admins); // ["admin", "mod", "hacker"]
// Aber admins hat den Typ ("admin" | "mod")[]...`,
    commonBelief:
      "If TypeScript allows the assignment, it is safe. " +
      "admins can only contain 'admin' or 'mod'.",
    reality:
      "This is a covariance problem and a known unsoundness in " +
      "TypeScript! After the assignment, 'admins' and 'users' point to the " +
      "SAME array. Via 'users', arbitrary strings can be pushed, which then " +
      "also end up in 'admins' — even though the type forbids it. " +
      "TypeScript allows this out of pragmatism (too much code would break). " +
      "Solution: readonly arrays prevent mutation through both references.",
    concept: "Array Covariance is Unsound with Mutable Arrays",
    difficulty: 4,
  },

  // ─── 6: as const macht deep-immutable ──────────────────────────────────────
  {
    id: "04-mc-06",
    title: "'as const' Makes Arrays Immutable at Runtime",
    code: `const config = {
  ports: [3000, 3001, 3002],
  host: "localhost",
} as const;

// TypeScript sagt: readonly [3000, 3001, 3002]
// Also ist das Array eingefroren, richtig?

// Zur Laufzeit:
(config.ports as number[]).push(9999); // Was passiert?`,
    commonBelief:
      "'as const' freezes the object and all nested arrays, " +
      "similar to Object.freeze() with deep-freeze semantics.",
    reality:
      "'as const' is PURELY a type system feature. It creates readonly types " +
      "and literal types at compile time, but has NO effect at runtime. " +
      "The type assertion 'as number[]' bypasses the compile-time check, and " +
      "push() works. For true runtime immutability, you need " +
      "Object.freeze() (shallow) or a library like Immer.",
    concept: "as const is compile-time only, not runtime",
    difficulty: 3,
  },

  // ─── 7: Array-Index-Zugriff ist immer sicher ──────────────────────────────
  {
    id: "04-mc-07",
    title: "Array Index Access Always Returns the Element Type",
    code: `const names: string[] = ["Alice", "Bob"];
const third = names[2]; // Typ: string

// TypeScript sagt: third ist string
// Aber was ist der tatsaechliche Wert?
console.log(third.toUpperCase()); // Runtime: ???`,
    commonBelief:
      "TypeScript guarantees that names[2] is a string. " +
      "If the type says 'string', I can safely call .toUpperCase().",
    reality:
      "Without 'noUncheckedIndexedAccess: true', TypeScript ALWAYS returns " +
      "the element type for array index access (here: string), even if the " +
      "index is out of bounds. names[2] is actually undefined, and " +
      ".toUpperCase() throws a runtime error. " +
      "With noUncheckedIndexedAccess, the type would be 'string | undefined', " +
      "and TypeScript would force you to do a check.",
    concept: "noUncheckedIndexedAccess / Out-of-bounds Access",
    difficulty: 2,
  },

  // ─── 8: Tuple-Destructuring bewahrt Literal-Typen ─────────────────────────
  {
    id: "04-mc-08",
    title: "Destructuring Preserves Types from 'as const'",
    code: `const CONFIG = ["localhost", 3000] as const;
// Typ: readonly ["localhost", 3000]

const [host, port] = CONFIG;
// Erwartung: host ist "localhost", port ist 3000

let mutableHost = host;
// Was ist der Typ von mutableHost?`,
    commonBelief:
      "Destructuring transfers the literal types. 'mutableHost' should " +
      'have the type "localhost", since CONFIG is "as const".',
    reality:
      "Destructuring does actually preserve the literal types: " +
      "'host' has the type \"localhost\" and 'port' has the type 3000. " +
      "BUT: 'let mutableHost = host' causes widening! Since mutableHost " +
      "is declared with 'let', TypeScript widens the type to 'string'. " +
      "Literal types are only preserved with 'const'. " +
      "This is not specific to 'as const', but general widening behavior.",
    concept: "let-Widening with Literal Types",
    difficulty: 4,
  },
];
```