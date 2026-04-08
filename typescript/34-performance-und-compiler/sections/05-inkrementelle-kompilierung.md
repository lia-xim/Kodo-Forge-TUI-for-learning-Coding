# Sektion 5: Inkrementelle Kompilierung

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Compile-Zeit messen und optimieren](./04-compile-zeit-messen-und-optimieren.md)
> Naechste Sektion: [06 - Praxis: Monorepo-Performance und CI-Optimierung](./06-praxis-monorepo-performance.md)

---

## Was du hier lernst

- Wie **inkrementelle Kompilierung** funktioniert und was die `tsBuildInfo`-Datei speichert
- Wann und warum du **Project References** brauchst
- Wie `composite` und `references` zusammenhaengen
- Wie du ein **Multi-Package-Projekt** optimal strukturierst

---

## Hintergrund: Warum inkrementell?

> **Origin Story: Das Angular-Monorepo-Problem**
>
> In den fruehen Angular-Tagen (2016-2018) hatten grosse Enterprise-Teams
> ein massives Problem: Jede kleine Aenderung in einem Monorepo loeste
> eine VOLLSTAENDIGE Rekompilierung aller Pakete aus. Ein Monorepo mit
> 50 Libraries und 200.000 Zeilen Code brauchte 3-5 Minuten zum Kompilieren —
> bei jeder einzelnen Aenderung. Die CI-Pipeline dauerte 20+ Minuten.
>
> TypeScript 3.0 (2018) fuehrte Project References ein, und TypeScript 3.4
> (2019) brachte inkrementelles Build. Zusammen reduzierten diese Features
> die Rekompilierungszeit in solchen Monorepos auf 5-15 Sekunden. Das war
> ein Gamechanger fuer grosse Teams.
>
> Besonders Google selbst profitierte davon: Das Angular-Team bei Google
> arbeitet mit einem der groessten TypeScript-Monorepos der Welt. Ohne
> inkrementelle Kompilierung waere die Entwicklungsgeschwindigkeit
> drastisch eingebrochen. Die interne Tooling-Infrastruktur (genannt
> "ts_library" im Build-System Bazel) war der Vorlaeufer fuer das was
> heute Project References sind.

Die Grundidee ist simpel: Warum alles neu kompilieren, wenn sich nur
eine Datei geaendert hat? Inkrementelle Kompilierung merkt sich, was
sich seit dem letzten Build geaendert hat, und kompiliert nur das
Noetige.

> 🏗️ **Analogie: Inkrementelles Build und Git**
>
> Inkrementelle Kompilierung funktioniert aehnlich wie Git Commits. Ein
> Commit speichert nicht das gesamte Repository neu — er speichert nur
> den **Diff** (die Unterschiede) zum vorherigen Commit.
>
> Die `.tsbuildinfo`-Datei ist wie ein Commit-Log: Sie weiss, welchen
> Stand jede Datei hatte und was sich seit dem letzten Build geaendert hat.
> Bei einem inkrementellen Build vergleicht der Compiler die aktuellen
> Hashes mit den gespeicherten Hashes — genau wie `git status` die
> Arbeitskopie mit dem letzten Commit vergleicht.

> 🧠 **Erklaere dir selbst:** Was passiert wenn du die `.tsbuildinfo`-Datei
> loeschst? Muss der Compiler dann wirklich alles neu bauen?
>
> **Kernpunkte:** Ja, ohne `.tsbuildinfo` macht der Compiler einen Full Build |
> Das ist der "worst case" und dauert genauso lange wie ohne `incremental: true` |
> Deshalb: `.tsbuildinfo` NIEMALS loeschen im laufenden Betrieb |
> Ausnahme: Bei verdächtigen Compiler-Fehlern kann `--clean` + Full Build
> helfen um korrupte Caches zu beseitigen

---

## Inkrementelles Build aktivieren

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    // ^ Aktiviert inkrementelles Build
    "tsBuildInfoFile": "./.tsbuildinfo"
    // ^ Wo die Build-Info gespeichert wird (optional, Default: neben outDir)
  }
}

