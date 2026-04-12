// ============================================================
// Loesung 02: tsconfig.json verstehen
// ============================================================
//
// Hier sind die richtigen Antworten mit ausfuehrlichen
// Erklaerungen.
//
// Ausfuehren mit: tsx solutions/02-tsconfig-verstehen.ts
// ============================================================

console.log("=== Loesung 02: tsconfig.json verstehen ===\n");

// -----------------------------------------------------------
// Frage 1: Was macht "strict: true"?
// -----------------------------------------------------------
// Richtige Antwort: b
//
// "Fehler: Parameter 'a' hat implizit den Typ 'any'"
//
// Erklaerung: `strict: true` aktiviert unter anderem
// `noImplicitAny`. Das bedeutet: Wenn TypeScript den Typ eines
// Parameters nicht ableiten kann und keine Annotation vorhanden
// ist, wird ein Fehler gemeldet.
//
// In `function addiere(a, b)` haben weder `a` noch `b` eine
// Typ-Annotation. TypeScript kann den Typ nicht ableiten, weil
// keine Aufrufe sichtbar sind. Also ist der implizite Typ `any`
// -- und das ist bei strict: true verboten.
//
// Loesung: `function addiere(a: number, b: number)`

let antwort1: string = "b";
console.log(`Frage 1: ${antwort1.toUpperCase()}`);
console.log("  strict: true aktiviert noImplicitAny.");
console.log("  Parameter ohne Typ-Annotation erzeugen einen Fehler.\n");

// -----------------------------------------------------------
// Frage 2: Was macht "target"?
// -----------------------------------------------------------
// Richtige Antwort: b
//
// "Sie wird in eine normale function() umgewandelt"
//
// Erklaerung: `target: "ES5"` bedeutet, dass TypeScript
// JavaScript-Code erzeugen soll, der mit ES5 kompatibel ist.
// Arrow Functions (=>) wurden erst in ES2015 (ES6) eingefuehrt.
// Also muss tsc die Arrow Function in eine klassische
// function()-Expression umwandeln.
//
// Aus:  zahlen.map(n => n * 2)
// Wird: zahlen.map(function(n) { return n * 2; })
//
// Array.map() selbst ist KEIN Problem -- es existiert seit ES5.
// Nur die SYNTAX der Arrow Function muss angepasst werden.

let antwort2: string = "b";
console.log(`Frage 2: ${antwort2.toUpperCase()}`);
console.log("  target bestimmt die JavaScript-Zielversion.");
console.log("  Arrow Functions werden fuer ES5 zu function() umgewandelt.\n");

// -----------------------------------------------------------
// Frage 3: Was macht "strictNullChecks"?
// -----------------------------------------------------------
// Richtige Antwort: a
//
// "Fehler: Type 'null' is not assignable to type 'string'"
//
// Erklaerung: Mit `strictNullChecks: true` sind `null` und
// `undefined` eigene Typen. Ein `string` kann NICHT null sein,
// es sei denn, du schreibst `string | null`.
//
// Ohne strictNullChecks kann JEDE Variable null oder undefined
// sein -- was bedeutet, dass TypeScript dich nicht warnen kann,
// wenn du vergisst, auf null zu pruefen.
//
// Das ist einer der wichtigsten Schalter in TypeScript!
// Tony Hoare, der Erfinder von null, nannte es seinen
// "Milliarden-Dollar-Fehler". strictNullChecks ist das Heilmittel.

let antwort3: string = "a";
console.log(`Frage 3: ${antwort3.toUpperCase()}`);
console.log("  strictNullChecks macht null/undefined zu eigenen Typen.");
console.log("  Ohne explizites '| null' kann string nicht null sein.\n");

// -----------------------------------------------------------
// Frage 4: Was macht "noEmit"?
// -----------------------------------------------------------
// Richtige Antwort: b
//
// "Es wird nur Type Checking durchgefuehrt, keine .js-Dateien"
//
// Erklaerung: `noEmit: true` sagt dem Compiler: "Pruefe die
// Typen, aber erzeuge keine Ausgabe-Dateien." Das ist nuetzlich,
// wenn ein anderes Werkzeug (z.B. esbuild, Vite, oder tsx) die
// eigentliche Kompilierung uebernimmt und du tsc nur als
// Type Checker einsetzen willst.
//
// Typischer Workflow:
//   - `tsc --noEmit` in der CI-Pipeline (nur pruefen)
//   - `tsx` oder `esbuild` zum tatsaechlichen Kompilieren/Ausfuehren

