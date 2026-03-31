/**
 * Lektion 04 — Beispiel 01: Array-Grundlagen
 *
 * Themen:
 *  - T[] vs Array<T> Syntax
 *  - Array-Inferenz bei gemischten Typen
 *  - Array-Methoden und ihre Rueckgabetypen
 *  - Mehrdimensionale Arrays
 *
 * Fuehre aus mit: npx tsx examples/01-array-basics.ts
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. T[] vs Array<T> — Zwei Schreibweisen, gleicher Typ
// ═══════════════════════════════════════════════════════════════════════════════

// Kurzform — wird am haeufigsten verwendet
const namen: string[] = ["Alice", "Bob", "Charlie"];
const zahlen: number[] = [1, 2, 3, 4, 5];
const aktiv: boolean[] = [true, false, true];

// Generische Form — funktional identisch
const namen2: Array<string> = ["Alice", "Bob", "Charlie"];
const zahlen2: Array<number> = [1, 2, 3, 4, 5];
const aktiv2: Array<boolean> = [true, false, true];

console.log("=== T[] vs Array<T> ===");
console.log("namen:", namen);
console.log("namen2:", namen2);
console.log("Gleich?", JSON.stringify(namen) === JSON.stringify(namen2)); // true

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Wann Array<T> lesbarer ist: Komplexe Typen
// ═══════════════════════════════════════════════════════════════════════════════

// ACHTUNG: Mehrdeutigkeit bei Union-Typen mit Kurzform!
let ambig1: string | number[];       // Dies ist: string ODER number[]
let ambig2: (string | number)[];     // Dies ist: Array von (string | number)
let klar: Array<string | number>;    // Eindeutig: Array von string | number

// ambig1 kann ein einzelner String sein:
ambig1 = "hallo";  // ok
ambig1 = [1, 2];   // ok

// ambig2 MUSS ein Array sein:
// ambig2 = "hallo";  // Fehler!
ambig2 = ["hallo", 42]; // ok

// klar ist dasselbe wie ambig2 — nur lesbarer:
klar = ["hallo", 42]; // ok

console.log("\n=== Komplexe Typen ===");
console.log("ambig2:", ambig2);
console.log("klar:", klar);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Array-Inferenz bei gemischten Typen
// ═══════════════════════════════════════════════════════════════════════════════

// TypeScript bildet automatisch eine Union
const gemischt = ["hello", 42, "world", 7];
// Inferierter Typ: (string | number)[]

const bunt = ["text", 123, true, null];
// Inferierter Typ: (string | number | boolean | null)[]

const nurStrings = ["a", "b", "c"];
// Inferierter Typ: string[]  (keine Union noetig)

console.log("\n=== Inferenz bei gemischten Typen ===");
console.log("gemischt:", gemischt);
console.log("bunt:", bunt);

// Was TypeScript erlaubt, basiert auf dem inferierten Typ:
gemischt.push("noch ein string"); // ok — string ist in string | number
gemischt.push(99);                // ok — number ist in string | number
// gemischt.push(true);           // Fehler! boolean nicht in string | number

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Array-Methoden und ihre Rueckgabetypen
// ═══════════════════════════════════════════════════════════════════════════════

const fruits: string[] = ["Apfel", "Banane", "Kirsche", "Dattel"];

// map() — gibt ein neues Array zurueck, Typ wird inferiert
const laengen = fruits.map(f => f.length);
// Typ: number[]
console.log("\n=== Array-Methoden ===");
console.log("Laengen:", laengen);

// filter() — gibt ein Array des gleichen Typs zurueck
const kurzeFruits = fruits.filter(f => f.length <= 6);
// Typ: string[]
console.log("Kurze Fruits:", kurzeFruits);

// find() — gibt T | undefined zurueck!
const gefunden = fruits.find(f => f.startsWith("B"));
// Typ: string | undefined  (NICHT string!)
console.log("Gefunden:", gefunden);

// reduce() — Rueckgabetyp haengt vom Anfangswert ab
const gesamtLaenge = fruits.reduce((sum, f) => sum + f.length, 0);
// Typ: number (weil der Anfangswert 0 ist)
console.log("Gesamtlaenge:", gesamtLaenge);

// flat() — reduziert Verschachtelung
const verschachtelt = [[1, 2], [3, 4], [5]];
const flach = verschachtelt.flat();
// Typ: number[]
console.log("Flach:", flach);

// flatMap() — map + flat in einem Schritt
const woerter = ["Hallo Welt", "TypeScript ist toll"];
const buchstaben = woerter.flatMap(s => s.split(" "));
// Typ: string[]
console.log("Woerter:", buchstaben);

// includes() — gibt boolean zurueck
const hatBanane: boolean = fruits.includes("Banane");
console.log("Hat Banane:", hatBanane);

// indexOf() — gibt number zurueck (-1 wenn nicht gefunden)
const indexBanane: number = fruits.indexOf("Banane");
console.log("Index Banane:", indexBanane);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Mehrdimensionale Arrays
// ═══════════════════════════════════════════════════════════════════════════════

// 2D Array (Matrix)
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// Zugriff: matrix[zeile][spalte]
console.log("\n=== Mehrdimensionale Arrays ===");
console.log("Matrix[1][2]:", matrix[1][2]); // 6

// 3D Array
const wuerfel: number[][][] = [
  [[1, 2], [3, 4]],
  [[5, 6], [7, 8]],
];
console.log("Wuerfel[1][0][1]:", wuerfel[1][0][1]); // 6

// Generische Form fuer mehrdimensionale Arrays:
const matrix2: Array<Array<number>> = [
  [10, 20],
  [30, 40],
];
console.log("Matrix2:", matrix2);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Array von Objekten — ein haeufiges Muster
// ═══════════════════════════════════════════════════════════════════════════════

interface User {
  name: string;
  alter: number;
  aktiv: boolean;
}

const users: User[] = [
  { name: "Alice", alter: 30, aktiv: true },
  { name: "Bob", alter: 25, aktiv: false },
  { name: "Charlie", alter: 35, aktiv: true },
];

// Methoden funktionieren typensicher:
const aktiveUser = users.filter(u => u.aktiv);
// Typ: User[]

const userNamen = users.map(u => u.name);
// Typ: string[]

const aeltester = users.reduce((max, u) => u.alter > max.alter ? u : max);
// Typ: User

console.log("\n=== Array von Objekten ===");
console.log("Aktive User:", aktiveUser.map(u => u.name));
console.log("User-Namen:", userNamen);
console.log("Aeltester:", aeltester.name);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Leeres Array — Vorsicht bei der Inferenz!
// ═══════════════════════════════════════════════════════════════════════════════

// Leeres Array ohne Annotation wird als any[] inferiert!
// const leer = [];  // Typ: any[] — schlecht!

// Besser: Typ explizit angeben
const leerTypisiert: string[] = [];
leerTypisiert.push("jetzt typisiert");

// Oder mit Generics:
const leerGeneric: Array<number> = [];
leerGeneric.push(42);

console.log("\n=== Leere Arrays ===");
console.log("leerTypisiert:", leerTypisiert);
console.log("leerGeneric:", leerGeneric);

console.log("\n✓ Alle Beispiele erfolgreich durchgelaufen!");
