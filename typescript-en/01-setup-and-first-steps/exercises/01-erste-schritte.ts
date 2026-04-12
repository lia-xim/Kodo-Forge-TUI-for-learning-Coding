// ============================================================
// Uebung 01: Erste Schritte mit TypeScript
// ============================================================
//
// Bearbeite die 5 Aufgaben unten. Jede Aufgabe hat:
//   - Eine Beschreibung als Kommentar
//   - Einen TODO-Block, den du ausfuellen musst
//   - Einen console.assert()-Test, der prueft, ob es stimmt
//
// Ausfuehren mit: tsx exercises/01-erste-schritte.ts
// Wenn alle Asserts bestehen, siehst du keine Fehlermeldung!
// ============================================================

console.log("=== Uebung 01: Erste Schritte ===\n");

// -----------------------------------------------------------
// Aufgabe 1: Variable mit Typ-Annotation deklarieren
// -----------------------------------------------------------
//
// Deklariere eine Variable `lieblingszahl` vom Typ `number`
// und weise ihr den Wert 42 zu.
// Deklariere eine Variable `begruessung` vom Typ `string`
// und weise ihr "Hallo TypeScript" zu.

// TODO: Deine Variablen hier deklarieren
// let lieblingszahl ...
// let begruessung ...

// -- Tests (nicht veraendern!) --
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(lieblingszahl === 42, "lieblingszahl sollte 42 sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(begruessung === "Hallo TypeScript", "begruessung sollte 'Hallo TypeScript' sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(typeof lieblingszahl === "number", "lieblingszahl sollte eine number sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(typeof begruessung === "string", "begruessung sollte ein string sein");
console.log("Aufgabe 1: OK ✓");

// -----------------------------------------------------------
// Aufgabe 2: Typ-Fehler beheben
// -----------------------------------------------------------
//
// Die folgende Funktion hat einen Typ-Fehler. Der Parameter
// `alter` sollte eine number sein, aber der Aufruf uebergibt
// einen string.
//
// Aendere den AUFRUF (nicht die Funktion!), damit der Fehler
// verschwindet. Das Alter soll 25 sein.

function beschreibePerson(name: string, alter: number): string {
  return `${name} ist ${alter} Jahre alt.`;
}

// TODO: Aendere diesen Aufruf, damit er korrekt ist:
// @ts-expect-error — aendere den Aufruf, damit dieser Fehler verschwindet
const beschreibung = beschreibePerson("Anna", "fuenfundzwanzig");

// -- Tests (nicht veraendern!) --
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(beschreibung === "Anna ist 25 Jahre alt.", `Erwartet: "Anna ist 25 Jahre alt.", erhalten: "${beschreibung}"`);
console.log("Aufgabe 2: OK ✓");

// -----------------------------------------------------------
// Aufgabe 3: Getypte Funktion erstellen
// -----------------------------------------------------------
//
// Erstelle eine Funktion `berechneFlaeche`, die zwei Parameter
// `breite` (number) und `hoehe` (number) nimmt und die Flaeche
// als number zurueckgibt (breite * hoehe).
//
// Vergiss nicht: Annotiere sowohl die Parameter als auch den
// Rueckgabetyp!

// BEVOR du codest -- erklaere kurz:
// 1. Wie sieht die Syntax fuer eine getypte Funktion aus? ___
// 2. Wo kommt die Rueckgabetyp-Annotation hin? ___
// 3. Warum ist der Rueckgabetyp hier sinnvoll, obwohl TS ihn
//    auch selbst ableiten koennte? ___

// TODO: Deine Funktion hier erstellen
// function berechneFlaeche ...

// -- Tests (nicht veraendern!) --
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(berechneFlaeche(5, 3) === 15, "5 * 3 sollte 15 sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(berechneFlaeche(10, 10) === 100, "10 * 10 sollte 100 sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(berechneFlaeche(0, 5) === 0, "0 * 5 sollte 0 sein");
console.log("Aufgabe 3: OK ✓");

// -----------------------------------------------------------
// Aufgabe 4: Rueckgabetyp annotieren
// -----------------------------------------------------------
//
// Die folgende Funktion berechnet den Durchschnitt eines
// Arrays von Zahlen. Sie funktioniert, hat aber keinen
// annotierten Rueckgabetyp.
//
// Fuege den Rueckgabetyp `: number` hinzu und bearbeite den
// Fall, dass das Array leer ist (gib 0 zurueck).

// BEVOR du codest -- erklaere kurz:
// 1. Was passiert mathematisch bei 0 / 0 in JavaScript? ___
// 2. Warum faengt der Rueckgabetyp `: number` dieses Problem
//    NICHT ab? (Tipp: Ist NaN eine number?) ___
// 3. Welchen Edge Case musst du also manuell pruefen? ___

// TODO: Fuege den Rueckgabetyp hinzu und behandle das leere Array
function berechneDurchschnitt(zahlen: number[]) {
  const summe = zahlen.reduce((acc, val) => acc + val, 0);
  return summe / zahlen.length; // Was passiert bei leerem Array?
}

// -- Tests (nicht veraendern!) --
console.assert(berechneDurchschnitt([10, 20, 30]) === 20, "Durchschnitt von [10,20,30] sollte 20 sein");
console.assert(berechneDurchschnitt([5]) === 5, "Durchschnitt von [5] sollte 5 sein");
console.assert(berechneDurchschnitt([]) === 0, "Durchschnitt von [] sollte 0 sein (nicht NaN!)");
console.log("Aufgabe 4: OK ✓");

// -----------------------------------------------------------
// Aufgabe 5: Objekt mit getypter Struktur erstellen
// -----------------------------------------------------------
//
// Erstelle ein Interface `Buch` mit diesen Properties:
//   - titel: string
//   - autor: string
//   - seiten: number
//   - gelesen: boolean
//
// Erstelle dann ein Objekt `meinBuch` vom Typ `Buch` mit
// beliebigen Werten.

// BEVOR du codest -- erklaere kurz:
// 1. Was ist der Unterschied zwischen interface und class? ___
// 2. Existiert das Interface zur Laufzeit im JavaScript? ___
// 3. Was passiert wenn du ein Property vergisst oder falsch
//    schreibst? ___

// TODO: Interface und Objekt hier erstellen
// interface Buch { ... }
// const meinBuch: Buch = { ... };

// -- Tests (nicht veraendern!) --
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(typeof meinBuch.titel === "string", "titel sollte ein string sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(typeof meinBuch.autor === "string", "autor sollte ein string sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(typeof meinBuch.seiten === "number", "seiten sollte eine number sein");
// @ts-expect-error — wird nach der Loesung funktionieren
console.assert(typeof meinBuch.gelesen === "boolean", "gelesen sollte ein boolean sein");
console.log("Aufgabe 5: OK ✓");

// -----------------------------------------------------------
console.log("\n=== Alle Aufgaben bestanden! Gut gemacht! ===");
