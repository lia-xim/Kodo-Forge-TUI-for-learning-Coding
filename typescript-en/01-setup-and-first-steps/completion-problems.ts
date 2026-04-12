```typescript
/**
 * Lesson 01 — Completion Problems: Setup & First Steps
 *
 * Code templates with strategic gaps (______).
 * The learner fills in the gaps — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code with ______ as placeholder for gaps */
  template: string;
  /** Solution with filled gaps */
  solution: string;
  /** Which gap has which answer */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Related concept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: First Type Annotations (easy) ───────────────────────────────────
  {
    id: "01-cp-annotations",
    title: "First Type Annotations",
    description:
      "Add the missing type annotations for variables and " +
      "the function. TypeScript expects the correct primitive types.",
    template: `let vorname: ______ = "Max";
let alter: ______ = 30;
let istStudent: ______ = true;

function addiere(a: number, b: number): ______ {
  return a + b;
}`,
    solution: `let vorname: string = "Max";
let alter: number = 30;
let istStudent: boolean = true;

function addiere(a: number, b: number): number {
  return a + b;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "string",
        hint: 'Which type fits a text value like "Max"?',
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Which type fits an integer like 30?",
      },
      {
        placeholder: "______",
        answer: "boolean",
        hint: "Which type fits true/false?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "What does the addition of two numbers return?",
      },
    ],
    concept: "Type Annotations for Variables and Functions",
  },

  // ─── 2: Defining an Interface (easy-medium) ─────────────────────────────
  {
    id: "01-cp-interface",
    title: "Defining an Interface",
    description:
      "Define an interface for a vehicle. Note: " +
      "The color is optional (not every vehicle has a known color).",
    template: `______ Fahrzeug {
  marke: string;
  baujahr: ______;
  elektrisch: boolean;
  farbe______: string;
}

const meinAuto: Fahrzeug = {
  marke: "VW",
  baujahr: 2023,
  elektrisch: true,
  // color is optional, so omit it
};`,
    solution: `interface Fahrzeug {
  marke: string;
  baujahr: number;
  elektrisch: boolean;
  farbe?: string;
}

const meinAuto: Fahrzeug = {
  marke: "VW",
  baujahr: 2023,
  elektrisch: true,
  // color is optional, so omit it
};`,
    blanks: [
      {
        placeholder: "______",
        answer: "interface",
        hint: "Which TypeScript keyword defines the shape of an object?",
      },
      {
        placeholder: "______",
        answer: "number",
        hint: "Which type fits a year like 2023?",
      },
      {
        placeholder: "______",
        answer: "?",
        hint: "Which character makes a property optional?",
      },
    ],
    concept: "Interfaces / Optional Properties",
  },

  // ─── 3: Type Guard for Runtime Check (medium) ───────────────────────────
  {
    id: "01-cp-type-guard",
    title: "Runtime Check Instead of instanceof",
    description:
      "Interfaces do not exist at runtime. Write a " +
      "Type Guard function that checks whether an object has the structure " +
      "of a User.",
    template: `interface User {
  name: string;
  email: string;
}

function isUser(obj: ______): obj ______ User {
  return (
    ______ obj === "object" &&
    obj !== null &&
    "name" ______ obj &&
    "email" in obj
  );
}

const data: unknown = { name: "Max", email: "max@test.de" };
if (isUser(data)) {
  console.log(data.name); // TypeScript now knows: data is User
}`,
    solution: `interface User {
  name: string;
  email: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "email" in obj
  );
}

const data: unknown = { name: "Max", email: "max@test.de" };
if (isUser(data)) {
  console.log(data.name); // TypeScript now knows: data is User
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Which safe type accepts any value?",
      },
      {
        placeholder: "______",
        answer: "is",
        hint: "Which keyword makes a function a Type Guard? (obj ___ User)",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which JavaScript operator checks the runtime type?",
      },
      {
        placeholder: "______",
        answer: "in",
        hint: "Which operator checks whether a property exists in an object?",
      },
    ],
    concept: "Type Guards / Type Erasure / Runtime Check",
  },

  // ─── 4: Predicting Compiler Output (medium) ───────────────────────────
  {
    id: "01-cp-compiler-output",
    title: "Predicting Compiler Output",
    description:
      "Complete what the TypeScript compiler does with the code. " +
      "Note: All types are removed!",
    template: `// TypeScript Input:
interface Produkt {
  name: string;
  preis: number;
}

function formatPreis(p: Produkt): string {
  return \`\${p.name}: \${p.preis} EUR\`;
}

// JavaScript Output (after tsc):
// (Fill in the gaps)

// ______ Produkt { ... }  ← What happens to the interface?

function formatPreis(______) {
  return \`\$\{p.name\}: \$\{p.preis\} EUR\`;
}`,
    solution: `// TypeScript Input:
interface Produkt {
  name: string;
  preis: number;
}

function formatPreis(p: Produkt): string {
  return \`\${p.name}: \${p.preis} EUR\`;
}

// JavaScript Output (after tsc):

// COMPLETELY GONE  ← The interface is removed

function formatPreis(p) {
  return \`\$\{p.name\}: \$\{p.preis\} EUR\`;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "COMPLETELY GONE",
        hint: "What happens to interfaces with Type Erasure? They are...",
      },
      {
        placeholder: "______",
        answer: "p",
        hint: "What remains of the parameter `p: Produkt` when the type is removed?",
      },
    ],
    concept: "Type Erasure / Compiler Output",
  },

  // ─── 5: Configuring tsconfig (medium-hard) ──────────────────────────────
  {
    id: "01-cp-tsconfig",
    title: "Configuring tsconfig.json",
    description:
      "Create a tsconfig.json for a new project with strict " +
      "checks, output to ./dist, and type declarations.",
    template: `{
  "compilerOptions": {
    "______": true,
    "target": "ES2022",
    "module": "ESNext",
    "______": true,
    "outDir": "./dist",
    "sourceMap": true,
    "______": true
  },
  "include": ["src/**/*.ts"]
}`,
    solution: `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "noEmitOnError": true,
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "strict",
        hint: "Which option enables ALL strict checks at once?",
      },
      {
        placeholder: "______",
        answer: "noEmitOnError",
        hint: "Which option prevents JavaScript output when there are type errors?",
      },
      {
        placeholder: "______",
        answer: "declaration",
        hint: "Which option generates .d.ts files (type declarations)?",
      },
    ],
    concept: "tsconfig.json / Compiler Options",
  },

  // ─── 6: Type Assertion vs. Conversion (hard) ────────────────────────────
  {
    id: "01-cp-assertion-vs-conversion",
    title: "Type Assertion vs. Real Conversion",
    description:
      "Fix the code. In line A, a Type Assertion is incorrectly " +
      "used where a real conversion is needed. " +
      "In line B, a real validation is needed.",
    template: `// API data is unknown at runtime:
const apiData: unknown = fetchFromApi();

// Line A — WRONG: as does not convert!
// const name = apiData as string;
// CORRECT:
const name = ______(apiData);

// Line B — Safe Check:
if (______ apiData === "______") {
  // TypeScript now knows: apiData is string
  console.log(apiData.toUpperCase());
}`,
    solution: `// API data is unknown at runtime:
const apiData: unknown = fetchFromApi();

// Line A — CORRECT: Real conversion
const name = String(apiData);

// Line B — Safe Check:
if (typeof apiData === "string") {
  // TypeScript now knows: apiData is string
  console.log(apiData.toUpperCase());
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "String",
        hint: "Which JavaScript function ACTUALLY converts a value to a string?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator checks the runtime type?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Which typeof value do you check for a string?",
      },
    ],
    concept: "Type Assertion vs. Conversion / typeof",
  },
];
```