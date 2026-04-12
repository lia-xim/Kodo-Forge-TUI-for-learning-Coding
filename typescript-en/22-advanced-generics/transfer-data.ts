/**
 * Lesson 22 — Transfer Tasks: Advanced Generics
 *
 * These tasks take the concepts from the Advanced Generics lesson and apply
 * them in completely new contexts:
 *
 *  1. Type-safe Event System with covariant listeners (Game Engine)
 *  2. Generic Data Validator with constraints (Form Validation)
 *  3. Variance-safe Collection API (Immutable.js-like)
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Type-safe Event System ───────────────────────────────────
  {
    id: "22-event-system",
    title: "Type-safe Event System with covariant listeners",
    prerequisiteLessons: [13, 14, 22],
    scenario:
      "You are developing a Game Engine. Events have a hierarchy: " +
      "`GameEvent` → `CollisionEvent` → `PlayerCollisionEvent`. " +
      "Listeners that listen to `GameEvent` should also be able to receive `CollisionEvent`. " +
      "But a `PlayerCollisionEvent` listener should " +
      "NOT receive all `GameEvent`s — that would be unsafe.",
    task:
      "Design a type-safe event system with correct variance.\n\n" +
      "1. Define the event hierarchy: `GameEvent`, `CollisionEvent extends GameEvent`, " +
      "`PlayerCollisionEvent extends CollisionEvent`\n" +
      "2. Create an `EventEmitter<out E>` interface — covariant in E\n" +
      "3. Create an `EventListener<in E>` interface — contravariant in E\n" +
      "4. Implement a `subscribe` function that connects emitter and listener " +
      "in a type-safe way\n" +
      "5. Test: An `EventListener<GameEvent>` can listen to `EventEmitter<CollisionEvent>` " +
      "(covariance + contravariance combined)\n" +
      "6. Test: An `EventListener<PlayerCollisionEvent>` cannot listen to " +
      "`EventEmitter<GameEvent>` (that would be unsafe)",
    starterCode: [
      "// Event hierarchy",
      "interface GameEvent { type: string; timestamp: number; }",
      "interface CollisionEvent extends GameEvent {",
      "  objectA: string; objectB: string;",
      "}",
      "interface PlayerCollisionEvent extends CollisionEvent {",
      "  playerId: string; damage: number;",
      "}",
      "",
      "// TODO: EventEmitter<out E> and EventListener<in E>",
      "// TODO: subscribe function",
      "// TODO: Tests for correct variance",
    ].join("\n"),
    hints: [
      "A producer (EventEmitter) is covariant — it emits events.",
      "A consumer (EventListener) is contravariant — it receives events.",
      "subscribe<E>(emitter: EventEmitter<E>, listener: EventListener<E>) " +
      "connects both with the same E.",
    ],
    sampleSolution: [
      "interface EventEmitter<out E> {",
      "  lastEvent(): E | null;",
      "  onNext(callback: (event: E) => void): void;",
      "}",
      "",
      "interface EventListener<in E> {",
      "  handle(event: E): void;",
      "}",
      "",
      "function subscribe<E>(",
      "  emitter: EventEmitter<E>,",
      "  listener: EventListener<E>",
      "): void {",
      "  emitter.onNext(event => listener.handle(event));",
      "}",
      "",
      "// Test: GameEvent listener on CollisionEvent emitter — OK!",
      "declare const collisionEmitter: EventEmitter<CollisionEvent>;",
      "declare const gameListener: EventListener<GameEvent>;",
      "subscribe(collisionEmitter, gameListener); // covariance + contravariance",
    ].join("\n"),
    evaluationCriteria: [
      "EventEmitter is covariant (out E), EventListener is contravariant (in E)",
      "subscribe connects both in a type-safe way",
      "Correct variance tests: safe assignments compile, unsafe ones do not",
      "No any-casts or type assertions",
    ],
  },

  // ─── Task 2: Generic Data Validator ───────────────────────────────────
  {
    id: "22-data-validator",
    title: "Generic Data Validator with Constraints",
    prerequisiteLessons: [13, 14, 17, 22],
    scenario:
      "You are building a form validation library. Different fields have " +
      "different validation rules. You want a generic validator " +
      "that uses intersection constraints to ensure each field " +
      "has the correct validation rules.",
    task:
      "Implement a generic validator.\n\n" +
      "1. Define validator interfaces: `HasMinLength`, `HasRange`, `HasPattern`\n" +
      "2. Create a generic `validate` function with intersection constraint: " +
      "`T extends HasMinLength & HasPattern` (for strings) or " +
      "`T extends HasRange` (for numbers)\n" +
      "3. Use conditional types to automatically select the validator type: " +
      "`type ValidatorFor<T> = T extends string ? StringValidator : NumberValidator`\n" +
      "4. Build a `createForm` function that automatically generates " +
      "the correct validators for a schema\n" +
      "5. Test with a user form: `{ name: string, age: number, email: string }`",
    starterCode: [
      "// Validator interfaces",
      "interface HasMinLength { minLength: number; }",
      "interface HasRange { min: number; max: number; }",
      "interface HasPattern { pattern: RegExp; }",
      "",
      "// TODO: StringValidator extends HasMinLength & HasPattern",
      "// TODO: NumberValidator extends HasRange",
      "// TODO: ValidatorFor<T> Conditional Type",
      "// TODO: createForm<Schema>(...)",
    ].join("\n"),
    hints: [
      "Intersection constraints combine multiple requirements.",
      "Conditional types can select the validator based on the field type.",
      "Mapped types + conditional types = automatic validator assignment per field.",
    ],
    sampleSolution: [
      "interface StringValidator extends HasMinLength, HasPattern {",
      "  validate(value: string): boolean;",
      "}",
      "",
      "interface NumberValidator extends HasRange {",
      "  validate(value: number): boolean;",
      "}",
      "",
      "type ValidatorFor<T> = T extends string",
      "  ? StringValidator",
      "  : T extends number",
      "    ? NumberValidator",
      "    : never;",
      "",
      "type FormValidators<Schema> = {",
      "  [K in keyof Schema]: ValidatorFor<Schema[K]>;",
      "};",
      "",
      "function createForm<Schema extends Record<string, string | number>>(",
      "  schema: Schema,",
      "  validators: FormValidators<Schema>",
      "): void { /* ... */ }",
    ].join("\n"),
    evaluationCriteria: [
      "Intersection constraints for validators used correctly",
      "Conditional type selects validator based on field type",
      "Mapped type generates validator map for the entire schema",
      "Type-safe: wrong validator type produces a compile error",
    ],
  },

  // ─── Task 3: Variance-safe Collection API ────────────────────────────
  {
    id: "22-collection-api",
    title: "Variance-safe Collection API",
    prerequisiteLessons: [13, 14, 22],
    scenario:
      "You are building a small Immutable.js-like library. The collection " +
      "should offer various operations: `map` (covariant — output), " +
      "`filter` (invariant — reads and produces), `forEach` (contravariant — input). " +
      "Each operation has a different variance property.",
    task:
      "Design a variance-safe collection API.\n\n" +
      "1. Create `ReadonlyCollection<out T>` — read-only operations (covariant)\n" +
      "2. Create `MutableCollection<in out T>` — reading and writing (invariant)\n" +
      "3. Create `Sink<in T>` — write-only (contravariant)\n" +
      "4. Implement `toReadonly`: MutableCollection → ReadonlyCollection (safe)\n" +
      "5. Show why `toMutable`: ReadonlyCollection → MutableCollection would be unsafe\n" +
      "6. Test the variance: ReadonlyCollection<Cat> = ReadonlyCollection<Animal>? " +
      "MutableCollection<Cat> = MutableCollection<Animal>?",
    starterCode: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "// TODO: ReadonlyCollection<out T>",
      "// TODO: MutableCollection<in out T>",
      "// TODO: Sink<in T>",
      "// TODO: toReadonly function",
      "// TODO: variance tests",
    ].join("\n"),
    hints: [
      "ReadonlyCollection only has methods that return T (get, map, filter).",
      "MutableCollection also has methods that accept T (add, set).",
      "Sink only has methods that accept T (add, push).",
    ],
    sampleSolution: [
      "interface ReadonlyCollection<out T> {",
      "  get(index: number): T;",
      "  map<U>(fn: (item: T) => U): ReadonlyCollection<U>;",
      "  toArray(): T[];",
      "}",
      "",
      "interface MutableCollection<in out T> {",
      "  get(index: number): T;",
      "  add(item: T): void;",
      "  set(index: number, item: T): void;",
      "}",
      "",
      "interface Sink<in T> {",
      "  add(item: T): void;",
      "  addAll(items: T[]): void;",
      "}",
      "",
      "function toReadonly<T>(coll: MutableCollection<T>): ReadonlyCollection<T> {",
      "  return { get: i => coll.get(i), map: fn => { /* ... */ }, toArray: () => [] };",
      "}",
      "",
      "// Test: covariance with ReadonlyCollection",
      "declare const readonlyCats: ReadonlyCollection<Cat>;",
      "const readonlyAnimals: ReadonlyCollection<Animal> = readonlyCats; // OK!",
      "",
      "// Test: contravariance with Sink",
      "declare const animalSink: Sink<Animal>;",
      "const catSink: Sink<Cat> = animalSink; // OK!",
    ].join("\n"),
    evaluationCriteria: [
      "ReadonlyCollection is covariant (out T) — read-only methods",
      "MutableCollection is invariant (in out T) — reading and writing",
      "Sink is contravariant (in T) — write-only methods",
      "Variance tests correct: ReadonlyCollection<Cat> → ReadonlyCollection<Animal> OK",
    ],
  },
];