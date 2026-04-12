/**
 * Lektion 02 - Solution 02: Typ-Hierarchie
 *
 * Pruefe mit: npx tsc --noEmit solutions/02-typ-hierarchie.ts
 *
 * Vollstaendige Loesung mit Erklaerungen.
 *
 * Zusammenfassung der Hierarchie:
 *
 *                     unknown (Top Type)
 *                    /   |   \
 *              string  number  boolean  symbol  bigint
 *                    \   |   /
 *                     never (Bottom Type)
 *
 * Regeln:
 * 1. ALLES ist unknown zuweisbar (Top Type nimmt alles auf)
 * 2. unknown ist NICHTS zuweisbar (ausser unknown und any)
 * 3. never ist ALLEM zuweisbar (Bottom Type passt ueberall)
 * 4. NICHTS ist never zuweisbar (kein Wert kann never sein)
 * 5. any bricht ALLE Regeln (in beide Richtungen)
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 1: Was ist unknown zuweisbar?
// ═══════════════════════════════════════════════════════════════════════════

// ANTWORT: ALLES ist unknown zuweisbar! Kein einziger @ts-expect-error noetig.
// unknown ist der Top Type — er akzeptiert jeden Wert.

let u: unknown;

u = "hallo";          // string → unknown: GUELTIG (alles geht zu unknown)
u = 42;               // number → unknown: GUELTIG
u = true;             // boolean → unknown: GUELTIG
u = null;             // null → unknown: GUELTIG
u = undefined;        // undefined → unknown: GUELTIG
u = Symbol("test");   // symbol → unknown: GUELTIG
u = 42n;              // bigint → unknown: GUELTIG

// ERKLAERUNG: unknown ist wie ein grosser Eimer — alles passt rein.
// Das macht unknown zum sicheren "ich weiss nicht was es ist" Typ.

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: Kann man unknown zu anderen Typen zuweisen?
// ═══════════════════════════════════════════════════════════════════════════

// ANTWORT: unknown ist NUR unknown und any zuweisbar — sonst nichts!
// Das ist der Sicherheitsmechanismus: Du musst ERST pruefen.

const einUnknown: unknown = "test";

// @ts-expect-error — unknown ist nicht string zuweisbar (erst pruefen!)
let s: string = einUnknown;

// @ts-expect-error — unknown ist nicht number zuweisbar
let n: number = einUnknown;

// @ts-expect-error — unknown ist nicht boolean zuweisbar
let b: boolean = einUnknown;

let a: any = einUnknown;          // unknown → any: GUELTIG (any nimmt alles)
let u2: unknown = einUnknown;     // unknown → unknown: GUELTIG (gleicher Typ)

// ERKLAERUNG: Man kann aus dem grossen Eimer (unknown) nichts direkt
// in ein kleines Gefaess (string, number usw.) giessen.
// Erst muss man pruefen was drin ist (typeof, instanceof, etc.).

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 3: Was ist any zuweisbar? Und was kann any zugewiesen werden?
// ═══════════════════════════════════════════════════════════════════════════

// ANTWORT: any bricht ALLE Regeln. Alles geht in beide Richtungen.
// Kein einziger @ts-expect-error noetig!

let einAny: any = "ich bin any";

let s2: string = einAny;          // any → string: GUELTIG (any bricht die Regeln)
let n2: number = einAny;          // any → number: GUELTIG
let b2: boolean = einAny;         // any → boolean: GUELTIG
let u3: unknown = einAny;         // any → unknown: GUELTIG

einAny = "hallo";                 // string → any: GUELTIG
einAny = 42;                      // number → any: GUELTIG
einAny = true;                    // boolean → any: GUELTIG
einAny = null;                    // null → any: GUELTIG

// ERKLAERUNG: any ist der "Escape Hatch" — es umgeht das gesamte Typsystem.
// Deshalb ist any so gefaehrlich: TypeScript kann keine Fehler mehr erkennen.
// any ist WEDER Top noch Bottom Type — es ist ein Typ der die Regeln bricht.

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 4: never — der Bottom Type
// ═══════════════════════════════════════════════════════════════════════════

function gibNever(): never {
  throw new Error("never");
}

// HINWEIS: Wir verwenden eine nie-wahre Bedingung, damit die Zeilen
// vom Compiler geprueft werden, aber zur Laufzeit nicht ausgefuehrt werden.
if (false as boolean) {
  // never IST jedem Typ zuweisbar (Bottom Type ist Subtyp von allem):
  let s3: string = gibNever();      // never → string: GUELTIG
  let n3: number = gibNever();      // never → number: GUELTIG
  let b3: boolean = gibNever();     // never → boolean: GUELTIG
  let u4: unknown = gibNever();     // never → unknown: GUELTIG
  let a2: any = gibNever();         // never → any: GUELTIG
  let nev: never = gibNever();      // never → never: GUELTIG

  // ABER: Nichts ist never zuweisbar (kein Wert existiert fuer never):
  let nev2: never;
  nev2 = "hallo" as never;         // Trick mit "as never" — erzwungen, nicht natuerlich

  // @ts-expect-error — number ist nicht never zuweisbar
  nev2 = 42;

  // @ts-expect-error — boolean ist nicht never zuweisbar
  nev2 = true;

  // @ts-expect-error — null ist nicht never zuweisbar
  nev2 = null;
}

// ERKLAERUNG: never ist der "leere Typ" — kein Wert gehoert zu never.
// Deshalb kann man never ueberall einsetzen (es passiert ja nie),
// aber nichts kann never sein (es gibt keinen never-Wert).

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 5: Type Widening — let vs const
// ═══════════════════════════════════════════════════════════════════════════

const konstante = "hallo";  // Typ: "hallo" (Literal Type, weil const)
let variabel = "hallo";      // Typ: string (breit, weil let sich aendern kann)

let test1: "hallo" = konstante;         // "hallo" → "hallo": GUELTIG (gleich)
let test2: string = konstante;           // "hallo" → string: GUELTIG (Literal passt in breiteren Typ)

// @ts-expect-error — string ist nicht "hallo" zuweisbar (zu breit fuer Literal)
let test3: "hallo" = variabel;

let test4: "hallo" | "welt" = konstante; // "hallo" → "hallo" | "welt": GUELTIG

// ERKLAERUNG:
// - const "hallo" → TypeScript weiss: es ist GENAU "hallo", aendert sich nie
// - let "hallo" → TypeScript denkt: es ist irgendein string, koennte sich aendern
// - Ein Literal Type ("hallo") passt immer in seinen breiteren Typ (string)
// - Aber string passt NICHT in einen Literal Type — zu viele Moeglichkeiten

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 6: Null und Undefined in der Hierarchie
// ═══════════════════════════════════════════════════════════════════════════

// Mit strictNullChecks (unser Standard):
// null und undefined sind EIGENE Typen und muessen explizit erlaubt werden.

let str: string = "test";

// @ts-expect-error — null ist nicht string zuweisbar
str = null;

// @ts-expect-error — undefined ist nicht string zuweisbar
str = undefined;

let nullable: string | null = "test";
nullable = null;                  // null → string | null: GUELTIG (null ist erlaubt)

// @ts-expect-error — undefined ist nicht string | null zuweisbar
nullable = undefined;

nullable = "hallo";               // string → string | null: GUELTIG

let optional: string | undefined = "test";
optional = undefined;             // undefined → string | undefined: GUELTIG

// @ts-expect-error — null ist nicht string | undefined zuweisbar
optional = null;

// ERKLAERUNG:
// - string | null erlaubt NUR null, nicht undefined
// - string | undefined erlaubt NUR undefined, nicht null
// - Wenn man beides will: string | null | undefined
// - Das ist der Vorteil von strictNullChecks: Praezise Kontrolle

// ═══════════════════════════════════════════════════════════════════════════
// ZUSAMMENFASSUNG
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== Zusammenfassung der Typ-Hierarchie ===\n");
console.log("1. unknown (Top Type): Nimmt ALLES auf, gibt NICHTS ab");
console.log("2. never (Bottom Type): Gibt ALLES ab, nimmt NICHTS auf");
console.log("3. any: Bricht ALLE Regeln (vermeiden!)");
console.log("4. Literal Types: Enger als ihre Basistypen");
console.log("5. null/undefined: Eigene Typen mit strictNullChecks");
console.log("");
console.log("        unknown   (Top — alles rein, nichts raus)");
console.log("       /   |   \\");
console.log("  string number boolean symbol bigint null undefined");
console.log("       \\   |   /");
console.log("        never     (Bottom — nichts rein, alles raus)");
console.log("");
console.log("  any ← bricht die Regeln, steht ausserhalb der Hierarchie");
console.log("\n✅ Alle @ts-expect-error Markierungen sind korrekt!");
