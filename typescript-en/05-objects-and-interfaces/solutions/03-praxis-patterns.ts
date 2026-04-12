/**
 * Lektion 05 - Loesung 03: Praxis-Patterns Challenge
 *
 * Vollstaendige Loesungen mit ausfuehrlichen Erklaerungen.
 *
 * Ausfuehren: npx tsx solutions/03-praxis-patterns.ts
 */

import type { Expect, Equal } from "../../tools/type-test.ts";

// ─── Aufgabe 1: Intersection Types ──────────────────────────────────────
//
// Erklaerung: Intersection (&) kombiniert Typen -- das Ergebnis muss ALLE
// Properties aus ALLEN beteiligten Typen haben. Das ist wie "UND":
// Identifiable UND Timestamped UND die eigenen Properties.
//
// Der Vorteil gegenueber extends: Die Basis-Typen sind WIEDERVERWENDBAR.
// Du kannst Identifiable mit Timestamped kombinieren, oder mit SoftDeletable,
// oder mit beiden -- beliebige Kombination.

type Identifiable = {
  id: string;
};

type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type SoftDeletable = {
  deletedAt: Date | null;
  isDeleted: boolean;
};

type BlogPost = Identifiable & Timestamped & {
  title: string;
  content: string;
  author: string;
};

type ArchivablePost = BlogPost & SoftDeletable;

const post: ArchivablePost = {
  id: "p-001",
  createdAt: new Date(),
  updatedAt: new Date(),
  title: "TypeScript Rocks",
  content: "...",
  author: "Max",
  deletedAt: null,
  isDeleted: false,
};

// ─── Aufgabe 2: Utility Types in Aktion ────────────────────────────────
//
// Erklaerung:
// - Omit<T, K> entfernt die genannten Keys
// - Pick<T, K> behaelt NUR die genannten Keys
// - Partial<T> macht alle Properties optional
// - Man kann sie kombinieren: Partial<Pick<T, K>> = nur bestimmte, alle optional

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "guest";
  avatarUrl: string | null;
  lastLogin: Date;
}

// CreateUserDto: Alles AUSSER id und lastLogin
type CreateUserDto = Omit<User, "id" | "lastLogin">;

// UpdateUserDto: NUR name, email, avatarUrl -- und alle optional
// Zuerst auswaehlen (Pick), dann optional machen (Partial)
type UpdateUserDto = Partial<Pick<User, "name" | "email" | "avatarUrl">>;

// PublicUserProfile: NUR die oeffentlich sichtbaren Felder
type PublicUserProfile = Pick<User, "id" | "name" | "avatarUrl" | "role">;

// Type-Level Tests:
type test_create = Expect<Equal<CreateUserDto, {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "guest";
  avatarUrl: string | null;
}>>;

type test_update = Expect<Equal<UpdateUserDto, {
  name?: string;
  email?: string;
  avatarUrl?: (string | null);
}>>;

type test_public = Expect<Equal<PublicUserProfile, {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "admin" | "user" | "guest";
}>>;

// ─── Aufgabe 3: API Response Typen ─────────────────────────────────────
//
// Erklaerung: Das ist eine Discriminated Union!
// 'success' ist der Discriminant -- er hat verschiedene Literal Types
// in den verschiedenen Varianten (true vs false).
//
// TypeScript kann in einer if-Abfrage auf success den Typ eingrenzen:
// - success === true -> SuccessResponse<T> -> hat .data
// - success === false -> ErrorResponse -> hat .error

interface SuccessResponse<T> {
  success: true;    // LITERAL TYPE! Nicht boolean, sondern genau 'true'
  data: T;
  message: string;
}

