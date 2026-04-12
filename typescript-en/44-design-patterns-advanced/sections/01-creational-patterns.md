# Section 1: Creational Patterns — Creating Objects with Intent

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - Structural Patterns](./02-structural-patterns.md)

---

## What you'll learn here

- Why the **Gang of Four** patterns originated in Java, but become much safer in TypeScript
- How **Factory Method** and **Abstract Factory** create type-safe object families
- Why **Singleton** is often an anti-pattern — and how Angular does it better
- When you actually need which Creational Pattern

---

## Background: The book that changed everything

In 1994, a book appeared that would leave a lasting mark on software development:
**"Design Patterns: Elements of Reusable Object-Oriented Software"** by Erich Gamma,
Richard Helm, Ralph Johnson and John Vlissides — the so-called **Gang of Four (GoF)**.

The book described 23 recurring solutions to common design problems in
object-oriented languages. The patterns were demonstrated in Java and C++. And that's
where the problems arise: Java had no Union Types, no structural type system, no
Literal Types. The patterns had to make do with `instanceof` checks, reflection and
boilerplate.

Thirty years later, we're writing TypeScript. The structural type system, Discriminated
Unions, Generics and Conditional Types make many of these patterns possible in a way
that was simply unthinkable in Java. Sometimes they replace patterns entirely — a
TypeScript Union Type often makes the State Pattern unnecessary.

Today's lesson is not: "Memorize the 23 GoF Patterns." It is:
**Understand what problem a pattern solves, and recognize when TypeScript gives you a
more elegant solution.**

> **TypeScript changes the pattern game:**
>
> Many GoF patterns exist because Java/C++ CANNOT do certain things:
> - **Adapter Pattern** → In TypeScript: simply an object literal with the right keys
> - **State Pattern** → In TypeScript: Discriminated Union + exhaustive switch
> - **Strategy Pattern** → In TypeScript: function as parameter (functions are first-class)
> - **Factory Pattern** → In TypeScript: Union Type + switch with Exhaustive Checking
>
> **This does NOT mean patterns are worthless.** It means:
> TypeScript reduces the boilerplate effort from ~50 lines to ~5 lines.
> The pattern CONCEPT remains the same — the implementation becomes more elegant.

> 🧠 **Explain to yourself:** Why can TypeScript Union Types make some patterns
> from the GoF book unnecessary? Think about the State Pattern, which requires explicit
> state objects.
> **Key points:** Union Types are compile-time abstractions | No instanceof overhead |
> Exhaustive checking with switch | TypeScript enforces handling all cases

---

## Factory Method — the right type at the right time

The Factory Method solves a classic problem: you want to create an object, but
the concrete type should be decided at runtime. The caller should only know the
interface, not the implementation class.

```typescript annotated
interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(`[LOG] ${message}`); }
  warn(message: string) { console.warn(`[WARN] ${message}`); }
  error(message: string) { console.error(`[ERROR] ${message}`); }
}

class SilentLogger implements Logger {
  log(_message: string) { /* Test logger: discards all output */ }
  warn(_message: string) { }
  error(_message: string) { }
}

// Factory Method: the return type is the interface, not the class
// TypeScript enforces: all cases in the switch must be covered
function createLogger(type: 'console' | 'silent' | 'remote'): Logger {
  // ^ Union Type instead of string — typos show up red immediately
  switch (type) {
    case 'console': return new ConsoleLogger();
    case 'silent':  return new SilentLogger();
    case 'remote':  return new RemoteLogger();
    // TypeScript knows: all cases are covered — no default needed
    // If you add 'file' without a case: COMPILE ERROR
  }
}

// Caller only knows Logger — not ConsoleLogger or RemoteLogger
const logger: Logger = createLogger('console');
// ^ Correct: type is Logger (interface), not ConsoleLogger (class)
logger.log('App started');
```

The key TypeScript advantage: the Union Type `'console' | 'silent' | 'remote'`
is **exhaustive**. If you create a new logger type and add it to the union
without having a `case` in the switch, TypeScript immediately shows an error. In Java
you'd add a string constant and hope you hadn't forgotten the switch.

