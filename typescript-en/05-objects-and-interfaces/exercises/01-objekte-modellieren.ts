export {};

/**
 * Lektion 05 - Exercise 01: Objekte modellieren
 *
 * 10 Aufgaben zum Thema Objects & Interfaces.
 * Ersetze jedes TODO durch deine Loesung.
 * Die console.assert()-Checks am Ende pruefen deine Loesungen.
 *
 * Ausfuehren: npx tsx exercises/01-objekte-modellieren.ts
 */

// ─── Aufgabe 1: Erstelle einen Objekttyp fuer eine Person ─────────────────
//
// Erstelle ein Interface 'Person' mit:
// - name: string
// - alter: number
// - email: string
//
// Erstelle dann ein Objekt 'person1' vom Typ Person.

// TODO: Interface Person erstellen

// TODO: Objekt person1 erstellen (name: "Max", alter: 28, email: "max@test.de")

// ─── Aufgabe 2: Optionale Properties ──────────────────────────────────────
//
// Erstelle ein Interface 'Produkt' mit:
// - name: string
// - preis: number
// - beschreibung?: string  (optional)
// - rabatt?: number         (optional)
//
// Erstelle zwei Objekte: eines MIT und eines OHNE optionale Properties.

// TODO: Interface Produkt erstellen

// TODO: Objekt produkt1 MIT beschreibung und rabatt erstellen
// (name: "Laptop", preis: 999, beschreibung: "Gaming Laptop", rabatt: 10)

// TODO: Objekt produkt2 OHNE optionale Properties erstellen
// (name: "Maus", preis: 29.99)

// ─── Aufgabe 3: Readonly Properties ───────────────────────────────────────
//
// Erstelle ein Interface 'Bestellung' mit:
// - readonly bestellNr: string     (unveraenderlich)
// - readonly datum: Date           (unveraenderlich)
// - status: string                 (aenderbar)
// - betrag: number                 (aenderbar)
//
// Erstelle ein Objekt und aendere den Status.

// TODO: Interface Bestellung erstellen

// TODO: Objekt bestellung1 erstellen
// (bestellNr: "B-001", datum: new Date("2025-01-15"), status: "offen", betrag: 150)

// TODO: Aendere den status auf "versendet"

// ─── Aufgabe 4: Verschachtelte Objekttypen ────────────────────────────────
//
// Erstelle Interfaces fuer:
// - Adresse: strasse, hausnummer, plz, stadt
// - Kontakt: telefon (optional), email
// - Mitarbeiter: name, position, adresse (vom Typ Adresse), kontakt (vom Typ Kontakt)
//
// Erstelle ein Mitarbeiter-Objekt.

// TODO: Interface Adresse erstellen

// TODO: Interface Kontakt erstellen

// TODO: Interface Mitarbeiter erstellen

// TODO: Objekt mitarbeiter1 erstellen
// Name: "Anna Schmidt", Position: "Entwicklerin"
// Adresse: Berliner Str. 42, 10115 Berlin
// Kontakt: email "anna@firma.de", kein Telefon

// ─── Aufgabe 5: Interface erweitern ──────────────────────────────────────
//
// Erstelle:
// 1. Interface 'Basisprodukt' mit: id (number), name (string), preis (number)
// 2. Interface 'DigitalesProdukt' das Basisprodukt erweitert und hinzufuegt:
//    downloadUrl (string), dateigroesse (number)
// 3. Interface 'PhysischesProdukt' das Basisprodukt erweitert und hinzufuegt:
//    gewicht (number), versandkosten (number)
//
// Erstelle je ein Objekt.

// TODO: Interface Basisprodukt erstellen

// TODO: Interface DigitalesProdukt erstellen (extends Basisprodukt)

// TODO: Interface PhysischesProdukt erstellen (extends Basisprodukt)

// TODO: Objekt ebook erstellen
// (id: 1, name: "TypeScript Guide", preis: 19.99, downloadUrl: "https://...", dateigroesse: 5000)

// TODO: Objekt buch erstellen
// (id: 2, name: "TypeScript Buch", preis: 39.99, gewicht: 0.5, versandkosten: 4.99)

// ─── Aufgabe 6: Excess Property Errors beheben ──────────────────────────
//
// Die folgenden Zuweisungen wuerden Excess Property Errors verursachen.
// Behebe die Fehler auf drei verschiedene Arten (eine pro Zuweisung).

interface Farbe {
  rot: number;
  gruen: number;
  blau: number;
}

// Methode 1: Weise ueber eine Zwischenvariable zu
// TODO: Erstelle eine Variable mit { rot: 255, gruen: 128, blau: 0, alpha: 0.5 }
//       und weise sie dann einem Objekt vom Typ 'Farbe' zu

// Methode 2: Erweitere das Interface
// TODO: Erstelle ein Interface 'FarbeMitAlpha' das Farbe erweitert und alpha: number hat
//       und erstelle ein Objekt davon

