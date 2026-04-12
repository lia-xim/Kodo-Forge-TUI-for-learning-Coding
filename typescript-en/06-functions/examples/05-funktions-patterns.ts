/**
 * Lektion 06 - Example 05: Funktions-Patterns
 *
 * Ausfuehren mit: npx tsx examples/05-funktions-patterns.ts
 *
 * Zeigt Type Guards, Assertion Functions, Factory Functions,
 * Constructor Signatures und Currying.
 */

// ─── TYPE GUARDS ───────────────────────────────────────────────────────────

// Einfacher Type Guard mit "value is Type"
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

console.log("--- Type Guards ---");
const werte: unknown[] = ["hallo", 42, true, null, "welt", 3.14];

const strings = werte.filter(isString);
// strings hat Typ: string[] — dank Type Guard!
console.log(`Strings: [${strings.join(", ")}]`);

const numbers = werte.filter(isNumber);
console.log(`Numbers: [${numbers.join(", ")}]`);

// ─── TYPE GUARD FUER KOMPLEXE TYPEN ───────────────────────────────────────

interface Produkt {
  name: string;
  preis: number;
  kategorie: string;
}

function isProdukt(value: unknown): value is Produkt {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "preis" in value &&
    "kategorie" in value &&
    typeof (value as Produkt).name === "string" &&
    typeof (value as Produkt).preis === "number" &&
    typeof (value as Produkt).kategorie === "string"
  );
}

console.log("\n--- Type Guard: Produkt ---");
const apiDaten: unknown[] = [
  { name: "Laptop", preis: 999, kategorie: "Elektronik" },
  { name: "Stuhl", preis: "guenstig" },  // preis ist kein number!
  null,
  { name: "Maus", preis: 29, kategorie: "Zubehoer" },
];

const produkte = apiDaten.filter(isProdukt);
console.log(`Gueltige Produkte: ${produkte.length}`);
produkte.forEach(p => console.log(`  ${p.name}: ${p.preis} EUR`));

// ─── ASSERTION FUNCTIONS ───────────────────────────────────────────────────

function assertIsString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`${name} muss ein String sein, erhalten: ${typeof value}`);
  }
}

function assertIsDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${name} darf nicht ${value} sein`);
  }
}

console.log("\n--- Assertion Functions ---");

function verarbeiteEingabe(input: unknown): string {
  assertIsString(input, "input");
  // Ab hier: input ist string — garantiert!
  return input.toUpperCase();
}

console.log(verarbeiteEingabe("hallo"));  // "HALLO"
try {
  verarbeiteEingabe(42);
} catch (e) {
  console.log(`Fehler: ${(e as Error).message}`);
}

// assertIsDefined mit nullable Werten:
function findUser(id: number): { name: string } | null {
  if (id === 1) return { name: "Max" };
  return null;
}

const user = findUser(1);
assertIsDefined(user, "User");
// Ab hier: user ist { name: string } — nicht null!
console.log(`User gefunden: ${user.name}`);

// ─── FACTORY FUNCTIONS ─────────────────────────────────────────────────────

interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

function createLogger(prefix: string): Logger {
  const timestamp = () => new Date().toLocaleTimeString("de-DE");

  return {
    info(msg) {
      console.log(`  [${timestamp()}] [${prefix}] INFO: ${msg}`);
    },
    warn(msg) {
      console.log(`  [${timestamp()}] [${prefix}] WARN: ${msg}`);
    },
    error(msg) {
      console.log(`  [${timestamp()}] [${prefix}] ERROR: ${msg}`);
    },
  };
}

console.log("\n--- Factory Functions ---");
const appLogger = createLogger("App");
const dbLogger = createLogger("DB");

appLogger.info("Gestartet");
dbLogger.info("Verbunden");
dbLogger.warn("Langsame Abfrage");
appLogger.error("Unbehandelter Fehler");

// ─── CURRYING ──────────────────────────────────────────────────────────────

// Einfaches Currying: Funktion gibt Funktion zurueck
function multiply(factor: number): (value: number) => number {
  return (value) => factor * value;
}

console.log("\n--- Currying ---");
const double = multiply(2);
const triple = multiply(3);
const tenfold = multiply(10);

console.log(`double(5) = ${double(5)}`);      // 10
console.log(`triple(5) = ${triple(5)}`);      // 15
console.log(`tenfold(5) = ${tenfold(5)}`);    // 50

// Currying fuer Konfiguration:
function createGreeter(greeting: string): (name: string) => string {
  return (name) => `${greeting}, ${name}!`;
}

const hallo = createGreeter("Hallo");
const moin = createGreeter("Moin");

console.log(hallo("Max"));   // "Hallo, Max!"
console.log(moin("Anna"));   // "Moin, Anna!"

// ─── PIPE / COMPOSE PATTERN ───────────────────────────────────────────────

// Zwei Funktionen hintereinander ausfuehren
function pipe<A, B, C>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
): (a: A) => C {
  return (a) => fn2(fn1(a));
}

console.log("\n--- Pipe Pattern ---");
const shoutGreeting = pipe(
  (name: string) => `Hallo, ${name}!`,
  (greeting: string) => greeting.toUpperCase(),
);

console.log(shoutGreeting("Max"));   // "HALLO, MAX!"
console.log(shoutGreeting("Anna"));  // "HALLO, ANNA!"

// Pipe mit Zahlen:
const processNumber = pipe(
  (n: number) => n * 2,
  (n: number) => `Ergebnis: ${n}`,
);

console.log(processNumber(21));  // "Ergebnis: 42"

// ─── isNonNull TYPE GUARD ──────────────────────────────────────────────────

// Praktischer Type Guard: null/undefined aus Arrays entfernen
function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

console.log("\n--- isNonNull Guard ---");
const mixedArray = [1, null, 2, undefined, 3, null, 4];
const cleanArray = mixedArray.filter(isNonNull);
// cleanArray: number[] — alle null/undefined entfernt!
console.log(`Clean: [${cleanArray}]`);  // [1, 2, 3, 4]

const userNames: (string | null)[] = ["Max", null, "Anna", null, "Bob"];
const validNames = userNames.filter(isNonNull);
// validNames: string[]
console.log(`Valid: [${validNames}]`);  // ["Max", "Anna", "Bob"]