> 💭 **Think about it:** What happens in the `createLogger` function if you replace the switch
> with a Record: `const creators: Record<LoggerType, () => Logger> = {...}`?
> Is that better or worse?
>
> **Answer:** A Record is often better — it's more declarative, all entries must be
> present (otherwise compile error), and you can inspect it at runtime.
> Downside: the Record is created once (always) instead of only on call.

---

## Abstract Factory — families of related objects

Imagine you're building a UI framework that supports different design systems:
Material Design, Bootstrap, or a custom corporate design. Each design system has
its own implementation of `Button`, `Input`, `Dialog`. You want to ensure that
a Material Button is never mixed with a Bootstrap Dialog.

That's the problem of Abstract Factory: **creating families of related objects
without knowing the concrete classes.**

```typescript annotated
// Abstract product interfaces
interface Button {
  render(): string;
  onClick(handler: () => void): void;
}

interface Input {
  render(): string;
  getValue(): string;
}

// Abstract Factory — a contract for entire UI families
interface UIFactory {
  createButton(label: string): Button;
  createInput(placeholder: string): Input;
}

// Concrete Factory 1: Material Design
class MaterialUIFactory implements UIFactory {
  createButton(label: string): Button {
    return new MaterialButton(label);
    // MaterialButton has ripple effect, elevation shadow, etc.
  }
  createInput(placeholder: string): Input {
    return new MaterialInput(placeholder);
    // MaterialInput has floating label animation
  }
}

// Concrete Factory 2: Bootstrap
class BootstrapUIFactory implements UIFactory {
  createButton(label: string): Button {
    return new BootstrapButton(label);
  }
  createInput(placeholder: string): Input {
    return new BootstrapInput(placeholder);
  }
}

// Usage — only knows UIFactory, never the concrete classes
function buildLoginForm(factory: UIFactory): void {
  const emailInput = factory.createInput('Email address');
  // ^ Regardless of which factory: createInput always returns Input
  const passwordInput = factory.createInput('Password');
  const submitButton = factory.createButton('Sign in');
  // ^ TypeScript guarantees: emailInput, passwordInput, submitButton are compatible
  // They come from THE SAME factory — never Material + Bootstrap mixed
}
```

> ⚡ **Angular reference:** In your Angular projects you already know this pattern as
> **Dependency Injection with Tokens**:
>
> ```typescript
> // Abstract Factory as Injection Token:
> const UI_FACTORY = new InjectionToken<UIFactory>('UIFactory');
>
> // Module A provides Material:
> { provide: UI_FACTORY, useClass: MaterialUIFactory }
>
> // Module B provides Bootstrap:
> { provide: UI_FACTORY, useClass: BootstrapUIFactory }
>
> // Component only knows the token, never the concrete class:
> constructor(@Inject(UI_FACTORY) private factory: UIFactory) {}
> ```
>
> That's Abstract Factory in Angular idiom. When you switch between themes,
> you only swap out the factory in the module — all components remain unchanged.

---

## Singleton — and why it's often an anti-pattern

The Singleton pattern ensures that a class has only a single instance
and provides a global access point to it. Sounds sensible. Often isn't.

```typescript annotated
class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connectionCount = 0;

  // Private constructor: new DatabaseConnection() is forbidden
  private constructor(private readonly url: string) {}

  // Single access point — creates instance on first call
  static getInstance(url: string): DatabaseConnection {
    // Nullish Coalescing Assignment (ES2021): only creates when null
    DatabaseConnection.instance ??= new DatabaseConnection(url);
    return DatabaseConnection.instance;
    // PROBLEM: url is ignored on the second call!
    // Who decides which URL wins? The first caller — arbitrarily.
  }

  connect(): void {
    this.connectionCount++;
    console.log(`Connection ${this.connectionCount} to ${this.url}`);
  }
}

// In tests this is a nightmare:
// Test A creates DatabaseConnection.getInstance('test-db')
// Test B expects a clean instance — but gets Test A's
// Test execution order determines behavior — not deterministic!
```

