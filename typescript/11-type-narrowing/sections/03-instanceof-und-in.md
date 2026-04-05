# Sektion 3: instanceof und in

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - typeof Guards](./02-typeof-guards.md)
> Naechste Sektion: [04 - Equality und Truthiness](./04-equality-und-truthiness.md)

---

## Was du hier lernst

- Wie `instanceof` als Type Guard fuer Klassen-Instanzen funktioniert
- Wie der `in`-Operator Properties prueft und Typen narrowt
- Wann du `instanceof` und wann `in` verwenden solltest
- Warum `instanceof` nicht mit Interfaces funktioniert

---

## instanceof: Narrowing fuer Klassen

Der `instanceof`-Operator prueft, ob ein Objekt eine Instanz einer
bestimmten Klasse (oder deren Subklasse) ist. TypeScript nutzt das
fuer Narrowing:

```typescript annotated
function formatiereDatum(wert: string | Date) {
  if (wert instanceof Date) {
    // ^ instanceof-Check: wert ist jetzt Date
    return wert.toLocaleDateString("de-DE");
    // ^ alle Date-Methoden sind verfuegbar
  }
  // wert ist hier: string
  return wert;
}

console.log(formatiereDatum(new Date()));    // "31.3.2026"
console.log(formatiereDatum("2026-03-31"));  // "2026-03-31"
```

### instanceof mit Vererbung

`instanceof` erkennt auch Subklassen:

```typescript annotated
class Fehler {
  constructor(public nachricht: string) {}
}

class NetzwerkFehler extends Fehler {
  constructor(public statusCode: number, nachricht: string) {
    super(nachricht);
  }
}

class ValidierungsFehler extends Fehler {
  constructor(public feld: string, nachricht: string) {
    super(nachricht);
  }
}

function behandleFehler(fehler: Fehler) {
  if (fehler instanceof NetzwerkFehler) {
    // fehler: NetzwerkFehler — statusCode ist verfuegbar
    console.log(`HTTP ${fehler.statusCode}: ${fehler.nachricht}`);
  } else if (fehler instanceof ValidierungsFehler) {
    // fehler: ValidierungsFehler — feld ist verfuegbar
    console.log(`Feld "${fehler.feld}": ${fehler.nachricht}`);
  } else {
    // fehler: Fehler — nur die Basis-Properties
    console.log(`Fehler: ${fehler.nachricht}`);
  }
}
```

> 📖 **Hintergrund: Wie instanceof unter der Haube funktioniert**
>
> `instanceof` prueft die Prototyp-Kette eines Objekts. Es schaut, ob
> `Klasse.prototype` irgendwo in der Prototyp-Kette des Objekts vorkommt.
> Das funktioniert NUR mit Klassen und Konstruktorfunktionen — also mit
> Dingen, die zur Laufzeit als JavaScript-Objekte existieren.
>
> Interfaces und Type Aliases existieren nur zur Compilezeit (Type Erasure!)
> und haben keinen Prototyp. Deshalb kann instanceof sie nicht pruefen.

---

## Warum instanceof nicht mit Interfaces funktioniert

Das ist ein fundamentaler Punkt, der viele TypeScript-Anfaenger stolpern laesst:

```typescript
interface Benutzer {
  name: string;
  email: string;
}

function verarbeite(daten: unknown) {
  // FEHLER! Interfaces existieren zur Laufzeit nicht:
  // if (daten instanceof Benutzer) {  // Error: 'Benutzer' only refers to a type
  //   ...
  // }
}
```

**Interfaces verschwinden durch Type Erasure.** Zur Laufzeit gibt es kein
`Benutzer`-Objekt, gegen das du pruefen koenntest. Dafuer brauchst du
den `in`-Operator oder Custom Type Guards (Sektion 05).

> 💭 **Denkfrage:** Wenn du ein Interface `Benutzer` und eine Klasse
> `BenutzerKlasse` hast — worin liegt der praktische Unterschied fuer
> Narrowing?
>
> **Antwort:** Eine Klasse existiert zur Laufzeit als Konstruktorfunktion
> und kann mit `instanceof` geprueft werden. Ein Interface ist nur ein
> Compilezeit-Konstrukt und verschwindet komplett. Fuer Interfaces musst
> du Properties pruefen (in-Operator) oder Custom Type Guards schreiben.

---

## Der in-Operator: Narrowing ueber Properties

Der `in`-Operator prueft, ob ein Objekt eine bestimmte Property hat.
TypeScript nutzt das fuer Narrowing — besonders bei **Discriminated Unions**:

```typescript annotated
interface Kreis {
  art: "kreis";
  radius: number;
}

interface Rechteck {
  art: "rechteck";
  breite: number;
  hoehe: number;
}

type Form = Kreis | Rechteck;

function flaeche(form: Form): number {
  if ("radius" in form) {
    // ^ in-Check: form hat "radius" → muss Kreis sein
    return Math.PI * form.radius ** 2;
    // ^ form ist hier Kreis — radius ist verfuegbar
  } else {
    // form muss Rechteck sein
    return form.breite * form.hoehe;
    // ^ form ist hier Rechteck
  }
}
```

