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

> 💭 **Denkfrage:** Stell dir vor, du hast eine Chat-App mit Textnachrichten, Bildnachrichten und Sprachnachrichten. Wie viele Properties brauchst du, um alle drei Typen mit `in`-Operator zu unterscheiden — und wie viele mit einer Discriminated Union?
>
> **Antwort:** Mit `in` pruefst du auf spezifische Properties wie `imageUrl` oder `audioDuration` — fragil, weil sich Properties jederzeit aendern koennen. Mit einer Discriminated Union genuegt **ein** Tag-Property `kind: "text" | "image" | "audio"` — stabil und selbstdokumentierend.

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

> **Experiment:** Probiere folgendes direkt im TypeScript Playground (typescriptlang.org/play) aus:
>
> ```typescript
> type TextMessage = { kind: "text"; content: string };
> type ImageMessage = { kind: "image"; imageUrl: string; width: number };
> type Message = TextMessage | ImageMessage;
>
> function show(msg: Message) {
>   if (msg.kind === "text") {
>     console.log(msg.content);
>     // Was passiert wenn du hier msg.imageUrl tippst?
>   }
> }
> ```
>
> Aendere `kind: "text"` zu `kind: string` in `TextMessage`. Was passiert mit dem Narrowing? Warum?

---

**In deinem Angular-Projekt:** NgRx Actions sind nichts anderes als Discriminated Unions — der `type`-String ist der Diskriminator. Du hast das schon die ganze Zeit benutzt, ohne es so zu nennen:

```typescript
// NgRx Actions — eine Discriminated Union:
type UserAction =
  | { type: "[User] Load Users" }
  | { type: "[User] Load Users Success"; users: User[] }
  | { type: "[User] Load Users Failure"; error: string };

// Der Reducer nutzt switch/case auf den Diskriminator:
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "[User] Load Users":
      return { ...state, loading: true };
    case "[User] Load Users Success":
      // action.users ist hier sicher verfuegbar!
      return { ...state, loading: false, users: action.users };
    case "[User] Load Users Failure":
      // action.error ist hier sicher verfuegbar!
      return { ...state, loading: false, error: action.error };
  }
}
```

NgRx hat das Muster popularisiert — jetzt verstehst du die Typentheorie dahinter.

---

## Was du gelernt hast

- **Discriminated Unions** brauchen drei Zutaten: ein gemeinsames Tag-Property, eine Union Type-Definition, und Narrowing durch den Diskriminator
- Der **Diskriminator** muss ein Literal Type sein (String, Number oder Boolean) — nicht der breite `string`-Typ
- TypeScript narrowt **automatisch** den Typ, wenn du den Diskriminator pruefst — das ist Control Flow Analysis in Aktion
- **String Literals** als Tags sind Best Practice: lesbar, eindeutig, selbstdokumentierend
- Du kannst **mehrere Diskriminatoren** kombinieren fuer noch feinere Unterscheidung

**Kernkonzept:** Eine Discriminated Union macht den Typ einer Variante explizit im Wert sichtbar — der Diskriminator ist die Bruecke zwischen Laufzeit-Pruefung und Compilezeit-Sicherheit.

---

> **Pausenpunkt:** Du kennst jetzt das Grundprinzip. In der naechsten Sektion
> lernst du, wie du mit switch/case **alle Faelle** abdeckst — und TypeScript
> dich warnt, wenn du einen vergisst.
>
> Weiter: [Sektion 02 - Pattern Matching](./02-pattern-matching.md)
