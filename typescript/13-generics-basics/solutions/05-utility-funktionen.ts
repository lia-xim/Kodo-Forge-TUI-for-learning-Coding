/**
 * Lektion 13 - Loesung 05: Eigene generische Utility-Funktionen
 */

// ═══ AUFGABE 1: groupBy ════════════════════════════════════════════════════

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

const users = [
  { name: "Max", role: "admin" },
  { name: "Anna", role: "user" },
  { name: "Bob", role: "admin" },
];
const byRole = groupBy(users, u => u.role);
console.log("admin:", byRole.admin);
console.log("user:", byRole.user);

// ═══ AUFGABE 2: chunk ══════════════════════════════════════════════════════

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

console.log(chunk([1, 2, 3, 4, 5], 2)); // [[1,2], [3,4], [5]]
console.log(chunk(["a", "b", "c"], 2)); // [["a","b"], ["c"]]

// ═══ AUFGABE 3: uniqueBy ═══════════════════════════════════════════════════

function uniqueBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const itemList = [
  { id: 1, name: "Max" },
  { id: 2, name: "Anna" },
  { id: 1, name: "Max (Duplikat)" },
];
const unique = uniqueBy(itemList, item => item.id);
console.log(unique); // [{ id: 1, name: "Max" }, { id: 2, name: "Anna" }]

// ═══ AUFGABE 4: mapValues ══════════════════════════════════════════════════

function mapValues<T, U>(
  obj: Record<string, T>,
  fn: (value: T) => U
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const key of Object.keys(obj)) {
    result[key] = fn(obj[key]);
  }
  return result;
}

const prices = { laptop: 999, mouse: 29, keyboard: 79 };
const withTax = mapValues(prices, p => +(p * 1.19).toFixed(2));
console.log(withTax); // { laptop: 1188.81, mouse: 34.51, keyboard: 94.01 }

// ═══ AUFGABE 5: createStateMachine ═════════════════════════════════════════

function createStateMachine<TState extends string>(
  initialState: TState,
  transitions: Record<TState, TState[]>
): { getState(): TState; transition(to: TState): boolean } {
  let currentState = initialState;
  return {
    getState: () => currentState,
    transition(to: TState): boolean {
      const allowed = transitions[currentState];
      if (allowed.includes(to)) {
        currentState = to;
        return true;
      }
      return false;
    },
  };
}

type TrafficLight = "red" | "yellow" | "green";
const light = createStateMachine<TrafficLight>("red", {
  red: ["green"],
  green: ["yellow"],
  yellow: ["red"],
});

console.log(light.getState());          // "red"
console.log(light.transition("green")); // true
console.log(light.getState());          // "green"
console.log(light.transition("red"));   // false (nicht erlaubt!)
console.log(light.getState());          // "green" (unveraendert)
