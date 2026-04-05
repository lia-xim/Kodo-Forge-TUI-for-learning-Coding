# Sektion 5: Praxis-Patterns — Conditional Types in echtem Code

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Rekursive Conditional Types](./04-rekursive-conditional.md)

---

## Was du hier lernst

- Wie man Conditional Types mit Mapped Types kombiniert (das maechtiste Muster)
- Typ-sichere API-Antworten und Event-Handler
- Wann Conditional Types zu weit gehen — und wie man Grenzen zieht
- Performance-Ueberlegungen und wann der Compiler klagt
- Eine Zusammenschau aller Konzepte aus dieser Lektion

---

## Von Theorie zu Praxis

Die vorigen Sektionen haben die Mechanik erklaert. Diese Sektion zeigt die Patterns, die in echten Projekten immer wieder auftauchen. Drei Kernfragen geleiten uns:

1. Wie kombiniere ich Conditional Types mit anderen Typsystem-Features?
2. Wo zieht man die Grenze zwischen nuetzlicher Typsicherheit und ueberkompliziertem Code?
3. Was passiert, wenn TypeScript selbst ins Schwitzen kommt?

---

## Hintergrund: TypeScript als Turing-vollstaendiges Typsystem

Ein uebueberraschender Fakt: Das TypeScript-Typsystem (mit Conditional Types, Mapped Types und Template Literals) ist **Turing-vollstaendig**. Das bedeutet: Jede berechenbare Funktion kann theoretisch auf Typ-Ebene implementiert werden.

Das wurde 2019 von der Community bewiesen. Entwickler implementierten Fibonacci-Zahlen, Brainf*** Interpreter und sogar einen einfachen Lambda-Kalkuel auf Typ-Ebene — nur mit TypeScript-Typen, ohne ein einziges Byte Laufzeit-Code.

Das ist ein zweischneidiges Schwert. Einerseits zeigt es die Maechtigkeit des Systems. Andererseits warnt es: "Nur weil du *kannst*, musst du nicht." Typen die Fibonacci berechnen, werden nie in einem echten Projekt gebraucht. Das Ziel ist **Produktivitaet und Fehlerverhinderung** — nicht typsystemtheoretische Virtuositaet.

Die Grenze zu ziehen ist eine Professionalitaetsfrage. Dieser Abschnitt hilft dir, sie zu ziehen.

---

## Pattern 1: Conditional Types mit Mapped Types kombinieren

Das maechtigste Muster in TypeScript-Utility-Types ist die Kombination von Conditional Types mit Mapped Types. Der Schluessel: **`as`-Klausel in Mapped Types**.

```typescript annotated
// Nur Methoden aus einem Interface extrahieren:
type Methods<T> = {
  [K in keyof T
    as T[K] extends Function ? K : never  // <- Conditional im Key-Mapping
  ]: T[K];
//                               ^^^^^^^
//  as X: der Key wird zu X umbenannt. never-Keys werden aus dem Typ entfernt!
};

// Nur Daten-Properties (keine Methoden):
type Data<T> = {
  [K in keyof T
    as T[K] extends Function ? never : K  // <- Umgekehrte Logik
  ]: T[K];
};

// Ein reales Service-Interface:
interface UserService {
  id: string;
  name: string;
  email: string;
  lastLogin: Date;
  save(): Promise<void>;
  validate(): boolean;
  delete(): Promise<void>;
}

type ServiceMethods = Methods<UserService>;
// { save: () => Promise<void>; validate: () => boolean; delete: () => Promise<void> }

type ServiceData = Data<UserService>;
// { id: string; name: string; email: string; lastLogin: Date }
```

Die `as T[K] extends Function ? K : never`-Klausel ist elegant: `never`-Keys werden automatisch aus dem resultierenden Typ entfernt — sie "verschwinden".

---

## Pattern 2: Smart Return Types

Manchmal moechtest du, dass der Rueckgabetyp einer Funktion vom **Laufzeit-Wert** des Arguments abhaengt — nicht nur vom Typ. Mit Overloads und Conditional Types geht das:

```typescript annotated
// Conditional Type definiert die Logik:
type ParseResult<T extends string> =
  T extends `${number}` ? number :    // Sieht wie eine Zahl aus?
  T extends "true" | "false" ? boolean : // Sieht wie ein Boolean aus?
  string;                               // Sonst: bleibt string

// Funktion mit Overloads fuer Typ-Narrowing:
function parse<T extends string>(input: T): ParseResult<T>;
function parse(input: string): number | boolean | string {
  if (input === "true") return true;
  if (input === "false") return false;
  const num = Number(input);
  if (!isNaN(num)) return num;
  return input;
}

// TypeScript leitet den Rueckgabetyp korrekt ab:
const a = parse("42");      // number
const b = parse("true");    // boolean
const c = parse("hello");   // string
const d = parse("3.14");    // number

// TypeScript weiss es genau:
a.toFixed(2);   // OK — a ist number
b.valueOf();    // OK — b ist boolean
c.toUpperCase(); // OK — c ist string
```

---

## Pattern 3: API-Response-Typen typsicher unwrappen

In echten Projekten haben API-Responses oft eine Wrapper-Struktur. Mit `infer` kann man den Payload-Typ automatisch extrahieren:

```typescript annotated
// Standard-Wrapper-Format einer API:
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
  timestamp: string;
};

type ApiError = {
  error: string;
  code: number;
};

// Typ des Payloads extrahieren:
type UnwrapResponse<T> =
  T extends ApiResponse<infer U> ? U :      // Normaler Response: Payload
  T extends ApiError ? never :               // Fehler: never
  T;                                         // Unbekannt: unveraendert

// Anwendung:
type UserApiResponse = ApiResponse<{ id: string; name: string }>;
type ProductApiResponse = ApiResponse<{ sku: string; price: number }>;

type UserPayload = UnwrapResponse<UserApiResponse>;     // { id: string; name: string }
type ProductPayload = UnwrapResponse<ProductApiResponse>; // { sku: string; price: number }
type ErrorPayload = UnwrapResponse<ApiError>;           // never

// Nuetzlich in einer generischen Fetch-Funktion:
declare function fetchApi<T>(url: string): Promise<UnwrapResponse<T>>;

// Caller muss nur den Response-Typ angeben:
const user = await fetchApi<UserApiResponse>("/api/users/1");
// user: { id: string; name: string } — automatisch unwrapped!
```

---

## Annotierter Code: Conditional + Mapped — Das komplette Muster

```typescript annotated
// Dieses Pattern erstellt einen "Awaited"-Wrapper fuer alle Properties eines Objekts:
type AwaitAllProps<T extends Record<string, any>> = {
  [K in keyof T]: Awaited<T[K]>;
//                ^^^^^^^
//                Awaited ist ein eingebauter Conditional Type
//                Er loest Promises und Thenables auf
};

// Beispiel: Ein Objekt mit Promise-Properties:
interface AsyncData {
  user: Promise<{ name: string }>;
  settings: Promise<{ theme: "dark" | "light" }>;
  count: number;  // kein Promise
}

type ResolvedData = AwaitAllProps<AsyncData>;
// {
//   user: { name: string };      <- Promise wurde aufgeloest
//   settings: { theme: "dark" | "light" };
//   count: number;               <- unveraendert (Awaited<number> = number)
// }

// In der Praxis: useResolvedState Hook fuer React/Angular
declare function resolveAll<T extends Record<string, Promise<unknown>>>(
  promises: T
): Promise<AwaitAllProps<T>>;

const result = await resolveAll({
  user: fetchUser(),
  settings: fetchSettings(),
});
// result.user — kein Promise mehr!
// result.settings — kein Promise mehr!
```

---

## Experiment: NonNullable verstehen

