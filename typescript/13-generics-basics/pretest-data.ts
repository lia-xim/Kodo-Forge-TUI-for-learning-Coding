/**
 * Lektion 13 — Pre-Test-Fragen: Generics Basics
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
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
  // ═══ Sektion 1: Warum Generics ═════════════════════════════════════════
  { sectionIndex: 1, question: "Was ist das Grundproblem das Generics loesen?", options: ["Geschwindigkeit", "Code-Duplikation bei verschiedenen Typen OHNE Typsicherheit zu verlieren", "Speicherverbrauch", "Ich weiss es nicht"], correct: 1, briefExplanation: "Generics vermeiden Duplikation (eine Funktion pro Typ) und any (Typsicherheit weg)." },
  { sectionIndex: 1, question: "Was bedeutet <T> bei einer Funktion?", options: ["T ist ein konkreter Typ", "T ist ein Typparameter — ein Platzhalter", "T ist immer string", "Ich weiss es nicht"], correct: 1, briefExplanation: "T ist ein Platzhalter der beim Aufruf durch den konkreten Typ ersetzt wird." },
  { sectionIndex: 1, question: "Warum ist any keine gute Loesung fuer generischen Code?", options: ["any ist langsam", "any deaktiviert den TypeScript-Compiler — keine Fehlererkennung", "any gibt es nicht", "Ich weiss es nicht"], correct: 1, briefExplanation: "any erlaubt ALLES — TypeScript kann keine Fehler mehr erkennen." },

  // ═══ Sektion 2: Generische Funktionen ══════════════════════════════════
  { sectionIndex: 2, question: "Was ist der Typ von result bei `const result = identity(42)`?", code: "function identity<T>(arg: T): T { return arg; }", options: ["any", "number", "string", "Ich weiss es nicht"], correct: 1, briefExplanation: "TypeScript inferiert T = number aus dem Argument 42." },
  { sectionIndex: 2, question: "Wann muss man den Typparameter explizit angeben?", options: ["Immer", "Wenn T nicht aus den Argumenten inferiert werden kann", "Nie — Inference funktioniert immer", "Ich weiss es nicht"], correct: 1, briefExplanation: "Wenn T nur im Rueckgabetyp vorkommt (nicht in Parametern), muss man ihn explizit angeben." },
  { sectionIndex: 2, question: "Wie schreibt man eine Arrow Function mit Generics?", options: ["<T> => (arg: T): T", "const f = <T>(arg: T): T => arg", "(T) => arg: T", "Ich weiss es nicht"], correct: 1, briefExplanation: "Der Typparameter steht vor der Parameterliste: <T>(arg: T): T => arg." },

  // ═══ Sektion 3: Generische Interfaces und Types ════════════════════════
  { sectionIndex: 3, question: "Was ist der Unterschied zwischen Box<string> und Box<number>?", code: "interface Box<T> { content: T; label: string; }", options: ["Kein Unterschied", "content hat verschiedene Typen — string bzw. number", "label hat verschiedene Typen", "Ich weiss es nicht"], correct: 1, briefExplanation: "T wird ersetzt: Box<string> hat content: string, Box<number> hat content: number." },
  { sectionIndex: 3, question: "Sind number[] und Array<number> der gleiche Typ?", options: ["Nein, verschiedene Typen", "Ja — number[] ist Syntactic Sugar fuer Array<number>", "Nur in strict mode", "Ich weiss es nicht"], correct: 1, briefExplanation: "number[] und Array<number> sind exakt derselbe Typ — nur andere Syntax." },
  { sectionIndex: 3, question: "Kann ein generisches Interface mehrere Typparameter haben?", options: ["Nein, nur einen", "Ja — z.B. Map<K, V> hat zwei", "Nur bei Klassen", "Ich weiss es nicht"], correct: 1, briefExplanation: "Beliebig viele Typparameter moeglich: Map<K, V>, Record<K, V>, etc." },

  // ═══ Sektion 4: Constraints ════════════════════════════════════════════
  { sectionIndex: 4, question: "Was macht `T extends { length: number }`?", options: ["T wird zu number", "T muss mindestens eine length-Property vom Typ number haben", "T ist immer string", "Ich weiss es nicht"], correct: 1, briefExplanation: "extends bei Typparametern ist ein Constraint — eine Mindestanforderung an T." },
  { sectionIndex: 4, question: "Was bedeutet `K extends keyof T`?", options: ["K ist ein beliebiger String", "K muss ein gueltiger Schluessel des Typs T sein", "K erweitert T", "Ich weiss es nicht"], correct: 1, briefExplanation: "keyof T erzeugt den Union aller Schluessel. K muss einer davon sein." },
  { sectionIndex: 4, question: "Wie kombiniert man zwei Constraints?", options: ["T extends A, B", "T extends A & B", "T extends A extends B", "Ich weiss es nicht"], correct: 1, briefExplanation: "Intersection Type &: T extends A & B bedeutet T muss BEIDES erfuellen." },

  // ═══ Sektion 5: Default-Typparameter ═══════════════════════════════════
  { sectionIndex: 5, question: "Was macht `<T = string>` bei einem Typparameter?", options: ["T ist immer string", "Wenn T nicht angegeben wird, ist der Default string", "T kann nur string sein", "Ich weiss es nicht"], correct: 1, briefExplanation: "Default wird verwendet wenn T beim Aufruf/Verwendung nicht angegeben wird." },
  { sectionIndex: 5, question: "Duerfen Typparameter mit Default VOR solchen ohne stehen?", code: "interface Cache<K = string, V> { ... }", options: ["Ja", "Nein — Defaults muessen am Ende stehen", "Nur bei Type Aliases", "Ich weiss es nicht"], correct: 1, briefExplanation: "Gleiche Regel wie bei Funktions-Parametern: Required vor Optional." },
  { sectionIndex: 5, question: "Muss der Default-Typ den Constraint erfuellen?", code: "interface Box<T extends object = string> { ... }", options: ["Nein, Defaults ignorieren Constraints", "Ja — string erfuellt nicht object, das ist ein Fehler", "Constraints und Defaults sind unabhaengig", "Ich weiss es nicht"], correct: 1, briefExplanation: "Der Default-Typ MUSS den Constraint erfuellen. string extends object ist falsch." },

  // ═══ Sektion 6: Generics in der Praxis ═════════════════════════════════
  { sectionIndex: 6, question: "Warum muss man bei `useState<User | null>(null)` den Typ explizit angeben?", options: ["React-Konvention", "Ohne den Typ waere T = null — zu eng fuer spaetere setUser-Aufrufe", "Man muss es nicht", "Ich weiss es nicht"], correct: 1, briefExplanation: "Ohne <User | null> waere T = null. setUser({name: 'Max'}) wuerde scheitern." },
  { sectionIndex: 6, question: "Was ist Promise<string>?", options: ["Ein String der ein Promise ist", "Ein Promise das zu einem string aufgeloest wird", "Ein generischer String", "Ich weiss es nicht"], correct: 1, briefExplanation: "Promise<T> traegt den Typ des aufgeloesten Werts. Promise<string> → await ergibt string." },
  { sectionIndex: 6, question: "Wofuer steht K und V bei Map<K, V>?", options: ["Klasse und Variable", "Key und Value — Schluessel- und Werttyp", "Konstante und Void", "Ich weiss es nicht"], correct: 1, briefExplanation: "K = Key (Schluesseltyp), V = Value (Werttyp). Map<string, number> → String-Keys, Number-Werte." },
];
