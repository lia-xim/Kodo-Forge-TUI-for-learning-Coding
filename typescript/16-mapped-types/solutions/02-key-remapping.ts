/**
 * Lektion 16 - Loesung 02: Key Remapping
 */

// AUFGABE 1
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// AUFGABE 2
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// AUFGABE 3
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// AUFGABE 4
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
};

// AUFGABE 5
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    newValue: T[K],
    oldValue: T[K]
  ) => void;
};

// Tests:
interface Person { name: string; age: number; }
type PG = Getters<Person>;   // { getName: () => string; getAge: () => number; }
type PS = Setters<Person>;   // { setName: (value: string) => void; setAge: (value: number) => void; }

interface Settings { theme: string; fontSize: number; }
type SE = EventHandlers<Settings>;
// { onThemeChange: (...) => void; onFontSizeChange: (...) => void; }

console.log("Key Remapping Solutions compiled successfully.");
