# Sektion 1: Generics Recap & Grenzen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Higher-Order Types](./02-higher-order-types.md)

---

## Was du hier lernst

- Wo Lektion 13/14 aufgehoert haben und warum einfache Generics **nicht ausreichen**
- Welche **konkreten Probleme** entstehen wenn man "Typen ueber Typen" braucht
- Warum TypeScript's Typsystem bewusst **Grenzen** hat — und wie man sie umgeht
- Die **Motivation** fuer Higher-Order Types, Varianz und fortgeschrittene Constraints

---

## Der Weg bis hierher
<!-- section:summary -->
In Lektion 13 hast du Generics kennengelernt: `<T>`, `extends`, `keyof`,

<!-- depth:standard -->
In Lektion 13 hast du Generics kennengelernt: `<T>`, `extends`, `keyof`,
Default-Typparameter. In Lektion 14 hast du Patterns gesehen: Factories,
Collections, Builder, Fluent APIs. Das war solide — aber es war erst der
Anfang.

Stell dir vor, du hast eine Toolbox. Lektion 13/14 hat dir Hammer und
Schraubenzieher gegeben. Jetzt brauchst du Praezisionswerkzeug.

```typescript
// Das kennst du bereits (L13):
function identity<T>(value: T): T {
  return value;
}

// Und das (L14):
class TypedMap<K, V> {
  private store = new Map<K, V>();
  set(key: K, value: V): this { this.store.set(key, value); return this; }
  get(key: K): V | undefined { return this.store.get(key); }
}
```

Alles gut soweit. Aber jetzt kommt eine Aufgabe, die mit diesen Werkzeugen
**nicht loesbar** ist.

---

<!-- /depth -->
## Das Problem: "Irgendein Container"
<!-- section:summary -->
Stell dir vor, du schreibst eine Utility-Funktion die mit **verschiedenen

<!-- depth:standard -->
Stell dir vor, du schreibst eine Utility-Funktion die mit **verschiedenen
Container-Typen** arbeiten soll: `Array<T>`, `Set<T>`, `Map<K,V>`,
`Promise<T>`. Du willst eine `map`-Funktion die ueber *irgendeinen*
Container mappt:

```typescript annotated
// Das wollen wir:
// map(container, transformFn) → gleicher Container-Typ, neuer Inhalt

// Fuer Array? Kein Problem:
function mapArray<T, U>(arr: T[], fn: (x: T) => U): U[] {
  return arr.map(fn);
}
// ^^^ T und U sind einfache Generics — das funktioniert.

// Aber was ist mit "irgendein Container"?
// Wir wollen: map(someContainer, fn) → Container mit transformiertem Inhalt
// Wie schreiben wir den Typ von "someContainer"?

// VERSUCH 1: Ein simples Generic
function mapContainer<C, T, U>(container: C, fn: (x: T) => U): ??? {
  // Problem 1: Wie kommen wir an T heran? C ist ein konkreter Typ.
  // Problem 2: Was ist der Rueckgabetyp? "C, aber mit U statt T"?
  // Das geht nicht mit einfachen Generics!
}
// ^^^ TypeScript kann "C, aber mit anderem Inhalt" nicht ausdruecken.
```

Das Kernproblem: Wir brauchen einen Typ der **selbst generisch** ist.
Nicht `Array<string>` (ein konkreter Typ), sondern `Array` als Konzept —
ein Typ-Konstruktor, der erst zu einem konkreten Typ wird wenn man ihm
ein Argument gibt.

---

