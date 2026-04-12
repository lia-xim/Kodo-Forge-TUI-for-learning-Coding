/**
 * Lektion 09 - Exercise 04: Template Literal Types
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-template-literal-types.ts
 *
 * 4 Aufgaben zu Template Literal Types und String-Manipulation.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Event-Handler-Typen
// ═══════════════════════════════════════════════════════════════════════════

type DomEvent = "click" | "focus" | "blur" | "submit" | "change";

// TODO: Erstelle einen Typ "EventHandlerName" der alle Handler-Namen
// generiert: "onClick", "onFocus", "onBlur", "onSubmit", "onChange"
// type EventHandlerName = ...

// TODO: Erstelle einen Typ "EventHandlerMap" der ein Objekt beschreibt
// mit allen Handler-Namen als Keys und (event: Event) => void als Values
// type EventHandlerMap = { [key in EventHandlerName]: (event: Event) => void }
// Oder nutze Record<...>

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: CSS-Klassen-Generator
// ═══════════════════════════════════════════════════════════════════════════

type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";
type ComponentVariant = "primary" | "secondary" | "outline" | "ghost";
type ComponentState = "default" | "hover" | "active" | "disabled";

// TODO: Erstelle einen Typ "ButtonClass" der alle moeglichen
// Button-Klassen generiert: "btn-primary-sm", "btn-ghost-xl", etc.
// type ButtonClass = ...

// TODO: Erstelle einen Typ "StateClass" der Zustandsklassen generiert:
// "btn--hover", "btn--active", "btn--disabled" (ohne "default")
// Hinweis: Nutze Exclude<ComponentState, "default">
// type StateClass = ...

// TODO: Erstelle eine Funktion "getButtonClasses" die die passenden
// CSS-Klassen zurueckgibt
// function getButtonClasses(
//   variant: ComponentVariant,
//   size: ComponentSize,
//   state?: ComponentState
// ): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Getter/Setter Generator
// ═══════════════════════════════════════════════════════════════════════════

interface UserProfile {
  name: string;
  email: string;
  age: number;
  active: boolean;
}

// TODO: Erstelle einen Typ "Getters" der fuer jede Property einen
// Getter generiert: getName, getEmail, getAge, getActive
// Hinweis: Nutze Mapped Types mit Key Remapping (as)
// type Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] }

// TODO: Erstelle einen Typ "Setters" analog
// type Setters<T> = ...

// TODO: Erstelle einen Typ "Observable" der on-Handler generiert:
// onNameChange, onEmailChange, onAgeChange, onActiveChange
// type Observable<T> = { [K in keyof T as `on${Capitalize<K & string>}Change`]: (newValue: T[K]) => void }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Typsichere Pfade
// ═══════════════════════════════════════════════════════════════════════════

type Lang = "de" | "en" | "fr";
type Page = "home" | "about" | "products" | "contact";

// TODO: Erstelle einen Typ "LocalizedRoute" der alle lokalisierten
// Pfade generiert: "/de/home", "/en/about", "/fr/products", etc.
// type LocalizedRoute = ...

// TODO: Erstelle eine Funktion "createRoute" die eine Sprache und
// eine Seite nimmt und den Pfad zurueckgibt
// function createRoute(lang: Lang, page: Page): LocalizedRoute { ... }

// TODO: Erstelle einen Typ "ApiEndpoint" fuer REST-Endpunkte:
// "/api/v1/users", "/api/v1/posts", "/api/v1/comments",
// "/api/v2/users", "/api/v2/posts", "/api/v2/comments"
type ApiVersion = "v1" | "v2";
type Resource = "users" | "posts" | "comments";
// type ApiEndpoint = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// const handlers: Partial<EventHandlerMap> = {
//   onClick: () => console.log("clicked"),
// };

// console.log(getButtonClasses("primary", "md"));
// // "btn-primary-md"
// console.log(getButtonClasses("ghost", "sm", "hover"));
// // "btn-ghost-sm btn--hover"

// type UserGetters = Getters<UserProfile>;
// // { getName: () => string; getEmail: () => string; getAge: () => number; getActive: () => boolean }

// console.log(createRoute("de", "home"));  // "/de/home"
// console.log(createRoute("en", "about")); // "/en/about"

console.log("Exercise 04 geladen. Ersetze die TODOs!");