// Methode 3: Type Assertion
// TODO: Erstelle ein Objekt { rot: 255, gruen: 128, blau: 0, alpha: 0.5 } as Farbe

// ─── Aufgabe 7: Funktion mit Objekt-Parameter ──────────────────────────
//
// Schreibe eine Funktion 'berechneSumme' die ein Objekt mit
// 'posten' (Array von { name: string, betrag: number }) entgegennimmt
// und die Gesamtsumme zurueckgibt.

interface Rechnung {
  posten: { name: string; betrag: number }[];
}

// TODO: Funktion berechneSumme implementieren

// ─── Aufgabe 8: Index Signatures ─────────────────────────────────────────
//
// Erstelle ein Interface 'Notenbuch' mit:
// - schueler: string (feste Property)
// - [fach: string]: string | number (Index Signature fuer dynamische Faecher)
//
// Erstelle ein Objekt mit dem Schueler "Max" und Noten fuer Mathe (2), Deutsch (1), Englisch (3)

// TODO: Interface Notenbuch erstellen

// TODO: Objekt notenbuch erstellen

// ─── Aufgabe 9: Readonly Interface ───────────────────────────────────────
//
// Erstelle ein Interface 'KonfigDatei' mit ALLEN Properties als readonly:
// - datenbankUrl: string
// - port: number
// - debug: boolean
// - maxVerbindungen: number
//
// Verwende Readonly<T> um es kompakt zu machen.

// TODO: Erstelle den Basis-Typ (ohne readonly)

// TODO: Erstelle einen Readonly-Typ daraus mit Readonly<T>

// TODO: Erstelle ein Objekt vom readonly Typ

// ─── Aufgabe 10: Reales Modell -- Warenkorb ─────────────────────────────
//
// Modelliere einen Warenkorb mit folgender Struktur:
// - WarenkorbArtikel: id (readonly), name, preis, menge, bild? (optional)
// - Warenkorb: readonly erstelltAm, artikel (Array von WarenkorbArtikel),
//              gutscheinCode? (optional)
//
// Schreibe eine Funktion 'berechneWarenkorbSumme' die den Gesamtpreis berechnet.

// TODO: Interface WarenkorbArtikel erstellen

// TODO: Interface Warenkorb erstellen

// TODO: Objekt warenkorb erstellen mit mindestens 2 Artikeln

// TODO: Funktion berechneWarenkorbSumme implementieren

// ════════════════════════════════════════════════════════════════════════════
// Tests -- aendere nichts unter dieser Zeile!
// ════════════════════════════════════════════════════════════════════════════

// Entkommentiere die folgenden Tests, nachdem du die Aufgaben geloest hast:

/*
// Test 1: Person
console.assert(person1.name === "Max", "Aufgabe 1: name sollte 'Max' sein");
console.assert(person1.alter === 28, "Aufgabe 1: alter sollte 28 sein");
console.assert(person1.email === "max@test.de", "Aufgabe 1: email sollte 'max@test.de' sein");

// Test 2: Produkt
console.assert(produkt1.beschreibung === "Gaming Laptop", "Aufgabe 2: beschreibung sollte vorhanden sein");
console.assert(produkt2.beschreibung === undefined, "Aufgabe 2: beschreibung sollte undefined sein");

// Test 3: Bestellung
console.assert(bestellung1.status === "versendet", "Aufgabe 3: status sollte 'versendet' sein");
console.assert(bestellung1.bestellNr === "B-001", "Aufgabe 3: bestellNr sollte 'B-001' sein");

// Test 4: Mitarbeiter
console.assert(mitarbeiter1.adresse.stadt === "Berlin", "Aufgabe 4: Stadt sollte 'Berlin' sein");
console.assert(mitarbeiter1.kontakt.telefon === undefined, "Aufgabe 4: telefon sollte undefined sein");

// Test 5: Vererbung
console.assert("downloadUrl" in ebook, "Aufgabe 5: ebook sollte downloadUrl haben");
console.assert("gewicht" in buch, "Aufgabe 5: buch sollte gewicht haben");
console.assert(ebook.preis === 19.99, "Aufgabe 5: ebook Preis sollte 19.99 sein");

// Test 7: Rechnung
const testRechnung: Rechnung = {
  posten: [
    { name: "Posten A", betrag: 100 },
    { name: "Posten B", betrag: 50 },
    { name: "Posten C", betrag: 25 },
  ],
};
console.assert(berechneSumme(testRechnung) === 175, "Aufgabe 7: Summe sollte 175 sein");

// Test 10: Warenkorb
console.assert(typeof berechneWarenkorbSumme === "function", "Aufgabe 10: Funktion sollte existieren");

console.log("\n✓ Alle Tests bestanden! Gut gemacht!");
*/

console.log("\nEntkommentiere die Tests am Ende der Datei, wenn du alle Aufgaben geloest hast.");
