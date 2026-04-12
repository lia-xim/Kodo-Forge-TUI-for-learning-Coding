/**
 * LEKTION 03 - Beispiel 6: satisfies Deep Dive
 *
 * Der satisfies-Operator (TypeScript 4.9+) loest ein Problem, das seit
 * Beginn von TypeScript existiert: Die Wahl zwischen Validierung (Annotation)
 * und Praezision (Inference). Mit satisfies bekommst du beides.
 *
 * Dieses Beispiel zeigt systematisch, wann du satisfies, wann Annotation,
 * und wann reine Inference verwenden solltest.
 */

// ============================================================================
// 1. DAS KERNPROBLEM: ANNOTATION vs INFERENCE
// ============================================================================

type Theme = {
  colors: Record<string, string>;
  fontSize: number;
  fontFamily: string;
};

// --- Option A: Annotation (`: Theme`) ---
const themeAnnotated: Theme = {
  colors: { primary: "#007bff", secondary: "#6c757d" },
  fontSize: 16,
  fontFamily: "Arial",
};

// Pro: Tippfehler werden erkannt
// Con: themeAnnotated.colors.primary ist 'string' (nicht konkreter)
const primaryA = themeAnnotated.colors.primary;
// Typ: string  <-- Das ist korrekt, aber...
// ...wenn du weisst, dass 'primary' existiert, ist das unnoetig vage.

// --- Option B: Inference (kein Typ) ---
const themeInferred = {
  colors: { primary: "#007bff", secondary: "#6c757d" },
  fontSize: 16,
  fontFamily: "Arial",
};

// Pro: Spezifische Typen
// Con: Kein Check gegen Theme -- Tippfehler werden NICHT erkannt
const primaryB = themeInferred.colors.primary;
// Typ: string  (hier gleich, aber bei komplexeren Typen sieht man den Unterschied)

// --- Option C: satisfies ---
const themeSatisfied = {
  colors: { primary: "#007bff", secondary: "#6c757d" },
  fontSize: 16,
  fontFamily: "Arial",
} satisfies Theme;

// Pro: Tippfehler werden erkannt UND spezifische Typen bleiben
const primaryC = themeSatisfied.colors.primary;
// Typ: string  (gleich hier, aber der Zugriff auf .colors ist spezifischer)

// Der Unterschied zeigt sich bei Union-Typen:

// ============================================================================
// 2. WO SATISFIES WIRKLICH GLAENZT: UNION-TYPED PROPERTIES
// ============================================================================

type Palette = Record<string, [number, number, number] | string>;

// Mit Annotation: Jeder Wert hat den VOLLEN Union-Typ
const paletteAnnotated: Palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
};
const annotatedRed = paletteAnnotated.red;
// Typ: string | [number, number, number]  <-- ZU BREIT!
// Du weisst, dass 'red' ein Tuple ist, aber TS nicht.

// Mit satisfies: Jeder Wert behaelt seinen spezifischen Typ
const paletteSatisfied = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
} satisfies Palette;
const satisfiedRed = paletteSatisfied.red;
// Typ: [number, number, number]  <-- PRAEZISE!
const satisfiedGreen = paletteSatisfied.green;
// Typ: string  <-- PRAEZISE!

// ============================================================================
// 3. SATISFIES + AS CONST = MAXIMALE PRAEZISION
// ============================================================================

// satisfies allein validiert den Typ.
// as const allein macht alles readonly + Literal.
// Zusammen: Validierung + Readonly + Literal-Typen!

const ROUTES = {
  home: "/",
  users: "/users",
  settings: "/settings",
} as const satisfies Record<string, string>;

// Typ: { readonly home: "/"; readonly users: "/users"; readonly settings: "/settings" }

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
// Typ: "/" | "/users" | "/settings"

// Ohne satisfies haettest du keine Validierung:
// Ein Tippfehler wie `users: 42` wuerde nicht erkannt.
// Ohne as const haettest du nur string statt der Literal-Typen.

// Praxis: API-Endpoints
const API = {
  users: "/api/v1/users",
  posts: "/api/v1/posts",
  comments: "/api/v1/comments",
} as const satisfies Record<string, `/${string}`>;  // Muss mit / starten!

// ============================================================================
// 4. SATISFIES BEI KONFIGURATIONSOBJEKTEN
// ============================================================================

// Angular/React-typisches Szenario: Konfiguration validieren

interface FormFieldConfig {
  type: "text" | "number" | "email" | "select";
  label: string;
  required?: boolean;
  options?: string[];  // Nur fuer select
}

type FormConfig = Record<string, FormFieldConfig>;

