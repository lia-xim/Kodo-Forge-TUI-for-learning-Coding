/**
 * L20 - Loesung 04: Type Puzzles
 */
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type TupleToObject<T extends readonly string[]> = { [K in T[number]]: unknown };
type TO = TupleToObject<["name", "age"]>; // { name: unknown; age: unknown; }

export type { IsEqual, UnionToIntersection, TupleToObject };
