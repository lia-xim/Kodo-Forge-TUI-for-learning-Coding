# Cheatsheet: Migration Strategies

Quick reference for Lesson 35.

---

## Strategies

| Strategy | Fits for | Risk |
|----------|----------|------|
| Big Bang | < 50 files | High |
| Gradual | Large projects, teams | Low |
| Hybrid (Codemod) | Medium projects with time pressure | Medium |

---

## Gradual Migration

```
Phase 1: allowJs: true, strict: false
Phase 2: Write new files in .ts
Phase 3: Migrate leaves → middle → root
Phase 4: Enable strict mode incrementally
Phase 5: allowJs: false (done!)
```

---

## tsconfig for Migration

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

## JSDoc Types in JavaScript

```javascript
/** @param {string} name @returns {boolean} */
function isValid(name) { return name.length > 0; }

/** @type {import('./types').Config} */
const config = loadConfig();

/** @template T @param {T[]} items @returns {T | undefined} */
function first(items) { return items[0]; }
```

---

## Strict Flags Order

```
1. alwaysStrict           ← Almost no errors
2. strictBindCallApply    ← Few errors
3. noImplicitThis         ← Few errors
4. noImplicitAny          ← Moderate error count
5. strictFunctionTypes    ← Moderate error count
6. strictNullChecks       ← MANY errors (the big one)
7. strictPropertyInit     ← After strictNullChecks
8. useUnknownInCatch      ← Few errors
9. strict: true           ← Goal reached!
```

---

## Declaration Files

```typescript
// Untyped npm package (minimum):
declare module "legacy-lib";

// With types:
declare module "legacy-lib" {
  export function init(key: string): void;
}

// Global variable:
declare global {
  interface Window { APP_CONFIG: { apiUrl: string } }
}
export {};
```

---

## Common Errors and Fixes

| Problem | Fix |
|---------|-----|
| Dynamic properties | `Record<string, unknown>` |
| CommonJS imports | `esModuleInterop: true` |
| `this` binding | Arrow functions |
| `JSON.parse()` returns `any` | Type assertion or Zod |
| `Object.keys()` returns `string[]` | Cast to `keyof T` |
| `useState(null)` | `useState<T \| null>(null)` |

---

## Migration Metrics

```bash
# TS file share:
find src -name "*.ts" -o -name "*.tsx" | wc -l

# Any count:
grep -r ": any" src/ --include="*.ts" | wc -l

# Suppressed errors:
grep -r "@ts-ignore\|@ts-expect-error" src/ | wc -l

# Strict errors:
npx tsc --noEmit --strict 2>&1 | grep "error TS" | wc -l
```