# Section 2: Class Decorators

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Decorator Basics](./01-decorator-grundlagen.md)
> Next section: [03 - Method and Property Decorators](./03-method-property-decorators.md)

---

## What you'll learn here

- How **Class Decorators** work (Legacy and Stage 3)
- How to **extend** and **seal** classes with decorators
- Decorator Factories: Decorators with **parameters**
- How Angular's `@Component()` and `@Injectable()` work internally

---

## Background: Classes as Decorator Targets

> **Feature Origin Story: @Component — the most well-known Decorator**
>
> When the Angular team around Misko Hevery designed Angular 2 (2016),
> a radical design decision had to be made: how do you define
> components? React used `React.createClass()` (later classes),
> Vue used options objects.
>
> Angular chose decorators: `@Component({ ... }) class MyComponent`.
> The decorator doesn't transform the class — it **annotates** it
> with metadata (template, styles, selector). Angular's compiler reads
> this metadata and generates the actual rendering code.
>
> This decision had far-reaching consequences: Angular was the first
> major framework to rely on experimental TypeScript features.
> Today, 10 years later, Angular is still bound to the
> legacy decorator specification — a migration to Stage 3
> is planned, but not trivial.

---

## Class Decorator: Legacy Syntax

```typescript annotated
// Legacy Class Decorator — takes the constructor as an argument:
function Sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
  // ^ Object.seal prevents adding/removing properties
  // The class and its prototype are now "sealed"
}

@Sealed
class BankAccount {
  constructor(
    public owner: string,
    public balance: number
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }
}

// Now: you can no longer add new properties:
const account = new BankAccount("Max", 1000);
// (account as any).hacked = true;
// ^ Would throw an error in strict mode (Object.seal)
```

> 🧠 **Explain to yourself:** A Class Decorator receives the constructor
> as an argument. What are all the things you could do with it?
>
> **Key points:** Seal the class (Object.seal/freeze) | Add new methods |
> Wrap the constructor (e.g. logging) | Store metadata
> (Reflect.metadata) | Replace the class entirely

---

## Class Decorator: Stage-3 Syntax

```typescript annotated
// Stage 3 Class Decorator — new API with context:
function sealed(
  target: new (...args: any[]) => any,
  // ^ target = the class constructor
  context: ClassDecoratorContext
  // ^ context = metadata (name, kind, etc.)
): void {
  // context.kind === "class" — always for Class Decorators
  console.log(`Sealing class: ${String(context.name)}`);
  Object.seal(target);
  Object.seal(target.prototype);
}

@sealed
class SecureStorage {
  private data: Map<string, string> = new Map();

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }
}
```

---

## Decorator Factory: Decorators with Parameters

```typescript annotated
// Problem: @Sealed has no parameters.
// Solution: A function that RETURNS a decorator.

// Legacy Decorator Factory:
function Component(options: { selector: string; template: string }) {
  // ^ Outer function takes parameters
  return function (constructor: Function): void {
    // ^ Inner function is the actual decorator
    // Attach metadata to the class:
    (constructor as any).__selector = options.selector;
    (constructor as any).__template = options.template;
  };
}

@Component({
  selector: "app-header",
  template: "<h1>{{ title }}</h1>",
})
class HeaderComponent {
  title = "Welcome";
}

// Now a framework can read the metadata:
const selector = (HeaderComponent as any).__selector;
// ^ "app-header" — this is how Angular's @Component() works internally!
// (Angular uses Reflect.metadata instead of __-properties, but the principle is the same)
```

> 💭 **Think about it:** `@Component({...})` has parentheses, `@Sealed` does not.
> What's the difference? When do you need parentheses?
>
> **Answer:** Without parentheses: `@Sealed` — the decorator itself is applied.
> With parentheses: `@Component({...})` — the **factory** is called and
> returns the actual decorator. Parentheses = Decorator Factory.
> It's like `log` vs. `log("verbose")` — once the function itself,
> once a call that returns a function.

---

## Extending Classes: Adding New Functionality

