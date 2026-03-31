# Sektion 2: Pick, Omit, Record

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Partial, Required, Readonly](./01-partial-required-readonly.md)
> Naechste Sektion: [03 - Extract, Exclude, NonNullable](./03-extract-exclude-nonnullable.md)

---

## Was du hier lernst

- **Pick\<T, K\>** — Bestimmte Properties auswaehlen
- **Omit\<T, K\>** — Bestimmte Properties ausschliessen
- Warum Omit **nicht typsicher** ist und wie man das loest (StrictOmit)
- **Record\<K, V\>** — Typsichere Dictionaries erstellen

---

## Pick\<T, K\> — Properties auswaehlen

`Pick<T, K>` erstellt einen neuen Typ mit nur den angegebenen Properties:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Nur die oeffentlichen Felder:
type PublicUser = Pick<User, "id" | "name" | "email">;
// ^ { id: number; name: string; email: string }

// Fuer Login braucht man nur:
type LoginCredentials = Pick<User, "email" | "password">;
// ^ { email: string; password: string }
```

### Warum Pick statt ein neues Interface?

```typescript annotated
// SCHLECHT: Manuell — geht aus dem Tritt wenn User sich aendert
interface PublicUserManual {
  id: number;
  name: string;
  email: string;
}

// GUT: Automatisch abgeleitet — immer synchron mit User
type PublicUserAuto = Pick<User, "id" | "name" | "email">;
```

> **Pick ist typsicher:** Wenn du einen Key angibst, der nicht in T existiert,
> bekommst du einen Compile-Error. `Pick<User, "phone">` waere ein Fehler.

---

## Omit\<T, K\> — Properties ausschliessen

`Omit<T, K>` ist das Gegenteil von Pick — es entfernt die angegebenen Properties:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Alles AUSSER Passwort:
type SafeUser = Omit<User, "password">;
// ^ { id: number; name: string; email: string; createdAt: Date }

// Fuer die Erstellung — ohne id und createdAt (werden vom Server gesetzt):
type CreateUserInput = Omit<User, "id" | "createdAt">;
// ^ { name: string; email: string; password: string }
```

### Die Omit-Falle: Keine Typsicherheit bei den Keys!

```typescript annotated
// ACHTUNG: Omit akzeptiert BELIEBIGE Strings — kein Fehler!
type Broken = Omit<User, "passwort">;  // Tippfehler! Kein Error!
// ^ Das ist identisch mit User — "passwort" existiert nicht,
//   also wird nichts entfernt.
```

> 📖 **Hintergrund: Warum ist Omit nicht typsicher?**
>
> Omit ist definiert als `Omit<T, K extends string | number | symbol>` —
> K muss nur ein Property-Key-Typ sein, nicht zwingend ein Key von T.
> Das wurde bewusst so designed fuer Flexibilitaet (z.B. Omit mit
> berechneten Strings). Aber es ist eine haeufige Fehlerquelle.

### StrictOmit — Die typsichere Alternative

```typescript annotated
// Eigener StrictOmit der nur existierende Keys erlaubt:
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
//                   ^^^^^^^^^^^^^^ K MUSS ein Key von T sein!

type SafeUser = StrictOmit<User, "password">;     // OK
// type Broken = StrictOmit<User, "passwort">;     // Error! "passwort" ist kein Key von User
```

> 💡 **Best Practice:** Verwende StrictOmit in deinen Projekten als Standard.
> Es verhindert Tippfehler und macht Refactoring sicherer.

---

## Record\<K, V\> — Typsichere Dictionaries

`Record<K, V>` erstellt einen Typ mit Keys vom Typ K und Values vom Typ V:

```typescript annotated
// Einfaches Dictionary:
type UserMap = Record<string, User>;
// ^ { [key: string]: User }

// Mit spezifischen Keys (Union Literal):
type RolePermissions = Record<"admin" | "user" | "guest", string[]>;
// ^ {
//     admin: string[];
//     user: string[];
//     guest: string[];
//   }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
};
```

### Record vs Index Signature

```typescript annotated
// Index Signature — Keys sind beliebige Strings:
type MapA = { [key: string]: number };

// Record mit string — aequivalent:
type MapB = Record<string, number>;

// Record mit Union — VIEL praeziser:
type StatusCodes = Record<"ok" | "error" | "loading", string>;
// ^ Genau drei Keys — nicht mehr, nicht weniger!
```

### Record fuer Lookup-Tables

```typescript annotated
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface MethodConfig {
  hasBody: boolean;
  idempotent: boolean;
}

const methodConfigs: Record<HttpMethod, MethodConfig> = {
  GET:    { hasBody: false, idempotent: true },
  POST:   { hasBody: true,  idempotent: false },
  PUT:    { hasBody: true,  idempotent: true },
  DELETE: { hasBody: false, idempotent: true },
};
// ^ Fehlt ein Key? Compile-Error!
// ^ Falscher Key? Compile-Error!
```

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `Record<string, T>` und `Map<string, T>`?
> **Kernpunkte:** Record ist ein Typ-Alias fuer ein Objekt | Map ist eine Laufzeit-Datenstruktur | Record-Properties sind direkt zugaenglich (.key) | Map braucht .get()/.set() | Record ist JSON-serialisierbar

---

## Pick + Omit: Komplementaere Werkzeuge

```typescript annotated
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

// Pick: "Ich will NUR diese Felder"
type ProductSummary = Pick<Product, "id" | "name" | "price">;

// Omit: "Ich will ALLES AUSSER diese Felder"
type ProductPreview = Omit<Product, "stock" | "description">;

// Beide ergeben hier das gleiche Ergebnis!
// Wann welches? Pick bei wenigen gewuenschten, Omit bei wenigen ungewuenschten.
```

---

## Was du gelernt hast

- **Pick\<T, K\>** waehlt bestimmte Properties aus — typsicher
- **Omit\<T, K\>** schliesst Properties aus — NICHT typsicher (beliebige Strings)
- **StrictOmit** ist die sichere Alternative: `type StrictOmit<T, K extends keyof T> = Omit<T, K>`
- **Record\<K, V\>** erstellt typsichere Dictionaries mit definierten Keys

> 🧠 **Erklaere dir selbst:** Warum sollte man StrictOmit dem Standard-Omit vorziehen?
> **Kernpunkte:** Omit akzeptiert beliebige Strings | Tippfehler werden nicht erkannt | StrictOmit erzwingt existierende Keys | Refactoring-Sicherheit

**Kernkonzept zum Merken:** Pick und Omit sind wie SELECT und EXCEPT in SQL — sie waehlen Spalten (Properties) aus einer Tabelle (Typ) aus.

> **Experiment:** Oeffne `examples/02-pick-omit-record.ts` und probiere
> aus, was passiert wenn du bei Omit einen nicht-existierenden Key angibst.
> Vergleiche es dann mit StrictOmit.

---

> **Pausenpunkt** — Du kennst jetzt die wichtigsten Objekt-Transformationen.
>
> Weiter geht es mit: [Sektion 03: Extract, Exclude, NonNullable](./03-extract-exclude-nonnullable.md)
