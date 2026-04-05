# Sektion 5: Recursive Type Challenges

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Pattern Matching](./04-pattern-matching.md)
> Naechste Sektion: [06 - Praxis: Type-safe Router und Query Builder](./06-praxis-router-query-builder.md)

---

## Was du hier lernst

- Wie man **DeepReadonly**, **DeepPartial** und **Flatten** rekursiv implementiert
- Den **PathOf**-Typ: Alle moeglichen Pfade zu verschachtelten Properties als Union
- **Tail-Call-Optimierung** auf Type-Level (Accumulator-Pattern)
- Strategien um TypeScript's Rekursionslimit zu umgehen

---

## Rekursion auf Type-Level: Die Regeln

Type-Level-Rekursion folgt denselben Prinzipien wie Werteebene-Rekursion:
Basisfall, rekursiver Schritt, Terminierung. Aber es gibt Unterschiede:

1. **Kein Stack im traditionellen Sinn** — der Compiler baut einen Typ-Baum
2. **Rekursionslimit bei ~1000** (seit TS 4.5 fuer Tail-Recursive Types, vorher ~50)
3. **Keine Fehlermeldungen** bei Endlos-Rekursion — nur "Type instantiation is excessively deep"
4. **Kein Debugging** — du kannst keinen Breakpoint setzen; nur Hover-Types im Editor

Jede rekursive Typ-Implementation folgt diesem Grundgeruest:

```typescript annotated
// Template fuer rekursive Typen:
type MyRecursive<Input, Acc = DefaultAcc> =
  /* Basisfall: */ Input extends BaseCase
    ? Acc            // Abbruchbedingung erreicht → Ergebnis
    /* Rekursiver Schritt: */
    : MyRecursive<
        ReducedInput,   // Input verkleinern
        UpdatedAcc      // Accumulator aktualisieren
      >;
// ^ Tail-recursive wenn MyRecursive das letzte ist (kein Wrapper drum herum)
```

> 📖 **Hintergrund: TypeScript's Rekursionsrevolution (TS 4.5)**
>
> Vor TypeScript 4.5 (November 2021) war die Rekursionstiefe auf
> ca. 50 begrenzt. Das machte viele Type-Level-Algorithmen unmoeglich.
> Das TypeScript-Team fuehrte dann **Tail-Call Elimination** fuer
> Conditional Types ein: Wenn der rekursive Aufruf die letzte
> Operation ist (kein `[...Result, extra]` drumherum), erkennt der
> Compiler das und optimiert — aehnlich wie TCO in Scheme oder
> Erlang. Dadurch stieg die Tiefe auf ca. 1000. Der Accumulator-
> Pattern, den du bei `BuildTuple` gesehen hast, ist genau diese
> Technik.
>
> Vor TS 4.5 mussten Library-Autoren mit `Lookup`-Arrays arbeiten —
> vordefinierte Tuples aller moeglichen Laengen bis 50, dann mit
> Conditional Type den richtigen auswaehlen. Das war unpraktisch.
> Die Tail-Call-Optimierung war eine der groessten Verbesserungen
> fuer Type-Level-Programmierung in der Geschichte von TypeScript.

---

## Challenge 1: DeepReadonly

Du kennst `Readonly<T>` — es wirkt nur eine Ebene. Baue die
Deep-Variante:

```typescript annotated
// Flach: Nur oberste Ebene readonly
type ShallowReadonly<T> = { readonly [K in keyof T]: T[K] };

// Tief: Alle Ebenen readonly
type DeepReadonly<T> =
  T extends (...args: any[]) => any    // Funktion?
    ? T                                 // Ja → nicht aendern
    : T extends ReadonlyArray<infer U>  // Readonly-Array?
      ? ReadonlyArray<DeepReadonly<U>>  // Ja → Elemente auch readonly
      : T extends object                // Objekt?
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        // ^ Rekursion: Jedes Property wird DeepReadonly
        : T;                            // Primitiv → fertig

// Test:
interface Config {
  server: {
    host: string;
    ports: number[];
    ssl: { cert: string; key: string };
  };
  debug: boolean;
}

type FrozenConfig = DeepReadonly<Config>;
// FrozenConfig.server.ssl.cert ist readonly!
// FrozenConfig.server.ports ist ReadonlyArray<number>!
```

