# Section 5: Static Members and Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Implementing Interfaces](./04-interfaces-implementieren.md)
> Next section: [06 - Classes in Practice](./06-klassen-in-der-praxis.md)

---

## What you'll learn here

- How **static** fields and methods work and when they make sense
- What **Parameter Properties** are and how they drastically reduce boilerplate
- The **Singleton Pattern** and why it's controversial
- The **Factory Pattern** as an elegant alternative to constructors

---

## Static Members: Belongs to the Class, Not the Instance
<!-- section:summary -->
Normal fields and methods belong to an **instance** — each

<!-- depth:standard -->
Normal fields and methods belong to an **instance** — each
`new MyClass()` has its own copy. **Static** fields and methods
belong to the **class itself** and exist only once:

```typescript annotated
class MathHelper {
  static PI: number = 3.14159265358979;
  // ^ static: Exists on the CLASS, not on instances.
  //   Access: MathHelper.PI (not new MathHelper().PI)

  static add(a: number, b: number): number {
    return a + b;
  }

  static multiply(a: number, b: number): number {
    return a * b;
  }
}

// Access WITHOUT new — directly via the class
console.log(MathHelper.PI);           // 3.14159...
console.log(MathHelper.add(2, 3));    // 5
console.log(MathHelper.multiply(4, 5)); // 20

// const helper = new MathHelper();
// helper.PI; // ERROR: Property 'PI' does not exist on type 'MathHelper'
// ^ Static members do NOT exist on instances!
```

### this in Static Methods

In a `static` method, `this` refers to the **class**, not to
an instance. This is a common pitfall:

```typescript annotated
class Config {
  static defaults = { timeout: 3000, retries: 3 };

  static getTimeout(): number {
    return this.defaults.timeout;
    // ^ 'this' = the Config class, NOT an instance.
    //   Equivalent to Config.defaults.timeout
  }
}

console.log(Config.getTimeout()); // 3000
```

<!-- depth:vollstaendig -->
> **Background: The Singleton Pattern — GoF 1995**
>
> The Gang of Four described the **Singleton Pattern** in 1995: A class
> of which there is **exactly one instance**. It was one of the simplest
> patterns in the book — and became one of the **most controversial**.
>
> Why controversial? Singletons are essentially **global state**
> with a nice name. They make unit tests difficult (because you can't
> easily reset global state), create hidden dependencies, and prevent
> parallelism.
>
> That said, Singletons are sometimes useful: database connection pools,
> configuration objects, or logging systems. The trick is using them
> **deliberately** — not as the default solution.

---

<!-- /depth -->
## The Singleton Pattern in TypeScript
<!-- section:summary -->
This is how you implement a classic Singleton:

<!-- depth:standard -->
This is how you implement a classic Singleton:

```typescript annotated
class Database {
  private static instance: Database | null = null;
  // ^ static: The single instance is stored on the CLASS.

  private constructor(
    private connectionString: string
  ) {
    // ^ private constructor: Prevents 'new Database()' from outside!
    //   Only the class itself can instantiate itself.
    console.log("Database connection established");
  }

  static getInstance(): Database {
    if (Database.instance === null) {
      Database.instance = new Database("postgresql://localhost/mydb");
      // ^ Lazy Initialization: Only created on the first call.
    }
    return Database.instance;
  }

  query(sql: string): void {
    console.log(`Query: ${sql}`);
  }
}

// const db = new Database("..."); // ERROR: Constructor is private
const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true — THE SAME instance!
```

<!-- depth:vollstaendig -->
> **Think about it:** Angular uses `providedIn: 'root'` instead of the
> Singleton Pattern directly. Why?
>
> **Answer:** Angular's Dependency Injection System is more powerful:
> - It manages the lifecycle automatically (lazy creation, cleanup)
> - It allows different instances in different injector scopes
> - It makes unit tests easy (injecting mock services)
> - The service doesn't need to know it's a Singleton
>
> `providedIn: 'root'` makes a service a Singleton — but
> managed through DI, not by the service itself.

