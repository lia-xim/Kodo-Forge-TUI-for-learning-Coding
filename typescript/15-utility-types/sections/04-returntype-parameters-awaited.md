# Sektion 4: ReturnType, Parameters, Awaited

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Extract, Exclude, NonNullable](./03-extract-exclude-nonnullable.md)
> Naechste Sektion: [05 - Eigene Utility Types](./05-eigene-utility-types.md)

---

## Was du hier lernst

- **ReturnType\<T\>** — den Rueckgabetyp einer Funktion extrahieren
- **Parameters\<T\>** — die Parameter-Typen als Tuple extrahieren
- **ConstructorParameters\<T\>** — Konstruktor-Parameter extrahieren
- **InstanceType\<T\>** — den Instanz-Typ einer Klasse extrahieren
- **Awaited\<T\>** — Promise-Typen rekursiv entpacken

---

## ReturnType\<T\> — Was gibt die Funktion zurueck?

> 📖 **Hintergrund: Typ-Inferenz rueckwaerts nutzen**
>
> ReturnType, Parameters und Co. nutzen ein maechtiges Feature von
> Conditional Types: das **`infer`-Keyword** (eingefuehrt in TS 2.8).
> `infer` laesst TypeScript einen Typ **aus einer Struktur herausziehen**.
> Intern sieht ReturnType so aus:
>
> ```typescript
> type ReturnType<T extends (...args: any) => any> =
>   T extends (...args: any) => infer R ? R : any;
> //                            ^^^^^^^ "Wenn T eine Funktion ist,
> //                                      nenne den Rueckgabetyp R
> //                                      und gib R zurueck"
> ```
>
> Das `infer`-Keyword ist wie eine Variable in einem Pattern-Match:
> TypeScript setzt den passenden Typ ein und gibt ihn dir zurueck.

`ReturnType<T>` extrahiert den Rueckgabetyp einer Funktion:

```typescript annotated
function createUser(name: string, email: string) {
  return { id: Math.random(), name, email, createdAt: new Date() };
}

// Statt den Rueckgabetyp manuell zu definieren:
type User = ReturnType<typeof createUser>;
// ^ { id: number; name: string; email: string; createdAt: Date }
```

### Warum typeof noetig ist

```typescript annotated
// ReturnType erwartet einen FUNKTIONS-TYP, nicht den Funktionsnamen:
type Result = ReturnType<typeof createUser>;  // OK — typeof gibt den Typ
// type Wrong = ReturnType<createUser>;       // Error! createUser ist ein Wert

// Bei Typ-Definitionen direkt:
type Formatter = (input: string) => { formatted: string; length: number };
type FormatterResult = ReturnType<Formatter>;
// ^ { formatted: string; length: number }
// Kein typeof noetig — Formatter IST bereits ein Typ
```

> 🧠 **Erklaere dir selbst:** Warum ist es besser, den Rueckgabetyp mit `ReturnType<typeof fn>` abzuleiten statt ihn manuell zu definieren?
> **Kernpunkte:** Single Source of Truth | Aendert sich die Funktion, aendert sich der Typ automatisch | Kein Risiko dass Typ und Implementierung auseinanderlaufen | Weniger Code zu pflegen

### Praktischer Einsatz: API-Response-Typen ableiten

```typescript annotated
// Die API-Funktionen definieren implizit ihre Rueckgabetypen:
function fetchUsers() {
  return [
    { id: 1, name: "Anna", role: "admin" as const },
    { id: 2, name: "Ben", role: "user" as const },
  ];
}

function fetchProduct(id: number) {
  return { id, name: "Widget", price: 9.99, inStock: true };
}

// Typen ableiten statt manuell definieren:
type UsersResponse = ReturnType<typeof fetchUsers>;
// ^ { id: number; name: string; role: "admin" | "user" }[]

type ProductResponse = ReturnType<typeof fetchProduct>;
// ^ { id: number; name: string; price: number; inStock: boolean }
```

---

## Parameters\<T\> — Was erwartet die Funktion?

`Parameters<T>` extrahiert die Parameter als Tuple:

```typescript annotated
function sendEmail(to: string, subject: string, body: string, urgent?: boolean) {
  console.log(`Sending to ${to}: ${subject}`);
}

type EmailParams = Parameters<typeof sendEmail>;
// ^ [to: string, subject: string, body: string, urgent?: boolean]

// Einzelne Parameter extrahieren:
type Recipient = Parameters<typeof sendEmail>[0];  // string
type Subject = Parameters<typeof sendEmail>[1];     // string
```

