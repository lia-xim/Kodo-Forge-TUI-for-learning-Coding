/**
 * Lektion 21 — Quiz-Daten: Classes & OOP
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "21";
export const lessonTitle = "Classes & OOP";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Klassen-Grundlagen (correct: 0) ---
  {
    question: "Was passiert mit TypeScript-Klassen zur Laufzeit?",
    options: [
      "Die Klasse bleibt als JS-Konstruktorfunktion, aber Typ-Annotationen werden entfernt",
      "Die gesamte Klasse wird entfernt (Type Erasure)",
      "Die Klasse wird in ein Interface umgewandelt",
      "TypeScript fuegt Laufzeit-Pruefungen fuer Felder hinzu",
    ],
    correct: 0,
    explanation:
      "Klassen existieren zur Laufzeit als JavaScript-Konstruktorfunktionen " +
      "(im Gegensatz zu Interfaces, die komplett verschwinden). " +
      "Aber alle TypeScript-spezifischen Ergaenzungen (Typ-Annotationen, " +
      "Access Modifiers wie 'private') werden entfernt.",
    elaboratedFeedback: {
      whyCorrect:
        "Klassen sind JavaScript-Features, die auch zur Laufzeit existieren. " +
        "TypeScript entfernt nur die Typ-Annotationen und Modifiers — " +
        "die Klasse selbst bleibt als Konstruktorfunktion erhalten.",
      commonMistake:
        "Viele verwechseln Klassen mit Interfaces. Interfaces verschwinden " +
        "komplett (Type Erasure), Klassen nicht. Das ist der Grund, warum " +
        "'instanceof' nur mit Klassen funktioniert.",
    },
  },

  // --- Frage 2: strictPropertyInitialization (correct: 1) ---
  {
    question: "Welcher Code erzeugt einen Compile-Error mit 'strict: true'?",
    options: [
      "class A { name: string = 'default'; }",
      "class A { name: string; }",
      "class A { name?: string; }",
      "class A { name: string; constructor(n: string) { this.name = n; } }",
    ],
    correct: 1,
    explanation:
      "Mit strictPropertyInitialization muss jedes Feld entweder einen " +
      "Default-Wert haben, optional sein (?), oder im Constructor zugewiesen " +
      "werden. 'class A { name: string; }' hat nichts davon.",
    code: "class A {\n  name: string;\n  // TS2564: Property 'name' has no initializer\n}",
    elaboratedFeedback: {
      whyCorrect:
        "'name: string' ohne Initialisierung bedeutet: zur Laufzeit waere " +
        "'name' undefined, aber TypeScript denkt es sei string. " +
        "strictPropertyInitialization verhindert diese Luege.",
      commonMistake:
        "Viele vergessen, dass '?' (optional) das Problem loest — " +
        "'name?: string' macht den Typ zu 'string | undefined', " +
        "was ehrlich gegenueber dem Typsystem ist.",
    },
  },

  // --- Frage 3: private vs #private (correct: 2) ---
  {
    question: "Welche Aussage ueber 'private' in TypeScript ist KORREKT?",
    options: [
      "private ist zur Laufzeit erzwungen und verhindert jeden Zugriff",
      "private und #private sind identisch, nur die Syntax unterscheidet sich",
      "private wird bei der Kompilierung entfernt — mit 'as any' ist Zugriff moeglich",
      "private existiert auch in reinem JavaScript seit ES6",
    ],
    correct: 2,
    explanation:
      "TypeScript's 'private' ist ein Compilezeit-Feature (Type Erasure). " +
      "Zur Laufzeit ist das Feld ein ganz normales Property. " +
      "Nur JavaScript's '#private' (ES2022) bietet echten Laufzeit-Schutz.",
    elaboratedFeedback: {
      whyCorrect:
        "Type Erasure bedeutet: ALLE TypeScript-spezifischen Features werden " +
        "beim Kompilieren entfernt. 'private' ist TypeScript-only, also verschwindet es. " +
        "Im generierten JS-Code ist das Feld oeffentlich zugaenglich.",
      commonMistake:
        "Java/C#-Entwickler erwarten, dass 'private' zur Laufzeit schuetzt. " +
        "In TypeScript ist es ein 'Gentleman's Agreement' — der Compiler warnt, " +
        "aber der JS-Code hat keinen Schutz.",
    },
  },

  // --- Frage 4: super() Aufruf (correct: 0) ---
  {
    question: "Wo muss 'super()' im Constructor einer Subklasse stehen?",
    options: [
      "Als ERSTE Anweisung, noch vor jeglichem Zugriff auf 'this'",
      "Am Ende des Constructors",
      "An beliebiger Stelle im Constructor",
      "super() ist nur bei abstract Klassen noetig",
    ],
    correct: 0,
    explanation:
      "super() muss die ERSTE Anweisung im Constructor sein. " +
      "Vor super() ist 'this' noch nicht initialisiert — " +
      "jeder Zugriff auf 'this' wuerde einen Fehler verursachen. " +
      "Das ist eine JavaScript-Regel, nicht nur TypeScript.",
    elaboratedFeedback: {
      whyCorrect:
        "Die Elternklasse muss zuerst initialisiert werden, damit die " +
        "Subklasse auf 'this' zugreifen kann. Erst super() erstellt " +
        "die Instanz — vorher existiert 'this' noch nicht.",
      commonMistake:
        "Manche denken, man koennte vor super() lokale Berechnungen machen " +
        "und das Ergebnis an super() uebergeben. Das geht, solange man " +
        "NICHT auf 'this' zugreift. super() muss aber trotzdem vor dem " +
        "ersten 'this'-Zugriff kommen.",
    },
  },

  // --- Frage 5: abstract class (correct: 3) ---
  {
    question: "Welche Aussage ueber abstract classes ist FALSCH?",
    options: [
      "Abstract classes koennen nicht instanziiert werden",
      "Abstract classes koennen konkrete Methoden (mit Body) haben",
      "Abstract methods muessen von Subklassen implementiert werden",
      "Abstract classes koennen keine Felder mit Default-Werten haben",
    ],
    correct: 3,
    explanation:
      "FALSCH: Abstract classes KOENNEN Felder mit Default-Werten haben! " +
      "Sie koennen sowohl abstrakte Methoden (ohne Body) als auch " +
      "konkrete Methoden und Felder (mit Body/Werten) enthalten. " +
      "Das macht sie maechtig: gemeinsamer Code + erzwungene Implementierung.",
    elaboratedFeedback: {
      whyCorrect:
        "Abstract classes sind eine Mischung aus Interface (abstrakte Methoden) " +
        "und konkreter Klasse (Felder, Methoden mit Body). " +
        "Nur die Instanziierung ist verboten.",
      commonMistake:
        "Viele denken, abstract = 'rein abstrakt' (wie Java-Interfaces vor Java 8). " +
        "Aber abstract classes KOENNEN konkreten Code enthalten — " +
        "das ist ihr Hauptvorteil gegenueber Interfaces.",
    },
  },

  // --- Frage 6: implements vs extends (correct: 1) ---
  {
    question: "Was ist der Hauptunterschied zwischen 'implements' und 'extends'?",
    options: [
      "implements erbt Code, extends nur Typen",
      "implements erbt KEINEN Code (nur Vertrag), extends erbt Code",
      "implements kann nur mit Interfaces, extends nur mit Klassen verwendet werden",
      "Es gibt keinen Unterschied, beide sind austauschbar",
    ],
    correct: 1,
    explanation:
      "implements uebernimmt KEINEN Code — es ist nur ein Compile-Zeit-Vertrag, " +
      "der sicherstellt, dass die Klasse alle erforderlichen Mitglieder hat. " +
      "extends dagegen erbt alle Felder und Methoden der Elternklasse.",
    elaboratedFeedback: {
      whyCorrect:
        "'implements' sagt: 'Ich verspreche, diese Struktur zu haben.' " +
        "'extends' sagt: 'Ich erbe alles von dieser Klasse und kann es erweitern.' " +
        "Der Code-Unterschied ist erheblich: mit implements musst du alles selbst schreiben.",
      commonMistake:
        "Option C ist teilweise richtig (implements KANN mit Interfaces verwendet werden), " +
        "aber unvollstaendig: implements kann auch mit Klassen verwendet werden! " +
        "Und extends kann auch mit abstract classes.",
    },
  },

  // --- Frage 7: Structural Typing (correct: 2) ---
  {
    question: "Was ist das Ergebnis dieses Codes?",
    options: [
      "Compile-Error: plainObj hat nicht den Typ Dog",
      "Compile-Error: plainObj ist kein instanceof Dog",
      "Kompiliert und gibt 'Wuff!' aus — Structural Typing",
      "Runtime-Error: plainObj hat keine bark-Methode",
    ],
    correct: 2,
    code:
      "class Dog { name = 'Rex'; bark() { return 'Wuff!'; } }\n" +
      "function feed(dog: Dog) { console.log(dog.bark()); }\n" +
      "const plainObj = { name: 'Bello', bark: () => 'Wuff!' };\n" +
      "feed(plainObj);",
    explanation:
      "TypeScript nutzt Structural Typing: plainObj hat die gleiche Struktur " +
      "wie Dog (name: string, bark(): string), also passt es. " +
      "Es ist KEIN 'new Dog()' noetig — die Struktur reicht.",
    elaboratedFeedback: {
      whyCorrect:
        "Structural Typing (Duck Typing): 'Wenn es wie ein Duck quakt und " +
        "wie ein Duck aussieht, ist es ein Duck.' plainObj hat name + bark() " +
        "— das ist alles was der Dog-Typ verlangt.",
      commonMistake:
        "Java/C#-Entwickler erwarten Nominal Typing: dort muesste plainObj " +
        "explizit 'implements Dog' haben. In TypeScript reicht die Struktur.",
    },
  },

  // --- Frage 8: Parameter Properties (correct: 0) ---
  {
    question: "Was macht 'constructor(private name: string)' in TypeScript?",
    options: [
      "Deklariert ein private Feld 'name', nimmt den Parameter und weist this.name = name zu",
      "Erstellt nur einen privaten Parameter, kein Feld",
      "Das ist ein Syntax-Error, private kann nicht im Constructor stehen",
      "Erstellt ein public Feld 'name' mit privatem Zugriff",
    ],
    correct: 0,
    explanation:
      "Parameter Properties sind eine TypeScript-Kurzschreibweise: " +
      "Ein Modifier (public/private/protected/readonly) vor einem " +
      "Constructor-Parameter erzeugt automatisch ein Klassen-Feld " +
      "und weist den Parameter-Wert zu.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript's Parameter Properties erledigen drei Dinge in einem Schritt: " +
        "1) Feld-Deklaration, 2) Constructor-Parameter, 3) this.name = name. " +
        "Das spart erheblich Boilerplate-Code.",
      commonMistake:
        "Manche denken, der Parameter existiert NUR im Constructor (wie ein " +
        "normaler Parameter). Der Modifier macht den Unterschied: MIT Modifier " +
        "wird ein Feld erstellt, OHNE Modifier ist es nur ein Parameter.",
    },
  },

  // --- Frage 9: Singleton Pattern (correct: 3) ---
  {
    question: "Warum ist das Singleton-Pattern kontrovers?",
    options: [
      "Weil es in TypeScript nicht korrekt implementiert werden kann",
      "Weil es zu viele Instanzen erstellt",
      "Weil TypeScript keine private Constructors unterstuetzt",
      "Weil es globalen Zustand erzeugt und Unit-Tests erschwert",
    ],
    correct: 3,
    explanation:
      "Singletons sind globaler Zustand mit einem schoenen Namen. " +
      "Probleme: Unit-Tests koennen den Zustand nicht zuruecksetzen, " +
      "versteckte Abhaengigkeiten entstehen, und Parallelitaet wird schwierig. " +
      "Deshalb nutzt Angular DI (providedIn: 'root') statt Singletons.",
    elaboratedFeedback: {
      whyCorrect:
        "Globaler Zustand ist das Kernproblem: Alle Tests teilen sich die " +
        "eine Instanz, Abhaengigkeiten sind nicht explizit, und parallele " +
        "Tests koennen sich gegenseitig beeinflussen.",
      commonMistake:
        "Viele denken, Singleton sei IMMER schlecht. In manchen Faellen " +
        "(Datenbankverbindungspool, Konfiguration) ist es sinnvoll — " +
        "aber besser durch DI verwaltet als durch die Klasse selbst.",
    },
  },

  // --- Frage 10: override keyword (correct: 2) ---
  {
    question: "Was passiert bei diesem Code mit 'noImplicitOverride: true'?",
    options: [
      "Kompiliert ohne Fehler",
      "Runtime-Error beim Aufruf von render()",
      "Compile-Error: 'render' muss mit 'override' markiert werden",
      "Compile-Error: 'rendr' existiert nicht in der Elternklasse",
    ],
    correct: 2,
    code:
      "class Base { render(): void { console.log('Base'); } }\n" +
      "class Child extends Base {\n  render(): void { console.log('Child'); }\n}",
    explanation:
      "Mit noImplicitOverride muss jede Methode, die eine Elternmethode " +
      "ueberschreibt, explizit 'override' tragen. Ohne 'override render()' " +
      "gibt TypeScript einen Fehler aus. Das verhindert versehentliches Ueberschreiben.",
    elaboratedFeedback: {
      whyCorrect:
        "'noImplicitOverride' erzwingt Explizitheit: Wer eine Methode ueberschreibt, " +
        "muss es bewusst tun und 'override' schreiben. Das verhindert auch Tippfehler " +
        "(z.B. 'rendr' statt 'render').",
      commonMistake:
        "Ohne noImplicitOverride wuerde der Code kompilieren. Viele kennen die " +
        "tsconfig-Option nicht und verpassen die Sicherheit, die sie bietet.",
    },
  },

  // --- Frage 11: this-Binding (correct: 1) ---
  {
    question: "Warum verliert eine Klassen-Methode ihren this-Kontext als Callback?",
    options: [
      "Weil TypeScript den this-Kontext zur Compilezeit entfernt",
      "Weil in JavaScript 'this' vom Aufruf-Kontext abhaengt, nicht von der Definition",
      "Weil Callbacks immer in einem neuen Scope ausgefuehrt werden",
      "Weil Arrow-Functions 'this' ueberschreiben",
    ],
    correct: 1,
    code:
      "class Timer {\n" +
      "  seconds = 0;\n" +
      "  tick() { this.seconds++; }\n" +
      "}\n" +
      "const t = new Timer();\n" +
      "const fn = t.tick;\n" +
      "fn(); // FEHLER: this ist undefined",
    explanation:
      "In JavaScript wird 'this' dynamisch beim AUFRUF bestimmt. " +
      "'t.tick()' setzt this=t, aber 'const fn = t.tick; fn()' hat kein " +
      "Objekt vor dem Punkt — daher ist this undefined (strict mode). " +
      "Loesung: Arrow-Functions oder bind().",
    elaboratedFeedback: {
      whyCorrect:
        "JavaScript's 'this' ist nicht an die Klasse gebunden, sondern an den " +
        "Aufruf-Kontext. 'obj.method()' → this=obj. 'const fn = obj.method; fn()' " +
        "→ this=undefined. Das ist ein Grundprinzip von JavaScript.",
      commonMistake:
        "Viele erwarten, dass 'this' automatisch an die Klassen-Instanz " +
        "gebunden ist (wie in Java). In JavaScript muss man dafuer sorgen: " +
        "Arrow-Functions, bind(), oder Arrow-Wrapper.",
    },
  },

  // --- Frage 12: Klassen als Typ (correct: 0) ---
  {
    question: "Was ist der Unterschied zwischen 'Animal' und 'typeof Animal'?",
    options: [
      "'Animal' ist der Instanz-Typ, 'typeof Animal' ist der Konstruktor-Typ",
      "Kein Unterschied, beide beschreiben den gleichen Typ",
      "'Animal' ist der Konstruktor-Typ, 'typeof Animal' ist der Instanz-Typ",
      "'typeof Animal' ist zur Laufzeit der String 'function'",
    ],
    correct: 0,
    explanation:
      "'Animal' als Typ beschreibt eine INSTANZ der Klasse (hat die Felder und Methoden). " +
      "'typeof Animal' beschreibt die KLASSE SELBST (den Konstruktor, der mit 'new' " +
      "aufgerufen werden kann). Das ist wichtig fuer Factory-Funktionen.",
    elaboratedFeedback: {
      whyCorrect:
        "In TypeScript haben Klassen zwei 'Gesichter': den Instanz-Typ (beschreibt " +
        "was 'new' zurueckgibt) und den Konstruktor-Typ (beschreibt die Klasse selbst). " +
        "'typeof Animal' ist Letzteres.",
      commonMistake:
        "Option D beschreibt den JAVASCRIPT-typeof-Operator, nicht den " +
        "TYPESCRIPT-typeof-Typ-Operator. Im Typ-Kontext extrahiert 'typeof' " +
        "den TypeScript-Typ einer Variable.",
    },
  },

  // --- Frage 13: Composition vs Inheritance (correct: 3) ---
  {
    question: "Warum empfiehlt die Gang of Four 'Composition over Inheritance'?",
    options: [
      "Weil Vererbung in JavaScript nicht funktioniert",
      "Weil Komposition schneller ist als Vererbung",
      "Weil TypeScript keine Mehrfachvererbung unterstuetzt",
      "Weil Vererbung enge Kopplung erzeugt und Komposition flexibler ist",
    ],
    correct: 3,
    explanation:
      "Vererbung erzeugt enge Kopplung: Aenderungen in der Elternklasse " +
      "koennen alle Subklassen brechen. Komposition ist flexibler — " +
      "Faehigkeiten werden als separate Objekte injiziert und koennen " +
      "unabhaengig ausgetauscht werden.",
    elaboratedFeedback: {
      whyCorrect:
        "Die GoF erkannten 1994: Vererbungshierarchien werden schnell starr. " +
        "Komposition erlaubt, Verhalten zur Laufzeit zu aendern, " +
        "verschiedene Kombinationen zu bilden und Abhaengigkeiten zu testen.",
      commonMistake:
        "TypeScript unterstuetzt tatsaechlich keine Mehrfachvererbung (Option C), " +
        "aber das ist nicht der GRUND fuer die GoF-Empfehlung. Auch in Sprachen " +
        "MIT Mehrfachvererbung (C++, Python) gilt das Prinzip.",
    },
  },

  // --- Frage 14: Mixins (correct: 1) ---
  {
    question: "Was ist ein TypeScript-Mixin?",
    options: [
      "Ein spezielles TypeScript-Keyword fuer Mehrfachvererbung",
      "Eine Funktion, die eine Klasse nimmt und eine erweiterte Klasse zurueckgibt",
      "Ein Interface, das von mehreren Klassen implementiert wird",
      "Ein Plugin-System fuer TypeScript-Compiler",
    ],
    correct: 1,
    explanation:
      "Mixins in TypeScript sind Funktionen der Form: " +
      "'function WithX<T extends Constructor>(Base: T) { return class extends Base { ... } }'. " +
      "Sie nehmen eine Klasse und geben eine erweiterte Klasse zurueck — " +
      "das ermoeglicht 'Mehrfachvererbung' ohne extends-Beschraenkung.",
    code:
      "type Constructor<T = {}> = new (...args: any[]) => T;\n" +
      "function WithTimestamp<T extends Constructor>(Base: T) {\n" +
      "  return class extends Base {\n" +
      "    createdAt = new Date();\n" +
      "  };\n" +
      "}",
    elaboratedFeedback: {
      whyCorrect:
        "Mixins sind ein Pattern, kein Sprachfeature. Die Funktion 'erweitert' " +
        "eine beliebige Basisklasse dynamisch. Mehrere Mixins koennen " +
        "verkettet werden: WithLogging(WithTimestamp(User)).",
      commonMistake:
        "Viele verwechseln Mixins mit Interfaces. Interfaces definieren nur Struktur, " +
        "Mixins liefern echten Code. Mixins sind die Loesung fuer " +
        "'Ich will Code aus mehreren Quellen erben'.",
    },
  },

  // --- Frage 15: protected (correct: 2) ---
  {
    question: "Von wo kann auf ein 'protected' Feld zugegriffen werden?",
    options: [
      "Nur innerhalb der Klasse, die das Feld definiert",
      "Von ueberall (protected ist dasselbe wie public)",
      "Innerhalb der Klasse und in allen Subklassen, aber nicht von aussen",
      "Nur in Subklassen, nicht in der Klasse selbst",
    ],
    correct: 2,
    explanation:
      "protected erlaubt Zugriff in der definierenden Klasse UND in allen " +
      "Subklassen (extends). Von aussen (Instanz-Zugriff) ist es verboten. " +
      "Das ist identisch zum Verhalten in Java und C#.",
    elaboratedFeedback: {
      whyCorrect:
        "protected ist der 'Familien-Modifier': Die Klasse selbst und ihre " +
        "'Kinder' (Subklassen) haben Zugriff. Externe Nutzer nicht. " +
        "Typischer Anwendungsfall: Methoden fuer Subklassen bereitstellen.",
      commonMistake:
        "Manche verwechseln private und protected. private = NUR die Klasse selbst. " +
        "protected = die Klasse + Subklassen. Von aussen sind beide nicht zugaenglich.",
    },
  },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Frage 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welches TypeScript-Keyword macht eine Klasse nicht-instanziierbar " +
      "und erzwingt, dass Subklassen bestimmte Methoden implementieren?",
    expectedAnswer: "abstract",
    acceptableAnswers: ["abstract", "Abstract", "ABSTRACT"],
    explanation:
      "Das 'abstract'-Keyword vor einer Klasse verhindert direkte Instanziierung " +
      "mit 'new'. Abstrakte Methoden (ohne Body) muessen von jeder konkreten " +
      "Subklasse implementiert werden — aehnlich wie ein Interface, aber mit " +
      "der Moeglichkeit, auch konkreten Code zu enthalten.",
  },

  // --- Frage 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst die TypeScript-Kurzschreibweise, bei der ein Modifier (public/private/protected/readonly) " +
      "vor einem Constructor-Parameter automatisch ein Klassen-Feld erzeugt?",
    expectedAnswer: "Parameter Properties",
    acceptableAnswers: [
      "Parameter Properties", "Parameter Property", "parameter properties",
      "parameter property", "Constructor Parameter Properties",
    ],
    explanation:
      "Parameter Properties erledigen drei Dinge auf einmal: " +
      "Feld-Deklaration, Constructor-Parameter und Zuweisung. " +
      "'constructor(private name: string)' ist identisch mit: " +
      "Feld 'private name: string' + 'this.name = name' im Constructor.",
  },

  // --- Frage 18: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welches Typsystem-Prinzip erlaubt es, ein einfaches Objekt-Literal " +
      "an eine Funktion zu uebergeben, die einen Klassen-Typ erwartet?",
    expectedAnswer: "Structural Typing",
    acceptableAnswers: [
      "Structural Typing", "structural typing", "Strukturelle Typisierung",
      "Duck Typing", "duck typing",
    ],
    explanation:
      "TypeScript nutzt Structural Typing: Wenn ein Objekt die gleiche Struktur " +
      "wie eine Klasse hat (gleiche Felder und Methoden), ist es kompatibel — " +
      "unabhaengig davon, ob es mit 'new' erzeugt wurde.",
  },

  // --- Frage 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Was gibt dieser Code aus?",
    code:
      "class Counter {\n" +
      "  count = 0;\n" +
      "  increment = () => { this.count++; };\n" +
      "}\n" +
      "const c = new Counter();\n" +
      "const fn = c.increment;\n" +
      "fn();\n" +
      "fn();\n" +
      "console.log(c.count);",
    expectedAnswer: "2",
    acceptableAnswers: ["2"],
    explanation:
      "Da 'increment' als Arrow-Function definiert ist, wird 'this' lexikalisch " +
      "gebunden — es zeigt immer auf die Counter-Instanz. Anders als bei " +
      "normalen Methoden geht der this-Kontext beim Extrahieren nicht verloren. " +
      "Zwei Aufrufe von fn() erhoehen count auf 2.",
  },

  // --- Frage 20: Predict-Output ---
  {
    type: "predict-output",
    question: "Kompiliert dieser Code mit 'strict: true'?",
    code:
      "class Animal {\n" +
      "  name: string;\n" +
      "  sound: string;\n" +
      "  constructor(name: string) {\n" +
      "    this.name = name;\n" +
      "  }\n" +
      "}",
    expectedAnswer: "Nein",
    acceptableAnswers: [
      "Nein", "nein", "Fehler", "Error", "Compile Error", "Compile-Error",
      "TS2564", "Nein, Fehler",
    ],
    explanation:
      "Mit strictPropertyInitialization (Teil von strict: true) muss JEDES Feld " +
      "initialisiert werden. 'sound' hat weder einen Default-Wert noch wird es " +
      "im Constructor zugewiesen und ist auch nicht optional (?) — " +
      "daher meldet TypeScript TS2564.",
  },

  // --- Frage 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum empfehlen viele TypeScript-Experten, Arrow-Functions statt " +
      "normaler Methoden in Klassen zu verwenden, wenn die Methode als " +
      "Callback uebergeben wird? Welchen Nachteil hat das?",
    modelAnswer:
      "Arrow-Functions binden 'this' lexikalisch an die Klassen-Instanz, " +
      "sodass der Kontext auch beim Extrahieren erhalten bleibt. " +
      "Der Nachteil: Arrow-Properties werden pro Instanz erstellt " +
      "(nicht auf dem Prototype), was bei vielen Instanzen mehr Speicher " +
      "verbraucht und nicht ueberschrieben werden kann.",
    keyPoints: [
      "Lexikalisches this-Binding",
      "Kein Kontextverlust bei Callbacks",
      "Pro Instanz statt auf Prototype",
      "Mehr Speicherverbrauch",
    ],
  },
];
