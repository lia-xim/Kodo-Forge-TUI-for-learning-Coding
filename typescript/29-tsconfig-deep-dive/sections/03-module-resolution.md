# Sektion 3: Module Resolution

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Die Strict-Mode-Familie](./02-strict-mode-familie.md)
> Naechste Sektion: [04 - Output-Konfiguration](./04-output-konfiguration.md)

---

## Was du hier lernst

- Was `moduleResolution` wirklich steuert und welche Strategien es gibt
- Warum `bundler` die richtige Wahl fuer die meisten modernen Projekte ist
- Wie `paths` und `baseUrl` Pfad-Aliase ermoeglichen
- Den Unterschied zwischen `node`, `node16`/`nodenext` und `bundler`

---

## Das Raetsel der Modul-Aufloesung

Wenn du `import { User } from './types'` schreibst, passiert etwas
Erstaunliches: TypeScript muss herausfinden, welche **Datei** sich
hinter `'./types'` verbirgt. Ist es `types.ts`? `types/index.ts`?
`types.d.ts`? `types.js` mit einer `.d.ts` daneben?

Die Antwort haengt von `moduleResolution` ab — und dieses Flag
ist die haeufigste Quelle von "Cannot find module"-Fehlern.

```typescript annotated
{
  "compilerOptions": {
    "moduleResolution": "bundler"
    // ^ Wie TypeScript import-Pfade aufloest
    // Optionen: "node", "node16", "nodenext", "bundler", "classic"
  }
}
```

> 📖 **Hintergrund: Die Geschichte der Module Resolution**
>
> JavaScript hatte urspruenglich kein Modulsystem. Node.js fuehrte
> 2009 CommonJS ein (`require()`), Browser bekamen 2015 ES Modules
> (`import/export`). Das Problem: Beide Systeme loesen Pfade
> unterschiedlich auf. Node.js sucht in `node_modules`, fuegt
> automatisch `.js` an, prueft `index.js` in Ordnern. ES Modules
> im Browser brauchen dagegen vollstaendige Pfade mit Endung.
>
> TypeScript musste BEIDE Welten unterstuetzen — und fuer jede
> Welt gibt es eine eigene Resolution-Strategie. Das ist der Grund,
> warum dieses Flag so verwirrend ist: Es ist nicht TypeScripts
> Schuld, sondern das Erbe zweier inkompatibler Modulsysteme.

---

## Die Resolution-Strategien

### `"node"` — Das Legacy-System

Emuliert Node.js' CommonJS-Aufloesung. Sucht:
1. Exakte Datei (mit `.ts`, `.tsx`, `.d.ts`, `.js`)
2. Ordner mit `index.ts` / `index.js`
3. `node_modules` (aufsteigend durch alle Eltern-Verzeichnisse)

```typescript annotated
import { User } from './types';
// TypeScript sucht (in dieser Reihenfolge):
// 1. ./types.ts
// 2. ./types.tsx
// 3. ./types.d.ts
// 4. ./types/index.ts
// 5. ./types/index.tsx
// 6. ./types/index.d.ts

import express from 'express';
// TypeScript sucht:
// 1. node_modules/express/package.json → "types" oder "typings" Feld
// 2. node_modules/express/index.d.ts
// 3. node_modules/@types/express/index.d.ts
// ^ Das @types-Verzeichnis ist TypeScript-spezifisch!
```

**Problem:** `"node"` versteht keine `exports`-Felder in package.json,
keine bedingten Exporte, und emuliert ein System das fuer CommonJS
designed wurde. Fuer moderne Projekte ist es veraltet.

### `"node16"` / `"nodenext"` — Fuer echte Node.js-Projekte

Emuliert Node.js' native ESM-Aufloesung. Der wichtigste Unterschied:

```typescript annotated
// MIT moduleResolution: "node16" / "nodenext":
import { User } from './types.js';
// ^ Die .js-Endung ist PFLICHT!
// TypeScript sucht types.ts, findet sie, kompiliert sie zu types.js
// Die Endung im Import muss dem OUTPUT-Format entsprechen

// OHNE Endung:
import { User } from './types';
// ^ Fehler! Relative import paths need explicit file extensions
```

