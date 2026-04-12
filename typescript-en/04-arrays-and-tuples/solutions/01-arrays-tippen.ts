/**
 * Lektion 04 — Loesung 01: Arrays tippen
 *
 * Hier findest du die vollstaendigen Loesungen mit Erklaerungen.
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Typisiere ein Array von Strings
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Einfach die T[] Kurzform verwenden.
// Hier waere auch kein Typ noetig (Inferenz!), aber die Aufgabe
// verlangt explizite Typisierung.
const staedte: string[] = ["Berlin", "Wien", "Zuerich"];

console.assert(staedte.length === 3, "Aufgabe 1: staedte sollte 3 Elemente haben");
console.assert(staedte[0] === "Berlin", "Aufgabe 1: erstes Element sollte Berlin sein");
console.log("✓ Aufgabe 1 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: Typisiere ein gemischtes Array korrekt
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Array<T> Syntax mit Union-Typ string | number.
// Die Array<T> Form macht bei Union-Typen die Absicht klarer
// als die Alternative (string | number)[].
const gemischt: Array<string | number> = ["hello", 42, "world", 7];

console.assert(gemischt.length === 4, "Aufgabe 2: gemischt sollte 4 Elemente haben");
console.assert(gemischt[1] === 42, "Aufgabe 2: zweites Element sollte 42 sein");
gemischt.push("test"); // funktioniert — string ist im Union
gemischt.push(99);     // funktioniert — number ist im Union
console.log("✓ Aufgabe 2 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: Erstelle ein readonly Array
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: readonly vor den Typ setzen.
// Alternativ: ReadonlyArray<string>
const farben: readonly string[] = ["rot", "gruen", "blau"];

console.assert(farben.length === 3, "Aufgabe 3: farben sollte 3 Elemente haben");
console.assert(farben.includes("rot"), "Aufgabe 3: farben sollte 'rot' enthalten");
// farben.push("gelb");  // Compile-Fehler! push gibt es nicht auf readonly arrays.
console.log("✓ Aufgabe 3 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: Array-Methoden mit korrekten Typen
// ═══════════════════════════════════════════════════════════════════════════════

const zahlen: number[] = [10, 20, 30, 40, 50];

// Loesung a: .map() mit Verdopplung
// map gibt ein neues Array zurueck — hier number[], weil die Callback-Funktion
// eine Zahl zurueckgibt.
const verdoppelt = zahlen.map(z => z * 2);

// Loesung b: .filter() fuer grosse Zahlen
// filter gibt ein Array des gleichen Typs zurueck.
const gross = zahlen.filter(z => z > 25);

// Loesung c: .find() fuer erste Zahl > 35
// WICHTIG: find() gibt T | undefined zurueck! Hier also number | undefined.
// Das ist logisch — find koennte nichts finden.
const gefunden = zahlen.find(z => z > 35);

console.assert(JSON.stringify(verdoppelt) === "[20,40,60,80,100]", "Aufgabe 4a: verdoppelt falsch");
console.assert(JSON.stringify(gross) === "[30,40,50]", "Aufgabe 4b: gross falsch");
console.assert(gefunden === 40, "Aufgabe 4c: gefunden sollte 40 sein");
console.log("✓ Aufgabe 4 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: Typ-Fehler beheben
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: w.toString() gibt einen String zurueck, aber der Rueckgabetyp
// ist number[]. Wir muessen w * w verwenden statt w.toString().
function quadriere(werte: number[]): number[] {
  return werte.map(w => w * w); // w * w statt w.toString()
}

const ergebnis = quadriere([2, 3, 4]);
console.assert(JSON.stringify(ergebnis) === "[4,9,16]", "Aufgabe 5: quadriere falsch");
console.log("✓ Aufgabe 5 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: 2D-Array Typ erstellen
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Ein 2D Array ist ein Array von Arrays.
// number[][] bedeutet: Array<Array<number>>
type Matrix = number[][];

const grid: Matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

console.assert(grid.length === 3, "Aufgabe 6: grid sollte 3 Zeilen haben");
console.assert(grid[1][2] === 6, "Aufgabe 6: grid[1][2] sollte 6 sein");
console.log("✓ Aufgabe 6 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: Funktion die ein Array zurueckgibt
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Generics machen die Funktion flexibel fuer jeden Typ.
// Array.from() mit einem Objekt das 'length' hat, und einer Map-Funktion
// die immer 'wert' zurueckgibt, ist ein eleganter Weg.
// Alternativ: new Array(anzahl).fill(wert)
function wiederhole<T>(wert: T, anzahl: number): T[] {
  return Array.from({ length: anzahl }, () => wert);
}

const has = wiederhole("ha", 3);
console.assert(JSON.stringify(has) === '["ha","ha","ha"]', "Aufgabe 7a: wiederhole string falsch");
const nums = wiederhole(42, 2);
console.assert(JSON.stringify(nums) === "[42,42]", "Aufgabe 7b: wiederhole number falsch");
console.log("✓ Aufgabe 7 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: Mutable Array zu readonly konvertieren
// ═══════════════════════════════════════════════════════════════════════════════

// Loesung: Der Rueckgabetyp ist readonly T[].
// Die Funktion gibt einfach das gleiche Array zurueck — aber mit einem
// restriktiveren Typ. Zur Laufzeit aendert sich nichts!
function einfrieren<T>(arr: T[]): readonly T[] {
  return arr;
}

const mutableZahlen = [1, 2, 3];
const readonlyZahlen = einfrieren(mutableZahlen);
console.assert(readonlyZahlen.length === 3, "Aufgabe 8: readonlyZahlen sollte 3 Elemente haben");
// readonlyZahlen.push(4);  // Compile-Fehler! readonly erlaubt kein push.
console.log("✓ Aufgabe 8 bestanden");

console.log("\n🏁 Alle Aufgaben bestanden!");
