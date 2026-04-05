# Sektion 1: Die extends-Bedingung — Typen die Entscheidungen treffen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start der Lektion)
> Naechste Sektion: [02 - Das infer-Keyword](./02-infer-keyword.md)

---

## Was du hier lernst

- Was Conditional Types sind und warum sie ein Quantensprung im Typsystem sind
- Die Grundsyntax `T extends U ? X : Y` und wie TypeScript sie auswertet
- Wie sich Conditional Types von Runtime-Checks (`typeof`, `instanceof`) fundamental unterscheiden
- Wann Conditional Types sinnvoll sind — und wann sie overkill sind

---

## Die Idee: Typen die Entscheidungen treffen

Stell dir vor, du baust eine Bibliothek. Deine Funktion soll `string` akzeptieren und `string[]` zurueckgeben — aber wenn der Nutzer `number` uebergibt, soll `number[]` herauskommen. Mit einfachen Generics kaemst du an eine Grenze: `T[]` funktioniert zwar, aber was wenn du je nach Eingabetyp *komplett verschiedene* Ausgaben willst?

Genau hier setzen Conditional Types an. Sie erlauben es, den **Rueckgabetyp einer Funktion vom Eingabetyp abhaengig zu machen** — zur Compile-Zeit, ohne Laufzeit-Code.

Der Ternary-Operator (`a > 0 ? "positiv" : "negativ"`) ist dir vertraut. Conditional Types sind derselbe Gedanke, aber auf der Typ-Ebene:

```typescript
// Laufzeit-Ternary:
const label = value > 0 ? "positiv" : "negativ";

// Typ-Level-Ternary (Conditional Type):
type IsString<T> = T extends string ? "ja" : "nein";
```

Die Parallele ist exakt: Links eine Bedingung, rechts zwei Aeste. Der einzige Unterschied: Statt Werte vergleichen wir **Typen**.

---

## Hintergrund: Wie Conditional Types in TypeScript entstanden

Conditional Types wurden von Anders Hejlsberg in **TypeScript 2.8** (Februar 2018) eingefuehrt. Der zugehoerige RFC und die GitHub-Diskussion zeigen, dass das Feature auf echten Schmerzen in der Community basierte: Entwickler wollten typsichere Wrapper-Funktionen schreiben, deren Rueckgabetyp vom Eingabetyp abhing — aber das Typsystem bot keine Moeglichkeit.

Das konkrete Beispiel aus dem urspruenglichen RFC war `Promise.resolve()`:

> Wenn du `Promise.resolve(42)` aufrufst, bekommst du `Promise<number>`.
> Wenn du `Promise.resolve(Promise.resolve(42))` aufrufst, bekommst du... immer noch `Promise<number>`, weil Promises automatisch entpackt werden.

Um das korrekt zu typisieren, brauchst du: "Wenn T ein Promise ist, entpacke ihn — sonst nimm T direkt." Das ist `Awaited<T>` — und Awaited ist ohne Conditional Types unmoegliche zu schreiben.

Mit 2.8 oeffnete TypeScript die Tuer zu einem ganzen Kosmos von Typsystem-Moglichkeiten. Die Bibliothek `ts-toolbelt` (ueber 200 Utility Types) waere ohne Conditional Types nicht denkbar.

---

## Die Syntax im Detail

```typescript annotated
type IsString<T> = T extends string ? true : false;
//   ^^^^^^^^   ^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//   Name       | Das ist der Conditional Type
//   des Typs   |
//              T extends string  -> Bedingung: "Ist T ein Subtyp von string?"
//              ? true            -> Wenn ja: dieser Typ
//              : false           -> Wenn nein: dieser Typ
```

Der `extends`-Operator in Conditional Types bedeutet **"ist Subtyp von"** — nicht "erbt von" wie in Klassen. Das ist die mengentheoretische Definition: Wenn jeder Wert vom Typ T auch ein gueltiger Wert vom Typ U ist, dann gilt `T extends U`.

