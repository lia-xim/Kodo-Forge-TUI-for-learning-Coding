/**
 * Lektion 04 — Loesung 05: Fehlermeldungen lesen und verstehen
 *
 * Jeder Fehler ist behoben und mit einer ausfuehrlichen Erklaerung
 * versehen — sowohl WARUM der Fehler auftritt als auch WARUM die
 * Loesung korrekt ist.
 */

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 1: "Property 'push' does not exist on type 'readonly number[]'"
// ═══════════════════════════════════════════════════════════════════════════════

function addItem(items: readonly number[], newItem: number): readonly number[] {
  // LOESUNG: Statt push (Mutation) ein neues Array mit Spread erzeugen.
  return [...items, newItem];
}

// WARUM tritt dieser Fehler auf?
// readonly number[] ist ein ReadonlyArray<number>. Dieses Interface enthaelt
// NUR nicht-mutierende Methoden (map, filter, find, slice, etc.).
// push() ist eine mutierende Methode — sie veraendert das Array in-place.
// TypeScript blockiert push(), weil es gegen den readonly-Vertrag verstoesst.
//
// Die korrekte Loesung ist das funktionale Pattern: Erzeuge ein NEUES Array
// mit dem Spread-Operator. Das Original bleibt unveraendert.

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 2: "Type 'readonly string[]' is not assignable to type 'string[]'"
// ═══════════════════════════════════════════════════════════════════════════════

// LOESUNG: Drei Moeglichkeiten, von BEST zu WORST:

// Option A (BESTE): Funktion aendern, um readonly zu akzeptieren und nicht zu mutieren
function sortNamesSafe(names: readonly string[]): string[] {
  return [...names].sort(); // Kopie sortieren, Original bleibt unberuehrt
}

const readonlyNames: readonly string[] = ["Charlie", "Alice", "Bob"];
const sorted = sortNamesSafe(readonlyNames);

// Option B (OK): Kopie beim Aufruf erstellen
// const sorted = sortNames([...readonlyNames]);

// Option C (SCHLECHT — nur wenn du die Funktion nicht aendern kannst):
// const sorted = sortNames(readonlyNames as string[]);
// GEFAHR: as-Cast umgeht den readonly-Schutz, sortNames() mutiert das Original!

// WARUM laesst TypeScript diese Zuweisung nicht zu?
// Wenn TypeScript readonly string[] an string[] zuweisen liesse, koennte die
// Funktion das Array mutieren (sort() aendert das Original). Das wuerde den
// readonly-Vertrag brechen. Die Asymmetrie:
//   string[] -> readonly string[]  = OK (weniger Rechte geben)
//   readonly string[] -> string[]  = FEHLER (mehr Rechte geben)
// Readonly entfernen waere unsicher, readonly hinzufuegen ist immer sicher.

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 3: "Tuple type '[string, number]' of length '2' has no element
//            at index '2'."
// ═══════════════════════════════════════════════════════════════════════════════

const person: [string, number] = ["Alice", 30];

// LOESUNG: Person-Tuple um ein drittes Element erweitern
const person2: [string, number, string] = ["Alice", 30, "alice@example.com"];
const email = person2[2]; // string

// Oder: Nur auf gueltige Indizes zugreifen
const name = person[0]; // string
const age = person[1];  // number

// WARUM:
// Ein Tuple hat eine FESTE Laenge, die zur Compile-Zeit bekannt ist.
// [string, number] hat genau 2 Elemente (Index 0 und 1).
// Index 2 existiert nicht. TypeScript kennt die exakte Laenge und
// weiss daher, dass person[2] IMMER out-of-bounds waere.
//
// Bei einem normalen Array (string[]) wuerde TypeScript person[2] erlauben
// (Typ: string), weil die Laenge unbekannt ist. Das ist weniger sicher,
// es sei denn du aktivierst noUncheckedIndexedAccess.

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 4: Falsche Tuple-Zuweisungen
// ═══════════════════════════════════════════════════════════════════════════════

// LOESUNG: Typen und Laenge korrigieren
const point1: [number, number] = [10, 20];            // "20" -> 20 (string zu number)
const point2: [number, number] = [10, 20];             // Drittes Element entfernt
const point3: [string, number, boolean] = ["test", 42, false]; // Drittes Element hinzugefuegt

// WARUM prueft TypeScript bei Tuples sowohl Typen als auch Laenge?
// Weil ein Tuple per Definition eine FESTE Struktur ist — wie ein Formular
// mit einer bestimmten Anzahl Felder. Die Laenge ist Teil des Typs:
//   [number, number] hat .length vom Typ 2 (Literal-Typ!)
//   number[] hat .length vom Typ number (beliebig)
// Wenn du 3 Elemente in ein 2er-Tuple packst, verletzt du den Typ.
// Bei einem Array ist die Laenge variabel, daher prueft TypeScript nur die
// Element-Typen.

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 5: "Argument of type 'boolean' is not assignable to parameter
//            of type 'string | number'."
// ═══════════════════════════════════════════════════════════════════════════════

// LOESUNG Option A: Den richtigen Typ pushen
const werte: (string | number)[] = ["hello", 42];
werte.push("world"); // string ist Teil von string | number -> OK

// LOESUNG Option B: Array-Typ erweitern (wenn boolean gewollt ist)
const werte2: (string | number | boolean)[] = ["hello", 42];
werte2.push(true); // boolean ist jetzt Teil des Union-Typs -> OK

// WARUM:
// push() akzeptiert nur Argumente, die zum Element-Typ des Arrays passen.
// Das Array hat den Typ (string | number)[], also akzeptiert push() nur
// string oder number. boolean ist NICHT Teil dieser Union.
// Die Inferenz passiert bei der DEKLARATION und ist danach fixiert.
// Du kannst den Typ nur erweitern, indem du die Annotation aenderst.

// ═══════════════════════════════════════════════════════════════════════════════
// Fehler 6: "Property 'toUpperCase' does not exist on type
//            'string | undefined'."
// ═══════════════════════════════════════════════════════════════════════════════

const staedte: string[] = ["Berlin", "Wien", "Zuerich"];
const gefunden = staedte.find(s => s.startsWith("W"));

// LOESUNG Variante A: if-Check (am sichersten)
if (gefunden !== undefined) {
  const grossA = gefunden.toUpperCase(); // TypeScript weiss: hier ist es string
  console.log(grossA);
}

// LOESUNG Variante B: Optional Chaining
const grossB = gefunden?.toUpperCase(); // Typ: string | undefined
// Beachte: grossB ist jetzt string | undefined, nicht nur string!

// NICHT EMPFOHLEN: Non-null Assertion
// const grossC = gefunden!.toUpperCase();
// GEFAHR: Der !-Operator sagt TypeScript "vertrau mir, es ist nicht undefined".
// Aber wenn find() tatsaechlich nichts findet, crasht der Code zur Laufzeit!
// Das umgeht genau den Schutz, den TypeScript dir bietet.

// WARUM gibt find() 'T | undefined' zurueck?
// Weil find() KEIN Element finden kann. Wenn kein Element das Praedikat
// erfuellt, gibt find() undefined zurueck. Das ist in der generischen
// Definition festgelegt: find(predicate: ...): T | undefined.
// TypeScript zwingt dich, diesen Fall zu behandeln — das verhindert
// "Cannot read properties of undefined" Laufzeit-Crashes.

// ═══════════════════════════════════════════════════════════════════════════════

console.log("Alle Fehlermeldungen verstanden und behoben!");
