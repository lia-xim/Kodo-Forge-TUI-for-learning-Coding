/**
 * Lektion 42 — Pre-Test-Fragen: TypeScript Sicherheit
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
  // ─── Sektion 1: Das Sicherheits-Paradox ────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Du verwendest `this.http.get<User>('/api/me')` in Angular. " +
      "Welche Sicherheitsgarantie gibt dir TypeScript?",
    options: [
      "Keine — <User> ist ein Cast, die API-Antwort wird nicht validiert",
      "Die Antwort wird zur Laufzeit gegen das User-Interface geprueft",
      "TypeScript prueft die Struktur beim Deserialisieren des JSON",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "`<User>` ist ein Generic-Argument das den Compiler ueberzeugt — " +
      "kein Laufzeit-Check. Angular HttpClient castet blind. " +
      "Runtime-Validierung muss der Entwickler selbst schreiben.",
  },
  {
    sectionIndex: 1,
    question:
      "Was ist der Hauptunterschied zwischen 'typsicher' und 'sicher'?",
    options: [
      "Typsicher bedeutet korrekte Typen zur Compile-Zeit, sicher bedeutet Schutz vor Angriffen zur Laufzeit",
      "Beides bedeutet dasselbe — ein typsicheres Programm ist automatisch sicher",
      "Sicher ist ein Teilmenge von typsicher — alle sicheren Programme sind typsicher",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript gibt Compile-Zeit-Korrektheit. Sicherheit ist ein Laufzeit-Konzept: " +
      "Prototype Pollution, XSS, SQL-Injection passieren trotz perfekt typisiertem Code.",
  },
  {
    sectionIndex: 1,
    question:
      "Welche Datenquellen haben in TypeScript KEINE echten Runtime-Typen?",
    options: [
      "Nur JSON.parse-Ergebnisse",
      "API-Responses, JSON.parse, localStorage, URL-Parameter — alles Externe",
      "Nur selbst definierte Klassen-Instanzen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Alles was von aussen kommt (HTTP, Storage, URL) ist zur Laufzeit ungetyptes JavaScript. " +
      "TypeScript-Typen existieren nur zur Compile-Zeit. " +
      "Externe Daten brauchen Runtime-Validierung.",
  },

  // ─── Sektion 2: Gefaehrliche TypeScript-Muster ──────────────────────────

  {
    sectionIndex: 2,
    question:
      "Was passiert wenn du `const data = apiResponse as MyType` schreibst?",
    options: [
      "TypeScript prueft ob apiResponse tatsaechlich MyType ist",
      "Der Compiler ueberspringt alle Pruefungen und vertraut dir — kein Runtime-Check",
      "TypeScript fuehrt einen Typen-Konvertierung durch wie in Java",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "'as' ist ein Vertrauens-Statement, kein Pruef-Mechanismus. " +
      "TypeScript entfernt den Cast komplett zur Laufzeit. " +
      "apiResponse bleibt was es ist — nur der Compiler denkt es ist MyType.",
  },
  {
    sectionIndex: 2,
    question:
      "Warum ist der `!`-Operator (Non-null Assertion) gefahrlich?",
    options: [
      "Er macht den Wert zu null",
      "Er wirft eine Exception wenn der Wert null ist",
      "Er unterdruckt den Compile-Fehler ohne das Runtime-Problem zu loesen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "! entfernt nur den Compile-Fehler. Wenn der Wert zur Laufzeit wirklich " +
      "null/undefined ist, explodiert der Code mit TypeError. " +
      "Es ist ein 'ich verspreche dem Compiler' ohne echte Garantie.",
  },
  {
    sectionIndex: 2,
    question:
      "Warum ist `any` 'ansteckend'?",
    options: [
      "Weil any alle anderen Typen in einen Union umwandelt",
      "Weil Operationen auf any-Werten any zurueckgeben und sich so ausbreiten",
      "Weil any eine globale Variable setzt die andere Dateien beeinflusst",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`const x: any = ...; const y = x.property;` — y ist auch any. " +
      "any pflanzt sich durch jede Zuweisung und jeden Zugriff fort. " +
      "Ein any in einem Service kann die Typsicherheit des gesamten Moduls vernichten.",
  },

  // ─── Sektion 3: JavaScript-Fallen in TypeScript ─────────────────────────

  {
    sectionIndex: 3,
    question:
      "Wie kann `{ '__proto__': { isAdmin: true } }` in einer Angular-App Schaden anrichten?",
    options: [
      "Es setzt isAdmin auf dem spezifischen Objekt auf true",
      "Es setzt Object.prototype.isAdmin auf true — alle Objekte in der App erhalten diese Property",
      "Es loescht alle vorhandenen Properties des Zielobjekts",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Prototype Pollution vergiftet Object.prototype. " +
      "Da alle JavaScript-Objekte von Object.prototype erben, " +
      "haben danach ALLE Objekte isAdmin: true — auch Angular Guards und Services.",
  },
  {
    sectionIndex: 3,
    question:
      "Warum ist Angular's `{{ userInput }}` in Templates XSS-sicher, aber `innerHTML = userInput` nicht?",
    options: [
      "Template-Bindings sind gar nicht sicherer — beide sind gleichermassen gefaehrlich",
      "Angular escaped {{ }} automatisch zu HTML-Entities, innerHTML setzt rohen HTML",
      "innerHTML ist in TypeScript verboten",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Angulars Template-Renderer escaped < zu &lt;, > zu &gt; usw. " +
      "Script-Tags werden nie ausgefuehrt. innerHTML setzt dagegen rohen HTML " +
      "den der Browser sofort interpretiert — XSS-Angriff moeglich.",
  },
  {
    sectionIndex: 3,
    question:
      "Was ist ReDoS (Regular Expression Denial of Service)?",
    options: [
      "Ein Angriff bei dem boeswillige Strings exponentiell lange Regex-Ausfuehrungszeiten erzeugen",
      "Ein Angriff bei dem eine Regex den Browser zum Absturz bringt durch Arbeitsspeicher-Verbrauch",
      "Ein Angriff bei dem Regex-Muster aus dem Netzwerk injiziert werden",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Verschachtelte Quantifizierer wie `(a+)+` koennen exponentielles Backtracking erzeugen. " +
      "Ein Angreifer sendet einen String der den Regex-Motor haengen laesst. " +
      "Node.js ist single-threaded — ein blockierter Regex blockiert den gesamten Server.",
  },

  // ─── Sektion 4: Runtime-Validierung als Schutz ──────────────────────────

  {
    sectionIndex: 4,
    question:
      "Was macht `function isUser(v: unknown): v is User` anders als `function isUser(v: unknown): boolean`?",
    options: [
      "Das Type Predicate teilt TypeScript mit: 'Wenn true, dann ist v ein User im aufrufenden Code'",
      "Nichts — der Rueckgabetyp ist nur Dokumentation",
      "v is User fuehrt automatisch einen Cast durch",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Type Predicates (value is T) sind Narrowing-Informationen fuer den Compiler. " +
      "Nach `if (isUser(v))` weiss TypeScript im if-Zweig: v ist User. " +
      "Bei `: boolean` kein Narrowing — du musst trotzdem casten.",
  },
  {
    sectionIndex: 4,
    question:
      "Welche Validierungsstrategie ist besser: beim ersten Fehler abbrechen oder alle Fehler sammeln?",
    options: [
      "Alle Fehler sammeln — der Benutzer sieht alle Probleme auf einmal und kann sie beheben",
      "Beim ersten Fehler abbrechen — schneller und einfacher zu implementieren",
      "Beides ist gleichwertig — es kommt auf den Use Case an",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Alle Fehler auf einmal ist nutzerzentrierter. " +
      "Wenn ein Formular 3 Probleme hat, ist 'Korrigiere eins, submit, naechster Fehler' " +
      "frustrierend. Eine Liste aller Fehler erlaubt paralleles Beheben.",
  },
  {
    sectionIndex: 4,
    question:
      "Warum ist `const v = value as Record<string, unknown>` nach `typeof value === 'object'` sicher?",
    options: [
      "Weil Record<string, unknown> ein sehr allgemeiner Typ ist der alles erlaubt",
      "Weil TypeScript Record<string, unknown> nicht prueft",
      "Weil typeof-Check und null-Check zusammen beweisen: value ist ein Objekt mit Properties — der Cast spiegelt das wider",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Nach `typeof value === 'object' && value !== null` weiss TypeScript: " +
      "value ist ein JavaScript-Objekt. Record<string, unknown> ist das korrekte " +
      "TypeScript-Aequivalent fuer 'ein Objekt mit unbekannten Property-Werten'. " +
      "Der Cast spiegelt die bewiesene Invariante wider.",
  },

  // ─── Sektion 5: Parse, don't validate ─────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "Was ist der Kern des 'Parse, don't validate'-Prinzips von Alexis King?",
    options: [
      "Man soll keine boolean-Validierungsfunktionen schreiben",
      "Parsen ist schneller als Validieren",
      "Transformiere Eingaben direkt in typisierte Werte — das Ergebnis ist T oder Fehler, kein boolean",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Das Kernproblem bei isValid(x): boolean ist, dass das Wissen 'gueltig' " +
      "vom Objekt getrennt ist und verloren gehen kann. " +
      "Eine Parse-Funktion gibt entweder T oder Fehler zurueck — kein Zwischenzustand.",
  },
  {
    sectionIndex: 5,
    question:
      "Wie verbindet sich das Parse-Prinzip mit Branded Types aus Lektion 24?",
    options: [
      "Gar nicht — Branded Types sind ein separates Konzept",
      "Ich weiss es nicht",
      "Branded Types ersetzen Parser — man braucht keine Parse-Funktionen mehr",
      "Ein Smart Constructor parsiert einen primitiven Wert in einen Branded Type — das ist Parse in Reinform",
    ],
    correct: 3,
    briefExplanation:
      "Ein Smart Constructor wie `parseEmail(raw: string): Email` prueft Format, " +
      "und gibt bei Erfolg `raw as Email` zurueck — einen string mit eingebautem Beweis. " +
      "Das ist Parse: Eingabe transformiert zu typsicherem Branded-Wert.",
  },
  {
    sectionIndex: 5,
    question:
      "Was ist 'Parse at the boundary'?",
    options: [
      "Man soll in jeder Funktion validieren die externe Daten empfangt",
      "Ich weiss es nicht",
      "Boundary ist ein Design Pattern aus dem Domain-Driven Design",
      "Validierung findet einmal am Systemrand statt (API, Storage, URL) — danach gilt der Typ als bewiesen",
    ],
    correct: 3,
    briefExplanation:
      "Die boundary (Grenze) ist der Uebergang von aussen zu deinem System. " +
      "Dort parsest du einmal. Danach tragt der Typ die Garantie. " +
      "Tiefes Validieren im Domaenen-Code zeigt: Du vertraust dem eigenen Parse-Ergebnis nicht.",
  },

  // ─── Sektion 6: Security Checkliste und Code Review ───────────────────

  {
    sectionIndex: 6,
    question:
      "Welche der folgenden ist eine 'rote Flagge' beim TypeScript Code Review?",
    options: [
      "`type UserId = string & { readonly _brand: 'UserId' }`",
      "Ich weiss es nicht",
      "`function parseUser(v: unknown): User { /* ... */ }`",
      "`const config = JSON.parse(raw) as AppConfig`",
    ],
    correct: 3,
    briefExplanation:
      "`JSON.parse(raw) as AppConfig` ist gleich zwei rote Flaggen in einer Zeile: " +
      "JSON.parse ohne try-catch (kann werfen bei ungueltigem JSON) " +
      "und as ohne Validierung (Struktur wird nicht geprueft).",
  },
  {
    sectionIndex: 6,
    question:
      "Wann ist `DomSanitizer.bypassSecurityTrustHtml()` in Angular berechtigt?",
    options: [
      "Wenn der HTML-Inhalt vom Server kommt und dieser als vertrauenswuerdig gilt",
      "Wenn man DomSanitizer.sanitize() vorher aufgerufen hat",
      "Wenn der Inhalt von eigenem Code kontrolliert wird (z.B. eigener Markdown-Renderer)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "bypassSecurityTrust* ist legitim wenn DU den Inhalt erzeugst — " +
      "dein eigener Renderer, statische Strings, Server-seitig bereinigter Content. " +
      "Niemals mit direkter Nutzereingabe, auch nicht nach sanitize().",
  },
  {
    sectionIndex: 6,
    question:
      "Was koennen ESLint-Regeln bei der Sicherheit, was Code Review nicht kann?",
    options: [
      "ESLint versteht die Semantik des Codes besser als ein menschlicher Reviewer",
      "Ich weiss es nicht",
      "ESLint kann Sicherheitsluecken zur Laufzeit abfangen",
      "ESLint prueft konsistent jede Zeile ohne muede zu werden oder Ausnahmen zu machen",
    ],
    correct: 3,
    briefExplanation:
      "ESLint ist unmuedbar und konsistent — es prueft jede Zeile nach denselben Regeln. " +
      "Menschen uebersehen Dinge, machen Ausnahmen, werden abgelenkt. " +
      "ESLint ersetzt Review nicht, aber es ist das erste Sicherheitsnetz das nie schlaeft.",
  },
];
