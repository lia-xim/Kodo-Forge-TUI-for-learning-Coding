# Sektion 2: Arithmetik auf Type-Level — Der Tuple-Length-Trick

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Types als Sprache](./01-types-als-sprache.md)
> Naechste Sektion: [03 - String-Parsing auf Type-Level](./03-string-parsing-auf-type-level.md)

---

## Was du hier lernst

- Wie man **Zahlen auf Type-Level** repraesentiert — mit Tuples statt Werten
- Den **Tuple-Length-Trick** fuer Addition, Subtraktion und Vergleiche
- Wie man **Laengen-typisierte Arrays** baut (z.B. `Vector<3>`)
- Praktische Anwendung: `NTuple<T, N>` fuer fixierte Array-Laengen

---

## Das Problem: Zahlen existieren nicht auf Type-Level

Auf Werteebene rechnest du: `3 + 4 = 7`. Auf Type-Level kannst du
das nicht — TypeScript hat keinen `+`-Operator fuer Typen. Aber es
gibt einen Trick: **Tuple-Laengen**.

> 📖 **Hintergrund: Der Tuple-Length-Trick**
>
> Dieser Trick stammt aus der funktionalen Programmierung und ist
> aehnlich zur **Peano-Arithmetik** — einem Zahlensystem das nur
> zwei Konzepte kennt: Null und Nachfolger. Die Zahl 3 ist
> "Nachfolger von Nachfolger von Nachfolger von Null". In TypeScript:
> Ein Tuple `[any, any, any]` hat die Laenge `3`. Diese Laenge ist
> ein **Literal Type** — der Compiler kennt sie zur Compilezeit.
> Giuseppe Peano formulierte dieses System 1889, und es ist bis
> heute die Basis fuer Typ-Level-Arithmetik in vielen Sprachen
> (Haskell, Idris, TypeScript).

### Das Grundprinzip

```typescript annotated
type Three = [unknown, unknown, unknown];
type Len = Three["length"];
// ^ Len = 3 (nicht number, sondern das Literal 3!)
// TypeScript kennt die EXAKTE Laenge von Tuple-Typen

// Zum Vergleich:
type Arr = unknown[];
type ArrLen = Arr["length"];
// ^ ArrLen = number (nicht spezifisch — kein Tuple!)
```

Die Idee: Statt mit Zahlen zu rechnen, manipuliere Tuples und
lies am Ende die Laenge ab.

---

## Addition: Tuples zusammenfuegen

```typescript annotated
// Baue ein Tuple mit N Elementen:
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N    // Haben wir genug Elemente?
    ? Acc                     // Ja → fertig
    : BuildTuple<N, [...Acc, unknown]>;  // Nein → ein Element mehr
// ^ Rekursion: Fuege ein Element hinzu bis Laenge = N

// Addition: Zwei Tuples zusammenfuegen
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];
// ^ Spread beide Tuples, lies die Gesamtlaenge

// Testen:
type Sum = Add<3, 4>;     // 7
type Zero = Add<0, 0>;    // 0
type Big = Add<50, 50>;   // 100
```

> 🧠 **Erklaere dir selbst:** Warum braucht `BuildTuple` den
> Accumulator `Acc`? Was wuerde passieren wenn man stattdessen
> `[unknown, ...BuildTuple<N-1>]` schreiben wuerde?
> **Kernpunkte:** TypeScript kann nicht `N-1` auf Type-Level berechnen |
> Der Accumulator zaehlt ueber seine Laenge | Tail-Rekursion ist
> effizienter fuer den Compiler

---

## Subtraktion: Elemente entfernen

```typescript annotated
// Subtraktion: Entferne B Elemente von einem A-Tuple
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    // ^ Pattern-Matching: A-Tuple = B-Tuple + Rest?
    ? Rest["length"]  // Ja → Laenge des Rests = A - B
    : never;          // Nein → B > A, nicht definiert
// ^ Wie: "Nimm 3 Elemente weg, zaehle was uebrig bleibt"

type Diff1 = Subtract<7, 3>;  // 4
type Diff2 = Subtract<5, 5>;  // 0
type Diff3 = Subtract<2, 5>;  // never (negativ nicht moeglich)
```

### Vergleiche: Groesser, Kleiner, Gleich

```typescript annotated
// Ist A groesser als B?
type GreaterThan<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, unknown, ...unknown[]]
    // ^ A-Tuple ist B-Tuple + mindestens 1 Element
    ? true
    : false;

type GT1 = GreaterThan<5, 3>;  // true
type GT2 = GreaterThan<3, 3>;  // false
type GT3 = GreaterThan<2, 3>;  // false
```