> **Experiment:** `NonNullable<T>` ist ein eingebauter Conditional Type. Baue ihn nach und verstehe, wie er funktioniert:
>
> ```typescript
> // TypeScripts eingebautes NonNullable:
> // type NonNullable<T> = T extends null | undefined ? never : T;
>
> // Baue es nach:
> type MeinNonNullable<T> = T extends null | undefined ? never : T;
>
> type A = MeinNonNullable<string>;              // ?
> type B = MeinNonNullable<string | null>;       // ?
> type C = MeinNonNullable<string | null | undefined>; // ?
> type D = MeinNonNullable<null>;                // ?
>
> // Bonus: Was ist der Unterschied zwischen NonNullable<T> und Required<T>?
> // Tipp: Experimentiere mit:
> type E = Required<{ name?: string; age?: number }>;
> type F = NonNullable<string | null | number | undefined>;
> ```
>
> Erklaere mit eigenen Worten: Warum gibt `MeinNonNullable<string | null>` `string` zurueck — nicht `string | never`?

---

## Erklaere dir selbst

> **Erklaere dir selbst:** Was ist der Vorteil von `type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] }` gegenueber der Alternative, die Methoden manuell aufzulisten?
> **Kernpunkte:** Automatisch synchron: Wenn das Interface neue Methoden bekommt, aktualisiert sich der Typ automatisch | Kein Copy-Paste-Fehler | Funktioniert mit Drittanbieter-Interfaces die man nicht selbst kontrolliert | Laufzeit-Code bleibt unberuehrt (Typ-Level-Operation) | Der Preis: hoeherer kognitiver Aufwand beim Lesen

---

## Wann Conditional Types zu weit gehen

Das Turing-Vollstaendigkeitsprinzip ist auch eine Warnung. Hier sind Signale, dass du zu weit gegangen bist:

```typescript annotated
// ❌ Zu weit: TypeScript brauchte 5+ Sekunden fuer diese Typ-Auswertung
type Fibonacci<N extends number, ...> = ...;  // 200 Ebenen Rekursion

// ❌ Zu weit: Niemand kann das in 30 Sekunden verstehen
type X<T> = T extends A ? (T extends B ? (T extends C ? D : E) : F) : G;

// ❌ Zu weit: Das koennte man einfacher mit einem Laufzeit-Check loesen
type ParseQueryString<S extends string> = ...;  // 50 Zeilen rekursiver Typ

// ✅ Gut: Klar lesbar, loest ein echtes Problem
type NonNullable<T> = T extends null | undefined ? never : T;

// ✅ Gut: Extraktion ohne die Bibliothek zu importieren
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

// ✅ Gut: Typsichere Union-Filterung
type Extract<T, U> = T extends U ? T : never;
```

**Faustregel:** Wenn ein anderer Entwickler den Typ in 30 Sekunden nicht verstehen kann, vereinfache ihn. Typen sind Dokumentation. Unlesbarer Code ist keine Dokumentation.

---

## Performance-Grenzen: Wann TypeScript klagt

Conditional Types koennen den TypeScript Language Server (den Prozess der deine IDE antreibt) verlangsamen. Das passiert bei:

1. **Sehr tiefer Rekursion** — jede Ebene kostet Speicher und Zeit
2. **Grossen Unions mit Distribution** — ein Union mit 50 Membern wird 50 Mal ausgewertet
3. **Verschachtelten Conditional Types ueber grossen Strukturen**

```typescript annotated
// Das kann langsam werden:
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Auf einem Interface mit 100 Properties und 5 Ebenen Tiefe:
// 100 * 100 * 100 * 100 * 100 = 10 Milliarden Typ-Instantiierungen
// Das koennte TypeScript zum Absturz bringen!

// In der Praxis ist das kein Problem fuer normale Strukturen (3-10 Properties, 2-3 Ebenen).
// Aber bei automatisch generierten Typen (z.B. aus Datenbank-Schema-Generatoren)
// kann es zu echten Performance-Problemen kommen.
```

**Loesungsansatz bei Performance-Problemen:**
- Den Typ "shallower" machen (nur 1-2 Ebenen)
- Interfaces statt Typ-Aliases (Interfaces sind lazy evaluiert)
- Den Typ zur Laufzeit validieren statt zur Compile-Zeit transformieren

---

## In React: Komponenten-Props typsicher ableiten

