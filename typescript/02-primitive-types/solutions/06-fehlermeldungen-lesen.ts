/**
 * Lektion 02 - Solution 06: Fehlermeldungen lesen
 *
 * Ausfuehren mit: npx tsx solutions/06-fehlermeldungen-lesen.ts
 *
 * Alle Fehler gefixt mit ausfuehrlichen Erklaerungen,
 * was jede Fehlermeldung bedeutet und wie man sie in Zukunft erkennt.
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 1: Type 'string' is not assignable to type 'number'
// ═══════════════════════════════════════════════════════════════════════════

// ERKLAERUNG:
// Template Literals (mit Backticks `...`) erzeugen IMMER einen string,
// auch wenn der Inhalt eine Zahl ist. `${31}` ist "31" (string),
// nicht 31 (number). TypeScript erkennt das und beschwert sich,
// weil du einen string einer number-Variable zuweisen willst.
//
// FIX: Entferne das Template Literal — die Subtraktion ergibt bereits number.

function getAlter(): number {
  const geburtsjahr = 1995;
  const aktuellesJahr = 2026;

  // GEFIXT: Direkte Berechnung statt Template Literal
  const alter: number = aktuellesJahr - geburtsjahr;
  return alter;
}

// LERNPUNKT: Wenn du "Type 'string' is not assignable to type 'number'" siehst,
// suche nach Stellen wo versehentlich ein String entsteht:
// - Template Literals: `${zahl}` → string
// - String-Konkatenation: "" + zahl → string
// - toString(): zahl.toString() → string

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 2: Argument of type 'string' is not assignable to parameter
//           of type '"GET" | "POST" | "PUT" | "DELETE"'
// ═══════════════════════════════════════════════════════════════════════════

// ERKLAERUNG:
// let method = "GET" gibt method den Typ string (nicht "GET"!).
// Das ist Type Widening: let-Variablen bekommen den breiten Typ,
// weil sie sich aendern koennten. Die Funktion erwartet aber den
// engen Typ "GET" | "POST" | "PUT" | "DELETE" — und string passt
// da nicht rein (weil "YOLO" auch ein string waere).
//
// DREI LOESUNGEN:

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function sendRequest(method: HttpMethod, url: string): string {
  return `${method} ${url}`;
}

// Loesung 1: Explizite Typ-Annotation
let method1: HttpMethod = "GET";
const result2a = sendRequest(method1, "/api/users");

// Loesung 2: as const
let method2 = "GET" as const;
const result2b = sendRequest(method2, "/api/users");

// Loesung 3: const statt let
const method3 = "GET";
const result2 = sendRequest(method3, "/api/users");

// LERNPUNKT: "Type 'string' is not assignable to type 'X | Y | Z'" bedeutet
// fast immer: Du hast Type Widening. Loesungen: as const, const, oder
// explizite Typ-Annotation.

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 3: Object is possibly 'null'
// ═══════════════════════════════════════════════════════════════════════════

// ERKLAERUNG:
// name hat den Typ string | null. Wenn name null ist, hat es kein
// .length Property — das wuerde zur Laufzeit "Cannot read property
// 'length' of null" werfen. TypeScript verhindert das mit strictNullChecks.
//
// FIX: Null-Pruefung hinzufuegen

function getNameLength(name: string | null): number {
  // GEFIXT: Null-Pruefung mit Fallback-Wert
  if (name === null) {
    return 0;
  }
  return name.length;

  // Alternativ einzeilig:
  // return name?.length ?? 0;
}

// LERNPUNKT: "Object is possibly 'null'" oder "Object is possibly 'undefined'"
// bedeutet: Du rufst eine Methode/Property auf, ohne vorher zu pruefen ob
// der Wert existiert. Loesungen:
// - if (x !== null) { ... }
// - x?.property
// - x ?? fallback

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 4: Property 'toFixed' does not exist on type 'string | number'
// ═══════════════════════════════════════════════════════════════════════════

// ERKLAERUNG:
// wert ist string | number. TypeScript erlaubt nur Methoden die auf
// ALLEN Typen im Union existieren. toFixed() gibt es auf number aber
// NICHT auf string. TypeScript weiss nicht ob wert ein string oder
// number ist — also verbietet es den Aufruf.
//
// FIX: Type Narrowing mit typeof

function formatWert(wert: string | number): string {
  // GEFIXT: typeof-Pruefung trennt die Faelle
  if (typeof wert === "number") {
    return wert.toFixed(2);     // TypeScript weiss: number
  }
  return wert;                   // TypeScript weiss: string
}

// LERNPUNKT: "Property 'X' does not exist on type 'A | B'" bedeutet:
// Die Methode existiert auf einem der Union-Typen, aber nicht auf allen.
// Du musst mit typeof, instanceof oder in den Typ einengen (narrowen).

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 5: Type 'undefined' is not assignable to type 'string'
// ═══════════════════════════════════════════════════════════════════════════

// ERKLAERUNG:
// Array.find() gibt T | undefined zurueck — undefined wenn kein Element
// gefunden wird. Du versuchst das Ergebnis einem string zuzuweisen,
// aber undefined ist kein string (mit strictNullChecks).
//
// FIX: Fallback-Wert fuer den Fall dass nichts gefunden wird

const namen = ["Max", "Anna", "Tim"];

function findeNamen(suchbegriff: string): string {
  // GEFIXT: Fallback mit ?? wenn nichts gefunden
  const gefunden: string = namen.find(n => n === suchbegriff) ?? "nicht gefunden";
  return gefunden;
}

// Alternative: Rueckgabetyp aendern zu string | undefined
// function findeNamen(suchbegriff: string): string | undefined {
//   return namen.find(n => n === suchbegriff);
// }

// LERNPUNKT: "Type 'undefined' is not assignable to type 'X'" tritt
// haeufig auf bei:
// - Array.find() → T | undefined
// - Map.get() → T | undefined
// - Optional Properties → T | undefined
// Loesung: ?? fuer Fallback-Werte, oder den Typ erweitern zu T | undefined

// ═══════════════════════════════════════════════════════════════════════════
// FEHLER 6: Type 'string' is not assignable to type 'never'
// ═══════════════════════════════════════════════════════════════════════════

// ERKLAERUNG:
// Der Exhaustive Check (const exhaustive: never = status) schlaegt fehl,
// weil nach den switch-cases der Wert "gesperrt" uebrig bleibt.
// "gesperrt" ist ein string Literal Type und kann NICHT dem Typ never
// zugewiesen werden. Das ist GENAU der Zweck des Exhaustive Checks:
// Er warnt dich, wenn du einen Fall vergessen hast!
//
// FIX: Den fehlenden case hinzufuegen

type Status = "aktiv" | "inaktiv" | "gesperrt";

function getStatusCode(status: Status): number {
  switch (status) {
    case "aktiv":
      return 1;
    case "inaktiv":
      return 0;
    // GEFIXT: Fehlenden case hinzugefuegt
    case "gesperrt":
      return -1;
  }

  // Jetzt ist status exhausted — der Exhaustive Check funktioniert
  const exhaustive: never = status;
  return exhaustive;
}

// LERNPUNKT: "Type 'X' is not assignable to type 'never'" im
// default-Zweig bedeutet: Du hast einen Union-Fall nicht behandelt.
// Das ist einer der wertvollsten Compile-Errors in TypeScript — er
// schuetzt dich, wenn jemand einen neuen Wert zum Union hinzufuegt.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Test 1: Alter berechnen
console.assert(getAlter() === 31, "Fehler 1: Alter muss 31 sein");

// Test 2: HTTP Request
console.assert(result2 === "GET /api/users", "Fehler 2: Request muss funktionieren");

// Test 3: Name Length
console.assert(getNameLength("Hallo") === 5, "Fehler 3a: Laenge von 'Hallo' ist 5");
console.assert(getNameLength(null) === 0, "Fehler 3b: Laenge von null ist 0");

// Test 4: Format Wert
console.assert(formatWert(3.14159) === "3.14", "Fehler 4a: Zahl formatieren");
console.assert(formatWert("hallo") === "hallo", "Fehler 4b: String durchreichen");

// Test 5: Name finden
console.assert(findeNamen("Max") === "Max", "Fehler 5a: Max finden");
console.assert(findeNamen("xyz") === "nicht gefunden", "Fehler 5b: Nicht gefunden");

// Test 6: Status Code
console.assert(getStatusCode("aktiv") === 1, "Fehler 6a: aktiv = 1");
console.assert(getStatusCode("inaktiv") === 0, "Fehler 6b: inaktiv = 0");
console.assert(getStatusCode("gesperrt") === -1, "Fehler 6c: gesperrt = -1");

console.log("\n--- Alle Fehlermeldungen verstanden und gefixt! ---");
console.log("\nDie 6 wichtigsten Fehlermeldungen und ihre Bedeutung:");
console.log("  1. 'X not assignable to Y'        → Falscher Typ (Konvertierung pruefen)");
console.log("  2. 'string not assignable to A|B'  → Type Widening (as const/const/Annotation)");
console.log("  3. 'Object is possibly null'       → Null-Pruefung fehlt");
console.log("  4. 'Property X not on type A|B'    → Type Narrowing noetig");
console.log("  5. 'undefined not assignable to X'  → find/get kann undefined sein");
console.log("  6. 'X not assignable to never'      → Exhaustive Check — case fehlt!");
