# Section 1: Why Generics?

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Generic Functions](./02-generische-funktionen.md)

---

## What you'll learn here

- Why code duplication and `any` are both bad solutions
- How type parameters `<T>` solve the problem elegantly
- Why generics are the **heart** of TypeScript
- The core idea: "types as parameters"

---

## Background: How Generics Changed the Programming World

The idea of passing types as parameters is older than TypeScript.

**In 1973**, Robin Milner described the first type system with polymorphism in ML —
the mathematical foundation behind everything called "generics" today. But
it took decades for this idea to arrive in mainstream languages.

**2004** was the pivotal year: Java 5 and C# 2.0 both shipped with
generics. Java's approach was conservative — generics were reduced to `Object`
through *type erasure* to maintain backward compatibility. C# went further
and preserved type information at runtime. Both decisions still have
consequences today.

**Anders Hejlsberg** — the inventor of C# and later of TypeScript — had
direct experience with generics when he joined the TypeScript team
at Microsoft in 2012. TypeScript adopted generics in its first stable
version (0.9, 2013), with the same structural typing that
characterizes TypeScript overall.

The result: TypeScript generics are **more flexible** than Java's (because
structural) and **lighter** than C#'s (because invisible at runtime).
A `T extends { length: number }` in TypeScript accepts any type that
has a `length` property — without the type having to explicitly
implement any interface. That is structural typing in its purest form.

> **Generics are not new — but TypeScript made them accessible for JavaScript.
> That was one of the main reasons for TypeScript's explosive growth starting in 2016.**

---

## The Problem: Three Bad Approaches

Imagine you're writing a function that returns the first element of an array.
Sounds trivial — but TypeScript turns it into a challenge.

### Approach 1: One Function per Type (Code Duplication)

```typescript annotated
function firstString(arr: string[]): string | undefined {
  return arr[0];
}

function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}

function firstBoolean(arr: boolean[]): boolean | undefined {
  return arr[0];
}
// ^ Three identical functions — only the type differs!
```

This works, but it doesn't scale. For every new type you need
a new function. And the logic is **identical** — only the type
changes. That's the definition of code duplication.

### Approach 2: `any` (Type Safety Gone)

```typescript annotated
function firstAny(arr: any[]): any {
  return arr[0];
}

const result = firstAny(["hello", "world"]);
// result is `any` — TypeScript knows NOTHING anymore!

result.toUpperCase(); // No error — but what if the array held numbers?
result.foo.bar.baz;   // No error either — any allows EVERYTHING
```

This solves the duplication, but **destroys type safety**. The
return type is `any` — you might as well write JavaScript.
TypeScript can no longer protect you from anything.

### Approach 3: `unknown` (Safe, but Unusable)

```typescript annotated
function firstUnknown(arr: unknown[]): unknown {
  return arr[0];
}

const result = firstUnknown(["hello", "world"]);
// result is `unknown` — safe, but unusable without a type guard

// result.toUpperCase(); // Error! Property 'toUpperCase' does not exist on 'unknown'

if (typeof result === "string") {
  result.toUpperCase(); // Now OK — but tedious!
}
```

`unknown` is type-safe, but you have to manually recover the type.
At **every call site**. That's better than `any`, but still not good.

---

## The Solution: Type Parameters

> **Generics let you pass types as parameters.**
> Instead of fixing the type, you say: "The caller decides."

```typescript annotated
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
// ^ T is a type parameter — a placeholder for a real type

const a = first(["hello", "world"]);
// ^ a is string | undefined — TypeScript knows it!

const b = first([1, 2, 3]);
// ^ b is number | undefined — automatically correct

const c = first([true, false]);
// ^ c is boolean | undefined — fully type-safe
```

**One function. Any type. Full type safety.**

The `<T>` after the function name is the declaration of a **type parameter**.
`T` is a placeholder — like a parameter for values, but for types.
When you call the function, `T` is replaced by the concrete type.

---

## The Analogy: Value Parameters vs. Type Parameters

Think of ordinary functions:

```typescript annotated
// Value parameter: "I'll tell you WHICH value later"
function add(a: number, b: number): number {
  return a + b;
}
add(3, 5); // a=3, b=5 — values come at call time

// Type parameter: "I'll tell you WHICH type later"
function identity<T>(value: T): T {
  return value;
}
identity<string>("hello"); // T=string — type comes at call time
identity<number>(42);      // T=number — type comes at call time
```

| Concept | Value Parameter | Type Parameter |
|---------|----------------|----------------|
| Declaration | `(a: number)` | `<T>` |
| Usage | `add(5)` | `identity<string>(...)` |
| Placeholder | `a` | `T` |
| Replaced by | Concrete value | Concrete type |

---

