/**
 * Lesson 10 — Parson's Problems: Review Challenge
 *
 * 3 integrated problems combining multiple lessons.
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L10-P1",
    title: "Type-Safe API System (L06+L07+L08)",
    description:
      "Arrange the lines into a complete type-safe API response system " +
      "with Interface, Discriminated Union, Type Guard, and Assertion Function.",
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
      "The Type Guard must return 'result is ...' (not boolean). " +
      "success: true belongs to the data object (with data), not the error object.",
    concept: "integration-api-system",
    difficulty: 4,
  },

  {
    id: "L10-P2",
    title: "Config with as const + satisfies (L03+L09)",
    description:
      "Arrange the lines into a type-safe configuration that " +
      "both preserves Literal Types and validates the structure.",
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
      "type Env = typeof config.env; // 'production' (not string!)",
    ],
    distractors: [
      "} satisfies AppConfig as const;",
      "} as AppConfig;",
    ],
    hint:
      "Order: 'as const' BEFORE 'satisfies'. " +
      "'as AppConfig' would lose Literal Types. " +
      "'satisfies as const' is the wrong order.",
    concept: "as-const-satisfies (L03+L09)",
    difficulty: 3,
  },

  {
    id: "L10-P3",
    title: "State Machine with Exhaustive Check (L07+L09)",
    description:
      "Arrange the lines into a State Machine with as const states " +
      "and Exhaustive Check.",
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
      "    case OrderStatus.Pending: return 'Waiting for payment';",
      "    case OrderStatus.Paid: return 'Being packed';",
      "    case OrderStatus.Shipped: return 'On the way';",
      "    default: const _: never = status; return _;",
      "  }",
      "}",
    ],
    distractors: [
      "type OrderStatus = keyof typeof OrderStatus;",
      "enum OrderStatus { Pending, Paid, Shipped }",
    ],
    hint:
      "typeof OrderStatus[keyof typeof OrderStatus] returns the VALUES (not keys). " +
      "keyof typeof OrderStatus returns the keys ('Pending' etc.). " +
      "A regular Enum would also work, but as const is the modern alternative.",
    concept: "as-const-state-machine (L07+L09)",
    difficulty: 4,
  },
];