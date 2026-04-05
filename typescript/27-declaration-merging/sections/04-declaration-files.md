# Sektion 4: Declaration Files (.d.ts)

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Global Augmentation](./03-global-augmentation.md)
> Naechste Sektion: [05 - Praxis: Express und React erweitern](./05-praxis-express-react.md)

---

## Was du hier lernst

- Was `.d.ts`-Dateien sind und wann man sie **selbst schreiben** muss
- Wie man mit `tsc --declaration` automatisch `.d.ts`-Dateien **generiert**
- Die Syntax fuer `declare function`, `declare class`, `declare const`
- Wie DefinitelyTyped und `@types/*`-Pakete funktionieren

---

## Hintergrund: Typen fuer JavaScript-Code

> **Feature Origin Story: DefinitelyTyped**
>
> 2012, als TypeScript erschien, gab es tausende JavaScript-Bibliotheken
> ohne Typen. Boris Yankov startete das DefinitelyTyped-Repository auf
> GitHub — eine Community-Sammlung von `.d.ts`-Dateien fuer populaere
> JavaScript-Pakete.
>
> Heute ist DefinitelyTyped eines der groessten Open-Source-Projekte:
> Ueber 8.000 Typ-Definitionen, gepflegt von tausenden Freiwilligen.
> Wenn du `npm install @types/express` ausfuehrst, installierst du eine
> `.d.ts`-Datei aus diesem Repository.
>
> Die Idee war revolutionaer: Typen koennen **unabhaengig** vom Code
> existieren und verteilt werden. Das ermoeglichte TypeScript's Adoption
> ohne dass bestehende JavaScript-Bibliotheken umgeschrieben werden
> mussten. Heute liefern immer mehr Pakete ihre Typen selbst mit —
> aber DefinitelyTyped bleibt unverzichtbar.

---

## Was ist eine .d.ts-Datei?

```typescript annotated
// math-lib.d.ts — NUR Typ-Deklarationen, KEIN Code!

// declare = "Dieser Wert existiert zur Laufzeit, ich beschreibe nur den Typ"
declare function add(a: number, b: number): number;
// ^ Kein Funktionskoerper! Nur die Signatur.

declare function subtract(a: number, b: number): number;

declare const PI: number;
// ^ Wert existiert irgendwo im JavaScript — hier nur der Typ

declare class Calculator {
  constructor(precision: number);
  calculate(expression: string): number;
  readonly history: string[];
  // ^ Properties und Methoden ohne Implementierung
}

// Interface und Type brauchen kein 'declare' — sie sind immer rein deklarativ:
interface MathResult {
  value: number;
  precision: number;
  formatted: string;
}

type Operation = "add" | "subtract" | "multiply" | "divide";
```

> 🧠 **Erklaere dir selbst:** Warum brauchen `interface` und `type` kein
> `declare`-Keyword, aber `function`, `class` und `const` schon?
>
> **Kernpunkte:** interface und type existieren NUR im Typsystem — sie haben
> nie eine Laufzeit-Repraesentaiton | function, class, const existieren
> auch zur Laufzeit → declare sagt: "Vertrau mir, die Implementierung
> kommt von woanders" | declare = "Ich beschreibe, was EXISTIERT"

---

## .d.ts automatisch generieren

TypeScript kann `.d.ts`-Dateien automatisch aus deinem Code generieren:

```typescript annotated
// tsconfig.json:
{
  "compilerOptions": {
    "declaration": true,
    // ^ Generiert .d.ts neben jeder .js-Datei
    "declarationDir": "./dist/types",
    // ^ Ablage-Ordner fuer .d.ts-Dateien
    "emitDeclarationOnly": true
    // ^ NUR .d.ts generieren, kein JavaScript (nuetzlich mit Bundlern)
  }
}

// Eingabe: src/utils.ts
export function formatCurrency(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

export interface CurrencyConfig {
  locale: string;
  currency: string;
  decimals: number;
}

// Generierte Ausgabe: dist/types/utils.d.ts
// export declare function formatCurrency(cents: number): string;
// export interface CurrencyConfig {
//   locale: string;
//   currency: string;
//   decimals: number;
// }
// ^ Der Compiler extrahiert NUR die Typ-Informationen.
//   Die Implementierung (Funktionskoerper) ist weg.
```

> 💭 **Denkfrage:** Warum generiert man `.d.ts`-Dateien? Koennen andere
> Projekte nicht einfach die `.ts`-Dateien direkt verwenden?
>
> **Antwort:** 1. Performance: `.d.ts` ist schneller zu parsen als `.ts`
> (kein Code-Analyse noetig). 2. Bibliotheken: npm-Pakete liefern `.js`
> + `.d.ts`, nicht `.ts` (Quellcode bleibt privat). 3. JavaScript-
> Kompatibilitaet: `.d.ts` beschreibt existierenden JS-Code.

---

## Eigene .d.ts fuer JavaScript-Bibliotheken schreiben

Manchmal gibt es kein `@types/*`-Paket. Dann musst du selbst ran:

