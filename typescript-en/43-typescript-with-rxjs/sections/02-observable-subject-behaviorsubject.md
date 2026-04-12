# Section 2: Observable, Subject, BehaviorSubject — The Core Types

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - RxJS and TypeScript — Why They Fit Together](./01-rxjs-und-typescript-warum-das-passt.md)
> Next section: [03 - Operator Types: map, filter, switchMap](./03-operator-typen-map-filter-switchmap.md)

---

## What you'll learn here

- The difference between `Observable<T>`, `Subject<T>`, `BehaviorSubject<T>`,
  `ReplaySubject<T>` and `AsyncSubject<T>` — **from a TypeScript perspective**
- Why generics here are not decoration, but the backbone of type safety
- Synchronous access with `BehaviorSubject<T>.value` and what TypeScript makes of it
- When to use which type — a decision tree for your everyday Angular work

---

## The Relationship Between the Core Types

Before we dive into types, we need the mental model:

```
Observable<T>          — Base type: A stream of T values (cold or hot)
     |
     └── Subject<T>    — Observable + Observer: Can emit values itself
              |
              ├── BehaviorSubject<T>  — Has initial value, stores last value
              ├── ReplaySubject<T>    — Stores N values for new subscribers
              └── AsyncSubject<T>    — Emits only last value on complete()
```

All inherit from `Observable<T>`. This is important for TypeScript: everywhere
`Observable<User>` is expected, you can also pass a `BehaviorSubject<User>`.
That is structural subtype compatibility — Liskov Substitution in practice.

> 📖 **Origin Story: Why Subject Has Such a Strange Name**
>
> "Subject" comes from the Observer Pattern (GoF Design Patterns, 1994). In the original pattern
> the "Subject" is the object being observed — and subscribers are the "Observers".
> When Erik Meijer designed ReactiveX, he adopted the terminology. A `Subject<T>` is
> both observable and an observer — it can react to events itself and push its own values.
> This makes it a bidirectional channel.
>
> In your Angular code: `EventEmitter<T>` is internally a Subject. Every time you
> write `@Output() valueChange = new EventEmitter<string>()`, you are using
> exactly this mechanism under the hood.

---

## Observable\<T\> — The Base Type

An `Observable<T>` is a lazy sequence of values of type T:

```typescript annotated
import { Observable } from 'rxjs';

// An Observable is lazy — NOTHING happens until subscribe() is called
const numbers$: Observable<number> = new Observable<number>(observer => {
  // observer.next() emits a value of type T (here: number)
  observer.next(1);    // T = number — TypeScript enforces number
  observer.next(2);
  // observer.next("three"); // ERROR: Argument of type 'string' is not assignable to 'number'
  observer.complete();
  // No more values after complete()

  // Optional cleanup function — called on unsubscribe()
  return () => console.log('Cleanup!');
});

// Only now does the code in the constructor run
numbers$.subscribe({
  next: (value) => console.log(value),  // value: number — TypeScript knows it
  error: (err) => console.error(err),   // err: unknown (since RxJS 7!)
  complete: () => console.log('Done'),
});
```

Important: The `error` callback receives `unknown` — not `any`. This is a deliberate
change in RxJS 7, analogous to TypeScript's `useUnknownInCatchVariables`. More on that
in Section 5.

---

## Subject\<T\> — The Bidirectional Channel

A `Subject<T>` is an Observable that can emit values itself:

```typescript annotated
import { Subject } from 'rxjs';

interface UserEvent {
  type: 'login' | 'logout' | 'update';
  userId: string;
  timestamp: number;
}

// Subject<T>: No initial value, no stored state
const userEvents$ = new Subject<UserEvent>();

// Subscription before the next value — receives everything
userEvents$.subscribe(event => {
  // event: UserEvent — TypeScript knows the type
  console.log(`${event.type} for user ${event.userId}`);
});

// next() expects exactly T — TypeScript checks the type
userEvents$.next({ type: 'login', userId: '123', timestamp: Date.now() });
// userEvents$.next({ type: 'foo', userId: '123', timestamp: Date.now() });
// ^ ERROR: 'foo' is not a valid value for type: 'login' | 'logout' | 'update'

// Subscription AFTER the next() — receives nothing retroactively
// This is the difference from ReplaySubject
const lateSubscriber = userEvents$.subscribe(e => console.log('Late:', e));
userEvents$.next({ type: 'update', userId: '123', timestamp: Date.now() });
// lateSubscriber receives 'update', but not 'login' before it
```

> 💭 **Think about it:** Why doesn't TypeScript raise an error when you pass a `Subject<UserEvent>`
> as an `Observable<UserEvent>`? Subject is a subclass of Observable —
> but what does that concretely mean for TypeScript's type checking?
>
> **Answer:** TypeScript uses **structural typing**, not a nominal type hierarchy.
> `Subject<T>` has all the properties and methods of `Observable<T>` (plus more).
> This makes it structurally compatible. Wherever `Observable<UserEvent>` is expected,
> TypeScript can check: "Does Subject<UserEvent> have all the necessary members?" — Yes.
> That is Liskov Substitution as a structural principle.

---

## BehaviorSubject\<T\> — The State

`BehaviorSubject<T>` is the most commonly used Subject type in Angular. It has
an initial value and stores the last value:

```typescript annotated
import { BehaviorSubject } from 'rxjs';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
}

// Initial value REQUIRED — TypeScript enforces T as an argument
const currentUser$ = new BehaviorSubject<User | null>(null);
// ^ T = User | null, initial value = null (allowed by the union type)

// Synchronous access to the current value — no subscribe needed
const syncValue: User | null = currentUser$.value;
// ^ .value is always available, type is T (User | null)

// New subscribers immediately receive the LAST value
const subscription = currentUser$.subscribe(user => {
  // user: User | null
  if (user !== null) {
    // user: User — TypeScript narrowed by the null check!
    console.log(`Logged in as: ${user.name}`);
  }
});

// Update — all current subscribers receive the new value
currentUser$.next({ id: '1', name: 'Max', role: 'admin' });

// ERROR: next() expects User | null, not string
// currentUser$.next('Max');  // Type 'string' is not assignable to 'User | null'
```

> 🧠 **Explain to yourself:** Why does `BehaviorSubject<User | null>` use `null` as the initial value
> instead of simply `BehaviorSubject<User>` with an empty object?
> What would be the problem with `new BehaviorSubject<User>({} as User)`?
> **Key points:** `{} as User` is a type cast, not real validation |
> TypeScript would allow it, but the object is missing all fields at runtime |
> `null` is semantically correct: "No user logged in" is no user, not an empty user |
> The union type `User | null` enforces null checks before every access

---

## ReplaySubject\<T\> and AsyncSubject\<T\>

```typescript annotated
import { ReplaySubject, AsyncSubject } from 'rxjs';

// ReplaySubject<T>(bufferSize): Stores the last N values
const lastThreeEvents$ = new ReplaySubject<string>(3);
// ^ bufferSize = 3: New subscribers immediately receive the 3 last values

lastThreeEvents$.next('Event A');
lastThreeEvents$.next('Event B');
lastThreeEvents$.next('Event C');
lastThreeEvents$.next('Event D');  // A is discarded, B/C/D remain

const late$ = lastThreeEvents$.subscribe(e => console.log(e));
// late$ immediately receives: 'Event B', 'Event C', 'Event D'

// AsyncSubject<T>: Emits ONLY the last value, and only on complete()
const asyncResult$ = new AsyncSubject<number>();

asyncResult$.subscribe(n => console.log('Result:', n));  // Nothing yet
asyncResult$.next(1);   // Not emitted
asyncResult$.next(2);   // Not emitted
asyncResult$.next(42);  // NOT yet emitted
asyncResult$.complete();  // NOW: subscriber receives 42 (the last value)
// Comparable to Promise — a single result at the end
```

---

## Experiment Box: BehaviorSubject as a State Container

In Angular you will see `BehaviorSubject` very often for simple state management.
Write the following and observe the TypeScript types:

```typescript
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface AppState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUserId: string | null;
}

const initialState: AppState = {
  users: [],
  loading: false,
  error: null,
  selectedUserId: null,
};

class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  // Expose as readonly Observable — subscribers cannot call next()
  readonly state = this.state$.asObservable();
  // ^ asObservable() returns Observable<AppState>, no longer a Subject

  // Derived state — TypeScript infers the return type automatically
  readonly users$ = this.state$.pipe(
    map(state => state.users),
    // Type: Observable<User[]> — TypeScript infers from map(state => state.users)
    distinctUntilChanged()
  );

  readonly isLoading$ = this.state$.pipe(
    map(state => state.loading),
    // Type: Observable<boolean>
    distinctUntilChanged()
  );

  // Update method: type-checked partial update
  update(partial: Partial<AppState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
    // state$.value: AppState — synchronous access to current value
  }
}
```

Note: `asObservable()` returns `Observable<T>`, not `Subject<T>`. This is
an important encapsulation: external code can read the state, but not write to it directly.

---

## Decision Tree: Which Type to Use?

```
Does the Observable need to emit values itself?
├── No → Observable<T> (e.g. from http.get())
└── Yes → Subject variant:
    ├── Does a new subscriber need the last value immediately?
    │   ├── Yes → BehaviorSubject<T> (requires initial value)
    │   └── No → Subject<T> (no initial value)
    ├── Does a new subscriber need multiple past values?
    │   └── Yes → ReplaySubject<T>(N)
    └── Only the last value at completion matters?
        └── Yes → AsyncSubject<T> (similar to Promise)
```

> ⚡ **Angular Practical Tip:** In your services use `BehaviorSubject<T>` for state
> that always has a current value (user session, settings) and `Subject<T>` for
> events that need no history (button clicks, HTTP error notifications).
> Always expose `.asObservable()` externally — never the Subject itself.

---

## What You've Learned

- `Observable<T>` is the base type: lazy, cold or hot, TypeScript knows T throughout the entire pipeline
- `Subject<T>` is bidirectional: both Observable and Observer. No initial value, no replay
- `BehaviorSubject<T>` always has a value (`value` property, synchronous access). Initial value REQUIRED
- `ReplaySubject<T>(N)` stores the last N values for new subscribers
- `AsyncSubject<T>` is the Observable equivalent of Promise: one value at the end
- TypeScript enforces in `next(value)` that the value is exactly of type T — union types like `User | null` are permitted and semantically correct

**Core concept:** `BehaviorSubject<T>` is the standard building block for state in Angular services.
The type T travels through `.value`, `.next()`, `.subscribe()` and derived Observables —
TypeScript checks every step.

---

> **Pause point** — Well done. You now know the type identity of all Subject variants.
> In the next step we'll look at what operators do with these types.
>
> Continue with: [Section 03: Operator Types: map, filter, switchMap](./03-operator-typen-map-filter-switchmap.md)