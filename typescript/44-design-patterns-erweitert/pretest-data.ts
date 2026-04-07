/**
 * Lektion 44 — Pre-Test-Fragen: Design Patterns Erweitert
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
 * Werden VOR dem Lesen gestellt um das Gehirn zu primen.
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
  // ─── Sektion 1: Creational Patterns ────────────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Was ist das Problem das eine Factory Method loest?",
    options: [
      "Ein Objekt erzeugen ohne zu wissen welche konkrete Klasse verwendet wird",
      "Sicherstellen dass nur eine Instanz einer Klasse existiert",
      "Mehrere Objekte hinter einer einfachen API verstecken",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Factory Method entkoppelt 'was erzeugt wird' von 'wer erzeugt'. " +
      "Der Aufrufer kennt nur das Interface — nie die konkrete Klasse.",
  },
  {
    sectionIndex: 1,
    question:
      "In welchem Jahr erschien das GoF-Buch 'Design Patterns' und welche Sprachen waren die Zielsprachen?",
    options: [
      "1994, Java und C++",
      "2000, Java und JavaScript",
      "1988, C und C++",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Das GoF-Buch erschien 1994 und adressierte Java und C++. " +
      "TypeScript war damals noch 18 Jahre entfernt.",
  },
  {
    sectionIndex: 1,
    question:
      "Warum ist das klassische Singleton-Pattern in Tests problematisch?",
    options: [
      "Es ist zu langsam fuer Unit-Tests",
      "Die globale Instanz behaelt Zustand zwischen Tests — Testreihenfolge beeinflusst Ergebnisse",
      "TypeScript unterstuetzt keine privaten Konstruktoren",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Globaler Zustand im Singleton bedeutet: Aenderungen in Test A beeinflussen Test B. " +
      "Tests werden reihenfolgeabhaengig und nicht-deterministisch.",
  },

  // ─── Sektion 2: Structural Patterns ────────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Dein Code erwartet `processPayment(request: PaymentRequest): Promise<PaymentResult>`. " +
      "Eine Legacy-Bibliothek hat `chargeCard(amount: number, card: string): { success: boolean }`. " +
      "Welches Pattern verbindet beide?",
    options: [
      "Adapter — uebersetzt das alte Interface in das neue",
      "Facade — versteckt beide hinter einer einfacheren API",
      "Strategy — tauscht die Zahlungsmethode aus",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Adapter = Schnittstellenanpassung. Du implementierst `PaymentService` " +
      "und delegierst intern an das Legacy-System.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist der Unterschied zwischen Adapter und Facade?",
    options: [
      "Adapter passt ein bestehendes Interface an — Facade erstellt ein neues, vereinfachtes Interface",
      "Facade passt ein bestehendes Interface an — Adapter erstellt ein neues Interface",
      "Beide loesen dasselbe Problem, nur mit unterschiedlichen Namen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Adapter: Ein inkompatibles Interface anpassen. Facade: Komplexitaet eines " +
      "Subsystems hinter einer einfachen Tuer verstecken.",
  },
  {
    sectionIndex: 2,
    question:
      "Angular's HTTP Interceptors sind ein Beispiel fuer welches Pattern?",
    options: [
      "Factory — sie erzeugen neue HTTP-Requests",
      "Proxy oder Decorator — sie setzen sich transparent vor den echten HTTP-Call",
      "Observer — sie beobachten HTTP-Ereignisse",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ein HTTP Interceptor faengt Requests ab, transformiert sie (z.B. Authorization-Header) " +
      "und leitet sie weiter — wie ein Proxy, der transparent wirkt.",
  },

  // ─── Sektion 3: Behavioral Patterns ────────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "Du hast eine Klasse `EmailValidator` mit `validate(email: string): boolean`. " +
      "Spaeter brauchst du `PasswordValidator` und `IBANValidator`. " +
      "Welches Pattern abstrahiert das korrekt?",
    options: [
      "Strategy — jede Validierungsregel ist eine austauschbare Strategie",
      "Observer — jede Validierung beobachtet das Input-Feld",
      "Command — jede Validierung ist ein ausfuehrbarer Befehl",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Strategy kapselt auswechselbare Algorithmen. Ein `ValidationStrategy<T>`-Interface " +
      "erlaubt beliebig viele Validierungsregeln ohne den aufrufenden Code zu aendern.",
  },
  {
    sectionIndex: 3,
    question:
      "Warum gibt `bus.on('user:login', listener)` eine Funktion zurueck?",
    code: "const unsubscribe = bus.on('user:login', ({ userId }) => console.log(userId));",
    options: [
      "Weil TypeScript Funktionen als Rueckgabewert fordert",
      "Als Cleanup-Funktion: Der Listener kann spaeter entfernt werden ohne separates off()-Methode",
      "Weil EventBus immer Promises zurueckgibt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Das Unsubscribe-Pattern: `on()` gibt eine Funktion zurueck die beim Aufruf " +
      "den Listener entfernt. Kein separates `bus.off(event, listener)` noetig.",
  },
  {
    sectionIndex: 3,
    question:
      "Welche NgRx-Konzepte entsprechen dem Command Pattern?",
    options: [
      "Effects — sie fuehren Seiteneffekte aus",
      "Actions — sie kapseln Absichten als unveraenderliche Objekte",
      "Selectors — sie lesen Zustand aus dem Store",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "NgRx Actions sind Commands: unveraenderliche Objekte die eine Absicht beschreiben. " +
      "Der Reducer ist der Command-Executor. Time-Travel-Debugging entsteht durch " +
      "Replay aller gespeicherten Actions.",
  },

  // ─── Sektion 4: Repository Pattern ─────────────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Was ist der Kernvorteil eines Repository-Interfaces gegenueber direktem HttpClient-Zugriff im Service?",
    options: [
      "Repository-Interfaces sind schneller weil sie keinen HTTP-Overhead haben",
      "Die Businesslogik kann die Repository-Implementierung austauschen — HTTP gegen InMemory fuer Tests",
      "Angular's HttpClient kann kein Interface implementieren",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Das Repository-Interface trennt 'was gemacht wird' von 'wie es gemacht wird'. " +
      "In Tests: InMemoryRepository. In Produktion: HttpRepository. " +
      "Der Service-Code aendert sich nie.",
  },
  {
    sectionIndex: 4,
    question:
      "Warum gibt `findById()` im Repository-Interface `Promise<TEntity | null>` zurueck statt eine Exception zu werfen?",
    options: [
      "Weil async Funktionen keine Exceptions werfen koennen",
      "Weil TypeScript keine Exceptions in generischen Typen unterstuetzt",
      "Weil 'nicht gefunden' ein normaler Fall ist — null ist expliziter und sicherer als Exception",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "'Nicht gefunden' ist kein Fehler — es ist ein normaler Zustand. " +
      "null zwingt den Aufrufer zur expliziten Behandlung: `if (user === null) { ... }`. " +
      "Eine Exception waere fuer unerwartete Fehler (Netzwerkausfall, DB-Fehler).",
  },
  {
    sectionIndex: 4,
    question:
      "Was macht `Partial<TEntity>` als Typ fuer den `filter`-Parameter in `findAll(filter?: Partial<TEntity>)`?",
    options: [
      "Es erlaubt nur die Haelfte der Properties",
      "Es schraenkt TEntity auf primitive Typen ein",
      "Alle Properties von TEntity werden optional — man kann nach beliebig vielen Feldern filtern",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "`Partial<T>` macht alle Properties von T optional (Fragezeichen). " +
      "Damit kann der Filter 0 bis alle Properties enthalten — flexibel ohne Overloads.",
  },

  // ─── Sektion 5: SOLID mit TypeScript ────────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "Was verletzt eine Klasse `UserService` die sowohl Authentifizierung als auch E-Mail-Versand als auch Datenbankzugriff enthaelt?",
    options: [
      "Open/Closed Principle — sie ist geschlossen fuer Erweiterung",
      "Ich weiss es nicht",
      "Liskov Substitution Principle — sie erbt falsch",
      "Single Responsibility Principle — sie hat drei Gruende zur Aenderung",
    ],
    correct: 3,
    briefExplanation:
      "SRP: Eine Klasse soll genau einen Grund zur Aenderung haben. " +
      "Auth-Aenderung, E-Mail-Template-Aenderung und DB-Schema-Aenderung sind drei " +
      "verschiedene Gruende — drei Verantwortlichkeiten.",
  },
  {
    sectionIndex: 5,
    question:
      "Welches SOLID-Prinzip macht es moeglich, neue Zahlungsmethoden hinzuzufuegen ohne die `OrderCalculator`-Klasse zu aendern?",
    options: [
      "Single Responsibility — jede Klasse hat eine Verantwortung",
      "Ich weiss es nicht",
      "Dependency Inversion — OrderCalculator haengt von einer Abstraktion ab",
      "Open/Closed — offen fuer Erweiterung durch neue Implementierungen, geschlossen fuer Modifikation",
    ],
    correct: 3,
    briefExplanation:
      "Open/Closed: Neue `DiscountStrategy`-Implementierungen erweitern das System " +
      "ohne `OrderCalculator` zu aendern. Der Calculator iteriert ueber Strategien — " +
      "er weiss nicht welche es sind.",
  },
  {
    sectionIndex: 5,
    question:
      "Warum ist `inject(DATABASE_TOKEN)` in Angular besser als `inject(PostgresDatabase)`?",
    options: [
      "Weil PostgresDatabase kein Injectable ist",
      "Weil InjectionToken schneller als Klassen-Injection ist",
      "Weil der Service von einer Abstraktion abhaengt — in Tests kann ein anderer Provider registriert werden",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Dependency Inversion: Haenge von Abstraktionen ab. Mit `InjectionToken<Database>` " +
      "ist der konkrete Typ austauschbar. In Tests: InMemoryDatabase. " +
      "In Produktion: PostgresDatabase. Der Service-Code aendert sich nie.",
  },

  // ─── Sektion 6: Wann kein Pattern ───────────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Was ist der Hauptkritikpunkt an 'Pattern-Fetishismus' in der Softwareentwicklung?",
    options: [
      "Patterns sind zu schwer zu lernen und verwirren Juniorentwickler",
      "Ich weiss es nicht",
      "Patterns funktionieren nur in Java und C++, nicht in TypeScript",
      "Abstraktion hat Kosten — ueber-abstrahierter Code loest Probleme die nicht existieren",
    ],
    correct: 3,
    briefExplanation:
      "Jede Abstraktion erhoehe Komplexitaet. Wenn die Abstraktion kein echtes Problem loest, " +
      "ist sie reiner Overhead. DHH: 'Test-Induced Design Damage' — " +
      "Code fuer Maschinen optimiert, nicht fuer Menschen.",
  },
  {
    sectionIndex: 6,
    question:
      "Wann lohnt sich laut 'Rule of Three' eine Abstraktion?",
    options: [
      "Sofort beim ersten Schreiben — vorausschauendes Design ist wichtig",
      "Beim zweiten fast-identischen Codeblock — Duplikation soll sofort beseitigt werden",
      "Beim dritten fast-identischen Codeblock — erst dann weiss man was wirklich wiederkehrt",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Rule of Three: Einmal direkt schreiben, zweites Mal bemerken (Duplikation), " +
      "drittes Mal abstrahieren. Fruehe Abstraktion trifft oft die falschen Annahmen.",
  },
  {
    sectionIndex: 6,
    question:
      "Welches Signal deutet darauf hin, dass ein Strategy Pattern jetzt sinnvoll ist?",
    options: [
      "Du hast eine Klasse mit mehr als 100 Zeilen Code geschrieben",
      "Ich weiss es nicht",
      "Du verwendest ein Interface das du nur einmal implementierst",
      "Du fuegst zum fuenften Mal eine neue if-else-Verzweigung in denselben Switch hinzu (Open/Closed-Verletzung)",
    ],
    correct: 3,
    briefExplanation:
      "Eine wachsende if-else- oder switch-Kaskade ist das Warnsignal fuer Open/Closed-Verletzungen. " +
      "Ab drei konkreten Faellen: Strategy Pattern erwaegen. " +
      "Ein Interface mit nur einer Implementierung ist YAGNI — nicht noetig.",
  },
];