### Pattern: Wrapper-Funktionen mit gleichen Parametern

```typescript annotated
function originalFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, options);
}

// Wrapper mit identischen Parametern:
function loggingFetch(...args: Parameters<typeof originalFetch>): Promise<Response> {
  console.log(`Fetching: ${args[0]}`);
  return originalFetch(...args);
}
```

> 🧠 **Erklaere dir selbst:** Warum gibt Parameters ein Tuple zurueck
> und kein Object mit benannten Properties?
> **Kernpunkte:** Funktionsparameter haben eine Reihenfolge | Tuples bewahren Reihenfolge und Laenge | Optionale Parameter werden zu optionalen Tuple-Elementen | Spread-Syntax funktioniert mit Tuples

> ⚡ **Praxis-Tipp: ReturnType in Angular und React**
>
> ```typescript
> // Angular: Service-Methoden-Rueckgabetypen ableiten
> class UserService {
>   getUser(id: number) {
>     return this.http.get<{ id: number; name: string }>(`/api/users/${id}`);
>   }
> }
> type UserObservable = ReturnType<UserService['getUser']>;
> // Observable<{ id: number; name: string }>
>
> // React: Custom Hook Rueckgabetypen ableiten
> function useAuth() {
>   return { user: null as User | null, login: async () => {}, logout: () => {} };
> }
> type AuthContext = ReturnType<typeof useAuth>;
> // { user: User | null; login: () => Promise<void>; logout: () => void }
> ```

---

## ConstructorParameters\<T\> und InstanceType\<T\>

Fuer Klassen gibt es spezialisierte Varianten:

```typescript annotated
class DatabaseConnection {
  constructor(
    public host: string,
    public port: number,
    public database: string,
  ) {}

  query(sql: string) {
    return `Executing on ${this.host}: ${sql}`;
  }
}

// Konstruktor-Parameter:
type DBParams = ConstructorParameters<typeof DatabaseConnection>;
// ^ [host: string, port: number, database: string]

// Instanz-Typ:
type DBInstance = InstanceType<typeof DatabaseConnection>;
// ^ DatabaseConnection

// Praktisch fuer Factory-Functions:
function createConnection(...args: ConstructorParameters<typeof DatabaseConnection>) {
  return new DatabaseConnection(...args);
}
```

---

## Awaited\<T\> — Promises entpacken

`Awaited<T>` entpackt den inneren Typ eines Promise — auch **rekursiv**:

```typescript annotated
type A = Awaited<Promise<string>>;
// ^ string

type B = Awaited<Promise<Promise<number>>>;
// ^ number (rekursiv entpackt!)

type C = Awaited<string>;
// ^ string (kein Promise? Bleibt unveraendert)

type D = Awaited<Promise<string | number>>;
// ^ string | number
```

> **Analogie:** Awaited ist wie das Oeffnen einer Matroschka-Puppe —
> egal wie viele Schichten (`Promise<Promise<Promise<string>>>`) darin
> stecken, Awaited packt sie ALLE aus und gibt dir den innersten Wert.

### Vor Awaited: Manuelles Entpacken war muehsam

```typescript annotated
// TypeScript < 4.5: Man musste selbst entpacken
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// Problem: Verschachtelte Promises!
type Nested = UnwrapPromise<Promise<Promise<string>>>;
// ^ Promise<string> — nur EINE Ebene entpackt!

// Awaited loest das elegant:
type DeepUnwrap = Awaited<Promise<Promise<Promise<string>>>>;
// ^ string — ALLE Ebenen entpackt!
```

### Praktischer Einsatz: Async-Funktions-Rueckgabetypen

```typescript annotated
async function fetchUserData(id: number) {
  // Simuliert async API-Call
  return { id, name: "Max", lastLogin: new Date() };
}

// ReturnType gibt Promise<...> zurueck:
type AsyncResult = ReturnType<typeof fetchUserData>;
// ^ Promise<{ id: number; name: string; lastLogin: Date }>

// Awaited entpackt das Promise:
type UserData = Awaited<ReturnType<typeof fetchUserData>>;
// ^ { id: number; name: string; lastLogin: Date }
```

