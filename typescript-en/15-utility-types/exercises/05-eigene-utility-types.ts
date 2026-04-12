/**
 * Lektion 15 - Exercise 05: Eigene Utility Types
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-eigene-utility-types.ts
 *
 * 6 Aufgaben zum Bauen eigener Utility Types.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: DeepPartial implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere DeepPartial<T> — macht alle Properties rekursiv optional
// Beruecksichtige: Primitives, Objekte UND Arrays
// type DeepPartial<T> = ...

// Teste mit:
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

// type PartialCompany = DeepPartial<Company>;
// Soll: name?, address?: { street?, city?, country?: { name?, code? } }, employees?: ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: DeepReadonly implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere DeepReadonly<T> — macht alle Properties rekursiv readonly
// type DeepReadonly<T> = ...

// Teste: Erstelle eine Variable vom Typ DeepReadonly<Company>
// und versuche eine verschachtelte Property zu aendern (soll Error geben)

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Mutable<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Mutable<T> — entfernt readonly von allen Properties
// (Tipp: -readonly)
// type Mutable<T> = ...

interface FrozenUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

// type EditableUser = Mutable<FrozenUser>;
// Soll: { id: number; name: string; email: string } — kein readonly!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: RequiredKeys und OptionalKeys
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere OptionalKeys<T> — gibt einen Union der optionalen Key-Namen zurueck
// type OptionalKeys<T> = ...

// TODO: Implementiere RequiredKeys<T> — gibt einen Union der required Key-Namen zurueck
// type RequiredKeys<T> = ...

interface MixedType {
  id: number;
  name: string;
  bio?: string;
  avatar?: string;
  role: "admin" | "user";
  nickname?: string;
}

// type MixedOptionals = OptionalKeys<MixedType>;
// Erwartet: "bio" | "avatar" | "nickname"

// type MixedRequired = RequiredKeys<MixedType>;
// Erwartet: "id" | "name" | "role"

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Nullable<T> und NullableProps<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere Nullable<T> — macht den gesamten Typ nullable (T | null)
// type Nullable<T> = ...

// TODO: Implementiere NullableProps<T> — macht jede Property nullable
// type NullableProps<T> = ...

interface FormInput {
  username: string;
  email: string;
  age: number;
}

// type NullableForm = NullableProps<FormInput>;
// Erwartet: { username: string | null; email: string | null; age: number | null }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: DeepRequired implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere DeepRequired<T> — macht alle Properties rekursiv required
// (das Gegenteil von DeepPartial)
// type DeepRequired<T> = ...

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

// type FullConfig = DeepRequired<PartialConfig>;
// Soll: Alles required — auch verschachtelt

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
//
// // DeepPartial Test:
// const partialCompany: DeepPartial<Company> = {
//   address: { country: { code: "DE" } },
// };
// console.log("DeepPartial works:", JSON.stringify(partialCompany));
//
// // DeepReadonly Test:
// const frozen: DeepReadonly<Company> = {
//   name: "ACME",
//   address: { street: "Main St", city: "Berlin", country: { name: "Germany", code: "DE" } },
//   employees: [{ name: "Max", role: "Dev" }],
// };
// console.log("DeepReadonly works:", frozen.name);
// // frozen.address.city = "Munich"; // Soll Error sein!
//
// // Mutable Test:
// const editable: Mutable<FrozenUser> = { id: 1, name: "Max", email: "max@test.com" };
// editable.name = "Anna"; // Soll OK sein!
// console.log("Mutable works:", editable.name);

console.log("Exercise 05 geladen. Ersetze die TODOs!");
