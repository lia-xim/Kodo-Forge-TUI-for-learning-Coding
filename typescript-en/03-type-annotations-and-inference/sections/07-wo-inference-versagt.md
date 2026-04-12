# Section 7: Where Inference Fails

**Estimated reading time:** ~10 minutes

## What you'll learn here

- The six systematic places where inference delivers inadequate types
- **Why** it fails there — not just that it does
- Design decisions behind `Object.keys()` and `JSON.parse()`
- The "Golden Rules" and the big picture: When to annotate, when to infer

---

## Reflection Questions for This Section

1. **Why is `Object.keys(user) as (keyof typeof user)[]` technically unsafe?**
2. **Why does `JSON.parse()` return the type `any` — and why can't TypeScript do better?**

---

## Inference fails systematically — not randomly

If you've understood the previous sections, you can **predict** the places where inference fails. Inference needs **information** — and there are precisely defined places where that information is missing.

### The analogy: The detective without clues

Remember the detective from Section 1. He draws conclusions from clues — but what if there aren't any?

- **Empty array** = Empty crime scene. No traces, no deduction possible.
- **JSON.parse** = Sealed envelope. The detective doesn't know what's inside until he opens it — but that only happens at runtime.
- **Separate callback** = Witness in another room. The detective can't question him because he only sees the current room (local analysis).

---

## Case 1: Empty Arrays

```typescript
const items = [];        // Type: any[]  <-- dangerous!
items.push("hello");     // No error
items.push(42);          // No error -- anything goes in!
```

**Why?** TypeScript has no elements from which it could infer the type. An empty array is a "crime scene without traces".

**Solution: Always annotate.**

```typescript
const items: string[] = [];
items.push("hello");     // OK
items.push(42);          // ERROR -- exactly what we want
```

> **Deeper Knowledge:** Technically, in newer TypeScript versions, `const items = []` infers the type `any[]` only when `noImplicitAny` is turned off. With `noImplicitAny: true` (recommended!), you get an error: "Variable 'items' implicitly has type 'any[]'". In `strict` mode configuration, `noImplicitAny` is automatically enabled. This means: with the correct configuration, TypeScript **forces** you to annotate empty arrays. If you don't see an error, check your `tsconfig.json`.

---

## Case 2: Object.keys() — a deliberate design decision

```typescript
const user = { name: "Max", age: 30 };
const keys = Object.keys(user);
// Type: string[]  --  NOT ("name" | "age")[]!
```

This surprises almost every TypeScript developer. Why doesn't `Object.keys()` return the concrete keys?

> **Background:** This is one of the most debated design decisions in TypeScript. The reason lies in the **structural type system**. In TypeScript, an object can have **more properties** than its type declares:

```typescript
interface User {
  name: string;
  age: number;
}

function processUser(user: User) {
  const keys = Object.keys(user);
  // keys could contain ["name", "age", "email", "lastLogin", ...]
  // Because the object can have more properties at runtime
}

// Proof:
const extendedUser = { name: "Max", age: 30, email: "max@example.com" };
processUser(extendedUser);  // Allowed! Structural typing.
// Object.keys() now returns ["name", "age", "email"] -- 3 keys, not 2!
```

If `Object.keys()` had the type `(keyof User)[]`, that would be **unsafe**, because there can be keys not declared in `User`. TypeScript chooses safety over precision here.

**Workaround (use with caution):**

```typescript
// Only use when you're SURE no extra properties exist
const keys = Object.keys(user) as (keyof typeof user)[];
// keys: ("name" | "age")[]
```

> **Think about it:** Why is `Object.keys(user) as (keyof typeof user)[]` **technically unsafe**? Think about the `extendedUser` example above. The cast lies — it claims the keys are only "name" and "age", but at runtime there could be more.

---

## Case 3: Separate Callback Definitions

```typescript
const handler = (event) => { ... };  // event: any -- no context!
document.addEventListener("click", handler);
```

**Why?** You learned this in Section 5: TypeScript analyzes locally. When the callback is defined separately, the contextual typing information is missing.

**Solution: Annotate or use inline.**

```typescript
// Option 1: Inline (Contextual Typing works)
document.addEventListener("click", (event) => { /* event: MouseEvent */ });

// Option 2: Separately with annotation
const handler = (event: MouseEvent) => { /* ... */ };
```

