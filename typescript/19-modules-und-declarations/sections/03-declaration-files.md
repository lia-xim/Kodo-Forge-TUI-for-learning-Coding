# Sektion 3: Declaration Files — Typen fuer die JavaScript-Welt

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - CommonJS Interop](./02-commonjs-interop.md)
> Naechste Sektion: [04 - Module Augmentation](./04-module-augmentation.md)

---

## Was du hier lernst

- Was `.d.ts`-Dateien sind, warum sie existieren und wie TypeScript sie nutzt
- Wie **DefinitelyTyped** und `@types/*`-Packages die JavaScript-Welt mit Typen versorgen
- Wie du eigene Declaration Files schreibst wenn eine Library keine Typen hat
- Was das `declare`-Keyword bedeutet und wann du "Ambient Declarations" brauchst

---

## Hintergrundgeschichte: Als TypeScript auf eine untypisierte Welt traf

Als TypeScript 2012 veroeffentlicht wurde, gab es bereits ein riesiges JavaScript-
Oekosystem: jQuery, Lodash, Moment.js, Express — tausende Libraries, alle ohne
Typen. Das Problem: TypeScript konnte diese Libraries nicht verstehen.

`import express from 'express'` und dann `app.get('/', ...)` — TypeScript wusste
nicht, was `app` ist, welche Methoden es hat, welche Parameter sie erwarten.
Es fiel zurueck auf `any`. Das war nicht akzeptabel.

Die Loesung war elegant: **Declaration Files** (`.d.ts`). Eine `.d.ts`-Datei
beschreibt die **Form** einer JavaScript-Library ohne deren Implementierung.
Sie ist das TypeScript-Aequivalent zu einem C/C++ Header-File — nur Typen,
keine Logik.

Boris Yankov hatte 2012 eine Idee: Er gruendete **DefinitelyTyped**
(github.com/DefinitelyTyped/DefinitelyTyped), ein GitHub-Repository in dem
die Community Typen fuer JavaScript-Libraries pflegt. Heute hat DefinitelyTyped
**uber 8.000 Packages** mit Typ-Definitionen von einer weltweiten Community
beigesteuert. Es ist eines der groessten Open-Source-Repositories der Welt —
mit uber 100 Millionen npm-Downloads pro Woche.

Das `@types/`-Namespace auf npm ist der oeffentlich zugaengliche Kanal:
`npm install @types/lodash` installiert die Community-gepflegten Typen fuer lodash.

---

## Was ist eine .d.ts-Datei?

Eine `.d.ts`-Datei enthaelt **nur Typ-Informationen** — keinen ausfuehrbaren Code.
TypeScript liest sie um zu verstehen, welche Formen, Methoden und Typen ein
JavaScript-Modul hat. Sie wird nie kompiliert oder ausgefuehrt.

```typescript annotated
// math.d.ts — beschreibt math.js (das die Implementierung enthaelt)
export declare function add(a: number, b: number): number;
// ^ "declare" sagt: "Diese Funktion existiert in JavaScript, ich beschreibe sie nur"
//   Es gibt keine Implementierung hier — math.js stellt sie zur Verfuegung.

export declare function multiply(a: number, b: number): number;
// ^ Gleiche Idee: TypeScript prueft Aufrufe gegen diese Signatur,
//   aber der eigentliche Code laeuft in math.js

export declare const PI: number;
// ^ Konstante: existiert in JavaScript, TypeScript kennt den Typ

export interface MathResult {
  value: number;
  operation: string;
}
// ^ Interfaces brauchen kein "declare" — sie sind reine Typ-Konstrukte
//   und existieren sowieso nur zur Compilezeit (Type Erasure)
```

Wenn du `math.js` und `math.d.ts` zusammen hast, passiert folgendes:
- **TypeScript** liest `math.d.ts` fuer Type-Checking
- **Node.js / Browser** fuehrt `math.js` aus
- `math.d.ts` selbst wird nie ausgefuehrt — sie ist pure Typ-Dokumentation

---

## @types und DefinitelyTyped in der Praxis

```typescript annotated
// Schritt 1: Library installieren
// npm install lodash
// -> Installiert JavaScript-Code ohne Typen

// Schritt 2: Typen installieren
// npm install --save-dev @types/lodash
// -> Installiert node_modules/@types/lodash/index.d.ts

// Schritt 3: Sofort typsicher
import _ from 'lodash';
const chunks = _.chunk([1, 2, 3, 4], 2);
//                                       ^ TypeScript weiss: gibt T[][] zurueck
//             ^ _.chunk ist typisiert: (array: T[], size?: number) => T[][]
```

