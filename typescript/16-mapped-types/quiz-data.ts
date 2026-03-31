/**
 * Lektion 16 — Quiz-Daten: Mapped Types
 */

import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "16";
export const lessonTitle = "Mapped Types";

export const questions: QuizQuestion[] = [
  {
    question: "Was beschreibt die Syntax `{ [K in keyof T]: T[K] }`?",
    options: [
      "Einen Mapped Type der ueber alle Keys von T iteriert und den jeweiligen Wert-Typ behaelt",
      "Eine for-Schleife ueber ein Array",
      "Eine Funktion die T kopiert",
      "Ein Interface das T erweitert",
    ],
    correct: 0,
    explanation: "Mapped Types iterieren mit `K in keyof T` ueber alle Keys und erzeugen fuer jeden Key eine Property mit dem Typ T[K].",
  },
  {
    question: "Was bewirkt der Modifier `-?` in einem Mapped Type?",
    options: [
      "Fuegt optional hinzu",
      "Entfernt optional — macht die Property zur Pflicht",
      "Entfernt die Property komplett",
      "Macht die Property nullable",
    ],
    correct: 1,
    explanation: "Minus-Fragezeichen (-?) entfernt den optionalen Modifier. So funktioniert Required<T> intern: { [K in keyof T]-?: T[K] }.",
  },
  {
    question: "Was bewirkt `-readonly` in einem Mapped Type?",
    options: [
      "Fuegt readonly hinzu",
      "Macht die Property optional",
      "Entfernt readonly — macht die Property wieder beschreibbar",
      "Erzeugt einen Fehler",
    ],
    correct: 2,
    explanation: "-readonly entfernt den readonly-Modifier. Das ist das Gegenteil von Readonly<T> — oft als Mutable<T> verwendet.",
  },
  {
    question: "Was ist ein 'homomorpher' Mapped Type?",
    options: [
      "Ein Mapped Type der nur Strings akzeptiert",
      "Ein Mapped Type der rekursiv ist",
      "Ein Mapped Type ohne Conditionals",
      "Ein Mapped Type der `keyof T` als Source verwendet und Original-Modifier bewahrt",
    ],
    correct: 3,
    explanation: "Homomorphe Mapped Types verwenden keyof T und bewahren dadurch readonly und optional vom Original — es sei denn man aendert sie explizit.",
  },
  {
    question: "Was macht die `as`-Clause in `[K in keyof T as NewKey]`?",
    options: [
      "Type Assertion",
      "Key Remapping — benennt die Keys um",
      "Type Guard",
      "Typ-Konvertierung",
    ],
    correct: 1,
    explanation: "Die as-Clause (TS 4.1) ermoeglicht Key Remapping: Keys umbenennen, mit Template Literals transformieren oder mit never filtern.",
  },
  {
    question: "Was passiert wenn das Key Remapping `never` ergibt?",
    options: [
      "Die Property wird komplett entfernt",
      "Die Property bekommt den Typ never",
      "Es gibt einen Compile-Fehler",
      "Die Property wird optional",
    ],
    correct: 0,
    explanation: "never im Key Remapping filtert den Key heraus. Das ist wie filter() fuer Object-Keys auf Type-Level.",
    code: "type NoStrings<T> = {\n  [K in keyof T as T[K] extends string ? never : K]: T[K];\n};",
  },
  {
    question: "Was erzeugt `[K in keyof T as \\`get${Capitalize<string & K>}\\`]: () => T[K]`?",
    options: [
      "Properties mit dem Prefix 'get'",
      "Getter-Methoden: getName(), getEmail(), etc. mit korrektem Rueckgabetyp",
      "String-Properties",
      "Eine Funktion get()",
    ],
    correct: 1,
    explanation: "Template Literal Types im Key Remapping generieren neue Key-Namen. Capitalize<K> macht den ersten Buchstaben gross.",
  },
  {
    question: "Warum braucht man `string & K` in Template Literal Keys?",
    options: [
      "Performance-Optimierung",
      "Weil K immer ein number ist",
      "Weil keyof T auch number | symbol enthalten kann — die Intersection filtert auf string",
      "Weil TypeScript es erfordert",
    ],
    correct: 2,
    explanation: "keyof T gibt string | number | symbol zurueck. Template Literal Types funktionieren nur mit string. `string & K` filtert auf string-Keys.",
  },
  {
    question: "Wie prueft man ob eine Property optional ist?",
    options: [
      "T[K] extends undefined",
      "K extends optional",
      "typeof T[K] === 'undefined'",
      "`{} extends Pick<T, K>` — wenn true, ist K optional",
    ],
    correct: 3,
    explanation: "Wenn K optional ist, kann {} (leeres Objekt ohne K) zu Pick<T, K> zugewiesen werden. Bei Pflicht-Feldern geht das nicht.",
  },
  {
    question: "Was ist der Unterschied zwischen `Partial<T>` und `DeepPartial<T>`?",
    options: [
      "Kein Unterschied",
      "Partial macht nur die erste Ebene optional, DeepPartial rekursiv alle Ebenen",
      "DeepPartial ist schneller",
      "DeepPartial funktioniert nur mit Arrays",
    ],
    correct: 1,
    explanation: "Partial<T> macht nur die direkte Ebene optional. DeepPartial prueft ob T[K] ein Objekt ist und wendet sich dann rekursiv selbst an.",
  },
  {
    question: "Was erzeugt `type FormErrors<T> = { [K in keyof T]?: string }`?",
    options: [
      "Einen Typ wo jede Property optional eine Fehlermeldung (string) sein kann",
      "Einen Typ wo alle Properties strings sind und Pflicht",
      "Einen Typ der Formulardaten validiert",
      "Einen Typ der T zu string konvertiert",
    ],
    correct: 0,
    explanation: "FormErrors<T> mappt jede Property auf einen optionalen string. Perfekt fuer Formular-Fehlermeldungen: errors.name = 'Pflichtfeld'.",
  },
  {
    question: "Was macht `type CreateDTO<T extends Entity> = Omit<T, keyof Entity>`?",
    options: [
      "Entfernt alle Properties von T",
      "Fuegt Entity-Felder hinzu",
      "Entfernt die auto-generierten Entity-Felder (id, createdAt, updatedAt) fuer POST-Requests",
      "Macht alle Properties optional",
    ],
    correct: 2,
    explanation: "Omit<T, keyof Entity> entfernt id, createdAt, updatedAt. Der Aufrufer gibt nur die 'eigenen' Felder an — die Entity-Felder werden server-seitig generiert.",
  },
  {
    question: "Was ist `type Documented<T> = { [K in keyof T]: { value: T[K]; description: string } }`?",
    options: [
      "Ein Typ der Dokumentation generiert",
      "Ein Interface fuer JSDoc",
      "Ein Runtime-Dokumentationssystem",
      "Ein Mapped Type der jede Property in ein Objekt mit value und description einpackt",
    ],
    correct: 3,
    explanation: "Dieser Mapped Type 'wrappt' jeden Wert in ein Metadaten-Objekt. Nuetzlich fuer Config-Systeme mit eingebauter Dokumentation.",
  },
  {
    question: "Was kombiniert `PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>`?",
    options: [
      "Macht NUR die angegebenen Keys optional, alle anderen bleiben Pflicht",
      "Macht alle Properties optional",
      "Entfernt die angegebenen Keys",
      "Macht die angegebenen Keys readonly",
    ],
    correct: 0,
    explanation: "Omit entfernt K, Partial+Pick macht nur K optional, & fuegt beides zusammen. Ergebnis: nur K ist optional.",
  },
  {
    question: "Welches Pattern nutzt man fuer reaktive Systeme mit Mapped Types?",
    options: [
      "FormErrors<T>",
      "CreateDTO<T>",
      "EventMap<T> — generiert {K}Changed Events mit previousValue/newValue fuer jede Property",
      "DeepReadonly<T>",
    ],
    correct: 2,
    explanation: "EventMap<T> generiert automatisch Change-Events fuer jede Property. Template Literal Keys erzeugen die Event-Namen.",
    code: "type EventMap<T> = {\n  [K in keyof T as `${string & K}Changed`]: {\n    previousValue: T[K]; newValue: T[K];\n  };\n};",
  },
];

