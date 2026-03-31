export {};

/**
 * Lektion 05 - Loesung 01: Objekte modellieren
 *
 * Vollstaendige Loesungen mit ausfuehrlichen Erklaerungen.
 *
 * Ausfuehren: npx tsx solutions/01-objekte-modellieren.ts
 */

// ─── Aufgabe 1: Erstelle einen Objekttyp fuer eine Person ─────────────────
//
// Erklaerung: Ein Interface definiert die "Form" eines Objekts.
// Jede Property braucht einen Namen und einen Typ.

interface Person {
  name: string;
  alter: number;
  email: string;
}

const person1: Person = {
  name: "Max",
  alter: 28,
  email: "max@test.de",
};

// ─── Aufgabe 2: Optionale Properties ──────────────────────────────────────
//
// Erklaerung: Das ? nach dem Property-Namen macht sie optional.
// Optional bedeutet: Die Property kann fehlen ODER undefined sein.
// Der Typ einer optionalen Property 'x?: string' ist 'string | undefined'.

interface Produkt {
  name: string;
  preis: number;
  beschreibung?: string;
  rabatt?: number;
}

const produkt1: Produkt = {
  name: "Laptop",
  preis: 999,
  beschreibung: "Gaming Laptop",
  rabatt: 10,
};

const produkt2: Produkt = {
  name: "Maus",
  preis: 29.99,
  // beschreibung und rabatt werden weggelassen -- das ist OK wegen ?
};

// ─── Aufgabe 3: Readonly Properties ───────────────────────────────────────
//
// Erklaerung: 'readonly' vor einer Property verhindert, dass sie nach der
// Erstellung geaendert wird. Der Compiler gibt einen Fehler, wenn du
// versuchst, einen Wert zuzuweisen.
//
// Wichtig: readonly ist NUR ein Compile-Time-Check! Zur Laufzeit gibt es
// keinen Schutz.

interface Bestellung {
  readonly bestellNr: string;
  readonly datum: Date;
  status: string;
  betrag: number;
}

const bestellung1: Bestellung = {
  bestellNr: "B-001",
  datum: new Date("2025-01-15"),
  status: "offen",
  betrag: 150,
};

// Status aendern -- erlaubt, weil 'status' NICHT readonly ist
bestellung1.status = "versendet";

// Das waere verboten:
// bestellung1.bestellNr = "B-002";  // Error: Cannot assign to 'bestellNr'
// bestellung1.datum = new Date();   // Error: Cannot assign to 'datum'

// ─── Aufgabe 4: Verschachtelte Objekttypen ────────────────────────────────
//
// Erklaerung: Verschachtelte Objekte sollten idealerweise eigene Interfaces
// bekommen. Das macht den Code lesbarer und wiederverwendbar.
// Du KOENNTEST alles inline schreiben, aber das wird schnell unuebersichtlich.

interface Adresse {
  strasse: string;
  hausnummer: string;
  plz: string;
  stadt: string;
}

interface Kontakt {
  telefon?: string; // Optional!
  email: string;
}

interface Mitarbeiter {
  name: string;
  position: string;
  adresse: Adresse;
  kontakt: Kontakt;
}

const mitarbeiter1: Mitarbeiter = {
  name: "Anna Schmidt",
  position: "Entwicklerin",
  adresse: {
    strasse: "Berliner Str.",
    hausnummer: "42",
    plz: "10115",
    stadt: "Berlin",
  },
  kontakt: {
    email: "anna@firma.de",
    // telefon wird weggelassen -- ist optional
  },
};

// ─── Aufgabe 5: Interface erweitern ──────────────────────────────────────
//
// Erklaerung: 'extends' erstellt eine Vererbungsbeziehung.
// Das Kind-Interface erbt ALLE Properties des Eltern-Interfaces
// und kann zusaetzliche hinzufuegen.
//
// Das ist DRY (Don't Repeat Yourself) -- gemeinsame Properties
// werden nicht dupliziert.

interface Basisprodukt {
  id: number;
  name: string;
  preis: number;
}

interface DigitalesProdukt extends Basisprodukt {
  downloadUrl: string;
  dateigroesse: number;
}

interface PhysischesProdukt extends Basisprodukt {
  gewicht: number;
  versandkosten: number;
}

const ebook: DigitalesProdukt = {
  id: 1,
  name: "TypeScript Guide",
  preis: 19.99,
  downloadUrl: "https://example.com/download/ts-guide",
  dateigroesse: 5000,
};

const buch: PhysischesProdukt = {
  id: 2,
  name: "TypeScript Buch",
  preis: 39.99,
  gewicht: 0.5,
  versandkosten: 4.99,
};

// ─── Aufgabe 6: Excess Property Errors beheben ──────────────────────────
//
// Erklaerung: Excess Property Checking greift NUR bei frischen Object Literals.
// Es gibt drei Wege, den Check zu umgehen:

interface Farbe {
  rot: number;
  gruen: number;
  blau: number;
}

// Methode 1: Ueber eine Zwischenvariable
// Wenn das Objekt zuerst in einer Variable gespeichert wird, greift der
// Excess Property Check nicht mehr. TypeScript prueft nur strukturelle
// Kompatibilitaet.
const farbDaten = { rot: 255, gruen: 128, blau: 0, alpha: 0.5 };
const farbe1: Farbe = farbDaten; // OK!

// Methode 2: Interface erweitern
// Wenn du die extra Property tatsaechlich brauchst, erweitere das Interface.
interface FarbeMitAlpha extends Farbe {
  alpha: number;
}
const farbe2: FarbeMitAlpha = { rot: 255, gruen: 128, blau: 0, alpha: 0.5 };