> 💭 **Denkfrage:** Die Tuple-Length-Arithmetik hat eine Obergrenze
> von ca. 999 (TypeScript's Rekursionslimit). Ist das ein Problem
> in der Praxis? Wann wuerde man mit groesseren Zahlen auf Type-Level
> rechnen wollen?
>
> **Antwort:** In der Praxis rechnet man selten mit grossen Zahlen
> auf Type-Level. Typische Anwendungen: Array-Laengen (Matrix 4x4),
> String-Laengen-Limits (max. 255 Zeichen), API-Paginierung.
> Fuer echte Berechnungen nutzt man die Werteebene — das Typsystem
> stellt nur sicher, dass die Dimensionen stimmen.

---

## Praxis: Laengen-typisierte Arrays

Das Killer-Feature der Tuple-Arithmetik: **Arrays mit bekannter Laenge**.

```typescript annotated
// Ein Tuple mit genau N Elementen vom Typ T:
type NTuple<T, N extends number, Acc extends T[] = []> =
  Acc["length"] extends N
    ? Acc
    : NTuple<T, N, [...Acc, T]>;
// ^ Generisch: Beliebiger Elementtyp, beliebige Laenge

type Vector3 = NTuple<number, 3>;  // [number, number, number]
type RGB = NTuple<number, 3>;       // [number, number, number]
type Byte = NTuple<0 | 1, 8>;       // [0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1]

// Funktion die exakt 3 Elemente erwartet:
function cross(a: Vector3, b: Vector3): Vector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

cross([1, 2, 3], [4, 5, 6]);    // OK
// cross([1, 2], [4, 5, 6]);     // FEHLER: [number, number] ≠ Vector3
```

> ⚡ **Framework-Bezug:** In Angular-Projekten begegnest du
> laengen-typisierten Arrays bei Matrix-Transformationen in
> Animationen (`transform: matrix(a, b, c, d, tx, ty)` — genau
> 6 Parameter). In React-Projekten mit Three.js oder Canvas-APIs
> sind `Vector3` und `Matrix4` (4x4 = 16 Werte) alltaeglich.
> Ohne NTuple akzeptiert `number[]` versehentlich `[1, 2]` wo
> `[1, 2, 3]` erwartet wird.

---

## Experiment: Typ-sichere Paginierung

Baue einen Typ der sicherstellt dass `page` und `pageSize` zusammen
nicht das Limit ueberschreiten:

```typescript
// Schritt 1: Multiplikation (vereinfacht mit bekannten Werten)
type Multiply<A extends number, B extends number> =
  MultLookup extends Record<`${A}x${B}`, number>
    ? MultLookup[`${A}x${B}`]
    : number;

// Fuer echte Multiplikation braeuchte man wiederholte Addition:
type MultiplyReal<A extends number, B extends number, Acc extends unknown[] = [], Count extends unknown[] = []> =
  Count["length"] extends B
    ? Acc["length"]
    : MultiplyReal<A, B, [...Acc, ...BuildTuple<A>], [...Count, unknown]>;

type Product = MultiplyReal<3, 4, [], []>;  // 12
type Product2 = MultiplyReal<5, 5, [], []>; // 25

// Experiment: Implementiere IsEven<N> das prueft ob eine Zahl gerade ist.
// Tipp: Eine gerade Zahl laesst sich in zwei gleiche Haelften teilen.
// type IsEven<N extends number> = ???
// type E1 = IsEven<4>;  // true
// type E2 = IsEven<5>;  // false
```

Probiere aus: Kannst du `IsEven<N>` mit dem Subtraktions-Typ
implementieren? Was passiert bei `IsEven<0>`?

---

## Was du gelernt hast

- Zahlen auf Type-Level werden durch **Tuple-Laengen** repraesentiert (Peano-Arithmetik)
- **Addition** = Tuples zusammenfuegen, **Subtraktion** = Elemente per `infer` entfernen
- **Vergleiche** funktionieren ueber Pattern-Matching auf Tuple-Laengen
- **NTuple<T, N>** erzeugt Arrays mit exakter Laenge — praktisch fuer Vektoren, Matrizen, RGB-Werte
- Die Obergrenze liegt bei ca. 999 durch TypeScript's Rekursionslimit

> 🧠 **Erklaere dir selbst:** Warum ist `[unknown, unknown, unknown]["length"]`
> der Typ `3` und nicht `number`? Was muesste sich aendern, damit es
> `number` waere?
> **Kernpunkte:** Tuples haben Literal-Laengen weil der Compiler die
> exakte Anzahl kennt | Regulaere Arrays (`unknown[]`) haben `number`
> als Laenge weil sie variabel sind | Das ist der entscheidende
> Unterschied zwischen Tuple und Array auf Type-Level

**Kernkonzept zum Merken:** Der Tuple-Length-Trick uebersetzt Zahlen in Datenstrukturen. Statt "berechne 3+4" sagst du "fuege zwei Gruppen zusammen und zaehle". Das ist das Fundament aller Type-Level-Arithmetik.

---

> **Pausenpunkt** — Tuple-Arithmetik ist das Werkzeug. Als naechstes
> kommt die Anwendung: Strings auf Type-Level parsen.
>
> Weiter geht es mit: [Sektion 03: String-Parsing auf Type-Level](./03-string-parsing-auf-type-level.md)
