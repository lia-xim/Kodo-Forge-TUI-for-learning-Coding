# Sektion 2: Readonly Arrays

> **Geschaetzte Lesezeit:** ~10 Minuten
>
> **Was du hier lernst:**
> - Warum Mutation von Arrays ein klassischer Bug-Typ ist
> - `readonly T[]` und `ReadonlyArray<T>` — zwei Wege zum selben Ziel
> - Welche Methoden auf readonly Arrays verfuegbar sind (und welche nicht)
> - Der kritische Unterschied zwischen `readonly` (Compile-Zeit) und `Object.freeze` (Laufzeit)
> - Warum `readonly` bei Funktionsparametern fast immer die richtige Wahl ist

---

## Das Problem: Ungewollte Mutation

```typescript
function verarbeite(namen: string[]): void {
  namen.sort();          // ACHTUNG: sortiert das Original-Array!
  namen.push("Neuer");   // ACHTUNG: veraendert das Original-Array!
}

const meineNamen = ["Charlie", "Alice", "Bob"];
verarbeite(meineNamen);
// meineNamen ist jetzt ["Alice", "Bob", "Charlie", "Neuer"] !!!
```

> **Experiment-Box:** Fuehre diesen Code in deiner IDE aus (`npx tsx`):
> ```typescript
> const original = [3, 1, 2];
> const referenz = original;
> referenz.sort();
> console.log(original);  // Was kommt raus?
> console.log(original === referenz);  // true oder false?
> ```
> Jetzt vergleiche mit:
> ```typescript
> const original2 = [3, 1, 2];
> const kopie = [...original2].sort();
> console.log(original2);  // Unveraendert!
> console.log(original2 === kopie);  // false!
> ```
> Der Unterschied: Referenz-Zuweisung vs Spread-Kopie.

Das ist ein klassischer Bug. Die Funktion veraendert das uebergebene Array,
obwohl der Aufrufer das nicht erwartet.

> **Hintergrund: Warum passiert das?** In JavaScript/TypeScript werden Arrays
> **per Referenz** uebergeben, nicht per Kopie. Wenn du ein Array an eine
> Funktion gibst, erhaelt die Funktion einen Zeiger auf **dasselbe Objekt im
> Speicher**. Das ist ein fundamentaler Unterschied zu primitiven Typen
> (`number`, `string`, `boolean`), die per Wert kopiert werden.
>
> ```
>   const meineNamen = ["Charlie", "Alice", "Bob"];
>                        │
>                        ▼
>                   ┌─────────────────────────────┐
>                   │ ["Charlie", "Alice", "Bob"]  │  <-- EIN Objekt im Heap
>                   └─────────────────────────────┘
>                        ▲
>                        │
>   verarbeite(namen) ---┘   namen zeigt auf DASSELBE Array!
> ```
>
> Dieses Verhalten ist bei erfahrenen JavaScript-Entwicklern bekannt, aber
> es fuehrt trotzdem staendig zu Bugs — besonders in Angular-Services oder
> React-State, wo geteilte Referenzen unbemerkt mutiert werden.

---

## Die Loesung: `readonly`

```typescript annotated
function verarbeiteSicher(namen: readonly string[]): void {
  // namen.sort();      // ← FEHLER! 'sort' existiert nicht auf readonly
  // namen.push("X");   // ← FEHLER! 'push' existiert nicht auf readonly
  // namen[0] = "Y";    // ← FEHLER! Index signature ist readonly

  // Nur lesende Operationen erlaubt:
  console.log(namen.length);          // ← OK: Laenge lesen
  console.log(namen[0]);              // ← OK: Element lesen
  console.log(namen.includes("Alice")); // ← OK: Suchen erzeugt nichts Neues

  // Neue Arrays erzeugen ist okay:
  const sortiert = [...namen].sort();    // ← OK: erst kopieren, dann sortieren
  const erweitert = [...namen, "Neuer"]; // ← OK: neues Array erzeugen
}
```

