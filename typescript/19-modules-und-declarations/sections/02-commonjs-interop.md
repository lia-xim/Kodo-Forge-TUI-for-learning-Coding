# Sektion 2: CommonJS Interop und Module Resolution

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - ES Modules](./01-es-modules.md)
> Naechste Sektion: [03 - Declaration Files](./03-declaration-files.md)

---

## Was du hier lernst

- Warum das JavaScript-Oekosystem **zwei inkompatible Modulsysteme** gleichzeitig hat und warum das noch lange so bleibt
- Was `esModuleInterop` in tsconfig.json wirklich macht — und was TypeScript dabei hinter den Kulissen generiert
- Wie **Module Resolution** funktioniert: wie TypeScript entscheidet, welche Datei ein `import` meint
- Warum `"moduleResolution": "bundler"` heute die richtige Wahl fuer die meisten Projekte ist

---

## Hintergrundgeschichte: Warum gibt es ueberhaupt zwei Modulsysteme?

Das Problem beginnt 2009. Node.js wurde veroeffentlicht und brauchte sofort
ein Modulsystem — Browser hatten noch keins, ES Modules existierten noch nicht.
Ryan Dahl und die Node.js-Community entschieden sich fuer **CommonJS** (CJS):

```javascript
// CommonJS — synchrones require()
const fs = require('fs');
const express = require('express');
module.exports = { myFunction };
```

Das war pragmatisch und funktionierte gut fuer Server-Code. Synchrones Laden
ist auf dem Dateisystem unproblematisch. In sieben Jahren wurden hunderttausende
npm-Packages in CommonJS geschrieben.

Dann kam 2015 der **ES Module Standard** (ES2015). Endlich eine offizielle,
statisch analysierbare Modulsyntax — aber asynchron, und im Browser nativ
verfuegbar. Das Problem: Das npm-Oekosystem war bereits riesig und vollstaendig
auf CommonJS aufgebaut.

Seitdem leben wir in einem Mischsystem:
- **npm-Packages:** Meistens CommonJS (aeltere), zunehmend ESM (neuere), manchmal beides
- **Browser-Code:** ESM (via Bundler wie Vite oder Webpack)
- **Node.js:** Seit v12 unterstuetzt beides — aber mit strikten Regeln

TypeScript muss dieses Chaos managen. Das ist der Grund fuer `esModuleInterop`,
`allowSyntheticDefaultImports` und die verschiedenen `moduleResolution`-Strategien.

---

## Das konkrete Problem: CJS-Module in ESM-Code importieren

```typescript annotated
// lodash ist ein CommonJS-Package:
// Es exportiert mit: module.exports = { chunk, map, filter, ... }
// Es hat KEINEN "default export" im ESM-Sinne

// Ohne esModuleInterop: true
import * as _ from 'lodash';  // Funktioniert — _ ist das module.exports-Objekt
import _ from 'lodash';       // FEHLER! "Module has no default export"
// ^ TypeScript weiss: lodash hat kein ESM-default, also kein Default Import

// Mit esModuleInterop: true
import _ from 'lodash';       // Funktioniert jetzt!
// ^ TypeScript generiert Hilfscode der CJS module.exports als "default" wrapt
```

Was TypeScript hinter den Kulissen bei `esModuleInterop: true` generiert:

```typescript annotated
// Du schreibst:
import _ from 'lodash';

// TypeScript generiert (vereinfacht):
const _1 = require('lodash');
const _ = _1.__esModule ? _1 : { default: _1 };
// ^ Wenn lodash ein ESM-Modul waere (hat __esModule-Flag), nimm es direkt.
//   Sonst: Wrape es als { default: modul } — damit der Default Import funktioniert.
// Das ist der "synthetic default import"
```

---

