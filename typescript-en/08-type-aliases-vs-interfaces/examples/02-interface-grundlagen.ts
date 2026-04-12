/**
 * Lektion 08 - Example 02: Interface Grundlagen
 *
 * Ausfuehren mit: npx tsx examples/02-interface-grundlagen.ts
 *
 * Die einzigartigen Faehigkeiten von Interfaces:
 * Declaration Merging, extends-Ketten, implements.
 */

// ─── GRUNDLEGENDE INTERFACE-DEKLARATION ────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: "usr-001",
  name: "Max",
  email: "max@example.com",
};

console.log("--- Grundlegendes Interface ---");
console.log(`User: ${user.name} (${user.email})`);

// ─── DECLARATION MERGING ───────────────────────────────────────────────────

// Das Killer-Feature von interface: Mehrfach-Deklaration wird zusammengefuegt!

interface Config {
  host: string;
  port: number;
}

// Zweite Deklaration — wird mit der ersten ZUSAMMENGEFUEGT:
interface Config {
  database: string;
  debug?: boolean;
}

// Config hat jetzt ALLE vier Properties:
const config: Config = {
  host: "localhost",
  port: 5432,
  database: "myapp",
  debug: true,
};

console.log("\n--- Declaration Merging ---");
console.log(`Config: ${config.host}:${config.port}/${config.database}`);
console.log(`Debug: ${config.debug}`);

// Noch eine Erweiterung:
interface Config {
  redis?: {
    host: string;
    port: number;
  };
}

// Jetzt hat Config auch redis:
const fullConfig: Config = {
  host: "localhost",
  port: 5432,
  database: "myapp",
  redis: { host: "localhost", port: 6379 },
};

console.log(`Redis: ${fullConfig.redis?.host}:${fullConfig.redis?.port}`);

// ─── EXTENDS — VERERBUNGSKETTEN ────────────────────────────────────────────

interface HasId {
  id: string;
}

interface HasTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface HasSoftDelete {
  deletedAt: Date | null;
  isDeleted: boolean;
}

// Mehrfach-extends: User erbt von drei Interfaces!
interface FullUser extends HasId, HasTimestamps, HasSoftDelete {
  name: string;
  email: string;
  role: string;
}

const fullUser: FullUser = {
  id: "usr-002",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-06-20"),
  deletedAt: null,
  isDeleted: false,
  name: "Anna",
  email: "anna@example.com",
  role: "admin",
};

console.log("\n--- extends-Kette ---");
console.log(`Full User: ${fullUser.name}, Rolle: ${fullUser.role}`);
console.log(`Erstellt: ${fullUser.createdAt.toLocaleDateString()}`);
console.log(`Geloescht: ${fullUser.isDeleted}`);

// ─── EXTENDS MIT TYPE ALIAS ────────────────────────────────────────────────

// Interface kann auch von Type Aliases erben (solange es Objekttypen sind):
type Printable = {
  toString(): string;
};

interface Report extends Printable {
  title: string;
  pages: number;
}

const report: Report = {
  title: "Quartalsbericht",
  pages: 42,
  toString() {
    return `${this.title} (${this.pages} Seiten)`;
  },
};

console.log("\n--- extends mit Type Alias ---");
console.log(`Report: ${report.toString()}`);

// ─── IMPLEMENTS — KLASSEN MIT INTERFACES ───────────────────────────────────

interface Serializable {
  serialize(): string;
}

interface Validatable {
  validate(): boolean;
  getErrors(): string[];
}

class Product implements Serializable, Validatable {
  private errors: string[] = [];

  constructor(
    public name: string,
    public price: number,
  ) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, price: this.price });
  }

  validate(): boolean {
    this.errors = [];
    if (!this.name || this.name.trim().length === 0) {
      this.errors.push("Name darf nicht leer sein");
    }
    if (this.price < 0) {
      this.errors.push("Preis darf nicht negativ sein");
    }
    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return [...this.errors];
  }
}

const product = new Product("TypeScript-Buch", 39.99);
console.log("\n--- implements ---");
console.log(`Valide: ${product.validate()}`);
console.log(`Serialisiert: ${product.serialize()}`);

const invalidProduct = new Product("", -5);
console.log(`Invalide: ${invalidProduct.validate()}`);
console.log(`Fehler: ${invalidProduct.getErrors().join(", ")}`);

// ─── INDEX SIGNATURES ──────────────────────────────────────────────────────

interface StringMap {
  [key: string]: string;
}

interface NumberMap {
  [key: string]: number;
  length: number;  // Spezifische Property MUSS zum Index-Typ passen
}

const translations: StringMap = {
  hello: "hallo",
  goodbye: "tschuess",
  thanks: "danke",
};

console.log("\n--- Index Signatures ---");
console.log(`hello = ${translations.hello}`);
console.log(`thanks = ${translations.thanks}`);

// ─── CALLABLE UND CONSTRUCTABLE INTERFACES ─────────────────────────────────

interface Formatter {
  (input: string): string;
  locale: string;
}

// Funktion mit Properties:
const upperFormatter: Formatter = Object.assign(
  (input: string) => input.toUpperCase(),
  { locale: "de-DE" },
);

console.log("\n--- Callable Interface ---");
console.log(`Formatiert: ${upperFormatter("hallo welt")}`);
console.log(`Locale: ${upperFormatter.locale}`);

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
