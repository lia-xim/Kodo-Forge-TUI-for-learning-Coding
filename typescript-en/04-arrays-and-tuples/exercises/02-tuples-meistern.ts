/**
 * Lektion 04 — Uebung 02: Tuples meistern
 *
 * Aufgaben: Vervollstaendige die TODO-Stellen.
 * Pruefung: npx tsx exercises/02-tuples-meistern.ts
 *
 * Diese Uebung verwendet Type-Tests: Wenn der Code kompiliert,
 * sind die Typ-Tests bestanden!
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Erstelle einen grundlegenden Tuple-Typ
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ 'Person' als Tuple: [string, number]
//       (Name und Alter)
//       Erstelle dann eine Variable 'alice' mit den Werten ["Alice", 30]

// Dein Code hier:
// type Person = ???;
// const alice: Person = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test1a = Expect<Equal<Person, [string, number]>>;
// console.assert(alice[0] === "Alice", "Aufgabe 1: Name sollte Alice sein");
// console.assert(alice[1] === 30, "Aufgabe 1: Alter sollte 30 sein");
// console.log("✓ Aufgabe 1 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: Named / Labeled Tuple erstellen
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ 'Koordinate' als Named Tuple mit den Labels:
//       [lat: number, lng: number]
//       Erstelle eine Variable 'muenchen' mit den Werten [48.1351, 11.5820]

// Dein Code hier:
// type Koordinate = ???;
// const muenchen: Koordinate = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test2a = Expect<Equal<Koordinate, [lat: number, lng: number]>>;
// console.assert(muenchen[0] === 48.1351, "Aufgabe 2: Latitude falsch");
// console.assert(muenchen[1] === 11.5820, "Aufgabe 2: Longitude falsch");
// console.log("✓ Aufgabe 2 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: Optionale Tuple-Elemente
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ 'RGB' mit optionalem Alpha-Kanal:
//       [r: number, g: number, b: number, a?: number]
//       Erstelle zwei Variablen:
//       - 'rot' mit Werten [255, 0, 0]       (ohne Alpha)
//       - 'halbtransparent' mit [255, 0, 0, 0.5] (mit Alpha)

// Dein Code hier:
// type RGB = ???;
// const rot: RGB = ???;
// const halbtransparent: RGB = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test3a = Expect<Equal<RGB, [r: number, g: number, b: number, a?: number]>>;
// console.assert(rot.length === 3, "Aufgabe 3: rot sollte 3 Elemente haben");
// console.assert(halbtransparent.length === 4, "Aufgabe 3: halbtransparent sollte 4 Elemente haben");
// console.assert(halbtransparent[3] === 0.5, "Aufgabe 3: Alpha sollte 0.5 sein");
// console.log("✓ Aufgabe 3 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: Rest-Element Tuple erstellen
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ 'LogEntry' der so aufgebaut ist:
//       [timestamp: string, ...messages: string[]]
//       Das erste Element ist immer ein Timestamp-String,
//       danach koennen beliebig viele Message-Strings folgen.
//
//       Erstelle zwei Variablen:
//       - 'log1' mit ["2024-01-01", "Server gestartet"]
//       - 'log2' mit ["2024-01-01", "Fehler", "in Zeile 42", "Modul: Auth"]

// Dein Code hier:
// type LogEntry = ???;
// const log1: LogEntry = ???;
// const log2: LogEntry = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test4a = Expect<Equal<LogEntry, [timestamp: string, ...messages: string[]]>>;
// console.assert(log1.length === 2, "Aufgabe 4: log1 sollte 2 Elemente haben");
// console.assert(log2.length === 4, "Aufgabe 4: log2 sollte 4 Elemente haben");
// console.log("✓ Aufgabe 4 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: Tuple mit Typen destructurieren
// ═══════════════════════════════════════════════════════════════════════════════

// Gegeben:
const httpResponse: [number, string, boolean] = [200, "OK", true];

// TODO: Destructuriere httpResponse in drei Variablen:
//       - statusCode (number)
//       - statusText (string)
//       - success (boolean)
//       Nutze Destructuring-Syntax!

// Dein Code hier:
// const [???, ???, ???] = httpResponse;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test5a = Expect<Equal<typeof statusCode, number>>;
// type Test5b = Expect<Equal<typeof statusText, string>>;
// type Test5c = Expect<Equal<typeof success, boolean>>;
// console.assert(statusCode === 200, "Aufgabe 5: statusCode sollte 200 sein");
// console.assert(statusText === "OK", "Aufgabe 5: statusText sollte 'OK' sein");
// console.assert(success === true, "Aufgabe 5: success sollte true sein");
// console.log("✓ Aufgabe 5 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: Funktion mit Tuple-Rueckgabe (useState-Style)
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion 'useToggle' die einen boolean Anfangswert nimmt
//       und ein Tuple zurueckgibt: [aktueller Wert, Toggle-Funktion]
//       Der Rueckgabetyp soll sein: [value: boolean, toggle: () => void]
//
//       Hinweis: Die Toggle-Funktion soll eine leere Funktion sein (fuer diese Uebung).

// Dein Code hier:
// function useToggle(initial: boolean): ??? {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const [isOpen, toggleOpen] = useToggle(false);
// type Test6a = Expect<Equal<typeof isOpen, boolean>>;
// type Test6b = Expect<Equal<typeof toggleOpen, () => void>>;
// console.assert(isOpen === false, "Aufgabe 6: isOpen sollte false sein");
// console.assert(typeof toggleOpen === "function", "Aufgabe 6: toggleOpen sollte eine Funktion sein");
// console.log("✓ Aufgabe 6 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: as const fuer Tuple-Inferenz verwenden
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Variable 'statusCodes' mit as const, die folgende Werte hat:
//       [200, 404, 500]
//       Durch as const sollte der Typ readonly [200, 404, 500] sein (Literal-Typen!).
//
//       Erstelle dann einen Typ 'StatusCode' der die Union der Werte ist:
//       200 | 404 | 500
//       Hinweis: Verwende typeof und indexed access type.

// Dein Code hier:
// const statusCodes = ???;
// type StatusCode = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test7a = Expect<Equal<typeof statusCodes, readonly [200, 404, 500]>>;
// type Test7b = Expect<Equal<StatusCode, 200 | 404 | 500>>;
// console.log("✓ Aufgabe 7 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: Spread mit Tuples kombinieren
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle zwei Tuple-Typen:
//       type Anfang = [id: number, name: string]
//       type Ende = [active: boolean, role: string]
//
//       Erstelle dann einen kombinierten Typ 'UserRecord' der beide Tuples
//       per Spread verbindet: [number, string, boolean, string]
//
//       Erstelle eine Variable 'user' vom Typ UserRecord.

// Dein Code hier:
// type Anfang = ???;
// type Ende = ???;
// type UserRecord = ???;
// const user: UserRecord = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test8a = Expect<Equal<UserRecord, [number, string, boolean, string]>>;
// console.assert(user.length === 4, "Aufgabe 8: user sollte 4 Elemente haben");
// console.log("✓ Aufgabe 8 bestanden");

console.log("\n🏁 Alle freigeschalteten Aufgaben bestanden!");
console.log("Entferne die Kommentare bei den weiteren Aufgaben um fortzufahren.");
