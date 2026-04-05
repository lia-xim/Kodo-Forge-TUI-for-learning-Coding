# Cheatsheet: Performance & Compiler

Schnellreferenz fuer Lektion 34.

---

## Compiler-Phasen

```
Scanner → Parser → Binder → Checker (60-80%!) → Emitter
```

---

## Performance-Diagnose

```bash
# Ueberblick: Zeit pro Phase
npx tsc --extendedDiagnostics

# Detail-Analyse: Chrome Trace
npx tsc --generateTrace ./trace
# Oeffne trace/trace.json in chrome://tracing

# Nur Type-Checking (kein JS erzeugen)
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

## Performante Typen

```typescript
// LANGSAM: Intersection
type A = B & C & D;

// SCHNELL: Interface extends
interface A extends B, C, D {}

// LANGSAM: Grosse Union
type Icon = "home" | "user" | ... ; // 200 Members

// SCHNELL: Gruppierte Sub-Unions
type NavIcons = "home" | "menu";
type ActionIcons = "add" | "delete";
type Icon = NavIcons | ActionIcons;

// LANGSAM: Conditional Type
type ExtractId<T> = T extends { id: infer Id } ? Id : never;

// SCHNELL: Constraint + Lookup
type ExtractId<T extends { id: unknown }> = T["id"];
```

---

## Limits

| Limit | Wert | Fehler |
|-------|:----:|--------|
| Rekursionstiefe | 50 | TS2589 |
| Instantiierungen | ~5.000.000 | Extreme Langsamkeit |
| Union-Groesse | 100.000 | TS2590 |

---

## Inkrementelles Build

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
npx tsc --build          # Inkrementell bauen
npx tsc --build --clean  # Artefakte loeschen
npx tsc --build --watch  # Watch-Mode
```

---

## Monorepo-Schichten

```
types/    → Shared Interfaces (keine Logik)
utils/    → Shared Utilities (references: [types])
web-app/  → App (references: [types, utils])
```
