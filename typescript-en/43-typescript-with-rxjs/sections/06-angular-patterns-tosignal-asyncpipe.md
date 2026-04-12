# Section 6: Angular Patterns — toSignal, async pipe, and the Bridge

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Error Handling in RxJS with TypeScript](./05-fehlerbehandlung-rxjs-typescript.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- How `toSignal<T>()` converts an Observable into a Signal — and which type variants exist
- Why `initialValue` and `requireSync` fundamentally change the return type
- `takeUntilDestroyed` and automatic cleanup — without manual unsubscribe logic
- The `async pipe` from a TypeScript perspective: What the template compiler knows and what it doesn't

---

## The new Angular world: Signals and Observables side by side

Since Angular 16 there are two reactive primitives: **Observables** (RxJS) and **Signals**
(Angular's own reactivity system). Both have their strengths:

- **Observables**: Temporal sequences, HTTP requests, WebSockets, complex transformations
- **Signals**: State management, synchronous access, Zone.js-free change detection

Angular provides bridge functions to switch between both worlds.
The type system makes this bridge safe.

> 📖 **Background: Why Signals when RxJS already exists?**
>
> RxJS is powerful — but also complex. `BehaviorSubject`, `distinctUntilChanged`,
> `shareReplay`, subscription management: that's a lot of overhead for simple
> state storage. Angular Signals are deliberately simpler: a Signal is a
> value that changes and automatically triggers change detection.
>
> The Angular team of Ward Bell, Alex Rickabaugh, and others designed Signals as
> complementary, not replacing. The proof: `toSignal()` and `fromSignal()`
> are bridges — you can mix both worlds. In Angular 17+ the recommendation is:
> use Signals for local component state, Observables for asynchronous
> data streams like HTTP.

---

## toSignal\<T\> — Three variants, three types

`toSignal` converts an Observable into a Signal. Depending on the option, the return type
differs:

```typescript annotated
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Component, signal } from '@angular/core';

interface User { id: string; name: string; email: string; }
interface Config { theme: string; language: string; }

@Component({ /* ... */ })
class UserComponent {
  private userService = inject(UserService);
  private configService = inject(ConfigService);

  // Option 1: Without initialValue — undefined until first value emits
  user = toSignal(this.userService.currentUser$);
  // ^ Type: Signal<User | undefined>
  //   TypeScript knows: before the first value arrives, it is undefined
  //   The template must handle undefined: user()?.name

  // Option 2: With initialValue — no undefined, safe initial state
  userWithDefault = toSignal(
    this.userService.currentUser$,
    { initialValue: null }
  );
  // ^ Type: Signal<User | null>
  //   initialValue null excludes undefined but keeps null in the type
  //   The template: userWithDefault()?.name  (null-safe)

  // Option 3: requireSync — Observable must emit synchronously immediately
  config = toSignal(
    this.configService.config$,
    { requireSync: true }
  );
  // ^ Type: Signal<Config>  — no undefined, no null!
  //   TypeScript knows: the value is always present
  //   Only valid when Observable emits immediately (e.g. BehaviorSubject, of(), startWith())
  //   If it does NOT emit synchronously: runtime error in Angular!
}
```

> 💭 **Think about it:** When is `requireSync: true` safe, and when is it a trap?
> Which Observable types are guaranteed to emit synchronously?
>
> **Answer:** Safe with: `of(value)`, `from([array])`, `BehaviorSubject` (always has a value),
> `startWith(initialValue)` at the beginning of the pipeline. Dangerous with: `http.get()`,
> `interval()`, `fromEvent()` — these emit asynchronously. Angular throws a
> `RuntimeError` when `requireSync: true` and no synchronous value arrives.
> The TypeScript types don't help here — they cannot express asynchronous behavior.
> This is one of the limits of the type system.

---

## toSignal in practice — TypeScript consequences

The type of `toSignal` has direct consequences in the template and in TypeScript code:

```typescript annotated
@Component({
  template: `
    <!-- user is Signal<User | undefined> — must use optional chaining -->
    @if (user()) {
      <span>{{ user()!.name }}</span>
    }

    <!-- userWithDefault is Signal<User | null> -->
    <span>{{ userWithDefault()?.name ?? 'No user' }}</span>

    <!-- config is Signal<Config> — no guard needed! -->
    <span>{{ config().theme }}</span>
  `
})
class ProfileComponent {
  private userService = inject(UserService);
  private configService = inject(ConfigService);

  // Signal<User | undefined> — template checks with @if
  user = toSignal(this.userService.currentUser$);

  // Signal<User | null> — template uses optional chaining
  userWithDefault = toSignal(this.userService.currentUser$, { initialValue: null });

  // Signal<Config> — no guard needed, always defined
  config = toSignal(this.configService.config$, { requireSync: true });

  // Derived Signal: computed() knows the types
  displayName = computed(() => {
    const u = this.user();
    // u: User | undefined — TypeScript enforces the check!
    return u ? `${u.name} (${u.email})` : 'Not logged in';
    //                                     ^^ TypeScript: u is User here
  });
}
```

> 🧠 **Explain it to yourself:** Why does `toSignal(obs$)` without options return the type
> `Signal<T | undefined>` instead of `Signal<T>`? What would it mean if
> the type were `Signal<T>` but the Observable hasn't emitted anything yet?
> **Key points:** Angular reads the Signal value synchronously — but HTTP requests are asynchronous |
> Before the first value arrives, the Signal value is undefined |
> Signal<T> without undefined would be a lie: TypeScript says "always T" but it's actually undefined |
> `initialValue` tells the type system and Angular: "Here is the initial value, no undefined"

---

## takeUntilDestroyed — Automatic cleanup

The most tedious problem with subscriptions in Angular was always manual unsubscribing.
With `takeUntilDestroyed` that's history:

```typescript annotated
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

@Component({ /* ... */ })
class DataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private dataService = inject(DataService);

  // Variant 1: In the constructor — direct injection without DestroyRef
  readonly data$ = this.dataService.stream$.pipe(
    takeUntilDestroyed()
    // ^ In constructor context: takeUntilDestroyed() finds DestroyRef automatically!
    // Type: Observable<DataType> — unchanged (takeUntilDestroyed doesn't change T)
  );

  ngOnInit() {
    // Variant 2: Outside constructor — pass DestroyRef explicitly
    this.dataService.stream$.pipe(
      takeUntilDestroyed(this.destroyRef)
      // ^ DestroyRef: is destroyed when the component is destroyed
    ).subscribe(data => this.processData(data));
    // ^ No unsubscribe needed! takeUntilDestroyed takes care of it
  }

  private processData(data: DataType): void {
    // data: DataType — fully typed
  }
}

// Anti-pattern (what this avoids):
// private sub!: Subscription;
// ngOnInit() { this.sub = obs$.subscribe(...); }
// ngOnDestroy() { this.sub.unsubscribe(); }
// ^ Easy to forget — memory leak!
```

---

## Experiment box: Combining toSignal and computed

```typescript
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface CartItem { productId: string; quantity: number; price: number; }

@Component({
  template: `
    <p>Items: {{ itemCount() }}</p>
    <p>Total: {{ total() | currency }}</p>
    @if (isExpensive()) {
      <p>Free shipping from 50 EUR!</p>
    }
  `
})
class CartComponent {
  // Simulated cart service with BehaviorSubject
  private items$ = new BehaviorSubject<CartItem[]>([
    { productId: 'p1', quantity: 2, price: 12.99 },
    { productId: 'p2', quantity: 1, price: 49.99 },
  ]);

  // toSignal with requireSync — BehaviorSubject emits synchronously
  private items = toSignal(this.items$, { requireSync: true });
  // ^ Signal<CartItem[]> — no undefined, no null

  // computed() uses the type of Signal<CartItem[]>
  itemCount = computed(() => this.items().length);
  // ^ Signal<number> — TypeScript infers from items()

  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity * item.price, 0)
  );
  // ^ Signal<number>

  isExpensive = computed(() => this.total() > 50);
  // ^ Signal<boolean>
}
```

Notice: `computed()` infers the return type automatically from the return type
of the function. You never need to write `computed<number>()` — TypeScript already knows.

---

## The async pipe — What TypeScript knows

The `async pipe` is the foundation of template-based Observable handling
in classic Angular:

```typescript annotated
@Component({
  template: `
    <!-- async pipe: Observable<User[]> | null in the template -->
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <li>{{ user.name }}</li>
      }
    }

    <!-- async pipe with fallback for null -->
    {{ (title$ | async) ?? 'Loading...' }}
  `
})
class UserListComponent {
  // Observable<User[]> — TypeScript knows the type
  users$ = this.http.get<User[]>('/api/users');
  // Type in template AFTER async pipe: User[] | null
  // null because async pipe returns null before the Observable emits

  title$ = this.titleService.title$;
  // Observable<string> — after async pipe: string | null
}
```

