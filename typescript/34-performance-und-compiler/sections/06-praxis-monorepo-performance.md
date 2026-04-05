# Sektion 6: Praxis — Monorepo-Performance und CI-Optimierung

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Inkrementelle Kompilierung](./05-inkrementelle-kompilierung.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie du ein **Angular/React-Monorepo** fuer optimale Compile-Performance strukturierst
- Wie du **CI-Pipelines** mit TypeScript-Builds beschleunigst
- Welche **Build-Tools** (Nx, Turborepo) auf Project References aufbauen
- Ein komplettes **Performance-Audit** an einem realen Beispiel

---

## Hintergrund: Das Monorepo in der Praxis

> **Origin Story: Google's Monorepo**
>
> Google hat ein einziges Repository mit ueber 2 Milliarden Zeilen Code.
> Dass das funktioniert, liegt an einem massiv parallelisierten Build-System
> (Bazel). Das TypeScript-Oekosystem hat mit Nx (von ehemaligen Angular-
> Team-Mitgliedern entwickelt) ein aehnliches Konzept fuer JavaScript/
> TypeScript-Monorepos geschaffen.
>
> Der Kerngedanke: Nicht alles neu bauen, sondern nur das was sich geaendert
> hat — und das ueber Maschinen hinweg cachen. In der Praxis bedeutet das:
> Wenn ein Kollege denselben Code schon gebaut hat, laedst du das Ergebnis
> aus dem Cache statt selbst zu kompilieren.

Monorepos sind der Standard in Enterprise-Angular-Projekten und werden
in React-Projekten zunehmend beliebter. Die Herausforderung: Wie hast
du 20+ Pakete ohne dass jeder Build Minuten dauert?

---

## Monorepo-Struktur fuer Performance

Die optimale Struktur hat **drei Schichten**:

```
  monorepo/
  ├── packages/
  │   ├── types/              ← Schicht 1: Shared Types (keine Logik)
  │   │   └── tsconfig.json   ← composite: true, am schnellsten zu bauen
  │   │
  │   ├── utils/              ← Schicht 2: Shared Utilities
  │   │   └── tsconfig.json   ← references: [types]
  │   │
  │   ├── api-client/         ← Schicht 2: API-Schicht
  │   │   └── tsconfig.json   ← references: [types, utils]
  │   │
  │   ├── web-app/            ← Schicht 3: Apps (abhaengig von Schicht 1+2)
  │   │   └── tsconfig.json   ← references: [types, utils, api-client]
  │   │
  │   └── admin-app/          ← Schicht 3: Weitere App
  │       └── tsconfig.json   ← references: [types, utils, api-client]
  │
  └── tsconfig.json           ← Root: references auf alle Pakete
```

```typescript annotated
// packages/types/tsconfig.json — Schicht 1
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    // ^ declarationMap ermoeglicht "Go to Definition" in die .ts-Quelle
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
  // ^ Kein "references" — types hat keine Abhaengigkeiten
}

// packages/web-app/tsconfig.json — Schicht 3
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "strict": true
  },
  "references": [
    { "path": "../types" },
    { "path": "../utils" },
    { "path": "../api-client" }
    // ^ Explizite Abhaengigkeiten — der Compiler weiss die Build-Reihenfolge
  ],
  "include": ["src/**/*"]
}
```

> 🧠 **Erklaere dir selbst:** Warum sollte "types" keine Logik enthalten, sondern nur Interfaces und Type Aliases? Was waere das Problem, wenn types auch Funktionen haette?
> **Kernpunkte:** Reine Typen haben Type Erasure → kein JavaScript-Output | Aenderung an types-Signatur triggert Rebuild aller Abhaengigen | Je kleiner types, desto seltener Rebuilds | Logik in utils separieren → Typ-Aenderung ≠ Logik-Aenderung

---

## CI-Pipeline optimieren

```typescript annotated
// .github/workflows/ci.yml (GitHub Actions Beispiel)
//
// SCHLECHT: Alles bei jedem Push pruefen
// steps:
//   - run: npx tsc --noEmit          ← Prueft ALLES, auch Unveraendertes
//   - run: npm test                   ← Testet ALLES
//
// GUT: Nur Betroffenes pruefen
// steps:
//   - run: npx tsc --build --noEmit  ← Inkrementell, nutzt tsBuildInfo
//   - run: npx nx affected --target=test  ← Nur betroffene Pakete testen

// Cache-Strategie fuer CI:
// 1. .tsbuildinfo-Dateien cachen (GitHub Actions Cache)
// 2. node_modules cachen (npm ci ist langsam)
// 3. Nx Remote Cache nutzen (optional)
```

Konkrete GitHub Actions Konfiguration:

```typescript annotated
// .github/workflows/ci.yml
// name: TypeScript CI
// on: [push, pull_request]
// jobs:
//   typecheck:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: actions/setup-node@v4
//         with:
//           node-version: 20
//           cache: 'npm'
//       
//       - name: Cache tsBuildInfo
//         uses: actions/cache@v4
//         with:
//           path: |
//             **/.tsbuildinfo
//             **/dist/**/*.d.ts
//           key: tsbuild-${{ hashFiles('**/tsconfig.json') }}-${{ github.sha }}
//           restore-keys: tsbuild-${{ hashFiles('**/tsconfig.json') }}-
//           # ^ Cached die Build-Artefakte zwischen CI-Laeufen
//           # ^ Nur bei tsconfig-Aenderung wird der Cache invalidiert
//
//       - run: npm ci
//       - run: npx tsc --build --noEmit
//         # ^ Nutzt den gecachten .tsbuildinfo
//         # ^ Erster Lauf: 45s. Folgende Laeufe: 5-10s.
```

> 💭 **Denkfrage:** Warum cachen wir `.tsbuildinfo` UND `dist/**/*.d.ts`?
> Warum reicht `.tsbuildinfo` allein nicht?
>
> **Antwort:** Die `.tsbuildinfo` referenziert die .d.ts-Dateien als
> "Signaturen". Wenn die .d.ts fehlen aber .tsbuildinfo existiert, muss
> der Compiler alles neu bauen weil die Signaturen nicht verifiziert
> werden koennen. Beides zusammen cachen ist essenziell.

---

## Build-Tools: Nx und Turborepo

Fuer Monorepos mit 5+ Paketen lohnt sich ein Build-Tool:

```typescript annotated
// Nx (empfohlen fuer Angular-Monorepos)
// npx nx affected --target=build
// ^ Baut nur Pakete die von der Aenderung betroffen sind
// ^ Nutzt einen Dependency Graph den Nx automatisch erstellt
// ^ Remote Cache: Ergebnisse werden teamweit geteilt

// Turborepo (empfohlen fuer React/Next.js-Monorepos)
// npx turbo build
// ^ Aehnliches Konzept, andere Implementierung
// ^ Cache ist auch remote-faehig (Vercel Remote Cache)

// Vergleich:
// Nx:        Tiefer Angular-Integration, mehr Features, groesseres Setup
// Turborepo: Einfacher, schneller, besser fuer "einfache" Monorepos
// ^ Beide nutzen unter der Haube TypeScript Project References
```

> ⚡ **Framework-Bezug (Angular + React):** Wenn du beruflich mit Angular
> arbeitest, ist Nx die Standardwahl — es wurde vom ehemaligen Angular-
> Team gebaut und hat erstklassige Angular-Unterstuetzung (Schematics,
> Generators, etc.). Fuer deine privaten React-Projekte ist Turborepo
> oft die einfachere Wahl — weniger Konfiguration, schnellerer Einstieg.

---

## Performance-Audit: Ein reales Beispiel

Stell dir vor, du hast ein Angular-Monorepo mit folgendem Problem:
"Full Build dauert 90 Sekunden, Watch-Mode rebuild dauert 25 Sekunden."

So gehst du vor:

```typescript annotated
// Schritt 1: Baseline messen
// npx tsc --build --extendedDiagnostics
//
// Ergebnis:
// Check time: 72s (80% der Gesamtzeit)
// Files: 1,247
// Memory: 890MB

// Schritt 2: Low-Hanging Fruits
// a) skipLibCheck: true → Check time: 58s (14s gespart!)
// b) isolatedModules: true → Ermoeglicht esbuild-Transpilierung
// c) incremental: true → Rebuild: 8s statt 25s

// Schritt 3: Trace analysieren
// npx tsc --generateTrace ./trace
// → Langsamste Datei: shared/types/api-responses.ts (8.4s)
// → Ursache: Riesige Union mit 120 API-Response-Typen

// Schritt 4: Union aufteilen
// VORHER: type ApiResponse = UserResponse | PostResponse | ... (120 Varianten)
// NACHHER: Mapped Type mit Lookup (Sektion 3)
// → Check time fuer diese Datei: 1.2s (statt 8.4s)

// Schritt 5: Project References einfuehren
// shared/, api/, web/ als separate Projekte
// → Rebuild nach Aenderung in web/: 3s statt 8s

// Ergebnis:
// Full Build: 90s → 38s
// Watch Rebuild: 25s → 3-5s
// CI mit Cache: 90s → 8s
```

> 🧪 **Experiment:** Fuehre ein Mini-Audit an deinem eigenen Projekt durch:
>
> ```bash
> # 1. Baseline
> npx tsc --noEmit --extendedDiagnostics 2>&1 | grep -E "Check time|Total time|Memory"
>
> # 2. Mit skipLibCheck
> npx tsc --noEmit --extendedDiagnostics --skipLibCheck 2>&1 | grep -E "Check time|Total time|Memory"
>
> # 3. Differenz berechnen
> # Check time Differenz = Zeit fuer .d.ts-Pruefung
> ```
>
> Notiere die Zahlen. In der naechsten Lektion (L35: Migration Strategies)
> wirst du sehen, wie diese Performance-Analyse auch bei Migrationen hilft.

---

## Zusammenfassung: Der Performance-Workflow

```
  1. Messen        → --extendedDiagnostics, --generateTrace
  2. Quick Wins    → skipLibCheck, isolatedModules, incremental
  3. Strukturieren → Project References fuer Monorepos
  4. Optimieren    → Langsamste Typen refactoren (Interface statt &, Unions aufteilen)
  5. Cachen        → .tsbuildinfo in CI, Nx/Turborepo Remote Cache
  6. Wiederholen   → Performance-Budget definieren, regelmaessig messen
```

---

## Was du gelernt hast

- Ein Monorepo hat optimaler Weise **drei Schichten**: Types, Utilities, Apps
- **CI-Caching** von `.tsbuildinfo` + `.d.ts` spart 80%+ der CI-Build-Zeit
- **Nx** ist ideal fuer Angular-Monorepos, **Turborepo** fuer React/Next.js
- Ein **Performance-Audit** folgt immer: Messen → Quick Wins → Strukturieren → Optimieren
- Die Kombination aller Techniken kann Builds von **90s auf unter 10s** reduzieren

**Kernkonzept zum Merken:** TypeScript-Performance ist kein Mysterium — es ist ein messbares, optimierbares Problem. Mit den richtigen Werkzeugen (--generateTrace), den richtigen Einstellungen (skipLibCheck, incremental), und der richtigen Struktur (Project References) kannst du auch grosse Codebases in Sekunden statt Minuten kompilieren.

---

> **Ende der Lektion.** Du hast jetzt ein tiefes Verstaendnis davon, wie der
> TypeScript-Compiler arbeitet und wie du ihn schnell haeltst.
>
> Weiter geht es mit: **L35 — Migration Strategies**
