# Section 4: Generic Async Patterns — retry, timeout, race

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Error Handling in Async](./03-error-handling-async.md)
> Next section: [05 - AsyncIterable and Generators](./05-async-iterable-generators.md)

---

## What you'll learn here

- How to build generic wrapper functions for async operations
- The `retry<T>` pattern with exponential backoff and type safety
- The `timeout<T>` pattern with AbortController and type narrowing
- How `Promise.race()` is used for timeout patterns

---

## The Principle: Generic Async Wrappers

Many async operations follow the same pattern: you have an operation
that can fail, and you want to add retry logic, timeouts, or fallbacks
— without losing the type of the operation.

> 📖 **Background: The Decorator Principle in Async**
>
> In functional programming this is called "Higher-Order Functions":
> functions that wrap other functions and add behavior.
> In the OOP world it's the Decorator Pattern. TypeScript's generics
> make both type-safe — the wrapper type is determined by the wrapped type,
> without manual casting.
>
> This principle was popularized by libraries like `p-retry`, `p-timeout`,
> and `p-queue` by Sindre Sorhus — single, focused utility functions
> that can be composed together.

---

## Pattern 1: retry<T> with Type Safety

```typescript annotated
interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: "linear" | "exponential";
  // ^ Optional backoff mode — default value set in the implementation
  shouldRetry?: (error: unknown) => boolean;
  // ^ Optional: decides whether an error is retryable
}

async function retry<T>(
  fn: () => Promise<T>,
  // ^ Generic parameter T — inferred from fn!
  options: RetryOptions
): Promise<T> {
  // ^ Return type is Promise<T> — same type as fn()
  const { maxAttempts, delayMs, backoff = "exponential", shouldRetry } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
      // ^ On success: T is returned directly
    } catch (error) {
      lastError = error;
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
        // ^ Non-retryable error: rethrow immediately
      }
      if (attempt < maxAttempts) {
        const delay = backoff === "exponential"
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
  // ^ After maxAttempts: rethrow the last error
}

// Usage — T is inferred automatically:
const user = await retry(
  () => fetchUser("123"),
  // ^ fn: () => Promise<User> → T = User
  { maxAttempts: 3, delayMs: 1000 }
);
// ^ user: User — full type inference!
```

> 💭 **Think about it:** Why does `retry` take a function `() => Promise<T>`
> instead of a `Promise<T>` directly? What would the difference be?
>
> **Answer:** A Promise starts immediately when it is created.
> If you write `retry(fetchUser("123"), ...)`, the fetch has
> already started — retry couldn't start it again. With
> `() => fetchUser("123")`, retry can call the function anew on each attempt.

---

## Pattern 2: timeout<T> with AbortController

```typescript annotated
class TimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    // ^ Custom error name for instanceof checks
  }
}

async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  // ^ The function receives an AbortSignal — so it can cancel
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fn(controller.signal);
    // ^ T is inferred from fn
    return result;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new TimeoutError(timeoutMs);
      // ^ Timeout case: throw custom error class
    }
    throw error;
    // ^ Other error: rethrow
  } finally {
    clearTimeout(timeoutId);
    // ^ Always clean up — otherwise memory leak!
  }
}

// Usage:
const user = await withTimeout(
  (signal) => fetch("/api/users/123", { signal }).then(r => r.json()),
  // ^ signal is passed to fetch — fetch cancels on timeout
  5000
);
// ^ user: any — because of json(). Better: explicit annotation or Zod
```

> 🧠 **Explain to yourself:** Why is `AbortController` better than
> a simple `Promise.race()` with a timeout promise? What happens
> to the original operation with a plain race?
>
> **Key points:** Promise.race ignores the slow promise — it keeps running! |
> AbortController actually cancels the operation |
> Without abort: network request keeps running, consuming bandwidth |
> fetch() supports signal natively

---

## Pattern 3: Promise.race for Competitive Patterns

Sometimes you want the fastest result from multiple sources:

```typescript annotated
// Type: Promise.race<T[]>(promises: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>
// → The return type is the union of all possible values

// Pattern: Fastest Response Wins
async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  // ^ Same T for both sources — return type is Promise<T>
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs)
  );
  // ^ Promise<never> — resolve is never called
  // Therefore the union type is: T | never = T (never disappears)

  try {
    return await Promise.race([primary(), timeoutPromise]);
    // ^ Type: Promise<T | never> = Promise<T>
  } catch {
    return fallback();
    // ^ Fallback on timeout or error
  }
}

// Usage:
const config = await fetchWithFallback(
  () => fetchRemoteConfig(),
  () => loadLocalConfig(),
  3000
);
// ^ config: Config — type inference from the functions
```

