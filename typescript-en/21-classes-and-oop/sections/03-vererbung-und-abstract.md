# Section 3: Inheritance and Abstract Classes

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Access Modifiers](./02-access-modifiers.md)
> Next section: [04 - Implementing Interfaces](./04-interfaces-implementieren.md)

---

## What you'll learn here

- How **inheritance** works with `extends` and `super()` in TypeScript
- What **abstract classes** are and why they cannot be instantiated
- How **method overriding** works with the `override` keyword (since TS 4.3)
- When to use **abstract** — and when it's better not to

---

## Inheritance with extends

<!-- section:summary -->
Inheritance with `extends` and `super()` allows subclasses to inherit fields and methods — where `super()` must always be the first statement in the constructor.
<!-- depth:standard -->
Inheritance is the concept of one class taking on the properties and
methods of another class. In TypeScript you use the `extends` keyword
for this:

```typescript annotated
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  move(distance: number): void {
    console.log(`${this.name} moves ${distance}m`);
  }
}

class Dog extends Animal {
  // ^ Dog INHERITS all fields and methods from Animal.
  //   Dog automatically has 'name' and 'move()'.
  breed: string;

  constructor(name: string, breed: string) {
    super(name);
    // ^ super() calls the parent class constructor.
    //   MUST be the FIRST statement in the constructor!
    this.breed = breed;
  }

  bark(): string {
    return `${this.name} barks: Woof!`;
    // ^ New method that only Dog has.
  }
}

const dog = new Dog("Rex", "German Shepherd");
dog.move(10);            // "Rex moves 10m" (inherited from Animal)
console.log(dog.bark()); // "Rex barks: Woof!" (own method)
```

### The super() Rule

When your subclass has a constructor, `super()` **must** be the
**first statement** — even before accessing `this`.
This is not a TypeScript quirk but a JavaScript rule:

```typescript
class Cat extends Animal {
  indoor: boolean;

  constructor(name: string, indoor: boolean) {
    // this.indoor = indoor; // ERROR: 'super' must be called first
    super(name);             // Initialize the parent class first!
    this.indoor = indoor;    // Then set your own fields
  }
}
```

<!-- depth:vollstaendig -->
> **Background: "Favor composition over inheritance" — Gang of Four 1994**
>
> The book "Design Patterns" (Gamma, Helm, Johnson, Vlissides — the
> **Gang of Four**) coined one of the most influential phrases in
> software development in 1994: "Favor object composition over class inheritance."
>
> The reason: inheritance creates **tight coupling**. If the
> parent class changes, all subclasses can break.
> Composition — assembling objects together — is more flexible.
>
> This doesn't mean inheritance is always bad! But you should
> use it deliberately: when a genuine "is-a" relationship exists
> (a Dog IS an Animal), inheritance makes sense.
> If you just want to share code, composition is better
> (more on this in Section 06).

> **Analogy:** Inheritance is like a family estate: you get the
> parents' house (methods) and their last name (fields) — but you
> also have to follow their rules (`super()` first).

<!-- /depth -->

---

## Method Overriding: Replacing Methods

A subclass can **override** methods of the parent class
to define its own behavior. Since TypeScript 4.3 the
`override` keyword exists, which prevents typos:

```typescript annotated
class Shape {
  area(): number {
    return 0;
  }

  describe(): string {
    return `Area: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
    // ^ override: Signals DELIBERATELY that a parent method
    //   is being overridden. If 'area()' is renamed in Shape,
    //   TypeScript will report an error here!
  }

  // override aera(): number { ... }
  // ^ ERROR with noImplicitOverride: 'aera' does not exist in Shape.
  //   Without 'override' the typo would go unnoticed!
}

const circle = new Circle(5);
console.log(circle.describe()); // "Area: 78.539..."
// ^ describe() calls this.area() — and gets Circle's version!
//   That is polymorphism: the RIGHT method is chosen at runtime.
```

> **Tip:** Enable `noImplicitOverride: true` in your `tsconfig.json`.
> Then EVERY overridden method MUST have the `override` keyword.
> This prevents accidental overriding and typos.

---

## Abstract Classes: The Blueprint

Sometimes you want to define a class that **must not be instantiated
directly** — it serves only as a template for subclasses.
That is exactly what `abstract class` is for:

```typescript annotated
abstract class DatabaseConnection {
  // ^ 'abstract' means: This class CANNOT be created with 'new'.
  //   It defines a template that subclasses must fill in.

  abstract connect(): Promise<void>;
  // ^ abstract method: Has NO body! Subclasses MUST implement it.
  abstract query(sql: string): Promise<unknown[]>;
  abstract disconnect(): Promise<void>;

  // Concrete method: Has a body and is inherited.
  async executeQuery(sql: string): Promise<unknown[]> {
    await this.connect();
    // ^ Calls the abstract method — the subclass supplies the implementation
    const result = await this.query(sql);
    await this.disconnect();
    return result;
  }
}

// const db = new DatabaseConnection();
// ^ ERROR: Cannot create an instance of an abstract class.

class PostgresConnection extends DatabaseConnection {
  override async connect(): Promise<void> {
    console.log("Connecting to PostgreSQL...");
  }

  override async query(sql: string): Promise<unknown[]> {
    console.log(`SQL: ${sql}`);
    return [];
  }

  override async disconnect(): Promise<void> {
    console.log("Connection closed");
  }
}

