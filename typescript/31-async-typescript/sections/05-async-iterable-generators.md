# Sektion 5: AsyncIterable und Generators

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Generische Async-Patterns](./04-generische-async-patterns.md)
> Naechste Sektion: [06 - Praxis: Angular HttpClient, React Query, fetch-Wrapper](./06-praxis-frameworks.md)

---

## Was du hier lernst

- Wie `AsyncGenerator<T>` und `AsyncIterable<T>` typisiert sind
- Den Unterschied zwischen `yield` und `return` im Typsystem
- Wie `for await...of` den Typ korrekt inferiert
- Praktische Patterns: Streaming, Pagination, Event-Streams

---

## Die Geschichte: Von Sync zu Async Iteration

ES2015 brachte synchrone Iteratoren (`for...of`, `Symbol.iterator`).
ES2018 erweiterte das Konzept um asynchrone Iteratoren (`for await...of`,
`Symbol.asyncIterator`). TypeScript unterstuetzt beides seit TS 2.3
mit eigenen Interfaces.

> 📖 **Hintergrund: Warum braucht man Async Iteration?**
>
> Synchrone Iteratoren muessen ihre Werte sofort liefern. Aber was, wenn
> jeder Wert erst von einer API geladen werden muss? Oder wenn ein
> WebSocket-Stream Nachrichten in unregelmaessigen Abstaenden liefert?
> Async Iteratoren loesen genau dieses Problem: Jeder `next()`-Aufruf
> gibt ein `Promise` zurueck, das aufgeloest wird, wenn der naechste
> Wert bereit ist.
>
> In der Praxis begegnest du Async Iteratoren bei: Server-Sent Events,
> WebSocket-Streams, paginierte API-Responses, File-Streaming mit
> Node.js `fs.createReadStream()`, und KI-Streaming (ChatGPT-Style).

---

## Die Interfaces: AsyncIterator und AsyncIterable

TypeScript definiert drei zusammenhaengende Interfaces:

```typescript annotated
// 1. AsyncIterator — das Kern-Interface
interface AsyncIterator<T, TReturn = any, TNext = undefined> {
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  // ^ next() gibt ein Promise zurueck — NICHT direkt ein IteratorResult
  // T = Typ der yield-Werte
  // TReturn = Typ des return-Werts (meist void oder any)
  // TNext = Typ der Werte die man in next() reingibt

  return?(value?: TReturn): Promise<IteratorResult<T, TReturn>>;
  throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}

// 2. AsyncIterable — hat Symbol.asyncIterator
interface AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
  // ^ Die Methode die for-await-of aufruft
}

// 3. AsyncGenerator — kombiniert beides
interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown>
  extends AsyncIterator<T, TReturn, TNext> {
  // AsyncGenerator IST ein AsyncIterator
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  return(value: TReturn): Promise<IteratorResult<T, TReturn>>;
  throw(e: any): Promise<IteratorResult<T, TReturn>>;
  [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
  // ^ UND ein AsyncIterable — kann also in for-await-of verwendet werden
}
```

---

## Async Generators in der Praxis

```typescript annotated
// Einfacher Async Generator
async function* countdown(from: number): AsyncGenerator<number> {
  // ^ async function* — der Stern macht es zum Generator
  // ^ Rueckgabetyp: AsyncGenerator<number>
  for (let i = from; i > 0; i--) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
    // ^ yield liefert den naechsten Wert (Typ: number)
  }
  // Implizites return: void (kein expliziter return-Wert)
}

// Verwendung mit for-await-of
async function runCountdown() {
  for await (const n of countdown(5)) {
    // ^ n: number — TypeScript inferiert den Typ aus dem yield-Typ
    console.log(n); // 5, 4, 3, 2, 1
  }
}
```

### yield vs return im Typsystem

```typescript annotated
async function* generate(): AsyncGenerator<string, number, boolean> {
  // ^ <Yield-Typ, Return-Typ, Next-Typ>
  const input = yield "hello";
  // ^ yield gibt string zurueck, input ist boolean (TNext)
  const input2 = yield "world";
  return 42;
  // ^ return-Wert hat Typ number (TReturn)
}

async function consumer() {
  const gen = generate();
  const first = await gen.next();
  // ^ first: IteratorResult<string, number>
  // first = { value: "hello", done: false }

  const second = await gen.next(true);
  // ^ true wird zum TNext-Parameter (boolean)
  // second = { value: "world", done: false }

  const last = await gen.next(false);
  // ^ last = { value: 42, done: true }
  // last.value: number (der Return-Typ)
}
```

> 💭 **Denkfrage:** Warum hat `IteratorResult<T, TReturn>` zwei
> verschiedene Typen fuer `value` — je nachdem ob `done` true oder
> false ist? Warum nicht einfach `T | TReturn`?
>
> **Antwort:** Es ist eine Discriminated Union!
> `{ done: false; value: T } | { done: true; value: TReturn }`.
> Wenn du `if (!result.done)` pruefst, narrowt TypeScript `value`
> automatisch zu `T`. Bei `done: true` ist es `TReturn`.
> Das ist das gleiche Prinzip wie bei Fetch-States aus L12.

---

## Praktisches Pattern: Paginierte API-Abfrage

