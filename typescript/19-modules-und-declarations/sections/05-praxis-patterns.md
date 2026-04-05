# Sektion 5: Praxis-Patterns — Alles zusammen in echten Projekten

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Module Augmentation](./04-module-augmentation.md)

---

## Was du hier lernst

- Wie du Typen in einem echten Projekt **sinnvoll organisierst** — welche Datei gehoert wohin
- Was **Triple-Slash Directives** sind, warum sie existieren und wann du sie heute noch brauchst
- **Declaration Merging fuer Plugin-Systeme** — wie grosse Libraries wie Vue.js und VSCode das nutzen
- Die haeufigsten Modul-Fehler und ihre Loesungen — mit tiefem Verstaendnis warum sie auftreten

---

## Hintergrundgeschichte: Wie TypeScript selbst seine eigenen Typen organisiert

TypeScript ist Open Source und du kannst in `node_modules/typescript/lib/` schauen
wie das TypeScript-Team seine eigenen Typen organisiert. Du wirst dort Dateien
finden wie `lib.dom.d.ts` (ueber 18.000 Zeilen), `lib.es2015.promise.d.ts`,
`lib.es2022.array.d.ts` — jede beschreibt einen Teil der JavaScript-Standardbibliothek.

Was du nicht siehst: Eine einzige, monolithische Datei. Stattdessen das Gegenteil —
dutzende kleine, thematisch fokussierte `.d.ts`-Dateien die ueber Triple-Slash
Directives zusammengefuehrt werden.

```typescript
// lib.es2022.d.ts (vereinfacht, echte TypeScript-Library):
/// <reference lib="es2021" />
/// <reference lib="es2022.array" />
/// <reference lib="es2022.error" />
/// <reference lib="es2022.intl" />
/// <reference lib="es2022.object" />
/// <reference lib="es2022.string" />
```

Das ist der einzige legitime aktuelle Use-Case fuer Triple-Slash Directives:
**Typ-Libraries zusammenbauen**. Fuer Anwendungscode gibt es bessere Wege.

---

## Triple-Slash Directives — Geschichte und moderner Einsatz

Triple-Slash Directives (`/// <reference ... />`) waren die originale Loesung
um `.d.ts`-Dateien zu verlinken — bevor es `tsconfig.json` gab (vor TypeScript 1.5).
Heute sind sie meist veraltet, aber du wirst sie in aelterem Code sehen.

```typescript annotated
/// <reference types="node" />
// ^ Laedt @types/node — equivalent zu "node" in tsconfig.json "types"-Array.
//   HEUTE: Nutze lieber tsconfig.json. Aber manchmal in .d.ts-Dateien noetig
//   wenn die Datei alleine (ohne tsconfig-Kontext) verwendet werden soll.

/// <reference path="./custom-types.d.ts" />
// ^ Bezieht sich auf eine spezifische .d.ts-Datei via Pfad.
//   HEUTE: Nutze tsconfig.json "include" oder "files". Veraltet fuer Appcode.

/// <reference lib="es2022" />
// ^ Laedt eine TypeScript Built-in Library.
//   MODERNEN USE-CASE: In .d.ts-Dateien von Libraries die eine bestimmte
//   ES-Version voraussetzen, ohne tsconfig zu veraendern.
```

> **Wann brauchst du Triple-Slash Directives noch?**
> Fast nie — es sei denn du schreibst eine `.d.ts`-Datei fuer eine Library
> die eigenstaendig ohne `tsconfig.json` funktionieren muss.
> Fuer Anwendungscode: immer `tsconfig.json` bevorzugen.

---

## Pattern 1: Typen-Organisation in echten Projekten

Ein konsistentes System fuer Typen spart Stunden der Sucherei:

```
src/
  types/
    env.d.ts          # process.env und window.* Erweiterungen (Global Augmentation)
    global.d.ts       # Ambient Declarations fuer Script-geladene Libraries
    express.d.ts      # Module Augmentation fuer Express (oder anderes Framework)
    api.ts            # API-Response-Typen (echte TypeScript-Interfaces, kein declare)
    user.ts           # Domain-Typen: User, UserRole, UserConfig
    ui.ts             # UI-bezogene Typen: ButtonVariant, ThemeColor

  features/
    auth/
      auth.service.ts
      auth.types.ts   # Feature-spezifische Typen — DIREKT beim Feature
```

> **Faustregeln:**
> - `.d.ts` (mit declare) gehoert in `types/` — nur Ambient Declarations und Augmentations
> - Echte TypeScript-Interfaces und Types (`interface X {}`, `type X = ...`) gehoeren
>   in `.ts`-Dateien — sie koennen exportiert und importiert werden wie normaler Code
> - Feature-spezifische Typen gehoeren zum Feature, nicht in einen globalen `types/`-Ordner
> - Globale Augmentations (Window, ProcessEnv) gehoeren zentral in `types/`

