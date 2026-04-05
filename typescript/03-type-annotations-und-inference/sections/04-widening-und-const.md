# Sektion 4: Widening und const

**Geschaetzte Lesezeit:** ~10 Minuten

## Was du hier lernst

- Was **Widening** ist und warum TypeScript es tut
- Warum `let` und `const` verschiedene Typen produzieren -- und warum Objekt-Properties trotz `const` "widen"
- Wie `as const` funktioniert und wann du es einsetzt
- Praktische Patterns mit `as const` fuer Enum-Ersatz und Konfigurationen

---

## Denkfragen fuer diese Sektion

1. **Warum werden Object-Properties trotz `const` gewidened -- was ist das fundamentale Argument?**
2. **Welche DREI Dinge macht `as const` gleichzeitig?**

---

## Was ist Widening?

**Widening** (Erweiterung) ist TypeScripts Entscheidung, einen Literal-Typ zu seinem Basis-Typ zu **erweitern**. Es passiert automatisch und ist eine der haeufigsten Ueberraschungen fuer TypeScript-Entwickler.

### Die Analogie: Karton beschriften

Stell dir vor, du packst einen Apfel in einen Karton:

- **`const`** = Du klebst ein Etikett auf den Karton: "Enthalt: 1 Granny-Smith-Apfel". Der Karton ist versiegelt -- niemand kann den Inhalt austauschen.
- **`let`** = Du klebst ein Etikett auf den Karton: "Enthalt: Obst". Der Karton ist offen -- jemand koennte den Apfel durch eine Birne ersetzen. Also muss das Etikett breiter sein.

Das ist genau, was TypeScript tut:

```typescript
const greeting = "Hallo";    // Typ: "Hallo"     (Literal Type -- versiegelter Karton)
let   greeting2 = "Hallo";   // Typ: string       (Widened Type -- offener Karton)

const count = 42;             // Typ: 42           (Literal Type)
let   count2 = 42;            // Typ: number       (Widened Type)

const done = true;            // Typ: true         (Literal Type)
let   done2 = true;           // Typ: boolean      (Widened Type)
```

### Die Logik dahinter

TypeScript denkt vorausschauend:

- `const` kann **nie** einen anderen Wert bekommen. Also kann der Typ so eng wie moeglich sein -- der exakte Literal-Wert.
- `let` **kann** spaeter einen anderen Wert bekommen. Wenn `let x = 42` den Typ `42` haette, waere `x = 43` ein Fehler. Das waere unpraktisch. Also "widened" TS zu `number`.

---

## Warum das wichtig ist

Widening bestimmt, was du spaeter zuweisen kannst -- und ob dein Typ als Argument akzeptiert wird:

```typescript
let status = "loading";       // Typ: string  --  nicht "loading"!
status = "fertig";            // Erlaubt (ist ja string)
status = "irgendwas";         // Auch erlaubt -- vielleicht nicht gewollt!

// Loesung: Explizite Annotation mit Union-Typ
let status2: "loading" | "success" | "error" = "loading";
status2 = "irgendwas";       // FEHLER! Genau was wir wollen.
```

Noch kritischer bei Funktionsaufrufen:

```typescript
type Direction = "north" | "south" | "east" | "west";
function move(dir: Direction) { /* ... */ }

const dir1 = "north";   // Typ: "north"  -->  move(dir1) funktioniert
let dir2 = "north";     // Typ: string   -->  move(dir2) FEHLER!

// Weil: string ist nicht Direction -- "irgendein String" passt nicht
// in eine Union von vier konkreten Werten
```

---

## Widening bei Objekten -- die groesste Ueberraschung

```typescript
const config = {
  host: "localhost",   // Typ: string  (nicht "localhost"!)
  port: 3000,          // Typ: number  (nicht 3000!)
};
```

Moment -- `config` ist doch `const`! Warum sind die Properties trotzdem gewiden?

> **Denkfrage:** Warum gibt `const obj = { x: 10 }` den Typ `{ x: number }` und nicht `{ x: 10 }`?

**Antwort:** `const` schuetzt nur die **Variable selbst** vor Neuzuweisung. Du kannst `config = etwasAnderes` nicht schreiben. Aber du **kannst** die Properties aendern:

```typescript
config.host = "production.server.com";  // Erlaubt!
config.port = 8080;                      // Erlaubt!
```

Weil die Properties aenderbar sind, muss TypeScript den breiten Typ verwenden. `config.port` koennte spaeter `8080` sein -- also darf der Typ nicht `3000` sein.

### Die Loesung: `as const`

```typescript
const config = {
  host: "localhost",
  port: 3000,
} as const;

// config.host ist jetzt: "localhost"  (Literal Type)
// config.port ist jetzt: 3000         (Literal Type)
// UND: Alles ist readonly!

config.host = "other";  // FEHLER: Cannot assign to 'host' because it is a read-only property
```

`as const` macht drei Dinge gleichzeitig:

1. **Literal Types** statt Basis-Types fuer alle Werte
2. **readonly** fuer alle Properties (rekursiv, auch verschachtelte Objekte)
3. **Tuple statt Array** fuer Arrays: `[1, 2, 3]` wird `readonly [1, 2, 3]` statt `number[]`

---

## `as const` in der Praxis

### Pattern 1: Enum-Ersatz

```typescript annotated
const ROLES = ["admin", "user", "guest"] as const;
// ^ as const: readonly ["admin", "user", "guest"] statt string[]
type Role = (typeof ROLES)[number];
// ^ Ergebnis: "admin" | "user" | "guest" (Union aus Literal-Typen)

ROLES.includes(userInput as Role);
// ^ Laufzeit-Pruefung moeglich -- ROLES ist ein echtes Array
ROLES.forEach(role => /* ... */);
// ^ Iterierbar zur Laufzeit UND typsicher zur Compile-Zeit
```

> 🧠 **Erklaere dir selbst:** Warum widenet TypeScript die Properties eines `const`-Objekts, obwohl es bei `const x = "GET"` den Literal-Typ behaelt? Was schuetzt `const` genau -- die Variable oder den Inhalt?
> **Kernpunkte:** const schuetzt nur die Bindung (Variable) | Properties bleiben aenderbar | as const schuetzt den Inhalt | Deshalb: Objekt-Properties werden gewidenet

> **Hintergrund:** Viele TypeScript-Experten und das Angular-Team selbst bevorzugen `as const`-Arrays gegenueber Enums. Der Grund: Enums erzeugen Runtime-Code (ein JavaScript-Objekt), waehrend `as const` **zero-cost** ist -- es existiert nur im Typ-System und wird beim Kompilieren komplett entfernt. Ausserdem sind Enums nominell typisiert (ein `Role.Admin` aus Modul A ist nicht gleich einem aus Modul B), waehrend Literal Types strukturell sind.

### Pattern 2: Konfigurationsobjekte

```typescript
const API_CONFIG = {
  baseUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  endpoints: {
    users: "/users",
    posts: "/posts",
  },
} as const;

// Jetzt kannst du praezise Typen extrahieren:
type Endpoint = (typeof API_CONFIG.endpoints)[keyof typeof API_CONFIG.endpoints];
// Ergebnis: "/users" | "/posts"
```

### Pattern 3: Mapping-Objekte

```typescript
const STATUS_LABELS = {
  pending: "Ausstehend",
  active: "Aktiv",
  archived: "Archiviert",
} as const;

type StatusKey = keyof typeof STATUS_LABELS;
// "pending" | "active" | "archived"

type StatusLabel = (typeof STATUS_LABELS)[StatusKey];
// "Ausstehend" | "Aktiv" | "Archiviert"
```

---

## Widening-Regeln -- Komplettueberblick

| Deklaration | Wert | Inferierter Typ | Erklaerung |
|-------------|------|-----------------|------------|
| `const x =` | `"hello"` | `"hello"` | const Primitive = Literal |
| `let x =` | `"hello"` | `string` | let = Widened |
| `const x =` | `{ a: 1 }` | `{ a: number }` | Object Properties = Widened |
| `const x =` | `{ a: 1 } as const` | `{ readonly a: 1 }` | as const = Literal + Readonly |
| `const x =` | `[1, 2]` | `number[]` | Array = Widened |
| `const x =` | `[1, 2] as const` | `readonly [1, 2]` | as const = Tuple + Readonly |
| `function f()` | `return "x"` | `string` | Return = Widened |

