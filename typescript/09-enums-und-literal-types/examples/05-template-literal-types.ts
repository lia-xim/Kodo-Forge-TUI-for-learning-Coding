/**
 * Lektion 09 - Example 05: Template Literal Types
 *
 * Ausfuehren mit: npx tsx examples/05-template-literal-types.ts
 *
 * String-Manipulation auf Type-Level — eines der maechtigsten
 * Features in TypeScript.
 */

// ─── GRUNDLAGEN ─────────────────────────────────────────────────────────────

type World = "world";
type Greeting = `hello ${World}`;
// ^ "hello world"

// Mit Union Types: Alle Kombinationen
type Color = "red" | "green" | "blue";
type Shade = "light" | "dark";

type ColorVariant = `${Shade}-${Color}`;
// ^ "light-red" | "light-green" | "light-blue"
//   | "dark-red" | "dark-green" | "dark-blue"

const variant: ColorVariant = "dark-blue";
console.log(`Color variant: ${variant}`);

// ─── STRING-MANIPULATION TYPES ──────────────────────────────────────────────

type Events = "click" | "scroll" | "mousemove";

type UpperEvents = Uppercase<Events>;
// ^ "CLICK" | "SCROLL" | "MOUSEMOVE"

type CapEvents = Capitalize<Events>;
// ^ "Click" | "Scroll" | "Mousemove"

type HandlerNames = `on${Capitalize<Events>}`;
// ^ "onClick" | "onScroll" | "onMousemove"

console.log("\n--- String-Manipulation Types ---");
// Zur Laufzeit koennen wir das demonstrieren:
const events: Events[] = ["click", "scroll", "mousemove"];
const handlers = events.map(e => `on${e.charAt(0).toUpperCase()}${e.slice(1)}`);
console.log("Handler-Namen:", handlers);

// ─── EVENT SYSTEM ───────────────────────────────────────────────────────────

type EventMap = {
  click: { x: number; y: number; button: number };
  scroll: { offset: number; direction: "up" | "down" };
  keypress: { key: string; code: number };
  resize: { width: number; height: number };
};

// Handler-Typ aus EventMap ableiten:
type EventHandler<T extends keyof EventMap> = (event: EventMap[T]) => void;

// on-Methode mit praezisem Typ:
function on<T extends keyof EventMap>(
  event: T,
  handler: EventHandler<T>
): void {
  console.log(`Registered handler for: ${event}`);
  // In echt: addEventListener etc.
}

// Die IDE schlaegt den richtigen Event-Typ vor!
on("click", (e) => {
  console.log(`Clicked at ${e.x}, ${e.y}`);
  // ^ e hat Typ { x: number; y: number; button: number }
});

on("resize", (e) => {
  console.log(`Resized to ${e.width}x${e.height}`);
  // ^ e hat Typ { width: number; height: number }
});

// ─── CSS-WERTE ──────────────────────────────────────────────────────────────

type CSSUnit = "px" | "em" | "rem" | "%" | "vh" | "vw";
type CSSNumericValue = `${number}${CSSUnit}`;
type CSSColor = "red" | "blue" | "green" | "transparent" | "inherit";
type CSSValue = CSSNumericValue | CSSColor | "auto" | "none";

function setStyle(property: string, value: CSSValue) {
  console.log(`  ${property}: ${value}`);
}

console.log("\n--- CSS-Werte ---");
setStyle("width", "100px");
setStyle("margin", "1.5rem");
setStyle("color", "red");
setStyle("height", "50vh");
setStyle("display", "none");
// setStyle("width", "100pt");  // Error! "pt" ist kein CSSUnit

// ─── API-ROUTEN ─────────────────────────────────────────────────────────────

type Entity = "user" | "post" | "comment";
type ApiRoute = `/api/${Entity}` | `/api/${Entity}/${string}`;

function fetchApi(route: ApiRoute): void {
  console.log(`Fetching: ${route}`);
}

console.log("\n--- API-Routen ---");
fetchApi("/api/user");
fetchApi("/api/post/abc-123");
fetchApi("/api/comment/42");
// fetchApi("/api/unknown");  // Error! "unknown" ist kein Entity

// ─── KOMBINATORIK ───────────────────────────────────────────────────────────

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "secondary" | "danger";
type ButtonClass = `btn-${Variant}-${Size}`;
// ^ 3 x 4 = 12 gueltige Klassen

function applyClass(className: ButtonClass) {
  console.log(`  Applied: ${className}`);
}

console.log("\n--- Kombinatorik (12 Klassen) ---");
applyClass("btn-primary-sm");
applyClass("btn-danger-xl");
applyClass("btn-secondary-md");
// applyClass("btn-primary-xxl");  // Error! "xxl" ist kein Size

// ─── PATTERN MATCHING ───────────────────────────────────────────────────────

type EventName = `on${string}`;

function isEventHandler(key: string): key is EventName {
  return key.startsWith("on") && key.length > 2;
}

console.log("\n--- Pattern Matching ---");
const keys = ["onClick", "onScroll", "data", "onResize", "className"];
for (const key of keys) {
  if (isEventHandler(key)) {
    console.log(`  Event handler found: ${key}`);
  }
}

// ─── GETTER/SETTER PATTERN ──────────────────────────────────────────────────

type PropName = "name" | "age" | "email";
type Getter = `get${Capitalize<PropName>}`;
type Setter = `set${Capitalize<PropName>}`;
// Getter: "getName" | "getAge" | "getEmail"
// Setter: "setName" | "setAge" | "setEmail"

console.log("\n--- Getter/Setter ---");
console.log("Getter-Namen:", ["getName", "getAge", "getEmail"]);
console.log("Setter-Namen:", ["setName", "setAge", "setEmail"]);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
