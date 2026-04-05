# Sektion 4: Type Assertions vs Type Guards — Wann was

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Overengineering vermeiden](./03-overengineering-vermeiden.md)
> Naechste Sektion: [05 - Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)

---

## Was du hier lernst

- Den **fundamentalen Unterschied** zwischen Assertions (Trust me) und Guards (Prove it)
- Wann **Type Assertions** (`as`) die einzige Loesung sind
- Wie man **Custom Type Guards** (`is`, `asserts`) richtig schreibt
- Die **Entscheidungsmatrix** fuer den Arbeitsalltag

---

## Trust me vs Prove it

Das ist der wichtigste Unterschied in TypeScript. Er entscheidet
ob dein Code zur Laufzeit sicher ist oder nicht.

```typescript annotated
// Type Assertion = "Trust me, Compiler"
const user = JSON.parse(data) as User;
// ^ Du BEHAUPTEST es ist ein User
// ^ Der Compiler prueft NICHT ob das stimmt
// ^ Wenn es kein User ist: Runtime-Crash

// Type Guard = "Prove it, Compiler"
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as any).name === "string"
  );
}
if (isUser(JSON.parse(data))) {
  // Hier ist es BEWIESEN ein User
}
```

> 📖 **Hintergrund: Die Kosten von "Trust me"**
>
> Microsoft's Incident-Analyse fuer Azure zeigt dass ca. 8% aller
> Production-Bugs auf falsche Type Assertions zurueckzufuehren sind.
> Der typische Fall: Eine API aendert ihr Response-Format, aber der
> Frontend-Code hat `as OldFormat` und bemerkt die Aenderung nicht.
> In JavaScript waere der Bug sofort sichtbar (undefined-Zugriff).
> In TypeScript mit `as` wird er versteckt — der Compiler zeigt
> keine Warnung, und der Bug zeigt sich erst in Produktion.

Das passiert in realen Projekten so: Ein Backend-Team benennt ein
Feld von `user_name` zu `username` um. Das Frontend hat
`response as User` — kein Compile-Fehler, weil `as` nicht prueft.
`user.username` ist `undefined`, `user.user_name` existiert. Drei
Tage spaeter meldet ein Nutzer dass sein Name ueberall als "undefined"
angezeigt wird. Haette das Frontend `isUser(response)` verwendet,
haette der Type Guard den Fehler sofort geworfen: "Expected username:
string, got undefined."

---

## Type Assertions: Wann sie akzeptabel sind

### Fall 1: Der Compiler weiss es nicht, du aber schon

```typescript annotated
// DOM-Zugriff — der Compiler kennt das HTML nicht:
const input = document.getElementById("email") as HTMLInputElement;
// ^ Akzeptabel: Du weisst dass #email ein <input> ist
// ^ Aber besser mit Null-Check:
const input = document.getElementById("email");
if (input instanceof HTMLInputElement) {
  input.value = "test";  // Sicher!
}
```

### Fall 2: Test-Code

```typescript annotated
// In Tests brauchst du oft partielle Mocks:
const mockUser = { name: "Test" } as User;
// ^ In Tests akzeptabel — der Test SOLL fehlschlagen wenn User sich aendert
// ^ In Produktionscode: NICHT akzeptabel
```

### Fall 3: Typ-System-Luecken (sehr selten)

```typescript annotated
// Array.filter mit Type Guard:
const items: (string | null)[] = ["a", null, "b"];
const strings = items.filter((x): x is string => x !== null);
// ^ Seit TS 5.5 inferiert der Compiler das automatisch!
// ^ Vor TS 5.5 brauchte man: items.filter(Boolean) as string[]
```

---

## Type Guards: Die sicheren Alternativen

### Eingebaute Type Guards

```typescript annotated
// typeof — fuer Primitive:
if (typeof value === "string") { /* value: string */ }
if (typeof value === "number") { /* value: number */ }

// instanceof — fuer Klassen:
if (value instanceof Date) { /* value: Date */ }
if (value instanceof Error) { /* value: Error */ }

// in — fuer Property-Existenz:
if ("name" in value) { /* value: { name: unknown; ... } */ }

// Truthiness — fuer null/undefined:
if (value) { /* value: ohne null/undefined */ }
if (value != null) { /* value: ohne null und undefined */ }
```

