/**
 * Lesson 07 — Transfer Tasks: Union & Intersection Types
 *
 * Concepts in new contexts:
 *  1. API Response System with Result Pattern
 *  2. Theme System with Discriminated Unions
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "07-api-response-system",
    title: "Type-Safe API Response System",
    prerequisiteLessons: [7],
    scenario:
      "Your app communicates with 5 different APIs. Each can " +
      "respond successfully, return an error, or " +
      "time out. Right now you're using try/catch — but the error types " +
      "get lost and you never know exactly what went wrong.",
    task:
      "Create a type-safe response system:\n\n" +
      "1. Define a Result<T> pattern with three states: " +
      "   success, error, timeout\n" +
      "2. Write a fetchUser function that returns Result<User>\n" +
      "3. Write a handleResult function that handles ALL three states " +
      "   in a type-safe way (with exhaustive check)\n" +
      "4. Show that TypeScript forces a compile error for a new state (e.g. 'pending')",
    starterCode: [
      "interface User { name: string; email: string; }",
      "",
      "// TODO: Result<T> mit drei Zustaenden",
      "// TODO: fetchUser(): Result<User>",
      "// TODO: handleResult mit Exhaustive Check",
    ].join("\n"),
    solutionCode: [
      "interface User { name: string; email: string; }",
      "",
      "type Result<T> =",
      "  | { status: 'success'; data: T }",
      "  | { status: 'error'; error: string; code: number }",
      "  | { status: 'timeout'; retryAfter: number };",
      "",
      "function fetchUser(id: string): Result<User> {",
      "  // Simuliert verschiedene Antworten",
      "  if (id === 'timeout') return { status: 'timeout', retryAfter: 5000 };",
      "  if (id === 'error') return { status: 'error', error: 'Not found', code: 404 };",
      "  return { status: 'success', data: { name: 'Max', email: 'max@test.de' } };",
      "}",
      "",
      "function handleResult<T>(result: Result<T>): void {",
      "  switch (result.status) {",
      "    case 'success':",
      "      console.log('Daten:', result.data);",
      "      break;",
      "    case 'error':",
      "      console.log(`Fehler ${result.code}: ${result.error}`);",
      "      break;",
      "    case 'timeout':",
      "      console.log(`Timeout — Retry in ${result.retryAfter}ms`);",
      "      break;",
      "    default:",
      "      const _exhaustive: never = result;",
      "      return _exhaustive;",
      "  }",
      "}",
      "",
      "handleResult(fetchUser('123'));     // Daten: ...",
      "handleResult(fetchUser('error'));   // Fehler 404: Not found",
      "handleResult(fetchUser('timeout')); // Timeout — Retry in 5000ms",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Unions (status as tag)",
      "Generics (Result<T>)",
      "Exhaustive Check (never in default)",
      "State-dependent Properties",
    ],
    hints: [
      "Define Result<T> with 'status' as a shared tag property " +
        "and different literal types for each state.",
      "Each state has its own properties: success has data, " +
        "error has error + code, timeout has retryAfter.",
      "The exhaustive check in the default case ensures " +
        "that all states are handled.",
    ],
    difficulty: 3,
  },

  {
    id: "07-theme-system",
    title: "Theme System with Union & Intersection",
    prerequisiteLessons: [7],
    scenario:
      "You are building a design system with different theme variants. " +
      "Each variant has shared base properties (colors, fonts) " +
      "and variant-specific properties (e.g. Dark has shadowColor, " +
      "High-Contrast has borderWidth).",
    task:
      "Create a theme system:\n\n" +
      "1. Define BaseTheme (intersection of ColorScheme & Typography)\n" +
      "2. Create specific theme variants as a Discriminated Union\n" +
      "3. Write an applyTheme function that uses " +
      "   variant-specific properties\n" +
      "4. Use intersection for an ExtendedTheme that combines BaseTheme " +
      "   with an Accessibility mixin",
    starterCode: [
      "// TODO: ColorScheme, Typography Interfaces",
      "// TODO: BaseTheme = ColorScheme & Typography",
      "// TODO: Theme-Varianten (light, dark, high-contrast)",
      "// TODO: applyTheme mit Narrowing",
    ].join("\n"),
    solutionCode: [
      "interface ColorScheme {",
      "  primary: string;",
      "  secondary: string;",
      "  background: string;",
      "}",
      "",
      "interface Typography {",
      "  fontFamily: string;",
      "  fontSize: number;",
      "}",
      "",
      "type BaseTheme = ColorScheme & Typography;",
      "",
      "type Theme =",
      "  | (BaseTheme & { variant: 'light' })",
      "  | (BaseTheme & { variant: 'dark'; shadowColor: string })",
      "  | (BaseTheme & { variant: 'high-contrast'; borderWidth: number });",
      "",
      "function applyTheme(theme: Theme): string {",
      "  let css = `--primary: ${theme.primary}; --font: ${theme.fontFamily};`;",
      "  switch (theme.variant) {",
      "    case 'light':",
      "      return css;",
      "    case 'dark':",
      "      return css + ` --shadow: ${theme.shadowColor};`;",
      "    case 'high-contrast':",
      "      return css + ` --border: ${theme.borderWidth}px;`;",
      "    default:",
      "      const _: never = theme;",
      "      return _;",
      "  }",
      "}",
      "",
      "interface Accessibility { reducedMotion: boolean; highContrast: boolean; }",
      "type AccessibleTheme = Theme & Accessibility;",
    ].join("\n"),
    conceptsBridged: [
      "Intersection for base type (ColorScheme & Typography)",
      "Discriminated Union for theme variants",
      "Intersection + Union combination",
      "Exhaustive Check",
    ],
    hints: [
      "BaseTheme = ColorScheme & Typography combines the base properties.",
      "Each theme variant is BaseTheme & { variant: '...' } " +
        "with variant-specific extras.",
      "applyTheme uses a switch on theme.variant for narrowing.",
    ],
    difficulty: 4,
  },
];