```typescript annotated
// React: Props-Typ fuer verschiedene Varianten einer Komponente
type ButtonVariant = "primary" | "secondary" | "danger";

// Conditional Type fuer variant-abhaengige Props:
type ButtonProps<V extends ButtonVariant> =
  V extends "danger"
    ? {
        variant: V;
        confirmText: string;  // Pflicht fuer "danger" — Bestaetigung noetig
        onConfirm: () => void;
      }
    : {
        variant: V;
        onClick: () => void;
        disabled?: boolean;
      };

// TypeScript erzwingt die richtigen Props je nach variant:
declare function Button<V extends ButtonVariant>(props: ButtonProps<V>): JSX.Element;

// Korrekt — danger braucht confirmText:
<Button variant="danger" confirmText="Wirklich loeschen?" onConfirm={handleDelete} />

// Korrekt — primary braucht onClick:
<Button variant="primary" onClick={handleSave} />

// TypeScript-Fehler — danger braucht confirmText, nicht onClick:
<Button variant="danger" onClick={handleDelete} />
// Error: Property 'confirmText' is missing in type...
```

---

## Zusammenschau: Alle Konzepte auf einen Blick

| Konzept | Syntax | Wann | Beispiel |
|---------|--------|------|---------|
| Grundbedingung | `T extends U ? X : Y` | Typ-abh. Rueckgabe | `IsString<T>` |
| infer | `T extends X<infer U> ? U : T` | Typ extrahieren | `ReturnType<T>` |
| Distribution | nackt `T` + Union | Union filtern | `Extract<T, U>` |
| [T] verhindert | `[T] extends [U]` | Ganzheitspruefung | `IsNever<T>` |
| Rekursion | Typ ruft sich selbst auf | Tiefe Strukturen | `DeepPartial<T>` |
| Mapped + Cond | `[K in keyof T as ...]` | Key-Filterung | `Methods<T>` |

---

## Denkfrage

> **Denkfrage:** Du hast jetzt fuenf Sektionen ueber Conditional Types gelesen. Welches der Konzepte findest du am nuetzlichsten fuer deine taegliche Arbeit als Angular-Entwickler? Warum?
>
> **Zur Reflexion:** `ReturnType<T>` und `Parameters<T>` sind wahrscheinlich die haefigst genutzten. Sie helfen, Typen zu synchronisieren ohne sie manuell zu pflegen. `NonNullable<T>` kommt oft in Forms vor. `Extract` und `Exclude` helfen bei Diskriminierenden Unions (die in Angular-Services haeufig sind). `DeepPartial` ist ideal fuer Konfigurations-Merging.

---

## Was du in dieser Lektion gelernt hast

- Conditional Types sind **Typ-Ebenen-Ternaries**: `T extends U ? X : Y`
- `infer` **entdeckt** Typen aus Patterns — es ist der Mechanismus hinter `ReturnType`, `Parameters`, `Awaited`
- **Distribution** verteilt Conditionals ueber Unions — macht `Extract` und `Exclude` erst moeglich
- `[T] extends [U]` **verhindert Distribution** und behandelt Unions als Ganzes
- **Rekursive Typen** dringen beliebig tief in Strukturen ein — mit Terminierungsbedingung
- **Conditional + Mapped Types** ist das maechtigste Kombinationsmuster (Key-Filterung)
- Das Typsystem ist Turing-vollstaendig — aber **Lesbarkeit > Maechtigkeit**

**Kernkonzept:** Conditional Types transformieren das TypeScript-Typsystem von einer Sammlung von Annotationen zu einer vollstaendigen **Typ-Transformationssprache**. Die Kernfrage bei jedem Conditional Type: Macht dieser Typ den Code sicherer und lesbarer — oder nur komplizierter?

---

> **Pausenpunkt — Ende der Lektion** — Conditional Types sind eines der komplexesten Themen in TypeScript. Wenn du jetzt `T extends U ? X : Y`, `infer`, Distribution und Rekursion verstehst, hast du einen signifikanten Vorsprung gegenueber der Mehrheit der TypeScript-Entwickler.
>
> Gehe jetzt in dein Angular-Projekt und suche nach einer Stelle, wo `ReturnType<>` oder `Parameters<>` Code sicherer machen koennte. Das ist die beste Festigung.
>
> Weiter geht es mit: [Lektion 18 — Template Literal Types](../../18-template-literal-types/README.md)
