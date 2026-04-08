# Sektion 2: Type Instantiation und Depth Limits

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Wie der Compiler arbeitet](./01-wie-der-compiler-arbeitet.md)
> Naechste Sektion: [03 - Performante Typen schreiben](./03-performante-typen-schreiben.md)

---

## Was du hier lernst

- Was **Type Instantiation** bedeutet und warum sie exponentiell wachsen kann
- Woher der gefuerchtete Fehler **"Type instantiation is excessively deep"** kommt
- Was **Depth Limits** und **Instantiation Limits** konkret sind (Zahlen!)
- Wie du diese Limits **bewusst umgehst** statt blind dagegen zu laufen

---

## Hintergrund: Warum gibt es Limits?

> **Origin Story: Der Absturz der Nightly**
>
> Im Jahr 2019 fuehrte ein PR im TypeScript-Repository zu einem merkwuerdigen
> Bug: Ein bestimmter Typ liess den Compiler in eine Endlosschleife laufen.
> Der Typ war nicht offensichtlich rekursiv — aber durch die Kombination von
> Conditional Types und Mapped Types entstand eine **implizite Rekursion**,
> die der Compiler immer tiefer aufloeste, bis der Speicher voll war.
>
> Als Reaktion fuehrte das TypeScript-Team harte Limits ein: maximale
> Rekursionstiefe (50), maximale Type Instantiations (5.000.000 in modernen
> Versionen). Diese Limits schuetzen den Compiler vor sich selbst — und
> dich vor endlosen Compile-Zeiten.
>
> Interessanterweise war der Ausloeser ein Typ aus dem lodash-types-Paket.
> Jemand hatte versucht, die ueberladenen `_.get()`-Funktionen vollstaendig
> zu typen — mit Template Literal Types fuer verschachtelte Property-Pfade.
> Das Ergebnis war ein Typ-Baum mit Millionen von Zweigen, der den Compiler
> buchstaeblich erstickte. Dieser Vorfall zeigt: Selbst etablierte Library-Typen
> koennen die Grenzen des Compilers erreichen.

Stell dir den Checker als eine Maschine vor, die Typen "ausrechnet".
Manche Berechnungen sind trivial (`string` ist `string`), andere sind
wie ein Baum, der bei jedem Schritt neue Aeste bekommt. Ohne Limits
wuerde dieser Baum endlos wachsen.

> 🌳 **Analogie: Fraktale und Typen**
>
> Ein rekursiver Typ ist wie ein Fraktal in der Mathematik — ein Muster,
> das sich selbst in immer kleineren Massstaeben wiederholt. Das Mandelbrot-
> Set ist theoretisch unendlich tief. In der Praxis zoomt man bis zu einem
> bestimmten Punkt und hoert auf. Der TypeScript-Compiler macht genau das:
> Er "zoomt" in rekursive Typen hinein, aber stoppt bei Tiefe 50.
>
> Genauso wie du ein Fraktal auf einem Bildschirm nicht unendlich tief
> rendern kannst (deine Grafikkarte wuerde ueberhitzen), kann der Compiler
> unendliche Typen nicht unendlich tief aufloesen. Das Limit ist der
> "maximale Zoom" des Type-Checkers.

---

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen einem
> generischen Typ der instantiiert wird und einem rekursiven Typ der
> instantiiert wird?
>
> **Kernpunkte:** Generische Typen erzeugen EINE Instanz pro Verwendung |
> Rekursive Typen erzeugen viele Instanzen (eine pro Rekursionsstufe) |
> `Box<string>` = 1 Instantiierung | `DeepReadonly<{a:{b:{c:string}}}>` =
> 4 Instantiierungen (1 + 3 verschachtelte)

---

## Was ist Type Instantiation?

Jedes Mal, wenn du einen generischen Typ mit konkreten Parametern
verwendest, **instantiiert** der Compiler diesen Typ:

```typescript annotated
type Box<T> = { value: T };

type StringBox = Box<string>;
// ^ 1 Instantiierung: Box<string> → { value: string }
type NumberBox = Box<number>;
// ^ 1 Instantiierung: Box<number> → { value: number }

type Pair<A, B> = { first: A; second: B };
type SP = Pair<string, number>;
// ^ 1 Instantiierung: Pair<string, number> → { first: string; second: number }
```

Das ist billig. Aber schau was passiert, wenn Typen **andere generische
Typen** als Parameter verwenden:

```typescript annotated
type Wrapper<T> = {
  value: T;
  nested: Box<T>;
  // ^ Instantiierung von Box<T> fuer jedes T
  pair: Pair<T, T>;
  // ^ Instantiierung von Pair<T, T> fuer jedes T
};

type Deep = Wrapper<Box<Pair<string, number>>>;
// ^ Wrapper<...> → 1 Instantiierung
//   Box<Pair<string, number>> → 1 Instantiierung
//     Pair<string, number> → 1 Instantiierung
//   Pair<Box<Pair<...>>, Box<Pair<...>>> → weitere Instantiierungen
// Schon 5+ Instantiierungen fuer einen einzigen Typ
```

> 💭 **Denkfrage:** Wenn ein Typ `Tree<T>` sich selbst referenziert
> (`left: Tree<T>; right: Tree<T>`), wie viele Instantiierungen entstehen
> wenn der Checker die Tiefe bis Level 5 aufloest?
>
> **Antwort:** 2^0 + 2^1 + 2^2 + 2^3 + 2^4 = 31 Instantiierungen.
> Bei Level 10 waeren es 1.023. Bei Level 20: ueber eine Million.
> Exponentielles Wachstum ist der Grund fuer Depth Limits.

---

## Die konkreten Limits

TypeScript hat mehrere harte Grenzen:

| Limit | Wert | Fehler bei Ueberschreitung |
|-------|:----:|---------------------------|
| Typ-Rekursionstiefe | **50** | "Type instantiation is excessively deep and possibly infinite" |
| Typ-Instantiierungen | **5.000.000** | Compiler wird extrem langsam (kein expliziter Fehler) |
| Conditional Type Tiefe | **50** | Gleicher Fehler wie Rekursionstiefe |
| Union-Typ-Groesse | **100.000** | "Expression produces a union type that is too complex" |

> 💭 **Denkfrage:** TypeScript hat 5.000.000 als Instantiation Limit.
> Warum diese spezifische Zahl? Hatten die Entwickler Willkuer?
>
> **Antwort:** 5 Millionen ist ein empirischer Wert. Das TypeScript-Team
> hat hunderte reale Projekte analysiert. Selbst die komplexesten Typen
> (z.B. GraphQL-Code-Generierung mit Hunderten von Queries) brauchen
> selten ueber 1 Million Instantiierungen. 5 Millionen gibt genug Puffer
> fuer echte Projekte, beendet aber Endlosschleifen innerhalb von Sekunden.

Der bekannteste Fehler ist **TS2589**:

```typescript annotated
// Rekursiver Typ der zu tief wird:
type InfiniteArray<T> = [T, ...InfiniteArray<T>];
// ^ FEHLER: TS2589 — "Type instantiation is excessively deep"
// Der Compiler versucht [T, T, T, T, ...] aufzuloesen
// Bei Tiefe 50 gibt er auf

// Rekursiver Conditional Type:
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
// ^ Funktioniert fuer Objekte bis ~50 Verschachtelungsebenen
// ^ Bei tiefer verschachtelten Strukturen: TS2589
```

> 🧠 **Erklaere dir selbst:** Warum hat das TypeScript-Team das Limit auf genau 50 gesetzt und nicht auf 100 oder 1000? Was waere der Nachteil eines hoeheren Limits?
> **Kernpunkte:** 50 reicht fuer alle realistischen Anwendungsfaelle | Hoeheres Limit = laengere Compile-Zeiten bei fehlerhaften Typen | Der Compiler muss auch bei Endlosrekursion schnell abbrechen

