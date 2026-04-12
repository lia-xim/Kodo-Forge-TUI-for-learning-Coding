/**
 * Lektion 19 - Loesung 03: Declaration Files
 */

// AUFGABE 1: simple-cache Declaration
// In einer Datei simple-cache.d.ts:
// declare module 'simple-cache' {
//   export function get<T>(key: string): T | undefined;
//   export function set<T>(key: string, value: T, ttl?: number): void;
//   export function clear(): void;
// }

// AUFGABE 2: Globale Variablen
declare const API_URL: string;
declare const __DEV__: boolean;

// AUFGABE 3: Default-Export Declaration
// declare module 'my-lib' {
//   interface Config { debug?: boolean; timeout?: number; }
//   export default function init(config: Config): void;
// }

// AUFGABE 4: npm install @types/library-name

// AUFGABE 5: CSS Modules
// declare module '*.module.css' {
//   const classes: Record<string, string>;
//   export default classes;
// }

export {};
