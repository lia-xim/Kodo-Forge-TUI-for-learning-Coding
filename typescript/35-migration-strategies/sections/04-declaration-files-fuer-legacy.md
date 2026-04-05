# Sektion 4: Declaration Files fuer Legacy-Code

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Strict Mode stufenweise aktivieren](./03-strict-mode-stufenweise.md)
> Naechste Sektion: [05 - Typische Migrationsprobleme und Loesungen](./05-typische-migrationsprobleme.md)

---

## Was du hier lernst

- Wann und warum du **.d.ts-Dateien** fuer bestehenden Code schreiben musst
- Wie du **Deklarationsdateien fuer untypisierte Bibliotheken** erstellst
- Den Unterschied zwischen **ambient** und **module** Declarations
- Wie du **globale Variablen** und **Window-Erweiterungen** typisierst

---

## Hintergrund: Warum .d.ts fuer Legacy-Code?

> **Origin Story: DefinitelyTyped — Die groesste Type-Bibliothek der Welt**
>
> Als TypeScript populaer wurde, hatten die meisten npm-Pakete keine
> Typ-Definitionen. Die Community gruendete DefinitelyTyped — ein GitHub-
> Repository mit .d.ts-Dateien fuer Tausende von Bibliotheken. Heute
> hat DefinitelyTyped ueber 8.000 Pakete und ist das groesste Type-
> Repository der Welt (installierbar als @types/paketname).
>
> Aber was ist mit DEINEM Legacy-Code? Interne Bibliotheken, alte jQuery-
> Plugins, proprietaere APIs? Dafuer gibt es keine @types-Pakete — du
> musst die .d.ts-Dateien selbst schreiben. Und genau das lernst du hier.

In einer Migration triffst du auf drei Kategorien von untypisiertem Code:

1. **npm-Pakete ohne Typen** → @types installieren oder .d.ts schreiben
2. **Interne JavaScript-Bibliotheken** → .d.ts neben die .js-Datei legen
3. **Globale Variablen** (window.config, Legacy-SDKs) → ambient declarations

---

## .d.ts fuer interne JavaScript-Module

Wenn du eine JavaScript-Datei hast, die du (noch) nicht migrieren willst,
kannst du eine .d.ts-Datei daneben legen:

```typescript annotated
// src/legacy/analytics.js — bestehendes JavaScript
// (Hunderte Zeilen Legacy-Code, Migration zu aufwendig)

// src/legacy/analytics.d.ts — Typ-Deklaration
// ^ GLEICHER Name, andere Endung → TypeScript findet sie automatisch

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void;
// ^ Deklariert die Funktion OHNE Implementation
// ^ TypeScript nutzt diesen Typ fuer alle Importe

export function trackPageView(url: string): void;

export interface AnalyticsConfig {
  trackingId: string;
  debug?: boolean;
  samplingRate?: number;
}

export function init(config: AnalyticsConfig): void;
// ^ Jeder Import von './legacy/analytics' hat jetzt volle Typen
// ^ Autocomplete funktioniert, Fehler werden erkannt
```

> 🧠 **Erklaere dir selbst:** Warum reicht eine .d.ts-Datei — prueft TypeScript nicht, ob die JavaScript-Datei wirklich zu den Deklarationen passt?
> **Kernpunkte:** .d.ts ist ein "Versprechen" an den Compiler | TypeScript vertraut der .d.ts blind | Keine Pruefung ob .js und .d.ts uebereinstimmen | Es ist DEINE Verantwortung | Das ist wie ein API-Contract — der Server muss ihn einhalten

---

## Ambient Declarations fuer globale Variablen

Legacy-Code nutzt oft globale Variablen die nicht importiert werden:

```typescript annotated
// Problem: Legacy-Code setzt globale Variablen
// <script src="config.js"></script>
// config.js: window.APP_CONFIG = { apiUrl: '...', version: '2.1' };

// In TypeScript: "Property 'APP_CONFIG' does not exist on type 'Window'"
// Loesung: Ambient Declaration

// src/types/globals.d.ts
declare global {
  interface Window {
    APP_CONFIG: {
      apiUrl: string;
      version: string;
      debug?: boolean;
    };
    // ^ Erweitert das Window-Interface um APP_CONFIG
    // ^ Declaration Merging: Das bestehende Window-Interface wird ergaenzt

    analytics: {
      track(event: string, data?: Record<string, unknown>): void;
    };
    // ^ Weitere globale Variable (z.B. Google Analytics)
  }

  // Globale Variablen ohne 'window.':
  var __DEV__: boolean;
  // ^ declare var fuer Variablen die direkt (ohne window.) verfuegbar sind
  // ^ Typisch fuer Build-Tools (webpack DefinePlugin, Vite define)
}

export {};
// ^ WICHTIG: Diese Zeile macht die Datei zum Modul
// ^ Ohne export {} ist 'declare global' nicht erlaubt in einer Moduldatei
```

> 💭 **Denkfrage:** Warum braucht man `export {}` am Ende der Datei?
> TypeScript unterscheidet zwischen "Script" (global scope) und "Module"
> (eigener Scope). Was passiert ohne export {}?
>
> **Antwort:** Ohne export {} ist die Datei ein "Script" — alles darin
> landet im globalen Scope. `declare global {}` funktioniert aber nur
> in Modul-Dateien (mit mindestens einem import/export). `export {}`
> ist der kuerzeste Weg, eine Datei zum Modul zu machen.

