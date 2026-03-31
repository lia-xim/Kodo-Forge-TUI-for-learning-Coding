/**
 * Lektion 04 -- Pre-Test-Fragen: Arrays & Tuples
 *
 * 3 Fragen pro Sektion, die VOR dem Lesen der Sektion gestellt werden.
 * Ziel: Vorwissen aktivieren, Neugier wecken, Fehlkonzeptionen aufdecken.
 *
 * Sektionen:
 *   1 — Array-Grundlagen
 *   2 — Readonly Arrays
 *   3 — Tuples Grundlagen
 *   4 — Fortgeschrittene Tuples
 *   5 — Kovarianz und Sicherheit
 *   6 — Praxis-Patterns
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══════════════════════════════════════════════════════════════
  // Sektion 1: Array-Grundlagen
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 1,
    question: "Was inferiert TypeScript fuer diese Variable?",
    code: `const items = [1, "hello", true];`,
    options: [
      "[number, string, boolean]  (Tuple)",
      "(number | string | boolean)[]  (Array mit Union)",
      "any[]",
      "unknown[]",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript inferiert KEIN Tuple — es wird ein Array mit Union-Typ. " +
      "Die Begruendung erfaehrst du in Sektion 1.",
  },

  {
    sectionIndex: 1,
    question:
      "Gibt es einen Unterschied zwischen 'number[]' und 'Array<number>'?",
    options: [
      "Ja — number[] ist schneller zur Laufzeit",
      "Ja — Array<number> hat mehr Methoden",
      "Nein — beide erzeugen exakt den gleichen Typ",
      "Ja — number[] ist ein Tuple, Array<number> ein Array",
    ],
    correct: 2,
    briefExplanation:
      "Beide Schreibweisen sind identisch. number[] ist syntaktischer Zucker " +
      "fuer Array<number> — und damit benutzt du bereits Generics!",
  },

  {
    sectionIndex: 1,
    question: "Was ist der Typ von 'result'?",
    code: `const nums: number[] = [1, 2, 3];
const result = nums.map(n => n.toString());`,
    options: [
      "number[]",
      "string[]",
      "(number | string)[]",
      "any[]",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript verfolgt .map()-Callbacks: n ist number, n.toString() " +
      "gibt string zurueck, also ist das Ergebnis string[].",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 2: Readonly Arrays
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 2,
    question: "Welche Operation ist auf 'readonly number[]' erlaubt?",
    code: `const nums: readonly number[] = [1, 2, 3];`,
    options: [
      "nums.push(4)",
      "nums[0] = 99",
      "nums.sort()",
      "nums.filter(n => n > 1)",
    ],
    correct: 3,
    briefExplanation:
      "filter() gibt ein NEUES Array zurueck und mutiert das Original nicht. " +
      "push(), sort() und Index-Zuweisung sind auf readonly Arrays blockiert.",
  },

  {
    sectionIndex: 2,
    question:
      "Kann man ein 'string[]' einer Variable vom Typ 'readonly string[]' zuweisen?",
    options: [
      "Ja — mutable zu readonly ist sicher (Rechte wegnehmen)",
      "Nein — die Typen sind inkompatibel",
      "Nur mit Type Assertion (as readonly string[])",
      "Nur wenn das Array leer ist",
    ],
    correct: 0,
    briefExplanation:
      "mutable -> readonly ist erlaubt (weniger Rechte geben). " +
      "Aber readonly -> mutable geht NICHT (man koennte dann mutieren).",
  },

  {
    sectionIndex: 2,
    question:
      "Verhindert 'readonly' auch zur Laufzeit, dass das Array veraendert wird?",
    options: [
      "Ja — readonly Arrays werden automatisch eingefroren (Object.freeze)",
      "Ja — .push() wirft einen Laufzeit-Fehler",
      "Nein — readonly existiert nur im Typ-System und wird bei der Kompilierung entfernt",
      "Teilweise — .push() wird blockiert, aber Index-Zugriff funktioniert",
    ],
    correct: 2,
    briefExplanation:
      "Type Erasure! Alle TypeScript-Typen verschwinden zur Laufzeit. " +
      "readonly ist rein compile-time — zur Laufzeit ist es ein normales Array.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 3: Tuples Grundlagen
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 3,
    question: "Welchen Typ hat 'tup.length'?",
    code: `const tup: [string, number, boolean] = ["hi", 42, true];
const len = tup.length;`,
    options: [
      "number",
      "3",
      "1 | 2 | 3",
      "number | undefined",
    ],
    correct: 1,
    briefExplanation:
      "Bei Tuples ist .length ein Literal-Typ! Das Tuple hat fixe Laenge 3, " +
      "also ist der Typ von .length genau 3 (nicht number).",
  },

  {
    sectionIndex: 3,
    question: "Was passiert hier?",
    code: `const pair: [string, number] = ["hello", 42];
pair.push("world");`,
    options: [
      "Compile-Fehler: push ist auf Tuples nicht erlaubt",
      "Compile-Fehler: 'world' ist nicht string | number... doch, es ist erlaubt!",
      "Kein Compile-Fehler: push akzeptiert string | number auf mutable Tuples",
      "Laufzeit-Fehler: Tuples haben fixe Laenge",
    ],
    correct: 2,
    briefExplanation:
      "push() ist auf mutable Tuples erlaubt und akzeptiert die Union " +
      "aller Element-Typen (string | number). Das ist eine bekannte " +
      "Sicherheitsluecke — readonly Tuples verhindern das.",
  },

  {
    sectionIndex: 3,
    question: "Was bewirken Labels in einem Tuple-Typ?",
    code: `type Point = [x: number, y: number];`,
    options: [
      "Man kann point.x statt point[0] schreiben",
      "Sie aendern den Typ — [x: number, y: number] ist anders als [number, number]",
      "Sie sind rein dokumentarisch — sie verbessern nur IDE-Tooltips",
      "Sie machen das Tuple readonly",
    ],
    correct: 2,
    briefExplanation:
      "Labels sind rein dokumentarisch. Sie beeinflussen den Typ nicht — " +
      "[x: number, y: number] und [number, number] sind identisch.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 4: Fortgeschrittene Tuples
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 4,
    question: "Welchen Typ erzeugt 'as const'?",
    code: `const config = ["localhost", 3000] as const;`,
    options: [
      "(string | number)[]",
      "[string, number]",
      "readonly [string, number]",
      'readonly ["localhost", 3000]',
    ],
    correct: 3,
    briefExplanation:
      "'as const' bewirkt zwei Dinge: (1) readonly Tuple und (2) Literal-Typen. " +
      'Also: readonly ["localhost", 3000] — nicht readonly [string, number]!',
  },

  {
    sectionIndex: 4,
    question: "Was passiert beim Spread eines Tuples?",
    code: `const pair: [string, number] = ["hello", 42];
const copy = [...pair];`,
    options: [
      "copy hat den Typ [string, number]",
      "copy hat den Typ readonly [string, number]",
      "copy hat den Typ (string | number)[]",
      "Compile-Fehler: Spread auf Tuples nicht erlaubt",
    ],
    correct: 2,
    briefExplanation:
      "Spread auf ein Tuple VERLIERT den Tuple-Typ! TypeScript inferiert " +
      "stattdessen (string | number)[]. Das ist eine haeufige Falle.",
  },

  {
    sectionIndex: 4,
    question: "Welche Werte sind fuer diesen Typ gueltig?",
    code: `type T = [string, ...number[]];`,
    options: [
      'Nur ["hello", 1, 2, 3] — mindestens eine Zahl noetig',
      'Nur ["hello"] — Rest-Element kann leer sein',
      '["hello"], ["hello", 1], ["hello", 1, 2, 3] — alle gueltig',
      '[] — leeres Array ist auch gueltig',
    ],
    correct: 2,
    briefExplanation:
      "Ein Rest-Element (...number[]) kann 0 oder mehr Elemente haben. " +
      'Also: ["hello"] mit 0 Zahlen ist gueltig, ein leeres [] nicht ' +
      "(der string fehlt).",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 5: Kovarianz und Sicherheit
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 5,
    question: "Ist diese Zuweisung erlaubt?",
    code: `const narrow: ("admin" | "mod")[] = ["admin", "mod"];
const wide: string[] = narrow;`,
    options: [
      "Ja — Subtyp-Array kann einem breiteren Array zugewiesen werden",
      "Nein — die Typen sind nicht kompatibel",
      "Nur mit 'as string[]'",
      "Ja, aber nur bei readonly Arrays",
    ],
    correct: 0,
    briefExplanation:
      "Das ist Kovarianz: (\"admin\" | \"mod\")[] ist ein Subtyp von string[]. " +
      "Aber Vorsicht — ueber 'wide' koennte man jetzt beliebige Strings pushen!",
  },

  {
    sectionIndex: 5,
    question:
      "Mit 'noUncheckedIndexedAccess: true' — welchen Typ hat 'val'?",
    code: `const arr: string[] = ["hello"];
const val = arr[0];`,
    options: [
      "string",
      "string | undefined",
      "string | null",
      '"hello"',
    ],
    correct: 1,
    briefExplanation:
      "Mit dieser Compiler-Option wird jeder Index-Zugriff auf Arrays " +
      "als moeglicherweise undefined behandelt — auch arr[0].",
  },

  {
    sectionIndex: 5,
    question:
      "Warum loest 'readonly' das Kovarianz-Problem bei Arrays?",
    options: [
      "Weil readonly Arrays langsamer sind und TypeScript sie anders behandelt",
      "Weil man ein readonly Array nicht mutieren kann — kein push() moeglich",
      "Weil readonly die Zuweisung von Subtypen komplett verbietet",
      "readonly loest das Problem gar nicht",
    ],
    correct: 1,
    briefExplanation:
      "Wenn niemand das Array mutieren kann, ist Kovarianz sicher. " +
      "Das Problem entsteht nur, wenn man ueber den breiteren Typ mutiert.",
  },

  // ═══════════════════════════════════════════════════════════════
  // Sektion 6: Praxis-Patterns
  // ═══════════════════════════════════════════════════════════════

  {
    sectionIndex: 6,
    question: "Welchen Typ hat 'result'?",
    code: `const mixed: (string | null)[] = ["a", null, "b", null];
const result = mixed.filter(x => x !== null);`,
    options: [
      "string[]",
      "(string | null)[]",
      "NonNullable<string | null>[]",
      "never[]",
    ],
    correct: 0,
    briefExplanation:
      "Ab TypeScript 5.5 erkennt filter() bei einfachen Null-Checks automatisch " +
      "Inferred Type Predicates. Der Callback `x => x !== null` wird als Type Guard " +
      "inferiert, sodass das Ergebnis string[] ist.",
  },

  {
    sectionIndex: 6,
    question: "Was ist die beste Typ-Annotation fuer einen Array-Parameter, " +
      "der nicht veraendert werden soll?",
    code: `function sum(numbers: ???) {
  return numbers.reduce((a, b) => a + b, 0);
}`,
    options: [
      "number[]",
      "Array<number>",
      "readonly number[]",
      "const number[]",
    ],
    correct: 2,
    briefExplanation:
      "'readonly number[]' signalisiert dem Aufrufer, dass die Funktion " +
      "das Array nicht veraendert. Bonus: Man kann auch readonly Arrays uebergeben.",
  },

  {
    sectionIndex: 6,
    question: "Was bewirkt 'satisfies' in Kombination mit 'as const'?",
    code: `const ROLES = ["admin", "user", "guest"] as const satisfies readonly string[];`,
    options: [
      "Es macht gar keinen Unterschied",
      "Es validiert die Struktur, behaelt aber die engen Literal-Typen",
      "Es wandelt die Werte in Strings um",
      "Es entfernt das readonly",
    ],
    correct: 1,
    briefExplanation:
      "'satisfies' prueft zur Compile-Zeit, dass der Wert einem breiteren Typ " +
      "entspricht — OHNE die Literal-Typen zu verlieren.",
  },
];
