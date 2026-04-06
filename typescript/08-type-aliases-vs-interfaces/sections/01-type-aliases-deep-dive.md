# Sektion 1: Type Aliases Deep Dive

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Interfaces Deep Dive](./02-interfaces-deep-dive.md)

---

## Was du hier lernst

- Was das `type`-Keyword wirklich tut und was ein **Alias** bedeutet
- Wie du **Primitive Aliases**, **Union Types** und **Intersection Types** erstellst
- Warum **Mapped Types** und **Conditional Types** nur mit `type` funktionieren

---

## Das type-Keyword: Ein Name fuer einen Typ

Das Wort "Alias" ist der Schluessel zum Verstaendnis. Ein Type Alias
**erstellt keinen neuen Typ** — er gibt einem existierenden Typ
**einen Namen**. Es ist wie ein Spitzname: Die Person aendert sich
nicht, sie bekommt nur einen kuerzeren Namen.

```typescript annotated
type UserID = string;
// ^ Kein neuer Typ! UserID IST string. Nur ein anderer Name.

type Alter = number;
// ^ Alter IST number. Du koenntest ueberall number schreiben.

let id: UserID = "abc-123";
// ^ Identisch zu: let id: string = "abc-123"

let meineId: string = id;
// ^ Kein Fehler! UserID und string sind DERSELBE Typ.
```

> 📖 **Hintergrund: Warum "Alias" und nicht "neuer Typ"?**
>
> In Sprachen wie Haskell oder Rust kann man mit `newtype` bzw. `struct`
> wirklich NEUE Typen erstellen, die inkompatibel zum Ursprungstyp sind.
> TypeScript waehlt bewusst einen anderen Weg: Das Typsystem ist
> **strukturell** (structural typing), nicht nominal. Zwei Typen sind
> gleich, wenn sie die gleiche Struktur haben — unabhaengig vom Namen.
>
> Das bedeutet: `type UserID = string` und `type OrderID = string` sind
> fuer TypeScript DERSELBE Typ. Du kannst eine UserID einer OrderID
> zuweisen, ohne dass TypeScript sich beschwert. Wenn du das verhindern
> willst, brauchst du "Branded Types" (ein Pattern fuer spaeteren Lektionen).

---

## Primitive Aliases — einfach, aber maechtig

Primitive Aliases sind die einfachste Form von Type Aliases.
Sie geben einem primitiven Typ einen aussagekraeftigen Namen:

```typescript annotated
type Milliseconds = number;
type Pixels = number;
type EmailAddress = string;
type CssColor = string;
// ^ Alle vier sind "nur" number oder string — aber der Code wird LESBARER.

function delay(ms: Milliseconds): Promise<void> {
// ^ Sofort klar: Hier werden Millisekunden erwartet, nicht Sekunden!
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setWidth(element: HTMLElement, width: Pixels): void {
// ^ Klar: Pixels, nicht Prozent oder Rem.
  element.style.width = `${width}px`;
}
```

> **Experiment:** Kopiere folgendes in den TypeScript Playground (typescriptlang.org/play):
>
> ```typescript
> // Type Alias: Einmal definiert, nie wieder veraenderbar
> type Config = { host: string; port: number };
>
> // Versuch: Type Alias ein zweites Mal deklarieren
> type Config = { database: string };
> // ^ Was sagt der Compiler? Probiere es aus!
>
> // Zum Vergleich: Interface kann mehrfach deklariert werden
> interface ConfigI { host: string; port: number }
> interface ConfigI { database: string }
> // ^ Kein Fehler! ConfigI hat jetzt host, port UND database.
>
> const cfg: ConfigI = {
>   host: "localhost",
>   port: 5432,
>   database: "myapp",  // alle drei sind Pflicht
> };
> ```
>
> Declaration Merging ist das Alleinstellungsmerkmal von `interface` —
> und genau deshalb existiert das Keyword ueberhaupt noch.

