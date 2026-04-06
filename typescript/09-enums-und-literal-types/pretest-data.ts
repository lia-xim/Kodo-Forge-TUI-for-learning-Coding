/**
 * Lektion 09 — Pre-Test-Fragen: Enums & Literal Types
 *
 * 3 Fragen pro Sektion (6 Sektionen = 18 Fragen).
 * correct-Index-Verteilung: 5×0, 4×1, 5×2, 4×3
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
  // ═══ Sektion 1: Literal Types ═══════════════════════════════════════════

  // Q1 → correct:0 (Richtige nach vorne)
  { sectionIndex: 1, question: "Was ist der Typ von `const x = 'hello'`?", options: ["'hello'", "string", "any", "Ich weiss es nicht"], correct: 0, briefExplanation: "const inferiert den Literal-Typ 'hello' — den praezisesten moeglichen Typ." },

  // Q2 → correct:1 (unveraendert)
  { sectionIndex: 1, question: "Was macht `as const`?", options: ["Nur readonly", "readonly + Literal Types + Tuple", "Konvertiert zu const", "Ich weiss es nicht"], correct: 1, briefExplanation: "as const hat drei Effekte: readonly, Literal Types, und Tuple statt Array." },

  // Q3 → correct:2 (Richtige an Pos 2)
  { sectionIndex: 1, question: "Warum hat `let x = 'hello'` den Typ string und nicht 'hello'?", options: ["Bug", "Strings sind immer string", "let kann spaeter geaendert werden — breiterer Typ noetig", "Ich weiss es nicht"], correct: 2, briefExplanation: "let kann neu zugewiesen werden. TypeScript widened zum allgemeinen Typ." },

  // ═══ Sektion 2: Numerische Enums ════════════════════════════════════════

  // Q4 → correct:0
  { sectionIndex: 2, question: "Erzeugen Enums JavaScript-Code?", options: ["Ja — Enums sind die einzige TS-Konstruktion mit Laufzeit-Code", "Nein, Type Erasure", "Nur String Enums", "Ich weiss es nicht"], correct: 0, briefExplanation: "Enums sind die grosse Ausnahme von Type Erasure — sie erzeugen echte JS-Objekte." },

  // Q5 → correct:1
  { sectionIndex: 2, question: "Was ist Reverse Mapping bei numerischen Enums?", options: ["Werte umdrehen", "Vom Zahlenwert zurueck zum Namen: Color[0] = 'Red'", "Enum sortieren", "Ich weiss es nicht"], correct: 1, briefExplanation: "Numerische Enums haben doppelte Eintraege: Name→Wert UND Wert→Name." },

  // Q6 → correct:2
  { sectionIndex: 2, question: "Kann man Direction = 42 zuweisen bei enum Direction { Up, Down }?", options: ["Nein, Fehler", "Nur mit as", "Ja — jede Zahl ist bei numerischen Enums erlaubt", "Ich weiss es nicht"], correct: 2, briefExplanation: "Bekanntes Soundness-Loch: Numerische Enums akzeptieren jede Zahl." },

  // ═══ Sektion 3: String Enums ════════════════════════════════════════════

  // Q7 → correct:0
  { sectionIndex: 3, question: "Haben String Enums Reverse Mapping?", options: ["Nein — nur einseitige Eintraege (Name→Wert)", "Ja", "Nur mit as const", "Ich weiss es nicht"], correct: 0, briefExplanation: "String Enums haben KEIN Reverse Mapping. Object.keys gibt nur die Namen." },

  // Q8 → correct:1
  { sectionIndex: 3, question: "Kann man einen String direkt einem String Enum zuweisen?", code: "enum Status { Active = 'ACTIVE' }\nconst s: Status = 'ACTIVE';", options: ["Ja, der Wert stimmt", "Nein — String Enums sind nominal typisiert", "Nur mit as", "Ich weiss es nicht"], correct: 1, briefExplanation: "String Enums sind nominal — nur Enum-Mitglieder (Status.Active) sind zuweisbar." },

  // Q9 → correct:2
  { sectionIndex: 3, question: "Muessen String Enum Mitglieder explizite Werte haben?", options: ["Nein, Auto-Increment", "Nur das erste", "Ja — String Enums haben kein Auto-Increment", "Ich weiss es nicht"], correct: 2, briefExplanation: "String Enums brauchen fuer JEDES Mitglied einen expliziten String-Wert." },

  // ═══ Sektion 4: Enums vs Union Literals ═════════════════════════════════

  // Q10 → correct:0
  { sectionIndex: 4, question: "Was ist der Hauptvorteil von Union Literals gegenueber Enums?", options: ["Kein Laufzeit-Code (Type Erasure, Tree-Shakeable)", "Schneller", "Mehr Mitglieder", "Ich weiss es nicht"], correct: 0, briefExplanation: "Union Literals verschwinden komplett bei der Kompilierung — null Bytes JavaScript." },

  // Q11 → correct:1
  { sectionIndex: 4, question: "Was ist der Hauptvorteil von Enums gegenueber Union Literals?", options: ["Typsicherer", "Laufzeit-Objekt fuer Iteration und Reverse Mapping", "Schneller", "Ich weiss es nicht"], correct: 1, briefExplanation: "Enums haben ein Laufzeit-Objekt — man kann ueber alle Werte iterieren." },

  // Q12 → correct:2
  { sectionIndex: 4, question: "Was ist die beste Alternative zu Enums mit as const?", code: "const Direction = { Up: 'UP', Down: 'DOWN' } as const;\ntype Direction = typeof Direction[keyof typeof Direction];", options: ["Union Literal Type", "Klasse mit statischen Properties", "as const Object mit gleichnamigem Type", "Ich weiss es nicht"], correct: 2, briefExplanation: "as const Object + gleichnamiger Type = Laufzeit-Objekt + Literal Union." },

  // ═══ Sektion 5: Template Literal Types ══════════════════════════════════

  // Q13 → correct:0
  { sectionIndex: 5, question: "Was macht `${A}-${B}` auf Type-Level wenn A und B Unions sind?", options: ["Kartesisches Produkt aller Kombinationen", "Konkatenation", "Addition der Mitglieder", "Ich weiss es nicht"], correct: 0, briefExplanation: "Jede A-Variante wird mit jeder B-Variante kombiniert — kartesisches Produkt." },

  // Q14 → correct:3
  { sectionIndex: 5, question: "Was ist der Unterschied zwischen Capitalize und Uppercase?", options: ["Kein Unterschied", "Uppercase ist veraltet", "Kein semantischer Unterschied, nur Benennung", "Capitalize: erster Buchstabe gross. Uppercase: ALLES gross."], correct: 3, briefExplanation: "Capitalize<'hello'> = 'Hello'. Uppercase<'hello'> = 'HELLO'." },

  // Q15 → correct:2
  { sectionIndex: 5, question: "Was beschreibt `on${string}`?", options: ["Nur 'on'", "Jeden String", "Jeden String der mit 'on' anfaengt", "Ich weiss es nicht"], correct: 2, briefExplanation: "${string} ist ein Wildcard — akzeptiert beliebige String-Suffixe." },

  // ═══ Sektion 6: Patterns und Alternativen ═══════════════════════════════

  // Q16 → correct:3
  { sectionIndex: 6, question: "Was ist das Hauptproblem von const enum?", options: ["Zu viel Code", "Keine String-Werte", "Zu wenig Laufzeit-Objekte", "Inkompatibel mit isolatedModules (Vite, esbuild, Next.js)"], correct: 3, briefExplanation: "isolatedModules kompiliert einzelne Dateien — cross-file const enum geht nicht." },

  // Q17 → correct:3
  { sectionIndex: 6, question: "Was ist ein Branded Type?", code: "type EUR = number & { __brand: 'EUR' };", options: ["Ein Typ mit Logo", "Ein Class-Feature", "Ein Alias-Mechanismus", "Ein Intersections-Trick fuer semantische Typsicherheit"], correct: 3, briefExplanation: "Branded Types verhindern Verwechslungen zwischen semantisch verschiedenen Werten." },

  // Q18 → correct:3
  { sectionIndex: 6, question: "Existiert die __brand-Property zur Laufzeit?", options: ["Ja", "Nur in Debug-Mode", "Nur als WeakRef", "Nein — reiner Compile-Zeit-Mechanismus"], correct: 3, briefExplanation: "__brand ist ein Type-Level-Trick. Zur Laufzeit ist der Wert eine normale Zahl/String." },
];
