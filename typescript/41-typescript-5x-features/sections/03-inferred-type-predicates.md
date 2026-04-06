# Sektion 3: Inferred Type Predicates — TypeScript 5.5

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Moderne Module](./02-moderne-module-verbatim-bundler.md)
> Naechste Sektion: [04 - Array und Control-Flow](./04-array-und-controlflow-improvements.md)

---

## Was du hier lernst

- Warum `.filter(x => x !== null)` **jahrelang den falschen Typ** zurueckgab
- Was **Type Predicates** sind und wie TypeScript sie jetzt **automatisch inferiert**
- Wie TypeScript 5.5 dieses Verhalten analysiert und was die **Grenzen** des Systems sind
- Warum dieses Feature in **Angular Signals** und **React** besonders praktisch ist

---

## Das jahrelange Aergernis

Wenn du TypeScript-Entwickler fragst, welche Typ-Einschraenkung sie am meisten
genaervt hat, werden viele dieselbe Antwort geben:

```typescript
const numbers = [1, null, 2, null, 3];
const filtered = numbers.filter(x => x !== null);
// Was ist der Typ von filtered?

// ERWARTUNG: number[]
// REALITAET (vor TS 5.5): (number | null)[]
```

Warte. Du hast gerade explizit `null` herausgefiltert. TypeScript hat das gesehen.
Und trotzdem behauptet TypeScript, `null` koennte noch drin sein?

Ja. Und es hatte einen Grund — einen schlechten, aber nachvollziehbaren.

### Warum TypeScript das nicht wusste

Das Problem liegt in wie `Array.prototype.filter` getypt ist:

```typescript
// Die naive Signatur von filter() (vereinfacht):
filter(predicate: (value: T) => boolean): T[];
//                              ^^^^^^^ boolean — nicht genug Information!
```

Der Rueckgabetyp `boolean` sagt TypeScript: "Diese Funktion gibt true oder false zurueck."
Aber er sagt **nicht**: "Wenn diese Funktion true zurueckgibt, dann ist der Wert kein null."

Um das korrekt zu typen, braucht man einen **Type Predicate** — eine spezielle Signatur
die sagt: "Wenn true, dann ist x von Typ T":

```typescript
// Manueller Type Predicate (vor TS 5.5 notwendig):
function isNotNull<T>(x: T | null): x is T {
  //                                ^^^^^^ Type Predicate!
  return x !== null;
}

const filtered = numbers.filter(isNotNull);
// Jetzt: filtered ist number[] -- korrekt!
// Aber: Du musstest isNotNull manuell schreiben. Aeergerlich.
```

Das war die Welt vor TypeScript 5.5: Man schrieb Type Predicate Helfer-Funktionen
oder ignorierte das Problem (und lebte mit `(number | null)[]`).

> 📖 **Hintergrund: 3.000 Upvotes im Issue-Tracker**
>
> Dieses Problem existierte seit Jahren als GitHub-Issue im TypeScript-Repository.
> Das Issue mit dem Titel "Improve type inference for filter() callbacks" sammelte
> ueber 3.000 Upvotes — einer der meistbewerteten Feature-Requests.
>
> Warum hat es so lange gedauert? Das Problem ist algorithmisch nicht trivial.
> TypeScript muss eine Funktion analysieren und entscheiden: "Stellt diese Funktion
> eine Typ-Einschraenkung sicher?" Das erfordert **Control Flow Analysis** innerhalb
> der Callback-Funktion — und das korrekt fuer alle Faelle zu machen ist komplex.
>
> Das TypeScript 5.5-Team unter der Fuehrung von Dan Vanderkam (Autor von
> "Effective TypeScript") implementierte schliesslich einen Algorithmus der das
> korrekt loest fuer die haeufigsten Muster. Eine elegante Loesung fuer ein
> jahrelanges Problem.

---

## TypeScript 5.5: Die Loesung

Ab TypeScript 5.5 analysiert der Compiler eine Filter-Callback-Funktion automatisch
und inferiert den Type Predicate:

```typescript
// TypeScript 5.5+:
const numbers = [1, null, 2, null, 3];
const filtered = numbers.filter(x => x !== null);
// filtered: number[]   ← KORREKT! TypeScript inferiert automatisch

// Was TypeScript intern macht:
// 1. Analysiere den Callback: (x) => x !== null
// 2. Erkenne: Wenn diese Funktion true zurueckgibt, dann ist x nicht null
// 3. Inferiere den impliziten Type Predicate: (x: number | null): x is number
// 4. Wende den Predicate auf filter() an: Ergebnis ist number[]
```

Das Schoene: Du musst **nichts aendern**. Dein bestehender Code wird einfach korrekt
getypt. Das ist TypeScript 5.5-Upgrade ohne Migration.

---

## Wie der Algorithmus funktioniert

TypeScript 5.5 analysiert die Funktion und prueft ob ihr `true`-Zweig einen Typ
einschraenkt. Konkret:

```typescript annotated
// TypeScript 5.5 inferiert Type Predicates fuer diese Muster:

// Muster 1: Explizite Ungleichheit gegen Null/Undefined
const withoutNull = items.filter(x => x !== null);
// Inferiert: (x: T | null): x is T

const withoutUndefined = items.filter(x => x !== undefined);
// Inferiert: (x: T | undefined): x is T

const withoutNullOrUndefined = items.filter(x => x != null);
// ^ Doppeltes != prueft auf BEIDES (null UND undefined)
// Inferiert: (x: T | null | undefined): x is T

// Muster 2: typeof-Checks
const strings = mixed.filter(x => typeof x === 'string');
// Inferiert: (x: string | number): x is string

// Muster 3: instanceof-Checks
const errors = results.filter(x => x instanceof Error);
// Inferiert: (x: Error | Result): x is Error

// Muster 4: Truthy-Checks
const nonEmpty = items.filter(Boolean);
// Inferiert: Entfernt null, undefined, 0, '' -- aber mit TypeScript 5.5
// wird der konkrete Typ korrekt inferiert (nicht boolean-blur)
```

```typescript annotated
// Praktisches Beispiel: Komplexere Typen
interface User { id: string; name: string; }
interface Admin extends User { level: number; }

const users: (User | Admin | null)[] = [
  { id: '1', name: 'Alice', level: 3 },
  null,
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie', level: 1 },
];

// Schritt 1: Nullen entfernen
const activeUsers = users.filter(u => u !== null);
// activeUsers: (User | Admin)[]   ← null ist weg!

// Schritt 2: Nur Admins filtern
const admins = activeUsers.filter(u => 'level' in u);
// admins: Admin[]   ← TypeScript versteht "in"-Checks als Type Predicates!
```

> 🧠 **Erklaere dir selbst:** Warum funktioniert `'level' in u` als Type Predicate?
> Was muss TypeScript ueber den Typ des Objekts und die Property wissen, damit
> das korrekt funktioniert?
>
> **Kernpunkte:** TypeScript weiss: User hat keine `level`-Property | Admin hat `level` |
> `in`-Operator prueft Existenz einer Property | TypeScript 5.5 verbindet:
> "Wenn `level in u` true, dann muss u Admin sein" | Funktioniert weil Union-Typen
> durch Property-Existenz unterschieden werden koennen

---

## Type Predicates ausserhalb von filter()

Inferred Type Predicates funktionieren nicht nur in `.filter()` — sie wirken uberall
wo eine Funktion mit boolean-Rueckgabe als Type Guard dient:

```typescript annotated
// Eigene isAdmin-Funktion — kein manueller Type Predicate noetig!
function isAdmin(user: User | Admin): user is Admin {
  // Vor TS 5.5: Du MUSSTEST "user is Admin" manuell schreiben
  return 'level' in user;
}
// Nach TS 5.5: TypeScript inferiert "user is Admin" automatisch
// wenn klar ist, dass die Funktion Admin von User unterscheidet

// Verwendung:
const user: User | Admin = getUser();
if (isAdmin(user)) {
  console.log(user.level);  // TypeScript weiss: user ist Admin!
}

// Inline in if-Bedingungen:
function processResult(result: string | Error) {
  if (result instanceof Error) {
    console.error(result.message); // result: Error
  } else {
    console.log(result.toUpperCase()); // result: string
  }
}
// Das hat schon vorher funktioniert (instanceof-Narrowing)
// Aber jetzt funktioniert es auch in komplexeren Callback-Szenarien
```

---

## Experiment-Box: Vorher/Nachher

Hier ist der direkte Vergleich zwischen TypeScript 4.x und 5.5:

```typescript
// === VORHER (TypeScript < 5.5) ===

const ids: (string | null)[] = ['a', null, 'b', null, 'c'];

// Problem: filtered hat immer noch (string | null)[]
const filtered = ids.filter(id => id !== null);
// filtered.map(id => id.toUpperCase())
//                       ^^^^^^^^^^^ Fehler! id koennte null sein

// Workaround 1: Manueller Type Predicate
function isString(x: string | null): x is string {
  return x !== null;
}
const filteredV1 = ids.filter(isString); // string[] -- korrekt, aber extra Funktion

// Workaround 2: Type Assertion (gefaehrlich!)
const filteredV2 = ids.filter(id => id !== null) as string[]; // Nicht empfohlen

// === NACHHER (TypeScript 5.5+) ===

const filteredNew = ids.filter(id => id !== null);
// filteredNew: string[]   ← Korrekt! Keine Hilfs-Funktion noetig
filteredNew.map(id => id.toUpperCase()); // Funktioniert problemlos!
```

Das ist einer jener Momente wo TypeScript sich "intelligenter" anfuehlt. Der Compiler
versteht was du meinst, nicht nur was du schreibst.

---

## Die Grenzen: Wann TypeScript es nicht erkennt

