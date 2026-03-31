/**
 * Lektion 03 — Fehlkonzeption-Exercises: Type Annotations & Inference
 *
 * Code der "offensichtlich richtig" aussieht aber subtil falsch ist.
 * Der Lernende muss den Bug finden.
 */

export interface Misconception {
  id: string;
  title: string;
  /** Der "offensichtlich korrekte" Code */
  code: string;
  /** Was die meisten Leute denken */
  commonBelief: string;
  /** Was tatsaechlich passiert */
  reality: string;
  /** Welches Konzept getestet wird */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: const-Objekt hat Literal-Properties ─────────────────────────────
  {
    id: "03-const-object-literal",
    title: "const-Objekt inferiert Literal-Typen fuer Properties",
    code: `const settings = {
  mode: "dark",
  fontSize: 14,
  language: "de",
};

// Welchen Typ hat settings.mode?
// Antwort: "dark"? Oder string?`,
    commonBelief:
      '`const settings` bedeutet, dass `settings.mode` den Typ `"dark"` hat — ' +
      "denn const-Variablen behalten ihren Literal-Typ.",
    reality:
      "`settings.mode` hat den Typ `string`, NICHT `\"dark\"`. " +
      "Bei primitiven const-Variablen (`const x = 'dark'`) bleibt der Literal-Typ. " +
      "Aber bei Objekten werden Properties geweitert, weil man " +
      "`settings.mode = 'light'` schreiben koennte — das Objekt " +
      "ist const, seine Properties nicht. " +
      "Loesung: `as const` auf dem gesamten Objekt.",
    concept: "Property Widening / const vs. as const",
    difficulty: 2,
  },

  // ─── 2: Object.keys gibt (keyof T)[] zurueck ──────────────────────────
  {
    id: "03-object-keys-keyof",
    title: "Object.keys() gibt typisierte Keys zurueck",
    code: `interface User {
  name: string;
  age: number;
  email: string;
}

const user: User = { name: "Max", age: 30, email: "max@test.de" };

// "Typsicheres Iterieren ueber alle Keys:"
const keys = Object.keys(user);
// keys ist ("name" | "age" | "email")[]  ... oder?

keys.forEach(key => {
  console.log(user[key]); // Fehler!
});`,
    commonBelief:
      "`Object.keys(user)` gibt `(keyof User)[]` zurueck, also " +
      "`('name' | 'age' | 'email')[]`. Damit kann man typsicher " +
      "auf die Properties zugreifen.",
    reality:
      "`Object.keys()` gibt IMMER `string[]` zurueck — nicht `(keyof T)[]`. " +
      "TypeScript ist absichtlich konservativ: Ein Objekt koennte zur " +
      "Laufzeit mehr Keys haben als der Typ beschreibt (z.B. durch " +
      "Vererbung oder dynamische Zuweisung). `('name' | 'age' | 'email')[]` " +
      "waere technisch unsound. Der Zugriff `user[key]` mit `key: string` " +
      "erzeugt einen Compiler-Fehler.",
    concept: "Object.keys() / Structural Typing / Soundness",
    difficulty: 3,
  },

  // ─── 3: Redundante Annotationen ─────────────────────────────────────────
  {
    id: "03-redundant-annotations",
    title: "Mehr Annotationen = besserer Code",
    code: `const name: string = "Max";
const age: number = 30;
const isActive: boolean = true;
const items: string[] = ["a", "b", "c"];

function getLength(text: string): number {
  const len: number = text.length;
  return len;
}`,
    commonBelief:
      "Je mehr Typ-Annotationen, desto sicherer der Code. Man sollte " +
      "JEDE Variable explizit annotieren.",
    reality:
      "Die meisten Annotationen hier sind ueberfluessig und machen den " +
      "Code nur unuebersichtlicher. TypeScript infert alle diese Typen " +
      "korrekt: `'Max'` → string, `30` → number, `text.length` → number. " +
      "Ueberfluessige Annotationen koennen sogar SCHAEDLICH sein: " +
      "`const name: string` verliert den Literal-Typ `\"Max\"`. " +
      "Annotiere nur dort, wo Inference versagt oder Klarheit noetig ist.",
    concept: "Inference / Wann annotieren?",
    difficulty: 2,
  },

  // ─── 4: Contextual Typing geht verloren ────────────────────────────────
  {
    id: "03-contextual-typing-lost",
    title: "Contextual Typing funktioniert ueberall",
    code: `// Handler separat definieren:
const clickHandler = (event) => {
  console.log(event.clientX, event.clientY);
};

// Spaeter verwenden:
document.addEventListener("click", clickHandler);`,
    commonBelief:
      "TypeScript weiss, dass `clickHandler` an `addEventListener` " +
      "uebergeben wird, also hat `event` automatisch den Typ " +
      "`MouseEvent` — auch wenn der Handler vorher definiert wird.",
    reality:
      "`event` hat den Typ `any`! Contextual Typing funktioniert nur, " +
      "wenn der Callback DIREKT als Argument uebergeben wird. " +
      "Bei separater Definition hat TypeScript an der Definitionsstelle " +
      "keinen Kontext. Die Verbindung zu `addEventListener` entsteht " +
      "erst spaeter — zu spaet fuer Inference. " +
      "Loesung: Inline-Callback oder explizite Annotation " +
      "`(event: MouseEvent) =>`.",
    concept: "Contextual Typing / Inference-Grenzen",
    difficulty: 3,
  },

