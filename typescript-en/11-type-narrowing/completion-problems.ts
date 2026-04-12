/**
 * Lesson 11 — Completion Problems: Type Narrowing
 *
 * Code templates with strategic blanks (______).
 * The learner fills in the blanks — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code with ______ as placeholder for blanks */
  template: string;
  /** Solution with filled blanks */
  solution: string;
  /** Which blank has which answer */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Related concept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: typeof Guard (easy) ────────────────────────────────────────────
  {
    id: "11-cp-typeof-guard",
    title: "typeof Guard for string | number",
    description:
      "Add the correct typeof check to narrow the type of 'wert' " +
      "and perform safe operations.",
    template: `function formatiere(wert: string | number): string {
  if (______ wert === "______") {
    return wert.toUpperCase();
  }
  return wert.______(2);
}`,
    solution: `function formatiere(wert: string | number): string {
  if (typeof wert === "string") {
    return wert.toUpperCase();
  }
  return wert.toFixed(2);
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator checks the runtime type?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Which typeof value represents text?",
      },
      {
        placeholder: "______",
        answer: "toFixed",
        hint: "Which number method formats to decimal places?",
      },
    ],
    concept: "typeof Narrowing",
  },

  // ─── 2: null Check with Early Return (easy) ────────────────────────────
  {
    id: "11-cp-null-check",
    title: "null Elimination with Early Return",
    description:
      "Use an early return to eliminate null " +
      "before accessing string methods.",
    template: `function safeTrim(text: string | ______): string {
  if (text ______ null) ______ "";
  return text.trim();
}`,
    solution: `function safeTrim(text: string | null): string {
  if (text === null) return "";
  return text.trim();
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "null",
        hint: "Which type represents 'intentionally no value'?",
      },
      {
        placeholder: "______",
        answer: "===",
        hint: "Which operator checks strict equality?",
      },
      {
        placeholder: "______",
        answer: "return",
        hint: "Which keyword exits the function early?",
      },
    ],
    concept: "null Narrowing / Early Return",
  },

  // ─── 3: in Operator (medium) ───────────────────────────────────────────
  {
    id: "11-cp-in-operator",
    title: "in Operator for Discriminated Union",
    description:
      "Use the in operator to distinguish between different " +
      "message types.",
    template: `interface TextMsg { content: string }
interface ImageMsg { url: string; width: number }
type Message = TextMsg | ImageMsg;

function describe(msg: Message): string {
  if ("______" ______ msg) {
    return \`Bild: \${msg.url}\`;
  }
  return \`Text: \${msg.content}\`;
}`,
    solution: `interface TextMsg { content: string }
interface ImageMsg { url: string; width: number }
type Message = TextMsg | ImageMsg;

function describe(msg: Message): string {
  if ("url" in msg) {
    return \`Bild: \${msg.url}\`;
  }
  return \`Text: \${msg.content}\`;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "url",
        hint: "Which property does only ImageMsg have?",
      },
      {
        placeholder: "______",
        answer: "in",
        hint: "Which operator checks whether a property exists?",
      },
    ],
    concept: "in Operator / Discriminated Unions",
  },

  // ─── 4: Custom Type Guard (medium) ─────────────────────────────────────
  {
    id: "11-cp-type-guard",
    title: "Custom Type Guard with is Keyword",
    description:
      "Write a type guard that validates unknown data as a User.",
    template: `interface User {
  name: string;
  age: number;
}

function isUser(data: unknown): data ______ User {
  return (
    ______ data === "object" &&
    data !== ______ &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string" &&
    "age" in data &&
    typeof (data as Record<string, unknown>).age === "number"
  );
}`,
    solution: `interface User {
  name: string;
  age: number;
}

function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string" &&
    "age" in data &&
    typeof (data as Record<string, unknown>).age === "number"
  );
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "is",
        hint: "Which keyword turns a function into a type guard?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator checks the runtime type?",
      },
      {
        placeholder: "______",
        answer: "null",
        hint: "typeof null === 'object' — what must be excluded?",
      },
    ],
    concept: "Type Predicates / is-Keyword",
  },

  // ─── 5: assertNever (medium-hard) ──────────────────────────────────────
  {
    id: "11-cp-assert-never",
    title: "Exhaustive Switch with assertNever",
    description:
      "Implement the assertNever function and use it " +
      "in an exhaustive switch.",
    template: `function assertNever(value: ______): ______ {
  throw new Error(\`Unbehandelter Fall: \${value}\`);
}

type Light = "red" | "yellow" | "green";

function action(light: Light): string {
  switch (light) {
    case "red":    return "Stop";
    case "yellow": return "Vorsicht";
    case "green":  return "Fahren";
    default:       return ______(light);
  }
}`,
    solution: `function assertNever(value: never): never {
  throw new Error(\`Unbehandelter Fall: \${value}\`);
}

type Light = "red" | "yellow" | "green";

function action(light: Light): string {
  switch (light) {
    case "red":    return "Stop";
    case "yellow": return "Vorsicht";
    case "green":  return "Fahren";
    default:       return assertNever(light);
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "never",
        hint: "Which type represents 'should never occur'?",
      },
      {
        placeholder: "______",
        answer: "never",
        hint: "What return type does a function that always throws have?",
      },
      {
        placeholder: "______",
        answer: "assertNever",
        hint: "What is the helper function you just defined called?",
      },
    ],
    concept: "Exhaustive Checks / never / assertNever",
  },

  // ─── 6: TS 5.5 Inferred Predicates (hard) ─────────────────────────────
  {
    id: "11-cp-inferred-predicates",
    title: "TS 5.5 Inferred Type Predicates with filter",
    description:
      "Use filter() to remove null/undefined from arrays. " +
      "From TS 5.5 onwards, TypeScript narrows automatically.",
    template: `const items: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];

// Entferne null und undefined (TS 5.5+ narrowt automatisch):
const clean = items.______(x => x ______ null && x ______ undefined);
// Typ: string[]

// Filtere nur strings mit Laenge > 1:
const long = clean.filter(s => s.______ > 1);`,
    solution: `const items: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];

const clean = items.filter(x => x !== null && x !== undefined);
// Typ: string[]

const long = clean.filter(s => s.length > 1);`,
    blanks: [
      {
        placeholder: "______",
        answer: "filter",
        hint: "Which array method filters elements?",
      },
      {
        placeholder: "______",
        answer: "!==",
        hint: "Which operator checks strict inequality?",
      },
      {
        placeholder: "______",
        answer: "!==",
        hint: "Same operator — also exclude undefined.",
      },
      {
        placeholder: "______",
        answer: "length",
        hint: "Which string property returns the length?",
      },
    ],
    concept: "TS 5.5 Inferred Type Predicates / filter",
  },
];