/**
 * Lektion 10 — Quiz-Daten: Review Challenge — Phase 1
 *
 * 20 GEMISCHTE Fragen aus ALLEN Lektionen (L01-L09).
 * Absichtlich NICHT nach Thema sortiert — wie in der echten Praxis
 * musst du selbst erkennen, welches Konzept gerade gefragt ist.
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from "../tools/quiz-runner.ts";

export const lessonId = "10";
export const lessonTitle = "Review Challenge — Phase 1";

export const questions: QuizQuestion[] = [
  // ─── Frage 1: Structural Typing (L05) ──────────────────────────────────────
  {
    question: "Was gibt dieser Code aus?",
    code: `interface HasLength { length: number; }
function logLength(item: HasLength): void {
  console.log(item.length);
}
logLength("Hello");
logLength([1, 2, 3]);
logLength({ length: 42, extra: true });`,
    options: [
      "5, 3, 42 — Structural Typing: alles mit 'length: number' passt",
      "Fehler: string ist kein HasLength",
      "Fehler: { length: 42, extra: true } hat eine Excess Property",
      "5, 3, Fehler bei der dritten Zeile",
    ],
    correct: 0,
    explanation:
      "Structural Typing in Aktion! 'string' hat length: number, Arrays haben length: number, " +
      "und das Objekt wird ueber eine Variable uebergeben (kein Literal), also kein Excess Property Check. " +
      "TypeScript prueft nur: 'Hat das Argument length: number?' — Ja, bei allen drei.",
    elaboratedFeedback:
      "Das ist ein Kernprinzip von TypeScript (L05): Die FORM entscheidet, nicht der NAME. " +
      "string, Array und das Objekt haben alle eine 'length'-Property vom Typ number. " +
      "Der Excess Property Check (extra: true) greift NICHT, weil das Objekt ueber eine " +
      "Variable einer Funktion uebergeben wird — nicht als frisches Literal zugewiesen.",
  },

  // ─── Frage 2: as const (L09) ───────────────────────────────────────────────
  {
    question: "Was ist der Typ von 'method'?",
    code: `const config = {
  url: "/api/users",
  method: "GET",
} as const;
type Method = typeof config.method;`,
    options: [
      "string",
      '"GET" | "POST" | "PUT" | "DELETE"',
      "Readonly<string>",
      '"GET"',
    ],
    correct: 3,
    explanation:
      "Mit 'as const' wird jeder Wert zum Literal Type. config.method ist nicht mehr 'string', " +
      "sondern genau der Literal Type '\"GET\"'. Das ist der ganze Sinn von as const: maximale Praezision.",
    elaboratedFeedback:
      "Ohne 'as const' waere config.method: string (Type Widening, L03). " +
      "Mit 'as const' wird das gesamte Objekt 'deep readonly' und alle Werte werden " +
      "zu ihren Literal Types eingefroren. Das ist extrem nuetzlich fuer Konfigurationen, " +
      "Routing-Tabellen und ueberall wo du praezise Typen aus Laufzeitwerten ableiten willst (L09).",
  },

  // ─── Frage 3: Function Overloads (L06) ─────────────────────────────────────
  {
    question: "Was ist der Return-Typ von result?",
    code: `function parse(input: string): number;
function parse(input: string[]): number[];
function parse(input: string | string[]): number | number[] {
  if (Array.isArray(input)) return input.map(Number);
  return Number(input);
}

const result = parse("42");`,
    options: [
      "number | number[]",
      "number",
      "string",
      "unknown",
    ],
    correct: 1,
    explanation:
      "Bei Overloads entscheidet die AUFRUFSIGNATUR, nicht die Implementation. " +
      "parse(\"42\") matcht den ersten Overload (string → number), also ist result: number.",
    elaboratedFeedback:
      "Function Overloads (L06) geben dir praezisere Return Types als eine Union. " +
      "Ohne Overloads waere der Typ number | number[] — du muessstest selbst narrowen. " +
      "Mit Overloads weiss TypeScript durch den Input-Typ bereits den exakten Output-Typ. " +
      "Die Implementation-Signatur (die dritte) ist fuer Aufrufer UNSICHTBAR.",
  },

  // ─── Frage 4: never (L02, L09) ─────────────────────────────────────────────
  {
    question: "Was passiert, wenn du einen neuen Typ zu Shape hinzufuegst aber den case vergisst?",
    code: `type Circle = { kind: "circle"; radius: number };
type Rect = { kind: "rect"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };

type Shape = Circle | Rect | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    default: {
      const _: never = shape;
      return _;
    }
  }
}`,
    options: [
      "Laufzeit-Fehler: Triangle hat keine area-Berechnung",
      "Kein Fehler — der default-Case faengt alles",
      "Compile-Fehler: Type 'Triangle' is not assignable to type 'never'",
      "TypeScript ignoriert Triangle weil es nicht verwendet wird",
    ],
    correct: 2,
    explanation:
      "Das ist der exhaustive Check! Im default-Case hat shape den Typ Triangle " +
      "(weil circle und rect schon abgehandelt sind). Triangle ist NICHT never, " +
      "also meldet der Compiler einen Fehler. Genau das wollen wir!",
    elaboratedFeedback:
      "Der never-Trick (L09) ist eines der maechtigsten Patterns in TypeScript. " +
      "Wenn du alle Faelle einer Discriminated Union (L07) abdeckst, bleibt im default " +
      "der Typ 'never' uebrig — nichts kann ihn erreichen. Aber wenn du einen Fall " +
      "vergisst, hat der Wert im default noch einen konkreten Typ, der nicht zu 'never' " +
      "passt. So zwingt dich der Compiler, jeden Fall zu behandeln.",
  },

  // ─── Frage 5: Type Inference (L03) ─────────────────────────────────────────
  {
    question: "Wo solltest du eine explizite Type Annotation schreiben?",
    code: `// A:
const name = "Max";

// B:
function getUser() {
  return { id: 1, name: "Max" };
}

// C:
function processData(data) {
  return data.length;
}

// D:
const numbers = [1, 2, 3];`,
    options: [
      "Bei C — Parameter ohne Annotation sind implizit 'any'",
      "Bei A und D — Variablen sollten immer annotiert werden",
      "Bei allen — explizit ist immer besser",
      "Bei keinem — TypeScript kann alles inferieren",
    ],
    correct: 0,
    explanation:
      "Funktionsparameter koennen (im strict mode) nicht inferiert werden — " +
      "'data' wird zu 'any'. Bei A und D inferiert TypeScript korrekt (string bzw. number[]). " +
      "Bei B wird der Return Type inferiert.",
    elaboratedFeedback:
      "Die goldene Regel (L03): Annotiere Parameter und oeffentliche APIs. " +
      "Lass TypeScript den Rest inferieren. C ist der einzige Fall wo eine Annotation " +
      "NOETIG ist, weil Parameter in isolierten Funktionen nicht inferiert werden koennen. " +
      "Bei A, B und D macht Inference gute Arbeit.",
  },

  // ─── Frage 6: Union + Narrowing (L07) ──────────────────────────────────────
  {
    question: "Welche Zeile erzeugt einen Compile-Fehler?",
    code: `function process(x: string | number | boolean) {
  // Zeile A:
  console.log(x.toString());

  // Zeile B:
  if (typeof x === "string") {
    console.log(x.toUpperCase());
  }

  // Zeile C:
  console.log(x.toUpperCase());

  // Zeile D:
  if (typeof x === "number") {
    console.log(x.toFixed(2));
  }
}`,
    options: [
      "Zeile A — toString() existiert nicht auf allen Typen",
      "Zeile B — toUpperCase() existiert nicht auf number",
      "Zeile C — x ist hier noch string | number | boolean, toUpperCase() geht nicht",
      "Zeile D — toFixed() existiert nicht auf boolean",
    ],
    correct: 2,
    explanation:
      "Zeile C! Nach dem if-Block von Zeile B ist x wieder der volle Union Type " +
      "(string | number | boolean). toUpperCase() existiert nur auf string. " +
      "Zeile A ist OK weil toString() auf allen drei Typen existiert.",
    elaboratedFeedback:
      "Narrowing (L07) wirkt NUR innerhalb des if-Blocks. Danach 'vergisst' TypeScript " +
      "die Einschraenkung und x hat wieder seinen vollen Typ. Zeile A funktioniert, " +
      "weil toString() auf string, number UND boolean existiert — TypeScript findet die " +
      "Methode auf allen Mitgliedern der Union. toUpperCase() gibt es aber nur auf string.",
  },

  // ─── Frage 7: Readonly (L05) ───────────────────────────────────────────────
  {
    question: "Welche Zuweisung kompiliert NICHT?",
    code: `interface Config {
  readonly host: string;
  readonly port: number;
  readonly db: {
    name: string;
    pool: number;
  };
}

const cfg: Config = { host: "localhost", port: 5432, db: { name: "app", pool: 10 } };

// A:
cfg.db.name = "test";

// B:
cfg.host = "remote";

// C:
cfg.db.pool = 20;

// D:
cfg.db = { name: "other", pool: 5 };`,
    options: [
      "Nur B — host ist readonly",
      "A, B, C und D — alles ist readonly",
      "Keines — readonly wird zur Laufzeit nicht erzwungen",
      "B und D — host und db-Referenz sind readonly, aber db.name und db.pool nicht",
    ],
    correct: 3,
    explanation:
      "readonly ist SHALLOW! cfg.host und cfg.db sind readonly (Zeile B und D fehlschlagen). " +
      "Aber cfg.db.name und cfg.db.pool sind NICHT readonly — die Properties innerhalb von db " +
      "haben kein readonly. Zeilen A und C kompilieren!",
    elaboratedFeedback:
      "Ein klassisches Missverstaendnis (L05): readonly schuetzt nur die direkte Property, " +
      "nicht verschachtelte Objekte. cfg.db = ... aendert die Referenz (readonly!). " +
      "Aber cfg.db.name aendert eine Property INNERHALB des referenzierten Objekts — " +
      "das ist erlaubt, weil 'name' in db kein readonly hat. Fuer deep readonly " +
      "brauchst du Readonly<Config> rekursiv oder eine DeepReadonly Utility.",
  },

  // ─── Frage 8: Intersection (L07) ───────────────────────────────────────────
  {
    question: "Was ist der Typ von 'result'?",
    code: `interface HasName { name: string; }
interface HasAge { age: number; }
interface HasEmail { email: string; }

type Person = HasName & HasAge;
type ContactablePerson = Person & HasEmail;

const result: ContactablePerson = {
  name: "Max",
  age: 30,
  email: "max@test.de"
};`,
    options: [
      "{ name: string } — nur das erste Interface zaehlt",
      "{ name: string; age: number; email: string } — alle Properties zusammen",
      "HasName | HasAge | HasEmail — eine Union der Interfaces",
      "Fehler: Man kann nicht mehr als 2 Typen intersecten",
    ],
    correct: 1,
    explanation:
      "Intersection (&) kombiniert alle Properties. Person hat name + age, " +
      "ContactablePerson hat name + age + email. Das Objekt muss ALLE haben.",
    elaboratedFeedback:
      "Intersection Types (L07) sind das Gegenteil von Unions. Union (|) bedeutet " +
      "'eines von', Intersection (&) bedeutet 'alles zusammen'. Du kannst beliebig " +
      "viele Typen intersecten. Das ist super fuer Composition: Statt einer grossen " +
      "Interface-Hierarchie baust du kleine Bausteine (HasId, HasTimestamps, HasName) " +
      "und kombinierst sie mit &.",
  },

  // ─── Frage 9: Tuple Types (L04) ────────────────────────────────────────────
  {
    question: "Was ist der Unterschied zwischen diesen beiden Typen?",
    code: `type A = number[];
type B = [number, number, number];

const a: A = [1, 2, 3, 4, 5];
const b: B = [1, 2, 3];`,
    options: [
      "Kein Unterschied — beides sind number-Arrays",
      "A ist ein Array beliebiger Laenge, B ist ein Tuple mit genau 3 Elementen",
      "A erlaubt nur numbers, B erlaubt auch strings",
      "B ist ein readonly Array, A nicht",
    ],
    correct: 1,
    explanation:
      "A (number[]) ist ein Array mit beliebig vielen numbers. B ([number, number, number]) " +
      "ist ein Tuple — genau 3 Elemente, alle number. const b: B = [1, 2] waere ein Fehler!",
    elaboratedFeedback:
      "Tuples (L04) sind ein maechtiges Konzept das oft uebersehen wird. Sie sind " +
      "nicht einfach 'Arrays mit fester Laenge' — sie koennen verschiedene Typen an " +
      "verschiedenen Positionen haben: [string, number, boolean]. Das macht sie perfekt " +
      "fuer Rueckgabewerte wie [data, error] oder [value, setValue].",
  },

  // ─── Frage 10: Declaration Merging (L08) ───────────────────────────────────
  {
    question: "Was passiert hier?",
    code: `interface Config {
  host: string;
}

interface Config {
  port: number;
}

const cfg: Config = { host: "localhost", port: 3000 };`,
    options: [
      "Fehler: Config ist doppelt deklariert",
      "Nur die zweite Definition zaehlt (port: number)",
      "Declaration Merging: Config hat host UND port",
      "Fehler: interface kann nicht mit type gemischt werden",
    ],
    correct: 2,
    explanation:
      "Declaration Merging! Interfaces mit dem gleichen Namen werden automatisch zusammengefuehrt. " +
      "Config hat am Ende sowohl host als auch port. Das ist einzigartig fuer interfaces — " +
      "mit 'type' wuerdest du einen 'Duplicate identifier' Fehler bekommen.",
    elaboratedFeedback:
      "Declaration Merging (L08) ist der wichtigste Unterschied zwischen interface und type. " +
      "Libraries nutzen es, damit du ihre Typen erweitern kannst, ohne den Quellcode " +
      "zu aendern. Express, React und viele andere nutzen dieses Pattern. " +
      "Regel: Verwende interface wenn du Declaration Merging brauchst oder willst.",
  },

  // ─── Frage 11: void vs never (L06) ─────────────────────────────────────────
  {
    question: "Welche Funktion hat den Return Type 'never'?",
    code: `// A:
function logMessage(msg: string): void {
  console.log(msg);
}

// B:
function throwError(msg: string): never {
  throw new Error(msg);
}

// C:
function emptyReturn(): void {
  return;
}

// D:
function infiniteLoop(): never {
  while (true) { /* ... */ }
}`,
    options: [
      "Nur B — throw erzeugt never",
      "A, B, C und D — alle geben nichts zurueck",
      "Keine — never wird nur manuell zugewiesen",
      "B und D — Funktionen die NIEMALS normal zurueckkehren",
    ],
    correct: 3,
    explanation:
      "void = Funktion kehrt zurueck, gibt aber keinen sinnvollen Wert zurueck. " +
      "never = Funktion kehrt NIEMALS zurueck (throw oder Endlosschleife). " +
      "B (throw) und D (while true) kehren beide nie normal zurueck.",
    elaboratedFeedback:
      "Der Unterschied zwischen void und never (L06) ist subtil aber wichtig. " +
      "void sagt 'ignoriere den Rueckgabewert'. never sagt 'diese Stelle im Code " +
      "kann nicht erreicht werden'. never ist der Bottom Type — er ist ein Subtyp " +
      "von ALLEM, aber nichts (ausser never selbst) ist ein Subtyp von never. " +
      "Das macht ihn perfekt fuer exhaustive Checks.",
  },

  // ─── Frage 12: Discriminated Union (L07) ───────────────────────────────────
  {
    question: "Was braucht eine Discriminated Union?",
    options: [
      "Einen gemeinsamen Property-Namen mit Literal Types + einen switch/if",
      "Mindestens 3 Mitglieder in der Union",
      "Das Keyword 'discriminated' vor der Union",
      "Generics und Type Guards",
    ],
    correct: 0,
    explanation:
      "Eine Discriminated Union braucht: 1) Gemeinsame Property (z.B. 'kind', 'type', 'status'), " +
      "2) Literal Types als Werte (z.B. 'circle' | 'rect'), 3) Narrowing per switch/if. " +
      "Kein spezielles Keyword noetig — es ist ein Pattern, kein Sprachfeature.",
    elaboratedFeedback:
      "Discriminated Unions (L07) sind DAS Pattern fuer Zustandsmodellierung in TypeScript. " +
      "Die drei Zutaten: Ein gemeinsamer Discriminator (gleicher Property-Name in allen " +
      "Union-Mitgliedern), Literal Types als Werte dieses Discriminators, und Narrowing " +
      "im Code (switch oder if). TypeScript erkennt das Pattern automatisch und narrowt " +
      "den Typ in jedem Branch.",
  },

  // ─── Frage 13: Excess Property Check (L05) ─────────────────────────────────
  {
    question: "Welcher Aufruf erzeugt einen Compile-Fehler?",
    code: `interface Point { x: number; y: number; }

