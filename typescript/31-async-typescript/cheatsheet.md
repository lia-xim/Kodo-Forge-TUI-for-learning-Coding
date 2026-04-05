# Cheatsheet: Async TypeScript

Schnellreferenz fuer Lektion 31.

---

## Promise-Typen

```typescript
// Promise<T> — T ist der aufgeloeste Wert
const p: Promise<string> = Promise.resolve("hello");

// PromiseLike<T> — minimales Interface (nur then())
function accept(p: PromiseLike<string>) { p.then(s => s.toUpperCase()); }

// Awaited<T> — entpackt verschachtelte Promises rekursiv
type A = Awaited<Promise<Promise<string>>>; // string

// Fehlertyp ist IMMER any — nicht trackbar!
p.catch((reason: any) => { /* ... */ });
```

---

## async/await Typen

```typescript
// async wrappt IMMER in Promise<T>
async function f(): Promise<number> { return 42; }

// await entpackt Promise<T> zu T
const n: number = await f();

// json() gibt Promise<any> — IMMER explizit annotieren!
const data: User = await response.json(); // Trust me
```

---

## Error Handling

```typescript
// tsconfig: "useUnknownInCatchVariables": true (Teil von strict)
try { await riskyOp(); }
catch (error) { // error: unknown
  if (error instanceof Error) {
    console.log(error.message); // OK
  }
}

// Async Result Pattern
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function trySafe<T>(p: Promise<T>): Promise<Result<T>> {
  try { return { ok: true, value: await p }; }
  catch (e) { return { ok: false, error: e instanceof Error ? e : new Error(String(e)) }; }
}
```

---

## Generische Async-Patterns

```typescript
// retry<T> — nimmt Funktion (nicht Promise!) fuer Wiederholbarkeit
async function retry<T>(fn: () => Promise<T>, opts: { maxAttempts: number; delayMs: number }): Promise<T>;

// withTimeout<T> — mit AbortController
async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T>;

// Kombination:
const user = await retry(
  () => withTimeout(signal => fetchUser("1", signal), 5000),
  { maxAttempts: 3, delayMs: 1000 }
);
```

---

## Promise.all / race / allSettled

```typescript
// Promise.all — Tupel-Typ
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
// [User, Post[]]

// Promise.race — Union-Typ
const fastest = await Promise.race([fetchA(), fetchB()]);
// A | B

// Promise.allSettled — PromiseSettledResult
const results = await Promise.allSettled([a(), b()]);
// [PromiseSettledResult<A>, PromiseSettledResult<B>]
```

---

## AsyncGenerator

```typescript
// Definition
async function* paginate<T>(fetchPage: (cursor?: string) => Promise<{ data: T[]; next: string | null }>): AsyncGenerator<T[]> {
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    yield page.data;
    cursor = page.next ?? undefined;
  } while (cursor);
}

// Konsumieren
for await (const page of paginate(fetchUsers)) {
  // page: User[]
}
```

---

## Haeufige Fehler

| Fehler | Problem | Loesung |
|---|---|---|
| Vergessenes `await` | Variable ist Promise statt Wert | await vor dem Aufruf |
| `ids.forEach(async ...)` | Promises werden nicht gesammelt | `Promise.all(ids.map(...))` |
| `response.json()` ohne Typ | Ergebnis ist `any` | Explizite Annotation oder Zod |
| `HttpClient.get<T>()` | Kein Runtime-Check | Zod/Valibot Validierung |
| `Promise.race` ohne Abort | Langsames Promise laeuft weiter | `AbortController` nutzen |
| `retry(fetchUser("1"))` | Promise schon gestartet | `retry(() => fetchUser("1"))` |
