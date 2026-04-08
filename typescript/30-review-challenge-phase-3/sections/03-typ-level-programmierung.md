# Sektion 3: Typ-Level-Programmierung in der Praxis

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Pattern-Kombination](./02-pattern-kombination.md)
> Naechste Sektion: [04 - Framework-Integration](./04-framework-integration.md)

---

## Was du hier lernst

- Wie Phase-2-Konzepte (Mapped, Conditional, Template Literal Types) mit Phase-3-Konzepten interagieren
- Wie du rekursive Conditional Types fuer reale Probleme einsetzt
- Wie Varianz und Generics bei Type-Level-Berechnungen zusammenspielen
- Praxisnahe Typ-Level-Challenges die alle Phasen verbinden

---

## Recap: Das Triumvirat trifft Phase 3
<!-- section:summary -->
In Phase 2 hast du das "Triumvirat" gelernt: Mapped Types (L16),

<!-- depth:standard -->
In Phase 2 hast du das "Triumvirat" gelernt: Mapped Types (L16),
Conditional Types (L17), Template Literal Types (L18). In Phase 3
hast du Werkzeuge kennengelernt, die diese Grundbausteine erweitern:

```
Phase 2:                    Phase 3:
Mapped Types (L16)    ←→    Recursive Types (L23)
Conditional Types (L17) ←→  Advanced Generics (L22)
Template Literals (L18) ←→  Branded Types (L24)
```

Zusammen ermoeglichen sie **beliebig komplexe Typ-Transformationen**.
Schauen wir uns das in der Praxis an.

---

<!-- /depth -->
## Challenge 1: Type-safe API-Client
<!-- section:summary -->
Du willst einen API-Client bauen, der die Endpunkte aus einem

<!-- depth:standard -->
Du willst einen API-Client bauen, der die Endpunkte aus einem
Typ ableitet — mit Branded Types fuer die IDs:

```typescript annotated
// API-Definition als Typ:
type ApiRoutes = {
  '/users': { GET: User[]; POST: User };
  '/users/:id': { GET: User; PUT: User; DELETE: void };
  '/posts': { GET: Post[]; POST: Post };
};

// Schritt 1: Parameter aus Route extrahieren (L18 — Template Literals)
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;
// ^ Rekursive Template-Literal-Extraktion!

type Test1 = ExtractParams<'/users/:id'>;
// ^ "id"

type Test2 = ExtractParams<'/orgs/:orgId/members/:memberId'>;
// ^ "orgId" | "memberId"

// Schritt 2: Branded IDs fuer Parameter (L24)
type ParamMap<T extends string> = {
  [K in ExtractParams<T>]: string & { readonly __brand: K };
};
// ^ Jeder Parameter bekommt seinen eigenen Brand!

type UserParams = ParamMap<'/users/:id'>;
// ^ { id: string & { __brand: 'id' } }

// Schritt 3: Der typsichere Client (L22 — Generics)
type ApiClient = {
  [Route in keyof ApiRoutes]: {
    [Method in keyof ApiRoutes[Route]]:
      ExtractParams<Route & string> extends never
        ? () => Promise<ApiRoutes[Route][Method]>
        // ^ Keine Parameter → keine Argumente
        : (params: ParamMap<Route & string>) =>
            Promise<ApiRoutes[Route][Method]>;
        // ^ Mit Parametern → Branded Params als Argument
  };
};
```

> 📖 **Hintergrund: Type-Level Programming in der echten Welt**
>
> Dieses Pattern ist nicht akademisch — Libraries wie tRPC, Hono
> und Elysia nutzen genau diese Technik. tRPC extrahiert die
> Input/Output-Typen aus der API-Definition und erzeugt einen
> vollaendig typsicheren Client. Die Idee geht auf Giulio Canti
> zurueck, der mit io-ts und fp-ts zeigte, dass TypeScript's
> Typsystem maechtiger ist als die meisten denken.

> 💭 **Denkfrage:** Welche Phase-2-Konzepte werden in diesem Beispiel
> kombiniert? Zaehle sie auf.
>
> **Antwort:** (1) Template Literal Types fuer Route-Parsing,
> (2) Mapped Types fuer den Client-Typ, (3) Conditional Types fuer
> die Unterscheidung mit/ohne Parameter, (4) Generics fuer die
> Route/Method-Typparameter, (5) infer fuer die Parameter-Extraktion.

---

<!-- /depth -->
## Challenge 2: DeepBrand — Rekursive Branded Types
<!-- section:summary -->
Wie wuerdest du ALLE string-Felder in einem verschachtelten Objekt

