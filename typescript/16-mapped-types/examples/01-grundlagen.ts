/**
 * Lektion 16 - Beispiel 01: Mapped Types Grundlagen
 * Ausfuehren mit: npx tsx examples/01-grundlagen.ts
 */

// ─── Grundsyntax: { [K in keyof T]: ... } ─────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// Partial nachbauen
type MyPartial<T> = { [K in keyof T]?: T[K] };

const update: MyPartial<User> = { name: "Max" };
console.log("Partial Update:", update);

// Required nachbauen
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// Readonly nachbauen
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

const frozenUser: MyReadonly<User> = {
  id: 1, name: "Max", email: "max@test.de", role: "user",
};
// frozenUser.name = "Moritz"; // Error: readonly!
console.log("Readonly User:", frozenUser);

// ─── Modifier: + und - ────────────────────────────────────────────────────

// Mutable: readonly entfernen
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const mutableUser: Mutable<MyReadonly<User>> = { ...frozenUser };
mutableUser.name = "Moritz"; // OK — readonly wurde entfernt
console.log("Mutable User:", mutableUser);

// ─── Homomorphe Mapped Types ──────────────────────────────────────────────

interface Config {
  readonly host: string;
  port?: number;
  readonly debug?: boolean;
}

// Copy bewahrt alle Modifier!
type Copy<T> = { [K in keyof T]: T[K] };
type ConfigCopy = Copy<Config>;

// Das ist identisch zu Config — readonly und ? werden beibehalten
const cfg: ConfigCopy = { host: "localhost" };
// cfg.host = "x"; // Error: readonly beibehalten
console.log("Config Copy:", cfg);

console.log("\n--- Grundlagen-Beispiele abgeschlossen ---");
