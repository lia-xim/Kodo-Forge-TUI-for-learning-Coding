# Section 1: Class Basics

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Access Modifiers](./02-access-modifiers.md)

---

## What you'll learn here

- How the **class syntax** in TypeScript works and what sets it apart from plain JavaScript
- Why the **constructor** with typed parameters is the heart of every class
- What **strictPropertyInitialization** means and why TypeScript forbids uninitialized fields
- How **methods** and the **this context** interact in classes

---

## The History of Classes in JavaScript

Before we write a single line of code, we need to understand
**where classes in JavaScript come from** — because that explains many
of their quirks.

> **Background: From Prototypes to Classes**
>
> JavaScript was designed in 1995 by Brendan Eich in 10 days.
> He chose **prototype-based inheritance** instead of the classical
> class inheritance from Java or C++. In JavaScript, every object
> had a hidden `[[Prototype]]` reference to another object —
> that was all of "OOP".
>
> Not until **ES2015 (ES6)** in 2015 did the `class` keyword arrive.
> But beware: This is **just syntactic sugar** over the
> prototype system! Under the hood, exactly the same thing happens as before.
> TypeScript went a step further: It adds **type annotations**,
> **access modifiers** and **interfaces** — all compile-time features
> that disappear at runtime (type erasure, lesson 02).
>
> ```javascript
> // THIS is what OOP looked like before ES2015:
> function Person(name, age) {
>   this.name = name;
>   this.age = age;
> }
> Person.prototype.greet = function() {
>   return "Hello, I am " + this.name;
> };
>
> // THIS is what it looks like since ES2015:
> class Person {
>   constructor(name, age) {
>     this.name = name;
>     this.age = age;
>   }
>   greet() {
>     return `Hello, I am ${this.name}`;
>   }
> }
> // Under the hood: THE SAME prototype system!
> ```

---

## Your First TypeScript Class

<!-- section:summary -->
TypeScript classes require explicit field declarations with type annotations and enforce correct initialization via `strictPropertyInitialization` — all compile-time safety that disappears at runtime.
<!-- depth:standard -->
In TypeScript you declare fields **with type annotations** — something
plain JavaScript doesn't know. TypeScript then checks at compile time
whether you initialize and use the fields correctly.

```typescript annotated
class User {
  name: string;
  // ^ Field declaration WITH type. Not needed in JavaScript, mandatory in TypeScript.
  age: number;
  // ^ Every field needs a type. TypeScript does NOT infer from the constructor.
  email: string;

  constructor(name: string, age: number, email: string) {
  // ^ The constructor receives typed parameters.
    this.name = name;
    // ^ 'this' refers to the current instance.
    this.age = age;
    this.email = email;
    // ^ All fields MUST be initialized in the constructor
    //   (or have a default value), otherwise: compile error!
  }

  greet(): string {
  // ^ Methods can have a return type.
    return `Hello, I am ${this.name} (${this.age} years old)`;
  }

  isAdult(): boolean {
    return this.age >= 18;
  }
}

const user = new User("Anna", 28, "anna@example.com");
// ^ 'new' creates an instance. TypeScript checks the argument types.
console.log(user.greet()); // "Hello, I am Anna (28 years old)"
```

### Why do fields need to be declared?

In JavaScript you can write `this.whatever = 42` at any time —
JavaScript doesn't complain. TypeScript, however, requires that you
**declare all fields in the class** before using them in the constructor
or in methods. This prevents typos like
`this.naem = name` (instead of `this.name`).

