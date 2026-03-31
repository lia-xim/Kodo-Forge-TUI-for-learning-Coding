/**
 * Lektion 14 — Pre-Test-Fragen: Generic Patterns
 *
 * 3 Fragen pro Sektion (5 Sektionen = 15 Fragen).
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
  // ═══ Sektion 1: Generic Factories ═════════════════════════════════════════
  { sectionIndex: 1, question: "Was beschreibt `new () => T` in TypeScript?", options: ["Eine normale Funktion", "Eine Constructor Signature — etwas das mit new eine Instanz von T erzeugt", "Ein Interface", "Ich weiss es nicht"], correct: 1, briefExplanation: "Constructor Signatures beschreiben Klassen/Konstruktoren die mit new aufgerufen werden." },
  { sectionIndex: 1, question: "Wie trackt der Builder Pattern den Typ bei jedem Schritt?", options: ["Durch Arrays", "Durch Intersection Types: T & Record<K, V> pro Schritt", "Durch Vererbung", "Ich weiss es nicht"], correct: 1, briefExplanation: "Jeder set()-Aufruf erweitert T durch eine Intersection mit dem neuen Feld." },
  { sectionIndex: 1, question: "Was ist ein Partial Factory Pattern?", options: ["Eine unfertige Factory", "Eine Factory die Defaults hat und der Aufrufer nur Aenderungen angibt", "Eine abstrakte Factory", "Ich weiss es nicht"], correct: 1, briefExplanation: "createWithDefaults(defaults)(overrides) — der Aufrufer gibt nur die Abweichungen an." },

  // ═══ Sektion 2: Generic Collections ═══════════════════════════════════════
  { sectionIndex: 2, question: "Warum gibt Stack<T>.pop() den Typ T | undefined zurueck?", options: ["Weil T immer optional ist", "Weil ein leerer Stack kein Element zum Zurueckgeben hat", "Weil pop immer undefined gibt", "Ich weiss es nicht"], correct: 1, briefExplanation: "Leerer Stack = nichts da. undefined ist die ehrliche Antwort." },
  { sectionIndex: 2, question: "Was ist der Unterschied zwischen Stack und Queue?", options: ["Kein Unterschied", "Stack = LIFO (letztes rein, erstes raus), Queue = FIFO (erstes rein, erstes raus)", "Stack fuer Zahlen, Queue fuer Strings", "Ich weiss es nicht"], correct: 1, briefExplanation: "LIFO vs FIFO: Stack nimmt das letzte Element zuerst, Queue das erste." },
  { sectionIndex: 2, question: "Warum hat IndexedCollection<T> das Constraint T extends { id: ... }?", options: ["Performance", "Damit jedes Element eine id hat — fuer Map-basiertes Lookup", "Weil TypeScript es erfordert", "Ich weiss es nicht"], correct: 1, briefExplanation: "Das Constraint garantiert dass jedes Element eine id-Property hat." },

  // ═══ Sektion 3: Generic HOFs ══════════════════════════════════════════════
  { sectionIndex: 3, question: "Warum braucht pipe() Overloads?", options: ["Weil pipe nur mit 2 Funktionen funktioniert", "Weil jeder Schritt einen anderen Typ hat und Rest-Parameter das nicht abbilden", "Weil Overloads schneller sind", "Ich weiss es nicht"], correct: 1, briefExplanation: "Jeder Schritt hat verschiedene Typen. Overloads definieren die Uebergaenge explizit." },
  { sectionIndex: 3, question: "Was ist der Unterschied zwischen pipe und compose?", options: ["Kein Unterschied", "pipe fuehrt sofort aus (links nach rechts), compose gibt eine Funktion zurueck (rechts nach links)", "pipe ist fuer Arrays, compose fuer Strings", "Ich weiss es nicht"], correct: 1, briefExplanation: "pipe(v, f, g) = g(f(v)). compose(g, f) = (x) => g(f(x))." },
  { sectionIndex: 3, question: "Was macht curry((a, b) => a + b)?", options: ["Fuehrt a + b aus", "Erzeugt eine verschachtelte Funktion: (a) => (b) => a + b", "Gibt NaN zurueck", "Ich weiss es nicht"], correct: 1, briefExplanation: "Currying verwandelt f(a, b) in f(a)(b) — Partial Application wird moeglich." },

  // ═══ Sektion 4: Advanced Constraints ═══════════════════════════════════════
  { sectionIndex: 4, question: "Was macht ein Conditional Type `T extends string ? X : Y`?", options: ["Runtime-Check", "Compile-Zeit-Entscheidung: wenn T Subtyp von string ist, wird X gewaehlt, sonst Y", "Konvertiert T", "Ich weiss es nicht"], correct: 1, briefExplanation: "Conditional Types waehlen basierend auf extends-Beziehung zur Compile-Zeit." },
  { sectionIndex: 4, question: "Was ist ein rekursiver Typ wie TreeNode<T>?", options: ["Ein Fehler", "Ein Typ der sich selbst referenziert — fuer baumartige Strukturen", "Ein Array-Typ", "Ich weiss es nicht"], correct: 1, briefExplanation: "TreeNode<T> hat children: TreeNode<T>[] — Selbstreferenz fuer Baeume." },
  { sectionIndex: 4, question: "Was bewirkt `<const T>` (TS 5.0)?", options: ["T wird readonly", "TypeScript inferiert den praezisesten Literal-Typ ohne as const", "T wird zu einer Konstante", "Ich weiss es nicht"], correct: 1, briefExplanation: "const Type Parameters erzwingen Literal-Inferenz beim Aufrufer." },

  // ═══ Sektion 5: Real-World Generics ════════════════════════════════════════
  { sectionIndex: 5, question: "Warum verwendet Repository<T>.create() den Typ Omit<T, 'id'>?", options: ["Weil id optional ist", "Weil die id vom Repository generiert wird — der Aufrufer soll sie nicht setzen", "Weil Omit ein Pflicht-Typ ist", "Ich weiss es nicht"], correct: 1, briefExplanation: "Omit<T, 'id'> entfernt id komplett — das Repository generiert sie intern." },
  { sectionIndex: 5, question: "Wie verknuepft der TypedEventEmitter Event-Name und Payload?", options: ["Durch Strings", "Durch ein Interface das Event-Namen auf Payload-Typen mappt", "Durch Runtime-Checks", "Ich weiss es nicht"], correct: 1, briefExplanation: "Events-Interface mappt Namen auf Typen. K extends keyof Events verknuepft sie." },
  { sectionIndex: 5, question: "Was ist ein Phantom Type bei Token<T> im DI Container?", options: ["Ein unsichtbarer Typ", "Ein Typparameter der nur zur Compile-Zeit existiert und den Service-Typ traegt", "Ein Fehler", "Ich weiss es nicht"], correct: 1, briefExplanation: "Token<T> traegt T als Typinfo. Zur Laufzeit ist nur der name-String da." },
];