**Why Singleton is dangerous:**

1. **Global state:** Hidden dependencies — anyone can change the instance
2. **Not testable:** You can't inject a mock instance
3. **Threading:** In multi-threaded environments it needs locks (not relevant in Node.js)
4. **Sequence dependency:** Whoever creates the instance first wins

> ⚡ **Angular alternative:** `@Injectable({ providedIn: 'root' })` is technically a
> Singleton — but without the problems. Angular's DI container manages the instance,
> you can replace it in tests via `TestBed.overrideProvider()`. That's
> **Singleton behavior without the Singleton anti-pattern**: the container controls
> the lifetime, not the class itself.

> **TypeScript replacement for Singleton: module-level constant**
>
> In TypeScript you often don't need a classic Singleton at all. A module-level
> `const` is automatically a singleton — but simpler and more testable:
>
> ```typescript
> // config.ts — a single instance, but NO Singleton pattern
> export const config = {
>   apiUrl: 'https://api.example.com',
>   timeout: 5000,
> };
>
> // Every import gets THE SAME reference:
> // In module A: config.timeout = 3000
> // In module B: console.log(config.timeout) → 3000
> // BUT: In tests you can `vi.mock('./config')` and provide a mock config.
> // With the classic Singleton this is NOT possible.
> ```
>
> **Rule of thumb:** If you need "only one instance", use a module-level
> `const` or Angular's DI. The classic Singleton pattern with
> `private constructor` + `static getInstance` is almost always
> over-engineered in TypeScript.

---

## Experiment box: Factory with exhaustive switch

Paste this code directly into the TypeScript Playground and observe the behavior:

```typescript
type Environment = 'development' | 'staging' | 'production';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

function createApiConfig(env: Environment): ApiConfig {
  switch (env) {
    case 'development':
      return { baseUrl: 'http://localhost:3000', timeout: 30000, retries: 0 };
    case 'staging':
      return { baseUrl: 'https://api.staging.example.com', timeout: 10000, retries: 2 };
    case 'production':
      return { baseUrl: 'https://api.example.com', timeout: 5000, retries: 3 };
  }
  // TypeScript knows: this code is unreachable (never)
  // Add 'preview' to the union WITHOUT a new case — see the error!
}

// Try: change Environment to 'development' | 'staging' | 'production' | 'preview'
// TypeScript immediately reports: Function lacks ending return statement and return type
// does not include 'undefined'.
// That's exhaustive checking — your safety net!

const devConfig = createApiConfig('development');
console.log(devConfig.baseUrl); // http://localhost:3000
```

This pattern is fundamental: a Union Type as input, a switch that exhaustively
handles all cases. TypeScript immediately reports when you add a new value to the union
without updating the switch.

---

## What you've learned

- **Factory Method** creates objects behind an interface — TypeScript makes this
  type-safe with Union Types and exhaustive switches
- **Abstract Factory** creates families of related objects — in Angular
  you know this as DI with tokens
- **Singleton** has real problems (global state, testability) — Angular's
  `providedIn: 'root'` solves the same problem without the same dangers
- The GoF book comes from an era without Union Types and structural type systems —
  TypeScript significantly improves many of these patterns

**Core concept:** Creational Patterns decouple "what gets created" from "who creates it".
TypeScript's Union Types and exhaustive checking make this decoupling
safer than was ever possible in Java.

> 🧠 **Explain to yourself:** What is the difference between Factory Method and
> Abstract Factory? When do you need an entire factory family instead of a
> single factory function?
> **Key points:** Factory Method creates one type | Abstract Factory creates
> related objects as a family | Abstract Factory prevents mixing
> compatible types from different systems

---

> **Pause point** — You now understand how TypeScript makes Creational Patterns
> safer and more precise than in Java. Singleton is often an anti-pattern —
> remember why.
>
> Continue with: [Section 02: Structural Patterns](./02-structural-patterns.md)