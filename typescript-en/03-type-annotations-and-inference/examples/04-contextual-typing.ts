/**
 * LEKTION 03 - Beispiel 4: Contextual Typing
 *
 * Contextual Typing bedeutet: TypeScript leitet den Typ aus dem KONTEXT ab,
 * nicht aus dem Wert selbst. Das passiert vor allem bei Callbacks --
 * TypeScript weiss, welchen Typ der Parameter haben muss, weil es
 * die Signatur der aeusseren Funktion kennt.
 */

// ============================================================================
// 1. CALLBACK-PARAMETER BEI ARRAY-METHODEN
// ============================================================================

const zahlen = [10, 20, 30, 40, 50];

// TS weiss: zahlen ist number[]
// Also ist der Callback-Parameter von .map() ein number
const verdoppelt = zahlen.map(n => n * 2);
//                              ^-- n: number (Contextual Typing!)

// Das hier ist UNNOETIG -- der Typ steht schon fest:
const verdoppeltRedundant = zahlen.map((n: number) => n * 2);  // Gleich, aber lauter

// .filter() -- gleich, Parameter ist number
const grosse = zahlen.filter(n => n > 25);
//                            ^-- n: number

// .reduce() -- acc hat den Typ des Startwerts
const summe = zahlen.reduce((acc, curr) => acc + curr, 0);
//                            ^-- acc: number (Typ des Startwerts 0)
//                                 ^-- curr: number (Element-Typ)

// .forEach()
zahlen.forEach(n => {
  //            ^-- n: number
  console.log(n.toFixed(2));
});

// .find()
const found = zahlen.find(n => n === 30);
//                         ^-- n: number
// found ist number | undefined (weil find() nichts finden kann)

// .sort()
const sortiert = zahlen.sort((a, b) => a - b);
//                            ^-- a: number, b: number

// Verschachtelte Arrays
const matrix = [[1, 2], [3, 4], [5, 6]];
const flattened = matrix.flatMap(row => row.map(n => n * 2));
//                                ^-- row: number[]
//                                              ^-- n: number

// ============================================================================
// 2. EVENT-LISTENER (Browser APIs)
// ============================================================================

// addEventListener kennt den Event-Typ basierend auf dem Event-Namen:

// "click" --> MouseEvent
// document.addEventListener("click", (event) => {
//   console.log(event.clientX, event.clientY);
//   //          ^-- event: MouseEvent
// });

// "keydown" --> KeyboardEvent
// document.addEventListener("keydown", (event) => {
//   console.log(event.key, event.code);
//   //          ^-- event: KeyboardEvent
// });

// "submit" --> SubmitEvent
// document.addEventListener("submit", (event) => {
//   event.preventDefault();
//   //    ^-- event: SubmitEvent
// });

// ============================================================================
// 3. VARIABLE TYP BESTIMMT PARAMETER-TYPEN
// ============================================================================

// Wenn du eine Variable mit einem Funktions-Typ annotierst,
// kennt TS die Parameter-Typen:

type MathOperation = (a: number, b: number) => number;

// Hier musst du a und b NICHT annotieren:
const add: MathOperation = (a, b) => a + b;
//                          ^-- a: number, b: number (Contextual!)

const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;

// Praktisches Beispiel: Sortier-Funktionen
type Comparator<T> = (a: T, b: T) => number;

const sortByAge: Comparator<{ age: number }> = (a, b) => a.age - b.age;
//                                               ^-- a: { age: number }

// ============================================================================
// 4. GENERIC INFERENCE AUS ARGUMENTEN
// ============================================================================

// TypeScript infert Generic-Typ-Parameter aus den uebergebenen Werten:

function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const first = firstElement([1, 2, 3]);
// T wird als number infert --> Return-Typ: number | undefined

const firstStr = firstElement(["a", "b", "c"]);
// T wird als string infert --> Return-Typ: string | undefined

// Komplexeres Beispiel:
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const mapped = map([1, 2, 3], n => n.toString());
// T = number (aus dem Array-Argument)
// U = string (aus dem Return-Typ des Callbacks)
// Ergebnis: string[]

