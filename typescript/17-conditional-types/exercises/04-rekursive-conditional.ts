/**
 * Lektion 17 - Exercise 04: Rekursive Conditional Types
 */

// AUFGABE 1: Flatten<T> — entpackt Arrays beliebiger Tiefe
// Flatten<string[][]> = string, Flatten<number> = number

// AUFGABE 2: DeepAwaited<T> — entpackt verschachtelte Promises
// DeepAwaited<Promise<Promise<string>>> = string

// AUFGABE 3: DeepReadonly<T> — macht alle Ebenen readonly
// Verwende Conditional + Mapped Type

// AUFGABE 4: TupleToUnion<T> — wandelt ein Tuple in einen Union
// TupleToUnion<[string, number, boolean]> = string | number | boolean
// Tipp: T extends (infer U)[] ? U : never

// AUFGABE 5: Reverse<T> — kehrt ein Tuple um
// Reverse<[1, 2, 3]> = [3, 2, 1]
// Tipp: T extends [infer F, ...infer R] ? [...Reverse<R>, F] : []
