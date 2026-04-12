export {};

/**
 * Lektion 05 - Beispiel 02: Interfaces
 *
 * Themen:
 * - Interface Deklaration
 * - Interfaces implementieren
 * - Interfaces erweitern (einfach und mehrfach)
 * - Declaration Merging (Vorschau)
 * - Interface vs Inline Object Type
 *
 * Ausfuehren: npx tsx examples/02-interfaces.ts
 */

// ─── 1. Interface Deklaration ──────────────────────────────────────────────

// Ein Interface beschreibt die Form eines Objekts
interface Fahrzeug {
  marke: string;
  modell: string;
  baujahr: number;
  farbe?: string; // Optional
  readonly fahrgestellNr: string; // Unveraenderlich
}

const meinAuto: Fahrzeug = {
  marke: "VW",
  modell: "Golf",
  baujahr: 2023,
  farbe: "Blau",
  fahrgestellNr: "WVW123456789",
};

console.log("=== Interface Deklaration ===");
console.log(`${meinAuto.marke} ${meinAuto.modell} (${meinAuto.baujahr})`);

// Interfaces koennen auch Methoden beschreiben
interface Tier {
  name: string;
  alter: number;
  lautGeben(): string; // Methoden-Signatur
  bewegen(richtung: string): void; // Methode mit Parameter
}

const hund: Tier = {
  name: "Bello",
  alter: 5,
  lautGeben() {
    return "Wuff!";
  },
  bewegen(richtung: string) {
    console.log(`${this.name} laeuft nach ${richtung}`);
  },
};

console.log(`${hund.name} sagt: ${hund.lautGeben()}`);
hund.bewegen("rechts");

// ─── 2. Interfaces als Vertraege ──────────────────────────────────────────

// Interfaces definieren einen "Vertrag" -- jedes Objekt, das den Vertrag
// erfuellt, ist kompatibel (Structural Typing!)

interface Loggable {
  log(): void;
}

// Verschiedene Objekte, die den gleichen Vertrag erfuellen:
const konsoleLogger: Loggable = {
  log() {
    console.log("[Konsole] Nachricht geloggt");
  },
};

const dateiLogger: Loggable = {
  log() {
    console.log("[Datei] Nachricht in Datei geschrieben");
  },
};

console.log("\n=== Interfaces als Vertraege ===");

// Funktion akzeptiert alles, was Loggable implementiert
function loggeNachricht(logger: Loggable): void {
  logger.log();
}

loggeNachricht(konsoleLogger);
loggeNachricht(dateiLogger);

// ─── 3. Interfaces erweitern (extends) ────────────────────────────────────

// Einfache Vererbung -- ein Interface erweitert ein anderes
interface Lebewesen {
  name: string;
  alter: number;
}

interface Haustier extends Lebewesen {
  besitzer: string;
  gechipt: boolean;
}

interface Hund extends Haustier {
  rasse: string;
  bellen(): string;
}

const rex: Hund = {
  name: "Rex",
  alter: 3,
  besitzer: "Maria",
  gechipt: true,
  rasse: "Schaeferhund",
  bellen() {
    return "Wuff wuff!";
  },
};

console.log("\n=== Einfache Vererbung ===");
console.log(`${rex.name} ist ein ${rex.rasse}, ${rex.alter} Jahre alt`);
console.log(`Besitzer: ${rex.besitzer}, Gechipt: ${rex.gechipt}`);

// ─── 4. Mehrfache Vererbung ───────────────────────────────────────────────

// Ein Interface kann mehrere andere Interfaces erweitern
interface Zeitstempel {
  erstelltAm: Date;
  geaendertAm: Date;
}

interface Identifizierbar {
  id: string;
}

interface Versioniert {
  version: number;
}

// BlogPost erbt von allen dreien!
interface BlogPost extends Zeitstempel, Identifizierbar, Versioniert {
  titel: string;
  inhalt: string;
  autor: string;
  tags: string[];
}

const post: BlogPost = {
  id: "post-001",
  erstelltAm: new Date("2025-01-15"),
  geaendertAm: new Date("2025-01-20"),
  version: 2,
  titel: "TypeScript Interfaces meistern",
  inhalt: "In diesem Post lernen wir...",
  autor: "Max",
  tags: ["typescript", "interfaces", "tutorial"],
};

console.log("\n=== Mehrfache Vererbung ===");
console.log(`Post: "${post.titel}" (v${post.version})`);
console.log(`Tags: ${post.tags.join(", ")}`);
console.log(`ID: ${post.id}`);

// ─── 5. Declaration Merging (Vorschau) ────────────────────────────────────

// Einzigartiges Feature: Interfaces koennen mehrfach deklariert werden.
// Die Deklarationen werden automatisch zusammengefuehrt!

interface Einstellungen {
  sprache: string;
  darkMode: boolean;
}

// Spaeter im Code (oder in einer anderen Datei):
interface Einstellungen {
  schriftgroesse: number;
  benachrichtigungen: boolean;
}

// Jetzt hat Einstellungen ALLE Properties aus beiden Deklarationen!
const meineEinstellungen: Einstellungen = {
  sprache: "de",
  darkMode: true,
  schriftgroesse: 16,
  benachrichtigungen: false,
};

console.log("\n=== Declaration Merging ===");
console.log("Einstellungen:", meineEinstellungen);

// Praktischer Anwendungsfall: Globale Typen erweitern
// (z.B. Window um eigene Properties erweitern -- geht nur mit interface!)

// WICHTIG: Mit 'type' geht Declaration Merging NICHT!
// type Einstellungen = { sprache: string; };
// type Einstellungen = { darkMode: boolean; };  // FEHLER: Duplicate identifier

// ─── 6. Interface vs Inline Object Type ───────────────────────────────────

console.log("\n=== Interface vs Inline ===");

// Inline -- gut fuer einmalige Verwendung
function formatiere(daten: { wert: number; einheit: string }): string {
  return `${daten.wert} ${daten.einheit}`;
}

// Interface -- gut fuer wiederverwendbare Strukturen
interface Messwert {
  wert: number;
  einheit: string;
  zeitstempel?: Date;
}

function formatiereMesswert(m: Messwert): string {
  const zeit = m.zeitstempel ? ` (${m.zeitstempel.toLocaleString()})` : "";
  return `${m.wert} ${m.einheit}${zeit}`;
}

// Beide funktionieren -- das Interface gibt aber bessere Fehlermeldungen
// und kann erweitert werden
console.log(formatiere({ wert: 23.5, einheit: "°C" }));
console.log(
  formatiereMesswert({
    wert: 1013,
    einheit: "hPa",
    zeitstempel: new Date(),
  })
);

// ─── 7. Interfaces mit Funktions-Signaturen ──────────────────────────────

// Interfaces koennen auch Funktionstypen beschreiben
interface Vergleicher<T> {
  (a: T, b: T): number;
}

const zahlenVergleich: Vergleicher<number> = (a, b) => a - b;
const stringVergleich: Vergleicher<string> = (a, b) => a.localeCompare(b);

console.log("\n=== Funktions-Interface ===");
console.log("Zahlen sortiert:", [3, 1, 4, 1, 5].sort(zahlenVergleich));
console.log(
  "Strings sortiert:",
  ["Banane", "Apfel", "Kirsche"].sort(stringVergleich)
);
