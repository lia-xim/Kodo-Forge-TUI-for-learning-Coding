/**
 * Lektion 16 — Fehlkonzeption-Exercises: Mapped Types
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
    id: "16-modifier-stacking",
    title: "Modifier kann man beliebig stapeln",
    code: `type DoubleOptional<T> = {
  [K in keyof T]+?+?: T[K]; // Doppelt optional?
};`,
    commonBelief: "Man kann Modifier mehrfach anwenden fuer staerkeren Effekt.",
    reality:
      "Jeder Modifier kann nur einmal pro Position stehen. +? oder -? — " +
      "mehr gibt es nicht. Doppeltes ? ist ein Syntax-Fehler. " +
      "Optional ist binaer: entweder ja oder nein.",
    concept: "Mapped Type Modifier",
    difficulty: 1,
  },
  {
    id: "16-mapped-runtime",
    title: "Mapped Types generieren Runtime-Code",
    code: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

// "Jetzt existieren getName() und getEmail() als Funktionen"`,
    commonBelief: "Mapped Types erzeugen automatisch Runtime-Implementierungen.",
    reality:
      "Mapped Types existieren NUR auf Type-Level. Sie beschreiben " +
      "die FORM eines Typs, erzeugen aber keinen Runtime-Code. " +
      "Die Implementierung muss separat geschrieben werden. " +
      "TypeScript-Typen werden beim Compilieren komplett entfernt.",
    concept: "Type-Level vs Runtime",
    difficulty: 2,
  },
  {
    id: "16-never-value-vs-key",
    title: "never im Wert-Typ entfernt die Property",
    code: `type RemoveStrings<T> = {
  [K in keyof T]: T[K] extends string ? never : T[K];
};

// Erwartet: Properties mit string-Wert verschwinden
// Realitaet: Properties bleiben, haben aber Typ 'never'`,
    commonBelief: "never als Wert-Typ entfernt die Property aus dem Typ.",
    reality:
      "never als WERT-Typ macht die Property unbenutzbar (nichts kann " +
      "zu never zugewiesen werden), aber die Property EXISTIERT noch. " +
      "Um Properties zu entfernen braucht man never im KEY Remapping: " +
      "`[K in keyof T as T[K] extends string ? never : K]`.",
    concept: "never im Key vs Wert",
    difficulty: 3,
  },
  {
    id: "16-keyof-string-only",
    title: "keyof gibt immer string zurueck",
    code: `interface NumericKeys {
  0: 'zero';
  1: 'one';
  [Symbol.iterator]: () => Iterator<string>;
}

type Keys = keyof NumericKeys;
// Erwartung: "0" | "1" | "Symbol.iterator"
// Realitaet: 0 | 1 | typeof Symbol.iterator`,
    commonBelief: "keyof T gibt immer string-Keys zurueck.",
    reality:
      "keyof kann string, number UND symbol zurueckgeben. " +
      "Array-Indizes sind number-Keys, Symbols sind symbol-Keys. " +
      "Deshalb braucht man `string & K` in Template Literal Types — " +
      "um sicherzustellen dass nur string-Keys verwendet werden.",
    concept: "keyof Return Type",
    difficulty: 3,
  },
  {
    id: "16-deep-partial-functions",
    title: "DeepPartial macht auch Funktionen optional",
    code: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Service {
  config: { timeout: number };
  process: (data: string) => void;
}

type DP = DeepPartial<Service>;
// process wird zu DeepPartial<(data: string) => void> — kaputt!`,
    commonBelief: "DeepPartial funktioniert automatisch korrekt fuer alle Typen.",
    reality:
      "Funktionen sind auch 'object' in TypeScript. Ohne einen " +
      "Function-Check wird DeepPartial rekursiv auf Funktionen angewendet " +
      "und erzeugt unsinnige Typen. Die Loesung: " +
      "`T[K] extends Function ? T[K] : DeepPartial<T[K]>` — " +
      "Funktionen durchreichen, nur 'echte' Objekte rekursiv verarbeiten.",
    concept: "Rekursive Mapped Types / Function Guard",
    difficulty: 4,
  },
  {
    id: "16-homomorphic-misunderstanding",
    title: "Alle Mapped Types bewahren Modifier",
    code: `type FromUnion = {
  [K in 'a' | 'b' | 'c']: string;
};
// Kein readonly, kein optional — egal was das Original hatte`,
    commonBelief: "Mapped Types bewahren immer readonly und optional vom Quell-Typ.",
    reality:
      "Nur HOMOMORPHE Mapped Types (die `keyof T` als Source verwenden) " +
      "bewahren Modifier. Wenn die Source ein String-Union ist statt " +
      "keyof T, gehen alle Modifier verloren. " +
      "`[K in keyof T]` = homomorph. `[K in 'a' | 'b']` = nicht homomorph.",
    concept: "Homomorphe vs nicht-homomorphe Mapped Types",
    difficulty: 3,
  },
  {
    id: "16-conditional-key-vs-value",
    title: "Conditional im Key und im Wert sind dasselbe",
    code: `// Im KEY (filtert Properties):
type A<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };

// Im WERT (transformiert Typ):
type B<T> = { [K in keyof T]: T[K] extends string ? K : never };

// A und B sind SEHR verschieden!`,
    commonBelief: "Es macht keinen Unterschied ob der Conditional im Key oder Wert steht.",
    reality:
      "Conditional im KEY (as-Clause) FILTERT Properties — never entfernt den Key. " +
      "Conditional im WERT transformiert den Typ — never als Wert macht die Property " +
      "unbenutzbar aber sie existiert noch. " +
      "A entfernt nicht-string Properties. B behaelt alle Properties aber gibt " +
      "nicht-string Properties den Typ never.",
    concept: "Key-Filterung vs Wert-Transformation",
    difficulty: 4,
  },
  {
    id: "16-mapped-type-widening",
    title: "Mapped Types verhindern Type Widening",
    code: `type Exact<T> = { [K in keyof T]: T[K] };

const obj: Exact<{ name: string }> = {
  name: "Max",
  extra: "oops", // Error? Nein — Excess Property Check greift, NICHT Mapped Type
};`,
    commonBelief: "Mapped Types verhindern dass zusaetzliche Properties angegeben werden.",
    reality:
      "Excess Property Checking ist ein separater Mechanismus der bei " +
      "direkten Objekt-Literalen greift. Mapped Types allein verhindern " +
      "keine zusaetzlichen Properties bei Zuweisungen aus Variablen. " +
      "Fuer strikte 'exact types' gibt es in TypeScript noch keinen " +
      "eingebauten Mechanismus (Stand TS 5.x).",
    concept: "Excess Property Checking vs Type System",
    difficulty: 4,
  },
];
