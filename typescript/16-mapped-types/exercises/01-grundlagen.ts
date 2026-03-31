/**
 * Lektion 16 - Exercise 01: Mapped Types Grundlagen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-grundlagen.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: MyReadonly<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere MyReadonly<T> das alle Properties readonly macht.
// type MyReadonly<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Mutable<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Mutable<T> das readonly von allen Properties entfernt.
// type Mutable<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Nullable<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Nullable<T> das jeder Property den Typ | null hinzufuegt.
// type Nullable<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: AllString<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere AllString<T> das JEDEN Property-Typ zu string macht.
// type AllString<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Writable Required
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere WritableRequired<T> das gleichzeitig:
// 1. readonly entfernt (-readonly)
// 2. optional entfernt (-?)
// type WritableRequired<T> = { ... }

interface TestConfig {
  readonly host: string;
  readonly port?: number;
  debug?: boolean;
}

// WritableRequired<TestConfig> sollte sein:
// { host: string; port: number; debug: boolean; }
