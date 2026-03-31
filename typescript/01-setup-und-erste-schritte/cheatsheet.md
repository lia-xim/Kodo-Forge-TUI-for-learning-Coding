# Cheatsheet: Lektion 01 -- Setup & Erste Schritte

## Wichtige Befehle

```bash
# TypeScript installieren
npm install -g typescript       # tsc global installieren
npm install -g tsx              # tsx global installieren

# Kompilieren
tsc datei.ts                    # Erzeugt datei.js
tsc                             # Kompiliert laut tsconfig.json
tsc --watch                     # Automatisch bei Aenderungen kompilieren
tsc --noEmit                    # Nur Type Checking, keine Ausgabe
tsc --init                      # Erzeugt tsconfig.json mit Standardwerten

# Direkt ausfuehren
tsx datei.ts                    # Schnell ausfuehren (kein Type Checking!)
tsx watch datei.ts              # Ausfuehren + Watch-Modus

# Projekt initialisieren
npm init -y                     # package.json erstellen
npm install typescript --save-dev  # TypeScript als Dev-Dependency

# Debugging mit Source Maps
node --enable-source-maps dist/main.js   # Stack Traces zeigen auf .ts
```

---

## Compilation Pipeline

```
  .ts-Datei
      |
      v
  +------------------+
  |   1. Parsing      |     Quellcode --> Abstract Syntax Tree (AST)
  +------------------+     "Stammbaum" des Codes
      |
      v
  +------------------+
  |   2. Type Check   |     Typen pruefen, Fehler melden
  +------------------+     (rechenintensivster Schritt!)
      |
      v
  +------------------+
  |   3. Emit         |     Typen entfernen, JS erzeugen
  +------------------+     Optional: Source Maps + .d.ts
      |
      +---> .js-Datei           JavaScript-Code (Typen entfernt)
      +---> .js.map             Source Map (Zeilen-Zuordnung TS <-> JS)
      +---> .d.ts               Declaration File (nur Typ-Informationen)
```

**Wichtig:** Type Checking und Emit sind unabhaengig! JavaScript wird auch bei
Fehlern erzeugt (ausser `noEmitOnError: true`).

**Warum ist das wichtig?** Tools wie `tsx`, `esbuild` und `SWC` ueberspringen
Phase 2 komplett -- sie machen nur Parsing + Emit. Deshalb sind sie so schnell,
pruefen aber keine Typen.

---

## Essentielle tsconfig.json-Optionen

| Option | Werte | Empfehlung | Beschreibung |
|--------|-------|------------|--------------|
| `target` | ES5, ES2015, ES2022, ESNext | `ES2022` | Ziel-JavaScript-Version |
| `module` | CommonJS, ESNext, NodeNext | `NodeNext` | Modul-System |
| `moduleResolution` | node, NodeNext, bundler | `NodeNext` / `bundler` | Wie Module aufgeloest werden |
| `strict` | true/false | **`true`** | Alle strengen Pruefungen an |
| `outDir` | Pfad | `./dist` | Ausgabe-Verzeichnis fuer .js |
| `rootDir` | Pfad | `./src` | Quellcode-Wurzelverzeichnis |
| `declaration` | true/false | `true` | .d.ts-Dateien erzeugen |
| `sourceMap` | true/false | `true` | .map-Dateien fuer Debugging |
| `noEmit` | true/false | Situationsabhaengig | Keine .js-Dateien erzeugen |
| `noEmitOnError` | true/false | `true` (CI/Build) | Kein Output bei Typ-Fehlern |
| `esModuleInterop` | true/false | `true` | Bessere CJS/ESM-Kompatibilitaet |
| `skipLibCheck` | true/false | `true` | Typ-Pruefung von .d.ts ueberspringen |
| `forceConsistentCasingInFileNames` | true/false | `true` | Gross/Kleinschreibung in Imports |
| `allowJs` | true/false | Bei Migration | .js-Dateien im Projekt erlauben |
| `checkJs` | true/false | Bei Migration | .js-Dateien mit pruefen |

