# Sektion 2: Optionale und Default-Parameter

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Funktionstypen Basics](./01-funktionstypen-basics.md)
> Naechste Sektion: [03 - Function Overloads](./03-function-overloads.md)

---

## Was du hier lernst

- Wie **optionale Parameter** (`?`) funktionieren und was sie intern bedeuten
- Warum **Default-Werte** oft besser sind als optionale Parameter
- Wie **Rest-Parameter** (`...args`) typsicher variadische Funktionen ermoeglichen
- **Destructuring** in Funktionsparametern typisieren

---

## Optionale Parameter

In JavaScript kann man jedes Argument weglassen — es wird einfach
`undefined`. TypeScript macht das **explizit**:

```typescript annotated
function greet(name: string, greeting?: string): string {
//                           ^^^^^^^^^ Das ? macht den Parameter optional
  return `${greeting ?? "Hallo"}, ${name}!`;
//              ^^  Nullish Coalescing: "Hallo" wenn greeting undefined ist
}

greet("Max");              // "Hallo, Max!"
greet("Max", "Moin");      // "Moin, Max!"
greet("Max", undefined);   // "Hallo, Max!"  — explizit undefined geht auch
```

### Was `?` intern bedeutet

```typescript
// Diese beiden Signaturen sind FAST identisch:
function a(x?: string): void {}     // x ist string | undefined
function b(x: string | undefined): void {}

// ABER: Bei a() kann man x WEGLASSEN:
a();            // OK
a(undefined);   // OK
a("hallo");     // OK

// Bei b() MUSS man x uebergeben:
b();            // Error! Erwartet 1 Argument
b(undefined);   // OK
b("hallo");     // OK
```

> 💭 **Denkfrage:** Wann wuerdest du `x?: string` und wann `x: string | undefined`
> verwenden? Denke an den Unterschied fuer den Aufrufer.
>
> **Antwort:** `x?: string` wenn der Aufrufer den Parameter komplett
> weglassen darf (Konfigurationsoptionen, optionale Features). `x: string | undefined`
> wenn der Aufrufer **bewusst entscheiden** soll, ob er undefined uebergibt —
> z.B. bei `resetField(field, value: string | undefined)` wo undefined
> "zuruecksetzen" bedeutet.

### Die Reihenfolge-Regel

```typescript
// KORREKT: Optionale Parameter kommen NACH Pflichtparametern
function format(text: string, width?: number, fill?: string): string {
  return text.padStart(width ?? 20, fill ?? " ");
}

// FALSCH: Optionale Parameter VOR Pflichtparametern
// function bad(width?: number, text: string): string { ... }
//              ^^^^^^ Error! Ein erforderlicher Parameter darf nicht
//                     nach einem optionalen stehen.
```

> 📖 **Hintergrund: Warum diese Einschraenkung?**
>
> In Sprachen wie Python kann man benannte Parameter verwenden:
> `greet(name="Max", greeting="Hallo")`. In JavaScript/TypeScript sind
> Argumente **positionsbasiert** — das dritte Argument ist immer der
> dritte Parameter. Wenn ein optionaler Parameter vor einem Pflichtparameter
> stuende, muesste man `undefined` als Platzhalter uebergeben. TypeScript
> verhindert dieses Anti-Pattern. Fuer benannte Parameter verwendet man
> stattdessen ein Options-Objekt (siehe unten).

---

## Default-Parameter

Default-Werte sind oft **besser** als optionale Parameter, weil sie
den `undefined`-Check ueberfluessig machen:

```typescript annotated
function createUser(
  name: string,
  role: string = "user",
//      ^^^^^^^^^^^^^^^ Default-Wert macht ? ueberfluessig
  active: boolean = true,
): { name: string; role: string; active: boolean } {
  return { name, role, active };
}

createUser("Max");                   // { name: "Max", role: "user", active: true }
createUser("Anna", "admin");         // { name: "Anna", role: "admin", active: true }
createUser("Bob", "editor", false);  // { name: "Bob", role: "editor", active: false }
```