> 📖 **Hintergrund: Generics in TypeScript 2.0 (2016)**
>
> Als Anders Hejlsberg Generics fuer TypeScript designte, stand er vor einer
> Entscheidung: Wie mächtig soll das Typsystem sein? Sprachen wie Haskell
> hatten bereits Higher-Kinded Types — Typen ueber Typen ueber Typen. Aber
> Hejlsberg entschied sich bewusst fuer ein einfacheres Modell.
>
> Seine Vision: "Expressive types without runtime cost." Das Typsystem
> sollte maechtig genug sein fuer reale JavaScript-Patterns, aber nicht so
> komplex dass es nur Typen-Theoretiker verstehen. TypeScript 2.0 (September
> 2016) brachte Generics die mit `extends`-Constraints und `keyof` arbeiten
> konnten — ein guter Kompromiss.
>
> Aber die Community wollte mehr. Bibliotheken wie `fp-ts` (funktionale
> Programmierung in TypeScript) stiessen schnell an die Grenzen. Die Frage
> "Wann kommen Higher-Kinded Types?" ist seit 2016 eines der am meisten
> diskutierten TypeScript-Issues auf GitHub (#1213, ueber 500 Reactions).

---

<!-- /depth -->
## Warum reicht `<T>` nicht?
<!-- section:summary -->
Schauen wir uns die Grenzen systematisch an:

<!-- depth:standard -->
Schauen wir uns die Grenzen systematisch an:

```typescript annotated
// GRENZE 1: Typparameter koennen nicht selbst generisch sein
type Apply<F, A> = F<A>;
// ^^^ ERROR: "Type 'F' is not generic."
// F ist ein konkreter Typ, kein Typ-Konstruktor!

// GRENZE 2: Man kann nicht "gleicher Container, anderer Inhalt" ausdruecken
type SwapContent<Container, NewContent> = ???;
// SwapContent<Array<string>, number> sollte Array<number> ergeben
// Aber wie? Container ist bereits "Array<string>" — ein konkreter Typ.

// GRENZE 3: Abstraktion ueber Container-Arten
interface Functor<F> {
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
  // ^^^ ERROR: F ist nicht generisch
}
// In Haskell: class Functor f where fmap :: (a -> b) -> f a -> f b
// In TypeScript: nicht direkt moeglich.
```

> 🧠 **Erklaere dir selbst:** Warum reicht `<T>` allein nicht aus, wenn du
> einen Typ brauchst der *selbst* generisch ist? Was ist der fundamentale
> Unterschied zwischen `string` (ein konkreter Typ) und `Array` (ein
> Typ-Konstruktor)?
>
> **Kernpunkte:** `string` ist sofort verwendbar | `Array` braucht ein
> Argument (`Array<string>`) | Ein Typparameter wie `T` steht immer fuer
> einen konkreten Typ, nie fuer einen Typ-Konstruktor | Das ist die Grenze

---

<!-- /depth -->
## Was TypeScript stattdessen bietet
<!-- section:summary -->
TypeScript hat kreative Wege gefunden, einige dieser Grenzen zu umgehen:

<!-- depth:standard -->
TypeScript hat kreative Wege gefunden, einige dieser Grenzen zu umgehen:

```typescript annotated
// LOESUNG 1: Conditional Types als "Pattern Matching"
type Unwrap<T> = T extends Array<infer U> ? U
               : T extends Promise<infer U> ? U
               : T extends Set<infer U> ? U
               : T;
// ^^^ Funktioniert, aber: Wir muessen JEDEN Container einzeln aufzaehlen.
//     Nicht erweiterbar — neue Container bedeuten neue Branches.

type A = Unwrap<string[]>;      // string
type B = Unwrap<Promise<number>>; // number
type C = Unwrap<Set<boolean>>;    // boolean

// LOESUNG 2: Mapped Types + keyof fuer objektbasierte Generics
type MakeOptional<T> = { [K in keyof T]?: T[K] };
// ^^^ Maechtig fuer Objekt-Transformationen — aber hilft nicht bei Containern.

// LOESUNG 3: Overloads fuer eine endliche Menge von Containern
function unwrap(container: string[]): string;
function unwrap(container: number[]): number;
function unwrap(container: unknown[]): unknown {
  return container[0];
}
// ^^^ Funktioniert, aber skaliert nicht.
```

Keiner dieser Workarounds ist wirklich befriedigend. Conditional Types
sind nicht erweiterbar, Mapped Types helfen nur bei Objekten, und
Overloads explodieren bei vielen Faellen. Das zeigt: Es gibt ein echtes
Loch im Typsystem das wir in den naechsten Sektionen schliessen werden.

---

<!-- /depth -->
## Wann stoesst man in der Praxis an die Grenzen?
<!-- section:summary -->
Hier sind typische Szenarien in denen einfache Generics nicht ausreichen:

<!-- depth:standard -->
Hier sind typische Szenarien in denen einfache Generics nicht ausreichen:

```typescript annotated
// Szenario 1: Generischer HTTP-Service
// Du willst einen Service der mit JEDEM HTTP-Client funktioniert
// (HttpClient, fetch, axios) — aber der Container-Typ variiert.
interface HttpService<Client> {
  get<T>(url: string): ???; // Was ist der Rueckgabetyp?
  // HttpClient.get → Observable<T>
  // fetch → Promise<T>
  // Wir brauchen "den Container von Client, aber mit T"
}
// ^^^ Einfache Generics koennen "den Container-Typ von Client"
//     nicht ausdruecken.

// Szenario 2: Data-Pipeline
// Du willst eine Pipeline die verschiedene Wrapper-Typen
// durchreichen kann — Array, Promise, Observable, etc.
// pipe(getData, transform, validate, save)
// Jeder Schritt sollte im gleichen Wrapper bleiben.

// Szenario 3: Testing-Framework
// Mock<T> soll den gleichen Container-Typ wie das Original
// verwenden, aber mit Test-Implementierungen.
```

Diese Szenarien werden wir mit den Techniken der naechsten Sektionen
loesen koennen.

---

> 🔬 **Experiment:** Versuche einen generischen Container-Typ zu schreiben,
> der mit `Array<T>`, `Map<K,V>` und `Set<T>` funktioniert. Wie weit
> kommst du mit einfachen Generics?
>
> ```typescript
> // Dein Versuch:
> interface Container<T> {
>   // Welche Methoden koennen alle drei Container haben?
>   // Wie gehst du mit Map<K,V> um, das ZWEI Typparameter hat?
> }
> ```
>
> Du wirst feststellen: Es gibt kein gemeinsames Interface das alle drei
> Container typsicher abbildet — zumindest nicht mit einfachen Generics.

---

<!-- /depth -->
## Der Framework-Bezug

> 🅰️ **Angular:** `HttpClient.get<T>(url)` ist ein einfacher Generic —
> T sagt welchen Typ die Response hat. Aber was wenn du einen Service
> schreiben willst, der mit **jedem HTTP-Wrapper** funktioniert — `HttpClient`,
> `fetch`-Wrapper, `axios`-Wrapper? Du brauchst eine Abstraktion ueber
> "HTTP-Client als Konzept", nicht einen konkreten Client. Das ist genau
> das Problem von Higher-Kinded Types.
>
> ⚛️ **React:** `useState<T>()` gibt `[T, SetStateAction<T>]` zurueck.
> Einfacher Generic. Aber Bibliotheken wie `react-query` nutzen intern
> sehr fortgeschrittene Generics: `useQuery<TData, TError, TQueryKey>` mit
> Default-Typparametern und Conditional Types. Das Ziel: Maximale
> Typ-Inferenz bei minimaler manueller Annotation.

---

## Die drei Saeulen von Advanced Generics
<!-- section:summary -->
In den naechsten fuenf Sektionen lernst du die Werkzeuge die ueber

<!-- depth:standard -->
In den naechsten fuenf Sektionen lernst du die Werkzeuge die ueber
einfache Generics hinausgehen:

| Sektion | Konzept | Warum wichtig |
|---|---|---|
| 02 | Higher-Order Types | Typen die Typen als Parameter nehmen |
| 03 | Varianz | Wann ist `Container<Cat>` ein `Container<Animal>`? |
| 04 | in/out Modifier | Varianz explizit deklarieren (TS 4.7) |
| 05 | Advanced Constraints | Intersection, Recursive, Conditional |
| 06 | API Design | Wann Generics, wann Overloads, wann Unions |

---

> 🤔 **Denkfrage:** Du hast jetzt gesehen, dass TypeScript keine
> Higher-Kinded Types hat. Aber TypeScript's Typsystem ist trotzdem
> Turing-complete. Warum hat die TypeScript-Team HKTs dann nicht
> hinzugefuegt? Welche Trade-offs wuerden HKTs mit sich bringen?
>
> Denke an: Komplexitaet fuer Nutzer, Compile-Zeiten, Error-Messages,
> und den "JavaScript-Superset"-Anspruch.

---

<!-- /depth -->
## Was du gelernt hast

- Einfache Generics (`<T>`, `extends`, `keyof`) haben **konkrete Grenzen**:
  Typparameter koennen nicht selbst generisch sein
- Das Kernproblem: Man kann "irgendein Container" oder "gleicher Container,
  anderer Inhalt" nicht direkt ausdruecken
- TypeScript bietet Workarounds (Conditional Types, Overloads, Mapped Types),
  aber keine nativen Higher-Kinded Types
- Advanced Generics umfassen: Higher-Order Types, Varianz, in/out-Modifier,
  fortgeschrittene Constraints und API-Design

> **Kernkonzept:** Die Grenze einfacher Generics ist erreicht wenn du
> "Typen ueber Typen" brauchst — wenn der Typparameter selbst generisch
> sein muesste. Ab hier beginnt Advanced Generics.

---

> ⏸️ **Pausenpunkt:** Guter Zeitpunkt fuer eine kurze Pause.
> In der naechsten Sektion schauen wir uns an, wie man Higher-Order Types
> in TypeScript *emuliert* — trotz fehlender HKT-Unterstuetzung.
>
> **Weiter:** [Sektion 02 - Higher-Order Types →](./02-higher-order-types.md)
