export {};

/**
 * Lektion 05 - Beispiel 04: Index Signatures
 *
 * Themen:
 * - Grundlegende Index Signatures
 * - Index Signatures mit spezifischen Properties
 * - Record<K,V> als Alternative
 * - Verschachtelte Index Signatures
 * - Praktisch: Dictionary/Map typisieren
 *
 * Ausfuehren: npx tsx examples/04-index-signatures.ts
 */

// ─── 1. Grundlegende Index Signatures ──────────────────────────────────────

// Wenn du nicht alle Property-Namen im Voraus kennst,
// verwende eine Index Signature:

interface Woerterbuch {
  [wort: string]: string; // Jeder String-Key hat einen String-Wert
}

const deEnglisch: Woerterbuch = {
  hallo: "hello",
  welt: "world",
  katze: "cat",
  hund: "dog",
};

console.log("=== Grundlegende Index Signature ===");
console.log(`hallo = ${deEnglisch["hallo"]}`);
console.log(`katze = ${deEnglisch["katze"]}`);

// Du kannst beliebige Keys hinzufuegen:
deEnglisch["baum"] = "tree";
deEnglisch["auto"] = "car";
console.log(`Neue Eintraege: baum = ${deEnglisch["baum"]}`);

// ACHTUNG: Zugriff auf nicht existierende Keys gibt undefined zurueck,
// aber TypeScript denkt, es waere string!
console.log(`Gibt es 'xyz'? ${deEnglisch["xyz"]}`); // undefined, aber Typ ist string!

// Mit noUncheckedIndexedAccess in tsconfig wuerde der Typ string | undefined sein.

// ─── 2. Numerische Index Signatures ───────────────────────────────────────

// Auch numerische Keys sind moeglich
interface StringArray {
  [index: number]: string;
}

const farben: StringArray = ["rot", "gruen", "blau"];

console.log("\n=== Numerische Index Signature ===");
console.log(`Farbe 0: ${farben[0]}`);
console.log(`Farbe 2: ${farben[2]}`);

// ─── 3. Index Signatures mit spezifischen Properties ──────────────────────

// Du kannst feste Properties mit einer Index Signature kombinieren.
// WICHTIG: Der Typ der festen Properties muss zum Index-Typ passen!

interface Konfiguration {
  // Feste Properties
  appName: string;
  version: string;
  // Index Signature fuer beliebige weitere String-Werte
  [key: string]: string;
}

const appConfig: Konfiguration = {
  appName: "MeineApp",
  version: "1.0.0",
  author: "Max",
  license: "MIT",
};

console.log("\n=== Feste + dynamische Properties ===");
console.log(`App: ${appConfig.appName} v${appConfig.version}`);
console.log(`Autor: ${appConfig["author"]}`);

// Problem: Was wenn feste Properties verschiedene Typen haben?
interface GemischteConfig {
  name: string;
  port: number;
  // [key: string]: string;  // FEHLER! 'port: number' passt nicht zu string

  // Loesung: Union-Typ in der Index Signature
  [key: string]: string | number;
}

const serverConfig: GemischteConfig = {
  name: "API Server",
  port: 3000,
  host: "localhost",
  timeout: 5000,
};

console.log(`Server: ${serverConfig.name}:${serverConfig.port}`);

// ─── 4. Record<K,V> als Alternative ──────────────────────────────────────

// Record ist ein Utility Type, das oft eleganter ist als Index Signatures

// Statt Index Signature:
interface Punkte {
  [spieler: string]: number;
}

// Mit Record:
type PunkteRecord = Record<string, number>;

const spielstand: PunkteRecord = {
  alice: 42,
  bob: 38,
  charlie: 55,
};

console.log("\n=== Record<K,V> ===");
for (const [spieler, punkte] of Object.entries(spielstand)) {
  console.log(`${spieler}: ${punkte} Punkte`);
}

// Record mit Union-Keys -- erzwingt, dass ALLE Keys vorhanden sind!
type Ampelfarbe = "rot" | "gelb" | "gruen";
type AmpelBedeutung = Record<Ampelfarbe, string>;

const ampel: AmpelBedeutung = {
  rot: "Stopp",
  gelb: "Achtung",
  gruen: "Fahren",
  // Alle drei MUESSEN vorhanden sein! Fehlt einer, gibt es einen Fehler.
};

console.log("\nAmpel:", ampel);

// ─── 5. Verschachtelte Index Signatures ──────────────────────────────────

// Index Signatures koennen verschachtelt werden
interface SprachDatei {
  [namespace: string]: {
    [key: string]: string;
  };
}

const uebersetzungen: SprachDatei = {
  common: {
    hello: "Hallo",
    goodbye: "Tschuess",
    yes: "Ja",
    no: "Nein",
  },
  errors: {
    notFound: "Nicht gefunden",
    forbidden: "Zugriff verweigert",
    serverError: "Serverfehler",
  },
  buttons: {
    submit: "Absenden",
    cancel: "Abbrechen",
    delete: "Loeschen",
  },
};

console.log("\n=== Verschachtelte Index Signatures ===");
console.log(`common.hello: ${uebersetzungen["common"]["hello"]}`);
console.log(`errors.notFound: ${uebersetzungen["errors"]["notFound"]}`);

// ─── 6. Praktisches Beispiel: Typsicherer Cache ─────────────────────────

interface CacheEintrag<T> {
  wert: T;
  ablaufzeit: number;
  erstelltAm: Date;
}

interface AppCache<T> {
  [schluessel: string]: CacheEintrag<T>;
}

const benutzerCache: AppCache<{ name: string; email: string }> = {
  "user-1": {
    wert: { name: "Max", email: "max@test.de" },
    ablaufzeit: 3600,
    erstelltAm: new Date(),
  },
  "user-2": {
    wert: { name: "Anna", email: "anna@test.de" },
    ablaufzeit: 3600,
    erstelltAm: new Date(),
  },
};

console.log("\n=== Typsicherer Cache ===");
console.log(`User 1: ${benutzerCache["user-1"].wert.name}`);
console.log(`User 2: ${benutzerCache["user-2"].wert.email}`);

// ─── 7. Index Signatures vs. Map ────────────────────────────────────────

// Fuer Laufzeit-Dictionaries ist Map oft besser als ein Plain Object:

const mapDict = new Map<string, number>();
mapDict.set("alice", 42);
mapDict.set("bob", 38);

console.log("\n=== Map vs Index Signature ===");
console.log(`alice (Map): ${mapDict.get("alice")}`);
// Map.get() gibt T | undefined zurueck -- korrekterweise!
// Bei Index Signatures musst du noUncheckedIndexedAccess aktivieren fuer das gleiche.

// Vorteile von Map gegenueber Index Signatures:
// - .get() gibt korrekt T | undefined zurueck
// - .size Property
// - Beliebige Key-Typen (nicht nur string/number/symbol)
// - Bessere Performance bei haeufigem Hinzufuegen/Loeschen
// - Iterationsreihenfolge garantiert (Einfuegereihenfolge)
