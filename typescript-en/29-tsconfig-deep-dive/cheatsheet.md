# Cheatsheet: tsconfig Deep Dive (L29)

## Basic Structure
```json
{
  "compilerOptions": { /* 100+ flags */ },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"],
  "extends": "./tsconfig.base.json",
  "references": [{ "path": "./packages/core" }],
  "files": ["src/index.ts"]
}
```
- `compilerOptions` are **merged** when using extends
- `include/exclude/files` are **completely replaced** when using extends
- `files` takes priority over `exclude`

## Strict Mode (11 Flags)
```json
{ "strict": true }
```
| Flag | Effect |
|------|--------|
| `strictNullChecks` | null/undefined are their own types |
| `strictFunctionTypes` | Contravariant parameters |
| `noImplicitAny` | No hidden any |
| `strictPropertyInitialization` | Class properties must be initialized |
| `useUnknownInCatchVariables` | catch(e) → e is unknown instead of any |
| `strictBindCallApply` | Type checking for bind/call/apply |
| `noImplicitThis` | No implicit any for this |
| `alwaysStrict` | "use strict" in every file |
| `exactOptionalPropertyTypes` | age?: number ≠ age: undefined |
| `noImplicitOverride` | override keyword required |
| `strictBuiltinIteratorReturn` | Iterator return types (TS 5.6+) |

## Module Resolution
```json
{ "moduleResolution": "bundler" }
```
| Strategy | Extension | exports | Recommended for |
|----------|-----------|---------|-----------------|
| `node` | optional | No | Legacy |
| `node16`/`nodenext` | .js required | Yes | Node.js ESM |
| `bundler` | optional | Yes | Webpack/Vite/esbuild |

## Path Aliases
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"],
    "@shared/*": ["src/shared/*"]
  }
}
```
Note: Bundlers need their own alias config (exception: Next.js)!

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
- `target` = syntax level (class → function at ES5)
- `lib` = available APIs (overrides the default!)
- `module` = import/export format (ESM, CJS, NodeNext)
- `noEmit` = type-check only, no output

## Advanced Flags
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

## Framework Quick Reference
| | Angular | React/Vite | Next.js | Node.js |
|--|---------|------------|---------|---------|
| module | ES2022 | ESNext | ESNext | NodeNext |
| moduleResolution | bundler | bundler | bundler | nodenext |
| noEmit | no | yes | yes | no |
| jsx | - | react-jsx | preserve | - |
| experimentalDecorators | yes | no | no | no |

## Golden Rule
TypeScript as **type-checker** (noEmit) + esbuild/swc as **transpiler** = fast builds + full type safety.