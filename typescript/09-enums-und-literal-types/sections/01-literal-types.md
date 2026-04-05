# Sektion 1: Literal Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Numerische Enums](./02-numerische-enums.md)

---

## Was du hier lernst

- Warum TypeScript zwischen `string` und `"GET"` unterscheidet
- Wie **const** automatisch Literal Types erzeugt (und **let** nicht)
- Warum `as const` die maechtigste Assertion in TypeScript ist
- Boolean Literal Types und ihre Rolle bei Overloads

---

## Literal Types: Der praeziseste Typ

In Lektion 02 hast du gelernt, dass `const x = "hallo"` den Typ `"hallo"` hat,
nicht `string`. Das war Type Widening. Jetzt gehen wir tiefer.

> **Ein Literal Type ist ein Typ, der genau EINEN Wert repraesentiert.**
> `"GET"` ist nicht einfach ein String — es ist der Typ, der NUR den Wert
> `"GET"` akzeptiert.

```typescript annotated
// Literal Type: Nur DIESER eine Wert ist erlaubt
const method: "GET" = "GET";
// ^ Typ ist "GET" — nicht string

// Breiterer Typ: Jeder String ist erlaubt
let method2: string = "GET";
// ^ Typ ist string — "POST", "DELETE", alles geht
```

### Die drei Arten von Literal Types

TypeScript kennt drei Kategorien:

```typescript annotated
// 1. String Literal Types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
// ^ Nur diese vier Werte sind gueltig

// 2. Number Literal Types
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
// ^ Nur ganzzahlige Wuerfelwerte

// 3. Boolean Literal Types
type True = true;
type False = false;
// ^ boolean ist eigentlich true | false
```

> 🧠 **Erklaere dir selbst:** Wenn `boolean` eigentlich `true | false` ist —
> was bedeutet das fuer die Typhierarchie? Ist `true` ein Subtyp von `boolean`?
> **Kernpunkte:** Ja, true ist Subtyp von boolean | boolean = true | false ist ein Union | Jeder Literal Type ist Subtyp seines breiten Typs

---

## const vs let: Automatische Literal Types

TypeScript entscheidet basierend auf der Deklaration, ob ein Literal Type
oder ein breiter Typ inferiert wird:

```typescript annotated
const name = "Max";
// ^ Typ: "Max" — const kann sich nie aendern, also weiss TS den exakten Wert

let name2 = "Max";
// ^ Typ: string — let koennte sich aendern, also der breite Typ

const alter = 30;
// ^ Typ: 30

let alter2 = 30;
// ^ Typ: number

const aktiv = true;
// ^ Typ: true

let aktiv2 = true;
// ^ Typ: boolean
```

### Warum ist das wichtig?

Weil Funktionen oft **spezifische Literal Types** erwarten:

```typescript annotated
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}

const dir1 = "north";
// ^ Typ: "north" — passt zu Direction
move(dir1);  // OK

let dir2 = "north";
// ^ Typ: string — passt NICHT zu Direction
// move(dir2);  // Error! string ist nicht Direction
```

> 📖 **Hintergrund: Warum dieses Design?**
>
> Anders Hejlsberg erklaerte das Design so: Wenn du `const x = "hello"`
> schreibst, signalisierst du dem Compiler: "Dieser Wert aendert sich nie."
> Also kann TypeScript den praezisesten Typ waehlen. Bei `let` signalisierst
> du: "Dieser Wert KOENNTE sich aendern" — und TypeScript waehlt den
> breitesten Typ, der noch sicher ist.
>
> Das ist kein Zufall, sondern ein fundamentales Designprinzip: **Praezision
> bei Sicherheit, Breite bei Flexibilitaet.**

---

## as const: Die maechtigste Assertion

Was passiert bei Objekten? Selbst mit `const` werden Properties breit inferiert:

```typescript annotated
const config = {
  method: "GET",
  url: "/api/users",
  retries: 3,
};
// ^ Typ: { method: string; url: string; retries: number }
// NICHT: { method: "GET"; url: "/api/users"; retries: 3 }
```

Warum? Weil `const` nur die **Variable** schuetzt, nicht die **Properties**.
Du koenntest `config.method = "POST"` schreiben. TypeScript muss also
`string` annehmen.

**Die Loesung: `as const`**

```typescript annotated
const config = {
  method: "GET",
  url: "/api/users",
  retries: 3,
} as const;
// ^ Typ: { readonly method: "GET"; readonly url: "/api/users"; readonly retries: 3 }
```

`as const` macht **drei Dinge gleichzeitig**:

1. **Alle Properties werden `readonly`** — keine Aenderung moeglich
2. **Alle Werte werden Literal Types** — "GET" statt string
3. **Arrays werden readonly Tuples** — `readonly ["a", "b"]` statt `string[]`

```typescript annotated
// Ohne as const:
const methods = ["GET", "POST", "PUT"];
// ^ Typ: string[]

// Mit as const:
const methods2 = ["GET", "POST", "PUT"] as const;
// ^ Typ: readonly ["GET", "POST", "PUT"]

// Union Type aus as const Array ableiten:
type Method = typeof methods2[number];
// ^ Typ: "GET" | "POST" | "PUT"
```

