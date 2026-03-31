export {};

/**
 * Lektion 05 - Beispiel 01: Object Types
 *
 * Themen:
 * - Inline Object Types
 * - Object Type Aliases
 * - Verschachtelte Objekte
 * - Optionale Properties
 * - Readonly Properties
 *
 * Ausfuehren: npx tsx examples/01-object-types.ts
 */

// ─── 1. Inline Object Types ────────────────────────────────────────────────

// Die einfachste Art, ein Objekt zu typisieren: direkt bei der Deklaration
let produkt: { name: string; preis: number } = {
  name: "TypeScript-Buch",
  preis: 29.99,
};

console.log("=== Inline Object Type ===");
console.log(`Produkt: ${produkt.name}, Preis: ${produkt.preis}`);

// Funktionsparameter mit Inline-Objekttyp
function beschreibeProdukt(p: { name: string; preis: number }): string {
  return `${p.name} kostet ${p.preis} EUR`;
}

console.log(beschreibeProdukt(produkt));

// ─── 2. Type Alias fuer Objekte ────────────────────────────────────────────

// Bei mehrfacher Verwendung: Type Alias erstellen
type Buch = {
  titel: string;
  autor: string;
  seiten: number;
  isbn: string;
};

const meinBuch: Buch = {
  titel: "Clean Code",
  autor: "Robert C. Martin",
  seiten: 464,
  isbn: "978-0132350884",
};

console.log("\n=== Type Alias ===");
console.log(`Buch: "${meinBuch.titel}" von ${meinBuch.autor}`);

// ─── 3. Verschachtelte Objekte ─────────────────────────────────────────────

// Objekte koennen beliebig tief verschachtelt sein
type Adresse = {
  strasse: string;
  hausnummer: string;
  plz: string;
  stadt: string;
};

type Kunde = {
  name: string;
  alter: number;
  adresse: Adresse; // Verschachteltes Objekt als eigener Typ
  kontakt: {
    // Verschachteltes Objekt inline
    email: string;
    telefon?: string; // Optional
  };
};

const kunde: Kunde = {
  name: "Maria Mueller",
  alter: 35,
  adresse: {
    strasse: "Hauptstrasse",
    hausnummer: "42a",
    plz: "10115",
    stadt: "Berlin",
  },
  kontakt: {
    email: "maria@example.de",
    // telefon wird weggelassen -- ist optional
  },
};

console.log("\n=== Verschachtelte Objekte ===");
console.log(`Kunde: ${kunde.name}`);
console.log(`Wohnt in: ${kunde.adresse.plz} ${kunde.adresse.stadt}`);
console.log(`E-Mail: ${kunde.kontakt.email}`);
console.log(`Telefon: ${kunde.kontakt.telefon ?? "nicht angegeben"}`);

// ─── 4. Optionale Properties ───────────────────────────────────────────────

// Das ? markiert Properties, die fehlen duerfen
type Suchfilter = {
  begriff?: string;
  kategorie?: string;
  minPreis?: number;
  maxPreis?: number;
  nurVerfuegbar?: boolean;
};

// Alle Varianten sind gueltig:
const filter1: Suchfilter = {};
const filter2: Suchfilter = { begriff: "TypeScript" };
const filter3: Suchfilter = { minPreis: 10, maxPreis: 50, nurVerfuegbar: true };

console.log("\n=== Optionale Properties ===");
console.log("Filter 1:", filter1);
console.log("Filter 2:", filter2);
console.log("Filter 3:", filter3);

// Wichtig: Optionale Properties sind T | undefined
function zeigeSuchbegriff(filter: Suchfilter): void {
  // filter.begriff ist string | undefined -- muss geprueft werden!
  if (filter.begriff !== undefined) {
    console.log(`Suche nach: "${filter.begriff}"`);
  } else {
    console.log("Kein Suchbegriff angegeben");
  }
}

zeigeSuchbegriff(filter1);
zeigeSuchbegriff(filter2);

// ─── 5. Readonly Properties ───────────────────────────────────────────────

// readonly verhindert Aenderungen nach der Erstellung
type Koordinate = {
  readonly lat: number;
  readonly lng: number;
  readonly bezeichnung: string;
};

const berlin: Koordinate = {
  lat: 52.52,
  lng: 13.405,
  bezeichnung: "Berlin Mitte",
};

console.log("\n=== Readonly Properties ===");
console.log(`${berlin.bezeichnung}: ${berlin.lat}, ${berlin.lng}`);

// Folgende Zeilen wuerden Fehler verursachen:
// berlin.lat = 48.13;  // Error: Cannot assign to 'lat' because it is a read-only property
// berlin.bezeichnung = "Anderer Ort";  // Error!

// ─── 6. Kombination: Optional + Readonly ──────────────────────────────────

type Artikel = {
  readonly id: number; // Einmal gesetzt, nie aenderbar
  readonly erstelltAm: Date; // Einmal gesetzt, nie aenderbar
  titel: string; // Kann geaendert werden
  inhalt: string; // Kann geaendert werden
  veroeffentlicht?: boolean; // Optional und aenderbar
  readonly autor: string; // Einmal gesetzt, nie aenderbar
};

const artikel: Artikel = {
  id: 1,
  erstelltAm: new Date(),
  titel: "TypeScript lernen",
  inhalt: "In diesem Artikel...",
  autor: "Max Mustermann",
};

// Erlaubt:
artikel.titel = "TypeScript richtig lernen";
artikel.veroeffentlicht = true;

// Verboten:
// artikel.id = 2;           // Error!
// artikel.autor = "Andere"; // Error!

console.log("\n=== Optional + Readonly kombiniert ===");
console.log(`Artikel #${artikel.id}: "${artikel.titel}" von ${artikel.autor}`);
console.log(`Veroeffentlicht: ${artikel.veroeffentlicht ? "Ja" : "Nein"}`);

// ─── 7. Object Destructuring mit Typen ─────────────────────────────────────

// ACHTUNG: Die Syntax ist anders als man denkt!

// FALSCH: { name: string } benennt 'name' in 'string' um (JS-Syntax!)
// const { name: string } = kunde;  // Das ist UMBENENNUNG, kein Typ!

// RICHTIG: Typ kommt nach dem gesamten Destructuring-Pattern
const { name, alter }: { name: string; alter: number } = kunde;

// Oder besser mit bestehendem Typ:
const { adresse }: Pick<Kunde, "adresse"> = kunde;

console.log("\n=== Destructuring ===");
console.log(`Name: ${name}, Alter: ${alter}`);
console.log(`Stadt: ${adresse.stadt}`);

// In Funktionsparametern:
function formatiereAdresse({ strasse, hausnummer, plz, stadt }: Adresse): string {
  return `${strasse} ${hausnummer}, ${plz} ${stadt}`;
}

console.log(`Adresse: ${formatiereAdresse(kunde.adresse)}`);
