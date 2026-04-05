# Sektion 6: Praxis — Type-safe Router und Query Builder

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Recursive Type Challenges](./05-recursive-type-challenges.md)
> Naechste Sektion: [Lektion 38 - Compiler API](../../38-compiler-api/sections/01-createprogram-und-ast.md)

---

## Was du hier lernst

- Wie man einen **vollstaendigen Type-safe Router** auf Type-Level baut
- Einen **SQL Query Builder** der SQL-Syntax zur Compilezeit prueft
- Wie **Union-zu-Intersection** funktioniert und wann man es braucht
- Die Balance zwischen **Type-Level-Magie und Lesbarkeit**

---

## Projekt 1: Type-safe Router

Bauen wir einen Router der URL-Pfade zur Compilezeit parst und
typsichere Handler erzwingt. Das vereint alles aus den vorherigen
Sektionen:

```typescript annotated
// Schritt 1: Parameter aus einem Pfad-Segment extrahieren
type ParseSegment<S extends string> =
  S extends `:${infer Param}`   // Beginnt mit ":"?
    ? { [K in Param]: string }   // Ja → Parameter-Objekt
    : {};                         // Nein → kein Parameter

// Schritt 2: Alle Segmente verarbeiten
type ParsePath<Path extends string> =
  Path extends `/${infer Segment}/${infer Rest}`
    ? ParseSegment<Segment> & ParsePath<`/${Rest}`>
    // ^ Kombiniere erstes Segment mit Rest (rekursiv)
    : Path extends `/${infer Segment}`
      ? ParseSegment<Segment>
      // ^ Letztes Segment
      : {};

// Schritt 3: Union-zu-Intersection (fuer saubere Typen)
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;
// ^ Dieser Trick nutzt kontravariante Position: Funktions-Parameter
//   werden bei Union zu Intersection zusammengefuehrt

// Schritt 4: Der Router
type RouteParams<Path extends string> =
  UnionToIntersection<ParsePath<Path>> extends infer R
    ? { [K in keyof R]: R[K] }  // "Flatten" fuer saubere Anzeige
    : never;

// Tests:
type T1 = RouteParams<"/users/:id">;
// ^ { id: string }

type T2 = RouteParams<"/users/:userId/posts/:postId">;
// ^ { userId: string; postId: string }

type T3 = RouteParams<"/about">;
// ^ {}
```

> 📖 **Hintergrund: UnionToIntersection — der beruehmteste Typ-Trick**
>
> `UnionToIntersection<A | B>` ergibt `A & B`. Wie funktioniert das?
> Es nutzt eine Eigenschaft von Funktions-Parametern: Sie sind
> **kontravariant** (L22). Wenn du eine Union `(x: A) => void |
> (x: B) => void` hast und mit `infer` den Parameter extrahierst,
> muss der inferierte Typ sowohl A als auch B erfuellen — also
> `A & B`. Dieser Trick wurde 2018 von jcalz auf StackOverflow
> entdeckt und ist seitdem in jeder Type-Level-Bibliothek zu finden.

### Der vollstaendige Router

```typescript annotated
interface RouteDefinition<Path extends string> {
  path: Path;
  handler: (params: RouteParams<Path>) => Response;
}

function defineRoute<Path extends string>(
  path: Path,
  handler: (params: RouteParams<Path>) => Response
): RouteDefinition<Path> {
  return { path, handler };
}

// Verwendung — alles typsicher!
const userRoute = defineRoute(
  "/users/:userId/posts/:postId",
  (params) => {
    params.userId;   // string — Autocomplete!
    params.postId;   // string — Autocomplete!
    // params.foo;   // FEHLER!
    return new Response("OK");
  }
);
```

> ⚡ **Framework-Bezug:** Next.js App Router extrahiert Parameter
> aus `[id]`-Ordnernamen. Angular's Router hat `paramMap.get('id')`.
> Beide koennen aber nicht den String `/users/:id` zur Compilezeit
> parsen. Libraries wie `typesafe-routes` und `remix-typedjson`
> verwenden genau dieses Pattern um die Luecke zu fuellen.

---

## Projekt 2: SQL Query Builder auf Type-Level

Ein Query Builder der die Tabellenstruktur kennt und nur gueltige
Spalten erlaubt:

```typescript annotated
// Schema-Definition:
interface DB {
  users: { id: number; name: string; email: string; active: boolean };
  posts: { id: number; userId: number; title: string; body: string };
  comments: { id: number; postId: number; text: string };
}

// Query-Builder mit Step-Interfaces (L26):
type SelectStep<Schema> = {
  from<T extends keyof Schema & string>(table: T): WhereStep<Schema, T>;
};

type WhereStep<Schema, Table extends keyof Schema & string> = {
  where<Col extends keyof Schema[Table] & string>(
    column: Col,
    op: "=" | "!=" | ">" | "<",
    value: Schema[Table][Col]
    // ^ Der Wert-Typ haengt von der Spalte ab!
  ): WhereStep<Schema, Table>;
  select<Cols extends (keyof Schema[Table] & string)[]>(
    ...columns: Cols
  ): ResultStep<Pick<Schema[Table], Cols[number]>>;
  selectAll(): ResultStep<Schema[Table]>;
};

type ResultStep<Row> = {
  limit(n: number): ResultStep<Row>;
  toSQL(): string;
  execute(): Promise<Row[]>;
};
```

### Verwendung

```typescript
declare function query<S = DB>(): SelectStep<S>;

// Volle Typsicherheit:
const result = query()
  .from("users")                      // Nur "users" | "posts" | "comments"
  .where("active", "=", true)         // active ist boolean → true OK
  // .where("active", "=", "yes")     // FEHLER: string ≠ boolean
  .select("id", "name")              // Nur gueltige Spalten
  // .select("id", "foo")             // FEHLER: "foo" ∉ keyof users
  .limit(10);
```

