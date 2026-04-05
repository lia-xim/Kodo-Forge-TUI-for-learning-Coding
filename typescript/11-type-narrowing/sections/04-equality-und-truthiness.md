# Sektion 4: Equality und Truthiness Narrowing

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - instanceof und in](./03-instanceof-und-in.md)
> Naechste Sektion: [05 - Type Predicates](./05-type-predicates.md)

---

## Was du hier lernst

- Wie `===`, `!==`, `==` und `!=` Typen narrowen
- Equality Narrowing: Beide Seiten eines Vergleichs werden genarrowed
- Truthiness Narrowing: `if (x)` schliesst null, undefined, 0, "" und false aus
- Warum Truthiness-Checks bei 0 und "" gefaehrlich sein koennen
- Nullish Narrowing mit `??` und `?.`

---

## Equality Narrowing

### Strikte Gleichheit (===, !==)

Die strikte Gleichheit narrowt **beide Seiten** des Vergleichs auf den
gemeinsamen Typ:

```typescript annotated
function vergleiche(a: string | number, b: string | boolean) {
  if (a === b) {
    // ^ Einziger gemeinsamer Typ: string
    // a: string, b: string
    console.log(a.toUpperCase());  // OK!
    console.log(b.toUpperCase());  // OK!
  }
}
```

TypeScript analysiert: `a` kann string oder number sein, `b` kann string oder
boolean sein. Der einzige Typ, bei dem `===` true sein kann, ist `string`.
Also werden BEIDE Variablen zu string genarrowed.

### null und undefined mit === pruefen

```typescript annotated
function sicher(wert: string | null | undefined) {
  if (wert !== null && wert !== undefined) {
    // wert: string — beide eliminiert
    console.log(wert.toUpperCase());
  }

  // Kuerzere Alternative:
  if (wert != null) {
    // ^ Achtung: LOSE Gleichheit (==) !
    // wert: string — null UND undefined eliminiert
    console.log(wert.toUpperCase());
  }
}
```

> 📖 **Hintergrund: Die einzig gute Verwendung von == (lose Gleichheit)**
>
> In JavaScript gilt `null == undefined` als `true`, aber `null == 0`,
> `null == ""` und `null == false` sind alle `false`. Das bedeutet:
> `x != null` ist eine sichere Kurzform fuer `x !== null && x !== undefined`.
>
> Dies ist einer der wenigen Faelle, wo die lose Gleichheit (`==`) absichtlich
> nuetzlich ist. Die meisten Style Guides erlauben `== null` als Ausnahme
> von der "immer ===" Regel. ESLint's `eqeqeq`-Regel hat sogar eine
> spezielle Option `"allow-null"` dafuer.

---

## Equality Narrowing in der Praxis

### switch-Statements

`switch` verwendet intern `===`, daher funktioniert Narrowing perfekt:

```typescript annotated
type Status = "laden" | "erfolg" | "fehler";

function zeigeStatus(status: Status) {
  switch (status) {
    case "laden":
      // status: "laden"
      console.log("Lade...");
      break;
    case "erfolg":
      // status: "erfolg"
      console.log("Fertig!");
      break;
    case "fehler":
      // status: "fehler"
      console.log("Fehler!");
      break;
  }
}
```

### Vergleich mit einer Konstante

```typescript annotated
function istAdmin(rolle: "admin" | "user" | "guest"): boolean {
  // Vergleich mit Literal narrowt den Typ:
  if (rolle === "admin") {
    // rolle: "admin"
    return true;
  }
  // rolle: "user" | "guest"
  return false;
}
```

---

## Truthiness Narrowing

In JavaScript sind bestimmte Werte "falsy" — sie werden in einem
boolean-Kontext zu `false` ausgewertet:

```
Falsy-Werte: false, 0, -0, 0n, "", null, undefined, NaN
Alles andere ist "truthy".
```

TypeScript nutzt Truthiness-Checks fuer Narrowing:

```typescript annotated
function drucke(wert: string | null | undefined) {
  if (wert) {
    // ^ Truthiness-Check: null, undefined UND "" sind weg
    // wert: string  (aber NICHT der leere String!)
    console.log(wert.toUpperCase());
  }
}
```

> 💭 **Denkfrage:** Warum ist `if (wert)` NICHT das Gleiche wie
> `if (wert !== null && wert !== undefined)`? Welcher Fall wird
> faelschlicherweise ausgeschlossen?
>
> **Antwort:** `if (wert)` schliesst auch `""` (leerer String), `0`
> und `false` aus! Wenn du nur null/undefined eliminieren willst,
> verwende `if (wert != null)` oder `if (wert !== null && wert !== undefined)`.

### Die Truthiness-Falle bei 0 und ""

