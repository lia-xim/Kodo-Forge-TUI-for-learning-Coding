# Section 6: Generics in Practice

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Default Type Parameters](./05-default-typparameter.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How React uses `useState<T>` generics
- How Angular uses `HttpClient.get<T>()` generics
- Why `Promise<T>` must be generic
- `Map<K, V>`, `Set<T>` and the standard library
- Writing your own generic utility functions

---

> 📖 **Background:** Generics are the reason why `useState<User[]>([])`
> works in React and why `HttpClient.get<Product[]>()` is type-safe in Angular.
> Without generics, frameworks would either have to return `any`
> (no type safety) or provide separate functions for every data type
> (impossibly unmaintainable). Generics are the **bridge** between
> framework code and your domain model — they allow a library to write
> code that works with types that don't even exist yet at the time the
> library is developed.

---

## React: useState\<T\>

React's most important hook is generic:

```typescript annotated
// React definition (simplified):
function useState<T>(initialState: T): [T, (newState: T) => void];

// Usage — TypeScript infers T:
const [count, setCount] = useState(0);
// ^ T = number (inferred from 0)
// count: number, setCount: (newState: number) => void

const [name, setName] = useState("Max");
// ^ T = string (inferred from "Max")

// Explicit when necessary (e.g. with null as initial value):
const [user, setUser] = useState<{ name: string; age: number } | null>(null);
// ^ T = { name: string; age: number } | null
// Without <...>, T would be null — too narrow!

setUser({ name: "Max", age: 30 }); // OK
setUser(null);                       // OK
// setUser("Max");                   // Error! string is not the right type
```

> **Why generics shine here:** Without generics, `useState` would either
> have to return `any` (unsafe) or we'd need `useStringState`,
> `useNumberState`, etc. (absurd). Generics make the one hook
> type-safe for all types.

---

## Angular: HttpClient.get\<T\>()

Angular's HTTP client uses generics for type-safe API calls:

```typescript annotated
// Angular HttpClient (simplified):
class HttpClient {
  get<T>(url: string): Observable<T>;
  post<T>(url: string, body: unknown): Observable<T>;
  put<T>(url: string, body: unknown): Observable<T>;
  delete<T>(url: string): Observable<T>;
}

// Usage in an Angular service:
interface User {
  id: number;
  name: string;
  email: string;
}

// T must be explicit — TypeScript cannot look inside the API:
this.http.get<User[]>('/api/users').subscribe(users => {
  // users is User[] — full IDE support!
  console.log(users[0].name);   // OK
  // console.log(users[0].phone); // Error! phone does not exist in User
});

this.http.get<User>('/api/users/1').subscribe(user => {
  console.log(user.name);   // OK
  console.log(user.email);  // OK
});
```

> **Note:** With HTTP calls, TypeScript cannot infer the type
> (the data only arrives at runtime). That's why you must specify `T` **explicitly**.
> This is one of the cases where inference doesn't work.

### More Angular generics: InjectionToken\<T\>

```typescript annotated
// Angular dependency injection with a type-safe token:
import { InjectionToken } from '@angular/core';

interface AppConfig {
  apiUrl: string;
  features: string[];
}

// InjectionToken<T> ensures inject() returns the correct type:
const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// In a component:
const config = inject(APP_CONFIG);
// ^ Type: AppConfig — no cast, no any!
// config.apiUrl — string
// config.features — string[]
```

### More React generics: createContext\<T\>()

```typescript annotated
import { createContext, useContext } from 'react';

interface Theme {
  primary: string;
  secondary: string;
  dark: boolean;
}

// createContext<T> makes the context type-safe:
const ThemeContext = createContext<Theme>({
  primary: '#007bff',
  secondary: '#6c757d',
  dark: false,
});

// In a component:
const theme = useContext(ThemeContext);
// ^ Type: Theme — full IDE support!
// theme.primary — string
// theme.dark — boolean
```

---

## Promise\<T\> — Asynchronous type safety

Every promise carries the type of its resolved value:

```typescript annotated
// Promise definition (simplified from lib.es2015.promise.d.ts):
interface Promise<T> {
  then<U>(onFulfilled: (value: T) => U | Promise<U>): Promise<U>;
  catch(onRejected: (reason: any) => void): Promise<T>;
}

// Usage:
async function fetchUser(id: number): Promise<{ name: string; age: number }> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

const user = await fetchUser(1);
// ^ Type: { name: string; age: number }

// Promise chaining preserves types:
const namePromise: Promise<string> = fetchUser(1).then(user => user.name);
// ^ then transforms Promise<User> to Promise<string>
```

The `then` method is itself generic: `then<U>` takes a function
that transforms from `T` to `U` and returns a `Promise<U>`.
This keeps the entire promise chain type-safe.

> 🧠 **Self-Explanation:** Pause briefly and explain to yourself: Why
> **must** `Promise<T>` be generic? What would the alternative be?
>
> **Key points:** Without generics, Promise would have to return `any` —
> then you lose all type safety after an `await` | The alternative
> would be separate classes: `PromiseString`, `PromiseNumber`,
> `PromiseUser`... — obviously absurd | Generics allow **one**
> Promise type to work type-safely with **any** result type |
> The same argument applies to `Array<T>`, `Map<K,V>`, `Set<T>` —
> container types **must** be generic

---

## Map\<K, V\> and Set\<T\>

The built-in collections are generic:

```typescript annotated
// Map<K, V> — type-safe key-value pairs
const userRoles = new Map<string, string[]>();
userRoles.set("Max", ["admin", "user"]);
userRoles.set("Anna", ["user"]);

const roles = userRoles.get("Max");
// ^ Type: string[] | undefined

// Set<T> — type-safe unique values
const activeIds = new Set<number>();
activeIds.add(1);
activeIds.add(2);
// activeIds.add("three"); // Error! string is not number

// WeakMap, WeakSet — equally generic
const metadata = new WeakMap<object, string>();

// ReadonlyMap, ReadonlySet — readonly variants
function getConfig(): ReadonlyMap<string, string> {
  const config = new Map<string, string>();
  config.set("env", "production");
  return config;
}
// Caller can use .get() but not .set()
```

---

## Your own utility functions

Generics make your own functions reusable:

```typescript annotated
// 1. groupBy — group elements by a key
function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

const users = [
  { name: "Max", role: "admin" },
  { name: "Anna", role: "user" },
  { name: "Bob", role: "admin" },
];

const byRole = groupBy(users, u => u.role);
// ^ Type: Record<string, { name: string; role: string }[]>
// byRole.admin → [{ name: "Max", ... }, { name: "Bob", ... }]

// 2. deduplicate — remove duplicates
function deduplicate<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 3. retry — asynchronous operation with retries
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError;
}

const data = await retry(() => fetch("/api/data").then(r => r.json()));
// ^ data retains the type of the Promise result
```

---

## The big picture: generics hierarchy

```
         Array<T>     Promise<T>     Map<K,V>     Set<T>
              \            |            /            /
               \           |           /            /
                  Standard library (lib.d.ts)
                           |
         React useState<T>   Angular HttpClient<T>
              \                      /
               \                    /
                  Framework APIs
                           |
          groupBy<T,K>    retry<T>    Repository<T>
              \              |              /
               \             |             /
                  Your own code
```

Generics run through **every layer**. From the built-in types through
framework APIs all the way to your own code. That's why they are the cornerstone.

---

> 🔍 **Deeper knowledge: Generic type erasure**
>
> A crucial point that is often overlooked: TypeScript generics
> **disappear at runtime**. When you write `Array<string>`,
> it simply becomes `Array` in JavaScript. There is no runtime
> difference between `Array<string>` and `Array<number>`.
>
> This is called **type erasure** — the TypeScript compiler removes all
> type information during compilation. You therefore **cannot** write:
>
> ```typescript
> // THIS DOES NOT WORK:
> function isStringArray<T>(arr: T[]): boolean {
>   return T === string; // Error! T does not exist at runtime
> }
> ```
>
> **Interesting comparison with Java:** Java has also had
> type erasure for generics since Java 5 (2004). `List<String>` becomes `List` at runtime.
> However, Java is working on *Reifiable Types* (Project Valhalla), which
> could preserve type information at runtime in the future. TypeScript
> will never go down that path — it compiles to JavaScript, and JavaScript
> has no type system at runtime.
>
> **Conclusion:** Generics are a purely **compile-time tool**. They make
> your code safe while you write it, but disappear without a trace
> in the final JavaScript.

---

> **Experiment:** Try the following in the TypeScript Playground —
> a generic utility function you can use immediately in real projects:
>
> ```typescript
> // memoize<T> — caching with automatic type safety:
> function memoize<TArgs extends unknown[], TReturn>(
>   fn: (...args: TArgs) => TReturn
> ): (...args: TArgs) => TReturn {
>   const cache = new Map<string, TReturn>();
>   return (...args: TArgs) => {
>     const key = JSON.stringify(args);
>     if (!cache.has(key)) {
>       cache.set(key, fn(...args));
>     }
>     return cache.get(key)!;
>   };
> }
>
> // Test with different functions:
> const memoFib = memoize((n: number): number =>
>   n <= 1 ? n : memoFib(n - 1) + memoFib(n - 2)
> );
>
> const memoFormat = memoize((name: string, age: number): string =>
>   `${name} is ${age} years old`
> );
>
> // Hover over memoFib and memoFormat — what types does TypeScript infer?
> ```
>
> Observe: TypeScript correctly infers the return type of both functions
> without you having to specify a type. `TArgs` captures all parameter types,
> `TReturn` the return type.

---

## What you've learned

- `useState<T>` in React and `HttpClient.get<T>()` in Angular are generic functions — now you understand why
- With HTTP calls you must specify `T` **explicitly** — TypeScript cannot look inside the API
- `Promise<T>` must be generic because `then()` transforms the type: `Promise<User>` → `Promise<string>`
- `Map<K, V>` and `Set<T>` are generic collections — the type safety comes from generics
- Your own utility functions (`groupBy`, `retry`, `memoize`) benefit directly from generics
- Generics run through all layers: standard library → framework APIs → your own code

**Core concept:** Generics are the bridge between framework code and your domain model. Angular and React could not offer type-safe APIs without generics — and now you can do the same in your own code.

---

## Summary: which pattern for which situation

| Situation | Pattern | Example |
|-----------|---------|---------|
| Same algorithm, different types | Generic function | `map<T, U>`, `filter<T>` |
| Shared data structure | Generic interface | `ApiResponse<T>`, `Box<T>` |
| Type-safe property access | keyof constraint | `getProperty<T, K extends keyof T>` |
| Minimum requirements | extends constraint | `<T extends { id: number }>` |
| Common default type | Default parameter | `<T = string>` |
| Framework integration | Explicit type annotation | `useState<User>`, `http.get<Data>()` |

---

> 🧠 **Explain to yourself:** Why do you have to specify the type explicitly with `http.get<User>(url)`,
> but not with `useState(0)`?
> **Key points:** useState has a value as an argument — inference is possible | HTTP data arrives at runtime — TypeScript cannot know the type | Inference requires compile-time information

---

> **Lesson complete!** You've worked through all 6 sections on Generics Basics.
>
> **What you've taken away:**
> - The "why" behind generics (Section 1)
> - Generic functions and inference (Section 2)
> - Generic interfaces and type aliases (Section 3)
> - Constraints with `extends` and `keyof` (Section 4)
> - Default type parameters for API design (Section 5)
> - Generics in React, Angular, and your own utilities (Section 6)
>
> **Continue with:** Quiz and cheatsheet for this lesson