> **Tieferes Wissen:** Es gibt eine subtile Stelle, wo Widening **nicht** passiert: Wenn ein Generic-Typ-Parameter direkt aus einem `const`-Argument inferiert wird. Bei `identity("hello")` inferiert TS `T = "hello"` (Literal), nicht `T = string`. Das liegt daran, dass Generic-Parameter als "Beobachtung" behandelt werden, nicht als "Zuweisung" -- und Beobachtungen koennen eng sein.

---

## Haeufige Widening-Falle: Funktionsargumente

```typescript
type Theme = "light" | "dark";

function setTheme(theme: Theme) { /* ... */ }

// Das funktioniert:
setTheme("light");  // "light" ist ein Literal  -->  passt in Theme

// Das funktioniert NICHT:
let selectedTheme = "light";  // Typ: string (gewiden!)
setTheme(selectedTheme);       // FEHLER: string ist nicht Theme

// Drei Loesungen:
// 1. const verwenden
const selectedTheme1 = "light";  // Typ: "light"  -->  OK

// 2. Explizit annotieren
let selectedTheme2: Theme = "light";  // Typ: Theme  -->  OK

// 3. as const beim Wert
let selectedTheme3 = "light" as const;  // Typ: "light"  -->  OK
```

> **Praxis-Tipp:** In Angular-Templates begegnest du diesem Problem haeufig bei `@Input()`-Properties:
> ```typescript
> // Component erwartet Theme
> @Input() theme: Theme = "light";
>
> // Template: Das funktioniert automatisch, weil Angular den Typ kennt
> // <app-widget [theme]="'dark'">
> ```

---

## Experiment-Box: Widening live beobachten

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Schritt 1: Objekt-Properties werden immer gewidened -- auch bei const!
> const obj = { x: 10 };
> // Hovere ueber 'obj.x' -- warum ist es 'number' und nicht '10'?
>
> // Schritt 2: as const verhindert Widening
> const objConst = { x: 10 } as const;
> // Hovere ueber 'objConst.x' -- was aendert sich?
>
> // Schritt 3: Versuch einer Zuweisung
> obj.x = 20;         // Erlaubt?
> // objConst.x = 20; // Erlaubt?
>
> // Schritt 4: Arrays mit und ohne as const
> const arr = [1, 2, 3];
> const arrConst = [1, 2, 3] as const;
> // Hovere -- was ist der Unterschied?
>
> // Bonus: Union-Typen aus Arrays ableiten
> type ArrElement = (typeof arrConst)[number];
> // Was ist ArrElement? Was waere es ohne as const?
> ```
>
> Erklaere in einem Satz: Warum schuetzt `const` bei Objekten die Properties NICHT vor Widening?

---

## Rubber-Duck-Prompt

Ein Kollege fragt: "Ich habe `const config = { port: 3000 }` geschrieben, aber wenn ich `config.port` an eine Funktion uebergebe, die `3000` erwartet, gibt es einen Fehler. Warum?"

Erklaere in 3 Saetzen:
1. Was Widening bei Objekten ist
2. Warum `const` bei Objekten die Properties nicht schuetzt
3. Wie `as const` das Problem loest

---

## Was du gelernt hast

- **Widening** erweitert Literal-Typen zu Basis-Typen bei `let`-Variablen und Objekt-Properties
- `const` bei Primitiven gibt Literal-Typen; bei Objekten **nicht** (weil Properties aenderbar sind)
- **`as const`** macht alles literal, readonly und verwandelt Arrays in Tuples
- Praktische Patterns: **Enum-Ersatz**, **Konfigurations-Objekte**, **Mapping-Typen**
- Die Widening-Falle bei Funktionsargumenten und wie du sie umgehst

---

**Pausenpunkt.** Wenn du bereit bist, geht es weiter mit [Sektion 5: Contextual Typing und Control Flow](./05-contextual-typing.md) -- dort lernst du die maechtigsten Inference-Faehigkeiten von TypeScript kennen.
