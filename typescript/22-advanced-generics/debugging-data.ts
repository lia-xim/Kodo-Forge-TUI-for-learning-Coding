/**
 * Lektion 22 — Debugging Challenges: Advanced Generics
 *
 * 5 Challenges zu Varianz, Constraints, Distribution, in/out, und API-Design.
 * Fokus: Subtile Typfehler die bei fortgeschrittenen Generics auftreten.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Unsichere kovariante Zuweisung ──────────────────────
  {
    id: "L22-D1",
    title: "Kovariante Array-Zuweisung verursacht Runtime-Fehler",
    buggyCode: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "function addDog(animals: Animal[]) {",
      "  animals.push({ name: 'Rex' }); // Nur ein Animal, keine Cat!",
      "}",
      "",
      "const cats: Cat[] = [{ name: 'Minka', meow() { console.log('Miau'); } }];",
      "addDog(cats); // TypeScript erlaubt das...",
      "cats[1].meow(); // Runtime: meow is not a function",
    ].join("\n"),
    errorMessage: "TypeError: cats[1].meow is not a function",
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "addDog sollte `readonly Animal[]` statt `Animal[]` akzeptieren",
      "cats muss als `const` deklariert werden",
      "Das Interface Cat ist falsch definiert",
      "Man muss `as Cat` beim push hinzufuegen",
    ],
    correctOption: 0,
    hints: [
      "Denke an den Unterschied zwischen mutablen und immutablen Arrays.",
      "Wenn addDog nur lesen wuerde, waere die kovariante Zuweisung sicher.",
      "ReadonlyArray<Animal> wuerde verhindern, dass push aufgerufen werden kann.",
    ],
    fixedCode: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "function addDog(animals: readonly Animal[]) {",
      "  // animals.push({ name: 'Rex' }); // Compile-Error! Readonly!",
      "  console.log(animals.map(a => a.name)); // Nur lesen ist OK",
      "}",
      "",
      "const cats: Cat[] = [{ name: 'Minka', meow() { console.log('Miau'); } }];",
      "addDog(cats); // Sicher — ReadonlyArray ist kovariant",
    ].join("\n"),
    explanation:
      "Mutable Arrays sind invariant — aber TypeScript erlaubt die kovariante " +
      "Zuweisung aus Pragmatismus. Mit `readonly Animal[]` wird die Zuweisung " +
      "sicher, weil man nichts Falsches reinschreiben kann.",
  },

  // ─── Challenge 2: Distributiver Conditional Type unerwartet ───────────
  {
    id: "L22-D2",
    title: "Distributiver Conditional Type liefert unerwartetes Ergebnis",
    buggyCode: [
      "type NonNullable<T> = T extends null | undefined ? never : T;",
      "",
      "// Erwartet: { name: string } | null wird zu { name: string }",
      "type User = { name: string };",
      "type MaybeUser = User | null;",
      "",
      "type CleanUser = NonNullable<MaybeUser>;",
      "// Erwartet: User",
      "// Aber was wenn wir pruefen wollen ob der GESAMTE Typ nullable ist?",
      "",
      "type IsNullable<T> = T extends null ? true : false;",
      "type Test = IsNullable<string | null>; // Erwartet: true, bekommt: boolean",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 11,
    options: [
      "Der Conditional Type verteilt sich ueber den Union und ergibt true | false = boolean",
      "TypeScript hat einen Bug bei null-Pruefungen",
      "Man muss `=== null` statt `extends null` verwenden",
      "NonNullable ist falsch definiert",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn ein Conditional Type einen Union-Typ prueft?",
      "Distribution: IsNullable<string | null> = IsNullable<string> | IsNullable<null>",
      "Nutze [T] extends [null] um Distribution zu verhindern.",
    ],
    fixedCode: [
      "// Non-distributive Version:",
      "type IsNullable<T> = [T] extends [null] ? true : false;",
      "type Test1 = IsNullable<string | null>; // false (Union als Ganzes)",
      "",
      "// Oder: Pruefe ob null im Union enthalten ist",
      "type ContainsNull<T> = null extends T ? true : false;",
      "type Test2 = ContainsNull<string | null>; // true",
    ].join("\n"),
    explanation:
      "Distributive Conditional Types verteilen sich ueber Unions: " +
      "`IsNullable<string | null>` wird zu `IsNullable<string> | IsNullable<null>` " +
      "= `false | true` = `boolean`. Mit `[T] extends [null]` wird T gewrappt " +
      "und die Distribution verhindert.",
  },

  // ─── Challenge 3: out-Modifier an falscher Stelle ─────────────────────
  {
    id: "L22-D3",
    title: "out-Modifier bei invariantem Typ",
    buggyCode: [
      "interface MutableBox<out T> {",
      "  get(): T;",
      "  set(value: T): void; // T in Input-Position!",
      "}",
      "",
      "// TypeScript gibt einen Fehler:",
      "// Type 'T' is not assignable to type 'T'.",
      "// The type 'T' is not covariant in this position.",
    ].join("\n"),
    errorMessage: "Type 'T' is not assignable to type 'T' (variance mismatch)",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "Entferne den out-Modifier oder nutze `in out T` fuer Invarianz",
      "Aendere set zu einer generischen Methode",
      "Mache T optional",
      "Verwende any statt T im set-Parameter",
    ],
    correctOption: 0,
    hints: [
      "Was bedeutet `out T`? In welcher Position darf T dann stehen?",
      "`out T` deklariert Kovarianz — T darf NUR in Output-Position stehen.",
      "set(value: T) setzt T in Input-Position — das widerspricht `out T`.",
    ],
    fixedCode: [
      "// Option 1: Invariant deklarieren",
      "interface MutableBox<in out T> {",
      "  get(): T;",
      "  set(value: T): void;",
      "}",
      "",
      "// Option 2: Nur lesbar = kovariant",
      "interface ReadonlyBox<out T> {",
      "  get(): T;",
      "  // Kein set() — nur Output",
      "}",
    ].join("\n"),
    explanation:
      "`out T` deklariert, dass T nur in Output-Positionen vorkommt (kovariant). " +
      "Eine set(value: T)-Methode verwendet T aber in Input-Position. " +
      "Loesung: Entweder `in out T` (invariant) oder set() entfernen.",
  },

  // ─── Challenge 4: Constraint zu eng ───────────────────────────────────
  {
    id: "L22-D4",
    title: "Intersection-Constraint schliesst gueltige Typen aus",
    buggyCode: [
      "interface HasId { id: number; }",
      "interface HasName { name: string; }",
      "",
      "function processEntity<T extends HasId & HasName>(entity: T): string {",
      "  return `${entity.id}: ${entity.name}`;",
      "}",
      "",
      "// Das funktioniert:",
      "processEntity({ id: 1, name: 'Max' });",
      "",
      "// Aber das nicht:",
      "const user = { id: 1, name: 'Max', email: 'max@example.com' };",
      "processEntity(user); // OK",
      "",
      "// Problem: Manchmal haben wir nur eine ID",
      "processEntity({ id: 1 }); // Error: Property 'name' is missing",
    ].join("\n"),
    errorMessage: "Property 'name' is missing in type '{ id: number; }'",
    bugType: "type-error",
    bugLine: 4,
    options: [
      "Nutze `T extends HasId | HasName` statt `&` fuer 'mindestens eines'",
      "Mache den Constraint flexibler mit `T extends HasId & Partial<HasName>`",
      "Entferne den Constraint komplett",
      "Fuege name als optional in HasName hinzu",
    ],
    correctOption: 1,
    hints: [
      "Intersection (&) bedeutet ALLE Properties. Das ist manchmal zu streng.",
      "Was waere wenn `name` optional waere, aber `id` erforderlich?",
      "Partial<HasName> macht alle Properties von HasName optional.",
    ],
    fixedCode: [
      "interface HasId { id: number; }",
      "interface HasName { name: string; }",
      "",
      "function processEntity<T extends HasId & Partial<HasName>>(entity: T): string {",
      "  return entity.name",
      "    ? `${entity.id}: ${entity.name}`",
      "    : `${entity.id}: (unnamed)`;",
      "}",
      "",
      "processEntity({ id: 1, name: 'Max' }); // OK",
      "processEntity({ id: 1 }); // Auch OK!",
    ].join("\n"),
    explanation:
      "Der Intersection-Constraint `HasId & HasName` verlangt ALLE Properties. " +
      "Mit `HasId & Partial<HasName>` ist `id` erforderlich und `name` optional. " +
      "Beachte: Im Funktionskoerper muss man dann `name` auf undefined pruefen.",
  },

  // ─── Challenge 5: Generics verschleiern statt helfen ──────────────────
  {
    id: "L22-D5",
    title: "Unnoetige Generics verkomplizieren die API",
    buggyCode: [
      "// Ueber-generische API:",
      "function formatValue<T extends string | number | boolean>(",
      "  value: T,",
      "  prefix: string",
      "): string {",
      "  return `${prefix}: ${String(value)}`;",
      "}",
      "",
      "function wrapInArray<T>(item: T): T[] {",
      "  return [item];",
      "}",
      "",
      "function logItem<T>(item: T): void {",
      "  console.log(item);",
      "}",
      "",
      "// Welche Funktion(en) brauchen wirklich ein Generic?",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "Alle drei brauchen Generics",
      "Nur wrapInArray braucht ein Generic (T kommt 2x vor: Input und Output)",
      "Keine braucht Generics",
      "Nur formatValue braucht ein Generic",
    ],
    correctOption: 1,
    hints: [
      "Zaehle wie oft jeder Typparameter vorkommt (Rule of Two).",
      "formatValue: T nur im Parameter, nicht im Return. logItem: T nur im Parameter.",
      "wrapInArray: T im Parameter UND im Return-Typ — eine echte Korrelation.",
    ],
    fixedCode: [
      "// formatValue: Union statt Generic (T nur 1x verwendet)",
      "function formatValue(",
      "  value: string | number | boolean,",
      "  prefix: string",
      "): string {",
      "  return `${prefix}: ${String(value)}`;",
      "}",
      "",
      "// wrapInArray: Generic bleibt (T 2x verwendet)",
      "function wrapInArray<T>(item: T): T[] {",
      "  return [item];",
      "}",
      "",
      "// logItem: unknown statt Generic (T nur 1x verwendet)",
      "function logItem(item: unknown): void {",
      "  console.log(item);",
      "}",
    ].join("\n"),
    explanation:
      "Rule of Two: Ein Typparameter muss mindestens 2x vorkommen um nuetzlich " +
      "zu sein. formatValue und logItem verwenden T nur einmal — " +
      "sie koennen durch Union bzw. unknown ersetzt werden. " +
      "Nur wrapInArray korreliert Input und Output.",
  },
];
