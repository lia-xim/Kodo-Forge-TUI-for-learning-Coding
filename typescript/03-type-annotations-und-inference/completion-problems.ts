/**
 * Lektion 03 — Completion Problems: Type Annotations & Inference
 *
 * Code-Templates mit strategischen Luecken (______).
 * Der Lernende fuellt die Luecken — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code mit ______ als Platzhalter fuer Luecken */
  template: string;
  /** Loesung mit gefuellten Luecken */
  solution: string;
  /** Welche Luecke welche Antwort hat */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Verwandtes Konzept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Wann annotieren, wann infern lassen (leicht) ───────────────────
  {
    id: "03-cp-annotate-or-infer",
    title: "Annotieren oder infern lassen?",
    description:
      "Entscheide fuer jede Stelle, ob eine Annotation noetig ist " +
      "oder ob TypeScript den Typ selbst erkennt. Schreibe 'INFER' " +
      "wenn die Annotation ueberfluessig ist.",
    template: `// Parameter: MUSS annotiert werden
function greet(name: ______): string {
  // Lokale Variable: Inference reicht
  const message ______ = \`Hallo, \${name}!\`;
  return message;
}

// const mit Primitive: Inference reicht
const greeting ______ = greet("Max");

// Leeres Array: MUSS annotiert werden
const items: ______[] = [];`,
    solution: `// Parameter: MUSS annotiert werden
function greet(name: string): string {
  // Lokale Variable: Inference reicht
  const message = \`Hallo, \${name}!\`;
  return message;
}

// const mit Primitive: Inference reicht
const greeting = greet("Max");

// Leeres Array: MUSS annotiert werden
const items: string[] = [];`,
    blanks: [
      {
        placeholder: "______",
        answer: "string",
        hint: "Funktions-Parameter brauchen IMMER eine Annotation.",
      },
      {
        placeholder: "______",
        answer: "",
        hint: "Braucht eine lokale Variable mit Initialwert eine Annotation? (Nein — leer lassen.)",
      },
      {
        placeholder: "______",
        answer: "",
        hint: "Kann TypeScript den Typ aus dem Funktionsaufruf ableiten? (Ja — leer lassen.)",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Leere Arrays brauchen eine Annotation — welchen Typ sollen die Elemente haben?",
      },
    ],
    concept: "Wann annotieren? / Inference-Regeln",
  },

  // ─── 2: Widening kontrollieren (leicht-mittel) ─────────────────────────
  {
    id: "03-cp-widening",
    title: "Widening verstehen und kontrollieren",
    description:
      "Fuelle die Typen ein, die TypeScript fuer jede Variable infert. " +
      "Beachte den Unterschied zwischen let und const.",
    template: `const literal = "hello";
// TypeScript infert: ______

let mutable = "hello";
// TypeScript infert: ______

const config = { mode: "dark" };
// Typ von config.mode: ______

const configFixed = { mode: "dark" } as ______;
// Typ von configFixed.mode: ______`,
    solution: `const literal = "hello";
// TypeScript infert: "hello"

let mutable = "hello";
// TypeScript infert: string

const config = { mode: "dark" };
// Typ von config.mode: string

const configFixed = { mode: "dark" } as const;
// Typ von configFixed.mode: "dark"`,
    blanks: [
      {
        placeholder: "______",
        answer: '"hello"',
        hint: "const mit Primitive: TypeScript behaelt den Literal-Typ.",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "let erlaubt Neuzuweisung — TypeScript erweitert zum Basistyp.",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Objekt-Properties werden geweitert, auch bei const.",
      },
      {
        placeholder: "______",
        answer: "const",
        hint: "Welches Schluesselwort verhindert Widening bei Objekten?",
      },
      {
        placeholder: "______",
        answer: '"dark"',
        hint: "Mit as const bleibt der Literal-Typ erhalten.",
      },
    ],
    concept: "Type Widening / const vs. let / as const",
  },

  // ─── 3: Contextual Typing nutzen (mittel) ──────────────────────────────
  {
    id: "03-cp-contextual-typing",
    title: "Contextual Typing nutzen",
    description:
      "Nutze Contextual Typing, um unnoetige Annotationen zu vermeiden. " +
      "Bei der letzten Stelle: Warum geht Contextual Typing verloren?",
    template: `const numbers = [10, 20, 30];

// Contextual Typing: n hat automatisch den Typ 'number'
const doubled = numbers.map(______ => n * 2);

// Contextual Typing bei .filter():
const large = numbers.filter(______ => n > 15);

// Contextual Typing bei .reduce():
const sum = numbers.reduce((______, curr) => acc + curr, 0);

// KEIN Contextual Typing — Typ muss annotiert werden:
const handler = (event: ______) => {
  console.log(event.clientX);
};
document.addEventListener("click", handler);`,
    solution: `const numbers = [10, 20, 30];

const doubled = numbers.map(n => n * 2);

const large = numbers.filter(n => n > 15);

const sum = numbers.reduce((acc, curr) => acc + curr, 0);

const handler = (event: MouseEvent) => {
  console.log(event.clientX);
};
document.addEventListener("click", handler);`,
    blanks: [
      {
        placeholder: "______",
        answer: "n",
        hint: "TypeScript weiss den Typ aus dem Array-Element. Einfach den Parameternamen.",
      },
      {
        placeholder: "______",
        answer: "n",
        hint: "Gleich wie bei .map() — Contextual Typing funktioniert bei allen Array-Methoden.",
      },
      {
        placeholder: "______",
        answer: "acc",
        hint: "Der Accumulator — sein Typ kommt vom Startwert (0 → number).",
      },
      {
        placeholder: "______",
        answer: "MouseEvent",
        hint: "Contextual Typing fehlt bei separater Definition. Welcher Event-Typ passt zu 'click'?",
      },
    ],
    concept: "Contextual Typing / Callback-Inference",
  },

  // ─── 4: Control Flow Narrowing (mittel) ────────────────────────────────
  {
    id: "03-cp-control-flow",
    title: "Control Flow Narrowing",
    description:
      "Vervollstaendige die Funktion. TypeScript verengt den Typ " +
      "nach jeder Pruefung — nutze das aus.",
    template: `function format(value: string | number | boolean | null): string {
  // Schritt 1: null ausschliessen
  if (value ______ null) {
    return "kein Wert";
  }
  // Hier ist value: string | number | boolean

  // Schritt 2: string erkennen
  if (______ value === "______") {
    return value.toUpperCase();
  }
  // Hier ist value: number | boolean

  // Schritt 3: number erkennen
  if (typeof value === "number") {
    return value.______(2);
  }
  // Hier ist value: boolean

  return value ? "ja" : "nein";
}`,
    solution: `function format(value: string | number | boolean | null): string {
  if (value === null) {
    return "kein Wert";
  }

  if (typeof value === "string") {
    return value.toUpperCase();
  }

  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value ? "ja" : "nein";
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "===",
        hint: "Strikter Gleichheitsoperator fuer null-Pruefung.",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator ermoeglicht Type Narrowing fuer primitive Typen?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Gegen welchen typeof-Wert pruefst du?",
      },
      {
        placeholder: "______",
        answer: "toFixed",
        hint: "Welche number-Methode formatiert auf eine bestimmte Anzahl Dezimalstellen?",
      },
    ],
    concept: "Control Flow Analysis / Type Narrowing",
  },

  // ─── 5: satisfies in der Praxis (mittel-schwer) ────────────────────────
  {
    id: "03-cp-satisfies",
    title: "satisfies vs. Annotation",
    description:
      "Verwende `satisfies`, um eine Konfiguration zu validieren " +
      "UND gleichzeitig die praezisen Typen zu behalten.",
    template: `type RouteConfig = Record<string, {
  path: string;
  auth: boolean;
}>;

// Mit Annotation — Typen gehen verloren:
const routesAnnotated: RouteConfig = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
};
// routesAnnotated.home.path ist: string (nicht "/")

