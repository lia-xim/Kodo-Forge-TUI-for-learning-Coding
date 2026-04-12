# Section 2: Generic Collections

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Generic Factories](./01-generic-factories.md)
> Next section: [03 - Generic Higher-Order Functions](./03-generic-hof.md)

---

## What you'll learn here

- Why type-safe data structures are better than `any[]`
- Implementing `Stack<T>` (Last In, First Out)
- Implementing `Queue<T>` (First In, First Out)
- `LinkedList<T>` as a linked list with iterator support
- Constrained collections: only allowing types with certain properties

---

## Background: Why Java fought generics and what TypeScript learned from it

In 2004, Java added generics to the language — and created one of the largest
backward-compatibility compromises in programming history. Java generics are
implemented through "type erasure": `List<String>` and `List<Integer>` are the
same object at runtime. This still limits what Java generics can do today.

TypeScript doesn't have this problem, because TypeScript types are ALWAYS
erased — there is no runtime representation. But the result is the same:
type-safe collections that are fully checked at compile time, yet produce
efficient, lean JavaScript at runtime.

You can see the result in every major TypeScript codebase: Angular Material's
`DataSource<T>`, RxJS's `Subject<T>` and `BehaviorSubject<T>`, NgRx's
`Store<State>` — at their core they are all type-safe collections that use
generics to ensure that what goes in also comes out in a type-safe way.

---

## The problem: Untyped containers

JavaScript has only arrays and maps as built-in data structures. Both are
dynamic — you can throw anything into them:

```typescript annotated
const stack: unknown[] = [];
stack.push(42);
stack.push("oops");   // No error!
stack.push(true);     // Neither. Chaos guaranteed.

const value = stack.pop();
// ^ Type: unknown — no help from the compiler
```

This is like a warehouse without labels: everything goes in, but nobody knows
what comes out. Generics are the labels.

---

## Stack\<T\> — Last In, First Out

A stack is like a pile of books: the last book placed on top is the first one
taken off. In computer science: **LIFO** (Last In, First Out).

```typescript annotated
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Iterator: for...of support
  *[Symbol.iterator](): Iterator<T> {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
}
```

Usage:

```typescript annotated
const numbers = new Stack<number>();
numbers.push(10);
numbers.push(20);
numbers.push(30);

console.log(numbers.pop());  // 30 — Type: number | undefined
console.log(numbers.peek()); // 20 — looks only, does not remove

// Also works with complex types:
interface UndoAction {
  type: string;
  payload: unknown;
  timestamp: Date;
}

const undoStack = new Stack<UndoAction>();
undoStack.push({ type: "DELETE", payload: { id: 42 }, timestamp: new Date() });
```

> 🧠 **Explain it to yourself:** Why does `pop()` return the type `T | undefined`
> instead of just `T`? What happens with an empty stack?
> **Key points:** An empty stack has nothing to return | undefined signals "nothing there" | Without undefined you'd have to throw an exception or lie

> 💭 **Think about it:** Browser history, the call stack in the debugger, undo/redo in
> every editor — they're all stacks. But Angular and React often implement
> undo history with a `UndoAction[]` array instead of a stack class.
> What advantage does a typed `Stack<T>` class have over a plain array when
> you call `pop()` on an empty array?

---

## Queue\<T\> — First In, First Out

A queue is like a waiting line: first come, first served.
**FIFO** (First In, First Out).

```typescript annotated
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  front(): T | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): readonly T[] {
    return [...this.items];
  }
}
```

A practical example — a type-safe message queue:

```typescript annotated
interface Message {
  from: string;
  body: string;
  priority: "low" | "normal" | "high";
}

const inbox = new Queue<Message>();
inbox.enqueue({ from: "Alice", body: "Hello!", priority: "normal" });
inbox.enqueue({ from: "Bob", body: "Urgent!", priority: "high" });

const next = inbox.dequeue();
if (next) {
  console.log(`[${next.priority}] ${next.from}: ${next.body}`);
  // Full type safety and autocompletion after the if-check
}
```

