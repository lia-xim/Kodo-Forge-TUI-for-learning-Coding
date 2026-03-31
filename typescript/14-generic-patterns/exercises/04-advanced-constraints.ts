/**
 * Lektion 14 - Exercise 04: Advanced Constraints
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-advanced-constraints.ts
 *
 * 5 Aufgaben zu Conditional/Recursive Constraints und const Type Parameters.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Conditional Return Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "serialize" die:
// - Einen string unveraendert zurueckgibt (Typ: string)
// - Eine number als String zurueckgibt (Typ: string)
// - Ein object als JSON-String zurueckgibt (Typ: string)
// Verwende einen Conditional Type fuer den Rueckgabetyp:
//
// type Serialized<T> = T extends string ? string : string;
// function serialize<T extends string | number | object>(value: T): string

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: DeepReadonly
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere einen rekursiven Typ "DeepReadonly<T>" der alle
// Properties auf allen Verschachtelungsebenen readonly macht.
//
// type DeepReadonly<T> = ...
//
// Teste mit:
// interface Nested { a: { b: { c: string } }; d: number[] }
// type ReadonlyNested = DeepReadonly<Nested>;
// ReadonlyNested.a.b.c sollte readonly sein

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: TreeNode mit map()
// ═══════════════════════════════════════════════════════════════════════════

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

// TODO: Schreibe eine Funktion "mapTree" die eine Transformation auf
// JEDEN Knoten im Baum anwendet und einen neuen Baum zurueckgibt:
//
// function mapTree<T, U>(
//   node: TreeNode<T>,
//   fn: (value: T) => U
// ): TreeNode<U>

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: const Type Parameters
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine Funktion "createAction" mit const Type Parameter
// die ein Action-Objekt erstellt. Der "type"-Wert soll als Literal
// Type inferiert werden:
//
// function createAction<const T extends string>(type: T): { type: T }
//
// const inc = createAction("INCREMENT"); // { type: "INCREMENT" } — nicht { type: string }
// const dec = createAction("DECREMENT"); // { type: "DECREMENT" }

// TODO: Schreibe eine Funktion "defineEnum" mit const Type Parameter:
// function defineEnum<const T extends readonly string[]>(values: T): ...
// die ein Objekt zurueckgibt das jeden String als Key und Value hat.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Mapped Constraint — Validator
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen typsicheren Validator:
//
// type ValidationRules<T> = {
//   [K in keyof T]?: (value: T[K]) => string | null;
// };
//
// function validate<T>(data: T, rules: ValidationRules<T>): string[]
// Gibt ein Array von Fehlermeldungen zurueck (leer = valide).

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
//
// console.log("Serialize:", serialize("hello")); // "hello"
// console.log("Serialize:", serialize(42));       // "42"
// console.log("Serialize:", serialize({a: 1}));   // '{"a":1}'
//
// const numTree: TreeNode<number> = {
//   value: 1,
//   children: [
//     { value: 2, children: [] },
//     { value: 3, children: [{ value: 4, children: [] }] },
//   ],
// };
// const stringTree = mapTree(numTree, n => `Node(${n})`);
// console.log("MapTree:", JSON.stringify(stringTree));
//
// const inc = createAction("INCREMENT");
// console.log("Action:", inc); // { type: "INCREMENT" }
//
// interface UserForm { name: string; age: number; email: string }
// const errors = validate<UserForm>(
//   { name: "", age: -5, email: "test" },
//   {
//     name: (v) => v.length === 0 ? "Name ist leer" : null,
//     age: (v) => v < 0 ? "Alter darf nicht negativ sein" : null,
//     email: (v) => !v.includes("@") ? "Keine gueltige Email" : null,
//   }
// );
// console.log("Errors:", errors);

console.log("Exercise 04 geladen. Ersetze die TODOs!");
