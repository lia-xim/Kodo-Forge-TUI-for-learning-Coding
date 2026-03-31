/**
 * Lektion 14 - Exercise 02: Generic Collections
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-generic-collections.ts
 *
 * 5 Aufgaben zu Stack<T>, Queue<T>, LinkedList<T>.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Stack<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine generische Stack-Klasse mit:
// - push(item: T): void
// - pop(): T | undefined
// - peek(): T | undefined
// - size (getter): number
// - isEmpty(): boolean

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Queue mit Prioritaet
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine PriorityQueue<T> die Elemente nach
// Prioritaet sortiert zurueckgibt (niedrigere Zahl = hoehere Prioritaet):
//
// enqueue(item: T, priority: number): void
// dequeue(): T | undefined — gibt das Element mit der hoechsten Prio zurueck
// peek(): T | undefined
// size (getter): number

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Generic Filter-Collection
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine FilterableList<T> die eine eingebaute
// filter-Methode hat:
//
// add(item: T): void
// addAll(items: T[]): void
// filter(predicate: (item: T) => boolean): T[]
// map<U>(fn: (item: T) => U): U[]
// find(predicate: (item: T) => boolean): T | undefined

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Deque<T> (Double-Ended Queue)
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine Deque<T> (Double-Ended Queue) mit:
// - pushFront(item: T): void
// - pushBack(item: T): void
// - popFront(): T | undefined
// - popBack(): T | undefined
// - peekFront(): T | undefined
// - peekBack(): T | undefined
// - size (getter): number

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: ReadonlyCollection<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Funktion "freeze" die eine beliebige Collection
// (mit toArray-Methode) nimmt und eine ReadonlyCollection zurueckgibt:
//
// interface ReadonlyCollection<T> {
//   get(index: number): T | undefined;
//   size: number;
//   toArray(): readonly T[];
//   [Symbol.iterator](): Iterator<T>;
// }
//
// function freeze<T>(items: T[]): ReadonlyCollection<T>

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
//
// const stack = new Stack<number>();
// stack.push(1); stack.push(2); stack.push(3);
// console.log("Stack peek:", stack.peek()); // 3
// console.log("Stack pop:", stack.pop());   // 3
// console.log("Stack size:", stack.size);   // 2
//
// const pq = new PriorityQueue<string>();
// pq.enqueue("niedrig", 10);
// pq.enqueue("hoch", 1);
// pq.enqueue("mittel", 5);
// console.log("PQ dequeue:", pq.dequeue()); // "hoch"
//
// const fl = new FilterableList<number>();
// fl.addAll([1, 2, 3, 4, 5]);
// console.log("Filter >3:", fl.filter(n => n > 3)); // [4, 5]
// console.log("Map *2:", fl.map(n => n * 2)); // [2, 4, 6, 8, 10]
//
// const deque = new Deque<string>();
// deque.pushBack("a"); deque.pushBack("b"); deque.pushFront("z");
// console.log("Deque front:", deque.popFront()); // "z"
// console.log("Deque back:", deque.popBack());   // "b"
//
// const frozen = freeze([1, 2, 3]);
// console.log("Frozen get(1):", frozen.get(1)); // 2
// console.log("Frozen size:", frozen.size);     // 3

console.log("Exercise 02 geladen. Ersetze die TODOs!");
