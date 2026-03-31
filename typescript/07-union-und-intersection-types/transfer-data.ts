/**
 * Lektion 07 — Transfer Tasks: Union & Intersection Types
 *
 * Konzepte in neuen Kontexten:
 *  1. API-Response-System mit Result-Pattern
 *  2. Theme-System mit Discriminated Unions
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "07-api-response-system",
    title: "Typsicheres API-Response-System",
    prerequisiteLessons: [7],
    scenario:
      "Deine App kommuniziert mit 5 verschiedenen APIs. Jede kann " +
      "erfolgreich antworten, einen Fehler zurueckgeben, oder ein " +
      "Timeout haben. Bisher checkst du try/catch — aber die Fehlertypen " +
      "gehen verloren und du weisst nie genau was schiefging.",
    task:
      "Erstelle ein typsicheres Response-System:\n\n" +
      "1. Definiere ein Result<T>-Pattern mit drei Zustaenden: " +
      "   success, error, timeout\n" +
      "2. Schreibe eine fetchUser-Funktion die Result<User> zurueckgibt\n" +
      "3. Schreibe eine handleResult-Funktion die ALLE drei Zustaende " +
      "   typsicher behandelt (mit Exhaustive Check)\n" +
      "4. Zeige dass TypeScript bei einem neuen Zustand (z.B. 'pending') " +
      "   einen Compile-Error erzwingt",
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
      "Discriminated Unions (status als Tag)",
      "Generics (Result<T>)",
      "Exhaustive Check (never im default)",
      "State-abhaengige Properties",
    ],
    hints: [
      "Definiere Result<T> mit 'status' als gemeinsamer Tag-Property " +
        "und verschiedenen Literal-Typen fuer jeden Zustand.",
      "Jeder Zustand hat eigene Properties: success hat data, " +
        "error hat error + code, timeout hat retryAfter.",
      "Der Exhaustive Check im default-Case stellt sicher, " +
        "dass alle Zustaende behandelt werden.",
    ],
    difficulty: 3,
  },

  {
    id: "07-theme-system",
    title: "Theme-System mit Union & Intersection",
    prerequisiteLessons: [7],
    scenario:
      "Du baust ein Design-System mit verschiedenen Theme-Varianten. " +
      "Jede Variante hat gemeinsame Basis-Properties (Farben, Fonts) " +
      "und varianten-spezifische Properties (z.B. Dark hat shadowColor, " +
      "High-Contrast hat borderWidth).",
    task:
      "Erstelle ein Theme-System:\n\n" +
      "1. Definiere BaseTheme (Intersection von ColorScheme & Typography)\n" +
      "2. Erstelle spezifische Theme-Varianten als Discriminated Union\n" +
      "3. Schreibe eine applyTheme-Funktion die " +
      "   varianten-spezifische Properties nutzt\n" +
      "4. Nutze Intersection fuer ein ExtendedTheme das BaseTheme " +
      "   mit einem Accessibility-Mixin kombiniert",
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
      "Intersection fuer Basis-Typ (ColorScheme & Typography)",
      "Discriminated Union fuer Theme-Varianten",
      "Intersection + Union Kombination",
      "Exhaustive Check",
    ],
    hints: [
      "BaseTheme = ColorScheme & Typography vereint die Basis-Properties.",
      "Jede Theme-Variante ist BaseTheme & { variant: '...' } " +
        "mit varianten-spezifischen Extras.",
      "applyTheme nutzt switch auf theme.variant fuer Narrowing.",
    ],
    difficulty: 4,
  },
];
