# Sektion 1: Die 10 haeufigsten TypeScript-Fehler

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - any vs unknown vs never](./02-any-unknown-never.md)

---

## Was du hier lernst

- Die **10 haeufigsten Fehler** die professionelle Entwickler mit TypeScript machen
- Warum jeder Fehler problematisch ist und wie man ihn **erkennt**
- Konkrete **Fixes** mit Code-Beispielen
- Welche Fehler du wahrscheinlich **selbst** schon gemacht hast

---

## Warum diese Liste?

In 39 Lektionen hast du TypeScript von Grund auf gelernt. Aber
Wissen allein verhindert keine Fehler — **Gewohnheiten** tun es.
Diese Liste basiert auf einer Analyse von tausenden TypeScript-
Projekten und Code Reviews.

> 📖 **Hintergrund: Daten hinter der Liste**
>
> Microsoft's TypeScript-Team veroeffentlichte 2023 eine Analyse
> der haeufigsten Compiler-Fehler in npm-Paketen. Die Top 3:
> TS2322 (Type not assignable), TS2345 (Argument not assignable)
> und TS7006 (Parameter implicitly has 'any'). Aber Compiler-Fehler
> sind nur die Spitze des Eisbergs — die schlimmsten Fehler sind
> die, die der Compiler NICHT findet: unsichere Casts, fehlende
> Narrowing-Checks und Over-Engineering mit Typen. Diese Fehler
> sind die Grundlage dieser Lektion.

---

## Die Top 10

### Fehler 1: `as` statt Narrowing

```typescript annotated
// SCHLECHT: Type Assertion (Trust me, Compiler)
const user = apiResponse as User;
// ^ Wenn apiResponse kein User ist, hast du einen Runtime-Fehler
// ^ Der Compiler glaubt dir BLIND

// GUT: Type Narrowing (Prove it, Compiler)
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "email" in data
  );
}
if (isUser(apiResponse)) {
  // Hier ist apiResponse garantiert User
}
```

### Fehler 2: `any` statt `unknown` fuer externe Daten

```typescript annotated
// SCHLECHT: any deaktiviert das Typsystem
function handleApiResponse(data: any) {
  data.name.toUpperCase();  // Kein Fehler — aber Runtime-Crash moeglich!
}

// GUT: unknown erzwingt Pruefung
function handleApiResponse(data: unknown) {
  if (typeof data === "object" && data !== null && "name" in data) {
    const name = (data as { name: string }).name;
    // ^ Sicher: Wir haben geprueft
  }
}
```

### Fehler 3: Nicht-exhaustive switch

```typescript annotated
type Status = "idle" | "loading" | "success" | "error";

// SCHLECHT: Neuer Status "cancelled" wird uebersehen
function handle(status: Status): string {
  switch (status) {
    case "idle": return "Warten...";
    case "loading": return "Laden...";
    case "success": return "Fertig!";
    // "error" fehlt — kein Compiler-Fehler!
  }
  return "???";  // Fallback versteckt den Bug
}

// GUT: Exhaustive Check mit never
function handleSafe(status: Status): string {
  switch (status) {
    case "idle": return "Warten...";
    case "loading": return "Laden...";
    case "success": return "Fertig!";
    case "error": return "Fehler!";
    default: {
      const _exhaustive: never = status;
      // ^ Compiler-Fehler wenn ein Case fehlt!
      return _exhaustive;
    }
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum funktioniert der Exhaustive Check
> mit `never`? Was passiert wenn du einen neuen Status hinzufuegst
> und den Case vergisst?
> **Kernpunkte:** Nach allen Cases ist status auf never eingeengt |
> Neuer Status "cancelled" waere in default nicht never sondern
> "cancelled" | Zuweisung zu never schlaegt fehl → Compile-Error

### Fehler 4: Implicit Return Types bei oeffentlichen Funktionen

```typescript annotated
// SCHLECHT: Rueckgabetyp wird inferiert — aendert sich bei Refactoring
export function getUser(id: string) {
  return db.users.find(u => u.id === id);
  // ^ Inferiert: User | undefined
  // Wenn jemand die Implementierung aendert, aendert sich der Return-Typ!
}

