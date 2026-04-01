/**
 * Lektion 23 — Fehlkonzeption-Exercises: Recursive Types
 *
 * Code der "offensichtlich richtig" aussieht aber subtil falsch ist.
 * Der Lernende muss den Bug finden.
 */

export interface Misconception {
  id: string;
  title: string;
  /** Der "offensichtlich korrekte" Code */
  code: string;
  /** Was die meisten Leute denken */
  commonBelief: string;
  /** Was tatsaechlich passiert */
  reality: string;
  /** Welches Konzept getestet wird */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: Rekursive Typen verursachen Endlosschleifen ────────────────────────
  {
    id: "23-recursive-infinite-loop",
    title: "Rekursive Typen verursachen Endlosschleifen im Compiler",
    code: `type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

// "Das wird den Compiler zum Absturz bringen!"
const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};`,
    commonBelief:
      "Ein Typ der sich selbst referenziert verursacht eine Endlosschleife " +
      "im TypeScript-Compiler, aehnlich wie eine endlose rekursive Funktion.",
    reality:
      "TypeScript wertet Typen LAZY aus — der Compiler entfaltet den Typ " +
      "nur so weit wie noetig. LinkedList<number> wird nicht unendlich " +
      "entfaltet, sondern nur bis zur Tiefe die das konkrete Objekt hat. " +
      "Das | null sorgt dafuer, dass jedes Objekt endlich ist.",
    concept: "Lazy Type Evaluation",
    difficulty: 1,
  },

  // ─── 2: DeepPartial macht Methoden optional ──────────────────────────────
  {
    id: "23-deep-partial-methods",
    title: "DeepPartial macht auch Methoden optional",
    code: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

class User {
  name: string = "";
  greet(): string { return "Hallo"; }
}

type PartialUser = DeepPartial<User>;
// "greet ist jetzt optional und ich muss nicht mehr greet() aufrufen!"`,
    commonBelief:
      "DeepPartial macht ALLE Properties optional, einschliesslich Methoden. " +
      "Das bedeutet Methoden muessen nicht mehr aufgerufen werden.",
    reality:
      "Es haengt von der Implementierung ab! Die gezeigte DeepPartial macht " +
      "greet tatsaechlich optional (greet?: ...), ABER: Funktionen sind Objekte " +
      "(typeof fn === 'function'), und extends object ist true fuer Funktionen. " +
      "DeepPartial wird also auf die Funktion selbst rekursiert, was seltsame " +
      "Ergebnisse gibt. In der Praxis sollte man Funktionen separat behandeln " +
      "oder eine Implementierung verwenden die Funktionen ausschliesst.",
    concept: "Deep-Operationen und Funktionen",
    difficulty: 3,
  },

  // ─── 3: JSON.parse gibt JsonValue zurueck ─────────────────────────────────
  {
    id: "23-json-parse-type",
    title: "JSON.parse gibt automatisch JsonValue zurueck",
    code: `type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const data = JSON.parse('{"name": "Max"}');
// data ist jetzt JsonValue, richtig?

data.name.toUpperCase(); // "Alles typsicher!"`,
    commonBelief:
      "Weil wir einen JsonValue-Typ definiert haben, gibt JSON.parse " +
      "automatisch JsonValue zurueck und alles ist typsicher.",
    reality:
      "JSON.parse gibt 'any' zurueck — TypeScript's lib.es5.d.ts definiert " +
      "es so: parse(text: string): any. Unser JsonValue-Typ existiert nur " +
      "in unserem Code und aendert NICHTS an der Signatur von JSON.parse. " +
      "Man muss explizit casten: JSON.parse(text) as JsonValue. " +
      "Selbst dann ist es ein Trust-Cast — keine echte Laufzeit-Validierung.",
    concept: "Type Assertions vs Runtime-Validierung",
    difficulty: 2,
  },

  // ─── 4: Rekursive Typen sind immer langsam ────────────────────────────────
  {
    id: "23-recursive-always-slow",
    title: "Rekursive Typen sind immer langsam fuer den Compiler",
    code: `type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// "Das verlangsamt meinen Build um Sekunden!"
const tree: TreeNode<string> = {
  value: "root",
  children: [
    { value: "child1", children: [] },
    { value: "child2", children: [] },
  ],
};`,
    commonBelief:
      "Rekursive Typen machen den Compiler grundsaetzlich langsam " +
      "und sollten vermieden werden.",
    reality:
      "EINFACHE rekursive Typen wie TreeNode<T> oder LinkedList<T> " +
      "sind voellig unproblematisch. Der Compiler entfaltet sie nur " +
      "bis zur Tiefe des konkreten Objekts. Problematisch werden " +
      "rekursive Typen erst bei BREITEN Objekten mit distributiven " +
      "Conditional Types (exponentielle Expansion) oder bei Type-Level- " +
      "Berechnungen (z.B. Paths auf riesigen Typen).",
    concept: "Compiler-Performance",
    difficulty: 2,
  },

