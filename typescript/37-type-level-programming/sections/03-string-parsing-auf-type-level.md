# Sektion 3: String-Parsing auf Type-Level

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Arithmetik auf Type-Level](./02-arithmetik-auf-type-level.md)
> Naechste Sektion: [04 - Pattern Matching mit Conditional Types](./04-pattern-matching.md)

---

## Was du hier lernst

- Wie man **Strings zur Compilezeit parst** mit Template Literal Types und `infer`
- **Split**, **Join**, **Replace** und **Trim** als reine Typ-Operationen
- Wie man einen **URL-Path-Parser** auf Type-Level baut
- Warum String-Parsing auf Type-Level fuer **Router und API-Definitionen** entscheidend ist

---

## Strings sind Daten auf Type-Level

In Sektion 1 hast du gesehen, dass Template Literal Types Strings
manipulieren koennen. Jetzt gehen wir weiter: Wir **parsen** Strings.
Das heisst, wir zerlegen einen String in seine Bestandteile — alles
zur Compilezeit.

Wenn du an einem Backend-Projekt arbeitest, hast du bestimmt schon
Code geschrieben wie:

```typescript
// Ohne Type-Level-Parsing:
router.get('/users/:id', (req, res) => {
  const id = req.params.id;  // string — aber TypeScript weiss nicht ob "id" existiert
});

// Der Entwickler muss wissen welche Parameter vorhanden sind.
// Tippfehler? → Laufzeitfehler. Kein Autocomplete. Kein Compile-Fehler.
```

Type-Level-String-Parsing loest genau dieses Problem: Der Pfad-String
`"/users/:id"` wird zur Compilezeit analysiert und daraus wird
automatisch `{ id: string }` abgeleitet. Der String **beschreibt**
den Typ.

> 📖 **Hintergrund: Template Literal Types — die unterschaetzte Revolution**
>
> Template Literal Types wurden in TypeScript 4.1 (November 2020)
> eingefuehrt. Ryan Cavanaugh vom TypeScript-Team beschrieb sie als
> "die maechtigste Typ-Erweiterung seit Conditional Types". Der Grund:
> Sie machen Strings auf Type-Level **strukturiert**. Vorher war
> `"GET /users/:id"` einfach ein `string`. Jetzt kann TypeScript
> `:id` extrahieren und daraus `{ id: string }` ableiten. Das ist
> die Grundlage fuer typsichere Router in Express, Next.js und tRPC.
>
> Der Durchbruch kam mit **tRPC** (2021, Alex Johansson): Das Framework
> nutzt Template Literal Types um Prozedur-Namen wie `"user.getById"`
> zur Compilezeit zu parsen — der Dot-Trenner wird extrahiert, der
> Namespace `"user"` und der Name `"getById"` werden getrennt.
> Dadurch sind alle tRPC-Aufrufe vollstaendig typsicher ohne
> Code-Generierung.

### Die Grundbausteine

```typescript annotated
// Split: Zerlege einen String an einem Trennzeichen
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    // ^ Gibt es ein Trennzeichen D in S?
    ? [Head, ...Split<Tail, D>]  // Ja → Kopf + rekursiv den Rest
    : [S];                        // Nein → nur noch ein Element
// ^ Rekursion: Zerlegt "a/b/c" an "/" zu ["a", "b", "c"]

type Parts = Split<"users/posts/comments", "/">;
// ^ ["users", "posts", "comments"]

type Words = Split<"hello world foo", " ">;
// ^ ["hello", "world", "foo"]
```

---

## String-Operationen als Typen

### Replace: Ersetze Teilstrings

```typescript annotated
// Ersetze das erste Vorkommen von From mit To:
type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Before}${From}${infer After}`
    ? `${Before}${To}${After}`  // Ersetze und gib den Rest zurueck
    : S;                         // Nichts gefunden → unveraendert

type R1 = Replace<"hello world", "world", "TypeScript">;
// ^ "hello TypeScript"

// Ersetze ALLE Vorkommen (rekursiv):
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Before}${From}${infer After}`
    ? ReplaceAll<`${Before}${To}${After}`, From, To>
    // ^ Rekursion: Nach dem Ersetzen weitersuchen
    : S;

type R2 = ReplaceAll<"a-b-c-d", "-", "_">;
// ^ "a_b_c_d"
```

### Join: Strings zusammenfuegen

```typescript annotated
// Join: Array von Strings mit Trennzeichen verbinden
type Join<Parts extends string[], Sep extends string> =
  Parts extends [infer First extends string, ...infer Rest extends string[]]
    ? Rest extends []
      ? First                          // Letztes Element: kein Separator
      : `${First}${Sep}${Join<Rest, Sep>}`  // Separator + Rest rekursiv
    : "";                              // Leeres Array → leerer String

type J1 = Join<["users", "posts", "comments"], "/">;  // "users/posts/comments"
type J2 = Join<["a", "b", "c"], "-">;                  // "a-b-c"
type J3 = Join<["hello"], " ">;                        // "hello" (kein Sep noetig)
```

