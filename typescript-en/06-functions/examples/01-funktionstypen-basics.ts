/**
 * Lektion 06 - Example 01: Funktionstypen Basics
 *
 * Ausfuehren mit: npx tsx examples/01-funktionstypen-basics.ts
 *
 * Zeigt die Grundlagen der Funktionstypisierung in TypeScript:
 * Parameter-Typen, Return-Typen, alle drei Schreibweisen,
 * void vs undefined, und Function Type Expressions.
 */

// ─── FUNCTION DECLARATION ──────────────────────────────────────────────────

// Die klassische Funktionsdeklaration mit Typ-Annotationen
function addiere(a: number, b: number): number {
  return a + b;
}

console.log("--- Function Declaration ---");
console.log(`addiere(3, 4) = ${addiere(3, 4)}`);     // 7
console.log(`addiere(-1, 1) = ${addiere(-1, 1)}`);   // 0

// TypeScript prueft die Argumentanzahl:
// addiere(1);          // Error! Erwartet 2 Argumente
// addiere(1, 2, 3);    // Error! Erwartet 2 Argumente
// addiere("1", "2");   // Error! string ist nicht number

// ─── FUNCTION EXPRESSION ───────────────────────────────────────────────────

// Anonyme Funktion, einer Variable zugewiesen
const subtrahiere = function (a: number, b: number): number {
  return a - b;
};

console.log("\n--- Function Expression ---");
console.log(`subtrahiere(10, 3) = ${subtrahiere(10, 3)}`);  // 7

// ─── ARROW FUNCTION ────────────────────────────────────────────────────────

// Kurzform mit Pfeil-Syntax
const multipliziere = (a: number, b: number): number => {
  return a * b;
};

// Noch kuerzer: Einzeiler ohne geschweifte Klammern
const dividiere = (a: number, b: number): number => a / b;

console.log("\n--- Arrow Functions ---");
console.log(`multipliziere(5, 6) = ${multipliziere(5, 6)}`);  // 30
console.log(`dividiere(15, 3) = ${dividiere(15, 3)}`);         // 5

// ─── RETURN-TYP INFERENZ ──────────────────────────────────────────────────

// TypeScript inferiert den Return-Typ automatisch
function begruessung(name: string) {
  return `Hallo, ${name}!`;
}
// Inferierter Typ: (name: string) => string

// Hover ueber 'begruessung' in deinem Editor um den inferierten Typ zu sehen
console.log("\n--- Return-Typ Inferenz ---");
console.log(begruessung("Welt"));  // "Hallo, Welt!"

// ─── VOID VS UNDEFINED ────────────────────────────────────────────────────

// void: "Der Rueckgabewert ist irrelevant"
function logNachricht(msg: string): void {
  console.log(`[LOG] ${msg}`);
  // Kein return noetig — oder: return;
}

// undefined: "Gibt den konkreten Wert undefined zurueck"
function gibUndefined(): undefined {
  return undefined;
}

console.log("\n--- void vs undefined ---");
logNachricht("Test-Nachricht");
console.log(`gibUndefined() === undefined: ${gibUndefined() === undefined}`);  // true

// WICHTIGER UNTERSCHIED:
// const a: undefined = logNachricht("test");  // Error! void ist nicht undefined
const b: undefined = gibUndefined();           // OK

// ─── FUNCTION TYPE EXPRESSIONS ─────────────────────────────────────────────

// Funktionstypen als eigenstaendige Typ-Definitionen
type MathOperation = (a: number, b: number) => number;

// Alle vier Operationen haben den gleichen Typ
const operationen: Record<string, MathOperation> = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
  div: (a, b) => a / b,
};

console.log("\n--- Function Type Expressions ---");
for (const [name, fn] of Object.entries(operationen)) {
  console.log(`${name}(10, 3) = ${fn(10, 3)}`);
}
// add(10, 3) = 13
// sub(10, 3) = 7
// mul(10, 3) = 30
// div(10, 3) = 3.3333...

// ─── FUNKTIONEN ALS PARAMETER ─────────────────────────────────────────────

// Funktion die eine andere Funktion als Argument nimmt
function anwenden(fn: MathOperation, a: number, b: number): number {
  return fn(a, b);
}

console.log("\n--- Funktionen als Parameter ---");
console.log(`anwenden(add, 5, 3) = ${anwenden(operationen.add, 5, 3)}`);
console.log(`anwenden(mul, 5, 3) = ${anwenden(operationen.mul, 5, 3)}`);

// ─── HIGHER-ORDER FUNCTION ─────────────────────────────────────────────────

// Funktion die eine Funktion ZURUECKGIBT
function ersteller(operator: string): MathOperation {
  switch (operator) {
    case "+": return (a, b) => a + b;
    case "-": return (a, b) => a - b;
    case "*": return (a, b) => a * b;
    case "/": return (a, b) => a / b;
    default: throw new Error(`Unbekannter Operator: ${operator}`);
  }
}

console.log("\n--- Higher-Order Function ---");
const addierer = ersteller("+");
const multiplizierer = ersteller("*");
console.log(`addierer(7, 8) = ${addierer(7, 8)}`);           // 15
console.log(`multiplizierer(7, 8) = ${multiplizierer(7, 8)}`);  // 56

// ─── REKURSION: RETURN-TYP IST PFLICHT ─────────────────────────────────────

// Bei rekursiven Funktionen MUSS der Return-Typ angegeben werden
function fakultaet(n: number): number {
  if (n <= 1) return 1;
  return n * fakultaet(n - 1);
}

console.log("\n--- Rekursion ---");
console.log(`fakultaet(5) = ${fakultaet(5)}`);   // 120
console.log(`fakultaet(10) = ${fakultaet(10)}`);  // 3628800