> 🧠 **Erklaere dir selbst:** Warum ist `type Milliseconds = number` trotzdem
> nuetzlich, obwohl TypeScript `Milliseconds` und `number` gleich behandelt?
> Welche Art von "Schutz" bietet es — und welche nicht?
> **Kernpunkte:** Dokumentations-Wert fuer Entwickler | Kein Laufzeitschutz |
> Kein Compilezeit-Schutz (string = string) | Branded Types fuer echten Schutz

---

## Union Types — die Staerke von type

Hier wird `type` erst richtig maechtig. Union Types sind **nur mit type moeglich**,
nicht mit `interface`:

Du kennst Union Types bereits aus L07 — dort hast du `string | number` als Grundprinzip kennengelernt. Hier wird relevant, warum Union Types *ausschliesslich* mit `type` ausdrueckbar sind, und warum das fuer Discriminated Unions (dazu mehr in L12) entscheidend ist.

```typescript annotated
type Status = "active" | "inactive" | "banned";
// ^ Ein Union aus drei String-Literalen. Nur diese drei Werte sind gueltig.

type StringOrNumber = string | number;
// ^ Ein Union aus zwei Typen. Geht NUR mit type, nicht mit interface!

type ApiResponse =
  | { status: "success"; data: unknown }
  | { status: "error"; message: string };
// ^ Discriminated Union: Das 'status'-Feld bestimmt den Rest der Struktur.
// Das ist eines der maechtigsten Patterns in TypeScript.

function handleResponse(response: ApiResponse) {
  if (response.status === "success") {
// ^ TypeScript weiss: Hier hat response ein 'data'-Feld
    console.log(response.data);
  } else {
// ^ TypeScript weiss: Hier hat response ein 'message'-Feld
    console.error(response.message);
  }
}
```

> 📖 **Hintergrund: Warum kann interface keine Unions?**
>
> Interfaces beschreiben die **Form eines Objekts** — sie sagen "ein Objekt
> hat diese Properties". Ein Union Type dagegen sagt "der Wert ist ENTWEDER
> dies ODER jenes". Das sind fundamental verschiedene Konzepte. Ein Interface
> kann nicht ausdruecken "ich bin manchmal ein String und manchmal eine Zahl".
> Es kann nur sagen "ich bin ein Objekt mit diesen Feldern".
>
> Das ist der Grund, warum Discriminated Unions — eines der maechtigsten
> Patterns in TypeScript — immer mit `type` geschrieben werden.

---

## Intersection Types — Typen kombinieren

Waehrend Union Types "entweder A oder B" ausdruecken, sagen Intersection
Types "sowohl A als auch B":

```typescript annotated
type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge & HasEmail;
// ^ Person hat ALLE Properties: name, age UND email.

const user: Person = {
  name: "Max",
  age: 30,
  email: "max@example.com",
// ^ Alle drei Felder sind Pflicht.
};
```

Intersections mit `&` sind das Aequivalent zu `extends` bei Interfaces.
Aber es gibt einen **wichtigen Unterschied**, den wir in Sektion 03
behandeln: `extends` ist fuer den Compiler schneller.

```typescript annotated
type Timestamped<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
// ^ Ein generischer Intersection Type: Fuegt Timestamps zu jedem Typ hinzu.

type TimestampedPerson = Timestamped<Person>;
// ^ Hat alle Person-Felder PLUS createdAt und updatedAt.
```

> 🧠 **Erklaere dir selbst:** Was passiert, wenn du zwei Typen mit `&` kombinierst,
> die ein Feld mit gleichem Namen aber unterschiedlichem Typ haben?
> z.B. `type A = { id: string } & { id: number }` — was ist der Typ von `id`?
> **Kernpunkte:** id wird zu `string & number` = `never` | Das Objekt wird
> un-erstellbar | Kein Fehler vom Compiler, aber unmoeglich zu verwenden

---

## Mapped Types — nur mit type moeglich

Mapped Types sind eine der fortgeschrittensten Faehigkeiten von TypeScript
und funktionieren **ausschliesslich mit type**, nicht mit interface:

```typescript annotated
type User = {
  name: string;
  age: number;
  email: string;
};

type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
// ^ Iteriert ueber ALLE Keys von User und macht sie readonly.
// K ist nacheinander "name", dann "age", dann "email".
// User[K] ist der jeweilige Typ: string, number, string.
};

// ReadonlyUser ist jetzt:
// { readonly name: string; readonly age: number; readonly email: string }

type OptionalUser = {
  [K in keyof User]?: User[K];
// ^ Macht alle Properties optional.
};

// OptionalUser ist jetzt:
// { name?: string; age?: number; email?: string }
```

TypeScript liefert viele dieser Mapped Types als **Utility Types** mit:

```typescript
// Das sind Mapped Types die TypeScript eingebaut hat:
type A = Readonly<User>;     // Alle Properties readonly
type B = Partial<User>;      // Alle Properties optional
type C = Required<User>;     // Alle Properties erforderlich
type D = Pick<User, "name" | "email">;  // Nur name und email
type E = Omit<User, "age">;  // Alles ausser age
type F = Record<string, number>;  // { [key: string]: number }
```

> 📖 **Hintergrund: Warum kann interface keine Mapped Types?**
>
> Interfaces verwenden eine **statische Deklaration**: Du schreibst jede
> Property einzeln auf. Mapped Types dagegen verwenden **Iteration** ueber
> einen anderen Typ. Das `[K in keyof T]`-Konstrukt ist eine Art "Schleife"
> auf der Typ-Ebene — und solche dynamischen Konstrukte sind nur in
> Type Aliases moeglich. Es ist wie der Unterschied zwischen einer
> handgeschriebenen Liste und einer Formel in einer Tabellenkalkulation.

---

## Conditional Types — die Krone der Type Aliases

Conditional Types sind die komplexeste Faehigkeit und nur mit `type` moeglich:

```typescript annotated
type IsString<T> = T extends string ? "ja" : "nein";
// ^ Wenn T ein string ist, ist der Typ "ja". Sonst "nein".

type A = IsString<string>;   // "ja"
type B = IsString<number>;   // "nein"
type C = IsString<"hallo">;  // "ja" — "hallo" extends string

// Praxis-Beispiel: Extrahiere den Return-Typ einer Funktion
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
// ^ 'infer R' zieht den Rueckgabetyp heraus. Magie!

type FnReturn = ReturnOf<() => string>;  // string
```

> 💭 **Denkfrage:** Warum braucht man Conditional Types? Kannst du dir
> einen Fall vorstellen, in dem du den Rueckgabetyp einer Funktion
> dynamisch bestimmen musst?
>
> **Antwort:** Bibliotheken wie React verwenden Conditional Types intensiv.
> Zum Beispiel bestimmt `useState<T>` den Typ des Setters basierend auf T.
> Oder Prisma generiert Typen basierend auf deinem Datenbankschema —
> der Rueckgabetyp einer Query haengt von den ausgewaehlten Feldern ab.

---

## Was du gelernt hast

- `type` erstellt keinen neuen Typ, sondern einen **Alias** (Name)
- **Primitive Aliases** verbessern die Lesbarkeit
- **Union Types** (`|`) und **Intersection Types** (`&`) sind nur mit `type` moeglich
- **Mapped Types** und **Conditional Types** sind ausschliesslich `type`-Konstrukte
- TypeScript liefert viele Mapped Types als **Utility Types** (`Readonly`, `Partial`, `Pick`, etc.)

> 🧠 **Erklaere dir selbst:** Nenne drei Dinge, die `type` kann, aber `interface` nicht.
> Warum ist `type` also nicht IMMER die bessere Wahl?
> **Kernpunkte:** Unions, Mapped Types, Conditional Types | interface hat
> Declaration Merging + bessere Performance mit extends | Beides hat
> seine Staerken

**Kernkonzept zum Merken:** `type` ist das vielseitigere Werkzeug — es kann alles
ausdruecken, was TypeScript an Typen zu bieten hat. Aber Vielseitigkeit allein
macht es nicht zur besten Wahl fuer jeden Fall.

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du kennst jetzt die
> volle Bandbreite von Type Aliases.
>
> Weiter geht es mit: [Sektion 02: Interfaces Deep Dive](./02-interfaces-deep-dive.md)
