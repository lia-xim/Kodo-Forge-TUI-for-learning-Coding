# Section 6: Exhaustive Checks

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Type Predicates](./05-type-predicates.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- Why the `never` type is the perfect safety net for union types
- The `assertNever` pattern for exhaustive switch statements
- Exhaustive if-chains and their limitations
- How to automatically get compiler errors when union types grow

---

## The Problem: Forgotten Cases

Imagine you have a union type with several possibilities.
Everything works — until someone adds a new value:

```typescript
type AnimalKind = "dog" | "cat" | "bird";

function describe(animal: AnimalKind): string {
  switch (animal) {
    case "dog":
      return "Barks and fetches";
    case "cat":
      return "Purrs and chases mice";
    case "bird":
      return "Sings and flies";
  }
}

// All good! But now someone adds:
// type AnimalKind = "dog" | "cat" | "bird" | "fish";
// The switch function has no case for "fish" —
// but TypeScript reports NO error!
// The function implicitly returns undefined for "fish".
```

> 💭 **Think about it:** Why doesn't TypeScript report an error here? The
> return type is `string` — and `undefined` is not a `string`.
>
> **Answer:** TypeScript analyzes the switch and sees that all
> current cases are covered. When a new value is added,
> the analysis changes — but only if TypeScript recognizes the switch as
> non-exhaustive. With `noImplicitReturns` in tsconfig,
> TypeScript would warn here, but that isn't always sufficient.

---

## The Solution: never as a Safety Net

Remember `never` from lesson 02? The bottom type that nothing
can be assigned to? That's exactly what makes it the perfect safety net:

```typescript annotated
type AnimalKind = "dog" | "cat" | "bird";

function describe(animal: AnimalKind): string {
  switch (animal) {
    case "dog":
      return "Barks and fetches";
    case "cat":
      return "Purrs and chases mice";
    case "bird":
      return "Sings and flies";
    default:
      // If ALL cases are covered, animal is never here
      const _exhaustive: never = animal;
      // ^ If a case is missing, animal is NOT never and
      //   TypeScript reports an error!
      return _exhaustive;
  }
}
```

### What happens when you add "fish"?

```typescript
type AnimalKind = "dog" | "cat" | "bird" | "fish";

function describe(animal: AnimalKind): string {
  switch (animal) {
    case "dog":
      return "Barks and fetches";
    case "cat":
      return "Purrs and chases mice";
    case "bird":
      return "Sings and flies";
    default:
      const _exhaustive: never = animal;
      // ^ ERROR! Type '"fish"' is not assignable to type 'never'.
      //   TypeScript tells you EXACTLY which case is missing!
      return _exhaustive;
  }
}
```

> 📖 **Background: Exhaustive Checks in Other Languages**
>
> The idea of exhaustive pattern matching comes from functional languages:
> - **Rust**: `match` is exhaustive by default — the compiler
>   enforces that all variants are handled.
> - **Haskell**: `-Wincomplete-patterns` warns on missing cases.
> - **Kotlin**: `when` with sealed classes is exhaustive.
> - **Java 17+**: Pattern matching in switch with sealed classes.
>
> TypeScript's approach with `never` is uniquely elegant: it uses the
> type system itself as a safety net, rather than requiring a separate feature.
> Anders Hejlsberg called this "making illegal states
> unrepresentable" — a concept from type theory.

---

## The assertNever Pattern

Instead of repeating the `never` assignment in every function, extract
it into a helper function:

```typescript annotated
function assertNever(value: never): never {
  // ^ Parameter: never — only accepts if all cases are handled
  // ^ Return: never — the function never returns (throws)
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

type AnimalKind = "dog" | "cat" | "bird";

function describe(animal: AnimalKind): string {
  switch (animal) {
    case "dog":
      return "Barks and fetches";
    case "cat":
      return "Purrs and chases mice";
    case "bird":
      return "Sings and flies";
    default:
      return assertNever(animal);
      // ^ Compile error if a case is missing
      // ^ Runtime error as a last safety net
  }
}
```

### Why assertNever is better than the bare never check

1. **Runtime protection**: If an unexpected value arrives at runtime
   (e.g. from an API), you get a clear error instead of `undefined`.
2. **Reusable**: One function for all exhaustive checks.
3. **Clear intent**: The name `assertNever` communicates "nothing should ever reach here".

---

## Exhaustive if-Chains

Not only switch works — you can also make if/else chains exhaustive:

```typescript annotated
type TrafficLight = "red" | "yellow" | "green";

function action(color: TrafficLight): string {
  if (color === "red") {
    return "Stop";
  } else if (color === "yellow") {
    return "Caution";
  } else if (color === "green") {
    return "Go";
  } else {
    // color: never — all cases covered
    return assertNever(color);
  }
}
```

---

## Exhaustive Checks with Discriminated Unions

Discriminated unions (a shared field with different values)
are the ideal use case:

```typescript annotated
interface LoadingState {
  type: "loading";
}

interface SuccessState {
  type: "success";
  data: string[];
}

interface ErrorState {
  type: "error";
  message: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

function render(state: AppState): string {
  switch (state.type) {
    case "loading":
      return "<Spinner />";
    case "success":
      return `<List items={${state.data.length}} />`;
    case "error":
      return `<Error: ${state.message} />`;
    default:
      return assertNever(state);
      // ^ If someone adds a new state (e.g. "empty"),
      //   TypeScript reports an error here
  }
}
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function assertNever(value: never): never {
>   throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
> }
>
> type AppState =
>   | { type: "loading" }
>   | { type: "success"; data: string[] }
>   | { type: "error"; message: string };
>
> function render(state: AppState): string {
>   switch (state.type) {
>     case "loading": return "<Spinner />";
>     case "success": return `<List items={${state.data.length}} />`;
>     case "error": return `<Error: ${state.message} />`;
>     default: return assertNever(state);
>   }
> }
> ```
> Add a new state: `| { type: "empty" }`. What error appears in the `default` branch, and what is the exact TypeScript error message?

---

## In Practice: Exhaustive Checks in React and Angular

```typescript
// React: Rendering based on state
function StatusBadge({ status }: { status: "active" | "inactive" | "blocked" }) {
  switch (status) {
    case "active":   return <span className="green">Active</span>;
    case "inactive": return <span className="gray">Inactive</span>;
    case "blocked":  return <span className="red">Blocked</span>;
    default:         return assertNever(status);
  }
}

// Angular: Service method with state machine
function nextState(current: "draft" | "review" | "done"): string {
  switch (current) {
    case "draft":  return "review";
    case "review": return "done";
    case "done":   return "archived";
    default:       return assertNever(current);
  }
}
```

> 🧠 **Explain it to yourself:** Why is an assertNever in the default better
> than having no default at all? What happens if the union type comes from an external
> API and an unexpected value arrives?
> **Key points:** Compile-time protection when code changes (new union value) |
> Runtime protection when the API changes (unexpected value) |
> Without assertNever: silent undefined return | With assertNever:
> clear error with the unexpected value

---

## Summary: All Narrowing Mechanisms

| Mechanism | Section | Use case |
|---|---|---|
| `typeof` | 02 | Primitive types (string, number, boolean, ...) |
| `instanceof` | 03 | Class instances |
| `in` | 03 | Property checks, discriminated unions |
| `===`, `!==` | 04 | Equality, null checks, literal narrowing |
| `==`, `!=` null | 04 | null AND undefined simultaneously |
| Truthiness | 04 | Quick null/undefined check (watch out for 0, "") |
| `is` (Type Predicate) | 05 | Custom reusable type guards |
| `asserts` | 05 | Preconditions that must hold |
| `filter()` (TS 5.5) | 05 | Automatic narrowing in array operations |
| `never` (Exhaustive) | 06 | Safety net for all union cases |

---

## What you learned

- `never` is the bottom type — nothing can be assigned to it, which makes it the perfect safety net
- The `assertNever` pattern provides compile-time protection AND runtime protection
- Exhaustive checks work with both switch AND if/else chains
- Discriminated unions benefit especially from exhaustive checks
- A missing case produces an immediate compile error with a clear error message

**Key concept to remember:** assertNever is your double safety net.
It catches forgotten cases at compile time AND unexpected values at
runtime. There is no reason NOT to use it.

---

## Lesson 11 complete!

You've learned all of TypeScript's narrowing mechanisms — from the
simple typeof check to the exhaustive assertNever. Narrowing is the
bridge between general types and concrete, safe operations.

**Next steps:**
1. Test yourself with the quiz
2. Use the cheat sheet as a reference

> **Next lesson:** 12 - Generics — How do you write functions and types
> that work with ANY type, without losing type safety?