```typescript annotated
// Decorator that extends a class with new methods (Legacy):
function Timestamped<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    // ^ Creates a new class that inherits from the original class
    createdAt = new Date();
    updatedAt = new Date();

    touch(): void {
      this.updatedAt = new Date();
    }
  };
}

@Timestamped
class BlogPost {
  constructor(
    public title: string,
    public content: string
  ) {}
}

const post = new BlogPost("TypeScript Decorators", "...");
// post.createdAt → Date (added by Timestamped)
// post.touch()   → updates updatedAt
// CAUTION: TypeScript doesn't know about createdAt/touch()!
// This is a well-known issue with Legacy Class Decorators:
// The type of the class does not change through the decorator.
```

> **Experiment:** Try a simple logging decorator:
>
> ```typescript
> function LogCreation(constructor: Function): any {
>   // Return type 'any' instead of 'void', since we're returning a new constructor
>   const original = constructor;
>   const newConstructor: any = function (...args: any[]) {
>     console.log(`Creating ${original.name} with:`, args);
>     return new (original as any)(...args);
>   };
>   newConstructor.prototype = original.prototype;
>   // ^ prototype transfer BEFORE the return
>   return newConstructor;
> }
>
> @LogCreation
> class User {
>   constructor(public name: string, public email: string) {}
> }
>
> new User("Max", "max@example.com");
> // Output: "Creating User with: ['Max', 'max@example.com']"
> ```

---

## Stacking Multiple Decorators
<!-- section:summary -->
Decorators can be combined — the order matters:

<!-- depth:standard -->
Decorators can be combined — the order matters:

```typescript annotated
function First(constructor: Function) {
  console.log("First executed");
}

function Second(constructor: Function) {
  console.log("Second executed");
}

@First
@Second
class MyClass {}

// Output:
// "Second executed"    ← BOTTOM-UP! Closest to the code first
// "First executed"

// But with Decorator FACTORIES (functions that return a decorator):
function FirstFactory() { return function(constructor: Function) { console.log("First executed"); }; }
function SecondFactory() { return function(constructor: Function) { console.log("Second executed"); }; }

@FirstFactory()  // Evaluation: TOP-DOWN
@SecondFactory() // Evaluation: TOP-DOWN
class MyClass2 {}
// Factory evaluation:  FirstFactory() → SecondFactory()
// Decorator application: SecondFactory-Decorator → FirstFactory-Decorator (bottom-up)
```

> ⚡ **In your Angular project** you rarely see stacked decorators on
> classes, but frequently on properties:
>
> ```typescript
> class UserComponent {
>   @Input()
>   @Required()        // Custom Validator
>   @Transform(lower)  // Custom Transformer
>   username: string;
>   // ^ Three decorators on one property — all applied bottom-up
> }
> ```
>
> In NestJS, stacked decorators are the standard:
>
> ```typescript
> @Controller("users")
> @UseGuards(AuthGuard)
> @UseInterceptors(LoggingInterceptor)
> class UsersController {
>   @Get(":id")
>   @UseGuards(RolesGuard)
>   findOne(@Param("id") id: string): User { /* ... */ }
> }
> ```

---

<!-- /depth -->
## What you've learned

- Class Decorators receive the **constructor** as an argument
- **Decorator Factories** are functions that return decorators (`@Component({...})`)
- Decorators can **seal**, **extend**, or **annotate classes with metadata**
- Multiple decorators are applied **bottom-up** (closest to the code first)
- Legacy Class Decorators do **not** change the **type** of the class — a well-known limitation

> 🧠 **Explain to yourself:** Why do we distinguish between
> "Decorator" and "Decorator Factory"? Couldn't you always
> use a Factory?
>
> **Key points:** Decorator = function applied directly (@Sealed) |
> Factory = function that returns a decorator (@Component({...})) |
> You COULD always use factories, but @Sealed is shorter than @Sealed() |
> Convention: no parameters → Decorator, with parameters → Factory

**Key concept to remember:** `@Decorator` = the function itself.
`@Decorator()` = a call that returns a function.
The difference is subtle but fundamental — like `fn` vs. `fn()`.

---

> **Pause point** — You understand Class Decorators.
> Next topic: Method and Property Decorators — the bread and butter of daily use.
>
> Continue with: [Section 03: Method and Property Decorators](./03-method-property-decorators.md)