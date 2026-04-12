# Section 4: Implementing Interfaces

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Inheritance and Abstract Classes](./03-vererbung-und-abstract.md)
> Next section: [05 - Static Members and Patterns](./05-static-und-patterns.md)

---

## What you'll learn here

- How `implements` works and what it **really** checks
- Why you can implement **multiple interfaces** simultaneously
- The difference between **Structural Typing** and **Nominal Typing**
- Why `implements` is technically **optional** — and still important

---

## implements: The Explicit Contract
<!-- section:summary -->
When a class declares an interface with `implements`, it promises:

<!-- depth:standard -->
When a class declares an interface with `implements`, it promises:
"I have ALL the fields and methods that the interface requires."
TypeScript checks this at compile time.

```typescript annotated
interface Serializable {
  serialize(): string;
  // ^ The interface requires: every class that is 'Serializable'
  //   must have a serialize() method returning string.
}

interface Loggable {
  log(level: string): void;
}

class User implements Serializable, Loggable {
  // ^ A class can implement MULTIPLE interfaces! (comma-separated)
  //   This is an advantage over inheritance (only one extends allowed).

  constructor(
    public name: string,
    public email: string
  ) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, email: this.email });
    // ^ MUST be present, otherwise: compile error
  }

  log(level: string): void {
    console.log(`[${level}] User: ${this.name}`);
    // ^ This method MUST also be present (required by Loggable)
  }
}
```

### What happens with missing methods?

```typescript
interface Printable {
  print(): void;
  getPreview(): string;
}

class Document implements Printable {
  print(): void {
    console.log("Printing...");
  }
  // ERROR: Class 'Document' incorrectly implements interface 'Printable'.
  //   Property 'getPreview' is missing in type 'Document'.
}
```

<!-- depth:vollstaendig -->
> **Background: Structural Typing — "If it walks like a duck..."**
>
> TypeScript uses **Structural Typing** (also called "Duck Typing"):
> If an object has the same structure as a type, it FITS —
> regardless of whether it explicitly implements that type or not.
>
> The name comes from an old saying: "If it looks like a duck,
> swims like a duck, and quacks like a duck, then it probably is a duck."
>
> This stands in stark contrast to **Nominal Typing** (Java, C#):
> There, a class must EXPLICITLY implement an interface —
> regardless of whether the structure matches or not.
>
> TypeScript's approach is more flexible: you can work with objects
> that happen to have the right shape, without forcing them into a
> class hierarchy.

---

<!-- /depth -->
## Structural Typing in Action
<!-- section:summary -->
Here's where it gets interesting — and surprising for Java/C# developers:

<!-- depth:standard -->
Here's where it gets interesting — and surprising for Java/C# developers:

```typescript annotated
interface HasLength {
  length: number;
}

function printLength(item: HasLength): void {
  console.log(`Length: ${item.length}`);
}

// All of these calls are valid — without 'implements HasLength'!
printLength("Hello");        // String has .length
printLength([1, 2, 3]);      // Array has .length
printLength({ length: 42 }); // Object literal has .length

class MyList {
  length: number = 0;
  // ^ MyList does NOT explicitly implement HasLength,
  //   but it has the right structure!
}

printLength(new MyList());   // OK! Structural Typing
```

<!-- depth:vollstaendig -->
> **Think about it:** If TypeScript checks structurally, why do you need
> `implements` at all? Couldn't you just leave it out?
>
> **Answer:** Yes, it technically works without `implements`! But:
>
> 1. **Early error messages**: With `implements` you get the error
>    directly at the class ("missing method X"), not only when you
>    pass the class somewhere as Serializable.
>
> 2. **Documentation**: `implements Serializable` immediately communicates what the
>    class promises. Without implements you have to read the entire class.
>
> 3. **Refactoring safety**: When the interface changes, TypeScript
>    immediately shows all classes that no longer match.

---

<!-- /depth -->
## implements vs extends: The Comparison
<!-- section:summary -->
A common mistake is confusing `implements` and `extends`:

<!-- depth:standard -->
A common mistake is confusing `implements` and `extends`:

```typescript annotated
interface Flyable {
  fly(): void;
}

class Bird {
  eat(): void { console.log("Nom nom"); }
}

// extends: INHERITS code (fields + methods with body)
class Penguin extends Bird {
  swim(): void { console.log("Swimming!"); }
  // Penguin automatically HAS eat() from Bird.
}

// implements: PROMISES structure (no code inherited!)
class Airplane implements Flyable {
  fly(): void { console.log("Flying!"); }
  // ^ Airplane MUST implement fly() itself.
  //   implements passes NO code along!
}
```

**Important:** `implements` inherits **no code**! You must write everything
yourself. `extends` inherits everything. You can combine both:

```typescript annotated
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Animal {
  name: string;
  constructor(name: string) { this.name = name; }
}

class Duck extends Animal implements Flyable, Swimmable {
  // ^ ONE parent class (extends) + MULTIPLE interfaces (implements)
  fly(): void { console.log(`${this.name} flies!`); }
  swim(): void { console.log(`${this.name} swims!`); }
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Create an interface `Printable` with a method
> `print(): void`. Then create a class `Report` that implements `Printable`.
> Now REMOVE the `implements Printable` — does the code still compile
> if Report still has a `print()` method?
> This demonstrates Structural Typing in action.

---

<!-- /depth -->
## Interface Implementation with Generics
<!-- section:summary -->
Interfaces can be generic (Lessons 13-14), and classes can

<!-- depth:standard -->
Interfaces can be generic (Lessons 13-14), and classes can
implement them with concrete types:

```typescript annotated
interface Repository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  delete(id: string): boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class InMemoryUserRepository implements Repository<User> {
  // ^ Implements Repository with T = User.
  //   All methods must use User instead of T.
  private users: Map<string, User> = new Map();

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return [...this.users.values()];
  }

  save(entity: User): void {
    this.users.set(entity.id, entity);
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }
}
```

This is the **Repository Pattern** — one of the most common patterns
in backend applications. The interface defines the contract,
and the implementation can be swapped out (InMemory, PostgreSQL, MongoDB...).

---

<!-- /depth -->
## Classes as Interfaces
<!-- section:summary -->
A quirk of TypeScript: you can also use a **class as an interface**

<!-- depth:standard -->
A quirk of TypeScript: you can also use a **class as an interface** —
both with `implements` and as a type:

```typescript annotated
class Point {
  x: number = 0;
  y: number = 0;
}