## The Naming Convention

Type parameters are by convention **single uppercase letters**:

| Name | Meaning | Typical Use |
|------|---------|-------------|
| `T` | **T**ype | General type parameter |
| `U` | Second type | When T is already taken |
| `K` | **K**ey | Key of an object |
| `V` | **V**alue | Value of an object |
| `E` | **E**lement | Element of a collection |
| `R` | **R**eturn | Return type |

This is convention only — `T` could also be named `MyType`. But
single letters are standard and every TypeScript developer
recognizes them immediately.

---

## Why Generics Are the Heart of It All

Generics are not optional. They are **everywhere** in TypeScript:

```typescript annotated
// Arrays are generic:
const numbers: Array<number> = [1, 2, 3];
// ^ Array<number> is the generic form of number[]

// Promises are generic:
const promise: Promise<string> = fetch("/api").then(r => r.text());
// ^ Promise<string> — the resolved value is a string

// Map is generic:
const cache: Map<string, number> = new Map();
// ^ Map<K, V> — key: string, value: number

// Set is generic:
const ids: Set<number> = new Set([1, 2, 3]);
// ^ Set<T> — only numbers allowed
```

Without generics these data structures could not provide type safety.
`Array`, `Promise`, `Map`, `Set` — all generic. React's `useState`,
Angular's `HttpClient`, every library uses generics extensively.

> **Understanding generics is not optional — it is the prerequisite
> for everything else in TypeScript.**

---

## In Your Daily Work: Generics Everywhere

You've already used generics — you encounter them every day
in Angular and React:

**In your Angular project:**

```typescript
// HttpClient.get<T> — type-safe HTTP requests:
this.http.get<User[]>('/api/users').subscribe(users => {
  console.log(users[0].name); // TypeScript knows: users is User[]
});

// Observable<T> — the heartbeat of Angular:
const users$: Observable<User[]> = this.userService.getAll();
// The <User[]> comes from generics — Observable is a generic type

// BehaviorSubject<T> — reactive state:
private readonly state$ = new BehaviorSubject<AppState>(initialState);
```

**In React:**

```typescript
// useState<T> — type-safe component state:
const [user, setUser] = useState<User | null>(null);
// Without <User | null>, T would be null — too narrow for later assignment

// useRef<T> — type-safe DOM references:
const inputRef = useRef<HTMLInputElement>(null);
```

Every `<T>` you see in these APIs is a generics parameter.
The Angular and React teams faced the same problem we did:
"How do you write a function that is safe with ANY type?"
Their answer was generics — and now you understand why.

---

> 💭 **Think about it:** Look at `Array<T>`: `push()`, `pop()`, `map()`,
> `filter()` — all of these methods are generic. What would the alternative
> have been? How would JavaScript (without TypeScript) have solved the problem?
>
> **Take a moment to think before reading on.**
>
> JavaScript arrays are dynamically typed — they simply accept `any`.
> That is exactly Approach 2 from this section. TypeScript's generic `Array<T>`
> gives you the same JavaScript runtime behavior, but with type safety
> while writing. You pay no runtime cost for type safety.

---

> **Experiment:** Try the following in the TypeScript Playground
> (typescriptlang.org/play):
>
> ```typescript
> // Step 1: The any version
> function firstAny(arr: any[]): any {
>   return arr[0];
> }
>
> const result = firstAny(["hello", "world"]);
> result.toFixed(2); // No error! But result is a string...
>
> // Step 2: The generic version
> function first<T>(arr: T[]): T | undefined {
>   return arr[0];
> }
>
> const result2 = first(["hello", "world"]);
> result2?.toFixed(2); // Error! string has no .toFixed
> ```
>
> What happens when you hover over `result` vs. `result2`?
> Observe how TypeScript says nothing for `result` but knows the
> exact type for `result2`.

---

## What You've Learned

- The problem: code duplication (one function per type) vs. `any` (no type safety) — both unacceptable
- Type parameters `<T>` are placeholders for types that are determined at call time
- Generics give you **one function, any type, full type safety** all at once
- The naming convention: `T` (Type), `K` (Key), `V` (Value), `E` (Element), `R` (Return)
- Arrays, Promises, Maps, Sets, React hooks, Angular services — everything uses generics

**Core concept:** Generics are types as parameters — just as you pass values as parameters, you pass types. The compiler fills in the concrete type, you retain full type safety.

---

> 🧠 **Explain it to yourself:** Why is `any` more dangerous than `unknown`?
> And why do generics solve BOTH problems at once?
> **Key points:** any disables the compiler | unknown enforces checks | generics preserve the type throughout the entire function

---

> **Pause point** — Ready? Then continue to [Section 02: Generic Functions](./02-generische-funktionen.md)