> 🧠 **Erklaere dir selbst:** Warum braucht man `typeof methods2[number]` statt
> einfach `methods2[number]`? Was ist der Unterschied zwischen dem Wert `methods2`
> und dem Typ `typeof methods2`?
> **Kernpunkte:** methods2 ist ein Laufzeit-Wert | typeof extrahiert den Compile-Zeit-Typ | [number] greift auf alle Index-Positionen zu | Ergebnis ist ein Union der Elemente

> 💭 **Denkfrage:** Was passiert, wenn du `as const` auf ein verschachteltes
> Objekt anwendest — wird `readonly` auch auf innere Objekte angewendet?
>
> **Antwort:** Ja! `as const` wirkt **rekursiv** (deep readonly). Jede Ebene
> wird readonly und behaelt Literal Types. Das ist der Unterschied zu
> `Object.freeze()`, das nur die erste Ebene einfriert (shallow freeze).

---

## Boolean Literal Types und Overloads

Ein fortgeschrittenes Pattern: Funktionen, deren Rueckgabetyp vom
boolean-Parameter abhaengt:

```typescript annotated
// Ohne Overloads: Rueckgabe ist immer string | string[]
function getUser(id: number, asArray: boolean): string | string[] {
  return asArray ? [String(id)] : String(id);
}

// Mit Boolean Literal Overloads: Praeziser!
function getUserV2(id: number, asArray: true): string[];
function getUserV2(id: number, asArray: false): string;
function getUserV2(id: number, asArray: boolean): string | string[] {
  return asArray ? [String(id)] : String(id);
}

const single = getUserV2(1, false);
// ^ Typ: string — nicht string | string[]!
const multi = getUserV2(1, true);
// ^ Typ: string[] — praezise!
```

> 🔍 **Tieferes Wissen: Literal Type Widening bei Funktionsparametern**
>
> Wenn du einen Literal Type als Parameter uebergibst, behaelt TypeScript
> den Literal Type bei — aber nur wenn die Funktion ihn erwartet:
>
> ```typescript
> function log(msg: string) { console.log(msg); }
> log("hello");  // "hello" wird zu string geweitert
>
> function logLiteral(msg: "hello" | "world") { console.log(msg); }
> logLiteral("hello");  // "hello" bleibt "hello"
> ```
>
> Das ist ein Spezialfall von Type Widening: Literal Types werden nur
> geweitert, wenn der Zieltyp breiter ist.

---

## Was du gelernt hast

- **Literal Types** repraesentieren genau einen Wert: `"GET"`, `42`, `true`
- **const** erzeugt automatisch Literal Types bei Primitives, **let** erzeugt breite Typen
- **as const** fixiert alles: readonly, Literal Types, Tuples — auch rekursiv
- **Boolean Literal Types** ermoeglichen praezise Overloads
- Mit `typeof arr[number]` leitet man Union Types aus `as const` Arrays ab

> 🧠 **Erklaere dir selbst:** Was sind die drei Effekte von `as const` und warum
> braucht man sie alle drei?
> **Kernpunkte:** readonly verhindert Aenderung | Literal Types erhalten Praezision | Tuples fixieren Laenge und Position | Zusammen ergibt das eine vollstaendig typsichere Konstante

**Kernkonzept zum Merken:** Literal Types sind die Grundlage fuer fast alles in TypeScript — Union Types, Discriminated Unions, Template Literal Types, und Exhaustive Checks bauen alle darauf auf.

> ⚡ **In deinem Angular-Projekt:**
>
> ```typescript
> // Component Input mit Literal Types — praeziser als string:
> @Component({ selector: 'app-button', template: '...' })
> export class ButtonComponent {
>   @Input() variant: "primary" | "secondary" | "danger" = "primary";
>   @Input() size: "sm" | "md" | "lg" = "md";
> }
>
> // Route-Konfiguration mit as const:
> const ROUTES = [
>   { path: "dashboard", title: "Dashboard" },
>   { path: "settings",  title: "Einstellungen" },
>   { path: "profile",   title: "Profil" },
> ] as const;
>
> type AppPath = typeof ROUTES[number]["path"];
> // ^ "dashboard" | "settings" | "profile"
> // Tippfehler in RouterLink werden sofort erkannt!
> ```
>
> In React gilt das gleiche Prinzip fuer Props:
> `<Button variant="primary">` statt `<Button variant="irgendwas">`.
> Die Literal Types machen Props selbst-dokumentierend.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> // Mit as const: Alles wird fixiert
> const config = {
>   apiUrl: "https://api.example.com",
>   retries: 3,
>   method: "GET",
> } as const;
> // Hover ueber config.method — was ist der Typ?
>
> // Ohne as const: Properties werden breit inferiert
> const config2 = {
>   apiUrl: "https://api.example.com",
>   retries: 3,
>   method: "GET",
> };
> // Hover ueber config2.method — was ist der Typ jetzt?
>
> // Union Type aus as const ableiten:
> const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
> type HttpMethod = typeof METHODS[number];
> // Hover ueber HttpMethod — was ergibt sich?
> ```
> Erklaere den Unterschied zwischen `config.method` (mit `as const`)
> und `config2.method` (ohne). Warum ist `"GET"` praeziser als `string`?

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du hast die Grundlage
> fuer alles Weitere in dieser Lektion verstanden.
>
> Weiter geht es mit: [Sektion 02: Numerische Enums](./02-numerische-enums.md)
