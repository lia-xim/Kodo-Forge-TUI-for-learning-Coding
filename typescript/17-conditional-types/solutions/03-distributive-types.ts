/**
 * Lektion 17 - Loesung 03
 */
type ToArray<T> = T extends any ? T[] : never;
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type OnlyStrings<T> = T extends string ? T : never;
type IsNever<T> = [T] extends [never] ? true : false;
type IsUnion<T, U = T> = T extends U ? ([U] extends [T] ? false : true) : never;
