/**
 * Lektion 14 — Pre-Test-Fragen: Generic Patterns
 *
 * 3 Fragen pro Sektion (5 Sektionen = 15 Fragen).
 * correct-Index-Verteilung: 4×0, 4×1, 4×2, 3×3
 */

export interface PretestQuestion {
  sectionIndex: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  briefExplanation: string;
}

export const pretestQuestions: PretestQuestion[] = [
  // ═══ Sektion 1: Generic Factories ═════════════════════════════════════════

  // Q1 → correct:0 (Richtige nach vorne)
  { sectionIndex: 1, question: "What does `new () => T` describe in TypeScript?", options: ["A Constructor Signature — something that creates an instance of T with new", "A regular function", "An interface", "I don't know"], correct: 0, briefExplanation: "Constructor Signatures describe classes/constructors that are called with new." },

  // Q2 → correct:1 (unveraendert)
  { sectionIndex: 1, question: "How does the Builder Pattern track the type at each step?", options: ["Through arrays", "Through Intersection Types: T & Record<K, V> per step", "Through inheritance", "I don't know"], correct: 1, briefExplanation: "Each set() call extends T through an intersection with the new field." },

  // Q3 → correct:2
  { sectionIndex: 1, question: "What is a Partial Factory Pattern?", options: ["An incomplete factory", "An abstract factory", "A factory that has defaults and the caller only specifies changes", "I don't know"], correct: 2, briefExplanation: "createWithDefaults(defaults)(overrides) — the caller only specifies the overrides." },

  // ═══ Sektion 2: Generic Collections ═══════════════════════════════════════

  // Q4 → correct:3
  { sectionIndex: 2, question: "Why does Stack<T>.pop() return the type T | undefined?", options: ["Because T is always optional", "Because pop always returns undefined", "Because T requires a default", "Because an empty stack has no element to return"], correct: 3, briefExplanation: "Empty stack = nothing there. undefined is the honest answer." },

  // Q5 → correct:0
  { sectionIndex: 2, question: "What is the difference between Stack and Queue?", options: ["Stack = LIFO (last in, first out), Queue = FIFO (first in, first out)", "No difference", "Stack for numbers, Queue for strings", "I don't know"], correct: 0, briefExplanation: "LIFO vs FIFO: Stack takes the last element first, Queue takes the first." },

  // Q6 → correct:1
  { sectionIndex: 2, question: "Why does IndexedCollection<T> have the constraint T extends { id: ... }?", options: ["Performance", "So that every element has an id — for map-based lookup", "Because TypeScript requires it", "I don't know"], correct: 1, briefExplanation: "The constraint guarantees that every element has an id property." },

  // ═══ Sektion 3: Generic HOFs ══════════════════════════════════════════════

  // Q7 → correct:2
  { sectionIndex: 3, question: "Why does pipe() need overloads?", options: ["Because pipe only works with 2 functions", "Because overloads are faster", "Because each step has a different type and rest parameters cannot express that", "I don't know"], correct: 2, briefExplanation: "Each step has different types. Overloads define the transitions explicitly." },

  // Q8 → correct:3
  { sectionIndex: 3, question: "What is the difference between pipe and compose?", options: ["No difference", "pipe is for arrays, compose for strings", "compose is deprecated", "pipe executes immediately (left to right), compose returns a function (right to left)"], correct: 3, briefExplanation: "pipe(v, f, g) = g(f(v)). compose(g, f) = (x) => g(f(x))." },

  // Q9 → correct:0
  { sectionIndex: 3, question: "What does curry((a, b) => a + b) do?", options: ["Creates a nested function: (a) => (b) => a + b", "Executes a + b", "Returns NaN", "I don't know"], correct: 0, briefExplanation: "Currying transforms f(a, b) into f(a)(b) — partial application becomes possible." },

  // ═══ Sektion 4: Advanced Constraints ═══════════════════════════════════════

  // Q10 → correct:1
  { sectionIndex: 4, question: "What does a Conditional Type `T extends string ? X : Y` do?", options: ["Runtime check", "Compile-time decision: if T is a subtype of string, X is chosen, otherwise Y", "Converts T", "I don't know"], correct: 1, briefExplanation: "Conditional Types choose based on the extends relationship at compile time." },

  // Q11 → correct:2
  { sectionIndex: 4, question: "What is a recursive type like TreeNode<T>?", options: ["An error", "An array type", "A type that references itself — for tree-like structures", "I don't know"], correct: 2, briefExplanation: "TreeNode<T> has children: TreeNode<T>[] — self-reference for trees." },

  // Q12 → correct:3
  { sectionIndex: 4, question: "What does `<const T>` (TS 5.0) do?", options: ["T becomes readonly", "T becomes a constant", "T gets a default", "TypeScript infers the most precise literal type without as const"], correct: 3, briefExplanation: "const Type Parameters enforce literal inference at the call site." },

  // ═══ Sektion 5: Real-World Generics ════════════════════════════════════════

  // Q13 → correct:0
  { sectionIndex: 5, question: "Why does Repository<T>.create() use the type Omit<T, 'id'>?", options: ["Because the id is generated by the repository — the caller should not set it", "Because id is optional", "Because Omit is a required type", "I don't know"], correct: 0, briefExplanation: "Omit<T, 'id'> removes id entirely — the repository generates it internally." },

  // Q14 → correct:1
  { sectionIndex: 5, question: "How does the TypedEventEmitter link event name and payload?", options: ["Through strings", "Through an interface that maps event names to payload types", "Through runtime checks", "I don't know"], correct: 1, briefExplanation: "The Events interface maps names to types. K extends keyof Events links them." },

  // Q15 → correct:2
  { sectionIndex: 5, question: "What is a Phantom Type for Token<T> in the DI Container?", options: ["An invisible type", "An error", "A type parameter that only exists at compile time and carries the service type", "I don't know"], correct: 2, briefExplanation: "Token<T> carries T as type information. At runtime, only the name string is present." },
];