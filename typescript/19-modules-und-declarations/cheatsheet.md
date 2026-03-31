# Cheatsheet: Modules & Declarations

## ES Modules
```typescript
// Named Export/Import
export function add(a: number, b: number): number { ... }
import { add } from './math';

// Default Export/Import
export default class Logger { ... }
import Logger from './logger';

// Type-Only Import
import type { User } from './types';

// Re-Export (Barrel)
export { add } from './math';
export type { User } from './types';
```

## Declaration Files (.d.ts)
```typescript
// Externe Library typisieren
declare module 'my-lib' {
  export function doSomething(input: string): Promise<Result>;
  export interface Result { success: boolean; }
}

// Globale Variablen
declare const API_URL: string;
declare const __DEV__: boolean;

// Wildcard (CSS, SVG, etc.)
declare module '*.css' { const styles: Record<string, string>; export default styles; }
```

## Module Augmentation
```typescript
// Express erweitern
declare module 'express' {
  interface Request { user?: { id: string }; }
}

// Globale Typen erweitern
declare global {
  namespace NodeJS {
    interface ProcessEnv { DATABASE_URL: string; }
  }
}
export {}; // WICHTIG!
```

## tsconfig.json Essentials
```json
{
  "module": "ESNext",
  "moduleResolution": "bundler",
  "esModuleInterop": true,
  "isolatedModules": true,
  "resolveJsonModule": true
}
```

## Eselsbruecken
| Konzept | Merksatz |
|---------|---------|
| Named Export | "Fester Name = konsistenter Code." |
| import type | "Nur Typ = wird beim Build geloescht." |
| declare | "Existiert woanders — ich beschreibe nur die Form." |
| export {} | "Macht jede Datei zum Modul — noetig fuer Augmentation." |
| @types | "Community-Typen fuer untypisierte Libraries." |
