/**
 * Lektion 14 - Solution 02: Generic Collections
 *
 * Ausfuehren mit: npx tsx solutions/02-generic-collections.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Stack<T>
// ═══════════════════════════════════════════════════════════════════════════

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
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: PriorityQueue<T>
// ═══════════════════════════════════════════════════════════════════════════

class PriorityQueue<T> {
  private items: { value: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ value: item, priority });
    // Sortiere nach Prioritaet (niedrigere Zahl = hoehere Prio)
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  get size(): number {
    return this.items.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: FilterableList<T>
// ═══════════════════════════════════════════════════════════════════════════

class FilterableList<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  addAll(items: T[]): void {
    this.items.push(...items);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  map<U>(fn: (item: T) => U): U[] {
    return this.items.map(fn);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Deque<T>
// ═══════════════════════════════════════════════════════════════════════════

class Deque<T> {
  private items: T[] = [];

  pushFront(item: T): void {
    this.items.unshift(item);
  }

  pushBack(item: T): void {
    this.items.push(item);
  }

  popFront(): T | undefined {
    return this.items.shift();
  }

  popBack(): T | undefined {
    return this.items.pop();
  }

  peekFront(): T | undefined {
    return this.items[0];
  }

  peekBack(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: ReadonlyCollection<T>
// ═══════════════════════════════════════════════════════════════════════════

interface ReadonlyCollection<T> {
  get(index: number): T | undefined;
  readonly size: number;
  toArray(): readonly T[];
  [Symbol.iterator](): Iterator<T>;
}

function freeze<T>(items: T[]): ReadonlyCollection<T> {
  const frozen = [...items]; // Kopie erstellen

  return {
    get(index: number): T | undefined {
      return frozen[index];
    },
    get size(): number {
      return frozen.length;
    },
    toArray(): readonly T[] {
      return [...frozen];
    },
    *[Symbol.iterator](): Iterator<T> {
      for (const item of frozen) {
        yield item;
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log("Stack peek:", stack.peek()); // 3
console.log("Stack pop:", stack.pop());   // 3
console.log("Stack size:", stack.size);   // 2

const pq = new PriorityQueue<string>();
pq.enqueue("niedrig", 10);
pq.enqueue("hoch", 1);
pq.enqueue("mittel", 5);
console.log("PQ dequeue:", pq.dequeue()); // "hoch"
console.log("PQ dequeue:", pq.dequeue()); // "mittel"
console.log("PQ dequeue:", pq.dequeue()); // "niedrig"

const fl = new FilterableList<number>();
fl.addAll([1, 2, 3, 4, 5]);
console.log("Filter >3:", fl.filter(n => n > 3)); // [4, 5]
console.log("Map *2:", fl.map(n => n * 2)); // [2, 4, 6, 8, 10]
console.log("Find 3:", fl.find(n => n === 3)); // 3

const deque = new Deque<string>();
deque.pushBack("a");
deque.pushBack("b");
deque.pushFront("z");
console.log("Deque front:", deque.popFront()); // "z"
console.log("Deque back:", deque.popBack());   // "b"
console.log("Deque size:", deque.size);         // 1

const frozen = freeze([1, 2, 3]);
console.log("Frozen get(1):", frozen.get(1)); // 2
console.log("Frozen size:", frozen.size);     // 3
console.log("Frozen array:", frozen.toArray()); // [1, 2, 3]

console.log("\n--- Alle Tests bestanden! ---");
