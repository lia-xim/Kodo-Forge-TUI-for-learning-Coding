# Sektion 1: Types als Sprache — Turing-Vollstaendigkeit

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Arithmetik auf Type-Level](./02-arithmetik-auf-type-level.md)

---

## Was du hier lernst

- Warum TypeScript's Typsystem eine **eigene Programmiersprache** ist
- Was **Turing-Vollstaendigkeit** auf Type-Level bedeutet und warum das relevant ist
- Die fundamentalen Bausteine: Conditional Types, Rekursion und Mapped Types als Kontrollfluss
- Wann Type-Level Programming sinnvoll ist — und wann es Over-Engineering wird

---

## Das Typsystem ist eine Sprache

Du hast in den letzten 36 Lektionen TypeScript's Typsystem benutzt um
Fehler zu finden. Aber hier ist die ueberraschende Wahrheit: Das
Typsystem selbst ist eine **vollstaendige Programmiersprache**. Es hat
Variablen (Type Aliases), Bedingungen (Conditional Types), Schleifen
(Rekursion), Datenstrukturen (Tuples und Objects) und Funktionen
(generische Typen).

Stell dir vor, du haettest zwei Schichten Papier uebereinandergelegt.
Die untere Schicht ist JavaScript — der Code der zur Laufzeit
ausgefuehrt wird. Die obere Schicht ist das Typsystem — ein komplett
separates Programm das nur zur Compilezeit lebt. Beide Schichten
folgen eigenen Regeln, eigenen Kontrollflussoperatoren, eigenen
Datenstrukturen. Wenn du `T extends string ? A : B` schreibst,
programmierst du die obere Schicht — und der TypeScript-Compiler ist
dein Interpreter.

> **Warum du das ueberhaupt lernen solltest:**
>
> Du musst **KEIN** type-level Programming schreiben um gute Angular-
> oder React-Apps zu bauen. Die meisten Entwickler kommen ihr ganzes
> Karriere ohne `infer` oder rekursive Conditional Types aus.
>
> **ABER:** Wenn du diese Konzepte verstehst, dann:
> - Liest du Bibliotheks-Code (Zod, tRPC, React Hook Form) wie Offenen-Text
> - Weisst du WARUM `Partial<User>` funktioniert, nicht nur DASS es funktioniert
> - Erkennst du wenn eine Library type-level Magie falsch einsetzt
> - Kannst du deine eigenen Utility Types bauen statt auf fertige zu warten
>
> **Diese Lektion ist also kein "musst du koennen" sondern ein
> "verstehst du die Werkzeuge die du taeglich nutzt".**

> 📖 **Hintergrund: Wie TypeScript's Typsystem Turing-vollstaendig wurde**
>
> Als Anders Hejlsberg 2012 TypeScript entwarf, war das Typsystem
> bewusst einfach: Interfaces, Union Types, ein paar Generics. Doch
> mit jeder Version kamen Features dazu — Conditional Types (2018),
> Recursive Type Aliases (2020), Template Literal Types (2020),
> Variadic Tuple Types (2020). Irgendwann ueberschritt das System
> eine kritische Schwelle: Es wurde **Turing-vollstaendig**. Das war
> kein Designziel — es passierte als Nebeneffekt davon, den Nutzern
> immer maechtigere Typ-Werkzeuge zu geben. Heute gibt es Leute die
> einen Schachcomputer, einen JSON-Parser und sogar einen
> SQL-Interpreter rein auf Type-Level implementiert haben.
>
> Der entscheidende Moment kam mit **TypeScript 2.8 (2018)**: Conditional
> Types und `infer` machten das Typsystem erstmals vollstaendig
> ausdrucksstark fuer bedingte Logik. Vorher konnte man Typen nur
> beschreiben; jetzt konnte man Typen **berechnen**. Die Community
> erkannte das Potential sofort — innerhalb von Wochen entstanden
> Type-Level-Bibliotheken wie `type-fest` (Sindre Sorhus) und
> `ts-toolbelt` (Pierre-Antoine Mills). Heute sind diese Techniken
> in den Kernbibliotheken von tRPC, Zod und Prisma verbaut.