---

<!-- /depth -->
## Parameter Properties: The Shorthand
<!-- section:summary -->
This feature saves you enormous amounts of boilerplate. Instead of declaring fields

<!-- depth:standard -->
This feature saves you enormous amounts of boilerplate. Instead of declaring fields
AND assigning them in the constructor, you do both in
one step:

```typescript annotated
// BEFORE: Verbose (18 lines)
class UserVerbose {
  public name: string;
  private email: string;
  readonly id: number;

  constructor(name: string, email: string, id: number) {
    this.name = name;
    this.email = email;
    this.id = id;
  }
}

// AFTER: Parameter Properties (4 lines!)
class UserCompact {
  constructor(
    public name: string,
    private email: string,
    readonly id: number
    // ^ Modifier BEFORE the parameter = automatic field declaration + assignment!
    //   'public name: string' in the constructor = field 'name' + this.name = name
  ) {}
  // ^ Empty constructor body — everything is handled automatically.
}

// Both classes behave IDENTICALLY:
const user = new UserCompact("Anna", "anna@mail.de", 42);
console.log(user.name);  // "Anna"
console.log(user.id);    // 42
// user.email;            // ERROR: private
```

<!-- depth:vollstaendig -->
> **Explain it to yourself:** Why is `constructor(private name: string)` a
> shorthand? What exactly happens behind the scenes — what three things
> does TypeScript do for you?
>
> **Key points:** 1. Field declaration (private name: string) |
> 2. Constructor parameter (name: string) |
> 3. Assignment (this.name = name) — all in ONE step

You can mix Parameter Properties with regular parameters:

```typescript
class Product {
  constructor(
    public name: string,        // Parameter Property
    public price: number,       // Parameter Property
    discountPercent: number     // Regular parameter (NO modifier = no field!)
  ) {
    // discountPercent is ONLY available in the constructor,
    // it is NOT stored as a field.
    if (discountPercent > 0) {
      this.price *= (1 - discountPercent / 100);
    }
  }
}
```

---

<!-- /depth -->
## The Factory Pattern: Smart Construction
<!-- section:summary -->
Sometimes a simple constructor isn't enough — you need

<!-- depth:standard -->
Sometimes a simple constructor isn't enough — you need
**different ways** to create an object. That's where the
Factory Pattern comes in:

```typescript annotated
class Color {
  private constructor(
    public readonly r: number,
    public readonly g: number,
    public readonly b: number
  ) {
    // ^ private constructor: Only the factory methods can create a Color.
  }

  // Factory methods: Different ways to create a Color
  static fromRGB(r: number, g: number, b: number): Color {
    return new Color(r, g, b);
    // ^ Accesses the private constructor — this is ONLY possible inside the class.
  }

  static fromHex(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return new Color(r, g, b);
    // ^ Complex parsing logic — doesn't belong in the constructor.
  }

  static fromName(name: string): Color {
    const colors: Record<string, [number, number, number]> = {
      red: [255, 0, 0],
      green: [0, 255, 0],
      blue: [0, 0, 255],
    };
    const [r, g, b] = colors[name] ?? [0, 0, 0];
    return new Color(r, g, b);
  }

  toString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}

// Three different ways to create a Color:
const red = Color.fromRGB(255, 0, 0);
const blue = Color.fromHex("#0000FF");
const green = Color.fromName("green");
// const c = new Color(1, 2, 3); // ERROR: Constructor is private
```

**Advantages of the Factory Pattern:**
- **Descriptive names**: `fromHex()` is clearer than `new Color("hex", "#FF0000")`
- **Validation**: Error checking before instantiation
- **Caching**: Factories can reuse instances
- **Polymorphism**: The factory can return different subclasses

<!-- depth:vollstaendig -->
> **Experiment:** Extend the `Color` class with a factory method
> `Color.fromHSL(h, s, l)`. You'll need to convert HSL to RGB — the
> exact formula isn't important here. What matters is: the conversion
> logic belongs in the factory, NOT in the constructor.

