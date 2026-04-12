# Section 1: Decorator Basics

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Class Decorators](./02-class-decorators.md)

---

## What you'll learn here

- What **Decorators** are and what problem they solve
- The difference between **Legacy Decorators** (experimentalDecorators) and **Stage 3 Decorators**
- How Decorators work as **metaprogramming**
- Why Decorators are fundamental in **Angular and NestJS**

---

## Background: The History of Decorators

> **Feature Origin Story: From Python to TypeScript**
>
> Decorators originally come from Python (PEP 318, 2003): `@decorator`
> above a function transforms it. The concept was inspired by Java
> Annotations (JSR 175, 2004) and C# Attributes.
>
> A Decorator proposal for JavaScript was started in 2014 (TC39 Stage 0).
> TypeScript implemented an early version in 2015 as an **experimental**
> feature (`experimentalDecorators: true`). Angular 2 (2016) built its
> entire framework on top of it: `@Component`, `@Injectable`, `@Input`.
>
> The TC39 proposal went through several redesigns. In 2022 it reached
> **Stage 3** — a completely new specification, not compatible
> with the experimental version. TypeScript 5.0 (March 2023)
> implemented the Stage 3 version.
>
> Today TWO Decorator systems exist in TypeScript:
> - **Legacy** (`experimentalDecorators: true`) — Angular, NestJS, TypeORM
> - **Stage 3** (default from TS 5.0) — the future standard

---

## What is a Decorator?
<!-- section:summary -->
A Decorator is a **function** that transforms or annotates a class, method, property

<!-- depth:standard -->
A Decorator is a **function** that **transforms** or **annotates** a class, method, property,
or parameter:

```typescript annotated
// A Decorator is simply a function:
function log(target: any, context: ClassMethodDecoratorContext) {
  // ^ target = the decorated method
  // ^ context = metadata (name, kind, class)
  const methodName = String(context.name);

  // Return a wrapper function:
  return function (this: any, ...args: any[]) {
    console.log(`→ ${methodName}(${args.join(", ")})`);
    const result = target.apply(this, args);
    console.log(`← ${methodName} = ${result}`);
    return result;
  };
}

// Apply the Decorator with @:
class Calculator {
  @log
  // ^ @log "wraps" the add method with logging
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// Output:
// → add(2, 3)
// ← add = 5
```

> 🧠 **Explain to yourself:** A Decorator is a function that "wraps"
> another function. Where have you seen this pattern before,
> WITHOUT the @ syntax?
>
> **Key points:** Higher-Order Functions! | middleware(handler) in Express |
> pipe(map(), filter()) in RxJS | Wrapper functions in JavaScript |
> Decorators are syntactic sugar for Higher-Order Functions

---

## Decorator vs. Higher-Order Function

```typescript annotated
// WITHOUT Decorator — manual wrapping:
function log<T extends (...args: any[]) => any>(fn: T): T {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    console.log(`Call: ${fn.name}(${args})`);
    return fn.apply(this, args);
  } as T;
}

const add = log(function add(a: number, b: number) {
  return a + b;
});
// ^ Works, but: the wrapping happens OUTSIDE the class.
//   You have to manually wrap the method.

// WITH Decorator — declarative, directly on the method:
class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
  // ^ Wrapping happens DIRECTLY at the declaration.
  //   You can immediately see: "add" is being logged.
}
```

> 💭 **Think about it:** Decorators are syntactic sugar for Higher-Order
> Functions. Why is the sugar still valuable?
>
> **Answer:** 1. **Readability**: `@log` directly above the method is
> clearer than a separate wrapping call. 2. **Composition**: Multiple
> Decorators can be stacked (`@log @validate @cache`).
> 3. **Metadata**: Decorators can store information ABOUT the class
> (Reflection), not just change behavior.

---

## Legacy vs. Stage 3: The Key Difference

