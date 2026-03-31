/**
 * Lektion 11 - Example 04: Equality und Truthiness Narrowing
 *
 * Ausfuehren mit: npx tsx examples/04-equality-und-truthiness.ts
 *
 * Zeigt wie ===, !==, ==, != und Truthiness-Checks Typen narrowen.
 */

// ─── STRIKTE GLEICHHEIT NARROWT BEIDE SEITEN ──────────────────────────────

console.log("--- Equality narrowt beide Seiten ---");

function vergleiche(a: string | number, b: string | boolean) {
  if (a === b) {
    // Einziger gemeinsamer Typ: string
    // a: string, b: string
    console.log(`Gleich! a="${a.toUpperCase()}", b="${b.toUpperCase()}"`);
  } else {
    console.log("Nicht gleich (oder verschiedene Typen)");
  }
}

vergleiche("hallo", "hallo");  // Gleich!
vergleiche("hallo", "welt");   // Nicht gleich
vergleiche(42, "hallo");       // Nicht gleich (verschiedene Typen)

// ─── NULL-CHECKS MIT === UND !== ────────────────────────────────────────────

console.log("\n--- null-Checks ---");

function sicher(wert: string | null | undefined): string {
  // Variante 1: Explizit beide pruefen
  if (wert !== null && wert !== undefined) {
    return wert.toUpperCase();
  }
  return "(leer)";
}

function sicherKurz(wert: string | null | undefined): string {
  // Variante 2: Lose Gleichheit == null (prueft null UND undefined)
  if (wert != null) {
    return wert.toUpperCase();
  }
  return "(leer)";
}

console.log(sicher("test"));       // TEST
console.log(sicher(null));         // (leer)
console.log(sicher(undefined));    // (leer)
console.log(sicherKurz("test"));   // TEST
console.log(sicherKurz(null));     // (leer)

// ─── == null PRUEFT NULL UND UNDEFINED ──────────────────────────────────────

console.log("\n--- == null Verhalten ---");

// Demonstriere was == null alles matcht:
const testWerte: unknown[] = [null, undefined, 0, "", false, "text", 42];
for (const wert of testWerte) {
  const istNullish = wert == null;
  console.log(`  ${JSON.stringify(wert) ?? "undefined"} == null: ${istNullish}`);
}
// Nur null und undefined geben true!

// ─── TRUTHINESS NARROWING ──────────────────────────────────────────────────

console.log("\n--- Truthiness Narrowing ---");

function truthinessDemo(wert: string | null | undefined) {
  if (wert) {
    // wert: string (aber NICHT "" — leerer String ist falsy!)
    console.log(`  Truthy: "${wert}"`);
  } else {
    // wert: string | null | undefined (aber string nur wenn "")
    console.log(`  Falsy: ${JSON.stringify(wert)}`);
  }
}

truthinessDemo("hallo");     // Truthy: "hallo"
truthinessDemo("");           // Falsy: "" — ACHTUNG!
truthinessDemo(null);         // Falsy: null
truthinessDemo(undefined);    // Falsy: undefined

// ─── DIE TRUTHINESS-FALLE BEI 0 UND "" ─────────────────────────────────────

console.log("\n--- Truthiness-Falle bei 0 ---");

function verarbeiteLaenge(laenge: number | null): string {
  // FALSCH: 0 ist eine gueltige Laenge!
  if (laenge) {
    return `Laenge: ${laenge}`;
  }
  return "Keine Laenge";
}

function verarbeiteLaengeSicher(laenge: number | null): string {
  // RICHTIG: Expliziter null-Check
  if (laenge !== null) {
    return `Laenge: ${laenge}`;
  }
  return "Keine Laenge";
}

console.log("  Truthiness (falsch):");
console.log(`    0    -> ${verarbeiteLaenge(0)}`);     // "Keine Laenge" BUG!
console.log(`    5    -> ${verarbeiteLaenge(5)}`);     // "Laenge: 5"
console.log(`    null -> ${verarbeiteLaenge(null)}`);  // "Keine Laenge"

console.log("  Explizit (richtig):");
console.log(`    0    -> ${verarbeiteLaengeSicher(0)}`);     // "Laenge: 0"
console.log(`    5    -> ${verarbeiteLaengeSicher(5)}`);     // "Laenge: 5"
console.log(`    null -> ${verarbeiteLaengeSicher(null)}`);  // "Keine Laenge"

// ─── LOGISCHE OPERATOREN UND NARROWING ──────────────────────────────────────

console.log("\n--- Logische Operatoren ---");

function mitAnd(name: string | null): string {
  // && narrowt die linke Seite, bevor die rechte ausgefuehrt wird
  return name && name.toUpperCase() || "(kein Name)";
}

console.log(mitAnd("Max"));    // MAX
console.log(mitAnd(null));      // (kein Name)
console.log(mitAnd(""));        // (kein Name) — leerer String ist falsy!

// ─── NULLISH COALESCING (??) UND OPTIONAL CHAINING (?.) ────────────────────

console.log("\n--- Nullish Coalescing ---");

interface Config {
  port?: number;
  host?: string;
  debug?: boolean;
}

function applyConfig(config: Config) {
  // ?? gibt den rechten Wert NUR bei null/undefined
  const port = config.port ?? 3000;
  const host = config.host ?? "localhost";
  const debug = config.debug ?? false;

  console.log(`  ${host}:${port} (debug: ${debug})`);
}

// 0 ist ein gueltiger Port — ?? behandelt ihn richtig!
applyConfig({ port: 0, host: "", debug: false });
// localhost:0 (debug: false) — Korrekt mit ??
// Mit || waere es: localhost:3000 (debug: false) — FALSCH!

applyConfig({});
// localhost:3000 (debug: false)

applyConfig({ port: 8080, host: "api.example.com", debug: true });
// api.example.com:8080 (debug: true)

// ─── SWITCH NARROWT AUTOMATISCH ─────────────────────────────────────────────

console.log("\n--- Switch Narrowing ---");

type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction): [number, number] {
  switch (direction) {
    case "north": return [0, 1];   // direction: "north"
    case "south": return [0, -1];  // direction: "south"
    case "east":  return [1, 0];   // direction: "east"
    case "west":  return [-1, 0];  // direction: "west"
  }
}

const directions: Direction[] = ["north", "east", "south", "west"];
for (const d of directions) {
  const [dx, dy] = move(d);
  console.log(`  ${d}: dx=${dx}, dy=${dy}`);
}

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
