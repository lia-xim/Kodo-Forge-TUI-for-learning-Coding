// ============================================================
// Uebung 04: Fehler finden und fixen
// ============================================================
//
// In dieser Uebung bekommst du fehlerhaften TypeScript-Code.
// Dein Job:
//   1. Finde den Fehler (oder die Fehler)
//   2. Verstehe WARUM es ein Fehler ist
//   3. Fixe ihn so, dass der Code sicher und korrekt ist
//
// WICHTIG: Entferne die @ts-expect-error-Kommentare NICHT!
// Stattdessen fixe den Code darunter, sodass der
// @ts-expect-error selbst zum Fehler wird (weil der Code
// keinen Fehler mehr hat). Dann entferne @ts-expect-error.
//
// Ausfuehren mit: tsx exercises/04-fehler-finden-und-fixen.ts
// ============================================================

console.log("=== Uebung 04: Fehler finden und fixen ===\n");

// -----------------------------------------------------------
// Bug 1: Das Null-Problem
// -----------------------------------------------------------
//
// Diese Funktion holt einen Benutzer aus einer "Datenbank".
// Manchmal existiert der Benutzer nicht.
// Der Code crashed zur Laufzeit -- warum?
//
// Dein Fix: Mache den Code null-sicher, OHNE die Funktion
// getUserById zu aendern.

interface User {
  id: number;
  name: string;
  email: string;
}

function getUserById(id: number): User | undefined {
  const users: User[] = [
    { id: 1, name: "Anna", email: "anna@example.com" },
    { id: 2, name: "Ben", email: "ben@example.com" },
  ];
  return users.find(u => u.id === id);
}

// TODO: Fixe diesen Code. Aktuell wuerde er bei id=999 crashen.
// @ts-expect-error — fixe den Code, sodass dieser Fehler verschwindet
const user = getUserById(999);
const greeting = `Hallo ${user.name}!`;  // <-- Problem: user koennte undefined sein!

// Nach deinem Fix sollte greeting ein sinnvoller String sein,
// auch wenn der User nicht existiert.
// @ts-expect-error
console.assert(typeof greeting === "string", "greeting sollte ein String sein");
console.log(`  Bug 1: ${greeting}`);
console.log("  Bug 1: OK\n");

// -----------------------------------------------------------
// Bug 2: Das Schnittstellen-Problem
// -----------------------------------------------------------
//
// Ein Kollege hat dieses Interface geschrieben und ein Objekt
// erstellt. Aber es fehlen Properties und es gibt Tippfehler.
//
// Dein Fix: Korrigiere das Objekt, NICHT das Interface.

interface Konfiguration {
  server: {
    host: string;
    port: number;
    ssl: boolean;
  };
  datenbank: {
    url: string;
    maxConnections: number;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    datei: string;
  };
}

// TODO: Fixe dieses Objekt -- es hat fehlende Properties UND Tippfehler
// @ts-expect-error — fixe das Objekt
const config: Konfiguration = {
  server: {
    host: "localhost",
    port: "3000",     // <-- Falscher Typ!
    // ssl fehlt!
  },
  datenbank: {
    url: "postgres://localhost:5432/mydb",
    maxConnectins: 10,  // <-- Tippfehler!
  },
  // logging fehlt komplett!
};

// @ts-expect-error
console.assert(config.server.port === 3000, "port sollte eine number sein");
// @ts-expect-error
console.assert(config.server.ssl === true || config.server.ssl === false, "ssl muss boolean sein");
// @ts-expect-error
console.assert(config.datenbank.maxConnections === 10, "maxConnections muss existieren");
// @ts-expect-error
console.assert(config.logging.level !== undefined, "logging.level muss existieren");
console.log("  Bug 2: Konfiguration korrekt!");
console.log("  Bug 2: OK\n");

// -----------------------------------------------------------
// Bug 3: Die Funktionssignatur
// -----------------------------------------------------------
//
// Diese Funktion soll Preise berechnen. Aber die Signatur
// ist zu lax -- sie erlaubt Inputs die keinen Sinn machen.
//
// Dein Fix: Verschaerfe die Typen so, dass unsinnige Aufrufe
// vom Compiler abgelehnt werden.

// BEVOR du codest -- erklaere kurz:
// 1. Was ist das Problem mit der aktuellen Signatur? ___
// 2. Kann TypeScript Wertebereiche (z.B. 0-100) mit
//    einfachen Typen einschraenken? ___
// 3. Was ist der Unterschied zwischen Compile-Zeit-Sicherheit
//    und Laufzeit-Sicherheit? ___

// TODO: Verbessere die Funktionssignatur
function berechneRabatt(preis: number, rabattProzent: number): number {
  if (preis < 0) throw new Error("Preis darf nicht negativ sein");
  if (rabattProzent < 0 || rabattProzent > 100) {
    throw new Error("Rabatt muss zwischen 0 und 100 liegen");
  }
  return preis * (1 - rabattProzent / 100);
}