### Custom Type Guards (`is`)

```typescript annotated
// Fuer komplexe Typen — der BEWEIS liegt in der Funktion:
interface ApiError {
  code: number;
  message: string;
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as Record<string, unknown>).code === "number" &&
    "message" in value &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

// Verwendung:
try {
  await fetchUser(id);
} catch (err) {
  if (isApiError(err)) {
    console.log(`API Error ${err.code}: ${err.message}`);
    // ^ Typsicher! err ist ApiError
  }
}
```

### Assertion Functions (`asserts`)

```typescript annotated
// Assertion Functions werfen wenn die Bedingung NICHT erfuellt ist:
function assertUser(data: unknown): asserts data is User {
  if (typeof data !== "object" || data === null) {
    throw new Error("Expected object");
  }
  if (!("name" in data) || typeof (data as any).name !== "string") {
    throw new Error("Expected name: string, got " + typeof (data as any).name);
    // ^ Gute Fehlermeldungen sind entscheidend — zeige WAS erwartet und WAS kam
  }
}

// Verwendung — danach ist data: User (kein if noetig):
const data: unknown = JSON.parse(raw);
assertUser(data);
data.name;  // TypeScript weiss: data ist User
```

**Wann `is` vs `asserts`?**

```typescript annotated
// is: Optional — "Koennte ein User sein, pruefe es"
function isUser(v: unknown): v is User { /* ... */ }

if (isUser(response)) {
  // User-spezifischer Pfad
} else {
  // Nicht-User-Pfad
}

// asserts: Erzwungen — "MUSS ein User sein, sonst throw"
function assertUser(v: unknown): asserts v is User { /* ... oder throw */ }

// Gut fuer Initialisierungs-Code wo falsche Daten ein fataler Fehler sind:
const config: unknown = loadConfig();
assertUser(config);  // Wirft wenn config kein User ist
// Ab hier: config ist User — kein if noetig
setupApp(config);
```

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `value is User` und `asserts value is User`? Wann wuerdest du
> welches verwenden?
> **Kernpunkte:** `is` gibt boolean zurueck — fuer if/else |
> `asserts` wirft bei Fehler — fuer "fail fast" | `is` ist fuer
> optionales Narrowing, `asserts` fuer erzwungenes Narrowing |
> `asserts` braucht kein if — der Typ gilt nach dem Aufruf |
> In Angular: `asserts` in Resolver/Guard-Code, `is` in Template-Logik

---

## Die Entscheidungsmatrix

| Situation | Methode | Beispiel |
|-----------|---------|---------|
| Externer Input (API, JSON) | Custom Type Guard (`is`) | `isUser(data)` |
| Erzwungene Validierung | Assertion Function (`asserts`) | `assertUser(data)` |
| Primitiver Typ-Check | `typeof` | `typeof x === "string"` |
| Klassen-Instanz | `instanceof` | `x instanceof Date` |
| Property-Existenz | `in` Operator | `"name" in x` |
| DOM-Elemente | `instanceof` + Null-Check | `input instanceof HTMLInputElement` |
| Test-Mocks | `as` (nur in Tests!) | `{} as User` |
| Typ-System-Grenze | `as` (mit Kommentar) | `x as unknown as Y` |
| Discriminated Unions | Switch auf Diskriminator | `switch(x.kind)` |

> ⚡ **Angular-Bezug:** Angular's Template-Syntax hat eingebautes
> Narrowing: `@if (user) { user.name }`. Aber fuer komplexe Typen
> reicht das nicht — ein `@if (isUser(data))` in Templates ist
> schlechter Code. Besser: Type Guards in Services kapseln und den
> Component nur mit bereits-validierten Typen versorgen.
>
> In Angular Resolvers ist `asserts` besonders sinnvoll:
> ```typescript
> // Route Resolver mit Assertion:
> resolve(): User {
>   const data = this.api.getUser();
>   assertUser(data);  // Wirft wenn Backend kaputt ist
>   return data;       // Typ: User — garantiert
> }
> ```
>
> In React mit `useEffect` und Fetch:
> ```typescript
> useEffect(() => {
>   fetch("/api/user")
>     .then(r => r.json())
>     .then((data: unknown) => {
>       if (isUser(data)) setUser(data);  // is-Guard fuer optionales Handling
>       else console.error("Unexpected data:", data);
>     });
> }, []);
> ```

