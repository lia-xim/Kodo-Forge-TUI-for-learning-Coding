# Sektion 2: Moderne Module — verbatimModuleSyntax, bundler-Resolution, Import Attributes

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Die TypeScript 5.x Aera](./01-die-typescript-5x-aera.md)
> Naechste Sektion: [03 - Inferred Type Predicates](./03-inferred-type-predicates.md)

---

## Was du hier lernst

- Warum `verbatimModuleSyntax` das **groesste Modulsystem-Update** in TypeScript-Geschichte ist
- Wie `moduleResolution: "bundler"` das jahrelange Problem mit `node`/`node16` loest
- Was **Import Attributes** (`with { type: 'json' }`) sind und warum sie wichtig werden
- Wie Angular 17+ von diesen Features direkt profitiert und was du in deinen Projekten anpassen solltest

---

## Das Problem, das jahrelang existierte

Stell dir vor: Du hast ein TypeScript-Projekt mit einem Bundler wie Vite oder webpack.
Du importierst eine Funktion:

```typescript
import { createUser } from './user-factory';
```

Kein Problem, oder? Falsch. Es gab ein subtiles, aber ernstes Problem.

TypeScript erlaubte dir, einen **Typ** genauso zu importieren wie einen **Wert**:

```typescript
import { UserInterface } from './types';  // TypeScript-Interface — kein JavaScript-Wert!
import { createUser } from './user-factory';  // Echte Laufzeit-Funktion
```

Beide sehen gleich aus. Aber `UserInterface` existiert zur Laufzeit nicht — es ist ein
TypeScript-Typ, der nach der Kompilierung verschwindet (Type Erasure). Was passiert also?

**Was TypeScript damals tat:** Es kompilierte den Typ-Import still heraus. Das funktionierte
meistens. Aber Bundler wie ESBuild, SWC und Vite arbeiten **datei-fuer-datei** — sie
analysieren nicht das gesamte Projekt. Sie sehen `import { UserInterface } from './types'`
und fragen sich: "Soll ich diese Datei laden?" Sie wissen nicht ob das ein Typ oder ein
Wert ist!

Das fuehrte zu:
- **Zirkulaeren Abhaengigkeiten** die unerwartet ausgeloest wurden
- **Leeren Modulen** die trotzdem ausgefuehrt wurden (Seiteneffekte!)
- **Build-Fehlern** bei bestimmten Bundler-Konfigurationen
- **Schlechter Tree-Shaking-Performance** weil Bundler Abhängigkeiten nicht korrekt berechnen konnten

> 📖 **Hintergrund: Warum ist das ein Bundler-Problem?**
>
> Klassische TypeScript-Kompilierung (`tsc`) analysiert das **gesamte** Programm und
> weiss daher, welche Imports Typen sind. Es kann sie still entfernen.
>
> Moderne Bundler (Vite, ESBuild, SWC) kompilieren jede Datei **isoliert** — sie
> transpilieren TypeScript zu JavaScript ohne das gesamte Typsystem zu verstehen.
> Das ist viel schneller (Vite: "instant HMR"). Aber genau deshalb brauchen sie
> explizite Hinweise: "Dieser Import ist nur ein Typ, ignoriere ihn beim Bundling."
>
> Das ist der Kern des Problems. Und `verbatimModuleSyntax` loest es.

---

## verbatimModuleSyntax: Die Loesung (TypeScript 5.0)

`verbatimModuleSyntax: true` in deiner `tsconfig.json` aktiviert eine simple, aber
kraftvolle Regel:

> **Wenn du einen Typ importierst, musst du `import type` schreiben.
> TypeScript ERZWINGT das — und zwar als Compile-Fehler.**

