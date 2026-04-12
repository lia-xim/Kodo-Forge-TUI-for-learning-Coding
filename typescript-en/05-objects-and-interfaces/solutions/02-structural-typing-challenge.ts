/**
 * Lektion 05 - Loesung 02: Structural Typing Challenge
 *
 * Vollstaendige Loesungen mit ausfuehrlichen Erklaerungen zu jedem Szenario.
 *
 * Ausfuehren: npx tsx solutions/02-structural-typing-challenge.ts
 */

import type { Expect, Equal, IsSubtype } from "../../tools/type-test.ts";

// ─── Setup-Typen ──────────────────────────────────────────────────────────

interface Tier {
  name: string;
  beine: number;
}

interface Haustier {
  name: string;
  beine: number;
  besitzer: string;
}

interface Fisch {
  name: string;
  flopigeFlossen: number;
}

interface Punkt2D {
  x: number;
  y: number;
}

interface Punkt3D {
  x: number;
  y: number;
  z: number;
}

// ─── Szenario 1: Subtyp-Zuweisung ────────────────────────────────────────
//
// ANTWORT: GUELTIG!
//
// Erklaerung: Haustier hat { name, beine, besitzer }.
// Tier verlangt nur { name, beine }.
// Haustier hat ALLES was Tier braucht (und mehr).
// -> Haustier ist ein SUBTYP von Tier.
// -> Die Zuweisung ist erlaubt.
//
// Analogie: Wenn du einen "Fuehrerschein Klasse B" brauchst und jemand
// hat "Klasse B + Klasse A" -- das reicht aus! Mehr ist OK.

const katze: Haustier = { name: "Mimi", beine: 4, besitzer: "Lisa" };

const tier1: Tier = katze; // OK! Haustier hat alles was Tier braucht.

// ─── Szenario 2: Umgekehrte Subtyp-Zuweisung ─────────────────────────────
//
// ANTWORT: UNGUELTIG!
//
// Erklaerung: Tier hat { name, beine }.
// Haustier verlangt { name, beine, besitzer }.
// Tier hat NICHT 'besitzer' -- es fehlt eine Property!
// -> Tier ist KEIN Subtyp von Haustier.
// -> Die Zuweisung ist NICHT erlaubt.
//
// Analogie: Wenn du "Klasse B + Klasse A" brauchst und jemand nur
// "Klasse B" hat -- das reicht NICHT.

const hund: Tier = { name: "Rex", beine: 4 };

// @ts-expect-error -- Tier hat nicht 'besitzer', Haustier braucht es aber
const haustier1: Haustier = hund;

// ─── Szenario 3: Excess Property Checking ─────────────────────────────────
//
// ANTWORT: UNGUELTIG! (Excess Property Checking)
//
// Erklaerung: Das ist ein FRISCHES Object Literal. Bei frischen Object
// Literals fuehrt TypeScript den Excess Property Check durch.
// 'schwimmt' ist NICHT in Tier definiert -> Fehler!
//
// Das ist die "grosse Falle" des Structural Typing. Normalerweise sind
// extra Properties OK (Structural Typing), aber bei FRISCHEN Object
// Literals werden sie verboten.
//
// WARUM? Weil es fast immer ein Bug ist -- z.B. ein Tippfehler.

// @ts-expect-error -- Frisches Object Literal: 'schwimmt' ist eine Excess Property
const tier2: Tier = { name: "Goldi", beine: 0, schwimmt: true };

// ─── Szenario 4: Excess Check umgehen via Variable ────────────────────────
//
// ANTWORT: GUELTIG!
//
// Erklaerung: fischDaten ist KEIN frisches Object Literal mehr -- es ist
// eine Variable. Bei Variablen gibt es KEINEN Excess Property Check.
// TypeScript prueft nur: Hat fischDaten alle Properties von Tier?
// name: string -> ja. beine: number -> ja. -> Kompatibel!
//
// Die extra Property 'schwimmt' wird einfach "vergessen" -- sie ist
// ueber die Variable tier3 nicht zugreifbar, aber das Objekt ist kompatibel.

const fischDaten = { name: "Goldi", beine: 0, schwimmt: true };

