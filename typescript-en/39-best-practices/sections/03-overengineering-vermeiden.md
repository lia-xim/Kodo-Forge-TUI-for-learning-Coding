# Section 3: Avoiding Overengineering — YAGNI for Types

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - any vs unknown vs never](./02-any-unknown-never.md)
> Next section: [04 - Type Assertions vs Type Guards](./04-assertions-vs-guards.md)

---

## What you'll learn here

- How to **recognize over-engineering** — the warning signs in type code
- The **YAGNI principle** applied to TypeScript types
- Concrete examples: Where generics, branded types, and conditional types are **too much**
- The **rules of thumb** for appropriate type complexity

---

## The Problem: Too Much of a Good Thing

Over 37 lessons you've learned powerful type tools: generics,
conditional types, mapped types, template literal types, branded
types, phantom types. The temptation to use them everywhere is strong.
But **more type safety isn't always better**.

> 📖 **Background: YAGNI — You Aren't Gonna Need It**
>
> YAGNI is a principle from Extreme Programming (Kent Beck, 1999):
> "Don't implement anything until you actually need it." It applies
> to code — and equally to types. An over-generic type that "covers
> all possible cases" is often harder to understand, slower for the
> compiler, and more fragile under changes than a simple concrete type.
> The best TypeScript developers don't write the most complex types —
> they write the **simplest types that get the job done**.

A real experience from a large React project: A developer created
a sophisticated generic API framework with seven nested generics,
conditional types, and phantom types. The type definitions spanned
300 lines for a utility that wrapped 15 lines of code. The result:
new team members needed three days to understand how to use the type.
IntelliSense suggestions took several seconds. The compiler needed
40 seconds for a build that previously took 8 seconds. After two
months the team decided on a complete rewrite with simple interfaces —
the replacement was written in an afternoon and explained in an hour.

---

## Warning Sign 1: Generics That Appear Only Once

```typescript annotated
// OVER-ENGINEERED: T is used only once — no added value
function log<T>(message: T): void {
  console.log(message);
}
// ^ T is never used for a return type or another parameter
// ^ There is no relationship expressed by T

// CORRECT: A simple type is sufficient
function log(message: unknown): void {
  console.log(message);
}

// JUSTIFIED: T is used multiple times — there is a relationship
function identity<T>(value: T): T {
  return value;
}
// ^ T connects input to output — that's the purpose of generics
```

### The Rule of Thumb for Generics

> **Only use a generic if it appears at least twice**
> (in parameters and/or return type). A generic that appears only once
> is almost always `unknown`.

In Angular services you often find this anti-pattern:

```typescript annotated
// OVER-ENGINEERED: Angular service with unnecessary generic
@Injectable({ providedIn: "root" })
class DataService<T> {  // Generic at service level
  getData(): Observable<T> {
    return this.http.get<T>("/api/data");
    // ^ T appears twice — but is bound at the service level,
    //   not at the method call. This makes the service hard
    //   to inject: DataService<User> vs DataService<Product>?
  }
}

// BETTER: Generic at method level
@Injectable({ providedIn: "root" })
class DataService {
  getData<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(endpoint);
    // ^ T is bound per call — much more flexible
  }
}

// EVEN BETTER: Specific services instead of generic
@Injectable({ providedIn: "root" })
class UserService {
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
    // ^ No generic — the type is clear and verifiable
  }
}
```

---

## Warning Sign 2: Conditional Types for Simple Cases

```typescript annotated
// OVER-ENGINEERED: Conditional type where a union suffices
type ResponseType<T extends "json" | "text"> =
  T extends "json" ? object : T extends "text" ? string : never;

// CORRECT: An interface map is clearer
interface ResponseMap {
  json: object;
  text: string;
}
type ResponseType<T extends keyof ResponseMap> = ResponseMap[T];
// ^ Same functionality, but readable and extensible

// EVEN BETTER (when only 2 cases): Overloads
function fetch(url: string, type: "json"): Promise<object>;
function fetch(url: string, type: "text"): Promise<string>;
function fetch(url: string, type: string): Promise<unknown> {
  // Implementation
}
```

> 🧠 **Explain it to yourself:** When are conditional types justified
> and when are they over-engineering? Where is the line?
> **Key points:** Justified: when the logic is truly conditional
> (infer, recursive types) | Over-engineering: when a map
> or overloads suffice | Rule of thumb: if you can write the type
> as a map in one line, you don't need a conditional type

---

## Warning Sign 3: Branded Types for Everything

```typescript annotated
// OVER-ENGINEERED: Brands for internal, short-lived values
type FormName = string & { __brand: "FormName" };
type FormEmail = string & { __brand: "FormEmail" };
type FormAge = string & { __brand: "FormAge" };

function processForm(name: FormName, email: FormEmail, age: FormAge) {}
// ^ Three brands for a simple form? Overkill!

// CORRECT: Simple interface
interface FormData {
  name: string;
  email: string;
  age: string;
}

function processForm(data: FormData) {}
// ^ Clear, simple, extensible

// JUSTIFIED: Brands for domain-critical IDs
type UserId = string & { __brand: "UserId" };
type OrderId = string & { __brand: "OrderId" };
// ^ Confusing UserId/OrderId has real consequences
//   (wrong user gets the wrong order)
```

### When Branded Types Make Sense

| Situation | Branded Type? |
|-----------|:---:|
| Entity IDs that could be confused (UserId, OrderId) | Yes |
| Currency amounts (EUR vs USD) | Yes |
| Validated values (Email, URL, Positive Number) | Yes |
| Form fields that belong together anyway | No |
| Local variables inside a function | No |
| Strings that only exist within one module | No |