> 🧠 **Erklaere dir selbst:** Warum muessen Funktionen vom rekursiven
> Durchlauf ausgenommen werden? Was wuerde passieren wenn man
> `DeepReadonly` auch auf Funktionstypen anwendet?
> **Kernpunkte:** Funktionen haben Properties (length, name) |
> DeepReadonly wuerde deren Signatur kaputt machen | `readonly`
> auf Funktions-Properties ist sinnlos

---

## Challenge 2: Flatten (Deep)

```typescript annotated
// Flache ein verschachteltes Array beliebiger Tiefe ab:
type DeepFlatten<T extends unknown[]> =
  T extends [infer First, ...infer Rest]
    // ^ Zerlege in erstes Element und Rest
    ? First extends unknown[]
      // ^ Ist das erste Element selbst ein Array?
      ? [...DeepFlatten<First>, ...DeepFlatten<Rest>]
      // ^ Ja → Flatten beides und zusammenfuegen
      : [First, ...DeepFlatten<Rest>]
      // ^ Nein → Element behalten, Rest flatten
    : [];
    // ^ Leeres Array → fertig (Basisfall)

type F1 = DeepFlatten<[1, [2, 3], [4, [5, 6]]]>;
// ^ [1, 2, 3, 4, 5, 6]

type F2 = DeepFlatten<[[["deep"]], "flat"]>;
// ^ ["deep", "flat"]
```

> 🧠 **Erklaere dir selbst:** `DeepFlatten` ist NICHT tail-recursive —
> beide Zweige spreaden das Ergebnis: `[...DeepFlatten<First>, ...]`.
> Was bedeutet das fuer die Rekursionstiefe? Wann wuerde das
> ein Problem werden?
> **Kernpunkte:** Nicht-TCO = Limit ~50 | Bei sehr tief
> verschachtelten Arrays schlimmstenfalls Compiler-Fehler |
> Fuer echte Produktions-Anwendungen: Tiefe begrenzen oder
> Accumulator-Pattern verwenden

---

## Challenge 3: PathOf — Alle Pfade eines Objekts

Der Koenigstyp: Erzeuge eine Union aller moeglichen Pfade zu
verschachtelten Properties.

```typescript annotated
// Alle Pfade als String-Union:
type PathOf<T, Prefix extends string = ""> =
  T extends object
    ? {
        [K in keyof T & string]:
          // ^ Nur string-Keys (keine symbol/number)
          | `${Prefix}${K}`
          // ^ Aktueller Pfad (z.B. "server")
          | PathOf<T[K], `${Prefix}${K}.`>
          // ^ Rekursion: Verschachtelte Pfade (z.B. "server.host")
      }[keyof T & string]
      // ^ Sammle alle Pfade als Union
    : never;

interface AppConfig {
  server: {
    host: string;
    port: number;
  };
  db: {
    url: string;
    pool: { min: number; max: number };
  };
}

type ConfigPaths = PathOf<AppConfig>;
// ^ "server" | "server.host" | "server.port"
//   | "db" | "db.url" | "db.pool" | "db.pool.min" | "db.pool.max"
```

### PathOf in der Praxis: Type-safe get()

