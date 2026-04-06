/**
 * Lektion 43 — Quiz-Daten: TypeScript mit RxJS
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=2, 1=2, 2=2, 3=2 (MC), dann SA/PO/EW
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "43";
export const lessonTitle = "TypeScript mit RxJS";

export const questions: QuizQuestion[] = [
  // --- Frage 1: OperatorFunction (correct: 0) ---
  {
    question:
      "Was ist der Rueckgabetyp von `map(user => user.email)` wenn `user: User` ist?",
    options: [
      "OperatorFunction<User, string> — eine Funktion von Observable<User> zu Observable<string>",
      "Observable<string> — map gibt direkt ein Observable zurueck",
      "string — der Typ des emittierten Wertes",
      "OperatorFunction<string, User> — die Reihenfolge ist umgekehrt",
    ],
    correct: 0,
    explanation:
      "map(fn) gibt NICHT Observable<R> zurueck, sondern OperatorFunction<T, R> — " +
      "eine Funktion die Observable<T> nimmt und Observable<R> zurueckgibt. " +
      "Erst .pipe() wendet den Operator auf das vorherige Observable an.",
    elaboratedFeedback: {
      whyCorrect:
        "map ist eine Higher-Order Function: Sie nimmt eine Projektion und gibt eine " +
        "Funktion zurueck die Observables transformiert. Das ermoeglicht die elegante " +
        "Pipe-Komposition: Jeder Operator ist unabhaengig und kombinierbar.",
      commonMistake:
        "Viele denken, map gibt Observable<string> zurueck. Das tut es erst wenn es " +
        "in .pipe() angewendet wird. Davor ist es eine unvollstaendige Transformation.",
    },
  },

  // --- Frage 2: BehaviorSubject-Initialwert (correct: 1) ---
  {
    question:
      "Warum ist `new BehaviorSubject<User | null>(null)` besser als `new BehaviorSubject<User>({} as User)`?",
    options: [
      "BehaviorSubject<User> erlaubt keinen Initialwert, nur BehaviorSubject<User | null>",
      "null ist semantisch korrekt ('kein User'), {} as User ist ein Cast der fehlende Felder verbirgt",
      "Der Union-Typ User | null hat eine bessere Performance",
      "TypeScript erlaubt {} as User nicht bei striktem Modus",
    ],
    correct: 1,
    explanation:
      "`{} as User` ist ein Type Cast der TypeScript beluegt: Das Objekt hat keine " +
      "User-Felder zur Laufzeit. `null` ist semantisch ehrlich: Kein User ist eingeloggt. " +
      "Der Union-Typ erzwingt null-Checks vor jedem Zugriff.",
    elaboratedFeedback: {
      whyCorrect:
        "Typen sollen die Realitaet modellieren. 'Kein User' ist nicht dasselbe wie " +
        "'ein User mit leeren Feldern'. null ist die korrekte Darstellung des Fehlens, " +
        "und TypeScript erzwingt dann ueberall `if (user !== null)` vor dem Zugriff.",
      commonMistake:
        "Viele vermeiden Union-Typen weil sie mehr null-Checks erfordern. Aber genau " +
        "das ist der Punkt: Die Checks stellen sicher, dass du nie aus Versehen " +
        "undefined.name aufrufst.",
    },
  },

  // --- Frage 3: filter mit Type Predicate (correct: 2) ---
  {
    question:
      "Was ist der Typ von `admin$` nach diesem Code?",
    code:
      "function isAdmin(user: User): user is Admin { return user.role === 'admin'; }\n" +
      "const admin$ = users$.pipe(filter(isAdmin));",
    options: [
      "Observable<User> — filter veraendert den Typ nie",
      "Observable<User | Admin> — der Typ wird erweitert",
      "Observable<Admin> — filter mit Type Predicate narrowt den Typ",
      "Observable<boolean> — filter gibt den Rueckgabetyp der Praedikat-Funktion zurueck",
    ],
    correct: 2,
    explanation:
      "Ein Type Predicate `user is Admin` sagt TypeScript: 'Wenn diese Funktion true " +
      "zurueckgibt, ist user vom Typ Admin.' RxJS nutzt das: filter mit einem Type " +
      "Predicate gibt OperatorFunction<T, S> zurueck (S ist der narrowed Typ).",
    elaboratedFeedback: {
      whyCorrect:
        "filter hat zwei Signaturen: Mit normalem boolean-Praedikat gibt es OperatorFunction<T, T>. " +
        "Mit einem Type Predicate `(v: T) => v is S` gibt es OperatorFunction<T, S>. " +
        "Das ist echtes Typ-Narrowing auf Stream-Ebene.",
      commonMistake:
        "Ohne Type Predicate (also `filter(u => u.role === 'admin')`) bleibt der Typ " +
        "Observable<User>. TypeScript kann aus einem boolean-Rueckgabetyp keine " +
        "Typ-Eingrenzung ableiten.",
    },
  },

  // --- Frage 4: combineLatest Tuple (correct: 3) ---
  {
    question:
      "Welchen Typ inferiert TypeScript fuer `combined$`?",
    code:
      "const a$ = of<string>('hallo');\n" +
      "const b$ = of<number>(42);\n" +
      "const combined$ = combineLatest([a$, b$]);",
    options: [
      "Observable<string | number> — Union aller Typen",
      "Observable<[string | number, string | number]> — homogenes Tuple",
      "Observable<Array<string | number>> — getyptes Array",
      "Observable<[string, number]> — praezises Tuple mit Positionstypen",
    ],
    correct: 3,
    explanation:
      "Dank TypeScript 4.0 Variadic Tuple Types inferiert combineLatest ein praezises " +
      "Tuple: Observable<[string, number]>. Position 0 ist immer string, Position 1 " +
      "immer number. Kein Union, kein homogenes Array.",
    elaboratedFeedback: {
      whyCorrect:
        "Variadic Tuple Types erlauben es TypeScript, Arrays fester Laenge mit " +
        "positionsabhaengigen Typen zu beschreiben. RxJS 7 nutzt das fuer alle " +
        "Kombinations-Operatoren. Das macht Destructuring vollstaendig typsicher.",
      commonMistake:
        "Vor TypeScript 4.0 / RxJS 7 war das tatsaechlich Observable<(string | number)[]>. " +
        "Das war kaum nutzbar. Die Verbesserung kam mit dem Upgrade beider Bibliotheken.",
    },
  },

  // --- Frage 5: toSignal ohne Optionen (correct: 0) ---
  {
    question:
      "Welchen Typ hat `user` in dieser Komponente?",
    code:
      "class Comp {\n" +
      "  user = toSignal(this.userService.currentUser$);\n" +
      "  // currentUser$: Observable<User>\n" +
      "}",
    options: [
      "Signal<User | undefined> — undefined bis zum ersten emittierten Wert",
      "Signal<User> — toSignal kennt den Typ des Observables",
      "Signal<User | null> — Angular initialisiert mit null",
      "WritableSignal<User | undefined> — Signals sind immer writable",
    ],
    correct: 0,
    explanation:
      "toSignal ohne Optionen gibt Signal<T | undefined> zurueck. Das 'undefined' " +
      "ist realistisch: Bevor das Observable emittiert, hat das Signal keinen Wert. " +
      "Mit `initialValue` oder `requireSync` aendert sich der Typ.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript modelliert die Semantik korrekt: Ein Signal aus einem asynchronen " +
        "Observable ist anfangs undefined. Wer das verbirgt (Signal<User>), luegt " +
        "ueber den Zustand und riskiert Laufzeitfehler.",
      commonMistake:
        "Viele wuenschen sich Signal<User> ohne undefined. Das geht nur mit " +
        "{ requireSync: true } — aber nur wenn das Observable synchron emittiert " +
        "(z.B. BehaviorSubject oder startWith).",
    },
  },

  // --- Frage 6: EMPTY-Typ (correct: 1) ---
  {
    question: "Warum kann `EMPTY` in `catchError` als Observable<User> zurueckgegeben werden?",
    options: [
      "Weil EMPTY intern ein Observable<any> ist",
      "Weil EMPTY den Typ Observable<never> hat und never Subtyp von jedem T ist",
      "Weil catchError den Typ ignoriert wenn EMPTY zurueckgegeben wird",
      "Weil User und never strukturell kompatibel sind",
    ],
    correct: 1,
    explanation:
      "EMPTY hat den Typ Observable<never>. never ist der Bottom-Type in TypeScript — " +
      "er ist Subtyp von jedem anderen Typ. Deshalb ist Observable<never> zuweisbar " +
      "an Observable<User>: EMPTY emittiert nie, also gibt es keinen Typ-Konflikt.",
    elaboratedFeedback: {
      whyCorrect:
        "Die Bottom-Type-Regel: never extends jeder Typ T. Das macht never zum " +
        "perfekten Typ fuer Dinge die nie passieren (Funktionen die nie zurueckkehren, " +
        "Observables die nie emittieren). EMPTY ist das Observable-Aequivalent zu einer " +
        "Funktion die wirft.",
      commonMistake:
        "Viele sind ueberrascht dass TypeScript EMPTY als Observable<User> akzeptiert. " +
        "Der Schluessels ist: Kein Wert wird emittiert, also kann kein Typ-Fehler auftreten.",
    },
  },

  // --- Frage 7: forkJoin Object-Syntax (correct: 2) ---
  {
    question: "Was ist der Hauptvorteil der Object-Syntax von forkJoin gegenuebaer der Array-Syntax?",
    options: [
      "Die Object-Syntax ist schneller weil TypeScript weniger inferieren muss",
      "Die Object-Syntax erlaubt mehr als 6 Observables (Array-Syntax ist limitiert)",
      "Benannte Properties statt Positions-Indices — TypeScript inferiert { user: User, posts: Post[] }",
      "Die Object-Syntax erlaubt verschiedene Fehlerbehandlung pro Observable",
    ],
    correct: 2,
    explanation:
      "forkJoin({ user: user$, posts: posts$ }) inferiert { user: User, posts: Post[] }. " +
      "Die Array-Syntax gibt [User, Post[]] zurueck — Positionen muessen gezaehlt werden. " +
      "Bei Umstrukturierung (neue Observable dazwischen) schiebt sich alles — gefaehrlich.",
    elaboratedFeedback: {
      whyCorrect:
        "Benannte Properties sind selbstdokumentierend und refactor-sicher. " +
        "Destructuring `{ user, posts }` ist klarer als `[user, posts]` bei mehreren Observables. " +
        "TypeScript inferiert den Objekt-Typ korrekt mit den Schluessel-Namen.",
      commonMistake:
        "Viele nutzen die Array-Syntax aus Gewohnheit von Promise.all. Bei 2 Observables " +
        "ist das fine. Bei 4+ empfiehlt sich die Object-Syntax fuer Lesbarkeit.",
    },
  },

  // --- Frage 8: RxJS 7 error: unknown (correct: 3) ---
  {
    question: "Warum ist `error: unknown` in catchError sicherer als `error: any`?",
    options: [
      "unknown ist schneller zu pruefen als any zur Laufzeit",
      "unknown verhindert Memory Leaks in Subscriptions",
      "unknown bedeutet dass der Fehler immer eine Error-Instanz ist",
      "unknown erzwingt Typ-Pruefung vor Property-Zugriff, any deaktiviert alle Pruefungen",
    ],
    correct: 3,
    explanation:
      "Mit `error: any` akzeptiert TypeScript `error.message`, `error.status` etc ohne Pruefung. " +
      "Mit `error: unknown` muss man erst `instanceof Error` pruefen. Das erzwingt " +
      "korrektes Fehler-Handling und verhindert Property-Zugriffe auf undefined.",
    elaboratedFeedback: {
      whyCorrect:
        "any deaktiviert das Typsystem komplett — jeder Property-Zugriff wird akzeptiert. " +
        "unknown belegt: 'Ich weiss nicht was das ist, pruef es zuerst.' " +
        "RxJS 7 und TypeScript 4.4 haben diese Aenderung synchron eingefuehrt.",
      commonMistake:
        "Manche casten error zu any: `(error as any).message`. Das ist das anti-pattern — " +
        "man umgeht die Sicherheit explizit. Besser: `instanceof`-Pruefung und dann sicherer Zugriff.",
    },
  },

  // ─── Short-Answer Fragen ─────────────────────────────────────────────────

  // --- Frage 9: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welches TypeScript-Feature (eingefuehrt in TS 4.0) ermoeglicht es, " +
      "dass combineLatest([a$, b$, c$]) den Typ Observable<[A, B, C]> inferiert " +
      "statt Observable<(A | B | C)[]>?",
    expectedAnswer: "Variadic Tuple Types",
    acceptableAnswers: [
      "Variadic Tuple Types", "variadic tuple types", "Variadic Tuples",
      "variadic tuples", "Variadic Tuple", "variadic tuple",
    ],
    explanation:
      "Variadic Tuple Types (TypeScript 4.0) erlauben es dem Compiler, Arrays " +
      "fester Laenge mit positionsabhaengigen Typen zu beschreiben. " +
      "RxJS 7 nutzt das in allen Kombinations-Operatoren.",
  },

  // --- Frage 10: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welche Option bei toSignal() muss angegeben werden damit der Rueckgabetyp " +
      "`Signal<T>` statt `Signal<T | undefined>` ist — bei einem Observable das " +
      "garantiert synchron seinen ersten Wert emittiert (z.B. BehaviorSubject)?",
    expectedAnswer: "requireSync",
    acceptableAnswers: [
      "requireSync", "requireSync: true", "{ requireSync: true }",
    ],
    explanation:
      "{ requireSync: true } sagt toSignal(): 'Das Observable emittiert synchron, " +
      "kein undefined als Startzustand.' Angular wirft einen Laufzeitfehler wenn " +
      "das Observable doch nicht synchron emittiert. Der Typ wird zu Signal<T>.",
  },

  // --- Frage 11: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welchen RxJS-Operator verwendest du um eine Subscription automatisch zu beenden " +
      "wenn eine Angular-Komponente zerstoert wird — ohne manuelles unsubscribe()?",
    expectedAnswer: "takeUntilDestroyed",
    acceptableAnswers: [
      "takeUntilDestroyed", "takeUntilDestroyed()", "takeUntilDestroyed(destroyRef)",
    ],
    explanation:
      "takeUntilDestroyed() (aus @angular/core/rxjs-interop) beendet die Subscription " +
      "automatisch wenn DestroyRef.onDestroy ausgeloest wird. Im Konstruktor-Kontext " +
      "findet es DestroyRef automatisch. Memory Leaks durch vergessenes unsubscribe werden vermieden.",
  },

  // ─── Predict-Output Fragen ───────────────────────────────────────────────

  // --- Frage 12: Predict-Output ---
  {
    type: "predict-output",
    question: "Welche Werte emittiert `result$` und in welcher Reihenfolge?",
    code:
      "import { zip, of } from 'rxjs';\n\n" +
      "const names$ = of('Alice', 'Bob', 'Charlie');\n" +
      "const scores$ = of(95, 87);\n\n" +
      "const result$ = zip(names$, scores$);\n" +
      "result$.subscribe(([name, score]) => console.log(`${name}: ${score}`));",
    expectedAnswer: "Alice: 95\nBob: 87",
    acceptableAnswers: [
      "Alice: 95\nBob: 87",
      "Alice: 95, Bob: 87",
      "[Alice, 95], [Bob, 87]",
      "Alice: 95 Bob: 87",
    ],
    explanation:
      "zip bildet strenge 1:1-Paare. Es nimmt jeweils einen Wert aus jedem Observable. " +
      "scores$ hat nur 2 Werte — nach dem zweiten Paar ist scores$ complete, also beendet " +
      "zip ebenfalls. Charlie bekommt kein Pendant und wird ignoriert.",
  },

  // --- Frage 13: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ hat `result` nach dem map-Operator?",
    code:
      "import { of } from 'rxjs';\n" +
      "import { map } from 'rxjs/operators';\n\n" +
      "const result$ = of({ name: 'Max', age: 30 }).pipe(\n" +
      "  map(user => ({\n" +
      "    display: `${user.name} (${user.age})`,\n" +
      "    isAdult: user.age >= 18,\n" +
      "  }))\n" +
      ");\n\n" +
      "// Typ von result$ ?",
    expectedAnswer: "Observable<{ display: string; isAdult: boolean }>",
    acceptableAnswers: [
      "Observable<{ display: string; isAdult: boolean }>",
      "Observable<{display: string; isAdult: boolean}>",
      "Observable<{ display: string, isAdult: boolean }>",
    ],
    explanation:
      "TypeScript inferiert den Objekt-Literal-Typ aus der map-Funktion. " +
      "Kein Interface notig: { display: string; isAdult: boolean } wird als Typ " +
      "des Objekt-Literals inferiert. Structural Typing in Aktion.",
  },

  // ─── Explain-Why Fragen ──────────────────────────────────────────────────

  // --- Frage 14: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Erklaere warum `filter(user => user.isActive)` in einer RxJS-Pipeline den Typ " +
      "Observable<User> NICHT aendert, aber `filter((user): user is Admin => user.role === 'admin')` " +
      "den Typ zu Observable<Admin> aendert. Was ist der technische Unterschied?",
    modelAnswer:
      "filter hat zwei Signaturen. Ohne Type Predicate: `filter(predicate: (v: T) => boolean)` " +
      "gibt OperatorFunction<T, T> zurueck — der Typ bleibt T. " +
      "Mit Type Predicate: `filter(predicate: (v: T) => v is S)` gibt OperatorFunction<T, S> zurueck. " +
      "Das Type Predicate `user is Admin` sagt TypeScript: 'Wenn diese Funktion true zurueckgibt, " +
      "weiss ich dass user vom Typ Admin ist.' TypeScript nutzt das um den Stream-Typ zu narrowen. " +
      "Ohne Predicate sieht TypeScript nur boolean und kann keine Typ-Eingrenzung ableiten.",
    keyPoints: [
      "filter hat zwei Signaturen (Overloads)",
      "boolean als Rueckgabe: Typ bleibt T",
      "Type Predicate `v is S`: Typ wird zu S genarrowt",
      "Type Predicates sind ein TypeScript-Compilezeit-Konzept",
      "Kein Laufzeit-Unterschied, nur unterschiedliche Typ-Signaturen",
    ],
  },

  // --- Frage 15: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Du baust einen Angular-Service der User-Daten laedt. Erklaere warum du die " +
      "Fehler in catchError als `unknown` behandeln solltest und nicht einfach " +
      "`error as HttpErrorResponse` casten solltest. Was kann schiefgehen?",
    modelAnswer:
      "Nicht jeder Fehler ist eine HttpErrorResponse. Moegliche Fehler-Typen: " +
      "HttpErrorResponse (HTTP-Fehler), TypeError (Netzwerkprobleme, null-Zugriffe), " +
      "SyntaxError (ungueltige JSON-Antwort), DOMException (CORS), oder sogar " +
      "primitive Typen wie string wenn throwError(() => 'Fehler') verwendet wurde. " +
      "Ein Cast `error as HttpErrorResponse` erlaubt TypeScript das ohne Pruefung — " +
      "aber zur Laufzeit kann error.status undefined sein wenn error kein HttpErrorResponse ist. " +
      "Das fuehrt zu schwer debuggbaren Fehlern. Die korrekte Loesung ist instanceof-Pruefung " +
      "die den Typ sicher narrowt.",
    keyPoints: [
      "Fehler koennen beliebige Typen sein — nicht nur HttpErrorResponse",
      "as-Cast luegt TypeScript an — kein Laufzeit-Schutz",
      "instanceof prueft zur Laufzeit und narrowt den Typ gleichzeitig",
      "RxJS 7 aenderte den Typ zu unknown um genau das zu erzwingen",
      "Jede Fehler-Art braucht eigene Behandlung",
    ],
  },
];
