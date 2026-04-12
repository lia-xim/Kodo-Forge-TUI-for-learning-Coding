# Section 3: instanceof and in

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - typeof Guards](./02-typeof-guards.md)
> Next section: [04 - Equality and Truthiness](./04-equality-und-truthiness.md)

---

## What you'll learn here

- How `instanceof` works as a type guard for class instances
- How the `in` operator checks properties and narrows types
- When to use `instanceof` and when to use `in`
- Why `instanceof` doesn't work with interfaces

---

## instanceof: Narrowing for Classes

The `instanceof` operator checks whether an object is an instance of a
particular class (or one of its subclasses). TypeScript uses this
for narrowing:

```typescript annotated
function formatDate(value: string | Date) {
  if (value instanceof Date) {
    // ^ instanceof check: value is now Date
    return value.toLocaleDateString("en-US");
    // ^ all Date methods are available
  }
  // value is here: string
  return value;
}

console.log(formatDate(new Date()));    // "3/31/2026"
console.log(formatDate("2026-03-31"));  // "2026-03-31"
```

### instanceof with Inheritance

`instanceof` also recognizes subclasses:

```typescript annotated
class AppError {
  constructor(public message: string) {}
}

class NetworkError extends AppError {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(public field: string, message: string) {
    super(message);
  }
}

function handleError(error: AppError) {
  if (error instanceof NetworkError) {
    // error: NetworkError — statusCode is available
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
  } else if (error instanceof ValidationError) {
    // error: ValidationError — field is available
    console.log(`Field "${error.field}": ${error.message}`);
  } else {
    // error: AppError — only the base properties
    console.log(`Error: ${error.message}`);
  }
}
```

> 📖 **Background: How instanceof works under the hood**
>
> `instanceof` checks the prototype chain of an object. It looks for whether
> `Class.prototype` appears anywhere in the object's prototype chain.
> This works ONLY with classes and constructor functions — that is, things
> that exist at runtime as JavaScript objects.
>
> Interfaces and type aliases only exist at compile time (type erasure!)
> and have no prototype. That's why instanceof cannot check them.

---

## Why instanceof Doesn't Work with Interfaces

This is a fundamental point that trips up many TypeScript beginners:

```typescript
interface User {
  name: string;
  email: string;
}

function process(data: unknown) {
  // ERROR! Interfaces don't exist at runtime:
  // if (data instanceof User) {  // Error: 'User' only refers to a type
  //   ...
  // }
}
```

**Interfaces disappear through type erasure.** At runtime there is no
`User` object to check against. For that you need the
`in` operator or custom type guards (Section 05).

> 💭 **Think about it:** If you have an interface `User` and a class
> `UserClass` — what is the practical difference for narrowing?
>
> **Answer:** A class exists at runtime as a constructor function
> and can be checked with `instanceof`. An interface is only a
> compile-time construct and disappears entirely. For interfaces you must
> check properties (in operator) or write custom type guards.

---

## The in Operator: Narrowing via Properties

The `in` operator checks whether an object has a particular property.
TypeScript uses this for narrowing — especially with **discriminated unions**:

```typescript annotated
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  if ("radius" in shape) {
    // ^ in check: shape has "radius" → must be Circle
    return Math.PI * shape.radius ** 2;
    // ^ shape is Circle here — radius is available
  } else {
    // shape must be Rectangle
    return shape.width * shape.height;
    // ^ shape is Rectangle here
  }
}
```

### in Operator with Discriminated Unions

The `in` operator is especially powerful with **discriminated unions** — that is,
unions that share a common property with different literal values:

```typescript annotated
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: string[];
}

interface ErrorState {
  status: "error";
  errorMessage: string;
}

type State = LoadingState | SuccessState | ErrorState;

function showState(state: State) {
  if ("data" in state) {
    // state: SuccessState — only this one has "data"
    console.log(`${state.data.length} entries loaded`);
  } else if ("errorMessage" in state) {
    // state: ErrorState — only this one has "errorMessage"
    console.log(`Error: ${state.errorMessage}`);
  } else {
    // state: LoadingState
    console.log("Loading...");
  }
}
```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> interface Circle { kind: "circle"; radius: number; }
> interface Rectangle { kind: "rectangle"; width: number; height: number; }
> interface Triangle { kind: "triangle"; base: number; height: number; }
>
> type Shape = Circle | Rectangle | Triangle;
>
> function area(shape: Shape): number {
>   if ("radius" in shape) {
>     return Math.PI * shape.radius ** 2;
>   } else if ("width" in shape) {
>     return shape.width * shape.height;
>   } else {
>     return (shape.base * shape.height) / 2;
>   }
> }
> ```
> Add a fourth type to the union (e.g. `Ellipse` with `semiAxisA` and `semiAxisB`). How does the narrowing logic change? What errors arise if an `in` check is missing?

---

## in Operator: Subtleties

### Optional Properties

Be careful with optional properties — they can be `undefined`, but
still exist on the object:

```typescript annotated
interface WithName {
  name: string;
  email?: string;  // optional!
}

interface WithoutName {
  id: number;
}

function identify(obj: WithName | WithoutName) {
  if ("name" in obj) {
    // obj: WithName — name exists
    console.log(obj.name);
  }
  if ("email" in obj) {
    // obj: WithName — email exists (but can be undefined!)
    console.log(obj.email?.toUpperCase());
    // ^ optional chaining needed because email is optional
  }
}
```

### in Operator with unknown

The `in` operator also works with `unknown`, as long as you first narrow
to `object`:

```typescript annotated
function hasName(value: unknown): boolean {
  if (typeof value === "object" && value !== null && "name" in value) {
    // ^ three checks: (1) is object? (2) not null? (3) has "name"?
    return true;
  }
  return false;
}
```

---

## When to Use What?

| Situation | Tool | Example |
|---|---|---|
| Primitive types | `typeof` | `typeof x === "string"` |
| Class instances | `instanceof` | `x instanceof Date` |
| Interface distinction | `in` | `"radius" in shape` |
| Discriminated unions | `in` or property check | `"data" in state` |
| null check | Equality | `x === null` |
| Arrays | `Array.isArray` | `Array.isArray(x)` |
| Complex logic | Custom type guard | `isUser(x)` (Section 05) |

---

## What You Learned

- `instanceof` narrows to classes and their subclasses — works only with runtime constructs
- `instanceof` does NOT work with interfaces or type aliases (type erasure!)
- The `in` operator checks whether a property exists and narrows accordingly
- `in` is especially powerful for discriminated unions
- For `in` with `unknown` you must first narrow to `object` (not null)

> 🧠 **Explain it to yourself:** Why can `instanceof` not work with interfaces?
> What does this have to do with type erasure?
> **Key points:** Interfaces only exist at compile time | They are removed
> during compilation | At runtime there is no interface object |
> instanceof needs a runtime object (prototype chain)

**Core concept to remember:** `typeof` for primitives, `instanceof` for
classes, `in` for interfaces/properties. Three tools, three use cases.

---

> **Pause point** — You now know the three most important narrowing operators.
> The next section shows you finer tools: equality and truthiness.
>
> Continue with: [Section 04: Equality and Truthiness](./04-equality-und-truthiness.md)