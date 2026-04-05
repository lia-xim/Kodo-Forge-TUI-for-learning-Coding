# Sektion 4: Rekursive Conditional Types — Typen die sich selbst aufrufen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Distributive Conditional Types](./03-distributive-types.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Was rekursive Typen sind und warum TypeScript sie braucht
- Wie man `Flatten`, `DeepAwaited` und `DeepPartial` baut
- Den JSON-Typ als Beispiel fuer Selbstreferenz ohne Conditional Types
- Die Rekursionsgrenzen von TypeScript — und was du tust, wenn du sie triffst
- Performance-Ueberlegungen bei tiefer Rekursion

---

## Die Grundidee: Ein Typ der sich selbst aufruft

Du kennst rekursive Funktionen: Eine Funktion die sich selbst aufruft, bis eine Terminierungsbedingung greift. Rekursive Typen funktionieren genauso — nur auf der Typ-Ebene.

```typescript
// Rekursive Funktion (Laufzeit):
function summe(n: number): number {
  if (n <= 0) return 0;        // Terminierung
  return n + summe(n - 1);     // Selbstaufruf
}

// Rekursiver Typ (Compile-Zeit):
type Flatten<T> = T extends (infer U)[]
  ? Flatten<U>    // Selbstaufruf: weiter ins Array hinein
  : T;            // Terminierung: kein Array mehr gefunden
```

Der Mechanismus ist identisch: Eine Bedingung (ist T ein Array?), ein rekursiver Ast, und ein terminierender Ast.

---

## Hintergrund: Rekursive Typen in TypeScript 4.1

Rekursive bedingte Typen gab es schon vorher, aber in TypeScript **4.1** (November 2020) wurden sie massiv verbessert. Das Team fuegte "tail recursion optimization for conditional types" ein — ein Begriff aus der Funktionalen Programmierung.

Vor 4.1 konnte TypeScript tiefe Rekursion nicht effizient auswerten und brach fruehzeitig mit dem Fehler `"Type instantiation is excessively deep and possibly infinite"` ab. Nach 4.1 kann TypeScript viele gaengige Muster effizienter verarbeiten.

Gleichzeitig wurden in 4.1 **Template Literal Types** eingefuehrt — und die sind stark auf Rekursion angewiesen. Ohne die Verbesserungen in 4.1 waere `TrimLeft<" hallo ">` nicht moeglich gewesen.

Der RFC fuer diese Aenderung kommt von Ryan Cavanaugh (dem TypeScript-Teamleiter), der erkannte, dass die alte Implementierung einen Stack aufbaute der linear mit der Rekursionstiefe wuchs — ein klarer Performance-Bottleneck.

---

## Flatten: Verschachtelte Arrays aufloesen

Das Paradebeispiel fuer rekursive Typen ist `Flatten` — ein Typ der beliebig tiefe Arrays auf ihren Element-Typ reduziert:

```typescript annotated
type Flatten<T> =
  T extends (infer U)[]   // Ist T ein Array? Wenn ja, merke den Element-Typ als U
  ? Flatten<U>            // Rufe Flatten rekursiv mit dem Element-Typ auf
  : T;                    // Kein Array mehr: terminiere und gib T zurueck

// Trace fuer Flatten<string[][]>:
// Flatten<string[][]>
//   -> Flatten<string[]>   (U = string[])
//   -> Flatten<string>     (U = string)
//   -> string              (kein Array, Terminierung)

type A = Flatten<string[]>;          // string
type B = Flatten<string[][]>;        // string
type C = Flatten<string[][][]>;      // string
type D = Flatten<number[][]>;        // number
type E = Flatten<string>;            // string (kein Array: Pass-through)
type F = Flatten<(string | number)[]>; // string | number
```

Beachte: `Flatten` loest **beliebig tiefe** Arrays auf. Es gibt keine Grenze bei zwei oder drei Ebenen — es geht so tief wie TypeScript die Rekursion verfolgen kann.

---

## Annotierter Code: DeepPartial

`Partial<T>` macht alle Properties optional — aber nur eine Ebene tief. `DeepPartial<T>` macht das rekursiv fuer alle verschachtelten Objekte:

```typescript annotated
type DeepPartial<T> =
  T extends object              // Ist T ein Objekt?
    ? T extends Function        //   Ist es eine Funktion?
      ? T                       //     Funktionen unveraendert lassen
      : {                       //     Sonst: Mapped Type mit Rekursion
          [K in keyof T]?:      //     Jede Property optional machen
            DeepPartial<T[K]>;  //     Rekursiv den Property-Typ tiefer
        }
    : T;                        // Kein Objekt (Primitiv): unveraendert

// Beispiel: Eine Config-Struktur mit Verschachtelung:
interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
    poolSize: number;
  };
  debug: boolean;
}

type PartialConfig = DeepPartial<AppConfig>;
// {
//   server?: {
//     host?: string;
//     port?: number;
//     ssl?: {
//       enabled?: boolean;  <- drei Ebenen tief optional!
//       cert?: string;
//     };
//   };
//   database?: { url?: string; poolSize?: number };
//   debug?: boolean;
// }

// Nuetzlich fuer Konfigurationsmerge:
function mergeConfig(base: AppConfig, override: PartialConfig): AppConfig {
  return { ...base, ...override } as AppConfig; // vereinfacht
}
```

