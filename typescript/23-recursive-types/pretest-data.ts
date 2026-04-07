/**
 * Lektion 23 — Pre-Test-Fragen: Recursive Types
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
  // ─── Sektion 1: Was sind rekursive Typen? ─────────────────────────────────

  {
    sectionIndex: 1,
    question:
      "Was macht einen Typ 'rekursiv'?",
    options: [
      "Er verwendet generische Parameter",
      "Er referenziert sich selbst in seiner Definition",
      "Er hat mehr als 3 Properties",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ein rekursiver Typ referenziert sich selbst, z.B. " +
      "type List<T> = { value: T; next: List<T> | null }.",
  },
  {
    sectionIndex: 1,
    question:
      "Was braucht jeder rekursive Typ neben der Selbstreferenz?",
    options: [
      "Einen generischen Parameter",
      "Eine Abbruchbedingung (Base Case)",
      "Mindestens 3 Properties",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Ohne Abbruchbedingung (z.B. | null) waere der Typ unendlich " +
      "und kein endliches Objekt koennte ihn erfuellen.",
  },
  {
    sectionIndex: 1,
    question:
      "Kann TypeScript diesen Typ verarbeiten: type Infinite<T> = { value: T; next: Infinite<T> }?",
    code: "type Infinite<T> = { value: T; next: Infinite<T> };",
    options: [
      "Nein, Compile-Error",
      "Ja, aber man kann kein endliches Objekt davon erstellen",
      "Ja, TypeScript fuegt automatisch null hinzu",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "TypeScript akzeptiert den Typ (lazy evaluation), aber " +
      "kein endliches Objekt kann ihn erfuellen, weil next immer " +
      "wieder ein Infinite<T> verlangt.",
  },

  // ─── Sektion 2: Baumstrukturen typen ──────────────────────────────────────

  {
    sectionIndex: 2,
    question:
      "Welcher alltaegliche Datentyp ist per Definition rekursiv?",
    options: [
      "CSV",
      "JSON",
      "Base64",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "JSON ist rekursiv definiert: Ein JSON-Wert kann ein Array " +
      "von JSON-Werten oder ein Objekt mit JSON-Werten sein.",
  },
  {
    sectionIndex: 2,
    question:
      "Was ist 'indirekte Rekursion' bei Typen?",
    options: [
      "Ein Typ der nie aufgeloest wird",
      "Ein Typ der ueber einen anderen Typ auf sich selbst verweist (A → B → A)",
      "Ein Typ der nur optional rekursiv ist",
      "Ich weiss es nicht",
    ],
    correct: 1,
    briefExplanation:
      "Indirekte Rekursion: Typ A referenziert Typ B, der zurueck " +
      "auf A verweist. JsonValue → JsonArray → JsonValue ist ein Beispiel.",
  },
  {
    sectionIndex: 2,
    question:
      "Kann der JSON-Typ 'undefined' enthalten?",
    code: "type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };",
    options: [
      "Nein, undefined ist kein gueltiger JSON-Wert",
      "Ja, undefined ist implizit enthalten",
      "Nur in Arrays",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "JSON kennt kein undefined. Die JSON-Spezifikation definiert nur " +
      "string, number, boolean, null, array und object als Wert-Typen.",
  },

  // ─── Sektion 3: Deep-Operationen ─────────────────────────────────────────

  {
    sectionIndex: 3,
    question:
      "Was macht Partial<T> NICHT?",
    options: [
      "Properties optional machen",
      "Auf der ersten Ebene wirken",
      "Verschachtelte Properties optional machen",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Partial<T> wirkt nur flach (erste Ebene). Verschachtelte " +
      "Objekte bleiben unveraendert. Dafuer braucht man DeepPartial.",
  },
  {
    sectionIndex: 3,
    question:
      "Was passiert wenn DeepPartial auf ein Array-Feld trifft?",
    options: [
      "Es haengt von der Implementierung ab — ohne Sonderbehandlung wird das Array als Objekt aufgeloest",
      "Das Array bleibt immer unveraendert",
      "Arrays werden automatisch zu Tuples",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Arrays sind Objekte (typeof [] === 'object'). Ohne " +
      "spezielle Erkennung wuerde DeepPartial die Array-Properties " +
      "(length, push, etc.) aufloesen.",
  },
  {
    sectionIndex: 3,
    question:
      "Welcher Modifier macht Properties in einem Mapped Type readonly?",
    code: "type ReadonlyVersion<T> = { ??? [K in keyof T]: T[K] };",
    options: [
      "readonly",
      "const",
      "immutable",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "readonly vor [K in keyof T] macht alle Properties unveraenderbar. " +
      "Mit -readonly kann man readonly wieder entfernen.",
  },

  // ─── Sektion 4: Rekursive Conditional Types ───────────────────────────────

  {
    sectionIndex: 4,
    question:
      "Ab welcher TypeScript-Version sind rekursive Conditional Types erlaubt?",
    options: [
      "TypeScript 4.1",
      "TypeScript 3.0",
      "TypeScript 5.0",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "TypeScript 4.1 (November 2020) fuehrte Template Literal Types " +
      "und rekursive Conditional Types ein.",
  },
  {
    sectionIndex: 4,
    question:
      "Wie zerlegt man einen String-Typ an einem Punkt?",
    code: "type Split = 'a.b' extends `${infer H}.${infer T}` ? [H, T] : never;",
    options: [
      "Mit Template Literal Types und infer",
      "Mit string.split() auf Type-Level",
      "Das geht in TypeScript nicht",
      "Ich weiss es nicht",
    ],
    correct: 0,
    briefExplanation:
      "Template Literal Types mit infer koennen Strings auf Type-Level " +
      "zerlegen: `${infer Head}.${infer Tail}` matcht 'a.b' zu Head='a', Tail='b'.",
  },
  {
    sectionIndex: 4,
    question:
      "Was berechnet Paths<T> bei type Paths<T> = T extends object ? ... : never?",
    options: [
      "Alle Schluessel auf der obersten Ebene",
      "Die Tiefe des Objekts",
      "Alle moeglichen Punkt-getrennten Pfade des Objekts",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Paths<T> berechnet alle moeglichen Punkt-getrennten Pfade, " +
      "z.B. Paths<{a: {b: string}}> = 'a' | 'a.b'.",
  },

  // ─── Sektion 5: Grenzen und Performance ───────────────────────────────────

  {
    sectionIndex: 5,
    question:
      "Was ist das ungefaehre Rekursionslimit fuer TypeScript-Typen?",
    options: [
      "10 Ebenen",
      "Unbegrenzt",
      "50 Ebenen (ohne Tail Recursion Optimization)",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "TypeScript bricht bei ca. 50 Rekursionsebenen ab. " +
      "Mit Tail Recursion Optimization (TS 4.5+) geht es bis ~1000.",
  },
  {
    sectionIndex: 5,
    question:
      "Was ist Tail Recursion bei Typen?",
    options: [
      "Eine spezielle Syntax fuer Rekursion",
      "Rekursion die von hinten nach vorne arbeitet",
      "Wenn der rekursive Aufruf die letzte Operation ist und TypeScript den Stack-Frame wiederverwenden kann",
      "Ich weiss es nicht",
    ],
    correct: 2,
    briefExplanation:
      "Tail Recursion Optimization erlaubt tiefere Rekursion, " +
      "wenn der rekursive Aufruf in Tail-Position steht.",
  },
  {
    sectionIndex: 5,
    question:
      "Wie zaehlt man auf Type-Level in TypeScript?",
    options: [
      "Mit dem ++ Operator",
      "Ich weiss es nicht",
      "Mit einer Counter-API",
      "Ueber die Laenge von Tuples als Zaehler",
    ],
    correct: 3,
    briefExplanation:
      "TypeScript hat keine Arithmetik auf Type-Level. " +
      "Der Workaround: Tuple-Laenge als Zaehler verwenden. " +
      "[unknown, unknown, unknown]['length'] = 3.",
  },

  // ─── Sektion 6: Praxis-Patterns ──────────────────────────────────────────

  {
    sectionIndex: 6,
    question:
      "Warum braucht Zod z.lazy() fuer rekursive Schemas?",
    options: [
      "Weil TypeScript es verlangt",
      "Ich weiss es nicht",
      "Weil z.lazy() schneller validiert",
      "Weil JavaScript-Objekte sofort erstellt werden und sich nicht vor der Fertigstellung selbst referenzieren koennen",
    ],
    correct: 3,
    briefExplanation:
      "Typen werden lazy ausgewertet, aber JavaScript-Objekte " +
      "sofort. z.lazy() verzoegert die Auswertung des Schemas.",
  },
  {
    sectionIndex: 6,
    question:
      "Wann solltest du rekursive Typen NICHT verwenden?",
    options: [
      "Bei JSON-Daten",
      "Ich weiss es nicht",
      "Bei Baum-Strukturen",
      "Wenn die IDE merklich langsamer wird oder das Team den Typ nicht versteht",
    ],
    correct: 3,
    briefExplanation:
      "Rekursive Typen sind problematisch wenn sie die Compile-Zeit " +
      "sprengen oder zu komplex fuer das Team sind.",
  },
  {
    sectionIndex: 6,
    question:
      "Welche Library nutzt Paths<T> fuer typsichere Form-Felder?",
    options: [
      "Lodash",
      "Ich weiss es nicht",
      "Express",
      "React Hook Form",
    ],
    correct: 3,
    briefExplanation:
      "React Hook Form nutzt Path<FormValues> damit register('address.street') " +
      "typsicher ist und Autocomplete bietet.",
  },
];
