# Sektion 5: Grenzen und Performance

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Rekursive Conditional Types](./04-rekursive-conditional-types.md)
> Naechste Sektion: [06 - Praxis-Patterns](./06-praxis-patterns.md)

---

## Was du hier lernst

- Warum TypeScript ein **Rekursionslimit von ~50 Ebenen** hat und was passiert wenn du es erreichst
- Wie du **Tail Recursion Optimization** (TS 4.5) nutzt, um tiefer zu rekursieren
- Wie du **Tuple-Laenge als Zaehler** fuer Type-Level-Arithmetik verwendest
- Wann rekursive Typen die **Compile-Zeit** sprengen und wie du das vermeidest

---

## Das Rekursionslimit: Warum 50?

TypeScript wertet Typen auf einem **Stack** aus — genau wie JavaScript
Funktionsaufrufe. Und genau wie bei Funktionen gibt es ein Limit:

```typescript
// Dieser Typ zaehlt von N bis 0:
type Countdown<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc
    : Countdown<N, [...Acc, unknown]>;

type Ten = Countdown<10>;    // OK: [unknown x10]
type Fifty = Countdown<50>;  // OK (gerade noch)
// type Hundred = Countdown<100>;
// Error: Type instantiation is excessively deep and possibly infinite.
```

> **Hintergrund: Warum TypeScript ein Rekursionslimit hat**
>
> Der TypeScript-Compiler wertet Typen **stack-basiert** aus.
> Jede rekursive Typ-Instanziierung legt einen neuen Frame
> auf den Typ-Auswertungs-Stack. Bei ca. **50 Ebenen** bricht
> TypeScript ab mit der Fehlermeldung: "Type instantiation is
> excessively deep and possibly infinite."
>
> Das Limit ist **absichtlich konservativ**. Es schuetzt vor:
> 1. **Endlosschleifen** (fehlende Abbruchbedingung)
> 2. **Speicherueberlauf** (jeder Frame verbraucht Speicher)
> 3. **Extrem langen Compile-Zeiten** (exponentielle Typ-Expansion)
>
> Das Limit ist hart codiert im Compiler (in `checker.ts`) und
> kann nicht konfiguriert werden.

---

## Die Fehlermeldungen verstehen

TypeScript hat mehrere Fehlermeldungen fuer Rekursionsprobleme:

```typescript
// 1. "Type instantiation is excessively deep and possibly infinite"
//    → Du hast das ~50-Ebenen-Limit erreicht
type TooDeep = Countdown<100>;

// 2. "Type alias circularly references itself"
//    → Direkte Zirkularitaet ohne Conditional
type Bad = Bad | string;
// ^ FEHLER! Kein Conditional Type, der die Rekursion "bremst"

// 3. "Type produces a union type that is too complex to represent"
//    → Die Rekursion erzeugt zu viele Union-Mitglieder
type AllPaths<T> = /* ... tief verschachtelt ... */;
// Bei sehr breiten Objekten kann die Union RIESIG werden
```

---

## Erklaere dir selbst: Warum kann DeepPartial abstuerzen?

> **Erklaere dir selbst:**
>
> Warum kann `DeepPartial<ExtremelyDeep>` den Compiler zum
> Absturz bringen, obwohl DeepPartial "nur" ueber Schluessel
> iteriert?
>
> Denke an: Was passiert bei einem Objekt mit 100 verschachtelten
> Ebenen? Und was bei einem Objekt mit 10 Schluesseln pro Ebene
> ueber 10 Ebenen?
>
> *30 Sekunden nachdenken.*

Das Problem ist nicht nur die **Tiefe**, sondern auch die **Breite**.
Bei 10 Schluesseln pro Ebene und 10 Ebenen erzeugt `Paths<T>` eine
Union mit 10 + 100 + 1000 + ... = ~11 Milliarden Pfaden. Die Tiefe
(Stack) ist bei DeepPartial kein Problem (Mapped Types sind
iterativ), aber `Paths<T>` ist ein Conditional Type der bei **breiten
Objekten** explodiert.

---

## Tail Recursion Optimization (TS 4.5)

TypeScript 4.5 (November 2021) brachte eine wichtige Optimierung:
**Tail Recursion** fuer Conditional Types.

```typescript annotated
// OHNE Tail Recursion (verbraucht Stack):
type CountNaive<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc["length"]
    : CountNaive<N, [...Acc, unknown]>;
    // ^ Der rekursive Aufruf ist das LETZTE was passiert
    // ^ = "Tail Position" → TypeScript kann optimieren!

// MIT Tail Recursion optimiert TypeScript automatisch:
// - Statt Stack-Frames aufzubauen, wird der aktuelle Frame wiederverwendet
// - Erlaubt Rekursion bis ~1000 statt ~50

type Thousand = CountNaive<999>;  // Funktioniert dank Tail Recursion!
```

