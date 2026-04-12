/**
 * Lesson 11 -- Transfer Tasks: Type Narrowing
 *
 * These tasks take the concepts from the Narrowing lesson and apply
 * them in completely new contexts:
 *
 *  1. API Response Handler (typeof, in, Discriminated Union)
 *  2. Form Validation (Type Guards, Assertion Functions)
 *  3. Redux-Style Action Handler (Exhaustive Checks, never)
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: API-Response-Handler ──────────────────────────────────────
  {
    id: "11-api-response-handler",
    title: "Type-Safe API Response Handler",
    prerequisiteLessons: [11],
    scenario:
      "You are working on an app that calls various API endpoints. " +
      "Each endpoint can respond successfully (with data), " +
      "report an error (with an error message), or signal a redirect " +
      "(with a URL). Currently the code uses 'any' for " +
      "the response and crashes regularly because properties are " +
      "accessed that don't exist for errors.",
    task:
      "Model the API response as a Discriminated Union and " +
      "write a type-safe handler.\n\n" +
      "1. Define a Discriminated Union with three variants:\n" +
      "   - SuccessResponse: { status: 'success', data: T, timestamp: number }\n" +
      "   - ErrorResponse: { status: 'error', code: number, message: string }\n" +
      "   - RedirectResponse: { status: 'redirect', url: string }\n" +
      "2. Write a handler function that handles all three cases\n" +
      "3. Use assertNever for the Exhaustive Check\n" +
      "4. Write a Type Guard that validates unknown data as SuccessResponse\n" +
      "5. Bonus: Use Generics for the data type (T)",
    starterCode: [
      "// Define the Discriminated Union",
      "type ApiResponse<T> = ???;",
      "",
      "function handleResponse<T>(response: ApiResponse<T>): string {",
      "  // TODO: Handle all three cases",
      "}",
      "",
      "function isSuccessResponse(data: unknown): data is ??? {",
      "  // TODO: Validate the data",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Discriminated Union ═══",
      "interface SuccessResponse<T> {",
      "  status: 'success';",
      "  data: T;",
      "  timestamp: number;",
      "}",
      "",
      "interface ErrorResponse {",
      "  status: 'error';",
      "  code: number;",
      "  message: string;",
      "}",
      "",
      "interface RedirectResponse {",
      "  status: 'redirect';",
      "  url: string;",
      "}",
      "",
      "type ApiResponse<T> = SuccessResponse<T> | ErrorResponse | RedirectResponse;",
      "",
      "function assertNever(value: never): never {",
      "  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);",
      "}",
      "",
      "// ═══ Handler with Exhaustive Check ═══",
      "function handleResponse<T>(response: ApiResponse<T>): string {",
      "  switch (response.status) {",
      "    case 'success':",
      "      return `Success: ${JSON.stringify(response.data)} (${new Date(response.timestamp).toISOString()})`;",
      "    case 'error':",
      "      return `Error ${response.code}: ${response.message}`;",
      "    case 'redirect':",
      "      return `Redirect to: ${response.url}`;",
      "    default:",
      "      return assertNever(response);",
      "  }",
      "}",
      "",
      "// ═══ Type Guard for unknown Data ═══",
      "function isSuccessResponse(data: unknown): data is SuccessResponse<unknown> {",
      "  if (typeof data !== 'object' || data === null) return false;",
      "  const obj = data as Record<string, unknown>;",
      "  return (",
      "    obj.status === 'success' &&",
      "    'data' in obj &&",
      "    typeof obj.timestamp === 'number'",
      "  );",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Unions",
      "Exhaustive Checks",
      "Type Guards",
      "Generics (Preview)",
    ],
    hints: [
      "Define three interfaces with a common 'status' property and different literal values ('success', 'error', 'redirect').",
      "In the switch on response.status, TypeScript automatically narrows the entire response type. In the 'success' case you have access to 'data'.",
      "assertNever in the default ensures that a new response type immediately causes a compile error.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: Form Validation ─────────────────────────────────────
  {
    id: "11-form-validation",
    title: "Type-Safe Form Validation with Type Guards",
    prerequisiteLessons: [11],
    scenario:
      "You are building a registration form for an Angular app. " +
      "The inputs arrive as unknown from a JSON body (e.g. from " +
      "a REST API). You need to validate the data before passing it " +
      "to the service. The existing code uses " +
      "'as User' without checking — this caused a crash last week " +
      "because the mobile app sends a different format.",
    task:
      "Build type-safe validation with Type Guards and Assertion Functions.\n\n" +
      "1. Define the expected data structure (User interface)\n" +
      "2. Write a Type Guard 'isValidRegistration' that checks unknown data\n" +
      "3. Write an Assertion Function 'assertValidRegistration' that throws " +
      "   a detailed error for invalid data\n" +
      "4. Show both variants: if-check and Assertion\n" +
      "5. Use TS 5.5 filter() to filter invalid entries from an array",
    starterCode: [
      "interface Registration {",
      "  username: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "function isValidRegistration(data: unknown): data is Registration {",
      "  // TODO",
      "}",
      "",
      "function assertValidRegistration(data: unknown): asserts data is Registration {",
      "  // TODO",
      "}",
    ].join("\n"),
    solutionCode: [
      "interface Registration {",
      "  username: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "// ═══ Type Guard (for if-Checks) ═══",
      "function isValidRegistration(data: unknown): data is Registration {",
      "  if (typeof data !== 'object' || data === null) return false;",
      "  const obj = data as Record<string, unknown>;",
      "  return (",
      "    typeof obj.username === 'string' && obj.username.length >= 3 &&",
      "    typeof obj.email === 'string' && obj.email.includes('@') &&",
      "    typeof obj.age === 'number' && obj.age >= 16 && obj.age <= 120",
      "  );",
      "}",
      "",
      "// ═══ Assertion Function (for Preconditions) ═══",
      "function assertValidRegistration(data: unknown): asserts data is Registration {",
      "  if (typeof data !== 'object' || data === null) {",
      "    throw new Error('Data must be an object');",
      "  }",
      "  const obj = data as Record<string, unknown>;",
      "  if (typeof obj.username !== 'string' || obj.username.length < 3) {",
      "    throw new Error('Username must have at least 3 characters');",
      "  }",
      "  if (typeof obj.email !== 'string' || !obj.email.includes('@')) {",
      "    throw new Error('Email must contain an @ character');",
      "  }",
      "  if (typeof obj.age !== 'number' || obj.age < 16 || obj.age > 120) {",
      "    throw new Error('Age must be between 16 and 120');",
      "  }",
      "}",
      "",
      "// ═══ TS 5.5: filter with Automatic Narrowing ═══",
      "const rawEntries: unknown[] = [",
      "  { username: 'Max', email: 'max@test.de', age: 25 },",
      "  { username: 'AB', email: 'no-at', age: 10 },",
      "  null,",
      "  { username: 'Anna', email: 'anna@web.de', age: 30 },",
      "];",
      "",
      "// Keep only valid registrations:",
      "const valid = rawEntries.filter(isValidRegistration);",
      "// Type: Registration[]",
      "// valid = [{ username: 'Max', ... }, { username: 'Anna', ... }]",
    ].join("\n"),
    conceptsBridged: [
      "Type Guards (is)",
      "Assertion Functions (asserts)",
      "TS 5.5 Inferred Type Predicates",
      "unknown Validation",
    ],
    hints: [
      "A Type Guard (is) returns boolean and is used in if conditions. An Assertion Function (asserts) throws on error and narrows the entire scope.",
      "First check if data is an object (typeof === 'object' && !== null), then check each property individually with typeof.",
      "The advantage of the Assertion Function: it provides detailed error messages. The Type Guard only says 'invalid' without details.",
    ],
    difficulty: 3,
  },

  // ─── Task 3: Redux-Style Action Handler ───────────────────────────────
  {
    id: "11-redux-actions",
    title: "Redux-Style Action Handler with Exhaustive Checks",
    prerequisiteLessons: [11],
    scenario:
      "You are working on a React app with Redux-like " +
      "state management. Actions are modeled as a Discriminated Union. " +
      "The team has complained that new Actions are " +
      "added but the reducer forgets to handle them. " +
      "This leads to silent errors — the state does not change.",
    task:
      "Model a type-safe action reducer with Exhaustive Checks.\n\n" +
      "1. Define Actions as a Discriminated Union (type property as Discriminant)\n" +
      "2. Define the State type\n" +
      "3. Write a Reducer with exhaustive switch + assertNever\n" +
      "4. Show what happens when a new Action is added\n" +
      "5. Use readonly and as const for type-safe Action Creators",
    starterCode: [
      "// State",
      "interface AppState {",
      "  items: string[];",
      "  loading: boolean;",
      "  error: string | null;",
      "}",
      "",
      "// Actions as Discriminated Union:",
      "type AppAction = ???;",
      "",
      "// Reducer:",
      "function reducer(state: AppState, action: AppAction): AppState {",
      "  // TODO: Exhaustive switch",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ State ═══",
      "interface AppState {",
      "  items: string[];",
      "  loading: boolean;",
      "  error: string | null;",
      "}",
      "",
      "// ═══ Actions as Discriminated Union ═══",
      "type AppAction =",
      "  | { type: 'LOAD_START' }",
      "  | { type: 'LOAD_SUCCESS'; items: string[] }",
      "  | { type: 'LOAD_ERROR'; error: string }",
      "  | { type: 'ADD_ITEM'; item: string }",
      "  | { type: 'REMOVE_ITEM'; index: number };",
      "",
      "function assertNever(value: never): never {",
      "  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);",
      "}",
      "",
      "// ═══ Reducer with Exhaustive Check ═══",
      "function reducer(state: AppState, action: AppAction): AppState {",
      "  switch (action.type) {",
      "    case 'LOAD_START':",
      "      return { ...state, loading: true, error: null };",
      "    case 'LOAD_SUCCESS':",
      "      return { ...state, loading: false, items: action.items };",
      "    case 'LOAD_ERROR':",
      "      return { ...state, loading: false, error: action.error };",
      "    case 'ADD_ITEM':",
      "      return { ...state, items: [...state.items, action.item] };",
      "    case 'REMOVE_ITEM':",
      "      return {",
      "        ...state,",
      "        items: state.items.filter((_, i) => i !== action.index),",
      "      };",
      "    default:",
      "      return assertNever(action);",
      "      // If someone adds 'CLEAR_ALL' as an Action but doesn't add a",
      "      // case, TypeScript reports:",
      "      // Type '{ type: \"CLEAR_ALL\" }' is not assignable to type 'never'",
      "  }",
      "}",
      "",
      "// ═══ Type-Safe Action Creators ═══",
      "const loadStart = () => ({ type: 'LOAD_START' as const });",
      "const loadSuccess = (items: string[]) => ({ type: 'LOAD_SUCCESS' as const, items });",
      "const addItem = (item: string) => ({ type: 'ADD_ITEM' as const, item });",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Unions",
      "Exhaustive Checks / assertNever",
      "Immutable State Updates",
      "as const for Action Creators",
      "React/Redux Patterns",
    ],
    hints: [
      "Each Action has a 'type' property with a literal value (e.g. 'LOAD_START'). TypeScript automatically narrows to the correct Action in the switch.",
      "assertNever in the default ensures the reducer never 'forgets' an Action. A new Action immediately causes a compile error.",
      "as const with Action Creators ensures that type is inferred as a Literal type, not as string.",
    ],
    difficulty: 4,
  },
];