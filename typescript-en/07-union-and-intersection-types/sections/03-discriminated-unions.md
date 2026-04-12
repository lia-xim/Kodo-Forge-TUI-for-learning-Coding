# Section 3: Discriminated Unions — Algebraic Data Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Type Guards and Narrowing](./02-type-guards-und-narrowing.md)
> Next section: [04 - Intersection Types](./04-intersection-types.md)

---

## What you'll learn here

- What a **Discriminated Union** (Tagged Union) is and why it's so powerful
- How to use a common **tag property** as a discriminator
- Why the **Exhaustive Check** with `never` is your code safety net
- What **Algebraic Data Types** (ADTs) are and why TypeScript supports them

---

## The Problem: Unstructured Unions

Imagine you're modeling different shapes. With simple union types, things
quickly become unclear:

```typescript
interface Circle {
  radius: number;
}
interface Rectangle {
  width: number;
  height: number;
}

// Problem: How do I distinguish Circle from Rectangle?
function area(shape: Circle | Rectangle): number {
  if ("radius" in shape) {
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}
// Works... but what if an object has BOTH?
// What if a new shape type is added?
```

The `in` check works, but it's **fragile**. There's a much better solution.

---

## The Solution: Discriminated Unions

A **Discriminated Union** (also called a "Tagged Union") has a common
property — the **discriminator** or **tag** — that tells TypeScript
which type is present:

```typescript annotated
interface Circle {
  kind: "circle";     // <── Tag: a string literal type
  radius: number;
}
interface Rectangle {
  kind: "rectangle";  // <── Tag: another string literal type
  width: number;
  height: number;
}
interface Triangle {
  kind: "triangle";   // <── Tag: yet another value
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;
//   ^^^^^
//   Discriminated Union: all members have "kind" as their tag
```

Now TypeScript can **automatically narrow** the type via the tag:

```typescript annotated
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: Circle — TypeScript knows it through the tag!
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // shape: Rectangle
      return shape.width * shape.height;
    case "triangle":
      // shape: Triangle
      return (shape.base * shape.height) / 2;
  }
}
```

> 📖 **Background: Algebraic Data Types (ADTs)**
>
> Discriminated Unions are TypeScript's version of **Algebraic Data
> Types** (ADTs), a concept from functional programming.
> In functional languages they are called:
>
> - **Haskell:** `data Shape = Circle Float | Rectangle Float Float | Triangle Float Float`
> - **Rust:** `enum Shape { Circle(f64), Rectangle(f64, f64), Triangle(f64, f64) }`
> - **Scala:** `sealed trait Shape` + `case class Circle(...)` etc.
> - **F#:** `type Shape = Circle of float | Rectangle of float * float`
>
> The core idea: a type is the **sum** (OR) of its variants.
> Each variant carries its own data. The compiler enforces that all
> variants are handled. In type theory this is called a **Sum Type**
> (as opposed to **Product Types** like interfaces/tuples, which
> combine fields).

---

## The Exhaustive Check with never

The most powerful feature of Discriminated Unions: TypeScript can
verify that you've handled **all cases**:

```typescript annotated
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // When all cases are covered, shape is "never" here
      const _exhaustive: never = shape;
      //                         ^^^^^
      //    OK: shape is never, because all cases are handled
      return _exhaustive;
  }
}
```

What happens when someone adds a new shape type?

```typescript
// Someone adds "pentagon":
interface Pentagon {
  kind: "pentagon";
  sideLength: number;
}
type Shape = Circle | Rectangle | Triangle | Pentagon;

// NOW TypeScript reports an ERROR in the default branch:
// Type 'Pentagon' is not assignable to type 'never'.
//
// The compiler ENFORCES that you handle the new case!
```

> 💭 **Think about it:** Why does the Exhaustive Check work? What happens
> internally to the type in the default branch?
>
> **Answer:** TypeScript eliminates a union member with each `case`.
> After all `case` branches, no members remain — the type becomes
> `never` (the empty set). When a new member is added and no `case`
> exists for it, the type in the `default` branch is no longer
> `never`, but the new type — and the assignment to `never` fails.

### The assertNever Helper Function

Instead of writing the `never` check manually, a helper function is common:

```typescript annotated
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle":  return (shape.base * shape.height) / 2;
    default:          return assertNever(shape);
    //                       ^^^^^^^^^^^^^^^^
    //   Compile error when a case is missing + runtime protection
  }
}
```