<!-- depth:standard -->
Wie wuerdest du ALLE string-Felder in einem verschachtelten Objekt
automatisch zu NonEmptyString branden?

```typescript annotated
type NonEmptyString = string & { readonly __brand: 'NonEmpty' };

// Schritt 1: Rekursiver Typ (L23 + L17)
type DeepBrand<T> =
  T extends string
    ? NonEmptyString
    // ^ Basis: string → NonEmptyString
  : T extends (infer U)[]
    ? DeepBrand<U>[]
    // ^ Array: rekursiv auf Elemente anwenden (L23)
  : T extends object
    ? { [K in keyof T]: DeepBrand<T[K]> }
    // ^ Objekt: Mapped Type + Rekursion (L16 + L23)
  : T;
    // ^ Alles andere: unveraendert

// Test:
type UserInput = {
  name: string;
  address: {
    street: string;
    city: string;
    zip: number;
    // ^ number bleibt number — nur strings werden gebranded
  };
  tags: string[];
};

type BrandedUser = DeepBrand<UserInput>;
// Ergebnis:
// {
//   name: NonEmptyString;
//   address: {
//     street: NonEmptyString;
//     city: NonEmptyString;
//     zip: number;
//   };
//   tags: NonEmptyString[];
// }
```

> 🧠 **Erklaere dir selbst:** Warum ist die Reihenfolge der
> extends-Pruefungen wichtig? Was passiert, wenn du `T extends object`
> VOR `T extends string` pruefst?
> **Kernpunkte:** In JavaScript ist string KEIN Objekt (Primitiv) |
> ABER: TypeScript's extends prueft Zuweisbarkeit | string extends
> object ist false | Trotzdem: Reihenfolge matters bei Unions |
> Array vor object, weil Arrays auch objects sind

---

<!-- /depth -->
## Challenge 3: Varianz bei rekursiven Typen
<!-- section:summary -->
Wie interagiert Varianz (L22) mit rekursiven Typen (L23)?

<!-- depth:standard -->
Wie interagiert Varianz (L22) mit rekursiven Typen (L23)?

```typescript annotated
// Kovarianter Container (L22):
interface Tree<out T> {
  value: T;
  children: Tree<T>[];
  // ^ Rekursiv! (L23)
}

// Weil Tree kovariant ist:
declare const dogTree: Tree<Dog>;
const animalTree: Tree<Animal> = dogTree;
// ^ OK! Tree<Dog> ist Tree<Animal> zuweisbar (Kovarianz)
// Das funktioniert AUCH fuer die verschachtelten children!

// Kontravarianter Visitor (L22):
interface TreeVisitor<in T> {
  visit(node: T): void;
  visitChildren(children: T[]): void;
}

// Weil TreeVisitor kontravariant ist:
declare const animalVisitor: TreeVisitor<Animal>;
const dogVisitor: TreeVisitor<Dog> = animalVisitor;
// ^ OK! TreeVisitor<Animal> ist TreeVisitor<Dog> zuweisbar (Kontravarianz)
```

> 🔬 **Experiment:** Was passiert, wenn du `Tree` invariant machst
> (sowohl lesen als auch schreiben)?
>
> ```typescript
> interface MutableTree<T> {
>   value: T;            // out-Position (lesen)
>   children: MutableTree<T>[];
>   setValue(v: T): void; // in-Position (schreiben)
> }
>
> declare const dogTree: MutableTree<Dog>;
> // const animalTree: MutableTree<Animal> = dogTree;
> // ^ Fehler! MutableTree ist invariant
> // Dog-Tree als Animal-Tree verwenden wuerde erlauben,
> // setValue(cat) aufzurufen — Cat ist kein Dog!
> ```

---

<!-- /depth -->
## Challenge 4: Typ-Level String-Parsing
<!-- section:summary -->
Template Literal Types + Recursive Types = ein Parser auf Typ-Level:

<!-- depth:standard -->
Template Literal Types + Recursive Types = ein Parser auf Typ-Level:

```typescript annotated
// Einen CSS-Farbwert parsen (vereinfacht):
type ParseColor<S extends string> =
  S extends `#${infer Hex}`
    ? Hex extends `${infer _}${infer _}${infer _}${infer _}${infer _}${infer _}`
      ? { type: 'hex'; value: S }
      // ^ 6-stelliger Hex-Code
      : { type: 'invalid'; reason: 'Hex muss 6 Zeichen haben' }
  : S extends `rgb(${infer _})`
    ? { type: 'rgb'; value: S }
    // ^ rgb()-Notation
  : S extends `${infer Name}`
    ? { type: 'named'; value: Name }
    // ^ Benannte Farbe
  : never;

