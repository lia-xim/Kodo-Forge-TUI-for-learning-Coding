# Section 5: AsyncIterable and Generators

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Generic Async Patterns](./04-generische-async-patterns.md)
> Next section: [06 - Practice: Angular HttpClient, React Query, fetch Wrapper](./06-praxis-frameworks.md)

---

## What you'll learn here

- How `AsyncGenerator<T>` and `AsyncIterable<T>` are typed
- The difference between `yield` and `return` in the type system
- How `for await...of` correctly infers the type
- Practical patterns: streaming, pagination, event streams

---

## The Story: From Sync to Async Iteration

ES2015 introduced synchronous iterators (`for...of`, `Symbol.iterator`).
ES2018 extended the concept with asynchronous iterators (`for await...of`,
`Symbol.asyncIterator`). TypeScript has supported both since TS 2.3
with dedicated interfaces.

> 📖 **Background: Why do we need async iteration?**
>
> Synchronous iterators must deliver their values immediately. But what if
> each value first needs to be fetched from an API? Or if a
> WebSocket stream delivers messages at irregular intervals?
> Async iterators solve exactly this problem: each `next()` call
> returns a `Promise` that resolves when the next
> value is ready.
>
> In practice, you'll encounter async iterators with: Server-Sent Events,
> WebSocket streams, paginated API responses, file streaming with
> Node.js `fs.createReadStream()`, and AI streaming (ChatGPT-style).

---

## The Interfaces: AsyncIterator and AsyncIterable

TypeScript defines three related interfaces:

```typescript annotated
// 1. AsyncIterator — the core interface
interface AsyncIterator<T, TReturn = any, TNext = undefined> {
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  // ^ next() returns a Promise — NOT directly an IteratorResult
  // T = type of yielded values
  // TReturn = type of the return value (usually void or any)
  // TNext = type of values passed into next()

  return?(value?: TReturn): Promise<IteratorResult<T, TReturn>>;
  throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}

// 2. AsyncIterable — has Symbol.asyncIterator
interface AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
  // ^ The method that for-await-of calls
}

// 3. AsyncGenerator — combines both
interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown>
  extends AsyncIterator<T, TReturn, TNext> {
  // AsyncGenerator IS an AsyncIterator
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  return(value: TReturn): Promise<IteratorResult<T, TReturn>>;
  throw(e: any): Promise<IteratorResult<T, TReturn>>;
  [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
  // ^ AND an AsyncIterable — can therefore be used in for-await-of
}
```

---

## Async Generators in Practice

```typescript annotated
// Simple async generator
async function* countdown(from: number): AsyncGenerator<number> {
  // ^ async function* — the star makes it a generator
  // ^ Return type: AsyncGenerator<number>
  for (let i = from; i > 0; i--) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
    // ^ yield delivers the next value (type: number)
  }
  // Implicit return: void (no explicit return value)
}

// Usage with for-await-of
async function runCountdown() {
  for await (const n of countdown(5)) {
    // ^ n: number — TypeScript infers the type from the yield type
    console.log(n); // 5, 4, 3, 2, 1
  }
}
```

### yield vs return in the Type System

```typescript annotated
async function* generate(): AsyncGenerator<string, number, boolean> {
  // ^ <Yield type, Return type, Next type>
  const input = yield "hello";
  // ^ yield returns string, input is boolean (TNext)
  const input2 = yield "world";
  return 42;
  // ^ return value has type number (TReturn)
}

async function consumer() {
  const gen = generate();
  const first = await gen.next();
  // ^ first: IteratorResult<string, number>
  // first = { value: "hello", done: false }

  const second = await gen.next(true);
  // ^ true becomes the TNext parameter (boolean)
  // second = { value: "world", done: false }

  const last = await gen.next(false);
  // ^ last = { value: 42, done: true }
  // last.value: number (the return type)
}
```

> 💭 **Think about it:** Why does `IteratorResult<T, TReturn>` have two
> different types for `value` — depending on whether `done` is true or
> false? Why not simply use `T | TReturn`?
>
> **Answer:** It's a discriminated union!
> `{ done: false; value: T } | { done: true; value: TReturn }`.
> When you check `if (!result.done)`, TypeScript automatically narrows `value`
> to `T`. With `done: true` it becomes `TReturn`.
> This is the same principle as with fetch states from L12.

---

## Practical Pattern: Paginated API Query

