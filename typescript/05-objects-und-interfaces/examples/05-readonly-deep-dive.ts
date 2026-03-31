export {};

/**
 * Lektion 05 - Beispiel 05: Readonly Deep Dive
 *
 * Themen:
 * - Readonly Properties
 * - Readonly ist shallow (verschachtelte Objekte sind noch mutable!)
 * - Utility Type: Readonly<T>
 * - DeepReadonly Pattern (Vorschau)
 * - Object.freeze vs readonly
 *
 * Ausfuehren: npx tsx examples/05-readonly-deep-dive.ts
 */

// ─── 1. Readonly Properties ───────────────────────────────────────────────

interface Benutzer {
  readonly id: number;
  readonly registriertAm: Date;
  name: string; // Nicht readonly -- kann geaendert werden
  email: string; // Nicht readonly -- kann geaendert werden
}

const benutzer: Benutzer = {
  id: 1,
  registriertAm: new Date("2024-01-01"),
  name: "Max",
  email: "max@test.de",
};

// Aenderbare Properties:
benutzer.name = "Maximilian";
benutzer.email = "maximilian@test.de";

// Readonly Properties -- Fehler:
// benutzer.id = 2;                    // Error: Cannot assign to 'id'
// benutzer.registriertAm = new Date();  // Error: Cannot assign to 'registriertAm'

console.log("=== Readonly Properties ===");
console.log(`ID: ${benutzer.id}, Name: ${benutzer.name}`);

// ─── 2. ACHTUNG: Readonly ist SHALLOW! ────────────────────────────────────

interface Firma {
  readonly name: string;
  readonly adresse: {
    strasse: string;
    stadt: string;
    plz: string;
  };
  readonly mitarbeiter: string[];
}

const firma: Firma = {
  name: "ACME GmbH",
  adresse: {
    strasse: "Hauptstrasse 1",
    stadt: "Berlin",
    plz: "10115",
  },
  mitarbeiter: ["Max", "Anna"],
};

console.log("\n=== Shallow Readonly ===");

// Die REFERENZ ist readonly, aber das verschachtelte Objekt ist MUTABLE:
// firma.name = "Andere GmbH";           // Fehler! readonly
// firma.adresse = { ... };              // Fehler! readonly (Referenz)

firma.adresse.strasse = "Neue Strasse 99"; // KEIN FEHLER! Verschachteltes Objekt!
firma.adresse.stadt = "Hamburg"; // KEIN FEHLER!

// Auch Arrays: Die Referenz ist readonly, der Inhalt nicht!
// firma.mitarbeiter = ["Neu"];           // Fehler! readonly (Referenz)
firma.mitarbeiter.push("Bob"); // KEIN FEHLER! Array-Inhalt!
firma.mitarbeiter[0] = "Maximilian"; // KEIN FEHLER!

console.log(`Adresse: ${firma.adresse.strasse}, ${firma.adresse.stadt}`);
console.log(`Mitarbeiter: ${firma.mitarbeiter.join(", ")}`);

// ─── 3. Utility Type: Readonly<T> ────────────────────────────────────────

// Readonly<T> macht ALLE Properties eines Typs readonly
interface Einstellungen {
  theme: string;
  sprache: string;
  schriftgroesse: number;
}

// Alle Properties sind jetzt readonly
const defaults: Readonly<Einstellungen> = {
  theme: "light",
  sprache: "de",
  schriftgroesse: 14,
};

// defaults.theme = "dark";        // Fehler! Alle Properties sind readonly
// defaults.sprache = "en";        // Fehler!
// defaults.schriftgroesse = 16;   // Fehler!

console.log("\n=== Readonly<T> Utility ===");
console.log("Defaults:", defaults);

// ACHTUNG: Readonly<T> ist AUCH shallow!
interface AppState {
  user: {
    name: string;
    settings: {
      theme: string;
    };
  };
}

const state: Readonly<AppState> = {
  user: {
    name: "Max",
    settings: { theme: "dark" },
  },
};

// state.user = { ... };              // Fehler! readonly
state.user.name = "Neuer Name"; // KEIN FEHLER! Nur oberste Ebene ist readonly
state.user.settings.theme = "light"; // KEIN FEHLER!

console.log(`State User: ${state.user.name}, Theme: ${state.user.settings.theme}`);

