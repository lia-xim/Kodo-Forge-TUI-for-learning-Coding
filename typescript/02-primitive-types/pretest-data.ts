/**
 * Lektion 02 — Pre-Test-Fragen: Primitive Types
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
  // ─── Sektion 1: string, number, boolean ──────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "In TypeScript gibt es `string` (klein) und `String` (gross). " +
      "Welchen sollte man verwenden?",
    options: [
      "`String` (gross) — wie in Java",
      "`string` (klein) — den primitiven Typ",
      "Beide sind gleichwertig",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Immer `string` (klein) verwenden. `String` ist ein Wrapper-Objekt " +
      "aus JavaScript und fuehrt zu subtilen Bugs. Gleiches gilt fuer " +
      "number/Number und boolean/Boolean.",
  },
  {
    sectionIndex: 1,
    question: "Was ist das Ergebnis von `0.1 + 0.2` in JavaScript/TypeScript?",
    code: "console.log(0.1 + 0.2);",
    options: [
      "0.3",
      "0.30000000000000004",
      "NaN",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "IEEE 754 Gleitkomma-Arithmetik: 0.1 + 0.2 ergibt " +
      "0.30000000000000004, nicht exakt 0.3. Das ist kein TypeScript-Problem, " +
      "sondern ein grundlegendes Problem der Gleitkommadarstellung.",
  },
  {
    sectionIndex: 1,
    question:
      "TypeScript hat keinen `int`-Typ. Wie werden Ganzzahlen dargestellt?",
    options: [
      "Als eigenen Typ `integer`",
      "Als `number` — alles ist Gleitkomma",
      "Als `bigint` — immer",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "In JavaScript/TypeScript gibt es nur `number` (IEEE 754 64-bit Float). " +
      "Es gibt keinen separaten Ganzzahl-Typ. Fuer beliebig grosse Ganzzahlen " +
      "gibt es `bigint`, aber das ist ein separater Typ.",
  },

  // ─── Sektion 2: null, undefined, strictNullChecks ────────────────────────

  {
    sectionIndex: 2,
    question:
      "JavaScript hat zwei Werte fuer 'nichts': `null` und `undefined`. " +
      "Was gibt `typeof null` zurueck?",
    code: "console.log(typeof null);",
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      '`typeof null` gibt "object" zurueck — ein beruehmt-beruechtigter Bug ' +
      "aus 1995, der nie behoben wurde, weil zu viel Code davon abhaengt.",
  },
  {
    sectionIndex: 2,
    question:
      "Wenn eine Variable `string | null` sein kann — " +
      "laesst TypeScript dich `.length` darauf aufrufen?",
    code: "function len(s: string | null) {\n  return s.length;\n}",
    options: [
      "Ja, TypeScript konvertiert null automatisch",
      "Nein, du musst erst pruefen ob s nicht null ist",
      "Ja, null hat auch eine length-Property",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Mit `strictNullChecks` (Standard) meldet TypeScript einen Fehler. " +
      "Du musst erst null ausschliessen, z.B. mit `if (s !== null)`.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist der Unterschied zwischen `??` und `||` bei dem Wert `0`?",
    code: "const a = 0 || 42;\nconst b = 0 ?? 42;",
    options: [
      "Beide geben 42 zurueck",
      "`||` gibt 42, `??` gibt 0",
      "Beide geben 0 zurueck",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`||` prueft auf alle falsy-Werte (0 ist falsy!) und gibt 42 zurueck. " +
      "`??` prueft nur auf null/undefined — da 0 weder null noch undefined ist, " +
      "bleibt der Wert 0.",
  },

  // ─── Sektion 3: any vs unknown ───────────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "TypeScript hat `any` und `unknown`. Beide akzeptieren jeden Wert. " +
      "Was denkst du — wo ist der Unterschied?",
    options: [
      "`any` ist sicherer als `unknown`",
      "`unknown` zwingt dich zu pruefen bevor du den Wert nutzt",
      "Es gibt keinen Unterschied",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`unknown` ist der sichere Weg: Du kannst einen unknown-Wert nicht " +
      "direkt verwenden — du musst erst pruefen (Type Narrowing). " +
      "`any` deaktiviert alle Pruefungen komplett.",
  },
  {
    sectionIndex: 3,
    question:
      "Wenn eine Variable den Typ `any` hat — welchen Typ haben " +
      "Ausdruecke die davon abgeleitet werden?",
    code: "let x: any = { name: 'Max' };\nlet y = x.name;\nlet z = y.length;",
    options: [
      "`y` ist `string`, `z` ist `number`",
      "`y` und `z` sind beide `any`",
      "`y` ist `any`, `z` ist `number`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`any` ist ansteckend! Alles was aus einem `any`-Wert abgeleitet wird, " +
      "ist wieder `any`. Die gesamte Kette verliert den Typschutz.",
  },
  {
    sectionIndex: 3,
    question:
      "Welcher Typ passt zu einer Funktion, die NIEMALS zurueckkehrt " +
      "(z.B. immer einen Error wirft)?",
    code: "function fail(msg: string): ??? {\n  throw new Error(msg);\n}",
    options: [
      "`void` — gibt nichts zurueck",
      "`undefined` — gibt undefined zurueck",
      "`never` — kehrt nie zurueck",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "`never` bedeutet 'kehrt NIE zurueck'. `void` bedeutet 'gibt nichts " +
      "Sinnvolles zurueck, kehrt aber zurueck'. Ein throw oder eine " +
      "Endlosschleife haben den Typ `never`.",
  },

  // ─── Sektion 4: Typ-Hierarchie ──────────────────────────────────────────

  {
    sectionIndex: 4,
    question:
      "In TypeScript gibt es einen Typ, der JEDEM anderen Typ zuweisbar ist. " +
      "Welcher koennte das sein?",
    options: [
      "`any` — passt ueberall",
      "`unknown` — der universelle Typ",
      "`never` — der leere Typ",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "`never` (Bottom Type) ist jedem Typ zuweisbar — weil ein never-Wert " +
      "nie existiert, ist die Zuweisung logisch immer 'sicher'. `unknown` ist " +
      "der Top Type, dem alles zuweisbar IST (aber nicht umgekehrt).",
  },
  {
    sectionIndex: 4,
    question:
      "Kann man einen `unknown`-Wert direkt einer `string`-Variable zuweisen?",
    code: "let x: unknown = 'hello';\nlet y: string = x; // Geht das?",
    options: [
      "Ja, weil der Wert tatsaechlich ein String ist",
      "Nein, man muss erst pruefen ob es ein String ist",
      "Ja, `unknown` ist wie `any`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "`unknown` kann NICHT direkt zugewiesen werden. Du musst erst " +
      "pruefen (Type Narrowing), z.B. mit `typeof x === 'string'`. " +
      "Das ist der entscheidende Sicherheitsvorteil gegenueber `any`.",
  },
  {
    sectionIndex: 4,
    question:
      "Was denkst du — was ist der Typ von `const x = 'hallo'`?",
    code: "const x = 'hallo';",
    options: [
      "`string`",
      '`"hallo"` (der exakte Wert als Typ)',
      "`any`",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "const-Variablen mit primitiven Werten bekommen einen Literal Type. " +
      'Da const sich nie aendert, ist der Typ exakt `"hallo"` — nicht `string`. ' +
      "Bei `let` waere es `string` (Type Widening).",
  },
];