```typescript annotated
// Mit verbatimModuleSyntax: true in tsconfig.json

// --- KORREKT ---
import type { User } from './types';
// ^ "import type" sagt: Dieser Import verschwindet komplett zur Laufzeit.
// Kein Bundler-Problem. Kein Seiteneffekt. Klare Absicht.

import { createUser } from './user-factory';
// ^ Normaler Value-Import: Bleibt zur Laufzeit erhalten.
// createUser() ist eine echte Funktion.

// --- FEHLER (Compile-Error!) ---
// import { User } from './types';
// ^ TypeScript weiss: User ist ein Interface (kein Laufzeit-Wert).
// Mit verbatimModuleSyntax: true ist das ein FEHLER.
// Fehlermeldung: "User" only refers to a type, but is being used as a value here.

// --- GUT: Gemischter Import ---
import { createUser, type User } from './user-factory';
// ^ Inline "type" Modifier: createUser ist ein Value-Import,
//   User ist ein Typ-Import im selben Statement.
// TypeScript entfernt nur den "type User" Teil zur Laufzeit.
```

**Warum ist das revolutionaer?** Weil dein Code jetzt **selbst dokumentiert** welche
Imports Laufzeit-Bedeutung haben und welche nicht. Jeder Bundler, jedes Build-Tool,
jeder Mensch der deinen Code liest weiss sofort:

- `import type { ... }` → "Dieser Import verschwindet. Kein Seiteneffekt."
- `import { ... }` → "Dieser Import ist echt. Er laedt ein Modul zur Laufzeit."

> 🧠 **Erklaere dir selbst:** Was wuerde passieren wenn du ein Modul mit Seiteneffekten
> hast (z.B. `import './setup-globals'`) und es versehentlich als Typ-Import markierst?
>
> **Kernpunkte:** `import type` loescht den Import komplett | Seiteneffekte wuerden
> nicht ausgefuehrt | Das waere ein Laufzeit-Bug | Deshalb kann man Seiteneffekt-Imports
> nicht als `import type` markieren — TypeScript wuerde Fehler geben

---

## moduleResolution: "bundler" — Das richtige Modell fuer moderne Tools

Neben `verbatimModuleSyntax` kam in TypeScript 5.0 ein zweites wichtiges Feature:
die `moduleResolution: "bundler"` Strategie.

### Das alte Problem

TypeScript hatte historisch zwei Hauptstrategien:
- `"node"` — Node.js CommonJS-Stil (`require()`, `.js` optional)
- `"node16"` / `"nodenext"` — Node.js ESM-Stil (`.js` Erweiterung PFLICHT)

Aber: Bundler wie Vite, webpack, ESBuild funktionieren **anders**. Sie:
1. Erlauben Importe ohne Dateiendung (`./utils` statt `./utils.js`)
2. Unterstuetzen Path-Aliases (`@/components/Button`)
3. Erlauben `exports` in `package.json` fuer Sub-Path-Exporte
4. Haben eigene Mechanismen fuer `index.ts`-Aufloesung

Mit `"node16"` bekam man Compile-Fehler wenn man so importierte wie der Bundler erwartete.
Mit `"node"` fehlten neuere Features. Beides war unbefriedigend.

```typescript annotated
// Mit moduleResolution: "bundler" (TypeScript 5.0+)

// Das ALLES funktioniert jetzt ohne Fehler:
import { Button } from '@/components/Button';
// ^ Path-Alias: TypeScript kennt @ als src/

import { utils } from './utils';
// ^ Keine Dateiendung: Bundler loest auf .ts/.tsx auf -- korrekt!

import { deepEqual } from 'lodash-es/isEqual';
// ^ Sub-Path Import in node_modules -- bundler-kompatibel

// exports-Feld in package.json wird korrekt respektiert:
// "exports": { "./Button": "./dist/Button.js" }
import { Button } from 'ui-library/Button';
// ^ TypeScript schaut in "exports" rein, genau wie der Bundler
```

> ⚡ **Praxis-Tipp fuer dein Angular-Projekt:** Angular 17+ verwendet standardmaessig
> `moduleResolution: "bundler"` in neuen Projekten. Wenn du ein aelteres Angular-Projekt
> hast, findest du moeglicherweise noch `"node"` oder `"node16"` in der `tsconfig.json`.
>
> Upgrade-Check:
> ```bash
> cat tsconfig.json | grep moduleResolution
> ```
> Wenn du `"node"` siehst und Vite/webpack als Bundler nutzt, ist `"bundler"` die
> korrektere Wahl. Angular CLI-Migrationen (`ng update`) erledigen das automatisch.

