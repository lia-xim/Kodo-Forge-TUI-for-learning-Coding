# Sektion 1: ES Modules

> Geschaetzte Lesezeit: **10 Minuten**
>
> Naechste Sektion: [02 - CommonJS Interop](./02-commonjs-interop.md)

---

## Was du hier lernst

- Named Exports vs Default Exports
- Import-Varianten: Named, Default, Namespace, Side-Effect
- Re-Exports und Barrel Files
- Type-Only Imports (import type)

---

## Named Exports

```typescript
// math.ts
export function add(a: number, b: number): number { return a + b; }
export function multiply(a: number, b: number): number { return a * b; }
export const PI = 3.14159;
export interface MathResult { value: number; operation: string; }
```

```typescript
// app.ts
import { add, multiply, PI, type MathResult } from './math.ts';
```

---

## Default Exports

```typescript
// logger.ts
export default class Logger {
  log(msg: string) { console.log(`[LOG] ${msg}`); }
}
```

```typescript
// app.ts
import Logger from './logger.ts'; // Name frei waehlbar!
import MyLogger from './logger.ts'; // Auch moeglich
```

> **Best Practice:** Named Exports bevorzugen. Default Exports erschweren
> Refactoring (Name ist beim Import frei waehlbar = inkonsistent).

---

## Import-Varianten

```typescript
// Named Import
import { add, multiply } from './math.ts';

// Named Import mit Alias
import { add as addition } from './math.ts';

// Namespace Import
import * as math from './math.ts';
math.add(1, 2);

// Default Import
import Logger from './logger.ts';

// Side-Effect Import (fuer Module die globale Dinge aendern)
import './polyfills.ts';

// Type-Only Import (wird beim Compilieren entfernt)
import type { MathResult } from './math.ts';
```

---

## Type-Only Imports (TS 3.8)

```typescript
// Normaler Import: bleibt im JavaScript
import { UserService } from './services.ts';

// Type-Only Import: wird komplett entfernt
import type { User, UserConfig } from './types.ts';

// Inline Type Import (TS 4.5)
import { UserService, type User } from './services.ts';
```

> **Wann type-only?** Wenn du den Import nur fuer Typen brauchst,
> nicht fuer Werte. Verhindert ungewollte Side-Effects beim Import.

---

## Re-Exports und Barrel Files

```typescript
// index.ts (Barrel File)
export { add, multiply } from './math.ts';
export { default as Logger } from './logger.ts';
export type { MathResult } from './math.ts';

// Alles re-exportieren:
export * from './math.ts';
export * from './logger.ts';
```

> **Barrel Files** (index.ts) buendeln Exports eines Verzeichnisses.
> Vorteil: `import { add, Logger } from './lib';` statt einzelner Importe.

---

## Pausenpunkt

**Kernerkenntnisse:**
- Named Exports bevorzugen (konsistenter, refactoring-sicher)
- `import type` fuer reine Typ-Imports
- Barrel Files buendeln Exports eines Verzeichnisses
- Side-Effect Imports fuer Polyfills und Initialisierung

> **Weiter:** [Sektion 02 - CommonJS Interop](./02-commonjs-interop.md)
