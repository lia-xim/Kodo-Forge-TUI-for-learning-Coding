/**
 * Lektion 09 — Fehlkonzeption-Exercises: Enums & Literal Types
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
    id: "09-enum-typesafe",
    title: "Numerische Enums sind typsicher",
    code: `enum Direction { Up, Down, Left, Right }
const d: Direction = 42; // Fehler?`,
    commonBelief: "42 ist kein gueltiger Direction-Wert — TypeScript sollte das ablehnen.",
    reality:
      "Numerische Enums erlauben JEDE Zahl — ein bekanntes Soundness-Loch! " +
      "Der Grund: Bitwise-Flags wie Permission.Read | Permission.Write erzeugen " +
      "Werte die nicht im Enum definiert sind. String Enums haben dieses Problem nicht.",
    concept: "Numerisches Enum Soundness-Loch",
    difficulty: 3,
  },

  {
    id: "09-string-enum-assignable",
    title: "String-Enums akzeptieren passende Strings",
    code: `enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }
const s: Status = "ACTIVE"; // Sollte funktionieren?`,
    commonBelief: "Da der Enum-Wert 'ACTIVE' ist, sollte der String 'ACTIVE' zuweisbar sein.",
    reality:
      "String Enums sind NOMINAL typisiert — nur Enum-Mitglieder " +
      "(Status.Active) koennen zugewiesen werden. Direkte Strings sind " +
      "nicht kompatibel, auch wenn der Wert identisch ist. " +
      "Das unterscheidet Enums von Union Literal Types.",
    concept: "String Enum / Nominale Typisierung",
    difficulty: 3,
  },

  {
    id: "09-const-vs-let-literal",
    title: "let behaelt den Literal-Typ",
    code: `const a = "hello"; // Typ: "hello"
let b = "hello";   // Typ: ???`,
    commonBelief: "Beide haben den Typ 'hello' — der Wert ist ja derselbe.",
    reality:
      "const inferiert den Literal-Typ 'hello'. let 'widened' zu string. " +
      "Der Grund: let kann spaeter einen anderen Wert bekommen — " +
      "TypeScript muss den breiteren Typ verwenden. " +
      "Fuer Literal-Typen bei let: as const oder explizite Annotation.",
    concept: "Literal Widening / const vs let",
    difficulty: 1,
  },

  {
    id: "09-as-const-readonly-only",
    title: "as const macht nur readonly",
    code: `const arr = ["GET", "POST"] as const;
// Typ: readonly ["GET", "POST"]  — nicht: readonly string[]`,
    commonBelief: "as const macht das Array nur unveraenderlich (readonly).",
    reality:
      "as const hat DREI Effekte: (1) readonly, (2) Literal Types fuer alle " +
      "Werte ('GET' statt string), (3) Tuple statt Array (feste Laenge). " +
      "Das macht as const zur maechtigsten Assertion in TypeScript.",
    concept: "as const / Dreifach-Effekt",
    difficulty: 2,
  },

  {
    id: "09-object-keys-enum",
    title: "Object.keys bei numerischem Enum gibt nur Namen",
    code: `enum Color { Red, Green, Blue }
console.log(Object.keys(Color).length); // 3?`,
    commonBelief: "3 — die drei Farbnamen.",
    reality:
      "6! Numerische Enums haben Reverse Mapping: Das Objekt enthaelt " +
      "DOPPELTE Eintraege (Name→Wert UND Wert→Name). " +
      "Object.keys gibt ['0','1','2','Red','Green','Blue']. " +
      "String Enums haben kein Reverse Mapping und geben nur 3.",
    concept: "Reverse Mapping / Object.keys",
    difficulty: 3,
  },

  {
    id: "09-const-enum-always-better",
    title: "const enum ist immer besser als regulaeres enum",
    code: `const enum Direction { Up = "UP", Down = "DOWN" }
// Wird inline ersetzt — kein Runtime-Code!`,
    commonBelief: "const enum ist immer besser weil es keinen Laufzeit-Code erzeugt.",
    reality:
      "const enum ist NICHT mit isolatedModules kompatibel — " +
      "und isolatedModules ist Standard bei Vite, esbuild, swc, Next.js. " +
      "Cross-file const enum funktioniert nicht wenn jede Datei einzeln " +
      "kompiliert wird. Die Alternative: as const Objects.",
    concept: "const enum / isolatedModules",
    difficulty: 4,
  },

  {
    id: "09-template-literal-additive",
    title: "Template Literal Types addieren die Mitglieder",
    code: `type Size = "sm" | "md" | "lg";       // 3
type Color = "red" | "blue" | "green"; // 3
type Token = \`\${Size}-\${Color}\`;       // ???`,
    commonBelief: "Token hat 6 Mitglieder (3 + 3).",
    reality:
      "Token hat 9 Mitglieder (3 x 3)! Template Literal Types erzeugen " +
      "das KARTESISCHE PRODUKT: Jede Size-Variante wird mit jeder " +
      "Color-Variante kombiniert. Das ist Multiplikation, nicht Addition.",
    concept: "Template Literal Types / Kartesisches Produkt",
    difficulty: 2,
  },

  {
    id: "09-branded-runtime",
    title: "Branded Types existieren zur Laufzeit",
    code: `type EUR = number & { __brand: "EUR" };
const betrag = 42 as EUR;
console.log((betrag as any).__brand); // "EUR"?`,
    commonBelief: "Die __brand-Property existiert auf dem Wert — man kann sie lesen.",
    reality:
      "Branded Types sind ein reiner Compile-Zeit-Mechanismus. " +
      "Die __brand-Property existiert NICHT zur Laufzeit. " +
      "betrag ist zur Laufzeit eine normale Zahl (42). " +
      "(betrag as any).__brand ist undefined. " +
      "Es ist ein Type-Level-Trick fuer semantische Unterscheidung.",
    concept: "Branded Types / Compile-Zeit",
    difficulty: 4,
  },
];
