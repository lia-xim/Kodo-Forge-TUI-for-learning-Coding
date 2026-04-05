# Sektion 3: Pattern Matching mit Strings

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - String Utility Types](./02-utility-types.md)
> Naechste Sektion: [04 - Typsichere Event-Systeme](./04-event-names.md)

---

## Was du hier lernst

- Wie `infer` innerhalb von Template Literals String-Teile **extrahiert** — auf Typ-Ebene
- Das Grundprinzip rekursiver Typen fuer String-Parsing (Split, Trim, Replace)
- Wie man mit `DotPath` typsichere Pfade fuer verschachtelte Objekte erzeugt
- Wo die Grenzen der Rekursion liegen und was TypeScript dabei schuetzt

---

## Die Hintergrundgeschichte: String-Parser ohne Laufzeit

Stell dir vor, du schreibst eine Funktion `getPath(obj, "user.address.city")`. Zur Laufzeit ist das leicht — einfach am Punkt splitten und iterieren. Aber wie kannst du TypeScript dazu bringen, den **Rueckgabetyp** dieser Funktion korrekt abzuleiten? Wenn `obj` ein `{ user: { address: { city: string } } }` ist, sollte der Rueckgabetyp `string` sein — nicht `unknown`.

Vor TypeScript 4.1 war das schlicht nicht moeglich. Man musste sich mit Overloads behelfen oder `any` verwenden. Das war eine der meistgewuenschten Features-Requests der TypeScript-Community.

Der Schluessel zur Loesung war `infer` in Template Literals: Man kann dem Compiler sagen "matche diesen String gegen dieses Muster, und extrahiere Teile davon als neue Typvariablen". Das ist im Grunde ein **Typ-Level-Regex** — aber statisch, sicher und vollstaendig in den Compiler integriert.

Das Ergebnis: Bibliotheken wie `zod`, `prisma` und `tRPC` nutzen diese Technik intensiv, um aus String-Patterns vollstaendig typisierte Interfaces zu generieren. Was einmal "unloesbar" schien, ist heute Standard-Werkzeug.

---

## `infer` in Template Literals — das Grundprinzip

Du kennst `infer` bereits aus Conditional Types (L17). In Template Literals funktioniert es analog: Du beschreibst ein Muster, und TypeScript **extrahiert** den passenden Teil:

```typescript annotated
type ExtractPrefix<T extends string> =
  T extends `${infer Prefix}_${string}`
  //                ^^^^^^^^^             // 'Prefix' wird der Teil VOR dem Unterstrich
  //                          ^^^^^^^^    // Der Teil nach dem Unterstrich ist uns egal
    ? Prefix    // Match: Prefix zurueckgeben
    : never;    // Kein Match: never (leere Menge)

type A = ExtractPrefix<"user_name">;     // "user"
type B = ExtractPrefix<"get_value">;     // "get"
type C = ExtractPrefix<"admin_user_id">; // "admin" (nur ERSTER Unterstrich!)
type D = ExtractPrefix<"noprefix">;      // never
```

Der entscheidende Punkt: `${infer Prefix}` bedeutet "matche beliebig viele Zeichen und nenne sie `Prefix`". TypeScript findet automatisch den kuerzestmoeglichen Match — das erklaert warum `"admin_user_id"` zu `"admin"` wird und nicht zu `"admin_user"`.

> **Erklaere dir selbst:** Warum ergibt `ExtractPrefix<"admin_user_id">` den Wert `"admin"` und nicht `"admin_user"`? Mit welchem Regex-Begriff wuerdest du dieses Verhalten beschreiben?
>
> **Kernpunkte:** Template Literal infer ist standardmaeßig "non-greedy" (findet kuerzesten Match). `${infer Prefix}_${string}` matched am ERSTEN Unterstrich. Das ist identisch zum Regex-Konzept "lazy matching" mit `?`. Um den letzten Unterstrich zu matchen, muesste man rekursiv vorgehen.

---

## Rekursive Typen: Split

Fuer den naechsten Schritt brauchen wir Rekursion. TypeScript erlaubt es, dass ein Typ sich selbst referenziert — solange die Rekursion bei einem Basisfall terminiert:

```typescript annotated
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
  //                ^^^^                       // Teil vor dem Trennzeichen
  //                         ^                 // Das Trennzeichen selbst
  //                          ^^^^^^^^^^^      // Alles danach
    ? [Head, ...Split<Tail, D>]
    //        ^^^^^^^^^^^^^^^^^^  // Rekursion: Tail wird ebenfalls gesplittet
    : [S];
    //  ^^  // Basisfall: kein Trennzeichen mehr -> [S] als letztes Element

type A = Split<"a.b.c", ".">;   // ["a", "b", "c"]
type B = Split<"hello", ".">;   // ["hello"] — kein Punkt -> Basisfall
type C = Split<"x-y-z", "-">;   // ["x", "y", "z"]
type D = Split<"a..b", ".">;    // ["a", "", "b"] — leerer String zwischen den Punkten
```