### Was heisst "Turing-vollstaendig"?

Ein System ist Turing-vollstaendig wenn es **jede berechenbare Funktion**
ausdruecken kann. Fuer TypeScript's Typsystem bedeutet das:

```typescript annotated
// "Variable" — ein Type Alias speichert einen Wert
type Message = "Hello";
// ^ Wie: const message = "Hello"

// "Bedingung" — Conditional Type ist ein if/else
type IsString<T> = T extends string ? true : false;
// ^ Wie: function isString(t) { return typeof t === "string" }

// "Schleife" — Rekursion ersetzt for/while
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc["length"] extends N ? Acc : Repeat<S, N, [...Acc, S]>;
// ^ Wie: function repeat(s, n) { while(arr.length < n) arr.push(s); }

// "Datenstruktur" — Tuples sind Arrays, Objects sind Maps
type Pair = [string, number];
type Dict = { [K: string]: boolean };
```

### Die Parallelen zur Werteebene

| Werteebene (JavaScript)     | Type-Level (TypeScript)             |
|-----------------------------|-------------------------------------|
| `const x = 42`             | `type X = 42`                       |
| `if (cond) a else b`       | `T extends U ? A : B`              |
| `while (...) { ... }`      | Rekursiver Typ                      |
| `[1, 2, 3]`                | `[1, 2, 3]` (Tuple)                |
| `{ key: value }`           | `{ key: Type }`                     |
| `function f(x) { ... }`    | `type F<X> = ...`                   |
| `...arr` (Spread)          | `[...T, ...U]` (Variadic Tuples)   |

> 🧠 **Erklaere dir selbst:** Warum ist `T extends U ? A : B` das
> fundamentalste Werkzeug fuer Type-Level Programming? Welche Rolle
> spielt `infer` dabei?
> **Kernpunkte:** Conditional Types sind der einzige Kontrollfluss
> auf Type-Level | `infer` extrahiert Teile eines Typs in Variablen |
> Zusammen mit Rekursion ergibt sich eine vollstaendige Sprache

---

## Die drei Saeulen des Type-Level Programming

### 1. Conditional Types als Kontrollfluss

Conditional Types sind dein `if/else`. Mit `infer` werden sie zu
Pattern-Matching — aehnlich wie `match` in Rust oder Scala:

```typescript annotated
// Pattern-Matching: Extrahiere den Rueckgabetyp einer Funktion
type ReturnOf<T> =
  T extends (...args: any[]) => infer R  // Pruefe ob T eine Funktion ist
    ? R                                   // Ja → extrahiere Rueckgabetyp R
    : never;                              // Nein → unmoeglicher Fall
// ^ Das ist ReturnType<T> aus der Standardbibliothek!

type A = ReturnOf<() => string>;           // string
type B = ReturnOf<(x: number) => boolean>; // boolean
type C = ReturnOf<42>;                     // never — 42 ist keine Funktion
```

### 2. Rekursion als Iteration

Type-Level hat kein `for` oder `while`. Stattdessen: **Rekursion**.
Ein Typ ruft sich selbst auf, bis eine Abbruchbedingung erreicht ist:

```typescript annotated
// Entferne alle 'readonly' Modifier — auch verschachtelt
type DeepMutable<T> =
  T extends ReadonlyArray<infer U>       // Ist T ein readonly Array?
    ? Array<DeepMutable<U>>               // → Mache es mutable, gehe tiefer
    : T extends object                    // Ist T ein Objekt?
      ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
      // ^ -readonly entfernt readonly, rekursiver Aufruf fuer Werte
      : T;                                // Primitiv → fertig
```

### 3. Mapped Types als Transformation

Mapped Types iterieren ueber Keys — das Aequivalent zu `map()`:

```typescript
type Transform<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
};

// Extrahiere nur die Methodennamen:
type MethodKeys<T> = Transform<T>[keyof T];
```

> 💭 **Denkfrage:** Wenn das Typsystem Turing-vollstaendig ist, koennte
> man theoretisch jeden Algorithmus darin ausdruecken. Warum sollte man
> das in der Praxis trotzdem NICHT tun?
>
> **Antwort:** Weil Type-Level-Code extrem schwer zu lesen, debuggen und
> warten ist. Ausserdem hat TypeScript eine **Rekursionstiefe von ~1000**
> und die Compiler-Performance leidet bei komplexen Typen. Type-Level
> Programming ist fuer **Bibliotheks-Autoren** und **kritische APIs** —
> nicht fuer Business-Logik.

---

## Wann lohnt sich Type-Level Programming?

Die goldene Regel: **Nutze Type-Level Programming wenn die Alternative
unsicherer Code waere.**

```
Lohnt sich:                           Lohnt sich NICHT:
├── Library-APIs typsicher machen     ├── Business-Logik auf Type-Level
├── Router-Typen (URL → Parameter)    ├── Berechnungen die zur Laufzeit gehören
├── Query Builder (SQL auf Type-Level)├── Wenn ein simples Interface reicht
├── Validierungs-Schemas              └── "Weil es cool ist"
└── Framework-Typen (Angular/React)
```

Der beste Test: Wenn du einen Typ baust und dich fragst "koennte ich
das auch mit einem einfachen Generic loesen?" — dann tue es. Type-Level
Programming ist ein Werkzeug, kein Stil-Statement.

> ⚡ **Framework-Bezug Angular:** Angular's `Signal<T>` berechnet
> den Typ von `computed()` basierend auf dem Return-Typ der uebergebenen
> Funktion. Das ist Type-Level Programming in Reinform:
>
> ```typescript
> // Angular intern — vereinfacht:
> declare function computed<T>(computation: () => T): Signal<T>;
> // ^ T wird aus dem Rueckgabetyp der Funktion abgeleitet
>
> const count = signal(0);
> const doubled = computed(() => count() * 2);
> // ^ doubled: Signal<number> — TypeScript berechnet das automatisch
> ```
>
> Das ist dasselbe Pattern wie `ReturnOf<T>` aus dem Code-Beispiel oben.

> ⚡ **Framework-Bezug React:** React's `ComponentProps<typeof MyComponent>`
> extrahiert Props-Typen aus einer Komponente — ohne dass du ein
> separates Interface exportieren musst:
>
> ```typescript
> // Statt: props: ButtonProps (manuell exportiert)
> // Besser:
> type ButtonProps = React.ComponentProps<typeof Button>;
> // ^ Extrahiert automatisch aus der Komponenten-Definition
>
> // Und fuer HTML-Elemente:
> type DivProps = React.ComponentPropsWithRef<"div">;
> // ^ Alle nativen div-Attribute mit korrekten Typen
> ```
>
> Du hast diese Typ-Magie schon benutzt — jetzt lernst du sie zu bauen.

---

## Experiment: Dein erster Type-Level-Algorithmus

Baue einen Typ der prueft ob ein String-Literal mit einem bestimmten
Praefix beginnt:

```typescript
// Schritt 1: Conditional Type mit Template Literal
type StartsWith<S extends string, Prefix extends string> =
  S extends `${Prefix}${string}` ? true : false;

// Teste es:
type A = StartsWith<"hello world", "hello">;  // true
type B = StartsWith<"hello world", "world">;  // false
type C = StartsWith<"", "x">;                 // false

// Schritt 2: Erweitere es — extrahiere den Rest nach dem Praefix
type AfterPrefix<S extends string, Prefix extends string> =
  S extends `${Prefix}${infer Rest}` ? Rest : never;

type D = AfterPrefix<"api/users/123", "api/">;  // "users/123"
type E = AfterPrefix<"api/users/123", "admin/">; // never

// Experiment: Was passiert wenn du AfterPrefix auf sich selbst anwendest?
// type Nested = AfterPrefix<AfterPrefix<"a/b/c", "a/">, "b/">;
// Probiere es aus und ueberlege: Ist das schon Rekursion?
```

