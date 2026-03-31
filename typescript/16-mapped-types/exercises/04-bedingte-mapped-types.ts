/**
 * Lektion 16 - Exercise 04: Bedingte Mapped Types
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-bedingte-mapped-types.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: OmitByType<T, U>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere OmitByType<T, U> das alle Properties entfernt
// deren Wert-Typ U entspricht.
// type OmitByType<T, U> = { ... }

interface Mixed {
  name: string;
  count: number;
  active: boolean;
  label: string;
}
// OmitByType<Mixed, string> = { count: number; active: boolean; }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Validators<T> generieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Validators<T> das fuer jede Property eine
// Validierungsfunktion mit dem passenden Parameter-Typ generiert.
// string-Props -> (v: string) => boolean
// number-Props -> (v: number) => boolean
// Andere -> (v: unknown) => boolean
// type Validators<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: NullableOptionals<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere NullableOptionals<T> das nur OPTIONALEN Properties
// den Typ | null hinzufuegt. Pflicht-Properties bleiben unveraendert.
// Tipp: undefined extends T[K] prueft ob K optional ist.
// type NullableOptionals<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Stringify<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Stringify<T> das alle number- und boolean-Properties
// zu string macht. string-Properties bleiben unveraendert.
// type Stringify<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: ReadonlyDeep fuer Arrays
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere DeepReadonlyWithArrays<T> das:
// - Primitive direkt durchreicht
// - Arrays zu readonly Arrays macht (readonly T[])
// - Objekte rekursiv readonly macht
// type DeepReadonlyWithArrays<T> = { ... }
