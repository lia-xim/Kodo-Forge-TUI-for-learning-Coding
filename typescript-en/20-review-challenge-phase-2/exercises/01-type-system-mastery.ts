/**
 * L20 - Exercise 01: Type System Mastery (L16-L18 kombiniert)
 */

// AUFGABE 1: Erstelle FormState<T> mit Mapped Types
// FormErrors<T>, FormTouched<T>, FormDirty<T> — und eine initFormState-Funktion

// AUFGABE 2: Erstelle Methods<T> und Data<T> mit Conditional + Mapped Types
// Methods extrahiert nur Function-Properties, Data nur Nicht-Function-Properties

// AUFGABE 3: Erstelle EventEmitter<Events> mit Template Literal Types
// on<K>(`${K}Changed`, handler) und emit<K>(`${K}Changed`, data) typsicher

// AUFGABE 4: Erstelle PathValue<T, Path> mit Template Literal + infer
// PathValue<{ a: { b: { c: string } } }, "a.b.c"> = string

// AUFGABE 5: Erstelle DeepReadonly<T> + DeepPartial<T> + DeepNullable<T>
// Alle rekursiv, mit Function-Guard
