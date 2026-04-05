# Sektion 2: Pattern-Kombination — Konzepte verbinden

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Phase 3 Ueberblick](./01-phase-3-ueberblick.md)
> Naechste Sektion: [03 - Typ-Level-Programmierung](./03-typ-level-programmierung.md)

---

## Was du hier lernst

- Wie Branded Types + Result-Pattern zusammen ein robustes Error-System bilden
- Wie Classes + Generics + Varianz ein sicheres Repository-Pattern ermoeglichen
- Wie Recursive Types + Branded Types Deep-Validation ermoeglichen
- Warum die Kombination mehr Sicherheit bietet als jedes Konzept allein

---

## Kombination 1: Branded Types + Result-Pattern

In L24 hast du gelernt, Typen durch Brands unterscheidbar zu machen.
In L25 hast du das Result-Pattern kennengelernt. Zusammen ergibt sich
ein System, in dem sowohl Werte als auch Fehler typsicher sind:

```typescript annotated
// Branded Types aus L24:
type Email = string & { readonly __brand: 'Email' };
type Username = string & { readonly __brand: 'Username' };

// Result-Pattern aus L25:
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Branded Error Types — die Kombination:
type ValidationError = { kind: 'validation'; field: string; message: string };
type NotFoundError = { kind: 'not-found'; id: string };

// Smart Constructor mit Result-Return:
function parseEmail(input: string): Result<Email, ValidationError> {
  if (!input.includes('@')) {
    return {
      ok: false,
      error: { kind: 'validation', field: 'email', message: 'Kein @-Zeichen' }
    };
    // ^ Fehler ist im Typ sichtbar — kein try/catch noetig
  }
  return { ok: true, value: input as Email };
  // ^ Brand wird nur hier vergeben — nach Validierung
}

// Verwendung — der Compiler erzwingt Fehlerbehandlung:
const result = parseEmail(userInput);
if (result.ok) {
  sendMail(result.value);
  // ^ result.value ist Email (branded!), nicht string
} else {
  showError(result.error.message);
  // ^ result.error ist ValidationError — typsicher
}
```

> 📖 **Hintergrund: Parse, Don't Validate**
>
> Alexis King veroeffentlichte 2019 den einflussreichen Blogpost
> "Parse, Don't Validate". Die Kernidee: Statt Daten zu validieren
> und dann als `string` weiterzureichen (wo die Validierung verloren
> geht), solltest du sie PARSEN — also in einen staerkeren Typ
> umwandeln. Der Brand in `Email` ist der Beweis, dass die Validierung
> stattgefunden hat. Das ist genau das Pattern von L24 + L25 zusammen.

> 💭 **Denkfrage:** Was ist der Vorteil gegenueber einer einfachen
> `validateEmail(input: string): boolean`-Funktion?
>
> **Antwort:** Bei boolean verlierst du die Information NACH der
> Pruefung. Du hast einen `string`, nicht eine `Email`. Jede
> Funktion die eine `Email` erwartet, muesste erneut pruefen.
> Mit Branded Types + Result ist die Validierung im Typ "eingebacken".

---

## Kombination 2: Classes + Generics + Varianz

Ein generisches Repository mit korrekter Varianz (L21 + L22):

```typescript annotated
// Basistypen mit Branded IDs (L24):
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// Entity-Basisklasse (L21):
abstract class Entity<Id> {
  constructor(public readonly id: Id) {}
  // ^ readonly — IDs duerfen nie geaendert werden
}

class User extends Entity<UserId> {
  constructor(id: UserId, public name: string) { super(id); }
}

class Post extends Entity<PostId> {
  constructor(id: PostId, public title: string, public authorId: UserId) {
    super(id);
  }
}

// Generisches Repository (L22 — Varianz beachten!):
interface ReadRepository<out T extends Entity<unknown>> {
  // ^ out = kovariant: ReadRepository<User> ist ReadRepository<Entity<unknown>> zuweisbar
  findById(id: T extends Entity<infer Id> ? Id : never): Promise<T | null>;
  findAll(): Promise<T[]>;
}

interface WriteRepository<in T extends Entity<unknown>> {
  // ^ in = kontravariant: WriteRepository<Entity<unknown>> ist WriteRepository<User> zuweisbar
  save(entity: T): Promise<void>;
  delete(entity: T): Promise<void>;
}

interface Repository<T extends Entity<unknown>>
  extends ReadRepository<T>, WriteRepository<T> {}
// ^ Kombination: Lesen + Schreiben = invariant
```

