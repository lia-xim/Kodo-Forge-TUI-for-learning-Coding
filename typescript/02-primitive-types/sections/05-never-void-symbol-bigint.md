# Sektion 5: never, void, symbol, bigint — die Spezialisten

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - any vs unknown](./04-any-vs-unknown.md)
> Naechste Sektion: [06 - Type Widening](./06-type-widening.md)

---

## Was du hier lernst

- `never` als Bottom Type: Was "unmoeglich" in der Typentheorie bedeutet
- `void` vs `undefined`: Der subtile aber wichtige Unterschied
- `symbol` als eindeutiger Identifier und seine Rolle in JavaScript/TypeScript
- `bigint` fuer grosse Zahlen und warum ES2020 es brauchte

---

## never — der "unmoegliche" Typ

`never` ist der **Bottom Type** — er repraesentiert Werte, die
**nie auftreten koennen**.

### Wo entsteht never?

```typescript
// 1. Funktionen, die nie zurueckkehren (throw):
function throwError(msg: string): never {
  throw new Error(msg);
}

// 2. Endlosschleifen:
function infiniteLoop(): never {
  while (true) {}
}

// 3. Nach erschoepfenden Pruefungen (Exhaustive Checks):
type Color = "rot" | "gruen" | "blau";

function colorToHex(c: Color): string {
  switch (c) {
    case "rot":   return "#ff0000";
    case "gruen": return "#00ff00";
    case "blau":  return "#0000ff";
    default:
      // Wenn alle Faelle behandelt sind, ist c hier never
      const exhaustive: never = c;
      return exhaustive;
  }
}
```

### Warum ist never nuetzlich?

Der **Exhaustive Check** ist das wichtigste Pattern. Wenn du einen neuen
Wert zum `Color`-Union hinzufuegst, aber den `switch` nicht updatest,
bekommst du einen Compile-Error:

```typescript
type Color = "rot" | "gruen" | "blau" | "gelb";  // "gelb" neu hinzugefuegt

function colorToHex(c: Color): string {
  switch (c) {
    case "rot":   return "#ff0000";
    case "gruen": return "#00ff00";
    case "blau":  return "#0000ff";
    default:
      const exhaustive: never = c;
      //    ^^^^^^^^^^^^^^^^^^
      // Error! Type '"gelb"' is not assignable to type 'never'.
      return exhaustive;
  }
}
```

> 📖 **Hintergrund: never in der Typentheorie**
>
> In der Typentheorie ist der Bottom Type die **leere Menge**: Es gibt
> keinen Wert, der diesen Typ hat. Trotzdem ist er jedem Typ zuweisbar —
> genau wie die leere Menge Teilmenge jeder anderen Menge ist.
>
> Das klingt paradox, ist aber logisch: Die Aussage "Alle Elemente der
> leeren Menge sind Strings" ist **wahr** (vacuous truth), weil es
> keine Gegenbeispiele gibt. Deshalb ist `never` ein Subtyp von `string`,
> `number`, und jedem anderen Typ.
>
> Praktisch bedeutet das: Eine Funktion mit Rueckgabetyp `never` kann
> ueberall eingesetzt werden, wo ein konkreter Typ erwartet wird — weil
> sie sowieso nie zurueckkehrt.

> ⚡ **Praxis-Tipp: Exhaustive Check als Utility-Funktion**
>
> ```typescript
> // Einmal definieren, ueberall verwenden:
> function assertNever(value: never): never {
>   throw new Error(`Unerwarteter Wert: ${value}`);
> }
>
> // Verwendung:
> function colorToHex(c: Color): string {
>   switch (c) {
>     case "rot":   return "#ff0000";
>     case "gruen": return "#00ff00";
>     case "blau":  return "#0000ff";
>     default: return assertNever(c);
>   }
> }
> ```
>
> Diese Funktion sorgt fuer Compilezeit-Sicherheit UND Laufzeit-Sicherheit:
> Compile-Error bei vergessenen Faellen, und ein klarer Error falls doch
> ein unbekannter Wert ankommt.

---

## void — fuer Funktionen ohne Rueckgabe

`void` bedeutet: "Diese Funktion gibt nichts Sinnvolles zurueck."

```typescript
function logMessage(msg: string): void {
  console.log(msg);
  // Kein return noetig
}
```

### void ist NICHT das gleiche wie undefined

```typescript
function returnVoid(): void {}
function returnUndefined(): undefined {
  return undefined;  // Muss explizit zurueckgegeben werden!
}
```

> 🔍 **Tieferes Wissen: Warum der Unterschied zwischen void und undefined?**
>
> Der Unterschied liegt in der **Callback-Kompatibilitaet**. Wenn ein
> Callback-Typ `void` zurueckgibt, darf die Implementation trotzdem
> einen Wert zurueckgeben — er wird einfach ignoriert:
>
> ```typescript
> // Array.forEach erwartet (value) => void
> const arr = [1, 2, 3];
>
> // Array.push gibt number zurueck — trotzdem kein Error:
> arr.forEach((v) => arr.push(v));  // OK
>
> // Waere der Typ (value) => undefined, muesste die
> // Implementation explizit undefined zurueckgeben:
> type StrictCallback = (value: number) => undefined;
> const cb: StrictCallback = (v) => arr.push(v);  // Error!
> ```
>
> Diese Designentscheidung macht TypeScript kompatibel mit dem
> realen JavaScript-Oekosystem, wo Callbacks haeufig einen Wert
> zurueckgeben, der vom Aufrufer ignoriert wird.

