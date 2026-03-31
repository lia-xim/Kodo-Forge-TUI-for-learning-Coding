/**
 * Lektion 08 — Fehlkonzeption-Exercises: Type Aliases vs Interfaces
 *
 * 8 Fehlkonzeptionen rund um type vs interface, Declaration Merging,
 * extends vs &, Entscheidungsregeln.
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  {
    id: "08-type-creates-new-type",
    title: "Type Alias erstellt einen neuen Typ",
    code: `type UserID = string;
type ProductID = string;

const userId: UserID = "abc";
const productId: ProductID = userId; // Fehler?`,
    commonBelief:
      "UserID und ProductID sind verschiedene Typen. Die Zuweisung sollte ein Fehler sein.",
    reality:
      "Type Aliases sind nur NAMEN fuer existierende Typen. UserID und ProductID " +
      "sind beide string — TypeScript behandelt sie identisch (strukturelle Typisierung). " +
      "Fuer nominale Typisierung brauchst du Branded Types.",
    concept: "Type Alias / Strukturelle Typisierung",
    difficulty: 2,
  },

  {
    id: "08-interface-only-for-objects",
    title: "Interfaces koennen keine Funktionen beschreiben",
    code: `// "Interface = nur Objekte, type = fuer alles"
// Also kann das nicht funktionieren... oder?
interface Formatter {
  (input: string): string;
}`,
    commonBelief:
      "Interfaces sind nur fuer Objekt-Formen. Fuer Funktionstypen braucht man type.",
    reality:
      "Interfaces KOENNEN Funktionen beschreiben — mit der Call-Signature-Syntax. " +
      "interface Formatter { (input: string): string } ist voellig gueltig. " +
      "In der Praxis ist type Formatter = (input: string) => string " +
      "haeufiger, aber beide funktionieren.",
    concept: "Interface Call Signature",
    difficulty: 2,
  },

  {
    id: "08-extends-equals-intersection",
    title: "extends und & sind identisch",
    code: `interface A { x: string; }

// Variante 1: extends
interface B1 extends A { x: number; }
// Compile-Error!

// Variante 2: &
type B2 = A & { x: number };
// Kein Fehler — aber x ist never!`,
    commonBelief:
      "interface extends und type & sind austauschbar — sie machen dasselbe.",
    reality:
      "extends meldet Konflikte DIREKT als Compile-Error. & erzeugt " +
      "stillschweigend never-Properties. extends ist ausserdem schneller " +
      "fuer den Compiler (wird gecached). Fuer Objekt-Vererbung ist " +
      "extends sicherer.",
    concept: "extends vs & / Konflikte",
    difficulty: 3,
  },

  {
    id: "08-declaration-merging-is-bug",
    title: "Declaration Merging ist ein Bug",
    code: `interface Window {
  myCustomProperty: string;
}

// Jetzt hat window.myCustomProperty den Typ string!
window.myCustomProperty = "hallo";`,
    commonBelief:
      "Zwei Interfaces mit dem gleichen Namen sollten einen Fehler erzeugen. " +
      "Declaration Merging ist ein Versehen der TypeScript-Designer.",
    reality:
      "Declaration Merging ist ein ABSICHTLICHES Feature. Es erlaubt " +
      "Library-Augmentation: Du kannst Typen von Bibliotheken erweitern " +
      "ohne deren Quellcode zu aendern. Express.Request, Window, " +
      "process.env — alles nutzbar durch Declaration Merging.",
    concept: "Declaration Merging / Module Augmentation",
    difficulty: 3,
  },

  {
    id: "08-implements-inherits",
    title: "implements vererbt Methoden an die Klasse",
    code: `interface Serializable {
  serialize(): string;
}

class User implements Serializable {
  name = "Max";
  // serialize() muesste automatisch da sein... oder?
}`,
    commonBelief:
      "implements vererbt die Methoden des Interfaces an die Klasse, " +
      "aehnlich wie extends bei Klassen.",
    reality:
      "implements vererbt NICHTS. Es ist ein reiner Compile-Zeit-Check: " +
      "TypeScript prueft ob die Klasse die Interface-Form erfuellt. " +
      "Ohne eigene serialize()-Implementation ist es ein Compile-Error. " +
      "Vererbung gibt es nur mit extends (bei Klassen).",
    concept: "implements / Compile-Zeit-Check",
    difficulty: 2,
  },

  {
    id: "08-type-always-better",
    title: "type ist immer besser als interface",
    code: `// "type kann alles was interface kann, und mehr.
// Also sollte man IMMER type verwenden."

type User = {
  name: string;
  age: number;
};`,
    commonBelief:
      "type kann alles was interface kann, plus Union, Mapped, Conditional Types. " +
      "Interface ist ueberfluessig.",
    reality:
      "Interfaces haben Vorteile: (1) Declaration Merging fuer Library-Augmentation, " +
      "(2) extends ist schneller und sicherer als &, (3) bessere Fehlermeldungen " +
      "bei Konflikten, (4) Angular und viele Teams bevorzugen Interfaces " +
      "fuer Objekt-Typen. Es gibt keinen 'immer besser' — Konsistenz zaehlt.",
    concept: "type vs interface / Entscheidung",
    difficulty: 2,
  },

  {
    id: "08-intersection-always-works",
    title: "Intersection funktioniert immer wie erwartet",
    code: `type Admin = { role: "admin"; canDelete: true };
type User = { role: "user"; canDelete: false };
type AdminUser = Admin & User;

// Was ist AdminUser.role? Was ist AdminUser.canDelete?`,
    commonBelief:
      "AdminUser hat role und canDelete von beiden Typen — " +
      "es ist ein 'Admin-und-User' gleichzeitig.",
    reality:
      "role ist 'admin' & 'user' = never. canDelete ist true & false = never. " +
      "AdminUser ist technisch gueltig aber kein Wert kann je zugewiesen werden — " +
      "es ist praktisch never. Das ist kein Fehler fuer den Compiler, " +
      "aber ein logischer Bug. Verwende Union (|) fuer Varianten.",
    concept: "Intersection-Konflikte / Literal Types",
    difficulty: 4,
  },

  {
    id: "08-mapped-with-interface",
    title: "Mapped Types gehen auch mit Interface",
    code: `interface User {
  name: string;
  age: number;
  email: string;
}

// "Ich mache alle Properties optional mit Interface:"
interface PartialUser {
  [K in keyof User]?: User[K]; // Funktioniert das?
}`,
    commonBelief:
      "Mapped Types sollten auch in Interfaces funktionieren — " +
      "die Syntax ist ja aehnlich.",
    reality:
      "Mapped Types ([K in keyof T]) funktionieren NUR mit type. " +
      "Interfaces unterstuetzen keine Mapped-Type-Syntax. " +
      "Fuer Partial, Readonly, Pick etc. muss man type verwenden: " +
      "type PartialUser = Partial<User>;",
    concept: "Mapped Types / type-only Feature",
    difficulty: 3,
  },
];
