# Sektion 3: String Enums

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Numerische Enums](./02-numerische-enums.md)
> Naechste Sektion: [04 - Enums vs Union Literals](./04-enums-vs-union-literals.md)

---

## Was du hier lernst

- Warum String Enums **kein Reverse Mapping** haben
- Die Vorteile von String Enums gegenueber numerischen Enums
- Wie String Enums zu **lesbarem JavaScript** kompilieren
- Wann String Enums die richtige Wahl sind

---

## String Enums: Die sicherere Alternative

Bei String Enums hat jedes Mitglied einen **expliziten String-Wert**:

```typescript annotated
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warning = "WARNING",
  Error = "ERROR",
}
// ^ Jedes Mitglied braucht einen expliziten String-Wert

console.log(LogLevel.Debug);   // "DEBUG"
console.log(LogLevel.Error);   // "ERROR"
```

### Kein Auto-Increment bei Strings

Im Gegensatz zu numerischen Enums gibt es **kein Auto-Increment**:

```typescript
// Das hier funktioniert NICHT:
// enum Broken {
//   A = "ALPHA",
//   B,  // Error! String Enums brauchen explizite Werte fuer JEDES Mitglied
// }
```

Das ist gewollt: Es gibt keine sinnvolle "naechste" String-Folge.
Was waere der Auto-Increment von `"ALPHA"` — `"ALPHB"`? `"BETA"`?

---

## Kein Reverse Mapping

Der groesste Unterschied zu numerischen Enums:

```typescript annotated
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
}

// Forward: Name -> Wert
console.log(LogLevel.Debug);   // "DEBUG"

// Reverse: Wert -> Name? NEIN!
// console.log(LogLevel["DEBUG"]);  // Error! Gibt es nicht

// Das generierte JavaScript:
// var LogLevel;
// (function (LogLevel) {
//     LogLevel["Debug"] = "DEBUG";
//     LogLevel["Info"] = "INFO";
// })(LogLevel || (LogLevel = {}));

// Nur einseitige Eintraege — KEIN "DEBUG": "Debug" im Objekt
```

> 🧠 **Erklaere dir selbst:** Warum ist das Fehlen von Reverse Mapping
> ein VORTEIL? Denke an die Iteration mit `Object.keys()`.
> **Kernpunkte:** Keine doppelten Eintraege | Object.keys gibt nur die Enum-Namen | Object.values gibt nur die Werte | Iteration ist sicher und vorhersagbar

---

## Vorteile von String Enums

### 1. Lesbare Debug-Ausgaben

```typescript annotated
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

enum NumericStatus {
  Active,    // 0
  Inactive,  // 1
}

const user = { status: Status.Active };
console.log(user);
// ^ { status: "ACTIVE" } — sofort lesbar!

const user2 = { status: NumericStatus.Active };
console.log(user2);
// ^ { status: 0 } — was bedeutet 0?! Debugging-Albtraum.
```

### 2. Keine versehentliche Zahlenzuweisung

```typescript annotated
enum StringStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// const s: StringStatus = "RANDOM";
// ^ Error! "RANDOM" ist nicht StringStatus zuweisbar

// const s2: StringStatus = 42;
// ^ Error! 42 ist nicht StringStatus zuweisbar

// Vergleiche mit numerischem Enum:
enum NumStatus {
  Active,
  Inactive,
}

const n: NumStatus = 42;
// ^ KEIN Error! TypeScript erlaubt jede Zahl (Soundness-Loch)
```

### 3. Sichere Iteration

```typescript annotated
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

// Object.keys funktioniert wie erwartet:
console.log(Object.keys(Color));
// ^ ["Red", "Green", "Blue"] — genau 3, keine Ueberraschungen

console.log(Object.values(Color));
// ^ ["RED", "GREEN", "BLUE"] — genau 3 Werte
```

> 📖 **Hintergrund: Die Empfehlung des TypeScript-Teams**
>
> In den offiziellen TypeScript-Docs steht: "String enums [...] give you a
> better debugging experience." Die Empfehlung ist klar: Wenn du Enums
> verwendest, bevorzuge String Enums — ausser du brauchst Bitwise-Flags
> oder Reverse Mapping.
>
> In der Praxis gehen viele Teams noch weiter und verwenden gar keine
> Enums mehr, sondern Union Literal Types (dazu mehr in Sektion 4).

