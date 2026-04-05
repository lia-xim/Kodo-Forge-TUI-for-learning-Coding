# Cheatsheet: Best Practices & Anti-Patterns

Schnellreferenz fuer Lektion 39.

---

## Die Top 5 Regeln

1. **Kein `any`** — verwende `unknown` + Type Guard
2. **Kein `as`** bei externen Daten — verwende Runtime-Validierung
3. **Exhaustive Checks** — `default: const _: never = value`
4. **Explizite Return Types** fuer exportierte Funktionen
5. **Defensive Schale, offensiver Kern** — validiere an Grenzen

---

## Entscheidungsbaum: any vs unknown vs never

```
Brauchst du einen Typ fuer "irgendwas"?
├── Externe Daten? → unknown + Type Guard
├── Generischer Container? → Generic T
├── Funktion kehrt nie zurueck? → never
├── JS→TS Migration? → any (temporaer! mit TODO)
├── Typ-System-Grenze? → as any as TargetType (mit Kommentar)
└── Sonst? → unknown
```

---

## Type Assertions vs Type Guards

```typescript
// SCHLECHT: Trust me
const user = data as User;

// GUT: Prove it (Type Guard)
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "name" in data;
}
if (isUser(data)) { /* data: User */ }

// GUT: Fail fast (Assertion Function)
function assertUser(data: unknown): asserts data is User {
  if (!isUser(data)) throw new Error("Not a User");
}
assertUser(data);  // Danach: data ist User (kein if noetig)
```

---

## Defensive Schale, offensiver Kern

```
DEFENSIV (Systemgrenzen):          OFFENSIV (Kern):
├── API-Handler                    ├── Services
├── Formulare                      ├── Pure Functions
├── JSON.parse                     ├── Business-Logik
├── Event-Handler                  ├── State Management
└── Externe APIs                   └── Utility-Funktionen

Schale: unknown → validieren → typisiert
Kern: Typsystem vertrauen → keine Runtime-Checks
```

---

## 5 Refactoring-Patterns

| # | Vorher | Nachher |
|---|--------|---------|
| 1 | `{ isLoading: boolean; isError: boolean }` | Discriminated Union mit `status` |
| 2 | `userId: string` | `type UserId = string & { __brand: "UserId" }` |
| 3 | `user!.name!` | `user?.name ?? "Unbekannt"` |
| 4 | `function f(): string \| number` | Overloads mit spezifischen Return Types |
| 5 | `{ [key: string]: T }` | Explizites Interface oder `Map<string, T>` |

---

## Exhaustive Check

```typescript
type Status = "idle" | "loading" | "success" | "error";

function handle(s: Status): string {
  switch (s) {
    case "idle": return "Warten";
    case "loading": return "Laden";
    case "success": return "Fertig";
    case "error": return "Fehler";
    default: {
      const _: never = s;  // Compile-Error wenn Case fehlt!
      return _;
    }
  }
}
```

---

## Generic-Faustregel

```typescript
// OVER-ENGINEERING: T nur einmal verwendet
function log<T>(msg: T): void { console.log(msg); }

// RICHTIG: T verbindet Input mit Output
function identity<T>(value: T): T { return value; }

// Regel: Generic nur wenn T >= 2x vorkommt
```

---

## Code-Review-Checkliste (Kurzform)

| # | Pruefpunkt |
|---|-----------|
| 1 | Kein `any` ohne Kommentar? |
| 2 | Kein `as` bei externen Daten? |
| 3 | Kein `!` wo `?.` moeglich ist? |
| 4 | Switch exhaustive (never)? |
| 5 | Oeffentliche Funktionen mit Return Type? |
| 6 | Systemgrenzen validiert? |
| 7 | IDs als Branded Types? |
| 8 | State als Discriminated Union? |
| 9 | Fehler im Typ sichtbar? |
| 10 | Generics gerechtfertigt? |

---

## Metriken

| Metrik | Ziel |
|--------|------|
| any-Dichte (pro 1000 Zeilen) | < 1 (neu: 0) |
| as-Dichte (pro 1000 Zeilen) | < 5 (meiste in Tests) |
| strict: true | Immer |
| Exhaustive Checks | 100% bei DUs |
| Explizite Return Types | 100% fuer Exports |
