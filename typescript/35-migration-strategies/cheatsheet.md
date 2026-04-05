# Cheatsheet: Migration Strategies

Schnellreferenz fuer Lektion 35.

---

## Strategien

| Strategie | Passt fuer | Risiko |
|-----------|-----------|--------|
| Big Bang | < 50 Dateien | Hoch |
| Graduell | Grosse Projekte, Teams | Niedrig |
| Hybrid (Codemod) | Mittlere Projekte mit Zeitdruck | Mittel |

---

## Graduelle Migration

```
Phase 1: allowJs: true, strict: false
Phase 2: Neue Dateien in .ts schreiben
Phase 3: Blaetter → Mitte → Wurzel migrieren
Phase 4: Strict Mode stufenweise aktivieren
Phase 5: allowJs: false (fertig!)
```

---

## tsconfig fuer Migration

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}
```

---

## JSDoc-Typen in JavaScript

```javascript
/** @param {string} name @returns {boolean} */
function isValid(name) { return name.length > 0; }

/** @type {import('./types').Config} */
const config = loadConfig();

/** @template T @param {T[]} items @returns {T | undefined} */
function first(items) { return items[0]; }
```

---

## Strict-Flags Reihenfolge

```
1. alwaysStrict           ← Fast keine Fehler
2. strictBindCallApply    ← Wenige Fehler
3. noImplicitThis         ← Wenige Fehler
4. noImplicitAny          ← Mittlere Fehlerzahl
5. strictFunctionTypes    ← Mittlere Fehlerzahl
6. strictNullChecks       ← VIELE Fehler (der grosse Brocken)
7. strictPropertyInit     ← Nach strictNullChecks
8. useUnknownInCatch      ← Wenige Fehler
9. strict: true           ← Ziel erreicht!
```

---

## Declaration Files

```typescript
// Untypisiertes npm-Paket (Minimum):
declare module "legacy-lib";

// Mit Typen:
declare module "legacy-lib" {
  export function init(key: string): void;
}

// Globale Variable:
declare global {
  interface Window { APP_CONFIG: { apiUrl: string } }
}
export {};
```

---

## Haeufige Fehler und Fixes

| Problem | Fix |
|---------|-----|
| Dynamische Properties | `Record<string, unknown>` |
| CommonJS-Imports | `esModuleInterop: true` |
| `this`-Binding | Arrow Functions |
| `JSON.parse()` gibt `any` | Type Assertion oder Zod |
| `Object.keys()` gibt `string[]` | Cast zu `keyof T` |
| `useState(null)` | `useState<T \| null>(null)` |

---

## Migrations-Metriken

```bash
# TS-Dateien Anteil:
find src -name "*.ts" -o -name "*.tsx" | wc -l

# Any-Count:
grep -r ": any" src/ --include="*.ts" | wc -l

# Unterdrueckte Fehler:
grep -r "@ts-ignore\|@ts-expect-error" src/ | wc -l

# Strict-Fehler:
npx tsc --noEmit --strict 2>&1 | grep "error TS" | wc -l
```
