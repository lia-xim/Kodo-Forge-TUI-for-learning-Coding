/**
 * Lektion 19 — Parson's Problems: Modules & Declarations
 */
import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  { id: "L19-P1", title: "Global Augmentation fuer ProcessEnv", description: "Ordne die Zeilen zu einer korrekten ProcessEnv-Erweiterung.", correctOrder: ["declare global {", "  namespace NodeJS {", "    interface ProcessEnv {", "      NODE_ENV: 'development' | 'production';", "      DATABASE_URL: string;", "    }", "  }", "}", "", "export {};"], distractors: ["module.exports = {};", "declare namespace global {"], hint: "declare global (nicht declare namespace global). export {} am Ende fuer Modul-Status.", concept: "global-augmentation", difficulty: 2 },
  { id: "L19-P2", title: "Module Declaration fuer externe Library", description: "Ordne die Zeilen zu einer korrekten Modul-Deklaration.", correctOrder: ["declare module 'my-cache' {", "  export function get<T>(key: string): T | undefined;", "  export function set<T>(key: string, value: T): void;", "  export function clear(): void;", "}"], distractors: ["import { Cache } from 'my-cache';", "module.exports = { get, set, clear };"], hint: "declare module fuer externe Deklaration. Generics erlaubt. Keine Implementierung.", concept: "declare-module", difficulty: 2 },
  { id: "L19-P3", title: "Barrel File mit Type-Only Re-Exports", description: "Ordne die Zeilen zu einer korrekten Barrel-Datei.", correctOrder: ["export { UserService } from './user-service';", "export { ProductService } from './product-service';", "export type { User } from './types';", "export type { Product } from './types';"], distractors: ["import { UserService } from './user-service';", "export default UserService;"], hint: "Re-Exports mit export { } from '...'. Type-Only Re-Exports mit export type { }. Kein Default-Export im Barrel.", concept: "barrel-file", difficulty: 1 },
];
