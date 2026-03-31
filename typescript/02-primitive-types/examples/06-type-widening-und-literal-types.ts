/**
 * Lektion 02 - Example 06: Type Widening und Literal Types
 *
 * Ausfuehren mit: npx tsx examples/06-type-widening-und-literal-types.ts
 *
 * Dieses Beispiel zeigt eines der subtilsten und wichtigsten Konzepte
 * in TypeScript: Wie der Compiler entscheidet, ob ein Typ eng (literal)
 * oder breit (allgemein) sein soll — und warum das praktisch relevant ist.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 1: const vs let — die fundamentale Unterscheidung
// ═══════════════════════════════════════════════════════════════════════════

console.log("=== TEIL 1: const vs let ===\n");

// const: Der Wert kann sich NICHT aendern → TypeScript waehlt den engsten Typ
const nachricht = "Hallo Welt";
//    ^? const nachricht: "Hallo Welt"   ← Literal Type!

// let: Der Wert KANN sich aendern → TypeScript waehlt den breiteren Typ
let veraenderbar = "Hallo Welt";
//  ^? let veraenderbar: string          ← breiter Typ!

// Das gleiche gilt fuer alle Primitives:
const zahl = 42;          // Typ: 42 (Literal Type)
let zahlVar = 42;         // Typ: number

const wahrheit = true;    // Typ: true (Literal Type)
let wahrheitVar = true;   // Typ: boolean

console.log(`const "Hallo Welt" → Typ ist exakt "Hallo Welt" (Literal)`);
console.log(`let "Hallo Welt"   → Typ ist breit "string"`);
console.log(`const 42           → Typ ist exakt 42`);
console.log(`let 42             → Typ ist breit number`);

// WARUM macht TypeScript das?
// Weil const sich GARANTIERT nicht aendert, kann TS den exakten Wert als Typ nehmen.
// Bei let koennte spaeter jeder andere string zugewiesen werden,
// also muss der Typ breit genug sein.

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 2: Warum das in der Praxis wichtig ist
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 2: Praxis-Relevanz ===\n");

// Stell dir eine Funktion vor, die nur bestimmte Werte akzeptiert:
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function sendRequest(method: HttpMethod, url: string): void {
  console.log(`${method} ${url}`);
}

// Mit const — funktioniert!
const methode = "GET";
sendRequest(methode, "/api/users");  // OK! "GET" passt in HttpMethod

// Mit let — Problem!
let methode2 = "GET";
// sendRequest(methode2, "/api/users");  // Error! string ist nicht HttpMethod
// TypeScript denkt: methode2 koennte ja spaeter "PATCH" sein, und das ist nicht in HttpMethod.

// Loesung: Explizit als Literal Type deklarieren
let methode3: "GET" = "GET";
sendRequest(methode3, "/api/users");  // OK!

console.log("const 'GET' → Typ 'GET' → passt in HttpMethod");
console.log("let 'GET'   → Typ string → passt NICHT in HttpMethod");

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 3: Type Widening bei Objekten — die Falle
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 3: Objekte und Type Widening ===\n");

// ACHTUNG: Bei Objekten werden Properties IMMER gewidened,
// auch wenn das Objekt selbst const ist!

const request = {
  method: "GET",      // Typ: string (nicht "GET"!)
  url: "/api/users",  // Typ: string (nicht "/api/users"!)
};

// WARUM? Weil Object-Properties veraenderbar sind:
// request.method = "POST";  // JavaScript wuerde das erlauben
// TypeScript muss also den breiteren Typ nehmen.

// Das fuehrt zu Fehlern:
// sendRequest(request.method, request.url);
// Error! Argument of type 'string' is not assignable to parameter of type 'HttpMethod'

console.log("const obj = { method: 'GET' } → method ist Typ 'string' (nicht 'GET')");
console.log("Weil Object-Properties veraenderbar sind, auch bei const!");

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 4: as const — der Literal-Erzwinger
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 4: as const ===\n");

// Loesung 1: "as const" auf einzelnen Properties
const request2 = {
  method: "GET" as const,  // Typ: "GET" (Literal!)
  url: "/api/users",       // Typ: string (breit)
};
sendRequest(request2.method, request2.url);  // OK! method ist "GET"

// Loesung 2: "as const" auf dem gesamten Objekt
const request3 = {
  method: "GET",
  url: "/api/users",
} as const;
// Typ ist jetzt: { readonly method: "GET"; readonly url: "/api/users" }
sendRequest(request3.method, request3.url);  // OK!

// as const macht DREI Dinge:
// 1. Alle Properties werden readonly
// 2. Alle Werte werden zu Literal Types
// 3. Arrays werden zu readonly Tuples

console.log("as const auf Property: nur dieses Property wird literal");
console.log("as const auf Objekt:   ALLES wird literal + readonly");

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 5: as const mit Arrays
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 5: as const mit Arrays ===\n");

// Ohne as const:
const farben = ["rot", "gruen", "blau"];
// Typ: string[] — TypeScript denkt, es koennte sich aendern

// Mit as const:
const farben2 = ["rot", "gruen", "blau"] as const;
// Typ: readonly ["rot", "gruen", "blau"]
// - Laenge ist fest (3, nicht number)
// - Werte sind Literal Types ("rot", nicht string)
// - Array ist readonly (kein push, pop, usw.)

// Das ist extrem nuetzlich fuer Enums aus Arrays:
const STATUSWERTE = ["aktiv", "inaktiv", "gesperrt"] as const;
type Status = typeof STATUSWERTE[number];
// Status ist: "aktiv" | "inaktiv" | "gesperrt"

function setStatus(status: Status): void {
  console.log(`Status gesetzt: ${status}`);
}
setStatus("aktiv");     // OK!
// setStatus("geloescht"); // Error! Nicht in der Liste

// WARUM ist das besser als ein enum?
// 1. Es ist ein normales Array — du kannst damit iterieren
// 2. Es funktioniert als Laufzeit-WERT und als Compilezeit-TYP
// 3. Kein zusaetzliches JavaScript wird generiert

console.log(`Statuswerte: ${STATUSWERTE.join(", ")}`);
console.log("typeof STATUSWERTE[number] ergibt den Union Type");

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 6: Literal Types in der Praxis — Angular & React
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== TEIL 6: Praxisbeispiele ===\n");

// React-Kontext: Button-Varianten
type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  label: string;
  disabled?: boolean;
}

function renderButton(props: ButtonProps): string {
  return `<button class="${props.variant} ${props.size}">${props.label}</button>`;
}

// Type Widening Falle bei React-Props:
const buttonConfig = {
  variant: "primary",  // string, nicht "primary"!
  size: "md",          // string, nicht "md"!
  label: "Klick mich",
};
// renderButton(buttonConfig);  // Error! string ist nicht ButtonVariant

// Loesung: as const oder explizite Typ-Annotation
const buttonConfig2 = {
  variant: "primary" as const,
  size: "md" as const,
  label: "Klick mich",
};
console.log(renderButton(buttonConfig2));  // OK!

// Noch besser: Explizite Typ-Annotation
const buttonConfig3: ButtonProps = {
  variant: "primary",
  size: "md",
  label: "Klick mich",
};
console.log(renderButton(buttonConfig3));  // OK!

// Angular-Kontext: ChangeDetection
type ChangeDetectionStrategy = "Default" | "OnPush";

interface ComponentConfig {
  selector: string;
  changeDetection: ChangeDetectionStrategy;
}

const config: ComponentConfig = {
  selector: "app-root",
  changeDetection: "OnPush",  // OK weil Typ-Annotation vorhanden
};

console.log(`Angular Component: ${config.selector}, CD: ${config.changeDetection}`);

// ═══════════════════════════════════════════════════════════════════════════
// TEIL 7: Zusammenfassung — Wann welche Strategie?
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n=== ZUSAMMENFASSUNG ===\n");

console.log("Strategie 1: Explizite Typ-Annotation");
console.log("  const x: HttpMethod = 'GET'");
console.log("  → Am klarsten, aber mehr Schreibarbeit\n");

console.log("Strategie 2: as const auf dem Wert");
console.log("  const x = 'GET' as const");
console.log("  → Kurz und praegnant fuer einzelne Werte\n");

console.log("Strategie 3: as const auf dem Objekt");
console.log("  const x = { method: 'GET' } as const");
console.log("  → Macht ALLES literal + readonly\n");

console.log("Strategie 4: satisfies (fortgeschritten, kommt spaeter)");
console.log("  const x = { method: 'GET' } satisfies RequestConfig");
console.log("  → Prueft den Typ, behaelt aber die Literal Types\n");

/*
  Entscheidungsbaum:

  Brauchst du Literal Types?
  ├── Nein → Normales const/let reicht
  └── Ja
      ├── Fuer einen einzelnen Wert → as const
      ├── Fuer ein Objekt mit festen Werten → as const auf Objekt
      └── Fuer ein Objekt das einem Interface entsprechen muss
          → Explizite Typ-Annotation: const x: MyType = { ... }
*/

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
