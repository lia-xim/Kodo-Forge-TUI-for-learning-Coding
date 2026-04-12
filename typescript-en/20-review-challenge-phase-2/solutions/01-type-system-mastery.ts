/**
 * L20 - Loesung 01: Type System Mastery
 */
type FormErrors<T> = { [K in keyof T]?: string };
type FormTouched<T> = { [K in keyof T]: boolean };
type FormDirty<T> = { [K in keyof T]: boolean };
interface FormState<T> { values: T; errors: FormErrors<T>; touched: FormTouched<T>; dirty: FormDirty<T>; isValid: boolean; }

type Methods<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] };
type Data<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };

type EventMap<T> = { [K in keyof T & string as `${K}Changed`]: { prev: T[K]; next: T[K] } };

type PathValue<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}` ? K extends keyof T ? PathValue<T[K], Rest> : never :
  Path extends keyof T ? T[Path] : never;

type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? T[K] extends Function ? T[K] : DeepReadonly<T[K]> : T[K] };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? T[K] extends Function ? T[K] : DeepPartial<T[K]> : T[K] };
type DeepNullable<T> = { [K in keyof T]: T[K] extends object ? T[K] extends Function ? T[K] : DeepNullable<T[K]> | null : T[K] | null };