Die Rekursion funktioniert so:
1. `Split<"a.b.c", ".">` — findet Punkt, splittet in `["a", ...Split<"b.c", ".">]`
2. `Split<"b.c", ".">` — findet Punkt, splittet in `["b", ...Split<"c", ".">]`
3. `Split<"c", ".">` — kein Punkt mehr, Basisfall: `["c"]`
4. Zusammengebaut: `["a", "b", "c"]`

> **Denkfrage:** Was passiert wenn du `Split<"", ".">` auswertst? Ist der leere String ein gueltiger String? Und was passiert bei `Split<"a", "ab">` — wenn das Trennzeichen laenger ist als der String?
>
> **Antwort:** `Split<"", ".">` ergibt `[""]` — der leere String matcht den Basisfall (kein Trennzeichen). `Split<"a", "ab">` ergibt ebenfalls `["a"]` — weil `"a"` das Muster `${infer Head}${"ab"}${infer Tail}` nicht erfuellen kann (die Sequenz "ab" kommt in "a" nicht vor).

---

## Trim: Leerzeichen entfernen

Ein weiteres klassisches Muster — Leerzeichen vom Anfang und Ende entfernen:

```typescript annotated
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}`
  //          ^^             // Matcht genau ein Leerzeichen am Anfang
    ? TrimLeft<Rest>         // Rekursion: weiteres Leerzeichen entfernen
    : S;                     // Basisfall: kein fuehrendes Leerzeichen

type TrimRight<S extends string> =
  S extends `${infer Rest} `
    ? TrimRight<Rest>
    : S;

type Trim<S extends string> = TrimLeft<TrimRight<S>>;
//                             Erst rechts trimmen, dann links

type A = Trim<"  hello  ">; // "hello"
type B = Trim<"  hello">;   // "hello"
type C = Trim<"hello  ">;   // "hello"
type D = Trim<"hello">;     // "hello" — unveraendert, Basisfall
```

---

> **Experiment:** Probiere folgendes im TypeScript Playground:
>
> ```typescript
> type Replace<
>   S extends string,
>   From extends string,
>   To extends string
> > = S extends `${infer Head}${From}${infer Tail}`
>   ? `${Head}${To}${Tail}`
>   : S;
>
> type A = Replace<"hello world", "world", "TypeScript">;
> // Was ergibt das?
>
> type ReplaceAll<
>   S extends string,
>   From extends string,
>   To extends string
> > = S extends `${infer Head}${From}${infer Tail}`
>   ? ReplaceAll<`${Head}${To}${Tail}`, From, To>
>   : S;
>
> type B = ReplaceAll<"a.b.c", ".", "/">;
> // Was ergibt das?
>
> // Jetzt der Unterschied: Was passiert bei Replace vs ReplaceAll mit
> // einem String der das Muster mehrfach enthaelt?
> type C = Replace<"a.b.c", ".", "/">;    // Nur erste Ersetzung
> type D = ReplaceAll<"a.b.c", ".", ">">; // Alle Ersetzungen
> ```
>
> Erklaere dir den Unterschied zwischen `Replace` und `ReplaceAll` anhand der Rekursion.

---

## DotPath: Das wichtigste Pattern der Praxis

Alle vorherigen Beispiele waren lehrreich — aber dieses hier wirst du tatsaechlich in echten Projekten sehen. `DotPath` generiert alle moeglichen Pfade durch ein verschachteltes Objekt als Typ:

```typescript annotated
type DotPath<T, Prefix extends string = ""> =
  T extends object
  //         ^^^^^^  // Nur fuer Objekte (nicht fuer Primitive)
    ? {
        [K in keyof T & string]:       // Iteriere alle String-Keys
          T[K] extends object
          //         ^^^^^^   // Ist der Wert selbst ein Objekt?
            ? DotPath<T[K], `${Prefix}${K}.`>
            //              ^^^^^^^^^^^^^^^^  // Prefix: Bisheriger Pfad + Key + Punkt
            : `${Prefix}${K}`;
            //  ^^^^^^^^^^^^^^  // Basisfall: Primitiver Wert = vollstaendiger Pfad
      }[keyof T & string]     // Alle Werte der Map als Union
    : never;

interface User {
  name: string;
  age: number;
  address: {
    city: string;
    zip: string;
    country: {
      code: string;
      name: string;
    };
  };
}

