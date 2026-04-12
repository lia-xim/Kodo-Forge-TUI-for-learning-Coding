/**
 * Lesson 09 — Transfer Tasks: Enums & Literal Types
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "09-design-token-system",
    title: "Design Token System with Template Literal Types",
    prerequisiteLessons: [9],
    scenario:
      "You are building a design system for a component library. " +
      "Currently, CSS token names are hardcoded as strings — typos " +
      "are only noticed at runtime when the styling is missing.",
    task:
      "Create a type-safe design token system:\n\n" +
      "1. Define as const objects for colors, spacing, and breakpoints\n" +
      "2. Create Template Literal Types for CSS variable names " +
      "   (e.g. '--color-primary', '--spacing-sm')\n" +
      "3. Write a type-safe getToken function\n" +
      "4. Show how typos are now caught at compile time",
    starterCode: [
      "// TODO: Color tokens",
      "// TODO: Spacing tokens",
      "// TODO: Template Literal Types for CSS variables",
      "// TODO: getToken function",
    ].join("\n"),
    solutionCode: [
      "const colors = {",
      "  primary: '#007bff',",
      "  secondary: '#6c757d',",
      "  danger: '#dc3545',",
      "  success: '#28a745',",
      "} as const;",
      "",
      "const spacing = {",
      "  xs: '0.25rem',",
      "  sm: '0.5rem',",
      "  md: '1rem',",
      "  lg: '2rem',",
      "  xl: '4rem',",
      "} as const;",
      "",
      "// Template Literal Types for CSS variable names",
      "type ColorToken = `--color-${keyof typeof colors}`;",
      "// '--color-primary' | '--color-secondary' | '--color-danger' | '--color-success'",
      "",
      "type SpacingToken = `--spacing-${keyof typeof spacing}`;",
      "// '--spacing-xs' | '--spacing-sm' | '--spacing-md' | '--spacing-lg' | '--spacing-xl'",
      "",
      "type DesignToken = ColorToken | SpacingToken;",
      "",
      "// Type-safe token function",
      "function getToken(token: DesignToken): string {",
      "  if (token.startsWith('--color-')) {",
      "    const key = token.replace('--color-', '') as keyof typeof colors;",
      "    return colors[key];",
      "  }",
      "  const key = token.replace('--spacing-', '') as keyof typeof spacing;",
      "  return spacing[key];",
      "}",
      "",
      "getToken('--color-primary');  // OK",
      "getToken('--spacing-md');     // OK",
      "// getToken('--color-pink');  // Error! 'pink' is not a token",
    ].join("\n"),
    conceptsBridged: [
      "as const objects for type-safe values",
      "Template Literal Types for generated strings",
      "keyof typeof for union from object keys",
      "Compile-time validation of string patterns",
    ],
    hints: [
      "Define the token values as as const objects — this preserves the literal types.",
      "Template Literal Types: `--color-${keyof typeof colors}` generates all valid variable names.",
      "The getToken function takes DesignToken as parameter — typos are caught at the call site.",
    ],
    difficulty: 4,
  },

  {
    id: "09-currency-safe-calculator",
    title: "Currency-Safe Calculator with Branded Types",
    prerequisiteLessons: [9],
    scenario:
      "Your finance tool works with multiple currencies. " +
      "Last week someone added USD to EUR without conversion — " +
      "the mistake was only noticed by the customer.",
    task:
      "Create a currency-safe calculator:\n\n" +
      "1. Branded Types for EUR, USD, and CHF\n" +
      "2. Constructor functions for each currency\n" +
      "3. Arithmetic functions that only accept the same currency\n" +
      "4. A conversion function that converts between currencies",
    starterCode: [
      "// TODO: Branded Types",
      "// TODO: Constructor functions",
      "// TODO: add, subtract (same currency only)",
      "// TODO: convert (between currencies)",
    ].join("\n"),
    solutionCode: [
      "type EUR = number & { __brand: 'EUR' };",
      "type USD = number & { __brand: 'USD' };",
      "type CHF = number & { __brand: 'CHF' };",
      "type Currency = EUR | USD | CHF;",
      "",
      "function eur(amount: number): EUR { return amount as EUR; }",
      "function usd(amount: number): USD { return amount as USD; }",
      "function chf(amount: number): CHF { return amount as CHF; }",
      "",
      "// Generic arithmetic — same currency only!",
      "function add<T extends Currency>(a: T, b: T): T {",
      "  return ((a as number) + (b as number)) as T;",
      "}",
      "",
      "function subtract<T extends Currency>(a: T, b: T): T {",
      "  return ((a as number) - (b as number)) as T;",
      "}",
      "",
      "// Conversion",
      "const rates = { EUR_USD: 1.08, USD_EUR: 0.93, EUR_CHF: 0.96, CHF_EUR: 1.04 } as const;",
      "",
      "function eurToUsd(amount: EUR): USD {",
      "  return usd((amount as number) * rates.EUR_USD);",
      "}",
      "",
      "// Usage:",
      "const price = eur(9.99);",
      "const tax = eur(1.90);",
      "const total = add(price, tax); // OK — both EUR",
      "",
      "// add(price, usd(5)); // Error! EUR + USD is not allowed!",
      "const priceInUsd = eurToUsd(price); // Explicit conversion",
    ].join("\n"),
    conceptsBridged: [
      "Branded Types for semantic distinction",
      "Generics with Branded Type Constraints",
      "Constructor functions as 'entry point'",
      "Compile-time prevention of currency mix-ups",
    ],
    hints: [
      "Each currency is number & { __brand: 'XXX' }. The __brand property distinguishes them.",
      "add<T extends Currency>(a: T, b: T) enforces the same currency for both parameters.",
      "Conversion requires an explicit function — the Branded Type enforces awareness.",
    ],
    difficulty: 4,
  },
];