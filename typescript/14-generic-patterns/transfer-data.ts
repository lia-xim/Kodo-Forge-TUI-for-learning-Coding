/**
 * Lektion 14 — Transfer Tasks: Generic Patterns
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "14-generic-state-machine",
    title: "Generische State Machine",
    prerequisiteLessons: [13, 14],
    scenario:
      "Dein Team baut einen Bestell-Workflow. Jede Bestellung durchlaeuft " +
      "Zustaende: 'pending' -> 'confirmed' -> 'shipped' -> 'delivered'. " +
      "Bisher sind die Zustandsuebergaenge als String-Vergleiche implementiert — " +
      "jeder Tippfehler erzeugt einen stummen Bug.",
    task:
      "Erstelle eine generische StateMachine<States, Transitions>:\n\n" +
      "1. Definiere ein Transitions-Interface das erlaubte Uebergaenge beschreibt:\n" +
      "   Record<State, State[]> — von welchem State zu welchen States\n" +
      "2. Baue eine StateMachine<S, T> Klasse mit:\n" +
      "   - current: S (aktueller Zustand)\n" +
      "   - transition(to: AllowedTarget): void\n" +
      "   - onEnter(state: S, handler: () => void): void\n" +
      "3. Die transition()-Methode soll zur COMPILE-ZEIT pruefen ob der\n" +
      "   Uebergang erlaubt ist\n" +
      "4. Demonstriere die Machine mit dem Bestell-Workflow",
    starterCode: [
      "// TODO: OrderState Type (Union der erlaubten Zustaende)",
      "// TODO: OrderTransitions Interface (welcher State -> welche States)",
      "// TODO: StateMachine<States, Transitions> Klasse",
      "// TODO: Bestell-Workflow demonstrieren",
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
      "order.onEnter('shipped', () => console.log('Paket unterwegs!'));",
      "order.transition('confirmed');  // OK",
      "order.transition('shipped');    // OK — loest Handler aus",
      "// order.transition('pending'); // Compile-Fehler: 'pending' nicht in OrderTransitions['shipped']",
    ].join("\n"),
    conceptsBridged: [
      "Generische Klassen mit mehreren Typparametern",
      "Record-basierte Transition Maps",
      "Compile-Zeit-Validierung von Zustandsuebergaengen",
      "Event-Handler mit Generics",
    ],
    estimatedMinutes: 25,
    difficulty: 4,
  },

  {
    id: "14-generic-plugin-system",
    title: "Generisches Plugin-System",
    prerequisiteLessons: [13, 14],
    scenario:
      "Du entwickelst einen Text-Editor. Verschiedene Plugins erweitern den " +
      "Editor um Funktionen: Spell-Check, Auto-Save, Theme-Switching. " +
      "Jedes Plugin hat seine eigene Konfiguration und seine eigenen Events. " +
      "Bisher ist alles 'any'-typisiert — Plugins crashen wenn sie falsche " +
      "Konfiguration bekommen.",
    task:
      "Erstelle ein typsicheres Plugin-System:\n\n" +
      "1. Definiere ein Plugin<Config, Events> Interface mit:\n" +
      "   - name: string\n" +
      "   - init(config: Config): void\n" +
      "   - destroy(): void\n" +
      "2. Baue einen PluginManager der Plugins registrieren und verwalten kann\n" +
      "3. Der Manager soll den Config-Typ jedes Plugins beim register() pruefen\n" +
      "4. Erstelle 2-3 konkrete Plugins (SpellCheck, AutoSave) und registriere sie",
    starterCode: [
      "// TODO: Plugin<Config, Events> Interface",
      "// TODO: PluginManager Klasse",
      "// TODO: SpellCheckPlugin und AutoSavePlugin",
      "// TODO: Plugins registrieren und konfigurieren",
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
      "  init(config) { console.log(`AutoSave alle ${config.intervalMs}ms`); },",
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
      "// manager.register(autoSave, { language: 'de' }); // Compile-Fehler!",
    ].join("\n"),
    conceptsBridged: [
      "Generische Interfaces mit Default-Typparametern",
      "Plugin-Architektur mit Typ-Constraints",
      "Typ-Inferenz bei register()",
      "Event-System mit Generics (aus L14 Sektion 5)",
    ],
    estimatedMinutes: 20,
    difficulty: 3,
  },

  {
    id: "14-generic-middleware-pipeline",
    title: "Generische Middleware-Pipeline",
    prerequisiteLessons: [13, 14],
    scenario:
      "Dein Backend verarbeitet HTTP-Requests durch eine Pipeline: " +
      "Auth-Check -> Rate-Limiting -> Logging -> Handler. Jede Middleware " +
      "kann den Context erweitern (Auth fuegt user hinzu, Rate-Limiter " +
      "fuegt remainingRequests hinzu). Bisher geht beim Erweitern die Typisierung verloren.",
    task:
      "Erstelle eine typsichere Middleware-Pipeline:\n\n" +
      "1. Definiere type Middleware<In, Out> = (ctx: In) => Out\n" +
      "2. Baue eine Pipeline-Klasse die Middlewares verkettet:\n" +
      "   - pipe(mw: Middleware<Current, Next>): Pipeline<Next>\n" +
      "   - execute(initial: First): Last\n" +
      "3. Jede Middleware darf den Context-Typ ERWEITERN\n" +
      "4. Demonstriere mit Auth, Logging, Handler Middlewares",
    starterCode: [
      "// TODO: Middleware<In, Out> Type",
      "// TODO: Pipeline Klasse mit pipe() und execute()",
      "// TODO: Auth, Logging, Handler Middlewares",
      "// TODO: Pipeline zusammenbauen und ausfuehren",
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
      "// result: LoggedContext — voll typisiert!",
    ].join("\n"),
    conceptsBridged: [
      "Builder-aehnliches Typ-Wachstum bei pipe()",
      "Middleware-Architektur (Express/Koa-inspiriert)",
      "Context-Erweiterung durch Intersection-artige Patterns",
      "pipe() und compose() aus L14 Sektion 3",
    ],
    estimatedMinutes: 25,
    difficulty: 4,
  },
];