interface ErrorResponse {
  success: false;   // LITERAL TYPE! Genau 'false'
  error: {
    code: number;
    message: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function processResponse(response: ApiResponse<User>): string {
  if (response.success === true) {
    // TypeScript weiss: response ist SuccessResponse<User>
    return response.data.name;
  } else {
    // TypeScript weiss: response ist ErrorResponse
    return `Error: ${response.error.message}`;
  }
}

// ─── Aufgabe 4: Config mit Defaults ────────────────────────────────────
//
// Erklaerung: Readonly<T> verhindert, dass DEFAULTS versehentlich
// geaendert werden. createConfig nimmt Partial<AppConfig> (nur Overrides)
// und merged die Defaults mit den User-Werten per Spread.
//
// Das Spread-Pattern { ...defaults, ...overrides } ist in JS/TS
// der Standard-Weg fuer Config-Merging.

interface AppConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
  debug: boolean;
  theme: "light" | "dark";
}

const DEFAULTS: Readonly<AppConfig> = {
  apiUrl: "http://localhost:3000",
  timeout: 5000,
  retries: 3,
  debug: false,
  theme: "light",
};

function createConfig(overrides: Partial<AppConfig>): AppConfig {
  return { ...DEFAULTS, ...overrides };
}

// ─── Aufgabe 5: Intersection-Konflikte ─────────────────────────────────
//
// Erklaerung der Regeln:
// 1. Intersection von Unions: Nur die GEMEINSAMEN Members ueberleben
//    ("active" | "inactive") & ("active" | "deleted") = "active"
//
// 2. Intersection von verschiedenen Primitiven: Immer never
//    string & number = never (nichts kann beides gleichzeitig sein)
//    number & boolean = number (boolean ist intern 0 | 1... ABER:
//    In TypeScript ist boolean KEIN Subtyp von number -> never? NEIN!)
//    Tatsaechlich: number & boolean = never
//
// ACHTUNG: (string | number) & (number | boolean) = number
// Weil number in BEIDEN vorkommt!

type A5 = { status: "active" | "inactive" };
type B5 = { status: "active" | "deleted" };
type C5 = A5 & B5;

type D5 = { value: string | number };
type E5 = { value: number | boolean };
type F5 = D5 & E5;

type G5 = { x: number };
type H5 = { x: string };
type I5 = G5 & H5;

// C5.status = ("active" | "inactive") & ("active" | "deleted") = "active"
type test_c5_status = Expect<Equal<C5["status"], "active">>;

// F5.value = (string | number) & (number | boolean) = number
// Nur 'number' ist in BEIDEN Unions enthalten
type test_f5_value = Expect<Equal<F5["value"], number>>;

// I5.x = number & string = never
// Nichts kann gleichzeitig number UND string sein
type test_i5_x = Expect<Equal<I5["x"], never>>;

// ─── Aufgabe 6: Discriminated Union Event System ──────────────────────

interface EmailNotification {
  type: "email";
  to: string;
  subject: string;
  body: string;
}

interface SmsNotification {
  type: "sms";
  phoneNumber: string;
  message: string;
}

interface PushNotification {
  type: "push";
  deviceId: string;
  title: string;
  body: string;
  badge?: number;
}

type Notification = EmailNotification | SmsNotification | PushNotification;

function sendNotification(notification: Notification): string {
  switch (notification.type) {
    case "email":
      return `Sending email to ${notification.to}: ${notification.subject}`;
    case "sms":
      return `Sending SMS to ${notification.phoneNumber}: ${notification.message}`;
    case "push":
      return `Sending push to ${notification.deviceId}: ${notification.title}`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

// Test 1: Intersection Types
console.assert(post.id === "p-001", "Aufgabe 1: id sollte 'p-001' sein");
console.assert(post.isDeleted === false, "Aufgabe 1: isDeleted sollte false sein");
console.assert(post.title === "TypeScript Rocks", "Aufgabe 1: title korrekt");

// Test 3: API Response
const successResponse: ApiResponse<User> = {
  success: true,
  data: {
    id: "u1", name: "Max", email: "max@test.de", password: "hash",
    role: "admin", avatarUrl: null, lastLogin: new Date(),
  },
  message: "OK",
};
const errorResponse: ApiResponse<User> = {
  success: false,
  error: { code: 404, message: "Not found" },
};
console.assert(processResponse(successResponse) === "Max", "Aufgabe 3: Success");
console.assert(processResponse(errorResponse) === "Error: Not found", "Aufgabe 3: Error");

// Test 4: Config
const customConfig = createConfig({ debug: true, theme: "dark" });
console.assert(customConfig.debug === true, "Aufgabe 4: debug override");
console.assert(customConfig.theme === "dark", "Aufgabe 4: theme override");
console.assert(customConfig.timeout === 5000, "Aufgabe 4: timeout default");

// Test 6: Notifications
const emailResult = sendNotification({
  type: "email", to: "test@test.de", subject: "Hello", body: "World",
});
console.assert(
  emailResult === "Sending email to test@test.de: Hello",
  "Aufgabe 6: Email notification"
);

const smsResult = sendNotification({
  type: "sms", phoneNumber: "+49123456", message: "Hi",
});
console.assert(
  smsResult === "Sending SMS to +49123456: Hi",
  "Aufgabe 6: SMS notification"
);

console.log("\n✓ Alle Tests bestanden! Gut gemacht!");
