# Cheatsheet: Lesson 01 -- Setup & First Steps

## Essential Commands

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

**Important:** Type checking and emit are independent! JavaScript is generated even when there are errors (unless `noEmitOnError: true`).

**Why does this matter?** Tools like `tsx`, `esbuild`, and `SWC` skip phase 2 entirely — they only do parsing + emit. That's why they're so fast, but they don't check types.

---

## Essential tsconfig.json Options

| Option | Values | Recommendation | Description |
|--------|--------|----------------|-------------|
| `target` | ES5, ES2015, ES2022, ESNext | `ES2022` | Target JavaScript version |
| `module` | CommonJS, ESNext, NodeNext | `NodeNext` | Module system |
| `moduleResolution` | node, NodeNext, bundler | `NodeNext` / `bundler` | How modules are resolved |
| `strict` | true/false | **`true`** | Enables all strict checks |
| `outDir` | path | `./dist` | Output directory for .js files |
| `rootDir` | path | `./src` | Source code root directory |
| `declaration` | true/false | `true` | Generate .d.ts files |
| `sourceMap` | true/false | `true` | .map files for debugging |
| `noEmit` | true/false | Situational | Don't generate .js files |
| `noEmitOnError` | true/false | `true` (CI/Build) | No output on type errors |
| `esModuleInterop` | true/false | `true` | Better CJS/ESM compatibility |
| `skipLibCheck` | true/false | `true` | Skip type checking of .d.ts files |
| `forceConsistentCasingInFileNames` | true/false | `true` | Case sensitivity in imports |
| `allowJs` | true/false | For migration | Allow .js files in the project |
| `checkJs` | true/false | For migration | Also type-check .js files |

### Minimal tsconfig.json for Node.js

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

### Next.js / Vite Project (Bundler handles compilation)

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

### Angular Project (Angular CLI configures automatically)

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

## What `strict: true` Enables

| Sub-option | Description | Why it matters |
|------------|-------------|----------------|
| `strictNullChecks` | `null`/`undefined` are their own types | Prevents "Cannot read property of undefined" |
| `noImplicitAny` | No implicit `any` allowed | Forces you to specify types |
| `strictFunctionTypes` | Stricter function type checking | Prevents unsafe callback types |
| `strictBindCallApply` | `bind`/`call`/`apply` correctly checked | Catches errors in dynamic calls |
| `strictPropertyInitialization` | Class properties must be initialized | Prevents `undefined` in classes |
| `noImplicitThis` | `this` must be typed | Catches errors with `this` context |
| `alwaysStrict` | `"use strict"` in every file | JavaScript Strict Mode |
| `useUnknownInCatchVariables` | `catch(e)` is `unknown`, not `any` | Safer error handling |

---

## Type Erasure: What Disappears, What Remains

| Disappears (compile-time only) | Remains (also at runtime) |
|-------------------------------|--------------------------|
| `: string`, `: number`, etc. | All JavaScript code |
| `interface` | `class` |
| `type` aliases | `enum` (generates a JS object) |
| Generics `<T>` | `import` / `export` |
| `as` type assertions | Decorators (in Angular!) |
| `!` non-null assertion | Values and expressions |
| `readonly` | `const` (JS feature) |

### Practical Implications

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

## Common Compiler Errors

| Code | Message | Meaning | Fix |
|------|---------|---------|-----|
| TS2322 | Type 'X' is not assignable to type 'Y' | Wrong type assigned | Use the correct type |
| TS2339 | Property 'X' does not exist on type 'Y' | Property doesn't exist | Check for typos or extend the interface |
| TS2345 | Argument of type 'X' is not assignable to parameter of type 'Y' | Wrong argument type | Fix the argument type |
| TS2554 | Expected X arguments, but got Y | Wrong number of arguments | Pass the correct number |
| TS2532 | Object is possibly 'undefined' | Possibly undefined | Use optional chaining (`?.`) or an `if` check |
| TS2741 | Property 'X' is missing in type 'Y' | Required property missing | Add the property or make it optional (`?`) |
| TS7006 | Parameter 'X' implicitly has an 'any' type | No type specified (strict mode) | Add a type annotation |
| TS7030 | Not all code paths return a value | Missing return | All code paths must return a value |
| TS2352 | Conversion of type 'X' to type 'Y' may be a mistake | Invalid type assertion | Use the correct type instead of casting |

---

## Tool Comparison

| | tsc | tsx | ts-node | esbuild | SWC |
|---|-----|-----|---------|---------|-----|
| **Type Checking** | Yes | No | Optional | No | No |
| **Generates .js** | Yes (file) | No (memory) | No (memory) | Yes (bundle) | Yes |
| **Speed** | Medium | Very fast | Slow | Extremely fast | Extremely fast |
| **Language** | TypeScript | TypeScript (via esbuild) | TypeScript | Go | Rust |
| **Best use case** | Build/CI | Development | Legacy | Bundling | Next.js |

### Who Uses What?

| Framework | Compilation | Type Checking |
|-----------|------------|---------------|
| **Angular** | ngc (based on tsc) | Integrated |
| **Next.js** | SWC | tsc --noEmit (separately) |
| **Vite** | esbuild | tsc --noEmit (separately) |
| **Pure Node.js** | tsc | tsc (integrated) |

### Recommended Workflow

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

## Source Maps: Quick Reference

```
.ts-Datei  ------>  .js-Datei + .js.map-Datei
(was du              (was laeuft)  (Zuordnung)
 schreibst)
```

| Environment | How to enable |
|-------------|--------------|
| **Browser** | Automatic (DevTools detect source maps) |
| **Node.js** | `node --enable-source-maps dist/main.js` |
| **VS Code** | `"sourceMap": true` in launch.json |
| **tsconfig** | `"sourceMap": true` |

---

## Quick Reference: Type Annotations

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

## Rules to Remember

1. **TypeScript = JavaScript + Types.** Everything JS can do, TS can do too.
2. **Types exist ONLY at compile-time.** Type erasure removes everything.
3. **`strict: true` is mandatory.** Always. No exceptions. Period.
4. **`as` is NOT a conversion.** It's a promise to the compiler.
5. **`tsc` checks, `tsx` runs.** Use both together.
6. **Source maps connect .js to .ts.** Indispensable for debugging.
7. **Interfaces: compile-time. Classes: runtime.** That determines `instanceof`.