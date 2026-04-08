/**
 * Lektion 44 — Quiz-Daten: Design Patterns Erweitert
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=4, 1=4, 2=4, 3=3
 * Fragen-Format-Mix: 7 MC, 4 short-answer, 2 predict-output, 2 explain-why
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "44";
export const lessonTitle = "Design Patterns Erweitert";

export const questions: QuizQuestion[] = [
  // ─── Multiple Choice ────────────────────────────────────────────────────────

  // --- Frage 1: Adapter Pattern (correct: 0) ---
  {
    question:
      "Wann setzt du das Adapter Pattern ein?",
    options: [
      "Wenn du ein inkompatibles Interface einer Drittanbieterbibliothek an dein eigenes Interface anpassen musst",
      "Wenn du mehrere Objekte hinter einer vereinfachten API verstecken willst — das Facade Pattern",
      "Wenn du auswechselbare Algorithmen fuer denselben Schritt kapseln willst — das Strategy Pattern",
      "Wenn du sicherstellen willst, dass eine Klasse nur einmal instanziiert wird — das Singleton Pattern",
    ],
    correct: 0,
    explanation:
      "Der Adapter brueckt zwei inkompatible Interfaces — typischerweise Legacy-Code oder " +
      "Drittanbieterbibliotheken. Er implementiert das neue Interface und delegiert intern " +
      "an das alte. Facade (Option 2), Strategy (3) und Singleton (4) loesen andere Probleme.",
    elaboratedFeedback: {
      whyCorrect:
        "Adapter = Schnittstellenanpassung. Du hast etwas das funktioniert (Legacy) und " +
        "etwas das du erwartest (neues Interface). Der Adapter uebersetzt zwischen beiden " +
        "ohne den Legacy-Code anzufassen.",
      commonMistake:
        "Viele verwechseln Adapter und Facade. Der Unterschied: Adapter passt eine " +
        "bestehende Klasse an ein erwartetes Interface an. Facade erstellt ein neues, " +
        "vereinfachtes Interface fuer ein gesamtes Subsystem.",
    },
  },

  // --- Frage 2: Strategy Pattern (correct: 1) ---
  {
    question:
      "Was ist der Hauptvorteil des Strategy Patterns gegenueber einer if-else-Kaskade?",
    options: [
      "Es ist schneller zur Laufzeit, weil keine Verzweigungen ausgefuehrt werden — der Strategy ruft direkt die Methode auf",
      "Neue Strategien koennen hinzugefuegt werden ohne bestehenden Code zu aendern (Open/Closed)",
      "Es erzeugt weniger Objekte im Heap und spart damit Speicher — die Strategie-Objekte werden gemeinsam genutzt",
      "Es funktioniert nur mit TypeScript-Interfaces, nicht mit abstrakten Klassen — es braucht strukturelle Typen",
    ],
    correct: 1,
    explanation:
      "Strategy implementiert das Open/Closed Prinzip: Du kannst neue Strategien hinzufuegen " +
      "indem du eine neue Klasse erstellst die das Interface implementiert — ohne den " +
      "aufrufenden Code zu aendern. Eine if-else-Kaskade muss bei jedem neuen Fall modifiziert werden.",
    elaboratedFeedback: {
      whyCorrect:
        "Jede neue Strategie ist eine neue Implementierung des Interfaces — kein bestehender " +
        "Code wird angefasst. Der Validator (oder OrderCalculator) weiss nichts von den " +
        "konkreten Strategien und muss bei Erweiterungen nicht geaendert werden.",
      commonMistake:
        "Option 1 ist falsch: Strategy erzeugt mehr Objekte (Delegation-Overhead), " +
        "nicht weniger. Der Vorteil ist Erweiterbarkeit, nicht Performance.",
    },
  },

  // --- Frage 3: Repository Pattern (correct: 2) ---
  {
    question:
      "Welchen konkreten Vorteil hat ein In-Memory-Repository in Tests gegenueber einem Mock?",
    options: [
      "In-Memory-Repositories sind schneller als Mocks, weil sie keinen Overhead haben und direkt auf Daten zugreifen",
      "Mocks koennen keine Interfaces implementieren — nur In-Memory-Repositories koennen das",
      "Das In-Memory-Repository ist eine echte Implementierung des Contracts — es testet auch die Interaktion mehrerer Methoden (z.B. save dann findById)",
      "In-Memory-Repositories brauchen kein TypeScript-Interface da sie duck-typed sind und automatisch kompatibel",
    ],
    correct: 2,
    explanation:
      "Ein Mock simuliert nur Rueckgabewerte. Ein In-Memory-Repository ist eine echte " +
      "Implementierung: save() speichert wirklich, findById() findet wirklich. " +
      "Du kannst also save() und dann findById() aufrufen — der Test prueft die echte Interaktion.",
    elaboratedFeedback: {
      whyCorrect:
        "Integration zwischen Methoden: Wenn du save({ id: '1', name: 'Max' }) aufrufst " +
        "und dann findById('1'), bekommst du das Objekt zurueck. Ein Mock wuerde " +
        "findById() unabhaengig vom save()-Aufruf simulieren.",
      commonMistake:
        "Mocks sind nicht schlechter — sie sind anders. Mocks sind ideal wenn du eine " +
        "spezifische Rueckgabe simulieren willst (z.B. HTTP-Fehler). " +
        "In-Memory ist besser fuer Integrations-Tests des Repositories selbst.",
    },
  },

  // --- Frage 4: SOLID — Liskov (correct: 3) ---
  {
    question:
      "Wie prueft TypeScript das Liskov Substitution Principle (L in SOLID) automatisch?",
    options: [
      "Durch Laufzeit-Checks die sicherstellen, dass Subklassen korrekt erben und alle Methoden ueberschreiben",
      "Durch den `extends`-Keyword der pruefte ob die Basisklasse korrekt implementiert wird",
      "Durch den `override`-Keyword der seit TypeScript 4.3 verfuegbar ist",
      "Durch `implements`: TypeScript prueft, dass alle Methoden mit korrekten Typen vorhanden sind — falsche Signaturen sind Compile-Fehler",
    ],
    correct: 3,
    explanation:
      "Wenn eine Klasse `Shape implements ShapeInterface` schreibt, prueft TypeScript " +
      "ob alle Methoden vorhanden sind und ob die Typen korrekt sind. Eine Methode " +
      "`area(): string` statt `area(): number` ist ein Compile-Fehler — Liskov verletzt.",
    elaboratedFeedback: {
      whyCorrect:
        "`implements` ist der Liskov-Check zur Compile-Zeit. Die Klasse deklariert: " +
        "'Ich bin ein Shape.' TypeScript prueft: 'Stimmst du tatsaechlich mit dem Shape-Contract ueberein?' " +
        "Wenn nicht: sofortiger Compile-Fehler, kein Laufzeit-Crash.",
      commonMistake:
        "`override` (Option 3) prueft ob eine Methode wirklich eine Basisklassen-Methode " +
        "ueberschreibt (kein versehentliches Hinzufuegen). Das ist ein anderes Konzept " +
        "als die Liskov-Konformitaet des gesamten Typs.",
    },
  },

  // --- Frage 5: Facade Pattern (correct: 0) ---
  {
    question:
      "Eine OrderFacade ruft intern CartService, PaymentService, InventoryService und NotificationService auf. " +
      "Welches Design-Prinzip verletzt sie, wenn sie gleichzeitig die Businesslogik enthaelt?",
    options: [
      "Single Responsibility — die Facade orchestriert UND entscheidet Businesslogik",
      "Open/Closed — die Facade ist geschlossen fuer Erweiterung und kann nicht modifiziert werden",
      "Liskov Substitution — weil die Facade kein Interface implementiert und somit nicht ersetzbar ist",
      "Interface Segregation — die Facade hat zu viele Methoden und verletzt das Prinzip der kleinen Interfaces",
    ],
    correct: 0,
    explanation:
      "Eine Facade soll *orchestrieren*, nicht *entscheiden*. Wenn sie Businesslogik " +
      "enthaelt (z.B. 'wenn Betrag > 500€, dann besonderen Rabatt berechnen'), hat sie " +
      "zwei Verantwortlichkeiten: Koordination UND Businessentscheidungen. " +
      "Das verletzt Single Responsibility.",
    elaboratedFeedback: {
      whyCorrect:
        "Die Facade-Verantwortung ist: Rufe die Services in der richtigen Reihenfolge auf " +
        "und behandle Fehler. Businessentscheidungen gehoeren in den jeweiligen Service " +
        "(z.B. DiscountService.calculateDiscount()).",
      commonMistake:
        "Option 4 (Interface Segregation) bezieht sich auf Interfaces, nicht auf die " +
        "Anzahl der Methoden einer Klasse. ISP sagt: Clients sollen nicht von Methoden " +
        "abhaengen die sie nicht verwenden — das betrifft Interface-Design.",
    },
  },

  // --- Frage 6: Command Pattern (correct: 1) ---
  {
    question:
      "Welches Feature des Command Patterns erklaert, warum NgRx 'Time-Travel Debugging' unterstuetzt?",
    options: [
      "Commands speichern alle Daten als unveraenderliche Snapshots im Arbeitsspeicher fuer spaeteren Zugriff",
      "Jede Action (Command) ist ein unveraenderliches Objekt — der gesamte Zustand entsteht durch Replay aller Commands von Anfang",
      "NgRx speichert automatisch alle Actions in einer Datenbank fuer spaetere Analyse und Debugging",
      "TypeScript-Generics erlauben es, Commands zur Compile-Zeit zu serialisieren und damit State zu persistieren",
    ],
    correct: 1,
    explanation:
      "Das Command-Pattern kapselt Aktionen als Objekte. NgRx-Actions sind immutable Commands. " +
      "Der gesamte Anwendungszustand entsteht durch `initialState + Actions[0..n]`. " +
      "Time-Travel: Spiele nur die ersten k Actions ab — du bist zur Zeit k.",
    elaboratedFeedback: {
      whyCorrect:
        "Redux/NgRx: `state = reducer(previousState, action)`. Wenn du alle Actions " +
        "gespeichert hast (Redux DevTools tun das), kannst du den State zu jedem Zeitpunkt " +
        "rekonstruieren. Das ist Time-Travel — und es funktioniert weil Commands (Actions) " +
        "unveraenderlich und serialisierbar sind.",
      commonMistake:
        "Option 1 klingt aehnlich, ist aber falsch: NgRx speichert nicht alle Zustaende, " +
        "sondern nur den aktuellen State + die Action-History. " +
        "Die Zustaende werden bei Bedarf neu berechnet.",
    },
  },

  // --- Frage 7: YAGNI und Rule of Three (correct: 2) ---
  {
    question:
      "Du schreibst zum zweiten Mal fast denselben HTTP-Fetch-Code. Was empfiehlt die 'Rule of Three'?",
    options: [
      "Sofort abstrahieren — bereits das zweite Mal zeigt, dass Duplikation entsteht und vermieden werden sollte",
      "Immer direkt schreiben — Abstraktionen erhoehen Komplexitaet ohne nachweisbaren Nutzen",
      "Warte auf das dritte Mal — erst dann weisst du, was wirklich wiederverwendet wird",
      "Abstrahiere wenn die Funktion mehr als 10 Zeilen hat — das ist der Schwellenwert fuer Wiederverwendung",
    ],
    correct: 2,
    explanation:
      "Die Rule of Three: Das erste Mal direkt schreiben. Das zweite Mal bemerken (Duplikation). " +
      "Das dritte Mal abstrahieren — jetzt weisst du, welche Teile wirklich variieren und " +
      "welche wirklich gleich sind. Zu fruehe Abstraktion trifft oft die falschen Annahmen.",
    elaboratedFeedback: {
      whyCorrect:
        "Beim zweiten Vorkommen weisst du noch nicht, ob die Abstraktion stimmt. " +
        "Vielleicht haben die zwei Stellen subtile Unterschiede, die du beim dritten Mal " +
        "erkennst. Die Abstraktion die du beim dritten Mal baust, ist fast immer besser " +
        "als die die du beim zweiten Mal gebaut haettest.",
      commonMistake:
        "Option 1 fuehrt zu Over-Engineering: Abstraktionen die fuer Anforderungen " +
        "gebaut wurden die nie eingetroffen sind. 'The wrong abstraction is worse " +
        "than duplication.' (Sandi Metz)",
    },
  },

  // ─── Short-Answer ────────────────────────────────────────────────────────────

  // --- Frage 8: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welches TypeScript-Keyword stellt sicher, dass eine Klasse alle Methoden eines Interfaces " +
      "mit den richtigen Typen implementiert — und erzeugt sonst einen Compile-Fehler?",
    expectedAnswer: "implements",
    acceptableAnswers: [
      "implements", "Implements",
    ],
    explanation:
      "`implements` ist der Liskov-Check zur Compile-Zeit. TypeScript prueft, dass alle " +
      "Methoden des Interfaces vorhanden sind und die Signaturen uebereinstimmen. " +
      "Fehlendes oder falsch typisiertes Methoden sind sofortige Compile-Fehler.",
  },

  // --- Frage 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welches Akronym steht fuer 'You Ain't Gonna Need It' — das Prinzip, keinen Code " +
      "fuer Anforderungen zu schreiben die noch nicht existieren?",
    expectedAnswer: "YAGNI",
    acceptableAnswers: [
      "YAGNI", "yagni", "Yagni",
    ],
    explanation:
      "YAGNI (You Ain't Gonna Need It) aus Extreme Programming: Schreibe keinen Code " +
      "fuer spekulative zukuenftige Anforderungen. Abstraktion kostet Komplexitaet — " +
      "das zahlt sich nur aus wenn die Anforderung wirklich kommt.",
  },

  // --- Frage 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst das generische TypeScript-Objekt (seit ES2015) das transparente " +
      "Kontrolle ueber Property-Zugriffe und -Setzungen eines anderen Objekts ermoeglicht?",
    expectedAnswer: "Proxy",
    acceptableAnswers: [
      "Proxy", "proxy", "new Proxy",
    ],
    explanation:
      "Das JavaScript-`Proxy`-Objekt fangen Property-Zugriffe (`get`), Setzungen (`set`) " +
      "und andere Operationen ab. TypeScript macht es mit Generics typsicher: " +
      "`new Proxy(target, handler)` gibt einen Typ T zurueck.",
  },

  // --- Frage 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Nenne den Namen des Patterns, das eine vereinfachte Schnittstelle fuer ein komplexes " +
      "Subsystem aus mehreren Services bereitstellt (ein Wort, englisch).",
    expectedAnswer: "Facade",
    acceptableAnswers: [
      "Facade", "facade", "Fassade", "fassade",
    ],
    explanation:
      "Das Facade Pattern (engl. 'Fassade') versteckt Subsystem-Komplexitaet hinter " +
      "einer einfachen API. `OrderFacade.placeOrder()` orchestriert intern Cart, Payment, " +
      "Inventory und Notification — der Controller sieht nur eine Methode.",
  },

  // ─── Predict-Output ─────────────────────────────────────────────────────────

  // --- Frage 12: Predict-Output ---
  {
    type: "predict-output",
    question: "Welcher TypeScript-Fehler entsteht hier? Nenne den Kernbegriff des Fehlers.",
    code:
      "interface Shape {\n" +
      "  area(): number;\n" +
      "}\n\n" +
      "class Square implements Shape {\n" +
      "  constructor(private side: number) {}\n" +
      "  area(): string {\n" +
      "    return `${this.side * this.side} qm`;\n" +
      "  }\n" +
      "}",
    expectedAnswer: "implements",
    acceptableAnswers: [
      "implements",
      "Property 'area' in type 'Square' is not assignable to the same property in base type 'Shape'",
      "Type 'string' is not assignable to type 'number'",
      "Rueckgabetyp string passt nicht zu number",
      "string is not assignable to number",
    ],
    explanation:
      "TypeScript meldet einen Fehler weil `area()` in der Shape-Interface `number` " +
      "zurueckgeben muss, Square aber `string` zurueckgibt. Der Fehler entsteht bei " +
      "`implements Shape` — TypeScript prueft die Signatur-Kompatibilitaet.",
  },

  // --- Frage 13: Predict-Output ---
  {
    type: "predict-output",
    question: "Was gibt dieser Code aus? (Genauer Wert)",
    code:
      "type EventMap = {\n" +
      "  'price:updated': { newPrice: number };\n" +
      "};\n\n" +
      "class Bus<E extends Record<string, unknown>> {\n" +
      "  private listeners = new Map<keyof E, Set<(d: unknown) => void>>();\n\n" +
      "  on<K extends keyof E>(event: K, fn: (d: E[K]) => void): void {\n" +
      "    if (!this.listeners.has(event)) this.listeners.set(event, new Set());\n" +
      "    this.listeners.get(event)!.add(fn as (d: unknown) => void);\n" +
      "  }\n\n" +
      "  emit<K extends keyof E>(event: K, data: E[K]): void {\n" +
      "    this.listeners.get(event)?.forEach(fn => fn(data));\n" +
      "  }\n" +
      "}\n\n" +
      "const bus = new Bus<EventMap>();\n" +
      "bus.on('price:updated', ({ newPrice }) => console.log(newPrice * 2));\n" +
      "bus.emit('price:updated', { newPrice: 21 });",
    expectedAnswer: "42",
    acceptableAnswers: ["42", "42\n"],
    explanation:
      "Der Listener multipliziert `newPrice * 2`. `newPrice` ist 21, also ist " +
      "die Ausgabe 42. TypeScript weiss zur Compile-Zeit: `{ newPrice: number }` — " +
      "`newPrice * 2` ist valid und gibt number zurueck.",
  },

  // ─── Explain-Why ────────────────────────────────────────────────────────────

  // --- Frage 14: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum loest Angular's `@Injectable({ providedIn: 'root' })` das Singleton-Problem " +
      "besser als das klassische Singleton-Pattern mit privatem Konstruktor und " +
      "`getInstance()`? Erklaere den Unterschied in der Testbarkeit.",
    modelAnswer:
      "Das klassische Singleton haelt die Instanz als static-Property der Klasse. " +
      "Diese Instanz ist global — in Tests bekommt jeder Testfall dieselbe Instanz, " +
      "und Zustandsaenderungen aus einem Test beeinflussen den naechsten. " +
      "Ausserdem kann man keine Mock-Instanz injizieren weil getInstance() immer " +
      "dieselbe Klasse zurueckgibt. " +
      "Angular's DI-Container verwaltet die Instanz extern. " +
      "In Tests registriert man einen anderen Provider: " +
      "TestBed.overrideProvider(MyService, { useClass: MockMyService }). " +
      "Jeder Test kann eine frische Instanz oder einen Mock bekommen. " +
      "Das Singleton-Verhalten (nur eine Instanz pro Anwendung) bleibt erhalten, " +
      "aber die Kontrolle liegt beim Container, nicht bei der Klasse selbst.",
    keyPoints: [
      "Klassisches Singleton: global, schwer zu mocken, Testreihenfolge-abhaengig",
      "Angular DI: Provider kann in Tests ueberschrieben werden",
      "TestBed.overrideProvider() ersetzt die Implementierung",
      "Instanz-Lebenszeit kontrolliert der Container, nicht die Klasse",
    ],
  },

  // --- Frage 15: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Das SOLID-Prinzip 'Dependency Inversion' (D) sagt: 'Haenge von Abstraktionen ab, " +
      "nicht von konkreten Implementierungen.' Erklaere anhand von Angular's " +
      "`InjectionToken` warum das direkte Injizieren einer konkreten Klasse " +
      "(`inject(PostgresDatabase)`) ein Problem ist, und wie ein Token das loest.",
    modelAnswer:
      "Wenn du `inject(PostgresDatabase)` schreibst, ist dein Service direkt an " +
      "PostgresDatabase gebunden. In Tests musst du eine echte PostgresDatabase " +
      "erzeugen oder jest.mock() verwenden um die Klasse zu ersetzen — beides ist fragil. " +
      "Ausserdem: Wenn du zu MySQL wechselst, musst du alle Services aendern die " +
      "PostgresDatabase direkt injizieren. " +
      "Mit InjectionToken definierst du eine Abstraktion: " +
      "const DATABASE = new InjectionToken<Database>('Database'). " +
      "Die Service-Klasse injiziert inject(DATABASE) und weiss nichts von Postgres oder MySQL. " +
      "Im Produktions-Modul registrierst du { provide: DATABASE, useClass: PostgresDatabase }. " +
      "Im Test-Modul registrierst du { provide: DATABASE, useClass: InMemoryDatabase }. " +
      "Der Service-Code aendert sich nie — nur die Registrierung im DI-Container.",
    keyPoints: [
      "Direkte Injektion bindet an konkrete Implementierung",
      "InjectionToken ist die Abstraktion (das Interface-Aequivalent in Angulars DI)",
      "Tests: provide: DATABASE, useClass: InMemoryDatabase",
      "Kein Code in der Service-Klasse aendert sich beim Austausch",
    ],
  },
];