**Wann greift Tail Recursion?**

Der rekursive Aufruf muss in einer von zwei "Tail-Positionen" stehen:

```typescript
// Position 1: Direkt im true/false-Zweig eines Conditional Types
type TailA<T> = T extends X ? TailA<...> : Result;
//                             ^^^^^^^^^ Tail Position

// Position 2: Direkt als Element eines Tuple-Spreads
type TailB<T> = T extends X ? [...TailB<...>] : [];
//                              ^^^^^^^^^ Tail Position (Tuple Spread)

// NICHT Tail Position (keine Optimierung):
type NotTail<T> = T extends X ? [TailA<...>, string] : [];
//                               ^^^^^^^^^ Nicht am Ende → kein Tail Call
```

---

## Denkfrage: Countdown-Typ mit Tuple-Zaehler

> **Denkfrage:**
>
> Wie baust du einen Countdown-Typ der von N bis 0 zaehlt?
>
> Hinweis: Du kannst die **Laenge eines Tuples** als Zaehler verwenden:
> `[]["length"]` = 0, `[unknown]["length"]` = 1, `[unknown, unknown]["length"]` = 2
>
> ```typescript
> type NumToTuple<N extends number, Acc extends unknown[] = []> =
>   Acc["length"] extends N
>     ? Acc
>     : NumToTuple<N, [...Acc, unknown]>;
>
> type Three = NumToTuple<3>;  // [unknown, unknown, unknown]
> type Len = Three["length"];  // 3
> ```
>
> Dieser Tuple-Trick ist die **einzige Moeglichkeit**, auf Type-Level
> zu zaehlen — TypeScript hat keine echte Arithmetik fuer Typen.

---

## Tuple-Arithmetik: Add und Subtract

Mit dem Tuple-Trick kannst du sogar **Addition und Subtraktion**
auf Type-Level bauen:

```typescript annotated
// Tuple aus N Elementen bauen
type BuildTuple<N extends number, T extends unknown[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, unknown]>;

// Addition: Tuple A + Tuple B = kombiniertes Tuple
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];
  // ^ Spread beide Tuples zusammen und lies die Laenge
  // ^ [unknown x A, unknown x B]["length"] = A + B

type Sum = Add<3, 4>;  // 7

// Subtraktion: Entferne B Elemente von A
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
    ? Rest["length"]
    // ^ Wenn A >= B: Rest hat A-B Elemente
    : never;
    // ^ Wenn A < B: Subtraktion nicht moeglich

type Diff = Subtract<10, 3>;  // 7
```

---

## Performance-Fallen: Was du vermeiden solltest

Hier sind die haeufigsten Performance-Killer:

```typescript
// ❌ FALSCH: Distributive Conditional Types + Rekursion
//    Jedes Union-Mitglied wird SEPARAT rekursiert → exponentielles Wachstum
type BadPaths<T> = T extends object
  ? keyof T | `${keyof T & string}.${BadPaths<T[keyof T]>}`
  //                                  ^^^^^^^^^^^^^^^^^^
  //                                  T[keyof T] ist eine UNION aller Werte!
  //                                  Bei {a: X, b: Y}: BadPaths<X | Y>
  //                                  → BadPaths<X> | BadPaths<Y> (distributiv!)
  : never;

// ✅ RICHTIG: Mapped Type statt Distribution
type GoodPaths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${GoodPaths<T[K]>}` }[keyof T & string]
  : never;
  // ^ Mapped Type iteriert Schluessel-fuer-Schluessel → linear statt exponentiell
