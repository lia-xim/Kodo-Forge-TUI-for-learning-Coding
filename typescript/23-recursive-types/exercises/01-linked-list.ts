/**
 * Exercise 01: LinkedList — Rekursive Datenstruktur
 *
 * Implementiere eine typsichere LinkedList mit Hilfsfunktionen.
 *
 * Ausfuehren: npx tsx exercises/01-linked-list.ts
 * Hints: Siehe hints.json "exercises/01-linked-list.ts"
 */

// TODO 1: Definiere den LinkedList-Typ
// Ein Knoten hat einen Wert vom Typ T und eine Referenz auf den
// naechsten Knoten (oder null als Ende).
type LinkedList<T> = unknown; // ← Ersetze unknown

// TODO 2: Erstelle eine LinkedList<string> mit den Werten
// "alpha" → "beta" → "gamma" → null
const greekLetters: unknown = undefined; // ← Ersetze mit der Liste

// TODO 3: Schreibe eine Funktion die alle Werte einer LinkedList sammelt
function toArray<T>(list: LinkedList<T>): T[] {
  // TODO: Implementiere die Traversierung
  return [];
}

// TODO 4: Schreibe eine Funktion die einen Wert am Anfang einfuegt
function prepend<T>(value: T, list: LinkedList<T> | null): LinkedList<T> {
  // TODO: Implementiere prepend
  return undefined as unknown as LinkedList<T>;
}

// TODO 5: Schreibe eine Funktion die die Laenge einer LinkedList berechnet
function length<T>(list: LinkedList<T> | null): number {
  // TODO: Implementiere length (rekursiv oder iterativ)
  return 0;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log("=== LinkedList Tests ===");
console.log("toArray:", toArray(greekLetters as LinkedList<string>));
// Erwartet: ["alpha", "beta", "gamma"]

const withDelta = prepend("delta", greekLetters as LinkedList<string>);
console.log("prepend:", toArray(withDelta));
// Erwartet: ["delta", "alpha", "beta", "gamma"]

console.log("length:", length(greekLetters as LinkedList<string>));
// Erwartet: 3
