# Sektion 6: Praxis — Eigene Utility-Library und npm publish

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Versionierung und Breaking Changes bei Typen](./05-versionierung-und-breaking-changes.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie du eine **komplette Utility-Library** von Null aufbaust
- Den vollstaendigen Workflow: **Init → Code → Build → Test → Publish**
- Wie du deine Library mit **npm pack** lokal testest bevor du publishst
- Best Practices fuer **README**, **package.json** und **CI**

---

## Hintergrund: Warum eine eigene Library?

> **Origin Story: Wie date-fns entstand**
>
> date-fns begann als internes Utility-Modul bei einem ukrainischen
> Startup. Der Entwickler Sasha Koss hatte immer wieder dieselben
> Datums-Funktionen in verschiedene Projekte kopiert. Statt weiter
> zu kopieren, extrahierte er sie in ein npm-Paket. Heute hat date-fns
> ueber 30 Millionen woechtentliche Downloads.
>
> Die Lehre: Jede Library beginnt als Code den du in zwei oder mehr
> Projekten brauchst. "Don't repeat yourself" gilt nicht nur innerhalb
> eines Projekts — es gilt projektuebergreifend.

Du hast in den vorherigen Sektionen alle Bausteine gelernt. Jetzt
setzen wir sie zusammen zu einer echten Library.

---

## Schritt 1: Projekt initialisieren

```typescript annotated
// Terminal:
// mkdir my-ts-utils && cd my-ts-utils

// npm init — mit sinnvollen Defaults:
// npm init -y

// package.json manuell anpassen:
{
  "name": "@dein-scope/ts-utils",
  // ^ Scoped Package: @scope/name — verhindert Namenskonflikte
  "version": "0.1.0",
  // ^ 0.x.y = "Pre-Release" — du versprichst noch keine Stabilitaet
  "description": "Typsichere Utility-Funktionen",
  "type": "module",

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "files": ["dist", "src"],
  // ^ Nur diese Ordner werden in das npm-Paket aufgenommen
  // ^ src fuer Declaration Maps ("Go to Definition")

  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "prepublishOnly": "npm run build && npm run test"
    // ^ Automatisch vor jedem npm publish: Build + Tests
  },

  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0"
  },

  "peerDependencies": {
    "typescript": ">=5.0"
    // ^ Deine Library erfordert TypeScript 5.0+
  },

  "license": "MIT"
}
```

> 🧠 **Erklaere dir selbst:** Warum Version 0.1.0 und nicht 1.0.0? Was signalisiert eine 0.x-Version?
> **Kernpunkte:** 0.x = "Entwicklungsphase" | API kann sich jederzeit aendern | Konsumenten wissen: keine Stabilitaetsgarantie | 1.0.0 ist ein Versprechen: "Die API ist stabil" | Erst nach realem Einsatz auf 1.0.0 gehen

---

## Schritt 2: Library-Code schreiben

```typescript annotated
// src/index.ts — Oeffentliche API (Re-Exports)
export { pipe } from "./pipe.js";
export { groupBy } from "./collections.js";
export { debounce, throttle } from "./timing.js";
export type { PipeFn, GroupByResult } from "./types.js";
// ^ Nur explizit exportierte Dinge sind Teil der oeffentlichen API
// ^ Interne Module (nicht exportiert) bleiben privat

// src/pipe.ts — Beispiel: Typsichere Pipe-Funktion
type PipeFn<In, Out> = (input: In) => Out;

export function pipe<A, B>(
  value: A,
  fn1: PipeFn<A, B>
): B;
export function pipe<A, B, C>(
  value: A,
  fn1: PipeFn<A, B>,
  fn2: PipeFn<B, C>
): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: PipeFn<A, B>,
  fn2: PipeFn<B, C>,
  fn3: PipeFn<C, D>
): D;
export function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}
// ^ Overloads fuer 1-3 Funktionen — typsicher
// ^ Implementation mit reduce — einfach aber effektiv

// src/collections.ts — Beispiel: Typsicheres groupBy
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}
// ^ Generischer Rueckgabetyp: Record<K, T[]>
// ^ K wird aus der keyFn inferiert — keine manuelle Annotation noetig
```

> ⚡ **Framework-Bezug (Angular + React):** Utility-Libraries wie diese
> sind framework-agnostisch — sie funktionieren in Angular, React, Node.js,
> ueberall. Wenn du beruflich Angular und privat React nutzt, ist eine
> geteilte Utility-Library der perfekte Anwendungsfall. Typ-sichere
> `pipe`, `groupBy`, `debounce` brauchst du in JEDEM Framework.

---

## Schritt 3: Build konfigurieren

```typescript annotated
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  // ^ Ein einziger Entrypoint

  format: ["cjs", "esm"],
  // ^ Dual Package: CJS + ESM

  dts: true,
  // ^ .d.ts + .d.cts automatisch generieren

  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  // ^ Libraries sollten NICHT minifiziert werden
  // ^ Minification ist Sache des Konsumenten-Bundlers
  // ^ Unminifizierter Code ist debuggbar

  outDir: "dist"
});

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    // ^ Libraries MUESSEN strict sein
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

---

## Schritt 4: Lokal testen mit npm pack

Bevor du publishst — teste die Library lokal:

```typescript annotated
// Terminal in der Library:
// npm pack
// ^ Erzeugt: dein-scope-ts-utils-0.1.0.tgz
// ^ Das ist GENAU das was npm publish hochladen wuerde

// Terminal in einem Test-Projekt:
// npm install ../my-ts-utils/dein-scope-ts-utils-0.1.0.tgz
// ^ Installiert die Library aus der .tgz-Datei

// test-projekt/src/test.ts:
import { pipe, groupBy } from "@dein-scope/ts-utils";

const result = pipe(
  [1, 2, 3, 4, 5],
  (nums) => nums.filter(n => n > 2),
  (nums) => nums.map(n => n * 10)
);
// ^ Kompiliert? Typen korrekt? Autocomplete funktioniert?

const grouped = groupBy(
  [{ name: "Max", team: "A" }, { name: "Anna", team: "B" }],
  (user) => user.team
);
// ^ Typ: Record<string, { name: string; team: string }[]>
// ^ Autocomplete fuer grouped["A"] funktioniert?
```

> 💭 **Denkfrage:** Warum `npm pack` + lokale Installation statt einfach
> die Dateien direkt importieren?
>
> **Antwort:** `npm pack` simuliert EXAKT was auf npm landen wuerde. Es
> prueft: Sind alle Dateien in "files" enthalten? Stimmt die package.json?
> Funktionieren die exports? Direkte Imports aus dem Quellcode testen
> NICHT die veroeffentlichte Package-Struktur — sie umgehen alle
> Verpackungsprobleme.

---

## Schritt 5: Veroeffentlichen

```typescript annotated
// Vor dem Publish: Checkliste
// ✅ npm run build — kompiliert ohne Fehler?
// ✅ npm run test — alle Tests gruen?
// ✅ npm pack — .tgz erstellt, alle Dateien drin?
// ✅ Lokaler Test — Imports funktionieren, Typen korrekt?
// ✅ README.md — Installation, Usage, API dokumentiert?
// ✅ CHANGELOG.md — Aenderungen dokumentiert?
// ✅ .npmignore oder "files" — nur noetige Dateien im Paket?

// Publish:
// npm login                    ← Einmalig (npmjs.com-Account)
// npm publish --access public  ← Fuer scoped Packages (@scope/name)

// Version bumpen:
// npm version patch   ← 0.1.0 → 0.1.1 (Bugfix)
// npm version minor   ← 0.1.0 → 0.2.0 (Feature)
// npm version major   ← 0.1.0 → 1.0.0 (Breaking Change)
// npm publish
```

> 🧪 **Experiment:** Fuehre den gesamten Workflow aus — ohne tatsaechlich
> zu publishen:
>
> ```bash
> mkdir my-test-lib && cd my-test-lib
> npm init -y
> npm install -D tsup typescript
>
> # src/index.ts erstellen:
> # export function hello(name: string): string { return `Hello ${name}`; }
>
> # tsup.config.ts erstellen (wie oben)
>
> npx tsup
> npm pack --dry-run   # Zeigt was im Paket waere, ohne zu verpacken
> npm pack             # Erzeugt die .tgz-Datei
>
> # In einem anderen Ordner:
> # npm install ../my-test-lib/my-test-lib-1.0.0.tgz
> # import { hello } from "my-test-lib"
> ```
>
> Der gesamte Workflow — ohne npm publish.

---

## CI/CD fuer Libraries

```typescript annotated
// .github/workflows/publish.yml
// name: Publish
// on:
//   push:
//     tags: ["v*"]  ← Trigger bei Version-Tags (v1.0.0, v1.1.0)
//
// jobs:
//   publish:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with:
//           node-version: 20
//           registry-url: "https://registry.npmjs.org"
//       - run: npm ci
//       - run: npm run build
//       - run: npm test
//       - run: npm publish --access public
//         env:
//           NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
//
// Workflow:
// 1. npm version minor    ← Bumped package.json, erstellt git tag
// 2. git push --tags      ← Pusht den Tag
// 3. CI baut, testet, published automatisch
```

---

## Was du gelernt hast

- Der komplette Workflow: **Init → Code → Build → Test → Pack → Publish**
- `npm pack` simuliert das **npm publish** lokal — immer vorher testen
- **tsup** erzeugt CJS + ESM + .d.ts in einem Schritt
- Libraries sollten **NICHT minifiziert** werden — das macht der Konsumenten-Bundler
- **CI/CD** mit GitHub Actions automatisiert den Publish bei Version-Tags

**Kernkonzept zum Merken:** Eine Library zu veroeffentlichen ist kein Geheimnis — es ist ein reproduzierbarer Workflow. tsup fuer den Build, npm pack fuer lokale Tests, npm publish fuer die Welt. Der schwierige Teil ist nicht das Tooling, sondern das Design: gute Typen, stabile API, klare Dokumentation.

---

> **Ende der Lektion.** Du hast jetzt alle Werkzeuge um professionelle
> TypeScript-Libraries zu bauen und zu veroeffentlichen.
>
> Weiter geht es mit: **L37** (naechste Lektion im Curriculum)
