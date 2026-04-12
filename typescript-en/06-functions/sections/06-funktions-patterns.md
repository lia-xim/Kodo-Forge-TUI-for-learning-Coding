# Section 6: Function Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - The this Parameter](./05-this-parameter.md)
> Next section: — (End of lesson)

---

## What you'll learn

- How to write **Type Guards** (custom type constraints)
- What **Assertion Functions** are and how `asserts` works
- How **Constructor Signatures** and **Factory Functions** are typed
- The **Currying pattern** and why it's more powerful in TypeScript than you might expect

---

## Type Guards: Custom Type Constraints

You know `typeof` and `instanceof` for type narrowing. But what if
you need a custom check?

```typescript annotated
// Type Guard: return type "value is Type"
function isString(value: unknown): value is string {
//                                 ^^^^^^^^^^^^^^^^
//                                 "If true, value is a string"
  return typeof value === "string";
}

// Usage: TypeScript trusts the guard
function process(input: unknown) {
  if (isString(input)) {
    console.log(input.toUpperCase());
//              ^^^^^ TypeScript knows: input is a string
  }
}
```

### Type Guards for complex types

```typescript annotated
interface User {
  name: string;
  email: string;
  age: number;
}

function isUser(value: unknown): value is User {
//                                ^^^^^^^^^^^^ Custom Type Guard
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    "age" in value &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string" &&
    typeof (value as User).age === "number"
  );
}

// Now you can safely validate API data:
function handleApiResponse(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows: data is User
    console.log(`${data.name} (${data.email})`);
  } else {
    console.log("Invalid data!");
  }
}
```