> 🧠 **Erklaere dir selbst:** Warum ist `ReadRepository<out T>`
> kovariant, aber `WriteRepository<in T>` kontravariant?
> Erinnere dich an L22: Wo steht der Typparameter — im Return
> (out/kovariant) oder im Parameter (in/kontravariant)?
> **Kernpunkte:** ReadRepository gibt T zurueck (out-Position) |
> WriteRepository nimmt T entgegen (in-Position) | Kovarianz =
> speziellerer Typ zuweisbar | Kontravarianz = allgemeinerer Typ
> zuweisbar

---

## Kombination 3: Recursive Types + Branded Types

In L23 hast du rekursive Typen gelernt. Kombiniert mit Branded
Types aus L24 entsteht ein System fuer tiefe, typsichere
Validierung:

```typescript annotated
// Branded Primitive Types (L24):
type PositiveNumber = number & { readonly __brand: 'Positive' };
type NonEmptyString = string & { readonly __brand: 'NonEmpty' };

// Rekursiver Typ der alle Felder "brandet" (L23):
type DeepValidated<T> = T extends object
  ? { [K in keyof T]: DeepValidated<T[K]> }
  // ^ Rekursion: verschachtelte Objekte werden auch validiert
  : T extends number
    ? PositiveNumber
    // ^ Alle number werden zu PositiveNumber
    : T extends string
      ? NonEmptyString
      // ^ Alle string werden zu NonEmptyString
      : T;

// Anwendung:
type Config = {
  server: { host: string; port: number };
  db: { url: string; poolSize: number };
};

type ValidatedConfig = DeepValidated<Config>;
// Ergebnis:
// {
//   server: { host: NonEmptyString; port: PositiveNumber };
//   db: { url: NonEmptyString; poolSize: PositiveNumber };
// }
```

> 🔬 **Experiment:** Erweitere den `DeepValidated`-Typ im Kopf.
> Was passiert, wenn `Config` ein Array-Feld hat?
>
> ```typescript
> type ConfigV2 = {
>   server: { host: string; ports: number[] };
> };
>
> // Was ist DeepValidated<ConfigV2>?
> // Tipp: Arrays sind auch "objects" in JavaScript.
> // ports wuerde zu PositiveNumber[] werden?
> // Nicht ganz — du muesstest den Array-Fall separat behandeln:
> type DeepValidatedV2<T> = T extends (infer U)[]
>   ? DeepValidatedV2<U>[]
>   : T extends object
>     ? { [K in keyof T]: DeepValidatedV2<T[K]> }
>     : T extends number ? PositiveNumber
>     : T extends string ? NonEmptyString
>     : T;
> ```

---

## Kombination 4: Error Handling + Decorators

L25 (Result-Pattern) + L28 (Decorators) — automatisches Error-Wrapping:

```typescript annotated
// Ein Decorator der try/catch in Result umwandelt (L28 + L25):
function catchToResult<T>(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = async function(...args: any[]) {
    try {
      const value = await original.apply(this, args);
      return { ok: true, value } as const;
      // ^ Erfolg → Result.ok
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error))
      } as const;
      // ^ Fehler → Result.error
    }
  };
}

// Verwendung in einer Angular-Service-Klasse:
class UserService {
  @catchToResult
  async getUser(id: UserId): Promise<User> {
    // ^ Decorator wandelt Promise<User> in Promise<Result<User, Error>>
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Not found');
    return response.json();
  }
}
```

> ⚡ **Praxis-Tipp:** In deinem Angular-Projekt koenntest du einen
> solchen Decorator fuer HTTP-Service-Methoden verwenden. Statt
> in jedem Component try/catch zu schreiben, gibt jede
> Service-Methode automatisch ein Result zurueck. Das macht
> Error-Handling im Template deklarativ statt imperativ:
>
> ```typescript
> // Im Component:
> const result = await this.userService.getUser(id);
> if (result.ok) {
>   this.user = result.value;
> } else {
>   this.errorMessage = result.error.message;
> }
> ```

