# Sektion 4: Output-Konfiguration

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Module Resolution](./03-module-resolution.md)
> Naechste Sektion: [05 - Fortgeschrittene Flags](./05-fortgeschrittene-flags.md)

---

## Was du hier lernst

- Wie `target` und `module` zusammenspielen und wann welches Setting passt
- Was `outDir`, `declarationDir` und `sourceMap` bewirken
- Den Unterschied zwischen `declaration`, `declarationMap` und `emitDeclarationOnly`
- Warum `lib` wichtig ist und wie es `target` ergaenzt

---

## `target` — Welches JavaScript soll rauskommen?

`target` bestimmt, in welche JavaScript-Version TypeScript kompiliert.
Es beeinflusst **zwei Dinge**: welche Syntax heruntertransformiert
wird und welche Built-in-Typen verfuegbar sind.

```typescript annotated
{
  "compilerOptions": {
    "target": "ES2022"
    // ^ Generiert JavaScript, das ES2022-kompatibel ist
    // Optionen: ES3, ES5, ES6/ES2015, ES2016...ES2023, ESNext
  }
}
```

Was passiert bei verschiedenen Targets?

```typescript annotated
// TypeScript-Source:
class User {
  #name: string; // Private Class Field (ES2022)
  constructor(name: string) { this.#name = name; }
}

// Target ES2022: Bleibt wie es ist
class User {
  #name;
  constructor(name) { this.#name = name; }
}

// Target ES2015: Wird heruntertransformiert
var __classPrivateFieldSet = /* WeakMap-basierte Emulation */;
class User {
  constructor(name) { __classPrivateFieldSet(this, _name, name); }
}
// ^ DEUTLICH mehr Code — weil WeakMap das Private-Feld emuliert

// Target ES5: Klassen werden zu Funktionen
var User = /** @class */ (function () {
  function User(name) { /* ... */ }
  return User;
}());
```

> 📖 **Hintergrund: Warum gibt es so viele Target-Optionen?**
>
> Jedes JavaScript-Feature wurde in einem bestimmten ECMAScript-Release
> eingefuehrt. Optional Chaining (`?.`) kam in ES2020, Private Fields
> (`#`) in ES2022, `Array.prototype.at()` in ES2022. TypeScript muss
> wissen, welche Features die Zielumgebung nativ unterstuetzt — alles
> andere wird heruntertransformiert (Downleveling).
>
> In der Praxis: Wenn du fuer moderne Browser oder Node.js 18+
> entwickelst, ist `ES2022` eine sichere Wahl. Fuer Libraries,
> die in aelteren Umgebungen laufen muessen, kann `ES2017` oder
> `ES2015` noetig sein.

