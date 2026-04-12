/**
 * Lektion 02 - Example 03: any vs unknown
 *
 * Ausfuehren mit: npx tsx examples/03-any-vs-unknown.ts
 *
 * Dies ist vielleicht das WICHTIGSTE Beispiel in dieser Lektion.
 * Der Unterschied zwischen any und unknown entscheidet darueber,
 * ob dein TypeScript-Code sicher ist oder nur "TypeScript mit extra Schritten".
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 1: any — der gefaehrliche Weg
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== TEIL 1: any — der gefaehrliche Weg ===\n");

// any akzeptiert ALLES — keine Fehlermeldung, nie
let gefaehrlich: any = "Ich bin ein String";
gefaehrlich = 42;
gefaehrlich = true;
gefaehrlich = { name: "Max" };
gefaehrlich = [1, 2, 3];
gefaehrlich = null;

// any erlaubt ALLE Operationen — auch wenn sie unsinnig sind
gefaehrlich = "hallo";
// Diese Zeilen wuerden zur Laufzeit crashen, aber TypeScript sagt nichts:
// gefaehrlich.foo.bar.baz;     // Runtime: Cannot read properties of undefined
// gefaehrlich();                // Runtime: gefaehrlich is not a function
// new gefaehrlich();            // Runtime: gefaehrlich is not a constructor

// ─── DAS GROESSTE PROBLEM: any ist ANSTECKEND ──────────────────────────────

console.log("--- any ist ansteckend ---");

let quelle: any = { name: "Max", alter: 25 };

// Alles was aus any kommt, ist wieder any!
let name1 = quelle.name;     // Typ: any (nicht string!)
let alter = quelle.alter;     // Typ: any (nicht number!)
let gibtsNicht = quelle.xyz;  // Typ: any (kein Error!)

// Und so breitet sich any durch deinen Code aus:
let laenge = name1.length;     // any
let ergebnis = laenge + 1;     // any
let text = ergebnis.toString(); // any

// Die GESAMTE Kette ist jetzt unkontrolliert.
// TypeScript kann keine einzige Fehlermeldung mehr geben.

console.log(`name1: ${name1} (TypeScript denkt: any)`);
console.log(`alter: ${alter} (TypeScript denkt: any)`);

// ─── SICHERHEITSPROBLEM MIT any ────────────────────────────────────────────

console.log("\n--- Sicherheitsproblem ---");

// Stell dir vor, du empfaengst Daten von einer API:
function verarbeiteBenutzer_UNSICHER(data: any): void {
  // Kein einziger Check — alles wird blind vertraut:
  console.log(`Name: ${data.name}`);
  console.log(`Email: ${data.email}`);
  console.log(`Admin: ${data.isAdmin}`);

  // Was wenn ein Angreifer das hier sendet?
  // { name: "<script>alert('XSS')</script>", isAdmin: true }
  // TypeScript kann uns nicht warnen!
}

// Sieht aus wie ein normaler Aufruf — aber die Daten koennten alles sein:
verarbeiteBenutzer_UNSICHER({ name: "Max", email: "max@test.de", isAdmin: false });

// Gefaehrlich: Auch das kompiliert ohne Fehler:
// (Wir fangen die Laufzeitfehler mit try-catch, um den Rest des Beispiels zu zeigen)
try { verarbeiteBenutzer_UNSICHER("Das ist gar kein Objekt!"); } catch (e) {
  console.log(`  → Laufzeitfehler bei String: ${(e as Error).message}`);
}
try { verarbeiteBenutzer_UNSICHER(42); } catch (e) {
  console.log(`  → Laufzeitfehler bei Number: ${(e as Error).message}`);
}
try { verarbeiteBenutzer_UNSICHER(null); } catch (e) {
  console.log(`  → Laufzeitfehler bei null: ${(e as Error).message}`);
}
// TypeScript hat bei KEINEM dieser Aufrufe gewarnt — das ist das Problem mit any!

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: unknown — der sichere Weg
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 2: unknown — der sichere Weg ===\n");

// unknown akzeptiert auch alles bei der Zuweisung:
let sicher: unknown = "Ich bin ein String";
sicher = 42;
sicher = true;
sicher = { name: "Max" };
// Soweit identisch mit any.

// ABER: Du kannst mit unknown NICHTS machen ohne zu pruefen!
// sicher.name;       // Error! 'sicher' is of type 'unknown'
// sicher.toString(); // Error!
// sicher + 1;        // Error!
// sicher();          // Error!

// ─── TYPE NARROWING — der Schluessel zu unknown ────────────────────────────

console.log("--- Type Narrowing mit typeof ---");

// typeof-Pruefungen machen unknown sicher:
function verarbeite(wert: unknown): string {
  if (typeof wert === "string") {
    // Hier weiss TypeScript: wert ist string
    return `String mit Laenge ${wert.length}: "${wert}"`;
  }
  if (typeof wert === "number") {
    // Hier weiss TypeScript: wert ist number
    return `Zahl: ${wert.toFixed(2)}`;
  }
  if (typeof wert === "boolean") {
    // Hier weiss TypeScript: wert ist boolean
    return `Boolean: ${wert ? "wahr" : "falsch"}`;
  }
  if (wert === null) {
    return "Null-Wert";
  }
  if (typeof wert === "undefined") {
    return "Undefined";
  }
  return `Unbekannter Typ: ${typeof wert}`;
}

console.log(verarbeite("Hallo"));     // String mit Laenge 5: "Hallo"
console.log(verarbeite(3.14159));      // Zahl: 3.14
console.log(verarbeite(true));         // Boolean: wahr
console.log(verarbeite(null));         // Null-Wert
console.log(verarbeite(undefined));    // Undefined
console.log(verarbeite({ x: 1 }));    // Unbekannter Typ: object

// ─── SICHERE BENUTZER-VERARBEITUNG ─────────────────────────────────────────

console.log("\n--- Sichere Benutzer-Verarbeitung ---");

interface Benutzer {
  name: string;
  email: string;
  isAdmin: boolean;
}

// Type Guard: Prueft ob ein Wert ein gueltiger Benutzer ist
function istBenutzer(data: unknown): data is Benutzer {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string" &&
    "email" in data &&
    typeof (data as Record<string, unknown>).email === "string" &&
    "isAdmin" in data &&
    typeof (data as Record<string, unknown>).isAdmin === "boolean"
  );
}

function verarbeiteBenutzer_SICHER(data: unknown): void {
  if (!istBenutzer(data)) {
    console.log("ABGELEHNT: Ungueltige Daten empfangen!");
    return;
  }

  // Hier weiss TypeScript: data ist Benutzer
  console.log(`Name: ${data.name}`);
  console.log(`Email: ${data.email}`);
  console.log(`Admin: ${data.isAdmin}`);
}

// Korrekte Daten — funktioniert:
verarbeiteBenutzer_SICHER({ name: "Max", email: "max@test.de", isAdmin: false });

console.log();

// Falsche Daten — werden abgelehnt:
verarbeiteBenutzer_SICHER("Das ist gar kein Objekt!");
verarbeiteBenutzer_SICHER({ name: 42, email: null });
verarbeiteBenutzer_SICHER(null);

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 3: Praktischer Vergleich
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 3: Praktischer Vergleich ===\n");

// Simulierte API-Antwort (in der Realitaet: fetch, axios, usw.)
function simuliereApiAntwort(): unknown {
  // Koennte alles sein — unknown ist der ehrliche Typ dafuer
  return JSON.parse('{"temperatur": 22.5, "stadt": "Berlin"}');
}

// MIT any (gefaehrlich):
function zeigeWetter_UNSICHER(): void {
  const daten: any = simuliereApiAntwort();
  // TypeScript prueft NICHTS. Wenn die API ihr Format aendert → Laufzeitfehler
  console.log(`[UNSICHER] ${daten.stadt}: ${daten.temperatur}°C`);
}

// MIT unknown (sicher):
interface WetterDaten {
  temperatur: number;
  stadt: string;
}

function istWetterDaten(data: unknown): data is WetterDaten {
  return (
    typeof data === "object" &&
    data !== null &&
    "temperatur" in data &&
    typeof (data as Record<string, unknown>).temperatur === "number" &&
    "stadt" in data &&
    typeof (data as Record<string, unknown>).stadt === "string"
  );
}

function zeigeWetter_SICHER(): void {
  const daten: unknown = simuliereApiAntwort();

  if (!istWetterDaten(daten)) {
    console.log("[SICHER] API hat unerwartetes Format!");
    return;
  }

  // Hier ist TypeScript zufrieden UND wir sind sicher:
  console.log(`[SICHER] ${daten.stadt}: ${daten.temperatur}°C`);
}

zeigeWetter_UNSICHER();
zeigeWetter_SICHER();

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 4: Wann ist any (vielleicht) akzeptabel?
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 4: Wann any VIELLEICHT akzeptabel ist ===\n");

// 1. Bei der Migration von JavaScript zu TypeScript (temporaer!)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function alteLegacyFunktion(x: any): any {
  // TODO: Typen hinzufuegen bei naechster Gelegenheit
  return x;
}

// 2. In Type Assertions wo du es besser weisst als der Compiler
// (Selten und immer mit Kommentar warum!)
// Beispiel (funktioniert nur im Browser, nicht in Node.js):
//   const element = document.getElementById("app") as unknown as HTMLCanvasElement;
//   Besser als: document.getElementById("app") as any

// 3. Generische Utility-Typen (fortgeschritten)
// Manche Utility-Typen verwenden any intern — aber das ist ok
// weil die oeffentliche API typsicher ist.

console.log("Faustregel: Schreibe NIEMALS 'any' ohne einen");
console.log("Kommentar der erklaert WARUM es noetig ist.");

// ═══════════════════════════════════════════════════════════════════════════
// ZUSAMMENFASSUNG
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== ZUSAMMENFASSUNG ===\n");
console.log("any:     'Mir egal was es ist, lass mich in Ruhe'");
console.log("         → Kein Schutz, ansteckend, gefaehrlich");
console.log("");
console.log("unknown: 'Ich weiss nicht was es ist, also pruefe ich erst'");
console.log("         → Voller Schutz, erzwingt Pruefungen, sicher");
console.log("");
console.log("IMMER unknown bevorzugen. any nur als letzter Ausweg.");
console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
