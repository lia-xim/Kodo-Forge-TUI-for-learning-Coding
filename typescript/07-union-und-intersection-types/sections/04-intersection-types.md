# Sektion 4: Intersection Types — alles gleichzeitig

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Discriminated Unions](./03-discriminated-unions.md)
> Naechste Sektion: [05 - Union vs Intersection](./05-union-vs-intersection.md)

---

## Was du hier lernst

- Was der `&` Operator bedeutet und wie Intersection Types funktionieren
- Wie du **Objekt-Typen kombinierst** (Mixins, Capabilities)
- Was passiert bei **Konflikten** (spoiler: manchmal `never`)
- Der Unterschied zwischen `extends` und `&`

---

## Das Konzept: "Alles gleichzeitig"

Waehrend Union Types "entweder A oder B" bedeuten, bedeuten
Intersection Types "sowohl A als auch B":

```typescript annotated
interface HasName {
  name: string;
}
interface HasAge {
  age: number;
}

type Person = HasName & HasAge;
//            ^^^^^^^^^^^^^^^^
//            Intersection: MUSS beides haben
//            name (von HasName) UND age (von HasAge)

const alice: Person = {
  name: "Alice",   // von HasName
  age: 30,         // von HasAge
};

// Fehlt eines der Felder, gibt es einen Error:
// const bob: Person = { name: "Bob" };
// Error! Property 'age' is missing
```

> 📖 **Hintergrund: Intersection in der Mengenlehre**
>
> Der Name "Intersection" (Schnittmenge) kommt aus der Mengenlehre.
> Aber **Achtung** — die Intuition kann truegen!
>
> Bei **Werte-Mengen** ist die Schnittmenge KLEINER (weniger Werte
> erfuellen die Bedingung). Bei **Eigenschafts-Mengen** ist das Ergebnis
> GROESSER (mehr Properties). Das klingt widerspruchlich, aber:
>
> - `HasName` = Menge aller Objekte mit `name`
> - `HasAge` = Menge aller Objekte mit `age`
> - `HasName & HasAge` = Menge aller Objekte mit `name` UND `age`
>
> Weniger Objekte erfuellen diese Bedingung, aber jedes Objekt hat
> MEHR Properties. Die Menge wird kleiner, der Typ wird "reicher".

---

## Objekte kombinieren

Das haeufigste Einsatzgebiet: **Mehrere Interfaces zu einem Typ
zusammenfuegen**:

```typescript annotated
// ─── Basis-Interfaces ─────────────────────────────
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

interface HasId {
  id: string;
}

// ─── Kombination mit & ────────────────────────────
type DatabaseEntity = HasId & Timestamped & SoftDeletable;
// Hat ALLE Properties von allen drei Interfaces:
// id, createdAt, updatedAt, deletedAt, isDeleted

const user: DatabaseEntity = {
  id: "usr-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  isDeleted: false,
};
```

### Praxisbeispiel: API-Request erweitern

```typescript annotated
interface BaseRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}

interface Authenticated {
  headers: { authorization: string };
}

interface WithBody {
  body: Record<string, unknown>;
}

// Verschiedene Request-Typen durch Kombination:
type GetRequest = BaseRequest & Authenticated;
type PostRequest = BaseRequest & Authenticated & WithBody;

function sendPost(request: PostRequest): void {
  // request hat: url, method, headers.authorization, body
  console.log(`${request.method} ${request.url}`);
}
```

---

## Konflikte: Was passiert bei widerspruchlichen Properties?

Wenn zwei Typen die **gleiche Property mit verschiedenen Typen** haben,
entsteht ein Intersection der Property-Typen:

```typescript annotated
interface A {
  value: string;
}
interface B {
  value: number;
}

type AB = A & B;
// AB.value hat den Typ: string & number
// Ein Wert, der GLEICHZEITIG string UND number ist? Unmoeglich!
// Ergebnis: value ist "never"

// Das bedeutet: AB ist UNMOEGICH zu erstellen
// const impossible: AB = { value: ??? }; // Kein Wert passt!
```

> 💭 **Denkfrage:** Warum wird `string & number` zu `never` und nicht
> zu einem Fehler?
>
> **Antwort:** TypeScript meldet keinen Fehler bei der Typ-Definition,
> weil Intersection Types immer "legal" sind. Erst wenn du versuchst,
> einen Wert dieses Typs zu erstellen, wird klar, dass es unmoeglich
> ist. Der Typ `never` drueckt genau das aus: "die leere Menge".

### Kompatible Konflikte: Literal + Parent

Nicht jeder "Konflikt" fuehrt zu `never`. Wenn ein Typ ein **Subtyp**
des anderen ist, gewinnt der engere:

```typescript annotated
interface Config1 {
  mode: string;          // breit
}
interface Config2 {
  mode: "production";    // eng (Literal-Typ)
}

type Combined = Config1 & Config2;
// Combined.mode: string & "production" = "production"
// Das funktioniert! "production" ist ein Subtyp von string
// Der Intersection ist der ENGERE Typ

const config: Combined = { mode: "production" };  // OK
// const bad: Combined = { mode: "development" };   // Error!
```