**Warum `.js` statt `.ts`?** Weil TypeScript zum Output kompiliert wird.
Der Import muss der Datei entsprechen, die **nach** der Kompilierung
existiert. Node.js sieht nur JavaScript — und JavaScript-Dateien
enden mit `.js`. Das ist das "write .js, mean .ts"-Prinzip.

> 💭 **Denkfrage:** Warum erzwingt `nodenext` die `.js`-Endung, obwohl
> du eine `.ts`-Datei importierst? Ist das nicht verwirrend?
>
> **Antwort:** TypeScript folgt dem Prinzip "emit fidelity" — der Import
> im TypeScript-Code muss GENAU so im JavaScript-Output funktionieren.
> Da TypeScript die Import-Pfade NICHT umschreibt, muss der Pfad
> schon im Source auf die Ausgabe-Datei zeigen. Verwirrend, aber
> logisch konsequent.

### `"bundler"` — Fuer Webpack, Vite, esbuild, etc.

Die neueste und fuer die meisten modernen Projekte beste Option
(seit TypeScript 5.0). Sie kombiniert das Beste aus beiden Welten:

```typescript annotated
// MIT moduleResolution: "bundler":
import { User } from './types';
// ^ OK! Keine Endung noetig — der Bundler loest das auf

import express from 'express';
// ^ OK! Liest "exports" aus package.json

import { helper } from '#utils/helper';
// ^ OK! Package-interne Imports (imports-Feld in package.json)
```

**Warum `bundler`?** Weil Webpack, Vite, esbuild und andere Bundler
ihre eigene Module Resolution haben. TypeScript muss nicht die
Datei finden — nur die Typen. Der Bundler findet die Datei.

| Feature | `node` | `node16`/`nodenext` | `bundler` |
|---------|--------|---------------------|-----------|
| .js-Endung pflicht | Nein | Ja | Nein |
| package.json `exports` | Nein | Ja | Ja |
| Pfad-Aliase (paths) | Ja | Ja | Ja |
| `imports` Feld | Nein | Ja | Ja |
| Empfohlen fuer | Legacy | Node.js | Bundler/Frameworks |

> ⚡ **Praxis-Tipp:** In deinem Angular-Projekt steht wahrscheinlich
> `"moduleResolution": "node"` oder gar nichts (Default haengt von
> `module` ab). Seit Angular 17 empfiehlt das Angular-Team
> `"moduleResolution": "bundler"` zusammen mit `"module": "ESNext"`.
> In React/Next.js-Projekten ist `bundler` seit Next.js 14 der Standard.

---

## `paths` und `baseUrl` — Pfad-Aliase

Lange Import-Pfade wie `../../../shared/utils/format` sind unlesbar.
`paths` loest das:

```typescript annotated
{
  "compilerOptions": {
    "baseUrl": ".",
    // ^ Basis-Verzeichnis fuer nicht-relative Importe
    "paths": {
      "@shared/*": ["src/shared/*"],
      // ^ Import: @shared/utils → src/shared/utils
      "@components/*": ["src/components/*"],
      // ^ Import: @components/Button → src/components/Button
      "@/*": ["src/*"]
      // ^ Catch-all: @/anything → src/anything
    }
  }
}
```

**Wichtig:** `paths` loest NUR die TypeScript-Seite auf. Der Bundler
braucht seine eigene Konfiguration! In Webpack brauchst du
`resolve.alias`, in Vite `resolve.alias`, in Next.js reicht
die tsconfig (Next liest paths automatisch).

> 🧠 **Erklaere dir selbst:** Warum muss man Pfad-Aliase sowohl in
> der tsconfig (paths) als auch im Bundler konfigurieren? Warum
> reicht die tsconfig nicht?
> **Kernpunkte:** TypeScript und Bundler sind getrennte Systeme |
> TypeScript prueft Typen, Bundler baut Bundle | TypeScript schreibt
> Import-Pfade NICHT um | Bundler muss wissen wo Dateien liegen |
> Ausnahme: Next.js liest tsconfig.paths direkt

### `baseUrl` allein (ohne paths)

