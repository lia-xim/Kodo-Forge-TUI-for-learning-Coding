/**
 * Lektion 19 - Beispiel 01: ES Modules
 */

// Named Exports
export function add(a: number, b: number): number { return a + b; }
export const PI = 3.14159;
export interface MathResult { value: number; operation: string; }

// Type-Only Export
export type { MathResult as MathOutput };

console.log("ES Module Beispiel geladen. add(2,3) =", add(2, 3));
