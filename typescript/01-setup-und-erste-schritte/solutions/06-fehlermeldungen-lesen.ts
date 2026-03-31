// ============================================================
// Loesung 06: Fehlermeldungen lesen und verstehen
// ============================================================
//
// Hier sind die Loesungen mit den echten Fehlermeldungen und
// ausfuehrlichen Erklaerungen. Das Ziel ist nicht nur der Fix,
// sondern dass du die MUSTER in TypeScript-Fehlermeldungen
// erkennst.
//
// Ausfuehren mit: tsx solutions/06-fehlermeldungen-lesen.ts
// ============================================================

console.log("=== Loesung 06: Fehlermeldungen lesen ===\n");

// -----------------------------------------------------------
// Fehler 1: Type Assignment
// -----------------------------------------------------------
//
// FEHLERMELDUNG:
//   Type 'string' is not assignable to type 'number'.
//
// ERKLAERUNG:
//   Du hast gesagt, `alter` soll eine number sein (: number),
//   aber du weist ihm "dreissig" zu -- das ist ein string.
//   TypeScript sagt: "Das passt nicht zusammen."
//
// MUSTER: "Type X is not assignable to type Y"
//   --> Du versuchst, einen Wert vom Typ X in eine Variable
//       vom Typ Y zu stecken. Die Typen sind inkompatibel.

// FIX: Den Wert als Zahl schreiben
const alter: number = 30;

console.assert(typeof alter === "number", "alter sollte eine number sein");
console.log("  Fehler 1: gefixt! (Typ X is not assignable to type Y)");

// -----------------------------------------------------------
// Fehler 2: Property Access
// -----------------------------------------------------------
//
// FEHLERMELDUNG:
//   Property 'verfuegbar' does not exist on type 'Produkt'.
//
// ERKLAERUNG:
//   Das Interface `Produkt` hat kein Property namens `verfuegbar`.
//   Es hat `aufLager`. TypeScript kennt die exakte Form des
//   Objekts und weiss, dass `verfuegbar` nicht existiert.
//
// MUSTER: "Property X does not exist on type Y"
//   --> Entweder hast du dich vertippt, oder du nutzt ein Property
//       das im Typ nicht definiert ist. Pruefe die Typ-Definition!

interface Produkt {
  name: string;
  preis: number;
  aufLager: boolean;
}

const laptop: Produkt = { name: "ThinkPad", preis: 1299, aufLager: true };

// FIX: Das richtige Property nutzen
const istVerfuegbar = laptop.aufLager;

console.assert(typeof istVerfuegbar === "boolean", "istVerfuegbar sollte ein boolean sein");
console.log("  Fehler 2: gefixt! (Property X does not exist on type Y)");

// -----------------------------------------------------------
// Fehler 3: Funktionsaufruf mit falschen Argumenten
// -----------------------------------------------------------
//
// FEHLERMELDUNG:
//   Expected 3 arguments, but got 2.
//
// ERKLAERUNG:
//   Die Funktion `erstelleNachricht` erwartet 3 Parameter:
//   empfaenger, betreff, und text. Du hast nur 2 uebergeben.
//   TypeScript zaehlt die Argumente und meldet den Unterschied.
//
// MUSTER: "Expected N arguments, but got M"
//   --> Du rufst die Funktion mit der falschen Anzahl Argumente auf.
//       Pruefe die Funktionssignatur!

function erstelleNachricht(empfaenger: string, betreff: string, text: string): string {
  return `An: ${empfaenger}\nBetreff: ${betreff}\n\n${text}`;
}

// FIX: Drittes Argument hinzufuegen
const nachricht = erstelleNachricht("Anna", "Hallo", "Wie geht es dir?");

console.assert(nachricht.includes("Anna"), "Nachricht sollte Empfaenger enthalten");
console.assert(nachricht.includes("Hallo"), "Nachricht sollte Betreff enthalten");
console.log("  Fehler 3: gefixt! (Expected N arguments, but got M)");

// -----------------------------------------------------------
// Fehler 4: Union Type ohne Narrowing
// -----------------------------------------------------------
//
// FEHLERMELDUNG:
//   Property 'toUpperCase' does not exist on type 'string | number'.
//   Property 'toUpperCase' does not exist on type 'number'.
//
// ERKLAERUNG:
//   `wert` ist `string | number` -- es KOENNTE eine Zahl sein.
//   Zahlen haben keine `.toUpperCase()`-Methode. TypeScript sagt:
//   "Ich kann nicht garantieren, dass das funktioniert."
//
//   Du musst TypeScript BEWEISEN, dass es ein String ist,
//   bevor du String-Methoden aufrufen darfst. Das nennt man
//   "Type Narrowing".
//
// MUSTER: "Property X does not exist on type A | B"
//   --> Du musst den Typ eingrenzen (narrowen), bevor du
//       typ-spezifische Methoden aufrufen kannst.

function verarbeite(wert: string | number): string {
  // FIX: Type Narrowing mit typeof
  if (typeof wert === "string") {
    return wert.toUpperCase();  // TypeScript weiss: hier ist es ein string
  }
  return String(wert);  // TypeScript weiss: hier ist es eine number
}

