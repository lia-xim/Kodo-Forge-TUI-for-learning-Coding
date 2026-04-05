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
    throw new Error("Expected name: string");
  }
}

// Verwendung — danach ist data: User (kein if noetig):
const data: unknown = JSON.parse(raw);
assertUser(data);
data.name;  // TypeScript weiss: data ist User
```

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `value is User` und `asserts value is User`? Wann wuerdest du
> welches verwenden?
> **Kernpunkte:** `is` gibt boolean zurueck — fuer if/else |
> `asserts` wirft bei Fehler — fuer "fail fast" | `is` ist fuer
> optionales Narrowing, `asserts` fuer erzwungenes Narrowing |
> `asserts` braucht kein if — der Typ gilt nach dem Aufruf

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

> ⚡ **Framework-Bezug:** Angular's Template-Syntax hat eingebautes
> Narrowing: `@if (user) { user.name }`. React braucht manuelles
> Narrowing in JSX: `{user && <span>{user.name}</span>}`. In beiden
> Frameworks gilt: Custom Type Guards in Services/Hooks kapseln,
> nicht in Templates/Components verstreuen.

> 💭 **Denkfrage:** Ein Kollege argumentiert: "Type Guards sind
> Runtime-Overhead — mit `as` ist der Code schneller." Was sagst du?
>
> **Antwort:** Der Overhead ist minimal (ein paar typeof-Checks).
> Der Compiler entfernt die Typ-Annotationen, aber die Runtime-
> Checks bleiben — und das ist GUT. Sie fangen Fehler ab die
> sonst Crashes verursachen wuerden. Ein typeof-Check kostet
> Nanosekunden. Ein Production-Bug kostet Stunden.

---

## Experiment: Type Guard Library

Baue eine kleine Sammlung wiederverwendbarer Type Guards:

```typescript
// guards.ts — Wiederverwendbare Type Guards

export function isString(value: unknown): value is string {
  return typeof value === "string";
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

// Experiment: Baue einen generischen 'isArrayOf' Guard:
// function isArrayOf<T>(arr: unknown, guard: (v: unknown) => v is T): arr is T[]
// Nutze ihn: isArrayOf(data, isString) → data is string[]
```

---

## Was du gelernt hast

- **Type Assertions** (`as`) = "Trust me" — keine Runtime-Pruefung, unsicher bei externen Daten
- **Type Guards** = "Prove it" — Runtime-Pruefung, sicher
- `as` ist akzeptabel in **Tests**, bei **DOM-Zugriff** und an **Typ-System-Grenzen**
- **Custom Type Guards** (`is`) fuer optionales Narrowing, **Assertion Functions** (`asserts`) fuer erzwungenes
- Die **Entscheidungsmatrix** gibt fuer jede Situation die richtige Methode

> 🧠 **Erklaere dir selbst:** Warum sind Type Guards "teurer" als
> Assertions (Runtime-Overhead), aber trotzdem die bessere Wahl
> fuer Produktionscode?
> **Kernpunkte:** Type Guards sind Runtime-Checks — sie kosten
> CPU-Zeit | Aber: Sie fangen Fehler die sonst Crashes waeren |
> Ein typeof-Check: ~1ns | Ein Production-Bug: Stunden/Tage |
> Assertions verschieben den Fehler nur — Guards verhindern ihn

**Kernkonzept zum Merken:** Type Assertions sind ein Vertrag den du mit dem Compiler schliesst. Type Guards sind ein Beweis den du dem Compiler lieferst. Vertraege koennen gebrochen werden — Beweise nicht.

---

> **Pausenpunkt** — Assertions vs Guards verstanden. Naechster
> Schritt: Die zwei Denkschulen der Typisierung.
>
> Weiter geht es mit: [Sektion 05: Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)
