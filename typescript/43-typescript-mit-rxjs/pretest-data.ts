/**
 * Lektion 43 — Pre-Test-Fragen: TypeScript mit RxJS
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen), die VOR dem Lesen gestellt werden.
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
  // ─── Sektion 1: RxJS und TypeScript — Warum das passt ───────────────────

  {
    sectionIndex: 1,
    question:
      "Was ist das mathematische Konzept hinter RxJS? Erik Meijer nannte es das 'Dual' von was?",
    options: [
      "Das Dual von Promises — async statt sync",
      "Das Dual von Iterables — push statt pull",
      "Das Dual von Arrays — lazy statt eager",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Iterables ziehen Werte (pull, du fragst an). Observables schieben Werte (push, " +
      "sie liefern aktiv). Das ist das mathematische Dual — nicht nur eine Metapher.",
  },
  {
    sectionIndex: 1,
    question:
      "Du schreibst `this.http.get('/api/users')` ohne Generic-Typ. Was ist das Problem?",
    options: [
      "Es gibt einen Compile-Fehler — Generic ist Pflicht",
      "Du bekommst Observable<Object> — alle Typ-Informationen in der Pipeline sind verloren",
      "TypeScript inferiert den Typ automatisch aus der API-Antwort",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ohne `<T>` gibt HttpClient.get() Observable<Object> zurueck. Jeder map(), filter() " +
      "danach arbeitet auf Object — kein Autocomplete, keine Typ-Pruefung.",
  },
  {
    sectionIndex: 1,
    question:
      "Was ist `OperatorFunction<T, R>` — der Kerntyp aller pipeablen Operatoren?",
    options: [
      "Eine Klasse die Observable<T> extended",
      "Eine Funktion die Observable<T> nimmt und Observable<R> zurueckgibt",
      "Ein Interface fuer Fehlerbehandlung",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>`. " +
      "Jeder Operator ist eine Funktion die Observables transformiert — und TypeScript " +
      "verfolgt T und R durch die gesamte .pipe() Kette.",
  },

  // ─── Sektion 2: Observable, Subject, BehaviorSubject ────────────────────

  {
    sectionIndex: 2,
    question:
      "Was ist der Unterschied zwischen Subject<T> und BehaviorSubject<T>?",
    options: [
      "Subject hat einen Initialwert, BehaviorSubject nicht",
      "BehaviorSubject hat einen Initialwert und speichert den letzten Wert — Subject nicht",
      "BehaviorSubject kann nur von einem Subscriber gehoert werden",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "BehaviorSubject braucht beim Erstellen einen Initialwert und speichert den letzten " +
      "Wert. Neue Subscriber bekommen ihn sofort. Subject hat keinen Zustand — " +
      "spaete Subscriber verpassen vergangene Werte.",
  },
  {
    sectionIndex: 2,
    question:
      "Warum gibt man in Angular-Services `subject.asObservable()` statt das Subject selbst zurueck?",
    options: [
      "asObservable() hat eine bessere Performance",
      "Damit externe Nutzer nicht next() aufrufen koennen — Kapselung des Schreibzugriffs",
      "TypeScript erlaubt keinen direkten Subject-Zugriff",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Subject ist sowohl Observable als auch Observer. Gibst du es zurueck, koennen " +
      "Konsumenten `.next()` aufrufen und den State direkt manipulieren. " +
      "asObservable() liefert nur die read-only Observable-Schnittstelle.",
  },
  {
    sectionIndex: 2,
    question:
      "Welcher Subject-Typ emittiert NUR den letzten Wert — und das erst wenn complete() aufgerufen wird?",
    options: [
      "BehaviorSubject",
      "ReplaySubject(1)",
      "AsyncSubject",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "AsyncSubject ist das Observable-Aequivalent zu Promise: Es emittiert genau einmal, " +
      "den letzten Wert, aber erst bei complete(). Gut fuer einmalige Berechnungen.",
  },

  // ─── Sektion 3: Operator-Typen: map, filter, switchMap ──────────────────

  {
    sectionIndex: 3,
    question:
      "Was ist der Unterschied zwischen switchMap und mergeMap aus TypeScript-Sicht?",
    options: [
      "Keiner — beide haben dieselbe Typ-Signatur, der Unterschied liegt im Laufzeitverhalten",
      "switchMap gibt Observable<T | R> zurueck, mergeMap gibt Observable<R>",
      "switchMap ist typsicherer weil es Fehler besser behandelt",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "switchMap, mergeMap, concatMap und exhaustMap haben alle dieselbe Typ-Signatur: " +
      "T => Observable<R> gibt OperatorFunction<T, R>. Nur das Concurrency-Verhalten " +
      "unterscheidet sie — und das kann TypeScript nicht beschreiben.",
  },
  {
    sectionIndex: 3,
    question:
      "Was passiert mit dem Typ wenn du `filter(user => user.isActive)` in einer RxJS-Pipeline verwendest?",
    options: [
      "Der Typ aendert sich NICHT — filter ohne Type Predicate gibt OperatorFunction<T, T> zurueck",
      "Der Typ wird zu Observable<ActiveUser> genarrowt",
      "Der Typ wird zu Observable<boolean>",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "filter ohne Type Predicate gibt OperatorFunction<T, T> zurueck — der Typ bleibt. " +
      "Nur `filter((u): u is Admin => u.role === 'admin')` narrowt den Typ zu Observable<Admin>.",
  },
  {
    sectionIndex: 3,
    question:
      "Warum kamen pipeable Operators (`.pipe(map(...))` statt `.map(...)`) mit RxJS 5.5?",
    options: [
      "Um Tree-Shaking zu ermoeglichen — freie Funktionen werden nur gebundelt wenn importiert",
      "Weil die Punkt-Syntax in JavaScript deprecated ist",
      "Weil TypeScript Methodenverkettung nicht typisieren kann",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Prototype-Methoden werden immer gebundelt, auch wenn ungenutzt. " +
      "Freie pipeable Operator-Funktionen werden nur ins Bundle aufgenommen wenn importiert — " +
      "Tree-Shaking reduziert die Bundle-Groesse signifikant.",
  },

  // ─── Sektion 4: Kombinations-Operatoren ─────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Was emittiert `combineLatest([a$, b$])` wenn a$ einen neuen Wert hat, b$ aber noch keinen hatte?",
    options: [
      "Es emittiert NICHT — es wartet bis beide mindestens einmal emittiert haben",
      "Es emittiert sofort mit undefined fuer b$",
      "Es emittiert nur den Wert von a$ als Array mit einem Element",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "combineLatest wartet bis ALLE Teilnehmer mindestens einmal emittiert haben. " +
      "Erst dann emittiert es — und dann bei jeder weiteren Emission eines Teilnehmers.",
  },
  {
    sectionIndex: 4,
    question:
      "Warum ist `forkJoin({ user: user$, posts: posts$ })` besser als `forkJoin([user$, posts$])`?",
    options: [
      "Object-Syntax ist schneller",
      "Array-Syntax ist auf 3 Observables limitiert",
      "Benannte Properties sind refactor-sicher — kein Positions-Zaehlen noetig",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Object-Syntax gibt `{ user: User, posts: Post[] }` — benannte Properties. " +
      "Array-Syntax gibt `[User, Post[]]` — Positionen muessen gezaehlt werden. " +
      "Bei Umstrukturierung (neue Observable einfuegen) verschiebt sich alles.",
  },
  {
    sectionIndex: 4,
    question:
      "Was ist der Unterschied zwischen zip([a$, b$]) und combineLatest([a$, b$])?",
    options: [
      "zip wartet auf NEUE Werte beider (1:1 Paare), combineLatest emittiert bei jedem neuen Wert mit letzten Werten",
      "zip gibt Objekte zurueck, combineLatest gibt Arrays",
      "zip ist veraltet, combineLatest ist der moderne Ersatz",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "zip bildet strenge 1:1-Paare: Wert 1 von a$ mit Wert 1 von b$, etc. " +
      "combineLatest emittiert bei JEDEM neuen Wert eines Teilnehmers — mit den " +
      "jeweils letzten Werten der anderen.",
  },

  // ─── Sektion 5: Fehlerbehandlung ─────────────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "In RxJS 7+ hat der error-Parameter in catchError den Typ 'unknown' statt 'any'. " +
      "Was muss man jetzt tun bevor man auf error.message zugreift?",
    options: [
      "error als any casten: (error as any).message",
      "Ich weiss es nicht",
      "Nichts — unknown erlaubt denselben Zugriff wie any",
      "error mit instanceof pruefen: if (error instanceof Error) dann error.message",
    ],
    correct: 3,
    briefExplanation:
      "unknown erzwingt Typ-Pruefung. `instanceof Error` narrowt den Typ von unknown " +
      "zu Error — danach ist .message sicher zugreifbar. any haette das erlaubt " +
      "ohne Pruefung — gefaehrlich bei unbekannten Fehler-Quellen.",
  },
  {
    sectionIndex: 5,
    question:
      "Welchen TypeScript-Typ hat `EMPTY` aus RxJS?",
    options: [
      "Observable<void>",
      "Observable<any>",
      "Observable<never>",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "EMPTY ist Observable<never>. never ist der Bottom-Type — es emittiert nie " +
      "einen Wert. Deshalb kann es in catchError als Observable<beliebiger-Typ> " +
      "zurueckgegeben werden: never extends jeder Typ.",
  },
  {
    sectionIndex: 5,
    question:
      "Was ist das Result-Pattern in RxJS? Wozu dient es?",
    options: [
      "Ein Muster um mehrere Observables zu kombinieren",
      "Ich weiss es nicht",
      "Ein Pattern um subscribe zu vermeiden",
      "Fehler werden als normale Stream-Werte modelliert: Observable<{ success: true, data: T } | { success: false, error: E }>",
    ],
    correct: 3,
    briefExplanation:
      "Statt Pipeline-Abbruch bei Fehler wird Erfolg/Fehler als normaler Wert im Stream " +
      "abgebildet. Die Komponente reagiert auf success: true vs false — typsicher, " +
      "ohne catchError-Duplikation.",
  },

  // ─── Sektion 6: Angular-Patterns ─────────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Was gibt `toSignal(http.get<User>('/api/user'))` ohne weitere Optionen zurueck?",
    options: [
      "Signal<User>",
      "Signal<User | null>",
      "Signal<User | undefined>",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Ohne Optionen gibt toSignal() Signal<T | undefined> zurueck. undefined ist " +
      "der Initialzustand bevor das Observable emittiert. HTTP-Requests sind asynchron — " +
      "undefined ist realistisch.",
  },
  {
    sectionIndex: 6,
    question:
      "Was macht `takeUntilDestroyed()` (aus @angular/core/rxjs-interop)?",
    options: [
      "Es haelt die Subscription an wenn die Komponente nicht sichtbar ist",
      "Ich weiss es nicht",
      "Es gibt ein Signal zurueck statt einem Observable",
      "Es beendet die Subscription wenn die Angular-Komponente zerstoert wird — automatisch",
    ],
    correct: 3,
    briefExplanation:
      "takeUntilDestroyed() abonniert DestroyRef.onDestroy und beendet die Subscription " +
      "automatisch. Kein manuelles unsubscribe(), kein ngOnDestroy() noetig. " +
      "Memory Leaks durch vergessene Subscriptions werden verhindert.",
  },
  {
    sectionIndex: 6,
    question:
      "Die `async pipe` im Angular-Template gibt `T | null` zurueck, nicht T. Warum?",
    options: [
      "Weil Angular async pipes immer optional macht",
      "Ich weiss es nicht",
      "Weil TypeScript null immer zu Observables hinzufuegt",
      "Weil null der Anfangszustand ist — bevor das Observable emittiert hat die async pipe keinen Wert",
    ],
    correct: 3,
    briefExplanation:
      "Die async pipe gibt null zurueck bevor das Observable seinen ersten Wert emittiert. " +
      "Das ist der Hauptunterschied zu toSignal mit initialValue — dort kontrollierst " +
      "du den Anfangszustand explizit.",
  },
];
