# L24 — Branded/Nominal Types

> TypeScript Phase 3 | Lesson 24 of 40

## Overview

This lesson solves a fundamental problem with TypeScript's type system: `type UserId = string` offers no real type safety. You'll learn the **brand technique** — the standard workaround for nominal typing in TypeScript.

## Learning Objectives

After this lesson you will be able to:
- Explain why structural typing allows type mix-ups
- Define brand types with `T & { readonly __brand: B }`
- Write smart constructors with validation + type assignment
- Build brand hierarchies for subtype relationships
- Use brands effectively in Angular services and React projects

## Sections

| # | Topic | File Path |
|---|-------|-----------|
| 1 | The Nominal Typing Problem | `sections/01-the-nominal-typing-problem.md` |
| 2 | The Brand Technique | `sections/02-the-brand-technique.md` |
| 3 | Smart Constructors & Opaque Types | `sections/03-smart-constructors-opaque-types.md` |
| 4 | Multiple Brands & Hierarchies | `sections/04-multiple-brands-hierarchies.md` |
| 5 | Practical Patterns | `sections/05-practical-patterns.md` |
| 6 | Branded Types in Angular & React | `sections/06-branded-types-in-practice.md` |

## Files

| Type | File |
|------|------|
| Overview | README.md |
| Examples | `examples/01-05-*.ts` |
| Exercises | `exercises/01-05-*.ts` |
| Solutions | `solutions/01-05-*.ts` |
| Quiz | `quiz-data.ts` (15 questions) |
| Pre-Test | `pretest-data.ts` (18 questions) |
| Misconceptions | `misconceptions.ts` (8 misconceptions) |
| Completion Problems | `completion-problems.ts` (6 fill-in-the-blank) |
| Debugging | `debugging-data.ts` (5 challenges) |
| Parson's Problems | `parsons-data.ts` (3 tasks) |
| Code Tracing | `tracing-data.ts` (4 exercises) |
| Transfer Tasks | `transfer-data.ts` (3 tasks) |
| Hints | `hints.json` |
| Cheatsheet | `cheatsheet.md` |

## Prerequisites

- L13 (Generics Basics) — Brand<T, B> uses generics
- L15 (Utility Types) — context for structural type differences
- L16 (Mapped Types) — optional, for deeper understanding

## Core Concept

```typescript
// Problem:
type UserId = string;   // No protection — identical to string!

// Solution: Brand type
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

// Smart Constructor:
function createUserId(raw: string): UserId {
  if (!raw || raw.length < 5) throw new Error('Invalid');
  return raw as UserId;  // The only permitted as-cast!
}

// Type safety:
function getUser(id: UserId): void {}
const userId  = createUserId('user-123');
const orderId = 'order-456' as OrderId;
getUser(userId);  // ✅
// getUser(orderId); // ❌ COMPILE-ERROR!
```