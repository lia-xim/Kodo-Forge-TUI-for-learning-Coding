/**
 * Lektion 14 — Quiz-Daten: Generic Patterns
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "14";
export const lessonTitle = "Generic Patterns";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Generic Factory Basics ---
  {
    question: "Was beschreibt der Typ `new () => T` in einer Generic Factory?",
    options: [
      "Eine Funktion die T als Parameter nimmt",
      "Eine Constructor Signature — etwas das mit new aufgerufen werden kann und T erzeugt",
      "Ein Interface fuer T",
      "Eine abstrakte Klasse",
    ],
    correct: 1,
    explanation:
      "`new () => T` ist eine Constructor Signature. Sie beschreibt " +
      "alles was mit dem `new`-Keyword aufgerufen werden kann und eine " +
      "Instanz von T zurueckgibt. Das sind typischerweise Klassen.",
  },

  // --- Frage 2: Builder Pattern ---
  {
    question: "Wie trackt der Generic Builder den wachsenden Typ bei jedem `.set()` Aufruf?",
    options: [
      "Durch ein Array von Typen",
      "Durch Intersection Types: T & Record<K, V> bei jedem Aufruf",
      "Durch eine externe Type Map",
      "Durch Runtime-Type-Checking",
    ],
    correct: 1,
    explanation:
      "Jeder `.set(key, value)` Aufruf gibt `Builder<T & Record<K, V>>` " +
      "zurueck. Die Intersection erweitert den Typ um das neue Feld. " +
      "Am Ende hat `.build()` den exakten Typ aller hinzugefuegten Felder.",
    code: "new Builder()\n  .set('name', 'Max')     // Builder<{} & Record<'name', string>>\n  .set('age', 30)          // Builder<... & Record<'age', number>>",
  },

  // --- Frage 3: Stack<T> Return Types ---
  {
    question: "Warum gibt `Stack<T>.pop()` den Typ `T | undefined` zurueck statt `T`?",
    options: [
      "Weil TypeScript keine generischen Return Types unterstuetzt",
      "Weil der Stack leer sein kann und dann kein Element zum Zurueckgeben existiert",
      "Weil T immer optional ist",
      "Weil pop() den Stack nicht veraendert",
    ],
    correct: 1,
    explanation:
      "Ein leerer Stack hat kein Element zum Zurueckgeben. `undefined` " +
      "signalisiert diesen Fall. Ohne `undefined` im Typ muesste man " +
      "eine Exception werfen oder luegen (beides schlechter).",
  },

  // --- Frage 4: pipe() Overloads ---
  {
    question: "Warum braucht `pipe()` Overloads statt eines einzigen generischen Typs?",
    options: [
      "Weil pipe nur mit Overloads funktioniert",
      "Weil jeder Schritt einen ANDEREN Typ hat und TypeScript nicht beliebig viele Typparameter aus Rest-Parametern ableiten kann",
      "Weil Generics keine Funktionsparameter unterstuetzen",
      "Weil Overloads schneller sind als Generics",
    ],
    correct: 1,
    explanation:
      "pipe(value, fn1, fn2, fn3) hat verschiedene Typen an jedem Schritt: " +
      "A -> B -> C -> D. TypeScript kann nicht beliebig viele verschiedene " +
      "Typparameter aus einem Rest-Parameter ableiten. Overloads definieren " +
      "die Typuebergaenge fuer jede Laenge explizit.",
  },

  // --- Frage 5: compose vs pipe ---
  {
    question: "Was ist der Hauptunterschied zwischen pipe() und compose()?",
    options: [
      "pipe ist typsicher, compose nicht",
      "compose gibt eine Funktion zurueck, pipe fuehrt sofort aus; die Reihenfolge ist umgekehrt",
      "pipe funktioniert nur mit Arrays",
      "compose braucht keine Generics",
    ],
    correct: 1,
    explanation:
      "pipe(value, f, g) fuehrt sofort aus: g(f(value)). " +
      "compose(g, f) gibt eine neue Funktion zurueck: (x) => g(f(x)). " +
      "Bei compose ist die Lesereihenfolge umgekehrt (rechts nach links, " +
      "wie in der Mathematik).",
  },

  // --- Frage 6: Conditional Constraints ---
  {
    question: "Was macht `T extends string ? X : Y` in einem Conditional Constraint?",
    options: [
      "Es prueft zur Laufzeit ob T ein String ist",
      "Es waehlt den Typ X oder Y abhaengig davon ob T ein Subtyp von string ist",
      "Es konvertiert T zu string",
      "Es erzeugt einen Union aus X und Y",
    ],
    correct: 1,
    explanation:
      "Conditional Types sind eine Compile-Zeit-Entscheidung. Wenn T " +
      "ein Subtyp von string ist, wird X gewaehlt, sonst Y. Das " +
      "ermoeglicht kontextabhaengige Rueckgabetypen.",
    code: "type Result<T> = T extends string ? string : number;\n// Result<'hello'> = string\n// Result<42> = number",
  },

  // --- Frage 7: Recursive Constraints ---
  {
    question: "Was beschreibt `interface TreeNode<T> { value: T; children: TreeNode<T>[]; }`?",
    options: [
      "Einen flachen Array-Typ",
      "Einen rekursiven Baumknoten — jeder Knoten hat denselben Typ fuer Wert und Kinder",
      "Einen zirkulaeren Referenzfehler",
      "Ein Union Type",
    ],
    correct: 1,
    explanation:
      "TreeNode<T> referenziert sich selbst in der children-Property. " +
      "Das erzeugt keinen Fehler — TypeScript unterstuetzt rekursive Typen. " +
      "Jeder Knoten hat einen Wert vom Typ T und beliebig viele Kinder " +
      "vom selben Typ TreeNode<T>.",
  },

  // --- Frage 8: const Type Parameters ---
  {
    question: "Was bewirkt `<const T>` (TS 5.0) bei einem Typparameter?",
    options: [
      "T wird unveraenderlich (readonly)",
      "TypeScript inferiert den praezisesten Literal-Typ — als haette der Aufrufer as const geschrieben",
      "T wird zu einer Konstante",
      "T akzeptiert nur const-Variablen",
    ],
    correct: 1,
    explanation:
      "`<const T>` erzwingt Literal-Inferenz beim Aufrufer. Ohne const " +
      "wird ['a', 'b'] als string[] inferiert. Mit const wird es zu " +
      "readonly ['a', 'b']. Der Aufrufer muss kein `as const` schreiben.",
    code: "function f<const T>(x: T): T { return x; }\nf(['a', 'b']) // readonly ['a', 'b'] statt string[]",
  },

  // --- Frage 9: DeepPartial ---
  {
    question: "Was macht `DeepPartial<T>` anders als `Partial<T>`?",
    options: [
      "Nichts, sie sind identisch",
      "DeepPartial macht auch verschachtelte Properties optional — auf ALLEN Ebenen",
      "DeepPartial entfernt Properties",
      "DeepPartial ist schneller",
    ],
    correct: 1,
    explanation:
      "Partial<T> macht nur die erste Ebene optional. DeepPartial<T> " +
      "ist rekursiv: Es prueft ob eine Property ein Objekt ist und wendet " +
      "sich dann SELBST darauf an. So werden alle Ebenen optional.",
    code: "type DeepPartial<T> = {\n  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];\n};",
  },

  // --- Frage 10: Repository Pattern ---
  {
    question: "Warum verwendet das Repository<T> Interface `Omit<T, 'id'>` bei `create()`?",
    options: [
      "Weil id optional ist",
      "Weil die id vom Repository automatisch generiert wird — der Aufrufer soll sie nicht setzen",
      "Weil Omit schneller ist",
      "Weil id ein reserved word ist",
    ],
    correct: 1,
    explanation:
      "Bei `create(data: Omit<T, 'id'>)` muss der Aufrufer alle Properties " +
      "von T angeben AUSSER id. Die id wird intern vom Repository generiert. " +
      "Das verhindert ID-Konflikte und doppelte IDs.",
  },

  // --- Frage 11: EventEmitter Type Safety ---
  {
    question: "Wie stellt der TypedEventEmitter<Events> sicher, dass Event-Name und Payload zusammenpassen?",
    options: [
      "Durch Runtime-Validierung",
      "Durch ein Interface das Event-Namen auf Payload-Typen mappt — K extends keyof Events verknuepft sie",
      "Durch separate Interfaces pro Event",
      "Durch String-Matching",
    ],
    correct: 1,
    explanation:
      "Das Events-Interface mappt Event-Namen auf Payload-Typen. " +
      "Bei `emit<K extends keyof Events>(event: K, data: Events[K])` " +
      "inferiert TypeScript K aus dem Event-Namen und leitet daraus " +
      "den passenden Payload-Typ Events[K] ab.",
  },

  // --- Frage 12: DI Container Token ---
  {
    question: "Warum verwendet der DI Container `Token<T>` statt einfache Strings als Schluessel?",
    options: [
      "Strings sind zu langsam",
      "Token<T> traegt den Service-Typ als Phantom-Typ — resolve() kann T daraus ableiten",
      "Strings koennen nicht als Map-Keys verwendet werden",
      "Token ist ein eingebauter TypeScript-Typ",
    ],
    correct: 1,
    explanation:
      "Token<T> ist ein Phantom-Type-Traeger. Token<DatabaseService> und " +
      "Token<LoggerService> sind verschiedene Typen. Bei container.resolve(token) " +
      "leitet TypeScript T aus dem Token ab — kein expliziter Cast noetig.",
  },

  // --- Frage 13: Currying ---
  {
    question: "Was macht `curry((a: number, b: number) => a + b)`?",
    options: [
      "Es fuehrt die Funktion sofort aus",
      "Es erzeugt eine Funktion (a) => (b) => a + b — Partial Application durch verschachtelte Aufrufe",
      "Es aendert den Rueckgabetyp zu string",
      "Es cached das Ergebnis",
    ],
    correct: 1,
    explanation:
      "Currying verwandelt f(a, b) in f(a)(b). Der Vorteil: Du kannst " +
      "Teilanwendungen erstellen. curry(add)(5) gibt eine Funktion zurueck " +
      "die 5 zu jedem Argument addiert. Jeder Schritt ist typsicher.",
  },

  // --- Frage 14: Mapped Constraints ---
  {
    question: "Wie funktioniert `EventMap[K]` wenn K durch `keyof EventMap` eingeschraenkt ist?",
    options: [
      "Es gibt immer unknown zurueck",
      "TypeScript schlaegt den konkreten Typ fuer den Key K in der Map nach — voellig typsicher",
      "Es erzeugt einen Union aller Values",
      "Es gibt den Key als String zurueck",
    ],
    correct: 1,
    explanation:
      "Indexed Access Types: EventMap[K] schlaegt den Wert fuer den " +
      "konkreten Key K nach. Wenn K = 'click', wird EventMap['click'] " +
      "aufgeloest. Da K durch keyof EventMap eingeschraenkt ist, sind " +
      "nur gueltige Keys erlaubt.",
  },

  // --- Frage 15: memoize mit Generics ---
  {
    question: "Warum braucht die generische `memoize<Args, R>()` Funktion `JSON.stringify(args)` als Cache-Key?",
    options: [
      "Weil Map nur Strings als Keys akzeptiert",
      "Weil verschiedene Argument-Kombinationen verschiedene Cache-Eintraege brauchen und Arrays nicht direkt vergleichbar sind",
      "Weil JSON schneller ist",
      "Weil TypeScript das erfordert",
    ],
    correct: 1,
    explanation:
      "JavaScript vergleicht Arrays/Objekte per Referenz, nicht per Wert. " +
      "[1, 2] !== [1, 2]. JSON.stringify erzeugt einen String der den " +
      "INHALT repraesentiert — gleiche Argumente erzeugen den gleichen " +
      "String und treffen denselben Cache-Eintrag.",
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Constructor Signatures beschreiben den 'Bauplan' eines Objekts. " +
      "`new () => T` bedeutet: aufrufen mit new, keine Parameter, gibt T zurueck.",
    commonMistake:
      "Verwechslung mit normalen Funktionssignaturen. Das `new` Keyword " +
      "macht den Unterschied — ohne new waere es eine Aufruf-Signatur.",
  },
  1: {
    whyCorrect:
      "Intersection Types (T & Record<K, V>) sind additiv — sie ERWEITERN " +
      "den bestehenden Typ um neue Properties, ohne die alten zu verlieren.",
    commonMistake:
      "Viele erwarten Union Types statt Intersection. Unions waeren ODER " +
      "(eines von beiden), Intersections sind UND (beides gleichzeitig).",
  },
  2: {
    whyCorrect:
      "Leerer Stack hat kein Element. undefined ist die ehrliche Antwort. " +
      "Das erzwingt, dass der Aufrufer den leeren Fall behandelt.",
    commonMistake:
      "Manche wuerden eine Exception werfen. Das ist weniger ergonomisch — " +
      "undefined laesst sich elegant mit Optional Chaining behandeln.",
  },
  3: {
    whyCorrect:
      "Overloads sind der einzige Weg, verschiedene Typparameter fuer " +
      "variable Argument-Listen zu definieren. Jede Overload-Signatur " +
      "spezifiziert die exakten Typuebergaenge.",
    commonMistake:
      "Viele versuchen ein einziges Rest-Parameter-Generic. Das funktioniert " +
      "nicht weil TypeScript nicht wissen kann dass fns[0] A->B und fns[1] B->C " +
      "mappt.",
  },
  4: {
    whyCorrect:
      "compose erstellt eine wiederverwendbare Pipeline. pipe fuehrt sofort " +
      "aus. Die Reihenfolge bei compose ist umgekehrt (mathematische Notation).",
    commonMistake:
      "Viele verwechseln die Ausfuehrungsreihenfolge. compose(f, g)(x) " +
      "= f(g(x)), NICHT g(f(x)).",
  },
  5: {
    whyCorrect:
      "Conditional Types sind eine Compile-Zeit-Entscheidung basierend auf " +
      "der extends-Beziehung. Kein Laufzeit-Code — rein statisch.",
    commonMistake:
      "Verwechslung mit Runtime-Type-Guards (typeof, instanceof). " +
      "Conditional Types existieren nur auf Type-Level.",
  },
  6: {
    whyCorrect:
      "Rekursive Typen sind in TypeScript explizit unterstuetzt. Interfaces " +
      "koennen sich selbst referenzieren — das ist kein Fehler sondern ein Feature.",
    commonMistake:
      "Angst vor zirkulaeren Referenzen. Bei Interfaces ist Selbstreferenz " +
      "sicher weil sie lazy ausgewertet werden.",
  },
  7: {
    whyCorrect:
      "const Type Parameters (TS 5.0) verschieben die 'as const'-Verantwortung " +
      "vom Aufrufer zum API-Designer. Der Aufrufer muss nichts wissen.",
    commonMistake:
      "Verwechslung mit readonly. const T macht nicht readonly — es erzwingt " +
      "dass TypeScript den praezisesten Typ inferiert.",
  },
  8: {
    whyCorrect:
      "DeepPartial ist rekursiv: Fuer jede object-Property wird DeepPartial " +
      "erneut angewendet. Partial ist nur eine Ebene tief.",
    commonMistake:
      "Viele denken Partial ist schon deep. Partial<{ a: { b: string } }> " +
      "macht a optional, aber b bleibt PFLICHT.",
  },
  9: {
    whyCorrect:
      "Omit<T, 'id'> entfernt die id-Property. Das Repository generiert " +
      "die id intern — der Aufrufer KANN sie nicht setzen.",
    commonMistake:
      "Manche machen id einfach optional (?). Das ist schwaecher — optional " +
      "erlaubt noch das Setzen der id, Omit verhindert es komplett.",
  },
  10: {
    whyCorrect:
      "Das Events-Interface ist die 'Wahrheitsquelle'. K extends keyof Events " +
      "stellt sicher dass nur bekannte Event-Namen erlaubt sind, und " +
      "Events[K] liefert den passenden Payload.",
    commonMistake:
      "Viele versuchen separate on-Methoden pro Event. Das skaliert nicht " +
      "und verliert die zentrale Typ-Verknuepfung.",
  },
  11: {
    whyCorrect:
      "Phantom Types tragen Typinformationen ohne Laufzeit-Overhead. " +
      "Token<T> existiert zur Laufzeit nur als String-Name, aber " +
      "TypeScript kennt T fuer die Typpruefung.",
    commonMistake:
      "Viele verwenden string-Keys und casten dann manuell. " +
      "Token<T> macht den Cast ueberfluessig — TypeScript weiss den Typ.",
  },
  12: {
    whyCorrect:
      "Currying ist Partial Application: Jeder Aufruf 'fixiert' einen " +
      "Parameter und gibt eine Funktion fuer den naechsten zurueck.",
    commonMistake:
      "Verwechslung mit sofortiger Ausfuehrung. curry(fn) fuehrt fn " +
      "NICHT aus — es erzeugt eine neue Funktion.",
  },
  13: {
    whyCorrect:
      "Indexed Access Types (EventMap[K]) sind TypeScripts Mechanismus " +
      "fuer dynamisches Typ-Lookup. Wie ein Objekt-Zugriff, aber auf Type-Level.",
    commonMistake:
      "Viele denken EventMap[K] gibt einen Union aller Values. Nein — " +
      "es gibt den KONKRETEN Typ fuer den konkreten Key K zurueck.",
  },
  14: {
    whyCorrect:
      "JSON.stringify erzeugt eine deterministische String-Repraesentation. " +
      "Gleiche Argumente = gleicher String = Cache-Hit.",
    commonMistake:
      "Viele vergessen dass [1,2] !== [1,2] in JavaScript. Ohne " +
      "Serialisierung wuerde der Cache nie treffen.",
  },
};
