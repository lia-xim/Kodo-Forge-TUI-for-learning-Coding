# Sektion 4: Rekursive Conditional Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Deep-Operationen](./03-deep-operationen.md)
> Naechste Sektion: [05 - Grenzen und Performance](./05-grenzen-und-performance.md)

---

## Was du hier lernst

- Wie du einen **Flatten-Typ** baust, der verschachtelte Arrays aufloest
- Wie **Paths\<T\>** typsichere Punkt-getrennte Pfade berechnet (`'a.b.c'`)
- Wie **PathValue\<T, P\>** den Wert-Typ an einem Pfad ermittelt
- Wie **rekursive String-Manipulation** mit Template Literal Types funktioniert

---

## Die Koenigsklasse: Rekursion + Conditional Types

In Sektion 3 hast du Mapped Types mit Rekursion kombiniert. Jetzt
gehen wir einen Schritt weiter: **Conditional Types** die sich
selbst aufrufen. Das ist die maechtigste Kombination in TypeScript's
Typsystem.

> **Hintergrund: TypeScript 4.1 (November 2020)**
>
> Vor TypeScript 4.1 waren rekursive Conditional Types **verboten** —
> der Compiler lehnte sie mit "Type alias circularly references itself"
> ab. Mit Version 4.1 fuehrte das Team zwei bahnbrechende Features ein:
>
> 1. **Template Literal Types** (`\`hello ${string}\``)
> 2. **Rekursive Conditional Types** (ein Conditional Type darf sich
>    selbst in seiner Aufloesung referenzieren)
>
> Zusammen eroeffneten sie eine voellig neue Welt der Typ-Level-
> Programmierung. Ploetzlich konnte man Strings manipulieren, Arrays
> flachklopfen und Objekt-Pfade berechnen — alles auf Type-Level.

---

## Flatten: Verschachtelte Arrays aufloesen

Das einfachste Beispiel fuer rekursive Conditional Types ist **Flatten** —
ein Typ der verschachtelte Arrays "flachklopft":

```typescript annotated
type Flatten<T> = T extends (infer U)[]
  // ^ Ist T ein Array? Wenn ja, extrahiere den Element-Typ U
  ? Flatten<U>
  // ^ JA: Rekursion! Pruefe ob U selbst ein Array ist
  : T;
  // ^ NEIN: Abbruchbedingung — T ist kein Array mehr

// Testen:
type A = Flatten<string[]>;           // string
// ^ string[] → Flatten<string> → string (kein Array mehr)

type B = Flatten<number[][]>;         // number
// ^ number[][] → Flatten<number[]> → Flatten<number> → number

type C = Flatten<boolean[][][]>;      // boolean
// ^ Drei Ebenen: boolean[][][] → boolean[][] → boolean[] → boolean

type D = Flatten<string>;             // string
// ^ Kein Array → sofort Abbruchbedingung
```

Die Rekursion entfernt **eine Array-Ebene pro Schritt**, bis
ein Nicht-Array-Typ uebrig bleibt.

---

## Flatten mit Tiefen-Limit

In der Praxis willst du oft nur **eine bestimmte Tiefe** flattenen
(wie `Array.prototype.flat(depth)`):

```typescript annotated
type FlatArray<Arr, Depth extends number> =
  Depth extends 0
    ? Arr
    // ^ Tiefe 0: Nichts mehr flattenen (Abbruchbedingung)
    : Arr extends readonly (infer InnerArr)[]
      ? FlatArray<InnerArr, MinusOne<Depth>>
      // ^ Array? → Rekursion mit Tiefe - 1
      : Arr;
      // ^ Kein Array? → Direkt zurueckgeben

// Hilfsfunktion: Tiefe um 1 reduzieren (Tuple-Trick)
type MinusOne<N extends number> =
  [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];
  // ^ Index-Zugriff: MinusOne<3> = [never,0,1,2,...][3] = 2
  // ^ Das ist ein bekannter Trick fuer Arithmetik auf Type-Level

// Testen:
type E = FlatArray<number[][][], 1>;  // number[][]
// ^ Nur eine Ebene entfernt

type F = FlatArray<number[][][], 2>;  // number[]
// ^ Zwei Ebenen entfernt

type G = FlatArray<number[][][], 3>;  // number
// ^ Drei Ebenen — komplett flach
```