---

## Case 4: JSON.parse() and fetch().json()

```typescript
const data = JSON.parse('{"name": "Max"}');
// Type: any  --  TS doesn't know what's in the JSON!
```

**Why?** JSON is a **runtime format**. TypeScript cannot know at compile time what's in a JSON string. This is a fundamental limit: the type checker works at compile time, JSON is parsed at runtime.

**Solution — three levels:**

```typescript
// Level 1: Simple annotation (trust-based)
interface User { name: string; age: number; }
const data: User = JSON.parse(responseBody);
// Simple, but: if the JSON doesn't match the expected structure,
// TypeScript does NOT catch it. The error only shows up at runtime.

// Level 2: Generic with fetch (Angular HttpClient)
// Angular's HttpClient has built-in generics:
this.http.get<User[]>('/api/users').subscribe(users => {
  // users is User[] -- but only because we told the HttpClient that
});

// Level 3: Runtime validation (the safest option)
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const data = UserSchema.parse(JSON.parse(responseBody));
// data is GUARANTEED to be { name: string; age: number }
// If the JSON doesn't match, an exception is thrown -- at runtime!
```

> **Practical Tip:** In Angular projects, you almost always use `HttpClient` with generics (`this.http.get<T>`). That's Level 2 — sufficient for most cases since you control the API. For external APIs or user input, Level 3 (zod, io-ts, valibot) is recommended.

---

## Case 5: Overly Complex Return Types

```typescript
function parseInput(input: string) {
  if (input === "null") return null;
  if (input === "undefined") return undefined;
  if (input === "true") return true;
  if (input === "false") return false;
  if (!isNaN(Number(input))) return Number(input);
  return input;
}
// Return type: string | number | boolean | null | undefined
// Is that intentional? Almost certainly not.
```

**Why is this a problem?** The caller has to handle **all** possible types, leading to a cascade of narrowing checks:

```typescript
const result = parseInput(userInput);
// Now you need:
if (result === null) { /* ... */ }
else if (result === undefined) { /* ... */ }
else if (typeof result === "boolean") { /* ... */ }
else if (typeof result === "number") { /* ... */ }
else { /* result is string */ }
```

**Solution: Annotate the return type or simplify the function.**

```typescript
// Option 1: Annotate -- documents the intention
function parseInput(input: string): string | number | null {
  if (input === "null") return null;
  if (!isNaN(Number(input))) return Number(input);
  return input;
}

// Option 2: Discriminated Union -- even better
type ParseResult =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "null" };

function parseInput(input: string): ParseResult {
  if (input === "null") return { type: "null" };
  const num = Number(input);
  if (!isNaN(num)) return { type: "number", value: num };
  return { type: "string", value: input };
}
```

---

## Case 6: Promise Chains and async/await

```typescript
async function loadData() {
  const response = await fetch("/api/users");
  if (!response.ok) return null;
  const data = await response.json();  // Type: any!
  return data;
}
// Return: Promise<any>  --  the annotation at .json() is missing

// Solution:
async function loadData(): Promise<User[] | null> {
  const response = await fetch("/api/users");
  if (!response.ok) return null;
  const data: User[] = await response.json();
  return data;
}
```

> **Practical Tip:** In Angular you use HttpClient instead of fetch, and there you have generics:
> ```typescript
> async loadData(): Promise<User[] | null> {
>   return firstValueFrom(
>     this.http.get<User[]>('/api/users').pipe(
>       catchError(() => of(null))
>     )
>   );
> }
> ```

---

## The "Golden Rules" — the big picture

After seven sections, you have the complete picture. Here are the rules that guide all your annotation behavior:

### The guiding principle: "Annotate at boundaries, infer inside"

```
  +---------------------------------------------------------+
  |  OUTSIDE: Annotate                                      |
  |                                                         |
  |  - Function parameters                                  |
  |  - Exported return types                                |
  |  - API responses / JSON.parse                           |
  |  - Empty arrays                                         |
  |  - Variables without initial value                      |
  |                                                         |
  |  +---------------------------------------------------+  |
  |  |  INSIDE: Let TypeScript infer                     |  |
  |  |                                                   |  |
  |  |  - Local variables with a value                   |  |
  |  |  - Callback parameters (Contextual Typing)        |  |
  |  |  - Intermediate results                           |  |
  |  |  - const values                                   |  |
  |  +---------------------------------------------------+  |
  |                                                         |
  |  SPECIAL: satisfies / as const                          |
  |  - Config objects: satisfies                            |
  |  - Enum replacement: as const                           |
  |  - Maximum precision: as const satisfies                |
  +---------------------------------------------------------+
```