```typescript annotated
type A = IsString<string>;    // true  — string ist Subtyp von string
type B = IsString<"hello">;   // true  — "hello" (Literal) ist Subtyp von string
type C = IsString<number>;    // false — number ist kein Subtyp von string
type D = IsString<string | number>; // boolean — überraschend! (dazu in Sektion 3)
```

Die letzte Zeile ist eine Vorschau auf Distributive Conditional Types — das Verhalten bei Unions ist nicht intuitiv und Thema der dritten Sektion.

---

## Verschachtelte Conditional Types: Typ-Switches

In JavaScript und TypeScript kennst du `switch`-Anweisungen. Conditional Types koennen genauso verzweigen, indem man sie verschachtelt — wie ein If-else-if-Baum:

```typescript annotated
type TypeName<T> =
  T extends string    ? "string"    :  // 1. Pruefe ob T string ist
  T extends number    ? "number"    :  // 2. Pruefe ob T number ist
  T extends boolean   ? "boolean"   :  // 3. Pruefe ob T boolean ist
  T extends undefined ? "undefined" :  // 4. Pruefe ob T undefined ist
  T extends Function  ? "function"  :  // 5. Pruefe ob T eine Funktion ist
  "object";                            // 6. Sonst: muss ein Objekt sein

// TypeScript wertet von oben nach unten aus und nimmt den ersten Treffer:
type A = TypeName<string>;       // "string"
type B = TypeName<42>;           // "number"  (42 ist Literal-Subtyp von number)
type C = TypeName<() => void>;   // "function"
type D = TypeName<{ x: 1 }>;    // "object"
type E = TypeName<undefined>;    // "undefined"
```

Das ist fast identisch zu einem Laufzeit-`typeof`-Switch — nur auf der Typ-Ebene. TypeScript wertet die Aeste von oben nach unten aus und nimmt den ersten Treffer.

> **Erklaere dir selbst:** Was gibt `TypeName<string | number>` zurueck? Ist es `"string" | "number"`, oder etwas anderes? Denke nach, bevor du weiterliest.
> **Kernpunkte:** Unions werden distribuiert (jedes Member einzeln ausgewertet) | string → "string", number → "number" | Ergebnis: "string" | "number" | Das nennt sich Distribution und ist Thema der naechsten Sektionen

---

## Der fundamentale Unterschied zu Runtime-Checks

Ein haeufiger Gedankengang: "Conditional Types sind wie `typeof` — ich kann sie kombinieren!" Das stimmt nicht, und der Unterschied ist fundamental.

```typescript annotated
// Laufzeit-Check (typeof): prueft den WERT zur Laufzeit
function verarbeiteLaufzeit(x: unknown) {
  if (typeof x === "string") {
    // Hier weiss JS: x ist ein String
    return x.toUpperCase(); // funktioniert
  }
}

// Conditional Type: prueft den TYP zur Compile-Zeit
type Verarbeite<T> = T extends string ? string : number;
//                                               ^^^^^^
// Das ist nur ein Typ — kein Laufzeit-Verhalten!

// Diese Funktion sieht vernuenftig aus, kompiliert aber NICHT:
function verarbeiteTyp<T>(x: T): Verarbeite<T> {
  if (typeof x === "string") {
    return x.toUpperCase(); // Error: Type 'string' is not assignable to 'Verarbeite<T>'
    //                      TypeScript kann T durch Control Flow nicht narrowen!
  }
  return 0; // Error: Type 'number' is not assignable to 'Verarbeite<T>'
}
```

TypeScript kann Conditional Types **nicht durch Control Flow narrowen**. Das ist eine bewusste Design-Einschraenkung: Der Compiler kann nicht beweisen, dass `typeof x === "string"` impliziert dass `T extends string` im Conditional Type den true-Ast nimmt. Die Loesung dafuer sind Overloads oder Type-Assertions — aber das ist fortgeschrittenes Terrain.

