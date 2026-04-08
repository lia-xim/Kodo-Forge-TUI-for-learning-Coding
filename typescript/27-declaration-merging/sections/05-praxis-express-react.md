# Sektion 5: Praxis — Express und React erweitern

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Declaration Files (.d.ts)](./04-declaration-files.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie man **Express-Middleware** typsicher typisiert (Request, Response erweitern)
- Wie man **React-Typen** erweitert (JSX IntrinsicElements, Theme, Refs)
- Ein vollstaendiges Beispiel: **Authentifizierungs-Middleware** mit Declaration Merging
- Haeufige Fehler und **Debugging-Tipps** bei Augmentations

---

## Hintergrund: Warum Frameworks Declaration Merging brauchen

> **Feature Origin Story: Express und das req-Problem**
>
> Express.js (2010, TJ Holowaychuk) hat ein elegantes Middleware-Konzept:
> Jede Middleware kann das Request-Objekt veraendern bevor es an die
> naechste Middleware weitergegeben wird. `passport.js` fuegt `req.user`
> hinzu, `express-session` fuegt `req.session` hinzu, `body-parser`
> fuegt `req.body` hinzu.
>
> Das Problem: TypeScript's Request-Typ weiss nichts von diesen
> Erweiterungen. `@types/express` definiert ein Basis-Request-Interface —
> aber jede App hat andere Middleware. Die Loesung: Jede App erweitert
> den Request-Typ mit Declaration Merging fuer genau die Middleware die
> sie verwendet.
>
> Das ist ein Paradebeispiel fuer Declaration Merging in der Praxis:
> Ein Basis-Typ + projektspezifische Erweiterungen.

---

## Praxis 1: Express Authentication Middleware

```typescript annotated
// === types/express.d.ts ===
// Schritt 1: Express-Request erweitern

import type { User } from "../models/user";

declare module "express-serve-static-core" {
  // ^ WICHTIG: "express-serve-static-core", NICHT "express"!
  //   Express re-exportiert Request aus diesem internen Modul.

  interface Request {
    user?: User;
    // ^ Optional: Nur gesetzt nach erfolgreicher Authentifizierung
    isAuthenticated: boolean;
    // ^ Immer vorhanden — gesetzt durch Auth-Middleware
    requestId: string;
    // ^ Einzigartige Request-ID fuer Logging/Tracing
  }
}

// === middleware/auth.ts ===
// Schritt 2: Die Middleware die den Request erweitert

import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    req.isAuthenticated = false;
    // ^ TypeScript kennt isAuthenticated dank unserer Augmentation!
    return next();
  }

  const user = verifyToken(token);
  if (user) {
    req.user = user;
    // ^ TypeScript kennt req.user als User | undefined
    req.isAuthenticated = true;
  } else {
    req.isAuthenticated = false;
  }
  next();
}

// === routes/profile.ts ===
// Schritt 3: Typsichere Nutzung

import { Router } from "express";
const router = Router();

router.get("/profile", (req, res) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }

  // TypeScript narrowt: req.user ist jetzt User (nicht undefined)!
  res.json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
  // ^ Volle Typsicherheit — kein (req as any).user noetig!
});
```

> 🧠 **Erklaere dir selbst:** Warum ist der Modulname
> `"express-serve-static-core"` und nicht einfach `"express"`?
> Wie findet man den richtigen Namen?
>
> **Kernpunkte:** Express re-exportiert Request aus einem internen Modul |
> In node_modules/@types/express/index.d.ts steht: import * from "express-serve-static-core" |
> Man muss das QUELL-Modul erweitern, nicht das re-exportierende |
> Tipp: In der .d.ts-Datei des Pakets nach dem Interface suchen

---

## Praxis 2: React Custom Theme Types

```typescript annotated
// === types/theme.d.ts ===
// React + styled-components Theme erweitern

import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      error: string;
      success: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }
}

// Jetzt im Code:
// const Button = styled.button`
//   color: ${props => props.theme.colors.primary};
//   padding: ${props => props.theme.spacing.md};
// `;
// ^ theme.colors.primary ist typsicher — Autocomplete zeigt alle Farben!
// ^ Tippfehler wie theme.colors.primay → Compile-Error!
```

> 💭 **Denkfrage:** Was ist der Vorteil von typisierten Theme-Werten
> gegenueber einfachen Strings? CSS-Werte sind doch immer Strings?
>
> **Antwort:** 1. Autocomplete: Die IDE zeigt alle verfuegbaren Farben/Spacings.
> 2. Tippfehler-Schutz: `theme.colors.primay` → Compile-Error.
> 3. Refactoring: Farbe umbenennen → alle Stellen werden angezeigt.
> 4. Dokumentation: Der Typ IST die Theme-Dokumentation.

---

## Praxis 3: JSX IntrinsicElements fuer Web Components

```typescript annotated
// === types/web-components.d.ts ===
// Eigene Web Components in React/JSX typsicher machen

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      // Eigene Web Components:
      "app-header": {
        title: string;
        "show-logo"?: boolean;
        onNavigate?: (event: CustomEvent<string>) => void;
      };
      "data-table": {
        data: Array<Record<string, unknown>>;
        columns: string[];
        sortable?: boolean;
        onSort?: (event: CustomEvent<{ column: string; direction: "asc" | "desc" }>) => void;
      };
      "icon-button": {
        icon: string;
        label: string;
        variant?: "primary" | "secondary" | "ghost";
        disabled?: boolean;
        onClick?: () => void;
      };
    }
  }
}

