# Sektion 4: Generische Library-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Dual Package (CJS + ESM)](./03-dual-package-cjs-esm.md)
> Naechste Sektion: [05 - Versionierung und Breaking Changes bei Typen](./05-versionierung-und-breaking-changes.md)

---

## Was du hier lernst

- Wie du **Overloads** fuer flexible und typsichere APIs einsetzt
- Warum **Conditional Return Types** die Benutzerfreundlichkeit erhoehen
- Wie du **generische Wrapper** designst die sich "magisch" anfuehlen
- Welche **Patterns** erfolgreiche Libraries (Zod, tRPC, Prisma) verwenden

---

## Hintergrund: Die Kunst der Library-Typen

> **Origin Story: Wie Zod TypeScript-First Library Design definierte**
>
> Colin McDonnell veroeffentlichte Zod 2020 mit einem radikalen Ansatz:
> Das Schema IST der Typ. `z.object({ name: z.string() })` erzeugt
> automatisch den TypeScript-Typ `{ name: string }` — ohne manuelle
> Typ-Definitionen. Das funktioniert durch eine brilliante Kombination
> aus Generics, Conditional Types und Method Chaining.
>
> Zod bewies, dass Library-Typen nicht nur "korrekt" sein muessen —
> sie muessen sich auch gut ANFUEHLEN. Autocomplete soll die richtigen
> Vorschlaege machen, Fehlermeldungen sollen verstaendlich sein, und
> der Konsument soll so wenig wie moeglich annotieren muessen.

Gute Library-Typen haben drei Eigenschaften:
1. **Inferenz:** Der Konsument annotiert so wenig wie moeglich
2. **Praezision:** Rueckgabetypen sind so spezifisch wie moeglich
3. **Ergonomie:** Fehlermeldungen sind verstaendlich

---

## Pattern 1: Overloads fuer flexible APIs

Overloads erlauben verschiedene Signaturen fuer die gleiche Funktion:

```typescript annotated
// Eine Funktion, mehrere Aufruf-Varianten:
export function createClient(url: string): Client;
export function createClient(config: ClientConfig): Client;
export function createClient(urlOrConfig: string | ClientConfig): Client {
  // ^ Implementation-Signatur — wird von Konsumenten NICHT gesehen
  const config = typeof urlOrConfig === "string"
    ? { url: urlOrConfig }
    : urlOrConfig;
  return new Client(config);
}

// Konsumenten sehen NUR die Overload-Signaturen:
createClient("https://api.example.com");        // OK (Signatur 1)
createClient({ url: "https://...", timeout: 5000 }); // OK (Signatur 2)
createClient(42);                                // FEHLER
// ^ TypeScript zeigt beide Signaturen als Vorschlaege
```

Fortgeschrittener: **Overloads mit unterschiedlichen Return-Types:**

```typescript annotated
export function fetch<T>(url: string): Promise<T>;
export function fetch<T>(url: string, options: { stream: true }): AsyncIterable<T>;
export function fetch<T>(url: string, options?: { stream?: boolean }): Promise<T> | AsyncIterable<T> {
  // ^ Verschiedene Rueckgabetypen je nach Parametern
  if (options?.stream) {
    return createStream<T>(url);
  }
  return fetchJson<T>(url);
}

// Konsumenten erleben:
const data = await fetch<User>("/api/users");
// ^ Typ: User (Promise-Variante)

const stream = fetch<LogEntry>("/api/logs", { stream: true });
// ^ Typ: AsyncIterable<LogEntry> (Stream-Variante)
```

> 🧠 **Erklaere dir selbst:** Warum zeigt TypeScript die Implementation-Signatur nicht in der IDE? Was waere das Problem wenn es das taete?
> **Kernpunkte:** Implementation-Signatur ist zu breit (string | ClientConfig) | Konsumenten sollen die praezisen Overloads sehen | IDE zeigt nur Overloads als Vorschlaege | Implementation muss alle Overloads abdecken

---

## Pattern 2: Conditional Return Types

Statt Overloads kannst du den Rueckgabetyp auch bedingt berechnen:

```typescript annotated
// Der Rueckgabetyp haengt vom Input ab:
type ParseResult<T extends string> =
  T extends `${number}` ? number :
  T extends "true" | "false" ? boolean :
  string;

export function parse<T extends string>(value: T): ParseResult<T> {
  if (!isNaN(Number(value))) return Number(value) as any;
  if (value === "true" || value === "false") return (value === "true") as any;
  return value as any;
  // ^ 'as any' in der Implementation ist OK — die Typen sind korrekt
  // ^ Der Konsument sieht nur den Conditional Return Type
}

// Konsumenten erleben:
const n = parse("42");      // Typ: number
const b = parse("true");    // Typ: boolean
const s = parse("hello");   // Typ: string
// ^ Der Typ PASST SICH AN den Input an — magisch fuer den Konsumenten
```

> 💭 **Denkfrage:** Warum ist `as any` in der Implementation akzeptabel,
> aber `as any` in der oeffentlichen API nicht?
>
> **Antwort:** Die Implementation ist ein Implementationsdetail — der
> Konsument sieht sie nie (sie ist nicht in der .d.ts). Solange die
> oeffentlichen Typen (Overloads, Conditional Returns) korrekt sind,
> ist `as any` intern OK. Es ist wie eine Kuechentuer: Was dahinter
> passiert, sieht der Gast nicht.

