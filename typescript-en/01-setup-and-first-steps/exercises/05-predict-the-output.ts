// ============================================================
// Uebung 05: Predict the Output
// ============================================================
//
// Diese Uebung trainiert dein mentales Modell von TypeScript.
// Fuer jedes Code-Snippet musst du vorhersagen:
//   - Was gibt der Code aus?
//   - Was sagt TypeScript (Compile-Zeit)?
//   - Was passiert zur Laufzeit?
//
// Schreibe deine Vorhersage als String, dann prueft
// console.assert ob du richtig lagst.
//
// Ausfuehren mit: tsx exercises/05-predict-the-output.ts
// ============================================================

console.log("=== Uebung 05: Predict the Output ===\n");

// -----------------------------------------------------------
// Snippet 1: typeof zur Laufzeit vs. TypeScript-Typ
// -----------------------------------------------------------
//
// Gegeben:
//   const wert: unknown = 42;
//   console.log(typeof wert);
//
// Was gibt `typeof wert` zur Laufzeit aus?
// Denk daran: `typeof` ist ein JavaScript-Operator.
// Der TypeScript-Typ ist `unknown` -- aber was sagt JavaScript?

// TODO: Was ist der Output von typeof wert?
let vorhersage1: string = ""; // <-- Dein Tipp: z.B. "string", "number", "object", "unknown"

const wert: unknown = 42;
const tatsaechlich1 = typeof wert;
console.assert(
  vorhersage1 === tatsaechlich1,
  `Snippet 1: Du sagtest "${vorhersage1}", aber es war "${tatsaechlich1}"`
);
console.log(`  Snippet 1: typeof wert === "${tatsaechlich1}" ${vorhersage1 === tatsaechlich1 ? "-- Richtig!" : "-- Falsch!"}`);

// -----------------------------------------------------------
// Snippet 2: Enum-Werte loggen
// -----------------------------------------------------------
//
// Gegeben:
//   enum Richtung { Hoch, Runter, Links, Rechts }
//   console.log(Richtung.Hoch);
//   console.log(Richtung[0]);
//
// Was geben diese beiden console.log-Aufrufe aus?
// Tipp: Numerische Enums haben ein "Reverse Mapping".

// TODO: Was gibt Richtung.Hoch aus?
let vorhersage2a: string = ""; // <-- z.B. "0", "Hoch", "undefined"

// TODO: Was gibt Richtung[0] aus?
let vorhersage2b: string = ""; // <-- z.B. "0", "Hoch", "undefined"

enum Richtung { Hoch, Runter, Links, Rechts }
const tatsaechlich2a = String(Richtung.Hoch);
const tatsaechlich2b = String(Richtung[0]);
console.assert(
  vorhersage2a === tatsaechlich2a,
  `Snippet 2a: Du sagtest "${vorhersage2a}", aber es war "${tatsaechlich2a}"`
);
console.assert(
  vorhersage2b === tatsaechlich2b,
  `Snippet 2b: Du sagtest "${vorhersage2b}", aber es war "${tatsaechlich2b}"`
);
console.log(`  Snippet 2a: Richtung.Hoch === ${tatsaechlich2a} ${vorhersage2a === tatsaechlich2a ? "-- Richtig!" : "-- Falsch!"}`);
console.log(`  Snippet 2b: Richtung[0] === "${tatsaechlich2b}" ${vorhersage2b === tatsaechlich2b ? "-- Richtig!" : "-- Falsch!"}`);

// -----------------------------------------------------------
// Snippet 3: Was bleibt nach der Kompilierung?
// -----------------------------------------------------------
//
// Gegeben:
//   interface Punkt { x: number; y: number; }
//   type PunktListe = Punkt[];
//   const p: Punkt = { x: 10, y: 20 };
//   console.log(p.x);
//
// Welche dieser Zeilen existieren im JavaScript-Output?
// a) "Nur die letzten zwei Zeilen (const p = ... und console.log)"
// b) "Alle vier Zeilen"
// c) "Nur console.log(p.x)"
// d) "Die letzten drei Zeilen (type, const, console.log)"

let vorhersage3: string = ""; // <-- Deine Antwort: "a", "b", "c" oder "d"

const korrekt3 = "a";
console.assert(
  vorhersage3.toLowerCase() === korrekt3,
  `Snippet 3: Du sagtest "${vorhersage3}", aber richtig ist "${korrekt3}"`
);
console.log(`  Snippet 3: ${vorhersage3.toLowerCase() === korrekt3 ? "Richtig!" : `Falsch! Richtig: "${korrekt3}" -- interface und type verschwinden komplett`}`);

