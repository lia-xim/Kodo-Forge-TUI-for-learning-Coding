/**
 * Lesson 07 — Completion Problems: Union & Intersection Types
 *
 * 6 code templates with strategic blanks.
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
  {
    id: "07-cp-union-narrowing",
    title: "Narrowing a Union Type with typeof",
    description: "Write a function that correctly handles string | number.",
    template: `function formatValue(value: string ______ number): string {
  if (______(value) === "string") {
    return value.toUpperCase();
  }
  return value.______(2);
}`,
    solution: `function formatValue(value: string | number): string {
  if (typeof(value) === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}`,
    blanks: [
      { placeholder: "______", answer: "|", hint: "Which operator creates a union type?" },
      { placeholder: "______", answer: "typeof", hint: "Which operator checks the runtime type?" },
      { placeholder: "______", answer: "toFixed", hint: "Which number method formats decimal places?" },
    ],
    concept: "Union Types / typeof Narrowing",
  },

  {
    id: "07-cp-discriminated-union",
    title: "Discriminated Union with a Tag Property",
    description: "Create a discriminated union for geometric shapes.",
    template: `type Shape =
  | { ______: "circle"; radius: number }
  | { ______: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.______) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    default:
      const _exhaustive: ______ = shape;
      return _exhaustive;
  }
}`,
    solution: `type Shape =
  | { type: "circle"; radius: number }
  | { type: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "type", hint: "The shared tag property is often called 'type' or 'kind'." },
      { placeholder: "______", answer: "type", hint: "The same property in both union members." },
      { placeholder: "______", answer: "type", hint: "Which property is checked in the switch?" },
      { placeholder: "______", answer: "never", hint: "Which type represents 'no value possible' for the exhaustive check?" },
    ],
    concept: "Discriminated Unions / Exhaustive Check",
  },

  {
    id: "07-cp-intersection",
    title: "Intersection for a Capability Mixin",
    description: "Combine two interfaces with an intersection.",
    template: `interface HasName {
  name: string;
}

interface HasEmail {
  email: string;
}

type ContactInfo = HasName ______ HasEmail;

function sendEmail(contact: ______): void {
  console.log(\`Sending to \${contact.name} (\${contact.______})\`);
}

sendEmail({ name: "Max", email: "max@test.de" });`,
    solution: `interface HasName {
  name: string;
}

interface HasEmail {
  email: string;
}

type ContactInfo = HasName & HasEmail;

function sendEmail(contact: ContactInfo): void {
  console.log(\`Sending to \${contact.name} (\${contact.email})\`);
}

sendEmail({ name: "Max", email: "max@test.de" });`,
    blanks: [
      { placeholder: "______", answer: "&", hint: "Which operator combines BOTH types (AND)?" },
      { placeholder: "______", answer: "ContactInfo", hint: "Use the defined intersection type." },
      { placeholder: "______", answer: "email", hint: "Which property comes from HasEmail?" },
    ],
    concept: "Intersection Types / Capability Mixin",
  },

  {
    id: "07-cp-result-pattern",
    title: "Implementing the Result Pattern",
    description: "Create the result pattern for type-safe error handling.",
    template: `type Result<T> =
  | { success: ______; data: T }
  | { success: ______; error: string };

function divide(a: number, b: number): Result<______> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.______) {
  console.log(result.data); // TypeScript knows: data exists
}`,
    solution: `type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.success) {
  console.log(result.data);
}`,
    blanks: [
      { placeholder: "______", answer: "true", hint: "Which literal value does success have in the success case?" },
      { placeholder: "______", answer: "false", hint: "Which literal value does success have in the error case?" },
      { placeholder: "______", answer: "number", hint: "What is the data type for a division result?" },
      { placeholder: "______", answer: "success", hint: "Which property is checked to narrow the type?" },
    ],
    concept: "Result Pattern / Discriminated Unions",
  },

  {
    id: "07-cp-in-narrowing",
    title: "in-Operator for Property Checks",
    description: "Use the in-operator to distinguish between union members.",
    template: `type Admin = { name: string; permissions: string[] };
type Guest = { name: string; visitCount: number };
type User = Admin ______ Guest;

function greet(user: User): string {
  if ("______" ______ user) {
    return \`Admin \${user.name} with \${user.permissions.length} permissions\`;
  }
  return \`Guest \${user.name} (Visit #\${user.visitCount})\`;
}`,
    solution: `type Admin = { name: string; permissions: string[] };
type Guest = { name: string; visitCount: number };
type User = Admin | Guest;

function greet(user: User): string {
  if ("permissions" in user) {
    return \`Admin \${user.name} with \${user.permissions.length} permissions\`;
  }
  return \`Guest \${user.name} (Visit #\${user.visitCount})\`;
}`,
    blanks: [
      { placeholder: "______", answer: "|", hint: "User is a union of Admin and Guest." },
      { placeholder: "______", answer: "permissions", hint: "Which property exists ONLY in Admin?" },
      { placeholder: "______", answer: "in", hint: "Which operator checks whether a property exists?" },
    ],
    concept: "in-Operator Narrowing",
  },

  {
    id: "07-cp-type-guard-filter",
    title: "Type Guard with Array.filter (TS 5.5+)",
    description: "Filter null values from an array — with inferred type predicates.",
    template: `const mixed: (string | ______)[] = ["hello", null, "world", null];

// TS 5.5+: type predicate is automatically inferred!
const strings = mixed.______(x => x ______ null);
// strings has type: string[]

console.log(strings.map(s => s.toUpperCase()));`,
    solution: `const mixed: (string | null)[] = ["hello", null, "world", null];

const strings = mixed.filter(x => x !== null);
// strings has type: string[]

console.log(strings.map(s => s.toUpperCase()));`,
    blanks: [
      { placeholder: "______", answer: "null", hint: "What other value does the array contain besides strings?" },
      { placeholder: "______", answer: "filter", hint: "Which array method filters out elements?" },
      { placeholder: "______", answer: "!==", hint: "Which comparison operator excludes null?" },
    ],
    concept: "TS 5.5 Inferred Type Predicates / filter",
  },
];