> ⚡ **Framework note:** In Angular projects you often see
> over-typed services: every parameter has its own branded type,
> every method has generics. This makes the service hard to use.
> Better: branded types only for IDs that travel between services.
> In React: keep props interfaces simple — `{ userId: string }` instead
> of `{ userId: UserId }` when the brand provides no real protection.

> 💭 **Think about it:** How would you decide whether a branded type
> is worth it? What is the minimum "value" it needs to provide?
>
> **Answer:** A branded type is worth it when confusing two values
> would cause a **real bug** (e.g. wrong user, wrong amount). If
> the confusion would only be a typo in a local variable, a simple
> type is enough. The question: "What happens in the worst case if
> the values are swapped?"

---

## The Complexity Pyramid

```
                    ▲ Complexity
                   /│\
                  / │ \
                 /  │  \   Type-Level Programming
                /   │   \  (L37) — For Libraries
               /────│────\
              /     │     \   Conditional Types, Mapped Types
             /      │      \  (L16-17) — For Utility Types
            /───────│───────\
           /        │        \   Branded Types, Phantom Types
          /         │         \  (L24, L26) — For Domain IDs
         /──────────│──────────\
        /           │           \   Generics
       /            │            \  (L13-14) — For Reusable APIs
      /─────────────│─────────────\
     /              │              \   Interface, type, Union
    /               │               \  (L05, L07, L08) — For 80% of Code
   /────────────────│────────────────\
  /                 │                 \   Primitives (string, number, boolean)
 /──────────────────│──────────────────\  (L02) — Foundation
```

**Rule: Always start at the bottom. Only move up when the bottom isn't enough.**

> ⚡ **React note:** In React projects you often see over-engineering
> in props interfaces. A component that only displays Name and Age
> doesn't need a generic `ComponentProps<T>` interface —
> a simple `{ name: string; age: number }` is enough. Generic
> props interfaces only pay off when a component truly works with
> different data types (e.g. a generic table or list). The rule of
> thumb: if you never need the generic in the component body for
> type checks, you don't need it in the props interface either.

> 💭 **Think about it:** When is type complexity justified? Are there
> situations where a 50-line type definition is better than a
> 5-line interface?
>
> **Answer:** Yes — in library code used by many teams.
> A complex `DeepPartial<T>` or `RecursiveRequired<T>` definition
> amortizes its complexity cost through thousands of uses.
> In application code (used only internally), complexity is almost
> never justified. The question: "How many developers benefit
> from this type, and how often?"

---

## Experiment: Simplify These Types

Three over-engineered types — simplify each one:

```typescript
// Type A: Does it really need conditional types?
type Stringify<T> = T extends string
  ? T
  : T extends number
  ? `${T}`
  : T extends boolean
  ? `${T}`
  : never;

// Your simplified version: ___
// Hint: String() and template literals solve this more simply

// Type B: Does it need generics?
function wrapInArray<T extends string | number | boolean>(value: T): T[] {
  return [value];
}

// Your simplified version: ___
// Hint: T is actually used twice here — is it justified?
// Alternative: Can you write it without a generic and still have correct types?

// Type C: Does it need branded types?
type ButtonLabel = string & { __brand: "ButtonLabel" };
type TooltipText = string & { __brand: "TooltipText" };
type PlaceholderText = string & { __brand: "PlaceholderText" };

interface FormField {
  label: ButtonLabel;
  tooltip: TooltipText;
  placeholder: PlaceholderText;
}

// Your decision: keep or remove brands?
// Reasoning: What is the worst that happens if label and placeholder are swapped?

// Checklist for your own code:
// 1. Generics that appear only once → Replace with concrete type or unknown
// 2. Conditional types that fit as a map → Simplify to Record/Interface
// 3. Branded types for non-critical values → Remove brand
// 4. Nested generics (T extends U extends V) → Simplify
// 5. Can a colleague understand the type in 30 seconds? → If not: too complex
```

---

## What You've Learned

- **YAGNI applies to types too** — write the simplest type that gets the job done
- Over-engineering has real costs: compile time, onboarding time, maintainability
- **Generics** only when T appears at least twice — otherwise `unknown` or a concrete type
- **Conditional types** only when a map or overloads aren't sufficient
- **Branded types** only for domain-critical values whose confusion would cause real bugs
- The **complexity pyramid**: start at the bottom, only go up when the bottom isn't enough
- In Angular: service generics at the method level, not the service level
- In React: generic props only when truly different data types are needed

> 🧠 **Explain it to yourself:** A colleague writes: `type ApiResponse<T
> extends Record<string, unknown>> = T extends { error: infer E } ?
> { success: false; error: E } : { success: true; data: T }`. Is
> this justified or over-engineering? What would you suggest?
> **Key points:** The conditional type is unnecessary when only 2 cases
> exist | Simpler: discriminated union `{ success: true; data: T }
> | { success: false; error: E }` | No inference needed | Clearer
> error messages | The simplified version is shorter, more readable,
> and produces better TypeScript error messages

**Core concept to remember:** Type complexity has costs — compile time, readability, maintainability. Every type must justify its value. When in doubt: simpler. A simple type everyone understands is better than a complex type nobody wants to touch.

---

> **Pause point** — You now know when types are too much.
> Next up: Type Assertions vs Type Guards — when to use which.
>
> Continue with: [Section 04: Type Assertions vs Type Guards](./04-assertions-vs-guards.md)