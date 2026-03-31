/**
 * Lektion 13 — Fehlkonzeption-Exercises: Generics Basics
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
    id: "13-generics-like-any",
    title: "Generics sind dasselbe wie any",
    code: `function withAny(x: any): any { return x; }
function withGeneric<T>(x: T): T { return x; }

const a = withAny("hallo");     // any
const b = withGeneric("hallo"); // string`,
    commonBelief: "Generics und any sind austauschbar — beide akzeptieren jeden Typ.",
    reality:
      "Generics BEWAHREN den Typ: withGeneric('hallo') gibt string zurueck. " +
      "any VERLIERT den Typ: withAny('hallo') gibt any zurueck. " +
      "Generics verbinden Input und Output — any trennt sie.",
    concept: "Generics vs. any / Typerhaltung",
    difficulty: 1,
  },

  {
    id: "13-t-is-fixed-type",
    title: "T ist ein konkreter Typ namens 'T'",
    code: `function identity<T>(arg: T): T {
  return arg;
}
// T ist KEIN Typ namens T — es ist ein Platzhalter!`,
    commonBelief: "T ist ein spezieller eingebauter Typ in TypeScript.",
    reality:
      "T ist ein PARAMETER — ein Platzhalter der beim Aufruf ersetzt wird. " +
      "T, U, MyType, TData — alle sind gueltige Namen fuer Typparameter. " +
      "T ist nur eine Konvention (T fuer Type). Man koennte auch " +
      "<Kartoffel>(arg: Kartoffel): Kartoffel schreiben.",
    concept: "Typparameter / Platzhalter",
    difficulty: 1,
  },

  {
    id: "13-inference-always-works",
    title: "TypeScript kann T immer inferieren",
    code: `function createArray<T>(): T[] {
  return [];
}
// const arr = createArray(); // Error! T unbekannt
const arr = createArray<string>(); // Muss explizit sein`,
    commonBelief: "TypeScript inferiert T immer automatisch — man muss T nie angeben.",
    reality:
      "Inference funktioniert NUR wenn T in den Parametern vorkommt. " +
      "Wenn T nur im Rueckgabetyp steht (wie bei createArray), hat " +
      "TypeScript keine Information zum Inferieren. " +
      "Dann muss man T explizit angeben: createArray<string>().",
    concept: "Type Inference / Grenzen",
    difficulty: 2,
  },

  {
    id: "13-constraint-is-exact",
    title: "T extends X bedeutet T ist genau X",
    code: `function printId<T extends { id: number }>(entity: T): void {
  console.log(entity.id);
}
// T ist nicht { id: number } — T ist der VOLLE Typ des Arguments!
printId({ id: 1, name: "Max", email: "max@test.de" });
// T = { id: number; name: string; email: string }`,
    commonBelief: "extends beschraenkt T auf genau den Constraint-Typ.",
    reality:
      "extends ist eine MINDESTANFORDERUNG, keine exakte Einschraenkung. " +
      "T behaelt den VOLLEN Typ des Arguments — mit allen zusaetzlichen " +
      "Properties. Der Constraint garantiert nur dass bestimmte Properties " +
      "vorhanden sind. T kann MEHR haben.",
    concept: "Constraints / Mindestanforderung vs. exakter Typ",
    difficulty: 3,
  },

  {
    id: "13-keyof-returns-values",
    title: "keyof gibt die Werte eines Objekts zurueck",
    code: `const user = { name: "Max", age: 30 };
type UserKeys = keyof typeof user;
// "name" | "age" — die KEYS, nicht "Max" | 30!`,
    commonBelief: "keyof typeof user ergibt 'Max' | 30 — die Werte.",
    reality:
      "keyof gibt die SCHLUESSEL (Property-Namen) als Union zurueck, " +
      "nicht die Werte. keyof typeof user = 'name' | 'age'. " +
      "Fuer die Werte braeuchte man typeof user[keyof typeof user] " +
      "(= string | number bei diesem Beispiel).",
    concept: "keyof / Schluessel vs. Werte",
    difficulty: 2,
  },

  {
    id: "13-single-t-useful",
    title: "Jeder Typparameter ist nuetzlich",
    code: `// SCHLECHT: T kommt nur einmal vor
function log<T>(value: T): void {
  console.log(value);
}
// Besser: function log(value: unknown): void`,
    commonBelief: "Mehr Generics = besserer Code. Jedes <T> macht die Funktion flexibler.",
    reality:
      "Ein Typparameter der nur EINMAL vorkommt verbindet nichts. " +
      "Er koennte durch unknown ersetzt werden ohne Informationsverlust. " +
      "Generics sind nuetzlich wenn sie eine BEZIEHUNG herstellen — " +
      "z.B. zwischen Input und Output. Mindestens zweimal verwenden!",
    concept: "Unnoetige Typparameter / Anti-Pattern",
    difficulty: 2,
  },

  {
    id: "13-default-overrides-explicit",
    title: "Default-Typ kann nicht ueberschrieben werden",
    code: `interface Box<T = string> { content: T; }

const a: Box = { content: "hallo" };          // T = string (Default)
const b: Box<number> = { content: 42 };        // T = number (ueberschrieben!)`,
    commonBelief: "Wenn T einen Default hat, ist T immer dieser Default-Typ.",
    reality:
      "Defaults sind nur FALLBACKS — sie gelten wenn nichts angegeben wird. " +
      "Box<number> ueberschreibt den Default komplett. " +
      "Der Default greift NUR wenn T weggelassen wird: Box = Box<string>.",
    concept: "Default-Typparameter / Fallback vs. Fix",
    difficulty: 2,
  },

  {
    id: "13-runtime-type-parameter",
    title: "Typparameter existieren zur Laufzeit",
    code: `function create<T>(): T {
  // Kann man hier auf T zugreifen?
  // console.log(T); // Error! T existiert nicht zur Laufzeit
  return {} as T; // Muss casten — T ist "weg"
}`,
    commonBelief: "Man kann innerhalb der Funktion auf T zugreifen und Objekte vom Typ T erstellen.",
    reality:
      "Typparameter existieren NUR zur Compilezeit — sie werden durch Type " +
      "Erasure komplett entfernt. Im generierten JavaScript gibt es kein T. " +
      "Man kann keine Instanz von T erstellen, typeof T aufrufen oder " +
      "T als Wert verwenden. Dafuer braucht man Konstruktor-Parameter.",
    concept: "Type Erasure / Compile-Zeit vs. Laufzeit",
    difficulty: 3,
  },
];
