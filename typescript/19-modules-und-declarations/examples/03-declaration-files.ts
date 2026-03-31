/**
 * Lektion 19 - Beispiel 03: Declaration Files
 */

// declare sagt TypeScript: "Dieser Wert existiert woanders"
declare const API_URL: string;
declare const __DEV__: boolean;
declare function gtag(...args: unknown[]): void;

// In einem .d.ts File wuerde das so aussehen:
// declare module 'my-untyped-lib' {
//   export function doSomething(input: string): Promise<unknown>;
//   export interface Config { timeout: number; }
// }

console.log("Declaration Files Beispiel geladen.");
