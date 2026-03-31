/**
 * Lektion 12 - Example 05: Praxis-Patterns
 *
 * Ausfuehren mit: npx tsx examples/05-praxis-patterns.ts
 *
 * API Responses, Action Types (Redux/NgRx),
 * Event Systems, Error-Hierarchien.
 */

// ─── PATTERN 1: API RESPONSES ──────────────────────────────────────────────

type ApiResponse<T> =
  | { type: "success"; data: T; statusCode: 200 | 201 }
  | { type: "validation_error"; errors: { field: string; message: string }[]; statusCode: 400 }
  | { type: "auth_error"; message: string; statusCode: 401 | 403 }
  | { type: "not_found"; resource: string; statusCode: 404 }
  | { type: "server_error"; message: string; statusCode: 500 };

function handleApiResponse<T>(response: ApiResponse<T>): string {
  switch (response.type) {
    case "success":
      return `Erfolg (${response.statusCode}): ${JSON.stringify(response.data)}`;
    case "validation_error":
      return `Validierung: ${response.errors.map(e => `${e.field}: ${e.message}`).join(", ")}`;
    case "auth_error":
      return `Auth-Fehler (${response.statusCode}): ${response.message}`;
    case "not_found":
      return `Nicht gefunden: ${response.resource}`;
    case "server_error":
      return `Server-Fehler: ${response.message}`;
  }
}

console.log("=== API Responses ===");
const responses: ApiResponse<{ id: number; name: string }>[] = [
  { type: "success", data: { id: 1, name: "Alice" }, statusCode: 200 },
  { type: "validation_error", errors: [{ field: "email", message: "Ungueltig" }], statusCode: 400 },
  { type: "auth_error", message: "Token abgelaufen", statusCode: 401 },
  { type: "not_found", resource: "/api/users/999", statusCode: 404 },
  { type: "server_error", message: "Datenbank nicht erreichbar", statusCode: 500 },
];

for (const res of responses) {
  console.log(`  ${handleApiResponse(res)}`);
}

// ─── PATTERN 2: ACTION TYPES (REDUX/NGRX) ─────────────────────────────────

type Todo = { id: number; text: string; done: boolean };

type TodoAction =
  | { type: "ADD_TODO"; payload: { text: string } }
  | { type: "TOGGLE_TODO"; payload: { id: number } }
  | { type: "DELETE_TODO"; payload: { id: number } }
  | { type: "SET_FILTER"; payload: { filter: "all" | "active" | "done" } }
  | { type: "CLEAR_COMPLETED" };

type TodoState = {
  todos: Todo[];
  filter: "all" | "active" | "done";
};

let nextId = 1;

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, { id: nextId++, text: action.payload.text, done: false }],
      };
    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload.id ? { ...t, done: !t.done } : t
        ),
      };
    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload.id),
      };
    case "SET_FILTER":
      return { ...state, filter: action.payload.filter };
    case "CLEAR_COMPLETED":
      return { ...state, todos: state.todos.filter(t => !t.done) };
  }
}

console.log("\n=== Redux-style Reducer ===");
let todoState: TodoState = { todos: [], filter: "all" };

todoState = todoReducer(todoState, { type: "ADD_TODO", payload: { text: "TypeScript lernen" } });
todoState = todoReducer(todoState, { type: "ADD_TODO", payload: { text: "Discriminated Unions ueben" } });
todoState = todoReducer(todoState, { type: "TOGGLE_TODO", payload: { id: 1 } });

console.log("  Todos:", todoState.todos.map(t => `${t.done ? "[x]" : "[ ]"} ${t.text}`));

todoState = todoReducer(todoState, { type: "CLEAR_COMPLETED" });
console.log("  Nach CLEAR_COMPLETED:", todoState.todos.map(t => t.text));

// ─── PATTERN 3: ERROR-HIERARCHIE ──────────────────────────────────────────

type AppError =
  | { kind: "network"; url: string; statusCode: number; retryable: boolean }
  | { kind: "validation"; field: string; message: string }
  | { kind: "auth"; reason: "expired" | "invalid" | "missing" }
  | { kind: "not_found"; entity: string; id: string };

function handleError(error: AppError): string {
  switch (error.kind) {
    case "network":
      return error.retryable
        ? `Netzwerk-Fehler bei ${error.url} — wird wiederholt`
        : `Fataler Netzwerk-Fehler (${error.statusCode})`;
    case "validation":
      return `Validierung: ${error.field} — ${error.message}`;
    case "auth":
      switch (error.reason) {
        case "expired": return "Sitzung abgelaufen — bitte neu anmelden";
        case "invalid": return "Ungueltige Anmeldedaten";
        case "missing": return "Nicht angemeldet";
      }
    case "not_found":
      return `${error.entity} #${error.id} nicht gefunden`;
  }
}

console.log("\n=== Error-Hierarchie ===");
const errors: AppError[] = [
  { kind: "network", url: "/api/data", statusCode: 503, retryable: true },
  { kind: "validation", field: "email", message: "Ungueltige E-Mail" },
  { kind: "auth", reason: "expired" },
  { kind: "not_found", entity: "User", id: "42" },
];

for (const error of errors) {
  console.log(`  ${handleError(error)}`);
}

// ─── PATTERN 4: EVENT SYSTEM MIT EXTRACT ───────────────────────────────────

type AppEvent =
  | { type: "user:login"; userId: string; timestamp: Date }
  | { type: "user:logout"; userId: string; timestamp: Date }
  | { type: "page:view"; path: string }
  | { type: "error:unhandled"; error: string };

// Extract zieht eine bestimmte Variante heraus:
type LoginEvent = Extract<AppEvent, { type: "user:login" }>;
// { type: "user:login"; userId: string; timestamp: Date }

type UserEvent = Extract<AppEvent, { type: `user:${string}` }>;
// user:login | user:logout

// Typsicherer Event-Handler:
function onLogin(event: LoginEvent): void {
  console.log(`  Login: User ${event.userId} am ${event.timestamp.toISOString()}`);
}

function logEvent(event: AppEvent): void {
  console.log(`  Event: ${event.type}`);
}

console.log("\n=== Event System ===");
const loginEvent: LoginEvent = {
  type: "user:login",
  userId: "user-42",
  timestamp: new Date(),
};
onLogin(loginEvent);

const events: AppEvent[] = [
  { type: "user:login", userId: "u1", timestamp: new Date() },
  { type: "page:view", path: "/dashboard" },
  { type: "error:unhandled", error: "TypeError: null" },
  { type: "user:logout", userId: "u1", timestamp: new Date() },
];

for (const event of events) {
  logEvent(event);
}

// ─── PATTERN 5: TAGGED HELPER ──────────────────────────────────────────────

type Tagged<Tag extends string, Data = {}> = { type: Tag } & Data;

type FileEvent =
  | Tagged<"created", { path: string; size: number }>
  | Tagged<"modified", { path: string; changes: number }>
  | Tagged<"deleted", { path: string }>;

function handleFileEvent(event: FileEvent): string {
  switch (event.type) {
    case "created": return `Erstellt: ${event.path} (${event.size} Bytes)`;
    case "modified": return `Geaendert: ${event.path} (${event.changes} Aenderungen)`;
    case "deleted": return `Geloescht: ${event.path}`;
  }
}

console.log("\n=== Tagged Helper ===");
const fileEvents: FileEvent[] = [
  { type: "created", path: "/src/app.ts", size: 1024 },
  { type: "modified", path: "/src/app.ts", changes: 5 },
  { type: "deleted", path: "/src/old.ts" },
];

for (const event of fileEvents) {
  console.log(`  ${handleFileEvent(event)}`);
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
