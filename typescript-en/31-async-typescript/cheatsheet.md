# Cheatsheet: Async TypeScript

Quick reference for Lesson 31.

---

## Promise Types

```typescript
// Promise<T> — T is the resolved value
const p: Promise<string> = Promise.resolve("hello");

// PromiseLike<T> — minimal interface (only then())
function accept(p: PromiseLike<string>) { p.then(s => s.toUpperCase()); }

// Awaited<T> — recursively unwraps nested Promises
type A = Awaited<Promise<Promise<string>>>; // string

// Error type is ALWAYS any — not trackable!
p.catch((reason: any) => { /* ... */ });
```

---

## async/await Types

```typescript
// async ALWAYS wraps in Promise<T>
async function f(): Promise<number> { return 42; }

// await unwraps Promise<T> to T
const n: number = await f();

// json() returns Promise<any> — ALWAYS annotate explicitly!
const data: User = await response.json(); // Trust me
```

---

## Error Handling

```typescript
// tsconfig: "useUnknownInCatchVariables": true (part of strict)
try { await riskyOp(); }
catch (error) { // error: unknown
  if (error instanceof Error) {
    console.log(error.message); // OK
  }
}

// Async Result Pattern
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function trySafe<T>(p: Promise<T>): Promise<Result<T>> {
  try { return { ok: true, value: await p }; }
  catch (e) { return { ok: false, error: e instanceof Error ? e : new Error(String(e)) }; }
}
```

---

## Generic Async Patterns

```typescript
// retry<T> — takes a function (not a Promise!) for repeatability
async function retry<T>(fn: () => Promise<T>, opts: { maxAttempts: number; delayMs: number }): Promise<T>;

// withTimeout<T> — with AbortController
async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T>;

// Combination:
const user = await retry(
  () => withTimeout(signal => fetchUser("1", signal), 5000),
  { maxAttempts: 3, delayMs: 1000 }
);
```

---

## Promise.all / race / allSettled

```typescript
// Promise.all — tuple type
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
// [User, Post[]]

// Promise.race — union type
const fastest = await Promise.race([fetchA(), fetchB()]);
// A | B

// Promise.allSettled — PromiseSettledResult
const results = await Promise.allSettled([a(), b()]);
// [PromiseSettledResult<A>, PromiseSettledResult<B>]
```

---

## AsyncGenerator

```typescript
// Definition
async function* paginate<T>(fetchPage: (cursor?: string) => Promise<{ data: T[]; next: string | null }>): AsyncGenerator<T[]> {
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    yield page.data;
    cursor = page.next ?? undefined;
  } while (cursor);
}

// Consuming
for await (const page of paginate(fetchUsers)) {
  // page: User[]
}
```

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| Forgotten `await` | Variable is a Promise instead of a value | Add await before the call |
| `ids.forEach(async ...)` | Promises are not collected | `Promise.all(ids.map(...))` |
| `response.json()` without type | Result is `any` | Explicit annotation or Zod |
| `HttpClient.get<T>()` | No runtime check | Zod/Valibot validation |
| `Promise.race` without abort | Slow Promise keeps running | Use `AbortController` |
| `retry(fetchUser("1"))` | Promise already started | `retry(() => fetchUser("1"))` |