// Mit satisfies — praezise Typen bleiben:
const routes = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} ______ RouteConfig;

// routes.home.path ist jetzt: "/"
// routes.dashboard.auth ist jetzt: true

// Kombination: as const + satisfies fuer maximale Praezision
const ROUTES = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} ______ ______ ______ RouteConfig;

// Alle Route-Pfade als Union-Typ:
type RoutePath = ______ ROUTES[keyof typeof ROUTES]["path"];
// Ergebnis: "/" | "/dashboard"`,
    solution: `type RouteConfig = Record<string, {
  path: string;
  auth: boolean;
}>;

const routesAnnotated: RouteConfig = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
};

const routes = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} satisfies RouteConfig;

const ROUTES = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} as const satisfies RouteConfig;

type RoutePath = typeof ROUTES[keyof typeof ROUTES]["path"];
// Ergebnis: "/" | "/dashboard"`,
    blanks: [
      {
        placeholder: "______",
        answer: "satisfies",
        hint: "Welcher Operator validiert gegen einen Typ OHNE die Inference zu verlieren?",
      },
      {
        placeholder: "______",
        answer: "as",
        hint: "Erster Teil von 'as const' — fuer Literal-Typen.",
      },
      {
        placeholder: "______",
        answer: "const",
        hint: "Zweiter Teil — macht alles readonly und literal.",
      },
      {
        placeholder: "______",
        answer: "satisfies",
        hint: "Danach kommt die Validierung — welcher Operator?",
      },
      {
        placeholder: "______",
        answer: "typeof",
        hint: "Welcher Operator extrahiert den TYPE aus einer Laufzeit-Variable?",
      },
    ],
    concept: "satisfies / as const / Praezise Inference",
  },

  // ─── 6: Return-Typ-Best-Practices (schwer) ─────────────────────────────
  {
    id: "03-cp-return-types",
    title: "Return-Typen bei exportierten Funktionen",
    description:
      "Annotiere die Return-Typen der exportierten Funktionen explizit. " +
      "Das 'Annotate at boundaries'-Prinzip: Interne Inference, " +
      "externe Annotation.",
    template: `// EXPORTIERT: Expliziter Return-Typ (Best Practice)
export function parseAge(input: string): ______ {
  const parsed = parseInt(input, 10);
  if (______) return null;
  if (parsed < 0 || parsed > 150) return null;
  return parsed;
}

// EXPORTIERT: Komplexer Return — Typ dokumentiert die Intention
export function classify(value: unknown): ______ {
  if (value === null || value === undefined) return "empty" ______ const;
  if (typeof value === "string") return "text" as const;
  if (typeof value === "number") return "numeric" as const;
  return "other" as const;
}

// INTERN: Inference reicht (nicht exportiert)
function double(n: number) {
  return n * 2;
}`,
    solution: `export function parseAge(input: string): number | null {
  const parsed = parseInt(input, 10);
  if (isNaN(parsed)) return null;
  if (parsed < 0 || parsed > 150) return null;
  return parsed;
}

export function classify(value: unknown): "empty" | "text" | "numeric" | "other" {
  if (value === null || value === undefined) return "empty" as const;
  if (typeof value === "string") return "text" as const;
  if (typeof value === "number") return "numeric" as const;
  return "other" as const;
}

function double(n: number) {
  return n * 2;
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "number | null",
        hint: "Die Funktion gibt entweder eine Zahl oder null zurueck.",
      },
      {
        placeholder: "______",
        answer: "isNaN(parsed)",
        hint: "Wie prueft man, ob parseInt einen ungueltigen Wert (NaN) zurueckgegeben hat?",
      },
      {
        placeholder: "______",
        answer: '"empty" | "text" | "numeric" | "other"',
        hint: "Union aller moeglichen Return-Werte als Literal-Typen.",
      },
      {
        placeholder: "______",
        answer: "as",
        hint: "Schluesselwort fuer 'as const' um den Literal-Typ im Return zu behalten.",
      },
    ],
    concept: "Return-Typ-Annotation / Annotate at boundaries / as const",
  },
];