```typescript annotated
// Ermittle den Typ an einem bestimmten Pfad:
type GetByPath<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    // ^ Gibt es einen Punkt? Dann aufteilen
    ? Key extends keyof T
      ? GetByPath<T[Key], Rest>  // Rekursion: Tiefer gehen
      : never
    : Path extends keyof T
      ? T[Path]                   // Letzter Key → Wert-Typ
      : never;

function get<T, P extends PathOf<T>>(
  obj: T,
  path: P
): GetByPath<T, P> {
  return path.split(".").reduce((o: any, k) => o[k], obj) as any;
}

declare const config: AppConfig;
const host = get(config, "server.host");  // string
const max = get(config, "db.pool.max");    // number
// get(config, "server.foo");              // FEHLER: nicht in PathOf
```

> ⚡ **Framework-Bezug Angular:** Angular's `FormGroup.get('address.street')`
> verwendet ein aehnliches Pfad-Pattern. Leider sind Angular's
> Formulare nicht so tief typisiert — `get()` gibt `AbstractControl | null`
> zurueck statt den spezifischen Typ. Mit dem PathOf-Pattern koenntest
> du eine typsichere Wrapper-Funktion bauen:
>
> ```typescript
> // Hypothetische typsichere FormGroup-Hilfsfunktion:
> function getControl<
>   F extends Record<string, AbstractControl>,
>   P extends PathOf<F>
> >(form: FormGroup<F>, path: P): GetByPath<F, P> | null {
>   return form.get(path) as any;
> }
>
> // Dann statt:
> const ctrl = this.form.get('user.address.street');  // AbstractControl | null
> // So:
> const ctrl = getControl(this.form, 'user.address.street');  // vollstaendig typisiert
> ```

> ⚡ **Framework-Bezug React Hook Form:** Das Library nutzt tatsaechlich
> ein PathOf-aehnliches Pattern fuer `register('address.street')` und
> `useWatch({ name: 'address.street' })`. Wenn du einen React Hook Form
> `useForm<MyFormSchema>()` definierst, sind alle Pfad-Strings
> typisiert — Tippfehler sind Compile-Fehler, nicht Laufzeitprobleme.

> 💭 **Denkfrage:** PathOf erzeugt bei tief verschachtelten Objekten
> sehr grosse Union Types. Ab welcher Tiefe wird das zum Problem
> fuer den Compiler?
>
> **Antwort:** Ab ca. 4-5 Ebenen mit vielen Properties wird die
> Union gross genug um den Compiler spuerbar zu verlangsamen. In
> der Praxis begrenzt man die Tiefe mit einem Counter-Parameter:
> `PathOf<T, Prefix, Depth>` der bei 0 aufhoert. Bibliotheken wie
> `type-fest` und `ts-toolbelt` nutzen diese Technik.

---

## Accumulator-Pattern fuer Tail-Call-Optimierung

```typescript annotated
// SCHLECHT: Nicht tail-recursive (Ergebnis wird noch verarbeitet)
type ReverseNaive<T extends unknown[]> =
  T extends [infer First, ...infer Rest]
    ? [...ReverseNaive<Rest>, First]  // Rekursion + Spread = kein Tail-Call
    : [];

// GUT: Tail-recursive mit Accumulator
type Reverse<T extends unknown[], Acc extends unknown[] = []> =
  T extends [infer First, ...infer Rest]
    ? Reverse<Rest, [First, ...Acc]>  // Rekursion IST das Ergebnis = Tail-Call
    // ^ Der Compiler erkennt: Das Ergebnis ist direkt der rekursive Aufruf
    : Acc;

type R = Reverse<[1, 2, 3, 4, 5]>;  // [5, 4, 3, 2, 1]
```

---

## Experiment: Baue DeepPick

Kombiniere PathOf und GetByPath zu einem Typ der tief verschachtelte
Properties auswählt:

```typescript
// Ziel: DeepPick<AppConfig, "server.host" | "db.pool.max">
// Ergebnis: { server: { host: string }; db: { pool: { max: number } } }

// Tipp: Zerlege den Pfad am ersten Punkt und baue das Objekt rekursiv auf.
// type DeepPick<T, Paths extends string> = ???

// Bonus: Was passiert wenn zwei Pfade denselben Eltern-Key haben?
// z.B. "server.host" und "server.port" — beide muessen unter "server" vereint werden.

// Starte mit dem einfachen Fall: Nur ein Pfad, eine Ebene tief.
type SimplePick<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? { [K in Key]: SimplePick<T[K], Rest> }
      : never
    : Path extends keyof T
      ? { [K in Path]: T[Path] }
      : never;

type SP = SimplePick<AppConfig, "server.host">;
// ^ { server: { host: string } }
```

---

## Rekursion diagnostizieren und debuggen

Da du keinen Debugger fuer Type-Level-Code hast, brauchst du
andere Strategien um Probleme zu finden:

```typescript
// Technik 1: Zwischentypen anlegen und hovern
type Step1 = BuildTuple<5>;
//   ^ Hover: [unknown, unknown, unknown, unknown, unknown]  ✓

type Step2 = [...BuildTuple<3>, ...BuildTuple<4>];
//   ^ Hover: [unknown, unknown, unknown, unknown, unknown, unknown, unknown]  ✓

type FinalResult = Add<3, 4>;
//   ^ Hover: 7  ✓

// Technik 2: Mit einfachen Typen testen bevor komplexe Eingaben
type Test1 = PathOf<{ a: string }>;
//   ^ Hover: "a"  ✓ (einfacher Fall zuerst)

type Test2 = PathOf<{ a: { b: string } }>;
//   ^ Hover: "a" | "a.b"  ✓ (eine Ebene tiefer)

// Wenn Test1 falsch ist, liegt der Bug in der Basis-Logik.
// Wenn Test2 falsch ist, liegt der Bug in der Rekursion.

// Technik 3: never als "Haltepunkt" nutzen
type DebugPathOf<T> =
  T extends object
    ? keyof T extends string  // Was sind die Keys?
      ? keyof T               // Pause hier: sieh was rauskommt
      : never
    : never;
```

---

## Was du gelernt hast

- **DeepReadonly, DeepFlatten** — rekursive Typen die alle Ebenen verarbeiten
- **PathOf** erzeugt eine Union aller Pfade zu verschachtelten Properties
- **GetByPath** ermittelt den Typ an einem bestimmten Pfad — Grundlage fuer `get(obj, "a.b.c")`
- **Accumulator-Pattern** fuer Tail-Call-Optimierung auf Type-Level (Rekursionstiefe ~1000)
- Tiefe Rekursion hat Grenzen — in der Praxis begrenzt man die Tiefe explizit
- **Debugging-Strategie**: Zwischentypen anlegen, einfache Eingaben zuerst testen, `never` als Haltepunkt

> 🧠 **Erklaere dir selbst:** Warum ist der Accumulator-Pattern
> nicht nur fuer Performance wichtig, sondern auch fuer die
> Korrektheit? Was passiert wenn du ohne Accumulator an das
> Rekursionslimit stoesst?
> **Kernpunkte:** Ohne TCO bricht der Compiler bei ~50 ab |
> Mit Accumulator sind ~1000 moeglich | Bei Abbruch: "Type
> instantiation is excessively deep" — der Typ wird zu `any`
> degradiert | Das ist gefaehrlich weil keine Fehlermeldung
> kommt — der Code kompiliert, aber mit falschen Typen

**Kernkonzept zum Merken:** Rekursive Typen sind das Aequivalent zu Schleifen. Der Accumulator-Pattern ist das Aequivalent zu tail-call-optimierten Funktionen. Beides zusammen ermoeglicht tiefe Typ-Berechnungen. Und Zwischentypen sind dein einziges Debugging-Werkzeug — nutze sie grosszuegig.

---

> **Pausenpunkt** — Rekursive Type Challenges sind bewältigt. In der
> letzten Sektion bauen wir echte Praxis-Projekte.
>
> Weiter geht es mit: [Sektion 06: Praxis — Type-safe Router und Query Builder](./06-praxis-router-query-builder.md)
