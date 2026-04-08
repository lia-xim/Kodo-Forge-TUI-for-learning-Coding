# Sektion 1: tsconfig-Grundstruktur

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Die Strict-Mode-Familie](./02-strict-mode-familie.md)

---

## Was du hier lernst

- Wie `tsconfig.json` aufgebaut ist und welche Top-Level-Felder es gibt
- Warum `extends` die wichtigste Eigenschaft fuer Team-Projekte ist
- Wie `references` Project References und Monorepo-Builds ermoeglichen
- Den Unterschied zwischen `include`, `exclude` und `files`

---

## Die Zentrale deines TypeScript-Projekts
<!-- section:summary -->
Jedes TypeScript-Projekt hat eine `tsconfig.json`. Sie ist nicht nur

<!-- depth:standard -->
Jedes TypeScript-Projekt hat eine `tsconfig.json`. Sie ist nicht nur
eine Konfigurationsdatei — sie ist der **Vertrag zwischen dir und dem
Compiler**. Hier definierst du: Welche Dateien werden kompiliert?
Wie streng prueft der Compiler? Welches JavaScript kommt am Ende raus?

Und doch: Die meisten Entwickler kopieren ihre tsconfig von Stack Overflow
und aendern nie wieder etwas daran. Das ist, als wuerdest du ein Auto
kaufen und nie die Spiegel einstellen.

```typescript annotated
// Die grundlegende Struktur einer tsconfig.json
{
  "compilerOptions": {
  // ^ Das Herzstück — alle Compiler-Flags leben hier
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  // ^ Welche Dateien kompiliert werden (Glob-Patterns)
  "exclude": ["node_modules", "dist"],
  // ^ Welche Dateien NICHT kompiliert werden
  "extends": "./tsconfig.base.json",
  // ^ Konfiguration von einer anderen Datei erben
  "references": [{ "path": "./packages/core" }]
  // ^ Project References fuer Monorepos
}
```

> 📖 **Hintergrund: Warum JSON und nicht YAML oder TOML?**
>
> Als Anders Hejlsberg und das TypeScript-Team 2012 die Konfiguration
> entwarfen, waehlten sie JSON — obwohl JSON keine Kommentare unterstuetzt.
> Der Grund: JSON war das einzige Format, das jeder JavaScript-Entwickler
> ohne neue Tools sofort lesen konnte. Die Loesung fuer fehlende
> Kommentare? TypeScript akzeptiert JSONC (JSON with Comments) in
> tsconfig-Dateien. Du kannst `//` und `/* */` verwenden — das funktioniert
> seit TypeScript 1.0. Viele Entwickler wissen das nicht und vermeiden
> deshalb Kommentare in ihrer tsconfig. Tu das nicht — kommentiere deine
> Entscheidungen!

---

<!-- /depth -->
## Die Top-Level-Felder im Detail
<!-- section:summary -->
### `compilerOptions` — Das Herzsstueck

<!-- depth:standard -->
### `compilerOptions` — Das Herzsstueck

Hier stecken ueber 100 Flags, die das Verhalten des Compilers steuern.
Wir werden sie in den folgenden Sektionen Gruppe fuer Gruppe durchgehen.
Fuer jetzt: `compilerOptions` ist ein Objekt, und jeder Schluessel darin
ist ein Compiler-Flag.

### `include` und `exclude` — Was wird kompiliert?

```typescript annotated
{
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  // ^ Glob-Patterns: ** = beliebig viele Verzeichnisse, * = beliebiger Dateiname
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
  // ^ Ausnahmen von include — Tests nicht mit-kompilieren
}
```

Die Reihenfolge der Auswertung ist:
1. `files` (explizite Dateiliste) — hoechste Prioritaet
2. `include` (Glob-Patterns) — wird von `exclude` eingeschraenkt
3. `exclude` entfernt Dateien aus `include`, aber NICHT aus `files`

> 💭 **Denkfrage:** Wenn du eine Datei in `files` auflistest UND sie
> in `exclude` steht — wird sie kompiliert oder nicht?
>
> **Antwort:** Sie wird kompiliert. `files` hat absolute Prioritaet.
> `exclude` filtert nur `include`, niemals `files`. Das ist ein
> haeufiger Stolperstein bei Debugging-Szenarien.

### `files` — Explizite Dateiliste

```json
{
  "files": ["src/index.ts", "src/globals.d.ts"]
}
```

