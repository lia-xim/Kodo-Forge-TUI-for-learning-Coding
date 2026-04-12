/**
 * Lektion 14 - Example 02: Generic Collections
 *
 * Ausfuehren mit: npx tsx examples/02-generic-collections.ts
 *
 * Stack<T>, Queue<T>, LinkedList<T> und IndexedCollection<T>.
 */

// ─── STACK<T> ───────────────────────────────────────────────────────────────

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

  *[Symbol.iterator](): Iterator<T> {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
}

// Stack mit Zahlen:
const numStack = new Stack<number>();
numStack.push(10);
numStack.push(20);
numStack.push(30);
console.log("Stack peek:", numStack.peek());  // 30
console.log("Stack pop:", numStack.pop());    // 30
console.log("Stack size:", numStack.size);    // 2

// Stack iterieren (LIFO-Reihenfolge):
numStack.push(40);
console.log("Stack items:");
for (const item of numStack) {
  console.log(" ", item); // 40, 20, 10
}

// ─── QUEUE<T> ───────────────────────────────────────────────────────────────

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

// Queue mit Nachrichten:
interface Message {
  from: string;
  body: string;
  priority: "low" | "normal" | "high";
}

const inbox = new Queue<Message>();
inbox.enqueue({ from: "Alice", body: "Hallo!", priority: "normal" });
inbox.enqueue({ from: "Bob", body: "Dringend!", priority: "high" });
inbox.enqueue({ from: "Charlie", body: "FYI", priority: "low" });

console.log("\nNachrichten verarbeiten:");
while (!inbox.isEmpty()) {
  const msg = inbox.dequeue()!;
  console.log(`  [${msg.priority}] ${msg.from}: ${msg.body}`);
}

// ─── LINKED LIST<T> ────────────────────────────────────────────────────────

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

  get size(): number {
    return this._size;
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

// LinkedList mit Objekten:
interface Task {
  id: number;
  title: string;
  done: boolean;
}

const tasks = new LinkedList<Task>();
tasks.append({ id: 1, title: "Code schreiben", done: false });
tasks.append({ id: 2, title: "Tests laufen lassen", done: false });
tasks.prepend({ id: 3, title: "Kaffee holen", done: true });

console.log("\nAufgaben:");
for (const task of tasks) {
  const status = task.done ? "[x]" : "[ ]";
  console.log(`  ${status} #${task.id}: ${task.title}`);
}

const undone = tasks.find(t => !t.done);
console.log("Naechste offene:", undone?.title);

// ─── INDEXED COLLECTION<T> ──────────────────────────────────────────────────

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

  get size(): number {
    return this.items.size;
  }
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

const products = new IndexedCollection<Product>();
products.add({ id: 1, name: "Laptop", price: 999, category: "electronics" });
products.add({ id: 2, name: "Maus", price: 29, category: "electronics" });
products.add({ id: 3, name: "Buch", price: 15, category: "books" });

console.log("\nProdukte:");
const laptop = products.get(1);
console.log("  Laptop:", laptop?.name, laptop?.price);

const cheap = products.findAll(p => p.price < 50);
console.log("  Guenstig:", cheap.map(p => p.name).join(", "));

console.log("\n--- Alle Collection-Beispiele erfolgreich! ---");
