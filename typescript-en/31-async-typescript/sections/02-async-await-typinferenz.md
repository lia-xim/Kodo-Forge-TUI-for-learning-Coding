# Section 2: async/await and Type Inference

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Promise Types](./01-promises-typen.md)
> Next section: [03 - Error Handling in Async](./03-error-handling-async.md)

---

## What you'll learn here

- How TypeScript automatically infers the return type of `async` functions
- Why `async` ALWAYS returns `Promise<T>` — even when you return `T` directly
- How type inference flows through `.then()` chains and where it breaks
- The differences between explicit annotation and inference in async code

---

## async Functions: Automatic Promise Wrapping

Every `async` function automatically returns a `Promise<T>`. TypeScript
infers `T` from the `return` statement:

```typescript annotated
async function getUser(id: string) {
  // ^ Inferred return type: Promise<User>
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  // ^ data: any — json() returns Promise<any>!
  return data as User;
  // ^ Through 'as User' the return type becomes Promise<User>
}

async function getCount(): Promise<number> {
  // ^ Explicit annotation — often better for public APIs
  return 42;
  // ^ TypeScript automatically wraps 42 in Promise.resolve(42)
  // You return number, but the type is Promise<number>
}
```

> 📖 **Background: Why async always returns Promise**
>
> This isn't a TypeScript feature — it's a JavaScript specification (ES2017).
> When you write `async function f() { return 42; }`, `f()`
> returns a `Promise<number>` — not `42` directly. This is because
> the JavaScript engine automatically wraps the return value in
> `Promise.resolve()`. TypeScript mirrors this behavior exactly
> in the type system.

---

## await and Type Unwrapping

`await` unwraps a `Promise<T>` to `T`. TypeScript uses `Awaited<T>`
internally for this operation:

```typescript annotated
async function demo() {
  const p: Promise<string> = Promise.resolve("hello");
  const result = await p;
  // ^ result: string — await unwraps Promise<string> to string

  const nested: Promise<Promise<number>> = Promise.resolve(Promise.resolve(42));
  const value = await nested;
  // ^ value: number — await unwraps RECURSIVELY (not Promise<number>!)

  const plain = await 42;
  // ^ plain: number — await on a non-Promise is a no-op in the type
  // (JavaScript still waits one microtask)
}
```

### The Inference Chain with async/await

TypeScript tracks types through the entire async chain:

```typescript annotated
interface User { name: string; age: number }
interface Post { title: string; authorId: string }

async function getUserPosts(userId: string): Promise<Post[]> {
  const user = await fetchUser(userId);
  // ^ user: User — await unwraps Promise<User>

  const posts = await fetchPostsByAuthor(user.name);
  // ^ posts: Post[] — type flows from user.name (string) onward

  return posts;
  // ^ TypeScript checks: Post[] is compatible with Promise<Post[]> ✓
}

async function fetchUser(id: string): Promise<User> {
  return { name: "Max", age: 30 };
  // ^ TypeScript automatically wraps the object literal
}

async function fetchPostsByAuthor(name: string): Promise<Post[]> {
  return [{ title: "Hello", authorId: "1" }];
}
```

> 💭 **Think about it:** If an async function never uses `await`,
> is it still async? What's the type difference?
>
> **Answer:** Yes, it's still async — the return type is
> always `Promise<T>`. But: without `await`, the function
> could be written as a regular synchronous function. The TypeScript
> compiler won't warn you, but ESLint has the
> `require-await` rule that detects this. In practice: if you don't
> need `await`, don't make the function `async`.

---

## Explicit Annotation vs Inference

With async functions, there's an important decision to make:

```typescript
// Option A: Inference (TypeScript derives the type)
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // Return type: Promise<any> — DANGEROUS!
}

// Option B: Explicit annotation (you tell TypeScript what to expect)
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // TypeScript checks: any is assignable to User ✓
  // BUT: This is a "Trust me, compiler" — no runtime validation!
}
```

### When to annotate explicitly?

The rule is simple:

```typescript annotated
// ✅ Annotate explicitly when:
// 1. Public API boundaries (exported functions)
export async function getUser(id: string): Promise<User> {
  // ^ Documentation + contract for other modules
  return fetchAndParse(id);
}

// 2. When inference would result in 'any'
async function parseResponse(): Promise<Config> {
  // ^ Without annotation the type would be Promise<any>
  const data = await response.json();
  return data;
}

// ✅ Use inference when:
// 3. Internal helper functions
async function enrichUser(user: User) {
  // ^ Promise<EnrichedUser> is correctly inferred
  const posts = await fetchPostsByUser(user.id);
  return { ...user, posts };
}
```

> 🧠 **Explain it to yourself:** Why is `response.json()` so dangerous
> for type inference? What does `json()` do differently from other methods?
>
> **Key points:** json() returns Promise<any> | any is "contagious" —
> everything derived from any is also any | Explicit annotation
> or as-cast required | Better: runtime validation (e.g. with Zod)

---

## Type Inference in .then() Chains

Even without `async/await`, TypeScript tracks types through `.then()`:

```typescript annotated
fetch("/api/users")
  .then(response => response.json())
  // ^ response: Response — correctly inferred
  // ^ return: Promise<any> — json() is any!
  .then((data: User[]) => data.filter(u => u.age > 18))
  // ^ Explicit annotation needed because of 'any' from json()
  // ^ return: User[] — filter returns User[]
  .then(adults => adults.map(u => u.name))
  // ^ adults: User[] — correctly inferred from the previous .then()
  // ^ return: string[] — map(u => u.name) yields string[]
  .then(names => console.log(names));
  // ^ names: string[] — type flows through correctly
```

> ⚡ **Practical tip for Angular:** In Angular you use RxJS instead of
> Promise chains. But type inference works similarly:
>
> ```typescript
> // Angular Observable chain — types flow through the same way:
> this.http.get<User[]>('/api/users').pipe(
>   map(users => users.filter(u => u.age > 18)),
>   // ^ users: User[] — inferred from the type parameter
>   map(adults => adults.map(u => u.name)),
>   // ^ adults: User[] — correctly through the pipe
> ).subscribe(names => {
>   // ^ names: string[] — correct all the way to subscribe
> });
> ```

---

## Common Mistakes with Async Type Inference

```typescript
// Mistake 1: Forgotten await
async function bad1() {
  const user = getUser("1"); // FORGOTTEN await!
  // ^ user: Promise<User> — NOT User!
  console.log(user.name); // ERROR: Property 'name' does not exist on Promise
}

// Mistake 2: async inside array methods
async function bad2(ids: string[]) {
  const users = ids.map(async id => await getUser(id));
  // ^ users: Promise<User>[] — array of Promises, NOT User[]!
  // Solution:
  const users2 = await Promise.all(ids.map(id => getUser(id)));
  // ^ users2: User[] — now correct!
}

// Mistake 3: forEach with async (fire-and-forget!)
async function bad3(ids: string[]) {
  ids.forEach(async id => {
    await deleteUser(id);
    // These Promises are NOT collected!
    // The function returns BEFORE all deletes are done.
  });
  // Solution: for...of or Promise.all
  for (const id of ids) {
    await deleteUser(id);
  }
}
```

> 🔬 **Experiment:** Write a function that fetches an array of URLs
> in parallel and returns the results. Observe the types:
>
> ```typescript
> async function fetchAll(urls: string[]): Promise<string[]> {
>   // Variant 1: Promise.all with map
>   return Promise.all(urls.map(url =>
>     fetch(url).then(r => r.text())
>   ));
>   // What type does the expression INSIDE Promise.all have?
>   // Answer: Promise<string>[] — an array of Promises
>   // Promise.all converts that to Promise<string[]>
> }
> ```

---

## What you've learned

- `async` ALWAYS wraps the return type in `Promise<T>` — even with a direct `return`
- `await` unwraps Promises recursively — nested Promises are resolved correctly
- `response.json()` returns `Promise<any>` — explicit annotation or validation required
- Array methods with async (map, forEach) need `Promise.all()` to collect correctly
- Explicit return types at API boundaries, inference for internal functions

**Core concept to remember:** The biggest pitfall with async inference is `any` — it sneaks in through `json()`, `JSON.parse()`, and other untyped sources. Explicit annotations in the right places are your protection.

---

> **Pause point** — You now understand how TypeScript infers async types.
> The next section covers the biggest weakness: error handling.
>
> Continue with: [Section 03: Error Handling in Async](./03-error-handling-async.md)