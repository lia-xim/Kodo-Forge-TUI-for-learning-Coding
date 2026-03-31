/**
 * Lektion 02 - Example 02: null und undefined
 *
 * Ausfuehren mit: npx tsx examples/02-null-und-undefined.ts
 *
 * JavaScript hat ZWEI Typen fuer "kein Wert". Das ist verwirrend,
 * aber TypeScript hilft uns, damit sicher umzugehen.
 */

// ─── DIE GRUNDLAGEN ─────────────────────────────────────────────────────────

// undefined = "wurde nie gesetzt" / "fehlt"
let nichtInitialisiert: string | undefined;
console.log(nichtInitialisiert);  // undefined

// null = "wurde bewusst auf leer gesetzt"
let bewusstLeer: string | null = null;
console.log(bewusstLeer);  // null

// Der historische typeof-Bug:
console.log(`typeof undefined: ${typeof undefined}`);  // "undefined"
console.log(`typeof null: ${typeof null}`);            // "object" ← Bug seit 1995!

// ─── STRICTNULLCHECKS IN AKTION ─────────────────────────────────────────────

// Mit strictNullChecks (unser Standard) schuetzt uns TypeScript:

function gibLaenge(text: string): number {
  // text ist GARANTIERT ein string — nie null oder undefined
  return text.length;
}

// gibLaenge(null);       // Error! Argument of type 'null' is not assignable
// gibLaenge(undefined);  // Error! Argument of type 'undefined' is not assignable
gibLaenge("Hallo");       // OK: 5

// Wenn null erlaubt sein soll, muss man es explizit deklarieren:
function gibLaengeSicher(text: string | null): number {
  if (text === null) {
    return 0;
  }
  // Hier weiss TypeScript: text ist string (nicht mehr null)
  return text.length;
}

console.log(`\nLaenge von "Hallo": ${gibLaengeSicher("Hallo")}`);  // 5
console.log(`Laenge von null: ${gibLaengeSicher(null)}`);            // 0

// ─── OPTIONALE PARAMETER vs NULL ────────────────────────────────────────────

console.log("\n--- Optional vs Null ---");

// Option 1: Optionaler Parameter (kann weggelassen werden)
function begruessung1(name?: string): string {
  // name ist: string | undefined
  return `Hallo, ${name ?? "Unbekannter"}!`;
}

console.log(begruessung1());          // "Hallo, Unbekannter!"
console.log(begruessung1("Max"));     // "Hallo, Max!"
console.log(begruessung1(undefined)); // "Hallo, Unbekannter!" — auch erlaubt

// Option 2: Explizit nullable (MUSS uebergeben werden)
function begruessung2(name: string | null): string {
  return `Hallo, ${name ?? "Unbekannter"}!`;
}

// begruessung2();        // Error! Expected 1 argument, got 0
console.log(begruessung2(null));    // "Hallo, Unbekannter!" — OK
console.log(begruessung2("Max"));   // "Hallo, Max!" — OK

// Option 3: Explizit string | undefined (MUSS uebergeben werden)
function begruessung3(name: string | undefined): string {
  return `Hallo, ${name ?? "Unbekannter"}!`;
}

// begruessung3();           // Error! Expected 1 argument, got 0
console.log(begruessung3(undefined));  // OK — muss aber explizit sein
console.log(begruessung3("Max"));      // OK

// ─── NULLISH COALESCING (??) vs LOGISCHES ODER (||) ────────────────────────

console.log("\n--- ?? vs || ---");

// Das Problem mit || :
const port1: number = 0 || 3000;   // 3000! Weil 0 "falsy" ist
const port2: number = 0 ?? 3000;   // 0! ?? prueft nur null/undefined

console.log(`|| mit 0: ${port1}`);  // 3000 (falsch, wir wollten 0!)
console.log(`?? mit 0: ${port2}`);  // 0 (korrekt!)

// Weitere Beispiele:
const text1: string = "" || "default";   // "default" — "" ist falsy
const text2: string = "" ?? "default";   // "" — ?? ignoriert leere Strings

console.log(`|| mit "": "${text1}"`);  // "default"
console.log(`?? mit "": "${text2}"`);  // ""

// FAUSTREGEL: Verwende ?? wenn du nur null/undefined abfangen willst
// Verwende || nur wenn du auch 0, "", false abfangen willst