---

## extends vs & — Wann was?

Beide koennen aehnliche Ergebnisse erzielen, haben aber unterschiedliche
Semantik:

```typescript
// ─── Variante 1: extends (Interface-Vererbung) ───
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}
// Dog hat: name + breed

// ─── Variante 2: & (Intersection) ────────────────
interface AnimalBase {
  name: string;
}
interface DogTraits {
  breed: string;
}
type DogType = AnimalBase & DogTraits;
// DogType hat: name + breed — gleiches Ergebnis!
```

| Kriterium | `extends` | `&` |
|---|---|---|
| Verwendbar mit | Interfaces | Interfaces, Types, Primitives |
| Konflikte | **Compile-Fehler** | Intersection (evtl. `never`) |
| Mehrfach-Vererbung | Ja (multiple extends) | Ja (A & B & C) |
| Deklarations-Merging | Ja (Interfaces) | Nein (Type Aliases) |
| Intention | "ist ein" (Vererbung) | "hat auch" (Komposition) |
| Performance | Besser (Caching) | Etwas langsamer bei vielen Typen |

> **Wichtiger Unterschied bei Konflikten:**

```typescript
interface Base {
  id: string;
}

// extends meldet einen Fehler:
// interface Child extends Base {
//   id: number;  // Error! Type 'number' is not assignable to type 'string'
// }

// & erzeugt still einen never-Typ:
type Child = Base & { id: number };
// Child.id ist string & number = never — kein Compile-Fehler,
// aber unmoeglich zu erstellen!
```

> 🧠 **Erklaere dir selbst:** Warum ist `extends` bei Konflikten
> "strenger" als `&`? Welcher Ansatz ist sicherer?
> **Kernpunkte:** extends prueft Kompatibilitaet beim Deklarieren |
> & kombiniert blind und erzeugt ggf. never | extends gibt fruehere Fehler |
> & ist flexibler aber kann zu versteckten never-Typen fuehren

---

## Intersection mit Generics: Mixin-Pattern

Ein maechtigses Pattern: **Mixins** mit Generics und Intersections:

```typescript annotated
// Generische Funktion die einen Typ "erweitert"
function withTimestamps<T>(obj: T): T & Timestamped {
  return {
    ...obj,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

interface User {
  name: string;
  email: string;
}

const user: User = { name: "Alice", email: "alice@example.com" };
const timestamped = withTimestamps(user);
// Typ: User & Timestamped
// Hat: name, email, createdAt, updatedAt
console.log(timestamped.name);       // OK
console.log(timestamped.createdAt);  // OK
```

> ⚡ **Praxis-Tipp:** Dieses Pattern ist ueberall in modernen
> Frameworks zu finden:
>
> ```typescript
> // React: Higher-Order Components
> function withAuth<P>(Component: React.FC<P>): React.FC<P & { user: User }> { ... }
>
> // Angular: Decorator-Pattern fuer Services
> type WithLogging<T> = T & { log: (msg: string) => void };
> ```

---

## Was du gelernt hast

- Der `&`-Operator erstellt Intersection Types: ein Wert muss **alle Typen gleichzeitig** erfuellen
- Intersection Types **kombinieren Properties** aus mehreren Interfaces
- Bei inkompatiblen Properties entsteht `never` (still, kein Fehler!)
- `extends` ist strenger (meldet Konflikte), `&` ist flexibler (kombiniert blind)
- Generics + `&` ermoeglichen maechtige **Mixin-Patterns**

**Kernkonzept zum Merken:** Intersection Types sind die **Schnittmenge** aller beteiligten Typen. Die Menge der gueltigen Werte wird KLEINER (restriktiver), aber jeder Wert hat MEHR Properties.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> interface User {
>   name: string;
>   email: string;
> }
>
> type Admin = User & { role: "admin" };
>
> // Was passiert hier?
> const a: Admin = { name: "Alice", email: "a@x.com", role: "admin" };  // OK
> const b: Admin = { name: "Bob",   email: "b@x.com", role: "user" };   // ???
>
> // Bonus: Was ist der Typ von "role" in Admin?
> // Hover ueber "role" in der Admin-Definition.
> ```
> Welche Fehlermeldung zeigt TypeScript bei `role: "user"`?
> Was wuerde passieren, wenn du `role: string` (breit) statt `role: "admin"` (Literal) nimmst?

---

> **Pausenpunkt** -- Du kennst jetzt beide Operatoren: `|` fuer Union
> und `&` fuer Intersection. In der naechsten Sektion vergleichen wir
> sie direkt und lernen, wann du welchen verwendest.
>
> Weiter geht es mit: [Sektion 05: Union vs Intersection](./05-union-vs-intersection.md)