### Minimal-tsconfig.json fuer Node.js

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "declaration": true,
    "noEmitOnError": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Next.js / Vite-Projekt (Bundler uebernimmt Kompilierung)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Angular-Projekt (Angular CLI konfiguriert automatisch)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "strict": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "useDefineForClassFields": false
  }
}
```

---

## Was `strict: true` aktiviert

| Unter-Option | Beschreibung | Warum wichtig? |
|-------------|--------------|----------------|
| `strictNullChecks` | null/undefined sind eigene Typen | Verhindert "Cannot read property of undefined" |
| `noImplicitAny` | Kein implizites `any` erlaubt | Zwingt dich, Typen anzugeben |
| `strictFunctionTypes` | Strengere Funktionstyp-Pruefung | Verhindert unsichere Callback-Typen |
| `strictBindCallApply` | bind/call/apply korrekt geprueft | Findet Fehler bei dynamischen Aufrufen |
| `strictPropertyInitialization` | Klassen-Properties muessen initialisiert sein | Verhindert undefined in Klassen |
| `noImplicitThis` | `this` muss typisiert sein | Findet Fehler bei this-Kontext |
| `alwaysStrict` | "use strict" in jeder Datei | JavaScript Strict Mode |
| `useUnknownInCatchVariables` | catch(e) ist `unknown`, nicht `any` | Sicherer Error-Handling |

---

## Type Erasure: Was verschwindet, was bleibt

| Verschwindet (nur Compile-Zeit) | Bleibt (auch Laufzeit) |
|--------------------------------|----------------------|
| `: string`, `: number`, etc. | Aller JavaScript-Code |
| `interface` | `class` |
| `type` Aliase | `enum` (erzeugt JS-Objekt) |
| Generics `<T>` | `import` / `export` |
| `as` Typ-Assertions | Decorators (bei Angular!) |
| `!` Non-null Assertion | Werte und Ausdruecke |
| `readonly` | `const` (JS-Feature) |

### Konsequenzen fuer die Praxis

```typescript
// DAS GEHT (JavaScript-Operationen):
typeof x === "string"       // JS typeof-Operator
obj instanceof MyClass      // Klassen existieren zur Laufzeit
"name" in obj               // Property-Check
Array.isArray(arr)           // JS-Methode

// DAS GEHT NICHT (TypeScript existiert nicht zur Laufzeit):
obj instanceof MyInterface  // Interfaces existieren nicht!
typeof x === "MyType"       // Nur JS-Typen moeglich
```

---

## Haeufige Compiler-Fehler

| Code | Meldung | Bedeutung | Loesung |
|------|---------|-----------|---------|
| TS2322 | Type 'X' is not assignable to type 'Y' | Falscher Typ zugewiesen | Richtigen Typ verwenden |
| TS2339 | Property 'X' does not exist on type 'Y' | Property nicht vorhanden | Tippfehler pruefen oder Interface erweitern |
| TS2345 | Argument of type 'X' is not assignable to parameter of type 'Y' | Falscher Argument-Typ | Argument-Typ korrigieren |
| TS2554 | Expected X arguments, but got Y | Falsche Argument-Anzahl | Richtige Anzahl uebergeben |
| TS2532 | Object is possibly 'undefined' | Moeglicherweise undefined | Optional Chaining (`?.`) oder if-Pruefung |
| TS2741 | Property 'X' is missing in type 'Y' | Pflicht-Property fehlt | Property hinzufuegen oder optional machen (`?`) |
| TS7006 | Parameter 'X' implicitly has an 'any' type | Kein Typ angegeben (strict) | Typ-Annotation hinzufuegen |
| TS7030 | Not all code paths return a value | Fehlender Return | Alle Pfade muessen Wert zurueckgeben |
| TS2352 | Conversion of type 'X' to type 'Y' may be a mistake | Ungueltige Type Assertion | Richtigen Typ verwenden statt casten |

---

## Werkzeug-Vergleich

| | tsc | tsx | ts-node | esbuild | SWC |
|---|-----|-----|---------|---------|-----|
| **Type Checking** | Ja | Nein | Optional | Nein | Nein |
| **Erzeugt .js** | Ja (Datei) | Nein (Speicher) | Nein (Speicher) | Ja (Bundle) | Ja |
| **Geschwindigkeit** | Mittel | Sehr schnell | Langsam | Extrem schnell | Extrem schnell |
| **Sprache** | TypeScript | TypeScript (via esbuild) | TypeScript | Go | Rust |
| **Bester Einsatz** | Build/CI | Entwicklung | Legacy | Bundling | Next.js |

### Wer nutzt was?

| Framework | Kompilierung | Type Checking |
|-----------|-------------|---------------|
| **Angular** | ngc (basiert auf tsc) | Integriert |
| **Next.js** | SWC | tsc --noEmit (separat) |
| **Vite** | esbuild | tsc --noEmit (separat) |
| **Reines Node.js** | tsc | tsc (integriert) |

### Empfohlener Workflow

```bash
# Entwicklung: tsx fuer schnelles Feedback
tsx src/main.ts

