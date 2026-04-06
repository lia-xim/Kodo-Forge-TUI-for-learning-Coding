# Cheatsheet: TypeScript 5.x Features

Kompakte Referenz — alle wichtigen Features strukturiert nach Version.

---

## TypeScript 5.0 (Maerz 2023)

### Decorators (ECMAScript-Standard)
```typescript
// Alt: experimentalDecorators (proprietaer)
// Neu: TC39 Stage 3 Decorators (Standard)
function log(target: any, context: ClassMethodDecoratorContext) {
  return function(this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return target.call(this, ...args);
  };
}

class Service {
  @log
  doWork() { return 42; }
}
```

### moduleResolution: "bundler"
```json
// tsconfig.json — fuer Vite, esbuild, webpack 5:
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext"
  }
}
// Erlaubt: import './utils'     (keine .js/.ts Endung noetig)
// Beachtet: package.json "exports" und "imports" Felder
```

### verbatimModuleSyntax
```typescript
// tsconfig.json: "verbatimModuleSyntax": true

// FEHLER — Component wird nur als Typ genutzt:
import { Component } from '@angular/core';
// ^ Fehler: "Component" is a type and must use "import type"

// KORREKT:
import type { Component } from '@angular/core';
// ^ Wird komplett aus dem Output entfernt — kein Laufzeit-Import

// KORREKT (gemischt):
import { Injectable, type Component } from '@angular/core';
// ^ Injectable bleibt, Component wird nur als Typ behandelt
```

### const Type Parameters
```typescript
// Vor TS 5.0:
function first<T>(arr: T[]): T { return arr[0]; }
first(['a', 'b']); // T = string, nicht 'a' | 'b'

// Mit const:
function first<const T extends readonly unknown[]>(arr: T): T[0] {
  return arr[0];
}
first(['a', 'b'] as const); // T = readonly ['a', 'b'], result: 'a'
```

---

## TypeScript 5.1 (Juni 2023)

### Entkoppelte Return-Typen bei Getter/Setter
```typescript
// Vor TS 5.1: Getter und Setter mussten denselben Typ haben
// Ab TS 5.1: Setter-Typ kann Obertyp des Getter-Typs sein

class Input {
  private _value = "";

  get value(): string { return this._value; }    // gibt string zurueck
  set value(v: string | number) {                // akzeptiert string | number
    this._value = String(v);
  }
}

const i = new Input();
i.value = 42;    // OK! Setter akzeptiert number
i.value;         // string — Getter gibt string zurueck
```

### undefined als gueltiger Return-Typ fuer void-Funktionen
```typescript
// Jetzt sind Funktionen mit undefined-Rueckgabe assignierbar zu void-Rueckgabe:
type VoidFn = () => void;
const fn: VoidFn = (): undefined => undefined; // war vorher Fehler
```

---

## TypeScript 5.2 (August 2023)

### using — Explicit Resource Management
```typescript
// Symbol.dispose implementieren:
class DatabaseConnection implements Disposable {
  [Symbol.dispose]() {
    console.log("Verbindung getrennt");
  }
  query(sql: string) { /* ... */ }
}

function getResults() {
  using conn = new DatabaseConnection();
  // ^ Symbol.dispose() wird am Block-Ende IMMER aufgerufen
  return conn.query("SELECT * FROM users");
} // <-- hier: conn[Symbol.dispose]() automatisch

// Fuer async:
class AsyncConn implements AsyncDisposable {
  async [Symbol.asyncDispose]() {
    await this.close();
  }
}
async function run() {
  await using conn = new AsyncConn();
  // ^ wartet auf Symbol.asyncDispose()
}
```

### using mit Tuple-Return fuer mehrere Ressourcen
```typescript
// Vorher: try/finally fuer jede Ressource
// Nachher:
function useResources() {
  using db = openDB();
  using cache = openCache();
  // beide werden automatisch am Block-Ende geschlossen
}
```

---

## TypeScript 5.3 (November 2023)

### Import Attributes
```typescript
// Typsichere JSON-Imports:
import data from "./config.json" with { type: "json" };
//                                ^^^^^^^^^^^^^^^^^^^^
//                                Attribut verhindert falsche Interpretation

// CSS-Modules (mit entsprechendem Tool):
import styles from "./Button.module.css" with { type: "css" };
```

### `resolution-mode` in type Imports
```typescript
// Explizit steuern ob require() oder import() fuer Aufloesung genutzt wird:
import type { SomeType } from "some-module" with { "resolution-mode": "require" };
```

---

## TypeScript 5.4 (Maerz 2024)

