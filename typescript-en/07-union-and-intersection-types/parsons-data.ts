/**
 * Lesson 07 — Parson's Problems: Union & Intersection Types
 *
 * 4 Problems: Discriminated Union, Result-Pattern, State Machine, Intersection Mixin
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L07-P1",
    title: "Discriminated Union with Exhaustive Check",
    description:
      "Arrange the lines so that a Discriminated Union for Shapes is created, " +
      "including an Exhaustive Check in the switch.",
    correctOrder: [
      "type Shape =",
      "  | { type: 'circle'; radius: number }",
      "  | { type: 'rect'; width: number; height: number };",
      "",
      "function area(shape: Shape): number {",
      "  switch (shape.type) {",
      "    case 'circle': return Math.PI * shape.radius ** 2;",
      "    case 'rect': return shape.width * shape.height;",
      "    default: const _: never = shape; return _;",
      "  }",
      "}",
    ],
    distractors: [
      "default: return 0;",
      "case 'circle': return Math.PI * shape.width ** 2;",
    ],
    hint:
      "The Exhaustive Check in the default uses never — not return 0. " +
      "In the circle case, shape has radius, not width.",
    concept: "discriminated-union-exhaustive",
    difficulty: 3,
  },

  {
    id: "L07-P2",
    title: "Result-Pattern for Error-Prone Operations",
    description:
      "Arrange the lines into a type-safe Result-Pattern for JSON parsing.",
    correctOrder: [
      "type Result<T> =",
      "  | { success: true; data: T }",
      "  | { success: false; error: string };",
      "",
      "function parseJSON(input: string): Result<unknown> {",
      "  try {",
      "    return { success: true, data: JSON.parse(input) };",
      "  } catch (e) {",
      "    return { success: false, error: String(e) };",
      "  }",
      "}",
    ],
    distractors: [
      "  | { success: true; error: string }",
      "    return { success: true, error: String(e) };",
    ],
    hint:
      "success: true belongs to the data object (with data), " +
      "success: false to the error object (with error). Don't mix them up!",
    concept: "result-pattern",
    difficulty: 2,
  },

  {
    id: "L07-P3",
    title: "State Machine for Orders",
    description:
      "Arrange the lines into a State Machine for order states.",
    correctOrder: [
      "type OrderState =",
      "  | { status: 'pending'; items: string[] }",
      "  | { status: 'paid'; items: string[]; paymentId: string }",
      "  | { status: 'shipped'; items: string[]; paymentId: string; trackingId: string };",
      "",
      "function getTrackingUrl(order: OrderState): string | null {",
      "  if (order.status === 'shipped') {",
      "    return `https://track.example.com/${order.trackingId}`;",
      "  }",
      "  return null;",
      "}",
    ],
    distractors: [
      "  if (order.status === 'paid') {",
      "    return `https://track.example.com/${order.paymentId}`;",
    ],
    hint:
      "trackingId only exists in the 'shipped' state. " +
      "In the 'paid' state there is only paymentId, no tracking URL.",
    concept: "state-machine",
    difficulty: 3,
  },

  {
    id: "L07-P4",
    title: "Intersection for Capability-Mixin",
    description:
      "Arrange the lines into a Mixin-Pattern with Intersection.",
    correctOrder: [
      "interface Serializable {",
      "  serialize(): string;",
      "}",
      "",
      "interface Loggable {",
      "  log(): void;",
      "}",
      "",
      "type TrackableUser = { name: string; id: number } & Serializable & Loggable;",
      "",
      "const user: TrackableUser = {",
      "  name: 'Max', id: 1,",
      "  serialize() { return JSON.stringify(this); },",
      "  log() { console.log(`User: ${this.name}`); },",
      "};",
    ],
    distractors: [
      "type TrackableUser = { name: string; id: number } | Serializable | Loggable;",
      "type TrackableUser = Serializable & Loggable;",
    ],
    hint:
      "Intersection (&) combines ALL properties — not Union (|). " +
      "TrackableUser needs name, id, serialize AND log.",
    concept: "intersection-mixin",
    difficulty: 2,
  },
];