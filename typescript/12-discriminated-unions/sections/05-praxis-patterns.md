# Sektion 5: Praxis-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Zustandsmodellierung](./04-zustandsmodellierung.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie du **API Responses** typsicher modellierst
- **Action Types** fuer Redux/NgRx mit Discriminated Unions
- **Event Systeme** mit typsicheren Event-Handlern
- **Error-Hierarchien** fuer differenzierte Fehlerbehandlung
- Hilfreiche Utility Types: `Extract` und `Exclude`

---

> 💭 **Denkfrage:** Du baust eine API-Client-Bibliothek. Ein Aufrufer bekommt eine `fetch()`-Antwort — wie wuerdes du den Rueckgabetyp gestalten, damit der Aufrufer *gezwungen* ist, sowohl Erfolg als auch alle Fehlertypen zu behandeln? Welche Varianten wuerden dich wirklich absichern?
>
> **Antwort:** Eine typisierte `ApiResponse<T>`-Union mit expliziten Varianten fuer jeden HTTP-Fehlerbereich (400er, 401/403, 404, 500er) — der Aufrufer kann `response.data` nur nach dem `type === "success"`-Check lesen. try/catch kann er vergessen, aber eine Union-Variante nicht.

---

## Pattern 1: API Responses

APIs liefern verschiedene Antworten — Erfolg, verschiedene Fehlertypen,
Validierungsfehler. Discriminated Unions bilden das perfekt ab:

```typescript annotated
// Typisierte API-Antworten
type ApiResponse<T> =
  | { type: "success"; data: T; statusCode: 200 | 201 }
  | { type: "validation_error"; errors: ValidationError[]; statusCode: 400 }
  | { type: "auth_error"; message: string; statusCode: 401 | 403 }
  | { type: "not_found"; resource: string; statusCode: 404 }
  | { type: "server_error"; message: string; statusCode: 500 };

type ValidationError = {
  field: string;
  message: string;
  code: string;
};

// Typsichere Response-Verarbeitung:
async function handleResponse<T>(response: ApiResponse<T>): Promise<void> {
  switch (response.type) {
    case "success":
      // response.data hat Typ T
      console.log("Erfolgreich:", response.data);
      break;

    case "validation_error":
      // response.errors hat Typ ValidationError[]
      for (const err of response.errors) {
        console.log(`${err.field}: ${err.message}`);
      }
      break;

    case "auth_error":
      // response.statusCode ist 401 | 403
      if (response.statusCode === 401) {
        redirectToLogin();
      } else {
        showForbiddenPage();
      }
      break;

    case "not_found":
      console.log(`${response.resource} nicht gefunden`);
      break;

    case "server_error":
      reportToSentry(response.message);
      break;
  }
}
```

### Wrapper-Funktion fuer fetch

```typescript annotated
async function apiFetch<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url);
    const body = await res.json();

    if (res.ok) {
      return {
        type: "success",
        data: body as T,
        statusCode: res.status as 200 | 201,
      };
    }

    if (res.status === 400) {
      return { type: "validation_error", errors: body.errors, statusCode: 400 };
    }

    if (res.status === 401 || res.status === 403) {
      return { type: "auth_error", message: body.message, statusCode: res.status };
    }

    if (res.status === 404) {
      return { type: "not_found", resource: url, statusCode: 404 };
    }

    return { type: "server_error", message: body.message ?? "Unbekannter Fehler", statusCode: 500 };
  } catch (e) {
    return { type: "server_error", message: String(e), statusCode: 500 };
  }
}
```

---

## Pattern 2: Action Types (Redux/NgRx)

In Redux und NgRx sind **Actions** das Herztueck. Jede Action hat
einen `type`-Diskriminator und eine optionale Payload:

