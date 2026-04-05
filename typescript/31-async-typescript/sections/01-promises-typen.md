# Sektion 1: Promise-Typen — Promise<T> und PromiseLike

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - async/await und Typinferenz](./02-async-await-typinferenz.md)

---

## Was du hier lernst

- Wie `Promise<T>` intern aufgebaut ist und warum der Typparameter `T` den aufgeloesten Wert beschreibt
- Den Unterschied zwischen `Promise<T>` und `PromiseLike<T>` — und wann du welches brauchst
- Wie `Awaited<T>` verschachtelte Promises automatisch entpackt
- Warum TypeScript den Fehlertyp von `reject()` nicht tracken kann

---

## Die Geschichte: Von Callbacks zu Promises

Bevor ES2015 Promises einfuehrte, war asynchroner JavaScript-Code ein
Albtraum aus verschachtelten Callbacks — die beruehmte "Callback Hell".
Im Jahr 2012 schlug Domenic Denicola das Promises/A+ Spec vor, das
spaeter als natives `Promise` in ES2015 landete.

TypeScript hatte von Anfang an einen Vorteil: Der generische Typ
`Promise<T>` konnte den aufgeloesten Wert praezise beschreiben. In
reinem JavaScript weisst du bei `fetch()` nicht, was zurueckkommt.
In TypeScript schon — zumindest auf Compilezeit-Ebene.

> 📖 **Hintergrund: Warum Promise generisch ist**
>
> Das Promises/A+ Spec definiert nur das Verhalten: `.then()` nimmt
> Callbacks, `.catch()` behandelt Fehler. TypeScript ging weiter und
> fuehrte den Typparameter `T` ein, der den Typ des aufgeloesten Werts
> beschreibt. Das ist ein reines Compilezeit-Feature — zur Laufzeit ist
> ein `Promise<string>` identisch mit `Promise<number>`. Wieder einmal
> Type Erasure in Aktion.

---

## Promise<T> im Detail

Der Kern-Typ `Promise<T>` ist in `lib.es2015.promise.d.ts` definiert.
Schauen wir uns die relevanten Teile an:

```typescript annotated
interface Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    // ^ T ist der aufgeloeste Wert — genau DAS beschreibt der Typparameter
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    // ^ reason ist 'any' — TypeScript kann reject-Typen NICHT tracken!
  ): Promise<TResult1 | TResult2>;
  // ^ Das Ergebnis ist ein neues Promise mit den transformierten Typen

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult>;
  // ^ catch() gibt T | TResult zurueck — der Erfolgsfall bleibt erhalten

  finally(onfinally?: (() => void) | null): Promise<T>;
  // ^ finally() aendert den Typ NICHT — es gibt das gleiche Promise<T> zurueck
}
```

### Warum ist `reason: any` und nicht `reason: unknown`?

Das ist eine bewusste Designentscheidung. In JavaScript kann
`throw` **jeden Wert** werfen — nicht nur Error-Objekte:

```typescript
// All das ist gueltiges JavaScript:
throw new Error("normal");
throw "ein String";
throw 42;
throw { code: "FAIL" };
throw undefined;
```

TypeScript kann nicht statisch analysieren, welcher Wert in `reject()`
oder `throw` landet. Deshalb ist `reason: any` — ein Kompromiss zwischen
Nutzbarkeit und Sicherheit.

> 💭 **Denkfrage:** Wenn TypeScript `reason` als `unknown` statt `any`
> definieren wuerde, was wuerde sich fuer Entwickler aendern? Waere
> das besser oder schlechter?
>
> **Antwort:** Mit `unknown` muesste jeder `.catch()`-Handler erst den
> Fehlertyp pruefen (z.B. `if (reason instanceof Error)`), bevor er
> auf Properties zugreifen kann. Das waere sicherer, aber wuerde
> bestehenden Code brechen. TypeScript 4.4 fuehrte `useUnknownInCatchVariables`
> ein — aber nur fuer `catch`-Bloecke, nicht fuer Promise.reject().

---

## PromiseLike<T> — Das minimale Interface

Neben `Promise<T>` gibt es `PromiseLike<T>`. Der Unterschied ist subtil
aber wichtig:

```typescript annotated
interface PromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>;
  // ^ Kein catch(), kein finally() — nur then()
  // ^ Das macht PromiseLike kompatibel mit JEDEM "thenable"
}
```

### Wann brauchst du PromiseLike?

`PromiseLike<T>` ist das Interface fuer alles, was ein `.then()` hat —
sogenannte "Thenables". Das ist relevant bei:

```typescript
// 1. Bibliotheken mit eigenen Promise-Implementierungen
// (Bluebird, Q, jQuery.Deferred)
function acceptAnyThenable(p: PromiseLike<string>) {
  return p.then(s => s.toUpperCase());
}

// 2. Angular's Zone.js-Promises
// Zone.js wrappt native Promises — PromiseLike akzeptiert beides

// 3. Interoperabilitaet in Libraries
// Wenn du eine Library schreibst, akzeptiere PromiseLike<T>
// statt Promise<T> — das ist flexibler fuer Nutzer
```

> ⚡ **Praxis-Tipp fuer Angular:** In deinem Angular-Projekt nutzt du
> `HttpClient`, der `Observable<T>` zurueckgibt. Wenn du `.toPromise()`
> (deprecated) oder `lastValueFrom()` verwendest, erhaeltst du ein
> `Promise<T>`. Der HttpClient-Typ-Parameter fliesst direkt in den
> Promise-Typ: `lastValueFrom(this.http.get<User[]>('/api'))` ist
> `Promise<User[]>`.

---