`files` wird selten verwendet — es listet einzelne Dateien auf statt
Patterns. Sinnvoll fuer kleine Projekte oder wenn du exakte Kontrolle
brauchst. In der Praxis dominiert `include`.

---

<!-- /depth -->
## `extends` — Konfiguration erben
<!-- section:summary -->
Stell dir vor, du hast ein Team mit 5 Frontend-Projekten. Alle

<!-- depth:standard -->
Stell dir vor, du hast ein Team mit 5 Frontend-Projekten. Alle
sollen dieselben Grundregeln haben: strict, ES2022, ModuleResolution
NodeNext. Ohne `extends` muesstest du diese Optionen in jeder
tsconfig duplizieren.

```typescript annotated
// tsconfig.base.json — Die gemeinsame Basis
{
  "compilerOptions": {
    "strict": true,
    // ^ Grundregel: immer strict
    "target": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// tsconfig.json im Projekt — erbt und erweitert
{
  "extends": "./tsconfig.base.json",
  // ^ Alle compilerOptions aus base.json werden uebernommen
  "compilerOptions": {
    "outDir": "./dist",
    // ^ Projektspezifische Ergaenzung — merged mit base
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Wichtig:** `compilerOptions` werden **gemerged** (zusammengefuehrt).
Aber `include`, `exclude` und `files` werden **komplett ueberschrieben**.
Wenn du in der Kind-Datei `include` setzt, wird das `include` der
Eltern-Datei ignoriert — nicht erweitert.

> 🧠 **Erklaere dir selbst:** Warum werden `compilerOptions` gemerged,
> aber `include` ueberschrieben? Was waere das Problem, wenn `include`
> auch gemerged wuerde?
> **Kernpunkte:** Merge bei Optionen = gemeinsame Basis + lokale Anpassung |
> Merge bei include = unkontrollierbare Dateimengen | Kind-Projekt kennt
> nur seine eigenen Dateien | Ueberschreiben = volle Kontrolle

### `extends` mit npm-Paketen

Seit TypeScript 5.0 kannst du von npm-Paketen erben. Das hat ein
ganzes Oekosystem von geteilten Konfigurationen erzeugt:

```json
{
  "extends": "@tsconfig/node20/tsconfig.json"
}
```

Beliebte Basis-Konfigurationen:
- `@tsconfig/node20` — optimiert fuer Node.js 20
- `@tsconfig/strictest` — maximale Strenge
- `@tsconfig/recommended` — konservativer Standard

> ⚡ **Praxis-Tipp:** In deinem Angular-Projekt nutzt du wahrscheinlich
> die von Angular CLI generierte tsconfig, die intern von einer
> Angular-Basis erbt. Schau in dein `tsconfig.json` — dort steht
> vermutlich `"extends": "./tsconfig.base.json"`. Die Angular CLI
> teilt die Konfiguration in `tsconfig.app.json`, `tsconfig.spec.json`
> und eine gemeinsame `tsconfig.json` auf.

---

<!-- /depth -->
## `references` — Project References
<!-- section:summary -->
Project References sind TypeScripts Antwort auf Monorepos. Sie

<!-- depth:standard -->
Project References sind TypeScripts Antwort auf Monorepos. Sie
ermoeglichen es, ein grosses Projekt in kleinere "Teilprojekte"
aufzuteilen, die unabhaengig kompiliert und gecached werden.

```typescript annotated
// Root tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    // ^ Jedes Paket ist ein eigenstaendiges TypeScript-Projekt
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ],
  "files": []
  // ^ Root kompiliert selbst NICHTS — nur die Referenzen
}

// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    // ^ PFLICHT fuer referenzierte Projekte!
    "declaration": true,
    // ^ Erzeugt .d.ts Dateien fuer Consumer
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### Warum `composite: true`?

Das `composite`-Flag ist **Pflicht** fuer jedes referenzierte Projekt.
Es aktiviert drei Dinge:
1. **Inkrementelle Builds** — nur geaenderte Dateien werden neu kompiliert
2. **.tsbuildinfo** — eine Cache-Datei fuer den Build-Zustand
3. **declaration: true** wird erzwungen — damit andere Projekte die Typen sehen

> 📖 **Hintergrund: Die Entstehung von Project References**
>
> Vor TypeScript 3.0 (2018) gab es Project References nicht. Grosse
> Monorepos wie das TypeScript-Projekt selbst hatten ein Problem:
> Ein einziger `tsc`-Aufruf musste ALLE Dateien kompilieren, auch wenn
> sich nur eine geaendert hatte. Das dauerte bei TypeScript selbst
> ueber 30 Sekunden. Project References reduzierten das auf unter
> 5 Sekunden fuer inkrementelle Builds. Das TypeScript-Team baute
> das Feature buchstaeblich fuer sich selbst — und es wurde zum
> Standard fuer Monorepos.