const loginForm = {
  username: {
    type: "text",
    label: "Benutzername",
    required: true,
  },
  password: {
    type: "text",
    label: "Passwort",
    required: true,
  },
  role: {
    type: "select",
    label: "Rolle",
    options: ["admin", "user", "guest"],
  },
} satisfies FormConfig;

// TS kennt jetzt die EXAKTEN Felder:
type LoginFields = keyof typeof loginForm;
// Typ: "username" | "password" | "role"  <-- praezise!

// Mit Annotation waere LoginFields = string (weil Record<string, ...>)

// ============================================================================
// 5. SATISFIES ERKENNT EXCESS PROPERTIES
// ============================================================================

interface ButtonProps {
  label: string;
  variant: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

// Annotation: Erkennt Excess Properties
// const btn1: ButtonProps = {
//   label: "Click",
//   variant: "primary",
//   onClick: () => {},  // FEHLER: Excess Property
// };

// satisfies: Erkennt Excess Properties AUCH
// const btn2 = {
//   label: "Click",
//   variant: "primary",
//   onClick: () => {},  // FEHLER: Excess Property
// } satisfies ButtonProps;

// Inference ohne Check: KEIN Fehler -- Extra-Properties sind erlaubt
const btn3 = {
  label: "Click",
  variant: "primary" as const,
  onClick: () => {},  // Kein Fehler -- aber vielleicht ein Tippfehler?
};

// ============================================================================
// 6. WANN SATISFIES NICHT DIE RICHTIGE WAHL IST
// ============================================================================

// Fall 1: Du willst den Typ EINSCHRAENKEN (nicht nur validieren)
//         --> Annotation verwenden

interface StrictConfig {
  mode: "development" | "production";
}

// satisfies laesst den inferierten Typ durch:
const cfg1 = { mode: "development" } satisfies StrictConfig;
// cfg1.mode ist "development" (Literal) -- vielleicht zu spezifisch!

// Annotation beschraenkt auf den annotierten Typ:
const cfg2: StrictConfig = { mode: "development" };
// cfg2.mode ist "development" | "production" -- der volle Union-Typ

// Fall 2: Du brauchst den erweiterten Typ fuer spaetere Zuweisungen
let mutableCfg: StrictConfig = { mode: "development" };
mutableCfg = { mode: "production" };  // OK!

// Mit satisfies waere mutableCfg.mode = "development" (Literal) und
// die Neuzuweisung wuerde scheitern, wenn let + satisfies kombiniert wuerde.

// ============================================================================
// 7. ENTSCHEIDUNGSMATRIX
// ============================================================================

// ┌────────────────────────────────────────┬──────────┬──────────┬───────────┐
// │ Szenario                               │ Annot.   │ satisfies│ Inference │
// ├────────────────────────────────────────┼──────────┼──────────┼───────────┤
// │ Objekt muss Schema entsprechen,        │          │    X     │           │
// │ aber spezifische Typen behalten        │          │          │           │
// ├────────────────────────────────────────┼──────────┼──────────┼───────────┤
// │ Variable soll spaeter                  │    X     │          │           │
// │ andere Werte annehmen                  │          │          │           │
// ├────────────────────────────────────────┼──────────┼──────────┼───────────┤
// │ Lokale Variable mit klarem Wert        │          │          │     X     │
// ├────────────────────────────────────────┼──────────┼──────────┼───────────┤
// │ Konfigurationskonstante mit Schema     │          │    X     │           │
// ├────────────────────────────────────────┼──────────┼──────────┼───────────┤
// │ Funktionsparameter                     │    X     │          │           │
// ├────────────────────────────────────────┼──────────┼──────────┼───────────┤
// │ as const + Validierung                 │          │    X     │           │
// │ (z.B. Enum-Ersatz)                     │          │ +as const│           │
// └────────────────────────────────────────┴──────────┴──────────┴───────────┘

// ============================================================================
// ZUSAMMENFASSUNG
// ============================================================================
//
// satisfies ist das DRITTE Werkzeug neben Annotation und Inference:
//
// 1. Annotation (: Typ)     --> Validiert + setzt den Typ (verliert Praezision)
// 2. Inference (kein Typ)   --> Praezise Typen (keine Validierung)
// 3. satisfies Typ          --> Validiert + behaelt Praezision
//
// FAUSTREGEL: Verwende satisfies wenn du ein Konfigurationsobjekt oder
// eine Konstante hast, die einem Schema entsprechen MUSS, aber du
// gleichzeitig die exakten Typen der Properties behalten willst.
//
// KOMBINIERE: `as const satisfies Typ` fuer maximale Praezision mit Validierung.
