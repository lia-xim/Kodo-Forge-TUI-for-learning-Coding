/**
 * Lektion 06 - Example 02: Optionale und Default-Parameter
 *
 * Ausfuehren mit: npx tsx examples/02-optionale-und-default-parameter.ts
 *
 * Zeigt optionale Parameter, Default-Werte, Rest-Parameter,
 * und Destructuring in Funktionsparametern.
 */

// ─── OPTIONALE PARAMETER ───────────────────────────────────────────────────

// Das ? macht den Parameter optional (fuegt | undefined hinzu)
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hallo"}, ${name}!`;
}

console.log("--- Optionale Parameter ---");
console.log(greet("Max"));              // "Hallo, Max!"
console.log(greet("Max", "Moin"));      // "Moin, Max!"
console.log(greet("Max", undefined));   // "Hallo, Max!" — explizit undefined

// ─── UNTERSCHIED: ? vs | undefined ────────────────────────────────────────

function mitOptional(x?: string): void {
  console.log(`  optional: ${x ?? "(nicht angegeben)"}`);
}

function mitUnion(x: string | undefined): void {
  console.log(`  union: ${x ?? "(undefined)"}`);
}

console.log("\n--- ? vs | undefined ---");

// Beide akzeptieren undefined:
mitOptional(undefined);   // OK
mitUnion(undefined);      // OK

// Nur ? erlaubt das Weglassen:
mitOptional();            // OK — Parameter weggelassen
// mitUnion();            // Error! Erwartet 1 Argument

// ─── DEFAULT-PARAMETER ────────────────────────────────────────────────────

function createUser(
  name: string,
  role: string = "user",      // Default: "user"
  active: boolean = true,     // Default: true
): { name: string; role: string; active: boolean } {
  return { name, role, active };
}

console.log("\n--- Default-Parameter ---");
console.log(createUser("Max"));
// { name: 'Max', role: 'user', active: true }

console.log(createUser("Anna", "admin"));
// { name: 'Anna', role: 'admin', active: true }

console.log(createUser("Bob", "editor", false));
// { name: 'Bob', role: 'editor', active: false }

// Default wird auch bei explicit undefined ausgeloest:
console.log(createUser("Chris", undefined, false));
// { name: 'Chris', role: 'user', active: false }

// ─── REST-PARAMETER ───────────────────────────────────────────────────────

// Sammelt alle weiteren Argumente in ein typisiertes Array
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

console.log("\n--- Rest-Parameter ---");
console.log(`sum(1, 2, 3) = ${sum(1, 2, 3)}`);       // 6
console.log(`sum(10, 20) = ${sum(10, 20)}`);           // 30
console.log(`sum() = ${sum()}`);                       // 0

// Rest mit fuehrendem Parameter
function log(level: "info" | "warn" | "error", ...messages: string[]): void {
  const prefix = `[${level.toUpperCase()}]`;
  console.log(prefix, ...messages);
}

console.log("\n--- Rest mit Level ---");
log("info", "Server", "gestartet", "auf Port 3000");
log("warn", "Hoher Speicherverbrauch");
log("error", "Verbindung fehlgeschlagen", "Timeout nach 5000ms");

// ─── REST ALS TUPLE ───────────────────────────────────────────────────────

// Rest-Parameter koennen auch Tuple-Typen haben
function point(...coords: [number, number] | [number, number, number]): string {
  if (coords.length === 2) {
    return `2D(${coords[0]}, ${coords[1]})`;
  }
  return `3D(${coords[0]}, ${coords[1]}, ${coords[2]})`;
}

console.log("\n--- Rest als Tuple ---");
console.log(point(10, 20));       // "2D(10, 20)"
console.log(point(10, 20, 30));   // "3D(10, 20, 30)"

// ─── DESTRUCTURING IN PARAMETERN ──────────────────────────────────────────

// Typ kommt NACH dem gesamten Destructuring-Pattern
interface UserInfo {
  name: string;
  age: number;
  email?: string;
}

function beschreibe({ name, age, email }: UserInfo): string {
  let msg = `${name} ist ${age} Jahre alt`;
  if (email) {
    msg += ` (${email})`;
  }
  return msg;
}

console.log("\n--- Destructuring ---");
console.log(beschreibe({ name: "Max", age: 30, email: "max@mail.de" }));
console.log(beschreibe({ name: "Anna", age: 25 }));

// ─── OPTIONS-OBJEKT-PATTERN ───────────────────────────────────────────────

// Das wichtigste Pattern fuer viele optionale Parameter
interface FetchOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

function fetchData({
  url,
  method = "GET",
  timeout = 5000,
  headers = {},
  retries = 0,
}: FetchOptions): void {
  console.log(`  ${method} ${url}`);
  console.log(`  Timeout: ${timeout}ms, Retries: ${retries}`);
  if (Object.keys(headers).length > 0) {
    console.log(`  Headers:`, headers);
  }
}

console.log("\n--- Options-Objekt-Pattern ---");

// Nur Pflichtfeld:
fetchData({ url: "https://api.example.com/users" });

// Einige Optionen:
fetchData({
  url: "https://api.example.com/users",
  method: "POST",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── SPREAD MIT FUNKTIONSPARAMETERN ───────────────────────────────────────

function multiply(a: number, b: number, c: number): number {
  return a * b * c;
}

const zahlen: [number, number, number] = [2, 3, 4];

console.log("\n--- Spread ---");
console.log(`multiply(...[2, 3, 4]) = ${multiply(...zahlen)}`);  // 24
