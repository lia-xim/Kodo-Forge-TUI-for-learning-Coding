/**
 * Lesson 15 — Transfer Tasks: Utility Types
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "15-api-layer-types",
    title: "API Layer with Derived Types",
    prerequisiteLessons: [15],
    scenario:
      "You are building a REST API for a Todo app. Currently every " +
      "endpoint has its own manually defined input/output type. " +
      "When the Todo model changes, you have to update 5 places — " +
      "and regularly forget one.",
    task:
      "Create a type-safe API layer:\n\n" +
      "1. Define a central Todo interface with all fields\n" +
      "2. Derive CreateTodoInput with Omit (without id, createdAt, updatedAt)\n" +
      "3. Derive UpdateTodoInput with PartialExcept (id required, rest optional)\n" +
      "4. Derive TodoPreview with Pick (only id, title, completed)\n" +
      "5. Create a type-safe error map with Record<keyof Todo, string>",
    starterCode: [
      "// TODO: Todo interface (id, title, description, completed, priority, createdAt, updatedAt)",
      "// TODO: CreateTodoInput = Omit<Todo, server-generated fields>",
      "// TODO: UpdateTodoInput = id required, rest optional",
      "// TODO: TodoPreview = only the most important fields",
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
      "// Create: Without server-generated fields",
      "type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;",
      "",
      "// Update: id required, rest optional",
      "type UpdateTodoInput = Pick<Todo, 'id'> & Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;",
      "",
      "// Preview: Only the most important fields, readonly",
      "type TodoPreview = Readonly<Pick<Todo, 'id' | 'title' | 'completed'>>;",
      "",
      "// Validation: An optional error for each field",
      "type ValidationErrors = Partial<Record<keyof Todo, string>>;",
      "",
      "// Usage:",
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
      "Omit for create input (omitting server-generated fields)",
      "Pick + Partial + Omit for update input (id required, rest optional)",
      "Readonly + Pick for view models",
      "Record + Partial for type-safe error maps",
    ],
    hints: [
      "First identify the server-generated fields (id, createdAt, updatedAt).",
      "For UpdateTodoInput: Pick<Todo, 'id'> & Partial<Omit<Todo, 'id' | ...>>",
      "Partial<Record<keyof Todo, string>> allows an optional error string for each field.",
    ],
    difficulty: 3,
  },

  {
    id: "15-form-state-management",
    title: "Type-Safe Form State Management",
    prerequisiteLessons: [15],
    scenario:
      "Your React/Angular project has a complex registration form. " +
      "Currently the form state types are defined manually — " +
      "every change to the form requires updates in 4 places: " +
      "Values, Errors, Touched, and Validation.",
    task:
      "Create a generic form type system:\n\n" +
      "1. A generic FormState<T> that uses T as Partial\n" +
      "2. FormErrors<T> with Record<keyof T, string> (Partial)\n" +
      "3. TouchedFields<T> with Record<keyof T, boolean> (Partial)\n" +
      "4. FormStore<T> that combines everything\n" +
      "5. A createFormStore<T> function\n" +
      "6. A setField<T> function with correct type constraints",
    starterCode: [
      "// TODO: Generic form types",
      "// TODO: FormStore<T> Interface",
      "// TODO: createFormStore<T> function",
      "// TODO: setField<T, K> function",
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
      "// Usage:",
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
      "// setField(store, 'username', 42); // Error! username is a string",
      "// setField(store, 'nonexistent', 'x'); // Error! not in RegistrationForm",
    ].join("\n"),
    conceptsBridged: [
      "Generic utility types for reusable patterns",
      "Partial<T> for incrementally filled forms",
      "Record<keyof T, V> for type-safe maps over all fields",
      "keyof T constraints for type-safe field names",
    ],
    hints: [
      "FormState<T> = Partial<T> — fields are filled in incrementally.",
      "FormErrors<T> = Partial<Record<keyof T, string>> — not every field has an error.",
      "setField requires K extends keyof T so that only existing fields can be set.",
    ],
    difficulty: 4,
  },

  {
    id: "15-deep-config-system",
    title: "Deep Configuration System with Custom Utility Types",
    prerequisiteLessons: [15],
    scenario:
      "Your project has a multi-level configuration system: " +
      "Default Config + Environment Config + User Config. " +
      "Each level overrides parts of the previous one. " +
      "Problem: Partial<Config> is only shallow — nested " +
      "configurations must be fully specified.",
    task:
      "Create a type-safe deep config merge system:\n\n" +
      "1. DeepPartial<T> for nested optional overrides\n" +
      "2. DeepRequired<T> for the final, complete configuration\n" +
      "3. DeepReadonly<T> for the frozen configuration\n" +
      "4. A deepMerge function that merges Default + Overrides\n" +
      "5. Show how nested partial updates work",
    starterCode: [
      "// TODO: DeepPartial<T>",
      "// TODO: DeepRequired<T>",
      "// TODO: DeepReadonly<T>",
      "// TODO: Config interface (nested)",
      "// TODO: deepMerge function",
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
      "// Only override the parts that change:",
      "const prodConfig = deepMerge(defaults, {",
      "  server: { port: 443, ssl: true },",
      "  logging: { level: 'warn' },",
      "});",
      "",
      "// Freeze the final config:",
      "type FinalConfig = DeepReadonly<AppConfig>;",
    ].join("\n"),
    conceptsBridged: [
      "DeepPartial for nested optional overrides",
      "DeepRequired for guaranteed complete configurations",
      "DeepReadonly for frozen final configurations",
      "Recursive type definitions with Array/Object/Primitive case distinction",
    ],
    hints: [
      "DeepPartial requires three cases: Array (infer U), Object (recursion), Primitive (T).",
      "DeepRequired uses -? instead of ? — the rest is identical to DeepPartial.",
      "deepMerge must recursively merge nested objects.",
    ],
    difficulty: 5,
  },
];