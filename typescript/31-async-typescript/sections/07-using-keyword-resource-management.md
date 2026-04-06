# Sektion 7: Das `using`-Keyword — Explicit Resource Management

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [06 - Praxis: Angular HttpClient, React Query, fetch-Wrapper](./06-praxis-frameworks.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Warum Ressourcen-Leaks in JavaScript ein strukturelles Problem sind und wie `using` es loest
- Wie `Symbol.dispose` und `Symbol.asyncDispose` das `Disposable`-Interface definieren
- Wie `using` und `await using` Ressourcen automatisch aufraeumen — auch bei Exceptions
- Wie `DisposableStack` mehrere Ressourcen koordiniert und was das mit Angular's `DestroyRef` gemein hat

---

## Die Geschichte: Von C++ RAII bis zum vergessenen `cleanup()`

Es ist 2019. Ein erfahrener Backend-Entwickler deployed eine Node.js-Anwendung.
Nach 48 Stunden Laufzeit: der Server faellt aus. Die Ursache? Ein Datenbankverbindungs-
Pool mit 1.000 offenen Connections — alle haengen, keine wird geschlossen. Der Code
sah harmlos aus:

```typescript
async function processUserRequest(userId: string) {
  const conn = await db.connect();
  const user = await conn.query(`SELECT * FROM users WHERE id = '${userId}'`);
  if (!user) {
    return null;       // ← conn.close() vergessen!
  }
  const result = await transformUser(user);
  conn.close();        // ← Wird nur erreicht wenn kein Early Return
  return result;
}
```

**Ressourcen werden geoeffnet, aber das Schliessen haengt davon ab, dass der
Entwickler jeden Kontrollfluss-Pfad kennt und bedenkt.** Der klassische Workaround:
`try/finally` — korrekt, aber bei mehreren Ressourcen ein Nesting-Albtraum.

> 📖 **Hintergrund: RAII — Das Prinzip das C++ richtig gemacht hat**
>
> 1984 beschrieb Bjarne Stroustrup das RAII-Prinzip (Resource Acquisition Is
> Initialization): Ressourcen werden beim Erstellen eines Objekts erworben und
> automatisch freigegeben, wenn das Objekt seinen Scope verlaesst — egal ob
> durch normalen Ablauf, Early Return oder Exception.
>
> Java hat `try-with-resources` (seit 2011), Python den `with`-Statement.
> JavaScript hatte lange nichts Vergleichbares. Im Oktober 2023 lieferte
> TypeScript 5.2 die Antwort: das `using`-Keyword, als Implementierung des
> TC39 Proposals "Explicit Resource Management" (Stage 4, seit 2023 Teil
> des ECMAScript-Standards).

---

## `Symbol.dispose` und das `Disposable`-Interface

Das Fundament des Systems: zwei neue Well-Known Symbols und zwei Interfaces,
die TypeScript in `lib.esnext.d.ts` definiert.

```typescript annotated
// Die beiden neuen Interfaces (direkt aus TypeScript's lib):
interface Disposable {
  [Symbol.dispose](): void;
  // ^ Synchrones Cleanup — wird aufgerufen wenn 'using'-Block endet
}

interface AsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
  // ^ Asynchrones Cleanup — wird mit 'await using' aufgerufen
}
```

> 💭 **Denkfrage:** Warum sind `Symbol.dispose` und `Symbol.asyncDispose`
> **Symbols** und nicht einfach Strings wie `"dispose"` oder `"close"`?
>
> **Antwort:** Symbols sind garantiert eindeutig — kein Namenskonflikt
> mit existierenden Methoden. Eine Klasse koennte bereits eine `dispose()`-
> Methode haben die etwas anderes tut. `Symbol.dispose` ist eine globale,
> eindeutige Kennung. Eine Klasse kann `close()`, `destroy()` und
> `[Symbol.dispose]()` gleichzeitig haben, ohne Konflikte — das erlaubt
> rueckwaertskompatibles Nachruesten bestehender APIs.

---

## Das `using`-Keyword: Automatisches Cleanup

`using` verhaelt sich wie `const` — mit einem entscheidenden Unterschied:
am Ende des Blocks wird `[Symbol.dispose]()` automatisch aufgerufen,
**auch wenn eine Exception geworfen wurde**.

```typescript annotated
function getDbConnection(): Disposable & { query(sql: string): QueryResult } {
  const conn = db.connect();
  return {
    query: (sql) => conn.execute(sql),
    [Symbol.dispose]() {
      conn.close();
      // ^ Wird AUTOMATISCH aufgerufen wenn der 'using'-Block endet —
      //   egal ob durch normalen Ablauf, Early Return oder Exception!
    }
  };
}

function processData(userId: string): QueryResult | null {
  using conn = getDbConnection();
  // ^ 'using' statt 'const' — das ist der einzige Unterschied im Aufruf!

  const user = conn.query(`SELECT * FROM users WHERE id = '${userId}'`);
  if (!user) {
    return null;
    // ^ Early Return — conn[Symbol.dispose]() wird TROTZDEM aufgerufen!
  }
  return conn.query(`SELECT * FROM orders WHERE user_id = '${userId}'`);
  // ^ Nach diesem return: conn[Symbol.dispose]() schliesst die Verbindung.
}
```

> 🧠 **Erklaere dir selbst:** Was passiert, wenn innerhalb des `using`-Blocks
> eine Exception geworfen wird? Wird `[Symbol.dispose]()` trotzdem aufgerufen?
> Und was passiert, wenn `[Symbol.dispose]()` selbst eine Exception wirft?
>
> **Kernpunkte:** `[Symbol.dispose]()` wird immer aufgerufen — auch bei
> Exceptions | Wenn sowohl der Block als auch `dispose()` eine Exception werfen,
> wird die Block-Exception mit der dispose-Exception als `SuppressedError`
> verknuepft | Analoges Verhalten zu Java's `try-with-resources`

---

## `await using`: Asynchrones Cleanup

Fuer Ressourcen die async geschlossen werden muessen — z.B. Datenbanktransaktionen
mit `COMMIT`/`ROLLBACK` — gibt es `await using`:

```typescript annotated
class DatabaseTransaction implements AsyncDisposable {
  private committed = false;
  constructor(private conn: Connection) {}

  async query(sql: string): Promise<QueryResult> { return this.conn.execute(sql); }

  async commit(): Promise<void> {
    await this.conn.execute('COMMIT');
    this.committed = true;
  }

  async [Symbol.asyncDispose](): Promise<void> {
    // ^ AsyncDisposable-Interface: gibt Promise<void> zurueck
    if (!this.committed) {
      await this.conn.execute('ROLLBACK');
      // ^ Automatischer Rollback wenn commit() nicht aufgerufen wurde!
    }
    await this.conn.close();
  }
}

async function transferMoney(fromId: string, toId: string, amount: number) {
  await using tx = new DatabaseTransaction(await db.connect());
  // ^ 'await using' — weil [Symbol.asyncDispose] async ist

  await tx.query(`UPDATE accounts SET balance = balance - ${amount} WHERE id = '${fromId}'`);
  await tx.query(`UPDATE accounts SET balance = balance + ${amount} WHERE id = '${toId}'`);
  await tx.commit();
  // ^ Nur wenn commit() aufgerufen wird, kein ROLLBACK.
  // ^ Exception vor commit()? → tx[Symbol.asyncDispose]() macht ROLLBACK + close().
  //   Atomare Transaktion ohne try/finally!
}
```

> 🔬 **Experiment: `using` mit einem Timer**
>
> ```typescript
> // tsconfig.json: "lib": ["ES2022", "ESNext"]
>
> function createTimer(label: string): Disposable {
>   const start = Date.now();
>   console.log(`[${label}] gestartet`);
>   return {
>     [Symbol.dispose]() {
>       console.log(`[${label}] gestoppt: ${Date.now() - start}ms`);
>     }
>   };
> }
>
> function doWork() {
>   using _t = createTimer('doWork');
>   // ... irgendeine Arbeit ...
>   // "[doWork] gestoppt: Xms" erscheint automatisch am Block-Ende
> }
> ```
>
> Aendere `using` zu `const` — der gestoppt-Log erscheint nie mehr.
> Wirf absichtlich eine Exception: mit `using` wird der Timer trotzdem gestoppt.

---

## `DisposableStack`: Mehrere Ressourcen koordinieren

`DisposableStack` registriert mehrere Ressourcen dynamisch und disposed sie
in **LIFO-Reihenfolge** (Last In, First Out) — genau wie C++-Destruktoren:

```typescript annotated
function setupTestEnvironment() {
  using stack = new DisposableStack();
  // ^ DisposableStack implementiert selbst Disposable!

  const db     = stack.use(openDatabase());
  // ^ stack.use() gibt die Ressource zurueck — und merkt sie fuer cleanup.
  const cache  = stack.use(openCache());
  const logger = stack.use(openLogger());
  // ^ LIFO: logger → cache → db — Abhaengigkeiten respektiert!

  stack.defer(() => console.log('cleanup done'));
  // ^ defer() fuer Logik ohne eigenes Objekt

  return stack.move();
  // ^ Eigentuemer-Verantwortung an Aufrufer: stack ist leer,
  //   Aufrufer disposed den returned stack.
}

function runTest() {
  using env = setupTestEnvironment();
  env.db.query('INSERT INTO ...');
  // Am Ende: logger, cache, db automatisch disposed — kein try/finally!
}
```

---

## Angular-Bezug: `DestroyRef` und das `Disposable`-Muster

In deinem Angular-Alltag kennst du das Problem: Subscriptions die nicht
unsubscribed werden, Event Listener die haengen bleiben.
Angular 16+ `DestroyRef` loest genau dasselbe wie `Symbol.dispose` — auf Component-Ebene:

```typescript annotated
// Angular 16+: DestroyRef ist Angulars "Disposable"-Protokoll
@Injectable()
export class DataService {
  private destroyRef = inject(DestroyRef);

  startPolling(interval: number): void {
    const id = setInterval(() => this.fetchData(), interval);
    this.destroyRef.onDestroy(() => clearInterval(id));
    // ^ Wird aufgerufen wenn der Injection Context destroyed wird —
    //   genau wie Symbol.dispose beim Verlassen des Blocks!
  }
}

// 'using' fuer kurzlebige Ressourcen innerhalb einer Methode:
function makeListenerDisposable(
  target: EventTarget, event: string, handler: EventListener
): Disposable {
  target.addEventListener(event, handler);
  return {
    [Symbol.dispose]() { target.removeEventListener(event, handler); }
    // ^ Dasselbe Prinzip wie destroyRef.onDestroy() — nur ohne Angular DI
  };
}
```

> ⚡ **Praxis-Tipp: Wo `using` in Angular sinnvoll ist**
>
> `using` und Angular's `DestroyRef` loesen dasselbe Problem auf verschiedenen
> Ebenen. `DestroyRef.onDestroy()` ist fuer den Component-/Service-Lifecycle.
> `using` ergaenzt das fuer **kurzlebige Ressourcen innerhalb einer Methode**:
> Datenbankverbindungen in einem Angular Service (SSR), temporaere Event Listener
> in Unit-Tests (Jest/Jasmine), oder File Handles im Angular Universal-Kontext.
> Mittelfristig koennte `ngOnDestroy` direkt `[Symbol.asyncDispose]()` werden.

---

## Voraussetzungen und Einschraenkungen

`using` braucht TypeScript 5.2+ und die passende `tsconfig.json`:

```typescript
// tsconfig.json:
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "ESNext"]   // ESNext fuer Symbol.dispose
  }
}
```

Wichtige Grenzen: `using` funktioniert nur auf Block-Ebene (nicht als Klassen-
Property). In engen Schleifen erzeugt jede Iteration eine neue Ressource —
dort ist `DisposableStack` ausserhalb der Schleife oft besser. Als Ersatz
fuer Angulars Dependency Injection taugt `using` nicht — DI hat seinen eigenen
Lifecycle der tiefer in das Framework integriert ist.

---

## Was du gelernt hast

- `using` ist TypeScript 5.2's Implementierung von TC39 Explicit Resource Management — automatisches Cleanup am Block-Ende, auch bei Exceptions
- `Symbol.dispose` definiert synchrones Cleanup, `Symbol.asyncDispose` asynchrones — als `Disposable`- und `AsyncDisposable`-Interfaces
- `await using` ist das async-Aequivalent: `[Symbol.asyncDispose]()` wird mit `await` aufgerufen
- `DisposableStack` koordiniert mehrere Ressourcen in LIFO-Reihenfolge — `stack.use()`, `stack.defer()`, `stack.move()` sind die zentralen Methoden
- Angular's `DestroyRef.onDestroy()` loest konzeptuell dasselbe Problem wie `Symbol.dispose` — auf Component-/Service-Ebene statt Block-Ebene

**Kernkonzept zum Merken:** `using conn = getDbConnection()` ist eine Garantie, keine Bitte. Egal was im Block passiert — Exception, Early Return, normaler Ablauf — `conn[Symbol.dispose]()` wird aufgerufen. Das ist RAII fuer TypeScript.

---

> **Pausenpunkt** — Du hast Lektion 31 vollstaendig abgeschlossen! Von
> `Promise<T>`-Typen ueber `async/await`-Inferenz und `AsyncGenerator`
> bis hin zu Explicit Resource Management — du hast das gesamte Spektrum
> von TypeScript's asynchronem Typsystem durchgearbeitet.
>
> **Naechste Lektion:** [L32: Type-safe APIs](../32-type-safe-apis/sections/01-rest-api-typing.md)
