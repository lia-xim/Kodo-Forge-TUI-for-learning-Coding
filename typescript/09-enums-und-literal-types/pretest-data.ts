/**
 * Lektion 09 — Pre-Test-Fragen: Enums & Literal Types
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
  // ═══ Sektion 1: Literal Types ═══════════════════════════════════════════
  { sectionIndex: 1, question: "Was ist der Typ von `const x = 'hello'`?", options: ["string", "'hello'", "any", "Ich weiss es nicht"], correct: 1, briefExplanation: "const inferiert den Literal-Typ 'hello' — den praezisesten moeglichen Typ." },
  { sectionIndex: 1, question: "Was macht `as const`?", options: ["Nur readonly", "readonly + Literal Types + Tuple", "Konvertiert zu const", "Ich weiss es nicht"], correct: 1, briefExplanation: "as const hat drei Effekte: readonly, Literal Types, und Tuple statt Array." },
  { sectionIndex: 1, question: "Warum hat `let x = 'hello'` den Typ string und nicht 'hello'?", options: ["Bug", "let kann spaeter geaendert werden — breiterer Typ noetig", "Strings sind immer string", "Ich weiss es nicht"], correct: 1, briefExplanation: "let kann neu zugewiesen werden. TypeScript widened zum allgemeinen Typ." },

  // ═══ Sektion 2: Numerische Enums ════════════════════════════════════════
  { sectionIndex: 2, question: "Erzeugen Enums JavaScript-Code?", options: ["Nein, Type Erasure", "Ja — Enums sind die einzige TS-Konstruktion mit Laufzeit-Code", "Nur String Enums", "Ich weiss es nicht"], correct: 1, briefExplanation: "Enums sind die grosse Ausnahme von Type Erasure — sie erzeugen echte JS-Objekte." },
  { sectionIndex: 2, question: "Was ist Reverse Mapping bei numerischen Enums?", options: ["Werte umdrehen", "Vom Zahlenwert zurueck zum Namen: Color[0] = 'Red'", "Enum sortieren", "Ich weiss es nicht"], correct: 1, briefExplanation: "Numerische Enums haben doppelte Eintraege: Name→Wert UND Wert→Name." },
  { sectionIndex: 2, question: "Kann man Direction = 42 zuweisen bei enum Direction { Up, Down }?", options: ["Nein, Fehler", "Ja — jede Zahl ist bei numerischen Enums erlaubt", "Nur mit as", "Ich weiss es nicht"], correct: 1, briefExplanation: "Bekanntes Soundness-Loch: Numerische Enums akzeptieren jede Zahl." },

  // ═══ Sektion 3: String Enums ════════════════════════════════════════════
  { sectionIndex: 3, question: "Haben String Enums Reverse Mapping?", options: ["Ja", "Nein — nur einseitige Eintraege (Name→Wert)", "Nur mit as const", "Ich weiss es nicht"], correct: 1, briefExplanation: "String Enums haben KEIN Reverse Mapping. Object.keys gibt nur die Namen." },
  { sectionIndex: 3, question: "Kann man einen String direkt einem String Enum zuweisen?", code: "enum Status { Active = 'ACTIVE' }\nconst s: Status = 'ACTIVE';", options: ["Ja, der Wert stimmt", "Nein — String Enums sind nominal typisiert", "Nur mit as", "Ich weiss es nicht"], correct: 1, briefExplanation: "String Enums sind nominal — nur Enum-Mitglieder (Status.Active) sind zuweisbar." },
  { sectionIndex: 3, question: "Muessen String Enum Mitglieder explizite Werte haben?", options: ["Nein, Auto-Increment", "Ja — String Enums haben kein Auto-Increment", "Nur das erste", "Ich weiss es nicht"], correct: 1, briefExplanation: "String Enums brauchen fuer JEDES Mitglied einen expliziten String-Wert." },

  // ═══ Sektion 4: Enums vs Union Literals ═════════════════════════════════
  { sectionIndex: 4, question: "Was ist der Hauptvorteil von Union Literals gegenueber Enums?", options: ["Schneller", "Kein Laufzeit-Code (Type Erasure, Tree-Shakeable)", "Mehr Mitglieder", "Ich weiss es nicht"], correct: 1, briefExplanation: "Union Literals verschwinden komplett bei der Kompilierung — null Bytes JavaScript." },
  { sectionIndex: 4, question: "Was ist der Hauptvorteil von Enums gegenueber Union Literals?", options: ["Typsicherer", "Laufzeit-Objekt fuer Iteration und Reverse Mapping", "Schneller", "Ich weiss es nicht"], correct: 1, briefExplanation: "Enums haben ein Laufzeit-Objekt — man kann ueber alle Werte iterieren." },
  { sectionIndex: 4, question: "Was ist die beste Alternative zu Enums mit as const?", code: "const Direction = { Up: 'UP', Down: 'DOWN' } as const;\ntype Direction = typeof Direction[keyof typeof Direction];", options: ["Union Literal Type", "as const Object mit gleichnamigem Type", "Klasse mit statischen Properties", "Ich weiss es nicht"], correct: 1, briefExplanation: "as const Object + gleichnamiger Type = Laufzeit-Objekt + Literal Union." },

  // ═══ Sektion 5: Template Literal Types ══════════════════════════════════
  { sectionIndex: 5, question: "Was macht `${A}-${B}` auf Type-Level wenn A und B Unions sind?", options: ["Konkatenation", "Kartesisches Produkt aller Kombinationen", "Addition der Mitglieder", "Ich weiss es nicht"], correct: 1, briefExplanation: "Jede A-Variante wird mit jeder B-Variante kombiniert — kartesisches Produkt." },
  { sectionIndex: 5, question: "Was ist der Unterschied zwischen Capitalize und Uppercase?", options: ["Kein Unterschied", "Capitalize: erster Buchstabe gross. Uppercase: ALLES gross.", "Uppercase ist veraltet", "Ich weiss es nicht"], correct: 1, briefExplanation: "Capitalize<'hello'> = 'Hello'. Uppercase<'hello'> = 'HELLO'." },
  { sectionIndex: 5, question: "Was beschreibt `on${string}`?", options: ["Nur 'on'", "Jeden String der mit 'on' anfaengt", "Jeden String", "Ich weiss es nicht"], correct: 1, briefExplanation: "${string} ist ein Wildcard — akzeptiert beliebige String-Suffixe." },

  // ═══ Sektion 6: Patterns und Alternativen ═══════════════════════════════
  { sectionIndex: 6, question: "Was ist das Hauptproblem von const enum?", options: ["Zu viel Code", "Inkompatibel mit isolatedModules (Vite, esbuild, Next.js)", "Keine String-Werte", "Ich weiss es nicht"], correct: 1, briefExplanation: "isolatedModules kompiliert einzelne Dateien — cross-file const enum geht nicht." },
  { sectionIndex: 6, question: "Was ist ein Branded Type?", code: "type EUR = number & { __brand: 'EUR' };", options: ["Ein Typ mit Logo", "Ein Intersections-Trick fuer semantische Typsicherheit", "Ein Class-Feature", "Ich weiss es nicht"], correct: 1, briefExplanation: "Branded Types verhindern Verwechslungen zwischen semantisch verschiedenen Werten." },
  { sectionIndex: 6, question: "Existiert die __brand-Property zur Laufzeit?", options: ["Ja", "Nein — reiner Compile-Zeit-Mechanismus", "Nur in Debug-Mode", "Ich weiss es nicht"], correct: 1, briefExplanation: "__brand ist ein Type-Level-Trick. Zur Laufzeit ist der Wert eine normale Zahl/String." },
];
