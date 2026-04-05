# Sektion 2: Declaration Files richtig generieren

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Package.json exports und types-Feld](./01-package-json-exports-und-types.md)
> Naechste Sektion: [03 - Dual Package (CJS + ESM)](./03-dual-package-cjs-esm.md)

---

## Was du hier lernst

- Wie TypeScript **.d.ts-Dateien** aus deinem Quellcode generiert
- Wann du `declaration`, `declarationMap` und `emitDeclarationOnly` brauchst
- Wie du die **Qualitaet** deiner .d.ts-Dateien sicherstellst
- Warum **Declaration Maps** fuer Developer Experience essenziell sind

---

## Hintergrund: Was sind Declaration Files?

> **Origin Story: Das .d.ts-Format**
>
> Als TypeScript 2012 veroeffentlicht wurde, existierten bereits Millionen
> von JavaScript-Libraries ohne Typ-Information. Anders Hejlsberg und sein
> Team brauchten einen Weg, existierendem JavaScript-Code Typen zu geben —
> OHNE den Code zu aendern. Die Loesung: .d.ts-Dateien.
>
> .d.ts steht fuer "declaration TypeScript". Diese Dateien enthalten NUR
> Typ-Informationen — keinen ausfuehrbaren Code. Sie sind das Aequivalent
> von C/C++ Header-Dateien: Sie beschreiben die Schnittstelle, nicht die
> Implementation. Fuer Library-Autoren sind .d.ts-Dateien das wichtigste
> Artefakt neben dem JavaScript-Code selbst.

Wenn du eine TypeScript-Library veroeffentlichst, lieferst du zwei Dinge:

1. **JavaScript-Code** (.js) — wird ausgefuehrt
2. **Declaration Files** (.d.ts) — werden von TypeScript gelesen

Deine Konsumenten fuehren den .js-Code aus, aber ihre IDE und ihr
Compiler lesen die .d.ts-Dateien fuer Autocomplete, Fehler-Pruefung
und Dokumentation.

---

## Declaration-Generierung aktivieren

```typescript annotated
// tsconfig.json fuer Library-Authoring
{
  "compilerOptions": {
    "declaration": true,
    // ^ Erzeugt .d.ts-Dateien neben den .js-Dateien
    // ^ PFLICHT fuer Libraries

    "declarationMap": true,
    // ^ Erzeugt .d.ts.map-Dateien
    // ^ Ermoeglicht "Go to Definition" → .ts-Quellcode statt .d.ts
    // ^ EMPFOHLEN — verbessert DX fuer Konsumenten massiv

    "sourceMap": true,
    // ^ Erzeugt .js.map-Dateien fuer Runtime-Debugging

    "outDir": "./dist",
    // ^ Alle generierten Dateien landen hier

    "rootDir": "./src",
    // ^ Quellcode-Root — bestimmt die Verzeichnisstruktur in dist/

    "strict": true
    // ^ Libraries sollten IMMER strict sein
  },
  "include": ["src/**/*"]
}
```

Was entsteht:

```
  src/
    index.ts          ← Dein Quellcode
    utils.ts

  dist/               ← Generierte Dateien
    index.js          ← JavaScript (ausfuehrbar)
    index.d.ts        ← Types (fuer Konsumenten)
    index.d.ts.map    ← Declaration Map (Go to Definition)
    index.js.map      ← Source Map (Debugging)
    utils.js
    utils.d.ts
    utils.d.ts.map
    utils.js.map
```

> 🧠 **Erklaere dir selbst:** Warum braucht man SOWOHL .js.map als auch .d.ts.map? Was macht jede Datei?
> **Kernpunkte:** .js.map: Mapping von dist/index.js → src/index.ts (fuer Runtime-Debugging) | .d.ts.map: Mapping von dist/index.d.ts → src/index.ts (fuer "Go to Definition" in der IDE) | Ohne .d.ts.map springt die IDE in die .d.ts statt in den Quellcode

---

## emitDeclarationOnly: Wenn ein Bundler den JS-Code erzeugt

Wenn du tsup, esbuild oder einen anderen Bundler fuer den JavaScript-
Output verwendest, brauchst du tsc nur fuer die .d.ts-Dateien:

```typescript annotated
// tsconfig.json — nur Declarations erzeugen
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    // ^ Erzeugt NUR .d.ts und .d.ts.map — KEIN .js!
    // ^ Der Bundler (tsup, esbuild) erzeugt den .js-Output
    "outDir": "./dist"
  }
}

// Build-Script:
// 1. tsup src/index.ts --format cjs,esm  ← JavaScript erzeugen
// 2. tsc --emitDeclarationOnly            ← .d.ts erzeugen
// ^ Zusammen: schneller JS-Build + korrekte Typen
```

> 💭 **Denkfrage:** Warum nicht einfach tsc fuer alles verwenden?
> Warum den Umweg ueber einen Bundler?
>
> **Antwort:** tsc erzeugt eine .js-Datei PRO .ts-Datei — es bundelt
> nicht. Fuer Libraries willst du oft ein einzelnes Bundle (oder CJS + ESM).
> Bundler koennen: Tree-Shaking, Minification, Code-Splitting. tsc kann das
> nicht. Deshalb: Bundler fuer JS, tsc fuer .d.ts.

---

## Was gehoert in die .d.ts — und was nicht?

TypeScript generiert .d.ts aus deinem oeffentlichen API:

```typescript annotated
// src/index.ts — Dein Quellcode
export interface User {
  id: string;
  name: string;
  email: string;
}

export function createUser(name: string, email: string): User {
  // Implementation — erscheint NICHT in .d.ts
  const id = crypto.randomUUID();
  console.log(`Creating user ${name}`);
  return { id, name, email };
}

// Private Hilfsfunktion — erscheint NICHT in .d.ts
function validateEmail(email: string): boolean {
  return email.includes("@");
}

// dist/index.d.ts — Generiert von tsc
// export interface User {
//   id: string;
//   name: string;
//   email: string;
// }
// export declare function createUser(name: string, email: string): User;
//
// ^ Nur die SIGNATUR — keine Implementation
// ^ Private Funktionen (nicht exportiert) fehlen komplett
// ^ Interface bleibt vollstaendig (hat keine Implementation)
```

> ⚡ **Framework-Bezug (Angular):** Angular-Libraries (erstellt mit
> `ng generate library`) nutzen eine spezielle ng-packagr-Konfiguration
> die automatisch korrekte .d.ts-Dateien und das `exports`-Feld erzeugt.
> Wenn du eine Angular-Library baust, kuemmert sich ng-packagr um alles
> was in dieser Lektion manuell gezeigt wird. Aber zu verstehen was
> darunter passiert, hilft beim Debugging.

---

## Qualitaetskontrolle fuer .d.ts

Generierte .d.ts koennen Probleme haben. Pruefe diese Punkte:

```typescript annotated
// Problem 1: Interne Typen werden exponiert
// src/internal.ts
type InternalConfig = { secret: string };  // Nicht exportiert!

// src/index.ts
export function getConfig(): InternalConfig {
  // ^ WARNUNG: Rueckgabetyp referenziert nicht-exportierten Typ
  // ^ In .d.ts: TypeScript "inlined" den Typ oder zeigt einen Fehler
  return { secret: "abc" };
}
// Fix: InternalConfig exportieren ODER den Rueckgabetyp explizit angeben
export function getConfig(): { secret: string } {
  return { secret: "abc" };
}

// Problem 2: Zu breite Typen
export function parseConfig(json: string) {
  return JSON.parse(json);
  // ^ Rueckgabetyp: any! Das ist schlecht fuer Konsumenten
}
// Fix: Expliziter Rueckgabetyp
export function parseConfig(json: string): Config {
  return JSON.parse(json) as Config;
}

// Problem 3: Fehlende Generic-Constraints
export function first<T>(items: T[]) {
  return items[0];
  // ^ Rueckgabetyp: T — OK, aber koennte T | undefined sein
}
// Fix: Ehrlicher Rueckgabetyp
export function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

> 🧪 **Experiment:** Erzeuge .d.ts und pruefe sie:
>
> ```bash
> # 1. Erstelle src/lib.ts:
> # export function add(a: number, b: number) { return a + b; }
>
> # 2. Generiere .d.ts:
> npx tsc src/lib.ts --declaration --emitDeclarationOnly --outDir dist
>
> # 3. Pruefe das Ergebnis:
> cat dist/lib.d.ts
> # → export declare function add(a: number, b: number): number;
>
> # 4. Aendere zu: export function add(a, b) { return a + b; }
> # 5. Generiere erneut — was passiert mit dem Rueckgabetyp?
> ```
>
> Beobachte: Ohne Typ-Annotationen inferiert TypeScript. Das Ergebnis
> kann ueberraschend sein — explizite Typen in Libraries sind sicherer.

---

## Declaration Maps: Go to Definition

Declaration Maps sind das Feature das den groessten DX-Unterschied
fuer deine Konsumenten macht:

```typescript annotated
// Ohne declarationMap:
// Konsument drueckt "Go to Definition" auf createUser()
// → IDE springt zu: node_modules/my-lib/dist/index.d.ts
// → Zeigt: export declare function createUser(name: string, email: string): User;
// → Keine Kommentare, keine Implementation, nicht hilfreich

// Mit declarationMap:
// Konsument drueckt "Go to Definition" auf createUser()
// → IDE springt zu: node_modules/my-lib/src/index.ts (!)
// → Zeigt: den VOLLEN Quellcode mit Kommentaren
// → Maximale Transparenz und Dokumentation
```

Dafuer muss der Quellcode mitgeliefert werden:

```typescript annotated
// package.json — Quellcode in das npm-Paket aufnehmen
{
  "files": [
    "dist",
    // ^ JavaScript + .d.ts + Maps
    "src"
    // ^ Quellcode fuer Declaration Maps
    // ^ OPTIONAL: Nur noetig fuer "Go to Definition" in Quellcode
    // ^ Vergroessert das Paket — Abwaegung treffen
  ]
}
```

---

## Was du gelernt hast

- `declaration: true` erzeugt **.d.ts-Dateien** aus deinem Quellcode
- `declarationMap: true` ermoeglicht **"Go to Definition" in den Quellcode** statt in die .d.ts
- `emitDeclarationOnly` ist ideal wenn ein **Bundler den JS-Output** erzeugt
- **.d.ts-Qualitaet** pruefen: keine `any`-Rueckgabetypen, keine exponierten Interna, explizite Typen
- **Quellcode mitliefern** (files: ["src"]) fuer maximale Developer Experience

**Kernkonzept zum Merken:** .d.ts-Dateien sind die Visitenkarte deiner Library. Sie bestimmen, wie Konsumenten deine Library erleben — Autocomplete, Fehlermeldungen, Dokumentation. Investiere in ihre Qualitaet: explizite Typen, Declaration Maps, und keine `any`-Lecks.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du weisst jetzt, wie du
> hochwertige Type Declarations erzeugst.
>
> Weiter geht es mit: [Sektion 03: Dual Package (CJS + ESM)](./03-dual-package-cjs-esm.md)