type UserPaths = DotPath<User>;
// "name" | "age" | "address.city" | "address.zip"
// | "address.country.code" | "address.country.name"
```

Das ist nicht nur theoretisch elegant — es hat direkte praktische Anwendung:

```typescript
// Typsichere getPath-Funktion:
function getPath<T extends object>(obj: T, path: DotPath<T>): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    return (current as Record<string, unknown>)[key];
  }, obj);
}

const user: User = {
  name: "Max",
  age: 30,
  address: {
    city: "Berlin",
    zip: "10115",
    country: { code: "DE", name: "Deutschland" }
  }
};

getPath(user, "address.city");          // OK — "Berlin"
getPath(user, "address.country.code");  // OK — "DE"
// getPath(user, "address.phone");      // FEHLER! "address.phone" existiert nicht
// getPath(user, "address");            // FEHLER! "address" ist ein Objekt, kein Blatt
```

**In React:** Genau dieses Pattern verwendet `react-hook-form` fuer den `name`-Parameter von `register()`. Das Formular weiss, welche verschachtelten Felder es gibt, und der TypeScript-Compiler stellt sicher, dass du nur existierende Pfade registrierst:

```typescript
// react-hook-form Konzept (vereinfacht)
interface FormData {
  user: {
    firstName: string;
    lastName: string;
    address: { city: string };
  };
}

// Intern verwendet react-hook-form DotPath-aehnliche Typen:
type FieldPath = DotPath<FormData>;
// "user.firstName" | "user.lastName" | "user.address.city"

const { register } = useForm<FormData>();
register("user.firstName");          // OK
register("user.address.city");       // OK
// register("user.middleName");      // FEHLER! Existiert nicht im Typ
```

---

## Die Grenzen der Rekursion

TypeScript hat eine eingebaute Schutzvorrichtung gegen unendliche Rekursion. Wenn ein rekursiver Typ zu tief wird, bricht der Compiler mit einem Fehler ab:

```typescript
// TypeScript begrenzt die Rekursionstiefe (typischerweise ~1000)
type TooDeep = Split<"a.b.c.d.e.f.g.....(1000 Punkte)...", ".">;
// Error: Type instantiation is excessively deep and possibly infinite.
```

Das ist keine Schwaeche — es ist ein Feature. Ohne diese Grenze koennte ein buggy rekursiver Typ den Compiler in eine Endlosschleife schicken. In der Praxis sind 1000 Ebenen tief genug fuer alle realistischen Anwendungsfaelle.

**Faustregel:** Wenn du den "excessively deep" Fehler siehst, ist dein rekursiver Typ entweder zu tief (zu viele Ebenen) oder es fehlt der Basisfall (was zu echter Endlosrekursion fuehren wuerde). Ueberpruefe zuerst den Basisfall.

---

## Was du gelernt hast

- `infer` in Template Literals extrahiert String-Teile: `T extends \`${infer Prefix}_${string}\`` extrahiert alles vor dem Unterstrich als `Prefix`
- Rekursive Typen ermoeglichten String-Operationen auf Typ-Ebene: `Split`, `Trim`, `Replace`, `ReplaceAll`
- `DotPath<T>` generiert alle moeglichen Dot-Notation-Pfade durch ein verschachteltes Objekt — das Fundament typsicherer Formular-Bibliotheken und Zustandsmanagement
- TypeScript schuetzt vor endloser Rekursion mit einer Tiefengrenze von ~1000 Ebenen

> **Erklaere dir selbst:** Warum ist der Basisfall in einem rekursiven Typ so wichtig? Was passiert ohne ihn? Und warum ist TypeScripts Tiefengrenze eine Schutzvorrichtung, keine Einschraenkung?
>
> **Kernpunkte:** Ohne Basisfall = unendliche Rekursion = Compiler haengt | TypeScript erkennt das und bricht ab | In der Praxis: immer zuerst den "kein Match"-Fall als Basisfall definieren | Tiefengrenze verhindert versehentliche Performance-Katastrophen

**Kernkonzept zum Merken:** `infer` in Template Literals ist ein Typ-Level-Parser. Du beschreibst ein String-Muster, und TypeScript extrahiert die markierten Teile als neue Typen. Kombiniert mit Rekursion entsteht daraus ein vollstaendiges String-Verarbeitungssystem — das aber nur zur Compilezeit existiert und deshalb keinen Laufzeit-Overhead erzeugt.

---

> **Pausenpunkt** — Rekursive Typen sind das Schwergewichtigste in dieser Lektion. Wenn `DotPath<T>` noch nicht vollstaendig klar ist, lies den Abschnitt nochmals durch und trace die Rekursion fuer `User.address.city` manuell durch: Was ist `Prefix` in jedem Schritt?
>
> Weiter geht es mit: [Sektion 04: Typsichere Event-Systeme](./04-event-names.md)
