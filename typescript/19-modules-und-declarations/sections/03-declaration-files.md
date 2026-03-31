# Sektion 3: Declaration Files

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - CommonJS Interop](./02-commonjs-interop.md)
> Naechste Sektion: [04 - Module Augmentation](./04-module-augmentation.md)

---

## Was du hier lernst

- Was .d.ts Dateien sind und warum sie existieren
- @types Pakete und DefinitelyTyped
- Eigene Declaration Files schreiben
- declare keyword und ambient Declarations

---

## Was sind .d.ts Dateien?

Declaration Files beschreiben die **Form** eines Moduls ohne Implementierung:

```typescript
// math.d.ts — beschreibt math.js
export declare function add(a: number, b: number): number;
export declare function multiply(a: number, b: number): number;
export declare const PI: number;
export interface MathResult { value: number; operation: string; }
```

> **Wie ein Header-File in C:** Nur Typen, keine Implementierung.
> TypeScript nutzt die .d.ts fuer Type-Checking, JavaScript liefert den Code.

---

## @types und DefinitelyTyped

Viele JavaScript-Libraries haben keine eingebauten Typen.
Die Community pflegt Typen unter `@types/`:

```bash
# Library ohne Typen
npm install lodash

# Typen separat installieren
npm install @types/lodash
```

> **DefinitelyTyped** (github.com/DefinitelyTyped) ist das groesste
> Repository fuer Community-gepflegte Type Definitions.
> Ueber 10.000 Libraries haben @types-Pakete.

---

## Eigene Declaration Files schreiben

Wenn eine Library keine Typen hat und kein @types-Paket existiert:

```typescript
// types/my-library.d.ts
declare module 'my-library' {
  export function doSomething(input: string): Promise<Result>;
  export interface Result {
    success: boolean;
    data: unknown;
  }
}
```

---

## Das declare Keyword

`declare` sagt TypeScript: "Dieser Wert existiert, aber nicht in TypeScript-Code."

```typescript
// Globale Variable (z.B. von einem Script-Tag)
declare const API_URL: string;
declare const __DEV__: boolean;

// Globale Funktion
declare function gtag(...args: unknown[]): void;

// Globale Klasse
declare class MyGlobalLib {
  static init(config: Config): void;
}
```

---

## tsconfig: typeRoots und types

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"],
    "types": ["node", "jest"]  // Nur diese @types laden
  }
}
```

---

## Pausenpunkt

**Kernerkenntnisse:**
- .d.ts = Typ-Beschreibung ohne Implementierung
- @types/lib fuer Community-Typen (DefinitelyTyped)
- `declare module` fuer eigene Typen fuer untypisierte Libraries
- `declare` fuer globale Werte die ausserhalb von TypeScript existieren

> **Weiter:** [Sektion 04 - Module Augmentation](./04-module-augmentation.md)