---

## Heterogene Enums (und warum du sie vermeiden solltest)

TypeScript erlaubt Enums, die **String- und Number-Werte mischen**:

```typescript annotated
enum Mixed {
  No = 0,
  Yes = "YES",
}
// ^ Technisch moeglich, aber WARUM?

// Das ist fast immer ein Zeichen fuer schlechtes Design.
// TypeScript erlaubt es, aber die Community raet dringend davon ab.
```

> 💭 **Denkfrage:** Warum erlaubt TypeScript heterogene Enums, obwohl
> sie fast nie sinnvoll sind?
>
> **Antwort:** Abwaertskompatibilitaet. Fruehe TypeScript-Versionen
> hatten diese Einschraenkung nicht, und existierender Code haette
> gebrochen. Das TypeScript-Team fuegt fast nie Breaking Changes hinzu —
> selbst bei Features, die sie heute anders entwerfen wuerden.

---

## String Enums und Type Narrowing

String Enums funktionieren gut mit Switch-Statements:

```typescript annotated
enum Theme {
  Light = "LIGHT",
  Dark = "DARK",
  System = "SYSTEM",
}

function applyTheme(theme: Theme): string {
  switch (theme) {
    case Theme.Light:
      return "Heller Hintergrund";
    case Theme.Dark:
      return "Dunkler Hintergrund";
    case Theme.System:
      return "Systemeinstellung verwenden";
    // Kein default noetig — alle Faelle abgedeckt
    // TypeScript meldet einen Fehler, wenn ein neues Mitglied
    // hinzugefuegt wird und kein Case existiert (mit strictNullChecks)
  }
}
```

### Aber: Kein direkter String-Vergleich!

```typescript annotated
enum Theme {
  Light = "LIGHT",
  Dark = "DARK",
}

function setTheme(theme: Theme) {
  // FALSCH — String-Vergleich funktioniert nicht!
  // if (theme === "LIGHT") { }
  // ^ Error! "LIGHT" ist nicht mit Theme vergleichbar

  // RICHTIG — Enum-Mitglied verwenden:
  if (theme === Theme.Light) { }
  // ^ OK
}
```

Das ist gleichzeitig Vorteil und Nachteil: Es erzwingt Konsistenz,
aber macht die Arbeit mit externen Strings umstaendlich.

> 🧠 **Erklaere dir selbst:** Warum verbietet TypeScript den direkten
> Vergleich `theme === "LIGHT"`, obwohl der Enum-Wert genau `"LIGHT"` ist?
> **Kernpunkte:** Enum ist eigener nominaler Typ | Nicht strukturell kompatibel mit string | Erzwingt Verwendung der Enum-Referenz | Verhindert Tippfehler in String-Literalen

---

## Was du gelernt hast

- String Enums brauchen **explizite Werte** fuer jedes Mitglied
- Es gibt **kein Reverse Mapping** und **kein Auto-Increment**
- String Enums produzieren **lesbare Debug-Ausgaben**
- Sie verhindern die **Soundness-Luecke** numerischer Enums (keine beliebigen Zahlen)
- **Iteration** mit Object.keys/values funktioniert sauber
- Direkter **String-Vergleich ist nicht moeglich** — nur Enum-Mitglieder

**Kernkonzept zum Merken:** String Enums loesen die groessten Probleme numerischer Enums, haben aber einen Nachteil: Sie erzeugen immer noch Laufzeit-Code und sind nicht direkt mit Strings vergleichbar.

> **Experiment:** Oeffne `examples/03-string-enums.ts` und aendere
> ein String Enum in ein numerisches. Beobachte was mit `Object.keys()`
> und `Object.values()` passiert.

---

> **Pausenpunkt** — Du kennst jetzt beide Enum-Varianten. In der
> naechsten Sektion vergleichen wir Enums mit ihren Alternativen.
>
> Weiter geht es mit: [Sektion 04: Enums vs Union Literals](./04-enums-vs-union-literals.md)
