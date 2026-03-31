# Cheatsheet: Type Aliases vs Interfaces

## Vergleichstabelle

| Feature | `type` | `interface` |
|---------|--------|-------------|
| Primitive Aliases | `type ID = string` | Nicht moeglich |
| Union Types | `type A = B \| C` | Nicht moeglich |
| Intersection | `type A = B & C` | Nicht moeglich (aber extends) |
| Mapped Types | `{ [K in keyof T]: ... }` | Nicht moeglich |
| Conditional Types | `T extends U ? A : B` | Nicht moeglich |
| Tuple Types | `type T = [string, number]` | Nicht moeglich |
| Declaration Merging | Nicht moeglich | Ja |
| extends | Nicht moeglich (aber &) | `interface B extends A` |
| implements | Ja | Ja |
| Compiler-Speed | Normal | extends wird gecached |

---

## Entscheidungsbaum

```
Brauchst du Union / Mapped / Conditional Type?
├── Ja → type
│
Brauchst du Declaration Merging?
├── Ja → interface
│
Beschreibst du eine Objekt-Form?
├── Ja → interface ODER type (Team-Konvention)
│
Sonst → type (flexibler)
```

---

## extends vs & bei Konflikten

```typescript
// extends: Fehler wird sofort gemeldet
interface A { x: string; }
interface B extends A { x: number; }  // FEHLER!

// &: Stilles never
type C = { x: string } & { x: number }; // x ist never — kein Fehler!
```

---

## Declaration Merging

```typescript
// Gleicher Name → Properties werden zusammengefuehrt
interface Config { host: string; }
interface Config { port: number; }
// Config = { host: string; port: number }

// Module Augmentation:
declare module "express" {
  export interface Request { userId?: string; }
}
```

---

## Drei Faustregeln

1. **Union/Mapped/Conditional** → `type` (Pflicht)
2. **Objekt-Formen** → `interface` oder `type` (Teamkonvention)
3. **Konsistenz** > perfekte Wahl (ESLint erzwingt es)

---

## Framework-Empfehlungen

| Framework | Empfehlung | Grund |
|-----------|------------|-------|
| Angular | interface | DI-Contracts, extends, Style Guide |
| React | type | Unions, funktionaler Stil |
| Beide | Konsistenz | ESLint: consistent-type-definitions |
