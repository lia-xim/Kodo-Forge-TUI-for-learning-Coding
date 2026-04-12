# Section 1: Function Type Basics

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Optional and Default Parameters](./02-optionale-und-default-parameter.md)

---

## What you'll learn here

- How to annotate **parameter types** and **return types** in TypeScript
- The difference between **Function Declarations**, **Function Expressions**, and **Arrow Functions**
- Why `void` as a return type means something different from `undefined`
- How **Function Type Expressions** work as standalone types

---

## Functions as Contracts

Functions are the heart of every application. In JavaScript they are
extremely flexible — perhaps too flexible. TypeScript turns that
flexibility into a **precise contract**:

```typescript annotated
function addiere(a: number, b: number): number {
//                ^^^^^^^^^  ^^^^^^^^^   ^^^^^^
//                Param 1    Param 2     Return type
  return a + b;
}
```

This contract says: "Give me two numbers, and I'll give you a number back."
TypeScript enforces this on **both sides** — both at the call site and
in the implementation.

```typescript
addiere(1, 2);        // OK
addiere("1", "2");    // Error! string is not number
addiere(1);           // Error! Expected 2 arguments, received: 1
addiere(1, 2, 3);     // Error! Expected 2 arguments, received: 3
```

> 💭 **Think about it:** In JavaScript, `addiere(1)` and `addiere(1, 2, 3)` would both
> work (the second argument would be `undefined`, the third would be ignored).
> Why is TypeScript stricter here?
>
> **Answer:** Because a mismatched argument count is almost always a bug.
> JavaScript's tolerance is a historical artifact — TypeScript
> catches these errors before they reach production.

---

## Three Ways to Write Functions

### 1. Function Declaration

```typescript annotated
function multiply(a: number, b: number): number {
//       ^^^^^^^^ Name is part of the declaration
  return a * b;
}
// Gets "hoisted" — can be called before the declaration
```

### 2. Function Expression

```typescript annotated
const multiply = function(a: number, b: number): number {
//    ^^^^^^^^   ^^^^^^^^ Variable receives an anonymous function
  return a * b;
};
// NO hoisting — must be declared before it's called
```

### 3. Arrow Function

```typescript annotated
const multiply = (a: number, b: number): number => {
//                                        ^^^^^^ Return type goes BEFORE the arrow
  return a * b;
};

// Shorthand for a single expression — implicit return:
const double = (n: number): number => n * 2;
//                                    ^^^^^ Value is returned directly
```

> 📖 **Background: Why Arrow Functions?**
>
> Arrow Functions were introduced in ES2015. The main motivation wasn't
> the shorter syntax, but **lexical `this`**: Arrow Functions
> inherit `this` from their surrounding context instead of binding it themselves.
> This solved one of the oldest and most confusing problems in JavaScript.
> We'll cover it in depth in Section 5.
>
> Fun fact: The arrow `=>` comes from lambda calculus notation (1930s,
> Alonzo Church). In Haskell you write `\x -> x + 1`, in ML `fn x => x + 1`.
> JavaScript went with `=>` — following C# before it.

---

## Return Type: Explicit or Inferred?

TypeScript **infers** the return type automatically:

```typescript
function greet(name: string) {
//                           ^ no return type specified
  return `Hallo, ${name}!`;
}
// TypeScript infers: (name: string) => string
```

**When should you specify the return type explicitly?**

| Situation | Recommendation | Reason |
|---|---|---|
| Private helper function | Let it be inferred | Less boilerplate |
| Public API / exported function | Specify explicitly | Documentation + contract safety |
| Complex function with many branches | Specify explicitly | Prevents accidental type changes |
| Recursive function | **Must** be explicit | TypeScript cannot infer the type |

```typescript
// Recursive function: return type is REQUIRED
function fakultaet(n: number): number {
//                            ^^^^^^^^ MUST be specified!
  if (n <= 1) return 1;
  return n * fakultaet(n - 1);
}
```

> 🧠 **Explain to yourself:** Why can't TypeScript infer the return type of a recursive function? What would the compiler need to do, and why does that create a circular problem?
> **Key points:** The function's type depends on its return value | The return value contains a call to the function itself | The compiler would need the type it's currently determining | Circular dependency

---

## void — "No Meaningful Return Value"

```typescript
function logMessage(msg: string): void {
  console.log(msg);
  // No return needed — or: return;
  // NOT: return undefined;  <-- that would be type 'undefined', not 'void'
}
```

**The critical difference:**

