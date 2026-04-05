# Sektion 3: Der grosse Vergleich

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Interfaces Deep Dive](./02-interfaces-deep-dive.md)
> Naechste Sektion: [04 - Entscheidungsmatrix](./04-entscheidungsmatrix.md)

---

## Was du hier lernst

- Eine **vollstaendige Vergleichstabelle** aller Unterschiede
- Warum **extends schneller als &** ist fuer den Compiler
- Wie sich Fehlermeldungen bei `type` und `interface` unterscheiden
- Wann die Unterschiede in der Praxis **wirklich** relevant sind

---

## Die grosse Vergleichstabelle

| Eigenschaft | `type` | `interface` |
|---|---|---|
| Primitive Aliases | `type ID = string` | Nicht moeglich |
| Union Types | `type A = B \| C` | Nicht moeglich |
| Intersection Types | `type A = B & C` | Nicht moeglich (aber `extends`) |
| Mapped Types | `type R = { [K in keyof T]: ... }` | Nicht moeglich |
| Conditional Types | `type R = T extends U ? A : B` | Nicht moeglich |
| Tuple Types | `type T = [string, number]` | Nicht moeglich |
| Declaration Merging | Nicht moeglich | Ja — mehrfach deklarierbar |
| extends | Nicht moeglich (aber `&`) | `interface B extends A` |
| implements (Klasse) | Ja (nur Objekttypen) | Ja |
| Computed Properties | Ja | Ja |
| Generics | Ja | Ja |
| Index Signatures | Ja | Ja |
| Call Signatures | Ja | Ja |
| Construct Signatures | Ja | Ja |
| Performance | Langsamer bei `&` | Schneller bei `extends` |
| Fehlermeldungen | Manchmal kryptischer | Meist klarer |

> 🧠 **Erklaere dir selbst:** Welche Zeilen in der Tabelle sind fuer DEINE
> taegliche Arbeit am relevantesten? Welche Faehigkeit nutzt du am
> haeufigsten, die nur einer der beiden Seiten hat?
> **Kernpunkte:** Union Types (type-exklusiv) sind sehr haeufig |
> Declaration Merging (interface-exklusiv) ist seltener aber kritisch |
> Fuer reine Objekt-Formen sind beide austauschbar

---

## Performance: extends ist schneller als &

Dies ist einer der weniger bekannten aber **praktisch relevanten** Unterschiede.
Das TypeScript-Team hat dies in der offiziellen Performance-Wiki dokumentiert:

```typescript annotated
// LANGSAMER: Intersection mit &
type UserWithTimestamps = User & {
  createdAt: Date;
  updatedAt: Date;
};
// ^ Der Compiler muss bei JEDER Verwendung die Intersection NEU berechnen.
// Kein Caching moeglich.

// SCHNELLER: Interface mit extends
interface UserWithTimestamps extends User {
  createdAt: Date;
  updatedAt: Date;
}
// ^ Der Compiler erstellt einen festen Typ und cached ihn.
// Bei wiederholter Verwendung wird der Cache genutzt.
```

> 📖 **Hintergrund: Warum ist extends schneller?**
>
> Der TypeScript-Compiler behandelt `extends` und `&` intern voellig
> verschieden:
>
> **extends:** Der Compiler erstellt beim ersten Antreffen einen **flachen
> Typ-Cache**. Alle Properties werden in eine einzige Struktur zusammengefuegt
> und gespeichert. Bei jeder weiteren Verwendung wird der Cache gelesen.
>
> **& (Intersection):** Der Compiler muss die Intersection **jedes Mal
> neu aufloesen**. Bei `A & B & C` wird erst `A & B` berechnet, dann das
> Ergebnis mit `C` gemergt. Das ist bei einfachen Typen kaum spuerbar,
> aber bei grossen Projekten mit tiefen Vererbungsketten (z.B. 10+ Ebenen)
> kann es die Compile-Zeit messbar erhoehen.
>
> Das TypeScript-Team empfiehlt deshalb in ihrer offiziellen
> Performance-Dokumentation: "Prefer interfaces over type aliases
> for extending types."
>
> Quelle: github.com/microsoft/TypeScript/wiki/Performance