```typescript
function verarbeiteLaenge(laenge: number | null): string {
  // GEFAHR: 0 ist eine gueltige Laenge!
  if (laenge) {
    // laenge: number — aber 0 wurde FAELSCHLICH ausgeschlossen!
    return `Laenge: ${laenge}`;
  }
  return "Keine Laenge";
}

verarbeiteLaenge(0);    // "Keine Laenge" — FALSCH! 0 ist gueltig!
verarbeiteLaenge(null); // "Keine Laenge" — korrekt
verarbeiteLaenge(5);    // "Laenge: 5"    — korrekt

// BESSER: Explizit auf null pruefen
function verarbeiteLaengeSicher(laenge: number | null): string {
  if (laenge !== null) {
    return `Laenge: ${laenge}`;  // 0 wird korrekt behandelt
  }
  return "Keine Laenge";
}
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> function truthinessDemo(wert: string | number | null | undefined) {
>   if (wert) {
>     console.log(`Truthy: ${JSON.stringify(wert)}`);
>   } else {
>     console.log(`Falsy: ${JSON.stringify(wert)}`);
>   }
> }
>
> truthinessDemo("hallo");  // Truthy
> truthinessDemo("");       // Falsy — ACHTUNG!
> truthinessDemo(0);        // Falsy — ACHTUNG!
> truthinessDemo(null);     // Falsy
> truthinessDemo(42);       // Truthy
> ```
> Welche Werte landen unerwartet im Falsy-Zweig? Ersetze `if (wert)` durch `if (wert != null)` — was aendert sich?

---

## Truthiness mit logischen Operatoren

TypeScript narrowt auch bei `&&`, `||` und `!`:

```typescript annotated
function verarbeite(wert: string | null) {
  // && narrowt die linke Seite, bevor die rechte ausgefuehrt wird
  const ergebnis = wert && wert.toUpperCase();
  // ^ Wenn wert null ist: ergebnis = null
  // ^ Wenn wert string ist: ergebnis = wert.toUpperCase()

  // ! (Negation) kehrt das Narrowing um
  if (!wert) {
    // wert: null (string ist weg, weil es truthy waere)
    // Achtung: "" wuerde auch hier landen!
    return;
  }
  // wert: string
  console.log(wert);
}
```

### Der Doppel-Ausrufezeichen-Trick

```typescript
// !! konvertiert jeden Wert zu boolean
const hatText = !!wert;  // true wenn wert truthy ist

// TypeScript nutzt das NICHT fuer Narrowing:
if (!!wert) {
  // TypeScript narrowt hier genauso wie bei if (wert)
}
```

---

## Nullish Narrowing

Die moderneren Nullish-Operatoren (`??`, `?.`) narrowen ebenfalls:

```typescript annotated
interface Config {
  port?: number;
  host?: string;
}

function starte(config: Config) {
  // ?? narrowt: Wenn config.port null/undefined ist, nimm 3000
  const port = config.port ?? 3000;
  // ^ port: number (nicht mehr number | undefined)

  // ?. narrowt indirekt:
  const laenge = config.host?.length;
  // ^ laenge: number | undefined
  // Wenn config.host undefined ist, wird ?.length zu undefined
  // Wenn config.host ein String ist, wird ?.length zu number
}
```

### Kombination: Truthiness + Nullish

```typescript annotated
function gruss(name: string | null | undefined): string {
  // Schritt 1: Nullish Coalescing fuer Default-Wert
  const sichererName = name ?? "Gast";
  // ^ sichererName: string (null/undefined eliminiert)

  // Schritt 2: Truthiness fuer leeren String
  if (sichererName) {
    return `Hallo, ${sichererName}!`;
  }
  return "Hallo!";
}
```

---

## Zusammenfassung der Narrowing-Operatoren

| Operator | Eliminiert | Beispiel | Vorsicht |
|---|---|---|---|
| `=== null` | null | `if (x === null)` | Nur null, nicht undefined |
| `!== null` | null | `if (x !== null)` | undefined bleibt |
| `!= null` | null + undefined | `if (x != null)` | Lose Gleichheit! |
| `if (x)` | alle falsy-Werte | `if (wert)` | 0, "" und false gehen verloren |
| `??` | null + undefined | `x ?? "default"` | Sicher fuer 0 und "" |
| `?.` | null + undefined | `x?.prop` | Ergebnis kann undefined sein |

---

## Was du gelernt hast

- `===` narrowt beide Seiten eines Vergleichs auf den gemeinsamen Typ
- `!= null` ist eine sichere Kurzform fuer "weder null noch undefined"
- Truthiness (`if (x)`) eliminiert null, undefined, 0, "", false und NaN — Vorsicht bei 0 und ""!
- `??` und `?.` sind die sichersten Werkzeuge fuer Null-/Undefined-Handling
- switch-Statements narrowen automatisch durch `===`-Semantik

> 🧠 **Erklaere dir selbst:** Wann wuerdest du `if (x)` verwenden und
> wann `if (x != null)`? Nenne je ein Beispiel wo das eine richtig und
> das andere falsch waere.
> **Kernpunkte:** if (x) wenn 0/""/false ungueltig sind (z.B. Pflichtfeld-Check) |
> if (x != null) wenn 0/""/false gueltig sind (z.B. Portnummer, Nickname)

**Kernkonzept zum Merken:** Truthiness ist ein grobes Werkzeug —
es eliminiert ALLES was falsy ist. Wenn 0, "" oder false gueltige
Werte sind, verwende stattdessen explizite null/undefined-Checks.

---

> **Pausenpunkt** -- Die Grundlagen sind komplett. Die naechsten zwei Sektionen
> zeigen dir fortgeschrittene Werkzeuge: Custom Type Guards und Exhaustive Checks.
>
> Weiter geht es mit: [Sektion 05: Type Predicates](./05-type-predicates.md)
