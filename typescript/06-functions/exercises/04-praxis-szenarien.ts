/**
 * Lektion 06 - Exercise 04: Praxis-Szenarien
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-praxis-szenarien.ts
 *
 * 5 realistische Aufgaben, die Funktions-Konzepte kombinieren.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Pipe-Funktion
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "pipe" die zwei Funktionen verkettet.
// pipe(f, g)(x) soll das gleiche sein wie g(f(x)).
// Tippe die Funktion generisch: pipe<A, B, C>

// function pipe<A, B, C>(fn1: ???, fn2: ???): ??? { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Retry mit Callback
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "retry" die eine Funktion ausfuehrt.
// Wenn sie einen Error wirft, wird sie bis zu n-mal wiederholt.
// Parameter: fn (die Funktion), maxAttempts (default: 3)
// Return: Das Ergebnis von fn() oder der letzte Error.

// function retry<T>(fn: () => T, maxAttempts?: number): T { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Event-Emitter mit generischen Events
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Baue einen typsicheren Event-Emitter.
// Die Event-Map bestimmt welche Events mit welchen Daten existieren.

interface AppEvents {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  error: { message: string; code: number };
}

// TODO: Schreibe createTypedEmitter so, dass:
// emitter.on("login", (data) => ...) — data ist { userId: string; timestamp: number }
// emitter.emit("login", { userId: "123", timestamp: Date.now() })

// function createTypedEmitter<Events extends Record<string, unknown>>(): { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Builder-Pattern mit Methoden-Chaining
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen QueryBuilder mit Methoden-Chaining.
// Jede Methode gibt "this" (den Builder) zurueck.

// interface QueryBuilder { ... }
// function createQueryBuilder(): QueryBuilder { ... }
//
// Beispiel:
// createQueryBuilder()
//   .select("name", "age")
//   .from("users")
//   .where("age > 18")
//   .build()
// → "SELECT name, age FROM users WHERE age > 18"

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Curried Formatter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine curried Formatter-Funktion:
// createFormatter(locale)(style)(value)
// - locale: "de-DE" | "en-US"
// - style: "currency" | "percent" | "decimal"
// - value: number
// Nutze Intl.NumberFormat intern.

// function createFormatter(locale: string): ... { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese nach dem Loesen
// ═══════════════════════════════════════════════════════════════════════════

/*
// Aufgabe 1
const addOne = (n: number) => n + 1;
const double = (n: number) => n * 2;
const addOneThenDouble = pipe(addOne, double);
console.assert(addOneThenDouble(5) === 12, "A1: pipe (5+1)*2=12");
const toStr = (n: number) => String(n);
const addExcl = (s: string) => s + "!";
const numToExcl = pipe(toStr, addExcl);
console.assert(numToExcl(42) === "42!", "A1: pipe mixed types");

// Aufgabe 2
let attempt = 0;
const ergebnis = retry(() => {
  attempt++;
  if (attempt < 3) throw new Error("Noch nicht");
  return "Erfolg";
}, 5);
console.assert(ergebnis === "Erfolg", "A2: retry erfolgreich nach 3 Versuchen");
try {
  retry(() => { throw new Error("Immer Fehler"); }, 2);
  console.assert(false, "A2: sollte werfen");
} catch { console.assert(true, "A2: retry wirft nach maxAttempts"); }

// Aufgabe 3
const emitter = createTypedEmitter<AppEvents>();
let loginData: AppEvents["login"] | null = null;
emitter.on("login", (data) => { loginData = data; });
emitter.emit("login", { userId: "u1", timestamp: 1000 });
console.assert(loginData?.userId === "u1", "A3: event emitter");

// Aufgabe 4
const query = createQueryBuilder()
  .select("name", "age")
  .from("users")
  .where("age > 18")
  .build();
console.assert(query === "SELECT name, age FROM users WHERE age > 18", "A4: query builder");

// Aufgabe 5
const formatDE = createFormatter("de-DE");
const formatCurrency = formatDE("currency");
// Anmerkung: Das Format kann je nach Node.js-Version leicht variieren.
// Hauptsache es gibt eine formatierte Zeichenkette zurueck.
const formatted = formatCurrency(1234.5);
console.assert(typeof formatted === "string", "A5: formatter gibt string zurueck");
console.assert(formatted.length > 0, "A5: formatter nicht leer");

console.log("Alle Tests bestanden!");
*/
