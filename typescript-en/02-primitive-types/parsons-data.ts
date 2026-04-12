Since I can't write to that path, here is the fully translated file:

```typescript
/**
 * Lektion 02 — Parson's Problems: Primitive Types
 *
 * 3 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Exhaustive Switch, Type Narrowing, null-sichere Funktion
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Exhaustive Switch mit never ──────────────────────────────
  {
    id: "L02-P1",
    title: "Exhaustive Switch with never",
    description:
      "Arrange the lines to create an exhaustive switch that covers " +
      "all cases of a union type and generates a compile error " +
      "when new cases are added.",
    correctOrder: [
      "type Color = 'red' | 'green' | 'blue';",
      "function getHex(color: Color): string {",
      "  switch (color) {",
      "    case 'red': return '#ff0000';",
      "    case 'green': return '#00ff00';",
      "    case 'blue': return '#0000ff';",
      "    default: const _exhaustive: never = color; return _exhaustive;",
      "  }",
      "}",
    ],
    distractors: [
      "    default: return 'unknown';",
      "    default: throw new Error(color);",
    ],
    hint:
      "The never type ensures the switch covers all cases — " +
      "a simple default with a string or error does not.",
    concept: "exhaustive-switch",
    difficulty: 2,
  },

  // ─── Problem 2: Type Narrowing Kette ─────────────────────────────────────
  {
    id: "L02-P2",
    title: "Type Narrowing Chain",
    description:
      "Arrange the lines so that the type is narrowed step by step: " +
      "from unknown through typeof checks to the concrete type.",
    correctOrder: [
      "function describe(value: unknown): string {",
      "  if (typeof value === 'string') {",
      "    return `String: ${value.toUpperCase()}`;",
      "  }",
      "  if (typeof value === 'number') {",
      "    return `Number: ${value.toFixed(2)}`;",
      "  }",
      "  return 'Unbekannter Typ';",
      "}",
    ],
    distractors: [
      "  if (value instanceof string) {",
    ],
    hint:
      "typeof checks primitive types (string, number). " +
      "instanceof only works with classes, not with primitive types.",
    concept: "type-narrowing",
    difficulty: 2,
  },

  // ─── Problem 3: null-sichere Funktion ────────────────────────────────────
  {
    id: "L02-P3",
    title: "null-safe Function",
    description:
      "Arrange the lines to create a function that null-safely " +
      "returns the length of a string — using the Nullish Coalescing operator.",
    correctOrder: [
      "function safeLength(text: string | null): number {",
      "  return text?.length ?? 0;",
      "}",
    ],
    distractors: [
      "  return text.length || 0;",
      "  return text?.length ? text.length : 0;",
    ],
    hint:
      "The || operator treats 0 as falsy — for an empty string, " +
      "text.length === 0, and || would still return 0. " +
      "The ?? operator only checks for null/undefined.",
    concept: "nullish-coalescing",
    difficulty: 2,
  },
];
```

**Translation notes:**

- `'Unbekannter Typ'` (inside a code string in `correctOrder`) was left as-is — it's source code, not UI text.
- Code comments (`// ─── Problem 1: ...`) left unchanged — they're comments, not string values.
- All `concept`, `id`, `difficulty` values left unchanged — not user-facing text.