Ehrlichkeit ist wichtig: TypeScript 5.5 erkennt nicht **alle** Type-Predicate-Muster.
Komplexere Logik kann den Inferenz-Algorithmus ueberfordern:

```typescript
// TypeScript 5.5 erkennt DIESE Muster:
items.filter(x => x !== null)            // Direkte Null-Pruefung ✓
items.filter(x => typeof x === 'string') // typeof-Check ✓
items.filter(x => x instanceof Error)   // instanceof-Check ✓
items.filter(x => Boolean(x))           // Truthy-Check ✓

// TypeScript 5.5 erkennt diese NICHT (kein automatischer Predicate):
items.filter(x => {
  // Komplexe Logik mit mehreren Checks:
  if (someExternalCondition) return x !== null;
  return true;  // Hmm -- was ist hier der Predicate?
});
// Ergebnis: (string | null)[]  -- keine Inferenz

// Loesung fuer komplexe Faelle: Manueller Type Predicate (wie vor 5.5)
items.filter((x): x is string => {
  if (someExternalCondition) return x !== null;
  return true;
});
```

> 💭 **Denkfrage:** Warum kann TypeScript den Predicate in der komplexen Funktion
> nicht inferieren? Was fehlt dem Compiler um zu entscheiden "Wenn diese Funktion
> true zurueckgibt, dann ist x kein null"?
>
> **Antwort:** Weil `return true` ohne Vorbedingung sagt: "Auch x könnte null sein
> und ich gebe trotzdem true zurueck." Damit gibt es keinen direkten kausalen
> Zusammenhang zwischen "Rueckgabe true" und "x ist nicht null". TypeScript braucht
> einen eindeutigen Pfad: Immer wenn true — dann x ist T. Bei externer Bedingung
> bricht diese Garantie.

---

## Angular und React: Praktische Anwendung

In deinem Angular-Projekt (und in React) begegnet dir dieses Feature staendig:

```typescript annotated
// Angular: Signals mit Type Predicates
import { Signal, computed, signal } from '@angular/core';

const userSignal = signal<User | null>(null);

// Vor TS 5.5: userSignal() koennte null sein -- staendige null-Checks
// Nach TS 5.5 in computed:
const activeUsers = computed(() => {
  const users = usersSignal();
  return users.filter(u => u !== null);
  //                  ^^^^^^^^^^^^^ Typ: User[] (nicht User | null[])
});
// activeUsers: Signal<User[]>   ← Korrekt ohne null!
```

```typescript annotated
// React: useState und Daten-Transformationen
const [items, setItems] = useState<(Product | null)[]>([]);

// Komponenten-Logik:
const validProducts = items
  .filter(item => item !== null)
  //              ^^^^^^^^^^^^^ TS 5.5: filteredProducts ist Product[]
  .filter(item => item.price > 0);
  //              ^^^^ Kein Fehler mehr! TypeScript weiss: item ist Product

// JSX-Rendering:
return (
  <ul>
    {validProducts.map(product => (
      <li key={product.id}>{product.name}</li>
      //   ^^^^^^^^^^^ Vollstaendige Autovervollstaendigung!
    ))}
  </ul>
);
```

```typescript
// Angular HTTP + Signals (realistisches Beispiel):
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const responses = signal<ApiResponse<User>[]>([]);

// Alle erfolgreichen Responses extrahieren:
const successfulUsers = computed(() =>
  responses()
    .map(r => r.data)
    .filter(data => data !== null)
    // TS 5.5: data ist jetzt User[], nicht (User | null)[]
);
```

---

## Was du gelernt hast

- Vor TypeScript 5.5 gab `.filter(x => x !== null)` immer noch `(T | null)[]` zurueck
  weil `boolean` als Rueckgabetyp keine Typ-Einschraenkung signalisiert
- TypeScript 5.5 analysiert Callback-Funktionen und inferiert **automatisch** den
  impliziten Type Predicate — du schreibst nichts extra
- Der Algorithmus funktioniert fuer direkte Checks (`!== null`, `typeof`, `instanceof`,
  `in`-Operator, `Boolean`) aber nicht fuer komplexe externe Bedingungen
- In Angular Signals und React `useState`-Pipelines macht dieses Feature Filter-Ketten
  erheblich typsicherer — ohne manuellen Aufwand

**Kernkonzept zum Merken:** TypeScript 5.5 versteht jetzt den *Intent* eines Callbacks.
`x => x !== null` ist keine boolesche Funktion — es ist eine Aussage: "Nur Nicht-Null-Werte
duerfen passieren." Das ist ein Sprung von Syntax-Analyse zu Semantik-Verstaendnis.

> **Pausenpunkt** — Guter Moment fuer eine kurze Pause. Inferred Type Predicates
> sind einer der groessten Komfort-Gewinne in der TypeScript-Geschichte.
>
> Weiter geht es mit: [Sektion 04: Array und Control-Flow](./04-array-und-controlflow-improvements.md)