// -----------------------------------------------------------
// Snippet 4: as-Casting ist keine Konvertierung
// -----------------------------------------------------------
//
// Gegeben:
//   const eingabe: any = "42";
//   const zahl = eingabe as number;
//   console.log(typeof zahl);
//   console.log(zahl + 10);
//
// Was gibt `typeof zahl` aus?
// Was gibt `zahl + 10` aus?
// Denk daran: `as number` ist KEINE Konvertierung!

// TODO: Was gibt typeof zahl aus?
let vorhersage4a: string = ""; // <-- z.B. "number", "string"

// TODO: Was gibt zahl + 10 aus?
let vorhersage4b: string = ""; // <-- z.B. "52", "4210"

const eingabe: any = "42";
const zahl = eingabe as number;
const tatsaechlich4a = typeof zahl;
const tatsaechlich4b = String(zahl + 10);

console.assert(
  vorhersage4a === tatsaechlich4a,
  `Snippet 4a: Du sagtest "${vorhersage4a}", aber es war "${tatsaechlich4a}"`
);
console.assert(
  vorhersage4b === tatsaechlich4b,
  `Snippet 4b: Du sagtest "${vorhersage4b}", aber es war "${tatsaechlich4b}"`
);
console.log(`  Snippet 4a: typeof zahl === "${tatsaechlich4a}" ${vorhersage4a === tatsaechlich4a ? "-- Richtig!" : "-- Falsch!"}`);
console.log(`  Snippet 4b: zahl + 10 === "${tatsaechlich4b}" ${vorhersage4b === tatsaechlich4b ? "-- Richtig! (String-Konkatenation, nicht Addition!)" : "-- Falsch!"}`);

// -----------------------------------------------------------
// Snippet 5: String-Enum vs. numerisches Enum
// -----------------------------------------------------------
//
// Gegeben:
//   enum Farbe { Rot = "ROT", Gruen = "GRUEN", Blau = "BLAU" }
//   console.log(Farbe.Rot);
//   console.log(Farbe["ROT"]);  // <-- Was passiert hier?
//
// Bei numerischen Enums gibt es Reverse Mapping (Snippet 2).
// Gibt es das auch bei String-Enums?

// TODO: Was gibt Farbe.Rot aus?
let vorhersage5a: string = ""; // <-- z.B. "ROT", "Rot", "0"

// TODO: Was gibt Farbe["ROT"] aus?
let vorhersage5b: string = ""; // <-- z.B. "Rot", "ROT", "undefined"

enum Farbe { Rot = "ROT", Gruen = "GRUEN", Blau = "BLAU" }
const tatsaechlich5a = String(Farbe.Rot);
const tatsaechlich5b = String((Farbe as any)["ROT"]);

console.assert(
  vorhersage5a === tatsaechlich5a,
  `Snippet 5a: Du sagtest "${vorhersage5a}", aber es war "${tatsaechlich5a}"`
);
console.assert(
  vorhersage5b === tatsaechlich5b,
  `Snippet 5b: Du sagtest "${vorhersage5b}", aber es war "${tatsaechlich5b}"`
);
console.log(`  Snippet 5a: Farbe.Rot === "${tatsaechlich5a}" ${vorhersage5a === tatsaechlich5a ? "-- Richtig!" : "-- Falsch!"}`);
console.log(`  Snippet 5b: Farbe["ROT"] === "${tatsaechlich5b}" ${vorhersage5b === tatsaechlich5b ? "-- Richtig! String-Enums haben KEIN Reverse Mapping!" : "-- Falsch!"}`);

// -----------------------------------------------------------
// Snippet 6: const vs. let -- TypeScript-Typ
// -----------------------------------------------------------
//
// Gegeben:
//   const a = "hello";
//   let b = "hello";
//
// Wenn du in VS Code ueber `a` hoverst, welchen Typ zeigt
// TypeScript an? Und fuer `b`?
// Tipp: Bei `const` passiert etwas Besonderes...

// TODO: Welchen Typ hat a laut TypeScript?
let vorhersage6a: string = ""; // <-- z.B. "string", '"hello"'

// TODO: Welchen Typ hat b laut TypeScript?
let vorhersage6b: string = ""; // <-- z.B. "string", '"hello"'

// Die Antwort: const-Variablen bekommen einen "Literal Type"
const korrekt6a = '"hello"';  // TypeScript sagt: const a: "hello"
const korrekt6b = "string";   // TypeScript sagt: let b: string