### Trim: Leerzeichen entfernen

```typescript annotated
// Entferne fuehrende Leerzeichen:
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}`   // Beginnt S mit einem Leerzeichen?
    ? TrimLeft<Rest>            // Ja → entfernen, weiter pruefen
    : S;                        // Nein → fertig

// Entferne nachfolgende Leerzeichen:
type TrimRight<S extends string> =
  S extends `${infer Rest} `   // Endet S mit einem Leerzeichen?
    ? TrimRight<Rest>           // Ja → entfernen, weiter pruefen
    : S;

// Kombiniert:
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type T1 = Trim<"  hello  ">;           // "hello"
type T2 = Trim<"   spaces   ">;        // "spaces"
type T3 = Trim<"no-spaces">;           // "no-spaces" (unveraendert)

// Praxis: CSV-Parsing mit Trim
type ParseCSVField<S extends string> = Trim<S>;
type CSVFields = Split<"  Alice  ,  Bob  ,  Charlie  ", ",">;
// ^ ["  Alice  ", "  Bob  ", "  Charlie  "]
// Dann: { [K in CSVFields[number]]: ParseCSVField<K> }
```

> 🧠 **Erklaere dir selbst:** Warum muss `TrimLeft` rekursiv sein?
> Koennte man nicht einfach `S extends ` ${infer Rest}`` einmal
> anwenden und fertig sein?
> **Kernpunkte:** Einmal entfernt nur EIN Leerzeichen | Mehrere
> aufeinanderfolgende Leerzeichen erfordern wiederholtes Entfernen |
> Rekursion ersetzt die Schleife

---

## Praxis: URL-Path-Parser

Das praktischste Beispiel fuer String-Parsing auf Type-Level:
Ein Router der URL-Parameter aus dem Pfad extrahiert.

```typescript annotated
// Extrahiere Parameter aus einem URL-Pfad:
// "/users/:id/posts/:postId" → { id: string; postId: string }

type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    // ^ Gibt es ":param" gefolgt von "/"?
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    // ^ Erstelle { param: string } und parse den Rest
    : Path extends `${string}:${infer Param}`
      // ^ Gibt es ":param" am Ende?
      ? { [K in Param]: string }
      // ^ Letzter Parameter
      : {};
      // ^ Kein Parameter mehr

type UserParams = ExtractParams<"/users/:id">;
// ^ { id: string }

type PostParams = ExtractParams<"/users/:userId/posts/:postId">;
// ^ { userId: string } & { postId: string }

type NoParams = ExtractParams<"/about">;
// ^ {}
```

### Den Router bauen

```typescript
// Typsicherer Route-Handler:
function createRoute<Path extends string>(
  path: Path,
  handler: (params: ExtractParams<Path>) => void
): void {
  // Runtime-Implementierung...
}

// Die Magie: TypeScript weiss was params enthaelt!
createRoute("/users/:userId/posts/:postId", (params) => {
  params.userId;  // string — autocomplete!
  params.postId;  // string — autocomplete!
  // params.foo;  // FEHLER: Property 'foo' does not exist
});
```

> ⚡ **Framework-Bezug Next.js:** Das App Router-System von Next.js
> verwendet genau dieses Pattern. Eine Datei `app/users/[id]/page.tsx`
> erzeugt automatisch den Typ `{ params: { id: string } }`:
>
> ```typescript
> // Next.js App Router — generiert automatisch durch das Framework:
> interface PageProps {
>   params: ExtractParams<"/users/[id]">;  // { id: string }
>   // Intern nutzt Next.js dieselbe Logik (mit "[]" statt ":")
> }
>
> export default function UserPage({ params }: PageProps) {
>   params.id;  // string — typsicher und mit Autocomplete!
> }
> ```

> ⚡ **Framework-Bezug Angular:** Angular's Router hat `ActivatedRoute.params`
> als `Observable<ParamMap>`. Das Problem: `paramMap.get('userId')` gibt
> `string | null` zurueck — ohne Compiler-Garantie dass `userId` im
> Pfad ueberhaupt definiert ist. Mit Type-Level-Parsing koenntest du
> eine typsichere Alternative bauen:
>
> ```typescript
> // Hypothetisch — wie es aussehen koennte:
> type AngularRoute<Path extends string> = {
>   params: ExtractParams<Path>;
> };
>
> // Dann im Komponenten-Code:
> // this.route.snapshot.params // wuerde { userId: string } sein, nicht ParamMap
> ```
>
> Der Unterschied: Mit Type-Level-Parsing wird der Typ automatisch aus
> dem Pfad-String abgeleitet — keine manuelle Interface-Definition noetig.

> 💭 **Denkfrage:** Was passiert wenn ein URL-Pfad optionale Parameter
> hat, z.B. `/users/:id?`? Wie wuerdest du das auf Type-Level
> modellieren?
>
> **Antwort:** Du koenntest pruefen ob der Parameter mit `?` endet:
> `Param extends `${infer Name}?`` → `{ [K in Name]?: string }`.
> Das macht den Parameter optional im resultierenden Typ. Genau so
> funktioniert es in Bibliotheken wie type-fest.

---

## Experiment: Query-String-Parser

Baue einen Typ der Query-Strings parst:

```typescript
// Ziel: "name=Max&age=30&city=Berlin"
//     → { name: string; age: string; city: string }

