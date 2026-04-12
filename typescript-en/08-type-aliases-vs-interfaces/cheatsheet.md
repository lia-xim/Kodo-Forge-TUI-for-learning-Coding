# Cheatsheet: Type Aliases vs Interfaces

## Comparison Table

| Feature | `type` | `interface` |
|---------|--------|-------------|
| Primitive Aliases | `type ID = string` | Not possible |
| Union Types | `type A = B \| C` | Not possible |
| Intersection | `type A = B & C` | Not possible (but extends) |
| Mapped Types | `{ [K in keyof T]: ... }` | Not possible |
| Conditional Types | `T extends U ? A : B` | Not possible |
| Tuple Types | `type T = [string, number]` | Not possible |
| Declaration Merging | Not possible | Yes |
| extends | Not possible (but &) | `interface B extends A` |
| implements | Yes | Yes |
| Compiler Speed | Normal | extends is cached |

---

## Decision Tree

```
Do you need a Union / Mapped / Conditional Type?
├── Yes → type
│
Do you need Declaration Merging?
├── Yes → interface
│
Are you describing an object shape?
├── Yes → interface OR type (team convention)
│
Otherwise → type (more flexible)
```

---

## extends vs & with Conflicts

```typescript
// extends: Error is immediately reported
interface A { x: string; }
interface B extends A { x: number; }  // ERROR!

// &: Silent never
type C = { x: string } & { x: number }; // x is never — no error!
```

---

## Declaration Merging

```typescript
// Same name → Properties are merged
interface Config { host: string; }
interface Config { port: number; }
// Config = { host: string; port: number }

// Module Augmentation:
declare module "express" {
  export interface Request { userId?: string; }
}
```

---

## Three Rules of Thumb

1. **Union/Mapped/Conditional** → `type` (required)
2. **Object shapes** → `interface` or `type` (team convention)
3. **Consistency** > perfect choice (ESLint enforces it)

---

## Framework Recommendations

| Framework | Recommendation | Reason |
|-----------|----------------|--------|
| Angular | interface | DI contracts, extends, Style Guide |
| React | type | Unions, functional style |
| Both | Consistency | ESLint: consistent-type-definitions |