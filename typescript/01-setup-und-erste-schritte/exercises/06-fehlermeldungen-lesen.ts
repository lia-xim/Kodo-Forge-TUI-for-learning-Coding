// ============================================================
// Uebung 06: Fehlermeldungen lesen und verstehen
// ============================================================
//
// TypeScript-Fehlermeldungen sind dein bester Freund -- wenn du
// sie lesen kannst. In dieser Uebung uebst du genau das.
//
// Fuer jeden Code-Block:
//   1. Lies die Fehlermeldung die TypeScript dir zeigt
//      (hovere in VS Code ueber die rote Unterstreichung)
//   2. Erklaere in eigenen Worten, was der Fehler bedeutet
//   3. Fixe den Code
//
// WICHTIG: Oeffne diese Datei in VS Code und schau dir die
// echten Fehlermeldungen an, BEVOR du fixst!
//
// Ausfuehren mit: tsx exercises/06-fehlermeldungen-lesen.ts
// (Wird erst funktionieren, wenn alle Fehler gefixt sind!)
// ============================================================

console.log("=== Uebung 06: Fehlermeldungen lesen ===\n");

// -----------------------------------------------------------
// Fehler 1: Type Assignment
// -----------------------------------------------------------
//
// SCHRITT 1: Hovere in VS Code ueber die rote Unterstreichung.
// SCHRITT 2: Lies die Fehlermeldung und erklaere sie:
//
// FEHLERMELDUNG: ___
// DEINE ERKLAERUNG: ___
//
// SCHRITT 3: Fixe den Code.

// @ts-expect-error -- Entferne diese Zeile und fixe den Fehler
const alter: number = "dreissig";

console.assert(typeof alter === "number", "alter sollte eine number sein");
console.log("  Fehler 1: gefixt!");

// -----------------------------------------------------------
// Fehler 2: Property Access
// -----------------------------------------------------------
//
// SCHRITT 1: Hovere in VS Code ueber die rote Unterstreichung.
// SCHRITT 2: Lies die Fehlermeldung und erklaere sie:
//
// FEHLERMELDUNG: ___
// DEINE ERKLAERUNG: ___
//
// SCHRITT 3: Fixe den Code (aendere den Property-Zugriff, nicht das Interface).

interface Produkt {
  name: string;
  preis: number;
  aufLager: boolean;
}

const laptop: Produkt = { name: "ThinkPad", preis: 1299, aufLager: true };

// @ts-expect-error -- Entferne diese Zeile und fixe den Fehler
const istVerfuegbar = laptop.verfuegbar;

console.assert(typeof istVerfuegbar === "boolean", "istVerfuegbar sollte ein boolean sein");
console.log("  Fehler 2: gefixt!");

// -----------------------------------------------------------
// Fehler 3: Funktionsaufruf mit falschen Argumenten
// -----------------------------------------------------------
//
// SCHRITT 1: Hovere in VS Code ueber die rote Unterstreichung.
// SCHRITT 2: Lies die Fehlermeldung und erklaere sie:
//
// FEHLERMELDUNG: ___
// DEINE ERKLAERUNG: ___
//
// SCHRITT 3: Fixe den Funktionsaufruf (nicht die Funktion!).

function erstelleNachricht(empfaenger: string, betreff: string, text: string): string {
  return `An: ${empfaenger}\nBetreff: ${betreff}\n\n${text}`;
}

// @ts-expect-error -- Entferne diese Zeile und fixe den Fehler
const nachricht = erstelleNachricht("Anna", "Hallo");

console.assert(nachricht.includes("Anna"), "Nachricht sollte Empfaenger enthalten");
console.assert(nachricht.includes("Hallo"), "Nachricht sollte Betreff enthalten");
console.log("  Fehler 3: gefixt!");

// -----------------------------------------------------------
// Fehler 4: Union Type ohne Narrowing
// -----------------------------------------------------------
//
// SCHRITT 1: Hovere in VS Code ueber die rote Unterstreichung.
// SCHRITT 2: Lies die Fehlermeldung und erklaere sie:
//
// FEHLERMELDUNG: ___
// DEINE ERKLAERUNG: ___
//
// SCHRITT 3: Fuege eine Typ-Pruefung hinzu, sodass TypeScript
// weiss, dass `wert` ein String ist, BEVOR du .toUpperCase() aufrufst.

function verarbeite(wert: string | number): string {
  // @ts-expect-error -- Entferne diese Zeile und fixe den Code
  return wert.toUpperCase();
}

console.assert(verarbeite("hallo") === "HALLO", "Strings sollten gross werden");
console.assert(verarbeite(42) === "42", "Numbers sollten als String zurueckgegeben werden");
console.log("  Fehler 4: gefixt!");

// -----------------------------------------------------------
// Fehler 5: Objekt mit fehlenden Properties
// -----------------------------------------------------------
//
// SCHRITT 1: Hovere in VS Code ueber die rote Unterstreichung.
// SCHRITT 2: Lies die Fehlermeldung und erklaere sie:
//
// FEHLERMELDUNG: ___
// DEINE ERKLAERUNG: ___
//
// SCHRITT 3: Ergaenze die fehlenden Properties im Objekt.

interface Mitarbeiter {
  vorname: string;
  nachname: string;
  abteilung: string;
  gehalt: number;
  aktiv: boolean;
}

// @ts-expect-error -- Entferne diese Zeile und fixe den Fehler
const neuerMitarbeiter: Mitarbeiter = {
  vorname: "Max",
  nachname: "Mustermann",
};

console.assert(neuerMitarbeiter.vorname === "Max", "vorname sollte Max sein");
console.assert(typeof neuerMitarbeiter.gehalt === "number", "gehalt sollte eine number sein");
console.assert(typeof neuerMitarbeiter.aktiv === "boolean", "aktiv sollte ein boolean sein");
console.log("  Fehler 5: gefixt!");

// -----------------------------------------------------------
// Fehler 6: Return Type Mismatch
// -----------------------------------------------------------
//
// SCHRITT 1: Hovere in VS Code ueber die rote Unterstreichung.
// SCHRITT 2: Lies die Fehlermeldung und erklaere sie:
//
// FEHLERMELDUNG: ___
// DEINE ERKLAERUNG: ___
//
// SCHRITT 3: Fixe die Funktion, sodass sie IMMER einen string zurueckgibt.

// @ts-expect-error -- Entferne diese Zeile und fixe die Funktion
function formatiereBetrag(betrag: number): string {
  if (betrag < 0) {
    return betrag;  // <-- Was stimmt hier nicht?
  }
  return `${betrag.toFixed(2)} EUR`;
}

console.assert(formatiereBetrag(42.5) === "42.50 EUR", "Positiver Betrag");
console.assert(formatiereBetrag(-10) === "-10.00 EUR", "Negativer Betrag");
console.log("  Fehler 6: gefixt!");

// -----------------------------------------------------------
// Auswertung
// -----------------------------------------------------------
console.log("\n=== Alle Fehler gefixt! ===");
console.log("\nWas du gelernt hast:");
console.log("  1. 'Type X is not assignable to type Y' -> Falscher Typ bei Zuweisung");
console.log("  2. 'Property X does not exist on type Y' -> Tippfehler oder falsches Property");
console.log("  3. 'Expected N arguments, but got M' -> Falsche Anzahl an Argumenten");
console.log("  4. 'Property X does not exist on type Y | Z' -> Narrowing fehlt");
console.log("  5. 'Property X is missing in type Y' -> Objekt unvollstaendig");
console.log("  6. 'Type X is not assignable to return type Y' -> Falscher Rueckgabetyp");
