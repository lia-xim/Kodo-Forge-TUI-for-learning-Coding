# Section 5: The this Parameter

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Callback Types](./04-callback-typen.md)
> Next section: [06 - Function Patterns](./06-funktions-patterns.md)

---

## What you'll learn here

- Why `this` in JavaScript is **so confusing** and how TypeScript helps
- How to declare the **this parameter** in functions
- The difference between **arrow functions** and **regular functions** regarding `this`
- How `noImplicitThis` and `ThisParameterType` work

---

## The this Problem in JavaScript

`this` is arguably the **most misunderstood concept** in JavaScript.
The value of `this` depends on **how** a function is called —
not where it is defined:

```typescript
const person = {
  name: "Max",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  },
};

person.greet();          // "Hello, I'm Max" — OK

const greet = person.greet;
greet();                 // "Hello, I'm undefined" — this is lost!
```

> 📖 **Background: Why is this so confusing?**
>
> In most object-oriented languages (Java, C#, Python), `this`/`self`
> always refers to the object on which the method is defined. JavaScript,
> however, was created in 1995 in 10 days by Brendan Eich, and he chose
> **dynamic `this`**: the value is determined at **call time**,
> not at definition time. This made JavaScript more flexible (you can
> share methods between objects), but it led to countless bugs.
>
> ES2015 arrow functions partially solved the problem by binding `this`
> **lexically** (inheriting it from the surrounding scope). TypeScript
> goes further by allowing you to declare `this` as a **type**.

---

## The this Parameter in TypeScript

TypeScript allows a special **first parameter** named `this`,
which fixes the type of `this` inside the function:

```typescript annotated
interface User {
  name: string;
  age: number;
}

function greetUser(this: User): string {
//                 ^^^^^^^^^^ this parameter: TypeScript-ONLY
//                             Disappears in compiled JavaScript!
  return `Hello, I'm ${this.name} and ${this.age} years old.`;
}

// Calling it: this must be a User
const max: User = { name: "Max", age: 30 };
greetUser.call(max);  // "Hello, I'm Max and 30 years old."

// WRONG: Direct call without a proper this
// greetUser();
// Error! The 'this' context of type 'void' is not assignable to type 'User'
```

### Type Erasure with this

```typescript
// TypeScript:
function greetUser(this: User): string {
  return `${this.name}`;
}

// Compiled JavaScript — this parameter is GONE:
function greetUser() {
  return `${this.name}`;
}
```

The `this` parameter is a pure compile-time feature — it is removed
during compilation (type erasure, as covered in Lesson 02).

---

## this in Method Types

```typescript annotated
interface Calculator {
  value: number;
  add(this: Calculator, n: number): Calculator;
//    ^^^^^^^^^^^^^^^^^ this type is explicitly set
  multiply(this: Calculator, n: number): Calculator;
  result(this: Calculator): number;
}

const calc: Calculator = {
  value: 0,
  add(n) {
    return { ...this, value: this.value + n };
//               ^^^^ TypeScript knows: this is Calculator
  },
  multiply(n) {
    return { ...this, value: this.value * n };
  },
  result() {
    return this.value;
  },
};

// Method chaining works in a type-safe way:
const result = calc.add(5).multiply(3).result();
// 15
```

---

## noImplicitThis

The compiler option `noImplicitThis` (part of `strict: true`) enforces
that `this` inside functions always has a known type:

```typescript
// WITHOUT noImplicitThis: this is 'any' — no type checking
function getName() {
  return this.name;  // No error, but unsafe!
}

// WITH noImplicitThis: TypeScript requires a this type
function getName() {
  return this.name;
//       ^^^^ Error! 'this' implicitly has type 'any'
}

// Solution: declare a this parameter
function getName(this: { name: string }) {
  return this.name;  // OK — TypeScript knows the type
}
```

> 💭 **Think question:** Why is `noImplicitThis` part of `strict: true`?
> What problems does it prevent?
>
> **Answer:** Without `noImplicitThis`, you could access arbitrary properties
> on `this` — `this.whatever` would always be `any`. This completely
> undermines the type system. The option forces you to explicitly declare
> the this context, just as `strictNullChecks` forces you to write null checks.

---

## Arrow Functions and this

Arrow functions have **no `this` of their own** — they inherit `this` from
the surrounding scope. This is why you cannot declare a `this` parameter
in arrow functions:

```typescript annotated
class Timer {
  seconds = 0;

  // PROBLEM: regular function loses this
  startBroken() {
    setInterval(function () {
      this.seconds++;
//    ^^^^ Error! this is undefined (or window in the browser)
    }, 1000);
  }

