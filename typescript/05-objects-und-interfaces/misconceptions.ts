/**
 * Lektion 05 -- Fehlkonzeptionen: Objects & Interfaces
 *
 * Code-Snippets die "offensichtlich richtig" aussehen, aber subtil falsch sind.
 * Jede Misconception deckt einen haeufigen Denkfehler auf.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number; // 1 = leicht zu erkennen, 5 = sehr subtil
}

export const misconceptions: Misconception[] = [
  // ─── 1: Excess Property Check greift immer ─────────────────────────────────
  {
    id: "05-mc-01",
    title: "Excess Property Check greift immer",
    code: `interface HasName { name: string; }

function greet(person: HasName) {
  console.log("Hallo " + person.name);
}

const data = { name: "Max", age: 30, email: "max@test.de" };
greet(data); // Kompiliert das?`,
    commonBelief:
      "TypeScript meldet einen Fehler, weil 'data' extra Properties " +
      "(age, email) hat, die HasName nicht kennt.",
    reality:
      "Kein Fehler! Der Excess Property Check greift NUR bei frischen Object " +
      "Literals (direkt geschrieben). Hier wird eine VARIABLE uebergeben — " +
      "TypeScript prueft dann nur per Structural Typing: 'Hat data mindestens " +
      "name: string?' Ja, also passt es. Erst greet({ name: 'Max', age: 30 }) " +
      "wuerde den Fehler ausloesen (frisches Literal).",
    concept: "Excess Property Check nur bei frischen Object Literals",
    difficulty: 2,
  },

  // ─── 2: Intersection-Konflikte erzeugen einen Fehler ──────────────────────
  {
    id: "05-mc-02",
    title: "Intersection mit Konflikt erzeugt Compile-Fehler",
    code: `interface A { value: string; }
interface B { value: number; }

type C = A & B;

// Erwartung: TypeScript meldet einen Fehler bei der Definition von C
// Weil value nicht gleichzeitig string und number sein kann

const c: C = { value: ??? }; // Was kann man hier einsetzen?`,
    commonBelief:
      "TypeScript erkennt den Widerspruch bei der Typ-Definition und " +
      "meldet einen Compile-Fehler bei 'type C = A & B'.",
    reality:
      "KEIN Fehler bei der Typ-Definition! TypeScript erstellt C mit " +
      "value: string & number = never. Der Typ C existiert, aber es gibt " +
      "keinen Wert, der ihn erfuellt. Der Fehler kommt erst, wenn du versuchst " +
      "ein Objekt vom Typ C zu erstellen — weil nichts gleichzeitig string " +
      "UND number ist. Das ist eine Design-Entscheidung: TypeScript laesst " +
      "abstrakte Typ-Definitionen zu, auch wenn sie unbenutzbar sind.",
    concept: "Intersection erzeugt 'never' bei Konflikten, keinen Fehler",
    difficulty: 3,
  },

  // ─── 3: readonly macht deep-immutable ──────────────────────────────────────
  {
    id: "05-mc-03",
    title: "'readonly' auf einem Objekt macht es deep-immutable",
    code: `interface User {
  readonly name: string;
  readonly address: {
    city: string;
    zip: string;
  };
}

const u: User = {
  name: "Alice",
  address: { city: "Berlin", zip: "10115" },
};

u.address.city = "Hamburg"; // Fehler oder kein Fehler?`,
    commonBelief:
      "Da 'address' readonly ist, sind auch alle verschachtelten Properties " +
      "geschuetzt. 'u.address.city = ...' sollte ein Compile-Fehler sein.",
    reality:
      "KEIN Fehler! readonly ist SHALLOW — es schuetzt nur die direkte " +
      "Property-Zuweisung. 'u.address = { ... }' waere ein Fehler (die Referenz " +
      "ist readonly), aber 'u.address.city = ...' aendert das verschachtelte " +
      "Objekt, nicht die Referenz. Fuer deep-immutable brauchst du: " +
      "readonly address: { readonly city: string; readonly zip: string; } " +
      "oder einen rekursiven DeepReadonly<T> Utility Type.",
    concept: "readonly ist shallow, nicht deep",
    difficulty: 2,
  },

  // ─── 4: Leeres Interface akzeptiert nichts ─────────────────────────────────
  {
    id: "05-mc-04",
    title: "Ein leeres Interface {} akzeptiert nichts",
    code: `interface Empty {}

const a: Empty = { x: 1 };     // A
const b: Empty = 42;            // B
const c: Empty = "hello";       // C
const d: Empty = [1, 2, 3];     // D
const e: Empty = null;           // E
const f: Empty = undefined;      // F

// Welche kompilieren?`,
    commonBelief:
      "Ein leeres Interface hat keine Properties, also kann nichts zugewiesen " +
      "werden — oder bestenfalls nur leere Objekte {}.",
    reality:
      "Ueberraschung! B, C, D kompilieren alle! Ein leeres Interface verlangt " +
      "NICHTS — und alles ausser null und undefined erfuellt 'keine Anforderung'. " +
      "Zahlen, Strings und Arrays haben keine FEHLENDEN Properties. " +
      "A scheitert am Excess Property Check (frisches Object Literal mit x). " +
      "E und F scheitern weil null/undefined in strictNullChecks nicht zu {} passen. " +
      "Fazit: {} ist quasi gleichbedeutend mit NonNullable<unknown>.",
    concept: "Leeres Interface / Structural Typing Extremfall",
    difficulty: 4,
  },

  // ─── 5: interface A extends B ueberschreibt Properties ────────────────────
  {
    id: "05-mc-05",
    title: "'extends' ueberschreibt Properties des Parents",
    code: `interface Base {
  id: string;
  value: string | number;
}

interface Derived extends Base {
  value: boolean; // Kann ich den Typ aendern?
}`,
    commonBelief:
      "'extends' erlaubt es, Properties des Parent-Interfaces komplett " +
      "zu ueberschreiben — wie bei Methoden in Klassen.",
    reality:
      "Compile-Fehler! Bei 'extends' muss das Child-Interface die Parent-Properties " +
      "korrekt einhalten. 'value: boolean' ist NICHT kompatibel mit " +
      "'value: string | number'. Du kannst den Typ nur EINSCHRAENKEN " +
      "(enger machen): 'value: string' waere OK (string ist ein Subtyp von " +
      "string | number). Aber 'value: boolean' ist ein komplett anderer Typ. " +
      "Bei Intersection (&) passiert stattdessen: value wird zu " +
      "(string | number) & boolean = never.",
    concept: "extends erfordert kompatible (engere) Typen",
    difficulty: 3,
  },

  // ─── 6: Declaration Merging funktioniert auch mit type ─────────────────────
  {
    id: "05-mc-06",
    title: "Declaration Merging funktioniert auch mit 'type'",
    code: `// Mit interface — funktioniert:
interface Config { host: string; }
interface Config { port: number; }
// Config hat host UND port

// Mit type — funktioniert auch?
type Settings = { theme: string; };
type Settings = { language: string; }; // ???`,
    commonBelief:
      "Wenn Declaration Merging mit 'interface' geht, sollte es auch " +
      "mit 'type' funktionieren. Beide definieren ja Objekt-Typen.",
    reality:
      "Compile-Fehler: 'Duplicate identifier Settings'. Declaration Merging " +
      "ist ein EXKLUSIVES Feature von Interfaces. Type Aliases koennen nicht " +
      "wiedergeoeffnet werden. Das ist einer der wenigen echten Unterschiede " +
      "zwischen interface und type. Wenn du Library-Typen erweitern musst " +
      "(z.B. Window, ProcessEnv), brauchst du ein Interface.",
    concept: "Declaration Merging ist interface-exklusiv",
    difficulty: 2,
  },

  // ─── 7: Optional Property und undefined Property sind identisch ────────────
  {
    id: "05-mc-07",
    title: "Optional (?) und 'undefined' sind dasselbe",
    code: `interface A { x?: number; }
interface B { x: number | undefined; }

const objA: A = {};          // A: Gueltig?
const objB: B = {};          // B: Gueltig?

function checkA(o: A) {
  if ("x" in o) {
    console.log(o.x); // Typ von o.x hier?
  }
}`,
    commonBelief:
      "'x?: number' und 'x: number | undefined' sind identisch — " +
      "in beiden Faellen kann x undefined sein.",
    reality:
      "objA kompiliert, objB NICHT! Bei 'x?: number' darf die Property " +
      "komplett FEHLEN — das Objekt muss x gar nicht haben. Bei " +
      "'x: number | undefined' MUSS die Property vorhanden sein, aber der " +
      "Wert darf undefined sein. Also: {} passt zu A, aber nicht zu B. " +
      "Seit TypeScript 4.4 (exactOptionalPropertyTypes) kann der Unterschied " +
      "sogar noch schaerfer werden: dann ist x?: number echt nur 'fehlt' und " +
      "nicht 'ist undefined'.",
    concept: "Optional Property vs. | undefined",
    difficulty: 3,
  },

  // ─── 8: readonly verhindert Zuweisung bei Initialisierung ─────────────────
  {
    id: "05-mc-08",
    title: "'readonly' verhindert die Zuweisung bei der Initialisierung",
    code: `interface Config {
  readonly host: string;
  readonly port: number;
}

// Kann man ein readonly-Objekt ueberhaupt erstellen?
const config: Config = {
  host: "localhost",  // Zuweisung auf readonly Property?!
  port: 3000,
};

// Und was ist hiermit?
const mutable = { host: "localhost", port: 3000 };
const readonlyConfig: Config = mutable;
mutable.host = "0.0.0.0"; // Wird config.host auch geaendert?`,
    commonBelief:
      "'readonly' sollte die Zuweisung komplett verbieten — auch bei der " +
      "Initialisierung. Ausserdem sollte die Zuweisung von 'mutable' " +
      "eine tiefe Kopie erstellen.",
    reality:
      "readonly verbietet nur RE-Zuweisung, nicht die INITIALE Zuweisung. " +
      "Das Object Literal bei const config = { ... } ist die Initialisierung — " +
      "das ist erlaubt. Danach ist config.host = 'xyz' ein Fehler. " +
      "ABER: 'readonlyConfig' und 'mutable' zeigen auf DASSELBE Objekt! " +
      "mutable.host = '0.0.0.0' aendert das Objekt — und readonlyConfig " +
      "sieht die Aenderung, weil es dieselbe Referenz ist. " +
      "readonly schuetzt nur den ZUGRIFFSPFAD, nicht das Objekt selbst.",
    concept: "readonly schuetzt den Pfad, nicht das Objekt",
    difficulty: 4,
  },
];
