/**
 * Exercise 06: Rekursive Baum-Operationen
 *
 * Implementiere diverse Operationen auf rekursiven Baumstrukturen.
 *
 * Ausfuehren: npx tsx exercises/06-recursive-tree-ops.ts
 * Hints: Siehe hints.json "exercises/06-recursive-tree-ops.ts"
 */

// Baum-Typ
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// TODO 1: Schreibe eine map-Funktion fuer Baeume
// Transformiert jeden Wert im Baum (wie Array.map, aber rekursiv)
function treeMap<T, U>(node: TreeNode<T>, fn: (value: T) => U): TreeNode<U> {
  // TODO: Implementiere
  return undefined as unknown as TreeNode<U>;
}

// TODO 2: Schreibe eine filter-Funktion fuer Baeume
// Entfernt Knoten die den Test nicht bestehen (und deren Kinder!)
function treeFilter<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): TreeNode<T> | null {
  // TODO: Implementiere
  return null;
}

// TODO 3: Schreibe eine find-Funktion fuer Baeume
// Findet den ersten Knoten der den Test besteht (Tiefensuche)
function treeFind<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): T | undefined {
  // TODO: Implementiere
  return undefined;
}

// TODO 4: Schreibe eine reduce-Funktion fuer Baeume
// Reduziert den Baum auf einen einzelnen Wert
function treeReduce<T, U>(
  node: TreeNode<T>,
  fn: (acc: U, value: T) => U,
  initial: U
): U {
  // TODO: Implementiere
  return initial;
}

// TODO 5: Schreibe eine depth-Funktion
// Berechnet die maximale Tiefe des Baums
function treeDepth<T>(node: TreeNode<T>): number {
  // TODO: Implementiere
  return 0;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const numberTree: TreeNode<number> = {
  value: 1,
  children: [
    {
      value: 2,
      children: [
        { value: 4, children: [] },
        { value: 5, children: [] },
      ],
    },
    {
      value: 3,
      children: [
        { value: 6, children: [] },
        {
          value: 7,
          children: [
            { value: 8, children: [] },
          ],
        },
      ],
    },
  ],
};

console.log("=== Tree Operations Tests ===");

// treeMap: Jeden Wert verdoppeln
const doubled = treeMap(numberTree, (x) => x * 2);
console.log("Map (double):", JSON.stringify(doubled));
// Root sollte 2 sein, Kinder 4 und 6, etc.

// treeFilter: Nur gerade Zahlen behalten
const evens = treeFilter(numberTree, (x) => x % 2 === 0);
console.log("Filter (even):", JSON.stringify(evens));

// treeFind: Erste Zahl > 5 finden
const found = treeFind(numberTree, (x) => x > 5);
console.log("Find (>5):", found);
// Erwartet: 6 (erste in Tiefensuche)

// treeReduce: Summe aller Werte
const sum = treeReduce(numberTree, (acc, val) => acc + val, 0);
console.log("Reduce (sum):", sum);
// Erwartet: 1+2+3+4+5+6+7+8 = 36

// treeDepth:
const depth = treeDepth(numberTree);
console.log("Depth:", depth);
// Erwartet: 4 (root → 3 → 7 → 8)