// Generics mit mehreren Quellen:
function merge<A, B>(a: A, b: B): A & B {
  return { ...a, ...b };
}

const merged = merge({ name: "Matthias" }, { age: 30 });
// A = { name: string }
// B = { age: number }
// Return: { name: string } & { age: number }

// ============================================================================
// 5. WANN CONTEXTUAL TYPING VERSAGT
// ============================================================================

// Problem 1: Funktion wird getrennt von ihrem Kontext definiert
// KEIN Contextual Typing -- TS weiss nicht, wie die Funktion verwendet wird:

// const handler = (event) => {           // event: any (implicit!)
//   console.log(event.clientX);
// };
// document.addEventListener("click", handler);

// Loesung: Manuell annotieren
const handler = (event: MouseEvent) => {
  console.log(event.clientX);
};

// Problem 2: Generische Callbacks ohne Kontext
function processItems<T>(items: T[], fn: (item: T) => void): void {
  items.forEach(fn);
}

// Das funktioniert (Contextual Typing):
processItems(["a", "b"], item => console.log(item.toUpperCase()));
//                         ^-- item: string (infert aus "a", "b")

// Das funktioniert NICHT:
// const logItem = (item) => console.log(item);  // item: any!
// processItems(["a", "b"], logItem);

// Loesung:
const logItem = (item: string) => console.log(item);
processItems(["a", "b"], logItem);  // OK!

// Problem 3: Zu viele Indirektions-Ebenen
const operations = {
  double: (n: number) => n * 2,
  // Hier muss annotiert werden, weil das Objekt-Literal
  // keinen Kontext fuer die Parameter bietet
};

// ============================================================================
// 6. CONTEXTUAL TYPING MIT OBJECT LITERALS
// ============================================================================

interface ServerConfig {
  host: string;
  port: number;
  onConnect: (host: string) => void;
  onError: (error: Error) => void;
}

// Wenn du ein Objekt dem Interface zuweist, werden Callback-Parameter infert:
const serverConfig: ServerConfig = {
  host: "localhost",
  port: 3000,
  onConnect: (host) => {
    //         ^-- host: string (aus Config-Interface!)
    console.log(`Verbunden mit ${host}`);
  },
  onError: (error) => {
    //        ^-- error: Error (aus Config-Interface!)
    console.error(error.message);
  },
};

// OHNE die Annotation ": ServerConfig" wuerde TS die Callbacks nicht tippen koennen:
const looseConfig = {
  host: "localhost",
  port: 3000,
  // onConnect: (host) => { },  // host waere 'any'!
};

// ============================================================================
// 7. PROMISE-INFERENCE
// ============================================================================

// Promise.all infert den Typ aus allen Promises:
async function fetchAll() {
  const [users, posts] = await Promise.all([
    Promise.resolve(["Alice", "Bob"]),
    Promise.resolve([{ id: 1, title: "Post 1" }]),
  ]);
  // users: string[]
  // posts: { id: number; title: string }[]
}

// Promise.race infert den Union-Typ:
async function raceExample() {
  const result = await Promise.race([
    Promise.resolve(42),
    Promise.resolve("hello"),
  ]);
  // result: number | string
}

// ============================================================================
// ZUSAMMENFASSUNG
// ============================================================================
//
// Contextual Typing liefert den Typ aus dem KONTEXT, nicht aus dem WERT:
//
// 1. Array-Methoden    --> Callback-Parameter aus Element-Typ
// 2. Event-Listener    --> Event-Typ aus Event-Name
// 3. Annotierte Vars   --> Parameter-Typ aus Funktions-Typ
// 4. Generics          --> Typ-Parameter aus Argumenten
// 5. Object Literals   --> Callback-Typen aus Interface
//
// REGEL: Annotiere Callbacks NICHT, wenn sie direkt als Argument
// uebergeben werden -- Contextual Typing macht das automatisch.
//
// ABER: Annotiere Callbacks, wenn sie getrennt definiert werden,
// weil TS dann den Kontext nicht kennt.
