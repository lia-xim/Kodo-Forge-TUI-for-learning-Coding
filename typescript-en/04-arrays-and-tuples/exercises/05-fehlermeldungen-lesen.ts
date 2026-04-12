/**
 * Lektion 04 — Uebung 05: Fehlermeldungen lesen und verstehen
 *
 * Jeder Code-Block erzeugt einen TypeScript-Compile-Fehler.
 * Deine Aufgabe:
 *   1. Lies die Fehlermeldung (in deiner IDE oder mit npx tsc --noEmit)
 *   2. Erklaere in einem Kommentar, WARUM der Fehler auftritt
 *   3. Behebe den Fehler auf die sinnvollste Art
 *
 * Pruefung: npx tsc --noEmit exercises/05-fehlermeldungen-lesen.ts
 *           Wenn KEINE Fehler kommen, hast du alles behoben!
 *
 * WICHTIG: Lies die Fehlermeldung ZUERST, bevor du sie behebst.
 * Das Ziel ist nicht nur "es kompiliert", sondern "ich verstehe warum".
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 1: "Property 'push' does not exist on type 'readonly number[]'"
// ═══════════════════════════════════════════════════════════════════════════════

// Kontext: Du bekommst ein readonly Array aus einem Service und willst
// ein Element hinzufuegen.

function addItem(items: readonly number[], newItem: number): readonly number[] {
  // TODO: Diese Zeile erzeugt einen Fehler. Behebe ihn!
  //       Hinweis: Du darfst die Funktionssignatur NICHT aendern.
  //       Das readonly ist Absicht — finde einen Weg OHNE Mutation.
  items.push(newItem);
  return items;
}

// Erklaerung (fuege deinen Kommentar ein):
// WARUM tritt dieser Fehler auf?
// Deine Antwort: ???

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 2: "Type 'readonly string[]' is not assignable to type 'string[]'.
//            The type 'readonly string[]' is 'readonly' and cannot be
//            assigned to the mutable type 'string[]'."
// ═══════════════════════════════════════════════════════════════════════════════

// Kontext: Ein Kollege hat readonly Daten, will sie aber an eine Funktion
// uebergeben die ein mutable Array erwartet.

function sortNames(names: string[]): string[] {
  return names.sort();
}

const readonlyNames: readonly string[] = ["Charlie", "Alice", "Bob"];

// TODO: Dieser Aufruf erzeugt einen Fehler. Behebe ihn auf die
//       SICHERSTE Art (es gibt mehrere Moeglichkeiten — waehle die beste).
const sorted = sortNames(readonlyNames);

// Erklaerung:
// WARUM laesst TypeScript diese Zuweisung nicht zu?
// Was koennte schiefgehen wenn TypeScript es erlauben wuerde?
// Deine Antwort: ???

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 3: "Tuple type '[string, number]' of length '2' has no element
//            at index '2'."
// ═══════════════════════════════════════════════════════════════════════════════

// Kontext: Du arbeitest mit einem Tuple und greifst auf einen Index zu,
// der nicht existiert.

const person: [string, number] = ["Alice", 30];

// TODO: Diese Zeile erzeugt einen Fehler. Erklaere warum und behebe ihn.
const email = person[2];

// Erklaerung:
// Was ist der Unterschied zwischen person[2] bei einem Tuple vs einem Array?
// Deine Antwort: ???

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 4: "Type 'number' is not assignable to type 'string'.
//            Source has 1 element(s) but target requires 2."
//            (oder aehnliche Meldung bei falscher Tuple-Zuweisung)
// ═══════════════════════════════════════════════════════════════════════════════

// Kontext: Du versuchst, ein Tuple mit falschen Typen oder falscher
// Laenge zu erstellen.

// TODO: Behebe ALLE Fehler in diesen Tuple-Zuweisungen.
//       Bei manchen ist der Typ falsch, bei anderen die Laenge.
const point1: [number, number] = [10, "20"];
const point2: [number, number] = [10, 20, 30];
const point3: [string, number, boolean] = ["test", 42];

// Erklaerung:
// Warum prueft TypeScript bei Tuples sowohl die Typen als auch die Laenge,
// aber bei Arrays nur die Typen?
// Deine Antwort: ???

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 5: "Argument of type 'boolean' is not assignable to parameter
//            of type 'string | number'."
// ═══════════════════════════════════════════════════════════════════════════════

// Kontext: Du versuchst, ein Element zu einem Array hinzuzufuegen, das
// nicht zum Array-Typ passt.

const werte: (string | number)[] = ["hello", 42];

// TODO: Erklaere warum dieser push fehlschlaegt und behebe ihn.
werte.push(true);

// Erklaerung:
// Warum akzeptiert das Array true nicht?
// Was muesste man am Array-Typ aendern, damit true akzeptiert wird?
// Deine Antwort: ???

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 6: "Property 'toUpperCase' does not exist on type
//            'string | undefined'."
// ═══════════════════════════════════════════════════════════════════════════════

// Kontext: Du verwendest find() auf einem Array und arbeitest direkt
// mit dem Ergebnis — ohne den undefined-Fall zu beruecksichtigen.

const staedte: string[] = ["Berlin", "Wien", "Zuerich"];
const gefunden = staedte.find(s => s.startsWith("W"));

// TODO: Behebe den Fehler auf ZWEI verschiedene Arten:
//       Variante A: mit if-Check (am sichersten)
//       Variante B: mit Optional Chaining (?.)
//       Kommentiere die andere Variante aus.
const gross = gefunden.toUpperCase();

// Erklaerung:
// Warum gibt find() 'T | undefined' zurueck?
// Warum ist es gefaehrlich, hier den Non-null Assertion Operator (!) zu verwenden?
// Deine Antwort: ???

// ═══════════════════════════════════════════════════════════════════════════════

// Wenn du alle Fehler behoben und erklaert hast:
console.log("Alle Fehlermeldungen verstanden und behoben!");