> 🧠 **Erklaere dir selbst:** Warum ist der Type-Level Query Builder
> sicherer als ein String-basierter Query Builder wie Knex.js?
> Was kann der Typ-Level-Ansatz verhindern was Knex nicht kann?
> **Kernpunkte:** Spalten-Namen werden geprueft | Wert-Typen passen
> zur Spalte | SQL-Injection-Risiko durch Typen reduziert | Knex
> prueft Spalten nur zur Laufzeit (oder gar nicht)

> 💭 **Denkfrage:** Wuerdest du in einem realen Projekt den gesamten
> Query Builder auf Type-Level implementieren? Wo ist die Grenze
> zwischen "sinnvolle Typsicherheit" und "Over-Engineering"?
>
> **Antwort:** Die Step-Interfaces und Spalten-Validierung sind
> produktionsreif — das nutzt Drizzle ORM tatsaechlich. Aber
> SQL-Syntax-Parsing auf Type-Level (z.B. `type Parse<"SELECT * FROM
> users WHERE id = 1">`) waere Over-Engineering. Die Regel: Typisiere
> die **Schnittstelle** (welche Spalten, welche Typen), nicht die
> **Implementierung** (SQL-String-Generierung).

---

## Die Balance: Wann ist genug?

```
Type-Level-Komplexitaet
│
│  ▲ Diminishing Returns
│  │
│  │  ┌─────────────────────────────┐
│  │  │ Full SQL Parser auf         │ ← Over-Engineering
│  │  │ Type-Level                  │
│  │  └─────────────────────────────┘
│  │  ┌─────────────────────────────┐
│  │  │ Query Builder mit           │ ← Sweet Spot fuer Libraries
│  │  │ Step-Interfaces + Schema    │
│  │  └─────────────────────────────┘
│  │  ┌─────────────────────────────┐
│  │  │ Route-Parameter aus         │ ← Sweet Spot fuer Projekte
│  │  │ Pfad-Strings extrahieren   │
│  │  └─────────────────────────────┘
│  │  ┌─────────────────────────────┐
│  │  │ Generics + Conditional      │ ← Standard fuer jeden TS-Dev
│  │  │ Types fuer APIs             │
│  │  └─────────────────────────────┘
│  │
│  └──────────────────────────────────→ Praktischer Nutzen
```

### Die Checkliste fuer Type-Level Code

1. **Braucht der Nutzer diese Typsicherheit?** (Nicht: "Ist es cool?")
2. **Kann ich den Typ in 30 Sekunden erklaeren?** (Wenn nein: zu komplex)
3. **Gibt es eine einfachere Alternative?** (Overloads? Union Types?)
4. **Wie sind die Fehlermeldungen?** (Unlesbare Fehler = schlechte DX)
5. **Ueberlebt der Typ ein TypeScript-Update?** (Undokumentiertes Verhalten vermeiden)

---

## Experiment: Erweitere den Router

Erweitere den Router um Query-Parameter und HTTP-Methoden:

```typescript
// Ziel: GET /users/:id?fields=name,email
// → { method: "GET"; params: { id: string }; query: { fields: string } }

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RouteConfig<
  Method extends HttpMethod,
  Path extends string,
  Query extends Record<string, string> = {}
> = {
  method: Method;
  params: RouteParams<Path>;
  query: Query;
};

// Experiment 1: Baue einen definierten Route-Typ fuer:
// POST /api/users/:userId/comments mit query { page: string; limit: string }

// Experiment 2: Kannst du den Query-String "page=1&limit=10" auf Type-Level
// parsen und daraus { page: string; limit: string } ableiten?
// (Tipp: Du hast den ParseQuery-Typ aus Sektion 3!)
```

---

## Was du gelernt hast

- Ein **Type-safe Router** der URL-Parameter zur Compilezeit extrahiert — in Produktion nutzbar
- Ein **SQL Query Builder** der Tabellen, Spalten und Wert-Typen zur Compilezeit prueft
- **UnionToIntersection** — der wichtigste Utility-Typ fuer Type-Level-Bibliotheken
- Die **Checkliste** fuer die Balance zwischen Typsicherheit und Komplexitaet
- Type-Level Programming ist am wertvollsten an **Schnittstellen** (APIs, Router, ORMs)

> 🧠 **Erklaere dir selbst:** Du hast jetzt alle Werkzeuge des
> Type-Level Programmierens gelernt: Arithmetik, String-Parsing,
> Pattern Matching, Rekursion, Praxis-Projekte. Welches einzelne
> Werkzeug wuerdest du in deinem Angular-Projekt als erstes einsetzen?
> **Kernpunkte:** Route-Parameter-Typen sind sofort nutzbar |
> PathOf fuer tief verschachtelte Configs | Query Builder fuer
> Datenbankzugriffe | Am wenigsten Risiko: Utility-Types wie
> DeepReadonly

**Kernkonzept der gesamten Lektion:** Type-Level Programming ist eine Sprache in der Sprache. Nutze sie gezielt fuer Schnittstellen und Bibliotheken — dort ist der ROI am hoechsten. Fuer Business-Logik bleib bei einfachen Typen.

---

> **Pausenpunkt** — Du hast Type-Level Programming gemeistert.
> Die naechste Lektion zeigt dir die andere Seite: Wie der
> TypeScript-Compiler selbst funktioniert und wie du seine API nutzt.
>
> Weiter geht es mit: [Lektion 38: Compiler API](../../38-compiler-api/sections/01-createprogram-und-ast.md)