// ─── OPTIONAL CHAINING (?.) ────────────────────────────────────────────────

console.log("\n--- Optional Chaining ---");

// Stell dir ein verschachteltes Objekt vor:
interface Adresse {
  strasse: string;
  hausnummer: number;
  zusatz?: string;
}

interface Benutzer {
  name: string;
  adresse?: Adresse;
}

const benutzer1: Benutzer = {
  name: "Max",
  adresse: {
    strasse: "Hauptstrasse",
    hausnummer: 42,
    zusatz: "Hinterhaus"
  }
};

const benutzer2: Benutzer = {
  name: "Anna",
  // Keine Adresse
};

// OHNE Optional Chaining (umstaendlich):
const zusatz1 = benutzer1.adresse !== undefined
  ? benutzer1.adresse.zusatz
  : undefined;

// MIT Optional Chaining (elegant):
const zusatz2 = benutzer1.adresse?.zusatz;     // "Hinterhaus"
const zusatz3 = benutzer2.adresse?.zusatz;     // undefined (kein Error!)

console.log(`Benutzer 1 Zusatz: ${zusatz2}`);  // "Hinterhaus"
console.log(`Benutzer 2 Zusatz: ${zusatz3}`);  // undefined

// Kombiniert mit ?? :
const zusatzOderDefault = benutzer2.adresse?.zusatz ?? "kein Zusatz";
console.log(`Benutzer 2 Zusatz: ${zusatzOderDefault}`);  // "kein Zusatz"

// Optional Chaining funktioniert auch mit Methoden und Arrays:
const arr: number[] | undefined = undefined;
const erstesElement = arr?.[0];        // undefined (kein Error!)
// const methode = someObj?.doSomething?.(); // Ruft nur auf wenn definiert

// ─── NULLISH ASSIGNMENT (??=) ──────────────────────────────────────────────

console.log("\n--- Nullish Assignment ---");

let config: { port?: number; host?: string } = {};

// Setze nur wenn undefined oder null:
config.port ??= 3000;
config.host ??= "localhost";

console.log(config);  // { port: 3000, host: "localhost" }

// Nochmal setzen — aendert nichts, weil schon Werte da sind:
config.port ??= 8080;
console.log(config.port);  // 3000 (unveraendert!)

// ─── PRAXISBEISPIEL: THE BILLION DOLLAR MISTAKE ────────────────────────────

console.log("\n--- Billion Dollar Mistake vermeiden ---");

// Tony Hoare nannte null seinen "Billion Dollar Mistake".
// In TypeScript koennen wir diesen Fehler vermeiden:

// UNSICHER (wie in vielen anderen Sprachen):
// function getUser(id: number): User {
//   // Koennte null zurueckgeben, aber der Typ sagt es nicht!
//   return database.find(id); // Laufzeitfehler wenn nicht gefunden
// }

// SICHER (TypeScript-Art):
interface User {
  id: number;
  name: string;
}

function getUser(id: number): User | undefined {
  // Der Rueckgabetyp ZWINGT den Aufrufer zur Pruefung
  const users: User[] = [
    { id: 1, name: "Max" },
    { id: 2, name: "Anna" },
  ];
  return users.find(u => u.id === id);
}

const user = getUser(1);
// user.name;  // Error! Object is possibly 'undefined'

if (user) {
  console.log(`Gefunden: ${user.name}`);  // OK nach Pruefung
} else {
  console.log("Benutzer nicht gefunden");
}

// Oder mit Optional Chaining:
const userName = getUser(99)?.name ?? "Unbekannt";
console.log(`Benutzer 99: ${userName}`);  // "Unbekannt"

// ─── NULL ASSERTIONS (!) — VORSICHT! ───────────────────────────────────────

console.log("\n--- Non-null Assertion (!) ---");

// Mit ! sagst du TypeScript: "Vertrau mir, das ist nicht null"
const definitvDa = getUser(1)!;  // TypeScript glaubt dir
console.log(definitvDa.name);     // OK — aber wenn getUser(1) undefined waere → Laufzeitfehler!

// WARNUNG: ! ist fast so gefaehrlich wie any.
// Verwende es nur, wenn du 100% sicher bist.
// Besser: Immer eine richtige Pruefung machen.

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
