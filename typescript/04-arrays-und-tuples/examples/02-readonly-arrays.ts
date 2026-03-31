/**
 * Lektion 04 — Beispiel 02: Readonly Arrays
 *
 * Themen:
 *  - Readonly Array erstellen
 *  - Welche Methoden sind erlaubt / blockiert
 *  - Defensive Programmierung mit readonly
 *  - Object.freeze vs readonly
 *
 * Fuehre aus mit: npx tsx examples/02-readonly-arrays.ts
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Das Problem: Ungewollte Mutation
// ═══════════════════════════════════════════════════════════════════════════════

function sortierUnsicher(namen: string[]): string[] {
  // GEFAHR: sort() veraendert das Original-Array!
  return namen.sort();
}

const original = ["Charlie", "Alice", "Bob"];
const sortiert = sortierUnsicher(original);

console.log("=== Problem: Mutation ===");
console.log("Sortiert:", sortiert);
console.log("Original (veraendert!):", original);
// original ist jetzt ["Alice", "Bob", "Charlie"] — nicht mehr das Original!

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Die Loesung: readonly Arrays
// ═══════════════════════════════════════════════════════════════════════════════

// Kurzform: readonly T[]
const readonlyNamen: readonly string[] = ["Alice", "Bob", "Charlie"];

// Generische Form: ReadonlyArray<T>
const readonlyZahlen: ReadonlyArray<number> = [1, 2, 3, 4, 5];

// Beide Formen sind identisch — waehle die, die du lesbarer findest

console.log("\n=== Readonly Arrays ===");
console.log("readonlyNamen:", readonlyNamen);
console.log("readonlyZahlen:", readonlyZahlen);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Erlaubte Operationen auf readonly Arrays
// ═══════════════════════════════════════════════════════════════════════════════

const farben: readonly string[] = ["rot", "gruen", "blau"];

// LESEN — alles erlaubt:
console.log("\n=== Erlaubte Operationen ===");
console.log("Laenge:", farben.length);              // ok
console.log("Index 0:", farben[0]);                  // ok
console.log("Includes:", farben.includes("rot"));    // ok
console.log("IndexOf:", farben.indexOf("gruen"));    // ok
console.log("Find:", farben.find(f => f === "blau")); // ok

// Methoden die ein NEUES Array zurueckgeben — erlaubt:
const grossFarben = farben.map(f => f.toUpperCase());
console.log("Map (neues Array):", grossFarben);

const gefiltert = farben.filter(f => f.length > 3);
console.log("Filter (neues Array):", gefiltert);

const kopie = farben.slice();
console.log("Slice (Kopie):", kopie);

const zusammen = farben.concat(["gelb"]);
console.log("Concat (neues Array):", zusammen);

// forEach — liest nur, aendert nichts am Array
farben.forEach(f => console.log("  ForEach:", f));

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Blockierte Operationen auf readonly Arrays
// ═══════════════════════════════════════════════════════════════════════════════

// Alle diese Zeilen wuerden Compile-Fehler erzeugen:
// farben.push("gelb");         // Property 'push' does not exist
// farben.pop();                // Property 'pop' does not exist
// farben.sort();               // Property 'sort' does not exist
// farben.reverse();            // Property 'reverse' does not exist
// farben.splice(0, 1);        // Property 'splice' does not exist
// farben.shift();              // Property 'shift' does not exist
// farben.unshift("weiss");    // Property 'unshift' does not exist
// farben[0] = "schwarz";      // Index signature is readonly

console.log("\n=== Blockierte Operationen ===");
console.log("push, pop, sort, reverse, splice, shift, unshift, [i]=x");
console.log("=> Alle blockiert auf readonly Arrays!");

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Sichere Funktion mit readonly Parameter
// ═══════════════════════════════════════════════════════════════════════════════

// Diese Funktion KANN das Array nicht veraendern:
function sortierSicher(namen: readonly string[]): string[] {
  // namen.sort();  // Fehler! Wuerde das Original veraendern.

  // Stattdessen: Kopie erstellen und sortieren
  return [...namen].sort();
}

const original2 = ["Charlie", "Alice", "Bob"];
const sortiert2 = sortierSicher(original2);

console.log("\n=== Sichere Funktion ===");
console.log("Sortiert:", sortiert2);
console.log("Original (unveraendert!):", original2);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Zuweisung: mutable -> readonly (ok) vs readonly -> mutable (Fehler)
// ═══════════════════════════════════════════════════════════════════════════════

const mutableArr: string[] = ["A", "B", "C"];

// Mutable -> readonly: OK! Weniger Rechte geben ist sicher.
const readonlyRef: readonly string[] = mutableArr;

// Readonly -> mutable: FEHLER! Mehr Rechte geben waere unsicher.
// const mutableRef: string[] = readonlyRef;
// Fehler: 'readonly string[]' is not assignable to 'string[]'

console.log("\n=== Zuweisungsregeln ===");
console.log("mutable -> readonly: erlaubt");
console.log("readonly -> mutable: NICHT erlaubt");

// Wenn du es doch brauchst: Explizite Kopie
const mutableKopie: string[] = [...readonlyRef];
mutableKopie.push("D"); // Jetzt ok — es ist eine Kopie!
console.log("Kopie (mutable):", mutableKopie);
console.log("ReadonlyRef (unveraendert):", readonlyRef);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Object.freeze vs readonly
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Object.freeze vs readonly ===");

// readonly ist NUR zur Compile-Zeit — kein Laufzeit-Schutz
const readonlyArr: readonly number[] = [1, 2, 3];
// readonlyArr.push(4);  // Compile-Fehler
// Aber zur Laufzeit existiert die Einschraenkung nicht!

// Object.freeze schuetzt auch zur Laufzeit
const frozenArr = Object.freeze([1, 2, 3]);
// frozenArr.push(4);  // Compile-Fehler UND wuerde zur Laufzeit fehlschlagen

// TypeScript inferiert Object.freeze als readonly:
// typeof frozenArr = readonly number[]
console.log("Frozen Array:", frozenArr);

// Wichtig: Object.freeze ist flach (shallow)!
const tiefes = Object.freeze([{ name: "Alice" }, { name: "Bob" }]);
// tiefes.push({name: "Charlie"});  // Fehler — Array ist frozen
tiefes[0].name = "ALICE";           // OK! — Objekte drin sind NICHT frozen!
console.log("Tiefes Freeze (Objekte mutable!):", tiefes);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Praxis-Pattern: Defensive Funktions-Signatur
// ═══════════════════════════════════════════════════════════════════════════════

interface Config {
  erlaubteRollen: readonly string[];
  erlaubtePorts: ReadonlyArray<number>;
}

function pruefeZugriff(config: Config, rolle: string): boolean {
  // config.erlaubteRollen.push("admin");  // Fehler! Kann Config nicht veraendern.
  return config.erlaubteRollen.includes(rolle);
}

const appConfig: Config = {
  erlaubteRollen: ["user", "admin", "moderator"],
  erlaubtePorts: [80, 443, 8080],
};

console.log("\n=== Defensive Funktions-Signatur ===");
console.log("Hat admin:", pruefeZugriff(appConfig, "admin"));    // true
console.log("Hat gast:", pruefeZugriff(appConfig, "gast"));      // false
console.log("Config unveraendert:", appConfig.erlaubteRollen);

console.log("\n✓ Alle Beispiele erfolgreich durchgelaufen!");
