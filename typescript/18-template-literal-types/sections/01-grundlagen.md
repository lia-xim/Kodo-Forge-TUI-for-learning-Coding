# Sektion 1: Template Literal Types — Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start der Lektion)
> Naechste Sektion: [02 - String Utility Types](./02-utility-types.md)

---

## Was du hier lernst

- Wie Template Literal Types die Syntax von JavaScript Template Literals auf die **Typ-Ebene** heben
- Warum dieses Feature in TypeScript 4.1 (November 2020) als **Game Changer** bezeichnet wurde
- Wie Union Types in Template Literals zu einem **kartesischen Produkt** expandiert werden
- Wo der entscheidende Unterschied zwischen Laufzeit-Strings und Typ-Level-Strings liegt

---

## Die Hintergrundgeschichte: TypeScript 4.1 und ein neues Denken

Im November 2020 erschien TypeScript 4.1. Das Release-Dokument hatte einen unremarkabel klingenden Eintrag: "Template Literal Types". Innerhalb weniger Tage explodierte die TypeScript-Community — die Diskussionen auf Twitter und GitHub waren voll mit Ausrufen wie "Das ist unmoeglich!" und "Wie funktioniert das uberhaupt?"

Der Grund: Entwickler realisierten, dass man jetzt **String-Patterns als Typen** beschreiben konnte. Nicht nur "dieser Wert ist ein String" — sondern "dieser Wert ist ein String der mit `on` beginnt, gefolgt von einem gross geschriebenen Buchstaben, gefolgt von beliebigen Zeichen". Solche Praezision war vorher nicht moeglich.

Was steckte dahinter? Das TypeScript-Team, angefuehrt von Anders Hejlsberg, hatte schon laenger an der Idee gearbeitet, Conditional Types (eingefuehrt in TS 2.8) zu erweitern. Der entscheidende Durchbruch war die Erkenntnis: Wenn man Template Literals aus JavaScript auf die Typ-Ebene hebt, gewinnt man ein vollstaendiges String-Verarbeitungssystem — **zur Compilezeit**, nicht zur Laufzeit.

Das heisst: Der Compiler kann pruefen, ob ein String das richtige Format hat, ohne einen einzigen Zeichen jemals wirklich zu vergleichen. Er arbeitet nur mit dem **Typ des Strings** — und das aendert alles.

---

## Das Grundprinzip: Typen statt Werte

Du kennst Template Literals aus JavaScript:

```javascript
const name = "Welt";
const greeting = `Hallo, ${name}!`; // Laufzeit: "Hallo, Welt!"
```

Template Literal Types sehen fast identisch aus — aber sie operieren auf **Typen**, nicht auf Werten:

```typescript annotated
type Greeting = `Hallo, ${string}!`;
//   ^^^^^^^^^                        // Ein Typ, kein Wert
//             ^^^^^^^^^^^^^^^^       // Template Literal Syntax mit `
//                      ^^^^^^^^      // ${string} = jeder beliebige string-Typ

const a: Greeting = "Hallo, Welt!";   // OK — passt zum Muster
const b: Greeting = "Hallo, Max!";    // OK — passt zum Muster
const c: Greeting = "Hallo, !";       // OK — leerer string ist auch string
const d: Greeting = "Hi, Welt!";      // FEHLER! Beginnt nicht mit "Hallo, "
const e: Greeting = "Hallo, Welt";    // FEHLER! Endet nicht mit "!"
```

Der Typ `Greeting` beschreibt **unendlich viele moegliche Strings** — alles was mit `"Hallo, "` beginnt und mit `"!"` endet. TypeScript prueft zur Compilezeit, ob ein Wert dieses Muster erfuellt.

> **Erklaere dir selbst:** Was ist der Unterschied zwischen `type Greeting = string` und `type Greeting = \`Hallo, ${string}!\``? Was kann TypeScript im zweiten Fall pruefen, was im ersten nicht moeglich ist?
>
> **Kernpunkte:** `string` akzeptiert jeden beliebigen String — kein Muster erzwingbar. Das Template Literal beschreibt ein exaktes Format. TypeScript prueft Anfang und Ende des Strings. Man verliert Flexibilitaet, gewinnt Praezision.

