/**
 * Lesson 14 — Transfer Tasks: Generic Patterns
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "14-generic-state-machine",
    title: "Generic State Machine",
    prerequisiteLessons: [13, 14],
    scenario:
      "Your team is building an order workflow. Each order passes through " +
      "states: 'pending' -> 'confirmed' -> 'shipped' -> 'delivered'. " +
      "Currently, state transitions are implemented as string comparisons — " +
      "every typo creates a silent bug.",
    task:
      "Create a generic StateMachine<States, Transitions>:\n\n" +
      "1. Define a Transitions interface that describes allowed transitions:\n" +
      "   Record<State, State[]> — from which state to which states\n" +
      "2. Build a StateMachine<S, T> class with:\n" +
      "   - current: S (current state)\n" +
      "   - transition(to: AllowedTarget): void\n" +
      "   - onEnter(state: S, handler: () => void): void\n" +
      "3. The transition() method should check at COMPILE-TIME whether the\n" +
      "   transition is allowed\n" +
      "4. Demonstrate the machine with the order workflow",
    starterCode: [
      "// TODO: OrderState Type (union of allowed states)",
      "// TODO: OrderTransitions Interface (which state -> which states)",
      "// TODO: StateMachine<States, Transitions> class",
      "// TODO: Demonstrate order workflow",
    ].join("\n"),
    solutionCode: [
      "type OrderState = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';",
      "",
      "interface OrderTransitions {",
      "  pending: 'confirmed' | 'cancelled';",
      "  confirmed: 'shipped' | 'cancelled';",
      "  shipped: 'delivered';",
      "  delivered: never;",
      "  cancelled: never;",
      "}",
      "",
      "class StateMachine<",
      "  S extends string,",
      "  T extends Record<S, S>,",
      "> {",
      "  private handlers = new Map<S, (() => void)[]>();",
      "",
      "  constructor(public current: S) {}",
      "",
      "  transition<From extends S>(to: T[From]): void {",
      "    const from = this.current as From;",
      "    this.current = to as unknown as S;",
      "    const callbacks = this.handlers.get(this.current) ?? [];",
      "    callbacks.forEach(cb => cb());",
      "  }",
      "",
      "  onEnter(state: S, handler: () => void): void {",
      "    const existing = this.handlers.get(state) ?? [];",
      "    existing.push(handler);",
      "    this.handlers.set(state, existing);",
      "  }",
      "}",
      "",
      "const order = new StateMachine<OrderState, OrderTransitions>('pending');",
      "order.onEnter('shipped', () => console.log('Package on its way!'));",
      "order.transition('confirmed');  // OK",
      "order.transition('shipped');    // OK — triggers handler",
      "// order.transition('pending'); // Compile error: 'pending' not in OrderTransitions['shipped']",
    ].join("\n"),
    conceptsBridged: [
      "Generic classes with multiple type parameters",
      "Record-based transition maps",
      "Compile-time validation of state transitions",
      "Event handlers with generics",
    ],
    estimatedMinutes: 25,
    difficulty: 4,
  },

  {
    id: "14-generic-plugin-system",
    title: "Generic Plugin System",
    prerequisiteLessons: [13, 14],
    scenario:
      "You are developing a text editor. Various plugins extend the " +
      "editor with features: Spell-Check, Auto-Save, Theme-Switching. " +
      "Each plugin has its own configuration and its own events. " +
      "Currently everything is typed as 'any' — plugins crash when they " +
      "receive the wrong configuration.",
    task:
      "Create a type-safe plugin system:\n\n" +
      "1. Define a Plugin<Config, Events> interface with:\n" +
      "   - name: string\n" +
      "   - init(config: Config): void\n" +
      "   - destroy(): void\n" +
      "2. Build a PluginManager that can register and manage plugins\n" +
      "3. The manager should check the config type of each plugin during register()\n" +
      "4. Create 2-3 concrete plugins (SpellCheck, AutoSave) and register them",
    starterCode: [
      "// TODO: Plugin<Config, Events> Interface",
      "// TODO: PluginManager class",
      "// TODO: SpellCheckPlugin and AutoSavePlugin",
      "// TODO: Register and configure plugins",
    ].join("\n"),
    solutionCode: [
      "interface Plugin<Config = void, Events extends Record<string, unknown> = {}> {",
      "  name: string;",
      "  init(config: Config): void;",
      "  destroy(): void;",
      "  on?<K extends keyof Events>(event: K, handler: (data: Events[K]) => void): void;",
      "}",
      "",
      "interface SpellCheckConfig { language: string; autoCorrect: boolean; }",
      "interface SpellCheckEvents { typoFound: { word: string; suggestion: string }; }",
      "",
      "const spellCheck: Plugin<SpellCheckConfig, SpellCheckEvents> = {",
      "  name: 'spell-check',",
      "  init(config) { console.log(`SpellCheck: ${config.language}, auto=${config.autoCorrect}`); },",
      "  destroy() { console.log('SpellCheck destroyed'); },",
      "};",
      "",
      "interface AutoSaveConfig { intervalMs: number; }",
      "",
      "const autoSave: Plugin<AutoSaveConfig> = {",
      "  name: 'auto-save',",
      "  init(config) { console.log(`AutoSave every ${config.intervalMs}ms`); },",
      "  destroy() { console.log('AutoSave destroyed'); },",
      "};",
      "",
      "class PluginManager {",
      "  private plugins = new Map<string, Plugin<any, any>>();",
      "",
      "  register<C, E extends Record<string, unknown>>(plugin: Plugin<C, E>, config: C): void {",
      "    plugin.init(config);",
      "    this.plugins.set(plugin.name, plugin);",
      "  }",
      "",
      "  unregister(name: string): void {",
      "    this.plugins.get(name)?.destroy();",
      "    this.plugins.delete(name);",
      "  }",
      "}",
      "",
      "const manager = new PluginManager();",
      "manager.register(spellCheck, { language: 'de', autoCorrect: true });",
      "manager.register(autoSave, { intervalMs: 5000 });",
      "// manager.register(autoSave, { language: 'de' }); // Compile error!",
    ].join("\n"),
    conceptsBridged: [
      "Generic interfaces with default type parameters",
      "Plugin architecture with type constraints",
      "Type inference in register()",
      "Event system with generics (from L14 Section 5)",
    ],
    estimatedMinutes: 20,
    difficulty: 3,
  },

  {
    id: "14-generic-middleware-pipeline",
    title: "Generic Middleware Pipeline",
    prerequisiteLessons: [13, 14],
    scenario:
      "Your backend processes HTTP requests through a pipeline: " +
      "Auth-Check -> Rate-Limiting -> Logging -> Handler. Each middleware " +
      "can extend the context (Auth adds user, Rate-Limiter " +
      "adds remainingRequests). Currently, typing is lost during extension.",
    task:
      "Create a type-safe middleware pipeline:\n\n" +
      "1. Define type Middleware<In, Out> = (ctx: In) => Out\n" +
      "2. Build a Pipeline class that chains middlewares:\n" +
      "   - pipe(mw: Middleware<Current, Next>): Pipeline<Next>\n" +
      "   - execute(initial: First): Last\n" +
      "3. Each middleware may EXTEND the context type\n" +
      "4. Demonstrate with Auth, Logging, Handler middlewares",
    starterCode: [
      "// TODO: Middleware<In, Out> Type",
      "// TODO: Pipeline class with pipe() and execute()",
      "// TODO: Auth, Logging, Handler Middlewares",
      "// TODO: Assemble and execute pipeline",
    ].join("\n"),
    solutionCode: [
      "type Middleware<In, Out> = (ctx: In) => Out;",
      "",
      "class Pipeline<T> {",
      "  constructor(private fns: Middleware<any, any>[] = []) {}",
      "",
      "  pipe<U>(mw: Middleware<T, U>): Pipeline<U> {",
      "    return new Pipeline([...this.fns, mw]);",
      "  }",
      "",
      "  execute(initial: T extends infer First ? First : never): T {",
      "    return this.fns.reduce((ctx, fn) => fn(ctx), initial) as T;",
      "  }",
      "}",
      "",
      "interface BaseContext { method: string; path: string; }",
      "interface AuthContext extends BaseContext { user: { id: string; role: string }; }",
      "interface LoggedContext extends AuthContext { requestId: string; }",
      "",
      "const auth: Middleware<BaseContext, AuthContext> = (ctx) => ({",
      "  ...ctx,",
      "  user: { id: '123', role: 'admin' },",
      "});",
      "",
      "const logging: Middleware<AuthContext, LoggedContext> = (ctx) => {",
      "  const requestId = Math.random().toString(36).slice(2);",
      "  console.log(`[${requestId}] ${ctx.method} ${ctx.path} by ${ctx.user.id}`);",
      "  return { ...ctx, requestId };",
      "};",
      "",
      "const pipeline = new Pipeline<BaseContext>()",
      "  .pipe(auth)",
      "  .pipe(logging);",
      "",
      "const result = pipeline.execute({ method: 'GET', path: '/api/users' });",
      "// result: LoggedContext — fully typed!",
    ].join("\n"),
    conceptsBridged: [
      "Builder-like type growth in pipe()",
      "Middleware architecture (Express/Koa-inspired)",
      "Context extension through intersection-like patterns",
      "pipe() and compose() from L14 Section 3",
    ],
    estimatedMinutes: 25,
    difficulty: 4,
  },
];