/**
 * Lektion 15 — Quiz-Daten: Utility Types
 *
 * Exportiert nur die Fragen (ohne runQuiz aufzurufen),
 * damit der Review-Runner sie importieren kann.
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "15";
export const lessonTitle = "Utility Types";

export const questions: QuizQuestion[] = [
  // --- Frage 1: Partial Grundlagen ---
  {
    question: "Was macht `Partial<User>` mit dem User-Interface?",
    options: [
      "Macht alle Properties optional",
      "Entfernt alle Properties",
      "Macht alle Properties readonly",
      "Macht alle Properties zu string",
    ],
    correct: 0,
    explanation:
      "Partial<T> macht ALLE Properties optional (fuegt ? hinzu). " +
      "Das ist ideal fuer Update-Operationen wo nur geaenderte Felder gesendet werden. " +
      "Intern: { [P in keyof T]?: T[P] }.",
  },

  // --- Frage 2: Required Effekt ---
  {
    question: "Was passiert bei `Required<{ name?: string; age?: number }>`?",
    options: [
      "Alles wird readonly",
      "Alles wird nullable",
      "Alle optionalen Properties werden Pflichtfelder",
      "Nichts — Required hat keinen Effekt auf optionale Properties",
    ],
    correct: 2,
    explanation:
      "Required<T> entfernt das ? von allen Properties. name und age werden " +
      "zu Pflichtfeldern (string und number statt string | undefined und number | undefined). " +
      "Intern: { [P in keyof T]-?: T[P] }.",
  },

  // --- Frage 3: Readonly shallow ---
  {
    question: "Ist `Readonly<T>` deep oder shallow?",
    options: [
      "Deep — alle verschachtelten Properties werden readonly",
      "Abhaengig von strictNullChecks",
      "Weder noch — Readonly schuetzt nur Primitives",
      "Shallow — nur die erste Ebene wird readonly",
    ],
    correct: 3,
    explanation:
      "Readonly<T> ist SHALLOW — es macht nur die Properties der ersten Ebene " +
      "readonly. Verschachtelte Objekte koennen weiterhin veraendert werden. " +
      "Fuer tiefe Unveraenderlichkeit braucht man DeepReadonly.",
    code: "const x: Readonly<{ a: { b: string } }> = { a: { b: 'hi' } };\nx.a.b = 'changed'; // KEIN Error!",
  },

  // --- Frage 4: Pick vs Omit ---
  {
    question: "Welcher Utility Type ist NICHT typsicher bei den Keys?",
    options: [
      "Omit<T, K>",
      "Pick<T, K>",
      "Record<K, V>",
      "Required<T>",
    ],
    correct: 0,
    explanation:
      "Omit<T, K> akzeptiert BELIEBIGE Strings als K — nicht nur Keys von T. " +
      "Das bedeutet: Omit<User, 'tippfehler'> erzeugt keinen Error! " +
      "Pick<T, K> hingegen erzwingt K extends keyof T. " +
      "Loesung: StrictOmit<T, K extends keyof T> = Omit<T, K>.",
    code: "type Broken = Omit<User, 'passwort'>; // Tippfehler — kein Error!",
  },

  // --- Frage 5: Record Grundlagen ---
  {
    question: "Was beschreibt `Record<'a' | 'b' | 'c', number>` am besten?",
    options: [
      "Ein Array mit 3 Elementen",
      "Ein Objekt mit genau den Keys 'a', 'b', 'c' und number-Werten",
      "Ein Union von 3 number-Typen",
      "Ein Map mit string-Keys",
    ],
    correct: 1,
    explanation:
      "Record<K, V> erstellt ein Objekt mit den angegebenen Keys und dem " +
      "Value-Typ V. Bei Record<'a'|'b'|'c', number> muessen genau drei " +
      "Properties vorhanden sein — alle mit number-Werten. Fehlt ein Key " +
      "oder kommt ein Extra-Key dazu, ist es ein Compile-Error.",
  },

  // --- Frage 6: Exclude Mechanismus ---
  {
    question: "Was ist das Ergebnis von `Exclude<'a' | 'b' | 'c', 'a' | 'c'>`?",
    options: [
      '"a" | "c"',
      '"a" | "b" | "c"',
      'never',
      '"b"',
    ],
    correct: 3,
    explanation:
      "Exclude entfernt die angegebenen Mitglieder aus dem Union. " +
      "'a' und 'c' werden entfernt, 'b' bleibt. " +
      "Intern: T extends U ? never : T — distributiv auf jedes Mitglied angewendet.",
  },

  // --- Frage 7: Extract vs Exclude ---
  {
    question: "Was ist `Extract<string | number | boolean, string | number>`?",
    options: [
      "boolean",
      "string | number",
      "string | number | boolean",
      "never",
    ],
    correct: 1,
    explanation:
      "Extract behaelt nur die Mitglieder die dem zweiten Typ zuweisbar sind. " +
      "string ist string zuweisbar (behalten), number ist number zuweisbar (behalten), " +
      "boolean ist weder string noch number zuweisbar (entfernt).",
  },

  // --- Frage 8: NonNullable ---
  {
    question: "Was ist `NonNullable<string | null | undefined | number>`?",
    options: [
      "string | null | number",
      "string | number",
      "string",
      "null | undefined",
    ],
    correct: 1,
    explanation:
      "NonNullable<T> entfernt null UND undefined aus dem Typ. " +
      "Es ist ein Spezialfall von Exclude: Exclude<T, null | undefined>. " +
      "string und number bleiben, null und undefined werden entfernt.",
  },

  // --- Frage 9: ReturnType + typeof ---
  {
    question: "Warum braucht man `typeof` bei `ReturnType<typeof myFunc>`?",
    options: [
      "ReturnType erwartet einen TYP, nicht einen Wert — typeof extrahiert den Typ",
      "typeof ist optional — beide Formen funktionieren",
      "typeof macht die Funktion async",
      "typeof ist ein Runtime-Operator",
    ],
    correct: 0,
    explanation:
      "ReturnType<T> erwartet einen Funktions-TYP als Typ-Parameter. " +
      "myFunc ist ein Wert (die Funktion selbst). typeof extrahiert den " +
      "TypeScript-Typ aus einem Wert. Ohne typeof wuerde TypeScript " +
      "myFunc als Wert interpretieren — in einer Typ-Position ein Fehler.",
    code: "function f() { return 42; }\ntype R = ReturnType<typeof f>; // number\n// type R = ReturnType<f>;       // Error!",
  },

  // --- Frage 10: Awaited verschachtelt ---
  {
    question: "Was ist `Awaited<Promise<Promise<string>>>`?",
    options: [
      "Promise<string>",
      "Promise<Promise<string>>",
      "string",
      "Error — verschachtelte Promises nicht unterstuetzt",
    ],
    correct: 2,
    explanation:
      "Awaited<T> entpackt Promises REKURSIV — nicht nur eine Ebene. " +
      "Promise<Promise<string>> wird zu string. " +
      "Auch Promise<Promise<Promise<number>>> wird zu number. " +
      "Nicht-Promises bleiben unveraendert: Awaited<string> ist string.",
  },

  // --- Frage 11: Parameters Rueckgabe ---
  {
    question: "Was gibt `Parameters<typeof fn>` zurueck wenn fn = (a: string, b: number) => void?",
    options: [
      "string | number",
      "[a: string, b: number]",
      "{ a: string; b: number }",
      "void",
    ],
    correct: 1,
    explanation:
      "Parameters<T> gibt die Parameter als TUPLE zurueck — nicht als Union oder Objekt. " +
      "Tuples bewahren Reihenfolge und Laenge. " +
      "Parameters<typeof fn>[0] waere string, [1] waere number.",
  },

  // --- Frage 12: DeepPartial Rekursion ---
  {
    question: "Warum braucht DeepPartial eine Fallunterscheidung fuer Arrays?",
    options: [
      "Arrays sind keine Objekte in TypeScript",
      "TypeScript kann keine rekursiven Typen",
      "Ohne Sonderbehandlung wuerde das Array selbst als Objekt behandelt und seine Methoden optional gemacht",
      "Arrays koennen nicht partial sein",
    ],
    correct: 2,
    explanation:
      "Arrays sind technisch Objekte. Ohne Sonderbehandlung wuerde " +
      "DeepPartial die Array-Methoden (push, pop, etc.) optional machen " +
      "statt den ELEMENT-Typ rekursiv zu transformieren. " +
      "Deshalb: T extends (infer U)[] ? DeepPartial<U>[] : ...",
  },

  // --- Frage 13: Mutable Modifier ---
  {
    question: "Was bedeutet `-readonly` in einem Mapped Type?",
    options: [
      "Fuegt readonly hinzu",
      "Macht die Property negativ",
      "Syntax-Error — es gibt kein -readonly",
      "Entfernt readonly von allen Properties",
    ],
    correct: 3,
    explanation:
      "Das Minus-Zeichen (-) ENTFERNT einen Modifier. " +
      "-readonly entfernt readonly, -? entfernt optional. " +
      "Required<T> nutzt -? intern: { [P in keyof T]-?: T[P] }. " +
      "Mutable<T> nutzt -readonly: { -readonly [P in keyof T]: T[P] }.",
  },

  // --- Frage 14: Composition Pattern ---
  {
    question: "Was beschreibt `Pick<T, K> & Partial<Omit<T, K>>` am besten?",
    options: [
      "Alle Properties required",
      "Alle Properties optional",
      "K bleibt wie im Original, Rest wird optional",
      "K wird entfernt, Rest bleibt",
    ],
    correct: 2,
    explanation:
      "Pick<T, K> behaelt K mit dem Original-Typ (required wenn es required war). " +
      "Partial<Omit<T, K>> macht den gesamten Rest optional. " +
      "Die Intersection (&) kombiniert beides. " +
      "Das ist DAS Pattern fuer 'id required, Rest optional' in Update-Operationen.",
    code: "type Update = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;\n// id: required, Rest: optional",
  },

  // --- Frage 15: Awaited + ReturnType ---
  {
    question: "Was ist das Standard-Pattern um den 'echten' Rueckgabetyp einer async Funktion zu bekommen?",
    options: [
      "Awaited<ReturnType<typeof fn>>",
      "Awaited<typeof fn>",
      "ReturnType<typeof fn>",
      "Parameters<typeof fn>",
    ],
    correct: 0,
    explanation:
      "ReturnType<typeof fn> gibt bei async Funktionen Promise<...> zurueck. " +
      "Awaited entpackt das Promise. Die Kombination Awaited<ReturnType<typeof fn>> " +
      "gibt den 'wahren' Rueckgabetyp — ohne Promise-Wrapper. " +
      "Das ist eines der haeufigsten Patterns in TypeScript-Projekten.",
    code: "async function fetchUser() { return { name: 'Max' }; }\ntype User = Awaited<ReturnType<typeof fetchUser>>;\n// { name: string }",
  },

  // ─── Zusaetzliche Frageformate ────────────────────────────────────────────

  // --- Frage 16: Short-Answer ---
  {
    type: "short-answer",
    question: "Welchen Utility Type verwendet man um alle Properties optional zu machen?",
    expectedAnswer: "Partial",
    acceptableAnswers: ["Partial", "Partial<T>"],
    explanation:
      "Partial<T> macht alle Properties von T optional. " +
      "Intern: { [P in keyof T]?: T[P] }. Ideal fuer Update-Operationen " +
      "wo nur geaenderte Felder mitgeschickt werden.",
  },

  // --- Frage 17: Short-Answer ---
  {
    type: "short-answer",
    question: "Was bedeutet das Minus-Zeichen in { -readonly [P in keyof T]: T[P] }? Wie heisst der entstehende Typ?",
    expectedAnswer: "Mutable",
    acceptableAnswers: ["Mutable", "Mutable<T>", "entfernt readonly", "Modifier entfernen"],
    explanation:
      "Das Minus-Zeichen (-) ENTFERNT einen Modifier. -readonly entfernt " +
      "readonly von allen Properties. Der entstehende Typ wird oft Mutable<T> " +
      "genannt — das Gegenteil von Readonly<T>.",
  },

  // --- Frage 18: Short-Answer ---
  {
    type: "short-answer",
    question: "Welcher Utility Type entfernt null und undefined aus einem Union Type?",
    expectedAnswer: "NonNullable",
    acceptableAnswers: ["NonNullable", "NonNullable<T>"],
    explanation:
      "NonNullable<T> ist ein Spezialfall von Exclude: Exclude<T, null | undefined>. " +
      "Es entfernt sowohl null als auch undefined aus dem Typ. " +
      "NonNullable<string | null | undefined> ergibt string.",
  },

  // --- Frage 19: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ hat result? Gib den praezisen Typ an.",
    code: "type User = { name: string; age: number; email: string };\ntype Result = Pick<User, 'name' | 'email'>;\n// Was sind die Properties von Result?",
    expectedAnswer: "{ name: string; email: string }",
    acceptableAnswers: ["{ name: string; email: string }", "name: string, email: string", "name und email"],
    explanation:
      "Pick<User, 'name' | 'email'> waehlt nur die Properties 'name' und 'email' " +
      "aus User aus. age wird nicht uebernommen. Pick ist typsicher — " +
      "Pick<User, 'tippfehler'> waere ein Compile-Error.",
  },

  // --- Frage 20: Predict-Output ---
  {
    type: "predict-output",
    question: "Welchen Typ hat X? Gib den praezisen Typ an.",
    code: "type X = Exclude<'a' | 'b' | 'c' | 'd', 'b' | 'd'>;",
    expectedAnswer: "'a' | 'c'",
    acceptableAnswers: ["'a' | 'c'", "\"a\" | \"c\"", "a | c"],
    explanation:
      "Exclude entfernt distributiv: 'a' bleibt (nicht in 'b'|'d'), " +
      "'b' wird entfernt, 'c' bleibt, 'd' wird entfernt. " +
      "Ergebnis: 'a' | 'c'. Exclude arbeitet Mitglied fuer Mitglied.",
  },

  // --- Frage 21: Explain-Why ---
  {
    type: "explain-why",
    question: "Warum ist Readonly<T> in TypeScript nur shallow und nicht deep? Welche Konsequenz hat das fuer verschachtelte Objekte?",
    modelAnswer:
      "Readonly<T> verwendet { readonly [P in keyof T]: T[P] } — es wirkt nur auf " +
      "die direkte Ebene. Verschachtelte Objekte sind eigene Referenzen die nicht " +
      "von Readonly erfasst werden. Das bedeutet: obj.nested.prop = 'new' ist erlaubt, " +
      "obwohl obj readonly ist. Fuer tiefe Unveraenderlichkeit braucht man ein " +
      "rekursives DeepReadonly<T> das sich auf jede Ebene selbst anwendet.",
    keyPoints: [
      "Mapped Types wirken nur auf eine Ebene",
      "Verschachtelte Objekte bleiben mutable",
      "DeepReadonly<T> ist noetig fuer tiefe Unveraenderlichkeit",
    ],
  },
];

// ─── Elaborated Feedback ────────────────────────────────────────────────────
// Zusaetzliche Erklaerungen fuer jede Frage: Warum die richtige Antwort
// richtig ist und welche Fehlkonzeption am haeufigsten vorkommt.

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: {
    whyCorrect:
      "Partial<T> iteriert ueber alle Keys von T und fuegt jeweils ? hinzu. " +
      "Das ist ein Mapped Type: { [P in keyof T]?: T[P] }.",
    commonMistake:
      "Viele verwechseln Partial mit Pick — Partial macht ALLE optional, " +
      "Pick waehlt bestimmte aus.",
  },
  1: {
    whyCorrect:
      "Required<T> entfernt das ? mit dem -? Modifier. " +
      "Jede optionale Property wird zu einer Pflicht-Property.",
    commonMistake:
      "Manche denken Required fuegt neue Properties hinzu. " +
      "Es aendert nur den Modifier (optional -> required).",
  },
  2: {
    whyCorrect:
      "Readonly<T> verwendet { readonly [P in keyof T]: T[P] } — das wirkt " +
      "nur auf die direkte Ebene. Verschachtelte Objekte sind separate Referenzen.",
    commonMistake:
      "Fast jeder nimmt an, Readonly waere deep. Das ist der haeufigste " +
      "Utility-Type-Irrtum. Fuer deep: eigenes DeepReadonly bauen.",
  },
  3: {
    whyCorrect:
      "Omit ist definiert als Omit<T, K extends string | number | symbol> — " +
      "K muss kein Key von T sein. Das wurde fuer Flexibilitaet so designed.",
    commonMistake:
      "Die meisten erwarten, dass Omit nur existierende Keys akzeptiert. " +
      "StrictOmit<T, K extends keyof T> ist die sichere Alternative.",
  },
  4: {
    whyCorrect:
      "Record<K, V> mit einem Union als K erzeugt ein Objekt mit exakt " +
      "diesen Keys. Fehlt einer oder kommt ein Extra, gibt es einen Fehler.",
    commonMistake:
      "Record wird mit Map verwechselt. Record ist ein Typ-Alias fuer ein Objekt, " +
      "Map ist eine Laufzeit-Datenstruktur.",
  },
  5: {
    whyCorrect:
      "Exclude ist distributiv: Jedes Mitglied wird einzeln geprueft. " +
      "'a' extends 'a'|'c'? never. 'b' extends 'a'|'c'? 'b'. 'c' extends 'a'|'c'? never.",
    commonMistake:
      "Manche verwechseln Exclude mit Extract. " +
      "Exclude ENTFERNT, Extract BEHAELT.",
  },
  6: {
    whyCorrect:
      "Extract behaelt Mitglieder die dem Zieltyp zuweisbar sind. " +
      "string ist string zuweisbar, number ist number zuweisbar, boolean ist keines von beiden.",
    commonMistake:
      "Extract und Exclude werden verwechselt. " +
      "Merkhilfe: Extract = behalten (extrahieren), Exclude = entfernen (ausschliessen).",
  },
  7: {
    whyCorrect:
      "NonNullable ist Exclude<T, null | undefined>. " +
      "Es entfernt beide Nullable-Typen aus dem Union.",
    commonMistake:
      "Manche denken NonNullable entfernt nur null, nicht undefined. " +
      "Es entfernt BEIDES.",
  },
  8: {
    whyCorrect:
      "TypeScript unterscheidet strikt zwischen Werten und Typen. " +
      "typeof ist die Bruecke: Es extrahiert den Typ aus einem Wert.",
    commonMistake:
      "Viele vergessen typeof und bekommen dann den Error " +
      "'myFunc refers to a value, but is being used as a type here'.",
  },
  9: {
    whyCorrect:
      "Awaited entpackt rekursiv — es ruft sich selbst auf bis kein " +
      "Promise mehr uebrig ist. Das wurde in TS 4.5 eingefuehrt.",
    commonMistake:
      "Vor TS 4.5 musste man manuell entpacken. Verschachtelte Promises " +
      "erforderten mehrfache Anwendung. Awaited loest das.",
  },
  10: {
    whyCorrect:
      "Parameters gibt ein Tuple — geordnet, mit fester Laenge. " +
      "Das bewahrt die Parameterreihenfolge und ermoeglicht Spread-Syntax.",
    commonMistake:
      "Manche erwarten ein Objekt mit benannten Properties. " +
      "Funktionsparameter haben keine 'Keys' — nur Positionen.",
  },
  11: {
    whyCorrect:
      "Arrays erben von Object. Ohne Sonderbehandlung wuerde keyof " +
      "auf Array-Methoden iterieren statt auf den Element-Typ.",
    commonMistake:
      "Viele vergessen die Array-Sonderbehandlung und wundern sich " +
      "warum push, pop etc. optional werden.",
  },
  12: {
    whyCorrect:
      "- ist der Modifier-Entferner. -readonly entfernt readonly, " +
      "-? entfernt optional. + ist der Default (hinzufuegen).",
    commonMistake:
      "Manche halten -readonly fuer invalid. Es ist ein offizielles " +
      "TypeScript-Feature seit TS 2.8.",
  },
  13: {
    whyCorrect:
      "Die Intersection (&) kombiniert Pick (required Keys) mit " +
      "Partial<Omit> (optionaler Rest). Das ergibt das PartialExcept-Pattern.",
    commonMistake:
      "Die Reihenfolge wird verwechselt: Pick<T,K> & Partial<Omit<T,K>> " +
      "(K required) vs Partial<T> & Required<Pick<T,K>> (K explizit required).",
  },
  14: {
    whyCorrect:
      "ReturnType gibt Promise<X>, Awaited entpackt zu X. " +
      "Die Kombination ist standard fuer async-Funktions-Typ-Extraktion.",
    commonMistake:
      "Viele vergessen Awaited und arbeiten dann mit Promise<...> statt " +
      "dem unwrapped Typ. Oder sie nutzen ReturnType allein.",
  },
};
