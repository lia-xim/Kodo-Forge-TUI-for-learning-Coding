/**
 * Lektion 05 - Exercise 04: Predict the Type
 *
 * 10 Code-Snippets. Fuer jedes Snippet:
 * 1. Lies den Code OHNE den Compiler laufen zu lassen
 * 2. Ueberlege: Was ist der resultierende Typ? Kompiliert es oder nicht?
 * 3. Ersetze 'TODO' durch deine Vorhersage
 * 4. Pruefe mit: npx tsc --noEmit exercises/04-predict-the-type.ts
 *
 * Nutze Expect<Equal<>> fuer Type-Level-Checks.
 * Wenn deine Vorhersage stimmt, kompiliert der Code ohne Fehler.
 *
 * Themen: Structural Typing Ueberraschungen, Excess Property Checking,
 *         extends vs. &, Utility Types, Readonly-Luecken
 */

import type { Expect, Equal, IsSubtype } from "../../tools/type-test.ts";

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 1: Structural Typing -- Gleiche Struktur, andere Namen
// ═══════════════════════════════════════════════════════════════════════════
//
// Frage: Ist 'cat' assignable zu 'tier'? Und umgekehrt?
// Denke an: Haben beide die GLEICHE Struktur?

interface Katze { name: string; miau(): void; }
interface Hund  { name: string; miau(): void; }
//                               ^^^^^^ Ja, der Hund miaut. Absicht!

// Vorhersage: Ist Katze ein Subtyp von Hund?
// TODO: Ersetze 'never' durch true oder false
type Snippet1a = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_1a = Expect<Equal<IsSubtype<Katze, Hund>, Snippet1a>>;

// Vorhersage: Ist Hund ein Subtyp von Katze?
// TODO: Ersetze 'never' durch true oder false
type Snippet1b = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_1b = Expect<Equal<IsSubtype<Hund, Katze>, Snippet1b>>;

// Rubber-Duck-Prompt: Erklaere, warum die NAMEN der Interfaces keine Rolle spielen.
// Was zaehlt stattdessen?

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 2: Excess Property Checking -- Wann greift der Check?
// ═══════════════════════════════════════════════════════════════════════════
//
// Gegeben:
interface SimplePerson { name: string; }

// Fall A: Frisches Literal
// const a: SimplePerson = { name: "Max", age: 30 };
// Frage: Kompiliert das?
// TODO: Ersetze 'never' durch true oder false
type Snippet2a = never;
// true = kompiliert, false = Fehler
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_2a = Expect<Equal<Snippet2a, false>>; // Excess Property Check greift!

// Fall B: Ueber Variable
const tempPerson = { name: "Max", age: 30 };
const b: SimplePerson = tempPerson;
// Frage: Kompiliert das?
// TODO: Ersetze 'never' durch true oder false
type Snippet2b = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_2b = Expect<Equal<Snippet2b, true>>; // Variable = kein Excess Check

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 3: extends-Konflikt vs. &-Konflikt
// ═══════════════════════════════════════════════════════════════════════════
//
// Was passiert bei einem Property-Konflikt?

type TypeA = { status: string };
type TypeB = { status: number };

type Combined = TypeA & TypeB;

// Frage: Was ist der Typ von Combined["status"]?
// TODO: Ersetze 'never' durch den resultierenden Typ
type Snippet3 = never;
type test_3 = Expect<Equal<Combined["status"], Snippet3>>;
// Tipp: string & number = ???

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 4: Intersection mit kompatiblen Union-Typen
// ═══════════════════════════════════════════════════════════════════════════
//
// Was passiert wenn BEIDE Seiten Union-Typen sind?

type Left  = { value: "a" | "b" | "c" };
type Right = { value: "b" | "c" | "d" };

type Merged = Left & Right;

// Frage: Was ist der Typ von Merged["value"]?
// Denke an: Welche Werte sind in BEIDEN Unions enthalten?
// TODO: Ersetze 'never' durch den resultierenden Typ
type Snippet4 = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_4 = Expect<Equal<Merged["value"], Snippet4>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 5: Utility Type -- Pick und Omit Ueberraschung
// ═══════════════════════════════════════════════════════════════════════════

interface FullUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

type Picked = Pick<FullUser, "id" | "name">;
type Omitted = Omit<FullUser, "id" | "name">;

// Frage: Sind Picked und Omitted zusammen wieder das volle FullUser?
// TODO: Ersetze 'never' durch true oder false
type Snippet5 = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_5 = Expect<Equal<IsSubtype<Picked & Omitted, FullUser>, Snippet5>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 6: Das leere Interface -- Eine Ueberraschung
// ═══════════════════════════════════════════════════════════════════════════

interface Empty {}

// Frage: Kann man einen String einem leeren Interface zuweisen?
const testEmpty: Empty = "hallo";
// Kompiliert das?

// TODO: Ersetze 'never' durch true oder false
type Snippet6a = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_6a = Expect<Equal<IsSubtype<string, Empty>, Snippet6a>>;

// Frage: Besteht null den 'extends'-Check gegenueber einem leeren Interface?
// Das ist ein subtiler Punkt -- denke genau nach!
// TODO: Ersetze 'never' durch true oder false
type Snippet6b = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_6b = Expect<Equal<IsSubtype<null, Empty>, Snippet6b>>;