### The nine golden rules

1. **Always annotate parameters** — TS cannot infer them
2. **Annotate exported return types** — better error messages, stable API
3. **Do NOT annotate local variables with a value** — inference is correct and more precise
4. **Do NOT annotate callback parameters** — Contextual Typing handles it
5. **Use `as const`** when you need literal types
6. **Always annotate variables without an initial value** — otherwise `any`
7. **Use `satisfies`** when you want validation AND precise types
8. **Always annotate empty arrays** — otherwise `any[]`
9. **Always annotate external data (JSON.parse, API responses)** — TS cannot know the runtime type

---

## Common Anti-Patterns

### Anti-Pattern 1: Annotating everything ("better safe than sorry")

```typescript
// BAD
const name: string = "Matthias";
const doubled: number[] = items.map((n: number): number => n * 2);

// GOOD
const name = "Matthias";
const doubled = items.map(n => n * 2);
```

### Anti-Pattern 2: Fighting against inference

```typescript
// BAD: Ignoring inference
const result = fetchData() as any;
const count = someFunction() as number;

// GOOD: Trusting inference
const result = fetchData();
```

### Anti-Pattern 3: Using `as const` without understanding it

```typescript
// BAD: as const everywhere, even where it's unnecessary
const x = 42 as const;  // Redundant! const x = 42 already gives the type 42

// GOOD: as const used intentionally with objects and arrays
const THEMES = ["light", "dark"] as const;  // Makes sense: readonly ["light", "dark"]
```

---

## What you've learned

- Inference fails at **six systematic places** — empty arrays, Object.keys(), separate callbacks, JSON.parse, complex returns, Promise chains
- Each failure case has a **concrete reason**: missing information, runtime limits, or local analysis
- **Object.keys()** intentionally returns `string[]` — because of structural typing
- **"Annotate at boundaries, infer inside"** is the guiding principle for all your TypeScript
- The **nine golden rules** cover all everyday situations

---

## Experiment Box: Testing Inference Limits

> **Experiment:** Try the following in the TypeScript Playground and observe where inference gives up:
>
> ```typescript
> // Case 1: Empty array
> const items = [];
> items.push("hello");
> items.push(42);
> // Are both push() calls allowed? Why?
>
> // Case 2: Object.keys()
> const user = { name: "Max", age: 30 };
> const keys = Object.keys(user);
> // Hover over 'keys' -- is it ("name" | "age")[] or string[]?
>
> // Case 3: JSON.parse
> const data = JSON.parse('{"x": 1}');
> // Hover over 'data' -- what type? What can you do with 'data.x'?
>
> // Case 4: Separate callback without context
> const fn = (n) => n * 2;
> [1, 2, 3].map(fn);
> // Hover over 'n' in the callback definition -- does 'n' have a type?
>
> // Case 5: Promise chain without annotation
> async function loadData() {
>   const response = await fetch("/api/users");
>   const data = await response.json();
>   return data;
> }
> // Hover over 'loadData' -- what is the return type? What's missing?
> ```
>
> For each case, name the reason why inference fails — which of the six systematic cases does it belong to?

---

## Rubber Duck Prompt

Explain the "nine golden rules" to an imaginary colleague in your own words. If you can't explain **why** a rule holds (not just **that** it holds), go back to the relevant section.

Especially important:
- Why does `Object.keys()` return `string[]`? (Section 7)
- Why does a separate callback lose its context? (Section 5)
- Why is `as const` redundant for primitives with `const`? (Section 4)

---

## What's next?

You now have the complete picture of type annotations and inference. To consolidate your knowledge:

1. Complete the **Quiz** — it brings the most important concepts back into focus
2. Use the **Cheatsheet** as a quick reference in your next projects
3. Look at your next Angular or React project with fresh eyes: Where are you annotating at boundaries? Where are you letting TypeScript infer?