/**
 * L20 - Beispiel 02: Generics Review (L13-L15)
 */
function pipe<A, B>(v: A, f1: (a: A) => B): B;
function pipe<A, B, C>(v: A, f1: (a: A) => B, f2: (b: B) => C): C;
function pipe(v: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), v);
}

const result = pipe("hello", s => s.length, n => n > 3);
console.log("Pipe result:", result); // true
