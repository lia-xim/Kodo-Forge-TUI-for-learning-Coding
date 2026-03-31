/**
 * Lektion 15 — Transfer Tasks: Utility Types
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "15-api-layer-types",
    title: "API-Layer mit abgeleiteten Typen",
    prerequisiteLessons: [15],
    scenario:
      "Du baust eine REST-API fuer eine Todo-App. Bisher hat jeder " +
      "Endpoint seinen eigenen manuell definierten Input/Output-Typ. " +
      "Wenn sich das Todo-Model aendert, muss man an 5 Stellen updaten — " +
      "und vergisst regelmaessig eine.",
    task:
      "Erstelle ein typsicheres API-Layer:\n\n" +
      "1. Definiere ein zentrales Todo-Interface mit allen Feldern\n" +
      "2. Leite CreateTodoInput mit Omit ab (ohne id, createdAt, updatedAt)\n" +
      "3. Leite UpdateTodoInput mit PartialExcept ab (id required, Rest optional)\n" +
      "4. Leite TodoPreview mit Pick ab (nur id, title, completed)\n" +
      "5. Erstelle eine typsichere Error-Map mit Record<keyof Todo, string>",
    starterCode: [
      "// TODO: Todo-Interface (id, title, description, completed, priority, createdAt, updatedAt)",
      "// TODO: CreateTodoInput = Omit<Todo, server-generierte Felder>",
      "// TODO: UpdateTodoInput = id required, Rest optional",
      "// TODO: TodoPreview = nur die wichtigsten Felder",
      "// TODO: ValidationErrors = Record<keyof Todo, string> (optional)",
    ].join("\n"),
    solutionCode: [
      "interface Todo {",
      "  id: number;",
      "  title: string;",
      "  description: string;",
      "  completed: boolean;",
      "  priority: 'low' | 'medium' | 'high';",
      "  createdAt: Date;",
      "  updatedAt: Date;",
      "}",
      "",
      "// Create: Ohne Server-generierte Felder",
      "type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;",
      "",
      "// Update: id required, Rest optional",
      "type UpdateTodoInput = Pick<Todo, 'id'> & Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;",
      "",
      "// Preview: Nur die wichtigsten Felder, readonly",
      "type TodoPreview = Readonly<Pick<Todo, 'id' | 'title' | 'completed'>>;",
      "",
      "// Validation: Fuer jedes Feld ein optionaler Fehler",
      "type ValidationErrors = Partial<Record<keyof Todo, string>>;",
      "",
      "// Verwendung:",
      "function createTodo(input: CreateTodoInput): Todo {",
      "  return {",
      "    ...input,",
      "    id: Math.random(),",
      "    createdAt: new Date(),",
      "    updatedAt: new Date(),",
      "  };",
      "}",
      "",
      "function updateTodo(input: UpdateTodoInput): void {",
      "  console.log(`Updating todo ${input.id}`);",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Omit fuer Create-Input (Server-generierte Felder weglassen)",
      "Pick + Partial + Omit fuer Update-Input (id required, Rest optional)",
      "Readonly + Pick fuer View-Models",
      "Record + Partial fuer typsichere Error-Maps",
    ],
    hints: [
      "Identifiziere zuerst die Server-generierten Felder (id, createdAt, updatedAt).",
      "Fuer UpdateTodoInput: Pick<Todo, 'id'> & Partial<Omit<Todo, 'id' | ...>>",
      "Partial<Record<keyof Todo, string>> erlaubt fuer jedes Feld einen optionalen Fehler-String.",
    ],
    difficulty: 3,
  },

  {
    id: "15-form-state-management",
    title: "Typsicheres Form-State-Management",
    prerequisiteLessons: [15],
    scenario:
      "Dein React/Angular-Projekt hat ein komplexes Registrierungsformular. " +
      "Bisher sind die Form-State-Typen manuell definiert — " +
      "jede Aenderung am Formular erfordert Updates an 4 Stellen: " +
      "Values, Errors, Touched und Validation.",
    task:
      "Erstelle ein generisches Form-Type-System:\n\n" +
      "1. Ein generisches FormState<T> das T als Partial verwendet\n" +
      "2. FormErrors<T> mit Record<keyof T, string> (Partial)\n" +
      "3. TouchedFields<T> mit Record<keyof T, boolean> (Partial)\n" +
      "4. FormStore<T> der alles kombiniert\n" +
      "5. Eine createFormStore<T>-Funktion\n" +
      "6. Eine setField<T>-Funktion mit korrekten Typ-Constraints",
    starterCode: [
      "// TODO: Generische Form-Typen",
      "// TODO: FormStore<T> Interface",
      "// TODO: createFormStore<T> Funktion",
      "// TODO: setField<T, K> Funktion",
    ].join("\n"),
    solutionCode: [
      "type FormState<T> = Partial<T>;",
      "type FormErrors<T> = Partial<Record<keyof T, string>>;",
      "type TouchedFields<T> = Partial<Record<keyof T, boolean>>;",
      "",
      "interface FormStore<T> {",
      "  values: FormState<T>;",
      "  errors: FormErrors<T>;",
      "  touched: TouchedFields<T>;",
      "  isValid: boolean;",
      "  isDirty: boolean;",
      "}",
      "",
      "function createFormStore<T>(): FormStore<T> {",
      "  return { values: {}, errors: {}, touched: {}, isValid: false, isDirty: false };",
      "}",
      "",
      "function setField<T, K extends keyof T>(",
      "  store: FormStore<T>,",
      "  field: K,",
      "  value: T[K],",
      "): FormStore<T> {",
      "  return {",
      "    ...store,",
      "    values: { ...store.values, [field]: value },",
      "    touched: { ...store.touched, [field]: true },",
      "    isDirty: true,",
      "  };",
      "}",
      "",
      "// Verwendung:",
      "interface RegistrationForm {",
      "  username: string;",
      "  email: string;",
      "  password: string;",
      "  age: number;",
      "}",
      "",
      "let store = createFormStore<RegistrationForm>();",
      "store = setField(store, 'username', 'MaxDev');",
      "store = setField(store, 'email', 'max@dev.com');",
      "// setField(store, 'username', 42); // Error! username ist string",
      "// setField(store, 'nonexistent', 'x'); // Error! nicht in RegistrationForm",
    ].join("\n"),
    conceptsBridged: [
      "Generische Utility Types fuer wiederverwendbare Patterns",
      "Partial<T> fuer schrittweise ausgefuellte Formulare",
      "Record<keyof T, V> fuer typsichere Maps ueber alle Felder",
      "keyof T Constraints fuer typsichere Field-Namen",
    ],
    hints: [
      "FormState<T> = Partial<T> — Felder werden schrittweise ausgefuellt.",
      "FormErrors<T> = Partial<Record<keyof T, string>> — nicht jedes Feld hat einen Fehler.",
      "setField braucht K extends keyof T damit nur existierende Felder gesetzt werden koennen.",
    ],
    difficulty: 4,
  },

  {
    id: "15-deep-config-system",
    title: "Deep-Configuration-System mit eigenen Utility Types",
    prerequisiteLessons: [15],
    scenario:
      "Dein Projekt hat ein mehrstufiges Konfigurationssystem: " +
      "Default-Config + Environment-Config + User-Config. " +
      "Jede Ebene ueberschreibt Teile der vorherigen. " +
      "Problem: Partial<Config> ist nur shallow — verschachtelte " +
      "Konfigurationen muessen komplett angegeben werden.",
    task:
      "Erstelle ein typsicheres Deep-Config-Merge-System:\n\n" +
      "1. DeepPartial<T> fuer verschachtelte optionale Ueberschreibungen\n" +
      "2. DeepRequired<T> fuer die finale, vollstaendige Konfiguration\n" +
      "3. DeepReadonly<T> fuer die eingefrorene Konfiguration\n" +
      "4. Eine deepMerge-Funktion die Default + Overrides merged\n" +
      "5. Zeige wie verschachtelte Teil-Updates funktionieren",
    starterCode: [
      "// TODO: DeepPartial<T>",
      "// TODO: DeepRequired<T>",
      "// TODO: DeepReadonly<T>",
      "// TODO: Config-Interface (verschachtelt)",
      "// TODO: deepMerge Funktion",
    ].join("\n"),
    solutionCode: [
      "type DeepPartial<T> = T extends (infer U)[]",
      "  ? DeepPartial<U>[]",
      "  : T extends object",
      "    ? { [P in keyof T]?: DeepPartial<T[P]> }",
      "    : T;",
      "",
      "type DeepRequired<T> = T extends (infer U)[]",
      "  ? DeepRequired<U>[]",
      "  : T extends object",
      "    ? { [P in keyof T]-?: DeepRequired<T[P]> }",
      "    : T;",
      "",
      "type DeepReadonly<T> = T extends (infer U)[]",
      "  ? readonly DeepReadonly<U>[]",
      "  : T extends object",
      "    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }",
      "    : T;",
      "",
      "interface AppConfig {",
      "  server: { host: string; port: number; ssl: boolean };",
      "  database: { host: string; port: number; name: string };",
      "  logging: { level: 'debug' | 'info' | 'warn' | 'error'; file: string };",
      "}",
      "",
      "const defaults: AppConfig = {",
      "  server: { host: 'localhost', port: 3000, ssl: false },",
      "  database: { host: 'localhost', port: 5432, name: 'mydb' },",
      "  logging: { level: 'info', file: 'app.log' },",
      "};",
      "",
      "function deepMerge<T extends Record<string, any>>(",
      "  base: T,",
      "  override: DeepPartial<T>,",
      "): T {",
      "  const result = { ...base } as T;",
      "  for (const key in override) {",
      "    const val = override[key];",
      "    if (val && typeof val === 'object' && !Array.isArray(val)) {",
      "      (result as any)[key] = deepMerge((base as any)[key], val as any);",
      "    } else if (val !== undefined) {",
      "      (result as any)[key] = val;",
      "    }",
      "  }",
      "  return result;",
      "}",
      "",
      "// Nur die Teile ueberschreiben die sich aendern:",
      "const prodConfig = deepMerge(defaults, {",
      "  server: { port: 443, ssl: true },",
      "  logging: { level: 'warn' },",
      "});",
      "",
      "// Finale Config einfrieren:",
      "type FinalConfig = DeepReadonly<AppConfig>;",
    ].join("\n"),
    conceptsBridged: [
      "DeepPartial fuer verschachtelte optionale Ueberschreibungen",
      "DeepRequired fuer garantiert vollstaendige Konfigurationen",
      "DeepReadonly fuer eingefrorene finale Konfigurationen",
      "Rekursive Typ-Definitionen mit Array/Object/Primitive-Fallunterscheidung",
    ],
    hints: [
      "DeepPartial braucht drei Faelle: Array (infer U), Object (Rekursion), Primitive (T).",
      "DeepRequired nutzt -? statt ? — der Rest ist identisch mit DeepPartial.",
      "deepMerge muss rekursiv verschachtelte Objekte zusammenfuehren.",
    ],
    difficulty: 5,
  },
];
