# Sektion 5: Union vs Intersection — Wann was?

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Intersection Types](./04-intersection-types.md)
> Naechste Sektion: [06 - Praxis-Patterns](./06-praxis-patterns.md)

---

## Was du hier lernst

- Wann du `|` und wann du `&` verwendest — mit klaren **Entscheidungsregeln**
- Warum Union Types bei **Werten** breiter machen und Intersection Types bei **Properties**
- Das **Verteilungsgesetz** fuer Union und Intersection
- Wie sich `|` und `&` bei Funktionsparametern unterschiedlich verhalten

---

## Die Intuition: Breiter vs Enger

Das Verwirrende an Union und Intersection ist, dass die Intuition
je nach Perspektive umgekehrt wirkt:

```
                    Union (|)                 Intersection (&)
───────────────────────────────────────────────────────────────
Werte-Menge:        GROESSER                  KLEINER
                    (mehr Werte passen)       (weniger Werte passen)

Properties:         WENIGER zugreifbar        MEHR zugreifbar
                    (nur gemeinsame)          (alle von allen)

Typ ist:            BREITER (allgemeiner)     ENGER (spezifischer)
```

Ein Beispiel macht es klarer:

```typescript annotated
interface HasName { name: string; }
interface HasAge { age: number; }

// Union: MEHR Werte passen, WENIGER Properties zugreifbar
type PersonUnion = HasName | HasAge;
// Gueltig: { name: "A" } oder { age: 30 } oder { name: "A", age: 30 }
// Zugreifbar: NUR Properties die BEIDE haben (= keine direkt!)

// Intersection: WENIGER Werte passen, MEHR Properties zugreifbar
type PersonIntersection = HasName & HasAge;
// Gueltig: NUR { name: "A", age: 30 } (muss beides haben)
// Zugreifbar: name UND age
```

> 📖 **Hintergrund: Dualitaet in der Typentheorie**
>
> Union und Intersection bilden ein **duales Paar** — aehnlich wie
> AND und OR in der Logik. Diese Dualitaet zieht sich durch die
> gesamte Typentheorie:
>
> | Konzept | Union (`\|`) | Intersection (`&`) |
> |---|---|---|
> | Logik | OR | AND |
> | Mengenlehre | Vereinigung (A ∪ B) | Schnittmenge (A ∩ B) |
> | Typentheorie | Sum Type | Product Type |
> | Werte-Menge | Groesser | Kleiner |
> | Identitaetselement | `never` | `unknown` |
>
> Die letzte Zeile ist besonders interessant:
> - `T | never` = `T` (never fuegt nichts hinzu)
> - `T & unknown` = `T` (unknown schraenkt nichts ein)

---

## Entscheidungsmatrix: Union oder Intersection?

| Situation | Verwende | Beispiel |
|---|---|---|
| "Einer von mehreren Zustaenden" | `\|` | `"loading" \| "success" \| "error"` |
| "Kann verschiedene Typen haben" | `\|` | `string \| number` |
| "Kombiniere mehrere Capabilities" | `&` | `Serializable & Comparable` |
| "Erweitere einen Typ um Properties" | `&` | `User & { role: string }` |
| "Brauche Discriminated Union" | `\|` | `{ status: "ok"; data: T } \| { status: "err"; error: E }` |
| "Funktion akzeptiert verschiedene Inputs" | `\|` | `(input: string \| number) => void` |
| "Funktion gibt angereicherten Typ zurueck" | `&` | `() => T & Timestamped` |

**Faustregel:**
- **Union** = "Entweder A oder B" (Varianten, Zustaende, Alternativen)
- **Intersection** = "Sowohl A als auch B" (Kombination, Erweiterung, Mixins)

> 🧠 **Erklaere dir selbst:** Ein API-Endpoint kann entweder Success
> oder Error zurueckgeben. Wuerdest du Union oder Intersection verwenden?
> Warum?
> **Kernpunkte:** Union, weil es Alternativen sind | Ein Response ist
> ENTWEDER Success ODER Error | Nie beides gleichzeitig |
> Discriminated Union mit status-Tag

---

## Das Verteilungsgesetz

Union und Intersection haben ein **Verteilungsgesetz** — aehnlich
wie `*` und `+` in der Mathematik:

```typescript annotated
// Verteilung von & ueber |
type A = (string | number) & object;
// = (string & object) | (number & object)
// = never | never
// = never
// Weil weder string noch number object-Subtypen sind

// Verteilung von | ueber &
type B = string | (number & boolean);
// = string | never
// = string
// Weil number & boolean = never (inkompatibel)
```

Ein praxisnaeheres Beispiel:

```typescript annotated
interface WithId { id: string; }
interface WithTimestamp { createdAt: Date; }

type Entity = (WithId & WithTimestamp) | (WithId & { temp: true });
//
// Verteilung:
// = WithId & (WithTimestamp | { temp: true })
//
// Jede Entity hat id, und entweder createdAt oder temp
```

> 💭 **Denkfrage:** Warum ist `(string | number) & string` gleich
> `string` und nicht `never`?
>
> **Antwort:** Das Verteilungsgesetz:
> `(string | number) & string` = `(string & string) | (number & string)`
> = `string | never` = `string`.
> `string & string` ist einfach `string` (Schnittmenge mit sich selbst).
> `number & string` ist `never` (inkompatibel). Und `T | never` = `T`.

