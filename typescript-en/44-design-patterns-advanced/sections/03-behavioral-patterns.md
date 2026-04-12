# Section 3: Behavioral Patterns — Encapsulating and Composing Behavior

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Structural Patterns](./02-structural-patterns.md)
> Next section: [04 - Repository and Data Access](./04-repository-und-data-access.md)

---

## What you'll learn here

- How **Strategy** encapsulates interchangeable algorithms as type-safe interfaces
- How a **typed Event Bus** works without RxJS — purely with TypeScript generics
- How **Command with Undo/Redo** is implemented in TypeScript
- Why NgRx Actions are the Command Pattern — just with immutability

---

## Background: Behavior as a Value

In the 1990s, it was revolutionary: encapsulating behavior in objects and swapping them at runtime. Java could do it — but it required classes, interfaces, and boilerplate.

Then came JavaScript. Functions are first-class citizens. You can pass a function as a parameter, store it in an array, return it from another function. What the GoF solved with pattern classes, JavaScript can do directly with functions.

TypeScript gets the best of both worlds: you get the type safety of interfaces *and* the flexibility of functions. A Strategy Pattern in TypeScript can be either a class or a simple typed function — depending on the complexity.

That's the core of today's section: Behavioral Patterns in TypeScript are often much more lightweight than in Java. Sometimes they're classes, sometimes interfaces, sometimes just a function type. The underlying pattern remains the same.

> 🧠 **Explain to yourself:** What does it mean to "treat behavior as a value"?
> Why is this easier in JavaScript/TypeScript than in Java?
> **Key points:** Functions are first-class | Closures encapsulate state |
> TypeScript can describe function types | Classes optional, not mandatory

---

## Strategy Pattern — Swapping Algorithms Without if-Cascades

You're building a form validation system. Different fields need different rules: email, password, IBAN, postal code. Instead of a massive `if-else` cascade, the Strategy Pattern encapsulates each rule in its own object.

```typescript annotated
// The central interface — every validation rule implements it
interface ValidationStrategy<T> {
  validate(value: T): ValidationResult;
  // ^ T makes it generic: string strategies, number strategies, object strategies
}

interface ValidationResult {
  valid: boolean;
  error?: string;  // Optional: only present when valid === false
}

// Concrete strategies — each only knows its own rule
class EmailValidationStrategy implements ValidationStrategy<string> {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(email: string): ValidationResult {
    return this.emailRegex.test(email)
      ? { valid: true }
      : { valid: false, error: 'Invalid email address' };
  }
}

class MinLengthStrategy implements ValidationStrategy<string> {
  constructor(private readonly minLength: number) {}
  // ^ Strategies can be configurable — no boilerplate for every length!

  validate(value: string): ValidationResult {
    return value.length >= this.minLength
      ? { valid: true }
      : { valid: false, error: `At least ${this.minLength} characters required` };
  }
}

class RangeValidationStrategy implements ValidationStrategy<number> {
  constructor(private readonly min: number, private readonly max: number) {}

  validate(value: number): ValidationResult {
    return value >= this.min && value <= this.max
      ? { valid: true }
      : { valid: false, error: `Must be between ${this.min} and ${this.max}` };
  }
}

// Validator class — combines multiple strategies (Composite)
class Validator<T> {
  private strategies: ValidationStrategy<T>[] = [];

  addStrategy(strategy: ValidationStrategy<T>): this {
    // ^ Returns this — Fluent API / Method Chaining!
    this.strategies.push(strategy);
    return this;
  }

  validate(value: T): ValidationResult[] {
    return this.strategies.map(s => s.validate(value));
    // ^ All strategies are executed — result is an array
  }

  isValid(value: T): boolean {
    return this.validate(value).every(r => r.valid);
    // ^ Helper method: true if all strategies pass
  }
}

// Usage — Fluent API makes the code readable:
const emailValidator = new Validator<string>()
  .addStrategy(new EmailValidationStrategy())
  .addStrategy(new MinLengthStrategy(5));

const passwordValidator = new Validator<string>()
  .addStrategy(new MinLengthStrategy(8))
  .addStrategy(new NoSpacesStrategy())
  .addStrategy(new HasUppercaseStrategy());

console.log(emailValidator.isValid('max@example.com'));  // true
console.log(emailValidator.isValid('no-at-sign'));       // false
```