---

## Der JSON-Typ: Rekursion ohne Conditional Types

Nicht alle rekursiven Typen brauchen Conditional Types. Manchmal reicht eine direkte Selbstreferenz in einem Union:

```typescript annotated
// JSON kann folgende Werte enthalten:
type JsonValue =
  | string                        // "hallo"
  | number                        // 42
  | boolean                       // true
  | null                          // null
  | JsonValue[]                   // [1, "zwei", [3, 4]]  — Array von JsonValue!
  | { [key: string]: JsonValue }; // { a: 1, b: { c: 2 } } — Objekt von JsonValue!
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//   Diese beiden Zeilen sind die Rekursion: JsonValue enthaelt JsonValue

// TypeScript loest das korrekt auf:
const daten: JsonValue = {
  name: "Max",
  alter: 30,
  tags: ["admin", "user"],
  adresse: {               // Verschachteltes Objekt: auch JsonValue
    stadt: "Berlin",
  },
};
```

Das Interessante: TypeScript hat kein Problem mit dieser Art Rekursion, weil sie **produktiv** ist — jede Ebene ist ein tatsaechlicher Wert, keine unendliche Schleife.

---

## Rekursive String-Manipulation

Template Literal Types koennen mit Rekursion String-Operationen auf Typ-Ebene ausfuehren:

```typescript annotated
// TrimLeft: fuehrende Leerzeichen entfernen (Typ-Ebene):
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}`  // Beginnt S mit einem Leerzeichen?
  ? TrimLeft<Rest>            // Ja: entferne es und pruefe den Rest
  : S;                        // Nein: fertig

// Trace fuer TrimLeft<"   hallo">:
// "   hallo" -> ` ${"  hallo"}` passt -> TrimLeft<"  hallo">
// "  hallo"  -> ` ${" hallo"}`  passt -> TrimLeft<" hallo">
// " hallo"   -> ` ${"hallo"}`   passt -> TrimLeft<"hallo">
// "hallo"    -> passt nicht     -> "hallo"  (Terminierung)

type A = TrimLeft<"   hallo">;  // "hallo"
type B = TrimLeft<"hallo">;     // "hallo"
type C = TrimLeft<"  x  ">;     // "x  "  (nur links!)

// TrimRight: gleiche Logik, anderer Pattern:
type TrimRight<S extends string> =
  S extends `${infer Rest} ` ? TrimRight<Rest> : S;

// Trim: beides kombiniert:
type Trim<S extends string> = TrimLeft<TrimRight<S>>;
type D = Trim<"  hallo  ">;  // "hallo"
```

Das ist keine Spielerei: TypeScript's eingebaute Utility Types `Uppercase<S>`, `Lowercase<S>` etc. nutzen denselben Mechanismus.

---

## Experiment: DeepReadonly bauen

> **Experiment:** Baue einen `DeepReadonly<T>` Typ im TypeScript Playground:
>
> ```typescript
> // Deine Aufgabe: DeepReadonly bauen
> // Hint: Aehnlich wie DeepPartial, aber nutze Readonly statt optionale Properties
>
> type DeepReadonly<T> =
>   T extends object
>     ? T extends Function
>       ? T
>       : { readonly [K in keyof T]: DeepReadonly<T[K]> }
>       //  ^^^^^^^^ Das ist der Unterschied zu DeepPartial
>     : T;
>
> interface Config {
>   server: {
>     host: string;
>     port: number;
>   };
>   debug: boolean;
> }
>
> type FrozenConfig = DeepReadonly<Config>;
>
> const config: FrozenConfig = {
>   server: { host: "localhost", port: 3000 },
>   debug: false,
> };
>
> // Probiere diese Zeilen aus — welche geben Fehler?
> config.debug = true;              // ?
> config.server.host = "example";  // ?
> ```
>
> Erklaere, warum `Readonly<Config>` nicht genuegt und warum `DeepReadonly<Config>` die Loesung ist.

---

## Erklaere dir selbst

> **Erklaere dir selbst:** Warum muss `DeepPartial` den Fall `T extends Function` separat behandeln? Was wuerde passieren, wenn du diese Pruefung weglaesstst?
> **Kernpunkte:** Funktionen sind Objekte in JavaScript (typeof function === "object") | Ohne die Pruefung: `{ [K in keyof T]?: DeepPartial<T[K]> }` wuerde auf Funktionseigenschaften angewendet | Das haette manche Funktionen zerrissen (ihre Properties wuerden optional gemacht) | Mit der Pruefung: Funktionen werden unveraendert durchgereicht

---

## Rekursionsgrenzen: Was du tust wenn es nicht mehr geht

TypeScript hat ein eingebautes Rekursionslimit. In der Praxis liegt es bei etwa 50-100 Ebenen, je nach Komplexitaet des Typs. Wenn du es triffst, erscheint dieser Fehler:

```
Type instantiation is excessively deep and possibly infinite.
```

```typescript annotated
// Das Limit triffst du bei sehr tiefer Rekursion:
type Repeat<S extends string, N extends number, Acc extends string = ""> =
  Acc["length"] extends N
  ? Acc               // Terminierung: Acc hat N Zeichen
  : Repeat<S, N, `${Acc}${S}`>; // Rekursion: Zeichen hinzufuegen