## tsconfig.json — Die wichtigen Modul-Optionen

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    // ^ Was TypeScript AUSGIBT. ESNext = modernes ES Module Format.
    //   Andere Optionen: "CommonJS" (fuer Node.js ohne Bundler), "Node16"

    "moduleResolution": "bundler",
    // ^ Wie TypeScript IMPORTS AUFLOEST — welche Datei meint 'lodash'?
    //   "bundler" = wie Vite/Webpack es tun. Empfohlen fuer Browser-Projekte.

    "esModuleInterop": true,
    // ^ Aktiviert den Compatibility-Layer fuer CJS Default Imports.
    //   Immer auf true setzen ausser du hast spezifische Gruende dagegen.

    "allowSyntheticDefaultImports": true,
    // ^ Nur der Typ-Check (kein Laufzeit-Code). Wird von esModuleInterop impliziert.
    //   Alleine gesetzt: TypeScript beschwert sich nicht ueber Default Imports aus CJS,
    //   aber generiert keinen Compatibility-Code.

    "resolveJsonModule": true,
    // ^ import data from './config.json' — JSON-Dateien importieren

    "isolatedModules": true
    // ^ Jede Datei muss alleine kompilierbar sein (ohne andere Dateien zu kennen).
    //   Pflicht fuer Vite, esbuild und andere Single-File-Transpiler.
    //   Konsequenz: Re-exports von Typen brauchen explizit "export type"
  }
}
```

---

## Module Resolution — Wie TypeScript Importe aufloest

Wenn du `import { add } from './math'` schreibst, muss TypeScript wissen,
welche Datei damit gemeint ist. Das ist **Module Resolution**. Es gibt mehrere
Strategien, die sich in ihrer "Intelligenz" unterscheiden.

```
import { add } from './math'

Strategie "node" (klassisch):
  1. Suche ./math.ts
  2. Suche ./math.tsx
  3. Suche ./math.d.ts
  4. Suche ./math/index.ts
  5. Suche ./math/index.d.ts

Strategie "bundler" (modern, empfohlen):
  1. Wie "node16" aber ohne Pflicht zur .js-Extension
  2. Liest package.json "exports"-Feld
  3. Liest package.json "types"-Feld
  4. Unterstuetzt "paths"-Mapping in tsconfig
```

Der entscheidende Unterschied: Mit `node16` musst du fuer ESM-Output die
Dateiextension in Imports angeben:

```typescript annotated
// Mit moduleResolution: "node16" (strikt)
import { add } from './math.js';
// ^ Du musst .js schreiben, auch wenn die Datei math.ts heisst!
//   Verwirrend? Ja — aber es entspricht dem echten Node.js ESM-Verhalten

