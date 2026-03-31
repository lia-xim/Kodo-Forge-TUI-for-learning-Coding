/**
 * Lektion 06 — Fehlkonzeption-Exercises: Functions
 *
 * 8 Fehlkonzeptionen rund um Funktionstypen, Overloads, Callbacks,
 * this, Type Guards und mehr. Code der "offensichtlich richtig"
 * aussieht aber subtil falsch ist.
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
  // ─── 1: void-Callback darf Werte zurueckgeben ──────────────────────────
  {
    id: "06-void-callback-return",
    title: "void-Callbacks duerfen nichts zurueckgeben",
    code: `type Logger = (msg: string) => void;

const logAndCount: Logger = (msg) => {
  console.log(msg);
  return msg.length; // Erlaubt oder Fehler?
};`,
    commonBelief:
      "Eine Funktion mit Return-Typ `void` darf keinen Wert zurueckgeben. " +
      "`return msg.length` muesste ein Compile-Fehler sein.",
    reality:
      "Bei Callback-Typen (type Logger = ... => void) ist void TOLERANT. " +
      "Die Funktion darf einen Wert zurueckgeben — er wird einfach ignoriert. " +
      "Das ist absichtlich so, damit z.B. `forEach(n => arr.push(n))` funktioniert " +
      "(push gibt number zurueck). Nur bei DIREKTEN Funktionsdeklarationen ist void streng.",
    concept: "void-Callback Toleranz / Substitutability Principle",
    difficulty: 3,
  },

  // ─── 2: Optional und Default gleichzeitig ─────────────────────────────
  {
    id: "06-optional-plus-default",
    title: "Optional und Default zusammen verwenden",
    code: `function createUser(name: string, role?: string = "user") {
  return { name, role };
}`,
    commonBelief:
      "`role?: string = 'user'` kombiniert das Beste aus beiden Welten: " +
      "Der Parameter ist optional UND hat einen Default-Wert.",
    reality:
      "TypeScript verbietet diese Kombination. Ein Default-Wert macht den " +
      "Parameter AUTOMATISCH optional — das `?` ist redundant und widerspruechlich. " +
      "Richtig: `role: string = 'user'` (ohne `?`). Der Default ersetzt undefined automatisch.",
    concept: "Default-Parameter / Optionale Parameter",
    difficulty: 1,
  },

  // ─── 3: Overload Implementation ist aufrufbar ─────────────────────────
  {
    id: "06-overload-implementation-callable",
    title: "Die Implementation Signature ist fuer Aufrufer sichtbar",
    code: `function format(x: string): string;
function format(x: number): string;
function format(x: string | number): string {
  return String(x);
}

format(true); // Sollte das funktionieren?`,
    commonBelief:
      "Die Implementation akzeptiert `string | number`, also koennte " +
      "`boolean` auch passen wenn man den Union erweitert. Zumindest " +
      "sollte `string | number` als Argument funktionieren.",
    reality:
      "Die Implementation Signature ist fuer Aufrufer UNSICHTBAR. " +
      "Nur die Overload-Signaturen sind aufrufbar. `format(true)` scheitert, " +
      "weil kein Overload boolean akzeptiert. Selbst `format(x as string | number)` " +
      "wuerde scheitern — der Aufrufer sieht nur die einzelnen Overloads.",
    concept: "Function Overloads / Implementation Signature",
    difficulty: 3,
  },

  // ─── 4: Arrow Function hat eigenes this ───────────────────────────────
  {
    id: "06-arrow-has-own-this",
    title: "Arrow Functions binden this wie regulaere Funktionen",
    code: `class Timer {
  seconds = 0;

  start() {
    setInterval(function() {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
}

new Timer().start(); // Was passiert?`,
    commonBelief:
      "`this.seconds` referenziert die Timer-Instanz, weil die Funktion " +
      "innerhalb der start-Methode definiert ist. Das 'this' wird vererbt.",
    reality:
      "Regulaere Funktionen binden this DYNAMISCH — beim Aufruf durch " +
      "setInterval ist this nicht mehr die Timer-Instanz (sondern window " +
      "oder undefined im strict mode). Arrow Functions loesen das Problem, " +
      "weil sie this LEXIKALISCH vom umgebenden Scope erben: " +
      "`setInterval(() => { this.seconds++; }, 1000)`.",
    concept: "this-Binding / Arrow vs Function",
    difficulty: 2,
  },

  // ─── 5: Type Guard prueft Korrektheit ─────────────────────────────────
  {
    id: "06-type-guard-verified",
    title: "TypeScript prueft ob ein Type Guard korrekt implementiert ist",
    code: `function isNumber(value: unknown): value is number {
  return true; // Immer true — egal was reinkommt
}

const x: unknown = "hello";
if (isNumber(x)) {
  console.log(x.toFixed(2)); // Laufzeit-Fehler!
}`,
    commonBelief:
      "TypeScript stellt sicher, dass ein Type Guard korrekt ist. " +
      "`return true` muesste ein Fehler sein, weil nicht jeder Wert eine Zahl ist.",
    reality:
      "TypeScript prueft NICHT, ob ein Type Guard korrekt implementiert ist! " +
      "Es ist ein Vertrag: 'Wenn true, dann ist value von diesem Typ.' " +
      "TypeScript vertraut dir blind. `return true` kompiliert — aber " +
      "zur Laufzeit ist x immer noch ein String. Type Guards sind maechtig, " +
      "aber auch gefaehrlich wenn falsch implementiert.",
    concept: "Type Guards / Compiler-Vertrauen",
    difficulty: 4,
  },

  // ─── 6: Destructuring-Typ-Syntax ──────────────────────────────────────
  {
    id: "06-destructuring-type-syntax",
    title: "Destructuring-Parameter korrekt typisieren",
    code: `// "Ich tippe jeden Parameter einzeln:"
function greet({ name: string, age: number }) {
  console.log(name, age);
}`,
    commonBelief:
      "`{ name: string, age: number }` gibt name den Typ string und " +
      "age den Typ number — wie bei normalen Parametern.",
    reality:
      "In Destructuring-Syntax bedeutet `name: string` eine UMBENENNUNG: " +
      "Die Property 'name' wird in eine Variable namens 'string' umbenannt! " +
      "Richtig ist: `{ name, age }: { name: string; age: number }`. " +
      "Der Typ kommt NACH dem gesamten Destructuring-Pattern.",
    concept: "Destructuring / Parameter-Typisierung",
    difficulty: 2,
  },

  // ─── 7: Assertion Function ohne throw ─────────────────────────────────
  {
    id: "06-assertion-no-throw",
    title: "Assertion Function muss nicht werfen",
    code: `function assertPositive(n: number): asserts n is number {
  if (n < 0) {
    console.log("Warnung: Negative Zahl!");
    // Kein throw — nur eine Warnung
  }
}

const value: number = -5;
assertPositive(value);
// TypeScript denkt: value ist garantiert eine Zahl`,
    commonBelief:
      "Eine Assertion Function muss nicht unbedingt einen Error werfen. " +
      "Ein console.log als Warnung reicht auch.",
    reality:
      "Eine Assertion Function MUSS bei fehlgeschlagener Bedingung werfen " +
      "(throw). Wenn sie normal zurueckkehrt, nimmt TypeScript an, dass die " +
      "Assertion erfolgreich war. Ohne throw bei negativen Zahlen garaniert " +
      "die Funktion nichts — der Vertrag mit dem Compiler wird gebrochen. " +
      "TypeScript prueft das leider nicht statisch.",
    concept: "Assertion Functions / Vertrag mit dem Compiler",
    difficulty: 4,
  },

  // ─── 8: Overloads statt Union ─────────────────────────────────────────
  {
    id: "06-overloads-instead-of-union",
    title: "Overloads sind immer besser als Union Types",
    code: `// "Ich verwende Overloads fuer maximale Praezision:"
function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]): number {
  return x.length;
}`,
    commonBelief:
      "Overloads sind praeziser als Union Types und sollten bevorzugt werden. " +
      "Zwei Overloads sind besser als ein Union-Parameter.",
    reality:
      "Das TypeScript-Team empfiehlt explizit: 'Prefer parameters with " +
      "union types instead of overloads when possible.' Hier haben BEIDE " +
      "Overloads denselben Return-Typ (number) — ein Union reicht: " +
      "`function len(x: string | unknown[]): number`. Overloads sind nur " +
      "sinnvoll, wenn der Return-Typ vom Argument-Wert abhaengt.",
    concept: "Function Overloads / Union Types / Best Practice",
    difficulty: 3,
  },
];
