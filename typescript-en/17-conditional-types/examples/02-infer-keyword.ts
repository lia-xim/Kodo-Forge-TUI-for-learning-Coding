/**
 * Lektion 17 - Beispiel 02: Infer-Keyword
 * Ausfuehren mit: npx tsx examples/02-infer-keyword.ts
 */

// ─── Promise unwrappen ────────────────────────────────────────────────────

type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnpackPromise<Promise<string>>;  // string
type B = UnpackPromise<Promise<number>>;  // number
type C = UnpackPromise<string>;           // string

// ─── ReturnType nachbauen ─────────────────────────────────────────────────

type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = MyReturnType<() => string>;           // string
type R2 = MyReturnType<(x: number) => boolean>; // boolean

// ─── Parameter extrahieren ────────────────────────────────────────────────

type FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;

type P1 = FirstParam<(name: string, age: number) => void>;  // string
type P2 = FirstParam<() => void>;                            // never

// ─── Array-Element extrahieren ────────────────────────────────────────────

type ElementType<T> = T extends (infer U)[] ? U : T;

type E1 = ElementType<string[]>;   // string
type E2 = ElementType<number[][]>; // number[]

// ─── Mehrere infer ────────────────────────────────────────────────────────

type FunctionParts<T> = T extends (a: infer A, b: infer B) => infer R
  ? { firstParam: A; secondParam: B; returnType: R }
  : never;

type Parts = FunctionParts<(name: string, age: number) => boolean>;
// { firstParam: string; secondParam: number; returnType: boolean; }

console.log("Infer Examples loaded. Check types in your editor!");