  // ─── 5: type X = X | null ist rekursiv ────────────────────────────────────
  {
    id: "23-circular-not-recursive",
    title: "type X = X | null ist ein rekursiver Typ",
    code: `// "Das ist mein einfachster rekursiver Typ!"
type MaybeNull = MaybeNull | null;

const value: MaybeNull = null;`,
    commonBelief:
      "type X = X | null ist ein gueltiger rekursiver Typ, " +
      "der entweder sich selbst oder null sein kann.",
    reality:
      "Das ist KEIN gueltiger rekursiver Typ — TypeScript meldet " +
      "'Type alias MaybeNull circularly references itself'. " +
      "Direkte Zirkularitaet in Union/Intersection ist verboten. " +
      "Rekursion funktioniert nur in Property-Typen, Conditional Types " +
      "oder Mapped Types. type List<T> = { next: List<T> | null } ist OK, " +
      "type X = X | null ist nicht OK.",
    concept: "Zirkulaere vs rekursive Typen",
    difficulty: 2,
  },

  // ─── 6: FlatArray<T, Infinity> existiert ──────────────────────────────────
  {
    id: "23-flat-infinity",
    title: "Man kann FlatArray mit unendlicher Tiefe verwenden",
    code: `// Eingebautes FlatArray:
type Flat = FlatArray<number[][][], typeof Infinity>;
// "Flatten auf beliebige Tiefe!"`,
    commonBelief:
      "Man kann Infinity als Tiefen-Parameter fuer FlatArray verwenden " +
      "um Arrays beliebig tief zu flatten.",
    reality:
      "FlatArray in lib.es2019.d.ts akzeptiert nur number, aber " +
      "intern wird die Rekursion durch ein Lookup-Tuple begrenzt: " +
      "[-1, 0, 1, 2, 3, ...20]. Tiefen ueber 20 werden nicht unterstuetzt. " +
      "typeof Infinity ist number, aber die Lookup-Tabelle hat keinen " +
      "Eintrag fuer Infinity. In der Praxis: flat(Infinity) funktioniert " +
      "zur Laufzeit, aber der Typ-Level-Flatten ist auf endliche Tiefen beschraenkt.",
    concept: "FlatArray Tiefen-Limit",
    difficulty: 3,
  },

  // ─── 7: Tail Recursion macht alles schnell ────────────────────────────────
  {
    id: "23-tail-recursion-universal",
    title: "Tail Recursion Optimization macht alle rekursiven Typen schnell",
    code: `// "Mit TS 4.5+ ist Rekursionstiefe kein Problem mehr!"

// Paths auf einem breiten Objekt:
type BigObject = {
  a: { x: string; y: number; z: boolean };
  b: { x: string; y: number; z: boolean };
  c: { x: string; y: number; z: boolean };
  d: { x: string; y: number; z: boolean };
  e: { x: string; y: number; z: boolean };
};

type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | \`\${K}.\${Paths<T[K]>}\` }[keyof T & string]
  : never;

type AllPaths = Paths<BigObject>;`,
    commonBelief:
      "Tail Recursion Optimization in TypeScript 4.5 loest alle " +
      "Performance-Probleme bei rekursiven Typen.",
    reality:
      "Tail Recursion Optimization hilft nur bei TIEFE (Stack-Limit), " +
      "nicht bei BREITE (Union-Explosion). Paths<BigObject> hat kein " +
      "Tiefenproblem — das Problem ist die Anzahl generierter Pfade. " +
      "Bei breiten Objekten waechst die Union-Groesse polynomial oder " +
      "exponentiell. Tail Recursion Optimization greift auch nur wenn " +
      "der rekursive Aufruf in Tail-Position steht.",
    concept: "Tail Recursion vs Breite",
    difficulty: 4,
  },

  // ─── 8: Paths<T> erfasst Array-Indizes ────────────────────────────────────
  {
    id: "23-paths-array-indices",
    title: "Paths<T> erfasst automatisch Array-Indizes",
    code: `type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | \`\${K}.\${Paths<T[K]>}\` }[keyof T & string]
  : never;

type Data = {
  users: { name: string }[];
};

type AllPaths = Paths<Data>;
// "users.0.name" ist ein gueltiger Pfad, richtig?`,
    commonBelief:
      "Paths<T> berechnet automatisch numerische Array-Indizes " +
      "wie 'users.0.name' oder 'users.1.name'.",
    reality:
      "Die Standard-Paths-Implementierung erfasst KEINE numerischen " +
      "Array-Indizes. keyof string[] gibt 'length' | 'push' | 'pop' | ... " +
      "zurueck, nicht '0' | '1' | '2'. Fuer Array-Index-Pfade muesste " +
      "man Arrays mit (infer U)[] erkennen und den Element-Typ U " +
      "speziell behandeln, z.B. mit `${number}` als Platzhalter. " +
      "Ob das sinnvoll ist, haengt vom Anwendungsfall ab.",
    concept: "Paths und Arrays",
    difficulty: 3,
  },
];
