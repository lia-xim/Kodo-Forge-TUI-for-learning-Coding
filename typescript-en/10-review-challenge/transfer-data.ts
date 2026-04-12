/**
 * Lesson 10 — Transfer Tasks: Review Challenge
 *
 * 2 integration tasks that combine ALL Phase 1 concepts in a real-world scenario.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "10-fullstack-todo-app",
    title: "Type-Safe Todo System — From API to UI",
    prerequisiteLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    scenario:
      "You are building a todo system. Currently everything is 'any' and " +
      "every sprint brings new bugs: wrong status values, missing " +
      "properties, incompatible API responses. Your team has decided " +
      "to make the system type-safe from the ground up.",
    task:
      "Create a complete type-safe todo system:\n\n" +
      "1. **Data Model** (L05/L08): Interface hierarchy for Todo, " +
      "   with Status as Discriminated Union (L07)\n" +
      "2. **API Layer** (L06/L07): Result<T> for responses, " +
      "   Type Guards for validation\n" +
      "3. **State Management** (L07/L09): Reducer with Discriminated " +
      "   Union Actions and Exhaustive Check\n" +
      "4. **Configuration** (L09): as const for status values and " +
      "   Template Literal Types for event names",
    starterCode: [
      "// TODO: Status constants (as const)",
      "// TODO: Todo interface",
      "// TODO: API Result type",
      "// TODO: Reducer with Actions",
      "// TODO: Type Guards",
    ].join("\n"),
    solutionCode: [
      "// ═══ 1. Configuration (L09) ═══",
      "const TodoStatus = {",
      "  Pending: 'PENDING',",
      "  InProgress: 'IN_PROGRESS',",
      "  Done: 'DONE',",
      "  Cancelled: 'CANCELLED',",
      "} as const;",
      "type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];",
      "",
      "// ═══ 2. Data Model (L05/L08) ═══",
      "interface BaseEntity { id: string; createdAt: Date; }",
      "interface Todo extends BaseEntity {",
      "  title: string;",
      "  description?: string;",
      "  status: TodoStatus;",
      "  assignee?: string;",
      "}",
      "",
      "// ═══ 3. API Result (L07) ═══",
      "type Result<T> =",
      "  | { success: true; data: T }",
      "  | { success: false; error: string };",
      "",
      "function isTodo(data: unknown): data is Todo {",
      "  return typeof data === 'object' && data !== null",
      "    && 'id' in data && 'title' in data && 'status' in data;",
      "}",
      "",
      "// ═══ 4. State Management (L07) ═══",
      "type TodoAction =",
      "  | { type: 'add'; todo: Todo }",
      "  | { type: 'remove'; id: string }",
      "  | { type: 'updateStatus'; id: string; status: TodoStatus }",
      "  | { type: 'assign'; id: string; assignee: string };",
      "",
      "function todoReducer(state: Todo[], action: TodoAction): Todo[] {",
      "  switch (action.type) {",
      "    case 'add': return [...state, action.todo];",
      "    case 'remove': return state.filter(t => t.id !== action.id);",
      "    case 'updateStatus': return state.map(t =>",
      "      t.id === action.id ? { ...t, status: action.status } : t);",
      "    case 'assign': return state.map(t =>",
      "      t.id === action.id ? { ...t, assignee: action.assignee } : t);",
      "    default: const _: never = action; return _;",
      "  }",
      "}",
      "",
      "// ═══ 5. Event Names (L09) ═══",
      "type TodoEvent = `todo:${Lowercase<TodoAction['type']>}`;",
      "// 'todo:add' | 'todo:remove' | 'todo:updatestatus' | 'todo:assign'",
    ].join("\n"),
    conceptsBridged: [
      "as const Objects (L09)",
      "Interface extends (L08)",
      "Discriminated Union (L07)",
      "Type Guard (L06)",
      "Result Pattern (L07)",
      "Exhaustive Check (L07)",
      "Template Literal Types (L09)",
    ],
    hints: [
      "Start with the status constants as an as const object. " +
        "From this you derive the status type.",
      "The Todo interface hierarchy uses extends. " +
        "Actions as a Discriminated Union with type as the tag.",
      "The reducer needs an Exhaustive Check in the default case. " +
        "Template Literal Types for event names.",
    ],
    difficulty: 4,
  },

  {
    id: "10-type-safe-form",
    title: "Type-Safe Form Validation",
    prerequisiteLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    scenario:
      "Your form system validates inputs with ad-hoc strings " +
      "and any types. Error messages are unstructured, " +
      "and you never know whether a field was validated or not.",
    task:
      "Create a type-safe validation system:\n\n" +
      "1. **Validation Rules** as Type-Map (L08/L09)\n" +
      "2. **Validation Result** as Discriminated Union (L07)\n" +
      "3. **Generic validate function** (L06)\n" +
      "4. **Field Validation** with Branded Types for validated values (L09)",
    starterCode: [
      "// TODO: ValidationResult with Discriminated Union",
      "// TODO: Validator<T> type",
      "// TODO: validate function",
      "// TODO: Branded Type for validated values",
    ].join("\n"),
    solutionCode: [
      "// ═══ 1. Validation Result (L07) ═══",
      "type ValidationResult<T> =",
      "  | { valid: true; value: T }",
      "  | { valid: false; errors: string[] };",
      "",
      "// ═══ 2. Validator Type (L06) ═══",
      "type Validator<T> = (input: unknown) => ValidationResult<T>;",
      "",
      "// ═══ 3. Branded Types for validated values (L09) ═══",
      "type ValidEmail = string & { __brand: 'ValidEmail' };",
      "type ValidAge = number & { __brand: 'ValidAge' };",
      "",
      "// ═══ 4. Concrete Validators ═══",
      "const validateEmail: Validator<ValidEmail> = (input) => {",
      "  if (typeof input !== 'string') return { valid: false, errors: ['Must be a string'] };",
      "  if (!input.includes('@')) return { valid: false, errors: ['Must contain @'] };",
      "  return { valid: true, value: input as ValidEmail };",
      "};",
      "",
      "const validateAge: Validator<ValidAge> = (input) => {",
      "  if (typeof input !== 'number') return { valid: false, errors: ['Must be a number'] };",
      "  if (input < 0 || input > 150) return { valid: false, errors: ['Must be between 0 and 150'] };",
      "  return { valid: true, value: input as ValidAge };",
      "};",
      "",
      "// ═══ 5. Generic validate function (L06) ═══",
      "function validate<T>(input: unknown, validator: Validator<T>): T {",
      "  const result = validator(input);",
      "  if (!result.valid) {",
      "    throw new Error(`Validation failed: ${result.errors.join(', ')}`);",
      "  }",
      "  return result.value;",
      "}",
      "",
      "// Usage:",
      "const email = validate('max@test.de', validateEmail);",
      "// email has type: ValidEmail — guaranteed validated!",
      "",
      "const age = validate(30, validateAge);",
      "// age has type: ValidAge — guaranteed within valid range!",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union for ValidationResult (L07)",
      "Generic Callback Types (L06)",
      "Branded Types for validated values (L09)",
      "Type Guards / Narrowing (L06/L07)",
      "unknown as safe input type (L02)",
    ],
    hints: [
      "ValidationResult is a Discriminated Union with valid as the tag.",
      "Validator<T> is a callback type: (input: unknown) => ValidationResult<T>.",
      "Branded Types (ValidEmail, ValidAge) guarantee that values have been validated.",
    ],
    difficulty: 4,
  },
];