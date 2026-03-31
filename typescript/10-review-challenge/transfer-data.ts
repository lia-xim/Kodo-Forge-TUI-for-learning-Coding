/**
 * Lektion 10 — Transfer Tasks: Review Challenge
 *
 * 2 Integrations-Aufgaben die ALLE Phase-1-Konzepte in einem realen Szenario kombinieren.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "10-fullstack-todo-app",
    title: "Typsicheres Todo-System — von der API bis zum UI",
    prerequisiteLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    scenario:
      "Du baust ein Todo-System. Aktuell ist alles 'any' und " +
      "jeder Sprint bringt neue Bugs: Falsche Status-Werte, fehlende " +
      "Properties, inkompatible API-Responses. Dein Team hat beschlossen, " +
      "das System von Grund auf typsicher zu machen.",
    task:
      "Erstelle ein vollstaendiges typsicheres Todo-System:\n\n" +
      "1. **Datenmodell** (L05/L08): Interface-Hierarchie fuer Todo, " +
      "   mit Status als Discriminated Union (L07)\n" +
      "2. **API-Layer** (L06/L07): Result<T> fuer Responses, " +
      "   Type Guards fuer Validierung\n" +
      "3. **State Management** (L07/L09): Reducer mit Discriminated " +
      "   Union Actions und Exhaustive Check\n" +
      "4. **Konfiguration** (L09): as const fuer Status-Werte und " +
      "   Template Literal Types fuer Event-Namen",
    starterCode: [
      "// TODO: Status-Konstanten (as const)",
      "// TODO: Todo-Interface",
      "// TODO: API Result-Type",
      "// TODO: Reducer mit Actions",
      "// TODO: Type Guards",
    ].join("\n"),
    solutionCode: [
      "// ═══ 1. Konfiguration (L09) ═══",
      "const TodoStatus = {",
      "  Pending: 'PENDING',",
      "  InProgress: 'IN_PROGRESS',",
      "  Done: 'DONE',",
      "  Cancelled: 'CANCELLED',",
      "} as const;",
      "type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];",
      "",
      "// ═══ 2. Datenmodell (L05/L08) ═══",
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
      "// ═══ 5. Event-Namen (L09) ═══",
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
      "Beginne mit den Status-Konstanten als as const Object. " +
        "Daraus leitest du den Status-Typ ab.",
      "Die Todo-Interface-Hierarchie nutzt extends. " +
        "Actions als Discriminated Union mit type als Tag.",
      "Der Reducer braucht einen Exhaustive Check im default-Case. " +
        "Template Literal Types fuer Event-Namen.",
    ],
    difficulty: 4,
  },

  {
    id: "10-type-safe-form",
    title: "Typsichere Formular-Validierung",
    prerequisiteLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    scenario:
      "Dein Formular-System validiert Eingaben mit ad-hoc Strings " +
      "und any-Typen. Fehlermeldungen sind unstrukturiert, " +
      "und man weiss nie ob ein Feld validiert wurde oder nicht.",
    task:
      "Erstelle ein typsicheres Validierungssystem:\n\n" +
      "1. **Validierungsregeln** als Type-Map (L08/L09)\n" +
      "2. **Validation Result** als Discriminated Union (L07)\n" +
      "3. **Generische validate-Funktion** (L06)\n" +
      "4. **Feld-Validierung** mit Branded Types fuer validierte Werte (L09)",
    starterCode: [
      "// TODO: ValidationResult mit Discriminated Union",
      "// TODO: Validator<T> Typ",
      "// TODO: validate-Funktion",
      "// TODO: Branded Type fuer validierte Werte",
    ].join("\n"),
    solutionCode: [
      "// ═══ 1. Validation Result (L07) ═══",
      "type ValidationResult<T> =",
      "  | { valid: true; value: T }",
      "  | { valid: false; errors: string[] };",
      "",
      "// ═══ 2. Validator-Typ (L06) ═══",
      "type Validator<T> = (input: unknown) => ValidationResult<T>;",
      "",
      "// ═══ 3. Branded Types fuer validierte Werte (L09) ═══",
      "type ValidEmail = string & { __brand: 'ValidEmail' };",
      "type ValidAge = number & { __brand: 'ValidAge' };",
      "",
      "// ═══ 4. Konkrete Validatoren ═══",
      "const validateEmail: Validator<ValidEmail> = (input) => {",
      "  if (typeof input !== 'string') return { valid: false, errors: ['Muss ein String sein'] };",
      "  if (!input.includes('@')) return { valid: false, errors: ['Muss @ enthalten'] };",
      "  return { valid: true, value: input as ValidEmail };",
      "};",
      "",
      "const validateAge: Validator<ValidAge> = (input) => {",
      "  if (typeof input !== 'number') return { valid: false, errors: ['Muss eine Zahl sein'] };",
      "  if (input < 0 || input > 150) return { valid: false, errors: ['Muss zwischen 0 und 150 sein'] };",
      "  return { valid: true, value: input as ValidAge };",
      "};",
      "",
      "// ═══ 5. Generische validate-Funktion (L06) ═══",
      "function validate<T>(input: unknown, validator: Validator<T>): T {",
      "  const result = validator(input);",
      "  if (!result.valid) {",
      "    throw new Error(`Validierung fehlgeschlagen: ${result.errors.join(', ')}`);",
      "  }",
      "  return result.value;",
      "}",
      "",
      "// Verwendung:",
      "const email = validate('max@test.de', validateEmail);",
      "// email hat Typ: ValidEmail — garantiert validiert!",
      "",
      "const age = validate(30, validateAge);",
      "// age hat Typ: ValidAge — garantiert im gueltigen Bereich!",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union fuer ValidationResult (L07)",
      "Generische Callback-Typen (L06)",
      "Branded Types fuer validierte Werte (L09)",
      "Type Guards / Narrowing (L06/L07)",
      "unknown als sicherer Input-Typ (L02)",
    ],
    hints: [
      "ValidationResult ist eine Discriminated Union mit valid als Tag.",
      "Validator<T> ist ein Callback-Typ: (input: unknown) => ValidationResult<T>.",
      "Branded Types (ValidEmail, ValidAge) garantieren dass Werte validiert wurden.",
    ],
    difficulty: 4,
  },
];
