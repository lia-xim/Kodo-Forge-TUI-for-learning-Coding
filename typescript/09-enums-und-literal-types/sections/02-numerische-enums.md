# Sektion 2: Numerische Enums

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Literal Types](./01-literal-types.md)
> Naechste Sektion: [03 - String Enums](./03-string-enums.md)

---

## Was du hier lernst

- Wie numerische Enums funktionieren und was der Compiler daraus macht
- Was **Reverse Mapping** ist und warum es sowohl nuetzlich als auch gefaehrlich ist
- Wie **Auto-Increment** funktioniert und welche Fallstricke es gibt
- Warum Enums die **einzige TypeScript-Konstruktion** sind, die Laufzeit-Code erzeugt

---

## Enums: Die Ausnahme von Type Erasure

In Lektion 02 hast du gelernt: TypeScript-Typen verschwinden zur Laufzeit (Type Erasure).
Enums sind die **grosse Ausnahme**. Sie erzeugen echten JavaScript-Code:

```typescript annotated
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
// ^ Sieht aus wie ein reiner Typ — ist es aber NICHT

// Was der Compiler daraus macht (JavaScript):
// var Direction;
// (function (Direction) {
//     Direction[Direction["Up"] = 0] = "Up";
//     Direction[Direction["Down"] = 1] = "Down";
//     Direction[Direction["Left"] = 2] = "Left";
//     Direction[Direction["Right"] = 3] = "Right";
// })(Direction || (Direction = {}));
```

> 📖 **Hintergrund: Warum erzeugen Enums Laufzeit-Code?**
>
> Als TypeScript 2012 entstand, waren Enums eines der wenigen Features,
> die bewusst von Type Erasure ausgenommen wurden. Der Grund: Entwickler
> aus C# und Java erwarteten, dass Enums zur Laufzeit als Werte verfuegbar
> sind — zum Beispiel fuer Iteration ueber alle Werte oder Reverse Mapping.
>
> Heute sehen viele TypeScript-Experten (darunter auch Mitglieder des
> TypeScript-Teams) das als Designfehler. Ryan Cavanaugh sagte 2022:
> "Wenn wir TypeScript heute neu entwerfen wuerden, gaebe es wahrscheinlich
> keine Enums." Stattdessen wuerden Union Literal Types und `as const`
> verwendet.

---

## Auto-Increment: Automatische Nummerierung

Ohne explizite Werte zaehlt TypeScript von 0 hoch:

```typescript annotated
enum Status {
  Draft,      // 0
  Published,  // 1
  Archived,   // 2
}

console.log(Status.Draft);     // 0
console.log(Status.Published); // 1
console.log(Status.Archived);  // 2
```

Du kannst den Startwert aendern:

```typescript annotated
enum HttpStatus {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalError = 500,
}

// Auto-Increment funktioniert auch ab einem anderen Startwert:
enum Priority {
  Low = 1,
  Medium,     // 2 (Auto-Increment ab 1)
  High,       // 3
  Critical,   // 4
}
```

### Die Auto-Increment-Falle

Hier lauert eine subtile Gefahr:

```typescript annotated
enum Permissions {
  Read = 1,
  Write = 2,
  Execute = 4,
  // Bitwise Flags — brauchen explizite Werte!
}

// FALSCH — wenn jemand spaeter Auto-Increment erwartet:
enum PermissionsBroken {
  None = 0,
  Read,     // 1 — OK
  Write,    // 2 — OK
  Execute,  // 3 — FALSCH! Sollte 4 sein (Bitwise)
}
```

> 🧠 **Erklaere dir selbst:** Warum ist Auto-Increment bei Bitwise Flags
> gefaehrlich? Was passiert, wenn du `Read | Write` berechnen willst und
> die Werte 1, 2, 3 statt 1, 2, 4 sind?
> **Kernpunkte:** Bitwise OR braucht Zweierpotenzen | 1|2=3 funktioniert | 1|2=3 bei Werten 1,2,3 kollidiert mit Execute(3) | Immer explizite Werte bei Flags

---

## Reverse Mapping: Von Wert zu Name

Das einzigartige Feature numerischer Enums:

```typescript annotated
enum Color {
  Red,    // 0
  Green,  // 1
  Blue,   // 2
}

// Forward: Name -> Wert
console.log(Color.Red);   // 0
console.log(Color.Green); // 1

// Reverse: Wert -> Name
console.log(Color[0]);    // "Red"
console.log(Color[1]);    // "Green"
```

### Wie funktioniert das?

Das generierte JavaScript-Objekt hat **doppelte Eintraege**:

```typescript
// Das erzeugte JavaScript-Objekt sieht so aus:
// {
//   0: "Red",     <-- Reverse Mapping
//   1: "Green",   <-- Reverse Mapping
//   2: "Blue",    <-- Reverse Mapping
//   Red: 0,       <-- Forward Mapping
//   Green: 1,     <-- Forward Mapping
//   Blue: 2,      <-- Forward Mapping
// }
```

