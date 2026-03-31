/**
 * Lektion 06 - Solution 02: Overloads und Callbacks
 *
 * Ausfuehren mit: npx tsx solutions/02-overloads-und-callbacks.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfacher Overload
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Zwei Overload-Signaturen fuer string und number[].
// Die Implementation muss beide Faelle handlen.
// Fuer Strings: Split → Reverse → Join.
// Fuer Arrays: Kopie erstellen und umdrehen.
function reverse(value: string): string;
function reverse(value: number[]): number[];
function reverse(value: string | number[]): string | number[] {
  if (typeof value === "string") {
    return [...value].reverse().join("");
  }
  return [...value].reverse();
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Overload mit verschiedener Parameter-Anzahl
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Erster Overload nimmt einen ISO-String,
// zweiter Overload nimmt Jahr, Monat, Tag.
// Die Implementation prueft anhand der Parameter-Typen.
function createDate(isoString: string): Date;
function createDate(year: number, month: number, day: number): Date;
function createDate(
  yearOrIso: string | number,
  month?: number,
  day?: number,
): Date {
  if (typeof yearOrIso === "string") {
    return new Date(yearOrIso);
  }
  // month - 1 weil JavaScript-Monate 0-basiert sind
  return new Date(yearOrIso, month! - 1, day!);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Callback-Typ definieren
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Generischer Transformer-Typ.
// applyAll wendet alle Transformer nacheinander an (reduce).
type Transformer<T> = (value: T) => T;

function applyAll<T>(value: T, transformers: Transformer<T>[]): T {
  return transformers.reduce((current, fn) => fn(current), value);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: void-Callback verstehen
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Einfache Schleife, die den Callback fuer jedes Element aufruft.
// Der Callback ist als void typisiert — darf aber Werte zurueckgeben.
function forEach<T>(items: T[], callback: (item: T, index: number) => void): void {
  for (let i = 0; i < items.length; i++) {
    callback(items[i], i);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Event-System mit Callbacks
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Map von Event-Namen zu Listener-Arrays.
// on() fuegt hinzu und gibt eine Unsubscribe-Funktion zurueck.
// emit() ruft alle Listener fuer ein Event auf.
type Listener = (data: unknown) => void;
type Unsubscribe = () => void;

interface EventSystem {
  on(event: string, listener: Listener): Unsubscribe;
  emit(event: string, data: unknown): void;
}

function createEventSystem(): EventSystem {
  const listeners = new Map<string, Listener[]>();

  return {
    on(event, listener) {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(listener);

      // Unsubscribe-Funktion: Entfernt diesen Listener
      return () => {
        const eventListeners = listeners.get(event);
        if (eventListeners) {
          const index = eventListeners.indexOf(listener);
          if (index !== -1) {
            eventListeners.splice(index, 1);
          }
        }
      };
    },

    emit(event, data) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        for (const listener of eventListeners) {
          listener(data);
        }
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Comparator und sortBy
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Spread-Operator erstellt eine Kopie, dann sort() auf der Kopie.
// Das Original bleibt unveraendert.
type Comparator<T> = (a: T, b: T) => number;

function sortBy<T>(items: T[], compare: Comparator<T>): T[] {
  return [...items].sort(compare);
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Aufgabe 1
console.assert(reverse("hallo") === "ollah", "A1: reverse string");
console.assert(JSON.stringify(reverse([1, 2, 3])) === "[3,2,1]", "A1: reverse array");

// Aufgabe 2
const d1 = createDate("2024-03-15");
console.assert(d1 instanceof Date, "A2: createDate string");
const d2 = createDate(2024, 3, 15);
console.assert(d2.getFullYear() === 2024, "A2: createDate numbers year");
console.assert(d2.getMonth() === 2, "A2: createDate numbers month (0-basiert)");
console.assert(d2.getDate() === 15, "A2: createDate numbers day");

// Aufgabe 3
const result = applyAll("hallo", [
  s => s.toUpperCase(),
  s => s + "!",
  s => s + s,
]);
console.assert(result === "HALLO!HALLO!", "A3: applyAll");

// Aufgabe 4
const collected: string[] = [];
forEach(["a", "b", "c"], (item, index) => {
  collected.push(`${index}:${item}`);
});
console.assert(JSON.stringify(collected) === '["0:a","1:b","2:c"]', "A4: forEach");

// Aufgabe 5
const events = createEventSystem();
let received = "";
const unsub = events.on("greet", (data: unknown) => { received = String(data); });
events.emit("greet", "hallo");
console.assert(received === "hallo", "A5: event received");
unsub();
events.emit("greet", "nochmal");
console.assert(received === "hallo", "A5: event after unsub");

// Aufgabe 6
const original = [3, 1, 2];
const sorted = sortBy(original, (a, b) => a - b);
console.assert(JSON.stringify(sorted) === "[1,2,3]", "A6: sortBy aufsteigend");
console.assert(JSON.stringify(original) === "[3,1,2]", "A6: original unveraendert");

console.log("Alle Tests bestanden!");