> **Denkfrage:** Warum kann TypeScript innerhalb von `if (typeof x === "string")` nicht ableiten, dass `T` gleich `string` ist? Was waere noetig, damit das funktioniert?
>
> **Antwort:** Das Problem ist, dass `T` ein freier Typparameter ist — er koennte `string | number` sein, und der typeof-Check trifft nur auf einen Teil zu. TypeScript brauchte eine Moeglichkeit, den Typparameter zu "splitten", was es zu Conditional Types fuehren wuerde und einen exponentiell komplexen Typinferenz-Algorithmus erfordern wuerde. Anders Hejlsberg hat diese Grenze bewusst gezogen, um den Compiler einfach und schnell zu halten.

---

## Experiment: Conditional Types im Playground

> **Experiment:** Probiere folgendes im TypeScript Playground aus (playground.typescriptlang.org):
>
> ```typescript
> type Describe<T> =
>   T extends null | undefined ? "nullish" :
>   T extends string           ? "text" :
>   T extends number           ? "zahl" :
>   T extends boolean          ? "wahrheitswert" :
>   T extends any[]            ? "liste" :
>   "objekt";
>
> type A = Describe<null>;           // ?
> type B = Describe<undefined>;      // ?
> type C = Describe<string[]>;       // ?
> type D = Describe<{ x: 1 }>;      // ?
> type E = Describe<string | null>;  // ?
> ```
>
> Fahre mit der Maus ueber die Typ-Aliase um die aufgeloesten Typen zu sehen. Was passiert bei `string | null`? Ist das Ergebnis das, was du erwartet hattest?

---

## In deinem Angular-Projekt: Smart Service-Return-Types

Conditional Types leuchten auf, wenn du Angular-Services entwirfst, die je nach Eingabe verschiedene Daten liefern:

```typescript annotated
// Ein Service, der Ressourcen unterschiedlicher Typen laedt:
interface ResourceMap {
  user: User;
  product: Product;
  order: Order;
}

// Conditional Type: Rueckgabetyp haengt vom Key ab
type LoadResult<K extends string> =
  K extends keyof ResourceMap
    ? ResourceMap[K]        // Bekannte Ressource: konkreter Typ
    : Record<string, unknown>; // Unbekannte Ressource: generisches Objekt

// Der Service kann jetzt typsicher sein:
declare function loadResource<K extends string>(key: K): Promise<LoadResult<K>>;

const user = await loadResource("user");     // user: User
const product = await loadResource("product"); // product: Product
const unknown = await loadResource("xyz");    // unknown: Record<string, unknown>
```

Ohne Conditional Types muesste man Overloads fuer jede Ressource schreiben oder auf `any` zurueckgreifen. Mit Conditional Types bleibt der Code DRY und typsicher.

---

## Die eingebauten Conditional Types der Standardbibliothek

TypeScript liefert mehrere eingebaute Utility Types, die alle auf `extends` aufbauen. Du hast sie vielleicht schon benutzt — jetzt erkennst du, wie sie funktionieren:

```typescript annotated
// NonNullable<T> — entfernt null und undefined aus einem Typ:
type NonNullable<T> = T extends null | undefined ? never : T;
//                              ^^^^^^^^^^^^^^^^
//                              Wenn T null ODER undefined ist -> never
//                              Sonst -> T selbst (Pass-Through)

type A = NonNullable<string | null>;            // string
type B = NonNullable<string | null | undefined>; // string
type C = NonNullable<null>;                     // never

// Conditional<T, U, True, False> — das Grundmuster, das all diesen zugrunde liegt:
// true wenn T ein Subtyp von U ist, false sonst.
// Das Typsystem nutzt es ueberall implizit.
```

Und dann gibt es die Spezialisten — Typen die mit `infer` gebaut sind (naechste Sektion):

```typescript annotated
// ReturnType<T> — extrahiert den Rueckgabetyp einer Funktion:
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
//                                    ^
//                             infer R: "capture" den Rueckgabetyp

// Awaited<T> — loest Promises auf (vereinfacht):
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
//                                       ^
//                                 rekursiv! (mehr in Sektion 4)
```

