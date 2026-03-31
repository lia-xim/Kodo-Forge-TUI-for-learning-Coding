/**
 * Lektion 10 — Completion Problems: Review Challenge
 *
 * 6 gemischte Luecken-Uebungen die ALLE Phase-1-Konzepte kombinieren.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  {
    id: "10-cp-full-stack-type",
    title: "Fullstack-Typ: API bis Frontend",
    description: "Definiere einen Typ der vom API-Response bis zum UI verwendet wird.",
    template: `// L07: Discriminated Union fuer API-Response
type ApiResponse<T> =
  | { status: "success"; data: ______ }
  | { status: "error"; ______: string };

// L08: Interface fuer das Datenmodell
______ User {
  id: string;
  name: string;
  email: string;
}

// L06: Funktion mit korrektem Return-Typ
function fetchUser(id: string): ______ {
  return { status: "success", data: { id, name: "Max", email: "max@test.de" } };
}

// L07: Narrowing auf den Response
const response = fetchUser("123");
if (response.______ === "success") {
  console.log(response.data.name);
}`,
    solution: `type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

interface User {
  id: string;
  name: string;
  email: string;
}

function fetchUser(id: string): ApiResponse<User> {
  return { status: "success", data: { id, name: "Max", email: "max@test.de" } };
}

const response = fetchUser("123");
if (response.status === "success") {
  console.log(response.data.name);
}`,
    blanks: [
      { placeholder: "______", answer: "T", hint: "L07: Generischer Typ-Parameter fuer die Daten (L03 Generics)." },
      { placeholder: "______", answer: "error", hint: "L07: Welche Property enthaelt die Fehlermeldung?" },
      { placeholder: "______", answer: "interface", hint: "L08: Welches Keyword fuer ein Datenmodell?" },
      { placeholder: "______", answer: "ApiResponse<User>", hint: "L06: Return-Typ mit dem generischen Response-Typ." },
      { placeholder: "______", answer: "status", hint: "L07: Auf welche Tag-Property wird geprueft?" },
    ],
    concept: "Integration: L06 Functions + L07 Union + L08 Interface",
  },

  {
    id: "10-cp-config-as-const",
    title: "Typsichere Konfiguration",
    description: "Erstelle eine Konfiguration mit as const und satisfies.",
    template: `// L09: as const fuer Literal Types
const config = {
  env: "production",
  port: 3000,
  features: ["auth", "logging"],
} ______;

// L03: Typ ableiten
type Config = ______ config;

// L09: Union aus Array ableiten
type Feature = typeof config.features[______];
// "auth" | "logging"

// L06: Funktion mit praezisem Parameter
function hasFeature(f: ______): boolean {
  return config.features.includes(f);
}`,
    solution: `const config = {
  env: "production",
  port: 3000,
  features: ["auth", "logging"],
} as const;

type Config = typeof config;

type Feature = typeof config.features[number];

function hasFeature(f: Feature): boolean {
  return config.features.includes(f);
}`,
    blanks: [
      { placeholder: "______", answer: "as const", hint: "L09: Welche Assertion behaelt Literal Types?" },
      { placeholder: "______", answer: "typeof", hint: "L03: Welches Keyword extrahiert den Typ einer Variable?" },
      { placeholder: "______", answer: "number", hint: "L09: Welcher Index-Typ greift auf alle Array-Elemente zu?" },
      { placeholder: "______", answer: "Feature", hint: "L06: Verwende den abgeleiteten Feature-Typ." },
    ],
    concept: "Integration: L03 Inference + L06 Functions + L09 as const",
  },

  {
    id: "10-cp-state-machine",
    title: "State Machine mit Discriminated Union",
    description: "Erstelle eine State Machine fuer einen Bestellprozess.",
    template: `// L07: Discriminated Union
type OrderState =
  ______ { status: "pending"; items: string[] }
  | { status: "paid"; items: string[]; paymentId: string }
  | { status: "shipped"; items: string[]; paymentId: string; trackingId: string };

// L06: Funktion mit Exhaustive Check
function getOrderInfo(order: OrderState): string {
  switch (order.______) {
    case "pending": return \`Bestellung: \${order.items.length} Artikel\`;
    case "paid": return \`Bezahlt: \${order.paymentId}\`;
    case "shipped": return \`Versendet: \${order.trackingId}\`;
    default:
      const _: ______ = order;
      return _;
  }
}`,
    solution: `type OrderState =
  | { status: "pending"; items: string[] }
  | { status: "paid"; items: string[]; paymentId: string }
  | { status: "shipped"; items: string[]; paymentId: string; trackingId: string };

function getOrderInfo(order: OrderState): string {
  switch (order.status) {
    case "pending": return \`Bestellung: \${order.items.length} Artikel\`;
    case "paid": return \`Bezahlt: \${order.paymentId}\`;
    case "shipped": return \`Versendet: \${order.trackingId}\`;
    default:
      const _: never = order;
      return _;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "|", hint: "L07: Welcher Operator beginnt ein Union-Mitglied?" },
      { placeholder: "______", answer: "status", hint: "L07: Die gemeinsame Tag-Property." },
      { placeholder: "______", answer: "never", hint: "L07: Exhaustive Check mit welchem Typ?" },
    ],
    concept: "Integration: L07 Discriminated Union + L06 Exhaustive Check",
  },

  {
    id: "10-cp-type-guard-validation",
    title: "Validierung mit Type Guard",
    description: "Kombiniere Type Guard, Interface und Assertion Function.",
    template: `// L05/L08: Interface
interface Product {
  name: string;
  price: number;
  category: string;
}

// L06: Type Guard
function isProduct(data: ______): data ______ Product {
  return (
    typeof data === "object" &&
    data !== ______ &&
    "name" in data &&
    "price" in data &&
    "category" in data
  );
}

// L06: Assertion Function
function assertProduct(data: unknown): ______ data is Product {
  if (!isProduct(data)) throw new Error("Invalid product");
}`,
    solution: `interface Product {
  name: string;
  price: number;
  category: string;
}

function isProduct(data: unknown): data is Product {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "price" in data &&
    "category" in data
  );
}

function assertProduct(data: unknown): asserts data is Product {
  if (!isProduct(data)) throw new Error("Invalid product");
}`,
    blanks: [
      { placeholder: "______", answer: "unknown", hint: "L02: Typsicherer Typ fuer 'akzeptiert alles'." },
      { placeholder: "______", answer: "is", hint: "L06: Type Guard Syntax: 'data ___ Product'." },
      { placeholder: "______", answer: "null", hint: "L02: typeof null === 'object' — muss extra geprueft werden." },
      { placeholder: "______", answer: "asserts", hint: "L06: Assertion Function Keyword." },
    ],
    concept: "Integration: L02 unknown + L06 Type Guard + Assertion",
  },

  {
    id: "10-cp-event-types",
    title: "Event-System mit Template Literals",
    description: "Kombiniere Template Literal Types mit Discriminated Unions.",
    template: `// L09: Template Literal Type
type EventName = "click" | "scroll" | "focus";
type HandlerName = \`on\${______<EventName>}\`;
// "onClick" | "onScroll" | "onFocus"

// L07: Discriminated Union fuer Events
type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; offset: number }
  | { type: "focus"; element: string };

// L08: Interface mit Mapped Type
______ EventHandlers = {
  [K in HandlerName]______: () => void;
};`,
    solution: `type EventName = "click" | "scroll" | "focus";
type HandlerName = \`on\${Capitalize<EventName>}\`;

type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; offset: number }
  | { type: "focus"; element: string };

type EventHandlers = {
  [K in HandlerName]?: () => void;
};`,
    blanks: [
      { placeholder: "______", answer: "Capitalize", hint: "L09: Welcher Utility Type macht den ersten Buchstaben gross?" },
      { placeholder: "______", answer: "type", hint: "L08: Mapped Types gehen nur mit welchem Keyword?" },
      { placeholder: "______", answer: "?", hint: "L05: Optionale Properties markieren mit...?" },
    ],
    concept: "Integration: L09 Template Literal + L07 Union + L08 Mapped Type",
  },

  {
    id: "10-cp-generic-factory",
    title: "Generische Factory Function",
    description: "Kombiniere Generics, Overloads und Currying.",
    template: `// L08/L05: Interface-Hierarchie
interface BaseEntity { id: string; createdAt: Date; }
interface User ______ BaseEntity { name: string; email: string; }

// L06: Generische Factory mit Currying
function createEntityFactory<T ______ BaseEntity>(
  defaults: Omit<T, "id" | "createdAt">
): (id: string) ______ T {
  return (id) => ({
    ...defaults,
    id,
    createdAt: new Date(),
  }) as T;
}

const createUser = createEntityFactory<User>({ name: "Default", email: "default@test.de" });
const user = createUser("user-1");`,
    solution: `interface BaseEntity { id: string; createdAt: Date; }
interface User extends BaseEntity { name: string; email: string; }

function createEntityFactory<T extends BaseEntity>(
  defaults: Omit<T, "id" | "createdAt">
): (id: string) => T {
  return (id) => ({
    ...defaults,
    id,
    createdAt: new Date(),
  }) as T;
}

const createUser = createEntityFactory<User>({ name: "Default", email: "default@test.de" });
const user = createUser("user-1");`,
    blanks: [
      { placeholder: "______", answer: "extends", hint: "L08: Interface-Vererbung mit welchem Keyword?" },
      { placeholder: "______", answer: "extends", hint: "L03: Generic Constraint: T ___ BaseEntity." },
      { placeholder: "______", answer: "=>", hint: "L06: Return-Typ einer Currying-Funktion: (...) => T." },
    ],
    concept: "Integration: L08 extends + L03 Generics + L06 Currying",
  },
];