---

## Union Types und das kartesische Produkt

Hier wird es richtig interessant. Was passiert, wenn du anstatt `string` eine **Union** in das Template einsetzt?

```typescript
type Prefix = "get" | "set";
type Name = "Name" | "Age";

type Methods = `${Prefix}${Name}`;
```

TypeScript expandiert das **automatisch** zu allen moeglichen Kombinationen:

```
"get" x "Name" = "getName"
"get" x "Age"  = "getAge"
"set" x "Name" = "setName"
"set" x "Age"  = "setAge"
```

Das Ergebnis ist `"getName" | "getAge" | "setName" | "setAge"` — das **kartesische Produkt** der beiden Unions.

In der Mathematik ist das kartesische Produkt A × B die Menge aller geordneten Paare (a, b). TypeScript macht dasselbe mit Strings: es kombiniert jeden Wert aus der linken Union mit jedem Wert aus der rechten.

```typescript annotated
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ // 4 moegliche Werte
type ApiPath = "/users" | "/products";
//             ^^^^^^^^^^^^^^^^^^^^^^^^^uu // 2 moegliche Werte

type Endpoint = `${HttpMethod} ${ApiPath}`;
//  4 Methoden × 2 Pfade = 8 moegliche Strings
//  "GET /users" | "GET /products" | "POST /users" | "POST /products" | ...
//  | "PUT /users" | "PUT /products" | "DELETE /users" | "DELETE /products"

function callApi(endpoint: Endpoint) {
  // endpoint kann NUR einer der 8 gueltigen Werte sein
  // Zur Compilezeit geprueft — kein Laufzeit-Overhead!
  console.log(`Calling: ${endpoint}`);
}

callApi("GET /users");       // OK
callApi("DELETE /products"); // OK
callApi("FETCH /users");     // FEHLER! "FETCH" ist keine gueltige Methode
callApi("GET /comments");    // FEHLER! "/comments" ist kein gueltiger Pfad
```

> **Denkfrage:** Wenn du 3 Unions mit jeweils 5, 4 und 3 Elementen kombinierst, wie viele Typen entstehen im Ergebnis? Und ab welcher Groesse koennte das zum Problem werden?
>
> **Antwort:** 5 × 4 × 3 = 60 Kombinationen — noch ueberschaubar. Bei sehr grossen Unions (z.B. alle CSS-Properties × alle CSS-Einheiten × alle moeglichen Zahlen) kann der Compiler langsam werden oder sogar mit "Type instantiation is excessively deep" abbrechen. Das ist eine der echten Grenzen dieses Features — mehr dazu in Sektion 5.

---

## String-Muster als Constraints

Manchmal moechtest du nicht alle moeglichen Werte aufzaehlen, sondern nur ein **Format** vorschreiben. Dazu verwendest du primitive Typen wie `string` oder `number` innerhalb des Templates:

```typescript annotated
type CssProperty = `${string}-${string}`;
//                  ^^^^^^^^   ^^^^^^^^
//                  |          |
//                  |          Suffix: beliebiger String
//                  Prefix: beliebiger String
//                          Es MUSS ein Bindestrich dazwischen liegen

function setCssProperty(prop: CssProperty, value: string): void {
  document.documentElement.style.setProperty(`--${prop}`, value);
}

setCssProperty("background-color", "red");  // OK
setCssProperty("font-size", "16px");        // OK
setCssProperty("border-radius", "8px");     // OK
// setCssProperty("color", "red");          // FEHLER! Kein Bindestrich
// setCssProperty("-", "red");              // FEHLER! Leere Teile erlaubt? Nein, string = mind. 1 Zeichen? Achtung: string schliesst AUCH leere Strings ein!
```

