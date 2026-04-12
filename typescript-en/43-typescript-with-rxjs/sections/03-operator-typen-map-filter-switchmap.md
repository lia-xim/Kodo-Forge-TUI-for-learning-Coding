# Section 3: Operator Types — map, filter, switchMap and Siblings

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Observable, Subject, BehaviorSubject](./02-observable-subject-behaviorsubject.md)
> Next section: [04 - Combination Operators](./04-kombinations-operatoren-typen.md)

---

## What you'll learn here

- How TypeScript reads the type signatures of `map`, `filter`, `switchMap` and their siblings
- Why `filter` without a Type Predicate does **not change** the type — and how Type Predicates change that
- The difference between `switchMap`, `mergeMap`, `concatMap` and `exhaustMap` from a TypeScript perspective
- The `OperatorFunction<T, R>` interface as a unifying concept

---

## OperatorFunction\<T, R\> — The Backbone of All Operators

Before we look at individual operators, we need to understand the type system that
connects them all. Every pipeable operator in RxJS returns an `OperatorFunction<T, R>`:

```typescript
// The core types for operators (simplified from RxJS source code):
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;
//   ^ Takes an Observable<T> and returns an Observable<R>

// pipe() accepts a chain of OperatorFunctions:
// If A → B → C: OperatorFunction<A, B> then OperatorFunction<B, C>
// TypeScript checks whether B is compatible!
```

This means: every time you write operators inside `.pipe(...)`, TypeScript checks
whether the output type of the previous operator is compatible with the input type of the next one.
A wrongly typed pipeline is a **compile error**, not a runtime problem.

> 📖 **Origin Story: Why pipeable operators didn't arrive until RxJS 5.5**
>
> In RxJS 4 and early RxJS 5, operators lived directly on the Observable prototype:
> `observable.map(fn).filter(fn).subscribe(fn)`. This had one big problem:
> **tree-shaking didn't work**. If you imported `map`, the entire operator code
> ended up in the bundle — even if you never used 50 other operators.
>
> Ben Lesh (then RxJS lead) and the team developed "lettable operators" in 2017
> (later renamed "pipeable operators"): instead of methods on the object, they are
> now standalone functions. The type signature `OperatorFunction<T, R>` was a direct
> consequence — TypeScript could now check each step in the pipe individually.

---

## map — Transforming T

```typescript annotated
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// map signature: map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>
// TypeScript infers T from the previous Observable and R from the project function

const users$: Observable<User[]> = this.http.get<User[]>('/api/users');

// T = User[], R = string[] — TypeScript infers R from the return type of the map function
const names$: Observable<string[]> = users$.pipe(
  map(users => users.map(u => u.name))
  // ^ TypeScript: T=User[], project returns string[], so R=string[]
);

// Nested transformation — TypeScript tracks every step
const emailDomains$ = users$.pipe(
  map(users => users.filter(u => u.isActive)),
  // ^ Still Observable<User[]>
  map(users => users.map(u => u.email)),
  // ^ Now Observable<string[]>
  map(emails => emails.map(e => e.split('@')[1]))
  // ^ Now Observable<string[]> (the domain parts)
);
// emailDomains$: Observable<string[]>

// Object transformation — TypeScript infers the mapped object type
const userSummary$ = users$.pipe(
  map(users => users.map(u => ({
    id: u.id,
    displayName: `${u.firstName} ${u.lastName}`,
    // Type: { id: string; displayName: string }
  })))
);
// userSummary$: Observable<{ id: string; displayName: string }[]>
// TypeScript infers the object literal as a type — no interface needed!
```

---

## filter — Keeping T (With and Without Type Predicates)

This is where it gets interesting. `filter` normally does **not** change the type:

```typescript annotated
import { filter } from 'rxjs/operators';

// Standard filter — type stays T
const activeUsers$: Observable<User[]> = users$.pipe(
  map(users => users.filter(u => u.isActive))
  // ^ users.filter() returns User[], no type narrowing here
);

// BUT: With RxJS filter (not Array.filter) on an Observable<User>:
const singleUsers$: Observable<User> = from(someUserArray);

const activeOnly$: Observable<User> = singleUsers$.pipe(
  filter(user => user.isActive)
  // ^ Type stays Observable<User> — filter without a Type Predicate doesn't change T
);

// With a Type Predicate: the type IS narrowed!
// TypeScript 5.5+ Inferred Type Predicates can sometimes do this automatically,
// but explicit is clearer:
interface Admin extends User {
  adminSince: Date;
  permissions: string[];
}

function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

const adminsOnly$: Observable<Admin> = singleUsers$.pipe(
  filter(isAdmin)
  // ^ TypeScript narrows the type: Observable<User> → Observable<Admin>
  // This works because isAdmin has a Type Predicate (user is Admin)!
);

// Inline Type Predicate — same as above, written inline
const adminsInline$ = singleUsers$.pipe(
  filter((user): user is Admin => user.role === 'admin')
  // ^ Explicit Type Predicate — TypeScript narrows to Observable<Admin>
);
```

> 🧠 **Explain it to yourself:** Why does `filter(user => user.isActive)` NOT change the type,
> but `filter((user): user is Admin => user.role === 'admin')` does?
> What is the difference between a regular predicate and a Type Predicate?
> **Key points:** Regular predicate: returns boolean — TypeScript only knows "filtered or not" |
> Type Predicate: returns `value is T` — TypeScript knows "if true, then value is of type T" |
> RxJS uses TypeScript's filter signature: `filter(predicate: (v: T) => v is S)` returns `OperatorFunction<T, S>` | Without predicate: `filter(predicate: (v: T) => boolean)` returns `OperatorFunction<T, T>`

---

## switchMap, mergeMap, concatMap, exhaustMap — The Quartet

All four operators do the same thing at the type level: `T → Observable<R>`.
The difference lies in their behavior with multiple emissions — but TypeScript only
sees the type transformation:

```typescript annotated
import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

const userId$ = new Subject<string>();

// switchMap: When a new T arrives, the old Observable is CANCELLED
// Signature: switchMap<T, R>(fn: (value: T) => ObservableInput<R>): OperatorFunction<T, R>
const userDetails$: Observable<UserDetails> = userId$.pipe(
  switchMap(id => this.userService.getUser(id))
  // ^ T=string, fn returns Observable<UserDetails>, so R=UserDetails
  // If two IDs arrive quickly, the first HTTP request is cancelled
);
// Perfect for: search (autocomplete), navigation, last-wins semantics

// mergeMap: All Observables run in PARALLEL
const allUserDetails$ = userIds$.pipe(
  mergeMap(id => this.userService.getUser(id))
  // ^ Type identical: Observable<UserDetails>
  // All HTTP requests run simultaneously — order not guaranteed
);
// Perfect for: parallel independent requests, fire-and-forget

// concatMap: Observables run SEQUENTIALLY (wait for each other)
const sequentialDetails$ = userIds$.pipe(
  concatMap(id => this.userService.getUser(id))
  // ^ Type identical: Observable<UserDetails>
  // Request 2 waits until Request 1 is complete
);
// Perfect for: when order matters, e.g. saving forms one after another

// exhaustMap: While an Observable is running, new T values are IGNORED
const nonConcurrentLogin$ = loginButton$.pipe(
  exhaustMap(() => this.authService.login())
  // ^ T=Event, R=LoginResponse: Observable<LoginResponse>
  // While login is in progress, further button clicks are ignored
);
// Perfect for: double-click prevention, rate-limiting
```

> 💭 **Think about it:** All four operators have the same TypeScript signature (`T → Observable<R>`).
> Why do you still rarely write generic functions that support all four?
> What does the type system lack here to describe the behavior?
>
> **Answer:** TypeScript describes **What**, not **When** or **How**. The type signature
> says: "You'll get R values". But it doesn't say: "old R values will be cancelled"
> or "R values arrive sequentially". The behavior (concurrency strategy) is a
> runtime concept, not a type concept. Types describe the shape of data, not
> the temporal relationship between values.

---

## Experiment Box: Deliberately Triggering Type Errors in Pipelines

