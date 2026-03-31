/**
 * Lektion 18 - Loesung 05
 */
type CssLength = `${number}${"px" | "em" | "rem" | "%" | "vh" | "vw"}`;

type ExtractParams<T extends string> =
  T extends `${string}:${infer P}/${infer Rest}` ? P | ExtractParams<Rest> :
  T extends `${string}:${infer P}` ? P : never;

type TranslationKey = `${string}.${string}`;

type Table = "users" | "products";
type Column<T extends Table> = T extends "users" ? "id" | "name" | "email" : T extends "products" ? "id" | "name" | "price" : never;
type QualifiedColumn<T extends Table> = `${T}.${Column<T>}`;

type JsonPath<T, Prefix extends string = ""> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? `${Prefix}${K}` | JsonPath<T[K], `${Prefix}${K}.`> : `${Prefix}${K}` }[keyof T & string]
  : never;
