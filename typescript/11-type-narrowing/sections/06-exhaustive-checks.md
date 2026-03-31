# Sektion 6: Exhaustive Checks

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Type Predicates](./05-type-predicates.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Warum der `never`-Typ das perfekte Sicherheitsnetz fuer Union Types ist
- Das `assertNever`-Pattern fuer exhaustive switch-Statements
- Exhaustive if-Ketten und ihre Grenzen
- Wie du bei wachsenden Union Types automatisch Compiler-Fehler bekommst

---

## Das Problem: Vergessene Faelle

Stell dir vor, du hast einen Union Type mit mehreren Moeglichkeiten.
Alles funktioniert — bis jemand einen neuen Wert hinzufuegt:

```typescript
type Tierart = "hund" | "katze" | "vogel";

function beschreibe(tier: Tierart): string {
  switch (tier) {
    case "hund":
      return "Bellt und apportiert";
    case "katze":
      return "Schnurrt und jagt Maeuse";
    case "vogel":
      return "Singt und fliegt";
  }
}

// Alles gut! Aber jetzt fuegt jemand hinzu:
// type Tierart = "hund" | "katze" | "vogel" | "fisch";
// Die switch-Funktion hat keinen case fuer "fisch" —
// aber TypeScript meldet KEINEN Fehler!
// Die Funktion gibt bei "fisch" implizit undefined zurueck.
```

> 💭 **Denkfrage:** Warum meldet TypeScript hier keinen Fehler? Der
> Rueckgabetyp ist doch `string` — und `undefined` ist kein `string`.
>
> **Antwort:** TypeScript analysiert den switch und sieht, dass alle
> aktuellen Faelle abgedeckt sind. Wenn ein neuer Wert hinzukommt,
> aendert sich die Analyse — aber nur wenn TypeScript den switch als
> nicht-exhaustiv erkennt. Mit `noImplicitReturns` in der tsconfig
> wuerde TypeScript hier warnen, aber das ist nicht immer ausreichend.

---

## Die Loesung: never als Sicherheitsnetz

Erinnerst du dich an `never` aus Lektion 02? Der Bottom Type, dem nichts
zugewiesen werden kann? Genau DAS macht ihn zum perfekten Sicherheitsnetz:

```typescript annotated
type Tierart = "hund" | "katze" | "vogel";

function beschreibe(tier: Tierart): string {
  switch (tier) {
    case "hund":
      return "Bellt und apportiert";
    case "katze":
      return "Schnurrt und jagt Maeuse";
    case "vogel":
      return "Singt und fliegt";
    default:
      // Wenn ALLE Faelle abgedeckt sind, ist tier hier never
      const _exhaustive: never = tier;
      // ^ Wenn ein Fall fehlt, ist tier NICHT never und
      //   TypeScript meldet einen Fehler!
      return _exhaustive;
  }
}
```

### Was passiert wenn du "fisch" hinzufuegst?

```typescript
type Tierart = "hund" | "katze" | "vogel" | "fisch";

function beschreibe(tier: Tierart): string {
  switch (tier) {
    case "hund":
      return "Bellt und apportiert";
    case "katze":
      return "Schnurrt und jagt Maeuse";
    case "vogel":
      return "Singt und fliegt";
    default:
      const _exhaustive: never = tier;
      // ^ FEHLER! Type '"fisch"' is not assignable to type 'never'.
      //   TypeScript sagt dir GENAU welcher Fall fehlt!
      return _exhaustive;
  }
}
```

> 📖 **Hintergrund: Exhaustive Checks in anderen Sprachen**
>
> Die Idee des exhaustive Pattern Matching kommt aus funktionalen Sprachen:
> - **Rust**: `match` ist standardmaessig exhaustive — der Compiler
>   erzwingt, dass alle Varianten behandelt werden.
> - **Haskell**: `-Wincomplete-patterns` warnt bei fehlenden Faellen.
> - **Kotlin**: `when` mit sealed classes ist exhaustive.
> - **Java 17+**: Pattern Matching in switch mit sealed classes.
>
> TypeScript's Ansatz mit `never` ist einzigartig elegant: Es nutzt das
> Typsystem selbst als Sicherheitsnetz, statt ein separates Feature zu
> benoetigen. Anders Hejlsberg nannte dies "making illegal states
> unrepresentable" — ein Konzept aus der Typentheorie.

---

## Das assertNever-Pattern

Statt die `never`-Zuweisung in jeder Funktion zu wiederholen, extrahiere
sie in eine Hilfsfunktion:

```typescript annotated
function assertNever(wert: never): never {
  // ^ Parameter: never — akzeptiert nur, wenn alle Faelle behandelt sind
  // ^ Rueckgabe: never — die Funktion kehrt nie zurueck (throw)
  throw new Error(`Unbehandelter Fall: ${JSON.stringify(wert)}`);
}

type Tierart = "hund" | "katze" | "vogel";

function beschreibe(tier: Tierart): string {
  switch (tier) {
    case "hund":
      return "Bellt und apportiert";
    case "katze":
      return "Schnurrt und jagt Maeuse";
    case "vogel":
      return "Singt und fliegt";
    default:
      return assertNever(tier);
      // ^ Compile-Fehler wenn ein Fall fehlt
      // ^ Laufzeit-Fehler als letztes Sicherheitsnetz
  }
}
```

### Warum assertNever besser ist als der nackte never-Check

1. **Laufzeit-Schutz**: Wenn zur Laufzeit ein unerwarteter Wert ankommt
   (z.B. von einer API), bekommst du einen klaren Fehler statt `undefined`.
2. **Wiederverwendbar**: Eine Funktion fuer alle exhaustive Checks.
3. **Klare Absicht**: Der Name `assertNever` kommuniziert "hier darf nichts ankommen".

---

## Exhaustive if-Ketten

Nicht nur switch funktioniert — du kannst auch if/else-Ketten exhaustive
machen:

```typescript annotated
type Ampel = "rot" | "gelb" | "gruen";

function aktion(farbe: Ampel): string {
  if (farbe === "rot") {
    return "Stehen bleiben";
  } else if (farbe === "gelb") {
    return "Vorsicht";
  } else if (farbe === "gruen") {
    return "Gehen";
  } else {
    // farbe: never — alle Faelle abgedeckt
    return assertNever(farbe);
  }
}
```

---

## Exhaustive Checks mit Discriminated Unions

Discriminated Unions (ein gemeinsames Feld mit unterschiedlichen Werten)
sind das ideale Einsatzgebiet:

```typescript annotated
interface LadeZustand {
  typ: "laden";
}

interface ErfolgZustand {
  typ: "erfolg";
  daten: string[];
}

interface FehlerZustand {
  typ: "fehler";
  nachricht: string;
}

type AppZustand = LadeZustand | ErfolgZustand | FehlerZustand;

function rendere(zustand: AppZustand): string {
  switch (zustand.typ) {
    case "laden":
      return "<Spinner />";
    case "erfolg":
      return `<Liste items={${zustand.daten.length}} />`;
    case "fehler":
      return `<Fehler: ${zustand.nachricht} />`;
    default:
      return assertNever(zustand);
      // ^ Wenn jemand einen neuen Zustand hinzufuegt (z.B. "leer"),
      //   meldet TypeScript hier einen Fehler
  }
}
```

> ⚡ **Experiment:** Oeffne `examples/06-exhaustive-checks.ts` und fuege
> einen neuen Zustand zum Union hinzu (z.B. `{ typ: "leer" }`). Beobachte
> den Compile-Fehler im default-Zweig — er sagt dir genau, welchen
> Fall du vergessen hast.

---

## Praxis: Exhaustive Checks in React und Angular

```typescript
// React: Rendering basierend auf Zustand
function StatusBadge({ status }: { status: "aktiv" | "inaktiv" | "gesperrt" }) {
  switch (status) {
    case "aktiv":    return <span className="green">Aktiv</span>;
    case "inaktiv":  return <span className="gray">Inaktiv</span>;
    case "gesperrt": return <span className="red">Gesperrt</span>;
    default:         return assertNever(status);
  }
}

// Angular: Service-Methode mit Zustandsmaschine
function naechsterZustand(aktuell: "entwurf" | "review" | "fertig"): string {
  switch (aktuell) {
    case "entwurf": return "review";
    case "review":  return "fertig";
    case "fertig":  return "archiviert";
    default:        return assertNever(aktuell);
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum ist ein assertNever im default besser
> als gar kein default? Was passiert wenn der Union-Typ aus einer externen
> API kommt und ein unerwarteter Wert ankommt?
> **Kernpunkte:** Compile-Schutz bei Code-Aenderungen (neuer Union-Wert) |
> Laufzeit-Schutz bei API-Aenderungen (unerwarteter Wert) |
> Ohne assertNever: stille undefined-Rueckgabe | Mit assertNever:
> klarer Error mit dem unerwarteten Wert

---

## Zusammenfassung: Alle Narrowing-Mechanismen

| Mechanismus | Sektion | Anwendungsfall |
|---|---|---|
| `typeof` | 02 | Primitive Typen (string, number, boolean, ...) |
| `instanceof` | 03 | Klassen-Instanzen |
| `in` | 03 | Property-Checks, Discriminated Unions |
| `===`, `!==` | 04 | Equality, null-Checks, Literal-Narrowing |
| `==`, `!=` null | 04 | null UND undefined gleichzeitig |
| Truthiness | 04 | Schneller null/undefined-Check (Vorsicht bei 0, "") |
| `is` (Type Predicate) | 05 | Custom wiederverwendbare Type Guards |
| `asserts` | 05 | Vorbedingungen die gelten muessen |
| `filter()` (TS 5.5) | 05 | Automatisches Narrowing in Array-Operationen |
| `never` (Exhaustive) | 06 | Sicherheitsnetz fuer alle Union-Faelle |

---

## Was du gelernt hast

- `never` ist der Bottom Type — ihm kann nichts zugewiesen werden, was ihn zum perfekten Sicherheitsnetz macht
- Das `assertNever`-Pattern bietet Compile-Schutz UND Laufzeit-Schutz
- Exhaustive Checks funktionieren mit switch UND if/else-Ketten
- Discriminated Unions profitieren besonders von exhaustive Checks
- Ein fehlender Fall erzeugt einen sofortigen Compile-Fehler mit klarer Fehlermeldung

**Kernkonzept zum Merken:** assertNever ist dein doppeltes Sicherheitsnetz.
Es faengt vergessene Faelle beim Kompilieren UND unerwartete Werte zur
Laufzeit ab. Es gibt keinen Grund, es NICHT zu verwenden.

---

## Lektion 11 abgeschlossen!

Du hast alle Narrowing-Mechanismen in TypeScript kennengelernt — vom
einfachen typeof-Check bis zum exhaustive assertNever. Narrowing ist die
Bruecke zwischen allgemeinen Typen und konkreten, sicheren Operationen.

**Naechste Schritte:**
1. Arbeite die Examples durch (`examples/01-06`)
2. Loese die Exercises (`exercises/01-06`)
3. Teste dich mit dem Quiz (`npx tsx quiz.ts`)
4. Nutze das Cheatsheet als Referenz

> **Naechste Lektion:** 12 - Generics — Wie schreibst du Funktionen und Typen,
> die mit JEDEM Typ funktionieren, ohne die Typsicherheit zu verlieren?