```json
{
  "compilerOptions": {
    "baseUrl": "./src"
  }
}
```

Mit `baseUrl` werden nicht-relative Importe ab dem angegebenen
Verzeichnis aufgeloest:

```typescript
// Statt:
import { format } from '../../../utils/format';
// Geht:
import { format } from 'utils/format';
```

**Achtung:** Das kann zu Konflikten mit `node_modules`-Paketen fuehren!
Wenn du ein Modul `utils` in node_modules hast UND einen `utils`-Ordner
unter `baseUrl`, gewinnt `baseUrl`. Das ist verwirrend.

> 🔬 **Experiment:** Stell dir vor, du hast diese Projektstruktur:
>
> ```
> src/
>   utils/
>     format.ts    ← deine Datei
>   index.ts       ← import { format } from 'utils/format'
> node_modules/
>   utils/         ← npm-Paket!
>     index.js
> ```
>
> Mit `baseUrl: "./src"` importiert `'utils/format'` deine lokale
> Datei. OHNE `baseUrl` importiert es das npm-Paket. Deshalb ist
> `paths` mit expliziten Praefix (`@/`) sicherer als `baseUrl` allein.

---

## `rootDir` und `rootDirs`

### `rootDir` — Das Quellverzeichnis

```typescript annotated
{
  "compilerOptions": {
    "rootDir": "./src",
    // ^ TypeScript behaelt die Verzeichnisstruktur AB diesem Punkt bei
    "outDir": "./dist"
    // ^ Ausgabe-Verzeichnis
  }
}
// src/utils/format.ts → dist/utils/format.js
// src/index.ts → dist/index.js
// NICHT: dist/src/utils/format.js (das waere ohne rootDir)
```

### `rootDirs` — Virtuelle Verzeichnisse

Ein wenig genutztes aber maaechtiges Feature. Es legt mehrere
Verzeichnisse zusammen, als waeren sie eins:

```json
{
  "compilerOptions": {
    "rootDirs": ["src", "generated"]
  }
}
```

Dateien in `generated/api-types.ts` koennen so importiert werden,
als laegen sie in `src/`. Nuetzlich fuer Code-Generatoren
(OpenAPI, GraphQL, Protobuf).

> ⚡ **Praxis-Tipp:** In React-Projekten mit `react-scripts` oder
> Vite wird `rootDir` automatisch gesetzt. In Angular-Projekten
> setzt die CLI `rootDir` auf `./` oder `./src`. Wenn du nach einem
> Refactoring "File is not under rootDir" bekommst, pruefe ob eine
> Datei ausserhalb des rootDir liegt (z.B. ein `shared/`-Ordner
> auf Root-Ebene).

---

## Was du gelernt hast

- `moduleResolution` bestimmt, wie TypeScript Import-Pfade aufloest
- `"bundler"` ist fuer moderne Projekte mit Webpack/Vite/esbuild die beste Wahl
- `"nodenext"` erzwingt `.js`-Endungen in Imports — korrekt fuer native Node.js ESM
- `paths` erstellt Pfad-Aliase, braucht aber auch Bundler-Konfiguration
- `rootDir` steuert die Verzeichnisstruktur im Output

> 🧠 **Erklaere dir selbst:** Was ist der grundlegende Unterschied
> zwischen `"node"`, `"nodenext"` und `"bundler"` bei der Module
> Resolution? Fuer welche Szenarien eignet sich welche?
> **Kernpunkte:** node = Legacy CommonJS | nodenext = echtes Node.js ESM
> mit .js-Pflicht | bundler = modernes Tooling ohne Endungs-Pflicht |
> Bundler braucht keine Datei-Aufloesung, nur Typ-Aufloesung

**Kernkonzept zum Merken:** Module Resolution ist der haeufigste Grund
fuer "Cannot find module"-Fehler. Kenne dein Build-Tool, waehle die
passende Strategie — und die Haelfte deiner TypeScript-Probleme
verschwindet.

---

> **Pausenpunkt** -- Module Resolution ist verdaut. Naechstes Thema:
> Was kommt am Ende heraus?
>
> Weiter geht es mit: [Sektion 04: Output-Konfiguration](./04-output-konfiguration.md)
