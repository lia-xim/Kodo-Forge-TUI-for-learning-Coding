// ============================================================
// Loesung 03: Compiler Output vorhersagen
// ============================================================
//
// Hier sind die richtigen Antworten mit ausfuehrlichen
// Erklaerungen.
//
// Ausfuehren mit: tsx solutions/03-compiler-output-vorhersagen.ts
// ============================================================

console.log("=== Loesung 03: Compiler Output vorhersagen ===\n");

// -----------------------------------------------------------
// Aufgabe 1: Was bleibt uebrig?
// -----------------------------------------------------------
// Richtige Antwort: b
//
// "interface Config wird entfernt, : Config wird entfernt, Rest bleibt"
//
// Erklaerung:
//   interface Config { ... }  --> KOMPLETT WEG (Type Erasure)
//   const server: Config = { ... }  --> const server = { ... }
//   console.log(server.host)  --> unveraendert (reines JavaScript)
//
// Das Objekt-Literal { host: "localhost", port: 3000 } ist JavaScript.
// Nur das Interface und die Typ-Annotation werden entfernt.
//
// Manche denken, das Objekt wird auch entfernt oder veraendert --
// aber Objekt-Literale sind JavaScript-Code, nicht TypeScript-Code!

let aufgabe1: string = "b";
console.log("Aufgabe 1: b -- Interface und Annotation weg, JS-Code bleibt");

// -----------------------------------------------------------
// Aufgabe 2: Enum vs. Interface
// -----------------------------------------------------------
// Richtige Antwort: c
//
// "Status-Enum und user-Objekt (Interface wird entfernt)"
//
// Erklaerung: Enums sind die AUSNAHME bei Type Erasure!
// TypeScript erzeugt fuer Enums echten JavaScript-Code:
//
//   var Status;
//   (function (Status) {
//     Status["Aktiv"] = "AKTIV";
//     Status["Inaktiv"] = "INAKTIV";
//   })(Status || (Status = {}));
//
// Das Interface User wird komplett entfernt.
// Das user-Objekt ist normales JavaScript.
//
// Deshalb existieren zur Laufzeit:
//   - Status (als JavaScript-Objekt)
//   - user (als JavaScript-Objekt)
//   - NICHT: User (das Interface)

let aufgabe2: string = "c";
console.log("Aufgabe 2: c -- Enum und Objekt bleiben, Interface verschwindet");

// -----------------------------------------------------------
// Aufgabe 3: Generics verschwinden
// -----------------------------------------------------------
// Richtige Antwort:
//   function identity(value) {
//       return value;
//   }
//   const result = identity("hello");
//
// Erklaerung: Generics sind ein reines Compile-Zeit-Feature.
// Im JavaScript-Output:
//   - <T> ist komplett weg
//   - (value: T) wird zu (value)
//   - : T wird entfernt
//   - identity<string>("hello") wird zu identity("hello")
//   - : string bei result wird entfernt
//
// Das ist ein perfektes Beispiel fuer Type Erasure:
// Die gesamte "Generics-Maschinerie" existiert nur im
// TypeScript-Compiler, nicht im JavaScript-Output.

let aufgabe3: string = 'function identity(value) {\n    return value;\n}\nconst result = identity("hello");';
console.log('Aufgabe 3: function identity(value) { return value; }');
console.log('           const result = identity("hello");');

// -----------------------------------------------------------
// Aufgabe 4: Was kann man NICHT zur Laufzeit tun?
// -----------------------------------------------------------
// Richtige Antwort: c
//
// Nur "c) someObj instanceof MyInterface" schlaegt fehl!
//
// Erklaerung:
//   a) typeof someVar === "string" --> Funktioniert!
//      typeof ist ein JavaScript-Operator, der zur Laufzeit arbeitet.
//
//   b) someObj instanceof MyClass --> Funktioniert!
//      Klassen existieren zur Laufzeit (sie sind JavaScript-Features).
//      instanceof prueft die Prototypen-Kette.
//
//   c) someObj instanceof MyInterface --> FEHLER!
//      Interfaces existieren NICHT zur Laufzeit. Der Code kompiliert
//      nicht einmal -- TypeScript meldet: "'MyInterface' only refers
//      to a type, but is being used as a value here."
//
//   d) "name" in someObj --> Funktioniert!
//      Der in-Operator prueft, ob ein Property existiert. Rein JavaScript.
//
//   e) Array.isArray(someVar) --> Funktioniert!
//      Array.isArray ist eine JavaScript-Methode.
//
// MERKE: typeof, instanceof (mit Klassen), in, Array.isArray -- alles JavaScript.
// Nur TypeScript-Konstrukte (Interfaces, Types, Generics) sind zur Laufzeit weg.

