# Cheatsheet: Generic Patterns

## Generic Factory Functions

```typescript
// Einfache Factory
function createInstance<T>(Ctor: { new (): T }): T {
  return new Ctor();
}

// Factory mit Argumenten
function create<T>(Ctor: { new (...args: any[]): T }, ...args: any[]): T {
  return new Ctor(...args);
}

// Partial Factory (Defaults + Overrides)
function createWithDefaults<T>(defaults: T): (overrides: Partial<T>) => T {
  return (overrides) => ({ ...defaults, ...overrides });
}
```

---

## Builder Pattern

```typescript
class Builder<T extends Record<string, unknown> = {}> {
  constructor(private data: T = {} as T) {}

  set<K extends string, V>(key: K, value: V): Builder<T & Record<K, V>> {
    return new Builder({ ...this.data, [key]: value } as T & Record<K, V>);
  }

  build(): T { return { ...this.data }; }
}

// Verwendung:
const obj = new Builder()
  .set('name', 'Max')     // Builder<{} & Record<'name', string>>
  .set('age', 30)          // Builder<... & Record<'age', number>>
  .build();                // { name: string; age: number }
```

---

## Generic Collections

```typescript
// Stack (LIFO)
class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  get size(): number { return this.items.length; }
}

// Queue (FIFO)
class Queue<T> {
  private items: T[] = [];
  enqueue(item: T): void { this.items.push(item); }
  dequeue(): T | undefined { return this.items.shift(); }
}

// IndexedCollection (Map-basiert)
class IndexedCollection<T extends { id: string }> {
  private map = new Map<string, T>();
  add(item: T): void { this.map.set(item.id, item); }
  get(id: string): T | undefined { return this.map.get(id); }
}
```

---

## Generic Higher-Order Functions

```typescript
// pipe (links -> rechts, sofortige Ausfuehrung)
function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((v, fn) => fn(v), value);
}

// compose (rechts -> links, gibt Funktion zurueck)
function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C {
  return (a) => f(g(a));
}

// curry (f(a, b) -> f(a)(b))
function curry2<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a) => (b) => fn(a, b);
}
```

---

## Advanced Constraints

```typescript
// Conditional Types
type Result<T> = T extends string ? string : number;

// Recursive Types
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

// DeepPartial (rekursiv)
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// DeepReadonly (rekursiv)
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// const Type Parameters (TS 5.0)
function literal<const T>(value: T): T { return value; }
// literal(['a', 'b']) => readonly ['a', 'b'] (nicht string[])
```

---

## Real-World Patterns

```typescript
// Repository Pattern
interface Repository<T extends { id: string }> {
  findAll(): T[];
  findById(id: string): T | undefined;
  create(data: Omit<T, 'id'>): T;
  update(id: string, data: Partial<Omit<T, 'id'>>): T;
  delete(id: string): boolean;
}

// Typed Event Emitter
class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<string, Function[]>();
  on<K extends keyof Events & string>(
    event: K, handler: (data: Events[K]) => void
  ): void { /* ... */ }
  emit<K extends keyof Events & string>(
    event: K, data: Events[K]
  ): void { /* ... */ }
}

// DI Container mit Phantom Types
class Token<T> { constructor(public name: string) {} }
class Container {
  private map = new Map<string, unknown>();
  register<T>(token: Token<T>, value: T): void {
    this.map.set(token.name, value);
  }
  resolve<T>(token: Token<T>): T {
    return this.map.get(token.name) as T;
  }
}
```

---

## Eselsbruecken

| Konzept | Merksatz |
|---------|---------|
| Factory | "Der Aufrufer bestimmt den Typ, die Factory baut." |
| Builder | "Intersection wachsen lassen — T & Record<K,V> pro Schritt." |
| Stack vs Queue | "Stack = Tellerstapel (LIFO), Queue = Warteschlange (FIFO)." |
| pipe vs compose | "pipe: sofort, links->rechts. compose: spaeter, rechts->links." |
| Conditional Type | "Wie ein Ternary, aber fuer Typen statt Werte." |
| Recursive Type | "Typ referenziert sich selbst — wie Matroschka-Puppen." |
| const T | "Literal-Inferenz ohne as const beim Aufrufer." |
| Phantom Type | "T existiert nur auf Type-Level — keine Laufzeit-Kosten." |
