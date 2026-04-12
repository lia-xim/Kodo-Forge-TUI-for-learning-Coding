/**
 * Lektion 07 - Exercise 01: Union Type Grundlagen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-union-basics.ts
 *
 * 5 Aufgaben zu Union Types, Literal Unions und as const.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Basis Union Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "formatValue" die string | number | boolean
// akzeptiert und immer einen String zurueckgibt.
// - string: In Grossbuchstaben
// - number: Mit 2 Nachkommastellen
// - boolean: "ja" oder "nein"
// Hinweis: Verwende typeof Guards

// function formatValue(...): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Literal Union Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere einen Typ "TrafficLight" mit den Werten "red", "yellow", "green"
// Schreibe eine Funktion "getAction" die fuer jede Farbe die richtige
// Aktion zurueckgibt: "Stopp!", "Vorsicht!", "Fahren!"

// type TrafficLight = ...
// function getAction(light: TrafficLight): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Union aus Unions
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere zwei Literal Union Types:
// - SuccessCode = 200 | 201 | 204
// - ErrorCode = 400 | 401 | 403 | 404 | 500
// Kombiniere sie zu einem StatusCode-Typ.
// Schreibe eine Funktion "isSuccess" die prueft ob ein StatusCode
// ein Erfolgs-Code ist.

// type SuccessCode = ...
// type ErrorCode = ...
// type StatusCode = ...
// function isSuccess(code: StatusCode): boolean { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Union mit as const
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Array PERMISSIONS mit "read", "write", "delete", "admin"
// als const. Leite daraus einen Typ "Permission" ab.
// Schreibe eine Type Guard Funktion "isPermission" die prueft ob ein
// String eine gueltige Permission ist.

// const PERMISSIONS = ...
// type Permission = ...
// function isPermission(value: string): value is Permission { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Nullable Union
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "findUser" die ein Array von User-Objekten
// und einen Namen erhaelt. Gibt den User zurueck oder null wenn nicht gefunden.
// Schreibe eine zweite Funktion "greetUser" die findUser aufruft und
// den User begruesst oder "Unbekannter Besucher" zurueckgibt.
// Verwende korrektes Narrowing (kein ! oder as).

interface User {
  name: string;
  email: string;
}

// function findUser(users: User[], name: string): ... { ... }
// function greetUser(users: User[], name: string): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entferne die Kommentare wenn deine Loesungen fertig sind
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test Aufgabe 1
console.assert(formatValue("hello") === "HELLO", "formatValue string");
console.assert(formatValue(3.14159) === "3.14", "formatValue number");
console.assert(formatValue(true) === "ja", "formatValue boolean true");
console.assert(formatValue(false) === "nein", "formatValue boolean false");

// Test Aufgabe 2
console.assert(getAction("red") === "Stopp!", "getAction red");
console.assert(getAction("yellow") === "Vorsicht!", "getAction yellow");
console.assert(getAction("green") === "Fahren!", "getAction green");

// Test Aufgabe 3
console.assert(isSuccess(200) === true, "isSuccess 200");
console.assert(isSuccess(201) === true, "isSuccess 201");
console.assert(isSuccess(404) === false, "isSuccess 404");
console.assert(isSuccess(500) === false, "isSuccess 500");

// Test Aufgabe 4
console.assert(isPermission("read") === true, "isPermission read");
console.assert(isPermission("write") === true, "isPermission write");
console.assert(isPermission("fly") === false, "isPermission fly");

// Test Aufgabe 5
const users: User[] = [
  { name: "Alice", email: "alice@x.com" },
  { name: "Bob", email: "bob@x.com" },
];
console.assert(greetUser(users, "Alice") === "Hallo, Alice!", "greetUser found");
console.assert(greetUser(users, "Charlie") === "Unbekannter Besucher", "greetUser not found");

console.log("Alle Tests bestanden!");
*/