> 💭 **Think about it:** What would be the downside of using plain functions instead
> of classes as strategies? `type Strategy<T> = (value: T) => ValidationResult`
>
> **Answer:** Functions are often better — less boilerplate. The downside:
> you lose the ability to identify strategies by type
> (`instanceof EmailValidationStrategy`) and to store configuration as instance state.
> Both are rarely needed — functions are sufficient in most cases.

---

## Observer Pattern — A Typed Event Bus Without RxJS

RxJS is more powerful than anything you'd build here yourself. But sometimes you don't want a full Observable stream — just simple event communication between components. A typed Event Bus does this without external dependencies.

```typescript annotated
// Event map: string keys to payload types
// TypeScript checks: which key has which payload type
type EventMap = {
  'user:login':      { userId: string; timestamp: Date };
  'user:logout':     { userId: string };
  'order:placed':    { orderId: string; total: number; items: string[] };
  'order:cancelled': { orderId: string; reason: string };
};

class TypedEventBus<Events extends Record<string, unknown>> {
  // Internal map: event name -> set of listener functions
  private listeners = new Map<keyof Events, Set<(data: unknown) => void>>();

  // on<K> — K is a concrete event name (e.g. 'user:login')
  on<K extends keyof Events>(
    event: K,
    listener: (data: Events[K]) => void,
    // ^ listener is typed: receives exactly the right payload type
  ): () => void {
    // ^ Return type: unsubscribe function (cleanup pattern)
    let eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      eventListeners = new Set();
      this.listeners.set(event, eventListeners);
    }
    eventListeners.add(listener as (data: unknown) => void);

    // SAFE: No `!` non-null assertion needed.
    // We store the reference in `eventListeners` and
    // know it is guaranteed to exist after the if-block.
    // In lesson 42 you'll learn why `!` can be dangerous.

    // Returns a cleanup function — no separate off() needed!
    return () => this.listeners.get(event)?.delete(listener as (data: unknown) => void);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    // ^ TypeScript checks: emit('user:login', { userId: '1', timestamp: new Date() })
    // NOT: emit('user:login', { userId: '1' })  <- timestamp missing -> ERROR
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

// Usage:
const bus = new TypedEventBus<EventMap>();

// TypeScript knows: userId is string, timestamp is Date
const unsubscribe = bus.on('user:login', ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp.toISOString()}`);
});

bus.emit('user:login', { userId: 'u-123', timestamp: new Date() });
// bus.emit('user:login', { userId: 'u-123' });
// ^ ERROR: Argument of type '{ userId: string; }' is not assignable...
// 'timestamp' is missing — TypeScript catches this!

unsubscribe(); // Clean up — no memory leak
```

> ⚡ **Angular connection:** This Event Bus is similar to Angular's `EventEmitter<T>`,
> but simpler and without RxJS. In your Angular projects you'll frequently choose
> between three approaches:
>
> ```typescript
> // 1. EventEmitter (output-bound — parent-child only)
> @Output() userLogin = new EventEmitter<{ userId: string }>();
>
> // 2. RxJS Subject (for cross-component communication)
> private loginSubject = new Subject<{ userId: string }>();
> login$ = this.loginSubject.asObservable();
>
> // 3. TypedEventBus (for simple cases without RxJS overhead)
> bus.on('user:login', handler);
> ```
>
> The TypedEventBus is ideal for projects that don't use RxJS,
> for example in React projects or small Node.js services.

---

## Command Pattern — Undo/Redo With a Type-Safe History Stack

Command encapsulates an action as an object. That sounds abstract. Concretely: you want to implement Ctrl+Z in a text editor. Or in a drawing program. Or in a form builder that should be able to undo changes.

```typescript annotated
// Command interface — every command can be executed and undone
interface Command {
  execute(): void;
  undo(): void;
  // ^ Symmetry is important: execute() and undo() must be exact inverses
  readonly description: string;
  // ^ Human-readable name for debugging and UI display ("Undo: Insert text")
}