> ⚡ **Practical tip:** The `async pipe` ALWAYS returns `T | null` — `null` is the
> initial state before the Observable emits. This is the main advantage of `toSignal`
> with `initialValue`: you explicitly control the initial state and the type is clearer.
>
> In Angular 17+ with the new `@if` syntax, `async pipe` is more readable than the old
> `*ngIf="obs$ | async as value"`. But `toSignal` is often the better alternative for
> new components — no template boilerplate, type-safe Signals.

---

## fromSignal — The other direction

If you need to convert a Signal into an Observable (e.g. for an HTTP request
on Signal change):

```typescript annotated
import { toObservable } from '@angular/core/rxjs-interop';
import { signal, computed } from '@angular/core';

@Component({ /* ... */ })
class SearchComponent {
  searchTerm = signal('');
  // ^ WritableSignal<string>

  // Signal to Observable — for RxJS pipelines
  searchTerm$ = toObservable(this.searchTerm);
  // ^ Observable<string>

  // Now you can use the full RxJS pipeline:
  results$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    switchMap(term => this.http.get<SearchResult[]>(`/api/search?q=${term}`))
  );
  // ^ Observable<SearchResult[]> — fully typed

  // And the result back as a Signal for the template:
  results = toSignal(this.results$, { initialValue: [] as SearchResult[] });
  // ^ Signal<SearchResult[]>
}
```

