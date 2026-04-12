/**
 * Lektion 13 - Exercise 01: Erste generische Funktionen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-erste-generische-funktion.ts
 *
 * 5 Aufgaben zu Typparametern, Inference und der Grundsyntax.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: identity-Funktion
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "identity" die einen Wert
// nimmt und ihn unveraendert zurueckgibt. Der Typ soll erhalten bleiben.
// function identity...

// Tests (entkommentieren wenn fertig):
// const s = identity("hallo"); // s soll string sein
// const n = identity(42);       // n soll number sein
// console.log(`identity("hallo") = ${s}`);
// console.log(`identity(42) = ${n}`);

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: last-Funktion
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "last" die das letzte Element
// eines Arrays zurueckgibt (oder undefined wenn leer).
// function last...

// Tests:
// console.log(last([1, 2, 3]));          // 3 (number | undefined)
// console.log(last(["a", "b", "c"]));    // "c" (string | undefined)
// console.log(last([]));                  // undefined

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: wrap-Funktion
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "wrap" die einen Wert nimmt
// und ihn in ein Objekt { value: T } einpackt.
// function wrap...

// Tests:
// const w1 = wrap("hallo");  // { value: string }
// const w2 = wrap(42);        // { value: number }
// console.log(w1); // { value: "hallo" }
// console.log(w2); // { value: 42 }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: pair-Funktion mit zwei Typparametern
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "makePair" die zwei Werte
// unterschiedlicher Typen nimmt und ein Tuple [T, U] zurueckgibt.
// function makePair...

// Tests:
// const p = makePair("Max", 30);   // [string, number]
// console.log(p); // ["Max", 30]

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: filterByType
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "filterDefined" die ein Array
// mit moeglichen null/undefined-Werten nimmt und nur die definierten
// Werte zurueckgibt. Nutze einen Type Predicate.
// function filterDefined...

// Tests:
// const mixed = ["Max", null, "Anna", undefined, "Bob"];
// const clean = filterDefined(mixed); // string[]
// console.log(clean); // ["Max", "Anna", "Bob"]
