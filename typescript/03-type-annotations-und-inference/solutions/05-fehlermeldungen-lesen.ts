/**
 * LEKTION 03 - Loesung 5: Fehlermeldungen lesen
 *
 * Ausfuehrliche Loesungen mit Erklaerungen.
 * Jede Loesung erklaert:
 * 1. Was die Fehlermeldung WIRKLICH sagt
 * 2. WARUM TypeScript diesen Fehler meldet
 * 3. Wie du ihn korrekt behebst
 *
 * Pruefen: npx tsc --noEmit
 */

// ============================================================================
// FEHLER 1: "Argument of type 'string' is not assignable to parameter
//            of type '"north" | "south" | "east" | "west"'"
//
// ERKLAERUNG: userDirection wurde mit `let` deklariert. Bei `let` tritt
//             Widening ein: "north" wird zu `string` erweitert, weil die
//             Variable spaeter einen anderen String-Wert annehmen koennte.
//             Die Funktion move() erwartet aber nicht irgendeinen String,
//             sondern nur einen von vier spezifischen Literal-Werten.
//             `string` ist BREITER als `Direction` -- deshalb der Fehler.
//
// KERNLEKTION: Widening bei `let` ist die haeufigste Ursache fuer
//              "is not assignable to" Fehler bei Literal-Typen.
// ============================================================================

type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction, steps: number): string {
  return `Moving ${direction} by ${steps} steps`;
}

// Fix 1: const statt let -- behalt den Literal-Typ
const userDirection1 = "north";  // Typ: "north" (kein Widening bei const)
move(userDirection1, 5);  // OK!

// Fix 2: Explizite Annotation -- schraenkt den Typ ein
let userDirection2: Direction = "north";  // Typ: Direction
move(userDirection2, 5);  // OK!

// Fix 3: as const beim Wert -- verhindert Widening punktuell
let userDirection3 = "north" as const;  // Typ: "north"
move(userDirection3, 5);  // OK!

// ============================================================================
// FEHLER 2: "Property 'toUpperCase' does not exist on type 'string | number'"
//
// ERKLAERUNG: Bei einer Union (string | number) laesst TypeScript nur
//             Operationen zu, die auf ALLEN Mitgliedern der Union
//             existieren. .toUpperCase() gibt es nur bei string, nicht
//             bei number. TypeScript weiss nicht, ob value ein string oder
//             number ist -- es koennte beides sein.
//
// KERNLEKTION: Union-Typen erfordern Narrowing, bevor du typ-spezifische
//              Methoden aufrufen kannst. TS denkt konservativ: "Was wenn
//              es doch der andere Typ ist?"
// ============================================================================

function processInput(value: string | number) {
  // Narrowing mit typeof-Check:
  if (typeof value === "string") {
    // value: string (TS hat verengt)
    const upper = value.toUpperCase();  // OK!
    console.log(upper);
  } else {
    // value: number (einzig verbleibender Typ)
    const fixed = value.toFixed(2);  // OK!
    console.log(fixed);
  }
}

// ============================================================================
// FEHLER 3: "Type '(string | null)[]' is not assignable to type 'string[]'"
//
// ERKLAERUNG: Array.filter() gibt IMMER ein Array desselben Elementtyps
//             zurueck. Der Callback-Return-Typ ist `boolean`, und TypeScript
//             kann aus einem boolean-Return nicht ableiten, dass der Typ
//             sich veraendert hat. Es weiss nicht, dass `item !== null`
//             den Typ von `string | null` zu `string` verengt.
//
// KERNLEKTION: filter() narrowt nicht automatisch. Du brauchst ein
//              Type Predicate `(item): item is string =>`, damit TS
//              den verengten Typ uebernimmt.
// ============================================================================

const rawData: (string | null)[] = ["Angular", null, "React", null, "Vue"];

// Loesung: Type Predicate im filter-Callback
const frameworks: string[] = rawData.filter(
  (item): item is string => item !== null
);
// (item): item is string sagt TS: "Wenn true, ist item string"

console.log(frameworks);  // ["Angular", "React", "Vue"]

// ============================================================================
// FEHLER 4: "Object is possibly 'undefined'."
//
// ERKLAERUNG: Das `?` in `address?: { ... }` bedeutet, dass address
//             den Typ `{ street: string; city: string } | undefined` hat.
//             Wenn du direkt auf user.address.city zugreifst, koennte
//             address undefined sein -- und undefined hat kein .city.
//             TypeScript schuetzt dich vor einem Runtime-Error.
//
// KERNLEKTION: Optionale Properties fuegen immer `| undefined` hinzu.
//              Du musst pruefen, ob der Wert existiert, bevor du darauf
//              zugreifst.
// ============================================================================

