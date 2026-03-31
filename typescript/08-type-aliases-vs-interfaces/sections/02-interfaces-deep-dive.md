# Sektion 2: Interfaces Deep Dive

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Type Aliases Deep Dive](./01-type-aliases-deep-dive.md)
> Naechste Sektion: [03 - Der grosse Vergleich](./03-der-grosse-vergleich.md)

---

## Was du hier lernst

- Warum **Declaration Merging** ein Feature und kein Bug ist
- Wie **extends-Ketten** eine Vererbungshierarchie fuer Typen schaffen
- Was **implements** bedeutet und wie Klassen Interfaces umsetzen
- Wann und warum man ein Interface **reopenen** wuerde

---

## Interfaces: Der Bauplan fuer Objekte

Waehrend `type` ein Allzweck-Werkzeug ist, hat `interface` einen klaren
Fokus: Es beschreibt die **Form eines Objekts**. Nicht mehr, nicht weniger.

```typescript annotated
interface User {
  name: string;
  age: number;
  email: string;
// ^ Drei Properties. Das ist alles was interface "will": Objekt-Formen beschreiben.
}

const user: User = {
  name: "Max",
  age: 30,
  email: "max@example.com",
};
```

Bis hierhin koennte man `type` und `interface` austauschen. Die wirklichen
Unterschiede kommen jetzt.

---

## Declaration Merging — das Killer-Feature von interface

Declaration Merging ist die Faehigkeit, die `type` NICHT hat und die
`interface` einzigartig macht. Du kannst ein Interface **mehrfach deklarieren**
und TypeScript fuegt alle Deklarationen **automatisch zusammen**:

```typescript annotated
interface Config {
  host: string;
  port: number;
}

// Spaeter im selben Scope oder in einer anderen Datei:
interface Config {
  database: string;
// ^ Kein Fehler! TypeScript fuegt die Deklarationen zusammen.
}

// Config hat jetzt ALLE drei Properties:
const config: Config = {
  host: "localhost",
  port: 5432,
  database: "myapp",
// ^ Alle drei sind Pflicht, obwohl sie in zwei Bloecken deklariert wurden.
};
```

> 📖 **Hintergrund: Warum hat TypeScript Declaration Merging eingefuehrt?**
>
> Declaration Merging wurde 2012 eingefuehrt, um ein sehr konkretes Problem
> zu loesen: **Typ-Definitionen fuer existierende JavaScript-Bibliotheken**.
>
> Stell dir vor, du schreibst Typ-Definitionen fuer jQuery. jQuery hat ein
> riesiges API — hunderte von Methoden. Es waere unmoeglich, alles in einem
> einzigen Interface zu schreiben. Mit Declaration Merging koennen verschiedene
> Dateien oder Plugins ihre eigenen Methoden zum jQuery-Interface hinzufuegen.
>
> Dasselbe Prinzip nutzen heute Express, Mongoose, und Prisma. Wenn du
> `express.Request` um eigene Properties erweiterst (z.B. `req.user`),
> nutzt du Declaration Merging — oft ohne es zu wissen.

### Declaration Merging mit type: Geht nicht!

```typescript
type Config = { host: string };
// type Config = { database: string };
// ^ Error: Duplicate identifier 'Config'.
// type erlaubt KEINE doppelte Deklaration!
```

Das ist der fundamentale Unterschied: `type` ist eine einmalige Definition.
`interface` ist eine **erweiterbare** Definition.

### Praxis: Express Request erweitern

Das haeufigste reale Beispiel fuer Declaration Merging:

```typescript annotated
// In deiner express-app.d.ts:
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
// ^ Fuegt 'user' zum Express Request hinzu.
// Jetzt hat JEDER req.user — ohne dass du Express umschreiben musst.
    }
  }
}

// In deinem Middleware-Code:
// req.user = { id: "123", role: "admin" };
// TypeScript kennt jetzt req.user!
```

> 🧠 **Erklaere dir selbst:** Warum ist Declaration Merging fuer Bibliotheks-Autoren
> so wichtig? Was waere die Alternative, wenn es Declaration Merging nicht gaebe?
> **Kernpunkte:** Bibliothek definiert Basis-Interface | Nutzer erweitert es |
> Alternative: Generics oder Wrapper-Typen (weniger ergonomisch) | Module
> Augmentation basiert auf Declaration Merging

---

## extends — Vererbung fuer Interfaces

Interfaces koennen von anderen Interfaces (oder Type Aliases!) **erben**:

```typescript annotated
interface HasId {
  id: string;
}

interface HasTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface User extends HasId, HasTimestamps {
// ^ User erbt von BEIDEN Interfaces. Mehrfach-Vererbung ist erlaubt!
  name: string;
  email: string;
}

// User hat jetzt: id, createdAt, updatedAt, name, email
const user: User = {
  id: "abc",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "Max",
  email: "max@example.com",
};
```

### extends mit type

Ein Interface kann sogar von einem Type Alias erben — solange der Type Alias
einen Objekttyp beschreibt:

```typescript annotated
type HasRole = {
  role: "admin" | "user" | "guest";
};

interface Employee extends HasRole {
// ^ Interface extends Type Alias — das funktioniert!
  name: string;
  department: string;
}
```

> 💭 **Denkfrage:** Kann ein Interface von einem Union Type erben?
> z.B. `interface X extends string | number` — geht das?
>
> **Antwort:** Nein! `extends` funktioniert nur mit Objekttypen (und Klassen).
> Ein Union Type ist kein einzelner Objekttyp. Das ist ein weiterer Fall,
> wo `type` und `interface` sich unterschiedlich verhalten.

---

## implements — Klassen und Interfaces

Das `implements`-Keyword verbindet die Welt der Typen mit der Welt
der Klassen. Es sagt: "Diese Klasse MUSS alle Properties und Methoden
dieses Interfaces haben."

```typescript annotated
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Loggable {
  log(message: string): void;
}

class UserModel implements Serializable, Loggable {
// ^ Die Klasse MUSS serialize(), deserialize() und log() implementieren.
// TypeScript prueft das zur Compilezeit!

  constructor(public name: string, public age: number) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, age: this.age });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.age = parsed.age;
  }

  log(message: string): void {
    console.log(`[UserModel] ${message}`);
  }
}
```

### implements mit Type Aliases

Ueberraschung: Klassen koennen auch Type Aliases implementieren — aber nur
wenn der Type Alias einen Objekttyp beschreibt:

```typescript annotated
type Printable = {
  print(): void;
};

class Report implements Printable {
// ^ Funktioniert! Solange der Type Alias ein Objekttyp ist.
  print(): void {
    console.log("Report printed.");
  }
}

// ABER:
type StringOrNumber = string | number;
// class Bad implements StringOrNumber {}
// ^ Error! Kann keinen Union Type implementieren.
```

> 📖 **Hintergrund: implements vs. extends bei Klassen**
>
> `extends` bei Klassen erstellt echte JavaScript-Vererbung — die Kind-Klasse
> erbt den Code der Eltern-Klasse. `implements` dagegen ist ein **reines
> Compilezeit-Konzept** (Type Erasure!). Es prueft nur, ob die Klasse die
> richtige Form hat. Kein Code wird geerbt.
>
> In Java und C# ist `implements` (fuer Interfaces) vs. `extends` (fuer Klassen)
> eine strikte Trennung. In TypeScript ist die Grenze verschwommener, weil
> das Typsystem strukturell ist.

---

## Reopening — Interfaces gezielt erweitern

"Reopening" ist Declaration Merging in der Praxis. Hier sind die
haeufigsten Anwendungsfaelle:

### 1. Globale Typen erweitern

```typescript annotated
// Window-Objekt um eine eigene Property erweitern:
interface Window {
  __APP_CONFIG__: {
    apiUrl: string;
    debug: boolean;
  };
}
// ^ Jetzt kennt TypeScript window.__APP_CONFIG__!

// In deinem Code:
// window.__APP_CONFIG__ = { apiUrl: "/api", debug: true };
```

### 2. Library-Typen erweitern

```typescript annotated
// Prisma-Client um custom Methoden erweitern:
declare module '@prisma/client' {
  interface PrismaClient {
    $softDelete(model: string, id: string): Promise<void>;
  }
}
```

### 3. Environment-Variablen typisieren

```typescript annotated
// process.env typisieren (Node.js):
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

// Jetzt: process.env.DATABASE_URL ist string (nicht string | undefined)
```

> ⚡ **Praxis-Tipp:** In Angular-Projekten ist Reopening besonders nuetzlich
> fuer `@angular/core`-Erweiterungen und custom Service-Contracts.
> In Next.js-Projekten nutzt man es fuer `next-auth`-Session-Erweiterungen.

---

## Was du gelernt hast

- **Declaration Merging** fuegt mehrere Interface-Deklarationen automatisch zusammen
- **extends** ermoeglicht Vererbungs-Ketten (auch mit Type Aliases als Basis)
- **implements** verbindet Klassen mit Interfaces (oder Type Aliases)
- **Reopening** erweitert globale und Library-Typen

> 🧠 **Erklaere dir selbst:** Wann ist Declaration Merging ein Vorteil und wann
> eine Gefahr? Stell dir vor, zwei Teammitglieder deklarieren dasselbe Interface
> in verschiedenen Dateien mit widersprüchlichen Properties — was passiert?
> **Kernpunkte:** Vorteil fuer Libraries und globale Erweiterungen | Gefahr
> wenn unkontrolliert | Widersprueche erzeugen Compile-Fehler bei gleichen
> Property-Namen mit unterschiedlichen Typen | Team-Konventionen wichtig

**Kernkonzept zum Merken:** Interfaces sind fuer **erweiterbare Objekttypen** gemacht.
Declaration Merging ist kein Bug — es ist der Hauptgrund, warum Interfaces existieren.

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du kennst jetzt die
> einzigartigen Staerken beider Seiten.
>
> Weiter geht es mit: [Sektion 03: Der grosse Vergleich](./03-der-grosse-vergleich.md)
