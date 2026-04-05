# Sektion 3: Performante Typen schreiben

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Type Instantiation und Depth Limits](./02-type-instantiation-und-depth-limits.md)
> Naechste Sektion: [04 - Compile-Zeit messen und optimieren](./04-compile-zeit-messen-und-optimieren.md)

---

## Was du hier lernst

- Den Unterschied zwischen **flachen** und **tiefen** Typen und warum er fuer Performance entscheidend ist
- Warum **Interface extends** schneller ist als **Type Intersection** (`&`)
- Wie du **grosse Union-Types** entschaerfst
- Konkrete **Refactoring-Patterns** die Compile-Zeit messbar reduzieren

---

## Das Grundprinzip: Flach ist schnell

> **Hintergrundwissen: Wie der Checker Typen vergleicht**
>
> Wenn der Checker prueft, ob Typ A an Typ B zuweisbar ist, muss er jedes
> Property von A mit jedem Property von B vergleichen. Bei flachen Typen
> (Interface mit 10 Properties) ist das 10 Vergleiche. Bei verschachtelten
> Typen wird das rekursiv — und bei Intersections muss der Checker die
> Properties erst "zusammenmergen" bevor er vergleichen kann.
>
> Das TypeScript-Team hat in Performance-Audits festgestellt: **Die meisten
> langsamen Projekte haben nicht zu viele Typen, sondern zu komplexe Typen.**
> Ein Projekt mit 1000 einfachen Interfaces kompiliert schneller als eines
> mit 100 tief verschachtelten Intersection-Types.

Die goldene Regel fuer performante Typen:

> **Je flacher der Typ, desto schneller der Checker.**

Flach bedeutet: wenig Verschachtelung, wenig Indirektion, wenig
Berechnung die der Checker zur Compile-Zeit durchfuehren muss.

---

## Interface extends vs. Type Intersection

Das ist die wichtigste Performance-Regel in TypeScript:

```typescript annotated
// LANGSAM: Intersection Type
type UserWithRole = User & { role: string };
// ^ Der Checker muss User und { role: string } bei JEDER Verwendung mergen
// ^ Das Ergebnis wird NICHT gecacht — jede Zuweisbarkeits-Pruefung mergt neu

// SCHNELL: Interface extends
interface UserWithRole extends User {
  role: string;
}
// ^ Der Checker berechnet das Interface EINMAL und cacht die Property-Liste
// ^ Jede Zuweisbarkeits-Pruefung nutzt den Cache
```

Warum ist das so? Interfaces werden vom Compiler **eagerly** evaluiert
und die Property-Liste wird gespeichert. Intersection Types werden
**lazily** evaluiert — bei jeder Verwendung muss der Checker die
Properties neu zusammensetzen.

```typescript annotated
// Besonders teuer: Mehrfach-Intersections
type FullEntity = Base & Timestamps & SoftDelete & Versioned & Audited;
// ^ 5 Typen werden bei JEDER Verwendung gemergt
// ^ In einem Service mit 20 Methoden die FullEntity verwenden:
// ^ 20 * 5 Merge-Operationen = 100 Merges

// Besser: Interface-Kette
interface FullEntity extends Base, Timestamps, SoftDelete, Versioned, Audited {}
// ^ EINMAL berechnet, egal wie oft verwendet
// ^ 20 Methoden die FullEntity verwenden: 0 zusaetzliche Merges
```

> 🧠 **Erklaere dir selbst:** Warum kann der Compiler Interfaces cachen aber Intersection-Types nicht? Was ist der strukturelle Unterschied?
> **Kernpunkte:** Interfaces haben eine feste, abgeschlossene Property-Liste | Intersections koennen Generics enthalten die erst spaeter aufgeloest werden | Der Compiler weiss bei Interfaces VORHER was drin ist | Bei Intersections muss er es bei jeder Verwendung neu berechnen

---

## Union-Types entschaerfen

