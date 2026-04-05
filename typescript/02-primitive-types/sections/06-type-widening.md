# Sektion 6: Type Widening und Literal Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - never, void, symbol, bigint](./05-never-void-symbol-bigint.md)
> Naechste Sektion: [Zurueck zur Uebersicht](../README.md) -- Weiter mit Examples, Exercises, Quiz

---

## Was du hier lernst

- Wie TypeScript entscheidet, ob ein Typ **eng** (Literal) oder **breit** (allgemein) ist
- Warum `const` und `let` zu **unterschiedlichen Typen** fuehren
- Wie `as const` funktioniert und warum es so maechtig ist

---

## Was ist Type Widening?

Wenn TypeScript den Typ einer Variable automatisch **inferiert** (erkennt),
trifft es eine Entscheidung: Soll der Typ **eng** (spezifisch) oder
**breit** (allgemein) sein?

Diese Entscheidung haengt davon ab, ob sich der Wert **aendern kann**.

```typescript
// const kann sich NICHT aendern -> TypeScript waehlt den ENGSTEN Typ
const name = "Max";    // Typ: "Max" (nicht string!)
const alter = 25;      // Typ: 25 (nicht number!)
const aktiv = true;    // Typ: true (nicht boolean!)

// let KANN sich aendern -> TypeScript waehlt den BREITEREN Typ
let name2 = "Max";     // Typ: string (weil es spaeter "Anna" sein koennte)
let alter2 = 25;       // Typ: number (weil es spaeter 30 sein koennte)
let aktiv2 = true;     // Typ: boolean (weil es spaeter false sein koennte)
```

### Die Analogie: Kisten beschriften

Stell dir vor, du beschriftest Kisten:
- **`const`** ist wie eine **versiegelte** Kiste: Du weisst genau was drin ist,
  also schreibst du "Roter Apfel" drauf (Literal Type).
- **`let`** ist wie eine **offene** Kiste: Der Inhalt koennte sich aendern,
  also schreibst du nur "Obst" drauf (breiter Typ).

> 📖 **Hintergrund: Warum hat TypeScript diese Designentscheidung getroffen?**
>
> Fruehere Versionen von TypeScript (vor 2.1) hatten kein Widening-Konzept —
> `const x = "hallo"` ergab `string`, genau wie `let`. Das aenderte sich
> mit TypeScript 2.1 (Dezember 2016), als **Literal Type Widening**
> eingefuehrt wurde.
>
> Die Logik dahinter: Wenn sich ein Wert nicht aendern kann (`const`),
> warum sollte TypeScript dann den Typ verbreitern? Der engste moegliche
> Typ gibt dir die **meiste Sicherheit**. Und wenn sich ein Wert aendern
> kann (`let`), waere ein Literal Type hinderlich — du koenntest der
> Variable nichts anderes zuweisen.
>
> Das ist ein Beispiel fuer TypeScript's Philosophie: **Sicherheit wo
> moeglich, Flexibilitaet wo noetig.**

---

## Was sind Literal Types?

Ein **Literal Type** ist ein Typ, der auf einen **exakten Wert**
eingeschraenkt ist. `"Max"` ist nicht einfach ein `string` — es ist
der Typ, der NUR den Wert `"Max"` erlaubt.

```typescript
// Literal Types fuer alle Primitives:
type Name = "Max";              // String Literal Type
type Antwort = 42;              // Number Literal Type
type Ja = true;                 // Boolean Literal Type

// Literal Types sind SUBTYPEN ihrer breiteren Typen:
//   "Max" ist ein Subtyp von string
//   42 ist ein Subtyp von number
//   true ist ein Subtyp von boolean
```

### Warum sind Literal Types wichtig?

Weil sie die Grundlage fuer **Union Types** und damit fuer einen
grossen Teil der TypeScript-Power sind:

```typescript
// Union aus Literal Types — wie ein Enum, aber flexibler:
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type StatusCode = 200 | 201 | 400 | 404 | 500;
type Feature = "darkMode" | "newUI" | "betaSearch";

// TypeScript prueft: nur diese exakten Werte sind erlaubt!
function sendRequest(method: HttpMethod, url: string): void { }
sendRequest("GET", "/api/users");    // OK
// sendRequest("PATCH", "/api/users"); // Error! "PATCH" ist nicht in HttpMethod
```

