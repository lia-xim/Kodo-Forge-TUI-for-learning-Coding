# Sektion 1: Was sind Discriminated Unions?

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Pattern Matching](./02-pattern-matching.md)

---

## Was du hier lernst

- Warum normale Union Types nicht immer reichen
- Was ein **Diskriminator** (Tag-Property) ist
- Wie TypeScript automatisch den richtigen Typ erkennt
- Die drei Zutaten einer Discriminated Union

---

## Das Problem mit normalen Unions

In Lektion 11 hast du Type Narrowing gelernt: `typeof`, `in`-Operator,
`instanceof`. Das funktioniert gut bei einfachen Faellen. Aber was passiert,
wenn du mehrere Objekt-Typen hast, die sich aehnlich sehen?

```typescript annotated
// Zwei Nachrichtentypen
type TextMessage = {
  content: string;
  timestamp: Date;
};

type ImageMessage = {
  imageUrl: string;
  width: number;
  height: number;
  timestamp: Date;
};

type Message = TextMessage | ImageMessage;

function displayMessage(msg: Message) {
  // Wie unterscheiden wir TextMessage von ImageMessage?
  // "content" in msg? Fragil — was wenn ImageMessage auch content bekommt?
  // instanceof? Funktioniert nicht — es sind keine Klassen!
}
```

Der `in`-Operator aus L11 funktioniert hier, aber er ist **fragil**: Wenn
sich die Typen aendern, bricht die Logik. Es gibt einen besseren Weg.

---

## Die Loesung: Ein Tag-Property

Die Idee ist einfach und maechtig: **Gib jedem Typ eine Property, die ihn
eindeutig identifiziert.**

```typescript annotated
type TextMessage = {
  kind: "text";       // <-- DAS ist der Diskriminator (Tag)
  content: string;
  timestamp: Date;
};

type ImageMessage = {
  kind: "image";      // <-- Anderer Literal-Wert = anderer Typ
  imageUrl: string;
  width: number;
  height: number;
  timestamp: Date;
};

type Message = TextMessage | ImageMessage;
```

Die Property `kind` ist das **Tag**. Sie hat in jedem Mitglied der Union
einen **unterschiedlichen String Literal Type**. TypeScript erkennt das
und kann automatisch narrowen:

```typescript annotated
function displayMessage(msg: Message) {
  if (msg.kind === "text") {
    // TypeScript weiss hier: msg ist TextMessage
    console.log(msg.content);      // OK!
    // console.log(msg.imageUrl);  // Error — existiert nicht auf TextMessage
  } else {
    // TypeScript weiss hier: msg ist ImageMessage
    console.log(msg.imageUrl);     // OK!
    console.log(`${msg.width}x${msg.height}`);
  }
}
```

> **Erklaere dir selbst:** Warum funktioniert `msg.kind === "text"` besser als
> `"content" in msg`? Was passiert, wenn ein dritter Nachrichtentyp dazukommt?
> **Kernpunkte:** Der Diskriminator ist explizit und stabil | "in" bricht wenn Properties sich aendern | Ein neuer Tag-Wert ist sofort eindeutig

---

## Die drei Zutaten einer Discriminated Union

Eine Discriminated Union (auch: **Tagged Union** oder **Sum Type**) braucht
genau drei Dinge:

### 1. Gemeinsames Tag-Property

Alle Mitglieder der Union muessen eine Property mit demselben **Namen**
aber unterschiedlichen **Literal-Werten** haben:

```typescript annotated
type Circle = { shape: "circle"; radius: number };
type Rectangle = { shape: "rectangle"; width: number; height: number };
type Triangle = { shape: "triangle"; base: number; height: number };

// "shape" ist das Tag — jeder Typ hat einen eindeutigen Wert
```

### 2. Union Type

Die einzelnen Typen werden per Union zusammengefasst:

```typescript annotated
type Shape = Circle | Rectangle | Triangle;
// Shape ist die Discriminated Union
```

### 3. Narrowing durch den Diskriminator

TypeScript verengt den Typ automatisch, wenn du den Diskriminator pruefst:

```typescript annotated
function area(shape: Shape): number {
  switch (shape.shape) {
    case "circle":
      // shape ist hier Circle
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // shape ist hier Rectangle
      return shape.width * shape.height;
    case "triangle":
      // shape ist hier Triangle
      return (shape.base * shape.height) / 2;
  }
}
```

---

## Warum heisst es "Diskriminator"?

Das Wort kommt aus der Mathematik: Ein **Diskriminant** unterscheidet
verschiedene Faelle. In der Quadratischen Formel entscheidet `b^2 - 4ac`,
ob die Gleichung null, eine oder zwei Loesungen hat.

Genau so entscheidet das Tag-Property, welcher Typ in der Union vorliegt.
TypeScript nutzt den Literal-Wert als **Entscheidungskriterium**.

> **Fachbegriffe-Mapping:**
> - **Discriminated Union** = Tagged Union = Sum Type
> - **Diskriminator** = Tag = das unterscheidende Property
> - **Variant** = ein einzelnes Mitglied der Union

---

## Welche Werte sind als Diskriminator gueltig?

Der Diskriminator muss ein **Literal Type** sein. Das heisst:

```typescript annotated
// String Literals (am haeufigsten):
type A = { type: "a" };

// Number Literals:
type B = { code: 200 };
type C = { code: 404 };

// Boolean Literals:
type D = { success: true; data: string };
type E = { success: false; error: Error };

// NICHT gueltig als Diskriminator:
// type F = { type: string };    // Zu breit — nicht literal!
// type G = { type: number };    // Ebenfalls zu breit
```

> **Best Practice:** Verwende **String Literals** als Diskriminator.
> Sie sind lesbar, eindeutig und selbstdokumentierend.

---

## Mehrere Tag-Properties

TypeScript unterstuetzt sogar **mehrere Diskriminatoren gleichzeitig**:

```typescript annotated
type ApiResponse =
  | { status: "success"; code: 200; data: unknown }
  | { status: "success"; code: 201; data: unknown }
  | { status: "error"; code: 400; message: string }
  | { status: "error"; code: 500; message: string };

function handle(res: ApiResponse) {
  if (res.status === "error") {
    // res ist jetzt { status: "error"; code: 400 | 500; message: string }
    console.log(res.message);

    if (res.code === 500) {
      // res ist jetzt { status: "error"; code: 500; message: string }
      console.log("Server-Fehler!");
    }
  }
}
```

---

## Zusammenfassung Sektion 1

| Konzept | Erklaerung |
|---------|-----------|
| **Discriminated Union** | Union Type mit einem gemeinsamen Tag-Property |
| **Diskriminator/Tag** | Property mit unterschiedlichen Literal-Werten pro Typ |
| **Drei Zutaten** | (1) Gemeinsames Tag, (2) Union Type, (3) Narrowing |
| **Gueltige Tags** | String/Number/Boolean Literals — NICHT string/number/boolean |
| **Best Practice** | String Literals als Tags verwenden |

---

> **Pausenpunkt:** Du kennst jetzt das Grundprinzip. In der naechsten Sektion
> lernst du, wie du mit switch/case **alle Faelle** abdeckst — und TypeScript
> dich warnt, wenn du einen vergisst.
>
> Weiter: [Sektion 02 - Pattern Matching](./02-pattern-matching.md)