**Wichtig:** Ein Parameter mit Default-Wert ist automatisch optional —
man braucht **kein** zusaetzliches `?`:

```typescript
// FALSCH: ? und Default gleichzeitig
function bad(x?: number = 42) {}
//           ^^^^^^^^^^ Error! Parameter darf nicht gleichzeitig
//                      optional und einen Initialisierer haben.

// RICHTIG: Nur Default-Wert
function good(x: number = 42) {}
```

> 🧠 **Erklaere dir selbst:** Warum kann ein Parameter nicht gleichzeitig `?` und einen Default-Wert haben? Was wuerde das bedeuten, und warum ist es redundant?
> **Kernpunkte:** ? bedeutet "kann undefined sein" | Default ersetzt undefined automatisch | Beides zusammen ist widersprüchlich | Default allein reicht

---

## Rest-Parameter

Fuer Funktionen mit **beliebig vielen Argumenten**:

```typescript annotated
function sum(...numbers: number[]): number {
//          ^^^^^^^^^^^ Rest-Parameter: sammelt alle Argumente in ein Array
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20);         // 30
sum();               // 0  — leeres Array ist OK
```

### Rest-Parameter mit fuehrenden Parametern

```typescript annotated
function log(level: "info" | "warn" | "error", ...messages: string[]): void {
//           ^^^^^ Erster Parameter ist Pflicht  ^^^^^^^^^^^^^^^^^^^
//                                               Rest-Parameter sammelt den Rest
  const prefix = `[${level.toUpperCase()}]`;
  console.log(prefix, ...messages);
}

log("info", "Server gestartet", "Port: 3000");
// [INFO] Server gestartet Port: 3000
```

### Rest-Parameter als Tuple

```typescript annotated
function move(
  ...args: [x: number, y: number] | [x: number, y: number, z: number]
//          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//          Tuple-Typ: Genau 2 oder 3 Zahlen erlaubt
): void {
  const [x, y, z] = args;
  console.log(`Move to (${x}, ${y}${z !== undefined ? `, ${z}` : ""})`);
}

move(10, 20);      // "Move to (10, 20)"
move(10, 20, 30);  // "Move to (10, 20, 30)"
// move(10);       // Error! Braucht 2 oder 3 Argumente
```

> 🔍 **Tieferes Wissen: `arguments` vs Rest-Parameter**
>
> In altem JavaScript gab es das `arguments`-Objekt — ein Array-aehnliches
> Objekt mit allen Argumenten. Es war **nicht typisierbar** und hatte
> keine echten Array-Methoden. Rest-Parameter (`...args`) sind der
> moderne Ersatz: typsicher, ein echtes Array, und im Typ sichtbar.
> TypeScript hat `arguments` nie richtig unterstuetzt — verwende
> **immer** Rest-Parameter.

---

## Destructuring in Parametern

Objekt-Destructuring in Funktionsparametern ist in TypeScript etwas
**ungewoehnlich** zu tippen:

```typescript annotated
// FALSCH — das sieht wie Umbenennung aus, ist aber ein Typ-Fehler:
// function greet({ name: string, age: number }) { ... }
//                       ^^^^^^ "string" wuerde als ALIAS fuer name interpretiert

// RICHTIG — Typ kommt NACH dem Destructuring-Pattern:
function greet({ name, age }: { name: string; age: number }): string {
//             ^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//             Destructuring   Typ des gesamten Objekts
  return `${name} ist ${age} Jahre alt`;
}

greet({ name: "Max", age: 30 }); // "Max ist 30 Jahre alt"
```

### Besser: Mit Interface oder Type-Alias

```typescript annotated
interface UserInfo {
  name: string;
  age: number;
  email?: string;  // optionale Property
}

function greet({ name, age, email }: UserInfo): string {
//             ^^^^^^^^^^^^^^^^^^^^^^ Viel lesbarer mit benanntem Typ!
  let msg = `${name} ist ${age} Jahre alt`;
  if (email) {
    msg += ` (${email})`;
  }
  return msg;
}
```

