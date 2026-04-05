# Sektion 1: ES Modules — Das moderne Modulsystem

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start der Lektion)
> Naechste Sektion: [02 - CommonJS Interop](./02-commonjs-interop.md)

---

## Was du hier lernst

- Warum das JavaScript-Oekosystem jahrelang im **Modul-Chaos** steckte und wie ES Modules das geloest haben
- Den Unterschied zwischen **Named Exports** und **Default Exports** — und warum Named Exports fast immer besser sind
- Wie **`import type`** funktioniert und warum es deinen Bundle-Output verbessert
- Wie **Barrel Files** (index.ts) Importe vereinfachen und wann sie ein Anti-Pattern werden

---

## Hintergrundgeschichte: Das grosse JavaScript-Modul-Chaos

Im Jahr 2009 war JavaScript ein Spielzeug. Es gab kein offizielles Modulsystem.
Wenn du Code in mehrere Dateien aufteilen wolltest, hast du `<script>`-Tags gestapelt
und auf globale Variablen gehofft. Das fuehrte zu unvermeidbaren Kollisionen:
`window.utils` aus Datei A wurde von `window.utils` aus Datei B ueberschrieben.

Als Node.js 2009 erschien, loeste Ryan Dahl das Problem pragmatisch: **CommonJS**.
Der Gedanke war simpel — jede Datei hat ihr eigenes Scope, du exportierst
explizit mit `module.exports` und importierst mit `require()`. Funktionierte.
Aber `require()` ist **synchron**, was im Browser katastrophal ist (blockiert den Main Thread).

Also erfand die Community Alternativen: **AMD** (Asynchronous Module Definition),
**UMD** (Universal Module Definition), **SystemJS**. Es entstanden Bundler wie
RequireJS, Browserify, Webpack. Das Oekosystem zersplitterte — eine Library
unterstuetzte vielleicht AMD aber nicht CommonJS, oder umgekehrt.

2015 loeste TC39 (das JavaScript-Standardkomitee) das Problem endgueltig mit
**ES Modules** in ES2015 (ES6). Das war die erste native Modulsyntax in JavaScript.
Browser-Support kam 2017 (Chrome 61, Firefox 60, Safari 10.1). Die Spezifikation
ist statisch analysierbar — das erlaubt Tree-Shaking, Circular Dependency Detection
und bessere Tooling-Unterstuetzung als jemals zuvor.

TypeScript unterstuetzt ES Modules seit Beginn — und ist heute das empfohlene
Modulsystem fuer alle neuen Projekte.

---

## Named Exports — Der empfohlene Weg

Named Exports sind explizit. Der Name beim Export muss auch beim Import verwendet
werden (oder bewusst mit `as` umbenannt werden). Das macht Refactoring sicher
und ermoeglicht Auto-Imports in Editoren und IDEs.

```typescript annotated
// math.ts
export function add(a: number, b: number): number {
// ^ "export" macht diese Funktion oeffentlich — sichtbar fuer andere Module
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export const PI = 3.14159;
// ^ Konstanten lassen sich ebenfalls direkt exportieren

export interface MathResult {
// ^ Interfaces koennen auch exportiert werden — aber beachte: Sie verschwinden
//   nach dem Kompilieren (Type Erasure). Nur das JavaScript-Laufzeitverhalten bleibt.
  value: number;
  operation: string;
}
```

```typescript annotated
// app.ts
import { add, multiply, PI } from './math';
// ^ Named Import: geschweifte Klammern, Name muss genau passen

import { add as addition } from './math';
// ^ Alias: wenn der Name mit etwas kollidiert oder du ihn umbenennen willst

import * as math from './math';
// ^ Namespace Import: alle Exports als Objekt — math.add(), math.PI
math.add(1, 2);
```

---

## Default Exports — Fuer Klassen und Main-Exports

Default Exports sind fuer den "Haupt-Export" einer Datei gedacht. Eine Datei
kann nur einen Default Export haben. Der Name beim Import ist frei waehlbar.

```typescript annotated
// logger.ts
export default class Logger {
// ^ "export default" — es gibt genau einen Default Export pro Datei
  log(msg: string) {
    console.log(`[LOG] ${msg}`);
  }
}
```

```typescript annotated
// app.ts
import Logger from './logger';
// ^ Kein geschweifte Klammern — der Name ist frei waehlbar

import MyLogger from './logger';
// ^ Auch gueltig! Genau das ist das Problem: inkonsistente Namen
//   erschweren Refactoring und Code-Navigation im Team
```

