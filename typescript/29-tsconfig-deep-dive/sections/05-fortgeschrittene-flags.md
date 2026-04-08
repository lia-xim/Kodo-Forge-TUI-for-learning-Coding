# Sektion 5: Fortgeschrittene Flags

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Output-Konfiguration](./04-output-konfiguration.md)
> Naechste Sektion: [06 - Praxis: Monorepo und Framework-Configs](./06-praxis-configs.md)

---

## Was du hier lernst

- Was `skipLibCheck` wirklich tut und warum fast jedes Projekt es aktiviert
- Warum `isolatedModules` und `verbatimModuleSyntax` fuer moderne Toolchains Pflicht sind
- Was `esModuleInterop` loest und warum es historisch noetig wurde
- Weitere nuetzliche Flags die oft uebersehen werden

---

## `skipLibCheck` — Der pragmatische Kompromiss
<!-- section:summary -->
Klingt gefaehrlich — warum sollte man Typ-Pruefung ueberspringen?

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "skipLibCheck": true
    // ^ Ueberspringt die Typ-Pruefung von .d.ts Dateien
    // Das betrifft: node_modules/@types/*, eigene .d.ts, generierte .d.ts
  }
}
```

Klingt gefaehrlich — warum sollte man Typ-Pruefung ueberspringen?
Die Antwort: **Dein Code wird trotzdem voll geprueft.** `skipLibCheck`
ueberspringt nur die Pruefung der `.d.ts`-Dateien selbst — nicht die
Pruefung deines Codes GEGEN diese `.d.ts`-Dateien.

> 📖 **Hintergrund: Warum skipLibCheck existiert**
>
> In der Praxis haben viele npm-Pakete fehlerhafte oder inkompatible
> Typ-Definitionen. Paket A definiert einen Typ, Paket B erwartet
> eine leicht andere Version desselben Typs. Ohne `skipLibCheck`
> bekommst du Fehler in `node_modules/` die du nicht fixe kannst.
>
> Das Problem verschaerfte sich mit `@types/node`: Verschiedene
> Versionen von `@types/node` definieren `Buffer`, `Stream`, etc.
> unterschiedlich. Wenn zwei Pakete verschiedene `@types/node`-Versionen
> erwarten, kollidieren die Definitionen. `skipLibCheck` ignoriert
> diese Konflikte — und dein eigener Code wird trotzdem korrekt
> geprueft. Seit TypeScript 2.0 (2016) ist es deshalb ein De-facto-
> Standard in den meisten Projekten.

> 💭 **Denkfrage:** Wenn `skipLibCheck: true` der Standard ist —
> warum ist es nicht einfach der Default?
>
> **Antwort:** Weil es einen Trade-off gibt. Ohne `skipLibCheck`
> findet TypeScript Fehler in deinen EIGENEN `.d.ts`-Dateien (z.B.
> wenn du eine Library schreibst). Library-Autoren sollten
> `skipLibCheck: false` verwenden, um sicherzustellen, dass ihre
> Typ-Definitionen korrekt sind.

---

<!-- /depth -->
## `isolatedModules` — Einzeldatei-Kompatibilitaet
<!-- section:summary -->
Dieses Flag ist **Pflicht** fuer alle Projekte, die nicht `tsc` als

<!-- depth:standard -->
Dieses Flag ist **Pflicht** fuer alle Projekte, die nicht `tsc` als
Transpiler verwenden (also: Babel, esbuild, swc, Vite, SWC).

```typescript annotated
{
  "compilerOptions": {
    "isolatedModules": true
    // ^ Jede Datei muss eigenstaendig transpilierbar sein
    // PFLICHT fuer: esbuild, swc, Babel, Vite
  }
}
```

Warum? Weil `tsc` den GESAMTEN Projekt-Kontext kennt, aber Tools wie
esbuild jede Datei einzeln transpilieren. Manche TypeScript-Features
brauchen aber Kontext aus anderen Dateien:

```typescript annotated
// DIESE Features funktionieren NICHT mit isolatedModules:

// 1. const enum (braucht den Wert aus einer anderen Datei)
const enum Color { Red, Green, Blue }
// ^ Fehler mit isolatedModules! Der Wert wird zur Compile-Zeit
// eingesetzt — esbuild kennt ihn aber nicht

// 2. Re-Export von Typen ohne "type" Keyword
export { User } from './types';
// ^ Wenn User nur ein Typ ist: Fehler! esbuild weiss nicht,
// ob User ein Wert oder ein Typ ist. Fix:
export type { User } from './types';
// ^ Jetzt weiss esbuild: das kann geloescht werden

