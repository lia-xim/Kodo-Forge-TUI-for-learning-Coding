/**
 * Lesson 06 — Transfer Tasks: Functions
 *
 * Concepts from the Functions lesson applied in new contexts:
 *  1. Validation library with Type Guards and Assertion Functions
 *  2. Event system with Overloads and Callbacks
 *  3. Middleware pipeline with Currying
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Validation Library ───────────────────────────────────────
  {
    id: "06-validation-library",
    title: "Type-Safe Validation Library",
    prerequisiteLessons: [6],
    scenario:
      "You are working on an API that receives JSON data from external sources. " +
      "So far you cast everything with `as` — and last week the app " +
      "crashed because a field was missing. You need a validation solution " +
      "that provides both runtime checks AND compile-time safety.",
    task:
      "Create a small validation library:\n\n" +
      "1. Write a Type Guard `isUser(data: unknown): data is User` " +
      "   that checks all properties\n" +
      "2. Write an Assertion Function `assertUser(data: unknown): asserts data is User` " +
      "   that throws a descriptive error on failure\n" +
      "3. Write a generic wrapper function " +
      "   `validate<T>(data: unknown, guard: (d: unknown) => d is T): T` " +
      "   that calls the guard and throws on failure\n" +
      "4. Test all three variants with valid and invalid input",
    starterCode: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "// 1. Type Guard",
      "function isUser(data: unknown): /* TODO */ {",
      "  // TODO: Check all properties",
      "}",
      "",
      "// 2. Assertion Function",
      "function assertUser(data: unknown): /* TODO */ {",
      "  // TODO: Throw on failure",
      "}",
      "",
      "// 3. Generic Validator",
      "function validate<T>(data: unknown, guard: /* TODO */): T {",
      "  // TODO",
      "}",
    ].join("\n"),
    solutionCode: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "// 1. Type Guard: Checks ALL properties with correct types",
      "function isUser(data: unknown): data is User {",
      "  return (",
      "    typeof data === 'object' &&",
      "    data !== null &&",
      "    'name' in data &&",
      "    'email' in data &&",
      "    'age' in data &&",
      "    typeof (data as User).name === 'string' &&",
      "    typeof (data as User).email === 'string' &&",
      "    typeof (data as User).age === 'number'",
      "  );",
      "}",
      "",
      "// 2. Assertion Function: Throws on failure",
      "function assertUser(data: unknown): asserts data is User {",
      "  if (!isUser(data)) {",
      "    throw new Error(",
      "      `Expected User, received: ${JSON.stringify(data)}`",
      "    );",
      "  }",
      "}",
      "",
      "// 3. Generic Validator: Reusable for any Type Guard",
      "function validate<T>(data: unknown, guard: (d: unknown) => d is T): T {",
      "  if (!guard(data)) {",
      "    throw new Error(`Validation failed: ${JSON.stringify(data)}`);",
      "  }",
      "  return data; // TypeScript knows: data is T",
      "}",
      "",
      "// Testing:",
      "const goodData = { name: 'Max', email: 'max@test.de', age: 30 };",
      "const badData = { name: 'Max' }; // email and age are missing",
      "",
      "// Type Guard (if/else)",
      "if (isUser(goodData)) {",
      "  console.log(goodData.email); // TypeScript knows: User",
      "}",
      "",
      "// Assertion Function (throws or guarantees)",
      "assertUser(goodData);",
      "console.log(goodData.name); // TypeScript knows: User",
      "",
      "// Generic Validator",
      "const user = validate(goodData, isUser);",
      "console.log(user.age); // TypeScript knows: User",
    ].join("\n"),
    conceptsBridged: [
      "Type Guards (value is T)",
      "Assertion Functions (asserts value is T)",
      "Generics with Type Guard Callbacks",
      "Runtime Validation + Compile-Time Safety",
    ],
    hints: [
      "A Type Guard returns boolean with 'value is Type' as annotation. " +
        "Check typeof for each property.",
      "The Assertion Function can use the Type Guard internally — " +
        "assertUser calls isUser and throws on false.",
      "The generic validator takes a guard as parameter. " +
        "The guard's type is (d: unknown) => d is T.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: Event System with Overloads ──────────────────────────────
  {
    id: "06-event-system",
    title: "Type-Safe Event System",
    prerequisiteLessons: [6],
    scenario:
      "You are building a custom event system for a single-page app. " +
      "Different events have different payloads. Currently everything is " +
      "`any` and developers have to guess what data an event contains.",
    task:
      "Create a type-safe event system:\n\n" +
      "1. Define an event map (interface) that maps event names " +
      "   to their payload types\n" +
      "2. Write `on(event, callback)` with overloads so that " +
      "   the callback parameter receives the correct event type\n" +
      "3. Write `emit(event, payload)` that enforces the correct " +
      "   payload type\n" +
      "4. The on function should return an unsubscribe function",
    starterCode: [
      "// Event map: name -> payload",
      "interface EventMap {",
      "  'user:login': { userId: string; timestamp: Date };",
      "  'user:logout': { userId: string };",
      "  'page:view': { path: string; referrer?: string };",
      "}",
      "",
      "// TODO: on() with overloads",
      "// TODO: emit() with type safety",
      "// TODO: unsubscribe function",
    ].join("\n"),
    solutionCode: [
      "interface EventMap {",
      "  'user:login': { userId: string; timestamp: Date };",
      "  'user:logout': { userId: string };",
      "  'page:view': { path: string; referrer?: string };",
      "}",
      "",
      "type Unsubscribe = () => void;",
      "type EventCallback<T> = (payload: T) => void;",
      "",
      "const listeners = new Map<string, Set<EventCallback<unknown>>>();",
      "",
      "// Overloads: each event name gets the correct callback type",
      "function on(event: 'user:login', cb: EventCallback<EventMap['user:login']>): Unsubscribe;",
      "function on(event: 'user:logout', cb: EventCallback<EventMap['user:logout']>): Unsubscribe;",
      "function on(event: 'page:view', cb: EventCallback<EventMap['page:view']>): Unsubscribe;",
      "function on(event: string, cb: EventCallback<unknown>): Unsubscribe {",
      "  if (!listeners.has(event)) listeners.set(event, new Set());",
      "  listeners.get(event)!.add(cb);",
      "  return () => { listeners.get(event)?.delete(cb); };",
      "}",
      "",
      "// emit: payload type is determined by event name",
      "function emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {",
      "  listeners.get(event)?.forEach(cb => cb(payload));",
      "}",
      "",
      "// Usage:",
      "const unsub = on('user:login', (payload) => {",
      "  console.log(payload.userId);    // TypeScript knows the type",
      "  console.log(payload.timestamp); // Date — precise!",
      "});",
      "",
      "emit('user:login', { userId: '123', timestamp: new Date() });",
      "unsub(); // remove listener",
    ].join("\n"),
    conceptsBridged: [
      "Function Overloads (event name -> callback type)",
      "Generics (emit with keyof)",
      "Callback Types (EventCallback<T>)",
      "Unsubscribe Pattern (Factory Function)",
    ],
    hints: [
      "First define the callback and unsubscribe types. " +
        "EventCallback<T> is (payload: T) => void.",
      "The on function needs overloads for each event name. " +
        "Each overload links the event name to the callback type.",
      "emit can be generic: emit<K extends keyof EventMap>(event: K, payload: EventMap[K]).",
    ],
    difficulty: 4,
  },
];