### in-Operator mit Discriminated Unions

Der `in`-Operator ist besonders maechtig mit **Discriminated Unions** — also
Unions, die eine gemeinsame Property mit unterschiedlichen Literal-Werten haben:

```typescript annotated
interface LadeZustand {
  status: "laden";
}

interface ErfolgZustand {
  status: "erfolg";
  daten: string[];
}

interface FehlerZustand {
  status: "fehler";
  fehlermeldung: string;
}

type Zustand = LadeZustand | ErfolgZustand | FehlerZustand;

function zeigeZustand(zustand: Zustand) {
  if ("daten" in zustand) {
    // zustand: ErfolgZustand — nur dieser hat "daten"
    console.log(`${zustand.daten.length} Eintraege geladen`);
  } else if ("fehlermeldung" in zustand) {
    // zustand: FehlerZustand — nur dieser hat "fehlermeldung"
    console.log(`Fehler: ${zustand.fehlermeldung}`);
  } else {
    // zustand: LadeZustand
    console.log("Laden...");
  }
}
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> interface Kreis { art: "kreis"; radius: number; }
> interface Rechteck { art: "rechteck"; breite: number; hoehe: number; }
> interface Dreieck { art: "dreieck"; basis: number; hoehe: number; }
>
> type Form = Kreis | Rechteck | Dreieck;
>
> function flaeche(form: Form): number {
>   if ("radius" in form) {
>     return Math.PI * form.radius ** 2;
>   } else if ("breite" in form) {
>     return form.breite * form.hoehe;
>   } else {
>     return (form.basis * form.hoehe) / 2;
>   }
> }
> ```
> Fuege einen vierten Typ zum Union hinzu (z.B. `Ellipse` mit `halbachseA` und `halbachseB`). Wie aendert sich die Narrowing-Logik? Welche Fehler entstehen wenn ein `in`-Check fehlt?

---

## in-Operator: Feinheiten

### Optionale Properties

Vorsicht bei optionalen Properties — sie koennen `undefined` sein, existieren
aber trotzdem auf dem Objekt:

```typescript annotated
interface MitNamen {
  name: string;
  email?: string;  // optional!
}

interface OhneNamen {
  id: number;
}

function identifiziere(obj: MitNamen | OhneNamen) {
  if ("name" in obj) {
    // obj: MitNamen — name existiert
    console.log(obj.name);
  }
  if ("email" in obj) {
    // obj: MitNamen — email existiert (aber kann undefined sein!)
    console.log(obj.email?.toUpperCase());
    // ^ Optional Chaining noetig, weil email optional ist
  }
}
```

### in-Operator mit unknown

Der `in`-Operator funktioniert auch mit `unknown`, wenn du zuerst auf
`object` narrowst:

```typescript annotated
function hatName(wert: unknown): boolean {
  if (typeof wert === "object" && wert !== null && "name" in wert) {
    // ^ drei Checks: (1) ist Objekt? (2) nicht null? (3) hat "name"?
    return true;
  }
  return false;
}
```

---

## Wann was verwenden?

| Situation | Werkzeug | Beispiel |
|---|---|---|
| Primitive Typen | `typeof` | `typeof x === "string"` |
| Klassen-Instanzen | `instanceof` | `x instanceof Date` |
| Interface-Unterscheidung | `in` | `"radius" in form` |
| Discriminated Unions | `in` oder Property-Check | `"daten" in zustand` |
| null-Check | Equality | `x === null` |
| Arrays | `Array.isArray` | `Array.isArray(x)` |
| Komplexe Logik | Custom Type Guard | `isBenutzer(x)` (Sektion 05) |

---

## Was du gelernt hast

- `instanceof` narrowt auf Klassen und deren Subklassen — funktioniert nur mit Laufzeit-Konstrukten
- `instanceof` funktioniert NICHT mit Interfaces oder Type Aliases (Type Erasure!)
- Der `in`-Operator prueft ob eine Property existiert und narrowt entsprechend
- `in` ist besonders maechtig fuer Discriminated Unions
- Fuer `in` mit `unknown` musst du zuerst auf `object` (nicht null) narrowen

> 🧠 **Erklaere dir selbst:** Warum kann `instanceof` nicht mit Interfaces
> funktionieren? Was hat das mit Type Erasure zu tun?
> **Kernpunkte:** Interfaces existieren nur zur Compilezeit | Sie werden
> bei der Kompilierung entfernt | Zur Laufzeit gibt es kein Interface-Objekt |
> instanceof braucht ein Laufzeit-Objekt (Prototyp-Kette)

**Kernkonzept zum Merken:** `typeof` fuer Primitives, `instanceof` fuer
Klassen, `in` fuer Interfaces/Properties. Drei Werkzeuge, drei Einsatzgebiete.

---

> **Pausenpunkt** -- Du kennst jetzt die drei wichtigsten Narrowing-Operatoren.
> Die naechste Sektion zeigt dir feinere Werkzeuge: Equality und Truthiness.
>
> Weiter geht es mit: [Sektion 04: Equality und Truthiness](./04-equality-und-truthiness.md)
