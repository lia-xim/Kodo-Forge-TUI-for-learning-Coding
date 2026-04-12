/**
 * Lektion 15 - Example 05: Eigene Utility Types
 *
 * Ausfuehren mit: npx tsx examples/05-eigene-utility-types.ts
 *
 * DeepPartial, DeepReadonly, Mutable, RequiredKeys bauen.
 */

// ─── BASIS-INTERFACE ────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zip: string;
    geo: {
      lat: number;
      lng: number;
    };
  };
  tags: string[];
}

// ─── DEEPPARTIAL<T> ────────────────────────────────────────────────────────

type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

type DeepPartialUser = DeepPartial<User>;

// Jetzt kann man tief verschachtelte Partial-Updates machen:
function patchUser(id: number, patch: DeepPartial<User>): void {
  console.log(`Patching user ${id}:`, JSON.stringify(patch));
}

// Nur die Geo-Koordinaten updaten — ohne den Rest angeben zu muessen:
patchUser(1, { address: { geo: { lat: 48.137 } } });
patchUser(2, { name: "Anna", address: { city: "Berlin" } });
patchUser(3, { tags: ["vip"] });

// ─── DEEPREADONLY<T> ────────────────────────────────────────────────────────

type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

type ImmutableUser = DeepReadonly<User>;

function displayUser(user: DeepReadonly<User>): void {
  console.log(`User: ${user.name} in ${user.address.city}`);

  // Alles ist readonly — auch verschachtelt:
  // user.name = "other";          // Error!
  // user.address.city = "other";  // Error!
  // user.address.geo.lat = 0;     // Error!
  // user.tags.push("new");        // Error! readonly array
}

const immutableUser: ImmutableUser = {
  id: 1,
  name: "Max",
  email: "max@example.com",
  address: {
    street: "Hauptstr. 1",
    city: "Muenchen",
    zip: "80331",
    geo: { lat: 48.137, lng: 11.576 },
  },
  tags: ["premium"],
};

displayUser(immutableUser);

// ─── MUTABLE<T> — READONLY ENTFERNEN ────────────────────────────────────────

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface FrozenConfig {
  readonly host: string;
  readonly port: number;
  readonly debug: boolean;
}

type WritableConfig = Mutable<FrozenConfig>;
// ^ { host: string; port: number; debug: boolean } — kein readonly!

const config: WritableConfig = { host: "localhost", port: 3000, debug: false };
config.port = 8080; // OK — readonly entfernt
console.log(`Config: ${config.host}:${config.port}`);

// ─── DEEP MUTABLE<T> ───────────────────────────────────────────────────────

type DeepMutable<T> = T extends (infer U)[]
  ? DeepMutable<U>[]
  : T extends object
    ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
    : T;

// Macht auch verschachtelte readonly-Properties schreibbar

// ─── REQUIREDKEYS<T> UND OPTIONALKEYS<T> ───────────────────────────────────

interface UserProfile {
  id: number;          // required
  name: string;        // required
  bio?: string;        // optional
  avatar?: string;     // optional
  settings: {          // required
    theme: string;
  };
}

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type ProfileOptionals = OptionalKeys<UserProfile>;
// ^ "bio" | "avatar"

type ProfileRequired = RequiredKeys<UserProfile>;
// ^ "id" | "name" | "settings"

// Praktischer Einsatz — nur die required Felder als Pflicht-Checks:
function validateProfile(data: unknown): data is UserProfile {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  // Die required Keys muessen vorhanden sein:
  const requiredFields: RequiredKeys<UserProfile>[] = ["id", "name", "settings"];
  return requiredFields.every((field) => field in obj);
}

console.log("Required keys:", ["id", "name", "settings"]);
console.log("Optional keys:", ["bio", "avatar"]);

// ─── NULLABLE<T> — EIGENER UTILITY TYPE ─────────────────────────────────────

type Nullable<T> = T | null;

// Alle Properties nullable machen:
type NullableProps<T> = {
  [P in keyof T]: T[P] | null;
};

interface FormData {
  username: string;
  email: string;
  age: number;
}

type NullableForm = NullableProps<FormData>;
// ^ { username: string | null; email: string | null; age: number | null }

// Sinnvoll fuer Formulare die "leer" starten:
const emptyForm: NullableForm = {
  username: null,
  email: null,
  age: null,
};

console.log("Empty form:", emptyForm);

// ─── DEEPREQUIRED<T> — UEBUNG ──────────────────────────────────────────────

type DeepRequired<T> = T extends (infer U)[]
  ? DeepRequired<U>[]
  : T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;

// Macht ALLES required — auch verschachtelt:
interface PartialConfig {
  host?: string;
  port?: number;
  ssl?: {
    cert?: string;
    key?: string;
  };
}

type FullConfig = DeepRequired<PartialConfig>;
// ^ { host: string; port: number; ssl: { cert: string; key: string } }

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
