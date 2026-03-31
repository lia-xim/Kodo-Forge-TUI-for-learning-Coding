// ============================================================
// Uebung 03: Compiler Output vorhersagen
// ============================================================
//
// Diese Uebung testet, ob du wirklich verstehst, was der
// TypeScript-Compiler aus deinem Code macht. Fuer jeden
// Code-Block musst du vorhersagen, wie der JavaScript-Output
// aussieht.
//
// Das ist eine der wichtigsten Faehigkeiten: Du musst WISSEN,
// was zur Laufzeit existiert und was nicht.
//
// Ausfuehren mit: tsx exercises/03-compiler-output-vorhersagen.ts
// ============================================================

console.log("=== Uebung 03: Compiler Output vorhersagen ===\n");

// -----------------------------------------------------------
// Aufgabe 1: Was bleibt uebrig?
// -----------------------------------------------------------
//
// Gegeben:
//   interface Config {
//     host: string;
//     port: number;
//   }
//   const server: Config = { host: "localhost", port: 3000 };
//   console.log(server.host);
//
// Wie sieht der JavaScript-Output aus?
// a) "Identisch -- der Code aendert sich nicht"
// b) "interface Config wird entfernt, : Config wird entfernt, Rest bleibt"
// c) "interface wird zu einer Klasse, Rest bleibt"
// d) "Alles wird entfernt"

let aufgabe1: string = ""; // <-- Deine Antwort hier

