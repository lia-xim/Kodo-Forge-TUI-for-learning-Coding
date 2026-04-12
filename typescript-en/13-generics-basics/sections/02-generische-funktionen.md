# Section 2: Generic Functions

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Why Generics](./01-warum-generics.md)
> Next section: [03 - Generic Interfaces and Types](./03-generische-interfaces-und-types.md)

---

## What you'll learn here

- The syntax `function name<T>(arg: T): T`
- How TypeScript **automatically** infers the type parameter (inference)
- When you need to specify the type **explicitly**
- Functions with **multiple type parameters** `<T, U>`

---

> 📖 **Background: Why TypeScript inference is so good**
>
> When TypeScript emerged in 2012, developers in Java and C# had to specify
> generics **always** explicitly: `List<String> names = new ArrayList<String>()`.
> That was tedious. Java 7 (2011) introduced the diamond operator: `new ArrayList<>()` —
> TypeScript developers laugh at that, because TypeScript went much
> further from the very beginning.
>
> TypeScript's type inference for generics is based on an algorithm called
> **Hindley-Milner** (developed independently in 1969/1978 by Roger Hindley and
> Robin Milner). This algorithm can infer types in both directions —
> from arguments, from return types, from callbacks. TypeScript's implementation
> is a pragmatic variant of it: fast enough for IDEs, precise enough
> for complex codebases.
>
> The result: You write `map(numbers, n => String(n))` and TypeScript
> knows without any annotation that the result is `string[]`. That's
> not a trick — that's formal type theory working for you.

---

## The basic syntax

```typescript annotated
function identity<T>(arg: T): T {
  return arg;
}
// ^ <T> declares the type parameter
// ^ (arg: T) uses T as the parameter type
// ^ : T uses T as the return type
```

This is the simplest generic function. It takes a value
and returns it unchanged. The type is preserved.

### Explicit vs. inferred type parameter

```typescript annotated
// Explicit: you tell TypeScript which type
const a = identity<string>("hello");
// ^ T becomes string

// Inferred: TypeScript recognizes T from the argument
const b = identity("hello");
// ^ T is inferred as string from "hello" — identical result!

// TypeScript even infers literal types:
const c = identity("hello" as const);
// ^ T is "hello" (literal type!)
```

> **Rule of thumb:** Let TypeScript infer when possible.
> Only specify the type explicitly when inference doesn't give you
> what you need.

---

## Type inference with generics — the magic

The real power of generics is **automatic inference**.
TypeScript looks at the arguments and derives `T` from them:

```typescript annotated
function wrap<T>(value: T): { wrapped: T } {
  return { wrapped: value };
}

const result1 = wrap("hello");
// ^ Type: { wrapped: string }
// TypeScript: "value is 'hello', so T = string"

const result2 = wrap(42);
// ^ Type: { wrapped: number }
// TypeScript: "value is 42, so T = number"

const result3 = wrap({ name: "Max", age: 30 });
// ^ Type: { wrapped: { name: string; age: number } }
// TypeScript even infers complex object types!
```

Inference works because TypeScript knows the type of `value`
and **unifies** it with the type parameter `T`. The same
principle as type inference for variables — just more powerful.

---

## Multiple type parameters

A function can have **multiple** type parameters:

```typescript annotated
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair("hello", 42);
// ^ Type: [string, number]

const p2 = pair(true, [1, 2, 3]);
// ^ Type: [boolean, number[]]

// Also with explicit specification:
const p3 = pair<string, boolean>("yes", true);
// ^ Type: [string, boolean]
```

### The `map` function — a classic example

```typescript annotated
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of arr) {
    result.push(fn(item));
  }
  return result;
}
// ^ T is the input type, U is the output type

const names = map([1, 2, 3], n => String(n));
// ^ T = number (from the array), U = string (from the callback return)
// Result: string[]

const lengths = map(["ab", "cde", "f"], s => s.length);
// ^ T = string, U = number
// Result: number[]
```

TypeScript infers **both** type parameters simultaneously — `T` from the
array, `U` from the return type of the callback function.

---

## Arrow functions with generics

Generics also work with arrow functions:

```typescript annotated
// Standard arrow function:
const identity2 = <T>(arg: T): T => arg;

// Multiple type parameters:
const swap = <T, U>(pair: [T, U]): [U, T] => [pair[1], pair[0]];

const result = swap(["hello", 42]);
// ^ Type: [number, string]
```

> **Caution in .tsx files (React):** `<T>` is interpreted as a JSX tag!
> Solution: `<T,>` (trailing comma) or `<T extends unknown>`.
>
> ```typescript
> // In .tsx files:
> const identity = <T,>(arg: T): T => arg;        // Trailing comma
> const identity = <T extends unknown>(arg: T): T => arg; // Constraint
> ```

---

## When explicit type specification is necessary

Sometimes TypeScript cannot infer the type:

```typescript annotated
// Problem: empty array — TypeScript doesn't know what T is
function createArray<T>(): T[] {
  return [];
}

// const arr = createArray(); // Error! T cannot be inferred
const arr = createArray<string>(); // OK: T = string
// ^ Here you MUST specify T explicitly

// Problem: desired type is broader than the inferred one
function parseJSON<T>(json: string): T {
  return JSON.parse(json);
}

const data = parseJSON<{ name: string }>(jsonString);
// ^ T must be explicit — TypeScript cannot look inside the JSON
```

> **Rule:** When the type parameter appears **only in the return type**
> (not in the parameters), TypeScript cannot infer it.
> Then you must specify it explicitly.

---

> 💭 **Think about it:** You see this code:
>
> ```typescript
> function transform<T, U>(value: T, fn: (input: T) => U): U {
>   return fn(value);
> }
> ```
>
> How many type parameters does this function have, and **why does it need two?**
> Could you get by with one?
>
> **Think for a moment before reading on.**
>
> `T` describes the input type, `U` describes the output type after the
> transformation. They are **independent** of each other: `transform("hello", s => s.length)`
> has `T = string` and `U = number`. A single type parameter could
> not express that input and output can be different types.
> Remember: each type parameter represents an **unknown but consistent** quantity.

---

## Common mistake: unnecessary type parameters

Not every `<T>` is meaningful:

```typescript annotated
// BAD: T is only used once — adds no value
function bad<T>(arr: T[]): void {
  console.log(arr.length);
}
// ^ T only appears in the parameter, not in the return type
// Better: function bad(arr: unknown[]): void

// GOOD: T connects input and output
function good<T>(arr: T[]): T | undefined {
  return arr[0];
}
// ^ T ensures: "what goes in, comes back out"
```

> **Rule of thumb:** A type parameter should appear at least **twice**.
> Once in the parameter AND once in the return type (or in another
> parameter). Otherwise it's superfluous.

---

## In your Angular project: generic functions everywhere

You write generic functions every day without realizing it:

```typescript annotated
// Angular service with generic helper function:
@Injectable({ providedIn: 'root' })
class DataService {
  // One function for all API endpoints:
  fetch<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(endpoint);
    // ^ T is determined by the caller — inference does NOT work here
    //   because TypeScript cannot look inside the HTTP response
  }

  // With transformation:
  fetchAndTransform<TRaw, TModel>(
    endpoint: string,
    transform: (raw: TRaw) => TModel
  ): Observable<TModel> {
    return this.http.get<TRaw>(endpoint).pipe(
      map(transform)
      // ^ map() is itself generic: map<TRaw, TModel>
    );
  }
}

// Usage — TypeScript infers TModel:
service.fetchAndTransform<UserDTO, User>(
  '/api/users/1',
  dto => ({ id: dto.userId, name: dto.fullName })
);
// ^ TRaw = UserDTO (explicit), TModel = User (inferred from transform)
```

**In React:**

```typescript
// A generic fetch hook for all API calls:
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  // ...fetch logic...
  return { data, loading };
}

// Usage:
const { data: users } = useFetch<User[]>('/api/users');
// users is User[] | null — full IDE support
```

---

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Build a pipe() function for two steps:
> function pipe<A, B, C>(
>   value: A,
>   fn1: (a: A) => B,
>   fn2: (b: B) => C
> ): C {
>   return fn2(fn1(value));
> }
>
> // Test these calls:
> const result1 = pipe("hello", s => s.length, n => n > 3);
> const result2 = pipe(42, n => String(n), s => s.split(""));
>
> // Hover over result1 and result2 — what are their types?
> // Then change fn1 so it returns the wrong type:
> const broken = pipe("hello", s => s.length, (s: string) => s.toUpperCase());
> // What does TypeScript say? Why exactly there?
> ```
>
> Observe how TypeScript marks **exactly the spot** where the types
> don't match — not in the `pipe` definition, but at the call site.

---

## What you've learned

- The basic syntax `function name<T>(arg: T): T` — type parameters in angle brackets before the parameters
- TypeScript automatically infers type parameters from the passed arguments (Hindley-Milner)
- Multiple type parameters `<T, U>` for functions that have different input and output types
- Arrow functions need a trailing comma in `.tsx` files: `<T,>`
- A type parameter that only appears once is usually superfluous — generics connect input and output

**Core concept:** Type parameter inference is the "magic" of TypeScript generics — you write type-safe code without constantly having to specify the type explicitly. The compiler takes care of it.

---

## Summary

| Concept | Syntax | Example |
|---------|--------|---------|
| Single type parameter | `<T>` | `function f<T>(x: T): T` |
| Multiple type parameters | `<T, U>` | `function f<T, U>(a: T, b: U): [T, U]` |
| Explicit type | `f<string>(...)` | When inference isn't enough |
| Inferred type | `f(...)` | TypeScript recognizes T automatically |
| Arrow function | `<T>(x: T): T => x` | In `.tsx`: use `<T,>` |

---

> 🧠 **Explain it to yourself:** Why should a type parameter appear at least
> twice? What happens when it only appears once?
> **Key points:** Once = no relationship established | Generics connect input and output | Otherwise unknown suffices

---

> **Pause point** — Good? Then continue to [Section 03: Generic Interfaces and Types](./03-generische-interfaces-und-types.md)