console.assert(
  vorhersage6a === korrekt6a,
  `Snippet 6a: Du sagtest "${vorhersage6a}", aber richtig ist ${korrekt6a}`
);
console.assert(
  vorhersage6b === korrekt6b,
  `Snippet 6b: Du sagtest "${vorhersage6b}", aber richtig ist "${korrekt6b}"`
);
console.log(`  Snippet 6a: Typ von const a = ${korrekt6a} ${vorhersage6a === korrekt6a ? "-- Richtig!" : `-- Falsch! Richtig: ${korrekt6a} (Literal Type)`}`);
console.log(`  Snippet 6b: Typ von let b = "${korrekt6b}" ${vorhersage6b === korrekt6b ? "-- Richtig!" : `-- Falsch! Richtig: "${korrekt6b}" (weil let veraenderbar ist)`}`);

// -----------------------------------------------------------
// Snippet 7: void-Funktion
// -----------------------------------------------------------
//
// Gegeben:
//   function logge(text: string): void {
//     console.log(text);
//   }
//   const ergebnis = logge("test");
//   console.log(ergebnis);
//
// Was gibt console.log(ergebnis) aus?
// Tipp: Was gibt eine void-Funktion in JavaScript zurueck?

// TODO: Was wird ausgegeben?
let vorhersage7: string = ""; // <-- z.B. "undefined", "null", "void", "nichts"

function logge(text: string): void {
  // stille Ausfuehrung fuer den Test
}
const ergebnis7 = logge("test");
const tatsaechlich7 = String(ergebnis7);

console.assert(
  vorhersage7 === tatsaechlich7,
  `Snippet 7: Du sagtest "${vorhersage7}", aber es war "${tatsaechlich7}"`
);
console.log(`  Snippet 7: ergebnis === ${tatsaechlich7} ${vorhersage7 === tatsaechlich7 ? "-- Richtig!" : `-- Falsch! void-Funktionen geben "${tatsaechlich7}" zurueck in JavaScript`}`);

// -----------------------------------------------------------
// Snippet 8: Objekt-Spread und Typen
// -----------------------------------------------------------
//
// Gegeben:
//   interface Basis { a: number; b: string; }
//   const original: Basis = { a: 1, b: "x" };
//   const kopie = { ...original, b: 42 };
//   console.log(typeof kopie.b);
//
// Was ist der Typ von kopie.b laut TypeScript?
// Und was gibt typeof kopie.b zur LAUFZEIT aus?

// TODO: Was gibt typeof kopie.b zur Laufzeit aus?
let vorhersage8: string = ""; // <-- z.B. "string", "number"

interface Basis { a: number; b: string; }
const original: Basis = { a: 1, b: "x" };
const kopie = { ...original, b: 42 };
const tatsaechlich8 = typeof kopie.b;

console.assert(
  vorhersage8 === tatsaechlich8,
  `Snippet 8: Du sagtest "${vorhersage8}", aber es war "${tatsaechlich8}"`
);
console.log(`  Snippet 8: typeof kopie.b === "${tatsaechlich8}" ${vorhersage8 === tatsaechlich8 ? "-- Richtig! Spread ueberschreibt b mit number." : `-- Falsch! Obwohl Basis.b string ist, ueberschreibt der Spread den Wert.`}`);

// -----------------------------------------------------------
// Auswertung
// -----------------------------------------------------------

console.log("\n--- Auswertung ---");

const alle = [
  vorhersage1 === tatsaechlich1,
  vorhersage2a === tatsaechlich2a,
  vorhersage2b === tatsaechlich2b,
  vorhersage3.toLowerCase() === korrekt3,
  vorhersage4a === tatsaechlich4a,
  vorhersage4b === tatsaechlich4b,
  vorhersage5a === tatsaechlich5a,
  vorhersage5b === tatsaechlich5b,
  vorhersage6a === korrekt6a,
  vorhersage6b === korrekt6b,
  vorhersage7 === tatsaechlich7,
  vorhersage8 === tatsaechlich8,
];

const richtig = alle.filter(Boolean).length;
const gesamt = alle.length;

console.log(`Ergebnis: ${richtig}/${gesamt} richtig`);

if (richtig === gesamt) {
  console.log("Ausgezeichnet! Dein mentales Modell von TypeScript ist sehr gut.");
  console.log("Du verstehst den Unterschied zwischen Compile-Zeit und Laufzeit.");
} else if (richtig >= 8) {
  console.log("Sehr gut! Ein paar Feinheiten fehlen noch -- schau dir die Loesung an.");
} else if (richtig >= 5) {
  console.log("Solide Grundlage! Die Luecken zeigen dir, wo du nochmal nachlesen solltest.");
} else {
  console.log("Kein Stress -- diese Fragen sind knifflig! Lies die Loesung und versuche es nochmal.");
  console.log("Fokussiere dich auf: Was existiert zur Laufzeit? Was existiert nur zur Compile-Zeit?");
}
