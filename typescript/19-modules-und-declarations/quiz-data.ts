/**
 * Lektion 19 — Quiz-Daten: Modules & Declarations
 */
import type { QuizQuestion } from '../tools/quiz-runner.ts';

export const lessonId = "19";
export const lessonTitle = "Modules & Declarations";

export const questions: QuizQuestion[] = [
  { question: "Was ist der Unterschied zwischen Named Exports und Default Exports?", options: ["Kein Unterschied", "Named: fester Name, Default: Name beim Import frei waehlbar", "Default ist schneller", "Named funktioniert nur mit Interfaces"], correct: 1, explanation: "Named Exports haben einen festen Namen. Default Exports koennen beim Import umbenannt werden — das kann zu Inkonsistenzen fuehren." },
  { question: "Was macht `import type { User } from './types'`?", options: ["Importiert User als Wert", "Importiert User NUR als Typ — wird beim Compilieren komplett entfernt", "Importiert User als Klasse", "Erstellt eine Kopie von User"], correct: 1, explanation: "Type-Only Imports werden beim Compilieren entfernt und erzeugen keinen JavaScript-Code." },
  { question: "Was ist ein Barrel File?", options: ["Eine komprimierte Datei", "Eine index.ts die Exports mehrerer Module re-exportiert", "Eine Konfigurationsdatei", "Ein Test-File"], correct: 1, explanation: "Barrel Files buendeln Exports eines Verzeichnisses in einer index.ts fuer einfacheren Import." },
  { question: "Was macht `esModuleInterop: true` in tsconfig.json?", options: ["Deaktiviert Module", "Ermoeglicht Default-Imports aus CommonJS-Modulen", "Aktiviert ES2020", "Deaktiviert Type-Checking"], correct: 1, explanation: "esModuleInterop fuegt Helfer-Code hinzu der CJS module.exports als Default-Export behandelt." },
  { question: "Was ist `moduleResolution: 'bundler'`?", options: ["Fuer Browser", "Moderne Module Resolution die package.json 'exports' nutzt, optimiert fuer Bundler", "Veraltet", "Nur fuer Node.js"], correct: 1, explanation: "bundler ist die empfohlene Resolution fuer Projekte mit Vite, Webpack etc." },
  { question: "Was ist eine .d.ts Datei?", options: ["Eine TypeScript-Datei", "Eine Declaration File — beschreibt Typen ohne Implementierung", "Eine JavaScript-Datei", "Eine Config-Datei"], correct: 1, explanation: ".d.ts Dateien enthalten nur Typ-Definitionen, keinen ausfuehrbaren Code." },
  { question: "Was macht `declare const API_URL: string`?", options: ["Deklariert eine Variable", "Sagt TypeScript dass API_URL existiert aber woanders definiert ist", "Erstellt eine Konstante", "Exportiert API_URL"], correct: 1, explanation: "declare teilt TypeScript mit dass ein Wert existiert, ohne ihn zu implementieren. Nuetzlich fuer globale Variablen." },
  { question: "Wie installiert man Typen fuer eine Library ohne eingebaute Typen?", options: ["npm install types", "npm install @types/library-name", "Nicht moeglich", "npm install --types library-name"], correct: 1, explanation: "@types/library-name installiert Community-gepflegte Typen von DefinitelyTyped." },
  { question: "Was macht `declare module 'my-lib' { ... }`?", options: ["Installiert die Library", "Erstellt Typ-Definitionen fuer ein externes Modul", "Erstellt ein neues Modul", "Entfernt die Library"], correct: 1, explanation: "declare module definiert oder erweitert die Typ-Signatur eines externen Moduls." },
  { question: "Wie erweitert man das Express Request-Objekt um eigene Properties?", options: ["Vererbung", "Module Augmentation: declare module 'express' { interface Request { user: ... } }", "Monkey-Patching", "Nicht moeglich"], correct: 1, explanation: "Module Augmentation nutzt Interface Merging um bestehende Typen um neue Properties zu erweitern." },
  { question: "Warum braucht eine Augmentation-Datei `export {}`?", options: ["Best Practice", "Damit die Datei als Modul behandelt wird — sonst funktioniert declare global nicht", "Fuer Performance", "Fuer Import"], correct: 1, explanation: "Ohne import/export wird die Datei als Script behandelt. declare global und declare module funktionieren nur in Modulen." },
  { question: "Was ist Interface Merging?", options: ["Zwei Interfaces zusammenfuegen", "TypeScript merged Interfaces mit gleichem Namen automatisch — die Grundlage fuer Augmentation", "Ein Design Pattern", "Eine Vererbungsform"], correct: 1, explanation: "Interfaces mit gleichem Namen werden automatisch zusammengefuehrt. Das funktioniert auch ueber Dateigrenzen." },
  { question: "Was ist DefinitelyTyped?", options: ["Eine TypeScript-Version", "Das groesste Community-Repository fuer Type Definitions (@types)", "Ein Linter", "Ein Compiler-Plugin"], correct: 1, explanation: "DefinitelyTyped auf GitHub pflegt ueber 10.000 @types-Pakete fuer untypisierte Libraries." },
  { question: "Wann sollte man Barrel Files NICHT verwenden?", options: ["Nie", "Wenn Tree-Shaking wichtig ist — Barrels koennen alles importieren auch wenn nur Teile gebraucht werden", "Immer", "Bei kleinen Projekten"], correct: 1, explanation: "Barrel Files koennen Tree-Shaking beeintraechtigen weil der Bundler alle Exports laden muss um sie zu analysieren." },
  { question: "Was ist `declare module '*.css' { ... }`?", options: ["CSS importieren", "Wildcard Declaration — definiert Typen fuer alle .css Imports", "CSS-in-JS", "Styled Components"], correct: 1, explanation: "Wildcard Declarations (*) definieren Typen fuer alle Imports die dem Pattern entsprechen." },

  // ─── Neue Frageformate (Short-Answer, Predict-Output, Explain-Why) ─────────

  {
    type: "short-answer",
    question: "Welche Dateiendung haben TypeScript Declaration Files?",
    expectedAnswer: ".d.ts",
    acceptableAnswers: [".d.ts", "d.ts", ".d.ts Datei"],
    explanation: ".d.ts Dateien enthalten nur Typ-Definitionen ohne Implementierung. Sie sind die Bruecke zwischen JavaScript-Libraries und TypeScript.",
  },
  {
    type: "short-answer",
    question: "Wie heisst das NPM-Scope unter dem Community-Typen von DefinitelyTyped veroeffentlicht werden?",
    expectedAnswer: "@types",
    acceptableAnswers: ["@types", "@types/", "types"],
    explanation: "@types ist das Standard-Scope fuer DefinitelyTyped-Pakete. Installation mit npm install @types/library-name.",
  },
  {
    type: "short-answer",
    question: "Welches TypeScript-Feature ermoeglicht es, bestehende Interfaces ueber Dateigrenzen hinweg um neue Properties zu erweitern?",
    expectedAnswer: "Interface Merging",
    acceptableAnswers: ["Interface Merging", "Declaration Merging", "Module Augmentation", "interface merging"],
    explanation: "Interface Merging fuegt Interfaces mit gleichem Namen automatisch zusammen. Zusammen mit Module Augmentation kann man damit externe Typen erweitern.",
  },
  {
    type: "predict-output",
    question: "Wird dieser Code kompilieren? Wenn ja, warum? Wenn nein, warum nicht?",
    code: "// augment.d.ts\ndeclare module 'express' {\n  interface Request {\n    userId: string;\n  }\n}\n// Hinweis: Die Datei hat KEIN export {}",
    expectedAnswer: "Nein",
    acceptableAnswers: ["Nein", "nein", "Fehler", "funktioniert nicht", "Nein, da kein export"],
    explanation: "Ohne export {} oder einen anderen Import/Export wird die Datei als Script behandelt. declare module funktioniert in Scripts anders — es deklariert ein Ambient Module statt eine Augmentation. Fuer Module Augmentation muss die Datei ein Modul sein (export {} hinzufuegen).",
  },
  {
    type: "predict-output",
    question: "Was passiert wenn man `import type { User } from './types'` kompiliert? Was steht im JavaScript-Output fuer diese Zeile?",
    code: "import type { User } from './types';\n\nconst name: User['name'] = 'Max';",
    expectedAnswer: "Nichts",
    acceptableAnswers: ["Nichts", "nichts", "wird entfernt", "leere Zeile", "kein Output", "die Zeile verschwindet"],
    explanation: "Type-Only Imports werden beim Compilieren komplett entfernt. Im JavaScript-Output erscheint kein import-Statement fuer User — nur const name = 'Max';.",
  },
  {
    type: "explain-why",
    question: "Warum koennen Barrel Files (index.ts mit Re-Exports) das Tree-Shaking von Bundlern negativ beeinflussen?",
    modelAnswer: "Wenn ein Consumer nur eine einzelne Funktion aus einem Barrel File importiert, muss der Bundler trotzdem alle Re-Exports analysieren. Bei Modulen mit Side-Effects (z.B. Top-Level-Code) kann der Bundler nicht sicher entscheiden was entfernt werden darf, und laesst potenziell ungenutzten Code im Bundle. Ausserdem fuehren Barrel Files zu laengeren Import-Ketten, was die Analyse fuer den Bundler erschwert.",
    keyPoints: ["Bundler muss alle Re-Exports laden und analysieren", "Side-Effects verhindern sicheres Entfernen", "Laengere Import-Ketten erschweren statische Analyse", "Direkte Imports umgehen das Problem"],
  },
];