```typescript annotated
// void: "The return value is irrelevant"
function doSomething(): void { /* ... */ }

// undefined: "Returns the concrete value undefined"
function getNothing(): undefined { return undefined; }

// void cannot be assigned to undefined:
const result: undefined = doSomething();
//    ^^^^^^ Error! void is not undefined
```

> 🔍 **Deeper knowledge: Why this distinction?**
>
> `void` as a return type has a special meaning with callbacks.
> A function of type `() => void` **is allowed** to return a value —
> the value is simply ignored. This is intentional, so that
> e.g. `arr.forEach(item => arr.push(item))` works:
> `push` returns `number`, but `forEach` expects `() => void`.
> We'll explore this further in Section 4.

---

## Function Type Expressions

Functions are **first-class citizens** in JavaScript — they are values.
And like any value, they need a type:

```typescript annotated
// Function Type Expression: (Parameters) => Return
type MathOperation = (a: number, b: number) => number;
//                    ^^^^^^^^^^^^^^^^^^^^^^    ^^^^^^
//                    Parameter list             Return type

const add: MathOperation = (a, b) => a + b;
//   ^^^   ^^^^^^^^^^^^^
//   Variable has the type  TypeScript knows a and b are number automatically

const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;
```

**Important:** The parameter names in the type do **not** have to match the
implementation:

```typescript
type Formatter = (input: string) => string;

// "text" instead of "input" — perfectly fine:
const shout: Formatter = (text) => text.toUpperCase();
```

### Interface vs. Type for Functions

```typescript
// With type (more common for function types):
type Comparator = (a: number, b: number) => number;

// With interface (less common, but possible):
interface ComparatorInterface {
  (a: number, b: number): number;
}

// Both are functionally identical!
```

> 💭 **Think about it:** When would you use an interface instead of a type alias
> for a function?
>
> **Answer:** When the function should have additional properties —
> e.g. `Formatter.defaultLocale = "de"`. Interfaces allow declaration
> merging, type aliases do not. In practice, `type` is usually enough.

---

## Annotated Code: Function as Parameter

```typescript annotated
function applyTwice(fn: (x: number) => number, value: number): number {
//                  ^^  ^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^          ^^^^^^
//                  Name  Inline function type   second param   Return
  return fn(fn(value));
//       ^^ ^^^^^^^^^ First application, then second
}

const result = applyTwice(x => x * 2, 5);
// Step 1: fn(5) = 10
// Step 2: fn(10) = 20
console.log(result); // 20
```

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> function addiere(a: number, b: number): string {
>   return a + b;
> }
> ```
>
> TypeScript immediately reports: *"Type 'number' is not assignable to type 'string'."*
> Now change the function body to make it fit: `return String(a + b);`
> Notice how the contract is enforced on **both sides** — both
> the implementation and all callers must conform.

---

**In your Angular project:** Angular uses Function Type Expressions everywhere.
An `EventEmitter<T>` accepts callbacks that follow exactly this pattern:

```typescript
// Angular EventEmitter with typed callback
import { EventEmitter } from '@angular/core';

export class ButtonComponent {
  clicked = new EventEmitter<{ x: number; y: number }>();

  // The handler in the parent must satisfy the Function Type Expression:
  // (event: { x: number; y: number }) => void
  onParentClick(event: { x: number; y: number }): void {
    console.log(`Klick bei ${event.x}, ${event.y}`);
  }
}
```

RxJS operators like `map` and `filter` are also Function Type Expressions:
`map((user: User) => user.name)` — TypeScript infers the output type `string`
automatically from the callback's return type.

---

## What you've learned

- Functions in TypeScript have **typed parameters** and **typed return values**
- There are three syntaxes: Declaration, Expression, Arrow Function
- `void` means "return value is irrelevant" — not the same as `undefined`
- **Function Type Expressions** (`type Fn = (x: T) => U`) make functions into full-fledged types
- Return types are usually inferred, but should be explicit for public APIs

> 🧠 **Explain to yourself:** What is the difference between `void` and `undefined` as a return type? When would you use which?
> **Key points:** void = return value irrelevant, callback compatibility | undefined = concrete value | void for side-effect functions | undefined when the caller needs the value

**Core Concept to remember:** A function in TypeScript is a contract. Parameter types and return type define what goes in and what comes out. TypeScript enforces both sides.

---

> **Pause point** — Good moment for a break. You've understood the fundamentals
> of function typing. From here, we build on that foundation.
>
> Continue with: [Section 02: Optional and Default Parameters](./02-optionale-und-default-parameter.md)