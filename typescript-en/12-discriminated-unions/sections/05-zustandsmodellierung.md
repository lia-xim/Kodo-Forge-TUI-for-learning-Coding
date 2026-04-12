# Section 5: State Modeling with Discriminated Unions

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Option and Result Pattern](./04-option-und-result-pattern.md)
> Next section: [06 - Practical Patterns](./06-praxis-patterns.md)

---

## What you'll learn here

- Why **impossible states** are the most common source of bugs
- How Discriminated Unions express **state machines** as types
- The **Loading/Error/Success** pattern for async data
- How React and Angular state management becomes safer with it
- Modeling state transitions in a type-safe way

---

## The Problem: Impossible States

The most common bug in frontend applications arises from **states
that should never exist in the first place:**

```typescript annotated
// BAD: Flat state structure with booleans
type DataState = {
  isLoading: boolean;
  isError: boolean;
  data: string[] | null;
  error: string | null;
};

// Impossible states are ALLOWED:
const impossible1: DataState = {
  isLoading: true,
  isError: true,    // Loading AND error at the same time?!
  data: ["a", "b"], // Data present while loading?!
  error: "Oops",    // Error AND data?!
};

// Who guarantees that data is null when isLoading is true?
// NOBODY. That's a contract in the developer's head — not in the type.
```

> **Kent C. Dodds** put it perfectly:
> *"Make impossible states impossible."*
> If the type allows impossible states, bugs will happen.

> 💭 **Think about it:** How many different states can the `DataState` type theoretically represent with four booleans/nullables? How many of them are actually meaningful? What does that say about the quality of the type?
>
> **Answer:** `boolean * boolean * (T | null) * (string | null)` gives `2 * 2 * 2 * 2 = 16` possible combinations — but only 4 are meaningful (idle, loading, error, success). So you're writing code that actively allows 12 nonsensical states and has to handle them defensively.

---

## The Solution: State as a Discriminated Union

Model each state as its **own variant** with only the
data that makes sense in that state:

```typescript annotated
type DataState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: string[] };

// Impossible states are IMPOSSIBLE:
// - loading has no data and no error
// - error has an error but no data
// - success has data but no error
```

### Before vs. After

```typescript annotated
// BEFORE: 2^4 = 16 possible combinations (most of them nonsensical)
type Old = {
  isLoading: boolean; // 2 values
  isError: boolean;   // 2 values
  data: string[] | null; // 2 possibilities
  error: string | null;  // 2 possibilities
};
// 16 states — only 4 of them meaningful!

// AFTER: Exactly 4 states — all meaningful
type New =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: string[] };
// 4 states — all valid!
```

---

## State Machines as Types

A **state machine** defines:
1. Which **states** exist
2. Which **transitions** between states are allowed

Discriminated Unions model the states perfectly.
We encode the transitions in the functions:

```typescript annotated
// States of an order
type OrderState =
  | { status: "draft"; items: CartItem[] }
  | { status: "submitted"; items: CartItem[]; submittedAt: Date }
  | { status: "paid"; items: CartItem[]; submittedAt: Date; paidAt: Date }
  | { status: "shipped"; items: CartItem[]; trackingCode: string }
  | { status: "delivered"; items: CartItem[]; deliveredAt: Date };

type CartItem = { name: string; price: number; quantity: number };

// Transitions as functions — only valid transitions compile:
function submitOrder(order: Extract<OrderState, { status: "draft" }>): OrderState {
  return {
    status: "submitted",
    items: order.items,
    submittedAt: new Date(),
  };
}

function payOrder(order: Extract<OrderState, { status: "submitted" }>): OrderState {
  return {
    status: "paid",
    items: order.items,
    submittedAt: order.submittedAt,
    paidAt: new Date(),
  };
}

// submitOrder on an already paid order? Compile error!
// payOrder on a draft? Compile error!
```

> **Explain it to yourself:** Why is `Extract<OrderState, { status: "draft" }>`
> better than just using the concrete type directly? What happens when the type changes?
> **Key points:** Extract derives the type automatically | Changes to the union propagate | No manual synchronization needed

---

## Loading/Error/Success in React

The most common pattern in React applications:

```typescript annotated
// State type as a Discriminated Union
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// React hook that delivers type-safe state:
function useFetch<T>(url: string): FetchState<T> {
  // ... Implementation with useState/useEffect
  return { status: "idle" }; // Example
}

// Component with exhaustive rendering:
function UserList() {
  const state = useFetch<User[]>("/api/users");

  switch (state.status) {
    case "idle":
      return <p>Ready to load.</p>;
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorBanner message={state.error} />;
    case "success":
      return (
        <ul>
          {state.data.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      );
  }
}
```

