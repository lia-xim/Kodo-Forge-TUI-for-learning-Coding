/**
 * Lektion 04 — Beispiel 04: Praktische Patterns
 *
 * Themen:
 *  - Funktion mit Tuple-Rueckgabe (useState-Style)
 *  - Spread-Operator und Typverhalten
 *  - Tuples in generischem Kontext
 *  - Map/Entries Tuple-Typen
 *
 * Fuehre aus mit: npx tsx examples/04-praktische-patterns.ts
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Funktion mit Tuple-Rueckgabe (useState-Style)
// ═══════════════════════════════════════════════════════════════════════════════

// React's useState-Hook gibt ein Tuple zurueck: [Wert, Setter]
// Wir bauen ein aehnliches Pattern:

function useState<T>(initial: T): [value: T, setValue: (newValue: T) => void] {
  let value = initial;
  const setValue = (newValue: T) => {
    value = newValue;
    console.log(`  Neuer Wert: ${JSON.stringify(newValue)}`);
  };
  return [value, setValue];
}

// Destructuring — wie bei React:
const [count, setCount] = useState(0);
//     ^-- number          ^-- (newValue: number) => void

const [userName, setUserName] = useState("Alice");
//     ^-- string                ^-- (newValue: string) => void

console.log("=== useState-Pattern ===");
console.log("Count:", count);
setCount(5);
console.log("Name:", userName);
setUserName("Bob");

// Warum Tuple und nicht Object?
// => Tuple erlaubt freie Benennung beim Destructuring:
const [x, setX] = useState(0);           // eigener Name!
const [visible, setVisible] = useState(true); // eigener Name!
console.log("x:", x, "visible:", visible);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Error-Handling mit Tuples (Go-Style)
// ═══════════════════════════════════════════════════════════════════════════════

// Go gibt oft [result, error] Tuples zurueck — das geht auch in TypeScript:
type Result<T> = [data: T, error: null] | [data: null, error: Error];

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return [null, new Error("Division durch Null!")];
  }
  return [a / b, null];
}

console.log("\n=== Error-Handling mit Tuples ===");

const [ergebnis1, fehler1] = divide(10, 2);
if (fehler1) {
  console.log("Fehler:", fehler1.message);
} else {
  console.log("10 / 2 =", ergebnis1); // TypeScript weiss: ergebnis1 ist number
}

const [ergebnis2, fehler2] = divide(10, 0);
if (fehler2) {
  console.log("Fehler:", fehler2.message); // "Division durch Null!"
} else {
  console.log("Ergebnis:", ergebnis2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Spread-Operator und Typverhalten
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Spread-Operator ===");

// Spread von Tuples erhaelt die Typen:
type Head = [string, number];
type Tail = [boolean];
type Combined = [...Head, ...Tail];
// Ergebnis: [string, number, boolean]

const combined: Combined = ["hello", 42, true];
console.log("Combined:", combined);

// ACHTUNG: Spread eines Tuples in ein Array verliert den Tuple-Typ!
const tup: [string, number] = ["hello", 42];
const arr = [...tup];
// arr ist (string | number)[], NICHT [string, number]!
console.log("Spread-Array Typ: (string | number)[]");

// Aber: Spread in eine typisierte Variable behaelt den Typ:
const tup2: [string, number] = [tup[0], tup[1]];
console.log("Typisierter Spread:", tup2);

// Spread fuer Funktionsparameter:
function greet(greeting: string, personName: string, age: number): string {
  return `${greeting}, ${personName}! Du bist ${age}.`;
}

const args: [string, string, number] = ["Hallo", "Alice", 30];
console.log(greet(...args)); // Spread des Tuples als Argumente

// Variadic Tuple Types: Generische Spreads
type Prepend<T, Tuple extends unknown[]> = [T, ...Tuple];

type WithId = Prepend<number, [string, boolean]>;
// Ergebnis: [number, string, boolean]

const withId: WithId = [1, "Alice", true];
console.log("WithId:", withId);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Tuples in generischem Kontext
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Generische Tuples ===");

// Generische Funktion die ein Paar zurueckgibt
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

const stringNum = pair("hello", 42);
// Typ: [string, number]
console.log("Pair:", stringNum);

const boolArr = pair(true, [1, 2, 3]);
// Typ: [boolean, number[]]
console.log("Pair:", boolArr);

// Generische Funktion die Tuple-Elemente tauscht
function swap<A, B>(tuple: [A, B]): [B, A] {
  return [tuple[1], tuple[0]];
}

const pairResult = pair("name", 42);
const swapped = swap(pairResult);
// Typ: [number, string]
console.log("Original:", pairResult, "Swapped:", swapped);

// Head und Tail extrahieren:
function head<T, Rest extends unknown[]>(tuple: [T, ...Rest]): T {
  return tuple[0];
}

function tail<T, Rest extends unknown[]>(tuple: [T, ...Rest]): Rest {
  const [, ...rest] = tuple;
  return rest as Rest;
}

const meinTuple: [string, number, boolean] = ["hi", 42, true];
console.log("Head:", head(meinTuple));  // "hi"
console.log("Tail:", tail(meinTuple));  // [42, true]

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Map / Entries / Object-Methoden mit Tuples
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Map/Entries mit Tuples ===");

// Object.entries gibt [string, T][] zurueck
interface User {
  name: string;
  age: number;
  active: boolean;
}

const user: User = { name: "Alice", age: 30, active: true };

// Jeder Entry ist ein [string, value] Tuple
const entries = Object.entries(user);
// Typ: [string, string | number | boolean][]

for (const [key, value] of entries) {
  console.log(`  ${key}: ${value} (typeof: ${typeof value})`);
}

// Map mit Tuple-Eintraegen
const preisListe = new Map<string, number>([
  ["Apfel", 1.50],
  ["Banane", 0.80],
  ["Kirsche", 3.20],
]);

// Map.entries() gibt [K, V] Tuples zurueck
preisListe.forEach((preis, frucht) => {
  console.log(`  ${frucht}: ${preis.toFixed(2)} EUR`);
});

// Array von Tuples als Map-Initialisierer
type PreisEintrag = [name: string, preis: number];
const preise: PreisEintrag[] = [
  ["Brot", 2.50],
  ["Milch", 1.20],
  ["Kaese", 4.80],
];

const preisMap = new Map(preise);
console.log("Brot kostet:", preisMap.get("Brot"), "EUR");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Enum-aehnliches Pattern mit as const Tuples
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Enum-Pattern mit as const ===");

// Statt enum: as const Tuple fuer erlaubte Werte
const ROLLEN = ["admin", "user", "moderator", "gast"] as const;
// Typ: readonly ["admin", "user", "moderator", "gast"]

// Typ aus dem Tuple ableiten:
type Rolle = (typeof ROLLEN)[number];
// Typ: "admin" | "user" | "moderator" | "gast"

function hatZugriff(rolle: Rolle): boolean {
  return rolle === "admin" || rolle === "moderator";
}

// hatZugriff("hacker");  // Fehler! "hacker" ist keine gueltige Rolle
console.log("Admin hat Zugriff:", hatZugriff("admin"));
console.log("Gast hat Zugriff:", hatZugriff("gast"));

// Pruefen ob ein Wert eine gueltige Rolle ist:
function istGueltigeRolle(wert: string): wert is Rolle {
  return (ROLLEN as readonly string[]).includes(wert);
}

const eingabe = "moderator";
if (istGueltigeRolle(eingabe)) {
  console.log(`"${eingabe}" ist eine gueltige Rolle`);
  // Hier weiss TypeScript: eingabe ist Rolle
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Event-Handler Pattern mit Tuples
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Event-Handler Pattern ===");

// Events als Tuple-Union definieren:
type AppEvent =
  | [type: "click", x: number, y: number]
  | [type: "keypress", key: string]
  | [type: "scroll", deltaY: number];

function handleEvent(event: AppEvent): void {
  const [type] = event;

  switch (type) {
    case "click": {
      const [, x, y] = event;
      console.log(`  Click bei (${x}, ${y})`);
      break;
    }
    case "keypress": {
      const [, key] = event;
      console.log(`  Taste: ${key}`);
      break;
    }
    case "scroll": {
      const [, deltaY] = event;
      console.log(`  Scroll: ${deltaY}px`);
      break;
    }
  }
}

handleEvent(["click", 100, 200]);
handleEvent(["keypress", "Enter"]);
handleEvent(["scroll", -50]);

console.log("\n✓ Alle Beispiele erfolgreich durchgelaufen!");
