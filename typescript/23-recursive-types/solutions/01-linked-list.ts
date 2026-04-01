/**
 * Solution 01: LinkedList — Rekursive Datenstruktur
 */

// Loesung 1: LinkedList-Typ
type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

// Loesung 2: Liste erstellen
const greekLetters: LinkedList<string> = {
  value: "alpha",
  next: {
    value: "beta",
    next: {
      value: "gamma",
      next: null,
    },
  },
};

// Loesung 3: toArray — Iterative Traversierung
function toArray<T>(list: LinkedList<T>): T[] {
  const result: T[] = [];
  let current: LinkedList<T> | null = list;
  while (current !== null) {
    result.push(current.value);
    current = current.next;
  }
  return result;
}

// Loesung 4: prepend — Neuen Knoten an den Anfang
function prepend<T>(value: T, list: LinkedList<T> | null): LinkedList<T> {
  return { value, next: list };
}

// Loesung 5: length — Rekursive Laengenberechnung
function length<T>(list: LinkedList<T> | null): number {
  if (list === null) return 0;
  return 1 + length(list.next);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log("=== LinkedList Tests ===");
console.log("toArray:", toArray(greekLetters));
// → ["alpha", "beta", "gamma"]

const withDelta = prepend("delta", greekLetters);
console.log("prepend:", toArray(withDelta));
// → ["delta", "alpha", "beta", "gamma"]

console.log("length:", length(greekLetters));
// → 3
