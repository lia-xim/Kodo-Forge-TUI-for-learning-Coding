/**
 * Lektion 18 - Loesung 03
 */
type ExtractDomain<T extends string> = T extends `${string}@${infer D}` ? D : never;
type Split<S extends string, D extends string> = S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
type ReplaceAll<S extends string, From extends string, To extends string> = S extends `${infer H}${From}${infer T}` ? ReplaceAll<`${H}${To}${T}`, From, To> : S;
type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;
type TrimRight<S extends string> = S extends `${infer R} ` ? TrimRight<R> : S;
type PathSegments<T extends string> = T extends `/${infer Rest}` ? Split<Rest, "/"> : Split<T, "/">;