### Die Fallstricke von Reverse Mapping

**Problem 1: Iteration ist gefaehrlich**

```typescript annotated
enum Color {
  Red,
  Green,
  Blue,
}

// Object.keys gibt ALLE Keys zurueck — auch die Reverse-Mappings!
console.log(Object.keys(Color));
// ^ ["0", "1", "2", "Red", "Green", "Blue"] — 6 statt 3!

// Object.values hat dasselbe Problem:
console.log(Object.values(Color));
// ^ ["Red", "Green", "Blue", 0, 1, 2] — gemischt!

// Korrekte Iteration: Nur die numerischen Werte filtern
const colorNames = Object.keys(Color).filter(k => isNaN(Number(k)));
// ^ ["Red", "Green", "Blue"]
```

**Problem 2: TypeScript erlaubt jede Zahl**

```typescript annotated
enum Color {
  Red,
  Green,
  Blue,
}

// Das hier kompiliert OHNE Fehler:
const c: Color = 42;
// ^ 42 ist KEIN definierter Color-Wert, aber TypeScript erlaubt es!

// Das ist ein bekanntes Soundness-Loch in TypeScript.
// String Enums haben dieses Problem NICHT.
```

> 🔍 **Tieferes Wissen: Warum erlaubt TypeScript jede Zahl?**
>
> Das Soundness-Loch existiert, weil numerische Enums auch fuer
> **Bitwise Flags** verwendet werden. Bei `Permissions.Read | Permissions.Write`
> ergibt sich `3` — ein Wert, der nicht explizit im Enum definiert ist.
> TypeScript muesste sonst Bitwise-Operationen auf Enums verbieten.
>
> Die Entscheidung war: Lieber Bitwise-Flags erlauben und dafuer
> eine Sicherheitsluecke in Kauf nehmen. Bei String Enums war dieses
> Zugestaendnis nicht noetig — deshalb sind sie strenger.

> 💭 **Denkfrage:** Wenn du eine API entwirfst, die einen Status-Code als
> Enum nimmt — wie stellst du sicher, dass nur gueltige Werte ankommen,
> obwohl TypeScript jede Zahl erlaubt?
>
> **Antwort:** Du musst zur Laufzeit pruefen! Eine Funktion wie
> `Object.values(MyEnum).includes(value)` validiert den Wert.
> Oder du verwendest String Enums, die dieses Problem nicht haben.

---

## Berechnete Enum-Werte

Enum-Werte koennen auch Ausdruecke sein:

```typescript annotated
enum FileAccess {
  None = 0,
  Read = 1 << 0,     // 1 (Bitshift)
  Write = 1 << 1,    // 2
  Execute = 1 << 2,  // 4
  ReadWrite = Read | Write,  // 3 (Bitwise OR)
  All = Read | Write | Execute,  // 7
}

// Aber ACHTUNG: Nach einem berechneten Wert ist kein Auto-Increment moeglich!
// enum Broken {
//   A = "hello".length,  // 5 (berechnet)
//   B,                   // Error! Kein Auto-Increment nach berechnetem Wert
// }
```

---

## Was du gelernt hast

- Numerische Enums erzeugen **echten JavaScript-Code** — keine Type Erasure
- **Auto-Increment** zaehlt von 0 (oder einem Startwert) hoch
- **Reverse Mapping** erlaubt Zugriff von Wert zu Name: `Color[0]` gibt `"Red"`
- Iteration ueber Enums ist gefaehrlich wegen doppelter Eintraege
- TypeScript erlaubt **jede Zahl** als numerischen Enum-Wert (Soundness-Loch)
- Nach berechneten Werten ist kein Auto-Increment moeglich

> 🧠 **Erklaere dir selbst:** Warum ist das Reverse Mapping bei der Iteration
> ein Problem? Was passiert wenn du `Object.keys(Color)` verwendest und die
> Laenge pruefst?
> **Kernpunkte:** Doppelte Eintraege (Namen + Zahlen) | Object.keys gibt 6 statt 3 | Muss numerische Keys filtern | Alternative: String Enums ohne Reverse Mapping

**Kernkonzept zum Merken:** Numerische Enums sind maechtig, aber auch die fehleranfaelligste Enum-Variante. In den meisten Faellen sind String Enums oder Union Literal Types die bessere Wahl.

> **Experiment:** Oeffne `examples/02-numerische-enums.ts` und pruefe
> was `Object.keys()` und `Object.values()` bei einem numerischen Enum
> zurueckgeben. Versuche dann, einem Enum eine ungueltige Zahl zuzuweisen.

---

> **Pausenpunkt** — Du hast die komplexeste Enum-Variante verstanden.
> String Enums in der naechsten Sektion sind deutlich einfacher.
>
> Weiter geht es mit: [Sektion 03: String Enums](./03-string-enums.md)