### Wann ist der Performance-Unterschied relevant?

Sei ehrlich: In den meisten Projekten wirst du keinen Unterschied bemerken.
Der Unterschied wird relevant bei:

- **Sehr grossen Projekten** (1000+ Dateien, tiefe Typen-Hierarchien)
- **Generischen Bibliotheks-Code** der hundertfach instanziiert wird
- **Komplexen Intersection-Ketten** mit 5+ Typen

```typescript
// Problematisch in grossen Projekten:
type HugeType = A & B & C & D & E & F & G & H;
// ^ 8-fache Intersection = 7 Berechnungsschritte bei JEDER Verwendung

// Besser:
interface HugeType extends A, B, C, D, E, F, G, H {}
// ^ Einmal berechnet, dann gecacht
```

---

## Fehlermeldungen: interface ist oft klarer

Ein oft uebersehener praktischer Unterschied: Die Fehlermeldungen
des Compilers unterscheiden sich.

### Beispiel: Fehlendes Property

```typescript
// Mit interface:
interface UserI {
  name: string;
  age: number;
}

// const u: UserI = { name: "Max" };
// Error: Property 'age' is missing in type '{ name: string; }'
//        but required in type 'UserI'.
// ^ Klar: "fehlt in UserI"

// Mit type:
type UserT = {
  name: string;
  age: number;
};

// const u: UserT = { name: "Max" };
// Error: Property 'age' is missing in type '{ name: string; }'
//        but required in type 'UserT'.
// ^ Aenalich klar.
```

Der Unterschied wird bei **komplexen Typen** deutlicher:

```typescript
// Mit Intersection (type):
type Base = { id: string };
type WithName = { name: string };
type WithAge = { age: number };
type Complex = Base & WithName & WithAge;

// const c: Complex = { id: "1", name: "Max" };
// Error: ... but required in type 'Base & WithName & WithAge'
// ^ Die GESAMTE Intersection wird angezeigt. Kann lang und verwirrend sein.

// Mit extends (interface):
interface ComplexI extends Base, WithName, WithAge {}

// const c: ComplexI = { id: "1", name: "Max" };
// Error: ... but required in type 'ComplexI'
// ^ Nur der Interface-Name. Viel kuerzer.
```

> ⚡ **Praxis-Tipp:** Wenn du in VSCode ueber eine Variable hoberst,
> zeigt der Tooltip bei Interfaces den **Interface-Namen** an.
> Bei komplexen Type Aliases zeigt er oft den **aufgeloesten Typ**
> (die volle Struktur). Das kann bei grossen Typen unuebersichtlich werden.
> Interfaces behalten ihren Namen in Tooltips.

> **Experiment:** Kopiere folgendes in den TypeScript Playground und hovere
> mit der Maus ueber die Variablen `a` und `b` — achte auf den Tooltip-Unterschied:
>
> ```typescript
> // Fall 1: Interface ist klar besser — Library-Erweiterung
> interface RequestBase { url: string; method: string }
> interface AuthRequest extends RequestBase { token: string }
> // Hier ist interface die einzige sinnvolle Wahl, weil:
> // - Andere Module koennen AuthRequest per Declaration Merging erweitern
> // - Der Tooltip zeigt sauber "AuthRequest", nicht die ganze Struktur
>
> const a: AuthRequest = { url: "/api", method: "GET", token: "abc" };
>
> // Fall 2: Type ist klar besser — Discriminated Union
> type ApiResult =
>   | { status: "ok"; data: string }
>   | { status: "err"; message: string };
> // Hier ist type die einzige Wahl — interface kann keine Unions.
>
> function handle(r: ApiResult) {
>   if (r.status === "ok") console.log(r.data);
>   //                                    ^ TypeScript kennt 'data' hier
>   else console.error(r.message);
>   //                   ^ TypeScript kennt 'message' hier
> }
>
> const b: ApiResult = { status: "ok", data: "Ergebnis" };
> ```
>
> Wechsle dann den `type ApiResult` zu `interface ApiResult` und beobachte
> den Compiler-Fehler — so siehst du den Unterschied in Echtzeit.