### Das Options-Objekt-Pattern

Das wichtigste Pattern fuer Funktionen mit vielen optionalen Parametern:

```typescript annotated
interface FetchOptions {
  url: string;               // Pflicht
  method?: "GET" | "POST";   // Optional, Default: "GET"
  timeout?: number;          // Optional, Default: 5000
  headers?: Record<string, string>;  // Optional
}

function fetchData({
  url,
  method = "GET",
  timeout = 5000,
  headers = {},
}: FetchOptions): void {
  console.log(`${method} ${url} (timeout: ${timeout}ms)`);
  console.log("Headers:", headers);
}

// Nur Pflichtfeld angeben — alles andere hat Defaults:
fetchData({ url: "https://api.example.com/users" });

// Einige Optionen ueberschreiben:
fetchData({ url: "https://api.example.com/users", method: "POST", timeout: 10000 });
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> interface FetchOptions {
>   url: string;
>   method?: "GET" | "POST";
>   timeout?: number;
> }
>
> function fetchData({
>   url,
>   method = "GET",  // <-- entferne diesen Default-Wert
>   timeout = 5000,
> }: FetchOptions): void {
>   console.log(`${method.toUpperCase()} ${url}`);
>   //              ^^^^^^ Was passiert hier wenn kein Default?
> }
> ```
>
> Ohne den Default-Wert ist `method` innerhalb der Funktion vom Typ
> `"GET" | "POST" | undefined`. TypeScript erzwingt jetzt einen
> `undefined`-Check bevor du `.toUpperCase()` aufrufen kannst —
> der Compiler faengt den potenziellen Laufzeit-Fehler ab.

---

**In deinem Angular-Projekt:** Das Options-Objekt-Pattern ist das Standard-Pattern
fuer Angular-Services und Konfiguration. Ein typischer Angular HTTP-Aufruf sieht
fast genauso aus:

```typescript
// Angular HttpClient nutzt intern dasselbe Muster
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ApiOptions {
  headers?: HttpHeaders;
  params?: Record<string, string>;
  reportProgress?: boolean;
}

// In deinem Service:
getUserData(id: number, options: ApiOptions = {}): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`, options);
}

// Aufrufer gibt nur an was er braucht:
this.getUserData(42, { reportProgress: true });
this.getUserData(42);  // headers und params haben Defaults
```

Rest-Parameter begegnen dir in Angular beim Logging-Service oder wenn du
mehrere Argumente an `console.log` weiterleitest: `logger.log("DB", "query", sql)`.

---

## Was du gelernt hast

- **Optionale Parameter** (`?`) fuegen `undefined` zum Typ hinzu und machen das Argument weglassbar
- **Default-Werte** sind oft besser als `?`, weil sie `undefined` automatisch ersetzen
- **Rest-Parameter** (`...args`) ersetzen das unsichere `arguments`-Objekt
- **Destructuring** in Parametern braucht den Typ NACH dem Pattern: `{ name }: { name: string }`
- Das **Options-Objekt-Pattern** ist ideal fuer Funktionen mit vielen optionalen Parametern

> 🧠 **Erklaere dir selbst:** Warum ist `function greet({ name: string })` ein Fehler? Was denkt TypeScript, dass `string` hier bedeutet, und wie schreibt man es richtig?
> **Kernpunkte:** TypeScript sieht string als Alias/Umbenennung (Destructuring-Rename) | Nicht als Typ-Annotation | Richtig: { name }: { name: string } | Typ kommt nach dem gesamten Pattern

**Kernkonzept zum Merken:** Default-Werte > Optionale Parameter > Union mit undefined. Waehle immer die praeziseste Variante.

---

> **Pausenpunkt** — Du beherrschst jetzt die wichtigsten Parameter-Varianten.
> Als Naechstes wird es fortgeschritten: Function Overloads.
>
> Weiter geht es mit: [Sektion 03: Function Overloads](./03-function-overloads.md)