```typescript annotated
// Beispiel: Eine alte JavaScript-Bibliothek "legacy-charts"
// die keine Typen hat und kein @types-Paket existiert.

// types/legacy-charts.d.ts:
declare module "legacy-charts" {
  // ^ Modul-Deklaration fuer den Paketnamen

  export interface ChartOptions {
    type: "bar" | "line" | "pie";
    width: number;
    height: number;
    data: DataPoint[];
    colors?: string[];
  }

  export interface DataPoint {
    label: string;
    value: number;
  }

  export class Chart {
    constructor(element: HTMLElement, options: ChartOptions);
    render(): void;
    update(data: DataPoint[]): void;
    destroy(): void;
  }

  // Default Export:
  export default function createChart(
    selector: string,
    options: ChartOptions
  ): Chart;
}

// Jetzt im Code:
// import createChart, { Chart, ChartOptions } from "legacy-charts";
// const chart = createChart("#chart", { type: "bar", width: 800, ... });
// ^ Voll typsicher!
```

> **Experiment:** Schaue in einem deiner Projekte in `node_modules/@types/`.
> Oeffne z.B. `@types/node/index.d.ts` oder `@types/express/index.d.ts`.
> Du wirst sehen:
>
> ```
> @types/node/index.d.ts        → ca. 100 Zeilen (Re-Exports)
> @types/node/fs.d.ts           → ca. 3000 Zeilen (File System Typen)
> @types/node/http.d.ts         → ca. 1500 Zeilen (HTTP Typen)
> ```
>
> Diese Dateien sind das Typ-"Skelett" fuer Node.js — sie beschreiben
> was existiert, ohne eine einzige Zeile Implementierung.

---

## Wildcards und Nicht-JS-Module

Fuer Dateitypen die kein JavaScript sind:

```typescript annotated
// types/assets.d.ts

// Bilder:
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import type { FC, SVGAttributes } from "react";
  const SVGComponent: FC<SVGAttributes<SVGElement>>;
  export default SVGComponent;
}

// CSS Modules:
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

// JSON Dateien (falls nicht mit resolveJsonModule):
declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

// Jetzt im Code:
// import logo from "./logo.png";      // string (URL)
// import Icon from "./icon.svg";      // React Component
// import styles from "./app.module.css"; // { [className]: string }
```

> ⚡ **In deinem Angular-Projekt** brauchst du selten `.d.ts`-Dateien fuer
> Assets, weil Angular CLI das uebernimmt. Aber fuer eigene Bibliotheken:
>
> ```typescript
> // projects/shared-lib/src/public-api.d.ts
> // Angular Bibliotheken (ng-packagr) generieren .d.ts automatisch
> // mit dem 'declaration' Flag in tsconfig.lib.json.
> //
> // Wenn du eine Angular-Library erstellst:
> // ng generate library shared-lib
> // → tsconfig.lib.json hat "declaration": true
> // → ng build shared-lib generiert .d.ts in dist/
> ```
>
> In Next.js:
>
> ```typescript
> // next-env.d.ts — wird automatisch generiert:
> /// <reference types="next" />
> /// <reference types="next/image-types/global" />
> // ^ Triple-Slash Directives: Verweisen auf Typ-Pakete
> ```

---

## tsconfig.json: Typ-Dateien einbinden

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./types", "./node_modules/@types"],
    // ^ Wo TypeScript nach .d.ts sucht (Standard: nur node_modules/@types)
    "types": ["node", "jest"],
    // ^ Welche @types-Pakete automatisch eingebunden werden
    //   ACHTUNG: Wenn "types" gesetzt ist, werden NUR diese eingebunden!
    //   Ohne "types" werden ALLE @types-Pakete eingebunden.
  },
  "include": [
    "src/**/*.ts",
    "types/**/*.d.ts"
    // ^ Eigene .d.ts-Dateien muessen im include-Pfad liegen
  ]
}
```

---

## Was du gelernt hast

- `.d.ts`-Dateien enthalten NUR Typ-Deklarationen — kein ausführbarer Code
- `declare` bedeutet: "Dieser Wert existiert zur Laufzeit, ich beschreibe nur den Typ"
- `tsc --declaration` generiert `.d.ts` automatisch aus TypeScript-Code
- **DefinitelyTyped** (`@types/*`) stellt Community-Typen fuer JavaScript-Bibliotheken bereit
- **Wildcard-Module** (`*.png`, `*.css`) typisieren Nicht-JavaScript-Imports

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `declare function add(a: number, b: number): number` in einer `.d.ts`
> und `function add(a: number, b: number): number` in einer `.ts`?
>
> **Kernpunkte:** `.d.ts` = nur Deklaration, keine Implementierung |
> `.ts` = Deklaration + Implementierung | declare = "existiert woanders" |
> In `.d.ts` ist ALLES implizit declare — das Keyword ist optional

**Kernkonzept zum Merken:** `.d.ts`-Dateien sind TypeScript's Bruecke
zur JavaScript-Welt. Sie beschreiben was existiert, ohne es zu
implementieren — wie ein Architekturplan ohne das Gebaeude.

---

> **Pausenpunkt** -- Du verstehst Declaration Files.
> In der letzten Sektion kombinieren wir alles in der Praxis.
>
> Weiter geht es mit: [Sektion 05: Praxis: Express und React erweitern](./05-praxis-express-react.md)
