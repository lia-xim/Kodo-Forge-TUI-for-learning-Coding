/**
 * Lektion 05 - Exercise 02: Structural Typing Challenge
 *
 * In dieser Uebung testest du dein Verstaendnis von Structural Typing
 * und Excess Property Checking.
 *
 * Fuer jedes Szenario:
 * 1. Ueberlege ZUERST, ob die Zuweisung gueltig ist oder nicht
 * 2. Entferne dann das TODO und schreibe die korrekte Loesung
 *
 * Verwende @ts-expect-error fuer Zeilen, die einen Compiler-Fehler erzeugen sollen.
 * Verwende die type-test Utilities fuer Type-Level Tests.
 *
 * Ausfuehren: npx tsx exercises/02-structural-typing-challenge.ts
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
// Ist diese Zuweisung gueltig?
// Ein Haustier hat alle Properties von Tier (+ besitzer).
// Denke an Structural Typing: Haustier hat ALLES was Tier braucht.

const katze: Haustier = { name: "Mimi", beine: 4, besitzer: "Lisa" };

// TODO: Ist die folgende Zuweisung gueltig? Wenn NEIN, fuege @ts-expect-error hinzu.
//       Wenn JA, lass sie so stehen.
// Tipp: Hat 'katze' alle Properties die 'Tier' braucht?
const tier1: Tier = katze;

// ─── Szenario 2: Umgekehrte Subtyp-Zuweisung ─────────────────────────────
//
// Und umgekehrt? Kann man ein Tier einem Haustier zuweisen?
// Ein Tier hat NICHT alle Properties die Haustier braucht (kein 'besitzer').

const hund: Tier = { name: "Rex", beine: 4 };

// TODO: Ist die folgende Zuweisung gueltig? Wenn NEIN, fuege @ts-expect-error hinzu.
//       Wenn JA, lass sie so stehen.
const haustier1: Haustier = hund;

// ─── Szenario 3: Excess Property Checking ─────────────────────────────────
//
// Frisches Object Literal mit extra Properties -- was passiert?

// TODO: Ist die folgende Zuweisung gueltig? Wenn NEIN, fuege @ts-expect-error hinzu.
//       Denke an: IST das ein frisches Object Literal?
const tier2: Tier = { name: "Goldi", beine: 0, schwimmt: true };

// ─── Szenario 4: Excess Check umgehen via Variable ────────────────────────
//
// Das gleiche Object, aber ueber eine Variable zugewiesen.

const fischDaten = { name: "Goldi", beine: 0, schwimmt: true };

// TODO: Ist die folgende Zuweisung gueltig? Wenn NEIN, fuege @ts-expect-error hinzu.
//       Denke an: IST 'fischDaten' ein frisches Object Literal?
const tier3: Tier = fischDaten;

// ─── Szenario 5: Inkompatible Strukturen ──────────────────────────────────
//
// Fisch hat 'name' aber NICHT 'beine'. Stattdessen 'flopigeFlossen'.
// Ist ein Fisch strukturell kompatibel mit Tier?

const nemo: Fisch = { name: "Nemo", flopigeFlossen: 2 };

// TODO: Ist die folgende Zuweisung gueltig? Wenn NEIN, fuege @ts-expect-error hinzu.
const tier4: Tier = nemo;

// ─── Szenario 6: Dimensions-Upgrade und Downgrade ─────────────────────────
//
// Punkt3D hat alles was Punkt2D hat, plus 'z'.

const punkt3d: Punkt3D = { x: 1, y: 2, z: 3 };
const punkt2d: Punkt2D = { x: 4, y: 5 };

// TODO: Ist die folgende Zuweisung gueltig?
// Punkt3D -> Punkt2D (Downgrade: 3D hat alles was 2D braucht + mehr)
const flach: Punkt2D = punkt3d;

// TODO: Ist die folgende Zuweisung gueltig?
// Punkt2D -> Punkt3D (Upgrade: 2D hat NICHT alles was 3D braucht)
const raeumlich: Punkt3D = punkt2d;

// ─── Type-Level Tests ─────────────────────────────────────────────────────
//
// Vervollstaendige die folgenden Type-Level Tests.
// Ersetze 'never' durch 'true' oder 'false'.
// Wenn du den richtigen Wert eintraegst, kompiliert der Code ohne Fehler!

// Ist Haustier ein Subtyp von Tier? (Hat Haustier alles was Tier braucht?)
// TODO: Ersetze 'never' durch true oder false
type HaustierIstTier = never; // Erwartung: IsSubtype<Haustier, Tier>
// @ts-expect-error -- Wird ein Fehler, bis du 'never' durch den richtigen Wert ersetzt
type test_1 = Expect<Equal<IsSubtype<Haustier, Tier>, HaustierIstTier>>;

// Ist Tier ein Subtyp von Haustier? (Hat Tier alles was Haustier braucht?)
// TODO: Ersetze 'never' durch true oder false
type TierIstHaustier = never; // Erwartung: IsSubtype<Tier, Haustier>
// @ts-expect-error -- Wird ein Fehler, bis du 'never' durch den richtigen Wert ersetzt
type test_2 = Expect<Equal<IsSubtype<Tier, Haustier>, TierIstHaustier>>;

// Ist Punkt3D ein Subtyp von Punkt2D?
// TODO: Ersetze 'never' durch true oder false
type Punkt3DIst2D = never; // Erwartung: IsSubtype<Punkt3D, Punkt2D>
// @ts-expect-error -- Wird ein Fehler, bis du 'never' durch den richtigen Wert ersetzt
type test_3 = Expect<Equal<IsSubtype<Punkt3D, Punkt2D>, Punkt3DIst2D>>;

// Ist Fisch ein Subtyp von Tier?
// TODO: Ersetze 'never' durch true oder false
type FischIstTier = never; // Erwartung: IsSubtype<Fisch, Tier>
// @ts-expect-error -- Wird ein Fehler, bis du 'never' durch den richtigen Wert ersetzt
type test_4 = Expect<Equal<IsSubtype<Fisch, Tier>, FischIstTier>>;

// ─── Bonus: Erklaerungen ─────────────────────────────────────────────────
//
// Wenn du alle Szenarien geloest hast, schreibe hier in eigenen Worten
// die Regel fuer Structural Typing auf:
//
// Deine Erklaerung:
// _____________________________________________________________
// _____________________________________________________________
// _____________________________________________________________

console.log("Wenn dieser Code kompiliert, hast du alles richtig!");
console.log("Fuehre 'npx tsc --noEmit' aus, um die Type-Checks zu pruefen.");
