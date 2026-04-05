# Sektion 6: Praxis — Angular HttpClient, React Query, fetch-Wrapper

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - AsyncIterable und Generators](./05-async-iterable-generators.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie Angular's `HttpClient` Generics fuer typsichere HTTP-Aufrufe nutzt
- Wie React Query/TanStack Query Typparameter durch den gesamten Datenfluss fuehrt
- Wie du einen produktionsreifen, typsicheren fetch-Wrapper baust
- Patterns fuer typsichere API-Schichten in realen Projekten

---

## Angular HttpClient: Generics in Aktion

Du kennst den Angular `HttpClient` aus deiner taeglichen Arbeit.
Schauen wir uns an, wie die Typen unter der Haube funktionieren:

```typescript annotated
// Die vereinfachte Signatur von HttpClient.get():
class HttpClient {
  get<T>(url: string, options?: { /* ... */ }): Observable<T> {
    // ^ T wird vom Aufrufer bestimmt — das ist ein "Trust me"!
    // Angular prueft NICHT ob die API wirklich T zurueckgibt.
    // ...
  }
}

// In deinem Angular Service:
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
    // ^ T = User[] — du SAGST dem Compiler was kommt
    // Zur Laufzeit koennte alles kommen!
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
    // ^ T = User — gleiche "Trust me"-Situation
  }
}
```

> 📖 **Hintergrund: Das "Trust me, Compiler"-Problem**
>
> Angular's `HttpClient.get<T>()` ist ein Pattern das in vielen
> Frameworks vorkommt: Du gibst einen Typ-Parameter an, und der
> Compiler glaubt dir. Das ist bequem, aber unsicher. In der Praxis
> passieren drei Dinge: (1) Die API aendert ihr Schema — dein Typ
> stimmt nicht mehr. (2) Die API gibt einen Fehler-Body statt dem
> erwarteten Typ zurueck. (3) Felder die du als `string` typisiert
> hast, kommen als `null` zurueck.
>
> Die Loesung: Runtime-Validierung. Dazu mehr in L32 (Type-safe APIs
> mit Zod/Valibot).

### Angular HttpClient mit Interceptors und Typen

```typescript annotated
// Typsicherer Interceptor (Angular 17+ functional style)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ^ req: HttpRequest<unknown> — der Request-Body-Typ ist unknown
  const token = inject(AuthService).getToken();
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(authReq);
  // ^ Rueckgabetyp: Observable<HttpEvent<unknown>>
  // Der Response-Typ bleibt erhalten durch den generischen Kontext
};

// Error Handling mit RxJS + Typen
getUser(id: string): Observable<Result<User, AppError>> {
  return this.http.get<User>(`/api/users/${id}`).pipe(
    map(user => ({ ok: true as const, value: user })),
    // ^ map transformiert User zu Result<User, AppError>
    catchError((error: HttpErrorResponse) => {
      // ^ HttpErrorResponse ist der Angular-spezifische Fehlertyp
      return of({
        ok: false as const,
        error: this.toAppError(error)
      });
    })
  );
}
```

> 💭 **Denkfrage:** Warum nutzt Angular `Observable<T>` statt `Promise<T>`
> fuer HTTP-Aufrufe? Was ist der Typ-Vorteil von Observables?
>
> **Antwort:** Observables koennen mehrere Werte ueber Zeit liefern
> (Streams), sind lazy (der Request startet erst bei subscribe()),
> und bieten Operatoren wie `retry()`, `debounceTime()`, `switchMap()`
> die sich typsicher verketten lassen. Fuer einzelne HTTP-Aufrufe
> ist der Unterschied gering — fuer WebSockets, SSE oder Polling
> ist Observable klar ueberlegen.

---

## React Query / TanStack Query: Typen durchgaengig

In React ist TanStack Query der Standard fuer Server-State:

```typescript annotated
// useQuery mit Typparametern
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useQuery<User, Error>({
    // ^ <TData, TError> — zwei Typparameter
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<User>;
      // ^ Der Rueckgabetyp bestimmt TData
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // ^ error: Error — Typ durch TError bestimmt

  return <div>{data.name}</div>;
  // ^ data: User — TypeScript hat durch isLoading/error-Check
  //   das Narrowing gemacht: data ist nicht mehr undefined
}
```

### useMutation mit Typen

```typescript annotated
function CreateUserForm() {
  const mutation = useMutation<User, Error, CreateUserInput>({
    // ^ <TData, TError, TVariables> — drei Typparameter
    mutationFn: (input: CreateUserInput) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then(r => r.json()),
  });

  const handleSubmit = (input: CreateUserInput) => {
    mutation.mutate(input);
    // ^ input muss CreateUserInput sein (TVariables)
  };

  if (mutation.isSuccess) {
    console.log(mutation.data.name);
    // ^ mutation.data: User (TData) — verfuegbar nach isSuccess
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum hat TanStack Query separate
> Typparameter fuer Data, Error und Variables? Was waere das Problem,
> wenn alles ein `any` waere?
>
> **Kernpunkte:** Separate Typparameter erzwingen korrekte Typen an
> jeder Stelle | data: TData nach Success-Check | error: TError nach
> Error-Check | variables: TVariables in mutate() | Ohne Typen:
> data?.name wuerde nie geprueft werden

---

## Der produktionsreife fetch-Wrapper

Hier kombinieren wir alle Patterns dieser Lektion:

```typescript annotated
// Konfiguration
interface FetchConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Typsicherer API-Client
function createApiClient(config: FetchConfig) {
  const { baseUrl, defaultHeaders = {}, timeout = 10000, retries = 0 } = config;

  async function request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; headers?: Record<string, string> }
  ): Promise<T> {
    // ^ Generischer Rueckgabetyp T
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

    // Timeout + Retry aus Sektion 04
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
    // ^ Jede Methode ist generisch — T wird beim Aufruf bestimmt
  };
}