<!-- depth:vollstaendig -->
> **Background: From Prototypes to Classes**
>
> JavaScript was designed in 1995 by Brendan Eich in 10 days.
> He chose **prototype-based inheritance** instead of the classical
> class inheritance from Java or C++. In JavaScript, every object
> had a hidden `[[Prototype]]` reference to another object —
> that was all of "OOP".
>
> Not until **ES2015 (ES6)** in 2015 did the `class` keyword arrive.
> But beware: This is **just syntactic sugar** over the
> prototype system! Under the hood, exactly the same thing happens as before.
> TypeScript went a step further: It adds **type annotations**,
> **access modifiers** and **interfaces** — all compile-time features
> that disappear at runtime (type erasure, lesson 02).
>
> ```javascript
> // THIS is what OOP looked like before ES2015:
> function Person(name, age) {
>   this.name = name;
>   this.age = age;
> }
> Person.prototype.greet = function() {
>   return "Hello, I am " + this.name;
> };
>
> // THIS is what it looks like since ES2015:
> class Person {
>   constructor(name, age) {
>     this.name = name;
>     this.age = age;
>   }
>   greet() {
>     return `Hello, I am ${this.name}`;
>   }
> }
> // Under the hood: THE SAME prototype system!
> ```

> **Analogy:** A TypeScript class is like a blueprint with precise
> material specifications. JavaScript accepts "whatever holds it together", TypeScript
> insists on "concrete grade C20/25, steel B500B". The blueprint (types)
> disappears after final inspection — the building (JS code) remains.

> **Experiment:** Create a class without field declarations and enable
> `strict: true`. What error messages do you see? Resolve them one by one
> using the four approaches from the next section.

> **Framework reference (Angular):** Angular components are classes with the
> `@Component` decorator. Every `@Injectable()` service is a class.
> Angular uses classes extensively for dependency injection — the
> DI container identifies services by their class (as a token).
> TypeScript's structural typing normally plays no role here,
> because Angular's DI works nominally (via the constructor reference).
>
> ```typescript
> @Injectable({ providedIn: 'root' })
> class UserService {
>   private users: User[] = [];
>   getAll(): User[] { return this.users; }
> }
>
> @Component({ selector: 'app-user-list', template: '...' })
> class UserListComponent {
>   constructor(private userService: UserService) {}
>   // ^ Angular injects the CLASS UserService here — not just any
>   //   object with the same structure.
> }
> ```