// Jetzt in JSX:
// <app-header title="Dashboard" show-logo />
// ^ Typsicher! 'title' ist Pflicht, 'show-logo' optional.
// <app-header />  // COMPILE-ERROR: 'title' fehlt!
// <data-table data={users} columns={["name", "email"]} sortable />
```

> **Experiment:** Wenn du ein Angular-Projekt mit Custom Elements hast,
> probiere dieses Pattern in einem React-Teilprojekt. Der umgekehrte
> Weg funktioniert auch:
>
> ```typescript
> // Angular: Custom Elements Schema
> // In Angular brauchst du CUSTOM_ELEMENTS_SCHEMA im Module.
> // Die Typisierung erfolgt ueber Interface Augmentation:
>
> declare module "@angular/core" {
>   // Angular-spezifische Web Component Typisierung
>   // ist ueber Schemas geloest, nicht ueber JSX.IntrinsicElements.
>   // Aber das Prinzip — Declaration Merging — ist das gleiche.
> }
> ```

---

## Debugging: Wenn Augmentation nicht funktioniert
<!-- section:summary -->
Die haeufigsten Probleme und Loesungen:

<!-- depth:standard -->
Die haeufigsten Probleme und Loesungen:

```typescript annotated
// Problem 1: Augmentation wird ignoriert
// Ursache: Die .d.ts-Datei ist nicht in tsconfig.json eingebunden
// Loesung:
// {
//   "include": ["src/**/*.ts", "types/**/*.d.ts"]
//   //                          ^^^^^^^^^^^^^^^^ Fehlt das?
// }

// Problem 2: Falscher Modulname
// Ursache: "express" statt "express-serve-static-core"
// Debugging: node_modules/@types/express/index.d.ts oeffnen
//            und nach dem Interface suchen

// Problem 3: Datei ist kein Modul
// Ursache: Kein import/export in der .d.ts-Datei
// Loesung:
export {}; // Am Anfang oder Ende der Datei einfuegen

// Problem 4: TypeScript Cache
// Loesung: IDE neu starten oder:
// rm -rf node_modules/.cache
// npx tsc --build --clean

// Problem 5: Mehrere tsconfig-Dateien
// Ursache: Augmentation ist in tsconfig.json, aber nicht in tsconfig.app.json
// Loesung: Alle relevanten tsconfig-Dateien pruefen
```

> ⚡ **In deinem Angular-Projekt** sind die haeufigsten Augmentation-Probleme:
>
> ```
> 1. tsconfig.app.json vs tsconfig.json — Angular CLI nutzt tsconfig.app.json!
>    → types/**/*.d.ts muss in tsconfig.app.json stehen, nicht nur in tsconfig.json
>
> 2. Angular Strict Mode — strictTemplates kann mit Augmentations kollidieren
>    → Pruefen ob die erweiterten Typen mit Angular's Template-Compiler kompatibel sind
>
> 3. nx/monorepo — Jedes Projekt hat eigene tsconfig
>    → Augmentation muss in JEDEM betroffenen Projekt eingebunden sein
> ```

---

<!-- /depth -->
## Zusammenfassung: Declaration Merging in der Praxis

| Use Case | Ansatz | Datei |
|---|---|---|
| Express req.user | Module Augmentation | types/express.d.ts |
| React Theme | Module Augmentation | types/styled.d.ts |
| Web Components in JSX | Module Augmentation | types/web-components.d.ts |
| process.env | Global Augmentation | types/env.d.ts |
| window.analytics | Global Augmentation | types/window.d.ts |
| Eigene JS-Bibliothek | Declaration File | types/legacy-lib.d.ts |
| NPM-Paket ohne Typen | Declaration File | types/untyped-pkg.d.ts |

---

## Was du gelernt hast

- **Express-Middleware** typisiert man mit Module Augmentation auf `"express-serve-static-core"`
- **React-Themes** und **JSX-Elemente** werden mit Module Augmentation auf `"react"` und `"styled-components"` erweitert
- Der **richtige Modulname** ist entscheidend — immer in der `.d.ts`-Datei des Pakets nachschauen
- **Debugging**: tsconfig.json pruefen, export {} nicht vergessen, IDE-Cache leeren

> 🧠 **Erklaere dir selbst:** Warum ist Declaration Merging besser als
> `(req as any).user` fuer Express-Middleware?
>
> **Kernpunkte:** as any deaktiviert Typsicherheit komplett |
> Tippfehler werden nicht erkannt | Kein Autocomplete |
> Augmentation gibt volle Typsicherheit + Autocomplete |
> Augmentation ist dokumentierend — der Typ zeigt was die Middleware tut

**Kernkonzept zum Merken:** Declaration Merging ist die Bruecke zwischen
TypeScript's statischem Typsystem und JavaScript's dynamischer Natur.
Es erlaubt dir, die **Realitaet** deines Codes zu beschreiben — auch
wenn die Bibliotheks-Typen das nicht vorgesehen haben.

---

> **Ende der Lektion** -- Du beherrschst Declaration Merging — von
> Interface Basics bis hin zu Express- und React-Erweiterungen.
>
> Weiter geht es mit: [Lektion 28: Decorators](../../28-decorators/sections/01-decorator-grundlagen.md)