// Schritt 1: Split an "&"
type QueryPairs = Split<"name=Max&age=30&city=Berlin", "&">;
// ^ ["name=Max", "age=30", "city=Berlin"]

// Schritt 2: Extrahiere Key aus "key=value"
type ExtractKey<S extends string> =
  S extends `${infer Key}=${string}` ? Key : never;

type K = ExtractKey<"name=Max">;  // "name"

// Schritt 3: Kombiniere zu einem Objekt
type ParseQuery<S extends string> =
  S extends `${infer Pair}&${infer Rest}`
    ? { [K in ExtractKey<Pair>]: string } & ParseQuery<Rest>
    : S extends `${infer Key}=${string}`
      ? { [K in Key]: string }
      : {};

type Query = ParseQuery<"name=Max&age=30&city=Berlin">;
// ^ { name: string } & { age: string } & { city: string }

// Experiment: Erweitere ParseQuery so dass es auch "key" ohne "=value"
// behandelt (z.B. "verbose&debug" → { verbose: true; debug: true }).
// Tipp: Pruefe ob das Paar ein "=" enthaelt.
```

---

## Fallstricke beim String-Parsing

Bevor du diese Techniken einsetzt, ein wichtiger Hinweis zu Grenzen:

```typescript
// PROBLEM 1: Distributivitaet bei Unions
type TestSplit = Split<"a/b" | "c/d", "/">;
// ^ ["a", "b"] | ["c", "d"]  — Gut, funktioniert!

// PROBLEM 2: Leere Strings
type EmptySplit = Split<"", "/">;
// ^ [""]  — Nicht [], weil der leere String noch ein Element ist

// PROBLEM 3: Trennzeichen am Anfang/Ende
type SlashSplit = Split<"/users/", "/">;
// ^ ["", "users", ""]  — Leere Strings an Enden!

// Loesung: FilterEmpty kombinieren
type FilterEmpty<T extends string[]> = {
  [K in keyof T]: T[K] extends "" ? never : T[K]
}[number];

// PROBLEM 4: Verschachtelte Parameter
type Weird = ExtractParams<"/:a/:a">;
// ^ { a: string } — Duplikat wird ueberschrieben, kein Fehler!
```

Diese Faelle sind der Grund, warum Production-Libraries wie `path-to-regexp`
zusaetzliche Validierungslogik haben. Type-Level-Parsing deckt den
"happy path" ab — Kantenfall-Handling gehoert zur Laufzeit.

---

## Was du gelernt hast

- **Template Literal Types + `infer`** ermoeglichen String-Parsing zur Compilezeit
- **Split, Join, Replace, Trim** — klassische String-Operationen als reine Typ-Operationen
- **URL-Path-Parser**: Extrahiert Parameter-Namen aus Pfaden und erzeugt typisierte Objekte
- **Query-String-Parser**: Zerlegt Key-Value-Paare in ein typisiertes Objekt
- Grenzen: Leere Strings, Duplikate und Kantenfall-Handling brauchen zusaetzliche Typen oder Laufzeit-Validierung
- Dieses Pattern ist die Grundlage fuer typsichere Router in Next.js, tRPC und Express

> 🧠 **Erklaere dir selbst:** Warum ist String-Parsing auf Type-Level
> so viel wertvoller als ein generisches `Record<string, string>` fuer
> Route-Parameter? Was gewinnt der Entwickler konkret?
> **Kernpunkte:** Autocomplete fuer Parameter-Namen | Compile-Fehler
> bei Tippfehlern | Kein manuelles Typ-Mapping noetig | Typ und
> Definition sind immer synchron | Ein Refactoring des Pfad-Strings
> aktualisiert automatisch alle abhaengigen Typen

**Kernkonzept zum Merken:** String-Parsing auf Type-Level verwandelt unstrukturierte Strings in strukturierte Typen. Ein Pfad-String wie `"/users/:id"` wird zu `{ id: string }` — automatisch, sicher und ohne Runtime-Overhead. Der String ist die einzige Quelle der Wahrheit.

---

> **Pausenpunkt** — Du kannst jetzt Strings auf Type-Level parsen.
> Als naechstes vertiefen wir Pattern Matching mit Conditional Types.
>
> Weiter geht es mit: [Sektion 04: Pattern Matching mit Conditional Types](./04-pattern-matching.md)
