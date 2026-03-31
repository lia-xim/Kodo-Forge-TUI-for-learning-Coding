/**
 * Lektion 13 - Loesung 02: Generische Interfaces
 */

// ═══ AUFGABE 1: Box ════════════════════════════════════════════════════════

interface Box<T> {
  content: T;
  label: string;
}

function unbox<T>(box: Box<T>): T {
  return box.content;
}

const stringBox: Box<string> = { content: "Hallo", label: "text" };
const numberBox: Box<number> = { content: 42, label: "zahl" };
console.log(unbox(stringBox)); // "Hallo"
console.log(unbox(numberBox)); // 42

// ═══ AUFGABE 2: ApiResponse ════════════════════════════════════════════════

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function extractData<T>(response: ApiResponse<T>): T {
  if (response.status >= 400) {
    throw new Error(`API Error (${response.status}): ${response.message}`);
  }
  return response.data;
}

const response: ApiResponse<{ name: string }> = {
  data: { name: "Max" }, status: 200, message: "OK",
};
const data = extractData(response);
console.log(data.name); // "Max"

// ═══ AUFGABE 3: Result ═════════════════════════════════════════════════════

type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

function safeDivide(a: number, b: number): Result<number> {
  if (b === 0) return { success: false, error: "Division durch Null" };
  return { success: true, data: a / b };
}

const r1 = safeDivide(10, 2);
if (r1.success) console.log(`10 / 2 = ${r1.data}`);

const r2 = safeDivide(10, 0);
if (!r2.success) console.log(`Error: ${r2.error}`);

// ═══ AUFGABE 4: KeyValueStore ══════════════════════════════════════════════

interface KeyValueStore<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
}

function createStore<K, V>(): KeyValueStore<K, V> {
  const map = new Map<K, V>();
  return {
    get: (key) => map.get(key),
    set: (key, value) => { map.set(key, value); },
    has: (key) => map.has(key),
    delete: (key) => map.delete(key),
  };
}

const store = createStore<string, number>();
store.set("age", 30);
console.log(store.get("age"));   // 30
console.log(store.has("age"));   // true
console.log(store.has("name"));  // false

// ═══ AUFGABE 5: Stack ══════════════════════════════════════════════════════

interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  size(): number;
}

function createStack<T>(): Stack<T> {
  const items: T[] = [];
  return {
    push: (item) => { items.push(item); },
    pop: () => items.pop(),
    peek: () => items[items.length - 1],
    size: () => items.length,
  };
}

const stack = createStack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.peek());  // 3
console.log(stack.pop());   // 3
console.log(stack.pop());   // 2
console.log(stack.size());  // 1
