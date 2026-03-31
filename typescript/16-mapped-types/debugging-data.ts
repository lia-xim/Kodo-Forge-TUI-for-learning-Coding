/**
 * Lektion 16 — Debugging Challenges: Mapped Types
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: "L16-D1",
    title: "never im Wert statt im Key",
    buggyCode: [
      "// Ziel: Alle string-Properties entfernen",
      "type RemoveStrings<T> = {",
      "  [K in keyof T]: T[K] extends string ? never : T[K];",
      "};",
      "",
      "interface User { id: number; name: string; email: string; }",
      "type NoStrings = RemoveStrings<User>;",
      "// Erwartet: { id: number; }",
      "// Ergebnis: { id: number; name: never; email: never; }",
    ].join("\n"),
    bugType: "type-error",
    bugLine: 3,
    options: [
      "never steht im Wert-Typ statt im Key Remapping — Properties bleiben mit Typ never",
      "extends string ist falsch",
      "keyof T gibt den falschen Typ",
      "Der Conditional Type ist in der falschen Reihenfolge",
    ],
    correctOption: 0,
    hints: [
      "Was passiert wenn never als Wert-Typ steht vs als Key im Remapping?",
      "never als Wert macht die Property unbenutzbar, entfernt sie aber nicht.",
      "Nutze Key Remapping mit as: [K in keyof T as T[K] extends string ? never : K]",
    ],
    fixedCode: [
      "type RemoveStrings<T> = {",
      "  [K in keyof T as T[K] extends string ? never : K]: T[K];",
      "};",
    ].join("\n"),
    explanation:
      "never im WERT-Typ erzeugt eine Property die Typ never hat — sie existiert noch " +
      "aber nichts kann zugewiesen werden. never im KEY Remapping (as-Clause) entfernt " +
      "die Property komplett aus dem Typ.",
    concept: "never-key-vs-value",
    difficulty: 3,
  },
  {
    id: "L16-D2",
    title: "Template Literal ohne string-Intersection",
    buggyCode: [
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<K>}`]: () => T[K];",
      "};",
      "",
      "// Error: Type 'K' does not satisfy the constraint 'string'",
    ].join("\n"),
    errorMessage: "Type 'K' does not satisfy the constraint 'string'. Type 'string | number | symbol' is not assignable to type 'string'.",
    bugType: "type-error",
    bugLine: 2,
    options: [
      "K kann auch number oder symbol sein — Capitalize braucht string",
      "Capitalize funktioniert nicht mit Mapped Types",
      "as-Clause ist nicht erlaubt in Mapped Types",
      "keyof T gibt immer string zurueck",
    ],
    correctOption: 0,
    hints: [
      "Was gibt keyof T zurueck? Nur string?",
      "keyof kann string | number | symbol sein. Capitalize erwartet string.",
      "Nutze `string & K` um auf string-Keys einzuschraenken.",
    ],
    fixedCode: [
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];",
      "};",
    ].join("\n"),
    explanation:
      "keyof T gibt string | number | symbol zurueck. Capitalize<T> erwartet einen " +
      "string-Typ. Die Intersection `string & K` filtert auf string-Keys — number " +
      "und symbol-Keys werden zu never und damit herausgefiltert.",
    concept: "keyof-string-intersection",
    difficulty: 2,
  },
  {
    id: "L16-D3",
    title: "DeepPartial ohne Function-Guard",
    buggyCode: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends object",
      "    ? DeepPartial<T[K]>",
      "    : T[K];",
      "};",
      "",
      "interface Service {",
      "  config: { timeout: number };",
      "  process: (data: string) => void;",
      "}",
      "",
      "type DP = DeepPartial<Service>;",
      "// process wird zu DeepPartial<(data: string) => void> — kaputt!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 3,
    options: [
      "Funktionen sind auch 'object' — ohne Guard wird DeepPartial auf Funktionen angewendet",
      "extends object prueft nicht korrekt",
      "DeepPartial kann nicht rekursiv sein",
      "Das ? ist am falschen Platz",
    ],
    correctOption: 0,
    hints: [
      "typeof (() => {}) === 'object'? Nein, aber im Typ-System: Function extends object = true!",
      "Fuege einen Function-Check vor der Rekursion ein.",
      "T[K] extends Function ? T[K] : DeepPartial<T[K]>",
    ],
    fixedCode: [
      "type DeepPartial<T> = {",
      "  [K in keyof T]?: T[K] extends object",
      "    ? T[K] extends Function",
      "      ? T[K]",
      "      : DeepPartial<T[K]>",
      "    : T[K];",
      "};",
    ].join("\n"),
    explanation:
      "In TypeScripts Typsystem extends Function extends object. Ohne den Function-Guard " +
      "wird DeepPartial rekursiv auf Funktionen angewendet, was unsinnige Typen erzeugt. " +
      "Die Loesung: Funktionen zuerst pruefen und direkt durchreichen.",
    concept: "deep-recursive-function-guard",
    difficulty: 3,
  },
  {
    id: "L16-D4",
    title: "Nicht-homomorpher Mapped Type verliert Modifier",
    buggyCode: [
      "interface Config {",
      "  readonly host: string;",
      "  port?: number;",
      "}",
      "",
      "type Keys = keyof Config; // 'host' | 'port'",
      "",
      "// Versuch Config zu kopieren:",
      "type ConfigCopy = {",
      "  [K in Keys]: Config[K];",
      "};",
      "",
      "// ConfigCopy.host ist NICHT readonly!",
      "// ConfigCopy.port ist NICHT optional!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 10,
    options: [
      "String-Union statt keyof T macht den Mapped Type nicht-homomorph — Modifier gehen verloren",
      "Keys ist falsch definiert",
      "Config[K] gibt den falschen Typ",
      "Mapped Types koennen keine Modifier bewahren",
    ],
    correctOption: 0,
    hints: [
      "Was ist der Unterschied zwischen [K in keyof Config] und [K in Keys]?",
      "Nur keyof T DIREKT in der Mapped-Type-Syntax bewahrt Modifier (homomorph).",
      "Nutze [K in keyof Config] statt [K in Keys].",
    ],
    fixedCode: [
      "type ConfigCopy = {",
      "  [K in keyof Config]: Config[K];",
      "};",
      "// Jetzt: readonly host, optional port — korrekt!",
    ].join("\n"),
    explanation:
      "Homomorphe Mapped Types muessen `keyof T` DIREKT verwenden. Wenn man " +
      "den Union vorher in eine Variable extrahiert (`type Keys = keyof Config`), " +
      "verliert der Mapped Type die Information ueber die Modifier. " +
      "`[K in keyof Config]` bewahrt readonly und optional, `[K in Keys]` nicht.",
    concept: "homomorphic-mapped-types",
    difficulty: 4,
  },
  {
    id: "L16-D5",
    title: "PartialBy mit falscher Kombination",
    buggyCode: [
      "// Ziel: Nur 'id' optional machen",
      "type PartialBy<T, K extends keyof T> = Partial<T> & Pick<T, K>;",
      "",
      "interface User { id: number; name: string; email: string; }",
      "type Draft = PartialBy<User, 'id'>;",
      "// Erwartet: { name: string; email: string; id?: number; }",
      "// Ergebnis: Alle optional + id Pflicht — umgekehrt!",
    ].join("\n"),
    bugType: "logic-error",
    bugLine: 2,
    options: [
      "Partial und Pick sind vertauscht — Partial macht ALLES optional, Pick macht K zur Pflicht",
      "Omit fehlt",
      "& ist der falsche Operator",
      "K extends keyof T ist falsch",
    ],
    correctOption: 0,
    hints: [
      "Was macht Partial<T>? Was macht Pick<T, K>?",
      "Partial<T> & Pick<T, K> = alles optional, aber K doch Pflicht — das Gegenteil!",
      "Richtig: Omit<T, K> & Partial<Pick<T, K>> — Rest behalten, nur K optional.",
    ],
    fixedCode: [
      "type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;",
    ].join("\n"),
    explanation:
      "Die korrekte Kombination ist Omit<T, K> (alles AUSSER K als Pflicht) & " +
      "Partial<Pick<T, K>> (nur K als optional). Die urspruengliche Version macht " +
      "alles optional mit Partial und dann K wieder zur Pflicht mit Pick — genau umgekehrt.",
    concept: "utility-type-composition",
    difficulty: 3,
  },
];
