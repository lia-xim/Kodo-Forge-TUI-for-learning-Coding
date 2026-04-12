/**
 * Lektion 17 - Loesung 02
 */
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;
type ElementType<T> = T extends (infer U)[] ? U : T;
type ConstructorReturn<T> = T extends new (...args: any[]) => infer R ? R : never;
type LastParam<T> = T extends (...args: [...infer _, infer L]) => any ? L : never;
