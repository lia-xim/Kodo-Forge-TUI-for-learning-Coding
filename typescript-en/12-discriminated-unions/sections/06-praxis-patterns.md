# Section 6: Practice Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - State Modeling](./05-zustandsmodellierung.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How to model **API Responses** in a type-safe way
- **Action Types** for Redux/NgRx with Discriminated Unions
- **Event Systems** with type-safe event handlers
- **Error hierarchies** for differentiated error handling
- Helpful utility types: `Extract` and `Exclude`

---

> 💭 **Think about it:** You're building an API client library. A caller gets a `fetch()` response — how would you design the return type so the caller is *forced* to handle both success and all error types? Which variants would truly protect you?
>
> **Answer:** A typed `ApiResponse<T>` union with explicit variants for each HTTP error range (4xx, 401/403, 404, 5xx) — the caller can only read `response.data` after checking `type === "success"`. They can forget try/catch, but they can't ignore a union variant.

---

## Pattern 1: API Responses

APIs return various responses — success, various error types,
validation errors. Discriminated Unions model this perfectly:

```typescript annotated
// Typed API responses
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

// Type-safe response processing:
async function handleResponse<T>(response: ApiResponse<T>): Promise<void> {
  switch (response.type) {
    case "success":
      // response.data has type T
      console.log("Success:", response.data);
      break;

    case "validation_error":
      // response.errors has type ValidationError[]
      for (const err of response.errors) {
        console.log(`${err.field}: ${err.message}`);
      }
      break;

    case "auth_error":
      // response.statusCode is 401 | 403
      if (response.statusCode === 401) {
        redirectToLogin();
      } else {
        showForbiddenPage();
      }
      break;

    case "not_found":
      console.log(`${response.resource} not found`);
      break;

    case "server_error":
      reportToSentry(response.message);
      break;
  }
}
```

### Wrapper function for fetch

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

    return { type: "server_error", message: body.message ?? "Unknown error", statusCode: 500 };
  } catch (e) {
    return { type: "server_error", message: String(e), statusCode: 500 };
  }
}
```

---

## Pattern 2: Action Types (Redux/NgRx)

In Redux and NgRx, **Actions** are the core element. Each action has
a `type` discriminator and an optional payload:

```typescript annotated
// Action Discriminated Union
type TodoAction =
  | { type: "ADD_TODO"; payload: { text: string } }
  | { type: "TOGGLE_TODO"; payload: { id: number } }
  | { type: "DELETE_TODO"; payload: { id: number } }
  | { type: "SET_FILTER"; payload: { filter: "all" | "active" | "done" } }
  | { type: "CLEAR_COMPLETED" };

// Type-safe reducer
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
      // No payload for this action
      return { ...state, todos: state.todos.filter(todo => !todo.done) };
  }
}
```

### Action Creator Pattern

```typescript annotated
// Action creator functions for a better API:
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

// Usage:
dispatch(todoActions.add("Learn TypeScript"));
dispatch(todoActions.toggle(1));
```

---

## Pattern 3: Event Systems

Type-safe event handlers with Discriminated Unions:

```typescript annotated
// Typed events
type AppEvent =
  | { type: "user:login"; userId: string; timestamp: Date }
  | { type: "user:logout"; userId: string; timestamp: Date }
  | { type: "page:view"; path: string; referrer: string | null }
  | { type: "error:unhandled"; error: Error; context: string }
  | { type: "analytics:track"; event: string; properties: Record<string, unknown> };

// Type-safe event bus
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

// Usage:
const bus = new EventBus();

bus.on("user:login", (event) => {
  // event is automatically { type: "user:login"; userId: string; timestamp: Date }
  console.log(`User ${event.userId} logged in`);
});

bus.on("error:unhandled", (event) => {
  // event is { type: "error:unhandled"; error: Error; context: string }
  reportError(event.error, event.context);
});
```

> **Note:** `Extract<AppEvent, { type: T }>` uses the utility type
> `Extract` to pull exactly the variant out of the union
> whose `type` matches T.

---

## Pattern 4: Error Hierarchies

Differentiated error handling with various error types:

```typescript annotated
// Error hierarchy as Discriminated Union
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
        console.log(`Network error at ${error.url} — retrying...`);
        // Retry logic
      } else {
        console.log(`Fatal network error: ${error.statusCode}`);
      }
      break;

    case "validation":
      console.log(`Validation error in ${error.field}: ${error.message}`);
      // Highlight form field
      break;

    case "auth":
      switch (error.reason) {
        case "expired": redirectToLogin(); break;
        case "invalid": showError("Invalid credentials"); break;
        case "missing": showLoginDialog(); break;
      }
      break;

    case "permission":
      console.log(
        `No permission: ${error.action} on ${error.resource} ` +
        `(role: ${error.role})`
      );
      break;

    case "not_found":
      console.log(`${error.entity} with ID ${error.id} not found`);
      break;
  }
}
```

---

## Utility Types: Extract and Exclude

Two built-in utility types that are especially useful with Discriminated Unions:

```typescript annotated
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// Extract: Pull out specific variants
type RoundShape = Extract<Shape, { kind: "circle" }>;
// { kind: "circle"; radius: number }

// Exclude: Exclude specific variants
type AngularShape = Exclude<Shape, { kind: "circle" }>;
// { kind: "rectangle"; ... } | { kind: "triangle"; ... }

