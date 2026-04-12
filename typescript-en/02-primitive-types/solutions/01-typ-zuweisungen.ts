/**
 * Lektion 02 - Solution 01: Typ-Zuweisungen
 *
 * Ausfuehren mit: npx tsx solutions/01-typ-zuweisungen.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: String-Typ
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Einfach den Typ string angeben und den Wert zuweisen.
// Man kann auch den Typ weglassen — TypeScript erkennt (inferiert) ihn automatisch.
// Explizite Angabe ist hier fuer Lernzwecke.
const benutzername: string = "admin";

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Number-Typ
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: number fuer alle Zahlenwerte — ob ganzzahlig oder dezimal.
// In TypeScript gibt es KEINEN int, float, double oder long.
// Alles ist number (64-bit IEEE 754).
const maxVersuche: number = 3;

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Boolean-Typ
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: boolean fuer Wahrheitswerte. Nur true und false sind gueltig.
// Keine "truthy" Werte wie 1, "ja" usw.
const istEingeloggt: boolean = false;

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Nullable Parameter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Union Type mit null verwenden: string | null
// Damit akzeptiert die Funktion sowohl "Max" als auch null.
// Der Aufruf getSpitzname(null) ist damit gueltig.
function getSpitzname(name: string | null): string {
  if (name === null) {
    return "Unbekannt";
  }
  return name;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Optional number
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Union Type mit undefined: number | undefined
// So kann die Variable entweder eine Zahl oder undefined sein.
// Das ist nuetzlich fuer optionale Konfigurationswerte.
let serverPort: number | undefined = 8080;
serverPort = undefined;  // Jetzt gueltig!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: any zu unknown konvertieren
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: unknown statt any verwenden und typeof-Pruefung hinzufuegen.
// Wenn der Wert keine Zahl ist, geben wir NaN zurueck (oder man koennte
// einen Error werfen — das waere auch eine gute Loesung).
function verdopple(wert: unknown): number {
  if (typeof wert === "number") {
    return wert * 2;
  }
  // Wenn es keine Zahl ist, geben wir NaN zurueck
  return NaN;
}

// ERKLAERUNG:
// - Mit 'any' haette verdopple("hallo") zur Laufzeit NaN ergeben
//   (weil "hallo" * 2 = NaN), aber TypeScript haette nicht gewarnt.
// - Mit 'unknown' MUSS man pruefen. Das ist sicherer.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: any zu unknown mit Laenge
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: unknown verwenden und pruefen ob es ein String ist.
// Nur Strings (und Arrays) haben .length — also pruefen wir darauf.
function gibLaenge(wert: unknown): number {
  if (typeof wert === "string") {
    return wert.length;
  }
  return -1;
}

// ERKLAERUNG:
// - Mit 'any' haette gibLaenge(42) zur Laufzeit undefined ergeben
//   (weil Zahlen kein .length haben), nicht -1 wie erwartet.
// - Mit 'unknown' stellen wir sicher, dass nur Strings .length aufrufen.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Person finden
// ═══════════════════════════════════════════════════════════════════════════

interface Person {
  name: string;
  alter: number;
}

const personen: Person[] = [
  { name: "Max", alter: 25 },
  { name: "Anna", alter: 30 },
  { name: "Tim", alter: 22 },
];

// Loesung: Rueckgabetyp Person | undefined
// Array.find() gibt automatisch T | undefined zurueck, was perfekt passt.
// Der Aufrufer wird von TypeScript gezwungen, auf undefined zu pruefen.
function findePerson(name: string): Person | undefined {
  return personen.find(p => p.name === name);
}

// ERKLAERUNG:
// - Person | undefined ist der idiomatische TypeScript-Weg fuer "vielleicht
//   kein Ergebnis". Der Aufrufer MUSS pruefen ob das Ergebnis existiert.
// - Manche Teams verwenden null statt undefined fuer "nicht gefunden".
//   Beide sind gueltig — wichtig ist Konsistenz im Projekt.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 9: void-Funktion
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: void als Rueckgabetyp, switch fuer die Level
function logge(nachricht: string, level: number): void {
  const prefixMap: Record<number, string> = {
    1: "INFO",
    2: "WARNUNG",
    3: "FEHLER",
  };
  const prefix = prefixMap[level] ?? "???";
  console.log(`[${prefix}] ${nachricht}`);
}

// ERKLAERUNG:
// - void bedeutet: Diese Funktion gibt nichts zurueck, sie hat nur
//   Seiteneffekte (hier: console.log).
// - Die Record<number, string> Map ist eine saubere Alternative zu
//   einer langen if-else oder switch Kette.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 10: Symbol als Objekt-Key
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Symbol erstellen und als computed property key verwenden
const geheimnis: unique symbol = Symbol("geheimnis");

const tresor: { besitzer: string; [geheimnis]: string } = {
  besitzer: "Max",
  [geheimnis]: "TypeScript ist toll",
};

// ERKLAERUNG:
// - Symbols erzeugen eindeutige, nicht-kollidierende Property-Keys.
// - Das [geheimnis] in der Objektdeklaration verwendet "computed property names",
//   ein ES2015-Feature.
// - Die Symbol-Property ist in JSON.stringify unsichtbar und wird
//   von for...in nicht aufgelistet — ideal fuer "interne" Daten.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Test 1: String
console.assert(typeof benutzername === "string", "Aufgabe 1: benutzername muss ein string sein");
console.assert(benutzername === "admin", "Aufgabe 1: benutzername muss 'admin' sein");

// Test 2: Number
console.assert(typeof maxVersuche === "number", "Aufgabe 2: maxVersuche muss eine number sein");
console.assert(maxVersuche === 3, "Aufgabe 2: maxVersuche muss 3 sein");

// Test 3: Boolean
console.assert(typeof istEingeloggt === "boolean", "Aufgabe 3: istEingeloggt muss ein boolean sein");
console.assert(istEingeloggt === false, "Aufgabe 3: istEingeloggt muss false sein");

// Test 4: Nullable Parameter
console.assert(getSpitzname(null) === "Unbekannt", "Aufgabe 4: null soll 'Unbekannt' zurueckgeben");
console.assert(getSpitzname("Max") === "Max", "Aufgabe 4: 'Max' soll 'Max' zurueckgeben");

// Test 5: Optional number
console.assert(serverPort === undefined, "Aufgabe 5: serverPort muss undefined sein koennen");

// Test 6: unknown statt any
console.assert(verdopple(21) === 42, "Aufgabe 6: verdopple(21) muss 42 ergeben");
console.assert(Number.isNaN(verdopple("hallo")), "Aufgabe 6: verdopple('hallo') muss NaN ergeben");

// Test 7: unknown mit Laenge
console.assert(gibLaenge("hallo") === 5, "Aufgabe 7: gibLaenge('hallo') muss 5 ergeben");
console.assert(gibLaenge(42) === -1, "Aufgabe 7: gibLaenge(42) muss -1 ergeben");

// Test 8: Person finden
console.assert(findePerson("Max")?.name === "Max", "Aufgabe 8: Max muss gefunden werden");
console.assert(findePerson("xyz") === undefined, "Aufgabe 8: xyz darf nicht gefunden werden");

// Test 9: Logge-Funktion
logge("Server gestartet", 1);   // "[INFO] Server gestartet"
logge("Speicher knapp", 2);     // "[WARNUNG] Speicher knapp"
logge("Absturz!", 3);           // "[FEHLER] Absturz!"
logge("Unbekanntes Level", 99); // "[???] Unbekanntes Level"

// Test 10: Symbol
console.assert(typeof geheimnis === "symbol", "Aufgabe 10: geheimnis muss ein symbol sein");
console.assert(tresor.besitzer === "Max", "Aufgabe 10: besitzer muss 'Max' sein");
console.assert(tresor[geheimnis] === "TypeScript ist toll", "Aufgabe 10: Symbol-Property muss stimmen");

console.log("\n✅ Alle Tests bestanden! Gut gemacht!");