**Erklaere dir selbst:** Warum blockiert `readonly` genau die mutierenden Methoden, nicht aber `map()`, `filter()` oder `slice()`?
- `readonly` schuetzt vor In-Place-Mutation — also Methoden, die das Original veraendern (`push`, `sort`, `splice`)
- Methoden wie `map()` und `filter()` erzeugen ein **neues** Array und lassen das Original unveraendert — sie sind deshalb erlaubt
- Das folgt dem funktionalen Paradigma: "Erzeuge neue Daten statt alte zu veraendern"
```

> **Praxis-Tipp:** Mach dir die Gewohnheit: **Funktionsparameter, die Arrays
> entgegennehmen, sollten fast immer `readonly` sein.** Das ist das gleiche
> Prinzip wie `const` fuer Variablen — du kommunizierst: "Diese Funktion
> veraendert das Array nicht." In Angular-Projekten ist das besonders wichtig
> bei Services, die Arrays an mehrere Components weitergeben.

---

## Zwei Schreibweisen fuer Readonly Arrays

```
  readonly string[]         ReadonlyArray<string>
  -----------------         --------------------
  Kurzform                  Generische Form
  Haeufiger verwendet       Deutlicher/expliziter
```

Beide sind identisch im Ergebnis:

```typescript
const a: readonly string[] = ["A", "B"];
const b: ReadonlyArray<string> = ["A", "B"];
```

**Warum sind es zwei verschiedene Typen?** Weil `ReadonlyArray<T>` ein
eigenes Interface in der Standardbibliothek ist, das **nur die
nicht-mutierenden Methoden** von `Array<T>` enthaelt. `readonly T[]` ist
syntaktischer Zucker dafuer.

---

## Verfuegbare Methoden: Was geht, was nicht?

```
  Methode       string[]    readonly string[]    Veraendert Original?
  ----------    --------    -----------------    --------------------
  length        ja          ja                   nein
  [index]       ja          ja (nur lesen)       nein
  includes()    ja          ja                   nein
  indexOf()     ja          ja                   nein
  find()        ja          ja                   nein
  filter()      ja          ja                   nein (neues Array)
  map()         ja          ja                   nein (neues Array)
  forEach()     ja          ja                   nein
  slice()       ja          ja                   nein (neues Array)
  concat()      ja          ja                   nein (neues Array)
  push()        ja          NEIN                 ja
  pop()         ja          NEIN                 ja
  sort()        ja          NEIN                 ja
  splice()      ja          NEIN                 ja
  reverse()     ja          NEIN                 ja
  shift()       ja          NEIN                 ja
  unshift()     ja          NEIN                 ja
  [index] = x   ja          NEIN                 ja
```

**Das Muster:** Alles, was das Array **in-place mutiert**, ist auf `readonly`
blockiert. Alles, was ein **neues** Array zurueckgibt, funktioniert weiterhin.

> **Tieferes Wissen:** Seit ES2023 gibt es `toSorted()`, `toReversed()` und
> `toSpliced()` — das sind **nicht-mutierende** Varianten von `sort()`,
> `reverse()` und `splice()`. Sie geben ein neues Array zurueck und
> funktionieren daher auch auf `readonly` Arrays. Wenn dein Projekt ES2023
> oder hoeher targetet (in `tsconfig.json`), sind diese Methoden verfuegbar
> und die bevorzugte Wahl.

---

> **Denkfrage:** Wenn `readonly` alle mutierenden Methoden blockiert, warum
> kann man trotzdem `const arr: readonly string[] = [...readonlyArr, "neu"]`
> schreiben? Ist das nicht auch eine Aenderung?
>
> **Antwort:** Nein — der Spread-Operator erzeugt ein **neues Array**. Das
> Original wird nicht veraendert. `readonly` schuetzt vor **In-Place-Mutation**
> (push, pop, sort), nicht vor der **Erzeugung neuer Arrays**. Das ist genau
> das funktionale Programmier-Paradigma: "Erstelle neue Daten statt alte zu
> veraendern."

## `readonly` vs `Object.freeze`

```typescript
// readonly ist nur zur Compile-Zeit — es schuetzt nicht zur Laufzeit!
const arr: readonly number[] = [1, 2, 3];
// arr.push(4);  // Compile-Fehler