// Rubber-Duck-Prompt: Warum kann ein String einem leeren Interface zugewiesen werden?
// Denke an Structural Typing: Was verlangt ein leeres Interface? NICHTS.
// Tipp: 'extends' in Conditional Types und Assignability sind subtil verschieden.

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 7: Readonly -- Die Soundness-Luecke
// ═══════════════════════════════════════════════════════════════════════════

interface ReadonlyUser { readonly name: string; readonly age: number; }
interface MutableUser  { name: string; age: number; }

// Frage: Kann man ReadonlyUser einem MutableUser zuweisen?
// TODO: Ersetze 'never' durch true oder false
type Snippet7a = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_7a = Expect<Equal<IsSubtype<ReadonlyUser, MutableUser>, Snippet7a>>;

// Frage: Kann man MutableUser einem ReadonlyUser zuweisen?
// TODO: Ersetze 'never' durch true oder false
type Snippet7b = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_7b = Expect<Equal<IsSubtype<MutableUser, ReadonlyUser>, Snippet7b>>;

// Ueberraschung? Readonly ist in BEIDE Richtungen assignable!
// Das ist die bekannte Soundness-Luecke von TypeScript.

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 8: Partial<Required<T>> -- Heben sie sich auf?
// ═══════════════════════════════════════════════════════════════════════════

interface Config {
  host: string;
  port?: number;
  debug?: boolean;
}

type RoundTrip = Partial<Required<Config>>;

// Frage: Ist RoundTrip identisch mit Config?
// Denke genau nach: Required macht ALLE Properties pflicht.
// Partial macht danach ALLE optional. Was ist das Ergebnis?
// TODO: Ersetze 'never' durch true oder false
type Snippet8 = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_8 = Expect<Equal<Equal<RoundTrip, Config>, Snippet8>>;

// Tipp: Config hat 'host' als Pflicht und 'port?', 'debug?' als optional.
// Required<Config> macht alle drei zur Pflicht.
// Partial<Required<Config>> macht alle drei optional.
// Also: host WIRD optional, obwohl es vorher Pflicht war!
// RoundTrip != Config!

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 9: Excess Check bei Funktionsparametern
// ═══════════════════════════════════════════════════════════════════════════

interface SearchParams {
  query: string;
  limit: number;
}

function search(params: SearchParams): void { /* ... */ }

// Fall A: Direkt als Argument
// search({ query: "test", limit: 10, page: 1 });
// Kompiliert das?
// TODO: Ersetze 'never' durch true oder false
type Snippet9a = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_9a = Expect<Equal<Snippet9a, false>>; // Frisches Literal = Excess Check!

// Fall B: Spread-Operator
const base = { query: "test", limit: 10 };
const extra = { ...base, page: 1 };
search(extra);
// Kompiliert das?
// TODO: Ersetze 'never' durch true oder false
type Snippet9b = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_9b = Expect<Equal<Snippet9b, true>>; // Spread = Variable = kein Excess Check

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 10: Structural Typing -- Die Width-Subtyping-Falle
// ═══════════════════════════════════════════════════════════════════════════
//
// Das ist die schwierigste Aufgabe. Lies genau!

interface HasId { id: string; }
interface HasName2 { name: string; }
interface HasBoth { id: string; name: string; }

// Frage 1: Ist HasBoth ein Subtyp von HasId?
// TODO: Ersetze 'never' durch true oder false
type Snippet10a = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_10a = Expect<Equal<IsSubtype<HasBoth, HasId>, Snippet10a>>;

// Frage 2: Ist HasBoth ein Subtyp von HasName2?
// TODO: Ersetze 'never' durch true oder false
type Snippet10b = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_10b = Expect<Equal<IsSubtype<HasBoth, HasName2>, Snippet10b>>;

// Frage 3: Ist HasBoth IDENTISCH (Equal) mit HasId & HasName2?
// Achtung: "strukturell kompatibel" und "identisch" sind verschiedene Dinge!
// Equal<> prueft interne Repraesentation, nicht nur Struktur.
// TODO: Ersetze 'never' durch true oder false
type Snippet10c = never;
// @ts-expect-error -- Wird behoben wenn du 'never' ersetzt
type test_10c = Expect<Equal<Equal<HasBoth, HasId & HasName2>, Snippet10c>>;

// Rubber-Duck-Prompt: Erklaere den Zusammenhang:
// "Ein Typ mit MEHR Properties ist ein SUBTYP (spezieller).
//  Ein Typ mit WENIGER Properties ist ein SUPERTYP (allgemeiner).
//  Das ist kontraintuitiv, aber logisch: Mehr Anforderungen = weniger Objekte passen."
// UND: "Strukturell kompatibel heisst nicht identisch. Ein Interface und eine
// Intersection mit derselben Form sind gegenseitig zuweisbar, aber der Compiler
// behandelt sie intern unterschiedlich."

// ═══════════════════════════════════════════════════════════════════════════
// Geschafft!
// ═══════════════════════════════════════════════════════════════════════════

console.log("Wenn dieser Code kompiliert, hast du alle Vorhersagen richtig!");
console.log("Fuehre 'npx tsc --noEmit' aus, um die Type-Checks zu pruefen.");
