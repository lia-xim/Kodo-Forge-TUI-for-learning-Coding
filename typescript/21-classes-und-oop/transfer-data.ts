/**
 * Lektion 21 — Transfer Tasks: Classes & OOP
 *
 * Wende Klassen-Konzepte in neuen Kontexten an:
 *  1. Plugin-System mit Abstract Classes und Interfaces
 *  2. State Machine mit Vererbung und Polymorphie
 *  3. Event Emitter mit Generics und Composition
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Plugin-System ────────────────────────────────────────────
  {
    id: "21-plugin-system",
    title: "Typsicheres Plugin-System",
    prerequisiteLessons: [21, 13],
    scenario:
      "Du baust ein CLI-Tool das Plugins laden soll. Jedes Plugin muss " +
      "eine init()-Methode haben (wird beim Laden aufgerufen) und eine " +
      "execute()-Methode (wird bei der Ausfuehrung aufgerufen). " +
      "Manche Plugins brauchen ein Cleanup (optional). " +
      "Das System soll typsicher sein und neue Plugins ohne Aenderung " +
      "am Core-Code ermoeglichen.",
    task:
      "Baue ein Plugin-System mit Abstract Classes und/oder Interfaces.\n\n" +
      "1. Definiere ein Interface 'Plugin' mit init(), execute(input: string): string\n" +
      "2. Erstelle eine Abstract Class 'BasePlugin' mit Default-Implementierung " +
      "   fuer init() und optionalem cleanup()\n" +
      "3. Implementiere zwei konkrete Plugins: UpperPlugin und ReversePlugin\n" +
      "4. Schreibe einen PluginManager, der Plugins registriert und ausfuehrt\n" +
      "5. Ueberlege: Wann Interface, wann Abstract Class?",
    starterCode: [
      "// Plugin-Interface oder Abstract Class?",
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
      "// Interface fuer den Vertrag",
      "interface Plugin {",
      "  name: string;",
      "  init(): void;",
      "  execute(input: string): string;",
      "  cleanup?(): void;",
      "}",
      "",
      "// Abstract Class fuer gemeinsamen Code",
      "abstract class BasePlugin implements Plugin {",
      "  abstract name: string;",
      "",
      "  init(): void {",
      "    console.log(`Plugin '${this.name}' initialisiert`);",
      "  }",
      "",
      "  abstract execute(input: string): string;",
      "",
      "  cleanup(): void {",
      "    console.log(`Plugin '${this.name}' aufgeraeumt`);",
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
      "    if (!plugin) throw new Error(`Plugin '${name}' nicht gefunden`);",
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
      "// Nutzung:",
      "// const pm = new PluginManager();",
      "// pm.register(new UpperPlugin());",
      "// pm.register(new ReversePlugin());",
      "// pm.execute('upper', 'hello'); // 'HELLO'",
      "// pm.execute('reverse', 'hello'); // 'olleh'",
    ].join("\n"),
    conceptsBridged: [
      "Abstract Classes",
      "Interface-Implementation",
      "Composition",
      "Factory/Registry Pattern",
    ],
    hints: [
      "Definiere zuerst den Vertrag (Interface), dann gemeinsamen Code (Abstract Class), dann konkrete Plugins.",
      "Der PluginManager nutzt Composition: Er ENTHAELT Plugins, erbt nicht von ihnen.",
      "Abstract Class fuer Default-init()/cleanup(), Interface fuer den Vertrag den der PluginManager kennt.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: State Machine ────────────────────────────────────────────
  {
    id: "21-state-machine",
    title: "Typsichere State Machine mit Klassen",
    prerequisiteLessons: [21, 12],
    scenario:
      "Du baust ein Bestell-System. Eine Bestellung durchlaeuft Zustaende: " +
      "Created → Paid → Shipped → Delivered (oder Cancelled). " +
      "Nicht jeder Uebergang ist erlaubt: Eine versendete Bestellung " +
      "kann nicht mehr storniert werden. Aktuell gibt es keine " +
      "Typsicherheit — falsche Uebergaenge fallen erst zur Laufzeit auf.",
    task:
      "Modelliere eine State Machine mit Klassen.\n\n" +
      "1. Erstelle eine Abstract Class 'OrderState' mit abstrakten Methoden " +
      "   fuer erlaubte Uebergaenge\n" +
      "2. Implementiere konkrete Zustaende: Created, Paid, Shipped, Delivered, Cancelled\n" +
      "3. Jeder Zustand definiert, welche Uebergaenge moeglich sind\n" +
      "4. Erstelle eine Order-Klasse, die den aktuellen Zustand haelt\n" +
      "5. Nutze TypeScript, um ungueltige Uebergaenge zur Compilezeit zu verhindern",
    starterCode: [
      "// Welche Uebergaenge sind erlaubt?",
      "// Created → Paid, Cancelled",
      "// Paid → Shipped, Cancelled",
      "// Shipped → Delivered",
      "// Delivered → (keine)",
      "// Cancelled → (keine)",
      "",
      "abstract class OrderState {",
      "  abstract readonly name: string;",
      "  // TODO: Uebergangs-Methoden",
      "}",
      "",
      "class Order {",
      "  // TODO: State halten und Uebergaenge delegieren",
      "}",
    ].join("\n"),
    solutionCode: [
      "abstract class OrderState {",
      "  abstract readonly name: string;",
      "",
      "  pay(): OrderState {",
      "    throw new Error(`Kann nicht bezahlen im Zustand '${this.name}'`);",
      "  }",
      "  ship(): OrderState {",
      "    throw new Error(`Kann nicht versenden im Zustand '${this.name}'`);",
      "  }",
      "  deliver(): OrderState {",
      "    throw new Error(`Kann nicht liefern im Zustand '${this.name}'`);",
      "  }",
      "  cancel(): OrderState {",
      "    throw new Error(`Kann nicht stornieren im Zustand '${this.name}'`);",
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
      "// order.cancel();  // Error: Kann nicht stornieren im Zustand 'Delivered'",
    ].join("\n"),
    conceptsBridged: [
      "Abstract Classes",
      "Polymorphie (State Pattern)",
      "override",
      "Komposition (Order hat State)",
    ],
    hints: [
      "Das State Pattern: Jeder Zustand ist eine eigene Klasse. Erlaubte Uebergaenge sind ueberschriebene Methoden.",
      "Die Basis-Klasse wirft Fehler fuer alle Uebergaenge. Subklassen ueberschreiben nur die ERLAUBTEN.",
      "Order delegiert alle Aktionen an den aktuellen State — das ist Komposition.",
    ],
    difficulty: 4,
  },

  // ─── Task 3: Event Emitter ────────────────────────────────────────────
  {
    id: "21-event-emitter",
    title: "Typsicherer Event Emitter mit Generics",
    prerequisiteLessons: [21, 13, 16],
    scenario:
      "Dein Team braucht ein internes Event-System. Die aktuelle Loesung " +
      "nutzt 'any' fuer Event-Daten — niemand weiss, welche Events es " +
      "gibt und welche Daten sie tragen. Letzte Woche hat jemand " +
      "'user-login' statt 'userLogin' getippt und der Listener wurde " +
      "nie aufgerufen.",
    task:
      "Baue einen typsicheren Event Emitter.\n\n" +
      "1. Definiere eine EventMap als Interface (Event-Name → Daten-Typ)\n" +
      "2. Erstelle eine generische Klasse TypedEventEmitter<T extends EventMap>\n" +
      "3. Methoden: on(event, callback), emit(event, data), off(event, callback)\n" +
      "4. TypeScript soll falsche Event-Namen und falsche Daten-Typen zur " +
      "   Compilezeit erkennen\n" +
      "5. Nutze Composition statt Vererbung fuer die Einbindung in andere Klassen",
    starterCode: [
      "// Event-Map: Welche Events gibt es und welche Daten tragen sie?",
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
      "// Event-Map definiert alle Events und ihre Daten-Typen",
      "interface AppEvents {",
      "  userLogin: { userId: string; timestamp: Date };",
      "  userLogout: { userId: string };",
      "  error: { message: string; code: number };",
      "}",
      "",
      "// Generischer Event Emitter",
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
      "// Nutzung mit voller Typsicherheit:",
      "// const events = new TypedEventEmitter<AppEvents>();",
      "// events.on('userLogin', data => {",
      "//   console.log(data.userId);    // OK: string",
      "//   console.log(data.timestamp); // OK: Date",
      "// });",
      "// events.emit('userLogin', { userId: '42', timestamp: new Date() }); // OK",
      "// events.emit('userLogin', { userId: 42 }); // FEHLER: number statt string",
      "// events.emit('typo', {}); // FEHLER: 'typo' ist kein gueltiges Event",
      "",
      "// Composition: Event Emitter in einer anderen Klasse nutzen",
      "// class UserService {",
      "//   readonly events = new TypedEventEmitter<AppEvents>();",
      "//   login(userId: string) {",
      "//     this.events.emit('userLogin', { userId, timestamp: new Date() });",
      "//   }",
      "// }",
    ].join("\n"),
    conceptsBridged: [
      "Generics mit Klassen",
      "Mapped Types fuer Listener-Map",
      "Keyof + Index Access Types",
      "Composition (Emitter in Service)",
    ],
    hints: [
      "Die Event-Map (Interface) definiert alle Events und ihre Daten-Typen. Der Emitter ist generisch ueber diese Map.",
      "Nutze 'K extends keyof TEvents' als Typ-Parameter fuer on/emit/off. Dann kann TypeScript den Daten-Typ ableiten.",
      "Composition: Statt 'class UserService extends TypedEventEmitter' besser 'class UserService { events = new TypedEventEmitter<...>() }'.",
    ],
    difficulty: 5,
  },
];
