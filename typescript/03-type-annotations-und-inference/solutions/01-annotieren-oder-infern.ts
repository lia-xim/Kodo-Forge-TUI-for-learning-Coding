/**
 * LEKTION 03 - Loesung 1: Annotieren oder Infern?
 *
 * Hier sind die Loesungen mit ausfuehrlichen Erklaerungen,
 * WARUM annotiert oder nicht annotiert wird.
 *
 * Ausfuehren: npx tsx 03-type-annotations-und-inference/solutions/01-annotieren-oder-infern.ts
 */

// ============================================================================
// AUFGABE 1: Ueberfluessige Annotation entfernen
// LOESUNG: Alle drei Annotationen entfernen.
// WARUM: TS infert string, number, boolean aus den Werten.
//        Die Annotationen wiederholen nur, was TS schon weiss.
// ============================================================================

const username = "Matthias";         // infert: "Matthias" (Literal, weil const)
const age = 30;                       // infert: 30 (Literal, weil const)
const isActive = true;                // infert: true (Literal, weil const)

// ============================================================================
// AUFGABE 2: Fehlende Annotation hinzufuegen
// LOESUNG: string-Annotation hinzufuegen.
// WARUM: Ohne Initialwert wird die Variable als `any` infert.
//        Das ist ein haeufiger Fehler -- immer annotieren wenn kein Initialwert!
// ============================================================================

let errorMessage: string;
errorMessage = "Etwas ist schiefgelaufen";

// ============================================================================
// AUFGABE 3: Parameter annotieren
// LOESUNG: Parameter-Typen hinzufuegen.
// WARUM: Parameter koennen NIEMALS infert werden (es sei denn durch
//        Contextual Typing). Das ist die wichtigste Stelle zum Annotieren.
// ============================================================================

function calculateArea(width: number, height: number): number {
  return width * height;
}

// ============================================================================
// AUFGABE 4: Ueberfluessige Callback-Annotationen entfernen
// LOESUNG: Alle Annotationen im Callback entfernen.
// WARUM: numbers ist number[], also weiss TS, dass der Callback-Parameter
//        ein number ist (Contextual Typing). Die Return-Typen werden
//        aus den Ausdruecken infert.
// ============================================================================

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const filtered = numbers.filter(n => n > 2);

// ============================================================================
// AUFGABE 5: Return-Typ annotieren (exportierte Funktion)
// LOESUNG: `: string` als Return-Typ hinzufuegen.
// WARUM: Bei exportierten Funktionen ist ein expliziter Return-Typ
//        Best Practice. Er dient als Dokumentation und gibt bessere
//        Fehlermeldungen, wenn sich die Implementierung aendert.
// ============================================================================

export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

// ============================================================================
// AUFGABE 6: `as const` verwenden
// LOESUNG: const statt let (oder Annotation oder as const)
// WARUM: `let currentDirection = "north"` hat Typ string (Widening).
//        Die Funktion erwartet aber "north" | "south" | "east" | "west".
//        Loesung A (BEST): const statt let (einfachste Loesung)
//        Loesung B: let mit Annotation
//        Loesung C: as const
// ============================================================================

type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction): string {
  return `Bewege nach ${direction}`;
}

// Loesung A: const (bestes, wenn Neuzuweisung nicht noetig)
const currentDirection = "north";
move(currentDirection);

// Loesung B: let mit Annotation (wenn spaeter geaendert werden soll)
// let currentDirection: Direction = "north";
// move(currentDirection);

// Loesung C: as const (wenn const nicht moeglich)
// let currentDirection = "north" as const;
// move(currentDirection);  // Funktioniert, aber currentDirection bleibt let

// ============================================================================
// AUFGABE 7: Array-Typ korrigieren
// LOESUNG: string[] Annotation hinzufuegen.
// WARUM: Leere Arrays werden als any[] infert -- das ist gefaehrlich!
//        Immer den Element-Typ angeben bei leeren Arrays.
// ============================================================================

const results: string[] = [];
results.push("Erfolg");
results.push("Fehler");
// results.push(42);  // Jetzt korrekt ein Fehler!

// ============================================================================
// AUFGABE 8: Annotation unnoetig
// LOESUNG: Annotation entfernen.
// WARUM: TS infert { name: string; age: number; city: string } aus dem
//        Objekt-Literal. Die Annotation wiederholt das nur.
//        AUSNAHME: Wenn du ein Interface wiederverwendest, ist eine
//        Annotation sinnvoll fuer die Lesbarkeit.
// ============================================================================

const person = {
  name: "Matthias",
  age: 30,
  city: "Muenchen",
};

// ============================================================================
// AUFGABE 9: Union-Typ noetig
// LOESUNG: Einen Typ definieren, der beide Formen abdeckt.
// WARUM: Ohne Annotation wuerde TS nach der ersten Zuweisung den Typ
//        festlegen, und die zweite Zuweisung waere ein Fehler.
// ============================================================================