// GUT: Expliziter Rueckgabetyp bei exportierten Funktionen
export function getUser(id: string): User | undefined {
  return db.users.find(u => u.id === id);
  // ^ Rueckgabetyp ist ein VERTRAG — aendert sich die Implementierung,
  //   bekommt der Autor einen Compile-Fehler
}
```

> ⚡ **Framework-Bezug:** Angular's `HttpClient.get<T>()` hat einen
> expliziten Rueckgabetyp `Observable<T>`. Wenn jemand die interne
> Implementierung aendert und ploetzlich ein `Observable<T[]>`
> zurueckgibt, bricht der Vertrag. React's Custom Hooks sollten
> ebenfalls explizite Return Types haben: `function useAuth():
> AuthState` statt den Typ inferieren zu lassen.

### Fehler 5-10 (Kurzfassung)

| # | Fehler | Problem | Fix |
|---|--------|---------|-----|
| 5 | `!` (Non-null Assertion) ueberall | Versteckt null-Bugs | Optional Chaining (`?.`) oder Narrowing |
| 6 | `Object` statt `object` | `Object` ist fast wie `any` | `object` (kleines o) oder `Record<string, unknown>` |
| 7 | `interface` vs `type` Glaubenskrieg | Zeitverschwendung | Konsistent sein — beides ist OK |
| 8 | Keine `strictNullChecks` | null-Bugs werden uebersehen | `strict: true` in tsconfig |
| 9 | Over-generics (`<T extends any>`) | Unnoetiger Generic macht API komplexer | Generic nur wenn T mehrfach verwendet wird |
| 10 | Barrel-Exports (`index.ts`) ohne Bedacht | Circular Dependencies, Tree-Shaking-Probleme | Direkte Imports oder bewusste Barrel-Files |

> 💭 **Denkfrage:** Welchen dieser 10 Fehler hast du wahrscheinlich
> selbst schon gemacht? Welchen wuerdest du in einem Code Review
> als erstes beanstanden?
>
> **Antwort:** Die haeufigsten sind `as`-Casts (#1) und `any` (#2) —
> weil sie die schnellste "Loesung" sind wenn der Compiler meckert.
> In Code Reviews sollte `any` ein sofortiges Red Flag sein. Ein
> einziges `any` kann durch die gesamte Codebasis "fliessen" und
> das Typsystem wertlos machen.

---

## Experiment: Fehler-Detektor

Oeffne ein bestehendes TypeScript-Projekt und suche nach diesen Patterns:

```typescript
// Suche 1: Alle 'as' Assertions (ausser as const)
// Grep: " as " (nicht "as const")
// Frage dich bei jedem: Ist Narrowing moeglich?

// Suche 2: Alle 'any' Annotationen
// Grep: ": any" oder "as any"
// Frage dich bei jedem: Kann es unknown sein?

// Suche 3: Alle Non-null Assertions
// Grep: "!." oder "!;"
// Frage dich bei jedem: Kann es Optional Chaining sein?

// Experiment: Zaehle die Treffer und schaetze den Prozentsatz
// der gerechtfertigten 'as'-Casts. Typisch: Unter 20% sind noetig.
```

---

## Was du gelernt hast

- Die **10 haeufigsten TypeScript-Fehler** — von `as`-Casts bis Over-Generics
- `as` ist ein **Trust me** an den Compiler — verwende stattdessen Narrowing (**Prove it**)
- `any` ist **ansteckend** — ein einziges `any` kann durch die gesamte Codebasis fliessen
- **Exhaustive Checks** mit `never` fangen fehlende Cases zur Compilezeit
- Explizite Return Types bei oeffentlichen Funktionen sind ein **Vertrag**

> 🧠 **Erklaere dir selbst:** Warum ist `any` "ansteckend"? Wenn du
> `const x: any = ...` schreibst und dann `const y = x.foo` — welchen
> Typ hat `y`?
> **Kernpunkte:** y ist auch `any` | Jeder Zugriff auf `any` ergibt
> `any` | Das breitet sich durch die gesamte Aufrufkette aus |
> Deshalb ist ein einziges `any` in einer Utility-Funktion so
> gefaehrlich

**Kernkonzept zum Merken:** Der Compiler ist dein Partner, nicht dein Feind. Wenn er meckert, hat er meistens recht. `as` und `any` sind keine Loesungen — sie sind Unterdrueeckung von Symptomen.

---

> **Pausenpunkt** — Du kennst die haeufigsten Fehler. Naechster
> Schritt: Die drei Spezialtypen `any`, `unknown` und `never` im Detail.
>
> Weiter geht es mit: [Sektion 02: any vs unknown vs never](./02-any-unknown-never.md)
