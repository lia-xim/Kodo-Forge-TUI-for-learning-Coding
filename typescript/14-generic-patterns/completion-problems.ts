/**
 * Lektion 14 — Completion Problems: Generic Patterns
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  {
    id: "14-cp-generic-factory",
    title: "Generic Factory mit Constructor",
    description: "Vervollstaendige die generische Factory-Funktion.",
    template: `function createInstance<______>(
  Ctor: { ______ (): T }
): T {
  return ______ Ctor();
}

class Logger {
  log(msg: string) { console.log(msg); }
}

const logger = createInstance(______);
logger.log("Hello!");`,
    solution: `function createInstance<T>(
  Ctor: { new (): T }
): T {
  return new Ctor();
}

class Logger {
  log(msg: string) { console.log(msg); }
}

const logger = createInstance(Logger);
logger.log("Hello!");`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "Welcher Typparameter wird fuer den Rueckgabetyp verwendet?" },
      { placeholder: "______", answer: "new", hint: "Welches Keyword steht vor der Constructor Signature?" },
      { placeholder: "______", answer: "new", hint: "Wie ruft man einen Konstruktor auf?" },
      { placeholder: "______", answer: "Logger", hint: "Welche Klasse soll instanziiert werden?" },
    ],
    concept: "Generic Factory / Constructor Signature",
  },

  {
    id: "14-cp-stack",
    title: "Stack<T> mit push und pop",
    description: "Vervollstaendige die typsichere Stack-Implementierung.",
    template: `class Stack<______> {
  private items: ______[] = [];

  push(item: ______): void {
    this.items.push(item);
  }

  pop(): ______ {
    return this.items.pop();
  }

  get size(): number {
    return this.items.______;
  }
}

const stack = new Stack<______>();
stack.push(42);`,
    solution: `class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  get size(): number {
    return this.items.length;
  }
}

const stack = new Stack<number>();
stack.push(42);`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "Typparameter fuer die Klasse" },
      { placeholder: "______", answer: "T", hint: "Welchen Typ hat das interne Array?" },
      { placeholder: "______", answer: "T", hint: "Welchen Typ hat das push-Argument?" },
      { placeholder: "______", answer: "T | undefined", hint: "Was kommt raus wenn der Stack leer ist?" },
      { placeholder: "______", answer: "length", hint: "Wie bekommt man die Laenge eines Arrays?" },
      { placeholder: "______", answer: "number", hint: "Welcher konkrete Typ fuer diesen Stack?" },
    ],
    concept: "Generic Collection / Stack<T>",
  },

  {
    id: "14-cp-pipe",
    title: "pipe() mit Overloads",
    description: "Vervollstaendige die typsichere pipe-Funktion.",
    template: `function pipe<A, B>(v: A, f1: (a: ______) => B): ______;
function pipe<A, B, C>(
  v: A,
  f1: (a: A) => B,
  f2: (b: ______) => ______
): C;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.______((_v, fn) => fn(_v), value);
}

const result = pipe(
  "hello",
  (s) => s.length,
  (n) => n > 3
);`,
    solution: `function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(
  v: A,
  f1: (a: A) => B,
  f2: (b: B) => C
): C;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((_v, fn) => fn(_v), value);
}

const result = pipe(
  "hello",
  (s) => s.length,
  (n) => n > 3
);`,
    blanks: [
      { placeholder: "______", answer: "A", hint: "Welcher Typ geht in f1 rein?" },
      { placeholder: "______", answer: "B", hint: "Was gibt die erste Overload zurueck?" },
      { placeholder: "______", answer: "B", hint: "Der Output von f1 geht in f2 — welcher Typ?" },
      { placeholder: "______", answer: "C", hint: "Was gibt f2 zurueck?" },
      { placeholder: "______", answer: "reduce", hint: "Welche Array-Methode kettet Funktionen?" },
    ],
    concept: "pipe() / Function Overloads",
  },

  {
    id: "14-cp-const-type-param",
    title: "const Type Parameter (TS 5.0)",
    description: "Verwende const Type Parameters fuer Literal-Inferenz.",
    template: `function defineRoutes<______ T extends Record<string, string>>(
  routes: T
): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
});
// routes.home hat Typ ______ (nicht string!)

type RouteName = ______ typeof routes;
// "home" | "about"`,
    solution: `function defineRoutes<const T extends Record<string, string>>(
  routes: T
): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
});
// routes.home hat Typ "/" (nicht string!)

type RouteName = keyof typeof routes;
// "home" | "about"`,
    blanks: [
      { placeholder: "______", answer: "const", hint: "Welches Keyword vor T erzwingt Literal-Inferenz?" },
      { placeholder: "______", answer: "\"/\"", hint: "Welchen Literal-Typ hat home dank const T?" },
      { placeholder: "______", answer: "keyof", hint: "Welcher Operator extrahiert die Keys eines Typs?" },
    ],
    concept: "const Type Parameters / Literal Inference",
  },

  {
    id: "14-cp-event-emitter",
    title: "TypedEventEmitter mit Interface-Map",
    description: "Vervollstaendige den typsicheren Event Emitter.",
    template: `interface AppEvents {
  "user:login": { userId: string };
  "error": { message: string; code: number };
}

class Emitter<Events extends Record<string, ______>> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends ______ Events & string>(
    event: K,
    handler: (data: ______) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof Events & string>(
    event: K,
    data: Events[______]
  ): void {
    this.listeners.get(event)?.forEach(h => h(data));
  }
}`,
    solution: `interface AppEvents {
  "user:login": { userId: string };
  "error": { message: string; code: number };
}

class Emitter<Events extends Record<string, unknown>> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof Events & string>(
    event: K,
    handler: (data: Events[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof Events & string>(
    event: K,
    data: Events[K]
  ): void {
    this.listeners.get(event)?.forEach(h => h(data));
  }
}`,
    blanks: [
      { placeholder: "______", answer: "unknown", hint: "Welcher Typ erlaubt beliebige Werte in der Event-Map?" },
      { placeholder: "______", answer: "keyof", hint: "Wie schraenkt man K auf die Keys von Events ein?" },
      { placeholder: "______", answer: "Events[K]", hint: "Wie schlaegt man den Payload-Typ fuer Key K nach?" },
      { placeholder: "______", answer: "K", hint: "Welcher Typ-Index wird fuer den Payload verwendet?" },
    ],
    concept: "TypedEventEmitter / Mapped Constraints",
  },

  {
    id: "14-cp-repository",
    title: "Generic Repository mit CRUD",
    description: "Vervollstaendige das generische Repository-Interface.",
    template: `interface Entity {
  id: string;
}

interface Repository<T extends ______> {
  findAll(): T[];
  findById(id: string): T | ______;
  create(data: ______<T, "id">): T;
  update(id: string, data: ______<Omit<T, "id">>): T;
  delete(id: string): boolean;
}

interface User extends Entity {
  name: string;
  email: string;
}

// create nimmt: { name: string; email: string } — OHNE id!`,
    solution: `interface Entity {
  id: string;
}

interface Repository<T extends Entity> {
  findAll(): T[];
  findById(id: string): T | undefined;
  create(data: Omit<T, "id">): T;
  update(id: string, data: Partial<Omit<T, "id">>): T;
  delete(id: string): boolean;
}

interface User extends Entity {
  name: string;
  email: string;
}`,
    blanks: [
      { placeholder: "______", answer: "Entity", hint: "Welches Interface muss T erweitern?" },
      { placeholder: "______", answer: "undefined", hint: "Was wenn die id nicht existiert?" },
      { placeholder: "______", answer: "Omit", hint: "Welcher Utility Type entfernt Properties?" },
      { placeholder: "______", answer: "Partial", hint: "Welcher Utility Type macht alles optional?" },
    ],
    concept: "Repository Pattern / Utility Types",
  },
];
