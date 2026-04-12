/**
 * Lektion 06 - Example 03: Function Overloads
 *
 * Ausfuehren mit: npx tsx examples/03-function-overloads.ts
 *
 * Zeigt Overload-Signaturen, Implementation Signatures,
 * Reihenfolge-Regeln und praktische Anwendungsfaelle.
 */

// ─── GRUNDLEGENDES OVERLOAD-BEISPIEL ───────────────────────────────────────

// Problem: Return-Typ haengt vom Input-Typ ab
// Ohne Overloads:
function doubleBroadUnion(value: string | number): string | number {
  if (typeof value === "string") return value + value;
  return value * 2;
}

// Rueckgabetyp ist IMMER string | number — unpraezise:
const resultBroad = doubleBroadUnion("ha");
// resultBroad: string | number — obwohl wir WISSEN dass es string ist

// MIT Overloads: Praezise Verknuepfung Input → Output
function double(value: string): string;
function double(value: number): number;
function double(value: string | number): string | number {
  if (typeof value === "string") return value + value;
  return value * 2;
}

console.log("--- Overloads: double ---");
const str = double("ha");   // Typ: string — praezise!
const num = double(21);     // Typ: number — praezise!
console.log(`double("ha") = "${str}"`);   // "haha"
console.log(`double(21) = ${num}`);        // 42

// ─── OVERLOADS: REIHENFOLGE BEACHTEN ───────────────────────────────────────

// Overloads werden von oben nach unten geprueft.
// Spezifischere zuerst!

function format(value: Date): string;
function format(value: number): string;
function format(value: string): string;
function format(value: Date | number | string): string {
  if (value instanceof Date) {
    return value.toLocaleDateString("de-DE");
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toUpperCase();
}

console.log("\n--- Overloads: Reihenfolge ---");
console.log(`format(new Date()) = "${format(new Date())}"`);
console.log(`format(3.14159) = "${format(3.14159)}"`);
console.log(`format("hallo") = "${format("hallo")}"`);

// ─── OVERLOADS: VERSCHIEDENE PARAMETER-ANZAHL ──────────────────────────────

function createDate(timestamp: number): Date;
function createDate(year: number, month: number, day: number): Date;
function createDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month - 1, day);  // Monate sind 0-basiert
  }
  return new Date(yearOrTimestamp);
}

console.log("\n--- Overloads: Verschiedene Parameter-Anzahl ---");
console.log(`createDate(0) = ${createDate(0).toISOString()}`);
console.log(`createDate(2024, 3, 15) = ${createDate(2024, 3, 15).toLocaleDateString("de-DE")}`);

// ─── OVERLOADS VS UNION: WANN WAS? ────────────────────────────────────────

// SCHLECHT: Overloads wo Union reicht (gleicher Return-Typ)
function lengthOverloaded(x: string): number;
function lengthOverloaded(x: unknown[]): number;
function lengthOverloaded(x: string | unknown[]): number {
  return x.length;
}

// BESSER: Einfacher Union-Typ
function lengthSimple(x: string | unknown[]): number {
  return x.length;
}

console.log("\n--- Overloads vs Union ---");
console.log(`lengthOverloaded("test") = ${lengthOverloaded("test")}`);
console.log(`lengthSimple("test") = ${lengthSimple("test")}`);
// Funktional identisch — aber die Union-Variante ist einfacher

// ─── PRAXISBEISPIEL: PARSER MIT OPTIONALEM FORMAT ──────────────────────────

interface UserData {
  name: string;
  age: number;
}

function parse(input: string): unknown;
function parse(input: string, asUser: true): UserData;
function parse(input: string, asUser?: boolean): unknown | UserData {
  const data = JSON.parse(input);
  if (asUser) {
    if (typeof data.name !== "string" || typeof data.age !== "number") {
      throw new Error("Ungueltige User-Daten");
    }
    return data as UserData;
  }
  return data;
}

console.log("\n--- Praxisbeispiel: Parser ---");

const raw = parse('{"name": "Max", "age": 30}');
// raw: unknown — allgemein
console.log("Rohdaten:", raw);

const user = parse('{"name": "Max", "age": 30}', true);
// user: UserData — praezise!
console.log(`User: ${user.name}, ${user.age} Jahre`);

// ─── IMPLEMENTATION SIGNATURE IST UNSICHTBAR ───────────────────────────────

function stringify(value: string): string;
function stringify(value: number): string;
function stringify(value: boolean): string;
function stringify(value: string | number | boolean): string {
  return String(value);
}

console.log("\n--- Implementation Signature unsichtbar ---");
console.log(`stringify("hallo") = "${stringify("hallo")}"`);
console.log(`stringify(42) = "${stringify(42)}"`);
console.log(`stringify(true) = "${stringify(true)}"`);

// Das wuerde NICHT funktionieren, obwohl die Implementation
// es handlen koennte:
// stringify(null);  // Error! Kein passender Overload
// stringify({ x: 1 });  // Error! Kein passender Overload