> 💭 **Denkfrage:** Warum hat TypeScript sowohl `void` als auch `undefined`,
> wenn doch `void`-Funktionen zur Laufzeit `undefined` zurueckgeben?
>
> **Antwort:** `void` ist ein **Signal an den Aufrufer**: "Ignoriere den
> Rueckgabewert." `undefined` ist ein **konkreter Wert**: "Der Rueckgabewert
> ist `undefined`." Der Unterschied ist semantisch — `void` sagt "egal was
> zurueckkommt", `undefined` sagt "es kommt genau `undefined` zurueck."

---

## symbol — der unterschaetzte Typ

`symbol` ist ein primitiver Typ, der **garantiert eindeutige** Werte
erzeugt. Er wurde in ES2015 eingefuehrt.

```typescript
const sym1 = Symbol("beschreibung");
const sym2 = Symbol("beschreibung");

console.log(sym1 === sym2);  // false! Jedes Symbol ist einzigartig
// Die Beschreibung ist nur fuer Debugging — sie beeinflusst die Identitaet nicht
```

### Wofuer braucht man Symbols?

**1. Als eindeutige Property-Keys**, die nie kollidieren:

```typescript
const id = Symbol("id");
const user = {
  name: "Max",
  [id]: 12345  // Unsichtbar in for...in und JSON.stringify!
};

console.log(user[id]);       // 12345
console.log(JSON.stringify(user));  // {"name":"Max"} — Symbol-Key fehlt!
```

**2. Well-Known Symbols** — fuer Sprachfeatures:

```typescript
// Symbol.iterator macht Objekte iterierbar (for...of):
class Range {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
}

for (const n of new Range(1, 5)) {
  console.log(n);  // 1, 2, 3, 4, 5
}
```

**3. Symbol.for()** — globale Symbol-Registry:

```typescript
const s1 = Symbol.for("app.id");
const s2 = Symbol.for("app.id");
console.log(s1 === s2);  // true! Gleicher Key = gleiches Symbol
// Symbol.for() sucht in einer globalen Registry
```

### unique symbol in TypeScript

```typescript
// "unique symbol" ist ein Subtyp von symbol — wie ein Literal Type
const mySymbol: unique symbol = Symbol("mein");

// Nur als const deklarierbar:
// let notUnique: unique symbol = Symbol("x");  // Error!

// Nuetzlich fuer typsichere Property-Zugriffe:
interface HasId {
  [mySymbol]: number;
}
```

> 📖 **Hintergrund: Warum wurden Symbols eingefuehrt?**
>
> Vor ES2015 hatten JavaScript-Objekte nur String-Keys. Das fuehrte
> zu **Namenskollisionen**: Wenn zwei Libraries das gleiche Property
> (z.B. `id` oder `type`) auf einem Objekt setzen, ueberschreiben sie
> sich gegenseitig.
>
> Symbols loesen das Problem: Jedes Symbol ist einzigartig, also koennen
> verschiedene Libraries verschiedene Symbol-Keys verwenden, ohne zu
> kollidieren. In der Praxis nutzen vor allem **Framework-Interna**
> Symbols (z.B. Angular's DI-System intern, React's `$$typeof` fuer
> Element-Validierung).

---

## bigint — wenn number nicht reicht

`bigint` kann **beliebig grosse** ganze Zahlen darstellen. Es wurde
in ES2020 eingefuehrt.

```typescript
const gross: bigint = 9007199254740991n;     // n-Suffix
const nochGroesser: bigint = BigInt("123456789012345678901234567890");

// Arithmetik funktioniert wie erwartet:
const summe = 1n + 2n;  // 3n

// ABER: number und bigint koennen NICHT gemischt werden!
// const mix = 1n + 2;     // Error! Cannot mix bigint and other types
const ok = 1n + BigInt(2);  // OK: 3n
```

> 📖 **Hintergrund: Warum brauchte ES2020 bigint?**
>
> JavaScript hatte schon immer ein Problem mit grossen Zahlen:
> `Number.MAX_SAFE_INTEGER` (2^53 - 1 = 9007199254740991) war die
> Grenze. Darueber hinaus verliert `number` Praezision:
>
> ```typescript
> 9007199254740991 + 1;   // 9007199254740992 — korrekt
> 9007199254740991 + 2;   // 9007199254740992 — FALSCH!
> ```
>
> Das wurde zum realen Problem als Twitter (jetzt X) ihre
> **Snowflake IDs** einfuehrte — numerische IDs die groesser als 2^53
> waren. Viele JavaScript-Apps zeigten falsche Tweet-IDs an, weil
> `JSON.parse()` grosse Zahlen automatisch zu `number` konvertiert und
> dabei Praezision verliert.
>
> Ein weiterer Treiber war Kryptographie: Moderne Krypto-Algorithmen
> arbeiten mit Zahlen die hunderte Stellen haben — unmoeglich mit
> `number`.

