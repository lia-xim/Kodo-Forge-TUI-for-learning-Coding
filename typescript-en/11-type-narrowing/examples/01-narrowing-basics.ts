/**
 * Lektion 11 - Example 01: Narrowing Basics
 *
 * Ausfuehren mit: npx tsx examples/01-narrowing-basics.ts
 *
 * Zeigt das Grundkonzept von Type Narrowing:
 * Wie TypeScript Typen durch Control Flow Analysis verengt.
 */

// ─── GRUNDPRINZIP: Union Types ohne Narrowing sind nutzlos ──────────────────

function ohneNarrowing(wert: string | number) {
  // TypeScript weiss nicht, ob wert string oder number ist.
  // Methoden die nur auf einem Typ existieren, sind verboten:
  // wert.toUpperCase();  // Error: Property 'toUpperCase' does not exist on type 'number'
  // wert.toFixed(2);     // Error: Property 'toFixed' does not exist on type 'string'

  // Nur Operationen die auf BEIDEN Typen existieren, sind erlaubt:
  console.log(wert.toString());  // OK — beide haben toString()
  console.log(typeof wert);       // OK — typeof ist ein Laufzeit-Operator
}

ohneNarrowing("hallo");
ohneNarrowing(42);

// ─── MIT NARROWING: Der Typ wird im Block verengt ───────────────────────────

function mitNarrowing(wert: string | number) {
  if (typeof wert === "string") {
    // HIER ist wert: string
    console.log(`String: "${wert.toUpperCase()}"`);
  } else {
    // HIER ist wert: number (string wurde eliminiert)
    console.log(`Number: ${wert.toFixed(2)}`);
  }
}

mitNarrowing("hallo");  // String: "HALLO"
mitNarrowing(3.14);     // Number: 3.14

// ─── NARROWING IST KUMULATIV ────────────────────────────────────────────────

function kumulativ(x: string | number | boolean | null) {
  // x: string | number | boolean | null
  console.log("\n--- Kumulatives Narrowing ---");

  if (x === null) {
    console.log("x ist null");
    return;
  }
  // x: string | number | boolean (null eliminiert)

  if (typeof x === "boolean") {
    console.log(`Boolean: ${x}`);
    return;
  }
  // x: string | number (boolean eliminiert)

  if (typeof x === "string") {
    console.log(`String: ${x.toUpperCase()}`);
    // x: string
  } else {
    console.log(`Number: ${x.toFixed(2)}`);
    // x: number
  }
}

kumulativ(null);     // x ist null
kumulativ(true);     // Boolean: true
kumulativ("test");   // String: TEST
kumulativ(42);       // Number: 42.00

// ─── NARROWING IST LOKAL ───────────────────────────────────────────────────

function lokal(wert: string | number) {
  if (typeof wert === "string") {
    // wert: string — NUR in diesem Block
    console.log(wert.toUpperCase());
  }
  // wert: string | number — der Typ ist zurueckgesetzt!
  // wert.toUpperCase();  // Error! Nicht mehr garantiert string

  // Aber mit early return funktioniert es:
  if (typeof wert !== "string") {
    return;
  }
  // Ab hier: wert: string (fuer den Rest der Funktion)
  console.log(wert.toUpperCase());  // OK!
}

// ─── NARROWING vs. TYPE ASSERTION ───────────────────────────────────────────

function unsicher(wert: unknown) {
  // Type Assertion — DU versprichst dem Compiler
  const s = wert as string;
  // Wenn wert KEINE string ist, crasht das zur Laufzeit:
  // s.toUpperCase();  // Potential Runtime Error!
}

function sicher(wert: unknown) {
  // Type Narrowing — DU beweist es dem Compiler
  if (typeof wert === "string") {
    console.log(wert.toUpperCase());  // Garantiert sicher
  }
}

console.log("\n--- Narrowing vs Assertion ---");
sicher("hallo");     // HALLO
sicher(42);          // (nichts, da nicht string)
// unsicher(42);     // Wuerde crashen bei toUpperCase()

// ─── NARROWING IN VERSCHIEDENEN KONTEXTEN ───────────────────────────────────

// Ternary Operator
function ternary(x: string | number): string {
  return typeof x === "string" ? x.toUpperCase() : x.toFixed(2);
}

console.log("\n--- Verschiedene Kontexte ---");
console.log(ternary("hallo"));  // HALLO
console.log(ternary(3.14));     // 3.14

// While-Schleife
function verarbeiteListe(werte: (string | number)[]) {
  let i = 0;
  while (i < werte.length) {
    const wert = werte[i];
    if (typeof wert === "string") {
      console.log(`  String: ${wert}`);
    } else {
      console.log(`  Number: ${wert}`);
    }
    i++;
  }
}

console.log("\nListe verarbeiten:");
verarbeiteListe(["a", 1, "b", 2]);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
