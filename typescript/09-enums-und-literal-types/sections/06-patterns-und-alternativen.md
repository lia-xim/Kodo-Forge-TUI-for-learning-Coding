# Sektion 6: Patterns und Alternativen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Template Literal Types](./05-template-literal-types.md)
> Naechste Sektion: — (Ende dieser Lektion)

---

## Was du hier lernst

- Was `const enum` ist und warum es **fast nie** die richtige Wahl ist
- Die **`isolatedModules`-Warnung** und warum sie alle modernen Build-Tools betrifft
- Das **`as const` Pattern** als universelle Alternative
- **Branding** mit Literal Types fuer semantische Typsicherheit

---

## const enum: Inline-Ersetzung

Ein `const enum` wird vom Compiler komplett **inline ersetzt** — kein
JavaScript-Objekt wird erzeugt:

```typescript annotated
const enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

const move = Direction.Up;
// ^ Wird kompiliert zu: const move = "UP";
// Kein Direction-Objekt existiert zur Laufzeit!
```

### Vorteile von const enum

1. **Kein Laufzeit-Overhead** — alles wird inline ersetzt
2. **Kleinere Bundle-Groesse** — kein Enum-Objekt im Output
3. **Performance** — kein Property-Lookup zur Laufzeit

### Das Problem: isolatedModules

Und jetzt die **kritische Warnung**:

> **`const enum` ist inkompatibel mit `isolatedModules: true`.**
> Und `isolatedModules` ist bei fast allen modernen Build-Tools AKTIV.

```typescript
// tsconfig.json:
// {
//   "compilerOptions": {
//     "isolatedModules": true  // <-- Standard bei Vite, Next.js, esbuild, swc
//   }
// }

// Mit isolatedModules: true kann const enum NICHT cross-file verwendet werden:
// file-a.ts:
export const enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// file-b.ts:
// import { Status } from "./file-a";
// const s = Status.Active;
// ^ Error mit isolatedModules! Der Compiler muesste file-a.ts lesen,
//   um zu wissen, dass Status.Active = "ACTIVE" ist.
//   Aber isolatedModules kompiliert jede Datei einzeln.
```

> 📖 **Hintergrund: Warum isolatedModules?**
>
> Moderne Build-Tools wie **esbuild**, **swc**, und **Vite** kompilieren
> jede TypeScript-Datei **einzeln** (isoliert), ohne das gesamte Projekt
> zu analysieren. Das macht den Build 10-100x schneller.
>
> Aber `const enum` erfordert, dass der Compiler die Enum-Definition in
> einer anderen Datei liest, um den Wert inline einzusetzen. Das ist
> mit isolierter Kompilierung unmoeglich.
>
> **Seit TypeScript 5.0** wird `isolatedModules: true` als Standard
> empfohlen. Seit TypeScript 5.4 gibt es `--verbatimModuleSyntax`,
> das noch strenger ist. Die Zukunft gehoert der isolierten Kompilierung —
> und `const enum` passt nicht dazu.

### Die Loesung

Wenn du `const enum` verwenden willst, gibt es zwei Optionen:

```typescript
// Option 1: Nur innerhalb EINER Datei verwenden (kein Export)
const enum LocalDirection {
  Up = "UP",
  Down = "DOWN",
}
// Funktioniert, weil der Compiler die Definition in derselben Datei sieht

// Option 2: Nicht verwenden. Stattdessen:
const Direction = {
  Up: "UP",
  Down: "DOWN",
} as const;
type Direction = typeof Direction[keyof typeof Direction];
// Gleiche Funktionalitaet, keine Kompatibilitaetsprobleme
```

> 🧠 **Erklaere dir selbst:** Warum empfiehlt das TypeScript-Team
> `isolatedModules: true`? Was gewinnt man durch isolierte Kompilierung
> und was verliert man?
> **Kernpunkte:** 10-100x schnellere Builds | Jede Datei unabhaengig kompilierbar | Kompatibel mit esbuild/swc/Vite | Verliert: const enum, some namespace features | Gewinn ueberwiegt deutlich

---

## Das as const Pattern: Die universelle Alternative

Statt Enums kannst du immer das `as const` Pattern verwenden:

