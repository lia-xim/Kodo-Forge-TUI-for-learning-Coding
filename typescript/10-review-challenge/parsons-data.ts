/**
 * Lektion 10 — Parson's Problems: Review Challenge
 *
 * 3 integrierte Problems die mehrere Lektionen kombinieren.
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L10-P1",
    title: "Typsicheres API-System (L06+L07+L08)",
    description:
      "Ordne die Zeilen zu einem vollstaendigen typsicheren API-Response-System " +
      "mit Interface, Discriminated Union, Type Guard und Assertion Function.",
    correctOrder: [
      "interface User { id: string; name: string; email: string; }",
      "",
      "type ApiResult<T> =",
      "  | { success: true; data: T }",
      "  | { success: false; error: string };",
      "",
      "function isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T } {",
      "  return result.success === true;",
      "}",
      "",
      "const result: ApiResult<User> = { success: true, data: { id: '1', name: 'Max', email: 'max@test.de' } };",
      "if (isSuccess(result)) {",
      "  console.log(result.data.name);",
      "}",
    ],
    distractors: [
      "function isSuccess<T>(result: ApiResult<T>): boolean {",
      "  | { success: true; error: string }",
    ],
    hint:
      "Der Type Guard muss 'result is ...' zurueckgeben (nicht boolean). " +
      "success: true gehoert zum Daten-Objekt (mit data), nicht zum Fehler-Objekt.",
    concept: "integration-api-system",
    difficulty: 4,
  },

  {
    id: "L10-P2",
    title: "Config mit as const + satisfies (L03+L09)",
    description:
      "Ordne die Zeilen zu einer typsicheren Konfiguration die " +
      "sowohl Literal Types behaelt als auch die Struktur prueft.",
    correctOrder: [
      "interface AppConfig {",
      "  env: 'development' | 'production';",
      "  port: number;",
      "  debug: boolean;",
      "}",
      "",
      "const config = {",
      "  env: 'production',",
      "  port: 3000,",
      "  debug: false,",
      "} as const satisfies AppConfig;",
      "",
      "type Env = typeof config.env; // 'production' (nicht string!)",
    ],
    distractors: [
      "} satisfies AppConfig as const;",
      "} as AppConfig;",
    ],
    hint:
      "Reihenfolge: 'as const' VOR 'satisfies'. " +
      "'as AppConfig' wuerde Literal Types verlieren. " +
      "'satisfies as const' ist falsche Reihenfolge.",
    concept: "as-const-satisfies (L03+L09)",
    difficulty: 3,
  },

  {
    id: "L10-P3",
    title: "State Machine mit Exhaustive Check (L07+L09)",
    description:
      "Ordne die Zeilen zu einer State Machine mit as const Zustaenden " +
      "und Exhaustive Check.",
    correctOrder: [
      "const OrderStatus = {",
      "  Pending: 'PENDING',",
      "  Paid: 'PAID',",
      "  Shipped: 'SHIPPED',",
      "} as const;",
      "",
      "type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];",
      "",
      "function handleOrder(status: OrderStatus): string {",
      "  switch (status) {",
      "    case OrderStatus.Pending: return 'Warten auf Zahlung';",
      "    case OrderStatus.Paid: return 'Wird verpackt';",
      "    case OrderStatus.Shipped: return 'Unterwegs';",
      "    default: const _: never = status; return _;",
      "  }",
      "}",
    ],
    distractors: [
      "type OrderStatus = keyof typeof OrderStatus;",
      "enum OrderStatus { Pending, Paid, Shipped }",
    ],
    hint:
      "typeof OrderStatus[keyof typeof OrderStatus] gibt die WERTE (nicht Keys). " +
      "keyof typeof OrderStatus gibt die Keys ('Pending' etc.). " +
      "Ein regulaeres Enum waere auch moeglich, aber as const ist die moderne Alternative.",
    concept: "as-const-state-machine (L07+L09)",
    difficulty: 4,
  },
];
