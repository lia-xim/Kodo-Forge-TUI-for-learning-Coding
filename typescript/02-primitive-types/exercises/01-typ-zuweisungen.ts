/**
 * Lektion 02 - Exercise 01: Typ-Zuweisungen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-typ-zuweisungen.ts
 *
 * 10 Aufgaben zu primitiven Typen.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 * Die console.assert()-Aufrufe am Ende pruefen deine Antworten.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Deklariere eine Variable mit dem richtigen String-Typ
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Deklariere eine Variable "benutzername" vom Typ string mit dem Wert "admin"
// const benutzername = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Deklariere eine Variable mit dem richtigen Number-Typ
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Deklariere eine Variable "maxVersuche" vom Typ number mit dem Wert 3
// const maxVersuche = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Deklariere eine Variable mit dem richtigen Boolean-Typ
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Deklariere eine Variable "istEingeloggt" vom Typ boolean mit dem Wert false
// const istEingeloggt = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Korrigiere den Typ-Fehler
// ═══════════════════════════════════════════════════════════════════════════

// Diese Funktion soll einen optionalen Spitznamen akzeptieren.
// Wenn kein Spitzname angegeben wird, soll "Unbekannt" zurueckgegeben werden.

// TODO: Korrigiere den Parametertyp, damit null erlaubt ist
function getSpitzname(name: string): string {
  if (name === null) {
    return "Unbekannt";
  }
  return name;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Korrigiere den Typ-Fehler
// ═══════════════════════════════════════════════════════════════════════════

// Diese Variable soll entweder eine Zahl oder undefined sein.

// TODO: Korrigiere den Typ, damit undefined zugewiesen werden kann
let serverPort: number = 8080;
// serverPort = undefined;  // Soll moeglich sein — entferne den Kommentar und fix den Typ

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Konvertiere any zu unknown (Schritt 1)
// ═══════════════════════════════════════════════════════════════════════════

// Diese Funktion verwendet 'any' — das ist unsicher!
// TODO: Aendere 'any' zu 'unknown' und fuege eine typeof-Pruefung hinzu,
//       damit der Code typsicher ist.

function verdopple(wert: any): number {
  // TODO: Fuege hier eine Typenpruefung hinzu
  return wert * 2;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: Konvertiere any zu unknown (Schritt 2)
// ═══════════════════════════════════════════════════════════════════════════

// Diese Funktion nimmt einen beliebigen Wert und gibt seine Laenge zurueck.
// Wenn es kein String ist, soll -1 zurueckgegeben werden.

// TODO: Aendere 'any' zu 'unknown' und fuege die noetige Pruefung hinzu

function gibLaenge(wert: any): number {
  return wert.length;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Verwende null/undefined korrekt
// ═══════════════════════════════════════════════════════════════════════════

// Erstelle eine Funktion "findePerson", die entweder eine Person zurueckgibt
// oder undefined, wenn die Person nicht gefunden wird.

interface Person {
  name: string;
  alter: number;
}

// TODO: Schreibe die Funktion mit dem richtigen Rueckgabetyp
// Die Funktion soll in der folgenden Liste suchen:
const personen: Person[] = [
  { name: "Max", alter: 25 },
  { name: "Anna", alter: 30 },
  { name: "Tim", alter: 22 },
];

// function findePerson(name: string): ??? {
//   TODO: Implementiere die Funktion
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 9: Erstelle eine Funktion mit void-Rueckgabetyp
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Funktion "logge" die:
// - Einen Parameter "nachricht" vom Typ string nimmt
// - Einen Parameter "level" vom Typ number nimmt (1 = Info, 2 = Warnung, 3 = Fehler)
// - Einen String in folgendem Format ausgibt: "[INFO] nachricht", "[WARNUNG] nachricht", "[FEHLER] nachricht"
// - void zurueckgibt
// - Bei ungueltigem Level "[???] nachricht" ausgibt

// function logge(nachricht: string, level: number): void {
//   TODO: Implementiere die Funktion
// }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 10: Verwende ein Symbol als Objekt-Key
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Symbol namens "geheimnis"
// Dann erstelle ein Objekt "tresor" das:
// - Eine normale Property "besitzer" mit dem Wert "Max" hat
// - Eine Symbol-Property [geheimnis] mit dem Wert "TypeScript ist toll" hat

// const geheimnis = ...
// const tresor = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entferne die Kommentare wenn du die Aufgaben geloest hast
// ═══════════════════════════════════════════════════════════════════════════

/*
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

// Test 9: Logge-Funktion (manuell pruefen — void gibt nichts zurueck)
// logge("Server gestartet", 1);  // Sollte "[INFO] Server gestartet" ausgeben
// logge("Speicher knapp", 2);    // Sollte "[WARNUNG] Speicher knapp" ausgeben
// logge("Absturz!", 3);          // Sollte "[FEHLER] Absturz!" ausgeben

// Test 10: Symbol
console.assert(typeof geheimnis === "symbol", "Aufgabe 10: geheimnis muss ein symbol sein");
console.assert(tresor.besitzer === "Max", "Aufgabe 10: besitzer muss 'Max' sein");
console.assert(tresor[geheimnis] === "TypeScript ist toll", "Aufgabe 10: Symbol-Property muss stimmen");

console.log("\n✅ Alle Tests bestanden!");
*/

console.log("Entferne die Kommentare um die Tests auszufuehren,");
console.log("nachdem du alle TODO-Aufgaben geloest hast.");
