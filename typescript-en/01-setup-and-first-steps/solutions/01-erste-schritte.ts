// ============================================================
// Loesung 01: Erste Schritte mit TypeScript
// ============================================================
//
// Hier sind die Loesungen mit ausfuehrlichen Erklaerungen.
//
// Ausfuehren mit: tsx solutions/01-erste-schritte.ts
// ============================================================

console.log("=== Loesung 01: Erste Schritte ===\n");

// -----------------------------------------------------------
// Aufgabe 1: Variable mit Typ-Annotation deklarieren
// -----------------------------------------------------------
//
// Erklaerung: Mit `: Typ` nach dem Variablennamen sagst du
// TypeScript explizit, welchen Typ die Variable hat.
// Das ist eine "Typ-Annotation".

let lieblingszahl: number = 42;
let begruessung: string = "Hallo TypeScript";

// Hinweis: TypeScript haette die Typen auch selbst erkannt
// (Type Inference). Das hier wuerde genauso funktionieren:
//   let lieblingszahl = 42;        // TypeScript weiss: number
//   let begruessung = "Hallo TS";  // TypeScript weiss: string
//
// Aber explizite Annotationen sind gute Praxis, besonders
// wenn man TypeScript lernt, weil sie die Absicht klar machen.

console.assert(lieblingszahl === 42, "lieblingszahl sollte 42 sein");
console.assert(begruessung === "Hallo TypeScript", "begruessung sollte 'Hallo TypeScript' sein");
console.assert(typeof lieblingszahl === "number", "lieblingszahl sollte eine number sein");
console.assert(typeof begruessung === "string", "begruessung sollte ein string sein");
console.log("Aufgabe 1: OK ✓");

// -----------------------------------------------------------
// Aufgabe 2: Typ-Fehler beheben
// -----------------------------------------------------------
//
// Erklaerung: Der Fehler war, dass "fuenfundzwanzig" ein
// string ist, aber die Funktion eine number erwartet.
// Die Loesung ist, die Zahl 25 statt des Strings zu uebergeben.

function beschreibePerson(name: string, alter: number): string {
  return `${name} ist ${alter} Jahre alt.`;
}

// Vorher:  beschreibePerson("Anna", "fuenfundzwanzig")  -- FEHLER!
// Nachher: beschreibePerson("Anna", 25)                 -- OK!
const beschreibung = beschreibePerson("Anna", 25);

// Warum ist das wichtig? In JavaScript haette der String
// "fuenfundzwanzig" keinen Fehler erzeugt, aber das Ergebnis
// waere "Anna ist fuenfundzwanzig Jahre alt." gewesen -- was
// vielleicht ok aussieht, aber wenn man spaeter rechnet
// (alter + 10), bekommt man NaN. TypeScript findet solche
// Fehler BEVOR sie Probleme machen.

console.assert(beschreibung === "Anna ist 25 Jahre alt.", `Erwartet: "Anna ist 25 Jahre alt."`);
console.log("Aufgabe 2: OK ✓");

// -----------------------------------------------------------
// Aufgabe 3: Getypte Funktion erstellen
// -----------------------------------------------------------
//
// Erklaerung: Eine vollstaendig getypte Funktion hat:
//   - Typ-Annotationen fuer alle Parameter
//   - Eine Typ-Annotation fuer den Rueckgabewert
//
// Das Schema ist:
//   function name(param1: Typ1, param2: Typ2): RueckgabeTyp { ... }

function berechneFlaeche(breite: number, hoehe: number): number {
  return breite * hoehe;
}

// Der Rueckgabetyp `: number` ist hier streng genommen nicht
// noetig, weil TypeScript ihn aus `breite * hoehe` ableiten kann.
// Aber es ist gute Praxis, ihn bei oeffentlichen Funktionen
// explizit anzugeben, weil:
//   1. Es dokumentiert die Absicht
//   2. Es schuetzt vor versehentlichen Aenderungen
//   3. Es macht die Fehlermeldungen klarer

console.assert(berechneFlaeche(5, 3) === 15, "5 * 3 sollte 15 sein");
console.assert(berechneFlaeche(10, 10) === 100, "10 * 10 sollte 100 sein");
console.assert(berechneFlaeche(0, 5) === 0, "0 * 5 sollte 0 sein");
console.log("Aufgabe 3: OK ✓");

// -----------------------------------------------------------
// Aufgabe 4: Rueckgabetyp annotieren
// -----------------------------------------------------------
//
// Erklaerung: Das Problem war:
//   1. Kein expliziter Rueckgabetyp
//   2. Bei leerem Array: 0 / 0 = NaN (Not a Number)
//
// Die Loesung behandelt den Sonderfall "leeres Array" und
// gibt einen expliziten Rueckgabetyp an.

function berechneDurchschnitt(zahlen: number[]): number {
  if (zahlen.length === 0) {
    return 0; // Sonderfall: leeres Array
  }
  const summe = zahlen.reduce((acc, val) => acc + val, 0);
  return summe / zahlen.length;
}

// Warum ist die Pruefung auf leeres Array wichtig?
// In JavaScript ist 0 / 0 = NaN. NaN ist technisch gesehen
// eine number (typeof NaN === "number"), aber es ist kein
// nuetzlicher Wert. Der Rueckgabetyp `: number` haette NaN
// nicht verhindert -- TypeScript weiss nicht, dass
// zahlen.length 0 sein koennte. Darum muessen WIR das pruefen.
//
// Das zeigt eine wichtige Lektion: TypeScript prueft Typen,
// aber nicht die LOGIK deines Codes!

console.assert(berechneDurchschnitt([10, 20, 30]) === 20, "Durchschnitt von [10,20,30] sollte 20 sein");
console.assert(berechneDurchschnitt([5]) === 5, "Durchschnitt von [5] sollte 5 sein");
console.assert(berechneDurchschnitt([]) === 0, "Durchschnitt von [] sollte 0 sein");
console.log("Aufgabe 4: OK ✓");

// -----------------------------------------------------------
// Aufgabe 5: Objekt mit getypter Struktur erstellen
// -----------------------------------------------------------
//
// Erklaerung: Ein Interface beschreibt die FORM eines Objekts.
// Es legt fest, welche Properties existieren muessen und
// welchen Typ jedes Property hat.

interface Buch {
  titel: string;
  autor: string;
  seiten: number;
  gelesen: boolean;
}

const meinBuch: Buch = {
  titel: "Der TypeScript-Meister",
  autor: "Max Mustermann",
  seiten: 350,
  gelesen: false,
};

// Wichtige Punkte:
// - Das Interface erzeugt KEINEN JavaScript-Code (Type Erasure)
// - Es existiert NUR zur Compile-Zeit
// - Du kannst kein `new Buch()` machen -- es ist kein Konstruktor
// - Aber es schuetzt dich vor Tippfehlern und fehlenden Properties
//
// Wenn du z.B. `seten` statt `seiten` schreibst, meldet
// TypeScript sofort einen Fehler. In JavaScript wuerdest du
// den Fehler erst bemerken, wenn etwas nicht funktioniert.

console.assert(typeof meinBuch.titel === "string", "titel sollte ein string sein");
console.assert(typeof meinBuch.autor === "string", "autor sollte ein string sein");
console.assert(typeof meinBuch.seiten === "number", "seiten sollte eine number sein");
console.assert(typeof meinBuch.gelesen === "boolean", "gelesen sollte ein boolean sein");
console.log("Aufgabe 5: OK ✓");

// -----------------------------------------------------------
console.log("\n=== Alle Aufgaben bestanden! ===");
