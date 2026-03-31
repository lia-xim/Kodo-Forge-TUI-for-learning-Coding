# Sektion 1: Partial, Required, Readonly

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Pick, Omit, Record](./02-pick-omit-record.md)

---

## Was du hier lernst

- Warum Utility Types existieren und welches Problem sie loesen
- **Partial\<T\>** — alle Properties optional machen
- **Required\<T\>** — alle Properties verpflichtend machen
- **Readonly\<T\>** — alle Properties unveraenderlich machen
- Wann welcher Modifier-Type die richtige Wahl ist

---

## Das Problem: Typ-Duplikation

In Lektion 13-14 hast du gelernt, wie Generics Typen parametrisch machen.
Utility Types gehen einen Schritt weiter: Sie **transformieren** bestehende Typen.

Stell dir vor, du hast ein User-Interface:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}
```

Fuer eine Update-Funktion brauchst du einen Typ, bei dem alle Felder
optional sind. Ohne Utility Types muesstest du den gesamten Typ duplizieren:

```typescript annotated
// SCHLECHT: Duplikation — wenn User sich aendert, muss das hier auch!
interface UserUpdate {
  id?: number;
  name?: string;
  email?: string;
  role?: "admin" | "user";
}
```

> **Das ist das Kernproblem:** Typ-Duplikation fuehrt zu Inkonsistenzen.
> Utility Types loesen das, indem sie neue Typen aus bestehenden ABLEITEN.

---

## Partial\<T\> — Alles optional

`Partial<T>` macht **alle** Properties eines Typs optional:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserUpdate = Partial<User>;
// ^ Aequivalent zu:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   role?: "admin" | "user";
// }

function updateUser(id: number, changes: Partial<User>): User {
  const existing: User = { id, name: "Max", email: "max@example.com", role: "user" };
  return { ...existing, ...changes };
}

// Nur die Felder senden, die sich aendern:
updateUser(1, { name: "Maximilian" });           // OK
updateUser(1, { email: "new@mail.com" });         // OK
updateUser(1, { name: "Max", role: "admin" });    // OK
updateUser(1, {});                                // Auch OK — nichts aendern
```

### Wie funktioniert Partial intern?

```typescript annotated
// Die eingebaute Definition von Partial:
type Partial<T> = {
  [P in keyof T]?: T[P];
};
// ^ Mapped Type: Iteriert ueber alle Keys von T
// ^ ? macht jede Property optional
// ^ T[P] behaelt den Original-Typ
```

> 📖 **Hintergrund: Mapped Types als Grundlage**
>
> Alle Utility Types sind intern mit Mapped Types implementiert — einem
> Feature das wir in einer spaeteren Lektion im Detail behandeln. Fuer
> jetzt reicht es zu wissen: `[P in keyof T]` iteriert ueber alle
> Property-Keys von T, aehnlich wie eine `for...in`-Schleife.

---

## Required\<T\> — Alles verpflichtend

`Required<T>` ist das **Gegenteil** von Partial — es macht alle optionalen
Properties zu Pflichtfeldern:

```typescript annotated
interface FormInput {
  username: string;
  password: string;
  rememberMe?: boolean;
  newsletter?: boolean;
}

type ValidatedForm = Required<FormInput>;
// ^ Aequivalent zu:
// {
//   username: string;
//   password: string;
//   rememberMe: boolean;   // Nicht mehr optional!
//   newsletter: boolean;    // Nicht mehr optional!
// }

function processForm(data: ValidatedForm): void {
  // Hier sind ALLE Felder garantiert vorhanden
  console.log(`User: ${data.username}, Newsletter: ${data.newsletter}`);
}
```

### Typisches Pattern: Optional Input, Required nach Validierung

```typescript annotated
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

const defaults: Required<Config> = {
  host: "localhost",
  port: 3000,
  debug: false,
};

function createConfig(overrides: Config): Required<Config> {
  return { ...defaults, ...overrides };
}

const config = createConfig({ port: 8080 });
// config.host ist GARANTIERT vorhanden — Typ ist string, nicht string | undefined
```

> 🧠 **Erklaere dir selbst:** Warum ist Required\<T\> nuetzlich, wenn man
> auch einfach alle Properties als required definieren koennte?
> **Kernpunkte:** Input-Typen haben oft optionale Felder fuer Defaults | Nach Verarbeitung will man Garantien | Required dokumentiert die Transformation im Typ-System

---

## Readonly\<T\> — Alles unveraenderlich

`Readonly<T>` macht alle Properties zu `readonly`:

```typescript annotated
interface AppState {
  currentUser: string;
  theme: "light" | "dark";
  notifications: number;
}

type FrozenState = Readonly<AppState>;
// ^ Aequivalent zu:
// {
//   readonly currentUser: string;
//   readonly theme: "light" | "dark";
//   readonly notifications: number;
// }

function displayState(state: Readonly<AppState>): void {
  console.log(state.currentUser);
  // state.currentUser = "other"; // Error! readonly
}
```

### Wichtig: Readonly ist SHALLOW

```typescript annotated
interface UserProfile {
  name: string;
  settings: {
    theme: string;
    language: string;
  };
}

const profile: Readonly<UserProfile> = {
  name: "Max",
  settings: { theme: "dark", language: "de" },
};

// profile.name = "Anna";  // Error — readonly!
profile.settings.theme = "light";  // KEIN Error! settings-Objekt ist NICHT readonly!
```

> **Merke:** Readonly\<T\> schuetzt nur die **erste Ebene**. Fuer tiefe
> Unveraenderlichkeit braucht man **DeepReadonly** — das bauen wir in
> Sektion 05 selbst.

---

## Wann welchen Modifier?

| Utility Type | Effekt | Typischer Einsatz |
|---|---|---|
| `Partial<T>` | Alle Props optional | Update-Operationen, Patch-Requests |
| `Required<T>` | Alle Props required | Validierte Daten, aufgeloeste Defaults |
| `Readonly<T>` | Alle Props readonly | Immutable State, Funktionsparameter |

> 💭 **Denkfrage:** Kann man Partial und Required kombinieren? Was waere
> `Required<Partial<User>>`?
>
> **Antwort:** `Required<Partial<User>>` macht erst alles optional und
> dann alles required — das Ergebnis ist identisch mit dem Original `User`.
> Die Transformationen heben sich gegenseitig auf!

---

## Was du gelernt hast

- **Utility Types** transformieren bestehende Typen statt sie zu duplizieren
- **Partial\<T\>** macht alle Properties optional — ideal fuer Updates
- **Required\<T\>** macht alles verpflichtend — ideal nach Validierung
- **Readonly\<T\>** schuetzt vor Mutation, aber nur shallow (erste Ebene)
- Alle drei sind intern **Mapped Types** — sie iterieren ueber `keyof T`

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `Readonly<T>` und `as const`?
> **Kernpunkte:** Readonly\<T\> wirkt auf einen Typ (compile-time) | as const wirkt auf einen Wert | Readonly ist shallow, as const ist deep | as const erzeugt auch Literal Types

**Kernkonzept zum Merken:** Utility Types sind Type-Level-Funktionen — sie nehmen einen Typ als Input und geben einen transformierten Typ als Output zurueck.

> **Experiment:** Oeffne `examples/01-partial-required-readonly.ts` und
> experimentiere mit den drei Utility Types. Was passiert, wenn du
> `Readonly<Partial<User>>` verwendest?

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Die drei Modifier-Types
> sind die Grundlage fuer alles Weitere.
>
> Weiter geht es mit: [Sektion 02: Pick, Omit, Record](./02-pick-omit-record.md)