> ⚡ **Angular connection:** `HttpClient` uses a queue internally for
> outgoing requests. When you make multiple `this.http.get<User[]>()` calls
> in an Angular service, they are managed in an internal queue. The generic
> `<User[]>` ensures that the `Observable` stream emits exactly the right
> type — no casts needed.

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> class Queue<T> {
>   private items: T[] = [];
>   enqueue(item: T): void { this.items.push(item); }
>   dequeue(): T | undefined { return this.items.shift(); }
> }
>
> // Create a Queue<number> and a Queue<string>
> const numQ = new Queue<number>();
> const strQ = new Queue<string>();
>
> numQ.enqueue(42);
> // What happens if you try: numQ.enqueue("oops")?
> // What is the type of numQ.dequeue()?
> // Compare: what would the type be if you used Queue<unknown>?
> ```
> Test both variants and observe the compiler errors.

---

## LinkedList\<T\> — Linked list

A linked list stores elements as chained nodes. Each node knows only its
successor. This sounds cumbersome, but has advantages: inserting at the
beginning is O(1) instead of O(n) like arrays.

```typescript annotated
// The node is itself generic:
class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null
  ) {}
}

class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private _size = 0;

  prepend(value: T): void {
    this.head = new ListNode(value, this.head);
    this._size++;
  }

  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this._size++;
  }

  removeFirst(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    this._size--;
    return value;
  }

  find(predicate: (value: T) => boolean): T | undefined {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) return current.value;
      current = current.next;
    }
    return undefined;
  }

  get size(): number { return this._size; }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}
```

```typescript annotated
const users = new LinkedList<{ name: string; age: number }>();
users.append({ name: "Alice", age: 30 });
users.append({ name: "Bob", age: 25 });

const bob = users.find(u => u.name === "Bob");
// ^ Type: { name: string; age: number } | undefined

for (const user of users) {
  console.log(user.name); // Full autocompletion
}
```

> 📖 **Background: Generator methods and the iterator protocol**
>
> The `*[Symbol.iterator]()` method implements the JavaScript iterator
> protocol. The `*` makes it a generator function — it can "pause and deliver"
> values with `yield`. TypeScript infers the type `Iterator<T>` automatically.
> This makes `for...of` work on any class that implements this protocol —
> including the Stack and Queue above. In Angular you use the same protocol
> when combining `async/await` with iterables in services.

---

## Constrained Collections

Sometimes a collection should only accept certain types — for example, only
objects with an `id` property:

```typescript annotated
class IndexedCollection<T extends { id: string | number }> {
  private items = new Map<string | number, T>();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  get(id: string | number): T | undefined {
    return this.items.get(id);
  }

  remove(id: string | number): boolean {
    return this.items.delete(id);
  }

  findAll(predicate: (item: T) => boolean): T[] {
    return [...this.items.values()].filter(predicate);
  }
}

interface Product { id: number; name: string; price: number }

const products = new IndexedCollection<Product>();
products.add({ id: 1, name: "Laptop", price: 999 });

const laptop = products.get(1);
// ^ Type: Product | undefined
```

> **Why `T extends { id: ... }`?** The constraint ensures that EVERY
> element has an `id`. Without the constraint you could create `IndexedCollection<string>`
> — which makes no sense, because strings have no `.id`.

> ⚡ **React connection:** In React projects with Redux or Zustand you'll get to
> know normalized state structures: `entities: Record<string, User>`.
> This is conceptually identical to `IndexedCollection<User>`. The constraint
> `T extends { id: string }` corresponds to the NgRx pattern where all entities
> must have an `id` field for the `EntityAdapter` to work.

---

## What you learned

- Generic collections preserve the type of the element from creation to retrieval
- `Stack<T>` implements LIFO and returns `undefined` when the stack is empty
- `Queue<T>` implements FIFO — useful for messages, events, requests
- `LinkedList<T>` linked nodes are themselves generic: `ListNode<T>`
- The iterator protocol (`*[Symbol.iterator]`) makes custom collections compatible with `for...of`
- Constraints (`T extends { id: ... }`) restrict which types a collection accepts

**Core concept:** A generic collection is more than a typed array —
it enforces invariants (LIFO/FIFO/ID existence) AND guarantees the type at
every operation. Both together make the difference from `any[]`.

---

> **Pause point** — Collections are the foundation for data processing.
> Next up: functional patterns and HOFs.
>
> Continue with: [Section 03 — Generic Higher-Order Functions](./03-generic-hof.md)