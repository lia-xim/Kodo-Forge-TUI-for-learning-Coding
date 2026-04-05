# Cheatsheet: tsconfig Deep Dive (L29)

## Grundstruktur
```json
{
  "compilerOptions": { /* 100+ Flags */ },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"],
  "extends": "./tsconfig.base.json",
  "references": [{ "path": "./packages/core" }],
  "files": ["src/index.ts"]
}
```
- `compilerOptions` werden bei extends **gemerged**
- `include/exclude/files` werden bei extends **komplett ueberschrieben**
- `files` hat Prioritaet ueber `exclude`

## Strict-Mode (11 Flags)
```json
{ "strict": true }
```
| Flag | Bewirkt |
|------|---------|
| `strictNullChecks` | null/undefined sind eigene Typen |
| `strictFunctionTypes` | Kontravariante Parameter |
| `noImplicitAny` | Kein verstecktes any |
| `strictPropertyInitialization` | Klassen-Properties muessen initialisiert werden |
| `useUnknownInCatchVariables` | catch(e) → e ist unknown statt any |
| `strictBindCallApply` | bind/call/apply Typpruefung |
| `noImplicitThis` | Kein implizites any fuer this |
| `alwaysStrict` | "use strict" in jeder Datei |
| `exactOptionalPropertyTypes` | age?: number ≠ age: undefined |
| `noImplicitOverride` | override-Keyword Pflicht |
| `strictBuiltinIteratorReturn` | Iterator-Return-Typen (TS 5.6+) |

## Module Resolution
```json
{ "moduleResolution": "bundler" }
```
| Strategie | Endung | exports | Empfohlen fuer |
|-----------|--------|---------|---------------|
| `node` | optional | Nein | Legacy |
| `node16`/`nodenext` | .js Pflicht | Ja | Node.js ESM |
| `bundler` | optional | Ja | Webpack/Vite/esbuild |

## Pfad-Aliase
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"],
    "@shared/*": ["src/shared/*"]
  }
}
```
Achtung: Bundler braucht eigene Alias-Config (Ausnahme: Next.js)!

## Output
```json
{
  "target": "ES2022",
  "lib": ["ES2023", "DOM"],
  "module": "ESNext",
  "outDir": "./dist",
  "declaration": true,
  "declarationMap": true,
  "sourceMap": true
}
```
- `target` = Syntax-Level (class → function bei ES5)
- `lib` = Verfuegbare APIs (ueberschreibt Default!)
- `module` = Import/Export-Format (ESM, CJS, NodeNext)
- `noEmit` = Nur Type-Check, kein Output

## Fortgeschrittene Flags
```json
{
  "skipLibCheck": true,
  "isolatedModules": true,
  "verbatimModuleSyntax": true,
  "esModuleInterop": true,
  "resolveJsonModule": true,
  "incremental": true,
  "noUncheckedIndexedAccess": true
}
```

## Framework-Kurzreferenz
| | Angular | React/Vite | Next.js | Node.js |
|--|---------|------------|---------|---------|
| module | ES2022 | ESNext | ESNext | NodeNext |
| moduleResolution | bundler | bundler | bundler | nodenext |
| noEmit | nein | ja | ja | nein |
| jsx | - | react-jsx | preserve | - |
| experimentalDecorators | ja | nein | nein | nein |

## Goldene Regel
TypeScript als **Type-Checker** (noEmit) + esbuild/swc als **Transpiler** = schnelle Builds + volle Typsicherheit.