> **Achtung — Fallstrick:** `${string}` bedeutet **jeder String**, einschliesslich des leeren Strings `""`. Deshalb wuerde `"-"` tatsaechlich durch den Typ `CssProperty` erlaubt sein (Prefix = `""`, Suffix = `""`). Wenn du wirklich nicht-leere Teile erzwingen willst, musst du cleverer werden — z.B. mit `${string}${string}-${string}` oder mit Conditional Types. Das ist eine der Grenzen, die wir in Sektion 5 genauer betrachten.

---

> **Experiment:** Probiere folgendes im TypeScript Playground aus (typescriptlang.org/play):
>
> ```typescript
> type Color = "red" | "green" | "blue";
> type Size = "small" | "medium" | "large";
>
> type ButtonVariant = `${Color}-${Size}`;
>
> // Hovere ueber ButtonVariant — wie viele Varianten gibt es?
> const btn: ButtonVariant = "red-small";    // OK
> const btn2: ButtonVariant = "green-large"; // OK
> const btn3: ButtonVariant = "yellow-small"; // Fehler?
> ```
>
> Aendere dann `Color` zu einer Union mit 4 Elementen und `Size` zu einer mit 4 Elementen. Was aendert sich an der Anzahl der moeglichen Werte? Wie verhalt sich der Compiler mit sehr grossen Unions?

---

## Der Unterschied zu Laufzeit-Strings

Ein wichtiger Punkt: Template Literal Types existieren — wie alle TypeScript-Typen — **nur zur Compilezeit**. Zur Laufzeit sind es ganz normale Strings, ohne jedes Muster:

```typescript annotated
// Compilezeit: TypeScript prueft das Muster
type ApiRoute = `/${string}`;

function fetchData(route: ApiRoute) {
  // Laufzeit: 'route' ist einfach ein string — kein Muster mehr vorhanden
  return fetch(route); // JavaScript weiss nichts vom Typ ApiRoute
}

fetchData("/users");    // OK — TypeScript geprueft, dann Typ vergessen
fetchData("/products"); // OK

// Aber:
// fetchData("users");  // TypeScript-Fehler — BEVOR der Code laeuft
//                       // Zur Laufzeit wuerde es aber funktionieren!
```

Das ist das fundamentale Denkmodell: TypeScript prueft, JavaScript fuehrt aus. Der Typ `ApiRoute` ist ein Versprechen an den Compiler — kein Schutz zur Laufzeit.

**In deinem Angular-Projekt:** Wenn du Angular-Router-Pfade typisierst, ist das exakt dieses Muster. Angular selbst kennt zur Laufzeit nur Strings — aber TypeScript kann zur Entwicklungszeit sicherstellen, dass alle Router-Links das richtige Format haben.

```typescript
// Angular Router — typsichere Pfade
type AppRoute = `/users/${number}` | "/users" | "/dashboard" | "/settings";

@Component({...})
export class NavComponent {
  navigateTo(route: AppRoute): void {
    this.router.navigate([route]);
    // Nur gueltiger Routes erlaubt — Tippfehler werden sofort gemeldet!
  }
}
```

---

## Zusammenfassung: Template Literal Types im Ueberblick

Bevor wir weitergehen — eine Tabelle mit den Grundbausteinen, die wir gesehen haben:

| Syntax | Bedeutung | Beispiel |
|---|---|---|
| `` `Hallo, ${string}!` `` | String mit beliebigem Mittelteil | `"Hallo, Welt!"`, `"Hallo, Max!"` |
| `` `${A}${B}` `` mit Unions | Kartesisches Produkt | `"getUser"`, `"setUser"`, ... |
| `` `/${string}` `` | String muss mit `/` beginnen | URL-Pfade |
| `` `${number}px` `` | Zahl gefolgt von `px` | `"16px"`, `"100px"` |
| `` `${A} ${B}` `` | Zwei Teile mit Leerzeichen | `"GET /users"` |

