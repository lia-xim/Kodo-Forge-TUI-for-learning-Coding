// pretest-data.ts — L31: Async TypeScript
// 18 Fragen (3 pro Sektion)
// correct-Index-Verteilung: 5×0, 4×1, 5×2, 4×3

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ─── Sektion 1: Promise-Typen ──────────────────────────────────────────

  // Q1 → correct:0 (unveraendert — war schon correct:0)
  {
    sectionIndex: 1,
    question: "Was beschreibt der Typparameter in Promise<string>?",
    options: [
      "Den Typ des aufgeloesten Werts",
      "Den Typ des Fehlers",
      "Den Typ des Promise-Objekts selbst",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Promise<T> beschreibt den Typ des Werts der bei resolve() uebergeben wird.",
  },

  // Q2 → correct:1 (unveraendert)
  {
    sectionIndex: 1,
    question: "Was macht Awaited<Promise<Promise<number>>>?",
    options: [
      "Ergibt Promise<number>",
      "Ergibt number — entpackt rekursiv alle Promise-Schichten",
      "Compile-Error — verschachtelte Promises nicht unterstuetzt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "Awaited<T> entpackt rekursiv alle Promise-Schichten bis zum Basistyp.",
  },

  // Q3 → correct:0 (Richtige nach vorne)
  {
    sectionIndex: 1,
    question: "Was ist PromiseLike<T>?",
    options: [
      "Das minimale Interface mit nur then() — fuer 'thenable' Objekte",
      "Ein Alias fuer Promise<T>",
      "Ein deprecated Typ aus alten TypeScript-Versionen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "PromiseLike<T> hat nur then() und ist kompatibel mit jedem Objekt das eine then()-Methode hat.",
  },

  // ─── Sektion 2: async/await und Typinferenz ────────────────────────────

  // Q4 → correct:2 (Richtige an Pos 2)
  {
    sectionIndex: 2,
    question: "Was ist der Rueckgabetyp einer async-Funktion die 'return 42' hat?",
    options: [
      "number",
      "Promise<number> | number",
      "Promise<number>",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "async-Funktionen wrappen den Rueckgabetyp IMMER in Promise<T>.",
  },

  // Q5 → correct:0 (Richtige nach vorne)
  {
    sectionIndex: 2,
    question: "Was gibt response.json() in fetch zurueck?",
    options: [
      "Promise<any> — ein Typ-Loch",
      "Promise<unknown>",
      "Den geparsten JSON-Typ",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "json() gibt Promise<any> zurueck. Das 'any' infiziert alle abgeleiteten Typen.",
  },

  // Q6 → correct:1 (unveraendert)
  {
    sectionIndex: 2,
    question: "Was passiert wenn man 'await' vor einem Nicht-Promise-Wert schreibt?",
    options: [
      "Compile-Error",
      "Der Wert wird unveraendert zurueckgegeben (No-Op im Typ)",
      "Der Wert wird in ein Promise gewrappt und sofort aufgeloest",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "await auf einem Nicht-Promise gibt den Wert direkt zurueck. Im Typ: Awaited<number> = number.",
  },

  // ─── Sektion 3: Error Handling in Async ────────────────────────────────

  // Q7 → correct:2 (unveraendert — war schon correct:2)
  {
    sectionIndex: 3,
    question: "Welchen Typ hat die catch-Variable mit 'strict: true' seit TS 4.4?",
    options: [
      "Error",
      "any",
      "unknown",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Mit useUnknownInCatchVariables (Teil von strict) ist die catch-Variable 'unknown'.",
  },

  // Q8 → correct:1 (unveraendert)
  {
    sectionIndex: 3,
    question: "Warum kann TypeScript den Fehlertyp in catch nicht genau bestimmen?",
    options: [
      "Weil catch nur Error-Objekte faengt",
      "Weil JavaScript throw mit JEDEM Wert erlaubt",
      "Weil TypeScript keine Exception-Typen unterstuetzt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "throw kann Strings, Zahlen, Objekte, undefined werfen. TypeScript muesste alle throw-Pfade tracken.",
  },

  // Q9 → correct:2 (Richtige an Pos 2)
  {
    sectionIndex: 3,
    question: "Was ist das Async Result Pattern?",
    options: [
      "Eine spezielle try/catch-Syntax fuer Async",
      "Ein Angular-spezifisches Error-Handling-Pattern",
      "Ein Pattern das Promise<T> in Promise<Result<T>> konvertiert",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "trySafe<T>(promise) faengt Fehler und gibt Result<T> zurueck — Fehler werden im Typ sichtbar.",
  },

  // ─── Sektion 4: Generische Async-Patterns ──────────────────────────────

  // Q10 → correct:0 (Richtige nach vorne)
  {
    sectionIndex: 4,
    question: "Warum nimmt eine retry-Funktion () => Promise<T> statt Promise<T>?",
    options: [
      "Weil ein Promise sofort startet — die Funktion ermoeglicht Wiederholung",
      "Weil TypeScript sonst den Typ nicht inferieren kann",
      "Weil Promises nicht als Parameter uebergeben werden koennen",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "Promises sind eager (starten sofort). Eine Funktion ist lazy und kann bei jedem Retry neu aufgerufen werden.",
  },

  // Q11 → correct:2 (Richtige an Pos 2)
  {
    sectionIndex: 4,
    question: "Was macht AbortController bei einem Timeout besser als Promise.race?",
    options: [
      "AbortController ist schneller",
      "AbortController hat bessere Typen",
      "AbortController bricht die Operation tatsaechlich ab, race laesst sie weiterlaufen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "Promise.race gibt das schnellste Ergebnis zurueck, aber das langsame Promise laeuft weiter. AbortController bricht ab.",
  },

  // Q12 → correct:3 (Richtige ans Ende)
  {
    sectionIndex: 4,
    question: "Warum verschwindet 'never' in Promise.race([Promise<T>, Promise<never>])?",
    options: [
      "never ist ein Fehler-Typ",
      "TypeScript ignoriert Promise<never>",
      "never wird zu unknown konvertiert",
      "never ist die leere Menge — T | never = T",
    ],
    correct: 3,
    briefExplanation: "never ist der Bottom Type (leere Menge). In einer Union verschwindet er: T | never = T.",
  },

  // ─── Sektion 5: AsyncIterable und Generators ──────────────────────────

  // Q13 → correct:0 (Richtige nach vorne)
  {
    sectionIndex: 5,
    question: "Was bedeutet 'async function*' in TypeScript?",
    options: [
      "Ein Async Generator der Werte asynchron yielden kann",
      "Eine Funktion die Promises erzeugt",
      "Eine Funktion mit Stern-Operator fuer Multiplikation",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation: "async function* definiert einen Async Generator. Er kann Werte mit yield asynchron liefern.",
  },

  // Q14 → correct:1 (unveraendert)
  {
    sectionIndex: 5,
    question: "Was ist IteratorResult<T, TReturn>?",
    options: [
      "Ein Promise das T zurueckgibt",
      "Eine Discriminated Union: { done: false; value: T } | { done: true; value: TReturn }",
      "Ein Error-Typ fuer Iterator-Fehler",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation: "IteratorResult ist eine Discriminated Union. 'done' ist die Diskriminante — value hat je nach done verschiedene Typen.",
  },

  // Q15 → correct:3 (Richtige ans Ende)
  {
    sectionIndex: 5,
    question: "Was passiert bei 'break' in einer for-await-of-Schleife?",
    options: [
      "Der Generator laeuft im Hintergrund weiter",
      "Es gibt einen Compile-Error",
      "Der naechste yield wird noch ausgefuehrt",
      "Es wird automatisch gen.return() aufgerufen",
    ],
    correct: 3,
    briefExplanation: "break ruft implizit return() auf dem Iterator auf. Der Generator wird sauber beendet.",
  },

  // ─── Sektion 6: Praxis — Frameworks ────────────────────────────────────

  // Q16 → correct:2 (Richtige an Pos 2)
  {
    sectionIndex: 6,
    question: "Was ist das Problem mit HttpClient.get<User[]>('/api/users') in Angular?",
    options: [
      "Der Typ ist falsch — es sollte Observable<User[]> sein",
      "HttpClient akzeptiert keine Generics",
      "Es ist ein 'Trust me, Compiler' — keine Runtime-Pruefung ob die API wirklich User[] liefert",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation: "HttpClient.get<T>() ist ein Compilezeit-Versprechen. TypeScript prueft nicht was die API tatsaechlich liefert.",
  },

  // Q17 → correct:3 (Richtige ans Ende)
  {
    sectionIndex: 6,
    question: "Was ist der Vorteil von Typed API Routes als zentrale Typ-Map?",
    options: [
      "Sie machen HTTP-Aufrufe schneller",
      "Sie ersetzen REST durch GraphQL",
      "Sie reduzieren die Bundle-Groesse",
      "Autocomplete und Typ-Sicherheit fuer alle Endpunkte an einer Stelle",
    ],
    correct: 3,
    briefExplanation: "Eine zentrale Typ-Map definiert alle Endpunkte mit ihren Request/Response-Typen. IDE-Autocomplete und Compile-Pruefung inklusive.",
  },

  // Q18 → correct:3 (Richtige ans Ende)
  {
    sectionIndex: 6,
    question: "Was schliesst die Luecke zwischen TypeScript-Typen und tatsaechlichen API-Daten?",
    options: [
      "Strengere tsconfig-Optionen",
      "Mehr Generics im Code",
      "Readonly-Typen in Interfaces",
      "Runtime-Validierung mit Zod, Valibot oder aehnlichen Bibliotheken",
    ],
    correct: 3,
    briefExplanation: "Runtime-Validierung prueft die tatsaechlichen Daten gegen ein Schema — nicht nur den TypeScript-Typ.",
  },
];
