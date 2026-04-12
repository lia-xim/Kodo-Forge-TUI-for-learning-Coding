/**
 * Lektion 02 - Solution 03: Type Narrowing Challenge
 *
 * Ausfuehren mit: npx tsx solutions/03-type-narrowing-challenge.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches Type Narrowing
// ═══════════════════════════════════════════════════════════════════════════

function beschreibe(wert: unknown): string {
  // null muss VOR typeof geprueft werden, weil typeof null === "object"
  if (wert === null) {
    return "Kein Wert (null)";
  }

  if (wert === undefined) {
    return "Kein Wert (undefined)";
  }

  if (typeof wert === "string") {
    return `Text: ${wert}`;
  }

  if (typeof wert === "number") {
    return `Zahl: ${wert.toFixed(2)}`;
  }

  if (typeof wert === "boolean") {
    return `Wahrheitswert: ${wert ? "ja" : "nein"}`;
  }

  return `Unbekannter Typ: ${typeof wert}`;
}

// ERKLAERUNG:
// - Die Reihenfolge ist wichtig: null MUSS vor typeof-Pruefungen kommen,
//   weil typeof null === "object" (historischer Bug).
// - Jede if-Bedingung "narrowt" den Typ: Nach dem string-Check weiss
//   TypeScript dass wert ein string ist und erlaubt .toFixed(), usw.
// - Am Ende ist wert immer noch unknown, aber alle speziellen Faelle
//   sind behandelt.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Verschachtelte Objektvalidierung
// ═══════════════════════════════════════════════════════════════════════════

interface Produkt {
  name: string;
  preis: number;
  aufLager: boolean;
}

function istProdukt(daten: unknown): daten is Produkt {
  // Schritt 1: Ist es ueberhaupt ein Objekt (und nicht null)?
  if (typeof daten !== "object" || daten === null) {
    return false;
  }

  // Schritt 2: Existieren alle Properties?
  if (!("name" in daten) || !("preis" in daten) || !("aufLager" in daten)) {
    return false;
  }

  // Schritt 3: Haben die Properties den richtigen Typ?
  // Nach dem "in"-Check muessen wir casten, um auf die Werte zuzugreifen.
  // Hier nutzen wir Record<string, unknown> als sicheren Zwischenschritt.
  const obj = daten as Record<string, unknown>;

  return (
    typeof obj.name === "string" &&
    typeof obj.preis === "number" &&
    typeof obj.aufLager === "boolean"
  );
}

// ERKLAERUNG:
// - Type Guards mit "data is Produkt" sind das TypeScript-Muster fuer
//   Laufzeit-Validierung. Der Compiler vertraut dir: Wenn die Funktion
//   true zurueckgibt, gilt der Typ.
// - Die Pruefung in drei Schritten (Objekt? → Properties da? → Typen korrekt?)
//   ist das Standardmuster. Man koennte auch eine Validierungslibrary
//   wie zod oder io-ts verwenden — aber das Grundprinzip bleibt gleich.
// - Das "as Record<string, unknown>" in Schritt 3 ist der EINZIGE
//   akzeptable Cast hier — wir wissen bereits dass es ein Objekt ist.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Type Narrowing mit mehreren Typen
// ═══════════════════════════════════════════════════════════════════════════

function addiereSicher(a: unknown, b: unknown): string | number | bigint | null {
  // Beide muessen den GLEICHEN Typ haben:
  if (typeof a === "number" && typeof b === "number") {
    return a + b;
  }

  if (typeof a === "string" && typeof b === "string") {
    return a + b;
  }

  if (typeof a === "bigint" && typeof b === "bigint") {
    return a + b;
  }

  return null;
}

// ERKLAERUNG:
// - TypeScript narrowt in jeder if-Bedingung BEIDE Parameter gleichzeitig.
// - "typeof a === 'number' && typeof b === 'number'" bedeutet:
//   Im Inneren des if-Blocks sind BEIDE als number bekannt.
// - Wir pruefen bigint separat, weil number + bigint in JS ein Error waere.
// - Alle anderen Kombinationen (number + string, boolean + boolean, usw.)
//   geben null zurueck.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Sichere JSON-Verarbeitung
// ═══════════════════════════════════════════════════════════════════════════

function parseJSON(text: string): unknown {
  try {
    // JSON.parse gibt "any" zurueck.
    // Wir weisen es sofort "unknown" zu — das ist der sichere Weg.
    const result: unknown = JSON.parse(text);
    return result;
  } catch {
    // Bei ungueltigem JSON: null statt Error werfen
    return null;
  }
}

// ERKLAERUNG:
// - JSON.parse ist eine der wenigen Stellen wo "any" im TypeScript-Code
//   vorkommt (es ist so in der Standardbibliothek definiert).
// - Indem wir das Ergebnis sofort als "unknown" speichern, verhindern wir
//   dass sich "any" ausbreitet.
// - Der try-catch faengt ungueltige JSON-Strings ab — in der Praxis
//   wuerdest du vielleicht auch den Fehler loggen.
// - Dieses Pattern ("safe parse") ist extrem nuetzlich in der Praxis.
//   Libraries wie zod bieten es als z.safeParse() an.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Exhaustive Type Guard
// ═══════════════════════════════════════════════════════════════════════════

function formatApiAntwort(antwort: unknown): string {
  // Schritt 1: Ist es ein Objekt?
  if (typeof antwort !== "object" || antwort === null) {
    return "Unbekannte Antwort";
  }

  // Schritt 2: Hat es ein "status"-Property?
  if (!("status" in antwort)) {
    return "Unbekannte Antwort";
  }

  // Sicherer Zugriff auf Properties
  const obj = antwort as Record<string, unknown>;
  const status = obj.status;

  // Schritt 3: Welcher Status?
  if (status === "success" && typeof obj.data === "string") {
    return `Erfolg: ${obj.data}`;
  }

  if (
    status === "error" &&
    typeof obj.message === "string" &&
    typeof obj.code === "number"
  ) {
    return `Fehler [${obj.code}]: ${obj.message}`;
  }

  if (status === "loading") {
    return "Wird geladen...";
  }

  return "Unbekannte Antwort";
}

// ERKLAERUNG:
// - Diese Funktion zeigt ein realistisches Pattern: API-Responses validieren.
// - In der Praxis wuerdest du wahrscheinlich eine Library wie zod verwenden,
//   aber das Grundprinzip ist identisch.
// - Die verschachtelten Pruefungen stellen sicher, dass JEDER Zugriff
//   auf ein Property erst nach einer Pruefung passiert.
// - Beachte: Wir pruefen bei "error" nicht nur den status, sondern auch
//   ob message und code den richtigen Typ haben. Das ist defensive Programmierung.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Test 1: beschreibe
console.assert(beschreibe("Hallo") === "Text: Hallo", "1a: String");
console.assert(beschreibe(3.14159) === "Zahl: 3.14", "1b: Number");
console.assert(beschreibe(true) === "Wahrheitswert: ja", "1c: Boolean true");
console.assert(beschreibe(false) === "Wahrheitswert: nein", "1d: Boolean false");
console.assert(beschreibe(null) === "Kein Wert (null)", "1e: null");
console.assert(beschreibe(undefined) === "Kein Wert (undefined)", "1f: undefined");
console.assert(beschreibe({}) === "Unbekannter Typ: object", "1g: Objekt");

// Test 2: istProdukt
console.assert(istProdukt({ name: "Laptop", preis: 999, aufLager: true }) === true, "2a: Gueltiges Produkt");
console.assert(istProdukt({ name: "Laptop", preis: "999" }) === false, "2b: preis ist string");
console.assert(istProdukt({ name: "Laptop" }) === false, "2c: Fehlende Felder");
console.assert(istProdukt(null) === false, "2d: null");
console.assert(istProdukt("Laptop") === false, "2e: String");
console.assert(istProdukt({ name: 42, preis: 999, aufLager: true }) === false, "2f: name ist number");

// Test 3: addiereSicher
console.assert(addiereSicher(10, 20) === 30, "3a: number + number");
console.assert(addiereSicher("Hallo ", "Welt") === "Hallo Welt", "3b: string + string");
console.assert(addiereSicher(10n, 20n) === 30n, "3c: bigint + bigint");
console.assert(addiereSicher(10, "20") === null, "3d: Gemischt → null");
console.assert(addiereSicher(true, false) === null, "3e: boolean → null");

// Test 4: parseJSON
console.assert(typeof parseJSON('{"a": 1}') === "object", "4a: Gueltiges JSON");
console.assert(parseJSON("ungueltig!!!") === null, "4b: Ungueltiges JSON");
console.assert(parseJSON('42') === 42, "4c: Zahl-JSON");
console.assert(parseJSON('"hallo"') === "hallo", "4d: String-JSON");

// Test 5: formatApiAntwort
console.assert(
  formatApiAntwort({ status: "success", data: "Daten geladen" }) === "Erfolg: Daten geladen",
  "5a: Erfolg"
);
console.assert(
  formatApiAntwort({ status: "error", message: "Nicht gefunden", code: 404 }) === "Fehler [404]: Nicht gefunden",
  "5b: Fehler"
);
console.assert(
  formatApiAntwort({ status: "loading" }) === "Wird geladen...",
  "5c: Laden"
);
console.assert(
  formatApiAntwort({ status: "????" }) === "Unbekannte Antwort",
  "5d: Unbekannter Status"
);
console.assert(
  formatApiAntwort("Kein Objekt") === "Unbekannte Antwort",
  "5e: Kein Objekt"
);

console.log("\nAlle Tests bestanden! Gut gemacht!");
