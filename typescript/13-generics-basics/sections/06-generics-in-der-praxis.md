# Sektion 6: Generics in der Praxis

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Default-Typparameter](./05-default-typparameter.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie React `useState<T>` Generics nutzt
- Wie Angular `HttpClient.get<T>()` Generics nutzt
- Warum `Promise<T>` generisch sein muss
- `Map<K, V>`, `Set<T>` und die Standardbibliothek
- Eigene generische Utility-Funktionen schreiben

---

## React: useState\<T\>

React's wichtigster Hook ist generisch:

```typescript annotated
// React-Definition (vereinfacht):
function useState<T>(initialState: T): [T, (newState: T) => void];

// Verwendung — TypeScript inferiert T:
const [count, setCount] = useState(0);
// ^ T = number (inferiert aus 0)
// count: number, setCount: (newState: number) => void

const [name, setName] = useState("Max");
// ^ T = string (inferiert aus "Max")

// Explizit wenn noetig (z.B. bei null als Anfangswert):
const [user, setUser] = useState<{ name: string; age: number } | null>(null);
// ^ T = { name: string; age: number } | null
// Ohne <...> waere T = null — zu eng!

setUser({ name: "Max", age: 30 }); // OK
setUser(null);                       // OK
// setUser("Max");                   // Error! string ist nicht der richtige Typ
```

> **Warum Generics hier brillieren:** Ohne Generics muesste `useState`
> entweder `any` zurueckgeben (unsicher) oder es gaebe `useStringState`,
> `useNumberState`, etc. (absurd). Generics machen den einen Hook
> fuer alle Typen sicher.

---

## Angular: HttpClient.get\<T\>()

Angular's HTTP-Client nutzt Generics fuer typsichere API-Aufrufe:

```typescript annotated
// Angular HttpClient (vereinfacht):
class HttpClient {
  get<T>(url: string): Observable<T>;
  post<T>(url: string, body: unknown): Observable<T>;
  put<T>(url: string, body: unknown): Observable<T>;
  delete<T>(url: string): Observable<T>;
}

// Verwendung in einem Angular Service:
interface User {
  id: number;
  name: string;
  email: string;
}

// T muss explizit sein — TypeScript kann nicht in die API schauen:
this.http.get<User[]>('/api/users').subscribe(users => {
  // users ist User[] — volle IDE-Unterstuetzung!
  console.log(users[0].name);   // OK
  // console.log(users[0].phone); // Error! phone existiert nicht in User
});

this.http.get<User>('/api/users/1').subscribe(user => {
  console.log(user.name);   // OK
  console.log(user.email);  // OK
});
```

> **Beachte:** Bei HTTP-Aufrufen kann TypeScript den Typ nicht inferieren
> (die Daten kommen erst zur Laufzeit). Deshalb musst du `T` **explizit**
> angeben. Das ist einer der Faelle wo Inference nicht funktioniert.

---

## Promise\<T\> — Asynchrone Typsicherheit

Jedes Promise traegt den Typ seines aufgeloesten Werts:

```typescript annotated
// Promise-Definition (vereinfacht aus lib.es2015.promise.d.ts):
interface Promise<T> {
  then<U>(onFulfilled: (value: T) => U | Promise<U>): Promise<U>;
  catch(onRejected: (reason: any) => void): Promise<T>;
}

// Verwendung:
async function fetchUser(id: number): Promise<{ name: string; age: number }> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

const user = await fetchUser(1);
// ^ Typ: { name: string; age: number }

// Promise-Chaining behaelt die Typen:
const namePromise: Promise<string> = fetchUser(1).then(user => user.name);
// ^ then transformiert Promise<User> zu Promise<string>
```

Die `then`-Methode ist selbst generisch: `then<U>` nimmt eine Funktion
die von `T` nach `U` transformiert und gibt ein `Promise<U>` zurueck.
So bleibt die gesamte Promise-Kette typsicher.

---

## Map\<K, V\> und Set\<T\>

Die eingebauten Collections sind generisch:

```typescript annotated
// Map<K, V> — typsichere Schluessel-Wert-Paare
const userRoles = new Map<string, string[]>();
userRoles.set("Max", ["admin", "user"]);
userRoles.set("Anna", ["user"]);

const roles = userRoles.get("Max");
// ^ Typ: string[] | undefined

// Set<T> — typsichere eindeutige Werte
const activeIds = new Set<number>();
activeIds.add(1);
activeIds.add(2);
// activeIds.add("drei"); // Error! string ist nicht number

// WeakMap, WeakSet — gleich generisch
const metadata = new WeakMap<object, string>();

// ReadonlyMap, ReadonlySet — readonly-Varianten
function getConfig(): ReadonlyMap<string, string> {
  const config = new Map<string, string>();
  config.set("env", "production");
  return config;
}
// Aufrufer kann .get() aber nicht .set() verwenden
```

---

## Eigene Utility-Funktionen

Generics machen deine eigenen Funktionen wiederverwendbar:

```typescript annotated
// 1. groupBy — Elemente nach einem Schluessel gruppieren
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
// ^ Typ: Record<string, { name: string; role: string }[]>
// byRole.admin → [{ name: "Max", ... }, { name: "Bob", ... }]

// 2. deduplicate — Duplikate entfernen
function deduplicate<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 3. retry — Asynchrone Operation mit Wiederholung
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
// ^ data behaelt den Typ des Promise-Ergebnisses
```

---

## Das grosse Bild: Generics-Hierarchie

```
         Array<T>     Promise<T>     Map<K,V>     Set<T>
              \            |            /            /
               \           |           /            /
                  Standardbibliothek (lib.d.ts)
                           |
         React useState<T>   Angular HttpClient<T>
              \                      /
               \                    /
                  Framework-APIs
                           |
          groupBy<T,K>    retry<T>    Repository<T>
              \              |              /
               \             |             /
                  Dein eigener Code
```

Generics durchziehen **jede Ebene**. Von den eingebauten Typen ueber
Framework-APIs bis zu deinem eigenen Code. Deshalb sind sie das Herzstuck.

---

## Zusammenfassung: Wann welches Pattern

| Situation | Pattern | Beispiel |
|-----------|---------|----------|
| Gleicher Algorithmus, verschiedene Typen | Generische Funktion | `map<T, U>`, `filter<T>` |
| Gemeinsame Datenstruktur | Generisches Interface | `ApiResponse<T>`, `Box<T>` |
| Property-Zugriff typsicher | keyof Constraint | `getProperty<T, K extends keyof T>` |
| Mindestanforderungen | extends Constraint | `<T extends { id: number }>` |
| Haeufiger Standard-Typ | Default-Parameter | `<T = string>` |
| Framework-Integration | Explizite Typangabe | `useState<User>`, `http.get<Data>()` |

---

> 🧠 **Erklaere dir selbst:** Warum muss man bei `http.get<User>(url)`
> den Typ explizit angeben, aber bei `useState(0)` nicht?
> **Kernpunkte:** useState hat einen Wert als Argument — Inference moeglich | HTTP-Daten kommen zur Laufzeit — TypeScript kann den Typ nicht kennen | Inference braucht Compile-Zeit-Informationen

---

> **Lektion abgeschlossen!** Zurueck zur [Uebersicht](../README.md)
>
> **Naechste Schritte:**
> 1. Examples in `examples/` durcharbeiten
> 2. Exercises in `exercises/` loesen
> 3. Quiz mit `npx tsx quiz.ts` testen
> 4. Cheatsheet als Schnellreferenz behalten