TypeScript findet `@types`-Packages automatisch — ohne zusaetzliche Konfiguration.
Der Compiler schaut in `node_modules/@types/` und laedt alle gefundenen Definitionen.

> **Wie pruefst du ob eine Library Typen hat?**
> 1. Schau in `node_modules/library-name/` nach `.d.ts`-Dateien (eingebaute Typen)
> 2. Schau in `node_modules/@types/library-name/` (DefinitelyTyped)
> 3. Schaue im `package.json` der Library nach "types" oder "typings"-Feld
> 4. Suche auf npmjs.com — Libraries mit Typen haben ein blaues "TS"-Badge
>    oder ein `DT`-Badge (DefinitelyTyped)

---

## Eigene Declaration Files schreiben

Was tun wenn eine Library keine Typen hat und kein `@types`-Package existiert?
Du schreibst deine eigene `.d.ts`-Datei.

```typescript annotated
// types/my-legacy-lib.d.ts

declare module 'my-legacy-lib' {
// ^ "declare module" erstellst eine Typ-Definition fuer ein npm-Modul
//   TypeScript matcht diesen String mit dem Import-Pfad

  export function doSomething(input: string): Promise<Result>;
  // ^ Alle Exports der Library hier beschreiben

  export function initialize(config: LibConfig): void;

  export interface Result {
    success: boolean;
    data: unknown;
    // ^ "unknown" ist ehrlicher als "any" — zeigt: Typ ist uns unbekannt
    //   Aufrufer muessen validieren bevor sie data nutzen
    timestamp: number;
  }

  export interface LibConfig {
    apiKey: string;
    timeout?: number;
    retries?: number;
  }
}
```

Du musst TypeScript mitteilen, wo diese Datei liegt. Das geht ueber tsconfig.json:

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",
      // ^ Standard: Alle @types-Packages laden
      "./types"
      // ^ Zusaetzlich: Eigene .d.ts-Dateien aus dem types/-Ordner
    ]
  },
  "include": ["src/**/*", "types/**/*"]
  // ^ types/-Ordner muss in "include" sein damit TypeScript ihn findet
}
```

---

## Das `declare`-Keyword — Ambient Declarations

`declare` ist das Schluessewort fuer "Ambient Declarations" — Deklarationen
fuer Code der ausserhalb von TypeScript existiert.

```typescript annotated
// global.d.ts — Ambient Declarations fuer globale Variablen

declare const API_URL: string;
// ^ Eine globale Variable die von einem <script>-Tag oder Webpack DefinePlugin kommt.
//   Kein "export" — sie ist global verfuegbar. TypeScript "vertraut" dir hier.

declare const __DEV__: boolean;
// ^ Typisch in Bundler-Konfigurationen: Webpack definiert __DEV__ zur Buildzeit.
//   Ohne diese Deklaration: "Cannot find name '__DEV__'" Error

declare function gtag(command: string, ...args: unknown[]): void;
// ^ Google Analytics gtag() ist global — wird per <script> geladen.
//   TypeScript kennt den Typ jetzt und prueft Aufrufe.

