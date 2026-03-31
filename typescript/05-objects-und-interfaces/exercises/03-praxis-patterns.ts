/**
 * Lektion 05 - Exercise 03: Praxis-Patterns Challenge
 *
 * Realitaetsnahe Aufgaben mit Intersection Types, Utility Types
 * und Praxis-Patterns. Hier modellierst du Typen wie im echten Projekt.
 *
 * Ausfuehren: npx tsx exercises/03-praxis-patterns.ts
 */

import type { Expect, Equal } from "../../tools/type-test.ts";

// ─── Aufgabe 1: Intersection Types ──────────────────────────────────────
//
// Erstelle die folgenden Typen mit Intersection (&):
//
// Basis-"Mixins":
// - Identifiable: hat 'id: string'
// - Timestamped: hat 'createdAt: Date' und 'updatedAt: Date'
// - SoftDeletable: hat 'deletedAt: Date | null' und 'isDeleted: boolean'
//
// Zusammengesetzte Typen (per Intersection):
// - BlogPost = Identifiable & Timestamped & { title: string; content: string; author: string }
// - ArchivablePost = BlogPost & SoftDeletable

// TODO: Typ Identifiable erstellen

// TODO: Typ Timestamped erstellen

// TODO: Typ SoftDeletable erstellen

// TODO: Typ BlogPost per Intersection erstellen

// TODO: Typ ArchivablePost per Intersection erstellen

// TODO: Erstelle ein Objekt 'post' vom Typ ArchivablePost
// (id: "p-001", title: "TypeScript Rocks", content: "...", author: "Max",
//  createdAt/updatedAt: new Date(), deletedAt: null, isDeleted: false)

// ─── Aufgabe 2: Utility Types in Aktion ────────────────────────────────
//
// Gegeben ist ein User-Interface. Erstelle daraus abgeleitete Typen.

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "guest";
  avatarUrl: string | null;
  lastLogin: Date;
}

// TODO: Erstelle 'CreateUserDto' -- User OHNE 'id' und 'lastLogin'
//       (diese werden vom Server gesetzt)
//       Nutze Omit<T, K>

// TODO: Erstelle 'UpdateUserDto' -- NUR 'name', 'email', 'avatarUrl',
//       und ALLE optional (da man nur einzelne Felder updaten will)
//       Nutze Pick<T, K> und Partial<T> in Kombination

// TODO: Erstelle 'PublicUserProfile' -- NUR 'id', 'name', 'avatarUrl', 'role'
//       Nutze Pick<T, K>

// Type-Level Tests: Entkommentiere wenn deine Typen stimmen
/*
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
*/

// ─── Aufgabe 3: API Response Typen ─────────────────────────────────────
//
// Modelliere ein typsicheres API-Response-System:
//
// 1. Interface 'SuccessResponse<T>' mit:
//    - success: true  (Literal Type!)
//    - data: T
//    - message: string
//
// 2. Interface 'ErrorResponse' mit:
//    - success: false  (Literal Type!)
//    - error: { code: number; message: string }
//
// 3. Type 'ApiResponse<T>' = SuccessResponse<T> | ErrorResponse

// TODO: Interface SuccessResponse<T> erstellen

// TODO: Interface ErrorResponse erstellen

// TODO: Type ApiResponse<T> erstellen

// TODO: Schreibe eine Funktion 'processResponse' die eine ApiResponse<User>
//       entgegennimmt und:
//       - Bei success === true: den User-Namen zurueckgibt
//       - Bei success === false: "Error: " + error.message zurueckgibt
//       Nutze eine if-Abfrage auf response.success

// ─── Aufgabe 4: Config mit Defaults ────────────────────────────────────
//
// Erstelle ein typsicheres Config-System:
//
// 1. Interface 'AppConfig' mit:
//    - apiUrl: string
//    - timeout: number
//    - retries: number
//    - debug: boolean
//    - theme: "light" | "dark"
//
// 2. Definiere DEFAULTS als Readonly-Objekt vom Typ Readonly<AppConfig>
//    (apiUrl: "http://localhost:3000", timeout: 5000, retries: 3,
//     debug: false, theme: "light")
//
// 3. Funktion 'createConfig' die Partial<AppConfig> nimmt und
//    eine vollstaendige AppConfig zurueckgibt (Defaults + Overrides)

// TODO: Interface AppConfig erstellen

// TODO: DEFAULTS erstellen (Readonly<AppConfig>)

// TODO: Funktion createConfig implementieren

// ─── Aufgabe 5: Intersection-Konflikte -- Denkaufgabe ─────────────────
//
// Was sind die resultierenden Typen? Trage ein: den tatsaechlichen Typ
// oder 'never' wenn die Intersection unmoeglich ist.
//
// Entkommentiere die Type-Level Tests und ersetze 'never' durch den
// richtigen Typ.

type A5 = { status: "active" | "inactive" };
type B5 = { status: "active" | "deleted" };
type C5 = A5 & B5;
// Was ist C5.status?

type D5 = { value: string | number };
type E5 = { value: number | boolean };
type F5 = D5 & E5;
// Was ist F5.value?

type G5 = { x: number };
type H5 = { x: string };
type I5 = G5 & H5;
// Was ist I5.x?

// TODO: Ersetze never durch den richtigen Typ
/*
type test_c5_status = Expect<Equal<C5["status"], never>>;  // Was ist es?
type test_f5_value = Expect<Equal<F5["value"], never>>;    // Was ist es?
type test_i5_x = Expect<Equal<I5["x"], never>>;           // Was ist es?
*/

// ─── Aufgabe 6: Discriminated Union Event System ──────────────────────
//
// Modelliere ein Notification-System mit verschiedenen Typen:
//
// 1. Interface 'EmailNotification':
//    - type: "email" (Literal!)
//    - to: string
//    - subject: string
//    - body: string
//
// 2. Interface 'SmsNotification':
//    - type: "sms" (Literal!)
//    - phoneNumber: string
//    - message: string
//
// 3. Interface 'PushNotification':
//    - type: "push" (Literal!)
//    - deviceId: string
//    - title: string
//    - body: string
//    - badge?: number (optional)
//
// 4. Type 'Notification' = EmailNotification | SmsNotification | PushNotification
//
// 5. Funktion 'sendNotification' die eine Notification entgegennimmt
//    und je nach type einen String zurueckgibt:
//    - "email": `Sending email to ${to}: ${subject}`
//    - "sms": `Sending SMS to ${phoneNumber}: ${message}`
//    - "push": `Sending push to ${deviceId}: ${title}`

// TODO: Interfaces und Typen erstellen

// TODO: Funktion sendNotification implementieren

// ════════════════════════════════════════════════════════════════════════════
// Tests -- aendere nichts unter dieser Zeile!
// ════════════════════════════════════════════════════════════════════════════

// Entkommentiere die folgenden Tests, nachdem du die Aufgaben geloest hast:

/*
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
*/

console.log("\nEntkommentiere die Tests am Ende der Datei, wenn du alle Aufgaben geloest hast.");
