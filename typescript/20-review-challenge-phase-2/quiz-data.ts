/**
 * Lektion 20 — Quiz-Daten: Review Challenge Phase 2
 */
import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "20";
export const lessonTitle = "Review Challenge Phase 2";

export const questions: QuizQuestion[] = [
  { question: "Was macht ein Discriminated Union sicher? (L12)", options: ["Runtime-Checks", "Ein gemeinsames Literal-Feld (Tag) das TypeScript fuer exhaustive Checks nutzt", "Generics", "any-Typ"], correct: 1, explanation: "Das Tag-Feld (z.B. type: 'circle') ermoeglicht TypeScript, in switch/if den exakten Typ zu bestimmen." },
  { question: "Was ist der Hauptvorteil von Generics gegenueber any? (L13)", options: ["Performance", "Typsicherheit bei gleichzeitiger Flexibilitaet — Fehler zur Compile-Zeit statt Laufzeit", "Kuerzerer Code", "Runtime-Checks"], correct: 1, explanation: "Generics bewahren die Typ-Information. any wirft sie weg und verliert alle Compiler-Pruefungen." },
  { question: "Was macht pipe() mit Overloads typsicher? (L14)", options: ["Ein einziger Typparameter T", "Separate Typparameter pro Schritt: A->B->C, jeder Uebergang geprueft", "Runtime-Validierung", "any-Casts"], correct: 1, explanation: "Jeder Overload definiert die Typuebergaenge fuer eine bestimmte Laenge. TypeScript prueft jeden Schritt." },
  { question: "Was macht Partial<T> intern? (L15-L16)", options: ["Entfernt Properties", "Mapped Type: { [K in keyof T]?: T[K] } — alle Properties optional", "Kopiert T", "Entfernt readonly"], correct: 1, explanation: "Partial ist ein Mapped Type der ? zu jeder Property hinzufuegt." },
  { question: "Was ist Key Remapping mit as? (L16)", options: ["Type Assertion", "Keys umbenennen oder filtern im Mapped Type: as `get${Capitalize<K>}`", "Runtime-Rename", "Import-Alias"], correct: 1, explanation: "Die as-Clause ermoeglicht Key-Transformation: umbenennen, filtern (never), oder Template-Literal-basierte Generierung." },
  { question: "Was extrahiert infer in einem Conditional Type? (L17)", options: ["Variablen-Werte", "Typ-Teile aus einem Pattern: T extends Promise<infer U> -> U = innerer Typ", "Runtime-Typen", "Module"], correct: 1, explanation: "infer deklariert einen Platzhalter den TypeScript durch Pattern Matching fuellt." },
  { question: "Was passiert bei distributiven Conditional Types mit Unions? (L17)", options: ["Nichts besonderes", "Der Conditional wird fuer JEDES Union-Member einzeln ausgewertet", "Compile-Fehler", "Nur der erste Member"], correct: 1, explanation: "Distribution: IsString<string | number> wird zu IsString<string> | IsString<number>." },
  { question: "Was erzeugt `\\`${A}${B}\\`` wenn A und B Unions sind? (L18)", options: ["A | B", "Kartesisches Produkt aller Kombinationen", "A & B", "Fehler"], correct: 1, explanation: "2 Werte in A x 3 in B = 6 String-Kombinationen als Union." },
  { question: "Was macht declare in TypeScript? (L19)", options: ["Deklariert eine Variable", "Informiert TypeScript ueber Werte die woanders existieren — erzeugt keinen Code", "Erstellt Klassen", "Exportiert Module"], correct: 1, explanation: "declare sagt: 'Dieser Wert existiert, aber nicht in meinem TypeScript-Code.' Kein JS-Output." },
  { question: "Warum braucht Module Augmentation `export {}`? (L19)", options: ["Fuer den Export", "Damit die Datei als Modul behandelt wird — declare global funktioniert nur in Modulen", "Performance", "Best Practice"], correct: 1, explanation: "Ohne export/import ist die Datei ein Script. declare global und declare module brauchen Modul-Kontext." },
  { question: "Was ist der Unterschied zwischen never im Key und im Wert eines Mapped Types? (L16)", options: ["Kein Unterschied", "Im Key: Property wird entfernt. Im Wert: Property existiert mit Typ never", "Beides entfernt die Property", "Beides erzeugt einen Fehler"], correct: 1, explanation: "never im Key Remapping (as never) entfernt den Key. never als Wert macht die Property unbenutzbar, entfernt sie aber nicht." },
  { question: "Was ist [T] extends [never] und warum braucht man die Tuples? (L17)", options: ["Syntax-Zucker", "Verhindert Distribution — prueft ob T wirklich never ist, statt ueber leeren Union zu verteilen", "Performance", "Nicht noetig"], correct: 1, explanation: "Ohne [T] wuerde Distribution bei never zuschlagen und immer never ergeben. [T] packt T in ein Tuple und verhindert das." },
  { question: "Wie generiert man Event-Handler-Namen aus Properties? (L16+L18)", options: ["Manuell", "Template Literal im Key Remapping: [K in keyof T as `on${Capitalize<K>}Change`]", "Runtime-Code", "Nicht moeglich"], correct: 1, explanation: "Mapped Types + Key Remapping + Template Literal Types + Capitalize = automatische Event-Handler-Generierung." },
  { question: "Was macht DeepPartial anders als Partial? (L16)", options: ["Nichts", "Wendet sich rekursiv auf verschachtelte Objekte an — alle Ebenen optional", "Entfernt Properties", "Macht readonly"], correct: 1, explanation: "DeepPartial prueft ob T[K] ein Objekt ist und wendet sich dann rekursiv selbst an. Partial ist nur eine Ebene tief." },
  { question: "Welche drei Konzepte bilden das 'Triumvirat' des Type Systems? (L16-L18)", options: ["Generics, Interfaces, Enums", "Mapped Types, Conditional Types, Template Literal Types", "Classes, Functions, Modules", "Union, Intersection, Literal"], correct: 1, explanation: "Mapped Types + Conditional Types + Template Literal Types zusammen ermoeglichen beliebig komplexe Typ-Transformationen." },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "Welches gemeinsame Feld macht einen Discriminated Union exhaustive pruefbar? (L12)",
    expectedAnswer: "Tag-Feld",
    acceptableAnswers: ["Tag-Feld", "Tag", "Discriminant", "Diskriminator", "type-Feld", "kind", "Literal-Feld", "tag"],
    explanation: "Ein gemeinsames Literal-Feld (z.B. type: 'circle' | type: 'rect') dient als Tag/Diskriminator. TypeScript kann damit in switch/if den exakten Typ bestimmen.",
  },
  {
    type: "short-answer",
    question: "Was ergibt `never` im Key Remapping eines Mapped Types? (L16)",
    expectedAnswer: "Property wird entfernt",
    acceptableAnswers: ["Property wird entfernt", "entfernt", "Property entfernt", "Key wird entfernt", "gefiltert", "herausgefiltert"],
    explanation: "never im Key Remapping (as never) entfernt den Key komplett aus dem Typ. Im Gegensatz dazu: never als Wert-Typ laesst die Property existieren, macht sie aber unbenutzbar.",
  },
  {
    type: "predict-output",
    question: "Was ist der resultierende Typ?",
    code: "type IsString<T> = [T] extends [string] ? true : false;\ntype Result = IsString<string | number>;",
    expectedAnswer: "false",
    acceptableAnswers: ["false", "type false"],
    explanation: "Durch [T] (Tuple-Wrapping) wird Distribution verhindert. string | number als Ganzes extends NICHT string, also Ergebnis: false. Ohne Tuple waere es true | false.",
  },
  {
    type: "predict-output",
    question: "Was ist der resultierende Typ?",
    code: "type EventHandler<T> = {\n  [K in keyof T as `on${Capitalize<string & K>}Change`]: (val: T[K]) => void;\n};\ntype Result = EventHandler<{ name: string; age: number }>;",
    expectedAnswer: "{ onNameChange: (val: string) => void; onAgeChange: (val: number) => void }",
    acceptableAnswers: ["{ onNameChange: (val: string) => void; onAgeChange: (val: number) => void }", "onNameChange: (val: string) => void, onAgeChange: (val: number) => void"],
    explanation: "Mapped Type + Key Remapping + Template Literal + Capitalize: Fuer jede Property wird ein Event-Handler generiert. name -> onNameChange, age -> onAgeChange.",
  },
  {
    type: "short-answer",
    question: "Wie heisst das Keyword mit dem man TypeScript ueber extern existierende Werte informiert, ohne Code zu erzeugen? (L19)",
    expectedAnswer: "declare",
    acceptableAnswers: ["declare", "declare keyword"],
    explanation: "declare teilt TypeScript mit dass ein Wert woanders existiert. Es erzeugt keinen JavaScript-Output — rein fuer den Compiler.",
  },
  {
    type: "explain-why",
    question: "Warum ist die Kombination aus Discriminated Unions (L12), Generics (L13) und dem Triumvirat (L16-18) so zentral fuer professionelles TypeScript?",
    modelAnswer: "Diese Konzepte bilden zusammen ein vollstaendiges Type-Level-Programmiersystem. Discriminated Unions modellieren sichere Zustandsmaschinen mit exhaustive Checks. Generics ermoeglichen wiederverwendbare, typsichere Abstraktionen. Mapped Types transformieren Objekttypen, Conditional Types ermoeglichen Verzweigungslogik, und Template Literal Types machen String-APIs typsicher. Zusammen kann man damit beliebig komplexe Domain-Modelle ausdruecken, die Fehler zur Compile-Zeit statt zur Laufzeit fangen.",
    keyPoints: ["Discriminated Unions fuer sichere Zustandsmodellierung", "Generics fuer wiederverwendbare Abstraktionen", "Das Triumvirat fuer beliebig komplexe Typ-Transformationen", "Compile-Zeit-Sicherheit statt Laufzeit-Fehler"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }
export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Das Tag-Feld ist der Diskriminator der TypeScript den exakten Union-Member bestimmen laesst.", commonMistake: "Union ohne Tag-Feld verwenden und dann manuell casten." },
  1: { whyCorrect: "Generics bewahren Typ-Information durch den gesamten Aufruf hindurch.", commonMistake: "any verwenden weil es 'einfacher' ist — verliert alle Typ-Pruefungen." },
  2: { whyCorrect: "Overloads definieren die exakten Typ-Uebergaenge fuer jede Pipe-Laenge.", commonMistake: "Ein einziger Typparameter T fuer alle Schritte — dann muessen alle denselben Typ haben." },
  3: { whyCorrect: "Partial ist ein Mapped Type mit ? Modifier. Kein Magie, reine Syntax.", commonMistake: "Denken Partial ist ein eingebautes Keyword statt ein Mapped Type." },
  4: { whyCorrect: "as-Clause ermoeglicht Key-Transformation und -Filterung im Mapped Type.", commonMistake: "Verwechslung mit Type Assertion (value as Type)." },
  5: { whyCorrect: "infer ist ein Platzhalter der durch Pattern Matching gefuellt wird.", commonMistake: "infer ausserhalb von extends verwenden wollen — geht nicht." },
  6: { whyCorrect: "Distribution verteilt automatisch ueber jeden Union-Member einzeln.", commonMistake: "Erwartung dass der Union als Ganzes geprueft wird." },
  7: { whyCorrect: "Kartesisches Produkt: jede Kombination aus A und B wird gebildet.", commonMistake: "Erwartung eines einfachen Union A | B." },
  8: { whyCorrect: "declare erzeugt keinen Code — es informiert nur den Compiler.", commonMistake: "declare mit const verwechseln und Code-Output erwarten." },
  9: { whyCorrect: "Module-Kontext ist noetig damit Augmentation korrekt gemerged wird.", commonMistake: "export {} vergessen und sich wundern warum die Typen nicht greifen." },
  10: { whyCorrect: "never im Key = Property weg. never im Wert = Property existiert mit unmoeglicerm Typ.", commonMistake: "Beides verwechseln und never im Wert fuer Filterung verwenden." },
  11: { whyCorrect: "[T] verhindert Distribution und ermoeglicht echten never-Check.", commonMistake: "T extends never direkt schreiben — das verteilt bei never zu never." },
  12: { whyCorrect: "Die drei Features kombiniert = maechtiges Code-Generierungssystem auf Type-Level.", commonMistake: "Die Features einzeln verstehen aber nie kombinieren." },
  13: { whyCorrect: "Rekursion ist der Schluessel: DeepPartial wendet sich selbst auf Objekt-Properties an.", commonMistake: "Denken Partial ist schon deep — es ist nur eine Ebene." },
  14: { whyCorrect: "Das Triumvirat zusammen ermoeglicht Type-Level-Programmierung wie in keiner anderen Sprache.", commonMistake: "Nur ein oder zwei der drei Features nutzen statt sie zu kombinieren." },
};
