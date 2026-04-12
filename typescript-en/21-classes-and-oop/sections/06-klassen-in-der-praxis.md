# Section 6: Classes in Practice

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Static Members and Patterns](./05-static-und-patterns.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- When to use **classes vs. functions** — and why the answer changes
- The **composition-over-inheritance** principle with concrete TypeScript examples
- How **mixins** work and when they replace inheritance
- Why the **this context** gets lost in callbacks — and three ways to fix it

---

## Classes vs. Functions: When to Use What?
<!-- section:summary -->
The central question in modern TypeScript: **When do you write a

<!-- depth:standard -->
The central question in modern TypeScript: **When do you write a
class, and when are functions + closures sufficient?**

```typescript annotated
// --- Approach 1: Class ---
class Counter {
  private count: number = 0;

  increment(): void { this.count++; }
  decrement(): void { this.count--; }
  getCount(): number { return this.count; }
}

const counter1 = new Counter();
counter1.increment();
console.log(counter1.getCount()); // 1

// --- Approach 2: Closure (functional) ---
function createCounter() {
  let count = 0;
  // ^ 'count' is private via the closure — not accessible even with 'as any'!

  return {
    increment: () => { count++; },
    decrement: () => { count--; },
    getCount: () => count,
  };
}

const counter2 = createCounter();
counter2.increment();
console.log(counter2.getCount()); // 1
```

### Decision guide: When class, when function?

| Criterion | Class | Function/Closure |
|---|---|---|
| `instanceof` needed? | **Yes** | No |
| Inheritance hierarchy? | **Yes** | No (but composition!) |
| Decorators needed? | **Yes** (Angular!) | No |
| Dependency injection? | **Yes** (Angular!) | Possible, but uncommon |
| Private state? | `private` / `#private` | Closure (true protection) |
| Serialization needed? | More difficult | Easier (plain objects) |
| Framework requirement? | Angular: **Yes** | React (Hooks): **Yes** |

<!-- depth:vollstaendig -->
> **Background: React's Switch from Class Components to Hooks (React 16.8, 2019)**
>
> Until React 16.8 (February 2019), React components were written as **classes**.
> `class MyComponent extends React.Component` was the standard.
> Then came **Hooks** — and changed everything.
>
> Why the switch? React's team identified three problems with classes:
>
> 1. **this-binding confusion**: `onClick={this.handleClick}` loses the
>    this context (exactly the problem from Section 01). Every new React
>    developer stumbled over this.
>
> 2. **Code organization**: In class components, related logic was
>    scattered across different lifecycle methods (componentDidMount,
>    componentDidUpdate, componentWillUnmount). Hooks bundle related
>    logic together.
>
> 3. **Code sharing**: Mixins were problematic, higher-order components
>    led to "wrapper hell". Custom Hooks solved this problem elegantly.
>
> ```typescript
> // BEFORE: Class Component
> class UserList extends React.Component<Props, State> {
>   state = { users: [] };
>   componentDidMount() { this.fetchUsers(); }
>   componentWillUnmount() { /* cleanup */ }
>   handleClick = () => { /* this-binding! */ };
>   // ...
> }
>
> // AFTER: Function Component + Hooks
> function UserList({ userId }: Props) {
>   const [users, setUsers] = useState<User[]>([]);
>   useEffect(() => { fetchUsers(); return () => cleanup(); }, []);
>   const handleClick = () => { /* no this problem! */ };
>   // ...
> }
> ```
>
> **But:** Angular sticks with classes! Angular's architecture is based on
> dependency injection and decorators — both require classes. Since
> Angular 16+ there are Signals as a complement, but classes remain central.

---

<!-- /depth -->
## Composition over Inheritance: The Practical Example
<!-- section:summary -->
Imagine you're building a game with different characters:

<!-- depth:standard -->
Imagine you're building a game with different characters:
warriors, wizards, healers. Each can fight, cast spells, or heal —
in different combinations.

```typescript annotated
// BAD: Inheritance leads to "diamond problem" explosion
class Character { name: string = ""; }
class Fighter extends Character { fight() { return "Fight!"; } }
class Wizard extends Character { cast() { return "Cast!"; } }
// class BattleMage extends Fighter, Wizard { }
// ^ DOESN'T WORK! TypeScript only allows ONE parent class.
// What if a BattleMage needs to be able to fight AND cast?
```

The solution: **Composition** — abilities as separate objects:

```typescript annotated
// GOOD: Composition — abilities as separate modules
interface CanFight {
  fight(): string;
}
interface CanCast {
  cast(): string;
}
interface CanHeal {
  heal(): string;
}

// Implementations as simple objects
const fighter: CanFight = {
  fight() { return "Sword strike!"; }
};
const wizard: CanCast = {
  cast() { return "Fireball!"; }
};
const healer: CanHeal = {
  heal() { return "Healing!"; }
};

// Characters COMBINE abilities (instead of inheriting them)
class BattleMage implements CanFight, CanCast {
  constructor(
    public name: string,
    private fightAbility: CanFight = fighter,
    private castAbility: CanCast = wizard
    // ^ Abilities are INJECTED, not inherited!
    //   This is composition: "has-a" instead of "is-a".
  ) {}

  fight(): string { return this.fightAbility.fight(); }
  cast(): string { return this.castAbility.cast(); }
}

const mage = new BattleMage("Gandalf");
console.log(mage.fight()); // "Sword strike!"
console.log(mage.cast());  // "Fireball!"
```

**Why is composition better?**
- **Flexible**: New combinations without new classes
- **Testable**: Mock abilities easily injectable
- **Extensible**: New ability? New interface + object, no hierarchy changes
- **No coupling**: A change in `fighter` doesn't break `BattleMage`

---

<!-- /depth -->
## Mixins: Adding Class Features Dynamically
<!-- section:summary -->
Mixins are a TypeScript pattern that enables **inheritance from multiple

<!-- depth:standard -->
Mixins are a TypeScript pattern that enables **inheritance from multiple
sources** — something `extends` alone cannot do.
It uses functions that extend classes:

```typescript annotated
// Type for a constructor (any class)
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin 1: Adds timestamp functionality
function WithTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    // ^ Returns a NEW class that extends Base.
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch(): void {
      this.updatedAt = new Date();
    }
  };
}

// Mixin 2: Adds logging functionality
function WithLogging<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(message: string): void {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  };
}

// Base class
class User {
  constructor(public name: string) {}
}

// Applying mixins: User + Timestamp + Logging
const EnhancedUser = WithLogging(WithTimestamp(User));
// ^ Mixin chain: User → +Timestamp → +Logging

const user = new EnhancedUser("Anna");
console.log(user.name);      // "Anna" (from User)
console.log(user.createdAt); // Date (from WithTimestamp)
user.log("Logged in");       // "[...] Logged in" (from WithLogging)
user.touch();                // Updates updatedAt (from WithTimestamp)
```

<!-- depth:vollstaendig -->
> **Experiment:** Create a mixin `WithValidation` that adds a method
> `validate(): boolean`. Apply it together with `WithTimestamp`
> to a `Product` class. Observe: Both mixins add
> functionality independently — no inheritance hierarchy needed!

---

<!-- /depth -->
## The this Context: The Biggest Stumbling Block
<!-- section:summary -->
This is probably the most common source of errors with classes in

<!-- depth:standard -->
This is probably the most common source of errors with classes in
JavaScript/TypeScript. We touched on it briefly in Section 01 —
here is the full explanation:

```typescript annotated
class Timer {
  seconds: number = 0;

  start(): void {
    setInterval(this.tick, 1000);
    // ^ PROBLEM: 'this.tick' loses the this context!
    //   When setInterval calls 'tick', 'this' is no longer Timer.
    //   'this' is then 'globalThis' (in strict mode: undefined).
  }

  tick(): void {
    this.seconds++;
    // ^ RUNTIME ERROR: Cannot read properties of undefined (reading 'seconds')
    console.log(this.seconds);
  }
}
```

<!-- depth:vollstaendig -->
> **Explain to yourself:** Why does a method lose its this context
> as a callback? What exactly happens when you write `const fn = obj.method`
> and then call `fn()`?
>
> **Key points:** In JavaScript 'this' depends on the CALL context |
> `obj.method()` → this = obj | `const fn = obj.method; fn()` → this = undefined |
> The method becomes "detached" from the object | Only the call site determines this

### Three solutions for the this problem

```typescript annotated
class Timer {
  seconds: number = 0;

  // Solution 1: Arrow function as class field
  tick = (): void => {
    this.seconds++;
    console.log(this.seconds);
    // ^ Arrow functions have NO own 'this'.
    //   They "capture" the 'this' of the surrounding class (lexical this).
    //   DOWNSIDE: Every instance gets its OWN copy of the function
    //   (more memory with many instances).
  };

  // Solution 2: bind() in the constructor
  tick2(this: Timer): void {
    this.seconds++;
    // ^ this parameter (TS-only): Documents that 'this' must be a Timer.
  }

  constructor() {
    this.tick2 = this.tick2.bind(this);
    // ^ bind() creates a new function with a fixed 'this'.
    //   The new function ALWAYS has 'this' = this Timer instance.
  }

  // Solution 3: Arrow function at the call site
  start(): void {
    setInterval(() => this.tick2(), 1000);
    // ^ Arrow function as wrapper: 'this' is passed through correctly.
    //   ADVANTAGE: tick2 remains a normal method (on the prototype).
  }
}
```

| Solution | Advantage | Disadvantage |
|---|---|---|
| Arrow field `tick = () => {}` | Simple, safe | Copy per instance (memory) |
| `bind()` in constructor | On prototype, efficient | More code, easy to forget |
| Arrow at call site `() => this.tick()` | Flexible, efficient | New wrapper each time |

> **Think about it:** When is a class the better choice over a function?
>
> **Answer:** Use classes when:
> - A framework requires it (Angular: services, components)
> - You need `instanceof` (type guards at runtime)
> - You need inheritance hierarchies
> - You need decorators
>
> Use functions/closures when:
> - You want to encapsulate simple state
> - You don't need a `this` context
> - You're using React Hooks
> - You're processing serializable data

---

<!-- /depth -->
## Classes and Type Narrowing
<!-- section:summary -->
Classes are the only TypeScript types that support `instanceof` for

<!-- depth:standard -->
Classes are the only TypeScript types that support `instanceof` for
type narrowing (because they exist at runtime):

```typescript annotated
class HttpError {
  constructor(public statusCode: number, public message: string) {}
}

class ValidationError {
  constructor(public field: string, public message: string) {}
}

function handleError(error: HttpError | ValidationError): void {
  if (error instanceof HttpError) {
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
    // ^ TypeScript knows: error is HttpError. statusCode is available.
  } else {
    console.log(`Validation: ${error.field} — ${error.message}`);
    // ^ TypeScript knows: error is ValidationError. field is available.
  }
}
```

This does NOT work with interfaces — because interfaces don't
exist at runtime (type erasure, Lesson 02). If you need `instanceof`,
they must be classes.

<!-- depth:vollstaendig -->
> **In React** you use classes less often, but for Error Boundaries
> they are **still required**. React has no hook-based
> alternative for Error Boundaries — `componentDidCatch` requires a
> class component. Even in new React code you need at least
> ONE class for error handling.
>
> **In Angular** classes remain the backbone: services, components,
> directives, pipes, guards — all classes with decorators.
> Angular's Signals (from v16) complement but do not replace classes.

---

<!-- /depth -->
## Best Practices: Classes in TypeScript
<!-- section:summary -->
1. **Prefer composition** over inheritance. Use interfaces + injection.

<!-- depth:standard -->
1. **Prefer composition** over inheritance. Use interfaces + injection.
2. **Use parameter properties** — less code, fewer errors.
3. **readonly** for everything that shouldn't change.
4. **Always use the `override` keyword** (+ `noImplicitOverride`).
5. **Arrow fields** for methods that are passed as callbacks.
6. **Maximum 2-3 inheritance levels** — deeper = too complex.
7. **Interfaces for contracts**, abstract classes for shared code.
8. **private as default** — only make `public` what is truly necessary.

---

<!-- /depth -->
## What you've learned

- **Classes vs. functions**: Classes for frameworks (Angular), `instanceof`,
  inheritance; functions for simple state, React, serialization
- **Composition over inheritance**: Inject abilities as objects instead of
  dragging them through inheritance chains
- **Mixins** allow "multiple inheritance" through functions that extend classes
- **this binding** is the most common source of errors: arrow fields, bind(), or
  arrow wrappers solve the problem

> **Explain to yourself:** Why did React switch from classes to Hooks,
> while Angular sticks with classes? What does that say about the
> architectural philosophy of the two frameworks?
>
> **Key points:** React: UI as a function of state, no DI needed |
> Angular: DI + decorators require classes |
> React's Hooks avoid this problems | Angular's class-based DI is more powerful |
> Different problems, different solutions

**Core concept to remember:** Classes are a tool, not an end in themselves.
Use them when a framework requires it or when you need inheritance,
`instanceof`, or decorators. In all other cases,
functions and plain objects are often the simpler choice.

---

> **End of lesson** — Congratulations! You have completed all six
> sections on Classes & OOP in TypeScript.
>
> **Recommended next steps:**
> 1. Review the concepts once more in cheatsheet.md
> 2. Test your knowledge directly in the TUI via "Start quiz"
> 3. Take a break before continuing with the next topic
>
> Back to overview: [README.md](../README.md)