// Verwendung:
const api = createApiClient({ baseUrl: 'https://api.example.com', retries: 2 });
const users = await api.get<User[]>('/users');
// ^ users: User[] — Typ durch den Aufrufer bestimmt
const newUser = await api.post<User>('/users', { name: 'Max', age: 30 });
// ^ newUser: User
```

> 🔬 **Experiment:** Erweitere den API-Client um eine `validate`-Option
> die den Response zur Laufzeit prueft:
>
> ```typescript
> // Idee: validate-Funktion die T oder Error zurueckgibt
> async function request<T>(
>   method: string,
>   path: string,
>   options?: {
>     body?: unknown;
>     validate?: (data: unknown) => T; // Runtime-Validierung!
>   }
> ): Promise<T> {
>   const raw = await fetchRaw(method, path, options);
>   if (options?.validate) {
>     return options.validate(raw);
>     // ^ validate konvertiert unknown → T (oder wirft bei Fehler)
>   }
>   return raw as T; // Fallback: Trust me
> }
>
> // Verwendung mit Zod (L32):
> const users = await api.get('/users', {
>   validate: data => UserArraySchema.parse(data)
> });
> ```

---

## Pattern: Typed API Routes

Fuer groessere Projekte: Eine zentrale Typ-Definition aller Endpunkte:

```typescript annotated
// API-Routen als Typ-Map
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

// Typsicherer Client mit Routen-Map
function typedGet<Path extends keyof ApiRoutes>(
  path: Path
): Promise<ApiRoutes[Path] extends { GET: { response: infer R } } ? R : never> {
  // ^ Conditional Type extrahiert den Response-Typ aus der Map
  return api.get(path as string) as any;
}

// Verwendung — volle Autocomplete und Typ-Sicherheit:
const users = await typedGet('/users');
// ^ users: User[] — aus der Route-Map extrahiert!
```

> ⚡ **Praxis-Tipp:** Dieses Pattern ist die Basis fuer tRPC und
> andere End-to-End Type Safety-Loesungen. In L32 vertiefen wir das.

---

## Was du gelernt hast

- Angular's `HttpClient.get<T>()` ist ein "Trust me" — keine Runtime-Validierung
- React Query/TanStack Query fuehrt Typen durch den gesamten State-Lifecycle
- Ein produktionsreifer fetch-Wrapper kombiniert Generics, timeout und retry
- Typed API Routes als zentrale Typ-Map ermoeglichen Autocomplete und Sicherheit
- Runtime-Validierung (L32) schliesst die Luecke zwischen Typ und Realitaet

**Kernkonzept zum Merken:** TypeScript-Generics in HTTP-Clients sind ein Versprechen, kein Beweis. `HttpClient.get<User[]>()` sagt "ich glaube, die API gibt User[] zurueck". Erst Runtime-Validierung (Zod, Valibot) macht aus dem Glauben Wissen.

---

> **Pausenpunkt** — Du hast Lektion 31 abgeschlossen! Du verstehst jetzt,
> wie TypeScript's Typsystem mit asynchronem Code zusammenspielt — von
> Promise<T> ueber async/await bis hin zu AsyncGenerators und Framework-
> Integration.
>
> **Naechste Lektion:** [L32: Type-safe APIs](../32-type-safe-apis/sections/01-rest-api-typing.md)
