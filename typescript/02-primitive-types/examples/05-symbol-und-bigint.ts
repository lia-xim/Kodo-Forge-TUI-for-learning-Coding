/**
 * Lektion 02 - Example 05: symbol und bigint
 *
 * Ausfuehren mit: npx tsx examples/05-symbol-und-bigint.ts
 *
 * Zwei Typen die seltener vorkommen, aber in bestimmten
 * Situationen unverzichtbar sind.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 1: symbol — garantiert eindeutig
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== TEIL 1: symbol ===\n");

// ─── Grundlagen ────────────────────────────────────────────────────────────

// Jedes Symbol ist EINZIGARTIG, auch mit gleicher Beschreibung:
const sym1: symbol = Symbol("id");
const sym2: symbol = Symbol("id");

console.log(`sym1 === sym2: ${sym1 === sym2}`);  // false!
console.log(`sym1.toString(): ${sym1.toString()}`);  // "Symbol(id)"
console.log(`sym2.toString(): ${sym2.toString()}`);  // "Symbol(id)"

// Die Beschreibung ist nur fuer Debugging — sie macht Symbols nicht gleich

// ─── Symbols als Property-Keys ─────────────────────────────────────────────

console.log("\n--- Symbols als Property-Keys ---");

// Symbols sind ideal fuer "versteckte" oder kollisionssichere Properties
const geheimeId = Symbol("geheimeId");
const version = Symbol("version");

interface Dokument {
  titel: string;
  [geheimeId]: number;
  [version]: string;
}

const dok: Dokument = {
  titel: "Mein Dokument",
  [geheimeId]: 42,
  [version]: "1.0.0"
};

console.log(`Titel: ${dok.titel}`);
console.log(`Geheime ID: ${dok[geheimeId]}`);
console.log(`Version: ${dok[version]}`);

// Symbols sind UNSICHTBAR fuer normale Iteration:
console.log("\nfor...in zeigt:");
for (const key in dok) {
  console.log(`  ${key}: ${(dok as Record<string, unknown>)[key]}`);
}
// Nur "titel" — die Symbol-Properties sind versteckt!

// Man kann sie aber mit Object.getOwnPropertySymbols finden:
console.log("\nObject.getOwnPropertySymbols zeigt:");
const symbols = Object.getOwnPropertySymbols(dok);
for (const s of symbols) {
  console.log(`  ${s.toString()}: ${(dok as Record<symbol, unknown>)[s]}`);
}

// Auch JSON.stringify ignoriert Symbols:
console.log(`\nJSON.stringify: ${JSON.stringify(dok)}`);
// Nur {"titel":"Mein Dokument"} — Symbols fehlen

// ─── Symbol.for() — globale Registry ──────────────────────────────────────

console.log("\n--- Symbol.for() ---");

// Symbol.for() verwendet eine globale Registry:
const global1 = Symbol.for("app.config");
const global2 = Symbol.for("app.config");

console.log(`Symbol.for gleich: ${global1 === global2}`);  // true!
// Das ist der einzige Weg, gleiche Symbols zu bekommen

// Symbol.keyFor() gibt den Registry-Key zurueck:
console.log(`Key: ${Symbol.keyFor(global1)}`);  // "app.config"
console.log(`Key fuer normales Symbol: ${Symbol.keyFor(sym1)}`);  // undefined

// Praxisbeispiel: Cross-Module Kommunikation
const PLUGIN_API = Symbol.for("myapp.plugin.api");

// In Modul A:
const modulA = { [PLUGIN_API]: { version: "2.0" } };

// In Modul B (gleicher Symbol-Key, also gleicher Zugriff):
const api = (modulA as Record<symbol, unknown>)[Symbol.for("myapp.plugin.api")];
console.log(`Plugin API: ${JSON.stringify(api)}`);

// ─── unique symbol — TypeScript-spezifisch ─────────────────────────────────

console.log("\n--- unique symbol ---");

// unique symbol ist ein Subtyp von symbol der an EINE Deklaration gebunden ist
const MY_KEY: unique symbol = Symbol("MY_KEY");
const OTHER_KEY: unique symbol = Symbol("OTHER_KEY");

// TypeScript weiss: MY_KEY und OTHER_KEY sind verschiedene Typen!
// let test: typeof MY_KEY = OTHER_KEY;  // Error!

// unique symbol funktioniert nur mit const:
// let notConst: unique symbol = Symbol("x");  // Error! Muss const sein

// Praxisbeispiel: Typsichere Symbol-Keys
interface MeinObjekt {
  [MY_KEY]: string;
  [OTHER_KEY]: number;
}

const obj: MeinObjekt = {
  [MY_KEY]: "hallo",
  [OTHER_KEY]: 42
};

console.log(`MY_KEY: ${obj[MY_KEY]}`);      // "hallo"
console.log(`OTHER_KEY: ${obj[OTHER_KEY]}`); // 42

// ─── Well-Known Symbols ────────────────────────────────────────────────────

console.log("\n--- Well-Known Symbols ---");

// JavaScript hat eingebaute Symbols fuer Sprachfeatures:
// Symbol.iterator — macht Objekte iterable
// Symbol.toPrimitive — steuert Typ-Konvertierung
// Symbol.hasInstance — steuert instanceof

// Beispiel: Ein iterierbarer Bereich
class Bereich {
  constructor(
    private von: number,
    private bis: number
  ) {}

  [Symbol.iterator](): Iterator<number> {
    let aktuell = this.von;
    const ende = this.bis;
    return {
      next(): IteratorResult<number> {
        if (aktuell <= ende) {
          return { value: aktuell++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const bereich = new Bereich(1, 5);
console.log("Bereich 1-5:");
for (const zahl of bereich) {
  process.stdout.write(`  ${zahl}`);
}
console.log();

// Spread funktioniert auch:
console.log(`Als Array: [${[...new Bereich(10, 15)]}]`);

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: bigint — beliebig grosse ganze Zahlen
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 2: bigint ===\n");

// ─── Grundlagen ────────────────────────────────────────────────────────────

// bigint mit dem n-Suffix erstellen:
const gross: bigint = 9007199254740993n;  // Groesser als MAX_SAFE_INTEGER
const klein: bigint = 42n;
const negativ: bigint = -100n;

console.log(`gross: ${gross}`);
console.log(`klein: ${klein}`);
console.log(`negativ: ${negativ}`);

// Oder mit BigInt():
const vonString: bigint = BigInt("123456789012345678901234567890");
const vonNumber: bigint = BigInt(42);

console.log(`Von String: ${vonString}`);
console.log(`Von Number: ${vonNumber}`);

// ─── Warum bigint? — Das Praezisionsproblem ────────────────────────────────

console.log("\n--- Warum bigint noetig ist ---");

// number verliert Praezision bei grossen Zahlen:
const maxSafe = Number.MAX_SAFE_INTEGER;  // 9007199254740991
console.log(`MAX_SAFE_INTEGER: ${maxSafe}`);
console.log(`MAX_SAFE + 1: ${maxSafe + 1}`);  // 9007199254740992 — OK
console.log(`MAX_SAFE + 2: ${maxSafe + 2}`);  // 9007199254740992 — FALSCH!
console.log(`MAX_SAFE + 3: ${maxSafe + 3}`);  // 9007199254740994 — FALSCH!

// bigint hat dieses Problem nicht:
const maxSafeBig = BigInt(maxSafe);
console.log(`\nBigInt MAX_SAFE + 1: ${maxSafeBig + 1n}`);  // Korrekt!
console.log(`BigInt MAX_SAFE + 2: ${maxSafeBig + 2n}`);    // Korrekt!
console.log(`BigInt MAX_SAFE + 3: ${maxSafeBig + 3n}`);    // Korrekt!

// ─── Arithmetik ────────────────────────────────────────────────────────────

console.log("\n--- BigInt Arithmetik ---");

const a: bigint = 100n;
const b: bigint = 3n;

console.log(`${a} + ${b} = ${a + b}`);    // 103n
console.log(`${a} - ${b} = ${a - b}`);    // 97n
console.log(`${a} * ${b} = ${a * b}`);    // 300n
console.log(`${a} / ${b} = ${a / b}`);    // 33n (ganzzahlige Division!)
console.log(`${a} % ${b} = ${a % b}`);    // 1n
console.log(`${a} ** ${b} = ${a ** b}`);   // 1000000n

// ACHTUNG: Division ist ganzzahlig — kein Rest!
console.log(`\n10n / 3n = ${10n / 3n}`);   // 3n (nicht 3.33...)

// ─── WICHTIG: number und bigint mischen ist VERBOTEN ───────────────────────

console.log("\n--- Mischverbot ---");

const num: number = 42;
const big: bigint = 42n;

// const mix = num + big;  // Error! Cannot mix bigint and other types

// Man muss explizit konvertieren:
const summe1 = BigInt(num) + big;       // bigint + bigint = OK
const summe2 = num + Number(big);       // number + number = OK

console.log(`BigInt(42) + 42n = ${summe1}`);
console.log(`42 + Number(42n) = ${summe2}`);

// ACHTUNG bei Konvertierung: Praezisionsverlust moeglich!
const riesig = 9007199254740993n;
const alsNumber = Number(riesig);
console.log(`\nBigInt: ${riesig}`);
console.log(`Als Number: ${alsNumber}`);  // Praezisionsverlust!
console.log(`Gleich? ${BigInt(alsNumber) === riesig}`);  // false!

// ─── Vergleiche ────────────────────────────────────────────────────────────

console.log("\n--- Vergleiche ---");

// Vergleichsoperatoren funktionieren ZWISCHEN number und bigint:
console.log(`42n === 42: ${42n === 42 as unknown}`);   // false (verschiedene Typen)
console.log(`42n == 42: ${42n == 42 as unknown}`);     // true (gleicher Wert)
console.log(`42n < 43: ${42n < 43 as unknown}`);       // true
console.log(`42n > 41: ${42n > 41 as unknown}`);       // true

// ─── Einschraenkungen ──────────────────────────────────────────────────────

console.log("\n--- Einschraenkungen ---");

// 1. Kein JSON.stringify (wirft einen Error!)
try {
  JSON.stringify({ wert: 42n });
} catch (e) {
  console.log(`JSON.stringify Error: ${(e as Error).message}`);
}

// Workaround: Eigener Serializer
const mitBigInt = { id: 123n, name: "Test" };
const jsonString = JSON.stringify(mitBigInt, (_key, value) =>
  typeof value === "bigint" ? value.toString() + "n" : value
);
console.log(`Workaround: ${jsonString}`);

// 2. Kein Math — Math.round, Math.floor usw. funktionieren nicht
// Math.round(42n);  // Error!

// 3. Keine Dezimalstellen
// const dezimal = 3.14n;  // Error! bigint kann nur ganze Zahlen

// ─── Praxisbeispiele ───────────────────────────────────────────────────────

console.log("\n--- Praxisbeispiele ---");

// 1. Grosse IDs (z.B. Twitter/X Snowflake IDs)
const tweetId: bigint = 1580661436132757507n;
console.log(`Tweet ID: ${tweetId}`);

// 2. Kryptographische Berechnungen
const primzahl: bigint = 104729n;
const modular = (primzahl ** 2n) % 1000000007n;
console.log(`Modulare Potenz: ${modular}`);

// 3. Timestamps mit Nanosekunden-Praezision
const nanoTimestamp: bigint = BigInt(Date.now()) * 1000000n;
console.log(`Nano-Timestamp: ${nanoTimestamp}`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
