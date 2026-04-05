# Sektion 2: Module Augmentation

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Interface Merging Basics](./01-interface-merging-basics.md)
> Naechste Sektion: [03 - Global Augmentation](./03-global-augmentation.md)

---

## Was du hier lernst

- Wie man mit `declare module` Typen aus **fremden Paketen** erweitert
- Die Syntax und Regeln von **Module Augmentation**
- Den Unterschied zwischen **Augmentation** (Erweitern) und **Overriding** (Ueberschreiben)
- Typische Anwendungsfaelle: Express, React, Vue erweitern

---

## Hintergrund: Das Plugin-Problem

> **Feature Origin Story: Module Augmentation**
>
> TypeScript 1.8 (Februar 2016) fuehrte Module Augmentation ein.
> Der Anlass: Bibliotheken wie Express hatten ein Plugin-System wo
> Middleware neue Properties zum `Request`-Objekt hinzufuegt (z.B.
> `req.user` nach Authentifizierung). Aber die Typ-Definition von
> Express wusste nichts von diesen Erweiterungen.
>
> Die Entwickler standen vor einem Dilemma: Entweder `(req as any).user`
> (unsicher) oder den gesamten Request-Typ neu definieren (unpraktisch).
> Module Augmentation loeste das elegant: Man deklariert die Erweiterung
> in einer eigenen Datei, und TypeScript mergt sie automatisch mit
> der originalen Typ-Definition.
>
> Heute ist Module Augmentation der Standardweg um Drittanbieter-Typen
> zu erweitern — in Express, React, Vue, Prisma und vielen anderen.

---

## Die Syntax: `declare module`

```typescript annotated
// types/express-extension.d.ts

// WICHTIG: 'declare module' mit dem EXAKTEN Modulnamen:
declare module "express-serve-static-core" {
  // ^ Der Modulname muss EXAKT dem npm-Paketnamen oder dem internen
  //   Modulpfad entsprechen. Bei Express ist es der interne Name.

  interface Request {
    // ^ Interface Merging! Erweitert das existierende Request-Interface.
    user?: {
      id: string;
      name: string;
      role: "admin" | "user";
    };
    sessionId?: string;
    requestTime: number;
  }
}

// Jetzt in deinem Express-Code:
// app.get("/profile", (req, res) => {
//   if (req.user) {
//     res.json({ name: req.user.name }); // Typsicher!
//   }
// });
```

> 🧠 **Erklaere dir selbst:** Warum steht `declare module` in einer `.d.ts`
> Datei und nicht in einer normalen `.ts` Datei? Was wuerde passieren
> wenn man es in einer `.ts` Datei verwenden wuerde?
>
> **Kernpunkte:** `.d.ts` ist eine Typ-Deklarationsdatei — nur Typen, kein Code |
> In normalen `.ts` Dateien funktioniert `declare module` auch, ABER: Die Datei
> muss ein "module" sein (mindestens ein import/export) | Ohne import/export
> wuerde TypeScript die Datei als "Script" (global) behandeln |
> `.d.ts` ist die Konvention fuer Typ-Erweiterungen

---

## Wichtige Regeln

### Regel 1: Die Datei muss ein Modul sein

```typescript annotated
// FALSCH — Datei ist ein "Script" (kein import/export):
declare module "express" {
  interface Request {
    user?: { id: string };
  }
}
// ^ Das funktioniert manchmal, aber ist fragil.
//   TypeScript behandelt die Datei als globale Deklaration.

// RICHTIG — Datei ist ein Modul (hat mindestens ein import oder export):
import type { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}
// ^ Der import macht die Datei zum Modul.
//   Alternativ: export {} am Ende der Datei.
```

### Regel 2: Man kann nur ERWEITERN, nicht ueberschreiben

```typescript annotated
// Man kann neue Properties HINZUFUEGEN:
declare module "express-serve-static-core" {
  interface Request {
    customProp: string; // NEU — wird hinzugefuegt
  }
}

// Man kann NICHT den Typ eines existierenden Properties AENDERN:
// declare module "express-serve-static-core" {
//   interface Request {
//     body: MyCustomType; // FEHLER wenn body schon anders definiert ist!
//   }
// }
```

### Regel 3: Modulname muss exakt stimmen

```typescript annotated
// Express exportiert Request aus "express-serve-static-core", NICHT "express":
declare module "express-serve-static-core" { // RICHTIG
  interface Request { user?: User; }
}

// declare module "express" { // FALSCH — falscher interner Modulname
//   interface Request { user?: User; }
// }
// ^ Das wuerde ein NEUES Interface erstellen statt das existierende zu erweitern!
```