---

## Kombination 5: State Machine + Branded Types + Phantom Types

Das vielleicht maechtigste Pattern aus Phase 3 — eine typsichere
Zustandsmaschine die ungueltige Uebergaenge zur Compile-Zeit
verhindert:

```typescript annotated
// Phantom Types fuer Zustaende (L26):
type Draft = { readonly __state: 'draft' };
type Review = { readonly __state: 'review' };
type Published = { readonly __state: 'published' };

// Document mit Phantom-Type-Parameter:
class Document<State> {
  private constructor(
    public readonly title: string,
    public readonly content: string
  ) {}

  static create(title: string): Document<Draft> {
    // ^ Neues Dokument ist IMMER im Draft-Zustand
    return new Document(title, '');
  }
}

// Zustandsuebergaenge als Funktionen:
function submitForReview(doc: Document<Draft>): Document<Review> {
  // ^ NUR Draft → Review ist erlaubt
  return doc as unknown as Document<Review>;
}

function publish(doc: Document<Review>): Document<Published> {
  // ^ NUR Review → Published ist erlaubt
  return doc as unknown as Document<Published>;
}

// Verwendung:
const doc = Document.create('Mein Artikel');    // Document<Draft>
const reviewed = submitForReview(doc);           // Document<Review>
const published = publish(reviewed);             // Document<Published>

// publish(doc);
// ^ Fehler! Document<Draft> ist nicht Document<Review>
// Der Compiler verhindert den ungueltigen Uebergang!
```

> 🧠 **Erklaere dir selbst:** Warum ist dieses Pattern besser als
> ein einfaches `state: 'draft' | 'review' | 'published'` Feld?
> Was passiert bei Runtime-State-Checks vs Compile-Time-Checks?
> **Kernpunkte:** Runtime-Check: Fehler erst beim Ausfuehren |
> Compile-Time-Check: Fehler beim Schreiben | Phantom Types:
> unmoeglich falschen Uebergang zu kodieren | Runtime-State: kann
> vergessen werden zu pruefen

---

## Zusammenfassung: Die Pattern-Bibliothek

| Kombination | Lektionen | Ergebnis |
|-------------|-----------|----------|
| Branded + Result | L24 + L25 | Typsichere Validierung mit expliziten Fehlern |
| Classes + Generics + Varianz | L21 + L22 | Sichere Repository/Service-Abstraktion |
| Recursive + Branded | L23 + L24 | Tiefe Validierung verschachtelter Daten |
| Error Handling + Decorators | L25 + L28 | Automatisches Error-Wrapping |
| State Machine + Phantom Types | L24 + L26 | Ungueltige Zustaende = Compile-Fehler |

---

## Was du gelernt hast

- Branded Types + Result-Pattern bilden ein vollstaendiges Validierungssystem
- Varianz aus L22 ist entscheidend fuer generische Repositories
- Recursive Types + Branded Types ermoeglichen Deep-Validation
- Phantom Types + State Machines verhindern ungueltige Zustandsuebergaenge zur Compile-Zeit

> 🧠 **Erklaere dir selbst:** Welche Kombination wuerdest du in
> einem E-Commerce-Projekt als Erstes einfuehren? Warum?
> **Kernpunkte:** Branded IDs (L24) fuer CustomerId vs OrderId |
> Result-Pattern (L25) fuer Payment-Fehler | State Machine (L26)
> fuer Order-Status (draft → paid → shipped → delivered)

**Kernkonzept zum Merken:** Jedes Phase-3-Konzept allein ist nuetzlich.
Aber die **Kombination** macht den echten Unterschied — sie verwandelt
das Typsystem von einem Pruefwerkzeug in ein Designwerkzeug.

---

> **Pausenpunkt** -- Pattern-Kombinationen gemeistert. Als Naechstes:
> Typ-Level-Programmierung in der Praxis.
>
> Weiter geht es mit: [Sektion 03: Typ-Level-Programmierung](./03-typ-level-programmierung.md)