---

## Pattern 2: Declaration Merging fuer Plugin-Systeme

Das ist einer der maechtigsten TypeScript-Patterns, den grosse Projekte nutzen.
Die Idee: Eine Base-Library definiert ein erweiterbares Interface. Plugins
erweitern es via Augmentation. Alles bleibt typsicher.

```typescript annotated
// base-framework.ts — die Kern-Library

export interface PluginOptions {
  name: string;
  version: string;
}
// ^ Basis-Optionen die JEDES Plugin hat

export interface AppConfig {
  plugins: PluginOptions[];
}
// ^ Basis-Config — wird von Plugins erweitert

export function createApp(config: AppConfig) {
  // Implementierung...
}
```

```typescript annotated
// plugin-auth.ts — ein Plugin erweitert die Config

import './base-framework';
// ^ Macht diese Datei zu einem Modul (noetig fuer Module Augmentation)

declare module './base-framework' {
// ^ Augmentiert das Base-Framework — Interface Merging!

  interface AppConfig {
    auth: {
      provider: 'oauth2' | 'jwt' | 'session';
      secret: string;
      tokenExpiry?: number;
    };
    // ^ Auth-Plugin fuegt auth-Property zu AppConfig hinzu
  }
}
```

```typescript annotated
// plugin-database.ts — zweites Plugin

import './base-framework';

declare module './base-framework' {
  interface AppConfig {
    database: {
      url: string;
      poolSize?: number;
      ssl?: boolean;
    };
    // ^ Datenbank-Plugin fuegt database-Property hinzu
  }
}
```

```typescript annotated
// main.ts — Alles zusammen

import { createApp } from './base-framework';
import './plugin-auth';
import './plugin-database';
// ^ Durch diese Imports werden die Augmentations aktiv

createApp({
  plugins: [{ name: 'auth', version: '1.0' }],
  auth: {
    provider: 'jwt',
    secret: process.env.JWT_SECRET!
    // ^ TypeScript prueft: provider muss 'oauth2' | 'jwt' | 'session' sein
  },
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: 10
    // ^ database ist typsicher durch plugin-database Augmentation
  }
});
```

> **Dieses Pattern kennst du bereits:** Vue.js, Vuex und Pinia nutzen genau das.
> Angular's HttpClient-Typen, Express-Middleware-Typen — alle basieren
> auf Declaration Merging. Es ist kein Nischen-Feature, es ist der Kern
> des TypeScript-Typ-Oekosystems.

---

> **Experiment:** Kopiere folgendes in den TypeScript Playground um
> Declaration Merging live zu sehen:
>
> ```typescript
> // Basis-Interface
> interface AppContext {
>   userId: string;
> }
>
> // "Plugin 1" erweitert es:
> interface AppContext {
>   theme: 'light' | 'dark';
> }
>
> // "Plugin 2" erweitert es weiter:
> interface AppContext {
>   locale: string;
> }
>
> // Ergebnis: TypeScript merged alle drei!
> const ctx: AppContext = {
>   userId: "123",
>   theme: "dark",
>   locale: "de-DE"
>   // ^ Alle drei Properties sind Pflicht — alle drei Interfaces wurden gemerged
> };
>
> // Probiere: Lasse eine Property weg. TypeScript zeigt sofort den Fehler.
> // Das ist Interface Merging in seiner reinsten Form.
> ```

---

## Die haeufigsten Modul-Fehler — mit Verstaendnis statt Googeln

```typescript annotated
// FEHLER 1: "Cannot find module 'x' or its corresponding type declarations"
import something from 'untyped-lib';
// Ursache: Library hat weder eingebaute Typen noch ein @types-Package
// Loesung A: npm install @types/untyped-lib (pruefe ob es existiert)
// Loesung B: Eigene .d.ts schreiben: declare module 'untyped-lib' { ... }
// Loesung C (schnell und schmutzig):
// In tsconfig.json: "noImplicitAny": false (nicht empfohlen!)
```

```typescript annotated
// FEHLER 2: "Augmentation of module 'x' not working" oder Types werden nicht erkannt
// Haeufige Ursache: Die augmentierende Datei ist kein Modul

// FALSCH — kein export/import => ist ein "Script", keine Augmentation!
declare module 'express' {
  interface Request { user?: User }
}

// RICHTIG — export {} macht es zum Modul
import 'express'; // oder irgendein anderer Import
declare module 'express' {
  interface Request { user?: User }
}
```

```typescript annotated
// FEHLER 3: "Declaration file for module 'x' not found"
// Ursache: Library hat .js aber keine .d.ts, und kein @types
// Loesung: Einfachste .d.ts erstellen
// types/x.d.ts:
declare module 'x' {
  const x: any;
  export default x;
}
// Das ist minimal — besser: richtige Typen schreiben
```

