// ============================================================
// Uebung 02: tsconfig.json verstehen
// ============================================================
//
// In dieser Uebung geht es NICHT ums Programmieren, sondern
// ums VERSTEHEN. Du musst vorhersagen, was passiert, wenn
// bestimmte tsconfig-Optionen aktiv sind.
//
// Fuer jede Frage:
//   1. Lies die Frage und den Code
//   2. Ueberlege, was passiert
//   3. Schreibe deine Antwort als String-Zuweisung
//
// Ausfuehren mit: tsx exercises/02-tsconfig-verstehen.ts
// ============================================================

console.log("=== Uebung 02: tsconfig.json verstehen ===\n");

// -----------------------------------------------------------
// Frage 1: Was macht "strict: true"?
// -----------------------------------------------------------
//
// Gegeben diese tsconfig.json:
//   { "compilerOptions": { "strict": true } }
//
// Und dieser Code:
//   function addiere(a, b) {
//     return a + b;
//   }
//
// Was passiert beim Kompilieren?
// a) "Kein Fehler, der Code kompiliert erfolgreich"
// b) "Fehler: Parameter 'a' hat implizit den Typ 'any'"
// c) "Fehler: Funktion hat keinen Rueckgabetyp"
// d) "Fehler: 'addiere' wird nie verwendet"

// TODO: Weise deine Antwort zu (z.B. "b")
let antwort1: string = ""; // <-- Deine Antwort hier

