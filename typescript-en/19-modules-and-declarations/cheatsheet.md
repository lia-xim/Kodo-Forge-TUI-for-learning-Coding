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
// Type an external library
declare module 'my-lib' {
  export function doSomething(input: string): Promise<Result>;
  export interface Result { success: boolean; }
}

// Global variables
declare const API_URL: string;
declare const __DEV__: boolean;

// Wildcard (CSS, SVG, etc.)
declare module '*.css' { const styles: Record<string, string>; export default styles; }
```

## Module Augmentation
```typescript
// Extend Express
declare module 'express' {
  interface Request { user?: { id: string }; }
}

// Extend global types
declare global {
  namespace NodeJS {
    interface ProcessEnv { DATABASE_URL: string; }
  }
}
export {}; // IMPORTANT!
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

## Memory Aids
| Concept | Mnemonic |
|---------|---------|
| Named Export | "Fixed name = consistent code." |
| import type | "Type only = deleted at build time." |
| declare | "Exists elsewhere — I only describe the shape." |
| export {} | "Makes every file a module — required for augmentation." |
| @types | "Community types for untyped libraries." |