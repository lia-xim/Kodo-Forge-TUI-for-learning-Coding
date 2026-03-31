/**
 * Lektion 17 - Exercise 02: Infer-Keyword
 */

// AUFGABE 1: UnpackPromise<T> — extrahiert den Typ aus einem Promise
// UnpackPromise<Promise<string>> = string
// UnpackPromise<number> = number

// AUFGABE 2: MyReturnType<T> — extrahiert den Rueckgabetyp einer Funktion

// AUFGABE 3: FirstParam<T> — extrahiert den ersten Parameter einer Funktion
// FirstParam<(a: string, b: number) => void> = string

// AUFGABE 4: ElementType<T> — extrahiert den Element-Typ aus einem Array
// ElementType<string[]> = string

// AUFGABE 5: ConstructorReturn<T> — extrahiert den Instanz-Typ aus einem Konstruktor
// ConstructorReturn<typeof MyClass> = MyClass
// Tipp: T extends new (...args: any[]) => infer R ? R : never

// AUFGABE 6: LastParam<T> — extrahiert den LETZTEN Parameter
// LastParam<(a: string, b: number, c: boolean) => void> = boolean
// Tipp: T extends (...args: [...infer _, infer L]) => any ? L : never
