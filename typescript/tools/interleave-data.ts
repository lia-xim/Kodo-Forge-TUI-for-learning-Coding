/**
 * Interleave Challenge Templates
 *
 * Vordefinierte Challenge-Templates die verschiedene TypeScript-Konzepte
 * mischen. Werden vom interleave-engine.ts verwendet um gemischte
 * Review-Challenges zu generieren.
 *
 * Jedes Template referenziert ueber concepts[] die betroffenen Konzepte
 * und ueber requiredLessons[] die Lektionen die abgeschlossen sein muessen.
 *
 * Keine externen Dependencies.
 */

// ─── Typen ──────────────────────────────────────────────────────────────────

export interface ChallengeTemplate {
  /** Fragetext */
  question: string;
  /** Optionaler Codeblock */
  code?: string;
  /** Welche Konzepte werden gemischt */
  concepts: string[];
  /** Aufgabentyp */
  type: "predict-output" | "fix-error" | "complete-code" | "explain";
  /** Korrekte Antwort */
  answer: string;
  /** Ausfuehrliche Erklaerung */
  explanation: string;
  /** Welche Lektionen muessen abgeschlossen sein (1-basiert) */
  requiredLessons: number[];
}

// ─── Challenge Templates ────────────────────────────────────────────────────

export const challengeTemplates: ChallengeTemplate[] = [
  // ─── 1: Type Erasure + Primitive Types ────────────────────────────────
  {
    question:
      "Was gibt dieser Code zur Laufzeit aus?",
    code: [
      "function double(x: number): number {",
      "  return x * 2;",
      "}",
      "",
      'console.log(typeof double);',
      'console.log(double(5));',
    ].join("\n"),
    concepts: ["type-erasure", "primitive-types", "functions"],
    type: "predict-output",
    answer: '"function"\n10',
    explanation:
      "Zur Laufzeit existieren keine TypeScript-Typen. " +
      "'typeof double' gibt 'function' zurueck (JavaScript typeof), " +
      "nicht die TypeScript-Signatur. double(5) gibt 10 zurueck.",
    requiredLessons: [1, 2],
  },

  // ─── 2: Type Annotations + Inference ──────────────────────────────────
  {
    question:
      "Welchen Typ inferiert TypeScript fuer die Variable 'result'?",
    code: [
      "const a = 42;",
      "const b = 'hello';",
      "const result = a + b;",
    ].join("\n"),
    concepts: ["type-inference", "primitive-types", "type-widening"],
    type: "predict-output",
    answer: "string",
    explanation:
      "TypeScript inferiert 'string' fuer result. Obwohl 'a' den Typ " +
      "'42' (literal) hat, fuehrt der +-Operator mit einem String zur " +
      "String-Konkatenation. Der Rueckgabewert ist 'string'. " +
      "Zur Laufzeit waere result = '42hello'.",
    requiredLessons: [2, 3],
  },

  // ─── 3: Arrays + Type Annotations ────────────────────────────────────
  {
    question:
      "Finde und behebe den Fehler in diesem Code:",
    code: [
      "const numbers: number[] = [1, 2, 3];",
      "const mixed: [string, number] = ['hello', 42];",
      "",
      "numbers.push('4');",
      "mixed.push(true);",
    ].join("\n"),
    concepts: ["arrays", "tuples", "type-annotations"],
    type: "fix-error",
    answer:
      "numbers.push(4); // Zahl statt String\n" +
      "// mixed.push(true); entfernen oder mixed als (string | number | boolean)[] deklarieren",
    explanation:
      "Zeile 4: 'numbers' ist number[], daher ist push('4') ein Fehler — " +
      "'4' ist ein String. Zeile 5: 'mixed' ist ein Tuple [string, number], " +
      "und push(true) ist ein Fehler da boolean nicht zu string | number passt. " +
      "Beachte: Tuples erlauben push() mit Union-Typen der Elemente, " +
      "aber nicht mit voellig anderen Typen.",
    requiredLessons: [3, 4],
  },

  // ─── 4: Objects + Interfaces ──────────────────────────────────────────
  {
    question:
      "Was passiert hier und warum?",
    code: [
      "interface User {",
      "  name: string;",
      "  age: number;",
      "}",
      "",
      "const user: User = {",
      "  name: 'Alice',",
      "  age: 30,",
      "  email: 'alice@example.com',",
      "};",
    ].join("\n"),
    concepts: ["interfaces", "excess-property-check", "structural-typing"],
    type: "explain",
    answer:
      "TypeScript meldet einen Fehler: 'email' ist keine Eigenschaft von User.",
    explanation:
      "Bei direkter Zuweisung eines Objektliterals an einen typisierten " +
      "Bezeichner greift der Excess Property Check. TypeScript warnt, " +
      "dass 'email' nicht in User definiert ist. Das ist ein spezieller " +
      "Check NUR fuer Objektliterale — bei indirekter Zuweisung " +
      "(Variable -> Variable) greift nur Structural Typing, und " +
      "zusaetzliche Properties waeren erlaubt.",
    requiredLessons: [3, 5],
  },

  // ─── 5: Tuples + Destructuring ───────────────────────────────────────
  {
    question:
      "Vervollstaendige den Code so dass TypeScript keine Fehler meldet:",
    code: [
      "function getCoordinate(): [number, number] {",
      "  return [10, 20];",
      "}",
      "",
      "const _____ = getCoordinate();",
      "console.log(`X: ${x}, Y: ${y}`);",
    ].join("\n"),
    concepts: ["tuples", "destructuring", "type-annotations"],
    type: "complete-code",
    answer: "const [x, y] = getCoordinate();",
    explanation:
      "Da getCoordinate() ein Tuple [number, number] zurueckgibt, " +
      "kann man es mit Array-Destructuring in x und y zerlegen. " +
      "TypeScript inferiert automatisch number fuer beide Variablen.",
    requiredLessons: [4],
  },

  // ─── 6: Type Erasure + Runtime Check ──────────────────────────────────
  {
    question:
      "Welche der Pruefungen funktioniert zur Laufzeit, welche nicht?",
    code: [
      "interface Animal { name: string; }",
      "class Dog implements Animal {",
      "  constructor(public name: string) {}",
      "}",
      "",
      "const pet = new Dog('Rex');",
      "console.log(pet instanceof Dog);",
      "console.log(pet instanceof Animal);",
    ].join("\n"),
    concepts: ["type-erasure", "interfaces", "classes"],
    type: "predict-output",
    answer:
      "pet instanceof Dog: true\npet instanceof Animal: Fehler — Animal ist kein Wert",
    explanation:
      "Interfaces existieren zur Laufzeit nicht (Type Erasure). " +
      "'pet instanceof Animal' verursacht einen Laufzeit-ReferenceError, " +
      "weil Animal nach der Kompilierung nicht mehr existiert. " +
      "Klassen hingegen sind JavaScript-Features und existieren zur Laufzeit. " +
      "Daher funktioniert 'pet instanceof Dog' einwandfrei.",
    requiredLessons: [1, 5],
  },

  // ─── 7: Strict Mode + Null Checks ────────────────────────────────────
  {
    question:
      "Warum meldet TypeScript hier einen Fehler mit strict: true?",
    code: [
      "function getLength(text: string | null): number {",
      "  return text.length;",
      "}",
    ].join("\n"),
    concepts: ["strict-mode", "null-checks", "union-types"],
    type: "explain",
    answer:
      "text koennte null sein. Mit strictNullChecks " +
      "muss man null explizit behandeln.",
    explanation:
      "Mit strict: true (speziell strictNullChecks) erkennt TypeScript, " +
      "dass text den Typ 'string | null' hat. Der Zugriff auf .length " +
      "waere bei null ein Laufzeitfehler. Loesung: " +
      "if (text !== null) return text.length; oder text?.length ?? 0;",
    requiredLessons: [1, 2],
  },

  // ─── 8: Array Methods + Type Inference ────────────────────────────────
  {
    question:
      "Welchen Typ hat 'result'?",
    code: [
      "const nums = [1, 2, 3, 4, 5];",
      "const result = nums.filter(n => n > 2).map(n => String(n));",
    ].join("\n"),
    concepts: ["arrays", "type-inference", "higher-order-functions"],
    type: "predict-output",
    answer: "string[]",
    explanation:
      "nums ist number[]. filter() gibt number[] zurueck (gleicher Typ). " +
      "map(n => String(n)) wandelt jedes Element in einen String um, " +
      "also ist result vom Typ string[]. TypeScript inferiert das " +
      "automatisch aus der Rueckgabe von String().",
    requiredLessons: [3, 4],
  },

  // ─── 9: Readonly + Tuple ─────────────────────────────────────────────
  {
    question:
      "Welche Zeilen verursachen TypeScript-Fehler?",
    code: [
      "const point: readonly [number, number] = [10, 20];  // Zeile 1",
      "point[0] = 30;                                       // Zeile 2",
      "point.push(40);                                      // Zeile 3",
      "const [x, y] = point;                                // Zeile 4",
      "console.log(x + y);                                  // Zeile 5",
    ].join("\n"),
    concepts: ["tuples", "readonly", "destructuring"],
    type: "predict-output",
    answer: "Zeile 2 und Zeile 3",
    explanation:
      "readonly [number, number] macht das Tuple unveraenderlich. " +
      "Zeile 2 (direktes Setzen) und Zeile 3 (push) sind verboten. " +
      "Zeile 4 (Destructuring) und Zeile 5 (Lesen) sind erlaubt, " +
      "da sie das Tuple nicht veraendern.",
    requiredLessons: [4],
  },

  // ─── 10: Interface Merging ────────────────────────────────────────────
  {
    question:
      "Was ist der Typ von 'config' nach beiden Deklarationen?",
    code: [
      "interface Config {",
      "  host: string;",
      "}",
      "",
      "interface Config {",
      "  port: number;",
      "}",
      "",
      "const config: Config = ???;",
    ].join("\n"),
    concepts: ["interfaces", "declaration-merging"],
    type: "complete-code",
    answer: "const config: Config = { host: 'localhost', port: 3000 };",
    explanation:
      "TypeScript fuehrt Interface Merging durch: Wenn dasselbe Interface " +
      "mehrfach deklariert wird, werden die Eigenschaften zusammengefuegt. " +
      "Config hat danach sowohl 'host: string' als auch 'port: number'. " +
      "Beide muessen beim Erstellen eines Config-Objekts angegeben werden.",
    requiredLessons: [5],
  },

  // ─── 11: Structural Typing ───────────────────────────────────────────
  {
    question:
      "Kompiliert dieser Code ohne Fehler? Begruende.",
    code: [
      "interface Point {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "interface Vector {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "const p: Point = { x: 1, y: 2 };",
      "const v: Vector = p;",
    ].join("\n"),
    concepts: ["structural-typing", "interfaces"],
    type: "explain",
    answer: "Ja, kompiliert fehlerfrei.",
    explanation:
      "TypeScript nutzt Structural Typing (Duck Typing). Point und Vector " +
      "haben exakt die gleiche Struktur, deshalb sind sie zuweisungskompatibel — " +
      "obwohl sie verschiedene Namen haben. Der Name des Interfaces spielt " +
      "keine Rolle, nur die Struktur zaehlt.",
    requiredLessons: [5],
  },

  // ─── 12: Type Narrowing + typeof ─────────────────────────────────────
  {
    question:
      "Was gibt der Code fuer die drei Aufrufe aus?",
    code: [
      "function describe(value: string | number | boolean): string {",
      "  if (typeof value === 'string') {",
      "    return `Text mit ${value.length} Zeichen`;",
      "  } else if (typeof value === 'number') {",
      "    return `Zahl: ${value.toFixed(2)}`;",
      "  } else {",
      "    return `Boolean: ${value}`;",
      "  }",
      "}",
      "",
      "console.log(describe('hello'));",
      "console.log(describe(3.14159));",
      "console.log(describe(true));",
    ].join("\n"),
    concepts: ["type-narrowing", "union-types", "primitive-types"],
    type: "predict-output",
    answer:
      "Text mit 5 Zeichen\nZahl: 3.14\nBoolean: true",
    explanation:
      "TypeScript und JavaScript verwenden typeof zur Laufzeit. " +
      "Im ersten Branch wird value auf string eingeschraenkt (.length verfuegbar). " +
      "Im zweiten auf number (.toFixed verfuegbar). " +
      "Im else-Branch bleibt nur boolean uebrig. " +
      "Das ist Type Narrowing — TypeScript versteht die Kontrollfluss-Analyse.",
    requiredLessons: [2, 3],
  },

  // ─── 13: Const Assertion ─────────────────────────────────────────────
  {
    question:
      "Was ist der Unterschied zwischen diesen beiden Deklarationen?",
    code: [
      "const a = [1, 2, 3];",
      "const b = [1, 2, 3] as const;",
    ].join("\n"),
    concepts: ["const-assertion", "tuples", "type-inference"],
    type: "explain",
    answer:
      "a hat Typ number[], b hat Typ readonly [1, 2, 3].",
    explanation:
      "Ohne 'as const' inferiert TypeScript den breitesten Typ: number[]. " +
      "Mit 'as const' wird das Array zu einem readonly Tuple mit " +
      "Literal-Typen: readonly [1, 2, 3]. Das bedeutet: b.push() " +
      "ist verboten, b[0] hat den Typ 1 (nicht number), und die " +
      "Laenge ist fix auf 3.",
    requiredLessons: [4],
  },

  // ─── 14: Optional Properties + Index Signatures ──────────────────────
  {
    question:
      "Vervollstaendige das Interface so dass der Code fehlerfrei kompiliert:",
    code: [
      "interface Settings {",
      "  _____",
      "}",
      "",
      "const s: Settings = {",
      "  theme: 'dark',",
      "  fontSize: 14,",
      "};",
      "",
      "const s2: Settings = {",
      "  theme: 'light',",
      "};",
    ].join("\n"),
    concepts: ["interfaces", "optional-properties"],
    type: "complete-code",
    answer:
      "interface Settings {\n  theme: string;\n  fontSize?: number;\n}",
    explanation:
      "Da s2 kein fontSize hat, muss fontSize optional sein (mit ?). " +
      "theme wird in beiden Objekten angegeben, ist also erforderlich. " +
      "Optional Properties werden mit ? markiert: fontSize?: number " +
      "bedeutet der Typ ist 'number | undefined'.",
    requiredLessons: [5],
  },

  // ─── 15: Type vs Interface ───────────────────────────────────────────
  {
    question:
      "Welche Aussage ueber type vs interface ist korrekt?",
    code: [
      "type StringOrNumber = string | number;",
      "",
      "interface Named {",
      "  name: string;",
      "}",
    ].join("\n"),
    concepts: ["type-aliases", "interfaces", "union-types"],
    type: "explain",
    answer:
      "Union Types (string | number) koennen nur mit type definiert werden, " +
      "nicht mit interface.",
    explanation:
      "Interfaces koennen nur Objekt-Formen beschreiben (mit Properties " +
      "und Methoden). Union Types, Intersection Types, und primitive " +
      "Typ-Aliase brauchen type. Interfaces unterstuetzen dafuer " +
      "Declaration Merging und extends. In der Praxis: interface fuer " +
      "Objekte, type fuer alles andere.",
    requiredLessons: [3, 5],
  },

  // ─── 16: Immutability Pitfall ─────────────────────────────────────────
  {
    question:
      "Verursacht dieser Code einen TypeScript-Fehler?",
    code: [
      "const user = {",
      "  name: 'Alice',",
      "  age: 30,",
      "};",
      "",
      "user.age = 31;",
    ].join("\n"),
    concepts: ["const", "objects", "mutability"],
    type: "predict-output",
    answer: "Nein, kein Fehler.",
    explanation:
      "'const' in JavaScript/TypeScript bedeutet: die Referenz ist " +
      "unveraenderlich, nicht das Objekt selbst. user = {} waere ein Fehler, " +
      "aber user.age = 31 ist erlaubt. Fuer echte Unveraenderlichkeit " +
      "braucht man Readonly<User> oder as const.",
    requiredLessons: [2, 5],
  },

  // ─── 17: Compiler-Pipeline + Source Maps ──────────────────────────────
  {
    question:
      "In welcher Reihenfolge verarbeitet tsc diesen Code, " +
      "und was bleibt zur Laufzeit uebrig?",
    code: [
      "interface Logger {",
      "  log(msg: string): void;",
      "}",
      "",
      "const logger: Logger = {",
      "  log(msg) { console.log(msg); }",
      "};",
      "",
      "logger.log('Hello');",
    ].join("\n"),
    concepts: ["compiler-pipeline", "type-erasure", "interfaces"],
    type: "explain",
    answer:
      "Parsing -> Type Checking -> Emit. " +
      "Zur Laufzeit: const logger = { log(msg) { console.log(msg); } }; logger.log('Hello');",
    explanation:
      "Der Compiler parst den Code in einen AST, prueft die Typen " +
      "(Logger-Interface passt zum Objektliteral), und emittiert dann " +
      "JavaScript. Das Interface und alle Typ-Annotationen werden " +
      "vollstaendig entfernt (Type Erasure). Zur Laufzeit existiert " +
      "nur noch das reine JavaScript-Objekt.",
    requiredLessons: [1],
  },

  // ─── 18: Array Spread + Tuple ─────────────────────────────────────────
  {
    question:
      "Welchen Typ hat 'combined'?",
    code: [
      "const first: [string, number] = ['hello', 1];",
      "const second: number[] = [2, 3, 4];",
      "const combined = [...first, ...second];",
    ].join("\n"),
    concepts: ["tuples", "arrays", "spread-operator"],
    type: "predict-output",
    answer: "(string | number)[]",
    explanation:
      "Beim Spreaden eines Tuples [string, number] und eines number[] " +
      "ergibt sich ein Array mit dem Union-Typ (string | number)[]. " +
      "TypeScript kann die Tuple-Information nicht durch den Spread " +
      "beibehalten, da die Laenge des Ergebnis-Arrays nicht mehr " +
      "statisch bekannt ist.",
    requiredLessons: [4],
  },

  // ─── 19: Index Signature vs Record ────────────────────────────────────
  {
    question:
      "Sind diese beiden Typ-Definitionen aequivalent?",
    code: [
      "interface DictA {",
      "  [key: string]: number;",
      "}",
      "",
      "type DictB = Record<string, number>;",
    ].join("\n"),
    concepts: ["index-signatures", "utility-types", "interfaces"],
    type: "explain",
    answer: "Ja, sie sind strukturell aequivalent.",
    explanation:
      "Record<string, number> ist ein eingebauter Utility Type der zu " +
      "{ [key: string]: number } expandiert wird. Beide akzeptieren " +
      "beliebige String-Keys mit number-Werten. Der Unterschied: " +
      "DictA (interface) kann durch Declaration Merging erweitert werden, " +
      "DictB (type alias) nicht.",
    requiredLessons: [5],
  },

  // ─── 20: Mixed Concepts Challenge ────────────────────────────────────
  {
    question:
      "Finde alle Fehler in diesem Code (es sind genau 3):",
    code: [
      "interface Product {",
      "  id: number;",
      "  name: string;",
      "  price: number;",
      "}",
      "",
      "const products: Product[] = [",
      "  { id: 1, name: 'Widget', price: 9.99 },",
      "  { id: '2', name: 'Gadget', price: 19.99 },",
      "];",
      "",
      "const names: string[] = products.map(p => p.price);",
      "const total: number = products.reduce((sum, p) => sum + p.name, 0);",
    ].join("\n"),
    concepts: ["interfaces", "arrays", "type-annotations", "higher-order-functions"],
    type: "fix-error",
    answer:
      "1. id: '2' -> id: 2 (string statt number)\n" +
      "2. names: p.price -> p.name (number statt string)\n" +
      "3. total: p.name -> p.price (string statt number)",
    explanation:
      "Fehler 1: id ist als number definiert, '2' ist aber ein String. " +
      "Fehler 2: names soll string[] sein, aber p.price ist number. " +
      "Fehler 3: total soll number sein, aber p.name ist string — " +
      "die Summe wuerde String-Konkatenation statt Addition ergeben. " +
      "TypeScript findet alle drei Fehler zur Compile-Zeit!",
    requiredLessons: [2, 4, 5],
  },
];
