# 01 -- Objekt-Typen Basics

> Geschaetzte Lesezeit: ~10 Minuten

## Was du hier lernst

- Wie TypeScript die "Form" eines Objekts mit einem **Object Type Literal** beschreibt
- Warum diese Formkontrolle ueberhaupt existiert -- und was sie dir erspart
- Wie verschachtelte Objekte typisiert werden und wo das schnell unhandlich wird
- Den fundamentalen Unterschied zwischen Objekttypen in TypeScript und Klassen in Java/C#
- Wann Inline-Typen sinnvoll sind und wann du zum Interface greifen solltest

---

## Die Geschichte hinter Objekt-Typen

Warum brauchen wir ueberhaupt Typen fuer Objekte? JavaScript hat seit Jahrzehnten
Objekte -- und die Welt dreht sich auch ohne Typen.

> **Origin Story:** Als TypeScript 2012 bei Microsoft entstand, war das groesste
> Problem nicht fehlende Klassen oder Module -- es war **typsichere Objektstruktur**.
> JavaScript-Entwickler kannten das Muster: Du rufst eine API ab, bekommst ein
> Objekt zurueck, und schreibst `response.data.user.naem` (Tippfehler!). Zur
> Laufzeit: `undefined`. Stundenlange Debugging-Session.
>
> Anders Hejlsberg (ehemals Chefarchitekt von Turbo Pascal und C#) und sein Team
> wollten genau das loesen: Den Compiler soll wissen, welche Properties ein Objekt
> hat, welche Typen sie haben, und wann du dich vertippst. Das ist der Ursprung
> von Object Type Literals.

Das klingt simpel. Aber die Konsequenzen sind weitreichend: Ein typisiertes Objekt
ist kein blosser Kommentar -- es ist ein **Vertrag zwischen dem Schreiber des Codes
und dem Compiler**.

---

## Warum Objekttypen? Das echte Problem

Primitive Typen (`string`, `number`, `boolean`) beschreiben Einzelwerte. Aber echte
Daten kommen fast nie einzeln -- sie kommen als **Buendel zusammengehoeriger Werte**.
Ein Benutzer hat einen Namen, eine E-Mail und ein Alter. Eine Bestellung hat eine ID,
einen Kunden und eine Liste von Artikeln.

In JavaScript sind diese Buendel einfach Objekte. TypeScript gibt dir die Werkzeuge,
ihre **Form** (englisch: "shape") zu beschreiben.

Betrachte, was ohne Typen passiert:

```typescript
// Ohne Typen: Kein Schutz
function greetUser(user) {
  return `Hallo, ${user.nane}!`;  // Tippfehler! 'nane' statt 'name'
}
// Laufzeit-Ergebnis: "Hallo, undefined!" -- kein Fehler, nur falsches Verhalten
```

Und mit Typen:

```typescript
// Mit Typen: Sofortiger Fehler zur Compile-Zeit
function greetUser(user: { name: string }) {
  return `Hallo, ${user.nane}!`;
  //              ^^^^ FEHLER: Property 'nane' does not exist. Meintest du 'name'?
}
```

Der Compiler wird zum **ersten Leser deines Codes** -- und er ist unbestechlich.

> **Analogie:** Stell dir ein Formular vor. Das Formular sagt nicht, WAS du
> reinschreibst, aber es definiert WELCHE Felder es gibt und welchen Typ jedes Feld
> erwartet (Text, Zahl, Datum). Wer das Formular ausfuellt, muss sich an die Felder
> halten. Genau das macht ein Objekttyp: Er ist das Formular, das Objekte ausfuellen
> muessen.

---

## Object Type Literals -- Die Syntax im Detail

Die einfachste Art, die Form eines Objekts zu beschreiben, ist ein
**Object Type Literal** -- du schreibst die Struktur direkt an die Stelle, wo
der Typ erwartet wird:

```typescript annotated
// Variablen-Deklaration mit Objekt-Typ:
let user: { name: string; age: number } = {
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^ Das ist der TYP (die Form/das Formular)
  name: "Max",
// ^^^^ Eigenschaft 'name' mit Typ string
  age: 30,
// ^^^ Eigenschaft 'age' mit Typ number
};
//  ^^^^^^^^^^^^^^^^^^^^^ Das ist der WERT (die konkreten Daten)
// TypeScript prueft: Passt der Wert zur Form?
// name: "Max" ist ein string -- passt zu 'name: string'  ✓
// age: 30 ist eine number -- passt zu 'age: number'      ✓
// Alles in Ordnung.
```

Der Doppelpunkt in `{ name: string; age: number }` trennt hier
**Property-Name** von **Property-Typ** -- nicht Schluessel von Wert.
Das ist eine reine Typ-Annotation, kein laufender Code.

### Was TypeScript tatsaechlich prueft

Wenn du ein Objekt einem Typ-annotierten Bezeichner zuweist, prueft TypeScript:

1. Sind **alle geforderten Properties vorhanden**?
2. Hat jede Property den **richtigen Typ**?
3. Gibt es **unbekannte Extra-Properties** im frischen Literal? (Dazu kommt Sektion 04)

```typescript
// Fehlende Property: TypeScript meldet Fehler
let user: { name: string; age: number } = {
  name: "Max",
  // age fehlt! FEHLER: Property 'age' is missing
};

// Falscher Typ: TypeScript meldet Fehler
let user2: { name: string; age: number } = {
  name: "Max",
  age: "dreissig",  // FEHLER: Type 'string' is not assignable to type 'number'
};
```

---

## Verschachtelte Objekte -- Tiefe Strukturen

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

TypeScript prueft jeden Level rekursiv. Schreibe `customer: { name: 42 }`, bekommst
du einen Fehler -- weil `42` kein `string` ist, tief im verschachtelten Objekt.

> **Experiment-Box:** Schreibe den obigen `order`-Typ im TypeScript Playground.
>
> ```typescript
> let order: {
>   id: number;
>   customer: {
>     name: string;
>     email: string;
>   };
>   items: string[];
> } = {
>   id: 1,
>   customer: { name: "Max", email: "max@test.de" },
>   items: ["Buch", "Stift"],
> };
> ```
>
> Dann probiere diese Varianten und beobachte die Fehlermeldungen:
> 1. Aendere `items: ["Buch", "Stift"]` zu `items: [1, 2]`
> 2. Aendere `customer: { name: "Max", email: ... }` zu `customer: { name: 42, email: ... }`
> 3. Entferne `email` aus dem `customer`-Objekt komplett
>
> Beobachte: TypeScript prueft die Typen **rekursiv** in jeder Verschachtelungsebene.
> Fehler in `customer.name` sind genausogut Fehler wie Fehler in `id`.

Du siehst: Tiefe Verschachtelung wird schnell unuebersichtlich. Der Typ-Ausdruck ist
fast laenger als der Wert selbst. Genau deshalb gibt es **Interfaces** und
**Type Aliases** -- sie geben diesen Strukturen Namen. Dazu kommen wir in
der naechsten Sektion.

> **Denkfrage:** Warum ist der Typ der `items`-Property `string[]` und nicht
> `Array<string>`? Beide sind aequivalent! `string[]` ist syntaktischer Zucker fuer
> `Array<string>`. In Objekttypen wird die kuerzere Form bevorzugt -- in Sektion 06
> (Index Signatures) wirst du aber auch die laengere Form brauchen.
> Merke: Gleiche Semantik, verschiedene Schreibweisen. TypeScript erlaubt beides.

---

## Self-Explanation Prompt

> 🧠 **Erklaere dir selbst:** Was ist ein Object Type Literal? Warum erkennt
> TypeScript einen Tippfehler in `user.nane`, wenn der Typ `{ name: string }` ist?
> Was genau prueft TypeScript -- und wann?
>
> **Kernpunkte:** Object Type Literal = Typ-Beschreibung der Form eines Objekts |
> Compiler liest den Typ und kennt alle gueltigen Property-Namen | Zugriff auf
> unbekannte Properties = Compile-Zeit-Fehler | Pruefung passiert beim Zuweisen
> und beim Zugriff -- nicht zur Laufzeit

---

## Wann sind Inline-Objekttypen sinnvoll?

| Situation | Inline-Typ? |
|-----------|-------------|
| Einmalige Verwendung (z.B. lokale Variable) | Ja |
| Funktionsparameter mit 1-2 Properties | Ja |
| Gleiche Struktur an mehreren Stellen | Nein -- Interface nutzen |
| Komplexe verschachtelte Struktur | Nein -- aufteilen |
| Exported / Teil der oeffentlichen API | Nein -- benannter Typ |

> **Praxis-Tipp:** In Angular-Services und React-Komponenten wirst du Inline-Typen
> fast nie sehen. Sie tauchen am ehesten in kleinen Hilfsfunktionen oder lokalen
> Variablen auf. Sobald du denselben Typ zweimal schreibst, ist das der klare
> Hinweis: benenne ihn mit einem Interface oder Type Alias.

---

## Objekte in TypeScript vs. andere Sprachen

Wenn du aus Java, C# oder einer anderen nominal typisierten Sprache kommst, ist
der folgende Punkt entscheidend -- und er wird dein ganzes Verstaendnis von
TypeScript praegen:

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
> von C# und Delphi), hat diese Entscheidung bewusst getroffen. Er kannte nominales
> Typing aus C# bestens -- und entschied sich fuer TypeScript explizit dagegen.
> Der Grund: TypeScript muss zu bestehendem JavaScript passen, und JavaScript kennt
> keine Klassen-basierten Typechecks. Ein `typeof`-Aufruf gibt nur `"object"` zurueck.
> Wenn TypeScript nominale Typen erzwungen haette, waere ein Grossteil des bestehenden
> JavaScript-Codes nicht typisierbar gewesen. Mehr dazu in Sektion 03.

---

## Framework-Bezug: Object Types in Angular und React

Objekttypen sind in beiden Frameworks der alltaegliche Baustein:

```typescript
// Angular: Ein Service-Interface inline definieren (selten -- nur fuer einmalige Nutzung)
async function loadConfig(): Promise<{ apiUrl: string; timeout: number }> {
  const response = await fetch("/config.json");
  return response.json();
}

// React: Inline Props fuer eine einfache, einmalig genutzte Komponente
function WelcomeBanner({ name, role }: { name: string; role: string }) {
  return <h1>Willkommen, {name} ({role})!</h1>;
}
```

Sobald du dieselbe Struktur mehrfach brauchst -- z.B. `{ name: string; role: string }`
in fuenf Komponenten -- schreibst du stattdessen ein Interface. Das ist der naechste
logische Schritt, den wir in Sektion 02 gehen.

---

## Was du gelernt hast

- **Object Type Literals** beschreiben die "Form" eines Objekts: `{ key: Type; ... }`
- Die Syntax `name: string` bedeutet im Typ-Kontext "Property `name` hat Typ `string`"
- TypeScript prueft **Vollstaendigkeit** (alle Pflicht-Properties vorhanden?),
  **Typen** (stimmen die Werttypen?) und **Schreibweise** (kein Tippfehler im Zugriff)
- Pruefungen finden zur **Compile-Zeit** statt -- nicht zur Laufzeit
- Verschachtelte Strukturen werden **rekursiv** geprueft, auf jedem Level
- Fuer **einmalige, einfache** Strukturen sind Inline-Typen sinnvoll
- Fuer **wiederverwendbare** Strukturen nutzt man **Interfaces** (naechste Sektion)
- TypeScript prueft die **Struktur** eines Objekts, nicht seinen Klassennamen
  (Structural Typing -- der wichtigste Unterschied zu Java/C#)

---

> **Kernkonzept:** Ein Object Type Literal ist ein Vertrag. Wer den Vertrag unterschreibt
> (ein Objekt einem annotierten Bezeichner zuweist), muss alle Klauseln erfuellen.
> TypeScript ist der unbestechliche Notar.

---

**Pausenpunkt:** Du hast die Grundlagen von Object Type Literals verstanden.
In der naechsten Sektion geben wir diesen Strukturen Namen -- mit Interfaces.

| [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Interfaces & Deklaration -->](02-interfaces-deklaration.md) |