  // ─── 5: as const auf einzelne Properties ────────────────────────────────
  {
    id: "03-as-const-partial",
    title: "as const macht nur Werte readonly",
    code: `const config = {
  apiUrl: "https://api.example.com",
  retries: 3,
  method: "GET" as const,
} as const;

// "as const" macht das Objekt unveraenderbar:
config.retries = 5;       // Fehler! (erwartet)
config.apiUrl = "other";  // Fehler! (erwartet)

// Aber was ist der Typ von config?`,
    commonBelief:
      "`as const` macht nur die Werte readonly — die Typen " +
      "bleiben `string` und `number`.",
    reality:
      "`as const` macht DREI Dinge: (1) Alle Properties werden `readonly`, " +
      "(2) alle Werte behalten ihre Literal-Typen (" +
      '`"https://api.example.com"`, `3`, `"GET"`), und ' +
      "(3) Arrays werden zu readonly Tuples. " +
      "Der Typ von `config` ist " +
      "`{ readonly apiUrl: \"https://api.example.com\"; readonly retries: 3; readonly method: \"GET\" }` — " +
      "extrem praezise. Das ist maechtiger als nur readonly.",
    concept: "as const / Literal Types / readonly",
    difficulty: 3,
  },

  // ─── 6: satisfies ersetzt Annotation ────────────────────────────────────
  {
    id: "03-satisfies-replaces-annotation",
    title: "satisfies und Annotation sind austauschbar",
    code: `type Theme = Record<string, string | number[]>;

// Mit Annotation:
const themeA: Theme = {
  primary: "#007bff",
  spacing: [4, 8, 16],
};

// Mit satisfies:
const themeB = {
  primary: "#007bff",
  spacing: [4, 8, 16],
} satisfies Theme;

// Gleich?
themeA.primary.toUpperCase();  // ???
themeB.primary.toUpperCase();  // ???`,
    commonBelief:
      "`satisfies` und `: Typ` machen dasselbe — beide pruefen " +
      "gegen den Typ. Es ist nur eine andere Schreibweise.",
    reality:
      "Bei `themeA.primary` (Annotation) ist der Typ `string | number[]` — " +
      "der volle Union aus `Theme`. `.toUpperCase()` erzeugt einen Fehler, " +
      "weil `number[]` keine `.toUpperCase()`-Methode hat. " +
      "Bei `themeB.primary` (satisfies) ist der Typ `string` — der " +
      "spezifische inferierte Typ. `.toUpperCase()` funktioniert! " +
      "`satisfies` validiert gegen den Typ, behaelt aber die praezise " +
      "Inference. Das ist der Kernunterschied.",
    concept: "satisfies vs. Annotation / Praezise Inference",
    difficulty: 4,
  },

  // ─── 7: Return-Typ immer infern lassen ─────────────────────────────────
  {
    id: "03-always-infer-return",
    title: "Inference fuer Return-Typen reicht immer",
    code: `// Version 1: Gibt string | null zurueck
export function findUser(id: number) {
  const users = [{ id: 1, name: "Max" }, { id: 2, name: "Anna" }];
  const user = users.find(u => u.id === id);
  return user ? user.name : null;
}

// Spaeter geaendert: (vergessen, dass sich der Typ aendert!)
export function findUserV2(id: number) {
  const users = [{ id: 1, name: "Max" }, { id: 2, name: "Anna" }];
  const user = users.find(u => u.id === id);
  if (!user) return;  // undefined statt null!
  return user.name;
}`,
    commonBelief:
      "Man sollte Return-Typen NIE annotieren — TypeScript infert " +
      "immer den korrekten Typ, und das ist gut genug.",
    reality:
      "In `findUserV2` hat sich der Return-Typ klammheimlich von " +
      "`string | null` zu `string | undefined` geaendert — weil " +
      "`return;` (ohne Wert) `undefined` zurueckgibt, nicht `null`. " +
      "Alle Aufrufer, die auf `=== null` pruefen, haben jetzt einen Bug. " +
      "Bei exportierten Funktionen ist ein expliziter Return-Typ " +
      "(`): string | null`) Best Practice: Er macht die Intention klar " +
      "und verhindert versehentliche Typ-Aenderungen.",
    concept: "Return-Typ-Annotation / API-Stabilitaet",
    difficulty: 3,
  },

  // ─── 8: Leeres Array wird never[] ──────────────────────────────────────
  {
    id: "03-empty-array-type",
    title: "Leere Arrays werden zu never[]",
    code: `function collectItems() {
  const items = [];

  items.push("hello");
  items.push(42);
  items.push(true);

  return items;
}

const result = collectItems();
// Was ist der Typ von result?`,
    commonBelief:
      "Ein leeres Array `const items = []` bekommt den Typ `never[]`, " +
      "und TypeScript meldet einen Fehler wenn man etwas hinzufuegt.",
    reality:
      "Innerhalb einer Funktion nutzt TypeScript 'Evolving Arrays': " +
      "Das leere Array startet als `any[]` und der Typ 'waechst' mit " +
      "jedem `.push()`. Am Ende ist `result` vom Typ `(string | number | boolean)[]`. " +
      "Das funktioniert, aber ist unsicher — der `any[]`-Starttyp umgeht " +
      "die Typenpruefung. Besser: `const items: string[] = []` mit " +
      "expliziter Annotation.",
    concept: "Leere Arrays / Evolving Types / any[]",
    difficulty: 4,
  },
];
