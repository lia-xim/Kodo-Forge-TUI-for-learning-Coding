# Section 1: Promise Types — Promise<T> and PromiseLike

> Estimated reading time: **10 minutes**
>
> Previous section: — (Start)
> Next section: [02 - async/await and Type Inference](./02-async-await-typinferenz.md)

---

## What you'll learn here

- How `Promise<T>` is structured internally and why the type parameter `T` describes the resolved value
- The difference between `Promise<T>` and `PromiseLike<T>` — and when to use which
- How `Awaited<T>` automatically unwraps nested promises
- Why TypeScript cannot track the error type of `reject()`

---

## The Story: From Callbacks to Promises

Before ES2015 introduced Promises, asynchronous JavaScript code was a
nightmare of nested callbacks — the infamous "Callback Hell".
In 2012, Domenic Denicola proposed the Promises/A+ spec, which
later landed as a native `Promise` in ES2015.

TypeScript had an advantage from the start: the generic type
`Promise<T>` could precisely describe the resolved value. In
plain JavaScript you don't know what `fetch()` returns.
In TypeScript you do — at least at compile time.

> 📖 **Background: Why Promise is generic**
>
> The Promises/A+ spec only defines behavior: `.then()` takes
> callbacks, `.catch()` handles errors. TypeScript went further and
> introduced the type parameter `T`, which describes the type of the resolved value.
> This is a purely compile-time feature — at runtime a `Promise<string>` is
> identical to `Promise<number>`. Type erasure in action, once again.

---

## Promise<T> in Detail

The core type `Promise<T>` is defined in `lib.es2015.promise.d.ts`.
Let's look at the relevant parts:

```typescript annotated
interface Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    // ^ T is the resolved value — that's exactly what the type parameter describes
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    // ^ reason is 'any' — TypeScript CANNOT track reject types!
  ): Promise<TResult1 | TResult2>;
  // ^ The result is a new Promise with the transformed types

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult>;
  // ^ catch() returns T | TResult — the success case is preserved

  finally(onfinally?: (() => void) | null): Promise<T>;
  // ^ finally() does NOT change the type — it returns the same Promise<T>
}
```

### Why is `reason: any` and not `reason: unknown`?

This is a deliberate design decision. In JavaScript,
`throw` can throw **any value** — not just Error objects:

```typescript
// All of this is valid JavaScript:
throw new Error("normal");
throw "a string";
throw 42;
throw { code: "FAIL" };
throw undefined;
```

TypeScript cannot statically analyze which value ends up in `reject()`
or `throw`. That's why `reason: any` — a compromise between
usability and safety.

> 💭 **Think about it:** If TypeScript defined `reason` as `unknown` instead of `any`,
> what would change for developers? Would that be better or worse?
>
> **Answer:** With `unknown`, every `.catch()` handler would first have to check the
> error type (e.g. `if (reason instanceof Error)`) before accessing its properties.
> That would be safer, but would break existing code. TypeScript 4.4 introduced `useUnknownInCatchVariables`
> — but only for `catch` blocks, not for Promise.reject().

---

## PromiseLike<T> — The Minimal Interface

Alongside `Promise<T>` there is `PromiseLike<T>`. The difference is subtle
but important:

```typescript annotated
interface PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>;
  // ^ No catch(), no finally() — just then()
  // ^ This makes PromiseLike compatible with ANY "thenable"
}
```

### When do you need PromiseLike?

`PromiseLike<T>` is the interface for anything that has a `.then()` —
so-called "thenables". This is relevant for:

```typescript
// 1. Libraries with their own Promise implementations
// (Bluebird, Q, jQuery.Deferred)
function acceptAnyThenable(p: PromiseLike<string>) {
  return p.then(s => s.toUpperCase());
}

// 2. Angular's Zone.js Promises
// Zone.js wraps native Promises — PromiseLike accepts both

// 3. Interoperability in libraries
// When writing a library, accept PromiseLike<T>
// instead of Promise<T> — it's more flexible for users
```

> ⚡ **Practical tip for Angular:** In your Angular project you use
> `HttpClient`, which returns `Observable<T>`. When you use `.toPromise()`
> (deprecated) or `lastValueFrom()`, you get a
> `Promise<T>`. The HttpClient type parameter flows directly into the
> Promise type: `lastValueFrom(this.http.get<User[]>('/api'))` is
> `Promise<User[]>`.

---

## Awaited<T> — Unwrapping Promises

TypeScript 4.5 introduced the utility type `Awaited<T>`, which
recursively unwraps nested promises:

