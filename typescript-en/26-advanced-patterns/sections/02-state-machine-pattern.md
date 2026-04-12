# Section 2: The State Machine Pattern

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Builder Pattern](./01-builder-pattern.md)
> Next section: [03 - Phantom Types](./03-phantom-types.md)

---

## What you'll learn here

- How to model **state machines** in the TypeScript type system
- Why **impossible state transitions** can be prevented at compile time
- The difference between **runtime** and **compile-time** state machines
- How **discriminated unions** and **method overloads** make state machines type-safe

---

## Background: State Machines Everywhere

> **Feature Origin Story: Finite State Machines**
>
> Finite State Machines (FSMs) were formalized in 1943 by Warren McCulloch and
> Walter Pitts — originally as a model for neural networks. Later they became
> the standard tool in computer science: compilers, network protocols, UI logic.
>
> In frontend development, FSMs experienced a revival through libraries
> like XState (2018, David Khourshid). The insight: most bugs
> in UI code arise from **impossible states** — a form that is
> simultaneously "loading" and "error", a modal that shows "open" and
> "closing" at the same time.
>
> TypeScript can **forbid such impossible states at compile time**.
> That's powerful — and elegantly achievable in few other mainstream languages.

---

## The Problem: Boolean Flags and Impossible States

```typescript annotated
// ANTI-PATTERN: State as boolean flags
interface FetchState {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}

// Problem: Impossible combinations are allowed!
const broken: FetchState = {
  isLoading: true,   // Loading...
  isError: true,     // ...and simultaneously an error?
  data: [],          // ...and simultaneously data?
  error: "Timeout",  // Everything at once — makes no sense!
};
// ^ TypeScript does NOT complain. All boolean combinations are valid.
```

> 🧠 **Explain to yourself:** How many possible combinations do
> 4 boolean flags have? How many of those are meaningful states?
>
> **Key points:** 4 booleans = 2^4 = 16 combinations | Meaningful
> states: idle, loading, success, error = 4 | 12 out of 16 combinations
> are impossible states | The type system allows all of them

---

## Solution: Discriminated Union as a State Machine

```typescript annotated
// BETTER: Each state is its own type
type FetchState<T> =
  | { status: "idle" }
  // ^ Initial state: nothing has happened
  | { status: "loading" }
  // ^ Request is running — no data, no error
  | { status: "success"; data: T }
  // ^ Success: data is GUARANTEED to exist
  | { status: "error"; error: string; retryCount: number }
  // ^ Error: error is GUARANTEED to exist, retryCount for retrying

// Now it is IMPOSSIBLE to be loading AND error simultaneously:
const state: FetchState<User[]> = { status: "loading" };
// state.data  // COMPILE-ERROR: data does not exist when status="loading"
// state.error // COMPILE-ERROR: error does not exist when status="loading"

// TypeScript narrows automatically:
function render(state: FetchState<User[]>): string {
  switch (state.status) {
    case "idle":    return "Ready";
    case "loading": return "Loading...";
    case "success": return `${state.data.length} users loaded`;
    // ^ TypeScript knows: state.data exists because status="success"
    case "error":   return `Error: ${state.error} (Attempt ${state.retryCount})`;
    // ^ TypeScript knows: state.error and retryCount exist
  }
}
```

> 💭 **Think about it:** What is the difference between a discriminated
> union and an enum for states? Why is the union more powerful?
>
> **Answer:** An enum can only carry the state name. A discriminated
> union can have **additional data per state**: "success" has `data`,
> "error" has `error`. The enum would have to store this data
> separately — without a type guarantee that it exists in the right state.

---

## Making State Transitions Type-Safe
<!-- section:summary -->
The discriminated union prevents impossible states. But what about

<!-- depth:standard -->
The discriminated union prevents impossible states. But what about
impossible **transitions**? For example: jumping from "idle" directly
to "success" (without "loading" in between).

```typescript annotated
// Type-level transition map
type Transitions = {
  idle:    "loading";
  // ^ From idle you may only go to loading
  loading: "success" | "error";
  // ^ From loading to success OR error
  success: "idle";
  // ^ From success back to idle
  error:   "loading" | "idle";
  // ^ From error: retry (loading) or reset (idle)
};

// Type-safe transition function
function transition<Current extends keyof Transitions>(
  current: Current,
  next: Transitions[Current]
  // ^ 'next' is constrained to the allowed transitions!
): Transitions[Current] {
  return next;
}

transition("idle", "loading");    // OK
transition("loading", "success"); // OK
transition("loading", "error");   // OK
// transition("idle", "success"); // COMPILE-ERROR!
// ^ Going from idle to success is NOT an allowed transition
// transition("success", "error"); // COMPILE-ERROR!
// ^ Going from success to error is NOT an allowed transition
```

