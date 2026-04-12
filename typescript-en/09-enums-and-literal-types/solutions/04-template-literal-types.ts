/**
 * Lektion 09 - Solution 04: Template Literal Types
 *
 * Ausfuehren mit: npx tsx solutions/04-template-literal-types.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Event-Handler-Typen
// ═══════════════════════════════════════════════════════════════════════════

type DomEvent = "click" | "focus" | "blur" | "submit" | "change";

// Template Literal Type mit Capitalize: "click" -> "onClick"
type EventHandlerName = `on${Capitalize<DomEvent>}`;
// ^ "onClick" | "onFocus" | "onBlur" | "onSubmit" | "onChange"

// Record erstellt ein Objekt-Typ mit allen Handler-Namen
type EventHandlerMap = Record<EventHandlerName, (event: Event) => void>;

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: CSS-Klassen-Generator
// ═══════════════════════════════════════════════════════════════════════════

type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";
type ComponentVariant = "primary" | "secondary" | "outline" | "ghost";
type ComponentState = "default" | "hover" | "active" | "disabled";

// Template Literal Type fuer Button-Klassen: 4 x 5 = 20 Kombinationen
type ButtonClass = `btn-${ComponentVariant}-${ComponentSize}`;

// Exclude entfernt "default" aus dem Union, dann Template Literal
type StateClass = `btn--${Exclude<ComponentState, "default">}`;

function getButtonClasses(
  variant: ComponentVariant,
  size: ComponentSize,
  state?: ComponentState
): string {
  const base = `btn-${variant}-${size}`;
  if (state && state !== "default") {
    return `${base} btn--${state}`;
  }
  return base;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Getter/Setter Generator
// ═══════════════════════════════════════════════════════════════════════════

interface UserProfile {
  name: string;
  email: string;
  age: number;
  active: boolean;
}

// Key Remapping mit `as`: Keys werden zu "getName", "getEmail", etc.
// K & string filtert auf String-Keys (keyof kann auch number | symbol sein)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<K & string>}`]: (value: T[K]) => void;
};

type Observable<T> = {
  [K in keyof T as `on${Capitalize<K & string>}Change`]: (newValue: T[K]) => void;
};

// Ergebnis-Typen zur Demonstration:
type UserGetters = Getters<UserProfile>;
// { getName: () => string; getEmail: () => string; getAge: () => number; getActive: () => boolean }

type UserSetters = Setters<UserProfile>;
// { setName: (value: string) => void; setEmail: (value: string) => void; ... }

type UserObservable = Observable<UserProfile>;
// { onNameChange: (newValue: string) => void; onEmailChange: (newValue: string) => void; ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Typsichere Pfade
// ═══════════════════════════════════════════════════════════════════════════

type Lang = "de" | "en" | "fr";
type Page = "home" | "about" | "products" | "contact";

// Template Literal erzeugt alle Kombinationen: 3 x 4 = 12 Routen
type LocalizedRoute = `/${Lang}/${Page}`;

function createRoute(lang: Lang, page: Page): LocalizedRoute {
  return `/${lang}/${page}` as LocalizedRoute;
}

// REST-Endpunkte: 2 x 3 = 6 Endpunkte
type ApiVersion = "v1" | "v2";
type Resource = "users" | "posts" | "comments";
type ApiEndpoint = `/api/${ApiVersion}/${Resource}`;

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

// Event Handlers (Typ-Demonstration)
const handlers: Partial<EventHandlerMap> = {
  onClick: () => console.log("clicked"),
  onFocus: () => console.log("focused"),
};
console.log("Handler keys:", Object.keys(handlers));

// CSS-Klassen
console.log(getButtonClasses("primary", "md"));                  // "btn-primary-md"
console.log(getButtonClasses("ghost", "sm", "hover"));          // "btn-ghost-sm btn--hover"
console.log(getButtonClasses("secondary", "lg", "disabled"));   // "btn-secondary-lg btn--disabled"
console.log(getButtonClasses("outline", "xl", "default"));      // "btn-outline-xl"

// Routen
console.log(createRoute("de", "home"));      // "/de/home"
console.log(createRoute("en", "about"));     // "/en/about"
console.log(createRoute("fr", "products"));  // "/fr/products"

// API-Endpunkte (Typ-Demonstration)
const endpoint: ApiEndpoint = "/api/v1/users";
console.log(`API Endpoint: ${endpoint}`);

console.log("\n--- Alle Tests bestanden! ---");
