/**
 * Lektion 20 — Pre-Test-Fragen: Review Challenge Phase 2
 */
export interface PretestQuestion { sectionIndex: number; question: string; options: string[]; correct: number; briefExplanation: string; }

export const pretestQuestions: PretestQuestion[] = [
  { sectionIndex: 1, question: "Was sind die drei Saeulen des TypeScript Type Systems? (Phase 2)", options: ["Strings, Numbers, Booleans", "Type Narrowing, Generics, Type-Level-Programmierung", "Classes, Interfaces, Enums", "Ich weiss es nicht"], correct: 1, briefExplanation: "Narrowing (L11-12), Generics (L13-15), Type-Level (L16-18) sind die drei Saeulen." },
  { sectionIndex: 1, question: "Was kombiniert Mapped Types + Conditional Types?", options: ["Nichts", "Selektive Property-Transformation: manche aendern, andere nicht", "Runtime-Checks", "Ich weiss es nicht"], correct: 1, briefExplanation: "Conditional im Mapped Type ermoeglicht pro-Property-Entscheidungen." },
  { sectionIndex: 1, question: "Was kombiniert Template Literals + Mapped Types?", options: ["Strings", "Automatische Getter/Setter/Event-Namen-Generierung", "Fehler", "Ich weiss es nicht"], correct: 1, briefExplanation: "Template Literal im Key Remapping generiert neue Key-Namen aus Properties." },
  { sectionIndex: 2, question: "Kannst du DeepPartial<T> implementieren?", options: ["Ja, sicher", "Ich glaube schon", "Unsicher", "Ich weiss es nicht"], correct: 0, briefExplanation: "DeepPartial braucht Rekursion + Function-Guard + Mapped Type mit ?." },
  { sectionIndex: 2, question: "Kannst du infer verwenden um Typen zu extrahieren?", options: ["Ja, sicher", "Ich glaube schon", "Unsicher", "Ich weiss es nicht"], correct: 0, briefExplanation: "infer in extends-Pattern extrahiert Typ-Teile: Promise<infer U>, (...args) => infer R." },
  { sectionIndex: 2, question: "Kannst du Module Augmentation schreiben?", options: ["Ja, sicher", "Ich glaube schon", "Unsicher", "Ich weiss es nicht"], correct: 0, briefExplanation: "declare module + Interface Merging + export {} fuer Augmentation." },
  { sectionIndex: 2, question: "Verstehst du distributive Conditional Types?", options: ["Ja", "Teilweise", "Nein", "Ich weiss es nicht"], correct: 0, briefExplanation: "Nackter Typparameter + Union = Distribution ueber jeden Member." },
  { sectionIndex: 2, question: "Kannst du Key Remapping mit Template Literals nutzen?", options: ["Ja", "Teilweise", "Nein", "Ich weiss es nicht"], correct: 0, briefExplanation: "as `get${Capitalize<K>}` im Mapped Type fuer Key-Transformation." },
  { sectionIndex: 2, question: "Kannst du Declaration Files schreiben?", options: ["Ja", "Teilweise", "Nein", "Ich weiss es nicht"], correct: 0, briefExplanation: "declare module, declare const, .d.ts fuer externe Typen." },
  { sectionIndex: 3, question: "Was kommt in Phase 3 als Erstes?", options: ["React", "Classes & OOP", "Decorators", "Ich weiss es nicht"], correct: 1, briefExplanation: "L21 behandelt Classes, Access Modifiers, Abstract Classes und Generische Klassen." },
  { sectionIndex: 3, question: "Wozu braucht man Decorators?", options: ["Styling", "Metaprogrammierung: Klassen/Methoden zur Laufzeit erweitern", "Type Guards", "Ich weiss es nicht"], correct: 1, briefExplanation: "Decorators modifizieren Klassen, Methoden und Properties — z.B. fuer Logging, Validation, DI." },
  { sectionIndex: 3, question: "Welche Frameworks werden in Phase 3 behandelt?", options: ["jQuery", "Angular, React, Next.js", "Vue, Svelte", "Ich weiss es nicht"], correct: 1, briefExplanation: "Angular (Arbeit), React/Next.js (privat) — passend zu deinem Profil." },
  { sectionIndex: 2, question: "Kannst du Extract und Exclude erklaeren?", options: ["Ja", "Teilweise", "Nein", "Ich weiss es nicht"], correct: 0, briefExplanation: "Extract behaelt, Exclude entfernt Union-Member. Beide sind distributiv." },
  { sectionIndex: 2, question: "Kannst du Rekursive Types schreiben?", options: ["Ja", "Teilweise", "Nein", "Ich weiss es nicht"], correct: 0, briefExplanation: "Flatten<T>, DeepAwaited<T>, DeepReadonly<T> — Typ referenziert sich selbst." },
  { sectionIndex: 2, question: "Verstehst du den Unterschied zwischen import und import type?", options: ["Ja", "Teilweise", "Nein", "Ich weiss es nicht"], correct: 0, briefExplanation: "import type wird beim Compilieren entfernt. import bleibt im JS." },
];
