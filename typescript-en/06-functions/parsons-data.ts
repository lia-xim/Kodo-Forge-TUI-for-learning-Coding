/**
 * Lesson 06 — Parson's Problems: Functions
 *
 * 4 problems for ordering lines of code.
 * Concepts: Type Guard, Overload, Currying, Assertion Function
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Type Guard ────────────────────────────────────────────
  {
    id: "L06-P1",
    title: "Implement a custom Type Guard",
    description:
      "Order the lines so that a Type Guard is created that checks " +
      "whether a value is a User with name and email.",
    correctOrder: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "function isUser(value: unknown): value is User {",
      "  return (",
      "    typeof value === 'object' &&",
      "    value !== null &&",
      "    'name' in value &&",
      "    'email' in value",
      "  );",
      "}",
    ],
    distractors: [
      "function isUser(value: unknown): boolean {",
      "function isUser(value: User): value is User {",
    ],
    hint:
      "A Type Guard has the return type 'value is Type' — not just boolean. " +
      "The parameter must be 'unknown', not already the target type.",
    concept: "type-guard",
    difficulty: 2,
  },

  // ─── Problem 2: Function Overload ─────────────────────────────────────
  {
    id: "L06-P2",
    title: "Function Overload for createElement",
    description:
      "Order the lines so that createElement returns the correct " +
      "element type via overload.",
    correctOrder: [
      "function createElement(tag: 'img'): HTMLImageElement;",
      "function createElement(tag: 'input'): HTMLInputElement;",
      "function createElement(tag: string): HTMLElement {",
      "  return document.createElement(tag);",
      "}",
      "",
      "const img = createElement('img');",
      "// img has type: HTMLImageElement",
    ],
    distractors: [
      "function createElement(tag: string): HTMLImageElement | HTMLInputElement {",
      "function createElement(tag: 'img' | 'input'): HTMLElement;",
    ],
    hint:
      "Specific overloads come FIRST, the implementation signature last. " +
      "The implementation has the broadest type (string -> HTMLElement).",
    concept: "function-overloads",
    difficulty: 3,
  },

  // ─── Problem 3: Currying Pattern ──────────────────────────────────────
  {
    id: "L06-P3",
    title: "Currying Function for Configuration",
    description:
      "Order the lines so that a currying function is created that " +
      "configures a formatter and is then reusable.",
    correctOrder: [
      "function createFormatter(locale: string): (amount: number) => string {",
      "  const formatter = new Intl.NumberFormat(locale, {",
      "    style: 'currency',",
      "    currency: locale === 'de-DE' ? 'EUR' : 'USD',",
      "  });",
      "  return (amount) => formatter.format(amount);",
      "}",
      "",
      "const formatEuro = createFormatter('de-DE');",
      "console.log(formatEuro(1234.56));",
    ],
    distractors: [
      "function createFormatter(locale: string, amount: number): string {",
      "return formatter.format(locale);",
    ],
    hint:
      "createFormatter returns a FUNCTION (return type is a function type). " +
      "The inner function uses the locale variable via closure.",
    concept: "currying",
    difficulty: 3,
  },

  // ─── Problem 4: Assertion Function ────────────────────────────────────
  {
    id: "L06-P4",
    title: "Assertion Function with asserts",
    description:
      "Order the lines so that an Assertion Function is created that " +
      "guarantees a value is not null/undefined.",
    correctOrder: [
      "function assertDefined<T>(",
      "  value: T | null | undefined,",
      "  message: string",
      "): asserts value is T {",
      "  if (value === null || value === undefined) {",
      "    throw new Error(message);",
      "  }",
      "}",
      "",
      "const name: string | null = getName();",
      "assertDefined(name, 'Name is required');",
      "console.log(name.toUpperCase()); // name is string",
    ],
    distractors: [
      "): value is T {",
      "): asserts value is NonNullable<T> {",
    ],
    hint:
      "Assertion Functions use 'asserts value is T' as the return type. " +
      "After the call (without throw), the type is guaranteed — here T is " +
      "freed from null/undefined.",
    concept: "assertion-function",
    difficulty: 4,
  },
];