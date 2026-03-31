/**
 * Lektion 13 - Example 03: Generische Interfaces und Types
 *
 * Ausfuehren mit: npx tsx examples/03-generische-interfaces.ts
 *
 * Generic Interfaces, Type Aliases, Array<T>, mehrere Typparameter.
 */

// ─── GENERISCHE INTERFACES ─────────────────────────────────────────────────

interface Box<T> {
  content: T;
  label: string;
}

console.log("=== Generische Interfaces ===");

const stringBox: Box<string> = { content: "Hallo", label: "Begruessung" };
const numberBox: Box<number> = { content: 42, label: "Antwort" };
const arrayBox: Box<number[]> = { content: [1, 2, 3], label: "Zahlen" };

console.log(`${stringBox.label}: ${stringBox.content}`);
console.log(`${numberBox.label}: ${numberBox.content}`);
console.log(`${arrayBox.label}: ${arrayBox.content}`);

// ─── API-RESPONSE PATTERN ──────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

console.log("\n=== API-Response Pattern ===");

// Gleiche Huelle, verschiedene Daten
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "Max", email: "max@test.de" },
  status: 200,
  message: "OK",
  timestamp: new Date(),
};

const productResponse: ApiResponse<Product> = {
  data: { id: 1, title: "TypeScript Buch", price: 29.99 },
  status: 200,
  message: "OK",
  timestamp: new Date(),
};

// Generische Funktion fuer beliebige Responses:
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status >= 400) {
    throw new Error(`API Error: ${response.message}`);
  }
  console.log(`Response OK (${response.status})`);
  return response.data;
}

const user = handleResponse(userResponse);
console.log(`User: ${user.name}`); // Volle Typsicherheit!

const product = handleResponse(productResponse);
console.log(`Product: ${product.title}, ${product.price}EUR`);

// ─── GENERISCHE TYPE ALIASES ────────────────────────────────────────────────

type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type MaybePromise<T> = T | Promise<T>;

console.log("\n=== Generische Type Aliases ===");

const name1: Nullable<string> = "Max";
const name2: Nullable<string> = null;
console.log(`Nullable: ${name1}, ${name2}`);

// Result-Type — Fehlerbehandlung ohne Exceptions
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { success: false, error: "Division durch Null" };
  return { success: true, data: a / b };
}

const r1 = divide(10, 3);
const r2 = divide(10, 0);

if (r1.success) console.log(`10 / 3 = ${r1.data.toFixed(2)}`);
if (!r2.success) console.log(`10 / 0 = Error: ${r2.error}`);

// ─── ARRAY<T> UND DIE STANDARDBIBLIOTHEK ────────────────────────────────────

console.log("\n=== Array<T> — Generics die du schon kennst ===");

// Beide Schreibweisen sind identisch:
const nums1: number[] = [1, 2, 3];
const nums2: Array<number> = [1, 2, 3];

// Array-Methoden nutzen die Generics:
const doubled = nums1.map(n => n * 2);       // number[]
const strings = nums1.map(n => String(n));    // string[]
const found = nums1.find(n => n > 2);         // number | undefined

console.log(`map: ${doubled}`);
console.log(`map->string: ${strings}`);
console.log(`find: ${found}`);

// ─── MEHRERE TYPPARAMETER ───────────────────────────────────────────────────

console.log("\n=== Mehrere Typparameter ===");

interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const setting: KeyValuePair<string, number> = { key: "timeout", value: 5000 };
console.log(`${setting.key} = ${setting.value}`);

const userPage: PaginatedResponse<User> = {
  items: [
    { id: 1, name: "Max", email: "max@test.de" },
    { id: 2, name: "Anna", email: "anna@test.de" },
  ],
  page: 1,
  pageSize: 10,
  totalItems: 50,
  totalPages: 5,
};

console.log(`Seite ${userPage.page}: ${userPage.items.length} Users von ${userPage.totalItems}`);

// ─── GENERISCHES INTERFACE FUER FUNKTIONSTYPEN ──────────────────────────────

console.log("\n=== Generische Funktionstypen ===");

interface Transformer<TInput, TOutput> {
  (input: TInput): TOutput;
}

const toUpperCase: Transformer<string, string> = s => s.toUpperCase();
const toLength: Transformer<string, number> = s => s.length;
const toString: Transformer<number, string> = n => `${n}`;

console.log(toUpperCase("hallo"));  // "HALLO"
console.log(toLength("hallo"));     // 5
console.log(toString(42));           // "42"
