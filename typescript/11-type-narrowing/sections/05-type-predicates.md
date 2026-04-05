# Sektion 5: Type Predicates

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Equality und Truthiness](./04-equality-und-truthiness.md)
> Naechste Sektion: [06 - Exhaustive Checks](./06-exhaustive-checks.md)

---

## Was du hier lernst

- Custom Type Guards mit dem `is`-Keyword erstellen
- Assertion Functions mit `asserts` deklarieren
- **TS 5.5 Inferred Type Predicates**: `filter()` narrowt jetzt automatisch!
- Wann du welches Werkzeug brauchst

---

## Das Problem: Grenzen der eingebauten Narrowing-Mechanismen

Manchmal reichen typeof, instanceof und in nicht aus:

```typescript
interface Fisch {
  schwimmen: () => void;
}

interface Vogel {
  fliegen: () => void;
}

function bewegen(tier: Fisch | Vogel) {
  // Wie narrowen wir hier?
  // typeof? Nein — beide sind "object"
  // instanceof? Nein — das sind Interfaces, keine Klassen
  // "schwimmen" in tier? Geht, aber wird bei komplexen Checks unhandlich
}
```

Fuer komplexe Validierungen brauchst du **Custom Type Guards** — Funktionen,
die dem Compiler sagen: "Wenn ich true zurueckgebe, hat der Wert diesen Typ."

---

## Custom Type Guards: Das is-Keyword

Ein Type Guard ist eine Funktion mit einem speziellen Rueckgabetyp:
`parameter is Typ`.

```typescript annotated
function istFisch(tier: Fisch | Vogel): tier is Fisch {
  // ^ "tier is Fisch" ist ein TYPE PREDICATE
  return (tier as Fisch).schwimmen !== undefined;
  // ^ Wir casten um die Property zu pruefen — der Cast ist hier sicher,
  //   weil wir nur pruefen ob die Property existiert
}

function bewegen(tier: Fisch | Vogel) {
  if (istFisch(tier)) {
    // ^ TypeScript vertraut dem Type Guard: tier ist Fisch
    tier.schwimmen();
  } else {
    // tier: Vogel
    tier.fliegen();
  }
}
```

### Wie Type Predicates funktionieren

1. Die Funktion gibt `boolean` zurueck (true oder false)
2. Der Rueckgabetyp `parameter is Typ` sagt TypeScript:
   "Wenn diese Funktion true zurueckgibt, ist `parameter` vom Typ `Typ`"
3. TypeScript vertraut dir — es prueft NICHT, ob deine Logik korrekt ist!

> 💭 **Denkfrage:** Type Predicates erfordern, dass DU die Logik korrekt
> implementierst. Was passiert, wenn du einen fehlerhaften Type Guard
> schreibst, der immer `true` zurueckgibt?
>
> **Antwort:** TypeScript vertraut dem Guard blind. Ein fehlerhafter
> Guard fuehrt zu Laufzeit-Fehlern — genau wie ein falsches `as`.
> Deshalb solltest du Type Guards gruendlich testen!

---

## Praxisbeispiel: API-Daten validieren

Type Guards sind ideal fuer die Validierung externer Daten:

```typescript annotated
interface Benutzer {
  id: number;
  name: string;
  email: string;
}

function istBenutzer(daten: unknown): daten is Benutzer {
  // ^ Type Predicate mit unknown — die sicherste Variante
  return (
    typeof daten === "object" &&
    daten !== null &&
    "id" in daten &&
    typeof (daten as Record<string, unknown>).id === "number" &&
    "name" in daten &&
    typeof (daten as Record<string, unknown>).name === "string" &&
    "email" in daten &&
    typeof (daten as Record<string, unknown>).email === "string"
  );
}

// Verwendung:
function verarbeiteAntwort(daten: unknown) {
  if (istBenutzer(daten)) {
    // daten: Benutzer — alle Properties sind sicher verfuegbar
    console.log(`${daten.name} (${daten.email})`);
  } else {
    console.log("Ungueltige Daten!");
  }
}
```

