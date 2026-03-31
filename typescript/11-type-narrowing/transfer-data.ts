/**
 * Lektion 11 -- Transfer Tasks: Type Narrowing
 *
 * Diese Tasks nehmen die Konzepte aus der Narrowing-Lektion und wenden
 * sie in komplett neuen Kontexten an:
 *
 *  1. API-Response-Handler (typeof, in, Discriminated Union)
 *  2. Formular-Validierung (Type Guards, Assertion Functions)
 *  3. Redux-Style Action Handler (Exhaustive Checks, never)
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: API-Response-Handler ──────────────────────────────────────
  {
    id: "11-api-response-handler",
    title: "Typsicherer API-Response-Handler",
    prerequisiteLessons: [11],
    scenario:
      "Du arbeitest an einer App die verschiedene API-Endpoints aufruft. " +
      "Jeder Endpoint kann erfolgreich antworten (mit Daten), " +
      "einen Fehler melden (mit Fehlermeldung), oder eine Weiterleitung " +
      "signalisieren (mit URL). Aktuell verwendet der Code 'any' fuer " +
      "die Response und crasht regelmaessig, weil auf Properties " +
      "zugegriffen wird, die bei Fehlern nicht existieren.",
    task:
      "Modelliere die API-Response als Discriminated Union und " +
      "schreibe einen typsicheren Handler.\n\n" +
      "1. Definiere eine Discriminated Union mit drei Varianten:\n" +
      "   - SuccessResponse: { status: 'success', data: T, timestamp: number }\n" +
      "   - ErrorResponse: { status: 'error', code: number, message: string }\n" +
      "   - RedirectResponse: { status: 'redirect', url: string }\n" +
      "2. Schreibe eine Handler-Funktion die alle drei Faelle behandelt\n" +
      "3. Verwende assertNever fuer den Exhaustive Check\n" +
      "4. Schreibe einen Type Guard der unknown-Daten als SuccessResponse validiert\n" +
      "5. Bonus: Verwende Generics fuer den Daten-Typ (T)",
    starterCode: [
      "// Definiere die Discriminated Union",
      "type ApiResponse<T> = ???;",
      "",
      "function handleResponse<T>(response: ApiResponse<T>): string {",
      "  // TODO: Behandle alle drei Faelle",
      "}",
      "",
      "function isSuccessResponse(data: unknown): data is ??? {",
      "  // TODO: Validiere die Daten",
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
      "  throw new Error(`Unbehandelter Fall: ${JSON.stringify(value)}`);",
      "}",
      "",
      "// ═══ Handler mit Exhaustive Check ═══",
      "function handleResponse<T>(response: ApiResponse<T>): string {",
      "  switch (response.status) {",
      "    case 'success':",
      "      return `Erfolg: ${JSON.stringify(response.data)} (${new Date(response.timestamp).toISOString()})`;",
      "    case 'error':",
      "      return `Fehler ${response.code}: ${response.message}`;",
      "    case 'redirect':",
      "      return `Weiterleitung zu: ${response.url}`;",
      "    default:",
      "      return assertNever(response);",
      "  }",
      "}",
      "",
      "// ═══ Type Guard fuer unknown-Daten ═══",
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
      "Generics (Vorschau)",
    ],
    hints: [
      "Definiere drei Interfaces mit einer gemeinsamen 'status'-Property und verschiedenen Literal-Werten ('success', 'error', 'redirect').",
      "Im switch auf response.status narrowt TypeScript automatisch den gesamten Response-Typ. Im 'success'-Case hast du Zugriff auf 'data'.",
      "assertNever im default stellt sicher, dass ein neuer Response-Typ sofort einen Compile-Fehler erzeugt.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: Formular-Validierung ─────────────────────────────────────
  {
    id: "11-form-validation",
    title: "Typsichere Formular-Validierung mit Type Guards",
    prerequisiteLessons: [11],
    scenario:
      "Du baust ein Registrierungsformular fuer eine Angular-App. " +
      "Die Eingaben kommen als unknown aus einem JSON-body (z.B. von " +
      "einer REST-API). Du musst die Daten validieren, bevor du sie " +
      "an den Service weiterreichst. Der bisherige Code verwendet " +
      "'as User' ohne Pruefung — das hat letzte Woche einen Crash " +
      "verursacht, weil die Mobile-App ein anderes Format sendet.",
    task:
      "Baue eine typsichere Validierung mit Type Guards und Assertion Functions.\n\n" +
      "1. Definiere die erwartete Datenstruktur (User-Interface)\n" +
      "2. Schreibe einen Type Guard 'isValidRegistration' der unknown-Daten prueft\n" +
      "3. Schreibe eine Assertion Function 'assertValidRegistration' die bei " +
      "   unglueltigen Daten einen detaillierten Fehler wirft\n" +
      "4. Zeige beide Varianten: if-Check und Assertion\n" +
      "5. Verwende TS 5.5 filter() um ungueltige Eintraege aus einem Array zu filtern",
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
      "// ═══ Type Guard (fuer if-Checks) ═══",
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
      "// ═══ Assertion Function (fuer Vorbedingungen) ═══",
      "function assertValidRegistration(data: unknown): asserts data is Registration {",
      "  if (typeof data !== 'object' || data === null) {",
      "    throw new Error('Daten muessen ein Objekt sein');",
      "  }",
      "  const obj = data as Record<string, unknown>;",
      "  if (typeof obj.username !== 'string' || obj.username.length < 3) {",
      "    throw new Error('Username muss mindestens 3 Zeichen haben');",
      "  }",
      "  if (typeof obj.email !== 'string' || !obj.email.includes('@')) {",
      "    throw new Error('Email muss ein @-Zeichen enthalten');",
      "  }",
      "  if (typeof obj.age !== 'number' || obj.age < 16 || obj.age > 120) {",
      "    throw new Error('Alter muss zwischen 16 und 120 sein');",
      "  }",
      "}",
      "",
      "// ═══ TS 5.5: filter mit automatischem Narrowing ═══",
      "const rawEntries: unknown[] = [",
      "  { username: 'Max', email: 'max@test.de', age: 25 },",
      "  { username: 'AB', email: 'no-at', age: 10 },",
      "  null,",
      "  { username: 'Anna', email: 'anna@web.de', age: 30 },",
      "];",
      "",
      "// Nur gueltige Registrierungen behalten:",
      "const valid = rawEntries.filter(isValidRegistration);",
      "// Typ: Registration[]",
      "// valid = [{ username: 'Max', ... }, { username: 'Anna', ... }]",
    ].join("\n"),
    conceptsBridged: [
      "Type Guards (is)",
      "Assertion Functions (asserts)",
      "TS 5.5 Inferred Type Predicates",
      "unknown-Validierung",
    ],
    hints: [
      "Ein Type Guard (is) gibt boolean zurueck und wird in if-Bedingungen genutzt. Eine Assertion Function (asserts) wirft bei Fehler und narrowt den gesamten Scope.",
      "Pruefe zuerst ob data ein Objekt ist (typeof === 'object' && !== null), dann jede Property einzeln mit typeof.",
      "Der Vorteil der Assertion Function: Sie gibt detaillierte Fehlermeldungen. Der Type Guard sagt nur 'ungueltig' ohne Details.",
    ],
    difficulty: 3,
  },

  // ─── Task 3: Redux-Style Action Handler ───────────────────────────────
  {
    id: "11-redux-actions",
    title: "Redux-Style Action Handler mit Exhaustive Checks",
    prerequisiteLessons: [11],
    scenario:
      "Du arbeitest an einer React-App mit einem Redux-aehnlichen " +
      "State-Management. Actions werden als Discriminated Union " +
      "modelliert. Das Team hat sich beschwert, dass neue Actions " +
      "hinzugefuegt werden, aber der Reducer vergisst sie zu behandeln. " +
      "Das fuehrt zu stillen Fehlern — der State aendert sich nicht.",
    task:
      "Modelliere einen typsicheren Action-Reducer mit Exhaustive Checks.\n\n" +
      "1. Definiere Actions als Discriminated Union (type-Property als Discriminant)\n" +
      "2. Definiere den State-Typ\n" +
      "3. Schreibe einen Reducer mit exhaustive switch + assertNever\n" +
      "4. Zeige was passiert wenn eine neue Action hinzugefuegt wird\n" +
      "5. Verwende readonly und as const fuer typsichere Action-Creators",
    starterCode: [
      "// State",
      "interface AppState {",
      "  items: string[];",
      "  loading: boolean;",
      "  error: string | null;",
      "}",
      "",
      "// Actions als Discriminated Union:",
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
      "// ═══ Actions als Discriminated Union ═══",
      "type AppAction =",
      "  | { type: 'LOAD_START' }",
      "  | { type: 'LOAD_SUCCESS'; items: string[] }",
      "  | { type: 'LOAD_ERROR'; error: string }",
      "  | { type: 'ADD_ITEM'; item: string }",
      "  | { type: 'REMOVE_ITEM'; index: number };",
      "",
      "function assertNever(value: never): never {",
      "  throw new Error(`Unbehandelte Action: ${JSON.stringify(value)}`);",
      "}",
      "",
      "// ═══ Reducer mit Exhaustive Check ═══",
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
      "      // Wenn jemand 'CLEAR_ALL' als Action hinzufuegt aber keinen",
      "      // case ergaenzt, meldet TypeScript:",
      "      // Type '{ type: \"CLEAR_ALL\" }' is not assignable to type 'never'",
      "  }",
      "}",
      "",
      "// ═══ Typsichere Action Creators ═══",
      "const loadStart = () => ({ type: 'LOAD_START' as const });",
      "const loadSuccess = (items: string[]) => ({ type: 'LOAD_SUCCESS' as const, items });",
      "const addItem = (item: string) => ({ type: 'ADD_ITEM' as const, item });",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Unions",
      "Exhaustive Checks / assertNever",
      "Immutable State Updates",
      "as const fuer Action Creators",
      "React/Redux Patterns",
    ],
    hints: [
      "Jede Action hat eine 'type'-Property mit einem Literal-Wert (z.B. 'LOAD_START'). TypeScript narrowt im switch automatisch auf die richtige Action.",
      "assertNever im default stellt sicher, dass der Reducer nie eine Action 'vergisst'. Bei einer neuen Action gibt es sofort einen Compile-Fehler.",
      "as const bei Action Creators stellt sicher, dass type als Literal-Typ inferiert wird, nicht als string.",
    ],
    difficulty: 4,
  },
];
