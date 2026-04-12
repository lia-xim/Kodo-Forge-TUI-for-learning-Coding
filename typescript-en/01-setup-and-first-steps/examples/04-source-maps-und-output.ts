// ============================================================
// Beispiel 04: Source Maps, Declaration Files & Compiler Output
// ============================================================
//
// In diesem Beispiel schauen wir uns an, was der Compiler
// tatsaechlich erzeugt -- nicht nur .js-Dateien, sondern auch
// Source Maps und Declaration Files.
//
// Ausfuehren mit: tsx examples/04-source-maps-und-output.ts
//
// Zum Erzeugen aller Output-Dateien:
//   tsc examples/04-source-maps-und-output.ts \
//     --declaration --sourceMap --target ES2022 --outDir temp-output
// ============================================================

// -----------------------------------------------------------
// 1. Was der Compiler aus deinem Code macht
// -----------------------------------------------------------

console.log("=== Compiler Output ===\n");

// Hier ist ein typisches Stueck TypeScript-Code:

interface Produkt {
  id: number;
  name: string;
  preis: number;
  kategorie: "elektronik" | "kleidung" | "lebensmittel";
}

type ProduktListe = Produkt[];

function berechneGesamtpreis(produkte: ProduktListe): number {
  return produkte.reduce((summe: number, p: Produkt) => summe + p.preis, 0);
}

function filterNachKategorie(
  produkte: ProduktListe,
  kategorie: Produkt["kategorie"]
): ProduktListe {
  return produkte.filter((p: Produkt) => p.kategorie === kategorie);
}

const warenkorb: ProduktListe = [
  { id: 1, name: "Laptop", preis: 999, kategorie: "elektronik" },
  { id: 2, name: "T-Shirt", preis: 25, kategorie: "kleidung" },
  { id: 3, name: "Apfel", preis: 2, kategorie: "lebensmittel" },
  { id: 4, name: "Kopfhoerer", preis: 150, kategorie: "elektronik" },
];

const elektronik = filterNachKategorie(warenkorb, "elektronik");
const gesamtpreis = berechneGesamtpreis(warenkorb);
const elektronikPreis = berechneGesamtpreis(elektronik);

console.log(`Warenkorb: ${warenkorb.length} Produkte`);
console.log(`Gesamtpreis: ${gesamtpreis} EUR`);
console.log(`Elektronik: ${elektronik.length} Produkte, ${elektronikPreis} EUR`);

// -----------------------------------------------------------
// 2. Was daraus im JavaScript wird (.js)
// -----------------------------------------------------------

console.log("\n=== Was im .js-Output steht ===");
console.log(`
  // interface Produkt { ... }        --> KOMPLETT WEG
  // type ProduktListe = Produkt[];   --> KOMPLETT WEG
  // : number, : Produkt, etc.        --> WEG

  function berechneGesamtpreis(produkte) {
    return produkte.reduce((summe, p) => summe + p.preis, 0);
  }

  function filterNachKategorie(produkte, kategorie) {
    return produkte.filter((p) => p.kategorie === kategorie);
  }

  // Beachte: "elektronik" | "kleidung" | "lebensmittel" ist WEG.
  // Zur Laufzeit kann jeder String uebergeben werden!
`);

// -----------------------------------------------------------
// 3. Was eine Source Map enthaelt (.js.map)
// -----------------------------------------------------------

console.log("=== Source Map ===");
console.log(`
  Eine Source Map ist eine JSON-Datei die ungefaehr so aussieht:

  {
    "version": 3,
    "file": "04-source-maps-und-output.js",
    "sourceRoot": "",
    "sources": ["../04-source-maps-und-output.ts"],
    "mappings": "AAAA;AACA;AACA;..."   // <-- Die Zuordnungstabelle
  }

  Die "mappings" kodieren fuer jedes Zeichen im .js-Output:
    - Welche Zeile in der .ts-Quelle?
    - Welche Spalte in der .ts-Quelle?

  Das ist VLQ-Base64-kodiert und fuer Menschen nicht lesbar,
  aber Browser-DevTools und Node.js verstehen es.

  Am Ende der .js-Datei steht:
  //# sourceMappingURL=04-source-maps-und-output.js.map

  Das sagt dem Browser/Node.js: "Die Source Map liegt hier."
`);

// -----------------------------------------------------------
// 4. Was ein Declaration File enthaelt (.d.ts)
// -----------------------------------------------------------

console.log("=== Declaration File (.d.ts) ===");
console.log(`
  Ein Declaration File enthaelt NUR die Typen -- keinen Code:

  interface Produkt {
    id: number;
    name: string;
    preis: number;
    kategorie: "elektronik" | "kleidung" | "lebensmittel";
  }

  type ProduktListe = Produkt[];

  declare function berechneGesamtpreis(produkte: ProduktListe): number;
  declare function filterNachKategorie(
    produkte: ProduktListe,
    kategorie: Produkt["kategorie"]
  ): ProduktListe;

  // Beachte:
  // - Die Funktion hat "declare" davor (nur Signatur, kein Body)
  // - Die Interfaces bleiben erhalten
  // - Der Implementierungscode ist WEG
  // - Das ist die "Typ-Dokumentation" fuer andere TypeScript-Nutzer
`);

// -----------------------------------------------------------
// 5. Alle drei Dateien im Ueberblick
// -----------------------------------------------------------

console.log("=== Zusammenfassung: 1 .ts-Datei erzeugt 3 Ausgaben ===");
console.log(`
  beispiel.ts  (Dein Quellcode)
      |
      v  tsc --declaration --sourceMap
      |
      +---> beispiel.js       Ausfuehrbarer JavaScript-Code
      |                       (Typen entfernt)
      |
      +---> beispiel.d.ts     Typ-Deklarationen
      |                       (Code entfernt, Typen bleiben)
      |
      +---> beispiel.js.map   Source Map
                              (Zeilen-Zuordnung TS <-> JS)
`);

// -----------------------------------------------------------
// 6. Praktisch ausprobieren
// -----------------------------------------------------------

console.log("=== Probiere es selbst aus! ===");
console.log(`
  Fuehre diesen Befehl aus und schau dir die erzeugten Dateien an:

  tsc examples/04-source-maps-und-output.ts \\
    --declaration --sourceMap --target ES2022 --outDir temp-output

  Dann oeffne:
    temp-output/04-source-maps-und-output.js       (JavaScript)
    temp-output/04-source-maps-und-output.d.ts      (Deklarationen)
    temp-output/04-source-maps-und-output.js.map    (Source Map)

  Aufraeumen:
    rm -rf temp-output
`);