// Methode 3: Type Assertion
// Mit 'as Farbe' sagst du dem Compiler: "Vertrau mir, das ist eine Farbe."
// VORSICHT: Assertions umgehen die Typpruefung! Nur verwenden, wenn du
// sicher bist, dass es korrekt ist.
const farbe3 = { rot: 255, gruen: 128, blau: 0, alpha: 0.5 } as Farbe;

// ─── Aufgabe 7: Funktion mit Objekt-Parameter ──────────────────────────

interface Rechnung {
  posten: { name: string; betrag: number }[];
}

// Erklaerung: Die Funktion nimmt ein Rechnung-Objekt entgegen und
// summiert alle Betraege auf. reduce() ist ideal fuer Summen.
function berechneSumme(rechnung: Rechnung): number {
  return rechnung.posten.reduce((summe, posten) => summe + posten.betrag, 0);
}

// Alternative mit for-Schleife:
// function berechneSumme(rechnung: Rechnung): number {
//   let summe = 0;
//   for (const posten of rechnung.posten) {
//     summe += posten.betrag;
//   }
//   return summe;
// }

// ─── Aufgabe 8: Index Signatures ─────────────────────────────────────────
//
// Erklaerung: Eine Index Signature [key: string]: Type erlaubt beliebige
// String-Keys. Wenn du feste Properties mit einer Index Signature
// kombinierst, muss der Typ der festen Properties zum Index-Typ passen.
//
// Hier: 'schueler' ist string, die Noten sind number.
// Also muss die Index Signature 'string | number' erlauben.

interface Notenbuch {
  schueler: string;
  [fach: string]: string | number;
}

const notenbuch: Notenbuch = {
  schueler: "Max",
  mathe: 2,
  deutsch: 1,
  englisch: 3,
};

// ─── Aufgabe 9: Readonly Interface ───────────────────────────────────────
//
// Erklaerung: Statt jede Property einzeln als 'readonly' zu markieren,
// kannst du Readonly<T> verwenden. Das macht ALLE Properties readonly.
// Achtung: Readonly<T> ist shallow -- verschachtelte Objekte bleiben mutable!

interface KonfigBasis {
  datenbankUrl: string;
  port: number;
  debug: boolean;
  maxVerbindungen: number;
}

type KonfigDatei = Readonly<KonfigBasis>;

const konfiguration: KonfigDatei = {
  datenbankUrl: "postgres://localhost:5432/mydb",
  port: 3000,
  debug: false,
  maxVerbindungen: 100,
};

// Alle Aenderungen sind jetzt verboten:
// konfiguration.port = 8080;              // Error!
// konfiguration.debug = true;             // Error!
// konfiguration.datenbankUrl = "andere";  // Error!

// ─── Aufgabe 10: Reales Modell -- Warenkorb ─────────────────────────────
//
// Erklaerung: Hier kommen alle Konzepte zusammen:
// - readonly fuer unveraenderliche Properties (id, erstelltAm)
// - Optionale Properties (bild, gutscheinCode)
// - Verschachtelte Typen (WarenkorbArtikel in Warenkorb)
// - Funktionen mit Objektparametern

interface WarenkorbArtikel {
  readonly id: number;
  name: string;
  preis: number;
  menge: number;
  bild?: string;
}

interface Warenkorb {
  readonly erstelltAm: Date;
  artikel: WarenkorbArtikel[];
  gutscheinCode?: string;
}

const warenkorb: Warenkorb = {
  erstelltAm: new Date(),
  artikel: [
    { id: 1, name: "TypeScript Buch", preis: 39.99, menge: 1 },
    {
      id: 2,
      name: "Laptop-Staender",
      preis: 49.99,
      menge: 2,
      bild: "https://example.com/staender.jpg",
    },
  ],
  gutscheinCode: "SAVE10",
};

function berechneWarenkorbSumme(wk: Warenkorb): number {
  return wk.artikel.reduce(
    (summe, artikel) => summe + artikel.preis * artikel.menge,
    0
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

// Test 1: Person
console.assert(person1.name === "Max", "Aufgabe 1: name sollte 'Max' sein");
console.assert(person1.alter === 28, "Aufgabe 1: alter sollte 28 sein");
console.assert(person1.email === "max@test.de", "Aufgabe 1: email sollte 'max@test.de' sein");

// Test 2: Produkt
console.assert(
  produkt1.beschreibung === "Gaming Laptop",
  "Aufgabe 2: beschreibung sollte vorhanden sein"
);
console.assert(
  produkt2.beschreibung === undefined,
  "Aufgabe 2: beschreibung sollte undefined sein"
);

// Test 3: Bestellung
console.assert(bestellung1.status === "versendet", "Aufgabe 3: status sollte 'versendet' sein");
console.assert(
  bestellung1.bestellNr === "B-001",
  "Aufgabe 3: bestellNr sollte 'B-001' sein"
);

// Test 4: Mitarbeiter
console.assert(
  mitarbeiter1.adresse.stadt === "Berlin",
  "Aufgabe 4: Stadt sollte 'Berlin' sein"
);
console.assert(
  mitarbeiter1.kontakt.telefon === undefined,
  "Aufgabe 4: telefon sollte undefined sein"
);

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
console.assert(
  typeof berechneWarenkorbSumme === "function",
  "Aufgabe 10: Funktion sollte existieren"
);
const summe = berechneWarenkorbSumme(warenkorb);
console.assert(
  Math.abs(summe - 139.97) < 0.01,
  `Aufgabe 10: Summe sollte ~139.97 sein, ist ${summe}`
);

console.log("\n✓ Alle Tests bestanden! Gut gemacht!");