// Was passiert:
// 1. Erster Build: Volle Kompilierung + .tsbuildinfo wird erstellt
// 2. Zweiter Build: Nur geaenderte Dateien + Abhaengigkeiten werden neu kompiliert
// 3. Speedup: 50-90% schneller als ein Full Build
```

Die `.tsbuildinfo`-Datei ist eine JSON-Datei die folgendes speichert:

```typescript annotated
// Vereinfachte Struktur von .tsbuildinfo:
{
  "program": {
    "fileInfos": {
      "src/user.ts": {
        "version": "abc123",      // Hash des Dateiinhalts
        "signature": "def456"     // Hash der oeffentlichen API (.d.ts)
        // ^ Wenn sich der Inhalt aendert aber die Signatur gleich bleibt,
        // ^ muessen Abhaengigkeiten NICHT neu kompiliert werden!
      }
    },
    "semanticDiagnosticsPerFile": [
      // ^ Gespeicherte Fehler pro Datei — muessen nicht neu berechnet werden
    ]
  }
}
// ^ Die Datei ist oft 1-5 MB gross. In .gitignore aufnehmen!
```

> 🧠 **Erklaere dir selbst:** Warum speichert die tsBuildInfo sowohl den "version"-Hash als auch den "signature"-Hash? Warum reicht nicht einer?
> **Kernpunkte:** Version = Dateiinhalt geaendert | Signature = oeffentliche API geaendert | Aenderung im Funktionskoerper aendert version aber nicht signature | Abhaengige Dateien muessen nur bei signature-Aenderung neu geprueft werden | Das spart enorm viel Arbeit

---

## Project References

Inkrementelles Build allein reicht fuer grosse Projekte nicht. Du
brauchst **Project References** um dein Projekt in unabhaengige
Einheiten zu teilen:

```typescript annotated
// Monorepo-Struktur:
// packages/
//   ├── shared/         ← Gemeinsame Typen und Utilities
//   │   └── tsconfig.json
//   ├── api/            ← Backend
//   │   └── tsconfig.json
//   └── web/            ← Frontend
//       └── tsconfig.json
// tsconfig.json          ← Root-Config

// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    // ^ PFLICHT fuer referenzierte Projekte
    // ^ Erzwingt: declaration: true + alle Dateien in include
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}

// packages/web/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../shared" }
    // ^ "web" haengt von "shared" ab
    // ^ tsc baut shared ZUERST, dann web
    // ^ Aenderung in web → nur web wird neu gebaut (shared bleibt)
  ],
  "include": ["src/**/*"]
}
```

> 💭 **Denkfrage:** Was passiert, wenn du `composite: true` vergisst aber
> trotzdem `references` verwendest?
>
> **Antwort:** TypeScript meldet einen Fehler: "Referenced project must
> have setting 'composite': true." Ohne `composite` kann der Compiler
> nicht garantieren, dass .d.ts-Dateien existieren — und Project
> References basieren darauf, dass referenzierte Projekte ihre
> .d.ts-Dateien bereitstellen statt den Quellcode direkt zu pruefen.

> 💭 **Denkfrage:** Was ist der Unterschied zwischen `composite: true` und
> `incremental: true`? Brauchst du beides?
>
> **Antwort:** `incremental: true` aktiviert den `.tsbuildinfo`-Cache fuer
> ein einzelnes Projekt. `composite: true` ist strenger — es erzwingt
> `declaration: true` und strukturiert das Projekt als eigenstaendige
> Compilation Unit. Jedes `composite`-Projekt ist automatisch inkrementell,
> aber nicht jedes inkrementelle Projekt ist `composite`. Fuer ein Monorepo
> mit Project References brauchst du `composite`. Fuer ein einzelnes Projekt
> reicht `incremental`.

---

## Der Build-Modus: tsc --build

Mit Project References verwendest du `tsc --build` (oder `tsc -b`)
statt dem normalen `tsc`:

```typescript annotated
// Root tsconfig.json
{
  "files": [],
  // ^ Keine eigenen Dateien — nur Referenzen
  "references": [
    { "path": "packages/shared" },
    { "path": "packages/api" },
    { "path": "packages/web" }
  ]
}

// Terminal:
// npx tsc --build               ← Baut alles (inkrementell)
// npx tsc --build --clean       ← Loescht alle Build-Artefakte
// npx tsc --build --force       ← Erzwingt Full Build
// npx tsc --build --watch       ← Watch-Mode mit inkrementellem Build
//
// Was --build anders macht als normales tsc:
// 1. Baut Projekte in der richtigen Reihenfolge (Abhaengigkeitsgraph)
// 2. Ueberspringt Projekte die sich nicht geaendert haben
// 3. Nutzt .tsbuildinfo fuer jedes Teilprojekt
```

Der Vorteil wird bei grossen Monorepos dramatisch:

```
Ohne Project References:
  Aenderung in shared/utils.ts → ALLES neu kompilieren (45s)

Mit Project References:
  Aenderung in shared/utils.ts → shared neu (3s) + web neu (5s) = 8s
  Aenderung in web/page.ts    → nur web neu (5s)
  Aenderung in api/route.ts   → nur api neu (4s)
