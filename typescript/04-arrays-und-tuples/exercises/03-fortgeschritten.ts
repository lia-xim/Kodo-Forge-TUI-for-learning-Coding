/**
 * Lektion 04 — Uebung 03: Fortgeschrittene Array & Tuple Challenges
 *
 * Diese Uebungen testen tiefes Verstaendnis von Kovarianz,
 * Variadic Tuples, as const Patterns und Type-Level-Programmierung.
 *
 * Pruefung: npx tsx exercises/03-fortgeschritten.ts
 *
 * Hinweis: Einige Aufgaben sind reine Typ-Uebungen (Type-Tests).
 * Wenn der Code kompiliert, sind sie bestanden!
 */

import type { Expect, Equal } from '../../tools/type-test.ts';

export {};

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 1: Kovarianz-Bug finden
// ═══════════════════════════════════════════════════════════════════════════════

// Der folgende Code kompiliert, hat aber einen versteckten Bug durch Kovarianz.
// Finde den Bug und erklaere in einem Kommentar, was passiert.
// Dann: Behebe den Bug indem du die Funktionssignatur aenderst.

// TODO: Behebe die Funktionssignatur so, dass der Bug nicht mehr moeglich ist.
/*
function addDefault(items: string[]) {
  items.push("default");
}

// Der Bug:
const specificItems: ("admin" | "user")[] = ["admin", "user"];
addDefault(specificItems);
// specificItems enthaelt jetzt ["admin", "user", "default"]
// aber der Typ sagt ("admin" | "user")[]!
*/

// Dein Code hier:
// function addDefault(items: ???): ??? {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const result = addDefault(["admin", "user"]);
// console.assert(result.includes("default"), "Aufgabe 1: default sollte enthalten sein");
// console.log("✓ Aufgabe 1 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 2: Type Predicate mit filter()
// ═══════════════════════════════════════════════════════════════════════════════

// Gegeben ist ein Array mit gemischten Typen.
// Verwende filter() mit einem Type Predicate, um nur die Strings zu extrahieren.

const daten: (string | number | null | undefined)[] = [
  "hello", 42, null, "world", undefined, 7, "typescript", null
];

// TODO: Extrahiere nur die Strings mit einem Type Predicate.
//       Der Ergebnis-Typ MUSS string[] sein, nicht (string | number | null | undefined)[].

// Dein Code hier:
// const nurStrings = daten.filter(???);

// Pruefung (entferne die Kommentare wenn du fertig bist):
// type Test2 = Expect<Equal<typeof nurStrings, string[]>>;
// console.assert(nurStrings.length === 3, "Aufgabe 2: sollte 3 Strings finden");
// console.assert(nurStrings[0] === "hello", "Aufgabe 2: erster String sollte 'hello' sein");
// console.log("✓ Aufgabe 2 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 3: as const + typeof fuer Union-Typ
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein as const Array mit HTTP-Methoden: "GET", "POST", "PUT", "DELETE"
//       Leite daraus einen Union-Typ 'HttpMethod' ab.
//       Schreibe dann eine Funktion 'isValidMethod' die prueft ob ein String
//       eine gueltige HTTP-Methode ist (Type Guard / Type Predicate).

// Dein Code hier:
// const HTTP_METHODS = ???;
// type HttpMethod = ???;
// function isValidMethod(method: string): method is HttpMethod {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// type Test3a = Expect<Equal<HttpMethod, "GET" | "POST" | "PUT" | "DELETE">>;
// console.assert(isValidMethod("GET") === true, "Aufgabe 3: GET sollte gueltig sein");
// console.assert(isValidMethod("PATCH") === false, "Aufgabe 3: PATCH sollte ungueltig sein");
// const method: string = "POST";
// if (isValidMethod(method)) {
//   // Hier sollte method den Typ HttpMethod haben:
//   type Test3b = Expect<Equal<typeof method, HttpMethod>>;
// }
// console.log("✓ Aufgabe 3 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 4: Variadic Tuple Type — Prepend und Append
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle zwei Utility-Typen:
//       1. Prepend<Elem, T> — fuegt Elem vorne an das Tuple T an
//       2. Append<T, Elem> — fuegt Elem hinten an das Tuple T an

// Dein Code hier:
// type Prepend<Elem, T extends readonly unknown[]> = ???;
// type Append<T extends readonly unknown[], Elem> = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test4a = Expect<Equal<Prepend<number, [string, boolean]>, [number, string, boolean]>>;
// type Test4b = Expect<Equal<Prepend<string, []>, [string]>>;
// type Test4c = Expect<Equal<Append<[string, boolean], number>, [string, boolean, number]>>;
// type Test4d = Expect<Equal<Append<[], string>, [string]>>;
// console.log("✓ Aufgabe 4 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 5: Head und Tail Utility-Typen
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle zwei Utility-Typen:
//       1. Head<T> — gibt den Typ des ersten Elements zurueck
//       2. Tail<T> — gibt ein Tuple ohne das erste Element zurueck
//       Hinweis: Nutze 'infer' in Conditional Types!

