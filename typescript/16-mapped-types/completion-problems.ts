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
    title: "Partial nachbauen",
    description: "Vervollstaendige die Implementierung von MyPartial.",
    template: `type MyPartial<______> = {
  [K in ______ T]______: T[K];
};`,
    solution: `type MyPartial<T> = {
  [K in keyof T]?: T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "Welcher Typparameter wird fuer den Eingabetyp verwendet?" },
      { placeholder: "______", answer: "keyof", hint: "Welches Keyword gibt alle Keys von T als Union?" },
      { placeholder: "______", answer: "?", hint: "Welcher Modifier macht Properties optional?" },
    ],
    concept: "Mapped Type Grundsyntax",
  },
  {
    id: "16-cp-mutable",
    title: "Mutable<T> — readonly entfernen",
    description: "Vervollstaendige den Mapped Type der readonly entfernt.",
    template: `type Mutable<T> = {
  ______ [K in keyof T]: T[K];
};`,
    solution: `type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "-readonly", hint: "Welcher Modifier ENTFERNT readonly?" },
    ],
    concept: "Modifier entfernen",
  },
  {
    id: "16-cp-getters",
    title: "Getter-Typ generieren",
    description: "Vervollstaendige den Mapped Type der Getter-Methoden generiert.",
    template: `type Getters<T> = {
  [K in keyof T as \`______\${______<______ & K>}\`]: () => T[K];
};`,
    solution: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "get", hint: "Welcher Prefix steht vor dem Property-Namen?" },
      { placeholder: "______", answer: "Capitalize", hint: "Welche Utility macht den ersten Buchstaben gross?" },
      { placeholder: "______", answer: "string", hint: "Welcher Typ stellt sicher dass K ein String-Key ist?" },
    ],
    concept: "Key Remapping mit Template Literals",
  },
  {
    id: "16-cp-omitbytype",
    title: "OmitByType — Properties nach Typ filtern",
    description: "Vervollstaendige den Mapped Type der Properties eines bestimmten Typs entfernt.",
    template: `type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? ______ : ______]: T[K];
};`,
    solution: `type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};`,
    blanks: [
      { placeholder: "______", answer: "never", hint: "Welcher Typ im Key Remapping entfernt den Key?" },
      { placeholder: "______", answer: "K", hint: "Welcher Wert behaelt den Key unveraendert?" },
    ],
    concept: "Key-Filterung mit never",
  },
  {
    id: "16-cp-deep-readonly",
    title: "DeepReadonly — Rekursiv readonly",
    description: "Vervollstaendige den rekursiven DeepReadonly-Typ.",
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
      { placeholder: "______", answer: "readonly", hint: "Welcher Modifier macht Properties schreibgeschuetzt?" },
      { placeholder: "______", answer: "object", hint: "Welcher Typ prueft ob T[K] ein Objekt ist?" },
      { placeholder: "______", answer: "DeepReadonly", hint: "Wie heisst der Typ der sich selbst aufruft (Rekursion)?" },
    ],
    concept: "Rekursive Mapped Types",
  },
  {
    id: "16-cp-form-errors",
    title: "FormErrors<T> — Formular-Fehlermeldungen",
    description: "Vervollstaendige den Mapped Type fuer Formular-Fehler.",
    template: `type FormErrors<______> = {
  [K in keyof T]______: ______;
};

interface LoginForm {
  email: string;
  password: string;
}

const errors: FormErrors<LoginForm> = {
  email: "Pflichtfeld",
  // password ist optional — kein Fehler
};`,
    solution: `type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface LoginForm {
  email: string;
  password: string;
}

const errors: FormErrors<LoginForm> = {
  email: "Pflichtfeld",
};`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "Welcher Typparameter repraesentiert den Form-Typ?" },
      { placeholder: "______", answer: "?", hint: "Welcher Modifier macht den Fehler optional (nicht jedes Feld hat einen Fehler)?" },
      { placeholder: "______", answer: "string", hint: "Welcher Typ repraesentiert eine Fehlermeldung?" },
    ],
    concept: "Praxis-Pattern: Form Types",
  },
];
