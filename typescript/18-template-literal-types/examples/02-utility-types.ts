/**
 * Lektion 18 - Beispiel 02: String Utility Types
 */

type A = Uppercase<"hello">;     // "HELLO"
type B = Lowercase<"HELLO">;     // "hello"
type C = Capitalize<"hello">;    // "Hello"
type D = Uncapitalize<"Hello">;  // "hello"

type Props = "name" | "email" | "age";
type GetterNames = `get${Capitalize<Props>}`;
type SetterNames = `set${Capitalize<Props>}`;
type EventNames = `on${Capitalize<Props>}Change`;

console.log("String Utility Types loaded.");