> 🧠 **Explain to yourself:** Why does `assertNever` return type `never`
> AND throw an error? What purpose does each aspect serve?
> **Key points:** never-return: function never returns | throw: runtime protection |
> never-parameter: compile-time check that all cases are handled

---

## Practical Example: API Responses

Discriminated Unions are **the** pattern for API responses:

```typescript annotated
// ─── API Response as Discriminated Union ─────────────────
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; code: number };

function renderUsers(response: ApiResponse<User[]>): string {
  switch (response.status) {
    case "loading":
      return "Loading...";
    case "success":
      // response.data only exists when status === "success"
      return response.data.map(u => u.name).join(", ");
    case "error":
      // response.error and response.code only exist when status === "error"
      return `Error ${response.code}: ${response.error}`;
  }
}
```

You'll see this pattern everywhere:

```typescript
// React: useQuery, SWR, TanStack Query
// Angular: NgRx Actions, HttpClient States
// General: Result<T, E> pattern, Option<T>, Either<L, R>
```

---

## Rules for Good Discriminated Unions

1. **The discriminator must be a literal type** (`"circle"`, not `string`)
2. **All members must have the same property name** (e.g. `kind`, `type`, `status`)
3. **The literal values must be unique** (no duplicate `"circle"`)
4. **Convention:** The most common tag names are `kind`, `type`, `tag`, `status`, `_tag`

```typescript
// BAD: discriminator is string (too broad)
interface Bad { kind: string; }

// GOOD: discriminator is a literal
interface Good { kind: "circle"; }

// BAD: different property names
interface A { type: "a"; }
interface B { kind: "b"; }  // type vs kind — no automatic narrowing!

// GOOD: same property name
interface A { kind: "a"; }
interface B { kind: "b"; }
```

> ⚡ **Practical tip:** In Angular projects with NgRx, actions are already
> Discriminated Unions:
> ```typescript
> // NgRx Action Pattern:
> const loadUsers = createAction('[Users] Load');
> const loadUsersSuccess = createAction('[Users] Load Success', props<{ users: User[] }>());
> const loadUsersFailure = createAction('[Users] Load Failure', props<{ error: string }>());
> // The action type is automatically the discriminator
> ```

---

## Discriminated Unions with if Instead of switch

You don't necessarily need `switch`. `if` chains work too:

```typescript
function describe(shape: Shape): string {
  if (shape.kind === "circle") {
    return `Circle with radius ${shape.radius}`;
  }
  if (shape.kind === "rectangle") {
    return `Rectangle ${shape.width}x${shape.height}`;
  }
  // shape: Triangle (the only remaining option)
  return `Triangle with base ${shape.base}`;
}
```

**Recommendation:** Use `switch` with an exhaustive check when you want
to explicitly handle **all** cases. Use `if` when you only need
**specific** cases.

---

## What You've Learned

- **Discriminated Unions** use a common **tag property** as a discriminator
- TypeScript **automatically narrows** the type in switch/if based on the tag
- The **Exhaustive Check** with `never` enforces handling of all cases
- `assertNever` provides **compile-time AND runtime protection**
- Discriminated Unions are TypeScript's version of **Algebraic Data Types**

**Key Concept to Remember:** Discriminated Unions + Exhaustive Check = compiler-guaranteed completeness. When you add a new case, TypeScript shows you EVERY location that needs to be updated.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> function assertNever(value: never): never {
>   throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
> }
>
> interface Circle    { kind: "circle";    radius: number; }
> interface Rectangle { kind: "rectangle"; width: number; height: number; }
> interface Triangle  { kind: "triangle";  base: number; height: number; }
>
> type Shape = Circle | Rectangle | Triangle;
>
> function area(shape: Shape): number {
>   switch (shape.kind) {
>     case "circle":    return Math.PI * shape.radius ** 2;
>     case "rectangle": return shape.width * shape.height;
>     case "triangle":  return (shape.base * shape.height) / 2;
>     default:          return assertNever(shape);
>   }
> }
>
> // Now add Pentagon:
> // interface Pentagon { kind: "pentagon"; sideLength: number; }
> // type Shape = Circle | Rectangle | Triangle | Pentagon;
> // Observe: TypeScript immediately reports an error in the default branch!
> ```
> At which point in the code does TypeScript report an error after you
> add `Pentagon`? Why is it the `default` branch?

---

> **Pause Point** — Discriminated Unions are one of the most important
> patterns in TypeScript. Let that sink in before you continue.
>
> Continue with: [Section 04: Intersection Types](./04-intersection-types.md)