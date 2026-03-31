# Sektion 2: Generic Collections

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Generic Factories](./01-generic-factories.md)
> Naechste Sektion: [03 - Generic Higher-Order Functions](./03-generic-hof.md)

---

## Was du hier lernst

- Warum typsichere Datenstrukturen besser sind als `any[]`
- Stack\<T\> implementieren (Last In, First Out)
- Queue\<T\> implementieren (First In, First Out)
- LinkedList\<T\> als verkettete Liste
- Das Iterator-Pattern mit Generics

---

## Das Problem: Untypisierte Container

JavaScript kennt nur Arrays und Maps als eingebaute Datenstrukturen. Beide
sind dynamisch — du kannst alles reinwerfen:

```typescript annotated
const stack: unknown[] = [];
stack.push(42);
stack.push("oops");   // Kein Fehler!
stack.push(true);     // Auch nicht. Chaos garantiert.

const value = stack.pop();
// ^ Typ: unknown — keine Hilfe vom Compiler
```

Das ist wie ein Lager ohne Etiketten: Alles geht rein, aber niemand weiss,
was rauskommt. Generics sind die Etiketten.

---

## Stack\<T\> — Last In, First Out

Ein Stack ist wie ein Stapel Buecher: Das letzte Buch oben drauf wird als
erstes wieder heruntergenommen. In der Informatik: **LIFO** (Last In, First Out).

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

  // Iterator: for...of Support
  *[Symbol.iterator](): Iterator<T> {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
}
```

Verwendung:

```typescript annotated
const numbers = new Stack<number>();
numbers.push(10);
numbers.push(20);
numbers.push(30);

console.log(numbers.pop());  // 30 — Typ: number | undefined
console.log(numbers.peek()); // 20 — schaut nur, entfernt nicht

// Auch mit komplexen Typen:
interface UndoAction {
  type: string;
  payload: unknown;
  timestamp: Date;
}

const undoStack = new Stack<UndoAction>();
undoStack.push({ type: "DELETE", payload: { id: 42 }, timestamp: new Date() });
```

> 🧠 **Erklaere dir selbst:** Warum gibt `pop()` den Typ `T | undefined`
> zurueck statt nur `T`? Was passiert bei einem leeren Stack?
> **Kernpunkte:** Leerer Stack hat nichts zum Zurueckgeben | undefined signalisiert "nichts da" | Ohne undefined muesste man eine Exception werfen oder luegen

---

## Queue\<T\> — First In, First Out

Eine Queue ist wie eine Warteschlange: Wer zuerst kommt, wird zuerst bedient.
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

Praktisches Beispiel — eine typsichere Nachrichten-Queue:

```typescript annotated
interface Message {
  from: string;
  body: string;
  priority: "low" | "normal" | "high";
}

const inbox = new Queue<Message>();
inbox.enqueue({ from: "Alice", body: "Hallo!", priority: "normal" });
inbox.enqueue({ from: "Bob", body: "Dringend!", priority: "high" });

const next = inbox.dequeue();
if (next) {
  console.log(`[${next.priority}] ${next.from}: ${next.body}`);
  // Volle Typsicherheit und Autovervollstaendigung nach dem if-Check
}
```

---

## LinkedList\<T\> — Verkettete Liste

Eine LinkedList speichert Elemente als verkettete Knoten. Jeder Knoten kennt
nur seinen Nachfolger. Das klingt umstaendlich, hat aber Vorteile: Einfuegen
am Anfang ist O(1) statt O(n) wie bei Arrays.

```typescript annotated
// Der Knoten ist selbst generisch:
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
// ^ Typ: { name: string; age: number } | undefined

for (const user of users) {
  console.log(user.name); // Volle Autovervollstaendigung
}
```

---

## Constrainted Collections

Manchmal soll eine Collection nur bestimmte Typen akzeptieren — z.B. nur
Objekte mit einer `id`-Property:

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
// ^ Typ: Product | undefined
```

> **Warum `T extends { id: ... }`?** Das Constraint stellt sicher, dass JEDES
> Element eine `id` hat. Ohne Constraint koennte man `IndexedCollection<string>`
> erstellen — was keinen Sinn ergibt, weil Strings keine `.id` haben.

---

## Zusammenfassung

| Collection | Prinzip | Typischer Einsatz |
|-----------|---------|-------------------|
| Stack\<T\> | LIFO — Last In, First Out | Undo/Redo, Klammerung |
| Queue\<T\> | FIFO — First In, First Out | Auftraege, Events, BFS |
| LinkedList\<T\> | Verkettete Knoten | Haeufiges Einfuegen am Anfang |
| IndexedCollection\<T\> | Map nach ID | CRUD mit ID-basiertem Zugriff |

---

> **Pause moeglich!** Collections sind das Fundament fuer Datenverarbeitung.
> Weiter geht es mit funktionalen Patterns.
>
> Naechste Sektion: [03 - Generic Higher-Order Functions](./03-generic-hof.md)
