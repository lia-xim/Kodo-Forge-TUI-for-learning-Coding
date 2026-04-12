/**
 * Lektion 21 — Transfer Tasks: Classes & OOP
 *
 * Apply class concepts in new contexts:
 *  1. Plugin system with Abstract Classes and Interfaces
 *  2. State Machine with inheritance and polymorphism
 *  3. Event Emitter with Generics and Composition
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Plugin System ────────────────────────────────────────────
  {
    id: "21-plugin-system",
    title: "Type-safe Plugin System",
    prerequisiteLessons: [21, 13],
    scenario:
      "You are building a CLI tool that should load plugins. Each plugin must " +
      "have an init() method (called when loaded) and an " +
      "execute() method (called during execution). " +
      "Some plugins need a cleanup (optional). " +
      "The system should be type-safe and allow new plugins without changing " +
      "the core code.",
    task:
      "Build a plugin system with Abstract Classes and/or Interfaces.\n\n" +
      "1. Define an interface 'Plugin' with init(), execute(input: string): string\n" +
      "2. Create an Abstract Class 'BasePlugin' with a default implementation " +
      "   for init() and an optional cleanup()\n" +
      "3. Implement two concrete plugins: UpperPlugin and ReversePlugin\n" +
      "4. Write a PluginManager that registers and executes plugins\n" +
      "5. Consider: when to use an Interface, when an Abstract Class?",
    starterCode: [
      "// Plugin Interface or Abstract Class?",
      "interface Plugin {",
      "  name: string;",
      "  init(): void;",
      "  execute(input: string): string;",
      "}",
      "",
      "// TODO: BasePlugin abstract class",
      "// TODO: UpperPlugin, ReversePlugin",
      "// TODO: PluginManager",
    ].join("\n"),
    solutionCode: [
      "// Interface for the contract",
      "interface Plugin {",
      "  name: string;",
      "  init(): void;",
      "  execute(input: string): string;",
      "  cleanup?(): void;",
      "}",
      "",
      "// Abstract Class for shared code",
      "abstract class BasePlugin implements Plugin {",
      "  abstract name: string;",
      "",
      "  init(): void {",
      "    console.log(`Plugin '${this.name}' initialized`);",
      "  }",
      "",
      "  abstract execute(input: string): string;",
      "",
      "  cleanup(): void {",
      "    console.log(`Plugin '${this.name}' cleaned up`);",
      "  }",
      "}",
      "",
      "class UpperPlugin extends BasePlugin {",
      "  name = 'upper';",
      "  execute(input: string): string { return input.toUpperCase(); }",
      "}",
      "",
      "class ReversePlugin extends BasePlugin {",
      "  name = 'reverse';",
      "  execute(input: string): string { return [...input].reverse().join(''); }",
      "}",
      "",
      "class PluginManager {",
      "  private plugins: Map<string, Plugin> = new Map();",
      "",
      "  register(plugin: Plugin): void {",
      "    plugin.init();",
      "    this.plugins.set(plugin.name, plugin);",
      "  }",
      "",
      "  execute(name: string, input: string): string {",
      "    const plugin = this.plugins.get(name);",
      "    if (!plugin) throw new Error(`Plugin '${name}' not found`);",
      "    return plugin.execute(input);",
      "  }",
      "",
      "  cleanup(): void {",
      "    for (const plugin of this.plugins.values()) {",
      "      plugin.cleanup?.();",
      "    }",
      "  }",
      "}",
      "",
      "// Usage:",
      "// const pm = new PluginManager();",
      "// pm.register(new UpperPlugin());",
      "// pm.register(new ReversePlugin());",
      "// pm.execute('upper', 'hello'); // 'HELLO'",
      "// pm.execute('reverse', 'hello'); // 'olleh'",
    ].join("\n"),
    conceptsBridged: [
      "Abstract Classes",
      "Interface Implementation",
      "Composition",
      "Factory/Registry Pattern",
    ],
    hints: [
      "Define the contract first (Interface), then shared code (Abstract Class), then concrete plugins.",
      "The PluginManager uses composition: it CONTAINS plugins, it does not inherit from them.",
      "Abstract Class for default init()/cleanup(), Interface for the contract the PluginManager knows.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: State Machine ────────────────────────────────────────────
  {
    id: "21-state-machine",
    title: "Type-safe State Machine with Classes",
    prerequisiteLessons: [21, 12],
    scenario:
      "You are building an order system. An order goes through states: " +
      "Created → Paid → Shipped → Delivered (or Cancelled). " +
      "Not every transition is allowed: a shipped order " +
      "can no longer be cancelled. Currently there is no " +
      "type safety — invalid transitions are only caught at runtime.",
    task:
      "Model a state machine with classes.\n\n" +
      "1. Create an Abstract Class 'OrderState' with abstract methods " +
      "   for allowed transitions\n" +
      "2. Implement concrete states: Created, Paid, Shipped, Delivered, Cancelled\n" +
      "3. Each state defines which transitions are possible\n" +
      "4. Create an Order class that holds the current state\n" +
      "5. Use TypeScript to prevent invalid transitions at compile time",
    starterCode: [
      "// Which transitions are allowed?",
      "// Created → Paid, Cancelled",
      "// Paid → Shipped, Cancelled",
      "// Shipped → Delivered",
      "// Delivered → (none)",
      "// Cancelled → (none)",
      "",
      "abstract class OrderState {",
      "  abstract readonly name: string;",
      "  // TODO: transition methods",
      "}",
      "",
      "class Order {",
      "  // TODO: hold state and delegate transitions",
      "}",
    ].join("\n"),
    solutionCode: [
      "abstract class OrderState {",
      "  abstract readonly name: string;",
      "",
      "  pay(): OrderState {",
      "    throw new Error(`Cannot pay in state '${this.name}'`);",
      "  }",
      "  ship(): OrderState {",
      "    throw new Error(`Cannot ship in state '${this.name}'`);",
      "  }",
      "  deliver(): OrderState {",
      "    throw new Error(`Cannot deliver in state '${this.name}'`);",
      "  }",
      "  cancel(): OrderState {",
      "    throw new Error(`Cannot cancel in state '${this.name}'`);",
      "  }",
      "}",
      "",
      "class CreatedState extends OrderState {",
      "  readonly name = 'Created';",
      "  override pay(): OrderState { return new PaidState(); }",
      "  override cancel(): OrderState { return new CancelledState(); }",
      "}",
      "",
      "class PaidState extends OrderState {",
      "  readonly name = 'Paid';",
      "  override ship(): OrderState { return new ShippedState(); }",
      "  override cancel(): OrderState { return new CancelledState(); }",
      "}",
      "",
      "class ShippedState extends OrderState {",
      "  readonly name = 'Shipped';",
      "  override deliver(): OrderState { return new DeliveredState(); }",
      "}",
      "",
      "class DeliveredState extends OrderState {",
      "  readonly name = 'Delivered';",
      "}",
      "",
      "class CancelledState extends OrderState {",
      "  readonly name = 'Cancelled';",
      "}",
      "",
      "class Order {",
      "  private state: OrderState = new CreatedState();",
      "",
      "  get status(): string { return this.state.name; }",
      "",
      "  pay(): void { this.state = this.state.pay(); }",
      "  ship(): void { this.state = this.state.ship(); }",
      "  deliver(): void { this.state = this.state.deliver(); }",
      "  cancel(): void { this.state = this.state.cancel(); }",
      "}",
      "",
      "// const order = new Order();",
      "// order.pay();     // Created → Paid",
      "// order.ship();    // Paid → Shipped",
      "// order.deliver(); // Shipped → Delivered",
      "// order.cancel();  // Error: Cannot cancel in state 'Delivered'",
    ].join("\n"),
    conceptsBridged: [
      "Abstract Classes",
      "Polymorphism (State Pattern)",
      "override",
      "Composition (Order has State)",
    ],
    hints: [
      "The State Pattern: each state is its own class. Allowed transitions are overridden methods.",
      "The base class throws errors for all transitions. Subclasses only override the ALLOWED ones.",
      "Order delegates all actions to the current state — that is composition.",
    ],
    difficulty: 4,
  },

  // ─── Task 3: Event Emitter ────────────────────────────────────────────
  {
    id: "21-event-emitter",
    title: "Type-safe Event Emitter with Generics",
    prerequisiteLessons: [21, 13, 16],
    scenario:
      "Your team needs an internal event system. The current solution " +
      "uses 'any' for event data — nobody knows which events exist " +
      "and what data they carry. Last week someone typed " +
      "'user-login' instead of 'userLogin' and the listener was " +
      "never called.",
    task:
      "Build a type-safe Event Emitter.\n\n" +
      "1. Define an EventMap as an Interface (event name → data type)\n" +
      "2. Create a generic class TypedEventEmitter<T extends EventMap>\n" +
      "3. Methods: on(event, callback), emit(event, data), off(event, callback)\n" +
      "4. TypeScript should catch incorrect event names and incorrect data types at " +
      "   compile time\n" +
      "5. Use composition instead of inheritance for integrating into other classes",
    starterCode: [
      "// Event map: which events exist and what data do they carry?",
      "interface AppEvents {",
      "  userLogin: { userId: string; timestamp: Date };",
      "  userLogout: { userId: string };",
      "  error: { message: string; code: number };",
      "}",
      "",
      "// TODO: TypedEventEmitter<T>",
      "// TODO: on(), emit(), off()",
    ].join("\n"),
    solutionCode: [
      "// Event map defines all events and their data types",
      "interface AppEvents {",
      "  userLogin: { userId: string; timestamp: Date };",
      "  userLogout: { userId: string };",
      "  error: { message: string; code: number };",
      "}",
      "",
      "// Generic Event Emitter",
      "class TypedEventEmitter<TEvents extends Record<string, unknown>> {",
      "  private listeners: {",
      "    [K in keyof TEvents]?: Array<(data: TEvents[K]) => void>;",
      "  } = {};",
      "",
      "  on<K extends keyof TEvents>(",
      "    event: K,",
      "    callback: (data: TEvents[K]) => void",
      "  ): void {",
      "    const list = this.listeners[event] ?? [];",
      "    list.push(callback);",
      "    this.listeners[event] = list as any;",
      "  }",
      "",
      "  off<K extends keyof TEvents>(",
      "    event: K,",
      "    callback: (data: TEvents[K]) => void",
      "  ): void {",
      "    const list = this.listeners[event] ?? [];",
      "    this.listeners[event] = list.filter(cb => cb !== callback) as any;",
      "  }",
      "",
      "  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {",
      "    const list = this.listeners[event] ?? [];",
      "    list.forEach(cb => cb(data));",
      "  }",
      "}",
      "",
      "// Usage with full type safety:",
      "// const events = new TypedEventEmitter<AppEvents>();",
      "// events.on('userLogin', data => {",
      "//   console.log(data.userId);    // OK: string",
      "//   console.log(data.timestamp); // OK: Date",
      "// });",
      "// events.emit('userLogin', { userId: '42', timestamp: new Date() }); // OK",
      "// events.emit('userLogin', { userId: 42 }); // ERROR: number instead of string",
      "// events.emit('typo', {}); // ERROR: 'typo' is not a valid event",
      "",
      "// Composition: use the Event Emitter inside another class",
      "// class UserService {",
      "//   readonly events = new TypedEventEmitter<AppEvents>();",
      "//   login(userId: string) {",
      "//     this.events.emit('userLogin', { userId, timestamp: new Date() });",
      "//   }",
      "// }",
    ].join("\n"),
    conceptsBridged: [
      "Generics with Classes",
      "Mapped Types for Listener Map",
      "Keyof + Index Access Types",
      "Composition (Emitter in Service)",
    ],
    hints: [
      "The event map (Interface) defines all events and their data types. The emitter is generic over this map.",
      "Use 'K extends keyof TEvents' as a type parameter for on/emit/off. Then TypeScript can infer the data type.",
      "Composition: instead of 'class UserService extends TypedEventEmitter', prefer 'class UserService { events = new TypedEventEmitter<...>() }'.",
    ],
    difficulty: 5,
  },
];