export interface ElaboratedFeedback {
  whyCorrect: string;
  commonMistake: string;
}

export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Mapped Types sind eine Iteration ueber alle Keys eines Typs mit Transformation.", commonMistake: "Verwechslung mit for-in-Loops. Mapped Types existieren NUR auf Type-Level." },
  1: { whyCorrect: "-? entfernt optional. Das + ist implizit bei ? (= +?). Minus ist das Gegenteil.", commonMistake: "Verwechslung: -? entfernt NICHT die Property, sondern nur den optionalen Modifier." },
  2: { whyCorrect: "-readonly macht Properties wieder beschreibbar. Nuetzlich um Readonly<T> umzukehren.", commonMistake: "Manche denken -readonly wuerde die Property entfernen. Es entfernt nur den Modifier." },
  3: { whyCorrect: "Homomorphe Mapped Types bewahren die Struktur. keyof T als Source ist der Schluessel.", commonMistake: "Mapped Types mit string-Union statt keyof T sind NICHT homomorph und verlieren Modifier." },
  4: { whyCorrect: "Die as-Clause ermoeglicht maechtiges Key Remapping das vor TS 4.1 unmoeglich war.", commonMistake: "Verwechslung mit Type Assertions (value as Type). Im Mapped Type ist as fuer Key Remapping." },
  5: { whyCorrect: "never bedeutet 'nicht vorhanden'. Ein Key der never ist wird aus dem Typ entfernt.", commonMistake: "Manche erwarten dass die Property den Typ never bekommt. Nein — sie verschwindet komplett." },
  6: { whyCorrect: "Template Literal Types + Capitalize erzeugen dynamische Getter-Namen mit korrektem Typ.", commonMistake: "Vergessen von string & K. Ohne die Intersection koennte K auch number oder symbol sein." },
  7: { whyCorrect: "keyof kann auch number (Array-Indizes) und symbol (Symbol-Keys) enthalten.", commonMistake: "Annahme dass keyof immer string zurueckgibt. Bei Arrays gibt es auch number-Keys." },
  8: { whyCorrect: "Der {} extends Pick<T, K> Trick nutzt TypeScripts Zuweisbarkeitsregeln fuer optionale Properties.", commonMistake: "Versuch mit T[K] extends undefined zu pruefen — das funktioniert nicht zuverlaessig." },
  9: { whyCorrect: "Rekursion ist der Schluessel: DeepPartial wendet sich selbst auf verschachtelte Objekte an.", commonMistake: "Vergessen den Function-Check einzubauen. Ohne ihn werden auch Methoden rekursiv verarbeitet." },
  10: { whyCorrect: "Das ? macht jede Error-Property optional — nicht jedes Feld muss einen Fehler haben.", commonMistake: "Alle Properties als Pflicht-string machen — dann muesste man leere Strings fuer fehlerfreie Felder angeben." },
  11: { whyCorrect: "Omit<T, keyof Entity> entfernt genau die auto-generierten Felder fuer die API.", commonMistake: "id manuell entfernen statt keyof Entity zu nutzen. Wenn Entity neue Felder bekommt, fehlen sie." },
  12: { whyCorrect: "Mapped Types koennen den Wert-Typ beliebig transformieren — auch in komplexe Objekte.", commonMistake: "Denken dass Mapped Types nur einfache Typ-Aenderungen koennen. Sie koennen beliebig komplexe Typen erzeugen." },
  13: { whyCorrect: "Omit + Partial + Pick ist die Standard-Kombination fuer selektives Optional.", commonMistake: "Versuch einen Mapped Type mit Conditional zu bauen statt die einfache Omit+Partial+Pick Kombination." },
  14: { whyCorrect: "EventMap mit Template Literal Keys ist ein elegantes Pattern fuer Change-Tracking.", commonMistake: "Manuell Events definieren statt sie automatisch aus dem Datentyp abzuleiten." },
};
