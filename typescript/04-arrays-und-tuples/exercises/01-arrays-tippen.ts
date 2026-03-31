/**
 * Lektion 04 — Uebung 01: Arrays tippen
 *
 * Aufgaben: Vervollstaendige die TODO-Stellen.
 * Pruefung: npx tsx exercises/01-arrays-tippen.ts
 *
 * Wenn alle console.assert()-Pruefungen bestehen, hast du alles richtig!
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Typisiere ein Array von Strings
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Gib der Variable den korrekten Typ (verwende die T[] Kurzform)
const staedte = ["Berlin", "Wien", "Zuerich"];

// Pruefung:
console.assert(staedte.length === 3, "Aufgabe 1: staedte sollte 3 Elemente haben");
console.assert(staedte[0] === "Berlin", "Aufgabe 1: erstes Element sollte Berlin sein");
console.log("✓ Aufgabe 1 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: Typisiere ein gemischtes Array korrekt
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Array namens 'gemischt' das Strings und Zahlen enthalten kann.
//       Es soll die Werte ["hello", 42, "world", 7] enthalten.
//       Verwende eine explizite Typ-Annotation mit Array<T> Syntax.

// Dein Code hier:
// const gemischt: ??? = ???;

// Pruefung (entferne die Kommentare wenn du fertig bist):
// console.assert(gemischt.length === 4, "Aufgabe 2: gemischt sollte 4 Elemente haben");
// console.assert(gemischt[1] === 42, "Aufgabe 2: zweites Element sollte 42 sein");
// gemischt.push("test"); // sollte funktionieren
// gemischt.push(99);     // sollte auch funktionieren
// console.log("✓ Aufgabe 2 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: Erstelle ein readonly Array
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein readonly Array namens 'farben' mit den Werten
//       ["rot", "gruen", "blau"]. Verwende die readonly T[] Syntax.

// Dein Code hier:
// const farben: ??? = ???;

// Pruefung (entferne die Kommentare wenn du fertig bist):
// console.assert(farben.length === 3, "Aufgabe 3: farben sollte 3 Elemente haben");
// console.assert(farben.includes("rot"), "Aufgabe 3: farben sollte 'rot' enthalten");
// // farben.push("gelb");  // Diese Zeile MUSS einen Compile-Fehler geben!
// console.log("✓ Aufgabe 3 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: Array-Methoden mit korrekten Typen
// ═══════════════════════════════════════════════════════════════════════════════

const zahlen: number[] = [10, 20, 30, 40, 50];

// TODO: Verwende .map() um ein neues Array mit den verdoppelten Werten zu erstellen.
//       Speichere das Ergebnis in einer Variablen namens 'verdoppelt'.

// Dein Code hier:
// const verdoppelt = ???;

// TODO: Verwende .filter() um nur Zahlen groesser als 25 zu behalten.
//       Speichere das Ergebnis in einer Variablen namens 'gross'.

// Dein Code hier:
// const gross = ???;

// TODO: Verwende .find() um die erste Zahl groesser als 35 zu finden.
//       Speichere das Ergebnis in einer Variablen namens 'gefunden'.
//       Welchen Typ hat 'gefunden'? (Denk dran: find kann auch nichts finden!)

// Dein Code hier:
// const gefunden = ???;

// Pruefung (entferne die Kommentare wenn du fertig bist):
// console.assert(JSON.stringify(verdoppelt) === "[20,40,60,80,100]", "Aufgabe 4a: verdoppelt falsch");
// console.assert(JSON.stringify(gross) === "[30,40,50]", "Aufgabe 4b: gross falsch");
// console.assert(gefunden === 40, "Aufgabe 4c: gefunden sollte 40 sein");
// console.log("✓ Aufgabe 4 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: Typ-Fehler beheben
// ═══════════════════════════════════════════════════════════════════════════════

// Der folgende Code hat einen Typ-Fehler. Finde und behebe ihn!
// Hinweis: Die Funktion soll ein Array von Zahlen zurueckgeben.

// TODO: Behebe den Typ-Fehler in dieser Funktion
/*
function quadriere(werte: number[]): number[] {
  return werte.map(w => w.toString()); // <-- Hier ist der Fehler!
}
*/

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const ergebnis = quadriere([2, 3, 4]);
// console.assert(JSON.stringify(ergebnis) === "[4,9,16]", "Aufgabe 5: quadriere falsch");
// console.log("✓ Aufgabe 5 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: 2D-Array Typ erstellen
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ-Alias namens 'Matrix' fuer ein 2D number Array.
//       Erstelle dann eine Variable 'grid' vom Typ Matrix mit diesen Werten:
//       [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

// Dein Code hier:
// type Matrix = ???;
// const grid: Matrix = ???;

// Pruefung (entferne die Kommentare wenn du fertig bist):
// console.assert(grid.length === 3, "Aufgabe 6: grid sollte 3 Zeilen haben");
// console.assert(grid[1][2] === 6, "Aufgabe 6: grid[1][2] sollte 6 sein");
// console.log("✓ Aufgabe 6 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: Funktion die ein Array zurueckgibt
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion 'wiederhole', die einen Wert und eine Anzahl
//       nimmt und ein Array zurueckgibt, das den Wert n-mal enthaelt.
//       Verwende Generics, damit die Funktion mit jedem Typ funktioniert!
//
//       Beispiel: wiederhole("ha", 3) => ["ha", "ha", "ha"]
//       Beispiel: wiederhole(42, 2) => [42, 42]

// Dein Code hier:
// function wiederhole<T>(???, ???): ??? {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const has = wiederhole("ha", 3);
// console.assert(JSON.stringify(has) === '["ha","ha","ha"]', "Aufgabe 7a: wiederhole string falsch");
// const nums = wiederhole(42, 2);
// console.assert(JSON.stringify(nums) === "[42,42]", "Aufgabe 7b: wiederhole number falsch");
// console.log("✓ Aufgabe 7 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: Mutable Array zu readonly konvertieren
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Du hast ein mutable Array. Erstelle eine Funktion 'einfrieren',
//       die ein beliebiges Array nimmt und es als readonly zurueckgibt.
//       Verwende Generics!

// Dein Code hier:
// function einfrieren<T>(arr: T[]): ??? {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const mutableZahlen = [1, 2, 3];
// const readonlyZahlen = einfrieren(mutableZahlen);
// console.assert(readonlyZahlen.length === 3, "Aufgabe 8: readonlyZahlen sollte 3 Elemente haben");
// // readonlyZahlen.push(4);  // Diese Zeile MUSS einen Compile-Fehler geben!
// console.log("✓ Aufgabe 8 bestanden");

console.log("\n🏁 Alle freigeschalteten Aufgaben bestanden!");
console.log("Entferne die Kommentare bei den weiteren Aufgaben um fortzufahren.");
