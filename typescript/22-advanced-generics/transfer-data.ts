/**
 * Lektion 22 — Transfer Tasks: Advanced Generics
 *
 * Diese Tasks nehmen die Konzepte aus der Advanced-Generics-Lektion und wenden
 * sie in komplett neuen Kontexten an:
 *
 *  1. Type-safe Event System mit kovarianten Listenern (Game Engine)
 *  2. Generischer Data-Validator mit Constraints (Form-Validation)
 *  3. Varianzsichere Collection-API (Immutable.js-aehnlich)
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Type-safe Event System ───────────────────────────────────
  {
    id: "22-event-system",
    title: "Type-safe Event System mit kovarianten Listenern",
    prerequisiteLessons: [13, 14, 22],
    scenario:
      "Du entwickelst eine Game Engine. Events haben eine Hierarchie: " +
      "`GameEvent` → `CollisionEvent` → `PlayerCollisionEvent`. " +
      "Listener die auf `GameEvent` hoeren sollen auch `CollisionEvent` " +
      "empfangen koennen. Aber ein `PlayerCollisionEvent`-Listener soll " +
      "NICHT alle `GameEvent`s bekommen — das waere unsicher.",
    task:
      "Designe ein typsicheres Event System mit korrekter Varianz.\n\n" +
      "1. Definiere die Event-Hierarchie: `GameEvent`, `CollisionEvent extends GameEvent`, " +
      "`PlayerCollisionEvent extends CollisionEvent`\n" +
      "2. Erstelle ein `EventEmitter<out E>` Interface — kovariant in E\n" +
      "3. Erstelle ein `EventListener<in E>` Interface — kontravariant in E\n" +
      "4. Implementiere eine `subscribe`-Funktion die Emitter und Listener " +
      "typsicher verbindet\n" +
      "5. Teste: Ein `EventListener<GameEvent>` kann auf `EventEmitter<CollisionEvent>` " +
      "hoeren (Kovarianz + Kontravarianz zusammen)\n" +
      "6. Teste: Ein `EventListener<PlayerCollisionEvent>` kann NICHT auf " +
      "`EventEmitter<GameEvent>` hoeren (das waere unsicher)",
    starterCode: [
      "// Event-Hierarchie",
      "interface GameEvent { type: string; timestamp: number; }",
      "interface CollisionEvent extends GameEvent {",
      "  objectA: string; objectB: string;",
      "}",
      "interface PlayerCollisionEvent extends CollisionEvent {",
      "  playerId: string; damage: number;",
      "}",
      "",
      "// TODO: EventEmitter<out E> und EventListener<in E>",
      "// TODO: subscribe-Funktion",
      "// TODO: Tests fuer korrekte Varianz",
    ].join("\n"),
    hints: [
      "Ein Producer (EventEmitter) ist kovariant — er gibt Events heraus.",
      "Ein Consumer (EventListener) ist kontravariant — er nimmt Events entgegen.",
      "subscribe<E>(emitter: EventEmitter<E>, listener: EventListener<E>) " +
      "verbindet beide mit dem gleichen E.",
    ],
    sampleSolution: [
      "interface EventEmitter<out E> {",
      "  lastEvent(): E | null;",
      "  onNext(callback: (event: E) => void): void;",
      "}",
      "",
      "interface EventListener<in E> {",
      "  handle(event: E): void;",
      "}",
      "",
      "function subscribe<E>(",
      "  emitter: EventEmitter<E>,",
      "  listener: EventListener<E>",
      "): void {",
      "  emitter.onNext(event => listener.handle(event));",
      "}",
      "",
      "// Test: GameEvent-Listener auf CollisionEvent-Emitter — OK!",
      "declare const collisionEmitter: EventEmitter<CollisionEvent>;",
      "declare const gameListener: EventListener<GameEvent>;",
      "subscribe(collisionEmitter, gameListener); // Kovarianz + Kontravarianz",
    ].join("\n"),
    evaluationCriteria: [
      "EventEmitter ist kovariant (out E), EventListener ist kontravariant (in E)",
      "subscribe verbindet beide typsicher",
      "Korrekte Varianz-Tests: sichere Zuweisungen kompilieren, unsichere nicht",
      "Keine any-Casts oder Type Assertions",
    ],
  },

  // ─── Task 2: Generischer Data-Validator ───────────────────────────────
  {
    id: "22-data-validator",
    title: "Generischer Data-Validator mit Constraints",
    prerequisiteLessons: [13, 14, 17, 22],
    scenario:
      "Du baust eine Form-Validation-Library. Verschiedene Felder haben " +
      "verschiedene Validierungsregeln. Du willst einen generischen Validator " +
      "der mit Intersection-Constraints sicherstellt, dass jedes Feld " +
      "die richtigen Validierungsregeln hat.",
    task:
      "Implementiere einen generischen Validator.\n\n" +
      "1. Definiere Validator-Interfaces: `HasMinLength`, `HasRange`, `HasPattern`\n" +
      "2. Erstelle eine generische `validate`-Funktion mit Intersection-Constraint: " +
      "`T extends HasMinLength & HasPattern` (fuer Strings) oder " +
      "`T extends HasRange` (fuer Numbers)\n" +
      "3. Nutze Conditional Types um den Validator-Typ automatisch zu waehlen: " +
      "`type ValidatorFor<T> = T extends string ? StringValidator : NumberValidator`\n" +
      "4. Baue eine `createForm`-Funktion die fuer ein Schema automatisch " +
      "die richtigen Validatoren erzeugt\n" +
      "5. Teste mit einem User-Formular: `{ name: string, age: number, email: string }`",
    starterCode: [
      "// Validator-Interfaces",
      "interface HasMinLength { minLength: number; }",
      "interface HasRange { min: number; max: number; }",
      "interface HasPattern { pattern: RegExp; }",
      "",
      "// TODO: StringValidator extends HasMinLength & HasPattern",
      "// TODO: NumberValidator extends HasRange",
      "// TODO: ValidatorFor<T> Conditional Type",
      "// TODO: createForm<Schema>(...)",
    ].join("\n"),
    hints: [
      "Intersection-Constraints kombinieren mehrere Anforderungen.",
      "Conditional Types koennen basierend auf dem Feld-Typ den Validator waehlen.",
      "Mapped Types + Conditional Types = automatische Validator-Zuordnung pro Feld.",
    ],
    sampleSolution: [
      "interface StringValidator extends HasMinLength, HasPattern {",
      "  validate(value: string): boolean;",
      "}",
      "",
      "interface NumberValidator extends HasRange {",
      "  validate(value: number): boolean;",
      "}",
      "",
      "type ValidatorFor<T> = T extends string",
      "  ? StringValidator",
      "  : T extends number",
      "    ? NumberValidator",
      "    : never;",
      "",
      "type FormValidators<Schema> = {",
      "  [K in keyof Schema]: ValidatorFor<Schema[K]>;",
      "};",
      "",
      "function createForm<Schema extends Record<string, string | number>>(",
      "  schema: Schema,",
      "  validators: FormValidators<Schema>",
      "): void { /* ... */ }",
    ].join("\n"),
    evaluationCriteria: [
      "Intersection-Constraints fuer Validatoren korrekt eingesetzt",
      "Conditional Type waehlt Validator basierend auf Feld-Typ",
      "Mapped Type erzeugt Validator-Map fuer das gesamte Schema",
      "Typsicher: Falscher Validator-Typ erzeugt Compile-Error",
    ],
  },

  // ─── Task 3: Varianzsichere Collection-API ────────────────────────────
  {
    id: "22-collection-api",
    title: "Varianzsichere Collection-API",
    prerequisiteLessons: [13, 14, 22],
    scenario:
      "Du baust eine kleine Immutable.js-aehnliche Library. Die Collection " +
      "soll verschiedene Operationen anbieten: `map` (kovariant — Output), " +
      "`filter` (invariant — liest und produziert), `forEach` (kontravariant — Input). " +
      "Jede Operation hat eine andere Varianz-Eigenschaft.",
    task:
      "Designe eine varianzsichere Collection-API.\n\n" +
      "1. Erstelle `ReadonlyCollection<out T>` — nur lesende Operationen (kovariant)\n" +
      "2. Erstelle `MutableCollection<in out T>` — lesend und schreibend (invariant)\n" +
      "3. Erstelle `Sink<in T>` — nur schreibend (kontravariant)\n" +
      "4. Implementiere `toReadonly`: MutableCollection → ReadonlyCollection (sicher)\n" +
      "5. Zeige warum `toMutable`: ReadonlyCollection → MutableCollection unsicher waere\n" +
      "6. Teste die Varianz: ReadonlyCollection<Cat> = ReadonlyCollection<Animal>? " +
      "MutableCollection<Cat> = MutableCollection<Animal>?",
    starterCode: [
      "interface Animal { name: string; }",
      "interface Cat extends Animal { meow(): void; }",
      "",
      "// TODO: ReadonlyCollection<out T>",
      "// TODO: MutableCollection<in out T>",
      "// TODO: Sink<in T>",
      "// TODO: toReadonly-Funktion",
      "// TODO: Varianz-Tests",
    ].join("\n"),
    hints: [
      "ReadonlyCollection hat nur Methoden die T herausgeben (get, map, filter).",
      "MutableCollection hat auch Methoden die T hineinnehmen (add, set).",
      "Sink hat nur Methoden die T hineinnehmen (add, push).",
    ],
    sampleSolution: [
      "interface ReadonlyCollection<out T> {",
      "  get(index: number): T;",
      "  map<U>(fn: (item: T) => U): ReadonlyCollection<U>;",
      "  toArray(): T[];",
      "}",
      "",
      "interface MutableCollection<in out T> {",
      "  get(index: number): T;",
      "  add(item: T): void;",
      "  set(index: number, item: T): void;",
      "}",
      "",
      "interface Sink<in T> {",
      "  add(item: T): void;",
      "  addAll(items: T[]): void;",
      "}",
      "",
      "function toReadonly<T>(coll: MutableCollection<T>): ReadonlyCollection<T> {",
      "  return { get: i => coll.get(i), map: fn => { /* ... */ }, toArray: () => [] };",
      "}",
      "",
      "// Test: Kovarianz bei ReadonlyCollection",
      "declare const readonlyCats: ReadonlyCollection<Cat>;",
      "const readonlyAnimals: ReadonlyCollection<Animal> = readonlyCats; // OK!",
      "",
      "// Test: Kontravarianz bei Sink",
      "declare const animalSink: Sink<Animal>;",
      "const catSink: Sink<Cat> = animalSink; // OK!",
    ].join("\n"),
    evaluationCriteria: [
      "ReadonlyCollection ist kovariant (out T) — nur lesende Methoden",
      "MutableCollection ist invariant (in out T) — lesend und schreibend",
      "Sink ist kontravariant (in T) — nur schreibende Methoden",
      "Varianz-Tests korrekt: ReadonlyCollection<Cat> → ReadonlyCollection<Animal> OK",
    ],
  },
];
