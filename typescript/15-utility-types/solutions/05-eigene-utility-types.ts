/**
 * Lektion 15 - Solution 05: Eigene Utility Types
 *
 * Ausfuehren mit: npx tsx solutions/05-eigene-utility-types.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: DeepPartial
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Rekursiver Typ der Arrays, Objekte und Primitives behandelt
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]           // Arrays: Element-Typ rekursiv
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }  // Objekte: Props optional + Rekursion
    : T;                       // Primitives: Unveraendert

interface Company {
  name: string;
  address: {
    street: string;
    city: string;
    country: {
      name: string;
      code: string;
    };
  };
  employees: { name: string; role: string }[];
}

// Test: Nur verschachteltes Feld updaten
const partialCompany: DeepPartial<Company> = {
  address: { country: { code: "DE" } },
};

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: DeepReadonly
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Rekursiver Typ der readonly auf allen Ebenen anwendet
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

const frozen: DeepReadonly<Company> = {
  name: "ACME",
  address: {
    street: "Main St",
    city: "Berlin",
    country: { name: "Germany", code: "DE" },
  },
  employees: [{ name: "Max", role: "Dev" }],
};

// frozen.name = "Other";                // Error!
// frozen.address.city = "Munich";       // Error! (Deep!)
// frozen.employees.push({...});         // Error! (readonly array)
// frozen.address.country.code = "US";   // Error! (Deep!)

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Mutable<T>
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: -readonly entfernt den readonly-Modifier
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface FrozenUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

type EditableUser = Mutable<FrozenUser>;
// ^ { id: number; name: string; email: string } — kein readonly!

const editable: EditableUser = { id: 1, name: "Max", email: "max@test.com" };
editable.name = "Anna"; // OK — readonly entfernt!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: RequiredKeys und OptionalKeys
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Mapped Type der Keys nach Eigenschaft filtert
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

interface MixedType {
  id: number;
  name: string;
  bio?: string;
  avatar?: string;
  role: "admin" | "user";
  nickname?: string;
}

type MixedOptionals = OptionalKeys<MixedType>;
// ^ "bio" | "avatar" | "nickname"

type MixedRequired = RequiredKeys<MixedType>;
// ^ "id" | "name" | "role"

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Nullable und NullableProps
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Einfache Type-Aliases
type Nullable<T> = T | null;

type NullableProps<T> = {
  [P in keyof T]: T[P] | null;
};

interface FormInput {
  username: string;
  email: string;
  age: number;
}

type NullableForm = NullableProps<FormInput>;
// ^ { username: string | null; email: string | null; age: number | null }

const emptyForm: NullableForm = {
  username: null,
  email: null,
  age: null,
};

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: DeepRequired
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: -? entfernt optional, Rekursion fuer verschachtelte Typen
type DeepRequired<T> = T extends (infer U)[]
  ? DeepRequired<U>[]
  : T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;

interface PartialConfig {
  database?: {
    host?: string;
    port?: number;
    credentials?: {
      user?: string;
      password?: string;
    };
  };
  cache?: {
    ttl?: number;
    maxSize?: number;
  };
}

type FullConfig = DeepRequired<PartialConfig>;
// ^ Alles required — auch verschachtelt

const fullConfig: FullConfig = {
  database: {
    host: "localhost",
    port: 5432,
    credentials: {
      user: "admin",
      password: "secret",
    },
  },
  cache: {
    ttl: 3600,
    maxSize: 1000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

console.log("DeepPartial works:", JSON.stringify(partialCompany));
console.log("DeepReadonly works:", frozen.name);
console.log("Mutable works:", editable.name);
console.log("NullableForm:", JSON.stringify(emptyForm));
console.log("DeepRequired config:", fullConfig.database.credentials.user);

console.log("\n--- Alle Tests bestanden! ---");