---

## What you've learned

- `toSignal(obs$)` without options: `Signal<T | undefined>` — undefined until the first value
- `toSignal(obs$, { initialValue: x })`: `Signal<T | typeof x>` — controlled initial state
- `toSignal(obs$, { requireSync: true })`: `Signal<T>` — no undefined, Observable must emit synchronously
- `takeUntilDestroyed()` in the constructor: automatic cleanup without manual `unsubscribe` logic
- `async pipe` returns `T | null` — TypeScript consequence: template must handle null
- `toObservable(signal)` closes the loop: Signals can become Observables and vice versa

**Core concept:** The bridge between Signals and Observables is fully type-safe.
TypeScript knows the return type of every conversion function — and the option parameters
(`initialValue`, `requireSync`) change the type precisely. The type system models the
semantic differences of the three `toSignal` variants.

> 🧠 **Explain it to yourself:** You have a `BehaviorSubject<User[]>` in a service.
> You want to use it in a component as a Signal. Which `toSignal` variant
> is correct and why? What type results from it?
> **Key points:** BehaviorSubject emits synchronously on subscribe |
> `requireSync: true` is correct — no runtime error, no undefined |
> Result: `Signal<User[]>` — no undefined, no null |
> Alternative: `initialValue: []` gives `Signal<User[]>` with an empty array as the initial value

---

> **Pause point** — You have completed the entire lesson. From the fundamentals of
> type propagation to the modern Angular 17+ patterns with Signals and Observables.
> RxJS and TypeScript are not just compatible — they reinforce each other.
>
> Feel like reviewing? Start the quiz or check your knowledge with the pre-test.