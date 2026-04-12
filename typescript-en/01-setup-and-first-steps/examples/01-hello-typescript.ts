// ============================================================
// Beispiel 01: Hallo TypeScript!
// ============================================================
//
// Dies ist deine erste TypeScript-Datei. Wir schauen uns an,
// was TypeScript anders macht als JavaScript -- und was gleich
// bleibt.
//
// Ausfuehren mit:  tsx examples/01-hello-typescript.ts
// Kompilieren mit: tsc examples/01-hello-typescript.ts
// ============================================================

// -----------------------------------------------------------
// 1. Variablen mit Typ-Annotationen
// -----------------------------------------------------------

// In JavaScript:
//   let name = "Max";
//   let age = 30;
//
// In TypeScript koennen wir explizit sagen, welchen Typ eine
// Variable hat:

let vorname: string = "Max";
let alter: number = 30;
let istStudent: boolean = true;

console.log(`${vorname} ist ${alter} Jahre alt.`);
console.log(`Student: ${istStudent}`);

// Was passiert, wenn wir den falschen Typ zuweisen?
// Entferne den Kommentar bei der naechsten Zeile und schau,
// was der Compiler sagt:

// vorname = 42;  // Fehler! Type 'number' is not assignable to type 'string'

// -----------------------------------------------------------
// 2. Funktionen mit Typ-Annotationen
// -----------------------------------------------------------

// In JavaScript:
//   function addiere(a, b) { return a + b; }
//
// Problem: Was passiert bei addiere("hello", "world")?
// JavaScript sagt: "helloworld". Kein Fehler!
//
// In TypeScript definieren wir die Typen der Parameter UND
// des Rueckgabewerts:

function addiere(a: number, b: number): number {
  return a + b;
}

console.log(`5 + 3 = ${addiere(5, 3)}`);

// Diese Aufrufe wuerden Compiler-Fehler erzeugen:
// addiere("hello", "world");  // Fehler! string statt number
// addiere(5);                 // Fehler! Zu wenig Argumente
// addiere(5, 3, 1);           // Fehler! Zu viele Argumente

// -----------------------------------------------------------
// 3. Objekte mit Typ-Definitionen
// -----------------------------------------------------------

// Wir koennen die Struktur eines Objekts beschreiben:

interface Person {
  vorname: string;
  nachname: string;
  alter: number;
  email?: string; // Das ? bedeutet: optional
}

// Dieses Objekt muss die Struktur von Person einhalten:
const max: Person = {
  vorname: "Max",
  nachname: "Mustermann",
  alter: 30,
  // email ist optional, also koennen wir es weglassen
};

// TypeScript prueft, dass wir nur auf existierende Properties
// zugreifen:
console.log(`${max.vorname} ${max.nachname}`);

// Das hier wuerde einen Fehler erzeugen:
// console.log(max.telefon);  // Fehler! Property 'telefon' does not exist

// -----------------------------------------------------------
// 4. Was nach der Kompilierung uebrig bleibt
// -----------------------------------------------------------

// Wenn du diese Datei mit `tsc` kompilierst, erzeugt er eine
// .js-Datei. In dieser Datei:
//
//   - Alle `: string`, `: number`, etc. sind WEG
//   - Das `interface Person` ist KOMPLETT verschwunden
//   - Das `?` bei `email?` ist WEG
//   - Nur der JavaScript-Code bleibt uebrig
//
// Probiere es aus:
//   tsc examples/01-hello-typescript.ts
//   cat examples/01-hello-typescript.js   (oder oeffne die Datei)

// -----------------------------------------------------------
// 5. Type Inference: TypeScript ist schlauer als du denkst
// -----------------------------------------------------------

// Du musst nicht IMMER Typen angeben. TypeScript kann viele
// Typen selbst erkennen:

let stadt = "Berlin"; // TypeScript weiss: das ist ein string
let einwohner = 3_748_148; // TypeScript weiss: das ist eine number
let hauptstadt = true; // TypeScript weiss: das ist ein boolean

// stadt = 42;  // Fehler! Auch ohne explizite Annotation weiss TS,
//              // dass 'stadt' ein string ist.

console.log(`${stadt}: ${einwohner} Einwohner (Hauptstadt: ${hauptstadt})`);

// Wann sollte man trotzdem explizite Typen schreiben?
// - Bei Funktions-Parametern (immer!)
// - Wenn der Typ nicht offensichtlich ist
// - Bei leeren Arrays: let items: string[] = [];
// - Bei Rueckgabewerten komplexer Funktionen

// -----------------------------------------------------------
// Fazit
// -----------------------------------------------------------
//
// TypeScript gibt dir Sicherheit:
// - Du siehst Fehler BEVOR du den Code ausfuehrst
// - Deine IDE kann dir bessere Vorschlaege machen
// - Andere Entwickler verstehen deinen Code schneller
//
// Aber: Zur Laufzeit ist alles normales JavaScript.
// TypeScript ist ein Werkzeug fuer den Entwickler, nicht fuer
// die Maschine.
//
// Weiter mit: 02-type-erasure.ts
