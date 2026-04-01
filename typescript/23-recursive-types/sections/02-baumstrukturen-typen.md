# Sektion 2: Baumstrukturen typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Was sind rekursive Typen?](./01-was-sind-rekursive-typen.md)
> Naechste Sektion: [03 - Deep-Operationen](./03-deep-operationen.md)

---

## Was du hier lernst

- Wie du **JSON als rekursiven Typ** modellierst — den vielleicht wichtigsten rekursiven Typ
- Wie **DOM-Baeume** und **AST-Strukturen** rekursiv typisiert werden
- Warum **verschachtelte Menues und Konfigurationen** natuerlich rekursiv sind
- Den Unterschied zwischen **direkter** und **indirekter** Rekursion

---

## JSON: Der allgegenwaertige rekursive Typ

Wenn du in deiner Karriere einen einzigen rekursiven Typ wirklich
verinnerlichten solltest, dann ist es der **JSON-Typ**. Du verwendest
JSON taeglich — und seine Struktur ist intrinsisch rekursiv.

> **Hintergrund: Douglas Crockfords JSON-Spezifikation (2001)**
>
> Douglas Crockford "entdeckte" JSON in den fruehen 2000ern als
> Teilmenge von JavaScript-Literalen. Die offizielle Spezifikation
> (RFC 7159, spaeter RFC 8259) definiert JSON-Werte rekursiv:
>
> ```
> value = string | number | boolean | null | array | object
> array = [ value, value, ... ]      ← enthaelt value (Rekursion!)
> object = { string: value, ... }    ← enthaelt value (Rekursion!)
> ```
>
> JSON ist also **per Definition rekursiv** — ein JSON-Wert kann
> andere JSON-Werte enthalten, die wiederum JSON-Werte enthalten,
> beliebig tief. Die Abbruchbedingungen sind die primitiven Typen:
> `string`, `number`, `boolean`, `null`.

---

## Der JSON-Typ in TypeScript

So modellierst du die gesamte JSON-Spezifikation als TypeScript-Typ:

```typescript annotated
type JsonPrimitive = string | number | boolean | null;
// ^ Die vier JSON-Primitiven — das sind die ABBRUCHBEDINGUNGEN

type JsonArray = JsonValue[];
// ^ Ein JSON-Array enthaelt JSON-Werte — REKURSION ueber JsonValue

type JsonObject = { [key: string]: JsonValue };
// ^ Ein JSON-Objekt hat String-Schluessel mit JSON-Werten — REKURSION

type JsonValue = JsonPrimitive | JsonArray | JsonObject;
// ^ Die Union aller moeglichen JSON-Werte
// ^ JsonArray und JsonObject verweisen zurueck auf JsonValue
// ^ Das ist INDIREKTE REKURSION: JsonValue → JsonArray → JsonValue
```

Das ist **indirekte Rekursion**: `JsonValue` referenziert nicht
direkt sich selbst, sondern geht ueber `JsonArray` und `JsonObject`,
die wiederum `JsonValue` referenzieren. TypeScript versteht das.

---

## Erklaere dir selbst: Warum ist der JSON-Typ vollstaendig?

> **Erklaere dir selbst:**
>
> Warum deckt `type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }`
> wirklich **alle** moeglichen JSON-Dokumente ab?
>
> Denke an die JSON-Spezifikation: Welche Wert-Typen gibt es, und wie
> bildet die Typ-Definition sie ab?
>
> *Nimm dir 30 Sekunden zum Nachdenken.*

Die Antwort: JSON kennt genau **sechs** Wert-Typen — String, Number,
Boolean, Null, Array und Object. Unser Typ bildet exakt diese sechs ab.
Das Array und Object sind rekursiv definiert (enthalten JsonValue),
die vier Primitiven sind die Blaetter/Abbruchbedingungen.

---

## JSON-Typ in der Praxis: Warum nicht `any`?

Du fragst dich vielleicht: "Warum nicht einfach `any` fuer JSON?"
Hier ist der Grund:

```typescript annotated
// SCHLECHT: any verliert alle Typ-Sicherheit
function parseConfig(json: string): any {
  return JSON.parse(json);
  // ^ JSON.parse gibt 'any' zurueck — alles erlaubt, nichts geprueft
}

const config = parseConfig('{"port": 8080}');
config.potr;  // Kein Fehler! Tippfehler bleibt unentdeckt
// ^ 'any' erlaubt JEDEN Zugriff — auch falsche

// BESSER: JsonValue erzwingt JSON-kompatible Strukturen
function parseJsonSafe(json: string): JsonValue {
  return JSON.parse(json) as JsonValue;
  // ^ Wir casten zu JsonValue — nicht perfekt, aber besser als any
}

// IDEAL: Validierung + konkreter Typ
function parsePort(json: string): { port: number } {
  const parsed: JsonValue = JSON.parse(json) as JsonValue;
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    // ^ Narrowing: Wir pruefen dass es ein JsonObject ist
    const port = parsed["port"];
    if (typeof port === "number") {
      return { port };
    }
  }
  throw new Error("Ungueltige Konfiguration");
}
```

---

## DOM-Baeume: Rekursion im Browser

Der DOM (Document Object Model) ist ein Paradebeispiel fuer eine
rekursive Baumstruktur. Jedes Element kann Kind-Elemente enthalten,
die wiederum Kind-Elemente haben:

```typescript annotated
// Vereinfachter DOM-Knoten-Typ
type DomNode = TextNode | ElementNode;

type TextNode = {
  type: "text";
  content: string;
  // ^ Blatt-Knoten: hat keine Kinder (Abbruchbedingung)
};

type ElementNode = {
  type: "element";
  tag: string;
  attributes: Record<string, string>;
  children: DomNode[];
  // ^ REKURSION: Kinder sind wieder DomNode
};

// Beispiel: <div class="app"><p>Hallo <b>Welt</b></p></div>
const dom: DomNode = {
  type: "element",
  tag: "div",
  attributes: { class: "app" },
  children: [
    {
      type: "element",
      tag: "p",
      children: [
        { type: "text", content: "Hallo " },
        // ^ TextNode — Abbruchbedingung
        {
          type: "element",
          tag: "b",
          attributes: {},
          children: [
            { type: "text", content: "Welt" },
            // ^ TextNode — Abbruchbedingung
          ],
        },
      ],
      attributes: {},
    },
  ],
};
```

Das ist eine **Discriminated Union** (`type: "text" | "element"`)
kombiniert mit Rekursion — ein extrem haeufiges Pattern.

---

## AST-Typen: Code der Code beschreibt

Compiler und Linter arbeiten intern mit **Abstract Syntax Trees** (ASTs).
Auch diese sind rekursiv:

```typescript annotated
// Vereinfachter Ausdruck-AST (wie TypeScript intern arbeitet)
type Expression =
  | NumberLiteral
  | StringLiteral
  | BinaryExpression
  | CallExpression;

type NumberLiteral = {
  kind: "NumberLiteral";
  value: number;
  // ^ Blatt: keine Unter-Ausdruecke
};

type StringLiteral = {
  kind: "StringLiteral";
  value: string;
  // ^ Blatt: keine Unter-Ausdruecke
};

type BinaryExpression = {
  kind: "BinaryExpression";
  left: Expression;
  // ^ REKURSION: linker Operand ist wieder ein Ausdruck
  right: Expression;
  // ^ REKURSION: rechter Operand ist wieder ein Ausdruck
  operator: "+" | "-" | "*" | "/";
};

type CallExpression = {
  kind: "CallExpression";
  callee: Expression;
  // ^ REKURSION: die aufgerufene Funktion ist ein Ausdruck
  arguments: Expression[];
  // ^ REKURSION: die Argumente sind Ausdruecke
};

// Beispiel AST fuer: add(1, 2 * 3)
const ast: Expression = {
  kind: "CallExpression",
  callee: { kind: "StringLiteral", value: "add" },
  arguments: [
    { kind: "NumberLiteral", value: 1 },
    {
      kind: "BinaryExpression",
      left: { kind: "NumberLiteral", value: 2 },
      right: { kind: "NumberLiteral", value: 3 },
      operator: "*",
    },
  ],
};
```

> **Denkfrage:**
>
> Wie wuerdest du eine `evaluate`-Funktion schreiben, die einen
> `Expression`-AST auswertet? Sie muesste **rekursiv** sein —
> genau wie der Typ selbst. Warum passt das zusammen?

---

## Verschachtelte Menues und Konfigurationen

Im Alltag begegnest du rekursiven Typen besonders bei **Navigations-
Menues** und **Konfigurationen**:

```typescript annotated
// Menue mit beliebig tiefer Verschachtelung
type MenuItem = {
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
  // ^ REKURSION: Sub-Menues sind wieder MenuItems
  // ^ Optional (?) ist die Abbruchbedingung
};

const navigation: MenuItem[] = [
  {
    label: "Produkte",
    children: [
      {
        label: "Software",
        children: [
          { label: "IDE", href: "/products/ide" },
          { label: "CLI Tools", href: "/products/cli" },
          // ^ Blaetter: keine children
        ],
      },
      { label: "Hardware", href: "/products/hardware" },
    ],
  },
  { label: "Ueber uns", href: "/about" },
  // ^ Blatt: keine children
];
```

---

## Experiment: JSON-Typ testen

> **Experiment:**
>
> Definiere den `JsonValue`-Typ und teste ihn:
>
> ```typescript
> type JsonValue =
>   | string | number | boolean | null
>   | JsonValue[]
>   | { [key: string]: JsonValue };
>
> // Test 1: Einfache Werte
> const a: JsonValue = "hallo";
> const b: JsonValue = 42;
> const c: JsonValue = true;
> const d: JsonValue = null;
>
> // Test 2: Verschachtelt
> const config: JsonValue = {
>   database: {
>     host: "localhost",
>     port: 5432,
>     options: {
>       ssl: true,
>       pool: { min: 2, max: 10 },
>     },
>   },
>   features: ["auth", "logging", ["nested", "array"]],
> };
>
> // Test 3: Was wird ABGELEHNT?
> // const bad: JsonValue = new Date();        // Error!
> // const bad2: JsonValue = undefined;        // Error!
> // const bad3: JsonValue = () => {};         // Error!
> // const bad4: JsonValue = { fn: () => {} }; // Error!
> ```
>
> Beobachte: `Date`, `undefined`, und Funktionen sind **kein JSON**.
> Der Typ lehnt sie korrekt ab!

---

## Framework-Bezug: Virtual DOM und rekursive Rendering

> **In React** ist der Virtual DOM (`ReactNode`) ein rekursiver Typ:
>
> ```typescript
> // Vereinfacht aus @types/react
> type ReactNode =
>   | string
>   | number
>   | boolean
>   | null
>   | undefined
>   | ReactElement
>   | ReactNode[];  // ← Rekursion!
>
> // ReactElement enthaelt wiederum children: ReactNode
> interface ReactElement {
>   type: string | ComponentType;
>   props: { children?: ReactNode; [key: string]: unknown };
> }
> ```
>
> Das ist strukturell identisch mit unserem JSON-Typ! Primitiven
> (string, number) sind Blaetter, Arrays und Elemente mit children
> sind die rekursiven Knoten.
>
> **In Angular** findest du dieselbe Struktur in Template-ASTs:
>
> ```typescript
> // Angular Compiler AST (vereinfacht)
> interface TmplAstElement {
>   name: string;
>   attributes: TmplAstAttribute[];
>   children: TmplAstNode[];  // ← Rekursion!
> }
> type TmplAstNode = TmplAstElement | TmplAstText | TmplAstBoundText;
> ```

---

## Zusammenfassung

### Was du gelernt hast

Du hast gesehen, wie rekursive Typen **reale Datenstrukturen** modellieren:

- **JSON** ist der wichtigste rekursive Typ — Primitiven als Abbruchbedingungen
- **DOM-Baeume** nutzen Discriminated Unions + Rekursion (TextNode vs ElementNode)
- **ASTs** (Abstract Syntax Trees) modellieren Code als rekursive Typen
- **Menues und Konfigurationen** sind im Alltag die haeufigsten rekursiven Strukturen
- **Indirekte Rekursion** (A → B → A) ist genauso gueltig wie direkte Selbstreferenz

> **Kernkonzept:** Rekursive Typen beschreiben Datenstrukturen mit
> **beliebiger Tiefe** — JSON, DOM, ASTs, Menues. Die Primitiven
> (string, number, null) sind immer die Blaetter/Abbruchbedingungen,
> Container (Arrays, Objekte mit children) sind die rekursiven Knoten.

---

> **Pausenpunkt** — Du kannst jetzt reale Baumstrukturen typisieren.
> In der naechsten Sektion bauen wir **Deep-Operationen** — rekursive
> Utility Types wie DeepPartial, DeepReadonly und DeepRequired.
>
> Weiter: [Sektion 03 - Deep-Operationen](./03-deep-operationen.md)
