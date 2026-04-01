/**
 * Example 01: LinkedList und Tree — Grundlegende rekursive Typen
 *
 * Ausfuehren: npx tsx examples/01-linked-list-tree.ts
 */

// ─── LinkedList ──────────────────────────────────────────────────────────────

type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

// Eine Liste erstellen: 1 → 2 → 3 → null
const numbers: LinkedList<number> = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: null,
    },
  },
};

// Traversierung: Alle Werte sammeln
function toArray<T>(list: LinkedList<T>): T[] {
  const result: T[] = [];
  let current: LinkedList<T> | null = list;
  while (current !== null) {
    result.push(current.value);
    current = current.next;
  }
  return result;
}

console.log("LinkedList:", toArray(numbers));
// → [1, 2, 3]

// ─── Binaerer Suchbaum ──────────────────────────────────────────────────────

type BST<T> = {
  value: T;
  left: BST<T> | null;
  right: BST<T> | null;
};

const tree: BST<number> = {
  value: 5,
  left: {
    value: 3,
    left: { value: 1, left: null, right: null },
    right: { value: 4, left: null, right: null },
  },
  right: {
    value: 7,
    left: { value: 6, left: null, right: null },
    right: { value: 9, left: null, right: null },
  },
};

// In-Order Traversierung (sortiert!)
function inOrder<T>(node: BST<T> | null): T[] {
  if (node === null) return [];
  return [...inOrder(node.left), node.value, ...inOrder(node.right)];
}

console.log("BST in-order:", inOrder(tree));
// → [1, 3, 4, 5, 6, 7, 9]

// ─── Allgemeiner Baum ────────────────────────────────────────────────────────

type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

const fileTree: TreeNode<string> = {
  value: "src",
  children: [
    {
      value: "components",
      children: [
        { value: "Button.tsx", children: [] },
        { value: "Modal.tsx", children: [] },
      ],
    },
    {
      value: "utils",
      children: [{ value: "format.ts", children: [] }],
    },
  ],
};

// Alle Blaetter sammeln
function getLeaves<T>(node: TreeNode<T>): T[] {
  if (node.children.length === 0) return [node.value];
  return node.children.flatMap(getLeaves);
}

console.log("Blaetter:", getLeaves(fileTree));
// → ["Button.tsx", "Modal.tsx", "format.ts"]
