# Sektion 5: Praxis-Patterns und Grenzen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Typsichere Event-Systeme](./04-event-names.md)

---

## Was du hier lernst

- Vier konkrete Praxis-Patterns: CSS-Properties, Route-Parameter, i18n-Keys und SQL-Spalten
- Wie echte Bibliotheken (tRPC, Prisma, react-hook-form) Template Literal Types nutzen
- Die echten Grenzen dieses Features: wo es zu langsam, zu komplex oder schlicht ungeeignet wird
- Wann du **nicht** Template Literal Types verwenden solltest

---

## Die Hintergrundgeschichte: Von der Idee zur Bibliothek

Als TypeScript 4.1 erschien, dauerte es keine sechs Monate, bis Template Literal Types in den grossen Open-Source-Bibliotheken ankamen. Der Grund: Sie loesten ein fundamentales Problem, das Designer von Typ-sicheren APIs jahrelang umgangen hatten.

Das deutlichste Beispiel ist **tRPC** (TypeScript Remote Procedure Call). tRPC erlaubt es, Backend-Funktionen direkt aus dem Frontend aufzurufen — mit vollstaendiger Typsicherheit, ohne Code-Generierung. Der Name einer Prozedur auf dem Server ist ein String; tRPC macht daraus einen typsicheren Aufruf auf dem Client. Template Literal Types sind ein zentrales Werkzeug dabei.

Aehnlich bei **Prisma**: Das ORM generiert aus deinem Datenbankschema einen vollstaendig typisierten Client. Abfragen wie `prisma.user.findMany({ where: { name: { contains: "Max" } } })` sind typsicher bis auf die einzelne Spalte — das waere ohne Template Literal Types nicht so elegant moeglich.

Das ist der Kontext fuer die Pattern, die wir jetzt betrachten: Sie sind nicht akademisch, sondern entstammen echter Produktions-Software.

---

## Pattern 1: CSS-Property-Typen

TypeScript kann sicherstellen, dass CSS-Werte das richtige Format haben:

```typescript annotated
type CssUnit = "px" | "em" | "rem" | "%" | "vh" | "vw";
type CssLength = `${number}${CssUnit}`;
//               ^^^^^^^^^  ^^^^^^^^
//               Eine Zahl  Gefolgt von einer gueltigen Einheit

type CssColor =
  | `#${string}`                                    // Hex: #ff0000
  | `rgb(${number}, ${number}, ${number})`          // RGB: rgb(255, 0, 0)
  | `rgba(${number}, ${number}, ${number}, ${number})` // RGBA mit Alpha
  | "transparent" | "inherit" | "currentColor";    // Schluesselbegriffe

function setStyle(property: string, value: CssLength | CssColor): void {
  document.documentElement.style.setProperty(property, value);
}

setStyle("--spacing", "8px");          // OK
setStyle("--margin", "2rem");          // OK
setStyle("--primary", "#3490dc");      // OK
setStyle("--bg", "rgb(255, 255, 255)");// OK
// setStyle("--size", "100");          // FEHLER! Einheit fehlt
// setStyle("--color", "blue");        // FEHLER! "blue" ist kein gueltiger Wert
```

**Wichtige Einschraenkung:** `${number}` erlaubt alle JavaScript-Zahlen — auch `Infinity`, `NaN`, und negative Zahlen wie `-8`. CSS-Werte sind nicht immer nicht-negativ. Template Literal Types koennen das nicht weiter einschraenken; hier braucht man Laufzeit-Validierung als zweite Verteidigungslinie.

---

> **Experiment:** Probiere folgendes im TypeScript Playground:
>
> ```typescript
> type GridTemplate = `repeat(${number}, ${number}fr)`;
>
> const a: GridTemplate = "repeat(3, 1fr)";   // OK?
> const b: GridTemplate = "repeat(0, 2fr)";   // OK? (0 Spalten sinnlos, aber TypeScript?)
> const c: GridTemplate = "repeat(3, auto)";  // Fehler? (auto ist kein number)
>
> // Jetzt mit string statt number:
> type FlexibleGrid = `repeat(${number | "auto-fill" | "auto-fit"}, ${number}fr)`;
> const d: FlexibleGrid = "repeat(auto-fill, 1fr)"; // OK?
> const e: FlexibleGrid = "repeat(3, 1fr)";         // OK?
> ```
>
> Beachte wie `number` und String-Literale in Templates kombiniert werden koennen. Was passiert wenn du versuchst, `0.5fr` zu verwenden?

---

## Pattern 2: Route-Parameter-Extraktion

Frameworks wie Express und Angular Router verwenden `:param` fuer URL-Parameter. Template Literal Types koennen diese Parameter extrahieren:

```typescript annotated
// Rekursive Extraktion aller Parameter aus einem Route-Muster:
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
  //         ^^^^^^^^^^^                              // Alles vor dem Parameter
  //                    ^^^^^^^^^^^                  // Der Parameter-Name
  //                               ^^^^^^^^^^^^      // Alles danach (rekursiv)
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params1 = ExtractParams<"/users/:userId">;
// "userId"
type Params2 = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"
type Params3 = ExtractParams<"/dashboard">;
// never — keine Parameter

