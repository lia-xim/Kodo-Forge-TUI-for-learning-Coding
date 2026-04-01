/**
 * Lektion 22 — Parson's Problems: Advanced Generics
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Varianz, HKT-Emulation, Constraints, API-Design
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Kovarianter Producer mit out ──────────────────────────
  {
    id: "L22-P1",
    title: "Kovarianter Producer mit Varianz-Test",
    description:
      "Ordne die Zeilen so, dass ein kovarianter Producer entsteht " +
      "und die Kovarianz getestet wird.",
    correctOrder: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "interface Producer<out T> {",
      "  produce(): T;",
      "}",
      "declare const catProducer: Producer<Cat>;",
      "const animalProducer: Producer<Animal> = catProducer;",
      "console.log(animalProducer.produce().name);",
    ],
    distractors: [
      "interface Producer<in T> {",
      "const catProducer: Producer<Animal> = animalProducer;",
    ],
    hint:
      "`out T` deklariert Kovarianz: Producer<Cat> ist Subtyp von Producer<Animal>. " +
      "`in T` waere Kontravarianz — die falsche Richtung fuer einen Producer.",
    concept: "covariance-out",
    difficulty: 2,
  },

  // ─── Problem 2: HKT-Emulation mit Interface-Map ──────────────────────
  {
    id: "L22-P2",
    title: "Higher-Kinded Type Emulation",
    description:
      "Ordne die Zeilen, um eine einfache HKT-Emulation mit Interface-Map " +
      "zu bauen. Das Kind-Interface bildet String-URIs auf generische Typen ab.",
    correctOrder: [
      "interface URItoKind<A> {",
      "  Array: Array<A>;",
      "  Set: Set<A>;",
      "}",
      "type URIS = keyof URItoKind<any>;",
      "type Kind<URI extends URIS, A> = URItoKind<A>[URI];",
      "type Result = Kind<'Array', string>;",
      "// Result = string[]",
    ],
    distractors: [
      "type Kind<URI, A> = URI<A>;",
      "type URIS = URItoKind<any>;",
    ],
    hint:
      "Das Interface ist die Lookup-Map. `Kind<URI, A>` indiziert die Map " +
      "mit dem URI-String und gibt den konkreten Typ zurueck.",
    concept: "hkt-emulation",
    difficulty: 3,
  },

  // ─── Problem 3: F-bounded Polymorphism ────────────────────────────────
  {
    id: "L22-P3",
    title: "Comparable mit F-bounded Polymorphism",
    description:
      "Ordne die Zeilen fuer ein Comparable-Pattern, bei dem sich " +
      "Objekte nur mit Instanzen des eigenen Typs vergleichen koennen.",
    correctOrder: [
      "interface Comparable<T extends Comparable<T>> {",
      "  compareTo(other: T): number;",
      "}",
      "class Weight implements Comparable<Weight> {",
      "  constructor(public kg: number) {}",
      "  compareTo(other: Weight): number {",
      "    return this.kg - other.kg;",
      "  }",
      "}",
    ],
    distractors: [
      "interface Comparable<T> {",
      "class Weight implements Comparable<number> {",
    ],
    hint:
      "F-bounded: Der Constraint von T referenziert das Interface selbst. " +
      "Die Klasse implementiert Comparable mit sich selbst als Typparameter.",
    concept: "f-bounded-polymorphism",
    difficulty: 3,
  },

  // ─── Problem 4: Generic Pipe-Funktion ─────────────────────────────────
  {
    id: "L22-P4",
    title: "Type-safe Pipe mit Generics",
    description:
      "Ordne die Zeilen fuer eine pipe-Funktion die zwei Transformationen " +
      "typsicher verkettet. Die Typen muessen an den Uebergaengen stimmen.",
    correctOrder: [
      "function pipe<A, B, C>(",
      "  value: A,",
      "  fn1: (a: A) => B,",
      "  fn2: (b: B) => C",
      "): C {",
      "  return fn2(fn1(value));",
      "}",
      "const result = pipe('42', parseInt, n => n * 2);",
      "// result: number",
    ],
    distractors: [
      "  fn1: (a: A) => A,",
      "  return fn1(fn2(value));",
    ],
    hint:
      "Die Typen verketten sich: A → B → C. fn1 nimmt A und gibt B zurueck, " +
      "fn2 nimmt B und gibt C zurueck. Die Reihenfolge ist fn2(fn1(value)).",
    concept: "generic-pipe-api",
    difficulty: 2,
  },
];
