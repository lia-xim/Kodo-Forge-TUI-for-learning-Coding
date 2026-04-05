# Cheatsheet: Library Authoring

Schnellreferenz fuer Lektion 36.

---

## Package.json Setup

```json
{
  "name": "@scope/my-lib",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"]
}
```

**Wichtig:** `types` IMMER als erste Condition in `exports`!

---

## tsconfig fuer Libraries

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## Build mit tsup

```typescript
// tsup.config.ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false
});
```

---

## Dateiendungen

| Endung | Format | Typ-Endung |
|--------|--------|------------|
| .js | ESM (mit `"type": "module"`) | .d.ts |
| .cjs | CommonJS (immer) | .d.cts |
| .mjs | ES Module (immer) | .d.mts |

---

## SemVer fuer Typen

| Aenderung | Version |
|-----------|:-------:|
| Neue optionale Property (Output) | Minor |
| Property entfernen | **Major** |
| Neuer optionaler Parameter | Minor |
| Parameter-Typ einschraenken | **Major** |
| Neuer Export | Minor |
| Export entfernen | **Major** |
| TS-Mindestversion erhoehen | **Major** |

---

## Library-Patterns

```typescript
// Overloads
function create(url: string): Client;
function create(config: Config): Client;
function create(input: string | Config): Client { /* ... */ }

// Conditional Return Type
type Result<T> = T extends string ? number : boolean;
function parse<T extends string | number>(v: T): Result<T>;

// Builder mit Typ-Akkumulation
class Builder<Set extends string = never> {
  field(name: string): Builder<Set | typeof name>;
  build(this: Builder<"required1" | "required2">): Output;
}
```

---

## Workflow

```bash
# Build
npx tsup

# Lokal testen
npm pack
cd ../test-project && npm install ../my-lib/my-lib-1.0.0.tgz

# Veroeffentlichen
npm version minor
npm publish --access public
```