Aendere den `Prefix`-Typ zu einer Union: `"api/" | "admin/"`.
Was passiert mit `StartsWith<"api/users", "api/" | "admin/">`?
Beobachte die Distributivitaet!

---

## Die Grenzen der Sprache im Blick behalten

Bevor du in die Details einsteigst, ein wichtiger Kontext: Obwohl das
Typsystem Turing-vollstaendig ist, hat es spezifische Einschraenkungen
die du kennen musst.

| Einschraenkung | Wert | Konsequenz |
|---|---|---|
| Rekursionstiefe | ~1000 (mit TCO) | Tiefe Algorithmen brauchen Accumulator-Pattern |
| Instanziierungstiefe | ~100 Verschachtelungen | Komplex verschachtelte Generics schlagen fehl |
| Union-Breite | Einige Tausend Member | Grosse String-Unions werden langsam |
| Compile-Zeit | Wächst quadratisch | Komplexe Typen verlangsamen den Editor |

> 💭 **Denkfrage:** Wenn TypeScript's Typsystem Turing-vollstaendig
> ist und theoretisch jeden Algorithmus ausdruecken kann — warum gibt
> es dann trotzdem Type-Level-Bibliotheken wie `ts-toolbelt` und
> `type-fest`? Was liefern sie zusaetzlich?
>
> **Antwort:** Drei Dinge: Erstens **getestete Implementierungen** —
> Kantenfall-Handling bei `never`, `any`, `unknown` ist nicht trivial.
> Zweitens **Dokumentation** — Type-Level-Code ist schwer lesbar,
> gute Bibliotheken erklaren jeden Typ. Drittens **Performance** —
> optimierte Implementierungen die das Rekursionslimit ausloten ohne
> es zu ueberschreiten.

---

## Was du gelernt hast

- TypeScript's Typsystem ist eine **Turing-vollstaendige Sprache** mit Variablen, Bedingungen, Schleifen und Datenstrukturen
- Die drei Saeulen: **Conditional Types** (Kontrollfluss), **Rekursion** (Iteration), **Mapped Types** (Transformation)
- `infer` ist der Schluessel zu Pattern-Matching auf Type-Level
- Type-Level Programming lohnt sich fuer **Library-APIs und kritische Schnittstellen** — nicht fuer Business-Logik
- Die Sprache hat Grenzen: Rekursionstiefe, Compile-Zeit, Lesbarkeit — diese kennen ist Teil des Handwerks

> 🧠 **Erklaere dir selbst:** Wenn jemand sagt "TypeScript's Typsystem
> ist eine Programmiersprache", was genau meint er damit? Welche
> Einschraenkungen hat diese "Sprache" gegenueber JavaScript?
> **Kernpunkte:** Alle Bausteine einer Programmiersprache vorhanden |
> Einschraenkungen: Rekursionstiefe, keine I/O, keine Side Effects,
> schwer zu debuggen | Nur Compilezeit, nicht Laufzeit | Kein
> Debugging-Tool wie console.log — nur Hover-Types im Editor

**Kernkonzept zum Merken:** Das Typsystem hat zwei Schichten — die einfache (Annotationen, Interfaces) und die programmatische (Conditional Types, Rekursion, infer). Die programmatische Schicht ist eine Sprache in der Sprache. Nutze sie dort wo sie echten Mehrwert liefert: an Schnittstellen zwischen Code-Einheiten.

---

> **Pausenpunkt** — Du hast das mentale Modell verstanden: Types sind
> nicht nur Annotationen, sie sind ein Programm. Ab jetzt geht es um
> konkrete Techniken.
>
> Weiter geht es mit: [Sektion 02: Arithmetik auf Type-Level](./02-arithmetik-auf-type-level.md)
