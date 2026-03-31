/**
 * Lektion 16 - Exercise 03: Eigene Utility Types
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-eigene-utility-types.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: DeepPartial<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere DeepPartial<T> das REKURSIV alle Properties
// auf allen Ebenen optional macht. Funktionen sollen nicht eingepackt werden.
// type DeepPartial<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: DeepReadonly<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere DeepReadonly<T> das REKURSIV alle Properties
// auf allen Ebenen readonly macht.
// type DeepReadonly<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: PartialBy<T, K>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere PartialBy<T, K extends keyof T> das nur die
// angegebenen Keys K optional macht, alle anderen bleiben Pflicht.
// type PartialBy<T, K extends keyof T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: RequiredBy<T, K>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere RequiredBy<T, K extends keyof T> das nur die
// angegebenen Keys K zur Pflicht macht, alle anderen bleiben wie sie sind.
// type RequiredBy<T, K extends keyof T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: RequiredKeys<T> und OptionalKeys<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere RequiredKeys<T> das die NAMEN aller Pflicht-Properties
// als Union zurueckgibt.
// TODO: Implementiere OptionalKeys<T> das die NAMEN aller optionalen Properties
// als Union zurueckgibt.
// Tipp: {} extends Pick<T, K> ist true wenn K optional ist.

interface TestUser {
  id: number;
  name: string;
  bio?: string;
  avatar?: string;
}
// RequiredKeys<TestUser> = "id" | "name"
// OptionalKeys<TestUser> = "bio" | "avatar"
