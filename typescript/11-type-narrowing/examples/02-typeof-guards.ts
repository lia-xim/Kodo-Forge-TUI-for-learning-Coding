/**
 * Lektion 11 - Example 02: typeof Guards
 *
 * Ausfuehren mit: npx tsx examples/02-typeof-guards.ts
 *
 * Zeigt alle typeof-Varianten und den beruehmten typeof-null-Bug.
 */

// ─── ALLE TYPEOF-ERGEBNISSE ────────────────────────────────────────────────

console.log("--- Alle typeof-Ergebnisse ---");
console.log(`typeof "hallo"    = "${typeof "hallo"}"`);     // "string"
console.log(`typeof 42         = "${typeof 42}"`);           // "number"
console.log(`typeof true       = "${typeof true}"`);         // "boolean"
console.log(`typeof undefined  = "${typeof undefined}"`);    // "undefined"
console.log(`typeof {}         = "${typeof {}}"`);           // "object"
console.log(`typeof []         = "${typeof []}"`);           // "object" (!)
console.log(`typeof null       = "${typeof null}"`);         // "object" (Bug!)
console.log(`typeof (() => {}) = "${typeof (() => {})}"`);   // "function"
console.log(`typeof Symbol()   = "${typeof Symbol()}"`);     // "symbol"
console.log(`typeof 42n        = "${typeof 42n}"`);          // "bigint"

// ─── TYPEOF FU ER NARROWING ─────────────────────────────────────────────────

function allePrimitivenNarrowen(wert: string | number | boolean | undefined | symbol | bigint) {
  console.log("\n--- typeof Narrowing ---");

  if (typeof wert === "string") {
    console.log(`String:    "${wert.toUpperCase()}"`);
    return;
  }
  if (typeof wert === "number") {
    console.log(`Number:    ${wert.toFixed(2)}`);
    return;
  }
  if (typeof wert === "boolean") {
    console.log(`Boolean:   ${wert ? "JA" : "NEIN"}`);
    return;
  }
  if (typeof wert === "undefined") {
    console.log("Undefined: (kein Wert)");
    return;
  }
  if (typeof wert === "symbol") {
    console.log(`Symbol:    ${wert.toString()}`);
    return;
  }
  if (typeof wert === "bigint") {
    console.log(`BigInt:    ${wert}n`);
    return;
  }
}

allePrimitivenNarrowen("hallo");
allePrimitivenNarrowen(3.14);
allePrimitivenNarrowen(true);
allePrimitivenNarrowen(undefined);
allePrimitivenNarrowen(Symbol("test"));
allePrimitivenNarrowen(42n);

// ─── DER TYPEOF-NULL-BUG ───────────────────────────────────────────────────

console.log("\n--- typeof null Bug ---");

function unsicher(wert: string | object | null) {
  if (typeof wert === "object") {
    // ACHTUNG: wert ist hier object | null!
    // TypeScript weiss ueber den Bug Bescheid:
    console.log(`typeof === "object" => Typ ist: object | null`);

    if (wert !== null) {
      // Jetzt sicher: wert ist object
      console.log(`  Schluessel: ${Object.keys(wert).join(", ")}`);
    } else {
      console.log("  wert ist null!");
    }
  }
}

unsicher({ name: "Max" });  // Schluessel: name
unsicher(null);             // wert ist null!

// Besseres Pattern: null zuerst ausschliessen
function sicher(wert: string | object | null) {
  if (wert === null) {
    console.log("null erkannt");
    return;
  }
  // wert: string | object — null ist weg!
  if (typeof wert === "object") {
    console.log(`Objekt mit Schluesseln: ${Object.keys(wert).join(", ")}`);
  } else {
    console.log(`String: "${wert}"`);
  }
}

console.log("\nNach null-first Pattern:");
sicher(null);
sicher({ a: 1, b: 2 });
sicher("text");

// ─── TYPEOF IM SWITCH ──────────────────────────────────────────────────────

console.log("\n--- typeof im switch ---");

function formatiere(wert: string | number | boolean | undefined) {
  switch (typeof wert) {
    case "string":
      return `"${wert}"`; // wert: string
    case "number":
      return wert.toFixed(1); // wert: number
    case "boolean":
      return wert ? "wahr" : "falsch"; // wert: boolean
    case "undefined":
      return "(leer)"; // wert: undefined
  }
}

console.log(formatiere("test"));     // "test"
console.log(formatiere(3.14));       // 3.1
console.log(formatiere(true));       // wahr
console.log(formatiere(undefined));  // (leer)

// ─── TYPEOF MIT NEGATION ───────────────────────────────────────────────────

console.log("\n--- typeof mit Negation ---");

function nichtString(wert: string | number): number {
  if (typeof wert !== "string") {
    // wert: number — string wurde ausgeschlossen
    return wert * 2;
  }
  // wert: string
  return wert.length;
}

console.log(nichtString(21));      // 42
console.log(nichtString("hallo")); // 5

// ─── TYPEOF MIT UNKNOWN ────────────────────────────────────────────────────

console.log("\n--- typeof mit unknown ---");

function sicherVerarbeiten(daten: unknown): string {
  if (typeof daten === "string") return `String: ${daten}`;
  if (typeof daten === "number") return `Number: ${daten}`;
  if (typeof daten === "boolean") return `Boolean: ${daten}`;
  if (typeof daten === "undefined") return "undefined";
  if (typeof daten === "object") {
    if (daten === null) return "null";
    if (Array.isArray(daten)) return `Array[${daten.length}]`;
    return `Object{${Object.keys(daten).join(",")}}`;
  }
  return `Sonstiges: ${String(daten)}`;
}

console.log(sicherVerarbeiten("hi"));
console.log(sicherVerarbeiten(42));
console.log(sicherVerarbeiten(null));
console.log(sicherVerarbeiten([1, 2, 3]));
console.log(sicherVerarbeiten({ x: 1 }));

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
