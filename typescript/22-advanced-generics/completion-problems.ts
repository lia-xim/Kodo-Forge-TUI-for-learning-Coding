/**
 * Lektion 22 — Completion Problems: Advanced Generics
 *
 * Code-Templates mit strategischen Luecken (______).
 * Der Lernende fuellt die Luecken — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code mit ______ als Platzhalter fuer Luecken */
  template: string;
  /** Loesung mit gefuellten Luecken */
  solution: string;
  /** Welche Luecke welche Antwort hat */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Verwandtes Konzept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Kovarianter Producer (leicht) ──────────────────────────────────
  {
    id: "22-cp-producer",
    title: "Kovarianter Producer mit out-Modifier",
    description:
      "Vervollstaendige das Interface mit dem korrekten Varianz-Modifier. " +
      "Der Producer gibt T nur heraus (Output-Position).",
    template: `interface Producer<______ T> {
  get(): ______;
  peek(): ______;
}

// Test: Soll kovariant sein
declare const catProducer: Producer<Cat>;
const animalProducer: Producer<______> = catProducer; // OK`,
    solution: `interface Producer<out T> {
  get(): T;
  peek(): T;
}

// Test: Soll kovariant sein
declare const catProducer: Producer<Cat>;
const animalProducer: Producer<Animal> = catProducer; // OK`,
    blanks: [
      {
        placeholder: "______",
        answer: "out",
        hint: "Welcher Modifier deklariert Kovarianz (Output-Position)?",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Was gibt die get()-Methode zurueck? Den Typparameter.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Gleicher Rueckgabetyp wie get().",
      },
      {
        placeholder: "______",
        answer: "Animal",
        hint: "Kovarianz: Producer<Cat> ist Subtyp von Producer<___>",
      },
    ],
    concept: "Kovarianz mit out-Modifier",
  },

  // ─── 2: Kontravarianter Consumer ───────────────────────────────────────
  {
    id: "22-cp-consumer",
    title: "Kontravarianter Consumer mit in-Modifier",
    description:
      "Vervollstaendige das Consumer-Interface. Der Consumer nimmt T " +
      "nur entgegen (Input-Position). Kontravarianz kehrt die Subtyprichtung um.",
    template: `interface Consumer<______ T> {
  accept(item: ______): void;
  process(item: ______): boolean;
}

// Test: Kontravarianz — Richtung umgekehrt!
declare const animalConsumer: Consumer<Animal>;
const catConsumer: Consumer<______> = animalConsumer; // OK`,
    solution: `interface Consumer<in T> {
  accept(item: T): void;
  process(item: T): boolean;
}

// Test: Kontravarianz — Richtung umgekehrt!
declare const animalConsumer: Consumer<Animal>;
const catConsumer: Consumer<Cat> = animalConsumer; // OK`,
    blanks: [
      {
        placeholder: "______",
        answer: "in",
        hint: "Welcher Modifier deklariert Kontravarianz (Input-Position)?",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Der Parameter-Typ der accept-Methode.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Gleicher Parameter-Typ wie accept().",
      },
      {
        placeholder: "______",
        answer: "Cat",
        hint: "Kontravarianz: Consumer<Animal> ist Subtyp von Consumer<___>",
      },
    ],
    concept: "Kontravarianz mit in-Modifier",
  },

  // ─── 3: Intersection Constraint ────────────────────────────────────────
  {
    id: "22-cp-intersection-constraint",
    title: "Intersection Constraint fuer mehrere Anforderungen",
    description:
      "Schreibe eine Funktion die einen Typ akzeptiert der sowohl " +
      "serialisierbar als auch loggbar ist. Nutze einen Intersection-Constraint.",
    template: `interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

function processItem<T extends ______ ______ ______>(item: T): string {
  item.______();
  return item.______();
}`,
    solution: `interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

function processItem<T extends Serializable & Loggable>(item: T): string {
  item.log();
  return item.serialize();
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "Serializable",
        hint: "Erstes Interface im Constraint.",
      },
      {
        placeholder: "______",
        answer: "&",
        hint: "Welcher Operator kombiniert Typen zu einer Intersection?",
      },
      {
        placeholder: "______",
        answer: "Loggable",
        hint: "Zweites Interface im Constraint.",
      },
      {
        placeholder: "______",
        answer: "log",
        hint: "Welche Methode kommt aus dem Loggable-Interface?",
      },
      {
        placeholder: "______",
        answer: "serialize",
        hint: "Welche Methode gibt einen String zurueck?",
      },
    ],
    concept: "Intersection-Constraints",
  },

  // ─── 4: Non-Distributive Conditional ───────────────────────────────────
  {
    id: "22-cp-non-distributive",
    title: "Distribution verhindern mit Tuple-Wrapping",
    description:
      "Schreibe einen Conditional Type der NICHT ueber Unions verteilt. " +
      "Nutze das Tuple-Wrapping-Pattern.",
    template: `// Distributiv (Standard):
type IsString<T> = T extends string ? true : false;
type D = IsString<string | number>; // true | false

// Nicht-distributiv:
type IsStringStrict<T> = ______<______> extends ______<string> ? true : false;
type ND = IsStringStrict<string | number>; // ______`,
    solution: `// Distributiv (Standard):
type IsString<T> = T extends string ? true : false;
type D = IsString<string | number>; // true | false

// Nicht-distributiv:
type IsStringStrict<T> = [T] extends [string] ? true : false;
type ND = IsStringStrict<string | number>; // false`,
    blanks: [
      {
        placeholder: "______",
        answer: "[T]",
        hint: "Wie wrappt man T um Distribution zu verhindern?",
      },
      {
        placeholder: "______",
        answer: "[T]",
        hint: "Beide Seiten muessen gleich gewrappt sein.",
      },
      {
        placeholder: "______",
        answer: "[string]",
        hint: "Auch der Vergleichstyp muss gewrappt sein.",
      },
      {
        placeholder: "______",
        answer: "false",
        hint: "string | number ist KEIN Subtyp von string, also...",
      },
    ],
    concept: "Nicht-distributive Conditional Types",
  },

  // ─── 5: F-bounded Polymorphism ─────────────────────────────────────────
  {
    id: "22-cp-f-bounded",
    title: "F-bounded Polymorphism (Self-Referencing Constraint)",
    description:
      "Implementiere ein Comparable-Interface bei dem ein Typ sich nur " +
      "mit Instanzen des eigenen Typs vergleichen kann.",
    template: `interface Comparable<T extends ______<______>> {
  compareTo(other: ______): number;
}

class Temperature implements Comparable<______> {
  constructor(public celsius: number) {}

  compareTo(other: ______): number {
    return this.celsius - other.celsius;
  }
}`,
    solution: `interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number;
}

class Temperature implements Comparable<Temperature> {
  constructor(public celsius: number) {}

  compareTo(other: Temperature): number {
    return this.celsius - other.celsius;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "Comparable",
        hint: "Der Constraint referenziert das Interface selbst.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Rekursiver Verweis: Comparable nimmt T als Parameter.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Der Parameter von compareTo ist der Typparameter.",
      },
      {
        placeholder: "______",
        answer: "Temperature",
        hint: "Welcher konkrete Typ wird fuer T eingesetzt?",
      },
      {
        placeholder: "______",
        answer: "Temperature",
        hint: "compareTo vergleicht mit einer anderen Instanz desselben Typs.",
      },
    ],
    concept: "F-bounded Polymorphism",
  },

  // ─── 6: Generic API Design — Rule of Two ──────────────────────────────
  {
    id: "22-cp-rule-of-two",
    title: "Rule of Two — Typparameter korrelieren",
    description:
      "Refactore die ueberflüssigen Generics. Nur Typparameter die mindestens " +
      "zwei Mal vorkommen (Input-Output-Korrelation) sind sinnvoll.",
    template: `// Anti-Pattern: T nur einmal verwendet
function logValue<T>(value: T): void {
  console.log(value);
}

// Besser: T durch ______ ersetzen
function logValueFixed(value: ______): void {
  console.log(value);
}

// Gutes Generic: T kommt 2x vor (Input → Output)
function firstElement<T>(arr: ______[]): ______ | undefined {
  return arr[0];
}`,
    solution: `// Anti-Pattern: T nur einmal verwendet
function logValue<T>(value: T): void {
  console.log(value);
}

// Besser: T durch unknown ersetzen
function logValueFixed(value: unknown): void {
  console.log(value);
}

// Gutes Generic: T kommt 2x vor (Input → Output)
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "unknown",
        hint: "Welcher Typ akzeptiert alles, ist aber sicher (nicht any)?",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Der Array-Element-Typ — gleich wie der Rueckgabetyp.",
      },
      {
        placeholder: "______",
        answer: "T",
        hint: "Gleicher Typ wie die Array-Elemente — das ist die Korrelation.",
      },
    ],
    concept: "Rule of Two fuer sinnvolle Typparameter",
  },
];