```typescript annotated
interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  // ^ null bedeutet: keine weiteren Seiten
}

async function* paginate<T>(
  fetchPage: (cursor?: string) => Promise<PaginatedResponse<T>>
): AsyncGenerator<T[], void> {
  // ^ Yield-Typ: T[] (eine Seite), Return-Typ: void
  let cursor: string | undefined;
  do {
    const response = await fetchPage(cursor);
    yield response.data;
    // ^ Jede Seite wird als T[] geliefert
    cursor = response.nextCursor ?? undefined;
  } while (cursor);
}

// Verwendung:
async function getAllUsers() {
  const allUsers: User[] = [];
  for await (const page of paginate<User>(cursor =>
    fetch(`/api/users?cursor=${cursor ?? ""}`).then(r => r.json())
  )) {
    // ^ page: User[] — jede Iteration ist eine Seite
    allUsers.push(...page);
    console.log(`Geladen: ${allUsers.length} User`);
  }
  return allUsers;
}
```

> 🧠 **Erklaere dir selbst:** Warum ist ein Async Generator besser
> als eine rekursive Funktion fuer Pagination? Denke an Speicherverbrauch
> und Kontrolle.
>
> **Kernpunkte:** Generator liefert Seiten einzeln — nicht alles
> auf einmal im Speicher | Caller entscheidet wann die naechste
> Seite geladen wird | break in for-await-of stoppt das Laden |
> Rekursion wuerde alle Seiten auf einmal laden muessen

---

## Praktisches Pattern: Event-Stream

```typescript annotated
// WebSocket als AsyncIterable wrappen
function websocketStream<T>(url: string): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      const ws = new WebSocket(url);
      const queue: T[] = [];
      // ^ Nachrichten-Puffer
      let resolve: ((result: IteratorResult<T>) => void) | null = null;
      let done = false;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as T;
        if (resolve) {
          resolve({ value: data, done: false });
          resolve = null;
        } else {
          queue.push(data);
        }
      };
      ws.onclose = () => {
        done = true;
        resolve?.({ value: undefined as any, done: true });
      };

      return {
        async next(): Promise<IteratorResult<T>> {
          if (queue.length > 0) {
            return { value: queue.shift()!, done: false };
          }
          if (done) return { value: undefined as any, done: true };
          return new Promise(r => { resolve = r; });
        },
        async return() {
          ws.close();
          return { value: undefined as any, done: true };
        },
        [Symbol.asyncIterator]() { return this; }
      };
    }
  };
}

// Verwendung — clean und typsicher:
for await (const message of websocketStream<ChatMessage>("wss://chat.example.com")) {
  // ^ message: ChatMessage — Typ durch den Typparameter
  console.log(`${message.user}: ${message.text}`);
}
```

> ⚡ **Praxis-Tipp fuer Angular:** In Angular nutzt du RxJS-Observables
> statt AsyncIterables fuer Streams. Aber du kannst Observables in
> AsyncIterables konvertieren:
>
> ```typescript
> // Observable → AsyncIterable (experimentelles Feature in RxJS 7+)
> import { from } from 'rxjs';
>
> // AsyncIterable → Observable
> const obs$ = from(websocketStream<ChatMessage>("wss://..."));
>
> // In Angular 17+ mit Signals:
> const messages = toSignal(obs$, { initialValue: [] });
> ```

---

## for await...of: Typsicherheit beim Konsumieren

```typescript
// TypeScript prueft den Typ automatisch:
async function processStream(stream: AsyncIterable<LogEntry>) {
  for await (const entry of stream) {
    // ^ entry: LogEntry — korrekt inferiert
    if (entry.level === "error") {
      await notifyAdmin(entry);
    }
  }
}
```

> 🔬 **Experiment:** Baue einen einfachen Async Generator der Zahlen
> mit Verzoegerung liefert und konsumiere ihn:
>
> ```typescript
> async function* delayedRange(start: number, end: number, delayMs: number) {
>   for (let i = start; i <= end; i++) {
>     await new Promise(r => setTimeout(r, delayMs));
>     yield i;
>   }
> }
>
> // Konsumiere und beobachte die Typen:
> for await (const num of delayedRange(1, 5, 500)) {
>   console.log(num); // Was ist der Typ von num?
>   if (num === 3) break; // Was passiert hier mit dem Generator?
> }
> // Antwort: num ist number, break ruft implizit gen.return() auf
> ```

---

## Was du gelernt hast

- `AsyncGenerator<Y, R, N>` hat drei Typparameter: Yield, Return, Next
- `for await...of` inferiert den Typ aus dem Yield-Typparameter
- `IteratorResult<T, TReturn>` ist eine Discriminated Union mit `done` als Diskriminante
- Async Generators eignen sich perfekt fuer Pagination und Streaming
- `break` in `for await...of` ruft automatisch `return()` auf dem Generator auf

**Kernkonzept zum Merken:** Async Generators sind "lazy" — sie berechnen Werte erst wenn sie angefordert werden. Das macht sie ideal fuer Streams und Pagination, wo du nicht alle Daten auf einmal laden willst. TypeScript's Typsystem stellt sicher, dass jeder `yield`-Wert den richtigen Typ hat.

---

> **Pausenpunkt** — Du kennst jetzt auch die fortgeschrittenen Async-
> Primitiven. Die letzte Sektion bringt alles in den Framework-Kontext.
>
> Weiter geht es mit: [Sektion 06: Praxis — Angular, React, fetch-Wrapper](./06-praxis-frameworks.md)
