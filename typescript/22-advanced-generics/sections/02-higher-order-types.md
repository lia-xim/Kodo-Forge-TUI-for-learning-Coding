# Sektion 2: Higher-Order Types

> Geschaetzte Lesezeit: **15 Minuten**
>
> Vorherige Sektion: [01 - Generics Recap & Grenzen](./01-generics-recap-und-grenzen.md)
> Naechste Sektion: [03 - Varianz verstehen](./03-varianz-verstehen.md)

---

## Was du hier lernst

- Was **Higher-Kinded Types** (HKTs) sind — und warum sie nichts mit "Type Constructors" sind
- Warum TypeScript **keine nativen HKTs** hat (und was das bedeutet)
- Wie das **URI-to-Kind-Pattern** als Workaround funktioniert
- Dass URI-to-Kind nur **eine** von mehreren Loesungen ist
- Wo HKTs in der Praxis relevant werden (RxJS, fp-ts, generische Abstraktionen)

---

## Das konzeptuelle Problem: Was IST ein Higher-Kinded Type?
<!-- section:summary -->
Bevor wir ueber Code sprechen, brauchen wir ein Bild davon, was ein
Higher-Kinded Type **eigentlich** ist.

<!-- depth:standard -->
Stell dir vor, du hast verschiedene Arten von "Werkzeugen":

**Level 0 — Werte (Values):**

Das sind die Dinge, mit denen du arbeitest. `"hello"`, `42`, `true`.
Konkrete Daten.

**Level 1 — Typen (Types):**

Das sind Formen fuer Werte. `string` beschreibt alle Strings, `number`
beschreibt alle Zahlen. Ein Typ ist eine Kategorie von Werten.

**Level 2 — Type Constructors:**

Ein Type Constructor ist eine "Form" die noch nicht fertig ist. `Array`
allein ist kein Typ — `Array<string>` ist einer. `Promise` allein ist
nichts — `Promise<number>` schon. Der Constructor braucht ein Argument:

```typescript
// Level 0: Werte
const text = "hello";
const num = 42;

// Level 1: Typen
let a: string = text;
let b: number = num;

// Level 2: Type Constructors
let c: Array<string> = ["hello"];
let d: Promise<number> = Promise.resolve(42);
// ^^^ Array und Promise sind keine Typen — sie WERDEN zu Typen
//     wenn du ihnen ein Argument gibst.
```

**Level 3 — Higher-Kinded Types:**

Jetzt wird es interessant. Ein Higher-Kinded Type ist ein Typ, der
selbst einen **Type Constructor** als Parameter nimmt.

```typescript
// Was wir uns wuenschen:
interface Functor<F> {
  // F ist HIER kein konkreter Typ — F ist ein Type Constructor!
  // F koennte Array sein, oder Promise, oder Option, oder Set.
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
}
// ^^^ Das F ist der Higher-Kinded Type Parameter.
//     Er nimmt F (z.B. Array) und A (z.B. string) → F<A> wird Array<string>.
```

---

### Drei Analogien die das klar machen

**Analogie 1: Funktionen vs. Higher-Order Functions**

Eine normale Funktion nimmt Werte:

```typescript
function add(x: number, y: number): number { return x + y; }
add(3, 5); // Werte als Argumente
```

Eine Higher-Order Function nimmt andere Funktionen:

```typescript
function compose<A, B, C>(
  f: (x: B) => C,
  g: (x: A) => B
): (x: A) => C {
  return (x) => f(g(x));
}
compose(f, g); // Funktionen als Argumente
```

Jetzt uebertrag das auf Typen:

- **Normale Typen** nehmen Werte und beschreiben sie (`string` beschreibt `"hello"`)
- **Type Constructors** nehmen Typen und erzeugen neue Typen (`Array<string>`)
- **Higher-Kinded Types** nehmen Type Constructors als Parameter (`Functor<Array>`)

**Analogie 2: Mathematische Funktionen**

```
f(x) = x²          -- nimmt eine Zahl, gibt eine Zahl   → "normaler Typ"
g(f, x) = f(f(x))  -- nimmt EINE FUNKTION und eine Zahl → "higher-kinded"
```

