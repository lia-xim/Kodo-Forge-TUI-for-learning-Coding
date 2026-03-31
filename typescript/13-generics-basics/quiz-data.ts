/**
 * Lektion 13 — Quiz-Daten: Generics Basics
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "13";
export const lessonTitle = "Generics Basics";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Warum Generics ---
  {
    question: "Was ist das Hauptproblem bei `function firstAny(arr: any[]): any`?",
    options: [
      "Die Funktion ist zu langsam",
      "Der Rueckgabetyp ist any — TypeScript verliert alle Typinformationen",
      "any ist ein ungueltiger Typ",
      "Die Funktion akzeptiert keine Arrays",
    ],
    correct: 1,
    explanation:
      "any deaktiviert den TypeScript-Compiler fuer diesen Wert vollstaendig. " +
      "Der Rueckgabetyp ist any — du kannst .foo.bar.baz aufrufen ohne Fehler. " +
      "Das ist so unsicher wie reines JavaScript. Generics bewahren den Typ.",
  },

  // --- Frage 2: Typparameter-Syntax ---
  {
    question: "Was bedeutet das `<T>` in `function identity<T>(arg: T): T`?",
    options: [
      "T ist ein konkreter Typ namens T",
      "T ist ein Typparameter — ein Platzhalter der beim Aufruf ersetzt wird",
      "T steht immer fuer string",
      "T ist ein JavaScript-Wert",
    ],
    correct: 1,
    explanation:
      "<T> deklariert einen Typparameter — wie ein Parameter fuer Werte, " +
      "aber fuer Typen. Beim Aufruf wird T durch den konkreten Typ ersetzt: " +
      "identity<string>(\"hi\") macht T zu string. " +
      "T ist KEIN konkreter Typ — er ist ein Platzhalter.",
    code: "function identity<T>(arg: T): T { return arg; }",
  },

  // --- Frage 3: Type Inference ---
  {
    question: "Was ist der inferierte Typ von `result` bei `const result = identity(42)`?",
    options: [
      "any",
      "unknown",
      "number",
      "42",
    ],
    correct: 2,
    explanation:
      "TypeScript inferiert T aus dem Argument: 42 hat Typ number, also T = number. " +
      "Der Rueckgabetyp T wird damit auch number. Du musst T nicht explizit angeben — " +
      "TypeScript erkennt es automatisch aus den Argumenten.",
    code: "function identity<T>(arg: T): T { return arg; }\nconst result = identity(42);",
  },

  // --- Frage 4: Explizite Typangabe ---
  {
    question: "Wann MUSS man den Typparameter explizit angeben?",
    options: [
      "Immer — Inference funktioniert bei Generics nicht",
      "Wenn T nur im Rueckgabetyp vorkommt und nicht aus Argumenten inferiert werden kann",
      "Nur bei Arrow Functions",
      "Nur bei mehreren Typparametern",
    ],
    correct: 1,
    explanation:
      "Wenn T in keinem Parameter vorkommt (z.B. function create<T>(): T[]), " +
      "kann TypeScript T nicht aus den Argumenten ableiten. Dann muss man T " +
      "explizit angeben: create<string>(). Bei Argumenten inferiert TypeScript " +
      "automatisch.",
    code: "function createArray<T>(): T[] { return []; }\n// createArray(); // Error!\nconst arr = createArray<string>(); // OK",
  },

  // --- Frage 5: Mehrere Typparameter ---
  {
    question: "Was ist der Typ von `pair` bei `const pair = makePair('Max', 30)`?",
    options: [
      "[any, any]",
      "[string, number]",
      "[string, string]",
      "{ first: string; second: number }",
    ],
    correct: 1,
    explanation:
      "TypeScript inferiert T = string (aus 'Max') und U = number (aus 30). " +
      "Der Rueckgabetyp [T, U] wird zu [string, number]. Beide Typparameter " +
      "werden gleichzeitig aus den Argumenten inferiert.",
    code: "function makePair<T, U>(a: T, b: U): [T, U] { return [a, b]; }\nconst pair = makePair('Max', 30);",
  },

  // --- Frage 6: Generic Interface ---
  {
    question: "Was beschreibt `ApiResponse<User>`?",
    options: [
      "Ein Interface mit data: any",
      "Ein Interface mit data: User und allen anderen Properties des Basis-Interfaces",
      "Eine Klasse die User erweitert",
      "Ein Union Type von Api und Response und User",
    ],
    correct: 1,
    explanation:
      "ApiResponse<User> ersetzt T durch User. Wenn ApiResponse<T> die Properties " +
      "data: T, status: number, message: string hat, dann hat ApiResponse<User> " +
      "data: User, status: number, message: string. " +
      "Die Struktur bleibt gleich — nur T wird ersetzt.",
    code: "interface ApiResponse<T> { data: T; status: number; message: string; }",
  },

  // --- Frage 7: Array<T> ---
  {
    question: "Welche zwei Schreibweisen sind in TypeScript identisch?",
    options: [
      "Array<number> und number()",
      "number[] und Array<number>",
      "Array[number] und number[]",
      "number<Array> und number[]",
    ],
    correct: 1,
    explanation:
      "number[] ist Syntactic Sugar fuer Array<number>. Intern uebersetzt " +
      "TypeScript number[] zu Array<number>. Beide sind exakt derselbe Typ. " +
      "Array ist ein generisches Interface aus der Standardbibliothek.",
  },

  // --- Frage 8: extends Constraint ---
  {
    question: "Was bewirkt `T extends { length: number }` bei einem Typparameter?",
    options: [
      "T wird zu { length: number }",
      "T muss mindestens eine Property length: number haben",
      "T darf nur string sein",
      "T wird auf number eingeschraenkt",
    ],
    correct: 1,
    explanation:
      "extends bei Typparametern ist ein Constraint — eine Mindestanforderung. " +
      "T kann jeder Typ sein der MINDESTENS { length: number } hat. " +
      "string, Array, { length: 5, extra: true } — alles erlaubt. " +
      "number oder boolean waeren verboten (kein .length).",
    code: "function getLength<T extends { length: number }>(arg: T): number {\n  return arg.length; // OK!\n}",
  },

  // --- Frage 9: keyof Constraint ---
  {
    question: "Was gibt `getProperty(user, 'name')` zurueck wenn user `{ name: string; age: number }` ist?",
    options: [
      "string | number (Union aller Property-Typen)",
      "string (praezise der Typ von user.name)",
      "unknown",
      "any",
    ],
    correct: 1,
    explanation:
      "K wird zu 'name' inferiert. T[K] = T['name'] = string. " +
      "Der Indexed Access Type T[K] gibt den PRAEZISEN Typ der jeweiligen " +
      "Property zurueck — nicht den Union aller moeglichen Property-Typen. " +
      "Das ist die Staerke des keyof-Constraints.",
    code: "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]",
  },

  // --- Frage 10: Mehrere Constraints ---
  {
    question: "Wie kombiniert man mehrere Constraints fuer einen Typparameter?",
    options: [
      "T extends A, B",
      "T extends A & B",
      "T extends A | B",
      "T extends A extends B",
    ],
    correct: 1,
    explanation:
      "Intersection Types (&) kombinieren Constraints. T extends A & B " +
      "bedeutet: T muss SOWOHL A als auch B erfuellen. Union (|) wuerde " +
      "heissen 'eines von beiden reicht' — das ist weniger restriktiv. " +
      "Es gibt nur ein extends pro Typparameter.",
    code: "function save<T extends HasId & Serializable>(entity: T): void",
  },

  // --- Frage 11: Default-Typparameter ---
  {
    question: "Was passiert bei `const c: Container = { value: 'hi', label: 'x' }` wenn Container `<T = string>` hat?",
    options: [
      "Error — T muss angegeben werden",
      "T wird zu string (der Default-Typ)",
      "T wird zu any",
      "T wird zu unknown",
    ],
    correct: 1,
    explanation:
      "Default-Typparameter funktionieren wie Default-Parameter bei Funktionen. " +
      "Wenn T nicht angegeben wird, gilt der Default. <T = string> macht " +
      "Container zu Container<string>. " +
      "Container<number> ueberschreibt den Default.",
    code: "interface Container<T = string> { value: T; label: string; }",
  },

  // --- Frage 12: Default-Reihenfolge ---
  {
    question: "Ist `interface Cache<K = string, V>` gueltig?",
    options: [
      "Ja — Reihenfolge spielt keine Rolle",
      "Nein — Typparameter mit Default muessen am Ende stehen",
      "Ja — aber nur bei Interfaces",
      "Nein — man kann keine zwei Typparameter haben",
    ],
    correct: 1,
    explanation:
      "Wie bei Funktions-Parametern: Defaults muessen am Ende stehen. " +
      "<K = string, V> ist ungueltig weil V (ohne Default) nach K (mit Default) " +
      "kommt. Korrekt waere <V, K = string> oder <K = string, V = string>.",
  },

  // --- Frage 13: Generics vs. any ---
  {
    question: "Was ist der fundamentale Unterschied zwischen `function f<T>(x: T): T` und `function f(x: any): any`?",
    options: [
      "Kein Unterschied — beide akzeptieren jeden Typ",
      "Generics garantieren dass Input- und Output-Typ GLEICH sind",
      "any ist schneller zur Laufzeit",
      "Generics funktionieren nur mit Objekten",
    ],
    correct: 1,
    explanation:
      "Generics VERBINDEN Input und Output. Wenn T = string, dann ist " +
      "der Rueckgabetyp auch string. Bei any koennte der Input string " +
      "und der Output number sein — any prueft nichts. " +
      "Generics sind 'typsicheres any'.",
  },

  // --- Frage 14: Unnoetige Typparameter ---
  {
    question: "Warum ist `function log<T>(x: T): void` ein Anti-Pattern?",
    options: [
      "T kann nicht inferiert werden",
      "T kommt nur einmal vor — es stellt keine Verbindung her",
      "void ist kein gueltiger Rueckgabetyp",
      "Generics duerfen nicht mit void verwendet werden",
    ],
    correct: 1,
    explanation:
      "Ein Typparameter sollte mindestens ZWEIMAL vorkommen: im Parameter " +
      "UND im Rueckgabetyp (oder in einem anderen Parameter). Wenn T nur " +
      "einmal vorkommt, verbindet es nichts — unknown waere genauso gut. " +
      "Generics haben nur Sinn wenn sie eine BEZIEHUNG herstellen.",
    code: "// Schlecht: T nur einmal\nfunction log<T>(x: T): void { ... }\n\n// Gut: T verbindet Input und Output\nfunction first<T>(arr: T[]): T | undefined { ... }",
  },

  // --- Frage 15: Promise<T> ---
  {
    question: "Warum muss man bei `http.get<User>(url)` den Typ explizit angeben?",
    options: [
      "Angular-Konvention — es gibt keinen technischen Grund",
      "HTTP-Daten kommen zur Laufzeit — TypeScript kann den Typ nicht inferieren",
      "get() hat keinen Typparameter",
      "Man muss es nicht — TypeScript inferiert immer",
    ],
    correct: 1,
    explanation:
      "TypeScript inferiert Typen aus COMPILE-ZEIT-Informationen (Argumente, " +
      "Literale). HTTP-Daten kommen erst zur Laufzeit — der Compiler hat " +
      "keine Moeglichkeit zu wissen was die API zurueckgibt. Deshalb muss " +
      "man T explizit angeben. Bei useState(0) funktioniert Inference weil " +
      "0 ein Compile-Zeit-Wert ist.",
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "any deaktiviert den TypeScript-Compiler komplett fuer diesen Wert. " +
      "Jede Operation ist erlaubt — kein Property-Check, kein Typ-Check.",
    commonMistake:
      "Viele denken any ist 'flexibel'. In Wahrheit ist es 'unsicher' — " +
      "du verlierst alle Vorteile von TypeScript.",
  },
  1: {
    whyCorrect:
      "<T> deklariert einen Platzhalter der beim Aufruf durch einen konkreten " +
      "Typ ersetzt wird. Das ist das Grundprinzip von Generics.",
    commonMistake:
      "Manche denken T ist ein fester Typ namens 'T'. Es ist ein PARAMETER — " +
      "wie 'x' bei function f(x).",
  },
  2: {
    whyCorrect:
      "TypeScript unifiziert den Typ des Arguments (42 → number) mit dem " +
      "Typparameter T. T = number → Rueckgabetyp = number.",
    commonMistake:
      "Manche erwarten 42 (Literal Type). Ohne as const inferiert TypeScript " +
      "den breiten Typ number, nicht den Literal Type.",
  },
  3: {
    whyCorrect:
      "Inference braucht Compile-Zeit-Informationen. Wenn T in keinem " +
      "Parameter vorkommt, gibt es nichts woraus TypeScript inferieren koennte.",
    commonMistake:
      "Viele vergessen dass Inference NUR aus Argumenten funktioniert. " +
      "Kein Argument mit T → keine Inference moeglich.",
  },
  4: {
    whyCorrect:
      "TypeScript inferiert jeden Typparameter unabhaengig aus dem " +
      "entsprechenden Argument. T aus dem ersten, U aus dem zweiten.",
    commonMistake:
      "Manche erwarten dass alle Typparameter denselben Typ haben muessen. " +
      "Jeder Parameter ist unabhaengig.",
  },
  5: {
    whyCorrect:
      "Generische Interfaces sind Schablonen. T wird durch den konkreten " +
      "Typ ersetzt — alle Properties die T verwenden werden aktualisiert.",
    commonMistake:
      "Manche verwechseln generische Interfaces mit Vererbung. " +
      "ApiResponse<User> 'erbt' nicht von User — es ENTHAELT User als data.",
  },
  6: {
    whyCorrect:
      "number[] ist Syntactic Sugar den TypeScript intern zu Array<number> " +
      "uebersetzt. Kein Unterschied im Verhalten oder Typ.",
    commonMistake:
      "Manche denken die Array<T>-Schreibweise hat andere Features. " +
      "Beide sind identisch — nur die Syntax unterscheidet sich.",
  },
  7: {
    whyCorrect:
      "extends bei Typparametern definiert eine Mindestanforderung. " +
      "Der Typ kann MEHR haben, aber er muss MINDESTENS den Constraint erfuellen.",
    commonMistake:
      "Manche denken extends beschraenkt T auf GENAU den Constraint-Typ. " +
      "Nein — T kann jeder Subtyp sein der den Constraint erfuellt.",
  },
  8: {
    whyCorrect:
      "K wird zum konkreten Literal 'name' inferiert. T['name'] ergibt " +
      "den praezisen Typ dieser einen Property — nicht den Union.",
    commonMistake:
      "Viele erwarten string | number | boolean (Union aller Properties). " +
      "Der Indexed Access Type ist praezise PRO Key.",
  },
  9: {
    whyCorrect:
      "Intersection Types (&) erzwingen dass BEIDE Constraints erfuellt " +
      "werden. Das ist strenger als Union (|) wo nur eines reicht.",
    commonMistake:
      "& wird mit | verwechselt. A & B = muss beides haben. " +
      "A | B = eins reicht.",
  },
  10: {
    whyCorrect:
      "Default-Typparameter werden genutzt wenn der Aufrufer keinen Typ " +
      "angibt. Wie Default-Werte bei Funktionen.",
    commonMistake:
      "Manche denken Defaults ueberschreiben explizite Angaben. " +
      "Nein — Container<number> ignoriert den Default komplett.",
  },
  11: {
    whyCorrect:
      "TypeScript erzwingt die Reihenfolge: Required vor Optional. " +
      "Sonst waere unklar welcher Typparameter welchem Argument entspricht.",
    commonMistake:
      "Manche denken die Reihenfolge spielt bei Typen keine Rolle. " +
      "Doch — wie bei Funktions-Parametern: Defaults muessen am Ende stehen.",
  },
  12: {
    whyCorrect:
      "Generics VERBINDEN Typen: gleicher Typ rein und raus. " +
      "any hat keine solche Verbindung — Input und Output sind unabhaengig.",
    commonMistake:
      "Viele sehen keinen Unterschied weil beide 'jeden Typ akzeptieren'. " +
      "Der Unterschied: Generics MERKEN SICH den Typ.",
  },
  13: {
    whyCorrect:
      "Ein Typparameter der nur einmal vorkommt stellt keine Beziehung her. " +
      "Er koennte durch unknown ersetzt werden ohne Informationsverlust.",
    commonMistake:
      "Manche denken mehr Generics = besser. Nein — unnoetige Typparameter " +
      "machen den Code nur schwerer lesbar ohne Mehrwert.",
  },
  14: {
    whyCorrect:
      "TypeScript-Inference braucht Compile-Zeit-Daten. HTTP-Responses " +
      "kommen zur Laufzeit — TypeScript kann nicht 'in die API schauen'.",
    commonMistake:
      "Manche denken TypeScript koennte den Typ aus der URL ableiten. " +
      "URLs sind Strings — TypeScript weiss nicht was die API zurueckgibt.",
  },
};
