# Cheatsheet: TypeScript with RxJS

> Lesson 43 — Compact Reference for Daily Use

---

## Observable Core Types

| Type | Description | Initial Value | Last Value |
|-----|--------------|-------------|--------------|
| `Observable<T>` | Base type, lazy | — | — |
| `Subject<T>` | Bidirectional (read + write) | No | No |
| `BehaviorSubject<T>` | State container | Yes (required!) | Yes (`.value`) |
| `ReplaySubject<T>(N)` | Stores last N values | No | Yes (N items) |
| `AsyncSubject<T>` | Only last value on `complete()` | No | On complete |

---

## OperatorFunction — The Core Piece

```typescript
// All pipeable operators have this type:
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

// pipe() chains OperatorFunctions:
obs$.pipe(
  op1,  // OperatorFunction<A, B>
  op2,  // OperatorFunction<B, C>  — B must be compatible!
  op3   // OperatorFunction<C, D>
);     // Result: Observable<D>
```

---

## Type Signatures of Key Operators

```typescript
// map: T => R
map<T, R>(fn: (value: T, index: number) => R): OperatorFunction<T, R>

// filter: T stays, OR Type Predicate narrows to S
filter<T>(predicate: (value: T) => boolean): OperatorFunction<T, T>
filter<T, S extends T>(predicate: (value: T) => value is S): OperatorFunction<T, S>

// switchMap / mergeMap / concatMap / exhaustMap: T => Observable<R>
switchMap<T, R>(fn: (value: T) => ObservableInput<R>): OperatorFunction<T, R>

// tap: T unchanged (side effects)
tap<T>(observer: Partial<Observer<T>>): MonoTypeOperatorFunction<T>

// catchError: error as unknown (RxJS 7+)
catchError<T, O>(
  fn: (err: unknown, caught: Observable<T>) => O
): OperatorFunction<T, T | ObservedValueOf<O>>

// retry (RxJS 7+)
retry<T>(config: {
  count: number;
  delay?: number | ((error: unknown, retryCount: number) => Observable<any>);
}): MonoTypeOperatorFunction<T>
```

---

## Combination Operators and Types

```typescript
// combineLatest: Tuple types (TypeScript 4.0+)
combineLatest([a$, b$, c$])
// Type: Observable<[A, B, C]>

// forkJoin array syntax (deprecated)
forkJoin([a$, b$])
// Type: Observable<[A, B]>

// forkJoin object syntax (recommended)
forkJoin({ a: a$, b: b$ })
// Type: Observable<{ a: A; b: B }>

// withLatestFrom: Trigger + Snapshots
trigger$.pipe(withLatestFrom(a$, b$))
// Type: Observable<[TriggerValue, A, B]>

// zip: Strict 1:1 pairs
zip(a$, b$)
// Type: Observable<[A, B]>
```

---

## Type Predicate in filter

```typescript
// Without Type Predicate — type stays
stream$.pipe(
  filter(user => user.isActive)
); // Observable<User>

// With Type Predicate — type is narrowed
function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}
stream$.pipe(
  filter(isAdmin)
); // Observable<Admin>

// Inline Type Predicate
stream$.pipe(
  filter((user): user is Admin => user.role === 'admin')
); // Observable<Admin>

// Filter out null (common pattern)
stream$.pipe(
  filter((v): v is T => v !== null)
); // Observable<T> instead of Observable<T | null>
```

---

## Special Types: EMPTY, NEVER, throwError

```typescript
EMPTY           // Observable<never> — immediate complete(), no value
NEVER           // Observable<never> — never emits (no complete, no error)
throwError(() => new Error('!'))  // Observable<never> — immediate error

// never is the bottom type — can be used as Observable<any-type>
catchError(() => EMPTY)   // OK — EMPTY is Observable<never>, never extends T
```

---

## Error Handling (RxJS 7+)

```typescript
// error is unknown — type checking required
catchError((error: unknown) => {
  if (error instanceof HttpErrorResponse) {
    // error: HttpErrorResponse — TypeScript narrows
    return handleHttp(error);
  }
  if (error instanceof Error) {
    // error: Error
    return throwError(() => error);
  }
  return EMPTY;
})

// Result pattern — errors as stream values
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function safeGet<T>(req: Observable<T>): Observable<Result<T>> {
  return req.pipe(
    map(data => ({ success: true as const, data })),
    catchError((err: unknown) => of({
      success: false as const,
      error: parseError(err),
    }))
  );
}
```

---

## Angular: toSignal Variants

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// Variant 1: No initialValue → undefined
const user = toSignal(user$);
// Signal<User | undefined>

// Variant 2: initialValue → no undefined
const user = toSignal(user$, { initialValue: null });
// Signal<User | null>

// Variant 3: requireSync → no undefined, no null
// Only when Observable emits synchronously! (BehaviorSubject, of(), startWith())
const config = toSignal(config$, { requireSync: true });
// Signal<Config>

// toObservable: Signal → Observable
import { toObservable } from '@angular/core/rxjs-interop';
const signal$ = toObservable(mySignal); // Observable<T>
```

---

## Angular: takeUntilDestroyed

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

// In constructor — finds DestroyRef automatically
class Comp {
  data$ = this.service.stream$.pipe(takeUntilDestroyed());
  //                                ^ Automatic cleanup on destroy
}

// Outside constructor — DestroyRef explicitly
class Comp {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.service.stream$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => ...);
  }
}
```

---

## async pipe vs toSignal

| | `async pipe` | `toSignal` |
|---|---|---|
| Template type | `T \| null` | `T \| undefined` (without opt.) |
| Initial state | null | undefined (or controlled) |
| Subscription | Template-bound | Component-bound |
| Boilerplate | `*ngIf="obs \| async as v"` | `signal()` — no template guard |
| Recommendation | Classic Angular | Angular 16+, new components |

---

## BehaviorSubject as State Container

```typescript
@Injectable({ providedIn: 'root' })
class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  // Read-only from outside
  readonly state = this.state$.asObservable();
  // Observable<AppState>

  // Derived state — type is inferred
  readonly users$ = this.state$.pipe(
    map(s => s.users),          // Observable<User[]>
    distinctUntilChanged()
  );

  // Synchronous access (no subscribe needed)
  get snapshot(): AppState {
    return this.state$.value;   // AppState — always current
  }

  update(partial: Partial<AppState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
```