> ⚡ **Praxis-Tipp:** In Angular und React siehst du Literal Types staendig:
>
> ```typescript
> // Angular: ChangeDetectionStrategy ist intern ein Union
> type ChangeDetection = "Default" | "OnPush";
>
> // React: Props mit eingeschraenkten Werten
> type ButtonVariant = "primary" | "secondary" | "danger";
> type Size = "sm" | "md" | "lg";
>
> interface ButtonProps {
>   variant: ButtonVariant;
>   size?: Size;
> }
> ```

---

## Type Widening in Aktion: Die Objekt-Falle

Hier liegt die groesste Ueberraschung: **Objekt-Properties werden IMMER
gewidenet**, auch bei `const`:

```typescript
const config = {
  method: "GET",     // Typ: string (nicht "GET"!)
  url: "/api/users", // Typ: string (nicht "/api/users"!)
};
```

> 💭 **Denkfrage:** Warum widenet TypeScript die Properties eines
> `const`-Objekts, obwohl es bei `const x = "GET"` den Literal Type behaelt?
>
> **Antwort:** Weil `const` nur die **Variable** schuetzt, nicht den
> **Inhalt**. `const config = {...}` bedeutet: die Variable `config`
> kann nicht neu zugewiesen werden. Aber `config.method = "POST"` ist
> erlaubt! Die Properties eines Objekts sind veraenderbar, also
> widenet TypeScript sie.
>
> ```typescript
> const config = { method: "GET" };
> config.method = "POST";  // Erlaubt! config ist const, aber Properties nicht
>
> const name = "Max";
> // name = "Anna";        // Error! const schuetzt den Wert direkt
> ```

Das fuehrt zu einem haeufigen Problem:

```typescript
function fetchData(method: "GET" | "POST", url: string): void { /* ... */ }

const config = {
  method: "GET",
  url: "/api/users",
};

// fetchData(config.method, config.url);
// Error! Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'
```

### Drei Loesungen

**Loesung 1: `as const` auf dem Property**

```typescript
const config = {
  method: "GET" as const,  // Typ: "GET" (Literal Type)
  url: "/api/users",
};
fetchData(config.method, config.url);  // OK!
```

**Loesung 2: `as const` auf dem gesamten Objekt**

```typescript
const config = {
  method: "GET",
  url: "/api/users",
} as const;
// Typ: { readonly method: "GET"; readonly url: "/api/users" }
fetchData(config.method, config.url);  // OK!
```

**Loesung 3: Explizite Typ-Annotation**

```typescript
const config: { method: "GET" | "POST"; url: string } = {
  method: "GET",
  url: "/api/users",
};
fetchData(config.method, config.url);  // OK!
```

> 🔍 **Tieferes Wissen: satisfies — die eleganteste Loesung (seit TS 4.9)**
>
> ```typescript
> const config = {
>   method: "GET",
>   url: "/api/users",
> } satisfies { method: "GET" | "POST"; url: string };
>
> // config.method ist "GET" (Literal Type!) — nicht "GET" | "POST"
> fetchData(config.method, config.url);  // OK!
> ```
>
> `satisfies` prueft, ob der Wert zum Typ passt, aber **behaelt den
> engsten inferierten Typ** bei. Das ist das Beste aus beiden Welten:
> Typesicherheit UND Literal Types. Mehr dazu in Lektion 03.

---

## as const — der Literal-Type-Erzwinger

`as const` hat **drei Effekte** gleichzeitig:

1. Alle Properties werden **`readonly`**
2. Alle Werte werden **Literal Types**
3. Arrays werden **readonly Tuples**

```typescript
// Ohne as const:
const farben = ["rot", "gruen", "blau"];
// Typ: string[] — TypeScript denkt, das Array koennte sich aendern

// Mit as const:
const farben2 = ["rot", "gruen", "blau"] as const;
// Typ: readonly ["rot", "gruen", "blau"] — exakte Werte, unveraenderbar
```