let aufgabe4: string = "c";
console.log("Aufgabe 4: c -- Nur instanceof mit Interfaces schlaegt fehl");

// -----------------------------------------------------------
// Aufgabe 5: target bestimmt den Output
// -----------------------------------------------------------
// Richtige Antwort: a
//
// "Alle 3 werden umgeschrieben (const->var, =>->function, ``->+)"
//
// Erklaerung: Mit target: ES5 muss TypeScript alle ES2015+ Features
// in ES5-kompatiblen Code umwandeln:
//
// Vorher (ES2015+):
//   const values = [1, 2, 3];
//   const doubled = values.map(v => v * 2);
//   const message = `Ergebnis: ${doubled}`;
//
// Nachher (ES5):
//   var values = [1, 2, 3];
//   var doubled = values.map(function (v) { return v * 2; });
//   var message = "Ergebnis: " + doubled;
//
// - const (ES2015) --> var (ES5)
// - Arrow Function (ES2015) --> function expression (ES5)
// - Template Literal (ES2015) --> String-Verkettung mit + (ES5)
//
// ABER: Array.map() wird NICHT umgeschrieben, weil es seit ES5
// existiert. target wirkt nur auf SYNTAX, nicht auf APIs!
// Wenn du APIs aus neueren JS-Versionen nutzt (z.B. Array.flat()),
// brauchst du ein Polyfill -- das ist NICHT TypeScripts Job.

let aufgabe5: string = "a";
console.log("Aufgabe 5: a -- Alle 3 ES2015-Features werden fuer ES5 umgeschrieben");

// -----------------------------------------------------------
// Aufgabe 6: Type Assertion vs. Laufzeit
// -----------------------------------------------------------
// Richtige Antwort: c
//
// "length ist 5, weil input bereits ein String ist. 'as string'
//  existiert zur Laufzeit nicht."
//
// Erklaerung:
//   const input: unknown = "hello";
//   const length = (input as string).length;
//
// Im JavaScript-Output:
//   const input = "hello";
//   const length = input.length;  // "as string" ist WEG!
//
// WICHTIG: "as string" ist KEINE Typkonvertierung! Es ist eine
// Anweisung an den Compiler: "Vertrau mir, das ist ein String."
// Zur Laufzeit passiert NICHTS. Der Wert wird nicht konvertiert.
//
// Das ist ein haeufiges Missverstaendnis:
//   const x = someValue as number;  // KONVERTIERT NICHT zu number!
//   const x = Number(someValue);    // DAS konvertiert zu number!
//
// Type Assertions (as) sind ein Versprechen an den Compiler.
// Wenn das Versprechen falsch ist, crasht der Code zur Laufzeit.

let aufgabe6: string = "c";
console.log("Aufgabe 6: c -- 'as string' ist zur Laufzeit unsichtbar");

// -----------------------------------------------------------
console.log("\n=== Zusammenfassung ===");
console.log("Die wichtigsten Erkenntnisse:");
console.log("  1. Interfaces, Type Aliases, Generics --> verschwinden");
console.log("  2. Enums, Klassen, Objekte --> bleiben (JavaScript-Code)");
console.log("  3. typeof, instanceof(Klasse), in --> funktionieren (JavaScript)");
console.log("  4. instanceof(Interface) --> kompiliert nicht einmal");
console.log("  5. target bestimmt Syntax-Umwandlung, nicht API-Polyfills");
console.log("  6. 'as Type' ist KEINE Konvertierung, nur ein Compiler-Hinweis");