> 📖 **Hintergrund: Warum wurde Awaited eingefuehrt?**
>
> Vor TypeScript 4.5 (November 2021) war das Entpacken von Promises
> ein haeufiges Problem. Jeder schrieb seine eigene `UnwrapPromise`-
> Hilfsfunktion, und verschachtelte Promises waren ein Albtraum.
> Awaited standardisierte das und behandelt auch Edge Cases wie
> `PromiseLike` und thenable Objekte korrekt.
>
> Der entscheidende Impuls kam von `Promise.all()`: Dessen Rueckgabetyp
> war extrem schwer korrekt zu tippen, weil er ein Tuple von Promises
> zu einem Promise eines Tuples machen muss. Mit Awaited wurde die
> Implementierung von `Promise.all`, `Promise.race` und `Promise.allSettled`
> deutlich einfacher und korrekter.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> type Test = Awaited<Promise<Promise<Promise<string>>>>;
> // Hovere ueber Test — wie viele Schichten werden entpackt?
>
> type Manual = Promise<Promise<Promise<string>>> extends Promise<infer U> ? U : never;
> // Hovere ueber Manual — wie viele Schichten packt das manuelle Pattern aus?
> ```
> Was ist der Unterschied zwischen `Awaited` (rekursiv) und dem manuellen `infer`-Pattern (nur eine Ebene)?

---

## Kombination: ReturnType + Awaited

Das Pattern `Awaited<ReturnType<typeof fn>>` ist extrem haeufig:

```typescript annotated
// Mehrere async Funktionen:
async function getUser(id: number) {
  return { id, name: "Anna", email: "anna@example.com" };
}

async function getProducts() {
  return [
    { id: 1, name: "Widget", price: 9.99 },
    { id: 2, name: "Gadget", price: 19.99 },
  ];
}

// Die "wahren" Rueckgabetypen (ohne Promise-Wrapper):
type User = Awaited<ReturnType<typeof getUser>>;
// ^ { id: number; name: string; email: string }

type Products = Awaited<ReturnType<typeof getProducts>>;
// ^ { id: number; name: string; price: number }[]
```

> 💭 **Denkfrage:** Was passiert bei `Awaited<ReturnType<typeof Math.random>>`?
>
> **Antwort:** `ReturnType<typeof Math.random>` ist `number`. `Awaited<number>`
> ist `number`. Awaited laesst Nicht-Promises unveraendert.

---

## Was du gelernt hast

- **ReturnType\<T\>** extrahiert den Rueckgabetyp — mit `typeof` bei Funktionswerten
- **Parameters\<T\>** gibt die Parameter als Tuple — fuer Wrapper-Funktionen
- **ConstructorParameters/InstanceType** sind die Klassen-Varianten
- **Awaited\<T\>** entpackt Promises rekursiv — seit TypeScript 4.5
- **Awaited\<ReturnType\<typeof fn\>\>** ist DAS Pattern fuer async Funktionen

> 🧠 **Erklaere dir selbst:** Warum braucht man `typeof` bei `ReturnType<typeof myFunc>` aber nicht bei `ReturnType<(x: string) => number>`?
> **Kernpunkte:** typeof extrahiert den Typ aus einem Wert | myFunc ist ein Wert (Funktion) | (x: string) => number ist bereits ein Typ | Typ-Parameter erwarten Typen, nicht Werte

**Kernkonzept zum Merken:** ReturnType und Parameters extrahieren Informationen aus Funktionstypen. Awaited entpackt Promises. Zusammen bilden sie das Werkzeug fuer "Ich will den Typ, den diese Funktion zurueckgibt".

> **Experiment:** Teste im TypeScript Playground:
> ```typescript
> async function getData() { return { id: 1, name: "Max" }; }
>
> type WithPromise = ReturnType<typeof getData>;
> // ^ Promise<{ id: number; name: string }>
>
> type WithoutPromise = Awaited<ReturnType<typeof getData>>;
> // ^ { id: number; name: string }
> ```
> Das Pattern `Awaited<ReturnType<typeof fn>>` ist in realen Projekten sehr haeufig.

---

> **Pausenpunkt** — Ab der naechsten Sektion baust du eigene Utility Types!
>
> Weiter geht es mit: [Sektion 05: Eigene Utility Types](./05-eigene-utility-types.md)
