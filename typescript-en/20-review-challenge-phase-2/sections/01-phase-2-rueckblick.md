# Phase 2 Review: Concept Map

> Estimated reading time: **10 minutes**

---

## The Journey Through Phase 2

Phase 2 took your TypeScript knowledge from the fundamentals to advanced
type system concepts. Here is the map:

```
Phase 2: Type System Core (L11-L19)
========================================

L11: Type Narrowing
  |  typeof, instanceof, in, Discriminated Unions
  v
L12: Discriminated Unions
  |  Tag-based Unions, exhaustive Checks
  v
L13: Generics Basics
  |  <T>, Constraints, Default Types
  v
L14: Generic Patterns
  |  Factories, Collections, HOFs, Builder
  v
L15: Utility Types
  |  Partial, Pick, Omit, Record, custom Utilities
  v
L16: Mapped Types ←────────────────────┐
  |  { [K in keyof T]: ... }, Modifier  |  These three
  v                                      |  form the
L17: Conditional Types ←────────────────┤  "Triumvirate"
  |  T extends U ? X : Y, infer         |  of the Type
  v                                      |  System
L18: Template Literal Types ←───────────┘
  |  String Manipulation at the Type Level
  v
L19: Modules & Declarations
     import/export, .d.ts, Augmentation
```

---

## The Three Pillars of the Type System

### 1. Type Narrowing (L11-L12)
**Problem:** TypeScript doesn't know the exact type.
**Solution:** Control flow analysis narrows the type step by step.

### 2. Generics (L13-L15)
**Problem:** Code duplication for different types.
**Solution:** Type parameters make code generic and reusable.

### 3. Type-Level Programming (L16-L18)
**Problem:** Manually duplicating and keeping types in sync.
**Solution:** Mapped Types, Conditional Types, and Template Literals
transform types automatically.

---

## Recognizing Connections

| Concept A | + Concept B | = Result |
|-----------|-------------|---------|
| Mapped Types | + Conditional Types | Selective Property Transformation |
| Conditional Types | + infer | Type Extraction (ReturnType, etc.) |
| Template Literals | + Mapped Types | Getter/Setter/Event Generation |
| Generics | + Utility Types | Type-safe Collections and APIs |
| Discriminated Unions | + exhaustive Check | Exhaustive Case Handling |

---

## What You Can Do Now

- Transform types at compile time instead of duplicating them manually
- Build generic, reusable abstractions
- Leverage the type system for maximum safety
- Type and extend external libraries