> **Denkfrage:**
>
> Warum ist `FlatArray` aus `lib.es2019.d.ts` nicht einfach
> `T extends (infer U)[] ? FlatArray<U> : T`?
>
> Hinweis: `[1, [2], [[3]]].flat(1)` ergibt `[1, 2, [3]]` —
> nicht `[1, 2, 3]`. Die eingebaute `flat()`-Methode hat eine
> **kontrollierte Tiefe**, nicht unbegrenzte Rekursion.

---

## Paths\<T\>: Typsichere Objekt-Pfade

Jetzt wird es richtig interessant. Stell dir vor, du willst alle
moeglichen Punkt-getrennten Pfade eines Objekts als Typ berechnen:

```typescript annotated
type Paths<T> = T extends object
  ? {
      [K in keyof T & string]:
        // ^ Iteriere ueber alle String-Schluessel von T
        | K
        // ^ Der Schluessel selbst ist ein gueltiger Pfad
        | `${K}.${Paths<T[K]>}`
        // ^ REKURSION + Template Literal: "schluessel.unterpfad"
    }[keyof T & string]
    // ^ [keyof T & string] "sammelt" alle Werte der Mapped Type
  : never;
  // ^ Primitiver Typ hat keine Pfade

// Testen:
type UserPaths = Paths<{
  name: string;
  address: {
    street: string;
    city: string;
    country: { code: string };
  };
}>;
// Ergebnis:
// "name" | "address" | "address.street" | "address.city"
// | "address.country" | "address.country.code"
```

Das ist **Template Literal Types + Rekursion + Mapped Types** —
drei Features die zusammenarbeiten.

---

## Erklaere dir selbst: Wie berechnet Paths die Pfade?

> **Erklaere dir selbst:**
>
> Wie berechnet `Paths<{ a: { b: { c: string } } }>` den Typ
> `'a' | 'a.b' | 'a.b.c'`?
>
> Verfolge die Rekursion Schritt fuer Schritt:
> 1. K = "a" → Pfade: "a" | `a.${Paths<{b:{c:string}}>}`
> 2. Fuer Paths<{b:{c:string}}>: K = "b" → "b" | `b.${Paths<{c:string}>}`
> 3. Fuer Paths<{c:string}>: K = "c" → "c" | `c.${Paths<string>}`
> 4. Paths<string> = never (kein Objekt!)
> 5. Rueckwaerts einsetzen: "c" | "c.never" → "c"
> 6. "b" | "b.c" → Union mit "a" | "a.b" | "a.b.c"

---

## PathValue\<T, P\>: Den Wert an einem Pfad holen

Wenn wir Pfade berechnen koennen, koennen wir auch den **Typ des
Wertes** an einem Pfad ermitteln:

```typescript annotated
type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    // ^ Hat der Pfad einen Punkt? Zerlege in "Head.Tail"
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      // ^ REKURSION: Gehe eine Ebene tiefer mit dem Rest-Pfad
      : never
    : P extends keyof T
      ? T[P]
      // ^ Kein Punkt: P ist der letzte Schluessel → Wert zurueckgeben
      : never;

// Testen:
type User = {
  name: string;
  address: {
    street: string;
    zip: number;
    country: { code: string; name: string };
  };
};

type A = PathValue<User, "name">;                  // string
type B = PathValue<User, "address.street">;         // string
type C = PathValue<User, "address.zip">;            // number
type D = PathValue<User, "address.country.code">;   // string
type E = PathValue<User, "invalid">;                // never
```

---

## Rekursive String-Manipulation

Template Literal Types ermoeglichen auch **String-Manipulation auf
Type-Level**:

```typescript annotated
// Split: String an einem Trennzeichen aufteilen
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    // ^ Finde das Trennzeichen D im String S
    ? [Head, ...Split<Tail, D>]
    // ^ REKURSION: Erster Teil + Rest rekursiv aufteilen
    : [S];
    // ^ Kein Trennzeichen mehr → letztes Element

type Result = Split<"a.b.c.d", ".">;
// ["a", "b", "c", "d"]

// Join: Tuple zu String zusammenfuegen (Gegenstueck)
type Join<T extends string[], D extends string> =
  T extends []
    ? ""
    : T extends [infer Head extends string]
      ? Head
      : T extends [infer Head extends string, ...infer Tail extends string[]]
        ? `${Head}${D}${Join<Tail, D>}`
        // ^ REKURSION: Erstes Element + Trennzeichen + Rest
        : never;

type Joined = Join<["a", "b", "c"], ".">;
// "a.b.c"
```