### NoInfer<T> Utility Type
```typescript
// Problem: T wird aus allen Parametern inferiert — manchmal unerwuenscht:
function setDefault<T>(values: T[], defaultValue: T): T[] {
  return values.length ? values : [defaultValue];
}
setDefault(['a', 'b'], 42); // Kein Fehler! T = string | number

// Loesung mit NoInfer:
function setDefault<T>(values: T[], defaultValue: NoInfer<T>): T[] {
  return values.length ? values : [defaultValue];
}
setDefault(['a', 'b'], 42); // FEHLER! T = string, 42 ist kein string
```

### Preserved Narrowing in Closures
```typescript
// TS 5.4 verbessert Narrowing-Persistenz in Closures:
function process(value: string | null) {
  if (!value) return;

  // Jetzt korrekt erkannt dass value nicht null ist:
  const handler = () => {
    console.log(value.toUpperCase()); // OK in TS 5.4+
  };
  handler();
}
```

---

## TypeScript 5.5 (Juni 2024)

### Inferred Type Predicates
```typescript
// Vor TS 5.5 — manuelles Type Predicate:
const result = arr.filter((x): x is string => x !== null);

// Ab TS 5.5 — automatisch inferiert:
const result = arr.filter(x => x !== null);
// result: string[] statt (string | null)[]

// Funktioniert auch mit benutzerdefinierten Guards:
function isActive(user: User | null): boolean {
  return user !== null && user.active;
}
// TypeScript inferiert: (user: User | null) => user is User (wenn moglich)
```

### isolatedDeclarations
```json
// tsconfig.json fuer Libraries:
{
  "compilerOptions": {
    "isolatedDeclarations": true,
    "declaration": true
  }
}
```
```typescript
// Fehler mit isolatedDeclarations:
export const config = { timeout: 5000 }; // Fehler! Typ nicht explizit

// Korrekt:
export const config: { timeout: number } = { timeout: 5000 };

// Vorteil: esbuild/swc koennen .d.ts ohne tsc erzeugen — parallel und schnell
```

### Regular Expression Syntax Checking
```typescript
// TS 5.5 prueft RegExp-Syntax:
const valid = /^[a-z]+$/i;      // OK
const broken = /[invalid/;      // Fehler: Unterminated character class
```

---

## TypeScript 5.6 (September 2024)

### Disjunctive Well-Formedness Checks
```typescript
// TS 5.6 warnt bei immer-true/immer-false Conditions:
const str = "hello";
if (str !== "hello" || str !== "world") {
  // ^ Warnung: Diese Bedingung ist immer true
}
```

### Iterator Helper Methods
```typescript
// Typen fuer die neue JavaScript Iterator Helper API:
function* range(start: number, end: number) {
  for (let i = start; i < end; i++) yield i;
}
// .map(), .filter(), .take() etc. werden korrekt getypt
const doubled = range(1, 10).map(x => x * 2).take(5);
```

---

## TypeScript 5.7 (November 2024)

### Checks for Never-Initialized Variables
```typescript
// TS 5.7 erkennt Variablen die nie gesetzt werden:
function process(condition: boolean) {
  let result: string;

  if (condition) {
    result = "yes";
  }
  // Kein else! result koennte uninitialisiert sein
  return result; // Fehler in TS 5.7
}
```

### Path Rewriting for Relative Imports
```typescript
// tsconfig.json:
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
    // ^ Schreibt .ts-Endungen in Imports zu .js um
    // Wichtig fuer native ESM ohne Bundler
  }
}
// import { foo } from './utils.ts'  wird zu  import { foo } from './utils.js'
```

---

## Schnellreferenz: tsconfig fuer moderne Projekte

### Angular-Projekt (2025)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "incremental": true,
    "experimentalDecorators": false,
    "useDefineForClassFields": true
  }
}
```

### React/Vite-Projekt (2025)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

### npm-Library (2025)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "declaration": true,
    "isolatedDeclarations": true,
    "noEmit": false
  }
}
```

---

## Version-Management Kurzreferenz

| Range | Bedeutung | Empfehlung |
|-------|-----------|------------|
| `"5.7.0"` | Exakt diese Version | Maximale Sicherheit |
| `"~5.7.0"` | 5.7.x (nur Patches) | **Empfohlen fuer Projekte** |
| `"^5.0.0"` | 5.x.x (alle Minor) | Riskant — Behavioral Changes |
| `"latest"` | Immer neueste | Niemals in Produktion |
| `"next"` | Nightly-Build | Nur zum Testen/Melden |
