/**
 * Lektion 06 — Pre-Test-Fragen: Functions
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
 * Werden VOR dem Lesen gestellt um das Gehirn zu primen.
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══ Sektion 1: Funktionstypen Basics ═══════════════════════════════════
  {
    sectionIndex: 1,
    question:
      "Was passiert wenn du eine TypeScript-Funktion mit zu wenig Argumenten aufrufst?",
    code: "function add(a: number, b: number): number { return a + b; }\nadd(1);",
    options: [
      "b wird automatisch undefined",
      "Compile-Error: Erwartet 2 Argumente",
      "Die Funktion gibt NaN zurueck",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript ist strenger als JavaScript: Die Anzahl der Argumente " +
      "muss exakt stimmen. In JS waere b undefined, in TS ist es ein Fehler.",
  },
  {
    sectionIndex: 1,
    question: "Was bedeutet `void` als Return-Typ einer Funktion?",
    options: [
      "Die Funktion gibt undefined zurueck",
      "Die Funktion gibt nichts zurueck",
      "Der Rueckgabewert ist irrelevant",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "void bedeutet 'der Rueckgabewert ist irrelevant' — nicht dasselbe wie undefined. " +
      "Das wird besonders bei Callbacks wichtig.",
  },
  {
    sectionIndex: 1,
    question: "Muss man bei rekursiven Funktionen den Return-Typ angeben?",
    options: [
      "Nein, TypeScript inferiert ihn automatisch",
      "Ja, es ist Pflicht",
      "Nur bei verschachtelter Rekursion",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Rekursive Funktionen erzeugen einen Zirkelbezug: Der Return-Typ " +
      "haengt vom Rueckgabewert ab, der den Funktionsaufruf selbst enthaelt.",
  },

  // ═══ Sektion 2: Optionale und Default-Parameter ═════════════════════════
  {
    sectionIndex: 2,
    question:
      "Kann man `x?: string` und `x: string = 'default'` gleichzeitig verwenden?",
    options: [
      "Ja, das kombiniert das Beste aus beiden Welten",
      "Nein, TypeScript verbietet die Kombination",
      "Nur bei Rest-Parametern",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ein Default-Wert macht den Parameter automatisch optional — " +
      "das ? ist redundant. TypeScript verbietet die Kombination.",
  },
  {
    sectionIndex: 2,
    question:
      "Kann ein optionaler Parameter VOR einem Pflichtparameter stehen?",
    options: [
      "Ja, die Reihenfolge ist egal",
      "Nein, optionale Parameter muessen am Ende stehen",
      "Nur bei Arrow Functions",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Optionale Parameter muessen NACH Pflichtparametern kommen. " +
      "JavaScript-Argumente sind positionsbasiert — sonst muesste man " +
      "undefined als Platzhalter uebergeben.",
  },
  {
    sectionIndex: 2,
    question: "Wie typisiert man Destructuring in Funktionsparametern?",
    code: "function f({ name, age }) { ... }",
    options: [
      "function f({ name: string, age: number })",
      "function f({ name, age }: { name: string; age: number })",
      "function f(name: string, age: number)",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Der Typ kommt NACH dem gesamten Destructuring-Pattern. " +
      "{ name: string } waere eine UMBENENNUNG, kein Typ.",
  },

  // ═══ Sektion 3: Function Overloads ══════════════════════════════════════
  {
    sectionIndex: 3,
    question:
      "Wie viele Implementationen hat eine ueberladene Funktion in TypeScript?",
    options: [
      "Genau eine — die Implementation Signature",
      "Eine pro Overload-Signatur",
      "Mindestens zwei",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Anders als in Java/C# hat TypeScript nur EINE Implementation. " +
      "Die Overload-Signaturen sind reine Compilezeit-Information.",
  },
  {
    sectionIndex: 3,
    question: "Wann sollte man Overloads statt Union Types verwenden?",
    options: [
      "Wenn der Return-Typ vom Argument-Wert abhaengt",
      "Immer — Overloads sind praeziser",
      "Nur bei mehr als 3 Parametern",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Overloads sind nur sinnvoll wenn der Return-Typ vom Argument-Wert " +
      "abhaengt. Bei gleichem Return-Typ sind Union Types besser.",
  },
  {
    sectionIndex: 3,
    question: "In welcher Reihenfolge prueft TypeScript die Overloads?",
    options: [
      "Von oben nach unten — erster Treffer gewinnt",
      "Zufaellig",
      "Von unten nach oben",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript prueft von oben nach unten. Deshalb muessen spezifische " +
      "Overloads VOR breiteren stehen.",
  },

  // ═══ Sektion 4: Callback-Typen ══════════════════════════════════════════
  {
    sectionIndex: 4,
    question:
      "Darf ein Callback mit Return-Typ void einen Wert zurueckgeben?",
    code: "type Cb = () => void;\nconst fn: Cb = () => 42;",
    options: [
      "Ja, void-Callbacks duerfen Werte zurueckgeben",
      "Nein, void bedeutet 'kein Return'",
      "Nur undefined",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Void-Callbacks sind tolerant — sie duerfen Werte zurueckgeben. " +
      "Das basiert auf dem Substitutability Principle.",
  },
  {
    sectionIndex: 4,
    question:
      "Warum ist void bei Callbacks tolerant aber bei Funktionsdeklarationen streng?",
    options: [
      "Bei Deklarationen kontrollierst DU den Typ, bei Callbacks definiert jemand ANDERES die Schnittstelle",
      "Kein Unterschied — void ist immer tolerant",
      "Es haengt von strict mode ab",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Bei Deklarationen sagst DU void und meinst es. Bei Callbacks sagt " +
      "die Schnittstelle 'der Rueckgabewert ist mir egal' — deshalb tolerant.",
  },
  {
    sectionIndex: 4,
    question: "Was ist ein generischer Callback-Typ?",
    code: "type Mapper<T, U> = (item: T) => U;",
    options: [
      "Ein Callback der nur mit Generics aufgerufen werden kann",
      "Ein Callback der jeden Typ akzeptiert",
      "Ein Callback dessen Input- und Output-Typen flexibel sind",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Generische Callback-Typen wie Mapper<T, U> sind flexibel und " +
      "wiederverwendbar. T und U werden beim Aufruf inferiert.",
  },

  // ═══ Sektion 5: Der this-Parameter ══════════════════════════════════════
  {
    sectionIndex: 5,
    question: "Was passiert mit dem this-Parameter im kompilierten JavaScript?",
    code: "function greet(this: { name: string }) { return this.name; }",
    options: [
      "Er wird zum ersten Parameter",
      "Er wird zu einem Kommentar",
      "Er verschwindet komplett (Type Erasure)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Der this-Parameter verschwindet bei der Kompilierung (Type Erasure). " +
      "Er dient nur der Compilezeit-Pruefung.",
  },
  {
    sectionIndex: 5,
    question: "Warum ist this in JavaScript so verwirrend?",
    options: [
      "this ist immer undefined",
      "this gibt es nur in Klassen",
      "this wird dynamisch beim Aufruf bestimmt, nicht bei der Definition",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "In JavaScript wird this zur AUFRUFZEIT bestimmt. " +
      "Arrow Functions loesen das Problem durch lexikalisches this.",
  },
  {
    sectionIndex: 5,
    question: "Warum loesen Arrow Functions das this-Problem?",
    options: [
      "Sie binden this automatisch mit .bind()",
      "Ich weiss es nicht",
      "Sie laufen immer im strict mode",
      "Sie haben kein eigenes this — es wird vom umgebenden Scope geerbt",
    ],
    correct: 3,
    briefExplanation:
      "Arrow Functions haben KEIN eigenes this. Sie erben this " +
      "lexikalisch vom umgebenden Scope — wie eine Closure.",
  },

  // ═══ Sektion 6: Funktions-Patterns ══════════════════════════════════════
  {
    sectionIndex: 6,
    question: "Was ist ein Type Guard?",
    options: [
      "Ein Dekorator der Typen prueft",
      "Ich weiss es nicht",
      "Ein Compiler-Plugin",
      "Eine Funktion mit Return-Typ 'value is Type' fuer benutzerdefiniertes Narrowing",
    ],
    correct: 3,
    briefExplanation:
      "Ein Type Guard ist eine Funktion mit 'value is Type' als Return-Typ. " +
      "Er erweitert TypeScripts automatisches Narrowing.",
  },
  {
    sectionIndex: 6,
    question:
      "Was ist der Unterschied zwischen einem Type Guard und einer Assertion Function?",
    options: [
      "Kein Unterschied",
      "Ich weiss es nicht",
      "Type Guard ist schneller",
      "Type Guard: boolean + if-Verzweigung. Assertion Function: wirft bei Misserfolg",
    ],
    correct: 3,
    briefExplanation:
      "Type Guard = boolean (if/else). Assertion Function = wirft bei Misserfolg, " +
      "danach ist der Typ garantiert. Verschiedene Kontrollfluss-Strategien.",
  },
  {
    sectionIndex: 6,
    question: "Was macht Currying?",
    code: "function add(a: number): (b: number) => number { return (b) => a + b; }",
    options: [
      "Es addiert zwei Zahlen",
      "Ich weiss es nicht",
      "Es ist ein Array-Pattern",
      "Es verwandelt eine Funktion in eine Kette von Funktionen mit je einem Parameter",
    ],
    correct: 3,
    briefExplanation:
      "Currying trennt Konfiguration und Ausfuehrung: add(5) gibt eine " +
      "Funktion zurueck die 5 + b berechnet. TypeScript inferiert alle Zwischentypen.",
  },
];
