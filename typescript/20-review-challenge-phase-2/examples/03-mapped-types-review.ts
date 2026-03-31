/**
 * L20 - Beispiel 03: Mapped Types Review (L16)
 */
type FormErrors<T> = { [K in keyof T]?: string };
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

interface User { name: string; age: number; }
type UE = FormErrors<User>;   // { name?: string; age?: string; }
type UG = Getters<User>;      // { getName: () => string; getAge: () => number; }

console.log("Mapped Types Review loaded.");
