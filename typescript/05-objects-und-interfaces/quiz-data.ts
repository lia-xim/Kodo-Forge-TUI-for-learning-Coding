/**
 * Lektion 05 — Quiz-Daten: Objects & Interfaces
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from "../tools/quiz-runner.ts";

export const lessonId = "05";
export const lessonTitle = "Objects & Interfaces";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Interface vs Type ---
  {
    question:
      "Welches Feature hat 'interface', das 'type' NICHT hat?",
    options: [
      "Optional Properties (?)",
      "Readonly Properties",
      "Declaration Merging (Interface wiederoeffnen und erweitern)",
      "Verschachtelte Objekte",
    ],
    correct: 2,
    explanation:
      "Declaration Merging ist einzigartig fuer Interfaces. Du kannst das gleiche Interface " +
      "mehrfach deklarieren und die Properties werden zusammengefuehrt. Mit 'type' ist das nicht " +
      "moeglich -- du bekommst einen 'Duplicate identifier'-Fehler.",
  },

  // --- Frage 2: Excess Property Checking ---
  {
    question: "Was passiert bei diesem Code?",
    code: `interface Config { host: string; port: number; }
const config: Config = { host: "localhost", port: 3000, debug: true };`,
    options: [
      "Kompiliert ohne Fehler -- extra Properties sind in TypeScript immer erlaubt",
      "Compile-Fehler: 'debug' ist eine Excess Property bei einem frischen Object Literal",
      "Laufzeit-Fehler: 'debug' wird zur Laufzeit verworfen",
      "Kompiliert, aber mit einer Warnung",
    ],
    correct: 1,
    explanation:
      "Bei frischen Object Literals (direkt zugewiesen) fuehrt TypeScript einen Excess " +
      "Property Check durch. 'debug' existiert nicht in Config, also gibt es einen Fehler. " +
      "Ueber eine Zwischenvariable wuerde es funktionieren!",
  },

  // --- Frage 3: Structural Typing ---
  {
    question: "Was gibt TypeScript bei diesem Code aus?",
    code: `interface A { x: number; }
interface B { x: number; y: number; }
const b: B = { x: 1, y: 2 };
const a: A = b;`,
    options: [
      "Fehler: B ist nicht der gleiche Typ wie A",
      "Fehler: b hat eine extra Property 'y'",
      "Kompiliert ohne Fehler",
      "Fehler: A und B sind verschiedene Interfaces",
    ],
    correct: 2,
    explanation:
      "Structural Typing! B hat alles was A braucht (x: number), plus mehr. " +
      "Da die Zuweisung ueber eine Variable (b) erfolgt, greift KEIN Excess Property Check. " +
      "TypeScript prueft nur: 'Hat b mindestens x: number?' -- Ja!",
  },

  // --- Frage 4: Readonly Verhalten ---
  {
    question: "Was passiert bei diesem Code?",
    code: `interface User {
  readonly address: { city: string; };
}
const u: User = { address: { city: "Berlin" } };
u.address.city = "Hamburg";`,
    options: [
      "Compile-Fehler: address ist readonly, also auch city",
      "Kein Fehler: readonly ist shallow -- nur die Referenz 'address' ist geschuetzt",
      "Laufzeit-Fehler: Das Objekt ist eingefroren",
      "Compile-Fehler: city muss auch 'readonly' sein",
    ],
    correct: 1,
    explanation:
      "readonly in TypeScript ist SHALLOW! Es schuetzt nur die oberste Ebene. " +
      "'u.address = ...' waere ein Fehler (die Referenz ist readonly), aber " +
      "'u.address.city = ...' aendert das verschachtelte Objekt -- das ist erlaubt.",
  },

  // --- Frage 5: Index Signatures ---
  {
    question: "Was ist das Problem bei diesem Interface?",
    code: `interface Config {
  name: string;
  port: number;
  [key: string]: string;
}`,
    options: [
      "Index Signatures duerfen nicht mit festen Properties kombiniert werden",
      "'port: number' ist nicht kompatibel mit der Index Signature '[key: string]: string'",
      "Der Key-Typ 'string' ist nicht erlaubt",
      "Es gibt kein Problem -- der Code kompiliert",
    ],
    correct: 1,
    explanation:
      "Alle festen Properties muessen zum Typ der Index Signature passen. " +
      "'port: number' widerspricht '[key: string]: string'. " +
      "Loesung: '[key: string]: string | number' -- dann passen beide.",
  },

  // --- Frage 6: Extending Interfaces ---
  {
    question: "Was hat das Interface 'C' fuer Properties?",
    code: `interface A { x: number; }
interface B { y: string; }
interface C extends A, B { z: boolean; }`,
    options: [
      "Nur z: boolean",
      "x: number und z: boolean",
      "x: number, y: string und z: boolean",
      "Fehler: Ein Interface kann nicht von zwei Interfaces erben",
    ],
    correct: 2,
    explanation:
      "TypeScript unterstuetzt Mehrfachvererbung bei Interfaces! " +
      "C erbt x von A, y von B, und definiert selbst z. " +
      "Das Ergebnis: { x: number; y: string; z: boolean }.",
  },

  // --- Frage 7: Structural Typing Falle ---
  {
    question: "Kompiliert dieser Code?",
    code: `interface Euro { betrag: number; }
interface Dollar { betrag: number; }
const preis: Euro = { betrag: 100 };
const kosten: Dollar = preis;`,
    options: [
      "Fehler: Euro und Dollar sind verschiedene Typen",
      "Kompiliert: Structural Typing prueft nur die Struktur, nicht den Namen",
      "Fehler: Zuweisung zwischen verschiedenen Interfaces verboten",
      "Kompiliert, aber mit Warnung wegen moeglicher Verwechslung",
    ],
    correct: 1,
    explanation:
      "TypeScript verwendet Structural Typing -- der NAME des Interfaces ist egal! " +
      "Euro und Dollar haben die gleiche Struktur { betrag: number }, also sind sie " +
      "kompatibel. Das ist eine bekannte Schwaeche -- fuer Abhilfe gibt es 'Branded Types' (Lektion 24).",
  },

  // --- Frage 8: Optional Property ---
  {
    question: "Was ist der Unterschied zwischen diesen zwei Properties?",
    code: `interface A { x?: number; }
interface B { x: number | undefined; }`,
    options: [
      "Kein Unterschied -- beide sind identisch",
      "Bei A kann x fehlen, bei B muss x vorhanden sein (Wert darf undefined sein)",
      "Bei A ist x immer undefined, bei B kann es number oder undefined sein",
      "B erlaubt null, A nicht",
    ],
    correct: 1,
    explanation:
      "x?: number bedeutet: Die Property kann komplett fehlen ODER den Wert undefined haben. " +
      "x: number | undefined bedeutet: Die Property MUSS vorhanden sein, aber der Wert darf " +
      "undefined sein. Also: {} ist gueltig fuer A, aber NICHT fuer B!",
  },

  // --- Frage 9: Record Utility Type ---
  {
    question: "Was beschreibt dieser Typ?",
    code: `type Status = "active" | "paused" | "deleted";
type StatusCount = Record<Status, number>;`,
    options: [
      "Ein Objekt mit einer einzelnen Property namens 'Status'",
      "Ein Objekt mit genau drei Properties: active, paused, deleted -- alle vom Typ number",
      "Ein Array von Status-Strings",
      "Ein Objekt mit beliebig vielen string-Keys und number-Werten",
    ],
    correct: 1,
    explanation:
      "Record<K, V> erstellt einen Typ mit Keys vom Typ K und Werten vom Typ V. " +
      "Bei Union-Keys muessen ALLE Keys vorhanden sein. " +
      "StatusCount = { active: number; paused: number; deleted: number }.",
  },

  // --- Frage 10: Excess Property Check umgehen ---
  {
    question: "Welche der folgenden Methoden umgeht den Excess Property Check NICHT?",
    code: `interface User { name: string; }`,
    options: [
      "const data = { name: 'Max', age: 30 }; const u: User = data;",
      "const u: User = { name: 'Max', age: 30 } as User;",
      "const u: User = { name: 'Max', age: 30 };",
      "interface FlexUser extends User { [key: string]: unknown; } const u: FlexUser = { name: 'Max', age: 30 };",
    ],
    correct: 2,
    explanation:
      "Option C weist ein frisches Object Literal direkt zu -- hier greift der " +
      "Excess Property Check und 'age' wird als Fehler markiert. " +
      "Optionen A (Variable), B (Type Assertion) und D (Index Signature) umgehen den Check.",
  },

  // --- Frage 11: Intersection Types ---
  {
    question: "Was beschreibt der Typ 'A & B'?",
    code: `type A = { x: number; y: number };
type B = { y: number; z: number };
type C = A & B;`,
    options: [
      "{ x: number } -- nur die Properties die NUR in A sind",
      "{ y: number } -- nur die GEMEINSAMEN Properties",
      "{ x: number; y: number; z: number } -- ALLE Properties aus A UND B",
      "Fehler: A und B haben die gleiche Property 'y'",
    ],
    correct: 2,
    explanation:
      "Intersection (&) bedeutet: Ein Objekt muss ALLE Properties aus BEIDEN Typen haben. " +
      "Das ist KEIN 'Schnittmenge der Properties', sondern eine VEREINIGUNG der Anforderungen. " +
      "Der Name 'Intersection' bezieht sich auf die Werte-Menge: Weniger Objekte erfuellen " +
      "beide Bedingungen gleichzeitig, also ist die Menge der gueltigen Werte kleiner.",
  },

  // --- Frage 12: Intersection-Konflikt ---
  {
    question: "Was ist der Typ von 'value' im resultierenden Typ?",
    code: `type A = { value: string | number };
type B = { value: number | boolean };
type C = A & B;
// C["value"] = ???`,
    options: [
      "string | number | boolean -- Union aller Typen",
      "number -- nur der gemeinsame Typ",
      "never -- Intersection von inkompatiblen Typen",
      "string | number -- der Typ aus A wird beibehalten",
    ],
    correct: 1,
    explanation:
      "Bei Intersection werden gleiche Properties ebenfalls intersected: " +
      "(string | number) & (number | boolean) = number. " +
      "Nur 'number' ist in BEIDEN Unions enthalten. " +
      "Das ist wie ein Venn-Diagramm: Nur die Ueberlappung bleibt uebrig.",
  },

  // --- Frage 13: Partial und Pick ---
  {
    question: "Was beschreibt dieser Typ?",
    code: `interface User { id: string; name: string; email: string; }
type T = Partial<Pick<User, "name" | "email">>;`,
    options: [
      "{ id?: string; name?: string; email?: string }",
      "{ name?: string; email?: string }",
      "{ name: string; email: string }",
      "{ id: string; name?: string; email?: string }",
    ],
    correct: 1,
    explanation:
      "Zuerst Pick: Pick<User, 'name' | 'email'> = { name: string; email: string }. " +
      "Dann Partial: Partial<...> macht alle Properties optional. " +
      "Ergebnis: { name?: string; email?: string }. " +
      "Die Reihenfolge ist: erst auswaehlen, dann optional machen.",
  },

  // --- Frage 14: Structural Typing -- der Ueberraschungseffekt ---
  {
    question: "Kompiliert dieser Code?",
    code: `interface Empty {}
const a: Empty = { x: 1, y: 2 };
const b: Empty = 42;
const c: Empty = "hello";
const d: Empty = [1, 2, 3];`,
    options: [
      "Alles kompiliert -- ein leeres Interface akzeptiert alles (ausser null/undefined)",
      "Nur 'a' kompiliert -- Objekte passen, Primitive nicht",
      "Nichts kompiliert -- Object Literals haben Excess Properties",
      "Nur 'a' NICHT wegen Excess Property Check, der Rest kompiliert",
    ],
    correct: 3,
    explanation:
      "Ueberraschung! 'a' scheitert am Excess Property Check (frisches Object Literal " +
      "mit x und y, die Empty nicht kennt). Aber b, c, d kompilieren alle, weil Zahlen, " +
      "Strings und Arrays das leere Interface erfuellen -- sie haben keine FEHLENDEN Properties. " +
      "Ein leeres Interface verlangt nichts, also erfuellt fast alles die Anforderung.",
  },

  // --- Frage 15: Readonly-Array vs Readonly-Property ---
  {
    question: "Welche Zeile verursacht einen Compile-Fehler?",
    code: `interface TodoList {
  readonly items: string[];
}
const list: TodoList = { items: ["Einkaufen"] };

list.items.push("Kochen");       // Zeile A
list.items[0] = "Sport";          // Zeile B
list.items = ["Neu"];              // Zeile C`,
    options: [
      "Alle drei Zeilen -- readonly schuetzt alles",
      "Nur Zeile C -- readonly schuetzt nur die Referenz, nicht den Inhalt",
      "Zeile A und C -- push aendert das Array, = aendert die Referenz",
      "Keine -- readonly hat zur Laufzeit keinen Effekt",
    ],
    correct: 1,
    explanation:
      "readonly auf 'items' schuetzt NUR die Referenz (Zeile C: Zuweisung eines neuen Arrays). " +
      "Aber push() (Zeile A) und Index-Zuweisung (Zeile B) aendern den INHALT des Arrays, " +
      "nicht die Referenz -- das ist erlaubt! " +
      "Fuer echten Schutz brauchst du: readonly items: readonly string[]",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Elaboriertes Feedback — tiefere Erklaerungen pro Frage
// ═══════════════════════════════════════════════════════════════════════════════

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  // Frage 1: Interface vs Type
  0: {
    whyCorrect:
      "Declaration Merging erlaubt es, ein Interface mehrfach zu deklarieren — " +
      "alle Deklarationen werden zusammengefuegt. Das ist unverzichtbar fuer " +
      "Library-Autoren: Man kann Window, ProcessEnv oder Express-Request " +
      "erweitern, ohne den Quellcode zu aendern. 'type' kann das nicht.",
    commonMistake:
      "Optional (?) und readonly sind NICHT interface-exklusiv — beides " +
      "funktioniert auch mit type. Der einzige echte Unterschied in der " +
      "Praxis: Declaration Merging und die 'extends'-Syntax.",
  },

  // Frage 2: Excess Property Checking
  1: {
    whyCorrect:
      "TypeScript fuehrt einen Excess Property Check nur bei 'frischen' " +
      "Object Literals durch — also wenn { ... } direkt einem Typ zugewiesen " +
      "wird. 'debug: true' existiert nicht in Config, daher der Fehler. " +
      "Eingefuehrt in TS 1.6 gegen Tippfehler in Konfigurationsobjekten.",
    commonMistake:
      "Option A ('immer erlaubt') verwechselt Structural Typing mit dem " +
      "Excess Property Check. Structural Typing erlaubt Extra-Properties, " +
      "aber der Excess Check ist eine ZUSAETZLICHE Pruefung bei frischen Literals.",
  },

  // Frage 3: Structural Typing
  2: {
    whyCorrect:
      "Structural Typing prueft die FORM, nicht den Namen. B hat alles, " +
      "was A verlangt (x: number), plus y: string. Da b ueber eine Variable " +
      "zugewiesen wird (kein frisches Literal), greift auch kein Excess " +
      "Property Check. TypeScript fragt nur: 'Hat b ein x: number?' — Ja!",
    commonMistake:
      "In nominal typisierten Sprachen (Java, C#) waere das ein Fehler — " +
      "A und B sind verschiedene Typen. TypeScript ignoriert den Namen " +
      "und prueft nur die Struktur. Das ist die fundamentale Design-Philosophie.",
  },

  // Frage 4: Readonly Verhalten
  3: {
    whyCorrect:
      "'readonly address' schuetzt nur die REFERENZ — du kannst address nicht " +
      "auf ein neues Objekt setzen. Aber die Properties DES OBJEKTS (city, zip) " +
      "sind nicht readonly. readonly ist immer nur eine Ebene tief. " +
      "Das ist konsistent mit Object.freeze() in JavaScript, das ebenfalls shallow ist.",
    commonMistake:
      "Die Intuition 'readonly = unveraenderlich' ist zu stark. " +
      "readonly heisst 'diese spezifische Zuweisung ist verboten', " +
      "nicht 'alles darunter ist eingefroren'. Fuer deep-readonly brauchst du " +
      "einen rekursiven Utility Type oder 'as const'.",
  },

  // Frage 5: Index Signatures
  4: {
    whyCorrect:
      "Eine Index Signature [key: string]: string besagt: JEDER String-Key " +
      "liefert einen string. 'port' ist ein String-Key, muesste also string " +
      "liefern — aber port ist als number deklariert. Widerspruch! " +
      "Alle festen Properties muessen zum Index-Signature-Typ kompatibel sein.",
    commonMistake:
      "'name: string' passt zur Index Signature (string zu string), daher " +
      "uebersehen viele den Konflikt mit 'port: number'. Die Loesung: " +
      "[key: string]: string | number — dann passen beide festen Properties.",
  },

  // Frage 6: Extending Interfaces
  5: {
    whyCorrect:
      "TypeScript erlaubt Mehrfachvererbung bei Interfaces: 'extends A, B'. " +
      "C erbt ALLE Properties aus A (x: number) und B (y: string) und fuegt " +
      "z: boolean hinzu. Bei Konflikten (gleiche Property mit unterschiedlichem " +
      "Typ) gibt es einen Compile-Fehler.",
    commonMistake:
      "Aus Java oder C# kennt man 'eine Klasse kann nur von einer erben'. " +
      "Bei Interfaces ist das anders — sie beschreiben nur die Form, " +
      "es gibt keine Implementierung, also keine Diamant-Problem-Gefahr.",
  },

  // Frage 7: Structural Typing Falle
  6: {
    whyCorrect:
      "Euro und Dollar haben exakt die gleiche Struktur: { betrag: number }. " +
      "In einem Structural Typing System sind sie daher IDENTISCH. " +
      "TypeScript prueft den Interface-Namen nicht — nur die Properties. " +
      "Das ist eine bekannte Schwaeche fuer Domain-Modellierung.",
    commonMistake:
      "Die meisten Entwickler erwarten nominales Verhalten: 'Euro ist nicht " +
      "Dollar'. Fuer Typ-Sicherheit bei Waehrungen braucht man Branded Types: " +
      "type Euro = number & { __brand: 'Euro' }.",
  },

  // Frage 8: Optional Property
  7: {
    whyCorrect:
      "'x?: number' bedeutet: Die Property x darf im Objekt FEHLEN. " +
      "{} ist gueltig fuer A. 'x: number | undefined' bedeutet: Die Property " +
      "x MUSS vorhanden sein, der Wert darf aber undefined sein. " +
      "{ x: undefined } ist gueltig fuer B, aber {} ist es NICHT.",
    commonMistake:
      "'Optional heisst einfach: der Wert kann undefined sein' — das ist " +
      "eine Vereinfachung. Der entscheidende Unterschied ist EXISTENZ vs. WERT. " +
      "In der Praxis ist das relevant fuer 'in'-Checks und Object.keys().",
  },

  // Frage 9: Record Utility Type
  8: {
    whyCorrect:
      "Record<K, V> erstellt fuer JEDEN Key in K eine Property vom Typ V. " +
      "Bei einer Union wie 'active' | 'paused' | 'deleted' werden genau " +
      "3 Properties erzeugt — und ALLE muessen vorhanden sein. " +
      "Es ist wie eine vollstaendige Tabelle: Jeder Status braucht einen Zaehler.",
    commonMistake:
      "Record<string, number> (mit string statt Union) wuerde beliebig viele " +
      "Keys erlauben. Aber Record mit einer STRING LITERAL UNION erzwingt " +
      "die Vollstaendigkeit — fehlende Keys sind ein Fehler.",
  },

  // Frage 10: Excess Property Check umgehen
  9: {
    whyCorrect:
      "Option C ist ein frisches Object Literal direkt zugewiesen — genau der " +
      "Fall, in dem der Excess Property Check greift. 'age' ist nicht in User " +
      "definiert, also Fehler. Die anderen Optionen umgehen den Check: " +
      "Variable (A), Type Assertion (B), Index Signature (D).",
    commonMistake:
      "Type Assertion (as User) schaltet den Excess Check ab — das ist " +
      "maechtiger als man denkt. Es sollte sparsam verwendet werden, " +
      "weil es potentielle Tippfehler versteckt.",
  },

  // Frage 11: Intersection Types
  10: {
    whyCorrect:
      "Intersection (&) bedeutet: Ein Wert muss ALLE Anforderungen aus " +
      "BEIDEN Typen gleichzeitig erfuellen. A verlangt x und y, B verlangt " +
      "y und z — also muss C alle drei haben. Der Name 'Intersection' " +
      "bezieht sich auf die WERTE-Menge (kleiner), nicht auf die Properties (groesser).",
    commonMistake:
      "Die Verwechslung mit 'Schnittmenge der Properties' (nur y) ist " +
      "der haeufigste Fehler. Denk so: '&' bedeutet 'UND' — du musst " +
      "A UND B erfuellen, also MEHR Properties haben, nicht weniger.",
  },

  // Frage 12: Intersection-Konflikt
  11: {
    whyCorrect:
      "Bei Intersection werden gleich-benannte Properties ebenfalls intersected. " +
      "(string | number) & (number | boolean) = number. Nur number ist in " +
      "BEIDEN Unions enthalten. Das ist wie ein Venn-Diagramm: " +
      "string und boolean fallen raus, nur der Ueberlappungsbereich bleibt.",
    commonMistake:
      "Union aller Typen (Option A) verwechselt Intersection mit Union. " +
      "'never' (Option C) wuerde entstehen, wenn die Typen GAR KEINEN " +
      "gemeinsamen Typ haetten (z.B. string & number).",
  },

  // Frage 13: Partial und Pick
  12: {
    whyCorrect:
      "Die Auswertung erfolgt von innen nach aussen: Zuerst Pick — waehlt " +
      "name und email aus User. Dann Partial — macht beide optional. " +
      "id wird NIE einbezogen, weil Pick es nicht ausgewaehlt hat. " +
      "Reihenfolge ist entscheidend: Partial<Pick<...>> != Pick<Partial<...>>.",
    commonMistake:
      "Option A (alle Properties optional) vergisst, dass Pick zuerst wirkt " +
      "und id entfernt. Option D (id: string) nimmt an, id bleibt irgendwie " +
      "erhalten. Pick ist exklusiv — was nicht genannt wird, existiert nicht.",
  },

  // Frage 14: Structural Typing — der Ueberraschungseffekt
  13: {
    whyCorrect:
      "Leeres Interface {} verlangt KEINE Properties. Fast alles erfuellt " +
      "'keine Anforderung': 42 hat keine fehlenden Properties, 'hello' auch " +
      "nicht. ABER: Frische Object Literals mit Extra-Properties loesen den " +
      "Excess Property Check aus — daher scheitert 'a'. " +
      "null und undefined scheitern an strictNullChecks.",
    commonMistake:
      "Option A ('alles kompiliert') vergisst den Excess Property Check bei a. " +
      "Option B ('nur Objekte') unterschaetzt Structural Typing — auch " +
      "Primitive haben Properties (length, toString, etc.).",
  },

  // Frage 15: Readonly-Array vs Readonly-Property
  14: {
    whyCorrect:
      "'readonly items: string[]' schuetzt die Property-Zuweisung " +
      "(list.items = [...] ist verboten), aber NICHT den Array-Inhalt. " +
      "push() und Index-Zuweisung operieren auf dem Array INNERHALB der " +
      "Property — die Referenz aendert sich nicht. " +
      "Fuer vollen Schutz: 'readonly items: readonly string[]'.",
    commonMistake:
      "'Alles ist geschuetzt' (Option A) denkt zu einfach. 'readonly' auf " +
      "einer Property ist wie ein Schild an der Tuer: Es verhindert, dass " +
      "die Tuer durch eine andere ersetzt wird, aber nicht, dass man " +
      "den Raum dahinter umraeumen kann.",
  },
};
