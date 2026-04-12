/**
 * Lektion 16 — Completion Problems: Mapped Types
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
    id: "16-cp-partial",
    title: "Rebuilding Partial",
    description: "Complete the implementation of MyPartial.",
    template: `type MyPartial<______> = {
  [K in ______ T]______: T[K];
};`,
    solution: `type MyPartial<T> = {
  [K in keyof T]?: T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "Which type parameter is used for the input type?" },
      { placeholder: "______", answer: "keyof", hint: "Which keyword returns all keys of T as a union?" },
      { placeholder: "______", answer: "?", hint: "Which modifier makes properties optional?" },
    ],
    concept: "Mapped Type Basic Syntax",
  },
  {
    id: "16-cp-mutable",
    title: "Mutable<T> — removing readonly",
    description: "Complete the mapped type that removes readonly.",
    template: `type Mutable<T> = {
  ______ [K in keyof T]: T[K];
};`,
    solution: `type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "-readonly", hint: "Which modifier REMOVES readonly?" },
    ],
    concept: "Removing Modifiers",
  },
  {
    id: "16-cp-getters",
    title: "Generating Getter Types",
    description: "Complete the mapped type that generates getter methods.",
    template: `type Getters<T> = {
  [K in keyof T as \`______\${______<______ & K>}\`]: () => T[K];
};`,
    solution: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "get", hint: "Which prefix goes before the property name?" },
      { placeholder: "______", answer: "Capitalize", hint: "Which utility capitalizes the first letter?" },
      { placeholder: "______", answer: "string", hint: "Which type ensures that K is a string key?" },
    ],
    concept: "Key Remapping with Template Literals",
  },
  {
    id: "16-cp-omitbytype",
    title: "OmitByType — Filtering Properties by Type",
    description: "Complete the mapped type that removes properties of a specific type.",
    template: `type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? ______ : ______]: T[K];
};`,
    solution: `type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "never", hint: "Which type in key remapping removes the key?" },
      { placeholder: "______", answer: "K", hint: "Which value keeps the key unchanged?" },
    ],
    concept: "Key Filtering with never",
  },
  {
    id: "16-cp-deep-readonly",
    title: "DeepReadonly — Recursive readonly",
    description: "Complete the recursive DeepReadonly type.",
    template: `type DeepReadonly<T> = {
  ______ [K in keyof T]: T[K] extends ______
    ? T[K] extends Function
      ? T[K]
      : ______<T[K]>
    : T[K];
};`,
    solution: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "readonly", hint: "Which modifier makes properties read-only?" },
      { placeholder: "______", answer: "object", hint: "Which type checks whether T[K] is an object?" },
      { placeholder: "______", answer: "DeepReadonly", hint: "What is the name of the type that calls itself (recursion)?" },
    ],
    concept: "Recursive Mapped Types",
  },
  {
    id: "16-cp-form-errors",
    title: "FormErrors<T> — Form Error Messages",
    description: "Complete the mapped type for form errors.",
    template: `type FormErrors<______> = {
  [K in keyof T]______: ______;
};

interface LoginForm {
  email: string;
  password: string;
}

const errors: FormErrors<LoginForm> = {
  email: "Required field",
  // password is optional — no error
};`,
    solution: `type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface LoginForm {
  email: string;
  password: string;
}

const errors: FormErrors<LoginForm> = {
  email: "Required field",
};`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "Which type parameter represents the form type?" },
      { placeholder: "______", answer: "?", hint: "Which modifier makes the error optional (not every field has an error)?" },
      { placeholder: "______", answer: "string", hint: "Which type represents an error message?" },
    ],
    concept: "Practical Pattern: Form Types",
  },
];