<!-- depth:vollstaendig -->
> **Experiment:** Extend the transitions with a new "retrying" state.
> Consider:
>
> ```typescript
> // 1. From which states may you switch to "retrying"?
> // 2. Where may you switch from "retrying"?
> // 3. How does the transitions map change?
>
> type ExtendedTransitions = {
>   idle:     "loading";
>   loading:  "success" | "error";
>   success:  "idle";
>   error:    "retrying" | "idle";     // error -> retrying NEW
>   retrying: "success" | "error";     // retrying behaves like loading
> };
>
> // Check: Can you go from "retrying" directly to "idle"?
> // Answer: No — you must go through success or error.
> ```

---

<!-- /depth -->
## State Machine as a Class with Method Guards
<!-- section:summary -->
For more complex state machines, you can restrict the allowed methods

<!-- depth:standard -->
For more complex state machines, you can restrict the allowed methods
per state:

```typescript annotated
// Each state has its own methods
interface IdleState {
  status: "idle";
  fetch(): LoadingState;
  // ^ Only allowed action: start fetching
}

interface LoadingState {
  status: "loading";
  resolve(data: User[]): SuccessState;
  // ^ Success: set data
  reject(error: string): ErrorState;
  // ^ Error: set error
  // No fetch()! You can't load twice.
}

interface SuccessState {
  status: "success";
  data: User[];
  reset(): IdleState;
  // ^ Back to the start
}

interface ErrorState {
  status: "error";
  error: string;
  retry(): LoadingState;
  // ^ Try again
  reset(): IdleState;
  // ^ Give up and go back
}

type AnyState = IdleState | LoadingState | SuccessState | ErrorState;
```

> ⚡ **In your Angular project** you know state machines from the NgRx store:
>
> ```typescript
> // NgRx reducer — essentially a state machine:
> const reducer = createReducer(
>   initialState,
>   on(loadUsers, (state) => ({ ...state, status: 'loading' as const })),
>   on(loadUsersSuccess, (state, { users }) => ({
>     ...state, status: 'success' as const, data: users
>   })),
>   on(loadUsersFailure, (state, { error }) => ({
>     ...state, status: 'error' as const, error
>   })),
> );
> // ^ The discriminated union makes the state type-safe.
> //   NgRx does NOT enforce the order of actions, though!
> ```
>
> In React you often use `useReducer` for the same pattern:
>
> ```typescript
> const [state, dispatch] = useReducer(fetchReducer, { status: "idle" });
> // dispatch({ type: "FETCH" }) → loading
> // dispatch({ type: "SUCCESS", data }) → success
> ```

---

<!-- /depth -->
## Practical Example: Form Wizard
<!-- section:summary -->
A typical use case: a multi-step form where

<!-- depth:standard -->
A typical use case: a multi-step form where each step allows
certain actions:

```typescript
type WizardState =
  | { step: "personal"; name: string; email: string }
  | { step: "address"; address: string; city: string }
  | { step: "payment"; cardNumber: string }
  | { step: "review"; allData: CompleteFormData }
  | { step: "submitted"; confirmationId: string };

type WizardTransitions = {
  personal: "address";
  address:  "payment" | "personal"; // going back is allowed
  payment:  "review" | "address";   // going back is allowed
  review:   "submitted" | "payment"; // going back is allowed
  submitted: never; // Terminal state — no transition possible
};
```

---

<!-- /depth -->
## What you've learned

- **Boolean flags** for states produce impossible combinations (2^n states instead of n)
- **Discriminated unions** model each state as its own type with state-specific data
- **Transition maps** as a type can prevent impossible state transitions at compile time
- **Method guards** per state prevent the wrong action from being executed in the wrong state

> 🧠 **Explain to yourself:** Why is `{ isLoading: boolean; isError: boolean }`
> an anti-pattern? What is the mathematical explanation for the explosion
> of impossible states?
>
> **Key points:** n booleans = 2^n combinations | Most of them are
> invalid | Discriminated union: exactly n states | No invalid
> state is possible

**Core concept to remember:** "Make impossible states impossible" — don't
check at runtime, forbid it in the type. If the type doesn't allow it,
the bug cannot exist.

---

> **Pause point** — State machines are a powerful tool.
> Next topic: Phantom Types — types that are invisible at runtime.
>
> Continue with: [Section 03: Phantom Types](./03-phantom-types.md)