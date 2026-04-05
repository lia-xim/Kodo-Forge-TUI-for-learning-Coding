# Sektion 3: Global Augmentation

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Module Augmentation](./02-module-augmentation.md)
> Naechste Sektion: [04 - Declaration Files (.d.ts)](./04-declaration-files.md)

---

## Was du hier lernst

- Wie man mit `declare global` den **globalen Scope** erweitert
- Den Unterschied zwischen **Module Augmentation** und **Global Augmentation**
- Wann man `globalThis`, `Window`, `NodeJS.ProcessEnv` erweitert
- Die Gefahren und **Best Practices** bei globalen Erweiterungen

---

## Hintergrund: Der globale Scope in TypeScript

> **Feature Origin Story: Globale Typen**
>
> In JavaScript gibt es den globalen Scope — `window` im Browser,
> `globalThis` ueberall. Historisch war der globale Scope der
> Hauptkommunikationsweg zwischen Skripten (vor ES Modules).
>
> TypeScript bildet das in seinen "lib"-Dateien ab: `lib.dom.d.ts`
> definiert `Window`, `Document`, `HTMLElement` etc. `lib.es2023.d.ts`
> definiert `Array.prototype.findLast` etc.
>
> Aber was wenn du eigene globale Variablen brauchst? Was wenn eine
> Bibliothek globale Typen hinzufuegt? In Legacy-Code sind globale
> Variablen allgegenwaertig. Module Augmentation hilft hier nicht —
> denn `window` ist kein Modul. Die Loesung: `declare global`.

---

## Die Syntax: `declare global`

```typescript annotated
// WICHTIG: declare global funktioniert NUR in Modul-Dateien!
// (Dateien mit mindestens einem import oder export)

export {}; // Macht diese Datei zum Modul

declare global {
  // Alles hier wird dem globalen Scope hinzugefuegt:

  interface Window {
    __INITIAL_STATE__: Record<string, unknown>;
    dataLayer: Array<Record<string, unknown>>;
    // ^ Google Tag Manager's dataLayer — jetzt typsicher!
  }

  // Globale Variable (ohne Window):
  var DEBUG_MODE: boolean;
  // ^ 'var' (nicht let/const!) fuer globale Variablen
  //   'var' ist hier die korrekte Syntax fuer globale Deklarationen

  // Globale Funktion:
  function __DEV_LOG__(msg: string): void;
}

// Jetzt ueberall verfuegbar:
// window.__INITIAL_STATE__  → typsicher
// DEBUG_MODE                → typsicher
// __DEV_LOG__("test")       → typsicher
```

> 🧠 **Erklaere dir selbst:** Warum muss man `var` statt `let` oder `const`
> verwenden fuer globale Variablen in `declare global`?
>
> **Kernpunkte:** `var` in globalem Scope → wird zu `window.varName` |
> `let` und `const` sind block-scoped — sie werden NICHT global |
> In `declare global` deklariert man was auf dem globalen Objekt existiert |
> `var` ist die einzig korrekte Syntax dafuer

---

## Module Augmentation vs. Global Augmentation

```typescript annotated
// MODULE AUGMENTATION — erweitert ein spezifisches npm-Paket:
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
    // ^ Nur im Kontext von Express-Requests verfuegbar
  }
}

// GLOBAL AUGMENTATION — erweitert den globalen Scope:
declare global {
  interface Window {
    analytics: AnalyticsAPI;
    // ^ Ueberall im Browser-Code verfuegbar
  }
}

// Wann was?
// Module Augmentation: Typ gehoert zu einem PAKET (express, react, vue)
// Global Augmentation: Typ gehoert zum GLOBALEN Scope (window, process, globalThis)
```

> 💭 **Denkfrage:** Warum sollte man globale Augmentations sparsam einsetzen?
> Was ist das Risiko?
>
> **Antwort:** Globale Typen "verschmutzen" den gesamten Namespace.
> Jede Datei im Projekt sieht sie. Wenn zwei Bibliotheken die gleiche
> globale Variable deklarieren, gibt es Konflikte. Module Augmentation
> ist immer vorzuziehen — Global Augmentation nur wenn es wirklich
> um globale Werte geht (window, process.env, etc.).

---

## Praxis: NodeJS.ProcessEnv typsicher machen

Ein sehr haeufiger Use Case in Node.js/Angular/Next.js-Projekten:

```typescript annotated
// types/env.d.ts
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Pflichtfelder:
      NODE_ENV: "development" | "staging" | "production";
      DATABASE_URL: string;
      JWT_SECRET: string;

      // Optionale Felder:
      PORT?: string;
      LOG_LEVEL?: "debug" | "info" | "warn" | "error";
      REDIS_URL?: string;
    }
  }
}

// Jetzt im Code:
const dbUrl = process.env.DATABASE_URL;
// ^ Typ: string (nicht string | undefined!)
// TypeScript weiss: DATABASE_URL ist als Pflichtfeld deklariert.

const port = process.env.PORT ?? "3000";
// ^ Typ: string — optional, aber mit Fallback

// process.env.TYPO_VAR
// ^ Compile-Error! TYPO_VAR existiert nicht in ProcessEnv.
// Das verhindert Tippfehler in Environment-Variablen-Namen!
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Schritt 1: Ohne Augmentation — process.env ist weitgehend unbekannt
> const dbUrl1 = process.env.DATABASE_URL;
> // Typ: string | undefined — kein Unterschied zu irgendeiner anderen Variable
>
> // Schritt 2: Global Augmentation hinzufuegen
> export {}; // Macht diese Datei zum Modul
>
> declare global {
>   namespace NodeJS {
>     interface ProcessEnv {
>       NODE_ENV: "development" | "production";
>       DATABASE_URL: string;    // Pflichtfeld — kein undefined!
>       API_KEY?: string;        // Optional
>     }
>   }
> }
>
> // Schritt 3: Jetzt ist process.env typsicher
> const dbUrl2 = process.env.DATABASE_URL;
> // Typ: string (nicht string | undefined — Pflichtfeld!)
>
> const apiKey = process.env.API_KEY ?? "default";
> // Typ: string — optional, aber mit Fallback abgesichert
>
> // Compile-Error:
> // const typo = process.env.DATBASE_URL; // ← Tippfehler → sofort erkannt!
> ```
>
> Beachte: In einem echten Projekt wuerde dieser Block in einer eigenen Datei
> (z.B. `types/env.d.ts`) leben — die Augmentation wirkt dann projektWeit.
> Im Playground kannst du alles in eine Datei schreiben, weil `export {}`
> die Datei zum Modul macht und `declare global` dann greift.

---

## Array.prototype erweitern

Ein weiterer haeufiger Use Case: Built-in-Typen um Methoden erweitern:

```typescript annotated
// Vorsicht: Prototype-Erweiterung ist kontrovers!
// Hier nur zur Demonstration von Global Augmentation.

export {};

declare global {
  interface Array<T> {
    // Neue Methode auf allen Arrays:
    unique(): T[];
    // ^ Entfernt Duplikate (wie [...new Set(arr)])
  }
}

// Implementierung (muss TATSAECHLICH existieren!):
Array.prototype.unique = function <T>(this: T[]): T[] {
  return [...new Set(this)];
};

// Verwendung:
const numbers = [1, 2, 2, 3, 3, 3];
const uniqueNumbers = numbers.unique(); // [1, 2, 3]
// ^ TypeScript kennt unique() und gibt T[] zurueck
```

> ⚡ **In deinem Angular-Projekt** ist Global Augmentation nuetzlich fuer:
>
> ```typescript
> // 1. Environment-Variablen typsicher machen:
> declare global {
>   namespace NodeJS {
>     interface ProcessEnv {
>       NG_APP_API_URL: string;
>       NG_APP_ANALYTICS_KEY?: string;
>     }
>   }
> }
>
> // 2. Window-Properties fuer SSR-Hydration:
> declare global {
>   interface Window {
>     __SERVER_STATE__: AppState;
>     // ^ Angular Universal / SSR uebergibt State ueber window
>   }
> }
> ```
>
> In React/Next.js:
>
> ```typescript
> // next-env.d.ts — Next.js Environment:
> declare global {
>   namespace NodeJS {
>     interface ProcessEnv {
>       NEXT_PUBLIC_API_URL: string;
>       NEXT_PUBLIC_GA_ID?: string;
>     }
>   }
> }
> ```

---

## Best Practices fuer globale Augmentations

| Regel | Grund |
|---|---|
| In eigener `.d.ts`-Datei | Trennung von Code und Typ-Erweiterung |
| `export {}` nicht vergessen | Macht die Datei zum Modul |
| Minimale Properties | Weniger globale Verschmutzung |
| Dokumentieren WARUM | Nicht offensichtlich woher der Typ kommt |
| In `tsconfig.json` einbinden | `include: ["types/**/*.d.ts"]` |
| Keine Prototype-Erweiterung | Fragil, kann mit Libraries kollidieren |

---

## Was du gelernt hast

- `declare global { }` erweitert den globalen Scope (window, globalThis, process)
- Nur in **Modul-Dateien** verfuegbar (mindestens ein import/export)
- Globale Variablen muessen mit `var` deklariert werden (nicht let/const)
- **ProcessEnv typsicher machen** ist einer der nuetzlichsten Anwendungsfaelle
- Globale Augmentations sparsam einsetzen — Module Augmentation ist immer vorzuziehen

> 🧠 **Erklaere dir selbst:** Warum muss eine Datei mit `declare global`
> ein Modul sein? Was wuerde passieren wenn sie ein Script waere?
>
> **Kernpunkte:** In einem Script sind Deklarationen bereits global |
> `declare global` in einem Script waere redundant |
> TypeScript unterscheidet Scripts (alles global) und Module (isoliert) |
> `declare global` = "Aus meinem isolierten Modul in den globalen Scope brechen"

**Kernkonzept zum Merken:** `declare global` ist ein "Escape Hatch" aus
dem Modul-System in den globalen Scope. Nutze es sparsam und gezielt —
bevorzuge Module Augmentation wo immer moeglich.

---

> **Pausenpunkt** -- Du kannst jetzt den globalen Scope erweitern.
> Naechstes Thema: Declaration Files (.d.ts) — eigene Typ-Dateien schreiben.
>
> Weiter geht es mit: [Sektion 04: Declaration Files (.d.ts)](./04-declaration-files.md)
