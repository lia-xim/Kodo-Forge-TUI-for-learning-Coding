/**
 * Lektion 17 - Loesung 04
 */
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
type DeepReadonly<T> = T extends object ? T extends Function ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
type TupleToUnion<T> = T extends (infer U)[] ? U : never;
type Reverse<T extends any[]> = T extends [infer F, ...infer R] ? [...Reverse<R>, F] : [];