```typescript annotated
// FEHLER 4: Re-export von Typen mit isolatedModules
// FEHLER: "Re-exporting a type when '--isolatedModules' is set"
export { MyType } from './types';

// RICHTIG mit isolatedModules: true
export type { MyType } from './types';
// ^ TypeScript muss wissen: ist MyType ein Wert oder ein Typ?
//   Bei isolatedModules kann es andere Dateien nicht inspizieren.
//   "export type" sagt explizit: es ist nur ein Typ.
```

---

**In deinem Angular-Projekt:**
Der Fehler "Cannot find module" taucht besonders beim Upgrade von Angular-Versionen auf.
Angular 17+ verwendet `@angular/core` intern mit neuen Typen. Wenn deine Library-Typen
veraltet sind, helfen diese Schritte:

```typescript annotated
// tsconfig.json — Diagnose-Einstellungen

{
  "compilerOptions": {
    "traceResolution": true,
    // ^ TypeScript loggt wie es jeden Import aufloest.
    //   Hilfreich um zu verstehen WARUM ein Modul nicht gefunden wird.
    //   Nur temporaer aktivieren — erzeugt sehr viel Output!

    "diagnostics": true,
    // ^ Zeigt interne TypeScript-Diagnostik (Kompilierzeit, Speicher etc.)
    //   Fuer Performance-Diagnose bei grossen Projekten.

    "verbatimModuleSyntax": true
    // ^ Erzwingt dass Import-Syntax genau dem Output entspricht.
    //   "import type" muss fuer Typen verwendet werden — immer.
    //   Empfohlen fuer moderne TypeScript-Projekte (TS 5.0+).
  }
}
```

---

> **Erklaere dir selbst:** Du hast in dieser Lektion drei Arten von `.d.ts`-Dateien
> kennengelernt: (1) auto-generierte fuer Libraries, (2) eigene fuer untypisierte
> Libraries, (3) Augmentation-Dateien fuer bestehende Typen. Was ist der fundamentale
> Unterschied zwischen diesen drei Verwendungen? Wann erstellst du jede Variante?
>
> **Kernpunkte:**
> - Auto-generiert: Erstellst du nicht — `tsc --declaration` oder `ng-packagr` macht das
> - Eigene fuer untypisierte Libraries: Wenn `@types/x` nicht existiert — beschreibt externe Form
> - Augmentation: Wenn du eigene Properties zu bestehenden Typen hinzufuegst — erweitert bekannte Form
> - Unterschied: Neu-Beschreibung vs. Erweiterung. Augmentation kann das Original nicht entfernen oder veraendern.

---

> **Denkfrage:** Declaration Merging ist ein "opt-in"-Feature von TypeScript.
> Andere Typ-Systeme (Haskell, Rust, Flow) erlauben das nicht oder schraenken
> es stark ein. Warum koennte das so sein? Was sind die Risiken von Interface
> Merging fuer grosse Codebases? Wann kann Augmentation zu subtilen Fehlern fuehren?

---

## Was du gelernt hast

- **Typen-Organisation:** `.d.ts` fuer Ambient Declarations und Augmentations, `.ts` fuer echte exportierbare Typen, Feature-Typen beim Feature
- **Triple-Slash Directives** (`/// <reference ... />`) sind veraltet fuer Anwendungscode — nutze tsconfig.json
- **Declaration Merging fuer Plugin-Systeme** erlaubt erweiterbare, typsichere Architekturen ohne Quellcode-Aenderung
- **Die haeufigsten Fehler** (Cannot find module, Augmentation not working, Re-export-Fehler) haben klare Ursachen und Loesungen
- **`verbatimModuleSyntax: true`** (TS 5.0+) ist die moderne Empfehlung fuer klare Trennung von Typ- und Wert-Imports

**Kernkonzept:** Das TypeScript-Modul-System ist nicht nur Syntax — es ist ein vollstaendiges Typ-Infrastruktur-System. Declaration Files, Augmentation und Module Resolution zusammen ermoeglicht es, das gesamte JavaScript-Oekosystem mit Typen zu versehen, ohne eine Zeile JavaScript zu veraendern.

---

> **Pausenpunkt — Ende der Lektion**
>
> Du hast Modules & Declarations in voller Tiefe verstanden: von der Geschichte
> des Modul-Chaos ueber ES Modules und CommonJS-Interop bis zu Declaration Files,
> Augmentation und Plugin-Patterns. Das ist das Fundament um TypeScript in echten
> Projekten — Angular, Node.js, Library-Entwicklung — sicher zu navigieren.
>
> Naechste Lektion: [20 - Review Challenge Phase 2](../../20-review-challenge-phase-2/README.md)