---

## .d.ts fuer untypisierte npm-Pakete

Wenn `@types/paketname` nicht existiert:

```typescript annotated
// Schritt 1: Pruefen ob @types existiert
// npm info @types/dein-paket → not found

// Schritt 2: Minimale .d.ts erstellen
// src/types/dein-paket.d.ts

declare module "legacy-chart-lib" {
  // ^ Modulname muss EXAKT dem import-Pfad entsprechen

  export interface ChartOptions {
    width: number;
    height: number;
    data: number[];
    color?: string;
  }

  export class Chart {
    constructor(element: HTMLElement, options: ChartOptions);
    render(): void;
    update(data: number[]): void;
    destroy(): void;
  }

  export default function createChart(
    element: HTMLElement,
    options: ChartOptions
  ): Chart;
}

// Jetzt funktioniert:
// import createChart from "legacy-chart-lib";
// const chart = createChart(el, { width: 800, height: 600, data: [1,2,3] });
// ^ Volle Typen, Autocomplete, Fehlerpruefung
```

Fuer den schnellen Einstieg — wenn du nur willst, dass der Compiler
nicht meckert:

```typescript annotated
// src/types/quick-fix.d.ts — "Notloesung" fuer viele untypisierte Pakete

declare module "legacy-lib-1";
// ^ Alles aus diesem Modul ist 'any'
// ^ Kein Typfehler, aber auch kein Typ-Schutz

declare module "legacy-lib-2";
declare module "old-utils";
// ^ Eine Zeile pro Paket — das Minimum

// BESSER: Schrittweise verfeinern
declare module "legacy-lib-1" {
  export function doSomething(input: string): string;
  // ^ Nur die Funktionen typisieren die du TATSAECHLICH verwendest
  // ^ Den Rest erstmal weglassen
}
```

> ⚡ **Framework-Bezug (React):** In React-Projekten brauchst du haeufig
> .d.ts fuer CSS-Module, Bilder und andere nicht-JS-Imports:
>
> ```typescript
> // src/types/assets.d.ts
> declare module "*.css" {
>   const classes: { [key: string]: string };
>   export default classes;
> }
> declare module "*.svg" {
>   const content: string;
>   export default content;
> }
> declare module "*.png" {
>   const content: string;
>   export default content;
> }
> ```
>
> Ohne diese Deklarationen wuerden CSS-Imports Fehler erzeugen.

---

## Qualitaetsstufen fuer .d.ts

Du musst nicht sofort perfekte Typen schreiben. Es gibt Stufen:

```typescript annotated
// Stufe 1: "Existiert" (Minimum)
declare module "analytics-sdk";
// ^ Alles ist any — kein Schutz, aber kein Fehler

// Stufe 2: "Grundstruktur" (gut genug fuer den Alltag)
declare module "analytics-sdk" {
  export function init(key: string): void;
  export function track(event: string, props?: object): void;
}
// ^ Die wichtigsten Funktionen sind getypt

// Stufe 3: "Vollstaendig" (Production-Level)
declare module "analytics-sdk" {
  export interface TrackingEvent {
    name: string;
    properties?: Record<string, string | number | boolean>;
    timestamp?: Date;
  }
  export function init(config: { key: string; debug?: boolean }): void;
  export function track(event: TrackingEvent): Promise<void>;
  export function identify(userId: string, traits?: Record<string, unknown>): void;
  export function page(name: string, properties?: Record<string, unknown>): void;
}
// ^ Volle Typen — Autocomplete, Fehlererkennung, Dokumentation
```

> 🧪 **Experiment:** Erstelle eine minimale .d.ts fuer ein Modul:
>
> ```typescript
> // 1. Erstelle src/types/test-module.d.ts:
> declare module "test-module" {
>   export function greet(name: string): string;
> }
>
> // 2. Verwende es in einer .ts-Datei:
> import { greet } from "test-module";
> const msg = greet("TypeScript"); // Typ: string
> const fail = greet(42);          // FEHLER: number ist nicht string
>
> // 3. Beobachte: TypeScript prueft den Typ obwohl "test-module" nicht existiert!
> ```
>
> .d.ts-Dateien sind Versprechen — TypeScript vertraut ihnen blind.

---

## Was du gelernt hast

- **.d.ts-Dateien** neben .js-Dateien geben Legacy-Code Typen ohne Migration
- **Ambient Declarations** (`declare global`) typisieren globale Variablen und Window-Erweiterungen
- **Module Declarations** (`declare module`) typisieren untypisierte npm-Pakete
- Es gibt **drei Qualitaetsstufen**: Minimum (alles any), Grundstruktur, Vollstaendig
- `export {}` macht eine Datei zum **Modul** — noetig fuer `declare global`

**Kernkonzept zum Merken:** .d.ts-Dateien sind Vertraege zwischen deinem TypeScript-Code und untypisiertem Code. Sie beschreiben was existiert, ohne es zu implementieren. Fange mit dem Minimum an und verfeinere schrittweise — jede Stufe gibt mehr Sicherheit.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du weisst jetzt, wie du
> untypisiertem Code Typen gibst.
>
> Weiter geht es mit: [Sektion 05: Typische Migrationsprobleme und Loesungen](./05-typische-migrationsprobleme.md)