// Using a class as an interface!
class Point3D implements Point {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  // ^ Point3D promises: "I have everything Point has (+ more)."
  //   TypeScript extracts the structure from the class.
}

// A class also works as a type:
function printPoint(p: Point): void {
  console.log(`(${p.x}, ${p.y})`);
}

printPoint(new Point3D()); // OK: Point3D has x and y
printPoint({ x: 1, y: 2 }); // OK: Structural Typing
```

> **Caution:** If the class has `private` or `protected` fields,
> this does NOT work — only classes that actually inherit from it
> can share private fields.

---

<!-- /depth -->
## Interfaces in Frameworks

> **In your Angular project** you encounter interfaces constantly as
> **Lifecycle Hooks**: `OnInit`, `OnDestroy`, `OnChanges`, `AfterViewInit`.
> These interfaces define which methods Angular calls at specific
> points in time:
>
> ```typescript
> // Angular: Lifecycle hook interfaces
> @Component({ selector: 'app-user', template: '...' })
> class UserComponent implements OnInit, OnDestroy {
>   ngOnInit(): void {
>     // Called after the constructor
>     // Here: load data, start subscriptions
>   }
>
>   ngOnDestroy(): void {
>     // Called when the component is removed
>     // Here: end subscriptions, cleanup
>   }
> }
> ```
>
> **In React** interfaces are used differently — namely for
> **Props and State**:
>
> ```typescript
> // React: Props as interface
> interface ButtonProps {
>   label: string;
>   onClick: () => void;
>   disabled?: boolean;
> }
>
> function Button({ label, onClick, disabled }: ButtonProps) {
>   return <button onClick={onClick} disabled={disabled}>{label}</button>;
> }
> ```
>
> The difference: Angular uses interfaces for **behavior definition**
> (what can the class do?), React uses them for **data definition**
> (what props does the component expect?).

---

## Index Signatures in Implemented Interfaces
<!-- section:summary -->
Interfaces can have index signatures (Lesson 16), and classes

<!-- depth:standard -->
Interfaces can have index signatures (Lesson 16), and classes
can implement them:

```typescript annotated
interface StringMap {
  [key: string]: string;
  // ^ Every string key must have a string value
}

class Environment implements StringMap {
  [key: string]: string;
  // ^ The class must adopt the index signature

  NODE_ENV: string = "development";
  // ^ Explicit properties must match the index signature
}

const env = new Environment();
env.NODE_ENV = "production";
env["CUSTOM_VAR"] = "custom"; // Dynamic keys also possible
```

<!-- depth:vollstaendig -->
> **Explain to yourself:** If TypeScript checks structurally (Structural Typing),
> why do IDEs still suggest `implements` when you write a class? What is
> the practical benefit of `implements`?
>
> **Key points:** Early error message (while writing, not when using) |
> Better autocomplete in the IDE |
> Documents intent | Refactoring safety

---

<!-- /depth -->
## Summary: implements Checklist

| Question | Answer |
|---|---|
| Does `implements` inherit code? | **No** — structure check only |
| Does `extends` inherit code? | **Yes** — all fields and methods |
| Can you implement multiple interfaces? | **Yes** (`implements A, B, C`) |
| Can you inherit from multiple classes? | **No** (only `extends` ONE class) |
| Must you write `implements`? | No (Structural Typing), but recommended |
| Do interfaces exist at runtime? | **No** (Type Erasure) |
| Do classes exist at runtime? | **Yes** |

---

## What you've learned

- **implements** is a contract: the class promises to have all interface members
  — TypeScript checks this at compile time
- **Structural Typing** makes `implements` technically optional — an object with
  the right structure fits even without `implements`
- **Multiple interfaces** can be implemented (unlike only one parent class with `extends`)
- **implements inherits no code** — this is the core difference from `extends`
- You can use **classes as interfaces** and combine **generics with interfaces**
  for powerful patterns like the Repository Pattern

> **Explain to yourself:** You're designing a plugin system. Plugins must
> implement `init()`, `execute()`, and `cleanup()`. Would you use an
> interface or an abstract class? What if you want to provide a default
> for `cleanup()` (most plugins don't need cleanup)?
>
> **Key points:** Interface for the contract | Abstract class when default code is needed |
> Default cleanup() in abstract class, specific init()/execute() as abstract |
> Or: Interface + default via Mixin (Section 06)

**Core concept to remember:** `implements` is a compile-time promise,
not a runtime mechanism. It documents intent, enforces completeness,
and improves error messages — but it is Structural Typing that does
the actual compatibility check.

---

> **Break point** — Good moment for a pause. You now understand
> how interfaces and classes work together in TypeScript.
>
> Continue with: [Section 05: Static Members and Patterns](./05-static-und-patterns.md)