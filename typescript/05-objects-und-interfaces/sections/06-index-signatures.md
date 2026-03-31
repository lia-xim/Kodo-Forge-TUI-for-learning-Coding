# 06 -- Index Signatures

> Geschaetzte Lesezeit: ~10 Minuten

## Was du hier lernst

- Was **Index Signatures** sind und wann du sie brauchst
- Wie du feste und dynamische Properties kombinierst
- `Record<K, V>` als elegante Alternative
- Die `noUncheckedIndexedAccess`-Compiler-Option (warum du sie aktivieren solltest)
- Praxis-Patterns fuer Dictionaries und Lookup-Maps

---

## Das Problem: Unbekannte Property-Namen

Manchmal kennst du die Property-Namen nicht im Voraus. Ein Woerterbuch, eine
Konfigurationsdatei, ein Cache -- die Keys sind dynamisch:

```typescript
// Wie typisierst du das?
const translations = {
  hello: "hallo",
  goodbye: "tschuess",
  thanks: "danke",
  // ... beliebig viele weitere
};
```

Dafuer gibt es **Index Signatures**:

```typescript
interface StringDictionary {
  [key: string]: string;  // Jeder string-Key mappt auf einen string-Wert
}

const translations: StringDictionary = {
  hello: "hallo",
  goodbye: "tschuess",
  thanks: "danke",
};
```

> **Analogie:** Eine Index Signature ist wie ein **Bibliothekskatalog**. Du weisst
> nicht im Voraus, welche Buecher (Keys) es gibt, aber du weisst, dass jeder Eintrag
> ein Buch (bestimmter Typ) ist. Die Signatur beschreibt die FORM des Katalogs,
> nicht seinen Inhalt.

---

## Key-Typen: Was darf ein Index sein?

Index Signatures erlauben nur bestimmte Key-Typen:

```typescript
// Erlaubt:
interface WithStringKeys { [key: string]: any; }
interface WithNumberKeys { [key: number]: any; }
interface WithSymbolKeys { [key: symbol]: any; }

// NICHT erlaubt:
// interface Bad { [key: boolean]: any; }  // FEHLER!
```

> **Tieferes Wissen:** Warum nur `string`, `number` und `symbol`? Weil das die
> einzigen Typen sind, die JavaScript als Property-Keys erlaubt. Alle anderen Werte
> werden zur Laufzeit automatisch zu Strings konvertiert (`toString()`).
>
> Deshalb ist `[key: number]` eigentlich ein Spezialfall von `[key: string]` --
> `obj[0]` und `obj["0"]` greifen auf dieselbe Property zu. TypeScript haelt
> die Unterscheidung aufrecht, weil sie fuer Arrays nuetzlich ist.

---

## Feste + Dynamische Properties mischen

Du kannst bekannte Properties mit Index Signatures kombinieren -- aber es gibt
eine Einschraenkung:

```typescript
// FEHLER: 'version' (number) passt nicht zur Index Signature (string)
interface Config {
  name: string;
  version: number;          // number != string!
  [key: string]: string;    // Alle Werte muessen string sein
}

// LOESUNG: Union-Typ fuer die Index Signature
interface ConfigFixed {
  name: string;
  version: number;
  [key: string]: string | number;  // Beide Typen erlaubt
}
```

**Die Regel:** Alle **festen** Property-Typen muessen zum Index-Signature-Typ **kompatibel**
sein. Der Index-Typ muss ein Supertyp aller festen Typen sein.

```
  Feste Properties muessen zum Index passen
  ──────────────────────────────────────────

  interface X {
    name: string;              // string   -- passt zu string | number
    version: number;           // number   -- passt zu string | number
    [key: string]: string | number;  // <-- Muss ALLE festen Typen abdecken
  }
```

---

## Record<K, V> -- Die elegante Alternative

Das Utility Type `Record` ist oft sauberer als Index Signatures:

```typescript
// Statt:
interface NumberMap {
  [key: string]: number;
}

// Besser:
type NumberMap = Record<string, number>;
```

### Record mit spezifischen Keys

Der wahre Vorteil von `Record` zeigt sich bei **eingeschraenkten Keys**:

```typescript
type Status = "pending" | "active" | "closed";

// Record erzwingt, dass JEDER Status einen Wert hat:
type StatusCounts = Record<Status, number>;

// Equivalent zu:
// { pending: number; active: number; closed: number }

const counts: StatusCounts = {
  pending: 5,
  active: 12,
  closed: 88,
  // Fehlt einer? FEHLER!
};
```

