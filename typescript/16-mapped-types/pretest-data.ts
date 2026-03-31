/**
 * Lektion 16 — Pre-Test-Fragen: Mapped Types
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
  // ═══ Sektion 1: Grundlagen ════════════════════════════════════════════════
  { sectionIndex: 1, question: "Was erzeugt `{ [K in keyof T]?: T[K] }`?", options: ["Einen Readonly-Typ", "Partial<T> — alle Properties optional", "Einen neuen Typ ohne Properties", "Ich weiss es nicht"], correct: 1, briefExplanation: "Das ? macht jede Property optional — genau wie Partial<T>." },
  { sectionIndex: 1, question: "Was bewirkt `-?` in einem Mapped Type?", options: ["Fuegt optional hinzu", "Entfernt optional — macht Properties zur Pflicht", "Entfernt die Property", "Ich weiss es nicht"], correct: 1, briefExplanation: "-? entfernt den optionalen Modifier — so funktioniert Required<T>." },
  { sectionIndex: 1, question: "Was sind homomorphe Mapped Types?", options: ["Rekursive Mapped Types", "Mapped Types die keyof T nutzen und Original-Modifier bewahren", "Mapped Types mit Conditionals", "Ich weiss es nicht"], correct: 1, briefExplanation: "Homomorph = strukturerhaltend. keyof T als Source bewahrt readonly und optional." },

  // ═══ Sektion 2: Key Remapping ═════════════════════════════════════════════
  { sectionIndex: 2, question: "Was macht die `as`-Clause in Mapped Types?", options: ["Type Assertion", "Key Remapping — Keys umbenennen oder filtern", "Type Guard", "Ich weiss es nicht"], correct: 1, briefExplanation: "as ermoeglicht Key Remapping: Keys umbenennen, generieren oder filtern." },
  { sectionIndex: 2, question: "Was passiert wenn Key Remapping `never` ergibt?", options: ["Der Typ wird never", "Der Key wird entfernt", "Compile-Fehler", "Ich weiss es nicht"], correct: 1, briefExplanation: "never im Key Remapping = Key wird aus dem Ergebnis-Typ entfernt." },
  { sectionIndex: 2, question: "Wie generiert man Getter-Methoden-Namen mit Mapped Types?", options: ["Mit string-Konkatenation", "Mit Template Literal Types: `get${Capitalize<K>}`", "Nicht moeglich", "Ich weiss es nicht"], correct: 1, briefExplanation: "Template Literal Types im Key Remapping erzeugen dynamische Namen." },

  // ═══ Sektion 3: Eigene Utility Types ══════════════════════════════════════
  { sectionIndex: 3, question: "Wie baut man Mutable<T> (Gegenteil von Readonly)?", options: ["Mit +readonly", "Mit -readonly: { -readonly [K in keyof T]: T[K] }", "Nicht moeglich", "Ich weiss es nicht"], correct: 1, briefExplanation: "-readonly entfernt den readonly-Modifier von allen Properties." },
  { sectionIndex: 3, question: "Was macht DeepPartial anders als Partial?", options: ["Nichts", "Wendet sich rekursiv auf verschachtelte Objekte an", "Entfernt Properties", "Ich weiss es nicht"], correct: 1, briefExplanation: "DeepPartial prueft ob T[K] ein Objekt ist und wendet sich dann rekursiv selbst an." },
  { sectionIndex: 3, question: "Was ist PartialBy<T, K>?", options: ["Partial fuer alle Keys", "Macht nur die angegebenen Keys optional, Rest bleibt Pflicht", "Entfernt die Keys", "Ich weiss es nicht"], correct: 1, briefExplanation: "PartialBy = Omit<T, K> & Partial<Pick<T, K>> — selektives Optional." },

  // ═══ Sektion 4: Bedingte Mapped Types ═════════════════════════════════════
  { sectionIndex: 4, question: "Was macht `[K in keyof T]: T[K] extends number ? string : T[K]`?", options: ["Alles wird string", "Nur number-Properties werden zu string, Rest bleibt", "Entfernt number-Properties", "Ich weiss es nicht"], correct: 1, briefExplanation: "Der Conditional Type prueft PRO Property: Wenn number, dann string, sonst unveraendert." },
  { sectionIndex: 4, question: "Was ist OmitByType<T, U>?", options: ["Entfernt Keys mit Namen U", "Entfernt alle Properties deren Wert-Typ U ist", "Macht U-Properties optional", "Ich weiss es nicht"], correct: 1, briefExplanation: "OmitByType filtert ueber den Wert-Typ statt den Key-Namen — mit never im Key Remapping." },
  { sectionIndex: 4, question: "Wie prueft man ob eine Property optional ist?", options: ["T[K] === undefined", "`undefined extends T[K]` oder `{} extends Pick<T, K>`", "K extends optional", "Ich weiss es nicht"], correct: 1, briefExplanation: "undefined extends T[K] ist true fuer optionale Properties weil sie implizit undefined enthalten." },

  // ═══ Sektion 5: Praxis-Patterns ═══════════════════════════════════════════
  { sectionIndex: 5, question: "Was ist das haeufigste Praxis-Pattern fuer Mapped Types?", options: ["Array-Transformation", "Form-Typen: FormErrors<T>, FormTouched<T>, FormDirty<T>", "Rekursive Typen", "Ich weiss es nicht"], correct: 1, briefExplanation: "Formulare brauchen immer Begleiter-Typen — Mapped Types leiten sie automatisch ab." },
  { sectionIndex: 5, question: "Was macht CreateDTO<T extends Entity> = Omit<T, keyof Entity>?", options: ["Kopiert Entity", "Entfernt auto-generierte Felder (id, timestamps) fuer POST-Requests", "Fuegt Entity-Felder hinzu", "Ich weiss es nicht"], correct: 1, briefExplanation: "Omit<T, keyof Entity> entfernt die server-generierten Felder fuer Create-Operationen." },
  { sectionIndex: 5, question: "Wie generiert man Change-Events aus einem Typ?", options: ["Manuell definieren", "Mit EventMap<T> das Template Literal Keys fuer {K}Changed nutzt", "Nicht moeglich", "Ich weiss es nicht"], correct: 1, briefExplanation: "Template Literal Keys im Key Remapping erzeugen automatisch Event-Namen aus Property-Namen." },
];