### Das maechtiste Pattern: Union Type aus Array ableiten

```typescript annotated
const STATUS = ["aktiv", "inaktiv", "gesperrt"] as const;
// ^ as const: Array wird zu readonly Tuple mit Literal-Typen
type Status = typeof STATUS[number];
// ^ typeof: extrahiert den Typ des Laufzeitwerts
// ^ [number]: Indexed Access -- liefert Union aller Element-Typen
// ^ Ergebnis: "aktiv" | "inaktiv" | "gesperrt"
```

> 🧠 **Erklaere dir selbst:** Warum ergibt `typeof STATUS[number]` den Typ `"aktiv" | "inaktiv" | "gesperrt"` und nicht einfach `string`? Was wuerde passieren, wenn du `as const` weglassen wuerdest?
> **Kernpunkte:** as const verhindert Widening zu string[] | typeof extrahiert den Tuple-Typ | [number] greift auf alle numerischen Indizes zu | Ohne as const: string (gewidenet)

> 📖 **Hintergrund: typeof STATUS[number] — wie funktioniert das?**
>
> Das ist ein **Indexed Access Type**:
> - `typeof STATUS` ergibt den Typ des Arrays: `readonly ["aktiv", "inaktiv", "gesperrt"]`
> - `[number]` ist ein Index-Zugriff mit dem Typ `number` — das bedeutet
>   "alle Elemente, die mit einem numerischen Index erreichbar sind"
> - Das Ergebnis ist die Union aller Element-Typen: `"aktiv" | "inaktiv" | "gesperrt"`
>
> Dieses Pattern ersetzt in vielen Teams `enum` komplett, weil es
> **kein Laufzeit-Objekt** erzeugt (im Gegensatz zu `enum`) und trotzdem
> typsicher ist.

> ⚡ **Praxis-Tipp: as const in Angular/React**
>
> ```typescript
> // Angular: Route-Konfiguration typsicher
> const ROUTES = [
>   { path: 'home', component: HomeComponent },
>   { path: 'about', component: AboutComponent },
>   { path: 'contact', component: ContactComponent },
> ] as const;
> type RoutePath = typeof ROUTES[number]['path'];
> // Typ: "home" | "about" | "contact"
>
> // React: Action Types fuer Reducer
> const ACTIONS = ["increment", "decrement", "reset"] as const;
> type ActionType = typeof ACTIONS[number];
> // Typ: "increment" | "decrement" | "reset"
> ```

---

## Zusammenfassung: Type Widening Regeln

| Deklaration | Inferierter Typ | Warum |
|---|---|---|
| `const x = "hallo"` | `"hallo"` | const + Primitiv = Literal Type |
| `let x = "hallo"` | `string` | let koennte sich aendern = breiter Typ |
| `const obj = { a: 1 }` | `{ a: number }` | Objekt-Properties sind veraenderbar! |
| `const obj = { a: 1 } as const` | `{ readonly a: 1 }` | as const fixiert alles |
| `const arr = [1, 2, 3]` | `number[]` | Array-Elemente sind veraenderbar |
| `const arr = [1, 2, 3] as const` | `readonly [1, 2, 3]` | as const macht readonly Tuple |

> 🔍 **Tieferes Wissen: Wann widenet TypeScript NICHT?**
>
> Es gibt Stellen, wo TypeScript bewusst **nicht** widenet:
>
> ```typescript
> // 1. Bei expliziten Literal-Type-Annotationen:
> let x: "hallo" = "hallo";  // Typ bleibt "hallo", obwohl let
>
> // 2. Bei readonly Properties:
> interface Config {
>   readonly method: "GET";
> }
> const c: Config = { method: "GET" };  // method bleibt "GET"
>
> // 3. Bei Template Literal Types:
> type Greeting = `Hallo ${string}`;  // Bleibt eng
>
> // 4. Bei return-Werten in bestimmten Kontexten:
> function getMethod() { return "GET" as const; }
> const m = getMethod();  // Typ: "GET"
> ```

---

## Was du gelernt hast

