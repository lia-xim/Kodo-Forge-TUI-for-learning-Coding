# Sektion 4: Module Augmentation — Bestehende Typen erweitern

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Declaration Files](./03-declaration-files.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Wie **Module Augmentation** (`declare module`) bestehende Library-Typen erweitert ohne die Library zu veraendern
- Warum **Global Augmentation** (`declare global`) notwendig ist und wie du `Window`, `ProcessEnv` und andere globale Typen erweiterst
- Den Mechanismus hinter Augmentation: **Interface Merging** in TypeScript
- Warum der `export {}` Trick funktioniert und wann du ihn brauchst

---

## Hintergrundgeschichte: Das Express-Problem — und die elegante Loesung

Stell dir vor: Du baust eine Express.js-API mit TypeScript. Du hast eine
Authentifizierungs-Middleware, die den aktuellen Nutzer in das Request-Objekt
schreibt:

```javascript
// auth-middleware.js (vereinfacht)
app.use((req, res, next) => {
  req.user = await getUserFromToken(req.headers.authorization);
  next();
});
```

In deinen Route-Handlers willst du `req.user` nutzen. Aber TypeScript weiss
von nichts:

```typescript
app.get('/profile', (req, res) => {
  console.log(req.user.name);
  //               ^^^^ Fehler! Property 'user' does not exist on type 'Request'
});
```

Die naive Loesung waere `(req as any).user` — aber das wirft die gesamte
Typsicherheit weg. Die elegante Loesung: **Module Augmentation**.

Du kannst TypeScript sagen: "Das `Request`-Interface von Express hat noch
eine Property, die ich hinzugefuegt habe." Ohne den Express-Quellcode
zu veraendern, ohne ein Fork, ohne `@types/express` zu patchen.

Das ist **Module Augmentation** — und es ist einer der maechtgsten Mechanismen
in TypeScript.

---

## Interface Merging — Der Mechanismus hinter allem

TypeScript hat eine spezielle Regel: **Interfaces mit gleichem Namen werden gemerged**.

```typescript annotated
interface User {
  name: string;
}

interface User {
  email: string;
}

// TypeScript mergt beide zu:
// interface User { name: string; email: string; }

const user: User = {
  name: "Max",
  email: "max@example.com"
  // ^ Beide Properties sind Pflicht — TypeScript hat die Interfaces gemerged!
};
```

Das klingt vielleicht unerwuenscht, aber es ist **der Kern** des gesamten
Augmentation-Systems. Wenn du ein Modul augmentierst, nutzt du genau diesen
Mechanismus: Du definierst ein Interface das den gleichen Namen hat wie eines
in der Library — TypeScript mergt sie.

---

## Module Augmentation — Express erweitern

```typescript annotated
// src/types/express.d.ts

import 'express';
// ^ WICHTIG: Dieser Import macht die Datei zu einem ES-Modul.
//   Ohne ihn waere die Datei ein "Script" — und declare module wuerde
//   ein komplett neues Modul erstellen statt das bestehende zu erweitern.

declare module 'express' {
// ^ "Ich erweitere das 'express'-Modul" — muss genau mit dem Import-String matchen!

  interface Request {
  // ^ Interface Merging: TypeScript mergt das mit dem echten Request-Interface
    user?: {
      id: string;
      role: 'admin' | 'user' | 'guest';
      email: string;
    };
    // ^ Optional (?) weil bei oeffentlichen Routen kein User existiert

    requestId: string;
    // ^ Jede Request bekommt eine eindeutige ID (von deiner Middleware gesetzt)

    startTime: number;
    // ^ Fuer Performance-Logging: wann hat die Request begonnen?
  }
}
```

```typescript annotated
// In deinen Route-Handlers ist req jetzt vollstaendig typsiert:
app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nicht eingeloggt' });
  }

  const { id, role, email } = req.user;
  // ^ TypeScript weiss: user hat id, role, email. Keine any!

  const duration = Date.now() - req.startTime;
  // ^ Auch startTime ist typsiert. Autocomplete funktioniert!

  res.json({ id, role, email, requestDuration: duration });
});
```

---

## Global Augmentation — Globale Typen erweitern

Manchmal musst du **globale** Typen erweitern — `Window`, `NodeJS.ProcessEnv`,
oder gar neue globale Interfaces einfuehren.

```typescript annotated
// src/types/env.d.ts

declare global {
// ^ "declare global" erweitert den globalen Scope — kein Modulname noetig

  interface Window {
  // ^ Das globale Window-Interface erweitern
    gtag: (command: string, targetId: string, config?: object) => void;
    // ^ Google Analytics ist per <script> geladen — global verfuegbar
    __APP_VERSION__: string;
    // ^ Von deinem Build-Tool injiziert (Vite define, Webpack DefinePlugin)
  }

  namespace NodeJS {
  // ^ Node.js-spezifische Typen (verfuegbar wenn @types/node installiert)
    interface ProcessEnv {
    // ^ process.env typsicher machen
      NODE_ENV: 'development' | 'production' | 'test';
      // ^ Nicht string — nur diese drei Werte sind gueltig!
      DATABASE_URL: string;
      // ^ Pflichtfeld — kein "| undefined" = TypeScript glaubt, es existiert immer
      API_KEY: string;
      PORT?: string;
      // ^ Optional: nicht immer gesetzt
    }
  }
}

export {};
// ^ KRITISCH: Diese Zeile macht die Datei zu einem ES-Modul.
//   Ohne sie ist die Datei ein "Script" und "declare global" ist nicht erlaubt
//   in einem Script-Kontext — es muss ein Modul sein um global zu augmentieren.
```

```typescript annotated
// Jetzt ueberall typsicher:
const db = process.env.DATABASE_URL;
//                      ^^^^^^^^^^^^ string (nicht string | undefined!)
//                      Weil wir es als Pflichtfeld deklariert haben.
//                      ACHTUNG: TypeScript glaubt dir — wenn DATABASE_URL
//                      fehlt, gibt es einen Laufzeitfehler, keinen TS-Fehler.

window.__APP_VERSION__;
// ^ string — TypeScript weiss von der globalen Variable.
//   Ohne Augmentation: "Property '__APP_VERSION__' does not exist on type 'Window'"
```

---

> **Experiment:** Oeffne den TypeScript Playground und teste das `export {}`-Trick:
>
> ```typescript
> // Variante 1: Ohne export {} — die Datei ist ein "Script"
> declare global {
>   interface Window {
>     myProp: string;
>   }
> }
> // Kopiere diesen Code in den Playground. Du wirst einen Fehler sehen:
> // "Augmentations for the global scope can only be directly nested in
> //  external modules or ambient module declarations."
>
> // Variante 2: Mit export {} — die Datei wird zum Modul
> export {};
> declare global {
>   interface Window {
>     myProp: string;
>   }
> }
> // Jetzt funktioniert es! window.myProp wird typsiert.
> ```
>
> Warum macht eine einzelne leere Zeile den Unterschied? Weil TypeScript
> eine Datei als "Modul" behandelt wenn sie mindestens einen `import` oder
> `export` hat. `export {}` ist der minimale "Trick" um das zu erreicheen.

---

## Namespace Augmentation

Neben Interfaces koennen auch Namespaces erweitert werden. Das ist selten,
aber manchmal notwendig fuer Libraries die Namespaces verwenden:

```typescript annotated
// Fuer Libraries die ihren eigenen Namespace exportieren
declare namespace MyLibrary {
// ^ Namespace-Erweiterung ohne "declare module" — direkt im globalen Scope

  interface Config {
    theme: 'light' | 'dark';
    // ^ Neue Property zum Config-Interface hinzufuegen
    locale: string;
  }
}

// Haeufiger: Bestehende Namespaces via declare module erweitern
declare module 'some-library' {
  namespace Internal {
    interface Options {
      timeout: number;
    }
  }
}
```

---

**In deinem Angular-Projekt:**
Angular nutzt Augmentation intern fuer den Dependency Injection-Mechanismus.
Aber auch du wirst Augmentation brauchen — zum Beispiel wenn du eigene
Schnittstellen fuer HTTP-Interceptors oder Router-Guards typsisieren willst:

```typescript annotated
// src/types/angular-router.d.ts — Angular Router-State erweitern

import '@angular/router';

declare module '@angular/router' {
  interface Data {
  // ^ Das Route Data-Interface erweitern — wird in RouterModule verwendet
    breadcrumb?: string;
    // ^ Jetzt koennen Routes eine breadcrumb-Property in "data" haben
    requiredRole?: 'admin' | 'user';
    // ^ Typsicher: Nur diese Rollen sind erlaubt
    title?: string;
    // ^ Fuer dynamische Page-Titles (alternativ zu Angular's TitleStrategy)
  }
}
```

```typescript annotated
// In deiner router-config.ts:
const routes: Routes = [
  {
    path: 'admin',
    data: {
      breadcrumb: 'Verwaltung',
      requiredRole: 'admin'
      //             ^^^^^^^ TypeScript prueft: muss 'admin' | 'user' sein!
    },
    component: AdminComponent
  }
];
```

---

> **Erklaere dir selbst:** Warum funktioniert Module Augmentation? Was ist der
> Mechanismus den TypeScript verwendet wenn du `declare module 'express'` in einer
> Datei und `import express from 'express'` in einer anderen Datei schreibst?
> Wie "weiss" TypeScript, dass sie zusammengehoeren?
>
> **Kernpunkte:**
> - Interface Merging: gleiche Interface-Namen werden zusammengefuehrt
> - TypeScript sammelt alle `.d.ts`-Dateien und alle `declare module`-Bloecke
> - Beim Type-Checking mergt TypeScript alle Definitionen fuer 'express' zusammen
> - Die Reihenfolge der Dateien ist egal — TypeScript sieht alles im Projekt

---

> **Denkfrage:** Module Augmentation ist maechtg, aber sie hat eine Schwaeche:
> Sie ist "global" fuer dein Projekt. Wenn du `Request.user` augmentierst,
> gilt das ueberall — auch in Teilen des Codes die kein `user` kennen sollten.
> Wie koennte man das Problem loesen? Gibt es eine Alternative zu Augmentation?

---

## Was du gelernt hast

- **Module Augmentation** (`declare module 'x'`) erweitert bestehende Library-Typen durch Interface Merging
- **Global Augmentation** (`declare global`) erweitert den globalen Scope — `Window`, `ProcessEnv`, etc.
- **`export {}`** macht eine Datei zum ES-Modul — ohne es funktioniert `declare global` nicht
- **Interface Merging** ist der Mechanismus: TypeScript fuegt Interfaces mit gleichem Namen zusammen
- Die augmentierende Datei muss ein ES-Modul sein (mindestens einen `import` oder `export` haben)

**Kernkonzept:** Augmentation ist "friedliche" Erweiterung — du veraenderst keine Library, sondern ergaenzst TypeScripts Bild von ihr. Das ist Open/Closed Principle auf Typ-Ebene: offen fuer Erweiterung, geschlossen fuer Veraenderung.

---

> **Pausenpunkt** — Module Augmentation ist einer jener TypeScript-Features
> die viele Entwickler jahrelang nicht kennen — und dann fragen sie sich,
> wie sie je ohne ihn gearbeitet haben. Du weisst jetzt, wie Express, Angular
> und andere Libraries intern erweitert werden koennen.
>
> Weiter geht es mit: [Sektion 05 — Praxis-Patterns und Triple-Slash-Directives](./05-praxis-patterns.md)