```

**Faustregel fuer Performance:**

| Pattern | Komplexitaet | Problem |
|---------|-------------|---------|
| Mapped Type + Rekursion | O(Schluessel × Tiefe) | Meist OK |
| Distributive Conditional + Rekursion | O(2^Tiefe) | Exponentiell! |
| Paths auf breiten Objekten | O(Schluessel^Tiefe) | Kann explodieren |
| Tail-rekursiver Conditional | O(Tiefe) | Immer OK |

---

## Experiment: Finde das Rekursionslimit

> **Experiment:**
>
> Teste das Rekursionslimit selbst:
>
> ```typescript
> // 1. Einfacher Zaehler
> type Count<N extends number, Acc extends unknown[] = []> =
>   Acc["length"] extends N
>     ? Acc["length"]
>     : Count<N, [...Acc, unknown]>;
>
> // 2. Teste verschiedene Werte:
> type A = Count<10>;   // 10 — OK
> type B = Count<50>;   // 50 — OK
> type C = Count<100>;  // ??? — Teste es!
> type D = Count<500>;  // ??? — Teste es!
> type E = Count<999>;  // ??? — Teste es!
>
> // 3. Beobachtung:
> // - Bis 50: Immer OK (Standard-Limit)
> // - 50-999: Funktioniert MIT Tail Recursion Optimization (TS 4.5+)
> // - Ab 1000: Auch Tail Recursion hat ein Limit
>
> // 4. Teste OHNE Tail Position:
> type BadCount<N extends number, Acc extends unknown[] = []> =
>   Acc["length"] extends N
>     ? Acc["length"]
>     : [BadCount<N, [...Acc, unknown]>][0];
>     //  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>     //  In einem Tuple-Zugriff: NICHT Tail Position!
>     //  → Keine Optimierung → bricht bei ~50 ab
>
> type F = BadCount<100>;  // Error! Nicht optimierbar
> ```
>
> Das zeigt: **Tail Position** ist entscheidend fuer tiefe Rekursion.

---

## Wann rekursive Typen NICHT verwenden

Rekursive Typen sind maechtig, aber nicht immer die beste Loesung:

```typescript
// ❌ Zu clever: Type-Level Fibonacci
type Fib<N extends number> = /* 20 Zeilen komplexer Rekursion */;
// → Extrem langsame Compile-Zeit, schwer zu debuggen, niemand versteht es

// ✅ Stattdessen: Runtime-Berechnung mit einfachem Typ
function fibonacci(n: number): number { /* ... */ }

// ❌ Zu tief: Paths fuer unbekannte API-Antworten
type ApiPaths = Paths<DeepApiResponse>;  // Hunderte Pfade
// → IDE wird langsam, Autocomplete braucht Sekunden

// ✅ Stattdessen: Nur die Pfade tippen die du brauchst
type KnownPaths = "user.name" | "user.address.city";
```

---

## Framework-Bezug: Compile-Zeit vs Nutzen

> **In Angular und React:**
>
> Rekursive Typen haben einen realen Preis: **Compile-Zeit**.
> In einem grossen Angular-Projekt mit 500+ Komponenten kann
> ein uebermaessig rekursiver Typ die `ng build`-Zeit um
> Sekunden oder sogar Minuten verlaengern.
>
> **Faustregel fuer Projekte:**
> - **DeepPartial/DeepReadonly:** Fast immer OK (Mapped Types, linear)
> - **Paths\<T\> auf eigenen Typen:** OK wenn Typen nicht zu breit sind
> - **Paths\<T\> auf externen/generierten Typen:** Vorsicht!
> - **Type-Level-Arithmetik:** Nur in Library-Code, nie in App-Code
>
> ```typescript
> // Angular Service: DeepReadonly fuer Store-State → OK
> @Injectable({ providedIn: "root" })
> class StateService {
>   private state: DeepReadonly<AppState>;
>   // ^ Shallow genug, dass Compile-Zeit kein Problem ist
> }
>
> // React: Paths fuer FormValues → OK wenn FormValues nicht riesig
> const { register } = useForm<FormValues>();
> register("user.address.street");
> // ^ Paths<FormValues> wird einmal berechnet und gecacht
> ```

---

## Zusammenfassung

### Was du gelernt hast

Du verstehst jetzt die **Grenzen und Performance** rekursiver Typen:

- TypeScript hat ein **Rekursionslimit von ~50** (Standard) bzw **~1000** (Tail-optimiert)
- **Tail Recursion Optimization** (TS 4.5) erlaubt tiefere Rekursion, wenn der rekursive Aufruf in Tail-Position steht
- **Tuple-Laenge** ist der einzige Weg fuer Type-Level-Arithmetik
- **Distributive Conditional Types + Rekursion** = exponentielles Wachstum → vermeiden
- **Mapped Types + Rekursion** = lineares Wachstum → meist OK

> **Kernkonzept:** Rekursive Typen haben zwei Feinde: **Tiefe**
> (Stack-Limit) und **Breite** (Union-Explosion). Tail Recursion
> hilft bei der Tiefe, aber gegen Breite hilft nur bewusstes
> Design. Die Faustregel: Wenn der Typ die IDE merklich verlangsamt,
> ist er zu komplex.

---

> **Pausenpunkt** — Du kennst jetzt die Grenzen. In der letzten
> Sektion setzen wir alles zusammen: Reale Praxis-Patterns aus
> Libraries und Projekten.
>
> Weiter: [Sektion 06 - Praxis-Patterns](./06-praxis-patterns.md)
