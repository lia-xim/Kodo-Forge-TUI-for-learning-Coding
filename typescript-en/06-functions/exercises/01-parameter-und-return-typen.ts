/**
 * Lektion 06 - Exercise 01: Parameter und Return-Typen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-parameter-und-return-typen.ts
 *
 * 8 Aufgaben zu Funktionstypen, Parameter-Varianten und Return-Typen.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 * Die console.assert()-Aufrufe am Ende pruefen deine Antworten.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfache Funktion mit Typen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "zusammenfuegen" die zwei Strings nimmt
// und sie mit einem Leerzeichen verbunden zurueckgibt.
// Annotiere Parameter-Typen und Return-Typ explizit.

// function zusammenfuegen(...) { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Optionaler Parameter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "wiederhole" die einen Text nimmt und
// ihn optional n-mal wiederholt (Default: 2).
// wiederhole("ha") → "haha"
// wiederhole("ha", 3) → "hahaha"

// function wiederhole(...) { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Default-Parameter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "begruessung" mit drei Parametern:
// - name: string (Pflicht)
// - gruss: string (Default: "Hallo")
// - ausrufezeichen: boolean (Default: true)
// Ergebnis: "Hallo, Max!" oder "Hey, Max" (ohne ! wenn ausrufezeichen false)

// function begruessung(...) { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Rest-Parameter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "maximum" die beliebig viele Zahlen
// nimmt und die groesste zurueckgibt. Leere Argumentliste → -Infinity.

// function maximum(...) { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Function Type Expression
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere einen Typ "Validator" fuer eine Funktion die
// einen string nimmt und boolean zurueckgibt.
// Schreibe dann zwei Validatoren:
// - istNichtLeer: prueft ob der String nicht leer ist
// - istEmail: prueft ob der String ein "@" enthaelt

// type Validator = ...
// const istNichtLeer: Validator = ...
// const istEmail: Validator = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Destructuring-Parameter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "formatAdresse" die ein Objekt mit
// strasse, hausnummer, plz und stadt nimmt und einen String zurueckgibt.
// Format: "Musterstr. 42, 12345 Berlin"

// function formatAdresse({ ... }: { ... }): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: Funktion als Parameter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "filtern" die ein Array von Zahlen
// und eine Predicate-Funktion nimmt und die gefilterten Zahlen zurueckgibt.
// NICHT Array.filter verwenden — schreibe die Logik selbst.

// function filtern(zahlen: number[], predicate: ???): number[] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Higher-Order Function
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "createMultiplier" die eine Zahl nimmt
// und eine Funktion zurueckgibt, die andere Zahlen mit dieser multipliziert.
// const verdopple = createMultiplier(2);
// verdopple(5) → 10

// function createMultiplier(...): ... { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese nach dem Loesen
// ═══════════════════════════════════════════════════════════════════════════

/*
// Aufgabe 1
console.assert(zusammenfuegen("Hallo", "Welt") === "Hallo Welt", "A1: zusammenfuegen basic");
console.assert(zusammenfuegen("", "") === " ", "A1: zusammenfuegen leer");

// Aufgabe 2
console.assert(wiederhole("ha") === "haha", "A2: wiederhole default");
console.assert(wiederhole("ha", 3) === "hahaha", "A2: wiederhole n=3");
console.assert(wiederhole("x", 1) === "x", "A2: wiederhole n=1");

// Aufgabe 3
console.assert(begruessung("Max") === "Hallo, Max!", "A3: begruessung default");
console.assert(begruessung("Max", "Hey") === "Hey, Max!", "A3: begruessung mit Gruss");
console.assert(begruessung("Max", "Hey", false) === "Hey, Max", "A3: begruessung ohne !");

// Aufgabe 4
console.assert(maximum(3, 1, 4, 1, 5, 9) === 9, "A4: maximum basic");
console.assert(maximum(-5, -1, -10) === -1, "A4: maximum negativ");
console.assert(maximum() === -Infinity, "A4: maximum leer");

// Aufgabe 5
console.assert(istNichtLeer("hallo") === true, "A5: nicht leer");
console.assert(istNichtLeer("") === false, "A5: leer");
console.assert(istEmail("max@mail.de") === true, "A5: gueltige email");
console.assert(istEmail("max") === false, "A5: ungueltige email");

// Aufgabe 6
console.assert(
  formatAdresse({ strasse: "Musterstr.", hausnummer: 42, plz: "12345", stadt: "Berlin" })
    === "Musterstr. 42, 12345 Berlin",
  "A6: formatAdresse"
);

// Aufgabe 7
console.assert(
  JSON.stringify(filtern([1, 2, 3, 4, 5], n => n > 3)) === "[4,5]",
  "A7: filtern"
);
console.assert(
  JSON.stringify(filtern([10, 15, 20, 25], n => n % 2 === 0)) === "[10,20]",
  "A7: filtern gerade"
);

// Aufgabe 8
const verdopple = createMultiplier(2);
const verdreifache = createMultiplier(3);
console.assert(verdopple(5) === 10, "A8: verdopple");
console.assert(verdreifache(5) === 15, "A8: verdreifache");
console.assert(createMultiplier(0)(100) === 0, "A8: null-multiplier");

console.log("Alle Tests bestanden!");
*/