// Typsicherer Route-Handler:
type RouteHandler<Path extends string> = (
  params: Record<ExtractParams<Path>, string>,
  //       ^^^^^^                               // Alle extrahierten Parameter als Keys
  query: Record<string, string>
) => Response;

// Verwendung:
function createRoute<P extends string>(
  path: P,
  handler: RouteHandler<P>
): void { /* ... */ }

createRoute("/users/:userId/posts/:postId", (params) => {
  console.log(params.userId);   // OK — TypeScript weiss: existiert
  console.log(params.postId);   // OK — TypeScript weiss: existiert
  // console.log(params.id);    // FEHLER! "id" ist kein extrahierter Parameter
  return new Response("OK");
});
```

**In Angular:** Der Angular Router verwendet zwar keine Template Literal Types intern (er wurde vor TypeScript 4.1 entworfen), aber man kann typsichere Router-Definitionen selbst bauen:

```typescript
type AppRoutes = "/dashboard" | "/users/:id" | "/users/:id/edit";

// Typsicheres navigate:
function navigate<R extends AppRoutes>(
  route: R,
  params: Record<ExtractParams<R>, string>
): void {
  // Ersetze :param durch den echten Wert
  let url: string = route;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  window.location.href = url;
}

navigate("/users/:id", { id: "42" });           // OK
// navigate("/users/:id", { userId: "42" });    // FEHLER! "userId" != "id"
// navigate("/dashboard", { id: "42" });        // FEHLER! dashboard hat keine params
```

---

## Pattern 3: i18n Translation Keys

Mehrsprachigkeit erfordert eindeutige Schluesselnamen in einer Hierarchie. Template Literal Types koennen die erlaubte Struktur erzwingen:

```typescript annotated
// Erlaube nur Keys die einem Namespace-Muster folgen:
type TranslationKey =
  | `nav.${string}`                   // Navigation: nav.home, nav.settings, ...
  | `page.${string}.title`            // Seitentitel: page.about.title, ...
  | `page.${string}.description`      // Seitenbeschreibung
  | `error.${number}`                 // Fehler: error.404, error.500, ...
  | `validation.${string}`;           // Validierung: validation.required, ...

function t(key: TranslationKey): string {
  return i18nCatalog[key] ?? key; // Fallback: Key selbst anzeigen
}

t("nav.home");                   // OK
t("page.about.title");           // OK
t("error.404");                  // OK — number erlaubt
t("validation.required");        // OK
// t("footer.copyright");        // FEHLER! "footer" ist kein gueltiger Namespace
// t("page.about");               // FEHLER! Titel oder Beschreibung fehlt
```

**Denkfrage:** Was ist der Nachteil dieses Ansatzes gegenueber einer Typ-generierten Loesung (z.B. aus einer JSON-Datei)?
Der `TranslationKey` mit `${string}`-Platzhaltern ist **zu permissiv** — er erlaubt `nav.beliebiger-unsinn`, auch wenn dieser Schlussel in der Uebersetzungsdatei gar nicht existiert. Eine generierte Loesung wuerde nur die tatsaechlich vorhandenen Schluessel erlauben. Das ist einer der echten Kompromisse bei Template Literal Types.

---

## Pattern 4: Qualifizierte Spaltennamen

Fuer typsichere SQL-Abfragen — oder jedes System mit Tabellen und Spalten:

```typescript annotated
type Table = "users" | "products" | "orders";

