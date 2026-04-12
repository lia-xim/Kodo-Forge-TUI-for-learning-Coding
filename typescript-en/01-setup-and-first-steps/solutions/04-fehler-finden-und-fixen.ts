// ============================================================
// Loesung 04: Fehler finden und fixen
// ============================================================
//
// Hier sind die Loesungen mit ausfuehrlichen Erklaerungen
// zu jedem Bug.
//
// Ausfuehren mit: tsx solutions/04-fehler-finden-und-fixen.ts
// ============================================================

console.log("=== Loesung 04: Fehler finden und fixen ===\n");

// -----------------------------------------------------------
// Bug 1: Das Null-Problem
// -----------------------------------------------------------
//
// Problem: getUserById gibt User | undefined zurueck.
// Wenn der User nicht existiert, ist er undefined, und
// user.name crasht mit "Cannot read property 'name' of undefined".
//
// Loesung: Optional Chaining oder Fallback-Wert.
//
// LERNPUNKT: Das ist genau der Fehler, den strictNullChecks findet!
// Ohne strictNullChecks wuerde TypeScript keinen Fehler melden,
// und der Code wuerde zur Laufzeit crashen.

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

// FIX: Pruefe ob der User existiert
const user = getUserById(999);
const greeting = user ? `Hallo ${user.name}!` : "Hallo Unbekannter!";

// Alternative Loesungen:
// 1. Optional Chaining mit Nullish Coalescing:
//    const greeting = `Hallo ${user?.name ?? "Unbekannter"}!`;
//
// 2. If-Block:
//    let greeting: string;
//    if (user) {
//      greeting = `Hallo ${user.name}!`;
//    } else {
//      greeting = "Hallo Unbekannter!";
//    }
//
// 3. Non-null Assertion (UNSICHER! Nur wenn du 100% sicher bist):
//    const greeting = `Hallo ${user!.name}!`;
//    (Das verschiebt das Problem nur -- wenn user undefined ist, crasht es)

console.assert(typeof greeting === "string", "greeting sollte ein String sein");
console.log(`  Bug 1: ${greeting}`);
console.log("  Bug 1: OK\n");

// -----------------------------------------------------------
// Bug 2: Das Schnittstellen-Problem
// -----------------------------------------------------------
//
// Probleme:
// 1. port: "3000" ist ein String statt number
// 2. ssl fehlt komplett
// 3. maxConnectins ist ein Tippfehler (muss maxConnections heissen)
// 4. logging-Block fehlt komplett
//
// LERNPUNKT: TypeScript findet ALLE diese Fehler!
// - Falscher Typ (string statt number)
// - Fehlende Properties (ssl, logging)
// - Tippfehler in Property-Namen (maxConnectins vs maxConnections)
//
// In JavaScript wuerdest du diese Fehler erst zur Laufzeit finden,
// wenn config.logging.level undefined ist und etwas kaputtgeht.

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

// FIX: Alle Properties korrekt setzen
const config: Konfiguration = {
  server: {
    host: "localhost",
    port: 3000,       // FIX: number statt string
    ssl: true,        // FIX: fehlte komplett
  },
  datenbank: {
    url: "postgres://localhost:5432/mydb",
    maxConnections: 10,  // FIX: Tippfehler korrigiert
  },
  logging: {            // FIX: fehlte komplett
    level: "info",
    datei: "app.log",
  },
};

console.assert(config.server.port === 3000, "port sollte eine number sein");
console.assert(config.server.ssl === true || config.server.ssl === false, "ssl muss boolean sein");
console.assert(config.datenbank.maxConnections === 10, "maxConnections muss existieren");
console.assert(config.logging.level !== undefined, "logging.level muss existieren");
console.log("  Bug 2: Konfiguration korrekt!");
console.log("  Bug 2: OK\n");

// -----------------------------------------------------------
// Bug 3: Die Funktionssignatur
// -----------------------------------------------------------
//
// Problem: Die Funktion akzeptiert JEDE number -- auch negative
// Preise und Rabatte ueber 100%.
//
// Loesung: Laufzeit-Pruefungen sind bereits vorhanden (throw Error).
// TypeScript kann mit einfachen Typen KEINE Wertebereiche einschraenken.
//
// LERNPUNKT: Das ist eine fundamentale Einschraenkung von TypeScript:
// Das Typsystem kennt "number", aber nicht "positive number" oder
// "number between 0 and 100". Man KANN das mit Branded Types loesen
// (fortgeschrittenes Thema), aber die Laufzeit-Pruefungen braucht
// man trotzdem!
//
// Branded Types (Vorschau auf spaetere Lektionen):
//
//   type PositiveNumber = number & { __brand: "positive" };
//   function asPositive(n: number): PositiveNumber {
//     if (n < 0) throw new Error("Muss positiv sein");
//     return n as PositiveNumber;
//   }
//   function berechneRabatt(preis: PositiveNumber, rabatt: Percent): number { ... }
//
// Das ist aber eher ein Workaround als eine echte Loesung.

