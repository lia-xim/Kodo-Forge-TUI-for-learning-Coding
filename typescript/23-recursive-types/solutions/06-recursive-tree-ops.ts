/**
 * Solution 06: Rekursive Baum-Operationen
 */

type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// Loesung 1: treeMap
function treeMap<T, U>(node: TreeNode<T>, fn: (value: T) => U): TreeNode<U> {
  return {
    value: fn(node.value),
    children: node.children.map((child) => treeMap(child, fn)),
  };
}

// Loesung 2: treeFilter
function treeFilter<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): TreeNode<T> | null {
  if (!predicate(node.value)) return null;

  return {
    value: node.value,
    children: node.children
      .map((child) => treeFilter(child, predicate))
      .filter((child): child is TreeNode<T> => child !== null),
  };
}

// Loesung 3: treeFind (Tiefensuche)
function treeFind<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): T | undefined {
  if (predicate(node.value)) return node.value;

  for (const child of node.children) {
    const found = treeFind(child, predicate);
    if (found !== undefined) return found;
  }

  return undefined;
}

// Loesung 4: treeReduce
function treeReduce<T, U>(
  node: TreeNode<T>,
  fn: (acc: U, value: T) => U,
  initial: U
): U {
  let acc = fn(initial, node.value);
  for (const child of node.children) {
    acc = treeReduce(child, fn, acc);
  }
  return acc;
}

// Loesung 5: treeDepth
function treeDepth<T>(node: TreeNode<T>): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(treeDepth));
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

const doubled = treeMap(numberTree, (x) => x * 2);
console.log("Map (double) root:", doubled.value); // 2

const evens = treeFilter(numberTree, (x) => x % 2 === 0);
console.log("Filter (even):", JSON.stringify(evens));

const found = treeFind(numberTree, (x) => x > 5);
console.log("Find (>5):", found); // 6

const sum = treeReduce(numberTree, (acc, val) => acc + val, 0);
console.log("Reduce (sum):", sum); // 36

const depth = treeDepth(numberTree);
console.log("Depth:", depth); // 4