`g` kann nicht einfach "irgendeinen Wert" nehmen — es braucht etwas
das selbst wieder transformiert. Genauso kann ein `Functor<F>` nicht
einfach einen Typ nehmen — er braucht einen Type Constructor `F`.

**Analogie 3: Werkzeuge und Werkzeughalter**

```
Ein Schraubenzieher        → braucht eine Schraube       → Type Constructor
Ein Werkzeugkoffer-Fach    → braucht EINEN Werkzeugtyp    → Higher-Kinded Type
```

Das Fach muss nicht wissen OB es einen Schlitz- oder Kreuzschlitzschrauber
aufnimmt — es ist abstrakt genug fuer BEIDE. Ein `Functor<F>` muss nicht
wissen ob `F` ein Array oder Promise ist — es funktioniert fuer BEIDE.

---

> 🧠 **Selbst-Erklaerung:** Warum kann eine normale `map`-Funktion nicht
> ueber "jeden Container" abstrahieren? Warum muss sie wissen ob sie
> `.map()` (Array), `.subscribe()` (Observable), oder `.then()` (Promise)
> aufruft? Was bedeutet das fuer die Typ-Ebene?
>
> **Kernpunkte:** Auf Wert-Ebene ruft jeder Container eine ANDERE Methode auf |
> Auf Typ-Ebene wollen wir aber EIN Interface fuer ALLE Container |
> Das geht nur wenn wir den Container-Typ selbst als Parameter uebergeben

---

<!-- /depth -->
## Warum TypeScript keine nativen HKTs hat
<!-- section:summary -->
Andere Sprachen koennen das — TypeScript nicht. Warum?

<!-- depth:standard -->
In Sprachen mit echtem HKT-Support schreibst du:

```haskell
-- Haskell (seit den 1990ern)
class Functor f where
  fmap :: (a -> b) -> f a -> f b

-- f ist ein Higher-Kinded Type Parameter.
-- Der Compiler weiss: f hat den "Kind" (* -> *).
```

```scala
// Scala
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}
// F[_] sagt: F ist ein Type Constructor der EIN Argument nimmt.
```

```typescript
// TypeScript — DAS HIER GEHT NICHT:
interface Functor<F> {  // ERROR: F ist nicht generisch!
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
}
// TypeScript erlaubt nur konkrete Typen als Typparameter.
// F<A> wo F ein Typparameter ist — das gibt's nicht.
```

**Warum nicht?** TypeScript wurde als JavaScript-Superset entworfen, nicht
als akademische Sprache. Das Typsystem muss:

1. **Rueckwaertskompatibel** mit existierendem JavaScript sein
2. **Schnell kompilieren** — auch bei Millionen von Zeilen
3. **Verstaendliche Fehler** liefern — nicht "kind mismatch at type level"
4. **Erlernbar** sein — die meisten JS-Entwickler haben keine Typ-Theorie

Ein natives HKT-System wuerde alle vier Punkte erschweren. Das TypeScript-Team
hat sich bewusst dagegen entschieden — Issue #1213 ist seit 2014 offen.

> 📖 **Historischer Hintergrund:**
>
> Haskell bekam HKTs 2006 offiziell (via GHC 6.6), nachdem die Community
> sie seit den 1990ern benoetigte. Scala hatte sie von Anfang an (2004).
> Beide Sprachen wurden mit akademischer Typ-Theorie als Grundlage gebaut.
>
> TypeScript (2012) hatte eine andere Prioritaet: Migration von JavaScript.
> Generics kamen 2014, Conditional Types 2018, Variadic Tuple Types 2020.
> Jedes Feature wurde pragmatisch bewertet — HKTs waren bisher "zu komplex
> fuer den Nutzen".

---

> 🤔 **Denkfrage:** Wenn TypeScript HKTs haette, wie wuerde sich deine
> taegliche Arbeit aendern? Was koenntest du schreiben, was jetzt nicht geht?
>
> **Anregung:** Denk an generische Bibliotheks-Interfaces, ORM-Abstraktionen,
> oder Test-Helpers die mit "jedem Container-Typ" funktionieren sollen.

---

<!-- /depth -->
## Die Workarounds: Wie die Community HKTs emuliert
<!-- section:summary -->
Weil TypeScript keine nativen HKTs hat, haben findige Entwickler
Workarounds erfunden. Es gibt MEHRERE Ansaetze.

