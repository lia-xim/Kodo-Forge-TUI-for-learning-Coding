# Sektion 7: NoInfer und Inferenz-Kontrolle

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [06 - Generische APIs designen](./06-generische-apis-designen.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Warum TypeScript manchmal **zu viel inferiert** — und welchen Schaden das anrichten kann
- Wie `NoInfer<T>` (TS 5.4) eine Inferenz-Quelle gezielt **deaktiviert**
- Wie `infer T extends X` (TS 4.7) einen **Constraint direkt in der Infer-Klausel** ausdrückt
- Wann du diese Werkzeuge in **Angular Signal-APIs und generischen Formularen** brauchst

---

## Das Problem: TypeScript inferiert zu viel
<!-- section:summary -->
In der letzten Sektion haben wir gelernt, wie man Inference *lenkt*.

<!-- depth:standard -->
In der letzten Sektion haben wir gelernt, wie man Inference *lenkt*.
Jetzt gehen wir einen Schritt weiter: Manchmal muss man Inference an
einer bestimmten Stelle *unterbinden*.

Stell dir vor, du designst eine Hilfsfunktion für eine Konfiguration:

```typescript
function makeDefault<T = string>(options: {
  parse: (raw: string) => T;
  defaultValue?: T;
}): T {
  // Implementierung...
  return options.parse("");
}
```

Die Absicht ist klar: `T` soll aus der `parse`-Funktion inferiert werden.
`defaultValue` ist ein optionaler Fallback — er *muss* zu `T` passen,
aber er soll `T` *nicht definieren*.

Was passiert in der Praxis?

```typescript
// Erwartetes Verhalten:
const num = makeDefault({ parse: (s) => parseInt(s, 10) });
// T = number, korrekt inferiert aus parse()

// Unerwartetes Verhalten:
const broken = makeDefault({
  parse: (s) => parseInt(s, 10),
  defaultValue: "fallback",   // Ups — ein string!
});
// T = string | number — TypeScript nimmt BEIDE Inference-Quellen!
// Kein Fehler, aber T ist jetzt zu weit!
```

TypeScript sieht zwei Stellen, die `T` definieren könnten:
`parse`'s Rückgabetyp und `defaultValue`. Es **vereint beide** zu
`string | number`. Das ist technisch korrekt, aber semantisch falsch
— `defaultValue` sollte `T` *bestätigen*, nicht *formen*.

---

> 📖 **Hintergrund: Wie das TypeScript-Team auf das Problem stiess**
>
> Das Problem ist nicht neu — es tauchte in vielen Bibliotheken auf.
> Ein klassisches Beispiel: `lodash.defaultTo(value, defaultValue)`.
> Wenn TypeScript sowohl `value` als auch `defaultValue` als
> Inference-Quelle für `T` nutzt, weitet es den Typ unnötig auf.
>
> 2023 öffnete das TypeScript-Team intern ein Issue mit dem Titel
> **"Controlling inference sites"**. Die Lösung sollte simpel sein:
> Ein Wrapper-Typ, der einer Stelle sagt: "Du darfst T beeinflussen,
> aber nicht *definieren*." Das Ergebnis war `NoInfer<T>`, das mit
> **TypeScript 5.4** (März 2024) veröffentlicht wurde.
>
> Das Besondere: `NoInfer<T>` ist kein komplexes Mapped Type —
> es ist ein **intrinsischer Typ**, der direkt vom Compiler verstanden
> wird. Ähnlich wie `Awaited<T>` oder `ReturnType<T>` ist er in
> `lib.es5.d.ts` als `type NoInfer<T> = intrinsic` deklariert.
> Man kann ihn nicht selbst nachbauen — er ist eingebaut.

---

<!-- /depth -->
## `NoInfer<T>` — Die TS 5.4-Lösung
<!-- section:summary -->
Die Regel ist einfach: **`NoInfer<T>` sagt dem Compiler, dass diese

<!-- depth:standard -->
```typescript annotated
function makeDefault<T = string>(options: {
  parse: (raw: string) => T;
  defaultValue?: NoInfer<T>;   // T darf hier NICHT inferiert werden
}): T {
  return options.parse("");
}

// Jetzt:
const num = makeDefault({
  parse: (s) => parseInt(s, 10),
  defaultValue: 42,              // OK: 42 ist number, passt zu T = number
});
// T = number — nur aus parse() inferiert. ✓

const broken = makeDefault({
  parse: (s) => parseInt(s, 10),
  defaultValue: "fallback",      // FEHLER! string != number
  //             ~~~~~~~~~
  // Argument of type 'string' is not assignable to parameter
  // of type 'NoInfer<number>'
});
// T = number, defaultValue muss number sein. ✓ TypeScript schützt uns!
```

Die Regel ist einfach: **`NoInfer<T>` sagt dem Compiler, dass diese
Stelle `T` *verwenden*, aber nicht *definieren* darf.**

> 🧠 **Erklaere dir selbst:** Warum kann man `NoInfer<T>` nicht durch
> einen Conditional Type nachbauen, z.B. `T extends T ? T : never`?
>
> **Kernpunkte:** Conditional Types werden *nach* der Inference
> ausgewertet | Der Compiler hat T schon inferiert, bevor er den
> Conditional auswertet | `NoInfer` greift *während* der Inference,
> nicht danach | Es ist ein Signal an den Inference-Algorithmus selbst,
> keine nachträgliche Typ-Transformation

---

<!-- /depth -->
## Praktische Patterns mit `NoInfer<T>`
<!-- section:summary -->
Das Muster taucht immer dann auf, wenn es eine **primäre Inference-Quelle**

<!-- depth:standard -->
Das Muster taucht immer dann auf, wenn es eine **primäre Inference-Quelle**
und **sekundäre Stellen** gibt, die `T` nur *annehmen*, nicht *bestimmen*:

```typescript annotated
// Pattern 1: Event-Handler mit typisierter Payload
function createEventEmitter<TEvent>(
  events: {
    [K in keyof TEvent]: (payload: TEvent[K]) => void
  },
  fallback?: NoInfer<Partial<TEvent>>  // Fallbacks definieren T nicht
) { /* ... */ }

// Pattern 2: Store mit Reducer
function createStore<TState>(
  reducer: (state: TState, action: unknown) => TState,
  preloadedState?: NoInfer<Partial<TState>>  // Preloaded State folgt T, formt es nicht
) { /* ... */ }
// ^^^ Ohne NoInfer: preloadedState: { count: 0 } würde TState als
//     { count: number } inferieren — auch wenn reducer ein
//     anderes Interface erwartet.

// Pattern 3: Formular-Felder
function createFormField<TValue>(
  validator: (v: TValue) => boolean,
  initialValue?: NoInfer<TValue>  // Initial-Wert definiert den Typ nicht
) { /* ... */ }
```

> 💭 **Denkfrage:** Stell dir vor, du schreibst eine Funktion
> `withDefault<T>(value: T | null, fallback: T): T`. Sollte `fallback`
> ein `NoInfer<T>` sein — oder nicht?
>
> Denke kurz nach: Was ist die *primäre* Inference-Quelle hier?
>
> **Antwort:** In diesem Fall ist `value` die primäre Quelle. `fallback`
> soll `T` *bestätigen*. Wenn jemand schreibt
> `withDefault(null, "default")`, möchten wir, dass TypeScript `T`
> aus dem Kontext (dem Typ der Variable, die das Ergebnis aufnimmt)
> inferiert — nicht aus `"default"`.
> Also: `withDefault<T>(value: T | null, fallback: NoInfer<T>): T`.
> Damit erzwingt der Aufrufer, den Typ explizit anzugeben oder aus
> dem Kontext ableiten zu lassen.

---

<!-- /depth -->
## `infer T extends X` — Constraint in Infer-Klauseln
<!-- section:summary -->
Neben `NoInfer<T>` gibt es ein zweites, älteres Werkzeug zur

<!-- depth:standard -->
Neben `NoInfer<T>` gibt es ein zweites, älteres Werkzeug zur
Inferenz-Kontrolle: **Constraints direkt in `infer`-Klauseln**.

Vor TypeScript 4.7 war das umständlich:

```typescript annotated
// VOR TS 4.7: Zweistufige Pruefung noetig
type GetFirstString<T> =
  T extends readonly [infer U, ...unknown[]]
    ? U extends string   // <-- extra conditional nur fuer den Constraint
      ? U
      : never
    : never;

// SEIT TS 4.7: Constraint direkt in der infer-Klausel
type GetFirstString<T> =
  T extends readonly [infer U extends string, ...unknown[]]
  //                            ^^^^^^^^^^^^^^
  //                            Constraint direkt hier!
    ? U   // U ist garantiert string — kein extra conditional noetig
    : never;

// Vergleich:
type A = GetFirstString<[string, number]>;  // string ✓
type B = GetFirstString<[number, string]>;  // never  ✓ (erstes Element kein string)
type C = GetFirstString<["hello", number]>; // "hello" ✓ (literal inferiert!)
```

Der Unterschied ist subtil, aber wichtig: Im alten Stil gibt der
*äussere* Conditional `U extends string` zurück. Im neuen Stil ist
`U` *bereits* als `string` eingeschränkt — TypeScript inferiert `U`
**als den Teil von T, der string ist**, nicht als den vollen Typ.

---

> 🔬 **Experiment: infer mit Constraints verstehen**
>
> Schreibe diesen Code gedanklich durch (oder im TypeScript Playground):
>
> ```typescript
> // Was ist der Unterschied zwischen A und B?
> type ExtractNumA<T> =
>   T extends { value: infer U }
>     ? U extends number ? U : never
>     : never;
>
> type ExtractNumB<T> =
>   T extends { value: infer U extends number }
>     ? U
>     : never;
>
> type R1 = ExtractNumA<{ value: 42 }>;  // ?
> type R2 = ExtractNumB<{ value: 42 }>;  // ?
> type R3 = ExtractNumA<{ value: "hallo" }>;  // ?
> type R4 = ExtractNumB<{ value: "hallo" }>;  // ?
> ```
>
> **Auflösung:**
> - `R1`: `42` (literal type, weil U extends number gibt U zurück)
> - `R2`: `42` (identisch — aber der Constraint ist direkt in infer)
> - `R3`: `never` (string extends number = false)
> - `R4`: `never` (string ist kein number-Subtyp)
>
> In einfachen Fällen sind sie äquivalent. Der Unterschied zeigt sich
> bei distributiven Conditional Types und wenn `U` in mehreren
> Stellen im True-Branch auftaucht — dann ist die direkte Constraint
> präziser und vermeidet doppelte Evaluierung.

---

<!-- /depth -->
## `infer extends` für Template Literal und Enum-Extraktion
<!-- section:summary -->
Ein besonders nützliches Pattern: numerische Strings sicher extrahieren.

<!-- depth:standard -->
Ein besonders nützliches Pattern: numerische Strings sicher extrahieren.

```typescript annotated
// Problem: Template Literal Typen inferieren als string
type ParsePort<T extends string> =
  T extends `${infer Port}`
    ? Port   // Port ist string, nicht number!
    : never;

// Loesung: infer mit extends
type ParsePort<T extends string> =
  T extends `${infer Port extends number}`
  //                    ^^^^^^^^^^^^^^^^
  //                    Nur Strings die als Zahlen parsebar sind!
    ? Port   // Port ist jetzt number (der numerische Literal-Typ)
    : never;

type Port80   = ParsePort<"80">;    // 80 (number literal) ✓
type Port443  = ParsePort<"443">;   // 443 (number literal) ✓
type PortNaN  = ParsePort<"abc">;   // never ✓ (kein gueltiger number-String)

// Praktischer Einsatz: Route-Parameter parsen
type RouteParams<T extends string> =
  T extends `${string}/:${infer Param extends string}/${infer Rest}`
    ? Param | RouteParams<`/${Rest}`>
    : T extends `${string}/:${infer Param extends string}`
      ? Param
      : never;

type Params = RouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId" ✓
```

---

<!-- /depth -->
## Der Framework-Bezug

> 🅰️ **In Angular-Projekten** begegnet dir das Problem der unerwünschten
> Inferenz bei der neuen Signal-API (Angular 17+). Das `input<T>()`-API
> für Signal-Inputs hat genau dieses Problem gelöst:
>
> ```typescript annotated
> // Angular input() vereinfacht dargestellt:
> function input<T>(initialValue: T): InputSignal<T>;
> function input<T>(): InputSignal<T | undefined>;
>
> // Das Problem: required: true soll T ohne undefined inferieren
> // (vereinfachte Darstellung des internen Designs)
> function inputRequired<T>(options?: {
>   transform?: (v: unknown) => T;
>   alias?: NoInfer<string>;   // alias definiert T nicht, nur string
> }): InputSignal<T> { /* ... */ }
> // ^^^ alias ist immer string — aber er darf T nicht inferieren.
> //     Das Signal-Team hat NoInfer genau dafuer genutzt.
>
> // inject() ist aehnlich:
> // inject<T>(token: ProviderToken<T>): T
> // T wird AUSSCHLIESSLICH aus dem Token inferiert.
> // Kein zweiter Parameter kann T versehentlich formen.
> const service = inject(UserService); // T = UserService, automatisch
> ```
>
> Das Muster ist dasselbe: Es gibt eine **primäre Quelle** (`transform`
> bzw. der Token-Typ), und alles andere darf `T` nur *annehmen*.
> `NoInfer` macht diese Absicht explizit und unverletzbar.

---

## Was du gelernt hast

- TypeScript inferiert `T` aus **allen** Stellen, wo `T` vorkommt —
  das kann zu ungewollt weiten Typen führen
- `NoInfer<T>` (TS 5.4) ist ein **intrinsischer Typ**, der eine
  Verwendungsstelle aus der Inference ausschliesst. `T` wird dort
  geprüft, aber nicht bestimmt
- `infer U extends X` (TS 4.7) fügt einen **Constraint direkt in die
  Infer-Klausel** ein — sauberer als zweistufige Conditionals und
  präziser bei der Literal-Type-Inference
- Beide Werkzeuge lösen dasselbe grundlegende Problem: **Kontrolle
  darüber, wer `T` definieren darf**

> **Kernkonzept:** Inference ist eine Einbahnstrasse, die man bewusst
> steuern muss. `NoInfer<T>` sagt: "Dieser Parameter *empfängt* T."
> `infer U extends X` sagt: "Dieser inferred Typ *muss* X sein."
> Zusammen geben sie dir die vollständige Kontrolle darüber, wie
> TypeScript deine generischen APIs interpretiert.

---

> **Pausenpunkt** — Du hast jetzt alle zentralen Werkzeuge von
> Advanced Generics kennengelernt: von Higher-Order Types über
> Varianz und Constraints bis hin zur feingranularen Inferenz-Kontrolle.
>
> Weiter geht es mit: [Lektion 23 - Recursive Types](../../23-recursive-types/README.md)