  // SOLUTION: Arrow function inherits this from the class scope
  start() {
    setInterval(() => {
      this.seconds++;
//    ^^^^ OK! Arrow function inherits this from the Timer instance
    }, 1000);
  }
}
```

### When to use a regular function, when an arrow?

| Situation | Recommendation | Reason |
|---|---|---|
| Method in a class | Regular method | Defined on the prototype |
| Callback that accesses `this` | Arrow function | Inherits `this` lexically |
| Event handler in a class | Arrow function (as property) | Preserves `this` binding |
| Standalone function | Arrow function | Shorter syntax, no this problem |

```typescript
class Button {
  label = "Click me";

  // Arrow as class property: this is always the Button instance
  onClick = () => {
    console.log(this.label);  // Always "Click me"
  };

  // Regular method: this depends on the call context
  onHover() {
    console.log(this.label);  // Only OK when called correctly
  }
}
```

> 🔍 **Going deeper: Performance difference**
>
> Arrow functions as class properties are re-created for **every instance**
> (in the constructor). Regular methods live on the **prototype** and are
> shared. With many instances, this can make a difference. In practice:
> with few instances (e.g. Angular components), it doesn't matter. With
> thousands (e.g. in a game engine), prototype methods should be preferred,
> and `this` secured with `.bind()`.

---

## ThisParameterType and OmitThisParameter

TypeScript provides utility types for `this`:

```typescript annotated
function greet(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}!`;
}

// ThisParameterType extracts the this type:
type GreetThis = ThisParameterType<typeof greet>;
//   ^^^^^^^^^  { name: string }

// OmitThisParameter removes this and returns the "pure" signature:
type GreetFn = OmitThisParameter<typeof greet>;
//   ^^^^^^^  (greeting: string) => string
```

> 🧠 **Explain to yourself:** Why does TypeScript have a `this` parameter that disappears at runtime? What would the alternative be, and why would it be worse?
> **Key points:** this type is a compile-time check | Alternative: any for this (unsafe) | Or: no this check (runtime errors) | TypeScript catches this errors BEFORE execution

---

## What you've learned

- The `this` parameter is a **compile-time feature** that disappears at runtime (type erasure)
- **Arrow functions** inherit `this` lexically — regular functions bind `this` dynamically
- `noImplicitThis` (part of `strict`) enforces an explicit this type
- `ThisParameterType<T>` and `OmitThisParameter<T>` are utility types for this manipulation
- Arrow functions as **class properties** secure `this`, but cost performance with many instances

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> interface Counter {
>   count: number;
>   label: string;
> }
>
> function increment(this: Counter, step: number = 1): string {
>   this.count += step;
>   return `${this.label}: ${this.count}`;
> }
>
> const myCounter: Counter = { count: 0, label: "Clicks" };
>
> // With .call() — this is set explicitly:
> increment.call(myCounter, 5);    // OK! this is Counter
>
> // Direct call without this:
> increment(5);  // Error! The 'this' context 'void' is not a Counter
>
> // What happens when you pass an object that is NOT a Counter?
> increment.call({ count: 0 }, 5);  // Error! 'label' is missing
> ```
>
> Change the `this` parameter to `this: { count: number }` (without `label`).
> What effect does this have on the method? Observe how TypeScript
> enforces the this contract on the caller side.

**In your Angular project:** The `this` problem hits you directly with
event bindings and services. Angular components are classes — and that is
exactly why Angular recommends arrow functions for all callbacks:

```typescript
@Component({ ... })
export class UserListComponent {
  users: User[] = [];

  // PROBLEM: Regular method as setTimeout callback loses this
  loadUsersBroken() {
    setTimeout(function() {
      this.users = [];  // Runtime error: this is undefined!
    }, 100);
  }

  // SOLUTION 1: Arrow function inherits this from the component scope
  loadUsers() {
    setTimeout(() => {
      this.users = [];  // OK — arrow function holds the this binding
    }, 100);
  }

  // SOLUTION 2: Arrow as class property (for event handlers)
  onDelete = (userId: number) => {
    this.users = this.users.filter(u => u.id !== userId);
    // this is always the component instance — even when passed as a callback
  };
}
```

In React, `this` is no longer an issue (hooks + functional components) —
but you see the same effect with `useCallback`: it "freezes" a function
with the current scope, similar to `.bind(this)`.

**Key concept to remember:** `this` is dynamic in JavaScript, but TypeScript can check it at compile time. Arrow functions solve the problem elegantly — the `this` parameter is for the cases where you need explicit control.

---

> **Pause point** — The `this` topic is notoriously confusing.
> Don't worry if you need to read it again.
>
> Continue with: [Section 06: Function Patterns](./06-funktions-patterns.md)