> **Best Practice — Named Exports bevorzugen:**
> Default Exports sehen erstmal bequem aus, fuehren aber zu Problemen:
> - Auto-Import findet den richtigen Namen nicht zuverlaessig
> - Im Team nennt jeder den Import anders (`Logger`, `MyLogger`, `AppLogger`)
> - Wenn du die Datei umbenennst, muss niemand die Import-Namen aendern —
>   was dazu fuehrt, dass der Code inkonsistent und schwer zu verstehen wird
>
> Angular-Style-Guide und das TypeScript-Team selbst empfehlen Named Exports
> fuer fast alle Faelle. Default Exports machen Sinn nur dort, wo eine
> Konvention sie erwartet (React-Komponenten, Next.js Pages, etc.).

---

## Type-Only Imports — Cleaner Bundle-Output

TypeScript 3.8 fuehrte `import type` ein. TypeScript 4.5 erweiterte es um
Inline-Syntax. Der Grund: Manchmal brauchst du einen Import nur fuer
Typ-Annotationen — nie als Wert zur Laufzeit.

```typescript annotated
// Normaler Import — bleibt im kompilierten JavaScript
import { UserService } from './services';
// ^ Dieser Import wird ausgefuehrt. Module-Code laeuft. Side-Effects moeglich.

// Type-Only Import — wird KOMPLETT entfernt
import type { User, UserConfig } from './types';
// ^ TypeScript loescht diese Zeile beim Kompilieren. Keine Laufzeit-Kosten.
//   Perfekt wenn du den Typ nur fuer Parameter- oder Return-Type-Annotationen brauchst.

// Inline Type Import (TS 4.5) — mix aus beidem
import { UserService, type User } from './services';
// ^ UserService wird importiert (Wert), User wird entfernt (nur Typ)
//   Das ist die modernste und expliziteste Variante
```

> **Wann `import type` nutzen?**
> Immer wenn du einen Import nur fuer Typ-Annotationen brauchst und der Wert
> nie zur Laufzeit referenziert wird. Das hat mehrere Vorteile:
> - **Kein ungewollter Side-Effect**: Modul wird nicht ausgefuehrt
> - **Besserer Tree-Shaking-Support** fuer Bundler wie Vite und esbuild
> - **Klare Kommunikation**: Wer den Code liest, sieht sofort "das ist nur ein Typ"

---

> **Experiment:** Kopiere folgendes in den TypeScript Playground (typescriptlang.org):
>
> ```typescript
> // Definiere zwei "Module" als Typen
> interface User { name: string; age: number; }
> function getUser(): User { return { name: "Max", age: 30 }; }
>
> // Variante 1: Normaler Import-Stil
> const user1: User = getUser();
>
> // Variante 2: Was wuerde "type-only" hier bedeuten?
> // Schau dir den kompilierten JavaScript-Output im Playground an.
> // Klicke auf den ".JS"-Tab oben rechts.
> // Was siehst du? Die Interface-Definition ist weg!
> // Das ist Type Erasure in Aktion — genau was import type simuliert.
> ```
>
> Aendere nun `interface User` zu `class User { name = ""; age = 0; }`.
> Schau dir den JS-Output an. Was aendert sich? Klassen bleiben erhalten,
> Interfaces verschwinden — deshalb unterscheidet TypeScript zwischen
> Wert-Imports und Typ-Imports.

---

## Re-Exports und Barrel Files

Ein **Barrel File** (fast immer `index.ts` genannt) buendelt Exports eines
Verzeichnisses. Statt `import { add } from './lib/math'` und
`import { Logger } from './lib/logger'` schreibst du einfach
`import { add, Logger } from './lib'`.

```typescript annotated
// lib/index.ts — das Barrel File
export { add, multiply, PI } from './math';
// ^ Re-Export von Named Exports — add und multiply kommen aus math.ts

export { default as Logger } from './logger';
// ^ Re-Export eines Default Exports als Named Export — jetzt heisst er immer Logger

export type { MathResult } from './math';
// ^ Re-Export nur des Typs (type-only). Im JS-Output: komplett entfernt.

export * from './utils';
// ^ Alle Named Exports von utils.ts re-exportieren (Vorsicht: kein Default!)
```

