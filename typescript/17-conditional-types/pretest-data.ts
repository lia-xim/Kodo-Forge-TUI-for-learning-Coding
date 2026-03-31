/**
 * Lektion 17 — Pre-Test-Fragen: Conditional Types
 */

export interface PretestQuestion { sectionIndex: number; question: string; code?: string; options: string[]; correct: number; briefExplanation: string; }

export const pretestQuestions: PretestQuestion[] = [
  { sectionIndex: 1, question: "Was macht `T extends U ? X : Y`?", options: ["Runtime-Check", "Compile-Zeit: wenn T Subtyp von U dann X, sonst Y", "Type Guard", "Ich weiss es nicht"], correct: 1, briefExplanation: "Conditional Types sind Ternaries auf Type-Level." },
  { sectionIndex: 1, question: "Kann TypeScript Conditional Types durch if/else narrowen?", options: ["Ja", "Nein — das ist eine bekannte Einschraenkung", "Nur mit as const", "Ich weiss es nicht"], correct: 1, briefExplanation: "Control Flow Narrowing funktioniert nicht fuer Conditional Types." },
  { sectionIndex: 1, question: "Was gibt `IsString<42>` bei `type IsString<T> = T extends string ? true : false`?", options: ["true", "false", "never", "Ich weiss es nicht"], correct: 1, briefExplanation: "42 (number) extends string ist false — also false." },
  { sectionIndex: 2, question: "Was macht infer in einem Conditional Type?", options: ["Inferiert Variablen", "Deklariert eine Typ-Variable die aus dem Pattern extrahiert wird", "Erstellt Guards", "Ich weiss es nicht"], correct: 1, briefExplanation: "infer = Platzhalter den TypeScript mit dem konkreten Typ fuellt." },
  { sectionIndex: 2, question: "Was extrahiert `T extends Promise<infer U> ? U : T`?", options: ["Den Promise-Wrapper", "Den inneren Typ des Promise", "never", "Ich weiss es nicht"], correct: 1, briefExplanation: "infer U extrahiert den Typ innerhalb von Promise<>." },
  { sectionIndex: 2, question: "Kann man mehrere infer in einem Pattern verwenden?", options: ["Nein", "Ja — z.B. (infer A, infer B) => infer R", "Nur zwei", "Ich weiss es nicht"], correct: 1, briefExplanation: "Beliebig viele infer pro Pattern moeglich." },
  { sectionIndex: 3, question: "Was passiert bei `ToArray<string | number>` mit `type ToArray<T> = T extends any ? T[] : never`?", options: ["(string | number)[]", "string[] | number[] (distributiv)", "never", "Ich weiss es nicht"], correct: 1, briefExplanation: "Distribution: jedes Union-Member wird einzeln verarbeitet." },
  { sectionIndex: 3, question: "Wie verhindert man Distribution?", options: ["readonly", "[T] extends [U] — Tuple-Wrapping", "as const", "Ich weiss es nicht"], correct: 1, briefExplanation: "[T] packt T in ein Tuple und verhindert die automatische Verteilung." },
  { sectionIndex: 3, question: "Was ist `IsString<never>` (distributiv)?", options: ["true", "false", "never", "Ich weiss es nicht"], correct: 2, briefExplanation: "never = leerer Union. Distribution ueber nichts = never." },
  { sectionIndex: 4, question: "Was macht ein rekursiver Conditional Type?", options: ["Schleife zur Laufzeit", "Referenziert sich selbst bis eine Terminierungsbedingung greift", "Fehler", "Ich weiss es nicht"], correct: 1, briefExplanation: "Wie eine rekursive Funktion — ruft sich selbst auf bis der Basis-Fall erreicht ist." },
  { sectionIndex: 4, question: "Wie entpackt `Flatten<T>` verschachtelte Arrays?", options: ["shift()", "Rekursion: T extends (infer U)[] ? Flatten<U> : T", "Nicht moeglich", "Ich weiss es nicht"], correct: 1, briefExplanation: "Array? Weiter entpacken. Kein Array? Fertig." },
  { sectionIndex: 4, question: "Gibt es ein Rekursions-Limit in TypeScript?", options: ["Nein", "Ja — ca. 50-100 Ebenen", "Nur 5", "Ich weiss es nicht"], correct: 1, briefExplanation: "TypeScript begrenzt Rekursion um Endlos-Schleifen zu verhindern." },
  { sectionIndex: 5, question: "Was kombiniert Methods<T> (Mapped + Conditional)?", options: ["Alle Properties kopieren", "Nur Function-Properties behalten, Rest filtern", "Alle optional machen", "Ich weiss es nicht"], correct: 1, briefExplanation: "Conditional im Key Remapping filtert auf Functions — Mapped Type iteriert." },
  { sectionIndex: 5, question: "Was ist Promisify<T>?", options: ["Macht T zu einem Promise", "Wandelt Methoden-Return-Types in Promise<R> um", "Entfernt Promises", "Ich weiss es nicht"], correct: 1, briefExplanation: "Mapped + Conditional + infer: Methoden werden async, Daten bleiben." },
  { sectionIndex: 5, question: "Wann kombiniert man Mapped + Conditional Types?", options: ["Nie", "Wenn man Properties SELEKTIV transformieren will (manche aendern, andere nicht)", "Nur bei Arrays", "Ich weiss es nicht"], correct: 1, briefExplanation: "Die Kombination erlaubt pro-Property-Entscheidungen — das maechtigste Pattern." },
];
