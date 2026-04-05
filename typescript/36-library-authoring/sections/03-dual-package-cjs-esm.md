# Sektion 3: Dual Package (CJS + ESM)

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Declaration Files richtig generieren](./02-declaration-files-generieren.md)
> Naechste Sektion: [04 - Generische Library-Patterns](./04-generische-library-patterns.md)

---

## Was du hier lernst

- Warum du **sowohl CommonJS als auch ES Modules** liefern musst
- Was das **Dual Package Hazard** ist und wie du es vermeidest
- Wie du mit **tsup** oder **esbuild** beide Formate erzeugst
- Die korrekte **package.json-Konfiguration** fuer Dual Packages

---

## Hintergrund: Warum zwei Formate?

> **Origin Story: Der CJS/ESM-Uebergang**
>
> JavaScript hat eine gespaltene Vergangenheit: Node.js nutzte seit 2009
> CommonJS (`require`/`module.exports`), waehrend Browser seit ES2015
> ES Modules (`import`/`export`) nutzen. Bis 2020 war CJS der de-facto-
> Standard fuer npm-Pakete. Seit 2022 bewegt sich das Oekosystem massiv
> Richtung ESM — aber der Uebergang dauert Jahre.
>
> Das Problem fuer Library-Autoren: Deine Konsumenten nutzen BEIDE Formate.
> Angular-Projekte nutzen ESM. Aeltere Node.js-Scripts nutzen CJS. Build-
> Tools wie Jest verwenden je nach Konfiguration CJS oder ESM. Wenn deine
> Library nur eines der Formate liefert, schliesst du die andere Haelfte aus.

Denk an das Dual Package wie an einen internationalen Reiseadapter. Du
reist mit deinen Geraeten nach England, Japan und die USA — und jedes
Land hat andere Steckdosen. Dein Adapter hat ALLE Stecker integriert.
Genau so muss deine Library ALLE Modul-Formate "mitbringen", damit sie
in jeder Umgebung einfach funktioniert. Der Konsument steckt ein und
es funktioniert — ohne Konfiguration.

Die Realitaet 2024+: Du musst beide Formate liefern. Das nennt sich
"Dual Package" — ein Paket das sowohl CJS als auch ESM unterstuetzt.

---

## Die Anatomie eines Dual Package

```typescript annotated
// dist/
//   index.js       ← ESM (import/export)
//   index.cjs      ← CJS (require/module.exports)
//   index.d.ts     ← Types fuer ESM
//   index.d.cts    ← Types fuer CJS
//
// Dateiendungen sind entscheidend:
// .js + "type": "module" → ESM
// .cjs → IMMER CommonJS (egal was "type" sagt)
// .mjs → IMMER ES Module (egal was "type" sagt)
// .d.ts → Types fuer .js
// .d.cts → Types fuer .cjs
// .d.mts → Types fuer .mjs

// package.json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  // ^ Default-Interpretation fuer .js-Dateien = ESM

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // ^ Types fuer ESM-Konsumenten
      "import": "./dist/index.js",
      // ^ ESM: import { x } from "my-lib"
      "require": {
        "types": "./dist/index.d.cts",
        // ^ Types fuer CJS-Konsumenten
        "default": "./dist/index.cjs"
        // ^ CJS: const { x } = require("my-lib")
      }
    }
  },

  // Legacy-Fallbacks:
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

> 🧠 **Erklaere dir selbst:** Warum braucht CJS eigene .d.cts-Dateien? Warum reichen die normalen .d.ts nicht?
> **Kernpunkte:** .d.ts und .d.cts koennen unterschiedliche Default-Exports haben | ESM hat named + default exports | CJS hat module.exports (= default) | Die Typ-Signaturen koennen sich unterscheiden | TypeScript 4.7+ unterscheidet basierend auf der Endung

---

## Das Dual Package Hazard

Das groesste Risiko bei Dual Packages:

```typescript annotated
// Das Problem: CJS und ESM laden VERSCHIEDENE Module-Instanzen!

// Stell dir vor: my-lib hat einen internen Cache
// src/index.ts:
const cache = new Map<string, unknown>();
export function setCache(key: string, value: unknown) {
  cache.set(key, value);
}
export function getCache(key: string) {
  return cache.get(key);
}

// Wenn ein Projekt BEIDE Formate laedt:
// File A (ESM): import { setCache } from "my-lib";
//               setCache("key", "value");
//
// File B (CJS): const { getCache } = require("my-lib");
//               getCache("key");  // → undefined!
//
// ^ ESM und CJS laden VERSCHIEDENE Instanzen von my-lib
// ^ Jede Instanz hat ihren eigenen Cache
// ^ setCache in ESM → getCache in CJS findet nichts
```

**Loesungen:**

```typescript annotated
// Loesung 1: Stateless Library (empfohlen)
// Kein interner State → kein Hazard
export function formatDate(date: Date): string {
  return date.toISOString();
}
// ^ Reine Funktionen ohne Side Effects → sicher fuer Dual Package

// Loesung 2: CJS-Wrapper (re-exportiert ESM)
// dist/index.cjs:
// module.exports = require("./index.js");
// ^ Beide Formate nutzen dieselbe ESM-Instanz
// ^ ABER: Funktioniert nur in neueren Node.js-Versionen

