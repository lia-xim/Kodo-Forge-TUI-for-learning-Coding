// quiz-data.ts — L26: Advanced Patterns (Builder, State Machine, Phantom Types)
// 15 MC + 3 short-answer + 2 predict-output + 1 explain-why = 21 Fragen
// MC correct-Index Verteilung: 4x0, 4x1, 4x2, 3x3

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "26";
export const lessonTitle = "Advanced Patterns";

export const questions: QuizQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Multiple Choice (15 Fragen, correct: 0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Frage 1: Builder Pattern — correct: 0 ---
  {
    question: "Was ist der Hauptvorteil eines typsicheren Builders gegenueber einem klassischen Builder?",
    options: [
      "Pflichtfelder werden zur Compilezeit geprueft, nicht zur Laufzeit",
      "Er erzeugt schnelleren JavaScript-Code",
      "Er braucht weniger Speicher als ein klassischer Builder",
      "Er funktioniert nur mit Klassen, nicht mit Funktionen",
    ],
    correct: 0,
    explanation:
      "Der typsichere Builder nutzt Generics als 'Gedaechtnis' um zu tracken welche " +
      "Felder gesetzt wurden. build() wird erst verfuegbar wenn alle Pflichtfelder im " +
      "Generic-Set enthalten sind. Der klassische Builder prueft das nur zur Laufzeit.",
    elaboratedFeedback: {
      whyCorrect: "Generics akkumulieren Information: Jeder Methodenaufruf fuegt einen Typ zum Set hinzu. build() hat einen 'this'-Parameter der alle Pflichtfelder erfordert. Fehlt eines → Compile-Error.",
      commonMistake: "Viele denken, der Vorteil sei Performance. Nein — der gesamte Typ-Overhead verschwindet zur Laufzeit (Type Erasure). Der Vorteil ist rein Compile-Zeit-Sicherheit."
    }
  },

  // --- Frage 2: State Machine — correct: 0 ---
  {
    question: "Warum sind Boolean-Flags fuer Zustaende ein Antipattern?",
    options: [
      "n Booleans erzeugen 2^n Kombinationen, von denen die meisten ungueltig sind",
      "Booleans sind langsamer als Strings in JavaScript",
      "TypeScript kann Booleans nicht in switch-Statements verwenden",
      "Boolean-Flags brauchen mehr Speicher als Discriminated Unions",
    ],
    correct: 0,
    explanation:
      "4 Boolean-Flags = 16 Kombinationen. Typische Zustaende: idle, loading, success, error = 4. " +
      "12 von 16 Kombinationen sind ungueltig. Eine Discriminated Union erlaubt genau die 4 gueltigen.",
    elaboratedFeedback: {
      whyCorrect: "Das Problem ist kombinatorische Explosion: Jeder Boolean verdoppelt die Anzahl moeglicher Zustaende. Discriminated Unions modellieren genau die gueltigen Zustaende — keine mehr, keine weniger.",
      commonMistake: "Haeufiger Fehler: 'isLoading && isError' als gueltig betrachten. Loading UND Error gleichzeitig? Das ergibt keinen Sinn — aber Booleans erlauben es."
    }
  },

  // --- Frage 3: Phantom Types — correct: 0 ---
  {
    question: "Was passiert mit dem __phantom-Property eines Phantom Types zur Laufzeit?",
    options: [
      "Es existiert nicht — Type Erasure entfernt es komplett",
      "Es wird als undefined-Property gespeichert",
      "Es wird in ein Symbol konvertiert",
      "Es wird als Metadaten im Prototyp gespeichert",
    ],
    correct: 0,
    explanation:
      "Phantom Types nutzen TypeScript's Type Erasure als Feature: Das __phantom-Property " +
      "existiert nur im Typsystem, nicht zur Laufzeit. Kein Runtime-Overhead.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript entfernt alle Typ-Annotationen beim Kompilieren. Das __phantom-Property ist Teil der Typ-Definition, nicht des Werts. Zur Laufzeit ist ein Phantom<string, 'Email'> einfach ein normaler String.",
      commonMistake: "Manche denken, der Intersection-Typ (&) fuege tatsaechlich Properties zum Wert hinzu. Nein — & ist eine Typ-Operation, keine Wert-Operation."
    }
  },

  // --- Frage 4: Fluent API — correct: 0 ---
  {
    question: "Was ist der Vorteil von Step-Interfaces gegenueber einfachem 'return this' beim Method Chaining?",
    options: [
      "Step-Interfaces erzwingen die richtige Reihenfolge — unmoegliche Aufrufe existieren nicht im Typ",
      "Step-Interfaces sind schneller als 'return this'",
      "Step-Interfaces ermoeglichen Vererbung, 'return this' nicht",
      "Step-Interfaces sind der einzige Weg um Method Chaining zu implementieren",
    ],
    correct: 0,
    explanation:
      "Bei Step-Interfaces zeigt jeder Schritt nur die Methoden, die im aktuellen Zustand " +
      "erlaubt sind. IDE-Autocomplete zeigt nur gueltige naechste Schritte. Unmoegliche " +
      "Aufrufe sind kein Laufzeitfehler — sie existieren gar nicht im Typ.",
    elaboratedFeedback: {
      whyCorrect: "SelectStep hat nur select(). FromStep hat nur from(). WhereOrBuildStep hat where(), orderBy() und build(). Jeder Schritt gibt den naechsten Step-Typ zurueck — nicht 'this' mit allen Methoden.",
      commonMistake: "Viele denken, 'return this' reiche immer. Fuer interne APIs ja — aber fuer oeffentliche APIs sind Step-Interfaces wertvoller, weil die IDE dem Nutzer zeigt was als naechstes moeglich ist."
    }
  },

  // --- Frage 5: Newtype — correct: 1 ---
  {
    question: "Was ist ein 'Smart Constructor' im Newtype-Pattern?",
    options: [
      "Ein Konstruktor der automatisch Generics inferiert",
      "Eine Funktion die den Rohwert validiert und als Newtype zurueckgibt",
      "Ein TypeScript-Decorator der Klassen validiert",
      "Ein spezieller Compiler-Modus fuer Branded Types",
    ],
    correct: 1,
    explanation:
      "Ein Smart Constructor validiert den Rohwert und gibt ihn als Newtype zurueck. " +
      "Er ist der EINZIGE offizielle Weg den Newtype zu erstellen. Ohne Validierung " +
      "koennte man ungueltige Werte als Newtype casten.",
    elaboratedFeedback: {
      whyCorrect: "function UserId(raw: string): UserId { validate(raw); return raw as UserId; } — der Smart Constructor kapselt den unsicheren 'as'-Cast hinter einer Validierung. Andere Module verwenden nur den Smart Constructor.",
      commonMistake: "Viele umgehen den Smart Constructor mit 'as UserId' direkt im Code. Das unterwandert die Validierung. In Code Reviews sollte 'as BrandedType' ausserhalb von Smart Constructors abgelehnt werden."
    }
  },

  // --- Frage 6: Builder Generic — correct: 1 ---
  {
    question: "Welchen Startwert hat der Generic-Parameter 'Set' im typsicheren Builder?",
    options: [
      "string — der allgemeinste Typ",
      "never — nichts ist gesetzt",
      "unknown — alles ist moeglich",
      "void — leer",
    ],
    correct: 1,
    explanation:
      "'never' bedeutet: Die Menge der gesetzten Felder ist leer. Mit jedem Aufruf wird " +
      "ein Feld zum Set hinzugefuegt (Set | 'host'). Wenn Set alle Required-Felder enthaelt, " +
      "wird build() verfuegbar.",
    elaboratedFeedback: {
      whyCorrect: "never ist die leere Menge im Typsystem. 'never | \"host\"' = '\"host\"'. 'never | \"host\" | \"port\"' = '\"host\" | \"port\"'. So akkumuliert der Generic Typ die Information.",
      commonMistake: "Manche verwechseln never (leere Menge) mit unknown (Menge aller Werte). never | X = X, aber unknown | X = unknown. never ist der korrekte Startwert."
    }
  },

  // --- Frage 7: State Machine Transition — correct: 1 ---
  {
    question: "Wie verhindert man unmoegliche Zustandsuebergaenge zur Compilezeit?",
    options: [
      "Mit try/catch um jeden Uebergang",
      "Mit einer Typ-Level Transition Map die erlaubte Uebergaenge definiert",
      "Mit runtime assertions in jeder Methode",
      "Mit dem TypeScript-Decorator @ValidTransition",
    ],
    correct: 1,
    explanation:
      "Eine Transition Map als Typ definiert fuer jeden Zustand die erlaubten Folgezustaende. " +
      "Die transition()-Funktion akzeptiert nur Uebergaenge die in der Map definiert sind. " +
      "Alles andere ist ein Compile-Error.",
    elaboratedFeedback: {
      whyCorrect: "type Transitions = { idle: 'loading'; loading: 'success' | 'error' }. function transition<C extends keyof Transitions>(current: C, next: Transitions[C]). Der zweite Parameter ist auf erlaubte Werte beschraenkt.",
      commonMistake: "Viele implementieren Zustandsmaschinen nur mit Runtime-Checks: if (current !== 'loading') throw. Das verhindert den Bug nicht — es meldet ihn nur zur Laufzeit."
    }
  },

  // --- Frage 8: Phantom vs Branded — correct: 1 ---
  {
    question: "Was ist der Zusammenhang zwischen Branded Types (L24) und Phantom Types?",
    options: [
      "Sie sind voellig verschiedene Konzepte ohne Gemeinsamkeit",
      "Branded Types sind eine einfache Form von Phantom Types — das Brand existiert nur im Typ",
      "Phantom Types sind eine Erweiterung von Branded Types mit Laufzeit-Daten",
      "Branded Types funktionieren nur mit Klassen, Phantom Types mit Primitiven",
    ],
    correct: 1,
    explanation:
      "Das __brand-Property bei Branded Types existiert nur im Typ, nicht zur Laufzeit — " +
      "es ist ein 'Phantom'. Phantom Types verallgemeinern das Konzept: Jeder Typparameter " +
      "der keinen Laufzeit-Wert hat ist ein Phantom.",
    elaboratedFeedback: {
      whyCorrect: "type UserId = string & { __brand: 'UserId' }. Das __brand ist ein Phantom — es existiert zur Laufzeit nicht. Der einzige Unterschied: 'Phantom Type' ist der allgemeine Begriff, 'Branded Type' ist das spezifische TypeScript-Pattern.",
      commonMistake: "Manche denken, Branded Types haetten ein echtes __brand-Property. Nein — der Intersection-Typ (&) fuegt kein Property zum Wert hinzu. Es ist reine Typ-Information."
    }
  },

  // --- Frage 9: this-Rueckgabetyp — correct: 2 ---
  {
    question: "Warum ist 'this' als Rueckgabetyp besser als der Klassenname beim Method Chaining?",
    options: [
      "'this' ist schneller zur Laufzeit als der Klassenname",
      "'this' erlaubt den Zugriff auf private Methoden",
      "'this' ist polymorph — Subklassen geben ihren eigenen Typ zurueck",
      "'this' verhindert Circular Dependencies",
    ],
    correct: 2,
    explanation:
      "Wenn SubClass extends BaseClass, gibt 'this' in BaseClass-Methoden den " +
      "SubClass-Typ zurueck. Mit dem Klassennamen wuerde BaseClass zurueckgegeben " +
      "und SubClass-Methoden waeren nach dem Chaining 'unsichtbar'.",
    elaboratedFeedback: {
      whyCorrect: "class ExtendedBuilder extends QueryBuilder { limit(n: number): this { ... } }. Wenn select() 'this' zurueckgibt, ist der Typ nach select() = ExtendedBuilder — limit() ist verfuegbar. Mit QueryBuilder als Rueckgabetyp waere limit() weg.",
      commonMistake: "Viele denken, 'this' und der Klassenname seien dasselbe. In nicht-polymorphem Code sind sie es — aber sobald Vererbung ins Spiel kommt, macht 'this' den entscheidenden Unterschied."
    }
  },

  // --- Frage 10: Discriminated Union vs Boolean — correct: 2 ---
  {
    question: "Was ist der Typ-Level-Vorteil einer Discriminated Union gegenueber Boolean-Flags fuer State?",
    options: [
      "Discriminated Unions brauchen weniger Speicher",
      "Discriminated Unions sind schneller in switch-Statements",
      "Zustandsspezifische Daten sind nur im passenden Zustand zugaenglich",
      "Discriminated Unions verhindern Race Conditions",
    ],
    correct: 2,
    explanation:
      "Bei { status: 'success'; data: T } weiss TypeScript: data existiert NUR wenn " +
      "status === 'success'. Bei Boolean-Flags muesste data immer T | null sein — " +
      "auch wenn isSuccess === true, weil TypeScript Booleans nicht korreliert.",
    elaboratedFeedback: {
      whyCorrect: "TypeScript kann switch(state.status) narrowen: Im case 'success' ist state.data garantiert T. Bei Booleans: if (state.isSuccess && state.data) — die Korrelation ist nicht im Typ kodiert.",
      commonMistake: "Manche glauben, if (isLoading) reiche als Narrowing. TypeScript narrowt isLoading auf true, aber korreliert das NICHT mit data oder error. Das ist das fundamentale Boolean-Problem."
    }
  },

  // --- Frage 11: unique symbol — correct: 2 ---
  {
    question: "Warum verwendet man 'unique symbol' statt String-Literals als Brand bei Newtypes?",
    options: [
      "unique symbol ist schneller zur Laufzeit",
      "String-Literals koennen nicht als Typ-Parameter verwendet werden",
      "unique symbol ist garantiert einzigartig — keine Kollision zwischen Modulen moeglich",
      "unique symbol wird vom TypeScript-Compiler speziell optimiert",
    ],
    correct: 2,
    explanation:
      "Jedes 'declare const XBrand: unique symbol' erzeugt einen Typ der GARANTIERT " +
      "einzigartig ist — auch wenn zwei Module den gleichen Namen verwenden. " +
      "String-Literals wie '__brand: \"UserId\"' koennten theoretisch kollidieren.",
    elaboratedFeedback: {
      whyCorrect: "unique symbol ist ein Typ der nur mit sich selbst identisch ist. Zwei verschiedene 'unique symbol'-Deklarationen sind VERSCHIEDENE Typen, auch wenn sie den gleichen Variablennamen haben. String-Brands koennten in grossen Monorepos kollidieren.",
      commonMistake: "Fuer kleine Projekte reichen String-Brands voellig aus. unique symbol lohnt sich erst bei grossen Codebases oder wenn Module von verschiedenen Teams stammen."
    }
  },

  // --- Frage 12: Over-Engineering — correct: 2 ---
  {
    question: "Wann ist ein typsicherer Builder Over-Engineering?",
    options: [
      "Wenn das Objekt mehr als 10 Felder hat",
      "Wenn der Builder in einer Bibliothek verwendet wird",
      "Wenn das Objekt nur 3-4 Felder hat und alle Pflicht sind",
      "Wenn TypeScript 5.0 oder neuer verwendet wird",
    ],
    correct: 2,
    explanation:
      "Bei wenigen Pflichtfeldern reicht ein einfaches Interface. Der Builder lohnt sich " +
      "erst ab 5+ Feldern mit Mix aus Pflicht und Optional, oder bei schrittweisem Aufbau. " +
      "Ein einfaches 'createConfig({ host, port, ssl })' ist klarer als ein Builder.",
    elaboratedFeedback: {
      whyCorrect: "Die pragmatische Regel: Wenn ein Objekt-Literal mit Typ-Annotation klar und lesbar ist, braucht man keinen Builder. Builder lohnen sich bei komplexer Validierung, vielen optionalen Feldern, oder wenn die Reihenfolge wichtig ist.",
      commonMistake: "Manche setzen Builder ueberall ein weil sie das Pattern cool finden. Das fuehrt zu unnoetigem Code. KISS (Keep It Simple) gilt auch bei Typ-Patterns."
    }
  },

  // --- Frage 13: Transition Map — correct: 3 ---
  {
    question: "Was repraesentiert 'never' als Wert in einer Transition Map?",
    options: [
      "Ein Fehler in der Typ-Definition",
      "Einen Zustand der uebersprungen werden kann",
      "Einen Reset zum Anfangszustand",
      "Einen Endzustand — kein Uebergang moeglich",
    ],
    correct: 3,
    explanation:
      "In einer Transition Map wie { submitted: never } bedeutet 'never': Es gibt " +
      "KEINEN erlaubten Folgezustand. Das ist ein Endzustand — die State Machine " +
      "kann hier nicht weitergehen. Compile-Error bei jedem transition()-Aufruf.",
    elaboratedFeedback: {
      whyCorrect: "transition('submitted', ???) — der zweite Parameter muesste 'never' sein, aber kein Wert hat den Typ 'never'. Deshalb ist der Aufruf unmoglich — genau richtig fuer einen Endzustand.",
      commonMistake: "Manche verwenden 'void' oder '' (leerer String) als Endzustand-Marker. Das ist falsch — void und '' sind gueltige Typen. Nur 'never' ist wirklich unmoglich."
    }
  },

  // --- Frage 14: Opaque Types — correct: 3 ---
  {
    question: "Was ist ein Opaque Type in TypeScript?",
    options: [
      "Ein Typ der nur in generischen Funktionen verwendet werden kann",
      "Ein Typ der automatisch von TypeScript inferiert wird",
      "Ein Typ mit Laufzeit-Validierung durch den Compiler",
      "Ein Newtype dessen interne Struktur nur innerhalb eines Moduls bekannt ist",
    ],
    correct: 3,
    explanation:
      "Ein Opaque Type exportiert den Typ, aber nicht die Moeglichkeit ihn zu erstellen. " +
      "Andere Module koennen UserId verwenden, aber nur das user-id-Modul kann " +
      "UserId-Werte erstellen (via Smart Constructor).",
    elaboratedFeedback: {
      whyCorrect: "Das Modul exportiert: type UserId und function createUserId(). Es exportiert NICHT den Brand oder den 'as'-Cast. Andere Module muessen den Smart Constructor verwenden — sie koennen keine UserId 'faelschen'.",
      commonMistake: "Technisch kann man 'as UserId' auch in anderen Modulen schreiben. Opaque Types sind eine Konvention, kein harter Compiler-Schutz. Code Reviews und Linting-Regeln erzwingen die Konvention."
    }
  },

  // --- Frage 15: Pattern-Wahl — correct: 3 ---
  {
    question: "Welche Pattern-Kombination deckt 90% der Anwendungsfaelle in Angular/React-Projekten ab?",
    options: [
      "Builder + Fluent API",
      "Phantom Types + Newtype",
      "State Machine + Fluent API",
      "Branded Types + Discriminated Unions",
    ],
    correct: 3,
    explanation:
      "Branded Types fuer Entity-IDs und Discriminated Unions fuer State Management " +
      "decken die meisten Faelle ab. Builder, Phantom Types und Newtypes sind fuer " +
      "spezielle Situationen — nicht fuer den Alltag.",
    elaboratedFeedback: {
      whyCorrect: "In typischen Angular/React-Apps: UserId/OrderId als Branded Types verhindern ID-Verwechslungen. LoadState<T> als Discriminated Union verhindert unmoegliche Zustaende. Das reicht fuer die meisten Services und Components.",
      commonMistake: "Manche denken, fortgeschrittene Patterns muesse man ueberall einsetzen. Nein — sie sind Werkzeuge fuer spezielle Probleme. 'When all you have is a hammer...' gilt auch fuer Typ-Patterns."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Short-Answer (3 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "short-answer",
    question: "Wie heisst das Prinzip 'Unmoegliche Zustaende sollen vom Typsystem verhindert werden'?",
    expectedAnswer: "Make impossible states impossible",
    acceptableAnswers: ["Make impossible states impossible", "make impossible states impossible", "impossible states impossible"],
    explanation:
      "'Make impossible states impossible' ist ein Designprinzip aus der funktionalen Programmierung. " +
      "Statt unmoegliche Zustaende zur Laufzeit zu pruefen, modelliert man den Typ so, dass sie gar nicht " +
      "ausgedrueckt werden koennen.",
  },

  {
    type: "short-answer",
    question: "Welchen Typ hat ein Generic-Parameter als Startwert wenn 'nichts gesetzt' ausdruecken soll?",
    expectedAnswer: "never",
    acceptableAnswers: ["never", "Never"],
    explanation:
      "'never' ist die leere Menge im Typsystem — kein Wert gehoert dazu. Als Startwert " +
      "fuer akkumulierende Generics ist never ideal: never | 'host' = 'host'. So waechst " +
      "die Menge mit jedem Methodenaufruf.",
  },

  {
    type: "short-answer",
    question: "Wie heisst ein Typparameter der im Wert nicht vorkommt, aber im Typ existiert?",
    expectedAnswer: "Phantom Type",
    acceptableAnswers: ["Phantom Type", "phantom type", "Phantom", "phantom"],
    explanation:
      "Ein Phantom Type ist ein Typparameter der im Wert nicht auftaucht. In TypeScript " +
      "braucht man ein __phantom-Property als 'Anker', weil das strukturelle Typsystem " +
      "ungenutzte Parameter sonst ignorieren wuerde.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Predict-Output (2 Fragen)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "predict-output",
    question: "Kompiliert dieser Code? Antworte mit 'Ja' oder 'Nein' und begruende kurz.",
    code:
      "type Transitions = { idle: 'loading'; loading: 'success' | 'error'; success: 'idle'; error: 'idle' | 'loading' };\n" +
      "function go<C extends keyof Transitions>(c: C, n: Transitions[C]): void {}\n" +
      "go('idle', 'success');",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "No", "no", "Compile-Error", "Fehler"],
    explanation:
      "Transitions['idle'] = 'loading'. Der zweite Parameter muss 'loading' sein, " +
      "nicht 'success'. TypeScript meldet: '\"success\"' is not assignable to '\"loading\"'.",
  },

  {
    type: "predict-output",
    question: "Welchen Typ hat 'result' nach diesem Aufruf?",
    code:
      "class Builder<Set extends string = never> {\n" +
      "  host(): Builder<Set | 'host'> { return this as any; }\n" +
      "  port(): Builder<Set | 'port'> { return this as any; }\n" +
      "}\n" +
      "const result = new Builder().host().port();",
    expectedAnswer: "Builder<'host' | 'port'>",
    acceptableAnswers: [
      "Builder<'host' | 'port'>",
      "Builder<\"host\" | \"port\">",
      "Builder<'port' | 'host'>",
      "Builder<\"port\" | \"host\">",
    ],
    explanation:
      "Start: Builder<never>. Nach host(): Builder<never | 'host'> = Builder<'host'>. " +
      "Nach port(): Builder<'host' | 'port'>. Der Generic akkumuliert die gesetzten Felder.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Explain-Why (1 Frage)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: "explain-why",
    question:
      "Warum haben alle 5 Patterns dieser Lektion (Builder, State Machine, Phantom Types, " +
      "Fluent API, Newtype) null Laufzeit-Overhead?",
    modelAnswer:
      "Alle 5 Patterns nutzen TypeScript's Type Erasure: Die gesamte Typ-Information wird " +
      "beim Kompilieren entfernt. Branded Types, Phantom Types und Newtypes haben keine " +
      "Laufzeit-Repraesentaiton — zur Laufzeit sind sie normale string/number-Werte. " +
      "Builder-Generics und State-Machine-Typen existieren nur im Typsystem. Der Compiler " +
      "prueft die Korrektheit, aber der generierte JavaScript-Code ist identisch mit Code " +
      "ohne diese Patterns.",
    keyPoints: [
      "Type Erasure: Alle Typen werden beim Kompilieren entfernt",
      "Branded/Phantom/Newtype: Zur Laufzeit normale Primitive (string, number)",
      "Builder-Generics: Existieren nur im Typsystem, nicht im JavaScript",
      "Compile-Zeit-Pruefung ohne Runtime-Kosten ist TypeScript's Staerke",
    ],
  },
];

// ─── Elaborated Feedback (fuer MC-Fragen ohne inline elaboratedFeedback) ────
// Alle MC-Fragen haben bereits elaboratedFeedback inline.