// 3. Dateien ohne Import/Export (Scripts statt Module)
const x = 42;
// ^ Fehler! Datei hat kein import/export — ist ein Script
// Fix: export {} am Ende hinzufuegen
```

> 🧠 **Erklaere dir selbst:** Warum ist `const enum` mit
> `isolatedModules` inkompatibel? Denke an den Unterschied zwischen
> `tsc` (kennt alle Dateien) und `esbuild` (eine Datei nach der anderen).
> **Kernpunkte:** const enum wird inline ersetzt | esbuild sieht nur
> eine Datei | Der Wert des Enums steht in einer ANDEREN Datei |
> esbuild kann den Wert nicht nachschlagen | Regulaere enums erzeugen
> ein Objekt und funktionieren weiterhin

---

<!-- /depth -->
## `verbatimModuleSyntax` — Der Nachfolger von isolatedModules
<!-- section:summary -->
Seit TypeScript 5.0 gibt es ein neues Flag, das `isolatedModules`

<!-- depth:standard -->
Seit TypeScript 5.0 gibt es ein neues Flag, das `isolatedModules`
und zwei weitere Flags ersetzt:

```typescript annotated
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
    // ^ Ersetzt: isolatedModules + preserveValueImports + importsNotUsedAsValues
    // Regel: Was du mit "import type" importierst, wird geloescht.
    //        Was du mit "import" importierst, bleibt im Output.
  }
}
```

Die Regel ist einfach:
- `import type { X }` → wird komplett entfernt
- `import { X }` → bleibt im JavaScript-Output
- Wenn X nur ein Typ ist und du `import { X }` schreibst → Fehler!

```typescript annotated
// MIT verbatimModuleSyntax:

import type { User } from './types';
// ^ OK — wird entfernt, weil "import type"

import { formatDate } from './utils';
// ^ OK — bleibt im Output, weil "import"

import { UserRole } from './types';
// ^ Fehler! UserRole ist nur ein Typ — verwende "import type"!
// Fix:
import type { UserRole } from './types';
```

> 📖 **Hintergrund: Das "import elision"-Problem**
>
> Vor `verbatimModuleSyntax` hatte TypeScript ein Feature namens
> "import elision": Wenn ein Import nur Typen enthielt, wurde er
> automatisch entfernt. Das klingt nuetzlich, war aber ein Problem:
>
> ```typescript
> import { SomeModule } from './module';
> // Wird SomeModule als Wert oder als Typ verwendet?
> // Wenn nur als Typ: TypeScript entfernt den Import.
> // Aber: Was wenn das Modul Seiteneffekte hat?
> //   (z.B. globale Registrierungen, Polyfills)
> // Dann ist das Entfernen ein BUG!
> ```
>
> `verbatimModuleSyntax` loest das: Du sagst EXPLIZIT was ein Typ
> ist (`import type`) und was ein Wert ist (`import`). Kein Raten
> mehr — volle Kontrolle.

---

<!-- /depth -->
## `esModuleInterop` — Die CommonJS/ESM-Bruecke
<!-- section:summary -->
### `allowSyntheticDefaultImports`

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "esModuleInterop": true
    // ^ Ermoeglicht Default-Imports von CommonJS-Modulen
  }
}
```

Ohne `esModuleInterop`:
```typescript
// CommonJS-Modul: module.exports = function express() {}
import * as express from 'express';  // Funktioniert
import express from 'express';       // FEHLER!
```

Mit `esModuleInterop`:
```typescript
import express from 'express';  // Jetzt OK!
// TypeScript fuegt Hilfsfunktionen hinzu die den Default-Export emulieren
```

> 💭 **Denkfrage:** Warum braucht es ueberhaupt `esModuleInterop`?
> Warum funktioniert `import express from 'express'` nicht einfach?
>
> **Antwort:** CommonJS hat kein `default`-Export-Konzept. `module.exports`
> ist das gesamte Modul. ESM hat `export default`. Die beiden Systeme
> sind fundamental inkompatibel. `esModuleInterop` fuegt eine
> Kompatibilitaetsschicht ein, die CommonJS-Module so wrapped, dass
> Default-Imports funktionieren. Es ist ein Hack — aber ein
> notwendiger.

### `allowSyntheticDefaultImports`

Verwandt mit `esModuleInterop`, aber schwaecher: Es erlaubt die
SYNTAX `import express from 'express'`, fuegt aber KEINE Hilfsfunktionen
ein. Nuetzlich wenn der Bundler die Kompatibilitaet uebernimmt.

---

<!-- /depth -->
## `resolveJsonModule` — JSON importieren

```typescript annotated
{
  "compilerOptions": {
    "resolveJsonModule": true
    // ^ Ermoeglicht import von .json Dateien
  }
}

// Jetzt moeglich:
import config from './config.json';
// config hat den korrekten Typ! z.B.:
// { port: number; host: string; debug: boolean }
// TypeScript inferiert den Typ aus dem JSON-Inhalt
```

> ⚡ **Praxis-Tipp:** In deinem Angular-Projekt ist `resolveJsonModule`
> oft nicht aktiv. In React/Next.js ist es Standard. Wenn du in
> Angular eine JSON-Datei importieren willst, musst du es explizit
> aktivieren ODER eine `.d.ts`-Datei schreiben:
> ```typescript
> declare module '*.json' {
>   const value: any;
>   export default value;
> }
> ```
> Besser ist `resolveJsonModule: true` — dann bekommst du echte
> Typen statt `any`.

---

