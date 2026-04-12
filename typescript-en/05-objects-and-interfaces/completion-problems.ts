/**
 * Lesson 05 -- Completion Problems: Objects & Interfaces
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
  // ─── 1: Basics — Define an Interface ──────────────────────────────────────
  {
    id: "05-cp-01",
    title: "Define an Interface for a Product",
    description:
      "Complete the interface so that all product objects compile. " +
      "Pay attention to optional properties and readonly.",
    template: `interface Product {
  ___(1)___
  ___(2)___
  ___(3)___
  ___(4)___
}

// Alle diese muessen kompilieren:
const book: Product = {
  id: "B001",
  name: "TypeScript Handbook",
  price: 29.99,
};

const freeBook: Product = {
  id: "B002",
  name: "Open Source Guide",
  price: 0,
  discount: 0,
};

// Das darf NICHT kompilieren:
// book.id = "B999"; // readonly!`,
    solution: `interface Product {
  readonly id: string;
  name: string;
  price: number;
  discount?: number;
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "readonly id: string;",
        hint: "id should not be changeable after creation.",
      },
      {
        placeholder: "___(2)___",
        answer: "name: string;",
        hint: "A simple string property.",
      },
      {
        placeholder: "___(3)___",
        answer: "price: number;",
        hint: "The price as a number — present in both objects.",
      },
      {
        placeholder: "___(4)___",
        answer: "discount?: number;",
        hint: "discount is optional (missing in the first object) — use '?'.",
      },
    ],
    concept: "Interface with readonly and optional properties",
  },

  // ─── 2: Understanding Structural Typing ────────────────────────────────────
  {
    id: "05-cp-02",
    title: "Structural Typing in Function Signatures",
    description:
      "Complete the function signatures so that they accept different object " +
      "types thanks to structural typing.",
    template: `interface HasLength {
  length: number;
}

// Funktion die ALLES akzeptiert, was eine length-Property hat
function logLength(item: ___(1)___): void {
  console.log("Laenge: " + item.length);
}

// Alle diese Aufrufe muessen funktionieren:
logLength("hello");          // String hat .length
logLength([1, 2, 3]);        // Array hat .length
logLength({ length: 42 });   // Passt strukturell

// ─── Extends fuer speziellere Interfaces ───
interface Named {
  name: string;
}

interface NamedAndAged ___(2)___ {
  age: number;
}

// NamedAndAged muss name UND age haben
const person: NamedAndAged = { name: "Alice", age: 30 };

// Type Guard fuer Structural Typing
function isNamed(obj: unknown): ___(3)___ {
  return typeof obj === "object" && obj !== null && "name" in obj;
}`,
    solution: `function logLength(item: HasLength): void {
  console.log("Laenge: " + item.length);
}

interface NamedAndAged extends Named {
  age: number;
}

function isNamed(obj: unknown): obj is Named {
  return typeof obj === "object" && obj !== null && "name" in obj;
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "HasLength",
        hint: "Which interface describes 'something with length'?",
      },
      {
        placeholder: "___(2)___",
        answer: "extends Named",
        hint: "NamedAndAged should inherit all properties from Named.",
      },
      {
        placeholder: "___(3)___",
        answer: "obj is Named",
        hint: "Type Predicate: 'parameter is TypeName'",
      },
    ],
    concept: "Structural Typing, extends, Type Predicates",
  },

  // ─── 3: Index Signatures and Record ────────────────────────────────────────
  {
    id: "05-cp-03",
    title: "Using Index Signatures and Record Correctly",
    description:
      "Use index signatures and Record<K,V> to describe dynamic objects in a " +
      "type-safe way.",
    template: `// 1. Ein Woerterbuch: String-Keys, String-Werte
interface Dictionary {
  ___(1)___
}

const translations: Dictionary = {
  hello: "Hallo",
  world: "Welt",
  goodbye: "Tschuess",
};

// 2. Ein Typ fuer Status-Zaehler mit GENAU diesen Keys
type Status = "active" | "paused" | "deleted";
type StatusCounts = ___(2)___;

const counts: StatusCounts = {
  active: 42,
  paused: 7,
  deleted: 3,
};

// 3. Gemischt: feste Properties + dynamische Keys
interface Config {
  name: string;
  version: number;
  ___(3)___
}

const myConfig: Config = {
  name: "MyApp",
  version: 1,
  debug: true,
  logLevel: "info",
};`,
    solution: `interface Dictionary {
  [key: string]: string;
}

type StatusCounts = Record<Status, number>;

interface Config {
  name: string;
  version: number;
  [key: string]: string | number | boolean;
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "[key: string]: string;",
        hint: "Index Signature: [key: string]: ValueType",
      },
      {
        placeholder: "___(2)___",
        answer: "Record<Status, number>",
        hint: "Record<K, V> enforces that ALL status keys are present.",
      },
      {
        placeholder: "___(3)___",
        answer: "[key: string]: string | number | boolean;",
        hint: "The index signature must be compatible with ALL fixed properties.",
      },
    ],
    concept: "Index Signatures, Record, mixed patterns",
  },

  // ─── 4: Intersection Types and Utility Types ──────────────────────────────
  {
    id: "05-cp-04",
    title: "Combining Intersection and Utility Types",
    description:
      "Use Intersection (&), Partial, Pick and Omit to construct practical types.",
    template: `interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

// 1. Ein Typ fuer die Erstellung (ohne id und createdAt, die automatisch gesetzt werden)
type CreateUserInput = ___(1)___;

// 2. Ein Typ fuer Updates (alle Felder optional, ausser id)
type UpdateUserInput = ___(2)___;

// 3. Ein oeffentliches Profil (nur name und email, plus ein neues Feld)
type PublicProfile = ___(3)___;

const createInput: CreateUserInput = {
  name: "Alice",
  email: "alice@test.de",
  role: "user",
};

const updateInput: UpdateUserInput = {
  id: "U001",
  name: "Bob",
};

const profile: PublicProfile = {
  name: "Alice",
  email: "alice@test.de",
  avatar: "https://example.com/alice.png",
};`,
    solution: `type CreateUserInput = Omit<User, "id" | "createdAt">;

type UpdateUserInput = Pick<User, "id"> & Partial<Omit<User, "id">>;

type PublicProfile = Pick<User, "name" | "email"> & { avatar: string };`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: 'Omit<User, "id" | "createdAt">',
        hint: "Which utility type removes certain properties?",
      },
      {
        placeholder: "___(2)___",
        answer: 'Pick<User, "id"> & Partial<Omit<User, "id">>',
        hint: "id is required (Pick), the rest optional (Partial). Combine with &.",
      },
      {
        placeholder: "___(3)___",
        answer: 'Pick<User, "name" | "email"> & { avatar: string }',
        hint: "Select two properties (Pick) and add avatar (&).",
      },
    ],
    concept: "Omit, Pick, Partial, Intersection — type composition",
  },

  // ─── 5: Applying Readonly Correctly ────────────────────────────────────────
  {
    id: "05-cp-05",
    title: "Applying Readonly Correctly and Deeply",
    description:
      "Make a nested object correctly readonly — both shallow and deep.",
    template: `// 1. Shallow readonly mit Utility Type
interface MutableConfig {
  host: string;
  port: number;
  tags: string[];
}

type ReadonlyConfig = ___(1)___;

const config: ReadonlyConfig = {
  host: "localhost",
  port: 3000,
  tags: ["web", "api"],
};

// config.host = "0.0.0.0";  // Soll Fehler sein!
// config.tags.push("new");  // Ist das auch ein Fehler? (Nein! Shallow!)

// 2. Deep readonly — manuell fuer eine spezifische Struktur
interface DeepReadonlyConfig {
  readonly host: string;
  readonly port: number;
  readonly tags: ___(2)___;
  readonly database: {
    readonly host: string;
    readonly port: number;
  };
}

// 3. Deep readonly — generisch (fuer beliebige Typen)
type DeepReadonly<T> = {
  ___(3)___
};

type FullyFrozen = DeepReadonly<MutableConfig>;
// FullyFrozen.tags ist jetzt readonly string[]`,
    solution: `type ReadonlyConfig = Readonly<MutableConfig>;

interface DeepReadonlyConfig {
  readonly host: string;
  readonly port: number;
  readonly tags: readonly string[];
  readonly database: {
    readonly host: string;
    readonly port: number;
  };
}

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Function ? T[K] : T[K] extends object ? DeepReadonly<T[K]> : T[K];
};`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "Readonly<MutableConfig>",
        hint: "Which utility type makes all properties readonly?",
      },
      {
        placeholder: "___(2)___",
        answer: "readonly string[]",
        hint: "The array itself must also be readonly — not just the reference.",
      },
      {
        placeholder: "___(3)___",
        answer:
          "readonly [K in keyof T]: T[K] extends Function ? T[K] : T[K] extends object ? DeepReadonly<T[K]> : T[K];",
        hint: "Mapped type with readonly + recursion for nested objects.",
      },
    ],
    concept: "Readonly shallow vs deep, Utility Types, Mapped Types",
  },

  // ─── 6: Mastering Excess Property Checking ────────────────────────────────
  {
    id: "05-cp-06",
    title: "Understanding and Controlling Excess Property Checking",
    description:
      "Predict for each case whether an excess property check occurs, " +
      "and choose the right strategy.",
    template: `interface StrictConfig {
  host: string;
  port: number;
}

// ─── Fall 1: Fehler vermeiden mit Zwischenvariable ───
const rawData = { host: "localhost", port: 3000, debug: true };
const config1: StrictConfig = ___(1)___;
// Soll kompilieren — debug wird ignoriert

// ─── Fall 2: Flexible Config mit Index Signature ───
interface FlexConfig {
  host: string;
  port: number;
  ___(2)___
}

const config2: FlexConfig = {
  host: "localhost",
  port: 3000,
  debug: true,       // Soll kompilieren!
  logLevel: "info",  // Soll auch kompilieren!
};

// ─── Fall 3: Type-safe Options-Pattern ───
// Manche Properties sind bekannt, zusaetzliche werden weitergereicht
function createServer(options: StrictConfig & ___(3)___) {
  const { host, port, ...rest } = options;
  console.log(\`Server: \${host}:\${port}\`, rest);
}

createServer({
  host: "localhost",
  port: 3000,
  ssl: true,
  timeout: 5000,
});`,
    solution: `const config1: StrictConfig = rawData;

interface FlexConfig {
  host: string;
  port: number;
  [key: string]: unknown;
}

function createServer(options: StrictConfig & { [key: string]: unknown }) {
  const { host, port, ...rest } = options;
  console.log(\`Server: \${host}:\${port}\`, rest);
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "rawData",
        hint: "Assignment via a variable bypasses the excess property check.",
      },
      {
        placeholder: "___(2)___",
        answer: "[key: string]: unknown;",
        hint: "Index signature allows arbitrary additional properties.",
      },
      {
        placeholder: "___(3)___",
        answer: "{ [key: string]: unknown }",
        hint: "Intersection with index signature opens the type for extra properties.",
      },
    ],
    concept: "Bypassing and controlling excess property checks",
  },
];