Grosse Union-Types sind ein weiterer Performance-Killer. Der Grund:
Zuweisbarkeits-Pruefungen bei Unions sind **O(n * m)** — jedes Member
des einen Typs wird gegen jedes Member des anderen geprueft.

```typescript annotated
// LANGSAM: Riesige String-Union
type AllIcons =
  | "home" | "settings" | "user" | "mail" | "search"
  | "close" | "menu" | "add" | "delete" | "edit"
  | "save" | "cancel" | "refresh" | "download" | "upload"
  // ... 200 weitere Icons
  ;
// ^ Jede Zuweisbarkeits-Pruefung iteriert ueber ALLE Members
// ^ "Ist 'home' in AllIcons?" → 200+ Vergleiche

// SCHNELLER: Gruppierte Unions
type NavigationIcons = "home" | "menu" | "search" | "settings";
type ActionIcons = "add" | "delete" | "edit" | "save" | "cancel";
type FileIcons = "download" | "upload" | "refresh";

type AllIcons = NavigationIcons | ActionIcons | FileIcons;
// ^ Der Compiler kann die Gruppen einzeln evaluieren
// ^ Und wenn du nur NavigationIcons brauchst: kleinere Pruefung
```

Noch wichtiger: Verwende Union-Types nicht dort, wo ein **Index-Typ**
besser waere:

```typescript annotated
// LANGSAM: Union von 100 Objekt-Typen
type ApiResponse =
  | { type: "user"; data: User }
  | { type: "post"; data: Post }
  | { type: "comment"; data: Comment }
  // ... 97 weitere Varianten
  ;
// ^ Discriminated Union mit 100 Varianten
// ^ switch(response.type) muss den Checker 100 Narrowings evaluieren

// SCHNELLER: Mapped Type + Lookup
interface ResponseMap {
  user: User;
  post: Post;
  comment: Comment;
  // ... weitere Typen
}

type ApiResponse<T extends keyof ResponseMap> = {
  type: T;
  data: ResponseMap[T];
};
// ^ Eine einzige generische Definition statt 100 Union-Members
// ^ Der Checker instantiiert nur den spezifischen Typ den du brauchst
```

> 💭 **Denkfrage:** Wenn eine Discriminated Union 100 Varianten hat und du
> einen `switch` mit 100 Cases schreibst — wie viele Zuweisbarkeits-Pruefungen
> muss der Checker durchfuehren?
>
> **Antwort:** In jedem Case muss der Checker pruefen, welche Varianten noch
> uebrig sind (Narrowing). Im schlechtesten Fall: 100 + 99 + 98 + ... + 1 =
> 5050 Pruefungen. Bei Mapped Types: 1 Lookup pro Case.

---

## Conditional Types vereinfachen

Conditional Types sind maechtig aber teuer. Jeder Zweig muss evaluiert
werden, und bei Distributive Conditional Types wird das fuer jedes
Union-Member separat gemacht:

```typescript annotated
// LANGSAM: Verschachtelte Conditional Types
type DeepExtract<T, Path extends string> =
  Path extends `${infer Head}.${infer Rest}`
    ? Head extends keyof T
      ? DeepExtract<T[Head], Rest>
      // ^ Rekursion + Template Literal Parsing + keyof-Pruefung
      // ^ Bei Depth 5: 5 Conditional-Evaluierungen pro Aufruf
      : never
    : Path extends keyof T
    ? T[Path]
    : never;

// SCHNELLER: Overloads fuer bekannte Tiefen
type Get1<T, K1 extends keyof T> = T[K1];
type Get2<T, K1 extends keyof T, K2 extends keyof T[K1]> = T[K1][K2];
type Get3<T, K1 extends keyof T, K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]> = T[K1][K2][K3];
// ^ Keine Rekursion, keine Template-Literal-Parsing
// ^ Fuer 95% der Faelle reichen 3 Ebenen
```

