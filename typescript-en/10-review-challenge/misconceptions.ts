/**
 * Lesson 10 — Misconception Exercises: Review Challenge
 *
 * 8 misconceptions that MIX ALL Phase 1 concepts.
 * The learner must identify which concept is affected.
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
    id: "10-structural-vs-nominal",
    title: "TypeScript is nominally typed",
    code: `interface Dog { name: string; bark(): void; }
interface Cat { name: string; bark(): void; }

const dog: Dog = { name: "Rex", bark() { console.log("Woof"); } };
const cat: Cat = dog; // Error?`,
    commonBelief: "Dog and Cat are different types. The assignment should fail.",
    reality:
      "TypeScript is STRUCTURALLY typed. Dog and Cat have the same shape — " +
      "they are interchangeable. The name of the interface does not matter, " +
      "only the structure counts. (L05, L08)",
    concept: "Structural Typing (L05)",
    difficulty: 2,
  },

  {
    id: "10-type-erasure-runtime",
    title: "TypeScript types exist at runtime",
    code: `interface User { name: string; age: number; }

function isUser(data: unknown): boolean {
  return data instanceof User; // Does this work?
}`,
    commonBelief: "instanceof checks whether data is a User.",
    reality:
      "Interfaces do NOT exist at runtime (Type Erasure, L02). " +
      "instanceof only works with classes, not with interfaces. " +
      "For runtime checks you need Type Guards (L06): " +
      "typeof, the in operator, or custom value is Type functions.",
    concept: "Type Erasure (L02) + Type Guards (L06)",
    difficulty: 3,
  },

  {
    id: "10-readonly-deep",
    title: "readonly makes objects completely immutable",
    code: `interface Config {
  readonly settings: { debug: boolean; logLevel: string };
}

const config: Config = { settings: { debug: true, logLevel: "info" } };
config.settings.debug = false; // Error?`,
    commonBelief: "readonly settings means that neither settings nor its properties can be changed.",
    reality:
      "readonly is SHALLOW — it only protects the direct property. " +
      "config.settings = ... is forbidden, but config.settings.debug = false works! " +
      "For deep readonly: Readonly<T> recursively or as const. (L04, L05)",
    concept: "Shallow Readonly (L04/L05) + as const (L09)",
    difficulty: 3,
  },

  {
    id: "10-any-unknown-same",
    title: "any and unknown are the same",
    code: `function process(data: any) { data.whatever(); } // OK
function processSafe(data: unknown) { data.whatever(); } // ???`,
    commonBelief: "Both accept anything — no difference.",
    reality:
      "any DISABLES the compiler — everything is allowed. " +
      "unknown ENFORCES a check before use — data.whatever() " +
      "is an error. unknown is the type-safe alternative. (L02)",
    concept: "any vs unknown (L02)",
    difficulty: 1,
  },

  {
    id: "10-excess-property-inconsistent",
    title: "Excess Property Check is consistent",
    code: `interface User { name: string; age: number; }

// Direct: Excess Property Check applies
// const u: User = { name: "Max", age: 30, extra: true }; // Error!

// Via variable: NO Excess Property Check!
const obj = { name: "Max", age: 30, extra: true };
const u: User = obj; // OK!`,
    commonBelief: "TypeScript should reject 'extra' in both cases.",
    reality:
      "The Excess Property Check ONLY applies to fresh object literals. " +
      "Through a variable, only the structure is checked — extra is " +
      "ignored (structural compatibility). This is intentional: " +
      "objects are allowed to have more properties than the type declares. (L05)",
    concept: "Excess Property Check (L05)",
    difficulty: 3,
  },

  {
    id: "10-tuple-is-array",
    title: "Tuples and arrays are the same",
    code: `const pair: [string, number] = ["Max", 30];
pair.push(true); // Error? TypeScript doesn't check push?`,
    commonBelief: "Tuples have a fixed length — push should be forbidden.",
    reality:
      "Tuples are normal arrays at runtime — push works! " +
      "TypeScript checks the type of the push argument (true is not string | number), " +
      "but the length is not protected. " +
      "For true immutability: readonly [string, number]. (L04)",
    concept: "Tuple Mutability (L04)",
    difficulty: 3,
  },

  {
    id: "10-void-callback-confusion",
    title: "void is always strict",
    code: `// Strict:
function doSomething(): void { return 42; } // Error!

// Tolerant:
type Cb = () => void;
const fn: Cb = () => 42; // OK!`,
    commonBelief: "void always forbids return values.",
    reality:
      "void is STRICT for direct declarations, TOLERANT for callback types. " +
      "The reason: for declarations, YOU control the type. " +
      "For callbacks, SOMEONE ELSE defines the interface " +
      "and says 'I don't care about the return value'. (L06)",
    concept: "void Callbacks (L06)",
    difficulty: 3,
  },

  {
    id: "10-enum-vs-union-choice",
    title: "Enums are always better than Union Literals",
    code: `// Enum
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }

// Union Literal
type Status2 = "ACTIVE" | "INACTIVE";`,
    commonBelief: "Enums are more precise and should always be preferred.",
    reality:
      "Union Literals generate NO runtime code (Tree-Shakeable), " +
      "are simpler, and are sufficient in most cases. " +
      "Enums are only needed for: runtime iteration, reverse mapping, " +
      "nominal typing. The recommendation: Union Literals as default, " +
      "Enums only when needed. (L09)",
    concept: "Enum vs Union Literal (L09)",
    difficulty: 2,
  },
];