# Sektion 2: async/await und Typinferenz

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Promise-Typen](./01-promises-typen.md)
> Naechste Sektion: [03 - Error Handling in Async](./03-error-handling-async.md)

---

## Was du hier lernst

- Wie TypeScript den Rueckgabetyp von `async`-Funktionen automatisch inferiert
- Warum `async` IMMER `Promise<T>` zurueckgibt — auch wenn du `T` direkt returnst
- Wie Typinferenz durch `.then()`-Ketten fliesst und wo sie bricht
- Die Unterschiede zwischen expliziter Annotation und Inferenz bei Async-Code

---

## async-Funktionen: Automatisches Promise-Wrapping

Jede `async`-Funktion gibt automatisch ein `Promise<T>` zurueck. TypeScript
inferiert `T` aus dem `return`-Statement:

```typescript annotated
async function getUser(id: string) {
  // ^ Inferierter Rueckgabetyp: Promise<User>
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  // ^ data: any — json() gibt Promise<any> zurueck!
  return data as User;
  // ^ Durch 'as User' wird der Rueckgabetyp Promise<User>
}

async function getCount(): Promise<number> {
  // ^ Explizite Annotation — oft besser fuer oeffentliche APIs
  return 42;
  // ^ TypeScript wrappt 42 automatisch in Promise.resolve(42)
  // Du returnst number, aber der Typ ist Promise<number>
}
```

> 📖 **Hintergrund: Warum async immer Promise zurueckgibt**
>
> Das ist kein TypeScript-Feature, sondern JavaScript-Spezifikation (ES2017).
> Wenn du `async function f() { return 42; }` schreibst, gibt `f()`
> ein `Promise<number>` zurueck — nicht `42` direkt. Das liegt daran,
> dass der JavaScript-Engine den Rueckgabewert automatisch in
> `Promise.resolve()` wrappt. TypeScript bildet dieses Verhalten exakt
> im Typsystem ab.

---

## await und Typ-Unwrapping

`await` entpackt ein `Promise<T>` zu `T`. TypeScript nutzt intern
`Awaited<T>` fuer diese Operation:

```typescript annotated
async function demo() {
  const p: Promise<string> = Promise.resolve("hello");
  const result = await p;
  // ^ result: string — await entpackt Promise<string> zu string

  const nested: Promise<Promise<number>> = Promise.resolve(Promise.resolve(42));
  const value = await nested;
  // ^ value: number — await entpackt REKURSIV (nicht Promise<number>!)

  const plain = await 42;
  // ^ plain: number — await auf Nicht-Promise ist ein No-Op im Typ
  // (JavaScript wartet trotzdem einen Microtask ab)
}
```

### Die Inferenz-Kette bei async/await

TypeScript verfolgt Typen durch die gesamte Async-Kette:

```typescript annotated
interface User { name: string; age: number }
interface Post { title: string; authorId: string }

async function getUserPosts(userId: string): Promise<Post[]> {
  const user = await fetchUser(userId);
  // ^ user: User — await entpackt Promise<User>

  const posts = await fetchPostsByAuthor(user.name);
  // ^ posts: Post[] — Typ fliesst von user.name (string) weiter

  return posts;
  // ^ TypeScript prueft: Post[] ist kompatibel mit Promise<Post[]> ✓
}

async function fetchUser(id: string): Promise<User> {
  return { name: "Max", age: 30 };
  // ^ TypeScript wrappt das Objekt-Literal automatisch
}

async function fetchPostsByAuthor(name: string): Promise<Post[]> {
  return [{ title: "Hello", authorId: "1" }];
}
```

> 💭 **Denkfrage:** Wenn eine async-Funktion nie `await` verwendet,
> ist sie dann trotzdem async? Was ist der Typ-Unterschied?
>
> **Antwort:** Ja, sie ist trotzdem async — der Rueckgabetyp ist
> immer `Promise<T>`. Aber: Ohne `await` kann die Funktion
> synchron als normale Funktion geschrieben werden. Der TypeScript-
> Compiler warnt nicht, aber ESLint hat die Regel
> `require-await` die das erkennt. In der Praxis: Wenn du kein
> `await` brauchst, mach die Funktion nicht `async`.

---

## Explizite Annotation vs Inferenz

Bei Async-Funktionen gibt es eine wichtige Entscheidung:

```typescript
// Option A: Inferenz (TypeScript leitet ab)
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // Rueckgabetyp: Promise<any> — GEFAEHRLICH!
}

// Option B: Explizite Annotation (du sagst TypeScript was du erwartest)
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // TypeScript prueft: any ist zu User zuweisbar ✓
  // ABER: Das ist ein "Trust me, Compiler" — keine Runtime-Pruefung!
}
```

### Wann explizit annotieren?

Die Regel ist einfach:

```typescript annotated
// ✅ Explizit annotieren bei:
// 1. Oeffentliche API-Grenzen (exportierte Funktionen)
export async function getUser(id: string): Promise<User> {
  // ^ Dokumentation + Vertrag fuer andere Module
  return fetchAndParse(id);
}

// 2. Wenn Inferenz 'any' ergeben wuerde
async function parseResponse(): Promise<Config> {
  // ^ Ohne Annotation waere der Typ Promise<any>
  const data = await response.json();
  return data;
}

// ✅ Inferenz nutzen bei:
// 3. Internen Hilfsfunktionen
async function enrichUser(user: User) {
  // ^ Promise<EnrichedUser> wird korrekt inferiert
  const posts = await fetchPostsByUser(user.id);
  return { ...user, posts };
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `response.json()` so gefaehrlich
> fuer die Typinferenz? Was macht `json()` anders als andere Methoden?
>
> **Kernpunkte:** json() gibt Promise<any> zurueck | any ist "ansteckend" —
> alles was von any abgeleitet wird, ist auch any | Explizite Annotation
> oder as-Cast noetig | Besser: Runtime-Validierung (z.B. mit Zod)

---

## Typinferenz in .then()-Ketten

Auch ohne `async/await` verfolgt TypeScript Typen durch `.then()`:

```typescript annotated
fetch("/api/users")
  .then(response => response.json())
  // ^ response: Response — korrekt inferiert
  // ^ return: Promise<any> — json() ist any!
  .then((data: User[]) => data.filter(u => u.age > 18))
  // ^ Explizite Annotation noetig wegen 'any' aus json()
  // ^ return: User[] — filter gibt User[] zurueck
  .then(adults => adults.map(u => u.name))
  // ^ adults: User[] — korrekt inferiert aus vorherigem .then()
  // ^ return: string[] — map(u => u.name) ergibt string[]
  .then(names => console.log(names));
  // ^ names: string[] — Typ fliesst korrekt durch
```

> ⚡ **Praxis-Tipp fuer Angular:** In Angular verwendest du RxJS statt
> Promise-Chains. Aber die Typinferenz funktioniert aehnlich:
>
> ```typescript
> // Angular Observable-Chain — Typen fliessen genauso durch:
> this.http.get<User[]>('/api/users').pipe(
>   map(users => users.filter(u => u.age > 18)),
>   // ^ users: User[] — vom Typ-Parameter inferiert
>   map(adults => adults.map(u => u.name)),
>   // ^ adults: User[] — korrekt durch die Pipe
> ).subscribe(names => {
>   // ^ names: string[] — bis zum subscribe korrekt
> });
> ```

---

## Haeufige Fehler bei Async-Typinferenz

```typescript
// Fehler 1: Vergessenes await
async function bad1() {
  const user = getUser("1"); // VERGESSENES await!
  // ^ user: Promise<User> — NICHT User!
  console.log(user.name); // FEHLER: Property 'name' does not exist on Promise
}

// Fehler 2: Async in Array-Methoden
async function bad2(ids: string[]) {
  const users = ids.map(async id => await getUser(id));
  // ^ users: Promise<User>[] — Array von Promises, NICHT User[]!
  // Loesung:
  const users2 = await Promise.all(ids.map(id => getUser(id)));
  // ^ users2: User[] — jetzt korrekt!
}

// Fehler 3: forEach mit async (Fire-and-Forget!)
async function bad3(ids: string[]) {
  ids.forEach(async id => {
    await deleteUser(id);
    // Diese Promises werden NICHT gesammelt!
    // Die Funktion kehrt zurueck BEVOR alle Deletes fertig sind.
  });
  // Loesung: for...of oder Promise.all
  for (const id of ids) {
    await deleteUser(id);
  }
}
```

> 🔬 **Experiment:** Schreibe eine Funktion die ein Array von URLs
> parallel fetcht und die Ergebnisse zurueckgibt. Beobachte die Typen:
>
> ```typescript
> async function fetchAll(urls: string[]): Promise<string[]> {
>   // Variante 1: Promise.all mit map
>   return Promise.all(urls.map(url =>
>     fetch(url).then(r => r.text())
>   ));
>   // Welcher Typ hat der Ausdruck INNERHALB von Promise.all?
>   // Antwort: Promise<string>[] — ein Array von Promises
>   // Promise.all konvertiert das zu Promise<string[]>
> }
> ```

---

## Was du gelernt hast

- `async` wrappt den Rueckgabetyp IMMER in `Promise<T>` — auch bei direktem `return`
- `await` entpackt Promises rekursiv — verschachtelte Promises werden korrekt aufgeloest
- `response.json()` gibt `Promise<any>` zurueck — explizite Annotation oder Validierung noetig
- Array-Methoden mit async (map, forEach) brauchen `Promise.all()` zum korrekten Sammeln
- Explizite Rueckgabetypen an API-Grenzen, Inferenz bei internen Funktionen

**Kernkonzept zum Merken:** Die groesste Falle bei Async-Inferenz ist `any` — es schleicht sich durch `json()`, `JSON.parse()` und andere untypisierte Quellen ein. Explizite Annotationen an den richtigen Stellen sind dein Schutz.

---

> **Pausenpunkt** — Du verstehst jetzt, wie TypeScript Async-Typen inferiert.
> Die naechste Sektion behandelt die groesste Schwaeche: Error Handling.
>
> Weiter geht es mit: [Sektion 03: Error Handling in Async](./03-error-handling-async.md)