## Awaited<T> — Promises entpacken

TypeScript 4.5 fuehrte den Utility Type `Awaited<T>` ein, der
verschachtelte Promises rekursiv entpackt:

```typescript annotated
type A = Awaited<Promise<string>>;
// ^ string — ein Level entpackt

type B = Awaited<Promise<Promise<number>>>;
// ^ number — ZWEI Level entpackt (rekursiv!)

type C = Awaited<string>;
// ^ string — kein Promise, bleibt unveraendert

type D = Awaited<Promise<string> | number>;
// ^ string | number — Union wird verteilt (distributiv)
```

### Warum wurde Awaited eingefuehrt?

Vor TypeScript 4.5 hatte `Promise.all()` ein Problem: Der Rueckgabetyp
konnte verschachtelte Promises nicht korrekt entpacken.

```typescript
// Vor TS 4.5: Problem mit verschachtelten Promises
async function getUser(): Promise<Promise<string>> {
  // ... (z.B. doppeltes wrapping durch Library-Code)
  return Promise.resolve("Max");
}
// Rueckgabetyp war Promise<Promise<string>> statt Promise<string>
// JavaScript entpackt automatisch, aber TS-Typen stimmten nicht

// Ab TS 4.5: Awaited entpackt korrekt
type Result = Awaited<ReturnType<typeof getUser>>;
// Result = string (nicht Promise<string>!)
```

> 🧠 **Erklaere dir selbst:** Warum entpackt JavaScript verschachtelte
> Promises automatisch (`Promise.resolve(Promise.resolve(42))` ergibt
> `42`, nicht `Promise<42>`), waehrend TypeScript dafuer den speziellen
> Typ `Awaited<T>` braucht?
>
> **Kernpunkte:** JavaScript hat Runtime-Unwrapping eingebaut |
> TypeScript-Typen sind statisch — kein automatisches Unwrapping |
> Awaited<T> bildet das Laufzeit-Verhalten im Typsystem nach

---

## Promise.all, Promise.race und ihre Typen

Die statischen Promise-Methoden haben praezise Typen:

```typescript annotated
// Promise.all — wartet auf ALLE, Typ ist Tupel
const results = await Promise.all([
  fetch("/api/users").then(r => r.json() as Promise<User[]>),
  fetch("/api/posts").then(r => r.json() as Promise<Post[]>),
]);
// ^ results: [User[], Post[]] — Tupel-Typ, Reihenfolge erhalten!

// Promise.race — erste die fertig wird
const fastest = await Promise.race([
  fetchWithTimeout<User>("/api/user", 5000),
  timeoutPromise<User>(5000),
]);
// ^ fastest: User — Union der moeglichen Ergebnisse

// Promise.allSettled — alle Ergebnisse, auch Fehler
const settled = await Promise.allSettled([
  fetchUser(),
  fetchPosts(),
]);
// ^ settled: [PromiseSettledResult<User>, PromiseSettledResult<Post[]>]
// PromiseSettledResult = { status: "fulfilled"; value: T } | { status: "rejected"; reason: any }
```

> 🔬 **Experiment:** Probiere diesen Code in deiner IDE aus und beobachte
> die Typen:
>
> ```typescript
> async function experiment() {
>   const a = Promise.all([1, "hello", true] as const);
>   // Was ist der Typ von a? (Hover drueber!)
>
>   const b = Promise.all([
>     Promise.resolve(42),
>     Promise.resolve("test"),
>   ]);
>   // Was ist der Typ von b?
>
>   const c = Promise.race([
>     new Promise<string>(r => setTimeout(() => r("slow"), 1000)),
>     new Promise<number>(r => setTimeout(() => r(42), 500)),
>   ]);
>   // Was ist der Typ von c? Ist er string oder number?
> }
> ```
>
> **Erwartung:** `a` ist `Promise<readonly [1, "hello", true]>`,
> `b` ist `Promise<[number, string]>`, `c` ist `Promise<string | number>`.

---

## React-Bezug: Async Components und Promise-Typen

In React begegnest du Promise-Typen besonders bei Data Fetching:

```typescript
// React Server Components (Next.js) — async Components
async function UserProfile({ id }: { id: string }): Promise<JSX.Element> {
  const user = await fetchUser(id);
  // user: User — TypeScript inferiert den Typ aus fetchUser
  return <div>{user.name}</div>;
}

// Client-Side mit React Query / TanStack Query
const { data } = useQuery<User, Error>({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
// data: User | undefined — der Typparameter bestimmt den Typ
```

---

## Was du gelernt hast

- `Promise<T>` beschreibt den Typ des aufgeloesten Werts — `T` ist rein Compilezeit
- `PromiseLike<T>` ist das minimale Interface (nur `.then()`) fuer Interoperabilitaet
- `Awaited<T>` entpackt verschachtelte Promises rekursiv — nutze es mit `ReturnType`
- Der Fehlertyp ist immer `any` — TypeScript kann `reject()`/`throw` nicht tracken
- `Promise.all()` erzeugt Tupel-Typen, `Promise.race()` erzeugt Union-Typen

**Kernkonzept zum Merken:** Promise<T> trackt nur den Erfolgsfall. Der Fehlerfall ist immer `any`. Das ist die groesste Luecke im Async-Typsystem — und der Grund, warum typsicheres Error Handling (L25) so wichtig ist.

---

> **Pausenpunkt** — Du kennst jetzt die Grundbausteine. In der naechsten
> Sektion sehen wir, wie `async/await` diese Typen automatisch entpackt.
>
> Weiter geht es mit: [Sektion 02: async/await und Typinferenz](./02-async-await-typinferenz.md)
