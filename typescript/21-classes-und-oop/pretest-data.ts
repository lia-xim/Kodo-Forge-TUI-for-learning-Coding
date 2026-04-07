/**
 * Lektion 21 — Pre-Test-Fragen: Classes & OOP
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
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
  // ─── Sektion 1: Klassen-Grundlagen ──────────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Was passiert, wenn du eine Klasse mit einem Feld 'name: string' deklarierst, " +
      "aber KEINEN Constructor hast und nichts zuweist?",
    code: "class User {\n  name: string;\n}",
    options: [
      "Kein Problem, name ist automatisch ein leerer String",
      "Compile-Error: Property hat keinen Initializer",
      "name ist undefined zur Laufzeit, aber TypeScript warnt nicht",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Mit strictPropertyInitialization (Teil von strict: true) meldet TypeScript " +
      "einen Fehler: Jedes Feld muss entweder einen Default-Wert haben, optional " +
      "sein (?), oder im Constructor zugewiesen werden.",
  },
  {
    sectionIndex: 1,
    question:
      "Existieren TypeScript-Klassen zur Laufzeit oder verschwinden sie wie Interfaces?",
    options: [
      "Sie verschwinden komplett (Type Erasure)",
      "Sie bleiben als JavaScript-Konstruktorfunktionen",
      "Nur abstract Klassen verschwinden",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Klassen bleiben als JavaScript-Konstruktorfunktionen erhalten. " +
      "Nur die TypeScript-spezifischen Ergaenzungen (Typ-Annotationen, " +
      "Access Modifiers) werden entfernt. Deshalb funktioniert 'instanceof'.",
  },
  {
    sectionIndex: 1,
    question:
      "Was denkst du: Kann ein Plain Object (kein 'new MyClass()') als " +
      "Klassen-Instanz verwendet werden?",
    code:
      "class Point { x: number = 0; y: number = 0; }\n" +
      "function print(p: Point) { console.log(p.x); }\n" +
      "print({ x: 1, y: 2 }); // Geht das?",
    options: [
      "Nein, es muss 'new Point()' sein",
      "Ja, wegen Structural Typing — gleiche Struktur reicht",
      "Nur mit einem Cast (as Point)",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript nutzt Structural Typing: Wenn ein Objekt die gleiche " +
      "Struktur hat wie die Klasse, passt es. Kein 'new' noetig, " +
      "kein 'implements' noetig.",
  },

  // ─── Sektion 2: Access Modifiers ────────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Kannst du auf ein 'private' Feld zur Laufzeit zugreifen, " +
      "z.B. mit '(obj as any).feld'?",
    options: [
      "Nein, private ist auch zur Laufzeit geschuetzt",
      "Ja, weil private nur ein Compilezeit-Feature ist (Type Erasure)",
      "Nur bei public Feldern",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript's 'private' existiert nur zur Compilezeit. " +
      "Zur Laufzeit ist das Feld ein normales JS-Property. " +
      "Mit 'as any' umgehst du das Typsystem.",
  },
  {
    sectionIndex: 2,
    question:
      "JavaScript hat seit ES2022 ein eigenes Private-Feature: #private. " +
      "Wie unterscheidet es sich von TypeScript's private?",
    code:
      "class A { private ts = 1; }\n" +
      "class B { #js = 1; }",
    options: [
      "Kein Unterschied, beides ist zur Laufzeit privat",
      "#private bleibt zur Laufzeit privat, private (TS) wird entfernt",
      "private (TS) ist staerker als #private (JS)",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "#private (ES2022) ist echte Laufzeit-Kapselung — nicht einmal " +
      "mit 'as any' zugaenglich. TypeScript's 'private' wird beim " +
      "Kompilieren entfernt.",
  },
  {
    sectionIndex: 2,
    question:
      "Welcher Modifier erlaubt Zugriff in Subklassen, aber nicht von aussen?",
    options: [
      "protected",
      "private",
      "readonly",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "'protected' erlaubt Zugriff in der Klasse selbst und in Subklassen, " +
      "aber nicht von aussen. 'private' erlaubt nur Zugriff in der Klasse selbst.",
  },

  // ─── Sektion 3: Vererbung und Abstract Classes ─────────────────────────

  {
    sectionIndex: 3,
    question:
      "Kann eine abstract class auch konkrete Methoden (mit Body) haben?",
    options: [
      "Ja, eine abstract class kann abstrakte UND konkrete Methoden haben",
      "Nein, alle Methoden muessen abstract sein",
      "Nur static Methoden koennen konkret sein",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Abstract classes koennen sowohl abstrakte (ohne Body, muessen " +
      "implementiert werden) als auch konkrete (mit Body, werden vererbt) " +
      "Methoden haben. Das ist ihr Vorteil gegenueber Interfaces.",
  },
  {
    sectionIndex: 3,
    question:
      "Was passiert, wenn du 'new AbstractClass()' aufrufst?",
    options: [
      "Compile-Error — abstract classes koennen nicht instanziiert werden",
      "Es funktioniert — eine abstrakte Klasse ist eine normale Klasse",
      "Runtime-Error — es wird erst zur Laufzeit geworfen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript verhindert die Instanziierung von abstract classes " +
      "zur Compilezeit. Nur Subklassen, die alle abstrakten Methoden " +
      "implementieren, koennen instanziiert werden.",
  },
  {
    sectionIndex: 3,
    question:
      "TypeScript 4.3 hat das 'override'-Keyword eingefuehrt. " +
      "Was passiert mit 'override rendr()' wenn die Elternklasse 'render()' hat?",
    options: [
      "Compile-Error — 'rendr' existiert nicht in der Elternklasse",
      "Kompiliert — override ist nur ein Hinweis",
      "Runtime-Error beim Aufruf",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "'override' prueft, ob die Methode wirklich in der Elternklasse existiert. " +
      "Bei einem Tippfehler (rendr statt render) meldet TypeScript sofort einen Fehler.",
  },

  // ─── Sektion 4: Interfaces implementieren ──────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Erbt eine Klasse Code, wenn sie ein Interface mit 'implements' verwendet?",
    options: [
      "Ja, implements ist wie extends",
      "Nur statische Methoden werden uebernommen",
      "Nein, implements uebernimmt keinen Code — nur den Vertrag",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "'implements' erbt KEINEN Code. Es ist nur ein Compile-Zeit-Versprechen: " +
      "'Ich habe alle Mitglieder des Interfaces.' Den Code musst du selbst schreiben.",
  },
  {
    sectionIndex: 4,
    question:
      "Kann eine Klasse mehrere Interfaces gleichzeitig implementieren?",
    options: [
      "Nein, nur ein Interface pro Klasse",
      "Nur mit extends, nicht mit implements",
      "Ja, mit Komma getrennt: implements A, B, C",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Ja! Eine Klasse kann beliebig viele Interfaces implementieren " +
      "(implements A, B, C). Im Gegensatz zu extends (nur EINE Elternklasse).",
  },
  {
    sectionIndex: 4,
    question:
      "Muss man 'implements' ueberhaupt schreiben, wenn TypeScript " +
      "Structural Typing nutzt?",
    options: [
      "Ja, ohne implements kompiliert der Code nicht",
      "Es ist in striktem Modus erforderlich",
      "Nein, aber es bietet fruehere Fehlermeldungen und bessere Dokumentation",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Structural Typing macht 'implements' technisch optional. " +
      "Aber 'implements' bietet fruehere Fehlermeldungen (beim Schreiben " +
      "der Klasse, nicht erst beim Verwenden), bessere IDE-Unterstuetzung " +
      "und Dokumentation der Absicht.",
  },

  // ─── Sektion 5: Static Members und Patterns ────────────────────────────

  {
    sectionIndex: 5,
    question:
      "Worauf verweist 'this' in einer static Methode?",
    options: [
      "Auf die aktuelle Instanz",
      "this ist in static Methoden nicht verfuegbar",
      "Auf die Klasse selbst (nicht eine Instanz)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "In static Methoden verweist 'this' auf die KLASSE, nicht auf " +
      "eine Instanz. Das ist logisch: Static Members gehoeren der Klasse, " +
      "nicht einzelnen Instanzen.",
  },
  {
    sectionIndex: 5,
    question:
      "Was macht 'constructor(public name: string)' in TypeScript?",
    options: [
      "Nur einen Parameter — kein Feld wird erstellt",
      "Ich weiss es nicht",
      "Ist ein Syntax-Error",
      "Erstellt automatisch ein Feld 'name' und weist den Wert zu",
    ],
    correct: 3,
    briefExplanation:
      "Parameter Properties: Ein Modifier (public/private/protected/readonly) " +
      "vor einem Constructor-Parameter deklariert automatisch ein Feld " +
      "und weist den Wert zu. Spart drei Zeilen Code.",
  },
  {
    sectionIndex: 5,
    question:
      "Warum hat das Singleton-Pattern einen privaten Constructor?",
    options: [
      "Um zu verhindern, dass 'new' von aussen aufgerufen wird",
      "Weil private Constructors schneller sind",
      "Um den Constructor fuer Subklassen zu sperren",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Ein privater Constructor verhindert 'new MyClass()' von aussen. " +
      "Nur die Klasse selbst (via static getInstance()) kann Instanzen " +
      "erstellen — so wird sichergestellt, dass nur EINE Instanz existiert.",
  },

  // ─── Sektion 6: Klassen in der Praxis ──────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Warum hat React von Class Components zu Hooks gewechselt?",
    options: [
      "Weil Klassen in JavaScript zu langsam sind",
      "Ich weiss es nicht",
      "Weil TypeScript keine Class Components unterstuetzt",
      "Wegen this-Binding-Problemen, schlechter Code-Organisation und schwieriger Code-Wiederverwendung",
    ],
    correct: 3,
    briefExplanation:
      "React identifizierte drei Probleme: 1) this-Binding-Verwirrung, " +
      "2) zusammengehoerige Logik ueber Lifecycle-Methoden verstreut, " +
      "3) Code-Sharing ueber HOCs war umstaendlich. Hooks loesen alle drei.",
  },
  {
    sectionIndex: 6,
    question:
      "Warum verliert 'const fn = obj.method; fn()' den this-Kontext?",
    code: "class T { x = 1; show() { console.log(this.x); } }\n" +
          "const t = new T();\nconst fn = t.show;\nfn(); // ???",
    options: [
      "Weil fn eine Kopie der Funktion ist, nicht eine Referenz",
      "Ich weiss es nicht",
      "Weil Klassen-Methoden nicht in Variablen gespeichert werden koennen",
      "Weil JavaScript 'this' anhand des Aufruf-Kontexts bestimmt",
    ],
    correct: 3,
    briefExplanation:
      "JavaScript bestimmt 'this' dynamisch beim Aufruf. " +
      "'obj.method()' → this=obj. 'fn()' → this=undefined (strict mode). " +
      "Die Methode hat kein fest gebundenes 'this'.",
  },
  {
    sectionIndex: 6,
    question:
      "Was ist der Vorteil von Komposition gegenueber Vererbung?",
    options: [
      "Komposition ist schneller zur Laufzeit",
      "Ich weiss es nicht",
      "Komposition funktioniert nur in TypeScript, nicht in JavaScript",
      "Komposition erlaubt flexibles Zusammenstecken von Faehigkeiten ohne enge Kopplung",
    ],
    correct: 3,
    briefExplanation:
      "Komposition ('hat-ein') ist flexibler als Vererbung ('ist-ein'): " +
      "Faehigkeiten koennen unabhaengig kombiniert, ausgetauscht und " +
      "getestet werden. Keine starre Vererbungshierarchie.",
  },
];