> 💭 **Denkfrage:** Wie findest du den richtigen Modulnamen fuer eine
> Augmentation? Was passiert wenn du den falschen Namen verwendest?
>
> **Antwort:** 1. Schaue in den `.d.ts`-Dateien des Pakets (node_modules/@types/...).
> 2. Suche nach `declare module "..."` oder dem Export-Pfad.
> 3. Falscher Name → kein Merging, sondern ein neues, separates Modul.
> TypeScript gibt keinen Fehler — deine Erweiterung existiert einfach
> im falschen Namespace und hat keine Wirkung.

---

## Praxis: React Types erweitern

```typescript annotated
// CSS Custom Properties in React typsicher machen:
import "react";

declare module "react" {
  interface CSSProperties {
    // Custom CSS Properties (CSS Variables):
    "--primary-color"?: string;
    "--spacing"?: string;
    "--font-size"?: string;
    // ^ Ohne Augmentation: CSSProperties akzeptiert nur bekannte CSS-Properties.
    //   Mit Augmentation: Custom Properties sind typsicher!
  }
}

// Verwendung in JSX:
// <div style={{ "--primary-color": "#ff0000", "--spacing": "8px" }} />
// ^ Jetzt typsicher! Ohne Augmentation waere das ein Compile-Error.
```

> **Experiment:** Schaue in `node_modules/@types/react/index.d.ts`
> (oder `node_modules/react/index.d.ts` bei neueren React-Versionen).
> Suche nach `interface CSSProperties`. Du wirst sehen:
>
> ```typescript
> interface CSSProperties extends CSS.Properties<string | number> {
>   // Hier koennten schon Erweiterungen stehen
> }
> ```
>
> Jede Augmentation die du schreibst wird mit diesem Interface gemergt.
> Das ist der Mechanismus hinter styled-components, emotion und
> anderen CSS-in-JS-Bibliotheken.

---

## Augmentation fuer eigene Module

Module Augmentation funktioniert auch mit eigenen Modulen:

```typescript annotated
// === math-utils.ts ===
export function add(a: number, b: number): number {
  return a + b;
}

// === math-extensions.ts ===
// Erweitere math-utils mit neuen Exporten:
declare module "./math-utils" {
  // ^ Relativer Pfad — bezieht sich auf das lokale Modul
  export function multiply(a: number, b: number): number;
}

// ABER: Du musst die Implementierung SELBST hinzufuegen!
// Augmentation deklariert nur den TYP, nicht den CODE.
// In der Praxis verwendet man das selten fuer eigene Module.
```

> ⚡ **In deinem Angular-Projekt** ist Module Augmentation nuetzlich fuer:
>
> ```typescript
> // 1. Environment-Typen:
> declare module "src/environments/environment" {
>   interface Environment {
>     analyticsKey: string;
>     featureFlags: Record<string, boolean>;
>   }
> }
>
> // 2. Material Theme-Erweiterungen:
> declare module "@angular/material/core" {
>   interface ThemePalette {
>     custom: string; // Eigene Palette-Farbe
>   }
> }
>
> // 3. HttpContext-Tokens:
> // Angular's HttpContext kann mit Augmentation typsicher erweitert werden.
> ```

---

## Augmentation vs. Wrapper vs. Fork

| Ansatz | Wann verwenden? | Nachteile |
|---|---|---|
| **Augmentation** | Neue Properties/Methoden hinzufuegen | Nur Interface-Erweiterung, kein Override |
| **Wrapper-Typ** | Existierende Typen transformieren | Zusaetzliche Abstraktion |
| **Fork der .d.ts** | Fundamentale Typ-Aenderungen | Muss bei Updates manuell gepflegt werden |
| **Patch-Package** | Runtime-Aenderungen am Paket | Fragil, kann bei Updates brechen |

---

## Was du gelernt hast

- `declare module "paketname"` erweitert die Typen eines fremden Moduls
- Die Datei muss ein **Modul** sein (mindestens ein import oder export)
- Man kann Properties **hinzufuegen** aber nicht den Typ existierender Properties **aendern**
- Der **Modulname** muss exakt stimmen — sonst wird ein neues Modul erstellt
- Module Augmentation ist der Standard fuer Express, React, Vue-Erweiterungen

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> Interface Merging (Sektion 1) und Module Augmentation?
>
> **Kernpunkte:** Interface Merging = zwei Deklarationen im SELBEN Modul |
> Module Augmentation = Erweiterung eines FREMDEN Moduls |
> Module Augmentation nutzt Interface Merging INNERHALB von declare module |
> Augmentation = "Ich oeffne das fremde Modul und fuege etwas hinzu"

**Kernkonzept zum Merken:** Module Augmentation ist "Interface Merging
ueber Modul-Grenzen hinweg". Du oeffnest ein fremdes Modul mit
`declare module` und nutzt Interface Merging um es zu erweitern.

---

> **Pausenpunkt** -- Du kannst jetzt fremde Module erweitern.
> Naechstes Thema: Globale Augmentation — wenn es nicht um Module geht.
>
> Weiter geht es mit: [Sektion 03: Global Augmentation](./03-global-augmentation.md)