# Type Checking separat (parallel in zweitem Terminal)
tsc --watch --noEmit

# Produktion: Kompilieren mit tsc
tsc

# In package.json:
# "scripts": {
#   "dev": "tsx watch src/main.ts",
#   "build": "tsc",
#   "typecheck": "tsc --noEmit",
#   "start": "node --enable-source-maps dist/main.js"
# }
```

---

## Source Maps: Schnellreferenz

```
.ts-Datei  ------>  .js-Datei + .js.map-Datei
(was du              (was laeuft)  (Zuordnung)
 schreibst)
```

| Umgebung | Wie aktivieren? |
|----------|----------------|
| **Browser** | Automatisch (DevTools erkennen Source Maps) |
| **Node.js** | `node --enable-source-maps dist/main.js` |
| **VS Code** | `"sourceMap": true` in launch.json |
| **tsconfig** | `"sourceMap": true` |

---

## Schnellreferenz: Typ-Annotationen

```typescript
// Variablen
let name: string = "Anna";
let alter: number = 30;
let aktiv: boolean = true;
let liste: number[] = [1, 2, 3];

// Funktionen (Parameter UND Rueckgabewert annotieren!)
function greet(name: string): string {
  return `Hallo ${name}`;
}

// Interfaces (existieren NUR zur Compile-Zeit!)
interface User {
  name: string;
  email: string;
  alter?: number;   // optional (kann undefined sein)
}

// Objekte
const user: User = {
  name: "Anna",
  email: "anna@example.com",
};

// Type Assertions (KEINE Konvertierung! Nur Compiler-Hinweis!)
const input: unknown = "hello";
const len = (input as string).length;  // "as string" ist zur Laufzeit WEG!

// Type Guards (Laufzeit-Pruefung die TypeScript versteht)
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "name" in obj;
}
```

---

## Merkregeln

1. **TypeScript = JavaScript + Typen.** Alles was JS kann, kann TS auch.
2. **Typen existieren NUR zur Compile-Zeit.** Type Erasure entfernt alles.
3. **`strict: true` ist Pflicht.** Immer. Ohne Ausnahme. Punkt.
4. **`as` ist KEINE Konvertierung.** Es ist ein Versprechen an den Compiler.
5. **tsc prueft, tsx fuehrt aus.** Nutze beides zusammen.
6. **Source Maps verbinden .js mit .ts.** Fuer Debugging unentbehrlich.
7. **Interfaces: Compile-Zeit. Klassen: Laufzeit.** Das bestimmt instanceof.