// Alternative Loesung mit ternary:
// function verarbeite(wert: string | number): string {
//   return typeof wert === "string" ? wert.toUpperCase() : String(wert);
// }

console.assert(verarbeite("hallo") === "HALLO", "Strings sollten gross werden");
console.assert(verarbeite(42) === "42", "Numbers sollten als String zurueckgegeben werden");
console.log("  Fehler 4: gefixt! (Narrowing mit typeof)");

// -----------------------------------------------------------
// Fehler 5: Objekt mit fehlenden Properties
// -----------------------------------------------------------
//
// FEHLERMELDUNG:
//   Type '{ vorname: string; nachname: string; }' is missing
//   the following properties from type 'Mitarbeiter':
//   abteilung, gehalt, aktiv
//
// ERKLAERUNG:
//   Das Interface `Mitarbeiter` hat 5 Properties, aber du hast
//   nur 2 davon gesetzt. TypeScript listet dir sogar auf,
//   WELCHE Properties fehlen. Das ist extrem hilfreich!
//
// MUSTER: "Type X is missing the following properties from type Y: a, b, c"
//   --> Dein Objekt ist unvollstaendig. Ergaenze die fehlenden Properties.

interface Mitarbeiter {
  vorname: string;
  nachname: string;
  abteilung: string;
  gehalt: number;
  aktiv: boolean;
}

// FIX: Alle fehlenden Properties ergaenzen
const neuerMitarbeiter: Mitarbeiter = {
  vorname: "Max",
  nachname: "Mustermann",
  abteilung: "Entwicklung",  // war fehlend
  gehalt: 55000,             // war fehlend
  aktiv: true,               // war fehlend
};

console.assert(neuerMitarbeiter.vorname === "Max", "vorname sollte Max sein");
console.assert(typeof neuerMitarbeiter.gehalt === "number", "gehalt sollte eine number sein");
console.assert(typeof neuerMitarbeiter.aktiv === "boolean", "aktiv sollte ein boolean sein");
console.log("  Fehler 5: gefixt! (Missing properties from type)");

// -----------------------------------------------------------
// Fehler 6: Return Type Mismatch
// -----------------------------------------------------------
//
// FEHLERMELDUNG:
//   Type 'number' is not assignable to type 'string'.
//
// ERKLAERUNG:
//   Die Funktion sagt, sie gibt einen `string` zurueck (: string).
//   Aber im if-Block gibst du `betrag` direkt zurueck -- und das
//   ist eine `number`. TypeScript erkennt, dass ein Code-Pfad
//   den falschen Typ zurueckgibt.
//
// MUSTER: Return-Typ stimmt nicht mit tatsaechlichem Rueckgabewert ueberein
//   --> Pruefe ALLE Code-Pfade (if/else, switch) auf den richtigen Typ.

function formatiereBetrag(betrag: number): string {
  if (betrag < 0) {
    // FIX: Auch negative Betraege als formatierten String zurueckgeben
    return `${betrag.toFixed(2)} EUR`;
  }
  return `${betrag.toFixed(2)} EUR`;
}

// Elegantere Loesung: Das if komplett entfernen!
// function formatiereBetrag(betrag: number): string {
//   return `${betrag.toFixed(2)} EUR`;
// }
// toFixed funktioniert auch mit negativen Zahlen.

console.assert(formatiereBetrag(42.5) === "42.50 EUR", "Positiver Betrag");
console.assert(formatiereBetrag(-10) === "-10.00 EUR", "Negativer Betrag");
console.log("  Fehler 6: gefixt! (Return type mismatch)");

// -----------------------------------------------------------
console.log("\n=== Zusammenfassung: Die 6 wichtigsten Fehlermuster ===");
console.log("");
console.log("  MUSTER 1: 'Type X is not assignable to type Y'");
console.log("    --> Falscher Typ bei Zuweisung. Pruefe Wert und Typ-Annotation.");
console.log("");
console.log("  MUSTER 2: 'Property X does not exist on type Y'");
console.log("    --> Tippfehler oder falsches Property. Pruefe die Typ-Definition.");
console.log("");
console.log("  MUSTER 3: 'Expected N arguments, but got M'");
console.log("    --> Falsche Anzahl Argumente. Pruefe die Funktionssignatur.");
console.log("");
console.log("  MUSTER 4: 'Property X does not exist on type A | B'");
console.log("    --> Union Type braucht Narrowing (typeof, in, instanceof).");
console.log("");
console.log("  MUSTER 5: 'Type X is missing properties from type Y'");
console.log("    --> Objekt unvollstaendig. Ergaenze die fehlenden Properties.");
console.log("");
console.log("  MUSTER 6: Return Type stimmt nicht ueberein");
console.log("    --> Pruefe ALLE Code-Pfade auf den richtigen Rueckgabetyp.");
console.log("");
console.log("  TIPP: TypeScript-Fehlermeldungen IMMER von hinten lesen!");
console.log("  Der wichtigste Teil steht oft am Ende der Meldung.");
