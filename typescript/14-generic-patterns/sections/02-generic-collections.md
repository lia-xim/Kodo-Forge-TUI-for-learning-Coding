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
- LinkedList\<T\> als verkettete Liste mit Iterator-Support
- Constrained Collections: Nur Typen mit bestimmten Properties erlauben

---

## Hintergrund: Warum Java Generics bekaempfte und TypeScript davon lernte

Im Jahr 2004 fuegte Java Generics zur Sprache hinzu — und erzeugte einen
der groessten Rueckwaertskompatibilitaets-Kompromisse der Programmiergeschichte.
Java-Generics werden durch "Type Erasure" implementiert: `List<String>` und
`List<Integer>` sind zur Laufzeit dasselbe Objekt. Das schraenkt bis heute ein,
was Java-Generics koennen.

TypeScript kennt dieses Problem nicht, weil TypeScript-Typen IMMER erased
werden — es gibt keine Laufzeit-Repraesentation. Aber das Ergebnis ist dasselbe:
Typsichere Collections, die zur Compile-Zeit vollstaendig geprueft werden,
zur Laufzeit aber effizientes, schlankes JavaScript erzeugen.

Das Ergebnis kannst du in jeder grossen TypeScript-Codebase sehen: Die
Angular Material `DataSource<T>`, die RxJS `Subject<T>` und `BehaviorSubject<T>`,
die NgRx `Store<State>` — sie alle sind im Kern typsichere Collections, die
Generics verwenden um sicherzustellen, dass das was reinkommt, auch typsicher
rauskommt.

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

> 💭 **Denkfrage:** Browser-History, Call Stack im Debugger, Undo/Redo in
> jedem Editor — alle sind Stacks. Aber Angular und React implementieren
> Undo-History oft mit einem `UndoAction[]`-Array statt einer Stack-Klasse.
> Welchen Vorteil hat eine typisierte Stack\<T\>-Klasse gegenueber einem
> einfachen Array, wenn man `pop()` auf einem leeren Array aufruft?

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

> ⚡ **Angular-Bezug:** `HttpClient` verwendet intern eine Queue fuer
> ausgehende Requests. Wenn du in einem Angular-Service mehrere
> `this.http.get<User[]>()` Aufrufe machst, werden sie in einer internen
> Queue verwaltet. Das Generic `<User[]>` stellt sicher, dass der
> `Observable`-Stream genau den richtigen Typ emittiert — keine Casts noetig.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> class Queue<T> {
>   private items: T[] = [];
>   enqueue(item: T): void { this.items.push(item); }
>   dequeue(): T | undefined { return this.items.shift(); }
> }
>
> // Erstelle eine Queue<number> und eine Queue<string>
> const numQ = new Queue<number>();
> const strQ = new Queue<string>();
>
> numQ.enqueue(42);
> // Was passiert wenn du versuchst: numQ.enqueue("oops")?
> // Was ist der Typ von numQ.dequeue()?
> // Vergleiche: was waere der Typ wenn du Queue<unknown> nutzt?
> ```
> Teste beide Varianten und beobachte die Compiler-Fehler.

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

> 📖 **Hintergrund: Generator-Methoden und das Iterator-Protokoll**
>
> Die `*[Symbol.iterator]()` Methode implementiert das JavaScript Iterator
> Protocol. Das `*` macht sie zur Generator-Funktion — sie kann mit `yield`
> Werte "pausieren und liefern". TypeScript leitet den Typ `Iterator<T>`
> automatisch ab. Dadurch funktioniert `for...of` auf jeder Klasse, die
> dieses Protokoll implementiert — einschliesslich Stack und Queue oben.
> In Angular verwendest du dasselbe Protokoll, wenn du `async/await` mit
> Iterables in Services kombinierst.

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

> ⚡ **React-Bezug:** In React-Projekten mit Redux oder Zustand wirst du
> normalisierte State-Strukturen kennenlernen: `entities: Record<string, User>`.
> Das ist konzeptuell identisch mit `IndexedCollection<User>`. Der Constraint
> `T extends { id: string }` entspricht dem NgRx-Pattern wo alle Entities
> ein `id`-Feld haben muessen, damit der EntityAdapter funktioniert.

---

## Was du gelernt hast

- Generische Collections erhalten den Typ des Elements von der Erstellung bis zur Entnahme
- `Stack<T>` implementiert LIFO und gibt bei leerem Stack `undefined` zurueck
- `Queue<T>` implementiert FIFO — nuetzlich fuer Nachrichten, Events, Requests
- `LinkedList<T>` verkettete Knoten sind selbst generisch: `ListNode<T>`
- Das Iterator Protocol (`*[Symbol.iterator]`) macht eigene Collections `for...of`-kompatibel
- Constraints (`T extends { id: ... }`) schraenken ein, welche Typen eine Collection akzeptiert

**Kernkonzept:** Eine Generic Collection ist mehr als ein typisiertes Array —
sie erzwingt Invarianten (LIFO/FIFO/ID-Existenz) UND garantiert den Typ bei
jeder Operation. Beides zusammen macht den Unterschied zu `any[]`.

---

> **Pausenpunkt** — Collections sind das Fundament fuer Datenverarbeitung.
> Weiter geht es mit funktionalen Patterns und HOFs.
>
> Weiter geht es mit: [Sektion 03 — Generic Higher-Order Functions](./03-generic-hof.md)