interface User {
  name: string;
  address?: {
    street: string;
    city: string;
  };
}

// Fix 1: Optional Chaining + Fallback
function getCity1(user: User): string {
  return user.address?.city ?? "Unbekannt";
  // ?. gibt undefined zurueck wenn address undefined ist
  // ?? gibt den Fallback-Wert wenn das Ergebnis null/undefined ist
}

// Fix 2: Narrowing mit if-Check
function getCity2(user: User): string {
  if (user.address) {
    // user.address: { street: string; city: string } (TS hat undefined ausgeschlossen)
    return user.address.city;
  }
  return "Unbekannt";
}

// ============================================================================
// FEHLER 5: satisfies erkennt Tippfehler
//
// ERKLAERUNG: satisfies validiert das Objekt gegen das Schema
//             (Record<string, FieldConfig>). Jedes Property muss ein
//             gueltiges FieldConfig sein. "texxt" ist kein gueltiger Wert
//             fuer `type: "text" | "number" | "email"`.
//
//             OHNE satisfies (reine Inference) wuerde "texxt" einfach als
//             String-Literal inferiert werden -- kein Fehler, weil kein
//             Schema zum Validieren vorhanden ist.
//
// KERNLEKTION: satisfies = Validierung + Praezision. Inference allein
//              gibt dir Praezision ohne Validierung. Annotation gibt dir
//              Validierung ohne Praezision. satisfies gibt dir beides.
// ============================================================================

interface FieldConfig {
  type: "text" | "number" | "email";
  label: string;
  required: boolean;
}

const loginForm = {
  username: { type: "text", label: "Name", required: true },
  age: { type: "number", label: "Alter", required: false },
} satisfies Record<string, FieldConfig>;

// Praezise Typen bleiben erhalten:
// loginForm.username.type ist "text" (nicht "text" | "number" | "email")
// loginForm.age.type ist "number" (nicht "text" | "number" | "email")

// ============================================================================
// FEHLER 6: Leeres Array ohne Annotation
//
// ERKLAERUNG: TypeScript analysiert LOKAL und NICHT vorausschauend.
//             Wenn du `const results = [];` schreibst, hat TS an dieser
//             Stelle keine Information ueber den Inhalt. Es schaut nicht
//             voraus auf `results.push(i * 2)`, um den Typ abzuleiten.
//             Deshalb wird `results` zu `any[]` (mit noImplicitAny: Fehler).
//
// KERNLEKTION: Leere Arrays IMMER annotieren. TypeScript schaut nicht
//              in die Zukunft -- es kennt nur das, was es an der
//              Deklarationsstelle sieht.
// ============================================================================

function collectResultsFixed(count: number): number[] {
  const results: number[] = [];  // Annotation: "Hier kommen numbers rein"

  for (let i = 0; i < count; i++) {
    results.push(i * 2);  // OK: number passt in number[]
  }

  return results;
}

// ============================================================================
// LESE-TIPP FUER FEHLERMELDUNGEN:
//
// 1. Lies von UNTEN nach OBEN -- die letzte Zeile sagt dir WAS nicht passt
// 2. Die Zeilen darueber erklaeren den KONTEXT (wo und warum)
// 3. Suche nach dem Wort "not assignable" -- es sagt dir:
//    - Links: Was du HAST
//    - Rechts: Was erwartet WIRD
// 4. Frage dich: "Warum hat mein Wert diesen Typ?" (meist: Widening)
//
// Beispiel:
//   Argument of type 'string' is not assignable to
//   parameter of type '"north" | "south" | "east" | "west"'
//                       ^                      ^
//                 Was du HAST           Was erwartet WIRD
//
// Diagnose: "Ich habe string, brauche aber einen Literal-Typ.
//            Wahrscheinlich Widening bei `let`. Loesung: const oder Annotation."
// ============================================================================

console.log("--- Alle Fehler behoben! ---");
console.log("move:", move(userDirection1, 5));
console.log("frameworks:", frameworks);
console.log("city1:", getCity1({ name: "Max" }));
console.log("city2:", getCity2({ name: "Max", address: { street: "Hauptstr. 1", city: "Berlin" } }));
console.log("results:", collectResultsFixed(5));