```typescript annotated
// ─── Einfacher Ersatz fuer String Enum ─────────────────────────────
const LogLevel = {
  Debug: "DEBUG",
  Info: "INFO",
  Warning: "WARNING",
  Error: "ERROR",
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];
// ^ "DEBUG" | "INFO" | "WARNING" | "ERROR"

// ─── Ersatz fuer numerisches Enum ──────────────────────────────────
const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  InternalError: 500,
} as const;

type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];
// ^ 200 | 404 | 500

// ─── Mit zusaetzlichen Informationen ───────────────────────────────
const ErrorCode = {
  NotFound: { code: 404, message: "Not Found" },
  Forbidden: { code: 403, message: "Forbidden" },
  Internal: { code: 500, message: "Internal Server Error" },
} as const;

type ErrorCodeKey = keyof typeof ErrorCode;
// ^ "NotFound" | "Forbidden" | "Internal"
```

### Vorteile des as const Patterns

1. **Keine Kompatibilitaetsprobleme** mit Build-Tools
2. **Mehr Flexibilitaet** — Objekte koennen beliebige Strukturen haben
3. **Laufzeit-Zugriff** auf Werte UND abgeleitete Typen
4. **Strukturelle Kompatibilitaet** — kein nominaler Typ-Zwang

---

## Branding: Semantische Typsicherheit mit Literal Types

Ein fortgeschrittenes Pattern, das Literal Types nutzt, um
**semantisch verschiedene Werte** zu unterscheiden:

```typescript annotated
// Problem: Beide sind number — leicht verwechselbar!
function transfer(from: number, to: number, amount: number) {
  // Was ist from? Eine Account-ID? Ein Betrag? Ein Index?
}

// Loesung: Branded Types
type AccountId = number & { readonly __brand: "AccountId" };
type EUR = number & { readonly __brand: "EUR" };

// Konstruktor-Funktionen:
function accountId(id: number): AccountId {
  return id as AccountId;
}

function eur(amount: number): EUR {
  return amount as EUR;
}

// Jetzt ist Verwechslung unmoeglich:
function transferSafe(from: AccountId, to: AccountId, amount: EUR) {
  console.log(`Transfer ${amount} EUR from ${from} to ${to}`);
}

const sender = accountId(12345);
const receiver = accountId(67890);
const betrag = eur(100);

transferSafe(sender, receiver, betrag);  // OK
// transferSafe(sender, betrag, receiver);
// ^ Error! EUR ist nicht AccountId zuweisbar!

// transferSafe(12345, 67890, 100);
// ^ Error! number ist nicht AccountId/EUR zuweisbar!
```

> 🔍 **Tieferes Wissen: Wie funktioniert Branding?**
>
> Der Trick basiert auf der Intersection: `number & { __brand: "EUR" }`.
> Zur Laufzeit ist der Wert eine normale Zahl — die `__brand` Property
> existiert nicht wirklich. Aber zur Compilezeit sieht TypeScript
> `AccountId` und `EUR` als verschiedene Typen, weil ihre Brands
> unterschiedlich sind.
>
> Das `as` in der Konstruktor-Funktion ist der einzige "Vertrauensvorschuss"
> an den Compiler. Ab dann ist alles typsicher.
>
> Dieses Pattern wird auch in Libraries wie **zod** (z.brand()),
> **io-ts** und **Effect** verwendet.

> 💭 **Denkfrage:** Koenntest du Branding auch mit String Literal Types
> statt `"EUR"` verwenden? Was waere der Vorteil?
>
> **Antwort:** Ja, und genau das tun wir! Der Brand-Wert `"EUR"` IST
> ein String Literal Type. Du koenntest auch `unique symbol` verwenden
> fuer noch staerkere Isolation, aber String Literals sind einfacher
> zu lesen und zu debuggen.

---

## Zusammenfassung: Welches Pattern wann?

