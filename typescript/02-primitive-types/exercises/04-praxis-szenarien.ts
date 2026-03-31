/**
 * Lektion 02 - Exercise 04: Praxis-Szenarien
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-praxis-szenarien.ts
 *
 * Diese Uebung simuliert reale Szenarien aus Angular- und React-Projekten.
 * Hier geht es nicht mehr um einzelne Typ-Annotationen, sondern um
 * ENTSCHEIDUNGEN: Welcher Typ ist der richtige und WARUM?
 *
 * Schwierigkeitsgrad: Fortgeschritten
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Type Widening verstehen und loesen
// ═══════════════════════════════════════════════════════════════════════════

// Du hast eine Funktion die nur bestimmte Werte akzeptiert:
type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme): string {
  return `Theme "${theme}" angewendet`;
}

// TODO: Erklaere im Kommentar warum Zeile A NICHT kompiliert
//       und Zeile B SCHON — obwohl der Wert identisch ist.
//       Dann finde DREI verschiedene Wege, um Zeile A zum Laufen zu bringen.

let userTheme = "dark";
const defaultTheme = "dark";

// Zeile A (kompiliert nicht):
// const ergebnis1 = applyTheme(userTheme);

// Zeile B (kompiliert):
const ergebnis2 = applyTheme(defaultTheme);

// TODO: Loesung 1: Aendere die Deklaration von userTheme
// TODO: Loesung 2: Verwende "as const" (wo?)
// TODO: Loesung 3: Verwende eine explizite Typ-Annotation

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Geldbetraege — die richtige Typ-Entscheidung
// ═══════════════════════════════════════════════════════════════════════════

// Du baust einen Warenkorb. Preise kommen als number (in Euro mit Cent).
// Das Problem: 0.1 + 0.2 !== 0.3

// TODO: Implementiere "berechneGesamtpreis" so, dass KEINE
//       Gleitkomma-Fehler auftreten.
//
// Strategie: Rechne intern in CENT (ganzzahlig), gib das Ergebnis
//            als formatierten String zurueck.
//
// Beispiel: [{ preis: 19.99, menge: 2 }, { preis: 5.50, menge: 3 }]
// → Erwartetes Ergebnis: "56.48" (= 19.99*2 + 5.50*3)

interface WarenkorbArtikel {
  name: string;
  preis: number;   // Preis in Euro (z.B. 19.99)
  menge: number;
}

// function berechneGesamtpreis(artikel: WarenkorbArtikel[]): string {
//   TODO: Implementiere — konvertiere zu Cent, rechne, konvertiere zurueck
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: API-Response Typisierung
// ═══════════════════════════════════════════════════════════════════════════

// Du empfaengst Daten von einer REST-API. Die Daten kommen als unknown
// (in der Realitaet wuerdest du JSON.parse verwenden).
//
// Schreibe:
// 1. Ein Interface "ApiUser" mit: id (number), name (string), email (string),
//    role ("admin" | "user" | "guest")
// 2. Einen Type Guard "istApiUser" der prueft ob unbekannte Daten ein ApiUser sind
// 3. Eine Funktion "verarbeiteApiAntwort" die:
//    - unknown entgegennimmt
//    - Prueft ob es ein Array von ApiUser ist
//    - Die Namen aller Admins zurueckgibt
//    - Ein leeres Array zurueckgibt wenn die Daten ungueltig sind

// TODO: Implementiere Interface, Type Guard und Funktion

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: as const und Union Types aus Arrays
// ═══════════════════════════════════════════════════════════════════════════

// Du willst HTTP-Methoden als Typ UND als Laufzeitwert nutzen.
// Ziel: Eine einzige Quelle der Wahrheit (Single Source of Truth).

// TODO: Erstelle ein Array HTTP_METHODS mit as const
// TODO: Leite daraus den Typ HttpMethod ab (Union Type)
// TODO: Schreibe eine Funktion "istGueltigeMethode" die prueft
//       ob ein string eine gueltige HTTP-Methode ist (Type Guard)

// Erwartetes Ergebnis:
// const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
// type HttpMethod = ???;  // "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
// function istGueltigeMethode(method: string): method is HttpMethod { ??? }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Konfigurationsobjekt mit strikten Typen
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du codest — erklaere kurz:
// 1. Was ist das Problem?
//    ___________________________________________________________
// 2. Welche TypeScript-Konzepte brauchst du?
//    ___________________________________________________________
// 3. Warum ist || fuer Default-Werte hier GEFAEHRLICH?
//    (Tipp: Was passiert wenn port === 0 ist?)
//    ___________________________________________________________

// Du erstellst eine Konfiguration fuer eine App. Einige Werte sind
// optional, andere muessen bestimmte Formate haben.

// TODO: Definiere den Typ "AppConfig" mit folgenden Properties:
// - appName: string (Pflicht)
// - port: number (Pflicht, aber koennte 0 sein!)
// - environment: "development" | "staging" | "production" (Pflicht)
// - debugMode: boolean (optional, Default: false)
// - apiUrl: string (optional, aber wenn vorhanden muss es ein string sein)
// - maxRetries: number (optional)

// TODO: Schreibe eine Funktion "erstelleConfig" die:
// - Einen Partial<AppConfig> entgegennimmt
// - Prueft ob alle Pflichtfelder vorhanden sind
// - Defaults fuer optionale Felder setzt (mit ??)
// - AppConfig zurueckgibt ODER null wenn Pflichtfelder fehlen
//
// ACHTUNG: port koennte 0 sein — verwende ?? nicht || fuer port!

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entferne die Kommentare wenn du die Aufgaben geloest hast
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1: Type Widening — nur manuell pruefen
// Stelle sicher, dass alle drei Loesungen kompilieren

// Test 2: Geldbetraege
console.assert(
  berechneGesamtpreis([
    { name: "Buch", preis: 19.99, menge: 2 },
    { name: "Stift", preis: 5.50, menge: 3 },
  ]) === "56.48",
  "2a: Gesamtpreis"
);
console.assert(
  berechneGesamtpreis([
    { name: "Kaffee", preis: 0.10, menge: 3 },
  ]) === "0.30",
  "2b: Klassisches Gleitkomma-Problem (0.1 * 3)"
);
console.assert(
  berechneGesamtpreis([]) === "0.00",
  "2c: Leerer Warenkorb"
);

// Test 3: API-Response
const testDaten: unknown = [
  { id: 1, name: "Max", email: "max@test.de", role: "admin" },
  { id: 2, name: "Anna", email: "anna@test.de", role: "user" },
  { id: 3, name: "Tim", email: "tim@test.de", role: "admin" },
];
const admins = verarbeiteApiAntwort(testDaten);
console.assert(admins.length === 2, "3a: 2 Admins gefunden");
console.assert(admins.includes("Max"), "3b: Max ist Admin");
console.assert(admins.includes("Tim"), "3c: Tim ist Admin");
console.assert(verarbeiteApiAntwort("ungueltig").length === 0, "3d: Ungueltige Daten");
console.assert(verarbeiteApiAntwort(null).length === 0, "3e: null");

// Test 4: HTTP Methods
console.assert(istGueltigeMethode("GET") === true, "4a: GET ist gueltig");
console.assert(istGueltigeMethode("PATCH") === true, "4b: PATCH ist gueltig");
console.assert(istGueltigeMethode("YOLO") === false, "4c: YOLO ist ungueltig");
console.assert(HTTP_METHODS.length === 5, "4d: 5 Methoden");

// Test 5: Config
const guteConfig = erstelleConfig({
  appName: "MeineApp",
  port: 3000,
  environment: "development",
});
console.assert(guteConfig !== null, "5a: Gueltige Config");
console.assert(guteConfig?.debugMode === false, "5b: Default debugMode");

const portNull = erstelleConfig({
  appName: "MeineApp",
  port: 0,
  environment: "production",
});
console.assert(portNull !== null, "5c: Port 0 ist gueltig!");
console.assert(portNull?.port === 0, "5d: Port bleibt 0");

const ungueltig = erstelleConfig({ appName: "Test" });
console.assert(ungueltig === null, "5e: Fehlende Pflichtfelder → null");

console.log("\n Alle Tests bestanden! Hervorragend!");
*/

console.log("Entferne die Kommentare um die Tests auszufuehren,");
console.log("nachdem du alle TODO-Aufgaben geloest hast.");