type Short = Repeat<"a", 5>;   // "aaaaa"   — funktioniert
type Long = Repeat<"a", 50>;   // moeglicherweise Limit-Fehler
type TooLong = Repeat<"a", 100>; // Fast sicher Limit-Fehler

// TypeScript 4.5+ hat Tail Recursion Optimization fuer einige Muster,
// was das effektive Limit fuer einfache Rekursionen erhoeht.
```

**Praktische Faustregel:** In echter Code-Basis reichen 3-5 Rekursionsebenen fuer fast alle Anwendungsfaelle. Wenn du mehr brauchst, ist das Design wahrscheinlich ueberkompliziert.

**Was tun bei Limit-Fehlern?**
1. Den Typ vereinfachen — brauche ich wirklich beliebige Tiefe?
2. Eine maximale Tiefe einbauen (mit einem Zaehler-Parameter)
3. Das Problem zur Laufzeit loesen (Typen sind ein Werkzeug, kein Selbstzweck)

---

## Denkfrage

> **Denkfrage:** `DeepPartial` macht alle Properties optional — alle Ebenen tief. Ist das immer wuenschenswert? Kannst du dir Faelle vorstellen, wo es gefaehrlich sein koennte?
>
> **Antwort:** Ja, es kann gefaehrlich sein. Wenn eine tief verschachtelte Property "required" ist — zum Beispiel eine Datenbank-URL in einer Config — wird sie durch `DeepPartial` optional. Der TypeScript-Compiler warnt dann nicht mehr, wenn sie fehlt. Das kann zu Laufzeit-Fehlern fuehren, die schwer zu debuggen sind. In der Praxis nutzt man `DeepPartial` eher fuer "Patch"-Objekte (Aenderungen zusammenfuehren), nicht fuer vollstaendige Konfigurationen. Eine Alternative: `Partial<T>` nur auf der obersten Ebene, und bestimmte Unterobjekte als ganzes optional machen.

---

## In deinem Angular-Projekt: Forms mit DeepPartial

```typescript annotated
// Angular Reactive Forms haben oft komplexe, verschachtelte Strukturen.
// DeepPartial ist ideal fuer Formularinitialwerte:

interface UserForm {
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  };
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      zip: string;
    };
  };
  preferences: {
    newsletter: boolean;
    language: "de" | "en";
  };
}

// Initialwerte: nicht alle Felder muessen ausgefuellt sein
type FormInitValue = DeepPartial<UserForm>;

@Component({ /* ... */ })
export class UserFormComponent {
  // Nutze DeepPartial fuer optionale Initialwerte:
  constructor(@Optional() @Inject(FORM_INIT) private init: FormInitValue) {}

  buildForm() {
    return this.fb.group({
      personal: this.fb.group({
        firstName: [this.init?.personal?.firstName ?? ""],
        // ^ Optional chaining + Nullish Coalescing — perfekt mit DeepPartial!
      }),
    });
  }
}
```

---

## Was du gelernt hast

- Rekursive Typen **rufen sich selbst auf** — mit einer Terminierungsbedingung im Conditional Type
- `Flatten<T>` loest beliebig tiefe Arrays auf, `DeepAwaited<T>` loest verschachtelte Promises auf
- `DeepPartial<T>` kombiniert Mapped Types mit Rekursion — und muss `Function` separat behandeln
- Der JSON-Typ zeigt, dass Selbstreferenz auch ohne Conditional Types moeglich ist
- TypeScript hat ein **Rekursionslimit** (~50-100 Ebenen) — in der Praxis reichen 3-5 Ebenen
- Template Literal Types (`TrimLeft`, `Trim`) nutzen dieselbe Rekursions-Mechanik

**Kernkonzept:** Rekursive Conditional Types sind das Werkzeug wenn eine Operation beliebig tief in eine Struktur eindringen soll — wie `DeepPartial`, `DeepReadonly` oder `Flatten`. Der Schluessel: immer eine klare Terminierungsbedingung, und das Rekursionslimit im Blick behalten.

---

> **Pausenpunkt** — Rekursive Typen sind das fortgeschrittenste Konzept in Conditional Types. Wenn der `DeepPartial`-Code noch etwas unklar ist, mache eine Pause und gehe ihn nochmal durch — Zeile fuer Zeile. Das Investment lohnt sich, weil dieses Muster in echten Projekten immer wieder auftaucht.
>
> Weiter geht es mit: [Sektion 05: Praxis-Patterns](./05-praxis-patterns.md)