> **Praxis-Tipp:** `Record<Status, T>` stellt sicher, dass du keinen Status vergisst.
> Das ist besonders in Angular-Services und React-Reducern nuetzlich:
> ```typescript
> type Theme = "light" | "dark" | "system";
> const themeLabels: Record<Theme, string> = {
>   light: "Helles Design",
>   dark: "Dunkles Design",
>   system: "Systemeinstellung",
>   // Fuergen wir spaeter "high-contrast" hinzu,
>   // ERZWINGT der Compiler, es hier zu ergaenzen!
> };
> ```

---

## Die `noUncheckedIndexedAccess`-Falle

Standardmaessig luegt TypeScript bei Index Signatures:

```typescript
interface Dict {
  [key: string]: string;
}

const dict: Dict = { hello: "hallo" };

// TypeScript sagt: typ ist "string"
const value = dict["nichtVorhanden"];
// Aber zur Laufzeit: undefined!
```

TypeScript nimmt an, dass jeder Key existiert -- das ist **unsound** (nicht typsicher).

### Die Loesung: `noUncheckedIndexedAccess`

In deiner `tsconfig.json`:

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

Mit dieser Option:

```typescript
const value = dict["nichtVorhanden"];
//    ^? string | undefined  <-- jetzt korrekt!

// Du MUSST jetzt pruefen:
if (value !== undefined) {
  console.log(value.toUpperCase());  // OK -- narrowed
}

// Oder mit Nullish Coalescing:
const safe = dict["nichtVorhanden"] ?? "Fallback";
```

> **Praxis-Tipp:** Aktiviere `noUncheckedIndexedAccess` in jedem neuen Projekt.
> Es ist in `strict` nicht enthalten (aus Rueckwaertskompatibilitaet), aber es
> verhindert eine ganze Klasse von `undefined`-Bugs zur Laufzeit.
>
> Angular-Projekte seit Angular 16+ haben es standardmaessig aktiviert.

---

## Praxis-Patterns

### Pattern 1: Lookup-Map (Angular/React)

```typescript
// Fehlermeldungen als Lookup-Map
type ErrorCode = "NOT_FOUND" | "FORBIDDEN" | "TIMEOUT" | "UNKNOWN";

const errorMessages: Record<ErrorCode, string> = {
  NOT_FOUND: "Die Ressource wurde nicht gefunden.",
  FORBIDDEN: "Zugriff verweigert.",
  TIMEOUT: "Die Anfrage hat zu lange gedauert.",
  UNKNOWN: "Ein unbekannter Fehler ist aufgetreten.",
};

function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code];  // Typ-sicher! Jeder Code ist abgedeckt.
}
```

> **Denkfrage:** Du hast `Record<"a" | "b", number>` und `Record<string, number>`.
> Welcher ist strenger? Warum?
>
> **Antwort:** `Record<"a" | "b", number>` ist strenger -- er erzwingt, dass NUR
> `"a"` und `"b"` als Keys existieren und BEIDE vorhanden sein muessen.
> `Record<string, number>` erlaubt beliebige Keys und erzwingt keinen davon.
> In der Praxis: Nutze den Union-Key-Variante wo immer moeglich, weil der Compiler
> dann Vollstaendigkeit pruefen kann.

> **Experiment-Box:** Erstelle im Playground:
> ```typescript
> type Status = "active" | "inactive" | "banned";
> const labels: Record<Status, string> = {
>   active: "Aktiv",
>   inactive: "Inaktiv",
>   // banned fehlt -- was passiert?
> };
> ```
> Beobachte die Fehlermeldung. Fuege jetzt `"suspended"` zum `Status`-Union hinzu
> und schau, wie der Compiler dich sofort darauf aufmerksam macht, dass der neue
> Status im `labels`-Objekt fehlt. **Das ist das Exhaustiveness-Pattern in Aktion.**

### Pattern 2: Dynamischer Cache

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

type Cache<T> = Record<string, CacheEntry<T> | undefined>;

function getFromCache<T>(cache: Cache<T>, key: string): T | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) return null;
  return entry.data;
}
```

---

## Zusammenfassung

| Konzept | Beschreibung |
|---------|-------------|
| Index Signature | `[key: string]: Type` -- dynamische Keys |
| Erlaubte Key-Typen | `string`, `number`, `symbol` |
| Feste + Index | Feste Typen muessen zum Index-Typ passen |
| `Record<K, V>` | Elegante Alternative zu Index Signatures |
| `Record<Union, V>` | Erzwingt Vollstaendigkeit bei Union-Keys |
| `noUncheckedIndexedAccess` | Gibt `T \| undefined` statt `T` zurueck |

---

**Was du gelernt hast:** Du kannst dynamische Objektstrukturen typisieren und weisst,
warum `noUncheckedIndexedAccess` wichtig ist.

| [<-- Vorherige Sektion](05-readonly-und-optional.md) | [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Intersection & Utility Types -->](07-intersection-und-utility-types.md) |