---

## Konflikt-Verhalten: extends vs &

Was passiert, wenn Properties kollidieren?

### extends: Strenge Pruefung

```typescript
interface A {
  id: string;
}

// interface B extends A {
//   id: number;
// ^ Error! 'number' is not assignable to 'string'.
// extends erlaubt KEINE inkompatiblen Ueberschreibungen.
// }

// Kompatible Einschraenkung geht:
interface C extends A {
  id: "admin" | "user";
// ^ OK! "admin" | "user" ist ein Subtyp von string.
}
```

### & (Intersection): Stille Verschmelzung

```typescript annotated
type X = { id: string };
type Y = { id: number };
type Z = X & Y;
// ^ Kein Fehler! Aber id ist jetzt 'string & number' = 'never'.

// const z: Z = { id: ??? };
// ^ Es gibt keinen Wert der gleichzeitig string UND number ist.
// Der Typ ist un-erstellbar, aber TypeScript beschwert sich ERST
// wenn du versuchst, ein Objekt zu erstellen.
```

> 🧠 **Erklaere dir selbst:** Welches Verhalten bevorzugst du — den
> sofortigen Fehler von `extends` oder die stille Verschmelzung von `&`?
> In welcher Situation ist welches Verhalten hilfreicher?
> **Kernpunkte:** extends gibt sofortiges Feedback | & ist flexibler
> aber kann versteckte never-Typen erzeugen | extends ist sicherer
> fuer Vererbungs-Hierarchien | & ist nuetzlich fuer Mixins

---

## Redeclaring vs. Extending

Ein subtiler Unterschied, der oft verwirrt:

```typescript
// interface: Redeclaring FUEGT HINZU (Declaration Merging)
interface User { name: string; }
interface User { age: number; }
// User hat jetzt: name + age

// type: Redeclaring ist ein FEHLER
type User2 = { name: string };
// type User2 = { age: number };  // Error: Duplicate identifier

// Wenn du einen Type Alias erweitern willst:
type User2Extended = User2 & { age: number };
// ^ Neuer Name noetig!
```

---

## Was du gelernt hast

- `type` kann **mehr** (Unions, Mapped Types, Conditionals) — `interface` kann **Declaration Merging**
- `extends` ist **schneller** als `&` fuer den Compiler (Caching)
- **Fehlermeldungen** sind bei Interfaces oft klarer und kuerzer
- `extends` prueft Konflikte **sofort** — `&` erzeugt stille `never`-Typen
- In der Praxis sind beide fuer **einfache Objekt-Typen** weitgehend austauschbar

> 🧠 **Erklaere dir selbst:** Jemand sagt "Interfaces sind immer besser weil
> sie schneller sind." Stimmt das? In welchen Faellen MUSS man `type` verwenden?
> **Kernpunkte:** Der Performance-Vorteil gilt nur fuer extends vs & |
> Union Types, Mapped Types, Conditional Types sind NUR mit type moeglich |
> "Immer interface" funktioniert nicht sobald man Unions braucht

**Kernkonzept zum Merken:** Die Wahl zwischen `type` und `interface` ist selten
eine Performance-Entscheidung. Es ist eine Frage der **Faehigkeiten**: Was muss
dein Typ koennen?

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du kennst jetzt alle
> technischen Unterschiede im Detail.
>
> Weiter geht es mit: [Sektion 04: Entscheidungsmatrix](./04-entscheidungsmatrix.md)