<!-- depth:standard -->
Du hast in Sektion 1 gesehen dass wir eine `map`-Funktion schreiben wollten
die fuer Array UND Set funktioniert. Ohne HKTs geht das nicht direkt.
Aber wir koennen es **emulieren**.

### Workaround 1: Conditional Type Dispatch (einfach, geschlossen)

```typescript
type MapOver<Container, NewItem> =
  Container extends Array<any> ? Array<NewItem>
  : Container extends Set<any> ? Set<NewItem>
  : Container extends Promise<any> ? Promise<NewItem>
  : never;
// ^^^ Einfach, aber NICHT erweiterbar.
//     Jeder neue Container = neuer Branch.
//     Du kannst als Nutzer keinen eigenen Container hinzufuegen.

type Test1 = MapOver<string[], number>;        // number[]
type Test2 = MapOver<Set<string>, boolean>;    // Set<boolean>
```

Das ist wie ein grosses `switch`-Statement auf Typ-Ebene. Funktioniert,
aber du musst jeden Fall kennen.

### Workaround 2: URI-to-Kind (erweiterbar, das "fp-ts Pattern")

Das ist der Ansatz den fp-ts verwendet. Die Idee ist clever: Statt einen
Type Constructor als Parameter zu uebergeben, verwenden wir einen **String**
als Schluessel und eine **Map** die jeden Schluessel auf einen Type
Constructor abbildet.

```typescript
// Schritt 1: Eine Map von String-Schluesseln zu konkreten Typen
interface URItoKind<A> {
  Array: Array<A>;      // "Array" → Array<A>
  Promise: Promise<A>;  // "Promise" → Promise<A>
  Set: Set<A>;          // "Set" → Set<A>
}
// ^^^ Das Interface ist die "Lookup-Map".
//     Der String-Schluessel steht fuer den Type Constructor.
//     Das A wird durchgereicht — deshalb kriegen wir Array<A>, nicht Array.

// Schritt 2: Alle bekannten URIs als Union
type URIS = keyof URItoKind<any>;
// URIS = "Array" | "Promise" | "Set"

// Schritt 3: Der "Apply"-Typ
type Kind<URI extends URIS, A> = URItoKind<A>[URI];
// ^^^ Kind<"Array", string> → Array<string>
//     Kind<"Promise", number> → Promise<number>
```

**Wichtig zu verstehen:** Das ist NICHT der einzig wahre Weg. Es ist
_eine_ Loesung. Andere Bibliotheken machen es anders.

---

> 🔬 **Inline-Experiment:** Oeffne die TypeScript Playground und tippe:
>
> ```typescript
> interface URItoKind<A> {
>   Array: Array<A>;
> }
> type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];
> type Result = Kind<"Array", string>;
> // ^^^ Hover ueber Result — was siehst du?
> ```
>
> Jetzt loesche das Interface und schreib `type Result = ???`.
> Ohne die Map gibt es keine Moeglichkeit, "Array" als Typ zu verwenden.

---

<!-- /depth -->
## Praktisches Beispiel: Generische `map` mit URI-to-Kind
<!-- section:summary -->
Jetzt koennen wir die `map`-Funktion schreiben, die in Sektion 1 nicht
moeglich war.

<!-- depth:standard -->
```typescript annotated
interface URItoKind<A> {
  Array: Array<A>;
  Set: Set<A>;
}
type URIS = keyof URItoKind<any>;
type Kind<URI extends URIS, A> = URItoKind<A>[URI];

// Abstraktes Interface: "Jeder Typ der map unterstuetzt"
interface Mappable<URI extends URIS> {
  map<A, B>(fa: Kind<URI, A>, fn: (a: A) => B): Kind<URI, B>;
}
// ^^^ Lies das so: "Nimm einen Container vom URI-Typ mit Inhalt A,
//      transformiere mit fn, gib Container vom URI-Typ mit Inhalt B zurueck."
//      Das URI bleibt gleich — Array wird zu Array, Set wird zu Set.

// Konkrete Implementierung fuer Array:
const arrayMappable: Mappable<"Array"> = {
  map: <A, B>(fa: A[], fn: (a: A) => B): B[] => fa.map(fn),
};

// Konkrete Implementierung fuer Set:
const setMappable: Mappable<"Set"> = {
  map: <A, B>(fa: Set<A>, fn: (a: A) => B): Set<B> =>
    new Set([...fa].map(fn)),
};

// Verwendung:
const result1 = arrayMappable.map([1, 2, 3], x => x * 2);
// result1: number[]
const result2 = setMappable.map(new Set([1, 2, 3]), x => x.toString());
// result2: Set<string>
```

