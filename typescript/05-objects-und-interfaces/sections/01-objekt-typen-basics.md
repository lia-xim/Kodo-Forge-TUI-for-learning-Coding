# 01 -- Objekt-Typen Basics

> Geschaetzte Lesezeit: ~10 Minuten

## Was du hier lernst

- Wie du die "Form" eines Objekts mit einem **Object Type Literal** beschreibst
- Wann Inline-Typen sinnvoll sind und wann nicht
- Wie verschachtelte Objekte typisiert werden
- Den Unterschied zwischen Objekttypen in TypeScript und Klassen in Java/C#

---

## Warum Objekttypen?

Primitive Typen (`string`, `number`, `boolean`) beschreiben Einzelwerte. Aber echte
Daten kommen fast nie einzeln -- sie kommen als **Buendel zusammengehoeriger Werte**.
Ein Benutzer hat einen Namen, eine E-Mail und ein Alter. Eine Bestellung hat eine ID,
einen Kunden und eine Liste von Artikeln.

In JavaScript sind diese Buendel einfach Objekte. TypeScript gibt dir die Werkzeuge,
ihre **Form** (englisch: "shape") zu beschreiben.

> **Analogie:** Stell dir ein Formular vor. Das Formular sagt nicht, WAS du reinschreibst,
> aber es definiert WELCHE Felder es gibt und welchen Typ jedes Feld erwartet (Text, Zahl,
> Datum). Genau das macht ein Objekttyp.

---

## Object Type Literals

Die einfachste Art, die Form eines Objekts zu beschreiben, ist ein **Object Type Literal** --
du schreibst die Struktur direkt an die Stelle, wo der Typ erwartet wird:

```typescript
// Inline-Objekttyp: direkt bei der Variablen-Deklaration
let user: { name: string; age: number } = {
  name: "Max",
  age: 30,
};
```

**Was passiert hier?**
- `{ name: string; age: number }` ist der **Typ** (die Form)
- `{ name: "Max", age: 30 }` ist der **Wert** (die Daten)
- TypeScript prueft: Passt der Wert zur Form? Ja -- also alles gut.

### Verschachtelte Objekte

Objekte koennen andere Objekte enthalten. Die Typ-Beschreibung spiegelt das wider:

```typescript
let order: {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  items: string[];
} = {
  id: 1,
  customer: { name: "Max", email: "max@test.de" },
  items: ["Buch", "Stift"],
};
```

Du siehst: Das wird schnell unuebersichtlich. Genau deshalb gibt es **Interfaces** und
**Type Aliases** -- sie geben diesen Strukturen Namen. Dazu kommen wir in der naechsten
Sektion.

> **Experiment-Box:** Schreibe den obigen `order`-Typ im TypeScript Playground.
> Dann aendere `items` von `string[]` auf `number[]` -- welche Fehlermeldung bekommst du?
> Beobachte: TypeScript prueft die Typen **rekursiv** in jeder Verschachtelungsebene.

> **Denkfrage:** Warum ist der Typ der `items`-Property `string[]` und nicht
> `Array<string>`? Beide sind aequivalent! `string[]` ist syntaktischer Zucker fuer
> `Array<string>`. In Objekttypen wird die kuerzere Form bevorzugt -- in Sektion 06
> (Index Signatures) wirst du aber auch die laengere Form brauchen.

### Wann sind Inline-Objekttypen sinnvoll?

| Situation | Inline-Typ? |
|-----------|-------------|
| Einmalige Verwendung (z.B. lokale Variable) | Ja |
| Funktionsparameter mit 1-2 Properties | Ja |
| Gleiche Struktur an mehreren Stellen | Nein -- Interface nutzen |
| Komplexe verschachtelte Struktur | Nein -- aufteilen |

> **Praxis-Tipp:** In Angular-Services und React-Komponenten wirst du Inline-Typen
> fast nie verwenden. Sie tauchen am ehesten in kleinen Hilfsfunktionen oder
> `Promise`-Handlern auf.

---

## Objekte in TypeScript vs. andere Sprachen

Wenn du aus Java, C# oder einer anderen nominal typisierten Sprache kommst, ist
der folgende Punkt entscheidend:

```
  Java/C#: Nominal Typing                TypeScript: Structural Typing
  ────────────────────────                ────────────────────────────
  class User {                            // Kein "class" noetig fuer Typen!
    String name;                          let user: { name: string } = {
    int age;                                name: "Max"
  }                                       };

  User u = new User("Max", 30);           // TypeScript prueft die FORM,
  // u MUSS vom Typ User sein             // nicht den NAMEN des Typs
```

In TypeScript beschreibst du **was ein Objekt HAT**, nicht **was ein Objekt IST**.
Das ist ein fundamentaler Unterschied, den wir in Sektion 03 (Structural Typing)
ausfuehrlich erklaeren.

> **Hintergrund:** Anders Hejlsberg, der Chefarchitekt von TypeScript (und vorher
> von C# und Delphi), hat diese Entscheidung bewusst getroffen. Er kannte nominal
> typing aus C# bestens -- und entschied sich fuer TypeScript explizit dagegen.
> Der Grund: TypeScript muss zu bestehendem JavaScript passen, und JavaScript kennt
> keine Klassen-basierten Typechecks. Mehr dazu in Sektion 03.

---

## Zusammenfassung

- **Object Type Literals** beschreiben die "Form" eines Objekts: `{ key: Type }`
- Sie eignen sich fuer einmalige, einfache Strukturen
- Fuer wiederverwendbare Strukturen nutzt man **Interfaces** (naechste Sektion)
- TypeScript prueft die **Struktur** eines Objekts, nicht seinen Klassennamen

---

**Was du gelernt hast:** Du kannst die Form eines Objekts inline beschreiben und verstehst,
wann das sinnvoll ist.

| [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Interfaces & Deklaration -->](02-interfaces-deklaration.md) |
