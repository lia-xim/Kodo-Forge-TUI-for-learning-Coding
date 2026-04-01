/**
 * Lektion 23 — Completion Problems: Recursive Types
 *
 * Code-Templates mit strategischen Luecken (______).
 * Der Lernende fuellt die Luecken — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code mit ______ als Platzhalter fuer Luecken */
  template: string;
  /** Loesung mit gefuellten Luecken */
  solution: string;
  /** Welche Luecke welche Antwort hat */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Verwandtes Konzept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: LinkedList-Typ (leicht) ───────────────────────────────────────────
  {
    id: "23-cp-linked-list",
    title: "LinkedList-Typ definieren",
    description:
      "Vervollstaendige die Definition eines rekursiven LinkedList-Typs " +
      "mit einem Wert und einem Verweis auf den naechsten Knoten.",
    template: `type LinkedList<T> = {
  value: ______;
  next: ______ | ______;
};

const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: ______ } },
};`,
    solution: `type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};`,
    blanks: [
      { placeholder: "______ (value type)", answer: "T", hint: "Der generische Parameter fuer den Wert" },
      { placeholder: "______ (next type)", answer: "LinkedList<T>", hint: "Selbstreferenz — der naechste Knoten hat denselben Typ" },
      { placeholder: "______ (terminator)", answer: "null", hint: "Die Abbruchbedingung — das Ende der Liste" },
      { placeholder: "______ (last next)", answer: "null", hint: "Der letzte Knoten hat kein next" },
    ],
    concept: "Rekursive Typ-Definition",
  },

  // ─── 2: JSON-Typ (leicht-mittel) ──────────────────────────────────────────
  {
    id: "23-cp-json-type",
    title: "JSON-Typ vervollstaendigen",
    description:
      "Vervollstaendige den rekursiven JSON-Typ, der alle gueltigen " +
      "JSON-Werte abdeckt.",
    template: `type JsonValue =
  | string
  | number
  | ______
  | null
  | ______[]
  | { [key: ______]: ______ };`,
    solution: `type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };`,
    blanks: [
      { placeholder: "______ (primitive)", answer: "boolean", hint: "Der dritte primitive JSON-Typ neben string und number" },
      { placeholder: "______[] (array element)", answer: "JsonValue", hint: "JSON-Arrays enthalten JSON-Werte — Selbstreferenz!" },
      { placeholder: "______ (key type)", answer: "string", hint: "JSON-Objekt-Schluessel sind immer Strings" },
      { placeholder: "______ (value type)", answer: "JsonValue", hint: "JSON-Objekt-Werte sind wieder JSON-Werte — Selbstreferenz!" },
    ],
    concept: "JSON als rekursiver Typ",
  },

  // ─── 3: DeepPartial (mittel) ──────────────────────────────────────────────
  {
    id: "23-cp-deep-partial",
    title: "DeepPartial implementieren",
    description:
      "Vervollstaendige DeepPartial — alle Properties sollen auf " +
      "allen Ebenen optional werden.",
    template: `type DeepPartial<T> = {
  [K in keyof T]______: T[K] extends ______
    ? DeepPartial<______>
    : T[K];
};`,
    solution: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};`,
    blanks: [
      { placeholder: "______ (modifier)", answer: "?", hint: "Welches Zeichen macht eine Property optional?" },
      { placeholder: "______ (condition)", answer: "object", hint: "Pruefe ob der Wert ein Objekt ist um tiefer zu rekursieren" },
      { placeholder: "______ (recursion arg)", answer: "T[K]", hint: "Auf welchen Typ soll DeepPartial rekursiv angewendet werden?" },
    ],
    concept: "Rekursive Utility Types",
  },

  // ─── 4: Flatten (mittel) ──────────────────────────────────────────────────
  {
    id: "23-cp-flatten",
    title: "Flatten-Typ implementieren",
    description:
      "Vervollstaendige den Flatten-Typ der alle Array-Ebenen entfernt.",
    template: `type Flatten<T> = T extends (______ U)[]
  ? ______<U>
  : ______;`,
    solution: `type Flatten<T> = T extends (infer U)[]
  ? Flatten<U>
  : T;`,
    blanks: [
      { placeholder: "______ (keyword)", answer: "infer", hint: "Welches Keyword extrahiert einen Typ aus einem Pattern?" },
      { placeholder: "______ (recursion)", answer: "Flatten", hint: "Selbstreferenz — pruefe ob U selbst ein Array ist" },
      { placeholder: "______ (base case)", answer: "T", hint: "Wenn T kein Array ist, gib es direkt zurueck" },
    ],
    concept: "Rekursive Conditional Types",
  },

  // ─── 5: Paths (schwer) ────────────────────────────────────────────────────
  {
    id: "23-cp-paths",
    title: "Paths-Typ implementieren",
    description:
      "Vervollstaendige den Paths-Typ der alle Punkt-getrennten " +
      "Pfade eines Objekts berechnet.",
    template: `type Paths<T> = T extends object
  ? {
      [K in keyof T & ______]:
        | K
        | \`\${K}.______\`
    }[keyof T & string]
  : ______;`,
    solution: `type Paths<T> = T extends object
  ? {
      [K in keyof T & string]:
        | K
        | \`\${K}.\${Paths<T[K]>}\`
    }[keyof T & string]
  : never;`,
    blanks: [
      { placeholder: "______ (key constraint)", answer: "string", hint: "Nur String-Schluessel koennen in Pfaden verwendet werden" },
      { placeholder: "______ (recursion)", answer: "${Paths<T[K]>}", hint: "Rekursion: Berechne die Unterpfade des aktuellen Schluessels" },
      { placeholder: "______ (base case)", answer: "never", hint: "Primitive Typen haben keine Pfade — welcher Bottom-Typ passt?" },
    ],
    concept: "Typsichere Objekt-Pfade",
  },

  // ─── 6: PathValue (schwer) ────────────────────────────────────────────────
  {
    id: "23-cp-path-value",
    title: "PathValue-Typ implementieren",
    description:
      "Vervollstaendige den PathValue-Typ der den Wert-Typ an einem " +
      "Punkt-getrennten Pfad ermittelt.",
    template: `type PathValue<T, P extends string> =
  P extends \`\${infer Head}.______\`
    ? Head extends keyof T
      ? PathValue<______, ______>
      : never
    : P extends keyof T
      ? ______
      : never;`,
    solution: `type PathValue<T, P extends string> =
  P extends \`\${infer Head}.\${infer Tail}\`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;`,
    blanks: [
      { placeholder: "______ (rest pattern)", answer: "${infer Tail}", hint: "Extrahiere den Rest des Pfads nach dem Punkt" },
      { placeholder: "______ (deeper type)", answer: "T[Head]", hint: "Navigiere eine Ebene tiefer im Typ" },
      { placeholder: "______ (rest path)", answer: "Tail", hint: "Der verbleibende Pfad fuer die Rekursion" },
      { placeholder: "______ (leaf value)", answer: "T[P]", hint: "Kein Punkt mehr: P ist der letzte Schluessel, gib den Wert zurueck" },
    ],
    concept: "Rekursive String-Zerlegung",
  },
];