```typescript annotated
// Action Discriminated Union
type TodoAction =
  | { type: "ADD_TODO"; payload: { text: string } }
  | { type: "TOGGLE_TODO"; payload: { id: number } }
  | { type: "DELETE_TODO"; payload: { id: number } }
  | { type: "SET_FILTER"; payload: { filter: "all" | "active" | "done" } }
  | { type: "CLEAR_COMPLETED" };

// Typsicherer Reducer
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "ADD_TODO":
      // action.payload: { text: string }
      return {
        ...state,
        todos: [...state.todos, { id: nextId++, text: action.payload.text, done: false }],
      };

    case "TOGGLE_TODO":
      // action.payload: { id: number }
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? { ...todo, done: !todo.done } : todo
        ),
      };

    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id),
      };

    case "SET_FILTER":
      // action.payload: { filter: "all" | "active" | "done" }
      return { ...state, filter: action.payload.filter };

    case "CLEAR_COMPLETED":
      // Kein payload bei dieser Action
      return { ...state, todos: state.todos.filter(todo => !todo.done) };
  }
}
```

### Action Creator Pattern

```typescript annotated
// Action Creator Funktionen fuer bessere API:
const todoActions = {
  add: (text: string): TodoAction => ({
    type: "ADD_TODO",
    payload: { text },
  }),

  toggle: (id: number): TodoAction => ({
    type: "TOGGLE_TODO",
    payload: { id },
  }),

  delete: (id: number): TodoAction => ({
    type: "DELETE_TODO",
    payload: { id },
  }),

  setFilter: (filter: "all" | "active" | "done"): TodoAction => ({
    type: "SET_FILTER",
    payload: { filter },
  }),

  clearCompleted: (): TodoAction => ({
    type: "CLEAR_COMPLETED",
  }),
};

// Verwendung:
dispatch(todoActions.add("TypeScript lernen"));
dispatch(todoActions.toggle(1));
```

---

## Pattern 3: Event Systeme

Typsichere Event-Handler mit Discriminated Unions:

```typescript annotated
// Typisierte Events
type AppEvent =
  | { type: "user:login"; userId: string; timestamp: Date }
  | { type: "user:logout"; userId: string; timestamp: Date }
  | { type: "page:view"; path: string; referrer: string | null }
  | { type: "error:unhandled"; error: Error; context: string }
  | { type: "analytics:track"; event: string; properties: Record<string, unknown> };

// Typsicherer Event-Bus
class EventBus {
  private handlers: Map<string, Function[]> = new Map();

  on<T extends AppEvent["type"]>(
    type: T,
    handler: (event: Extract<AppEvent, { type: T }>) => void
  ): void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  emit(event: AppEvent): void {
    const list = this.handlers.get(event.type) ?? [];
    for (const handler of list) {
      handler(event);
    }
  }
}

// Verwendung:
const bus = new EventBus();

bus.on("user:login", (event) => {
  // event ist automatisch { type: "user:login"; userId: string; timestamp: Date }
  console.log(`User ${event.userId} eingeloggt`);
});

bus.on("error:unhandled", (event) => {
  // event ist { type: "error:unhandled"; error: Error; context: string }
  reportError(event.error, event.context);
});
```

> **Beachte:** `Extract<AppEvent, { type: T }>` nutzt den Utility Type
> `Extract`, um aus der Union genau die Variante herauszuziehen,
> deren `type` mit T uebereinstimmt.

---

## Pattern 4: Error-Hierarchien

Differenzierte Fehlerbehandlung mit verschiedenen Error-Typen:

```typescript annotated
// Error-Hierarchie als Discriminated Union
type AppError =
  | { kind: "network"; url: string; statusCode: number; retryable: boolean }
  | { kind: "validation"; field: string; message: string; value: unknown }
  | { kind: "auth"; reason: "expired" | "invalid" | "missing" }
  | { kind: "permission"; resource: string; action: string; role: string }
  | { kind: "not_found"; entity: string; id: string };

function handleError(error: AppError): void {
  switch (error.kind) {
    case "network":
      if (error.retryable) {
        console.log(`Netzwerkfehler bei ${error.url} — wird wiederholt...`);
        // Retry-Logik
      } else {
        console.log(`Fataler Netzwerkfehler: ${error.statusCode}`);
      }
      break;

    case "validation":
      console.log(`Validierungsfehler in ${error.field}: ${error.message}`);
      // Formular-Feld hervorheben
      break;

    case "auth":
      switch (error.reason) {
        case "expired": redirectToLogin(); break;
        case "invalid": showError("Ungueltige Anmeldedaten"); break;
        case "missing": showLoginDialog(); break;
      }
      break;

    case "permission":
      console.log(
        `Keine Berechtigung: ${error.action} auf ${error.resource} ` +
        `(Rolle: ${error.role})`
      );
      break;

    case "not_found":
      console.log(`${error.entity} mit ID ${error.id} nicht gefunden`);
      break;
  }
}
```

---

## Utility Types: Extract und Exclude

Zwei eingebaute Utility Types, die mit Discriminated Unions
besonders nuetzlich sind:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// Extract: Ziehe bestimmte Varianten heraus
type RoundShape = Extract<Shape, { kind: "circle" }>;
// { kind: "circle"; radius: number }

// Exclude: Schliesse bestimmte Varianten aus
type AngularShape = Exclude<Shape, { kind: "circle" }>;
// { kind: "rectangle"; ... } | { kind: "triangle"; ... }

// Praktisch fuer spezialisierte Funktionen:
function drawRound(shape: Extract<Shape, { kind: "circle" }>): void {
  // shape.radius ist hier garantiert verfuegbar
  console.log(`Zeichne Kreis mit Radius ${shape.radius}`);
}

// Typ aller moeglichen Tag-Werte extrahieren:
type ShapeKind = Shape["kind"];
// "circle" | "rectangle" | "triangle"
```

---

## Pattern 5: Generischer Discriminated Union Builder

Ein fortgeschrittenes Pattern fuer wiederverwendbare Unions:

```typescript annotated
// Generischer Wrapper fuer beliebige Discriminated Unions:
type Tagged<Tag extends string, Data = {}> = { type: Tag } & Data;

// Damit lassen sich Unions kompakt definieren:
type FileEvent =
  | Tagged<"created", { path: string; size: number }>
  | Tagged<"modified", { path: string; changes: string[] }>
  | Tagged<"deleted", { path: string }>
  | Tagged<"renamed", { oldPath: string; newPath: string }>;

// Verwendung ist identisch:
function handleFileEvent(event: FileEvent) {
  switch (event.type) {
    case "created":
      console.log(`Neue Datei: ${event.path} (${event.size} Bytes)`);
      break;
    case "renamed":
      console.log(`Umbenannt: ${event.oldPath} -> ${event.newPath}`);
      break;
    // ...
  }
}
```

> **Experiment:** Teste den `Extract`-Utility-Type mit einer echten Union:
>
> ```typescript
> type AppEvent =
>   | { type: "user:login"; userId: string }
>   | { type: "user:logout"; userId: string }
>   | { type: "page:view"; path: string }
>   | { type: "error"; message: string };
>
> // Extract zieht eine einzelne Variante heraus:
> type LoginEvent = Extract<AppEvent, { type: "user:login" }>;
> // { type: "user:login"; userId: string }
>
> // Exclude schliesst Varianten aus:
> type NonUserEvent = Exclude<AppEvent, { type: `user:${string}` }>;
> // { type: "page:view"; path: string } | { type: "error"; message: string }
>
> // Alle moeglichen type-Werte als Union:
> type EventType = AppEvent["type"];
> // "user:login" | "user:logout" | "page:view" | "error"
>
> // Schreibe eine Funktion, die nur user:login verarbeitet:
> function handleLogin(event: Extract<AppEvent, { type: "user:login" }>): void {
>   console.log(`User ${event.userId} hat sich eingeloggt`);
>   // event.path ist hier nicht verfuegbar — was passiert wenn du es tippst?
> }
> ```
>
> Fuelle `AppEvent` mit einer weiteren Variante `{ type: "user:signup"; email: string }`. Welche Stellen im Code werden davon automatisch beeinflusst?

---

**In deinem Angular-Projekt:** NgRx Actions sind der perfekte Ort fuer das Action-Types-Pattern. Statt jeder Action eine separate Interface-Definition zu geben, definierst du eine Union — und der Reducer mit Exhaustive Check stellt sicher, dass du keine Action verpasst:

```typescript
// Zentraler Action-Typ als Discriminated Union:
type ProductAction =
  | { type: "[Product] Load" }
  | { type: "[Product] Load Success"; products: Product[] }
  | { type: "[Product] Load Failure"; error: string }
  | { type: "[Product] Select"; productId: string }
  | { type: "[Product] Clear Selection" };

