// ============================================================
// Loesung 05: Predict the Output
// ============================================================
//
// Hier sind alle Antworten mit ausfuehrlichen Erklaerungen.
// Jede Antwort zeigt das WARUM hinter dem Verhalten.
//
// Ausfuehren mit: tsx solutions/05-predict-the-output.ts
// ============================================================

console.log("=== Loesung 05: Predict the Output ===\n");

// -----------------------------------------------------------
// Snippet 1: typeof zur Laufzeit vs. TypeScript-Typ
// -----------------------------------------------------------
// Antwort: "number"
//
// Erklaerung:
// `typeof` ist ein JavaScript-Operator. Er schaut sich den
// TATSAECHLICHEN Wert zur Laufzeit an -- nicht den TypeScript-Typ.
//
// TypeScript sagt: `wert` hat den Typ `unknown`
// JavaScript sagt: `typeof wert` ist "number" (weil 42 eine Zahl ist)
//
// MERKE: TypeScript-Typen und JavaScript-typeof sind VERSCHIEDENE Systeme!
// TypeScript-Typen existieren nur zur Compile-Zeit.
// JavaScript-typeof laeuft zur Laufzeit.
//
// Andere Beispiele:
//   const x: any = "hello";     typeof x === "string"
//   const y: unknown = true;    typeof y === "boolean"
//   const z: object = [1,2,3];  typeof z === "object"

const wert: unknown = 42;
console.log(`  Snippet 1: typeof wert === "${typeof wert}"`);
console.log("  --> 'unknown' ist ein TypeScript-Typ, JavaScript kennt ihn nicht\n");

// -----------------------------------------------------------
// Snippet 2: Enum-Werte loggen
// -----------------------------------------------------------
// Antwort 2a: "0"  (Richtung.Hoch === 0)
// Antwort 2b: "Hoch"  (Reverse Mapping: Richtung[0] === "Hoch")
//
// Erklaerung:
// Numerische Enums erzeugen ein JavaScript-Objekt mit BIDIREKTIONALEM
// Mapping:
//
//   var Richtung;
//   (function (Richtung) {
//     Richtung[Richtung["Hoch"] = 0] = "Hoch";
//     Richtung[Richtung["Runter"] = 1] = "Runter";
//     ...
//   })(Richtung || (Richtung = {}));
//
// Das Objekt sieht so aus:
//   {
//     "0": "Hoch",     // Reverse: Zahl -> Name
//     "1": "Runter",
//     "Hoch": 0,       // Forward: Name -> Zahl
//     "Runter": 1,
//     ...
//   }
//
// Deshalb: Richtung.Hoch gibt 0, Richtung[0] gibt "Hoch"

enum Richtung { Hoch, Runter, Links, Rechts }
console.log(`  Snippet 2a: Richtung.Hoch === ${Richtung.Hoch}`);
console.log(`  Snippet 2b: Richtung[0] === "${Richtung[0]}"`);
console.log("  --> Numerische Enums haben Reverse Mapping!\n");

// -----------------------------------------------------------
// Snippet 3: Was bleibt nach der Kompilierung?
// -----------------------------------------------------------
// Antwort: "a"
//
// Erklaerung:
// - `interface Punkt { ... }` --> ENTFERNT (Type Erasure)
// - `type PunktListe = Punkt[]` --> ENTFERNT (Type Erasure)
// - `const p: Punkt = { x: 10, y: 20 }` --> `const p = { x: 10, y: 20 }`
// - `console.log(p.x)` --> bleibt unveraendert
//
// Im JavaScript-Output:
//   const p = { x: 10, y: 20 };
//   console.log(p.x);
//
// Sowohl `interface` als auch `type` sind reine Compile-Zeit-Konstrukte.
// Sie verschwinden KOMPLETT. Das Objekt-Literal und console.log sind
// JavaScript und bleiben.

interface Punkt { x: number; y: number; }
type PunktListe = Punkt[];
const p: Punkt = { x: 10, y: 20 };
console.log(`  Snippet 3: Nur const p = {...} und console.log bleiben`);
console.log("  --> interface und type verschwinden spurlos\n");

// -----------------------------------------------------------
// Snippet 4: as-Casting ist keine Konvertierung
// -----------------------------------------------------------
// Antwort 4a: "string"  (typeof zahl ist "string"!)
// Antwort 4b: "4210"  (String-Konkatenation!)
//
// Erklaerung:
// DAS IST DIE WICHTIGSTE LEKTION DIESER UEBUNG.
//
// `eingabe as number` tut zur Laufzeit NICHTS.
// Es ist eine Anweisung an den TypeScript-Compiler:
//   "Vertrau mir, das ist eine number."
//
// Aber der Compiler KONVERTIERT den Wert nicht!
// Zur Laufzeit ist `zahl` immer noch der String "42".
//
//   typeof zahl === "string"  (nicht "number"!)
//   zahl + 10 === "4210"      (String + Number = Konkatenation!)
//
// WENN du wirklich konvertieren willst:
//   const zahl = Number(eingabe);  // DAS konvertiert!
//   typeof zahl === "number"
//   zahl + 10 === 52
//
// MERKE: `as` ist ein Versprechen an den Compiler, keine Umwandlung!

const eingabe: any = "42";
const zahll = eingabe as number;
console.log(`  Snippet 4a: typeof zahl === "${typeof zahll}" (NICHT "number"!)`);
console.log(`  Snippet 4b: zahl + 10 === "${zahll + 10}" (String-Konkatenation!)`);
console.log("  --> 'as number' konvertiert NICHT! Es ist nur ein Compiler-Hinweis.\n");

