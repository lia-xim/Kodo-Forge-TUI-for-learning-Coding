/**
 * Lektion 16 - Exercise 02: Key Remapping
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-key-remapping.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Getters<T> generieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Getters<T> das fuer jede Property K eine Methode
// getK(): T[K] generiert. Nutze Template Literal Types und Capitalize.
// type Getters<T> = { ... }

interface Person {
  name: string;
  age: number;
}
// Getters<Person> = { getName: () => string; getAge: () => number; }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Setters<T> generieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Setters<T> das fuer jede Property K eine Methode
// setK(value: T[K]): void generiert.
// type Setters<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: StringKeysOnly<T> — Filterung
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere StringKeysOnly<T> das nur Properties behalt
// deren Wert-Typ string ist (alle anderen werden entfernt).
// Nutze Key Remapping mit never.
// type StringKeysOnly<T> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Prefixed<T, P> — Prefix fuer alle Keys
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Prefixed<T, P extends string> das jedem Key
// den Prefix P_ voranstellt.
// type Prefixed<T, P extends string> = { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: EventHandlers<T> generieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere EventHandlers<T> das fuer jede Property K
// einen Handler on{K}Change(newValue, oldValue): void generiert.
// type EventHandlers<T> = { ... }

interface Settings {
  theme: string;
  fontSize: number;
}
// EventHandlers<Settings> = {
//   onThemeChange: (newValue: string, oldValue: string) => void;
//   onFontSizeChange: (newValue: number, oldValue: number) => void;
// }
