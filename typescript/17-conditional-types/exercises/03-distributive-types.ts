/**
 * Lektion 17 - Exercise 03: Distributive Types
 */

// AUFGABE 1: ToArray<T> — distributiv (string | number -> string[] | number[])
// type ToArray<T> = ...

// AUFGABE 2: ToArrayNonDist<T> — nicht-distributiv (string | number -> (string | number)[])
// Tipp: [T] extends [any] ? ...

// AUFGABE 3: OnlyStrings<T> — extrahiere nur string-Member aus einem Union
// OnlyStrings<string | number | boolean> = string
// Tipp: Distributiver Conditional

// AUFGABE 4: IsNever<T> — pruefe ob T never ist
// IsNever<never> = true, IsNever<string> = false
// Tipp: [T] extends [never] ? ...

// AUFGABE 5: IsUnion<T> — pruefe ob T ein Union ist
// IsUnion<string> = false, IsUnion<string | number> = true
// Tipp: Vergleiche distributiv vs nicht-distributiv:
// [T] extends [T] ist immer true, aber T extends T verteilt bei Unions
