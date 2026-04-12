/**
 * Lesson 14 — Completion Problems: Generic Patterns
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
    title: "Generic Factory with Constructor",
    description: "Complete the generic factory function.",
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
      { placeholder: "______", answer: "T", hint: "Which type parameter is used for the return type?" },
      { placeholder: "______", answer: "new", hint: "Which keyword comes before the constructor signature?" },
      { placeholder: "______", answer: "new", hint: "How do you call a constructor?" },
      { placeholder: "______", answer: "Logger", hint: "Which class should be instantiated?" },
    ],
    concept: "Generic Factory / Constructor Signature",
  },

  {
    id: "14-cp-stack",
    title: "Stack<T> with push and pop",
    description: "Complete the type-safe stack implementation.",
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
      { placeholder: "______", answer: "T", hint: "Type parameter for the class" },
      { placeholder: "______", answer: "T", hint: "What type does the internal array have?" },
      { placeholder: "______", answer: "T", hint: "What type does the push argument have?" },
      { placeholder: "______", answer: "T | undefined", hint: "What comes out when the stack is empty?" },
      { placeholder: "______", answer: "length", hint: "How do you get the length of an array?" },
      { placeholder: "______", answer: "number", hint: "Which concrete type for this stack?" },
    ],
    concept: "Generic Collection / Stack<T>",
  },

  {
    id: "14-cp-pipe",
    title: "pipe() with Overloads",
    description: "Complete the type-safe pipe function.",
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
      { placeholder: "______", answer: "A", hint: "Which type goes into f1?" },
      { placeholder: "______", answer: "B", hint: "What does the first overload return?" },
      { placeholder: "______", answer: "B", hint: "The output of f1 goes into f2 — which type?" },
      { placeholder: "______", answer: "C", hint: "What does f2 return?" },
      { placeholder: "______", answer: "reduce", hint: "Which array method chains functions?" },
    ],
    concept: "pipe() / Function Overloads",
  },

  {
    id: "14-cp-const-type-param",
    title: "const Type Parameter (TS 5.0)",
    description: "Use const type parameters for literal inference.",
    template: `function defineRoutes<______ T extends Record<string, string>>(
  routes: T
): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
});
// routes.home has type ______ (not string!)

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
// routes.home has type "/" (not string!)

type RouteName = keyof typeof routes;
// "home" | "about"`,
    blanks: [
      { placeholder: "______", answer: "const", hint: "Which keyword before T enforces literal inference?" },
      { placeholder: "______", answer: "\"/\"", hint: "What literal type does home have thanks to const T?" },
      { placeholder: "______", answer: "keyof", hint: "Which operator extracts the keys of a type?" },
    ],
    concept: "const Type Parameters / Literal Inference",
  },

  {
    id: "14-cp-event-emitter",
    title: "TypedEventEmitter with Interface Map",
    description: "Complete the type-safe Event Emitter.",
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
      { placeholder: "______", answer: "unknown", hint: "Which type allows arbitrary values in the event map?" },
      { placeholder: "______", answer: "keyof", hint: "How do you constrain K to the keys of Events?" },
      { placeholder: "______", answer: "Events[K]", hint: "How do you look up the payload type for key K?" },
      { placeholder: "______", answer: "K", hint: "Which type index is used for the payload?" },
    ],
    concept: "TypedEventEmitter / Mapped Constraints",
  },

  {
    id: "14-cp-repository",
    title: "Generic Repository with CRUD",
    description: "Complete the generic repository interface.",
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

// create takes: { name: string; email: string } — WITHOUT id!`,
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
      { placeholder: "______", answer: "Entity", hint: "Which interface must T extend?" },
      { placeholder: "______", answer: "undefined", hint: "What if the id does not exist?" },
      { placeholder: "______", answer: "Omit", hint: "Which utility type removes properties?" },
      { placeholder: "______", answer: "Partial", hint: "Which utility type makes everything optional?" },
    ],
    concept: "Repository Pattern / Utility Types",
  },
];