```

> ⚡ **Framework-Bezug (Angular):** Angulars CLI nutzt Project References
> unter der Haube. Wenn du `ng build` in einem Angular-Monorepo mit
> mehreren Libraries ausfuehrst, baut Angular die Libraries in der
> richtigen Reihenfolge und cached die Ergebnisse. Die `angular.json`
> Konfiguration mappt auf Project References. Nx erweitert das mit
> einem verteilten Cache ueber Maschinen hinweg.

> ⚡ **Framework-Bezug (React/Vite):** Vite unterstuetzt Project References
> seit Version 4 automatisch. Wenn dein `tsconfig.json` `references` enthaelt,
> erkennt Vite die Abhaengigkeiten und baut Packages in der korrekten
> Reihenfolge. Zusammen mit Vite's schnellem HMR (Hot Module Replacement)
> ergibt das eine Entwicklungserfahrung bei der sich Aenderungen in einer
> Library sofort im Browser widerspiegeln — ohne dass das gesamte Projekt
> neu gebaut werden muss.

---

## Wann brauchst du was?

| Situation | Loesung | Speedup |
|-----------|---------|:-------:|
| Einzelnes Projekt, < 100 Dateien | Nichts — tsc ist schnell genug | — |
| Einzelnes Projekt, 100-500 Dateien | `incremental: true` | 50-80% |
| Monorepo, 2-5 Pakete | Project References | 60-90% |
| Grosses Monorepo, 10+ Pakete | Project References + Nx/Turborepo | 80-95% |

> 🧪 **Experiment:** Teste den Effekt von `incremental: true` in einem
> beliebigen Projekt:
>
> ```bash
> # Ohne incremental (Full Build):
> rm -f .tsbuildinfo
> time npx tsc --noEmit
>
> # Erster Build mit incremental (erstellt .tsbuildinfo):
> time npx tsc --noEmit --incremental
>
> # Zweiter Build mit incremental (nutzt .tsbuildinfo):
> time npx tsc --noEmit --incremental
>
> # Der zweite Build sollte 50-90% schneller sein!
> ```
>
> Mache dann eine kleine Aenderung in einer Datei und builde erneut —
> nur die geaenderte Datei und ihre Abhaengigkeiten werden geprueft.

---

## Haeufige Fehler bei Project References

```typescript annotated
// Fehler 1: Circular References
// packages/a referenziert packages/b referenziert packages/a
// → FEHLER: "Project references may not form a circular graph"
// Loesung: Gemeinsamen Code in ein drittes Paket extrahieren

// Fehler 2: Fehlende include-Angabe bei composite
// {
//   "compilerOptions": { "composite": true },
//   // "include" fehlt!
// }
// → TypeScript weiss nicht welche Dateien zum Projekt gehoeren
// Loesung: Immer "include": ["src/**/*"] angeben

// Fehler 3: .tsbuildinfo in Git committen
// Die Datei ist maschinenspezifisch und kann Merge-Konflikte verursachen
// Loesung: In .gitignore aufnehmen
// .gitignore:
// *.tsbuildinfo

// Fehler 4: outDir vergessen bei composite
// Ohne outDir landen .d.ts neben den .ts-Dateien
// → Unuebersichtlich und Probleme mit include
// Loesung: Immer "outDir": "./dist" setzen
```

> 🧠 **Erklaere dir selbst:** Warum ist es problematisch wenn `.tsbuildinfo`
> in Git committet wird? Was passiert bei Merge-Konflikten?
>
> **Kernpunkte:** Die Datei enthaelt maschinenspezifische Pfade und Hashes |
> Zwei Entwickler auf verschiedenen Betriebssystemen haben unterschiedliche
> Pfad-Trennzeichen (`\` vs `/`) | Ein Merge-Konflikt in `.tsbuildinfo` ist
> schwer manuell zu loesen | Die Loesung ist einfach: Naechster Build
> erstellt sie neu | Deshalb IMMER in `.gitignore` aufnehmen

> 🧪 **Zusatzexperiment: Watch-Mode mit inkrementellem Build**
>
> Der `--watch`-Modus kombiniert mit `incremental` ist besonders effektiv:
>
> ```bash
> # Watch-Mode starten:
> npx tsc --build --watch
>
> # Jetzt aendere eine Datei und speichere:
> # Du siehst im Terminal:
> # "File change detected. Starting incremental compilation..."
> # "Found 0 errors. Watching for file changes."
> #
> # Die Zeit zwischen "change detected" und "Found 0 errors" ist
> # die inkrementelle Build-Zeit — meist 100-500ms statt 10-30s
> ```
>
> Im Watch-Mode bleibt der Compiler-Prozess aktiv und behaelt den
> Type-Checker im Speicher. Das ist noch schneller als einzelne
> `tsc --build` Aufrufe, weil nicht jedes Mal der Cache von der
> Festplatte geladen werden muss.

---

## Was du gelernt hast

- **Inkrementelles Build** (`incremental: true`) speichert Build-Info in `.tsbuildinfo`
- Die `.tsbuildinfo` speichert **Version-Hashes** und **Signatur-Hashes** pro Datei
- **Project References** teilen ein Monorepo in unabhaengig kompilierbare Einheiten
- `composite: true` ist **Pflicht** fuer referenzierte Projekte
- `tsc --build` baut Projekte in der richtigen Reihenfolge und ueberspringt unveraenderte

**Kernkonzept zum Merken:** Inkrementelles Build ist wie ein Cache fuer den Compiler. Project References sind wie Microservices fuer dein Type System — jedes Paket ist eine eigenstaendige Compilation Unit mit eigener .tsbuildinfo. Zusammen reduzieren sie die Build-Zeit in Monorepos um 80-95%.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt,
> wie TypeScript grosse Projekte effizient kompiliert.
>
> Weiter geht es mit: [Sektion 06: Praxis — Monorepo-Performance und CI-Optimierung](./06-praxis-monorepo-performance.md)
