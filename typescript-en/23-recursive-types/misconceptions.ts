/**
 * Lesson 23 — Misconception Exercises: Recursive Types
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
  // ─── 1: Recursive types cause infinite loops ────────────────────────────
  {
    id: "23-recursive-infinite-loop",
    title: "Recursive types cause infinite loops in the compiler",
    code: `type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

// "This will crash the compiler!"
const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};`,
    commonBelief:
      "A type that references itself causes an infinite loop " +
      "in the TypeScript compiler, similar to an endless recursive function.",
    reality:
      "TypeScript evaluates types LAZILY — the compiler only unfolds a type " +
      "as far as necessary. LinkedList<number> is not unfolded infinitely, " +
      "only to the depth the concrete object has. " +
      "The | null ensures that every object is finite.",
    concept: "Lazy Type Evaluation",
    difficulty: 1,
  },

  // ─── 2: DeepPartial makes methods optional ──────────────────────────────
  {
    id: "23-deep-partial-methods",
    title: "DeepPartial also makes methods optional",
    code: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

class User {
  name: string = "";
  greet(): string { return "Hello"; }
}

type PartialUser = DeepPartial<User>;
// "greet is now optional and I no longer have to call greet()!"`,
    commonBelief:
      "DeepPartial makes ALL properties optional, including methods. " +
      "This means methods no longer need to be called.",
    reality:
      "It depends on the implementation! The DeepPartial shown does make " +
      "greet optional (greet?: ...), BUT: functions are objects " +
      "(typeof fn === 'function'), and extends object is true for functions. " +
      "DeepPartial will therefore recurse into the function itself, producing strange " +
      "results. In practice, functions should be handled separately " +
      "or an implementation should be used that excludes functions.",
    concept: "Deep Operations and Functions",
    difficulty: 3,
  },

  // ─── 3: JSON.parse returns JsonValue ─────────────────────────────────────
  {
    id: "23-json-parse-type",
    title: "JSON.parse automatically returns JsonValue",
    code: `type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const data = JSON.parse('{"name": "Max"}');
// data is now JsonValue, right?

data.name.toUpperCase(); // "Fully type-safe!"`,
    commonBelief:
      "Because we defined a JsonValue type, JSON.parse " +
      "automatically returns JsonValue and everything is type-safe.",
    reality:
      "JSON.parse returns 'any' — TypeScript's lib.es5.d.ts defines " +
      "it as: parse(text: string): any. Our JsonValue type only exists " +
      "in our code and changes NOTHING about the signature of JSON.parse. " +
      "You must cast explicitly: JSON.parse(text) as JsonValue. " +
      "Even then it is a trust cast — no real runtime validation.",
    concept: "Type Assertions vs Runtime Validation",
    difficulty: 2,
  },

  // ─── 4: Recursive types are always slow ────────────────────────────────
  {
    id: "23-recursive-always-slow",
    title: "Recursive types are always slow for the compiler",
    code: `type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// "This will slow down my build by seconds!"
const tree: TreeNode<string> = {
  value: "root",
  children: [
    { value: "child1", children: [] },
    { value: "child2", children: [] },
  ],
};`,
    commonBelief:
      "Recursive types fundamentally slow down the compiler " +
      "and should be avoided.",
    reality:
      "SIMPLE recursive types like TreeNode<T> or LinkedList<T> " +
      "are completely unproblematic. The compiler only unfolds them " +
      "to the depth of the concrete object. Recursive types only become " +
      "problematic with WIDE objects with distributive " +
      "conditional types (exponential expansion) or with type-level " +
      "computations (e.g. Paths on large types).",
    concept: "Compiler Performance",
    difficulty: 2,
  },

  // ─── 5: type X = X | null is recursive ────────────────────────────────────
  {
    id: "23-circular-not-recursive",
    title: "type X = X | null is a recursive type",
    code: `// "This is my simplest recursive type!"
type MaybeNull = MaybeNull | null;

const value: MaybeNull = null;`,
    commonBelief:
      "type X = X | null is a valid recursive type " +
      "that can be either itself or null.",
    reality:
      "This is NOT a valid recursive type — TypeScript reports " +
      "'Type alias MaybeNull circularly references itself'. " +
      "Direct circularity in union/intersection is forbidden. " +
      "Recursion only works in property types, conditional types, " +
      "or mapped types. type List<T> = { next: List<T> | null } is OK, " +
      "type X = X | null is not OK.",
    concept: "Circular vs Recursive Types",
    difficulty: 2,
  },

  // ─── 6: FlatArray<T, Infinity> exists ──────────────────────────────────
  {
    id: "23-flat-infinity",
    title: "You can use FlatArray with infinite depth",
    code: `// Built-in FlatArray:
type Flat = FlatArray<number[][][], typeof Infinity>;
// "Flatten to arbitrary depth!"`,
    commonBelief:
      "You can use Infinity as a depth parameter for FlatArray " +
      "to flatten arrays to any depth.",
    reality:
      "FlatArray in lib.es2019.d.ts accepts number, but " +
      "internally the recursion is limited by a lookup tuple: " +
      "[-1, 0, 1, 2, 3, ...20]. Depths above 20 are not supported. " +
      "typeof Infinity is number, but the lookup table has no " +
      "entry for Infinity. In practice: flat(Infinity) works " +
      "at runtime, but type-level flattening is limited to finite depths.",
    concept: "FlatArray Depth Limit",
    difficulty: 3,
  },

  // ─── 7: Tail recursion makes everything fast ─────────────────────────────
  {
    id: "23-tail-recursion-universal",
    title: "Tail Recursion Optimization makes all recursive types fast",
    code: `// "With TS 4.5+ recursion depth is no longer a problem!"

// Paths on a wide object:
type BigObject = {
  a: { x: string; y: number; z: boolean };
  b: { x: string; y: number; z: boolean };
  c: { x: string; y: number; z: boolean };
  d: { x: string; y: number; z: boolean };
  e: { x: string; y: number; z: boolean };
};

type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | \`\${K}.\${Paths<T[K]>}\` }[keyof T & string]
  : never;

type AllPaths = Paths<BigObject>;`,
    commonBelief:
      "Tail Recursion Optimization in TypeScript 4.5 solves all " +
      "performance problems with recursive types.",
    reality:
      "Tail Recursion Optimization only helps with DEPTH (stack limit), " +
      "not with BREADTH (union explosion). Paths<BigObject> has no " +
      "depth problem — the problem is the number of generated paths. " +
      "With wide objects the union size grows polynomially or " +
      "exponentially. Tail Recursion Optimization also only applies when " +
      "the recursive call is in tail position.",
    concept: "Tail Recursion vs Breadth",
    difficulty: 4,
  },

  // ─── 8: Paths<T> captures array indices ────────────────────────────────
  {
    id: "23-paths-array-indices",
    title: "Paths<T> automatically captures array indices",
    code: `type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | \`\${K}.\${Paths<T[K]>}\` }[keyof T & string]
  : never;

type Data = {
  users: { name: string }[];
};

type AllPaths = Paths<Data>;
// "users.0.name" is a valid path, right?`,
    commonBelief:
      "Paths<T> automatically computes numeric array indices " +
      "like 'users.0.name' or 'users.1.name'.",
    reality:
      "The standard Paths implementation does NOT capture numeric " +
      "array indices. keyof string[] returns 'length' | 'push' | 'pop' | ... " +
      "not '0' | '1' | '2'. For array index paths you would need to " +
      "detect arrays with (infer U)[] and handle the element type U " +
      "specially, e.g. with `${number}` as a placeholder. " +
      "Whether that makes sense depends on the use case.",
    concept: "Paths and Arrays",
    difficulty: 3,
  },
];