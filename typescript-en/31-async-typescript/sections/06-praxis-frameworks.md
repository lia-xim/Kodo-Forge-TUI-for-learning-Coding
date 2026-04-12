# Section 6: Practice — Angular HttpClient, React Query, fetch Wrapper

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - AsyncIterable and Generators](./05-async-iterable-generators.md)
> Next section: [07 - The `using` Keyword — Explicit Resource Management](./07-using-keyword-resource-management.md)

---

## What you'll learn here

- How Angular's `HttpClient` uses generics for type-safe HTTP calls
- How React Query/TanStack Query carries type parameters through the entire data flow
- How to build a production-ready, type-safe fetch wrapper
- Patterns for type-safe API layers in real-world projects

---

## Angular HttpClient: Generics in Action

You know Angular's `HttpClient` from your daily work.
Let's look at how the types work under the hood:

```typescript annotated
// The simplified signature of HttpClient.get():
class HttpClient {
  get<T>(url: string, options?: { /* ... */ }): Observable<T> {
    // ^ T is determined by the caller — this is a "trust me"!
    // Angular does NOT check whether the API actually returns T.
    // ...
  }
}

// In your Angular service:
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
    // ^ T = User[] — you TELL the compiler what's coming
    // At runtime, anything could come back!
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
    // ^ T = User — same "trust me" situation
  }
}
```

> 📖 **Background: The "Trust Me, Compiler" Problem**
>
> Angular's `HttpClient.get<T>()` is a pattern that appears in many
> frameworks: you specify a type parameter, and the compiler believes
> you. This is convenient, but unsafe. In practice,
> three things happen: (1) The API changes its schema — your type
> no longer matches. (2) The API returns an error body instead of
> the expected type. (3) Fields you typed as `string`
> come back as `null`.
>
> The solution: runtime validation. More on this in L32 (Type-safe APIs
> with Zod/Valibot).

### Angular HttpClient with Interceptors and Types

```typescript annotated
// Type-safe interceptor (Angular 17+ functional style)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ^ req: HttpRequest<unknown> — the request body type is unknown
  const token = inject(AuthService).getToken();
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(authReq);
  // ^ Return type: Observable<HttpEvent<unknown>>
  // The response type is preserved through the generic context
};

// Error handling with RxJS + types
getUser(id: string): Observable<Result<User, AppError>> {
  return this.http.get<User>(`/api/users/${id}`).pipe(
    map(user => ({ ok: true as const, value: user })),
    // ^ map transforms User to Result<User, AppError>
    catchError((error: HttpErrorResponse) => {
      // ^ HttpErrorResponse is Angular's specific error type
      return of({
        ok: false as const,
        error: this.toAppError(error)
      });
    })
  );
}
```

> 💭 **Think about it:** Why does Angular use `Observable<T>` instead of `Promise<T>`
> for HTTP calls? What is the type advantage of Observables?
>
> **Answer:** Observables can deliver multiple values over time
> (streams), are lazy (the request only starts on subscribe()),
> and offer operators like `retry()`, `debounceTime()`, `switchMap()`
> that can be chained in a type-safe way. For individual HTTP calls
> the difference is small — for WebSockets, SSE, or polling,
> Observable is clearly superior.

---

## React Query / TanStack Query: Types All the Way Through

In React, TanStack Query is the standard for server state:

```typescript annotated
// useQuery with type parameters
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useQuery<User, Error>({
    // ^ <TData, TError> — two type parameters
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<User>;
      // ^ The return type determines TData
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // ^ error: Error — type determined by TError

  return <div>{data.name}</div>;
  // ^ data: User — TypeScript performed narrowing through
  //   the isLoading/error checks: data is no longer undefined
}
```

### useMutation with Types

```typescript annotated
function CreateUserForm() {
  const mutation = useMutation<User, Error, CreateUserInput>({
    // ^ <TData, TError, TVariables> — three type parameters
    mutationFn: (input: CreateUserInput) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then(r => r.json()),
  });

  const handleSubmit = (input: CreateUserInput) => {
    mutation.mutate(input);
    // ^ input must be CreateUserInput (TVariables)
  };

  if (mutation.isSuccess) {
    console.log(mutation.data.name);
    // ^ mutation.data: User (TData) — available after isSuccess
  }
}
```