// -----------------------------------------------------------
// Snippet 5: String-Enum vs. numerisches Enum
// -----------------------------------------------------------
// Antwort 5a: "ROT"
// Antwort 5b: "undefined"
//
// Erklaerung:
// String-Enums haben KEIN Reverse Mapping!
//
// Bei numerischen Enums: Richtung[0] === "Hoch" (Reverse Mapping)
// Bei String-Enums: Farbe["ROT"] === undefined (kein Mapping!)
//
// Das kompilierte JavaScript fuer String-Enums:
//   var Farbe;
//   (function (Farbe) {
//     Farbe["Rot"] = "ROT";
//     Farbe["Gruen"] = "GRUEN";
//     Farbe["Blau"] = "BLAU";
//   })(Farbe || (Farbe = {}));
//
// Das Objekt: { Rot: "ROT", Gruen: "GRUEN", Blau: "BLAU" }
// Kein "ROT": "Rot" Reverse-Eintrag!
//
// Warum? Weil bei String-Enums die Werte nicht eindeutig sein
// muessen, und das Reverse Mapping koennte Konflikte erzeugen.

enum Farbe { Rot = "ROT", Gruen = "GRUEN", Blau = "BLAU" }
console.log(`  Snippet 5a: Farbe.Rot === "${Farbe.Rot}"`);
console.log(`  Snippet 5b: Farbe["ROT"] === "${(Farbe as any)["ROT"]}"`);
console.log("  --> String-Enums haben KEIN Reverse Mapping!\n");

// -----------------------------------------------------------
// Snippet 6: const vs. let -- Literal Types
// -----------------------------------------------------------
// Antwort 6a: '"hello"' (ein Literal Type!)
// Antwort 6b: "string"
//
// Erklaerung:
// Bei `const` weiss TypeScript: Der Wert kann sich nie aendern.
// Deshalb gibt es ihm den EXAKTEN Typ "hello" (einen Literal Type).
//
// Bei `let` koennte der Wert spaeter auf "world" oder "xyz" geaendert
// werden. Deshalb gibt TypeScript ihm den allgemeineren Typ `string`.
//
// In VS Code siehst du:
//   const a = "hello";  // Typ: "hello"
//   let b = "hello";    // Typ: string
//
// Das ist NICHT nur akademisch! Literal Types sind die Grundlage
// fuer Discriminated Unions, ueberladene Funktionen und praezise APIs.
//
// Beispiel:
//   function farbe(c: "rot" | "gruen" | "blau") { ... }
//   const x = "rot";
//   farbe(x);  // OK! x hat den Literal Type "rot"
//
//   let y = "rot";
//   farbe(y);  // FEHLER! y hat den Typ string, nicht "rot"

const a = "hello";
let b = "hello";
console.log(`  Snippet 6a: const a hat den Typ "hello" (Literal Type)`);
console.log(`  Snippet 6b: let b hat den Typ string`);
console.log("  --> const-Variablen bekommen praezisere Typen!\n");

// -----------------------------------------------------------
// Snippet 7: void-Funktion
// -----------------------------------------------------------
// Antwort: "undefined"
//
// Erklaerung:
// In JavaScript gibt JEDE Funktion einen Wert zurueck.
// Wenn kein `return`-Statement vorhanden ist, gibt sie `undefined` zurueck.
//
// `void` in TypeScript bedeutet: "Der Rueckgabewert SOLL nicht
// verwendet werden." Es verhindert aber nicht, dass ein Wert
// zurueckgegeben wird -- es ist ein Hinweis, kein Mechanismus.
//
// Zur Laufzeit:
//   const ergebnis = logge("test");
//   ergebnis === undefined  // true!
//   typeof ergebnis === "undefined"  // true!
//
// MERKE: void ist ein TypeScript-Konzept.
// In JavaScript gibt es kein void als Rueckgabetyp.

function logge(text: string): void {
  // keine Rueckgabe
}
const ergebnis7 = logge("test");
console.log(`  Snippet 7: ergebnis === ${ergebnis7}`);
console.log("  --> void-Funktionen geben in JavaScript undefined zurueck\n");

// -----------------------------------------------------------
// Snippet 8: Objekt-Spread und Typen
// -----------------------------------------------------------
// Antwort: "number"
//
// Erklaerung:
// Der Spread-Operator ueberschreibt Properties von links nach rechts.
//
//   const kopie = { ...original, b: 42 };
//
// original.b ist "x" (string), aber der Spread wird von b: 42
// ueberschrieben. TypeScript ERKENNT das korrekt:
//
//   kopie hat den Typ: { a: number; b: number }
//
// b ist jetzt number, nicht string. TypeScript ist hier schlau
// genug, den Spread korrekt zu analysieren.
//
// Zur Laufzeit: typeof kopie.b === "number" (weil 42 eine Zahl ist)

interface Basis2 { a: number; b: string; }
const original2: Basis2 = { a: 1, b: "x" };
const kopie2 = { ...original2, b: 42 };
console.log(`  Snippet 8: typeof kopie.b === "${typeof kopie2.b}"`);
console.log("  --> Spread ueberschreibt Properties, TypeScript trackt das\n");

// -----------------------------------------------------------
console.log("=== Kernerkenntnisse ===");
console.log("  1. typeof (JavaScript) und TypeScript-Typen sind VERSCHIEDENE Dinge");
console.log("  2. Numerische Enums haben Reverse Mapping, String-Enums NICHT");
console.log("  3. interface und type verschwinden komplett (Type Erasure)");
console.log("  4. 'as Type' konvertiert NICHTS -- es ist nur ein Compiler-Versprechen");
console.log("  5. const-Variablen bekommen Literal Types, let-Variablen nicht");
console.log("  6. void-Funktionen geben in JavaScript undefined zurueck");
console.log("  7. TypeScript trackt Spread-Operatoren korrekt");