---

## Union und Intersection bei Funktionstypen

Hier wird es subtil. Bei Funktionen verhalten sich `|` und `&`
**anders als bei Objekten**:

```typescript annotated
type StringFn = (x: string) => void;
type NumberFn = (x: number) => void;

// Union von Funktionen: Parameter werden zur INTERSECTION
type EitherFn = StringFn | NumberFn;
// Aufrufbar mit: string & number = never — also GAR NICHT sicher aufrufbar!
// TypeScript erlaubt nur Argumente, die zu BEIDEN Signaturen passen.

// Intersection von Funktionen: Ueberladung
type BothFn = StringFn & NumberFn;
// Aufrufbar mit: string ODER number — wie eine ueberladene Funktion!

const fn: BothFn = ((x: string | number) => {
  console.log(x);
}) as BothFn;

fn("hallo");  // OK — passt zu StringFn
fn(42);       // OK — passt zu NumberFn
```

> Das ist **kontraintuitiv**: Bei Funktionstypen ist `&` (Intersection)
> der **flexiblere** Operator (akzeptiert mehr Argumente), waehrend
> `|` (Union) der **restriktivere** ist. Das liegt an der
> **Kontravarianz** der Parameter-Position.

> 📖 **Hintergrund: Kovarianz und Kontravarianz**
>
> In der Typentheorie sind Funktionsparameter **kontravariant**: Wenn
> `Dog` ein Subtyp von `Animal` ist, dann ist `(animal: Animal) => void`
> ein Subtyp von `(dog: Dog) => void` — die Richtung kehrt sich um!
>
> Das erklaert das Verhalten:
> - `StringFn & NumberFn`: Parameter-Intersection → `string | number`
>   (Union der Parameter, weil kontravariant)
> - `StringFn | NumberFn`: Parameter-Union → `string & number = never`
>   (Intersection der Parameter, weil kontravariant)
>
> Klingt kompliziert, ist aber logisch: Eine Funktion die `string & number`
> akzeptiert, kann NUR mit Werten aufgerufen werden, die zu BEIDEN
> Parametern passen — und solche Werte gibt es nicht.

---

## Praxis: Typ-Verfeinerung mit & statt Neudefinition

Statt einen langen Typ komplett neu zu definieren, verfeinere mit `&`:

```typescript annotated
// Basis-Typ (z.B. aus einer Library)
interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: string;     // zu breit — "string"
}

// Verfeinerung: role wird zum Literal-Typ
type AdminUser = BaseUser & { role: "admin" };
type EditorUser = BaseUser & { role: "editor" };
type ViewerUser = BaseUser & { role: "viewer" };

type AppUser = AdminUser | EditorUser | ViewerUser;
// Jetzt ist role nicht mehr "string", sondern "admin" | "editor" | "viewer"
```

---

## never und unknown als Identitaetselemente

Zwei wichtige algebraische Eigenschaften:

```typescript
// never ist das Identitaetselement fuer Union:
type A = string | never;   // = string (never fuegt nichts hinzu)

// unknown ist das Identitaetselement fuer Intersection:
type B = string & unknown;  // = string (unknown schraenkt nicht ein)

// unknown ist das "absorbierende Element" fuer Union:
type C = string | unknown;  // = unknown (unknown "schluckt" alles)

// never ist das "absorbierende Element" fuer Intersection:
type D = string & never;    // = never (never macht alles unmoeglich)
```

> 🧠 **Erklaere dir selbst:** Warum ist `string | unknown = unknown`
> aber `string & unknown = string`? Erklaere es mit Mengen.
> **Kernpunkte:** unknown = alle Werte | string ∪ alle Werte = alle Werte |
> string ∩ alle Werte = string | Vereinigung mit "allem" = "alles" |
> Schnittmenge mit "allem" = man selbst

---

## Was du gelernt hast

- Union macht **breiter** (mehr Werte, weniger Properties), Intersection macht **enger** (weniger Werte, mehr Properties)
- **Faustregel:** Union fuer Alternativen, Intersection fuer Kombination
- Das **Verteilungsgesetz** gilt: `(A | B) & C = (A & C) | (B & C)`
- Bei **Funktionen** kehrt sich das Verhalten um (Kontravarianz)
- `never` und `unknown` sind die **Identitaetselemente** fuer `|` bzw. `&`

**Kernkonzept zum Merken:** Union und Intersection sind **duale Operatoren**. Verstehst du einen, verstehst du den anderen — sie verhalten sich spiegelbildlich, wie Addition und Multiplikation.

> **Experiment:** Oeffne `examples/05-union-vs-intersection.ts` und
> experimentiere mit dem Verteilungsgesetz. Erstelle
> `type Test = (string | number) & ("hello" | 42)` — was ergibt sich?

---

> **Pausenpunkt** -- Die Theorie ist komplett. In der letzten Sektion
> wenden wir alles in realistischen Praxis-Patterns an.
>
> Weiter geht es mit: [Sektion 06: Praxis-Patterns](./06-praxis-patterns.md)