Write the following pipeline and observe how TypeScript reports errors:

```typescript
import { of } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

const orderId$ = of('order-1', 'order-2');

const result$ = orderId$.pipe(
  // Step 1: string -> Observable<Order> (HTTP simulation)
  switchMap(id => of<Order>({ id, userId: 'user-1', total: 99.99, status: 'pending' })),
  // Type is now: Observable<Order>

  // Step 2: Only 'completed' orders (Type Predicate makes the difference)
  filter((order): order is Order & { status: 'completed' } => order.status === 'completed'),
  // Type is now: Observable<Order & { status: 'completed' }>

  // Step 3: Extract only the total
  map(order => order.total),
  // Type is now: Observable<number>

  // Now DELIBERATELY introduce an error — remove the comment:
  // map(total => total.toUpperCase()),
  // ^ ERROR: Property 'toUpperCase' does not exist on type 'number'
  // TypeScript knows: total is a number, not a string!
);

// result$: Observable<number>
```

Remove the comment before `map(total => total.toUpperCase())` and observe the
compile error. That is the value of typed pipelines: the error occurs in the editor,
not in production.

---

## Angular Connection: switchMap in HTTP Requests

The classic Angular pattern: user types, we search:

```typescript annotated
@Component({ template: `<input (input)="search($event.target.value)">` })
export class SearchComponent {
  private searchTerm$ = new Subject<string>();

  // The result is Observable<SearchResult[]> — TypeScript knows the type
  readonly results$ = this.searchTerm$.pipe(
    debounceTime(300),
    // ^ Type stays: Observable<string>
    distinctUntilChanged(),
    // ^ Type stays: Observable<string> (only emits on change)
    filter(term => term.length >= 2),
    // ^ Type stays: Observable<string> (no Type Predicate needed)
    switchMap(term =>
      this.http.get<SearchResult[]>(`/api/search?q=${term}`)
      // ^ T=string, R=SearchResult[] from get<SearchResult[]>
    )
    // Result: Observable<SearchResult[]>
    // switchMap cancels the old request when a new term arrives
  );

  search(term: string): void {
    this.searchTerm$.next(term);  // string — TypeScript checks the type
  }
}
```

> ⚡ **Practical tip:** In your day-to-day Angular work: for HTTP requests triggered by
> user actions, `switchMap` is almost always right (search, navigation). For
> fire-and-forget actions (sending analytics events), `mergeMap` is more appropriate.
> Use `exhaustMap` for forms that should prevent multiple submissions.

---

## What you learned

- `OperatorFunction<T, R>` connects all pipeable operators: a function from `Observable<T>` to `Observable<R>`
- `map<T, R>` transforms T to R — TypeScript infers R from the mapping function automatically
- `filter` without a Type Predicate: type stays T. With a `(v): v is S` Type Predicate: type is narrowed to S
- `switchMap` / `mergeMap` / `concatMap` / `exhaustMap`: all have the same type signature `T → Observable<R>`, differing only in concurrency strategy (not visible at the type level)
- A wrongly chained pipeline is a **compile error** — TypeScript checks compatibility between operators

**Core concept:** Type Predicates in `filter` are one of the most powerful tools in
RxJS+TypeScript. They convert an `Observable<Animal>` into `Observable<Cat>` without
any runtime overhead — everything happens at compile time.

> 🧠 **Explain it to yourself:** Your Observable emits `string | null`. You want to
> process only the `string` values further. How do you write the `filter` call so that
> TypeScript filters out the `null` type? What is the type afterwards?
> **Key points:** `filter((v): v is string => v !== null)` | Type Predicate `v is string` |
> Type after filter: `Observable<string>` (null is filtered out) |
> Alternative without predicate: `filter(v => v !== null)` gives `Observable<string | null>` —
> TypeScript doesn't know that null never occurs

---

> **Pause point** — You now understand the individual operators from a TypeScript perspective.
> In the next chapter we'll look at what happens when multiple Observables are
> combined — and how TypeScript infers the combined types.
>
> Continue with: [Section 04: Combination Operators](./04-kombinations-operatoren-typen.md)