// Mit moduleResolution: "bundler" (modern)
import { add } from './math';
// ^ Keine Extension noetig. Bundler (Vite, Webpack) finden die Datei selbst.
//   Das ist das Verhalten, das du aus Angular und React kenst.
```

---

> **Experiment:** Oeffne in einem TypeScript-Projekt (oder probiere es im TypeScript
> Playground) mit `isolatedModules: false`:
>
> ```typescript
> // Erstelle zwei Typen und teste den Unterschied
> interface Config { debug: boolean; }
> const config = { debug: true };
>
> // Variante 1: Export einer Klasse (Wert)
> export class MyService {}
>
> // Variante 2: Export eines Interfaces (nur Typ)
> export interface MyInterface {}
>
> // Was passiert wenn du isolatedModules: true aktivierst?
> // MyInterface-Export muss zu "export type { MyInterface }" werden —
> // weil TypeScript bei isolatedModules nicht weiss ob MyInterface ein Typ
> // oder ein Wert ist ohne andere Dateien zu lesen.
> ```
>
> Das ist genau das Problem das `isolatedModules: true` loesen soll:
> Jeder Transpiler (Vite, Babel, esbuild) kann eine Datei ohne Kontext kompilieren.

---

## Modul-Formate im Ueberblick

| Format | Syntax | Wann | Besonderheit |
|--------|--------|------|--------------|
| **CommonJS** | `require()` / `module.exports` | Node.js Legacy, npm-Packages | Synchron, dynamisch |
| **ESM** | `import` / `export` | Browser, modernes Node.js, Vite/Webpack | Statisch, async |
| **UMD** | Wrapper um CJS+AMD | Library-Pakete (lodash, jQuery) | Laeuft ueberall |
| **AMD** | `define()` / `require()` | Veraltet (RequireJS-Aera) | Asynchron, Browser |

> **Warum ist UMD wichtig zu kennen?** Viele aeltere npm-Packages (lodash, moment, jquery)
> liefern UMD-Bundles. UMD ist ein Wrapper der CJS, AMD und globale Script-Verwendung
> gleichzeitig unterstuetzt. Das ist der Grund, warum `lodash` sowohl mit `require('lodash')`
> in Node.js als auch mit einem `<script>`-Tag im Browser funktioniert.
> Fuer neue Libraries wird UMD nicht mehr empfohlen — ESM mit CJS-Fallback ist Standard.

---

**In deinem Angular-Projekt:**
Angular-Projekte mit Vite oder der Angular CLI verwenden `"moduleResolution": "bundler"`.
Das erklaert, warum du in Angular-Code `import { Component } from '@angular/core'`
schreiben kannst ohne Extension — der Bundler weiss, dass er in
`node_modules/@angular/core/index.js` schauen muss.

Wenn du in Angular eine Library (z.B. fuer ein Design-System) erstellst, musst
du das `package.json` "exports"-Feld korrekt setzen — sonst findet TypeScript mit
`node16`-Resolution die `.d.ts`-Dateien nicht.

```typescript annotated
// package.json deiner Angular Library (vereinfacht)
{
  "name": "@meine-firma/ui-kit",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // ^ TypeScript findet hier die Type Declarations
      "esm2022": "./dist/esm2022/index.js",
      // ^ Angular CLI nutzt diesen Entry fuer moderne Builds
      "default": "./dist/fesm2022/index.js"
    }
  }
}
```

---

> **Erklaere dir selbst:** Warum loest `esModuleInterop: true` das Problem mit
> `import _ from 'lodash'`? Was ist der Unterschied zwischen `esModuleInterop`
> und `allowSyntheticDefaultImports`?
>
> **Kernpunkte:**
> - `esModuleInterop` generiert Laufzeit-Hilfscode (Wrapper-Funktion)
> - `allowSyntheticDefaultImports` nur Typ-Level — kein Laufzeit-Code, kein Schutz
> - Beide zusammen: TypeScript beschwert sich nicht (allowSynthetic) UND der generierte Code funktioniert (esModuleInterop)
> - Fast immer willst du `esModuleInterop: true` — `allowSyntheticDefaultImports` alleine ist gefaehrlich

---

> **Denkfrage:** Node.js unterstuetzt seit v12 sowohl CommonJS als auch ES Modules.
> Aber du kannst nicht einfach ESM in einem CJS-Modul importieren oder umgekehrt.
> Warum ist das so? Was ist der fundamentale Unterschied zwischen `require()`
> (synchron) und `import` (asynchron), der diese Inkompatibilitaet erzeugt?

---

## Was du gelernt hast

- **CommonJS** (require/module.exports) und **ES Modules** (import/export) sind zwei inkompatible Systeme, die gleichzeitig existieren
- **`esModuleInterop: true`** generiert Laufzeit-Hilfscode damit CJS-Packages mit ESM-Default-Import-Syntax funktionieren
- **Module Resolution** bestimmt wie TypeScript einen Import-Pfad zu einer echten Datei aufloest
- **`"moduleResolution": "bundler"`** ist der moderne Standard fuer Vite-, Webpack- und Angular-Projekte
- **`isolatedModules: true`** erzwingt, dass jede Datei allein kompilierbar ist — wichtig fuer Vite und esbuild

**Kernkonzept:** `esModuleInterop` ist kein kosmetisches Setting — es veraendert den generierten JavaScript-Code. Verstehe was es tut bevor du es blind aktivierst. In neuen Projekten: immer `true`.

---

## Schnellreferenz: tsconfig Modul-Settings

| Setting | Empfohlener Wert | Erklaerung |
|---------|-----------------|------------|
| `module` | `"ESNext"` | Output-Format: modernes ES Module |
| `moduleResolution` | `"bundler"` | Fuer Vite/Webpack/Angular CLI |
| `esModuleInterop` | `true` | CJS Default-Import Support mit Laufzeit-Code |
| `allowSyntheticDefaultImports` | `true` | Impliziert von esModuleInterop |
| `isolatedModules` | `true` | Pflicht fuer Vite, esbuild, Babel |
| `resolveJsonModule` | `true` | JSON-Dateien importieren |
| `verbatimModuleSyntax` | `true` | Modernes Pendant zu isolatedModules (TS 5.0+) |

> **Faustregel fuer neue Projekte:** Nutze das tsconfig-Template deines Frameworks
> (Angular CLI, create-vite) — die Defaults sind bereits optimal konfiguriert.
> Verstehe die Einstellungen, aber erfinde das Rad nicht neu.

---

> **Pausenpunkt** — Das Modul-System ist komplex, weil es historisch gewachsen ist.
> Du hast jetzt das "Warum" verstanden, nicht nur das "Wie".
>
> Weiter geht es mit: [Sektion 03 — Declaration Files und @types](./03-declaration-files.md)