console.assert(aufgabe1 !== "", "Aufgabe 1: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Aufgabe 2: Enum vs. Interface
// -----------------------------------------------------------
//
// Gegeben:
//   enum Status { Aktiv = "AKTIV", Inaktiv = "INAKTIV" }
//   interface User { name: string; status: Status; }
//   const user: User = { name: "Anna", status: Status.Aktiv };
//
// Was existiert davon zur Laufzeit?
// a) "Alles: Status-Enum, User-Interface und user-Objekt"
// b) "Nur das user-Objekt"
// c) "Status-Enum und user-Objekt (Interface wird entfernt)"
// d) "Nur das User-Interface und user-Objekt"

let aufgabe2: string = ""; // <-- Deine Antwort hier

console.assert(aufgabe2 !== "", "Aufgabe 2: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Aufgabe 3: Generics verschwinden
// -----------------------------------------------------------
//
// Gegeben:
//   function identity<T>(value: T): T {
//     return value;
//   }
//   const result: string = identity<string>("hello");
//
// Wie sieht der JavaScript-Output aus?
// Schreibe den EXAKTEN JavaScript-Code als String.
// Tipp: 2 Zeilen. Keine Typ-Annotationen, keine Generics.

// BEVOR du antwortest -- erklaere kurz:
// 1. Existieren Generics (<T>) zur Laufzeit? ___
// 2. Was passiert mit `: T` und `: string`? ___
// 3. Was passiert mit `identity<string>(...)`? ___

let aufgabe3: string = ""; // <-- Schreibe hier den erwarteten JS-Output

// Beispiel-Format (NICHT die Loesung!):
// let aufgabe3 = "function foo(x) { return x; }\nconst y = foo(42);";

console.assert(aufgabe3 !== "", "Aufgabe 3: Bitte den JS-Output eingeben!");

// -----------------------------------------------------------
// Aufgabe 4: Was kann man NICHT zur Laufzeit tun?
// -----------------------------------------------------------
//
// Welche dieser Operationen wird zur Laufzeit FEHLSCHLAGEN?
//
// a) typeof someVar === "string"
// b) someObj instanceof MyClass
// c) someObj instanceof MyInterface
// d) "name" in someObj
// e) Array.isArray(someVar)
//
// Mehrere Antworten moeglich! Schreibe alle Buchstaben, z.B. "ce"

// BEVOR du antwortest -- erklaere kurz:
// 1. Welche dieser Konstrukte sind JavaScript-Features? ___
// 2. Welche sind TypeScript-only Features? ___
// 3. Was passiert mit TypeScript-only Features nach der Kompilierung? ___

let aufgabe4: string = ""; // <-- Deine Antwort hier

console.assert(aufgabe4 !== "", "Aufgabe 4: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Aufgabe 5: target bestimmt den Output
// -----------------------------------------------------------
//
// Gegeben (target: ES5):
//   const values = [1, 2, 3];
//   const doubled = values.map(v => v * 2);
//   const message = `Ergebnis: ${doubled}`;
//
// Was passiert mit diesen 3 Features?
//   - const (ES2015)
//   - Arrow Function (ES2015)
//   - Template Literal (ES2015)
//
// Werden sie fuer ES5 umgeschrieben?
// a) "Alle 3 werden umgeschrieben (const->var, =>->function, ``->+)"
// b) "Nur const wird umgeschrieben"
// c) "Nur die Arrow Function wird umgeschrieben"
// d) "Keines wird umgeschrieben, ES5 unterstuetzt alles"

let aufgabe5: string = ""; // <-- Deine Antwort hier

console.assert(aufgabe5 !== "", "Aufgabe 5: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Aufgabe 6: Type Assertion vs. Laufzeit
// -----------------------------------------------------------
//
// Gegeben:
//   const input: unknown = "hello";
//   const length = (input as string).length;
//
// Was passiert zur Laufzeit?
// a) "Es gibt einen TypeError, weil unknown nicht .length hat"
// b) "length ist 5, weil 'as string' den Wert zu einem String konvertiert"
// c) "length ist 5, weil input bereits ein String ist. 'as string' existiert
//     zur Laufzeit nicht -- es ist eine reine Compiler-Anweisung"
// d) "Es gibt einen Compiler-Fehler"

let aufgabe6: string = ""; // <-- Deine Antwort hier

console.assert(aufgabe6 !== "", "Aufgabe 6: Bitte eine Antwort eingeben!");

// -----------------------------------------------------------
// Auswertung
// -----------------------------------------------------------

const korrekt: Record<string, string> = {
  aufgabe1: "b",
  aufgabe2: "c",
  aufgabe3: 'function identity(value) {\n    return value;\n}\nconst result = identity("hello");',
  aufgabe4: "c",
  aufgabe5: "a",
  aufgabe6: "c",
};

const antworten: Record<string, string> = {
  aufgabe1,
  aufgabe2,
  aufgabe3,
  aufgabe4,
  aufgabe5,
  aufgabe6,
};

let richtig = 0;
const gesamt = Object.keys(korrekt).length;

for (const [frage, erwartet] of Object.entries(korrekt)) {
  const gegeben = antworten[frage]?.trim();

  if (frage === "aufgabe3") {
    // Aufgabe 3: Freie Texteingabe -- pruefen ob Kernelemente stimmen
    const hatIdentity = gegeben.includes("function identity(value)");
    const hatReturn = gegeben.includes("return value");
    const hatResult = gegeben.includes('const result = identity("hello")') ||
                      gegeben.includes("const result = identity('hello')");
    if (hatIdentity && hatReturn && hatResult) {
      richtig++;
      console.log(`  Aufgabe 3: Richtig! Der JS-Output ist korrekt.`);
    } else if (gegeben === "") {
      console.log(`  Aufgabe 3: Nicht beantwortet`);
    } else {
      console.log(`  Aufgabe 3: Nicht ganz richtig.`);
      console.log(`    Erwartet: function identity(value) { return value; }`);
      console.log(`              const result = identity("hello");`);
      console.log(`    Dein Output: ${gegeben}`);
    }
  } else if (frage === "aufgabe4") {
    // Aufgabe 4: Sortiere die Buchstaben fuer den Vergleich
    const sortedGegeben = gegeben.toLowerCase().split("").sort().join("");
    if (sortedGegeben === "c") {
      richtig++;
      console.log(`  Aufgabe ${frage.replace("aufgabe", "")}: Richtig!`);
    } else if (gegeben === "") {
      console.log(`  Aufgabe ${frage.replace("aufgabe", "")}: Nicht beantwortet`);
    } else {
      console.log(`  Aufgabe ${frage.replace("aufgabe", "")}: Falsch (deine Antwort: "${gegeben}", richtig: "c")`);
      console.log(`    Nur "instanceof MyInterface" schlaegt fehl!`);
      console.log(`    typeof, instanceof mit Klassen, "in", Array.isArray -- all das ist JavaScript.`);
    }
  } else {
    const gegebenNorm = gegeben.toLowerCase().trim();
    if (gegebenNorm === erwartet) {
      richtig++;
      console.log(`  Aufgabe ${frage.replace("aufgabe", "")}: Richtig!`);
    } else if (gegebenNorm === "") {
      console.log(`  Aufgabe ${frage.replace("aufgabe", "")}: Nicht beantwortet`);
    } else {
      console.log(`  Aufgabe ${frage.replace("aufgabe", "")}: Falsch (deine Antwort: "${gegebenNorm}", richtig: "${erwartet}")`);
    }
  }
}

console.log(`\nErgebnis: ${richtig}/${gesamt} richtig`);

if (richtig === gesamt) {
  console.log("Ausgezeichnet! Du verstehst Type Erasure und den Compiler-Output wirklich.");
} else if (richtig >= 4) {
  console.log("Gut! Schau dir die Loesung fuer die fehlenden Aufgaben an.");
} else {
  console.log("Lies die README.md nochmal durch, besonders die Abschnitte zu Type Erasure und dem Compiler.");
}