---

## Wann laeufst du in diese Limits?

In der Praxis gibt es drei Hauptursachen:

### 1. Rekursive Utility-Types

```typescript annotated
// DeepPartial — ein Klassiker der oft Probleme macht:
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    // ^ Rekursion: Fuer jedes Property wird DeepPartial erneut aufgerufen
    : T[K];
};

// Bei flachen Objekten: kein Problem
type FlatConfig = DeepPartial<{ host: string; port: number }>;
// ^ 2 Properties, 1 Ebene — trivial

// Bei tief verschachtelten: potentielles Problem
type DeepConfig = DeepPartial<{
  server: { host: string; ssl: { cert: string; key: string } };
  database: { primary: { host: string; pool: { min: number; max: number } } };
}>;
// ^ 3 Ebenen — noch OK, aber die Instantiierungen wachsen mit jeder Ebene
```

### 2. Distributive Conditional Types mit grossen Unions

```typescript annotated
type AllHTMLElements =
  | "div" | "span" | "p" | "a" | "button" | "input"
  | "form" | "table" | "tr" | "td" | "th" | "thead"
  | "tbody" | "ul" | "ol" | "li" | "h1" | "h2" | "h3"
  | "img" | "video" | "audio" | "canvas" | "svg";
// ^ 22 Elemente

type ElementProps<T extends string> = T extends "input"
  ? { type: string; value: string }
  : T extends "a"
  ? { href: string }
  : { children: string };

type AllProps = ElementProps<AllHTMLElements>;
// ^ Distributive: ElementProps wird fuer JEDES Union-Member aufgerufen
// ^ 22 separate Evaluierungen des Conditional Type
// ^ Bei komplexeren Conditional Types explodiert das
```

### 3. Overloads + Generics in Library-Code

```typescript annotated
// Typische Situation in RxJS, Lodash, oder React-Query:
declare function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
declare function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
declare function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D;
// ^ Jede Overload ist ein eigener Typ, den der Checker durchprobieren muss
// ^ Bei 20 Overloads * komplexe Generics = teuer
```

> ⚡ **Framework-Bezug (React):** React's `createElement` und JSX-Typen sind
> notorisch teuer fuer den Checker. Der Typ `React.FC<Props>` triggert
> Overload-Resolution fuer Hunderte von HTML-Elementen. In grossen React-
> Projekten kann allein die JSX-Typ-Pruefung 20-30% der Compile-Zeit
> ausmachen. Deshalb empfiehlt das React-Team mittlerweile, `React.FC` zu
> vermeiden und stattdessen Props direkt zu annotieren.

> ⚡ **Framework-Bezug (Angular):** Angulars Dependency Injection erzeugt
> ebenfalls teure Typ-Instantiierungen. Der Typ `Inject<T>` mit verschachtelten
> Provider-Konfigurationen kann in grossen Modulen (z.B. `AppModule` mit 20+
> Providern) zu unerwartet vielen Instantiierungen fuehren. Besonders problematisch:
> `MultiProvider`-Pattern mit Injection-Tokens, die selbst Generics verwenden.
> Angular-Teams berichten, dass das Umstellen von `useFactory` mit komplexen
> generischen Rueckgabetypen auf einfache Factory-Funktionen die Compile-Zeit
> um 10-15% reduziert hat.

---

## Wie du Limit-Fehler behebst

Wenn du TS2589 bekommst, hast du drei Strategien:

```typescript annotated
// Strategie 1: Rekursion begrenzen mit einem Counter
type DeepReadonly<T, Depth extends number[] = []> =
  Depth["length"] extends 10
    ? T  // Abbruch nach 10 Ebenen
    : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K], [...Depth, 0]> }
    : T;
// ^ Das Tuple Depth waechst mit jeder Rekursion um 1
// ^ Bei Laenge 10: Abbruch → kein TS2589

// Strategie 2: Tail-Rekursion (TS 4.5+)
// TypeScript erkennt Tail-Position und optimiert:
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;
// ^ Tail-Position: TrimLeft ist der letzte Ausdruck
// ^ Compiler kann das iterativ statt rekursiv aufloesen
// ^ Erlaubt viel tiefere "Rekursion" als 50

// Strategie 3: Ergebnis cachen mit Type Alias
type Cached = DeepReadonly<MyHugeType>;
// ^ Einmal berechnet, mehrfach verwendet
// ^ Ohne Cache: jede Verwendung berechnet neu
```