// Typ aller gueltigen Action-type-Strings:
type ProductActionType = ProductAction["type"];
// "[Product] Load" | "[Product] Load Success" | ...

// Spezialisierter Handler nur fuer Failure:
type FailureAction = Extract<ProductAction, { type: "[Product] Load Failure" }>;

function logFailure(action: FailureAction): void {
  console.error(`Ladefehler: ${action.error}`);
}
```

**In React:** `useReducer` nimmt eine `(state, action) => state`-Funktion — genau ein Reducer-Pattern. Definiere deine Action als Discriminated Union und nutze switch/case mit assertNever — identisches Muster zu NgRx, ohne Bibliothek.

---

## Was du gelernt hast

- Das **API Response Pattern** macht alle Fehlertypen explizit sichtbar im Typ — kein verstecktes `catch (e: unknown)` mehr
- **Action Types** in Redux/NgRx sind Discriminated Unions — der `type`-String ist der Diskriminator, der Reducer nutzt switch/case mit Exhaustive Check
- **Event Systeme** profitieren von `Extract<Union, { type: T }>` — Handler bekommen automatisch den korrekten Typ fuer ihr Event
- **Error-Hierarchien** ermoeglichen differenzierte Fehlerbehandlung: Netzwerkfehler, Validierungsfehler und Auth-Fehler haben verschiedene Payloads
- **Extract und Exclude** sind die Schere fuer Union Types — ziehe genau die Varianten heraus, die du brauchst

**Kernkonzept:** Discriminated Unions sind kein akademisches Konstrukt — sie sind das Rueckgrat von NgRx Actions, Redux Reducers, typsicheren API-Clients und Event-Systemen. Sobald du dieses Muster erkennst, siehst du es ueberall in professionellen TypeScript-Codebasen.

---

## Die 10 wichtigsten Erkenntnisse der Lektion

<details>
<summary>Zusammenfassung aufklappen (erst nach allen Sektionen lesen!)</summary>

1. **Drei Zutaten:** Tag-Property + Union Type + Narrowing = Discriminated Union
2. **Der Diskriminator** muss ein Literal Type sein (String, Number, Boolean)
3. **switch/case** ist das natuerliche Pattern — zusammen mit dem Exhaustive Check
4. **assertNever** deckt fehlende Faelle zur Compile-Zeit auf
5. **Sum Types** kommen aus Haskell/ML — TypeScript braucht keine neue Syntax dafuer
6. **Option\<T\>** und **Result\<T, E\>** ersetzen null und try/catch typsicher
7. **"Make impossible states impossible"** — Discriminated Unions statt Booleans
8. **AsyncState\<T\>** ist framework-agnostisch (React, Angular, Vue, ...)
9. **Action Types** in Redux/NgRx sind Discriminated Unions mit dem Diskriminator `type`
10. **Extract/Exclude** extrahieren einzelne Varianten aus einer Union

</details>

---

> **Lektion abgeschlossen!** Du beherrschst jetzt Discriminated Unions —
> eines der maechtigsten Patterns in TypeScript. Arbeite jetzt die
> Examples, Exercises und das Quiz durch.
>
> Zurueck zur [Uebersicht](../README.md)