Diese Typen aus der Standardbibliothek sind deine staerksten Verbundeten. Sie sparen dir viele manuelle Typ-Annotationen.

---

## Denkfrage

> **Denkfrage:** `TypeName<T>` gibt fuer `T = () => void` den Wert `"function"` zurueck. Aber Funktionen in JavaScript sind auch Objekte — sie haben Properties wie `name`, `length` und man kann `Object.keys()` auf ihnen aufrufen. Warum ergibt `TypeName<() => void>` trotzdem `"function"` und nicht `"object"`?
>
> **Antwort:** Weil die Reihenfolge in verschachtelten Conditionals entscheidend ist. `TypeName` prueft `T extends Function` **bevor** es `"object"` zurueckgibt. Da Funktionen ein Subtyp von `Function` sind, trifft der `"function"`-Ast zuerst. Das illustriert eine wichtige Eigenschaft verschachtelter Conditionals: Die **Reihenfolge der Pruefungen** bestimmt das Ergebnis — genau wie bei `if-else if`-Ketten.

---

## Wann Conditional Types einsetzen?

| Situation | Loesung |
|-----------|---------|
| Rueckgabetyp haengt vom Eingabetyp ab | `T extends X ? A : B` |
| Typ aus einem anderen Typ extrahieren | `infer` (naechste Sektion) |
| Union-Members filtern | Distributive Conditionals (Sektion 3) |
| Verschachtelte Strukturen aufloesen | Rekursion (Sektion 4) |
| Einfache Generics reichen | Keine Conditional Types noetig! |

Der letzte Punkt ist wichtig: Conditional Types sind maechtig, aber sie erhoehen die Komplexitaet. Frage dich immer: "Brauche ich das wirklich, oder reicht ein einfaches Generic?"

---

## Was du gelernt hast

- Conditional Types sind **Ternary-Operatoren fuer Typen**: `T extends U ? X : Y`
- `extends` in Conditional Types bedeutet "ist Subtyp von" (nicht Vererbung)
- Verschachtelte Conditional Types erzeugen **Typ-Switches** — von oben nach unten ausgewertet
- Conditional Types existieren **nur zur Compile-Zeit** — sie erzeugen keinen Laufzeit-Code
- TypeScript kann Conditional Types **nicht durch Control Flow narrowen** — das ist eine bekannte Einschraenkung
- Sie glaenzen wenn der **Rueckgabetyp vom Eingabetyp abhaengen** soll

**Kernkonzept:** `T extends U ? X : Y` ist ein Typ-Ausdruck, der zur Compile-Zeit ausgewertet wird — TypeScript waehlt X oder Y basierend darauf, ob T ein Subtyp von U ist. Das macht Bibliotheks-APIs moeglich, die je nach Eingabetyp verschiedene Ausgabetypen haben.

---

## Kurz-Referenz: Die wichtigsten Punkte auf einen Blick

| Konzept | Syntax | Bedeutung |
|---------|--------|-----------|
| Grundbedingung | `T extends U ? X : Y` | Wenn T Subtyp von U: X, sonst Y |
| Subtyp | `"hallo" extends string` | Literal-Typen sind Subtypen ihrer Basis |
| Verschachtelt | `T extends A ? X : T extends B ? Y : Z` | If-else-if-Kette |
| Compile-Zeit | — | Kein Laufzeit-Code, kein Control-Flow-Narrowing |
| Einsatz | Rueckgabetyp-Abhaengigkeit | Wenn Output-Typ vom Input-Typ abhaengen soll |

---

> **Pausenpunkt** — Du hast die Grundlage verstanden. Conditional Types sind jetzt kein Mysterium mehr, sondern ein logisches Werkzeug. Mache eine kurze Pause, bevor du zum maechtigen `infer`-Keyword weitergehst.
>
> Weiter geht es mit: [Sektion 02: Das infer-Keyword](./02-infer-keyword.md)