```typescript annotated
interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  // ^ null means: no more pages
}

async function* paginate<T>(
  fetchPage: (cursor?: string) => Promise<PaginatedResponse<T>>
): AsyncGenerator<T[], void> {
  // ^ Yield type: T[] (one page), Return type: void
  let cursor: string | undefined;
  do {
    const response = await fetchPage(cursor);
    yield response.data;
    // ^ Each page is delivered as T[]
    cursor = response.nextCursor ?? undefined;
  } while (cursor);
}

// Usage:
async function getAllUsers() {
  const allUsers: User[] = [];
  for await (const page of paginate<User>(cursor =>
    fetch(`/api/users?cursor=${cursor ?? ""}`).then(r => r.json())
  )) {
    // ^ page: User[] — each iteration is one page
    allUsers.push(...page);
    console.log(`Loaded: ${allUsers.length} users`);
  }
  return allUsers;
}
```

> 🧠 **Explain it to yourself:** Why is an async generator better
> than a recursive function for pagination? Think about memory usage
> and control.
>
> **Key points:** Generator delivers pages one at a time — not everything
> in memory at once | Caller decides when the next
> page is loaded | `break` in `for await...of` stops loading |
> Recursion would need to load all pages at once

---

## Practical Pattern: Event Stream

```typescript annotated
// Wrap a WebSocket as an AsyncIterable
function websocketStream<T>(url: string): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      const ws = new WebSocket(url);
      const queue: T[] = [];
      // ^ Message buffer
      let resolve: ((result: IteratorResult<T>) => void) | null = null;
      let done = false;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as T;
        if (resolve) {
          resolve({ value: data, done: false });
          resolve = null;
        } else {
          queue.push(data);
        }
      };
      ws.onclose = () => {
        done = true;
        resolve?.({ value: undefined as any, done: true });
      };

      return {
        async next(): Promise<IteratorResult<T>> {
          if (queue.length > 0) {
            return { value: queue.shift()!, done: false };
          }
          if (done) return { value: undefined as any, done: true };
          return new Promise(r => { resolve = r; });
        },
        async return() {
          ws.close();
          return { value: undefined as any, done: true };
        },
        [Symbol.asyncIterator]() { return this; }
      };
    }
  };
}

// Usage — clean and type-safe:
for await (const message of websocketStream<ChatMessage>("wss://chat.example.com")) {
  // ^ message: ChatMessage — type determined by the type parameter
  console.log(`${message.user}: ${message.text}`);
}
```

> ⚡ **Practical tip for Angular:** In Angular you use RxJS Observables
> instead of AsyncIterables for streams. But you can convert Observables to
> AsyncIterables:
>
> ```typescript
> // Observable → AsyncIterable (experimental feature in RxJS 7+)
> import { from } from 'rxjs';
>
> // AsyncIterable → Observable
> const obs$ = from(websocketStream<ChatMessage>("wss://..."));
>
> // In Angular 17+ with Signals:
> const messages = toSignal(obs$, { initialValue: [] });
> ```

---

## for await...of: Type Safety When Consuming

```typescript
// TypeScript checks the type automatically:
async function processStream(stream: AsyncIterable<LogEntry>) {
  for await (const entry of stream) {
    // ^ entry: LogEntry — correctly inferred
    if (entry.level === "error") {
      await notifyAdmin(entry);
    }
  }
}
```

> 🔬 **Experiment:** Build a simple async generator that delivers numbers
> with a delay and consume it:
>
> ```typescript
> async function* delayedRange(start: number, end: number, delayMs: number) {
>   for (let i = start; i <= end; i++) {
>     await new Promise(r => setTimeout(r, delayMs));
>     yield i;
>   }
> }
>
> // Consume it and observe the types:
> for await (const num of delayedRange(1, 5, 500)) {
>   console.log(num); // What is the type of num?
>   if (num === 3) break; // What happens to the generator here?
> }
> // Answer: num is number, break implicitly calls gen.return()
> ```

---

## What you've learned

- `AsyncGenerator<Y, R, N>` has three type parameters: Yield, Return, Next
- `for await...of` infers the type from the yield type parameter
- `IteratorResult<T, TReturn>` is a discriminated union with `done` as the discriminant
- Async generators are a perfect fit for pagination and streaming
- `break` in `for await...of` automatically calls `return()` on the generator

**Key concept to remember:** Async generators are "lazy" — they compute values only when requested. This makes them ideal for streams and pagination, where you don't want to load all data at once. TypeScript's type system ensures that every `yield` value has the correct type.

---

> **Pause point** — You now know the advanced async primitives as well.
> The final section brings everything into the framework context.
>
> Continue with: [Section 06: Practice — Angular, React, fetch Wrapper](./06-praxis-frameworks.md)