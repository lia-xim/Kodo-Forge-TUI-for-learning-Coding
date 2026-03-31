/**
 * Lektion 15 — Pre-Test-Fragen: Utility Types
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
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
  // ═══ Sektion 1: Partial, Required, Readonly ════════════════════════════
  { sectionIndex: 1, question: "Was macht Partial<T>?", options: ["Entfernt alle Properties", "Macht alle Properties optional", "Macht alles readonly", "Ich weiss es nicht"], correct: 1, briefExplanation: "Partial<T> fuegt ? zu jeder Property hinzu — alle werden optional." },
  { sectionIndex: 1, question: "Was ist das Gegenteil von Partial?", options: ["Readonly", "Required", "Pick", "Ich weiss es nicht"], correct: 1, briefExplanation: "Required<T> entfernt ? von allen Properties — alle werden Pflichtfelder." },
  { sectionIndex: 1, question: "Ist Readonly<T> deep oder shallow?", options: ["Deep", "Shallow — nur erste Ebene", "Beides je nach Konfiguration", "Ich weiss es nicht"], correct: 1, briefExplanation: "Readonly ist shallow — verschachtelte Properties bleiben veraenderbar." },

  // ═══ Sektion 2: Pick, Omit, Record ═════════════════════════════════════
  { sectionIndex: 2, question: "Was macht Pick<User, 'name' | 'email'>?", options: ["Entfernt name und email", "Behaelt nur name und email", "Macht name und email optional", "Ich weiss es nicht"], correct: 1, briefExplanation: "Pick<T, K> erstellt einen neuen Typ mit NUR den angegebenen Properties." },
  { sectionIndex: 2, question: "Erkennt Omit Tippfehler in den Keys?", code: "type X = Omit<User, 'nmae'>; // Tippfehler", options: ["Ja, Compile-Error", "Nein — Omit akzeptiert beliebige Strings", "Nur im strict-Modus", "Ich weiss es nicht"], correct: 1, briefExplanation: "Omit ist NICHT typsicher bei Keys — beliebige Strings sind erlaubt." },
  { sectionIndex: 2, question: "Was ist Record<'a' | 'b', number>?", options: ["Union 'a' | 'b'", "Objekt mit Keys a und b, Werte number", "Array mit 2 Elementen", "Ich weiss es nicht"], correct: 1, briefExplanation: "Record<K, V> erstellt ein Objekt-Typ mit K als Keys und V als Werte." },

  // ═══ Sektion 3: Extract, Exclude, NonNullable ══════════════════════════
  { sectionIndex: 3, question: "Was macht Exclude<'a' | 'b' | 'c', 'a'>?", options: ["'a'", "'b' | 'c'", "'a' | 'b' | 'c'", "Ich weiss es nicht"], correct: 1, briefExplanation: "Exclude entfernt 'a' aus dem Union — 'b' | 'c' bleibt." },
  { sectionIndex: 3, question: "Was ist der Unterschied zwischen Extract und Exclude?", options: ["Kein Unterschied", "Extract behaelt, Exclude entfernt passende Mitglieder", "Extract fuer Objekte, Exclude fuer Unions", "Ich weiss es nicht"], correct: 1, briefExplanation: "Extract behaelt zuweisbare Mitglieder, Exclude entfernt sie." },
  { sectionIndex: 3, question: "Was entfernt NonNullable?", options: ["Nur null", "Nur undefined", "null UND undefined", "Ich weiss es nicht"], correct: 2, briefExplanation: "NonNullable<T> = Exclude<T, null | undefined> — entfernt beides." },

  // ═══ Sektion 4: ReturnType, Parameters, Awaited ════════════════════════
  { sectionIndex: 4, question: "Was gibt ReturnType<typeof fn> zurueck wenn fn async ist?", options: ["Den unwrapped Typ", "Promise<...>", "void", "Ich weiss es nicht"], correct: 1, briefExplanation: "ReturnType gibt bei async Funktionen Promise<...> zurueck. Fuer den inneren Typ: Awaited dazu." },
  { sectionIndex: 4, question: "Warum braucht man typeof bei ReturnType<typeof myFunc>?", options: ["Ist optional", "ReturnType erwartet einen Typ, typeof extrahiert ihn aus dem Wert", "typeof macht es schneller", "Ich weiss es nicht"], correct: 1, briefExplanation: "myFunc ist ein Wert. ReturnType erwartet einen Typ. typeof ist die Bruecke." },
  { sectionIndex: 4, question: "Was macht Awaited<Promise<Promise<string>>>?", options: ["Promise<string>", "string", "Error", "Ich weiss es nicht"], correct: 1, briefExplanation: "Awaited entpackt Promises rekursiv — alle Ebenen, nicht nur eine." },

  // ═══ Sektion 5: Eigene Utility Types ════════════════════════════════════
  { sectionIndex: 5, question: "Warum ist Partial<T> nicht rekursiv (deep)?", options: ["Bug in TypeScript", "Bewusste Design-Entscheidung — zu viele Edge Cases", "TypeScript kann keine Rekursion", "Ich weiss es nicht"], correct: 1, briefExplanation: "Zu viele Edge Cases (Arrays, Maps, Dates). Entwickler bauen ihre eigene Deep-Variante." },
  { sectionIndex: 5, question: "Was macht -readonly in einem Mapped Type?", options: ["Fuegt readonly hinzu", "Entfernt readonly", "Syntax-Error", "Ich weiss es nicht"], correct: 1, briefExplanation: "- entfernt den Modifier. -readonly entfernt readonly, -? entfernt optional." },
  { sectionIndex: 5, question: "Was ist das Muster fuer eigene Utility Types?", options: ["Nur Generics", "Mapped Type + Conditional Type + Rekursion", "Nur Conditional Types", "Ich weiss es nicht"], correct: 1, briefExplanation: "Mapped Type iteriert ueber Keys, Conditional Type prueft Bedingungen, Rekursion geht tief." },

  // ═══ Sektion 6: Utility Types kombinieren ═══════════════════════════════
  { sectionIndex: 6, question: "Was ist Pick<T,K> & Partial<Omit<T,K>>?", options: ["Alles optional", "K bleibt required, Rest optional", "Alles required", "Ich weiss es nicht"], correct: 1, briefExplanation: "Pick behaelt K wie im Original, Partial<Omit> macht den Rest optional. DAS Update-Pattern." },
  { sectionIndex: 6, question: "Fuer welchen Anwendungsfall ist Omit<T, ServerKeys> ideal?", options: ["Delete-Operationen", "Create-Input-Typen (Server-generierte Felder weglassen)", "Read-Operationen", "Ich weiss es nicht"], correct: 1, briefExplanation: "Bei Create-Operationen setzt der Server id, createdAt etc. — die gehoeren nicht in den Input." },
  { sectionIndex: 6, question: "Was ist Record<keyof T, string> im Form-Kontext?", options: ["Ein Array von Strings", "Fuer jedes Feld von T ein String-Wert (z.B. Fehler-Map)", "Eine Type-Assertion", "Ich weiss es nicht"], correct: 1, briefExplanation: "Record<keyof T, string> erstellt fuer jedes Feld einen String — ideal fuer Fehler-Meldungen." },
];
