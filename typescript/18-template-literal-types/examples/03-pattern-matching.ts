/**
 * Lektion 18 - Beispiel 03: Pattern Matching mit Strings
 */

type ExtractPrefix<T extends string> = T extends `${infer P}_${string}` ? P : never;
type A = ExtractPrefix<"user_name">;  // "user"

type Split<S extends string, D extends string> = S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S];
type B = Split<"a.b.c", ".">;  // ["a", "b", "c"]

type Replace<S extends string, From extends string, To extends string> = S extends `${infer H}${From}${infer T}` ? `${H}${To}${T}` : S;
type C = Replace<"hello world", "world", "TS">;  // "hello TS"

type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;
type D = TrimLeft<"   hello">;  // "hello"

console.log("Pattern Matching loaded.");