> 🔍 **Tieferes Wissen: Type Guards vs. Zod/Valibot**
>
> In produktivem Code werden Type Guards oft durch Validierungsbibliotheken
> ersetzt. Zod, Valibot oder io-ts generieren Type Guards automatisch aus
> einem Schema. Statt die Validierung manuell zu schreiben, definierst du
> ein Schema und bekommst den Type Guard kostenlos dazu:
>
> ```typescript
> import { z } from "zod";
> const BenutzerSchema = z.object({
>   id: z.number(),
>   name: z.string(),
>   email: z.string().email(),
> });
> type Benutzer = z.infer<typeof BenutzerSchema>;
> // BenutzerSchema.parse(daten) — wirft bei Fehler
> // BenutzerSchema.safeParse(daten) — gibt { success, data, error }
> ```

---

## Assertion Functions: asserts

Assertion Functions sind Type Guards, die keine `boolean` zurueckgeben,
sondern einen Error werfen wenn die Bedingung nicht erfuellt ist:

```typescript annotated
function assertIstString(wert: unknown): asserts wert is string {
  // ^ "asserts wert is string" — wenn die Funktion NICHT wirft,
  //   ist wert ein string
  if (typeof wert !== "string") {
    throw new Error(`Erwartet: string, erhalten: ${typeof wert}`);
  }
}

function verarbeite(eingabe: unknown) {
  assertIstString(eingabe);
  // ^ Wenn wir hier ankommen, hat assertIstString NICHT geworfen
  // eingabe: string — ab jetzt fuer den Rest des Scopes!
  console.log(eingabe.toUpperCase());
}
```

### Assertion Functions vs. Type Guards

| | Type Guard (`is`) | Assertion (`asserts`) |
|---|---|---|
| Rueckgabe | `boolean` | `void` (oder wirft Error) |
| Verwendung | In `if`-Bedingungen | Als Standalone-Statement |
| Bei Fehler | Gibt `false` zurueck | **Wirft einen Error** |
| Narrowing gilt | Im if-Block | Ab der Aufrufstelle fuer den gesamten Scope |

```typescript
// Type Guard — der Aufrufer entscheidet was bei false passiert
if (istBenutzer(daten)) {
  // nur hier genarrowed
}

// Assertion Function — wirft oder narrowt den gesamten Scope
assertIstBenutzer(daten);
// ab hier genarrowed — kein if noetig
console.log(daten.name);
```

---

## TS 5.5: Inferred Type Predicates

**Das ist eine der wichtigsten Neuerungen in TypeScript 5.5 (Juni 2024).**

Frueher musstest du bei `Array.filter()` manuell einen Type Guard schreiben,
um null-Werte zu entfernen:

```typescript
// VOR TS 5.5 — filter narrowt NICHT:
const gemischt: (string | null)[] = ["hallo", null, "welt", null];

const altesErgebnis = gemischt.filter(x => x !== null);
// Typ: (string | null)[]  — null ist IMMER NOCH im Typ!
// Man musste manuell casten oder einen Type Guard schreiben:
const altManuell = gemischt.filter((x): x is string => x !== null);
```

**Ab TS 5.5** erkennt TypeScript automatisch, dass die Callback-Funktion
ein Type Predicate ist:

```typescript annotated
// AB TS 5.5 — filter narrowt AUTOMATISCH:
const gemischt: (string | null)[] = ["hallo", null, "welt", null];

const neuesErgebnis = gemischt.filter(x => x !== null);
// ^ Typ: string[]  — null ist AUTOMATISCH weg!
// TypeScript inferiert: (x) => x is string

// Funktioniert auch mit undefined:
const mitUndefined: (number | undefined)[] = [1, undefined, 3];
const nurZahlen = mitUndefined.filter(x => x !== undefined);
// ^ Typ: number[]

// Und sogar mit komplexeren Checks:
const werte: (string | number | null)[] = ["a", 1, null, "b", 2];
const nurStrings = werte.filter(x => typeof x === "string");
// ^ Typ: string[]  — TS 5.5 inferiert den Type Predicate!
```

