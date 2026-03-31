/**
 * Lektion 09 — Transfer Tasks: Enums & Literal Types
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "09-design-token-system",
    title: "Design-Token-System mit Template Literal Types",
    prerequisiteLessons: [9],
    scenario:
      "Du baust ein Design-System fuer eine Komponentenbibliothek. " +
      "Bisher sind CSS-Token-Namen als Strings hardcoded — Tippfehler " +
      "werden erst zur Laufzeit bemerkt wenn das Styling fehlt.",
    task:
      "Erstelle ein typsicheres Design-Token-System:\n\n" +
      "1. Definiere as const Objects fuer Farben, Spacing und Breakpoints\n" +
      "2. Erstelle Template Literal Types fuer CSS-Variable-Namen " +
      "   (z.B. '--color-primary', '--spacing-sm')\n" +
      "3. Schreibe eine typsichere getToken-Funktion\n" +
      "4. Zeige wie Tippfehler jetzt zur Compilezeit erkannt werden",
    starterCode: [
      "// TODO: Farb-Tokens",
      "// TODO: Spacing-Tokens",
      "// TODO: Template Literal Types fuer CSS-Variablen",
      "// TODO: getToken-Funktion",
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
      "// Template Literal Types fuer CSS-Variablen-Namen",
      "type ColorToken = `--color-${keyof typeof colors}`;",
      "// '--color-primary' | '--color-secondary' | '--color-danger' | '--color-success'",
      "",
      "type SpacingToken = `--spacing-${keyof typeof spacing}`;",
      "// '--spacing-xs' | '--spacing-sm' | '--spacing-md' | '--spacing-lg' | '--spacing-xl'",
      "",
      "type DesignToken = ColorToken | SpacingToken;",
      "",
      "// Typsichere Token-Funktion",
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
      "// getToken('--color-pink');  // Error! 'pink' ist kein Token",
    ].join("\n"),
    conceptsBridged: [
      "as const Objects fuer typsichere Werte",
      "Template Literal Types fuer generierte Strings",
      "keyof typeof fuer Union aus Object-Keys",
      "Compile-Zeit-Validierung von String-Patterns",
    ],
    hints: [
      "Definiere die Token-Werte als as const Objects — dann bleiben die Literal Types erhalten.",
      "Template Literal Types: `--color-${keyof typeof colors}` erzeugt alle gueltigen Variablen-Namen.",
      "Die getToken-Funktion nimmt DesignToken als Parameter — Tippfehler werden beim Aufruf erkannt.",
    ],
    difficulty: 4,
  },

  {
    id: "09-currency-safe-calculator",
    title: "Waehrungssicherer Rechner mit Branded Types",
    prerequisiteLessons: [9],
    scenario:
      "Dein Finanz-Tool rechnet mit verschiedenen Waehrungen. " +
      "Letzte Woche hat jemand USD zu EUR addiert ohne Konvertierung — " +
      "der Fehler wurde erst vom Kunden bemerkt.",
    task:
      "Erstelle einen waehrungssicheren Rechner:\n\n" +
      "1. Branded Types fuer EUR, USD und CHF\n" +
      "2. Konstruktor-Funktionen fuer jede Waehrung\n" +
      "3. Arithmetische Funktionen die nur gleiche Waehrungen akzeptieren\n" +
      "4. Eine Konvertierungsfunktion die zwischen Waehrungen umrechnet",
    starterCode: [
      "// TODO: Branded Types",
      "// TODO: Konstruktor-Funktionen",
      "// TODO: add, subtract (nur gleiche Waehrung)",
      "// TODO: convert (zwischen Waehrungen)",
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
      "// Generische Arithmetik — nur gleiche Waehrung!",
      "function add<T extends Currency>(a: T, b: T): T {",
      "  return ((a as number) + (b as number)) as T;",
      "}",
      "",
      "function subtract<T extends Currency>(a: T, b: T): T {",
      "  return ((a as number) - (b as number)) as T;",
      "}",
      "",
      "// Konvertierung",
      "const rates = { EUR_USD: 1.08, USD_EUR: 0.93, EUR_CHF: 0.96, CHF_EUR: 1.04 } as const;",
      "",
      "function eurToUsd(amount: EUR): USD {",
      "  return usd((amount as number) * rates.EUR_USD);",
      "}",
      "",
      "// Verwendung:",
      "const price = eur(9.99);",
      "const tax = eur(1.90);",
      "const total = add(price, tax); // OK — beide EUR",
      "",
      "// add(price, usd(5)); // Error! EUR + USD geht nicht!",
      "const priceInUsd = eurToUsd(price); // Explizite Konvertierung",
    ].join("\n"),
    conceptsBridged: [
      "Branded Types fuer semantische Unterscheidung",
      "Generics mit Branded Type Constraints",
      "Konstruktor-Funktionen als 'Eintrittspunkt'",
      "Compile-Zeit-Verhinderung von Waehrungs-Mixups",
    ],
    hints: [
      "Jede Waehrung ist number & { __brand: 'XXX' }. Die __brand-Property unterscheidet sie.",
      "add<T extends Currency>(a: T, b: T) erzwingt gleiche Waehrung fuer beide Parameter.",
      "Konvertierung braucht eine explizite Funktion — der Branded Type erzwingt Bewusstsein.",
    ],
    difficulty: 4,
  },
];
