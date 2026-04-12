/**
 * Lesson 15 — Completion Problems: Utility Types
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
    id: "15-cp-partial-update",
    title: "Update Function with Partial",
    description: "Create a type-safe update function that only accepts changed fields.",
    template: `interface User {
  id: number;
  name: string;
  email: string;
}

function updateUser(id: number, changes: ______<User>): User {
  const existing: User = { id, name: "Max", email: "max@test.com" };
  return { ...existing, ...______ };
}

updateUser(1, { ______: "new@mail.com" });`,
    solution: `interface User {
  id: number;
  name: string;
  email: string;
}

function updateUser(id: number, changes: Partial<User>): User {
  const existing: User = { id, name: "Max", email: "max@test.com" };
  return { ...existing, ...changes };
}

updateUser(1, { email: "new@mail.com" });`,
    blanks: [
      { placeholder: "______", answer: "Partial", hint: "Which Utility Type makes all properties optional?" },
      { placeholder: "______", answer: "changes", hint: "Which variable contains the changes?" },
      { placeholder: "______", answer: "email", hint: "Which field is being changed?" },
    ],
    concept: "Partial / Update Pattern",
  },

  {
    id: "15-cp-pick-omit",
    title: "Pick and Omit for API Types",
    description: "Create type-safe API input/output types from a base interface.",
    template: `interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
}

// API Response — everything (complete)
type ProductResponse = Product;

// Create Input — without server-generated fields
type CreateInput = ______<Product, "id" | "______">;

// Public Info — only id and name
type PublicInfo = ______<Product, "id" | "name">;`,
    solution: `interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
}

type ProductResponse = Product;
type CreateInput = Omit<Product, "id" | "createdAt">;
type PublicInfo = Pick<Product, "id" | "name">;`,
    blanks: [
      { placeholder: "______", answer: "Omit", hint: "Which Utility Type REMOVES properties?" },
      { placeholder: "______", answer: "createdAt", hint: "Which field is set by the server?" },
      { placeholder: "______", answer: "Pick", hint: "Which Utility Type SELECTS properties?" },
    ],
    concept: "Pick / Omit / API Types",
  },

  {
    id: "15-cp-record-lookup",
    title: "Record as Lookup Table",
    description: "Create a type-safe configuration with Record.",
    template: `type Theme = "light" | "dark" | "system";

interface ThemeConfig {
  background: string;
  text: string;
}

const themes: ______<______, ThemeConfig> = {
  light: { background: "#fff", text: "#000" },
  dark: { background: "#1a1a1a", text: "#fff" },
  ______: { background: "#f5f5f5", text: "#333" },
};

function getTheme(name: Theme): ThemeConfig {
  return themes[______];
}`,
    solution: `type Theme = "light" | "dark" | "system";

interface ThemeConfig {
  background: string;
  text: string;
}

const themes: Record<Theme, ThemeConfig> = {
  light: { background: "#fff", text: "#000" },
  dark: { background: "#1a1a1a", text: "#fff" },
  system: { background: "#f5f5f5", text: "#333" },
};

function getTheme(name: Theme): ThemeConfig {
  return themes[name];
}`,
    blanks: [
      { placeholder: "______", answer: "Record", hint: "Which Utility Type creates a dictionary?" },
      { placeholder: "______", answer: "Theme", hint: "Which type defines the allowed keys?" },
      { placeholder: "______", answer: "system", hint: "Which theme is still missing?" },
      { placeholder: "______", answer: "name", hint: "Which parameter is used to access themes?" },
    ],
    concept: "Record / Lookup Table",
  },

  {
    id: "15-cp-exclude-extract",
    title: "Union Filtering with Exclude and Extract",
    description: "Filter union types with Extract and Exclude.",
    template: `type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Write methods (everything except GET):
type WriteMethods = ______<HttpMethod, "GET">;

// Only update methods:
type UpdateMethods = ______<HttpMethod, "PUT" | "PATCH">;

type MaybeString = string | null | undefined;
// Guaranteed string:
type DefiniteString = ______<MaybeString>;`,
    solution: `type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type WriteMethods = Exclude<HttpMethod, "GET">;
type UpdateMethods = Extract<HttpMethod, "PUT" | "PATCH">;

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;`,
    blanks: [
      { placeholder: "______", answer: "Exclude", hint: "Which Utility Type REMOVES members from a union?" },
      { placeholder: "______", answer: "Extract", hint: "Which Utility Type KEEPS matching members?" },
      { placeholder: "______", answer: "NonNullable", hint: "Which Utility Type removes null and undefined?" },
    ],
    concept: "Exclude / Extract / NonNullable",
  },

  {
    id: "15-cp-awaited-returntype",
    title: "Extracting Async Function Types",
    description: "Extract the 'true' return type of an async function.",
    template: `async function fetchUser(id: number) {
  return { id, name: "Max", email: "max@test.com" };
}

// Promise type:
type AsyncResult = ______<______ fetchUser>;
// ^ Promise<{ id: number; name: string; email: string }>

// Unwrapped type:
type User = ______<AsyncResult>;
// ^ { id: number; name: string; email: string }`,
    solution: `async function fetchUser(id: number) {
  return { id, name: "Max", email: "max@test.com" };
}

type AsyncResult = ReturnType<typeof fetchUser>;
type User = Awaited<AsyncResult>;`,
    blanks: [
      { placeholder: "______", answer: "ReturnType", hint: "Which Utility Type extracts the return type?" },
      { placeholder: "______", answer: "typeof", hint: "Which keyword extracts the type of a value?" },
      { placeholder: "______", answer: "Awaited", hint: "Which Utility Type unwraps Promises?" },
    ],
    concept: "ReturnType / typeof / Awaited",
  },

  {
    id: "15-cp-composition",
    title: "PartialExcept Composition",
    description: "Combine Pick and Partial for an update pattern.",
    template: `interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  published: boolean;
}

// id remains required, everything else optional:
type ArticleUpdate = ______<Article, "id"> & ______<______<Article, "id">>;

function update(data: ArticleUpdate): void {
  console.log(\`Updating article \${data.______}\`);
}

update({ id: 1, title: "New Title" }); // OK
update({ id: 2 });                     // OK — only id`,
    solution: `interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  published: boolean;
}

type ArticleUpdate = Pick<Article, "id"> & Partial<Omit<Article, "id">>;

function update(data: ArticleUpdate): void {
  console.log(\`Updating article \${data.id}\`);
}

update({ id: 1, title: "New Title" });
update({ id: 2 });`,
    blanks: [
      { placeholder: "______", answer: "Pick", hint: "Which Utility Type selects id?" },
      { placeholder: "______", answer: "Partial", hint: "Which Utility Type makes the rest optional?" },
      { placeholder: "______", answer: "Omit", hint: "Which Utility Type removes id from the rest?" },
      { placeholder: "______", answer: "id", hint: "Which field is being accessed?" },
    ],
    concept: "Pick + Partial + Omit Composition",
  },
];