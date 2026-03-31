/**
 * Lektion 11 - Solution 02: typeof Guards
 *
 * Ausfuehren mit: npx tsx solutions/02-typeof-guards.ts
 */

// ═══ AUFGABE 1: typeof im switch ═══

// Loesung: switch (typeof wert) funktioniert direkt als Narrowing.
// Jeder case narrowt den Typ entsprechend.
function beschreibeTyp(wert: string | number | boolean | undefined): string {
  switch (typeof wert) {
    case "string":    return `string:${wert}`;
    case "number":    return `number:${wert}`;
    case "boolean":   return `boolean:${wert}`;
    case "undefined": return `undefined:${wert}`;
  }
}

console.assert(beschreibeTyp("hallo") === "string:hallo", "Aufgabe 1a");
console.assert(beschreibeTyp(42) === "number:42", "Aufgabe 1b");
console.assert(beschreibeTyp(true) === "boolean:true", "Aufgabe 1c");
console.assert(beschreibeTyp(undefined) === "undefined:undefined", "Aufgabe 1d");

// ═══ AUFGABE 2: Die typeof-null-Falle ═══

// Loesung: null ZUERST pruefen (=== null), dann Array.isArray(),
// dann typeof === "object" (jetzt ist null schon weg), dann string.
// Reihenfolge entscheidend!
function typSicher(wert: string | object | null | unknown[]): string {
  if (wert === null) return "null";
  if (Array.isArray(wert)) return `array:${wert.length}`;
  if (typeof wert === "object") return `object:${Object.keys(wert).length}`;
  return "string";
}

console.assert(typSicher(null) === "null", "Aufgabe 2a");
console.assert(typSicher([1, 2, 3]) === "array:3", "Aufgabe 2b");
console.assert(typSicher({ a: 1, b: 2 }) === "object:2", "Aufgabe 2c");
console.assert(typSicher("test") === "string", "Aufgabe 2d");

// ═══ AUFGABE 3: typeof mit Negation ═══

// Loesung: Wenn typeof !== "string", gib null zurueck (early return).
// Danach ist TypeScript sicher, dass es ein string ist.
function nurString(wert: string | number | boolean | null): string | null {
  if (typeof wert !== "string") return null;
  return wert.toUpperCase();
}

console.assert(nurString("hallo") === "HALLO", "Aufgabe 3a");
console.assert(nurString(42) === null, "Aufgabe 3b");
console.assert(nurString(true) === null, "Aufgabe 3c");
console.assert(nurString(null) === null, "Aufgabe 3d");

// ═══ AUFGABE 4: typeof-Kette fuer unknown ═══

// Loesung: typeof-Checks fuer string, number, boolean.
// Alles andere: null zurueckgeben.
function verdopple(wert: unknown): string | number | boolean | null {
  if (typeof wert === "string") return wert + wert;
  if (typeof wert === "number") return wert * 2;
  if (typeof wert === "boolean") return !wert;
  return null;
}

console.assert(verdopple("ab") === "abab", "Aufgabe 4a");
console.assert(verdopple(5) === 10, "Aufgabe 4b");
console.assert(verdopple(true) === false, "Aufgabe 4c");
console.assert(verdopple(false) === true, "Aufgabe 4d");
console.assert(verdopple(null) === null, "Aufgabe 4e");
console.assert(verdopple({}) === null, "Aufgabe 4f");

// ═══ AUFGABE 5: Sichere JSON-Feld-Extraktion ═══

// Loesung: Drei-Stufen-Narrowing:
// 1. typeof === "object" && !== null (object-Check + null-Ausschluss)
// 2. feld in daten (Property existiert)
// 3. typeof === "number" (Property ist eine Zahl)
function holeZahl(daten: unknown, feld: string): number | undefined {
  if (typeof daten !== "object" || daten === null) return undefined;
  if (!(feld in daten)) return undefined;
  const wert = (daten as Record<string, unknown>)[feld];
  if (typeof wert !== "number") return undefined;
  return wert;
}

console.assert(holeZahl({ alter: 30 }, "alter") === 30, "Aufgabe 5a");
console.assert(holeZahl({ alter: "30" }, "alter") === undefined, "Aufgabe 5b");
console.assert(holeZahl({}, "alter") === undefined, "Aufgabe 5c");
console.assert(holeZahl(null, "alter") === undefined, "Aufgabe 5d");
console.assert(holeZahl("text", "length") === undefined, "Aufgabe 5e");

console.log("Alle Loesungen korrekt!");
