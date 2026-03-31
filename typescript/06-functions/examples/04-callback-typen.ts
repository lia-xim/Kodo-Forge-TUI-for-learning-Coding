/**
 * Lektion 06 - Example 04: Callback-Typen
 *
 * Ausfuehren mit: npx tsx examples/04-callback-typen.ts
 *
 * Zeigt Callback-Typisierung, void-Callbacks, generische Callbacks,
 * und haeufige Callback-Patterns.
 */

// ─── EINFACHE CALLBACKS ───────────────────────────────────────────────────

type StringTransformer = (input: string) => string;

function transformAll(items: string[], fn: StringTransformer): string[] {
  return items.map(fn);
}

console.log("--- Einfache Callbacks ---");
console.log(transformAll(["hallo", "welt"], s => s.toUpperCase()));
// ["HALLO", "WELT"]
console.log(transformAll(["Max", "Anna"], s => `Hallo, ${s}!`));
// ["Hallo, Max!", "Hallo, Anna!"]

// ─── VOID-CALLBACKS: DIE UEBERRASCHUNG ─────────────────────────────────────

type VoidCallback = (value: string) => void;

// Alle diese sind gueltig — obwohl void "kein Return" sagt:
const callbacks: VoidCallback[] = [
  (s) => { console.log(s); },         // gibt undefined zurueck
  (s) => { return s.length; },        // gibt number zurueck — OK!
  (s) => s.toUpperCase(),             // gibt string zurueck — OK!
];

console.log("\n--- void-Callbacks ---");
callbacks.forEach(fn => fn("test"));

// DAS erklaert warum forEach mit push funktioniert:
const collected: number[] = [];
[1, 2, 3].forEach(n => collected.push(n));
// push gibt number zurueck, forEach erwartet void — funktioniert!
console.log(`Gesammelt: [${collected}]`);  // [1, 2, 3]

// ─── VOID: DEKLARATION VS CALLBACK ────────────────────────────────────────

// Bei Deklarationen ist void STRENG:
function doWork(): void {
  // return 42;  // Error! Typ 'number' kann 'void' nicht zugewiesen werden
}

// Bei Callback-Typen ist void TOLERANT:
type Worker = () => void;
const worker: Worker = () => 42;  // OK! Callback-void ist tolerant

console.log("\n--- void: Deklaration vs Callback ---");
console.log(`doWork() = ${doWork()}`);       // undefined
console.log(`worker() = ${worker()}`);       // 42 (wird ignoriert)

// ─── GENERISCHE CALLBACKS ──────────────────────────────────────────────────

// Mapper: Wandelt T in U um
type Mapper<T, U> = (item: T, index: number) => U;

function mapArray<T, U>(items: T[], mapper: Mapper<T, U>): U[] {
  return items.map((item, index) => mapper(item, index));
}

console.log("\n--- Generische Callbacks ---");
// T = string, U = number (inferiert)
const lengths = mapArray(["hallo", "welt", "!"], (s) => s.length);
console.log(`Laengen: [${lengths}]`);  // [5, 4, 1]

// T = number, U = string (inferiert)
const labels = mapArray([1, 2, 3], (n, i) => `${i}: ${n * 10}`);
console.log(`Labels: [${labels}]`);  // ["0: 10", "1: 20", "2: 30"]

// ─── PREDICATE-CALLBACK ───────────────────────────────────────────────────

type Predicate<T> = (item: T) => boolean;

function filterArray<T>(items: T[], predicate: Predicate<T>): T[] {
  return items.filter(predicate);
}

console.log("\n--- Predicate-Callback ---");
const zahlen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const gerade = filterArray(zahlen, n => n % 2 === 0);
console.log(`Gerade: [${gerade}]`);  // [2, 4, 6, 8, 10]

const namen = ["Max", "Anna", "Bob", "Alexandra"];
const langeNamen = filterArray(namen, n => n.length > 3);
console.log(`Lange Namen: [${langeNamen}]`);  // ["Anna", "Alexandra"]

// ─── COMPARATOR-CALLBACK ──────────────────────────────────────────────────

type Comparator<T> = (a: T, b: T) => number;

function sortBy<T>(items: T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare);
}

interface Produkt {
  name: string;
  preis: number;
}

const produkte: Produkt[] = [
  { name: "Laptop", preis: 999 },
  { name: "Maus", preis: 29 },
  { name: "Tastatur", preis: 79 },
  { name: "Monitor", preis: 449 },
];

console.log("\n--- Comparator-Callback ---");
const nachPreis = sortBy(produkte, (a, b) => a.preis - b.preis);
nachPreis.forEach(p => console.log(`  ${p.name}: ${p.preis} EUR`));

const nachName = sortBy(produkte, (a, b) => a.name.localeCompare(b.name));
console.log("\nNach Name:");
nachName.forEach(p => console.log(`  ${p.name}`));

// ─── ERROR-FIRST CALLBACK (NODE.JS-STYLE) ─────────────────────────────────

type NodeCallback<T> = (error: Error | null, data?: T) => void;

function simulateRead(path: string, callback: NodeCallback<string>): void {
  if (path.endsWith(".txt")) {
    callback(null, `Inhalt von ${path}`);
  } else {
    callback(new Error(`Datei nicht gefunden: ${path}`));
  }
}

console.log("\n--- Error-First Callback ---");
simulateRead("readme.txt", (err, data) => {
  if (err) {
    console.log(`  Fehler: ${err.message}`);
  } else {
    console.log(`  Daten: ${data}`);
  }
});

simulateRead("bild.png", (err, data) => {
  if (err) {
    console.log(`  Fehler: ${err.message}`);
  } else {
    console.log(`  Daten: ${data}`);
  }
});

// ─── CALLBACK MIT UNSUBSCRIBE-PATTERN ──────────────────────────────────────

type EventListener<T> = (event: T) => void;
type Unsubscribe = () => void;

function onEvent<T>(name: string, listener: EventListener<T>): Unsubscribe {
  console.log(`  Listener fuer "${name}" registriert`);
  // In der Realitaet: Event-Listener registrieren
  return () => {
    console.log(`  Listener fuer "${name}" entfernt`);
  };
}

console.log("\n--- Unsubscribe-Pattern ---");
const unsub = onEvent<{ x: number; y: number }>("click", (e) => {
  console.log(`  Klick bei (${e.x}, ${e.y})`);
});
unsub();  // Listener entfernen
