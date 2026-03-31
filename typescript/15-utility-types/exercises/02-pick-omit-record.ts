/**
 * Lektion 15 - Exercise 02: Pick, Omit, Record
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-pick-omit-record.ts
 *
 * 6 Aufgaben zu Objekt-Transformation und Dictionaries.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Pick fuer API-Response
// ═══════════════════════════════════════════════════════════════════════════

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  salary: number;
  department: string;
  ssn: string;          // Social Security Number — sensibel!
  bankAccount: string;  // Auch sensibel!
}

// TODO: Erstelle einen Typ "PublicEmployee" der NUR die oeffentlichen
// Felder enthaelt: id, firstName, lastName, email, department
// type PublicEmployee = ...

// TODO: Erstelle eine Funktion "toPublicEmployee" die einen Employee nimmt
// und ein PublicEmployee-Objekt zurueckgibt
// function toPublicEmployee(emp: Employee): PublicEmployee { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Omit fuer Create-Input
// ═══════════════════════════════════════════════════════════════════════════

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

// TODO: Erstelle einen Typ "CreateBlogPostInput" der die vom Server
// generierten Felder NICHT enthaelt: id, createdAt, updatedAt, viewCount, slug
// type CreateBlogPostInput = ...

// TODO: Erstelle eine Funktion "createBlogPost" die den Input nimmt
// und einen vollstaendigen BlogPost zurueckgibt
// function createBlogPost(input: CreateBlogPostInput): BlogPost { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: StrictOmit implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere StrictOmit<T, K> so, dass K nur Keys von T sein darf
// type StrictOmit<T, K extends ???> = ...

// Teste: Die folgende Zeile soll KEINEN Fehler verursachen:
// type WithoutSalary = StrictOmit<Employee, "salary">;

// Die folgende Zeile SOLL einen Fehler verursachen (auskommentiert lassen):
// type WithoutTypo = StrictOmit<Employee, "salery">; // Tippfehler!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Record als Lookup-Table
// ═══════════════════════════════════════════════════════════════════════════

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogConfig {
  color: string;
  prefix: string;
  writeToFile: boolean;
}

// TODO: Erstelle eine Variable "logConfigs" vom Typ Record<LogLevel, LogConfig>
// Weise jedem Level eine sinnvolle Konfiguration zu.
// const logConfigs: Record<LogLevel, LogConfig> = { ... };

// TODO: Erstelle eine Funktion "log" die ein LogLevel und eine Message nimmt
// und formatiert ausgibt (mit dem Prefix und der Farbe aus dem Config)
// function log(level: LogLevel, message: string): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Record fuer Error-Map
// ═══════════════════════════════════════════════════════════════════════════

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  age: number;
}

// TODO: Erstelle einen Typ "ValidationErrors" der fuer JEDES Feld von
// RegistrationForm einen optionalen Fehler-String hat.
// Verwende Record und Partial!
// type ValidationErrors = ...

// TODO: Erstelle eine Funktion "validate" die ein RegistrationForm-Objekt
// nimmt und ValidationErrors zurueckgibt
// function validate(form: RegistrationForm): ValidationErrors { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Pick + Omit kombinieren
// ═══════════════════════════════════════════════════════════════════════════

interface Order {
  id: number;
  customerId: number;
  items: { productId: number; quantity: number }[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Erstelle folgende abgeleitete Typen:
// 1. OrderSummary: Nur id, customerId, totalAmount, status (mit Pick)
// type OrderSummary = ...

// 2. OrderCreateInput: Alles AUSSER id, createdAt, updatedAt, status (mit Omit)
// type OrderCreateInput = ...

// 3. OrderStatusUpdate: Nur id und status (mit Pick)
// type OrderStatusUpdate = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// const emp: Employee = {
//   id: 1, firstName: "Anna", lastName: "Mueller", email: "anna@corp.com",
//   salary: 75000, department: "Engineering", ssn: "123-45-6789", bankAccount: "DE89..."
// };
// console.log("Public:", toPublicEmployee(emp));
//
// const post = createBlogPost({ title: "Hello", content: "World", author: "Max" });
// console.log("Blog post:", post.title, "slug:", post.slug);
//
// console.log(log("error", "Something went wrong!"));
// console.log(log("info", "Server started"));
//
// const errors = validate({ username: "", email: "bad", password: "12", age: -5 });
// console.log("Validation errors:", errors);

console.log("Exercise 02 geladen. Ersetze die TODOs!");
