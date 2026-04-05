# Sektion 1: Union Types — Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Type Guards und Narrowing](./02-type-guards-und-narrowing.md)

---

## Was du hier lernst

- Was der `|` Operator bedeutet und wie Union Types funktionieren
- Wie du Union Types aus **Primitives** und **Literal Values** bildest
- Wann **Literal Unions** besser sind als **Enums**
- Die Mengenlehre hinter Union Types

---

## Das Konzept: "Entweder ... oder"

In den bisherigen Lektionen hast du Variablen gesehen, die genau einen
Typ haben: `string`, `number`, `boolean`. Aber was, wenn ein Wert
**mehrere Typen** annehmen kann?

```typescript
// Ohne Union Types — das ist zu restriktiv:
function formatId(id: string): string {
  return `ID: ${id}`;
}
formatId("abc-123");  // OK
// formatId(42);       // Error! number ist nicht string
```

Die Loesung: **Union Types** mit dem `|`-Operator:

```typescript annotated
function formatId(id: string | number): string {
//                    ^^^^^^^^^^^^^^^^
//                    Union Type: id kann string ODER number sein
  return `ID: ${id}`;
}

formatId("abc-123");  // OK — string
formatId(42);          // OK — number
// formatId(true);     // Error! boolean ist nicht string | number
```

> 📖 **Hintergrund: Union Types in der Mengenlehre**
>
> Der Name "Union" kommt aus der Mengenlehre. Die **Vereinigung** (Union)
> zweier Mengen A und B enthaelt alle Elemente, die in A **oder** in B
> (oder in beiden) enthalten sind. In TypeScript:
>
> - `string` ist die Menge aller moeglichen String-Werte
> - `number` ist die Menge aller moeglichen Number-Werte
> - `string | number` ist die Vereinigung beider Mengen
>
> Das erklaert auch, warum TypeScript bei einem Union Type nur Operationen
> erlaubt, die fuer **alle** Mitglieder gelten — denn der Wert koennte
> aus jeder der beteiligten Mengen stammen.

### Nur gemeinsame Operationen erlaubt

Das ist die **wichtigste Regel** bei Union Types: Ohne Pruefung erlaubt
TypeScript nur Operationen, die fuer **alle** Mitglieder des Union gelten:

```typescript annotated
function process(value: string | number) {
  // Gemeinsame Methoden — OK:
  value.toString();    // string und number haben beide toString()
  value.valueOf();     // string und number haben beide valueOf()

  // NUR string — FEHLER:
  // value.toUpperCase();  // Error! number hat kein toUpperCase
  // ^ Property 'toUpperCase' does not exist on type 'string | number'

  // NUR number — FEHLER:
  // value.toFixed(2);     // Error! string hat kein toFixed
}
```

> 💭 **Denkfrage:** Warum laesst TypeScript `value.toString()` zu, aber
> nicht `value.toUpperCase()`, obwohl der Wert zur Laufzeit ein String
> sein KOENNTE?
>
> **Antwort:** TypeScript denkt statisch (zur Compilezeit). Es weiss
> nicht, welchen konkreten Wert `value` haben wird. Es muss davon
> ausgehen, dass `value` JEDER der Union-Mitglieder sein koennte.
> Nur Operationen, die fuer ALLE gelten, sind sicher. Um spezifische
> Operationen zu nutzen, brauchst du **Type Narrowing** (Sektion 2).

---

## Literal Unions — Typen fuer konkrete Werte

Union Types werden besonders maechtig mit **Literal Types**. Statt
allgemeiner Typen wie `string` kannst du konkrete Werte als Typen
verwenden:

```typescript annotated
// Literal Union: Nur diese drei Werte sind erlaubt
type Direction = "north" | "south" | "east" | "west";
//               ^^^^^^^   ^^^^^^^   ^^^^^^   ^^^^^^
//               Jeder String-Literal ist ein eigener Typ

let heading: Direction = "north";  // OK
heading = "south";                  // OK
// heading = "up";                  // Error! "up" ist nicht in Direction
```

Das funktioniert mit allen Literal-Typen — nicht nur Strings:

```typescript
// Nummer-Literal-Union
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
const wurf: DiceValue = 4;   // OK
// const falsch: DiceValue = 7; // Error!

// Boolean-Literal (selten, aber moeglich)
type Bit = 0 | 1;
const on: Bit = 1;

// Gemischte Literal-Union
type StatusCode = 200 | 301 | 404 | 500 | "unknown";
```

### Warum Literal Unions so wertvoll sind

Literal Unions geben dir **Autovervollstaendigung** in der IDE und
**Compile-Zeit-Sicherheit**:

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function sendRequest(method: HttpMethod, url: string): void {
  console.log(`${method} ${url}`);
}

sendRequest("GET", "/api/users");   // OK — IDE zeigt alle 5 Optionen
sendRequest("POST", "/api/users");  // OK
// sendRequest("DELET", "/api/users"); // Error! Tippfehler sofort erkannt
```

> 🧠 **Erklaere dir selbst:** Warum erkennt TypeScript den Tippfehler
> "DELET" in der letzten Zeile? Was passiert intern?
> **Kernpunkte:** `"DELET"` ist kein Mitglied des Union Types `HttpMethod` |
> TypeScript prueft den exakten String-Wert | Literal Types sind Subtypen von string

---

## Union Types vs Enum — Wann was?

In vielen Sprachen (Java, C#) wuerdest du ein Enum verwenden. TypeScript
hat auch `enum`, aber Literal Unions sind oft die bessere Wahl:

```typescript
// ─── Variante 1: enum ─────────────────────────────
enum DirectionEnum {
  North = "NORTH",
  South = "SOUTH",
  East = "EAST",
  West = "WEST",
}
// Erzeugt Laufzeit-Code! (ein JavaScript-Objekt)

// ─── Variante 2: Literal Union ────────────────────
type DirectionUnion = "NORTH" | "SOUTH" | "EAST" | "WEST";
// Erzeugt KEINEN Laufzeit-Code! (Type Erasure)
```

| Kriterium | `enum` | Literal Union |
|---|---|---|
| Laufzeit-Code | Ja (JS-Objekt) | Nein (Type Erasure) |
| Iteration moeglich? | Ja (`Object.values`) | Nur mit Hilfs-Array |
| Tree-Shaking | Problematisch | Kein Problem |
| Autovervollstaendigung | Ja | Ja |
| Refactoring | Gut (Symbol-basiert) | Gut (Find & Replace) |
| Zusammensetzbar | Nein | Ja (Union of Unions) |

Der entscheidende Vorteil von Literal Unions: **Zusammensetzbarkeit**:

```typescript annotated
type ReadMethod = "GET" | "HEAD" | "OPTIONS";
type WriteMethod = "POST" | "PUT" | "PATCH" | "DELETE";
type HttpMethod = ReadMethod | WriteMethod;
// ^ Union aus Unions! Ergebnis: alle 7 Methoden
// Das geht mit enum NICHT so einfach
```

> 📖 **Hintergrund: Warum enum in TypeScript umstritten ist**
>
> TypeScript-`enum` ist eines der wenigen Features, die **Laufzeit-Code
> erzeugen** (ein Verstoss gegen Type Erasure). Das fuehrt zu Problemen:
>
> 1. **Bundle-Groesse**: enum-Objekte werden nicht per Tree-Shaking entfernt
> 2. **const enum**: War die Loesung, wurde aber von der TypeScript-Doku
>    als "Pitfall" markiert (isolatedModules-Problem)
> 3. **Numeric enums**: Haben Reverse Mapping (`Direction[0] === "North"`),
>    was verwirrend sein kann
>
> Das TypeScript-Team selbst empfiehlt inzwischen Literal Unions fuer die
> meisten Faelle. Enums sind sinnvoll, wenn du tatsaechlich ein
> Laufzeit-Objekt brauchst (z.B. fuer Iteration oder als Lookup-Tabelle).

> ⚡ **Praxis-Tipp:** In Angular und React ist die Konvention klar:
>
> ```typescript
> // Angular: Literal Unions fuer Route Guards, Pipes, etc.
> type CanActivateResult = boolean | UrlTree | Observable<boolean | UrlTree>;
>
> // React: Literal Unions fuer Props
> type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
> ```

---

## Union Types mit as const ableiten

Eine elegante Technik: Union Types aus einem **Array** ableiten:

```typescript annotated
const ROLES = ["admin", "editor", "viewer"] as const;
//                                          ^^^^^^^^
//    as const: readonly Tuple mit Literal Types

