/**
 * Lektion 06 - Solution 01: Parameter und Return-Typen
 *
 * Ausfuehren mit: npx tsx solutions/01-parameter-und-return-typen.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfache Funktion mit Typen
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Beide Parameter als string, Return als string.
// Template Literal fuer die Verkettung mit Leerzeichen.
function zusammenfuegen(a: string, b: string): string {
  return `${a} ${b}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Optionaler Parameter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Default-Wert statt ?, weil wir den Wert direkt verwenden.
// String.repeat(n) wiederholt den String n-mal.
function wiederhole(text: string, n: number = 2): string {
  return text.repeat(n);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Default-Parameter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Defaults fuer gruss und ausrufezeichen.
// Ternary Operator fuer bedingtes Ausrufezeichen.
function begruessung(
  name: string,
  gruss: string = "Hallo",
  ausrufezeichen: boolean = true,
): string {
  return `${gruss}, ${name}${ausrufezeichen ? "!" : ""}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Rest-Parameter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Rest-Parameter fuer beliebig viele Zahlen.
// Math.max mit Spread — bei leerem Array -Infinity.
function maximum(...zahlen: number[]): number {
  if (zahlen.length === 0) return -Infinity;
  return Math.max(...zahlen);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Function Type Expression
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Type Alias fuer den Validator-Typ.
// Beide Validatoren implementieren diesen Typ.
type Validator = (input: string) => boolean;

const istNichtLeer: Validator = (input) => input.length > 0;
const istEmail: Validator = (input) => input.includes("@");

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Destructuring-Parameter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Destructuring im Parameter mit Typ-Annotation NACH dem Pattern.
// Alternativ koennte man ein Interface definieren.
function formatAdresse({
  strasse,
  hausnummer,
  plz,
  stadt,
}: {
  strasse: string;
  hausnummer: number;
  plz: string;
  stadt: string;
}): string {
  return `${strasse} ${hausnummer}, ${plz} ${stadt}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: Funktion als Parameter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: predicate ist eine Funktion die (number) => boolean ist.
// Eigene Schleife statt Array.filter, wie in der Aufgabe verlangt.
function filtern(zahlen: number[], predicate: (n: number) => boolean): number[] {
  const ergebnis: number[] = [];
  for (const zahl of zahlen) {
    if (predicate(zahl)) {
      ergebnis.push(zahl);
    }
  }
  return ergebnis;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Higher-Order Function
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Closure — factor wird im Return-Wert "eingeschlossen".
// Die zurueckgegebene Funktion hat Zugriff auf factor.
function createMultiplier(factor: number): (value: number) => number {
  return (value) => factor * value;
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

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
  "A6: formatAdresse",
);

// Aufgabe 7
console.assert(
  JSON.stringify(filtern([1, 2, 3, 4, 5], n => n > 3)) === "[4,5]",
  "A7: filtern",
);
console.assert(
  JSON.stringify(filtern([10, 15, 20, 25], n => n % 2 === 0)) === "[10,20]",
  "A7: filtern gerade",
);

// Aufgabe 8
const verdopple = createMultiplier(2);
const verdreifache = createMultiplier(3);
console.assert(verdopple(5) === 10, "A8: verdopple");
console.assert(verdreifache(5) === 15, "A8: verdreifache");
console.assert(createMultiplier(0)(100) === 0, "A8: null-multiplier");

console.log("Alle Tests bestanden!");