const tier3: Tier = fischDaten; // OK! Ueber Variable -> kein Excess Check

// ─── Szenario 5: Inkompatible Strukturen ──────────────────────────────────
//
// ANTWORT: UNGUELTIG!
//
// Erklaerung: Fisch hat { name, flopigeFlossen }.
// Tier verlangt { name, beine }.
// Fisch hat 'name' -> OK.
// Fisch hat NICHT 'beine' -> FEHLT!
// -> Fisch ist KEIN Subtyp von Tier, egal ueber Variable oder nicht.
//
// Das ist KEIN Excess Property Check, sondern schlicht eine fehlende
// Property. 'flopigeFlossen' ersetzt nicht 'beine' -- der Name zaehlt!

const nemo: Fisch = { name: "Nemo", flopigeFlossen: 2 };

// @ts-expect-error -- Fisch hat kein 'beine', Tier braucht es aber
const tier4: Tier = nemo;

// ─── Szenario 6: Dimensions-Upgrade und Downgrade ─────────────────────────

const punkt3d: Punkt3D = { x: 1, y: 2, z: 3 };
const punkt2d: Punkt2D = { x: 4, y: 5 };

// ANTWORT: GUELTIG!
//
// Erklaerung: Punkt3D hat { x, y, z }. Punkt2D braucht { x, y }.
// Punkt3D hat alles was Punkt2D braucht -> Kompatibel!
// Das extra 'z' wird bei Variablen-Zuweisung ignoriert.
const flach: Punkt2D = punkt3d; // OK! 3D hat x und y

// ANTWORT: UNGUELTIG!
//
// Erklaerung: Punkt2D hat { x, y }. Punkt3D braucht { x, y, z }.
// Punkt2D hat NICHT 'z' -> Es fehlt eine Property -> Fehler!
// @ts-expect-error -- Punkt2D hat kein 'z', Punkt3D braucht es aber
const raeumlich: Punkt3D = punkt2d;

// ─── Type-Level Tests ─────────────────────────────────────────────────────

// Haustier ist ein Subtyp von Tier: JA (true)
// Haustier hat alles was Tier braucht (name, beine) plus mehr (besitzer)
type HaustierIstTier = true;
type test_1 = Expect<Equal<IsSubtype<Haustier, Tier>, HaustierIstTier>>;

// Tier ist ein Subtyp von Haustier: NEIN (false)
// Tier hat NICHT alles was Haustier braucht (kein besitzer)
type TierIstHaustier = false;
type test_2 = Expect<Equal<IsSubtype<Tier, Haustier>, TierIstHaustier>>;

// Punkt3D ist ein Subtyp von Punkt2D: JA (true)
// Punkt3D hat alles was Punkt2D braucht (x, y) plus mehr (z)
type Punkt3DIst2D = true;
type test_3 = Expect<Equal<IsSubtype<Punkt3D, Punkt2D>, Punkt3DIst2D>>;

// Fisch ist ein Subtyp von Tier: NEIN (false)
// Fisch hat NICHT 'beine' -- nur 'name' und 'flopigeFlossen'
type FischIstTier = false;
type test_4 = Expect<Equal<IsSubtype<Fisch, Tier>, FischIstTier>>;

// ─── Zusammenfassung der Regeln ──────────────────────────────────────────
//
// Structural Typing Regel:
// Ein Typ A ist einem Typ B zuweisbar, wenn A MINDESTENS alle Properties
// von B hat, mit kompatiblen Typen.
//
// Extra Properties in A sind erlaubt (A ist ein "Subtyp" von B).
// Fehlende Properties in A fuehren zu einem Fehler.
//
// AUSNAHME: Bei frischen Object Literals werden extra Properties
// als Fehler markiert (Excess Property Checking), um Tippfehler zu finden.
//
// Merkregel:
// - Mehr Properties = speziellerer Typ = Subtyp
// - Weniger Properties = allgemeinerer Typ = Supertyp
// - Subtyp -> Supertyp: IMMER OK
// - Supertyp -> Subtyp: FEHLER (es fehlen Properties)

console.log("Alle Szenarien korrekt geloest!");
console.log("Fuehre 'npx tsc --noEmit' aus, um die Type-Checks zu pruefen.");
