/**
 * Lektion 22 — Quiz-Daten: Advanced Generics
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 *
 * correct-Index-Verteilung: 0=4, 1=4, 2=4, 3=3
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "22";
export const lessonTitle = "Advanced Generics";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Grenzen einfacher Generics (correct: 0) ---
  {
    question: "Warum kann man in TypeScript nicht `type Apply<F, A> = F<A>` schreiben?",
    options: [
      "TypeScript unterstuetzt keine Higher-Kinded Types — Typparameter koennen nicht selbst generisch sein",
      "Die Syntax ist falsch, richtig waere `type Apply<F, A> = F(A)` mit Klammern statt spitzen Klammern",
      "Es funktioniert ab TypeScript 5.0, das Feature wurde mit dem neuen Type-System-Update eingefuehrt",
      "Man muss `type Apply<F extends Function, A> = F<A>` schreiben um den Typparameter einzuschraenken",
    ],
    correct: 0,
    explanation:
      "TypeScript hat kein natives Konzept von Higher-Kinded Types. " +
      "Ein Typparameter wie `F` kann nicht selbst Typparameter annehmen. " +
      "Das ist eine fundamentale Einschraenkung des Typsystems.",
    elaboratedFeedback: {
      whyCorrect:
        "In TypeScript ist ein Typparameter immer ein konkreter Typ (wie `string` oder `number`), " +
        "nicht ein Typ-Konstruktor (wie `Array` oder `Promise`). `F<A>` wuerde erfordern, " +
        "dass F selbst generisch ist — das geht nicht.",
      commonMistake:
        "Manche denken, man braucht nur den richtigen Constraint. Aber selbst " +
        "`F extends SomeGeneric` macht F nicht zu einem Typ-Konstruktor.",
    },
  },

  // --- Frage 2: HKT-Emulation (correct: 1) ---
  {
    question: "Wie emuliert man Higher-Kinded Types am haeufigsten in TypeScript?",
    options: [
      "Mit `eval()` zur Laufzeit um Typ-Information dynamisch zu erzeugen",
      "Mit Interface-Maps (URItoKind-Pattern) oder Conditional Types",
      "Mit Template Literal Types die Typ-Namen als String-Schluessel verwenden",
      "Gar nicht — man braucht Haskell oder eine andere Sprache mit nativen Higher-Kinded Types",
    ],
    correct: 1,
    explanation:
      "Das gaengigste Muster ist eine Interface-Map, die String-URIs auf " +
      "konkrete Typen abbildet. Bibliotheken wie fp-ts nutzen dieses Pattern. " +
      "Alternativ kann man Conditional Types als Dispatch verwenden.",
    code: `interface URItoKind<A> {
  Array: Array<A>;
  Promise: Promise<A>;
}
type Kind<URI extends keyof URItoKind<any>, A> = URItoKind<A>[URI];
// Kind<"Array", string> = string[]`,
    elaboratedFeedback: {
      whyCorrect:
        "Die Interface-Map fungiert als 'Lookup-Table' fuer Typ-Konstruktoren. " +
        "Statt `F<A>` schreibt man `Kind<F, A>` und nutzt die Map als Indirektion.",
      commonMistake:
        "Viele glauben, es gaebe keine Moeglichkeit, da TypeScript keine HKTs hat. " +
        "Die Emulation ist zwar weniger elegant als in Haskell, funktioniert aber.",
    },
  },

  // --- Frage 3: Kovarianz (correct: 2) ---
  {
    question: "Wenn `Cat extends Animal`, welche Aussage ueber Kovarianz ist korrekt?",
    options: [
      "`Consumer<Cat> extends Consumer<Animal>` (Cat-Consumer ist Subtyp)",
      "`Array<Cat>` ist immer ein Subtyp von `Array<Animal>`",
      "`Producer<Cat> extends Producer<Animal>` (Producer ist kovariant in T)",
      "Kovarianz bedeutet, dass Subtyp-Beziehungen immer umgekehrt werden",
    ],
    correct: 2,
    explanation:
      "Bei Kovarianz bleibt die Subtyprichtung erhalten: Wenn Cat ein Subtyp " +
      "von Animal ist, dann ist Producer<Cat> ein Subtyp von Producer<Animal>. " +
      "Das gilt fuer Typen, die T nur 'herausgeben' (output-Position).",
    elaboratedFeedback: {
      whyCorrect:
        "Ein Producer<Cat> kann ueberall verwendet werden wo ein Producer<Animal> " +
        "erwartet wird — eine Katze herauszugeben ist immer OK wenn ein Tier erwartet wird.",
      commonMistake:
        "Array<Cat> ist NICHT immer Subtyp von Array<Animal>, weil Arrays auch " +
        "beschrieben werden koennen (push). Das macht sie invariant, nicht kovariant.",
    },
  },

  // --- Frage 4: Kontravarianz (correct: 3) ---
  {
    question: "Warum sind Funktionsparameter kontravariant (mit strictFunctionTypes)?",
    options: [
      "Weil TypeScript willkuerlich eine Richtung gewaehlt hat",
      "Weil es ein Compiler-Bug ist der nicht behoben wurde",
      "Weil Funktionsparameter zur Laufzeit nicht geprueft werden",
      "Weil eine Funktion die `Animal` akzeptiert auch `Cat` verarbeiten kann, aber nicht umgekehrt",
    ],
    correct: 3,
    explanation:
      "Eine Funktion `(a: Animal) => void` kann jedes Tier verarbeiten, also auch Katzen. " +
      "Aber eine Funktion `(c: Cat) => void` kann nur Katzen verarbeiten — ein Hund wuerde " +
      "crashen. Deshalb ist `(a: Animal) => void` ein Subtyp von `(c: Cat) => void`.",
    code: `type Handler<T> = (item: T) => void;
// Handler<Animal> extends Handler<Cat>  ✓ (kontravariant)
// Handler<Cat> extends Handler<Animal>  ✗`,
    elaboratedFeedback: {
      whyCorrect:
        "In der Eingabeposition (Parameter) muss der Typ 'breiter' werden um sicher zu sein. " +
        "Wer Animal verarbeiten kann, kann auch Cat verarbeiten — das ist Kontravarianz.",
      commonMistake:
        "Viele denken intuitiv, dass Handler<Cat> ein Subtyp von Handler<Animal> sein sollte " +
        "(kovariant). Das waere aber unsicher — der Cat-Handler koennte .meow() aufrufen.",
    },
  },

  // --- Frage 5: Invarianz (correct: 0) ---
  {
    question: "Wann ist ein generischer Typ invariant?",
    options: [
      "Wenn der Typparameter sowohl in Input- als auch Output-Position verwendet wird",
      "Wenn der Typparameter nie verwendet wird und somit keine Varianz-Beziehung besteht",
      "Wenn der Typ readonly ist und daher keine Schreib-Operationen erlaubt",
      "Wenn der Typ nur Methoden hat aber keine Properties definiert",
    ],
    correct: 0,
    explanation:
      "Invarianz entsteht wenn T sowohl gelesen (out) als auch geschrieben (in) wird. " +
      "Array<T> ist invariant weil man Elemente lesen UND hinzufuegen kann. " +
      "Nur Array<Cat> = Array<Cat> ist erlaubt, nicht Array<Cat> = Array<Animal>.",
    elaboratedFeedback: {
      whyCorrect:
        "Lesen erfordert Kovarianz (out), Schreiben erfordert Kontravarianz (in). " +
        "Wenn beides noetig ist, gibt es keine sichere Richtung — also Invarianz.",
      commonMistake:
        "Viele denken, readonly mache einen Typ invariant. Tatsaechlich macht readonly " +
        "den Typ eher kovariant, weil die Schreibposition wegfaellt.",
    },
  },

  // --- Frage 6: in/out Modifier (correct: 1) ---
  {
    question: "Was bewirkt `interface Producer<out T> { get(): T; }`?",
    options: [
      "Es aendert das Verhalten zur Laufzeit und fuegt Varianz-Pruefungen in den generierten Code hinzu",
      "Es annotiert T als kovariant und TypeScript prueft dass T nur in Output-Position steht",
      "Es macht T optional und erlaubt undefined als Default-Wert fuer den Typparameter",
      "Es ist Syntax fuer TypeScript 6.0 und funktioniert in aktuellen Versionen noch nicht",
    ],
    correct: 1,
    explanation:
      "Der `out`-Modifier (TS 4.7+) deklariert explizit, dass T nur in Output-Position " +
      "verwendet wird (kovariant). TypeScript prueft dies und gibt einen Fehler wenn " +
      "T in einer Input-Position steht. Ausserdem beschleunigt es Type-Checking.",
    elaboratedFeedback: {
      whyCorrect:
        "`out T` ist eine Annotation die Kovarianz deklariert. TypeScript verifiziert " +
        "die Annotation und kann dadurch Varianz-Pruefungen schneller durchfuehren " +
        "(kein strukturelles Vergleichen mehr noetig).",
      commonMistake:
        "Die Modifier aendern KEIN Verhalten — sie annotieren nur die Absicht. " +
        "Wenn der Code die Annotation verletzt, gibt es einen Compile-Error.",
    },
  },

  // --- Frage 7: in Modifier (correct: 2) ---
  {
    question: "Welcher Code ist mit `interface Comparer<in T>` korrekt?",
    options: [
      "`interface Comparer<in T> { get(): T; }`",
      "`interface Comparer<in T> { value: T; }`",
      "`interface Comparer<in T> { compare(a: T, b: T): number; }`",
      "`interface Comparer<in T> { clone(): Comparer<T>; }`",
    ],
    correct: 2,
    explanation:
      "`in T` deklariert Kontravarianz — T darf nur in Input-Position (Parameter) stehen. " +
      "Ein `compare(a: T, b: T): number` verwendet T nur als Input. " +
      "Eine `get(): T`-Methode waere ein Fehler, da T dort in Output-Position steht.",
    elaboratedFeedback: {
      whyCorrect:
        "Kontravarianz (`in T`) bedeutet: T wird nur 'konsumiert', nie 'produziert'. " +
        "Parameter sind Input-Positionen — perfekt fuer `in T`.",
      commonMistake:
        "Eine Property `value: T` ist sowohl lesbar als auch schreibbar, " +
        "also sowohl in als auch out — das verletzt den `in`-Constraint.",
    },
  },

  // --- Frage 8: Distributive Conditional Types (correct: 3) ---
  {
    question: "Wann verteilt sich ein Conditional Type ueber eine Union?",
    code: `type IsString<T> = T extends string ? true : false;
type Result = IsString<string | number>; // ???`,
    options: [
      "Immer, bei jeder Verwendung eines Conditional Type",
      "Nie — Conditional Types arbeiten immer auf dem gesamten Typ",
      "Nur wenn der Conditional Type in einem generischen Kontext steht",
      "Nur wenn T ein 'nackter' (unwrapped) Typparameter ist",
    ],
    correct: 3,
    explanation:
      "Distributive Behavior tritt nur auf wenn der zu pruefende Typ ein " +
      "'nackter' Typparameter ist (`T extends ...`). Bei `string | number extends string` " +
      "(kein Typparameter) gibt es keine Distribution. Wrapping mit `[T]` verhindert es auch.",
    elaboratedFeedback: {
      whyCorrect:
        "TypeScript verteilt den Union nur wenn T direkt als nackter Typparameter steht. " +
        "`IsString<string | number>` wird zu `IsString<string> | IsString<number>` = `true | false`.",
      commonMistake:
        "Viele nehmen an, dass Distribution immer stattfindet. Aber `[T] extends [string]` " +
        "verhindert die Distribution — der Union wird als Ganzes geprueft.",
    },
  },

  // --- Frage 9: Intersection Constraints (correct: 0) ---
  {
    question: "Was bedeutet `T extends Serializable & Loggable`?",
    options: [
      "T muss BEIDE Interfaces gleichzeitig implementieren",
      "T muss EINES der beiden Interfaces implementieren",
      "T muss ein Union von Serializable und Loggable sein",
      "Es ist ein Syntax-Fehler — man braucht zwei separate extends",
    ],
    correct: 0,
    explanation:
      "Ein Intersection-Constraint `T extends A & B` verlangt, dass T " +
      "alle Eigenschaften von A UND B hat. Es ist wie ein UND: " +
      "Der Typ muss beide Contracts erfuellen.",
    elaboratedFeedback: {
      whyCorrect:
        "Intersection (`&`) in Constraints funktioniert wie bei normalen Typen: " +
        "Alle Eigenschaften beider Typen muessen vorhanden sein. " +
        "Anders als in Java gibt es keine `T extends A, B`-Syntax.",
      commonMistake:
        "Manche verwechseln `&` (Intersection = UND) mit `|` (Union = ODER). " +
        "In TypeScript kann man nicht `T extends A | B` fuer 'entweder-oder' verwenden — " +
        "das bedeutet 'T ist Subtyp des Unions', was fast immer true ist.",
    },
  },

  // --- Frage 10: Recursive Constraints (correct: 1) ---
  {
    question: "Was bewirkt `T extends Comparable<T>`?",
    code: `interface Comparable<T> {
  compareTo(other: T): number;
}
function sort<T extends Comparable<T>>(arr: T[]): T[] { /* ... */ }`,
    options: [
      "Es erzeugt eine Endlosschleife im Compiler die zum Absturz fuehrt",
      "T muss sich selbst vergleichen koennen — das F-bounded Polymorphism Pattern",
      "T wird auf Comparable eingeschraenkt und der rekursive Typparameter wird ignoriert",
      "Es ist ungueltige Syntax und erzeugt einen Compile-Error wegen zirkulaerer Referenz",
    ],
    correct: 1,
    explanation:
      "Das ist F-bounded Polymorphism: T referenziert sich selbst im Constraint. " +
      "Es stellt sicher, dass T eine `compareTo`-Methode hat die ANDERE T-Instanzen " +
      "akzeptiert — nicht irgendein Comparable, sondern genau denselben Typ.",
    elaboratedFeedback: {
      whyCorrect:
        "F-bounded Polymorphism (aus Java bekannt als `T extends Comparable<T>`) " +
        "stellt sicher, dass Aepfel nur mit Aepfeln verglichen werden, nicht mit Birnen. " +
        "Der Typ referenziert sich selbst im Constraint.",
      commonMistake:
        "Viele denken das erzeugt eine Endlosschleife. TypeScript handhabt rekursive " +
        "Constraints korrekt — die Rekursion ist auf der Typ-Ebene, nicht zur Laufzeit.",
    },
  },

  // --- Frage 11: Generics vs Overloads (correct: 2) ---
  {
    question: "Wann sind Function Overloads besser als Generics?",
    options: [
      "Overloads sind immer besser weil sie lesbarer sind",
      "Overloads sind nie besser — Generics koennen alles",
      "Wenn eine endliche Menge konkreter Input-Output-Beziehungen besteht",
      "Nur bei mehr als 5 Typparametern",
    ],
    correct: 2,
    explanation:
      "Overloads sind besser wenn du eine feste Menge von Input-Output-Beziehungen hast: " +
      "`f(string): number` und `f(number): string`. Generics sind besser wenn die " +
      "Beziehung parametrisch ist: `f<T>(x: T): T`.",
    code: `// Overloads besser:
function parse(input: string): number;
function parse(input: number): string;
// Generic besser:
function identity<T>(x: T): T;`,
    elaboratedFeedback: {
      whyCorrect:
        "Overloads bilden diskrete Mappings ab (wenn string, dann number). " +
        "Generics bilden parametrische Beziehungen ab (der Output-Typ haengt " +
        "vom Input-Typ ab, aber auf eine einheitliche Weise).",
      commonMistake:
        "Viele verwenden Generics fuer alles, auch wenn ein einfacher Overload " +
        "klarer waere. 'Generics sind ein Werkzeug, kein Ziel.'",
    },
  },

  // --- Frage 12: Default Type Parameters (correct: 2) ---
  {
    question: "Was passiert wenn ein Generic mit Default-Typparameter aufgerufen wird?",
    code: `function fetch<T = unknown>(url: string): Promise<T> { /* ... */ }
const result = fetch("/api/users"); // Typ von result?`,
    options: [
      "Compile-Fehler — T muss explizit angegeben werden",
      "T wird zu `any` infertiert",
      "T wird zum Default `unknown`, also `Promise<unknown>`",
      "T wird zu `string` infertiert weil url ein string ist",
    ],
    correct: 2,
    explanation:
      "Wenn TypeScript T nicht aus dem Kontext inferieren kann und kein expliziter " +
      "Typparameter angegeben wird, greift der Default. Hier wird T zu `unknown`, " +
      "also ist result vom Typ `Promise<unknown>`.",
    elaboratedFeedback: {
      whyCorrect:
        "Default-Typparameter sind Fallbacks: Erst versucht TypeScript zu inferieren, " +
        "dann nimmt es den Default. Hier gibt es keinen Inference-Kandidaten fuer T, " +
        "also wird der Default `unknown` verwendet.",
      commonMistake:
        "Manche denken, Inference hat immer Vorrang. Das stimmt — WENN es einen " +
        "Inference-Kandidaten gibt. Ohne Kandidat greift der Default.",
    },
  },

  // --- Frage 13: Performance von in/out (correct: 0) ---
  {
    question: "Warum verbessern `in`/`out`-Modifier die TypeScript-Performance?",
    options: [
      "TypeScript muss Varianz nicht mehr strukturell berechnen sondern liest die Annotation",
      "Sie reduzieren die Groesse des kompilierten JavaScript-Codes durch Wegfall von Pruefcode",
      "Sie aktivieren einen speziellen JIT-Compiler der generische Typen zur Laufzeit optimiert",
      "Sie haben keinen Performance-Effekt — sie dienen ausschliesslich der Typ-Korrektheit",
    ],
    correct: 0,
    explanation:
      "Ohne `in`/`out` muss TypeScript die Varianz strukturell berechnen: " +
      "Jede Verwendung von T wird geprueft um festzustellen ob der Typ kovariant, " +
      "kontravariant oder invariant ist. Mit der Annotation entfaellt diese Analyse.",
    elaboratedFeedback: {
      whyCorrect:
        "Strukturelle Varianzberechnung ist teuer: TypeScript muss alle Members " +
        "durchgehen und pruefen wo T vorkommt. Die Annotation sagt direkt 'kovariant' " +
        "oder 'kontravariant' — ein einfacher Lookup statt einer Analyse.",
      commonMistake:
        "Viele denken, die Modifier seien rein kosmetisch. Tatsaechlich bringen sie " +
        "bei grossen Projekten messbare Compile-Zeit-Verbesserungen.",
    },
  },

  // --- Frage 14: Generische Constraints und keyof (correct: 3) ---
  {
    question: "Was ist der Typ von `key` in dieser Funktion?",
    code: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Max", age: 30 };
const name = getProperty(user, "name"); // Typ von name?`,
    options: [
      "`string | number` — weil T Properties beider Typen hat",
      "`unknown` — weil TypeScript den konkreten Typ nicht kennt",
      "`'name' | 'age'` — weil keyof den Union aller Keys ergibt",
      "`string` — weil TypeScript 'name' zu `T[K]` aufloest und `T['name']` string ist",
    ],
    correct: 3,
    explanation:
      "TypeScript inferiert K als den Literal-Typ `'name'` (nicht den gesamten keyof Union). " +
      "Dann ist `T[K]` = `{ name: string, age: number }['name']` = `string`. " +
      "Das ist die Magie von Generics mit keyof — praezise Rueckgabetypen.",
    elaboratedFeedback: {
      whyCorrect:
        "K wird als `'name'` inferiert (Literal Type), nicht als `'name' | 'age'`. " +
        "Dadurch ist T[K] praezise `string` und nicht `string | number`.",
      commonMistake:
        "Manche denken, K waere immer der gesamte keyof-Union. Aber TypeScript " +
        "inferiert den engsten passenden Typ — hier den Literal `'name'`.",
    },
  },

  // --- Frage 15: API-Design Anti-Pattern (correct: 1) ---
  {
    question: "Welches ist ein haeufiges Anti-Pattern bei generischen APIs?",
    code: `// Welche Variante ist ein Anti-Pattern?
function a<T>(x: T): T { return x; }
function b<T>(x: T): void { console.log(x); }
function c(x: unknown): void { console.log(x); }`,
    options: [
      "Funktion a — identity ist sinnlos",
      "Funktion b — T wird nur einmal verwendet und traegt keine Information",
      "Funktion c — unknown ist immer falsch",
      "Keine davon ist ein Anti-Pattern",
    ],
    correct: 1,
    explanation:
      "Wenn ein Typparameter nur einmal vorkommt (hier nur im Parameter, nicht im Return), " +
      "traegt er keine Information und kann durch `unknown` ersetzt werden. " +
      "Die TypeScript-Doku nennt das die 'Rule of Two': Ein Generic sollte mindestens " +
      "zwei Mal auftauchen.",
    elaboratedFeedback: {
      whyCorrect:
        "Ein Typparameter, der nur einmal erscheint, korreliert nichts. " +
        "`<T>(x: T): void` ist funktional identisch mit `(x: unknown): void`. " +
        "Das Generic fuegt nur Komplexitaet hinzu ohne Typsicherheit zu gewinnen.",
      commonMistake:
        "Viele fuegen Generics 'prophylaktisch' hinzu in der Hoffnung auf mehr Flexibilitaet. " +
        "Aber ein unnoetiger Typparameter verwirrt Nutzer der API.",
    },
  },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  // --- Frage 16: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie heisst die Eigenschaft, wenn bei `Cat extends Animal` auch " +
      "`Producer<Cat> extends Producer<Animal>` gilt (Subtyprichtung bleibt erhalten)?",
    expectedAnswer: "Kovarianz",
    acceptableAnswers: [
      "Kovarianz", "kovarianz", "Covariance", "covariance", "kovariant",
    ],
    explanation:
      "Kovarianz bedeutet: Die Subtyprichtung bleibt erhalten. " +
      "Wenn Cat ein Subtyp von Animal ist, dann ist Producer<Cat> " +
      "ein Subtyp von Producer<Animal>. Das gilt fuer Typen in Output-Position.",
  },

  // --- Frage 17: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Wie lautet die TypeScript-Regel, dass ein Typparameter mindestens " +
      "zwei Mal in einer Signatur vorkommen sollte, damit er sinnvoll ist?",
    expectedAnswer: "Rule of Two",
    acceptableAnswers: [
      "Rule of Two", "rule of two", "Regel der Zwei", "Rule-of-Two",
    ],
    explanation:
      "Die 'Rule of Two' besagt: Ein Typparameter muss mindestens zwei Mal " +
      "auftauchen (z.B. im Parameter UND im Rueckgabetyp), damit er eine " +
      "Korrelation herstellt. Einmalige Typparameter koennen durch 'unknown' " +
      "ersetzt werden.",
  },

  // --- Frage 18: Short-Answer ---
  {
    type: "short-answer",
    question:
      "Welche zwei TypeScript-Keywords (seit TS 4.7) annotieren die Varianz " +
      "eines Typparameters explizit? Nenne beide, getrennt durch Komma.",
    expectedAnswer: "in, out",
    acceptableAnswers: [
      "in, out", "in und out", "in/out", "out, in", "out und in", "in out",
    ],
    explanation:
      "'in' deklariert Kontravarianz (T nur in Input-Position), " +
      "'out' deklariert Kovarianz (T nur in Output-Position). " +
      "TypeScript prueft die Annotation und beschleunigt dadurch Type-Checking.",
  },

  // --- Frage 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ hat `result`?",
    code:
      "type IsString<T> = T extends string ? 'ja' : 'nein';\n" +
      "type Result = IsString<string | number>;",
    expectedAnswer: "'ja' | 'nein'",
    acceptableAnswers: [
      "'ja' | 'nein'", "\"ja\" | \"nein\"", "ja | nein",
      "'nein' | 'ja'", "\"nein\" | \"ja\"", "nein | ja",
    ],
    explanation:
      "Da T ein nackter Typparameter ist, verteilt sich der Conditional Type " +
      "ueber die Union: IsString<string> | IsString<number> = 'ja' | 'nein'. " +
      "Das ist Distributive Behavior.",
  },

  // --- Frage 20: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ hat `name`?",
    code:
      "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n" +
      "  return obj[key];\n" +
      "}\n" +
      "const user = { name: 'Max', age: 30 };\n" +
      "const name = getProperty(user, 'name');",
    expectedAnswer: "string",
    acceptableAnswers: ["string", "String"],
    explanation:
      "TypeScript inferiert K als den Literal-Typ 'name'. " +
      "T[K] = { name: string; age: number }['name'] = string. " +
      "Das ist die Staerke von Generics mit keyof — praezise Rueckgabetypen.",
  },

  // --- Frage 21: Explain-Why ---
  {
    type: "explain-why",
    question:
      "Warum sind Funktionsparameter kontravariant, waehrend Rueckgabewerte " +
      "kovariant sind? Erklaere anhand eines Beispiels mit Tier-Hierarchie " +
      "(Animal/Cat), warum die umgekehrte Richtung unsicher waere.",
    modelAnswer:
      "Eine Funktion (Animal) => void kann jedes Tier verarbeiten, auch Katzen. " +
      "Deshalb ist sie sicher wo (Cat) => void erwartet wird. Umgekehrt waere " +
      "(Cat) => void unsicher als (Animal) => void, weil sie einen Hund nicht " +
      "verarbeiten koennte. Bei Rueckgabewerten gilt das Gegenteil: Eine Funktion " +
      "die Cat zurueckgibt kann ueberall stehen wo Animal erwartet wird, " +
      "weil jede Katze auch ein Tier ist.",
    keyPoints: [
      "Parameter: breiterer Typ ist sicherer (kontravariant)",
      "Rueckgabe: engerer Typ ist sicherer (kovariant)",
      "Unsicherer Fall: Cat-Handler koennte .meow() aufrufen",
      "Liskov Substitution Principle",
    ],
  },
];
