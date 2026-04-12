/**
 * Lesson 14 — Debugging Challenges: Generic Patterns
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L14-D1",
    title: "Builder returns this instead of new instance",
    buggyCode: [
      "class Builder<T extends Record<string, unknown> = {}> {",
      "  private data: T = {} as T;",
      "",
      "  set<K extends string, V>(key: K, value: V): Builder<T & Record<K, V>> {",
      "    (this.data as any)[key] = value;",
      "    return this as any; // Problem!",
      "  }",
      "",
      "  build(): T { return { ...this.data }; }",
      "}",
      "",
      "const obj = new Builder().set('name', 'Max').set('age', 30).build();",
      "// Type looks correct, but internal state sharing when building multiple times!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 6,
    options: [
      "Builder returns this — multiple uses share the same state",
      "set() doesn't need a type parameter K",
      "build() should return T | undefined",
      "The type parameter = {} is wrong",
    ],
    correctOption: 0,
    hints: [
      "What happens when you use the same builder for two different objects?",
      "Mutating and returning this = side effects. A new builder per set() = safe.",
      "In set(), create a new Builder with the extended data object.",
    ],
    fixedCode: [
      "set<K extends string, V>(key: K, value: V): Builder<T & Record<K, V>> {",
      "  return new Builder({ ...this.data, [key]: value } as T & Record<K, V>);",
      "}",
    ].join("\n"),
    explanation:
      "When set() returns `this`, all calls share the same internal state. " +
      "An immutable builder creates a new instance on every set() call — " +
      "safe and correctly typed.",
    concept: "immutable-builder-pattern",
    difficulty: 4,
  },

  {
    id: "L14-D2",
    title: "pipe() with wrong type in the chain",
    buggyCode: [
      "function pipe<T>(value: T, ...fns: ((v: T) => T)[]): T {",
      "  return fns.reduce((v, fn) => fn(v), value);",
      "}",
      "",
      "const result = pipe(",
      '  "hello",',
      "  (s) => s.toUpperCase(),  // string -> string OK",
      "  (s) => s.length,         // string -> number ERROR!",
      ");",
    ].join("\n"),
    errorMessage: "Type 'number' is not assignable to type 'string'.",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "A single type parameter T enforces the same type for all steps — pipe needs overloads",
      "pipe needs to be async",
      "reduce doesn't work with generics",
      "s.length doesn't return a string",
    ],
    correctOption: 0,
    hints: [
      "What type does T have in this pipe call?",
      "T = string. But s.length returns number — that doesn't match (v: T) => T.",
      "Solution: overloads with separate type parameters per step.",
    ],
    fixedCode: [
      "function pipe<A, B>(v: A, f1: (a: A) => B): B;",
      "function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;",
      "function pipe(value: unknown, ...fns: Function[]): unknown {",
      "  return fns.reduce((v, fn) => fn(v), value);",
      "}",
    ].join("\n"),
    explanation:
      "A single type parameter T enforces that the input and output of EVERY " +
      "function are identical. Real pipe needs overloads with different type " +
      "parameters (A -> B -> C) for type transitions.",
    concept: "pipe-overloads-type-transitions",
    difficulty: 3,
  },

  {
    id: "L14-D3",
    title: "Event emitter without type linkage",
    buggyCode: [
      "class EventEmitter {",
      "  private listeners = new Map<string, Set<Function>>();",
      "",
      "  on(event: string, handler: Function): void {",
      "    if (!this.listeners.has(event)) {",
      "      this.listeners.set(event, new Set());",
      "    }",
      "    this.listeners.get(event)!.add(handler);",
      "  }",
      "",
      "  emit(event: string, data: unknown): void {",
      "    this.listeners.get(event)?.forEach(h => h(data));",
      "  }",
      "}",
      "",
      "const emitter = new EventEmitter();",
      'emitter.on("usr:login", (data) => { /* Typo! */ });',
      'emitter.emit("user:login", { wrong: true }); // Wrong payload!',
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 4,
    options: [
      "Without a generic Events interface there is no type checking for event names and payloads",
      "on() must be async",
      "Map cannot use strings as keys",
      "Function is a valid handler type",
    ],
    correctOption: 0,
    hints: [
      "Would TypeScript catch the typo 'usr:login'?",
      "No — string accepts any string. A generic Events interface would help.",
      "TypedEventEmitter<Events> with on<K extends keyof Events>(...) enforces valid names and payloads.",
    ],
    fixedCode: [
      "interface AppEvents {",
      '  "user:login": { userId: string };',
      '}',
      "",
      "class TypedEmitter<Events extends Record<string, unknown>> {",
      "  on<K extends keyof Events & string>(event: K, handler: (data: Events[K]) => void): void { ... }",
      "  emit<K extends keyof Events & string>(event: K, data: Events[K]): void { ... }",
      "}",
    ].join("\n"),
    explanation:
      "String-based APIs are error-prone: typos in event names and wrong " +
      "payloads go undetected. A generic Events interface links event names " +
      "to their payload types — both are validated.",
    concept: "typed-event-emitter",
    difficulty: 3,
  },

  {
    id: "L14-D4",
    title: "DI container resolve returns unknown",
    buggyCode: [
      "class Container {",
      "  private bindings = new Map<string, () => unknown>();",
      "",
      "  bind(key: string, factory: () => unknown): void {",
      "    this.bindings.set(key, factory);",
      "  }",
      "",
      "  resolve(key: string): unknown {",
      "    const factory = this.bindings.get(key);",
      "    if (!factory) throw new Error(`No binding: ${key}`);",
      "    return factory();",
      "  }",
      "}",
      "",
      "const c = new Container();",
      "c.bind('db', () => new Database());",
      "const db = c.resolve('db');",
      "// db.query('...'); // Error! db is unknown",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Without Token<T>, resolve() returns unknown — the type is lost",
      "Container needs a type parameter",
      "bind() must store the type",
      "resolve() should return any",
    ],
    correctOption: 0,
    hints: [
      "What type does db have after resolve()?",
      "unknown — because resolve() only has a string key and no type relationship.",
      "Solution: Token<T> as a typed key. resolve<T>(token: Token<T>): T.",
    ],
    fixedCode: [
      "class Token<T> { constructor(public name: string) {} }",
      "",
      "class Container {",
      "  private bindings = new Map<Token<unknown>, () => unknown>();",
      "  bind<T>(token: Token<T>, factory: () => T): void { ... }",
      "  resolve<T>(token: Token<T>): T { ... }",
      "}",
      "",
      "const DB = new Token<Database>('db');",
      "c.bind(DB, () => new Database());",
      "const db = c.resolve(DB); // Type: Database",
    ].join("\n"),
    explanation:
      "String keys lose type information. Token<T> is a phantom type carrier: " +
      "Token<Database> links the key to the service type. " +
      "resolve() can infer T from the token — no cast needed.",
    concept: "di-container-phantom-types",
    difficulty: 4,
  },

  {
    id: "L14-D5",
    title: "Repository create accepts id in argument",
    buggyCode: [
      "interface Entity { id: string; }",
      "interface User extends Entity { name: string; email: string; }",
      "",
      "class Repo<T extends Entity> {",
      "  private items = new Map<string, T>();",
      "  private nextId = 1;",
      "",
      "  create(data: Partial<T>): T {",
      "    const id = String(this.nextId++);",
      "    const item = { ...data, id } as T;",
      "    this.items.set(id, item);",
      "    return item;",
      "  }",
      "}",
      "",
      "const repo = new Repo<User>();",
      "repo.create({ id: '999', name: 'Hack' }); // id gets overwritten!",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Partial<T> allows id — Omit<T, 'id'> would exclude id and protect auto-generation",
      "create() needs to be async",
      "Partial makes all fields optional — name could be missing",
      "as T is wrong",
    ],
    correctOption: 0,
    hints: [
      "Which properties does Partial<User> allow?",
      "Partial<User> = { id?: string; name?: string; email?: string } — including id!",
      "Omit<T, 'id'> removes id entirely. The caller CANNOT set it.",
    ],
    fixedCode: [
      "create(data: Omit<T, 'id'>): T {",
      "  const id = String(this.nextId++);",
      "  const item = { ...data, id } as T;",
      "  this.items.set(id, item);",
      "  return item;",
      "}",
    ].join("\n"),
    explanation:
      "Partial<T> makes all properties optional — including id. The caller " +
      "could send their own id which then gets overwritten. " +
      "Omit<T, 'id'> removes the id property entirely from the parameter type. " +
      "This protects the automatic ID generation.",
    concept: "repository-omit-pattern",
    difficulty: 3,
  },
];