// Spalten pro Tabelle (Conditional Types + Template Literals):
type Column<T extends Table> =
  T extends "users"    ? "id" | "name" | "email" | "created_at" :
  T extends "products" ? "id" | "name" | "price" | "stock" :
  T extends "orders"   ? "id" | "userId" | "total" | "status" :
  never;

// Qualifizierter Spaltenname: "tabelle.spalte"
type QualifiedColumn<T extends Table> = `${T}.${Column<T>}`;

type UserColumns    = QualifiedColumn<"users">;
// "users.id" | "users.name" | "users.email" | "users.created_at"

type AllColumns = QualifiedColumn<Table>;
// Alle gueltigen Tabelle.Spalte Kombinationen

// Typsichere SELECT-Funktion:
function select(columns: Array<QualifiedColumn<Table>>): void {
  const sql = `SELECT ${columns.join(", ")} FROM ...`;
  console.log(sql);
}

select(["users.name", "orders.total", "products.price"]); // OK
// select(["users.password"]);   // FEHLER! "password" ist keine gueltige Spalte
// select(["users.stock"]);      // FEHLER! "stock" gehoert zu products, nicht users
```

---

## Die echten Grenzen — wann Template Literal Types nicht helfen

Nach vier positiven Beispielen ist Ehrlichkeit angebracht. Template Literal Types haben echte Grenzen:

**Grenze 1: Performance bei grossen Unions**

```typescript
// Das kann den Compiler verlangsamen oder zum Absturz bringen:
type AllCssProperties = "width" | "height" | "margin" | /* ... 300 weitere */ | "z-index";
type AllCssValues = `${number}px` | `${number}em` | /* ... */;

// type AllCombinations = `${AllCssProperties}: ${AllCssValues}`;
// VORSICHT: 300 × 500 = 150.000 Kombinationen — der Compiler wird sehr langsam
```

**Grenze 2: number-Literale sind unbegrenzt**

```typescript
type PositiveInt = ??? // Kann TypeScript nicht ausdruecken
// ${number} erlaubt -1, 0, 3.14, Infinity, NaN
// Es gibt keinen Weg, "nur positive ganze Zahlen" im Typ zu erzwingen
```

**Grenze 3: Komplexe Regex-Muster**

```typescript
// Das kann Template Literal Types NICHT:
type ValidEmail = ???  // email@domain.tld — zu komplex fuer Template Literals
type ValidUrl = ???    // https://... mit optionalen Teilen

// Fuer echte Validierung: Laufzeit-Pruefung (zod, yup, Regex)
```

**Grenze 4: Semantische Korrektheit**

```typescript
// Template Literal Types pruefen Struktur, nicht Semantik:
type HexColor = `#${string}`;

const a: HexColor = "#ff0000"; // OK — korrekte Hex-Farbe
const b: HexColor = "#xyz";    // OK fuer TypeScript! Kein gueltiger Hex-Wert!
const c: HexColor = "#";       // OK fuer TypeScript! Aber leeres Hex ist ungueltig
```

> **Erklaere dir selbst:** Erklaere die Unterscheidung zwischen "struktureller Korrektheit" (was TypeScript pruefen kann) und "semantischer Korrektheit" (was TypeScript nicht pruefen kann). Welche Konsequenz hat das fuer dein Design-Entscheidungen?
>
> **Kernpunkte:** Struktur = Format des Strings (beginnt mit #, hat Bindestrich, endet mit px). Semantik = Bedeutung (ist ein gueltiger Hex-Wert, ist eine reale URL). TypeScript kann nur Struktur pruefen. Semantische Validierung muss zur Laufzeit mit echtem Code erfolgen (zod, Regex, manuell). Beides zusammen gibt die hoechste Sicherheit.

---

## Wie echte Bibliotheken das nutzen

Zur Orientierung: So setzen professionelle Bibliotheken Template Literal Types ein:

```typescript
// tRPC (vereinfacht): Prozedurnamen als Template Literals
type RouterProcedure = `${string}.${string}`;
// "user.getById" | "post.create" | ...