---

## Experiment: Paths in Aktion

> **Experiment:**
>
> Implementiere `Paths` und teste es mit einem verschachtelten Objekt:
>
> ```typescript
> type Paths<T> = T extends object
>   ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
>   : never;
>
> type PathValue<T, P extends string> =
>   P extends `${infer Head}.${infer Tail}`
>     ? Head extends keyof T
>       ? PathValue<T[Head], Tail>
>       : never
>     : P extends keyof T
>       ? T[P]
>       : never;
>
> // Test-Typ
> type Config = {
>   database: {
>     host: string;
>     port: number;
>     credentials: { user: string; password: string };
>   };
>   cache: { ttl: number; maxSize: number };
> };
>
> // Teste: Hovere ueber diese Typen
> type AllPaths = Paths<Config>;
> type HostType = PathValue<Config, "database.host">;
> type PasswordType = PathValue<Config, "database.credentials.password">;
>
> // Typsichere get-Funktion:
> function get<T, P extends Paths<T> & string>(
>   obj: T,
>   path: P
> ): PathValue<T, P> {
>   return path.split(".").reduce(
>     (acc, key) => (acc as any)[key],
>     obj as any
>   ) as PathValue<T, P>;
> }
>
> declare const config: Config;
> const host = get(config, "database.host");       // string
> const port = get(config, "database.port");        // number
> // get(config, "database.invalid");                // Error!
> ```
>
> Das ist exakt das Pattern, das Libraries wie **React Hook Form**
> fuer `register('address.street')` verwenden!

---

## Framework-Bezug: React Hook Form und Paths

> **In React mit React Hook Form:**
>
> ```typescript
> // React Hook Form nutzt EXAKT dieses Paths-Pattern:
> import { useForm, Path } from "react-hook-form";
>
> type FormValues = {
>   user: {
>     name: string;
>     address: { street: string; city: string };
>   };
>   newsletter: boolean;
> };
>
> function MyForm() {
>   const { register } = useForm<FormValues>();
>
>   return (
>     <form>
>       <input {...register("user.name")} />
>       {/* ^ Autocomplete zeigt: "user" | "user.name" | ... */}
>       <input {...register("user.address.street")} />
>       {/* ^ Typsicher bis in die tiefste Ebene */}
>       {/* register("user.invalid") → Compile Error! */}
>     </form>
>   );
> }
> ```
>
> **In Angular** mit Reactive Forms gibt es aehnliche Patterns:
>
> ```typescript
> // Angular 14+ Typed Reactive Forms
> const form = new FormGroup({
>   user: new FormGroup({
>     name: new FormControl(''),
>     address: new FormGroup({
>       street: new FormControl(''),
>     }),
>   }),
> });
>
> // form.get('user.name') — Angular nutzt String-Pfade,
> // aber seit Angular 14 sind sie (begrenzt) typisiert
> ```

---

## Zusammenfassung

### Was du gelernt hast

Du hast die **maechtigsten rekursiven Typ-Patterns** kennengelernt:

- **Flatten\<T\>** entfernt Array-Ebenen durch rekursive Conditional Types
- **Paths\<T\>** berechnet alle moeglichen Punkt-getrennten Pfade eines Objekts
- **PathValue\<T, P\>** ermittelt den Wert-Typ an einem bestimmten Pfad
- **Template Literal Types + Rekursion** ermoeglichen String-Manipulation auf Type-Level
- Libraries wie React Hook Form nutzen exakt diese Patterns

> **Kernkonzept:** Rekursive Conditional Types kombinieren die
> Pruefung `extends` mit Selbstreferenz. Der Schluessel ist immer:
> **zerlege das Problem** (infer Head/Tail), **verarbeite einen Teil**,
> **rekursiere ueber den Rest**. Die Abbruchbedingung ist der Fall,
> in dem nichts mehr zu zerlegen ist.

---

> **Pausenpunkt** — Du hast jetzt die volle Macht der rekursiven Types
> gesehen. Aber Macht kommt mit Verantwortung: In der naechsten
> Sektion lernst du die **Grenzen und Performance-Fallen**.
>
> Weiter: [Sektion 05 - Grenzen und Performance](./05-grenzen-und-performance.md)