// Dein Code hier:
// type Head<T extends readonly unknown[]> = ???;
// type Tail<T extends readonly unknown[]> = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test5a = Expect<Equal<Head<[string, number, boolean]>, string>>;
// type Test5b = Expect<Equal<Head<[42]>, 42>>;
// type Test5c = Expect<Equal<Tail<[string, number, boolean]>, [number, boolean]>>;
// type Test5d = Expect<Equal<Tail<[string]>, []>>;
// console.log("✓ Aufgabe 5 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 6: Readonly-sichere Funktion schreiben
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion 'sortedCopy' die ein Array nimmt und eine
//       sortierte KOPIE zurueckgibt, ohne das Original zu veraendern.
//       Die Funktion soll:
//       - readonly Parameter haben (Schutz vor Mutation)
//       - Generics verwenden (funktioniert mit jedem vergleichbaren Typ)
//       - Das Original unveraendert lassen

// Dein Code hier:
// function sortedCopy<T>(arr: ???, compareFn?: (a: T, b: T) => number): T[] {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const originalNamen = ["Charlie", "Alice", "Bob"];
// const sortiert = sortedCopy(originalNamen);
// console.assert(JSON.stringify(sortiert) === '["Alice","Bob","Charlie"]', "Aufgabe 6a: falsch sortiert");
// console.assert(originalNamen[0] === "Charlie", "Aufgabe 6b: Original veraendert!");
// const readonlyNamen: readonly string[] = ["Z", "A", "M"];
// const sortiert2 = sortedCopy(readonlyNamen); // Muss auch mit readonly funktionieren!
// console.assert(sortiert2[0] === "A", "Aufgabe 6c: readonly Array falsch sortiert");
// console.log("✓ Aufgabe 6 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 7: Result-Tuple mit Diskriminierung
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Result-Typ als Discriminated Tuple Union:
//       - Erfolg: [true, T]        (success-flag + Daten)
//       - Fehler: [false, string]  (success-flag + Fehlermeldung)
//
//       Schreibe eine Funktion 'divide' die zwei Zahlen teilt und
//       den Result-Typ zurueckgibt (Fehler bei Division durch 0).

// Dein Code hier:
// type Result<T> = ???;
//
// function divide(a: number, b: number): Result<number> {
//   ???
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// const [ok1, val1] = divide(10, 2);
// if (ok1) {
//   type Test7a = Expect<Equal<typeof val1, number>>;
//   console.assert(val1 === 5, "Aufgabe 7a: 10/2 sollte 5 sein");
// }
// const [ok2, val2] = divide(10, 0);
// if (!ok2) {
//   type Test7b = Expect<Equal<typeof val2, string>>;
//   console.assert(typeof val2 === "string", "Aufgabe 7b: Fehlermeldung sollte string sein");
// }
// console.log("✓ Aufgabe 7 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 8: Tuple-basierter Event-Emitter (Typ-Challenge)
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Definiere einen Event-Map-Typ als Object mit Tuple-Werten.
//       Schreibe dann eine typsichere emit-Funktion die den Event-Namen
//       und die korrekten Argumente erwartet.
//
//       Hinweis: Dies ist eine schwierige Aufgabe! Verwende generische
//       Constraints und Indexed Access Types.

// Dein Code hier:
// interface EventMap {
//   click: [x: number, y: number];
//   keypress: [key: string, modifiers: string[]];
//   resize: [width: number, height: number];
//   logout: [];
// }
//
// function emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
//   console.log(`Event: ${event}`, ...args);
// }

// Pruefung (entferne die Kommentare wenn du fertig bist):
// emit("click", 100, 200);           // OK
// emit("keypress", "Enter", ["ctrl"]); // OK
// emit("resize", 1920, 1080);         // OK
// emit("logout");                      // OK
// // emit("click", "wrong");           // Sollte Compile-Fehler geben!
// // emit("unknown", 1);               // Sollte Compile-Fehler geben!
// console.log("✓ Aufgabe 8 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 9: TupleToUnion Utility-Typ
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Utility-Typ 'TupleToUnion' der aus einem Tuple-Typ
//       einen Union-Typ aller Elemente macht.
//       Hinweis: Verwende indexed access mit [number].

// Dein Code hier:
// type TupleToUnion<T extends readonly unknown[]> = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test9a = Expect<Equal<TupleToUnion<[string, number, boolean]>, string | number | boolean>>;
// type Test9b = Expect<Equal<TupleToUnion<["a", "b", "c"]>, "a" | "b" | "c">>;
// type Test9c = Expect<Equal<TupleToUnion<[42]>, 42>>;
// console.log("✓ Aufgabe 9 bestanden");

// ═══════════════════════════════════════════════════════════════════════════════
// Aufgabe 10: Length Utility-Typ fuer Tuples
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Utility-Typ 'Length' der die Laenge eines Tuples
//       als Literal-Typ zurueckgibt.
//       Hinweis: Tuples haben ein .length Property mit einem Literal-Typ!

// Dein Code hier:
// type Length<T extends readonly unknown[]> = ???;

// Type-Tests (entferne die Kommentare wenn du fertig bist):
// type Test10a = Expect<Equal<Length<[string, number, boolean]>, 3>>;
// type Test10b = Expect<Equal<Length<[]>, 0>>;
// type Test10c = Expect<Equal<Length<[42]>, 1>>;
// type Test10d = Expect<Equal<Length<readonly ["a", "b"]>, 2>>;
// console.log("✓ Aufgabe 10 bestanden");

console.log("\n🏁 Alle freigeschalteten Aufgaben bestanden!");
console.log("Entferne die Kommentare bei den weiteren Aufgaben um fortzufahren.");