console.assert(antwort1 !== "", "Frage 1: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Frage 2: Was macht "target"?
// -----------------------------------------------------------
//
// Gegeben diese tsconfig.json:
//   { "compilerOptions": { "target": "ES5" } }
//
// Und dieser Code:
//   const zahlen = [1, 2, 3];
//   const verdoppelt = zahlen.map(n => n * 2);
//
// Was passiert mit der Arrow Function (=>) beim Kompilieren?
// a) "Sie bleibt eine Arrow Function"
// b) "Sie wird in eine normale function() umgewandelt"
// c) "Es gibt einen Fehler, weil ES5 kein map() hat"
// d) "Die Arrow Function wird entfernt"

// TODO: Weise deine Antwort zu
let antwort2: string = ""; // <-- Deine Antwort hier

console.assert(antwort2 !== "", "Frage 2: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Frage 3: Was macht "strictNullChecks"?
// -----------------------------------------------------------
//
// Gegeben diese tsconfig.json:
//   { "compilerOptions": { "strictNullChecks": true } }
//
// Und dieser Code:
//   let name: string = "Anna";
//   name = null;
//
// Was passiert?
// a) "Fehler: Type 'null' is not assignable to type 'string'"
// b) "Kein Fehler, null kann jedem Typ zugewiesen werden"
// c) "Kein Fehler, aber eine Warnung"
// d) "Laufzeitfehler beim Ausfuehren"

// TODO: Weise deine Antwort zu
let antwort3: string = ""; // <-- Deine Antwort hier

console.assert(antwort3 !== "", "Frage 3: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Frage 4: Was macht "noEmit"?
// -----------------------------------------------------------
//
// Gegeben diese tsconfig.json:
//   { "compilerOptions": { "noEmit": true } }
//
// Was passiert, wenn du `tsc` ausfuehrst?
// a) "Es werden .js-Dateien erzeugt, aber ohne Typen"
// b) "Es wird nur Type Checking durchgefuehrt, keine .js-Dateien"
// c) "Es wird gar nichts gemacht"
// d) "Es gibt einen Fehler, weil noEmit nicht erlaubt ist"

// TODO: Weise deine Antwort zu
let antwort4: string = ""; // <-- Deine Antwort hier

console.assert(antwort4 !== "", "Frage 4: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Frage 5: Was macht "outDir"?
// -----------------------------------------------------------
//
// Gegeben diese tsconfig.json:
//   {
//     "compilerOptions": {
//       "outDir": "./dist",
//       "rootDir": "./src"
//     }
//   }
//
// Deine Datei liegt unter: src/utils/helper.ts
//
// Wo wird die kompilierte .js-Datei erstellt?
// a) "dist/helper.js"
// b) "dist/src/utils/helper.js"
// c) "dist/utils/helper.js"
// d) "Im gleichen Ordner wie die .ts-Datei"

// TODO: Weise deine Antwort zu
let antwort5: string = ""; // <-- Deine Antwort hier

console.assert(antwort5 !== "", "Frage 5: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Frage 6: Reihenfolge der Konfiguration
// -----------------------------------------------------------
//
// Gegeben diese tsconfig.json:
//   {
//     "compilerOptions": {
//       "strict": true,
//       "noImplicitAny": false
//     }
//   }
//
// `strict: true` aktiviert unter anderem `noImplicitAny`.
// Aber hier wird `noImplicitAny` explizit auf false gesetzt.
//
// Was gilt fuer noImplicitAny?
// a) "true, weil strict: true alles ueberschreibt"
// b) "false, weil explizite Einstellungen Vorrang haben"
// c) "Es gibt einen Fehler wegen widersprüchlicher Optionen"
// d) "Es ist zufaellig, welcher Wert gilt"

// TODO: Weise deine Antwort zu
let antwort6: string = ""; // <-- Deine Antwort hier

console.assert(antwort6 !== "", "Frage 6: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Frage 7: Praktisches Szenario
// -----------------------------------------------------------
//
// Du arbeitest an einem Node.js-Projekt. Du moechtest:
//   - Moderne JavaScript-Features nutzen (ES2022)
//   - Strenges Type Checking
//   - Kompiliertes JS nach ./dist
//   - Source Maps fuer Debugging
//   - Node.js Module (CommonJS & ESM)
//
// Welche tsconfig.json ist am besten geeignet?
//
// a)  { "compilerOptions": {
//        "target": "ES5", "strict": false, "outDir": "./dist"
//      }}
//
// b)  { "compilerOptions": {
//        "target": "ESNext", "module": "AMD", "strict": true
//      }}
//
// c)  { "compilerOptions": {
//        "target": "ES2022", "module": "NodeNext",
//        "moduleResolution": "NodeNext",
//        "strict": true, "outDir": "./dist", "sourceMap": true
//      }}
//
// d)  { "compilerOptions": {
//        "target": "ES2022", "strict": true, "noEmit": true
//      }}

// TODO: Weise deine Antwort zu
let antwort7: string = ""; // <-- Deine Antwort hier

console.assert(antwort7 !== "", "Frage 7: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Auswertung
// -----------------------------------------------------------

const korrekt: Record<string, string> = {
  antwort1: "b",
  antwort2: "b",
  antwort3: "a",
  antwort4: "b",
  antwort5: "c",
  antwort6: "b",
  antwort7: "c",
};

const antworten: Record<string, string> = {
  antwort1,
  antwort2,
  antwort3,
  antwort4,
  antwort5,
  antwort6,
  antwort7,
};

let richtig = 0;
let gesamt = Object.keys(korrekt).length;

for (const [frage, erwartet] of Object.entries(korrekt)) {
  const gegeben = antworten[frage]?.toLowerCase().trim();
  if (gegeben === erwartet) {
    richtig++;
    console.log(`  Frage ${frage.replace("antwort", "")}: ✓ Richtig!`);
  } else if (gegeben === "") {
    console.log(`  Frage ${frage.replace("antwort", "")}: ⬜ Nicht beantwortet`);
  } else {
    console.log(`  Frage ${frage.replace("antwort", "")}: ✗ Falsch (deine Antwort: "${gegeben}", richtig: "${erwartet}")`);
  }
}

console.log(`\nErgebnis: ${richtig}/${gesamt} richtig`);

if (richtig === gesamt) {
  console.log("Perfekt! Du verstehst die tsconfig.json sehr gut!");
} else if (richtig >= 5) {
  console.log("Gut! Schau dir die Erklaerungen in der Loesung an.");
} else {
  console.log("Lies die README.md nochmal durch und versuche es erneut.");
}
