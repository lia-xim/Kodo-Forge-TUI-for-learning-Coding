# Cheatsheet: Performance & Compiler

Quick reference for lesson 34.

---

## Compiler Phases

```
Scanner → Parser → Binder → Checker (60-80%!) → Emitter
```

---

## Performance Diagnostics

```bash
# Overview: time per phase
npx tsc --extendedDiagnostics

# Detailed analysis: Chrome Trace
npx tsc --generateTrace ./trace
# Open trace/trace.json in chrome://tracing

# Type-checking only (no JS output)
npx tsc --noEmit
```

---

## Quick Wins (tsconfig.json)

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "isolatedModules": true,
    "incremental": true
  }
}
```

---

## Performant Types

```typescript
// SLOW: Intersection
type A = B & C & D;

// FAST: Interface extends
interface A extends B, C, D {}

// SLOW: Large union
type Icon = "home" | "user" | ... ; // 200 members

// FAST: Grouped sub-unions
type NavIcons = "home" | "menu";
type ActionIcons = "add" | "delete";
type Icon = NavIcons | ActionIcons;

// SLOW: Conditional type
type ExtractId<T> = T extends { id: infer Id } ? Id : never;

// FAST: Constraint + lookup
type ExtractId<T extends { id: unknown }> = T["id"];
```

---

## Limits

| Limit | Value | Error |
|-------|:-----:|-------|
| Recursion depth | 50 | TS2589 |
| Instantiations | ~5,000,000 | Extreme slowness |
| Union size | 100,000 | TS2590 |

---

## Incremental Build

```json
{
  "compilerOptions": {
    "incremental": true,
    "composite": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../shared" }
  ]
}
```

```bash
npx tsc --build          # Build incrementally
npx tsc --build --clean  # Delete artifacts
npx tsc --build --watch  # Watch mode
```

---

## Monorepo Layers

```
types/    → Shared interfaces (no logic)
utils/    → Shared utilities (references: [types])
web-app/  → App (references: [types, utils])
```