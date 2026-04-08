# Sektion 2: Higher-Order Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Generics Recap & Grenzen](./01-generics-recap-und-grenzen.md)
> Naechste Sektion: [03 - Varianz verstehen](./03-varianz-verstehen.md)

---

## Was du hier lernst

- Was **Type Constructors** sind und warum sie sich von konkreten Typen unterscheiden
- Wie man **Higher-Kinded Types** in TypeScript emuliert (URI-to-Kind-Pattern)
- Das **Interface-Map-Pattern** das Bibliotheken wie `fp-ts` verwenden
- Warum TypeScript HKTs (noch) nicht nativ unterstuetzt und welche Alternativen es gibt

---

## Type Constructors: Typen die Typen brauchen
<!-- section:summary -->
Bevor wir Higher-Order Types verstehen, muessen wir einen fundamentalen

<!-- depth:standard -->
Bevor wir Higher-Order Types verstehen, muessen wir einen fundamentalen
Unterschied klar machen:

```typescript annotated
// KONKRETER TYP: Sofort verwendbar, braucht kein Argument.
type Name = string;
let x: string = "Max";
// ^^^ "string" ist ein Typ. Fertig. Kein Argument noetig.

// TYPE CONSTRUCTOR: Braucht ein Argument um ein konkreter Typ zu werden.
// "Array" allein ist KEIN Typ — "Array<string>" ist einer.
type StringArray = Array<string>;   // Array + string → konkreter Typ
type NumberArray = Array<number>;   // Array + number → anderer konkreter Typ
// ^^^ "Array" ist ein Type Constructor (Typ-Konstruktor).
//     Er nimmt einen Typ (string, number) und ERZEUGT einen neuen Typ.

// Weitere Type Constructors:
type X = Promise<string>;    // Promise: * → *
type Y = Map<string, number>; // Map: (*, *) → *
type Z = Set<boolean>;       // Set: * → *
// ^^^ In der Typ-Theorie: "*" bedeutet "ein konkreter Typ".
//     "* → *" bedeutet "nimmt einen Typ, gibt einen Typ".
```

> 🧠 **Erklaere dir selbst:** Was bedeutet es wenn ein Typ **selbst** einen
> Typparameter hat? Wie ist `Promise<T>` anders als `string`?
>
> **Kernpunkte:** `string` ist "fertig" — direkt verwendbar | `Promise` allein
> ist unvollstaendig — es braucht ein T | `Promise` ist eine Funktion auf
> Typ-Ebene: gib mir T, ich gebe dir `Promise<T>` | Das nennt man einen
> Type Constructor oder "Kind * → *"

---