---

<!-- /depth -->
## Static Blocks: Initialization (TS 4.6+)
<!-- section:summary -->
Since TypeScript 4.6 you can use **static blocks** — code,

<!-- depth:standard -->
Since TypeScript 4.6 you can use **static blocks** — code
that runs once when the class is loaded:

```typescript annotated
class Environment {
  static readonly mode: string;
  static readonly isProduction: boolean;

  static {
    // ^ Static Block: Executed once when the class is loaded.
    //   Perfect for complex initialization.
    const env = process.env.NODE_ENV ?? "development";
    this.mode = env;
    this.isProduction = env === "production";
    console.log(`Environment: ${this.mode}`);
  }
}

// When the file is imported, the static block is executed:
// "Environment: development"
console.log(Environment.isProduction); // false
```

---

<!-- /depth -->
## Passing Classes as Type Parameters
<!-- section:summary -->
Sometimes you need a function that accepts **a class itself** as

<!-- depth:standard -->
Sometimes you need a function that accepts **a class itself** as
a parameter — not an instance:

```typescript annotated
// The type 'new (...args: any[]) => T' describes a constructor
type Constructor<T> = new (...args: any[]) => T;

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
  // ^ ctor is a class (constructor function) that is called with 'new'.
}

class User {
  constructor(public name: string) {}
}

class Product {
  constructor(public title: string, public price: number) {}
}

const user = createInstance(User, "Anna");
// ^ TypeScript infers: T = User, return type = User
console.log(user.name); // "Anna"

const product = createInstance(Product, "TypeScript Book", 29.99);
console.log(product.title); // "TypeScript Book"
```

<!-- depth:vollstaendig -->
> **In your Angular project**, the DI system uses exactly this pattern:
> You pass a CLASS as a token to the injector, and the injector
> creates the instance for you:
>
> ```typescript
> // Angular DI uses classes as tokens:
> constructor(private userService: UserService) {}
> // ^ Angular sees "UserService" (the class), creates an instance
> //   and injects it. This is the Factory Pattern via DI container.
> ```
>
> In React, this pattern is less common because React favors functions
> over classes. But in React testing libraries like
> `testing-library` you'll find similar factory functions.

---

<!-- /depth -->
## Summary: Static + Parameter Properties

| Feature | What it does | Example |
|---|---|---|
| `static field` | Field on the class | `static count = 0` |
| `static method` | Method on the class | `static create()` |
| `static {}` | Initialization block | Complex static setup logic |
| Parameter Property | Field declaration + assignment | `constructor(public name: string)` |
| Private Constructor | Prevents `new` from outside | Singleton, Factory |

---

## What you've learned

- **static** fields and methods belong to the class, not instances —
  access via `ClassName.member`, not `instance.member`
- **Parameter Properties** drastically shorten classes: `public name: string`
  in the constructor declares the field and assigns it
- The **Singleton Pattern** uses private constructor + static getInstance() —
  controversial because it creates global state
- The **Factory Pattern** uses private constructor + static factory methods —
  more flexible and testable than direct instantiation

> **Explain it to yourself:** Why does Angular use `providedIn: 'root'` instead of
> the Singleton Pattern directly? What are the advantages of DI over
> a manual Singleton?
>
> **Key points:** DI manages lifecycle automatically |
> Mock injection for tests | Different scopes possible |
> Service doesn't need to know it's a Singleton |
> No global variable, no private constructor needed

**Key concept to remember:** Static members belong to the class, not the
instances. Parameter Properties are syntactic sugar for the most common
pattern: declare a field + assign it in the constructor. Factories provide
controlled instantiation.

---

> **Pause point** -- Good moment for a break. You now know static
> members, parameter properties, and the most important class patterns.
>
> Continue with: [Section 06: Classes in Practice](./06-klassen-in-der-praxis.md)