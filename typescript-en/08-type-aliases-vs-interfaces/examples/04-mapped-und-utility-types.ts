/**
 * Lektion 08 - Example 04: Mapped Types und Utility Types
 *
 * Ausfuehren mit: npx tsx examples/04-mapped-und-utility-types.ts
 *
 * Mapped Types sind type-exklusiv und bilden die Grundlage fuer
 * TypeScript's eingebaute Utility Types (Partial, Required, Pick, etc.).
 */

// ─── BASIS-TYP ─────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  category: string;
}

const product: Product = {
  id: "prod-001",
  name: "TypeScript-Buch",
  price: 39.99,
  description: "Das ultimative TypeScript-Handbuch",
  inStock: true,
  category: "Buecher",
};

// ─── EIGENE MAPPED TYPES ───────────────────────────────────────────────────

console.log("--- Eigene Mapped Types ---");

// 1. Alle Properties optional machen (wie Partial<T>):
type MeinPartial<T> = {
  [K in keyof T]?: T[K];
};

// 2. Alle Properties readonly machen (wie Readonly<T>):
type MeinReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 3. Alle Properties nullable machen:
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// 4. Alle Properties zu Strings umwandeln:
type Stringified<T> = {
  [K in keyof T]: string;
};

const nullableProduct: Nullable<Product> = {
  id: "prod-002",
  name: null,  // OK — jede Property kann null sein
  price: null,
  description: "Test",
  inStock: null,
  category: null,
};

console.log(`Nullable Name: ${nullableProduct.name ?? "nicht gesetzt"}`);

// ─── EINGEBAUTE UTILITY TYPES ──────────────────────────────────────────────

console.log("\n--- Eingebaute Utility Types ---");

// Partial<T> — Alle Properties optional
type CreateProductDTO = Partial<Product>;
const partialProduct: CreateProductDTO = { name: "Neues Buch" };
console.log(`Partial: nur name = ${partialProduct.name}`);

// Required<T> — Alle Properties erforderlich
type StrictProduct = Required<Product>;
// Jetzt sind ALLE Properties Pflicht, auch wenn sie vorher optional waren.

// Pick<T, K> — Nur bestimmte Properties behalten
type ProductSummary = Pick<Product, "id" | "name" | "price">;
const summary: ProductSummary = {
  id: "prod-001",
  name: "TypeScript-Buch",
  price: 39.99,
};
console.log(`Pick: ${summary.name} — ${summary.price} EUR`);

// Omit<T, K> — Bestimmte Properties entfernen
type ProductWithoutId = Omit<Product, "id">;
const noId: ProductWithoutId = {
  name: "Neues Buch",
  price: 29.99,
  description: "Beschreibung",
  inStock: true,
  category: "Buecher",
};
console.log(`Omit: ${noId.name} (ohne id)`);

// Record<K, V> — Objekt mit bestimmten Keys und Werttyp
type ProductPrices = Record<string, number>;
const prices: ProductPrices = {
  "TypeScript-Buch": 39.99,
  "React-Kurs": 49.99,
  "Angular-Kurs": 44.99,
};
console.log(`Record: TypeScript-Buch = ${prices["TypeScript-Buch"]} EUR`);

// ─── KOMBINIERTE UTILITY TYPES ─────────────────────────────────────────────

console.log("\n--- Kombinierte Utility Types ---");

// Update-DTO: Alles optional ausser id
type UpdateProductDTO = Pick<Product, "id"> & Partial<Omit<Product, "id">>;

const update: UpdateProductDTO = {
  id: "prod-001",        // Pflicht!
  price: 34.99,          // Optional — nur was sich aendert
  // name, description, inStock, category — alles optional
};

console.log(`Update: id=${update.id}, neuer Preis=${update.price}`);

// Create-DTO: Alles ausser id und Timestamps
type CreateDTO<T, ExcludeKeys extends keyof T> = Omit<T, ExcludeKeys>;

interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
}

type CreateEntityDTO = CreateDTO<Entity, "id" | "createdAt" | "updatedAt">;
// Ergebnis: { name: string; email: string }

const createEntity: CreateEntityDTO = {
  name: "Max",
  email: "max@example.com",
};
console.log(`Create: ${createEntity.name} (${createEntity.email})`);

// ─── FORTGESCHRITTENE MAPPED TYPES ─────────────────────────────────────────

console.log("\n--- Fortgeschrittene Mapped Types ---");

// Keys nach Werttyp filtern:
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

type StringKeysOfProduct = KeysOfType<Product, string>;
// "id" | "name" | "description" | "category"

type NumberKeysOfProduct = KeysOfType<Product, number>;
// "price"

type BooleanKeysOfProduct = KeysOfType<Product, boolean>;
// "inStock"

// Getter-Interface generieren:
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type ProductGetters = Getters<Product>;
// { getId: () => string; getName: () => string; getPrice: () => number; ... }

// Verwendung demonstrieren:
const getters: ProductGetters = {
  getId: () => product.id,
  getName: () => product.name,
  getPrice: () => product.price,
  getDescription: () => product.description,
  getInStock: () => product.inStock,
  getCategory: () => product.category,
};

console.log(`Getter: getName() = ${getters.getName()}`);
console.log(`Getter: getPrice() = ${getters.getPrice()}`);

// Event-Map generieren:
type EventMap<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Changed`]: (newValue: T[K]) => void;
};

type ProductEvents = EventMap<Product>;
// { onIdChanged: (v: string) => void; onNameChanged: (v: string) => void; ... }

const events: Partial<ProductEvents> = {
  onPriceChanged: (newPrice) => console.log(`Preis geaendert: ${newPrice}`),
  onNameChanged: (newName) => console.log(`Name geaendert: ${newName}`),
};

events.onPriceChanged?.(29.99);
events.onNameChanged?.("Neuer Titel");

// ─── CONDITIONAL TYPES MIT UTILITY TYPES ────────────────────────────────────

// Extract und Exclude:
type AllTypes = string | number | boolean | null | undefined;

type OnlyStrings = Extract<AllTypes, string>;       // string
type NoNulls = Exclude<AllTypes, null | undefined>;  // string | number | boolean

// NonNullable:
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>;    // string

// ReturnType:
function fetchUser() {
  return { id: "1", name: "Max", online: true };
}

type UserShape = ReturnType<typeof fetchUser>;
// { id: string; name: string; online: boolean }

const inferredUser: UserShape = { id: "2", name: "Anna", online: false };
console.log(`\nInferred: ${inferredUser.name} (online: ${inferredUser.online})`);

// Parameters:
function greet(name: string, age: number): string {
  return `Hallo ${name}, du bist ${age}`;
}

type GreetParams = Parameters<typeof greet>;
// [name: string, age: number]

const params: GreetParams = ["Max", 30];
console.log(greet(...params));

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