// Concrete command: insert text
class InsertTextCommand implements Command {
  readonly description: string;
  private insertedAt: number = 0;

  constructor(
    private readonly document: TextDocument,
    private readonly text: string,
    private readonly position: number,
  ) {
    this.description = `Insert text: "${text}"`;
  }

  execute(): void {
    this.document.insert(this.position, this.text);
    this.insertedAt = this.position;
  }

  undo(): void {
    this.document.delete(this.insertedAt, this.text.length);
    // ^ Exactly the inverse of insert()
  }
}

// CommandHistory — manages the history stack
class CommandHistory {
  private readonly history: Command[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  execute(command: Command): void {
    command.execute();
    this.history.push(command);
    // Limit stack size: discard oldest commands
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  undo(): Command | undefined {
    const command = this.history.pop();
    // ^ pop() returns undefined when the stack is empty
    command?.undo();
    // ^ Optional chaining: undo() is only called if command exists
    return command;
    // Caller can display command.description: "Undo: Insert text"
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  getHistory(): readonly Command[] {
    return [...this.history];
    // ^ Defensive copy — callers cannot modify the internal stack
    // readonly in the return type: additional compile-time check
  }
}
```

> ⚡ **NgRx as Command Pattern:** In your Angular projects with NgRx, every
> Action is a Command:
>
> ```typescript
> // NgRx Action = Command (without undo — there are separate "revert" actions for that)
> const addToCart = createAction('[Cart] Add Item', props<{ item: CartItem }>());
> const removeFromCart = createAction('[Cart] Remove Item', props<{ itemId: string }>());
>
> // NgRx Reducer = Command executor — but immutable and with history via state snapshots
> const cartReducer = createReducer(initialState,
>   on(addToCart, (state, { item }) => ({ ...state, items: [...state.items, item] })),
>   on(removeFromCart, (state, { itemId }) => ({
>     ...state,
>     items: state.items.filter(i => i.id !== itemId),
>   })),
> );
> // Time-travel debugging in Redux DevTools = undo/redo over the state stream
> ```

---

## What you learned

- **Strategy** encapsulates interchangeable algorithms — in TypeScript often as a generic
  interface that allows both classes *and* functions as strategies
- **Observer** enables loose coupling between producers and consumers — the
  typed Event Bus shows how TypeScript generics secure the payload types
- **Command** encapsulates actions as objects with execute/undo — NgRx Actions are
  Commands in pure form, but immutable and optimized for state streams
- Behavioral Patterns in TypeScript are often more lightweight than in Java, because
  functions are first-class and interfaces are checked structurally

**Core concept:** Behavioral Patterns separate the *what* (the action, the event,
the algorithm) from the *how* (the concrete execution). TypeScript's type system ensures
this separation is verified at compile time — not just at runtime.

> 🧠 **Explain to yourself:** Why does the Command Pattern have an `undo()` method,
> but NgRx has no corresponding "undo" action? How does NgRx solve the same problem?
> **Key points:** NgRx is immutable — the entire state history exists |
> Time-travel = replay all actions from the beginning | State-snapshot undo vs. inverse operation

---

> **Pause point** — Three fundamental Behavioral Patterns understood, and you've
> recognized their fingerprint in Angular (NgRx, EventEmitter).
>
> Continue with: [Section 04: Repository and Data Access](./04-repository-und-data-access.md)