export interface ElaboratedFeedback { whyCorrect: string; commonMistake: string; }
export const elaboratedFeedback: Record<number, ElaboratedFeedback> = {
  0: { whyCorrect: "Named Exports sind refactoring-sicherer weil der Name fest ist.", commonMistake: "Default Exports verwenden und dann verschiedene Namen beim Import nutzen." },
  1: { whyCorrect: "Type-Only Imports verhindern ungewollte Side-Effects und reduzieren Bundle-Groesse.", commonMistake: "Alle Imports normal machen und sich auf den Bundler verlassen." },
  2: { whyCorrect: "Barrel Files vereinfachen Imports: ein Import statt vieler einzelner.", commonMistake: "Zu viele Barrel Files die Tree-Shaking beeintraechtigen." },
  3: { whyCorrect: "esModuleInterop macht CJS-Module kompatibel mit ESM Default-Import-Syntax.", commonMistake: "Vergessen esModuleInterop zu aktivieren und Namespace-Imports (import * as) ueberall nutzen." },
  4: { whyCorrect: "bundler ist optimiert fuer Vite, Webpack und aehnliche Tools.", commonMistake: "node statt bundler verwenden bei Projekten die einen Bundler nutzen." },
  5: { whyCorrect: ".d.ts Dateien sind die Bruecke zwischen JavaScript-Libraries und TypeScript.", commonMistake: "Implementierungs-Code in .d.ts Dateien schreiben." },
  6: { whyCorrect: "declare informiert TypeScript ueber Werte die ausserhalb von TS existieren.", commonMistake: "declare verwechseln mit const — declare erzeugt KEINEN Code." },
  7: { whyCorrect: "@types/ ist das Standard-Paket-Namensschema fuer DefinitelyTyped.", commonMistake: "Eigene Typen schreiben obwohl es bereits @types gibt." },
  8: { whyCorrect: "declare module erstellt oder erweitert Typen fuer externe Module.", commonMistake: "Die Datei nicht als Modul markieren (export {} vergessen)." },
  9: { whyCorrect: "Module Augmentation + Interface Merging = typsichere Erweiterung bestehender Typen.", commonMistake: "as any Casts statt Augmentation verwenden." },
  10: { whyCorrect: "Ohne export/import ist die Datei ein Script — declare global funktioniert nicht.", commonMistake: "export {} vergessen und sich wundern warum die Augmentation nicht greift." },
  11: { whyCorrect: "Interface Merging ist automatisch und fundamental fuer das TypeScript-Typsystem.", commonMistake: "Denken dass Interface Merging nur mit declare module funktioniert." },
  12: { whyCorrect: "DefinitelyTyped ist die groesste Sammlung von Community-gepflegten Typen.", commonMistake: "Nicht wissen dass @types existiert und alles selber tippen." },
  13: { whyCorrect: "Barrel Files importieren transitiv alles — das kann Tree-Shaking erschweren.", commonMistake: "Barrel Files ueberall verwenden ohne ueber die Bundle-Groesse nachzudenken." },
  14: { whyCorrect: "Wildcard Declarations decken alle Imports eines Patterns ab.", commonMistake: "Fuer jede CSS-Datei einzeln eine Declaration schreiben." },
};
