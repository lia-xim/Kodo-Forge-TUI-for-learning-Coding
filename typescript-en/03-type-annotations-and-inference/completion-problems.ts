/**
 * Lesson 03 — Completion Problems: Type Annotations & Inference
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
  // ─── 1: When to annotate, when to infer (easy) ───────────────────────────
  {
    id: "03-cp-annotate-or-infer",
    title: "Annotate or let infer?",
    description:
      "Decide for each position whether an annotation is needed " +
      "or whether TypeScript recognizes the type itself. Write 'INFER' " +
      "when the annotation is unnecessary.",
    template: `// Parameter: MUST be annotated
function greet(name: ______): string {
  // Local variable: inference is sufficient
  const message ______ = \`Hallo, \${name}!\`;
  return message;
}

// const with primitive: inference is sufficient
const greeting ______ = greet("Max");

// Empty array: MUST be annotated
const items: ______[] = [];`,
    solution: `// Parameter: MUST be annotated
function greet(name: string): string {
  // Local variable: inference is sufficient
  const message = \`Hallo, \${name}!\`;
  return message;
}

// const with primitive: inference is sufficient
const greeting = greet("Max");

// Empty array: MUST be annotated
const items: string[] = [];`,
    blanks: [
      {
        placeholder: "______",
        answer: "string",
        hint: "Function parameters ALWAYS need an annotation.",
      },
      {
        placeholder: "______",
        answer: "",
        hint: "Does a local variable with an initial value need an annotation? (No — leave empty.)",
      },
      {
        placeholder: "______",
        answer: "",
        hint: "Can TypeScript infer the type from the function call? (Yes — leave empty.)",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Empty arrays need an annotation — what type should the elements be?",
      },
    ],
    concept: "When to annotate? / Inference rules",
  },

  // ─── 2: Controlling widening (easy-medium) ─────────────────────────────
  {
    id: "03-cp-widening",
    title: "Understanding and controlling widening",
    description:
      "Fill in the types that TypeScript infers for each variable. " +
      "Pay attention to the difference between let and const.",
    template: `const literal = "hello";
// TypeScript infers: ______

let mutable = "hello";
// TypeScript infers: ______

const config = { mode: "dark" };
// Type of config.mode: ______

const configFixed = { mode: "dark" } as ______;
// Type of configFixed.mode: ______`,
    solution: `const literal = "hello";
// TypeScript infers: "hello"

let mutable = "hello";
// TypeScript infers: string

const config = { mode: "dark" };
// Type of config.mode: string

const configFixed = { mode: "dark" } as const;
// Type of configFixed.mode: "dark"`,
    blanks: [
      {
        placeholder: "______",
        answer: '"hello"',
        hint: "const with primitive: TypeScript keeps the literal type.",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "let allows reassignment — TypeScript widens to the base type.",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Object properties are widened, even with const.",
      },
      {
        placeholder: "______",
        answer: "const",
        hint: "Which keyword prevents widening for objects?",
      },
      {
        placeholder: "______",
        answer: '"dark"',
        hint: "With as const, the literal type is preserved.",
      },
    ],
    concept: "Type Widening / const vs. let / as const",
  },

  // ─── 3: Using contextual typing (medium) ─────────────────────────────────
  {
    id: "03-cp-contextual-typing",
    title: "Using contextual typing",
    description:
      "Use contextual typing to avoid unnecessary annotations. " +
      "For the last position: Why is contextual typing lost?",
    template: `const numbers = [10, 20, 30];

// Contextual typing: n automatically has type 'number'
const doubled = numbers.map(______ => n * 2);

// Contextual typing with .filter():
const large = numbers.filter(______ => n > 15);

// Contextual typing with .reduce():
const sum = numbers.reduce((______, curr) => acc + curr, 0);

// NO contextual typing — type must be annotated:
const handler = (event: ______) => {
  console.log(event.clientX);
};
document.addEventListener("click", handler);`,
    solution: `const numbers = [10, 20, 30];

const doubled = numbers.map(n => n * 2);

const large = numbers.filter(n => n > 15);

const sum = numbers.reduce((acc, curr) => acc + curr, 0);

const handler = (event: MouseEvent) => {
  console.log(event.clientX);
};
document.addEventListener("click", handler);`,
    blanks: [
      {
        placeholder: "______",
        answer: "n",
        hint: "TypeScript knows the type from the array element. Just the parameter name.",
      },
      {
        placeholder: "______",
        answer: "n",
        hint: "Same as with .map() — contextual typing works with all array methods.",
      },
      {
        placeholder: "______",
        answer: "acc",
        hint: "The accumulator — its type comes from the initial value (0 → number).",
      },
      {
        placeholder: "______",
        answer: "MouseEvent",
        hint: "Contextual typing is missing with a separate definition. Which event type matches 'click'?",
      },
    ],
    concept: "Contextual Typing / Callback-Inference",
  },

  // ─── 4: Control Flow Narrowing (medium) ──────────────────────────────────
  {
    id: "03-cp-control-flow",
    title: "Control Flow Narrowing",
    description:
      "Complete the function. TypeScript narrows the type " +
      "after each check — take advantage of that.",
    template: `function format(value: string | number | boolean | null): string {
  // Step 1: exclude null
  if (value ______ null) {
    return "kein Wert";
  }
  // Here value is: string | number | boolean

  // Step 2: detect string
  if (______ value === "______") {
    return value.toUpperCase();
  }
  // Here value is: number | boolean

  // Step 3: detect number
  if (typeof value === "number") {
    return value.______(2);
  }
  // Here value is: boolean

  return value ? "ja" : "nein";
}`,
    solution: `function format(value: string | number | boolean | null): string {
  if (value === null) {
    return "kein Wert";
  }

  if (typeof value === "string") {
    return value.toUpperCase();
  }

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ? "ja" : "nein";
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "===",
        hint: "Strict equality operator for null check.",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator enables type narrowing for primitive types?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "What typeof value are you checking against?",
      },
      {
        placeholder: "______",
        answer: "toFixed",
        hint: "Which number method formats to a specific number of decimal places?",
      },
    ],
    concept: "Control Flow Analysis / Type Narrowing",
  },

  // ─── 5: satisfies in practice (medium-hard) ──────────────────────────────
  {
    id: "03-cp-satisfies",
    title: "satisfies vs. Annotation",
    description:
      "Use `satisfies` to validate a configuration " +
      "AND at the same time keep the precise types.",
    template: `type RouteConfig = Record<string, {
  path: string;
  auth: boolean;
}>;

// With annotation — types are lost:
const routesAnnotated: RouteConfig = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
};
// routesAnnotated.home.path is: string (not "/")

// With satisfies — precise types are preserved:
const routes = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} ______ RouteConfig;

// routes.home.path is now: "/"
// routes.dashboard.auth is now: true

// Combination: as const + satisfies for maximum precision
const ROUTES = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} ______ ______ ______ RouteConfig;

// All route paths as union type:
type RoutePath = ______ ROUTES[keyof typeof ROUTES]["path"];
// Result: "/" | "/dashboard"`,
    solution: `type RouteConfig = Record<string, {
  path: string;
  auth: boolean;
}>;

const routesAnnotated: RouteConfig = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
};

const routes = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} satisfies RouteConfig;

const ROUTES = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} as const satisfies RouteConfig;

type RoutePath = typeof ROUTES[keyof typeof ROUTES]["path"];
// Result: "/" | "/dashboard"`,
    blanks: [
      {
        placeholder: "______",
        answer: "satisfies",
        hint: "Which operator validates against a type WITHOUT losing the inference?",
      },
      {
        placeholder: "______",
        answer: "as",
        hint: "First part of 'as const' — for literal types.",
      },
      {
        placeholder: "______",
        answer: "const",
        hint: "Second part — makes everything readonly and literal.",
      },
      {
        placeholder: "______",
        answer: "satisfies",
        hint: "Then comes the validation — which operator?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Which operator extracts the TYPE from a runtime variable?",
      },
    ],
    concept: "satisfies / as const / Precise Inference",
  },

  // ─── 6: Return Type Best Practices (hard) ────────────────────────────────
  {
    id: "03-cp-return-types",
    title: "Return types for exported functions",
    description:
      "Annotate the return types of exported functions explicitly. " +
      "The 'Annotate at boundaries' principle: internal inference, " +
      "external annotation.",
    template: `// EXPORTED: Explicit return type (Best Practice)
export function parseAge(input: string): ______ {
  const parsed = parseInt(input, 10);
  if (______) return null;
  if (parsed < 0 || parsed > 150) return null;
  return parsed;
}

// EXPORTED: Complex return — type documents the intention
export function classify(value: unknown): ______ {
  if (value === null || value === undefined) return "empty" ______ const;
  if (typeof value === "string") return "text" as const;
  if (typeof value === "number") return "numeric" as const;
  return "other" as const;
}

// INTERNAL: Inference is sufficient (not exported)
function double(n: number) {
  return n * 2;
}`,
    solution: `export function parseAge(input: string): number | null {
  const parsed = parseInt(input, 10);
  if (isNaN(parsed)) return null;
  if (parsed < 0 || parsed > 150) return null;
  return parsed;
}

export function classify(value: unknown): "empty" | "text" | "numeric" | "other" {
  if (value === null || value === undefined) return "empty" as const;
  if (typeof value === "string") return "text" as const;
  if (typeof value === "number") return "numeric" as const;
  return "other" as const;
}

function double(n: number) {
  return n * 2;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "number | null",
        hint: "The function returns either a number or null.",
      },
      {
        placeholder: "______",
        answer: "isNaN(parsed)",
        hint: "How do you check if parseInt returned an invalid value (NaN)?",
      },
      {
        placeholder: "______",
        answer: '"empty" | "text" | "numeric" | "other"',
        hint: "Union of all possible return values as literal types.",
      },
      {
        placeholder: "______",
        answer: "as",
        hint: "Keyword for 'as const' to keep the literal type in the return.",
      },
    ],
    concept: "Return type annotation / Annotate at boundaries / as const",
  },
];