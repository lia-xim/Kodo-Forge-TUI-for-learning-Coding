/**
 * Lektion 14 — Fehlkonzeption-Exercises: Generic Patterns
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
    id: "14-builder-this-mutation",
    title: "Builder kann this mutieren und den Typ tracken",
    code: `class Builder<T = {}> {
  set<K extends string, V>(key: K, value: V): Builder<T & Record<K, V>> {
    (this as any)[key] = value;
    return this as any; // Funktioniert das?
  }
}`,
    commonBelief: "Man kann `this` zurueckgeben und trotzdem den Typ erweitern.",
    reality:
      "TypeScript kann den Typ von `this` nicht nachtraeglich aendern. " +
      "Der Builder muss eine NEUE Instanz zurueckgeben (immutable Builder) " +
      "damit der erweiterte Typ `T & Record<K, V>` korrekt ist. " +
      "Bei `return this` bleibt der Typ Builder<T> — ohne das neue Feld.",
    concept: "Immutable Builder / Type Growth",
    difficulty: 4,
  },

  {
    id: "14-pipe-single-generic",
    title: "pipe() geht mit einem einzigen Typparameter",
    code: `// Warum geht das nicht?
function pipe<T>(value: T, ...fns: ((v: T) => T)[]): T {
  return fns.reduce((v, fn) => fn(v), value);
}
// pipe("hello", s => s.length); // Error! number !== string`,
    commonBelief: "Ein einziger Typparameter T reicht fuer pipe().",
    reality:
      "pipe() veraendert den Typ bei jedem Schritt: string -> number -> boolean. " +
      "Ein einziger Typparameter T erzwingt dass ALLE Schritte denselben Typ " +
      "haben. Fuer echtes pipe() braucht man Overloads mit separaten " +
      "Typparametern pro Schritt (A -> B -> C -> D).",
    concept: "pipe() / Multi-Step Type Transitions",
    difficulty: 3,
  },

  {
    id: "14-conditional-type-narrowing",
    title: "Conditional Types werden durch if/else genarrowt",
    code: `type Result<T> = T extends string ? string : number;

function process<T extends string | number>(v: T): Result<T> {
  if (typeof v === "string") {
    return v.toUpperCase(); // Error!
  }
  return v * 2; // Error!
}`,
    commonBelief: "TypeScript narrowt Conditional Types durch Control Flow Analyse.",
    reality:
      "TypeScript kann Conditional Types NICHT durch if/else narrowen. " +
      "Auch wenn `typeof v === 'string'` wahr ist, weiss der Compiler nicht " +
      "dass Result<T> jetzt 'string' ist. Man braucht einen Cast: " +
      "`return v.toUpperCase() as Result<T>`. Das ist eine bekannte " +
      "Einschraenkung des Type Systems.",
    concept: "Conditional Types / Control Flow Limitation",
    difficulty: 4,
  },

  {
    id: "14-generic-collections-any-array",
    title: "any[] ist genauso gut wie Stack<T>",
    code: `const stack: any[] = [];
stack.push(42);
stack.push("oops"); // Kein Fehler!
const value = stack.pop(); // Typ: any`,
    commonBelief: "any[] funktioniert genau wie Stack<T> — man muss eben aufpassen.",
    reality:
      "any[] verliert ALLE Typinformationen. Du bekommst keine Compile-Fehler " +
      "bei falschen Typen, keine Autovervollstaendigung, und Bugs werden erst " +
      "zur Laufzeit sichtbar. Stack<T> garantiert: Was reingeht (push) hat " +
      "denselben Typ wie was rauskommt (pop). Das ist der Unterschied zwischen " +
      "'aufpassen' und 'der Compiler passt fuer dich auf'.",
    concept: "Type Safety vs any",
    difficulty: 1,
  },

  {
    id: "14-const-type-param-readonly",
    title: "const T macht den Wert readonly",
    code: `function f<const T>(x: T): T { return x; }
const result = f([1, 2, 3]);
// result ist readonly [1, 2, 3] — aber die VARIABLE result ist nicht const!`,
    commonBelief: "const Type Parameter macht den Wert unveraenderlich.",
    reality:
      "const T beeinflusst nur die TYP-INFERENZ, nicht das Laufzeitverhalten. " +
      "Es erzwingt dass TypeScript den praezisesten Literal-Typ inferiert " +
      "(readonly [1, 2, 3] statt number[]). Aber die Variable `result` kann " +
      "trotzdem einer neuen Variablen zugewiesen werden — readonly betrifft " +
      "nur die Array-Mutation, nicht die Variable.",
    concept: "const Type Parameters / Inference vs Immutability",
    difficulty: 3,
  },

  {
    id: "14-recursive-type-infinite",
    title: "Rekursive Typen erzeugen unendliche Rekursion",
    code: `interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}
// Stoppt TypeScript hier nicht?`,
    commonBelief: "Rekursive Typen fuehren zu unendlicher Rekursion und Fehlern.",
    reality:
      "TypeScript unterstuetzt rekursive Typen explizit. Interfaces und Type " +
      "Aliases werden 'lazy' evaluiert — der Compiler loest die Referenz " +
      "erst auf wenn sie gebraucht wird. Bei konkreten Werten ist die " +
      "Rekursion immer endlich (Blaetter haben children: []). " +
      "Nur bei bestimmten Conditional Types gibt es Rekursionslimits.",
    concept: "Recursive Types / Lazy Evaluation",
    difficulty: 2,
  },

  {
    id: "14-phantom-type-runtime",
    title: "Token<T> hat T als Runtime-Information",
    code: `class Token<T> {
  constructor(public name: string) {}
}
const DB = new Token<DatabaseService>("db");
console.log(DB); // Token { name: "db" } — wo ist DatabaseService?`,
    commonBelief: "Token<DatabaseService> speichert den Typ DatabaseService zur Laufzeit.",
    reality:
      "TypeScript hat Type Erasure: Alle Typinformationen werden bei der " +
      "Kompilierung entfernt. Token<DatabaseService> und Token<LoggerService> " +
      "sind zur Laufzeit IDENTISCH — beide sind nur { name: string }. " +
      "Der Typparameter T existiert NUR zur Compile-Zeit fuer " +
      "Typ-Inferenz bei resolve<T>().",
    concept: "Phantom Types / Type Erasure",
    difficulty: 3,
  },

  {
    id: "14-event-emitter-string-key",
    title: "EventEmitter braucht kein Typ-Interface — string reicht",
    code: `emitter.on("usr:login", handler); // Tippfehler: "usr" statt "user"
emitter.emit("user:login", { wrong: true }); // Falscher Payload`,
    commonBelief: "String-basierte Event-Namen sind flexibel genug.",
    reality:
      "Ohne Typ-Interface werden Tippfehler in Event-Namen und falsche " +
      "Payloads erst zur LAUFZEIT erkannt. Mit einem Events-Interface " +
      "validiert TypeScript: (1) Nur bekannte Event-Namen sind erlaubt, " +
      "(2) der Payload muss zum Event-Typ passen. " +
      "'usr:login' wuerde einen Compile-Fehler erzeugen.",
    concept: "TypedEventEmitter / Type Safety",
    difficulty: 2,
  },
];