> ⚡ **Framework-Bezug (Angular):** Angulars `FormGroup`-Typisierung ist
> ein reales Beispiel: Typed Reactive Forms (seit Angular 14) verwenden
> rekursive Typen um verschachtelte FormGroups zu typen. In Projekten mit
> 50+ Formularen kann das die Compile-Zeit um 15-20% erhoehen. Der
> Angular-Tipp: Verwende `FormRecord` statt tief verschachtelter
> `FormGroup<{ nested: FormGroup<{ ... }> }>`.

---

## Generics: Constraints statt Conditional Types

Oft kannst du Conditional Types durch Constraints ersetzen — das ist
sowohl lesbarer als auch performanter:

```typescript annotated
// LANGSAM: Conditional Type fuer Typ-Extraktion
type ExtractId<T> = T extends { id: infer Id } ? Id : never;
// ^ Fuer jede Verwendung: Conditional evaluieren + infer aufloesen

// SCHNELLER: Constraint + Lookup
type ExtractId<T extends { id: unknown }> = T["id"];
// ^ Kein Conditional noetig — T hat GARANTIERT ein id-Property
// ^ Direkter Lookup statt Pattern-Matching

// LANGSAM: Conditional fuer Array-Pruefung
type Flatten<T> = T extends Array<infer U> ? U : T;

// SCHNELLER: Overloads
type Flatten<T> = T extends Array<infer U> ? U : T;
// ^ Hier gibt es leider keine bessere Alternative
// ^ Aber du kannst das Ergebnis cachen:
type FlattenedItems = Flatten<Items>; // Einmal berechnen, ueberall nutzen
```

> 🧪 **Experiment:** Erstelle eine Datei mit diesem Code und beobachte
> die IDE-Reaktionszeit:
>
> ```typescript
> // Version 1: Intersection-Kette
> type Base = { id: string; created: Date };
> type V1 = Base & { name: string } & { email: string } & { role: string }
>   & { department: string } & { manager: string } & { salary: number };
>
> // Version 2: Interface extends
> interface V2 extends Base {
>   name: string; email: string; role: string;
>   department: string; manager: string; salary: number;
> }
>
> // Tippe: const user: V1 = { ... } und const user2: V2 = { ... }
> // Beobachte: Autocomplete fuer V2 erscheint schneller
> ```
>
> In kleinen Beispielen ist der Unterschied minimal. In Projekten mit
> Hunderten solcher Typen summiert es sich.

---

## Zusammenfassung: Die Performance-Regeln

| Regel | Langsam | Schnell |
|-------|---------|---------|
| Vererbung | `type A = B & C & D` | `interface A extends B, C, D {}` |
| Unions | 200+ Members in einer Union | Gruppierte Sub-Unions |
| Rekursion | Unbegrenzte Rekursionstiefe | Counter-basierter Abbruch |
| Conditional | Tief verschachtelte Conditionals | Constraints + Lookup |
| Caching | Gleichen Typ mehrfach berechnen | Type Alias = einmal berechnen |

---

## Was du gelernt hast

- **Interface extends** ist schneller als **Type Intersection** (`&`) weil Interfaces gecacht werden
- Grosse **Union-Types** verursachen O(n*m) Zuweisbarkeits-Pruefungen — gruppiere sie
- **Conditional Types** sind teuer — ersetze sie durch Constraints wo moeglich
- **Type Aliases** cachen Berechnungen — verwende sie statt Typen inline zu wiederholen
- Die meisten Performance-Probleme kommen von **wenigen komplexen Typen**, nicht von vielen einfachen

**Kernkonzept zum Merken:** Performante Typen sind wie performanter Code — bevorzuge einfache, flache Strukturen. Interface extends statt Intersection, Lookup statt Conditional, und cache teure Berechnungen in Type Aliases.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du weisst jetzt, wie du
> Typen schreibst, die den Checker nicht in die Knie zwingen.
>
> Weiter geht es mit: [Sektion 04: Compile-Zeit messen und optimieren](./04-compile-zeit-messen-und-optimieren.md)