---

## Experiment-Box: verbatimModuleSyntax live erleben

Kein Editor noetig — lies den Code und denke mit:

```typescript
// Datei: types.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export type AdminLevel = 'read' | 'write' | 'admin';
```

```typescript
// Datei: service.ts (mit verbatimModuleSyntax: true)

// FALSCH — wird Compile-Error geben:
// import { UserProfile, AdminLevel } from './types';
// Fehler: 'UserProfile' only refers to a type

// RICHTIG — explizite type-Imports:
import type { UserProfile, AdminLevel } from './types';

// Jetzt kannst du die Typen verwenden:
function createProfile(name: string, email: string): UserProfile {
  return { id: crypto.randomUUID(), name, email };
}

function isAdmin(user: UserProfile, level: AdminLevel): boolean {
  // Laufzeit-Logik hier
  return true;
}
```

```typescript
// Was der Bundler (z.B. ESBuild) daraus macht:
// Die "import type"-Zeile verschwindet KOMPLETT:

// import type { UserProfile, AdminLevel } from './types';
// ^^^ Diese Zeile existiert nach der Kompilierung NICHT mehr.

// function createProfile(name, email) { ... }   ← bleibt
// function isAdmin(user, level) { ... }          ← bleibt
```

Das ist exakt das Verhalten das moderne Bundler brauchen. Sie muessen nicht mehr
raten — sie sehen nur noch echte Laufzeit-Imports.

---

## Import Attributes: JSON und mehr (TypeScript 5.3)

TypeScript 5.3 fuehrte **Import Attributes** ein — eine TC39-Proposal die mittlerweile
in mehreren JavaScript-Engines implementiert ist:

```typescript annotated
// Import Attributes Syntax (TypeScript 5.3+)
import data from './config.json' with { type: 'json' };
// ^ "with" Schluessel-Wort ist der Attribute-Block
// ^ type: 'json' sagt dem JavaScript-Runtime/Bundler:
//   "Interpretiere diese Datei als JSON, nicht als JavaScript"

// Warum wichtig?
// Ohne Attribut koennte ein boesartiger Angreifer deine JSON-Datei
// durch eine JavaScript-Datei ersetzen, die beim Import ausgefuehrt wird.
// Das nennt sich "module confusion attack".
// Import Attributes machen Imports praeziser und sicherer.

// Weitere Attribute-Typen (zukunftsorientiert):
// import sheet from './styles.css' with { type: 'css' };
// import worker from './worker.js' with { type: 'javascript-module' };
```

```typescript annotated
// TypeScript versteht Import Attributes und prueft sie:
import config from './app-config.json' with { type: 'json' };
// TypeScript inferiert den Typ von config als { ... } basierend auf der JSON-Datei!
// Das war vorher nur mit "resolveJsonModule: true" moeglich,
// aber unsicher weil kein Attribut den "json"-Intent signalisierte.

// Praktisches Beispiel in einem Angular-Service:
import translations from './i18n/de.json' with { type: 'json' };
//                                               ^ Bundler weiss: JSON laden

type TranslationKeys = keyof typeof translations;
// TranslationKeys ist jetzt der praezise Union aller JSON-Schluessel!
// "greeting" | "farewell" | ... -- vollstaendige Autovervollstaendigung
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen diesen beiden Imports?
> ```typescript
> import data from './data.json';                      // Alt
> import data from './data.json' with { type: 'json' }; // Neu
> ```
>
> **Antwort:** Semantisch ist der Unterschied minimal in stabilen Umgebungen.
> Aber Import Attributes sind ein **Sicherheitsmechanismus fuer die Zukunft**.
> Browser und Deno koennen mit dem Attribut sicherstellen, dass die Datei wirklich
> als JSON (und nicht als ausfuehrbares JavaScript) behandelt wird. Fuer Bundler
> ist es heute schon ein Hinweis fuer optimiertes Laden. Langfristig werden
> Attribute ein Standard fuer alle Nicht-JS-Imports sein.

---

## Das Zusammenspiel: Die perfekte Kombination

Diese drei Features sind nicht unabhaengig — sie loesen zusammenhaengende Probleme:

```
verbatimModuleSyntax: true
├── Erzwingt "import type" fuer Typ-Imports
├── Macht Build-Tools sicherer (kein Raten mehr)
└── Selbst-dokumentierender Code