function berechneRabatt(preis: number, rabattProzent: number): number {
  if (preis < 0) throw new Error("Preis darf nicht negativ sein");
  if (rabattProzent < 0 || rabattProzent > 100) {
    throw new Error("Rabatt muss zwischen 0 und 100 liegen");
  }
  return preis * (1 - rabattProzent / 100);
}

console.assert(berechneRabatt(100, 10) === 90, "100 mit 10% Rabatt = 90");
console.assert(berechneRabatt(50, 0) === 50, "50 mit 0% Rabatt = 50");
console.log("  Bug 3: Rabatt-Berechnung korrekt!");
console.log("  Bug 3: OK\n");

// -----------------------------------------------------------
// Bug 4: Array-Operationen
// -----------------------------------------------------------
//
// Probleme:
// 1. Das Array enthaelt "drei" (string) und null -- nicht number!
// 2. ergebnis ist als string deklariert, aber summe() gibt number zurueck
//
// LERNPUNKT: Ein Array vom Typ number[] kann NUR numbers enthalten.
// TypeScript verhindert, dass du Strings oder null reinmischst.
// Das ist eine der staerksten Garantien des Typsystems.

// FIX: Nur echte Zahlen im Array, und korrekter Typ fuer ergebnis
const zahlen: number[] = [1, 2, 3, 4, 6];  // "drei" und null entfernt, 3 hinzugefuegt

function summe(werte: number[]): number {
  return werte.reduce((acc, val) => acc + val, 0);
}

const ergebnis: number = summe(zahlen);  // FIX: number statt string

console.assert(typeof ergebnis === "number", "ergebnis sollte eine number sein");
// Summe ist jetzt: 1 + 2 + 3 + 4 + 6 = 16
console.assert(ergebnis === 16, `Summe sollte 16 sein, ist ${ergebnis}`);
console.log(`  Bug 4: Summe = ${ergebnis}`);
console.log("  Bug 4: OK\n");

// -----------------------------------------------------------
// Bug 5: Das Vererbungsproblem (Bonus)
// -----------------------------------------------------------
//
// Problem: instanceof funktioniert nicht mit Interfaces!
// Interfaces existieren zur Laufzeit nicht (Type Erasure).
//
// Loesung: Nutze "Type Guards" mit Property Checking.
// Pruefe, ob das Objekt ein Property hat, das nur bei
// einem bestimmten Typ vorkommt.
//
// LERNPUNKT: Das ist eine direkte Konsequenz von Type Erasure.
// In Java oder C# koenntest du instanceof mit Interfaces nutzen,
// weil sie zur Laufzeit existieren. In TypeScript nicht.
//
// Alternative Loesungen:
// 1. Discriminated Unions (empfohlen fuer komplexe Faelle)
// 2. Klassen statt Interfaces (wenn OOP passt)
// 3. Property-basierte Type Guards (was wir hier tun)

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

// Type Guards: Pruefe Properties statt instanceof
function istHund(tier: Tier): tier is Hund {
  return "rasse" in tier;
}

function istKatze(tier: Tier): tier is Katze {
  return "indoor" in tier;
}

function beschreibeTier(tier: Tier): string {
  // FIX: Property-basierte Type Guards statt instanceof
  if (istHund(tier)) {
    // TypeScript weiss jetzt: tier ist Hund (wegen "tier is Hund")
    return `${tier.name} ist ein Hund der Rasse ${tier.rasse}`;
  }
  if (istKatze(tier)) {
    // TypeScript weiss jetzt: tier ist Katze
    return `${tier.name} ist eine ${tier.indoor ? "Haus" : "Streuner"}katze`;
  }
  return `${tier.name} macht ${tier.laut}`;
}

const bello: Hund = { name: "Bello", laut: "Wuff", rasse: "Labrador" };
const minka: Katze = { name: "Minka", laut: "Miau", indoor: true };

console.assert(beschreibeTier(bello).includes("Labrador"), "Bello sollte als Hund erkannt werden");
console.assert(beschreibeTier(minka).includes("Haus"), "Minka sollte als Katze erkannt werden");
console.log(`  Bug 5: ${beschreibeTier(bello)}`);
console.log(`  Bug 5: ${beschreibeTier(minka)}`);
console.log("  Bug 5: OK\n");

// -----------------------------------------------------------
console.log("=== Alle Bugs gefixt! ===\n");
console.log("Zusammenfassung der Lektionen:");
console.log("  Bug 1: strictNullChecks schuetzt vor undefined-Zugriff");
console.log("  Bug 2: TypeScript findet fehlende Properties UND Tippfehler");
console.log("  Bug 3: Wertebereiche kann TypeScript nicht pruefen (nur Typen)");
console.log("  Bug 4: Strenge Array-Typen verhindern gemischte Datentypen");
console.log("  Bug 5: Interfaces existieren nicht zur Laufzeit (Type Erasure)");
