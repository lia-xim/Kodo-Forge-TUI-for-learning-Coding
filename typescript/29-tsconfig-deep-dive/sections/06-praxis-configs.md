# Sektion 6: Praxis — Monorepo und Framework-Configs

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Fortgeschrittene Flags](./05-fortgeschrittene-flags.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie eine produktionsreife Angular-tsconfig aufgebaut ist
- Wie React/Next.js-Projekte ihre tsconfig strukturieren
- Wie ein Monorepo mit Project References und extends aufgebaut wird
- Welche Flags fuer welches Framework-Setup optimal sind

---

## Die Angular-Konfiguration im Detail
<!-- section:summary -->
Angular-Projekte haben typischerweise **drei** tsconfig-Dateien.

<!-- depth:standard -->
Angular-Projekte haben typischerweise **drei** tsconfig-Dateien.
Das ist kein Zufall — es spiegelt die drei verschiedenen Kontexte
wider, in denen TypeScript-Code laeuft:

```typescript annotated
// 1. tsconfig.json — Die Basis (wird von den anderen geerbt)
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    // ^ Basis fuer alle Pfade
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    // ^ Seit Angular 12 ist strict der Default
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    // ^ Angular-Apps exportieren keine Typen
    "downlevelIteration": true,
    "experimentalDecorators": true,
    // ^ Legacy Decorators — Angular braucht sie (noch)
    "moduleResolution": "node",
    // ^ Aeltere Projekte. Neuere: "bundler"
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"]
  }
}
```

> 📖 **Hintergrund: Warum braucht Angular `experimentalDecorators`?**
>
> Angular nutzt Decorators (`@Component`, `@Injectable`, `@Input`)
> seit seiner Entstehung 2016. Damals gab es keinen Standard —
> nur den experimentellen TypeScript-Decorator-Vorschlag (Stage 1).
> 2023 wurden Decorators standardisiert (Stage 3, TC39), aber die
> neuen Standard-Decorators haben eine ANDERE Semantik als die
> experimentellen. Angular muss deshalb `experimentalDecorators: true`
> beibehalten, bis das Framework auf die neue Decorator-API
> migriert ist. Das ist fuer Angular 19+ geplant.
>
> Du hast Decorators in L28 kennengelernt — dort hast du den
> Unterschied zwischen Legacy und Stage 3 Decorators gesehen.

```typescript annotated
// 2. tsconfig.app.json — Fuer den Anwendungscode
{
  "extends": "./tsconfig.json",
  // ^ Erbt alle compilerOptions von der Basis
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
    // ^ KEINE globalen Typen (z.B. kein @types/jasmine)
    // Verhindert, dass Test-Typen in Produktionscode sichtbar sind
  },
  "files": ["src/main.ts"],
  // ^ Nur der Entry-Point — Rest wird durch Imports gefunden
  "include": ["src/**/*.d.ts"]
  // ^ Plus alle Declaration Files im src-Ordner
}

// 3. tsconfig.spec.json — Fuer Tests
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
    // ^ Jasmine-Typen (describe, it, expect) sind nur hier verfuegbar
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
  // ^ Nur Test-Dateien und Declarations
}
```

> 💭 **Denkfrage:** Warum teilt Angular die tsconfig in app und spec?
> Warum nicht eine einzige Datei fuer alles?
>
> **Antwort:** Isolation. Ohne Trennung waeren `describe()`, `it()`,
> `expect()` im Produktionscode verfuegbar — du koenntest
> versehentlich Test-Code in der App verwenden. Die `types`-Option
> steuert, welche globalen Typen sichtbar sind. In der App: keine
> Test-Typen. In Tests: Jasmine-Typen erlaubt.

---

<!-- /depth -->
## Die React/Next.js-Konfiguration
<!-- section:summary -->
React-Projekte sind einfacher — meistens eine einzige tsconfig:

<!-- depth:standard -->
React-Projekte sind einfacher — meistens eine einzige tsconfig:

```typescript annotated
// React mit Vite — tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    // ^ Standard — node_modules-Konflikte ignorieren

    /* Bundler-Modus */
    "moduleResolution": "bundler",
    // ^ Vite uebernimmt die Datei-Aufloesung
    "allowImportingTsExtensions": true,
    // ^ .ts-Endungen in Imports erlaubt (Vite versteht sie)
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    // ^ Vite/esbuild transpiliert — TypeScript prueft nur

    /* JSX */
    "jsx": "react-jsx",
    // ^ React 17+ JSX Transform — kein "import React" noetig

    /* Strict */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

> 🧠 **Erklaere dir selbst:** Warum hat die React-tsconfig
> `noEmit: true`, aber die Angular-tsconfig nicht? Was macht den
> Unterschied in der Build-Pipeline?
> **Kernpunkte:** React/Vite: esbuild transpiliert, tsc prueft nur |
> Angular: Die Angular CLI (esbuild seit v17) steuert die Kompilierung,
> aber nutzt TypeScript anders | noEmit = kein JS-Output von tsc |
> Angular CLI braucht TypeScript-Output fuer den Template-Compiler

### Next.js-Konfiguration

```typescript annotated
// Next.js — tsconfig.json (generiert von next init)
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    // ^ JavaScript-Dateien werden mit-geprueft (Migration!)
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    // ^ SWC transpiliert — TypeScript prueft nur
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    // ^ JSX NICHT transformieren — Next.js/SWC macht das
    "incremental": true,
    // ^ Schnellere Builds — .tsbuildinfo wird gecacht
    "paths": {
      "@/*": ["./src/*"]
      // ^ Next.js liest paths direkt aus der tsconfig!
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

> ⚡ **Praxis-Tipp:** Next.js ist eines der wenigen Frameworks, das
> `paths` direkt aus der tsconfig liest — ohne zusaetzliche
> Bundler-Konfiguration. In Vite brauchst du dagegen das Plugin
> `vite-tsconfig-paths` oder manuelle `resolve.alias`-Eintraege.

---

<!-- /depth -->
## Das Monorepo-Setup
<!-- section:summary -->
Ein Monorepo mit Project References verbindet alles, was du in

<!-- depth:standard -->
Ein Monorepo mit Project References verbindet alles, was du in
dieser Lektion gelernt hast:

```typescript annotated
// Root: tsconfig.json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ],
  "files": []
  // ^ Root kompiliert NICHTS selbst
}

// packages/shared/tsconfig.json — Die gemeinsame Basis-Bibliothek
{
  "extends": "../../tsconfig.base.json",
  // ^ Gemeinsame Optionen aus der Root-Basis
  "compilerOptions": {
    "composite": true,
    // ^ PFLICHT fuer referenzierte Projekte
    "declaration": true,
    "declarationMap": true,
    // ^ Go-to-Definition springt zur Source, nicht zur .d.ts
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// packages/api/tsconfig.json — Backend (Node.js)
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    // ^ Echte Node.js ESM — .js-Endungen in Imports
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }
    // ^ API haengt von shared ab
  ],
  "include": ["src"]
}

// packages/web/tsconfig.json — Frontend (React/Vite)
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    // ^ Vite uebernimmt die Modul-Aufloesung
    "jsx": "react-jsx",
    "noEmit": true
    // ^ Vite transpiliert — kein tsc-Output
  },
  "references": [
    { "path": "../shared" }
    // ^ Web haengt auch von shared ab
  ],
  "include": ["src"]
}
```

> 🔬 **Experiment:** Analysiere die Monorepo-Struktur oben und
> beantworte diese Fragen fuer dich:
>
> 1. Warum hat `api` `moduleResolution: "nodenext"`, aber `web`
>    hat `"bundler"`? (Antwort: api laeuft direkt in Node.js,
>    web wird von Vite gebundelt)
>
> 2. Warum hat `web` `noEmit: true`, aber `api` und `shared` nicht?
>    (Antwort: web nutzt Vite fuer die Transpilation, api und shared
>    nutzen tsc fuer den Output)
>
> 3. Was passiert, wenn du in `shared` einen neuen Typ hinzufuegst
>    und `tsc --build` ausfuehrst?
>    (Antwort: Nur shared wird neu kompiliert. api und web bekommen
>    die neuen .d.ts-Dateien und werden nur dann neu kompiliert,
>    wenn sie den neuen Typ verwenden)

---

<!-- /depth -->
## Die "goldene tsconfig" fuer neue Projekte
<!-- section:summary -->
Basierend auf allem was du gelernt hast, hier die empfohlene

<!-- depth:standard -->
Basierend auf allem was du gelernt hast, hier die empfohlene
Basis-Konfiguration fuer ein neues TypeScript-Projekt in 2025:

```typescript annotated
// tsconfig.base.json — Die goldene Basis
{
  "compilerOptions": {
    // Sicherheit
    "strict": true,
    // ^ Alle 11 Strict-Flags aktiviert
    "noUncheckedIndexedAccess": true,
    // ^ Array/Objekt-Zugriff per Index gibt T | undefined
    "noImplicitOverride": true,
    // ^ override-Keyword pflicht bei Vererbung
    "forceConsistentCasingInFileNames": true,
    // ^ Verhindert Probleme auf case-insensitiven Dateisystemen (macOS/Windows)

    // Moderne Standards
    "target": "ES2022",
    "lib": ["ES2023"],
    // ^ Neueste APIs (Array.findLast, etc.)
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Interop
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,

    // Moderne Toolchain
    "verbatimModuleSyntax": true,
    // ^ Ersetzt isolatedModules + explizite import type Kontrolle
    "noEmit": true
    // ^ Falls Bundler die Transpilation uebernimmt
  }
}
```

> 📖 **Hintergrund: `noUncheckedIndexedAccess` — Das unterschaetzte Flag**
>
> Dieses Flag ist NICHT Teil von `strict`, verdient es aber:
>
> ```typescript
> const arr = [1, 2, 3];
> const x = arr[5];
> // OHNE noUncheckedIndexedAccess: x ist number (FALSCH!)
> // MIT noUncheckedIndexedAccess: x ist number | undefined (KORREKT!)
> ```
>
> Es wurde in TypeScript 4.1 (2020) eingefuehrt, aber nie zu `strict`
> hinzugefuegt — wahrscheinlich weil es zu viel bestehenden Code
> brechen wuerde. Trotzdem: Es verhindert eine ganze Klasse von
> Runtime-Fehlern (Array-Out-of-Bounds).

---

<!-- /depth -->
## Zusammenfassung: Framework-Empfehlungen

| Flag | Angular | React/Vite | Next.js | Node.js | Library |
|------|---------|------------|---------|---------|---------|
| `strict` | true | true | true | true | true |
| `target` | ES2022 | ES2020 | ES2017 | ES2022 | ES2020 |
| `module` | ES2022 | ESNext | ESNext | NodeNext | ESNext+CJS |
| `moduleResolution` | bundler | bundler | bundler | nodenext | bundler |
| `noEmit` | nein | ja | ja | nein | nein |
| `declaration` | nein | nein | nein | nein | ja |
| `jsx` | — | react-jsx | preserve | — | react-jsx |
| `skipLibCheck` | ja | ja | ja | ja | nein |
| `isolatedModules` | ja | ja | ja | ja | ja |
| `experimentalDecorators` | ja | nein | nein | nein | nein |

---

## Was du gelernt hast

- Angular teilt die tsconfig in Basis, App und Spec (Test-Isolation)
- React/Vite nutzt `noEmit` + `bundler` (TypeScript prueft nur, Vite baut)
- Next.js liest `paths` direkt aus der tsconfig (Sonderfall)
- Monorepos nutzen `composite`, `references` und `extends` zusammen
- `noUncheckedIndexedAccess` gehoert in jede professionelle tsconfig

> 🧠 **Erklaere dir selbst:** Was ist der fundamentale architektonische
> Unterschied zwischen "TypeScript als Compiler" (Angular) und
> "TypeScript als Type-Checker" (React/Vite/Next.js)?
> **Kernpunkte:** Als Compiler: tsc erzeugt JS-Output | Als Type-Checker:
> tsc prueft nur (noEmit) | Bundler/esbuild/SWC uebernehmen die
> Transpilation | Der Trend geht zu "TypeScript als Type-Checker" |
> Vorteil: schnellere Builds (esbuild >> tsc bei Transpilation)

**Kernkonzept zum Merken:** Es gibt keine universell "richtige" tsconfig.
Aber es gibt eine fuer DEIN Projekt richtige — und die haengt von
drei Fragen ab: (1) Was ist die Zielumgebung? (2) Welcher Bundler?
(3) Library oder Anwendung?

---

> **Lektion abgeschlossen!** Du kennst jetzt jeden wichtigen
> Compiler-Flag und weisst, warum er existiert. Die tsconfig ist
> kein Mysterium mehr — sie ist ein Werkzeug, das du bewusst
> konfigurierst.
>
> Weiter geht es mit: [Lektion 30: Review Challenge Phase 3](../30-review-challenge-phase-3/sections/01-phase-3-ueberblick.md)
