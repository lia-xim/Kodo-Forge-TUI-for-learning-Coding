# Cheatsheet: Declaration Merging

Schnellreferenz fuer Lektion 27.

---

## Interface Merging

```typescript
// Gleichnamige Interfaces werden automatisch vereint:
interface User { id: string; name: string; }
interface User { email: string; }
// Ergebnis: User hat id, name, email

// REGELN:
// ✅ Neue Properties hinzufuegen → OK
// ❌ Gleiche Properties mit verschiedenen Typen → Compile-Error
// ⚠️ Methoden-Overloads: Spaetere Deklaration hat Vorrang
```

---

## Module Augmentation

```typescript
// Fremdes npm-Paket erweitern:
import type { Request } from "express";  // Macht Datei zum Modul

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; name: string };
    requestId: string;
  }
}

// WICHTIG:
// 1. Exakter Modulname (nicht "express" sondern "express-serve-static-core"!)
// 2. Datei muss Modul sein (import/export vorhanden)
// 3. Nur ERWEITERN, nicht ueberschreiben
```

---

## Global Augmentation

```typescript
export {};  // Macht Datei zum Modul!

declare global {
  interface Window {
    analytics: AnalyticsAPI;
    __APP_CONFIG__: AppConfig;
  }

  var DEBUG_MODE: boolean;  // var, nicht let/const!

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      PORT?: string;
    }
  }
}
```

---

## Declaration Files (.d.ts)

```typescript
// Nur Typ-Deklarationen, kein Code:
declare function add(a: number, b: number): number;
declare const PI: number;
declare class Calculator {
  constructor(precision: number);
  calculate(expr: string): number;
}

// Interface und type brauchen kein 'declare':
interface MathResult { value: number; formatted: string; }
```

---

## Wildcard Module Declarations

```typescript
// Assets typisieren:
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
```

---

## Namespace Merging (Funktion + Properties)

```typescript
function jQuery(selector: string): HTMLElement[] { /* ... */ }
namespace jQuery {
  export function ajax(url: string): Promise<unknown> { /* ... */ }
  export const version = "3.7.1";
}
// jQuery("div") + jQuery.ajax("/api") + jQuery.version
```

---

## tsconfig.json Einstellungen

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist/types",
    "typeRoots": ["./types", "./node_modules/@types"]
  },
  "include": ["src/**/*.ts", "types/**/*.d.ts"]
}
```

---

## Haeufige Fehler und Loesungen

| Fehler | Ursache | Loesung |
|---|---|---|
| Augmentation wirkt nicht | .d.ts nicht in tsconfig include | `"include": ["types/**/*.d.ts"]` |
| Falscher Modulname | z.B. "express" statt "express-serve-static-core" | In node_modules/@types nachschauen |
| declare global ignoriert | Datei ist kein Modul | `export {}` hinzufuegen |
| let/const in declare global | block-scoped, nicht global | `var` verwenden |
| Property-Typ-Konflikt | Gleiche Property, verschiedene Typen | Gleicher Typ oder Workaround |

---

## Wann welchen Ansatz?

| Situation | Ansatz |
|---|---|
| Express req.user erweitern | Module Augmentation |
| React Theme typisieren | Module Augmentation |
| window.analytics hinzufuegen | Global Augmentation |
| process.env typsicher machen | Global Augmentation |
| Alte JS-Library typisieren | Eigene .d.ts Datei |
| PNG/CSS Imports typisieren | Wildcard Module Declaration |
| Eigene Library publizieren | `declaration: true` in tsconfig |

---

## Debugging-Checkliste

1. ☐ Ist die .d.ts in `tsconfig.json` `include` enthalten?
2. ☐ Hat die Datei ein `import` oder `export` (ist sie ein Modul)?
3. ☐ Stimmt der Modulname EXAKT (in node_modules nachschauen)?
4. ☐ IDE/TypeScript-Server neu gestartet?
5. ☐ Wird die richtige tsconfig verwendet (app vs. spec vs. root)?