> 🧠 **Explain to yourself:** Why does TanStack Query have separate
> type parameters for Data, Error, and Variables? What would the problem be
> if everything were `any`?
>
> **Key points:** Separate type parameters enforce correct types at
> every point | data: TData after success check | error: TError after
> error check | variables: TVariables in mutate() | Without types:
> data?.name would never be verified

---

## The Production-Ready fetch Wrapper

Here we combine all the patterns from this lesson:

```typescript annotated
// Configuration
interface FetchConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Type-safe API client
function createApiClient(config: FetchConfig) {
  const { baseUrl, defaultHeaders = {}, timeout = 10000, retries = 0 } = config;

  async function request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; headers?: Record<string, string> }
  ): Promise<T> {
    // ^ Generic return type T
    const url = `${baseUrl}${path}`;
    const headers = { ...defaultHeaders, ...options?.headers };

    const fetchFn = (signal: AbortSignal) =>
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal,
      }).then(async res => {
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw Object.assign(new Error(`HTTP ${res.status}`), {
            status: res.status, body
          });
        }
        return res.json() as Promise<T>;
      });

    // Timeout + retry from section 04
    if (retries > 0) {
      return retry(
        () => withTimeout(fetchFn, timeout),
        { maxAttempts: retries + 1, delayMs: 1000 }
      );
    }
    return withTimeout(fetchFn, timeout);
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, { body }),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, { body }),
    delete: <T>(path: string) => request<T>('DELETE', path),
    // ^ Each method is generic — T is determined at the call site
  };
}

// Usage:
const api = createApiClient({ baseUrl: 'https://api.example.com', retries: 2 });
const users = await api.get<User[]>('/users');
// ^ users: User[] — type determined by the caller
const newUser = await api.post<User>('/users', { name: 'Max', age: 30 });
// ^ newUser: User
```

> 🔬 **Experiment:** Extend the API client with a `validate` option
> that checks the response at runtime:
>
> ```typescript
> // Idea: validate function that returns T or throws an error
> async function request<T>(
>   method: string,
>   path: string,
>   options?: {
>     body?: unknown;
>     validate?: (data: unknown) => T; // Runtime validation!
>   }
> ): Promise<T> {
>   const raw = await fetchRaw(method, path, options);
>   if (options?.validate) {
>     return options.validate(raw);
>     // ^ validate converts unknown → T (or throws on failure)
>   }
>   return raw as T; // Fallback: trust me
> }
>
> // Usage with Zod (L32):
> const users = await api.get('/users', {
>   validate: data => UserArraySchema.parse(data)
> });
> ```

---

## Pattern: Typed API Routes

For larger projects: a central type definition for all endpoints:

```typescript annotated
// API routes as a type map
interface ApiRoutes {
  '/users': {
    GET: { response: User[]; query?: { page?: number } };
    POST: { response: User; body: CreateUserInput };
  };
  '/users/:id': {
    GET: { response: User };
    PUT: { response: User; body: UpdateUserInput };
    DELETE: { response: void };
  };
}

// Type-safe client with route map
function typedGet<Path extends keyof ApiRoutes>(
  path: Path
): Promise<ApiRoutes[Path] extends { GET: { response: infer R } } ? R : never> {
  // ^ Conditional type extracts the response type from the map
  return api.get(path as string) as any;
}

// Usage — full autocomplete and type safety:
const users = await typedGet('/users');
// ^ users: User[] — extracted from the route map!
```

> ⚡ **Practical tip:** This pattern is the foundation for tRPC and
> other end-to-end type safety solutions. We'll go deeper in L32.

---

## What you've learned

- Angular's `HttpClient.get<T>()` is a "trust me" — no runtime validation
- React Query/TanStack Query carries types through the entire state lifecycle
- A production-ready fetch wrapper combines generics, timeout, and retry
- Typed API routes as a central type map enable autocomplete and safety
- Runtime validation (L32) closes the gap between type and reality

**Key concept to remember:** TypeScript generics in HTTP clients are a promise, not proof. `HttpClient.get<User[]>()` says "I believe the API returns User[]". Only runtime validation (Zod, Valibot) turns belief into knowledge.

---

> **Pause point** — The final section of this lesson is up next:
>
> Continue with: [Section 07: The `using` Keyword — Explicit Resource Management](./07-using-keyword-resource-management.md)