interface ApiResponse {
  data: number[] | null;
  error: string | null;
}

let response: ApiResponse;
response = { data: [1, 2, 3], error: null };
response = { data: null, error: "Netzwerkfehler" };

// ============================================================================
// AUFGABE 10: Destructuring annotieren
// LOESUNG: Typ-Annotation nach dem Destructuring-Pattern.
// WARUM: Parameter koennen nicht infert werden. Die Annotation kommt
//        nach dem gesamten Destructuring-Muster, NICHT bei den einzelnen
//        Properties (das waere Renaming-Syntax!).
// ============================================================================

function greetUser({ name, age }: { name: string; age: number }): string {
  return `${name} ist ${age} Jahre alt`;
}

// Noch besser mit Interface:
// interface UserInfo { name: string; age: number; }
// function greetUser({ name, age }: UserInfo): string { ... }

// ============================================================================
// AUFGABE 11: `as const` fuer Enum-Ableitung
// LOESUNG: `as const` an das Objekt-Literal anfuegen.
// WARUM: Ohne `as const` sind alle Property-Typen `number`.
//        Mit `as const` werden sie zu den Literal-Typen 200, 404, 500.
//        Dann ist der abgeleitete Union-Typ exakt: 200 | 404 | 500
// ============================================================================

const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  ERROR: 500,
} as const;

type StatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
// Jetzt: 200 | 404 | 500

// ============================================================================
// AUFGABE 12: Inference korrigieren
// LOESUNG: Den Fallback-Wert zu einem String aendern.
// WARUM: `data[key] || 0` hat zwei moegliche Ergebnisse: string oder number.
//        Der || 0 Fallback macht den Return-Typ zu string | number.
//        Loesung: Einen String als Fallback verwenden.
// ============================================================================

function getValue(key: string): string {
  const data: Record<string, string> = {
    name: "Matthias",
    city: "Muenchen",
  };
  return data[key] || "";  // String-Fallback statt 0
}

// ============================================================================
// AUFGABE 13: Generic Inference nutzen
// LOESUNG: Die expliziten Typ-Argumente entfernen.
// WARUM: TS kann T aus dem uebergebenen Wert infern.
//        Explizite Typ-Argumente sind nur noetig, wenn TS den Typ
//        nicht allein herausfinden kann.
// ============================================================================

function identity<T>(value: T): T {
  return value;
}

const result1 = identity("hello");   // T = string (infert)
const result2 = identity(42);         // T = number (infert)
const result3 = identity(true);       // T = boolean (infert)

// ============================================================================
// AUFGABE 14: Readonly Tuple mit as const
// LOESUNG: `as const` an das Array anfuegen.
// WARUM: [48.137, 11.576] wird als number[] infert -- ein Array mit
//        beliebig vielen Elementen. Die Funktion erwartet aber ein
//        Tuple mit genau 2 Elementen. `as const` erzeugt ein
//        readonly [48.137, 11.576] -- das ist kompatibel.
// ============================================================================

function setPosition(pos: readonly [number, number]): void {
  console.log(`Position: ${pos[0]}, ${pos[1]}`);
}

const myPosition = [48.137, 11.576] as const;
setPosition(myPosition);  // OK!

// ============================================================================
// AUFGABE 15: Best Practice anwenden
// LOESUNG: Alle internen Annotationen entfernen, nur Parameter und Return behalten.
// WARUM: "Annotate at boundaries, infer inside"
//        - Parameter (items: string[]): BEHALTEN -- ist eine Grenze
//        - Return-Typ (: string[]): BEHALTEN -- exportierte Funktion
//        - Lokale Variablen: ENTFERNEN -- TS infert korrekt
//        - Callback-Parameter: ENTFERNEN -- Contextual Typing
// ============================================================================

function processData(items: string[]): string[] {
  const upper = items.map(item => item.toUpperCase());
  const filtered = upper.filter(s => s.length > 3);
  const result = filtered.sort((a, b) => a.localeCompare(b));
  return result;
}

// ============================================================================
// RUNTIME-CHECKS
// ============================================================================

console.log("--- Runtime Checks ---");

console.assert(typeof calculateArea === "function", "Aufgabe 3: calculateArea existiert");
console.assert(calculateArea(5, 10) === 50, "Aufgabe 3: calculateArea rechnet korrekt");
console.assert(formatPrice(1999) === "19.99 EUR", "Aufgabe 5: formatPrice funktioniert");
console.assert(typeof processData === "function", "Aufgabe 15: processData existiert");
console.assert(
  JSON.stringify(processData(["ab", "hello", "typescript", "hi"])) ===
    JSON.stringify(["HELLO", "TYPESCRIPT"]),
  "Aufgabe 15: processData gibt korrekte Ergebnisse"
);
console.assert(getValue("name") === "Matthias", "Aufgabe 12: getValue funktioniert");
console.assert(getValue("unknown") === "", "Aufgabe 12: getValue Fallback funktioniert");

console.log("Alle Runtime-Checks bestanden!");