> **Self-explanation:** If TypeScript uses structural typing, why
> do you need classes at all? Couldn't you do everything with interfaces
> and object literals? What do classes offer that interfaces cannot?
>
> **Key points:** Classes exist at runtime (instanceof) |
> Classes have constructors for initialization logic |
> Classes can have private fields (#) |
> Classes enable inheritance with concrete code

<!-- /depth -->

---

## strictPropertyInitialization — TypeScript Keeps Watch

<!-- section:summary -->
`strictPropertyInitialization` prevents uninitialized fields — four solutions: constructor assignment, default value, optional (`?`), or definite assignment assertion (`!`).
<!-- depth:standard -->
With `strict: true` in your `tsconfig.json` (which you've been using since lesson 01),
`strictPropertyInitialization` is automatically active.
This means: **Every field must be initialized in the constructor**
or have a default value.

```typescript
class BrokenUser {
  name: string;
  // ^ ERROR: Property 'name' has no initializer and is not
  //   definitely assigned in the constructor. (TS2564)
}
```

There are **four ways** to resolve this:

```typescript annotated
// Option 1: Assign in the constructor
class A {
  name: string;
  constructor(name: string) {
    this.name = name;
    // ^ Direct assignment in the constructor
  }
}

// Option 2: Default value
class B {
  name: string = "Unknown";
  // ^ Default value directly in the declaration
}

// Option 3: Optional (undefined allowed)
class C {
  name?: string;
  // ^ Optional: type is string | undefined
}

// Option 4: Definite Assignment Assertion (!)
class D {
  name!: string;
  // ^ "Trust me, it will be set later" — CAUTION: unsafe!
  // Only use this when you REALLY know what you're doing
  // (e.g. during framework initialization like Angular's ngOnInit)
}
```

<!-- depth:vollstaendig -->
> **Think question:** Why is `class Foo { name: string }` an error in TypeScript
> without initialization (`strictPropertyInitialization`)? What would
> happen if TypeScript allowed it — what value would `name` have at runtime?
>
> **Key points:** Without initialization, `name` would be `undefined` at runtime |
> But TypeScript would think it's `string` | That would be a lie in the type system |
> `strictPropertyInitialization` prevents exactly this lie

> **Analogy:** `strictPropertyInitialization` is like a seatbelt
> sensor: the car drives without it, but the warning beep reminds you that
> something is missing. The `!` operator is like disabling the sensor — you
> know what you're doing, but the responsibility lies with you.

> **Framework reference (Angular):** The `!` operator (definite assignment)
> is common in Angular with `@ViewChild()` and `@ContentChild()`:
>
> ```typescript
> @Component({ ... })
> class MyComponent {
>   @ViewChild('myInput') inputRef!: ElementRef;
>   // ^ Angular only sets this in ngAfterViewInit.
>   //   TypeScript can't know that, so !
> }
> ```

<!-- /depth -->

---

## Methods and the this Context

<!-- section:summary -->
Methods have access to `this`, but this is lost when passing a method as a callback — arrow functions as class fields solve the problem through lexical binding.
<!-- depth:standard -->
Methods in classes have access to `this` — but this access
can **be lost** when you pass a method as a callback.
This is one of the most common sources of errors in TypeScript/JavaScript:

```typescript annotated
class Counter {
  count: number = 0;

  increment(): void {
    this.count++;
    // ^ 'this' refers to the Counter instance — as long as
    //   the method is called as counter.increment().
  }

  // Arrow function as a class field: 'this' is ALWAYS bound
  incrementSafe = (): void => {
    this.count++;
    // ^ Here 'this' is automatically bound to the instance
    //   by the arrow function. Works as a callback too.
  };

  getCount(): number {
    return this.count;
  }
}

const counter = new Counter();
counter.increment();   // OK: this = counter
console.log(counter.getCount()); // 1

// DANGER: Method as a callback
const fn = counter.increment;
// fn(); // RUNTIME ERROR: Cannot read property 'count' of undefined
// ^ 'this' is lost! The function no longer has a reference to counter.

const safeFn = counter.incrementSafe;
safeFn(); // OK! Arrow function retains 'this'.
console.log(counter.getCount()); // 2
```

<!-- depth:vollstaendig -->
> **Think question:** What is the difference between an interface and a class?
> Both define a structure — but interfaces only exist at compile time
> (type erasure), while classes exist at runtime as JavaScript constructor functions.
> Interfaces cannot be instantiated; classes can.
> What does this mean for `instanceof`?
>
> **Answer:** `instanceof` only works with classes, because it checks the
> prototype chain at runtime. Interfaces don't exist at runtime —
> `value instanceof MyInterface` would be an error.

> **Analogy:** `this` is like a name tag. When you call `counter.increment()`,
> the method carries the tag "Counter". When you pass it as a callback,
> it loses the tag — it no longer knows who it is.
> The arrow function sews the name tag permanently onto the jacket.

> **Framework reference (React):** In React class components, this problem
> was ubiquitous. One of the main reasons for switching to hooks
> was the constant `this` confusion:
>
> ```typescript
> // React Class Component — the infamous this problem
> class MyButton extends React.Component {
>   state = { count: 0 };
>   // Solution: Arrow function as class field
>   handleClick = () => { this.setState({ count: this.state.count + 1 }); };
>   render() { return <button onClick={this.handleClick}>Click</button>; }
> }
> // Hooks solve this completely:
> function MyButton() {
>   const [count, setCount] = useState(0);
>   const handleClick = () => setCount(count + 1); // No this problem!
>   return <button onClick={handleClick}>Click</button>;
> }
> ```

<!-- /depth -->

---

## Classes and Types: Structural Typing

<!-- section:summary -->
TypeScript uses structural typing for classes too: an object with a matching structure can be treated as a class instance — unlike nominal typing in Java or C#.
<!-- depth:standard -->
One of the most surprising aspects of TypeScript is that classes
are subject to **structural typing** — just like interfaces.
You may remember this from L05 (object types) and L08 (type aliases): TypeScript never checks the *name* of a type, but its *structure*. Classes are no exception.
This means: if an object has the same structure as a
class, it can be treated as that class.

```typescript annotated
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function printPoint(p: Point): void {
  console.log(`(${p.x}, ${p.y})`);
}

// This works WITHOUT 'new Point'!
printPoint({ x: 10, y: 20 });
// ^ Structural typing: the object has x: number and y: number,
//   so it matches the type 'Point'. No extends, no implements needed.
```

<!-- depth:vollstaendig -->
> **Experiment:** Create a class `Dog` with a field `name: string`
> and a method `bark(): string`. Then create a simple object
> `{ name: "Buddy", bark: () => "Woof!" }` and pass it to a function
> that expects `Dog`. Does it compile? Why?

This is a fundamental difference from Java or C#, where classes
are typed **nominally**: there, an object would have to explicitly
inherit from `Point` or implement `Point`.

<!-- /depth -->

---

## The Type of a Class: Instance Type vs. Constructor Type

<!-- section:summary -->
TypeScript distinguishes the instance type (`Animal`) from the constructor type (`typeof Animal`) — the former describes objects, the latter describes the class itself as a parameter.
<!-- depth:standard -->
TypeScript distinguishes two kinds of types for classes — a
detail that is often overlooked but important:

```typescript annotated
class Animal {
  constructor(public name: string) {}
  // ^ Parameter property shorthand (more on this in section 05)
}

// 1. Instance type: the type of an instance
let pet: Animal = new Animal("Kitty");
// ^ 'Animal' as a type = the instance type (has name, etc.)

// 2. Constructor type: the type of the CLASS ITSELF
let AnimalClass: typeof Animal = Animal;
// ^ 'typeof Animal' = the type of the constructor
//   (has .prototype, can be called with 'new')

const pet2 = new AnimalClass("Buddy");
// ^ Works! AnimalClass is the constructor.
```

<!-- depth:vollstaendig -->
> **Analogy:** The instance type is like the floor plan of a finished house —
> you describe what's inside the house (rooms, doors). The constructor type
> is like the blueprint plus the construction company — it describes HOW to build the house.

This becomes important when you want to **pass classes as parameters** —
for example in a factory function (more on this in section 05).

<!-- /depth -->

---

## Summary: class in TypeScript vs JavaScript

| Feature | JavaScript | TypeScript |
|---|---|---|
| Field declaration | Optional | Mandatory (with type) |
| Field initialization | Doesn't matter | Mandatory (`strict`) |
| Type checking in constructor | No | Yes |
| Method return type | No | Optional (annotation) |
| Access modifiers (private) | `#private` (ES2022) | `private`, `protected`, `readonly` |
| Implementing interfaces | No | `implements` |
| Abstract classes | No | `abstract class` |

---

## What you've learned

- Classes in TypeScript are **syntactic sugar** over the prototype system,
  augmented with type annotations and strict initialization checks
- **strictPropertyInitialization** enforces that every field is initialized —
  four options: constructor, default value, optional (`?`), definite assignment (`!`)
- **this** can be lost in methods when they are passed as callbacks —
  arrow functions as class fields solve the problem
- TypeScript's **structural typing** applies to classes too: an object with the
  same structure can be treated as a class instance

> **Explain to yourself:** If TypeScript uses structural typing, why
> do you need classes at all? Couldn't you do everything with interfaces
> and object literals? What do classes offer that interfaces cannot?
>
> **Key points:** Classes exist at runtime (instanceof) |
> Classes have constructors for initialization logic |
> Classes can have private fields (#) |
> Classes enable inheritance with concrete code

**Core concept to remember:** TypeScript classes are JavaScript classes with
type safety. The types disappear at runtime (type erasure), but
the class itself remains as a JavaScript constructor function.

---

> **Pause point** -- Good moment for a break. You now understand the
> basics of class syntax in TypeScript.
>
> Continue with: [Section 02: Access Modifiers](./02-access-modifiers.md)