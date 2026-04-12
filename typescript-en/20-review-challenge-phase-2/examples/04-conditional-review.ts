/**
 * L20 - Beispiel 04: Conditional Types Review (L17)
 */
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type A = Flatten<string[][]>;                    // string
type B = UnpackPromise<Promise<Promise<number>>>; // Promise<number> (eine Ebene)

type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
type C = DeepAwaited<Promise<Promise<number>>>;  // number

console.log("Conditional Types Review loaded.");