// A:
const a: Point = { x: 1, y: 2, z: 3 };

// B:
const temp = { x: 1, y: 2, z: 3 };
const b: Point = temp;

// C:
function fn(p: Point) { return p; }
fn({ x: 1, y: 2, z: 3 });

// D:
const data = { x: 1, y: 2, z: 3 };
fn(data);`,
    options: [
      "A und C — Excess Property Check greift bei frischen Object Literals",
      "Nur A und B — Variablen-Zuweisungen prueft TypeScript strenger",
      "Alle vier — z existiert nicht in Point",
      "Keiner — Structural Typing erlaubt extra Properties",
    ],
    correct: 0,
    explanation:
      "A (direktes Literal bei Zuweisung) und C (direktes Literal bei Funktionsaufruf) " +
      "erzeugen Fehler wegen Excess Property Checking. B und D verwenden Variablen — " +
      "da gilt nur Structural Typing, und extra Properties sind OK.",
    elaboratedFeedback:
      "Der Excess Property Check (L05) ist eine Ausnahme von Structural Typing. " +
      "Er greift NUR bei 'frischen' Object Literals — also wenn du ein Objekt direkt " +
      "an einer Stelle schreibst wo ein Typ erwartet wird. Sobald das Objekt in einer " +
      "Variablen steckt, ist es nicht mehr 'frisch' und der Check entfaellt. " +
      "Das ist gewollt: Frische Literals sind wahrscheinlich Tippfehler, Variablen nicht.",
  },

  // ─── Frage 14: Readonly Arrays (L04) ───────────────────────────────────────
  {
    question: "Was passiert bei diesem Code?",
    code: `function sum(numbers: readonly number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

const mutable = [1, 2, 3];
const immutable: readonly number[] = [4, 5, 6];

sum(mutable);
sum(immutable);`,
    options: [
      "Fehler: mutable (number[]) passt nicht zu readonly number[]",
      "Fehler: readonly Arrays koennen nicht an Funktionen uebergeben werden",
      "Beide Aufrufe kompilieren — number[] ist kompatibel mit readonly number[]",
      "Fehler bei beiden — reduce() funktioniert nicht auf readonly Arrays",
    ],
    correct: 2,
    explanation:
      "number[] ist ein SUBTYP von readonly number[]. Ein mutable Array hat alle Methoden " +
      "eines readonly Arrays (und mehr). Die Zuweisung ist sicher. Umgekehrt waere es " +
      "ein Fehler: readonly number[] an number[] zuzuweisen.",
    elaboratedFeedback:
      "Die Kompatibilitaet (L04): mutable → readonly ist OK (du gibst Rechte auf). " +
      "readonly → mutable ist NICHT OK (du wuerdest Rechte dazubekommen die du nicht " +
      "haben solltest). Das ist wie bei einem Bibliotheksbuch: Du kannst ein eigenes " +
      "Buch wie ein Bibliotheksbuch behandeln (nur lesen), aber nicht umgekehrt.",
  },

  // ─── Frage 15: any vs unknown (L02) ────────────────────────────────────────
  {
    question: "Welche Zeile erzeugt einen Compile-Fehler?",
    code: `// A:
const a: any = "hello";
console.log(a.toUpperCase());

// B:
const b: unknown = "hello";
console.log(b.toUpperCase());

// C:
const c: unknown = "hello";
if (typeof c === "string") {
  console.log(c.toUpperCase());
}

// D:
const d: any = 42;
d.nonExistentMethod();`,
    options: [
      "A und D — any deaktiviert ALLE Checks",
      "Nur B — unknown erfordert Narrowing vor Nutzung",
      "B und C — unknown erlaubt gar keine Operationen",
      "Keiner — alle kompilieren",
    ],
    correct: 1,
    explanation:
      "Nur B! unknown erfordert einen Type Check (Narrowing) bevor du Properties " +
      "oder Methoden nutzen kannst. C ist OK weil typeof genutzt wird. " +
      "A und D kompilieren weil any ALLE Checks deaktiviert — auch fuer nonsense wie " +
      "d.nonExistentMethod().",
    elaboratedFeedback:
      "any vs unknown (L02): any sagt 'ich weiss alles' (deaktiviert den Compiler). " +
      "unknown sagt 'ich weiss nichts' (aktiviert den Compiler maximal). " +
      "unknown ist typsicher: Du MUSST erst pruefen was du hast. any ist gefaehrlich: " +
      "Du kannst alles tun, auch Unsinn. Regel: Verwende IMMER unknown statt any " +
      "fuer Werte deren Typ du nicht kennst.",
  },

  // ─── Frage 16: Type Alias vs Interface (L08) ───────────────────────────────
  {
    question: "Welches Statement ist korrekt?",
    options: [
      "type kann alles was interface kann, plus mehr — verwende immer type",
      "interface kann alles was type kann, plus mehr — verwende immer interface",
      "type ist besser fuer Unions/Intersections/Mapped, interface fuer Objekte mit extends/merging",
      "Es gibt keinen funktionalen Unterschied — es ist reine Geschmackssache",
    ],
    correct: 2,
    explanation:
      "Beide haben Staerken: type kann Unions, Intersections, Tuples, Mapped Types. " +
      "interface kann Declaration Merging, extends (mit besseren Fehlermeldungen), und " +
      "ist idiomatisch fuer Objekt-Shapes. Die richtige Wahl haengt vom Anwendungsfall ab.",
    elaboratedFeedback:
      "Die Faustregel (L08): Interface fuer Objekt-Shapes die erweitert werden koennten " +
      "(API-Typen, Library-Typen, Klassen-Implementierungen). Type fuer alles andere: " +
      "Unions, Tuples, berechnete Typen, Funktions-Typen. In der Praxis: Die meisten " +
      "Teams waehlen eine Konvention (alles interface ODER alles type fuer Objekte) " +
      "und halten sich daran.",
  },

  // ─── Frage 17: Index Signatures (L05) ──────────────────────────────────────
  {
    question: "Warum kompiliert dieser Code nicht?",
    code: `interface Dictionary {
  name: string;
  [key: string]: number;
}`,
    options: [
      "name (string) ist nicht kompatibel mit der Index Signature (number)",
      "Index Signatures und feste Properties koennen nicht gemischt werden",
      "Der Typ von [key: string] muss 'any' sein",
      "Es fehlt ein Semikolon",
    ],
    correct: 0,
    explanation:
      "Wenn eine Index Signature [key: string]: number existiert, muessen ALLE Properties " +
      "(auch feste wie 'name') mit dem Index-Typ kompatibel sein. name: string ist nicht " +
      "kompatibel mit number. Loesung: [key: string]: string | number.",
    elaboratedFeedback:
      "Index Signatures (L05) sind maechtiger als sie aussehen — und haben Tuecken. " +
      "Die Regel: Der Index Signature Typ muss ein Supertyp aller festen Properties sein. " +
      "Wenn du [key: string]: number sagst, versprichst du 'JEDER string-Key liefert number'. " +
      "Aber name liefert string — Widerspruch! Loesung: [key: string]: string | number.",
  },

  // ─── Frage 18: strict mode (L01) ───────────────────────────────────────────
  {
    question: "Was aktiviert 'strict: true' in tsconfig.json NICHT?",
    options: [
      "strictNullChecks — null/undefined sind eigene Typen",
      "noImplicitAny — Parameter ohne Typ werden zu 'any'-Fehlern",
      "strictFunctionTypes — Strengere Funktionstyp-Kompatibilitaet",
      "noUnusedLocals — Warnung bei unbenutzten Variablen",
    ],
    correct: 3,
    explanation:
      "noUnusedLocals ist KEIN Teil von strict mode. strict aktiviert: " +
      "strictNullChecks, noImplicitAny, strictFunctionTypes, strictBindCallApply, " +
      "strictPropertyInitialization, noImplicitThis, alwaysStrict, useUnknownInCatchVariables. " +
      "noUnusedLocals muss separat aktiviert werden.",
    elaboratedFeedback:
      "strict: true (L01) ist eine Sammel-Flag die mehrere strenge Optionen aktiviert. " +
      "Es ist die wichtigste Einstellung in tsconfig.json. noUnusedLocals und " +
      "noUnusedParameters sind nuetzlich, gehoeren aber nicht zu strict — sie sind " +
      "separate Code-Quality-Optionen. Immer strict: true verwenden!",
  },

  // ─── Frage 19: Optional Chaining + Nullish (L02, L05) ─────────────────────
  {
    question: "Was ist der Typ von 'result'?",
    code: `interface User {
  name: string;
  address?: {
    city: string;
    zip?: string;
  };
}

const user: User = { name: "Max" };
const result = user.address?.city;`,
    options: [
      "string",
      "string | undefined",
      "string | null",
      "string | null | undefined",
    ],
    correct: 1,
    explanation:
      "user.address ist optional (kann undefined sein). Optional Chaining (?.) gibt " +
      "undefined zurueck wenn address nicht existiert. Also ist result: string | undefined.",
    elaboratedFeedback:
      "Optional Chaining (?.) und optionale Properties (?) arbeiten zusammen (L05). " +
      "Wenn address undefined ist, gibt ?. sofort undefined zurueck ohne auf .city zuzugreifen. " +
      "Wenn address existiert, wird .city normal ausgelesen (string). " +
      "Zusammen: string | undefined. Nicht null — Optional Chaining gibt immer " +
      "undefined zurueck, nie null.",
  },

  // ─── Frage 20: Zusammenspiel aller Konzepte ────────────────────────────────
  {
    question: "Welches Pattern ist die BESTE Loesung fuer dieses Problem?",
    code: `// Du musst verschiedene API-Antworten modellieren:
// - Erfolg mit Daten
// - Lade-Zustand
// - Fehler mit Code und Nachricht
// - Kein Ergebnis (404)

// Anforderung: Ungueltige Zustaende muessen zur Compile-Zeit ausgeschlossen sein.`,
    options: [
      "Ein Interface mit optionalen Feldern: data?, error?, loading?, notFound?",
      "Vier separate Interfaces ohne gemeinsames Feld",
      "Discriminated Union mit status-Feld: 'success' | 'loading' | 'error' | 'not_found'",
      "Ein boolean-Flags-Objekt: { isLoading: boolean; isError: boolean; isNotFound: boolean }",
    ],
    correct: 2,
    explanation:
      "Discriminated Union! Ein gemeinsames status-Feld mit Literal Types stellt sicher, " +
      "dass nur gueltige Kombinationen moeglich sind. Optionale Felder oder Flags erlauben " +
      "ungueltige Zustaende (z.B. loading UND error gleichzeitig).",
    elaboratedFeedback:
      "Diese Frage testet dein integriertes Verstaendnis aus L07 + L09 + L05. " +
      "Die Discriminated Union ist IMMER die beste Wahl wenn du verschiedene Zustaende " +
      "modellieren musst. Warum? 1) Jeder Zustand hat NUR die Felder die er braucht. " +
      "2) TypeScript narrowt automatisch im switch. 3) Exhaustive Checks fangen " +
      "vergessene Zustaende ab. 4) Ungueltige Kombinationen sind unmoeglich. " +
      "Das ist DAS Muster das du aus Phase 1 mitnehmen solltest.",
  },
];
