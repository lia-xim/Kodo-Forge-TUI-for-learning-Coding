/**
 * Lektion 10 — Fehlkonzeption-Exercises: Review Challenge
 *
 * 8 Fehlkonzeptionen die ALLE Phase-1-Konzepte mischen.
 * Der Lerner muss erkennen, welches Konzept betroffen ist.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  {
    id: "10-structural-vs-nominal",
    title: "TypeScript ist nominal typisiert",
    code: `interface Dog { name: string; bark(): void; }
interface Cat { name: string; bark(): void; }

const dog: Dog = { name: "Rex", bark() { console.log("Woof"); } };
const cat: Cat = dog; // Fehler?`,
    commonBelief: "Dog und Cat sind verschiedene Typen. Die Zuweisung sollte fehlschlagen.",
    reality:
      "TypeScript ist STRUKTURELL typisiert. Dog und Cat haben dieselbe Form — " +
      "sie sind austauschbar. Der Name des Interfaces spielt keine Rolle, " +
      "nur die Struktur zaehlt. (L05, L08)",
    concept: "Strukturelle Typisierung (L05)",
    difficulty: 2,
  },

  {
    id: "10-type-erasure-runtime",
    title: "TypeScript-Typen existieren zur Laufzeit",
    code: `interface User { name: string; age: number; }

function isUser(data: unknown): boolean {
  return data instanceof User; // Funktioniert das?
}`,
    commonBelief: "instanceof prueft ob data ein User ist.",
    reality:
      "Interfaces existieren NICHT zur Laufzeit (Type Erasure, L02). " +
      "instanceof funktioniert nur mit Klassen, nicht mit Interfaces. " +
      "Fuer Laufzeit-Checks brauchst du Type Guards (L06): " +
      "typeof, in-Operator, oder benutzerdefinierte value is Type-Funktionen.",
    concept: "Type Erasure (L02) + Type Guards (L06)",
    difficulty: 3,
  },

  {
    id: "10-readonly-deep",
    title: "readonly macht Objekte komplett unveraenderlich",
    code: `interface Config {
  readonly settings: { debug: boolean; logLevel: string };
}

const config: Config = { settings: { debug: true, logLevel: "info" } };
config.settings.debug = false; // Fehler?`,
    commonBelief: "readonly settings bedeutet, dass weder settings noch seine Properties aenderbar sind.",
    reality:
      "readonly ist SHALLOW — es schuetzt nur die direkte Property. " +
      "config.settings = ... ist verboten, aber config.settings.debug = false geht! " +
      "Fuer tiefes Readonly: Readonly<T> rekursiv oder as const. (L04, L05)",
    concept: "Shallow Readonly (L04/L05) + as const (L09)",
    difficulty: 3,
  },

  {
    id: "10-any-unknown-same",
    title: "any und unknown sind dasselbe",
    code: `function process(data: any) { data.whatever(); } // OK
function processSafe(data: unknown) { data.whatever(); } // ???`,
    commonBelief: "Beide akzeptieren alles — kein Unterschied.",
    reality:
      "any DEAKTIVIERT den Compiler — alles ist erlaubt. " +
      "unknown ERZWINGT einen Check vor der Nutzung — data.whatever() " +
      "ist ein Fehler. unknown ist die typsichere Alternative. (L02)",
    concept: "any vs unknown (L02)",
    difficulty: 1,
  },

  {
    id: "10-excess-property-inconsistent",
    title: "Excess Property Check ist konsistent",
    code: `interface User { name: string; age: number; }

// Direkt: Excess Property Check greift
// const u: User = { name: "Max", age: 30, extra: true }; // Error!

// Ueber Variable: KEIN Excess Property Check!
const obj = { name: "Max", age: 30, extra: true };
const u: User = obj; // OK!`,
    commonBelief: "TypeScript sollte 'extra' in beiden Faellen ablehnen.",
    reality:
      "Der Excess Property Check greift NUR bei frischen Objekt-Literalen. " +
      "Ueber eine Variable wird nur die Struktur geprueft — extra wird " +
      "ignoriert (strukturelle Kompatibilitaet). Das ist beabsichtigt: " +
      "Objekte duerfen mehr Properties haben als der Typ deklariert. (L05)",
    concept: "Excess Property Check (L05)",
    difficulty: 3,
  },

  {
    id: "10-tuple-is-array",
    title: "Tuples und Arrays sind dasselbe",
    code: `const pair: [string, number] = ["Max", 30];
pair.push(true); // Fehler? TypeScript prueft push nicht?`,
    commonBelief: "Tuples haben eine feste Laenge — push sollte verboten sein.",
    reality:
      "Tuples sind zur Laufzeit normale Arrays — push funktioniert! " +
      "TypeScript prueft den Typ des push-Arguments (true ist nicht string | number), " +
      "aber die Laenge wird nicht geschuetzt. " +
      "Fuer echte Unveraenderlichkeit: readonly [string, number]. (L04)",
    concept: "Tuple Mutability (L04)",
    difficulty: 3,
  },

  {
    id: "10-void-callback-confusion",
    title: "void ist immer streng",
    code: `// Streng:
function doSomething(): void { return 42; } // Error!

// Tolerant:
type Cb = () => void;
const fn: Cb = () => 42; // OK!`,
    commonBelief: "void verbietet immer Rueckgabewerte.",
    reality:
      "void ist bei direkten Deklarationen STRENG, bei Callback-Typen TOLERANT. " +
      "Der Grund: Bei Deklarationen kontrollierst DU den Typ. " +
      "Bei Callbacks definiert jemand ANDERES die Schnittstelle " +
      "und sagt 'der Rueckgabewert ist mir egal'. (L06)",
    concept: "void-Callbacks (L06)",
    difficulty: 3,
  },

  {
    id: "10-enum-vs-union-choice",
    title: "Enums sind immer besser als Union Literals",
    code: `// Enum
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }

// Union Literal
type Status2 = "ACTIVE" | "INACTIVE";`,
    commonBelief: "Enums sind praeziser und sollten immer bevorzugt werden.",
    reality:
      "Union Literals erzeugen KEINEN Laufzeit-Code (Tree-Shakeable), " +
      "sind einfacher, und reichen in den meisten Faellen. " +
      "Enums sind nur noetig fuer: Laufzeit-Iteration, Reverse Mapping, " +
      "nominale Typisierung. Die Empfehlung: Union Literals als Default, " +
      "Enums nur bei Bedarf. (L09)",
    concept: "Enum vs Union Literal (L09)",
    difficulty: 2,
  },
];