declare class MyGlobalLib {
// ^ Manchmal laden Legacy-Systeme Klassen global ueber <script>-Tags.
  static init(config: { apiKey: string }): void;
  static track(event: string): void;
}
```

> **Wichtiger Unterschied:**
> - `declare const x: string` — Ambient Declaration: x existiert irgendwo, TypeScript "glaubt" es dir
> - `const x: string = "hallo"` — echte Deklaration mit Implementierung
>
> Bei Ambient Declarations liegt die Verantwortung bei dir: TypeScript prueft
> nicht ob der Wert wirklich existiert. Wenn dein Bundler `__DEV__` nicht
> definiert, gibt es einen Laufzeitfehler — TypeScript kann das nicht abfangen.

---

> **Experiment:** Oeffne den TypeScript Playground und probiere folgendes:
>
> ```typescript
> // Simuliere eine Library ohne Typen
> // Schreibe ein declare module um ihre "Form" zu beschreiben:
>
> declare module 'meine-untypisierte-lib' {
>   export function greet(name: string): string;
>   export const VERSION: string;
> }
>
> // Jetzt kannst du importieren (im Playground funktioniert das als Simulation):
> // Beachte: Der Playground kann keine echten npm-Module laden,
> // aber er versteht die declare module Syntax.
>
> // Probiere: Was passiert wenn du greet(42) schreibst?
> // TypeScript sollte einen Fehler zeigen — obwohl die Funktion "nicht existiert".
> // Das zeigt: .d.ts-Dateien sind echte Typ-Pruefung!
> ```
>
> Aendere jetzt `greet(name: string)` zu `greet(name: unknown)`.
> Was aendert sich? Welche Aufrufe werden jetzt akzeptiert?

---

**In deinem Angular-Projekt:**
Wenn du eine Angular-Library veroeffentlichst (mit `ng-packagr`), generiert
der Build-Prozess automatisch `.d.ts`-Dateien. Das ist der Grund warum andere
Projekte deine Library typsicher nutzen koennen, obwohl sie nur die kompilierten
`.js`-Dateien erhalten.

```typescript annotated
// Auto-generierte .d.ts fuer deinen Angular Service (nach ng-packagr Build):
import * as i0 from '@angular/core';

export declare class UserService {
  // ^ "declare class" — Angular hat diese Klasse in .js, TypeScript liest .d.ts
  private http;
  getUser(id: string): import("rxjs").Observable<User>;
  // ^ Der Return-Type ist vollstaendig typisiert — Nutzer der Library
  //   bekommen volle IDE-Unterstuetzung ohne den Source-Code zu haben
  static ɵprov: i0.ɵɵInjectableDeclaration<UserService>;
}

export declare interface User {
  id: string;
  name: string;
  email: string;
}
```

---

> **Erklaere dir selbst:** Du findest eine JavaScript-Library ohne Typen.
> Du hast drei Optionen: (1) `declare module 'lib' { export const x: any }`,
> (2) eine detaillierte `.d.ts` schreiben, (3) `@ts-ignore` ueberall wo du
> die Library nutzt. Welche Konsequenzen hat jede Option fuer dein Team?
>
> **Kernpunkte:**
> - Option 1 (any): Schnell, aber any-Ansteckung — Fehler werden nicht gefunden
> - Option 2 (.d.ts): Aufwand einmalig, Nutzen dauerhaft — richtige Loesung
> - Option 3 (ts-ignore): Schlimmste Option — unterdruckt spezifische Fehler nicht, sondern alle Fehler in dieser Zeile
> - Zeit-Investment fuer Option 2 lohnt sich ab dem zweiten Nutzer der Library

---

> **Denkfrage:** DefinitelyTyped ist ein Community-Projekt. Was passiert wenn
> jemand falsche Typen fuer eine Library beisteuert? Kannst du TypeScript trotzdem
> vertrauen, wenn du `@types/lodash` installierst? Was ist die fundamentale
> Grenze von `.d.ts`-Dateien?

---

## Was du gelernt hast

- **`.d.ts`-Dateien** beschreiben die Form einer JavaScript-Library — nur Typen, keine Implementierung
- **`@types/*`-Packages** (DefinitelyTyped) liefern Community-gepflegte Typen fuer uber 8.000 JavaScript-Libraries
- **`declare module 'x'`** ermoeglicht eigene Typen fuer Libraries ohne `@types`-Package
- **Ambient Declarations** (`declare const`, `declare function`) beschreiben globale Werte die ausserhalb von TypeScript existieren
- **`typeRoots`** in tsconfig.json steuert wo TypeScript nach `.d.ts`-Dateien sucht

**Kernkonzept:** `.d.ts`-Dateien sind das Bindeglied zwischen der JavaScript-Welt und dem TypeScript-Typsystem. Sie sind Vertrauen — TypeScript prueft nicht ob die beschriebene Form wirklich existiert. Die Verantwortung liegt bei dir oder der Community.

---

> **Pausenpunkt** — Guter Moment inne zu halten. Du verstehst jetzt warum
> TypeScript mit JavaScript-Libraries zusammenarbeiten kann, obwohl diese
> keine Typen haben. DefinitelyTyped ist eines der groessten Community-Projekte
> der Web-Welt — und du weisst jetzt wie es funktioniert.
>
> Weiter geht es mit: [Sektion 04 — Module Augmentation](./04-module-augmentation.md)