> 🔬 **Experiment:** Combine retry and timeout into a robust
> fetch wrapper:
>
> ```typescript
> async function robustFetch<T>(
>   url: string,
>   options?: { retries?: number; timeoutMs?: number }
> ): Promise<T> {
>   const { retries = 3, timeoutMs = 5000 } = options ?? {};
>
>   return retry(
>     () => withTimeout(
>       (signal) => fetch(url, { signal }).then(r => {
>         if (!r.ok) throw new Error(`HTTP ${r.status}`);
>         return r.json() as Promise<T>;
>       }),
>       timeoutMs
>     ),
>     { maxAttempts: retries, delayMs: 1000 }
>   );
> }
>
> // Test: What is the type of result?
> const result = await robustFetch<User[]>("/api/users");
> // result: User[] — the type parameter is threaded through
> ```

---

## Pattern 4: Debounce and Throttle with Types

Especially in UIs (Angular, React) you need type-safe debounce:

```typescript annotated
function debounceAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  // ^ Generics for both arguments AND return type
  delayMs: number
): (...args: TArgs) => Promise<TResult> {
  // ^ Return type: same signature as fn
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingReject: ((reason: Error) => void) | null = null;

  return (...args: TArgs): Promise<TResult> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingReject?.(new Error("Debounced"));
    }
    return new Promise<TResult>((resolve, reject) => {
      pendingReject = reject;
      timeoutId = setTimeout(async () => {
        try {
          resolve(await fn(...args));
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
}

// Usage — types are correctly inferred:
const debouncedSearch = debounceAsync(
  (query: string) => searchAPI(query),
  // ^ TArgs = [string], TResult = SearchResult[]
  300
);
const results = await debouncedSearch("typescript");
// ^ results: SearchResult[] — full type inference
```

> ⚡ **Practical tip for Angular and React:**
>
> ```typescript
> // Angular: debounceTime is the RxJS equivalent
> this.searchInput.valueChanges.pipe(
>   debounceTime(300),
>   switchMap(query => this.searchService.search(query))
> ).subscribe(results => { /* results: SearchResult[] */ });
>
> // React: useDeferredValue or custom hook
> function useDebounced<T>(value: T, delayMs: number): T {
>   const [debounced, setDebounced] = useState(value);
>   useEffect(() => {
>     const id = setTimeout(() => setDebounced(value), delayMs);
>     return () => clearTimeout(id);
>   }, [value, delayMs]);
>   return debounced;
> }
> ```

---

## Combination: The Utility Toolbox

The patterns can be freely combined, and TypeScript
preserves the types throughout:

```typescript
// Everything together:
async function loadDashboard(userId: string) {
  const [user, posts, notifications] = await Promise.all([
    retry(() => withTimeout(
      (signal) => fetchUser(userId, signal),
      5000
    ), { maxAttempts: 3, delayMs: 1000 }),

    retry(() => fetchPosts(userId), { maxAttempts: 2, delayMs: 500 }),

    fetchWithFallback(
      () => fetchNotifications(userId),
      () => Promise.resolve([]),
      3000
    ),
  ]);
  // user: User, posts: Post[], notifications: Notification[]
  // All types correctly inferred through Promise.all tuple!
  return { user, posts, notifications };
}
```

---

## What you've learned

- Generic wrappers (`retry<T>`, `withTimeout<T>`) preserve the type of the wrapped operation
- `retry` takes `() => Promise<T>` (not `Promise<T>`), so the operation can be repeated
- `AbortController` truly cancels operations — `Promise.race` lets them keep running
- `Promise<never>` as a timeout promise disappears in the union: `T | never = T`
- All patterns are composable — TypeScript preserves tuple types with `Promise.all`

**Core concept to remember:** Generic async wrappers are Higher-Order Functions for Promises. The type parameter `T` flows through every layer — you never need to cast manually when the signatures are correct.

---

> **Pause point** — You now have a solid toolbox for robust
> async code. The next section dives into the world of Async
> Iterators.
>
> Continue with: [Section 05: AsyncIterable and Generators](./05-async-iterable-generators.md)