> 📖 **Hintergrund: Warum hat das so lange gedauert?**
>
> Inferred Type Predicates waren eine der meistgeforderten Features in
> TypeScript. Das Problem war technisch komplex: Der Compiler musste
> erkennen, dass eine Callback-Funktion eine Typ-Einschraenkung
> darstellt, ohne dass der Entwickler es explizit deklariert. Das
> TypeScript-Team (insbesondere Dan Vanderkam) implementierte dies
> fuer TS 5.5 nach jahrelanger Diskussion auf GitHub (#16069).
>
> Die Regel: TypeScript inferiert ein Type Predicate automatisch wenn:
> 1. Die Funktion keinen expliziten Rueckgabetyp hat
> 2. Die Funktion einen einzelnen return-Ausdruck hat
> 3. Die Funktion ihren Parameter nicht mutiert
> 4. Die Funktion einen Narrowing-Ausdruck zurueckgibt

> **Experiment:** Probiere folgendes im TypeScript Playground aus (TypeScript 5.5+ aktivieren):
> ```typescript
> const gemischt: (string | null)[] = ["hallo", null, "welt", null, "!"];
>
> // Ab TS 5.5 — filter narrowt AUTOMATISCH:
> const nurStrings = gemischt.filter(x => x !== null);
> // Typ: string[]  (hovere ueber nurStrings um es zu bestaetigen!)
>
> const werte: (string | number | null)[] = ["a", 1, null, "b", 2];
> const nurZahlen = werte.filter(x => typeof x === "number");
> // Typ: number[]  (TS 5.5 inferiert den Type Predicate)
> ```
> Hovere ueber `nurStrings` und `nurZahlen` — zeigt die IDE `string[]` und `number[]`? Aendere `5.5` auf `5.4` in den Playground-Einstellungen und beobachte den Typ-Unterschied.

---

## Wann welches Werkzeug?

| Situation | Werkzeug |
|---|---|
| Einfacher Typ-Check in if/switch | typeof, instanceof, in |
| Wiederverwendbare Validierungslogik | Custom Type Guard (`is`) |
| Vorbedingung die gelten MUSS | Assertion Function (`asserts`) |
| null/undefined aus Array filtern | Einfach `filter(x => x !== null)` (TS 5.5+) |
| Externe Daten validieren (Produktion) | Zod / Valibot + automatische Guards |

---

## Was du gelernt hast

- Custom Type Guards (`parameter is Typ`) geben dir volle Kontrolle ueber Narrowing
- TypeScript vertraut deinen Type Guards — stelle sicher, dass die Logik korrekt ist!
- Assertion Functions (`asserts`) narrowen den gesamten Scope und werfen bei Fehler
- **TS 5.5 Inferred Type Predicates**: `filter(x => x !== null)` narrowt jetzt automatisch
- Type Guards sind ideal fuer API-Validierung und komplexe Typ-Unterscheidungen

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `function check(x: unknown): x is string` und
> `function check(x: unknown): asserts x is string`?
> Wann verwendest du welche Variante?
> **Kernpunkte:** is gibt boolean zurueck, asserts wirft oder void |
> is wird in if-Bedingungen genutzt, asserts als Vorbedingung |
> is laesst den Aufrufer entscheiden, asserts erzwingt den gluecklichen Pfad

**Kernkonzept zum Merken:** Type Predicates sind "Narrowing-Vertraege" —
du versprichst dem Compiler, dass dein Check korrekt ist. TS 5.5 macht
viele manuelle Type Guards ueberfluessig.

---

> **Pausenpunkt** -- Fast geschafft! Die letzte Sektion zeigt dir, wie du
> sicherstellst, dass du KEINEN Fall vergisst: Exhaustive Checks mit never.
>
> Weiter geht es mit: [Sektion 06: Exhaustive Checks](./06-exhaustive-checks.md)