type Role = typeof ROLES[number];
//          ^^^^^^^^^^^^^^^^^^^^
//    Ergebnis: "admin" | "editor" | "viewer"
//    typeof ROLES = readonly ["admin", "editor", "viewer"]
//    ROLES[number] = "admin" | "editor" | "viewer"

// Vorteil: Du hast sowohl das Array (Laufzeit) als auch den Typ (Compilezeit)
function isValidRole(input: string): input is Role {
  return (ROLES as readonly string[]).includes(input);
}
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> const ROLES = ["admin", "editor", "viewer"] as const;
> type Role = typeof ROLES[number];
> // ^ Hover: "admin" | "editor" | "viewer"
>
> // Jetzt entferne "as const":
> const ROLES2 = ["admin", "editor", "viewer"];
> type Role2 = typeof ROLES2[number];
> // ^ Hover: string — zu breit! Warum?
> ```
> Was passiert mit dem Typ `Role2` ohne `as const`? Warum inferiert
> TypeScript dann `string` statt der konkreten Werte?

---

## Union Types und die Typhierarchie

Wo passen Union Types in die Hierarchie, die du in Lektion 02
kennengelernt hast?

```
                    unknown  (Top Type)
                   /   |   \
             string  number  boolean ...
                \     |     /
           string | number | boolean    <── Union Type: Vereinigung
                   \  |  /
                    never   (Bottom Type)
```

Ein Union Type steht **zwischen** seinen Mitgliedern und `unknown`.
Er ist **breiter** als jedes einzelne Mitglied, aber **enger** als `unknown`:

```typescript
// Aufwaerts-Zuweisung: Mitglied → Union (immer OK)
const x: string | number = "hallo";  // string → string | number: OK

// Abwaerts-Zuweisung: Union → Mitglied (FEHLER ohne Narrowing)
const s: string | number = "hallo";
// const y: string = s;  // Error! string | number → string: NEIN
```

> 🧠 **Erklaere dir selbst:** Warum kann man `string` an
> `string | number` zuweisen, aber nicht umgekehrt?
> **Kernpunkte:** string ist Teilmenge von string | number |
> Aufwaerts-Zuweisung (konkret → allgemein) ist sicher |
> Abwaerts braucht Pruefung (der Wert koennte ja number sein)

---

## Was du gelernt hast

- Der `|`-Operator erstellt Union Types: ein Wert kann **einen von mehreren** Typen haben
- Ohne Type Narrowing sind nur **gemeinsame Operationen** erlaubt
- **Literal Unions** (`"GET" | "POST"`) geben dir Autovervollstaendigung und Compile-Zeit-Sicherheit
- Literal Unions sind meist **besser als Enums** (kein Laufzeit-Code, zusammensetzbar)
- Union Types mit `as const` aus Arrays ableiten ist eine elegante Technik

**Kernkonzept zum Merken:** Ein Union Type ist die **Vereinigungsmenge** aller beteiligten Typen. TypeScript erlaubt nur Operationen, die fuer ALLE Mitglieder gelten — alles andere braucht Type Narrowing.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> type TrafficLight = "red" | "yellow" | "green";
>
> let signal: TrafficLight = "red";   // OK
> signal = "green";                    // OK
> signal = "blue";                     // Was passiert hier?
>
> // Bonusfrage: Was ergibt dieser Union aus Unions?
> type ReadMethod = "GET" | "HEAD";
> type WriteMethod = "POST" | "PUT" | "DELETE";
> type HttpMethod = ReadMethod | WriteMethod;
> // Hover ueber HttpMethod — wie viele Mitglieder hat er?
> ```
> Welche Fehlermeldung zeigt TypeScript bei `"blue"`? Und warum ist
> das Zusammensetzen von Unions so praktisch?

---

> **Pausenpunkt** -- Du hast jetzt die Grundlagen der Union Types
> verstanden. In der naechsten Sektion lernst du, wie du mit **Type Guards**
> den konkreten Typ eines Union-Werts bestimmst.
>
> Weiter geht es mit: [Sektion 02: Type Guards und Narrowing](./02-type-guards-und-narrowing.md)
