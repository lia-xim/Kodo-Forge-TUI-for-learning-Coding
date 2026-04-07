/**
 * Lektion 22 — Pre-Test-Fragen: Advanced Generics
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen gestellt werden.
 * Ziel: Das Gehirn fuer die kommende Erklaerung "primen".
 */

export interface PretestQuestion {
  /** Auf welche Sektion sich die Frage bezieht (1-basiert) */
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  /** Kurze Erklaerung (wird erst NACH der Sektion relevant) */
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Sektion 1: Generics Recap & Grenzen ────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Welche dieser Aufgaben kann man mit einem einfachen Generic `<T>` NICHT loesen?",
    options: [
      "Einen Array-Wrapper schreiben: `wrap<T>(x: T): T[]`",
      "Einen Container-Typ schreiben der mit Array<T>, Map<K,V> und Set<T> funktioniert",
      "Einen Identity-Typ schreiben: `type Id<T> = T`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ein generischer Container ueber verschiedene Container-Typen (Array, Map, Set) " +
      "erfordert Higher-Order Types — einfache Generics reichen nicht.",
  },
  {
    sectionIndex: 1,
    question:
      "Was passiert wenn du `type Apply<F, A> = F<A>` in TypeScript schreibst?",
    code: "type Apply<F, A> = F<A>;",
    options: [
      "Es funktioniert — F wird mit A aufgerufen",
      "Compile-Error — F ist kein generischer Typ",
      "Es funktioniert nur mit Interfaces",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript unterstuetzt keine Higher-Kinded Types. Ein Typparameter " +
      "kann nicht selbst Typparameter annehmen.",
  },
  {
    sectionIndex: 1,
    question:
      "Warum hat Anders Hejlsberg TypeScript's Generics so designt wie sie sind?",
    options: [
      "Wegen JavaScript-Kompatibilitaet und Zero-Runtime-Cost",
      "Weil Haskell-Style Generics zu schwer zu lernen sind",
      "Wegen Performance-Problemen mit komplexen Generics",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript sollte ein Superset von JavaScript sein — ohne Laufzeit-Overhead. " +
      "Generics mit Type Erasure passen perfekt zu diesem Ziel.",
  },

  // ─── Sektion 2: Higher-Order Types ──────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Was ist ein 'Typ-Konstruktor' (Type Constructor)?",
    options: [
      "Eine Klasse mit einem Konstruktor",
      "Ein Typ der selbst einen Typparameter hat (wie Array<T> oder Promise<T>)",
      "Eine Funktion die zur Laufzeit Typen erstellt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ein Type Constructor ist ein generischer Typ wie `Array<T>`. " +
      "Er wird erst zu einem konkreten Typ wenn man T angibt: `Array<string>`.",
  },
  {
    sectionIndex: 2,
    question:
      "Wie unterscheidet sich `Promise<T>` von `string` als Typ?",
    options: [
      "Gar nicht — beides sind Typen",
      "`Promise<T>` ist ein Type Constructor (braucht Argument), `string` ist ein konkreter Typ",
      "`Promise<T>` existiert nur zur Laufzeit",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`string` ist sofort verwendbar. `Promise` allein ist kein vollstaendiger Typ — " +
      "es braucht ein Argument wie `Promise<string>`. Das macht es zu einem Type Constructor.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist das 'URI-to-Kind'-Pattern?",
    options: [
      "Eine Methode um URLs zu parsen",
      "Ein Pattern um Higher-Kinded Types mit Interface-Maps zu emulieren",
      "Eine Namenskonvention fuer TypeScript-Dateien",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Das URI-to-Kind-Pattern nutzt ein Interface als Lookup-Map: " +
      "String-Schluessel werden auf konkrete generische Typen abgebildet.",
  },

  // ─── Sektion 3: Varianz verstehen ──────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "Wenn `Cat extends Animal`, ist `Array<Cat>` dann ein Subtyp von `Array<Animal>`?",
    options: [
      "Ja — weil Cat ein Subtyp von Animal ist",
      "Nur bei readonly Arrays",
      "Nein — weil Arrays auch beschrieben werden koennen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Arrays sind invariant: Man kann Elemente lesen UND schreiben. " +
      "Nur ReadonlyArray<Cat> waere ein Subtyp von ReadonlyArray<Animal> (kovariant).",
  },
  {
    sectionIndex: 3,
    question:
      "Was bedeutet 'Kontravarianz' bei Funktionsparametern?",
    code: "type Handler<T> = (item: T) => void;",
    options: [
      "Handler<Cat> ist Subtyp von Handler<Animal>",
      "Handler<Cat> und Handler<Animal> sind identisch",
      "Handler<Animal> ist Subtyp von Handler<Cat>",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Kontravarianz kehrt die Subtyprichtung um: `Handler<Animal>` ist ein " +
      "Subtyp von `Handler<Cat>`, weil wer Animal verarbeiten kann, auch Cat verarbeiten kann.",
  },
  {
    sectionIndex: 3,
    question:
      "Java's Array-Kovarianz (`String[]` ist Subtyp von `Object[]`) war ein Designfehler. Warum?",
    options: [
      "Weil man `Object[] arr = new String[1]; arr[0] = 42;` schreiben konnte — Runtime-Crash",
      "Weil Arrays in Java immutable sind",
      "Weil es keine Performance-Vorteile brachte",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Kovariante mutable Arrays erlauben es, unsichere Schreiboperationen " +
      "am Compiler vorbeizuschmuggeln. Das fuehrt zu ArrayStoreExceptions zur Laufzeit.",
  },

  // ─── Sektion 4: in/out Modifier ────────────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Was bedeutet `interface Producer<out T>`?",
    options: [
      "T wird nur in Output-Position verwendet (kovariant)",
      "T wird nur in Input-Position verwendet (kontravariant)",
      "T ist optional",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`out T` deklariert Kovarianz: T steht nur in Output-Position (Rueckgabewerte). " +
      "TypeScript prueft, dass T nicht in Input-Position verwendet wird.",
  },
  {
    sectionIndex: 4,
    question:
      "In welcher TypeScript-Version wurden die `in`/`out`-Modifier eingefuehrt?",
    options: [
      "TypeScript 4.0",
      "Ich weiss es nicht",
      "TypeScript 5.0",
      "TypeScript 4.7",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript 4.7 (Mai 2022) fuehrte die `in`/`out`-Modifier ein, " +
      "inspiriert von C#'s Varianz-Annotationen.",
  },
  {
    sectionIndex: 4,
    question:
      "Kann ein Typparameter gleichzeitig `in` UND `out` sein?",
    options: [
      "Ja — `<in out T>` ist gueltige Syntax fuer invariante Typen",
      "Nein — das waere ein Widerspruch",
      "Nur bei Klassen, nicht bei Interfaces",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`<in out T>` ist gueltig und deklariert Invarianz: T wird sowohl " +
      "in Input- als auch Output-Position verwendet.",
  },

  // ─── Sektion 5: Fortgeschrittene Constraints ──────────────────────────

  {
    sectionIndex: 5,
    question:
      "Was bedeutet `T extends A & B` in TypeScript?",
    options: [
      "T muss Subtyp von A ODER B sein",
      "Ich weiss es nicht",
      "T ist ein Union von A und B",
      "T muss Subtyp von A UND B sein (alle Properties beider Typen haben)",
    ],
    correct: 3,
    briefExplanation:
      "Intersection-Constraints verlangen, dass T alle Eigenschaften von " +
      "A UND B hat — wie ein UND-Vertrag.",
  },
  {
    sectionIndex: 5,
    question:
      "Was passiert bei `SomeType<string | number>` wenn SomeType ein Conditional Type ist?",
    code: "type SomeType<T> = T extends string ? 'str' : 'other';",
    options: [
      "Das Ergebnis ist `'str' | 'other'` (Distribution ueber den Union)",
      "Das Ergebnis ist `'other'` (Union ist kein String)",
      "Compile-Error",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Distributive Conditional Types verteilen sich ueber Unions: " +
      "`SomeType<string | number>` = `SomeType<string> | SomeType<number>` = `'str' | 'other'`.",
  },
  {
    sectionIndex: 5,
    question:
      "Was ist F-bounded Polymorphism?",
    code: "interface Comparable<T extends Comparable<T>> { compareTo(other: T): number; }",
    options: [
      "Ein anderer Name fuer Generics",
      "Ein Pattern das nur in funktionalen Sprachen existiert",
      "Ein Pattern bei dem der Typparameter sich selbst im Constraint referenziert",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "F-bounded Polymorphism: T referenziert sich selbst im Constraint. " +
      "Stellt sicher, dass Typen nur mit sich selbst vergleichbar sind.",
  },

  // ─── Sektion 6: Generische APIs designen ───────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Wann ist ein Typparameter ueberfluessig (Anti-Pattern)?",
    options: [
      "Wenn er mehr als einmal vorkommt",
      "Ich weiss es nicht",
      "Wenn er einen Default-Wert hat",
      "Wenn er nur einmal vorkommt und keine Beziehung herstellt",
    ],
    correct: 3,
    briefExplanation:
      "Ein Typparameter der nur einmal vorkommt korreliert nichts. " +
      "Er kann durch `unknown` ersetzt werden. Das ist die 'Rule of Two'.",
  },
  {
    sectionIndex: 6,
    question:
      "Was ist besser fuer eine parse-Funktion: `parse<T>(input: string): T` oder Overloads?",
    options: [
      "Der Generic — weil er flexibler ist",
      "Ich weiss es nicht",
      "Beides ist gleichwertig",
      "Overloads — weil die Input-Output-Beziehung diskret und endlich ist",
    ],
    correct: 3,
    briefExplanation:
      "Overloads sind besser wenn die Beziehung zwischen Input und Output " +
      "eine endliche Menge konkreter Faelle ist, nicht parametrisch.",
  },
  {
    sectionIndex: 6,
    question:
      "Was passiert wenn TypeScript einen Typparameter nicht inferieren kann und kein Default existiert?",
    options: [
      "Compile-Error",
      "TypeScript inferiert `any`",
      "TypeScript inferiert `unknown`",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Ohne Inference-Kandidat und ohne Default faellt TypeScript auf `unknown` zurueck " +
      "(frueher `{}`, seit TS 5.x meistens `unknown`).",
  },
];