---

## Pattern 3: Builder mit Typ-Akkumulation

Das Builder-Pattern aus L26 ist in Libraries besonders maechtig:

```typescript annotated
// Typ-sicherer Query Builder (aehnlich wie Prisma, Knex)
type TableNames = "users" | "posts" | "comments";
type TableColumns = {
  users: "id" | "name" | "email";
  posts: "id" | "title" | "authorId";
  comments: "id" | "text" | "postId";
};

class QueryBuilder<
  T extends TableNames = never,
  Selected extends string = never
> {
  from<Table extends TableNames>(table: Table): QueryBuilder<Table, never> {
    // ^ Setzt den Table-Typ — jetzt sind nur Columns dieser Table verfuegbar
    return this as any;
  }

  select<Col extends TableColumns[T]>(
    ...columns: Col[]
  ): QueryBuilder<T, Selected | Col> {
    // ^ Akkumuliert ausgewaehlte Columns im Generic
    return this as any;
  }

  where(column: TableColumns[T], value: unknown): this {
    // ^ Nur Columns der aktuellen Table erlaubt
    return this;
  }

  execute(): Promise<Record<Selected, unknown>[]> {
    // ^ Rueckgabetyp basiert auf den AUSGEWAEHLTEN Columns
    return Promise.resolve([]);
  }
}

// Konsumenten erleben:
const query = new QueryBuilder()
  .from("users")
  .select("name", "email")
  // ^ Autocomplete zeigt: "id" | "name" | "email"
  .where("name", "Max");
  // ^ Autocomplete zeigt: "id" | "name" | "email"

const result = await query.execute();
// ^ Typ: Record<"name" | "email", unknown>[]
```

> ⚡ **Framework-Bezug (Angular):** Angulars `HttpClient` nutzt ein
> aehnliches Pattern — der Generic-Typ wird durch die Methoden-Kette
> akkumuliert:
>
> ```typescript
> this.http.get<User[]>('/api/users')          // Typ: Observable<User[]>
>   .pipe(map(users => users.length))          // Typ: Observable<number>
>   .subscribe(count => console.log(count));   // count: number
> ```
>
> Jeder Operator in der Pipe verfeinert den Typ. Das ist dasselbe
> Prinzip wie der Builder oben.

---

## Pattern 4: Inference von Konfigurationsobjekten

Das Zod-Pattern — der Typ entsteht aus der Konfiguration:

```typescript annotated
// Die Konfiguration DEFINIERT den Typ:
function defineSchema<T extends Record<string, "string" | "number" | "boolean">>(
  schema: T
): {
  parse: (data: unknown) => {
    [K in keyof T]: T[K] extends "string" ? string
      : T[K] extends "number" ? number
      : T[K] extends "boolean" ? boolean
      : never
  }
} {
  return {
    parse(data: unknown) {
      // Runtime-Validierung hier...
      return data as any;
    }
  };
}

// Konsumenten erleben:
const userSchema = defineSchema({
  name: "string",
  age: "number",
  active: "boolean"
});

const user = userSchema.parse(rawData);
// ^ Typ: { name: string; age: number; active: boolean }
// ^ Der Typ wurde AUTOMATISCH aus dem Schema abgeleitet!
// ^ Keine manuelle Typ-Definition noetig
```

> 🧪 **Experiment:** Baue eine Mini-Version des Zod-Patterns:
>
> ```typescript
> function define<T extends Record<string, "string" | "number">>(schema: T) {
>   return {
>     validate: (data: unknown): { [K in keyof T]: T[K] extends "string" ? string : number } => {
>       return data as any; // Simplified
>     }
>   };
> }
>
> const s = define({ name: "string", count: "number" });
> const result = s.validate({});
> // Hovere ueber 'result' — welchen Typ zeigt die IDE?
> // Erwartung: { name: string; count: number }
> ```
>
> Das ist die Essenz von "Schema = Typ" — eine Konfiguration die den
> TypeScript-Typ zur Compile-Zeit ableitet.

---

## Was du gelernt hast

- **Overloads** bieten verschiedene Signaturen fuer flexible APIs
- **Conditional Return Types** passen den Rueckgabetyp an den Input an
- **Builder mit Typ-Akkumulation** tracken State in Generics (Prisma, Query-Builder)
- **Schema-zu-Typ-Inferenz** leitet Typen aus Konfiguration ab (Zod-Pattern)
- `as any` in Implementations ist **akzeptabel** wenn die oeffentlichen Typen stimmen

**Kernkonzept zum Merken:** Gute Library-Typen fuehlen sich "magisch" an — der Konsument schreibt minimalen Code und bekommt maximale Typ-Sicherheit. Das erreichst du durch Inferenz (der Compiler berechnet den Typ), Praezision (Conditional Returns), und Ergonomie (Overloads + Autocomplete).

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du kennst jetzt die
> Patterns die professionelle Libraries nutzen.
>
> Weiter geht es mit: [Sektion 05: Versionierung und Breaking Changes bei Typen](./05-versionierung-und-breaking-changes.md)