> 💭 **Denkfrage:** Wenn `target: "ES5"` allen Code auf ES5
> heruntertransformiert — warum sollte man dann nicht immer ES5
> waehlen, um maximale Kompatibilitaet zu haben?
>
> **Antwort:** Groesse und Performance. Heruntertransformierter Code
> ist groesser (z.B. async/await → Generator-Emulation) und
> langsamer (z.B. WeakMap statt nativem #private). Moderne
> Features nutzen, wenn die Zielumgebung sie unterstuetzt!

---

## `lib` — Welche Built-in-APIs sind verfuegbar?

`target` bestimmt die Syntax, `lib` bestimmt die **APIs**. Das
sind zwei verschiedene Dinge:

```typescript annotated
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
    // ^ Welche Typ-Definitionen TypeScript laden soll
    // ES2022: Promise, Map, Set, Array.at(), Object.hasOwn()...
    // DOM: document, window, HTMLElement, fetch...
    // DOM.Iterable: NodeList ist iterable (for...of)
  }
}
```

Ohne `lib` laedt TypeScript einen Default basierend auf `target`.
Aber: Wenn du `lib` explizit setzt, wird der Default KOMPLETT
ueberschrieben. Vergisst du `"DOM"`, kennt TypeScript kein
`document` oder `window`.

```typescript annotated
// Mit lib: ["ES2022"] (OHNE DOM):
document.getElementById("app");
// ^ Fehler! Cannot find name 'document'
// DOM-APIs sind nicht geladen!

// Mit lib: ["ES2022", "DOM"]:
document.getElementById("app");
// ^ OK! DOM-Typen sind geladen
```

> 🧠 **Erklaere dir selbst:** Warum sind `target` und `lib` getrennte
> Flags? Wann wuerdest du `lib` explizit setzen statt den Default
> zu verwenden?
> **Kernpunkte:** target = Syntax-Transformation, lib = verfuegbare APIs |
> Node.js braucht kein DOM | Worker-Threads brauchen WebWorker statt DOM |
> Libraries koennen lib einschraenken um Browser-spezifische APIs zu verhindern

---

## `module` — Das Modul-Format der Ausgabe

Nicht zu verwechseln mit `moduleResolution`! `module` bestimmt,
welches **Format** die generierten Import/Export-Statements haben:

```typescript annotated
// TypeScript-Source (immer ESM-Syntax):
import { User } from './types';
export function getUser(): User { /* ... */ }

// module: "ESNext" / "ES2022":
import { User } from './types';
export function getUser() { /* ... */ }
// ^ Bleibt ESM — fuer Bundler und Browser

// module: "CommonJS":
const types_1 = require("./types");
exports.getUser = function getUser() { /* ... */ };
// ^ Wird zu CommonJS — fuer aeltere Node.js

// module: "NodeNext":
// Haengt von der Dateiendung ab:
// .mts → ESM, .cts → CommonJS, .ts → package.json "type"
```

| Wert | Format | Empfohlen fuer |
|------|--------|---------------|
| `ESNext` | ES Modules | Bundler (Webpack, Vite, esbuild) |
| `ES2022` | ES Modules (mit top-level await) | Bundler mit TLA-Support |
| `CommonJS` | require/exports | Legacy Node.js |
| `Node16`/`NodeNext` | ESM oder CJS (je nach Datei) | Moderne Node.js-Projekte |
| `Preserve` | Unveraendert (TS 5.4+) | Bundler-Workflows |

> 🔬 **Experiment:** Betrachte diese Zuordnungen und ueberlege,
> welche Kombination fuer welches Szenario passt:
>
> ```
> Szenario A: Angular-App (Angular CLI mit Webpack)
>   → module: "ES2022", moduleResolution: "bundler"
>
> Szenario B: Node.js CLI-Tool (kein Bundler, direkt ausfuehren)
>   → module: "NodeNext", moduleResolution: "nodenext"
>
> Szenario C: npm-Library (soll ueberall funktionieren)
>   → module: "ESNext" + module: "CommonJS" (Dual-Build!)
>
> Szenario D: React-App mit Vite
>   → module: "ESNext", moduleResolution: "bundler"
> ```

---

## `outDir` und `declarationDir`

```typescript annotated
{
  "compilerOptions": {
    "outDir": "./dist",
    // ^ Alle generierten .js Dateien landen hier
    "declarationDir": "./types",
    // ^ Alle .d.ts Dateien landen separat hier
    "rootDir": "./src"
    // ^ Verzeichnisstruktur wird ab hier beibehalten
  }
}
// Ergebnis:
// src/utils/format.ts → dist/utils/format.js
//                      → types/utils/format.d.ts
```

Ohne `declarationDir` landen `.d.ts`-Dateien neben den `.js`-Dateien
in `outDir`. Die Trennung ist nuetzlich fuer Library-Autoren, die
Typen separat verteilen wollen.

---

## `declaration` und verwandte Flags

### `declaration` — `.d.ts`-Dateien erzeugen

```typescript annotated
{
  "compilerOptions": {
    "declaration": true
    // ^ Erzeugt .d.ts Dateien neben jeder .js Datei
    // PFLICHT fuer Libraries und Project References
  }
}
```

Eine `.d.ts`-Datei enthaelt nur die Typ-Informationen — keinen
JavaScript-Code. Das ist genau das, was andere Projekte oder
npm-Paket-Konsumenten brauchen.

### `declarationMap` — Source Maps fuer Typen

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

Erzeugt `.d.ts.map`-Dateien. Das ermoeglicht "Go to Definition"
in der IDE: Statt in der `.d.ts`-Datei zu landen, springst du
direkt zur **originalen TypeScript-Source**. Extrem nuetzlich in
Monorepos!

### `emitDeclarationOnly` — Nur Typen, kein JavaScript

```json
{
  "compilerOptions": {
    "emitDeclarationOnly": true,
    "declaration": true
  }
}
```

TypeScript erzeugt NUR `.d.ts`-Dateien, KEIN JavaScript. Das ist
sinnvoll, wenn ein anderes Tool (esbuild, swc, Babel) die
JavaScript-Transformation uebernimmt und TypeScript nur fuer die
Typ-Pruefung zustaendig ist.

> ⚡ **Praxis-Tipp:** In deinem Angular-Projekt uebernimmt die
> Angular CLI die Kompilierung mit esbuild (seit Angular 17). Die
> tsconfig in Angular-Projekten hat oft `"declaration": false`, weil
> Angular-Apps keine `.d.ts`-Dateien exportieren — sie sind
> Endprodukte, keine Libraries. In React-Projekten mit Vite ist es
> genauso: Vite nutzt esbuild fuer die Transpilation und TypeScript
> nur fuer den Type-Check.

---

## `sourceMap` — Debugging ermoeglichen

```typescript annotated
{
  "compilerOptions": {
    "sourceMap": true,
    // ^ Erzeugt .js.map Dateien fuer Browser/Node.js Debugging
    "inlineSourceMap": false,
    // ^ Alternative: Source Map direkt in die .js-Datei einbetten
    "inlineSources": false
    // ^ Original-Source in die Source Map einbetten (groesser, aber autark)
  }
}
```

Source Maps verbinden den generierten JavaScript-Code mit dem
originalen TypeScript. Wenn ein Fehler in Zeile 42 von `format.js`
auftritt, zeigt der Debugger Zeile 15 von `format.ts` — die Stelle,
die du tatsaechlich geschrieben hast.

> 💭 **Denkfrage:** Solltest du Source Maps in der Produktion
> ausliefern? Was sind die Vor- und Nachteile?
>
> **Antwort:** Es kommt darauf an. Vorteile: besseres Error-Tracking
> (Sentry, Bugsnag koennen Original-Zeilen anzeigen). Nachteile:
> Source Maps enthuellen deinen Source-Code. Loesung: Source Maps
> nur an Error-Tracking-Services senden, nicht oeffentlich
> ausliefern. Viele Build-Tools unterstuetzen "hidden source maps"
> die nicht im Code referenziert werden.

---

## `noEmit` — Nur pruefen, nichts erzeugen

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

TypeScript prueft den Code, erzeugt aber KEINE Dateien. Das ist
der Modus, wenn ein anderes Tool (Vite, esbuild, swc, Babel) die
Transpilation uebernimmt. TypeScript wird zum reinen Type-Checker
degradiert — was fuer viele moderne Build-Pipelines der ideale
Zustand ist.

> ⚡ **Praxis-Tipp:** In vielen Next.js-Projekten findest du
> `"noEmit": true` in der tsconfig. Next.js nutzt SWC oder Babel
> fuer die Transpilation — TypeScript prüft nur die Typen.
> Der `next build`-Befehl ruft `tsc --noEmit` als Teil der
> Build-Pipeline auf.

---

## Was du gelernt hast

- `target` bestimmt die JavaScript-Version (Syntax-Transformation)
- `lib` bestimmt die verfuegbaren APIs (unabhaengig von target)
- `module` bestimmt das Modul-Format (ESM, CJS, NodeNext)
- `declaration` erzeugt `.d.ts`-Dateien — Pflicht fuer Libraries
- `noEmit` macht TypeScript zum reinen Type-Checker (fuer Vite/esbuild-Workflows)

> 🧠 **Erklaere dir selbst:** Wenn ein Bundler wie Vite die
> Transpilation uebernimmt, warum braucht man dann ueberhaupt
> noch `target` und `module` in der tsconfig?
> **Kernpunkte:** TypeScript prueft trotzdem Typen | target bestimmt
> welche APIs TypeScript als "bekannt" ansieht | lib steuert verfuegbare
> Typ-Definitionen | noEmit nutzt target/lib fuer Type-Checking, nicht
> fuer Output

**Kernkonzept zum Merken:** `target` + `lib` = was TypeScript kennt.
`module` = was TypeScript erzeugt. `noEmit` = TypeScript erzeugt nichts,
kennt aber trotzdem alles.

---

> **Pausenpunkt** -- Output-Konfiguration gemeistert. Jetzt kommen
> die Flags fuer Fortgeschrittene.
>
> Weiter geht es mit: [Sektion 05: Fortgeschrittene Flags](./05-fortgeschrittene-flags.md)
