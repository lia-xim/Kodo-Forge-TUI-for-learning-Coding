/**
 * Lektion 19 - Loesung 01: ES Modules
 */
export function add(a: number, b: number): number { return a + b; }
export function subtract(a: number, b: number): number { return a - b; }
export function multiply(a: number, b: number): number { return a * b; }
export function divide(a: number, b: number): number { if (b === 0) throw new Error("Division by zero"); return a / b; }

export interface MathOperation { operand1: number; operand2: number; operator: '+' | '-' | '*' | '/'; result: number; }
export type { MathOperation as MathOp };
