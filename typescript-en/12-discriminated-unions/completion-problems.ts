/**
 * Lesson 12 — Completion Problems: Discriminated Unions
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
    id: "12-cp-basic-du",
    title: "Basic Discriminated Union",
    description: "Create a Discriminated Union for shapes and an area calculation.",
    template: `type Circle = { ______: "circle"; radius: number };
type Rectangle = { ______: "rectangle"; width: number; height: number };

type Shape = Circle ______ Rectangle;

function area(shape: Shape): number {
  ______(shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.______ * shape.height;
  }
}`,
    solution: `type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch(shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "kind", hint: "What is the conventional name for the tag property?" },
      { placeholder: "______", answer: "kind", hint: "Same tag property in all variants." },
      { placeholder: "______", answer: "|", hint: "Which operator connects union members?" },
      { placeholder: "______", answer: "switch", hint: "Which statement is ideal for multiple cases?" },
      { placeholder: "______", answer: "width", hint: "Which property does Rectangle have besides height?" },
    ],
    concept: "Discriminated Union Basics",
  },

  {
    id: "12-cp-exhaustive-check",
    title: "Exhaustive Check with assertNever",
    description: "Implement a function with an exhaustive check.",
    template: `function assertNever(value: ______): never {
  throw new Error(\`Unhandled: \${value}\`);
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function reduce(count: number, action: Action): number {
  switch (action.______) {
    case "increment": return count + 1;
    case "decrement": return count - 1;
    case "reset": return 0;
    ______:
      return assertNever(______);
  }
}`,
    solution: `function assertNever(value: never): never {
  throw new Error(\`Unhandled: \${value}\`);
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function reduce(count: number, action: Action): number {
  switch (action.type) {
    case "increment": return count + 1;
    case "decrement": return count - 1;
    case "reset": return 0;
    default:
      return assertNever(action);
  }
}`,
    blanks: [
      { placeholder: "______", answer: "never", hint: "Which type represents 'should never happen'?" },
      { placeholder: "______", answer: "type", hint: "What is the tag property of Action called?" },
      { placeholder: "______", answer: "default", hint: "Which branch catches all remaining cases?" },
      { placeholder: "______", answer: "action", hint: "What do we pass to assertNever?" },
    ],
    concept: "Exhaustive Check / assertNever",
  },

  {
    id: "12-cp-option-type",
    title: "Define Option<T> Type",
    description: "Create the Option type with constructors and unwrapOr.",
    template: `type Option<T> =
  | { tag: "______"; value: T }
  | { tag: "______" };

function some<T>(value: T): Option<T> {
  return { tag: "some", ______ };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  if (opt.______ === "some") {
    return opt.value;
  }
  return ______;
}`,
    solution: `type Option<T> =
  | { tag: "some"; value: T }
  | { tag: "none" };

function some<T>(value: T): Option<T> {
  return { tag: "some", value };
}

function none<T>(): Option<T> {
  return { tag: "none" };
}

function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  if (opt.tag === "some") {
    return opt.value;
  }
  return fallback;
}`,
    blanks: [
      { placeholder: "______", answer: "some", hint: "The variant WITH a value is called..." },
      { placeholder: "______", answer: "none", hint: "The variant WITHOUT a value is called..." },
      { placeholder: "______", answer: "value", hint: "Which property carries the value?" },
      { placeholder: "______", answer: "tag", hint: "What is the discriminator called?" },
      { placeholder: "______", answer: "fallback", hint: "Which parameter is the default value?" },
    ],
    concept: "Option<T> / ADT",
  },

  {
    id: "12-cp-async-state",
    title: "Model AsyncState<T>",
    description: "Create a type-safe loading state.",
    template: `type AsyncState<T> =
  | { status: "idle" }
  | { status: "______" }
  | { status: "error"; ______: string }
  | { status: "success"; ______: T };

function render<T>(state: AsyncState<T>): string {
  switch (state.______) {
    case "idle": return "Ready";
    case "loading": return "Loading...";
    case "error": return \`Error: \${state.error}\`;
    case "success": return \`OK: \${JSON.stringify(state.data)}\`;
  }
}`,
    solution: `type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case "idle": return "Ready";
    case "loading": return "Loading...";
    case "error": return \`Error: \${state.error}\`;
    case "success": return \`OK: \${JSON.stringify(state.data)}\`;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "loading", hint: "Which status is active while data is being loaded?" },
      { placeholder: "______", answer: "error", hint: "Which property carries the error message?" },
      { placeholder: "______", answer: "data", hint: "Which property carries the loaded data?" },
      { placeholder: "______", answer: "status", hint: "What is the discriminator called?" },
    ],
    concept: "AsyncState / State Modeling",
  },

  {
    id: "12-cp-result-type",
    title: "Result<T, E> with Error Handling",
    description: "Create a validation function with the Result type.",
    template: `type Result<T, E> =
  | { ok: ______; value: T }
  | { ok: ______; error: E };

function parseAge(input: string): Result<number, string> {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return { ok: false, ______: \`"\${input}" is not a number\` };
  }
  return { ok: true, ______: num };
}

const result = parseAge("25");
if (result.______) {
  console.log(\`Age: \${result.value}\`);
}`,
    solution: `type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseAge(input: string): Result<number, string> {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return { ok: false, error: \`"\${input}" is not a number\` };
  }
  return { ok: true, value: num };
}

const result = parseAge("25");
if (result.ok) {
  console.log(\`Age: \${result.value}\`);
}`,
    blanks: [
      { placeholder: "______", answer: "true", hint: "Which Boolean value represents success?" },
      { placeholder: "______", answer: "false", hint: "Which Boolean value represents failure?" },
      { placeholder: "______", answer: "error", hint: "Which property carries the error?" },
      { placeholder: "______", answer: "value", hint: "Which property carries the success value?" },
      { placeholder: "______", answer: "ok", hint: "Which discriminator is checked?" },
    ],
    concept: "Result<T, E> / Error Handling",
  },

  {
    id: "12-cp-extract-utility",
    title: "Extract with Discriminated Unions",
    description: "Use Extract to write a specialized function.",
    template: `type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number };

// Click events only:
type ClickEvent = ______<Event, { type: "______" }>;

// All events EXCEPT Click:
type NonClickEvent = ______<Event, { type: "click" }>;

function handleClick(event: ClickEvent): string {
  return \`Click at \${event.______}, \${event.y}\`;
}`,
    solution: `type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number };

type ClickEvent = Extract<Event, { type: "click" }>;

type NonClickEvent = Exclude<Event, { type: "click" }>;

function handleClick(event: ClickEvent): string {
  return \`Click at \${event.x}, \${event.y}\`;
}`,
    blanks: [
      { placeholder: "______", answer: "Extract", hint: "Which utility type KEEPS matching variants?" },
      { placeholder: "______", answer: "click", hint: "Which event type should be extracted?" },
      { placeholder: "______", answer: "Exclude", hint: "Which utility type REMOVES matching variants?" },
      { placeholder: "______", answer: "x", hint: "Which property does the click event have besides y?" },
    ],
    concept: "Extract / Exclude Utility Types",
  },
];