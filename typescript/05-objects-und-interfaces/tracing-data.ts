/**
 * Lektion 05 — Tracing-Exercises: Objects & Interfaces
 *
 * Themen:
 *  - Structural Typing: Zuweisungen basierend auf Struktur
 *  - Excess Property Checking: Warum schlaegt das fehl?
 *  - Interface extends: Vererbung und Kompatibilitaet
 *  - Optional Properties und ihre Typen
 *
 * Schwierigkeit steigend: 1 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Structural Typing — Zuweisungsregeln --------------------
  {
    id: "05-structural-typing",
    title: "Structural Typing — Form statt Name",
    description:
      "Verfolge welche Zuweisungen TypeScript erlaubt und welche " +
      "nicht, basierend auf der Struktur der Objekte.",
    code: [
      "interface Point2D {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "interface Point3D {",
      "  x: number;",
      "  y: number;",
      "  z: number;",
      "}",
      "",
      "const p3: Point3D = { x: 1, y: 2, z: 3 };",
      "const p2: Point2D = p3;",
      "// const p3b: Point3D = { x: 1, y: 2 };  // Fehler!",
      "",
      "console.log(p2.x, p2.y);",
    ],
    steps: [
      {
        lineIndex: 11,
        question:
          "Ist die Zuweisung 'p3' mit allen drei Properties (x, y, z) " +
          "an Point3D erlaubt?",
        expectedAnswer: "Ja",
        variables: { "p3": "Point3D ({ x: 1, y: 2, z: 3 })" },
        explanation:
          "Das Objekt hat alle erforderlichen Properties von " +
          "Point3D (x, y, z). Die Zuweisung ist gueltig.",
      },
      {
        lineIndex: 12,
        question:
          "Ist die Zuweisung 'p2: Point2D = p3' erlaubt? " +
          "Point3D hat eine zusaetzliche Property z.",
        expectedAnswer: "Ja",
        variables: { "p3": "Point3D", "p2": "Point2D (zeigt auf p3)" },
        explanation:
          "Structural Typing: TypeScript prueft ob p3 alle " +
          "Properties von Point2D hat (x und y). Es hat sie — " +
          "plus eine zusaetzliche (z). Zusaetzliche Properties " +
          "sind bei Variablen-Zuweisungen erlaubt. " +
          "Ein Point3D IST ein Point2D (hat alles was noetig ist).",
      },
      {
        lineIndex: 13,
        question:
          "Warum wuerde 'p3b: Point3D = { x: 1, y: 2 }' fehlschlagen?",
        expectedAnswer: "z fehlt — Point3D erfordert x, y UND z",
        variables: {},
        explanation:
          "Point3D erfordert drei Properties. { x: 1, y: 2 } hat " +
          "nur zwei. Es fehlt z. Structural Typing bedeutet: " +
          "Das Objekt muss MINDESTENS alle geforderten Properties " +
          "haben. Weniger geht nicht.",
      },
      {
        lineIndex: 15,
        question:
          "Kann man ueber p2 auf p2.z zugreifen? " +
          "(p2 zeigt auf das gleiche Objekt wie p3)",
        expectedAnswer: "Nein, TypeScript-Fehler (z existiert nicht auf Point2D)",
        variables: { "p2.x": "1", "p2.y": "2" },
        explanation:
          "Obwohl das Laufzeit-Objekt die Property z hat, " +
          "kennt TypeScript sie nicht. p2 hat den Typ Point2D, " +
          "und Point2D hat nur x und y. Der Zugriff auf z " +
          "wird vom Compiler blockiert — auch wenn es zur " +
          "Laufzeit funktionieren wuerde.",
      },
    ],
    concept: "structural-typing",
    difficulty: 1,
  },

  // --- Exercise 2: Excess Property Checking --------------------------------
  {
    id: "05-excess-property-checking",
    title: "Excess Property Checking — Warum mal ja, mal nein?",
    description:
      "Verfolge wann TypeScript zusaetzliche Properties erlaubt " +
      "und wann nicht. Die Regeln sind ueberraschend.",
    code: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "",
      "// Direkte Zuweisung:",
      "// const c1: Config = { host: 'localhost', port: 3000, debug: true };",
      "",
      "// Ueber Variable:",
      "const temp = { host: 'localhost', port: 3000, debug: true };",
      "const c2: Config = temp;",
      "",
      "// Funktion:",
      "function startServer(config: Config) { return config; }",
      "startServer({ host: 'localhost', port: 3000 });",
      "// startServer({ host: 'localhost', port: 3000, debug: true });",
    ],
    steps: [
      {
        lineIndex: 6,
        question:
          "Ist die direkte Zuweisung mit der zusaetzlichen " +
          "Property 'debug' erlaubt?",
        expectedAnswer: "Nein, Compile-Fehler: 'debug' existiert nicht in Config",
        variables: {},
        explanation:
          "Bei DIREKTEN Objekt-Literal-Zuweisungen aktiviert TypeScript " +
          "das 'Excess Property Checking'. Es prueft ob ALLE " +
          "Properties im Interface definiert sind. debug ist nicht " +
          "in Config definiert — daher der Fehler.",
      },
      {
        lineIndex: 10,
        question:
          "Ist die Zuweisung ueber die Zwischen-Variable 'temp' " +
          "erlaubt? temp hat auch die Property 'debug'.",
        expectedAnswer: "Ja, kein Fehler",
        variables: { "temp": "{ host: string; port: number; debug: boolean }", "c2": "Config" },
        explanation:
          "Excess Property Checking gilt NUR fuer direkte " +
          "Objekt-Literal-Zuweisungen. Bei Variablen-Zuweisungen " +
          "verwendet TypeScript normales Structural Typing: " +
          "temp hat host und port, das reicht fuer Config.",
      },
      {
        lineIndex: 15,
        question:
          "Wuerde der Funktionsaufruf mit dem zusaetzlichen " +
          "'debug' in Zeile 16 funktionieren?",
        expectedAnswer: "Nein, Compile-Fehler (Excess Property Checking)",
        variables: {},
        explanation:
          "Funktionsaufrufe mit direkten Objekt-Literalen " +
          "unterliegen ebenfalls dem Excess Property Checking. " +
          "Das schuetzt vor Tippfehlern: Wenn man 'prot' statt " +
          "'port' schreibt, faengt TypeScript den Fehler ab.",
      },
      {
        lineIndex: 14,
        question:
          "Warum unterscheidet TypeScript zwischen direkten " +
          "Objekt-Literalen und Variablen-Zuweisungen?",
        expectedAnswer: "Bei Objekt-Literalen sind Extra-Properties wahrscheinlich Tippfehler",
        variables: {},
        explanation:
          "Der Grund ist pragmatisch: Wenn du ein Objekt-Literal " +
          "direkt schreibst und eine Property nicht zum Typ gehoert, " +
          "ist das wahrscheinlich ein Fehler. Bei Variablen koennte " +
          "das Objekt absichtlich mehr Properties haben (z.B. wenn " +
          "es aus einer anderen Quelle kommt).",
      },
    ],
    concept: "excess-property-checking",
    difficulty: 2,
  },

  // --- Exercise 3: Interface extends — Vererbung ---------------------------
  {
    id: "05-interface-extends",
    title: "Interface extends — Vererbung und Kompatibilitaet",
    description:
      "Verfolge wie Interface-Vererbung die Typ-Kompatibilitaet " +
      "beeinflusst und welche Zuweisungen moeglich sind.",
    code: [
      "interface Animal {",
      "  name: string;",
      "  sound(): string;",
      "}",
      "",
      "interface Dog extends Animal {",
      "  breed: string;",
      "}",
      "",
      "interface ServiceDog extends Dog {",
      "  task: string;",
      "}",
      "",
      "const rex: ServiceDog = { name: 'Rex', sound() { return 'Woof'; }, breed: 'Labrador', task: 'Guide' };",
      "const dog: Dog = rex;",
      "const animal: Animal = rex;",
      "// const serviceDog: ServiceDog = dog;  // Fehler!",
    ],
    steps: [
      {
        lineIndex: 5,
        question:
          "Welche Properties muss ein Dog-Objekt haben? " +
          "(Interface Dog extends Animal)",
        expectedAnswer: "name: string, sound(): string, breed: string",
        variables: {},
        explanation:
          "Dog erbt alle Properties von Animal (name, sound) " +
          "und fuegt breed hinzu. extends bedeutet: 'hat alles " +
          "von Animal, plus eigene Properties'. Ein Dog muss " +
          "also drei Properties haben.",
      },
      {
        lineIndex: 13,
        question:
          "Welche Properties hat das rex-Objekt insgesamt?",
        expectedAnswer: "name, sound, breed, task (alle vier)",
        variables: {
          "rex.name": "\"Rex\"",
          "rex.breed": "\"Labrador\"",
          "rex.task": "\"Guide\"",
        },
        explanation:
          "ServiceDog erbt von Dog (name, sound, breed) und " +
          "fuegt task hinzu. Die Vererbungskette ist: " +
          "Animal -> Dog -> ServiceDog. Jede Stufe fuegt " +
          "mindestens eine Property hinzu.",
      },
      {
        lineIndex: 14,
        question:
          "Ist die Zuweisung 'dog: Dog = rex' erlaubt? " +
          "rex ist ein ServiceDog, nicht ein Dog.",
        expectedAnswer: "Ja",
        variables: { "dog": "Dog (zeigt auf rex)", "rex": "ServiceDog" },
        explanation:
          "ServiceDog extends Dog — jeder ServiceDog IST ein Dog " +
          "(hat name, sound, breed). Die Zuweisung 'nach oben' " +
          "in der Vererbungskette ist immer erlaubt. " +
          "Man verliert nur den Zugriff auf task.",
      },
      {
        lineIndex: 16,
        question:
          "Warum schlaegt 'serviceDog: ServiceDog = dog' fehl? " +
          "Das Objekt hinter dog ist doch ein ServiceDog.",
        expectedAnswer: "Dog hat keine task-Property — TypeScript prueft den statischen Typ",
        variables: { "dog (statischer Typ)": "Dog (kein task)" },
        explanation:
          "TypeScript prueft den STATISCHEN Typ, nicht den " +
          "Laufzeit-Wert. dog hat den Typ Dog, und Dog hat " +
          "keine task-Property. Zuweisungen 'nach unten' in der " +
          "Vererbungskette sind nicht erlaubt, weil Properties " +
          "fehlen koennten.",
      },
    ],
    concept: "interface-extends",
    difficulty: 3,
  },

  // --- Exercise 4: Optional Properties und ihre Typen ----------------------
  {
    id: "05-optional-properties",
    title: "Optional Properties — Was steckt hinter dem Fragezeichen?",
    description:
      "Verfolge wie optionale Properties den Typ beeinflussen " +
      "und welche Checks noetig sind.",
    code: [
      "interface UserProfile {",
      "  name: string;",
      "  email?: string;",
      "  age?: number;",
      "}",
      "",
      "const user: UserProfile = { name: 'Anna' };",
      "const email = user.email;",
      "const upper = user.email?.toUpperCase();",
      "",
      "if (user.email) {",
      "  const confirmed = user.email;",
      "}",
    ],
    steps: [
      {
        lineIndex: 6,
        question:
          "Ist die Zuweisung gueltig? email und age fehlen " +
          "im Objekt.",
        expectedAnswer: "Ja, weil email und age optional sind (mit ? markiert)",
        variables: { "user": "UserProfile ({ name: \"Anna\" })" },
        explanation:
          "Optionale Properties (mit ?) muessen nicht angegeben " +
          "werden. Nur 'name' ist Pflicht. Das Objekt { name: 'Anna' } " +
          "erfuellt alle Anforderungen von UserProfile.",
      },
      {
        lineIndex: 7,
        question:
          "Welchen Typ hat 'email' (user.email)?",
        expectedAnswer: "string | undefined",
        variables: { "email": "string | undefined" },
        explanation:
          "Eine optionale Property 'email?: string' hat den Typ " +
          "string | undefined. Wenn die Property nicht gesetzt ist, " +
          "gibt der Zugriff undefined zurueck. TypeScript fuegt " +
          "das '| undefined' automatisch hinzu.",
      },
      {
        lineIndex: 8,
        question:
          "Welchen Typ hat 'upper' (user.email?.toUpperCase())?",
        expectedAnswer: "string | undefined",
        variables: { "upper": "string | undefined" },
        explanation:
          "Der Optional Chaining Operator (?.) gibt undefined " +
          "zurueck wenn user.email undefined ist, oder den " +
          "toUpperCase()-Wert wenn es ein String ist. " +
          "Der resultierende Typ ist string | undefined.",
      },
      {
        lineIndex: 11,
        question:
          "Welchen Typ hat 'confirmed' (user.email nach dem if-Check)?",
        expectedAnswer: "string",
        variables: { "confirmed": "string" },
        explanation:
          "Der truthiness-Check 'if (user.email)' schliesst " +
          "undefined (und auch '' als falsy) aus. Innerhalb des " +
          "if-Blocks narrowt TypeScript den Typ zu string. " +
          "Das ist Control Flow Analysis bei optionalen Properties.",
      },
    ],
    concept: "optional-properties",
    difficulty: 2,
  },

  // --- Exercise 5: Readonly und Structural Typing --------------------------
  {
    id: "05-readonly-structural",
    title: "Readonly — Schutz nur auf Typ-Ebene",
    description:
      "Verfolge wie readonly Properties zur Compile-Zeit schuetzen " +
      "aber zur Laufzeit veraenderbar bleiben.",
    code: [
      "interface Immutable {",
      "  readonly id: number;",
      "  readonly name: string;",
      "}",
      "",
      "interface Mutable {",
      "  id: number;",
      "  name: string;",
      "}",
      "",
      "const obj: Immutable = { id: 1, name: 'Test' };",
      "// obj.id = 2;  // Fehler!",
      "",
      "const mutable: Mutable = obj;",
      "mutable.name = 'Changed';",
      "console.log(obj.name);",
    ],
    steps: [
      {
        lineIndex: 11,
        question:
          "Warum schlaegt 'obj.id = 2' fehl?",
        expectedAnswer: "id ist readonly — Zuweisung an readonly Properties ist verboten",
        variables: { "obj": "Immutable ({ id: 1, name: \"Test\" })" },
        explanation:
          "readonly Properties koennen nach der Initialisierung " +
          "nicht mehr zugewiesen werden. TypeScript meldet einen " +
          "Compile-Fehler. Das schuetzt vor versehentlichen " +
          "Aenderungen.",
      },
      {
        lineIndex: 13,
        question:
          "Ist die Zuweisung 'mutable: Mutable = obj' erlaubt? " +
          "Immutable hat readonly, Mutable nicht.",
        expectedAnswer: "Ja",
        variables: { "mutable": "Mutable (zeigt auf obj)" },
        explanation:
          "Structural Typing ignoriert readonly bei der " +
          "Kompatibilitaetspruefung. Immutable hat id: number " +
          "und name: string — das passt zu Mutable. " +
          "Das ist ein bekanntes Schlupfloch in TypeScript.",
      },
      {
        lineIndex: 14,
        question:
          "Ist 'mutable.name = \"Changed\"' erlaubt? " +
          "mutable zeigt auf dasselbe Objekt wie obj.",
        expectedAnswer: "Ja, weil mutable den Typ Mutable hat (kein readonly)",
        variables: { "mutable.name": "\"Changed\"" },
        explanation:
          "Da mutable den Typ Mutable hat (ohne readonly), " +
          "erlaubt TypeScript die Zuweisung. Das Objekt wird " +
          "tatsaechlich veraendert — readonly ist nur eine " +
          "Compile-Zeit-Pruefung, keine Laufzeit-Garantie.",
      },
      {
        lineIndex: 15,
        question:
          "Was gibt console.log(obj.name) aus? " +
          "obj ist readonly, aber mutable hat es geaendert.",
        expectedAnswer: "Changed",
        variables: { "obj.name": "\"Changed\"", "mutable.name": "\"Changed\"" },
        explanation:
          "Beide Variablen zeigen auf dasselbe Objekt im Speicher. " +
          "Die Aenderung ueber mutable wirkt sich auf obj aus. " +
          "readonly schuetzt nur auf Typ-Ebene — es gibt keinen " +
          "Laufzeit-Schutz. Fuer echten Schutz braucht man " +
          "Object.freeze() oder strukturelles Kopieren.",
      },
    ],
    concept: "readonly-vs-mutable",
    difficulty: 4,
  },
];