// ─── 4. DeepReadonly Pattern (Vorschau) ──────────────────────────────────

// Um ALLE Ebenen readonly zu machen, brauchen wir einen rekursiven Typ.
// Das ist ein Vorschau-Thema aus Lektion 16 (Mapped Types) und 23 (Recursive Types).

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K] // Funktionen nicht wrappen
      : DeepReadonly<T[K]>
    : T[K];
};

interface TiefVerschachtelt {
  level1: {
    level2: {
      level3: {
        wert: string;
      };
    };
  };
}

const tief: DeepReadonly<TiefVerschachtelt> = {
  level1: {
    level2: {
      level3: {
        wert: "tief drin",
      },
    },
  },
};

// ALLES ist jetzt readonly -- auf JEDER Ebene:
// tief.level1 = ...;                        // Fehler!
// tief.level1.level2 = ...;                 // Fehler!
// tief.level1.level2.level3 = ...;          // Fehler!
// tief.level1.level2.level3.wert = "neu";   // Fehler!

console.log("\n=== DeepReadonly ===");
console.log(`Tief verschachtelt: ${tief.level1.level2.level3.wert}`);

// ─── 5. Object.freeze vs readonly ────────────────────────────────────────

// readonly = NUR ZUR COMPILE-ZEIT! Zur Laufzeit hat es keinen Effekt.
// Object.freeze = ZUR LAUFZEIT! Das Objekt ist wirklich eingefroren.

console.log("\n=== Object.freeze vs readonly ===");

// readonly: Nur der Compiler prueft
const readonlyObj: Readonly<{ x: number; y: number }> = { x: 1, y: 2 };
// readonlyObj.x = 10;  // Compile-Error
// Aber zur Laufzeit: (readonlyObj as any).x = 10;  // Wuerde funktionieren!

// Object.freeze: Laufzeit-Schutz
const frozenObj = Object.freeze({ x: 1, y: 2 });
// frozenObj.x = 10;  // Compile-Error (TypeScript erkennt freeze!)
// Auch zur Laufzeit geschuetzt (im strict mode wird ein Error geworfen)

console.log("readonly Objekt:", readonlyObj);
console.log("frozen Objekt:", frozenObj);

// ACHTUNG: Object.freeze ist AUCH shallow!
const frozenNested = Object.freeze({
  name: "Test",
  inner: { value: 42 },
});

// frozenNested.name = "Neu";     // Fehler! (freeze)
frozenNested.inner.value = 99; // KEIN FEHLER! freeze ist shallow!

console.log(`Frozen nested value: ${frozenNested.inner.value}`); // 99

// ─── 6. Readonly in Funktionsparametern ──────────────────────────────────

// Readonly in Parametern signalisiert: "Diese Funktion aendert das Objekt nicht"

interface Punkt {
  x: number;
  y: number;
}

function berechneDistanz(a: Readonly<Punkt>, b: Readonly<Punkt>): number {
  // a.x = 0;  // Fehler! Readonly verhindert versehentliche Mutation
  // b.y = 0;  // Fehler!
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const p1: Punkt = { x: 0, y: 0 };
const p2: Punkt = { x: 3, y: 4 };

console.log("\n=== Readonly in Funktionsparametern ===");
console.log(`Distanz: ${berechneDistanz(p1, p2)}`);

// Du kannst mutable Objekte an Readonly-Parameter uebergeben (sichere Richtung)
// Aber NICHT umgekehrt:
const readonlyPunkt: Readonly<Punkt> = { x: 5, y: 5 };
// const mutablePunkt: Punkt = readonlyPunkt;  // OK in TS (aber konzeptionell fragwuerdig)

// ─── 7. Zusammenfassung ──────────────────────────────────────────────────

console.log("\n=== ZUSAMMENFASSUNG ===");
console.log("1. readonly = nur COMPILE-ZEIT Schutz");
console.log("2. readonly ist SHALLOW (oberste Ebene)");
console.log("3. Readonly<T> = alle Props einer Ebene readonly");
console.log("4. DeepReadonly<T> = alle Ebenen readonly (custom)");
console.log("5. Object.freeze = LAUFZEIT Schutz (auch shallow!)");
console.log("6. Readonly in Params = 'Ich aendere nichts'");
