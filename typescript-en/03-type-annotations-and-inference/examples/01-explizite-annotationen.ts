/**
 * LEKTION 03 - Beispiel 1: Explizite Type Annotations
 *
 * Hier siehst du alle Moeglichkeiten, Typen explizit anzugeben.
 * Jede Syntax-Variante wird einzeln erklaert.
 */

// ============================================================================
// 1. VARIABLEN-ANNOTATIONEN
// ============================================================================

// Grundsyntax: let/const variableName: Typ = wert;

let vorname: string = "Matthias";
let alter: number = 30;
let istAktiv: boolean = true;
let nichtsWert: null = null;
let unbekannt: undefined = undefined;

// Array-Annotationen (zwei gleichwertige Schreibweisen)
let zahlen: number[] = [1, 2, 3, 4, 5];
let namen: Array<string> = ["Anna", "Bob", "Clara"];

// Tuple-Annotation (feste Laenge und Typen pro Position)
let koordinaten: [number, number] = [48.137, 11.576];
let eintrag: [string, number, boolean] = ["Matthias", 30, true];

// Union-Type-Annotation (mehrere moegliche Typen)
let id: string | number = "abc-123";
id = 42; // Auch erlaubt!

// Literal-Type-Annotation (nur bestimmte Werte erlaubt)
let richtung: "north" | "south" | "east" | "west" = "north";
let wuerfel: 1 | 2 | 3 | 4 | 5 | 6 = 3;

// Objekt-Annotation (inline)
let person: { name: string; alter: number; aktiv: boolean } = {
  name: "Matthias",
  alter: 30,
  aktiv: true,
};

// ============================================================================
// 2. PARAMETER-ANNOTATIONEN
// ============================================================================

// Einfache Parameter
function greet(name: string): void {
  console.log(`Hallo, ${name}!`);
}

// Mehrere Parameter mit verschiedenen Typen
function createUser(name: string, age: number, active: boolean): void {
  console.log(`User: ${name}, ${age}, aktiv: ${active}`);
}

// Optionale Parameter (mit ?)
function greetOptional(name: string, greeting?: string): void {
  console.log(`${greeting ?? "Hallo"}, ${name}!`);
}

// Default-Parameter (Typ wird aus dem Default infert)
function greetDefault(name: string, greeting: string = "Hallo"): void {
  console.log(`${greeting}, ${name}!`);
}

// Rest-Parameter
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// ============================================================================
// 3. RETURN-TYPE-ANNOTATIONEN
// ============================================================================

// Expliziter Return-Typ nach der Parameterliste
function add(a: number, b: number): number {
  return a + b;
}

// void = Funktion gibt nichts zurueck
function logMessage(msg: string): void {
  console.log(msg);
}

// never = Funktion kehrt nie zurueck (wirft immer oder Endlosschleife)
function throwError(message: string): never {
  throw new Error(message);
}

// Promise-Return-Typ fuer async Funktionen
async function fetchData(url: string): Promise<string> {
  const response = await fetch(url);
  return response.text();
}

// Arrow Functions mit Return-Typ
const multiply = (a: number, b: number): number => a * b;

// ============================================================================
// 4. OBJEKT-DESTRUCTURING MIT ANNOTATIONEN
// ============================================================================

// FALSCH -- das sieht aus wie Renaming, nicht wie Annotation!
// function printUser({ name: string, age: number }) { }  // FEHLER!

// RICHTIG -- Typ kommt nach dem gesamten Destructuring-Pattern
function printUser({ name, age }: { name: string; age: number }): void {
  console.log(`${name} ist ${age} Jahre alt.`);
}

// Mit einem Interface ist es lesbarer
interface User {
  name: string;
  age: number;
  email?: string;
}

function printUserClean({ name, age, email }: User): void {
  console.log(`${name}, ${age}${email ? `, ${email}` : ""}`);
}

// Verschachteltes Destructuring
interface Address {
  street: string;
  city: string;
  zip: string;
}

interface UserWithAddress {
  name: string;
  address: Address;
}

function printCity({
  name,
  address: { city },
}: UserWithAddress): void {
  console.log(`${name} wohnt in ${city}`);
}

// ============================================================================
// 5. ARRAY-DESTRUCTURING MIT ANNOTATIONEN
// ============================================================================

// Einfaches Array-Destructuring
const [erster, zweiter]: [string, string] = ["Hallo", "Welt"];

// Tuple-Destructuring (verschiedene Typen pro Position)
const [userName, userAge]: [string, number] = ["Matthias", 30];

// In Funktionsparametern
function processCoordinates([lat, lng]: [number, number]): string {
  return `Lat: ${lat}, Lng: ${lng}`;
}

// Mit Rest-Element
function processFirst([first, ...rest]: number[]): void {
  console.log(`Erstes Element: ${first}`);
  console.log(`Rest: ${rest}`);
}

// ============================================================================
// 6. GENERICS MIT ANNOTATIONEN
// ============================================================================

// Generic Function -- der Typ-Parameter wird beim Aufruf bestimmt
function identity<T>(value: T): T {
  return value;
}

// Aufruf mit explizitem Typ-Argument
const str = identity<string>("hello");

// Oder: Inference bestimmt T automatisch
const num = identity(42); // T wird als number infert

// Generic mit Constraint
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// ============================================================================
// ZUSAMMENFASSUNG
// ============================================================================
// Die wichtigsten Annotations-Stellen:
// 1. let variable: Typ = wert;
// 2. function fn(param: Typ): ReturnTyp { }
// 3. const fn = (param: Typ): ReturnTyp => { }
// 4. function fn({ a, b }: { a: Typ; b: Typ }): void { }
// 5. const [a, b]: [TypA, TypB] = [wertA, wertB];
// 6. function fn<T>(param: T): T { }