```typescript annotated
// === LEGACY Decorators (experimentalDecorators: true) ===
// Used in: Angular, NestJS, TypeORM, MobX 5
// Syntax: Special function signatures depending on type

// Method Decorator (Legacy):
function legacyLog(
  target: Object,           // Prototype of the class
  propertyKey: string,      // Name of the method
  descriptor: PropertyDescriptor  // { value, get, set, ... }
): PropertyDescriptor {
  // ^ Three parameters with specific meanings
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`${propertyKey}(${args})`);
    return original.apply(this, args);
  };
  return descriptor;
}

// === STAGE 3 Decorators (default from TS 5.0) ===
// Future standard, simpler API

// Method Decorator (Stage 3):
function stage3Log(
  target: Function,                    // The method itself
  context: ClassMethodDecoratorContext  // Structured context object
): Function {
  // ^ Two parameters: target + context
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`${name}(${args})`);
    return target.apply(this, args);
  };
}
```

> **Experiment:** Check in your current project:
>
> ```json
> // tsconfig.json — which version are you using?
> {
>   "compilerOptions": {
>     "experimentalDecorators": true,  // Legacy!
>     "emitDecoratorMetadata": true    // Legacy feature for Reflection
>   }
> }
>
> // If experimentalDecorators is NOT set
> // and target >= "ES2022" → Stage 3 Decorators are active
> ```
>
> Angular 16+ and NestJS still use Legacy Decorators.
> The switch to Stage 3 will happen gradually.

---

## Where Decorators Are Used

```typescript annotated
// Angular — EVERYTHING is based on Decorators:
@Component({
  selector: "app-root",
  template: "<h1>{{ title }}</h1>",
})
class AppComponent {
  @Input() title = "Hello";
  // ^ Property Decorator: marks as Input binding
}

// NestJS — server framework with Decorator API:
@Controller("users")
class UsersController {
  @Get(":id")
  getUser(@Param("id") id: string): User {
    // ^ Parameter Decorator: extracts route parameter
    return this.userService.findById(id);
  }
}

// TypeORM — database entities:
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;
}
```

> ⚡ **In your Angular project** Decorators are everywhere:
>
> ```typescript
> // Every Angular component IS a Decorator:
> @Component({ ... })     // Class Decorator
> @Injectable({ ... })    // Class Decorator (Services)
> @Input()                // Property Decorator
> @Output()               // Property Decorator
> @ViewChild('ref')       // Property Decorator
> @HostListener('click')  // Method Decorator
> @HostBinding('class')   // Property Decorator
> @Pipe({ name: '...' })  // Class Decorator
>
> // Angular's DI system works ONLY with Decorators:
> // @Injectable() + @Inject() for Dependency Injection
> ```
>
> In React: Decorators are less common. MobX 6+ has
> optional Decorator support. Generally React prefers
> Hooks and Higher-Order Components (HOCs) over Decorators.

---

## What you learned

- Decorators are **functions** that transform classes/methods/properties
- They are **syntactic sugar** for Higher-Order Functions
- **Legacy Decorators** (experimentalDecorators) are used by Angular, NestJS, TypeORM
- **Stage 3 Decorators** (from TS 5.0) are the future standard
- Both systems are **NOT compatible** — you must choose one

> 🧠 **Explain to yourself:** Why do two different Decorator systems
> exist in TypeScript? Why wasn't the Legacy system simply updated?
>
> **Key points:** TC39 completely changed the design (Stage 3 != Stage 1) |
> Millions of lines of Angular/NestJS code use Legacy | Breaking them abruptly would be
> irresponsible | Both exist in parallel, Legacy will be deprecated long-term

**Core concept to remember:** A Decorator is a function placed with
`@name` before a declaration. It can change behavior,
add metadata, or completely replace the value — all defined at
compile time, executed at runtime.

<!-- /depth -->

---

> **Pause point** -- You understand the basics. Now let's go into detail:
> Class Decorators — transforming entire classes.
>
> Continue with: [Section 02: Class Decorators](./02-class-decorators.md)