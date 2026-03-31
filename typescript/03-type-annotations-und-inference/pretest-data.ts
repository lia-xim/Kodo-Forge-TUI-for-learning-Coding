/**
 * Lektion 03 — Pre-Test-Fragen: Type Annotations & Inference
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
  // ─── Sektion 1: Explizite Annotationen vs Inference ──────────────────────

  {
    sectionIndex: 1,
    question:
      "Muss man in TypeScript JEDER Variable einen Typ geben?",
    code: "let name = 'Max';\nlet alter: number = 30;",
    options: [
      "Ja, sonst ist alles `any`",
      "Nein, TypeScript kann Typen oft selbst erkennen",
      "Nur bei Funktionen, nicht bei Variablen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript hat Type Inference: Es leitet den Typ aus dem Kontext ab. " +
      "`let name = 'Max'` wird automatisch als `string` erkannt. " +
      "Explizite Annotationen sind hier ueberfluessig.",
  },
  {
    sectionIndex: 1,
    question:
      "Wo muessen Typ-Annotationen IMMER stehen, weil TypeScript " +
      "den Typ nicht ableiten kann?",
    code: "function greet(name) {\n  return `Hallo ${name}`;\n}",
    options: [
      "Bei Variablen mit Initialwert",
      "Bei Funktions-Parametern",
      "Bei `const`-Deklarationen",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Funktions-Parameter brauchen fast immer eine Annotation, weil TS " +
      "nicht weiss, womit die Funktion aufgerufen wird. Ohne Annotation " +
      "ist der Parameter implizit `any` (Fehler im strict mode).",
  },
  {
    sectionIndex: 1,
    question:
      "Wenn du `const x: string = 'hello'` schreibst — " +
      "ist die Annotation `: string` noetig?",
    options: [
      "Ja, ohne die Annotation waere x `any`",
      "Nein, TypeScript erkennt den Typ aus dem Wert",
      "Ja, bei `const` ist sie Pflicht",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Die Annotation ist ueberfluessig. TypeScript erkennt aus `'hello'` " +
      "automatisch den Typ. Bei `const` wird sogar der Literal-Typ " +
      '`"hello"` infert, was praeziser ist als `string`.',
  },

  // ─── Sektion 2: Widening (const vs let, Objekte) ────────────────────────

  {
    sectionIndex: 2,
    question:
      "Was ist der Typ von `config.method` in diesem Code?",
    code: 'const config = { method: "GET" };',
    options: [
      '`"GET"` — der exakte Wert',
      "`string` — der breite Typ",
      '`"GET" | "POST"` — ein Union',
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Obwohl `config` const ist, sind die Properties veraenderbar " +
      '(man koennte `config.method = "POST"` schreiben). Deshalb ' +
      'erweitert TypeScript den Typ zu `string`, nicht `"GET"`. ' +
      "Das nennt man Property Widening.",
  },
  {
    sectionIndex: 2,
    question:
      "Mit welchem Schluesselsort kann man verhindern, dass TypeScript " +
      "Typen automatisch erweitert?",
    code: 'const status = "active" as ???;',
    options: [
      "`as literal`",
      "`as const`",
      "`as strict`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`as const` verhindert Widening komplett. Alle Werte behalten " +
      "ihren Literal-Typ, Arrays werden zu readonly Tuples, und " +
      "Objekt-Properties werden readonly.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist der Typ eines leeren Arrays `const items = []`?",
    options: [
      "`never[]` — leeres Array",
      "`unknown[]` — unbekannter Inhalt",
      "`any[]` — TypeScript weiss es nicht",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Ein leeres Array ohne Annotation wird als `any[]` infert. " +
      "Das ist einer der wenigen Faelle, wo Inference unsicher ist. " +
      "Deshalb: leere Arrays immer annotieren!",
  },

  // ─── Sektion 3: Contextual Typing & Control Flow ────────────────────────

  {
    sectionIndex: 3,
    question:
      "Warum braucht `n` hier keine Typ-Annotation?",
    code: "const nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);",
    options: [
      "Arrow Functions haben immer Typ `any`",
      "TypeScript leitet den Typ aus dem Array-Element ab",
      "Callback-Parameter sind immer `number`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Contextual Typing: TypeScript kennt den Typ von `nums` (`number[]`) " +
      "und weiss daher, dass der .map()-Callback ein `number` bekommt.",
  },
  {
    sectionIndex: 3,
    question:
      "Wenn du einen Callback erst in einer Variable speicherst und " +
      "dann uebergibst — funktioniert Contextual Typing noch?",
    code: 'const handler = (e) => console.log(e);\ndocument.addEventListener("click", handler);',
    options: [
      "Ja, TypeScript verfolgt den Fluss",
      "Nein, der Kontext geht verloren — `e` wird `any`",
      "Nur wenn man den Handler als `const` definiert",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Contextual Typing funktioniert nur bei DIREKTER Uebergabe als " +
      "Argument. Wenn der Callback vorher in einer Variable gespeichert " +
      "wird, hat TypeScript an der Definitionsstelle keinen Kontext.",
  },
  {
    sectionIndex: 3,
    question:
      "Was ist der Typ von `value` in der if-Bedingung?",
    code: 'function f(value: string | number) {\n  if (typeof value === "string") {\n    // Hier: welcher Typ?\n  }\n}',
    options: [
      "`string | number` — unveraendert",
      "`string` — TypeScript verengt den Typ",
      "`any` — in Bedingungen wird es unbestimmt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Control Flow Analysis: TypeScript verfolgt den Code-Fluss und " +
      "verengt (narrowt) den Typ. Nach dem typeof-Check weiss TS, " +
      "dass `value` ein `string` ist.",
  },

  // ─── Sektion 4: satisfies & Best Practices ──────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Gibt es einen Weg, einen Wert gegen einen Typ zu pruefen, " +
      "OHNE den inferierten Typ zu verlieren?",
    code: "type Colors = Record<string, string>;\nconst theme: Colors = { primary: '#f00' };\n// theme.primary ist jetzt `string`, nicht `'#f00'`",
    options: [
      "Nein, Annotation ueberschreibt immer die Inference",
      "Ja, mit dem `satisfies`-Operator",
      "Ja, mit `as const`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`satisfies` validiert gegen den Typ, behaelt aber die spezifische " +
      "Inference. `theme.primary` waere dann `'#f00'` statt `string`.",
  },
  {
    sectionIndex: 4,
    question:
      "Warum gibt `Object.keys({ a: 1, b: 2 })` den Typ `string[]` " +
      "zurueck und nicht `('a' | 'b')[]`?",
    options: [
      "Das ist ein Bug in TypeScript",
      "Weil Objekte zur Laufzeit mehr Keys haben koennten",
      "Weil Object.keys() immer Strings zurueckgibt",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript ist absichtlich konservativ. Durch Vererbung oder " +
      "dynamische Zuweisung koennte ein Objekt mehr Keys haben als " +
      "der Typ beschreibt. `('a' | 'b')[]` waere technisch unsound.",
  },
  {
    sectionIndex: 4,
    question:
      "Wann sollte man den Return-Typ einer Funktion explizit annotieren?",
    code: "export function parse(input: string) {\n  // komplexe Logik mit vielen return-Pfaden\n}",
    options: [
      "Immer — Inference ist unzuverlaessig",
      "Nie — Inference ist immer korrekt",
      "Bei exportierten oder komplexen Funktionen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Bei exportierten und komplexen Funktionen ist ein expliziter " +
      "Return-Typ Best Practice. Er dokumentiert die Intention, gibt " +
      "bessere Fehler, und verhindert versehentliche Typ-Aenderungen.",
  },
];