// Loesung 3: Nur ESM (die Zukunft)
// Wenn deine Zielgruppe es erlaubt: Nur ESM liefern
// "type": "module", kein "require" in exports
// ^ Immer mehr Libraries gehen diesen Weg (z.B. chalk, got, p-queue)
```

> 💭 **Denkfrage:** Wenn immer mehr Libraries nur ESM liefern, warum
> nicht einfach auch nur ESM? Was haelt CJS am Leben?
>
> **Antwort:** Jest (in vielen Konfigurationen), aeltere Webpack-Setups,
> AWS Lambda (Default Runtime), und legacy Node.js-Projekte brauchen CJS.
> Solange deine Konsumenten CJS brauchen, musst du es liefern.

---

## Build-Setup mit tsup

tsup ist das empfohlene Tool fuer Dual Packages:

```typescript annotated
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  // ^ Entrypoint(s) deiner Library

  format: ["cjs", "esm"],
  // ^ Erzeugt sowohl .cjs als auch .js (ESM)

  dts: true,
  // ^ Erzeugt .d.ts und .d.cts automatisch!
  // ^ tsup nutzt intern tsc fuer die Declaration-Generierung

  splitting: false,
  // ^ Kein Code-Splitting fuer Libraries (ein Bundle pro Format)

  sourcemap: true,
  // ^ Source Maps fuer Debugging

  clean: true,
  // ^ Loescht dist/ vor dem Build

  outDir: "dist"
});

// Build-Befehl: npx tsup
// Ergebnis in dist/:
//   index.js      ← ESM
//   index.cjs     ← CJS
//   index.d.ts    ← Types (ESM)
//   index.d.cts   ← Types (CJS)
```

> ⚡ **Framework-Bezug (React):** Wenn du eine React-Component-Library
> baust, nutzt du tsup mit zusaetzlicher JSX-Konfiguration:
>
> ```typescript
> // tsup.config.ts fuer React-Library
> export default defineConfig({
>   entry: ["src/index.tsx"],
>   format: ["cjs", "esm"],
>   dts: true,
>   external: ["react", "react-dom"],
>   // ^ React als peerDependency — NICHT bundlen!
>   jsx: "react-jsx",
>   // ^ JSX-Transform ohne expliziten React-Import
> });
> ```
>
> React, ReactDOM und andere peerDependencies muessen als `external`
> markiert werden, damit sie nicht ins Bundle aufgenommen werden.
> Der Grund: Jede React-App installiert React bereits. Wenn deine Library
> React **einbundelt**, landet React ZWEIMAL in der App — zwei verschiedene
> Instanzen, und Hooks brechen mit "Invalid hook call" weil sie auf
> unterschiedliche React-Kontexte zugreifen. `external` verhindert das.
>
> Das gilt genauso fuer Angular: `@angular/core`, `@angular/common` usw.
> sind peerDependencies und muessen als external markiert werden.

---

## Alternative: Nur ESM

Wenn deine Zielgruppe es erlaubt (moderne Browser, Node.js 18+):

```typescript annotated
// package.json — ESM-only (die einfachste Option)
{
  "name": "modern-lib",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
  // ^ Kein "require", kein .cjs, kein Dual Package Hazard
  // ^ Einfacher, sicherer, weniger Konfiguration
}

// tsup.config.ts — Nur ESM
// export default defineConfig({
//   entry: ["src/index.ts"],
//   format: ["esm"],  // ← Nur ESM!
//   dts: true,
// });
```

> 🧪 **Experiment:** Erstelle ein minimales Dual Package:
>
> ```bash
> mkdir my-lib && cd my-lib && npm init -y
> npm install -D tsup typescript
>
> # src/index.ts:
> # export function greet(name: string): string { return `Hi ${name}`; }
>
> # tsup.config.ts:
> # import { defineConfig } from "tsup";
> # export default defineConfig({ entry: ["src/index.ts"], format: ["cjs", "esm"], dts: true });
>
> npx tsup
> ls dist/  # → index.js, index.cjs, index.d.ts, index.d.cts
> ```
>
> Pruefe die Dateien: index.js hat `export`, index.cjs hat `module.exports`.

---

## Was du gelernt hast

- **Dual Packages** liefern CJS (.cjs) und ESM (.js) im selben npm-Paket
- Das **Dual Package Hazard** entsteht wenn CJS und ESM verschiedene Instanzen laden — stateless Libraries sind sicher
- **tsup** ist das empfohlene Tool — erzeugt beide Formate + .d.ts automatisch
- **ESM-only** ist die einfachste Option wenn die Zielgruppe es erlaubt
- **peerDependencies** (React, Angular) muessen als `external` markiert werden, sonst doppelte Instanzen
- **.cjs und .d.cts** sind die Dateiendungen fuer CommonJS — nicht mit .js/.d.ts verwechseln
- Die Analogie: Dual Package ist wie ein Reiseadapter — alle Stecker dabei, jede Umgebung funktioniert

**Kernkonzept zum Merken:** Das JavaScript-Oekosystem ist im Uebergang von CJS zu ESM. Als Library-Autor musst du beide Welten bedienen — aber nicht fuer immer. Dual Package mit tsup ist der pragmatische Weg. ESM-only ist die Zukunft. Und: externe Frameworks wie React und Angular gehoeren als peerDependencies NICHT ins Bundle.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt
> die Herausforderungen von CJS/ESM-Koexistenz.
>
> Weiter geht es mit: [Sektion 04: Generische Library-Patterns](./04-generische-library-patterns.md)
