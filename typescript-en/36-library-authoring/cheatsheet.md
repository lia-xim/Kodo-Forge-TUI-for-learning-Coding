# Cheatsheet: Library Authoring

Quick reference for Lesson 36.

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

**Important:** `types` ALWAYS as the first condition in `exports`!

---

## tsconfig for Libraries

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

## Build with tsup

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

## File Extensions

| Extension | Format | Type Extension |
|-----------|--------|----------------|
| .js | ESM (with `"type": "module"`) | .d.ts |
| .cjs | CommonJS (always) | .d.cts |
| .mjs | ES Module (always) | .d.mts |

---

## SemVer for Types

| Change | Version |
|--------|:-------:|
| New optional property (output) | Minor |
| Remove property | **Major** |
| New optional parameter | Minor |
| Restrict parameter type | **Major** |
| New export | Minor |
| Remove export | **Major** |
| Raise minimum TS version | **Major** |

---

## Library Patterns

```typescript
// Overloads
function create(url: string): Client;
function create(config: Config): Client;
function create(input: string | Config): Client { /* ... */ }

// Conditional Return Type
type Result<T> = T extends string ? number : boolean;
function parse<T extends string | number>(v: T): Result<T>;

// Builder with Type Accumulation
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

# Test locally
npm pack
cd ../test-project && npm install ../my-lib/my-lib-1.0.0.tgz

# Publish
npm version minor
npm publish --access public
```