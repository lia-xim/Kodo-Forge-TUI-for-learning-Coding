/**
 * Lesson 10 — Completion Problems: Review Challenge
 *
 * 6 mixed fill-in-the-blank exercises combining ALL Phase 1 concepts.
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
    title: "Full Stack Type: API to Frontend",
    description: "Define a type that is used from the API response all the way to the UI.",
    template: `// L07: Discriminated Union for API Response
type ApiResponse<T> =
  | { status: "success"; data: ______ }
  | { status: "error"; ______: string };

// L08: Interface for the data model
______ User {
  id: string;
  name: string;
  email: string;
}

// L06: Function with correct return type
function fetchUser(id: string): ______ {
  return { status: "success", data: { id, name: "Max", email: "max@test.de" } };
}

// L07: Narrowing on the response
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
      { placeholder: "______", answer: "T", hint: "L07: Generic type parameter for the data (L03 Generics)." },
      { placeholder: "______", answer: "error", hint: "L07: Which property contains the error message?" },
      { placeholder: "______", answer: "interface", hint: "L08: Which keyword for a data model?" },
      { placeholder: "______", answer: "ApiResponse<User>", hint: "L06: Return type with the generic response type." },
      { placeholder: "______", answer: "status", hint: "L07: Which tag property is being checked?" },
    ],
    concept: "Integration: L06 Functions + L07 Union + L08 Interface",
  },

  {
    id: "10-cp-config-as-const",
    title: "Type-Safe Configuration",
    description: "Create a configuration with as const and satisfies.",
    template: `// L09: as const for Literal Types
const config = {
  env: "production",
  port: 3000,
  features: ["auth", "logging"],
} ______;

// L03: Infer type
type Config = ______ config;

// L09: Derive union from array
type Feature = typeof config.features[______];
// "auth" | "logging"

// L06: Function with precise parameter
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
      { placeholder: "______", answer: "as const", hint: "L09: Which assertion preserves Literal Types?" },
      { placeholder: "______", answer: "typeof", hint: "L03: Which keyword extracts the type of a variable?" },
      { placeholder: "______", answer: "number", hint: "L09: Which index type accesses all array elements?" },
      { placeholder: "______", answer: "Feature", hint: "L06: Use the derived Feature type." },
    ],
    concept: "Integration: L03 Inference + L06 Functions + L09 as const",
  },

  {
    id: "10-cp-state-machine",
    title: "State Machine with Discriminated Union",
    description: "Create a state machine for an order process.",
    template: `// L07: Discriminated Union
type OrderState =
  ______ { status: "pending"; items: string[] }
  | { status: "paid"; items: string[]; paymentId: string }
  | { status: "shipped"; items: string[]; paymentId: string; trackingId: string };

// L06: Function with Exhaustive Check
function getOrderInfo(order: OrderState): string {
  switch (order.______) {
    case "pending": return \`Order: \${order.items.length} items\`;
    case "paid": return \`Paid: \${order.paymentId}\`;
    case "shipped": return \`Shipped: \${order.trackingId}\`;
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
    case "pending": return \`Order: \${order.items.length} items\`;
    case "paid": return \`Paid: \${order.paymentId}\`;
    case "shipped": return \`Shipped: \${order.trackingId}\`;
    default:
      const _: never = order;
      return _;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "|", hint: "L07: Which operator starts a union member?" },
      { placeholder: "______", answer: "status", hint: "L07: The shared tag property." },
      { placeholder: "______", answer: "never", hint: "L07: Exhaustive check with which type?" },
    ],
    concept: "Integration: L07 Discriminated Union + L06 Exhaustive Check",
  },

  {
    id: "10-cp-type-guard-validation",
    title: "Validation with Type Guard",
    description: "Combine Type Guard, Interface, and Assertion Function.",
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
      { placeholder: "______", answer: "unknown", hint: "L02: Type-safe type for 'accepts anything'." },
      { placeholder: "______", answer: "is", hint: "L06: Type Guard syntax: 'data ___ Product'." },
      { placeholder: "______", answer: "null", hint: "L02: typeof null === 'object' — must be checked separately." },
      { placeholder: "______", answer: "asserts", hint: "L06: Assertion Function keyword." },
    ],
    concept: "Integration: L02 unknown + L06 Type Guard + Assertion",
  },

  {
    id: "10-cp-event-types",
    title: "Event System with Template Literals",
    description: "Combine Template Literal Types with Discriminated Unions.",
    template: `// L09: Template Literal Type
type EventName = "click" | "scroll" | "focus";
type HandlerName = \`on\${______<EventName>}\`;
// "onClick" | "onScroll" | "onFocus"

// L07: Discriminated Union for Events
type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; offset: number }
  | { type: "focus"; element: string };

// L08: Interface with Mapped Type
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
      { placeholder: "______", answer: "Capitalize", hint: "L09: Which Utility Type capitalizes the first letter?" },
      { placeholder: "______", answer: "type", hint: "L08: Mapped Types only work with which keyword?" },
      { placeholder: "______", answer: "?", hint: "L05: Mark optional properties with...?" },
    ],
    concept: "Integration: L09 Template Literal + L07 Union + L08 Mapped Type",
  },

  {
    id: "10-cp-generic-factory",
    title: "Generic Factory Function",
    description: "Combine Generics, Overloads, and Currying.",
    template: `// L08/L05: Interface Hierarchy
interface BaseEntity { id: string; createdAt: Date; }
interface User ______ BaseEntity { name: string; email: string; }

// L06: Generic Factory with Currying
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
      { placeholder: "______", answer: "extends", hint: "L08: Interface inheritance with which keyword?" },
      { placeholder: "______", answer: "extends", hint: "L03: Generic Constraint: T ___ BaseEntity." },
      { placeholder: "______", answer: "=>", hint: "L06: Return type of a currying function: (...) => T." },
    ],
    concept: "Integration: L08 extends + L03 Generics + L06 Currying",
  },
];