| Szenario | Empfehlung |
|---|---|
| Einfache Auswahl (3-10 Optionen) | `type Status = "active" \| "inactive"` |
| Benannte Konstanten mit Laufzeit-Zugriff | `as const` Object |
| Stabile oeffentliche API (Library) | String Enum |
| Bitwise Flags | Numerisches Enum |
| Semantische Unterscheidung (EUR vs USD) | Branded Types |
| String-Pattern (CSS, Events) | Template Literal Types |
| Cross-File Konstanten (modernes Tooling) | `as const` Object (nie `const enum`) |

---

## Was du gelernt hast

- `const enum` wird inline ersetzt, ist aber **inkompatibel mit isolatedModules**
- Moderne Build-Tools (Vite, esbuild, swc) nutzen alle `isolatedModules`
- Das `as const` Pattern ist die **universelle Alternative** zu Enums
- **Branding** nutzt Intersection Types mit Literal Types fuer semantische Sicherheit
- Jedes Pattern hat seinen Platz — die Wahl haengt vom Kontext ab

> 🧠 **Erklaere dir selbst:** Warum ist `as const` Object besser als
> `const enum` in einem modernen TypeScript-Projekt?
> **Kernpunkte:** Kompatibel mit isolatedModules | Kein spezieller Compiler-Trick noetig | Laufzeit-Werte verfuegbar | Iteration moeglich | Zukunftssicher

**Kernkonzept zum Merken:** In einem modernen TypeScript-Projekt (2024+) ist
`as const` mit abgeleitetem Union Type fast immer die beste Wahl. Enums haben
ihren Platz, aber der wird kleiner — und `const enum` sollte man in neuen
Projekten komplett vermeiden.

> ⚡ **In deinem Angular-Projekt:**
>
> ```typescript
> // Branded Types fuer typsichere IDs — verhindert Verwechslungen:
> type UserId   = string & { readonly __brand: "UserId" };
> type ProductId = string & { readonly __brand: "ProductId" };
>
> function userId(id: string): UserId     { return id as UserId; }
> function productId(id: string): ProductId { return id as ProductId; }
>
> // Angular Service mit Branded Types:
> @Injectable({ providedIn: "root" })
> export class UserService {
>   getUser(id: UserId): Observable<User> {
>     return this.http.get<User>(`/api/users/${id}`);
>   }
> }
>
> const uid = userId("usr-123");
> const pid = productId("prod-456");
>
> userService.getUser(uid);  // OK
> userService.getUser(pid);  // Error! ProductId ist nicht UserId!
> // Kein versehentliches Verwechseln von IDs mehr.
>
> // In React: Gleiche Technik fuer Props die zwar beide string sind,
> // aber semantisch unterschiedlich (z.B. SlugId vs DisplayName).
> ```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> // Refactoring: String Enum → as const Object
>
> // VORHER: String Enum
> enum ThemeEnum {
>   Light = "LIGHT",
>   Dark  = "DARK",
> }
>
> function applyEnum(theme: ThemeEnum) {
>   console.log(theme);
> }
> applyEnum(ThemeEnum.Light);
> // applyEnum("LIGHT");  // Error! Nicht moeglich
>
> // NACHHER: as const Object
> const Theme = { Light: "LIGHT", Dark: "DARK" } as const;
> type Theme = typeof Theme[keyof typeof Theme];
>
> function applyConst(theme: Theme) {
>   console.log(theme);
> }
> applyConst(Theme.Light);   // Gleiche Syntax wie beim Enum
> applyConst("LIGHT");        // Bonus: Direkte Strings funktionieren jetzt!
>
> // Welche Aenderungen brauchst du beim Refactoring?
> ```
> Vergleiche beide Varianten: Welche Zeilen musst du beim Refactoring
> aendern, welche bleiben identisch? Welcher Vorteil des `as const`
> Patterns war dir vorher nicht bewusst?

---

> **Ende der Lektion** — Du hast alle sechs Sektionen abgeschlossen!
>
> **Naechste Schritte:**
> - Arbeite die `examples/` durch und experimentiere
> - Loese die `exercises/` und vergleiche mit `solutions/`
> - Teste dein Wissen mit `npx tsx quiz.ts`
> - Behalte `cheatsheet.md` als Schnellreferenz
>
> **Naechste Lektion:** 10 — Generics —
> Wie du Funktionen und Typen schreibst, die mit JEDEM Typ funktionieren.
