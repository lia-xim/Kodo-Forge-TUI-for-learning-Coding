/**
 * Lektion 17 - Loesung 01
 */
type IsNumber<T> = T extends number ? true : false;
type TypeName<T> = T extends string ? "string" : T extends number ? "number" : T extends boolean ? "boolean" : "other";
type IsArray<T> = T extends any[] ? true : false;
type MyNonNullable<T> = T extends null | undefined ? never : T;
type If<C extends boolean, T, F> = C extends true ? T : F;
