/**
 * Lektion 04 -- Completion Problems: Arrays & Tuples
 *
 * Luecken-Uebungen mit steigender Schwierigkeit.
 * Der Lernende muss die Platzhalter (___) durch korrekten Code ersetzen.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Grundlagen — Array-Typen annotieren ───────────────────────────────
  {
    id: "04-cp-01",
    title: "Array-Typen korrekt annotieren",
    description:
      "Ergaenze die Typ-Annotationen, sodass der Code kompiliert. " +
      "Verwende die kuerzere Syntax (T[]) wo moeglich.",
    template: `// 1. Ein Array von Strings
const names: ___(1)___ = ["Alice", "Bob", "Charlie"];

// 2. Ein Array von Arrays (2D-Array)
const matrix: ___(2)___ = [[1, 2], [3, 4], [5, 6]];

// 3. Ein readonly Array von Zahlen
const PRIMES: ___(3)___ = [2, 3, 5, 7, 11];

// PRIMES.push(13); // Soll ein Compile-Fehler sein!`,
    solution: `const names: string[] = ["Alice", "Bob", "Charlie"];

const matrix: number[][] = [[1, 2], [3, 4], [5, 6]];

const PRIMES: readonly number[] = [2, 3, 5, 7, 11];`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "string[]",
        hint: "Welcher Typ beschreibt ein Array von Strings?",
      },
      {
        placeholder: "___(2)___",
        answer: "number[][]",
        hint: "Ein Array von Arrays von Zahlen — verschachtelte eckige Klammern.",
      },
      {
        placeholder: "___(3)___",
        answer: "readonly number[]",
        hint: "Welches Keyword verhindert Mutation zur Compile-Zeit?",
      },
    ],
    concept: "Array-Typ-Syntax und readonly",
  },

  // ─── 2: Tuple-Typen definieren ─────────────────────────────────────────────
  {
    id: "04-cp-02",
    title: "Tuple-Typen fuer feste Strukturen",
    description:
      "Definiere die Tuple-Typen, die zu den gegebenen Werten passen.",
    template: `// 1. Ein Paar aus Name und Alter
type PersonInfo = ___(1)___;
const alice: PersonInfo = ["Alice", 30];

// 2. Ein RGB-Farbwert (drei Zahlen)
type RGB = ___(2)___;
const red: RGB = [255, 0, 0];

// 3. Ein Tuple mit optionalem dritten Element
type Coordinate = ___(3)___;
const flat: Coordinate = [10, 20];
const spatial: Coordinate = [10, 20, 30];`,
    solution: `type PersonInfo = [string, number];
const alice: PersonInfo = ["Alice", 30];

type RGB = [number, number, number];
const red: RGB = [255, 0, 0];

type Coordinate = [number, number, number?];
const flat: Coordinate = [10, 20];
const spatial: Coordinate = [10, 20, 30];`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "[string, number]",
        hint: "Position 0 ist ein Name (string), Position 1 ein Alter (number).",
      },
      {
        placeholder: "___(2)___",
        answer: "[number, number, number]",
        hint: "Drei Zahlen fuer R, G und B — jede Position hat den Typ number.",
      },
      {
        placeholder: "___(3)___",
        answer: "[number, number, number?]",
        hint: "Die dritte Position ist optional — nutze das '?' Syntax.",
      },
    ],
    concept: "Tuple-Definition und optionale Elemente",
  },

  // ─── 3: Type Predicate fuer filter() ───────────────────────────────────────
  {
    id: "04-cp-03",
    title: "Type-safe filter() mit Type Predicate",
    description:
      "Ergaenze den filter()-Aufruf so, dass TypeScript den Typ korrekt einschraenkt. " +
      "Ohne Type Predicate bleibt der Typ zu breit.",
    template: `interface User {
  name: string;
  email: string | null;
}

const users: User[] = [
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: null },
  { name: "Charlie", email: "charlie@example.com" },
];

// Nur User mit E-Mail — aber typsicher!
type UserWithEmail = ___(1)___;

const usersWithEmail: UserWithEmail[] = users.filter(
  (user): ___(2)___ => ___(3)___
);

// Jetzt soll das ohne Fehler funktionieren:
usersWithEmail.forEach(u => console.log(u.email.toUpperCase()));`,
    solution: `type UserWithEmail = User & { email: string };

const usersWithEmail: UserWithEmail[] = users.filter(
  (user): user is UserWithEmail => user.email !== null
);`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "User & { email: string }",
        hint: "Intersection: Ein User, bei dem email garantiert string ist (nicht null).",
      },
      {
        placeholder: "___(2)___",
        answer: "user is UserWithEmail",
        hint: "Type Predicate Syntax: 'parameter is TypName'",
      },
      {
        placeholder: "___(3)___",
        answer: "user.email !== null",
        hint: "Die Bedingung, die prueft ob email vorhanden ist.",
      },
    ],
    concept: "Type Predicates mit filter() und Intersection Types",
  },

  // ─── 4: as const und satisfies kombinieren ─────────────────────────────────
  {
    id: "04-cp-04",
    title: "'as const' und 'satisfies' kombinieren",
    description:
      "Nutze 'as const' fuer Literal-Typen und 'satisfies' fuer Validierung. " +
      "Das Ziel: enge Typen UND Compile-Zeit-Pruefung.",
    template: `// Definiere einen Typ fuer erlaubte HTTP-Methoden
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Erstelle ein readonly Tuple mit Validierung
const ALLOWED_METHODS = ___(1)___;
// Soll den Typ readonly ["GET", "POST"] haben (nicht readonly HttpMethod[])
// UND kompiliert nur, wenn alle Werte gueltige HttpMethod sind

// Nutze den Typ, um eine Union abzuleiten
type AllowedMethod = ___(2)___;
// Soll "GET" | "POST" sein (nicht string und nicht HttpMethod)

// Erstelle eine Typ-sichere Lookup-Funktion
function isAllowed(method: string): method is AllowedMethod {
  return ___(3)___.includes(method as AllowedMethod);
}`,
    solution: `const ALLOWED_METHODS = ["GET", "POST"] as const satisfies readonly HttpMethod[];

type AllowedMethod = (typeof ALLOWED_METHODS)[number];

function isAllowed(method: string): method is AllowedMethod {
  return (ALLOWED_METHODS as readonly string[]).includes(method);
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: '["GET", "POST"] as const satisfies readonly HttpMethod[]',
        hint: "'as const' fuer Literal-Typen, 'satisfies' fuer die Validierung.",
      },
      {
        placeholder: "___(2)___",
        answer: "(typeof ALLOWED_METHODS)[number]",
        hint: "Indexed Access: typeof fuer den Wert, [number] fuer die Union der Elemente.",
      },
      {
        placeholder: "___(3)___",
        answer: "(ALLOWED_METHODS as readonly string[])",
        hint: "includes() auf readonly Tuples braucht einen kleinen Type-Assert.",
      },
    ],
    concept: "as const + satisfies + typeof + indexed access",
  },

  // ─── 5: Variadic Tuple Types ───────────────────────────────────────────────
  {
    id: "04-cp-05",
    title: "Variadic Tuple Types fuer flexible Funktionen",
    description:
      "Implementiere eine typsichere 'prepend'-Funktion, die ein Element " +
      "vorne an ein Tuple anfuegt. Die Laenge und Typen muessen erhalten bleiben.",
    template: `// Eine Funktion die ein Element vorne anfuegt
function prepend<T, ___(1)___>(
  element: T,
  tuple: [...Rest]
): ___(2)___ {
  return [element, ...tuple];
}

// Tests — diese muessen alle kompilieren:
const r1 = prepend("hello", [1, true]);
// Erwarteter Typ: [string, number, boolean]

const r2 = prepend(0, ["a", "b"]);
// Erwarteter Typ: [number, string, string]

const r3 = prepend(true, []);
// Erwarteter Typ: ___(3)___`,
    solution: `function prepend<T, Rest extends unknown[]>(
  element: T,
  tuple: [...Rest]
): [T, ...Rest] {
  return [element, ...tuple];
}

const r1 = prepend("hello", [1, true]);
const r2 = prepend(0, ["a", "b"]);
const r3 = prepend(true, []);
// Typ von r3: [boolean]`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "Rest extends unknown[]",
        hint: "Ein generischer Typ-Parameter, der ein beliebiges Tuple repraesentiert.",
      },
      {
        placeholder: "___(2)___",
        answer: "[T, ...Rest]",
        hint: "Das neue Element T vorne, gefolgt vom Rest des urspruenglichen Tuples.",
      },
      {
        placeholder: "___(3)___",
        answer: "[boolean]",
        hint: "true mit leerem Rest ergibt ein Tuple mit einem Element.",
      },
    ],
    concept: "Variadic Tuple Types und Generic Constraints",
  },

  // ─── 6: Readonly-Sicherheit bei Funktionsparametern ────────────────────────
  {
    id: "04-cp-06",
    title: "Readonly-korrekte Funktionssignaturen",
    description:
      "Korrigiere die Funktionssignaturen, damit sie sowohl mutable als auch " +
      "readonly Arrays akzeptieren und Mutation korrekt verhindern.",
    template: `// Problem: Diese Funktion akzeptiert keine readonly Arrays!
// function getFirst(arr: string[]): string | undefined {
//   return arr[0];
// }
// const ro: readonly string[] = ["a", "b"];
// getFirst(ro); // Fehler!

// Loesung: Korrigiere die Signatur
function getFirst(arr: ___(1)___): string | undefined {
  return arr[0];
}

// Diese Funktion SOLL das Array veraendern — der Aufrufer muss das wissen
function addItem(arr: ___(2)___, item: string): void {
  arr.push(item);
}

// Diese Funktion gibt eine sortierte Kopie zurueck, ohne das Original zu aendern
function sortedCopy(arr: ___(3)___): string[] {
  return [...arr].sort();
}

// Alle drei sollen mit readonly und mutable Arrays funktionieren:
const mutable: string[] = ["c", "a", "b"];
const immutable: readonly string[] = ["x", "y", "z"];

getFirst(mutable);    // OK
getFirst(immutable);  // OK
addItem(mutable, "d"); // OK
// addItem(immutable, "d"); // Soll Fehler sein!
sortedCopy(mutable);  // OK
sortedCopy(immutable); // OK`,
    solution: `function getFirst(arr: readonly string[]): string | undefined {
  return arr[0];
}

function addItem(arr: string[], item: string): void {
  arr.push(item);
}

function sortedCopy(arr: readonly string[]): string[] {
  return [...arr].sort();
}`,
    blanks: [
      {
        placeholder: "___(1)___",
        answer: "readonly string[]",
        hint: "readonly akzeptiert sowohl mutable als auch readonly Arrays.",
      },
      {
        placeholder: "___(2)___",
        answer: "string[]",
        hint: "Hier MUSS es mutable sein, da push() aufgerufen wird.",
      },
      {
        placeholder: "___(3)___",
        answer: "readonly string[]",
        hint: "Die Funktion mutiert nicht — also readonly fuer maximale Kompatibilitaet.",
      },
    ],
    concept: "readonly bei Funktionsparametern — wann mutable, wann readonly",
  },
];
