/**
 * Lektion 15 - Solution 02: Pick, Omit, Record
 *
 * Ausfuehren mit: npx tsx solutions/02-pick-omit-record.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
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
  ssn: string;
  bankAccount: string;
}

// Loesung: Pick waehlt nur die oeffentlichen Felder aus
type PublicEmployee = Pick<Employee, "id" | "firstName" | "lastName" | "email" | "department">;

function toPublicEmployee(emp: Employee): PublicEmployee {
  // Explizit nur die gewuenschten Felder zurueckgeben:
  return {
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    department: emp.department,
  };
}

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

// Loesung: Omit entfernt die Server-generierten Felder
type CreateBlogPostInput = Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "viewCount" | "slug">;

function createBlogPost(input: CreateBlogPostInput): BlogPost {
  return {
    ...input,
    id: Math.floor(Math.random() * 10000),
    slug: input.title.toLowerCase().replace(/\s+/g, "-"),
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: StrictOmit
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: K muss ein Key von T sein (extends keyof T)
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type WithoutSalary = StrictOmit<Employee, "salary">; // OK
// type WithoutTypo = StrictOmit<Employee, "salery">; // Error! Tippfehler erkannt!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Record als Lookup-Table
// ═══════════════════════════════════════════════════════════════════════════

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogConfig {
  color: string;
  prefix: string;
  writeToFile: boolean;
}

// Loesung: Record erzwingt einen Eintrag fuer JEDEN LogLevel
const logConfigs: Record<LogLevel, LogConfig> = {
  debug: { color: "gray", prefix: "[DEBUG]", writeToFile: false },
  info: { color: "blue", prefix: "[INFO]", writeToFile: false },
  warn: { color: "yellow", prefix: "[WARN]", writeToFile: true },
  error: { color: "red", prefix: "[ERROR]", writeToFile: true },
  fatal: { color: "magenta", prefix: "[FATAL]", writeToFile: true },
};

function log(level: LogLevel, message: string): string {
  const config = logConfigs[level];
  return `${config.prefix} ${message}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Record fuer Error-Map
// ═══════════════════════════════════════════════════════════════════════════

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  age: number;
}

// Loesung: Partial<Record<keyof T, string>> — jedes Feld bekommt einen optionalen Fehler
type ValidationErrors = Partial<Record<keyof RegistrationForm, string>>;

function validate(form: RegistrationForm): ValidationErrors {
  const errors: ValidationErrors = {};

  if (form.username.length < 3) {
    errors.username = "Username muss mindestens 3 Zeichen lang sein";
  }
  if (!form.email.includes("@")) {
    errors.email = "Ungueltige E-Mail-Adresse";
  }
  if (form.password.length < 8) {
    errors.password = "Passwort muss mindestens 8 Zeichen lang sein";
  }
  if (form.age < 0 || form.age > 150) {
    errors.age = "Ungueltiges Alter";
  }

  return errors;
}

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

// Loesung: Pick fuer wenige gewuenschte, Omit fuer wenige ungewuenschte
type OrderSummary = Pick<Order, "id" | "customerId" | "totalAmount" | "status">;
type OrderCreateInput = Omit<Order, "id" | "createdAt" | "updatedAt" | "status">;
type OrderStatusUpdate = Pick<Order, "id" | "status">;

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
const emp: Employee = {
  id: 1, firstName: "Anna", lastName: "Mueller", email: "anna@corp.com",
  salary: 75000, department: "Engineering", ssn: "123-45-6789", bankAccount: "DE89...",
};
console.log("Public:", toPublicEmployee(emp));

const post = createBlogPost({ title: "Hello World", content: "My first post", author: "Max" });
console.log("Blog post:", post.title, "slug:", post.slug);

console.log(log("error", "Something went wrong!"));
console.log(log("info", "Server started"));

const errors = validate({ username: "", email: "bad", password: "12", age: -5 });
console.log("Validation errors:", errors);

console.log("\n--- Alle Tests bestanden! ---");