// Diese Aufrufe sollten funktionieren:
console.assert(berechneRabatt(100, 10) === 90, "100 mit 10% Rabatt = 90");
console.assert(berechneRabatt(50, 0) === 50, "50 mit 0% Rabatt = 50");

// CHALLENGE: Kannst du den Typ so aendern, dass negative Preise
// oder Rabatte > 100 vom COMPILER abgelehnt werden, nicht nur
// zur Laufzeit? (Tipp: Das ist mit einfachen Typen nicht moeglich.
// Notiere deine Gedanken als Kommentar.)

// Dein Kommentar hier:
// ...

console.log("  Bug 3: Rabatt-Berechnung korrekt!");
console.log("  Bug 3: OK\n");

// -----------------------------------------------------------
// Bug 4: Array-Operationen
// -----------------------------------------------------------
//
// Dieser Code versucht, ein Array von Zahlen zu verarbeiten.
// Aber er hat mehrere Typ-Probleme.

// BEVOR du codest -- erklaere kurz:
// 1. Wie viele Fehler siehst du im Code unten? ___
// 2. Was darf in einem `number[]` Array stehen? ___
// 3. Welchen Typ gibt die Funktion zurueck vs. welchen Typ
//    hat die Variable `ergebnis`? ___

// TODO: Fixe die Typ-Probleme
// @ts-expect-error
const zahlen: number[] = [1, 2, "drei", 4, null, 6];

// @ts-expect-error
function summe(werte: number[]): number {
  return werte.reduce((acc, val) => acc + val, 0);
}

// @ts-expect-error
const ergebnis: string = summe(zahlen);  // <-- Falscher Typ fuer ergebnis!

// @ts-expect-error
console.assert(typeof ergebnis === "number", "ergebnis sollte eine number sein");
// @ts-expect-error
console.assert(typeof ergebnis === "number" && ergebnis > 0, "Summe sollte eine positive Zahl sein");
console.log(`  Bug 4: Summe = ${ergebnis}`);
console.log("  Bug 4: OK\n");

// -----------------------------------------------------------
// Bug 5: Das Vererbungsproblem (Bonus)
// -----------------------------------------------------------
//
// Ein Kollege hat versucht, instanceof mit einem Interface zu
// nutzen. Das funktioniert nicht. Warum? Und wie fixst du es?
//
// Dein Fix: Erstelle eine Loesung, die zur Laufzeit funktioniert.
// Du darfst das Interface aendern, eine Klasse hinzufuegen,
// oder einen Type Guard schreiben.

// BEVOR du codest -- erklaere kurz:
// 1. Warum funktioniert instanceof NICHT mit Interfaces? ___
//    (Tipp: Was passiert mit Interfaces bei der Kompilierung?)
// 2. Welche JavaScript-Alternativen gibt es, um den "Typ"
//    eines Objekts zur Laufzeit zu erkennen? ___
// 3. Was ist ein Type Guard und wie hilft er hier? ___

interface Tier {
  name: string;
  laut: string;
}

interface Hund extends Tier {
  rasse: string;
}

interface Katze extends Tier {
  indoor: boolean;
}

function beschreibeTier(tier: Tier): string {
  // TODO: Fixe diese Funktion. instanceof funktioniert nicht
  // mit Interfaces! Finde eine Alternative.
  //
  // Tipp: Nutze "Property Checking" -- pruefe ob bestimmte
  // Properties existieren, die nur Hunde oder Katzen haben.

  // @ts-expect-error — Interfaces existieren nicht zur Laufzeit!
  if (tier instanceof Hund) {
    return `${tier.name} ist ein Hund der Rasse ${tier.rasse}`;
  }
  // @ts-expect-error
  if (tier instanceof Katze) {
    return `${tier.name} ist eine ${tier.indoor ? "Haus" : "Streuner"}katze`;
  }
  return `${tier.name} macht ${tier.laut}`;
}

const bello: Hund = { name: "Bello", laut: "Wuff", rasse: "Labrador" };
const minka: Katze = { name: "Minka", laut: "Miau", indoor: true };

// @ts-expect-error
console.assert(beschreibeTier(bello).includes("Labrador"), "Bello sollte als Hund erkannt werden");
// @ts-expect-error
console.assert(beschreibeTier(minka).includes("Haus"), "Minka sollte als Katze erkannt werden");
console.log(`  Bug 5: ${beschreibeTier(bello)}`);
console.log(`  Bug 5: ${beschreibeTier(minka)}`);
console.log("  Bug 5: OK\n");

// -----------------------------------------------------------
console.log("=== Alle Bugs gefixt! Gut gemacht! ===");