type Test1 = ParseColor<'#ff0000'>;
// ^ { type: 'hex'; value: '#ff0000' }

type Test2 = ParseColor<'rgb(255,0,0)'>;
// ^ { type: 'rgb'; value: 'rgb(255,0,0)' }

type Test3 = ParseColor<'red'>;
// ^ { type: 'named'; value: 'red' }
```

> ⚡ **Praxis-Tipp:** In React-Projekten mit styled-components oder
> Tailwind CSS gibt es Libraries die Template-Literal-Types fuer
> CSS-Validierung verwenden. In Angular ist das weniger verbreitet,
> aber fuer Custom-Design-Systeme kann das Pattern nuetzlich sein —
> z.B. um sicherzustellen, dass nur gueltige Theme-Farben verwendet
> werden.

---

<!-- /depth -->
## Die Grenzen der Typ-Level-Programmierung
<!-- section:summary -->
Nicht alles SOLLTE auf Typ-Level geloest werden:

<!-- depth:standard -->
Nicht alles SOLLTE auf Typ-Level geloest werden:

```typescript annotated
// ZU komplex — besser als Runtime-Validierung:
// type ValidateEmail<S extends string> = ...
// ^ Einen vollstaendigen Email-Validator auf Typ-Level zu bauen
// ist moeglich, aber unleserlich und langsam

// Besser: Branded Type + Runtime-Validierung (L24):
type Email = string & { readonly __brand: 'Email' };
function parseEmail(s: string): Email | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s as Email : null;
}
// ^ Runtime-Check + Branded Type = pragmatisch und sicher
```

> 📖 **Hintergrund: Type-Level Turing-Vollstaendigkeit**
>
> TypeScripts Typsystem ist Turing-vollstaendig — du kannst
> theoretisch jeden Algorithmus auf Typ-Level ausdruecken.
> Es gibt Implementierungen von Tetris, einem SQL-Parser und
> sogar einem vollstaendigen TypeScript-Compiler — alles nur
> auf Typ-Level. Aber: Nur weil du es KANNST, heisst nicht,
> dass du es SOLLTEST. Die Compile-Zeit explodiert, Fehlermeldungen
> werden unleserlich, und Kollegen verstehen den Code nicht.
>
> **Faustregel:** Typ-Level-Logik fuer API-Contracts und
> Konfigurationen. Runtime-Logik fuer Geschaeftsregeln und
> Validierung.

> 💭 **Denkfrage:** Wo ist die Grenze zwischen "nuetzlicher
> Typ-Level-Programmierung" und "Overengineering"?
>
> **Ueberlegung:** Typ-Level-Logik lohnt sich, wenn (1) der Typ
> oft wiederverwendet wird, (2) Fehler teuer sind (API-Contracts),
> (3) das Team den Typ versteht. Sie lohnt sich NICHT, wenn
> (1) der Typ nur einmal verwendet wird, (2) eine Runtime-Pruefung
> reicht, (3) die Fehlermeldungen unlesbar werden.

---

<!-- /depth -->
## Was du gelernt hast

- Template Literal Types + Recursive Types ermoeglichen Typ-Level-Parsing
- Varianz (L22) funktioniert korrekt mit rekursiven Typen (L23)
- DeepBrand kombiniert Mapped Types, Conditional Types und Rekursion
- Typ-Level-Programmierung hat Grenzen — Runtime-Validierung + Branded Types ist oft pragmatischer

> 🧠 **Erklaere dir selbst:** Wann lohnt sich Typ-Level-Programmierung
> und wann ist Runtime-Validierung + Branded Types besser?
> **Kernpunkte:** Typ-Level fuer API-Contracts und Framework-Typen |
> Runtime fuer Geschaeftslogik und User-Input | Faustregel:
> Wenn die Fehlermeldung unleserlich wird, ist es zu komplex |
> Branded Types als pragmatischer Mittelweg

**Kernkonzept zum Merken:** Das Triumvirat (Phase 2) plus Rekursion,
Varianz und Branded Types (Phase 3) bilden zusammen ein vollstaendiges
Typ-Level-Programmiersystem. Die Kunst liegt darin zu wissen, WANN
man es einsetzt — und wann nicht.

---

> **Pausenpunkt** -- Typ-Level-Challenges gemeistert. Naechstes Thema:
> Wie integriert sich das alles in Angular und React?
>
> Weiter geht es mit: [Sektion 04: Framework-Integration](./04-framework-integration.md)
