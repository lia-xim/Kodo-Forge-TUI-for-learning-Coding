# Sektion 4: Enums vs Union Literal Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - String Enums](./03-string-enums.md)
> Naechste Sektion: [05 - Template Literal Types](./05-template-literal-types.md)

---

## Was du hier lernst

- Den grossen **Vergleich** zwischen Enums und Union Literal Types
- Warum `as const` Objects oft die **beste Alternative** sind
- Eine klare **Entscheidungshilfe** fuer die Praxis
- Was bei **Tree Shaking** und **Bundle Size** passiert

---

## Der grosse Vergleich

Hier ist dasselbe Konzept auf drei verschiedene Arten implementiert:

```typescript annotated
// 1. String Enum
enum DirectionEnum {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// 2. Union Literal Type
type DirectionUnion = "UP" | "DOWN" | "LEFT" | "RIGHT";

// 3. as const Object
const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;
type DirectionConst = typeof Direction[keyof typeof Direction];
// ^ "UP" | "DOWN" | "LEFT" | "RIGHT"
```

### Was passiert zur Laufzeit?

```typescript
// 1. Enum → erzeugt ein JavaScript-Objekt:
// var DirectionEnum;
// (function (DirectionEnum) {
//     DirectionEnum["Up"] = "UP";
//     ...
// })(DirectionEnum || (DirectionEnum = {}));

// 2. Union Type → NICHTS! Komplett entfernt (Type Erasure):
// (kein JavaScript-Code)

// 3. as const Object → ein normales JavaScript-Objekt:
// const Direction = { Up: "UP", Down: "DOWN", Left: "LEFT", Right: "RIGHT" };
```

> 🧠 **Erklaere dir selbst:** Welche der drei Varianten erzeugt den
> kleinsten JavaScript-Output? Und welche Konsequenz hat das fuer
> die Bundle-Groesse?
> **Kernpunkte:** Union Type erzeugt NULL Code | as const Object erzeugt normales Objekt | Enum erzeugt IIFE-Wrapper | Bei vielen Enums summiert sich der Overhead

---

## Vergleichstabelle

| Kriterium | Enum | Union Literal | as const Object |
|---|---|---|---|
| Laufzeit-Code? | Ja (IIFE) | Nein (Type Erasure) | Ja (normales Objekt) |
| Reverse Mapping? | Nur numerisch | Nein | Manuell moeglich |
| Tree-Shakeable? | Schlecht | Perfekt | Gut |
| IDE Autocomplete? | Ja | Ja | Ja |
| Exhaustive Checks? | Ja | Ja | Ja |
| Iteration ueber Werte? | Umstaendlich | Nicht moeglich | `Object.values()` |
| Erweiterbar? | Nein | Nein | Per Spread |
| Laufzeit-Zugriff auf Werte? | Ja | Nein | Ja |
| Nominaler Typ? | Ja | Nein (strukturell) | Nein (strukturell) |
| Kompatibel mit Strings? | Nein (bei String Enum) | Ja | Ja |

### Was bedeutet "nominaler Typ"?

```typescript annotated
enum StatusA { Active = "ACTIVE" }
enum StatusB { Active = "ACTIVE" }

// Obwohl beide den gleichen Wert haben:
let a: StatusA = StatusA.Active;
// let b: StatusA = StatusB.Active;
// ^ Error! StatusB.Active ist nicht StatusA zuweisbar!

// Bei Union Types: Strukturelle Kompatibilitaet
type StatusC = "ACTIVE" | "INACTIVE";
type StatusD = "ACTIVE" | "INACTIVE";

let c: StatusC = "ACTIVE";
let d: StatusD = c;
// ^ OK! Gleiche Struktur = kompatibel
```

> 📖 **Hintergrund: Nominale vs. Strukturelle Typisierung**
>
> TypeScript verwendet ein **strukturelles Typsystem**: Zwei Typen sind
> kompatibel, wenn ihre Struktur passt — egal wie sie heissen. Enums
> sind die **einzige Ausnahme**: Sie sind nominal, d.h. der Name zaehlt.
>
> In der Praxis heisst das: Wenn du `StatusA` in einem Package definierst
> und `StatusB` in einem anderen, sind sie inkompatibel — selbst wenn
> sie identische Werte haben. Das ist manchmal gewollt (Sicherheit),
> manchmal laestig (Library-Kompatibilitaet).

---

## Das as const Object Pattern (Die moderne Alternative)

Dieses Pattern verbindet die Vorteile von Enums und Union Types:

```typescript annotated
// 1. Definiere das Objekt mit as const
const HttpStatus = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  InternalError: 500,
} as const;

// 2. Leite den Union Type ab
type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];
// ^ 200 | 201 | 400 | 404 | 500

// 3. Verwende beides — Werte UND Typen
function handleResponse(status: HttpStatus) {
  if (status === HttpStatus.Ok) {
    // ^ Zugriff auf benannte Konstanten
    console.log("Alles gut!");
  }
}

// Iteration funktioniert sauber:
const allStatuses = Object.values(HttpStatus);
// ^ [200, 201, 400, 404, 500]

const statusNames = Object.keys(HttpStatus);
// ^ ["Ok", "Created", "BadRequest", "NotFound", "InternalError"]
```

### Der typeof + keyof Trick erklaert

```typescript annotated
const Colors = {
  Red: "#ff0000",
  Green: "#00ff00",
  Blue: "#0000ff",
} as const;

// Schritt fuer Schritt:
type ColorsObject = typeof Colors;
// ^ { readonly Red: "#ff0000"; readonly Green: "#00ff00"; readonly Blue: "#0000ff" }

type ColorKeys = keyof typeof Colors;
// ^ "Red" | "Green" | "Blue"

type ColorValues = typeof Colors[keyof typeof Colors];
// ^ "#ff0000" | "#00ff00" | "#0000ff"

// Kurzform (gleicher Typ gleichem Name wie die Konstante):
type Colors = typeof Colors[keyof typeof Colors];
// ^ "#ff0000" | "#00ff00" | "#0000ff"
```

> 💭 **Denkfrage:** Es faellt auf, dass `Colors` (const) und `Colors` (type)
> den gleichen Namen haben. Ist das ein Fehler?
>
> **Antwort:** Nein! TypeScript erlaubt, dass ein **Wert** und ein **Typ**
> den gleichen Namen haben. Sie leben in verschiedenen "Namensraeumen".
> Wenn du `Colors` als Typ verwendest (z.B. in einer Annotation),
> referenziert TypeScript den Typ. Wenn du `Colors` als Wert verwendest
> (z.B. `Colors.Red`), referenziert es die Konstante.
> Enums machen das Gleiche — jedes Enum ist gleichzeitig Typ und Wert.

---

## Entscheidungshilfe

```
Brauchst du Laufzeit-Werte (Iteration, Logging)?
├── Nein → Union Literal Type: type Status = "active" | "inactive"
└── Ja
    ├── Brauchst du nominale Typisierung (verschiedene Enums nicht mischbar)?
    │   ├── Ja → String Enum: enum Status { Active = "ACTIVE" }
    │   └── Nein
    │       └── as const Object: const Status = { Active: "ACTIVE" } as const
    └── Brauchst du Reverse Mapping (Wert → Name)?
        ├── Ja → Numerisches Enum (mit Vorsicht)
        └── Nein → as const Object oder String Enum
```

### Faustregeln

1. **Default-Wahl:** Union Literal Type — einfach, kein Laufzeit-Code
2. **Wenn du Laufzeit-Werte brauchst:** `as const` Object
3. **Wenn du strenge Nominal-Typen brauchst:** String Enum
4. **Wenn du Bitwise Flags brauchst:** Numerisches Enum
5. **Nie:** Heterogene Enums (String + Number gemischt)

> 🧠 **Erklaere dir selbst:** Warum ist ein Union Literal Type die
> Default-Wahl und nicht ein Enum? Nenne drei konkrete Gruende.
> **Kernpunkte:** Kein Laufzeit-Code | Strukturell kompatibel mit Strings | Tree-Shakeable | Einfacher zu verstehen | Kein Import noetig wenn Typ inline

---

## Was du gelernt hast

- Union Literal Types sind der **einfachste und leichteste** Ansatz
- `as const` Objects bieten **Laufzeit-Werte mit abgeleiteten Typen**
- Enums sind **nominal** (Name zaehlt), alles andere ist **strukturell**
- Der `typeof X[keyof typeof X]` Trick leitet Union Types aus Objekten ab
- **Wert und Typ koennen denselben Namen haben** in TypeScript

**Kernkonzept zum Merken:** In den meisten Faellen brauchst du kein Enum. Union Literal Types decken 80% der Anwendungsfaelle ab, `as const` Objects decken weitere 15% ab, und echte Enums sind nur fuer die restlichen 5% noetig.

> **Experiment:** Oeffne `examples/04-as-const-objects.ts` und
> implementiere ein `as const` Object fuer HTTP-Methoden. Versuche
> dann, den Union Type daraus abzuleiten.

---

> **Pausenpunkt** — Du hast jetzt das Werkzeug, um die richtige
> Entscheidung zu treffen. Die naechste Sektion zeigt dir ein
> Feature, das nur mit Literal Types moeglich ist.
>
> Weiter geht es mit: [Sektion 05: Template Literal Types](./05-template-literal-types.md)