> 🧠 **Selbst-Erklaerung:** Warum muessen wir `arrayMappable` und
> `setMappable` getrennt implementieren? Warum kann TypeScript das nicht
> automatisch generieren?
>
> **Kernpunkte:** Der Typ (URI-to-Kind) sagt nur WAS der Container ist |
> Die Implementierung muss WISSEN wie der Container funktioniert |
> Array hat `.map()`, Set braucht `[...set].map()`, Promise braucht `.then()` |
> Typ-Emulation ≠ automatische Implementierung

---

<!-- /depth -->
## Erweiterbarkeit: Declaration Merging
<!-- section:summary -->
Das Schoene am Interface-Map-Pattern: Es ist erweiterbar! Dank

<!-- depth:standard -->
TypeScript's Declaration Merging kann jede Datei, jedes Modul, jede
Bibliothek neue Container registrieren:

```typescript annotated
// In deiner App:
interface URItoKind<A> {
  Array: Array<A>;
}

// In einer anderen Datei (z.B. rxjs-mapper.ts):
interface URItoKind<A> {
  Observable: Observable<A>;
}
// ^^^ Declaration Merging! TypeScript fuegt beide Deklarationen zusammen.
//     URIS ist jetzt automatisch "Array" | "Observable".

// Ein externes Modul registriert seinen eigenen Container:
interface URItoKind<A> {
  Either<L, A>: Either<L, A>;  // Zwei Parameter!
}
// ^^^ Auch das geht — mit einem zweiten Typparameter.
```

---

> 🔬 **Experiment:** Registriere einen eigenen `Maybe` Container:
>
> ```typescript
> class Maybe<A> {
>   constructor(private value: A | null) {}
>   map<B>(fn: (a: A) => B): Maybe<B> {
>     return this.value !== null
>       ? new Maybe(fn(this.value))
>       : new Maybe<B>(null);
>   }
>   static of<A>(a: A): Maybe<A> { return new Maybe(a); }
> }
>
> interface URItoKind<A> {
>   Maybe: Maybe<A>;
> }
>
> // Test:
> type Test = Kind<"Maybe", string>;
> // ^^^ Sollte Maybe<string> sein — hover zum Pruefen!
> ```

---

<!-- /depth -->
## Andere Ansaetze: URI-to-Kind ist nicht alles
<!-- section:summary -->
Nicht jede Bibliothek nutzt das URI-Pattern. Hier sind Alternativen:

<!-- depth:standard -->
### Variante: Type Lambda Pattern (`@gcanti/fp-ts` v2 Alternative)

Einige Bibliotheken verwenden eine abstrakte "Type Lambda" Struktur:

```typescript
// Idee: Jeder Type Constructor ist eine "Funktion" A → F<A>
interface TypeLambda {
  readonly type: unknown; // F<A> wird als opaque type kodiert
}

// Jeder Container implementiert ein Interface:
interface ArrayHKT extends TypeLambda {
  type: Array<this["A"]>;
}
// ^^^ Statt Strings wird der Type Constructor direkt als Interface kodiert.
//     Kein String-Lookup, aber etwas komplexer zu schreiben.
```

### Variante: Structural HKTs (Type Classes via Constraints)

```typescript
// Statt ueber URIs, abstrahiere ueber Struktur:
interface Mappable<T> {
  map<A, B>(fn: (a: A) => B): Mappable<B>;
}

// Funktioniert fuer alles was .map() hat:
function transform<T extends Mappable<any>>(container: T) {
  return container.map(x => x);
}
// ^^^ Das ist Duck Typing auf Typ-Ebene.
//     Schwaecher als echte HKTs, aber fuer viele Faelle ausreichend.
```

### Variante: Module Augmentation (Angular DI Pattern)

Angular's Dependency Injection nutzt eine aehnliche Idee:

```typescript
// InjectionToken<T> ist ein Type Constructor:
const USER_SERVICE = new InjectionToken<UserService>('UserService');
// InjectionToken<UserService> ist der konkrete Typ.

// inject<T>() inferiert T aus dem Token:
const service = inject(USER_SERVICE);
// service: UserService — kein explizites <UserService> noetig.
```

Das ist kein HKT im akademischen Sinn, aber das gleiche Prinzip:
Ein abstrakter Mechanismus der einen Type Constructor als Parameter nimmt.

---

## Framework-Bezug: Wo HKTs im Alltag auftauchen

> ⚛️ **React:** `ComponentPropsWithRef<T>` ist ein Higher-Order Type:
> Es nimmt einen Component-Typ T und extrahiert dessen Props.
> Intern nutzt React Conditional Types als HKT-Ersatz:
>
> ```typescript
> type ComponentPropsWithRef<T extends ElementType> =
>   T extends new (props: infer P) => any ? P & { ref?: Ref<InstanceType<T>> }
>   : T extends (props: infer P) => any ? P
>   : never;
> ```
>
> Das `T` hier ist ein Type Constructor — `ComponentPropsWithRef` nimmt
> einen Component-Typ und liefert einen Props-Typ. Das ist HKT-Denken,
> auch wenn es technisch Conditional Types sind.

> 🔭 **RxJS:** Operatoren wie `pipe()` verhalten sich wie HKTs:
>
> ```typescript
> const op = pipe(
>   filter(x => x > 0),      // Observable<T> → Observable<T>
>   map(x => x * 2),         // Observable<T> → Observable<U>
>   take(5),                 // Observable<T> → Observable<T>
> );
> ```
>
> Jeder Operator ist eine "Typ-Funktion" die `Observable<T>` nimmt und
> `Observable<U>` zurueckgibt. Die `pipe`-Signatur ist im Wesentlichen:
>
> ```typescript
> function pipe<A, B, C>(
>   op1: OperatorFunction<A, B>,
>   op2: OperatorFunction<B, C>
> ): OperatorFunction<A, C>;
> ```
>
> Das ist ein Higher-Order Type Pattern — auch wenn RxJS es nicht so nennt.

> 🅰️ **Angular:** Der DI-Container nutzt `InjectionToken<T>` als
> Type Constructor. Die `inject<T>()` Funktion inferiert T aus dem Token.
> Das gleiche Muster: Ein abstrakter Typ der einen Type Constructor
> als Parameter verwendet.

---

## Was du gelernt hast

- **Higher-Kinded Types** sind Typen die Type Constructors als Parameter nehmen
  — analog zu Higher-Order Functions die Funktionen als Parameter nehmen
- **Type Constructors** (`Array`, `Promise`, `Set`) sind unvollstaendige Typen
  die ein Argument brauchen um konkret zu werden
- TypeScript hat **keine nativen HKTs** weil das Typsystem pragmatistisch
  designed wurde — nicht akademisch
- Das **URI-to-Kind-Pattern** ist ein Workaround der Strings als Proxy fuer
  Type Constructors verwendet: `Kind<"Array", string>` statt `Array<string>`
- **Conditional Type Dispatch** ist die einfachere Alternative fuer
  geschlossene Mengen von Containern
- **Declaration Merging** macht das URI-Pattern erweiterbar — jede Bibliothek
  kann neue Container registrieren
- **RxJS Operatoren**, **React Props-Extraktion** und **Angular DI** nutzen
  alle HKT-aehnliche Muster, auch wenn sie sie nicht so nennen

> **Kernkonzept:** HKTs sind keine exotische Theorie — sie beschreiben
> einfach das Muster "Typ der einen Type Constructor nimmt". TypeScript
> emuliert das durch Indirektion (URI-to-Kind) statt es nativ zu unterstuetzen.

---

> ⏸️ **Pausenpunkt:** Guter Zeitpunkt fuer eine kurze Pause.
> In der naechsten Sektion geht es um **Varianz** — ein fundamentales
> Konzept das erklaert, wann `Container<Cat>` ein `Container<Animal>` ist
> (und wann nicht).
>
> **Weiter:** [Sektion 03 - Varianz verstehen →](./03-varianz-verstehen.md)