### Wann bigint verwenden?

| Szenario | Empfehlung | Warum |
|---|---|---|
| IDs aus Datenbanken (PostgreSQL bigint) | `string` oder `bigint` | IDs > 2^53 verlieren Praezision als number |
| Kryptographische Berechnungen | `bigint` | Grosse Primzahlen, modulare Arithmetik |
| Unix-Timestamps mit Nanosekunden | `bigint` | Ueberschreitet MAX_SAFE_INTEGER |
| Kleine Zahlen (Alter, Index) | `number` | bigint waere Overkill |

### Einschraenkungen von bigint

```typescript
// Kein Math-Objekt:
// Math.round(1n);         // Error!
// Math.floor(1n);         // Error!

// Kein JSON:
// JSON.stringify(1n);     // TypeError: Do not know how to serialize a BigInt
// Loesung:
JSON.stringify(1n, (_, v) => typeof v === "bigint" ? v.toString() : v);

// Langsamer als number:
// bigint-Arithmetik ist ~10-100x langsamer als number
// Verwende bigint nur wenn noetig!
```

> ⚡ **Praxis-Tipp: Grosse IDs in Angular/React**
>
> ```typescript
> // API liefert grosse numerische IDs als Strings (best practice):
> interface ApiUser {
>   id: string;     // "1580661436132757507" — als string sicher!
>   name: string;
> }
>
> // FALSCH: Als number parsen
> const userId: number = parseInt(apiResponse.id);
> // 1580661436132757507 wird zu 1580661436132757500 — Praezisionsverlust!
>
> // RICHTIG: Als string lassen ODER als bigint:
> const userIdBig: bigint = BigInt(apiResponse.id);  // Exakt
>
> // In der Praxis: Die meisten APIs liefern grosse IDs als string,
> // und du solltest sie als string weiterverarbeiten.
> ```

---

## Zwischenzusammenfassung: Die Spezialisten

| Typ | Bedeutung | Kernverwendung |
|---|---|---|
| `never` | "Kann nie auftreten" | Exhaustive Checks, Funktionen die nie zurueckkehren |
| `void` | "Kein sinnvoller Rueckgabewert" | Callbacks, Event Handler, Side-Effect-Funktionen |
| `symbol` | "Garantiert eindeutig" | Property-Keys, Well-Known Symbols, Framework-Interna |
| `bigint` | "Beliebig grosse Ganzzahlen" | Grosse IDs, Kryptographie, Praezisions-Arithmetik |

---

## Was du gelernt hast

- `never` ist der Bottom Type und essenziell fuer **Exhaustive Checks**
- `void` ist nicht `undefined` — `void` erlaubt Callbacks einen Wert zurueckzugeben
- `symbol` erzeugt garantiert eindeutige Werte und loest Namenskollisionen
- `bigint` ist fuer Zahlen ueber 2^53 — aber langsamer und nicht JSON-kompatibel

**Kernkonzept zum Merken:** `never` als Exhaustive Check in `switch`-Statements ist eines der wertvollsten Patterns in TypeScript. Es garantiert Compilezeit-Sicherheit wenn Union Types erweitert werden.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> // Exhaustive Check mit never
> type Farbe = "rot" | "gruen" | "blau";
>
> function farbeZuHex(f: Farbe): string {
>   switch (f) {
>     case "rot":   return "#ff0000";
>     case "gruen": return "#00ff00";
>     case "blau":  return "#0000ff";
>     default:
>       const _check: never = f; // Compile-Error wenn ein Fall fehlt!
>       return _check;
>   }
> }
>
> // Praezisionsverlust: number vs bigint
> const max = Number.MAX_SAFE_INTEGER; // 9007199254740991
> console.log(max + 1);  // 9007199254740992 — OK
> console.log(max + 2);  // 9007199254740992 — FALSCH! Gleich wie +1
>
> const maxBig = BigInt(Number.MAX_SAFE_INTEGER);
> console.log(maxBig + 1n); // 9007199254740992n — korrekt!
> console.log(maxBig + 2n); // 9007199254740993n — korrekt!
> ```
> Fuege `"gelb"` zur `Farbe`-Union hinzu, ohne den `switch` anzupassen.
> Welcher Fehler erscheint im `default`-Zweig — und warum ist das wertvoller
> als ein Laufzeitfehler? Vergleiche dann die `number`- und `bigint`-Ergebnisse:
> ab welchem Punkt weichen sie voneinander ab?

---

> **Pausenpunkt** -- Du kennst jetzt alle primitiven Typen in TypeScript.
> Die letzte Sektion verbindet alles mit einem der subtilsten Konzepte:
> Type Widening.
>
> Weiter geht es mit: [Sektion 06: Type Widening](./06-type-widening.md)