// Object.freeze schuetzt zur Laufzeit, aber der Typ ist weniger praezise
const frozen = Object.freeze([1, 2, 3]);
// frozen.push(4);  // Compile-Fehler UND Laufzeit-Fehler
```

**Der kritische Unterschied:**

| Aspekt | `readonly` | `Object.freeze` |
|---|---|---|
| Schutz-Zeitpunkt | Nur Compile-Zeit | Compile-Zeit UND Laufzeit |
| Nach Kompilierung | Weg (Type Erasure!) | Bleibt bestehen |
| Tiefe | Kann beliebig tief sein | **Shallow** (nur eine Ebene) |
| Performance | Kein Laufzeit-Overhead | Minimaler Overhead |
| Umgehbar durch `as any` | Ja | Nein |

> **Hintergrund: Type Erasure.** `readonly` existiert nur im TypeScript-
> Typsystem. Nach der Kompilierung zu JavaScript ist es komplett weg — es
> gibt keinen Laufzeit-Unterschied zwischen `readonly string[]` und `string[]`.
> Ein `as any`-Cast oder ein Aufruf aus einer JavaScript-Datei kann das Array
> trotzdem mutieren. `Object.freeze` ist dagegen ein echtes Laufzeit-Feature,
> aber es ist **shallow** — verschachtelte Arrays werden nicht eingefroren.

---

## Zuweisungsrichtung: readonly ist eine Einbahnstrasse

```typescript
const readonlyArr: readonly string[] = ["A", "B"];
// const mutableArr: string[] = readonlyArr;  // FEHLER!

// Aber andersherum geht es:
const mutable: string[] = ["A", "B"];
const readonlyRef: readonly string[] = mutable;  // OK!
```

**Warum diese Asymmetrie?**

```
  string[]  ──────────►  readonly string[]     OK (Rechte entfernen)
  readonly string[]  ──X──►  string[]          FEHLER (Rechte hinzufuegen)
```

Readonly **entfernen** waere unsicher — jemand koennte dann ueber die
mutable Referenz das als readonly markierte Array mutieren. Readonly
**hinzufuegen** ist sicher — weniger Rechte geben kann keinen Schaden
anrichten.

> **Denkfrage:** Warum akzeptiert eine Funktion mit `readonly string[]`
> Parameter auch ein normales `string[]` als Argument?
>
> **Antwort:** Weil die Funktion **verspricht**, das Array nicht zu
> veraendern. Ob das uebergebene Array tatsaechlich readonly ist oder nicht,
> spielt keine Rolle — die Funktion wird es nicht mutieren. Das ist wie eine
> Bibliothek, die verspricht, dein Buch nicht zu beschaedigen — es ist egal,
> ob das Buch laminiert (readonly) ist oder nicht.

---

## Praxis: readonly in Angular und React

### Angular Services

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [];

  // Gibt readonly zurueck — niemand kann das interne Array mutieren
  getUsers(): readonly User[] {
    return this.users;
  }
}

// In der Component:
// this.userService.getUsers().push(newUser);  // Compile-Fehler!
// Stattdessen muss man den Service benutzen:
// this.userService.addUser(newUser);
```

### React State

```typescript
// React state sollte nie direkt mutiert werden — readonly hilft dabei:
interface AppState {
  readonly items: readonly string[];
  readonly count: number;
}

// setState mit Spread statt Mutation:
setState(prev => ({
  ...prev,
  items: [...prev.items, newItem],
}));
```

---

## Was du gelernt hast

- Array-Mutation ueber geteilte Referenzen ist eine haeufige Bug-Quelle
- `readonly string[]` und `ReadonlyArray<string>` sind identisch
- Readonly blockiert alle **mutierenden** Methoden, laesst **lesende** durch
- `readonly` ist rein Compile-Zeit (Type Erasure), `Object.freeze` ist
  Laufzeit (aber shallow)
- Mutable zu readonly zuweisen ist OK, umgekehrt nicht
- Funktionsparameter sollten fast immer `readonly` sein

**Pausenpunkt:** In der naechsten Sektion tauchen wir in Tuples ein — die
positionstypisierte Schwester des Arrays.

---

[<-- Vorherige Sektion: Array-Grundlagen](01-array-grundlagen.md) | [Zurueck zur Uebersicht](../README.md) | [Naechste Sektion: Tuples Grundlagen -->](03-tuples-grundlagen.md)