> **Barrel Files und Tree-Shaking — der versteckte Trade-off:**
> Barrel Files klingen elegant, koennen aber Tree-Shaking sabotieren.
> Wenn ein Bundler `import { add } from './lib'` sieht und das Barrel File
> viele re-exports hat, muss er moeglicherweise das gesamte Barrel analysieren —
> was bei Side-Effect-Importen zu unerwartetem Code im Bundle fuehren kann.
> Moderne Bundler (Vite, esbuild) sind schlau genug, aber pruefe immer
> deine Bundle-Analyse wenn die Groesse wichtig ist.

---

**In deinem Angular-Projekt:**
Angular verwendet Barrel Files intensiv. Schau dir die `public-api.ts` in einer
Angular-Library an — das ist ein Barrel File, das definiert, welche Typen und
Klassen nach aussen sichtbar sind. Wenn du einen neuen Service oder eine neue
Direktive erstellst, fuegest du den Export dort hinzu.

```typescript annotated
// my-lib/src/public-api.ts — Angular Library Barrel
export * from './lib/my-lib.module';
// ^ Das gesamte Modul wird exportiert

export * from './lib/services/user.service';
// ^ UserService ist jetzt von aussen importierbar

export type { User, UserConfig } from './lib/models/user.model';
// ^ Typen werden exportiert, aber als type-only — kein Laufzeit-Overhead
```

---

> **Erklaere dir selbst:** Was ist der Unterschied zwischen `import { X } from './module'`
> und `import type { X } from './module'`? Wann macht die zweite Variante einen
> funktionalen Unterschied und wann ist es nur Dokumentation?
>
> **Kernpunkte:**
> - Bei `import type` entfernt TypeScript die Zeile komplett beim Kompilieren
> - Der Unterschied ist funktional bei `isolatedModules: true` (Vite, esbuild)
>   — dort muss TS wissen ob ein Import ein Typ ist, ohne andere Dateien zu analysieren
> - Bei normalen tsc-Builds ist es eher Dokumentation und verhindert Side-Effects
> - Praktischer Unterschied: Module-Code (Initialisierung, Side-Effects) laeuft nicht

---

> **Denkfrage:** Angular und React haben unterschiedliche Konventionen:
> Angular-Komponenten sind Named Exports, React-Komponenten meistens Default Exports.
> Welche Variante hilft mehr beim Refactoring und warum? Was passiert wenn du
> eine React-Komponente aus `UserCard.tsx` in eine Datei `ProfileCard.tsx` verschiebst?

---

## Was du gelernt hast

- **Named Exports** sind explizit und refactoring-sicher. Bevorzuge sie fast immer gegenueber Default Exports
- **`import type`** entfernt Imports beim Kompilieren — perfekt fuer reine Typ-Referenzen und `isolatedModules`-Kompatibilitaet
- **Barrel Files** (index.ts) vereinfachen Importe, koennen aber Tree-Shaking beeinflussen
- **Namespace Imports** (`import * as math`) sammeln alle Exports als Objekt — praktisch aber selten notwendig
- **Side-Effect Imports** (`import './polyfills'`) fuehren Modul-Code aus ohne Werte zu importieren

**Kernkonzept:** ES Modules sind statisch — alle Imports und Exports sind zur Compilezeit bekannt. Das ist der Grund warum Tree-Shaking, IDE-Auto-Imports und `import type` ueberhaupt moeglich sind.

---

## Schnellreferenz: Import-Varianten im Ueberblick

| Syntax | Name | Wann nutzen |
|--------|------|-------------|
| `import { add } from './math'` | Named Import | Standard — immer bevorzugen |
| `import { add as addition } from './math'` | Named Import mit Alias | Bei Namenskollision |
| `import * as math from './math'` | Namespace Import | Wenn viele Exports geblockt genutzt werden |
| `import Logger from './logger'` | Default Import | Konventionsbedingt (React-Komponenten, etc.) |
| `import './polyfills'` | Side-Effect Import | Polyfills, CSS, Initialisierung |
| `import type { User } from './types'` | Type-Only Import | Nur Typen, kein Laufzeit-Code |
| `import { Service, type User } from './x'` | Inline Type Import | Mix aus Wert und Typ (TS 4.5+) |

---

> **Pausenpunkt** — Nimm dir einen Moment. Du hast die Grundbausteine des
> modernen JavaScript-Modulsystems verstanden: wie Exports funktionieren,
> warum Named Exports Named Exports heissen, und was `import type` wirklich macht.
>
> Weiter geht es mit: [Sektion 02 — CommonJS Interop und Module Resolution](./02-commonjs-interop.md)