- **Type Widening**: `const` + Primitiv = Literal Type, `let` = breiter Typ
- **Objekt-Falle**: Properties werden immer gewidenet, auch bei `const`-Objekten
- **as const**: Macht alles `readonly` + Literal + Tuple — drei Effekte gleichzeitig
- **Union aus Array**: `typeof ARRAY[number]` leitet Union Types aus `as const`-Arrays ab
- **satisfies**: Prueft den Typ ohne den inferierten Typ zu verlieren (seit TS 4.9)

**Kernkonzept zum Merken:** Widening ist TypeScript's Kompromiss zwischen Sicherheit und Flexibilitaet. `const` gibt dir Sicherheit (Literal Types), `let` gibt dir Flexibilitaet (breite Typen), und `as const` gibt dir Sicherheit fuer Objekte und Arrays.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> // as const: Vor und nach dem Hinzufuegen vergleichen
> const config = {
>   method: "GET",
>   retries: 3,
> };
> // Hover ueber config.method: Typ ist "string" (breit)
>
> const configConst = {
>   method: "GET",
>   retries: 3,
> } as const;
> // Hover ueber configConst.method: Typ ist "GET" (Literal!)
>
> // Array: mit und ohne as const
> const farben = ["rot", "gruen", "blau"] as const;
> type Farbe = typeof farben[number]; // "rot" | "gruen" | "blau"
>
> const farbenBreit = ["rot", "gruen", "blau"];
> type FarbeBreit = typeof farbenBreit[number]; // string — viel zu weit!
>
> // satisfies: Typ pruefen ohne Literal Types zu verlieren
> const obj = { x: 10, y: 20 } satisfies { x: number; y: number };
> // Hover ueber obj.x: ist es number oder 10?
> ```
> Hovere ueber `config.method` vs. `configConst.method` — siehst du den
> Unterschied zwischen `string` und dem Literal Type `"GET"`?
> Entferne `as const` bei `farben` und schau was `Farbe` dann ist.
> Bei `satisfies`: ist `obj.x` der Typ `number` oder `10`?

---

## Das Gesamtbild: Alle Primitive Types

```
  Compilezeit (tsc)              Laufzeit (JS Engine)
  ─────────────────              ────────────────────
  string, number, boolean        typeof === "string", "number", "boolean"
  null, undefined                null, undefined (gleich)
  symbol, bigint                 typeof === "symbol", "bigint"
  void, never                    existieren NICHT
  any, unknown                   existieren NICHT
  Literal Types ("GET", 42)      existieren NICHT
  Union Types (A | B)            existieren NICHT

  TypeScript = Compilezeit-Sicherheit + JavaScript-Laufzeit
```

---

## Naechste Schritte

Du hast alle sechs Sektionen abgeschlossen. Jetzt festigen wir das Wissen:

1. **Quiz** starten — teste dein Verstaendnis mit den 15+ Fragen dieser Lektion
2. **Cheatsheet** oeffnen — kompakte Referenz aller Primitive Types auf einen Blick
3. **Naechste Lektion**: L03 — Objekte, Interfaces und Type Aliases
4. **Loesungen** in `solutions/` vergleichen
5. **Cheatsheet** (`cheatsheet.md`) als Schnellreferenz behalten

### Reflexionsfragen

Beantworte diese Fragen fuer dich selbst, um dein Verstaendnis zu pruefen:

1. Warum kann TypeScript nicht garantieren, dass `JSON.parse()` einen
   bestimmten Typ zurueckgibt?
2. Warum ist `const x = "hallo"` vom Typ `"hallo"` und nicht `string`?
3. Was wuerde passieren, wenn `any` nicht existieren wuerde?
4. Warum ist `0.1 + 0.2 !== 0.3` kein TypeScript-Bug?
5. In welcher Situation wuerdest du `bigint` statt `number` verwenden?

---

> **Ende der Lektion** -- Du hast jetzt ein tiefes Verstaendnis aller
> primitiven Typen in TypeScript. Die naechste Lektion baut darauf auf.
>
> **Naechste Lektion:** [03 - Type Annotations und Type Inference](../../03-type-annotations-inference/README.md)