### `tsc --build` (oder `tsc -b`)

Mit Project References aendert sich der Build-Befehl:

```bash
# Ohne Project References:
tsc

# Mit Project References:
tsc --build        # oder tsc -b
tsc --build --watch  # Watch-Mode mit References
```

`tsc --build` versteht die Abhaengigkeiten zwischen Projekten und
kompiliert sie in der richtigen Reihenfolge. Wenn `api` von `core`
abhaengt, wird `core` zuerst gebaut.

> 🔬 **Experiment:** Erstelle in deinem Kopf (oder auf Papier) eine
> Monorepo-Struktur mit drei Paketen: `shared`, `frontend`, `backend`.
> `frontend` und `backend` haengen beide von `shared` ab. Skizziere
> die drei `tsconfig.json`-Dateien — welche Felder braucht jede?
>
> ```
> monorepo/
>   packages/
>     shared/tsconfig.json    → composite: true, declaration: true
>     frontend/tsconfig.json  → references: [{ path: "../shared" }]
>     backend/tsconfig.json   → references: [{ path: "../shared" }]
>   tsconfig.json             → references: alle drei Pakete
> ```

---

<!-- /depth -->
## Haeufige Fehler bei der tsconfig
<!-- section:summary -->
Ohne `include` kompiliert TypeScript **alle** `.ts`-Dateien im Verzeichnis

<!-- depth:standard -->
### 1. `include` vergessen

Ohne `include` kompiliert TypeScript **alle** `.ts`-Dateien im Verzeichnis
und allen Unterverzeichnissen — einschliesslich `node_modules`!

### 2. `extends` ueberschreibt `include`

```json
// base.json
{ "include": ["src"] }

// tsconfig.json
{ "extends": "./base.json", "compilerOptions": { "strict": true } }
// include aus base.json wird UEBERNOMMEN (weil nicht ueberschrieben)

// ABER:
{ "extends": "./base.json", "include": ["lib"] }
// include aus base.json wird KOMPLETT IGNORIERT — nur "lib" gilt
```

### 3. Relative Pfade in `extends`

Pfade in `extends` werden relativ zur Datei aufgeloest, die `extends`
enthaelt — nicht relativ zum Arbeitsverzeichnis. Das ist logisch,
aber bei tief verschachtelten Monorepos eine Fehlerquelle.

> ⚡ **Praxis-Tipp:** In React-Projekten mit Vite oder Next.js
> findest du oft eine `tsconfig.json` und eine `tsconfig.node.json`.
> Letztere ist fuer die Build-Konfiguration (vite.config.ts, next.config.ts).
> Die Trennung existiert, weil der Build-Prozess andere Compiler-Flags
> braucht als der Anwendungscode (z.B. `module: "CommonJS"` vs `"ESNext"`).

---

<!-- /depth -->
## Was du gelernt hast

- `tsconfig.json` hat fuenf Top-Level-Felder: `compilerOptions`, `include`, `exclude`, `files`, `extends` (plus `references`)
- `extends` merged `compilerOptions`, aber ueberschreibt `include`/`exclude`/`files`
- `references` mit `composite: true` ermoeglichen inkrementelle Monorepo-Builds
- `files` hat Prioritaet ueber `exclude`

> 🧠 **Erklaere dir selbst:** Warum braucht ein referenziertes Projekt
> sowohl `composite: true` als auch `declaration: true`? Was wuerde
> passieren, wenn eines fehlt?
> **Kernpunkte:** composite aktiviert inkrementelle Builds und .tsbuildinfo |
> declaration erzeugt .d.ts fuer Consumer | ohne composite kein tsc --build |
> ohne declaration keine Typ-Information fuer referenzierende Projekte

**Kernkonzept zum Merken:** Die tsconfig ist kein "set and forget" — sie ist
ein aktiv gepflegter Vertrag. `extends` fuer Konsistenz, `references`
fuer Skalierung, und `include` fuer Praezision.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt
> die Grundstruktur. Ab Sektion 2 tauchen wir in die einzelnen
> Compiler-Flags ein.
>
> Weiter geht es mit: [Sektion 02: Die Strict-Mode-Familie](./02-strict-mode-familie.md)