> 📖 **Hintergrund: Haskell's Higher-Kinded Types**
>
> In Haskell sind Higher-Kinded Types seit den 1990ern ein fundamentales
> Feature. Die Idee: Genau wie Funktionen andere Funktionen als Parameter
> nehmen koennen (Higher-Order Functions), sollten Typen andere Typen als
> Parameter nehmen koennen (Higher-Kinded Types).
>
> In Haskell schreibt man:
> ```haskell
> class Functor f where
>   fmap :: (a -> b) -> f a -> f b
> ```
>
> Das `f` ist KEIN konkreter Typ — es ist ein Type Constructor. Man kann
> `f` durch `Array`, `Maybe`, `IO` oder jeden anderen Container ersetzen.
> Das ermoeglicht extrem abstrakte und wiederverwendbare Code-Strukturen.
>
> TypeScript hat dieses Feature nicht, weil es die Kompilexitaet des
> Typsystems massiv erhoehen wuerde. Error-Messages waeren schwerer zu
> verstehen, Compile-Zeiten laenger, und die Lernkurve steiler.
> Das TypeScript-Team hat sich bewusst dagegen entschieden — zumindest
> bisher (Issue #1213 ist seit 2014 offen).

---

<!-- /depth -->
## Das Problem in TypeScript
<!-- section:summary -->
Warum kann TypeScript nicht einfach "Typ ueber Typ" ausdruecken?

<!-- depth:standard -->
Warum kann TypeScript nicht einfach "Typ ueber Typ" ausdruecken?

```typescript annotated
// In einer idealen Welt wollten wir:
type Apply<F, A> = F<A>;
// ^^^ ERROR! F ist ein Typparameter — ein konkreter Typ.
//     TypeScript weiss nicht, dass F generisch ist.

// Was wir WOLLEN:
// Apply<Array, string> → Array<string>
// Apply<Promise, number> → Promise<number>
// Apply<Set, boolean> → Set<boolean>

// Aber TypeScript's Typsystem kennt keine "Kind-Polymorphie":
// Es gibt keinen Constraint wie "F muss ein Type Constructor sein".
// Alles was TypeScript kennt sind konkreter Typen und Generics ueber
// konkreter Typen.
```

> 🤔 **Denkfrage:** Warum kann man in TypeScript nicht `type Apply<F, A> = F<A>`
> schreiben? Was muesste TypeScript's Typsystem anders machen, damit das
> funktioniert?
>
> Denke an: Was bedeutet `F` in `Apply<F, A>`? Es ist ein Typparameter —
> also ein Platzhalter fuer einen **konkreten** Typ. Aber `Array` ohne
> Argument ist kein konkreter Typ. TypeScript muesste zwischen "Typen"
> und "Typ-Konstruktoren" unterscheiden — ein komplett anderes Kind-System.

---

<!-- /depth -->
## Die Loesung: Interface-Map-Pattern (URI-to-Kind)
<!-- section:summary -->
Die TypeScript-Community hat einen cleveren Workaround gefunden. Statt

<!-- depth:standard -->
Die TypeScript-Community hat einen cleveren Workaround gefunden. Statt
Higher-Kinded Types direkt zu verwenden, nutzt man ein Interface als
**Lookup-Map**:

```typescript annotated
// Schritt 1: Eine Map von String-Schlüsseln zu konkreten Typen
interface URItoKind<A> {
  Array: Array<A>;      // "Array" → Array<A>
  Promise: Promise<A>;  // "Promise" → Promise<A>
  Set: Set<A>;          // "Set" → Set<A>
}
// ^^^ Das ist die "Map": Fuer jeden String gibt es einen konkreten Typ.
//     Das A wird durchgereicht — das ist der Trick!

// Schritt 2: Alle bekannten URIs als Union-Typ
type URIS = keyof URItoKind<any>;
// ^^^ URIS = "Array" | "Promise" | "Set"

// Schritt 3: Der "Apply"-Typ — schlaegt in der Map nach
type Kind<URI extends URIS, A> = URItoKind<A>[URI];
// ^^^ Kind<"Array", string> → URItoKind<string>["Array"] → string[]
//     Kind<"Promise", number> → URItoKind<number>["Promise"] → Promise<number>

// Verwendung:
type X = Kind<"Array", string>;   // string[]
type Y = Kind<"Promise", number>; // Promise<number>
type Z = Kind<"Set", boolean>;    // Set<boolean>
```

Das ist die Essenz: Statt `F<A>` (HKT) schreiben wir `Kind<F, A>` und
nutzen ein Interface als Indirektion. Der String-Schluessel repraesentiert
den Type Constructor.

---

<!-- /depth -->
## Praktisches Beispiel: Generische `map`-Funktion
<!-- section:summary -->
Jetzt koennen wir die `map`-Funktion schreiben, die in Sektion 1 nicht

<!-- depth:standard -->
Jetzt koennen wir die `map`-Funktion schreiben, die in Sektion 1 nicht
moeglich war:

```typescript annotated
// Die Interface-Map (erweitert)
interface URItoKind<A> {
  Array: Array<A>;
  Set: Set<A>;
}
type URIS = keyof URItoKind<any>;
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// Abstrakte map-Signatur:
interface Mappable<URI extends URIS> {
  map<A, B>(fa: Kind<URI, A>, fn: (a: A) => B): Kind<URI, B>;
}
// ^^^ "Nimm einen Container vom Typ URI mit Inhalt A,
//      transformiere mit fn, gib Container vom Typ URI mit Inhalt B zurueck."

// Konkrete Implementierung fuer Array:
const arrayMappable: Mappable<"Array"> = {
  map: <A, B>(fa: A[], fn: (a: A) => B): B[] => fa.map(fn),
};
// ^^^ Kind<"Array", A> ist Array<A>, Kind<"Array", B> ist Array<B>.

// Verwendung:
const result = arrayMappable.map([1, 2, 3], x => x * 2);
// result: number[] — typsicher!
```

---

<!-- /depth -->
## Erweiterbarkeit: Declaration Merging
<!-- section:summary -->
Das Schoene am Interface-Map-Pattern: Es ist erweiterbar! Dank

<!-- depth:standard -->
Das Schoene am Interface-Map-Pattern: Es ist erweiterbar! Dank
TypeScript's Declaration Merging kann jede Bibliothek neue Container
registrieren:

```typescript annotated
// In deiner Library:
interface URItoKind<A> {
  Array: Array<A>;
}

// In einer anderen Datei / Library:
interface URItoKind<A> {
  Observable: Observable<A>;  // Rx.js
}
// ^^^ Declaration Merging! Beide Deklarationen werden zusammengefuehrt.
//     URIS ist jetzt "Array" | "Observable".

// Das ist der Grund warum fp-ts dieses Pattern verwendet:
// Jedes Modul registriert seinen Typ in der Map.
```

---

> 🔬 **Experiment:** Erweitere die URItoKind-Map um einen eigenen
> Container-Typ:
>
> ```typescript
> // Dein eigener Container:
> class Maybe<T> {
>   constructor(private value: T | null) {}
>   map<U>(fn: (x: T) => U): Maybe<U> {
>     return this.value !== null
>       ? new Maybe(fn(this.value))
>       : new Maybe<U>(null);
>   }
> }
>
> // Registriere in der Map:
> interface URItoKind<A> {
>   Maybe: Maybe<A>;
> }
>
> // Teste: Kind<"Maybe", string> sollte Maybe<string> sein
> ```

---

<!-- /depth -->
## Der Framework-Bezug

> ⚛️ **React:** `ComponentPropsWithRef<T>` ist ein Beispiel fuer einen
> Higher-Order Type: Es nimmt einen Component-Typ T und extrahiert dessen
> Props inklusive Ref. Intern nutzt React Conditional Types als HKT-Ersatz:
>
> ```typescript
> type ComponentPropsWithRef<T extends ElementType> =
>   T extends new (props: infer P) => any ? P & { ref?: Ref<InstanceType<T>> }
>   : T extends (props: infer P) => any ? P
>   : never;
> ```
>
> 🅰️ **Angular:** Der DI-Container nutzt `InjectionToken<T>` als
> Type Constructor: `InjectionToken` allein ist unvollstaendig — erst
> `InjectionToken<UserService>` ist ein konkreter Typ. Die `inject<T>()`
> Funktion inferiert T aus dem Token.

---

## Alternative: Conditional Type Dispatch
<!-- section:summary -->
Neben dem Interface-Map-Pattern gibt es noch Conditional Types als

<!-- depth:standard -->
Neben dem Interface-Map-Pattern gibt es noch Conditional Types als
"Pattern-Matching" fuer Type Constructors:

```typescript annotated
// Conditional Type Dispatch:
type MapOver<Container, NewItem> =
  Container extends Array<any> ? Array<NewItem>
  : Container extends Set<any> ? Set<NewItem>
  : Container extends Promise<any> ? Promise<NewItem>
  : never;
// ^^^ Funktioniert, aber NICHT erweiterbar.
//     Jeder neue Container braucht einen neuen Branch.

type Test1 = MapOver<string[], number>;        // number[]
type Test2 = MapOver<Set<string>, boolean>;    // Set<boolean>
type Test3 = MapOver<Promise<string>, number>; // Promise<number>
```

Das ist einfacher als das URI-Pattern, aber weniger flexibel. Fuer die
meisten Anwendungen reicht es aus.

---

> 🧠 **Erklaere dir selbst:** Was ist der Vorteil des Interface-Map-Patterns
> gegenueber Conditional Type Dispatch? Wann wuerdest du welches verwenden?
>
> **Kernpunkte:** Interface-Map ist erweiterbar (Declaration Merging) |
> Conditional Dispatch ist einfacher aber geschlossen (neue Container = neuer
> Branch) | Fuer Libraries: Interface-Map | Fuer App-Code: Conditional reicht

---

<!-- /depth -->
## Was du gelernt hast

- **Type Constructors** (wie `Array`, `Promise`) sind Typen die ein Argument
  brauchen — im Gegensatz zu konkreten Typen wie `string`
- TypeScript hat keine nativen **Higher-Kinded Types**, aber es gibt
  leistungsfaehige Emulationen
- Das **Interface-Map-Pattern** (URI-to-Kind) nutzt String-Schluessel als
  Proxy fuer Type Constructors: `Kind<"Array", string>` statt `Array<string>`
- **Conditional Type Dispatch** ist die einfachere Alternative fuer
  geschlossene Mengen von Containern
- Bibliotheken wie **fp-ts** nutzen das URI-Pattern produktiv

> **Kernkonzept:** Higher-Order Types in TypeScript sind eine Emulation,
> kein natives Feature. Der Trick ist Indirektion: Statt "Typ als Argument"
> nutzt man eine Map die Strings auf Typen abbildet.

---

> ⏸️ **Pausenpunkt:** Guter Zeitpunkt fuer eine kurze Pause.
> In der naechsten Sektion geht es um **Varianz** — ein fundamentales
> Konzept das erklaert, wann `Container<Cat>` ein `Container<Animal>` ist
> (und wann nicht).
>
> **Weiter:** [Sektion 03 - Varianz verstehen →](./03-varianz-verstehen.md)