**No more `data && !isLoading && !isError`.** The switch/case
covers all states, and TypeScript enforces completeness.

---

## Loading/Error/Success in Angular

The same pattern works with Angular Signals or NgRx too:

```typescript annotated
// State type (identical to React!)
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Angular signal-based service:
@Injectable({ providedIn: "root" })
class UserService {
  private state = signal<AsyncState<User[]>>({ status: "idle" });

  readonly userState = this.state.asReadonly();

  async loadUsers() {
    this.state.set({ status: "loading" });

    try {
      const users = await fetchUsers();
      this.state.set({ status: "success", data: users });
    } catch (e) {
      this.state.set({ status: "error", error: String(e) });
    }
  }
}

// Template with @switch (Angular 17+):
// @switch (userState().status) {
//   @case ("loading") { <app-spinner /> }
//   @case ("error")   { <app-error [message]="userState().error" /> }
//   @case ("success") { <app-user-list [users]="userState().data" /> }
// }
```

> **Note:** The state type is framework-agnostic. The same
> `AsyncState<T>` works in React, Angular, Vue, Svelte,
> and plain TypeScript. That's the strength of this pattern.

---

## Generic AsyncState with Transformation

In practice, you often want to transform the success value:

```typescript annotated
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

// Map over the success case:
function mapAsyncState<T, U>(
  state: AsyncState<T>,
  fn: (data: T) => U
): AsyncState<U> {
  if (state.status === "success") {
    return { status: "success", data: fn(state.data) };
  }
  return state; // idle, loading, error remain unchanged
}

// Usage:
const usersState: AsyncState<User[]> = { status: "success", data: users };
const namesState = mapAsyncState(usersState, users =>
  users.map(u => u.name)
);
// AsyncState<string[]> — just the names, same state wrapper
```

---

## Anti-Pattern: Nested Booleans

One last example of why Discriminated Unions are better:

```typescript annotated
// ANTI-PATTERN: Nested conditions
function renderOld(state: OldState) {
  if (state.isLoading) {
    if (state.data) {
      // Loading with stale data? What do we show?
    } else {
      // First load with no data
    }
  } else if (state.isError) {
    if (state.data) {
      // Error but stale data available?
    } else {
      // Error with no data
    }
  }
  // 8+ branches — and still not all cases covered!
}

// BETTER: One branch per state
function renderNew(state: AsyncState<string[]>) {
  switch (state.status) {
    case "idle": return null;
    case "loading": return "Loading...";
    case "error": return `Error: ${state.error}`;
    case "success": return state.data.join(", ");
  }
  // 4 branches — ALL cases covered!
}
```

> **Experiment:** Try creating the impossible state directly in the TypeScript Playground:
>
> ```typescript
> // BEFORE: Flat booleans
> type OldState = {
>   isLoading: boolean;
>   isError: boolean;
>   data: string[] | null;
>   error: string | null;
> };
>
> // Try: Can you make TypeScript reject this value?
> const impossibleOld: OldState = {
>   isLoading: true,
>   isError: true,
>   data: ["a", "b"],
>   error: "Oh no",
> };
>
> // AFTER: Discriminated Union
> type NewState =
>   | { status: "idle" }
>   | { status: "loading" }
>   | { status: "error"; error: string }
>   | { status: "success"; data: string[] };
>
> // Try creating the same impossible state:
> const impossibleNew: NewState = {
>   status: "loading",
>   // error: "Oh no", // <- What does TypeScript say?
>   // data: ["a", "b"], // <- And about this?
> };
> ```
>
> What is the fundamental difference in the TypeScript error messages?

---

## What you've learned

- **Impossible states** arise from flat boolean flags — with `n` flags there are `2^n` theoretical combinations, most of which are bugs
- **Discriminated Unions as state** model each state as its own variant with exactly the data that makes sense in that state
- **State machines** can be expressed as types and transition functions — `Extract<Union, Condition>` ensures only valid source states are accepted
- The **AsyncState\<T\>** pattern (idle/loading/error/success) is framework-agnostic and works identically in React, Angular, Vue, and plain TypeScript
- The `mapAsyncState` helper allows elegant transformation of the success value without boilerplate

**Core concept:** "Make impossible states impossible" — if your type can represent impossible states, they will eventually occur. Discriminated Unions eliminate entire classes of bugs by reducing the state space to exactly the valid combinations.

---

> **Pause point:** You can now model states cleanly.
> In the final section we'll look at advanced practical patterns:
> API responses, action types for Redux/NgRx, and event systems.
>
> Continue: [Section 06 - Practical Patterns](./06-praxis-patterns.md)