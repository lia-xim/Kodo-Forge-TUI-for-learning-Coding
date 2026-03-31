/**
 * Lektion 13 - Example 06: Generics in der Praxis
 *
 * Ausfuehren mit: npx tsx examples/06-generics-praxis.ts
 *
 * Promise<T>, Map<K,V>, eigene Utility-Funktionen,
 * und wie Frameworks (React, Angular) Generics nutzen.
 */

// ─── PROMISE<T> — ASYNCHRONE TYPSICHERHEIT ─────────────────────────────────

console.log("=== Promise<T> ===");

// Promise behaelt den Typ des aufgeloesten Werts
async function fetchData<T>(url: string): Promise<T> {
  // Simuliert einen API-Aufruf
  const mockData: Record<string, unknown> = {
    "/api/user": { id: 1, name: "Max", age: 30 },
    "/api/products": [
      { id: 1, title: "Laptop", price: 999 },
      { id: 2, title: "Mouse", price: 29 },
    ],
  };
  return mockData[url] as T;
}

interface User {
  id: number;
  name: string;
  age: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

async function demo() {
  const user = await fetchData<User>("/api/user");
  console.log(`User: ${user.name}, ${user.age}`);
  // user ist User — volle IDE-Unterstuetzung

  const products = await fetchData<Product[]>("/api/products");
  console.log(`Products: ${products.map(p => p.title).join(", ")}`);
  // products ist Product[] — typsicher
}

await demo();

// ─── MAP<K, V> UND SET<T> ──────────────────────────────────────────────────

console.log("\n=== Map<K, V> und Set<T> ===");

// Typsichere Konfiguration
const config = new Map<string, string | number | boolean>();
config.set("host", "localhost");
config.set("port", 3000);
config.set("debug", true);

console.log(`Host: ${config.get("host")}`);
console.log(`Port: ${config.get("port")}`);

// Set fuer eindeutige Werte
const tags = new Set<string>();
tags.add("typescript");
tags.add("generics");
tags.add("typescript"); // Duplikat — wird ignoriert
console.log(`Tags: ${[...tags].join(", ")}`);

// Map als Cache mit generischem Wrapper
class TypedCache<K, V> {
  private store = new Map<K, { value: V; expiresAt: number }>();

  set(key: K, value: V, ttlMs: number = 60_000): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }
}

const userCache = new TypedCache<number, User>();
userCache.set(1, { id: 1, name: "Max", age: 30 });
console.log(`Cache: ${JSON.stringify(userCache.get(1))}`);

// ─── EIGENE UTILITY-FUNKTIONEN ──────────────────────────────────────────────

console.log("\n=== Eigene Utility-Funktionen ===");

// 1. groupBy
function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

const people = [
  { name: "Max", department: "Engineering" },
  { name: "Anna", department: "Design" },
  { name: "Bob", department: "Engineering" },
  { name: "Clara", department: "Design" },
];

const byDept = groupBy(people, p => p.department);
console.log("Engineering:", byDept["Engineering"].map(p => p.name));
console.log("Design:", byDept["Design"].map(p => p.name));

// 2. chunk — Array in Gruppen aufteilen
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

console.log(`\nchunk([1..7], 3):`, chunk([1, 2, 3, 4, 5, 6, 7], 3));
// [[1,2,3], [4,5,6], [7]]

// 3. pipe — Funktionen verketten
function pipe<T>(value: T, ...fns: ((arg: T) => T)[]): T {
  return fns.reduce((acc, fn) => fn(acc), value);
}

const result = pipe(
  "  hallo welt  ",
  s => s.trim(),
  s => s.toUpperCase(),
  s => `[${s}]`
);
console.log(`\npipe: "${result}"`); // "[HALLO WELT]"

// 4. retry — Asynchrone Operation mit Wiederholung
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`  Attempt ${attempt} failed: ${lastError.message}`);
    }
  }
  throw lastError;
}

console.log("\nretry:");
let callCount = 0;
const retryResult = await retry(async () => {
  callCount++;
  if (callCount < 3) throw new Error("Noch nicht bereit");
  return "Erfolg!";
});
console.log(`  Result: ${retryResult}`);

// ─── REACT useState<T> SIMULATION ───────────────────────────────────────────

console.log("\n=== React useState<T> (simuliert) ===");

function useState<T>(initial: T): [() => T, (newValue: T) => void] {
  let state = initial;
  return [
    () => state,
    (newValue: T) => { state = newValue; },
  ];
}

// Inference: T = number
const [getCount, setCount] = useState(0);
console.log(`count: ${getCount()}`);
setCount(5);
console.log(`count nach setCount(5): ${getCount()}`);

// Explizit: T = User | null
const [getUser, setUser] = useState<User | null>(null);
console.log(`user: ${getUser()}`);
setUser({ id: 1, name: "Max", age: 30 });
console.log(`user nach setUser: ${getUser()?.name}`);

// ─── ZUSAMMENFASSUNG ────────────────────────────────────────────────────────

console.log("\n=== Generics durchziehen alles ===");
console.log("Array<T>, Promise<T>, Map<K,V>, Set<T> — Standardbibliothek");
console.log("useState<T>, HttpClient<T> — Frameworks");
console.log("groupBy<T,K>, retry<T>, pipe<T> — Dein eigener Code");
console.log("Generics sind das Herzstuck von TypeScript!");
