/**
 * Lektion 02 - Exercise 02: Typ-Hierarchie
 *
 * Pruefe mit: npx tsx exercises/02-typ-hierarchie.ts
 *
 * In dieser Uebung testest du dein Verstaendnis der TypeScript-Typhierarchie.
 *
 *                     unknown (Top Type)
 *                    /   |   \
 *              string  number  boolean  ...
 *                    \   |   /
 *                     never (Bottom Type)
 *
 * Regeln:
 * - @ts-expect-error bedeutet: Die naechste Zeile SOLL einen Fehler haben.
 *   Wenn kein Fehler kommt, ist @ts-expect-error selbst ein Fehler.
 * - Deine Aufgabe: Entscheide fuer jede Zuweisung, ob sie GUELTIG oder
 *   UNGUELTIG ist, und setze @ts-expect-error nur vor die ungueltigen Zeilen.
 *
 * AKTUELL sind alle @ts-expect-error Markierungen ENTFERNT.
 * Du musst selbst entscheiden, welche Zeilen einen Fehler verursachen,
 * und dort @ts-expect-error hinzufuegen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 1: Was ist unknown zuweisbar?
// ═══════════════════════════════════════════════════════════════════════════

// unknown ist der Top Type — ALLES sollte zuweisbar sein.
// TODO: Pruefe welche Zuweisungen gueltig sind.
//       Fuege @ts-expect-error vor UNGUELTIGEN Zuweisungen ein.

let u: unknown;

u = "hallo";          // string → unknown: gueltig oder ungueltig?
u = 42;               // number → unknown: gueltig oder ungueltig?
u = true;             // boolean → unknown: gueltig oder ungueltig?
u = null;             // null → unknown: gueltig oder ungueltig?
u = undefined;        // undefined → unknown: gueltig oder ungueltig?
u = Symbol("test");   // symbol → unknown: gueltig oder ungueltig?
u = 42n;              // bigint → unknown: gueltig oder ungueltig?

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: Kann man unknown zu anderen Typen zuweisen?
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Welche dieser Zuweisungen sind gueltig?
//       Fuege @ts-expect-error vor UNGUELTIGEN Zuweisungen ein.

const einUnknown: unknown = "test";

let s: string = einUnknown;       // unknown → string?
let n: number = einUnknown;       // unknown → number?
let b: boolean = einUnknown;      // unknown → boolean?
let a: any = einUnknown;          // unknown → any?
let u2: unknown = einUnknown;     // unknown → unknown?

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 3: Was ist any zuweisbar? Und was kann any zugewiesen werden?
// ═══════════════════════════════════════════════════════════════════════════

// any bricht die normalen Regeln. Alles geht in beide Richtungen.
// TODO: Welche dieser Zuweisungen sind gueltig?
//       Fuege @ts-expect-error vor UNGUELTIGEN Zuweisungen ein.

let einAny: any = "ich bin any";

let s2: string = einAny;          // any → string?
let n2: number = einAny;          // any → number?
let b2: boolean = einAny;         // any → boolean?
let u3: unknown = einAny;         // any → unknown?

einAny = "hallo";                 // string → any?
einAny = 42;                      // number → any?
einAny = true;                    // boolean → any?
einAny = null;                    // null → any?

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 4: never — der Bottom Type
// ═══════════════════════════════════════════════════════════════════════════

// never ist keinem Typ zuweisbar (ausser sich selbst),
// aber never IST jedem Typ zuweisbar.
// TODO: Welche Zuweisungen sind gueltig?

// Hilfsfunktion die never zurueckgibt:
function gibNever(): never {
  throw new Error("never");
}

// HINWEIS: Wir verwenden eine nie-wahre Bedingung, damit die Zeilen
// vom Compiler geprueft werden, aber zur Laufzeit nicht ausgefuehrt werden.
// (gibNever() wuerde sonst sofort einen Error werfen!)
if (false as boolean) {
  let s3: string = gibNever();      // never → string?
  let n3: number = gibNever();      // never → number?
  let b3: boolean = gibNever();     // never → boolean?
  let u4: unknown = gibNever();     // never → unknown?
  let a2: any = gibNever();         // never → any?
  let nev: never = gibNever();      // never → never?

  // In die andere Richtung: Kann man anderen Typen never zuweisen?
  let nev2: never;
  nev2 = "hallo" as never;         // Trick: as never erzwingt die Zuweisung
  nev2 = 42;                        // number → never?
  nev2 = true;                      // boolean → never?
  nev2 = null;                      // null → never?
}

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 5: Type Widening — was passiert mit let vs const?
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Entscheide welche Zuweisungen gueltig sind.
//       Denke daran: const-Variablen bekommen Literal Types,
//       let-Variablen bekommen den breiteren Typ.

const konstante = "hallo";  // Typ ist "hallo" (Literal Type)
let variabel = "hallo";      // Typ ist string (breit)

// Welche sind gueltig?
let test1: "hallo" = konstante;        // "hallo" → "hallo"?
let test2: string = konstante;          // "hallo" → string?
let test3: "hallo" = variabel;          // string → "hallo"?
let test4: "hallo" | "welt" = konstante; // "hallo" → "hallo" | "welt"?

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 6: Null und Undefined in der Hierarchie
// ═══════════════════════════════════════════════════════════════════════════

// Mit strictNullChecks sind null und undefined eigene Typen.
// TODO: Welche Zuweisungen sind gueltig?

let str: string = "test";
str = null;                       // null → string?
str = undefined;                  // undefined → string?

let nullable: string | null = "test";
nullable = null;                  // null → string | null?
nullable = undefined;             // undefined → string | null?
nullable = "hallo";               // string → string | null?

let optional: string | undefined = "test";
optional = undefined;             // undefined → string | undefined?
optional = null;                  // null → string | undefined?

// ═══════════════════════════════════════════════════════════════════════════
// ZUSAMMENFASSUNG
// ═══════════════════════════════════════════════════════════════════════════

// Wenn alle @ts-expect-error richtig gesetzt sind, sollte dieser Befehl
// KEINE Fehler zeigen: npx tsc --noEmit exercises/02-typ-hierarchie.ts
//
// Tipp: Jede Zeile mit @ts-expect-error MUSS einen Fehler in der
// darauffolgenden Zeile haben. Wenn der Fehler fehlt, meldet TypeScript
// das @ts-expect-error als "unused".

console.log("Typ-Hierarchie Exercise geladen.");
console.log("Fuege @ts-expect-error vor den ungueltigen Zuweisungen ein.");
console.log("Pruefe mit: npx tsc --noEmit exercises/02-typ-hierarchie.ts");
