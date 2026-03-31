/**
 * Lektion 07 — Parson's Problems: Union & Intersection Types
 *
 * 4 Problems: Discriminated Union, Result-Pattern, State Machine, Intersection Mixin
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  {
    id: "L07-P1",
    title: "Discriminated Union mit Exhaustive Check",
    description:
      "Ordne die Zeilen so, dass eine Discriminated Union fuer Shapes " +
      "entsteht, inklusive Exhaustive Check im switch.",
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
      "Der Exhaustive Check im default verwendet never — nicht return 0. " +
      "Im circle-Case hat shape.radius, nicht shape.width.",
    concept: "discriminated-union-exhaustive",
    difficulty: 3,
  },

  {
    id: "L07-P2",
    title: "Result-Pattern fuer fehleranfaellige Operation",
    description:
      "Ordne die Zeilen zu einem typsicheren Result-Pattern fuer JSON-Parsing.",
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
      "success: true gehoert zum Daten-Objekt (mit data), " +
      "success: false zum Fehler-Objekt (mit error). Nicht verwechseln!",
    concept: "result-pattern",
    difficulty: 2,
  },

  {
    id: "L07-P3",
    title: "State Machine fuer Bestellung",
    description:
      "Ordne die Zeilen zu einer State Machine fuer Bestellzustaende.",
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
      "trackingId existiert nur im 'shipped'-Zustand. " +
      "Im 'paid'-Zustand gibt es nur paymentId, keine Tracking-URL.",
    concept: "state-machine",
    difficulty: 3,
  },

  {
    id: "L07-P4",
    title: "Intersection fuer Capability-Mixin",
    description:
      "Ordne die Zeilen zu einem Mixin-Pattern mit Intersection.",
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
      "Intersection (&) kombiniert ALLE Properties — nicht Union (|). " +
      "TrackableUser braucht name, id, serialize UND log.",
    concept: "intersection-mixin",
    difficulty: 2,
  },
];