moduleResolution: "bundler"
├── Korrekte Aufloesung fuer Vite/webpack/ESBuild
├── Path-Aliases funktionieren ohne Hacks
└── package.json exports werden respektiert

Import Attributes (with { type: ... })
├── Praezise Semantik fuer Nicht-JS-Imports
├── Sicherheit gegen module confusion
└── Zukunftssicherer Standard
```

**Empfohlene tsconfig.json fuer ein Angular 17+ oder Vite-React-Projekt:**

```typescript annotated
// tsconfig.json (TypeScript 5.x, Vite/webpack Projekt)
{
  "compilerOptions": {
    "target": "ES2022",
    // ^ Ausgabe-Format: Modernes JavaScript

    "module": "ESNext",
    // ^ Modul-System der Ausgabe: ESM

    "moduleResolution": "bundler",
    // ^ TypeScript 5.0+: Korrekte Aufloesung fuer Bundler-Umgebungen
    // NICHT "node" oder "node16" fuer Bundler-Projekte!

    "verbatimModuleSyntax": true,
    // ^ TypeScript 5.0+: Erzwingt explizite import type fuer Typen
    // Macht dein Projekt Bundler-freundlich

    "strict": true,
    // ^ Alle strikten Checks aktiviert -- IMMER!

    "skipLibCheck": true,
    // ^ .d.ts Dateien in node_modules nicht pruefen
    // Noetwendig weil manche Libraries inkompatible d.ts haben

    "allowImportingTsExtensions": true,
    // ^ Optional: Erlaubt "import x from './foo.ts'" (Vite-Stil)
    // Nur moeglich wenn kein JS ausgegeben wird (Bundler macht das)

    "isolatedModules": true
    // ^ TypeScript prueft ob jede Datei einzeln kompilierbar ist
    // Voraussetzung fuer schnelle single-file-transpiler wie ESBuild
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum macht es Sinn `verbatimModuleSyntax` und
> `isolatedModules` zusammen zu aktivieren? Was haben beide gemeinsam?
>
> **Kernpunkte:** Beide dienen single-file-Transpilern | `isolatedModules` prueft
> ob Dateien einzeln kompilierbar sind | `verbatimModuleSyntax` macht Typ-Imports
> explizit | Gemeinsam: kein Bundler muss mehr das gesamte TypeScript-Typsystem
> verstehen | Angular kompiliert Templates mit eigenem Compiler (ngcc/esbuild) --
> beide Flags helfen dort enorm

---

## Was du gelernt hast

- `verbatimModuleSyntax: true` erzwingt `import type` fuer Typ-Imports und macht
  Build-Tools sicherer durch explizite Import-Semantik
- `moduleResolution: "bundler"` loest das jahrelange Problem mit falschen Modul-
  Aufloesung-Strategien fuer Vite, webpack und ESBuild
- Import Attributes (`with { type: 'json' }`) sind TC39-Standard fuer sichere,
  praezise Nicht-JS-Imports — Angular und React nutzen das bereits
- Alle drei Features spielen zusammen und sind die Grundlage moderner TypeScript-Projekte

**Kernkonzept zum Merken:** `verbatimModuleSyntax` ist nicht optional wenn du mit
modernen Bundlern arbeitest — es ist die korrekte Art, Typ-Imports zu schreiben.
Ein `import type` ist eine Aussage: "Das hier existiert nur fuer den Compiler."
Das ist guter, ehrlicher Code.

> **Pausenpunkt** — Das Modulsystem ist modernisiert. Jetzt kommt das spannendste
> neue Feature aus dem gesamten TypeScript 5.x Zyklus.
>
> Weiter geht es mit: [Sektion 03: Inferred Type Predicates](./03-inferred-type-predicates.md)
