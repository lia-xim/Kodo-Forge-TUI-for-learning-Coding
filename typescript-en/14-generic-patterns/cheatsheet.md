# Cheatsheet: Generic Patterns

## Generic Factory Functions

```typescript
// Simple factory
function createInstance<T>(Ctor: { new (): T }): T {
  return new Ctor();
}

// Factory with arguments
function create<T>(Ctor: { new (...args: any[]): T }, ...args: any[]): T {
  return new Ctor(...args);
}

// Partial factory (defaults + overrides)
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

// Usage:
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

// IndexedCollection (map-based)
class IndexedCollection<T extends { id: string }> {
  private map = new Map<string, T>();
  add(item: T): void { this.map.set(item.id, item); }
  get(id: string): T | undefined { return this.map.get(id); }
}
```

---

## Generic Higher-Order Functions

```typescript
// pipe (left -> right, immediate execution)
function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((v, fn) => fn(v), value);
}

// compose (right -> left, returns a function)
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

// DeepPartial (recursive)
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// DeepReadonly (recursive)
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// const Type Parameters (TS 5.0)
function literal<const T>(value: T): T { return value; }
// literal(['a', 'b']) => readonly ['a', 'b'] (not string[])
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

// DI Container with Phantom Types
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

## Memory Aids

| Concept | Mnemonic |
|---------|---------|
| Factory | "The caller determines the type, the factory builds it." |
| Builder | "Grow intersections — T & Record<K,V> per step." |
| Stack vs Queue | "Stack = plate stack (LIFO), Queue = waiting line (FIFO)." |
| pipe vs compose | "pipe: immediate, left->right. compose: deferred, right->left." |
| Conditional Type | "Like a ternary, but for types instead of values." |
| Recursive Type | "Type references itself — like Russian nesting dolls." |
| const T | "Literal inference without as const at the call site." |
| Phantom Type | "T exists only at the type level — no runtime cost." |