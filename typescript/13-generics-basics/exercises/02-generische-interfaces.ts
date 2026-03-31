/**
 * Lektion 13 - Exercise 02: Generische Interfaces
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-generische-interfaces.ts
 *
 * 5 Aufgaben zu generischen Interfaces, Type Aliases und dem
 * API-Response-Pattern.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Generisches Box-Interface
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "Box<T>" mit den Properties
// content: T und label: string.
// interface Box...

// TODO: Erstelle eine generische Funktion "unbox" die eine Box nimmt
// und den content zurueckgibt.
// function unbox...

// Tests:
// const stringBox: Box<string> = { content: "Hallo", label: "text" };
// const numberBox: Box<number> = { content: 42, label: "zahl" };
// console.log(unbox(stringBox)); // "Hallo" (string)
// console.log(unbox(numberBox)); // 42 (number)

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: API-Response
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "ApiResponse<T>" mit:
// data: T, status: number, message: string
// interface ApiResponse...

// TODO: Erstelle eine generische Funktion "extractData" die eine
// ApiResponse nimmt und nur data zurueckgibt (wirft Error bei status >= 400)
// function extractData...

// Tests:
// const response: ApiResponse<{ name: string }> = {
//   data: { name: "Max" }, status: 200, message: "OK"
// };
// const data = extractData(response);
// console.log(data.name); // "Max"

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Result-Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen generischen Type Alias "Result<T, E>" der entweder
// { success: true; data: T } oder { success: false; error: E } ist.
// E soll einen Default von string haben.
// type Result...

// TODO: Erstelle eine Funktion "safeDivide" die Result<number> zurueckgibt
// function safeDivide...

// Tests:
// const r1 = safeDivide(10, 2);
// if (r1.success) console.log(`10 / 2 = ${r1.data}`); // 5
//
// const r2 = safeDivide(10, 0);
// if (!r2.success) console.log(`Error: ${r2.error}`); // "Division durch Null"

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: KeyValueStore
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "KeyValueStore<K, V>" mit
// Methoden: get(key: K): V | undefined, set(key: K, value: V): void,
// has(key: K): boolean, delete(key: K): boolean
// interface KeyValueStore...

// TODO: Implementiere den KeyValueStore mit einer Map
// function createStore...

// Tests:
// const store = createStore<string, number>();
// store.set("age", 30);
// console.log(store.get("age"));   // 30
// console.log(store.has("age"));   // true
// console.log(store.has("name"));  // false

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Stack<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein generisches Interface "Stack<T>" mit:
// push(item: T): void, pop(): T | undefined,
// peek(): T | undefined, size(): number
// interface Stack...

// TODO: Implementiere den Stack
// function createStack...

// Tests:
// const stack = createStack<number>();
// stack.push(1);
// stack.push(2);
// stack.push(3);
// console.log(stack.peek());  // 3
// console.log(stack.pop());   // 3
// console.log(stack.pop());   // 2
// console.log(stack.size());  // 1
