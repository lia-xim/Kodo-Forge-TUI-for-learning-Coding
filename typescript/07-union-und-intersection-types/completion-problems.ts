/**
 * Lektion 07 — Completion Problems: Union & Intersection Types
 *
 * 6 Code-Templates mit strategischen Luecken.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  {
    id: "07-cp-union-narrowing",
    title: "Union Type mit typeof narrowen",
    description: "Schreibe eine Funktion die string | number korrekt behandelt.",
    template: `function formatValue(value: string ______ number): string {
  if (______(value) === "string") {
    return value.toUpperCase();
  }
  return value.______(2);
}`,
    solution: `function formatValue(value: string | number): string {
  if (typeof(value) === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}`,
    blanks: [
      { placeholder: "______", answer: "|", hint: "Welcher Operator erstellt einen Union Type?" },
      { placeholder: "______", answer: "typeof", hint: "Welcher Operator prueft den Laufzeit-Typ?" },
      { placeholder: "______", answer: "toFixed", hint: "Welche number-Methode formatiert Dezimalstellen?" },
    ],
    concept: "Union Types / typeof Narrowing",
  },

  {
    id: "07-cp-discriminated-union",
    title: "Discriminated Union mit Tag-Property",
    description: "Erstelle eine Discriminated Union fuer geometrische Formen.",
    template: `type Shape =
  | { ______: "circle"; radius: number }
  | { ______: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.______) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    default:
      const _exhaustive: ______ = shape;
      return _exhaustive;
  }
}`,
    solution: `type Shape =
  | { type: "circle"; radius: number }
  | { type: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "type", hint: "Die gemeinsame Tag-Property heisst oft 'type' oder 'kind'." },
      { placeholder: "______", answer: "type", hint: "Dieselbe Property in beiden Union-Mitgliedern." },
      { placeholder: "______", answer: "type", hint: "Auf welche Property wird im switch geprueft?" },
      { placeholder: "______", answer: "never", hint: "Welcher Typ repraesentiert 'kein Wert moeglich' fuer den Exhaustive Check?" },
    ],
    concept: "Discriminated Unions / Exhaustive Check",
  },

  {
    id: "07-cp-intersection",
    title: "Intersection fuer Capability-Mixin",
    description: "Kombiniere zwei Interfaces mit Intersection.",
    template: `interface HasName {
  name: string;
}

interface HasEmail {
  email: string;
}

type ContactInfo = HasName ______ HasEmail;

function sendEmail(contact: ______): void {
  console.log(\`Sende an \${contact.name} (\${contact.______})\`);
}

sendEmail({ name: "Max", email: "max@test.de" });`,
    solution: `interface HasName {
  name: string;
}

interface HasEmail {
  email: string;
}

type ContactInfo = HasName & HasEmail;

function sendEmail(contact: ContactInfo): void {
  console.log(\`Sende an \${contact.name} (\${contact.email})\`);
}

sendEmail({ name: "Max", email: "max@test.de" });`,
    blanks: [
      { placeholder: "______", answer: "&", hint: "Welcher Operator kombiniert BEIDE Typen (UND)?" },
      { placeholder: "______", answer: "ContactInfo", hint: "Verwende den definierten Intersection-Typ." },
      { placeholder: "______", answer: "email", hint: "Welche Property kommt aus HasEmail?" },
    ],
    concept: "Intersection Types / Capability Mixin",
  },

  {
    id: "07-cp-result-pattern",
    title: "Result-Pattern implementieren",
    description: "Erstelle das Result-Pattern fuer typsicheres Error-Handling.",
    template: `type Result<T> =
  | { success: ______; data: T }
  | { success: ______; error: string };

function divide(a: number, b: number): Result<______> {
  if (b === 0) {
    return { success: false, error: "Division durch null" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.______) {
  console.log(result.data); // TypeScript weiss: data existiert
}`,
    solution: `type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: "Division durch null" };
  }
  return { success: true, data: a / b };
}

const result = divide(10, 3);
if (result.success) {
  console.log(result.data);
}`,
    blanks: [
      { placeholder: "______", answer: "true", hint: "Der Erfolgsfall hat success auf welchen Literal-Wert?" },
      { placeholder: "______", answer: "false", hint: "Der Fehlerfall hat success auf welchen Literal-Wert?" },
      { placeholder: "______", answer: "number", hint: "Was ist der Daten-Typ bei einer Division?" },
      { placeholder: "______", answer: "success", hint: "Auf welche Property wird geprueft um den Typ zu narrowen?" },
    ],
    concept: "Result-Pattern / Discriminated Unions",
  },

  {
    id: "07-cp-in-narrowing",
    title: "in-Operator fuer Property-Check",
    description: "Verwende den in-Operator um Union-Mitglieder zu unterscheiden.",
    template: `type Admin = { name: string; permissions: string[] };
type Guest = { name: string; visitCount: number };
type User = Admin ______ Guest;

function greet(user: User): string {
  if ("______" ______ user) {
    return \`Admin \${user.name} mit \${user.permissions.length} Rechten\`;
  }
  return \`Gast \${user.name} (Besuch #\${user.visitCount})\`;
}`,
    solution: `type Admin = { name: string; permissions: string[] };
type Guest = { name: string; visitCount: number };
type User = Admin | Guest;

function greet(user: User): string {
  if ("permissions" in user) {
    return \`Admin \${user.name} mit \${user.permissions.length} Rechten\`;
  }
  return \`Gast \${user.name} (Besuch #\${user.visitCount})\`;
}`,
    blanks: [
      { placeholder: "______", answer: "|", hint: "User ist ein Union von Admin und Guest." },
      { placeholder: "______", answer: "permissions", hint: "Welche Property existiert NUR in Admin?" },
      { placeholder: "______", answer: "in", hint: "Welcher Operator prueft ob eine Property existiert?" },
    ],
    concept: "in-Operator Narrowing",
  },

  {
    id: "07-cp-type-guard-filter",
    title: "Type Guard mit Array.filter (TS 5.5+)",
    description: "Filtere null-Werte aus einem Array — mit Inferred Type Predicates.",
    template: `const mixed: (string | ______)[] = ["hallo", null, "welt", null];

// TS 5.5+: Type Predicate wird automatisch inferiert!
const strings = mixed.______(x => x ______ null);
// strings hat Typ: string[]

console.log(strings.map(s => s.toUpperCase()));`,
    solution: `const mixed: (string | null)[] = ["hallo", null, "welt", null];

const strings = mixed.filter(x => x !== null);
// strings hat Typ: string[]

console.log(strings.map(s => s.toUpperCase()));`,
    blanks: [
      { placeholder: "______", answer: "null", hint: "Das Array enthaelt Strings und welchen anderen Wert?" },
      { placeholder: "______", answer: "filter", hint: "Welche Array-Methode filtert Elemente heraus?" },
      { placeholder: "______", answer: "!==", hint: "Welcher Vergleichsoperator schliesst null aus?" },
    ],
    concept: "TS 5.5 Inferred Type Predicates / filter",
  },
];