> 🧠 **Erklaere dir selbst:** Was passiert wenn du denselben generischen
> Typ an zwei verschiedenen Stellen im Code verwendest? Berechnet der
> Compiler ihn zweimal?
>
> **Kernpunkte:** Ja, standardmaessig wird bei jeder Verwendung neu
> instantiiert | Ein Type Alias `type Cached = GenerischerTyp<X>` wird
> EINMAL berechnet und das Ergebnis wird gecacht | Wenn du den
> generischen Typ direkt an 10 Stellen schreibst: 10 Berechnungen |
> Wenn du ihn einmal cachst und den Cache verwendest: 1 Berechnung

---

> 🧪 **Zusatzexperiment: Template Literal Types und Performance**
>
> Template Literal Types koennen ebenfalls Limits erreichen:
>
> ```typescript
> type Join<Parts extends string[], Sep extends string = "-"> =
>   Parts extends [infer First extends string, ...infer Rest extends string[]]
>     ? Rest extends string[]
>       ? `${First}${Sep}${Join<Rest, Sep>}`
>       : First
>     : "";
>
> type CSS = Join<["bg", "red", "hover", "text", "lg"]>;
> // ^ "bg-red-hover-text-lg" — funktioniert
>
> type VeryLong = Join<[
>   "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
>   "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"
> ]>;
> // ^ Bei 20 Teilen: Template-String-Rekursion erreicht Tiefe 50+
> // ^ Weil `${First}${Sep}${Join<...>}` TWO rekursive Aufrufe erzeugt
> ```
>
> Der `${Sep}${Join<...>}` Teil erzeugt implizit zwei rekursive Zweige —
> ein versteckter exponentieller Fallstrick.

> 🧪 **Experiment:** Probiere diesen Typ aus, der absichtlich das Limit erreicht:
>
> ```typescript
> type Repeat<S extends string, N extends number, Acc extends string = "", Counter extends 0[] = []> =
>   Counter["length"] extends N
>     ? Acc
>     : Repeat<S, N, `${Acc}${S}`, [...Counter, 0]>;
>
> type FiveAs = Repeat<"a", 5>;   // "aaaaa" — OK
> type FiftyAs = Repeat<"a", 50>; // Grenzbereich!
> type HundredAs = Repeat<"a", 100>; // TS2589!
> ```
>
> Spiele mit dem Wert und beobachte, wo der Compiler aufgibt.

---

## Was du gelernt hast

- **Type Instantiation** passiert bei jeder Verwendung eines generischen Typs mit konkreten Parametern
- Rekursive Typen koennen **exponentiell** viele Instantiierungen erzeugen
- Das **Depth Limit** liegt bei 50, das Instantiation Limit bei ca. 5 Millionen
- **TS2589** ist der Fehler fuer zu tiefe Rekursion — loesbar durch Counter, Tail-Rekursion oder Caching
- Grosse **Unions + Distributive Conditional Types** sind ein haeufiger Performance-Killer

**Kernkonzept zum Merken:** Jeder generische Typ, den du schreibst, ist eine Anweisung an den Checker: "Berechne das fuer mich." Rekursive Typen sagen: "Berechne das immer wieder." Limits sind keine Bugs — sie schuetzen dich vor Typen, die den Compiler in eine Endlosschleife treiben wuerden.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du kennst jetzt die
> Grenzen des Compilers.
>
> Weiter geht es mit: [Sektion 03: Performante Typen schreiben](./03-performante-typen-schreiben.md)