let antwort4: string = "b";
console.log(`Frage 4: ${antwort4.toUpperCase()}`);
console.log("  noEmit: true = nur Type Checking, keine .js-Ausgabe.");
console.log("  Nuetzlich in Kombination mit schnelleren Bundlern.\n");

// -----------------------------------------------------------
// Frage 5: Was macht "outDir"?
// -----------------------------------------------------------
// Richtige Antwort: c
//
// "dist/utils/helper.js"
//
// Erklaerung: outDir bestimmt, WOHIN die kompilierten Dateien
// geschrieben werden. rootDir bestimmt, was als "Wurzel" der
// Quellstruktur gilt.
//
// Die Verzeichnisstruktur wird RELATIV zu rootDir beibehalten:
//   src/utils/helper.ts  -->  dist/utils/helper.js
//
// Das 'src/' wird durch 'dist/' ersetzt, weil rootDir='./src'
// und outDir='./dist'. Die Unterstruktur (utils/) bleibt erhalten.
//
// NICHT dist/src/utils/helper.js -- das wuerde passieren, wenn
// rootDir nicht gesetzt waere und tsc die gesamte Projektstruktur
// einschliesslich 'src/' in 'dist/' spiegeln wuerde.

let antwort5: string = "c";
console.log(`Frage 5: ${antwort5.toUpperCase()}`);
console.log("  outDir/rootDir: src/utils/helper.ts --> dist/utils/helper.js");
console.log("  Die Struktur relativ zu rootDir wird beibehalten.\n");

// -----------------------------------------------------------
// Frage 6: Reihenfolge der Konfiguration
// -----------------------------------------------------------
// Richtige Antwort: b
//
// "false, weil explizite Einstellungen Vorrang haben"
//
// Erklaerung: `strict: true` ist ein Sammelschalter, der viele
// Einzeloptionen auf true setzt. Aber EXPLIZITE Einstellungen
// ueberschreiben den Sammelschalter.
//
// Das ist beabsichtigt und nuetzlich! Du kannst z.B. schreiben:
//   {
//     "strict": true,
//     "noImplicitAny": false  // alles streng, AUSSER das hier
//   }
//
// Das wird haeufig verwendet, wenn man ein bestehendes Projekt
// schrittweise auf strict umstellt: Man aktiviert strict und
// deaktiviert dann gezielt die Regeln, die noch zu viele
// Fehler verursachen.

let antwort6: string = "b";
console.log(`Frage 6: ${antwort6.toUpperCase()}`);
console.log("  Explizite Einstellungen haben Vorrang vor strict.");
console.log("  strict: true + noImplicitAny: false = noImplicitAny ist AUS.\n");

// -----------------------------------------------------------
// Frage 7: Praktisches Szenario
// -----------------------------------------------------------
// Richtige Antwort: c
//
// Erklaerung der Optionen:
//
// a) FALSCH: target ES5 ist veraltet fuer moderne Node.js-Projekte,
//    und strict: false verschenkt den Hauptvorteil von TypeScript.
//
// b) FALSCH: AMD ist ein Modulsystem fuer Browser (RequireJS),
//    nicht fuer Node.js. Kein outDir oder sourceMap.
//
// c) RICHTIG: Moderne Zielversion (ES2022), Node.js-Module
//    (NodeNext), strenges Type Checking (strict: true),
//    Ausgabe nach dist, und Source Maps fuer Debugging.
//
// d) FALSCH: noEmit: true bedeutet, dass keine .js-Dateien
//    erzeugt werden -- aber die Anforderung war, kompilierten
//    Code nach ./dist zu schreiben.

let antwort7: string = "c";
console.log(`Frage 7: ${antwort7.toUpperCase()}`);
console.log("  Die ideale Node.js-Konfiguration:");
console.log("  target: ES2022, module: NodeNext, strict: true,");
console.log("  outDir: ./dist, sourceMap: true\n");

// -----------------------------------------------------------
// Gesamtergebnis
// -----------------------------------------------------------
console.log("=== Antworten: b, b, a, b, c, b, c ===");
console.log("\nDie richtigen Antworten sind verteilt ueber a, b und c.");
console.log("Das zeigt, dass die Fragen sorgfaeltig formuliert wurden,");
console.log("sodass die richtige Antwort nicht immer an der gleichen Position steht.");
