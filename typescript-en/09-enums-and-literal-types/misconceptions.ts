/**
 * Lesson 09 — Misconception Exercises: Enums & Literal Types
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
    id: "09-enum-typesafe",
    title: "Numeric enums are type-safe",
    code: `enum Direction { Up, Down, Left, Right }
const d: Direction = 42; // Error?`,
    commonBelief: "42 is not a valid Direction value — TypeScript should reject it.",
    reality:
      "Numeric enums allow ANY number — a well-known soundness hole! " +
      "The reason: bitwise flags like Permission.Read | Permission.Write produce " +
      "values not defined in the enum. String enums don't have this problem.",
    concept: "Numeric enum soundness hole",
    difficulty: 3,
  },

  {
    id: "09-string-enum-assignable",
    title: "String enums accept matching strings",
    code: `enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }
const s: Status = "ACTIVE"; // Should work?`,
    commonBelief: "Since the enum value is 'ACTIVE', the string 'ACTIVE' should be assignable.",
    reality:
      "String enums are NOMINALLY typed — only enum members " +
      "(Status.Active) can be assigned. Direct strings are " +
      "not compatible, even if the value is identical. " +
      "This distinguishes enums from union literal types.",
    concept: "String enum / nominal typing",
    difficulty: 3,
  },

  {
    id: "09-const-vs-let-literal",
    title: "let retains the literal type",
    code: `const a = "hello"; // Type: "hello"
let b = "hello";   // Type: ???`,
    commonBelief: "Both have the type 'hello' — the value is the same.",
    reality:
      "const infers the literal type 'hello'. let widens to string. " +
      "The reason: let can receive a different value later — " +
      "TypeScript must use the broader type. " +
      "For literal types with let: use as const or an explicit annotation.",
    concept: "Literal widening / const vs let",
    difficulty: 1,
  },

  {
    id: "09-as-const-readonly-only",
    title: "as const only makes things readonly",
    code: `const arr = ["GET", "POST"] as const;
// Type: readonly ["GET", "POST"]  — not: readonly string[]`,
    commonBelief: "as const only makes the array immutable (readonly).",
    reality:
      "as const has THREE effects: (1) readonly, (2) literal types for all " +
      "values ('GET' instead of string), (3) tuple instead of array (fixed length). " +
      "This makes as const the most powerful assertion in TypeScript.",
    concept: "as const / triple effect",
    difficulty: 2,
  },

  {
    id: "09-object-keys-enum",
    title: "Object.keys on a numeric enum only returns names",
    code: `enum Color { Red, Green, Blue }
console.log(Object.keys(Color).length); // 3?`,
    commonBelief: "3 — the three color names.",
    reality:
      "6! Numeric enums have reverse mapping: the object contains " +
      "DOUBLE entries (name→value AND value→name). " +
      "Object.keys returns ['0','1','2','Red','Green','Blue']. " +
      "String enums have no reverse mapping and return only 3.",
    concept: "Reverse mapping / Object.keys",
    difficulty: 3,
  },

  {
    id: "09-const-enum-always-better",
    title: "const enum is always better than a regular enum",
    code: `const enum Direction { Up = "UP", Down = "DOWN" }
// Inlined at compile time — no runtime code!`,
    commonBelief: "const enum is always better because it generates no runtime code.",
    reality:
      "const enum is NOT compatible with isolatedModules — " +
      "and isolatedModules is the default in Vite, esbuild, swc, and Next.js. " +
      "Cross-file const enum does not work when each file is compiled individually. " +
      "The alternative: as const objects.",
    concept: "const enum / isolatedModules",
    difficulty: 4,
  },

  {
    id: "09-template-literal-additive",
    title: "Template literal types add the members",
    code: `type Size = "sm" | "md" | "lg";       // 3
type Color = "red" | "blue" | "green"; // 3
type Token = \`\${Size}-\${Color}\`;       // ???`,
    commonBelief: "Token has 6 members (3 + 3).",
    reality:
      "Token has 9 members (3 × 3)! Template literal types produce " +
      "the CARTESIAN PRODUCT: every Size variant is combined with every " +
      "Color variant. That's multiplication, not addition.",
    concept: "Template literal types / cartesian product",
    difficulty: 2,
  },

  {
    id: "09-branded-runtime",
    title: "Branded types exist at runtime",
    code: `type EUR = number & { __brand: "EUR" };
const betrag = 42 as EUR;
console.log((betrag as any).__brand); // "EUR"?`,
    commonBelief: "The __brand property exists on the value — you can read it.",
    reality:
      "Branded types are a purely compile-time mechanism. " +
      "The __brand property does NOT exist at runtime. " +
      "betrag is a plain number (42) at runtime. " +
      "(betrag as any).__brand is undefined. " +
      "It is a type-level trick for semantic distinction.",
    concept: "Branded types / compile time",
    difficulty: 4,
  },
];