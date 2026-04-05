# Sektion 1: Package.json exports und types-Feld

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Declaration Files richtig generieren](./02-declaration-files-generieren.md)

---

## Was du hier lernst

- Warum das `exports`-Feld in package.json den **Entrypunkt-Standard** abloes
- Wie du mit **Conditional Exports** verschiedene Builds fuer verschiedene Umgebungen lieferst
- Was das `types`-Feld bedeutet und wo TypeScript nach **.d.ts-Dateien** sucht
- Wie die **Module Resolution** deiner Library-Konsumenten funktioniert

---

## Hintergrund: Das Chaos der Entrypoints

> **Origin Story: Von main zu exports — 10 Jahre Evolution**
>
> In der Fruehzeit von npm (2011-2015) gab es genau ein Feld das bestimmte
> was ein `import` oder `require` zurueckgibt: `"main": "./index.js"`.
> Das war einfach — aber es konnte nur EINEN Entrypoint definieren.
>
> Dann kamen Bundler (Webpack, Rollup) und erfanden eigene Felder:
> `"module"` fuer ES Modules, `"browser"` fuer Browser-Builds.
> TypeScript erfand `"types"` und `"typings"` fuer .d.ts-Dateien.
> Jedes Tool las andere Felder — ein Albtraum fuer Library-Autoren.
>
> Node.js 12.7 (2019) fuehrte `"exports"` ein: ein standardisiertes,
> erweiterares System das ALLE Anwendungsfaelle abdeckt. Heute ist
> `exports` der empfohlene Weg — und TypeScript 4.7+ versteht es.

Als Library-Autor ist die package.json deine **Schnittstelle zur Welt**.
Sie bestimmt, was Konsumenten importieren koennen, welche Dateien sie
bekommen, und wie TypeScript die Typen findet.

---

## Das exports-Feld

```typescript annotated
// package.json — Modernes Setup mit exports
{
  "name": "my-utils",
  "version": "1.0.0",
  "type": "module",
  // ^ Wichtig: Definiert dass .js-Dateien als ES Modules behandelt werden

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // ^ MUSS an erster Stelle stehen! TypeScript liest von oben nach unten
      "import": "./dist/index.js",
      // ^ Fuer: import { x } from "my-utils"
      "require": "./dist/index.cjs"
      // ^ Fuer: const { x } = require("my-utils")
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
      // ^ Fuer: import { helper } from "my-utils/utils"
    }
  }
}
// ^ "exports" definiert EXAKT was importierbar ist
// ^ Alles was nicht in exports steht ist NICHT importierbar
// ^ Das ist ein Sicherheitsfeature: Interne Dateien bleiben privat
```

> 🧠 **Erklaere dir selbst:** Warum muss "types" VOR "import" und "require" stehen? Was passiert wenn die Reihenfolge falsch ist?
> **Kernpunkte:** TypeScript und Node.js lesen das exports-Objekt von oben nach unten | Die erste passende Bedingung gewinnt | Wenn "import" vor "types" steht: TypeScript findet keine Typen | "types" ist TypeScript-spezifisch — Node.js ignoriert es

---

## Legacy-Felder vs. exports

Fuer maximale Kompatibilitaet brauchst du oft beides:

```typescript annotated
// package.json — Vollstaendige Konfiguration
{
  "name": "my-utils",
  "version": "1.0.0",
  "type": "module",

  // === MODERN: exports (Node.js 12.7+, TypeScript 4.7+) ===
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },

  // === LEGACY: Fuer aeltere Tools die exports nicht verstehen ===
  "main": "./dist/index.cjs",
  // ^ Fallback fuer require() in altem Node.js
  "module": "./dist/index.js",
  // ^ Fallback fuer Bundler (Webpack 4, aelteres Rollup)
  "types": "./dist/index.d.ts"
  // ^ Fallback fuer TypeScript < 4.7 und Tools die exports ignorieren
}
// ^ Moderne Tools nutzen "exports"
// ^ Aeltere Tools fallen auf main/module/types zurueck
// ^ Reihenfolge der Felder in der Datei spielt keine Rolle
```

> 💭 **Denkfrage:** Wenn sowohl `exports.".".types` als auch das
> Top-Level `types`-Feld gesetzt sind — welches nutzt TypeScript?
>
> **Antwort:** TypeScript 4.7+ mit `moduleResolution: "node16"` oder
> `"bundler"` nutzt `exports`. TypeScript mit `moduleResolution: "node"`
> (Legacy) nutzt das Top-Level `types`-Feld. Setze beides fuer
> maximale Kompatibilitaet.

---

## Subpath Exports: Mehrere Entrypoints

