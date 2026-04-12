/**
 * Lesson 22 — Debugging Challenges: Advanced Generics
 *
 * 5 challenges on variance, constraints, distribution, in/out, and API design.
 * Focus: Subtle type errors that occur with advanced generics.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: Unsafe covariant assignment ──────────────────────
  {
    id: "L22-D1",
    title: "Covariant Array Assignment Causes Runtime Error",
    buggyCode: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "function addDog(animals: Animal[]) {",
      "  animals.push({ name: 'Rex' }); // Just an Animal, not a Cat!",
      "}",
      "",
      "const cats: Cat[] = [{ name: 'Minka', meow() { console.log('Miau'); } }];",
      "addDog(cats); // TypeScript allows this...",
      "cats[1].meow(); // Runtime: meow is not a function",
    ].join("\n"),
    errorMessage: "TypeError: cats[1].meow is not a function",
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "addDog should accept `readonly Animal[]` instead of `Animal[]`",
      "cats must be declared as `const`",
      "The Cat interface is incorrectly defined",
      "You need to add `as Cat` to the push call",
    ],
    correctOption: 0,
    hints: [
      "Think about the difference between mutable and immutable arrays.",
      "If addDog only read from the array, the covariant assignment would be safe.",
      "ReadonlyArray<Animal> would prevent push from being called.",
    ],
    fixedCode: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "function addDog(animals: readonly Animal[]) {",
      "  // animals.push({ name: 'Rex' }); // Compile Error! Readonly!",
      "  console.log(animals.map(a => a.name)); // Reading only is OK",
      "}",
      "",
      "const cats: Cat[] = [{ name: 'Minka', meow() { console.log('Miau'); } }];",
      "addDog(cats); // Safe — ReadonlyArray is covariant",
    ].join("\n"),
    explanation:
      "Mutable arrays are invariant — but TypeScript allows the covariant " +
      "assignment out of pragmatism. With `readonly Animal[]` the assignment " +
      "becomes safe, because nothing incorrect can be written into it.",
  },

  // ─── Challenge 2: Distributive Conditional Type unexpected ───────────
  {
    id: "L22-D2",
    title: "Distributive Conditional Type Yields Unexpected Result",
    buggyCode: [
      "type NonNullable<T> = T extends null | undefined ? never : T;",
      "",
      "// Expected: { name: string } | null becomes { name: string }",
      "type User = { name: string };",
      "type MaybeUser = User | null;",
      "",
      "type CleanUser = NonNullable<MaybeUser>;",
      "// Expected: User",
      "// But what if we want to check whether the ENTIRE type is nullable?",
      "",
      "type IsNullable<T> = T extends null ? true : false;",
      "type Test = IsNullable<string | null>; // Expected: true, gets: boolean",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 11,
    options: [
      "The Conditional Type distributes over the Union and yields true | false = boolean",
      "TypeScript has a bug with null checks",
      "You must use `=== null` instead of `extends null`",
      "NonNullable is incorrectly defined",
    ],
    correctOption: 0,
    hints: [
      "What happens when a Conditional Type checks a Union type?",
      "Distribution: IsNullable<string | null> = IsNullable<string> | IsNullable<null>",
      "Use [T] extends [null] to prevent distribution.",
    ],
    fixedCode: [
      "// Non-distributive version:",
      "type IsNullable<T> = [T] extends [null] ? true : false;",
      "type Test1 = IsNullable<string | null>; // false (Union as a whole)",
      "",
      "// Or: Check whether null is contained in the Union",
      "type ContainsNull<T> = null extends T ? true : false;",
      "type Test2 = ContainsNull<string | null>; // true",
    ].join("\n"),
    explanation:
      "Distributive Conditional Types distribute over unions: " +
      "`IsNullable<string | null>` becomes `IsNullable<string> | IsNullable<null>` " +
      "= `false | true` = `boolean`. With `[T] extends [null]` T is wrapped " +
      "and distribution is prevented.",
  },

  // ─── Challenge 3: out-Modifier in wrong position ─────────────────────
  {
    id: "L22-D3",
    title: "out-Modifier on Invariant Type",
    buggyCode: [
      "interface MutableBox<out T> {",
      "  get(): T;",
      "  set(value: T): void; // T in input position!",
      "}",
      "",
      "// TypeScript throws an error:",
      "// Type 'T' is not assignable to type 'T'.",
      "// The type 'T' is not covariant in this position.",
    ].join("\n"),
    errorMessage: "Type 'T' is not assignable to type 'T' (variance mismatch)",
    bugType: "type-error",
    bugLine: 1,
    options: [
      "Remove the out-Modifier or use `in out T` for invariance",
      "Change set to a generic method",
      "Make T optional",
      "Use any instead of T in the set parameter",
    ],
    correctOption: 0,
    hints: [
      "What does `out T` mean? In which position may T then appear?",
      "`out T` declares covariance — T may ONLY appear in output position.",
      "set(value: T) places T in input position — that contradicts `out T`.",
    ],
    fixedCode: [
      "// Option 1: Declare invariant",
      "interface MutableBox<in out T> {",
      "  get(): T;",
      "  set(value: T): void;",
      "}",
      "",
      "// Option 2: Read-only = covariant",
      "interface ReadonlyBox<out T> {",
      "  get(): T;",
      "  // No set() — output only",
      "}",
    ].join("\n"),
    explanation:
      "`out T` declares that T only appears in output positions (covariant). " +
      "A set(value: T) method uses T in input position, however. " +
      "Solution: Either `in out T` (invariant) or remove set().",
  },

  // ─── Challenge 4: Constraint too narrow ───────────────────────────────────
  {
    id: "L22-D4",
    title: "Intersection Constraint Excludes Valid Types",
    buggyCode: [
      "interface HasId { id: number; }",
      "interface HasName { name: string; }",
      "",
      "function processEntity<T extends HasId & HasName>(entity: T): string {",
      "  return `${entity.id}: ${entity.name}`;",
      "}",
      "",
      "// This works:",
      "processEntity({ id: 1, name: 'Max' });",
      "",
      "// But this doesn't:",
      "const user = { id: 1, name: 'Max', email: 'max@example.com' };",
      "processEntity(user); // OK",
      "",
      "// Problem: Sometimes we only have an ID",
      "processEntity({ id: 1 }); // Error: Property 'name' is missing",
    ].join("\n"),
    errorMessage: "Property 'name' is missing in type '{ id: number; }'",
    bugType: "type-error",
    bugLine: 4,
    options: [
      "Use `T extends HasId | HasName` instead of `&` for 'at least one'",
      "Make the constraint more flexible with `T extends HasId & Partial<HasName>`",
      "Remove the constraint entirely",
      "Add name as optional in HasName",
    ],
    correctOption: 1,
    hints: [
      "Intersection (&) means ALL properties. That is sometimes too strict.",
      "What if `name` were optional, but `id` required?",
      "Partial<HasName> makes all properties of HasName optional.",
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
      "processEntity({ id: 1 }); // Also OK!",
    ].join("\n"),
    explanation:
      "The intersection constraint `HasId & HasName` requires ALL properties. " +
      "With `HasId & Partial<HasName>` `id` is required and `name` is optional. " +
      "Note: Inside the function body you then need to check `name` for undefined.",
  },

  // ─── Challenge 5: Generics obscure instead of help ──────────────────
  {
    id: "L22-D5",
    title: "Unnecessary Generics Complicate the API",
    buggyCode: [
      "// Over-generic API:",
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
      "// Which function(s) actually need a generic?",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "All three need generics",
      "Only wrapInArray needs a generic (T appears twice: input and output)",
      "None of them need generics",
      "Only formatValue needs a generic",
    ],
    correctOption: 1,
    hints: [
      "Count how many times each type parameter appears (Rule of Two).",
      "formatValue: T only in the parameter, not in the return type. logItem: T only in the parameter.",
      "wrapInArray: T in the parameter AND in the return type — a real correlation.",
    ],
    fixedCode: [
      "// formatValue: Union instead of generic (T used only once)",
      "function formatValue(",
      "  value: string | number | boolean,",
      "  prefix: string",
      "): string {",
      "  return `${prefix}: ${String(value)}`;",
      "}",
      "",
      "// wrapInArray: generic stays (T used twice)",
      "function wrapInArray<T>(item: T): T[] {",
      "  return [item];",
      "}",
      "",
      "// logItem: unknown instead of generic (T used only once)",
      "function logItem(item: unknown): void {",
      "  console.log(item);",
      "}",
    ].join("\n"),
    explanation:
      "Rule of Two: A type parameter must appear at least twice to be useful. " +
      "formatValue and logItem use T only once — " +
      "they can be replaced by a union type and unknown respectively. " +
      "Only wrapInArray correlates input and output.",
  },
];