```typescript annotated
type A = Awaited<Promise<string>>;
// ^ string — one level unwrapped

type B = Awaited<Promise<Promise<number>>>;
// ^ number — TWO levels unwrapped (recursively!)

type C = Awaited<string>;
// ^ string — not a Promise, remains unchanged

type D = Awaited<Promise<string> | number>;
// ^ string | number — union is distributed (distributive)
```

### Why was Awaited introduced?

Before TypeScript 4.5, `Promise.all()` had a problem: the return type
could not correctly unwrap nested promises.

```typescript
// Before TS 4.5: problem with nested Promises
async function getUser(): Promise<Promise<string>> {
  // ... (e.g. double wrapping from library code)
  return Promise.resolve("Max");
}
// Return type was Promise<Promise<string>> instead of Promise<string>
// JavaScript unwraps automatically, but TS types didn't match

// From TS 4.5: Awaited unwraps correctly
type Result = Awaited<ReturnType<typeof getUser>>;
// Result = string (not Promise<string>!)
```

> 🧠 **Explain it to yourself:** Why does JavaScript automatically unwrap nested
> promises (`Promise.resolve(Promise.resolve(42))` yields
> `42`, not `Promise<42>`), while TypeScript needs the special
> type `Awaited<T>` for this?
>
> **Key points:** JavaScript has runtime unwrapping built in |
> TypeScript types are static — no automatic unwrapping |
> Awaited<T> mirrors runtime behavior in the type system

---

## Promise.all, Promise.race and Their Types

The static Promise methods have precise types:

```typescript annotated
// Promise.all — waits for ALL, type is a tuple
const results = await Promise.all([
  fetch("/api/users").then(r => r.json() as Promise<User[]>),
  fetch("/api/posts").then(r => r.json() as Promise<Post[]>),
]);
// ^ results: [User[], Post[]] — tuple type, order preserved!

// Promise.race — first one to finish wins
const fastest = await Promise.race([
  fetchWithTimeout<User>("/api/user", 5000),
  timeoutPromise<User>(5000),
]);
// ^ fastest: User — union of possible results

// Promise.allSettled — all results, including errors
const settled = await Promise.allSettled([
  fetchUser(),
  fetchPosts(),
]);
// ^ settled: [PromiseSettledResult<User>, PromiseSettledResult<Post[]>]
// PromiseSettledResult = { status: "fulfilled"; value: T } | { status: "rejected"; reason: any }
```

> 🔬 **Experiment:** Try this code in your IDE and observe
> the types:
>
> ```typescript
> async function experiment() {
>   const a = Promise.all([1, "hello", true] as const);
>   // What is the type of a? (Hover over it!)
>
>   const b = Promise.all([
>     Promise.resolve(42),
>     Promise.resolve("test"),
>   ]);
>   // What is the type of b?
>
>   const c = Promise.race([
>     new Promise<string>(r => setTimeout(() => r("slow"), 1000)),
>     new Promise<number>(r => setTimeout(() => r(42), 500)),
>   ]);
>   // What is the type of c? Is it string or number?
> }
> ```
>
> **Expected:** `a` is `Promise<readonly [1, "hello", true]>`,
> `b` is `Promise<[number, string]>`, `c` is `Promise<string | number>`.

---

## React Connection: Async Components and Promise Types

In React you encounter Promise types especially with data fetching:

```typescript
// React Server Components (Next.js) — async Components
async function UserProfile({ id }: { id: string }): Promise<JSX.Element> {
  const user = await fetchUser(id);
  // user: User — TypeScript infers the type from fetchUser
  return <div>{user.name}</div>;
}

// Client-side with React Query / TanStack Query
const { data } = useQuery<User, Error>({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
// data: User | undefined — the type parameter determines the type
```

---

## What you've learned

- `Promise<T>` describes the type of the resolved value — `T` is purely compile-time
- `PromiseLike<T>` is the minimal interface (only `.then()`) for interoperability
- `Awaited<T>` recursively unwraps nested promises — use it with `ReturnType`
- The error type is always `any` — TypeScript cannot track `reject()`/`throw`
- `Promise.all()` produces tuple types, `Promise.race()` produces union types

**Core concept to remember:** Promise<T> only tracks the success case. The error case is always `any`. That is the biggest gap in the async type system — and the reason why type-safe error handling (L25) is so important.

---

> **Pause point** — You now know the building blocks. In the next
> section we'll see how `async/await` automatically unwraps these types.
>
> Continue with: [Section 02: async/await and Type Inference](./02-async-await-typinferenz.md)