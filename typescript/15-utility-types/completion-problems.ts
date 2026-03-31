/**
 * Lektion 15 — Completion Problems: Utility Types
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
    title: "Update-Funktion mit Partial",
    description: "Erstelle eine typsichere Update-Funktion die nur geaenderte Felder akzeptiert.",
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
      { placeholder: "______", answer: "Partial", hint: "Welcher Utility Type macht alle Properties optional?" },
      { placeholder: "______", answer: "changes", hint: "Welche Variable enthaelt die Aenderungen?" },
      { placeholder: "______", answer: "email", hint: "Welches Feld wird geaendert?" },
    ],
    concept: "Partial / Update-Pattern",
  },

  {
    id: "15-cp-pick-omit",
    title: "Pick und Omit fuer API-Typen",
    description: "Erstelle typsichere API-Input/Output-Typen aus einem Basis-Interface.",
    template: `interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
}

// API Response — alles ausser nichts (vollstaendig)
type ProductResponse = Product;

// Create Input — ohne Server-generierte Felder
type CreateInput = ______<Product, "id" | "______">;

// Public Info — nur id und name
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
      { placeholder: "______", answer: "Omit", hint: "Welcher Utility Type ENTFERNT Properties?" },
      { placeholder: "______", answer: "createdAt", hint: "Welches Feld wird vom Server gesetzt?" },
      { placeholder: "______", answer: "Pick", hint: "Welcher Utility Type WAEHLT Properties aus?" },
    ],
    concept: "Pick / Omit / API-Typen",
  },

  {
    id: "15-cp-record-lookup",
    title: "Record als Lookup-Table",
    description: "Erstelle eine typsichere Konfiguration mit Record.",
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
      { placeholder: "______", answer: "Record", hint: "Welcher Utility Type erstellt ein Dictionary?" },
      { placeholder: "______", answer: "Theme", hint: "Welcher Typ definiert die erlaubten Keys?" },
      { placeholder: "______", answer: "system", hint: "Welches Theme fehlt noch?" },
      { placeholder: "______", answer: "name", hint: "Mit welchem Parameter wird auf themes zugegriffen?" },
    ],
    concept: "Record / Lookup-Table",
  },

  {
    id: "15-cp-exclude-extract",
    title: "Union-Filterung mit Exclude und Extract",
    description: "Filtere Union-Types mit Extract und Exclude.",
    template: `type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Schreibende Methoden (alles ausser GET):
type WriteMethods = ______<HttpMethod, "GET">;

// Nur Update-Methoden:
type UpdateMethods = ______<HttpMethod, "PUT" | "PATCH">;

type MaybeString = string | null | undefined;
// Garantiert string:
type DefiniteString = ______<MaybeString>;`,
    solution: `type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type WriteMethods = Exclude<HttpMethod, "GET">;
type UpdateMethods = Extract<HttpMethod, "PUT" | "PATCH">;

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;`,
    blanks: [
      { placeholder: "______", answer: "Exclude", hint: "Welcher Utility Type ENTFERNT Mitglieder aus einem Union?" },
      { placeholder: "______", answer: "Extract", hint: "Welcher Utility Type BEHAELT passende Mitglieder?" },
      { placeholder: "______", answer: "NonNullable", hint: "Welcher Utility Type entfernt null und undefined?" },
    ],
    concept: "Exclude / Extract / NonNullable",
  },

  {
    id: "15-cp-awaited-returntype",
    title: "Async-Funktions-Typ extrahieren",
    description: "Extrahiere den 'wahren' Rueckgabetyp einer async Funktion.",
    template: `async function fetchUser(id: number) {
  return { id, name: "Max", email: "max@test.com" };
}

// Promise-Typ:
type AsyncResult = ______<______ fetchUser>;
// ^ Promise<{ id: number; name: string; email: string }>

// Unwrapped Typ:
type User = ______<AsyncResult>;
// ^ { id: number; name: string; email: string }`,
    solution: `async function fetchUser(id: number) {
  return { id, name: "Max", email: "max@test.com" };
}

type AsyncResult = ReturnType<typeof fetchUser>;
type User = Awaited<AsyncResult>;`,
    blanks: [
      { placeholder: "______", answer: "ReturnType", hint: "Welcher Utility Type extrahiert den Rueckgabetyp?" },
      { placeholder: "______", answer: "typeof", hint: "Welches Keyword extrahiert den Typ eines Wertes?" },
      { placeholder: "______", answer: "Awaited", hint: "Welcher Utility Type entpackt Promises?" },
    ],
    concept: "ReturnType / typeof / Awaited",
  },

  {
    id: "15-cp-composition",
    title: "PartialExcept Composition",
    description: "Kombiniere Pick und Partial fuer ein Update-Pattern.",
    template: `interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  published: boolean;
}

// id bleibt required, alles andere optional:
type ArticleUpdate = ______<Article, "id"> & ______<______<Article, "id">>;

function update(data: ArticleUpdate): void {
  console.log(\`Updating article \${data.______}\`);
}

update({ id: 1, title: "New Title" }); // OK
update({ id: 2 });                     // OK — nur id`,
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
      { placeholder: "______", answer: "Pick", hint: "Welcher Utility Type waehlt id aus?" },
      { placeholder: "______", answer: "Partial", hint: "Welcher Utility Type macht den Rest optional?" },
      { placeholder: "______", answer: "Omit", hint: "Welcher Utility Type entfernt id vom Rest?" },
      { placeholder: "______", answer: "id", hint: "Auf welches Feld wird zugegriffen?" },
    ],
    concept: "Pick + Partial + Omit Composition",
  },
];