// Useful for specialized functions:
function drawRound(shape: Extract<Shape, { kind: "circle" }>): void {
  // shape.radius is guaranteed to be available here
  console.log(`Drawing circle with radius ${shape.radius}`);
}

// Extract all possible tag values as a type:
type ShapeKind = Shape["kind"];
// "circle" | "rectangle" | "triangle"
```

---

## Pattern 5: Generic Discriminated Union Builder

An advanced pattern for reusable unions:

```typescript annotated
// Generic wrapper for arbitrary Discriminated Unions:
type Tagged<Tag extends string, Data = {}> = { type: Tag } & Data;

// This allows unions to be defined compactly:
type FileEvent =
  | Tagged<"created", { path: string; size: number }>
  | Tagged<"modified", { path: string; changes: string[] }>
  | Tagged<"deleted", { path: string }>
  | Tagged<"renamed", { oldPath: string; newPath: string }>;

// Usage is identical:
function handleFileEvent(event: FileEvent) {
  switch (event.type) {
    case "created":
      console.log(`New file: ${event.path} (${event.size} bytes)`);
      break;
    case "renamed":
      console.log(`Renamed: ${event.oldPath} -> ${event.newPath}`);
      break;
    // ...
  }
}
```

> **Experiment:** Test the `Extract` utility type with a real union:
>
> ```typescript
> type AppEvent =
>   | { type: "user:login"; userId: string }
>   | { type: "user:logout"; userId: string }
>   | { type: "page:view"; path: string }
>   | { type: "error"; message: string };
>
> // Extract pulls out a single variant:
> type LoginEvent = Extract<AppEvent, { type: "user:login" }>;
> // { type: "user:login"; userId: string }
>
> // Exclude removes variants:
> type NonUserEvent = Exclude<AppEvent, { type: `user:${string}` }>;
> // { type: "page:view"; path: string } | { type: "error"; message: string }
>
> // All possible type values as a union:
> type EventType = AppEvent["type"];
> // "user:login" | "user:logout" | "page:view" | "error"
>
> // Write a function that only handles user:login:
> function handleLogin(event: Extract<AppEvent, { type: "user:login" }>): void {
>   console.log(`User ${event.userId} has logged in`);
>   // event.path is not available here — what happens when you type it?
> }
> ```
>
> Add another variant `{ type: "user:signup"; email: string }` to `AppEvent`. Which parts of the code are automatically affected by this?

---

**In your Angular project:** NgRx Actions are the perfect place for the Action Types pattern. Instead of giving each action a separate interface definition, you define a union — and the reducer with an exhaustive check ensures you don't miss any action:

```typescript
// Central action type as Discriminated Union:
type ProductAction =
  | { type: "[Product] Load" }
  | { type: "[Product] Load Success"; products: Product[] }
  | { type: "[Product] Load Failure"; error: string }
  | { type: "[Product] Select"; productId: string }
  | { type: "[Product] Clear Selection" };

// Type of all valid action type strings:
type ProductActionType = ProductAction["type"];
// "[Product] Load" | "[Product] Load Success" | ...

// Specialized handler only for failures:
type FailureAction = Extract<ProductAction, { type: "[Product] Load Failure" }>;

function logFailure(action: FailureAction): void {
  console.error(`Load error: ${action.error}`);
}
```

**In React:** `useReducer` takes a `(state, action) => state` function — exactly the reducer pattern. Define your action as a Discriminated Union and use switch/case with assertNever — identical pattern to NgRx, without the library.

---

## What you've learned

- The **API Response Pattern** makes all error types explicitly visible in the type — no more hidden `catch (e: unknown)`
- **Action Types** in Redux/NgRx are Discriminated Unions — the `type` string is the discriminator, the reducer uses switch/case with an exhaustive check
- **Event Systems** benefit from `Extract<Union, { type: T }>` — handlers automatically get the correct type for their event
- **Error hierarchies** enable differentiated error handling: network errors, validation errors, and auth errors have different payloads
- **Extract and Exclude** are the scissors for union types — pull out exactly the variants you need

**Core concept:** Discriminated Unions are not an academic construct — they are the backbone of NgRx Actions, Redux Reducers, type-safe API clients, and event systems. Once you recognize this pattern, you'll see it everywhere in professional TypeScript codebases.

---

## The 10 most important insights of the lesson

<details>
<summary>Expand summary (read only after completing all sections!)</summary>

1. **Three ingredients:** Tag property + union type + narrowing = Discriminated Union
2. **The discriminator** must be a literal type (string, number, boolean)
3. **switch/case** is the natural pattern — together with the exhaustive check
4. **assertNever** catches missing cases at compile time
5. **Sum types** come from Haskell/ML — TypeScript needs no new syntax for them
6. **Option\<T\>** and **Result\<T, E\>** replace null and try/catch in a type-safe way
7. **"Make impossible states impossible"** — Discriminated Unions instead of booleans
8. **AsyncState\<T\>** is framework-agnostic (React, Angular, Vue, ...)
9. **Action Types** in Redux/NgRx are Discriminated Unions with the discriminator `type`
10. **Extract/Exclude** extract individual variants from a union

</details>

---

> **Lesson complete!** You now have mastery of Discriminated Unions —
> one of the most powerful patterns in TypeScript. Work through the
> examples, exercises, and quiz now.
>
> Back to [Overview](../README.md)