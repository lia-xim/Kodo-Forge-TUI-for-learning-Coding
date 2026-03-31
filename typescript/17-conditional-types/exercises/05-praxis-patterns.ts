/**
 * Lektion 17 - Exercise 05: Praxis-Patterns
 */

// AUFGABE 1: Methods<T> und Data<T>
// Methods extrahiert nur Function-Properties
// Data extrahiert nur Nicht-Function-Properties

interface UserService {
  name: string;
  email: string;
  save(): Promise<void>;
  validate(): boolean;
}

// AUFGABE 2: UnwrapArray<T> — macht aus T[] -> T, aus T -> T
// Einmal entpacken, nicht rekursiv

// AUFGABE 3: Promisify<T> — wandelt jede Methode in eine async-Version
// { save(): void } -> { save(): Promise<void> }
// Nur Funktionen umwandeln, Daten-Properties bleiben

// AUFGABE 4: PathValue<T, Path> — extrahiert den Typ eines verschachtelten Pfads
// PathValue<{ a: { b: { c: string } } }, "a.b.c"> = string
// Tipp: Path extends `${infer K}.${infer Rest}` ? ... : ...

// AUFGABE 5: StrictOmit<T, K> — wie Omit aber K MUSS in keyof T sein
// StrictOmit<User, "nonexistent"> = Error
// type StrictOmit<T, K extends keyof T> = ...
