/**
 * Lektion 14 — Debugging Challenges: Generic Patterns
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L14-D1",
    title: "Builder gibt this zurueck statt neue Instanz",
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
      "// Typ scheint korrekt, aber internes State-Sharing bei mehreren Builds!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 6,
    options: [
      "Builder gibt this zurueck — bei mehrfachem Gebrauch teilen sich Instanzen den State",
      "set() braucht keinen Typparameter K",
      "build() sollte T | undefined zurueckgeben",
      "Der Typparameter = {} ist falsch",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn du denselben Builder fuer zwei verschiedene Objekte verwendest?",
      "this mutieren und zurueckgeben = Seiteneffekte. Ein neuer Builder pro set() = sicher.",
      "Erstelle in set() einen neuen Builder mit dem erweiterten data-Objekt.",
    ],
    fixedCode: [
      "set<K extends string, V>(key: K, value: V): Builder<T & Record<K, V>> {",
      "  return new Builder({ ...this.data, [key]: value } as T & Record<K, V>);",
      "}",
    ].join("\n"),
    explanation:
      "Wenn set() `this` zurueckgibt, teilen sich alle Aufrufe denselben " +
      "internen State. Ein Immutable Builder erstellt bei jedem set() eine " +
      "neue Instanz — sicher und korrekt typisiert.",
    concept: "immutable-builder-pattern",
    difficulty: 4,
  },

  {
    id: "L14-D2",
    title: "pipe() mit falschem Typ in der Kette",
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
      "Ein einziger Typparameter T erzwingt denselben Typ fuer alle Schritte — pipe braucht Overloads",
      "pipe braucht async",
      "reduce funktioniert nicht mit Generics",
      "s.length gibt keinen String zurueck",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat T in diesem pipe-Aufruf?",
      "T = string. Aber s.length gibt number zurueck — das passt nicht zu (v: T) => T.",
      "Loesung: Overloads mit separaten Typparametern pro Schritt.",
    ],
    fixedCode: [
      "function pipe<A, B>(v: A, f1: (a: A) => B): B;",
      "function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;",
      "function pipe(value: unknown, ...fns: Function[]): unknown {",
      "  return fns.reduce((v, fn) => fn(v), value);",
      "}",
    ].join("\n"),
    explanation:
      "Ein einziger Typparameter T erzwingt dass Input und Output JEDER " +
      "Funktion identisch sind. Echtes pipe braucht Overloads mit " +
      "verschiedenen Typparametern (A -> B -> C) fuer Typ-Transitions.",
    concept: "pipe-overloads-type-transitions",
    difficulty: 3,
  },

  {
    id: "L14-D3",
    title: "Event Emitter ohne Typ-Verknuepfung",
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
      'emitter.on("usr:login", (data) => { /* Tippfehler! */ });',
      'emitter.emit("user:login", { wrong: true }); // Falscher Payload!',
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 4,
    options: [
      "Ohne generisches Events-Interface gibt es keine Typpruefung fuer Event-Namen und Payloads",
      "on() muss async sein",
      "Map kann keine Strings als Keys verwenden",
      "Function ist ein gueltiger Handler-Typ",
    ],
    correctOption: 0,
    hints: [
      "Wuerde TypeScript den Tippfehler 'usr:login' erkennen?",
      "Nein — string akzeptiert jeden String. Ein generisches Events-Interface wuerde helfen.",
      "TypedEventEmitter<Events> mit on<K extends keyof Events>(...) erzwingt gueltige Namen und Payloads.",
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
      "String-basierte APIs sind fehleranfaellig: Tippfehler in Event-Namen " +
      "und falsche Payloads werden nicht erkannt. Ein generisches Events-Interface " +
      "verknuepft Event-Namen mit ihren Payload-Typen — beides wird validiert.",
    concept: "typed-event-emitter",
    difficulty: 3,
  },

  {
    id: "L14-D4",
    title: "DI Container resolve gibt unknown zurueck",
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
      "// db.query('...'); // Error! db ist unknown",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Ohne Token<T> gibt resolve() unknown zurueck — der Typ geht verloren",
      "Container braucht einen Typparameter",
      "bind() muss den Typ speichern",
      "resolve() sollte any zurueckgeben",
    ],
    correctOption: 0,
    hints: [
      "Welchen Typ hat db nach resolve()?",
      "unknown — weil resolve() nur einen String-Key hat und keinen Typ-Zusammenhang.",
      "Loesung: Token<T> als typisierter Schluessel. resolve<T>(token: Token<T>): T.",
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
      "const db = c.resolve(DB); // Typ: Database",
    ].join("\n"),
    explanation:
      "String-Keys verlieren die Typinformation. Token<T> ist ein Phantom-Type-Traeger: " +
      "Token<Database> verknuepft den Schluessel mit dem Service-Typ. " +
      "resolve() kann T aus dem Token ableiten — kein Cast noetig.",
    concept: "di-container-phantom-types",
    difficulty: 4,
  },

  {
    id: "L14-D5",
    title: "Repository create akzeptiert id im Argument",
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
      "repo.create({ id: '999', name: 'Hack' }); // id wird ueberschrieben!",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 8,
    options: [
      "Partial<T> erlaubt id — Omit<T, 'id'> wuerde id ausschliessen und die Auto-Generierung schuetzen",
      "create() braucht async",
      "Partial macht alle Felder optional — name koennte fehlen",
      "as T ist falsch",
    ],
    correctOption: 0,
    hints: [
      "Welche Properties erlaubt Partial<User>?",
      "Partial<User> = { id?: string; name?: string; email?: string } — auch id!",
      "Omit<T, 'id'> entfernt id komplett. Der Aufrufer KANN sie nicht setzen.",
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
      "Partial<T> macht alle Properties optional — auch id. Der Aufrufer " +
      "koennte eine eigene id mitsenden die dann ueberschrieben wird. " +
      "Omit<T, 'id'> entfernt die id-Property komplett aus dem Parameter-Typ. " +
      "Das schuetzt die automatische ID-Generierung.",
    concept: "repository-omit-pattern",
    difficulty: 3,
  },
];
