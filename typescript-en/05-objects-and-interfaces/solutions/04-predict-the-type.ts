/**
 * Lektion 05 - Solution 04: Predict the Type
 *
 * Alle Vorhersagen aufgeloest mit Erklaerungen.
 */

import type { Expect, Equal, IsSubtype } from "../../tools/type-test.ts";

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 1: Structural Typing -- Gleiche Struktur, andere Namen
// ═══════════════════════════════════════════════════════════════════════════

interface Katze { name: string; miau(): void; }
interface Hund  { name: string; miau(): void; }

// ANTWORT: true -- beide haben exakt dieselbe Struktur.
// In einem nominalen System waeren sie verschieden (verschiedene Namen).
// In TypeScript (structural) sind sie identisch und gegenseitig zuweisbar.
type Snippet1a = true;
type test_1a = Expect<Equal<IsSubtype<Katze, Hund>, Snippet1a>>;

type Snippet1b = true;
type test_1b = Expect<Equal<IsSubtype<Hund, Katze>, Snippet1b>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 2: Excess Property Checking
// ═══════════════════════════════════════════════════════════════════════════

interface SimplePerson { name: string; }

// Fall A: ANTWORT: false -- frisches Literal = Excess Property Check greift.
// 'age' ist nicht in SimplePerson definiert.
type Snippet2a = false;
type test_2a = Expect<Equal<Snippet2a, false>>;

// Fall B: ANTWORT: true -- Variable = kein Excess Check.
// tempPerson hat name: string (gefordert) + age: number (extra, ignoriert).
const tempPerson = { name: "Max", age: 30 };
const b: SimplePerson = tempPerson;
type Snippet2b = true;
type test_2b = Expect<Equal<Snippet2b, true>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 3: Intersection-Konflikt
// ═══════════════════════════════════════════════════════════════════════════

type TypeA = { status: string };
type TypeB = { status: number };
type Combined = TypeA & TypeB;

// ANTWORT: never -- string & number ist unmoeglich.
// Kein Wert kann gleichzeitig string UND number sein.
type Snippet3 = never;
type test_3 = Expect<Equal<Combined["status"], Snippet3>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 4: Intersection mit Union-Typen
// ═══════════════════════════════════════════════════════════════════════════

type Left  = { value: "a" | "b" | "c" };
type Right = { value: "b" | "c" | "d" };
type Merged = Left & Right;

// ANTWORT: "b" | "c" -- die Schnittmenge der beiden Unions.
// ("a" | "b" | "c") & ("b" | "c" | "d") = "b" | "c"
// Nur Werte die in BEIDEN Unions vorkommen, ueberleben.
type Snippet4 = "b" | "c";
type test_4 = Expect<Equal<Merged["value"], Snippet4>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 5: Pick & Omit ergaenzen sich
// ═══════════════════════════════════════════════════════════════════════════

interface FullUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

type Picked = Pick<FullUser, "id" | "name">;
type Omitted = Omit<FullUser, "id" | "name">;

// ANTWORT: true -- Picked & Omitted ergibt die vollstaendige Struktur.
// Pick waehlt {id, name}, Omit waehlt {email, password}.
// Zusammen per & ergibt das {id, name, email, password} = FullUser.
type Snippet5 = true;
type test_5 = Expect<Equal<IsSubtype<Picked & Omitted, FullUser>, Snippet5>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 6: Das leere Interface
// ═══════════════════════════════════════════════════════════════════════════

interface Empty {}

const testEmpty: Empty = "hallo";

// ANTWORT: true -- ein leeres Interface verlangt KEINE Properties.
// Structural Typing: Jeder Typ "hat mindestens nichts". Strings haben
// keine fehlenden Properties gegenueber {}, also passen sie.
// (Nur null und undefined passen nicht, weil strictNullChecks.)
type Snippet6a = true;
type test_6a = Expect<Equal<IsSubtype<string, Empty>, Snippet6a>>;

