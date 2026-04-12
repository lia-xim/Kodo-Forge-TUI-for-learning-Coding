/**
 * Lektion 02 - Solution 04: Praxis-Szenarien
 *
 * Ausfuehren mit: npx tsx solutions/04-praxis-szenarien.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Type Widening verstehen und loesen
// ═══════════════════════════════════════════════════════════════════════════

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme): string {
  return `Theme "${theme}" angewendet`;
}

// ERKLAERUNG: Warum Zeile A NICHT kompiliert und Zeile B SCHON:
//
// let userTheme = "dark";
//   → TypeScript inferiert: string (breit)
//   → Weil let sich aendern kann, koennte es spaeter "pink" sein
//   → string ist NICHT Theme zuweisbar
//
// const defaultTheme = "dark";
//   → TypeScript inferiert: "dark" (Literal Type)
//   → Weil const sich nie aendert, ist der Typ exakt "dark"
//   → "dark" IST Theme zuweisbar (es ist Teil des Unions)

// Loesung 1: Explizite Typ-Annotation
let userTheme1: Theme = "dark";
const ergebnis1 = applyTheme(userTheme1);  // OK!

// Loesung 2: as const
let userTheme2 = "dark" as const;
const ergebnis2a = applyTheme(userTheme2);  // OK!

// Loesung 3: const statt let
const userTheme3 = "dark";
const ergebnis2b = applyTheme(userTheme3);  // OK!

// Bonus — Loesung mit as:
let userTheme4 = "dark";
const ergebnis3 = applyTheme(userTheme4 as Theme);  // OK, aber weniger sicher

// BEWERTUNG DER LOESUNGEN:
// Loesung 1 (Typ-Annotation): Am besten — klar und sicher
// Loesung 2 (as const): Gut — kurz, aber der Typ ist "dark" statt Theme
// Loesung 3 (const): Gut — aber nur wenn sich der Wert nie aendert
// Bonus (as): Am schlechtesten — umgeht die Pruefung, "trust me bro"

console.log(`Loesung 1: ${ergebnis1}`);
console.log(`Loesung 2: ${ergebnis2a}`);
console.log(`Loesung 3: ${ergebnis2b}`);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Geldbetraege — die richtige Typ-Entscheidung
// ═══════════════════════════════════════════════════════════════════════════

interface WarenkorbArtikel {
  name: string;
  preis: number;   // Preis in Euro (z.B. 19.99)
  menge: number;
}

function berechneGesamtpreis(artikel: WarenkorbArtikel[]): string {
  // Strategie: In Cent umrechnen, ganzzahlig rechnen, zurueck konvertieren
  const totalCent = artikel.reduce((summe, item) => {
    // Math.round() kompensiert Gleitkomma-Fehler bei der Umrechnung
    const preisCent = Math.round(item.preis * 100);
    return summe + preisCent * item.menge;
  }, 0);

  return (totalCent / 100).toFixed(2);
}

// ERKLAERUNG:
// - Warum Math.round(preis * 100)?
//   Weil 19.99 * 100 = 1998.9999999999998 (Gleitkomma-Fehler!)
//   Math.round macht daraus 1999 (korrekt)
//
// - Warum in Cent rechnen?
//   Weil 1999 * 2 = 3998 (exakt! Ganzzahl-Arithmetik hat keine Fehler)
//   Aber 19.99 * 2 = 39.98 (zufaellig korrekt, aber 0.1 * 3 = 0.30000000000000004!)
//
// - Warum .toFixed(2)?
//   Um immer zwei Dezimalstellen zu zeigen: "56.48" statt "56.48000000..."
//
// - In grossen Projekten: Verwende eine Geld-Library wie dinero.js
//   oder erstelle einen eigenen Money-Typ mit Cent als Basis.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: API-Response Typisierung
// ═══════════════════════════════════════════════════════════════════════════

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

function istApiUser(daten: unknown): daten is ApiUser {
  if (typeof daten !== "object" || daten === null) {
    return false;
  }

  const obj = daten as Record<string, unknown>;

  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    (obj.role === "admin" || obj.role === "user" || obj.role === "guest")
  );
}

function verarbeiteApiAntwort(daten: unknown): string[] {
  // Pruefe: Ist es ein Array?
  if (!Array.isArray(daten)) {
    return [];
  }

  // Filtere: Nur gueltige ApiUser behalten, nur Admins
  return daten
    .filter((item): item is ApiUser => istApiUser(item))
    .filter(user => user.role === "admin")
    .map(admin => admin.name);
}

// ERKLAERUNG:
// - istApiUser prueft JEDES Property einzeln. Fuer "role" pruefen wir
//   gegen alle drei erlaubten Werte — typeof allein reicht nicht, weil
//   typeof "beliebig" auch "string" waere.
//
// - Array.isArray ist der sichere Weg um Arrays zu erkennen.
//   typeof [] === "object" (nicht "array"!), deshalb brauchen wir isArray.
//
// - Die filter-Kette nutzt einen Type Guard als Callback:
//   .filter((item): item is ApiUser => istApiUser(item))
//   Das sagt TypeScript: Nach dem Filter sind ALLE Elemente ApiUser.
//
// - In der Praxis: Verwende zod fuer API-Validierung:
//   const ApiUserSchema = z.object({ id: z.number(), ... });
//   Das spart manuellen Code und gibt bessere Fehlermeldungen.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: as const und Union Types aus Arrays
// ═══════════════════════════════════════════════════════════════════════════

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

// typeof HTTP_METHODS → readonly ["GET", "POST", "PUT", "PATCH", "DELETE"]
// typeof HTTP_METHODS[number] → "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
type HttpMethod = typeof HTTP_METHODS[number];

function istGueltigeMethode(method: string): method is HttpMethod {
  // .includes() auf einem readonly Array braucht einen kleinen Trick:
  return (HTTP_METHODS as readonly string[]).includes(method);
}

// ERKLAERUNG:
// - "as const" macht das Array readonly UND gibt jedem Element einen Literal Type.
// - typeof HTTP_METHODS[number] ist ein Index Access Type:
//   "Welche Typen koennen als Index in diesem Array auftreten?"
//   → Das ergibt den Union aller Elemente.
//
// - Warum der Cast in istGueltigeMethode?
//   HTTP_METHODS.includes(method) gibt einen Fehler, weil:
//   - HTTP_METHODS ist readonly ["GET", "POST", ...]
//   - .includes() erwartet den selben Typ wie die Array-Elemente
//   - method ist string, nicht HttpMethod
//   - Der Cast zu "readonly string[]" loest das Problem sicher.
//
// - Dieses Pattern (as const + typeof X[number]) ist extrem nuetzlich.
//   Es ist eine typsichere Alternative zu enums und die "Single Source
//   of Truth" fuer Werte die sowohl zur Laufzeit als auch als Typ
//   existieren muessen.

// Bonus: Die Funktion als Type Guard verwenden
function beispiel(userInput: string): void {
  if (istGueltigeMethode(userInput)) {
    // Hier ist userInput vom Typ HttpMethod (nicht mehr string!)
    console.log(`Gueltige Methode: ${userInput}`);
  } else {
    console.log(`Ungueltige Methode: ${userInput}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Konfigurationsobjekt mit strikten Typen
// ═══════════════════════════════════════════════════════════════════════════

interface AppConfig {
  appName: string;
  port: number;
  environment: "development" | "staging" | "production";
  debugMode: boolean;
  apiUrl: string | undefined;
  maxRetries: number;
}

function erstelleConfig(partial: Partial<AppConfig>): AppConfig | null {
  // Pruefe Pflichtfelder:
  // ACHTUNG: Wir pruefen port !== undefined statt !port,
  // weil port = 0 ein gueltiger Wert ist!
  if (
    partial.appName === undefined ||
    partial.port === undefined ||
    partial.environment === undefined
  ) {
    return null;
  }

  // Setze Defaults mit ?? (nicht ||!)
  return {
    appName: partial.appName,
    port: partial.port,                       // KEIN Default — 0 ist gueltig!
    environment: partial.environment,
    debugMode: partial.debugMode ?? false,     // Default: false
    apiUrl: partial.apiUrl ?? undefined,       // Default: undefined
    maxRetries: partial.maxRetries ?? 3,       // Default: 3
  };
}

// ERKLAERUNG:
// - Partial<AppConfig> macht ALLE Properties optional. Das simuliert
//   eine Konfiguration die teilweise ausgefuellt wurde.
//
// - Die Pruefung auf undefined (nicht !value) ist KRITISCH:
//   !0 === true → Ein Port von 0 wuerde als "fehlt" gewertet!
//   0 === undefined → false → Port 0 wird korrekt als "vorhanden" erkannt
//
// - ?? vs || bei Defaults:
//   port || 3000   → Port 0 wird zu 3000 (FALSCH!)
//   port ?? 3000   → Port 0 bleibt 0 (RICHTIG!)
//
// - Das ist ein KLASSISCHER Bug in vielen Projekten.
//   Die TypeScript-Regel: Verwende ?? fuer null/undefined Checks,
//   || nur wenn du auch 0, "" und false als "falsch" behandeln willst.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

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
  "2b: Klassisches Gleitkomma-Problem"
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
console.assert(istGueltigeMethode("GET") === true, "4a: GET gueltig");
console.assert(istGueltigeMethode("PATCH") === true, "4b: PATCH gueltig");
console.assert(istGueltigeMethode("YOLO") === false, "4c: YOLO ungueltig");
console.assert(HTTP_METHODS.length === 5, "4d: 5 Methoden");

beispiel("GET");
beispiel("OPTIONS");

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
console.assert(ungueltig === null, "5e: Fehlende Pflichtfelder");

console.log("\nAlle Tests bestanden! Hervorragend!");