Das sind die Grundbausteine. In den naechsten Sektionen kommen zwei weitere dazu: **String-Utilities** (Uppercase, Capitalize etc.) und **infer** fuer String-Parsing.

---

## Ein letzter Blick: Template Literals und Conditional Types

Template Literal Types koennen auch als **Constraint in Conditional Types** verwendet werden. Das verbindet zwei maeechtige Features zu einem:

```typescript annotated
type IsGetterName<T extends string> =
  T extends `get${string}` ? true : false;
//           ^^^^^^^^^^^
//           T muss mit "get" beginnen, dann kommt beliebiges

type A = IsGetterName<"getName">;   // true
type B = IsGetterName<"setName">;   // false
type C = IsGetterName<"getValue">;  // true
type D = IsGetterName<"get">;       // true — auch "get" allein beginnt mit "get"

// Nuetzlich um nur bestimmte Keys aus einem Interface zu filtern:
type OnlyGetters<T> = {
  [K in keyof T as IsGetterName<K & string> extends true ? K : never]: T[K];
};

interface ApiClient {
  getName(): string;
  setName(v: string): void;
  getAge(): number;
  setAge(v: number): void;
}

type Getters = OnlyGetters<ApiClient>;
// {
//   getName: () => string;
//   getAge:  () => number;
// }
// setName und setAge sind herausgefiltert!
```

Hier sieht man, wie sich die Konzepte aus den letzten Lektionen zusammenfuegen: Mapped Types (L16), Conditional Types (L17) und Template Literal Types arbeiten gemeinsam. Das ist der Punkt, an dem das TypeScript-Typsystem seine volle Ausdrueckskraft entfaltet.

---

## Was du gelernt hast

- Template Literal Types heben die Template-Literal-Syntax aus JavaScript auf die **Typ-Ebene** — sie beschreiben String-Muster, keine Werte
- Unions in Template Literals werden **distributiv** expandiert: `"get" | "set"` × `"Name" | "Age"` ergibt 4 Kombinationen (kartesisches Produkt)
- `${string}` als Platzhalter erzwingt ein **Format** ohne alle Werte aufzaehlen zu muessen — aber Vorsicht: `string` schliesst auch leere Strings ein
- Template Literal Types koennen als Constraints in Conditional Types verwendet werden — das verbindet die Konzepte aus L16, L17 und L18
- Wie alle TypeScript-Typen existieren Template Literal Types nur zur **Compilezeit** — zur Laufzeit sind es normale JavaScript-Strings

> **Erklaere dir selbst:** Du hast `type Endpoint = \`${HttpMethod} ${ApiPath}\`` gesehen. Warum expandiert TypeScript das zu einer Union, statt einen einzigen Typ mit zwei "Slots" zu behalten? Was ist der Vorteil dieser Expansion?
>
> **Kernpunkte:** TypeScript arbeitet intern mit Mengen von konkreten Werten | Union Types sind das fundamentale Modell | Expansion ermoeglicht exakte Pruefung | Der Compiler kann jeden Wert direkt vergleichen ohne zur Laufzeit einen String zu parsen

**Kernkonzept zum Merken:** Template Literal Types sind kein Laufzeit-Feature — sie sind ein Compiler-Feature. Du beschreibst dem TypeScript-Compiler ein erlaubtes String-Format, und er prueft alle Verwendungen dieses Typs statisch. Das ist der Unterschied zwischen "es koennte funktionieren" und "es funktioniert garantiert".

---

> **Pausenpunkt** — Das Grundprinzip sitzt. Nimm dir einen Moment, um das kartesische Produkt an einem eigenen Beispiel durchzuspielen. Welche drei Unions wuerdest du in deinem aktuellen Projekt sinnvoll kombinieren koennen?
>
> Weiter geht es mit: [Sektion 02: String Utility Types](./02-utility-types.md)