// ANTWORT: false -- null extends {} ergibt false mit strictNullChecks.
// In einem Conditional Type `null extends {} ? true : false` ergibt false,
// weil null ein eigener Typ ist und nicht als Subtyp von {} gilt.
// HINWEIS: Ohne strictNullChecks waere das Ergebnis anders.
type Snippet6b = false;
type test_6b = Expect<Equal<IsSubtype<null, Empty>, Snippet6b>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 7: Readonly Soundness-Luecke
// ═══════════════════════════════════════════════════════════════════════════

interface ReadonlyUser { readonly name: string; readonly age: number; }
interface MutableUser  { name: string; age: number; }

// ANTWORT: true -- readonly wird bei Assignability ignoriert!
// Das ist eine bewusste Soundness-Luecke in TypeScript.
type Snippet7a = true;
type test_7a = Expect<Equal<IsSubtype<ReadonlyUser, MutableUser>, Snippet7a>>;

// ANTWORT: true -- auch in die andere Richtung.
// MutableUser -> ReadonlyUser geht ebenfalls (was auch Sinn macht:
// du machst etwas "strenger", das ist sicher).
type Snippet7b = true;
type test_7b = Expect<Equal<IsSubtype<MutableUser, ReadonlyUser>, Snippet7b>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 8: Partial<Required<T>> hebt sich NICHT auf
// ═══════════════════════════════════════════════════════════════════════════

interface Config {
  host: string;
  port?: number;
  debug?: boolean;
}

type RoundTrip = Partial<Required<Config>>;

// ANTWORT: false -- RoundTrip ist NICHT identisch mit Config!
//
// Config:              { host: string; port?: number; debug?: boolean }
// Required<Config>:    { host: string; port: number;  debug: boolean }
// Partial<Req<Config>>:{ host?: string; port?: number; debug?: boolean }
//
// host war in Config PFLICHT, ist nach dem Round-Trip OPTIONAL.
// Partial und Required sind KEINE inversen Operationen!
type Snippet8 = false;
type test_8 = Expect<Equal<Equal<RoundTrip, Config>, Snippet8>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 9: Excess Check bei Funktionsparametern
// ═══════════════════════════════════════════════════════════════════════════

interface SearchParams {
  query: string;
  limit: number;
}

function search(params: SearchParams): void { /* ... */ }

// Fall A: ANTWORT: false -- frisches Literal als Funktionsargument.
// TypeScript behandelt { ... } direkt im Funktionsaufruf als frisches Literal.
type Snippet9a = false;
type test_9a = Expect<Equal<Snippet9a, false>>;

// Fall B: ANTWORT: true -- Spread erzeugt ein neues Objekt, das einer
// Variable zugewiesen wird. 'extra' ist keine frisches Literal mehr.
const base = { query: "test", limit: 10 };
const extra = { ...base, page: 1 };
search(extra);
type Snippet9b = true;
type test_9b = Expect<Equal<Snippet9b, true>>;

// ═══════════════════════════════════════════════════════════════════════════
// Snippet 10: Width Subtyping
// ═══════════════════════════════════════════════════════════════════════════

interface HasId { id: string; }
interface HasName2 { name: string; }
interface HasBoth { id: string; name: string; }

// ANTWORT: true -- HasBoth hat id (gefordert) + name (extra).
type Snippet10a = true;
type test_10a = Expect<Equal<IsSubtype<HasBoth, HasId>, Snippet10a>>;

// ANTWORT: true -- HasBoth hat name (gefordert) + id (extra).
type Snippet10b = true;
type test_10b = Expect<Equal<IsSubtype<HasBoth, HasName2>, Snippet10b>>;

// ANTWORT: false -- ueberraschend! Obwohl HasBoth und HasId & HasName2
// strukturell kompatibel sind (gegenseitig zuweisbar), sind sie fuer den
// strengen Equal-Check NICHT identisch. Ein Interface und eine Intersection
// sind intern verschiedene Typen. Equal<> nutzt einen Trick mit Conditional
// Types der die interne Repraesentation vergleicht, nicht nur die Struktur.
// In der Praxis ist das selten relevant -- aber es zeigt: "strukturell
// gleich" und "identisch" sind verschiedene Dinge.
type Snippet10c = false;
type test_10c = Expect<Equal<Equal<HasBoth, HasId & HasName2>, Snippet10c>>;

console.log("Alle Vorhersagen korrekt! Du verstehst Structural Typing.");
