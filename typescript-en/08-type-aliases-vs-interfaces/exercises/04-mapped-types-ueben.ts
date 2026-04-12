/**
 * Lektion 08 - Exercise 04: Mapped Types ueben
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-mapped-types-ueben.ts
 *
 * 5 Aufgaben zu Mapped Types — dem type-exklusiven Power-Feature.
 */

// ─── Basis-Typ fuer die Aufgaben ───────────────────────────────────────────

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  assignee: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Eigenes Partial bauen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Mapped Type "MeinPartial<T>" der alle Properties
// von T optional macht. Verwende NICHT das eingebaute Partial.
// Tipp: [K in keyof T]?: T[K]

// type MeinPartial<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Eigenes Readonly bauen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Mapped Type "MeinReadonly<T>" der alle Properties
// von T readonly macht. Verwende NICHT das eingebaute Readonly.

// type MeinReadonly<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Nullable-Type erstellen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Mapped Type "NullableProps<T>" der bei JEDER
// Property auch null erlaubt.
// z.B. NullableProps<{ name: string }> = { name: string | null }

// type NullableProps<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Keys nach Typ filtern
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "StringKeys<T>" der nur die Property-Namen
// zurueckgibt, deren Werte vom Typ string sind.
// Tipp: Nutze Conditional Types in der Mapped Type Definition.
//
// Beispiel: StringKeys<Todo> sollte "id" | "title" | "description" | "assignee" sein
// (assignee ist string | null — das zaehlt NICHT als reiner string)
// Korrektur: assignee ist string | null. Wenn du nur reine strings willst,
// muss der Conditional Check "extends string" sein (null extended nicht string).

// type StringKeys<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Getter-Type generieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Mapped Type "Getters<T>" der fuer jede Property
// eine getter-Funktion erstellt.
// z.B. Getters<{ name: string }> = { getName: () => string }
// Tipp: Nutze "as" in der Key-Remapping-Syntax: [K in keyof T as `get${...}`]

// type Getters<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1
const partial: MeinPartial<Todo> = { title: "Test" };
console.log(`Partial: ${partial.title}`);

// Test 2
const frozen: MeinReadonly<Todo> = {
  id: "1", title: "Test", description: "Beschreibung",
  completed: false, priority: "high", assignee: "Max",
};
// frozen.title = "Geaendert"; // Sollte Fehler geben!
console.log(`Readonly: ${frozen.title}`);

// Test 3
const nullable: NullableProps<Todo> = {
  id: null, title: null, description: "Test",
  completed: null, priority: null, assignee: null,
};
console.log(`Nullable: ${nullable.description}`);

// Test 5
const getters: Getters<{ name: string; age: number }> = {
  getName: () => "Max",
  getAge: () => 30,
};
console.log(`Getter: ${getters.getName()} (${getters.getAge()})`);

console.log("Alle Tests bestanden!");
*/
