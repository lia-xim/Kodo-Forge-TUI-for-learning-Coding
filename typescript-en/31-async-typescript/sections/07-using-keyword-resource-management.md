# Section 7: The `using` Keyword — Explicit Resource Management

> Estimated reading time: **10 minutes**
>
> Previous section: [06 - Practice: Angular HttpClient, React Query, fetch Wrapper](./06-praxis-frameworks.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- Why resource leaks in JavaScript are a structural problem and how `using` solves it
- How `Symbol.dispose` and `Symbol.asyncDispose` define the `Disposable` interface
- How `using` and `await using` automatically clean up resources — even on exceptions
- How `DisposableStack` coordinates multiple resources and what it has in common with Angular's `DestroyRef`

---

## The Story: From C++ RAII to the Forgotten `cleanup()`

It's 2019. An experienced backend developer deploys a Node.js application.
After 48 hours of uptime: the server crashes. The cause? A database connection
pool with 1,000 open connections — all hanging, none being closed. The code
looked harmless:

```typescript
async function processUserRequest(userId: string) {
  const conn = await db.connect();
  const user = await conn.query(`SELECT * FROM users WHERE id = '${userId}'`);
  if (!user) {
    return null;       // ← conn.close() forgotten!
  }
  const result = await transformUser(user);
  conn.close();        // ← Only reached if no early return
  return result;
}
```

**Resources are opened, but closing them depends on the developer knowing
and accounting for every control flow path.** The classic workaround:
`try/finally` — correct, but a nesting nightmare with multiple resources.

> 📖 **Background: RAII — The Principle C++ Got Right**
>
> In 1984, Bjarne Stroustrup described the RAII principle (Resource Acquisition Is
> Initialization): resources are acquired when an object is created and
> automatically released when the object leaves its scope — regardless of whether
> this happens through normal flow, early return, or exception.
>
> Java has `try-with-resources` (since 2011), Python the `with` statement.
> JavaScript had nothing comparable for a long time. In October 2023,
> TypeScript 5.2 delivered the answer: the `using` keyword, as an implementation
> of the TC39 proposal "Explicit Resource Management" (Stage 4, part of the
> ECMAScript standard since 2023).

---

## `Symbol.dispose` and the `Disposable` Interface

The foundation of the system: two new well-known symbols and two interfaces
that TypeScript defines in `lib.esnext.d.ts`.

```typescript annotated
// The two new interfaces (directly from TypeScript's lib):
interface Disposable {
  [Symbol.dispose](): void;
  // ^ Synchronous cleanup — called when 'using' block ends
}

interface AsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
  // ^ Asynchronous cleanup — called with 'await using'
}
```

> 💭 **Think about it:** Why are `Symbol.dispose` and `Symbol.asyncDispose`
> **Symbols** and not simply strings like `"dispose"` or `"close"`?
>
> **Answer:** Symbols are guaranteed to be unique — no naming conflicts
> with existing methods. A class might already have a `dispose()` method
> that does something different. `Symbol.dispose` is a global, unique
> identifier. A class can have `close()`, `destroy()`, and
> `[Symbol.dispose]()` simultaneously without conflicts — this allows
> backwards-compatible retrofitting of existing APIs.

---

## The `using` Keyword: Automatic Cleanup

`using` behaves like `const` — with one crucial difference:
at the end of the block, `[Symbol.dispose]()` is called automatically,
**even if an exception was thrown**.

```typescript annotated
function getDbConnection(): Disposable & { query(sql: string): QueryResult } {
  const conn = db.connect();
  return {
    query: (sql) => conn.execute(sql),
    [Symbol.dispose]() {
      conn.close();
      // ^ Called AUTOMATICALLY when the 'using' block ends —
      //   regardless of normal flow, early return, or exception!
    }
  };
}

function processData(userId: string): QueryResult | null {
  using conn = getDbConnection();
  // ^ 'using' instead of 'const' — that's the only difference in the call!

  const user = conn.query(`SELECT * FROM users WHERE id = '${userId}'`);
  if (!user) {
    return null;
    // ^ Early return — conn[Symbol.dispose]() is STILL called!
  }
  return conn.query(`SELECT * FROM orders WHERE user_id = '${userId}'`);
  // ^ After this return: conn[Symbol.dispose]() closes the connection.
}
```

> 🧠 **Explain to yourself:** What happens when an exception is thrown inside
> the `using` block? Is `[Symbol.dispose]()` still called?
> And what happens if `[Symbol.dispose]()` itself throws an exception?
>
> **Key points:** `[Symbol.dispose]()` is always called — even on
> exceptions | If both the block and `dispose()` throw an exception,
> the block exception is linked to the dispose exception as a `SuppressedError`
> | Analogous behavior to Java's `try-with-resources`

---

## `await using`: Asynchronous Cleanup

For resources that need to be closed asynchronously — e.g. database transactions
with `COMMIT`/`ROLLBACK` — there is `await using`:

```typescript annotated
class DatabaseTransaction implements AsyncDisposable {
  private committed = false;
  constructor(private conn: Connection) {}

  async query(sql: string): Promise<QueryResult> { return this.conn.execute(sql); }

  async commit(): Promise<void> {
    await this.conn.execute('COMMIT');
    this.committed = true;
  }

  async [Symbol.asyncDispose](): Promise<void> {
    // ^ AsyncDisposable interface: returns Promise<void>
    if (!this.committed) {
      await this.conn.execute('ROLLBACK');
      // ^ Automatic rollback if commit() was not called!
    }
    await this.conn.close();
  }
}

async function transferMoney(fromId: string, toId: string, amount: number) {
  await using tx = new DatabaseTransaction(await db.connect());
  // ^ 'await using' — because [Symbol.asyncDispose] is async

  await tx.query(`UPDATE accounts SET balance = balance - ${amount} WHERE id = '${fromId}'`);
  await tx.query(`UPDATE accounts SET balance = balance + ${amount} WHERE id = '${toId}'`);
  await tx.commit();
  // ^ Only if commit() is called, no ROLLBACK.
  // ^ Exception before commit()? → tx[Symbol.asyncDispose]() does ROLLBACK + close().
  //   Atomic transaction without try/finally!
}
```

> 🔬 **Experiment: `using` with a Timer**
>
> ```typescript
> // tsconfig.json: "lib": ["ES2022", "ESNext"]
>
> function createTimer(label: string): Disposable {
>   const start = Date.now();
>   console.log(`[${label}] started`);
>   return {
>     [Symbol.dispose]() {
>       console.log(`[${label}] stopped: ${Date.now() - start}ms`);
>     }
>   };
> }
>
> function doWork() {
>   using _t = createTimer('doWork');
>   // ... some work ...
>   // "[doWork] stopped: Xms" appears automatically at block end
> }
> ```
>
> Change `using` to `const` — the stopped log never appears again.
> Deliberately throw an exception: with `using` the timer is still stopped.

---

## `DisposableStack`: Coordinating Multiple Resources

`DisposableStack` registers multiple resources dynamically and disposes them
in **LIFO order** (Last In, First Out) — exactly like C++ destructors:

```typescript annotated
function setupTestEnvironment() {
  using stack = new DisposableStack();
  // ^ DisposableStack itself implements Disposable!

  const db     = stack.use(openDatabase());
  // ^ stack.use() returns the resource — and registers it for cleanup.
  const cache  = stack.use(openCache());
  const logger = stack.use(openLogger());
  // ^ LIFO: logger → cache → db — dependencies respected!

  stack.defer(() => console.log('cleanup done'));
  // ^ defer() for logic without its own object

  return stack.move();
  // ^ Ownership transferred to caller: stack is empty,
  //   caller disposes the returned stack.
}

function runTest() {
  using env = setupTestEnvironment();
  env.db.query('INSERT INTO ...');
  // At the end: logger, cache, db automatically disposed — no try/finally!
}
```

---

## Angular Connection: `DestroyRef` and the `Disposable` Pattern

In your Angular day-to-day work you know the problem: subscriptions that
don't get unsubscribed, event listeners that hang around.
Angular 16+ `DestroyRef` solves exactly the same problem as `Symbol.dispose` — at the component level:

```typescript annotated
// Angular 16+: DestroyRef is Angular's "Disposable" protocol
@Injectable()
export class DataService {
  private destroyRef = inject(DestroyRef);

  startPolling(interval: number): void {
    const id = setInterval(() => this.fetchData(), interval);
    this.destroyRef.onDestroy(() => clearInterval(id));
    // ^ Called when the injection context is destroyed —
    //   exactly like Symbol.dispose when leaving the block!
  }
}

// 'using' for short-lived resources within a method:
function makeListenerDisposable(
  target: EventTarget, event: string, handler: EventListener
): Disposable {
  target.addEventListener(event, handler);
  return {
    [Symbol.dispose]() { target.removeEventListener(event, handler); }
    // ^ Same principle as destroyRef.onDestroy() — just without Angular DI
  };
}
```

> ⚡ **Practical Tip: Where `using` Makes Sense in Angular**
>
> `using` and Angular's `DestroyRef` solve the same problem at different
> levels. `DestroyRef.onDestroy()` is for the component/service lifecycle.
> `using` complements this for **short-lived resources within a method**:
> database connections in an Angular service (SSR), temporary event listeners
> in unit tests (Jest/Jasmine), or file handles in the Angular Universal context.
> In the medium term, `ngOnDestroy` could directly become `[Symbol.asyncDispose]()`.

---

## Requirements and Limitations

`using` requires TypeScript 5.2+ and the appropriate `tsconfig.json`:

```typescript
// tsconfig.json:
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "ESNext"]   // ESNext for Symbol.dispose
  }
}
```

Important limitations: `using` only works at block level (not as a class
property). In tight loops, each iteration creates a new resource —
there, `DisposableStack` outside the loop is often better. As a replacement
for Angular's dependency injection, `using` is not suitable — DI has its own
lifecycle that is more deeply integrated into the framework.

---

## What you've learned

- `using` is TypeScript 5.2's implementation of TC39 Explicit Resource Management — automatic cleanup at block end, even on exceptions
- `Symbol.dispose` defines synchronous cleanup, `Symbol.asyncDispose` asynchronous — as `Disposable` and `AsyncDisposable` interfaces
- `await using` is the async equivalent: `[Symbol.asyncDispose]()` is called with `await`
- `DisposableStack` coordinates multiple resources in LIFO order — `stack.use()`, `stack.defer()`, `stack.move()` are the central methods
- Angular's `DestroyRef.onDestroy()` solves conceptually the same problem as `Symbol.dispose` — at component/service level instead of block level

**Core concept to remember:** `using conn = getDbConnection()` is a guarantee, not a request. No matter what happens in the block — exception, early return, normal flow — `conn[Symbol.dispose]()` will be called. That is RAII for TypeScript.

---

> **Break point** — You have completed Lesson 31 in full! From
> `Promise<T>` types through `async/await` inference and `AsyncGenerator`
> all the way to Explicit Resource Management — you have worked through the entire
> spectrum of TypeScript's asynchronous type system.
>
> **Next lesson:** [L32: Type-safe APIs](../32-type-safe-apis/sections/01-rest-api-typing.md)