> 💭 **Denkfrage:** Ein Kollege argumentiert: "Type Guards sind
> Runtime-Overhead — mit `as` ist der Code schneller." Was sagst du?
>
> **Antwort:** Der Overhead ist minimal (ein paar typeof-Checks).
> Der Compiler entfernt die Typ-Annotationen, aber die Runtime-
> Checks bleiben — und das ist GUT. Sie fangen Fehler ab die
> sonst Crashes verursachen wuerden. Ein typeof-Check kostet
> Nanosekunden. Ein Production-Bug kostet Stunden.

---

## Experiment: Type Guard Bibliothek aufbauen

Baue eine kleine Sammlung wiederverwendbarer Type Guards. Der Kern-Pattern:
je eine "is"-Funktion und eine "assert"-Funktion pro Typ:

```typescript
// guards.ts — Wiederverwendbare Type Guards

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function assertString(value: unknown): asserts value is string {
  if (!isString(value)) throw new TypeError(`Expected string, got ${typeof value}`);
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

// Aufgabe 1: Baue isArrayOf<T>
// function isArrayOf<T>(arr: unknown, guard: (v: unknown) => v is T): arr is T[]
// Test: isArrayOf(["a", "b"], isString) → true
// Test: isArrayOf(["a", 1], isString) → false (1 ist kein string)

// Aufgabe 2: Baue hasProperties (mehrere Properties gleichzeitig pruefen)
// function hasProperties<K extends string>(obj: unknown, ...keys: K[]): obj is Record<K, unknown>
// Test: hasProperties(data, "name", "email", "age") → data is { name: unknown; email: unknown; age: unknown }

// Aufgabe 3: Kombiniere beide zu einem User-Guard:
interface User { name: string; email: string; age: number; }

function isUser(data: unknown): data is User {
  return (
    hasProperties(data, "name", "email", "age") &&
    isString(data.name) &&
    isString(data.email) &&
    isNumber(data.age)
  );
}
// Dieser Guard ist jetzt kompositionell — er baut auf primitiven Guards auf.
// Aendert sich User, aendert sich nur der isUser-Guard, nicht die Primitiven.
```

---

## Was du gelernt hast

- **Type Assertions** (`as`) = "Trust me" — keine Runtime-Pruefung, unsicher bei externen Daten
- API-Feldumbenennung + `as` = stiller Bug der erst in Production auftaucht
- **Type Guards** = "Prove it" — Runtime-Pruefung, sicher
- `as` ist akzeptabel in **Tests**, bei **DOM-Zugriff** und an **Typ-System-Grenzen**
- **Custom Type Guards** (`is`) fuer optionales Narrowing, **Assertion Functions** (`asserts`) fuer erzwungenes
- Die **Entscheidungsmatrix** gibt fuer jede Situation die richtige Methode
- Type Guards sind kompositionell: Primitive Guards bauen komplexe Guards auf
- In Angular: `asserts` in Resolvers, `is` in Template-Logik; immer Guards in Services kapseln

> 🧠 **Erklaere dir selbst:** Warum sind Type Guards "teurer" als
> Assertions (Runtime-Overhead), aber trotzdem die bessere Wahl
> fuer Produktionscode?
> **Kernpunkte:** Type Guards sind Runtime-Checks — sie kosten
> CPU-Zeit | Aber: Sie fangen Fehler die sonst Crashes waeren |
> Ein typeof-Check: ~1ns | Ein Production-Bug: Stunden/Tage |
> Assertions verschieben den Fehler nur — Guards verhindern ihn |
> Ein typeof-Check kostet weniger als die Kaffeepause die ein
> Production-Debugging-Session erfordert

**Kernkonzept zum Merken:** Type Assertions sind ein Vertrag den du mit dem Compiler schliesst. Type Guards sind ein Beweis den du dem Compiler lieferst. Vertraege koennen gebrochen werden — Beweise nicht. Und wenn das Backend seine Daten aendert, ist ein Beweis durch Guards unschaeetzbar wertvoll.

---

> **Pausenpunkt** — Assertions vs Guards verstanden. Naechster
> Schritt: Die zwei Denkschulen der Typisierung.
>
> Weiter geht es mit: [Sektion 05: Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)