## `incremental` — Schnellere Builds
<!-- section:summary -->
TypeScript erzeugt eine `.tsbuildinfo`-Datei, die den Build-Zustand

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "incremental": true
    // ^ Speichert Build-Informationen in .tsbuildinfo
    // Naechster Build: nur geaenderte Dateien werden geprueft
  }
}
```

TypeScript erzeugt eine `.tsbuildinfo`-Datei, die den Build-Zustand
speichert. Beim naechsten Build werden nur geaenderte Dateien
neu kompiliert. In grossen Projekten kann das den Build von
30 Sekunden auf 3 Sekunden reduzieren.

**Achtung:** `composite: true` (fuer Project References) aktiviert
`incremental` automatisch. Du brauchst es nur explizit fuer
einzelne Projekte ohne Project References.

---

<!-- /depth -->
## `jsx` — React-Support

```typescript annotated
{
  "compilerOptions": {
    "jsx": "react-jsx"
    // ^ Optionen:
    // "react" — transform: React.createElement() (Legacy)
    // "react-jsx" — transform: _jsx() aus react/jsx-runtime (React 17+)
    // "react-jsxdev" — wie react-jsx mit Debug-Info
    // "preserve" — JSX nicht transformieren (Bundler macht's)
    // "react-native" — JSX beibehalten (fuer React Native)
  }
}
```

> ⚡ **Praxis-Tipp:** In React-Projekten mit dem neuen JSX-Transform
> (React 17+) brauchst du `"jsx": "react-jsx"`. Der grosse Vorteil:
> Du musst `import React from 'react'` NICHT mehr in jede Datei
> schreiben. In Next.js ist das der Default. In Angular brauchst du
> dieses Flag gar nicht — Angular verwendet kein JSX.

---

## `allowImportingTsExtensions` — TS-Endungen in Imports
<!-- section:summary -->
Dieses Flag ist fuer Projekte, in denen ein anderes Tool (Deno,

<!-- depth:standard -->
```typescript annotated
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    // ^ Erlaubt: import { x } from './module.ts'
    // ABER: Nur zusammen mit noEmit oder emitDeclarationOnly!
    "noEmit": true
  }
}
```

Dieses Flag ist fuer Projekte, in denen ein anderes Tool (Deno,
Bun, Vite) die `.ts`-Endungen versteht. TypeScript erlaubt dann
Imports mit `.ts`-Endung — was normalerweise verboten ist, weil
der Output `.js`-Dateien haette und der Import nicht stimmen wuerde.

> 🔬 **Experiment:** Ordne die folgenden Flags den Szenarien zu:
>
> | Flag | Szenario |
> |------|----------|
> | `skipLibCheck: true` | Konflikte in node_modules/.d.ts ignorieren |
> | `isolatedModules: true` | esbuild/swc als Transpiler |
> | `verbatimModuleSyntax: true` | Explizite Kontrolle ueber import/import type |
> | `esModuleInterop: true` | Default-Import von CommonJS-Modulen |
> | `resolveJsonModule: true` | JSON-Dateien mit echten Typen importieren |
> | `incremental: true` | Schnellere Builds durch Caching |
>
> Welche dieser Flags wuerdest du in einem neuen Projekt ALLE
> aktivieren? (Antwort: Alle — sie sind De-facto-Standard.)

---

<!-- /depth -->
## Was du gelernt hast

- `skipLibCheck` ueberspringt `.d.ts`-Pruefung — dein Code wird trotzdem geprueft
- `isolatedModules` / `verbatimModuleSyntax` sind Pflicht fuer esbuild/swc/Vite
- `esModuleInterop` ermoeglicht Default-Imports von CommonJS-Modulen
- `incremental` beschleunigt Builds durch Caching in `.tsbuildinfo`
- `verbatimModuleSyntax` ersetzt drei aeltere Flags und macht import/type explizit

> 🧠 **Erklaere dir selbst:** Warum wird `const enum` durch
> `isolatedModules` verboten? Was ist der fundamentale Unterschied
> zwischen `tsc` und esbuild bei der Verarbeitung von Enum-Werten?
> **Kernpunkte:** const enum = inline-Ersetzung zur Compile-Zeit |
> tsc kennt ALLE Dateien (kann Werte aus anderen Dateien lesen) |
> esbuild/swc verarbeiten EINE Datei (kennen keine Werte aus anderen
> Dateien) | Regulaere enums erzeugen Runtime-Objekte und funktionieren

**Kernkonzept zum Merken:** Moderne TypeScript-Projekte nutzen TypeScript
oft nur als Type-Checker (`noEmit`), waehrend esbuild/swc die
Transpilation uebernehmen. `isolatedModules` und `verbatimModuleSyntax`
stellen sicher, dass dein Code mit dieser Architektur kompatibel ist.

---

> **Pausenpunkt** -- Die wichtigsten Flags sind jetzt bekannt. In
> der letzten Sektion bringen wir alles zusammen.
>
> Weiter geht es mit: [Sektion 06: Praxis: Monorepo und Framework-Configs](./06-praxis-configs.md)