> 📖 **Background: Why do we need Type Guards?**
>
> TypeScript has a limitation: it can only narrow automatically using
> built-in type checks (`typeof`, `instanceof`, `in`). For complex
> checks (e.g. "does this object have certain properties with certain
> types?") you need a custom function. The `value is Type` syntax
> tells TypeScript: "Trust me — if this function returns true,
> the value is of this type."
>
> **Caution:** TypeScript does **not verify** that your guard is correct!
> If you write `return true`, TypeScript believes you — even if the
> value isn't a User at all. Type Guards are a **contract** between
> you and the compiler.

---

## Assertion Functions

Assertion Functions go one step further: they throw an error if the
condition isn't met — and after that, the type is guaranteed:

```typescript annotated
function assertIsString(value: unknown): asserts value is string {
//                                       ^^^^^^^^^^^^^^^^^^^^^^^^
//                                       "After this call, value IS a string"
//                                       "Or this function has thrown an error"
  if (typeof value !== "string") {
    throw new Error(`Expected string, received: ${typeof value}`);
  }
}

function process(input: unknown) {
  assertIsString(input);
  // From here: TypeScript knows input is a string
  console.log(input.toUpperCase());
//            ^^^^^ Type: string — guaranteed after assertIsString
}
```

### assert without a type constraint

```typescript annotated
function assert(condition: unknown, message: string): asserts condition {
//                                                    ^^^^^^^^^^^^^^^^^
//                                                    "condition is truthy after the call"
  if (!condition) {
    throw new Error(message);
  }
}

function divide(a: number, b: number): number {
  assert(b !== 0, "Division by zero!");
  // TypeScript knows: b !== 0 is true
  return a / b;
}
```

> 💭 **Think about it:** What is the difference between a Type Guard
> (`value is T`) and an Assertion Function (`asserts value is T`)?
>
> **Answer:** A Type Guard returns `boolean` — the caller decides with
> `if`. An Assertion Function throws on failure and the code after it
> runs **only on success**. Type Guards are for branching, Assertion
> Functions are for guarantees.

---

## Constructor Signatures

Sometimes you need a type for "something that can be called with `new`":

```typescript annotated
// Constructor Signature: new (...args) => Instance
type Constructor<T> = new (...args: unknown[]) => T;
//                    ^^^
//                    "new" makes it a Constructor Signature

function createInstance<T>(ctor: Constructor<T>): T {
//                               ^^^^^^^^^^^^^^
//                               Accepts a class as an argument
  return new ctor();
}

class User {
  name = "Default User";
}

const user = createInstance(User);
//    ^^^^  Type: User
console.log(user.name);  // "Default User"
```

### Callable and Constructable

```typescript annotated
interface DateConstructor {
  // Callable: Date("...") returns string
  (value: string): string;
  // Constructable: new Date("...") returns Date
  new(value: string): Date;
}
// Date is both — it can be called with and without new.
// (This is a JavaScript special case, don't replicate this pattern!)
```

---

## Factory Functions

Factories create objects without `new`:

```typescript annotated
interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

function createLogger(prefix: string): Logger {
//                    ^^^^^^^^^^^^^^^  ^^^^^^
//                    Configuration    Return is an interface
  return {
    log(message) {
      console.log(`[${prefix}] ${message}`);
    },
    warn(message) {
      console.warn(`[${prefix}] WARN: ${message}`);
    },
    error(message) {
      console.error(`[${prefix}] ERROR: ${message}`);
    },
  };
}

const appLogger = createLogger("App");
appLogger.log("Started");    // [App] Started
appLogger.warn("Slow");      // [App] WARN: Slow
```

> 🔍 **Going deeper: Factory vs. Class**
>
> In JavaScript/TypeScript there is an ongoing debate: Factory Functions
> vs. Classes. Factory Functions have advantages:
> - No `this` problem (closures instead of instances)
> - True encapsulation (private variables via closures)
> - Easier to test (no inheritance)
>
> Classes have advantages:
> - `instanceof` checks work
> - Prototype-based (more efficient with many instances)
> - Familiar syntax for OOP developers
>
> Angular favors Classes (Services, Components). React is dominated by
> Factory Functions (Hooks, functional Components).

---

## Currying Pattern

Currying transforms a function with multiple parameters into a chain of
functions each taking one parameter:

```typescript annotated
// Without currying:
function add(a: number, b: number): number {
  return a + b;
}
add(1, 2); // 3

// With currying:
function curriedAdd(a: number): (b: number) => number {
//                               ^^^^^^^^^^^^^^^^^^^^^^^^
//                               Returns a FUNCTION
  return (b) => a + b;
}

const add5 = curriedAdd(5);
//    ^^^^  Type: (b: number) => number
add5(3);   // 8
add5(10);  // 15
```

### Generic currying for configuration

```typescript annotated
function createFormatter(locale: string): (amount: number) => string {
//                       ^^^^^^                    ^^^^^^     ^^^^^^
//                       Configuration             Input      Output
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "de-DE" ? "EUR" : "USD",
  });
  return (amount) => formatter.format(amount);
}

const formatEuro = createFormatter("de-DE");
const formatUsd = createFormatter("en-US");

formatEuro(1234.56);  // "1.234,56 EUR"
formatUsd(1234.56);   // "$1,234.56"
```

> 🧠 **Explain it to yourself:** Why is currying particularly useful in TypeScript? Think about the combination of currying with type inference and generic types.
> **Key points:** TypeScript infers all intermediate types automatically | Each step has precise types | Configuration and execution are separated | Generics flow through the chain

---

## What you've learned

- **Type Guards** (`value is T`) enable custom type narrowing
- **Assertion Functions** (`asserts value is T`) guarantee a type — or throw
- **Constructor Signatures** (`new (...args) => T`) type classes as values
- **Factory Functions** create objects without `new` — ideal for configuration and closures
- **Currying** separates configuration from execution — TypeScript infers all intermediate types

> **Experiment:** Write your own Type Guard `isNonNull<T>(value: T | null): value is T`
> and test it with an array: `[1, null, 2, null, 3].filter(isNonNull)`.
> What is the type of the filtered array?

**In your Angular project:** Type Guards and Factory Functions are core
tools for API integration and Dependency Injection:

```typescript
// Type Guard for API responses — validates HTTP data at runtime
interface ApiUser {
  id: number;
  name: string;
  email: string;
}

function isApiUser(value: unknown): value is ApiUser {
  return (
    typeof value === "object" && value !== null &&
    typeof (value as ApiUser).id === "number" &&
    typeof (value as ApiUser).name === "string" &&
    typeof (value as ApiUser).email === "string"
  );
}

// In the Angular service:
@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<ApiUser> {
    return this.http.get<unknown>(`/api/users/${id}`).pipe(
      map(data => {
        if (!isApiUser(data)) throw new Error("Invalid API response");
        return data;  // From here: type is ApiUser, not unknown
      })
    );
  }
}

// Currying in the Angular context: configurable formatter service
function createCurrencyFormatter(locale: string, currency: string) {
  const fmt = new Intl.NumberFormat(locale, { style: "currency", currency });
  return (amount: number) => fmt.format(amount);
}

export const formatEuro = createCurrencyFormatter("de-DE", "EUR");
export const formatUsd = createCurrencyFormatter("en-US", "USD");
// Usable anywhere in templates: {{ formatEuro(price) }}
```

**Core concept to remember:** Type Guards and Assertion Functions are your tools for extending TypeScript's type narrowing. They build the bridge between runtime checks and compile-time knowledge.

---

## Lesson complete!

You've finished all 6 sections of the Functions lesson. Here are
your next steps:

1. Test your knowledge with the **Quiz** (press `q` in the TUI)
2. Keep the **Cheatsheet** as a compact reference
3. Continue with Lesson 07: Union and Intersection Types

> **Back to start:** [README.md](../README.md)