const db = new PostgresConnection();
// ^ OK! PostgresConnection is not abstract and has implemented all methods.
await db.executeQuery("SELECT * FROM users");
// Output: Connecting... -> SQL: SELECT... -> Connection closed
```

> **Explain to yourself:** Why can't an `abstract class` be instantiated?
> What would happen if TypeScript allowed it — and someone called an abstract
> method that has no body?
>
> **Key points:** Abstract methods have no code |
> Instantiation would cause a runtime error |
> TypeScript prevents this at compile time |
> Only subclasses with ALL methods implemented are instantiable

---

## Abstract Classes: Mixing Concrete + Abstract

The power of abstract classes is that they can have **both concrete
and abstract methods**. This is a key difference from interfaces
(which only have signatures, no code):

```typescript annotated
abstract class UIComponent {
  private visible: boolean = true;

  // Concrete method: Is inherited
  show(): void { this.visible = true; }
  hide(): void { this.visible = false; }
  isVisible(): boolean { return this.visible; }

  // Abstract method: Must be implemented
  abstract render(): string;
  // ^ Each subclass decides FOR ITSELF how it is rendered.

  // Template Method Pattern: Uses abstract + concrete together
  display(): void {
    if (this.visible) {
      console.log(this.render());
      // ^ Calls the abstract method that the subclass defines.
      //   This is the "Template Method" pattern (GoF).
    }
  }
}

class Button extends UIComponent {
  constructor(private label: string) { super(); }

  override render(): string {
    return `[ ${this.label} ]`;
  }
}

class TextInput extends UIComponent {
  constructor(private placeholder: string) { super(); }

  override render(): string {
    return `[____${this.placeholder}____]`;
  }
}

const btn = new Button("OK");
btn.display(); // "[ OK ]"
btn.hide();
btn.display(); // (nothing — hide() comes from UIComponent)
```

> **Think about it:** Angular's `AbstractControl` is abstract — why?
>
> In Angular Forms the hierarchy is:
> `AbstractControl` (abstract) → `FormControl`, `FormGroup`, `FormArray`
>
> `AbstractControl` defines the common API (value, valid, errors,
> setValue, patchValue, etc.) but CANNOT be instantiated directly.
> Why? Because it makes no sense to have an "abstract" form element
> — it must be either a single field (`FormControl`),
> a group (`FormGroup`), or an array (`FormArray`).
>
> This is exactly the pattern: the base class defines the interface
> and shared logic, the subclasses supply the specific
> implementation.

---

## Inheritance Chains and super for Methods

You can use `super` to call not only the constructor but also methods
of the parent class:

```typescript annotated
class Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class TimestampLogger extends Logger {
  override log(message: string): void {
    const time = new Date().toISOString();
    super.log(`${time} — ${message}`);
    // ^ super.log() calls the PARENT version of log().
    //   This way you extend behavior instead of replacing it entirely.
  }
}

class PrefixLogger extends TimestampLogger {
  constructor(private prefix: string) { super(); }

  override log(message: string): void {
    super.log(`[${this.prefix}] ${message}`);
    // ^ Calls TimestampLogger.log(), which in turn calls Logger.log().
    //   The chain: PrefixLogger → TimestampLogger → Logger
  }
}

const logger = new PrefixLogger("AUTH");
logger.log("User logged in");
// [LOG] 2024-01-15T10:30:00.000Z — [AUTH] User logged in
```

> **Experiment:** Create an `abstract class Shape` with an abstract
> method `area(): number`. Then create `Circle`, `Rectangle`, and `Triangle`
> as subclasses. What happens if you "forget" the `area()` method in one subclass?
> How does the TypeScript compiler react?

---

## When Abstract Class, When Interface?

| Criterion | Abstract Class | Interface |
|---|---|---|
| Can contain concrete code | **Yes** | No |
| Multiple extension | No (only extends 1) | **Yes** (implements N) |
| Exists at runtime | **Yes** (prototype chain) | No (type erasure) |
| `instanceof` possible | **Yes** | No |
| Fields with default values | **Yes** | No |
| Constructor | **Yes** | No |
| Access modifiers | **Yes** | No (everything public) |

**Rule of thumb:**
- **Interface**: When you only want to define a **shape** (structure)
- **Abstract Class**: When you want to **share common code** AND
  have certain methods implemented by subclasses

> **In your Angular project** you encounter both:
> - **Interfaces**: `OnInit`, `OnDestroy`, `CanActivate` — pure contracts
> - **Abstract Classes**: `AbstractControl`, `HttpInterceptor` (in older
>   versions) — with shared code
>
> In React, interfaces are more common than abstract classes, because React
> has barely used classes since hooks. But the concepts are universal.

---

## What you've learned

- **extends** creates subclasses that inherit fields and methods
- **super()** calls the parent constructor and MUST be the first statement
- **override** (TS 4.3+) explicitly marks overridden methods and
  prevents typos
- **abstract class** cannot be instantiated — it defines a
  template with concrete and abstract methods
- **Abstract vs Interface**: Abstract classes can contain code,
  exist at runtime, and support access modifiers

> **Explain to yourself:** You have a class `Logger` with a method
> `log()`. You want two variants: `ConsoleLogger` and `FileLogger`.
> Would you use an abstract class or an interface? What if
> both loggers should share common code for log-level filtering?
>
> **Key points:** Shared code → abstract class |
> Contract only → Interface | Shared log-level logic belongs in the base class |
> The specific output (console vs. file) is abstract

**Core concept to remember:** Abstract classes are blueprints with gaps.
The concrete methods provide shared logic; the abstract methods
define what each subclass MUST decide for itself.

---

> **Pause point** -- Good moment for a break. You now understand
> inheritance and abstract classes in TypeScript.
>
> Continue with: [Section 04: Implementing Interfaces](./04-interfaces-implementieren.md)