```typescript annotated
// package.json — Library mit mehreren Entrypoints
{
  "name": "@company/design-system",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    // ^ import { Button } from "@company/design-system"

    "./components": {
      "types": "./dist/components/index.d.ts",
      "import": "./dist/components/index.js"
    },
    // ^ import { Button } from "@company/design-system/components"

    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "import": "./dist/hooks/index.js"
    },
    // ^ import { useTheme } from "@company/design-system/hooks"

    "./styles": "./dist/styles/index.css",
    // ^ import "@company/design-system/styles"

    "./package.json": "./package.json"
    // ^ Ermoeglicht: import pkg from "@company/design-system/package.json"
    // ^ Nuetzlich fuer Versionspruefung
  }
}
```

> ⚡ **Framework-Bezug (Angular):** Angular-Libraries nutzen seit Angular 14
> Subpath Exports extensiv. Wenn du `@angular/common` importierst, nutzt
> Angular das exports-Feld um `@angular/common`, `@angular/common/http`
> und `@angular/common/testing` als separate Entrypoints zu definieren.
> Das ermoeglicht Tree-Shaking: Wenn du nur `@angular/common/http` importierst,
> wird der Rest von `@angular/common` nicht in dein Bundle aufgenommen.

---

## Wildcard Exports

Fuer Libraries mit vielen Dateien:

```typescript annotated
// package.json
{
  "exports": {
    ".": "./dist/index.js",
    "./*": "./dist/*.js"
    // ^ Wildcard: import { x } from "my-lib/helpers" → ./dist/helpers.js
    // ^ VORSICHT: Exponiert ALLE Dateien in dist/ — auch interne!
  }
}

// Besser: Explizite Exports
{
  "exports": {
    ".": "./dist/index.js",
    "./helpers": "./dist/helpers.js",
    "./validators": "./dist/validators.js"
    // ^ Nur diese 3 Pfade sind importierbar
    // ^ Alles andere: "Module not found"
  }
}
// ^ Explizite Exports sind sicherer — keine versehentlichen Expositionen
// ^ Wildcard Exports sind OK fuer interne Monorepo-Pakete
```

---

## Module Resolution in TypeScript

Wie findet TypeScript die Typen deiner Library? Es haengt von
`moduleResolution` ab:

```typescript annotated
// tsconfig.json des KONSUMENTEN deiner Library
{
  "compilerOptions": {
    "moduleResolution": "bundler"
    // ^ Empfohlen fuer Projekte mit Bundler (Vite, webpack, esbuild)
    // ^ Versteht: exports, imports, #private-imports
    // ^ Versteht: .ts-Extensions in Imports (nicht nur .js)

    // "moduleResolution": "node16"
    // ^ Empfohlen fuer reines Node.js (ohne Bundler)
    // ^ Versteht: exports, benoetigt .js-Extension in relativen Imports

    // "moduleResolution": "node"
    // ^ LEGACY — versteht exports NICHT!
    // ^ Sucht: main → types → index.d.ts
    // ^ Vermeiden in neuen Projekten
  }
}

// Was TypeScript bei "import { x } from 'my-lib'" tut:
// 1. Findet node_modules/my-lib/package.json
// 2. Liest "exports".".".types → "./dist/index.d.ts"
// 3. Nutzt die Typen aus dieser Datei
// ^ Wenn kein "types" in exports: Sucht .d.ts neben der .js-Datei
```

> 🧪 **Experiment:** Erstelle ein minimales package.json und beobachte
> wie TypeScript die Typen findet:
>
> ```json
> {
>   "name": "test-pkg",
>   "exports": {
>     ".": {
>       "types": "./types/index.d.ts",
>       "import": "./dist/index.js"
>     }
>   }
> }
> ```
>
> Erstelle `types/index.d.ts` mit `export function greet(name: string): string;`
> und importiere `test-pkg` in einem Projekt. Beobachte: TypeScript findet
> die Typen ueber das exports-Feld.

---

## Was du gelernt hast

- Das **exports-Feld** in package.json definiert was importierbar ist (und was nicht)
- **"types" muss VOR "import"/"require"** stehen — TypeScript liest von oben nach unten
- **Legacy-Felder** (main, module, types) fuer Kompatibilitaet mit aelteren Tools beibehalten
- **Subpath Exports** ermoeglichen mehrere Entrypoints (`"./hooks"`, `"./components"`)
- **moduleResolution: "bundler"** oder **"node16"** ist noetig um exports zu verstehen

**Kernkonzept zum Merken:** Die package.json ist der Vertrag zwischen deiner Library und der Welt. Das exports-Feld ist der moderne Standard — es definiert praezise was importierbar ist, ermoeglicht Dual CJS/ESM, und fuehrt TypeScript zu den richtigen .d.ts-Dateien. Setze "types" IMMER an erste Stelle.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt,
> wie Libraries ihre Entrypoints definieren.
>
> Weiter geht es mit: [Sektion 02: Declaration Files richtig generieren](./02-declaration-files-generieren.md)