// Prisma (vereinfacht): Feldnamen fuer orderBy
type OrderByField<T> = `${keyof T & string}${"Asc" | "Desc"}`;
// "nameAsc" | "nameDesc" | "createdAtAsc" | ...

// react-hook-form (vereinfacht): Typsichere Feldnamen
type FieldPath<T> = DotPath<T>; // Das kennen wir aus Sektion 3!

// Zod (anders!): Zod verzichtet auf Template Literals und nutzt Runtime-Validierung
// Das ist bewusst — Zod validiert zur Laufzeit, nicht nur zur Compilezeit
```

**In React:** React selbst nutzt Template Literal Types fuer Event-Props. Die `DOMAttributes<T>` in `@types/react` verwendet das `on${Capitalize<EventName>}` Pattern:

```typescript
// Was React intern tut (vereinfacht aus @types/react):
type ReactEventHandlers = {
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onChange?: (event: React.ChangeEvent) => void;
  // ... alle anderen Event-Handler
};

// Du hast jetzt das Werkzeug, das zu verstehen — und selbst nachzubauen
```

---

## Was du gelernt hast

- CSS-Property-Typen: `\`${number}${CssUnit}\`` erzwingt Einheiten, ist aber permissiv bei Werten (kein Schutz vor negativen Zahlen oder NaN)
- Route-Parameter-Extraktion: `ExtractParams<Path>` macht Router-Params typsicher — jetzt erklaerst du dir selbst, warum `params.id` bei `/users/:id` funktioniert
- i18n-Keys und SQL-Spalten: Template Literals als Namespace-Erzwingung — nuetzlich, aber bei `${string}` zu permissiv fuer echte Produktion
- Die echten Grenzen: Performance bei grossen Unions, keine semantische Validierung, keine Constraints fuer Zahlen jenseits des Typs `number`

> **Erklaere dir selbst:** Du hast vier Praxis-Patterns gesehen. In welchem Fall wuerdest du Template Literal Types NICHT verwenden und stattdessen Laufzeit-Validierung waehlen? Was ist das entscheidende Kriterium?
>
> **Kernpunkte:** Template Literal Types fuer Entwicklungszeit-Fehler (Tippfehler, falsche Namen). Laufzeit-Validierung fuer externe Daten (APIs, Benutzereingaben). Wenn die Daten aus einer unbekannten Quelle kommen, hilft TypeScript nicht — zod, Regex oder manueller Code sind notwendig. Beide Ebenen kombinieren = maximale Sicherheit.

**Kernkonzept zum Merken:** Template Literal Types sind ein Werkzeug fuer **Compilezeit-Sicherheit bei String-Formaten**. Sie glaenzen bei internen APIs, Konfiguration und Konventionen (Event-Namen, Route-Parameter, Methoden-Namen). Bei externen Daten, komplexen Formaten oder semantischer Korrektheit sind sie zu schwach — dort braucht man Laufzeit-Validierung als Partner.

---

> **Pausenpunkt** — Ende der Lektion. Du beherrschst jetzt Template Literal Types von der einfachen Konkatenation ueber String-Parser bis hin zu typsicheren Event-Systemen und Praxis-Patterns. Das ist einer der fortgeschrittensten Mechanismen im TypeScript-Typsystem.
>
> Nimm dir einen Moment: Welches der fuenf Pattern aus dieser Lektion koennte du direkt in deinem aktuellen Projekt einsetzen? Event-Namen? Route-Parameter? CSS-Typen? Das ist der beste Weg, das Gelernte zu verankern.
>
> **Naechste Lektion:** [19 - Modules & Declarations](../../19-modules-und-declarations/README.md)
