/**
 * Lektion 17 - Loesung 05
 */
type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] };
type Data<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? R extends Promise<any>
      ? T[K]
      : (...args: A) => Promise<R>
    : T[K];
};

type PathValue<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
