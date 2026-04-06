# Cheatsheet: TypeScript mit RxJS

> Lektion 43 — Kompakte Referenz fuer den Alltag

---

## Observable-Kerntypen

| Typ | Beschreibung | Initialwert | Letzter Wert |
|-----|--------------|-------------|--------------|
| `Observable<T>` | Basistyp, lazy | — | — |
| `Subject<T>` | Bidirektional (read + write) | Nein | Nein |
| `BehaviorSubject<T>` | State-Container | Ja (Pflicht!) | Ja (`.value`) |
| `ReplaySubject<T>(N)` | Speichert letzte N Werte | Nein | Ja (N Stueck) |
| `AsyncSubject<T>` | Nur letzter Wert bei `complete()` | Nein | Bei complete |

---

## OperatorFunction — Das Herzstuck

```typescript
// Alle pipeablen Operatoren haben diesen Typ:
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

// pipe() verkettet OperatorFunctions:
obs$.pipe(
  op1,  // OperatorFunction<A, B>
  op2,  // OperatorFunction<B, C>  — B muss kompatibel sein!
  op3   // OperatorFunction<C, D>
);     // Ergebnis: Observable<D>
```

---

## Typ-Signaturen wichtiger Operatoren

```typescript
// map: T => R
map<T, R>(fn: (value: T, index: number) => R): OperatorFunction<T, R>

// filter: T bleibt, ODER Type Predicate narrowt zu S
filter<T>(predicate: (value: T) => boolean): OperatorFunction<T, T>
filter<T, S extends T>(predicate: (value: T) => value is S): OperatorFunction<T, S>

// switchMap / mergeMap / concatMap / exhaustMap: T => Observable<R>
switchMap<T, R>(fn: (value: T) => ObservableInput<R>): OperatorFunction<T, R>

// tap: T unveraendert (Seiteneffekte)
tap<T>(observer: Partial<Observer<T>>): MonoTypeOperatorFunction<T>

// catchError: Fehler als unknown (RxJS 7+)
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

## Kombinations-Operatoren und Typen

```typescript
// combineLatest: Tuple-Typen (TypeScript 4.0+)
combineLatest([a$, b$, c$])
// Typ: Observable<[A, B, C]>

// forkJoin Array-Syntax (veraltet)
forkJoin([a$, b$])
// Typ: Observable<[A, B]>

// forkJoin Object-Syntax (empfohlen)
forkJoin({ a: a$, b: b$ })
// Typ: Observable<{ a: A; b: B }>

// withLatestFrom: Trigger + Snapshots
trigger$.pipe(withLatestFrom(a$, b$))
// Typ: Observable<[TriggerValue, A, B]>

// zip: Strenge 1:1 Paare
zip(a$, b$)
// Typ: Observable<[A, B]>
```

---

## Type Predicate in filter

```typescript
// Ohne Type Predicate — Typ bleibt
stream$.pipe(
  filter(user => user.isActive)
); // Observable<User>

// Mit Type Predicate — Typ wird genarrowt
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

// null herausfiltern (haeufiges Pattern)
stream$.pipe(
  filter((v): v is T => v !== null)
); // Observable<T> statt Observable<T | null>
```

---

## Sonder-Typen: EMPTY, NEVER, throwError

```typescript
EMPTY           // Observable<never> — sofortiges complete(), kein Wert
NEVER           // Observable<never> — emittiert nie (kein complete, kein error)
throwError(() => new Error('!'))  // Observable<never> — sofortiger Fehler

// never ist Bottom-Type — kann als Observable<beliebiger-Typ> verwendet werden
catchError(() => EMPTY)   // OK — EMPTY ist Observable<never>, never extends T
```

---

## Fehlerbehandlung (RxJS 7+)

```typescript
// error ist unknown — Typ-Pruefung Pflicht
catchError((error: unknown) => {
  if (error instanceof HttpErrorResponse) {
    // error: HttpErrorResponse — TypeScript narrowt
    return handleHttp(error);
  }
  if (error instanceof Error) {
    // error: Error
    return throwError(() => error);
  }
  return EMPTY;
})

// Result-Pattern — Fehler als Stream-Wert
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

## Angular: toSignal-Varianten

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// Variante 1: Kein initialValue → undefined
const user = toSignal(user$);
// Signal<User | undefined>

// Variante 2: initialValue → kein undefined
const user = toSignal(user$, { initialValue: null });
// Signal<User | null>

// Variante 3: requireSync → kein undefined, kein null
// Nur wenn Observable synchron emittiert! (BehaviorSubject, of(), startWith())
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

// Im Konstruktor — findet DestroyRef automatisch
class Comp {
  data$ = this.service.stream$.pipe(takeUntilDestroyed());
  //                                ^ Automatisches Cleanup bei Destroy
}

// Ausserhalb Konstruktor — DestroyRef explizit
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
| Template-Typ | `T \| null` | `T \| undefined` (ohne opt.) |
| Initialzustand | null | undefined (oder kontrolliert) |
| Subscription | Template-gebunden | Komponentengebunden |
| Boilerplate | `*ngIf="obs \| async as v"` | `signal()` — kein Template-Guard |
| Empfehlung | Klassisches Angular | Angular 16+, neue Komponenten |

---

## BehaviorSubject als State Container

```typescript
@Injectable({ providedIn: 'root' })
class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  // Nur lesbar nach aussen
  readonly state = this.state$.asObservable();
  // Observable<AppState>

  // Abgeleiteter State — Typ wird inferiert
  readonly users$ = this.state$.pipe(
    map(s => s.users),          // Observable<User[]>
    distinctUntilChanged()
  );

  // Synchroner Zugriff (kein subscribe noetig)
  get snapshot(): AppState {
    return this.state$.value;   // AppState — immer aktuell
  }

  update(partial: Partial<AppState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
```
